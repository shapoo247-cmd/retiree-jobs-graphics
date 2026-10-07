// Usage: node render.mjs MG01 MG09 ...   (renders to ../renders)
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const V2=process.env.STYLE==='v2';
const out=path.join(here,'..',V2?'renders_v2':'renders');
fs.mkdirSync(path.join(out,'_preview'),{recursive:true});
const exe=fs.readdirSync(process.env.PLAYWRIGHT_BROWSERS_PATH||'/opt/pw-browsers').filter(d=>/^chromium-/.test(d)).map(d=>path.join('/opt/pw-browsers',d,'chrome-linux/chrome')).find(fs.existsSync);
const browser=await chromium.launch({executablePath:exe,args:['--allow-file-access-from-files','--force-device-scale-factor=1']});
for(const id of process.argv.slice(2)){
  const page=await browser.newPage({viewport:{width:1920,height:1080}});
  await page.goto(pathToFileURL(path.join(here,V2?'v2':'.','scene.html')).href);
  await page.addScriptTag({url:pathToFileURL(path.join(here,V2?'v2':'.','items.js')).href}).catch(()=>{});
  const meta=await page.evaluate(async id=>{const m=await setup(id);m.name=ITEMS[id].name;return m;},id);
  const file=path.join(out,`${id}_${meta.name}.${meta.fs?'mp4':'mov'}`);
  const args=['-y','-loglevel','error','-f','image2pipe','-framerate','30','-i','-'];
  if(meta.fs) args.push('-c:v','libx264','-pix_fmt','yuv420p','-crf','16','-preset','slow','-an','-movflags','+faststart');
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
