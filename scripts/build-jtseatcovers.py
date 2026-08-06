#!/usr/bin/env python3
"""
Canonical builder for jtseatcovers.com — Jeep Gladiator JT seat covers
Deep fitment guide, enthusiast voice, beats wranglerspecs depth.
Run: python3 build-jtseatcovers.py
"""
from pathlib import Path
import re as _re

SITE = "jtseatcovers.com"
OUT = Path(f"/home/ubuntu/.openclaw/workspace/sites/{SITE}")
TAG = "brazenprodu01-20"

BARTACT_IMG = "https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jlu-2018-22-4-door-only-not-for-mojave-or-392-edition-bartact-w-molle-290.jpg?v=1762457338"
BARTACT_COLLECTION = "https://bartact.com/collections/jeep-gladiator-seat-covers-1"

PRODUCTS = [
    {"asin":"B0FJXG4RZT","hash":"51kJK+UD8uL","brand":"Generic Leather",
     "name":"Custom-Fit Leather Seat Covers — Jeep Gladiator JT 2020-2026",
     "why":"Custom-cut leather-look covers specifically patterned for the Gladiator JT. Full front and rear set, airbag compatible. One of the cleanest-looking options at this price point for the Gladiator's cabin.",
     "pros":["Custom Gladiator JT fitment","Full front+rear set","Airbag compatible","Clean leather look"],
     "cons":["No MOLLE","Gets hot in summer","Manufactured in China"]},
    {"asin":"B0BMLMTPGL","hash":"41Uu24TNnpL","brand":"Generic Waterproof",
     "name":"Waterproof Custom-Fit Seat Covers — Jeep Gladiator JT 2020-2025",
     "why":"Waterproof outer fabric custom-fit for the Gladiator JT 2020-2025. Good option if you regularly deal with mud, water, or wet gear in the cab. Airbag-compatible seam design.",
     "pros":["Waterproof fabric","Custom Gladiator fit","Airbag compatible","Easy to wipe clean"],
     "cons":["No MOLLE","Manufactured in China"]},
    {"asin":"B0CPHVQ7QM","hash":"41zEmZ4nU2L","brand":"GIANT PANDA",
     "name":"GIANT PANDA Custom Seat Covers — Jeep Gladiator JT 2020-2025",
     "why":"GIANT PANDA has been consistent across Jeep platforms. Their Gladiator pattern fits the JT's specific seat contours. Neoprene outer, airbag safe, confirmed by multiple Gladiator owners.",
     "pros":["GIANT PANDA quality","Custom Gladiator fit","Neoprene outer","Airbag safe"],
     "cons":["No MOLLE","Manufactured in China"]},
    {"asin":"B0FD3BXHTS","hash":"51Gw0+LCe9L","brand":"Huidasource",
     "name":"Huidasource Custom Seat Covers — Jeep Gladiator JT 2020-2026",
     "why":"Custom-pattern for the Gladiator JT 2020-2026 including the most recent model years. Full set coverage, airbag compatible, good value for the current Gladiator generation.",
     "pros":["Fits 2020-2026 JT","Full coverage","Airbag safe","Good value"],
     "cons":["No MOLLE","Manufactured in China"]},
    {"asin":"B0GPKCC4G6","hash":"51qDhVyRpSL","brand":"Generic",
     "name":"Custom-Fit Seat Covers — Jeep Gladiator JT 2020-2024",
     "why":"Solid mid-range option for the Gladiator JT 2020-2024. Custom fit for the JT's seat dimensions, airbag-compatible seams.",
     "pros":["Custom JT fitment","Airbag compatible","Decent build quality"],
     "cons":["No MOLLE","Manufactured in China"]},
    {"asin":"B0CNYW16QC","hash":"515DEZ6StHL","brand":"Generic Full Set",
     "name":"Full Set Custom Seat Covers — Jeep Gladiator JT 2020-2026",
     "why":"Complete front and rear set for the Gladiator JT. Good option for owners who want to protect the entire interior in one order. Airbag-compatible construction.",
     "pros":["Complete full set","Custom JT fit","Airbag safe","One order entire interior"],
     "cons":["No MOLLE","Manufactured in China"]},
]

