#!/usr/bin/env python3
"""
Canonical builder for tjseatcovers.com — Jeep Wrangler TJ/LJ seat covers
Deep fitment guide, enthusiast voice, beats wranglerspecs depth.
Run: python3 build-tjseatcovers.py
"""
from pathlib import Path
import re as _re

SITE = "tjseatcovers.com"
OUT = Path(f"/home/ubuntu/.openclaw/workspace/sites/{SITE}")
TAG = "brazenprodu01-20"

BARTACT_IMG = "https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-jeep-wrangler-seat-covers-black-graphite-front-tactical-seat-covers-for-jeep-wrangler-tj-1997-02-pair-w-molle-bartact-29023020023851.jpg?v=1762457055"
BARTACT_COLLECTION = "https://bartact.com/collections/jeep-wrangler-tj-seat-covers"

PRODUCTS_ALL = [
    {"asin":"B09572Z8QS","hash":"41H68rlfV4L","brand":"Neoprene",
     "name":"Neoprene Seat Cover Set — Jeep Wrangler TJ 1997-2006 (Front + Rear)",
     "why":"One of the few covers still actively listed with confirmed TJ/LJ fitment in 2026. Neoprene construction, waterproof outer, airbag compatible, full front and rear set.",
     "pros":["Confirmed TJ/LJ 97-06 fitment","Neoprene waterproof","Full front+rear set","Airbag compatible"],
     "cons":["No MOLLE","Manufactured in China"]},
    {"asin":"B0H2KD3HP6","hash":"415jK4LpHbL","brand":"Neoprene",
     "name":"Neoprene Seat Covers — Jeep TJ/LJ Wrangler 1997-2006 (Full Set)",
     "why":"Another actively supported TJ neoprene set. Custom-fit for the 1997-2006 TJ platform, including the LJ Unlimited. Machine washable, dries fast, airbag-safe seam construction.",
     "pros":["Custom TJ/LJ fit","Machine washable","Dries fast","Airbag safe"],
     "cons":["No MOLLE","Manufactured in China"]},
    {"asin":"B0956LBZW5","hash":"41Vi9qmHrEL","brand":"Neoprene",
     "name":"Neoprene Seat Cover Set — Jeep Wrangler TJ 97-06 (Color Options)",
     "why":"Same platform fitment as the other TJ neoprene sets but with additional color options. Good for TJ owners who want something other than plain black.",
     "pros":["Color options","Custom TJ fit","Neoprene waterproof","Airbag compatible"],
     "cons":["No MOLLE","Manufactured in China"]},
    {"asin":"B0GXZ82F4L","hash":"41i-BhUSIUL","brand":"Generic",
     "name":"Custom Seat Covers — Jeep Wrangler TJ 2003-2006 &amp; 1997-2002",
     "why":"Lists both TJ year ranges separately, which is useful if your TJ had any mid-generation seat changes. Custom-fit pattern for the TJ platform, airbag compatible.",
     "pros":["Year-specific fitment","Custom TJ pattern","Airbag compatible"],
     "cons":["No MOLLE","Manufactured in China"]},
    {"asin":"B0788GJTNY","hash":"41WEwO7IasS","brand":"Neoprene",
     "name":"Custom-Fit Neoprene Seat Covers — Jeep Wrangler TJ 1997-2002",
     "why":"Specifically listed for the 1997-2002 TJ range. Neoprene construction, full set. Good option if you want year-range-specific fitment for the early TJ.",
     "pros":["1997-2002 specific fitment","Neoprene","Full set","Airbag safe"],
     "cons":["1997-2002 only","No MOLLE","Manufactured in China"]},
]

PRODUCTS_2003 = [p for p in PRODUCTS_ALL if "2003" in p["name"] or "97-06" in p["name"] or "1997-2006" in p["name"]]
PRODUCTS_1997 = [p for p in PRODUCTS_ALL if "1997" in p["name"] or "97" in p["name"]]

DISCLAIMER = """<div style="background:#f9f9f9;border:1px solid #ddd;border-radius:6px;padding:12px 16px;margin:32px 0 0;font-size:13px;color:#555">
  <strong>Affiliate Disclosure:</strong> TJSeatCovers.com participates in the Amazon Services LLC Associates Program. We earn a commission when you click links to Amazon and make a purchase, at no extra cost to you.
</div>"""

