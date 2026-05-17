#!/usr/bin/env python3
"""Sites 6-7: bestwindshieldwiper.com, tacticalseatcovers.com"""
import os,json
WORK="/home/ubuntu/.openclaw/workspace/sites"
IK="b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5"
AZ="brazenprodu01-20"
def w(d,f,c):os.makedirs(os.path.join(WORK,d.replace(".","-")),exist_ok=True);open(os.path.join(WORK,d.replace(".","-"),f),"w").write(c)
def robots(d):return f"User-agent: *\nAllow: /\nSitemap: https://{d}/sitemap.xml"
def smap(d,pp):return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+"\n".join(f'  <url><loc>https://{d}/{p}</loc><lastmod>2026-04-16</lastmod></url>' for p in pp)+'\n</urlset>'
def common(d,pp):w(d,"CNAME",d);w(d,"robots.txt",robots(d));w(d,f"{IK}.txt",IK);w(d,"sitemap.xml",smap(d,pp))
def ld(n,d,desc):return json.dumps({"@context":"https://schema.org","@type":"Organization","name":n,"url":f"https://{d}","description":desc})
def hd(t,desc,d,pg,ex=""):
    c=f"https://{d}/{pg}" if pg else f"https://{d}/"
    return f'<!DOCTYPE html><html lang="en"><head>\n<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<title>{t}</title>\n<meta name="description" content="{desc}">\n<meta property="og:title" content="{t}"><meta property="og:description" content="{desc}">\n<meta property="og:type" content="website"><meta property="og:url" content="{c}">\n<link rel="canonical" href="{c}">\n{ex}<link rel="stylesheet" href="style.css">\n</head>'

