#!/usr/bin/env python3
"""
Master generator for all 3 affiliate sites.
Generates HTML, CSS, sitemap, and supporting files.
"""
import os, json
from datetime import datetime

BASE = "/home/ubuntu/.openclaw/workspace/affiliate-sites"
NOW = datetime.utcnow().strftime("%Y-%m-%d")
INDEXNOW_KEY = "b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5"
AMAZON_TAG = "brazenprodu01-20"

def w(site, name, content):
    p = os.path.join(BASE, site, name)
    d = os.path.dirname(p)
    if d:
        os.makedirs(d, exist_ok=True)
    with open(p, 'w') as f:
        f.write(content)
    print(f"  {name} ({len(content):,} bytes)")

def jsonld(name, url, desc):
    return json.dumps([
        {"@context":"https://schema.org","@type":"WebSite","name":name,"url":url,"description":desc},
        {"@context":"https://schema.org","@type":"Organization","name":name,"url":url}
    ])

def sitemap(domain, pages):
    urls = "\n".join(f"  <url><loc>https://{domain}/{p}</loc><lastmod>{NOW}</lastmod></url>" for p in pages)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}\n</urlset>'

print("=== Generating all 3 affiliate sites ===\n")

# ============================================================
# SITE 1: autopartsreviewed.com — Magazine/Editorial (T2)
# ============================================================
print("[1/3] autopartsreviewed.com")
S1 = "autopartsreviewed.com"

S1_CSS = '''
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=Source+Sans+3:wght@400;600;700&display=swap');
:root{--cream:#FDF6EC;--charcoal:#2D2D2D;--orange:#D4722A;--orange-light:#E8913F;--border:#E5DDD0;--card-bg:#FFFCF7;--text:#3A3A3A;--text-light:#6B6B6B}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Source Sans 3',sans-serif;background:var(--cream);color:var(--text);line-height:1.7}
h1,h2,h3,h4{font-family:'Merriweather',serif;color:var(--charcoal);line-height:1.3}
a{color:var(--orange);text-decoration:none}a:hover{text-decoration:underline;color:var(--orange-light)}
.container{max-width:1200px;margin:0 auto;padding:0 24px}
header{background:var(--charcoal);padding:18px 0;position:sticky;top:0;z-index:100}
header .container{display:flex;align-items:center;justify-content:space-between}
.logo{font-family:'Merriweather',serif;color:#fff;font-size:1.4rem;font-weight:900}
.logo span{color:var(--orange)}
nav a{color:#ccc;margin-left:28px;font-size:.95rem;font-weight:600}nav a:hover{color:#fff;text-decoration:none}
.hero{background:linear-gradient(135deg,var(--charcoal) 0%,#1a1a2e 100%);color:#fff;padding:80px 0 60px;text-align:center}
.hero h1{font-size:2.8rem;margin-bottom:16px;color:#fff}
.hero p{font-size:1.2rem;color:#bbb;max-width:700px;margin:0 auto}
.main-wrap{display:grid;grid-template-columns:1fr 340px;gap:40px;padding:50px 0}
@media(max-width:900px){.main-wrap{grid-template-columns:1fr}}
.store-card{background:var(--card-bg);border:1px solid var(--border);border-radius:12px;padding:32px;margin-bottom:28px;transition:box-shadow .2s}
.store-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.08)}
.store-card .rank{display:inline-block;background:var(--orange);color:#fff;font-weight:700;font-size:.85rem;padding:4px 14px;border-radius:20px;margin-bottom:12px}
.store-card h2{font-size:1.5rem;margin-bottom:8px}
.store-card .tagline{color:var(--text-light);font-size:1rem;margin-bottom:16px}
.store-card .meta{display:flex;flex-wrap:wrap;gap:16px;margin-bottom:16px;font-size:.9rem;color:var(--text-light)}
.store-card .meta span{background:#f0ebe3;padding:4px 12px;border-radius:6px}
.rating{display:flex;align-items:center;gap:6px;font-weight:700;color:var(--orange);font-size:1.1rem;margin-bottom:16px}
.pros-cons{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:16px 0}
@media(max-width:600px){.pros-cons{grid-template-columns:1fr}}
.pros-cons h4{font-size:.85rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;color:var(--text-light)}
.pros-cons ul{list-style:none;padding:0}.pros-cons li{padding:4px 0;font-size:.95rem}
.pros li::before{content:"\2713 ";color:#2a9d2a;font-weight:700}
.cons li::before{content:"\2717 ";color:#c0392b;font-weight:700}
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
.toc h3{font-size:1rem;margin-bottom:10px}
.toc ol{padding-left:20px}.toc li{padding:3px 0;font-size:.9rem}
'''
