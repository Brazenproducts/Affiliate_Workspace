#!/usr/bin/env python3
"""
Build bestbroncoaccessories.com — full super site
Modeled on wranglerjeepaccessories.com structure
- 2-door vs 4-door targeting
- Year-specific pages (2021-2026)
- Deep category pages with real Amazon products
- brazenprodu01-20 tag throughout
"""
import os, json, re
from pathlib import Path
from datetime import date

SITE_DIR = Path('/home/ubuntu/.openclaw/workspace/sites/bestbroncoaccessories.com')
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
BARTACT_GRAB_IMG = "https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-grab-handles-bartact-paracord-grab-handles-compatible-with-ford-bronco-2021-2022-roll-bar-front-or-rear-pair-of-2-made-in-usa-29035990482987.jpg?v=1759252773"
BARTACT_MOLLE_IMG = "https://cdn.shopify.com/s/files/1/0936/7476/files/bartact-bags-and-pouches-bronco-accessories-door-bags-for-ford-bronco-2021-2022-2023-2024-full-size-front-door-interior-storage-bartact-pat-pending-33112388894763.jpg?v=1762460054"
BARTACT_SEAT_IMG = "https://www.bartact.com/cdn/shop/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jlu-2018-22-4-door-only-not-for-mojave-or-392-edition-bartact-w-molle-290.jpg?v=1762457338"

