// Usage: node rough-cut/src/render.mjs <audio.mp3> [--preview]   (run from tier-board/)
// Renders the dramatic rough cut: frames via Playwright, board overlay + audio via ffmpeg.
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
    await page.screenshot({ path: path.join(tmp, `f${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
  }
  await browser.close();
  process.exit(0);
}

const audio = process.argv[2];
const preview = process.argv.includes('--preview');
const total = preview ? 90 : FRAMES;
rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
const W = 4, per = Math.ceil(total / W);
await Promise.all(Array.from({ length: W }, (_, i) => new Promise((res, rej) => {
  const a = i * per, b = Math.min(total, a + per);
  const p = spawn('node', [process.argv[1], '--worker', a, b], { stdio: 'inherit' });
  p.on('exit', c => c ? rej(new Error('worker failed')) : res());
})));

const base = path.join(tmp, 'base.mp4');
let r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, 'f%05d.jpg'),
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', base], { stdio: 'inherit' });
if (r.status) process.exit(r.status);

// Tier board (the sample T00 clip) pushed in slowly toward the locked row, over the black segment at 21.0s.
const board = path.join(root, 'renders/T00_hook-board.mp4');
const out = path.join(root, 'renders', preview ? 'R00_rough-cut-preview.mp4' : 'R00_rough-cut.mp4');
const fc = [
  `[1:v]tpad=stop_mode=clone:stop_duration=10,trim=duration=12.6,setpts=PTS-STARTPTS,` +
  `zoompan=z='1+0.00028*on':x='(iw-iw/zoom)*0.12':y='0':d=1:s=1920x1080:fps=${FPS},` +
  `vignette=PI/4.5,format=yuva420p,fade=in:st=0:d=0.7:alpha=1,fade=out:st=11.9:d=0.7:alpha=1,setpts=PTS+21.0/TB[bd]`,
  `[0:v][bd]overlay=eof_action=pass:format=auto,format=yuv420p[v]`,
].join(';');
const args = ['-y', '-loglevel', 'error', '-i', base, '-i', board, ...(preview ? [] : ['-i', audio]),
  '-filter_complex', fc, '-map', '[v]', ...(preview ? [] : ['-map', '2:a', '-c:a', 'aac', '-b:a', '192k', '-shortest']),
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-r', String(FPS), out];
r = spawnSync('ffmpeg', args, { stdio: 'inherit' });
if (r.status) process.exit(r.status);
console.log('rendered', out);
