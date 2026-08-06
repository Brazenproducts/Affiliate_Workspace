#!/usr/bin/env python3
"""
Canonical builder for bestgolfcartaccessories.com
Separate page per category, real verified ASINs + CDN hashes.
Run: python3 build-bestgolfcartaccessories.py
"""
from pathlib import Path

SITE = "bestgolfcartaccessories.com"
OUT = Path(f"/home/ubuntu/.openclaw/workspace/sites/{SITE}")
TAG = "brazenprodu02-20"

# ── ALL VERIFIED ASINs + Hashes (pulled from Amazon browser, CDN verified) ─
PRODUCTS = {
    "lift-kits": [
        {"asin":"B0D6WDMKYK","hash":"61MjXTbFlCL","brand":"OEM Spec","name":"6 Inch Drop Axle Lift Kit — EZGO TXT 2001.5-2020","desc":"Heavy-duty steel drop axle, 4-bolt pattern. Fits 2001.5-2020 EZGO TXT Electric. Allows up to 23\" tires."},
        {"asin":"B073W7VYVJ","hash":"71wbfz9+YaL","brand":"ECOTRIC","name":"ECOTRIC 6\" Drop Axle Lift Kit — EZGO 1994.5-2001.5","desc":"Fits EZGO TXT/Medalist 1994.5-2001.5 Electric and Gas. Includes all hardware."},
        {"asin":"B0D3DXMV96","hash":"61dIZv63JxL","brand":"OEM Spec","name":"EZGO TXT 6\" Lift Kit Drop Axle 2001.5-2020","desc":"6-inch drop axle lift for EZGO TXT/PDS. Powder-coated steel, direct bolt-on."},
        {"asin":"B0DSG8FNRX","hash":"819vXOvXaKL","brand":"Jake's","name":"Jake's Long Travel Lift Kit — EZGO TXT 2001.5-2013","desc":"Jake's long-travel design for improved suspension travel. EZGO TXT 2001.5-2013."},
        {"asin":"B0BWFSZPD1","hash":"51GRltxAh5L","brand":"OEM Spec","name":"6\" Drop Axle Lift Kit — EZGO TXT/PDS 2001.5-2013 with 12\" wheels","desc":"Complete kit with drop spindles. Fits EZGO TXT/PDS 2001.5-2013, includes 12\" wheel adapters."},
    ],
    "cart-covers": [
        {"asin":"B07VV2MGPQ","hash":"713V0o4+LNL","brand":"NEVERLAND","name":"NEVERLAND Golf Cart Cover — 4 Passenger EZGO/Club Car/Yamaha","desc":"420D polyester, waterproof. Fits most 4-passenger golf carts. UV resistant, elastic hem."},
        {"asin":"B07V9CNC8M","hash":"71Kk6aXdZnL","brand":"10L0L","name":"10L0L Golf Cart Cover — 2/4/6 Passenger Universal","desc":"Heavy-duty 210D Oxford fabric. Fits EZGO, Club Car, Yamaha 2/4/6 passenger carts. Vented design."},
        {"asin":"B0C4KX6QK1","hash":"71fGv6g5WxL","brand":"NEVERLAND","name":"NEVERLAND Heavy Duty 420D Cover — 2/4/6 Passenger","desc":"Premium 420D waterproof cover. Double-stitched seams, adjustable elastic. UV and weather resistant."},
        {"asin":"B07PQG8LLR","hash":"51pVaf2WSlL","brand":"Explore Land","name":"Explore Land Waterproof Golf Cart Cover — Universal","desc":"Universal fit, 210D polyester with waterproof PU coating. Fits most 2 and 4 passenger carts."},
    ],
    "seat-covers": [
        {"asin":"B0D7GX4SPH","hash":"71S1U0nYDmL","brand":"NOKINS","name":"NOKINS Golf Cart Seat Covers — EZGO TXT 1994-2013 (4-piece)","desc":"4-piece set fits EZGO TXT 1994-2013. Water-resistant fabric, easy install, machine washable."},
        {"asin":"B0BY1LNJQT","hash":"71j7FV1QYQL","brand":"OEM Spec","name":"Golf Cart Seat Covers — EZGO TXT/RXV/Freedom/T48 Marine Grade","desc":"Marine-grade vinyl, custom-fit for EZGO TXT, RXV, Freedom, T48. UV and water resistant."},
        {"asin":"B09V57Q3NJ","hash":"91PQVWpStSL","brand":"OEM Spec","name":"Diamond Seat Cover Kit — EZGO TXT 1994-2013","desc":"Diamond-stitch pattern, fits EZGO TXT 1994-2013. Durable vinyl, easy wipe-clean surface."},
    ],
    "enclosures": [
        {"asin":"B0F38846XC","hash":"81TBCCt1bzL","brand":"OEM Spec","name":"4-Passenger Golf Cart Enclosure — EZGO RXV 80\" Extended Roof","desc":"Full enclosure for EZGO RXV 80\" extended roof 4-passenger. Clear panels, door zippers, side windows."},
        {"asin":"B0G1M311J5","hash":"71vdMGKARiL","brand":"OEM Spec","name":"4-Passenger Golf Cart Enclosure — EZGO TXT Short Roof","desc":"Fits EZGO TXT short roof 4-passenger. Weather-resistant, clear view panels with roll-up door."},
        {"asin":"B0FX82F8XK","hash":"21TjrUkqQaL","brand":"10L0L","name":"10L0L 4-Passenger Golf Cart Enclosure — 57\" Short Roof Universal","desc":"Universal short-roof enclosure, fits 4-passenger carts with 57\" roof. Clear panels, easy zip entry."},
    ],
    "lights": [
        {"asin":"B0F1Y41JVR","hash":"81repXEOjAL","brand":"EZGO","name":"EZGO Deluxe LED Light Bar Kit — Golf Cart LED Light Kit","desc":"Deluxe EZGO-specific LED light bar kit. Bright LEDs, direct plug-in wiring, front and rear lights included."},
        {"asin":"B0D4QVBS97","hash":"71ERaWfmVuL","brand":"OEM Spec","name":"Golf Cart LED Light Bar Kit — EZGO TXT 1996-2013 with Turn Signals","desc":"Complete LED light bar kit for EZGO TXT 1996-2013. Includes turn signals, brake lights, wiring harness."},
        {"asin":"B0CYLX67HB","hash":"71gD8NVjekL","brand":"Dr.Acces","name":"E-Z-GO TXT Complete Ultimate LED Light Bar Kit","desc":"Ultimate kit with front light bar, rear lights, turn signals, horn, and complete wiring. EZGO TXT."},
    ],
    "storage": [
        {"asin":"B07PVZ87VF","hash":"611PfqOsfhL","brand":"EZGO","name":"EZGO TXT Steel Cargo Box Kit (1996+)","desc":"OEM-style steel cargo box for EZGO TXT 1996 and up. Powder-coated, lockable, direct bolt-on."},
        {"asin":"B01LDFYWB8","hash":"612OlS1gmHL","brand":"OEM Spec","name":"EZGO TXT Black Steel Utility Cargo Box Kit with Brackets","desc":"Steel cargo box with mounting brackets for EZGO TXT. Black powder coat, weather resistant."},
        {"asin":"B07PV32PQQ","hash":"61pjb4FroOL","brand":"OEM Spec","name":"Universal Golf Cart Cargo Box","desc":"Universal cargo box fits most golf cart models. Heavy-duty plastic construction, easy mount."},
    ],
}