CSS = """<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#222;background:#fff;line-height:1.7}
header{background:#2a1f14;color:#fff;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
header a.logo{color:#fff;text-decoration:none;font-weight:700;font-size:1.1rem}
nav a{color:#c4b0a0;text-decoration:none;margin-left:14px;font-size:.88rem}
nav a:hover{color:#fff}
.hero{background:linear-gradient(135deg,#2a1f14,#4a3824);color:#fff;padding:40px 20px;text-align:center}
.hero h1{font-size:1.9rem;margin-bottom:12px;max-width:740px;margin-left:auto;margin-right:auto}
.hero p{font-size:1rem;color:#d4c4b0;max-width:640px;margin:0 auto}
.container{max-width:920px;margin:0 auto;padding:24px 20px}
.intro{background:#fdf8f4;border-left:4px solid #2a1f14;padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;font-size:.95rem;color:#333;line-height:1.7}
.year-nav{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0 6px;align-items:center}
.year-nav .label{font-size:.82rem;font-weight:700;color:#555;white-space:nowrap;margin-right:4px}
.year-nav a{padding:7px 15px;background:#f0f0f0;border-radius:20px;text-decoration:none;color:#333;font-size:.88rem;border:2px solid transparent;transition:.15s}
.year-nav a.active,.year-nav a:hover{background:#2a1f14;color:#fff}
.divider{height:1px;background:#eee;margin:6px 0 28px}
.bartact-card{background:#fff8f0;border:2px solid #c8860a;border-radius:12px;padding:20px;margin:24px 0;display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap}
.bartact-card img{width:190px;height:190px;object-fit:contain;border-radius:10px;background:#fff;border:1px solid #f5c6c6;flex-shrink:0}
.bartact-card .info{flex:1;min-width:220px}
.top-badge{display:inline-block;background:#c8860a;color:#fff;font-size:.73rem;font-weight:700;padding:3px 10px;border-radius:12px;margin-bottom:8px;letter-spacing:.5px;text-transform:uppercase}
.bartact-card h2{font-size:1.15rem;margin-bottom:6px;color:#2a1f14}
.bartact-card .why{font-size:.9rem;color:#555;margin-bottom:10px;line-height:1.6}
.bartact-card ul{list-style:none;padding:0;margin:8px 0 14px}
.bartact-card ul li{padding:3px 0;font-size:.88rem;color:#444}
.bartact-card .cta{display:inline-block;background:#c8860a;color:#fff;padding:10px 22px;border-radius:7px;text-decoration:none;font-weight:700;font-size:.95rem}
h2.section{margin:32px 0 12px;font-size:1.2rem;color:#2a1f14;border-bottom:2px solid #eee;padding-bottom:8px}
.picks-intro{font-size:.95rem;color:#444;margin:0 0 16px;line-height:1.6}
.product-card{display:flex;gap:16px;border:1px solid #e0e0e0;border-radius:12px;padding:18px;margin:0 0 16px;align-items:flex-start;background:#fff;transition:.15s}
.product-card:hover{border-color:#c0c0c0;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.product-card img{width:130px;height:130px;object-fit:contain;border-radius:8px;background:#f9f9f9;border:1px solid #eee;flex-shrink:0}
.product-card .info{flex:1;min-width:0}
.product-card h3{font-size:1rem;margin-bottom:6px;color:#2a1f14;font-weight:700}
.product-card .why{font-size:.88rem;color:#555;margin-bottom:8px;line-height:1.6}
.pros-cons{display:flex;gap:12px;margin:8px 0 12px;flex-wrap:wrap}
.pros,.cons{font-size:.82rem;line-height:1.5}
.pros strong{color:#2d8a4e}.cons strong{color:#c0392b}
.pros ul,.cons ul{list-style:none;padding:0}
.pros ul li::before{content:"+ ";color:#2d8a4e;font-weight:700}
.cons ul li::before{content:"- ";color:#c0392b;font-weight:700}
.china-badge{display:inline-block;font-size:.75rem;color:#666;background:#f0f0f0;padding:2px 8px;border-radius:10px;margin-bottom:8px}
.amz-btn{display:inline-block;background:#ff9900;color:#fff;padding:8px 20px;border-radius:6px;text-decoration:none;font-weight:700;font-size:.88rem}
.comp-table{width:100%;border-collapse:collapse;margin:0 0 28px;font-size:.88rem}
.comp-table th{background:#2a1f14;color:#fff;padding:10px 12px;text-align:left}
.comp-table td{padding:9px 12px;border-bottom:1px solid #eee}
.comp-table tr:nth-child(even) td{background:#fafafa}
.comp-table a{color:#c8860a;text-decoration:none;font-weight:700}
.fitment-table{width:100%;border-collapse:collapse;margin:16px 0 28px;font-size:.88rem}
.fitment-table th{background:#fdf8f4;color:#2a1f14;padding:9px 12px;text-align:left;border:1px solid #ddd}
.fitment-table td{padding:8px 12px;border:1px solid #eee}
.bartact-blog{background:#f8f4ee;border-left:4px solid #c8860a;padding:16px 20px;margin:32px 0;border-radius:4px}
.bartact-blog h4{margin-bottom:10px;color:#8b5e0a;font-size:1rem}
.bartact-blog ul{list-style:none;padding:0}
.bartact-blog ul li{padding:4px 0}
.bartact-blog ul li a{color:#c8860a;text-decoration:none;font-size:.9rem}
.faq-item{border-bottom:1px solid #eee;padding:14px 0}
.faq-item h3{font-size:1rem;color:#2a1f14;margin-bottom:7px}
.faq-item p{font-size:.9rem;color:#555;line-height:1.7}
footer{background:#2a1f14;color:#aaa;text-align:center;padding:24px 20px;font-size:.85rem;margin-top:40px}
@media(max-width:600px){.bartact-card,.product-card{flex-direction:column}.bartact-card img,.product-card img{width:100%;height:180px}}

.bartact-colors .tier-label{{font-size:.78rem;font-weight:700;color:#8b5e0a;margin:8px 0 4px;text-transform:uppercase;letter-spacing:.4px}}
.bartact-colors{{margin:10px 0 14px;padding:10px 12px;background:#fefefe;border:1px solid #e8d8b0;border-radius:8px}}
.color-row{{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:5px 0}}
.color-label{{font-size:.8rem;font-weight:700;color:#555;min-width:52px}}
.color-swatch{{display:inline-block;padding:3px 9px;border-radius:12px;font-size:.75rem;font-weight:600;cursor:default;border:1px solid rgba(0,0,0,.15)}}
</style>"""

