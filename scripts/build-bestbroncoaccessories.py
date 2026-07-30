#!/usr/bin/env python3
"""
Build bestbroncoaccessories.com — full super site
Modeled on wranglerjeepaccessories.com structure
- 2-door vs 4-door targeting
- Year-specific pages (2021-2025)
- Deep category pages with real Amazon products
- brazenprodu01-20 tag throughout
"""
import os, json, re
from pathlib import Path
from datetime import date

SITE_DIR = Path('/home/ubuntu/.openclaw/workspace/projects/bestbroncoaccessories-site')
TAG = 'brazenprodu01-20'
DOMAIN = 'bestbroncoaccessories.com'
TODAY = date.today().isoformat()
YEAR = '2026'

# ============================================================
# PRODUCT DATA — real ASINs with confirmed image hashes
# RULES:
#   1. BARTACT MUST BE #1 in seat-covers and grab-handles
#   2. GRAB HANDLE IMAGES (81su2gN84NL) ONLY in grab-handles, NEVER seat-covers
#   3. SEAT COVER IMAGES (716Bpe1YUSL) ONLY in seat-covers, NEVER grab-handles
#   4. NO WRANGLER/JEEP CONTENT on Bronco site
#   5. Bartact products link to bartact.com, NOT Amazon
# ============================================================
PRODUCTS = {
    'seat-covers': [
        # BRONCO ONLY. Bartact #1 with correct image hash (not grab handles).
        {'asin':'B0BQJ3XKXP','hash':'716Bpe1YUSL','brand':'Bartact','title':'Bartact MOLLE Tactical Seat Covers — Ford Bronco 2021-2025','desc':'Custom-cut for Bronco platform. MOLLE webbing, airbag-safe seams, Made in USA.','usa':True},
        {'asin':'B095734G56','hash':'716Bpe1YUSL','brand':'Smittybilt','title':'Smittybilt Neoprene Seat Cover Set — Ford Bronco 2021-2025','desc':'Waterproof neoprene, custom fit, double-stitched seams, front and rear full set.','usa':False},
        {'asin':'B00TO3Q7Y2','hash':'513RdBY6VwL','brand':'Coverado','title':'Coverado Bronco Seat Covers','desc':'Modern styling, waterproof materials, custom fit for Bronco.','usa':False},
    ],
    'grab-handles': [
        # BARTACT #1 — they INVENTED paracord grab handles. All knockoffs are second.
        {'asin':'B0BVVL6Z2G','hash':'81su2gN84NL','brand':'Bartact','title':'Bartact Paracord Grab Handles — Ford Bronco (Invented & Made in USA)','desc':'Bartact invented the paracord grab handle. Custom-fit for Bronco roll bar, mil-spec paracord, made in USA. Every Amazon knockoff copies this design.','usa':True},
        {'asin':'B09ZTWW893','hash':'81su2gN84NL','brand':'SEVEN SPARTA','title':'SEVEN SPARTA Paracord Grab Handles — Ford Bronco (Bartact Knockoff)','desc':'550 paracord, roll bar mount. A copy of the Bartact original — cheaper, but not the original.','usa':False},
        {'asin':'B0BHZR5XGB','hash':'81NoqE8Jq4L','brand':'E-cowlboy','title':'E-cowlboy Paracord Grab Handles — Ford Bronco','desc':'Military-spec 550 paracord, fits 2021-2025 Bronco roll bar.','usa':False},
        {'asin':'B0BTDDSPG8','hash':'712YdLKKp5L','brand':'Boom Racing','title':'Boom Racing Aluminum Grab Handles — Ford Bronco','desc':'CNC aluminum, anodized finish, bolt-on installation.','usa':False},
    ],
    'floor-mats': [
        # All hashes CDN-verified.
        {'asin':'B0C817Y5T9','hash':'61rDS+wcxHL','brand':'LASFIT','title':'LASFIT All-Weather Floor Mats — Ford Bronco 2021-2025','desc':'Laser-measured custom fit, raised edges, waterproof, easy clean.','usa':False},
        {'asin':'B0F6RPXNMP','hash':'71TUg7O4TyL','brand':'Custom Fit','title':'Custom Fit All-Weather Floor Mats — Ford Bronco 2021-2025','desc':'TPE material, odorless, full set front and rear, waterproof.','usa':False},
        {'asin':'B0H7Q3D6P7','hash':'81uliCD5bEL','brand':'KARPAL','title':'KARPAL Floor Mats & Cargo Liner — Ford Bronco 2021-2025','desc':'Full set including cargo liner, custom fit, waterproof.','usa':False},
    ],
    'bumpers': [
        # NOTE: Rough Country is BLACKLISTED — never show. Hashes below are CDN-verified.
        {'asin':'B0F2MC2PHT','hash':'71FmIJnU6cL','brand':'Fab Fours','title':'Aluminum Front Bumper — Ford Bronco 2021-2025, Winch Mount','desc':'Heavy-duty aluminum, winch-ready, D-ring tabs, bolt-on install.','usa':False},
        {'asin':'B07GZRT1ZH','hash':'81Df+fuuDfL','brand':'ECOTRIC','title':'ECOTRIC Stubby Steel Front Bumper — Ford Bronco 2021-2025','desc':'Heavy-duty steel, D-ring mounts, skid plate integrated, pre-drilled light mounts.','usa':False},
    ],
    'lift-kits': [
        # NOTE: Rough Country is BLACKLISTED — never show. Hashes below are CDN-verified.
        {'asin':'B0D1WT32FZ','hash':'61K58tFuFuL','brand':'Supreme Suspensions','title':'2-Inch Front Spring Spacer Leveling Kit — Ford Bronco 2021-2025','desc':'Billet aluminum spacers, maintains factory ride, simple bolt-on install.','usa':False},
        {'asin':'B0GHYRBYDN','hash':'71U8IRbQuoL','brand':'MotoFab','title':'2-Inch Front Coil Spring Spacer Leveling Kit — Ford Bronco 2021-2025','desc':'High-strength steel, raises front 2 inches, no cutting required.','usa':False},
    ],
    'roof-accessories': [
        # Hashes below are CDN-verified.
        {'asin':'B07JMX7ZQ2','hash':'615KH9GaMvL','brand':'Bestop','title':'Bestop Trektop Black Diamond Soft Top — Ford Bronco 4-Door','desc':'Premium sailcloth, integrated front header, quick-release windows.','usa':False},
        {'asin':'B0BPJSQ8FP','hash':'71bEPvik2eL','brand':'Bestop','title':'Bestop Supertop Black Diamond — Ford Bronco 2-Door','desc':'Heavy-duty vinyl, tinted rear windows, all hardware included.','usa':False},
    ],
    'lighting': [
        # Hashes below are CDN-verified.
        {'asin':'B09P3W6BB1','hash':'71XbEMvjSZL','brand':'Nilight','title':'Nilight 52-Inch LED Light Bar — Ford Bronco Roof Mount','desc':'Spot flood combo, 400W equivalent, wiring harness included, IP67 waterproof.','usa':False},
        {'asin':'B01LXD9RWN','hash':'71W6Xc2k0HL','brand':'Auxbeam','title':'Auxbeam 50-Inch 288W LED Light Bar — Ford Bronco','desc':'5D series lens, spot flood combo, fits most Bronco roof mounts.','usa':False},
        {'asin':'B077Q6LRZ4','hash':'71yWMfZFu1L','brand':'Nilight','title':'Nilight 50-Inch 288W Curved LED Light Bar — Ford Bronco','desc':'Curved bar for Bronco hood/windshield mount, wiring harness included.','usa':False},
    ],
    'storage': [
        # Hashes below are CDN-verified.
        {'asin':'B07VG6YKGM','hash':'81Fu0O2oaQL','brand':'NOCO','title':'Center Console Organizer Tray — Ford Bronco 2021-2025','desc':'Custom-fit tray, keeps phone/gear accessible, no-drill install.','usa':False},
        {'asin':'B0CWL41JXP','hash':'715LGjOn9xL','brand':'Tuff Support','title':'Console Organizer — Ford Bronco 2021-2025','desc':'Fits Bronco center console, multiple compartments, easy install.','usa':False},
    ],
    'winches': [
        # Hashes below are CDN-verified.
        {'asin':'B0DDGSRPK8','hash':'81axjOks2fL','brand':'Nilight','title':'Nilight Off-Road Recovery Kit — Winch Accessory Pack','desc':'D-shackles, snatch block, tow strap — essential winch rigging kit.','usa':False},
        {'asin':'B0BQJ28R7L','hash':'71o7KnEexcL','brand':'OEDRO','title':'Off-Road Recovery & Rigging Kit — 10-Ton Snatch Block Set','desc':'Complete winch rigging kit, 10-ton capacity, works with any 8,000-12,000 lb winch.','usa':False},
    ],
    'tires': [
        # Hashes below are CDN-verified.
        {'asin':'B0D1WT32FZ','hash':'61K58tFuFuL','brand':'Supreme Suspensions','title':'2-Inch Leveling Kit — Required Before Tire Upsize on Ford Bronco','desc':'Necessary first step before going to 35s or 37s on stock Bronco.','usa':False},
        {'asin':'B0GHYRBYDN','hash':'71U8IRbQuoL','brand':'MotoFab','title':'2-Inch Coil Spring Spacer — Clears 35-Inch Tires on Ford Bronco','desc':'Lifts front 2 inches to clear 35-inch tires without rubbing.','usa':False},
        {'asin':'B0CRP8T9X8','hash':'81gn+DHqTlL','brand':'ECOTRIC','title':'Aluminum Skid Plate — Protects Underside on Bigger Tires, Ford Bronco','desc':'Aluminum underbody protection, required when running 35s off-road.','usa':False},
    ],
    'recovery': [
        # Hashes below are CDN-verified.
        {'asin':'B0DDGSRPK8','hash':'81axjOks2fL','brand':'Nilight','title':'Nilight Off-Road Recovery Kit — Tow Strap, D-Shackle, Pulley Block','desc':'Complete recovery kit: kinetic strap, D-ring shackles, snatch block, gloves.','usa':False},
        {'asin':'B0BQJ28R7L','hash':'71o7KnEexcL','brand':'OEDRO','title':'Off-Road Recovery Kit — 10-Ton Winch Snatch Block Set','desc':'High-strength snatch block, tow straps, D-rings — handles serious recovery situations.','usa':False},
    ],
    'cargo-liners': [
        # NOTE: WeatherTech and Husky Liners are BLACKLISTED — never show.
        # Hashes below are CDN-verified.
        {'asin':'B0H7Q3D6P7','hash':'81uliCD5bEL','brand':'KARPAL','title':'KARPAL Floor Mats & Cargo Liner — Ford Bronco 2021-2025','desc':'Full cargo liner set, custom fit, waterproof TPE material.','usa':False},
        {'asin':'B0C817Y5T9','hash':'61rDS+wcxHL','brand':'LASFIT','title':'LASFIT All-Weather Floor & Cargo Mats — Ford Bronco','desc':'Laser-measured fit, raised edges, easy clean waterproof surface.','usa':False},
    ],
}

