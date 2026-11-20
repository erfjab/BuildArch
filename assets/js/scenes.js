/* استودیو جباری — صحنه‌ها: شهر صفحه‌ی اصلی، پنج صحنه‌ی خدمات، انیمیشن کارت کارنامه
   این فایل بخشی از سایت است؛ ترتیب بارگذاری در index.html مهم است: content → engine → scenes → main */

/* ---------- صحنه‌ی اصلی: جریان زندگی در یک محله ----------
   چهارراه با چراغ راهنمایی؛ ماشین‌ها پشت خط می‌ایستند و پشت هم صف می‌کشند،
   عابرها سر خط عابر منتظر سبز شدن می‌مانند، پارک با فواره و زمین بازی،
   کافه، ایستگاه اتوبوس. همه‌چیز قطعی (seed ثابت) و بدون تصویر. */
const HERO = { carW:[440,500], walkA:[422,440], walkB:[500,518], cycle:33 };
function lightState(t){ const c=mod(t,HERO.cycle);
  const H = c<12?'g':c<14.5?'y':'r', V = (c>=16.5&&c<28.5)?'g':(c>=28.5&&c<31?'y':'r');
  return {H,V,c}; }
/* آیا عابری با این سرعت هنوز فرصت رد شدن کامل دارد؟ */
function pedMayCross(ax,c,speed){ const need=64/speed+1.2; return ax==='x' ? (c>=1.5 && c+need<16.5) : (c>=18 && c+need<33); }
function cityBuilding(v,b){
  const {x,y,w,d,h,kind,shop,setback,roof,soft}=b, st=soft?{st:K.soft,lw:.7,top:'#fdfdfc',rt:'#f6f6f3',fr:'#eeeeeb'}:{};
  const fh=kind==='off'?10:11, base={x,y,w,d,h,...st};
  if(shop) Object.assign(base,{shop:[1.5,9.5]});
  if(kind==='res') Object.assign(base,{win:[fh,13,6,7.5],wz:shop?14.5:4,stag:b.s>.5});
  if(kind==='off') Object.assign(base,{vl:4.5,vlz:shop?11:0,fl:fh,flz:shop?11:fh});
  if(kind==='mix') Object.assign(base,{win:[fh,17,9,6],wz:shop?14.5:4,fl:fh,flz:shop?11:fh});
  const sb=setback?{x:x+w*.18,y:y+d*.18,w:w*.6,d:d*.6,z:h,h:setback,...st,...(kind==='off'?{vl:4.5,fl:10}:{win:[11,13,6,7.5],wz:3})}:null;
  const top=sb?h+setback:h;
  v.add(x+y+(w+d)*.5, ()=>{
    v.boxNow(base);
    if(shop && b.awning) v.boxNow({x:x+3,y:y+d,w:w-6,d:3.5,z:10.5,h:1.2,top:b.awning,rt:'#d9d9d5',fr:'#cfcfca',lw:.5});
    if(kind==='res' && b.balc){ for(let zz=(shop?14.5:4)+fh-1.4; zz<h-6; zz+=fh){ v.boxNow({x:x+w*.18,y:y+d,w:w*.64,d:3,z:zz-3,h:1,top:'#fff',lw:.5}); v.pline([[x+w*.18,y+d+3,zz+.8],[x+w*.82,y+d+3,zz+.8]],K.ink,.45); } }
    const roofZ=sb?h:h, items=(roof||[]).slice().sort((a,b)=>a[1]+a[2]-b[1]-b[2]);
    if(sb){ v.boxNow(sb); }
    for(const [t,rx,ry] of items){ const px=x+w*rx, py=y+d*ry, z0=sb&&px>sb.x&&px<sb.x+sb.w&&py>sb.y&&py<sb.y+sb.d?top:roofZ;
      if(t==='tank') v.cyl(px,py,z0,3.4,6,{side:'#e9e9e5'});
      else if(t==='ac') v.boxNow({x:px-3,y:py-2,z:z0,w:6,d:4,h:3,top:'#fff',lw:.5,vl:1.5});
      else if(t==='green'){ const c=v.c; c.fillStyle=K.tree; c.strokeStyle=K.treeS; c.lineWidth=.45; for(let i=0;i<5;i++){ const p=v.P(px+(i%3)*4-4,py+Math.floor(i/3)*4-2,z0+2.5); c.beginPath(); c.arc(p[0],p[1],2.6*v.s,0,7); c.fill(); c.stroke(); } }
      else if(t==='solar'){ for(let i=0;i<3;i++) v.poly([[px-8+i*6,py-4,z0+.6],[px-3+i*6,py-4,z0+.6],[px-3+i*6,py+4,z0+3],[px-8+i*6,py+4,z0+3]],'#c3c8d0',K.ink,.4); } }
  }, [x,y,0,x+w,y+d+4,top+8]); }
function streetLamp(v,x,y){ v.add(x+y+1,()=>{ v.pline([[x,y,0],[x,y,24]],'#55575c',.8); v.pline([[x,y,24],[x+2.5,y-2.5,25]],'#55575c',.8); const p=v.P(x+2.5,y-2.5,24.4); v.c.fillStyle='#fff'; v.c.strokeStyle=K.ink; v.c.lineWidth=.5; v.c.beginPath(); v.c.ellipse(p[0],p[1],1.9*v.s,1*v.s,0,0,7); v.c.fill(); v.c.stroke(); }, [x-1,y-3,0,x+3,y+1,26]); }
function cityBench(v,x,y,ax){ v.add(x+y+2,()=>{ const al=ax==='x'; v.boxNow(al?{x,y,w:14,d:4,z:2.6,h:1.1,top:'#fff',lw:.5}:{x,y,w:4,d:14,z:2.6,h:1.1,top:'#fff',lw:.5}); v.boxNow(al?{x,y,w:14,d:1,z:3.7,h:4,lw:.5}:{x,y,w:1,d:14,z:3.7,h:4,lw:.5}); for(const o of [1,11]) v.boxNow(al?{x:x+o,y:y+.5,w:1.5,d:3,h:2.6,lw:.4}:{x:x+.5,y:y+o,w:3,d:1.5,h:2.6,lw:.4}); }, ax==='x'?[x,y,0,x+14,y+4,8]:[x,y,0,x+4,y+14,8]); }
function umbrellaTable(v,x,y,people){ v.add(x+y+3,()=>{ const c=v.c; v.cyl(x,y,0,3.2,5,{side:'#f1f1ee'}); v.pline([[x,y,5],[x,y,15]],'#55575c',.6);
  const can=v.ring(x,y,9,15,12); v.poly(can,'#fff',K.ink,.6); const tip=v.P(x,y,18); for(let k=0;k<12;k+=3){ const p=v.P(...can[k]); c.beginPath(); c.moveTo(tip[0],tip[1]); c.lineTo(p[0],p[1]); c.strokeStyle='rgba(27,28,30,.3)'; c.lineWidth=.4; c.stroke(); } }, [x-9,y-9,0,x+9,y+9,18]);
  (people||[]).forEach(([dx,dy,col])=>{ v.add(x+dx+y+dy-.2,()=>v.cyl(x+dx,y+dy,0,1.8,2.4,{side:'#e3e3df',lw:.45}),[x+dx-1.8,y+dy-1.8,0,x+dx+1.8,y+dy+1.8,2.4]); v.person(x+dx,y+dy,0,{sit:1,h:4.6,col}); }); }

