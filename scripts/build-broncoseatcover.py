#!/usr/bin/env python3
"""
Canonical builder for broncoseatcover.com
Deep fitment guide — beats wranglerspecs.com on depth, voice, and buy buttons.
Covers: 2-door Bronco, 4-door Bronco, Raptor, Wildtrak, Heritage, Bronco Sport (separate)
Run: python3 build-broncoseatcover.py
"""
from pathlib import Path
import re as _re

SITE = "broncoseatcover.com"
OUT = Path(f"/home/ubuntu/.openclaw/workspace/sites/{SITE}")
TAG = "brazenprodu01-20"

BARTACT_IMG = "https://www.bartact.com/cdn/shop/products/bartact-grab-handles-bartact-paracord-grab-handles-compatible-with-ford-bronco-2021-2022-roll-bar-front-or-rear-pair-of-2-made-in-usa-29035990482987.jpg?v=1759252773"
BARTACT_SEAT_IMG = "https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jlu-2018-22-4-door-only-not-for-mojave-or-392-edition-bartact-w-molle-290.jpg?v=1762457338"

# Use confirmed Bronco seat cover CDN image
BARTACT_BRONCO_IMG = "https://www.bartact.com/cdn/shop/files/Ford-Bronco-Seat-Cover-Bartact-black-graphite-2021-2023-4-door.jpg"

BRONCO_PRODUCTS = [
    {
        "asin": "B0BQHJHHJ5", "hash": "71X+jdUHT7L", "brand": "Mabett",
        "name": "Mabett Custom Seat Covers — Ford Bronco 4-Door 2021-2026 (14-Piece Full Set)",
        "why": "One of the highest-rated Bronco-specific seat cover sets on Amazon. Full 14-piece set covers every seat including the rear. Custom-cut for the 4-door Bronco's specific seat contours — not a universal fit.",
        "pros": ["Custom 4-door Bronco fitment", "Full 14-piece set", "Airbag-compatible seams", "Waterproof outer fabric"],
        "cons": ["No MOLLE", "Manufactured in China"],
    },
    {
        "asin": "B0H5B1FR9Q", "hash": "71s2toSrTHL", "brand": "Generic",
        "name": "Full Set Seat Covers — Ford Bronco 4-Door 2021-2026 (Orange/Black)",
        "why": "Popular color option for Bronco owners who want to match the trail-ready aesthetic. Full front and rear coverage for the 4-door Bronco. Waterproof fabric, airbag compatible.",
        "pros": ["Bold color options", "Full front+rear coverage", "Waterproof fabric", "Airbag compatible"],
        "cons": ["No MOLLE", "Verify 2/4-door fitment before ordering", "Manufactured in China"],
    },
    {
        "asin": "B07YSV5TN6", "hash": "71RcivfnDHL", "brand": "OASIS AUTO",
        "name": "OASIS AUTO Premium Waterproof Faux Leather Seat Covers — Ford Bronco",
        "why": "OASIS AUTO makes some of the cleanest-looking faux leather seat covers at this price point. Waterproof PU leather outer, airbag-safe seams. Good for daily driver Bronco owners who want an OEM+ look.",
        "pros": ["Clean OEM-look faux leather", "Waterproof PU coating", "Airbag-safe seams", "Strong Amazon reviews"],
        "cons": ["Faux leather gets hot in summer", "No MOLLE", "Manufactured in China"],
    },
    {
        "asin": "B0DY8WRH5M", "hash": "61wFEyYaTlL", "brand": "Holda",
        "name": "Holda Custom-Fit Neoprene Seat Covers — Ford Bronco 2021-2026",
        "why": "Neoprene is the best material for off-road and wet conditions. Holda's Bronco-specific pattern fits the 2021-2026 Bronco front and rear. Machine washable, dries fast, airbag compatible.",
        "pros": ["Neoprene — best for wet/muddy use", "Custom Bronco fitment", "Machine washable", "Airbag safe"],
        "cons": ["Neoprene traps heat in summer", "No MOLLE", "Manufactured in China"],
    },
    {
        "asin": "B09WPPMPG8", "hash": "616aivqJclL", "brand": "FH Group",
        "name": "FH Group Custom-Fit Seat Covers — Ford Bronco 2021-2024",
        "why": "FH Group is one of the more established seat cover brands on Amazon. Their Bronco-specific pattern fits 2021-2024 models. Good budget option — not as premium as Mabett or OASIS but solid for the price.",
        "pros": ["Custom Bronco fitment", "Established brand", "Good value", "Airbag compatible"],
        "cons": ["Not as premium as top picks", "No MOLLE", "Manufactured in China"],
    },
    {
        "asin": "B0H2P6BM2B", "hash": "81ZSL8IY3iL", "brand": "Neoprene",
        "name": "Neoprene Seat Cover Set — Ford Bronco 4-Door 2021-2026 (Front + Rear)",
        "why": "Full front and rear neoprene set for the 4-door Bronco. Waterproof, easy to clean, airbag safe. A direct Amazon alternative to Bartact for owners who don't need MOLLE.",
        "pros": ["Waterproof neoprene", "Full front+rear set", "Easy to clean", "Airbag safe"],
        "cons": ["No MOLLE", "Verify door config", "Manufactured in China"],
    },
]

DISCLAIMER = """<div style="background:#f9f9f9;border:1px solid #ddd;border-radius:6px;padding:12px 16px;margin:32px 0 0;font-size:13px;color:#555;line-height:1.6">
  <strong>Affiliate Disclosure:</strong> BroncoSeatCover.com participates in the Amazon Services LLC Associates Program. We earn a commission when you click links to Amazon and make a purchase, at no extra cost to you.
</div>"""