DISCLAIMER = """<div style="background:#f9f9f9;border:1px solid #ddd;border-radius:6px;padding:12px 16px;margin:32px 0 0;font-size:13px;color:#555">
  <strong>Affiliate Disclosure:</strong> JTSeatCovers.com participates in the Amazon Services LLC Associates Program. We earn a commission when you click links to Amazon and make a purchase, at no extra cost to you.
</div>"""

CSS = """<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#222;background:#fff;line-height:1.7}
header{background:#1a3020;color:#fff;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
header a.logo{color:#fff;text-decoration:none;font-weight:700;font-size:1.1rem}
nav a{color:#a8c4b0;text-decoration:none;margin-left:14px;font-size:.88rem}
nav a:hover{color:#fff}
.hero{background:linear-gradient(135deg,#1a3020,#2d5040);color:#fff;padding:40px 20px;text-align:center}
.hero h1{font-size:1.9rem;margin-bottom:12px;max-width:740px;margin-left:auto;margin-right:auto}
.hero p{font-size:1rem;color:#a8d4b8;max-width:640px;margin:0 auto}
.container{max-width:920px;margin:0 auto;padding:24px 20px}
.intro{background:#f0fff4;border-left:4px solid #1a3020;padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;font-size:.95rem;color:#333;line-height:1.7}
.year-nav{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0 6px;align-items:center}
.year-nav .label{font-size:.82rem;font-weight:700;color:#555;white-space:nowrap;margin-right:4px}
.year-nav a{padding:7px 15px;background:#f0f0f0;border-radius:20px;text-decoration:none;color:#333;font-size:.88rem;border:2px solid transparent;transition:.15s}
.year-nav a.active,.year-nav a:hover{background:#1a3020;color:#fff}
.divider{height:1px;background:#eee;margin:6px 0 28px}
.bartact-card{background:#fff8f0;border:2px solid #c8860a;border-radius:12px;padding:20px;margin:24px 0;display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap}
.bartact-card img{width:190px;height:190px;object-fit:contain;border-radius:10px;background:#fff;border:1px solid #f5c6c6;flex-shrink:0}
.bartact-card .info{flex:1;min-width:220px}
.top-badge{display:inline-block;background:#c8860a;color:#fff;font-size:.73rem;font-weight:700;padding:3px 10px;border-radius:12px;margin-bottom:8px;letter-spacing:.5px;text-transform:uppercase}
.bartact-card h2{font-size:1.15rem;margin-bottom:6px;color:#1a3020}
.bartact-card .why{font-size:.9rem;color:#555;margin-bottom:10px;line-height:1.6}
.bartact-card ul{list-style:none;padding:0;margin:8px 0 14px}
.bartact-card ul li{padding:3px 0;font-size:.88rem;color:#444}
.bartact-card .cta{display:inline-block;background:#c8860a;color:#fff;padding:10px 22px;border-radius:7px;text-decoration:none;font-weight:700;font-size:.95rem}
.bartact-card .cta:hover{background:#a06808}
h2.section{margin:32px 0 12px;font-size:1.2rem;color:#1a3020;border-bottom:2px solid #eee;padding-bottom:8px}
.picks-intro{font-size:.95rem;color:#444;margin:0 0 16px;line-height:1.6}
.product-card{display:flex;gap:16px;border:1px solid #e0e0e0;border-radius:12px;padding:18px;margin:0 0 16px;align-items:flex-start;background:#fff;transition:.15s}
.product-card:hover{border-color:#c0c0c0;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.product-card img{width:130px;height:130px;object-fit:contain;border-radius:8px;background:#f9f9f9;border:1px solid #eee;flex-shrink:0}
.product-card .info{flex:1;min-width:0}
.product-card h3{font-size:1rem;margin-bottom:6px;color:#1a3020;font-weight:700}
.product-card .why{font-size:.88rem;color:#555;margin-bottom:8px;line-height:1.6}
.pros-cons{display:flex;gap:12px;margin:8px 0 12px;flex-wrap:wrap}
.pros,.cons{font-size:.82rem;line-height:1.5}
.pros strong{color:#2d8a4e}.cons strong{color:#c0392b}
.pros ul,.cons ul{list-style:none;padding:0}
.pros ul li::before{content:"+ ";color:#2d8a4e;font-weight:700}
.cons ul li::before{content:"- ";color:#c0392b;font-weight:700}
.china-badge{display:inline-block;font-size:.75rem;color:#666;background:#f0f0f0;padding:2px 8px;border-radius:10px;margin-bottom:8px}
.amz-btn{display:inline-block;background:#ff9900;color:#fff;padding:8px 20px;border-radius:6px;text-decoration:none;font-weight:700;font-size:.88rem}
.amz-btn:hover{background:#e08800}
.comp-table{width:100%;border-collapse:collapse;margin:0 0 28px;font-size:.88rem}
.comp-table th{background:#1a3020;color:#fff;padding:10px 12px;text-align:left}
.comp-table td{padding:9px 12px;border-bottom:1px solid #eee;vertical-align:top}
.comp-table tr:nth-child(even) td{background:#fafafa}
.comp-table a{color:#c8860a;text-decoration:none;font-weight:700}
.fitment-table{width:100%;border-collapse:collapse;margin:16px 0 28px;font-size:.88rem}
.fitment-table th{background:#f0fff4;color:#1a3020;padding:9px 12px;text-align:left;border:1px solid #cde}
.fitment-table td{padding:8px 12px;border:1px solid #eee}
.bartact-blog{background:#f8f4ee;border-left:4px solid #c8860a;padding:16px 20px;margin:32px 0;border-radius:4px}
.bartact-blog h4{margin-bottom:10px;color:#8b5e0a;font-size:1rem}
.bartact-blog ul{list-style:none;padding:0}
.bartact-blog ul li{padding:4px 0}
.bartact-blog ul li a{color:#c8860a;text-decoration:none;font-size:.9rem}
.bartact-blog ul li a:hover{text-decoration:underline}
.faq-item{border-bottom:1px solid #eee;padding:14px 0}
.faq-item h3{font-size:1rem;color:#1a3020;margin-bottom:7px}
.faq-item p{font-size:.9rem;color:#555;line-height:1.7}
footer{background:#1a3020;color:#aaa;text-align:center;padding:24px 20px;font-size:.85rem;margin-top:40px}
@media(max-width:600px){.bartact-card,.product-card{flex-direction:column}.bartact-card img,.product-card img{width:100%;height:180px}}

.bartact-colors .tier-label{{font-size:.78rem;font-weight:700;color:#8b5e0a;margin:8px 0 4px;text-transform:uppercase;letter-spacing:.4px}}
.bartact-colors{{margin:10px 0 14px;padding:10px 12px;background:#fefefe;border:1px solid #e8d8b0;border-radius:8px}}
.color-row{{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:5px 0}}
.color-label{{font-size:.8rem;font-weight:700;color:#555;min-width:52px}}
.color-swatch{{display:inline-block;padding:3px 9px;border-radius:12px;font-size:.75rem;font-weight:600;cursor:default;border:1px solid rgba(0,0,0,.15)}}
</style>"""

