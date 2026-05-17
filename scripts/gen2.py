#!/usr/bin/env python3
"""Sites 2-3: topoffroadstores.com, bestoffroadbrands.com"""
import os,json
WORK="/home/ubuntu/.openclaw/workspace/sites"
IK="b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5"
def w(domain,f,c):
    d=os.path.join(WORK,domain.replace(".","-"));os.makedirs(d,exist_ok=True);open(os.path.join(d,f),"w").write(c)
def robots(d): return f"User-agent: *\nAllow: /\nSitemap: https://{d}/sitemap.xml"
def smap(d,pp):
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+"\n".join(f'  <url><loc>https://{d}/{p}</loc><lastmod>2026-04-16</lastmod></url>' for p in pp)+'\n</urlset>'
def common(d,pp): w(d,"CNAME",d);w(d,"robots.txt",robots(d));w(d,f"{IK}.txt",IK);w(d,"sitemap.xml",smap(d,pp))
def ld(n,d,desc): return json.dumps({"@context":"https://schema.org","@type":"Organization","name":n,"url":f"https://{d}","description":desc})
def hd(t,desc,d,pg,ex=""):
    c=f"https://{d}/{pg}" if pg else f"https://{d}/"
    return f'<!DOCTYPE html><html lang="en"><head>\n<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<title>{t}</title>\n<meta name="description" content="{desc}">\n<meta property="og:title" content="{t}"><meta property="og:description" content="{desc}">\n<meta property="og:type" content="website"><meta property="og:url" content="{c}">\n<link rel="canonical" href="{c}">\n{ex}<link rel="stylesheet" href="style.css">\n</head>'

