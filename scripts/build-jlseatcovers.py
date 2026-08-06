#!/usr/bin/env python3
"""
Canonical builder for jlseatcovers.com
Single source of truth — edit this, run it, push. Never patch HTML directly.

All image hashes CDN-verified 200 OK.
NO prices (Associates ToS violation).
NO mil-spec claims on Bartact.
Bartact links = non-affiliate direct to bartact.com.
"""

import os
from pathlib import Path

SITE_DIR = Path('/home/ubuntu/.openclaw/workspace/sites/jlseatcovers.com')
SITE_URL = 'https://jlseatcovers.com'
TAG = 'brazenprodu01-20'
BARTACT_IMG = 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jlu-2018-22-4-door-only-not-for-mojave-or-392-edition-bartact-w-molle-290.jpg?v=1762457338'

# =============================================================================
# PRODUCT DATA — all hashes CDN-verified 200 OK
# Format: (asin, hash, vendor, name, desc, page_tags[])
# page_tags: which subpages this product appears on
# =============================================================================
PRODUCTS = [
    (
        'B07LDLK1VH', '51+J4RGJhKL', 'Smittybilt',
        'Gen2 Neoprene Full Set &mdash; Jeep Wrangler JL/JLU (2018&ndash;2026)',
        'Custom-fit neoprene for the JL/JLU. Waterproof, airbag-compatible seams. '
        'Smittybilt separates JL from JK patterns &mdash; front and rear set included.',
        ['jl-2door', 'jlu-4door', 'jl-2024-plus'],
    ),
    (
        'B0CWXZY4R5', '41IdDJxIb8L', 'FREESOO',
        'Custom Seat Covers Full Set &mdash; Jeep Wrangler JL/JLU (2018&ndash;2026)',
        'Budget custom-fit full set for JL and JLU. Polyester with leatherette accents. '
        'Fits Rubicon, Sahara, Sport, and Willys. Does not include rear cup holder cutout.',
        ['jl-2door', 'jlu-4door'],
    ),
    (
        'B0FJRPJK63', '71A4J9Ma1hL', 'Huidasource',
        'Front Seat Covers with Console Cover &mdash; Jeep Wrangler JL/JLU (2018&ndash;2026)',
        'Front-only covers for any JL or JLU including Rubicon and 392. '
        'Front seats are identical across 2-door and 4-door. Includes center console cover.',
        ['jl-2door', 'jlu-4door', 'jl-mojave-392'],
    ),
    (
        'B0DRPBNTZV', '71BUARmS7ML', 'RIDEPOSH',
        'Waterproof Faux Leather Full Set &mdash; Jeep Wrangler JLU 4-Door (2018&ndash;2026)',
        'Waterproof faux leather full set for JLU 4-door. Wipe-clean surface. '
        'Good for daily drivers who want a cleaner look with water resistance.',
        ['jlu-4door', 'jlu-4xe'],
    ),
    (
        'B0BJ1GNMTP', '71vnruACsqL', 'GIANT PANDA',
        'Faux Leather Seat Covers &mdash; Jeep Wrangler JL/JLU (2018&ndash;2026)',
        'Vehicle-specific faux leather. Not a universal cover &mdash; GIANT PANDA cuts per vehicle. '
        'Available in multiple colors. Good for dog owners and daily drivers.',
        ['jlu-4door', 'jlu-4xe', 'jl-2door'],
    ),
    (
        'B0BRMLQT13', '717JHSym7qL', 'GOLYWIN',
        'Custom Leatherette Seat Covers &mdash; Jeep Wrangler JL/JLU (2018&ndash;2026)',
        'Custom-fit leatherette for JL and JLU. Easy wipe-down surface, good water resistance. '
        'Best for daily driver and light trail use where looks matter.',
        ['jl-2door', 'jlu-4door', 'jl-2024-plus'],
    ),
    (
        'B0D3F1ZKZ2', '71TBS6KMmiL', 'Aierxuan',
        'Custom Seat Covers Full Set &mdash; Jeep Wrangler JL/JLU (2018&ndash;2026)',
        'Top-selling brand for Jeep interior covers. Custom JL/JLU pattern, airbag-compatible seams. '
        'Multiple color options. Good all-around value.',
        ['jl-2door', 'jlu-4door', 'jl-2024-plus', 'jlu-4xe'],
    ),
    (
        'B09HZFK22H', '81IoJgOxjnL', 'Aierxuan',
        'Tactical Edition Seat Covers &mdash; Jeep Wrangler JL/JLU (2018&ndash;2026)',
        'Tactical-style covers with side pocket design from Aierxuan. Full set, airbag-compatible. '
        'Good mid-range option for the tactical look without the Bartact price.',
        ['jl-2door', 'jlu-4door', 'jl-mojave-392'],
    ),
]

