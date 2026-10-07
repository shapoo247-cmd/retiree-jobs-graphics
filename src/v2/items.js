// Style 2: bold modern edit (high contrast on near black, heavy type, word by word pop in, yellow keyword boxes, slow camera push). No sound.
const ITEMS={};

ITEMS.MG01={name:'500-an-hour',fs:true,dur:4.50,build(st,c){
  const wrap=c.el('','abs','inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px');
  const num=c.el('$0','num','font-size:470px');
  const lab=c.el('an <span class="kw">hour</span>','head','font-size:170px');
  wrap.append(num,lab);st.append(wrap);
  c.enter(num,0,{dy:30});c.count(num,0,0,500,n=>'$'+n,1.1);c.pop(lab,0.6);
}};

ITEMS.MG09={name:'expert-witness-rates',fs:true,dur:16.27,build(st,c){
  const wrap=c.el('','abs','left:170px;right:170px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:36px');
  [['Review','$450/hr',2.28],['Deposition','$500/hr',4.57],['Retainer','$3,000',12.17]].forEach(([l,v,at])=>{
    const r=c.el('','glass','display:flex;align-items:center;justify-content:space-between;padding:34px 70px');
    const a=c.el(l,'head','font-size:104px');const b=c.el(v,'num','font-size:160px');
    r.append(a,b);wrap.append(r);c.enter(r,at,{dy:50});
  });
  st.append(wrap);
}};

ITEMS.SC02={name:'seak-survey',fs:true,dur:3.83,build(st,c){
  const top=c.el('SEAK Expert Witness Fee Survey','head','position:absolute;left:0;right:0;top:90px;text-align:center;font-size:82px');
  const card=c.el('This summary report has been prepared to provide the reader with expert witness fee and billing information using a large sample size (<span class="kw" style="font-weight:800">over 1,600 experts</span>, many of whom had more than one area of expertise). All survey information was provided by the responding experts in January &amp; February of 2024.','glass','position:absolute;left:150px;right:150px;top:250px;padding:64px 76px;font-size:52px;line-height:1.5;font-weight:500;color:#EDEDED');
  const src=c.el('Source: SEAK Expert Witness Fee Survey','src');
  st.append(top,card,src);
  c.pop(top,0,0.07);c.enter(card,0.3,{dy:50});c.enter(src,0.9,{dy:20});
  // keyword box wipes in on cue, after the card is up
  const k=card.querySelector('.kw');c.custom(t=>{k.style.backgroundSize=`${easeOut((t-1.2)/0.5)*100}% 100%`;});
}};

ITEMS.MG28={name:'subscribe-button',fs:false,dur:7.67,build(st,c){
  const panel=c.el('','abs','left:80px;top:872px;width:640px;height:164px;background:#0A0A0A;border:2px solid #2C2C2C;border-radius:36px;display:flex;align-items:center;padding-left:40px');
  const btn=c.el('Subscribe','','background:#FFD60A;color:#0A0A0A;font-weight:900;font-size:60px;padding:22px 60px;border-radius:60px');
  panel.append(btn);st.append(panel);c.enter(panel,0.2,{dy:60});
  c.custom(t=>{const k=clamp((t-3.2)/0.5);btn.style.transform=`scale(${1-Math.sin(Math.PI*clamp((t-3.2)/0.4))*0.06})`;
    btn.style.background=k<0.5?'#FFD60A':'#FFFFFF';});
}};

ITEMS.SS01={name:'scotty',fs:false,dur:6.33,build(st,c,it){
  const s=2,w=778,h=177,W=w*s,H=h*s;
  const card=c.el('','abs',`left:${(1920-W-72)/2}px;top:${(1080-H-72)/2}px;width:${W+72}px;height:${H+72}px;padding:36px;overflow:hidden;background:#fff;border-radius:32px;box-shadow:0 14px 44px rgba(0,0,0,.28)`);
  const inner=c.el('','','position:relative;width:100%;height:100%;overflow:hidden');
  const img=new Image();img.src='../../screenshots/SS01_scotty_channel.png';img.style.cssText=`width:${W}px;height:${H}px;display:block`;
  const cover=c.el('','abs',`left:${242*s}px;top:${120*s}px;right:0;bottom:0;background:#fff`);
  const hl=c.el('','abs',`left:${243*s}px;top:${50*s}px;width:${96*s}px;height:${18*s+2}px;background:#FFD60A;opacity:.85;mix-blend-mode:multiply;border-radius:6px;transform-origin:left;transform:scaleX(0)`);
  inner.append(img,cover,hl);card.append(inner);
  const wrap=c.el('','abs','inset:0');wrap.append(card);st.append(wrap);
  c.custom(t=>{const p=easeOut((t-0.1)/0.6);card.style.opacity=p;card.style.transform=`translateY(${(1-p)*60}px) scale(${0.95+0.05*p})`;
    hl.style.transform=`scaleX(${easeOut((t-1.5)/0.6)})`;wrap.style.transform=`scale(${1+0.06*clamp(t/it.dur)})`;});
}};
