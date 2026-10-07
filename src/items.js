// Item definitions. dur = cue sheet duration in seconds. fs: full-screen opaque (mp4); otherwise alpha overlay (mov).
const ITEMS={};

ITEMS.MG01={name:'500-an-hour',fs:true,dur:4.50,build(st,c){
  const wrap=c.el('','center');
  const num=c.el('$500','num','font-size:220px');
  const lab=c.el('an hour','head','font-size:96px;margin-top:30px');
  wrap.append(num,lab);st.append(wrap);
  c.enter(num,0);c.enter(lab,0.45);
}};

ITEMS.MG09={name:'expert-witness-rates',fs:true,dur:16.27,build(st,c){
  const rows=[['Review','$450/hr',2.28],['Deposition','$500/hr',4.57],['Retainer','$3,000',12.17]];
  const wrap=c.el('','center','gap:44px;padding-right:160px');
  rows.forEach(([l,v,at])=>{
    const r=c.el('','','display:grid;grid-template-columns:620px 560px;align-items:end;column-gap:40px');
    const a=c.el(l,'head','font-size:96px;text-align:right;padding-bottom:6px');
    const bw=c.el('','','');
    const b=c.el(v,'num','font-size:150px');
    bw.append(b);r.append(a,bw);wrap.append(r);
    c.enter(r,at);
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

// Source cards: source name at top, one key line large, small credit bottom left.
const SC=(name,pre,key,post,dur,short)=>({name:short,fs:true,dur,build(st,c){
  const top=c.el(name,'head','position:absolute;left:0;right:0;top:150px;text-align:center;font-size:84px');
  const mark=c.el('','','position:absolute;left:-18px;right:-18px;top:14%;bottom:2%;background:#C9922E;opacity:.4;border-radius:10px;z-index:-1;transform-origin:left center;transform:scaleX(0)');
  const span=c.el(key,'money','display:inline-block;position:relative;isolation:isolate;font-weight:800');
  span.append(mark);
  const line=c.el('','center','font-size:130px;font-weight:700;text-align:center;line-height:1.2;padding-top:20px');
  line.append(document.createTextNode(pre),span,document.createTextNode(post));
  const src=c.el(`Source: ${name}`,'src');
  st.append(top,line,src);
  c.enter(top,0);c.enter(line,0.5);c.enter(src,1.0,{dy:20});
  c.custom(t=>{mark.style.transform=`scaleX(${easeOut((t-1.3)/0.6)})`;});
}});
ITEMS.SC03=SC('Social Security Administration','2026 limit: ','$24,480','',7.17,'ssa-earnings-limit');

// Excerpt source card: source name on top, the real quoted passage on a white card, key phrases picked out with a highlighter wipe.
// marks: [[phrase, seconds]]. Phrase must appear verbatim in the excerpt.
const EX=(name,excerpt,marks,dur,short,{size=50,tail=''}={})=>({name:short,fs:true,dur,build(st,c){
  const top=c.el(name,'head','position:absolute;left:0;right:0;top:110px;text-align:center;font-size:80px');
  const card=c.el('','card',`position:absolute;left:150px;right:150px;top:270px;padding:64px 72px;font-size:${size}px;line-height:1.5;font-weight:500;color:#1E2A3A`);
  let html=excerpt;const wipes=[];
  marks.forEach(([p,at],k)=>{html=html.replace(p,`<span class="mk" id="mk${k}" style="font-weight:700;padding:0 6px;margin:0 -6px;border-radius:8px;-webkit-box-decoration-break:clone;box-decoration-break:clone;background:linear-gradient(rgba(201,146,46,.4),rgba(201,146,46,.4)) no-repeat 0 55%/0% 88%">${p}</span>`);wipes.push([k,at]);});
  card.innerHTML=html+(tail?`<div style="margin-top:36px;font-size:72px;font-weight:700">${tail}</div>`:'');
  const src=c.el(`Source: ${name}`,'src');
  st.append(top,card,src);
  c.enter(top,0);c.enter(card,0.3,{dy:30});c.enter(src,0.9,{dy:20});
  wipes.forEach(([k,at])=>{const m=card.querySelector('#mk'+k);c.custom(t=>{m.style.backgroundSize=`${easeOut((t-at)/0.6)*100}% 88%`;});});
  const tm=card.querySelector('#mkT');if(tm)c.custom(t=>{tm.style.transform=`scaleX(${easeOut((t-2.6)/0.6)})`;});
}});
ITEMS.SC02=EX('SEAK Expert Witness Fee Survey','This summary report has been prepared to provide the reader with expert witness fee and billing information using a large sample size (over 1,600 experts, many of whom had more than one area of expertise). All survey information was provided by the responding experts in January &amp; February of 2024.',[['over 1,600 experts',1.2]],3.83,'seak-survey');

ITEMS.SC08=EX('University of Vermont',"UVM's End-of-Life Doula training will guide you in providing emotional, spiritual, and physical support at the end of life.",[['End-of-Life Doula training',1.2]],11.87,'uvm-doula-certificate',{size:60,tail:'End-of-life doula certificate: <span class="money" style="font-weight:800;position:relative;isolation:isolate">$895<i id="mkT" style="position:absolute;left:-10px;right:-10px;top:8%;bottom:0;background:#C9922E;opacity:.4;border-radius:8px;z-index:-1;transform-origin:left center;transform:scaleX(0)"></i></span>'});
ITEMS.SC09=EX('Texas Department of Insurance','You can apply for a 90-day emergency adjuster license during a disaster.',[['90-day emergency adjuster license',1.4]],10.83,'tdi-emergency-adjuster',{size:72});