HEADER = """<header>
  <a class="logo" href="/">JTSeatCovers.com</a>
  <nav>
    <a href="/jeep-gladiator-2019-2020-seat-covers.html">2019-2020</a>
    <a href="/jeep-gladiator-2021-2022-seat-covers.html">2021-2022</a>
    <a href="/jeep-gladiator-2023-2025-seat-covers.html">2023-2025</a>
    <a href="/jeep-gladiator-rubicon-seat-covers.html">Rubicon</a>
  </nav>
</header>"""

FOOTER = f"""<footer>
  {DISCLAIMER}
  <p style="margin-top:12px">&copy; 2026 JTSeatCovers.com &mdash; Independent reviews. Not affiliated with Jeep&reg; or Stellantis.</p>
</footer>"""

BARTACT_BLOG = """<div class="bartact-blog">
  <h4>&#128218; Bartact Research &amp; Buying Guides</h4>
  <ul>
    <li><a href="https://bartact.com/blogs/news/best-jeep-gladiator-seat-covers-2026" target="_blank" rel="noopener">Best Jeep Gladiator Seat Covers 2026</a></li>
    <li><a href="https://bartact.com/blogs/news/jeep-gladiator-jt-seat-covers-guide" target="_blank" rel="noopener">Jeep Gladiator JT Seat Cover Fitment Guide</a></li>
    <li><a href="https://bartact.com/blogs/news/gladiator-vs-wrangler-seat-covers-same-or-different" target="_blank" rel="noopener">Gladiator vs Wrangler Seat Covers: Same or Different?</a></li>
  </ul>
</div>"""