function sceneHero(){
  const r=rng(23), B=[], T=[], CY=[], LAMP=[], BENCH=[], SIT=[], lots=[30,130,230,330,530,630,730,830];
  const roadLot=(lx,ly)=>lx===330||lx===530||ly===330||ly===530;
  const SHIRT=['#2c2d30','#55575c','#8a8c90','#b8babd','#5a6b7a','#7a6a58','#3f4a5a','#9aa3ad',K.blue];
  for(const lx of lots) for(const ly of lots){
    if(lx>=530&&lx<=630&&ly>=530&&ly<=630) continue;                  /* پارک */
    if(lx===330&&ly===330) continue;                                   /* کافه */
    if(ly===730&&(lx===530||lx===630)){ for(let k=0;k<4;k++) T.push([lx+12+r()*66, ly+14+r()*60, .85+r()*.25]); continue; } /* فضای باز جلوی پارک */
    if(r()<.08){ for(let k=0;k<3;k++) T.push([lx+18+r()*54, ly+18+r()*54, .8+r()*.2]); continue; }
    const w=58+r()*28, d=58+r()*28, center=1-Math.hypot(lx+45-470,ly+45-470)/680, h=Math.round((22+Math.pow(r(),1.6)*90+center*55)/11)*11+(r()<.5?0:3);
    const kr=r(), kind=kr<.5?'res':kr<.78?'mix':'off', roof=[];
    const nr=1+Math.floor(r()*3); for(let i=0;i<nr;i++){ const q=r(); roof.push([q<.4?'tank':q<.7?'ac':q<.85?'green':'solar', .2+r()*.6, .2+r()*.6]); }
    B.push({x:lx+(90-w)/2, y:ly+(90-d)/2, w, d, h, kind, s:r(), shop:roadLot(lx,ly)||r()<.25, awning:r()<.5?(r()<.25?'#dfe1f7':'#ececE8'):0, balc:kind==='res'&&r()<.7, setback:h>80&&r()<.45?11*(1+Math.floor(r()*2)):0, roof, soft:r()<.35});
  }
  /* درخت و چراغ کنار پیاده‌روها */
  for(let u=-380;u<1400;u+=34){ if(u>392&&u<548) continue; T.push([u,437,.78]); T.push([u+17,503,.78]); T.push([437,u+8,.78]); T.push([503,u+25,.78]); }
  for(let u=-360;u<1400;u+=102){ if(u>380&&u<560) continue; LAMP.push([u+10,439]); LAMP.push([u+60,501]); LAMP.push([439,u+40]); LAMP.push([501,u+90]); }
  /* پارک */
  const PC=[630,630];
  for(let k=0;k<16;k++){ const a=k/16*6.283+.2, d=88+r()*8, tx=PC[0]+Math.cos(a)*d, ty=PC[1]+Math.sin(a)*d*.96; if(tx>532&&tx<608&&ty>672&&ty<730) continue; if(tx>706&&tx<726&&ty>540&&ty<630) continue; T.push([tx,ty,.85+r()*.25]); }
  for(let k=0;k<6;k++) CY.push([716, 552+k*12]);
  for(let k=0;k<6;k++){ const a=k/6*6.283+.5, rx=PC[0]+Math.cos(a)*74, ry=PC[1]+Math.sin(a)*74; const ax=Math.abs(Math.cos(a))>Math.abs(Math.sin(a))?'y':'x'; BENCH.push([rx-(ax==='x'?7:2), ry-(ax==='x'?2:7), ax]); if(r()<.6) SIT.push([rx,ry,SHIRT[Math.floor(r()*SHIRT.length)]]); }
  /* ماشین‌ها روی چهار خط؛ رانندگی از سمت راست */
  const LANES=[{ax:'x',dir:1,c:454,road:'H'},{ax:'x',dir:-1,c:486,road:'H'},{ax:'y',dir:1,c:486,road:'V'},{ax:'y',dir:-1,c:454,road:'V'}];
  const VT=['car','car','taxi','car','moto','car','bus','car','van','taxi','car','truck','car','moto','car'], VC=['w','d','g','s','w','d','g','w','s'];
  const LEN={car:22,taxi:22,moto:9,bus:58,truck:46,van:28};
  LANES.forEach((ln,li)=>{ ln.sStart=ln.dir>0?-520:-1460; ln.sEnd=ln.sStart+1980; ln.stop=ln.dir>0?416:-524; ln.vmax=44+li*2; ln.cars=[];
    let s=ln.sStart+60+r()*80; for(let k=0;k<7;k++){ const ty=VT[Math.floor(r()*VT.length)]; ln.cars.push({s, L:LEN[ty], ty, col:li===1&&k===3?'b':VC[Math.floor(r()*VC.length)], v:ln.vmax*.8}); s+=LEN[ty]+120+r()*160; if(s>ln.sEnd-20) break; } });
  /* عابرها روی چهار پیاده‌رو */
  const WALK=[{ax:'x',c:[426,432]},{ax:'x',c:[507,513]},{ax:'y',c:[426,432]},{ax:'y',c:[507,513]}], PED=[];
  for(let k=0;k<64;k++){ const wk=WALK[k%4], dir=r()<.5?1:-1, kind=r();
    PED.push({ax:wk.ax, c:wk.c[dir>0?1:0]+(r()-.5)*1.6, u:-420+r()*1820, dir, v:kind<.08?15+r()*4:5.5+r()*4, ph:r()*6, h:6.2+r()*1.6,
      col:SHIRT[Math.floor(r()*SHIRT.length)], bag:r()<.2?(r()<.25?K.blue:'#8a8c90'):0, umb:kind>=.08&&r()<.04, bike:kind<.08, kid:kind>.92, dog:kind>.86&&kind<=.92, cart:kind>.82&&kind<=.86}); }
  /* زندگی در پارک */
  const JOG=[]; for(let k=0;k<9;k++) JOG.push({a:r()*6.283, w:(k<3?.09:.035+r()*.02)*(r()<.5?-1:1), rr:61+r()*6, ph:r()*6, h:6.4+r()*1.2, col:SHIRT[Math.floor(r()*SHIRT.length)], dog:k===5, cart:k===7});
  const PIG=[]; for(let k=0;k<7;k++) PIG.push([PC[0]-30+r()*20, PC[1]+22+r()*16, r()*6]);
  let last=null;
  return { fit:{x0:230,y0:230,x1:810,y1:810,z:120}, cover:true, zoom:1.12, pad:0, dpr:1.5, topo:true,
    static(v){
      const W=K.walk;
      for(const q of [[-420,-420,842,842],[518,-420,902,842],[-420,518,842,902],[518,518,902,902]]) v.ground(v.rect(...q));
      for(const [a,b] of [HERO.walkA,HERO.walkB]){ v.poly(v.rect(-420,a,1840,b-a),W); v.poly(v.rect(a,-420,b-a,1840),W); }
      v.poly(v.rect(-420,440,1840,60),K.road); v.poly(v.rect(440,-420,60,1840),K.road);
      const c=v.c; c.strokeStyle='rgba(27,28,30,.06)'; c.lineWidth=.5; c.beginPath();
      for(let u=-420;u<1420;u+=9){ for(const [a,b] of [HERO.walkA,HERO.walkB]){ if(u>a-1&&u<b+1) continue; let p=v.P(u,a), q=v.P(u,b); c.moveTo(p[0],p[1]); c.lineTo(q[0],q[1]); p=v.P(a,u); q=v.P(b,u); c.moveTo(p[0],p[1]); c.lineTo(q[0],q[1]); } } c.stroke();
      for(const y of [440,500]){ v.pline([[-420,y],[440,y]],K.curb,.7); v.pline([[500,y],[1420,y]],K.curb,.7); }
      for(const x of [440,500]){ v.pline([[x,-420],[x,440]],K.curb,.7); v.pline([[x,500],[x,1420]],K.curb,.7); }
      v.pline([[-420,470],[414,470]],'#cfcfca',.9,[9,9]); v.pline([[526,470],[1420,470]],'#cfcfca',.9,[9,9]);
      v.pline([[470,-420],[470,414]],'#cfcfca',.9,[9,9]); v.pline([[470,526],[470,1420]],'#cfcfca',.9,[9,9]);
      for(let u=442;u<498;u+=7){ v.poly(v.rect(u,424.5,3.6,13),'#fbfbf9'); v.poly(v.rect(u,502.5,3.6,13),'#fbfbf9'); v.poly(v.rect(424.5,u,13,3.6),'#fbfbf9'); v.poly(v.rect(502.5,u,13,3.6),'#fbfbf9'); }
      v.pline([[421,441],[421,469]],'#fbfbf9',2.2); v.pline([[519,471],[519,499]],'#fbfbf9',2.2); v.pline([[471,421],[499,421]],'#fbfbf9',2.2); v.pline([[441,519],[469,519]],'#fbfbf9',2.2);
      /* پارک: چمن، مسیر حلقه‌ای، مسیرهای شعاعی، حوض */
      v.poly(v.rect(526,526,208,208),'#f5f6f3','#cfcfca',.5);
      v.poly(v.ring(PC[0],PC[1],68,0,48),W,'#d4d4cf',.5); v.poly(v.ring(PC[0],PC[1],54,0,48),'#f5f6f3','#d4d4cf',.5);
      for(const [a,b] of [[[526,624],[562,636]],[[624,526],[636,562]],[[698,624],[734,636]],[[624,698],[636,734]]]) v.poly(v.rect(a[0],a[1],b[0]-a[0],b[1]-a[1]),W);
      v.poly(v.ring(PC[0],PC[1],28,0,40),'#f0f0ec','#cfcfca',.5);
      v.poly(v.rect(542,682,54,34),'#f1efe9','#d6d3cb',.5);
      v.shadows(B.flatMap(b=>b.setback?[b,{x:b.x+b.w*.18,y:b.y+b.d*.18,w:b.w*.6,d:b.d*.6,h:b.h+b.setback}]:[b]).concat([{x:340,y:340,w:44,d:42,h:24}]));
      B.forEach(b=>cityBuilding(v,b));
      /* کافه‌ی سر نبش با میزهای چتردار */
      v.add(340+340+43,()=>{ v.boxNow({x:340,y:340,w:44,d:42,h:24,shop:[1.5,13],fl:12,flz:15}); v.boxNow({x:352,y:350,w:8,d:6,z:24,h:3.5,top:'#fff',lw:.5,vl:2}); v.cyl(372,368,24,3,5,{side:'#e9e9e5'}); v.boxNow({x:343,y:382,w:38,d:4,z:13.5,h:1.2,top:'#dfe1f7',rt:'#d4d6ee',fr:'#c9cbe6',lw:.5}); v.boxNow({x:384,y:343,w:4,d:36,z:13.5,h:1.2,top:'#dfe1f7',rt:'#d4d6ee',fr:'#c9cbe6',lw:.5}); }, [340,340,0,388,386,26]);
      umbrellaTable(v,398,358,[[-4,3,SHIRT[1]],[4,-3,SHIRT[5]]]); umbrellaTable(v,399,394,[[-4,2,SHIRT[6]]]); umbrellaTable(v,360,400,[[3,-4,SHIRT[3]],[-3,4,SHIRT[0]]]);
      /* ایستگاه اتوبوس */
      v.add(640+520+30,()=>{ v.boxNow({x:640,y:527,w:34,d:1,h:16,top:'#fff',fr:'rgba(217,221,227,.9)',rt:'#d9dde3',lw:.5}); v.boxNow({x:638,y:520,w:38,d:9,z:16,h:1.4,top:'#fff',lw:.6}); for(const xx of [640,673]) v.boxNow({x:xx,y:526,w:1.2,d:1.2,h:16,lw:.4}); v.boxNow({x:646,y:523,w:22,d:3.5,z:3,h:1,top:'#fff',lw:.5}); }, [638,520,0,676,529,18]);
      v.person(650,524,0,{sit:1,h:4.6,col:SHIRT[4]}); v.person(661,522,0,{still:1,h:7,col:SHIRT[2],bag:'#8a8c90'});
      /* زمین بازی: سرسره و قاب تاب */
      v.add(560+700,()=>{ v.boxNow({x:552,y:690,w:6,d:6,h:12,lw:.5}); v.poly([[558,690,12],[574,690,1],[574,696,1],[558,696,12]],'#fff',K.ink,.6); }, [552,690,0,574,696,13]);
      v.add(585+700,()=>{ for(const yy of [688,708]) { v.pline([[578,yy,0],[584,yy,20],[590,yy,0]],K.ink,.7); } v.pline([[584,688,20],[584,708,20]],K.ink,.9); }, [578,688,0,590,708,21]);
      LAMP.forEach(([x,y])=>streetLamp(v,x,y));
      BENCH.forEach(([x,y,ax])=>cityBench(v,x,y,ax));
      SIT.forEach(([x,y,col])=>v.person(x,y,0,{sit:1,h:4.6,col}));
      T.forEach(([x,y,s])=>v.tree(x,y,s)); CY.forEach(([x,y])=>v.cypress(x,y,.85));
      v.add(PC[0]+PC[1],()=>{ v.cyl(PC[0],PC[1],0,22,3.2,{side:'#ecece8',top:K.water}); v.cyl(PC[0],PC[1],3.2,4,4,{side:'#f1f1ee'}); }, [PC[0]-22,PC[1]-22,0,PC[0]+22,PC[1]+22,7]);
    },
    live(v,t){
      const dt=last===null?0:clamp(t-last,0,.06); last=t; const L=lightState(t);
      /* ترافیک: شتاب، ترمز، فاصله‌ی ایمن و چراغ */
      for(const ln of LANES){ const sig=L[ln.road]; ln.cars.sort((a,b)=>b.s-a.s);
        ln.cars.forEach((cr,i)=>{ const lead=ln.cars[i-1]; let gap=lead?lead.s-lead.L-cr.s:1e9;
          const toStop=ln.stop-cr.s; if(sig!=='g' && toStop>-2 && (sig==='r' || toStop>16)) gap=Math.min(gap,toStop);
          const vmax=cr.ty==='moto'?ln.vmax+6:cr.ty==='bus'||cr.ty==='truck'?ln.vmax-6:ln.vmax, vd=vmax*clamp((gap-5)/46);
          cr.v+=clamp(vd-cr.v,-140*dt,26*dt); cr.v=Math.max(0,cr.v); cr.s+=cr.v*dt; });
        for(const cr of ln.cars) if(cr.s>ln.sEnd){ const mn=Math.min(...ln.cars.map(q=>q.s)); cr.s=Math.min(ln.sStart, mn-cr.L-40-Math.random()*80); cr.v=ln.vmax*.9; }
        for(const cr of ln.cars){ const u=ln.dir*(cr.s-cr.L/2); ln.ax==='x'?v.vehicle(u,ln.c,'x',ln.dir,cr.ty,cr.col):v.vehicle(ln.c,u,'y',ln.dir,cr.ty,cr.col); } }
      /* عابرها: سر خط عابر صبر می‌کنند */
      for(const p of PED){ const ok=pedMayCross(p.ax,L.c,p.v), front=p.u+p.dir*1.5;
        const waiting = !ok && (p.dir>0 ? (front>433&&front<440) : (front<507&&front>500));
        if(!waiting) p.u+=p.dir*p.v*dt;
        if(p.u>1440) p.u=-430; if(p.u<-440) p.u=1430;
        const x=p.ax==='x'?p.u:p.c, y=p.ax==='x'?p.c:p.u, dir=p.ax==='x'?[p.dir,0]:[0,p.dir];
        v.person(x,y,t,{...p, dir, still:waiting, dog:p.dog?[x+dir[0]*4+dir[1]*2,y+dir[1]*4+dir[0]*2]:0});
        if(p.kid) v.person(x+dir[1]*3,y+dir[0]*3,t,{h:4.3,ph:p.ph+1.3,dir,still:waiting,col:'#b8babd'}); }
      /* پارک: دونده‌ها، سگ، کالسکه، کبوترها، تاب، فواره */
      for(const j of JOG){ const a=j.a+t*j.w, x=PC[0]+Math.cos(a)*j.rr, y=PC[1]+Math.sin(a)*j.rr, dir=[-Math.sin(a)*Math.sign(j.w),Math.cos(a)*Math.sign(j.w)];
        v.person(x,y,t*(Math.abs(j.w)>.06?1.6:1),{...j,dir,dog:j.dog?[x-dir[0]*4,y-dir[1]*4]:0}); }
      for(const [px,py,ph] of PIG){ const hop=Math.max(0,Math.sin(t*3+ph)); v.add(px+py,()=>{ const p=v.P(px+Math.sin(t*.7+ph)*2,py,hop*1.2); v.c.fillStyle='#6b6d72'; v.c.beginPath(); v.c.ellipse(p[0],p[1],1.1*v.s,.7*v.s,0,0,7); v.c.fill(); }, [px-1,py-1,0,px+1,py+1,2]); }
      for(const [yy,ph] of [[692,0],[704,1.7]]){ const sw=Math.sin(t*2.2+ph)*.55, sx=584+Math.sin(sw)*14, sz=20-Math.cos(sw)*14;
        v.add(584+yy+.5,()=>{ v.pline([[584,yy,20],[sx,yy,sz]],K.ink,.5); v.boxNow({x:sx-2,y:yy-1.5,z:sz-1,w:4,d:3,h:1,top:'#fff',lw:.4}); },[578,yy-2,0,590,yy+2,20]);
        v.person(sx,yy,t,{sit:1,h:3.6,col:SHIRT[8-(yy%3)],still:1}); v.q[v.q.length-1].bb[2]=sz-3; }
      v.person(570+Math.sin(t*.9)*8,712,t,{h:4.2,col:'#8a8c90',dir:[Math.cos(t*.9),0]}); v.person(600,716,t,{still:1,h:7,col:SHIRT[3]});
      v.add(PC[0]+PC[1]+.5,()=>{ const c=v.c; c.fillStyle='rgba(169,175,189,.85)';
        for(let k=0;k<12;k++){ const p=mod(t*.9+k/12,1); for(let j=0;j<8;j++){ const a=j/8*6.283+.2, rr=3+p*15, z=7+26*4*p*(1-p); const q=v.P(PC[0]+Math.cos(a)*rr,PC[1]+Math.sin(a)*rr,z); c.globalAlpha=.55+.45*(1-p); c.beginPath(); c.arc(q[0],q[1],Math.max(.9,1.05*v.s),0,7); c.fill(); } } c.globalAlpha=1;
        for(let k=0;k<6;k++){ const p=mod(t*1.4+k/6,1), q=v.P(PC[0],PC[1],7+p*26); c.globalAlpha=1-p; c.beginPath(); c.arc(q[0],q[1],.9,0,7); c.fill(); } c.globalAlpha=1;
        v.ripples(PC[0],PC[1],18,t); }, [PC[0]-20,PC[1]-20,3,PC[0]+20,PC[1]+20,36]);
      /* گارسون کافه */
      { const p=mod(t*.06,1), P=[[388,370],[396,368],[399,388],[372,396],[388,370]], sg=Math.min(3,Math.floor(p*4)), f=p*4-sg, A=P[sg], Bq=P[sg+1]; v.person(A[0]+(Bq[0]-A[0])*f, A[1]+(Bq[1]-A[1])*f, t, {col:'#2c2d30',h:7,dir:[Math.sign(Bq[0]-A[0])||0,Math.sign(Bq[1]-A[1])||0]}); }
      /* چراغ‌های راهنمایی */
      const COL={g:'#3fae79',y:'#e2b23e',r:'#dd5a46'}, OFF='#55575c';
      for(const [px,py] of [[437.5,437.5],[502.5,437.5],[437.5,502.5],[502.5,502.5]]) v.add(px+py,()=>{ v.pline([[px,py,0],[px,py,20]],'#3a3b3f',1); v.boxNow({x:px-1.3,y:py-1.3,z:20,w:2.6,d:2.6,h:9,top:'#3a3b3f',rt:'#2a2b2e',fr:'#1e1f21',st:'#111',lw:.4});
        const c=v.c, rr=Math.max(.75,.82*v.s); [['r',26.6],['y',24.4],['g',22.2]].forEach(([k,z])=>{ const a=v.P(px+1.35,py,z), b=v.P(px,py+1.35,z); c.fillStyle=L.H===k?COL[k]:OFF; c.beginPath(); c.arc(a[0],a[1],rr,0,7); c.fill(); c.fillStyle=L.V===k?COL[k]:OFF; c.beginPath(); c.arc(b[0],b[1],rr,0,7); c.fill(); }); }, [px-1.3,py-1.3,0,px+1.5,py+1.5,29]);
      v.add(99999,()=>v.birds(t,200,300,260));
    } };
}

