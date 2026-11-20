/* استودیو جباری — موتور ایزومتریک canvas و فرم‌های پایه
   این فایل بخشی از سایت است؛ ترتیب بارگذاری در index.html مهم است: content → engine → scenes → main */

/* ============ ابزارها ============ */
const $ = s => document.querySelector(s);
const fa = s => String(s).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
const clamp = (v,a=0,b=1) => Math.min(b, Math.max(a, v));
const mod = (a,n) => ((a%n)+n)%n;
const ease = t => t<.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(1.75, window.devicePixelRatio||1);

/* =====================================================================
   موتور ایزومتریک
   - لایه‌ی ثابت (ساختمان، درخت، خیابان) یک بار رسم و کش می‌شود.
   - هر شیء یک جعبه‌ی محیطی سه‌بعدی (bb) دارد؛ ترتیب رسم ثابت‌ها با
     مرتب‌سازی توپولوژیک دقیق تعیین می‌شود، نه با تخمین عمق.
   - در هر فریم فقط اشیای متحرک کشیده می‌شوند و بعد از هرکدام، فقط
     اشیای ثابتی که واقعاً جلوی آن هستند، در همان محدوده دوباره رسم
     می‌شوند. پس ماشینی که پشت ساختمان می‌رود، پشت آن می‌ماند.
   ===================================================================== */
