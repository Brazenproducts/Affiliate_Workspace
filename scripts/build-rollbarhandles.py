#!/usr/bin/env python3
"""
CANONICAL BUILDER — rollbarhandles.com
Single source of truth. Edit here, run, push. Never patch HTML directly.

Usage: python3 build-rollbarhandles.py
"""
from pathlib import Path
from datetime import date

SITE = Path('/home/ubuntu/.openclaw/workspace/sites/rollbarhandles.com')
DOMAIN = 'rollbarhandles.com'
TAG = 'brazenprodu01-20'
YEAR = '2026'
TODAY = date.today().isoformat()

BARTACT_IMG = 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-grab-handles-bartact-paracord-grab-handles-compatible-with-ford-bronco-2021-2022-roll-bar-front-or-rear-pair-of-2-made-in-usa-29035990482987.jpg?v=1759252773'

# ─── CONFIRMED PRODUCTS (all hashes CDN-verified) ────────────────────────────

# Universal / multi-vehicle
UNIVERSAL = [
    ('B093ZVQZMZ','81-mQxB3v2L','4-Pack Roll Bar Grab Handles — Jeep Wrangler JK/JKU/JL/JLU'),
    ('B0C1BWG5XQ','81xHAUqyb+L','Moveland 4-Pack Paracord Grab Handles — Jeep Wrangler'),
    ('B09375LKPM','81rCtv9pDCL','4-Pack Paracord Grab Handles — JK/JL/TJ/YJ Multi-Gen'),
    ('B0BBLM7Z63','81t-nwIoGIL','GAIZON 4-Pack 550 Paracord Grab Handles'),
    ('B018NU9KPY','81bZxXldZsL','Danti 4-Pack Paracord Grab Handles — All Gens'),
]

# Per-vehicle products (use universal + Bartact for vehicle pages)
VEHICLES = [
    {
        'id': 'jeep-wrangler-jl',
        'label': 'Jeep Wrangler JL / JLU',
        'years': '2018-2026',
        'slug': 'jeep-wrangler-jl-roll-bar-handles',
        'bartact_url': 'https://bartact.com/products/paracord-grab-handles-bolt-on-for-jeep-wrangler-jl-jlu-2018-made-in-usa-550-paracord-bartact-1',
        'note': 'JL/JLU roll bars contain SRS airbags. Only use bolt-on grab handles — never wraparound.',
        'products': UNIVERSAL,
    },
    {
        'id': 'jeep-wrangler-jk',
        'label': 'Jeep Wrangler JK / JKU',
        'years': '2007-2018',
        'slug': 'jeep-wrangler-jk-roll-bar-handles',
        'bartact_url': 'https://bartact.com/collections/grab-handles',
        'note': None,
        'products': UNIVERSAL,
    },
    {
        'id': 'jeep-wrangler-tj',
        'label': 'Jeep Wrangler TJ / LJ',
        'years': '1997-2006',
        'slug': 'jeep-wrangler-tj-roll-bar-handles',
        'bartact_url': 'https://bartact.com/collections/grab-handles',
        'note': None,
        'products': UNIVERSAL,
    },
    {
        'id': 'jeep-gladiator',
        'label': 'Jeep Gladiator JT',
        'years': '2020-2026',
        'slug': 'jeep-gladiator-roll-bar-handles',
        'bartact_url': 'https://bartact.com/collections/grab-handles',
        'note': 'Gladiator roll bars also contain SRS airbags. Use bolt-on handles only.',
        'products': UNIVERSAL,
    },
    {
        'id': 'ford-bronco',
        'label': 'Ford Bronco',
        'years': '2021-2026',
        'slug': 'ford-bronco-roll-bar-handles',
        'bartact_url': 'https://bartact.com/collections/grab-handles',
        'note': None,
        'products': [
            ('B09ZTWW893','81su2gN84NL','SEVEN SPARTA Paracord Grab Handles — Ford Bronco'),
            ('B0BHZR5XGB','81NoqE8Jq4L','E-cowlboy Paracord Grab Handles — Ford Bronco'),
            ('B0BTDDSPG8','712YdLKKp5L','Boom Racing Aluminum Grab Handles — Ford Bronco'),
            ('B0CRY23BP8','71uabXYacXL','Sunsdrew 4-Pack Paracord Grab Handles — Ford Bronco'),
            ('B093ZVQZMZ','81-mQxB3v2L','4-Pack Roll Bar Grab Handles — Universal Fit'),
        ],
    },
]

