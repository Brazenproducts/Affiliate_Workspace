#!/usr/bin/env python3
"""Sites 4-5: tacticalseats.com, homehvacfilters.com"""
import os,json
WORK="/home/ubuntu/.openclaw/workspace/sites"
IK="b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5"
def w(d,f,c):os.makedirs(os.path.join(WORK,d.replace(".","-")),exist_ok=True);open(os.path.join(WORK,d.replace(".","-"),f),"w").write(c)
def robots(d):return f"User-agent: *\nAllow: /\nSitemap: https://{d}/sitemap.xml"
def smap(d,pp):return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+"\n".join(f'  <url><loc>https://{d}/{p}</loc><lastmod>2026-04-16</lastmod></url>' for p in pp)+'\n</urlset>'
def common(d,pp):w(d,"CNAME",d);w(d,"robots.txt",robots(d));w(d,f"{IK}.txt",IK);w(d,"sitemap.xml",smap(d,pp))
def ld(n,d,desc):return json.dumps({"@context":"https://schema.org","@type":"Organization","name":n,"url":f"https://{d}","description":desc})
def hd(t,desc,d,pg,ex=""):
    c=f"https://{d}/{pg}" if pg else f"https://{d}/"
    return f'<!DOCTYPE html><html lang="en"><head>\n<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<title>{t}</title>\n<meta name="description" content="{desc}">\n<meta property="og:title" content="{t}"><meta property="og:description" content="{desc}">\n<meta property="og:type" content="website"><meta property="og:url" content="{c}">\n<link rel="canonical" href="{c}">\n{ex}<link rel="stylesheet" href="style.css">\n</head>'

