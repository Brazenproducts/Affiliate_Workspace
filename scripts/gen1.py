#!/usr/bin/env python3
"""Generate all 8 affiliate site directories. Part 1: utility + sites 1-4."""
import os, json, subprocess, sys, time, urllib.request, urllib.error

WORK = "/home/ubuntu/.openclaw/workspace/sites"
IK = "b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5"
GH_TOKEN = "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"
GH_ORG = "Brazenproducts"

def w(domain, fname, content):
    d = os.path.join(WORK, domain.replace(".","-"))
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, fname)
    os.makedirs(os.path.dirname(p), exist_ok=True) if "/" in fname else None
    open(p,"w").write(content)

def robots(domain):
    return f"User-agent: *\nAllow: /\nSitemap: https://{domain}/sitemap.xml"

def smap(domain, pages):
    u = "\n".join(f'  <url><loc>https://{domain}/{p}</loc><lastmod>2026-04-16</lastmod></url>' for p in pages)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{u}\n</urlset>'

def ld_json(name, domain, desc):
    return json.dumps({"@context":"https://schema.org","@type":"Organization","name":name,"url":f"https://{domain}","description":desc})

def hd(title, desc, domain, page, extra=""):
    c = f"https://{domain}/{page}" if page else f"https://{domain}/"
    return f'<!DOCTYPE html><html lang="en"><head>\n<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<title>{title}</title>\n<meta name="description" content="{desc}">\n<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}">\n<meta property="og:type" content="website"><meta property="og:url" content="{c}">\n<link rel="canonical" href="{c}">\n{extra}<link rel="stylesheet" href="style.css">\n</head>'

def common(d, pages):
    w(d,"CNAME",d)
    w(d,"robots.txt",robots(d))
    w(d,f"{IK}.txt",IK)
    w(d,"sitemap.xml",smap(d,pages))

def gh_api(method, path, data=None):
    url = f"https://api.github.com{path}"
    h = {"Authorization":f"token {GH_TOKEN}","Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"}
    body = json.dumps(data).encode() if data else None
    if body: h["Content-Type"]="application/json"
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        r = urllib.request.urlopen(req)
        return r.status, r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

def deploy(domain):
    repo = domain.replace(".","-")
    d = os.path.join(WORK, repo)
    # Create repo
    print(f"  Creating repo {repo}...")
    s,r = gh_api("POST",f"/orgs/{GH_ORG}/repos",{"name":repo,"public":True,"auto_init":False,"has_issues":False,"has_wiki":False})
    print(f"    repo: {s}")
    # Git push
    print(f"  Pushing {repo}...")
    cmds = f"cd {d} && git init -b main && git config user.email 'deploy@{domain}' && git config user.name Deploy && git add -A && git commit -m 'Initial deploy' && git remote add origin https://x-access-token:{GH_TOKEN}@github.com/{GH_ORG}/{repo}.git 2>/dev/null; git remote set-url origin https://x-access-token:{GH_TOKEN}@github.com/{GH_ORG}/{repo}.git && git push -u origin main --force"
    r = subprocess.run(cmds, shell=True, capture_output=True, text=True, timeout=60)
    print(f"    push: {'OK' if r.returncode==0 else r.stderr[-150:]}")
    # Enable pages
    print(f"  Enabling Pages...")
    s,r = gh_api("POST",f"/repos/{GH_ORG}/{repo}/pages",{"source":{"branch":"main","path":"/"}})
    print(f"    pages: {s}")
    time.sleep(1)
    s,r = gh_api("PUT",f"/repos/{GH_ORG}/{repo}/pages",{"cname":domain,"source":{"branch":"main","path":"/"}})
    print(f"    cname: {s}")