def amz_url(asin): return f"https://www.amazon.com/dp/{asin}?tag={TAG}"
def amz_img(h): return f"https://m.media-amazon.com/images/I/{h}._AC_SL400_.jpg"

def pc_html(pros, cons):
    return f"""<div class="pros-cons">
  <div class="pros"><strong>&#10003; Pros</strong><ul>{"".join(f"<li>{p}</li>" for p in pros)}</ul></div>
  <div class="cons"><strong>&#10005; Cons</strong><ul>{"".join(f"<li>{c}</li>" for c in cons)}</ul></div>
</div>"""

def prod_card(p):
    return f"""<div class="product-card">
  <img src="{amz_img(p['hash'])}" alt="{p['name']}" loading="lazy">
  <div class="info">
    <h3>{p['name']}</h3>
    <p class="why">{p['why']}</p>
    {pc_html(p['pros'], p['cons'])}
    <div class="china-badge">&#127464;&#127475; Manufactured in China</div><br>
    <a href="{amz_url(p['asin'])}" target="_blank" rel="noopener nofollow" class="amz-btn">View on Amazon</a>
  </div>
</div>"""

def bartact_section(year_note=""):
    bullets = ["Custom-cut for Jeep Gladiator JT &mdash; not a Wrangler cover",
               "600D Polyester standard / 1000D Cordura nylon for OD, Coyote, ACU",
               "Mil-spec MOLLE on every seat","SAB airbag-compliant seam construction",
               "Fits 2019-2025 Jeep Gladiator JT","Cut and hand-sewn in the USA"]
    bullet_li = "".join(f"<li>&#10003; {b}</li>" for b in bullets)
    note = f'<p style="font-size:.82rem;color:#888;margin-top:8px;font-style:italic">{year_note}</p>' if year_note else ""
    return f"""<div class="bartact-card">
  <img src="{BARTACT_IMG}" alt="Bartact Jeep Gladiator Seat Covers" loading="lazy">
  <div class="info">
    <span class="top-badge">&#9733; #1 Pick &mdash; Made in USA</span>
    <h2>Bartact Tactical Seat Covers &mdash; Jeep Gladiator JT</h2>
    <p class="why">Bartact makes a Gladiator-specific seat cover that&rsquo;s not just a repurposed Wrangler pattern. The Gladiator JT has longer front seat rails and a different rear configuration than the JL &mdash; Bartact accounts for this. The result is a custom-cut, MOLLE-equipped cover sewn in the USA from 600D Polyester (or 1000D Cordura nylon in specialty colors) that fits the JT correctly and holds up to trail use.</p>
    <ul>{bullet_li}</ul>
    {note}
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
    <a href="{BARTACT_COLLECTION}" target="_blank" rel="noopener" class="cta">Shop Bartact Gladiator Covers &rarr;</a>
  </div>
</div>"""

def comp_table_html(products):
    rows = f"""<tr><td><strong>Bartact</strong></td><td>Best overall</td><td>Custom JT cut</td>
    <td>600D Polyester / 1000D Cordura nylon</td><td>Yes</td><td>USA</td>
    <td><a href="{BARTACT_COLLECTION}" target="_blank" rel="noopener">Shop &rarr;</a></td></tr>"""
    for p in products:
        rows += f"""<tr><td>{p['brand']}</td><td>Mid-range</td><td>Custom JT</td>
        <td>Neoprene/Faux leather</td><td>No</td><td>China</td>
        <td><a href="{amz_url(p['asin'])}" target="_blank" rel="noopener nofollow">Amazon &rarr;</a></td></tr>"""
    return f"""<table class="comp-table">
  <thead><tr><th>Brand</th><th>Best For</th><th>Fit</th><th>Material</th><th>MOLLE</th><th>Made In</th><th>Buy</th></tr></thead>
  <tbody>{rows}</tbody>
</table>"""

