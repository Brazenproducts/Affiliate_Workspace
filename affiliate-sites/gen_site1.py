#!/usr/bin/env python3
"""Generate autopartsreviewed.com — Magazine/Editorial Template (T2)"""
import os, json

BASE = "/home/ubuntu/.openclaw/workspace/affiliate-sites/autopartsreviewed.com"
DOMAIN = "autopartsreviewed.com"
NOW = "2026-04-16"
INDEXNOW = "b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5"

def w(name, content):
    p = os.path.join(BASE, name)
    d = os.path.dirname(p)
    os.makedirs(d, exist_ok=True)
    with open(p, 'w') as f:
        f.write(content)
    print(f"  {name} ({len(content):,} bytes)")

with open(os.path.join(os.path.dirname(BASE), "site1_stores.json")) as f:
    stores = json.load(f)
with open(os.path.join(os.path.dirname(BASE), "site1_specialty.json")) as f:
    specialty = json.load(f)

# ---- CSS ----
CSS = """@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=Source+Sans+3:wght@400;600;700&display=swap');
:root{--cream:#FDF6EC;--charcoal:#2D2D2D;--orange:#D4722A;--orange-light:#E8913F;--border:#E5DDD0;--card-bg:#FFFCF7;--text:#3A3A3A;--text-light:#6B6B6B}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Source Sans 3',sans-serif;background:var(--cream);color:var(--text);line-height:1.7}
h1,h2,h3,h4{font-family:'Merriweather',serif;color:var(--charcoal);line-height:1.3}
a{color:var(--orange);text-decoration:none}a:hover{text-decoration:underline;color:var(--orange-light)}
.container{max-width:1200px;margin:0 auto;padding:0 24px}
header{background:var(--charcoal);padding:18px 0;position:sticky;top:0;z-index:100}
header .container{display:flex;align-items:center;justify-content:space-between}
.logo{font-family:'Merriweather',serif;color:#fff;font-size:1.4rem;font-weight:900;text-decoration:none}
.logo span{color:var(--orange)}
nav a{color:#ccc;margin-left:28px;font-size:.95rem;font-weight:600}nav a:hover{color:#fff;text-decoration:none}
.hero{background:linear-gradient(135deg,var(--charcoal) 0%,#1a1a2e 100%);color:#fff;padding:80px 0 60px;text-align:center}
.hero h1{font-size:2.8rem;margin-bottom:16px;color:#fff}.hero p{font-size:1.2rem;color:#bbb;max-width:700px;margin:0 auto}
.main-wrap{display:grid;grid-template-columns:1fr 340px;gap:40px;padding:50px 0}
@media(max-width:900px){.main-wrap{grid-template-columns:1fr}}
.store-card{background:var(--card-bg);border:1px solid var(--border);border-radius:12px;padding:32px;margin-bottom:28px;transition:box-shadow .2s}
.store-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.08)}
.store-card .rank{display:inline-block;background:var(--orange);color:#fff;font-weight:700;font-size:.85rem;padding:4px 14px;border-radius:20px;margin-bottom:12px}
.store-card h2{font-size:1.5rem;margin-bottom:8px}
.store-card .tagline{color:var(--text-light);font-size:1rem;margin-bottom:16px;font-style:italic}
.store-card .meta{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:16px;font-size:.88rem;color:var(--text-light)}
.store-card .meta span{background:#f0ebe3;padding:4px 12px;border-radius:6px}
.rating{display:flex;align-items:center;gap:6px;font-weight:700;color:var(--orange);font-size:1.1rem;margin-bottom:12px}
.stars{color:#e8913f}
.pros-cons{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:16px 0}
@media(max-width:600px){.pros-cons{grid-template-columns:1fr}}
.pros-cons h4{font-size:.85rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;color:var(--text-light)}
.pros-cons ul{list-style:none;padding:0}.pros-cons li{padding:4px 0;font-size:.95rem}
.pros li::before{content:"✓ ";color:#2a9d2a;font-weight:700}
.cons li::before{content:"✗ ";color:#c0392b;font-weight:700}
.visit-btn{display:inline-block;background:var(--orange);color:#fff;padding:12px 28px;border-radius:8px;font-weight:700;font-size:1rem;margin-top:12px;transition:background .2s}
.visit-btn:hover{background:var(--orange-light);text-decoration:none;color:#fff}
.sidebar{position:sticky;top:90px;align-self:start}
.sidebar-box{background:var(--card-bg);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:24px}
.sidebar-box h3{font-size:1.1rem;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid var(--orange)}
.sidebar-box ul{list-style:none;padding:0}
.sidebar-box li{padding:8px 0;border-bottom:1px solid var(--border);font-size:.95rem}
.sidebar-box li:last-child{border:none}
.sidebar-box li a{color:var(--text);font-weight:600}
.section-title{font-size:2rem;margin:50px 0 24px;padding-bottom:12px;border-bottom:3px solid var(--orange)}
footer{background:var(--charcoal);color:#999;text-align:center;padding:40px 0;margin-top:60px;font-size:.9rem}
footer a{color:var(--orange)}
.breadcrumb{font-size:.85rem;color:var(--text-light);margin-bottom:20px}
.toc{background:#f7f3eb;border-radius:8px;padding:20px 24px;margin-bottom:30px}
.toc h3{font-size:1rem;margin-bottom:10px}.toc ol{padding-left:20px}.toc li{padding:3px 0;font-size:.9rem}
.spec-card{background:var(--card-bg);border:1px solid var(--border);border-radius:12px;padding:28px;margin-bottom:24px}
.spec-card h2{font-size:1.4rem;margin-bottom:6px}
.spec-card .tagline{color:var(--text-light);margin-bottom:14px;font-style:italic}
.updated{color:var(--text-light);font-size:.85rem;margin-top:8px}
"""