/* ---------- صحنه‌های خدمات ---------- */
/* قوس جناغی روی یک وجه: u در امتداد وجه، z ارتفاع */
function archUZ(u0,u1,zb,zs,peak){ const p=[[u0,zb]]; for(let k=0;k<=16;k++){ const s=k/16; p.push([u0+(u1-u0)*s, zs+peak*(1-Math.pow(Math.abs(2*s-1),1.7))]); } p.push([u1,zb]); return p; }
const onFront=(Y,pts)=>pts.map(([u,z])=>[u,Y,z]), onRight=(X,pts)=>pts.map(([u,z])=>[X,u,z]);
/* صندلی؛ face جهت نگاه نشسته است: x و y رو به +، -x و -y رو به منفی (پشتی در طرف مقابل) */
function chair(v,x,y,face){ v.box({x,y,w:7,d:7,z:4,h:1.2,top:'#fff'}); for(const [a,b] of [[0,0],[6,0],[0,6],[6,6]]) v.box({x:x+a,y:y+b,w:1,d:1,h:4,k:x+y+a+b});
  v.box({x:{'-x':x+5.8}[face]??x, y:{'-y':y+5.8}[face]??y, w:face.endsWith('x')?1.2:7, d:face.endsWith('x')?7:1.2, z:5, h:7}); }
