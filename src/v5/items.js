// Style 5: Creator UI, cinematic. Violet black gradient, glowing glass cards with a light sweep, typewriter source text, pop in graphics,
// bokeh, light leaks, bloom, grain and colour grade (render.mjs adds motion blur, bloom, grade and grain).
const ITEMS={};
const TYPE_CPS=0.03;                      // seconds per typed character
const kwSpan=(t,extra='')=>`<span class="kw" style="font-weight:800;${extra}">${t}</span>`;
const $g=t=>`<span class="money" style="font-weight:800">${t}</span>`;
const fmt$=n=>'$'+n.toLocaleString('en-US');
const glassCard=(c,html,style,cls='')=>c.el(html,'glass '+cls,style);

// ---------- Full screen stats: number in a glass card, label below ----------
const STAT=(short,dur,num,label,{numSize=330,cls='num',kw=null,labelSize=150,count=null}={})=>({name:short,fs:true,dur,build(st,c){
  const wrap=c.el('','abs','inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:50px');
  const card=c.el('','glass','padding:30px 100px 44px;text-align:center');
  const n=c.el(num,cls,`font-size:${numSize}px`+(cls==='num'?'':';font-weight:900;line-height:1;letter-spacing:-0.035em'));
  card.append(n);
  const lab=c.el(label,'head',`font-size:${labelSize}px;text-align:center`);
  wrap.append(card,lab);st.append(wrap);
  c.pop(card,0,{dy:70,from:0.82});c.sweep(card,0.5);c.float(card,0,5);
  if(count)c.count(n,0.1,count[0],count[1],fmt$,1.4);
  c.pop(lab,0.7,{dy:40,from:0.9});
}});
const YEL=t=>`<span style="color:#FACC15">${t}</span>`;
ITEMS.MG01={name:'500-an-hour',fs:true,dur:4.50,build:STAT('x',0,'$0','an '+YEL('hour'),{numSize:420,labelSize:170,count:[0,500]}).build};
ITEMS.MG02=STAT('60-to-125-an-hour',5.93,'$60 to $125','an '+YEL('hour'),{numSize:250,labelSize:150});
ITEMS.MG27=STAT('1-in-3',5.83,'1 in 3','preparers over '+YEL('55'),{numSize:330,cls:'numw',labelSize:130});
ITEMS.MG30=STAT('85-an-hour',6.20,'$85',YEL('an hour')+' average',{numSize:420,labelSize:140});
ITEMS.MG33=STAT('27-an-hour',4.63,'$27 an hour','to stand in '+YEL('line'),{numSize:200,labelSize:130});
ITEMS.MG39=STAT('145-to-225',8.23,'$145 to $225','an '+YEL('hour'),{numSize:230,labelSize:150});
ITEMS.MG03={name:'9-part-time-jobs',fs:true,dur:5.00,build(st,c){
  const wrap=c.el('','abs','inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px');
  const card=c.el('','glass','padding:20px 150px 30px;text-align:center');
  const n=c.el('9','numw','font-size:420px;font-weight:900;line-height:1;color:#FACC15;text-shadow:0 0 40px rgba(250,204,21,.5)');card.append(n);
  const lab=c.el('part-time jobs for retirees','head','font-size:120px;text-align:center');
  wrap.append(card,lab);st.append(wrap);c.pop(card,0,{dy:70,from:0.82});c.sweep(card,0.5);c.float(card,0,5);c.pop(lab,0.6,{dy:40,from:0.9});
}};

// ---------- Title cards: glowing number badge plus title ----------
const TITLE=(short,dur,n,text)=>({name:short,fs:true,dur,build(st,c){
  const wrap=c.el('','abs','inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:56px;text-align:center');
  const badge=c.el(String(n),'glass','width:260px;height:260px;border-radius:130px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:170px;line-height:1;color:#fff;text-shadow:0 0 36px rgba(216,180,254,.8)');
  const t=c.el(text,'head','font-size:120px;max-width:1700px');
  wrap.append(badge,t);st.append(wrap);c.pop(badge,0,{dy:60,from:0.7});c.float(badge,0,5);c.pop(t,0.3,{dy:50,from:0.9});
}});
ITEMS.MG05=TITLE('title-old-job',3.30,1,'Your old job, new price');
ITEMS.MG13=TITLE('title-handyman',2.03,2,'Handyman');
ITEMS.MG19=TITLE('title-finra-arbitrator',2.73,3,'FINRA arbitrator');
ITEMS.MG23=TITLE('title-tax-preparer',2.93,4,'Seasonal tax preparer');
ITEMS.MG29=TITLE('title-end-of-life-doula',2.80,5,'End-of-life doula');
ITEMS.MG32=TITLE('title-line-stander',2.87,6,'Professional line stander');
ITEMS.MG34=TITLE('title-catastrophe-adjuster',3.50,7,'Catastrophe adjuster');
ITEMS.MG38=TITLE('title-fiduciary',4.60,8,'Professional fiduciary');
ITEMS.MG40=TITLE('title-estate-sale-liquidator',2.90,9,'Estate sale liquidator');