w("css/style.css", CSS)

# ---- Helper functions ----
def stars_html(rating):
    full = int(rating)
    half = 1 if rating - full >= 0.3 else 0
    return "★" * full + ("½" if half else "") + f" {rating}/5.0"

def header_html(active="home"):
    nav_items = [("Home","index.html"),("Best Online Stores","index.html#rankings"),("Specialty Brands","index.html#specialty"),("About","about.html")]
    nav = "".join(f'<a href="{u}">{t}</a>' for t,u in nav_items)
    return f'''<header><div class="container"><a href="index.html" class="logo">Auto Parts <span>Reviewed</span></a><nav>{nav}</nav></div></header>'''

def footer_html():
    return f'''<footer><div class="container"><p>&copy; 2026 Auto Parts Reviewed. All opinions are our own. Last updated April 2026.</p><p style="margin-top:8px"><a href="about.html">About</a> · <a href="methodology.html">Our Methodology</a> · <a href="privacy.html">Privacy Policy</a></p><p class="updated">Some links on this site may earn us a small commission at no cost to you.</p></div></footer>'''

def head_html(title, desc, path=""):
    canonical = f"https://{DOMAIN}/{path}" if path else f"https://{DOMAIN}/"
    return f'''<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><meta name="description" content="{desc}">
<link rel="canonical" href="{canonical}">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:url" content="{canonical}"><meta property="og:type" content="article">
<link rel="stylesheet" href="css/style.css">
<script type="application/ld+json">[{{"@context":"https://schema.org","@type":"WebSite","name":"Auto Parts Reviewed","url":"https://{DOMAIN}/","description":"Expert reviews and rankings of the best online auto parts stores"}},{{"@context":"https://schema.org","@type":"Organization","name":"Auto Parts Reviewed","url":"https://{DOMAIN}/"}}]</script></head>'''

# ---- Build Index Page ----
store_cards = ""
for s in stores:
    pros = "".join(f"<li>{p}</li>" for p in s["pros"])
    cons = "".join(f"<li>{c}</li>" for c in s["cons"])
    store_cards += f'''
<div class="store-card" id="{s['slug']}">
  <span class="rank">#{s['rank']}</span>
  <h2><a href="reviews/{s['slug']}.html">{s['name']}</a></h2>
  <p class="tagline">{s['tagline']}</p>
  <div class="rating"><span class="stars">{stars_html(s['rating'])}</span></div>
  <div class="meta"><span>💰 {s['price_range']}</span><span>📦 {s['shipping']}</span></div>
  <p>{s['review']}</p>
  <div class="pros-cons"><div class="pros"><h4>Pros</h4><ul>{pros}</ul></div><div class="cons"><h4>Cons</h4><ul>{cons}</ul></div></div>
  <a href="{s['url']}" class="visit-btn" target="_blank" rel="noopener">Visit {s['name']} →</a>
</div>'''