function bench(v,x,y,al){ v.box(al?{x,y,w:22,d:6,z:3,h:1.4,top:'#fff'}:{x,y,w:6,d:22,z:3,h:1.4,top:'#fff'}); v.box(al?{x,y,w:22,d:1.4,z:4,h:6}:{x,y,w:1.4,d:22,z:4,h:6}); for(const o of [1,19]) v.box(al?{x:x+o,y:y+1,w:2,d:4,h:3}:{x:x+1,y:y+o,w:4,d:2,h:3}); }
function lamp(v,x,y,H=28){ v.add(x+y+1,()=>{ v.pline([[x,y,0],[x,y,H]],K.ink,.8); const p=v.P(x,y,H+1.5); v.c.fillStyle='#fff'; v.c.strokeStyle=K.ink; v.c.lineWidth=.6; v.c.beginPath(); v.c.arc(p[0],p[1],2.2*v.s,0,7); v.c.fill(); v.c.stroke(); },[x-1,y-1,0,x+1,y+1,H+3]); }
function shrubBox(v,x,y,w,d){ v.box({x,y,w,d,h:6,fl:3}); v.add(x+y+w+d,()=>{ const c=v.c; c.fillStyle=K.tree; c.strokeStyle=K.treeS; c.lineWidth=.45; for(let i=0;i<4;i++){ const p=v.P(x+w*(.2+i*.2),y+d/2,9); c.beginPath(); c.arc(p[0],p[1],3.2*v.s,0,7); c.fill(); c.stroke(); } },[x,y,6,x+w,y+d,13]); }

/* جرثقیل برجی با جزئیات: دکل مشبک، بوم خرپایی، وزنه‌ی تعادل، ارابه، قلاب و بار */
function towerCrane(v,x,y,H,st){
  const an=st.a, ca=Math.cos(an), sa=Math.sin(an), cx=x+4, cy=y+4, px=-sa, py=ca;
  v.add(x+y+8,()=>{ const c=v.c; c.strokeStyle=K.ink; c.lineWidth=.7;
    for(const [a,b] of [[0,0],[8,0],[8,8],[0,8]]) v.pline([[x+a,y+b,0],[x+a,y+b,H]],K.ink,(a+b===16||a+b===8)?.8:.4);
    for(let z=0;z<H;z+=9){ v.pline([[x,y+8,z],[x+8,y+8,z+9]],K.ink,.4); v.pline([[x+8,y+8,z],[x,y+8,z+9]],K.ink,.25); v.pline([[x+8,y,z],[x+8,y+8,z+9]],K.ink,.4); v.pline([[x+8,y,z],[x+8,y+8,z]],K.ink,.35); v.pline([[x,y+8,z],[x+8,y+8,z]],K.ink,.35); }
    v.poly(v.rect(x-2,y-2,12,12,0),'#e4e4df',K.ink,.6); });
  v.add(5000,()=>{ const c=v.c, L=st.L, LC=L*.3;
    v.boxNow({x:x-2,y:y-2,z:H,w:12,d:12,h:5,top:'#fff'});
    v.boxNow({x:cx+px*7-3,y:cy+py*7-3,z:H-2,w:7,d:7,h:7,top:'#fff',fr:'#d8dbe6',rt:'#e6e8f0'});
    const J=(d,o,z)=>[cx+ca*d+px*o, cy+sa*d+py*o, H+5+z];
    /* بوم تعادل: کف راهرو و نرده */
    v.poly([J(0,-3,0),J(-LC,-3,0),J(-LC,3,0),J(0,3,0)],'#ecece8',K.ink,.5);
    for(const o of [-3,3]) v.pline([J(-6,o,0),J(-LC,o,0),J(-LC,o,3)],K.ink,.35);
    for(const o of [-3,3]){ v.pline([J(-6,o,3),J(-LC,o,3)],K.ink,.35); for(let d=-10;d>-LC;d-=6) v.pline([J(d,o,0),J(d,o,3)],K.ink,.3); }
    /* کلاهک: پایه‌های A شکل و میله‌ی کششی تا روی خرپا */
    v.pline([[cx,cy,H+5],[cx,cy,H+27]],K.ink,1.1);
    for(const o of [-3,3]) v.pline([J(0,o,0),J(0,0,22)],K.ink,.6);
    v.pline([J(-LC+4,0,7),J(0,0,22),J(L*.62,0,7)],K.ink,.8);
    v.pline([J(0,0,22),J(L*.3,0,7)],K.ink,.5);
    /* بوم اصلی: خرپای سه‌وجهی بسته، با نوک بسته */
    for(const o of [-3,3]) v.pline([J(0,o,0),J(L,o,0)],K.ink,.8);
    v.pline([J(0,0,7),J(L-6,0,7)],K.ink,.7);
    for(let d=0;d<L-6;d+=7){ v.pline([J(d,-3,0),J(d+3.5,0,7),J(d+7,-3,0)],K.ink,.35); v.pline([J(d,3,0),J(d+3.5,0,7),J(d+7,3,0)],K.ink,.35); v.pline([J(d,-3,0),J(d,3,0)],K.ink,.3); }
    v.pline([J(L,-3,0),J(L,3,0)],K.ink,.6); v.pline([J(L,-3,0),J(L-6,0,7),J(L,3,0)],K.ink,.5);
    for(const o of [-3,3]) v.pline([J(0,o,0),J(-LC,o,0)],K.ink,.8);
    for(let k=0;k<3;k++){ const d=-LC+2+k*5; v.boxNow({x:cx+ca*d-3,y:cy+sa*d-3,z:H+1,w:6,d:6,h:7,top:'#2c2d30',rt:'#1e1f21',fr:'#141516',st:'#111',lw:.4}); }
    const tr=J(st.tr,0,0), tz=H+5, hx=tr[0], hy=tr[1];
    v.boxNow({x:hx-3,y:hy-3,z:tz-2,w:6,d:6,h:3,top:K.blue,rt:'#3d40d9',fr:'#3033bd',st:'#2a2cb0',lw:.4});
    v.pline([[hx-1,hy,tz-2],[hx-1,hy,st.hz+3]],K.ink,.45); v.pline([[hx+1,hy,tz-2],[hx+1,hy,st.hz+3]],K.ink,.45);
    v.boxNow({x:hx-2,y:hy-2,z:st.hz,w:4,d:4,h:3,top:'#2c2d30',rt:'#1e1f21',fr:'#141516',st:'#111',lw:.4});
    if(st.load){ for(let i=0;i<3;i++) v.boxNow({x:hx-14,y:hy-3+i*2.2,z:st.hz-5,w:28,d:2,h:2,top:'#fff',st:K.ink,lw:.4}); v.pline([[hx,hy,st.hz],[hx-12,hy,st.hz-3]],K.ink,.4); v.pline([[hx,hy,st.hz],[hx+12,hy,st.hz-3]],K.ink,.4); }
  }); }