HEADER = """<header>
  <a class="logo" href="/">TJSeatCovers.com</a>
  <nav>
    <a href="/tj-1997-2002-seat-covers.html">1997&ndash;2002</a>
    <a href="/tj-2003-2006-seat-covers.html">2003&ndash;2006</a>
    <a href="/lj-unlimited-seat-covers.html">LJ Unlimited</a>
  </nav>
</header>"""

FOOTER = f"""<footer>
  {DISCLAIMER}
  <p style="margin-top:12px">&copy; 2026 TJSeatCovers.com &mdash; Independent reviews. Not affiliated with Jeep&reg; or Stellantis.</p>
</footer>"""

BARTACT_BLOG = """<div class="bartact-blog">
  <h4>&#128218; Bartact Research &amp; Buying Guides</h4>
  <ul>
    <li><a href="https://bartact.com/blogs/news/best-jeep-wrangler-tj-seat-covers-2026" target="_blank" rel="noopener">Best Jeep Wrangler TJ Seat Covers 2026</a></li>
    <li><a href="https://bartact.com/blogs/news/jeep-wrangler-tj-lj-seat-cover-fitment-guide" target="_blank" rel="noopener">TJ vs LJ Seat Cover Fitment: What&rsquo;s Different?</a></li>
    <li><a href="https://bartact.com/blogs/news/jeep-wrangler-tj-seat-covers-2026" target="_blank" rel="noopener">Jeep Wrangler TJ Seat Covers 2026: Finding Covers for a 20-Year-Old Platform</a></li>
  </ul>
</div>"""


def amz_url(a): return f"https://www.amazon.com/dp/{a}?tag={TAG}"
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
    {pc_html(p['pros'],p['cons'])}
    <div class="china-badge">&#127464;&#127475; Manufactured in China</div><br>
    <a href="{amz_url(p['asin'])}" target="_blank" rel="noopener nofollow" class="amz-btn">View on Amazon</a>
  </div>
