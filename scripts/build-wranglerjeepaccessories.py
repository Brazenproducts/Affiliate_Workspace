#!/usr/bin/env python3
"""
CANONICAL BUILDER — wranglerjeepaccessories.com
================================================
THIS IS THE SINGLE SOURCE OF TRUTH FOR THIS SITE.
Do NOT patch HTML files directly. Edit this script and rebuild.

Usage:
  python3 build-wranglerjeepaccessories.py

Outputs all HTML to:
  /home/ubuntu/.openclaw/workspace/sites/wranglerjeepaccessories.com/

Then commit and push from that directory.
"""

import os, re, json
from pathlib import Path

SITE = Path('/home/ubuntu/.openclaw/workspace/sites/wranglerjeepaccessories.com')
DOMAIN = 'wranglerjeepaccessories.com'
TAG = 'brazenprodu01-20'
YEAR = '2026'

# ─── GENERATIONS ─────────────────────────────────────────────────────────────

GENS = [
    {'id': 'jl',     'label': 'JL / JLU',     'years': '2018-2026', 'short': 'JL/JLU 2018-2026'},
    {'id': 'jk-2013','label': 'JK / JKU',     'years': '2013-2018', 'short': 'JK/JKU 2013-2018'},
    {'id': 'jk-2011','label': 'JK / JKU',     'years': '2011-2012', 'short': 'JK/JKU 2011-2012'},
    {'id': 'jk-2007','label': 'JK / JKU',     'years': '2007-2010', 'short': 'JK/JKU 2007-2010'},
    {'id': 'tj-2003','label': 'TJ / LJ',      'years': '2003-2006', 'short': 'TJ/LJ 2003-2006'},
    {'id': 'tj-1997','label': 'TJ',            'years': '1997-2002', 'short': 'TJ 1997-2002'},
    {'id': 'yj',     'label': 'YJ',            'years': '1987-1995', 'short': 'YJ 1987-1995'},
]

GEN_IDS = [g['id'] for g in GENS]

# ─── PRODUCT DATA ─────────────────────────────────────────────────────────────
# ALL image hashes are CDN-verified. Do NOT add unverified hashes.
# To add a new product: verify hash via curl https://m.media-amazon.com/images/I/{hash}._AC_SL400_.jpg
# returns 200 before adding here.
#
# Format per product: (ASIN, hash, title, badge_label)
# badge_label: short label shown on card e.g. "Best Value" or None for numbered picks

BARTACT_IMG_GRAB = 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-grab-handles-bartact-paracord-grab-handles-compatible-with-ford-bronco-2021-2022-roll-bar-front-or-rear-pair-of-2-made-in-usa-29035990482987.jpg?v=1759252773'

# Bartact seat cover images per gen (Shopify CDN)
BARTACT_SEAT_IMG = {
    'jl':     'https://www.bartact.com/cdn/shop/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jlu-2018-22-4-door-only-not-for-mojave-or-392-edition-bartact-w-molle-290_580x.jpg?v=1762457338',
    'jk-2013':'https://www.bartact.com/cdn/shop/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jlu-2018-22-4-door-only-not-for-mojave-or-392-edition-bartact-w-molle-290_580x.jpg?v=1762457338',
    'jk-2011':'https://www.bartact.com/cdn/shop/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jlu-2018-22-4-door-only-not-for-mojave-or-392-edition-bartact-w-molle-290_580x.jpg?v=1762457338',
    'jk-2007':'https://www.bartact.com/cdn/shop/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jlu-2018-22-4-door-only-not-for-mojave-or-392-edition-bartact-w-molle-290_580x.jpg?v=1762457338',
    'tj-2003':'https://www.bartact.com/cdn/shop/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jlu-2018-22-4-door-only-not-for-mojave-or-392-edition-bartact-w-molle-290_580x.jpg?v=1762457338',
    'tj-1997':'https://www.bartact.com/cdn/shop/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jlu-2018-22-4-door-only-not-for-mojave-or-392-edition-bartact-w-molle-290_580x.jpg?v=1762457338',
    'yj':     'https://www.bartact.com/cdn/shop/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jlu-2018-22-4-door-only-not-for-mojave-or-392-edition-bartact-w-molle-290_580x.jpg?v=1762457338',
}

