// Usage: [STYLE=v2|v3] node render.mjs MG01 MG09 ...   (renders to ../renders, ../renders_v2 or ../renders_v3)
// STYLE=v3 adds real motion blur (8 sub-frames per frame, 180 degree shutter, averaged by ffmpeg) and a colour grade on MP4s.
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const STYLE=process.env.STYLE||'';const V2=STYLE==='v2'||STYLE==='v3';
const BLUR=STYLE==='v3'||STYLE==='v4'||STYLE==='v5';const K=BLUR?8:1;
const out=path.join(here,'..',STYLE?`renders_${STYLE}`:'renders');
fs.mkdirSync(path.join(out,'_preview'),{recursive:true});
const exe=fs.readdirSync(process.env.PLAYWRIGHT_BROWSERS_PATH||'/opt/pw-browsers').filter(d=>/^chromium-/.test(d)).map(d=>path.join('/opt/pw-browsers',d,'chrome-linux/chrome')).find(fs.existsSync);
const browser=await chromium.launch({executablePath:exe,args:['--allow-file-access-from-files','--force-device-scale-factor=1']});
for(const id of process.argv.slice(2)){
  const page=await browser.newPage({viewport:{width:1920,height:1080}});
  await page.goto(pathToFileURL(path.join(here,STYLE||'.','scene.html')).href);
  await page.addScriptTag({url:pathToFileURL(path.join(here,STYLE||'.','items.js')).href}).catch(()=>{});
  const meta=await page.evaluate(async id=>{const m=await setup(id);m.name=ITEMS[id].name;return m;},id);
  if(process.env.PREVIEW_ONLY){await page.evaluate(t=>renderAt(t),meta.dur-0.02);if(!meta.fs)await page.evaluate(()=>document.body.classList.add('preview-bg'));await page.screenshot({path:path.join(out,'_preview',`${id}.png`)});await page.close();console.log(id,'preview');continue;}
  const file=path.join(out,`${id}_${meta.name}.${meta.fs?'mp4':'mov'}`);
  const args=['-y','-loglevel','error','-f','image2pipe','-c:v',meta.fs?'mjpeg':'png','-framerate',String(30*K),'-i','-'];
  const vf=[];
  if(BLUR) vf.push('format=rgba',`tmix=frames=${K}`,`select='eq(mod(n\\,${K})\\,${K-1})'`,`setpts=N/(30*TB)`);
  if(STYLE==='v5'&&meta.fs) vf.push("curves=all='0/0 0.2/0.17 0.75/0.8 1/1'","colorbalance=rs=0.03:gs=-0.015:bs=0.05:rh=0.04:gh=-0.01:bh=0.02","eq=saturation=1.12:contrast=1.04","format=gbrp","split=2[a][b];[b]curves=all='0/0 0.62/0.02 0.82/0.5 1/1',gblur=sigma=22[bl];[a][bl]blend=all_mode=screen:all_opacity=0.32","noise=alls=2:allf=t");
  else if(BLUR&&meta.fs) vf.push("curves=all='0/0 0.25/0.23 0.75/0.77 1/1'","colorbalance=rs=-0.01:bs=0.02:rh=0.02:bh=-0.015","eq=saturation=1.08:contrast=1.02");
  if(vf.length) args.push('-vf',vf.join(','));
  if(meta.fs) args.push('-c:v','libx264','-pix_fmt','yuv420p','-crf',STYLE==='v5'?'19':'15','-preset','slow','-an','-movflags','+faststart');
  else args.push('-c:v','qtrle','-pix_fmt','argb');
  args.push('-frames:v',String(meta.frames),'-r','30',file);
  const ff=spawn('ffmpeg',args,{stdio:['pipe','inherit','inherit']});
  let prevKey=null,prevBuf=null;
  for(let f=0;f<meta.frames;f++){
    // sub-frame times: a 180 degree shutter (half a frame) ending at the frame time
    const times=[];for(let j=0;j<K;j++)times.push(f/30-(K-1-j)/(60*K)*(K>1?1:0));
    const keys=await page.evaluate(ts=>ts.map(t=>{renderAt(t);return [...document.querySelectorAll('#stage *')].map(e=>(e.getAttribute('style')||'')+(e.children.length?'':e.textContent)).join('|');}),times);
    const key=keys.join('#');
    let bufs;
    if(key===prevKey){bufs=Array(K).fill(prevBuf);}
    else{bufs=[];const cache={};
      for(let j=0;j<K;j++){
        if(cache[keys[j]]){bufs.push(cache[keys[j]]);continue;}
        await page.evaluate(t=>renderAt(t),times[j]);
        const b=await page.screenshot(meta.fs?{type:'jpeg',quality:95}:{type:'png',omitBackground:true});cache[keys[j]]=b;bufs.push(b);}
      prevKey=key;prevBuf=bufs[0];
      if(new Set(keys).size>1)prevKey=null; // moving frame: do not reuse
    }
    for(const b of bufs){if(!ff.stdin.write(b))await new Promise(r=>ff.stdin.once('drain',r));}
  }
  ff.stdin.end(); await new Promise(r=>ff.on('close',r));
  // final-frame preview (overlays shown on a dark backdrop)
  await page.evaluate(t=>renderAt(t),(meta.frames-1)/30);
  if(!meta.fs) await page.evaluate(()=>document.body.classList.add('preview-bg'));
  if(BLUR&&meta.fs) await new Promise(res=>spawn('ffmpeg',['-y','-loglevel','error','-sseof','-0.1','-i',file,'-update','1','-frames:v','1',path.join(out,'_preview',`${id}.png`)]).on('close',res));
  else await page.screenshot({path:path.join(out,'_preview',`${id}.png`)});
  await page.close();
  console.log(id,meta.frames,'frames ->',path.basename(file),(fs.statSync(file).size/1e6).toFixed(1)+' MB');
}
await browser.close();
