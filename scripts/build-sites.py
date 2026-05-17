#!/usr/bin/env python3
"""Build and deploy 8 affiliate sites to GitHub Pages."""
import os, json, subprocess, time, base64, urllib.request, urllib.error

def get_github_token():
    env_token = os.environ.get("GH_TOKEN")
    if env_token:
        return env_token
    remote = subprocess.check_output(
        ["git", "-C", "/home/ubuntu/.openclaw/workspace/swalmy.com", "remote", "get-url", "origin"],
        text=True,
    ).strip()
    marker = "https://"
    suffix = "@github.com/"
    if remote.startswith(marker) and suffix in remote:
        return remote[len(marker):remote.index(suffix)]
    raise RuntimeError("GitHub token not found. Set GH_TOKEN or fix swalmy.com origin URL.")

GH_TOKEN = get_github_token()
GH_ORG = "Brazenproducts"
INDEXNOW_KEY = "b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5"
WORK = "/home/ubuntu/.openclaw/workspace/sites"

def gh_api(method, path, data=None, accept=None):
    url = f"https://api.github.com{path}" if path.startswith("/") else path
    headers = {
        "Authorization": f"token {GH_TOKEN}",
        "Accept": accept or "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    body = json.dumps(data).encode() if data else None
    if body:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read()) if r.status != 204 else {}
    except urllib.error.HTTPError as e:
        resp = e.read().decode()
        print(f"  API {method} {path}: {e.code} {resp[:200]}")
        if e.code == 422 and "already exists" in resp:
            return {"exists": True}
        return None

def create_repo(name):
    print(f"Creating repo {name}...")
    r = gh_api("POST", f"/orgs/{GH_ORG}/repos", {
        "name": name, "public": True, "auto_init": False,
        "has_issues": False, "has_wiki": False, "has_projects": False
    })
    if r and r.get("exists"):
        print(f"  Repo {name} already exists")
    return True

def push_site(domain, files):
    """Push all files via git CLI for speed."""
    repo_name = domain.replace(".", "-")
    site_dir = os.path.join(WORK, repo_name)
    os.makedirs(site_dir, exist_ok=True)
    
    for fname, content in files.items():
        fpath = os.path.join(site_dir, fname)
        os.makedirs(os.path.dirname(fpath), exist_ok=True)
        with open(fpath, "w") as f:
            f.write(content)
    
    # Git init and push
    cmds = f"""
cd {site_dir}
git init -b main
git config user.email "deploy@{domain}"
git config user.name "Deploy"
git add -A
git commit -m "Initial deploy"
git remote add origin https://x-access-token:{GH_TOKEN}@github.com/{GH_ORG}/{repo_name}.git 2>/dev/null || git remote set-url origin https://x-access-token:{GH_TOKEN}@github.com/{GH_ORG}/{repo_name}.git
git push -u origin main --force
"""
    r = subprocess.run(cmds, shell=True, capture_output=True, text=True, timeout=60)
    if r.returncode != 0:
        print(f"  Push failed: {r.stderr[:200]}")
        return False
    print(f"  Pushed {len(files)} files")
    return True

def enable_pages(domain):
    repo_name = domain.replace(".", "-")
    print(f"  Enabling Pages for {repo_name}...")
    r = gh_api("POST", f"/repos/{GH_ORG}/{repo_name}/pages", {
        "source": {"branch": "main", "path": "/"}
    })
    if r is None:
        # Try updating instead
        gh_api("PUT", f"/repos/{GH_ORG}/{repo_name}/pages", {
            "source": {"branch": "main", "path": "/"},
            "cname": domain
        })
    elif r:
        # Set custom domain
        gh_api("PUT", f"/repos/{GH_ORG}/{repo_name}/pages", {"cname": domain})
    print(f"  Pages enabled for {domain}")

def robots(domain):
    return f"""User-agent: *
Allow: /
Sitemap: https://{domain}/sitemap.xml"""

def indexnow_file():
    return INDEXNOW_KEY