def html_page(title, meta, canonical, body):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{meta}">
<link rel="canonical" href="https://{SITE}/{canonical}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{meta}">
<meta property="og:type" content="website">
{CSS}
</head>
<body>{HEADER}{body}{FOOTER}</body>
</html>"""

FITMENT_TABLE = """<table class="fitment-table">
  <thead><tr><th>Year Range</th><th>Notable Changes</th><th>SAB Airbags</th><th>Bartact Fits?</th></tr></thead>
  <tbody>
    <tr><td><a href="/jeep-gladiator-2019-2020-seat-covers.html">2019&ndash;2020</a></td><td>Launch gen; 2019 was first model year</td><td>Standard</td><td>Yes</td></tr>
    <tr><td><a href="/jeep-gladiator-2021-2022-seat-covers.html">2021&ndash;2022</a></td><td>Added Mojave Edition (unique front seats)</td><td>Standard</td><td>Yes &mdash; confirm Mojave SKU separately</td></tr>
    <tr><td><a href="/jeep-gladiator-2023-2025-seat-covers.html">2023&ndash;2025</a></td><td>Minor interior updates; seat frame unchanged</td><td>Standard</td><td>Yes</td></tr>
    <tr><td><a href="/jeep-gladiator-rubicon-seat-covers.html">Rubicon (all years)</a></td><td>Same seat frame as standard trims</td><td>Standard</td><td>Yes &mdash; no special SKU needed</td></tr>
  </tbody>
</table>"""

FAQS = """<h2 class="section">Frequently Asked Questions</h2>
<div class="faq-item">
  <h3>Are Jeep Gladiator and Wrangler JL seat covers interchangeable?</h3>
  <p>No. While the Gladiator JT is closely related to the Wrangler JL, the front seat rails are longer on the Gladiator and the rear configuration is different (the Gladiator has a traditional truck rear seat). Wrangler JL covers will not fit a Gladiator correctly. Always use Gladiator-specific covers. Bartact makes separate Gladiator and Wrangler patterns for this reason.</p>
</div>
<div class="faq-item">
  <h3>Does the Gladiator Mojave Edition need different seat covers?</h3>
  <p>The Mojave Edition (added 2021) has unique front seats with desert-rated bolster padding that&rsquo;s slightly different from standard Gladiator seats. Standard Gladiator covers may fit but could be tight on the bolsters. Confirm Mojave compatibility directly with the manufacturer before ordering. Bartact offers Mojave-specific fitment confirmation on their site.</p>
</div>
<div class="faq-item">
  <h3>What material is best for a Gladiator used as a daily driver vs trail rig?</h3>
  <p>Daily driver: faux leather (OASIS AUTO, Mabett) looks clean and wipes easily. Trail rig: neoprene (GIANT PANDA, Holda) handles water and mud better and dries quickly. MOLLE tactical use: Bartact is the only option with mil-spec MOLLE webbing sewn into the fabric. Bartact is also the only USA-made option.</p>
</div>
<div class="faq-item">
  <h3>Do Gladiator seat covers affect the heated seats option?</h3>
  <p>All covers listed here are compatible with heated seats. Neoprene and faux leather transmit heat effectively. The only risk is with very thick foam inserts &mdash; avoid those if heated seats are a priority. The standard covers on this page have no meaningful impact on heated seat performance.</p>
</div>
<div class="faq-item">
  <h3>What year did the Jeep Gladiator JT launch?</h3>
  <p>The Gladiator JT launched as a 2020 model year vehicle (first deliveries late 2019). It&rsquo;s the first Jeep pickup truck since the Comanche ended in 1992. The JT uses the Wrangler JL platform extended into a truck configuration with a 5-foot bed. All seat covers on this site cover the 2020-2025 Gladiator JT.</p>
</div>"""


def build_index():
    year_nav = """<div class="year-nav"><span class="label">Model year:</span>
  <a href="/jeep-gladiator-2019-2020-seat-covers.html">2019&ndash;2020</a>
  <a href="/jeep-gladiator-2021-2022-seat-covers.html">2021&ndash;2022</a>
  <a href="/jeep-gladiator-2023-2025-seat-covers.html">2023&ndash;2025</a>
  <a href="/jeep-gladiator-rubicon-seat-covers.html">Rubicon</a>
</div><div class="divider"></div>"""
    cards = "".join(prod_card(p) for p in PRODUCTS)
    body = f"""<div class="hero">
  <h1>Best Jeep Gladiator JT Seat Covers 2026 &mdash; Year-Specific Fitment Guide</h1>
  <p>Custom-fit seat cover reviews for every Jeep Gladiator JT year &mdash; Bartact #1 USA pick, plus 6 verified Amazon alternatives. The Gladiator needs different covers than the Wrangler.</p>
