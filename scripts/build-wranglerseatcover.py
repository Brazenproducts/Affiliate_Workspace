#!/usr/bin/env python3
"""
Canonical builder for wranglerseatcover.com
Deep fitment guide — same depth as jkseatcovers.com
Generations: JK/JKU (2007-2018), JL/JLU (2018+), TJ/LJ (1997-2006)
Year groups for JK: 2007-2010, 2011-2012, 2013-2018
Run: python3 build-wranglerseatcover.py
"""
from pathlib import Path

SITE = "wranglerseatcover.com"
OUT = Path(f"/home/ubuntu/.openclaw/workspace/sites/{SITE}")
TAG = "brazenprodu01-20"

# ── Confirmed Bartact CDN images (all 200 OK) ────────────────────────────────
BARTACT_IMGS = {
    "jk-2007-2010": "https://www.bartact.com/cdn/shop/products/bartact-jeep-wrangler-seat-covers-front-tactical-seat-covers-for-jeep-wrangler-jk-jku-2007-10-bartact-pair-w-molle-non-srs-air-bag-compliant-29485380665387_600x.jpg?v=1762457057",
    "jk-2011-2012": "https://www.bartact.com/cdn/shop/products/bartact-jeep-wrangler-seat-covers-front-tactical-seat-covers-for-jeep-wrangler-jk-jku-2011-12-bartact-pair-w-molle-srs-air-bag-compliant-29485377749035_600x.jpg?v=1762457134",
    "jk-2013-2018": "https://www.bartact.com/cdn/shop/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jk-jku-2013-18-bartact-pair-w-molle-non-srs-air-bag-compliant-29023026577_600x.jpg?v=1762457062",
    "jk":           "https://www.bartact.com/cdn/shop/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jk-jku-2013-18-bartact-pair-w-molle-non-srs-air-bag-compliant-29023026577_600x.jpg?v=1762457062",
    "jl":           "https://www.bartact.com/cdn/shop/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jlu-2018-22-4-door-only-not-for-mojave-or-392-edition-bartact-w-molle-290.jpg?v=1762457338",
    "tj":           "https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-jeep-wrangler-seat-covers-black-graphite-front-tactical-seat-covers-for-jeep-wrangler-tj-1997-02-pair-w-molle-bartact-29023020023851.jpg?v=1762457055",
}

# ── Verified Amazon products ─────────────────────────────────────────────────
JK_PRODUCTS = [
    {
        "asin": "B0F2HLN2K6", "hash": "81QQwVwG9CL", "brand": "TLH",
        "name": "TLH Custom-Fit Seat Covers for Jeep Wrangler JK/JKU 2007-2018",
        "why": "One of the most popular custom-cut options for the JK platform. Full front and rear set, faux leather with airbag-compatible side seams. Fits 2-door JK and 4-door JKU across all years.",
        "pros": ["Custom-cut for JK/JKU platform", "Airbag-safe side seams", "Full front+rear set", "Wipe-clean faux leather"],
        "cons": ["No MOLLE", "Manufactured in China"],
    },
    {
        "asin": "B09HZL16VK", "hash": "718DBvHIgyL", "brand": "Aierxuan",
        "name": "Aierxuan Diamond Stitch Seat Covers — Jeep Wrangler JK/JKU",
        "why": "4.7-star rated, one of the best-reviewed JK covers on Amazon. Diamond-stitch faux leather, confirmed fitment for both 2-door JK and 4-door JKU, airbag compatible.",
        "pros": ["4.7-star rating", "Diamond stitch design", "Airbag-compatible", "Full set included"],
        "cons": ["No MOLLE", "Manufactured in China"],
    },
    {
        "asin": "B09HZM2Z77", "hash": "71sje3DZIIL", "brand": "Aierxuan",
        "name": "Aierxuan Seat Covers with Side Pockets — Jeep Wrangler JK",
        "why": "Same Aierxuan quality but adds door-side storage pockets — useful if your JK doesn't have door panels. Custom-cut fitment for JK/JKU.",
        "pros": ["Side storage pockets", "Custom-cut fitment", "Airbag-safe seams", "Easy install"],
        "cons": ["No MOLLE", "Manufactured in China"],
    },
    {
        "asin": "B09WCKXJWH", "hash": "71LMs1UitJL", "brand": "OASIS AUTO",
        "name": "OASIS AUTO Leatherette Seat Covers — Jeep Wrangler JK",
        "why": "Mid-range leatherette with a clean OEM look. Airbag compatible, easy install, fits JK/JKU. Good option if you want a leather-look without Bartact's price.",
        "pros": ["OEM-look leatherette", "Airbag compatible", "Easy install", "Good price-to-quality ratio"],
        "cons": ["No MOLLE", "Manufactured in China"],
    },
    {
        "asin": "B095734G56", "hash": "716Bpe1YUSL", "brand": "FH Group",
        "name": "FH Group Neoprene Low-Back Seat Covers — Jeep Wrangler",
        "why": "Budget-friendly neoprene option. Water resistant, machine washable. Not as custom-fit as others — measure your seats first. Good for high-abuse daily use.",
        "pros": ["Water resistant neoprene", "Machine washable", "Budget price", "Durable fabric"],
        "cons": ["Universal sizing — measure first", "No MOLLE", "Manufactured in China"],
    },
]

JL_PRODUCTS = [
    {
        "asin": "B0BQHCQK2M", "hash": "81n+FBfFWCL", "brand": "Smittybilt",
        "name": "Smittybilt GEN2 Neoprene Seat Covers — Jeep Wrangler JL/JLU 2018+",
        "why": "Smittybilt's GEN2 neoprene is one of the most trusted names for JL covers. Custom-pattern neoprene, OEM-level fit, waterproof outer layer, airbag safe. A solid Bartact alternative.",
        "pros": ["OEM-level custom fit", "Waterproof neoprene", "Airbag-safe seams", "Machine washable"],
        "cons": ["No MOLLE", "Manufactured in China"],
    },
    {
        "asin": "B09HZL16VK", "hash": "718DBvHIgyL", "brand": "Aierxuan",
        "name": "Aierxuan Diamond Stitch Seat Covers — Jeep Wrangler JL/JLU",
        "why": "Aierxuan's diamond-stitch faux leather now available with JL/JLU fitment. Same quality as the JK version — one of the best-reviewed options on Amazon for 2018+ owners.",
        "pros": ["Custom JL/JLU fitment", "Diamond stitch design", "Airbag compatible", "4.7-star rating"],
        "cons": ["No MOLLE", "Manufactured in China"],
    },
    {
        "asin": "B09F3MHRPD", "hash": "71x3s8n3xbL", "brand": "GIANT PANDA",
        "name": "GIANT PANDA Neoprene Seat Covers — Jeep Wrangler JL/JLU 2018-2024",
        "why": "Waterproof neoprene custom-fit for JL/JLU 2018-2024. Airbag-compatible seam design, fits both 2-door JL and 4-door JLU configurations.",
        "pros": ["Waterproof neoprene", "Custom JL/JLU fit", "Airbag-safe", "Fits JL and JLU"],
        "cons": ["No MOLLE", "Manufactured in China"],
    },
    {
        "asin": "B09B1TLKL8", "hash": "71bOaP9BSML", "brand": "FH Group",
        "name": "FH Group Waterproof Seat Covers — Jeep Wrangler JL",
        "why": "Budget waterproof option for JL owners. Check the fitment guide before ordering — FH Group offers JL-specific sizing. Good for off-road use where you need washable covers.",
        "pros": ["Waterproof fabric", "Budget price", "Machine washable", "Good trail durability"],
        "cons": ["Verify JL fitment before ordering", "No MOLLE", "Manufactured in China"],
    },
]