// ---------- Rows that build one at a time and stay ----------
// rows: [{l:label html, v:value html (optional), at}]
const ROWS=(short,dur,rows,{header=null,lSize=104,vSize=150,gap=40,narrow=false,pill=false}={})=>({name:short,fs:true,dur,build(st,c){
  const wrap=c.el('','abs',`left:${narrow?300:170}px;right:${narrow?300:170}px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:${gap}px;${pill?'align-items:center':''}`);
  if(header){const h=c.el(header,'head','font-size:76px;color:#D8B4FE;text-align:left;padding-left:20px');wrap.append(h);c.pop(h,0,{dy:30,from:0.95});}
  rows.forEach((r,i)=>{
    const row=c.el('','glass',`display:flex;align-items:center;justify-content:${r.v?'space-between':'center'};gap:40px;padding:30px 76px;${pill?'padding:28px 110px':''}`);
    if(r.html){row.style.justifyContent='center';row.style.gap='36px';row.innerHTML=r.html;}
    else{row.append(c.el(r.l,'head',`font-size:${r.lSize||lSize}px`));
    if(r.v)row.append(c.el(r.v,'num',`font-size:${r.vSize||vSize}px`));}
    wrap.append(row);c.pop(row,r.at,{dy:90,from:0.9});c.sweep(row,r.at+0.4);c.float(row,i*1.7,4);
  });
  st.append(wrap);
}});
ITEMS.MG04=ROWS('four-traits',3.60,[['Experience',0],['Judgment',0.98],['Patience',1.97],['Trust',3.06]].map(([l,at])=>({l,at,lSize:112})),{gap:30,pill:true});
ITEMS.MG12=ROWS('four-roles',6.43,[['Employee',1.45],['Contractor',2.17],['Expert',2.90],['Teacher',3.78]].map(([l,at])=>({l,at,lSize:112})),{gap:30,pill:true});
ITEMS.MG09=ROWS('expert-witness-rates',16.27,[{l:'Review',v:'$450/hr',at:2.28},{l:'Deposition',v:'$500/hr',at:4.57},{l:'Retainer',v:'$3,000',at:12.17}],{gap:44});
ITEMS.MG11=ROWS('legal-nurse-vs-floor-nurse',9.40,[{l:'Legal nurse',v:'$125 to $150/hr',at:0,vSize:104,lSize:80},{l:'Floor nurse',v:'$33/hr',at:6.53,vSize:104,lSize:80}],{gap:60});
ITEMS.MG17=ROWS('state-rules',15.50,[
  {l:'Florida:',v:'<span style="color:#fff;font-weight:800;font-size:84px">under </span>$2,500',at:0},
  {l:'Arizona:',v:'<span style="color:#fff;font-weight:800;font-size:84px">under </span>$1,000',at:5.20},
  {l:'Texas:',v:'<span style="color:#fff;font-weight:800;font-size:84px">no handyman license</span>',at:8.33},
  {l:'Washington:',v:'<span style="color:#fff;font-weight:800;font-size:84px">register</span>',at:11.07}],{header:'State rules',lSize:84,vSize:96,gap:26});
// MG17 values that are not dollar figures are white, dollar figures stay green
ITEMS.MG21=ROWS('arbitrator-ages',9.93,[
  {l:'Average age',v:'69',at:0,vSize:170,lSize:100},
  {html:'<span class="numw" style="font-size:170px">40%</span><span class="head" style="font-size:100px">over 70</span>',at:2.53},
  {html:'<span class="numw" style="font-size:170px">12%</span><span class="head" style="font-size:100px">over 80</span>',at:4.76}],{gap:40});
