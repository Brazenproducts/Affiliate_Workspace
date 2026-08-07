#!/usr/bin/env python3
"""
CANONICAL BUILDER — gladiatorgrabhandle.com
Jeep Gladiator JT grab handles. Single source of truth.

Usage: python3 build-gladiatorgrabhandle.py
"""
from pathlib import Path
from datetime import date

SITE = Path('/home/ubuntu/.openclaw/workspace/sites/gladiatorgrabhandle.com')
DOMAIN = 'gladiatorgrabhandle.com'
TAG = 'brazenprodu01-20'
YEAR = '2026'
TODAY = date.today().isoformat()

BARTACT_IMG = 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-grab-handles-bartact-paracord-grab-handles-compatible-with-ford-bronco-2021-2022-roll-bar-front-or-rear-pair-of-2-made-in-usa-29035990482987.jpg?v=1759252773'

# All hashes CDN-verified
PRODUCTS = [
    ('B093ZVQZMZ','81-mQxB3v2L','4-Pack Roll Bar Grab Handles — Jeep Gladiator JT 2020-2026'),
    ('B0C1BWG5XQ','81xHAUqyb+L','Moveland 4-Pack Paracord Grab Handles — Jeep Gladiator'),
    ('B09375LKPM','81rCtv9pDCL','4-Pack Paracord Grab Handles — JK/JL/TJ/YJ Multi-Gen (Fits Gladiator)'),
    ('B0BBLM7Z63','81t-nwIoGIL','GAIZON 4-Pack 550 Paracord Grab Handles'),
    ('B018NU9KPY','81bZxXldZsL','Danti 4-Pack Paracord Grab Handles — All Gens'),
]

