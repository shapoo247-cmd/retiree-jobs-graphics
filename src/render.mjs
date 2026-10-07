// Usage: node render.mjs MG01 MG09 ...   (renders to ../renders)
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const out=path.join(here,'..','renders');
fs.mkdirSync(path.join(out,'_preview'),{recursive:true});
const exe=fs.readdirSync(process.env.PLAYWRIGHT_BROWSERS_PATH||'/opt/pw-browsers').filter(d=>/^chromium-/.test(d)).map(d=>path.join('/opt/pw-browsers',d,'chrome-linux/chrome')).find(fs.existsSync);
// Soft synthesized sound effects: a quiet swoosh per entrance, a small pop per bar draw.
function makeSfx(events,dur){
  const sr=48000,n=Math.round(dur*sr),buf=new Float32Array(n);let seed=7;
  const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2147483648-1;};
  for(const [kind,at] of events){
    const i0=Math.round(at*sr);
    if(kind==='swoosh'){const L=Math.round(0.4*sr);let lp=0,hp=0,prev=0;
      for(let i=0;i<L&&i0+i<n;i++){const p=i/L;const env=Math.pow(Math.sin(Math.PI*p),2)*0.16;
        const a=0.03+0.25*p;lp+=a*(rnd()-lp);hp=0.995*(hp+lp-prev);prev=lp;buf[i0+i]+=hp*env*3;}}
    else{const L=Math.round(0.18*sr);for(let i=0;i<L&&i0+i<n;i++){const p=i/L;
        buf[i0+i]+=Math.sin(2*Math.PI*620*i/sr)*Math.exp(-p*7)*Math.min(1,i/200)*0.12;}}
  }
  const pcm=Buffer.alloc(44+n*2);pcm.write('RIFF',0);pcm.writeUInt32LE(36+n*2,4);pcm.write('WAVEfmt ',8);pcm.writeUInt32LE(16,16);pcm.writeUInt16LE(1,20);pcm.writeUInt16LE(1,22);pcm.writeUInt32LE(sr,24);pcm.writeUInt32LE(sr*2,28);pcm.writeUInt16LE(2,32);pcm.writeUInt16LE(16,34);pcm.write('data',36);pcm.writeUInt32LE(n*2,40);
  for(let i=0;i<n;i++)pcm.writeInt16LE(Math.round(Math.max(-1,Math.min(1,buf[i]))*32767),44+i*2);
  return pcm;
}
const browser=await chromium.launch({executablePath:exe,args:['--allow-file-access-from-files','--force-device-scale-factor=1']});
for(const id of process.argv.slice(2)){
  const page=await browser.newPage({viewport:{width:1920,height:1080}});
  await page.goto(pathToFileURL(path.join(here,'scene.html')).href);
  await page.addScriptTag({url:pathToFileURL(path.join(here,'items.js')).href}).catch(()=>{});
  const meta=await page.evaluate(async id=>{const m=await setup(id);m.name=ITEMS[id].name;return m;},id);
  const file=path.join(out,`${id}_${meta.name}.${meta.fs?'mp4':'mov'}`);
  const args=['-y','-loglevel','error','-f','image2pipe','-framerate','30','-i','-'];
  if(meta.fs){const wav=path.join(here,'.sfx.wav');fs.writeFileSync(wav,makeSfx(meta.sfx,meta.dur));args.push('-i',wav);}
  if(meta.fs) args.push('-c:v','libx264','-pix_fmt','yuv420p','-crf','16','-preset','slow','-c:a','aac','-b:a','192k','-movflags','+faststart');
  else args.push('-c:v','qtrle','-pix_fmt','argb');
  args.push('-frames:v',String(meta.frames),'-r','30',file);
  const ff=spawn('ffmpeg',args,{stdio:['pipe','inherit','inherit']});
  for(let f=0;f<meta.frames;f++){
    await page.evaluate(t=>renderAt(t),f/30);
    const buf=await page.screenshot({type:'png',omitBackground:!meta.fs});
    if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r));
  }
  ff.stdin.end(); await new Promise(r=>ff.on('close',r));
  // final-frame preview (overlays shown on a dark backdrop)
  await page.evaluate(t=>renderAt(t),(meta.frames-1)/30);
  if(!meta.fs) await page.evaluate(()=>document.body.classList.add('preview-bg'));
  await page.screenshot({path:path.join(out,'_preview',`${id}.png`)});
  await page.close();
  console.log(id,meta.frames,'frames ->',path.basename(file),(fs.statSync(file).size/1e6).toFixed(1)+' MB');
}
await browser.close();