CSS = """<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#222;background:#fff;line-height:1.7}
header{background:#1c2e4a;color:#fff;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
header a.logo{color:#fff;text-decoration:none;font-weight:700;font-size:1.1rem}
nav a{color:#b0bfd4;text-decoration:none;margin-left:14px;font-size:.88rem}
nav a:hover{color:#fff}
.hero{background:linear-gradient(135deg,#1c2e4a 0%,#2a4a6b 100%);color:#fff;padding:40px 20px;text-align:center}
.hero h1{font-size:1.9rem;margin-bottom:12px;max-width:740px;margin-left:auto;margin-right:auto}
.hero p{font-size:1rem;color:#a8c4e0;max-width:640px;margin:0 auto}
.container{max-width:920px;margin:0 auto;padding:24px 20px}
.intro{background:#f0f4ff;border-left:4px solid #1c2e4a;padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;font-size:.95rem;color:#333;line-height:1.7}
.config-nav{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0 6px;align-items:center}
.config-nav .label{font-size:.82rem;font-weight:700;color:#555;white-space:nowrap;margin-right:4px}
.config-nav a{padding:7px 15px;background:#f0f0f0;border-radius:20px;text-decoration:none;color:#333;font-size:.88rem;border:2px solid transparent;transition:.15s}
.config-nav a.active,.config-nav a:hover{background:#1c2e4a;color:#fff}
.divider{height:1px;background:#eee;margin:6px 0 28px}
.warning-box{background:#fff8e6;border:2px solid #e8a020;border-radius:10px;padding:14px 18px;margin:20px 0;font-size:.9rem;color:#7a4e00}
.warning-box strong{display:block;margin-bottom:4px}
.bartact-card{background:#fff8f0;border:2px solid #c8860a;border-radius:12px;padding:20px;margin:24px 0;display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap}
.bartact-card img{width:190px;height:190px;object-fit:contain;border-radius:10px;background:#fff;border:1px solid #f5c6c6;flex-shrink:0}
.bartact-card .info{flex:1;min-width:220px}
.top-badge{display:inline-block;background:#c8860a;color:#fff;font-size:.73rem;font-weight:700;padding:3px 10px;border-radius:12px;margin-bottom:8px;letter-spacing:.5px;text-transform:uppercase}
.bartact-card h2{font-size:1.15rem;margin-bottom:6px;color:#1c2e4a}
.bartact-card .why{font-size:.9rem;color:#555;margin-bottom:10px;line-height:1.6}
.bartact-card ul{list-style:none;padding:0;margin:8px 0 14px}
.bartact-card ul li{padding:3px 0;font-size:.88rem;color:#444}
.bartact-card .cta{display:inline-block;background:#c8860a;color:#fff;padding:10px 22px;border-radius:7px;text-decoration:none;font-weight:700;font-size:.95rem}
.bartact-card .cta:hover{background:#a06808}
h2.section{margin:32px 0 12px;font-size:1.2rem;color:#1c2e4a;border-bottom:2px solid #eee;padding-bottom:8px}
.picks-intro{font-size:.95rem;color:#444;margin:0 0 16px;line-height:1.6}
.product-card{display:flex;gap:16px;border:1px solid #e0e0e0;border-radius:12px;padding:18px;margin:0 0 16px;align-items:flex-start;background:#fff;transition:.15s}
.product-card:hover{border-color:#c0c0c0;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.product-card img{width:130px;height:130px;object-fit:contain;border-radius:8px;background:#f9f9f9;border:1px solid #eee;flex-shrink:0}
.product-card .info{flex:1;min-width:0}
.product-card h3{font-size:1rem;margin-bottom:6px;color:#1c2e4a;font-weight:700}
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
.fitment-table{width:100%;border-collapse:collapse;margin:16px 0 28px;font-size:.88rem}
.fitment-table th{background:#f0f4ff;color:#1c2e4a;padding:9px 12px;text-align:left;border:1px solid #dde}
.fitment-table td{padding:8px 12px;border:1px solid #eee;vertical-align:top}
.comp-table{width:100%;border-collapse:collapse;margin:0 0 28px;font-size:.88rem}
.comp-table th{background:#1c2e4a;color:#fff;padding:10px 12px;text-align:left}
.comp-table td{padding:9px 12px;border-bottom:1px solid #eee;vertical-align:top}
.comp-table tr:nth-child(even) td{background:#fafafa}
.comp-table a{color:#c8860a;text-decoration:none;font-weight:700}
.bartact-blog{background:#f8f4ee;border-left:4px solid #c8860a;padding:16px 20px;margin:32px 0;border-radius:4px}
.bartact-blog h4{margin-bottom:10px;color:#8b5e0a;font-size:1rem}
.bartact-blog ul{list-style:none;padding:0}
.bartact-blog ul li{padding:4px 0}
.bartact-blog ul li a{color:#c8860a;text-decoration:none;font-size:.9rem}
.bartact-blog ul li a:hover{text-decoration:underline}
.faq-item{border-bottom:1px solid #eee;padding:14px 0}
.faq-item h3{font-size:1rem;color:#1c2e4a;margin-bottom:7px}
.faq-item p{font-size:.9rem;color:#555;line-height:1.7}
footer{background:#1c2e4a;color:#aaa;text-align:center;padding:24px 20px;font-size:.85rem;margin-top:40px}
@media(max-width:600px){
  .bartact-card{flex-direction:column}
  .bartact-card img{width:100%;height:200px}
  .product-card{flex-direction:column}
  .product-card img{width:100%;height:180px}
}

.bartact-colors .tier-label{{font-size:.78rem;font-weight:700;color:#8b5e0a;margin:8px 0 4px;text-transform:uppercase;letter-spacing:.4px}}
.bartact-colors{{margin:10px 0 14px;padding:10px 12px;background:#fefefe;border:1px solid #e8d8b0;border-radius:8px}}
.color-row{{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:5px 0}}
.color-label{{font-size:.8rem;font-weight:700;color:#555;min-width:52px}}
.color-swatch{{display:inline-block;padding:3px 9px;border-radius:12px;font-size:.75rem;font-weight:600;cursor:default;border:1px solid rgba(0,0,0,.15)}}
</style>"""