const SVC = {
  /* معماری: اول ردپای طرح روی زمین کشیده می‌شود، بعد برج طبقه‌به‌طبقه بالا می‌آید؛ دورش زندگی جریان دارد */
  arch:()=>{ const ppl=[{a:0,r:58,w:.09,col:'#55575c'},{a:2.2,r:62,w:-.07,col:'#2c2d30',bag:K.blue},{a:4,r:66,w:.06,col:'#8a8c90',dog:1},{a:1,r:56,w:-.1,col:'#5a6b7a'}];
    const cars=[{u:-40,v:30,lane:211,dir:1,ty:'car',col:'w'},{u:120,v:30,lane:211,dir:1,ty:'taxi'},{u:260,v:-34,lane:225,dir:-1,ty:'car',col:'d'},{u:60,v:-34,lane:225,dir:-1,ty:'van',col:'g'}];
    return { fit:{x0:0,y0:0,x1:240,y1:240,z:190}, pad:.05, topoLive:true,
    static(v){ v.ground(v.rect(-20,-20,280,214));
      v.poly(v.rect(-90,194,440,8),K.walk); v.poly(v.rect(-90,202,440,32),K.road); v.poly(v.rect(-90,234,440,8),K.walk); v.pline([[-90,218],[350,218]],'#cfcfca',.8,[8,8]); v.pline([[-90,202],[350,202]],K.curb,.6); v.pline([[-90,234],[350,234]],K.curb,.6);
      v.poly(v.ring(128,100,74,0,48),K.walk,'#d4d4cf',.5); { const c=v.c; c.strokeStyle='rgba(27,28,30,.06)'; c.lineWidth=.5; c.beginPath(); for(let r=56;r<74;r+=6){ const pts=v.ring(128,100,r,0,48); pts.forEach((p,i)=>{ const s=v.P(...p); i?c.lineTo(s[0],s[1]):c.moveTo(s[0],s[1]); }); c.closePath(); } c.stroke(); }
      v.poly(v.rect(118,170,20,24),K.walk);
      v.shadows([{x:16,y:146,w:40,d:36,h:20}]);
      terraces(v,36,164,30,6,150,2.2); v.cypress(32,160,.7,152);
      v.poly(v.rect(176,150,48,22,.2),K.water,K.waterS,.6); v.box({x:174,y:148,w:52,d:2,h:2.4,lw:.5}); v.box({x:174,y:172,w:52,d:2,h:2.4,lw:.5});
      for(const [x,y] of [[30,30],[60,22],[210,30],[226,70],[20,90],[214,120]]) v.tree(x,y,.9);
      for(let k=0;k<5;k++) v.cypress(150+k*12,186,.75);
      for(const [x,y] of [[70,170],[190,60]]) v.add(x+y+1,()=>{ v.pline([[x,y,0],[x,y,24]],'#55575c',.8); const p=v.P(x,y,25); v.c.fillStyle='#fff'; v.c.strokeStyle=K.ink; v.c.lineWidth=.5; v.c.beginPath(); v.c.ellipse(p[0],p[1],2*v.s,1*v.s,0,0,7); v.c.fill(); v.c.stroke(); },[x-1,y-1,0,x+1,y+1,26]);
      for(const [x,y,al] of [[60,40,true],[200,96,false]]) v.add(x+y+3,()=>{ v.boxNow(al?{x,y,w:16,d:4,z:2.6,h:1,top:'#fff',lw:.5}:{x,y,w:4,d:16,z:2.6,h:1,top:'#fff',lw:.5}); v.boxNow(al?{x,y,w:16,d:1,z:3.6,h:4,lw:.5}:{x,y,w:1,d:16,z:3.6,h:4,lw:.5}); },al?[x,y,0,x+16,y+4,8]:[x,y,0,x+4,y+16,8]);
      v.person(66,42,0,{sit:1,h:4.6,col:'#7a6a58'}); },
    live(v,t){ const T=mod(t,13), c=v.c;
      if(T<1.8){ const p=clamp(T/1.4), pts=v.ring(128,100,44,.4,64).slice(0,Math.max(2,Math.floor(64*p)));
        v.add(1,()=>{ v.pline(pts,K.blue,1.1,[4,3]); for(const a of [0,1.57,3.14,4.71]){ if(p*6.283<a) continue; const q=[128+Math.cos(a)*48,100+Math.sin(a)*48]; v.pline([[...q,0],[...q,6]],K.blue,1); } },[80,52,0,176,148,1]); }
      const n=T<1.8?0:Math.max(1,Math.min(28,Math.floor((T-1.8)/3.6*28)+1));
      if(n) twistTower(v,128,100,{n,fh:6.4,R:42,tw:1.3*n/28,taper:.12*n/28,bulge:.15,crown:n===28});
      for(const p of ppl){ const a=p.a+t*p.w, x=128+Math.cos(a)*p.r, y=100+Math.sin(a)*p.r, d=[-Math.sin(a)*Math.sign(p.w),Math.cos(a)*Math.sign(p.w)];
        v.person(x,y,t,{col:p.col,bag:p.bag,dir:d,ph:p.a,dog:p.dog?[x-d[0]*4,y-d[1]*4]:0}); }
      for(const cr of cars){ const u=mod(cr.u+t*cr.v+60,380)-60; v.vehicle(u,cr.lane,'x',cr.dir,cr.ty,cr.col); }
      v.person(mod(20+t*7,320)-40,198,t,{dir:[1,0],col:'#3f4a5a'}); v.person(260-mod(t*6,320),238,t,{dir:[-1,0],col:'#9aa3ad',umb:true});
      v.add(1e5,()=>v.birds(t*.8,40,120,170,4));
      v.add(0,()=>v.ripples(200,161,10,t),[176,150,.2,224,172,.3]); } }; },

  /* طراحی داخلی: نشیمن آرام با نور آفتاب، گیاه، گربه و بخار چای */
  int:()=>({ fit:{x0:0,y0:0,x1:220,y1:220,z:110}, pad:.05,
    static(v){
      v.box({x:0,y:0,w:220,d:220,h:5,top:'#fbfbf9',k:-10});
      v.add(-9,()=>{ for(let x=12;x<220;x+=12) v.pline([[x,0,5.05],[x,220,5.05]],'rgba(27,28,30,.07)',.5); });
      v.box({x:0,y:-7,w:220,d:7,h:112,k:-8,top:'#fff'}); v.box({x:-7,y:-7,w:7,d:227,h:112,k:-8.5,top:'#fff'});
      v.add(-7,()=>{ v.poly([[0,36,20],[0,186,20],[0,186,100],[0,36,100]],'#f3f4f8',K.ink,.8);
        for(const y of [73.5,111,148.5]) v.pline([[0,y,20],[0,y,100]],K.ink,.6); v.pline([[0,36,78],[0,186,78]],K.ink,.5);
        v.poly([[0,30,104],[0,40,104],[0,40,14],[0,30,14]],'#ecebe6','rgba(27,28,30,.3)',.4); v.poly([[0,182,104],[0,192,104],[0,192,14],[0,182,14]],'#ecebe6','rgba(27,28,30,.3)',.4);
        v.poly([[100,0,46],[152,0,46],[152,0,86],[100,0,86]],'#fff',K.ink,.7); v.poly([[106,0,52],[146,0,52],[146,0,80],[106,0,80]],'#f1f1ec',null);
        const p=v.P(120,0,66); v.c.fillStyle=K.blue; v.c.beginPath(); v.c.arc(p[0],p[1],5*v.s,0,7); v.c.fill(); v.pline([[106,0,60],[146,0,74]],K.ink,.6); });
      v.box({x:16,y:0,w:66,d:16,h:98,k:-6});
      v.add(-5.9,()=>{ for(const x of [32.5,49,65.5]) v.pline([[x,16,2],[x,16,98]],'rgba(27,28,30,.45)',.5); for(const x of [30,35,47,51.5,63.5,68]) v.pline([[x,16,46],[x,16,56]],K.ink,.8); v.pline([[16,16,8],[82,16,8]],'rgba(27,28,30,.3)',.4); });
      twistTower(v,30,8,{n:4,fh:3.5,z0:98,R:4,exp:2,bulge:.5,k:-5.5});
      v.box({x:96,y:2,w:60,d:10,h:16,k:-5.4,vl:15}); twistTower(v,108,7,{n:3,fh:3,z0:16,R:2.6,exp:2,bulge:.4,k:-5.3,nobb:1}); v.box({x:136,y:4,w:8,d:5,z:16,h:5,k:-5.2,top:'#fff'});
      v.add(-5,()=>v.poly(v.rect(66,76,108,90,5.2),'#efefeb','rgba(27,28,30,.3)',.6)); v.add(-4.9,()=>{ v.poly(v.rect(72,82,96,78,5.3),null,'rgba(27,28,30,.18)',.5); for(let u=80;u<168;u+=8) v.pline([[u,82,5.3],[u,160,5.3]],'rgba(27,28,30,.05)',.5); });
      v.box({x:12,y:70,w:36,d:104,h:11,k:140}); v.box({x:12,y:70,w:10,d:104,z:11,h:15,k:141}); v.box({x:12,y:64,w:36,d:7,h:20,k:142}); v.box({x:12,y:173,w:36,d:7,h:20,k:160});
      v.box({x:22,y:74,w:24,d:47,z:11,h:5,top:'#fff',k:150}); v.box({x:22,y:123,w:24,d:47,z:11,h:5,top:'#fff',k:151}); v.box({x:22,y:84,w:6,d:16,z:16,h:10,top:K.blue,rt:'#3d40d9',fr:'#3033bd',st:'#2a2cb0',lw:.5,k:150.5}); v.box({x:22,y:150,w:6,d:14,z:16,h:9,top:'#e9e9e5',k:151.5});
      twistTower(v,108,120,{n:1,fh:9,R:17,exp:2,k:108+120+10});
      v.box({x:100,y:112,w:10,d:7,z:9,h:1.6,top:'#fff',k:250}); v.add(251,()=>v.cyl(116,122,9,2,3,{side:'#fff'}),[114,120,9,118,124,12]);
      twistTower(v,154,108,{n:1,fh:11,R:10,exp:2,k:154+108+6}); twistTower(v,156,140,{n:1,fh:11,R:10,exp:2,k:156+140+6});
      v.box({x:132,y:20,w:62,d:30,z:16,h:2.5,top:'#fff',k:132+20+48}); for(const [a,b] of [[2,2],[58,2],[2,26],[58,26]]) v.box({x:132+a,y:20+b,w:2,d:2,h:16,k:132+20+a+b});
      for(const x of [138,158,178]){ v.box({x,y:8,w:10,d:10,h:9,k:x+8+8}); v.box({x,y:8,w:10,d:2.4,z:9,h:12,k:x+8+8.1});
        v.box({x,y:52,w:10,d:10,h:9,k:x+52+12}); v.box({x,y:59.6,w:10,d:2.4,z:9,h:12,k:x+52+12.1}); }
      v.add(132+20+49,()=>{ v.cyl(160,34,18.5,4,2,{side:'#fff'}); for(const [a,b] of [[156,32],[163,36]]){ const p=v.P(a,b,20.5); v.c.fillStyle='#ecebe6'; v.c.strokeStyle=K.ink; v.c.lineWidth=.45; v.c.beginPath(); v.c.arc(p[0],p[1],1.4*v.s,0,7); v.c.fill(); v.c.stroke(); } },[156,30,18.5,166,40,22]);
      v.box({x:196,y:150,w:12,d:12,h:10});
      v.box({x:58,y:186,w:2,d:2,h:62,k:300}); twistTower(v,59,187,{n:3,fh:4,z0:60,R:7,exp:2,taper:-.5,k:301});
    },
    live(v,t){ const sx=40+Math.sin(t*.3)*18; v.add(-4,()=>v.poly([[0,sx,5.4],[0,sx+70,5.4],[80,sx+120,5.4],[80,sx+50,5.4]],'rgba(255,214,140,.16)'),[0,sx,5.2,80,sx+120,5.4]);
      v.tree(202,156,.75,t*.6,0,202+156+30);
      for(const [x,y,ph] of [[146,30,0],[163,38,1.5],[180,30,3]]){ const sw=Math.sin(t*.8+ph)*1.2; v.add(400+x,()=>{ v.pline([[x,y,112],[x+sw,y,52]],K.ink,.5); const p=v.P(x+sw,y,50); v.c.fillStyle='#fff'; v.c.strokeStyle=K.ink; v.c.lineWidth=.6; v.c.beginPath(); v.c.ellipse(p[0],p[1],4*v.s,2.6*v.s,0,0,7); v.c.fill(); v.c.stroke(); }); }
      v.add(260,()=>{ const c=v.c; c.strokeStyle='rgba(120,122,128,.5)'; c.lineWidth=.7; for(let k=0;k<2;k++){ const ph=mod(t*.5+k*.5,1); c.globalAlpha=1-ph; c.beginPath(); for(let i=0;i<=8;i++){ const z=12+ph*8+i*1.2, p=v.P(116+Math.sin(i*.9+t*2+k)*1.2,122,z); i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]); } c.stroke(); } c.globalAlpha=1; },[114,120,12,118,124,30]);
      /* گربه: آرام روی فرش راه می‌رود و گاهی می‌نشیند */
      const ca=t*.18, walk=Math.sin(t*.35)>-.3, cx=100+Math.cos(ca)*26, cy=148+Math.sin(ca)*8, dir=[-Math.sin(ca),Math.cos(ca)];
      v.add(cx+cy,()=>{ const c=v.c, S=v.s, b=v.P(cx,cy,5.4+2.2), h=v.P(cx+dir[0]*3.4,cy+dir[1]*3.4,5.4+3.6), tl=v.P(cx-dir[0]*3.6,cy-dir[1]*3.6,5.4+3+Math.sin(t*3)*1.2);
        c.fillStyle='#3a3b3e'; c.beginPath(); c.ellipse(b[0],b[1],3.2*S,1.7*S,0,0,7); c.fill(); c.beginPath(); c.arc(h[0],h[1],1.3*S,0,7); c.fill();
        c.strokeStyle='#3a3b3e'; c.lineWidth=Math.max(.7,.8*S); c.beginPath(); c.moveTo(b[0],b[1]); c.quadraticCurveTo(tl[0],tl[1]+2*S,tl[0],tl[1]-1.5*S); c.stroke(); },[cx-3,cy-3,5.4,cx+3,cy+3,10]); } }),

  /* مرمت: خانه‌ی قاجاری با حیاط و حوض، داربست، کارگرها روی طبقات داربست و بالابر */
  rest:()=>({ fit:{x0:0,y0:0,x1:240,y1:240,z:120}, pad:.04,
    static(v){ v.ground(v.rect(0,0,240,240)); v.poly(v.rect(20,166,200,62,.1),'#f2f2ef','#cfcfca',.5);
      { const c=v.c; c.strokeStyle='rgba(27,28,30,.05)'; c.lineWidth=.5; c.beginPath(); for(let u=26;u<220;u+=8){ let p=v.P(u,166), q=v.P(u,228); c.moveTo(p[0],p[1]); c.lineTo(q[0],q[1]); } c.stroke(); }
      const X=30,Y=36,W=170,D=120,H=64, F=Y+D, R=X+W;
      v.shadows([{x:X,y:Y,w:W,d:D,h:H}]);
      v.add(200,()=>{
        v.boxNow({x:X,y:Y,w:W,d:D,h:H,fl:3.2,lw:1});
        v.boxNow({x:X-2,y:Y-2,w:W+4,d:D+4,z:H,h:4,top:'#fff',fl:2});
        for(let u=X+2;u<R-4;u+=8) v.poly(onFront(F+2,[[u,H+4],[u+4,H+4],[u+4,H+8],[u,H+8]]),'#fff',K.ink,.5);
        for(let u=Y+2;u<F-4;u+=8) v.poly(onRight(R+2,[[u,H+4],[u+4,H+4],[u+4,H+8],[u,H+8]]),'#fff',K.ink,.5);
        const bay=(face,u0)=>{ const g=archUZ(u0,u0+20,0,18,10), gi=archUZ(u0+3,u0+17,0,18,7), w=archUZ(u0+3,u0+17,36,48,6);
          v.poly(face(g),'#f6f6f2',K.ink,.7); v.poly(face(gi),'#e9e9e4',K.ink,.4);
          v.poly(face(w),'#f6f6f2',K.ink,.6); for(let k=1;k<3;k++) v.pline(face([[u0+3+k*4.7,36],[u0+3+k*4.7,52]]),K.ink,.3); v.pline(face([[u0+3,44],[u0+17,44]]),K.ink,.3); };
        const mid=X+W/2;
        for(const u0 of [X+8,X+34,mid+30,mid+56]) bay(p=>onFront(F,p),u0);
        for(let u0=Y+10;u0<F-20;u0+=27) bay(p=>onRight(R,p),u0);
        v.boxNow({x:mid-24,y:F,w:48,d:6,h:H+18,fl:3.2,lw:1});
        v.boxNow({x:mid-26,y:F-1,w:52,d:8,z:H+18,h:3,top:'#fff'});
        const pa=archUZ(mid-16,mid+16,0,50,22), pi=archUZ(mid-11,mid+11,0,48,16);
        v.poly(onFront(F+6,pa),'#f6f6f2',K.ink,.9); v.poly(onFront(F+6,pi),'#e3e3de',K.ink,.5);
        v.poly(onFront(F+6,[[mid-21,75],[mid+21,75],[mid+21,79],[mid-21,79]]),'#e3e3de',K.ink,.4);
        v.poly(onFront(F+6,archUZ(mid-7,mid+7,0,16,7)),'#cfcfca',K.ink,.6); v.pline(onFront(F+6,[[mid,0],[mid,23]]),K.ink,.5);
      },[X-2,Y-2,0,R+2,F+8,H+22]);
      v.add(700,()=>{ const Y2=F+12; for(let x=X;x<=X+64;x+=16){ v.pline([[x,Y2,0],[x,Y2,80]],K.ink,.6); v.pline([[x,Y2+8,0],[x,Y2+8,80]],K.ink,.4); }
        for(let z=16;z<=80;z+=16){ v.pline([[X,Y2,z],[X+64,Y2,z]],K.ink,.6); v.poly([[X,Y2,z],[X+64,Y2,z],[X+64,Y2+8,z],[X,Y2+8,z]],'rgba(255,255,255,.85)',K.ink,.45); }
        for(let x=X;x<X+64;x+=16) v.pline([[x,Y2+8,0],[x+16,Y2+8,16]],K.ink,.3); });
      /* حیاط: حوض، دو باغچه، نیمکت */
      v.add(130+186,()=>{ v.boxNow({x:118,y:180,w:44,d:20,h:2.4,lw:.6}); v.poly(v.rect(120,182,40,16,2.4),K.water,K.waterS,.5); },[118,180,0,162,200,2.6]);
      for(const bx of [100,180]) v.add(bx+190,()=>{ v.boxNow({x:bx-8,y:184,w:16,d:12,h:2,lw:.5}); },[bx-8,184,0,bx+8,196,2]);
      v.tree(100,190,.85); v.tree(180,190,.85); v.cypress(222,50,1); v.cypress(222,80,.9); v.cypress(222,110,.95); v.tree(12,200,.9);
      v.add(200+214,()=>{ v.boxNow({x:184,y:210,w:16,d:4,z:2.6,h:1,top:'#fff',lw:.5}); v.boxNow({x:184,y:213,w:16,d:1,z:3.6,h:4,lw:.5}); },[184,210,0,200,214,8]);
    },
    live(v,t){ const lz=6+(Math.sin(t*.6)*.5+.5)*62; v.add(710,()=>{ v.boxNow({x:13,y:169,w:14,d:14,h:2,top:'#e4e4df',lw:.5}); for(const [a,b] of [[18,172],[22,172],[22,176],[18,176]]) v.pline([[a,b,2],[a,b,88]],K.ink,(a===22&&b===176)?.7:.4);
        for(let z=2;z<86;z+=8){ v.pline([[18,176,z],[22,176,z+8]],K.ink,.3); v.pline([[22,172,z],[22,176,z+8]],K.ink,.3); }
        for(const z of [24,56,84]) v.pline([[22,174,z],[30,174,z]],K.ink,.45);
        v.boxNow({x:23,y:169,w:7,d:12,z:lz,h:10,top:K.blue,rt:'#3d40d9',fr:'#3033bd',st:'#2a2cb0',lw:.5}); },[13,169,0,30,183,90]);
      v.add(0,()=>v.ripples(140,190,8,t),[120,182,2.4,160,198,2.6]);
      for(const [lvl,ph,sp] of [[16,0,.4],[48,2,.3],[64,4,.5]]) v.person(34+(Math.sin(t*sp+ph)*.5+.5)*56,172,t,{z:lvl,hat:'#fff',col:'#55575c',dir:[Math.cos(t*sp+ph)>0?1:-1,0],ph});
      v.person(60+Math.sin(t*.25)*22,186,t,{hat:'#fff',cart:1,dir:[Math.cos(t*.25)>0?1:-1,0]});
      v.person(150+Math.sin(t*.18)*44,223,t,{bag:'#8a8c90',dir:[Math.cos(t*.18)>0?1:-1,0],col:'#7a6a58'}); v.person(190,212,t,{sit:1,h:4.6,col:'#3f4a5a'}); } }),

  /* محوطه: حوض با فواره، آلاچیق، پیک‌نیک، بچه‌ها، دونده و سگ */
  land:()=>({ fit:{x0:0,y0:0,x1:230,y1:230,z:60}, pad:.04,
    static(v){ v.ground(v.rect(0,0,230,230));
      v.poly(v.rect(20,20,190,190,.05),'#f5f5f2','#cfcfca',.5); for(let k=30;k<210;k+=12){ v.pline([[k,20,.06],[k,210,.06]],'rgba(27,28,30,.05)',.5); }
      v.poly(v.rect(70,90,90,44,.2),K.water,K.waterS,.7); v.box({x:66,y:86,w:98,d:4,h:3,k:150}); v.box({x:66,y:134,w:98,d:4,h:3,k:200}); v.box({x:66,y:90,w:4,d:44,h:3,k:155}); v.box({x:160,y:90,w:4,d:44,h:3,k:240});
      v.add(300,()=>{ for(const [a,b] of [[24,150],[24,200],[64,150],[64,200]]) v.boxNow({x:a,y:b,w:3,d:3,h:30}); for(const a of [23,63]) v.boxNow({x:a,y:146,w:5,d:60,z:27.5,h:2.5,top:'#fff'}); for(let y=148;y<=204;y+=6) v.boxNow({x:18,y,w:56,d:1.6,z:30,h:2.2,top:'#fff'}); },[18,146,0,74,206,33]);
      chair(v,40.5,161,'y'); chair(v,30,173.5,'x'); twistTower(v,44,177,{n:1,fh:8,R:7,exp:2,k:44+177+3}); chair(v,51,173.5,'-x');
      bench(v,80,46,true); bench(v,130,46,true); bench(v,186,90,false);
      v.add(176+176,()=>v.poly(v.rect(160,160,30,22,.3),'#eef0f7','rgba(27,28,30,.3)',.5),[160,160,0,190,182,.4]);
      v.person(168,170,0,{sit:1,h:4.4,col:'#5a6b7a'}); v.person(178,174,0,{sit:1,h:3.6,col:'#b8babd'}); v.add(184+168,()=>{ v.boxNow({x:182,y:164,w:6,d:4,h:3,top:'#fff',lw:.5}); },[182,164,0,188,168,3]);
      for(const [x,y] of [[30,30],[30,60],[30,92],[60,30],[200,30],[170,30],[120,200],[96,200],[150,200]]) v.tree(x,y,.95);
      for(let k=0;k<5;k++) v.cypress(196,124+k*7,.75);
      shrubBox(v,90,150,40,10);
      for(const [x,y] of [[66,80],[164,80],[66,144],[164,144]]) lamp(v,x,y,24);
      v.box({x:94,y:24,w:44,d:16,h:2.4,fl:1.2,lw:.5,k:30}); v.add(31,()=>{ const c=v.c; for(const [x,y,col] of [[100,30,'#e6caca'],[108,34,'#d8dcc9'],[116,29,'#e6caca'],[124,33,'#e8dfc7'],[132,30,'#d8dcc9']]){ const p=v.P(x,y,3); c.fillStyle=col; c.beginPath(); c.arc(p[0],p[1],2.2*v.s,0,7); c.fill(); } },[94,24,2.4,138,40,4]);
    },
    live(v,t){ v.add(120,()=>{ for(let k=0;k<4;k++){ const ph=mod(t*.2+k/4,1), y=94+ph*36; v.c.globalAlpha=Math.sin(ph*Math.PI)*.7; v.pline([[76,y,.3],[154,y,.3]],K.waterS,.5,[5,6],-t*8); } v.c.globalAlpha=1; },[70,90,.2,160,134,.3]);
      v.add(115+112,()=>{ const c=v.c; c.fillStyle='rgba(150,158,176,.85)'; for(let k=0;k<10;k++){ const p=mod(t*.8+k/10,1); for(let j=0;j<6;j++){ const a=j/6*6.283, rr=1+p*9, z=3+18*4*p*(1-p); const q=v.P(115+Math.cos(a)*rr,112+Math.sin(a)*rr,z); c.beginPath(); c.arc(q[0],q[1],Math.max(.7,.8*v.s),0,7); c.fill(); } } v.ripples(115,112,12,t); },[103,100,0,127,124,22]);
      v.tree(200,200,.95,t,2);
      const p=mod(t*.05,1), L=[[56,74],[174,74],[174,146],[56,146]], sg=Math.floor(p*4), f=p*4-sg, A=L[sg], B=L[(sg+1)%4], x=A[0]+(B[0]-A[0])*f, y=A[1]+(B[1]-A[1])*f, d=[Math.sign(B[0]-A[0]),Math.sign(B[1]-A[1])];
      v.person(x,y,t,{dir:d,col:'#2c2d30',dog:[x-d[0]*4+d[1]*2,y-d[1]*4+d[0]*2]});
      const q=mod(t*.09+.5,1), sq=Math.floor(q*4), fq=q*4-sq, A2=L[sq], B2=L[(sq+1)%4]; v.person(A2[0]+(B2[0]-A2[0])*fq,A2[1]+(B2[1]-A2[1])*fq+4,t*1.6,{dir:[Math.sign(B2[0]-A2[0]),Math.sign(B2[1]-A2[1])],col:K.blue,h:7.2});
      for(const [ph,c2] of [[0,'#b8babd'],[2.1,'#8a8c90']]){ const a=t*.9+ph, kx=124+Math.cos(a)*14, ky=180+Math.sin(a)*7; v.person(kx,ky,t*1.3,{h:4.3,col:c2,dir:[-Math.sin(a),Math.cos(a)]}); }
      v.person(92,49,t,{sit:1,z:2,h:4.6,col:'#7a6a58'}); v.person(33.5,177,t,{sit:1,z:2.8,h:4.6,col:'#55575c'}); v.person(54.5,177,t,{sit:1,z:2.8,h:4.6,col:'#3f4a5a'});
      v.add(1e5,()=>v.birds(t*.7,20,120,60,3)); } }),

  /* کارگاه: اسکلت نیمه‌کاره، جرثقیل، میکسر بتن، کانتینر دفتر کارگاه، مهندس با نقشه */
  sup:()=>({ fit:{x0:0,y0:0,x1:240,y1:240,z:175}, pad:.04,
    static(v){ v.ground(v.rect(0,0,240,240)); v.poly(v.rect(-120,200,500,40),K.road); v.pline([[-120,220],[380,220]],'#d0d0cb',.8,[8,10]);
      v.pline([[10,10],[230,10],[230,190],[10,190],[10,10]].map(p=>[p[0],p[1],0]),'rgba(27,28,30,.5)',.8,[2,3]);
      for(let x=14;x<230;x+=18) v.add(x+190,()=>{ v.pline([[x,190,0],[x,190,8]],'#55575c',.6); },[x-.5,189.5,0,x+.5,190.5,8]);
      v.poly(v.rect(56,56,128,104,.1),'#ececE8','#cfcfca',.5);
      v.shadows([{x:56,y:56,w:128,d:104,h:70}]);
      v.add(300,()=>{ const xs=[60,118,176], ys=[60,108,156], fh=22;
        for(let f=0;f<5;f++){
          if(f>0){ const full=f<4; v.boxNow({x:58,y:58,w:full?124:66,d:102,z:f*fh-3,h:3,top:'#fff',lw:.7}); }
          if(f===4) continue;
          const cols=[]; for(const x of xs) for(const y of ys) cols.push([x,y]); cols.sort((a,b)=>a[0]+a[1]-b[0]-b[1]);
          for(const [x,y] of cols){ const h=f===3&&x===176?12:fh-3; v.boxNow({x:x-2,y:y-2,z:f*fh,w:4,d:4,h,lw:.6}); if(f===3&&x===176) for(let k=-1;k<=1;k+=2) v.pline([[x+k,y,f*fh+h],[x+k,y,f*fh+h+8]],K.ink,.4); }
          if(f===0){ v.boxNow({x:60,y:154,w:58,d:4,h:fh-3,fl:3}); v.boxNow({x:174,y:60,w:4,d:48,h:fh-3,fl:3}); }
          if(f===1){ v.boxNow({x:60,y:154,w:36,d:4,z:fh,h:fh-3,fl:3}); }
        }
        for(let x=60;x<124;x+=6) v.pline([[x,60,88],[x,160,88]],'rgba(27,28,30,.35)',.35);
      },[56,56,0,184,160,96]);
      v.add(420,()=>{ const Y=166; for(let x=56;x<=184;x+=16){ v.pline([[x,Y,0],[x,Y,76]],K.ink,.5); v.pline([[x,Y+7,0],[x,Y+7,76]],K.ink,.35); } for(let z=19;z<=76;z+=19) v.poly([[56,Y,z],[184,Y,z],[184,Y+7,z],[56,Y+7,z]],'rgba(255,255,255,.85)',K.ink,.4); for(let x=56;x<184;x+=16) v.pline([[x,Y+7,0],[x+16,Y+7,19]],K.ink,.25); },[56,166,0,184,173,76]);
      v.vehicle(200,214,'x',1,'truck','w');
      v.box({x:18,y:130,w:28,d:16,h:15,win:[15,9,5,6],wz:5,top:'#fff'}); v.box({x:18,y:148,w:28,d:16,h:15,win:[15,9,5,6],wz:5,top:'#fff'});
      for(let i=0;i<4;i++) v.box({x:196,y:150+i*3,w:26,d:2.4,z:0,h:2.4,top:'#fff',lw:.4,k:196+150+i});
      for(const [x,y] of [[200,120],[212,120]]) v.box({x,y,w:10,d:10,h:8,fl:2,lw:.5});
      v.tree(232,40,.9); v.tree(232,80,.85);
    },
    live(v,t){
      const T=mod(t,18), mx=200, my=36, cx=mx+4, cy=my+4, sm=x=>x*x*(3-2*x), H=150;
      const aT=Math.atan2(214-cy,200-cx), dT=Math.hypot(200-cx,214-cy), aB=Math.atan2(100-cy,92-cx), dB=Math.hypot(92-cx,100-cy), up=H-24, onT=20, onB=93;
      let a,tr,hz,load=false;
      if(T<2){ a=aT; tr=dT; hz=up+(onT-up)*sm(T/2); }
      else if(T<3){ a=aT; tr=dT; hz=onT; load=true; }
      else if(T<5.5){ a=aT; tr=dT; hz=onT+(up-onT)*sm((T-3)/2.5); load=true; }
      else if(T<9.5){ const k=sm((T-5.5)/4); a=aT+(aB-aT)*k; tr=dT+(dB-dT)*k; hz=up; load=true; }
      else if(T<11.5){ a=aB; tr=dB; hz=up+(onB-up)*sm((T-9.5)/2); load=true; }
      else if(T<12.5){ a=aB; tr=dB; hz=onB; }
      else if(T<14.5){ a=aB; tr=dB; hz=onB+(up-onB)*sm((T-12.5)/2); }
      else { const k=sm((T-14.5)/3.5); a=aB+(aT-aB)*k; tr=dB+(dT-dB)*k; hz=up; }
      towerCrane(v,mx,my,H,{a,tr,hz,load,L:192});
      if(T>=11.5) v.add(320,()=>{ for(let i=0;i<3;i++) v.boxNow({x:78,y:97+i*2.2,z:88,w:28,d:2,h:2,top:'#fff',lw:.4}); });
      /* میکسر بتن با دیگ چرخان */
      const mxp=mod(t*16,420)-90; v.add(mxp+232,()=>{ const c=v.c; v.boxNow({x:mxp-16,y:226,w:34,d:12,z:1,h:4,top:'#e9e9e5',lw:.5}); v.boxNow({x:mxp+10,y:227,w:10,d:10,z:5,h:8,top:'#3a3b3f',rt:'#2a2b2e',fr:'#1e1f21',st:'#111',lw:.5});
        const cc=v.P(mxp-3,232,11), r=7.5*v.s; c.fillStyle='#f4f4f1'; c.strokeStyle=K.ink; c.lineWidth=.6; c.beginPath(); c.ellipse(cc[0],cc[1],r*1.25,r*.85,-.5,0,7); c.fill(); c.stroke();
        c.strokeStyle='rgba(27,28,30,.45)'; c.lineWidth=.5; for(let k=0;k<3;k++){ const ph=t*2+k*2.1; c.beginPath(); c.ellipse(cc[0],cc[1],r*1.25*Math.abs(Math.cos(ph)),r*.85,-.5,0,7); c.stroke(); }
        c.fillStyle='#1e1f21'; for(const u of [mxp-12,mxp+2,mxp+14]){ const p=v.P(u,238,1.2); c.beginPath(); c.arc(p[0],p[1],Math.max(.8,1.3*v.s),0,7); c.fill(); } },[mxp-16,226,0,mxp+20,238,18]);
      for(const [x,y,ph,z] of [[70,64,0,22],[100,120,2,44],[150,90,4,66],[130,140,1,0]]) v.person(x+Math.sin(t*.4+ph)*10,y,t,{z,hat:'#fff',h:6.2,ph,dir:[Math.cos(t*.4+ph)>0?1:-1,0],col:'#55575c'});
      v.person(36+Math.sin(t*.3)*10,172,t,{hat:K.blue,h:6.8,col:'#2c2d30',bag:'#e9e9e5',dir:[Math.cos(t*.3)>0?1:-1,0]});
      v.person(24,124,t,{still:1,hat:'#fff',col:'#7a6a58'});
      v.vehicle(240-mod(t*34,320),207,'x',-1,'moto'); } })
};