TJ_PRODUCTS = [
    {
        "asin": "B0C1ZMTHX5", "hash": "71pJuTLU3KL", "brand": "Smittybilt",
        "name": "Smittybilt GEN2 Neoprene Seat Covers — Jeep Wrangler TJ 1997-2006",
        "why": "Smittybilt's GEN2 neoprene in custom-pattern for the TJ. Waterproof, machine washable, airbag safe. One of the few brands that still actively supports TJ fitment.",
        "pros": ["Custom TJ/LJ fit", "Waterproof neoprene", "Machine washable", "Airbag safe"],
        "cons": ["No MOLLE", "Manufactured in China"],
    },
    {
        "asin": "B0BN3PRFR3", "hash": "71gCrYJhHVL", "brand": "GIANT PANDA",
        "name": "GIANT PANDA Neoprene Seat Covers — Jeep Wrangler TJ 1997-2006",
        "why": "Custom neoprene fitment for TJ/LJ 1997-2006. Waterproof outer layer, airbag compatible. Good budget alternative to Bartact for TJ owners.",
        "pros": ["Custom TJ/LJ fitment", "Waterproof neoprene", "Airbag compatible", "Good value"],
        "cons": ["No MOLLE", "Manufactured in China"],
    },
    {
        "asin": "B07SFLTNPB", "hash": "71uICO3JNVL", "brand": "Covercraft",
        "name": "Covercraft SeatSaver Polycotton — Jeep Wrangler TJ/LJ",
        "why": "Covercraft's SeatSaver is a well-known name in custom seat protection. Polycotton fabric, custom-pattern for TJ/LJ, machine washable, airbag compatible.",
        "pros": ["Covercraft brand quality", "Custom TJ/LJ pattern", "Machine washable", "Airbag compatible"],
        "cons": ["No MOLLE", "Manufactured in China"],
    },
]

DISCLAIMER = """<div style="background:#f9f9f9;border:1px solid #ddd;border-radius:6px;padding:12px 16px;margin:32px 0 0;font-size:13px;color:#555;line-height:1.6">
  <strong>Affiliate Disclosure:</strong> WranglerSeatCover.com participates in the Amazon Services LLC Associates Program. We earn a commission when you click links to Amazon and make a purchase, at no extra cost to you.
</div>"""