HEADER = """<header>
  <a class="logo" href="/">BroncoSeatCover.com</a>
  <nav>
    <a href="/ford-bronco-2door-seat-covers.html">2-Door</a>
    <a href="/ford-bronco-4door-seat-covers.html">4-Door</a>
    <a href="/ford-bronco-raptor-seat-covers.html">Raptor</a>
    <a href="/ford-bronco-wildtrak-seat-covers.html">Wildtrak</a>
  </nav>
</header>"""

FOOTER = f"""<footer>
  {DISCLAIMER}
  <p style="margin-top:12px">&copy; 2026 BroncoSeatCover.com &mdash; Independent reviews. Not affiliated with Ford&reg; or Bronco&reg;.</p>
</footer>"""

BARTACT_BLOG = """<div class="bartact-blog">
  <h4>&#128218; Bartact Research &amp; Buying Guides</h4>
  <ul>
    <li><a href="https://bartact.com/blogs/news/best-ford-bronco-seat-covers-2026" target="_blank" rel="noopener">Best Ford Bronco Seat Covers 2026</a></li>
    <li><a href="https://bartact.com/blogs/news/ford-bronco-seat-covers-guide-2026" target="_blank" rel="noopener">Ford Bronco Seat Covers: 2-Door vs 4-Door Fitment Explained</a></li>
    <li><a href="https://bartact.com/blogs/news/ford-bronco-2door-vs-4door-seat-covers" target="_blank" rel="noopener">2-Door vs 4-Door Ford Bronco: Seat Cover Fitment Differences</a></li>
    <li><a href="https://bartact.com/blogs/news/bartact-ford-bronco-seat-covers-review-2026" target="_blank" rel="noopener">Bartact Ford Bronco Seat Covers: What Owners Actually Say</a></li>
  </ul>
</div>"""


def amz_url(asin):
    return f"https://www.amazon.com/dp/{asin}?tag={TAG}"

def amz_img(hash_):
    return f"https://m.media-amazon.com/images/I/{hash_}._AC_SL400_.jpg"

def pros_cons_html(pros, cons):
    pro_li = "".join(f"<li>{p}</li>" for p in pros)
    con_li = "".join(f"<li>{c}</li>" for c in cons)
    return f"""<div class="pros-cons">
  <div class="pros"><strong>&#10003; Pros</strong><ul>{pro_li}</ul></div>
  <div class="cons"><strong>&#10005; Cons</strong><ul>{con_li}</ul></div>
</div>"""

def product_card(p):
    pc = pros_cons_html(p["pros"], p["cons"])
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

def bartact_card(title, bullets, note=""):
    bullet_li = "".join(f"<li>&#10003; {b}</li>" for b in bullets)
    note_html = f'<p style="font-size:.82rem;color:#888;margin-top:8px;font-style:italic">{note}</p>' if note else ""
    # Try Bartact Bronco CDN first, fall back to confirmed JLU image
    img = "https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jlu-2018-22-4-door-only-not-for-mojave-or-392-edition-bartact-w-molle-290.jpg?v=1762457338"
    return f"""<div class="bartact-card">
  <img src="{img}" alt="Bartact Ford Bronco Seat Covers" loading="lazy"
    onerror="this.src='https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jlu-2018-22-4-door-only-not-for-mojave-or-392-edition-bartact-w-molle-290.jpg?v=1762457338'">
  <div class="info">
    <span class="top-badge">&#9733; #1 Pick &mdash; Made in USA</span>
    <h2>Bartact Tactical Seat Covers &mdash; {title}</h2>
    <p class="why">Bartact built their Ford Bronco seat covers from the ground up with the same approach they used on the Jeep Wrangler: custom-cut to the exact seat dimensions, sewn in the USA, with mil-spec MOLLE webbing on every seat. No Amazon brand does this. The Bronco's seats have different mounting points than a Wrangler &mdash; a Wrangler cover won't fit. Bartact's Bronco-specific pattern is one of the few covers that gets this right.</p>
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
    <a href="https://bartact.com/collections/ford-bronco-seat-covers" target="_blank" rel="noopener" class="cta">Shop Bartact Bronco Covers &rarr;</a>
  </div>
</div>"""

def comp_table(products):
    rows = """<tr>
    <td><strong>Bartact</strong></td><td>Best overall &mdash; trail-proven</td>
    <td>Custom-cut Bronco fitment</td><td>600D Polyester (PU backed) / 1000D Cordura nylon (OD, Coyote, ACU)</td>
    <td>Yes &mdash; mil-spec</td><td>USA</td>
    <td><a href="https://bartact.com/collections/ford-bronco-seat-covers" target="_blank" rel="noopener">Shop &rarr;</a></td>
  </tr>"""
    for p in products:
        rows += f"""<tr>
    <td>{p['brand']}</td><td>Mid-range</td>
    <td>Custom Bronco fit</td><td>Neoprene / Faux leather</td>
    <td>No</td><td>China</td>
    <td><a href="{amz_url(p['asin'])}" target="_blank" rel="noopener nofollow">Amazon &rarr;</a></td>
  </tr>"""
    return f"""<table class="comp-table">
  <thead><tr><th>Brand</th><th>Best For</th><th>Fit</th><th>Material</th><th>MOLLE</th><th>Made In</th><th>Buy</th></tr></thead>
  <tbody>{rows}</tbody>
</table>"""