# =============================================================================
# BARTACT DATA per page
# =============================================================================
BARTACT = {
    'jl-2door': {
        'name': 'Bartact Tactical Seat Covers &mdash; Jeep Wrangler JL 2-Door (2018&ndash;Present)',
        'url': 'https://bartact.com/collections/jeep-wrangler-jl-seat-covers',
        'badge': '#1 Pick &mdash; Editor\'s Choice',
        'bullets': [
            'Custom-cut for the JL 2-door &mdash; not a universal pattern',
            'Separate SKU for 2-door rear bench (different from JLU rear)',
            'Heavy-duty Cordura fabric throughout',
            'Full MOLLE grid on seat backs for gear and organizers',
            'Airbag-safe stitching for JL side airbags',
            'Made in the USA',
        ],
        'blurb': 'The only seat cover on the market custom-cut for every JL configuration. '
                 '2-door rear covers are sized correctly for the shorter bench &mdash; '
                 'not a recycled JLU pattern. Cordura fabric, MOLLE panels, airbag-safe, USA-made.',
    },
    'jlu-4door': {
        'name': 'Bartact Tactical Seat Covers &mdash; Jeep Wrangler JLU 4-Door (2018&ndash;Present)',
        'url': 'https://bartact.com/collections/jeep-wrangler-jl-seat-covers',
        'badge': '#1 Pick &mdash; Editor\'s Choice',
        'bullets': [
            'Custom-cut for the JLU 4-door &mdash; separate SKU for 4-door rear bench',
            'Heavy-duty Cordura fabric throughout',
            'Full MOLLE grid on all seat backs',
            'Airbag-safe stitching for JLU side airbags',
            'Made in the USA',
        ],
        'blurb': 'JLU-specific SKU with correctly-sized rear bench covers for the 4-door footprint. '
                 'Cordura fabric, MOLLE panels, airbag-safe, USA-made. '
                 'Nothing else at any price point combines this fitment accuracy with this build quality.',
    },
    'jl-2024-plus': {
        'name': 'Bartact Tactical Seat Covers &mdash; Jeep Wrangler JL/JLU 2024+ (Power Seats)',
        'url': 'https://bartact.com/collections/jeep-wrangler-jl-seat-covers',
        'badge': '#1 Pick &mdash; 2024+ Confirmed',
        'bullets': [
            '2024+ specific SKU &mdash; accounts for revised seat back geometry',
            'Confirmed compatible with power/electric seat option (2024+)',
            'Heavy-duty Cordura fabric',
            'MOLLE panels on seat backs',
            'Airbag-safe, Made in the USA',
        ],
        'blurb': 'Bartact has updated SKUs for 2024+ JL/JLU models. '
                 'If your Wrangler has power seat adjustment controls on the side bolster, '
                 'select the 2024+ option at checkout. Same Cordura quality, MOLLE panels, USA-made.',
    },
    'jl-mojave-392': {
        'name': 'Bartact Tactical Seat Covers &mdash; Jeep Wrangler Mojave / 392 Edition',
        'url': 'https://bartact.com/collections/jeep-wrangler-jl-seat-covers',
        'badge': '#1 Pick &mdash; Only Confirmed Mojave/392 Fit',
        'bullets': [
            'Mojave/392-specific SKU &mdash; addresses unique front seat geometry',
            'The only brand that makes a dedicated Mojave and 392 cover',
            'Heavy-duty Cordura fabric',
            'MOLLE panels, airbag-safe, Made in the USA',
        ],
        'blurb': 'Most seat covers explicitly exclude the Mojave and 392 editions. '
                 'Bartact makes a dedicated SKU that fits these trims correctly. '
                 'If you own a Mojave or 392, Bartact is the safe choice &mdash; confirm at checkout.',
    },
    'jlu-4xe': {
        'name': 'Bartact Tactical Seat Covers &mdash; Jeep Wrangler JLU 4XE (2021&ndash;Present)',
        'url': 'https://bartact.com/collections/jeep-wrangler-jl-seat-covers',
        'badge': '#1 Pick &mdash; Only Correct 4XE Fit',
        'bullets': [
            '4XE-specific SKU &mdash; accounts for unique rear bench geometry',
            'The only cover custom-cut for the 4XE rear bench',
            'Heavy-duty Cordura fabric',
            'MOLLE panels, airbag-safe, Made in the USA',
        ],
        'blurb': 'The JLU 4XE has a unique rear bench not shared with the standard JLU. '
                 'Bartact is the only manufacturer with a confirmed 4XE-specific SKU. '
                 'Select "4XE" explicitly at checkout on bartact.com.',
    },
}

