#!/usr/bin/env python3
"""Generate topoffroadstores.com — Dark/Bold Template (T3)"""
import os, json

BASE = "/home/ubuntu/.openclaw/workspace/affiliate-sites/topoffroadstores.com"
DOMAIN = "topoffroadstores.com"
NOW = "2026-04-16"

def w(name, content):
    p = os.path.join(BASE, name)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w') as f:
        f.write(content)
    print(f"  {name} ({len(content):,} bytes)")

with open("/home/ubuntu/.openclaw/workspace/affiliate-sites/gen_site2_data.json") as f:
    data = json.load(f)
retailers = data["retailers"]
manufacturers = data["manufacturers"]

CSS = """@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap');
:root{--bg:#1A1A1A;--bg-card:#242424;--bg-hover:#2E2E2E;--white:#F5F5F5;--gray:#999;--green:#00C853;--green-dark:#00A844;--border:#333;--accent:#00E676}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Roboto',sans-serif;background:var(--bg);color:var(--white);line-height:1.7}
h1,h2,h3,h4{font-family:'Oswald',sans-serif;text-transform:uppercase;letter-spacing:1px;line-height:1.2}
a{color:var(--green);text-decoration:none}a:hover{color:var(--accent);text-decoration:underline}
.container{max-width:1100px;margin:0 auto;padding:0 24px}
header{background:#111;border-bottom:2px solid var(--green);padding:16px 0;position:sticky;top:0;z-index:100}
header .container{display:flex;align-items:center;justify-content:space-between}
.logo{font-family:'Oswald',sans-serif;color:var(--white);font-size:1.5rem;font-weight:700;text-decoration:none}
.logo span{color:var(--green)}
nav a{color:var(--gray);margin-left:24px;font-size:.9rem;font-weight:500;text-transform:uppercase;letter-spacing:1px}
nav a:hover{color:var(--white);text-decoration:none}
.hero{background:linear-gradient(180deg,#111 0%,var(--bg) 100%);padding:100px 0 70px;text-align:center}
.hero h1{font-size:3.2rem;margin-bottom:16px;letter-spacing:3px}.hero h1 span{color:var(--green)}
.hero p{color:var(--gray);font-size:1.15rem;max-width:650px;margin:0 auto}
.section-header{text-align:center;padding:60px 0 30px}
.section-header h2{font-size:2.2rem;margin-bottom:10px}.section-header h2 span{color:var(--green)}
.section-header p{color:var(--gray);font-size:1rem;max-width:600px;margin:0 auto}
.divider{width:60px;height:3px;background:var(--green);margin:16px auto 0}
.card{background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:36px;margin-bottom:24px;transition:all .25s}
.card:hover{background:var(--bg-hover);border-color:var(--green);transform:translateY(-2px)}
.card .rank-badge{display:inline-block;background:var(--green);color:#111;font-family:'Oswald',sans-serif;font-weight:700;font-size:.85rem;padding:4px 16px;border-radius:4px;margin-bottom:14px;text-transform:uppercase}
.card h2{font-size:1.6rem;margin-bottom:6px}
.card .tagline{color:var(--gray);font-size:.95rem;margin-bottom:18px;font-style:italic}
.card .overview{margin-bottom:20px;color:#ddd}
.card .meta-row{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:18px}
.card .meta-tag{background:#1e1e1e;border:1px solid var(--border);padding:6px 14px;border-radius:4px;font-size:.85rem;color:var(--gray)}
.card .highlight{border-left:3px solid var(--green);padding-left:16px;margin:18px 0;color:#bbb;font-size:.95rem}
.visit-btn{display:inline-block;background:var(--green);color:#111;padding:14px 32px;border-radius:4px;font-family:'Oswald',sans-serif;font-weight:700;font-size:1rem;text-transform:uppercase;letter-spacing:1px;transition:background .2s}
.visit-btn:hover{background:var(--accent);text-decoration:none;color:#111}
footer{background:#111;border-top:2px solid var(--border);color:var(--gray);text-align:center;padding:40px 0;margin-top:60px;font-size:.85rem}
footer a{color:var(--green)}
.breadcrumb{font-size:.85rem;color:var(--gray);margin-bottom:20px}
.updated{color:var(--gray);font-size:.8rem;margin-top:12px}
@media(max-width:768px){.hero h1{font-size:2rem}.section-header h2{font-size:1.6rem}.card{padding:24px}}
"""
w("css/style.css", CSS)