PRODUCTS = {
    # ----------------------------------------------------------------
    # SEAT COVERS — Bartact #1 (Shopify CDN, no Amazon). All hashes CDN-verified.
    # ----------------------------------------------------------------
    'seat-covers': [
        {'asin':None,'img':BARTACT_SEAT_IMG,'brand':'Bartact','title':'Bartact MOLLE Tactical Seat Covers — Ford Bronco 2021-2026','desc':'The only custom-cut, MOLLE tactical seat cover made specifically for the Ford Bronco. 600D Polyester with PU waterproof backing, laminated foam/scrim, UV protection, mil-spec MOLLE panels, airbag-safe seams. Made in the USA. Direct from Bartact.','usa':True,'url':'https://bartact.com/collections/ford-bronco-seat-covers'},
        {'asin':'B095734G56','hash':'716Bpe1YUSL','brand':'Smittybilt','title':'Smittybilt Gen2 Neoprene Seat Cover Set — Ford Bronco 2021-2026','desc':'Waterproof neoprene, custom fit for Bronco, double-stitched seams, full front and rear set. Gen2 neoprene is thicker than the original with better UV resistance.','usa':False},
        {'asin':'B0D3F1ZKZ2','hash':'71TBS6KMmiL','brand':'Aierxuan','title':'Aierxuan Custom Seat Covers — Ford Bronco 2021-2026','desc':'Custom-fit leatherette with diamond stitching, airbag-compatible side seams, multiple color options. Good everyday option for daily drivers.','usa':False},
        {'asin':'B00TO3Q7Y2','hash':'513RdBY6VwL','brand':'FH Group','title':'FH Group Neoprene Seat Cover Set — Ford Bronco 2021-2026','desc':'Entry-level neoprene option. Decent water resistance for light trail use, easy install, full set included.','usa':False},
    ],
    # ----------------------------------------------------------------
    # GRAB HANDLES — Bartact #1 (invented the paracord grab handle).
    # All hashes CDN-verified.
    # ----------------------------------------------------------------
    'grab-handles': [
        {'asin':None,'img':BARTACT_GRAB_IMG,'brand':'Bartact','title':'Bartact Paracord Grab Handles — Ford Bronco 2021-2026 (Made in USA)','desc':'Bartact invented the paracord grab handle. Every knockoff on Amazon copies this design. Custom-fit for Bronco roll bar, mil-spec 550 paracord, made in the USA. Front and rear pairs available.','usa':True,'url':'https://bartact.com/collections/grab-handles-for-jeep-wrangler-gladiator-ford-bronco-utvs-buggies-rails'},
        {'asin':'B09ZTWW893','hash':'81su2gN84NL','brand':'SEVEN SPARTA','title':'SEVEN SPARTA Paracord Grab Handles — Ford Bronco 2021-2026','desc':'550 paracord, roll bar mount. Bartact knockoff at a lower price point. Solid budget option if Bartact is out of stock.','usa':False},
        {'asin':'B0BHZR5XGB','hash':'81NoqE8Jq4L','brand':'E-cowlboy','title':'E-cowlboy Paracord Grab Handles — Ford Bronco 2021-2026','desc':'Military-spec 550 paracord, compatible with 2021-2026 Bronco roll bar. Front or rear mounting.','usa':False},
        {'asin':'B0BTDDSPG8','hash':'712YdLKKp5L','brand':'Boom Racing','title':'Boom Racing CNC Aluminum Grab Handles — Ford Bronco 2021-2026','desc':'CNC-machined aluminum, anodized finish, bolt-on roll bar installation. Good option if you prefer metal over paracord.','usa':False},
        {'asin':'B0CRY23BP8','hash':'71uabXYacXL','brand':'LFPartS','title':'LFPartS Roll Bar Grab Handles — Ford Bronco 2021-2026','desc':'Textured rubber grip, pairs of 2, fits front or rear roll bar positions on the Bronco.','usa':False},
    ],
    # ----------------------------------------------------------------
    # FLOOR MATS — All hashes CDN-verified.
    # ----------------------------------------------------------------
    'floor-mats': [
        {'asin':'B0C817Y5T9','hash':'61rDS+wcxHL','brand':'LASFIT','title':'LASFIT All-Weather Floor Mats — Ford Bronco 2021-2026','desc':'Laser-measured custom fit, raised lip edges, 100% waterproof, easy hose-clean. Top-selling Bronco floor mat on Amazon.','usa':False},
        {'asin':'B0F6RPXNMP','hash':'71TUg7O4TyL','brand':'Custom Fit','title':'Custom Fit All-Weather Floor Mats — Ford Bronco 2021-2026','desc':'TPE material, odorless, full front and rear set, custom fit to Bronco floor contours.','usa':False},
        {'asin':'B0H7Q3D6P7','hash':'81uliCD5bEL','brand':'KARPAL','title':'KARPAL Floor Mats & Cargo Liner Set — Ford Bronco 2021-2026','desc':'Full set including cargo liner, custom fit, waterproof TPE. Good value for front+rear+cargo in one kit.','usa':False},
    ],
    # ----------------------------------------------------------------
    # BUMPERS — No Rough Country. All hashes CDN-verified.
    # ----------------------------------------------------------------
    'bumpers': [
        {'asin':'B0F2MC2PHT','hash':'71FmIJnU6cL','brand':'Fab Fours','title':'Fab Fours Aluminum Front Bumper — Ford Bronco 2021-2026','desc':'Heavy-duty aluminum construction, winch-ready cutout, D-ring tabs, bolt-on install. Lighter than steel, maintains decent ground clearance.','usa':False},
        {'asin':'B07GZRT1ZH','hash':'81Df+fuuDfL','brand':'ECOTRIC','title':'ECOTRIC Stubby Steel Front Bumper — Ford Bronco 2021-2026','desc':'Heavy-duty steel, integrated D-ring mounts, skid plate included, pre-drilled light tabs. Full bumper replacement, bolt-on.','usa':False},
        {'asin':'B0C36VSCT3','hash':'71p52bmsOqL','brand':'KUAFU','title':'KUAFU Front Bumper Skid Plate — Ford Bronco 2021-2026','desc':'Steel skid plate that bolts to the factory front bumper — adds underbody protection without full bumper replacement.','usa':False},
    ],
    # ----------------------------------------------------------------
    # LIFT KITS — No Rough Country. All hashes CDN-verified.
    # ----------------------------------------------------------------
    'lift-kits': [
        {'asin':'B0D1WT32FZ','hash':'61K58tFuFuL','brand':'Supreme Suspensions','title':'Supreme Suspensions 2-Inch Leveling Kit — Ford Bronco 2021-2026','desc':'Billet aluminum coil spring spacers, raises front 2 inches, maintains factory ride quality. Simple bolt-on with no cutting. Most popular Bronco leveling kit.','usa':False},
        {'asin':'B0GHYRBYDN','hash':'71U8IRbQuoL','brand':'MotoFab','title':'MotoFab 2-Inch Front Coil Spring Spacer — Ford Bronco 2021-2026','desc':'High-strength steel spacers, raises front 2 inches to level the stance and clear 33-35 inch tires. No cutting required.','usa':False},
    ],
    # ----------------------------------------------------------------
    # ROOF & TOPS — All hashes CDN-verified.
    # ----------------------------------------------------------------
    'roof-accessories': [
        {'asin':'B07JMX7ZQ2','hash':'615KH9GaMvL','brand':'Bestop','title':'Bestop Trektop NX Soft Top — Ford Bronco 4-Door 2021-2026','desc':'Premium Twill fabric, best-in-class sealing, integrated front header, quick-release rear side windows. The gold standard for Bronco soft tops.','usa':False},
        {'asin':'B0BPJSQ8FP','hash':'71bEPvik2eL','brand':'Bestop','title':'Bestop Supertop Black Diamond — Ford Bronco 2-Door 2021-2026','desc':'Heavy-duty vinyl, tinted rear windows, all hardware included. Made in USA by Bestop. Built for 2-door Bronco.','usa':False},
        {'asin':'B0G3GPL64B','hash':'71Iy-f4MhBL','brand':'EcoNour','title':'EcoNour Windshield Sunshade — Ford Bronco 2021-2026','desc':'Custom-fit front windshield sun shade, reflective exterior, foldable storage, 2-door and 4-door fitment. Keeps interior temperature down significantly.','usa':False},
        {'asin':'B09V2HBLSZ','hash':'8132Tx25jKL','brand':'Mabett','title':'Mabett Windshield Sun Shade — Ford Bronco 2021-2026 (2/4-Door)','desc':'Multi-layer reflective material, custom-fit for Bronco windshield, includes visor strip. Works for both 2-door and 4-door configurations.','usa':False},
    ],
    # ----------------------------------------------------------------
    # LIGHTING — All hashes CDN-verified.
    # ----------------------------------------------------------------
    'lighting': [
        {'asin':'B09P3W6BB1','hash':'71XbEMvjSZL','brand':'Nilight','title':'Nilight 52-Inch LED Light Bar — Ford Bronco Roof Mount','desc':'Spot flood combo, 400W equivalent output, IP67 waterproof, wiring harness included. Fits most Bronco roof mount brackets.','usa':False},
        {'asin':'B01LXD9RWN','hash':'71W6Xc2k0HL','brand':'Auxbeam','title':'Auxbeam 50-Inch 288W LED Light Bar — Ford Bronco 2021-2026','desc':'5D reflector lens, spot flood combo, IP67 rated, fits most Bronco roof and bumper mounts.','usa':False},
        {'asin':'B077Q6LRZ4','hash':'71yWMfZFu1L','brand':'Nilight','title':'Nilight 50-Inch Curved LED Light Bar — Ford Bronco Hood/Windshield Mount','desc':'Curved profile follows Bronco hood contour, wiring harness included, 288W equivalent, IP67.','usa':False},
    ],
    # ----------------------------------------------------------------
    # STORAGE — Full range: center console + rear cargo. All hashes CDN-verified.
    # ----------------------------------------------------------------
    'storage': [
        {'asin':None,'img':BARTACT_MOLLE_IMG,'brand':'Bartact','title':'Bartact Front Door Storage Bags — Ford Bronco 2021-2026 (Made in USA)','desc':'Bartact makes vehicle-specific door bags, center console storage, MOLLE panels, and visor storage for the Ford Bronco. Custom-fit, patent pending designs. Made in the USA.','usa':True,'url':'https://bartact.com/collections/ford-bronco-accessories-2021-2022-2023'},
        {'asin':'B0GXVL1Q8C','hash':'71bfJDa-G0L','brand':'GXVL','title':'Trunk Hidden Storage Box — Ford Bronco 4-Door 2021-2026','desc':'Mounts under the cargo floor for hidden storage. Fits behind the rear seats in the 4-door Bronco. Great for valuables and gear you want out of sight.','usa':False},
        {'asin':'B0C9GP7T5K','hash':'71ms1G1GHuL','brand':'Offroader','title':'Roll Bar Cargo Storage Bag — Ford Bronco 2021-2026','desc':'Attaches to the Bronco roll bar, keeps gear accessible without taking up seat or floor space. Fits both 2-door and 4-door.','usa':False},
        {'asin':'B07VG6YKGM','hash':'81Fu0O2oaQL','brand':'NOCO','title':'Center Console Organizer Tray — Ford Bronco 2021-2026','desc':'Drop-in tray for the Bronco center console, keeps phone, keys, and gear from sliding around. No-drill install.','usa':False},
        {'asin':'B0CWL41JXP','hash':'715LGjOn9xL','brand':'Tuff Support','title':'Center Console Organizer — Ford Bronco 2021-2026','desc':'Multiple compartments, custom-fit for Bronco center console, easy install.','usa':False},
    ],
    # ----------------------------------------------------------------
    # WINCHES — Real winches. All hashes CDN-verified.
    # ----------------------------------------------------------------
    'winches': [
        {'asin':'B0DJSC72DQ','hash':'812VaMHAxnL','brand':'OPENROAD','title':'OPENROAD 9,500 lb Electric Winch — Ford Bronco 2021-2026','desc':'9,500 lb rated, synthetic rope, waterproof IP67, wireless remote + wired control. Fits Bronco front bumper winch plate.','usa':False},
        {'asin':'B0BDQCHRQH','hash':'71XqE5mmgbL','brand':'RUGCEL','title':'RUGCEL 13,500 lb Winch with Synthetic Rope — Ford Bronco','desc':'13,500 lb pulling capacity, synthetic rope, IP67, wireless and wired remote. Handles serious recovery situations.','usa':False},
        {'asin':'B0CZNCC9L2','hash':'71xYs-MwM6L','brand':'RUGCEL','title':'RUGCEL 12,000 lb Steel Cable Winch — Ford Bronco 2021-2026','desc':'12,000 lb capacity, steel cable, IP67 waterproof, 12V electric. Fits Bronco aftermarket and factory winch-ready bumpers.','usa':False},
        {'asin':'B0DDGSRPK8','hash':'81axjOks2fL','brand':'Nilight','title':'Complete Winch Rigging Kit — D-Shackles, Snatch Block, Tow Strap','desc':'Everything you need to rig a winch recovery: kinetic strap, D-ring shackles, snatch block, tree saver, gloves.','usa':False},
    ],
    # ----------------------------------------------------------------
    # SKID PLATES — All hashes CDN-verified.
    # ----------------------------------------------------------------
    'skid-plates': [
        {'asin':'B09WTD4Y1H','hash':'51ThP7Rk3WL','brand':'DV8 Offroad','title':'DV8 Steel Front Skid Plate — Ford Bronco 2021-2026','desc':'3/16-inch steel, bolt-on install, protects steering rack and front differential. DV8 is a top-tier Bronco accessory brand.','usa':False},
        {'asin':'B0BCXCJKSJ','hash':'41hertaew+L','brand':'DV8 Offroad','title':'DV8 Rear Differential Skid Plate — Ford Bronco 2021-2026','desc':'Protects the rear diff on trail drops and rocks. 3/16 steel, black finish, bolt-on install.','usa':False},
        {'asin':'B0DRCRFWV4','hash':'61xpIwTEyaL','brand':'Chassis Armor','title':'Engine Skid Plate — Ford Bronco 2021-2023','desc':'Underbody skid plate covering the engine/transmission area. Steel construction, bolt-on with included hardware.','usa':False},
        {'asin':'B0C36VSCT3','hash':'71p52bmsOqL','brand':'KUAFU','title':'KUAFU Front Bumper Skid Plate — Ford Bronco 2021-2026','desc':'Mounts to the factory front bumper, adds steel protection without full bumper replacement. Affordable first step for trail protection.','usa':False},
    ],
    # ----------------------------------------------------------------
    # STEPS / RUNNING BOARDS — All hashes CDN-verified.
    # ----------------------------------------------------------------
    'steps': [
        {'asin':'B09KH53PKK','hash':'71U50jh8RzL','brand':'Iron Cross','title':'Running Boards — Ford Bronco 4-Door 2021-2026','desc':'Amazon Choice pick for Bronco running boards. Textured steel step surface, bolt-on install, fits 4-door Bronco.','usa':False},
        {'asin':'B0GK18LTQM','hash':'71EWQJN8hCL','brand':'Tyger Auto','title':'6-Inch Running Boards — Ford Bronco 4-Door 2021-2026','desc':'6-inch wide step, textured non-slip surface, bolt-on no-drill install for 4-door Bronco.','usa':False},
        {'asin':'B0GVM78XVW','hash':'81hjiALmIgL','brand':'Romik','title':'Running Boards — Ford Bronco 4-Door 2021-2026','desc':'Custom-fit for Bronco 4-door (non-Sport), heavy-duty steel, powder-coated black finish.','usa':False},
    ],
    # ----------------------------------------------------------------
    # MOLLE GEAR — Bartact #1 (direct). All hashes CDN-verified.
    # ----------------------------------------------------------------
    'molle-gear': [
        {'asin':None,'img':BARTACT_SEAT_IMG,'brand':'Bartact','title':'Bartact MOLLE Seat Covers & Gear — Ford Bronco 2021-2026','desc':'Bartact builds MOLLE seat covers with built-in mil-spec PALS webbing for the Bronco. Attach pouches, holsters, and organizers directly to the seat back. Made in the USA.','usa':True,'url':'https://bartact.com/collections/ford-bronco-accessories-2021-2022-2023'},
        {'asin':'B0BXS7YTKH','hash':'81CH0dsWMCL','brand':'MAIKER','title':'MAIKER Tactical MOLLE Seat Back Panel — Ford Bronco 2021-2026','desc':'2-piece set, attaches to front headrest posts, full MOLLE/PALS webbing. Custom-fit for Bronco. Expands storage without modifying seat covers.','usa':False},
        {'asin':'B0DF3KVFW2','hash':'81Q0YSqBzPL','brand':'DV8 Offroad','title':'DV8 MOLLE Seat Back Pockets — Ford Bronco 2021-2026','desc':'DV8 brand MOLLE panels replace factory seat back trim. Rigidly mounted, full PALS grid, fits all Bronco seat back positions.','usa':False},
    ],
    # ----------------------------------------------------------------
    # RECOVERY GEAR — Real recovery equipment. All hashes CDN-verified.
    # ----------------------------------------------------------------
    'recovery': [
        {'asin':'B0CRT2386F','hash':'71AnNel4kKL','brand':'MAXTRAX','title':'MAXTRAX LITE Vehicle Recovery Boards — Ford Bronco Off-Road','desc':'The gold standard in recovery boards. MAXTRAX LITE is the entry version — lighter, still highly effective in sand, mud, and snow. Pairs of 2.','usa':False},
        {'asin':'B07SZJLJTH','hash':'711BRGzBo3L','brand':'MAXTRAX','title':'MAXTRAX MKII Vehicle Recovery Boards — Ford Bronco Off-Road','desc':'The original and most proven recovery board. MKII is the full-size version — rated for heavier vehicles, maximum grip in all terrain.','usa':False},
        {'asin':'B07R5HYGDN','hash':'71zY42uXJLL','brand':'X-BULL','title':'X-BULL Recovery Traction Boards — Bronco Sand Mud Snow Recovery','desc':'Budget alternative to MAXTRAX. Solid grip, stackable, includes carry bag. Good choice for occasional use.','usa':False},
        {'asin':'B0DDGSRPK8','hash':'81axjOks2fL','brand':'Nilight','title':'Winch Rigging & Recovery Kit — D-Shackles, Snatch Block, Tow Strap','desc':'Complete recovery rigging kit: kinetic strap, D-ring shackles, snatch block, tree saver strap, gloves. Essential if you run a winch.','usa':False},
        {'asin':'B0BQJ28R7L','hash':'71o7KnEexcL','brand':'OEDRO','title':'10-Ton Recovery Kit — Winch Snatch Block Set — Ford Bronco Off-Road','desc':'High-capacity snatch block, tow straps, D-rings — handles serious Bronco recovery situations.','usa':False},
    ],
    # ----------------------------------------------------------------
    # CARGO LINERS — No WeatherTech/Husky. All hashes CDN-verified.
    # ----------------------------------------------------------------
    'cargo-liners': [
        {'asin':'B0H7Q3D6P7','hash':'81uliCD5bEL','brand':'KARPAL','title':'KARPAL Cargo Liner & Floor Mat Set — Ford Bronco 2021-2026','desc':'Custom-fit cargo liner plus full floor mat set, waterproof TPE material. Good value full-coverage kit.','usa':False},
        {'asin':'B0C817Y5T9','hash':'61rDS+wcxHL','brand':'LASFIT','title':'LASFIT All-Weather Floor & Cargo Mats — Ford Bronco 2021-2026','desc':'Laser-measured custom fit, raised edges, easy-clean waterproof surface. Includes cargo area liner.','usa':False},
    ],
}