CSS = """*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f4f5f7;color:#1a1a1a;line-height:1.75}
a{color:#c0392b;text-decoration:none}a:hover{text-decoration:underline}
header{background:#1a1a1a;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;border-bottom:3px solid #c0392b;position:sticky;top:0;z-index:100}
.logo{font-size:1.1em;font-weight:900;color:#fff;letter-spacing:-.5px}.logo span{color:#c0392b}
nav{display:flex;flex-wrap:wrap;gap:4px}
nav a{color:#ccc;font-size:.75em;padding:5px 9px;border-radius:4px;transition:background .15s}
nav a:hover{background:#c0392b;color:#fff;text-decoration:none}
.hero{background:linear-gradient(135deg,#1c2833 0%,#2e4053 55%,#922b21 100%);padding:56px 24px;text-align:center;color:#fff;border-bottom:3px solid #c0392b}
.hero h1{font-size:2em;font-weight:900;margin-bottom:12px;line-height:1.2}
.hero h1 span{color:#ff8c69}
.hero p{font-size:1em;color:rgba(255,255,255,.85);max-width:680px;margin:0 auto 10px;line-height:1.8}
.container{max-width:980px;margin:0 auto;padding:36px 22px}
.picks-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;margin:24px 0}
.pick-card{background:#f9f9f9;border:1px solid #e8e8e8;border-radius:10px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.pick-card img{width:100%;height:155px;object-fit:contain;border-radius:6px;background:#fff;border:1px solid #f0f0f0;padding:8px;display:block;margin-bottom:12px}
.badge{display:inline-block;font-size:.7em;font-weight:800;padding:4px 11px;border-radius:20px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:9px;margin-right:4px}
.b-red{background:#c0392b;color:#fff}.b-gray{background:#7f8c8d;color:#fff}.b-orange{background:#e67e22;color:#fff}
.pick-card h3{font-size:.95em;font-weight:800;color:#1a1a1a;margin-bottom:10px;line-height:1.4}
.amz-btn{display:block;text-align:center;background:#FF9900;color:#000;font-weight:800;padding:10px;border-radius:6px;font-size:.87em}
.amz-btn:hover{background:#e68a00;text-decoration:none;color:#000}
.bartact-pick-card{border:2px solid #c0392b;background:#fff8f7}
.bartact-pick-btn{display:block;text-align:center;background:#c0392b;color:#fff;font-weight:800;padding:10px;border-radius:6px;font-size:.87em}
.bartact-pick-btn:hover{background:#a93226;text-decoration:none;color:#fff}
.vehicle-nav{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:28px}
.vehicle-nav a{background:#fff;border:2px solid #e0e0e0;border-radius:8px;padding:10px 16px;font-size:.88em;font-weight:700;color:#1a1a1a}
.vehicle-nav a:hover,.vehicle-nav a.active{border-color:#c0392b;color:#c0392b;text-decoration:none}
.gen-note{background:#fff8f0;border-left:3px solid #e67e22;padding:10px 14px;border-radius:0 6px 6px 0;font-size:.87em;color:#7d6608;margin:0 0 18px;line-height:1.6}
.breadcrumb{font-size:.82em;color:#888;margin-bottom:20px}.breadcrumb a{color:#c0392b}
.intro{font-size:.95em;color:#333;line-height:1.8;margin-bottom:24px;max-width:720px}
.section-title{font-size:1.1em;font-weight:800;color:#1a1a1a;margin-bottom:4px}
.related{background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:20px;margin-top:32px}
.related h3{font-size:.93em;font-weight:800;margin-bottom:12px}
.related a{display:inline-block;margin:3px 6px 3px 0;font-size:.82em;color:#c0392b;border:1px solid #f5c6c0;padding:4px 12px;border-radius:20px;background:#fff8f7}
.related a:hover{background:#c0392b;color:#fff;text-decoration:none;border-color:#c0392b}
.faq-section{background:#1a1a1a;color:#fff;padding:48px 24px;margin-top:48px}
.faq-section h2{font-size:1.5em;font-weight:900;color:#c0392b;margin-bottom:26px;text-align:center}
.faq-wrap{max-width:760px;margin:0 auto}
.faq-item{border-bottom:1px solid #333;padding:18px 0}
.faq-item h3{color:#fff;font-size:.96em;font-weight:700;margin-bottom:7px}
.faq-item p{color:#aaa;font-size:.88em;line-height:1.75}
footer{background:#111;border-top:2px solid #c0392b;padding:26px 22px;text-align:center;color:#555;font-size:.82em}
footer a{color:#777}
.disclaimer{font-size:.77em;color:#444;margin-top:12px;max-width:700px;margin:12px auto 0;line-height:1.6}
@media(max-width:680px){.hero h1{font-size:1.5em}.picks-grid{grid-template-columns:1fr}}"""