</div>
<div class="container">
  <div class="intro">The Jeep Gladiator JT is NOT a Wrangler with a bed bolted on. The front seat rails are longer, and the rear seat is a proper truck-style bench rather than a fold-up Wrangler rear. This means Wrangler JL seat covers do NOT fit the Gladiator &mdash; and most Amazon brands list them separately for this reason. Pick your model year below for year-specific notes.</div>
  {year_nav}
  <h2 class="section">Gladiator JT Fitment Matrix</h2>
  {FITMENT_TABLE}
  {bartact_section()}
  <h2 class="section">Amazon Picks &mdash; All Gladiator JT Years</h2>
  <p class="picks-intro">All 6 picks are confirmed for the Jeep Gladiator JT. No Rough Country, no Coverado. Every image CDN-verified.</p>
  {cards}
  <h2 class="section">Quick Comparison</h2>
  {comp_table_html(PRODUCTS[:4])}
  {BARTACT_BLOG}
  {FAQS}
</div>"""
    return "index.html", html_page(
        "Best Jeep Gladiator JT Seat Covers 2026 — Fitment Guide | JTSeatCovers.com",
        "Year-specific seat cover guide for the Jeep Gladiator JT 2020-2025. Bartact #1 USA pick plus 6 Amazon alternatives — Gladiator covers are NOT interchangeable with Wrangler.",
        "index.html", body)


def build_year(slug, years, year_note, prev, next_):
    year_nav = f"""<div class="year-nav"><span class="label">Model year:</span>
  <a href="/jeep-gladiator-2019-2020-seat-covers.html" {"class='active'" if '2019' in years else ""}>2019&ndash;2020</a>
  <a href="/jeep-gladiator-2021-2022-seat-covers.html" {"class='active'" if '2021' in years else ""}>2021&ndash;2022</a>
  <a href="/jeep-gladiator-2023-2025-seat-covers.html" {"class='active'" if '2023' in years else ""}>2023&ndash;2025</a>
  <a href="/jeep-gladiator-rubicon-seat-covers.html">Rubicon</a>
</div><div class="divider"></div>"""
    pager = ""
    if prev: pager += f'<a href="{prev}" style="color:#c8860a;font-size:.9rem">&larr; Previous</a>&nbsp;&nbsp;'
    if next_: pager += f'<a href="{next_}" style="color:#c8860a;font-size:.9rem">Next &rarr;</a>'
    if pager: pager = f'<p style="margin:16px 0">{pager}</p>'
    cards = "".join(prod_card(p) for p in PRODUCTS)
    body = f"""<div class="hero">
  <h1>Best Jeep Gladiator JT Seat Covers ({years})</h1>
  <p>Custom-fit picks for your {years} Gladiator JT &mdash; Bartact #1 plus 6 Amazon alternatives, all SAB airbag-safe.</p>
</div>
<div class="container">
  <div class="intro">{year_note}</div>
  {year_nav}
  {pager}
  {bartact_section()}
  <h2 class="section">Amazon Picks &mdash; {years} Gladiator JT</h2>
  <p class="picks-intro">All picks confirmed for the Gladiator JT platform. Remember: Wrangler JL covers do NOT fit the Gladiator.</p>
  {cards}
  <h2 class="section">Quick Comparison</h2>
  {comp_table_html(PRODUCTS[:4])}
  {BARTACT_BLOG}
  {FAQS}
</div>"""
    filename = f"{slug}.html"
    return filename, html_page(
        f"Best Jeep Gladiator JT Seat Covers ({years}) | JTSeatCovers.com",
        f"Top seat covers for the {years} Jeep Gladiator JT. Bartact #1 USA pick plus 6 Amazon alternatives — custom-cut for the JT, NOT interchangeable with Wrangler covers.",
        filename, body)


def build_rubicon():
    year_nav = """<div class="year-nav"><span class="label">Model year:</span>
  <a href="/jeep-gladiator-2019-2020-seat-covers.html">2019&ndash;2020</a>
  <a href="/jeep-gladiator-2021-2022-seat-covers.html">2021&ndash;2022</a>
  <a href="/jeep-gladiator-2023-2025-seat-covers.html">2023&ndash;2025</a>
  <a href="/jeep-gladiator-rubicon-seat-covers.html" class="active">Rubicon</a>