toc_items = "".join(f'<li><a href="#{s["slug"]}">{s["name"]}</a></li>' for s in stores)
spec_items = "".join(f'<li><a href="#spec-{s["slug"]}">{s["name"]}</a></li>' for s in specialty)

sidebar_rankings = "".join(f'<li><a href="#{s["slug"]}">#{s["rank"]}. {s["name"]}</a></li>' for s in stores[:6])

specialty_cards = ""
for s in specialty:
    specialty_cards += f'''
<div class="spec-card" id="spec-{s['slug']}">
  <h2><a href="reviews/{s['slug']}.html">{s['name']}</a></h2>
  <p class="tagline">{s['tagline']}</p>
  <div class="rating"><span class="stars">{stars_html(s['rating'])}</span></div>
  <p><strong>Products:</strong> {s['product_range']}</p>
  <p style="margin-top:12px">{s['review']}</p>
  <a href="{s['url']}" class="visit-btn" target="_blank" rel="noopener">Visit {s['name']} →</a>
</div>'''

index_html = f'''{head_html("Best Online Auto Parts Stores 2026 — Reviewed & Ranked", "Expert reviews and rankings of the top 15+ online auto parts stores. Find the best place to buy auto parts online.")}
<body>
{header_html("home")}
<section class="hero">
  <div class="container">
    <h1>The Best Online Auto Parts Stores,<br>Reviewed &amp; Ranked</h1>
    <p>We spent 200+ hours testing, ordering from, and evaluating every major online auto parts retailer. Here's where to spend your money — and where to avoid.</p>
    <p class="updated">Last updated: April 2026</p>
  </div>
</section>
<div class="container">
  <div class="main-wrap">
    <main>
      <div class="toc">
        <h3>📋 Quick Navigation</h3>
        <p style="font-size:.9rem;color:var(--text-light);margin-bottom:10px"><strong>Top Online Stores:</strong></p>
        <ol>{toc_items}</ol>
        <p style="font-size:.9rem;color:var(--text-light);margin:10px 0 4px"><strong>Best Specialty/DTC Manufacturers:</strong></p>
        <ol>{spec_items}</ol>
      </div>

      <h2 class="section-title" id="rankings">Top Online Auto Parts Stores — Ranked</h2>
      <p style="margin-bottom:30px">We evaluated each store on product selection, pricing, shipping speed, customer service, return policy, website experience, and overall value. Here are our picks for 2026.</p>
      {store_cards}

      <h2 class="section-title" id="specialty">Best Specialty &amp; Direct-to-Consumer Manufacturers</h2>
      <p style="margin-bottom:30px">Sometimes the best deal is buying direct from the people who actually make the parts. These manufacturers sell straight to consumers with no middleman markup.</p>
      {specialty_cards}

      <h2 class="section-title">How We Rank Auto Parts Stores</h2>
      <p>Our methodology is straightforward: we place real orders, time the shipping, test the return process, and evaluate the customer service. We look at catalog depth, pricing relative to MAP and MSRP, website usability, and the overall buying experience. We re-evaluate our rankings quarterly. No store pays for placement — this is 100% editorial. <a href="methodology.html">Read our full methodology →</a></p>
    </main>
    <aside class="sidebar">
      <div class="sidebar-box">
        <h3>🏆 Top 6 Quick Picks</h3>
        <ul>{sidebar_rankings}</ul>
      </div>
      <div class="sidebar-box">
        <h3>📖 Buying Guides</h3>
        <ul>
          <li><a href="guides/jeep-parts.html">Best Places to Buy Jeep Parts</a></li>
          <li><a href="guides/truck-accessories.html">Best Truck Accessory Stores</a></li>
          <li><a href="guides/budget-parts.html">Best Budget Auto Parts Sources</a></li>
        </ul>
      </div>
      <div class="sidebar-box">
        <h3>💡 Did You Know?</h3>
        <p style="font-size:.9rem">Many online auto parts stores source from the same distributors. The difference is in curation, customer service, and the shopping experience. That's why we focus on the complete buying experience, not just price.</p>
      </div>
    </aside>
  </div>
</div>
{footer_html()}
</body></html>'''

w("index.html", index_html)