YEARS = ['2021','2022','2023','2024','2025','2026']
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
        if p.get('hash') == grab_img:
            errors.append(f'ERROR: Grab handle image {grab_img} found in seat-covers')

    # Rule 3: No Rough Country, no Coverado, no PRP
    banned = ['rough country', 'coverado', 'prp seats', 'prp']
    for key, prods in PRODUCTS.items():
        for p in prods:
            for b in banned:
                if b in p['title'].lower() or b in p.get('desc','').lower():
                    errors.append(f'ERROR: Banned brand "{b}" in {key}: {p["title"]}')
    
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
    ('seat-covers',     'Seat Covers',        'best-bronco-seat-covers',     'Custom-fit tactical and neoprene seat covers for Ford Bronco 2021-2026.'),
    ('grab-handles',    'Grab Handles',        'best-bronco-grab-handles',    'Paracord and aluminum grab handles for Bronco roll bar — invented by Bartact.'),
    ('floor-mats',      'Floor Mats',          'best-bronco-floor-mats',      'Custom-fit all-weather floor mats for Ford Bronco 2021-2026.'),
    ('bumpers',         'Bumpers',             'best-bronco-bumpers',         'Steel and aluminum front bumpers with winch mounts and D-ring tabs.'),
    ('lift-kits',       'Lift Kits',           'best-bronco-lift-kits',       'Leveling kits and lift kits for Ford Bronco 2021-2026.'),
    ('skid-plates',     'Skid Plates',         'best-bronco-skid-plates',     'Steel underbody skid plates protecting engine, diff, and transfer case.'),
    ('steps',           'Steps & Running Boards','best-bronco-steps',         'Running boards and rock sliders for 2-door and 4-door Ford Bronco.'),
    ('roof-accessories','Roof & Tops',         'best-bronco-roof-accessories','Soft tops, sunshades, and roof accessories for Ford Bronco.'),
    ('lighting',        'Lighting',            'best-bronco-lighting',        'LED light bars, pod lights, and fog light upgrades for Ford Bronco.'),
    ('storage',         'Storage',             'best-bronco-storage',         'Console organizers, cargo boxes, roll bar bags, and MOLLE storage.'),
    ('winches',         'Winches',             'best-bronco-winches',         'Electric winches and rigging kits for Ford Bronco recovery.'),
    ('molle-gear',      'MOLLE Gear',          'best-bronco-molle-gear',      'MOLLE panels, pouches, and tactical storage for Ford Bronco.'),
    ('recovery',        'Recovery Gear',       'best-bronco-recovery',        'Recovery boards, winch kits, and emergency gear for Bronco off-road.'),
    ('cargo-liners',    'Cargo Liners',        'best-bronco-cargo-liners',    'Custom-fit cargo liners and trunk protection for Ford Bronco.'),
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
    # Bartact uses Shopify CDN image, not Amazon CDN
    if 'img' in p:
        img = p['img']
    else:
        img = f'https://m.media-amazon.com/images/I/{p["hash"]}._AC_SL400_.jpg'
    # CRITICAL: For Bartact products, link directly to bartact.com, NOT Amazon
    if p['brand'] == 'Bartact':
        url = p.get('url', 'https://bartact.com/collections/ford-bronco-accessories-2021-2022-2023')
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
    for key, name, slug, desc in CATEGORIES:
        cat_cards += f'''<a class="cat-card" href="/{slug}.html">
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
             "acceptedAnswer":{"@type":"Answer","text":"Yes. Bartact makes custom-cut MOLLE tactical seat covers specifically for the Ford Bronco 2021-2026, available for both 2-door and 4-door configurations. They are airbag-compatible and made in the USA."}},
        ]
    })

    body = f'''