ITEMS.MG35=ROWS('adjuster-claims',7.10,[
  {html:'<span class="num" style="font-size:140px">$230 to $290</span><span class="head" style="font-size:90px">a claim</span>',at:0},
  {html:'<span class="head" style="font-size:90px">4 claims =</span><span class="num" style="font-size:140px">$1,000</span><span class="head" style="font-size:90px">a day</span>',at:4.17}],{gap:60});

// MG16: label, big number, previous value
ITEMS.MG16={name:'home-age-39-to-44',fs:true,dur:11.47,build(st,c){
  const wrap=c.el('','abs','inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;text-align:center');
  const l=c.el('Average home age','head','font-size:96px;color:#D8B4FE');
  const card=c.el('','glass','padding:20px 120px 34px');card.append(c.el('44 years','numw','font-size:290px;font-weight:900;line-height:1;letter-spacing:-0.035em'));
  const was=c.el('was 39','head','font-size:110px;color:#94A3B8;font-weight:600');
  wrap.append(l,card,was);st.append(wrap);
  c.pop(l,1.63,{dy:30,from:0.95});c.pop(card,1.63,{dy:70,from:0.85});c.sweep(card,2.1);c.float(card,0,5);c.pop(was,5.03,{dy:40,from:0.9});
}};
// MG07: $48 -> $94
ITEMS.MG07={name:'48-to-94',fs:true,dur:8.80,build(st,c){
  const wrap=c.el('','abs','inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:50px');
  const card=c.el('','glass','padding:34px 100px 44px;display:flex;align-items:center;gap:80px');
  const a=c.el('$48','num','font-size:300px');const ar=c.el('→','','font-size:230px;font-weight:700;color:#FACC15;line-height:1;text-shadow:0 0 30px rgba(250,204,21,.6)');
  const b=c.el('$48','num','font-size:300px');card.append(a,ar,b);
  const lab=c.el('per hour','head','font-size:130px');
  wrap.append(card,lab);st.append(wrap);
  // $48 sits alone first; the arrow and $94 arrive together at 3.33s
  const aa=a,card2=card;
  c.pop(a,0,{dy:70,from:0.82});c.pop(ar,3.33,{dy:30,from:0.8});c.pop(b,3.33,{dy:70,from:0.82});c.count(b,3.33,48,94,n=>'$'+n,1.0);c.pop(lab,3.6,{dy:40,from:0.9});
  c.pop(card,0,{dy:70,from:0.9});c.sweep(card,3.5);
}};
// Math cards (MG24, MG41): three rows, last one counts up
const MATH=(short,dur,rows,final)=>({name:short,fs:true,dur,build(st,c){
  const wrap=c.el('','abs','left:260px;right:260px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:40px');
  rows.forEach((r,i)=>{const row=c.el('','glass','padding:28px 80px;display:flex;align-items:baseline;justify-content:center;gap:34px;text-align:center');
    row.innerHTML=r.html;wrap.append(row);c.pop(row,r.at,{dy:90,from:0.9});c.sweep(row,r.at+0.4);c.float(row,i*1.7,4);
    if(r.count){const n=row.querySelector('.num');c.count(n,r.at+0.1,0,r.count,fmt$,1.2);}});
  st.append(wrap);}});
ITEMS.MG24=MATH('tax-return-math',13.67,[
  {html:'<span class="num" style="font-size:150px">$240</span><span class="head" style="font-size:96px">a return</span>',at:0},
  {html:'<span class="head" style="font-size:120px">× 150 returns</span>',at:4.60},
  {html:'<span class="head" style="font-size:120px">=</span><span class="num" style="font-size:200px">$0</span>',at:7.63,count:36000}]);
ITEMS.MG41=MATH('40-percent-of-20000',8.93,[
  {html:'<span class="num" style="font-size:150px">$20,000</span><span class="head" style="font-size:96px">sale</span>',at:0},
  {html:'<span class="head" style="font-size:120px">× 40%</span>',at:4.47},
  {html:'<span class="head" style="font-size:120px">=</span><span class="num" style="font-size:200px">$0</span>',at:6.95,count:8000}]);
