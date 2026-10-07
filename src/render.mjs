// Usage: node render.mjs MG01 MG09 ...   (renders to ../renders)
import {chromium} from 'playwright-core';
import {spawn,execFileSync} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const out=path.join(here,'..','renders');
fs.mkdirSync(path.join(out,'_preview'),{recursive:true});
const exe=fs.readdirSync(process.env.PLAYWRIGHT_BROWSERS_PATH||'/opt/pw-browsers').filter(d=>/^chromium-/.test(d)).map(d=>path.join('/opt/pw-browsers',d,'chrome-linux/chrome')).find(fs.existsSync);
// Sound effects: real recorded UI sounds (Kenney Interface Sounds, CC0) in src/sfx/, chosen by kit.
const KITS={
  A:{swoosh:['select_001',0.55],pop:['tick_002',0.35]},
  B:{swoosh:['pluck_002',0.5],pop:['glass_001',0.28]},
  C:{swoosh:['maximize_003',0.4],pop:['toggle_001',0.35]},
};
function makeSfx(events,dur){
  const kit=KITS[process.env.SFX_KIT||'A'];const sr=48000,n=Math.round(dur*sr),buf=new Float32Array(n);
  const cache={};
  const load=f=>cache[f]??=new Float32Array(execFileSync('ffmpeg',['-v','error','-i',path.join(here,'sfx',f+'.ogg'),'-f','f32le','-ar',String(sr),'-ac','1','-'],{maxBuffer:1<<26}).buffer.slice(0));
  for(const [kind,at] of events){const [f,g]=kit[kind];const s=load(f);const i0=Math.round(at*sr);
    for(let i=0;i<s.length&&i0+i<n;i++)buf[i0+i]+=s[i]*g;}
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
