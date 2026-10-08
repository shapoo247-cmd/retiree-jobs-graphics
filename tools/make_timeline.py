#!/usr/bin/env python3
"""Build DaVinci Resolve timelines that place every graphic at its cue-sheet time.

Usage:
  python tools/make_timeline.py [CLIPS_FOLDER] [--folder-path "D:\\ai jobs"]

CLIPS_FOLDER  folder holding the rendered clips (default: renders/). Clips are matched
              to the cue sheet by their ID prefix (MG01, SC03, SS01 ...), so any
              file name like "MG07_48-to-94.mp4" works.
--folder-path the full path of that folder on the editing computer. Only used by the
              FCPXML, so Resolve finds the files without relinking. Optional.

Writes into CLIPS_FOLDER:
  ai-jobs-graphics.edl     (recommended: needs no paths, Resolve matches by file name)
  ai-jobs-graphics.fcpxml  (backup: carries full paths; relink once if offline)
  timeline-report.txt      (which IDs were placed or missing)
"""
import csv, os, re, sys, argparse
from pathlib import Path, PureWindowsPath
from urllib.parse import quote

FPS = 30
ROOT = Path(__file__).resolve().parent.parent
EXTS = {'.mp4', '.mov'}


def frames(sec):
    return round(float(sec) * FPS)


def tc(f, hour=1):
    f += hour * 3600 * FPS
    return f"{f // (3600*FPS):02d}:{f // (60*FPS) % 60:02d}:{f // FPS % 60:02d}:{f % FPS:02d}"


def rt(f):
    return f"{f}/{FPS}s" if f % FPS else f"{f // FPS}s"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('clips', nargs='?', default=str(ROOT / 'renders'))
    ap.add_argument('--folder-path', default=None)
    a = ap.parse_args()
    clips = Path(a.clips)
    cues = list(csv.DictReader(open(ROOT / 'docs' / 'cue-sheet.csv', encoding='utf-8')))
    cues.sort(key=lambda c: float(c['in_sec']))

    files = {}
    for p in clips.iterdir() if clips.exists() else []:
        m = re.match(r'(MG\d\d|SC\d\d|SS\d\d)', p.name, re.I)
        if m and p.suffix.lower() in EXTS:
            files[m.group(1).upper()] = p.name

    placed, missing = [], []
    for c in cues:
        (placed if c['id'] in files else missing).append(c)

    # ---------- EDL (CMX3600, one video track, record TC starts 01:00:00:00) ----------
    edl = ["TITLE: AI JOBS GRAPHICS", "FCM: NON-DROP FRAME", ""]
    n = 1
    for c in placed:
        name = files[c['id']]
        fin, fout = frames(c['in_sec']), frames(c['out_sec'])
        dur = fout - fin
        reel = c['id']
        edl.append(f"{n:03d}  {reel:<8} V     C        {tc(0,0)} {tc(dur,0)} {tc(fin)} {tc(fout)}")
        edl.append(f"* FROM CLIP NAME: {name}")
        edl.append(f"* SOURCE FILE: {name}")
        edl.append("")
        n += 1
    (clips / 'ai-jobs-graphics.edl').write_text("\n".join(edl), encoding='utf-8')

    # ---------- FCPXML 1.9 (graphics on V2 over an empty V1 gap starting at 0) ----------
    if a.folder_path:
        base = PureWindowsPath(a.folder_path) if (':' in a.folder_path or '\\' in a.folder_path) else Path(a.folder_path)
        def url(name):
            p = str(base / name).replace('\\', '/')
            if not p.startswith('/'):
                p = '/' + p
            return 'file://' + quote(p, safe='/:')
    else:
        def url(name):
            return 'file:///ai%20jobs/' + quote(name)
    total = max(frames(c['out_sec']) for c in cues) + FPS
    res = ['<format id="r0" name="FFVideoFormat1080p30" frameDuration="1/30s" width="1920" height="1080"/>']
    clips_xml = []
    for i, c in enumerate(placed, 1):
        name = files[c['id']]
        fin, fout = frames(c['in_sec']), frames(c['out_sec'])
        dur = fout - fin
        res.append(f'<asset id="a{i}" name="{name}" start="0s" duration="{rt(dur)}" hasVideo="1" format="r0">'
                   f'<media-rep kind="original-media" src="{url(name)}"/></asset>')
        clips_xml.append(f'<asset-clip ref="a{i}" lane="1" offset="{rt(fin)}" name="{name}" start="0s" duration="{rt(dur)}" format="r0"/>')
    x = ['<?xml version="1.0" encoding="UTF-8"?>', '<!DOCTYPE fcpxml>', '<fcpxml version="1.9">',
         '<resources>', *res, '</resources>', '<library><event name="AI Jobs">',
         '<project name="AI Jobs Graphics"><sequence format="r0" duration="' + rt(total) + '" tcStart="0s" tcFormat="NDF">',
         '<spine>', f'<gap name="Gap" offset="0s" start="0s" duration="{rt(total)}">', *clips_xml, '</gap>',
         '</spine></sequence></project></event></library></fcpxml>']
    (clips / 'ai-jobs-graphics.fcpxml').write_text("\n".join(x), encoding='utf-8')

    rep = [f"Placed {len(placed)} of {len(cues)} graphics."]
    rep += [f"MISSING {c['id']} ({c['on_screen']}) at {tc(frames(c['in_sec']), 0)}" for c in missing]
    (clips / 'timeline-report.txt').write_text("\n".join(rep), encoding='utf-8')
    print("\n".join(rep))


if __name__ == '__main__':
    main()