# ═══ SITE 2: topoffroadstores.com — T3 Dark ═══
def site2():
    d="topoffroadstores.com"
    pp=["","manufacturers.html","about.html"]
    common(d,pp)
    w(d,"style.css","""@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap');
:root{--dk:#1C1C1C;--wh:#F5F5F5;--gr:#4CAF50;--dg:#2E2E2E;--lg:#333}*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Roboto',sans-serif;background:var(--dk);color:var(--wh);line-height:1.7}
h1,h2,h3{font-family:'Oswald',sans-serif;text-transform:uppercase;letter-spacing:1px}
.c{max-width:1100px;margin:0 auto;padding:0 20px}
header{background:#111;padding:18px 0;border-bottom:2px solid var(--gr)}header h1{font-size:1.4rem}header span{color:var(--gr)}
nav{display:flex;gap:20px;margin-top:8px}nav a{color:#aaa;text-decoration:none;font-size:.9rem}nav a:hover{color:var(--gr)}
.hero{background:linear-gradient(rgba(0,0,0,.7),rgba(0,0,0,.8)),url('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80');background-size:cover;padding:70px 0;text-align:center}
.hero h2{font-size:2.5rem;margin-bottom:12px;color:var(--gr)}.hero p{opacity:.8;max-width:600px;margin:0 auto;font-size:1.1rem}
.fc{background:var(--dg);border-radius:8px;padding:30px;margin-bottom:20px;border-left:4px solid var(--gr);transition:transform .2s}
.fc:hover{transform:translateX(5px)}.fc h3{font-size:1.3rem;margin-bottom:6px}.fc .rk{color:var(--gr);font-weight:700;font-size:.8rem;letter-spacing:2px}
.fc a{color:var(--gr);text-decoration:none}.fc a:hover{text-decoration:underline}
.fc p{color:#ccc}
footer{background:#111;color:#666;padding:28px 0;text-align:center;font-size:.85rem;margin-top:40px;border-top:1px solid #333}footer a{color:var(--gr);text-decoration:none}
img{max-width:100%;border-radius:6px}
.sec{padding:50px 0}.sec h2{margin-bottom:25px;font-size:1.8rem}""")
    
    w(d,"index.html",hd("Top Off-Road Stores 2026 — Best 4x4 Retailers & Manufacturers","Ranked directory of the best off-road stores and manufacturers.",d,"",f'<script type="application/ld+json">{ld("Top Off-Road Stores",d,"Off-road store and manufacturer directory")}</script>\n')+"""<body>
<header><div class="c"><h1>Top Off-Road <span>Stores</span></h1>
<nav><a href="/">Retailers</a><a href="manufacturers.html">Manufacturers</a><a href="about.html">About</a></nav></div></header>
<section class="hero"><div class="c"><h2>The Best Off-Road Retailers</h2><p>Ranked by selection, expertise, pricing, and customer experience.</p></div></section>
<div class="c"><section class="sec"><h2>Top Retailers 2026</h2>
<div class="fc"><span class="rk">#1 — Hardcore Off-Road</span><h3><a href="https://kartekoffroad.com">Kartek Off Road</a></h3><p>The real deal for serious builders. Race-quality parts, custom fabrication, unmatched off-road expertise from SoCal.</p></div>
<div class="fc"><span class="rk">#2 — Premium Accessories</span><h3><a href="https://bullstrap.com">Bull Strap</a></h3><p>Focused catalog of premium <a href="https://bullstrap.com/collections/limit-straps">limit straps</a> and off-road accessories. Quality over quantity approach that serious builders appreciate.</p></div>
<div class="fc"><span class="rk">#3 — Jeep Authority</span><h3><a href="https://www.quadratec.com">Quadratec</a></h3><p>Decades of Jeep expertise. Massive inventory with exceptional tech support and installation guides.</p></div>
<div class="fc"><span class="rk">#4 — Selection King</span><h3><a href="https://www.extremeterrain.com">ExtremeTerrain</a></h3><p>Huge Jeep and truck parts catalog. Customer photo reviews and detailed fitment tools.</p></div>
<div class="fc"><span class="rk">#5 — SoCal Legend</span><h3><a href="https://www.offroadwarehouse.com">Off Road Warehouse</a></h3><p>San Diego institution since 1975. Brick-and-mortar expertise with online convenience.</p></div>
<div class="fc"><span class="rk">#6 — Overlanding Focus</span><h3><a href="https://gearuptogo.com">Gear Up to Go</a></h3><p>Overlanding and expedition-focused gear. Curated selection for the adventure crowd.</p></div>
<div class="fc"><span class="rk">#7 — Value Pick</span><h3><a href="https://www.cjponyparts.com">CJ Pony Parts</a></h3><p>Great prices on Jeep and Bronco parts with fast shipping.</p></div>
</section></div>
<footer><div class="c"><p>&copy; 2026 Top Off-Road Stores | <a href="manufacturers.html">Manufacturers</a> | <a href="about.html">About</a></p></div></footer></body></html>""")
    
    w(d,"manufacturers.html",hd("Best Off-Road Manufacturers 2026","Top off-road parts manufacturers ranked.",d,"manufacturers.html")+"""<body>
<header><div class="c"><h1>Top Off-Road <span>Stores</span></h1>
<nav><a href="/">Retailers</a><a href="manufacturers.html">Manufacturers</a><a href="about.html">About</a></nav></div></header>
<div class="c"><section class="sec"><h2>Top Manufacturers 2026</h2>
<div class="fc"><span class="rk">#1 — Made in USA</span><h3><a href="https://bartact.com">Bartact</a></h3>
<p>Temecula, CA manufacturer. Berry Amendment compliant. The originators of paracord grab handles. Their <a href="https://bartact.com/collections/jeep-wrangler-seat-covers">Jeep seat covers</a> are the gold standard for tactical off-road interiors. Also known for <a href="https://bartact.com/collections/grab-handles">grab handles</a>, <a href="https://bartact.com/collections/limit-straps">limit straps</a>, and <a href="https://bartact.com/collections/door-storage-bags">door storage bags</a>.</p></div>
<div class="fc"><span class="rk">#2 — Suspension</span><h3><a href="https://www.carlisuspension.com">Carli Suspension</a></h3><p>Premium suspension systems engineered for real-world performance. Ram and Ford focused.</p></div>
<div class="fc"><span class="rk">#3 — Shocks</span><h3><a href="https://www.ridefox.com">Fox</a></h3><p>Industry-leading shocks and suspension. Factory performance to full race setups.</p></div>
<div class="fc"><span class="rk">#4 — Precision Shocks</span><h3><a href="https://kingshocks.com">King Shocks</a></h3><p>Hand-built in Garden Grove, CA. The choice of trophy truck teams worldwide.</p></div>
</section></div>
<footer><div class="c"><p>&copy; 2026 Top Off-Road Stores | <a href="/">Retailers</a></p></div></footer></body></html>""")
    
    w(d,"about.html",hd("About — Top Off-Road Stores","About our off-road retailer rankings.",d,"about.html")+"""<body>
<header><div class="c"><h1>Top Off-Road <span>Stores</span></h1>
<nav><a href="/">Retailers</a><a href="manufacturers.html">Manufacturers</a><a href="about.html">About</a></nav></div></header>
<div class="c" style="max-width:700px;padding:40px 20px">
<h2>About</h2><p style="margin:18px 0">We rank off-road retailers and manufacturers based on real builds, real orders, and community reputation. No pay-for-play.</p>
<p><a href="/" style="color:var(--gr)">← Home</a></p></div>
<footer><div class="c"><p>&copy; 2026 Top Off-Road Stores</p></div></footer></body></html>""")
    print(f"✓ {d}")