# =============================================================================
# PAGE DEFINITIONS
# =============================================================================
PAGES = [
    {
        'slug': 'jl-2door',
        'file': 'jl-2door.html',
        'title': 'Jeep Wrangler JL 2-Door Seat Covers (2018&ndash;Present)',
        'meta_title': 'Best Jeep Wrangler JL 2-Door Seat Covers 2026 | JLSeatCovers.com',
        'meta_desc': 'Custom-fit seat covers for the Jeep Wrangler JL 2-door (2018+). '
                     'Bartact #1. Fitment notes, brand comparison, 6 verified picks.',
        'h1': 'Jeep Wrangler JL 2-Door Seat Covers (2018&ndash;Present)',
        'hero_sub': "The JL 2-door has front bucket seats and a shorter rear bench than the JLU. "
                    "Don't order JLU rear covers by mistake &mdash; the dimensions are different.",
        'intro': """<p>The JL 2-door and JLU 4-door share identical front seats. Rear seat covers are
different &mdash; the 2-door rear bench is shorter and configured differently than the 4-door.
Front-only covers are interchangeable between body styles.</p>
<p>Two other things to get right before ordering: if you have a 2024+ Wrangler with power seat
controls on the side bolster, <a href="/jl-2024-plus.html">see the 2024+ page</a>.
If you have a Mojave or 392 edition, <a href="/jl-mojave-392.html">see the Mojave/392 page</a>
&mdash; most generic covers explicitly exclude those trims.</p>""",
        'fitment_notes': [
            'Front bucket seats are identical to JLU &mdash; front covers are interchangeable',
            'Rear bench is shorter than JLU &mdash; always specify 2-door for rear covers',
            '2024+ models: check for power seat controls on side bolster before ordering',
            'Mojave and 392 editions have different front seats &mdash; see the Mojave/392 page',
            'Rubicon trim: some covers are tighter around the side bolster &mdash; read reviews',
        ],
    },
    {
        'slug': 'jlu-4door',
        'file': 'jlu-4door.html',
        'title': 'Jeep Wrangler JLU 4-Door Seat Covers (2018&ndash;Present)',
        'meta_title': 'Best Jeep Wrangler JLU 4-Door Seat Covers 2026 | JLSeatCovers.com',
        'meta_desc': 'Custom-fit seat covers for the Jeep Wrangler JLU 4-door (2018+). '
                     'Bartact #1. 8 verified picks, fitment table, brand comparison.',
        'h1': 'Jeep Wrangler JLU 4-Door Seat Covers (2018&ndash;Present)',
        'hero_sub': "The JLU 4-door is the most popular Wrangler config. "
                    "Front covers are shared with the JL 2-door &mdash; rear covers are JLU-specific.",
        'intro': """<p>The JLU has the same front bucket seats as the JL 2-door.
Rear bench covers are specific to the 4-door &mdash; longer and shaped differently than the 2-door rear.
Always order covers labeled "JLU 4-door" for the rear bench.</p>
<p>If you have a 4XE, <a href="/jlu-4xe.html">see the 4XE page</a> &mdash; the rear bench geometry
differs from the standard JLU. 2024+ power seat owners should check the
<a href="/jl-2024-plus.html">2024+ page</a>.</p>""",
        'fitment_notes': [
            'Front seats are identical to JL 2-door &mdash; front covers are interchangeable',
            'Rear bench is longer than JL 2-door &mdash; always order JLU 4-door specific rear covers',
            '4XE has a different rear bench &mdash; see the 4XE page',
            '2024+ power seat option: verify compatibility before ordering',
            'Mojave and 392 have different front seats &mdash; see Mojave/392 page',
        ],
    },
    {
        'slug': 'jl-2024-plus',
        'file': 'jl-2024-plus.html',
        'title': 'Jeep Wrangler 2024+ Seat Covers (Power Seat Compatible)',
        'meta_title': '2024 Jeep Wrangler Seat Covers &mdash; Power Seat Compatible | JLSeatCovers.com',
        'meta_desc': '2024+ Jeep Wrangler seat covers for power/electric seat configs. '
                     'Bartact #1 with 2024+ specific SKU. What changed and what still fits.',
        'h1': 'Jeep Wrangler 2024+ Seat Covers (Power Seat Compatible)',
        'hero_sub': "The 2024 JL introduced optional power seats. "
                    "Check your side bolster for adjustment controls before ordering.",
        'intro': """<p>The 2024 model year revised the seat back on power-seat-equipped JL and JLU Wranglers.
If your 2024+ has <strong>manual seats</strong> (check for an adjustment switch on the side bolster &mdash;
most Sport, Sport S, and Willys trims), pre-2024 JL covers generally fit without issue.</p>
<p>If you have <strong>power seats</strong> (Sahara and some Rubicon trims), you need a cover
specifically listed as compatible with the 2024+ power seat configuration.
Bartact has a dedicated 2024+ SKU &mdash; it's the safest option.
Amazon covers listed below confirm 2024+ fitment in their listing.</p>""",
        'fitment_notes': [
            'Power seats introduced as option on 2024+ Sahara and some Rubicon trims',
            'Manual-seat 2024+ Wranglers: pre-2024 JL covers generally fit fine',
            'Power-seat 2024+ Wranglers: verify explicit 2024+ power seat compatibility',
            'Check the adjustment switch on side bolster to confirm power vs manual seats',
            'Bartact 2024+ SKU is the safest option for power seat configs',
        ],
    },
    {
        'slug': 'jl-mojave-392',
        'file': 'jl-mojave-392.html',
        'title': 'Jeep Wrangler Mojave &amp; 392 Seat Covers',
        'meta_title': 'Jeep Wrangler Mojave &amp; 392 Seat Covers 2026 | JLSeatCovers.com',
        'meta_desc': 'Seat covers specifically for the Jeep Wrangler Mojave and 392 editions. '
                     'Most generic covers don\'t fit. Bartact is the confirmed option.',
        'h1': 'Jeep Wrangler Mojave &amp; 392 Edition Seat Covers',
        'hero_sub': "Most seat covers explicitly exclude the Mojave and 392. "
                    "Here's what actually fits.",
        'intro': """<p>The Mojave and 392 editions have unique front seats not found on Sport, Sahara,
Rubicon, Willys, or standard JL/JLU trims. The seat bolster shape and padding profile differ
from standard JL seats. Most covers listed as "fits JL" include an explicit exclusion
for Mojave and 392 in the fitment notes.</p>
<p>Before ordering any cover for a Mojave or 392, look for explicit Mojave/392 fitment
confirmation in the listing &mdash; not just "fits 2018-2026 Wrangler."
Bartact makes a dedicated Mojave/392 SKU and is the most reliable option.</p>
<p>The Amazon picks below include front-only covers that fit all JL/JLU trims including Mojave/392,
since front-only patterns have more flexibility than full-set patterns that include the rear.</p>""",
        'fitment_notes': [
            'Mojave and 392 have unique front seat bolsters &mdash; different from all other JL trims',
            'Most full-set covers explicitly exclude Mojave and 392 in fitment notes',
            'Front-only covers have more flexibility &mdash; many fit Mojave/392 fronts',
            'Bartact makes a dedicated Mojave/392 SKU &mdash; safest option for full set',
            'Always confirm "fits Mojave" or "fits 392" in listing before ordering any full set',
        ],
    },
    {
        'slug': 'jlu-4xe',
        'file': 'jlu-4xe.html',
        'title': 'Jeep Wrangler JLU 4XE Seat Covers (2021&ndash;Present)',
        'meta_title': 'Jeep Wrangler 4XE Seat Covers 2026 &mdash; Correct Fitment | JLSeatCovers.com',
        'meta_desc': 'Seat covers for the Jeep Wrangler JLU 4XE plug-in hybrid. '
                     'Unique rear bench requires specific covers. Bartact 4XE SKU explained.',
        'h1': 'Jeep Wrangler JLU 4XE Seat Covers (2021&ndash;Present)',
        'hero_sub': "The 4XE has a unique rear bench. "
                    "Standard JLU rear covers won't fit correctly.",
        'intro': """<p>The JLU 4XE (plug-in hybrid, 2021+) has a rear bench seat with different
geometry from the standard JLU 4-door. The hybrid battery pack changes the rear seat architecture,
resulting in a different seat shape and mounting. Standard JLU rear covers will technically
go on the 4XE but will not sit correctly.</p>
<p>Bartact is currently the only manufacturer making a dedicated 4XE rear seat cover SKU.
For the front seats, standard JL/JLU front covers fit the 4XE without issue &mdash;
the front seats are unchanged from the standard JLU.</p>""",
        'fitment_notes': [
            '4XE rear bench geometry differs from standard JLU due to hybrid battery architecture',
            'Standard JLU rear covers will not sit correctly on the 4XE rear bench',
            'Front seat covers: standard JL/JLU front covers fit 4XE fronts without issue',
            'Bartact is the only brand with a confirmed 4XE-specific rear seat SKU',
            'For rear covers, select "4XE" explicitly at checkout on bartact.com',
        ],
    },
]

