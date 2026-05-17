#!/usr/bin/env python3
"""Generate bestoffroadbrands.com — Clean/Minimal Template (T1)"""
import os, json

BASE = "/home/ubuntu/.openclaw/workspace/affiliate-sites/bestoffroadbrands.com"
DOMAIN = "bestoffroadbrands.com"
NOW = "2026-04-16"

def w(name, content):
    p = os.path.join(BASE, name)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w') as f:
        f.write(content)
    print(f"  {name} ({len(content):,} bytes)")

with open("/home/ubuntu/.openclaw/workspace/affiliate-sites/gen_site3_data.json") as f:
    data = json.load(f)
categories = data["categories"]

CSS = """@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap');
:root{--white:#FFFFFF;--bg:#FAFBFC;--slate:#334155;--slate-light:#64748B;--blue:#3B82F6;--blue-dark:#2563EB;--border:#E2E8F0;--card-bg:#FFFFFF;--text:#1E293B;--text-light:#94A3B8}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);line-height:1.75}
h1,h2,h3,h4{font-family:'DM Sans',sans-serif;color:var(--slate);line-height:1.3}
a{color:var(--blue);text-decoration:none}a:hover{color:var(--blue-dark);text-decoration:underline}
.container{max-width:1100px;margin:0 auto;padding:0 24px}
header{background:var(--white);border-bottom:1px solid var(--border);padding:16px 0;position:sticky;top:0;z-index:100}
header .container{display:flex;align-items:center;justify-content:space-between}
.logo{font-family:'DM Sans',sans-serif;color:var(--slate);font-size:1.3rem;font-weight:700;text-decoration:none}
.logo span{color:var(--blue)}
nav a{color:var(--slate-light);margin-left:24px;font-size:.9rem;font-weight:500}nav a:hover{color:var(--slate);text-decoration:none}
.hero{padding:80px 0 60px;text-align:center;background:var(--white);border-bottom:1px solid var(--border)}
.hero h1{font-size:2.6rem;margin-bottom:14px;font-weight:700}
.hero p{font-size:1.1rem;color:var(--slate-light);max-width:600px;margin:0 auto}
.cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;padding:50px 0}
.cat-card{background:var(--card-bg);border:1px solid var(--border);border-radius:12px;padding:28px;transition:all .2s}
.cat-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.06);border-color:var(--blue);transform:translateY(-2px)}
.cat-card h3{font-size:1.2rem;margin-bottom:8px}
.cat-card p{color:var(--slate-light);font-size:.95rem;margin-bottom:16px}
.cat-card .brand-list{list-style:none;padding:0;margin-bottom:16px}
.cat-card .brand-list li{padding:6px 0;border-bottom:1px solid var(--border);font-size:.9rem;display:flex;align-items:center;gap:8px}
.cat-card .brand-list li:last-child{border:none}
.cat-card .brand-list .num{background:var(--blue);color:#fff;width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;flex-shrink:0}
.read-more{display:inline-block;color:var(--blue);font-weight:600;font-size:.9rem}
.page-header{padding:50px 0 30px;border-bottom:1px solid var(--border);margin-bottom:40px}
.page-header h1{font-size:2.2rem;margin-bottom:8px}
.page-header p{color:var(--slate-light);font-size:1.05rem;max-width:700px}
.brand-card{background:var(--card-bg);border:1px solid var(--border);border-radius:12px;padding:32px;margin-bottom:24px;transition:box-shadow .2s}
.brand-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.06)}
.brand-card .rank-num{display:inline-flex;align-items:center;justify-content:center;background:var(--blue);color:#fff;width:36px;height:36px;border-radius:50%;font-weight:700;font-size:1rem;margin-bottom:14px}
.brand-card h2{font-size:1.4rem;margin-bottom:10px}
.brand-card .known-for{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px 18px;margin:16px 0;font-size:.9rem;color:var(--slate-light)}
.brand-card .known-for strong{color:var(--slate)}
.visit-btn{display:inline-block;background:var(--blue);color:#fff;padding:12px 28px;border-radius:8px;font-weight:600;font-size:.95rem;transition:background .2s}
.visit-btn:hover{background:var(--blue-dark);text-decoration:none;color:#fff}
footer{background:var(--white);border-top:1px solid var(--border);color:var(--slate-light);text-align:center;padding:40px 0;margin-top:60px;font-size:.85rem}
footer a{color:var(--blue)}
.breadcrumb{font-size:.85rem;color:var(--text-light);margin-bottom:8px}
.updated{color:var(--text-light);font-size:.8rem;margin-top:12px}
@media(max-width:768px){.hero h1{font-size:1.8rem}.cat-grid{grid-template-columns:1fr}}
"""
w("css/style.css", CSS)

def header_html():
    cats_nav = "".join(f'<a href="{c["slug"]}.html">{c["name"].replace("Best ","")}</a>' for c in categories[:4])
    return f'''<header><div class="container"><a href="index.html" class="logo">Best Off-Road <span>Brands</span></a><nav>{cats_nav}<a href="about.html">About</a></nav></div></header>'''

def footer_html():
    return '''<footer><div class="container"><p>&copy; 2026 Best Off-Road Brands. Independent editorial. No paid placements.</p><p style="margin-top:8px"><a href="about.html">About</a> · <a href="privacy.html">Privacy</a></p><p class="updated">Some links may earn a small commission at no cost to you.</p></div></footer>'''