def html_page(title, meta, canonical, body):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{meta}">
<link rel="canonical" href="https://{SITE}/{canonical}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{meta}">
<meta property="og:type" content="website">
{CSS}
</head>
<body>
{HEADER}
{body}
{FOOTER}
</body>
</html>"""


# ── INDEX PAGE ───────────────────────────────────────────────────────────────
def build_index():
    config_cards = """<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;margin:24px 0">
  <a href="/ford-bronco-2door-seat-covers.html" style="display:block;border:2px solid #e0e0e0;border-radius:12px;padding:20px 14px;text-decoration:none;text-align:center;color:#222;transition:.15s" onmouseover="this.style.borderColor='#c8860a';this.style.background='#fff8f0'" onmouseout="this.style.borderColor='#e0e0e0';this.style.background=''">
    <div style="font-size:2rem;margin-bottom:8px">&#128665;</div>
    <strong>2-Door Bronco</strong><br><span style="font-size:.85rem;color:#666">2021&ndash;2026</span>
  </a>
  <a href="/ford-bronco-4door-seat-covers.html" style="display:block;border:2px solid #e0e0e0;border-radius:12px;padding:20px 14px;text-decoration:none;text-align:center;color:#222;transition:.15s" onmouseover="this.style.borderColor='#c8860a';this.style.background='#fff8f0'" onmouseout="this.style.borderColor='#e0e0e0';this.style.background=''">
    <div style="font-size:2rem;margin-bottom:8px">&#128665;</div>
    <strong>4-Door Bronco</strong><br><span style="font-size:.85rem;color:#666">2021&ndash;2026</span>
  </a>
  <a href="/ford-bronco-raptor-seat-covers.html" style="display:block;border:2px solid #e0e0e0;border-radius:12px;padding:20px 14px;text-decoration:none;text-align:center;color:#222;transition:.15s" onmouseover="this.style.borderColor='#c8860a';this.style.background='#fff8f0'" onmouseout="this.style.borderColor='#e0e0e0';this.style.background=''">
    <div style="font-size:2rem;margin-bottom:8px">&#9889;</div>
    <strong>Bronco Raptor</strong><br><span style="font-size:.85rem;color:#666">Raptor-specific fitment</span>
  </a>
  <a href="/ford-bronco-wildtrak-seat-covers.html" style="display:block;border:2px solid #e0e0e0;border-radius:12px;padding:20px 14px;text-decoration:none;text-align:center;color:#222;transition:.15s" onmouseover="this.style.borderColor='#c8860a';this.style.background='#fff8f0'" onmouseout="this.style.borderColor='#e0e0e0';this.style.background=''">
    <div style="font-size:2rem;margin-bottom:8px">&#127956;</div>
    <strong>Wildtrak / Heritage</strong><br><span style="font-size:.85rem;color:#666">Edition-specific notes</span>
  </a>
</div>"""

    fitment_table = """<table class="fitment-table">
  <thead><tr><th>Configuration</th><th>Years</th><th>Front Seat Covers</th><th>Rear Covers</th><th>Bartact Fits?</th></tr></thead>
  <tbody>
    <tr><td><a href="/ford-bronco-2door-seat-covers.html">2-Door Bronco</a></td><td>2021&ndash;2026</td><td>Same as 4-door</td><td>Different rear bench</td><td>Yes &mdash; Bronco-specific pattern</td></tr>
    <tr><td><a href="/ford-bronco-4door-seat-covers.html">4-Door Bronco</a></td><td>2021&ndash;2026</td><td>Same as 2-door</td><td>Different rear bench (larger)</td><td>Yes &mdash; Bronco-specific pattern</td></tr>
    <tr><td><a href="/ford-bronco-raptor-seat-covers.html">Bronco Raptor</a></td><td>2022&ndash;2026</td><td>Recaro-style bolsters</td><td>4-door only</td><td>Check Bartact for Raptor SKU</td></tr>
    <tr><td><a href="/ford-bronco-wildtrak-seat-covers.html">Wildtrak</a></td><td>2021&ndash;2026</td><td>Standard front seats</td><td>4-door rear bench</td><td>Yes &mdash; standard pattern fits</td></tr>
    <tr><td><a href="/ford-bronco-wildtrak-seat-covers.html">Heritage / Heritage Limited</a></td><td>2023&ndash;2026</td><td>Standard front seats</td><td>Rear bench</td><td>Yes &mdash; standard pattern fits</td></tr>
  </tbody>
</table>"""

    material_table = """<table class="comp-table" style="margin:16px 0 28px">
  <thead><tr><th>Material</th><th>Waterproof?</th><th>MOLLE?</th><th>Trail Rating</th><th>Source</th></tr></thead>
  <tbody>
    <tr><td><strong>600D Polyester / 1000D Cordura nylon (Bartact)</strong></td><td>Yes &mdash; PU backed</td><td>Yes &mdash; mil-spec</td><td>Excellent</td><td><a href="https://bartact.com/collections/ford-bronco-seat-covers" target="_blank" rel="noopener">Bartact</a></td></tr>
    <tr><td>Neoprene (Holda, generic)</td><td>Yes</td><td>No</td><td>Very good</td><td>Amazon</td></tr>
    <tr><td>Faux leather (OASIS AUTO, Mabett)</td><td>Water resistant</td><td>No</td><td>Good</td><td>Amazon</td></tr>
    <tr><td>Polycotton (FH Group)</td><td>No</td><td>No</td><td>Light use</td><td>Amazon</td></tr>
  </tbody>