/* ---------- ایزومتریک‌های کارنامه: همه درباره‌ی ساختن ---------- */
const ART = {
  /* پلان یک آپارتمان ۱۲۰ متری: دال، دیوارهای بیرونی ضخیم و داخلی نازک، پنجره با شیشه،
     در با قوس بازشو، و لایه‌ی مبلمان؛ لایه‌ها به ترتیب ظاهر و ناپدید می‌شوند */
  plan:{ fit:{x0:-6,y0:-6,x1:186,y1:136,z:36}, pad:.04, topoLive:true, live(v,t){
    const T=mod(t,15), wallE=T<.8?0:T<3.4?ease((T-.8)/2.6):T<12.6?1:T<14.2?1-ease((T-12.6)/1.6):0;
    const fade=(a,b)=>clamp((T-a)/b)*(T<12.6?1:clamp(1-(T-12.6)/1));
    const gl=fade(3.2,.9), fu=fade(4.2,1.2), S='#ececE8', BG='#151618', H=21*wallE, tE=4, tI=2.5;
    v.add(-1000,()=>{ v.poly(v.rect(0,0,180,130,0),'#1c1d20',S,.9); const c=v.c; c.strokeStyle='rgba(236,236,232,.07)'; c.lineWidth=.5; c.beginPath();
      for(let u=10;u<180;u+=10){ const p=v.P(u,0), q=v.P(u,130); c.moveTo(p[0],p[1]); c.lineTo(q[0],q[1]); } for(let u=10;u<130;u+=10){ const p=v.P(0,u), q=v.P(180,u); c.moveTo(p[0],p[1]); c.lineTo(q[0],q[1]); } c.stroke();
      c.strokeStyle='rgba(236,236,232,.12)'; c.beginPath(); for(let u=76;u<120;u+=4){ const p=v.P(u,4), q=v.P(u,40); c.moveTo(p[0],p[1]); c.lineTo(q[0],q[1]); } for(let u=8;u<40;u+=4){ const p=v.P(72.5,u), q=v.P(120,u); c.moveTo(p[0],p[1]); c.lineTo(q[0],q[1]); } c.stroke(); },[0,0,-1,180,130,0]);
    if(H<.3) return;
    const box=(x,y,w,d,z,h,a=1)=>{ if(h>.05) v.box({x,y,w,d,z,h,top:BG,rt:BG,fr:BG,st:S,lw:.85,a}); };
    /* دیوار در امتداد x با بازشوها؛ open=[a,b,'w'|'d'] */
    const wallX=(y,t0,x0,x1,opens)=>{ let cur=x0; for(const [a,b,kind] of opens){ box(cur,y,a-cur,t0,0,H); cur=b;
        if(kind==='w'){ box(a,y,b-a,t0,0,7*wallE); box(a,y,b-a,t0,17*wallE,4*wallE); }
        else box(a,y,b-a,t0,17*wallE,4*wallE); }
      box(cur,y,x1-cur,t0,0,H); };
    const wallY=(x,t0,y0,y1,opens)=>{ let cur=y0; for(const [a,b,kind] of opens){ box(x,cur,t0,a-cur,0,H); cur=b;
        if(kind==='w'){ box(x,a,t0,b-a,0,7*wallE); box(x,a,t0,b-a,17*wallE,4*wallE); }
        else box(x,a,t0,b-a,17*wallE,4*wallE); }
      box(x,cur,t0,y1-cur,0,H); };
    wallX(0,tE,0,180,[[20,50,'w'],[85,105,'w'],[135,165,'w']]);
    wallX(126,tE,0,180,[[30,60,'w'],[90,104,'d'],[120,160,'w']]);
    wallY(0,tE,4,126,[[80,110,'w']]);
    wallY(176,tE,4,126,[[20,50,'w'],[95,115,'w']]);
    box(70,4,tI,56,0,H);
    wallX(60,tI,4,72.5,[[50,62,'d']]);
    wallX(40,tI,72.5,120,[[88,98,'d']]);
    box(120,4,tI,38.5,0,H);
    wallY(120,tI,76,126,[[92,104,'d']]);
    box(122.5,76,53.5,tI,0,H);
    /* شیشه‌ها */
    if(gl>.01){ const G=`rgba(130,134,245,${.75*gl})`, GF=`rgba(120,124,240,${.14*gl})`, z0=7*wallE, z1=17*wallE;
      const gx=(y,a,b)=>v.add(a+y+.1,()=>{ v.poly([[a,y,z0],[b,y,z0],[b,y,z1],[a,y,z1]],GF,G,.6); v.pline([[(a+b)/2,y,z0],[(a+b)/2,y,z1]],G,.5); },[a,y-.3,z0,b,y+.3,z1]);
      const gy=(x,a,b)=>v.add(x+a+.1,()=>{ v.poly([[x,a,z0],[x,b,z0],[x,b,z1],[x,a,z1]],GF,G,.6); v.pline([[x,(a+b)/2,z0],[x,(a+b)/2,z1]],G,.5); },[x-.3,a,z0,x+.3,b,z1]);
      for(const [a,b] of [[20,50],[85,105],[135,165]]) gx(2,a,b); for(const [a,b] of [[30,60],[120,160]]) gx(128,a,b); gy(2,80,110); for(const [a,b] of [[20,50],[95,115]]) gy(178,a,b);
      /* درها: لنگه و قوس بازشو روی کف */
      const door=(hx,hy,r,a0,a1)=>v.add(hx+hy-1,()=>{ const pts=[]; for(let k=0;k<=12;k++){ const a=a0+(a1-a0)*k/12; pts.push([hx+Math.cos(a)*r,hy+Math.sin(a)*r,.3]); } v.c.globalAlpha=gl; v.pline(pts,'rgba(236,236,232,.55)',.6,[2,2]); v.pline([[hx,hy,.3],[hx+Math.cos(a1)*r,hy+Math.sin(a1)*r,.3]],S,1); v.c.globalAlpha=1; },[Math.min(hx,hx+r*Math.cos(a1))-r,hy-r,0,hx+r,hy+r,.4]);
      door(50,62.5,12,0,Math.PI/2); door(88,42.5,10,0,Math.PI/2); door(122.5,92,12,Math.PI/2,0); door(90,126,14,0,-Math.PI/2); }
    /* مبلمان */
    if(fu>.01){ const fb=(x,y,w,d,h,z=0)=>v.box({x,y,w,d,z,h,top:BG,rt:BG,fr:BG,st:`rgba(236,236,232,${.8*fu})`,lw:.6,a:1});
      fb(10,8,30,40,6); fb(10,8,30,8,3,6); fb(42,8,8,8,7); fb(58,6,10,30,16);
      fb(76,6,22,12,6); fb(106,8,7,10,6); fb(102,28,12,9,9);
      fb(150,6,24,9,11); fb(166,15,9,40,11); fb(132,40,24,12,11);
      fb(8,86,14,36,7); fb(8,86,5,36,7,7); fb(34,96,18,14,4); fb(4,64,3,10,10);
      fb(88,80,26,16,9); for(const [x,y] of [[90,74],[104,74],[90,98],[104,98]]) fb(x,y,7,5,5);
      fb(140,92,32,30,6); fb(140,92,32,8,3,6); fb(126,112,14,12,9);
      v.add(-500,()=>{ v.c.globalAlpha=fu; v.poly(v.rect(28,90,32,26,.2),null,'rgba(236,236,232,.35)',.5); v.poly(v.rect(30,92,28,22,.2),null,'rgba(236,236,232,.18)',.5); v.c.globalAlpha=1; },[28,90,0,60,116,.3]); }
  } }

};