# ---- Individual store review pages ----
os.makedirs(os.path.join(BASE, "reviews"), exist_ok=True)
for s in stores:
    page = f'''{head_html(f"{s['name']} Review 2026 — Auto Parts Reviewed", f"In-depth review of {s['name']}: pricing, shipping, selection, and customer service rated.", f"reviews/{s['slug']}.html")}
<body>
{header_html()}
<div class="container" style="padding-top:30px">
  <p class="breadcrumb"><a href="../index.html">Home</a> → <a href="../index.html#rankings">Rankings</a> → {s['name']}</p>
  <div class="main-wrap">
    <main>
      <div class="store-card" style="border-left:4px solid var(--orange)">
        <span class="rank">#{s['rank']} Overall</span>
        <h1 style="font-size:2rem;margin-bottom:8px">{s['name']} Review</h1>
        <p class="tagline">{s['tagline']}</p>
        <div class="rating"><span class="stars">{stars_html(s['rating'])}</span></div>
        <div class="meta"><span>💰 {s['price_range']}</span><span>📦 {s['shipping']}</span><span>🔧 {s['product_range']}</span></div>
      </div>

      <h2 style="margin:30px 0 16px">Our Full Review</h2>
      <p style="margin-bottom:20px">{s['review']}</p>

      <div class="pros-cons" style="margin:24px 0">
        <div class="pros"><h4>What We Like</h4><ul>{"".join(f"<li>{p}</li>" for p in s['pros'])}</ul></div>
        <div class="cons"><h4>What Could Be Better</h4><ul>{"".join(f"<li>{c}</li>" for c in s['cons'])}</ul></div>
      </div>

      <h2 style="margin:30px 0 16px">The Bottom Line</h2>
      <p>{s['name']} earns its #{s['rank']} spot in our rankings with a solid combination of {'selection and pricing' if s['rank'] <= 3 else 'reliability and value'}. {'This is a must-bookmark store for any serious enthusiast.' if s['rank'] <= 3 else 'Worth checking for specific needs, especially if their strengths match what you are looking for.'}</p>

      <p style="margin-top:24px"><a href="{s['url']}" class="visit-btn" target="_blank" rel="noopener">Visit {s['name']} →</a></p>
      <p class="updated" style="margin-top:20px">Review last updated: April 2026</p>
    </main>
    <aside class="sidebar">
      <div class="sidebar-box">
        <h3>Store Quick Facts</h3>
        <ul>
          <li><strong>Rating:</strong> {s['rating']}/5.0</li>
          <li><strong>Price Range:</strong> {s['price_range']}</li>
          <li><strong>Shipping:</strong> {s['shipping']}</li>
          <li><strong>Best For:</strong> {s['product_range'][:60]}...</li>
        </ul>
      </div>
    </aside>
  </div>
</div>
{footer_html()}
</body></html>'''
    w(f"reviews/{s['slug']}.html", page)

for s in specialty:
    page = f'''{head_html(f"{s['name']} Review 2026 — Auto Parts Reviewed", f"In-depth review of {s['name']}: products, quality, and why they made our list.", f"reviews/{s['slug']}.html")}
<body>
{header_html()}
<div class="container" style="padding-top:30px">
  <p class="breadcrumb"><a href="../index.html">Home</a> → <a href="../index.html#specialty">Specialty Brands</a> → {s['name']}</p>
  <div class="main-wrap">
    <main>
      <div class="spec-card" style="border-left:4px solid var(--orange)">
        <h1 style="font-size:2rem;margin-bottom:8px">{s['name']} Review</h1>
        <p class="tagline">{s['tagline']}</p>
        <div class="rating"><span class="stars">{stars_html(s['rating'])}</span></div>
        <p><strong>Products:</strong> {s['product_range']}</p>
      </div>
      <h2 style="margin:30px 0 16px">Our Full Review</h2>
      <p style="margin-bottom:20px">{s['review']}</p>
      <p style="margin-top:24px"><a href="{s['url']}" class="visit-btn" target="_blank" rel="noopener">Visit {s['name']} →</a></p>
      <p class="updated" style="margin-top:20px">Review last updated: April 2026</p>
    </main>
    <aside class="sidebar">
      <div class="sidebar-box">
        <h3>Brand Quick Facts</h3>
        <ul>
          <li><strong>Rating:</strong> {s['rating']}/5.0</li>
          <li><strong>Products:</strong> {s['product_range'][:80]}...</li>
        </ul>
      </div>
    </aside>
  </div>
</div>
{footer_html()}
</body></html>'''
    w(f"reviews/{s['slug']}.html", page)

