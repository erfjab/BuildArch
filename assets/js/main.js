/* استودیو جباری — رندر محتوا در صفحه، راه‌اندازی صحنه‌ها، اسکرول و تعامل‌ها
   این فایل بخشی از سایت است؛ ترتیب بارگذاری در index.html مهم است: content → engine → scenes → main */

/* ============ رندر محتوا ============ */
const C = F.contact, RC = F.record;
/* عدد شمارنده: یک نسخه‌ی نامرئی از عدد نهایی عرض را ثابت نگه می‌دارد تا عدد هنگام شمارش جابه‌جا نشود */
const cnt = n => `<span class="cw"><span class="gh" aria-hidden="true">${fa(n)}</span><span class="cnt" data-n="${n}">${fa(n)}</span></span>`;
$('#hero-sub').textContent = F.intro;
$('#about-h').textContent = F.aboutHead;
$('#about-lead').textContent = F.aboutLead;
$('#story-y').textContent = F.since;
$('#about-pr').innerHTML = F.principles.map(p=>`<li><span class="kw">${p.k}</span><b>${p.h}</b><p>${p.p}</p></li>`).join('');
$('#bento').innerHTML = `
  <div class="rc-main rv"><p class="rc-k">سابقه</p><p class="rc-big">${cnt(RC.years.n)}</p><div class="rc-cap"><b>${RC.years.l}</b><span>${RC.years.s}</span></div></div>
  <ul class="rc-list rv">
    <li><p class="rc-n">${cnt(RC.projects.n)}${RC.projects.plus?'<i>+</i>':''}</p><div><b>${RC.projects.l}</b><span>${RC.projects.s}</span></div></li>
    <li><p class="rc-n">${cnt(RC.built.n)}</p><div><b>${RC.built.l}</b><span>${RC.built.s}</span></div></li>
    <li><p class="rc-n">${cnt(RC.cities.n)}</p><div><b>${RC.cities.l}</b><span>${RC.cities.s}</span></div></li>
  </ul>
  <div class="rc-band rv"><div class="iso" data-art="plan"></div><div class="rc-bt"><p class="rc-k">${RC.area.l}</p><p class="st">${RC.area.st[0]} <mark>${RC.area.st[1]}</mark></p><p class="note">${RC.area.note}</p><p class="rc-area">${RC.area.n}<small>${RC.area.u}</small></p></div></div>`;
$('#svc').innerHTML = F.services.map((s,i)=>`<button type="button" class="svc-it${i?'':' on'}" data-i="${i}"><h3>${s.t}</h3><p>${s.d}</p></button>`).join('');
$('#pj').innerHTML = F.projects.map(p=>`<div class="pj-row rv"><span class="y">${p.y}</span><h3>${p.t}</h3><span class="c">${p.c}</span><span class="ct">${p.city}</span><span class="a">${p.a} م²</span></div>`).join('');
const fd = F.founder;
$('#founder').innerHTML = `<div class="tx"><p class="role">${fd.r}</p><h3>${fd.n}</h3><blockquote>${fd.q}</blockquote><div class="yrs">${fd.yrs.map(y=>`<div><b>${y[0]}</b>${y[1]}</div>`).join('')}</div></div>`;
$('#crew').innerHTML = F.team.map(t=>`<article class="rv"><h4>${t.n}</h4><p>${t.r}</p><small>${t.y}</small></article>`).join('');
$('#fph').innerHTML = C.phones.map(p=>`<li>${fa(p)}</li>`).join('');
$('#addr').textContent = C.addr;
$('#maps').innerHTML = 'مسیریابی با ' + [['نشان',`https://neshan.org/maps/@${C.lat},${C.lng},16z,0p`],['بلد',`https://balad.ir/location?latitude=${C.lat}&longitude=${C.lng}&zoom=16`],['گوگل‌مپ',`https://www.google.com/maps?q=${C.lat},${C.lng}`]].map(([n,u])=>`<a href="${u}" target="_blank" rel="noopener">${n}</a>`).join(' · ');
$('#apps').innerHTML = C.apps.map(a=>`<a href="${a.u}" target="_blank" rel="noopener" aria-label="${a.n}" title="${a.n}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${LOGO[a.k]}</svg></a>`).join('');
$('#handle').textContent = C.handle;

