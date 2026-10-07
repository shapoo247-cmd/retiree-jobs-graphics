# retiree-jobs-graphics

Motion graphics for "9 Part-Time Jobs for Retirees". Task instructions are in CLAUDE.md.

## Download
All 62 clips are in `renders/`, named `<ID>_<short-name>`. Place each clip at its In timecode from `docs/cue-sheet.md`.
- Full screen, title, build and source cards: H.264 `.mp4`, 1920x1080, 30 fps, no audio.
- Lower thirds and screenshot cards: QuickTime Animation `.mov` with alpha.
- `renders/_preview/<ID>.png`: final frame of each clip.

## Re-render
```
cd src && npm install
node render.mjs MG09 SC02      # render chosen clips
node check.mjs                 # check every cue sheet item exists with the right duration
```
Item definitions are in `src/items.js`.
