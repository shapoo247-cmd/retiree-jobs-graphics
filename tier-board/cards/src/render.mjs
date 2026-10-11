// Usage (from tier-board/): node cards/src/render.mjs <id>   ids: c01..c08
import { chromium } from 'playwright-core';
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const FPS = 30;
const CARDS = {
  c01: { name: 'C01_impact-winter', img: 'impact-winter', fx: .55, type: 'FULL',  title: 'IMPACT WINTER', sub: '66 million years ago · far side of the planet' },
  c02: { name: 'C02_big-freeze', img: 'big-freeze', fx: .70, type: 'QUICK', title: 'THE BIG FREEZE', sub: '12,900 years ago · Northern Hemisphere' },
  c03: { name: 'C03_supervolcano', img: 'supervolcano', fx: .42, type: 'QUICK', title: 'SUPERVOLCANO', sub: '74,000 years ago · South Asia' },
  c04: { name: 'C04_sea-dried-up', img: 'sea-dried', fx: .55, type: 'QUICK', title: 'THE SEA THAT DRIED UP', sub: '5.6 million years ago · Mediterranean basin' },
  c05: { name: 'C05_snowball-earth', img: 'snowball', fx: .55, type: 'FULL',  title: 'SNOWBALL EARTH', sub: '650 million years ago · the equator' },
  c06: { name: 'C06_great-dying', img: 'great-dying', fx: .62, type: 'FULL',  title: 'THE GREAT DYING', sub: '252 million years ago · equatorial Pangaea' },
  c07: { name: 'C07_megaflood', img: 'megaflood', fx: .50, type: 'QUICK', title: 'MEGAFLOOD', sub: '15,000 years ago · Pacific Northwest' },
  c08: { name: 'C08_impact-day', img: 'impact-day', fx: .50, type: 'FULL',  title: 'IMPACT DAY', sub: '66 million years ago · a few hundred kilometers out' },
};
const id = process.argv[2], card = CARDS[id];
if (!card) { console.error('unknown', id, Object.keys(CARDS)); process.exit(1); }
card.dur = card.type === 'FULL' ? 5 : 3.2;
const frames = Math.round(card.dur * FPS);
const tmp = path.join(root, '.frames', card.name); rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('file://' + path.join(here, 'cards.html'));
await page.evaluate(c => window.setup(c), card);
for (let f = 0; f < frames; f++) {
  await page.evaluate(t => window.draw(t), f / FPS);
  await page.screenshot({ path: path.join(tmp, `f${String(f).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 94 });
}
await browser.close();
mkdirSync(path.join(root, 'renders/cards/_preview'), { recursive: true });
const out = path.join(root, 'renders/cards', card.name + '.mp4');
const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, 'f%04d.jpg'),
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-r', String(FPS), out], { stdio: 'inherit' });
if (r.status) process.exit(r.status);
// review still taken once the title and subtitle are fully in
const hold = Math.min(frames - 1, Math.round((card.type === 'FULL' ? 3.2 : 2.0) * FPS));
copyFileSync(path.join(tmp, `f${String(hold).padStart(4, '0')}.jpg`), path.join(root, 'renders/cards/_preview', card.name + '.jpg'));
console.log('rendered', out, frames, 'frames');