def header_html():
    return '''<header><div class="container"><a href="index.html" class="logo">TOP <span>OFF-ROAD</span> STORES</a><nav><a href="index.html#retailers">Retailers</a><a href="index.html#manufacturers">Brands</a><a href="about.html">About</a></nav></div></header>'''

def footer_html():
    return '''<footer><div class="container"><p>&copy; 2026 Top Off-Road Stores. Independent editorial — no paid placements.</p><p style="margin-top:8px"><a href="about.html">About</a> · <a href="privacy.html">Privacy</a></p></div></footer>'''

def head_html(title, desc, path=""):
    canonical = f"https://{DOMAIN}/{path}" if path else f"https://{DOMAIN}/"
    return f'''<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><meta name="description" content="{desc}">
<link rel="canonical" href="{canonical}">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:url" content="{canonical}"><meta property="og:type" content="website">
<link rel="stylesheet" href="css/style.css">
<script type="application/ld+json">[{{"@context":"https://schema.org","@type":"WebSite","name":"Top Off-Road Stores","url":"https://{DOMAIN}/","description":"The best off-road retailers and manufacturers, profiled and ranked"}},{{"@context":"https://schema.org","@type":"Organization","name":"Top Off-Road Stores","url":"https://{DOMAIN}/"}}]</script></head>'''

# Build retailer cards
ret_cards = ""
for r in retailers:
    ret_cards += f'''
<div class="card" id="{r['slug']}">
  <span class="rank-badge">#{r['rank']} Retailer</span>
  <h2><a href="profiles/{r['slug']}.html">{r['name']}</a></h2>
  <p class="tagline">{r['tagline']}</p>
  <div class="meta-row">
    <span class="meta-tag">🔧 {r['known_for'][:50]}...</span>
  </div>
  <div class="overview"><p>{r['overview']}</p></div>
  <div class="highlight"><strong>Why they made the list:</strong> {r['why']}</div>
  <a href="{r['url']}" class="visit-btn" target="_blank" rel="noopener">Visit {r['name']} →</a>
</div>'''

mfg_cards = ""
for m in manufacturers:
    mfg_cards += f'''
<div class="card" id="{m['slug']}">
  <span class="rank-badge">#{m['rank']} Brand</span>
  <h2><a href="profiles/{m['slug']}.html">{m['name']}</a></h2>
  <p class="tagline">{m['tagline']}</p>
  <div class="meta-row">
    <span class="meta-tag">🏭 {m['known_for'][:60]}...</span>
    <span class="meta-tag">📦 {m['products'][:50]}...</span>
  </div>
  <div class="overview"><p>{m['overview']}</p></div>
  <div class="highlight"><strong>Why they made the list:</strong> {m['why']}</div>
  <a href="{m['url']}" class="visit-btn" target="_blank" rel="noopener">Visit {m['name']} →</a>
</div>'''

index_html = f'''{head_html("Best Off-Road Stores & Brands 2026 | Top Off-Road Stores", "The definitive guide to the best off-road retailers, stores, and manufacturers. Independently reviewed and ranked.")}
<body>
{header_html()}
<section class="hero">
  <div class="container">
    <h1>THE BEST <span>OFF-ROAD</span> STORES<br>& BRANDS OF 2026</h1>
    <p>We profiled the retailers and manufacturers that serious off-roaders actually trust. No paid placements. No sponsored rankings. Just honest takes from people who break stuff on trails.</p>
  </div>
</section>

<section class="section-header" id="retailers">
  <h2>TOP <span>RETAILERS</span> & STORES</h2>
  <p>The best places to buy off-road parts online and in-person. Ranked by selection, expertise, pricing, and overall experience.</p>
  <div class="divider"></div>
</section>
<div class="container">
  {ret_cards}
</div>

<section class="section-header" id="manufacturers">
  <h2>TOP <span>MANUFACTURERS</span> & BRANDS</h2>
  <p>The companies that actually design and build the parts. These are the brands that define the off-road industry.</p>
  <div class="divider"></div>
</section>
<div class="container">
  {mfg_cards}
</div>

{footer_html()}
</body></html>'''
w("index.html", index_html)