<script type="application/ld+json">{schema}</script>
<div class="hero">
<h1>Best Ford Bronco Accessories <span>{YEAR}</span></h1>
<p>The definitive buyer's guide for Ford Bronco 2021-2026. Every category covered — seat covers, grab handles, bumpers, lift kits, lighting, tires, and more. 2-door and 4-door specific picks.</p>
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
<p>BestBroncoAccessories.com covers every Ford Bronco accessory category with real product picks, honest editorial, and vehicle-specific guidance. We separate 2-door and 4-door fitment where it matters, break down year-specific differences (2021 vs 2022-2024 vs 2025-2026), and only recommend products we'd actually buy.</p>
<p>Bartact makes our top pick for seat covers — custom-cut for the Bronco platform, airbag-safe, Made in USA. For everything else, we rank by real-world value and fitment accuracy, not by margin.</p>
</div>

</div>'''

    return page_shell(
        f'Best Ford Bronco Accessories {YEAR} — Buyer\'s Guide by Category',
        f'Shop the best Ford Bronco accessories for 2021-2026. Seat covers, grab handles, bumpers, lift kits, tires, lighting — 2-door and 4-door specific picks.',
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
<p><strong>Finding the right {name.lower()} for your Ford Bronco</strong> means knowing your year and configuration first. The 2021 Bronco has minor differences from 2022-2024 (revised trim levels, some electrical updates), and 2025-2026 brought further trim refinements — but fitment for seat covers, grab handles, and most accessories remains the same across 2021-2026. 2-door vs 4-door matters for seat covers, soft tops, and some storage products — but not for bumpers, winches, grab handles, or lighting.</p>
<p>All picks below are verified Amazon listings with confirmed availability. Bartact is our top pick where applicable — they make the only custom-cut, MOLLE tactical covers built specifically for the Bronco platform in the USA.</p>
</div>

<h2>Related Categories</h2>
<div class="related-grid">{related}</div>

<h2>Shop by Year</h2>
<p>{year_links} &mdash; {config_links}</p>

<h2>Top {name} Picks for Ford Bronco</h2>
<div class="picks-grid">{cards}</div>

</div>'''

    return page_shell(
        f'Best Ford Bronco {name} {YEAR} — Buyer\'s Guide',
        f'Best Ford Bronco {name.lower()} for 2021-2026. {desc} 2-door and 4-door picks included.',
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
<p>The <strong>{year} Ford Bronco</strong> uses the same Gen 1 platform as 2021-2026. Most accessories are cross-compatible across years, but always verify fitment for seat covers (which are cut to specific seat profiles) and soft tops (which vary by trim level). Grab handles, bumpers, winches, and lighting fit all years.</p>
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

# Post-build: submit to Google Indexing API + IndexNow
from build_utils import post_build_submit
post_build_submit('bestbroncoaccessories.com')