# =============================================================================
# HTML TEMPLATES
# =============================================================================
CSS = """
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f5f7;color:#1a1a1a;line-height:1.75}
a{color:#c0392b;text-decoration:none}a:hover{text-decoration:underline}
header{background:#fff;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;border-bottom:3px solid #c0392b;position:sticky;top:0;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.logo{font-size:1.2em;font-weight:800;color:#c0392b}
.logo a{color:#c0392b}
nav a{color:#555;margin-left:16px;font-size:.86em;font-weight:600}nav a:hover{color:#c0392b}
.hero{background:linear-gradient(135deg,#1c2833 0%,#2e4053 55%,#922b21 100%);padding:54px 24px 46px;text-align:center}
.hero h1{font-size:1.95em;color:#fff;font-weight:800;line-height:1.2;max-width:820px;margin:0 auto 14px}
.hero p{font-size:1em;color:rgba(255,255,255,.85);max-width:660px;margin:0 auto}
.updated{font-size:.72em;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px}
.container{max-width:960px;margin:0 auto;padding:40px 24px}
.prose h2{font-size:1.3em;font-weight:700;color:#1c2833;margin:2em 0 .7em;padding-bottom:.3em;border-bottom:3px solid #c0392b}
.prose h3{font-size:1em;font-weight:700;color:#922b21;margin:1.4em 0 .5em}
.prose p{color:#333;margin-bottom:1em;line-height:1.8}
.prose ul,.prose ol{color:#333;margin:0 0 1em 1.5em;line-height:1.8}
.prose li{margin-bottom:.35em}
.prose strong{color:#1c2833}
.bartact-card{background:#fff;border:3px solid #c0392b;border-radius:14px;padding:26px;margin:2rem 0;box-shadow:0 4px 20px rgba(192,57,43,.1)}
.bc-badge{display:inline-block;background:#c0392b;color:#fff;font-size:.72em;font-weight:800;padding:5px 14px;border-radius:20px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px}
.bc-header{display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start;margin-bottom:12px}
.bc-header img{border-radius:8px;width:170px;min-width:170px;height:170px;object-fit:contain;background:#f4f5f7;border:1px solid #eee}
.bc-body{flex:1;min-width:200px}
.bc-body h3{font-size:1.1em;font-weight:800;color:#1c2833;margin:0 0 8px}
.bc-body p{color:#444;font-size:.93em;line-height:1.75;margin-bottom:.7em}
.stars{color:#f39c12;font-size:.9em;margin-bottom:.5em}
.btn-bartact{display:inline-block;background:#c0392b;color:#fff;font-weight:800;padding:12px 24px;border-radius:8px;font-size:.9em;margin-top:6px}
.btn-bartact:hover{background:#922b21;text-decoration:none;color:#fff}
.picks-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1.1rem;margin:1.2rem 0 2rem}
.pick-card{background:#fff;border:1px solid #ddd;border-radius:12px;padding:18px;display:flex;flex-direction:column;box-shadow:0 2px 6px rgba(0,0,0,.04)}
.pick-card img{width:100%;height:135px;object-fit:contain;border-radius:7px;background:#f4f5f7;margin-bottom:.7rem;border:1px solid #eee}
.pc-vendor{font-size:.68em;font-weight:800;color:#c0392b;text-transform:uppercase;letter-spacing:1px;margin-bottom:.2rem}
.pc-name{font-size:.84em;font-weight:700;color:#1a1a1a;line-height:1.3;margin-bottom:.4rem;flex:1}
.pc-desc{font-size:.77em;color:#555;line-height:1.6;margin-bottom:.8rem}
.china-badge{display:inline-block;font-size:.68em;color:#888;margin-bottom:.4rem}
.btn-amz{display:block;text-align:center;background:#ff9900;color:#fff;font-weight:800;padding:10px 12px;border-radius:6px;font-size:.8em}
.btn-amz:hover{background:#e68900;text-decoration:none;color:#fff}
.fit-table{width:100%;border-collapse:collapse;font-size:.87em;margin:1rem 0 1.5rem}
.fit-table th{background:#1c2833;color:#fff;padding:10px 13px;text-align:left;font-weight:700;white-space:nowrap}
.fit-table td{padding:9px 13px;border-bottom:1px solid #eee;color:#333;vertical-align:top}
.fit-table tr:nth-child(even) td{background:#f9f9f9}
.fit-yes{color:#27ae60;font-weight:700}.fit-no{color:#c0392b;font-weight:700}.fit-chk{color:#e67e22;font-weight:700}
.alert{background:#fef9e7;border-left:4px solid #f39c12;padding:.9rem 1.2rem;border-radius:0 8px 8px 0;margin:1rem 0;font-size:.9em;color:#555}
.alert strong{color:#1c2833}
.breadcrumb{font-size:.82em;color:#888;margin-bottom:1.5rem}
.breadcrumb a{color:#c0392b}
.subpage-nav{display:flex;flex-wrap:wrap;gap:8px;margin:1.5rem 0}
.snav-btn{background:#fff;border:2px solid #c0392b;color:#c0392b;font-weight:700;font-size:.82em;padding:8px 16px;border-radius:7px;display:inline-block}
.snav-btn:hover,.snav-btn.active{background:#c0392b;color:#fff;text-decoration:none}
footer{background:#1c2833;color:rgba(255,255,255,.55);text-align:center;padding:28px 24px;font-size:.82em;margin-top:3rem}
footer a{color:rgba(255,255,255,.7)}
footer p{margin-bottom:6px}
@media(max-width:600px){.hero h1{font-size:1.45em}.bc-header{flex-direction:column}.bc-header img{width:100%;height:180px;min-width:unset}.picks-grid{grid-template-columns:1fr 1fr}nav{display:none}}
"""

