// Usage (run from tier-board/): node rough-cut/src/render.mjs <audio.mp3> [--preview]
// 1) Playwright renders a transparent overlay (images montage, NASA crater, card, streaks, embers, vignette) as PNG frames.
// 2) ffmpeg builds the real-footage base (graded stock clips), lays the tier board in, overlays the PNGs and adds the audio.
import { chromium } from 'playwright-core';
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');           // tier-board/
const cut = path.join(here, '..');                   // tier-board/rough-cut/
const FPS = 30, DUR = 59.376;
const FRAMES = Math.ceil(DUR * FPS);
const tmp = path.join(root, '.frames', 'rough');

if (process.argv[2] === '--worker') {
  const [a, b] = [Number(process.argv[3]), Number(process.argv[4])];
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(here, 'drama.html'));
  await page.evaluate((real) => window.load(real), existsSync(path.join(cut, 'assets/chicxulub.jpg')) ? 'chicxulub' : null);
  for (let f = a; f < b; f++) {
    await page.evaluate(([t, f]) => window.draw(t, f), [f / FPS, f]);
    await page.screenshot({ path: path.join(tmp, `o${String(f).padStart(5, '0')}.png`), type: 'png', omitBackground: true });
  }
  await browser.close();
  process.exit(0);
}

const audio = process.argv[2];
const preview = process.argv.includes('--preview');
const total = preview ? 150 : FRAMES;
rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
const W = 4, per = Math.ceil(total / W);
await Promise.all(Array.from({ length: W }, (_, i) => new Promise((res, rej) => {
  const a = i * per, b = Math.min(total, a + per);
  const p = spawn('node', [process.argv[1], '--worker', a, b], { stdio: 'inherit' });
  p.on('exit', c => c ? rej(new Error('worker failed')) : res());
})));

const f = n => path.join(cut, 'footage', n);
const board = path.join(root, 'renders/T00_hook-board.mp4');
const out = path.join(root, 'renders', preview ? 'R01_preview.mp4' : 'R01_rough-cut.mp4');
const D = total / FPS;

// Slow push/drift on a source clip, then a short alpha fade-in so it dissolves over what is below it.
const move = (tag, dur, fadeIn) =>
  `trim=duration=${dur},setpts=PTS-STARTPTS,fps=${FPS},scale=2112:1188,` +
  `crop=1920:1080:'(in_w-1920)*t/${dur}':'(in_h-1080)*0.6'`;
const fadeA = (st, d) => `format=yuva420p,fade=in:st=0:d=${d}:alpha=1,setpts=PTS+${st}/TB`;

const fc = [
  `color=c=black:s=1920x1080:r=${FPS}:d=${D.toFixed(3)}[bg]`,
  // A 0.0s: night wildfire on a hillside, the far-off glow under the horizon
  `[0:v]${move('A', 9.3)},eq=brightness=-0.06:contrast=1.12:saturation=1.05,format=yuva420p,setpts=PTS+0/TB[A]`,
  // B 8.4s: dark teal storm clouds, temperature dropping
  `[2:v]${move('B', 6.8)},eq=brightness=-0.12:contrast=1.1:saturation=0.55,${fadeA(8.4, 0.8)}[B]`,
  // E 33.6s: gloomy ash clouds, blurred and dark behind the chapter card
  `[3:v]trim=duration=4.9,setpts=PTS-STARTPTS,fps=${FPS},scale=1920:1080,boxblur=22:2,eq=brightness=-0.3:saturation=0.5,${fadeA(33.6, 0.8)}[E]`,
  // G 45.6s: the wildfire again, later part, with the streaks overlay on top
  `[1:v]${move('G', 7.3)},eq=brightness=-0.05:contrast=1.15:saturation=1.1,${fadeA(45.6, 0.8)}[G]`,
  // H 52.0s: gloomy ash sky with falling sparks (screen blend), darkening
  `[4:v]trim=duration=7.4,setpts=PTS-STARTPTS,fps=${FPS},scale=1920:1080,eq=brightness=-0.22:saturation=0.35:contrast=1.1,colorbalance=rs=.2:bs=-.18[h0]`,
  `[5:v]trim=duration=7.4,setpts=PTS-STARTPTS,fps=${FPS},scale=1920:1080[sp]`,
  `[h0][sp]blend=all_mode=screen:all_opacity=0.75,${fadeA(52.0, 0.8)}[H]`,
  // Tier board at 21.0s, pushed in slowly toward the locked row
  `[6:v]tpad=stop_mode=clone:stop_duration=10,trim=duration=12.6,setpts=PTS-STARTPTS,` +
  `zoompan=z='1+0.00028*on':x='(iw-iw/zoom)*0.12':y='0':d=1:s=1920x1080:fps=${FPS},vignette=PI/4.5,` +
  `format=yuva420p,fade=in:st=0:d=0.7:alpha=1,fade=out:st=11.9:d=0.7:alpha=1,setpts=PTS+21.0/TB[BD]`,
  `[bg][A]overlay=eof_action=pass:format=auto[o1]`,
  `[o1][B]overlay=eof_action=pass:format=auto[o2]`,
  `[o2][BD]overlay=eof_action=pass:format=auto[o3]`,
  `[o3][E]overlay=eof_action=pass:format=auto[o4]`,
  `[o4][G]overlay=eof_action=pass:format=auto[o5]`,
  `[o5][H]overlay=eof_action=pass:format=auto[o6]`,
  `[o6][7:v]overlay=format=auto,format=yuv420p[v]`,
].join(';');

const args = ['-y', '-loglevel', 'error',
  '-i', f('wildfire.mp4'), '-ss', '6', '-i', f('wildfire.mp4'), '-i', f('storm.mp4'),
  '-ss', '1', '-i', f('gloomy.mp4'), '-ss', '4', '-i', f('gloomy.mp4'), '-i', f('sparks.mp4'),
  '-i', board, '-framerate', String(FPS), '-i', path.join(tmp, 'o%05d.png'),
  ...(preview ? [] : ['-i', audio]),
  '-filter_complex', fc, '-map', '[v]',
  ...(preview ? ['-t', String(D)] : ['-map', '8:a', '-c:a', 'aac', '-b:a', '192k', '-shortest']),
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-r', String(FPS), out];
const r = spawnSync('ffmpeg', args, { stdio: 'inherit' });
if (r.status) process.exit(r.status);
console.log('rendered', out);