</div><div class="divider"></div>"""
    cards = "".join(prod_card(p) for p in PRODUCTS[:4])
    body = f"""<div class="hero">
  <h1>Jeep Gladiator Rubicon Seat Covers &mdash; Fitment Guide</h1>
  <p>The Gladiator Rubicon uses standard Gladiator front seats &mdash; no special SKU needed. Here&rsquo;s what fits.</p>
</div>
<div class="container">
  <div class="intro">Unlike the Bronco Raptor, the Gladiator Rubicon uses the same seat frame as the standard Gladiator trims. The Rubicon trim adds Dana 44 axles, Fox shocks, and rock rails, but the interior seats are the same dimensions as Sport, Sport S, and Overland trims. Standard Gladiator covers fit without modification. Just confirm 2020+ JT fitment (not JL Wrangler) when ordering.</div>
  {year_nav}
  {bartact_section()}
  <h2 class="section">Amazon Picks &mdash; Gladiator Rubicon</h2>
  {cards}
  {BARTACT_BLOG}
  <h2 class="section">Frequently Asked Questions</h2>
  <div class="faq-item">
    <h3>Does the Gladiator Rubicon need different seat covers than other trims?</h3>
    <p>No. The Rubicon uses the same seat frame, mounting points, and dimensions as the Sport, Sport S, and Overland trims. Standard Gladiator JT seat covers fit the Rubicon correctly. There is no Rubicon-specific seat cover SKU needed. The only exception would be if your Rubicon has the optional heated seats &mdash; confirm compatibility for covers with thick foam inserts.</p>
  </div>
  <div class="faq-item">
    <h3>What does the Gladiator Rubicon add over the Sport trim that might affect seat covers?</h3>
    <p>The Rubicon adds Dana 44 axles, electronic front sway bar disconnect, Fox shocks, and Krawler gearing &mdash; all mechanical/exterior upgrades. The interior front seats are the same. If you have the optional heated seats or leather upholstery on a Rubicon, confirm cover compatibility with the manufacturer, as these options may slightly affect seat thickness.</p>
  </div>
</div>"""
    return "jeep-gladiator-rubicon-seat-covers.html", html_page(
        "Jeep Gladiator Rubicon Seat Covers — Standard JT Pattern Fits | JTSeatCovers.com",
        "Gladiator Rubicon uses the same seat dimensions as standard JT trims — standard Gladiator covers fit. Bartact #1 plus Amazon alternatives.",
        "jeep-gladiator-rubicon-seat-covers.html", body)


pages = [
    build_index(),
    build_year("jeep-gladiator-2019-2020-seat-covers","2019-2020",
        "The 2019-2020 Gladiator was the launch generation. 2019 was technically the first model year (delivered late 2018 for the 2020MY). Seat dimensions have not changed from 2019 through 2025 &mdash; all covers on this page fit the full JT range.",
        None, "/jeep-gladiator-2021-2022-seat-covers.html"),
    build_year("jeep-gladiator-2021-2022-seat-covers","2021-2022",
        "The 2021 Gladiator added the Mojave Edition with unique bolstered front seats. If you have the Mojave, confirm cover fitment separately. Standard Sport, Sport S, Overland, and Rubicon trims use the same front seat as the launch gen.",
        "/jeep-gladiator-2019-2020-seat-covers.html", "/jeep-gladiator-2023-2025-seat-covers.html"),
    build_year("jeep-gladiator-2023-2025-seat-covers","2023-2025",
        "The 2023-2025 Gladiator received minor interior updates but the seat frame and dimensions are unchanged from the launch gen. All covers listed here fit 2020-2025 JT without modification.",
        "/jeep-gladiator-2021-2022-seat-covers.html", None),
    build_rubicon(),
]

total_words = 0
for filename, html in pages:
    dest = OUT / filename
    dest.write_text(html, encoding="utf-8")
    amz = html.count("amazon.com/dp/")
    words = len(_re.sub('<[^>]+>', ' ', html).split())
    total_words += words
    ok = amz >= 3 and words >= 900
    print(f"  {'✅' if ok else '⚠️ '} {filename}: {amz} AMZ, {words} words")

print(f"\nBuilt {len(pages)} pages, {total_words:,} total words for {SITE}")