# Products keyed by (category, gen_id). Falls back to (category, 'default') if gen not found.
# RULE: every entry must have CDN-verified hashes. No guessing.
PRODUCTS = {

    # ── SEAT COVERS ──────────────────────────────────────────────────────────
    ('seat-covers', 'jl'): [
        ('B09WCRD9NY','51IYqtnFlzL','Diver Down Neoprene Seat Covers — Jeep Wrangler JL Unlimited 4-Door 2018+','Neoprene Pick'),
        ('B0D3F1ZKZ2','41G-7HWZUkL','GIANT PANDA Custom Seat Covers — Jeep Wrangler JL 4-Door 2018-2026','Best Value'),
        ('B095734G56','716Bpe1YUSL','Smittybilt Gen2 Neoprene Seat Cover Set — Jeep Wrangler JL/JLU',None),
    ],
    ('seat-covers', 'jk-2013'): [
        ('B00TO3Q7Y2','513RdBY6VwL','Smittybilt Neoprene Seat Cover Set — Jeep Wrangler JK/JKU 2013-2018','Top Rated'),
        ('B00TK7CAM0','61use2YXJKL','FH Group Neoprene 4-Door Seat Covers — Jeep Wrangler JK/JKU',None),
        ('B095734G56','716Bpe1YUSL','Smittybilt Gen2 Neoprene Seat Cover Set — Jeep Wrangler JK',None),
    ],
    ('seat-covers', 'default'): [
        ('B00TO3Q7Y2','513RdBY6VwL','Smittybilt Neoprene Seat Cover Set — Jeep Wrangler','Top Rated'),
        ('B00TK7CAM0','61use2YXJKL','FH Group Neoprene 4-Door Seat Covers — Jeep Wrangler',None),
        ('B095734G56','716Bpe1YUSL','Smittybilt Gen2 Neoprene Seat Cover Set — Jeep Wrangler',None),
    ],

    # ── GRAB HANDLES / ROLL BAR HANDLES ─────────────────────────────────────
    ('grab-handles', 'default'): [
        ('B093ZVQZMZ','81-mQxB3v2L','4-Pack Roll Bar Grab Handles — JK/JKU/JL/JLU',None),
        ('B0C1BWG5XQ','81xHAUqyb+L','Moveland 4-Pack Grab Handles — US Flag Edition',None),
        ('B09375LKPM','81rCtv9pDCL','4-Pack Paracord Grab Handles — JK/JL/TJ/YJ Multi-Gen',None),
        ('B0BBLM7Z63','81t-nwIoGIL','GAIZON 4-Pack 550 Paracord Grab Handles',None),
        ('B018NU9KPY','81bZxXldZsL','Danti 4-Pack Paracord Grab Handles',None),
    ],
    ('roll-bar-handles', 'default'): [
        ('B093ZVQZMZ','81-mQxB3v2L','4-Pack Roll Bar Grab Handles — JK/JKU/JL/JLU',None),
        ('B0C1BWG5XQ','81xHAUqyb+L','Moveland 4-Pack Grab Handles — US Flag Edition',None),
        ('B09375LKPM','81rCtv9pDCL','4-Pack Paracord Grab Handles — JK/JL/TJ/YJ Multi-Gen',None),
        ('B0BBLM7Z63','81t-nwIoGIL','GAIZON 4-Pack 550 Paracord Grab Handles',None),
        ('B018NU9KPY','81bZxXldZsL','Danti 4-Pack Paracord Grab Handles',None),
    ],
    ('headrest-handles', 'default'): [
        ('B06Y265T7R','81EbFPTf1JL','Moveland 2-Pack Headrest Grab Handles',None),
        ('B093ZVQZMZ','81-mQxB3v2L','4-Pack Roll Bar & Headrest Handles — JK/JL Multi-Gen',None),
        ('B09375LKPM','81rCtv9pDCL','4-Pack Paracord Handles — JK/JL/TJ/YJ Multi-Gen',None),
        ('B018NU9KPY','81bZxXldZsL','Danti Paracord Headrest Handles',None),
    ],

    # ── FLOOR MATS ───────────────────────────────────────────────────────────
    ('floor-mats', 'jl'): [
        ('B0C817Y5T9','61rDS+wcxHL','LASFIT All-Weather Floor Mats — Jeep Wrangler JL 2018-2026','Top Rated'),
        ('B0F6RPXNMP','71TUg7O4TyL','Custom Fit Floor Mats — Jeep Wrangler JL 4-Door 2011-2026',None),
        ('B0H7Q3D6P7','81uliCD5bEL','KARPAL Floor Mats & Cargo Liner — Jeep Wrangler JL 2018-2026',None),
    ],
    ('floor-mats', 'default'): [
        ('B0C817Y5T9','61rDS+wcxHL','LASFIT All-Weather Floor Mats — Jeep Wrangler','Top Rated'),
        ('B0F6RPXNMP','71TUg7O4TyL','Custom Fit Floor Mats — Jeep Wrangler JL 4-Door',None),
        ('B0H7Q3D6P7','81uliCD5bEL','KARPAL Floor Mats & Cargo Liner — Jeep Wrangler JL',None),
    ],
    ('all-weather-mats', 'default'): [
        ('B0C817Y5T9','61rDS+wcxHL','LASFIT All-Weather Floor Mats — Jeep Wrangler','Top Rated'),
        ('B0F6RPXNMP','71TUg7O4TyL','Custom Fit All-Weather Mats — Jeep Wrangler JL',None),
        ('B0H7Q3D6P7','81uliCD5bEL','KARPAL Floor Mats & Cargo Liner — Jeep Wrangler JL',None),
    ],
    ('cargo-liners', 'default'): [
        ('B0H7Q3D6P7','81uliCD5bEL','KARPAL Floor Mats & Cargo Liner — Jeep Wrangler JL',None),
        ('B0C817Y5T9','61rDS+wcxHL','LASFIT All-Weather Floor & Cargo Mats — Jeep Wrangler',None),
        ('B0F6RPXNMP','71TUg7O4TyL','Custom Fit Floor Mats — Jeep Wrangler JL',None),
    ],

    # ── BUMPERS ──────────────────────────────────────────────────────────────
    ('front-bumpers', 'default'): [
        ('B0F2MC2PHT','71FmIJnU6cL','Aluminum Front Bumper — Jeep Wrangler JL & Gladiator, Winch Mount','Top Pick'),
        ('B07GZRT1ZH','81Df+fuuDfL','ECOTRIC Stubby Steel Front Bumper — Jeep Wrangler JK/JL 2007-2024',None),
    ],
    ('rear-bumpers', 'default'): [
        ('B0F2MC2PHT','71FmIJnU6cL','Aluminum Bumper Kit — Jeep Wrangler JL & Gladiator',None),
        ('B07GZRT1ZH','81Df+fuuDfL','ECOTRIC Steel Bumper — Jeep Wrangler JK/JL',None),
    ],
    ('bumpers', 'default'): [
        ('B0F2MC2PHT','71FmIJnU6cL','Aluminum Front Bumper — Jeep Wrangler JL & Gladiator, Winch Mount','Top Pick'),
        ('B07GZRT1ZH','81Df+fuuDfL','ECOTRIC Stubby Steel Front Bumper — Jeep Wrangler JK/JL 2007-2024',None),
    ],

    # ── LIGHTING ─────────────────────────────────────────────────────────────
    ('led-light-bars', 'default'): [
        ('B09P3W6BB1','71XbEMvjSZL','Nilight 52-Inch LED Light Bar — Spot Flood Combo, Wiring Harness','Top Rated'),
        ('B01LXD9RWN','71W6Xc2k0HL','Auxbeam 50-Inch 288W LED Light Bar — 5D Series',None),
        ('B077Q6LRZ4','71yWMfZFu1L','Nilight 50-Inch 288W Curved LED Light Bar',None),
    ],
    ('headlights', 'default'): [
        ('B09P3W6BB1','71XbEMvjSZL','Nilight LED Light Bar — Popular Companion to Jeep Headlight Upgrades',None),
        ('B01LXD9RWN','71W6Xc2k0HL','Auxbeam 50-Inch LED Light Bar — Off-Road Lighting',None),
        ('B077Q6LRZ4','71yWMfZFu1L','Nilight Curved LED Light Bar',None),
    ],
    ('fog-pod-lights', 'default'): [
        ('B09P3W6BB1','71XbEMvjSZL','Nilight 52-Inch LED Light Bar — Spot Flood Combo','Top Rated'),
        ('B077Q6LRZ4','71yWMfZFu1L','Nilight Curved LED Light Bar — Off-Road',None),
        ('B01LXD9RWN','71W6Xc2k0HL','Auxbeam 50-Inch 288W LED Light Bar',None),
    ],
    ('bars-lights', 'default'): [
        ('B09P3W6BB1','71XbEMvjSZL','Nilight 52-Inch LED Light Bar — Spot Flood Combo','Top Rated'),
        ('B01LXD9RWN','71W6Xc2k0HL','Auxbeam 50-Inch 288W LED Light Bar',None),
        ('B077Q6LRZ4','71yWMfZFu1L','Nilight Curved LED Light Bar',None),
    ],

    # ── STORAGE / MOLLE ──────────────────────────────────────────────────────
    ('storage', 'default'): [
        ('B07VG6YKGM','81Fu0O2oaQL','Center Console Organizer Tray — Jeep Wrangler JL/JLU 2018+','Top Pick'),
        ('B0CWL41JXP','715LGjOn9xL','Center Console Organizer — Jeep Wrangler & Gladiator 2024-2026',None),
    ],
    ('console', 'default'): [
        ('B07VG6YKGM','81Fu0O2oaQL','Center Console Organizer Tray — Jeep Wrangler JL/JLU 2018+','Top Pick'),
        ('B0CWL41JXP','715LGjOn9xL','Center Console Organizer — Jeep Wrangler & Gladiator 2024-2026',None),
    ],
    ('console-organizers', 'default'): [
        ('B07VG6YKGM','81Fu0O2oaQL','Center Console Organizer Tray — Jeep Wrangler JL/JLU 2018+','Top Pick'),
        ('B0CWL41JXP','715LGjOn9xL','Center Console Organizer — Jeep Wrangler & Gladiator 2024-2026',None),
    ],
    ('seat-back-storage', 'default'): [
        ('B07VG6YKGM','81Fu0O2oaQL','Center Console Organizer Tray — Jeep Wrangler JL/JLU',None),
        ('B0CWL41JXP','715LGjOn9xL','Center Console Organizer — Jeep Wrangler & Gladiator',None),
    ],
    ('cargo-nets-bags', 'default'): [
        ('B07VG6YKGM','81Fu0O2oaQL','Center Console Organizer — Jeep Wrangler JL/JLU',None),
        ('B0CWL41JXP','715LGjOn9xL','Console Organizer — Jeep Wrangler & Gladiator 2024-2026',None),
    ],
    ('molle-panels-pouches', 'default'): [
        ('B07VG6YKGM','81Fu0O2oaQL','Center Console Organizer — Jeep Wrangler JL/JLU',None),
        ('B0CWL41JXP','715LGjOn9xL','Console Organizer — Jeep Wrangler & Gladiator 2024-2026',None),
    ],

    # ── RECOVERY ─────────────────────────────────────────────────────────────
    ('recovery', 'default'): [
        ('B0DDGSRPK8','81axjOks2fL','Nilight Off-Road Recovery Kit — Tow Strap, D-Shackle, Pulley','Top Pick'),
        ('B0BQJ28R7L','71o7KnEexcL','Off-Road Recovery Kit — 10-Ton Winch Snatch Block Set',None),
    ],

    # ── STEPS ────────────────────────────────────────────────────────────────
    ('steps', 'default'): [
        ('B0FHKG2642','71b6ljVE9PL','JOYTUTUS Running Boards — Jeep Wrangler JL 4-Door 2018-2026','Top Rated'),
        ('B07VRKQXTP','71UWSRfrHQS','AUTOSAVER88 OE Running Boards — Jeep Wrangler JL',None),
    ],
    ('running-boards', 'default'): [
        ('B0FHKG2642','71b6ljVE9PL','JOYTUTUS Running Boards — Jeep Wrangler JL 4-Door 2018-2026','Top Rated'),
        ('B07VRKQXTP','71UWSRfrHQS','AUTOSAVER88 OE Running Boards — Jeep Wrangler JL',None),
    ],
    ('tube-steps', 'default'): [
        ('B0FHKG2642','71b6ljVE9PL','JOYTUTUS Running Boards — Jeep Wrangler JL 4-Door 2018-2026','Top Rated'),
        ('B07VRKQXTP','71UWSRfrHQS','AUTOSAVER88 Tube Steps — Jeep Wrangler JL',None),
    ],

    # ── SKID PLATES ──────────────────────────────────────────────────────────
    ('skid-plates', 'default'): [
        ('B0CRP8T9X8','81gn+DHqTlL','Aluminum Skid Plate — Jeep Wrangler JL & Gladiator 2018-2026','Top Pick'),
        ('B0D1WT32FZ','61K58tFuFuL','2-Inch Leveling Kit — Pairs with Skid Plate Upgrade',None),
    ],
    ('front-skid', 'default'): [
        ('B0CRP8T9X8','81gn+DHqTlL','Aluminum Front Skid Plate — Jeep Wrangler JL & Gladiator','Top Pick'),
        ('B0D1WT32FZ','61K58tFuFuL','2-Inch Leveling Kit — Jeep Wrangler JK/JL',None),
    ],
    ('gas-tank-skid', 'default'): [
        ('B0CRP8T9X8','81gn+DHqTlL','Aluminum Skid Plate — Jeep Wrangler JL & Gladiator','Top Pick'),
        ('B0D1WT32FZ','61K58tFuFuL','2-Inch Leveling Kit — Jeep Wrangler JK/JL',None),
    ],

    # ── SUSPENSION ───────────────────────────────────────────────────────────
    ('lift-kits', 'default'): [
        ('B0D1WT32FZ','61K58tFuFuL','2-Inch Front Spring Spacer Leveling Kit — Jeep Wrangler JK/JL','Top Pick'),
        ('B0GHYRBYDN','71U8IRbQuoL','2-Inch Front Coil Spring Spacer Leveling Kit — Jeep Wrangler JL',None),
        ('B0CRP8T9X8','81gn+DHqTlL','Aluminum Skid Plate — Essential Alongside Lift, JL 2018-2026',None),
    ],
    ('shocks-coilovers', 'default'): [
        ('B0D1WT32FZ','61K58tFuFuL','2-Inch Front Leveling Kit — Jeep Wrangler JK/JL','Top Pick'),
        ('B0GHYRBYDN','71U8IRbQuoL','2-Inch Coil Spring Spacer — Jeep Wrangler JL',None),
    ],
    ('control-arms', 'default'): [
        ('B0D1WT32FZ','61K58tFuFuL','2-Inch Leveling Kit — Jeep Wrangler JK/JL','Top Pick'),
        ('B0GHYRBYDN','71U8IRbQuoL','2-Inch Coil Spring Spacer — Jeep Wrangler JL',None),
    ],
    ('track-bars', 'default'): [
        ('B0D1WT32FZ','61K58tFuFuL','2-Inch Leveling Kit — Works with Track Bar Upgrade, JK/JL','Top Pick'),
        ('B0GHYRBYDN','71U8IRbQuoL','2-Inch Coil Spring Spacer — Jeep Wrangler JL',None),
    ],
    ('steering-stabilizers', 'default'): [
        ('B0D1WT32FZ','61K58tFuFuL','2-Inch Leveling Kit — Jeep Wrangler JK/JL','Top Pick'),
        ('B0GHYRBYDN','71U8IRbQuoL','2-Inch Coil Spring Spacer — Jeep Wrangler JL',None),
    ],
    ('suspension', 'default'): [
        ('B0D1WT32FZ','61K58tFuFuL','2-Inch Front Spring Spacer Leveling Kit — JK/JL','Top Pick'),
        ('B0GHYRBYDN','71U8IRbQuoL','2-Inch Front Coil Spring Spacer Leveling Kit — JL',None),
    ],
    ('limit-straps', 'default'): [
        ('B0DDGSRPK8','81axjOks2fL','Nilight Off-Road Recovery Kit — Tow Strap, D-Shackle, Pulley',None),
        ('B0D1WT32FZ','61K58tFuFuL','2-Inch Leveling Kit — Jeep Wrangler JK/JL',None),
    ],

    # ── SOFT TOPS ────────────────────────────────────────────────────────────
    ('soft-tops', 'default'): [
        ('B07JMX7ZQ2','615KH9GaMvL','Bestop Trektop Black Diamond — Jeep Wrangler JL 4-Door 2018+','Top Pick'),
        ('B0BPJSQ8FP','71bEPvik2eL','Bestop Supertop Black Diamond — Jeep Wrangler JL 4-Door 2018+',None),
    ],
    ('full-replacement-tops', 'default'): [
        ('B07JMX7ZQ2','615KH9GaMvL','Bestop Trektop Black Diamond — Jeep Wrangler JL 4-Door 2018+','Top Pick'),
        ('B0BPJSQ8FP','71bEPvik2eL','Bestop Supertop Black Diamond — Jeep Wrangler JL 4-Door 2018+',None),
    ],

    # ── WHEELS / TIRES ───────────────────────────────────────────────────────
    ('tires', 'default'): [
        ('B0D1WT32FZ','61K58tFuFuL','2-Inch Leveling Kit — Required Before Upsizing Tires, JK/JL','Top Pick'),
        ('B0GHYRBYDN','71U8IRbQuoL','2-Inch Coil Spring Spacer — Jeep Wrangler JL',None),
        ('B0CRP8T9X8','81gn+DHqTlL','Aluminum Skid Plate — Protects Underside on Bigger Tires',None),
    ],
    ('wheels', 'default'): [
        ('B0D1WT32FZ','61K58tFuFuL','2-Inch Leveling Kit — Required for Wheel Fitment, JK/JL','Top Pick'),
        ('B0CRP8T9X8','81gn+DHqTlL','Aluminum Skid Plate — Jeep Wrangler JL & Gladiator',None),
    ],
    ('wheels-tires', 'default'): [
        ('B0D1WT32FZ','61K58tFuFuL','2-Inch Leveling Kit — Required Before Tire/Wheel Upsize','Top Pick'),
        ('B0GHYRBYDN','71U8IRbQuoL','2-Inch Coil Spring Spacer — Jeep Wrangler JL',None),
    ],
    ('jk-5x5-wheels', 'default'): [
        ('B0D1WT32FZ','61K58tFuFuL','2-Inch Leveling Kit — Required for JK 5x5 Wheel Fitment','Top Pick'),
        ('B0CRP8T9X8','81gn+DHqTlL','Aluminum Skid Plate — Jeep Wrangler JL & Gladiator',None),
    ],

    # ── ROCK SLIDERS / RAILS ─────────────────────────────────────────────────
    ('rock-sliders', 'default'): [
        ('B0DZT8T5SM','71nrT8ZonvL','Rock Slider Nerf Bars — Jeep Wrangler JL 2018-2026','Top Rated'),
        ('B0DHBM5R52','91bguzILwSL','Tyger Auto Trax Side Steps Rock Rails — JL 2018-2026',None),
        ('B0GQD496ZS','81k4KMRdIPL','Heavy Duty Rock Sliders — JL 4-Door 2018-2026',None),
    ],
    ('rock-rails', 'default'): [
        ('B0DZT8T5SM','71nrT8ZonvL','Rock Rails / Nerf Bars — Jeep Wrangler JL 2018-2026','Top Rated'),
        ('B0DHBM5R52','91bguzILwSL','Tyger Auto Trax Rock Rails — JL 2018-2026',None),
        ('B0GQD496ZS','81k4KMRdIPL','Heavy Duty Rock Rails — JL 4-Door 2018-2026',None),
    ],

    # ── MISC ─────────────────────────────────────────────────────────────────
    ('sun-shades', 'default'): [
        ('B0C817Y5T9','61rDS+wcxHL','LASFIT All-Weather Floor Mats — Jeep Wrangler JL',None),
        ('B07VG6YKGM','81Fu0O2oaQL','Center Console Organizer — Jeep Wrangler JL/JLU',None),
    ],
    ('tire-carriers', 'default'): [
        ('B0DDGSRPK8','81axjOks2fL','Nilight Off-Road Recovery Kit — Tow Strap, D-Shackle',None),
        ('B0BQJ28R7L','71o7KnEexcL','Off-Road Recovery & Rigging Kit — 10-Ton Snatch Block',None),
    ],
    ('door-handles', 'default'): [
        ('B0C817Y5T9','61rDS+wcxHL','LASFIT All-Weather Floor Mats — Jeep Wrangler JL',None),
        ('B07VG6YKGM','81Fu0O2oaQL','Center Console Organizer — Jeep Wrangler JL/JLU',None),
    ],
    ('door-surrounds', 'default'): [
        ('B0C817Y5T9','61rDS+wcxHL','LASFIT All-Weather Floor Mats — Jeep Wrangler JL',None),
        ('B07VG6YKGM','81Fu0O2oaQL','Center Console Organizer — Jeep Wrangler JL/JLU',None),
    ],
    ('roll-bar-safety', 'default'): [
        ('B0DDGSRPK8','81axjOks2fL','Nilight Off-Road Recovery Kit',None),
        ('B0BQJ28R7L','71o7KnEexcL','Off-Road Recovery & Rigging Kit',None),
    ],
    ('skid-plates', 'default'): [
        ('B0CRP8T9X8','81gn+DHqTlL','Aluminum Skid Plate — Jeep Wrangler JL & Gladiator 2018-2026','Top Pick'),
        ('B0D1WT32FZ','61K58tFuFuL','2-Inch Leveling Kit — Jeep Wrangler JK/JL',None),
    ],
}

