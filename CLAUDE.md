# Task: Motion graphics for "9 Part-Time Jobs for Retirees"

> If you were asked to find B-roll / stock footage, ignore this file and follow `docs/broll-task.md` instead.

You are building every motion graphic for a 19:10 faceless YouTube video for a 50+ audience.
The editor (Safdar) cuts the video in DaVinci Resolve (free version) and places each clip at its In timecode.

## Read these first
1. `motion-graphics-style-guide.md`: theme, font, text rules, animation, export. Follow it exactly.
2. `docs/cue-sheet.md` (same data in `docs/cue-sheet.csv`): all 62 items with In, Out, duration, type, on-screen text and build timings.
3. `docs/voiceover.srt` and `docs/script.txt`: reference only. Use the cue sheet for on-screen text, never the SRT text (the SRT has captioning errors).
4. `screenshots/`: the 6 channel screenshots SS01 to SS06.

## What to build
- MG01 to MG45: motion graphics.
- SC01 to SC11: source cards. Design them from the text in the cue sheet (source name at top, one key line large, small "Source: ..." credit bottom left). Do not fetch or screenshot websites.
- SS01 to SS06: screenshot cards from the PNGs in `screenshots/`. Crop away the browser extension buttons as described in the style guide.

## Non-negotiable rules
- Each clip's length equals its Duration in the cue sheet, at 30 fps, 1920 x 1080.
- Build items: each element enters at its listed offset ("@ +1.97s" means 1.97 s after the clip starts). Nothing appears before its time.
- Minimal text, exactly as written in the cue sheet. No dashes, hyphens or em dashes between words. No extra words.
- Calm motion only: fade plus short slide up, number count ups, highlight bar draw. No bounce, spin, glitch or glow.
- Warm Paper colors only. Every dollar figure in #2F7A55.

## Output
- Put renders in `renders/`, named `<ID>_<short-name>` (e.g. `MG07_48-to-94.mp4`, `SS01_scotty.mov`).
- FS, FS title, FS build and Source card types: H.264 .mp4.
- LT and Screenshot types: QuickTime Animation (qtrle) .mov with alpha.
- Every file under 95 MB.
- Also export `renders/_preview/<ID>.png`: the final frame of each clip, for quick review.
- Keep the render source code in `src/` so any clip can be re-rendered after edits.

## Workflow
1. Set up tooling (recommended: Remotion, or HTML/CSS frames captured with Playwright and encoded with ffmpeg). Get the Inter font from npm (`@fontsource/inter`).
2. Render a SAMPLE of 4 items first: MG01, MG09 (build), MG28 (lower third), SS01 (screenshot card). Commit, push, and STOP. Ask the user to approve the look before rendering the rest.
3. After approval, render all 62 items, check every duration against the cue sheet, commit and push.
4. Run `python tools/make_timeline.py` to write `renders/ai-jobs-graphics.edl`, `renders/ai-jobs-graphics.fcpxml` and `renders/timeline-report.txt`. Commit and push them with the clips. The report must say "Placed 62 of 62".
5. Finish with a short summary: the count rendered and any item you could not build as specified.