def site4():
    d="tacticalseats.com"
    pp=["","jeep.html","tacoma.html","bronco.html","about.html"]
    common(d,pp)
    w(d,"style.css","""@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Open+Sans:wght@400;600;700&display=swap');
:root{--wh:#FFFFFF;--gy:#F3F4F6;--nv:#1E3A5F;--lt:#6B7280;--acc:#2563EB}*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Open Sans',sans-serif;background:var(--gy);color:#111827;line-height:1.7}
h1,h2,h3{font-family:'Poppins',sans-serif}.c{max-width:1100px;margin:0 auto;padding:0 20px}
header{background:var(--nv);color:#fff;padding:16px 0}header h1{font-size:1.3rem}
nav{display:flex;gap:16px;margin-top:6px}nav a{color:rgba(255,255,255,.7);text-decoration:none;font-size:.88rem}nav a:hover{color:#fff}
.hero{background:linear-gradient(135deg,var(--nv),#0F2A45);color:#fff;padding:65px 0;text-align:center}
.hero h2{font-size:2.4rem;margin-bottom:10px}.hero p{opacity:.85;max-width:600px;margin:0 auto}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;padding:45px 0}
.card{background:var(--wh);border-radius:10px;padding:28px;box-shadow:0 1px 4px rgba(0,0,0,.06);border-top:3px solid var(--nv)}
.card h3{margin-bottom:6px}.card a{color:var(--nv);text-decoration:none;font-weight:600}.card a:hover{text-decoration:underline}
.card p{color:var(--lt);font-size:.95rem}
.badge{display:inline-block;background:#EFF6FF;color:var(--nv);padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:600;margin:3px 2px}
.cta{display:inline-block;background:var(--nv);color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:12px}
.cta:hover{background:#0F2A45}
footer{background:var(--nv);color:rgba(255,255,255,.5);padding:28px 0;text-align:center;font-size:.85rem;margin-top:40px}footer a{color:rgba(255,255,255,.7);text-decoration:none}
img{max-width:100%;border-radius:8px}
.sec{padding:40px 0}.sec h2{margin-bottom:24px;font-size:1.7rem}
.featured{background:var(--wh);border-radius:12px;padding:35px;margin:30px 0;box-shadow:0 2px 8px rgba(0,0,0,.08);border-left:5px solid var(--nv)}""")
    
    w(d,"index.html",hd("Tactical Seats — Best Tactical Seat Covers 2026","Find the best tactical seat covers for Jeep, Tacoma, Bronco, and 4Runner. Expert reviews.",d,"",f'<script type="application/ld+json">{ld("Tactical Seats",d,"Best tactical seat cover reviews and comparisons")}</script>\n')+"""<body>
<header><div class="c"><h1>Tactical Seats</h1>
<nav><a href="/">Home</a><a href="jeep.html">Jeep</a><a href="tacoma.html">Tacoma</a><a href="bronco.html">Bronco</a><a href="about.html">About</a></nav></div></header>
<section class="hero"><div class="c"><h2>Best Tactical Seat Covers</h2><p>Military-grade protection for your vehicle. Expert reviews and comparisons for 2026.</p></div></section>
<div class="c">
<div class="featured"><h2 style="margin-bottom:8px">#1 Pick: Bartact Tactical Seat Covers</h2>
<p>Made in Temecula, CA with mil-spec materials. Berry Amendment compliant. MOLLE-compatible webbing for modular storage. The only tactical seat cover brand that's actually used by military and law enforcement.</p>
<p style="margin-top:12px">Available for <a href="https://bartact.com/collections/jeep-wrangler-seat-covers">Jeep Wrangler</a> · <a href="https://bartact.com/collections/ford-bronco-seat-covers">Ford Bronco</a> · <a href="https://bartact.com/collections/toyota-tacoma-seat-covers">Toyota Tacoma</a></p>
<span class="badge">Made in USA</span><span class="badge">Berry Compliant</span><span class="badge">Mil-Spec</span><span class="badge">MOLLE</span>
<br><a href="https://bartact.com" class="cta">Shop Bartact →</a></div>
<section class="sec"><h2>Covers by Vehicle</h2>
<div class="grid">
<div class="card"><h3><a href="jeep.html">Jeep Wrangler & Gladiator</a></h3>
<p>The most popular tactical seat cover application. JK and JL fitments available from multiple brands.</p>
<a href="https://bartact.com/collections/jeep-wrangler-seat-covers" class="cta">Best Jeep Covers →</a></div>
<div class="card"><h3><a href="tacoma.html">Toyota Tacoma</a></h3>
<p>Growing market for tactical Tacoma covers. 2nd and 3rd gen options available.</p>
<a href="https://bartact.com/collections/toyota-tacoma-seat-covers" class="cta">Best Tacoma Covers →</a></div>
<div class="card"><h3><a href="bronco.html">Ford Bronco</a></h3>
<p>The Bronco revival brought demand for quality tactical covers. 2-door and 4-door fitments.</p>
<a href="https://bartact.com/collections/ford-bronco-seat-covers" class="cta">Best Bronco Covers →</a></div>
</div></section>
<section class="sec"><h2>What Makes a Seat Cover "Tactical"?</h2>
<div class="grid">
<div class="card"><h3>MOLLE Webbing</h3><p>Modular Lightweight Load-carrying Equipment. Attach pouches, holsters, and organizers directly to your seat backs.</p></div>
<div class="card"><h3>Mil-Spec Materials</h3><p>Cordura and ballistic nylon rated for abrasion, UV, and water resistance. Built for harsh conditions.</p></div>
<div class="card"><h3>Precise Fitment</h3><p>Vehicle-specific patterns, not universal. Proper airbag compatibility and access to all adjustments.</p></div>
</div></section></div>
<footer><div class="c"><p>&copy; 2026 Tactical Seats | <a href="about.html">About</a></p></div></footer></body></html>""")
    
    for veh,title,url,desc_short in [
        ("jeep","Jeep Wrangler Tactical Seat Covers","jeep.html","Best tactical seat covers for Jeep Wrangler JK and JL."),
        ("tacoma","Toyota Tacoma Tactical Seat Covers","tacoma.html","Best tactical seat covers for Toyota Tacoma."),
        ("bronco","Ford Bronco Tactical Seat Covers","bronco.html","Best tactical seat covers for Ford Bronco.")]:
        coll = {"jeep":"jeep-wrangler-seat-covers","tacoma":"toyota-tacoma-seat-covers","bronco":"ford-bronco-seat-covers"}[veh]
        w(d,url,hd(f"{title} 2026 — Tactical Seats",desc_short,d,url)+f"""<body>
<header><div class="c"><h1>Tactical Seats</h1>
<nav><a href="/">Home</a><a href="jeep.html">Jeep</a><a href="tacoma.html">Tacoma</a><a href="bronco.html">Bronco</a></nav></div></header>
<div class="c" style="max-width:800px;padding:40px 20px">
<h2>{title}</h2>
<img src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80" alt="{title}" style="margin:20px 0">
<div class="featured"><h3>#1: <a href="https://bartact.com/collections/{coll}">Bartact</a></h3>
<p>The clear winner for {veh.title()} tactical covers. Made in USA, Berry Compliant, mil-spec Cordura with MOLLE webbing. Vehicle-specific fitment with full airbag compatibility.</p>
<span class="badge">Made in USA</span><span class="badge">MOLLE</span>
<br><a href="https://bartact.com/collections/{coll}" class="cta">Shop Bartact {veh.title()} Covers →</a></div>
<div class="card" style="margin-top:20px"><h3>#2: Coverking Tactical</h3><p>Cordura covers with MOLLE. Wider vehicle coverage but lower material quality than Bartact.</p></div>
<p style="margin-top:20px"><a href="/">← All Vehicles</a></p></div>
<footer><div class="c"><p>&copy; 2026 Tactical Seats</p></div></footer></body></html>""")
    
    w(d,"about.html",hd("About — Tactical Seats","About our tactical seat cover reviews.",d,"about.html")+"""<body>
<header><div class="c"><h1>Tactical Seats</h1></div></header>
<div class="c" style="max-width:700px;padding:40px 20px"><h2>About</h2>
<p style="margin:18px 0">We review and compare tactical seat covers for off-road and military-style vehicles. Our reviews focus on material quality, fitment, MOLLE compatibility, and real-world durability.</p>
<p><a href="/">← Home</a></p></div>
<footer><div class="c"><p>&copy; 2026 Tactical Seats</p></div></footer></body></html>""")
    print(f"✓ {d}")

