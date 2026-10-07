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

// Screenshot cards. crop=[x,y,w,h] region of the PNG to show; covers hide extension buttons; box=[x,y,w,h] highlighter target. All in source pixels.
const SS=(file,{crop,covers,box,scale=2,w,h,dur,hlAt,name})=>({name,fs:false,dur,build(st,c,it){
  const [cx,cy,cw,ch]=crop||[0,0,w,h];const s=scale;
  const W=Math.round(cw*s),H=Math.round(ch*s);
  const card=c.el('','abs card',`left:${(1920-W-72)/2}px;top:${(1080-H-72)/2}px;width:${W+72}px;height:${H+72}px;padding:36px;overflow:hidden`);
  const inner=c.el('','','position:relative;width:100%;height:100%;overflow:hidden');
  const img=new Image();img.src='../screenshots/'+file;img.style.cssText=`position:absolute;left:${-cx*s}px;top:${-cy*s}px;width:${w*s}px;height:${h*s}px`;
  inner.append(img);
  (covers||[]).forEach(([x,y,cw2,ch2])=>inner.append(c.el('','abs',`left:${(x-cx)*s}px;top:${(y-cy)*s}px;width:${(cw2??4000)*s}px;height:${(ch2??4000)*s}px;background:#fff`)));
  // highlighter marker: translucent gold wipes left to right over the text
  const hl=c.el('','abs',`left:${(box[0]-cx)*s}px;top:${(box[1]-cy)*s}px;width:${box[2]*s}px;height:${box[3]*s+2}px;background:#C9922E;opacity:.7;mix-blend-mode:multiply;border-radius:6px;transform-origin:left center;transform:scaleX(0)`);
  inner.append(hl);card.append(inner);
  const wrap=c.el('','abs','inset:0;transform-origin:50% 50%');wrap.append(card);st.append(wrap);
  c.enter(card,0.1);
  c.custom(t=>{hl.style.transform=`scaleX(${easeOut((t-hlAt)/0.7)})`;wrap.style.transform=`scale(${1+0.06*clamp(t/dur)})`;});
}});
ITEMS.SS01=SS('SS01_scotty_channel.png',{name:'scotty',w:778,h:177,dur:6.33,hlAt:1.5,covers:[[242,120]],box:[243,50,96,18]});
ITEMS.SS02=SS('SS02_chef_jp_channel.png',{name:'chef-jean-pierre',w:736,h:167,dur:6.40,hlAt:1.5,covers:[[243,120]],box:[257,46,97,18]});
ITEMS.SS03=SS('SS03_clearvalue_channel.png',{name:'clearvalue-tax',w:675,h:163,dur:7.03,hlAt:1.5,covers:[[245,120]],box:[276,46,89,18]});
ITEMS.SS04=SS('SS04_julie_channel.png',{name:'hospice-nurse-julie',w:751,h:160,dur:6.80,hlAt:1.5,covers:[[247,116]],box:[275,42,90,18]});
ITEMS.SS05=SS('SS05_julie_dementia_video.png',{name:'dementia-video',w:1257,h:889,dur:7.53,hlAt:1.5,scale:1.4,crop:[22,700,1230,189],covers:[[249,727,36,30]],box:[28,826,54,17]});
ITEMS.SS06=SS('SS06_adjuster_tv.png',{name:'adjuster-tv',w:721,h:163,dur:8.03,hlAt:1.5,scale:1.8,covers:[[244,118]],box:[239,42,92,18]});
// Source cards: source name at top, one key line large, small credit bottom left.

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

