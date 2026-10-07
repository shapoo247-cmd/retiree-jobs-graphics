// Item definitions. dur = cue sheet duration in seconds. fs: full-screen opaque (mp4); otherwise alpha overlay (mov).
const ITEMS={};

ITEMS.MG01={name:'500-an-hour',fs:true,dur:4.50,build(st,c){
  const wrap=c.el('','center');
  const num=c.el('$500','num','font-size:220px');
  const bar=c.el('','bar','width:420px;margin:22px 0 34px');
  const lab=c.el('an hour','head','font-size:96px');
  wrap.append(num,bar,lab);st.append(wrap);
  c.enter(num,0);c.bar(bar,0.5);c.enter(lab,0.45);
}};

ITEMS.MG09={name:'expert-witness-rates',fs:true,dur:16.27,build(st,c){
  const rows=[['Review','$450/hr',2.28],['Deposition','$500/hr',4.57],['Retainer','$3,000',12.17]];
  const wrap=c.el('','center','gap:44px;padding-right:160px');
  rows.forEach(([l,v,at])=>{
    const r=c.el('','','display:grid;grid-template-columns:620px 560px;align-items:end;column-gap:40px');
    const a=c.el(l,'head','font-size:96px;text-align:right;padding-bottom:6px');
    const bw=c.el('','','');
    const b=c.el(v,'num','font-size:150px');
    const bar=c.el('','bar','width:100%;margin-top:14px');
    bw.append(b,bar);r.append(a,bw);wrap.append(r);
    c.enter(r,at);c.bar(bar,at+0.5);
  });
  st.append(wrap);
}};

ITEMS.MG28={name:'subscribe-button',fs:false,dur:7.67,build(st,c){
  const panel=c.el('','abs card-lt','left:80px;top:872px;width:640px;height:164px;background:#F7F3EC;border-radius:24px;box-shadow:0 8px 30px rgba(30,42,58,.10);display:flex;align-items:center;padding-left:40px');
  const btn=c.el('Subscribe','','background:#1E2A3A;color:#F7F3EC;font-weight:700;font-size:56px;padding:22px 56px;border-radius:60px;transform-origin:center');
  panel.append(btn);st.append(panel);
  c.enter(panel,0.2,{dy:40});
  // calm press at 3.2s: slight scale dip, fill shifts to highlight gold
  c.custom(t=>{
    const k=clamp((t-3.2)/0.5);const press=Math.sin(Math.PI*clamp((t-3.2)/0.4))*0.05;
    btn.style.transform=`scale(${1-press})`;
    btn.style.background=k<0.5?'#1E2A3A':'#C9922E';
    btn.style.color=k<0.5?'#F7F3EC':'#1E2A3A';
  });
}};

// Screenshot cards
const SS=(file,coverX,coverY,box)=>({fs:false,build(st,c,it){
  const W=Math.round(it.w*2),H=Math.round(it.h*2);
  const card=c.el('','abs card',`left:${(1920-W-72)/2}px;top:${(1080-H-72)/2}px;width:${W+72}px;height:${H+72}px;padding:36px;overflow:hidden`);
  const inner=c.el('','','position:relative;width:100%;height:100%');
  const img=new Image();img.src='../screenshots/'+file;img.style.cssText=`width:${W}px;height:${H}px;display:block`;
  const cover=c.el('','abs',`left:${coverX*2}px;top:${coverY*2}px;right:0;bottom:0;background:#fff`);
  // highlighter marker: translucent gold wipes left to right over the text
  const hl=c.el('','abs',`left:${box[0]*2}px;top:${box[1]*2}px;width:${box[2]*2}px;height:${box[3]*2+2}px;background:#C9922E;opacity:.7;mix-blend-mode:multiply;border-radius:6px;transform-origin:left center;transform:scaleX(0)`);
  inner.append(img,cover,hl);card.append(inner);
  const wrap=c.el('','abs','inset:0;transform-origin:50% 50%');wrap.append(card);st.append(wrap);
  c.enter(card,0.1);
  c.custom(t=>{hl.style.transform=`scaleX(${easeOut((t-it.hlAt)/0.7)})`;wrap.style.transform=`scale(${1+0.06*clamp(t/it.dur)})`;});
}});
ITEMS.SS01={name:'scotty',...SS('SS01_scotty_channel.png',242,120,[243,50,96,18]),dur:6.33,w:778,h:177,hlAt:1.5};