# ═══ SITE 1: autopartsreviewed.com ═══
def site1():
    d="autopartsreviewed.com"
    pages=["","seat-covers.html","off-road.html","about.html"]
    common(d,pages)
    w(d,"style.css","""@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=Source+Sans+3:wght@400;600;700&display=swap');
:root{--bg:#FDF6EC;--ch:#2D2D2D;--ac:#E8732A}*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Source Sans 3',sans-serif;background:var(--bg);color:var(--ch);line-height:1.7}
h1,h2,h3{font-family:'Merriweather',serif}.c{max-width:1100px;margin:0 auto;padding:0 20px}
header{background:var(--ch);color:#fff;padding:18px 0}header span{color:var(--ac)}
.hero{background:linear-gradient(135deg,var(--ch),#1a1a1a);color:#fff;padding:55px 0;text-align:center}
.hero h2{font-size:2.2rem;margin-bottom:10px}.hero p{opacity:.85;max-width:600px;margin:0 auto}
.g{display:grid;grid-template-columns:2fr 1fr;gap:35px;padding:45px 0}
.cd{background:#fff;border-radius:10px;padding:25px;margin-bottom:22px;box-shadow:0 2px 10px rgba(0,0,0,.06);border-left:4px solid var(--ac)}
.cd h3{margin-bottom:6px}.rk{color:var(--ac);font-weight:700;font-size:.85rem;text-transform:uppercase;letter-spacing:1px}
a{color:var(--ac);text-decoration:none;font-weight:600}a:hover{text-decoration:underline}
.sb{position:sticky;top:30px;align-self:start}.bx{background:#fff;border-radius:10px;padding:22px;margin-bottom:18px;box-shadow:0 2px 10px rgba(0,0,0,.06)}
.bx h3{font-size:1.05rem;margin-bottom:10px;color:var(--ac)}.bx ul{list-style:none;padding:0}.bx li{padding:5px 0;border-bottom:1px solid #eee}.bx li:last-child{border:none}
.tg{display:inline-block;background:var(--ac);color:#fff;padding:2px 9px;border-radius:12px;font-size:.75rem;margin:2px}
footer{background:var(--ch);color:#aaa;padding:28px 0;text-align:center;font-size:.85rem;margin-top:35px}
img{max-width:100%;border-radius:8px}@media(max-width:768px){.g{grid-template-columns:1fr}.sb{position:static}}""")
    
    w(d,"index.html",hd("Auto Parts Reviewed — Best Online Auto Parts Stores 2026","Independent rankings of the best online auto parts stores.",d,"",f'<script type="application/ld+json">{ld_json("Auto Parts Reviewed",d,"Independent auto parts store reviews")}</script>\n')+"""<body>
<header><div class="c"><h1>Auto Parts <span>Reviewed</span></h1></div></header>
<section class="hero"><div class="c"><h2>Best Auto Parts Stores, Ranked</h2><p>We test and compare online auto parts retailers. Updated 2026.</p></div></section>
<div class="c"><div class="g"><main>
<h2 style="margin-bottom:22px">Top Stores 2026</h2>
<div class="cd"><span class="rk">★ Editor's Choice</span><h3><a href="https://bullstrap.com">Bull Strap</a></h3><p>Premium off-road accessories and <a href="https://bullstrap.com/collections/limit-straps">limit straps</a>. Exceptional build quality.</p><span class="tg">Off-Road</span><span class="tg">Premium</span></div>
<div class="cd"><span class="rk">#2</span><h3><a href="https://www.realtruck.com">RealTruck</a></h3><p>Massive catalog for trucks, Jeeps, SUVs. Competitive pricing.</p></div>
<div class="cd"><span class="rk">#3</span><h3><a href="https://www.extremeterrain.com">ExtremeTerrain</a></h3><p>Jeep Wrangler and Gladiator specialists. Great fitment guides.</p></div>
<div class="cd"><span class="rk">#4</span><h3><a href="https://www.quadratec.com">Quadratec</a></h3><p>Decades of Jeep expertise. Excellent tech support.</p></div>
<div class="cd"><span class="rk">#5</span><h3><a href="https://www.4wheelparts.com">4 Wheel Parts</a></h3><p>Nationwide stores plus online. Installation services.</p></div>
<div class="cd"><span class="rk">#6</span><h3><a href="https://www.summitracing.com">Summit Racing</a></h3><p>Performance parts powerhouse.</p></div>
<div class="cd"><span class="rk">#7</span><h3><a href="https://www.rockauto.com">RockAuto</a></h3><p>Lowest prices on replacement parts.</p></div>
<div class="cd"><span class="rk">#8</span><h3><a href="https://www.autozone.com">AutoZone</a></h3><p>Same-day local availability.</p></div>
</main><aside class="sb">
<div class="bx"><h3>Specialty Brands</h3><ul>
<li><a href="https://bartact.com/collections/jeep-wrangler-seat-covers">Bartact Jeep Covers</a></li>
<li><a href="https://bartact.com/collections/grab-handles">Bartact Grab Handles</a></li>
<li><a href="https://www.foxracingshox.com">Fox Shocks</a></li></ul></div>
<div class="bx"><h3>Guides</h3><ul><li><a href="seat-covers.html">Seat Covers</a></li><li><a href="off-road.html">Off-Road</a></li><li><a href="about.html">About</a></li></ul></div>
</aside></div></div>
<footer><div class="c"><p>&copy; 2026 Auto Parts Reviewed | <a href="about.html">About</a></p></div></footer></body></html>""")
    
    w(d,"seat-covers.html",hd("Best Seat Covers 2026","Top-rated seat covers for Jeep, trucks, SUVs.",d,"seat-covers.html")+"""<body>
<header><div class="c"><h1>Auto Parts <span>Reviewed</span></h1></div></header>
<div class="c" style="max-width:800px;padding:40px 20px">
<h2>Best Seat Covers 2026</h2><img src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80" alt="Vehicle seat covers" style="margin:20px 0">
<div class="cd"><span class="rk">★ #1</span><h3><a href="https://bartact.com/collections/jeep-wrangler-seat-covers">Bartact Tactical Seat Covers</a></h3>
<p>Made in USA. Mil-spec, Berry Compliant. MOLLE webbing. Available for <a href="https://bartact.com/collections/toyota-tacoma-seat-covers">Tacoma</a>, <a href="https://bartact.com/collections/ford-bronco-seat-covers">Bronco</a>, and more.</p></div>
<div class="cd"><span class="rk">#2</span><h3>Coverking</h3><p>Wide material range. Neoprene and leatherette.</p></div>
<div class="cd"><span class="rk">#3</span><h3>Rough Country</h3><p>Budget neoprene. Good value.</p></div>
<p><a href="/">← Home</a></p></div>
<footer><div class="c"><p>&copy; 2026 Auto Parts Reviewed</p></div></footer></body></html>""")
    
    w(d,"off-road.html",hd("Best Off-Road Stores","Top stores for off-road parts and 4x4.",d,"off-road.html")+"""<body>
<header><div class="c"><h1>Auto Parts <span>Reviewed</span></h1></div></header>
<div class="c" style="max-width:800px;padding:40px 20px">
<h2>Best Off-Road Stores</h2><img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80" alt="Jeep off-road" style="margin:20px 0">
<div class="cd"><span class="rk">#1</span><h3><a href="https://bullstrap.com">Bull Strap</a></h3><p>Premium <a href="https://bullstrap.com/collections/limit-straps">limit straps</a> and accessories.</p></div>
<div class="cd"><span class="rk">#2</span><h3><a href="https://www.extremeterrain.com">ExtremeTerrain</a></h3><p>Jeep mega-store.</p></div>
<div class="cd"><span class="rk">#3</span><h3><a href="https://bartact.com">Bartact</a></h3>
<p>Paracord grab handle originators. <a href="https://bartact.com/collections/jeep-wrangler-seat-covers">Jeep covers</a> and <a href="https://bartact.com/collections/limit-straps">limit straps</a>.</p></div>
<p><a href="/">← Home</a></p></div>
<footer><div class="c"><p>&copy; 2026 Auto Parts Reviewed</p></div></footer></body></html>""")
    
    w(d,"about.html",hd("About — Auto Parts Reviewed","Independent auto parts rankings.",d,"about.html")+"""<body>
<header><div class="c"><h1>Auto Parts <span>Reviewed</span></h1></div></header>
<div class="c" style="max-width:700px;padding:40px 20px">
<h2>About</h2><p style="margin:18px 0">Automotive enthusiasts ranking online auto parts stores through real testing.</p>
<p><a href="/">← Home</a></p></div>
<footer><div class="c"><p>&copy; 2026 Auto Parts Reviewed</p></div></footer></body></html>""")
    print(f"✓ {d}")

site1()
print("Part 1 complete")