NAV = '<a href="/">Home</a> <a href="/jeep-wrangler-jl-roll-bar-handles.html">Jeep JL</a> <a href="/jeep-wrangler-jk-roll-bar-handles.html">Jeep JK</a> <a href="/jeep-wrangler-tj-roll-bar-handles.html">Jeep TJ</a> <a href="/jeep-gladiator-roll-bar-handles.html">Gladiator</a> <a href="/ford-bronco-roll-bar-handles.html">Ford Bronco</a>'

FOOTER = f'''<footer>
<p>&copy; {YEAR} RollBarHandles.com &mdash; Independent product guide.</p>
<p style="margin-top:8px"><a href="/">Home</a> &middot; <a href="/about.html">About</a> &middot; <a href="/privacy.html">Privacy</a></p>
<p class="disclaimer">rollbarhandles.com is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.</p>
</footer>'''

def shell(title, desc, canon, body):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="https://{DOMAIN}/{canon}">
<style>{CSS}</style>
</head>
<body>
<header><div class="logo">Roll Bar<span>Handles</span></div><nav>{NAV}</nav></header>
{body}
{FOOTER}
</body>
</html>'''

def bartact_card(url):
    return f'''<div class="pick-card bartact-pick-card">
<img src="{BARTACT_IMG}" alt="Bartact Paracord Roll Bar Handles — Made in USA, Invented by Bartact" loading="lazy">
<span class="badge b-red">#1 Pick</span>
<span class="badge b-orange">Made in USA</span>
<h3>Bartact Paracord Roll Bar Handles &mdash; Invented by Bartact, Made in USA</h3>
<p>Bartact invented the paracord grab handle. 550 paracord, hand-woven in the USA. Multiple colors. Direct from the original maker.</p>
<a class="bartact-pick-btn" href="{url}" target="_blank" rel="noopener">Shop Bartact Direct &rarr;</a>
</div>'''

def amz_card(asin, h, title, num):
    img = f'https://m.media-amazon.com/images/I/{h}._AC_SL400_.jpg'
    url = f'https://www.amazon.com/dp/{asin}?tag={TAG}'
    return f'''<div class="pick-card">
