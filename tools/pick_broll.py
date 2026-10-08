#!/usr/bin/env python3
"""Pick Pixabay B-roll for docs/broll-shots.csv. Usage: python tools/pick_broll.py
Caches API results in the scratchpad dir given by BROLL_CACHE (default /tmp/broll_cache.json)."""
import csv, json, os, re, sys, time, urllib.parse, urllib.request
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
KEY = os.environ['PIXABAY_API_KEY']
CACHE = Path(os.environ.get('BROLL_CACHE', '/tmp/broll_cache.json'))
cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}

# row_id -> (queries best first, preferred tag words, avoid tag words)
OLD = ['senior','old','elderly','retired','grandfather','grandmother','grandpa','mature','pensioner','aged','older']
Q = {
'B001': (['senior laptop','old man laptop','elderly computer','retired man computer'], OLD+['laptop','computer'], []),
'B002': (['job interview','interview office','business interview','hiring interview'], ['interview','office','hiring','recruiter','candidate'], ['party']),
'B003': (['craftsman hands','carpenter hands','woodworking hands','senior woodworker','potter hands'], ['hands','craftsman','carpenter','woodworking','workshop']+OLD, []),
'B004': (['office celebration','retirement party','office party cake','farewell colleagues','colleagues celebrating'], ['office','cake','celebration','colleagues','handshake'], ['nightclub','dance','club']),
'B005': (['frustrated computer','stressed office worker','confused computer','error computer screen','office worker stress'], ['frustrated','stress','stressed','confused','error','office','computer'], []),
'B006': (['senior phone call','old man phone','elderly man telephone','senior talking phone smiling'], OLD+['phone','call','smiling','telephone'], []),
'B007': (['businessman walking office','senior businessman','older man suit','businessman entering building','mature businessman'], OLD+['businessman','office','briefcase'], []),
'B008': (['calculator','calculator money','paycheck','counting money calculator','calculator desk'], ['calculator','hands','paycheck','money','finance'], []),
'B009': (['social security','pension check','retirement benefits','check money senior','retirement savings'], ['social security','retirement','pension','check','benefits','money'], []),
'B010': (['senior couple finances','old couple paperwork','elderly couple table','senior couple bills','retired couple home'], OLD+['couple','finance','bills','table','kitchen','paperwork'], []),
'B011': (['senior woman phone','elderly woman telephone','old woman paperwork','senior phone paperwork','old woman phone call'], OLD+['woman','phone','paperwork'], []),
'B012': (['wall crack','cracked wall','surgeon operating room','accountant ledger','audit documents','reading file','crack building'], ['crack','wall','surgeon','surgery','operating','accountant','ledger','audit','documents','file'], ['patient face']),
'B013': (['video conference','video call laptop','online meeting','zoom meeting','webinar laptop'], ['video call','video conference','online meeting','zoom','laptop','meeting'], []),
'B014': (['reading documents','man reading papers','senior reading documents','man desk paperwork','reviewing papers'], ['reading','documents','papers','desk','home','paperwork'], []),
'B015': (['nurse paperwork','nurse documents','nurse office','medical records','nurse writing'], ['nurse','paperwork','records','medical','documents'], ['patient','surgery']),
'B016': (['online tutoring','video call teacher','senior video call','senior teaching online','video recording phone tripod','man filming himself','vlogger tripod'], ['tutor','video call','teaching','online','tripod','phone','recording','filming','vlog']+OLD, []),
'B017': (['old hands notebook','writing notebook hands','senior writing','turning pages','hands book pages','journal writing'], ['hands','notebook','writing','pages','book','journal'], []),
'B018': (['graduation caps','graduation','artificial intelligence','AI technology','modern office','chatbot'], ['graduation','caps','ai','artificial intelligence','office','technology','interface'], []),
'B019': (['garage toolbox','man garage tools','workshop tools','senior workshop','garage workbench'], ['garage','toolbox','tools','workshop','workbench']+OLD, []),
'B020': (['handyman fence','fence repair','repairing fence','man building fence','handyman'], ['fence','repair','handyman','hammer','garden'], []),
'B021': (['handyman drill','man drilling','handyman door','electric drill','repairman door','handyman tools'], ['drill','handyman','door','repairman','tools','screwdriver'], []),
'B022': (['suburban house','american house','old house','house exterior','residential street houses'], ['house','home','suburb','suburban','residential','exterior'], []),
'B023': (['laptop tutorial','man watching laptop','watching video laptop','learning online laptop','person laptop video'], ['laptop','watching','learning','tutorial','online','video'], []),
'B024': (['clipboard estimate','handyman clipboard','writing clipboard','contractor clipboard','contractor writing','construction estimate'], ['clipboard','estimate','contractor','handyman','writing','invoice'], []),
'B025': (['senior opening door','elderly woman door','old woman home visitor','handyman senior woman','elderly home visit','repairman visit elderly'], OLD+['door','visit','handyman','home'], []),
'B026': (['carrying ladder','man ladder','neighbors talking fence','neighbors chatting','neighbours','garden fence talking','two men talking outdoors'], ['ladder','neighbors','neighbours','fence','talking','chatting','garden'], []),
'B027': (['conference room meeting','business meeting table','meeting room discussion','arbitration','business negotiation','boardroom'], ['meeting','conference','table','negotiation','boardroom','discussion'], ['party']),
'B028': (['resume desk','resume job','diploma resume','job application','cv desk'], ['resume','cv','diploma','application','desk','job'], []),
'B029': (['librarian','library books shelf','shelving books','accountant desk','business meeting group','focus group'], ['librarian','library','books','accountant','meeting','group'], []),
'B030': (['senior business meeting','older business people','mature business meeting','elderly meeting office','senior professionals'], OLD+['business','meeting','office','professionals'], []),
'B031': (['calendar pages','calendar','handshake','senior listening','handshake business','elderly man listening','turning calendar'], ['calendar','handshake','listening','trust']+OLD, []),
'B032': (['calendar months','calendar','turning calendar','calendar pages','customers returning','tax season'], ['calendar','months','pages','tax','customers'], []),
'B033': (['tax forms','tax form','taxes paperwork','tax documents desk','income tax','tax return'], ['tax','taxes','form','forms','paperwork','documents'], []),
'B034': (['tax office','storefront','now hiring sign','accountant helping client','shop front','hiring sign','office client consultation'], ['tax','storefront','hiring','accountant','client','shop','consultation'], []),
'B035': (['senior online course','elderly laptop learning','old man laptop study','senior learning computer','older woman laptop'], OLD+['laptop','learning','study','course','computer'], []),
'B036': (['senior accountant','older accountant','old man office desk','elderly office work','senior office','senior desk'], OLD+['accountant','office','desk','work'], []),
'B037': (['retiree laptop','senior working laptop','elderly working computer','old man typing','senior home office','senior social security'], OLD+['laptop','working','computer','typing','home'], []),
'B038': (['watching tutorial laptop','person laptop video','laptop learning','man watching laptop','woman laptop video'], ['laptop','watching','learning','tutorial','video'], []),
'B039': (['handshake client','handshake office','business handshake','client handshake','shaking hands'], ['handshake','shaking hands','client','office','business'], []),
'B040': (['quiet bedroom','holding hands family','bedside caregiver','caregiver comfort','family holding hands','phone call home','calm bedroom morning'], ['bedroom','hands','caregiver','family','comfort','phone','holding'], ['hospital bed','patient face','sick','dying','icu']),
'B041': (['holding elderly hand','caregiver holding hand','comforting hand','senior hand holding','nurse holding hand','holding hands elderly'], ['hand','hands','holding','caregiver','comfort']+OLD, ['icu','dying','sick']),
'B042': (['senior women class','older women classroom','elderly women learning','senior women group','older women workshop','women training class'], OLD+['women','class','classroom','training','group','learning'], []),
'B043': (['volunteer comforting','volunteer badge','volunteer elderly','comforting family','hugging comfort','supportive hug','volunteers helping'], ['volunteer','comfort','comforting','support','hug','family','badge'], ['dying','icu']),
'B044': (['comforting woman','compassion support','woman comforting','comforting hug','consoling','supportive friend'], ['comfort','comforting','compassion','support','consoling','hug'], ['icu','dying']),
'B045': (['us capitol','capitol building','washington dc','people waiting line','hallway queue','capitol dawn','government building'], ['capitol','washington','dc','line','queue','waiting','government','hallway'], []),
'B046': (['broadway theater','theater marquee','theatre sign','people queue outside','theater line','new york theater','times square'], ['broadway','theater','theatre','marquee','queue','line','new york','times square'], []),
'B047': (['waiting in line phone','queue phone','person waiting phone','waiting line','man waiting queue phone','waiting room phone'], ['waiting','line','queue','phone','smartphone'], []),
'B048': (['senior waiting line','old man queue','folding chair','queue timelapse','people queue timelapse','comfortable shoes','line timelapse','elderly waiting'], OLD+['line','queue','waiting','chair','timelapse','shoes'], []),
'B049': (['rain umbrellas','people umbrellas rain','rainy street','rain night street','queue rain','umbrellas'], ['rain','umbrella','umbrellas','street','night','queue','wet'], []),
'B050': (['hurricane','storm wind rain','tropical storm','hurricane palm trees','storm waves wind','storm'], ['hurricane','storm','wind','rain','palm','tropical'], []),
'B051': (['hail damage roof','roof damage','insurance adjuster','roof inspection','damaged roof','roof inspector','storm damage houses','clipboard inspection'], ['hail','roof','damage','insurance','adjuster','inspection','clipboard','tablet','damaged'], []),
'B052': (['truck driving','pickup truck road','driving truck','car driving suburban','driving neighborhood','driving car road'], ['truck','pickup','driving','car','road','neighborhood'], ['race','chase']),
'B053': (['weather radar','radar storm','blue sky','calm sky','phone ringing desk','telephone desk','weather map','clear sky clouds'], ['radar','weather','sky','blue','phone','telephone','ringing','clouds'], []),
'B054': (['exam room','students exam','fingerprint scanner','fingerprint','taking exam','biometric','test paper'], ['exam','test','fingerprint','scanner','biometric','students'], []),
'B055': (['online course laptop','online learning','e-learning','laptop course','online class','webinar'], ['online','course','learning','laptop','class','e-learning','training'], []),
'B056': (['senior office desk','older man office','elderly man computer desk','senior working desk','mature man office desk','old man desk'], OLD+['office','desk','computer','working'], []),
'B057': (['water damage','water leak ceiling','roof drone','drone house','courthouse','courthouse exterior','drone aerial roof','flood house'], ['water','damage','leak','drone','roof','courthouse','court','flood'], []),
'B058': (['elderly caregiver','gavel','judge gavel','paying bills','bills','for sale sign','home for sale','real estate sign','caregiver senior'], ['caregiver','gavel','judge','bills','sale','real estate','sign']+OLD, []),
'B059': (['nonprofit office','social worker','office team','office meeting','charity office','community center'], ['nonprofit','social worker','office','charity','community','team'], []),
'B060': (['banker','bank','social worker','adult child elderly parent','helping elderly paperwork','daughter elderly mother','family finances','senior bank'], ['banker','bank','social worker','child','daughter','parent','elderly','paperwork','finances']+OLD, []),
'B061': (['classroom','adult education','exam room','fingerprint scanner','diploma','certificate','students classroom','graduation diploma','training class'], ['classroom','class','adult','exam','fingerprint','diploma','certificate','education'], []),
'B062': (['court documents','legal papers','signing documents','crowd','elderly crowd','court paper','gavel documents','seniors group'], ['court','legal','papers','documents','signing','crowd','gavel']+OLD, []),
'B063': (['moving boxes','estate sale','garage sale','price tags','house clutter','antiques','flea market','yard sale','boxes house'], ['moving','boxes','estate','sale','price','tags','garage','clutter','antiques','market'], []),
'B064': (['garage sale','pricing items','price tag','flea market','antique shop','yard sale','selling items','shop owner'], ['sale','price','tag','market','antique','shop','selling','owner'], []),
'B065': (['movers couch','moving furniture','carrying sofa','movers','moving day','carrying furniture'], ['movers','moving','couch','sofa','furniture','carrying'], []),
'B066': (['online auction','online bidding','online shopping laptop','auction','ecommerce laptop','laptop buying','internet shopping'], ['auction','bidding','shopping','online','laptop','ecommerce'], []),
'B067': (['family photos','old photos','looking at photos','family album','antiques table','grandparents photos','photo album','family memories'], ['photos','photo','album','family','memories','antiques']+OLD, []),
}