NAV_LINKS = [
    ('/', 'All JL Covers'),
    ('/jl-2door.html', 'JL 2-Door'),
    ('/jlu-4door.html', 'JLU 4-Door'),
    ('/jl-2024-plus.html', '2024+ Power'),
    ('/jl-mojave-392.html', 'Mojave &amp; 392'),
    ('/jlu-4xe.html', '4XE'),
]

def nav_html(current_file):
    links = []
    for href, label in NAV_LINKS:
        active = ' class="snav-btn active"' if href == f'/{current_file}' else ' class="snav-btn"'
        links.append(f'<a href="{href}"{active}>{label}</a>')
    return '\n'.join(links)

def pick_card_html(asin, img_hash, vendor, name, desc):
    img_url = f'https://m.media-amazon.com/images/I/{img_hash}._AC_SL400_.jpg'
    amz_url = f'https://www.amazon.com/dp/{asin}?tag={TAG}'
    return f"""      <div class="pick-card">
        <img src="{img_url}" alt="{vendor} {name}" loading="lazy">
        <div class="pc-vendor">{vendor}</div>
        <div class="pc-name">{name}</div>
        <div class="pc-desc">{desc}</div>
        <div class="china-badge">&#127464;&#127475; Manufactured in China</div>
        <a href="{amz_url}" class="btn-amz" target="_blank" rel="nofollow noopener">View on Amazon &rarr;</a>
      </div>"""

