#!/usr/bin/env python3
"""Download the chosen B-roll clips listed in docs/broll-manifest.csv.

Run on the editing computer (Windows, Mac or Linux, Python 3.8+, no installs):
  python tools/download_broll.py "D:\\ai jobs\\broll"

Saves each clip as <shot_id>_<provider><id>.mp4 (e.g. B002a_pexels123456.mp4).
Already-downloaded files are skipped, so it is safe to run again.
"""
import csv, sys, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
    rows = list(csv.DictReader(open(ROOT / 'docs' / 'broll-manifest.csv', encoding='utf-8')))
    ok = fail = skip = 0
    for r in rows:
        if not r.get('file_url'):
            print(f"-- {r['shot_id']}: no clip chosen"); fail += 1; continue
        name = f"{r['shot_id']}_{r['provider']}{r['provider_id']}.mp4"
        dest = out / name
        if dest.exists() and dest.stat().st_size > 0:
            skip += 1; continue
        for attempt in range(3):
            try:
                req = urllib.request.Request(r['file_url'], headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=120) as resp, open(dest, 'wb') as f:
                    while True:
                        chunk = resp.read(1 << 20)
                        if not chunk: break
                        f.write(chunk)
                print(f"ok {name}"); ok += 1; break
            except Exception as e:
                if dest.exists(): dest.unlink()
                if attempt == 2:
                    print(f"FAILED {name}: {e}"); fail += 1
                else:
                    time.sleep(3)
    print(f"\nDownloaded {ok}, skipped {skip} existing, failed {fail}, total {len(rows)}.")


if __name__ == '__main__':
    main()