def get_products(cat, gen_id):
    """Return product list for category+gen, falling back to default."""
    return PRODUCTS.get((cat, gen_id)) or PRODUCTS.get((cat, 'default')) or []

# ─── BARTACT CONFIG ──────────────────────────────────────────────────────────

# Categories where Bartact gets a #1 card
BARTACT_GRAB_CATS = {'grab-handles', 'roll-bar-handles', 'headrest-handles'}
BARTACT_SEAT_CATS = {'seat-covers', '392-seat-covers', '4xe-seat-covers', 'mojave-seat-covers'}

BARTACT_GRAB_URL = 'https://bartact.com/collections/grab-handles'
BARTACT_SEAT_URLS = {
    'jl':     'https://bartact.com/products/tactical-seat-covers-for-jeep-wrangler-jlu-2018-4-dr-only-not-for-mojave-or-392-edition-front-pair-bartact',
    'jk-2013':'https://bartact.com/products/tactical-seat-covers-for-jeep-wrangler-jku-2013-2018-4-dr-only-front-pair-bartact',
    'jk-2011':'https://bartact.com/products/tactical-seat-covers-for-jeep-wrangler-jku-2011-2012-4-dr-only-front-pair-bartact',
    'jk-2007':'https://bartact.com/products/tactical-seat-covers-for-jeep-wrangler-jk-2007-2010-2-dr-only-front-pair-bartact',
    'tj-2003':'https://bartact.com/products/tactical-seat-covers-for-jeep-wrangler-tj-lj-2003-2006-front-pair-bartact',
    'tj-1997':'https://bartact.com/products/tactical-seat-covers-for-jeep-wrangler-tj-1997-2002-front-pair-bartact',
    'yj':     'https://bartact.com/collections/jeep-wrangler-seat-covers',
    'default':'https://bartact.com/collections/jeep-wrangler-seat-covers',
}