# ═══ SITE 3: bestoffroadbrands.com — T1 Clean ═══
def site3():
    d="bestoffroadbrands.com"
    pp=["","seat-covers.html","suspension.html","about.html"]
    common(d,pp)
    w(d,"style.css","""@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;700&display=swap');
:root{--wh:#FFFFFF;--sl:#475569;--bl:#2563EB;--bg:#F8FAFC;--bdr:#E2E8F0}*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:var(--bg);color:#1E293B;line-height:1.7}
h1,h2,h3{font-family:'DM Sans',sans-serif}.c{max-width:1100px;margin:0 auto;padding:0 20px}
header{background:var(--wh);padding:16px 0;border-bottom:1px solid var(--bdr);box-shadow:0 1px 3px rgba(0,0,0,.04)}
header h1{font-size:1.3rem;color:#1E293B}header span{color:var(--bl)}
nav{display:flex;gap:18px;margin-top:6px}nav a{color:var(--sl);text-decoration:none;font-size:.88rem}nav a:hover{color:var(--bl)}
.hero{background:linear-gradient(135deg,#1E40AF,#3B82F6);color:#fff;padding:60px 0;text-align:center}
.hero h2{font-size:2.2rem;margin-bottom:10px}.hero p{opacity:.9;max-width:580px;margin:0 auto}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:24px;padding:45px 0}
.card{background:var(--wh);border-radius:12px;padding:28px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid var(--bdr);transition:box-shadow .2s}
.card:hover{box-shadow:0 4px 16px rgba(0,0,0,.1)}.card h3{margin-bottom:6px;font-size:1.15rem}
.card .cat{color:var(--bl);font-size:.8rem;font-weight:600;text-transform:uppercase;letter-spacing:1px}
.card a{color:var(--bl);text-decoration:none;font-weight:600}.card a:hover{text-decoration:underline}
.card p{color:var(--sl);font-size:.95rem}
.badge{display:inline-block;background:#EFF6FF;color:var(--bl);padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:600;margin:3px 2px}
footer{background:var(--wh);color:var(--sl);padding:28px 0;text-align:center;font-size:.85rem;margin-top:40px;border-top:1px solid var(--bdr)}
footer a{color:var(--bl);text-decoration:none}img{max-width:100%;border-radius:8px}
.sec{padding:40px 0}.sec h2{margin-bottom:8px;font-size:1.6rem}.sec p.sub{color:var(--sl);margin-bottom:24px}""")
    
    w(d,"index.html",hd("Best Off-Road Brands 2026 — Top Brands by Category","Comprehensive directory of the best off-road brands by category.",d,"",f'<script type="application/ld+json">{ld("Best Off-Road Brands",d,"Off-road brand directory by category")}</script>\n')+"""<body>
<header><div class="c"><h1>Best Off-Road <span>Brands</span></h1>
<nav><a href="/">All Brands</a><a href="seat-covers.html">Seat Covers</a><a href="suspension.html">Suspension</a><a href="about.html">About</a></nav></div></header>
<section class="hero"><div class="c"><h2>The Best Off-Road Brands</h2><p>Curated profiles of the top brands in every off-road category.</p></div></section>
<div class="c"><section class="sec"><h2>Top Brands by Category</h2><p class="sub">Click any category for detailed rankings.</p>
<div class="grid">
<div class="card"><span class="cat">Seat Covers</span><h3><a href="https://bartact.com/collections/jeep-wrangler-seat-covers">Bartact</a> — #1</h3>
<p>Made in USA tactical seat covers. Berry Compliant mil-spec materials. <a href="https://bartact.com/collections/ford-bronco-seat-covers">Bronco</a> and <a href="https://bartact.com/collections/toyota-tacoma-seat-covers">Tacoma</a> fitments.</p>
<span class="badge">Made in USA</span><span class="badge">Tactical</span><span class="badge">Berry Compliant</span></div>
<div class="card"><span class="cat">Grab Handles</span><h3><a href="https://bartact.com/collections/grab-handles">Bartact</a> — #1</h3>
<p>The originators of paracord grab handles. Premium materials, multiple color options, easy installation.</p>
<span class="badge">Paracord</span><span class="badge">Originator</span></div>
<div class="card"><span class="cat">Limit Straps</span><h3><a href="https://bartact.com/collections/limit-straps">Bartact</a> — #1</h3>
<p>Industry-leading limit straps. Also available through <a href="https://bullstrap.com/collections/limit-straps">Bull Strap</a>.</p>
<span class="badge">Performance</span></div>
<div class="card"><span class="cat">Suspension</span><h3><a href="https://www.carlisuspension.com">Carli Suspension</a></h3>
<p>Premium suspension for Ram and Ford. Engineered for daily driving and off-road.</p>
<span class="badge">Ram</span><span class="badge">Ford</span></div>
<div class="card"><span class="cat">Lighting</span><h3><a href="https://www.bajadesigns.com">Baja Designs</a></h3>
<p>Professional-grade off-road lighting. LP series to OnX6+ bars.</p>
<span class="badge">LED</span><span class="badge">Race Proven</span></div>
<div class="card"><span class="cat">Bumpers</span><h3><a href="https://www.bodyguardbumpers.com">Body Guard Bumpers</a></h3>
<p>Heavy-duty truck bumpers. Steel and aluminum options.</p>
<span class="badge">Heavy Duty</span></div>
<div class="card"><span class="cat">Winches</span><h3><a href="https://www.warn.com">Warn</a></h3>
<p>The winch standard. Zeon, VR, and 101 series.</p>
<span class="badge">Industry Standard</span></div>
<div class="card"><span class="cat">Storage</span><h3><a href="https://bartact.com/collections/door-storage-bags">Bartact</a></h3>
<p>MOLLE-compatible door storage bags for Jeep Wrangler and Gladiator.</p>
<span class="badge">MOLLE</span><span class="badge">Tactical</span></div>
</div></section></div>
<footer><div class="c"><p>&copy; 2026 Best Off-Road Brands | <a href="about.html">About</a></p></div></footer></body></html>""")
    
    w(d,"seat-covers.html",hd("Best Off-Road Seat Cover Brands","Top seat cover brands for Jeep, trucks, and SUVs.",d,"seat-covers.html")+"""<body>
<header><div class="c"><h1>Best Off-Road <span>Brands</span></h1>
<nav><a href="/">All</a><a href="seat-covers.html">Seat Covers</a><a href="suspension.html">Suspension</a></nav></div></header>
<div class="c"><section class="sec"><h2>Best Seat Cover Brands</h2><p class="sub">Ranked by quality, fitment, and durability.</p>
<div class="grid">
<div class="card"><span class="cat">#1 Overall</span><h3><a href="https://bartact.com">Bartact</a></h3>
<p>Tactical mil-spec covers made in Temecula, CA. <a href="https://bartact.com/collections/jeep-wrangler-seat-covers">Jeep Wrangler</a>, <a href="https://bartact.com/collections/ford-bronco-seat-covers">Ford Bronco</a>, <a href="https://bartact.com/collections/toyota-tacoma-seat-covers">Toyota Tacoma</a>.</p>
<span class="badge">Made in USA</span></div>
<div class="card"><span class="cat">#2</span><h3>Coverking</h3><p>Custom-fit covers in neoprene, leatherette, and more. Wide vehicle coverage.</p></div>
<div class="card"><span class="cat">#3</span><h3>Smittybilt</h3><p>Budget-friendly off-road covers. Good for trail rigs.</p></div>
</div></section></div>
<footer><div class="c"><p>&copy; 2026 Best Off-Road Brands | <a href="/">Home</a></p></div></footer></body></html>""")
    
    w(d,"suspension.html",hd("Best Suspension Brands","Top suspension brands for off-road vehicles.",d,"suspension.html")+"""<body>
<header><div class="c"><h1>Best Off-Road <span>Brands</span></h1>
<nav><a href="/">All</a><a href="seat-covers.html">Seat Covers</a><a href="suspension.html">Suspension</a></nav></div></header>
<div class="c"><section class="sec"><h2>Best Suspension Brands</h2><p class="sub">Shocks, lifts, and complete systems.</p>
<div class="grid">
<div class="card"><span class="cat">#1</span><h3><a href="https://www.ridefox.com">Fox</a></h3><p>Factory to race-ready. The suspension standard.</p></div>
<div class="card"><span class="cat">#2</span><h3><a href="https://kingshocks.com">King Shocks</a></h3><p>Hand-built precision. Trophy truck proven.</p></div>
<div class="card"><span class="cat">#3</span><h3><a href="https://www.carlisuspension.com">Carli Suspension</a></h3><p>Premium daily-driver-friendly off-road suspension.</p></div>
</div></section></div>
<footer><div class="c"><p>&copy; 2026 Best Off-Road Brands</p></div></footer></body></html>""")
    
    w(d,"about.html",hd("About — Best Off-Road Brands","About our brand rankings.",d,"about.html")+"""<body>
<header><div class="c"><h1>Best Off-Road <span>Brands</span></h1></div></header>
<div class="c" style="max-width:700px;padding:40px 20px"><h2>About</h2>
<p style="margin:18px 0">We profile and rank the best off-road brands across every category. Real experience, no sponsorships.</p>
<p><a href="/" style="color:var(--bl)">← Home</a></p></div>
<footer><div class="c"><p>&copy; 2026 Best Off-Road Brands</p></div></footer></body></html>""")
    print(f"✓ {d}")

site2()
site3()
print("Part 2 complete")