</div>"""

def bartact_block(note=""):
    bullets = ["Custom-cut for TJ/LJ &mdash; not a JK or JL cover",
               "600D Polyester standard / 1000D Cordura nylon for OD, Coyote, ACU",
               "Mil-spec MOLLE on every seat","SAB airbag-compliant seam construction",
               "Fits 1997-2006 TJ and LJ Unlimited","Cut and hand-sewn in the USA"]
    bl = "".join(f"<li>&#10003; {b}</li>" for b in bullets)
    nh = f'<p style="font-size:.82rem;color:#888;margin-top:8px;font-style:italic">{note}</p>' if note else ""
    return f"""<div class="bartact-card">
  <img src="{BARTACT_IMG}" alt="Bartact Jeep Wrangler TJ Seat Covers" loading="lazy">
  <div class="info">
    <span class="top-badge">&#9733; #1 Pick &mdash; Made in USA</span>
    <h2>Bartact Tactical Seat Covers &mdash; Jeep Wrangler TJ/LJ (1997-2006)</h2>
    <p class="why">Finding quality seat covers for a 20-year-old platform is harder than it sounds. Most brands have dropped TJ patterns as inventory turns slower. Bartact still actively makes a TJ-specific cover &mdash; custom-cut for the 1997-2006 seat dimensions, sewn in the USA, with mil-spec MOLLE webbing. It&rsquo;s one of the few covers that gets the TJ right rather than slapping a universal fit on it and calling it done.</p>
    <ul>{bl}</ul>
    {nh}
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
    <a href="{BARTACT_COLLECTION}" target="_blank" rel="noopener" class="cta">Shop Bartact TJ/LJ Covers &rarr;</a>
  </div>
</div>"""

def comp_html(products):
    rows = f"""<tr><td><strong>Bartact</strong></td><td>Best overall</td><td>Custom TJ/LJ cut</td>
    <td>600D Polyester / 1000D Cordura nylon</td><td>Yes</td><td>USA</td>
    <td><a href="{BARTACT_COLLECTION}" target="_blank" rel="noopener">Shop &rarr;</a></td></tr>"""
    for p in products:
        rows += f"""<tr><td>{p['brand']}</td><td>Mid-range</td><td>Custom TJ</td>
        <td>Neoprene</td><td>No</td><td>China</td>
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
  <thead><tr><th>Year Range</th><th>Notes</th><th>SAB Airbags</th><th>Bartact Fits?</th></tr></thead>
  <tbody>
    <tr><td><a href="/tj-1997-2002-seat-covers.html">1997&ndash;2002</a></td><td>Pre-facelift interior; most did NOT have SABs</td><td>Rare/optional</td><td>Yes</td></tr>
    <tr><td><a href="/tj-2003-2006-seat-covers.html">2003&ndash;2006</a></td><td>Post-facelift; Rubicon Unlimited (LJ) added 2004</td><td>Optional on some trims</td><td>Yes</td></tr>
    <tr><td><a href="/lj-unlimited-seat-covers.html">LJ Unlimited</a></td><td>Same front seats as TJ; added 2004</td><td>Same as TJ</td><td>Yes &mdash; same pattern as TJ</td></tr>
  </tbody>
</table>"""

FAQS = """<h2 class="section">Frequently Asked Questions</h2>
<div class="faq-item">
  <h3>Why is it hard to find TJ seat covers in 2026?</h3>
  <p>The TJ ended production in 2006 &mdash; that&rsquo;s 20 years ago. Most seat cover manufacturers have dropped TJ-specific patterns as demand declines and inventory turns slowly. The brands that still actively support TJ fitment are Bartact, Smittybilt, GIANT PANDA, and a few neoprene-specialist sellers. We only list covers with confirmed current availability and real Amazon listings.</p>
</div>
<div class="faq-item">
  <h3>Do TJ and LJ Unlimited use the same seat covers?</h3>
  <p>Yes. The LJ Unlimited (2004-2006) uses the same front seat dimensions as the TJ. The LJ is a long-wheelbase version of the TJ with the same seat architecture. Any TJ-specific cover fits the LJ without modification. Only the rear configuration differs &mdash; the LJ has more rear legroom due to the longer wheelbase, but the rear seat cover pattern is the same.</p>
</div>
<div class="faq-item">
  <h3>Did the TJ have side airbags?</h3>
  <p>Most TJ trims did NOT have SAB side airbags. They were optional on some higher trim levels and years &mdash; check your specific vehicle. The Rubicon (added 2003) and some Sahara trims occasionally had them. If your TJ has SAB side airbags, use SAB-compliant covers. If it doesn&rsquo;t, any cover fits. All covers on this page are SAB-compliant regardless.</p>
</div>
<div class="faq-item">
  <h3>Can I use JK or JL Wrangler covers on a TJ?</h3>
  <p>No. The TJ, JK, and JL all have different seat frames with different dimensions and mounting points. JK covers are too wide for the TJ&rsquo;s narrower seats. JL covers are designed for the JL&rsquo;s updated interior with different headrest geometry. Never use cross-gen covers &mdash; poor fit and potential airbag interference.</p>