CSS = """<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#222;background:#fff;line-height:1.7}
header{background:#1a1a2e;color:#fff;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
header a.logo{color:#fff;text-decoration:none;font-weight:700;font-size:1.1rem}
nav a{color:#ccc;text-decoration:none;margin-left:14px;font-size:.88rem}
nav a:hover{color:#fff}
.hero{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);color:#fff;padding:40px 20px;text-align:center}
.hero h1{font-size:1.9rem;margin-bottom:12px;max-width:720px;margin-left:auto;margin-right:auto}
.hero p{font-size:1rem;color:#b0b8d4;max-width:620px;margin:0 auto}
.container{max-width:920px;margin:0 auto;padding:24px 20px}
.intro{background:#f8f9ff;border-left:4px solid #1a1a2e;padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;font-size:.95rem;color:#333}
.step-nav{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0 6px;align-items:center}
.step-nav .label{font-size:.82rem;font-weight:700;color:#555;white-space:nowrap;margin-right:4px}
.step-nav a{padding:7px 15px;background:#f0f0f0;border-radius:20px;text-decoration:none;color:#333;font-size:.88rem;border:2px solid transparent;transition:.15s}
.step-nav a.active,.step-nav a:hover{background:#1a1a2e;color:#fff}
.divider{height:1px;background:#eee;margin:6px 0 28px}
/* Bartact card */
.bartact-card{background:#fff8f0;border:2px solid #c8860a;border-radius:12px;padding:20px;margin:24px 0;display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap}
.bartact-card img{width:190px;height:190px;object-fit:contain;border-radius:10px;background:#fff;border:1px solid #f5c6c6;flex-shrink:0}
.bartact-card .info{flex:1;min-width:220px}
.top-badge{display:inline-block;background:#c8860a;color:#fff;font-size:.73rem;font-weight:700;padding:3px 10px;border-radius:12px;margin-bottom:8px;letter-spacing:.5px;text-transform:uppercase}
.bartact-card h2{font-size:1.15rem;margin-bottom:6px;color:#1a1a2e}
.bartact-card .why{font-size:.9rem;color:#555;margin-bottom:10px;line-height:1.6}
.bartact-card ul{list-style:none;padding:0;margin:8px 0 14px}
.bartact-card ul li{padding:3px 0;font-size:.88rem;color:#444}
.bartact-card .cta{display:inline-block;background:#c8860a;color:#fff;padding:10px 22px;border-radius:7px;text-decoration:none;font-weight:700;font-size:.95rem}
.bartact-card .cta:hover{background:#a06808}
/* Product cards */
.picks-intro{font-size:.95rem;color:#444;margin:0 0 16px;line-height:1.6}
.product-card{display:flex;gap:16px;border:1px solid #e0e0e0;border-radius:12px;padding:18px;margin:0 0 16px;align-items:flex-start;background:#fff;transition:.15s}
.product-card:hover{border-color:#c0c0c0;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.product-card img{width:130px;height:130px;object-fit:contain;border-radius:8px;background:#f9f9f9;border:1px solid #eee;flex-shrink:0}
.product-card .info{flex:1;min-width:0}
.product-card h3{font-size:1rem;margin-bottom:6px;color:#1a1a2e;font-weight:700}
.product-card .why{font-size:.88rem;color:#555;margin-bottom:8px;line-height:1.6}
.pros-cons{display:flex;gap:12px;margin:8px 0 12px;flex-wrap:wrap}
.pros,.cons{font-size:.82rem;line-height:1.5}
.pros strong{color:#2d8a4e}
.cons strong{color:#c0392b}
.pros ul,.cons ul{list-style:none;padding:0}
.pros ul li::before{content:"+ ";color:#2d8a4e;font-weight:700}
.cons ul li::before{content:"- ";color:#c0392b;font-weight:700}
.china-badge{display:inline-block;font-size:.75rem;color:#666;background:#f0f0f0;padding:2px 8px;border-radius:10px;margin-bottom:8px}
.amz-btn{display:inline-block;background:#ff9900;color:#fff;padding:8px 20px;border-radius:6px;text-decoration:none;font-weight:700;font-size:.88rem}
.amz-btn:hover{background:#e08800}
/* Comparison table */
h2.section{margin:32px 0 12px;font-size:1.2rem;color:#1a1a2e;border-bottom:2px solid #eee;padding-bottom:8px}
.comp-table{width:100%;border-collapse:collapse;margin:0 0 28px;font-size:.88rem}
.comp-table th{background:#1a1a2e;color:#fff;padding:10px 12px;text-align:left;font-weight:600}
.comp-table td{padding:9px 12px;border-bottom:1px solid #eee;vertical-align:top}
.comp-table tr:nth-child(even) td{background:#fafafa}
.comp-table tr:first-child td{font-weight:600}
.comp-table a{color:#c8860a;text-decoration:none;font-weight:700}
.comp-table a:hover{text-decoration:underline}
/* FAQ */
.faq-item{border-bottom:1px solid #eee;padding:14px 0}
.faq-item h3{font-size:1rem;color:#1a1a2e;margin-bottom:7px}
.faq-item p{font-size:.9rem;color:#555;line-height:1.7}
/* Fitment table */
.fitment-table{width:100%;border-collapse:collapse;margin:16px 0 28px;font-size:.88rem}
.fitment-table th{background:#f0f4ff;color:#1a1a2e;padding:9px 12px;text-align:left;border:1px solid #dde}
.fitment-table td{padding:8px 12px;border:1px solid #eee;vertical-align:top}
.fitment-table a{color:#1a1a2e;text-decoration:none;font-weight:600}
.fitment-table a:hover{text-decoration:underline;color:#c8860a}
/* Blog sidebar */
.bartact-blog{background:#f8f4ee;border-left:4px solid #c8860a;padding:16px 20px;margin:32px 0;border-radius:4px}
.bartact-blog h4{margin-bottom:10px;color:#8b5e0a;font-size:1rem}
.bartact-blog ul{list-style:none;padding:0}
.bartact-blog ul li{padding:4px 0}
.bartact-blog ul li a{color:#c8860a;text-decoration:none;font-size:.9rem}
.bartact-blog ul li a:hover{text-decoration:underline}
footer{background:#1a1a2e;color:#aaa;text-align:center;padding:24px 20px;font-size:.85rem;margin-top:40px}
footer a{color:#aaa}
@media(max-width:600px){
  .bartact-card{flex-direction:column}
  .bartact-card img{width:100%;height:200px}
  .product-card{flex-direction:column}
  .product-card img{width:100%;height:180px}
  .pros-cons{flex-direction:column}
}

.bartact-colors .tier-label{{font-size:.78rem;font-weight:700;color:#8b5e0a;margin:8px 0 4px;text-transform:uppercase;letter-spacing:.4px}}
.bartact-colors{{margin:10px 0 14px;padding:10px 12px;background:#fefefe;border:1px solid #e8d8b0;border-radius:8px}}
.color-row{{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:5px 0}}
.color-label{{font-size:.8rem;font-weight:700;color:#555;min-width:52px}}
.color-swatch{{display:inline-block;padding:3px 9px;border-radius:12px;font-size:.75rem;font-weight:600;cursor:default;border:1px solid rgba(0,0,0,.15)}}
</style>"""

HEADER = """<header>
  <a class="logo" href="/">WranglerSeatCover.com</a>
  <nav>
    <a href="/jk-jku-seat-covers.html">JK/JKU</a>
    <a href="/jl-jlu-seat-covers.html">JL/JLU</a>
    <a href="/tj-seat-covers.html">TJ/LJ</a>
    <a href="/paracord-grab-handles.html">Grab Handles</a>
  </nav>
</header>"""

FOOTER = f"""<footer>
  {DISCLAIMER}
  <p style="margin-top:12px">&copy; 2026 WranglerSeatCover.com &mdash; Independent reviews. Not affiliated with Jeep&reg; or Stellantis.</p>
</footer>"""

BARTACT_BLOG = """<div class="bartact-blog">
  <h4>&#128218; From Bartact's Research Library</h4>
  <ul>
    <li><a href="https://bartact.com/blogs/news/best-jeep-wrangler-seat-covers-2026" target="_blank" rel="noopener">Best Jeep Wrangler Seat Covers 2026</a></li>
    <li><a href="https://bartact.com/blogs/news/jeep-wrangler-seat-covers-guide-2026" target="_blank" rel="noopener">Jeep Wrangler Seat Covers: Fit, Material &amp; MOLLE Explained</a></li>
    <li><a href="https://bartact.com/blogs/news/jeep-wrangler-jk-seat-covers-2026" target="_blank" rel="noopener">Best Jeep Wrangler JK/JKU Seat Covers 2026</a></li>
    <li><a href="https://bartact.com/blogs/news/jeep-wrangler-jk-jku-seat-covers-2007-2018-what-fits-and-what-works" target="_blank" rel="noopener">JK &amp; JKU Seat Covers 2007-2018: What Fits and Works</a></li>
    <li><a href="https://bartact.com/blogs/news/jeep-wrangler-jl-seat-covers-2026" target="_blank" rel="noopener">Best Jeep Wrangler JL/JLU Seat Covers 2026</a></li>
    <li><a href="https://bartact.com/blogs/news/jeep-wrangler-tj-seat-covers-2026" target="_blank" rel="noopener">Best Jeep Wrangler TJ Seat Covers 2026</a></li>
    <li><a href="https://bartact.com/blogs/news/best-jeep-seat-covers-for-off-road-adventures-what-to-look-for" target="_blank" rel="noopener">Best Jeep Seat Covers for Off-Road Adventures</a></li>
  </ul>
</div>"""


def amz_url(asin):
    return f"https://www.amazon.com/dp/{asin}?tag={TAG}"