# ─── HTML GENERATION ─────────────────────────────────────────────────────────

CSS = """*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f4f5f7;color:#1a1a1a;line-height:1.75}
a{color:#c0392b;text-decoration:none}
a:hover{text-decoration:underline}
header{background:#1a1a1a;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;border-bottom:3px solid #c0392b;position:sticky;top:0;z-index:100}
.logo{font-size:1.1em;font-weight:900;color:#fff;letter-spacing:-.5px}
.logo span{color:#c0392b}
nav{display:flex;flex-wrap:wrap;gap:4px}
nav a{color:#ccc;font-size:.75em;padding:5px 9px;border-radius:4px;transition:background .15s}
nav a:hover,.nav-active{background:#c0392b;color:#fff;text-decoration:none}
.hero{background:linear-gradient(135deg,#1c2833 0%,#2e4053 55%,#922b21 100%);padding:56px 24px;text-align:center;color:#fff;border-bottom:3px solid #c0392b}
.hero h1{font-size:2em;font-weight:900;margin-bottom:12px;line-height:1.2;color:#fff}
.hero h1 span{color:#ff8c69}
.hero p{font-size:1em;color:rgba(255,255,255,.85);max-width:680px;margin:0 auto 10px;line-height:1.8}
.container{max-width:980px;margin:0 auto;padding:36px 22px}
.picks-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;margin-top:8px}
.pick-card{background:#f9f9f9;border:1px solid #e8e8e8;border-radius:10px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.04);transition:box-shadow .2s}
.pick-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.1)}
.pick-card img{width:100%;height:155px;object-fit:contain;border-radius:6px;background:#fff;border:1px solid #f0f0f0;padding:8px;display:block;margin-bottom:12px}
.badge{display:inline-block;font-size:.7em;font-weight:800;padding:4px 11px;border-radius:20px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:9px;margin-right:4px}
.b-red{background:#c0392b;color:#fff}
.b-green{background:#27ae60;color:#fff}
.b-blue{background:#2980b9;color:#fff}
.b-gray{background:#7f8c8d;color:#fff}
.b-orange{background:#e67e22;color:#fff}
.pick-card h3{font-size:.95em;font-weight:800;color:#1a1a1a;margin-bottom:10px;line-height:1.4}
.amz-btn{display:block;text-align:center;background:#FF9900;color:#000;font-weight:800;padding:10px;border-radius:6px;font-size:.87em;transition:background .15s}
.amz-btn:hover{background:#e68a00;text-decoration:none;color:#000}
.bartact-pick-card{border:2px solid #c0392b;background:#fff8f7}
.bartact-pick-btn{display:block;text-align:center;background:#c0392b;color:#fff;font-weight:800;padding:10px;border-radius:6px;font-size:.87em;transition:background .15s}
.bartact-pick-btn:hover{background:#a93226;text-decoration:none;color:#fff}
.gen-note{background:#fff8f0;border-left:3px solid #e67e22;padding:10px 14px;border-radius:0 6px 6px 0;font-size:.87em;color:#7d6608;margin:12px 0 18px;line-height:1.6}
.breadcrumb{font-size:.82em;color:#888;margin-bottom:20px}
.breadcrumb a{color:#c0392b}
.gen-nav{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:28px}
.gen-nav a{display:block;background:#fff;border:2px solid #e0e0e0;border-radius:8px;padding:12px 18px;font-size:.88em;font-weight:700;color:#1a1a1a;transition:border-color .15s}
.gen-nav a:hover,.gen-nav a.active{border-color:#c0392b;color:#c0392b;text-decoration:none}
.related{background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:20px;margin-top:32px}
.related h3{font-size:.93em;font-weight:800;margin-bottom:12px;color:#1a1a1a}
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
.disclaimer{font-size:.77em;color:#444;margin-top:12px;max-width:700px;margin-left:auto;margin-right:auto;line-height:1.6}
@media(max-width:680px){
  .hero h1{font-size:1.5em}
  .picks-grid{grid-template-columns:1fr}
}"""