const K = {ink:'#1b1c1e', soft:'#b4b4af', road:'#e9e9e5', walk:'#f3f3f0', curb:'#c4c4bf', tree:'#e7e7e3', treeS:'#8f908c', blue:'#4a4df0', water:'#e9eef5', waterS:'#a9afbd', glass:'#d9dde3', dark:'#2c2d30'};
const PATC = (()=>{ const c=document.createElement('canvas'); c.width=c.height=10; const x=c.getContext('2d'); x.fillStyle='#cbcbc6'; x.fillRect(2,2,1.1,1.1); x.fillStyle='#d9d9d4'; x.fillRect(7,6,1,1); return c; })();
const tone = (nx,ny) => { const v = Math.round(218 + 34*clamp((nx*.92 - ny*.38 + 1)/2)); return `rgb(${v},${v},${v-3})`; };
/* آیا s جلوی d است؟ (دید از جهت +x,+y,+z) */
function inFront(s,d){
  if(d[3]<=s[0] || d[4]<=s[1] || d[5]<=s[2]) return true;
  if(s[3]<=d[0] || s[4]<=d[1] || s[5]<=d[2]) return false;
  return s[5] > d[5]+.5;
}
const ISOS = [];
const io = new IntersectionObserver(es=>es.forEach(e=>{ const v=e.target._iso; if(v) v.vis=e.isIntersecting; }), {rootMargin:'100px'});
class Iso {
  constructor(host, scene){
    Object.assign(this, {host, scene, t:0, vis:false, q:[], st:null});
    this.cv = document.createElement('canvas'); this.cv.setAttribute('aria-hidden','true'); host.appendChild(this.cv);
    this.main = this.cv.getContext('2d'); this.c = this.main;
    this.cache = document.createElement('canvas');
    host._iso = this; io.observe(host); ISOS.push(this);
    new ResizeObserver(()=>this.resize()).observe(host);
  }
  setScene(sc){ this.scene=sc; this.t=0; this.resize(); }
  resize(){ const W=this.host.clientWidth, H=this.host.clientHeight; if(!W||!H) return; this.W=W; this.H=H; this.dpr=Math.min(DPR,this.scene.dpr||DPR);
    this.cv.width=Math.round(W*this.dpr); this.cv.height=Math.round(H*this.dpr); this.cv.style.width=W+'px'; this.cv.style.height=H+'px';
    this.fit(); this.renderStatic(); this.draw(); }
  fit(){ if(!this.W) return; const f=this.scene.fit, pts=[];
    for(const x of [f.x0,f.x1]) for(const y of [f.y0,f.y1]) for(const z of [f.zb||0,f.z]) pts.push([(x-y)*.866,(x+y)*.5-z]);
    const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]), mnx=Math.min(...xs), mxx=Math.max(...xs), mny=Math.min(...ys), mxy=Math.max(...ys), pad=this.scene.pad ?? .06;
    const sx=this.W*(1-2*pad)/(mxx-mnx), sy=this.H*(1-2*pad)/(mxy-mny);
    this.s=(this.scene.cover?Math.max(sx,sy):Math.min(sx,sy))*(this.scene.zoom||1); this.cx=(mnx+mxx)/2; this.cy=(mny+mxy)/2+(this.scene.dy||0); }
  P(x,y,z=0){ return [this.W/2+((x-y)*.866-this.cx)*this.s, this.H/2+((x+y)*.5-z-this.cy)*this.s]; }
  sbb(b){ const xs=[], ys=[]; for(const x of [b[0],b[3]]) for(const y of [b[1],b[4]]) for(const z of [b[2],b[5]]){ const p=this.P(x,y,z); xs.push(p[0]); ys.push(p[1]); }
    return [Math.min(...xs)-1.5, Math.min(...ys)-1.5, Math.max(...xs)+1.5, Math.max(...ys)+1.5]; }
  prep(c){ c.setTransform(this.dpr,0,0,this.dpr,0,0); c.lineJoin='round'; c.lineCap='round'; }
  /* مرتب‌سازی توپولوژیک اشیای ثابت با جعبه‌ی محیطی؛ بقیه با کلید عمق */
  order(items,force){
    if(!this.scene.topo && !force) return items.sort((a,b)=>a.k-b.k);
    const n=items.length; items.forEach((o,i)=>{ o.i=i; if(o.bb) o.sb=this.sbb(o.bb); });
    const G=new Map(), cell=96, keyOf=(cx,cy)=>cx+':'+cy;
    items.forEach(o=>{ if(!o.sb) return; for(let cx=Math.floor(o.sb[0]/cell); cx<=Math.floor(o.sb[2]/cell); cx++) for(let cy=Math.floor(o.sb[1]/cell); cy<=Math.floor(o.sb[3]/cell); cy++){ const k=keyOf(cx,cy); (G.get(k)||G.set(k,[]).get(k)).push(o); } });
    const out=items.map(()=>[]), indeg=new Array(n).fill(0), seen=new Set();
    for(const list of G.values()) for(let a=0;a<list.length;a++) for(let b=a+1;b<list.length;b++){
      const A=list[a], B=list[b], pk=A.i<B.i?A.i*n+B.i:B.i*n+A.i; if(seen.has(pk)) continue; seen.add(pk);
      if(A.sb[2]<B.sb[0]||B.sb[2]<A.sb[0]||A.sb[3]<B.sb[1]||B.sb[3]<A.sb[1]) continue;
      if(inFront(A.bb,B.bb)){ out[B.i].push(A.i); indeg[A.i]++; } else if(inFront(B.bb,A.bb)){ out[A.i].push(B.i); indeg[B.i]++; } }
    const ready=items.filter(o=>!indeg[o.i]).sort((a,b)=>b.k-a.k), res=[], done=new Array(n).fill(false);
    while(res.length<n){
      if(!ready.length){ const rest=items.filter(o=>!done[o.i]).sort((a,b)=>a.k-b.k); ready.push(rest[0]); indeg[rest[0].i]=0; }
      const o=ready.pop(); if(done[o.i]) continue; done[o.i]=true; res.push(o);
      for(const j of out[o.i]){ if(--indeg[j]===0 && !done[j]){ let p=ready.length; while(p>0 && ready[p-1].k<items[j].k) p--; ready.splice(p,0,items[j]); } } }
    return res; }
  renderStatic(){ this.hasStatic=!!this.scene.static; this.st=null; if(!this.hasStatic||!this.W) return;
    const cv=this.cache; cv.width=this.cv.width; cv.height=this.cv.height; const c=cv.getContext('2d'); this.prep(c);
    this.c=c; this.pat=c.createPattern(PATC,'repeat'); this.q=[]; this.scene.static(this);
    const items=this.order(this.q); this.q=[];
    items.forEach((o,i)=>{ o.f(); o.oi=i; });
    this.st=items.filter(o=>o.bb); this.st.forEach(o=>{ o.sb=o.sb||this.sbb(o.bb); });
    this.grid=new Map(); for(const o of this.st) for(let gx=Math.floor(o.sb[0]/64); gx<=Math.floor(o.sb[2]/64); gx++) for(let gy=Math.floor(o.sb[1]/64); gy<=Math.floor(o.sb[3]/64); gy++){ const k=gx+':'+gy; (this.grid.get(k)||this.grid.set(k,[]).get(k)).push(o); }
    this.c=this.main; this.pat=this.main.createPattern(PATC,'repeat'); }
  /* اشیای ثابتِ جلوی یک شیء متحرک را در محدوده‌ی خودش دوباره بکش */
  occlude(o){ if(!this.grid) return; const sb=this.sbb(o.bb), hit=new Set(), list=[];
    for(let gx=Math.floor(sb[0]/64); gx<=Math.floor(sb[2]/64); gx++) for(let gy=Math.floor(sb[1]/64); gy<=Math.floor(sb[3]/64); gy++){ const cell=this.grid.get(gx+':'+gy); if(!cell) continue;
      for(const s of cell){ if(hit.has(s)) continue; hit.add(s); if(s.sb[2]<sb[0]||s.sb[0]>sb[2]||s.sb[3]<sb[1]||s.sb[1]>sb[3]) continue; if(inFront(s.bb,o.bb)) list.push(s); } }
    if(!list.length) return; list.sort((a,b)=>a.oi-b.oi);
    const c=this.c; c.save(); c.beginPath(); c.rect(sb[0],sb[1],sb[2]-sb[0],sb[3]-sb[1]); c.clip(); this.redraw=true;
    for(const s of list) s.f();
    this.redraw=false; c.restore(); }
  draw(){ if(!this.W) return; const c=this.main; c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,this.cv.width,this.cv.height);
    if(this.hasStatic) c.drawImage(this.cache,0,0);
    this.prep(c); this.c=c; this.q=[]; if(this.scene.live) this.scene.live(this,this.t);
    const dyn=this.scene.topoLive?this.order(this.q,true):this.q.sort((a,b)=>a.k-b.k); this.q=[];
    for(const o of dyn){ o.f(); if(o.bb && this.st) this.occlude(o); } }
  add(k,f,bb){ this.q.push({k,f,bb}); }
  path(pts){ const c=this.c; c.beginPath(); pts.forEach((p,i)=>{ const s=this.P(p[0],p[1],p[2]||0); i?c.lineTo(s[0],s[1]):c.moveTo(s[0],s[1]); }); }
  poly(pts,fill,stroke,lw=1){ const c=this.c; this.path(pts); c.closePath(); if(fill){c.fillStyle=fill;c.fill();} if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();} }
  pline(pts,stroke,lw=1,dash,off=0){ const c=this.c; if(dash){c.setLineDash(dash);c.lineDashOffset=off;} this.path(pts); c.strokeStyle=stroke; c.lineWidth=lw; c.stroke(); if(dash) c.setLineDash([]); }
  rect(x,y,w,d,z=0){ return [[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z]]; }
  ring(x,y,r,z=0,n=28,sy=1){ const p=[]; for(let k=0;k<n;k++){ const a=k/n*Math.PI*2; p.push([x+Math.cos(a)*r,y+Math.sin(a)*r*sy,z]); } return p; }
  blob(x,y,R,a,ph,z=0,n=48,lobes=3){ const p=[]; for(let k=0;k<n;k++){ const t=k/n*Math.PI*2, r=R*(1+a*Math.sin(lobes*t+ph)+a*.4*Math.sin(5*t+ph*2)); p.push([x+Math.cos(t)*r, y+Math.sin(t)*r*.8, z]); } return p; }
  ground(pts){ this.poly(pts,this.pat,'#d7d7d2',.6); }
  /* سایه‌ی یک جعبه روی زمین (نور از پشتِ راست) */
  shadowPath(c,x,y,w,d,h){ const ox=-h*.42, oy=h*.22, P=[[x,y],[x+w,y],[x+w,y+d],[x,y+d],[x+ox,y+oy],[x+w+ox,y+oy],[x+w+ox,y+d+oy],[x+ox,y+d+oy]].map(([a,b])=>this.P(a,b,0));
    P.sort((a,b)=>a[0]-b[0]||a[1]-b[1]); const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]), lo=[], up=[];
    for(const p of P){ while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0) lo.pop(); lo.push(p); }
    for(const p of P.slice().reverse()){ while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0) up.pop(); up.push(p); }
    const hull=lo.slice(0,-1).concat(up.slice(0,-1)); c.moveTo(hull[0][0],hull[0][1]); for(const p of hull.slice(1)) c.lineTo(p[0],p[1]); c.closePath(); }
  shadows(list,alpha=.07){ const c=this.c; c.beginPath(); for(const b of list) this.shadowPath(c,b.x,b.y,b.w,b.d,(b.z||0)+b.h); c.fillStyle=`rgba(40,42,50,${alpha})`; c.fill(); }
  boxNow(b){ const {x,y,w,d}=b, z=b.z||0, h=b.h; if(!(h>.05)) return; const st=b.st??K.ink, lw=b.lw??.9, c=this.c; c.globalAlpha=b.a??1;
    if(b.ghost){ c.setLineDash([3,4]); [[[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],[[x+w,y,z],[x+w,y,z+h]],[[x+w,y+d,z],[x+w,y+d,z+h]],[[x,y+d,z],[x,y+d,z+h]]].forEach(p=>{ this.path(p); if(p.length>2) c.closePath(); c.strokeStyle='#8b8c90'; c.lineWidth=.7; c.stroke(); }); c.setLineDash([]); return; }
    this.poly([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]], b.fr??tone(0,1), st, lw);
    this.poly([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]], b.rt??tone(1,0), st, lw);
    if(b.shop){ const [z0,z1]=b.shop; this.poly([[x+1.5,y+d,z0],[x+w-1.5,y+d,z0],[x+w-1.5,y+d,z1],[x+1.5,y+d,z1]],K.glass,st,.45); this.poly([[x+w,y+1.5,z0],[x+w,y+d-1.5,z0],[x+w,y+d-1.5,z1],[x+w,y+1.5,z1]],'#e3e6ea',st,.45);
      c.strokeStyle='rgba(27,28,30,.35)'; c.lineWidth=.4; c.beginPath(); for(let t=9;t<w-3;t+=9){ const p=this.P(x+t,y+d,z0), q=this.P(x+t,y+d,z1); c.moveTo(p[0],p[1]); c.lineTo(q[0],q[1]); } for(let t=9;t<d-3;t+=9){ const p=this.P(x+w,y+t,z0), q=this.P(x+w,y+t,z1); c.moveTo(p[0],p[1]); c.lineTo(q[0],q[1]); } c.stroke(); }
    if(b.win){ const [fh,gap,ww,wh]=b.win; let fl=0;
      for(let zz=z+(b.wz??fh*.35); zz+wh<z+h-2; zz+=fh, fl++){ const o=b.stag?(fl%2)*gap/2:0;
        for(let t=gap*.45+o; t+ww<d-2; t+=gap) this.poly([[x+w,y+t,zz],[x+w,y+t+ww,zz],[x+w,y+t+ww,zz+wh],[x+w,y+t,zz+wh]],b.wc||'#fafaf8',st,.45);
        for(let t=gap*.45+o; t+ww<w-2; t+=gap) this.poly([[x+t,y+d,zz],[x+t+ww,y+d,zz],[x+t+ww,y+d,zz+wh],[x+t,y+d,zz+wh]],b.wc||'#f7f7f4',st,.45); } }
    if(b.fl||b.vl){ c.strokeStyle='rgba(27,28,30,.26)'; c.lineWidth=.45; c.beginPath(); const L=(a,q)=>{ const p=this.P(...a), r=this.P(...q); c.moveTo(p[0],p[1]); c.lineTo(r[0],r[1]); };
      if(b.fl) for(let zz=z+(b.flz??b.fl); zz<z+h-.5; zz+=b.fl){ L([x,y+d,zz],[x+w,y+d,zz]); L([x+w,y,zz],[x+w,y+d,zz]); }
      if(b.vl){ const z0=z+(b.vlz||0); for(let t=b.vl;t<w-.5;t+=b.vl) L([x+t,y+d,z0],[x+t,y+d,z+h]); for(let t=b.vl;t<d-.5;t+=b.vl) L([x+w,y+t,z0],[x+w,y+t,z+h]); }
      c.stroke(); }
    this.poly([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]], b.top??'#fff', st, lw);
    c.globalAlpha=1; }
  box(b){ const z=b.z||0; this.add(b.k ?? (b.x+b.y+(b.w+b.d)*.5+z*.02), ()=>this.boxNow(b), b.nobb?undefined:[b.x,b.y,z,b.x+b.w,b.y+b.d,z+b.h]); }
  cyl(x,y,z,r,h,o={}){ const c=this.c, top=this.ring(x,y,r,z+h,24), S=this.s;
    const a=this.P(x+r*.707,y-r*.707,z), b2=this.P(x-r*.707,y+r*.707,z), at=this.P(x+r*.707,y-r*.707,z+h), bt=this.P(x-r*.707,y+r*.707,z+h), cb=this.P(x,y,z), ct=this.P(x,y,z+h);
    const rx=Math.hypot(a[0]-cb[0],a[1]-cb[1]); c.beginPath(); c.moveTo(at[0],at[1]); c.lineTo(a[0],a[1]); c.ellipse(cb[0],cb[1],rx,rx*.577,0,0,Math.PI); c.lineTo(bt[0],bt[1]); c.closePath(); c.fillStyle=o.side||'#e6e6e2'; c.fill(); c.strokeStyle=o.st||K.ink; c.lineWidth=o.lw||.6; c.stroke();
    c.beginPath(); c.ellipse(ct[0],ct[1],rx,rx*.577,0,0,7); c.fillStyle=o.top||'#fff'; c.fill(); c.stroke(); }
  tree(x,y,s=1,t=0,ph=0,k){ this.add(k ?? x+y+3*s, ()=>{ const c=this.c, S=this.s*s, b=this.P(x,y,0), cc=this.P(x,y,26*s), sw=t?Math.sin(t*1.3+ph)*1.2*S:0;
    if(!this.redraw){ c.fillStyle='rgba(40,42,50,.07)'; c.beginPath(); c.ellipse(b[0]-7*S,b[1]+2*S,13*S,5.5*S,0,0,7); c.fill(); }
    c.strokeStyle='#77786f'; c.lineWidth=Math.max(.6,.8*this.s); c.beginPath(); c.moveTo(b[0],b[1]); c.lineTo(cc[0]+sw*.4,cc[1]+6*S); c.stroke();
    c.fillStyle=K.tree; c.strokeStyle=K.treeS; c.lineWidth=.45;
    for(const [ox,oy,r] of [[-6,3,5],[6,3,5],[0,1,6.5],[-3,-5,5],[4,-4,4.5],[0,-9,3.8]]){ c.beginPath(); c.arc(cc[0]+ox*S+sw, cc[1]+oy*S-2*S, r*S,0,7); c.fill(); c.stroke(); } },
    [x-7*s,y-7*s,0,x+7*s,y+7*s,40*s]); }
  cypress(x,y,s=1,k){ this.add(k ?? x+y+2, ()=>{ const c=this.c, S=this.s*s, b=this.P(x,y,0);
    if(!this.redraw){ c.fillStyle='rgba(40,42,50,.07)'; c.beginPath(); c.ellipse(b[0]-7*S,b[1]+2*S,9*S,3.5*S,0,0,7); c.fill(); }
    c.fillStyle=K.tree; c.strokeStyle=K.treeS; c.lineWidth=.45; c.beginPath(); c.moveTo(b[0],b[1]-2*S); c.bezierCurveTo(b[0]-6*S,b[1]-14*S,b[0]-4*S,b[1]-30*S,b[0],b[1]-40*S); c.bezierCurveTo(b[0]+4*S,b[1]-30*S,b[0]+6*S,b[1]-14*S,b[0],b[1]-2*S); c.fill(); c.stroke(); },
    [x-4*s,y-4*s,0,x+4*s,y+4*s,40*s]); }
  /* آدم: پاهای در حال قدم، بالاتنه‌ی رنگی، سر؛ با کیف، چتر، دوچرخه، کلاه ایمنی، بچه، سگ */
  person(x,y,t,o={}){ const h=o.bike?4.6:(o.h||7); this.add(x+y+.4, ()=>{ const c=this.c, S=this.s, p=this.P(x,y,0), still=o.still||o.sit, sw=still?0:Math.sin(t*7.5+(o.ph||0)), dir=o.dir||[1,0];
    if(o.bike){ c.strokeStyle='#3a3b3e'; c.lineWidth=Math.max(.55,.6*S); const a=this.P(x-dir[0]*2.6,y-dir[1]*2.6,1.4), b=this.P(x+dir[0]*2.6,y+dir[1]*2.6,1.4), sd=this.P(x-dir[0]*.6,y-dir[1]*.6,3.6), hb=this.P(x+dir[0]*2,y+dir[1]*2,4.4), rw=Math.max(.9,1.25*S);
      c.beginPath(); c.arc(a[0],a[1],rw,0,7); c.moveTo(b[0]+rw,b[1]); c.arc(b[0],b[1],rw,0,7); c.moveTo(a[0],a[1]); c.lineTo(sd[0],sd[1]); c.lineTo(b[0],b[1]); c.moveTo(sd[0],sd[1]); c.lineTo(hb[0],hb[1]); c.stroke(); }
    const z0=o.z||0, base=(o.bike?3.4:o.sit?2.4:0)+z0, hip=this.P(x,y,base+h*.45), sh=this.P(x,y,base+h*.86), hd=this.P(x,y,base+h+.9);
    if(!o.bike && !o.sit){ const f1=this.P(x+dir[0]*sw*1.3,y+dir[1]*sw*1.3,z0), f2=this.P(x-dir[0]*sw*1.3,y-dir[1]*sw*1.3,z0); c.strokeStyle='#3a3b3e'; c.lineWidth=Math.max(.7,.8*S); c.beginPath(); c.moveTo(f1[0],f1[1]); c.lineTo(hip[0],hip[1]); c.lineTo(f2[0],f2[1]); c.stroke(); }
    c.strokeStyle=o.col||K.ink; c.lineWidth=Math.max(1.1,(h<5?1.4:1.9)*S); c.beginPath(); c.moveTo(hip[0],hip[1]); c.lineTo(sh[0],sh[1]); c.stroke();
    c.fillStyle=o.hair||'#2a2b2e'; c.beginPath(); c.arc(hd[0],hd[1],Math.max(.9,1.15*S),0,7); c.fill();
    if(o.hat){ c.fillStyle=o.hat; c.strokeStyle=K.ink; c.lineWidth=.5; c.beginPath(); c.arc(hd[0],hd[1]-.3*S,Math.max(1.1,1.5*S),Math.PI,0); c.closePath(); c.fill(); c.stroke(); }
    if(o.bag){ const bp=this.P(x+.8,y-.8,base+h*.5); c.fillStyle=o.bag; c.fillRect(bp[0],bp[1]-1.2*S,1.5*S,2.1*S); }
    if(o.umb){ c.fillStyle=o.umb===true?'#fff':o.umb; c.strokeStyle=K.ink; c.lineWidth=.6; c.beginPath(); c.ellipse(hd[0],hd[1]-2.6*S,4.4*S,1.7*S,0,Math.PI,0); c.closePath(); c.fill(); c.stroke(); }
    if(o.dog){ const dg=o.dog, d0=this.P(dg[0],dg[1],1.6), d1=this.P(dg[0]+dir[0]*2.4,dg[1]+dir[1]*2.4,2.4); c.strokeStyle='#4a4b4f'; c.lineWidth=Math.max(1,1.5*S); c.beginPath(); c.moveTo(d0[0],d0[1]); c.lineTo(d1[0],d1[1]); c.stroke(); c.lineWidth=.4; c.beginPath(); c.moveTo(d1[0],d1[1]); c.lineTo(hip[0],hip[1]); c.stroke(); }
    if(o.cart){ const cp=this.P(x+dir[0]*4,y+dir[1]*4,z0); c.fillStyle='#fff'; c.strokeStyle=K.ink; c.lineWidth=.5; c.beginPath(); c.rect(cp[0]-1.6*S,cp[1]-4.4*S,3.2*S,3.2*S); c.fill(); c.stroke(); } },
    [x-1.2,y-1.2,o.z||0,x+1.2,y+1.2,(o.z||0)+(o.bike?3.4:o.sit?2.4:0)+h+2]); }
  /* وسیله‌ها با بدنه، شیشه، چرخ و چراغ */
  vehicle(x,y,ax,dir,type,col){ const T={car:[22,11,5,3.8],taxi:[22,11,5,3.8],moto:[9,3,3,0],bus:[58,14,13,0],truck:[46,14,15,0],van:[28,12,10,0]}[type];
    const [L,W,H,cab]=T, al=ax==='x', b=al?{x:x-L/2,y:y-W/2,w:L,d:W}:{x:x-W/2,y:y-L/2,w:W,d:L};
    const pal = type==='taxi'?['#ecd793','#e0ca7f','#cdb46a','#5b4e2a']:col==='d'?['#3a3b3f','#2a2b2e','#1e1f21','#111']:col==='g'?['#d8d9db','#c6c7ca','#b3b4b7','#55575c']:col==='b'?['#7d80f4',K.blue,'#3c3fd8','#2a2cb0']:col==='s'?['#c9d2db','#b7c1cb','#a3aeb9','#4c5560']:['#fff',tone(1,0),tone(0,1),K.ink];
    const bb=[b.x,b.y,0,b.x+b.w,b.y+b.d,H+(cab||0)+(type==='moto'?7:0)];
    this.add(b.x+b.y+(b.w+b.d)*.5+.2, ()=>{ const o={top:pal[0],rt:pal[1],fr:pal[2],st:pal[3],lw:.55}, c=this.c, S=this.s;
      const wheels=(n)=>{ c.fillStyle='#1e1f21'; for(let i=0;i<n;i++){ const f=(i+.5)/n; const p=al?this.P(b.x+L*(.12+.76*f),b.y+W,1.2):this.P(b.x+W,b.y+L*(.12+.76*f),1.2); c.beginPath(); c.arc(p[0],p[1],Math.max(.8,1.2*S),0,7); c.fill(); } };
      if(type==='car'||type==='taxi'){ this.boxNow({...b,z:1,h:H-1,...o}); wheels(2);
        const cb=al?{x:b.x+(dir>0?4:7),y:b.y+1,w:11,d:W-2}:{x:b.x+1,y:b.y+(dir>0?4:7),w:W-2,d:11}; this.boxNow({...cb,z:H,h:cab,...o,fr:'#c9ced5',rt:'#d6dbe1'});
        if(type==='taxi'){ const tp=this.P(cb.x+cb.w/2,cb.y+cb.d/2,H+cab+1); c.fillStyle='#2a2b2e'; c.fillRect(tp[0]-1.4*S,tp[1]-1*S,2.8*S,1.4*S); }
        const fx=al?(dir>0?b.x+L:b.x):b.x+W, fy=al?b.y+W:(dir>0?b.y+L:b.y), lp=this.P(fx,fy,3); c.fillStyle=dir>0?'#fff7d6':'#e0533d'; c.beginPath(); c.arc(lp[0],lp[1],Math.max(.6,.8*S),0,7); c.fill(); return; }
      if(type==='moto'){ this.boxNow({...b,z:1,h:2.2,top:'#2c2d30',rt:'#1e1f21',fr:'#141516',st:'#111',lw:.4}); const p=this.P(x,y,3); c.strokeStyle=K.ink; c.lineWidth=Math.max(1,1.6*S); c.beginPath(); c.moveTo(p[0],p[1]); c.lineTo(p[0],p[1]-5.2*S); c.stroke(); c.fillStyle=pal===undefined?'#fff':'#f2f2ef'; c.strokeStyle=K.ink; c.lineWidth=.5; c.beginPath(); c.arc(p[0],p[1]-6.6*S,1.5*S,0,7); c.fill(); c.stroke(); return; }
      if(type==='bus'){ this.boxNow({...b,z:1,h:H-1,...o}); wheels(3); if(al){ this.poly([[b.x+3,b.y+W,6],[b.x+L-3,b.y+W,6],[b.x+L-3,b.y+W,10.5],[b.x+3,b.y+W,10.5]],'#3e4045'); for(let u=b.x+9;u<b.x+L-3;u+=7) this.pline([[u,b.y+W,6],[u,b.y+W,10.5]],'#9a9ca1',.4); } else { this.poly([[b.x+W,b.y+3,6],[b.x+W,b.y+L-3,6],[b.x+W,b.y+L-3,10.5],[b.x+W,b.y+3,10.5]],'#3e4045'); for(let u=b.y+9;u<b.y+L-3;u+=7) this.pline([[b.x+W,u,6],[b.x+W,u,10.5]],'#9a9ca1',.4); } return; }
      if(type==='truck'){ const cl=12, cargo=al?{x:dir>0?b.x:b.x+cl,y:b.y,w:L-cl,d:W}:{x:b.x,y:dir>0?b.y:b.y+cl,w:W,d:L-cl}, cb=al?{x:dir>0?b.x+L-cl:b.x,y:b.y+1,w:cl,d:W-2}:{x:b.x+1,y:dir>0?b.y+L-cl:b.y,w:W-2,d:cl};
        [{...cargo,z:1,h:H-1,...o,vl:4},{...cb,z:1,h:10,top:'#3a3b3f',rt:'#2a2b2e',fr:'#1e1f21',st:'#111',lw:.5}].sort((p,q)=>(p.x+p.y)-(q.x+q.y)).forEach(p=>this.boxNow(p)); wheels(3); return; }
      this.boxNow({...b,z:1,h:H-1,...o}); wheels(2); const wz=al?[[b.x+(dir>0?L-9:3),b.y+W],[b.x+(dir>0?L-3:9),b.y+W]]:[[b.x+W,b.y+(dir>0?L-9:3)],[b.x+W,b.y+(dir>0?L-3:9)]]; this.poly([[...wz[0],5],[...wz[1],5],[...wz[1],8.5],[...wz[0],8.5]],'#c9ced5',null); }, bb); }
  ripples(cx,cy,R,t){ const c=this.c; for(let k=0;k<3;k++){ const r=mod(t*7+k*R/3,R); c.globalAlpha=(1-r/R)*.7; this.poly(this.blob(cx,cy,r,.06,k,.3,32),null,K.waterS,.5); } c.globalAlpha=1; }
  water(pts,t,cx,cy,R){ this.poly(pts,K.water,K.waterS,.6); this.ripples(cx,cy,R,t); }
  birds(t,x0,y0,z,n=5){ const c=this.c; c.strokeStyle='#55575c'; c.lineWidth=.9;
    for(let i=0;i<n;i++){ const p=this.P(x0+mod(t*26+i*18,1600)-300, y0-mod(t*26+i*18,1600)*.35+i*14, z+Math.sin(t*1.5+i)*6), f=Math.sin(t*9+i)*2.5, S=Math.max(.7,this.s);
      c.beginPath(); c.moveTo(p[0]-4*S,p[1]-f*S*.6); c.lineTo(p[0],p[1]); c.lineTo(p[0]+4*S,p[1]-f*S*.6); c.stroke(); } }
}