// Script based source card: source name on top, the key line large with a highlighter wipe, supporting lines from the script entering one at a time.
const HL=(txt,cls='')=>`<span class="${cls}" data-hl style="padding:0 10px;margin:0 -10px;border-radius:10px;-webkit-box-decoration-break:clone;box-decoration-break:clone;background:linear-gradient(rgba(201,146,46,.4),rgba(201,146,46,.4)) no-repeat 0 55%/0% 88%;font-weight:800">${txt}</span>`;
const SK=(name,key,support,dur,short,{hlAt=1.3,sAt=[2.2,3.1]}={})=>({name:short,fs:true,dur,build(st,c){
  const top=c.el(name,'head','position:absolute;left:0;right:0;top:110px;text-align:center;font-size:80px');
  const card=c.el('','card','position:absolute;left:150px;right:150px;top:270px;padding:70px 80px');
  const k=c.el(key,'','font-size:92px;font-weight:700;line-height:1.2;color:#1E2A3A');
  card.append(k);
  const sups=support.map(s=>{const d=c.el(s,'','font-size:52px;font-weight:500;line-height:1.35;color:#1E2A3A;margin-top:34px');card.append(d);return d;});
  const src=c.el(`Source: ${name}`,'src');
  st.append(top,card,src);
  c.enter(top,0);c.enter(card,0.3,{dy:30});c.enter(src,0.9,{dy:20});
  sups.forEach((d,i)=>c.enter(d,sAt[i]??sAt[sAt.length-1]+i*0.8,{dy:24}));
  card.querySelectorAll('[data-hl]').forEach(m=>c.custom(t=>{m.style.backgroundSize=`${easeOut((t-hlAt)/0.6)*100}% 88%`;}));
}});
const G=t=>HL(t,'money');
ITEMS.SC03=SK('Social Security Administration',`2026 limit: ${G('$24,480')}`,['Under full retirement age','Holds back $1 for every $2 earned over the limit'],7.17,'ssa-earnings-limit');
ITEMS.SC01=SK('Fox News',`Made more in ${HL('one month')} than in 40 years`,['Scotty Kilmer: around <span class="money" style="font-weight:800">$24 million</span> explaining what he already knew'],6.37,'fox-news-scotty',{sAt:[2.4]});
ITEMS.SC04=SK('Thumbtack',`Handyman: about ${G('$60 an hour')}`,['Higher end jobs: <span class="money" style="font-weight:800">$100 to $125</span> an hour'],9.6,'thumbtack-handyman',{sAt:[2.4]});
ITEMS.SC05=SK('FINRA',HL('No legal or securities experience')+' required',['The regulator for every brokerage in America'],3.53,'finra-no-experience',{hlAt:0.9,sAt:[1.8]});
ITEMS.SC07=SK('H&amp;R Block',`Income tax course: ${HL('no tuition')}`,['Materials cost about <span class="money" style="font-weight:800">$149</span>','Around 40 hours'],11.4,'hrblock-tax-course',{sAt:[2.6,3.6]});
ITEMS.SC10=SK('ProPublica',`New York short of guardians for ${HL('30,000 people')}`,['Roughly 30,000 people who need one'],7.2,'propublica-guardians',{sAt:[2.4]});
ITEMS.SC11=SK('Estate sale industry survey',`Average commission: ${HL('40%')}`,['774 estate sale companies surveyed'],8.4,'estate-sale-commission',{sAt:[2.4]});

// SC06: build card, one row per spoken phrase
ITEMS.SC06={name:'finra-pay',fs:true,dur:9.40,build(st,c){
  const top=c.el('FINRA','head','position:absolute;left:0;right:0;top:110px;text-align:center;font-size:80px');
  const card=c.el('','card','position:absolute;left:150px;right:150px;top:270px;padding:60px 80px;display:flex;flex-direction:column;gap:34px');
  const rows=[['$600','a day',0],['$850','as chair',2.32],['$300','prehearing call',4.70]];
  rows.forEach(([v,l,at])=>{const r=c.el(`<span class="money" style="font-weight:800;font-size:112px;display:inline-block;width:420px">${v}</span><span style="font-weight:700;font-size:80px">${l}</span>`,'','display:flex;align-items:baseline');card.append(r);c.enter(r,at+0.1);});
  const src=c.el('Source: FINRA','src');
  st.append(top,card,src);c.enter(top,0);c.enter(src,0.9,{dy:20});
}};

// ---------- Motion graphics (MG) ----------
const money=t=>`<span class="money" style="font-weight:800">${t}</span>`;
const fmt$=n=>'$'+n.toLocaleString('en-US');

// Big number plus label, centered. parts: [{html,size,cls,at,count}]
const FS=(short,dur,parts)=>({name:short,fs:true,dur,build(st,c){
  const wrap=c.el('','center','gap:26px;text-align:center');
  parts.forEach(p=>{const e=c.el(p.html,p.cls||'head',`font-size:${p.size||96}px;${p.style||''}`);wrap.append(e);
    if(p.count)c.count(e,p.at||0,p.count[0],p.count[1],n=>'$'+n,0.8);
    c.enter(e,p.at||0);});
  st.append(wrap);
}});

// Number badge plus title (FS title)
const TITLE=(short,dur,n,text)=>({name:short,fs:true,dur,build(st,c){
  const wrap=c.el('','center','gap:44px;text-align:center');
  const badge=c.el(String(n),'','width:200px;height:200px;border-radius:100px;background:#C9922E;color:#1E2A3A;font-weight:800;font-size:130px;display:flex;align-items:center;justify-content:center;line-height:1');
  const t=c.el(text,'head','font-size:110px;max-width:1700px');
  wrap.append(badge,t);st.append(wrap);c.enter(badge,0);c.enter(t,0.25);
}});