// MG43: $12 vs $1,200
ITEMS.MG43={name:'12-vs-1200',fs:true,dur:6.77,build(st,c){
  const wrap=c.el('','abs','inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:50px');
  const row=c.el('','','display:flex;align-items:center;gap:44px');
  const mk=t=>{const k=c.el('','glass','padding:20px 60px 30px');k.append(c.el(t,'num','font-size:210px'));return k;};
  const a=mk('$12'),b=mk('$1,200');const v=c.el('vs','head','font-size:110px;color:#D8B4FE;font-weight:600');
  row.append(a,v,b);const n=c.el('two vases','head','font-size:110px;font-weight:600');
  wrap.append(row,n);st.append(wrap);
  c.pop(a,0,{dy:70,from:0.85});c.pop(v,1.0,{dy:30,from:0.9});c.pop(b,2.0,{dy:70,from:0.85});c.sweep(b,2.4);c.pop(n,3.0,{dy:40,from:0.9});
}};
// MG44: the 9 jobs list
ITEMS.MG44={name:'the-9-jobs',fs:true,dur:14.76,build(st,c){
  const card=c.el('','glass','position:absolute;left:400px;right:400px;top:80px;bottom:80px;padding:34px 64px;display:flex;flex-direction:column;justify-content:space-between');
  const list=[['Your old job, new price',1.23],['Handyman',3.23],['FINRA arbitrator',4.06],['Tax preparer',5.76],['End-of-life doula',6.56],['Line stander',8.44],['Catastrophe adjuster',9.80],['Professional fiduciary',11.16],['Estate sale liquidator',12.96]];
  st.append(card);c.pop(card,0,{dy:60,from:0.94});c.sweep(card,0.5);
  list.forEach(([t,at],i)=>{const r=c.el(`<span style="display:inline-flex;width:68px;height:68px;border-radius:34px;background:#A855F7;color:#fff;font-weight:800;font-size:40px;align-items:center;justify-content:center;margin-right:32px;box-shadow:0 0 22px rgba(192,132,252,.8)">${i+1}</span>${t}`,'head','font-size:68px;display:flex;align-items:center');card.append(r);c.pop(r,at,{dy:40,from:0.92});});
}};