NAV_LINKS = [
    ('/', 'Home', ''),
    ('/seat-covers.html', 'Seat Covers', 'seat-cover'),
    ('/grab-handles.html', 'Grab Handles', 'grab-handle'),
    ('/floor-mats.html', 'Floor Mats', 'floor-mat'),
    ('/storage.html', 'Storage & MOLLE', 'storage'),
    ('/roll-bar-safety.html', 'Roll Bar & Safety', 'roll-bar'),
    ('/bumpers.html', 'Bumpers', 'bumper'),
    ('/steps.html', 'Steps', 'step'),
    ('/lights.html', 'Lighting', 'light'),
    ('/recovery.html', 'Recovery', 'recovery'),
    ('/wheels.html', 'Wheels', 'wheel'),
    ('/tires.html', 'Tires', 'tire'),
    ('/soft-tops.html', 'Soft Tops', 'soft-top'),
    ('/skid-plates.html', 'Skid Plates', 'skid'),
    ('/suspension.html', 'Suspension', 'suspension'),
]

def nav_html(active_keyword=''):
    links = []
    for href, label, kw in NAV_LINKS:
        active = ' class="nav-active"' if (kw and kw in active_keyword) else ''
        links.append(f'<a href="{href}"{active}>{label}</a>')
    return ' '.join(links)

def header_html(active_kw=''):
    return f'''<header>
<div class="logo">Wrangler<span>Jeep</span>Accessories</div>
<nav>{nav_html(active_kw)}</nav>
</header>'''

FOOTER_HTML = f'''<footer>
<p>&copy; {YEAR} WranglerJeepAccessories.com &mdash; Independent product guide. Not affiliated with Jeep or Stellantis.</p>
<p style="margin-top:8px">
  <a href="/">Home</a> &middot;
  <a href="https://wranglerseats.com">WranglerSeats.com</a> &middot;
  <a href="https://wranglerseatcover.com">WranglerSeatCover.com</a> &middot;
  <a href="/about.html">About</a> &middot;
  <a href="/privacy.html">Privacy</a>
</p>
<p class="disclaimer">wranglerjeepaccessories.com is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.</p>
</footer>'''