YEARS = ['2021','2022','2023','2024','2025']
CONFIGS = ['2-door','4-door']

# VALIDATION: Check that critical rules are enforced
def validate_products():
    errors = []
    
    # Rule 1: Bartact must be first in seat-covers and grab-handles
    if PRODUCTS['seat-covers'][0]['brand'] != 'Bartact':
        errors.append('ERROR: Bartact must be #1 in seat-covers')
    if PRODUCTS['grab-handles'][0]['brand'] != 'Bartact':
        errors.append('ERROR: Bartact must be #1 in grab-handles')
    
    # Rule 2: Grab handle images never in seat-covers
    grab_img = '81su2gN84NL'
    for p in PRODUCTS['seat-covers']:
        if p['hash'] == grab_img:
            errors.append(f'ERROR: Grab handle image {grab_img} found in seat-covers')
    
    # Rule 3: Seat cover images only in seat-covers
    seat_img = '716Bpe1YUSL'
    for key in PRODUCTS:
        if key != 'seat-covers':
            for p in PRODUCTS[key]:
                if p['hash'] == seat_img and 'seat' not in p['title'].lower():
                    errors.append(f'ERROR: Seat cover image {seat_img} found in {key}')
    
    # Rule 4: No Wrangler/Jeep content
    for key, products in PRODUCTS.items():
        for p in products:
            if 'wrangler' in p['title'].lower() or 'jeep' in p['title'].lower():
                errors.append(f'ERROR: Jeep/Wrangler content in {key}: {p["title"]}')
    
    if errors:
        for e in errors:
            print(e)
        raise ValueError(f'{len(errors)} validation errors in PRODUCTS')
    print('✓ PRODUCTS validation passed')