def bartact_html(slug):
    b = BARTACT[slug]
    bullets = '\n'.join(f'          <li>✓ {x}</li>' for x in b['bullets'])
    return f"""    <div class="bartact-card">
      <div class="bc-badge">{b['badge']}</div>
      <div class="bc-header">
        <img src="{BARTACT_IMG}" alt="{b['name']}" loading="lazy">
        <div class="bc-body">
          <h3>{b['name']}</h3>
          <div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <p>{b['blurb']}</p>
          <ul style="margin:0 0 .7em 1.4em;font-size:.9em;color:#333;line-height:1.75">
{bullets}
          </ul>
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
    <a href="{b['url']}" class="btn-bartact" target="_blank" rel="noopener">Shop Bartact Direct &rarr;</a>
        </div>
      </div>
    </div>"""

def build_subpage(page):
    slug = page['slug']
    picks = [p for p in PRODUCTS if slug in p[5]]
    pick_cards = '\n'.join(pick_card_html(*p[:5]) for p in picks)
    fitment_items = '\n'.join(f'          <li>{n}</li>' for n in page['fitment_notes'])

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{page['meta_title']}</title>
<meta name="description" content="{page['meta_desc']}">
<link rel="canonical" href="{SITE_URL}/{page['file']}">
<meta property="og:title" content="{page['meta_title']}">
<meta property="og:description" content="{page['meta_desc']}">
<meta property="og:type" content="article">
<meta property="og:url" content="{SITE_URL}/{page['file']}">
<style>{CSS}
.bartact-colors .tier-label{{font-size:.78rem;font-weight:700;color:#8b5e0a;margin:8px 0 4px;text-transform:uppercase;letter-spacing:.4px}}
.bartact-colors{{margin:10px 0 14px;padding:10px 12px;background:#fefefe;border:1px solid #e8d8b0;border-radius:8px}}
.color-row{{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:5px 0}}
.color-label{{font-size:.8rem;font-weight:700;color:#555;min-width:52px}}
.color-swatch{{display:inline-block;padding:3px 9px;border-radius:12px;font-size:.75rem;font-weight:600;cursor:default;border:1px solid rgba(0,0,0,.15)}}
</style>
</head>
<body>
<header>
  <div class="logo"><a href="/">JLSeatCovers.com</a></div>
  <nav>
    <a href="/">All JL Covers</a>
    <a href="/jl-2door.html">JL 2-Door</a>
    <a href="/jlu-4door.html">JLU 4-Door</a>
    <a href="/jl-2024-plus.html">2024+</a>
    <a href="/jl-mojave-392.html">Mojave/392</a>
    <a href="/jlu-4xe.html">4XE</a>
  </nav>
</header>

<div class="hero">
  <div class="updated">Updated July 2026</div>
  <h1>{page['h1']}</h1>
  <p>{page['hero_sub']}</p>
</div>

<div class="container">
  <div class="breadcrumb">
    <a href="/">JLSeatCovers.com</a> &rsaquo; {page['title']}
  </div>

  <div class="subpage-nav">
    {nav_html(page['file'])}
  </div>

  <div class="prose">
    <h2>About This Configuration</h2>
    {page['intro']}

{bartact_html(slug)}

    <h2>Amazon Picks &mdash; {len(picks)} Verified Options</h2>
    <p>All covers below have confirmed JL/JLU fitment. No prices shown (see Amazon for current pricing).
    No Rough Country, no Coverado.</p>
    <div class="picks-grid">
{pick_cards}
    </div>

    <h2>Material Guide &mdash; What to Choose for Your Use Case</h2>
    <p>The right material depends on how you use your Wrangler:</p>
    <ul>
      <li><strong>Hard off-road use (rock crawling, trail riding, mud):</strong> Bartact Cordura &mdash;
      doesn't hold moisture, resists abrasion from gear and equipment, MOLLE panels for organizers
      and holsters on the seat backs. Built to take abuse without cracking or peeling.</li>
      <li><strong>Water and beach use (surf, fishing, wet gear, dogs):</strong> Neoprene &mdash;
      Smittybilt Gen2 is the top Amazon pick. Waterproof, flexible, easy to wipe down.
      Wet Okole (wetokole.com) is the premium neoprene option if you want USA-made neoprene.</li>
      <li><strong>Daily driver, light trail use:</strong> Faux leather options like GIANT PANDA,
      GOLYWIN, Aierxuan, or RIDEPOSH. Easy to wipe clean, look sharp, hold up well for
      light use. Not built for serious off-road abuse but excellent for street and occasional trail.</li>
      <li><strong>Budget protection:</strong> FREESOO polyester covers. Decent fitment at a lower
      price point. Best for Wranglers that aren't going off-road but need seat protection from
      pets, kids, work gear, or spills.</li>
    </ul>

    <h2>Why Bartact Doesn't Sell on Amazon</h2>
    <p>Bartact covers are made to order in the USA. Amazon's fulfillment model doesn't work
    for custom-cut, made-to-order products &mdash; you'd be waiting weeks for Amazon to receive
    inventory that doesn't exist yet. Bartact sells direct at bartact.com for this reason.</p>
    <p>Lead times vary by color and configuration. Popular combinations (black/black, black/red)
    are often in stock for faster shipping. Custom colors and less common configs can take
    4&ndash;8 weeks. Check current lead times at checkout on bartact.com.</p>

    <h2>Fitment Notes for This Config</h2>
    <ul>
{fitment_items}
    </ul>

    <h2>Frequently Asked Questions</h2>
    <div style="margin-bottom:2rem">
      <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.1rem 1.3rem;margin-bottom:.8rem">
        <div style="font-weight:700;color:#1c2833;margin-bottom:.35rem;font-size:.93em">Will JK seat covers fit my JL?</div>
        <p style="color:#444;font-size:.88em;line-height:1.75;margin:0">No. The JL and JK have completely different seat pan geometry. A JK cover will not fit a JL correctly, and vice versa. Always buy covers specifically made for your generation.</p>
      </div>
      <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.1rem 1.3rem;margin-bottom:.8rem">
        <div style="font-weight:700;color:#1c2833;margin-bottom:.35rem;font-size:.93em">Do JL and JLU seat covers differ?</div>
        <p style="color:#444;font-size:.88em;line-height:1.75;margin:0">Front seat covers are the same between JL 2-door and JLU 4-door &mdash; the front seats are identical. Rear covers differ: the JLU rear bench is longer and shaped differently than the JL 2-door rear. Always order body-style-specific rear covers.</p>
      </div>
      <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.1rem 1.3rem;margin-bottom:.8rem">
        <div style="font-weight:700;color:#1c2833;margin-bottom:.35rem;font-size:.93em">Are Bartact seat covers worth the price?</div>
        <p style="color:#444;font-size:.88em;line-height:1.75;margin:0">If you actually use your Jeep off-road, yes. Bartact covers are custom-cut for your exact configuration, built from heavy-duty Cordura fabric, include MOLLE panels for mounting gear on seat backs, and are made in the USA. For serious Wrangler use, nothing else offers the same combination of fitment accuracy and durability. For a daily driver that never leaves pavement, an Amazon neoprene or faux leather cover is fine.</p>
      </div>
      <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.1rem 1.3rem;margin-bottom:.8rem">
        <div style="font-weight:700;color:#1c2833;margin-bottom:.35rem;font-size:.93em">What is the best waterproof seat cover for a Jeep Wrangler JL?</div>
        <p style="color:#444;font-size:.88em;line-height:1.75;margin:0">For waterproofing, neoprene is the best material. Smittybilt Gen2 Neoprene is the top Amazon pick for the JL/JLU &mdash; confirmed fitment, waterproof, airbag-safe. Wet Okole (wetokole.com) is the premium neoprene option if you want USA-made. Bartact Cordura is water-resistant but not waterproof &mdash; it sheds water but won't stop a flooded interior.</p>
      </div>
      <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.1rem 1.3rem;margin-bottom:.8rem">
        <div style="font-weight:700;color:#1c2833;margin-bottom:.35rem;font-size:.93em">Do seat covers void the Jeep warranty?</div>
        <p style="color:#444;font-size:.88em;line-height:1.75;margin:0">No, seat covers don't void the vehicle warranty. The Magnuson-Moss Warranty Act prevents manufacturers from voiding warranties based on aftermarket accessories unless the accessory directly caused the failure. Seat covers from any of the brands listed here are safe to use without warranty concerns.</p>
      </div>
      <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.1rem 1.3rem;margin-bottom:.8rem">
        <div style="font-weight:700;color:#1c2833;margin-bottom:.35rem;font-size:.93em">Do Jeep Wrangler seat covers fit over heated seats?</div>
        <p style="color:#444;font-size:.88em;line-height:1.75;margin:0">It depends on the material. Thinner covers like faux leather and light polyester allow heat transfer with minimal loss. Thick covers like Bartact Cordura will reduce heated seat effectiveness noticeably. Neoprene is a good insulator &mdash; heated seats will still work but take longer to warm up. Bartact does sell without the seat heating in mind, but many customers use them over heated seats without major issues.</p>
      </div>
    </div>

    <h2>JL/JLU Full Fitment Matrix</h2>
    <div style="overflow-x:auto">
      <table class="fit-table">
        <thead>
          <tr>
            <th>Cover</th>
            <th>JL 2-Door</th>
            <th>JLU 4-Door</th>
            <th>4XE</th>
            <th>Mojave/392</th>
            <th>2024+ Power</th>
            <th>Airbag Safe</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>Bartact Tactical</strong></td><td class="fit-yes">✓</td><td class="fit-yes">✓</td><td class="fit-yes">✓ 4XE SKU</td><td class="fit-yes">✓ Moj/392 SKU</td><td class="fit-yes">✓ 2024+ SKU</td><td class="fit-yes">✓</td></tr>
          <tr><td><strong>Smittybilt Gen2 Neo</strong></td><td class="fit-yes">✓</td><td class="fit-yes">✓</td><td class="fit-chk">Verify</td><td class="fit-chk">Verify</td><td class="fit-chk">Verify</td><td class="fit-yes">✓</td></tr>
          <tr><td><strong>FREESOO Custom</strong></td><td class="fit-yes">✓</td><td class="fit-yes">✓</td><td class="fit-no">✗</td><td class="fit-no">✗</td><td class="fit-chk">Verify</td><td class="fit-chk">Verify</td></tr>
          <tr><td><strong>Aierxuan Full Set</strong></td><td class="fit-yes">✓</td><td class="fit-yes">✓</td><td class="fit-chk">Verify</td><td class="fit-chk">Verify</td><td class="fit-yes">✓</td><td class="fit-yes">✓</td></tr>
          <tr><td><strong>GIANT PANDA</strong></td><td class="fit-yes">✓</td><td class="fit-yes">✓</td><td class="fit-chk">Verify</td><td class="fit-no">✗</td><td class="fit-chk">Verify</td><td class="fit-chk">Verify</td></tr>
          <tr><td><strong>RIDEPOSH</strong></td><td class="fit-chk">Verify</td><td class="fit-yes">✓</td><td class="fit-yes">✓</td><td class="fit-no">✗</td><td class="fit-chk">Verify</td><td class="fit-chk">Verify</td></tr>
          <tr><td><strong>GOLYWIN</strong></td><td class="fit-yes">✓</td><td class="fit-yes">✓</td><td class="fit-no">✗</td><td class="fit-no">✗</td><td class="fit-yes">✓</td><td class="fit-chk">Verify</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<footer>
  <p>&copy; 2026 JLSeatCovers.com &mdash; <a href="/">Home</a></p>
  <p>JLSeatCovers.com is a participant in the Amazon Services LLC Associates Program,
  an affiliate advertising program designed to provide a means for sites to earn advertising fees
  by advertising and linking to Amazon.com. Bartact links are non-affiliate direct links &mdash;
  we earn nothing from Bartact clicks. We recommend them because they make the best product.</p>
</footer>
</body>
</html>"""

# =============================================================================
# MAIN — build all subpages
# =============================================================================
if __name__ == '__main__':
    SITE_DIR.mkdir(parents=True, exist_ok=True)
    built = []

    for page in PAGES:
        html = build_subpage(page)
        out = SITE_DIR / page['file']
        out.write_text(html, encoding='utf-8')
        picks = [p for p in PRODUCTS if page['slug'] in p[5]]
        words = len(html.split())
        print(f"Built: {page['file']} — {len(picks)} picks, ~{words} words")
        built.append(page['file'])

    print(f"\nDone. Built {len(built)} subpages.")
    print("Now update index.html vehicle selector tabs to match these pages.")
    print("Run: cd /home/ubuntu/.openclaw/workspace/sites/jlseatcovers.com && git add -A && git commit -m 'Rebuild subpages via canonical builder' && git push")
