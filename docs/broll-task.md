# Task: Find B-roll for "9 Part-Time Jobs for Retirees"

You are picking stock footage for every B-roll shot in this 19:10 faceless video for a 50+ audience.
This is a SEPARATE task from the graphics renders. Do not touch `renders/`, `src/` or the graphics files.

## Inputs
- `docs/broll-shots.csv`: 146 shots. Each has shot_id, in/out time, duration, what_to_show, search_terms, overlay_on_top.
- `docs/visual-plan.md`: the full timeline (avatar, graphics, B-roll) for context. Read the narration around a shot in `docs/voiceover.srt` when a description is ambiguous.
- API keys in environment variables: `PEXELS_API_KEY`, `PIXABAY_API_KEY`.

## APIs
- Pexels: `GET https://api.pexels.com/videos/search?query=...&orientation=landscape&size=medium&per_page=15`, header `Authorization: <PEXELS_API_KEY>` (no "Bearer"). Use `video_files` for the download link; pick the file with width 1920 (else the closest above 1280). Page URL is `url`, author is `user.name`.
- Pixabay: `GET https://pixabay.com/api/videos/?key=<PIXABAY_API_KEY>&q=...&per_page=20&safesearch=true`. Use `videos.large.url` (else `videos.medium.url`). Page URL is `pageURL`, author is `user`.
- Search Pexels first; use Pixabay when Pexels has nothing good. Try the given search_terms, then 2 or 3 of your own variations from what_to_show.

## How to choose a clip
- Matches what_to_show and the narration at that moment. Literal and clear beats artistic.
- People shown should fit the audience: retirees and people 50+ wherever the shot is about the viewer.
- Landscape 16:9, at least 1280 wide (1920 preferred), and at least 1 second LONGER than the shot duration.
- No visible brand logos, no readable text that contradicts the narration, no watermarks.
- Calm camera, no fast whip pans, no party or nightclub energy.
- Doula, hospice and guardianship shots: gentle and respectful only. No patient faces, no hospital equipment close ups, nothing distressing.
- Shots that share a row (B002a, B002b, B002c) must be three DIFFERENT clips that cut together well (same mood and light).
- Never use the same clip twice in the whole video.
- If a shot has an overlay_on_top (lower third), prefer a clip with calm space in the lower third of the frame.
- trim_start_sec: where to start inside the clip. Default 0.5; move it to skip a bad opening.

## Output (commit and push only these, never the video files)
1. `docs/broll-manifest.csv` with exactly these columns, one row per shot_id in broll-shots.csv order:
   `shot_id,provider,provider_id,page_url,file_url,width,height,clip_duration_sec,trim_start_sec,author,search_used,notes`
   provider is `pexels` or `pixabay`. Leave file_url empty only if nothing acceptable exists, and say why in notes.
2. `docs/broll-previews/<shot_id>.jpg`: one thumbnail per shot (Pexels `image`, Pixabay `videos.large.thumbnail`), resized to 480 px wide.
3. `docs/broll-review.html`: a simple page showing every shot in timeline order: shot_id, timecode, what_to_show, the thumbnail, provider link. Self-contained, images referenced relatively.
4. `docs/broll-credits.txt`: "Video by <author> on <Pexels|Pixabay>: <page_url>" for every clip (good practice for the video description).

## Check before you finish
- 146 manifest rows, no duplicate provider_id, every chosen clip is long enough (clip_duration_sec >= trim_start_sec + shot duration + 0.5).
- Summarise: how many shots filled, which were hard, and any shot you left empty.

## What the editor does next (for your information)
On the editing PC: `python tools/download_broll.py "D:\ai jobs\broll"` downloads every clip, named `<shot_id>_<provider><id>.mp4`.
Then `python tools/make_timeline.py "<graphics folder>" --folder-path "D:\ai jobs" --broll-folder "D:\ai jobs\broll"` builds one DaVinci timeline with B-roll on V2 and graphics on V3.