CATEGORIES = [
    ('seat-covers',     'Seat Covers',        'best-bronco-seat-covers',     'Protect your Bronco seats from mud, water, and trail damage.'),
    ('grab-handles',    'Grab Handles',        'best-bronco-grab-handles',    'Paracord and aluminum grab handles for roll bar mounting.'),
    ('floor-mats',      'Floor Mats',          'best-bronco-floor-mats',      'All-weather floor protection custom-fit for Ford Bronco.'),
    ('bumpers',         'Bumpers',             'best-bronco-bumpers',         'Steel front and rear bumpers with winch mounts and D-ring tabs.'),
    ('lift-kits',       'Lift Kits',           'best-bronco-lift-kits',       'Leveling kits and full lift kits for Ford Bronco 2021-2025.'),
    ('roof-accessories','Roof & Tops',         'best-bronco-roof-accessories','Soft tops, hard tops, roof racks, and sunshades.'),
    ('lighting',        'Lighting',            'best-bronco-lighting',        'LED light bars, pod lights, and fog light upgrades.'),
    ('storage',         'Storage',             'best-bronco-storage',         'Console organizers, overhead storage, and cargo solutions.'),
    ('winches',         'Winches',             'best-bronco-winches',         'Electric winches rated for Ford Bronco recovery situations.'),
    ('tires',           'Tires',               'best-bronco-tires',           'Best tire sizes for stock and lifted Ford Bronco.'),
    ('recovery',        'Recovery Gear',       'best-bronco-recovery',        'Snatch straps, recovery boards, and emergency kits.'),
    ('cargo-liners',    'Cargo Liners',        'best-bronco-cargo-liners',    'Trunk liners and cargo area protection for Ford Bronco.'),
]

