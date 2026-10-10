// Usage: node src/render.mjs <clipId> [--preview-only]
import { chromium } from 'playwright-core';
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const FPS = 30;

// Chapter order = order tiles land. Row per script cue sheet.
const CHAPTERS = [
  ['impact-winter', 'MONTHS'], ['big-freeze', 'SURVIVES'], ['supervolcano', 'WEEKS'],
  ['sea-dried', 'DAYS'], ['snowball', 'HOURS'], ['great-dying', 'HOURS'],
  ['megaflood', 'MINUTES'], ['impact-day', 'SECONDS'],
];

// T00 hook board, T01..T08 one clip per chapter (board state before it + the drag), T09 final board.
const CLIPS = {
  'T00_hook-board': { dur: 4, scene: () => ({ fadeIn: [0, 0.5], placed: [], move: null }) },
};
CHAPTERS.forEach(([id, row], i) => {
  const placed = CHAPTERS.slice(0, i).map(([pid, prow]) => ({ id: pid, row: prow }));
  const unlocked = row === 'SECONDS';
  CLIPS[`T0${i + 1}_${id}`] = {
    dur: 9,
    scene: () => ({
      placed, cam: [0.8, 1.4, 6.0, 1.4], move: { id, row, t0: 2.6 },
      unlock: unlocked ? { t0: 0.4 } : null,
    }),
  };
});
CLIPS['T09_final-board'] = {
  dur: 3,
  scene: () => ({ fadeIn: [0, 0.4], placed: CHAPTERS.map(([id, row]) => ({ id, row })), move: null, unlock: { t0: -5 } }),
};

const name = process.argv[2];
const clip = CLIPS[name];
if (!clip) { console.error('unknown clip', name, Object.keys(CLIPS)); process.exit(1); }
const frames = Math.round(clip.dur * FPS);
const tmp = path.join(root, '.frames', name);
rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('file://' + path.join(here, 'board.html'));
await page.evaluate(() => document.fonts.ready);
for (let i = 0; i < 2; i++) await page.evaluate(() => Promise.all([...document.images].map(im => im.decode().catch(() => {}))));
const S = clip.scene();
for (let f = 0; f < frames; f++) {
  await page.evaluate(([t, S]) => window.draw(t, S), [f / FPS, S]);
  await page.screenshot({ path: path.join(tmp, `f${String(f).padStart(4, '0')}.png`) });
}
await browser.close();

mkdirSync(path.join(root, 'renders/_preview'), { recursive: true });
const out = path.join(root, 'renders', name + '.mp4');
const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, 'f%04d.png'),
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-r', String(FPS), out], { stdio: 'inherit' });
if (r.status) process.exit(r.status);
copyFileSync(path.join(tmp, `f${String(frames - 1).padStart(4, '0')}.png`), path.join(root, 'renders/_preview', name + '.png'));
console.log('rendered', out, frames, 'frames');