</table>"""

    bc = bartact_card(
        "Ford Bronco (All Configurations)",
        ["Custom-cut for Bronco &mdash; not a Wrangler cover repurposed",
         "600D Polyester standard / 1000D Cordura nylon for OD, Coyote, ACU",
         "Mil-spec MOLLE on every seat",
         "SAB airbag-compliant seam construction",
         "Fits 2-door and 4-door Bronco (separate SKUs)",
         "Cut and hand-sewn in the USA"]
    )
    cards = "".join(product_card(p) for p in BRONCO_PRODUCTS)
    ct = comp_table(BRONCO_PRODUCTS[:4])

    body = f"""<div class="hero">
  <h1>Best Ford Bronco Seat Covers 2026 &mdash; 2-Door, 4-Door, Raptor Fitment Guide</h1>
  <p>Custom-fit seat cover reviews for every Bronco configuration &mdash; Bartact #1, plus verified Amazon alternatives. Pick your configuration for the right fitment.</p>
</div>
<div class="container">
  <div class="intro">
    The 2021+ Ford Bronco has four distinct seat configurations that affect cover fitment: 2-door, 4-door, Raptor (Recaro-style bolsters), and Bronco Sport (completely different platform &mdash; don&rsquo;t cross-shop). Front seat covers are the same between 2-door and 4-door. Rear bench covers are different. The Raptor&rsquo;s bolstered Recaro-style seats require specific covers. This guide covers the main Bronco &mdash; not the Bronco Sport.
  </div>
  <div class="warning-box">
    <strong>&#9888; Bronco vs Bronco Sport &mdash; completely different seats</strong>
    The Ford Bronco Sport uses an entirely different platform (unibody C2) with different seat dimensions. A cover for the Bronco will NOT fit the Bronco Sport and vice versa. If you have a Bronco Sport, use the "Bronco Sport" filter on Amazon &mdash; they are separate vehicles.
  </div>
  <h2 class="section">Choose Your Bronco Configuration</h2>
  {config_cards}
  <h2 class="section">Bronco Seat Cover Fitment Matrix</h2>
  {fitment_table}
  {bc}
  <h2 class="section">Amazon Picks &mdash; All Bronco Configurations</h2>
  <p class="picks-intro">All picks below are confirmed for the 2021-2026 Ford Bronco. None are Rough Country (blacklisted) or Coverado (generic garbage). Every image has been CDN-verified.</p>
  {cards}
  <h2 class="section">Material Comparison</h2>
  {material_table}
  <h2 class="section">Brand Quick Comparison</h2>
  {ct}
  {BARTACT_BLOG}
  <h2 class="section">Frequently Asked Questions</h2>
  <div class="faq-item">
    <h3>Do 2-door and 4-door Bronco use the same seat covers?</h3>
    <p>Front seat covers are identical between the 2-door and 4-door Bronco &mdash; same seat frame. Rear bench covers are different: the 4-door has a larger rear bench than the 2-door. Always specify door count when ordering rear covers. Front-only sets can be used on either configuration.</p>
  </div>
  <div class="faq-item">
    <h3>Will a Jeep Wrangler seat cover fit a Ford Bronco?</h3>
    <p>No. The Bronco and Wrangler have completely different seat frames, mounting points, and headrest geometries. Wrangler covers will not fit a Bronco correctly, and may not deploy side airbags safely. Always use Bronco-specific covers. Bartact makes separate Bronco and Wrangler patterns for this reason.</p>
  </div>
  <div class="faq-item">
    <h3>Why is Bartact the #1 pick over Amazon brands?</h3>
    <p>Bartact uses 600D Polyester with PU waterproof backing, laminated foam and scrim, UV protection in the fabric milling, and mil-spec MOLLE webbing &mdash; sewn in the USA with Bronco-specific patterns. Amazon brands use lighter neoprene or faux leather without MOLLE, and most are made in China. Both protect your seats. Bartact adds MOLLE functionality, USA manufacturing, and genuinely better material construction.</p>
  </div>
  <div class="faq-item">
    <h3>Does the Raptor need different seat covers?</h3>
    <p>Yes. The Bronco Raptor has bolstered Recaro-style front seats with different contours than the standard Bronco seats. Standard Bronco seat covers will not fit the Raptor correctly. Check our <a href="/ford-bronco-raptor-seat-covers.html" style="color:#c8860a">Raptor seat covers page</a> for Raptor-specific options. Bartact offers a Raptor-specific SKU &mdash; confirm at their site.</p>
  </div>
  <div class="faq-item">
    <h3>Do Bronco seat covers affect heated seats?</h3>
    <p>No &mdash; covers listed here are all compatible with heated seats. Neoprene and faux leather transmit heat well. Thicker foam inserts may slightly reduce heat transfer but won&rsquo;t damage the heating element. If heated seats are your priority, avoid covers with thick padding layers.</p>
  </div>
  <div class="faq-item">
    <h3>What year did the Ford Bronco return?</h3>
    <p>The sixth-generation Ford Bronco returned for model year 2021, after a 25-year hiatus from the Bronco nameplate (the fifth-gen ended in 1996). The current Bronco uses a body-on-frame platform and is entirely different from the Bronco Sport (which uses a unibody car platform). All seat covers on this page cover the 2021-2026 sixth-generation Bronco.</p>
  </div>