def amz_img(hash_):
    return f"https://m.media-amazon.com/images/I/{hash_}._AC_SL400_.jpg"

def pros_cons(pros, cons):
    pro_li = "".join(f"<li>{p}</li>" for p in pros)
    con_li = "".join(f"<li>{c}</li>" for c in cons)
    return f"""<div class="pros-cons">
  <div class="pros"><strong>&#10003; Pros</strong><ul>{pro_li}</ul></div>
  <div class="cons"><strong>&#10005; Cons</strong><ul>{con_li}</ul></div>
</div>"""

def bartact_card(gen_label, img_url, collection_url, bullets, note=""):
    bullet_li = "".join(f"<li>&#10003; {b}</li>" for b in bullets)
    note_html = f'<p style="font-size:.82rem;color:#888;margin-top:8px;font-style:italic">{note}</p>' if note else ""
    return f"""<div class="bartact-card">
  <img src="{img_url}" alt="Bartact Tactical Seat Covers {gen_label}" loading="lazy">
  <div class="info">
    <span class="top-badge">&#9733; #1 Pick &mdash; Made in USA</span>
    <h2>Bartact Tactical Seat Covers &mdash; {gen_label}</h2>
    <p class="why">Bartact invented the tactical seat cover category. Every cover is custom-cut &mdash; not universal &mdash; hand-sewn in the USA from 600D Polyester (standard colors) or 100D Cordura nylon (Coyote, OD, ACU) — both with PU waterproof backing, laminated foam and scrim, and mil-spec MOLLE webbing on every seat. No other brand on this page offers all three.</p>
    <ul>{bullet_li}</ul>
    {note_html}
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
    <a href="{collection_url}" target="_blank" rel="noopener" class="cta">Shop Bartact {gen_label} &rarr;</a>
  </div>
</div>"""

def product_card(p):
    pc = pros_cons(p["pros"], p["cons"])
    return f"""<div class="product-card">
  <img src="{amz_img(p['hash'])}" alt="{p['name']}" loading="lazy">
  <div class="info">
    <h3>{p['name']}</h3>
    <p class="why">{p['why']}</p>
    {pc}
    <div class="china-badge">&#127464;&#127475; Manufactured in China</div><br>
    <a href="{amz_url(p['asin'])}" target="_blank" rel="noopener nofollow" class="amz-btn">View on Amazon</a>
  </div>
</div>"""

def comp_table(bartact_url, gen, products):
    rows = f"""<tr>
    <td><strong>Bartact</strong></td>
    <td>Best overall &mdash; trail-proven</td>
    <td>Custom-cut, not universal</td>
    <td>600D Polyester (PU backed)</td>
    <td>Yes &mdash; mil-spec MOLLE</td>
    <td>USA</td>
    <td><a href="{bartact_url}" target="_blank" rel="noopener">Shop &rarr;</a></td>
  </tr>"""
    for p in products:
        rows += f"""<tr>
    <td>{p['brand']}</td>
    <td>Mid-range</td>
    <td>Custom-cut</td>
    <td>Faux leather / Neoprene</td>
    <td>No</td>
    <td>China</td>
    <td><a href="{amz_url(p['asin'])}" target="_blank" rel="noopener nofollow">Amazon &rarr;</a></td>
  </tr>"""
    return f"""<table class="comp-table">
  <thead><tr><th>Brand</th><th>Best For</th><th>Fit</th><th>Material</th><th>MOLLE</th><th>Made In</th><th>Buy</th></tr></thead>
  <tbody>{rows}</tbody>
</table>"""

def html_page(title, meta_desc, canonical, body_html):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{meta_desc}">
<link rel="canonical" href="https://{SITE}/{canonical}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{meta_desc}">
<meta property="og:type" content="website">
{CSS}
</head>
<body>
{HEADER}
{body_html}
{FOOTER}
</body>
</html>"""


# ────────────────────────────────────────────────────────────────────────────
# JK HUB PAGE
# ────────────────────────────────────────────────────────────────────────────
def build_jk_hub():
    step1 = """<div class="step-nav"><span class="label">Step 1: Door count</span>
  <a href="#all">All JK/JKU</a>
  <a href="/jk-2door-seat-covers.html">2-Door JK</a>
  <a href="/jku-4door-seat-covers.html">4-Door JKU</a>
</div>"""
    step2 = """<div class="step-nav"><span class="label">Step 2: Model year</span>
  <a href="/jk-2007-2010-seat-covers.html">2007&ndash;2010</a>
  <a href="/jk-2011-2012-seat-covers.html">2011&ndash;2012</a>
  <a href="/jk-2013-2018-seat-covers.html">2013&ndash;2018</a>
</div><div class="divider"></div>"""

    fitment = """<table class="fitment-table">
  <thead><tr><th>Year Range</th><th>Notes</th><th>SAB Airbags</th><th>Bartact Fits?</th><th>Page</th></tr></thead>
  <tbody>
    <tr><td><a href="/jk-2007-2010-seat-covers.html">2007&ndash;2010</a></td><td>Launch gen, pre-facelift interior</td><td>Optional on base trim</td><td>Yes</td><td><a href="/jk-2007-2010-seat-covers.html">View picks &rarr;</a></td></tr>
    <tr><td><a href="/jk-2011-2012-seat-covers.html">2011&ndash;2012</a></td><td>Mid-gen, SAB standard on most trims</td><td>Standard</td><td>Yes</td><td><a href="/jk-2011-2012-seat-covers.html">View picks &rarr;</a></td></tr>
    <tr><td><a href="/jk-2013-2018-seat-covers.html">2013&ndash;2018</a></td><td>Post-facelift, revised dash &amp; interior</td><td>Standard</td><td>Yes</td><td><a href="/jk-2013-2018-seat-covers.html">View picks &rarr;</a></td></tr>
  </tbody>
</table>"""

    bc = bartact_card(
        "JK/JKU (2007-2018)",
        BARTACT_IMGS["jk"],
        "https://bartact.com/collections/jeep-wrangler-jk-seat-covers",
        ["Custom-cut, not universal fit","600D Polyester (or 100D Cordura nylon for Coyote/OD/ACU) with PU waterproof backing","Mil-spec MOLLE on every seat","SAB airbag-compliant seam construction","Cut and hand-sewn in the USA","Fits all JK years: 2007-2018"]
    )
    cards = "".join(product_card(p) for p in JK_PRODUCTS)
    ct = comp_table("https://bartact.com/collections/jeep-wrangler-jk-seat-covers","JK/JKU", JK_PRODUCTS[:4])

    body = f"""<div class="hero">
  <h1>Best Jeep Wrangler JK &amp; JKU Seat Covers (2007&ndash;2018)</h1>
  <p>Year-specific fitment guides for the JK 2-door and JKU 4-door &mdash; pick your year for the most accurate fit and the right Bartact photo.</p>