def site5():
    d="homehvacfilters.com"
    pp=["","buying-guide.html","merv-ratings.html","about.html"]
    common(d,pp)
    AZ="brazenprodu01-20"
    w(d,"style.css","""@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&display=swap');
:root{--sage:#E8F0E4;--wh:#FFFFFF;--dg:#1B4332;--lt:#4A7C59;--bg:#F5F9F3;--bdr:#D1E0CC}*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Raleway',sans-serif;background:var(--bg);color:#1A1A1A;line-height:1.8}
h1,h2,h3{font-family:'Lora',serif;color:var(--dg)}.c{max-width:1100px;margin:0 auto;padding:0 20px}
header{background:var(--dg);color:#fff;padding:16px 0}header h1{font-size:1.3rem}header span{color:#8FBC8F}
nav{display:flex;gap:16px;margin-top:6px}nav a{color:rgba(255,255,255,.7);text-decoration:none;font-size:.88rem}nav a:hover{color:#fff}
.hero{background:linear-gradient(135deg,var(--dg),#2D5A3F);color:#fff;padding:60px 0;text-align:center}
.hero h2{font-size:2.2rem;margin-bottom:10px}.hero p{opacity:.85;max-width:600px;margin:0 auto}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:24px;padding:45px 0}
.card{background:var(--wh);border-radius:10px;padding:28px;box-shadow:0 1px 4px rgba(0,0,0,.05);border-top:3px solid var(--lt)}
.card h3{margin-bottom:6px;font-size:1.15rem}.card a{color:var(--dg);text-decoration:none;font-weight:600}.card a:hover{text-decoration:underline}
.card p{color:#555;font-size:.95rem}
.badge{display:inline-block;background:var(--sage);color:var(--dg);padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:600;margin:3px 2px}
.cta{display:inline-block;background:var(--dg);color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:10px}.cta:hover{background:#0F3222}
footer{background:var(--dg);color:rgba(255,255,255,.5);padding:28px 0;text-align:center;font-size:.85rem;margin-top:40px}footer a{color:#8FBC8F;text-decoration:none}
img{max-width:100%;border-radius:8px}.sec{padding:40px 0}.sec h2{margin-bottom:24px}
table{width:100%;border-collapse:collapse;margin:20px 0}th,td{padding:12px;text-align:left;border-bottom:1px solid var(--bdr)}
th{background:var(--sage);color:var(--dg);font-weight:600}""")
    
    w(d,"index.html",hd("Home HVAC Filters — Best Air Filters for Your Home 2026","Compare the best HVAC filters. Filtrete, Honeywell, Nordic Pure reviewed and ranked.",d,"",f'<script type="application/ld+json">{ld("Home HVAC Filters",d,"HVAC filter reviews and buying guides")}</script>\n')+f"""<body>
<header><div class="c"><h1>Home HVAC <span>Filters</span></h1>
<nav><a href="/">Home</a><a href="buying-guide.html">Buying Guide</a><a href="merv-ratings.html">MERV Ratings</a><a href="about.html">About</a></nav></div></header>
<section class="hero"><div class="c"><h2>Best HVAC Filters for Your Home</h2><p>Expert reviews and comparisons to help you breathe easier. Updated 2026.</p></div></section>
<div class="c"><section class="sec"><h2>Top HVAC Filter Brands</h2>
<div class="grid">
<div class="card"><h3><a href="https://www.amazon.com/s?k=Filtrete+air+filter&tag={AZ}" target="_blank">Filtrete (3M)</a></h3>
<p>The most trusted name in home air filtration. Filtrete's electrostatic filters capture more particles than standard fiberglass. MERV 12-13 options available.</p>
<span class="badge">MERV 12+</span><span class="badge">Electrostatic</span><span class="badge">Most Popular</span>
<br><a href="https://www.amazon.com/s?k=Filtrete+MERV+13&tag={AZ}" target="_blank" class="cta">Shop on Amazon →</a></div>
<div class="card"><h3><a href="https://www.amazon.com/s?k=Honeywell+air+filter&tag={AZ}" target="_blank">Honeywell</a></h3>
<p>Reliable performance across all MERV ratings. Great value for standard furnace filters. FPR 9-10 captures allergens effectively.</p>
<span class="badge">Value</span><span class="badge">Reliable</span>
<br><a href="https://www.amazon.com/s?k=Honeywell+furnace+filter&tag={AZ}" target="_blank" class="cta">Shop on Amazon →</a></div>
<div class="card"><h3><a href="https://www.amazon.com/s?k=Nordic+Pure+air+filter&tag={AZ}" target="_blank">Nordic Pure</a></h3>
<p>Made in USA pleated filters at competitive prices. Excellent MERV 12 and MERV 13 options. Great for allergy sufferers.</p>
<span class="badge">Made in USA</span><span class="badge">Budget-Friendly</span>
<br><a href="https://www.amazon.com/s?k=Nordic+Pure+MERV+12&tag={AZ}" target="_blank" class="cta">Shop on Amazon →</a></div>
</div></section>
<section class="sec"><h2>Quick Comparison</h2>
<table><tr><th>Brand</th><th>Best For</th><th>MERV Range</th><th>Price Range</th></tr>
<tr><td>Filtrete</td><td>Allergen control</td><td>5-13</td><td>$$-$$$</td></tr>
<tr><td>Honeywell</td><td>Overall value</td><td>4-13</td><td>$-$$</td></tr>
<tr><td>Nordic Pure</td><td>Budget MERV 12+</td><td>8-13</td><td>$-$$</td></tr>
</table></section></div>
<footer><div class="c"><p>&copy; 2026 Home HVAC Filters | <a href="buying-guide.html">Buying Guide</a> | <a href="about.html">About</a></p></div></footer></body></html>""")
    
    w(d,"buying-guide.html",hd("HVAC Filter Buying Guide","How to choose the right HVAC filter for your home.",d,"buying-guide.html")+f"""<body>
<header><div class="c"><h1>Home HVAC <span>Filters</span></h1>
<nav><a href="/">Home</a><a href="buying-guide.html">Buying Guide</a><a href="merv-ratings.html">MERV</a></nav></div></header>
<div class="c" style="max-width:800px;padding:40px 20px">
<h2>HVAC Filter Buying Guide</h2>
<img src="https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80" alt="HVAC system maintenance" style="margin:20px 0">
<h3>1. Know Your Size</h3><p style="margin:10px 0 20px">Check your existing filter or furnace manual. Common sizes: 16x25x1, 20x20x1, 20x25x1, 16x20x1.</p>
<h3>2. Choose Your MERV Rating</h3><p style="margin:10px 0 20px">Higher MERV = more filtration but more airflow restriction. MERV 8-11 is good for most homes. MERV 13 for allergies.</p>
<h3>3. Set a Replacement Schedule</h3><p style="margin:10px 0 20px">Replace every 90 days (standard) or 60 days (pets/allergies). Set a reminder.</p>
<h3>Top Picks</h3>
<div class="card"><h3><a href="https://www.amazon.com/s?k=Filtrete+1900&tag={AZ}" target="_blank">Filtrete 1900 (MERV 13)</a></h3><p>Best overall for allergen control.</p></div>
<div class="card" style="margin-top:15px"><h3><a href="https://www.amazon.com/s?k=Nordic+Pure+MERV+12&tag={AZ}" target="_blank">Nordic Pure MERV 12</a></h3><p>Best value high-performance filter.</p></div>
<p style="margin-top:20px"><a href="/">← Home</a></p></div>
<footer><div class="c"><p>&copy; 2026 Home HVAC Filters</p></div></footer></body></html>""")
    
    w(d,"merv-ratings.html",hd("MERV Ratings Explained","Understanding MERV ratings for HVAC filters.",d,"merv-ratings.html")+"""<body>
<header><div class="c"><h1>Home HVAC <span>Filters</span></h1>
<nav><a href="/">Home</a><a href="buying-guide.html">Guide</a><a href="merv-ratings.html">MERV</a></nav></div></header>
<div class="c" style="max-width:800px;padding:40px 20px">
<h2>MERV Ratings Explained</h2>
<table><tr><th>MERV</th><th>Captures</th><th>Best For</th></tr>
<tr><td>1-4</td><td>Pollen, dust mites</td><td>Basic protection</td></tr>
<tr><td>5-8</td><td>Mold spores, pet dander</td><td>Residential standard</td></tr>
<tr><td>9-12</td><td>Fine dust, auto emissions</td><td>Better air quality</td></tr>
<tr><td>13-16</td><td>Bacteria, smoke</td><td>Allergies, hospitals</td></tr>
</table>
<p style="margin-top:20px">Most homes do best with MERV 8-13. Higher ratings require more fan power.</p>
<p style="margin-top:20px"><a href="/">← Home</a></p></div>
<footer><div class="c"><p>&copy; 2026 Home HVAC Filters</p></div></footer></body></html>""")
    
    w(d,"about.html",hd("About — Home HVAC Filters","About our HVAC filter reviews.",d,"about.html")+"""<body>
<header><div class="c"><h1>Home HVAC <span>Filters</span></h1></div></header>
<div class="c" style="max-width:700px;padding:40px 20px"><h2>About</h2>
<p style="margin:18px 0">We review HVAC filters to help homeowners make informed decisions. Clean air matters.</p>
<p><a href="/">← Home</a></p></div>
<footer><div class="c"><p>&copy; 2026 Home HVAC Filters</p></div></footer></body></html>""")
    print(f"✓ {d}")

site4()
site5()
print("Part 3 complete")