/* ============ صحنه‌ها ============ */
const hero = new Iso($('#iso-hero'), sceneHero());
document.querySelectorAll('[data-art]').forEach(el=>new Iso(el, ART[el.dataset.art]));
const svcIso = new Iso($('#iso-svc'), SVC[F.services[0].s]());
let svcI=0, svcTimer=0, svcHold=false;
const svcItems=[...document.querySelectorAll('.svc-it')];
function setSvc(i){ if(i===svcI) return; svcI=i; svcItems.forEach((b,k)=>b.classList.toggle('on',k===i));
  const box=$('#iso-svc'); box.classList.add('fade'); setTimeout(()=>{ svcIso.setScene(SVC[F.services[i].s]()); box.classList.remove('fade'); }, RM?0:320); }
svcItems.forEach((b,i)=>{ b.addEventListener('mouseenter',()=>{ svcHold=true; setSvc(i); }); b.addEventListener('focus',()=>{ svcHold=true; setSvc(i); }); b.addEventListener('click',()=>setSvc(i)); });
$('#svc').addEventListener('mouseleave',()=>{ svcHold=false; svcTimer=0; });
setInterval(()=>{ if(svcHold||RM||!svcIso.vis) return; if(++svcTimer>=6){ svcTimer=0; setSvc((svcI+1)%svcItems.length); } },1000);

let last=performance.now();
function loop(now){ const dt=Math.min(.05,(now-last)/1000); last=now; if(!document.hidden) for(const v of ISOS) if(v.vis && v.scene.live){ v.t+=dt; v.draw(); } requestAnimationFrame(loop); }

/* ============ اسکرول ============
   اسکرول بومی مرورگر (بدون کتابخانه‌ی اسکرول نرم) تا سریع و بدون تأخیر باشد.
   هیچ اندازه‌گیری‌ای در رویداد اسکرول انجام نمی‌شود؛ ظاهرشدن، شمارنده‌ها و رنگ هدر با IntersectionObserver. */
const hd=$('#hd');
const counted=new WeakSet();
function countUp(el){ if(counted.has(el)) return; counted.add(el); if(RM) return; const n=+el.dataset.n, t0=performance.now();
  const st=now=>{ const p=clamp((now-t0)/1500), e=1-Math.pow(1-p,3); el.textContent=fa(Math.round(n*e)); if(p<1) requestAnimationFrame(st); }; el.textContent=fa(0); requestAnimationFrame(st); }
if(!RM){
  const rvIO=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.remove('pre'); rvIO.unobserve(e.target); } }),{rootMargin:'0px 0px -10% 0px'});
  document.querySelectorAll('.rv').forEach(el=>{ if(el.getBoundingClientRect().top>innerHeight){ el.classList.add('pre'); rvIO.observe(el); } });
  const cIO=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ countUp(e.target); cIO.unobserve(e.target); } }),{rootMargin:'-15% 0px -15% 0px'});
  document.querySelectorAll('.cnt').forEach(el=>cIO.observe(el));
}
/* هدر روی بخش‌های تیره (data-dark) تیره می‌شود: یک خط یک‌پیکسلی در میانه‌ی هدر را می‌پاییم */
const onDark=new Set(); let dIO=null;
function watchDark(){ if(dIO) dIO.disconnect(); onDark.clear(); const hh=Math.round(hd.offsetHeight/2);
  dIO=new IntersectionObserver(es=>{ es.forEach(e=>e.isIntersecting?onDark.add(e.target):onDark.delete(e.target)); hd.classList.toggle('dark',onDark.size>0); },{rootMargin:'-'+hh+'px 0px -'+Math.max(0,innerHeight-hh-1)+'px 0px'});
  document.querySelectorAll('[data-dark]').forEach(el=>dIO.observe(el)); }
watchDark(); let rT=0; addEventListener('resize',()=>{ clearTimeout(rT); rT=setTimeout(watchDark,200); });
let solid=null; const onScroll=()=>{ const s=scrollY>30; if(s!==solid){ solid=s; hd.classList.toggle('solid',s); } };
addEventListener('scroll',onScroll,{passive:true}); onScroll();
document.querySelectorAll('.go[data-to]').forEach(b=>b.addEventListener('click',()=>{
  const t=b.dataset.to==='top'?null:document.getElementById(b.dataset.to), bh=RM?'auto':'smooth';
  t?t.scrollIntoView({behavior:bh}):scrollTo({top:0,behavior:bh});
}));
if(!RM) requestAnimationFrame(loop);