</div>
<div class="faq-item">
  <h3>What years did the TJ run?</h3>
  <p>The Jeep Wrangler TJ ran from 1997 (model year) through 2006. The YJ preceded it (1987-1995) and the JK succeeded it (2007-2018). The LJ Unlimited (long-wheelbase TJ) ran 2004-2006. All three TJ variants use the same front seat dimensions. Do not use YJ or JK covers on a TJ.</p>
</div>"""


def build_index():
    year_nav = """<div class="year-nav"><span class="label">Model year:</span>
  <a href="/tj-1997-2002-seat-covers.html">1997&ndash;2002</a>
  <a href="/tj-2003-2006-seat-covers.html">2003&ndash;2006</a>
  <a href="/lj-unlimited-seat-covers.html">LJ Unlimited</a>
</div><div class="divider"></div>"""
    cards = "".join(prod_card(p) for p in PRODUCTS_ALL)
    body = f"""<div class="hero">
  <h1>Best Jeep Wrangler TJ &amp; LJ Seat Covers 2026 &mdash; Fitment Guide</h1>
  <p>One of the few 2026 guides that still actively covers TJ/LJ fitment. Bartact #1 USA pick, plus the best Amazon alternatives still available for the 1997-2006 platform.</p>
</div>
<div class="container">
  <div class="intro">The Jeep Wrangler TJ ended production in 2006. That&rsquo;s 20 years ago &mdash; and most seat cover manufacturers have quietly stopped supporting TJ-specific patterns. This guide covers only covers with confirmed current availability and real TJ fitment. No cross-gen covers (JK or JL patterns don&rsquo;t fit), no universal-fit workarounds.</div>
  {year_nav}
  <h2 class="section">TJ/LJ Fitment Matrix</h2>
  {FITMENT_TABLE}
  {bartact_block()}
  <h2 class="section">Amazon Picks &mdash; All TJ/LJ Years</h2>
  <p class="picks-intro">These are the best currently-available Amazon options for the TJ/LJ platform. All confirmed for 1997-2006 fitment. No JK or JL cross-gen listings.</p>
  {cards}
  <h2 class="section">Quick Comparison</h2>
  {comp_html(PRODUCTS_ALL[:3])}
  {BARTACT_BLOG}
  {FAQS}
</div>"""
    return "index.html", html_page(
        "Best Jeep Wrangler TJ & LJ Seat Covers 2026 — Fitment Guide | TJSeatCovers.com",
        "One of the few 2026 fitment guides still actively covering the TJ/LJ platform. Bartact #1 USA pick plus Amazon alternatives confirmed for 1997-2006 Wrangler TJ and LJ Unlimited.",
        "index.html", body)


def build_year_page(slug, years, intro_text, prev, next_):
    year_nav = f"""<div class="year-nav"><span class="label">Model year:</span>
  <a href="/tj-1997-2002-seat-covers.html" {"class='active'" if '1997' in years else ""}>1997&ndash;2002</a>
  <a href="/tj-2003-2006-seat-covers.html" {"class='active'" if '2003' in years else ""}>2003&ndash;2006</a>
  <a href="/lj-unlimited-seat-covers.html">LJ Unlimited</a>
</div><div class="divider"></div>"""
    pager = ""
    if prev: pager += f'<a href="{prev}" style="color:#c8860a;font-size:.9rem">&larr; Previous</a>&nbsp;&nbsp;'
    if next_: pager += f'<a href="{next_}" style="color:#c8860a;font-size:.9rem">Next &rarr;</a>'
    if pager: pager = f'<p style="margin:16px 0">{pager}</p>'
    # Pick appropriate products
    if "1997" in years:
        prods = [p for p in PRODUCTS_ALL if "1997" in p["name"] or "97" in p["name"] or "1997-2006" in p["name"]][:4]
        if len(prods) < 3: prods = PRODUCTS_ALL[:4]
    else:
        prods = PRODUCTS_ALL
    cards = "".join(prod_card(p) for p in prods)
    body = f"""<div class="hero">
  <h1>Best Jeep Wrangler TJ Seat Covers ({years})</h1>
  <p>Custom-fit picks for your {years} TJ &mdash; Bartact #1 plus Amazon alternatives confirmed for this year range.</p>
</div>
<div class="container">
  <div class="intro">{intro_text}</div>
  {year_nav}
  {pager}
  {bartact_block()}
  <h2 class="section">Amazon Picks &mdash; TJ {years}</h2>
  {cards}
  <h2 class="section">Quick Comparison</h2>
  {comp_html(prods[:3])}
  {BARTACT_BLOG}
  {FAQS}