def site6():
    d="bestwindshieldwiper.com"
    pp=["","comparison.html","buying-guide.html","about.html"]
    common(d,pp)
    w(d,"style.css","""@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
:root{--bg:#F0F2F5;--nv:#1B2A4A;--rd:#DC2626;--wh:#FFFFFF;--lt:#6B7280;--bdr:#D1D5DB}*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'IBM Plex Sans',sans-serif;background:var(--bg);color:#111;line-height:1.7}
h1,h2,h3{color:var(--nv)}.c{max-width:1100px;margin:0 auto;padding:0 20px}
header{background:var(--nv);color:#fff;padding:16px 0}header h1{font-size:1.3rem}header span{color:var(--rd)}
nav{display:flex;gap:16px;margin-top:6px}nav a{color:rgba(255,255,255,.7);text-decoration:none;font-size:.88rem}nav a:hover{color:#fff}
.hero{background:linear-gradient(135deg,var(--nv),#0D1B2A);color:#fff;padding:60px 0;text-align:center}
.hero h2{font-size:2.2rem;margin-bottom:10px}.hero p{opacity:.85;max-width:600px;margin:0 auto}
table{width:100%;border-collapse:collapse;margin:20px 0;background:var(--wh);border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06)}
th{background:var(--nv);color:#fff;padding:14px;text-align:left;font-family:'IBM Plex Mono',monospace;font-size:.85rem}
td{padding:12px 14px;border-bottom:1px solid var(--bdr);font-size:.95rem}
tr:hover{background:#F8FAFC}
.winner{background:#FEF2F2;border-left:3px solid var(--rd)}
.card{background:var(--wh);border-radius:10px;padding:25px;margin-bottom:20px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
.card h3{margin-bottom:6px}.card a{color:var(--nv);text-decoration:none;font-weight:600}.card a:hover{color:var(--rd)}
.badge{display:inline-block;background:#FEF2F2;color:var(--rd);padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:600;margin:3px 2px}
.cta{display:inline-block;background:var(--rd);color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:10px}.cta:hover{background:#B91C1C}
footer{background:var(--nv);color:rgba(255,255,255,.5);padding:28px 0;text-align:center;font-size:.85rem;margin-top:40px}footer a{color:var(--rd);text-decoration:none}
img{max-width:100%;border-radius:8px}.sec{padding:40px 0}.sec h2{margin-bottom:20px}
code{font-family:'IBM Plex Mono',monospace;background:#F3F4F6;padding:2px 6px;border-radius:3px;font-size:.9rem}""")
    
    w(d,"index.html",hd("Best Windshield Wipers 2026 — Top Wiper Blades Compared","Compare the best windshield wiper blades. Bosch, Rain-X, PIAA, Michelin reviewed.",d,"",f'<script type="application/ld+json">{ld("Best Windshield Wiper",d,"Windshield wiper blade reviews and comparisons")}</script>\n')+f"""<body>
<header><div class="c"><h1>Best Windshield <span>Wiper</span></h1>
<nav><a href="/">Home</a><a href="comparison.html">Compare</a><a href="buying-guide.html">Guide</a><a href="about.html">About</a></nav></div></header>
<section class="hero"><div class="c"><h2>Best Windshield Wipers 2026</h2><p>Data-driven comparisons. No sponsored rankings.</p></div></section>
<div class="c"><section class="sec"><h2>Quick Comparison</h2>
<table>
<tr><th>Brand</th><th>Type</th><th>Durability</th><th>Rain Performance</th><th>Price</th><th>Rating</th></tr>
<tr class="winner"><td><strong><a href="https://www.amazon.com/s?k=Bosch+ICON+wiper&tag={AZ}">Bosch ICON</a></strong></td><td>Beam</td><td>★★★★★</td><td>★★★★★</td><td>$$$</td><td><strong>9.5/10</strong></td></tr>
<tr><td><a href="https://www.amazon.com/s?k=Rain-X+Latitude+wiper&tag={AZ}">Rain-X Latitude</a></td><td>Beam</td><td>★★★★</td><td>★★★★★</td><td>$$</td><td>9.0/10</td></tr>
<tr><td><a href="https://www.amazon.com/s?k=PIAA+Super+Silicone+wiper&tag={AZ}">PIAA Super Silicone</a></td><td>Beam</td><td>★★★★★</td><td>★★★★</td><td>$$$</td><td>8.8/10</td></tr>
<tr><td><a href="https://www.amazon.com/s?k=Michelin+Stealth+Ultra+wiper&tag={AZ}">Michelin Stealth Ultra</a></td><td>Hybrid</td><td>★★★★</td><td>★★★★</td><td>$$</td><td>8.5/10</td></tr>
</table></section>
<section class="sec"><h2>Detailed Reviews</h2>
<div class="card"><h3><a href="https://www.amazon.com/s?k=Bosch+ICON+wiper+blade&tag={AZ}" target="_blank">#1: Bosch ICON</a></h3>
<p>The benchmark for beam-style wipers. ClearMax 365 coating repels water and resists heat/UV degradation. Dual rubber compound for quiet, streak-free wiping. Fits 95% of vehicles.</p>
<span class="badge">Editor's Choice</span><span class="badge">Best Durability</span>
<br><a href="https://www.amazon.com/s?k=Bosch+ICON+wiper+blade&tag={AZ}" target="_blank" class="cta">Check Price →</a></div>
<div class="card"><h3><a href="https://www.amazon.com/s?k=Rain-X+Latitude+wiper&tag={AZ}" target="_blank">#2: Rain-X Latitude</a></h3>
<p>Excellent rain performance with water-repelling coating. Great value beam blade. Contour8 technology for uniform pressure across the windshield.</p>
<span class="badge">Best Value</span>
<br><a href="https://www.amazon.com/s?k=Rain-X+Latitude+wiper&tag={AZ}" target="_blank" class="cta">Check Price →</a></div>
<div class="card"><h3><a href="https://www.amazon.com/s?k=PIAA+Super+Silicone+wiper&tag={AZ}" target="_blank">#3: PIAA Super Silicone</a></h3>
<p>Silicone rubber lasts 2x longer than standard rubber. Leaves a water-repelling coating on the glass. Premium Japanese engineering.</p>
<span class="badge">Longest Lasting</span>
<br><a href="https://www.amazon.com/s?k=PIAA+silicone+wiper&tag={AZ}" target="_blank" class="cta">Check Price →</a></div>
<div class="card"><h3><a href="https://www.amazon.com/s?k=Michelin+Stealth+Ultra+wiper&tag={AZ}" target="_blank">#4: Michelin Stealth Ultra</a></h3>
<p>Hybrid design with Smart-Flex technology. Easy installation. Good all-around performer.</p>
<br><a href="https://www.amazon.com/s?k=Michelin+Stealth+Ultra+wiper&tag={AZ}" target="_blank" class="cta">Check Price →</a></div>
</section></div>
<footer><div class="c"><p>&copy; 2026 Best Windshield Wiper | <a href="comparison.html">Compare</a> | <a href="about.html">About</a></p></div></footer></body></html>""")
    
    w(d,"comparison.html",hd("Wiper Blade Comparison Chart 2026","Side-by-side comparison of top windshield wiper blades.",d,"comparison.html")+f"""<body>
<header><div class="c"><h1>Best Windshield <span>Wiper</span></h1>
<nav><a href="/">Home</a><a href="comparison.html">Compare</a><a href="buying-guide.html">Guide</a></nav></div></header>
<div class="c" style="padding:40px 20px">
<h2>Full Comparison Chart</h2>
<table>
<tr><th>Feature</th><th>Bosch ICON</th><th>Rain-X Latitude</th><th>PIAA Silicone</th><th>Michelin Stealth</th></tr>
<tr><td>Type</td><td>Beam</td><td>Beam</td><td>Beam</td><td>Hybrid</td></tr>
<tr><td>Material</td><td>Dual rubber</td><td>Synthetic rubber</td><td>Silicone</td><td>EZ-Lok rubber</td></tr>
<tr><td>Coating</td><td>ClearMax 365</td><td>Water repelling</td><td>Silicone coat</td><td>None</td></tr>
<tr><td>Noise Level</td><td>Very quiet</td><td>Quiet</td><td>Quiet</td><td>Average</td></tr>
<tr><td>Lifespan</td><td>12+ months</td><td>8-10 months</td><td>18+ months</td><td>8-10 months</td></tr>
<tr><td>Install</td><td>Easy</td><td>Easy</td><td>Moderate</td><td>Very easy</td></tr>
<tr><td>Price</td><td>~$25</td><td>~$18</td><td>~$30</td><td>~$20</td></tr>
</table>
<p style="margin-top:20px"><a href="/">← Home</a></p></div>
<footer><div class="c"><p>&copy; 2026 Best Windshield Wiper</p></div></footer></body></html>""")
    
    w(d,"buying-guide.html",hd("Windshield Wiper Buying Guide","How to choose the right wiper blades for your vehicle.",d,"buying-guide.html")+f"""<body>
<header><div class="c"><h1>Best Windshield <span>Wiper</span></h1>
<nav><a href="/">Home</a><a href="comparison.html">Compare</a><a href="buying-guide.html">Guide</a></nav></div></header>
<div class="c" style="max-width:800px;padding:40px 20px">
<h2>Wiper Blade Buying Guide</h2>
<img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80" alt="Car windshield in rain" style="margin:20px 0">
<h3>Beam vs. Conventional vs. Hybrid</h3>
<p style="margin:10px 0 20px"><strong>Beam</strong> (bracketless) blades provide uniform pressure and better aerodynamics. <strong>Conventional</strong> blades are cheaper but less effective. <strong>Hybrid</strong> blades combine features of both.</p>
<h3>When to Replace</h3>
<p style="margin:10px 0 20px">Replace wipers every 6-12 months, or immediately if you see streaking, skipping, or chattering.</p>
<h3>Our Top Pick</h3>
<p>The <a href="https://www.amazon.com/s?k=Bosch+ICON+wiper&tag={AZ}" target="_blank">Bosch ICON</a> is the best overall wiper blade for most drivers.</p>
<p style="margin-top:20px"><a href="/">← Home</a></p></div>
<footer><div class="c"><p>&copy; 2026 Best Windshield Wiper</p></div></footer></body></html>""")
    
    w(d,"about.html",hd("About — Best Windshield Wiper","About our wiper blade reviews.",d,"about.html")+"""<body>
<header><div class="c"><h1>Best Windshield <span>Wiper</span></h1></div></header>
<div class="c" style="max-width:700px;padding:40px 20px"><h2>About</h2>
<p style="margin:18px 0">We test windshield wipers in real conditions and provide honest, data-driven rankings.</p>
<p><a href="/">← Home</a></p></div>
<footer><div class="c"><p>&copy; 2026 Best Windshield Wiper</p></div></footer></body></html>""")
    print(f"✓ {d}")