JUNK = ['cartoon','3d','wallpaper','green screen','chroma','abstract','animation','particles','tennis','cat on','kitten','halloween','cigarette','tobacco','vector','illustration','dance','club','nightclub','neon']
OVR = json.loads(Path(os.environ['BROLL_OVR']).read_text()) if os.environ.get('BROLL_OVR') and Path(os.environ['BROLL_OVR']).exists() else {}

XQ = json.loads(Path(os.environ['BROLL_XQ']).read_text()) if os.environ.get('BROLL_XQ') and Path(os.environ['BROLL_XQ']).exists() else {}
for _r, _qs in XQ.items():
    Q[_r] = (Q[_r][0] + _qs, Q[_r][1], Q[_r][2])

def api(q):
    if q in cache: return cache[q]
    url = 'https://pixabay.com/api/videos/?' + urllib.parse.urlencode({'key': KEY, 'q': q, 'per_page': 20, 'safesearch': 'true'})
    for a in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60) as r:
                hits = json.load(r)['hits']
            break
        except Exception as e:
            time.sleep(2 + 3 * a); hits = None
    if hits is None: print('FAILED', q, file=sys.stderr); return []
    cache[q] = hits; CACHE.write_text(json.dumps(cache)); time.sleep(0.7)
    return hits

def entry(s, h, v, q, sc, note):
    return dict(shot_id=s['shot_id'], provider='pixabay', provider_id=h['id'], page_url=h['pageURL'], file_url=v['url'], width=v['width'], height=v['height'], clip_duration_sec=h['duration'], trim_start_sec=0.5, author=h['user'], search_used=q, notes=note, _thumb=v['thumbnail'], _s=s)