// ---------- Lower thirds (transparent) ----------
const LT=(short,dur,l1,l2)=>({name:short,fs:false,dur,build(st,c){
  const panel=c.el('','abs glass','left:80px;bottom:48px;padding:22px 48px;max-width:1500px;border-radius:32px');
  panel.append(c.el(l1,'head','font-size:64px;line-height:1.15'));
  if(l2)panel.append(c.el(l2,'head','font-size:48px;font-weight:500;margin-top:6px;color:#D8B4FE'));
  st.append(panel);c.pop(panel,0.2,{dy:70,from:0.92});c.sweep(panel,0.7);
}});
ITEMS.MG06=LT('old-rate-multiplier',7.17,'Old rate × 1.3 to 1.5');
ITEMS.MG08=LT('full-retirement-age',10.50,'Full retirement age','No earnings limit');
ITEMS.MG10=LT('95-percent-no-trial',7.00,'95% never go to trial');
ITEMS.MG14=LT('average-job',3.97,`Average job ${$g('$390')}`);
ITEMS.MG15=LT('130-minimum',7.87,`${$g('$130')} minimum`,'under 30 minutes');
ITEMS.MG18=LT('65-per-hour',8.27,$g('$65/hr'),'2 hour minimum');
ITEMS.MG20=LT('degree-and-experience',6.17,'Degree + 5 years work','any field');
ITEMS.MG22=LT('cases-a-year',6.63,'1 or 2 cases a year');
ITEMS.MG25=LT('pay-per-hour',5.37,`${$g('$23.50')} to ${$g('$41')}`,'per hour');
ITEMS.MG26=LT('ptin',8.00,`PTIN ${$g('$18.75')}`);
ITEMS.MG31=LT('doula-packages',9.23,`Packages ${$g('$500')} to ${$g('$5,000')}`);
ITEMS.MG36=LT('40k-to-100k',6.10,`${$g('$40K')} to ${$g('$100K')} a year`);
ITEMS.MG37=LT('1-in-4-over-55',11.20,'1 in 4 already over 55');
ITEMS.MG42=LT('68-percent-owners',4.50,'68% of owners over 55');
const CURSOR='<svg width="70" height="70" viewBox="0 0 24 24"><path d="M5 2l14 9-6 1.5L16 20l-3 1-3-7.5L5 17z" fill="#fff" stroke="#09040F" stroke-width="1.2" stroke-linejoin="round"/></svg>';
const BELL='<svg width="84" height="84" viewBox="0 0 24 24" fill="#fff"><path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 0 0-5.5-6.84V3.5a1.5 1.5 0 0 0-3 0v.66A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2z"/></svg>';
// Subscribe: cursor glides in, clicks, button turns green; MG45 then rings the bell
const SUBSCRIBE=(short,dur,withBell)=>({name:short,fs:false,dur,build(st,c){
  const panel=c.el('','abs glass',`left:80px;top:872px;width:${withBell?780:600}px;height:164px;border-radius:32px;display:flex;align-items:center;padding-left:44px;gap:40px`);
  const btn=c.el('Subscribe','','background:#A855F7;color:#fff;font-weight:800;font-size:60px;padding:22px 64px;border-radius:60px;box-shadow:0 0 30px rgba(168,85,247,.6)');
  const bell=c.el(BELL,'','transform-origin:50% 8%;opacity:0');
  panel.append(btn);if(withBell)panel.append(bell);
  const cur=c.el(CURSOR,'abs','left:0;top:0;opacity:0');
  st.append(panel,cur);c.pop(panel,0.2,{dy:70,from:0.92});c.sweep(panel,0.8);
  const t0=withBell?2.6:1.6;
  c.custom(t=>{t=tq(t);const m=expo((t-t0)/1.3);const x=1000-(1000-330)*m,y=760+(955-760)*m-Math.sin(Math.PI*m)*60;
    cur.style.opacity=clamp((t-t0+0.2)/0.3)*(t<t0+4.2?1:clamp(1-(t-t0-4.2)/0.4));cur.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    const press=Math.sin(Math.PI*clamp((t-t0-1.5)/0.35));const done=t>t0+1.65;
    btn.style.transform=`scale(${(1-press*0.06).toFixed(4)})`;btn.style.background=done?'#22C55E':'#A855F7';btn.style.boxShadow=done?'0 0 34px rgba(34,197,94,.65)':'0 0 30px rgba(168,85,247,.6)';
    if(withBell){const b0=t0+2.4;bell.style.opacity=clamp((t-b0)/0.3);const w=clamp((t-b0-0.2)/1.6);bell.style.transform=`rotate(${(Math.sin(w*Math.PI*5)*14*(1-w)).toFixed(2)}deg)`;}});
}});
ITEMS.MG28=SUBSCRIBE('subscribe-button',7.67,false);
ITEMS.MG45=SUBSCRIBE('subscribe-and-bell',9.07,true);