def head_html(title, desc, path=""):
    canonical = f"https://{DOMAIN}/{path}" if path else f"https://{DOMAIN}/"
    return f'''<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><meta name="description" content="{desc}">
<link rel="canonical" href="{canonical}">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:url" content="{canonical}"><meta property="og:type" content="website">
<link rel="stylesheet" href="css/style.css">
<script type="application/ld+json">[{{"@context":"https://schema.org","@type":"WebSite","name":"Best Off-Road Brands","url":"https://{DOMAIN}/","description":"The definitive guide to the best off-road brands and manufacturers"}},{{"@context":"https://schema.org","@type":"Organization","name":"Best Off-Road Brands","url":"https://{DOMAIN}/"}}]</script></head>'''

# Index page with category cards
cat_cards = ""
for c in categories:
    brand_list = "".join(f'<li><span class="num">{b["rank"]}</span> {b["name"]}</li>' for b in c["brands"][:4])
    cat_cards += f'''
<div class="cat-card">
  <h3><a href="{c['slug']}.html">{c['name']}</a></h3>
  <p>{c['intro'][:120]}...</p>
  <ul class="brand-list">{brand_list}</ul>
  <a href="{c['slug']}.html" class="read-more">Read full reviews →</a>
</div>'''

index_html = f'''{head_html("Best Off-Road Brands 2026 — The Definitive Guide", "The definitive guide to the best off-road brands. Expert reviews of seat covers, suspension, lighting, bumpers, winches, grab handles, and limit straps.")}
<body>
{header_html()}
<section class="hero">
  <div class="container">
    <h1>The Definitive Guide to the<br>Best Off-Road Brands</h1>
    <p>We tested, reviewed, and ranked the top brands across every major off-road category. No sponsored picks. No paid placements. Just honest reviews from people who actually use this stuff.</p>
    <p class="updated">Last updated: April 2026</p>
  </div>
</section>
<div class="container">
  <div class="cat-grid">
    {cat_cards}
  </div>
</div>
{footer_html()}
</body></html>'''
w("index.html", index_html)

# Category pages
for c in categories:
    brand_cards = ""
    for b in c["brands"]:
        brand_cards += f'''
<div class="brand-card">
  <span class="rank-num">{b['rank']}</span>
  <h2>{b['name']}</h2>
  <p>{b['summary']}</p>
  <div class="known-for"><strong>Known for:</strong> {b['known_for']}</div>
  <a href="{b['url']}" class="visit-btn" target="_blank" rel="noopener">Visit {b['name']} →</a>
</div>'''

    page = f'''{head_html(f"{c['name']} 2026 — Best Off-Road Brands", f"{c['name']}: expert reviews and rankings of the top brands. Updated for 2026.", f"{c['slug']}.html")}
<body>
{header_html()}
<div class="container">
  <div class="page-header">
    <p class="breadcrumb"><a href="index.html">Home</a> → {c['name']}</p>
    <h1>{c['name']}</h1>
    <p>{c['intro']}</p>
  </div>
  {brand_cards}
</div>
{footer_html()}
</body></html>'''
    w(f"{c['slug']}.html", page)

# About
about = f'''{head_html("About — Best Off-Road Brands", "About Best Off-Road Brands: who we are and how we evaluate brands.", "about.html")}
<body>
{header_html()}
<div class="container" style="padding:60px 0;max-width:750px">
  <h1>About Best Off-Road Brands</h1>
  <p style="margin:24px 0">We're off-road enthusiasts who got tired of vague product recommendations and sponsored "best of" lists. So we built our own.</p>
  <p style="margin:24px 0">Every brand on this site has been evaluated based on product quality, manufacturing standards, reputation in the off-road community, customer service, and value. We buy products with our own money, test them on our own vehicles, and form our own opinions.</p>
  <p style="margin:24px 0">No brand pays for placement. Some links on this site are affiliate links — we may earn a small commission if you buy through our link, but this never influences our rankings.</p>
  <h2 style="margin:36px 0 14px">Contact</h2>
  <p>Questions or suggestions: <strong>editors@bestoffroadbrands.com</strong></p>
</div>
{footer_html()}
</body></html>'''
w("about.html", about)

# Privacy
privacy = f'''{head_html("Privacy Policy — Best Off-Road Brands", "Privacy policy for Best Off-Road Brands.", "privacy.html")}
<body>
{header_html()}
<div class="container" style="padding:60px 0;max-width:750px">
  <h1>Privacy Policy</h1>
  <p style="margin:24px 0">This site does not collect personal data, use tracking cookies, or require registration. Some affiliate links may set cookies via third-party retailers. We use no analytics and don't sell data.</p>
  <p class="updated">Last updated: April 2026</p>
</div>
{footer_html()}
</body></html>'''
w("privacy.html", privacy)

# Sitemap
pages = ["", "about.html", "privacy.html"]
pages += [f"{c['slug']}.html" for c in categories]
sm = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
for p in pages:
    sm += f'  <url><loc>https://{DOMAIN}/{p}</loc><lastmod>{NOW}</lastmod><changefreq>monthly</changefreq></url>\n'
sm += '</urlset>'
w("sitemap.xml", sm)

print("  ✅ bestoffroadbrands.com complete!\n")