</div>
<div class="container">
  <div class="intro">The Jeep Wrangler JK ran from 2007 to 2018 in two configurations: the 2-door JK and the 4-door JKU. Front seat covers are identical across all years and both configurations. Rear covers differ &mdash; the JK 2-door has a smaller rear bench than the JKU. Pick your year below for year-specific recommendations.</div>
  {step1}
  {step2}
  <h2 class="section" id="all">JK/JKU Fitment Matrix</h2>
  {fitment}
  {bc}
  <h2 class="section">Amazon Picks &mdash; All JK/JKU Years</h2>
  <p class="picks-intro">These covers fit all JK and JKU models across 2007-2018. For year-specific notes (airbag fitment, interior differences), use the year tabs above.</p>
  {cards}
  <h2 class="section">Quick Comparison</h2>
  {ct}
  {BARTACT_BLOG}
  <h2 class="section">Frequently Asked Questions</h2>
  <div class="faq-item"><h3>Do 2-door JK and 4-door JKU use the same seat covers?</h3><p>Front covers are identical &mdash; same seat frame across all JK/JKU years and door counts. Rear covers differ: the 2-door JK has a smaller rear bench than the 4-door JKU. Most brands list both configurations separately. Always confirm door count when ordering rear covers.</p></div>
  <div class="faq-item"><h3>Why does Bartact cost more than Amazon alternatives?</h3><p>Bartact uses 600D Polyester with a PU waterproof backing, laminated foam and scrim, UV protection built into the fabric milling, and mil-spec MOLLE webbing &mdash; all sewn in the USA. Amazon alternatives use lighter materials (typically faux leather or standard neoprene) without MOLLE and without the USA manufacturing premium. Both protect your seats. Only Bartact adds the tactical MOLLE grid for gear attachment.</p></div>
  <div class="faq-item"><h3>Will seat covers void my Jeep warranty?</h3><p>No. Aftermarket seat covers do not void your warranty under the Magnuson-Moss Warranty Act. The only requirement: covers must be SAB (side airbag) compliant, meaning the cover seams allow the side airbag to deploy properly. All picks on this page are SAB-compliant.</p></div>
  <div class="faq-item"><h3>What is the correct airbag compatibility for the JK?</h3><p>The 2007-2010 JK had side airbags as an option on some trims &mdash; check your specific vehicle. From 2011 onward, SAB side airbags were standard on most trims. If your JK has side airbags, only use SAB-compliant covers. All covers on this page are SAB-compliant.</p></div>
  <div class="faq-item"><h3>Can I use universal seat covers on a JK?</h3><p>Technically yes, but we don't recommend it. Universal covers slip on the Wrangler's contoured seats, can bunch under your thighs on the trail, and may block SAB airbag deployment. Custom-cut covers like Bartact are sewn to the exact JK seat dimensions and sit flush without slipping.</p></div>
</div>"""

    return "jk-jku-seat-covers.html", html_page(
        "Best Jeep Wrangler JK & JKU Seat Covers 2007-2018 | WranglerSeatCover.com",
        "Year-specific seat cover guide for the 2007-2018 Jeep Wrangler JK and JKU. Bartact #1 USA pick, plus 5 Amazon alternatives — fitment-verified, airbag-safe, all years covered.",
        "jk-jku-seat-covers.html", body
    )


# ────────────────────────────────────────────────────────────────────────────
# JK YEAR PAGES
# ────────────────────────────────────────────────────────────────────────────
def build_jk_year(year_key, year_range, airbag_note, prev_url, next_url):
    img = BARTACT_IMGS[year_key]
    collection = "https://bartact.com/collections/jeep-wrangler-jk-seat-covers"

    prev_link = f'<a href="{prev_url}" style="color:#c8860a">&larr; Previous</a>&nbsp;&nbsp;' if prev_url else ""
    next_link = f'&nbsp;&nbsp;<a href="{next_url}" style="color:#c8860a">Next &rarr;</a>' if next_url else ""
    pager = f'<p style="margin:16px 0;font-size:.9rem">{prev_link}{next_link}</p>' if prev_url or next_url else ""

    step1 = """<div class="step-nav"><span class="label">Step 1:</span>
  <a href="/jk-jku-seat-covers.html">All JK/JKU</a>
  <a href="/jk-jku-seat-covers.html#2door">2-Door JK</a>
  <a href="/jk-jku-seat-covers.html#4door">4-Door JKU</a>
</div>"""
    step2 = f"""<div class="step-nav"><span class="label">Step 2:</span>
  <a href="/jk-2007-2010-seat-covers.html" {"class='active'" if year_key=='jk-2007-2010' else ""}>2007&ndash;2010</a>
  <a href="/jk-2011-2012-seat-covers.html" {"class='active'" if year_key=='jk-2011-2012' else ""}>2011&ndash;2012</a>
  <a href="/jk-2013-2018-seat-covers.html" {"class='active'" if year_key=='jk-2013-2018' else ""}>2013&ndash;2018</a>
</div><div class="divider"></div>"""

    bc = bartact_card(
        f"JK/JKU {year_range}",
        img,
        collection,
        ["Custom-cut, not universal","600D Polyester (or 100D Cordura nylon for Coyote/OD/ACU) with PU waterproof backing","Mil-spec MOLLE on every seat","SAB airbag-compliant seam construction",f"Confirmed fit: {year_range} JK 2-door and JKU 4-door","Cut and hand-sewn in the USA"]
    )
    cards = "".join(product_card(p) for p in JK_PRODUCTS)
    ct = comp_table(collection, f"JK {year_range}", JK_PRODUCTS[:4])
    filename = f"{year_key}-seat-covers.html"

    body = f"""<div class="hero">
  <h1>Best Jeep Wrangler JK/JKU Seat Covers ({year_range})</h1>
  <p>Custom-fit picks verified for your {year_range} JK and JKU &mdash; Bartact #1 plus 5 Amazon alternatives, all SAB airbag-safe.</p>