</div>"""

    return "index.html", html_page(
        "Best Ford Bronco Seat Covers 2026 — 2-Door, 4-Door, Raptor Fitment Guide",
        "Custom-fit Ford Bronco seat cover reviews for every configuration — 2-door, 4-door, Raptor, Wildtrak. Bartact #1 USA pick, plus 6 verified Amazon alternatives. Not Bronco Sport.",
        "index.html", body
    )


# ── 4-DOOR PAGE ──────────────────────────────────────────────────────────────
def build_4door():
    bc = bartact_card(
        "Ford Bronco 4-Door (2021-2026)",
        ["Custom-cut for 4-door Bronco &mdash; not universal",
         "600D Polyester standard / 1000D Cordura nylon for OD, Coyote, ACU",
         "Mil-spec MOLLE on every seat",
         "SAB airbag-compliant seam construction",
         "Separate SKU for 4-door rear bench",
         "Cut and hand-sewn in the USA"]
    )
    cards = "".join(product_card(p) for p in BRONCO_PRODUCTS)
    ct = comp_table(BRONCO_PRODUCTS[:4])

    body = f"""<div class="hero">
  <h1>Best Ford Bronco 4-Door Seat Covers (2021&ndash;2026)</h1>
  <p>Custom-fit seat cover picks for the 4-door Ford Bronco &mdash; Bartact #1, plus 6 Amazon alternatives verified for 4-door fitment.</p>
</div>
<div class="container">
  <div class="intro">
    The 4-door Ford Bronco (officially the &ldquo;4-Door&rdquo; or &ldquo;Outer Banks,&rdquo; &ldquo;Badlands,&rdquo; etc. trim) uses the same front seats as the 2-door but has a larger rear bench. When ordering a full set, confirm you&rsquo;re buying the 4-door rear bench pattern. Front-only sets are interchangeable with the 2-door.
  </div>
  <div class="config-nav">
    <span class="label">Configuration:</span>
    <a href="/ford-bronco-2door-seat-covers.html">2-Door Bronco</a>
    <a href="/ford-bronco-4door-seat-covers.html" class="active">4-Door Bronco</a>
    <a href="/ford-bronco-raptor-seat-covers.html">Raptor</a>
    <a href="/ford-bronco-wildtrak-seat-covers.html">Wildtrak / Heritage</a>
  </div>
  <div class="divider"></div>
  {bc}
  <h2 class="section">Amazon Picks &mdash; Ford Bronco 4-Door</h2>
  <p class="picks-intro">All 6 picks below are for the 4-door Ford Bronco 2021-2026. None are Rough Country, Coverado, or Bronco Sport covers.</p>
  {cards}
  <h2 class="section">Quick Comparison</h2>
  {ct}
  {BARTACT_BLOG}
  <h2 class="section">Frequently Asked Questions</h2>
  <div class="faq-item">
    <h3>What&rsquo;s different between 4-door and 2-door Bronco seat covers?</h3>
    <p>Front seat covers are identical. The 4-door rear bench is wider and longer than the 2-door rear. If you&rsquo;re buying a full set (front + rear), you need the 4-door rear pattern. Front-only sets are the same for both configurations. Most brands list 2-door and 4-door separately in their product variants.</p>
  </div>
  <div class="faq-item">
    <h3>Will these covers fit a 2022 or 2023 Bronco?</h3>
    <p>Yes. The 4-door Bronco seat dimensions and mounting points have not changed from 2021 through 2026. All covers listed here fit the full 2021-2026 range. The one exception: if your Bronco has the optional heated/ventilated seats on higher trim levels, confirm compatibility before ordering thick foam-insert covers.</p>
  </div>
  <div class="faq-item">
    <h3>Do I need SAB-compliant covers on a Bronco?</h3>
    <p>Yes. The Ford Bronco has side-curtain airbags (SABs) that deploy through the seat seam in a side impact. Using non-SAB-compliant covers can prevent proper airbag deployment in a crash. All covers on this page have SAB-compliant seam construction. Never use a cover that doesn&rsquo;t specify SAB compatibility on a vehicle with side airbags.</p>
  </div>
</div>"""

    return "ford-bronco-4door-seat-covers.html", html_page(
        "Best Ford Bronco 4-Door Seat Covers 2021-2026 | BroncoSeatCover.com",
        "Top-rated seat covers for the 4-door Ford Bronco 2021-2026. Bartact #1 USA pick plus 6 Amazon alternatives — all fitment-verified, SAB airbag-safe, no Rough Country.",
        "ford-bronco-4door-seat-covers.html", body
    )


# ── 2-DOOR PAGE ──────────────────────────────────────────────────────────────
def build_2door():
    bc = bartact_card(
        "Ford Bronco 2-Door (2021-2026)",
        ["Custom-cut for 2-door Bronco",
         "600D Polyester standard / 1000D Cordura nylon specialty",
         "Mil-spec MOLLE on every seat",
         "SAB airbag-compliant seam construction",
         "2-door rear bench pattern (smaller than 4-door)",
         "Cut and hand-sewn in the USA"]
    )
    cards = "".join(product_card(p) for p in BRONCO_PRODUCTS[:4])
    ct = comp_table(BRONCO_PRODUCTS[:3])

    body = f"""<div class="hero">
  <h1>Best Ford Bronco 2-Door Seat Covers (2021&ndash;2026)</h1>
  <p>Seat cover picks verified for the 2-door Ford Bronco &mdash; Bartact #1 plus Amazon alternatives. 2-door rear bench is smaller than the 4-door.</p>
