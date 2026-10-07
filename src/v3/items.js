// Style 3: Studio Light. Light grey studio background, deep ink type, emerald money, amber key word marker.
// Cinematic touches: focus pull entrances, long soft easing, parallax depth, real motion blur and a colour grade (applied by render.mjs).
const ITEMS={};

ITEMS.MG01={name:'500-an-hour',fs:true,dur:4.50,build(st,c){
  const wrap=c.el('','abs','inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px');
  const num=c.el('$0','num','font-size:470px');
  const lab=c.el('an <span class="kw">hour</span>','head','font-size:170px');
  wrap.append(num,lab);st.append(wrap);
  c.rise(num,0,{dy:120,blur:26,s:1.06});c.count(num,0,0,500,n=>'$'+n,1.5);c.words(lab,0.75,0.14);
}};

ITEMS.MG09={name:'expert-witness-rates',fs:true,dur:16.27,build(st,c){
  const wrap=c.el('','abs','left:170px;right:170px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:40px');
  [['Review','$450/hr',2.28],['Deposition','$500/hr',4.57],['Retainer','$3,000',12.17]].forEach(([l,v,at])=>{
    const r=c.el('','card','display:flex;align-items:center;justify-content:space-between;padding:36px 80px');
    r.append(c.el(l,'head','font-size:104px'),c.el(v,'num','font-size:160px'));
    wrap.append(r);c.rise(r,at,{dy:140,blur:22,dur:1.0});
  });
  st.append(wrap);
}};

ITEMS.SC02={name:'seak-survey',fs:true,dur:3.83,build(st,c){
  const top=c.el('SEAK Expert Witness Fee Survey','head','position:absolute;left:0;right:0;top:90px;text-align:center;font-size:82px');
  const card=c.el('This summary report has been prepared to provide the reader with expert witness fee and billing information using a large sample size (<span class="kw" style="font-weight:800">over 1,600 experts</span>, many of whom had more than one area of expertise). All survey information was provided by the responding experts in January &amp; February of 2024.','card','position:absolute;left:150px;right:150px;top:250px;padding:64px 76px;font-size:52px;line-height:1.5;font-weight:500');
  const src=c.el('Source: SEAK Expert Witness Fee Survey','src');
  st.append(top,card,src);
  c.words(top,0,0.08);c.rise(card,0.3,{dy:110,blur:16});c.rise(src,0.9,{dy:30,blur:8});
  c.wipe(card.querySelector('.kw'),1.2);
}};

ITEMS.MG28={name:'subscribe-button',fs:false,dur:7.67,build(st,c){
  const panel=c.el('','abs card','left:80px;top:872px;width:640px;height:164px;border-radius:32px;display:flex;align-items:center;padding-left:40px');
  const btn=c.el('Subscribe','','background:#0B1220;color:#FFFFFF;font-weight:800;font-size:58px;padding:22px 60px;border-radius:60px');
  panel.append(btn);st.append(panel);c.rise(panel,0.2,{dy:100,blur:14});
  c.custom(t=>{const k=clamp((t-3.2)/0.5);btn.style.transform=`scale(${(1-Math.sin(Math.PI*clamp((t-3.2)/0.4))*0.06).toFixed(4)})`;
    btn.style.background=k<0.5?'#0B1220':'#FFB400';btn.style.color=k<0.5?'#FFFFFF':'#0B1220';});
}};

ITEMS.SS01={name:'scotty',fs:false,dur:6.33,build(st,c,it){
  const s=2,w=778,h=177,W=w*s,H=h*s;
  const card=c.el('','abs card',`left:${(1920-W-72)/2}px;top:${(1080-H-72)/2}px;width:${W+72}px;height:${H+72}px;padding:36px;overflow:hidden`);
  const inner=c.el('','','position:relative;width:100%;height:100%;overflow:hidden');
  const img=new Image();img.src='../../screenshots/SS01_scotty_channel.png';img.style.cssText=`width:${W}px;height:${H}px;display:block`;
  const cover=c.el('','abs',`left:${242*s}px;top:${120*s}px;right:0;bottom:0;background:#fff`);
  const hl=c.el('','abs',`left:${243*s}px;top:${50*s}px;width:${96*s}px;height:${18*s+2}px;background:#FFB400;opacity:.8;mix-blend-mode:multiply;border-radius:6px;transform-origin:left;transform:scaleX(0)`);
  inner.append(img,cover,hl);card.append(inner);
  const wrap=c.el('','abs','inset:0');wrap.append(card);st.append(wrap);
  c.rise(card,0.1,{dy:130,blur:20,dur:1.0});
  c.custom(t=>{const p=Math.min(1,Math.max(0,(t-1.5)/0.7));hl.style.transform=`scaleX(${(1-Math.pow(1-p,3)).toFixed(4)})`;wrap.style.transform=`scale(${(1+0.06*clamp(t/it.dur)).toFixed(4)})`;});
}};