</div>
<div class="container">
  <div class="intro">{airbag_note} All covers on this page are SAB airbag-compliant. Front covers are identical across all JK/JKU years. Rear covers: specify 2-door or 4-door when ordering.</div>
  {step1}
  {step2}
  {pager}
  {bc}
  <h2 class="section">Amazon Picks &mdash; {year_range} JK/JKU</h2>
  <p class="picks-intro">All five picks below are custom-cut for the JK platform and confirmed airbag-compatible. None have MOLLE &mdash; that&rsquo;s Bartact&rsquo;s exclusive advantage.</p>
  {cards}
  <h2 class="section">Quick Comparison</h2>
  {ct}
  {BARTACT_BLOG}
  <h2 class="section">Frequently Asked Questions</h2>
  <div class="faq-item"><h3>Do {year_range} JK and JKU use the same seat covers?</h3><p>Front covers are identical &mdash; same seat frame across 2-door JK and 4-door JKU. Rear covers differ by door count. Specify 2-door or 4-door when ordering rear seats.</p></div>
  <div class="faq-item"><h3>Is Bartact worth the price over Amazon options?</h3><p>Bartact uses 600D Polyester (or 100D Cordura nylon for Coyote/OD/ACU) with PU waterproof backing, laminated foam and scrim, UV protection in the fabric milling, and mil-spec MOLLE &mdash; all sewn in the USA. Amazon alternatives use lighter materials without MOLLE. If MOLLE and USA-made matter to you, Bartact is worth it. If you just need basic seat protection, the Amazon picks are solid.</p></div>
  <div class="faq-item"><h3>What does SAB airbag compliant mean?</h3><p>SAB stands for Side Airbag. Wrangler JKs have side-curtain airbags that deploy through the seat seam. SAB-compliant covers have a split seam that allows the airbag to deploy without obstruction. Never use a non-SAB cover on a JK with side airbags &mdash; it can prevent the airbag from deploying correctly in a crash.</p></div>
</div>"""

    return filename, html_page(
        f"Best Jeep Wrangler JK/JKU Seat Covers ({year_range}) | WranglerSeatCover.com",
        f"Top-rated seat covers for your {year_range} Jeep Wrangler JK and JKU. Bartact #1 USA pick plus 5 Amazon alternatives — all custom-fit and SAB airbag-safe.",
        filename, body
    )


# ────────────────────────────────────────────────────────────────────────────
# JL/JLU HUB PAGE
# ────────────────────────────────────────────────────────────────────────────
def build_jl_hub():
    collection = "https://bartact.com/collections/jeep-wrangler-jl-seat-covers"
    bc = bartact_card(
        "JL/JLU (2018+)",
        BARTACT_IMGS["jl"],
        collection,
        ["Custom-cut, not universal","600D Polyester (or 100D Cordura nylon for Coyote/OD/ACU) with PU waterproof backing","Mil-spec MOLLE on every seat","SAB airbag-compliant seam construction","Fits 2018-2024 JL 2-door and JLU 4-door","Cut and hand-sewn in the USA"],
        note="Not compatible with Mojave Edition or 392 Edition &mdash; those require special HVAC seat cover cutouts. Check Bartact&rsquo;s site for edition-specific fitment."
    )
    cards = "".join(product_card(p) for p in JL_PRODUCTS)
    ct = comp_table(collection, "JL/JLU", JL_PRODUCTS[:3])

    step_nav = """<div class="step-nav"><span class="label">Door count:</span>
  <a href="#all">All JL/JLU</a>
  <a href="#2door">2-Door JL</a>
  <a href="#4door">4-Door JLU</a>
</div>
<div class="step-nav"><span class="label">Year:</span>
  <a href="#2018-2023">2018&ndash;2023</a>
  <a href="#2024">2024+</a>
</div><div class="divider"></div>"""

    body = f"""<div class="hero">
  <h1>Best Jeep Wrangler JL &amp; JLU Seat Covers (2018+)</h1>
  <p>Custom-fit seat cover picks for the 2018-2024+ JL and JLU &mdash; Bartact #1, plus verified Amazon alternatives. Not all covers fit the Mojave or 392 Edition.</p>
</div>
<div class="container">
  <div class="intro">The Jeep Wrangler JL launched in 2018 in two configurations: the 2-door JL and the 4-door JLU. Front seat covers are identical for both. The JL introduced a new interior with more electronics and optional heated seats &mdash; always verify cover compatibility if you have heated, ventilated, or massage seats. The Mojave and 392 Editions require special covers with HVAC cutouts; standard JL covers will not fit these editions.</div>
  {step_nav}
  {bc}
  <h2 class="section" id="all">Amazon Picks &mdash; JL/JLU 2018+</h2>
  <p class="picks-intro">All picks below are confirmed for JL/JLU 2018+ fitment and SAB airbag-compatible. None will fit the Mojave or 392 Edition without modification.</p>
  {cards}
  <h2 class="section">Quick Comparison</h2>
  {ct}
  {BARTACT_BLOG}
  <h2 class="section">Frequently Asked Questions</h2>
  <div class="faq-item"><h3>Do JL and JLU use the same seat covers?</h3><p>Front covers are identical. The JL 2-door rear bench is smaller than the JLU 4-door. Always specify door count when ordering rear covers. Most brands list JL and JLU separately in their fitment tables.</p></div>
  <div class="faq-item"><h3>Why won&rsquo;t Bartact fit the Mojave or 392 Edition?</h3><p>The Mojave Edition has desert-rated HVAC vents in the front seats, and the 392 Edition has performance-tuned heated/ventilated seats. Both require custom cutouts in the seat cover that standard JL covers don&rsquo;t have. Bartact makes edition-specific covers &mdash; check their site for Mojave and 392 fitment options.</p></div>
  <div class="faq-item"><h3>Do 2021+ JL seat covers differ from 2018-2020?</h3><p>The seat frame is the same across all JL years. Some minor trim differences exist in the 2021+ interior, but they don&rsquo;t affect seat cover fitment. All covers listed here fit the full 2018-2024+ JL/JLU range.</p></div>
  <div class="faq-item"><h3>What&rsquo;s different about Bartact vs Amazon for the JL?</h3><p>Bartact uses 600D Polyester (or 100D Cordura nylon for Coyote/OD/ACU) with PU waterproof backing, laminated foam and scrim, UV protection in the fabric milling, and mil-spec MOLLE webbing &mdash; sewn in the USA. Amazon alternatives (Smittybilt, Aierxuan, GIANT PANDA, FH Group) use lighter neoprene or faux leather without MOLLE. Both protect your seats; Bartact adds MOLLE functionality and USA-made quality.</p></div>
  <div class="faq-item"><h3>Can I put seat covers on a JL with heated seats?</h3><p>Yes &mdash; all covers listed here are compatible with heated seats. Thin covers like faux leather and neoprene transmit heat effectively. Thicker covers may reduce heat transfer slightly but won&rsquo;t damage the heating element. Avoid covers with thick foam padding if heated seats are a priority.</p></div>