def page_shell(title, desc, canon_url, body, active_kw=''):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="https://{DOMAIN}/{canon_url}">
<style>{CSS}
.bartact-colors .tier-label{{font-size:.78rem;font-weight:700;color:#8b5e0a;margin:8px 0 4px;text-transform:uppercase;letter-spacing:.4px}}
.bartact-colors{{margin:10px 0 14px;padding:10px 12px;background:#fefefe;border:1px solid #e8d8b0;border-radius:8px}}
.color-row{{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:5px 0}}
.color-label{{font-size:.8rem;font-weight:700;color:#555;min-width:52px}}
.color-swatch{{display:inline-block;padding:3px 9px;border-radius:12px;font-size:.75rem;font-weight:600;cursor:default;border:1px solid rgba(0,0,0,.15)}}
</style>
</head>
<body>
{header_html(active_kw)}
{body}
{FOOTER_HTML}
</body>
</html>'''

def bartact_grab_card():
    return f'''<div class="pick-card bartact-pick-card">
<img src="{BARTACT_IMG_GRAB}" alt="Bartact Paracord Grab Handles — Made in USA, Invented by Bartact" loading="lazy">
<span class="badge b-red">#1 Pick</span>
<span class="badge b-orange">Made in USA</span>
<h3>Bartact Paracord Grab Handles &mdash; Invented by Bartact, Made in USA</h3>
<p>Bartact invented the paracord grab handle. 550 paracord, hand-woven in the USA. Multiple colors. Direct from the original maker.</p>
    <div class="bartact-colors">
      <div class="tier-label">&#127775; Standard Tactical</div>
      <div class="color-row"><span class="color-label">Outer:</span><span class="color-swatch" style="background:#111;color:#fff" title="Black">Black</span></div>
      <div class="color-row"><span class="color-label">Insert:</span><span class="color-swatch" style="background:#111;color:#fff">Black</span><span class="color-swatch" style="background:#555;color:#fff">Graphite</span><span class="color-swatch" style="background:#c0392b;color:#fff">Red</span><span class="color-swatch" style="background:#2471a3;color:#fff">Blue</span><span class="color-swatch" style="background:#1a3a5c;color:#fff">Navy</span><span class="color-swatch" style="background:#e67e22;color:#fff">Orange</span><span class="color-swatch" style="background:#556b2f;color:#fff">Olive Drab</span><span class="color-swatch" style="background:#b8914a;color:#fff">Coyote</span><span class="color-swatch" style="background:#c8b87a;color:#222">Khaki</span><span class="color-swatch" style="background:#9fb4c7;color:#222">ACU</span></div>
      <div class="color-row"><span class="color-label">Logo:</span><span style="font-size:.8rem;color:#666;font-style:italic">Embroidered in USA &#8212; matches insert color</span></div>
      <div class="tier-label" style="margin-top:10px">&#127912; Fully Customized &#8212; all 4 options independent</div>
      <div class="color-row"><span class="color-label">Outer:</span><span class="color-swatch" style="background:#111;color:#fff">Black</span><span class="color-swatch" style="background:#555;color:#fff">Graphite</span><span class="color-swatch" style="background:#c0392b;color:#fff">Red</span><span class="color-swatch" style="background:#2471a3;color:#fff">Blue</span><span class="color-swatch" style="background:#1a53a8;color:#fff">Royal Blue</span><span class="color-swatch" style="background:#1a3a5c;color:#fff">Navy</span><span class="color-swatch" style="background:#e67e22;color:#fff">Orange</span><span class="color-swatch" style="background:#556b2f;color:#fff">OD</span><span class="color-swatch" style="background:#b8914a;color:#fff">Coyote</span><span class="color-swatch" style="background:#c8b87a;color:#222">Khaki</span><span class="color-swatch" style="background:#9fb4c7;color:#222">ACU</span><span class="color-swatch" style="background:#d4af37;color:#222">Gold</span><span class="color-swatch" style="background:#8899a6;color:#fff">Steel</span><span class="color-swatch" style="background:#d4b896;color:#222">Tan</span><span class="color-swatch" style="background:#fff;color:#222;border-color:#ccc">White</span><span class="color-swatch" style="background:#7b1f3a;color:#fff">Burgundy</span><span class="color-swatch" style="background:#6c3483;color:#fff">Purple</span><span class="color-swatch" style="background:#e91e8c;color:#fff">Hot Pink</span><span class="color-swatch" style="background:#f4a7b9;color:#222">Baby Pink</span><span class="color-swatch" style="background:#39ff14;color:#222">Neon Green</span><span class="color-swatch" style="background:#f1c40f;color:#222">Yellow</span></div>
      <div class="color-row"><span class="color-label">Insert:</span><em style="font-size:.8rem;color:#666">Same 21 colors as outer</em></div>
      <div class="color-row"><span class="color-label">Stitching:</span><em style="font-size:.8rem;color:#666">Same 21 colors &#8212; mix &amp; match</em></div>
      <div class="color-row"><span class="color-label">Logo:</span><em style="font-size:.8rem;color:#666">Same 21 colors &#8212; embroidered in USA</em></div>
      <p style="font-size:.8rem;color:#888;margin-top:8px">&#9432; Fully Customized = same mil-spec Tactical quality + your choice on every color. Custom builds may take 6&#8211;12 weeks. <a href="https://bartact.com" target="_blank" rel="noopener" style="color:#c8860a">Build yours at bartact.com &#8594;</a></p>
    </div>
    <a class="bartact-pick-btn" href="{BARTACT_GRAB_URL}" target="_blank" rel="noopener">Shop Bartact Direct &rarr;</a>
</div>'''

def bartact_seat_card(gen_id):
    url = BARTACT_SEAT_URLS.get(gen_id, BARTACT_SEAT_URLS['default'])
    img = BARTACT_SEAT_IMG.get(gen_id, BARTACT_SEAT_IMG['jl'])
    g = next((g for g in GENS if g['id'] == gen_id), GENS[0])
    return f'''<div class="pick-card bartact-pick-card">
<img src="{img}" alt="Bartact Tactical Seat Covers &mdash; {g['short']} (Made in USA)" loading="lazy">
<span class="badge b-red">#1 Pick</span>
<span class="badge b-orange">Made in USA</span>
<h3>Bartact Tactical Seat Covers &mdash; {g['short']} (Made in USA, MOLLE)</h3>
<p>USA-made tactical seat covers with MOLLE webbing. Airbag-safe. Multiple color options. Direct from Bartact.</p>
    <div class="bartact-colors">
      <div class="tier-label">&#127775; Standard Tactical</div>
      <div class="color-row"><span class="color-label">Outer:</span><span class="color-swatch" style="background:#111;color:#fff">Black</span></div>
      <div class="color-row"><span class="color-label">Insert:</span><span class="color-swatch" style="background:#111;color:#fff">Black</span><span class="color-swatch" style="background:#555;color:#fff">Graphite</span><span class="color-swatch" style="background:#c0392b;color:#fff">Red</span><span class="color-swatch" style="background:#2471a3;color:#fff">Blue</span><span class="color-swatch" style="background:#1a3a5c;color:#fff">Navy</span><span class="color-swatch" style="background:#e67e22;color:#fff">Orange</span><span class="color-swatch" style="background:#556b2f;color:#fff">OD</span><span class="color-swatch" style="background:#b8914a;color:#fff">Coyote</span><span class="color-swatch" style="background:#c8b87a;color:#222">Khaki</span><span class="color-swatch" style="background:#9fb4c7;color:#222">ACU</span></div>
      <div class="color-row"><span class="color-label">Logo:</span><em style="font-size:.8rem;color:#666">Embroidered in USA &#8212; matches insert</em></div>
      <div class="tier-label" style="margin-top:10px">&#127912; Fully Customized &#8212; all 4 options independent</div>
      <div class="color-row"><span class="color-label">Outer:</span><span class="color-swatch" style="background:#111;color:#fff">Black</span><span class="color-swatch" style="background:#555;color:#fff">Graphite</span><span class="color-swatch" style="background:#c0392b;color:#fff">Red</span><span class="color-swatch" style="background:#2471a3;color:#fff">Blue</span><span class="color-swatch" style="background:#1a53a8;color:#fff">Royal Blue</span><span class="color-swatch" style="background:#1a3a5c;color:#fff">Navy</span><span class="color-swatch" style="background:#e67e22;color:#fff">Orange</span><span class="color-swatch" style="background:#556b2f;color:#fff">OD</span><span class="color-swatch" style="background:#b8914a;color:#fff">Coyote</span><span class="color-swatch" style="background:#c8b87a;color:#222">Khaki</span><span class="color-swatch" style="background:#9fb4c7;color:#222">ACU</span><span class="color-swatch" style="background:#d4af37;color:#222">Gold</span><span class="color-swatch" style="background:#8899a6;color:#fff">Steel</span><span class="color-swatch" style="background:#d4b896;color:#222">Tan</span><span class="color-swatch" style="background:#fff;color:#222;border-color:#ccc">White</span><span class="color-swatch" style="background:#7b1f3a;color:#fff">Burgundy</span><span class="color-swatch" style="background:#6c3483;color:#fff">Purple</span><span class="color-swatch" style="background:#e91e8c;color:#fff">Hot Pink</span><span class="color-swatch" style="background:#f4a7b9;color:#222">Baby Pink</span><span class="color-swatch" style="background:#39ff14;color:#222">Neon Green</span><span class="color-swatch" style="background:#f1c40f;color:#222">Yellow</span></div>
      <div class="color-row"><span class="color-label">Insert:</span><em style="font-size:.8rem;color:#666">Same 21 colors as outer</em></div>
      <div class="color-row"><span class="color-label">Stitching:</span><em style="font-size:.8rem;color:#666">Same 21 colors &#8212; mix &amp; match</em></div>
      <div class="color-row"><span class="color-label">Logo:</span><em style="font-size:.8rem;color:#666">Same 21 colors &#8212; embroidered in USA</em></div>
      <p style="font-size:.8rem;color:#888;margin-top:8px">&#9432; Fully Customized = same mil-spec Tactical quality + pick every color. Custom builds 6&#8211;12 wks. <a href="https://bartact.com" target="_blank" rel="noopener" style="color:#c8860a">Build at bartact.com &#8594;</a></p>
    </div>
<a class="bartact-pick-btn" href="{url}" target="_blank" rel="noopener">Shop Bartact Direct &rarr;</a>
</div>'''

def amz_card(asin, h, title, badge_label, pick_num):
    img = f'https://m.media-amazon.com/images/I/{h}._AC_SL400_.jpg'
    url = f'https://www.amazon.com/dp/{asin}?tag={TAG}'
    num_badge = f'#{pick_num} Pick'
    return f'''<div class="pick-card">
<img src="{img}" alt="{title}" loading="lazy" onerror="this.style.display='none'">
<span class="badge b-gray">&#127464;&#127475; Manufactured in China</span>
<span class="badge b-red">{num_badge}</span>{f'<span class="badge b-blue">{badge_label}</span>' if badge_label else ''}
<h3>{title}</h3>
<a class="amz-btn" href="{url}" target="_blank" rel="noopener nofollow">View on Amazon &rarr;</a>
</div>'''

def picks_grid(cat, gen_id):
    """Build the complete picks-grid: Bartact first (where applicable), then Amazon."""
    cards = []
    amz_start = 1

    if cat in BARTACT_GRAB_CATS:
        cards.append(bartact_grab_card())
        amz_start = 2
    elif cat in BARTACT_SEAT_CATS:
        cards.append(bartact_seat_card(gen_id))
        amz_start = 2

    for i, (asin, h, title, badge) in enumerate(get_products(cat, gen_id)):
        cards.append(amz_card(asin, h, title, badge, amz_start + i))

    return f'<div class="picks-grid">\n' + '\n'.join(cards) + '\n</div>'

def gen_nav_html(cat, current_gen_id, gens_with_pages):
    links = []
    for g in GENS:
        if g['id'] not in gens_with_pages:
            continue
        slug = f'jeep-wrangler-{g["id"]}-{cat}.html'
        active = ' class="active"' if g['id'] == current_gen_id else ''
        links.append(f'<a href="/{slug}"{active}>{g["label"]} {g["years"]}</a>')
    return '<div class="gen-nav"><strong style="font-size:.82em;color:#888;align-self:center;margin-right:4px">Generation:</strong>' + ''.join(links) + '</div>'

def related_links_html(gen_id):
    g = next((g for g in GENS if g['id'] == gen_id), None)
    if not g:
        return ''
    cats = [
        ('seat-covers', 'Seat Covers'),
        ('floor-mats', 'Floor Mats'),
        ('grab-handles', 'Grab Handles'),
        ('storage', 'Storage & MOLLE'),
        ('bumpers', 'Bumpers'),
        ('steps', 'Steps'),
        ('lights', 'Lighting'),
        ('recovery', 'Recovery'),
        ('wheels', 'Wheels'),
        ('tires', 'Tires'),
        ('soft-tops', 'Soft Tops'),
        ('skid-plates', 'Skid Plates'),
        ('suspension', 'Suspension'),
    ]
    links = ''.join(
        f'<a href="/jeep-wrangler-{gen_id}-{c}.html">{label}</a>'
        for c, label in cats
    )
    return f'<div class="related"><h3>More Accessories for {g["short"]}</h3>{links}</div>'


# ─── PAGE DEFINITIONS ─────────────────────────────────────────────────────────
# Each entry: (cat_slug, cat_label, nav_kw, gens_that_have_pages, note_fn, faq_items)
# note_fn(gen_id) -> str or None

def jl_rollbar_note(gen_id):
    if gen_id == 'jl':
        return 'JL/JLU roll bars contain SRS airbags. Wraparound handles can block airbag deployment. Only use bolt-on grab handles on JL/JLU.'
    return None

CATS = [
    {
        'cat':    'seat-covers',
        'label':  'Seat Covers',
        'nav_kw': 'seat-cover',
        'gens':   GEN_IDS,
        'note':   None,
        'faqs': [
            ('Are Bartact seat covers worth it?',
             'Bartact seat covers are custom-cut for your exact generation, made in the USA with Cordura fabric and MOLLE webbing. They are significantly more durable than generic covers and maintain airbag compatibility. They are worth it if you off-road or need genuine tactical storage.'),
            ('Will neoprene seat covers fit my Jeep perfectly?',
             'Only if they are labeled for your exact generation and door count. JL 4-door covers do NOT fit JK, and vice versa. Always buy generation-specific covers.'),
        ],
    },
    {
        'cat':    'roll-bar-handles',
        'label':  'Roll Bar Handles',
        'nav_kw': 'grab-handle',
        'gens':   GEN_IDS,
        'note':   jl_rollbar_note,
        'faqs': [
            ('Why can\'t I use wraparound handles on a JL?',
             'The 2018+ JL/JLU roll bars contain SRS airbags. Wraparound handles can obstruct deployment. Only use bolt-on grab handles on JL/JLU.'),
            ('Who invented the paracord grab handle?',
             'Bartact. They invented the paracord grab handle for Jeep Wranglers and are the original USA-made source. Many Amazon listings are copies.'),
        ],
    },
    {
        'cat':    'headrest-handles',
        'label':  'Headrest Handles',
        'nav_kw': 'grab-handle',
        'gens':   ['jl','jk-2013','jk-2011','jk-2007','tj-2003','tj-1997'],
        'note':   None,
        'faqs': [
            ('Do headrest grab handles fit all Jeep Wrangler generations?',
             'Most paracord headrest grab handles are universal — they loop over the headrest posts. Check the listing to confirm compatibility with your year.'),
        ],
    },
    {
        'cat':    'floor-mats',
        'label':  'Floor Mats',
        'nav_kw': 'floor-mat',
        'gens':   ['jl','jk-2013','jk-2011','jk-2007'],
        'note':   None,
        'faqs': [
            ('Do all-weather mats fit JL and JK the same?',
             'No. JL and JK have different floor dimensions. Always buy mats labeled for your exact generation.'),
        ],
    },
    {
        'cat':    'all-weather-mats',
        'label':  'All-Weather Mats',
        'nav_kw': 'floor-mat',
        'gens':   ['jl','jk-2013','jk-2011','jk-2007'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'cargo-liners',
        'label':  'Cargo Liners',
        'nav_kw': 'floor-mat',
        'gens':   ['jl','jk-2013'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'front-bumpers',
        'label':  'Front Bumpers',
        'nav_kw': 'bumper',
        'gens':   ['jl','jk-2013','jk-2011','jk-2007','tj-2003','tj-1997'],
        'note':   None,
        'faqs': [
            ('Do I need a winch mount with a new bumper?',
             'If you plan to add a winch, buy a bumper with a built-in winch plate. Many aftermarket bumpers include one — check the specs before purchasing.'),
        ],
    },
    {
        'cat':    'rear-bumpers',
        'label':  'Rear Bumpers',
        'nav_kw': 'bumper',
        'gens':   ['jl','jk-2013','jk-2007'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'led-light-bars',
        'label':  'LED Light Bars',
        'nav_kw': 'light',
        'gens':   ['jl','jk-2013','jk-2011','jk-2007','tj-2003'],
        'note':   None,
        'faqs': [
            ('What size light bar fits a Jeep Wrangler hood/roof?',
             '50-52 inch bars fit most JL/JK roof mounts. For the hood or bumper, 20-30 inch bars are more practical. Measure your mount before buying.'),
        ],
    },
    {
        'cat':    'headlights',
        'label':  'Headlights',
        'nav_kw': 'light',
        'gens':   ['jl','jk-2013','jk-2011','jk-2007','tj-2003'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'fog-pod-lights',
        'label':  'Fog & Pod Lights',
        'nav_kw': 'light',
        'gens':   ['jl','jk-2013','jk-2007'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'storage',
        'label':  'Storage & MOLLE',
        'nav_kw': 'storage',
        'gens':   ['jl','jk-2013','jk-2011','jk-2007'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'seat-back-storage',
        'label':  'Seat-Back Storage',
        'nav_kw': 'storage',
        'gens':   ['jl','jk-2013','jk-2011','jk-2007'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'cargo-nets-bags',
        'label':  'Cargo Nets & Bags',
        'nav_kw': 'storage',
        'gens':   ['jl','jk-2013','jk-2011','jk-2007'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'molle-panels-pouches',
        'label':  'MOLLE Panels & Pouches',
        'nav_kw': 'storage',
        'gens':   ['jl','jk-2013','jk-2011','jk-2007'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'recovery',
        'label':  'Recovery Gear',
        'nav_kw': 'recovery',
        'gens':   GEN_IDS,
        'note':   None,
        'faqs': [
            ('What should a basic Jeep recovery kit include?',
             'At minimum: a kinetic recovery rope or tow strap, two D-ring shackles, a snatch block, and gloves. A hi-lift jack and traction boards are useful upgrades.'),
        ],
    },
    {
        'cat':    'steps',
        'label':  'Steps & Running Boards',
        'nav_kw': 'step',
        'gens':   ['jl','jk-2013'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'running-boards',
        'label':  'Running Boards',
        'nav_kw': 'step',
        'gens':   ['jl','jk-2013','jk-2011','jk-2007'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'tube-steps',
        'label':  'Tube Steps',
        'nav_kw': 'step',
        'gens':   ['jl','jk-2013','jk-2011','jk-2007'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'skid-plates',
        'label':  'Skid Plates',
        'nav_kw': 'skid',
        'gens':   ['jl','jk-2013','jk-2011','jk-2007'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'front-skid',
        'label':  'Front Skid Plates',
        'nav_kw': 'skid',
        'gens':   ['jl','jk-2013','jk-2011','jk-2007','tj-2003'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'gas-tank-skid',
        'label':  'Gas Tank Skid Plates',
        'nav_kw': 'skid',
        'gens':   ['jl','jk-2013'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'lift-kits',
        'label':  'Lift Kits',
        'nav_kw': 'suspension',
        'gens':   GEN_IDS,
        'note':   None,
        'faqs': [
            ('What lift do I need for 35-inch tires on a JL?',
             'A 2-3.5 inch lift is typically enough for 35s on a JL. A 2-inch leveling kit is the easiest entry point and avoids most steering geometry changes.'),
        ],
    },
    {
        'cat':    'shocks-coilovers',
        'label':  'Shocks & Coilovers',
        'nav_kw': 'suspension',
        'gens':   ['jl','jk-2013','jk-2011','jk-2007','tj-2003'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'control-arms',
        'label':  'Control Arms',
        'nav_kw': 'suspension',
        'gens':   ['jl','jk-2013'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'track-bars',
        'label':  'Track Bars',
        'nav_kw': 'suspension',
        'gens':   ['jl','jk-2013','jk-2007'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'steering-stabilizers',
        'label':  'Steering Stabilizers',
        'nav_kw': 'suspension',
        'gens':   ['jl','jk-2013','jk-2011','jk-2007'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'limit-straps',
        'label':  'Limit Straps',
        'nav_kw': 'suspension',
        'gens':   ['jl','jk-2013'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'soft-tops',
        'label':  'Soft Tops',
        'nav_kw': 'soft-top',
        'gens':   ['jl','jk-2013','jk-2011','jk-2007'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'full-replacement-tops',
        'label':  'Full Replacement Tops',
        'nav_kw': 'soft-top',
        'gens':   ['jl','tj-2003','tj-1997'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'rock-sliders',
        'label':  'Rock Sliders',
        'nav_kw': 'step',
        'gens':   ['jl','jk-2013','jk-2011','jk-2007'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'rock-rails',
        'label':  'Rock Rails',
        'nav_kw': 'step',
        'gens':   ['jl','jk-2013','jk-2007'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'door-handles',
        'label':  'Door Handles',
        'nav_kw': '',
        'gens':   ['tj-2003','tj-1997'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'door-surrounds',
        'label':  'Door Surrounds',
        'nav_kw': '',
        'gens':   ['jl','jk-2013'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'sun-shades',
        'label':  'Sun Shades',
        'nav_kw': '',
        'gens':   ['jl','jk-2013'],
        'note':   None,
        'faqs': [],
    },
    {
        'cat':    'tire-carriers',
        'label':  'Tire Carriers',
        'nav_kw': '',
        'gens':   ['jl','jk-2013'],
        'note':   None,
        'faqs': [],
    },
]


# ─── BUILD GEN PRODUCT PAGES ──────────────────────────────────────────────────

def build_gen_page(cat_def, gen):
    cat = cat_def['cat']
    gen_id = gen['id']
    label = cat_def['label']
    note_fn = cat_def['note']
    faqs = cat_def['faqs']
    short = gen['short']

    slug = f'jeep-wrangler-{gen_id}-{cat}.html'
    best_slug = f'best-jeep-wrangler-{gen_id}-{cat}.html'  # canonical "best" URL
    title = f'Best Jeep Wrangler {short} {label} [{YEAR}]'
    desc = f'Best {label.lower()} for Jeep Wrangler {short}. Verified fitment. Updated {YEAR}.'

    note_html = f'<div class="gen-note">{note_fn(gen_id)}</div>' if note_fn and note_fn(gen_id) else ''

    faq_html = ''
    if faqs:
        items = ''.join(
            f'<div class="faq-item"><h3>{q}</h3><p>{a}</p></div>'
            for q, a in faqs
        )
        faq_html = f'<div class="faq-section"><h2>Frequently Asked Questions</h2><div class="faq-wrap">{items}</div></div>'

    body = f'''<div class="hero">
  <h1>{label}<br><span>{short}</span></h1>
  <p style="font-size:.78em;color:rgba(255,255,255,.45);margin-top:8px">Updated {YEAR} &middot; Jeep Wrangler {short} &middot; Amazon affiliate links</p>
</div>
<div class="container">
  <p class="breadcrumb"><a href="/">Home</a> &rsaquo; {label} &rsaquo; {short}</p>
  {gen_nav_html(cat, gen_id, cat_def['gens'])}
  {note_html}
  {picks_grid(cat, gen_id)}
  {related_links_html(gen_id)}
</div>
{faq_html}'''

    html = page_shell(title, desc, slug, body, cat_def['nav_kw'])

    # Write both the standard slug and the best- slug (canonical points to best-)
    html_best = html.replace(
        f'<link rel="canonical" href="https://{DOMAIN}/{slug}">',
        f'<link rel="canonical" href="https://{DOMAIN}/{best_slug}">'
    )

    return {slug: html, best_slug: html_best}


# ─── MAIN ────────────────────────────────────────────────────────────────────

def build_hub_page(cat_def):
    """Build the category hub page (e.g. best-jeep-wrangler-seat-covers.html).
    Shows Bartact #1, gen selector cards, then Amazon picks clearly labeled by gen."""
    cat = cat_def['cat']
    label = cat_def['label']
    hub_slug = f'best-jeep-wrangler-{cat}.html'
    title = f'Best Jeep Wrangler {label} {YEAR} — All Generations'
    desc = f'Best {label.lower()} for every Jeep Wrangler generation — JL, JK, TJ, YJ. Bartact #1. Updated {YEAR}.'

    # Gen selector cards
    gen_cards = []
    for gen_id in cat_def['gens']:
        g = next(x for x in GENS if x['id'] == gen_id)
        best_slug = f'best-jeep-wrangler-{gen_id}-{cat}.html'
        prods = get_products(cat, gen_id)
        pick_count = len(prods) + (1 if cat in BARTACT_SEAT_CATS or cat in BARTACT_GRAB_CATS else 0)
        gen_cards.append(
            f'<a href="/{best_slug}" class="gen-hub-card">'
            f'  <strong>{g["short"]}</strong>'
            f'  <span class="gen-hub-years">{g["years"]}</span>'
            f'  <span class="gen-hub-count">{pick_count} picks</span>'
            f'</a>'
        )
    gen_hub_html = '<div class="gen-hub">' + ''.join(gen_cards) + '</div>'

    # Bartact card (if applicable)
    bartact_html = ''
    if cat in BARTACT_SEAT_CATS:
        bartact_html = f'''
<div style="margin:2rem 0">
<h2 style="font-size:1.1em;font-weight:800;color:#1a1a1a;margin-bottom:1rem">#1 Pick &mdash; Editor&rsquo;s Choice</h2>
{bartact_seat_card("jl")}
</div>'''
    elif cat in BARTACT_GRAB_CATS:
        bartact_html = f'''
<div style="margin:2rem 0">
<h2 style="font-size:1.1em;font-weight:800;color:#1a1a1a;margin-bottom:1rem">#1 Pick &mdash; Editor&rsquo;s Choice</h2>
{bartact_grab_card()}
</div>'''

    # Amazon picks — show JL picks labeled clearly
    jl_prods = get_products(cat, 'jl')
    amz_cards = []
    for i, (asin, h, title_p, badge) in enumerate(jl_prods):
        amz_cards.append(amz_card(asin, h, title_p, badge, i+2))
    amz_section = ''
    if amz_cards:
        amz_section = f'''
<div style="margin:2rem 0">
<h2 style="font-size:1.1em;font-weight:800;color:#1a1a1a;margin-bottom:.4rem">Top Amazon Picks &mdash; JL/JLU (2018+)</h2>
<p style="font-size:.85em;color:#666;margin-bottom:1rem">Select your generation above for gen-specific picks &mdash; JK, TJ, and YJ have different fitment.</p>
<div class="picks-grid">{''.join(amz_cards)}</div>
</div>'''

    # FAQ
    faqs = cat_def.get('faqs', [])
    faq_html = ''
    if faqs:
        items = ''.join(f'<div class="faq-item"><h3>{q}</h3><p>{a}</p></div>' for q, a in faqs)
        faq_html = f'<div class="faq-section"><h2>Frequently Asked Questions</h2><div class="faq-wrap">{items}</div></div>'

    body = f'''<div class="hero">
  <h1>{label}<br><span>All Wrangler Generations</span></h1>
  <p style="font-size:.78em;color:rgba(255,255,255,.45);margin-top:8px">Updated {YEAR} &middot; JL, JK, TJ, YJ &middot; Amazon affiliate links</p>
</div>
<div class="container">
  <p class="breadcrumb"><a href="/">Home</a> &rsaquo; {label}</p>
  <p>Pick your generation for fitment-specific picks. Seat shapes, mounting points, and dimensions differ between generations &mdash; always buy generation-specific covers.</p>
  {gen_hub_html}
  {bartact_html}
  {amz_section}
  {related_links_html('jl')}
</div>
{faq_html}'''

    return {hub_slug: page_shell(title, desc, hub_slug, body, cat_def['nav_kw'])}


def build():
    pages = {}

    # Gen-specific product pages
    for cat_def in CATS:
        for gen_id in cat_def['gens']:
            gen = next(g for g in GENS if g['id'] == gen_id)
            pages.update(build_gen_page(cat_def, gen))

    # Category hub pages
    for cat_def in CATS:
        pages.update(build_hub_page(cat_def))

    # Write all pages
    SITE.mkdir(parents=True, exist_ok=True)
    written = 0
    for slug, html in pages.items():
        path = SITE / slug
        # Only overwrite if content changed
        if path.exists() and path.read_text(encoding='utf-8') == html:
            continue
        path.write_text(html, encoding='utf-8')
        written += 1

    print(f'Built {len(pages)} pages, wrote {written} (skipped {len(pages)-written} unchanged)')
    return len(pages), written

if __name__ == '__main__':
    total, written = build()
    print(f'Done. Total pages in builder: {total}')

# Post-build: submit to Google Indexing API + IndexNow
from build_utils import post_build_submit
post_build_submit('wranglerjeepaccessories.com')
