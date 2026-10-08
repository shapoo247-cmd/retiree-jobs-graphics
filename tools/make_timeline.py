#!/usr/bin/env python3
"""Build DaVinci Resolve timelines that place every graphic at its cue-sheet time.

Usage:
  python tools/make_timeline.py [CLIPS_FOLDER] [--folder-path "D:\\ai jobs"]

CLIPS_FOLDER  folder holding the rendered clips (default: renders/). Clips are matched
              to the cue sheet by their ID prefix (MG01, SC03, SS01 ...), so any
              file name like "MG07_48-to-94.mp4" works.
--folder-path the full path of that folder on the editing computer. Only used by the
              FCPXML, so Resolve finds the files without relinking. Optional.
--broll-folder folder holding the downloaded B-roll (files named B001_..., B002a_...).
              When given, B-roll goes on V2 and graphics move up to V3 in the FCPXML,
              and ai-jobs-broll.edl is written too. Trim points come from
              docs/broll-manifest.csv (trim_start_sec).
--broll-path  full path of the B-roll folder on the editing computer (FCPXML only).
              Default: <folder-path>\broll

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
    ap.add_argument('--broll-folder', default=None)
    ap.add_argument('--broll-path', default=None)
    ap.add_argument('--probe', default=None, help='csv of file,duration,... from ffprobe (optional)')
    ap.add_argument('--out', default=None, help='folder for the timeline files (default: the clips folder)')
    a = ap.parse_args()
    clips = Path(a.clips)
    out = Path(a.out) if a.out else clips
    out.mkdir(parents=True, exist_ok=True)
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
    (out / 'ai-jobs-graphics.edl').write_text("\n".join(edl), encoding='utf-8')

    # ---------- FCPXML 1.9 (graphics on V2 over an empty V1 gap starting at 0) ----------
    def make_url(folder, fallback):
        if folder:
            base = PureWindowsPath(folder) if (':' in folder or '\\' in folder) else Path(folder)
            def url(name):
                p = str(base / name).replace('\\', '/')
                if not p.startswith('/'):
                    p = '/' + p
                return 'file://' + quote(p, safe='/:')
        else:
            def url(name):
                return fallback + quote(name)
        return url
    url = make_url(a.folder_path, 'file:///ai%20jobs/')
    bpath = a.broll_path or (str(PureWindowsPath(a.folder_path) / 'broll') if a.folder_path and (':' in a.folder_path or '\\' in a.folder_path)
                             else (str(Path(a.folder_path) / 'broll') if a.folder_path else None))
    burl = make_url(bpath, 'file:///ai%20jobs/broll/')

    # ---------- B-roll (optional) ----------
    # Shots are grouped by row. The clips present for a row share the row's full time
    # equally, so a row with 1 of 3 clips still has no hole (if the clip is long enough).
    bshots, bmissing, bgaps = [], [], []
    if a.broll_folder:
        bf = Path(a.broll_folder)
        bfiles = {}
        for p in bf.iterdir() if bf.exists() else []:
            m = re.match(r'(B\d{3}[abc]?)_', p.name, re.I)
            if m and p.suffix.lower() in EXTS:
                bfiles[m.group(1)] = p.name
        man, lens = {}, {}
        mp = ROOT / 'docs' / 'broll-manifest.csv'
        if mp.exists():
            for r in csv.DictReader(open(mp, encoding='utf-8')):
                man[r['shot_id']] = r
                if r.get('clip_duration_sec'):
                    lens[r['shot_id']] = float(r['clip_duration_sec'])
        if a.probe:
            for line in open(a.probe, encoding='utf-8'):
                parts = line.strip().split(',')
                m = re.match(r'(B\d{3}[abc]?)_', parts[0])
                if m and len(parts) > 1:
                    lens[m.group(1)] = float(parts[1])
        rows = {}
        for s_ in csv.DictReader(open(ROOT / 'docs' / 'broll-shots.csv', encoding='utf-8')):
            rows.setdefault(s_['row_id'], []).append(s_)
        for rid, ss in rows.items():
            rin, rout = frames(ss[0]['in_sec']), frames(ss[-1]['out_sec'])
            avail = [x for x in ss if x['shot_id'] in bfiles]
            if not avail:
                bmissing.append((rid, ss[0]['in_tc'], ss[-1]['out_tc'], ss[0]['what_to_show']))
                continue
            n = len(avail)
            cursor = rin
            for k, x in enumerate(avail):
                want_in = rin + (rout - rin) * k // n
                want_out = rin + (rout - rin) * (k + 1) // n
                want_in = max(want_in, cursor)
                sid = x['shot_id']
                L = frames(lens[sid]) if sid in lens else None
                trim = float((man.get(sid) or {}).get('trim_start_sec') or 0.5)
                t0 = frames(trim)
                need = want_out - want_in
                if L is not None:
                    if t0 + need > L:
                        t0 = max(0, L - need)
                    if t0 + need > L:
                        need = L - t0
                if need <= 0:
                    continue
                bshots.append((x, bfiles[sid], t0, want_in, want_in + need, L))
                cursor = want_in + need
            if cursor < rout - 6:
                bgaps.append((rid, tc(cursor, 0), tc(rout, 0), round((rout - cursor) / FPS, 1)))
        bedl = ["TITLE: AI JOBS BROLL", "FCM: NON-DROP FRAME", ""]
        for n_, (x, name, t0, fin, fout, _L) in enumerate(bshots, 1):
            bedl += [f"{n_:03d}  {x['shot_id']:<8} V     C        {tc(t0,0)} {tc(t0 + fout - fin,0)} {tc(fin)} {tc(fout)}",
                     f"* FROM CLIP NAME: {name}", f"* SOURCE FILE: {name}", ""]
        (out / 'ai-jobs-broll.edl').write_text("\n".join(bedl), encoding='utf-8')
    glane = 2 if bshots else 1
    total = max(frames(c['out_sec']) for c in cues) + FPS * 2
    res = ['<format id="r0" name="FFVideoFormat1080p30" frameDuration="1/30s" width="1920" height="1080"/>']
    clips_xml = []
    for i, c in enumerate(placed, 1):
        name = files[c['id']]
        fin, fout = frames(c['in_sec']), frames(c['out_sec'])
        dur = fout - fin
        res.append(f'<asset id="a{i}" name="{name}" start="0s" duration="{rt(dur)}" hasVideo="1" format="r0">'
                   f'<media-rep kind="original-media" src="{url(name)}"/></asset>')
        clips_xml.append(f'<asset-clip ref="a{i}" lane="{glane}" offset="{rt(fin)}" name="{name}" start="0s" duration="{rt(dur)}" format="r0"/>')
    for j, (s_, name, t0, fin, fout, L) in enumerate(bshots, 1):
        dur = fout - fin
        alen = L if L else t0 + dur + 10 * FPS
        res.append(f'<asset id="b{j}" name="{name}" start="0s" duration="{rt(alen)}" hasVideo="1" format="r0">'
                   f'<media-rep kind="original-media" src="{burl(name)}"/></asset>')
        clips_xml.append(f'<asset-clip ref="b{j}" lane="1" offset="{rt(fin)}" name="{name}" start="{rt(t0)}" duration="{rt(dur)}" format="r0"/>')
    x = ['<?xml version="1.0" encoding="UTF-8"?>', '<!DOCTYPE fcpxml>', '<fcpxml version="1.9">',
         '<resources>', *res, '</resources>', '<library><event name="AI Jobs">',
         '<project name="AI Jobs Graphics"><sequence format="r0" duration="' + rt(total) + '" tcStart="0s" tcFormat="NDF">',
         '<spine>', f'<gap name="Gap" offset="0s" start="0s" duration="{rt(total)}">', *clips_xml, '</gap>',
         '</spine></sequence></project></event></library></fcpxml>']
    (out / 'ai-jobs-graphics.fcpxml').write_text("\n".join(x), encoding='utf-8')

    rep = [f"Placed {len(placed)} of {len(cues)} graphics."]
    if a.broll_folder:
        rep.append(f"Placed {len(bshots)} B-roll clips. Rows with no clip: {len(bmissing)}. Rows with a short hole: {len(bgaps)}.")
        rep += [f"EMPTY B-roll row {r} {i} to {o}: {w}" for r, i, o, w in bmissing]
        rep += [f"HOLE in B-roll row {r} {i} to {o} ({d}s): clips too short to cover" for r, i, o, d in bgaps]
    rep += [f"MISSING {c['id']} ({c['on_screen']}) at {tc(frames(c['in_sec']), 0)}" for c in missing]
    (out / 'timeline-report.txt').write_text("\n".join(rep), encoding='utf-8')
    print("\n".join(rep))


if __name__ == '__main__':
    main()