CATEGORY_LABELS = {
    "lift-kits": ("Lift Kits", "EZGO Golf Cart Lift Kits"),
    "cart-covers": ("Cart Covers", "Golf Cart Covers"),
    "seat-covers": ("Seat Covers", "EZGO Golf Cart Seat Covers"),
    "enclosures": ("Enclosures", "Golf Cart Enclosures"),
    "lights": ("LED Lights", "Golf Cart LED Lights"),
    "storage": ("Storage & Cargo", "Golf Cart Cargo Boxes"),
}

CSS = """<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#222;background:#fff;line-height:1.6}
header{background:#1b4332;color:#fff;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
header a{color:#fff;text-decoration:none;font-weight:700;font-size:1.1rem}
nav{display:flex;flex-wrap:wrap;gap:4px}
nav a{color:#ccc;text-decoration:none;padding:4px 10px;font-size:.85rem;border-radius:12px;transition:.15s}
nav a:hover,nav a.active{background:rgba(255,255,255,.15);color:#fff}
.hero{background:linear-gradient(135deg,#1b4332,#2d6a4f);color:#fff;padding:36px 20px;text-align:center}
.hero h1{font-size:1.9rem;max-width:700px;margin:0 auto 10px}
.hero p{color:#b7e4c7;max-width:600px;margin:0 auto}
.container{max-width:900px;margin:0 auto;padding:20px}
.breadcrumb{font-size:.85rem;color:#888;margin:16px 0}
.breadcrumb a{color:#2d6a4f;text-decoration:none}
.cat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:28px 0}
.cat-card{display:block;border:2px solid #e0e0e0;border-radius:10px;padding:16px 12px;text-decoration:none;text-align:center;color:#222;transition:.15s}
.cat-card:hover{border-color:#2d6a4f;background:#f0faf4}
.cat-card .icon{font-size:1.8rem;margin-bottom:6px}
.cat-card strong{display:block;font-size:.9rem}
.product-grid{display:flex;flex-direction:column;gap:16px;margin:20px 0}
.product-card{display:flex;gap:16px;border:1px solid #e0e0e0;border-radius:10px;padding:16px;align-items:flex-start;background:#fff}
.product-card img{width:120px;height:120px;object-fit:contain;border-radius:8px;background:#f9f9f9;border:1px solid #eee;flex-shrink:0}
.product-card .info{flex:1;min-width:0}
.product-card h3{font-size:1rem;margin-bottom:6px;color:#1b4332}
.product-card p{font-size:.88rem;color:#555;margin-bottom:10px}
.amz-btn{display:inline-block;background:#ff9900;color:#fff;padding:8px 18px;border-radius:5px;text-decoration:none;font-weight:700;font-size:.88rem}
.amz-btn:hover{background:#e08800}
footer{background:#1b4332;color:#aaa;text-align:center;padding:20px;font-size:.85rem;margin-top:40px}
footer .disclaimer{background:#f9f9f9;border:1px solid #ddd;border-radius:6px;padding:12px 16px;margin:0 auto 16px;max-width:800px;font-size:13px;color:#555;text-align:left}
@media(max-width:600px){.product-card{flex-direction:column}.product-card img{width:100%;height:160px}}
</style>"""