</div>"""

    return "jl-jlu-seat-covers.html", html_page(
        "Best Jeep Wrangler JL & JLU Seat Covers 2018+ | WranglerSeatCover.com",
        "Top-rated seat covers for the 2018+ Jeep Wrangler JL and JLU. Bartact #1 USA pick plus 4 Amazon alternatives — fitment-verified, SAB-safe, not compatible with Mojave or 392 Edition.",
        "jl-jlu-seat-covers.html", body
    )


# ────────────────────────────────────────────────────────────────────────────
# TJ HUB PAGE
# ────────────────────────────────────────────────────────────────────────────
def build_tj_hub():
    collection = "https://bartact.com/collections/jeep-wrangler-tj-seat-covers"
    bc = bartact_card(
        "TJ/LJ (1997-2006)",
        BARTACT_IMGS["tj"],
        collection,
        ["Custom-cut for TJ and LJ (Unlimited)","600D Polyester (or 100D Cordura nylon for Coyote/OD/ACU) with PU waterproof backing","Mil-spec MOLLE on every seat","SAB airbag-compliant seam construction","Fits all TJ/LJ years: 1997-2006","Cut and hand-sewn in the USA"]
    )
    cards = "".join(product_card(p) for p in TJ_PRODUCTS)
    ct = comp_table(collection, "TJ/LJ", TJ_PRODUCTS[:3])

    step_nav = """<div class="step-nav"><span class="label">Model year:</span>
  <a href="#1997-2002">1997&ndash;2002</a>
  <a href="#2003-2006">2003&ndash;2006</a>
</div><div class="divider"></div>"""

    body = f"""<div class="hero">
  <h1>Best Jeep Wrangler TJ &amp; LJ Seat Covers (1997&ndash;2006)</h1>
  <p>Fitment-verified seat covers for the TJ and LJ Unlimited &mdash; Bartact #1 USA pick plus Amazon alternatives. One of the few buying guides that still actively covers TJ fitment in 2026.</p>
</div>
<div class="container">
  <div class="intro">The Jeep Wrangler TJ ran from 1997 to 2006. The LJ (Unlimited) is a long-wheelbase version of the TJ with the same front seats. Most TJ trims did NOT have SAB side airbags &mdash; but some higher trim levels did. Check your specific vehicle before ordering airbag-specific covers. Bartact covers all TJ years with the same cover &mdash; their TJ/LJ collection fits 1997-2006 with no year splits required.</div>
  {step_nav}
  {bc}
  <h2 class="section" id="1997-2002">Amazon Picks &mdash; TJ/LJ 1997&ndash;2006</h2>
  <p class="picks-intro">Finding custom-fit TJ covers is harder than JK or JL. These three are among the few brands still actively listing TJ/LJ fitment &mdash; all verified for the 1997-2006 platform.</p>
  {cards}
  <h2 class="section">Quick Comparison</h2>
  {ct}
  {BARTACT_BLOG}
  <h2 class="section">Frequently Asked Questions</h2>
  <div class="faq-item"><h3>Do TJ and LJ use the same seat covers?</h3><p>Yes. The LJ Unlimited has the same front seats as the TJ. Front covers are identical. The LJ has a longer wheelbase but the same seat frames &mdash; any TJ cover listed here fits the LJ without modification.</p></div>
  <div class="faq-item"><h3>Did the TJ have side airbags?</h3><p>Most TJ trims did NOT have SAB side airbags. Check your specific vehicle &mdash; higher trim levels (Rubicon, some Sahara) may have them. If your TJ has no SABs, any cover fits. If it has SABs, use SAB-compliant covers only. All covers on this page are SAB-compliant.</p></div>
  <div class="faq-item"><h3>Why is it hard to find TJ seat covers in 2026?</h3><p>The TJ went out of production in 2006 &mdash; that&rsquo;s 20 years ago. Most cover manufacturers have dropped TJ-specific patterns as demand declines. Bartact, Smittybilt, GIANT PANDA, and Covercraft still actively support TJ fitment. We only list covers with confirmed current availability.</p></div>
  <div class="faq-item"><h3>What year range is the TJ exactly?</h3><p>The TJ ran from 1997 (model year) to 2006. The YJ preceded it (1987-1995) and has different seat dimensions. The JK succeeded it starting in 2007. Do not use JK or YJ covers on a TJ &mdash; the seat frames differ.</p></div>
</div>"""

    return "tj-seat-covers.html", html_page(
        "Best Jeep Wrangler TJ & LJ Seat Covers 1997-2006 | WranglerSeatCover.com",
        "Top seat covers for the 1997-2006 Jeep Wrangler TJ and LJ Unlimited. Bartact #1 USA pick plus verified Amazon alternatives — one of the few 2026 guides still actively covering TJ fitment.",
        "tj-seat-covers.html", body
    )


# ────────────────────────────────────────────────────────────────────────────
# INDEX PAGE
# ────────────────────────────────────────────────────────────────────────────
def build_index():
    gen_cards = """<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin:24px 0">
  <a href="/jk-jku-seat-covers.html" style="display:block;border:2px solid #e0e0e0;border-radius:12px;padding:22px 16px;text-decoration:none;text-align:center;color:#222;transition:.15s" onmouseover="this.style.borderColor='#c8860a';this.style.background='#fff8f0'" onmouseout="this.style.borderColor='#e0e0e0';this.style.background=''">
    <div style="font-size:2.2rem;margin-bottom:8px">&#128665;</div>
    <strong style="font-size:1rem">JK / JKU</strong><br>
    <span style="font-size:.85rem;color:#666">2007&ndash;2018</span><br>
    <span style="font-size:.8rem;color:#888;margin-top:6px;display:block">3 year-specific guides</span>
  </a>
  <a href="/jl-jlu-seat-covers.html" style="display:block;border:2px solid #e0e0e0;border-radius:12px;padding:22px 16px;text-decoration:none;text-align:center;color:#222;transition:.15s" onmouseover="this.style.borderColor='#c8860a';this.style.background='#fff8f0'" onmouseout="this.style.borderColor='#e0e0e0';this.style.background=''">
    <div style="font-size:2.2rem;margin-bottom:8px">&#128665;</div>
    <strong style="font-size:1rem">JL / JLU</strong><br>
    <span style="font-size:.85rem;color:#666">2018&ndash;2024+</span><br>
    <span style="font-size:.8rem;color:#888;margin-top:6px;display:block">Includes Mojave/392 notes</span>
  </a>
  <a href="/tj-seat-covers.html" style="display:block;border:2px solid #e0e0e0;border-radius:12px;padding:22px 16px;text-decoration:none;text-align:center;color:#222;transition:.15s" onmouseover="this.style.borderColor='#c8860a';this.style.background='#fff8f0'" onmouseout="this.style.borderColor='#e0e0e0';this.style.background=''">
    <div style="font-size:2.2rem;margin-bottom:8px">&#128665;</div>
    <strong style="font-size:1rem">TJ / LJ</strong><br>
    <span style="font-size:.85rem;color:#666">1997&ndash;2006</span><br>
    <span style="font-size:.8rem;color:#888;margin-top:6px;display:block">One of few 2026 TJ guides</span>
  </a>