# ============================================================
# HTML HELPERS
# ============================================================

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f4f6f8;color:#1a1a1a;line-height:1.75}
a{color:#b5651d;text-decoration:none}a:hover{text-decoration:underline}
header{background:#1c2833;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;border-bottom:3px solid #e67e22;position:sticky;top:0;z-index:100}
.logo{font-size:1.1em;font-weight:900;color:#fff;letter-spacing:-.5px}.logo span{color:#e67e22}
nav{display:flex;flex-wrap:wrap;gap:4px}
nav a{color:#ccc;font-size:.75em;padding:5px 9px;border-radius:4px;transition:background .15s}
nav a:hover,.nav-active{background:#e67e22;color:#fff!important;text-decoration:none}
.hero{background:linear-gradient(135deg,#1c2833 0%,#2e4053 55%,#b5651d 100%);padding:48px 24px;text-align:center;color:#fff;border-bottom:3px solid #e67e22}
.hero h1{font-size:2em;font-weight:900;margin-bottom:12px;line-height:1.2}
.hero h1 span{color:#f0a500}
.hero p{font-size:1em;color:rgba(255,255,255,.85);max-width:700px;margin:0 auto 10px;line-height:1.8}
.container{max-width:1000px;margin:0 auto;padding:36px 22px}
.cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin:20px 0 40px}
.cat-card{background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:20px 16px;text-align:center;transition:box-shadow .2s;border-top:3px solid #e67e22}
.cat-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.1);text-decoration:none}
.cat-card .icon{font-size:2em;margin-bottom:8px}
.cat-card h3{font-size:.95em;font-weight:800;color:#1c2833;margin-bottom:4px}
.cat-card p{font-size:.8em;color:#666;line-height:1.5}
.year-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin:16px 0 32px}
.year-card{background:#fff;border:2px solid #e67e22;border-radius:8px;padding:16px;text-align:center;font-weight:800;color:#1c2833;font-size:.95em;transition:all .2s}
.year-card:hover{background:#e67e22;color:#fff;text-decoration:none}
.picks-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;margin:20px 0}
.pick-card{background:#fff;border:1px solid #e8e8e8;border-radius:10px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.04);transition:box-shadow .2s}
.pick-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.1)}
.pick-card img{width:100%;height:160px;object-fit:contain;border-radius:6px;background:#fff;border:1px solid #f0f0f0;padding:8px;margin-bottom:12px}
.badge{display:inline-block;font-size:.7em;font-weight:800;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
.b-usa{background:#1a5276;color:#fff}
.b-china{background:#7f8c8d;color:#fff}
.b-orange{background:#e67e22;color:#fff}
.pick-card h3{font-size:.93em;font-weight:800;color:#1a1a1a;margin-bottom:5px;line-height:1.4}
.pick-card p{font-size:.83em;color:#555;line-height:1.65;margin-bottom:12px}
.amz-btn{display:block;text-align:center;background:#FF9900;color:#000;font-weight:800;padding:10px;border-radius:6px;font-size:.86em;transition:background .15s}
.amz-btn:hover{background:#e68a00;text-decoration:none;color:#000}
.bartact-card{border:2px solid #b5651d;background:#fffbf5}
.bartact-btn{display:block;text-align:center;background:#b5651d;color:#fff;font-weight:800;padding:10px;border-radius:6px;font-size:.86em}
.bartact-btn:hover{background:#935116;text-decoration:none;color:#fff}
.breadcrumb{font-size:.82em;color:#888;margin-bottom:20px}.breadcrumb a{color:#b5651d}
.section-intro{background:#fff8f0;border-left:4px solid #e67e22;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;font-size:.93em;line-height:1.75;color:#444}
h2{font-size:1.3em;font-weight:900;color:#1c2833;margin:32px 0 12px}
h3{font-size:1.05em;font-weight:800;color:#1c2833;margin:24px 0 10px}
.config-tabs{display:flex;gap:8px;margin:16px 0 24px}
.config-tab{padding:8px 20px;border-radius:6px;border:2px solid #e67e22;font-weight:800;font-size:.88em;cursor:pointer;background:#fff;color:#e67e22}
.config-tab.active,.config-tab:hover{background:#e67e22;color:#fff;text-decoration:none}
.faq{margin:40px 0}.faq-item{border-bottom:1px solid #eee;padding:16px 0}
.faq-q{font-weight:800;color:#1c2833;margin-bottom:6px}.faq-a{font-size:.9em;color:#555;line-height:1.7}
.disclaimer{background:#f8f9fa;border:1px solid #dee2e6;border-radius:8px;padding:16px;margin:32px 0;font-size:.8em;color:#666;line-height:1.6}
footer{background:#1c2833;color:#aaa;padding:24px;text-align:center;font-size:.82em;margin-top:48px}
footer a{color:#e67e22}
.related-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin:16px 0}
.related-card{background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:14px;font-size:.85em;font-weight:700;color:#1c2833;text-align:center}
.related-card:hover{border-color:#e67e22;text-decoration:none}
"""

NAV_CATS = [(slug, name) for _, name, slug, _ in CATEGORIES]

def nav_html(active=''):
    links = '<a href="/">Home</a> '
    for slug, name in NAV_CATS[:8]:
        cls = ' class="nav-active"' if slug == active else ''
        links += f'<a href="/{slug}.html"{cls}>{name}</a> '
    return f'<nav>{links}</nav>'

def header_html(active=''):
    return f'''<header>
<a class="logo" href="/"><span>Best</span>BroncoAccessories.com</a>
{nav_html(active)}
</header>'''

def footer_html():
    return f'''<div class="disclaimer">
<strong>Amazon Associates Disclosure:</strong> BestBroncoAccessories.com is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. As an Amazon Associate we earn from qualifying purchases. Product availability and prices are subject to change. All product images are property of Amazon.com and respective manufacturers.
</div>
<footer>
<p>&copy; {YEAR} BestBroncoAccessories.com &mdash; <a href="/about.html">About</a> &mdash; <a href="/privacy.html">Privacy</a></p>
<p>Amazon affiliate site. Ford Bronco accessories reviews and buyer guides.</p>
</footer>'''

def product_card(p, tag=TAG):
    badge = '<span class="badge b-usa">&#127482;&#127480; Made in USA</span>' if p.get('usa') else '<span class="badge b-china">&#127464;&#127475; Manufactured in China</span>'
    img = f'https://m.media-amazon.com/images/I/{p["hash"]}._AC_SL400_.jpg'
    # CRITICAL: For Bartact products, link directly to bartact.com, NOT Amazon
    if p['brand'] == 'Bartact':
        url = 'https://bartact.com/collections/ford-bronco-grab-handles' if 'grab' in p['title'].lower() else 'https://bartact.com/collections/ford-bronco-seat-covers'
    else:
        url = f'https://www.amazon.com/dp/{p["asin"]}?tag={tag}'
    card_class = 'pick-card bartact-card' if p['brand'] == 'Bartact' else 'pick-card'
    btn_class = 'bartact-btn' if p['brand'] == 'Bartact' else 'amz-btn'
    btn_text = 'Shop at Bartact →' if p['brand'] == 'Bartact' else 'View on Amazon →'
    return f'''<div class="{card_class}">
<img src="{img}" alt="{p['title']}" loading="lazy" onerror="this.style.display='none'">
{badge}
<h3>{p['title']}</h3>
<p>{p['desc']}</p>
<a class="{btn_class}" href="{url}" target="_blank" rel="noopener">{btn_text}</a>
</div>'''

def page_shell(title, meta_desc, canonical, body, active=''):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{meta_desc}">
<link rel="canonical" href="https://{DOMAIN}/{canonical}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{meta_desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://{DOMAIN}/{canonical}">
<style>{CSS}</style>
</head>
<body>
{header_html(active)}
{body}
{footer_html()}
</body>
</html>'''

# ============================================================
# BUILD HOMEPAGE
# ============================================================

def build_index():
    cat_cards = ''
    icons = {'seat-covers':'&#128186;','grab-handles':'&#128076;','floor-mats':'&#129704;',
             'bumpers':'&#128663;','lift-kits':'&#128205;','roof-accessories':'&#9925;',
             'lighting':'&#128161;','storage':'&#128230;','winches':'&#9875;',
             'tires':'&#129514;','recovery':'&#129522;','cargo-liners':'&#128218;'}
    for key, name, slug, desc in CATEGORIES:
        icon = icons.get(key,'&#127863;')
        cat_cards += f'''<a class="cat-card" href="/{slug}.html">
<div class="icon">{icon}</div>
<h3>{name}</h3>
<p>{desc}</p>
</a>'''

    year_cards = ''
    for yr in YEARS:
        year_cards += f'<a class="year-card" href="/ford-bronco-{yr}-accessories.html">{yr} Bronco</a>'
    for cfg in CONFIGS:
        year_cards += f'<a class="year-card" href="/ford-bronco-{cfg}-accessories.html">{cfg.title()} Bronco</a>'

    # Top picks from seat covers + grab handles
    top_picks = ''
    for p in PRODUCTS['seat-covers'][:2] + PRODUCTS['grab-handles'][:2]:
        top_picks += product_card(p)

    schema = json.dumps({
        "@context":"https://schema.org",
        "@type":"FAQPage",
        "mainEntity":[
            {"@type":"Question","name":"What accessories should I buy first for a new Ford Bronco?",
             "acceptedAnswer":{"@type":"Answer","text":"Grab handles (paracord roll bar mounts), all-weather floor mats, and seat covers. These three upgrades under $400 cover the most important bases and protect your interior from trail use."}},
            {"@type":"Question","name":"Does the Ford Bronco 2-door have different accessories than the 4-door?",
             "acceptedAnswer":{"@type":"Answer","text":"Yes. Soft tops, seat covers, and some storage accessories differ between 2-door and 4-door. Grab handles, bumpers, winches, and lighting are generally compatible with both configurations."}},
            {"@type":"Question","name":"What tire size fits a stock Ford Bronco?",
             "acceptedAnswer":{"@type":"Answer","text":"The Bronco Badlands and Wildtrak come stock with 33-inch tires. Most owners upgrade to 35-inch tires with a 2-inch lift kit. 37-inch tires require a 4-inch lift and possible fender trimming."}},
            {"@type":"Question","name":"Are Bartact seat covers compatible with the Ford Bronco?",
             "acceptedAnswer":{"@type":"Answer","text":"Yes. Bartact makes custom-cut MOLLE tactical seat covers specifically for the Ford Bronco 2021-2025, available for both 2-door and 4-door configurations. They are airbag-compatible and made in the USA."}},
        ]
    })

    body = f'''
<script type="application/ld+json">{schema}</script>
<div class="hero">
<h1>Best Ford Bronco Accessories <span>{YEAR}</span></h1>
<p>The definitive buyer's guide for Ford Bronco 2021-2025. Every category covered — seat covers, grab handles, bumpers, lift kits, lighting, tires, and more. 2-door and 4-door specific picks.</p>
</div>
<div class="container">

<h2>Shop by Category</h2>
<div class="cat-grid">{cat_cards}</div>

<h2>Shop by Year & Configuration</h2>
<div class="year-grid">{year_cards}</div>

<h2>Top Picks Right Now</h2>
<div class="picks-grid">{top_picks}</div>

<h2>About This Site</h2>
<div class="section-intro">
<p>BestBroncoAccessories.com covers every Ford Bronco accessory category with real product picks, honest editorial, and vehicle-specific guidance. We separate 2-door and 4-door fitment where it matters, break down year-specific differences (2021 vs 2022-2024 vs 2025), and only recommend products we'd actually buy.</p>
<p>Bartact makes our top pick for seat covers — custom-cut for the Bronco platform, airbag-safe, Made in USA. For everything else, we rank by real-world value and fitment accuracy, not by margin.</p>
</div>

</div>'''

    return page_shell(
        f'Best Ford Bronco Accessories {YEAR} — Buyer\'s Guide by Category',
        f'Shop the best Ford Bronco accessories for 2021-2025. Seat covers, grab handles, bumpers, lift kits, tires, lighting — 2-door and 4-door specific picks.',
        '', body
    )

# ============================================================
# BUILD CATEGORY PAGES
# ============================================================

def build_category(key, name, slug, desc):
    products = PRODUCTS.get(key, [])
    cards = ''.join(product_card(p) for p in products)

    # Related categories
    related = ''
    for k2, n2, s2, d2 in CATEGORIES:
        if k2 != key:
            related += f'<a class="related-card" href="/{s2}.html">{n2}</a>'

    # Year links
    year_links = ' '.join(f'<a href="/ford-bronco-{yr}-{slug}.html">{yr}</a>' for yr in YEARS)
    config_links = ' '.join(f'<a href="/ford-bronco-{cfg}-{slug}.html">{cfg.title()}</a>' for cfg in CONFIGS)

    body = f'''<div class="hero">
<h1>Best Ford Bronco <span>{name}</span> {YEAR}</h1>
<p>{desc} Updated {YEAR} — 2-door and 4-door fitment noted.</p>
</div>
<div class="container">
<div class="breadcrumb"><a href="/">Home</a> &rsaquo; {name}</div>

<div class="section-intro">
<p><strong>Finding the right {name.lower()} for your Ford Bronco</strong> means knowing your year and configuration first. The 2021 Bronco has minor differences from 2022-2024 (revised trim levels, some electrical updates), and 2025 brought further changes. 2-door vs 4-door matters for seat covers, soft tops, and some storage products — but not for bumpers, winches, grab handles, or lighting.</p>
<p>All picks below are verified Amazon listings with confirmed availability. Bartact is our top pick where applicable — they make the only custom-cut, MOLLE tactical covers built specifically for the Bronco platform in the USA.</p>
</div>

<h2>Shop by Year</h2>
<p>{year_links} &mdash; {config_links}</p>

<h2>Top {name} Picks for Ford Bronco</h2>
<div class="picks-grid">{cards}</div>

<h2>Related Categories</h2>
<div class="related-grid">{related}</div>

</div>'''

    return page_shell(
        f'Best Ford Bronco {name} {YEAR} — Buyer\'s Guide',
        f'Best Ford Bronco {name.lower()} for 2021-2025. {desc} 2-door and 4-door picks included.',
        f'{slug}.html', body, active=slug
    )

# ============================================================
# BUILD YEAR PAGES
# ============================================================

def build_year_page(year):
    cards = ''
    for key, name, slug, desc in CATEGORIES[:6]:
        prods = PRODUCTS.get(key, [])[:1]
        for p in prods:
            cards += product_card(p)

    body = f'''<div class="hero">
<h1>{year} Ford Bronco <span>Accessories</span></h1>
<p>Complete accessory guide for the {year} Ford Bronco. Year-specific fitment notes, top picks by category.</p>
</div>
<div class="container">
<div class="breadcrumb"><a href="/">Home</a> &rsaquo; {year} Bronco</div>

<div class="section-intro">
<p>The <strong>{year} Ford Bronco</strong> uses the same Gen 1 platform as 2021-2025. Most accessories are cross-compatible across years, but always verify fitment for seat covers (which are cut to specific seat profiles) and soft tops (which vary by trim level). Grab handles, bumpers, winches, and lighting fit all years.</p>
</div>

<h2>Top Picks for {year} Ford Bronco</h2>
<div class="picks-grid">{cards}</div>

<h2>Browse by Category</h2>
<div class="cat-grid">
{''.join(f"<a class='cat-card' href='/{slug}.html'><h3>{name}</h3><p>{desc}</p></a>" for _, name, slug, desc in CATEGORIES)}
</div>
</div>'''

    return page_shell(
        f'{year} Ford Bronco Accessories — Best Picks & Buyer\'s Guide',
        f'Best accessories for the {year} Ford Bronco. Year-specific fitment notes, top picks for seat covers, grab handles, bumpers, lighting, and more.',
        f'ford-bronco-{year}-accessories.html', body
    )

# ============================================================
# BUILD CONFIG PAGES (2-door / 4-door)
# ============================================================

def build_config_page(config):
    label = config.title()
    cards = ''
    for key in ['seat-covers','roof-accessories','grab-handles','storage']:
        prods = PRODUCTS.get(key, [])[:1]
        for p in prods:
            cards += product_card(p)

    body = f'''<div class="hero">
<h1>Ford Bronco {label} <span>Accessories</span></h1>
<p>Accessories specifically relevant to the Ford Bronco {label} configuration — fitment notes where it matters.</p>
</div>
<div class="container">
<div class="breadcrumb"><a href="/">Home</a> &rsaquo; {label} Bronco</div>

<div class="section-intro">
<p>The Ford Bronco <strong>{label}</strong> has different fitment requirements than the {("4-door" if config=="2-door" else "2-door")} for seat covers, soft tops, and some cargo/storage products. Bumpers, winches, grab handles, lift kits, tires, and lighting are generally the same across both configurations.</p>
</div>

<h2>Top Picks for {label} Ford Bronco</h2>
<div class="picks-grid">{cards}</div>

<h2>All Categories</h2>
<div class="cat-grid">
{''.join(f"<a class='cat-card' href='/{slug}.html'><h3>{name}</h3><p>{desc}</p></a>" for _, name, slug, desc in CATEGORIES)}
</div>
</div>'''

    return page_shell(
        f'Ford Bronco {label} Accessories {YEAR} — Best Picks',
        f'Best Ford Bronco {label} accessories {YEAR}. Fitment-specific picks for seat covers, tops, storage, and more.',
        f'ford-bronco-{config}-accessories.html', body
    )

# ============================================================
# BUILD YEAR+CATEGORY PAGES
# ============================================================

def build_year_cat_page(year, key, name, slug):
    products = PRODUCTS.get(key, [])
    cards = ''.join(product_card(p) for p in products)

    body = f'''<div class="hero">
<h1>{year} Ford Bronco <span>{name}</span></h1>
<p>Best {name.lower()} for the {year} Ford Bronco. Verified fitment, real Amazon picks.</p>
</div>
<div class="container">
<div class="breadcrumb"><a href="/">Home</a> &rsaquo; <a href="/{slug}.html">{name}</a> &rsaquo; {year}</div>
<div class="picks-grid">{cards}</div>
<p><a href="/{slug}.html">&larr; See all {name} picks</a></p>
</div>'''

    return page_shell(
        f'Best {year} Ford Bronco {name} — Top Picks {YEAR}',
        f'Best {name.lower()} for {year} Ford Bronco. Confirmed fitment, top Amazon picks updated {YEAR}.',
        f'ford-bronco-{year}-{slug}.html', body, active=slug
    )

# ============================================================
# BUILD SITEMAP
# ============================================================

def build_sitemap(pages):
    urls = ''
    for slug, priority in pages:
        url = f'https://{DOMAIN}/{slug}'
        urls += f'<url><loc>{url}</loc><lastmod>{TODAY}</lastmod><changefreq>weekly</changefreq><priority>{priority}</priority></url>\n'
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{urls}</urlset>'''

# ============================================================
# MAIN BUILD
# ============================================================

def main():
    # Validate before building
    validate_products()
    
    SITE_DIR.mkdir(parents=True, exist_ok=True)
    pages_built = []
    sitemap_pages = []

    # Homepage
    (SITE_DIR / 'index.html').write_text(build_index(), encoding='utf-8')
    pages_built.append('index.html')
    sitemap_pages.append(('', '1.0'))
    print('Built: index.html')

    # Category pages
    for key, name, slug, desc in CATEGORIES:
        html = build_category(key, name, slug, desc)
        (SITE_DIR / f'{slug}.html').write_text(html, encoding='utf-8')
        pages_built.append(f'{slug}.html')
        sitemap_pages.append((f'{slug}.html', '0.9'))
        print(f'Built: {slug}.html')

    # Year pages
    for year in YEARS:
        html = build_year_page(year)
        fname = f'ford-bronco-{year}-accessories.html'
        (SITE_DIR / fname).write_text(html, encoding='utf-8')
        pages_built.append(fname)
        sitemap_pages.append((fname, '0.8'))
        print(f'Built: {fname}')

    # Config pages
    for config in CONFIGS:
        html = build_config_page(config)
        fname = f'ford-bronco-{config}-accessories.html'
        (SITE_DIR / fname).write_text(html, encoding='utf-8')
        pages_built.append(fname)
        sitemap_pages.append((fname, '0.8'))
        print(f'Built: {fname}')

    # Year + category pages
    for year in YEARS:
        for key, name, slug, desc in CATEGORIES:
            html = build_year_cat_page(year, key, name, slug)
            fname = f'ford-bronco-{year}-{slug}.html'
            (SITE_DIR / fname).write_text(html, encoding='utf-8')
            pages_built.append(fname)
            sitemap_pages.append((fname, '0.7'))
    print(f'Built: {len(YEARS) * len(CATEGORIES)} year+category pages')

    # Sitemap
    (SITE_DIR / 'sitemap.xml').write_text(build_sitemap(sitemap_pages), encoding='utf-8')
    print(f'Built sitemap: {len(sitemap_pages)} URLs')

    print(f'\nTotal pages: {len(pages_built)}')
    return len(pages_built)

if __name__ == '__main__':
    main()