<img src="{img}" alt="{title}" loading="lazy" onerror="this.style.display='none'">
<span class="badge b-gray">&#127464;&#127475; Manufactured in China</span>
<span class="badge b-red">#{num} Pick</span>
<h3>{title}</h3>
<a class="amz-btn" href="{url}" target="_blank" rel="noopener nofollow">View on Amazon &rarr;</a>
</div>'''

def vehicle_nav(current_id):
    links = []
    for v in VEHICLES:
        active = ' class="active"' if v['id'] == current_id else ''
        links.append(f'<a href="/{v["slug"]}.html"{active}>{v["label"]}</a>')
    return '<div class="vehicle-nav">' + ''.join(links) + '</div>'

def build_vehicle_page(v):
    note = f'<div class="gen-note">{v["note"]}</div>' if v['note'] else ''
    cards = [bartact_card(v['bartact_url'])]
    for i, (asin, h, title) in enumerate(v['products']):
        cards.append(amz_card(asin, h, title, i + 2))
    grid = '<div class="picks-grid">' + '\n'.join(cards) + '</div>'

    related = '<div class="related"><h3>Other Vehicles</h3>' + \
        ''.join(f'<a href="/{ov["slug"]}.html">{ov["label"]} {ov["years"]}</a>'
                for ov in VEHICLES if ov['id'] != v['id']) + '</div>'

    faq = '''<div class="faq-section"><h2>Frequently Asked Questions</h2><div class="faq-wrap">
<div class="faq-item"><h3>Who invented the paracord roll bar handle?</h3><p>Bartact. They invented the paracord grab handle for Jeep Wranglers and are the original USA-made source. Most Amazon listings are copies made in China.</p></div>
<div class="faq-item"><h3>Do JL Wrangler roll bars have airbags?</h3><p>Yes. 2018+ JL/JLU and Gladiator roll bars contain SRS airbags. Use bolt-on handles only — never wraparound styles that could block deployment.</p></div>
<div class="faq-item"><h3>What is 550 paracord?</h3><p>Type III military paracord rated to 550 lbs breaking strength. It is UV-resistant, rot-resistant, and extremely durable — the standard material for quality grab handles.</p></div>
</div></div>'''

    title = f'Best {v["label"]} {v["years"]} Roll Bar Handles [{YEAR}]'
    desc = f'Best roll bar grab handles for {v["label"]} {v["years"]}. Bartact #1, plus top Amazon picks. Verified fitment. Updated {YEAR}.'

    body = f'''<div class="hero">
<h1>Roll Bar Handles<br><span>{v["label"]} {v["years"]}</span></h1>
<p>Bartact invented the paracord grab handle. Here are the best picks for your {v["label"]}.</p>
</div>
<div class="container">
<p class="breadcrumb"><a href="/">Home</a> &rsaquo; {v["label"]} Roll Bar Handles</p>
{vehicle_nav(v["id"])}
{note}
<p class="intro">Roll bar grab handles are one of the most popular Jeep and Bronco accessories because they solve a real problem: giving passengers something solid to hold onto on rough terrain. Bartact invented the paracord grab handle and remains the only USA-made option. Everything else on Amazon is a copy made in China.</p>
<p class="section-title">Top Picks &mdash; {v["label"]} {v["years"]}</p>
{grid}
{related}
</div>
{faq}'''

    return shell(title, desc, v['slug'] + '.html', body)

def build_index():
    cards_html = ''
    for v in VEHICLES:
        cards_html += f'''<a href="/{v["slug"]}.html" style="display:block;background:#fff;border:2px solid #e0e0e0;border-radius:10px;padding:22px 18px;margin-bottom:14px;color:#1a1a1a;font-weight:700;font-size:1em">
{v["label"]} {v["years"]} Roll Bar Handles &rarr;
</a>'''

    faq = '''<div class="faq-section"><h2>Frequently Asked Questions</h2><div class="faq-wrap">