NAV_LINKS = {
    "lift-kits": "Lift Kits",
    "cart-covers": "Cart Covers",
    "seat-covers": "Seat Covers",
    "enclosures": "Enclosures",
    "lights": "LED Lights",
    "storage": "Storage",
}

DISCLAIMER_HTML = """<div class="disclaimer">
  <strong>Affiliate Disclosure:</strong> BestGolfCartAccessories.com participates in the Amazon Services LLC Associates Program. We earn a commission when you click links to Amazon and make a purchase, at no extra cost to you.
</div>"""

def header(active=""):
    nav = "".join(
        f'<a href="/{k}-accessories.html" {"class=\'active\'" if k==active else ""}>{v}</a>'
        for k,v in NAV_LINKS.items()
    )
    return f"""<header>
  <a href="/">BestGolfCartAccessories.com</a>
  <nav>{nav}</nav>
</header>"""

def footer():
    return f"""<footer>{DISCLAIMER_HTML}<p>&copy; 2026 BestGolfCartAccessories.com &mdash; Independent reviews. Not affiliated with E-Z-GO, Club Car, or Yamaha.</p></footer>"""

def product_card(p):
    img = f"https://m.media-amazon.com/images/I/{p['hash']}._AC_SL400_.jpg"
    return f"""<div class="product-card">
  <img src="{img}" alt="{p['name']}" loading="lazy">
  <div class="info">
    <h3>{p['name']}</h3>
    <p>{p['desc']}</p>
    <a href="https://www.amazon.com/dp/{p['asin']}?tag={TAG}" target="_blank" rel="noopener nofollow" class="amz-btn">View on Amazon</a>
  </div>
</div>"""

def page(title, meta, canonical, body):
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
<body>{header()}{body}{footer()}</body>
</html>"""

def category_page(cat_key):
    label, h1 = CATEGORY_LABELS[cat_key]
    products = PRODUCTS[cat_key]
    cards = "".join(product_card(p) for p in products)
    filename = f"{cat_key}-accessories.html"
    # Also generate ezgo and club-car subpages
    body = f"""<div class="hero">
  <h1>{h1} — Best Picks for EZGO, Club Car &amp; Yamaha</h1>
  <p>Verified products with real Amazon links. Updated 2026.</p>
</div>
<div class="container">
  <div class="breadcrumb"><a href="/">Home</a> &rsaquo; {label}</div>
  <div class="product-grid">{cards}</div>
</div>"""
    return filename, page(
        f"Best Golf Cart {label} 2026 — EZGO, Club Car, Yamaha | BestGolfCartAccessories.com",
        f"Top-rated golf cart {label.lower()} for EZGO, Club Car, and Yamaha. Real Amazon picks with verified images — updated 2026.",
        filename, body
    )

def index_page():
    cat_cards = {
        "lift-kits": ("&#128736;", "Lift Kits"),
        "cart-covers": ("&#9925;", "Cart Covers"),
        "seat-covers": ("&#129692;", "Seat Covers"),
        "enclosures": ("&#127968;", "Enclosures"),
        "lights": ("&#128161;", "LED Lights"),
        "storage": ("&#128230;", "Storage"),
    }
    grid = "".join(
        f'<a href="/{k}-accessories.html" class="cat-card"><div class="icon">{icon}</div><strong>{lbl}</strong></a>'
        for k,(icon,lbl) in cat_cards.items()
    )
    body = f"""<div class="hero">
  <h1>Best Golf Cart Accessories 2026</h1>
  <p>Lift kits, covers, seat covers, enclosures, LED lights, and storage — all with verified Amazon links.</p>
</div>
<div class="container">
  <h2 style="margin:24px 0 12px;font-size:1.2rem">Shop by Category</h2>
  <div class="cat-grid">{grid}</div>
</div>"""
    return "index.html", page(
        "Best Golf Cart Accessories 2026 — EZGO, Club Car, Yamaha",
        "Top-rated golf cart accessories for EZGO, Club Car, and Yamaha. Lift kits, covers, seat covers, enclosures, LED lights, and storage — verified Amazon picks.",
        "index.html", body
    )

# ── Build ────────────────────────────────────────────────────────────────────
pages = [index_page()] + [category_page(k) for k in PRODUCTS]

for filename, html in pages:
    dest = OUT / filename
    dest.write_text(html, encoding="utf-8")
    amz = html.count("amazon.com/dp/")
    print(f"  {'✅' if amz>=3 or filename=='index.html' else '⚠️ '} {filename}: {amz} AMZ links")

print(f"\nBuilt {len(pages)} pages for {SITE}")