/* ---------- فرم‌های پایه ---------- */
/* حجم طبقه‌ای گرد یا ابربیضی: پیچش، باریک‌شدن، کمر، پله، خم و گنبد */
function twistTower(v,cx,cy,o){
  const KS=o.ks||32, ex=o.exp||4, n=o.n, z0=o.z0||0;
  const rad=i=>{ const f=i/n; if(o.dome) return o.R*Math.sqrt(Math.max(.02,1-f*f)); const fq=o.step?Math.min(1,Math.floor(f*o.step)/o.step):f; return o.R*(1+(o.bulge||0)*Math.sin(Math.PI*f))*(1-(o.taper||0)*fq); };
  const ring=(i,r)=>{ const f=i/n, th=(o.rot||0)+(o.tw||0)*f, ccx=cx+(o.lean?o.lean[0]*f*f:0), ccy=cy+(o.lean?o.lean[1]*f*f:0), pts=[];
    for(let k=0;k<KS;k++){ const a=k/KS*Math.PI*2, ca=Math.cos(a), sa=Math.sin(a), px=Math.sign(ca)*Math.pow(Math.abs(ca),2/ex)*r, py=Math.sign(sa)*Math.pow(Math.abs(sa),2/ex)*r*(o.asp||1);
      pts.push([ccx+px*Math.cos(th)-py*Math.sin(th), ccy+px*Math.sin(th)+py*Math.cos(th), z0+i*o.fh]); }
    pts.c=[ccx,ccy]; return pts; };
  const RR=o.R*1.45;
  v.add(o.k ?? cx+cy+o.R, ()=>{ const c=v.c;
    for(let i=0;i<n;i++){ const r0=rad(i), r1=o.step?r0:rad(i+1), A=ring(i,r0), B=ring(i+1,r1), [ax,ay]=A.c, segs=[];
      for(let k=0;k<KS;k++){ const k2=(k+1)%KS, mx=(A[k][0]+A[k2][0])/2-ax, my=(A[k][1]+A[k2][1])/2-ay, ln=Math.hypot(mx,my)||1, nx=mx/ln, ny=my/ln; if(nx+ny<-.15) continue; segs.push({k,k2,d:mx+my,nx,ny}); }
      segs.sort((a,b)=>a.d-b.d);
      for(const s of segs) v.poly([A[s.k],A[s.k2],B[s.k2],B[s.k]], o.fill||tone(s.nx,s.ny), 'rgba(27,28,30,.10)', .4);
      c.strokeStyle='rgba(27,28,30,.55)'; c.lineWidth=.55; c.beginPath(); for(const s of segs){ const p=v.P(...B[s.k]), q=v.P(...B[s.k2]); c.moveTo(p[0],p[1]); c.lineTo(q[0],q[1]); } c.stroke();
      if(!o.dome && !o.smooth){ c.strokeStyle=K.ink; c.lineWidth=.85; c.beginPath(); for(const s of segs){ if(s.k%(KS/4)!==KS/8) continue; const p=v.P(...A[s.k]), q=v.P(...B[s.k]); c.moveTo(p[0],p[1]); c.lineTo(q[0],q[1]); } c.stroke(); }
      if(o.step && i<n-1 && rad(i+1)<r0-.5) v.poly(B,'#fff',K.ink,.7);
    }
    v.poly(ring(n,o.step?rad(n-1):rad(n)),o.top||'#fff',K.ink,.9);
  }, o.nobb?undefined:[cx-RR,cy-RR,z0,cx+RR,cy+RR,z0+n*o.fh+2]); }
/* تپه‌ی پلکانی (ماکت توپوگرافی) */
function terraces(v,cx,cy,R,n,k,ph=0){ v.add(k, ()=>{ for(let i=0;i<n;i++){ const pts=v.blob(cx,cy,R*(1-i/n*.86),.12,ph+i*.18,i*5,56); const low=pts.map(p=>[p[0],p[1],p[2]-5]);
  v.poly(low,tone(0,1),null); v.poly(pts,i%2?'#fdfdfb':'#f7f7f4','rgba(27,28,30,.38)',.55); } }, [cx-R*1.2,cy-R*1.2,0,cx+R*1.2,cy+R*1.2,n*5]); }