// Rows that build one at a time and stay. rows: [{html,at,size}]
const ROWS=(short,dur,rows,{gap=40,align='center'}={})=>({name:short,fs:true,dur,build(st,c){
  const wrap=c.el('','center',`gap:${gap}px;align-items:${align}`);
  rows.forEach(r=>{const e=c.el(r.html,r.cls||'head',`font-size:${r.size||110}px;${r.style||''}`);wrap.append(e);c.enter(e,r.at);});
  st.append(wrap);
}});

// Lower third: Warm Paper panel, left aligned, bottom 20% of frame
const LT=(short,dur,l1,l2)=>({name:short,fs:false,dur,build(st,c){
  const panel=c.el('','abs','left:80px;bottom:48px;background:#F7F3EC;border-radius:24px;box-shadow:0 8px 30px rgba(30,42,58,.10);padding:22px 44px;max-width:1500px');
  panel.append(c.el(l1,'head','font-size:64px;line-height:1.15'));
  if(l2)panel.append(c.el(l2,'label','font-size:48px;margin-top:6px;color:#1E2A3A'));
  st.append(panel);c.enter(panel,0.2,{dy:40});
}});

ITEMS.MG02=FS('60-to-125-an-hour',5.93,[{html:'$60 to $125',cls:'num',size:200,at:0},{html:'an hour',size:96,at:0.45}]);
ITEMS.MG03=FS('9-part-time-jobs',5.00,[{html:'9',cls:'num',size:260,style:'color:#C9922E',at:0},{html:'part-time jobs for retirees',size:100,at:0.4}]);
ITEMS.MG04=ROWS('four-traits',3.60,[['Experience',0],['Judgment',0.98],['Patience',1.97],['Trust',3.06]].map(([t,at])=>({html:t,at,size:130})));
ITEMS.MG05=TITLE('title-old-job',3.30,1,'Your old job, new price');
ITEMS.MG06=LT('old-rate-multiplier',7.17,'Old rate × 1.3 to 1.5');
ITEMS.MG07={name:'48-to-94',fs:true,dur:8.80,build(st,c){
  const wrap=c.el('','center','text-align:center;gap:20px');
  const row=c.el('','','display:flex;align-items:center;gap:70px');
  const a=c.el('$48','num','font-size:220px');
  const arrow=c.el('→','','font-size:180px;font-weight:700;color:#C9922E;line-height:1');
  const b=c.el('$94','num','font-size:220px');
  const lab=c.el('per hour','head','font-size:96px;margin-top:20px');
  row.append(a,arrow,b);wrap.append(row,lab);st.append(wrap);
  c.enter(a,0);c.enter(arrow,3.33);c.enter(b,3.33);c.count(b,3.33,48,94,n=>'$'+n,0.8);c.enter(lab,3.6);
}};
ITEMS.MG08=LT('full-retirement-age',10.50,'Full retirement age','No earnings limit');
ITEMS.MG10=LT('95-percent-no-trial',7.00,'95% never go to trial');
ITEMS.MG11={name:'legal-nurse-vs-floor-nurse',fs:true,dur:9.40,build(st,c){
  const wrap=c.el('','center','gap:70px');
  [['Legal nurse','$125 to $150/hr',0],['Floor nurse','$33/hr',6.53]].forEach(([l,v,at])=>{
    const r=c.el(`<div class="head" style="font-size:84px">${l}</div><div class="num" style="font-size:150px;margin-top:8px">${v}</div>`,'','text-align:center');
    wrap.append(r);c.enter(r,at);});
  st.append(wrap);
}};
ITEMS.MG12=ROWS('four-roles',6.43,[['Employee',1.45],['Contractor',2.17],['Expert',2.90],['Teacher',3.78]].map(([t,at])=>({html:t,at,size:130})));
ITEMS.MG13=TITLE('title-handyman',2.03,2,'Handyman');
ITEMS.MG14=LT('average-job',3.97,`Average job ${money('$390')}`);
ITEMS.MG15=LT('130-minimum',7.87,`${money('$130')} minimum`,'under 30 minutes');
ITEMS.MG16=FS('home-age-39-to-44',11.47,[]);
ITEMS.MG16.build=(st,c)=>{
  const wrap=c.el('','center','text-align:center;gap:18px');
  const l=c.el('Average home age','head','font-size:84px');
  const big=c.el('44 years','num','font-size:230px;color:#1E2A3A');
  const was=c.el('was 39','head','font-size:96px;color:#5A6472;font-weight:500;margin-top:10px');
  wrap.append(l,big,was);st.append(wrap);
  c.enter(l,1.63);c.enter(big,1.63);c.enter(was,5.03);
};
ITEMS.MG17={name:'state-rules',fs:true,dur:15.50,build(st,c){
  const wrap=c.el('','center','align-items:flex-start;gap:34px;padding-left:230px;box-sizing:border-box');
  const head=c.el('State rules','head','font-size:72px;color:#5A6472;font-weight:500;margin-bottom:16px');
  wrap.append(head);c.enter(head,0);
  [['Florida:','under <span class="money" style="font-weight:800">$2,500</span>',0],['Arizona:','under <span class="money" style="font-weight:800">$1,000</span>',5.20],['Texas:','no handyman license',8.33],['Washington:','register',11.07]].forEach(([s,v,at])=>{
    const r=c.el(`<span style="display:inline-block;width:560px">${s}</span>${v}`,'head','font-size:100px');wrap.append(r);c.enter(r,at);});
  st.append(wrap);
}};
ITEMS.MG18=LT('65-per-hour',8.27,`${money('$65/hr')}`,'2 hour minimum');
ITEMS.MG19=TITLE('title-finra-arbitrator',2.73,3,'FINRA arbitrator');
ITEMS.MG20=LT('degree-and-experience',6.17,'Degree + 5 years work','any field');
ITEMS.MG21=ROWS('arbitrator-ages',9.93,[['Average age <span style="font-weight:800;font-size:150px">69</span>',0],['<span style="font-weight:800;font-size:150px">40%</span> over 70',2.53],['<span style="font-weight:800;font-size:150px">12%</span> over 80',4.76]].map(([h,at])=>({html:h,at,size:100})),{gap:40});
ITEMS.MG22=LT('cases-a-year',6.63,'1 or 2 cases a year');
ITEMS.MG23=TITLE('title-tax-preparer',2.93,4,'Seasonal tax preparer');
ITEMS.MG24={name:'tax-return-math',fs:true,dur:13.67,build(st,c){
  const wrap=c.el('','center','gap:34px;text-align:center');
  const a=c.el('<span class="num" style="font-size:170px">$240</span> <span class="head" style="font-size:96px">a return</span>','');
  const b=c.el('× 150 returns','head','font-size:120px');
  const r=c.el('= <span class="num" style="font-size:230px">$36,000</span>','head','font-size:150px');
  wrap.append(a,b,r);st.append(wrap);
  c.enter(a,0);c.enter(b,4.60);c.enter(r,7.63);
  const num=r.querySelector('.num');c.count(num,7.63,0,36000,fmt$,1.2);
}};
ITEMS.MG25=LT('pay-per-hour',5.37,`${money('$23.50')} to ${money('$41')}`,'per hour');
ITEMS.MG26=LT('ptin',8.00,`PTIN ${money('$18.75')}`);
ITEMS.MG27=FS('1-in-3',5.83,[{html:'1 in 3',cls:'num',size:240,style:'color:#1E2A3A',at:0},{html:'preparers over 55',size:100,at:0.45}]);
ITEMS.MG29=TITLE('title-end-of-life-doula',2.80,5,'End-of-life doula');
ITEMS.MG30=FS('85-an-hour',6.20,[{html:'$85',cls:'num',size:240,at:0},{html:'an hour average',size:100,at:0.45}]);
ITEMS.MG31=LT('doula-packages',9.23,`Packages ${money('$500')} to ${money('$5,000')}`);
ITEMS.MG32=TITLE('title-line-stander',2.87,6,'Professional line stander');
ITEMS.MG33=FS('27-an-hour',4.63,[{html:'$27 an hour',cls:'num',size:200,at:0},{html:'to stand in line',size:100,at:0.45}]);
ITEMS.MG34=TITLE('title-catastrophe-adjuster',3.50,7,'Catastrophe adjuster');
ITEMS.MG35=ROWS('adjuster-claims',7.10,[{html:'<span class="money" style="font-weight:800">$230 to $290</span> a claim',at:0,size:120},{html:'4 claims = <span class="money" style="font-weight:800">$1,000</span> a day',at:4.17,size:120}],{gap:60});
ITEMS.MG36=LT('40k-to-100k',6.10,`${money('$40K')} to ${money('$100K')} a year`);
ITEMS.MG37=LT('1-in-4-over-55',11.20,'1 in 4 already over 55');
ITEMS.MG38=TITLE('title-fiduciary',4.60,8,'Professional fiduciary');
ITEMS.MG39=FS('145-to-225',8.23,[{html:'$145 to $225',cls:'num',size:200,at:0},{html:'an hour',size:100,at:0.45}]);
ITEMS.MG40=TITLE('title-estate-sale-liquidator',2.90,9,'Estate sale liquidator');
ITEMS.MG41={name:'40-percent-of-20000',fs:true,dur:8.93,build(st,c){
  const wrap=c.el('','center','gap:34px;text-align:center');
  const a=c.el(`<span class="num" style="font-size:200px">$20,000</span> <span class="head" style="font-size:96px">sale</span>`,'');
  const b=c.el('× 40%','head','font-size:150px');
  const r=c.el('= <span class="num" style="font-size:230px">$8,000</span>','head','font-size:150px');
  wrap.append(a,b,r);st.append(wrap);
  c.enter(a,0);c.enter(b,4.47);c.enter(r,6.95);c.count(r.querySelector('.num'),6.95,0,8000,fmt$,1.0);
}};
ITEMS.MG42=LT('68-percent-owners',4.50,'68% of owners over 55');
ITEMS.MG43={name:'12-vs-1200',fs:true,dur:6.77,build(st,c){
  const wrap=c.el('','center','text-align:center;gap:30px');
  const row=c.el('','','display:flex;align-items:baseline;gap:70px');
  const a=c.el('$12','num','font-size:230px');
  const v=c.el('vs','head','font-size:96px;color:#5A6472;font-weight:500');
  const b=c.el('$1,200','num','font-size:230px');
  const n=c.el('two vases','head','font-size:84px;font-weight:500;margin-top:20px');
  row.append(a,v,b);wrap.append(row,n);st.append(wrap);
  c.enter(a,0);c.enter(v,1.0);c.enter(b,2.0);c.enter(n,3.0);
}};
ITEMS.MG44={name:'the-9-jobs',fs:true,dur:14.76,build(st,c){
  const wrap=c.el('','abs','left:560px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:26px');
  [['Your old job, new price',1.23],['Handyman',3.23],['FINRA arbitrator',4.06],['Tax preparer',5.76],['End-of-life doula',6.56],['Line stander',8.44],['Catastrophe adjuster',9.80],['Professional fiduciary',11.16],['Estate sale liquidator',12.96]].forEach(([t,at],i)=>{
    const r=c.el(`<span style="display:inline-flex;width:76px;height:76px;border-radius:38px;background:#C9922E;color:#1E2A3A;font-weight:800;font-size:44px;align-items:center;justify-content:center;margin-right:36px">${i+1}</span>${t}`,'head','font-size:68px;display:flex;align-items:center');
    wrap.append(r);c.enter(r,at);});
  st.append(wrap);
}};
ITEMS.MG45={name:'subscribe-and-bell',fs:false,dur:9.07,build(st,c){
  const panel=c.el('','abs','left:80px;top:872px;width:760px;height:164px;background:#F7F3EC;border-radius:24px;box-shadow:0 8px 30px rgba(30,42,58,.10);display:flex;align-items:center;padding-left:40px;gap:36px');
  const btn=c.el('Subscribe','','background:#1E2A3A;color:#F7F3EC;font-weight:700;font-size:56px;padding:22px 56px;border-radius:60px');
  const bell=c.el('<svg width="84" height="84" viewBox="0 0 24 24" fill="#1E2A3A"><path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 0 0-5.5-6.84V3.5a1.5 1.5 0 0 0-3 0v.66A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2z"/></svg>','','transform-origin:50% 8%');
  panel.append(btn,bell);st.append(panel);
  c.enter(panel,0.2,{dy:40});
  c.custom(t=>{ // button presses at 2.6s and turns gold; bell enters at 4s and tilts gently twice
    const k=clamp((t-2.6)/0.5);btn.style.transform=`scale(${1-Math.sin(Math.PI*clamp((t-2.6)/0.4))*0.05})`;
    btn.style.background=k<0.5?'#1E2A3A':'#C9922E';btn.style.color=k<0.5?'#F7F3EC':'#1E2A3A';
    bell.style.opacity=clamp((t-4)/0.4);
    const w=clamp((t-4.6)/1.6);bell.style.transform=`rotate(${Math.sin(w*Math.PI*4)*10*(1-w)}deg)`;
  });
}};