# Profile pages
os.makedirs(os.path.join(BASE, "profiles"), exist_ok=True)
for items, label in [(retailers, "Retailer"), (manufacturers, "Brand")]:
    for item in items:
        page = f'''{head_html(f"{item['name']} — {label} Profile | Top Off-Road Stores", f"Full profile of {item['name']}: what they sell, why they're trusted, and whether they deserve a spot in your bookmarks.", f"profiles/{item['slug']}.html")}
<body>
{header_html()}
<div class="container" style="padding-top:40px;max-width:900px">
  <p class="breadcrumb"><a href="../index.html">Home</a> → <a href="../index.html#{'retailers' if label=='Retailer' else 'manufacturers'}">{label}s</a> → {item['name']}</p>
  <div class="card" style="border-left:3px solid var(--green)">
    <span class="rank-badge">#{item['rank']} {label}</span>
    <h1 style="font-size:2.2rem;margin-bottom:8px">{item['name']}</h1>
    <p class="tagline">{item['tagline']}</p>
  </div>
  <div style="margin:30px 0">
    <h2 style="margin-bottom:16px">FULL PROFILE</h2>
    <div class="overview"><p>{item['overview']}</p></div>
  </div>
  <div style="margin:30px 0">
    <h2 style="margin-bottom:16px">WHAT THEY'RE KNOWN FOR</h2>
    <p style="color:#bbb">{item['known_for']}</p>
  </div>
  <div style="margin:30px 0">
    <h2 style="margin-bottom:16px">PRODUCT RANGE</h2>
    <p style="color:#bbb">{item['products']}</p>
  </div>
  <div class="highlight" style="margin:30px 0"><strong>Why they made our list:</strong> {item['why']}</div>
  <a href="{item['url']}" class="visit-btn" target="_blank" rel="noopener">Visit {item['name']} →</a>
  <p class="updated" style="margin-top:20px">Profile last updated: April 2026</p>
</div>
{footer_html()}
</body></html>'''
        w(f"profiles/{item['slug']}.html", page)

# About
about = f'''{head_html("About | Top Off-Road Stores", "About Top Off-Road Stores: who we are and how we choose which stores and brands to feature.", "about.html")}
<body>
{header_html()}
<div class="container" style="padding:60px 0;max-width:800px">
  <h1>ABOUT THIS SITE</h1>
  <p style="margin:24px 0;color:#bbb">Top Off-Road Stores is an independent editorial site built by off-road enthusiasts for off-road enthusiasts. We profile the retailers and manufacturers that we've personally bought from, used, and trust.</p>
  <p style="margin:24px 0;color:#bbb">No store or brand pays for placement on this site. Our rankings reflect real-world experience — who has the best selection, who actually knows what they're talking about, who ships on time, and who stands behind their products.</p>
  <p style="margin:24px 0;color:#bbb">Some links on this site may be affiliate links, which means we earn a small commission if you make a purchase. This never influences our editorial decisions or rankings.</p>
  <h2 style="margin:40px 0 16px">CONTACT</h2>
  <p style="color:#bbb">Suggestions? Corrections? <strong>editors@topoffroadstores.com</strong></p>
</div>
{footer_html()}
</body></html>'''
w("about.html", about)

# Privacy
privacy = f'''{head_html("Privacy Policy | Top Off-Road Stores", "Privacy policy for Top Off-Road Stores.", "privacy.html")}
<body>
{header_html()}
<div class="container" style="padding:60px 0;max-width:800px">
  <h1>PRIVACY POLICY</h1>
  <p style="margin:24px 0;color:#bbb">Top Off-Road Stores does not collect personal data, use tracking cookies, or require registration. Some affiliate links may set cookies via third-party retailers, governed by their respective privacy policies.</p>
  <p style="margin:24px 0;color:#bbb">We use no analytics. We don't sell data. We don't have data to sell.</p>
  <p class="updated">Last updated: April 2026</p>
</div>
{footer_html()}
</body></html>'''
w("privacy.html", privacy)

# Sitemap
pages = ["", "about.html", "privacy.html"]
pages += [f"profiles/{r['slug']}.html" for r in retailers]
pages += [f"profiles/{m['slug']}.html" for m in manufacturers]
sm = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
for p in pages:
    sm += f'  <url><loc>https://{DOMAIN}/{p}</loc><lastmod>{NOW}</lastmod><changefreq>monthly</changefreq></url>\n'
sm += '</urlset>'
w("sitemap.xml", sm)

print("  ✅ topoffroadstores.com complete!\n")