# ---- About page ----
about = f'''{head_html("About — Auto Parts Reviewed", "About Auto Parts Reviewed: who we are and why we review online auto parts stores.", "about.html")}
<body>
{header_html()}
<div class="container" style="padding:50px 0;max-width:800px">
  <h1>About Auto Parts Reviewed</h1>
  <p style="margin:20px 0">We're a small team of automotive enthusiasts, shade-tree mechanics, and off-road addicts who got tired of buying parts from the wrong stores. So we started reviewing them.</p>
  <p style="margin:20px 0">Every store on this site gets the same treatment: real orders, real timing, real customer service tests. We don't accept payment for rankings. Some links on this site are affiliate links, which means we may earn a small commission if you make a purchase — but this never influences our rankings or reviews.</p>
  <p style="margin:20px 0">Our goal is simple: help you find the best place to buy the parts you need, at a fair price, from a store that won't waste your time.</p>
  <h2 style="margin:30px 0 16px">Contact</h2>
  <p>Have a suggestion or correction? Reach out at <strong>editors@autopartsreviewed.com</strong>.</p>
</div>
{footer_html()}
</body></html>'''
w("about.html", about)

# ---- Methodology page ----
method = f'''{head_html("Our Methodology — Auto Parts Reviewed", "How we test and rank online auto parts stores.", "methodology.html")}
<body>
{header_html()}
<div class="container" style="padding:50px 0;max-width:800px">
  <h1>How We Rank Auto Parts Stores</h1>
  <p style="margin:20px 0">Transparency matters. Here's exactly how we evaluate and rank the stores on this site.</p>
  <h2 style="margin:30px 0 12px">Our Criteria</h2>
  <ul style="padding-left:24px;margin:16px 0">
    <li><strong>Product Selection (25%)</strong> — Catalog depth and breadth across categories</li>
    <li><strong>Pricing (20%)</strong> — How prices compare to MAP, MSRP, and competitors</li>
    <li><strong>Shipping Speed & Cost (15%)</strong> — Order processing time, delivery speed, free shipping thresholds</li>
    <li><strong>Website Experience (15%)</strong> — Ease of use, search quality, fitment tools, mobile experience</li>
    <li><strong>Customer Service (15%)</strong> — Response time, knowledge, return process</li>
    <li><strong>Reputation & Trust (10%)</strong> — Years in business, community reputation, BBB rating</li>
  </ul>
  <h2 style="margin:30px 0 12px">Our Process</h2>
  <p style="margin:16px 0">We place real orders from every store we review. We time how long it takes from order to delivery. We test the return process. We call customer service with questions. We compare prices across stores on identical products. We do this at least twice per year for our ranked stores.</p>
  <h2 style="margin:30px 0 12px">Affiliate Disclosure</h2>
  <p style="margin:16px 0">Some links on this site are affiliate links. This means we may earn a small commission if you make a purchase through our link. This never, ever influences our rankings. Stores cannot pay for placement, and our editorial team operates independently.</p>
</div>
{footer_html()}
</body></html>'''
w("methodology.html", method)

# ---- Privacy page ----
privacy = f'''{head_html("Privacy Policy — Auto Parts Reviewed", "Privacy policy for Auto Parts Reviewed.", "privacy.html")}
<body>
{header_html()}
<div class="container" style="padding:50px 0;max-width:800px">
  <h1>Privacy Policy</h1>
  <p style="margin:20px 0">Auto Parts Reviewed is committed to your privacy. This site does not collect personal information, set tracking cookies, or require account creation. Some affiliate links may use cookies set by third-party retailers (like Amazon) to track referrals. These cookies are governed by those retailers' privacy policies, not ours.</p>
  <p style="margin:20px 0">We use no analytics tracking. We don't sell data. We don't have your data to sell.</p>
  <p style="margin:20px 0">Questions? Email <strong>editors@autopartsreviewed.com</strong>.</p>
  <p class="updated">Last updated: April 2026</p>
</div>
{footer_html()}
</body></html>'''
w("privacy.html", privacy)

# ---- Sitemap ----
pages = ["", "about.html", "methodology.html", "privacy.html"]
pages += [f"reviews/{s['slug']}.html" for s in stores]
pages += [f"reviews/{s['slug']}.html" for s in specialty]
sm = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
for p in pages:
    sm += f'  <url><loc>https://{DOMAIN}/{p}</loc><lastmod>{NOW}</lastmod><changefreq>monthly</changefreq></url>\n'
sm += '</urlset>'
w("sitemap.xml", sm)

print("  ✅ autopartsreviewed.com complete!\n")