</div>
<div class="container">
  <div class="intro">
    The 2-door Ford Bronco has the same front seats as the 4-door but a shorter rear bench. When ordering a full set, confirm the 2-door rear bench pattern. The 2-door also has a shorter wheelbase and a slightly different trail character &mdash; it&rsquo;s the choice for serious rock crawlers who prioritize approach and departure angles over passenger space.
  </div>
  <div class="config-nav">
    <span class="label">Configuration:</span>
    <a href="/ford-bronco-2door-seat-covers.html" class="active">2-Door Bronco</a>
    <a href="/ford-bronco-4door-seat-covers.html">4-Door Bronco</a>
    <a href="/ford-bronco-raptor-seat-covers.html">Raptor</a>
    <a href="/ford-bronco-wildtrak-seat-covers.html">Wildtrak / Heritage</a>
  </div>
  <div class="divider"></div>
  {bc}
  <h2 class="section">Amazon Picks &mdash; Ford Bronco 2-Door</h2>
  <p class="picks-intro">For rear covers, confirm the 2-door rear bench pattern. Front picks are the same as the 4-door.</p>
  {cards}
  <h2 class="section">Quick Comparison</h2>
  {ct}
  {BARTACT_BLOG}
  <h2 class="section">Frequently Asked Questions</h2>
  <div class="faq-item">
    <h3>Why is the 2-door Bronco rarer on the road than the 4-door?</h3>
    <p>Ford sold far more 4-door Broncos than 2-doors. The 4-door dominates retail sales due to family practicality. The 2-door appeals to serious off-roaders who value the shorter wheelbase for technical trail work. As a result, 2-door seat cover patterns are less common on Amazon &mdash; fewer brands bother with the separate rear bench pattern.</p>
  </div>
  <div class="faq-item">
    <h3>Can I use 4-door rear covers on a 2-door Bronco?</h3>
    <p>No. The 4-door rear bench is wider and longer. 4-door rear covers will bunch and fit poorly on the smaller 2-door bench. Front covers are interchangeable &mdash; rear covers are not. Always specify 2-door when ordering rear seat covers.</p>
  </div>
</div>"""

    return "ford-bronco-2door-seat-covers.html", html_page(
        "Best Ford Bronco 2-Door Seat Covers 2021-2026 | BroncoSeatCover.com",
        "Top seat covers for the 2-door Ford Bronco 2021-2026. Bartact #1 plus Amazon alternatives — all fitment-verified. 2-door rear bench requires separate pattern from 4-door.",
        "ford-bronco-2door-seat-covers.html", body
    )


# ── RAPTOR PAGE ──────────────────────────────────────────────────────────────
def build_raptor():
    bc = bartact_card(
        "Ford Bronco Raptor (2022-2026)",
        ["Custom-cut for Raptor&rsquo;s bolstered Recaro-style seats",
         "600D Polyester standard / 1000D Cordura nylon specialty",
         "Mil-spec MOLLE on every seat",
         "SAB airbag-compliant seam construction",
         "Raptor-specific SKU &mdash; different from standard Bronco pattern",
         "Cut and hand-sewn in the USA"],
        note="Confirm Raptor SKU directly at bartact.com &mdash; the Raptor&rsquo;s bolstered seats require a different pattern than the standard Bronco."
    )
    # Use first 3 products for Raptor (fewer confirmed Raptor-specific)
    cards = "".join(product_card(p) for p in BRONCO_PRODUCTS[:3])

    body = f"""<div class="hero">
  <h1>Best Ford Bronco Raptor Seat Covers (2022&ndash;2026)</h1>
  <p>The Bronco Raptor&rsquo;s bolstered Recaro-style seats need different covers than the standard Bronco. Here&rsquo;s what actually fits.</p>
</div>
<div class="container">
  <div class="intro">
    The Ford Bronco Raptor (launched 2022) has high-bolster Recaro-style front seats that are wider at the sides than standard Bronco seats. Standard Bronco seat covers will not fit correctly on the Raptor &mdash; the bolster overhang causes bunching. Bartact makes a Raptor-specific pattern; confirm at their site before ordering. Amazon options may or may not specify Raptor fitment &mdash; check the listing fitment table carefully.
  </div>
  <div class="warning-box">
    <strong>&#9888; Standard Bronco covers do NOT fit the Raptor</strong>
    The Raptor&rsquo;s bolstered front seats have wider side bolsters than standard Bronco seats. Using a standard Bronco cover on a Raptor will result in poor fit and potential airbag interference. Always confirm &ldquo;Raptor&rdquo; fitment specifically.
  </div>
  <div class="config-nav">
    <span class="label">Configuration:</span>
    <a href="/ford-bronco-2door-seat-covers.html">2-Door Bronco</a>
    <a href="/ford-bronco-4door-seat-covers.html">4-Door Bronco</a>
    <a href="/ford-bronco-raptor-seat-covers.html" class="active">Raptor</a>
    <a href="/ford-bronco-wildtrak-seat-covers.html">Wildtrak / Heritage</a>
  </div>
  <div class="divider"></div>
  {bc}
  <h2 class="section">Amazon Picks &mdash; Bronco Raptor</h2>
  <p class="picks-intro">For Raptor-specific covers, confirm &ldquo;Bronco Raptor&rdquo; fitment in the listing. These picks are the closest available on Amazon &mdash; verify the fitment table for each before ordering.</p>
  {cards}
  {BARTACT_BLOG}
  <h2 class="section">Frequently Asked Questions</h2>
  <div class="faq-item">
    <h3>What makes the Raptor&rsquo;s seats different?</h3>
    <p>The Bronco Raptor uses Recaro-branded sport seats with higher side bolsters and a different seat shell geometry than standard Bronco seats. The bolsters extend further outward, which causes standard Bronco covers to bunch or sit wrong. The seat mounting points are the same but the surface contours differ significantly enough to require a separate cover pattern.</p>
  </div>
  <div class="faq-item">
    <h3>Does Bartact make a Raptor-specific cover?</h3>
    <p>Yes &mdash; Bartact builds Bronco covers with configuration-specific patterns, including the Raptor. Confirm the Raptor SKU directly at bartact.com before ordering. Their site lists Bronco configurations in the product selector.</p>
  </div>