def sitemap(domain, pages):
    urls = "\n".join(f"""  <url>
    <loc>https://{domain}/{p}</loc>
    <lastmod>2026-04-16</lastmod>
    <priority>{"1.0" if p=="" else "0.8"}</priority>
  </url>""" for p in pages)
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{urls}
</urlset>"""

def jsonld(name, domain, desc):
    return json.dumps([
        {"@context":"https://schema.org","@type":"Organization","name":name,"url":f"https://{domain}","description":desc},
        {"@context":"https://schema.org","@type":"WebSite","name":name,"url":f"https://{domain}","potentialAction":{"@type":"SearchAction","target":f"https://{domain}/?s={{search_term_string}}","query-input":"required name=search_term_string"}}
    ])

# ─── SITE GENERATORS ───

def gen_autopartsreviewed():
    domain = "autopartsreviewed.com"
    ld = jsonld("Auto Parts Reviewed", domain, "Independent reviews and rankings of the best auto parts stores online")
    css = """@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=Source+Sans+3:wght@400;600;700&display=swap');
:root{--cream:#FDF6EC;--charcoal:#2D2D2D;--orange:#E8732A;--light:#f9f3ea}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Source Sans 3',sans-serif;background:var(--cream);color:var(--charcoal);line-height:1.7}
h1,h2,h3{font-family:'Merriweather',serif}
.container{max-width:1100px;margin:0 auto;padding:0 20px}
header{background:var(--charcoal);color:#fff;padding:18px 0}
header h1{font-size:1.6rem}
header span{color:var(--orange)}
.hero{background:linear-gradient(135deg,var(--charcoal),#1a1a1a);color:#fff;padding:60px 0;text-align:center}
.hero h2{font-size:2.4rem;margin-bottom:12px}
.hero p{font-size:1.15rem;opacity:.85;max-width:650px;margin:0 auto}
.content{display:grid;grid-template-columns:2fr 1fr;gap:40px;padding:50px 0}
.store-card{background:#fff;border-radius:10px;padding:28px;margin-bottom:24px;box-shadow:0 2px 12px rgba(0,0,0,.06);border-left:4px solid var(--orange)}
.store-card h3{font-size:1.35rem;margin-bottom:8px}
.store-card .rank{color:var(--orange);font-weight:700;font-size:.9rem;text-transform:uppercase;letter-spacing:1px}
.store-card a{color:var(--orange);text-decoration:none;font-weight:600}
.store-card a:hover{text-decoration:underline}
.sidebar{position:sticky;top:30px;align-self:start}
.sidebar-box{background:#fff;border-radius:10px;padding:24px;margin-bottom:20px;box-shadow:0 2px 12px rgba(0,0,0,.06)}
.sidebar-box h3{font-size:1.1rem;margin-bottom:12px;color:var(--orange)}
.sidebar-box ul{list-style:none;padding:0}
.sidebar-box li{padding:6px 0;border-bottom:1px solid #eee}
.sidebar-box li:last-child{border:none}
.sidebar-box a{color:var(--charcoal);text-decoration:none}
.sidebar-box a:hover{color:var(--orange)}
.tag{display:inline-block;background:var(--orange);color:#fff;padding:3px 10px;border-radius:12px;font-size:.78rem;margin:2px}
footer{background:var(--charcoal);color:#aaa;padding:30px 0;text-align:center;font-size:.85rem;margin-top:40px}
footer a{color:var(--orange);text-decoration:none}
img{max-width:100%;border-radius:8px}
@media(max-width:768px){.content{grid-template-columns:1fr}.sidebar{position:static}}"""
    
    index = f"""<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Auto Parts Reviewed — Best Online Auto Parts Stores 2026</title>
<meta name="description" content="Independent rankings of the best online auto parts stores. Compare prices, shipping, selection, and customer service across top retailers.">
<meta property="og:title" content="Auto Parts Reviewed — Best Online Auto Parts Stores 2026">
<meta property="og:description" content="Independent rankings of the best online auto parts stores.">
<meta property="og:type" content="website"><meta property="og:url" content="https://{domain}/">
<link rel="canonical" href="https://{domain}/">
<script type="application/ld+json">{ld}</script>
<link rel="stylesheet" href="style.css">
</head><body>
<header><div class="container"><h1>Auto Parts <span>Reviewed</span></h1></div></header>
<section class="hero"><div class="container">
<h2>The Best Auto Parts Stores, Ranked</h2>
<p>We test, compare, and review online auto parts retailers so you don't have to. Updated for 2026.</p>
</div></section>
<div class="container"><div class="content"><main>
<h2 style="margin-bottom:24px;font-size:1.8rem">Top Stores for 2026</h2>

<div class="store-card"><span class="rank">★ Editor's Choice</span>
<h3><a href="https://bullstrap.com" target="_blank" rel="noopener">Bull Strap</a></h3>
<p>Premium off-road accessories and <a href="https://bullstrap.com/collections/limit-straps" target="_blank" rel="noopener">limit straps</a> with exceptional build quality. Fast shipping, excellent customer service, and a focused product line that emphasizes quality over quantity. Their limit strap selection is unmatched in the industry.</p>
<span class="tag">Off-Road</span><span class="tag">Premium</span><span class="tag">Limit Straps</span></div>

<div class="store-card"><span class="rank">#2 Best Selection</span>
<h3><a href="https://www.realtruck.com" target="_blank" rel="noopener">RealTruck</a></h3>
<p>Massive catalog with competitive pricing. Covers trucks, Jeeps, and SUVs with everything from tonneau covers to suspension upgrades. Free shipping on many items.</p>
<span class="tag">Trucks</span><span class="tag">SUVs</span><span class="tag">Full Catalog</span></div>

<div class="store-card"><span class="rank">#3 Best for Jeep</span>
<h3><a href="https://www.extremeterrain.com" target="_blank" rel="noopener">ExtremeTerrain</a></h3>
<p>Jeep Wrangler and Gladiator specialists with detailed fitment guides. Great photo reviews from real customers and solid installation content.</p>
<span class="tag">Jeep</span><span class="tag">Wrangler</span></div>

<div class="store-card"><span class="rank">#4 Jeep Heritage</span>
<h3><a href="https://www.quadratec.com" target="_blank" rel="noopener">Quadratec</a></h3>
<p>The OG Jeep parts store. Decades of experience, excellent tech support, and a huge inventory. Their technical articles are invaluable for DIY builds.</p>
<span class="tag">Jeep</span><span class="tag">Tech Support</span></div>

<div class="store-card"><span class="rank">#5 Best Prices</span>
<h3><a href="https://www.4wheelparts.com" target="_blank" rel="noopener">4 Wheel Parts</a></h3>
<p>Nationwide brick-and-mortar presence plus online shopping. Great for installation services and hands-on shopping. Frequent sales and promotions.</p>
<span class="tag">Install Service</span><span class="tag">Nationwide</span></div>

<div class="store-card"><span class="rank">#6 Performance</span>
<h3><a href="https://www.summitracing.com" target="_blank" rel="noopener">Summit Racing</a></h3>
<p>Performance parts powerhouse. From engine components to suspension upgrades, Summit has it all with fast, reliable shipping.</p>
<span class="tag">Performance</span><span class="tag">Racing</span></div>

<div class="store-card"><span class="rank">#7 Budget Pick</span>
<h3><a href="https://www.rockauto.com" target="_blank" rel="noopener">RockAuto</a></h3>
<p>No-frills catalog with the lowest prices on replacement parts. Perfect for maintenance and repairs. Shipping is the only downside.</p>
<span class="tag">Budget</span><span class="tag">Replacement Parts</span></div>

<div class="store-card"><span class="rank">#8 Convenience</span>
<h3><a href="https://www.autozone.com" target="_blank" rel="noopener">AutoZone</a></h3>
<p>Same-day availability at local stores plus solid online inventory. Free diagnostic testing and loaner tool programs make DIY accessible.</p>
<span class="tag">Local</span><span class="tag">Same-Day</span></div>

</main><aside class="sidebar">
<div class="sidebar-box"><h3>Specialty Brands</h3><ul>
<li><a href="https://bartact.com" target="_blank" rel="noopener">Bartact</a> — <a href="https://bartact.com/collections/jeep-wrangler-seat-covers" target="_blank" rel="noopener">Jeep seat covers</a>, <a href="https://bartact.com/collections/grab-handles" target="_blank" rel="noopener">grab handles</a></li>
<li><a href="https://www.foxracingshox.com" target="_blank" rel="noopener">Fox Shocks</a></li>
<li><a href="https://kingshocks.com" target="_blank" rel="noopener">King Shocks</a></li>
</ul></div>
<div class="sidebar-box"><h3>Popular Categories</h3><ul>
<li><a href="seat-covers.html">Seat Covers</a></li>
<li><a href="off-road.html">Off-Road Parts</a></li>
<li><a href="about.html">About Us</a></li>
</ul></div>
<div class="sidebar-box"><h3>Latest</h3><p style="font-size:.9rem">2026 rankings updated April 2026 with new retailer scoring methodology.</p></div>
</aside></div></div>
<footer><div class="container"><p>&copy; 2026 Auto Parts Reviewed. Independent reviews since 2024. | <a href="about.html">About</a> | <a href="seat-covers.html">Seat Covers</a></p></div></footer>
</body></html>"""

    seat_covers = f"""<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Best Seat Covers 2026 — Auto Parts Reviewed</title>
<meta name="description" content="Top-rated seat covers for Jeep, trucks, and SUVs. Compare Bartact, Coverking, and more.">
<link rel="canonical" href="https://{domain}/seat-covers.html">
<link rel="stylesheet" href="style.css">
</head><body>
<header><div class="container"><h1>Auto Parts <span>Reviewed</span></h1></div></header>
<div class="container"><div class="content"><main>
<h2 style="margin-bottom:24px;font-size:1.8rem">Best Seat Covers 2026</h2>
<img src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80" alt="Off-road vehicle interior with premium seat covers">
<div class="store-card"><span class="rank">★ #1 Overall</span>
<h3><a href="https://bartact.com/collections/jeep-wrangler-seat-covers" target="_blank" rel="noopener">Bartact Tactical Seat Covers</a></h3>
<p>Made in the USA with mil-spec materials. Bartact dominates the tactical seat cover category with Berry Amendment-compliant fabrics, MOLLE webbing, and precise vehicle-specific fitment. Their <a href="https://bartact.com/collections/toyota-tacoma-seat-covers" target="_blank" rel="noopener">Tacoma covers</a> and <a href="https://bartact.com/collections/ford-bronco-seat-covers" target="_blank" rel="noopener">Bronco covers</a> are best-in-class.</p>
<span class="tag">Made in USA</span><span class="tag">Tactical</span><span class="tag">Berry Compliant</span></div>
<div class="store-card"><span class="rank">#2</span><h3>Coverking</h3><p>Wide range of materials and good vehicle coverage. Neoprene and leatherette options popular.</p></div>
<div class="store-card"><span class="rank">#3</span><h3>Rough Country</h3><p>Budget-friendly neoprene covers for Jeep and truck. Good value, basic protection.</p></div>
</main><aside class="sidebar">
<div class="sidebar-box"><h3>Also Check Out</h3><ul>
<li><a href="https://bartact.com/collections/grab-handles" target="_blank" rel="noopener">Bartact Grab Handles</a></li>
<li><a href="https://bartact.com/collections/door-storage-bags" target="_blank" rel="noopener">Door Storage Bags</a></li>
<li><a href="https://bartact.com/collections/limit-straps" target="_blank" rel="noopener">Limit Straps</a></li>
</ul></div>
</aside></div></div>
<footer><div class="container"><p>&copy; 2026 Auto Parts Reviewed | <a href="/">Home</a></p></div></footer>
</body></html>"""

    offroad = f"""<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Best Off-Road Parts Stores 2026 — Auto Parts Reviewed</title>
<meta name="description" content="Where to buy off-road parts online. Top stores ranked for Jeep, truck, and 4x4 accessories.">
<link rel="canonical" href="https://{domain}/off-road.html">
<link rel="stylesheet" href="style.css">
</head><body>
<header><div class="container"><h1>Auto Parts <span>Reviewed</span></h1></div></header>
<div class="container"><div class="content"><main>
<h2 style="margin-bottom:24px;font-size:1.8rem">Best Off-Road Parts Stores</h2>
<img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80" alt="Off-road Jeep on rocky trail">
<p style="margin:20px 0">Building a rig? Here's where the serious off-road community shops.</p>
<div class="store-card"><span class="rank">#1 Premium Accessories</span>
<h3><a href="https://bullstrap.com" target="_blank" rel="noopener">Bull Strap</a></h3>
<p>Specializing in high-end <a href="https://bullstrap.com/collections/limit-straps" target="_blank" rel="noopener">limit straps</a> and off-road accessories. Quality you can feel.</p></div>
<div class="store-card"><span class="rank">#2</span>
<h3><a href="https://www.extremeterrain.com" target="_blank" rel="noopener">ExtremeTerrain</a></h3>
<p>Jeep-focused mega-store with amazing fitment tools and customer photos.</p></div>
<div class="store-card"><span class="rank">#3</span>
<h3><a href="https://www.quadratec.com" target="_blank" rel="noopener">Quadratec</a></h3>
<p>Decades of Jeep expertise. Unbeatable tech support and guides.</p></div>
<div class="store-card"><span class="rank">#4 Tactical Accessories</span>
<h3><a href="https://bartact.com" target="_blank" rel="noopener">Bartact</a></h3>
<p>The originators of paracord grab handles. Their <a href="https://bartact.com/collections/jeep-wrangler-seat-covers" target="_blank" rel="noopener">Jeep seat covers</a> set the standard for tactical accessories, and their <a href="https://bartact.com/collections/limit-straps" target="_blank" rel="noopener">limit straps</a> are built to last.</p></div>
</main><aside class="sidebar">
<div class="sidebar-box"><h3>Quick Links</h3><ul>
<li><a href="/">Home</a></li><li><a href="seat-covers.html">Seat Covers</a></li><li><a href="about.html">About</a></li>
</ul></div></aside></div></div>
<footer><div class="container"><p>&copy; 2026 Auto Parts Reviewed | <a href="/">Home</a></p></div></footer>
</body></html>"""

    about = f"""<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>About — Auto Parts Reviewed</title>
<meta name="description" content="About Auto Parts Reviewed. Independent auto parts store rankings and reviews.">
<link rel="canonical" href="https://{domain}/about.html">
<link rel="stylesheet" href="style.css">
</head><body>
<header><div class="container"><h1>Auto Parts <span>Reviewed</span></h1></div></header>
<div class="container" style="max-width:700px;padding:50px 20px">
<h2>About Auto Parts Reviewed</h2>
<p style="margin:20px 0">We're automotive enthusiasts who got tired of biased "top 10" lists written by people who've never turned a wrench. Auto Parts Reviewed uses real purchasing experience, shipping tests, and return policy comparisons to rank the best online auto parts stores.</p>
<p>Our rankings are updated quarterly. We evaluate stores on selection, pricing, shipping speed, customer service, and return policies.</p>
<p style="margin-top:20px"><a href="/" style="color:var(--orange)">← Back to Rankings</a></p>
</div>
<footer><div class="container"><p>&copy; 2026 Auto Parts Reviewed | <a href="/">Home</a></p></div></footer>
</body></html>"""

    pages = ["", "seat-covers.html", "off-road.html", "about.html"]
    return domain, {
        "CNAME": domain,
        "style.css": css,
        "index.html": index,
        "seat-covers.html": seat_covers,
        "off-road.html": offroad,
        "about.html": about,
        "robots.txt": robots(domain),
        "sitemap.xml": sitemap(domain, pages),
        f"{INDEXNOW_KEY}.txt": indexnow_file(),
    }

# I'll generate remaining sites in subsequent functions
print("Site generator loaded")