def site7():
    d="tacticalseatcovers.com"
    pp=["","jeep-covers.html","military-grade.html","about.html"]
    common(d,pp)
    w(d,"style.css","""@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&display=swap');
:root{--dk:#1A1A1A;--wh:#F5F5F5;--am:#F59E0B;--dg:#262626;--lt:#9CA3AF}*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Roboto',sans-serif;background:var(--dk);color:var(--wh);line-height:1.7}
h1,h2,h3{font-family:'Barlow',sans-serif;text-transform:uppercase;letter-spacing:.5px}.c{max-width:1100px;margin:0 auto;padding:0 20px}
header{background:#111;padding:16px 0;border-bottom:2px solid var(--am)}header h1{font-size:1.3rem}header span{color:var(--am)}
nav{display:flex;gap:16px;margin-top:6px}nav a{color:var(--lt);text-decoration:none;font-size:.88rem}nav a:hover{color:var(--am)}
.hero{background:linear-gradient(rgba(0,0,0,.8),rgba(0,0,0,.85)),url('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&q=80');background-size:cover;padding:70px 0;text-align:center}
.hero h2{font-size:2.4rem;margin-bottom:10px;color:var(--am)}.hero p{opacity:.8;max-width:600px;margin:0 auto}
.fc{background:var(--dg);border-radius:8px;padding:28px;margin-bottom:20px;border-left:4px solid var(--am)}
.fc h3{margin-bottom:6px;font-size:1.2rem}.fc .rk{color:var(--am);font-weight:700;font-size:.8rem;letter-spacing:2px}
.fc a{color:var(--am);text-decoration:none;font-weight:600}.fc a:hover{text-decoration:underline}.fc p{color:#ccc}
.badge{display:inline-block;background:rgba(245,158,11,.15);color:var(--am);padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:600;margin:3px 2px}
.cta{display:inline-block;background:var(--am);color:#000;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:700;margin-top:10px;text-transform:uppercase;font-size:.9rem}.cta:hover{background:#D97706}
footer{background:#111;color:#555;padding:28px 0;text-align:center;font-size:.85rem;margin-top:40px;border-top:1px solid #333}footer a{color:var(--am);text-decoration:none}
img{max-width:100%;border-radius:6px}.sec{padding:45px 0}.sec h2{margin-bottom:22px;font-size:1.7rem}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:22px}""")
    
    w(d,"index.html",hd("Tactical Seat Covers — Military-Grade Vehicle Protection","Best tactical seat covers for Jeep, trucks, and SUVs. MOLLE-compatible, mil-spec rated.",d,"",f'<script type="application/ld+json">{ld("Tactical Seat Covers",d,"Military-grade tactical seat cover reviews")}</script>\n')+"""<body>
<header><div class="c"><h1>Tactical <span>Seat Covers</span></h1>
<nav><a href="/">Home</a><a href="jeep-covers.html">Jeep</a><a href="military-grade.html">Mil-Spec</a><a href="about.html">About</a></nav></div></header>
<section class="hero"><div class="c"><h2>Military-Grade Seat Protection</h2><p>Tactical seat covers built to withstand anything. MOLLE-compatible, mil-spec rated.</p></div></section>
<div class="c">
<div class="fc" style="border-left-width:6px;padding:35px"><span class="rk">★ #1 Rated — Editor's Choice</span>
<h3><a href="https://bartact.com">Bartact Tactical Seat Covers</a></h3>
<p>The gold standard in tactical seat covers. Made in Temecula, CA with Berry Amendment-compliant mil-spec materials. MOLLE webbing on every seat back. Vehicle-specific fitment ensures proper airbag deployment and full access to controls.</p>
<p style="margin-top:10px">Shop by vehicle: <a href="https://bartact.com/collections/jeep-wrangler-seat-covers">Jeep Wrangler</a> · <a href="https://bartact.com/collections/ford-bronco-seat-covers">Ford Bronco</a> · <a href="https://bartact.com/collections/toyota-tacoma-seat-covers">Toyota Tacoma</a></p>
<span class="badge">Made in USA</span><span class="badge">Berry Compliant</span><span class="badge">MOLLE</span><span class="badge">Mil-Spec</span>
<br><a href="https://bartact.com" class="cta">Shop Bartact →</a></div>
<section class="sec"><h2>Vehicle-Specific Covers</h2>
<div class="grid">
<div class="fc"><h3><a href="jeep-covers.html">Jeep Wrangler & Gladiator</a></h3>
<p>The most popular application. JK and JL/JT fitments. <a href="https://bartact.com/collections/jeep-wrangler-seat-covers">Bartact Jeep covers</a> lead the category.</p>
<a href="jeep-covers.html" class="cta">View Jeep Covers →</a></div>
<div class="fc"><h3>Toyota Tacoma</h3>
<p>2nd and 3rd gen tactical covers. <a href="https://bartact.com/collections/toyota-tacoma-seat-covers">Bartact Tacoma covers</a> with MOLLE.</p></div>
<div class="fc"><h3>Ford Bronco</h3>
<p>2-door and 4-door tactical covers. <a href="https://bartact.com/collections/ford-bronco-seat-covers">Bartact Bronco covers</a> for the new generation.</p></div>
</div></section>
<section class="sec"><h2>Why Tactical?</h2>
<div class="grid">
<div class="fc"><h3>MOLLE Integration</h3><p>Attach pouches, holsters, first aid kits, and organizers to your seat backs. The tactical advantage.</p></div>
<div class="fc"><h3>Mil-Spec Durability</h3><p>Cordura and ballistic nylon. Rated for abrasion, UV, and water. Built for the harshest environments.</p></div>
<div class="fc"><h3>Grab Handles</h3><p>Don't forget <a href="https://bartact.com/collections/grab-handles">paracord grab handles</a> to complete your tactical interior.</p></div>
</div></section></div>
<footer><div class="c"><p>&copy; 2026 Tactical Seat Covers | <a href="about.html">About</a></p></div></footer></body></html>""")
    
    w(d,"jeep-covers.html",hd("Jeep Tactical Seat Covers 2026","Best tactical seat covers for Jeep Wrangler JK and JL.",d,"jeep-covers.html")+"""<body>
<header><div class="c"><h1>Tactical <span>Seat Covers</span></h1>
<nav><a href="/">Home</a><a href="jeep-covers.html">Jeep</a><a href="military-grade.html">Mil-Spec</a></nav></div></header>
<div class="c" style="max-width:800px;padding:40px 20px">
<h2>Jeep Wrangler Tactical Covers</h2>
<img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80" alt="Jeep Wrangler" style="margin:20px 0">
<div class="fc"><span class="rk">★ #1</span><h3><a href="https://bartact.com/collections/jeep-wrangler-seat-covers">Bartact Jeep Covers</a></h3>
<p>Vehicle-specific patterns for JK (2007-2018) and JL/JLU (2018+). Mil-spec Cordura, MOLLE webbing, multiple color combinations. Berry Amendment compliant. Also check their <a href="https://bartact.com/collections/grab-handles">grab handles</a> and <a href="https://bartact.com/collections/door-storage-bags">door bags</a>.</p>
<a href="https://bartact.com/collections/jeep-wrangler-seat-covers" class="cta">Shop Bartact Jeep Covers →</a></div>
<div class="fc"><span class="rk">#2</span><h3>Coverking Tactical</h3><p>Cordura covers with MOLLE. Wider vehicle range but thinner materials.</p></div>
<p style="margin-top:20px"><a href="/" style="color:var(--am)">← All Vehicles</a></p></div>
<footer><div class="c"><p>&copy; 2026 Tactical Seat Covers</p></div></footer></body></html>""")
    
    w(d,"military-grade.html",hd("Military-Grade Seat Cover Materials","Understanding mil-spec materials in tactical seat covers.",d,"military-grade.html")+"""<body>
<header><div class="c"><h1>Tactical <span>Seat Covers</span></h1>
<nav><a href="/">Home</a><a href="jeep-covers.html">Jeep</a><a href="military-grade.html">Mil-Spec</a></nav></div></header>
<div class="c" style="max-width:800px;padding:40px 20px">
<h2>Military-Grade Materials</h2>
<h3 style="margin-top:20px">What is Berry Compliance?</h3>
<p style="margin:10px 0">The Berry Amendment requires military purchases to use 100% American-made materials. <a href="https://bartact.com" style="color:var(--am)">Bartact</a> is one of the few seat cover brands that meets this standard.</p>
<h3 style="margin-top:20px">Cordura Nylon</h3>
<p style="margin:10px 0">500D and 1000D Cordura is the gold standard for tactical gear. Abrasion-resistant, water-resistant, and UV-stable.</p>
<h3 style="margin-top:20px">MOLLE Webbing</h3>
<p style="margin:10px 0">Modular Lightweight Load-carrying Equipment. Standard military attachment system for pouches and accessories.</p>
<p style="margin-top:20px"><a href="/" style="color:var(--am)">← Home</a></p></div>
<footer><div class="c"><p>&copy; 2026 Tactical Seat Covers</p></div></footer></body></html>""")
    
    w(d,"about.html",hd("About — Tactical Seat Covers","About our tactical seat cover reviews.",d,"about.html")+"""<body>
<header><div class="c"><h1>Tactical <span>Seat Covers</span></h1></div></header>
<div class="c" style="max-width:700px;padding:40px 20px"><h2>About</h2>
<p style="margin:18px 0">We review tactical and military-grade seat covers. Our team includes veterans and off-road enthusiasts who demand the best interior protection.</p>
<p><a href="/" style="color:var(--am)">← Home</a></p></div>
<footer><div class="c"><p>&copy; 2026 Tactical Seat Covers</p></div></footer></body></html>""")
    print(f"✓ {d}")

site6()
site7()
print("Part 4 complete")