<div class="faq-item"><h3>Who invented the paracord roll bar grab handle?</h3><p>Bartact. They created the original paracord grab handle for Jeep Wranglers and are the only USA-made manufacturer. Every other grab handle you see on Amazon is a copy made in China.</p></div>
<div class="faq-item"><h3>Are roll bar grab handles safe on all Jeep Wranglers?</h3><p>Not all styles. JL/JLU (2018+) and Gladiator (2020+) roll bars contain SRS airbags. You must use bolt-on handles on these vehicles. JK, TJ, and YJ Wranglers do not have roll bar airbags and can use any style.</p></div>
<div class="faq-item"><h3>What is the best material for roll bar handles?</h3><p>550 paracord (Type III military paracord) is the gold standard — UV-resistant, rot-resistant, rated to 550 lbs. Aluminum billet handles are a good alternative for a more tactical look. Avoid cheap webbing or rubber handles.</p></div>
</div></div>'''

    body = f'''<div class="hero">
<h1>Best Roll Bar <span>Grab Handles</span></h1>
<p>Vehicle-specific picks for Jeep Wrangler, Gladiator, and Ford Bronco. Bartact #1 on every vehicle they make handles for.</p>
<p style="font-size:.78em;color:rgba(255,255,255,.45);margin-top:8px">Updated {YEAR} &middot; Amazon affiliate links</p>
</div>
<div class="container">
<p class="intro">Roll bar grab handles are one of the best bang-for-buck Jeep and Bronco upgrades. Bartact invented the paracord grab handle and still makes the best version in the USA. Select your vehicle below for specific picks and fitment notes.</p>
<p class="section-title" style="margin-bottom:14px">Select Your Vehicle</p>
{cards_html}
</div>
{faq}'''

    return shell(
        f'Best Roll Bar Grab Handles {YEAR} — Jeep Wrangler, Gladiator, Ford Bronco',
        f'Best roll bar grab handles for Jeep Wrangler JL/JK/TJ, Gladiator, and Ford Bronco {YEAR}. Bartact #1, plus top Amazon picks.',
        'index.html',
        body
    )

def build_sitemap(slugs):
    urls = '\n'.join(
        f'  <url><loc>https://{DOMAIN}/{s}</loc><lastmod>{TODAY}</lastmod><priority>{"1.0" if s=="index.html" else "0.8"}</priority></url>'
        for s in slugs
    )
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{urls}
</urlset>'''

def build():
    SITE.mkdir(parents=True, exist_ok=True)
    pages = {'index.html': build_index()}
    for v in VEHICLES:
        pages[v['slug'] + '.html'] = build_vehicle_page(v)

    written = 0
    for slug, html in pages.items():
        path = SITE / slug
        if path.exists() and path.read_text(encoding='utf-8') == html:
            continue
        path.write_text(html, encoding='utf-8')
        written += 1

    # Sitemap
    sm = build_sitemap(list(pages.keys()))
    (SITE / 'sitemap.xml').write_text(sm, encoding='utf-8')

    # Delete stale filler pages that are no longer generated
    filler = [
        'best-rollbarhandles-2026.html', 'best-rollbarhandles-without-overpaying.html',
        'how-to-pick-rollbarhandles-2026.html', 'rollbarhandles-buying-guide-2026.html',
        'rollbarhandles-compared-2026.html', 'rollbarhandles-market-2026.html',
        'rollbarhandles-practical-guide-2026.html', 'rollbarhandles-quality-vs-marketing.html',
        'rollbarhandles-tested-ranked-2026.html', 'rollbarhandles-what-wed-buy-2026.html',
        'rollbarhandles-worth-the-upgrade-2026.html', 'what-we-look-for-rollbarhandles-2026.html',
    ]
    deleted = 0
    for fname in filler:
        p = SITE / fname
        if p.exists():
            p.unlink()
            deleted += 1

    print(f'Built {len(pages)} pages, wrote {written}, deleted {deleted} filler pages')

if __name__ == '__main__':
    build()