def empty(s, why):
    return dict(shot_id=s['shot_id'], provider='pixabay', provider_id='', page_url='', file_url='', width='', height='', clip_duration_sec='', trim_start_sec='', author='', search_used='', notes=why, _thumb='', _s=s)

def main():
    shots = list(csv.DictReader(open(ROOT / 'docs/broll-shots.csv', encoding='utf-8')))
    rows = {}
    for s in shots: rows.setdefault(s['row_id'], []).append(s)
    allhits = {h['id']: (h, q) for q, hs in cache.items() for h in hs}
    used = {v for v in OVR.values() if isinstance(v, int)}
    out = []; dump = {}
    for rid, group in rows.items():
        queries, prefer, avoid = Q[rid]
        pool = {}
        for qi, q in enumerate(queries):
            for pos, h in enumerate(api(q)):
                v = h['videos'].get('large') or h['videos'].get('medium')
                if not v or v['width'] < 1280 or v['width'] < v['height'] * 1.5: continue
                tags = h['tags'].lower()
                sc = 10 - qi * 1.5 - pos * 0.15
                hit = sum(1 for w in prefer if re.search(r'\b' + re.escape(w) + r'\b', tags))
                sc += 2.5 * hit
                if hit == 0: sc -= 12
                sc -= 8 * sum(1 for w in JUNK if w in tags)
                sc -= sum(6 for w in avoid if w in tags)
                if h.get('isLowQuality'): sc -= 3
                if h.get('isAiGenerated'): sc -= 5
                if v['width'] >= 1920: sc += 1
                e = pool.get(h['id'])
                if not e or sc > e[0]: pool[h['id']] = (sc, h, v, q)
        ranked = sorted(pool.values(), key=lambda c: -c[0])
        dump[rid] = [dict(id=c[1]['id'], dur=c[1]['duration'], thumb=c[2]['thumbnail'], tags=c[1]['tags'][:90]) for c in ranked[:16]]
        for s in group:
            need = 0.5 + float(s['duration_sec']) + 0.5
            ov = OVR.get(s['shot_id'])
            if ov == 'none':
                out.append(empty(s, 'No suitable Pixabay clip found; needs manual stock or Pexels')); continue
            if isinstance(ov, int):
                h, q = allhits[ov]; v = h['videos'].get('large') or h['videos'].get('medium')
                assert h['duration'] >= need, (s['shot_id'], ov, h['duration'], need)
                out.append(entry(s, h, v, q, 0, 'Pixabay only (Pexels not searched). Chosen by eye from search thumbnails')); continue
            cands = [c for c in ranked if c[1]['id'] not in used and c[1]['duration'] >= need]
            if not cands:
                out.append(empty(s, 'No acceptable Pixabay clip long enough')); continue
            sc, h, v, q = cands[0]; used.add(h['id'])
            out.append(entry(s, h, v, q, sc, f"Pixabay only (Pexels not searched). Auto pick, weak match; tags: {h['tags'][:80]}"))
    json.dump(out, open(os.environ.get('BROLL_OUT', '/tmp/broll_pick.json'), 'w'), indent=1)
    json.dump(dump, open(os.environ.get('BROLL_OUT', '/tmp/broll_pick.json') + '.pool', 'w'), indent=1)
    print(len(out), 'picked;', sum(1 for o in out if not o['file_url']), 'empty')
main()
