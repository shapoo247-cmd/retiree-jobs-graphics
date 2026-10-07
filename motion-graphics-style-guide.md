# Motion Graphics Style Guide
Video: 9 Part-Time Jobs for Retirees That Pay Way More Than You Think
Audience: 50+ viewers. Editor: DaVinci Resolve. Theme: Warm Paper.

## Colors
| Role | Hex | Use |
|---|---|---|
| Background | #F7F3EC | Full-screen cards, panels behind text |
| Primary text | #1E2A3A | Headlines, labels |
| Money / positive | #2F7A55 | Every dollar figure and pay rate |
| Highlight | #C9922E | Underline bar, number badges, one key word per card |
| Secondary text | #5A6472 | Small labels and sources only |
| Caution | #B5533C | Catches and downsides only, used sparingly |

No gradients, glows, neon, or drop shadows heavier than a soft 10% shadow on screenshot cards.

## Typography
- Font: Inter (free on Google Fonts). Weights: ExtraBold 800 for numbers, Bold 700 for headlines, Medium 500 for labels.
- Canvas: 1920 x 1080, 30 fps.
- Big number: 160 to 220 px. Headline: 72 to 96 px. Label: 40 to 48 px. Nothing smaller than 36 px.
- Sentence case. No ALL CAPS paragraphs.

## Text rules
- One idea per graphic. Three to six words maximum.
- No dashes, hyphens, or em dashes between words. No "word — word" styling.
- No filler words, no emojis, no decorative icons that say nothing.
- Numbers as numerals on screen: $500, 69, 40%.
- Source credit (when showing a stat): small 36 px secondary text at bottom left, e.g. "Source: FINRA".

## Sync rules (most important)
- Every element appears at the exact moment its words are spoken in the voiceover.
- One element per spoken phrase. If the VO takes 3 seconds on a line, the graphic holds 3 seconds. If the next line takes 5, that graphic holds 5.
- Lists build one item at a time, each item entering on its own spoken cue. Never show 3 or 4 items at once.
- A graphic stays until the next spoken idea replaces it. No empty gaps, no early exits.
- Build each graphic from the VO timestamps (SRT or transcript with times), not from guessed durations.

## Animation
- Entrances: soft fade plus 30 to 40 px slide up, 0.4 to 0.5 s, ease out. Numbers can count up over 0.8 s.
- Exits: quick 0.3 s fade.
- No bouncing, spinning, glitch, or fast whip effects. Calm and readable.
- Highlight bar draws left to right under the key word, 0.4 s.

## Screenshots (YouTube channels only)
- Crop or cover the browser extension buttons (Checking, Monetized, Channel Tools, Community). Keep only: profile photo, channel name, handle and subscriber line, description line, links line, and the Subscribe button.
- Source PNGs are about 750 px wide, so scale them up no more than 2x and use high-quality resampling. Place on a white rounded card (24 px radius) with a soft 10% shadow, on the #F7F3EC background.
- Slow push in, 100% to 106% over the hold.
- Optional highlight box in #C9922E around the subscriber count or headline, drawn on cue.

## Avatar segments
- When the client avatar is on screen, use lower-third or side-panel graphics only, never full-screen cards.
- Lower third: #F7F3EC panel, left aligned, bottom 20% of frame, clear of the avatar's face.

## Export
- Overlays (lower thirds, screenshot cards over footage or avatar): QuickTime Animation (qtrle) .mov with alpha, pixel format argb. Small files for flat graphics and DaVinci free imports them with transparency. Every file must stay under 95 MB (GitHub limit 100 MB).
- Full-screen cards: H.264 .mp4, 1920 x 1080, 30 fps.
- File naming: 01_job1_contractor_rate.mov, 02_..., in script order.