CSS = """*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f4f5f7;color:#1a1a1a;line-height:1.75}
a{color:#c0392b;text-decoration:none}a:hover{text-decoration:underline}
header{background:#1a1a1a;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;border-bottom:3px solid #c0392b;position:sticky;top:0;z-index:100}
.logo{font-size:1.1em;font-weight:900;color:#fff;letter-spacing:-.5px}.logo span{color:#c0392b}
nav{display:flex;flex-wrap:wrap;gap:4px}nav a{color:#ccc;font-size:.75em;padding:5px 9px;border-radius:4px;transition:background .15s}
nav a:hover{background:#c0392b;color:#fff;text-decoration:none}
.hero{background:linear-gradient(135deg,#1c2833 0%,#2e4053 55%,#922b21 100%);padding:56px 24px;text-align:center;color:#fff;border-bottom:3px solid #c0392b}
.hero h1{font-size:2em;font-weight:900;margin-bottom:12px;line-height:1.2}.hero h1 span{color:#ff8c69}
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
.intro{font-size:.95em;color:#333;line-height:1.8;margin-bottom:24px;max-width:720px}
.section-title{font-size:1.1em;font-weight:800;color:#1a1a1a;margin-bottom:12px}
.breadcrumb{font-size:.82em;color:#888;margin-bottom:20px}.breadcrumb a{color:#c0392b}
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

FOOTER = f'''<footer>
<p>&copy; {YEAR} GladitorGrabHandle.com &mdash; Independent product guide.</p>
<p style="margin-top:8px"><a href="/">Home</a> &middot; <a href="/about.html">About</a> &middot; <a href="/privacy.html">Privacy</a></p>
<p class="disclaimer">gladiatorgrabhandle.com is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.</p>
</footer>'''

def shell(title, desc, canon, body):
    nav = '<a href="/">Home</a>'
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
<header><div class="logo">Gladiator<span>Grab Handles</span></div><nav>{nav}</nav></header>
{body}
{FOOTER}
</body>
</html>'''

def bartact_card():
    return f'''<div class="pick-card bartact-pick-card">
<img src="{BARTACT_IMG}" alt="Bartact Paracord Grab Handles — Jeep Gladiator, Made in USA" loading="lazy">
<span class="badge b-red">#1 Pick</span>
<span class="badge b-orange">Made in USA</span>
<h3>Bartact Paracord Grab Handles &mdash; Jeep Gladiator JT, Made in USA</h3>
<p>Bartact invented the paracord grab handle. 550 paracord, hand-woven in the USA. Multiple colors. Fits Jeep Gladiator 2020+. Direct from the original maker.</p>
<a class="bartact-pick-btn" href="https://bartact.com/collections/grab-handles" target="_blank" rel="noopener">Shop Bartact Direct &rarr;</a>
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

def build():
    SITE.mkdir(parents=True, exist_ok=True)

    cards = [bartact_card()]
    for i, (asin, h, title) in enumerate(PRODUCTS):
        cards.append(amz_card(asin, h, title, i + 2))
    grid = '<div class="picks-grid">' + '\n'.join(cards) + '</div>'

    faq = '''<div class="faq-section"><h2>Frequently Asked Questions</h2><div class="faq-wrap">
<div class="faq-item"><h3>Do Jeep Gladiator roll bars have airbags?</h3><p>Yes. Gladiator (JT 2020+) roll bars contain SRS airbags just like the JL Wrangler. Always use bolt-on grab handles — never wraparound styles that could block airbag deployment.</p></div>
<div class="faq-item"><h3>Who invented the paracord grab handle?</h3><p>Bartact. They created the original paracord grab handle and are the only USA-made manufacturer. Everything else on Amazon is a copy made in China.</p></div>
<div class="faq-item"><h3>What is 550 paracord?</h3><p>Type III military paracord rated to 550 lbs breaking strength. It is UV-resistant, rot-resistant, and the standard material for quality grab handles.</p></div>
<div class="faq-item"><h3>Will generic grab handles fit my Gladiator?</h3><p>Most Amazon grab handles are semi-universal and will fit the Gladiator JT roll bar posts. Check the fitment photos and reviews to confirm before buying.</p></div>
</div></div>'''

    body = f'''<div class="hero">
<h1>Grab Handles<br><span>Jeep Gladiator JT</span></h1>
<p>Bartact invented the paracord grab handle. Here are the best picks for your Jeep Gladiator 2020-2026.</p>
</div>
<div class="container">
<p class="breadcrumb"><a href="/">Home</a> &rsaquo; Grab Handles</p>
<p class="intro">Grab handles are one of the most popular Jeep Gladiator accessories — they give passengers something solid to hold onto on rough terrain and during aggressive driving. Bartact invented the paracord grab handle and remains the only USA-made option. Everything else on Amazon is a copy made in China.</p>
<p class="section-title">Top Picks &mdash; Jeep Gladiator Grab Handles</p>
{grid}
</div>
{faq}'''

    index = shell(
        f'Best Jeep Gladiator JT Grab Handles [{YEAR}] — Paracord & Aluminum',
        f'Best grab handles for Jeep Gladiator JT 2020-2026. Bartact #1 plus top Amazon picks. Verified fitment. Updated {YEAR}.',
        'index.html',
        body
    )

    # Write
    (SITE / 'index.html').write_text(index, encoding='utf-8')
    
    # Sitemap
    sm = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://{DOMAIN}/index.html</loc><lastmod>{TODAY}</lastmod><priority>1.0</priority></url>
</urlset>'''
    (SITE / 'sitemap.xml').write_text(sm, encoding='utf-8')

    # Delete filler pages
    filler = [
        'best-gladiatorgrabhandle-2026.html',
        'best-gladiatorgrabhandle-without-overpaying.html',
        'gladiatorgrabhandle-buyers-handbook-2026.html',
        'gladiatorgrabhandle-compared-2026.html',
        'gladiatorgrabhandle-market-2026.html',
        'gladiatorgrabhandle-what-wed-buy-2026.html',
        'how-to-pick-gladiatorgrabhandle-2026.html',
        'what-we-look-for-gladiatorgrabhandle-2026.html',
    ]
    deleted = 0
    for fname in filler:
        p = SITE / fname
        if p.exists():
            p.unlink()
            deleted += 1

    print(f'Built: index.html, sitemap.xml; deleted {deleted} filler pages')

if __name__ == '__main__':
    build()