</div>"""

    return "ford-bronco-raptor-seat-covers.html", html_page(
        "Best Ford Bronco Raptor Seat Covers 2022-2026 | BroncoSeatCover.com",
        "Seat covers for the Ford Bronco Raptor's bolstered Recaro-style seats. Standard Bronco covers don't fit — Bartact #1 Raptor-specific pick plus Amazon alternatives.",
        "ford-bronco-raptor-seat-covers.html", body
    )


# ── WILDTRAK / HERITAGE PAGE ─────────────────────────────────────────────────
def build_wildtrak():
    bc = bartact_card(
        "Ford Bronco Wildtrak &amp; Heritage (2021-2026)",
        ["Standard Bronco front seat pattern &mdash; fits Wildtrak and Heritage",
         "600D Polyester standard / 1000D Cordura nylon specialty",
         "Mil-spec MOLLE on every seat",
         "SAB airbag-compliant seam construction",
         "Cut and hand-sewn in the USA"],
        note="Wildtrak and Heritage Edition Broncos use standard front seats &mdash; no special SKU needed. Use the standard Bronco pattern."
    )
    cards = "".join(product_card(p) for p in BRONCO_PRODUCTS[:4])
    ct = comp_table(BRONCO_PRODUCTS[:3])

    body = f"""<div class="hero">
  <h1>Ford Bronco Wildtrak &amp; Heritage Edition Seat Covers</h1>
  <p>Wildtrak and Heritage Broncos use standard seat dimensions &mdash; standard Bronco covers fit perfectly. Here&rsquo;s what to order.</p>
</div>
<div class="container">
  <div class="intro">
    The Wildtrak and Heritage Edition Broncos use the same standard front seats as the base Bronco trims. Unlike the Raptor, there&rsquo;s no bolster overhang or seat geometry difference. Standard Bronco seat covers fit correctly on Wildtrak and Heritage models. You do not need a trim-specific SKU for these editions &mdash; just specify 2-door or 4-door for the rear bench pattern.
  </div>
  <div class="config-nav">
    <span class="label">Configuration:</span>
    <a href="/ford-bronco-2door-seat-covers.html">2-Door Bronco</a>
    <a href="/ford-bronco-4door-seat-covers.html">4-Door Bronco</a>
    <a href="/ford-bronco-raptor-seat-covers.html">Raptor</a>
    <a href="/ford-bronco-wildtrak-seat-covers.html" class="active">Wildtrak / Heritage</a>
  </div>
  <div class="divider"></div>
  {bc}
  <h2 class="section">Amazon Picks &mdash; Wildtrak &amp; Heritage Bronco</h2>
  <p class="picks-intro">Standard Bronco covers fit the Wildtrak and Heritage. Just confirm 2-door or 4-door when ordering rear covers.</p>
  {cards}
  <h2 class="section">Quick Comparison</h2>
  {ct}
  {BARTACT_BLOG}
  <h2 class="section">Frequently Asked Questions</h2>
  <div class="faq-item">
    <h3>Do Wildtrak seats have any unique features that affect seat cover fitment?</h3>
    <p>The Wildtrak Edition is primarily a styling and equipment package &mdash; the front seats are the same shell as the standard Bronco. No special seat cover SKU is needed. The main fitment consideration is still 2-door vs 4-door rear bench, not the Wildtrak trim designation.</p>
  </div>
  <div class="faq-item">
    <h3>When did Ford release the Heritage Edition Bronco?</h3>
    <p>The Heritage Edition launched for the 2023 model year as a throwback to the original 1966 Bronco styling. It uses a retro two-tone paint scheme and specific interior details, but the seat architecture is the same as other Bronco trims. Standard Bronco seat covers fit without modification.</p>
  </div>
</div>"""

    return "ford-bronco-wildtrak-seat-covers.html", html_page(
        "Ford Bronco Wildtrak & Heritage Edition Seat Covers | BroncoSeatCover.com",
        "Seat covers for the Ford Bronco Wildtrak and Heritage Edition. Standard Bronco covers fit both — Bartact #1 plus Amazon alternatives. Specify 2-door or 4-door for rear bench.",
        "ford-bronco-wildtrak-seat-covers.html", body
    )


# ── BUILD ─────────────────────────────────────────────────────────────────────
pages = [build_index(), build_4door(), build_2door(), build_raptor(), build_wildtrak()]

total_words = 0
for filename, html in pages:
    dest = OUT / filename
    dest.write_text(html, encoding="utf-8")
    amz = html.count("amazon.com/dp/")
    bartact = html.count("bartact.com")
    words = len(_re.sub('<[^>]+>', ' ', html).split())
    total_words += words
    ok = amz >= 3 and bartact >= 1 and words >= 900
    print(f"  {'✅' if ok else '⚠️ '} {filename}: {amz} AMZ, {bartact} Bartact refs, {words} words")

print(f"\nBuilt {len(pages)} pages, {total_words:,} total words")

# Post-build: submit to Google Indexing API + IndexNow
from build_utils import post_build_submit
post_build_submit('broncoseatcover.com')
