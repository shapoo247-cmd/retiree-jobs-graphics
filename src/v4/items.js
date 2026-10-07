// Style 4: Creator UI (after the Kallaway look): violet black gradient, frosted glass cards with glowing edges, typewriter text with a cursor,
// pop in cards, number counters, mouse cursor demos, motion blur and a colour grade (applied by render.mjs).
const ITEMS={};

ITEMS.MG01={name:'500-an-hour',fs:true,dur:4.50,build(st,c){
  const wrap=c.el('','abs','inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:50px');
  const pill=c.el('','glass','padding:30px 110px 44px;text-align:center');
  const num=c.el('$0','num','font-size:420px');
  pill.append(num);
  const lab=c.el('an <span style="color:#FACC15">hour</span>','head','font-size:170px');
  wrap.append(pill,lab);st.append(wrap);
  c.pop(pill,0,{dy:70,from:0.8});c.count(num,0.1,0,500,n=>'$'+n,1.5);c.float(pill,0,5);c.pop(lab,0.8,{dy:40,from:0.9});
}};

ITEMS.MG09={name:'expert-witness-rates',fs:true,dur:16.27,build(st,c){
  const wrap=c.el('','abs','left:170px;right:170px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:44px');
  [['Review','$450/hr',2.28],['Deposition','$500/hr',4.57],['Retainer','$3,000',12.17]].forEach(([l,v,at],i)=>{
    const r=c.el('','glass','display:flex;align-items:center;justify-content:space-between;padding:34px 80px');
    r.append(c.el(l,'head','font-size:104px'),c.el(v,'num','font-size:160px'));
    wrap.append(r);c.pop(r,at,{dy:90,from:0.9});c.float(r,i*1.7,4);
  });
  st.append(wrap);
}};

ITEMS.SC02={name:'seak-survey',fs:true,dur:3.83,build(st,c){
  const top=c.el('SEAK Expert Witness Fee Survey','head','position:absolute;left:0;right:0;top:90px;text-align:center;font-size:82px');
  const card=c.el('This summary report has been prepared to provide the reader with expert witness fee and billing information using a large sample size (<span class="kw" style="font-weight:800">over 1,600 experts</span>, many of whom had more than one area of expertise). All survey information was provided by the responding experts in January &amp; February of 2024.','glass','position:absolute;left:150px;right:150px;top:250px;padding:64px 76px;font-size:52px;line-height:1.5;font-weight:500');
  const src=c.el('Source: SEAK Expert Witness Fee Survey','src');
  st.append(top,card,src);
  c.pop(top,0,{dy:30,from:0.94});c.pop(card,0.2,{dy:60,from:0.94});
  c.type(card,0.5,1.4);c.pop(src,0.9,{dy:20,from:0.96});c.wipe(card.querySelector('.kw'),1.2);
}};

ITEMS.MG28={name:'subscribe-button',fs:false,dur:7.67,build(st,c){
  const panel=c.el('','abs glass','left:80px;top:872px;width:680px;height:164px;border-radius:32px;display:flex;align-items:center;padding-left:44px');
  const btn=c.el('Subscribe','','background:#A855F7;color:#fff;font-weight:800;font-size:60px;padding:22px 64px;border-radius:60px;box-shadow:0 0 30px rgba(168,85,247,.6)');
  panel.append(btn);
  const cur=c.el('<svg width="70" height="70" viewBox="0 0 24 24"><path d="M5 2l14 9-6 1.5L16 20l-3 1-3-7.5L5 17z" fill="#fff" stroke="#09040F" stroke-width="1.2" stroke-linejoin="round"/></svg>','abs','left:0;top:0');
  st.append(panel,cur);c.pop(panel,0.2,{dy:70,from:0.92});
  // mouse cursor glides to the button, presses, button turns green
  c.custom(t=>{t=tq(t);const m=expo((t-1.6)/1.3);const x=1000-(1000-330)*m,y=760+(955-760)*m-Math.sin(Math.PI*m)*60;
    cur.style.opacity=clamp((t-1.4)/0.3)*(t<5.8?1:clamp(1-(t-5.8)/0.4));cur.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    const press=Math.sin(Math.PI*clamp((t-3.1)/0.35));const done=t>3.25;
    btn.style.transform=`scale(${(1-press*0.06).toFixed(4)})`;btn.style.background=done?'#22C55E':'#A855F7';btn.style.boxShadow=done?'0 0 34px rgba(34,197,94,.65)':'0 0 30px rgba(168,85,247,.6)';});
}};

ITEMS.SS01={name:'scotty',fs:false,dur:6.33,build(st,c,it){
  const s=2,w=778,h=177,W=w*s,H=h*s;
  const persp=c.el('','abs','inset:0;perspective:1800px');
  const card=c.el('','abs',`left:${(1920-W-72)/2}px;top:${(1080-H-72)/2}px;width:${W+72}px;height:${H+72}px;padding:36px;overflow:hidden;background:#fff;border-radius:32px;border:3px solid #C084FC;box-shadow:0 0 30px rgba(168,85,247,.6),0 0 90px rgba(124,58,237,.35)`);
  const inner=c.el('','','position:relative;width:100%;height:100%;overflow:hidden');
  const img=new Image();img.src='../../screenshots/SS01_scotty_channel.png';img.style.cssText=`width:${W}px;height:${H}px;display:block`;
  const cover=c.el('','abs',`left:${242*s}px;top:${120*s}px;right:0;bottom:0;background:#fff`);
  const hl=c.el('','abs',`left:${243*s}px;top:${50*s}px;width:${96*s}px;height:${18*s+2}px;background:#FACC15;opacity:.8;mix-blend-mode:multiply;border-radius:6px;transform-origin:left;transform:scaleX(0)`);
  inner.append(img,cover,hl);card.append(inner);persp.append(card);st.append(persp);
  c.custom(t=>{t=tq(t);const p=expo((t-0.1)/1.1);card.style.opacity=clamp(p*2.2);card.style.filter=p<1?`blur(${((1-p)*14).toFixed(2)}px)`:'none';
    card.style.transform=`translateY(${((1-p)*80).toFixed(2)}px) rotateX(${((1-p)*14).toFixed(2)}deg) rotateY(${((1-p)*-10).toFixed(2)}deg) scale(${(1+0.06*clamp(t/it.dur)).toFixed(4)})`;
    hl.style.transform=`scaleX(${expo((t-1.6)/0.7).toFixed(4)})`;});
}};