// ---------- Source cards ----------
// Excerpt card: real quoted text typed out, key phrase highlighted
const EX=(name,excerpt,keyPhrase,dur,short,{size=52,tail=''}={})=>({name:short,fs:true,dur,build(st,c){
  const top=c.el(name,'head','position:absolute;left:0;right:0;top:90px;text-align:center;font-size:82px');
  const html=excerpt.replace(keyPhrase,kwSpan(keyPhrase));
  const card=c.el(html+(tail?`<div style="margin-top:34px;font-size:72px;font-weight:800">${tail}</div>`:''),'glass',`position:absolute;left:150px;right:150px;top:250px;padding:60px 76px;font-size:${size}px;line-height:1.5;font-weight:500`);
  const src=c.el(`Source: ${name}`,'src');
  st.append(top,card,src);
  c.pop(top,0,{dy:30,from:0.94});c.pop(card,0.2,{dy:60,from:0.94});c.sweep(card,0.7);
  const plain=excerpt.replace(/<[^>]+>/g,'').length;const td=Math.min(Math.max(0.8,plain*TYPE_CPS),dur*0.5);
  const tailEl=null;
  c.type(card.querySelector('.kw').parentNode===card?card:card,0.5,td);
  c.pop(src,0.9,{dy:20,from:0.96});
  c.wipe(card.querySelector('.kw'),0.5+td+0.1);
  const t=card.querySelector('.tail');
}});
ITEMS.SC02=EX('SEAK Expert Witness Fee Survey','This summary report has been prepared to provide the reader with expert witness fee and billing information using a large sample size (over 1,600 experts, many of whom had more than one area of expertise). All survey information was provided by the responding experts in January &amp; February of 2024.','over 1,600 experts',3.83,'seak-survey');
ITEMS.SC08=EX('University of Vermont',"UVM's End-of-Life Doula training will guide you in providing emotional, spiritual, and physical support at the end of life.",'End-of-Life Doula training',11.87,'uvm-doula-certificate',{size:60,tail:'End-of-life doula certificate: '+$g('$895')});
ITEMS.SC09=EX('Texas Department of Insurance','You can apply for a 90-day emergency adjuster license during a disaster.','90-day emergency adjuster license',10.83,'tdi-emergency-adjuster',{size:72});
// Key line card: key line typed with the important part highlighted, supporting lines pop in
const SK=(name,key,keyPlain,support,dur,short,{sAt=[2.2,3.1]}={})=>({name:short,fs:true,dur,build(st,c){
  const top=c.el(name,'head','position:absolute;left:0;right:0;top:90px;text-align:center;font-size:82px');
  const card=c.el('','glass','position:absolute;left:150px;right:150px;top:250px;padding:66px 80px');
  const k=c.el(key,'','font-size:92px;font-weight:800;line-height:1.2;letter-spacing:-0.02em');card.append(k);
  const sups=support.map(s=>{const d=c.el(s,'','font-size:52px;font-weight:500;line-height:1.35;margin-top:34px;color:#E9D5FF');card.append(d);return d;});
  const src=c.el(`Source: ${name}`,'src');st.append(top,card,src);
  c.pop(top,0,{dy:30,from:0.94});c.pop(card,0.2,{dy:60,from:0.94});c.sweep(card,0.7);
  const td=Math.max(0.7,keyPlain.length*TYPE_CPS);c.type(k,0.5,td);c.pop(src,0.9,{dy:20,from:0.96});
  card.querySelectorAll('.kw').forEach(m=>c.wipe(m,0.5+td+0.1));
  sups.forEach((d,i)=>c.pop(d,Math.max(sAt[i]??sAt[sAt.length-1]+i*0.8,0.5+td+0.5+i*0.7),{dy:30,from:0.94}));
}});
ITEMS.SC03=SK('Social Security Administration',`2026 limit: ${kwSpan($g('$24,480'))}`,'2026 limit: $24,480',['Under full retirement age','Holds back $1 for every $2 earned over the limit'],7.17,'ssa-earnings-limit');
ITEMS.SC01=SK('Fox News',`Made more in ${kwSpan('one month')} than in 40 years`,'Made more in one month than in 40 years',[`Scotty Kilmer: around ${$g('$24 million')} explaining what he already knew`],6.37,'fox-news-scotty',{sAt:[2.6]});
ITEMS.SC04=SK('Thumbtack',`Handyman: about ${kwSpan($g('$60 an hour'))}`,'Handyman: about $60 an hour',[`Higher end jobs: ${$g('$100 to $125')} an hour`],9.6,'thumbtack-handyman',{sAt:[2.6]});
ITEMS.SC05=SK('FINRA',`${kwSpan('No legal or securities experience')} required`,'No legal or securities experience required',['The regulator for every brokerage in America'],3.53,'finra-no-experience',{sAt:[2.2]});
ITEMS.SC07=SK('H&amp;R Block',`Income tax course: ${kwSpan('no tuition')}`,'Income tax course: no tuition',[`Materials cost about ${$g('$149')}`,'Around 40 hours'],11.4,'hrblock-tax-course',{sAt:[2.8,3.8]});
ITEMS.SC10=SK('ProPublica',`New York short of guardians for ${kwSpan('30,000 people')}`,'New York short of guardians for 30,000 people',['Roughly 30,000 people who need one'],7.2,'propublica-guardians',{sAt:[3.0]});
ITEMS.SC11=SK('Estate sale industry survey',`Average commission: ${kwSpan('40%')}`,'Average commission: 40%',['774 estate sale companies surveyed'],8.4,'estate-sale-commission',{sAt:[2.6]});
ITEMS.SC06={name:'finra-pay',fs:true,dur:9.40,build(st,c){
  const top=c.el('FINRA','head','position:absolute;left:0;right:0;top:90px;text-align:center;font-size:82px');
  const wrap=c.el('','abs','left:260px;right:260px;top:250px;display:flex;flex-direction:column;gap:34px');
  [['$600','a day',0],['$850','as chair',2.32],['$300','prehearing call',4.70]].forEach(([v,l,at],i)=>{
    const row=c.el(`<span class="num" style="font-size:130px;display:inline-block;width:470px">${v}</span><span class="head" style="font-size:88px">${l}</span>`,'glass','display:flex;align-items:center;padding:24px 80px');
    wrap.append(row);c.pop(row,at+0.1,{dy:80,from:0.9});c.sweep(row,at+0.5);});
  const src=c.el('Source: FINRA','src');st.append(top,wrap,src);c.pop(top,0,{dy:30,from:0.94});c.pop(src,0.9,{dy:20,from:0.96});
}};