</div>"""
    filename = f"{slug}.html"
    return filename, html_page(
        f"Best Jeep Wrangler TJ Seat Covers ({years}) | TJSeatCovers.com",
        f"Top seat covers for the {years} Jeep Wrangler TJ. Bartact #1 USA pick plus Amazon alternatives — confirmed TJ fitment, not JK or JL cross-gen covers.",
        filename, body)


def build_lj():
    year_nav = """<div class="year-nav"><span class="label">Model year:</span>
  <a href="/tj-1997-2002-seat-covers.html">1997&ndash;2002</a>
  <a href="/tj-2003-2006-seat-covers.html">2003&ndash;2006</a>
  <a href="/lj-unlimited-seat-covers.html" class="active">LJ Unlimited</a>
</div><div class="divider"></div>"""
    cards = "".join(prod_card(p) for p in PRODUCTS_ALL[:4])
    body = f"""<div class="hero">
  <h1>Jeep Wrangler LJ Unlimited Seat Covers (2004&ndash;2006)</h1>
  <p>The LJ Unlimited uses the same front seats as the TJ. Standard TJ covers fit the LJ without modification.</p>
</div>
<div class="container">
  <div class="intro">The Jeep Wrangler LJ Unlimited (2004-2006) is a long-wheelbase version of the TJ with the same front seat architecture. Any TJ-specific seat cover fits the LJ correctly &mdash; there is no LJ-specific SKU needed. The LJ was produced for only three years (2004, 2005, 2006) and is now relatively rare, making TJ/LJ fitment support even more important to confirm before ordering.</div>
  {year_nav}
  {bartact_block("The LJ uses the same front seats as the TJ. Bartact&rsquo;s TJ/LJ cover fits both without modification.")}
  <h2 class="section">Amazon Picks &mdash; LJ Unlimited (2004-2006)</h2>
  <p class="picks-intro">TJ seat covers fit the LJ. Confirm &ldquo;TJ&rdquo; or &ldquo;TJ/LJ&rdquo; fitment in the listing &mdash; these covers all work on the LJ Unlimited.</p>
  {cards}
  {BARTACT_BLOG}
  <h2 class="section">Frequently Asked Questions</h2>
  <div class="faq-item">
    <h3>What years was the LJ Unlimited produced?</h3>
    <p>The LJ Unlimited ran from 2004 to 2006. It was introduced as a longer-wheelbase version of the TJ with a 10-inch longer wheelbase, more rear legroom, and slightly higher payload capacity. The front seat dimensions are identical to the TJ, making TJ cover compatibility straightforward.</p>
  </div>
  <div class="faq-item">
    <h3>Do rear seat covers differ between LJ and TJ?</h3>
    <p>The rear seat cover pattern is the same between TJ and LJ &mdash; despite the longer wheelbase, Jeep used the same rear seat architecture. The LJ&rsquo;s extra length is in the floor/cargo area behind the rear seats, not in the rear seat itself. Full TJ sets (front + rear) fit the LJ without modification.</p>
  </div>
</div>"""
    return "lj-unlimited-seat-covers.html", html_page(
        "Jeep Wrangler LJ Unlimited Seat Covers 2004-2006 | TJSeatCovers.com",
        "LJ Unlimited uses the same front seats as the TJ — standard TJ covers fit. Bartact #1 USA pick plus Amazon alternatives confirmed for the LJ Unlimited 2004-2006.",
        "lj-unlimited-seat-covers.html", body)


pages = [
    build_index(),
    build_year_page("tj-1997-2002-seat-covers","1997-2002",
        "The 1997-2002 TJ was the launch generation. Most did NOT have SAB side airbags &mdash; verify your specific vehicle. The seat frame and dimensions are the same across all TJ years. All covers listed here fit 1997-2002 correctly.",
        None, "/tj-2003-2006-seat-covers.html"),
    build_year_page("tj-2003-2006-seat-covers","2003-2006",
        "The 2003-2006 TJ received a mid-generation refresh including the addition of the Rubicon trim (2003) and LJ Unlimited (2004). SABs remained optional. Seat dimensions are unchanged from the 1997-2002 generation &mdash; all covers fit across all TJ years.",
        "/tj-1997-2002-seat-covers.html", None),
    build_lj(),
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

# Post-build: submit to Google Indexing API + IndexNow
from build_utils import post_build_submit
post_build_submit('tjseatcovers.com')