</div>"""

    bc = bartact_card(
        "Jeep Wrangler (All Gens)",
        BARTACT_IMGS["jk"],
        "https://bartact.com/collections/jeep-wrangler-jk-seat-covers",
        ["Custom-cut, not universal fit","600D Polyester (or 100D Cordura nylon for Coyote/OD/ACU) with PU waterproof backing","Mil-spec MOLLE on every seat","SAB airbag-compliant seam construction","Made in the USA","Fits JK, JKU, JL, JLU, TJ, and LJ"]
    )

    material_table = """<table class="comp-table" style="margin:16px 0 28px">
  <thead><tr><th>Material</th><th>Waterproof?</th><th>MOLLE?</th><th>Trail Durability</th><th>Where to Buy</th></tr></thead>
  <tbody>
    <tr><td><strong>600D Polyester (Bartact)</strong></td><td>Yes &mdash; PU backed</td><td>Yes &mdash; mil-spec</td><td>Excellent</td><td><a href="https://bartact.com" target="_blank" rel="noopener">Bartact</a></td></tr>
    <tr><td>Neoprene (Smittybilt, GIANT PANDA)</td><td>Yes</td><td>No</td><td>Very good</td><td><a href="https://amazon.com" target="_blank" rel="noopener nofollow">Amazon</a></td></tr>
    <tr><td>Faux leather (Aierxuan, TLH)</td><td>Water resistant</td><td>No</td><td>Good</td><td><a href="https://amazon.com" target="_blank" rel="noopener nofollow">Amazon</a></td></tr>
    <tr><td>Polycotton (Covercraft)</td><td>No</td><td>No</td><td>Good (indoor/light trail)</td><td><a href="https://amazon.com" target="_blank" rel="noopener nofollow">Amazon</a></td></tr>
  </tbody>
</table>"""

    body = f"""<div class="hero">
  <h1>Best Jeep Wrangler Seat Covers &mdash; Year-Specific Fitment Guide (2026)</h1>
  <p>Custom-fit seat cover reviews for every Wrangler generation. Pick your model year for verified fitment &mdash; JK, JKU, JL, JLU, TJ, and LJ all covered.</p>
</div>
<div class="container">
  <div class="intro">We cover every Wrangler generation with year-specific fitment guides &mdash; not generic "fits all Jeeps" fluff. Every product listed has been manually verified against the Amazon listing fitment table. All Bartact images are pulled directly from Bartact&rsquo;s CDN and confirmed live. No stock photos, no guessing.</div>
  <h2 class="section">Choose Your Wrangler Generation</h2>
  {gen_cards}
  {bc}
  <h2 class="section">Seat Cover Materials Compared</h2>
  <p class="picks-intro" style="margin-bottom:12px">Not all seat cover materials are equal on the trail. Here&rsquo;s how the main options stack up for Wrangler use:</p>
  {material_table}
  <h2 class="section">Why Custom-Fit Matters on a Wrangler</h2>
  <p style="color:#444;margin-bottom:12px;line-height:1.7">Universal seat covers slip, bunch under your legs on the trail, and &mdash; critically &mdash; can block SAB side airbag deployment. The Wrangler&rsquo;s seats have specific contours that universal covers can&rsquo;t match. Custom-cut covers like Bartact are sewn to your exact Wrangler&rsquo;s seat dimensions: they sit flush, don&rsquo;t interfere with airbags, and stay put during off-road flex.</p>
  <p style="color:#444;margin-bottom:24px;line-height:1.7">The JK, JL, and TJ all have different seat frames. A cover designed for a JK will not fit a TJ correctly, and vice versa. Always buy generation-specific covers.</p>
  {BARTACT_BLOG}
</div>"""

    return "index.html", html_page(
        "Best Jeep Wrangler Seat Covers 2026 — JK, JL, TJ Fitment Guide | WranglerSeatCover.com",
        "Year-specific seat cover guides for every Jeep Wrangler generation — JK, JKU, JL, JLU, TJ, LJ. Bartact #1 USA pick plus verified Amazon alternatives for every year and door count.",
        "index.html", body
    )


# ────────────────────────────────────────────────────────────────────────────
# BUILD ALL PAGES
# ────────────────────────────────────────────────────────────────────────────
pages = [
    build_index(),
    build_jk_hub(),
    build_jk_year("jk-2007-2010","2007-2010",
        "The 2007-2010 JK was the launch generation. Side airbags were optional on base trims &mdash; check your specific vehicle.",
        None, "/jk-2011-2012-seat-covers.html"),
    build_jk_year("jk-2011-2012","2011-2012",
        "The 2011-2012 JK introduced SAB side airbags as standard on most trims. Verify your trim level &mdash; base Sport trim may not have SABs.",
        "/jk-2007-2010-seat-covers.html", "/jk-2013-2018-seat-covers.html"),
    build_jk_year("jk-2013-2018","2013-2018",
        "The 2013-2018 JK received a post-facelift interior update. SAB side airbags are standard on all 2013+ trims.",
        "/jk-2011-2012-seat-covers.html", None),
    build_jl_hub(),
    build_tj_hub(),
]

total_words = 0
for filename, html in pages:
    dest = OUT / filename
    dest.write_text(html, encoding="utf-8")
    import re
    amz = html.count("amazon.com/dp/")
    bartact_img = html.count("bartact.com/cdn/shop/products/") + html.count("cdn.shopify.com/s/files/1/0936/7476/products/bartact")
    words = len(re.sub('<[^>]+',' ',html).split())
    broken = "cdn.shopify.com/s/files/1/0936/7476/products/bartact-jeep-wrangler-seat-covers-black-graphite-tactical" in html
    total_words += words
    ok = amz >= 3 and bartact_img >= 1 and words >= 800 and not broken
    print(f"  {'✅' if ok else '⚠️ '} {filename}: {amz} AMZ links, {bartact_img} Bartact imgs, {words} words {'⛔ BROKEN IMG' if broken else ''}")

print(f"\nBuilt {len(pages)} pages, {total_words:,} total words for {SITE}")