// ---------- Screenshot cards (transparent). Hold still after landing so the file stays small. ----------
const SS=(file,{crop,covers,box,scale=2,w,h,dur,hlAt,name})=>({name,fs:false,dur,build(st,c){
  const [cx,cy,cw,ch]=crop||[0,0,w,h];const s=scale;const W=Math.round(cw*s),H=Math.round(ch*s);
  const persp=c.el('','abs','inset:0;perspective:1800px');
  const card=c.el('','abs',`left:${(1920-W-72)/2}px;top:${(1080-H-72)/2}px;width:${W+72}px;height:${H+72}px;padding:36px;overflow:hidden;background:#fff;border-radius:32px;border:3px solid #D8B4FE;box-shadow:0 0 22px rgba(192,132,252,.8),0 0 70px rgba(168,85,247,.5)`);
  const inner=c.el('','','position:relative;width:100%;height:100%;overflow:hidden');
  const img=new Image();img.src='../../screenshots/'+file;img.style.cssText=`position:absolute;left:${-cx*s}px;top:${-cy*s}px;width:${w*s}px;height:${h*s}px`;
  inner.append(img);
  (covers||[]).forEach(([x,y,cw2,ch2])=>inner.append(c.el('','abs',`left:${(x-cx)*s}px;top:${(y-cy)*s}px;width:${(cw2??4000)*s}px;height:${(ch2??4000)*s}px;background:#fff`)));
  const hl=c.el('','abs',`left:${(box[0]-cx)*s}px;top:${(box[1]-cy)*s}px;width:${box[2]*s}px;height:${box[3]*s+2}px;background:#FACC15;opacity:.8;mix-blend-mode:multiply;border-radius:6px;transform-origin:left;transform:scaleX(0)`);
  inner.append(hl);card.append(inner);persp.append(card);st.append(persp);
  c.custom(t=>{t=tq(t);const p=expo((t-0.1)/1.1);card.style.opacity=clamp(p*2.2);card.style.filter=p<1?`blur(${((1-p)*14).toFixed(2)}px)`:'none';
    card.style.transform=`translateY(${((1-p)*80).toFixed(2)}px) rotateX(${((1-p)*14).toFixed(2)}deg) rotateY(${((1-p)*-10).toFixed(2)}deg)`;
    hl.style.transform=`scaleX(${expo((t-hlAt)/0.7).toFixed(4)})`;});
}});
ITEMS.SS01=SS('SS01_scotty_channel.png',{name:'scotty',w:778,h:177,dur:6.33,hlAt:1.6,covers:[[242,120]],box:[243,50,96,18]});
ITEMS.SS02=SS('SS02_chef_jp_channel.png',{name:'chef-jean-pierre',w:736,h:167,dur:6.40,hlAt:1.6,covers:[[243,120]],box:[257,46,97,18]});
ITEMS.SS03=SS('SS03_clearvalue_channel.png',{name:'clearvalue-tax',w:675,h:163,dur:7.03,hlAt:1.6,covers:[[245,120]],box:[276,46,89,18]});
ITEMS.SS04=SS('SS04_julie_channel.png',{name:'hospice-nurse-julie',w:751,h:160,dur:6.80,hlAt:1.6,covers:[[247,116]],box:[275,42,90,18]});
ITEMS.SS05=SS('SS05_julie_dementia_video.png',{name:'dementia-video',w:1257,h:889,dur:7.53,hlAt:1.6,scale:1.4,crop:[22,700,1230,189],covers:[[249,727,36,30]],box:[28,826,54,17]});
ITEMS.SS06=SS('SS06_adjuster_tv.png',{name:'adjuster-tv',w:721,h:163,dur:8.03,hlAt:1.6,scale:1.8,covers:[[244,118]],box:[239,42,92,18]});
