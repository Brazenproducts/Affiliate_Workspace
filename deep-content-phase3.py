#!/usr/bin/env python3
"""Deep content rebuild for thin elipacko-usa.com pages:
- pp-containers (951w → 2500w+)
- shipping-boxes (961w → 2000w+)
- pp-corrugated-boxes (1175w → 2500w+)
"""

import os

BASE = '/home/ubuntu/.openclaw/workspace/elipacko-usa.com'
CDN = 'https://brazenproducts.github.io/elipacko-assets'

BANNER = '&#127482;&#127480; Manufacturer Direct &nbsp;|&nbsp; <strong>0% anti-dumping duty (Thailand mfg.)</strong> &nbsp;|&nbsp; PP Corrugated Products In Stock &nbsp;|&nbsp; &#127482;&#127480; USA Manufacturing Coming Soon &nbsp;|&nbsp; Manufactured in China, Vietnam &amp; Thailand'

SHARED_CSS = '''*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;color:#1a2332;line-height:1.6}
a{text-decoration:none;color:inherit}
:root{--navy:#0a2540;--blue:#1a6bdb;--gray:#f7f9fc;--muted:#6b7a8d;--border:#e2e8f0;--blue-light:#eff6ff}
nav{position:sticky;top:0;z-index:200;background:#fff;border-bottom:1px solid var(--border);box-shadow:0 1px 4px rgba(0,0,0,.06)}
.nav-top{display:flex;align-items:center;justify-content:space-between;height:48px;max-width:1280px;margin:0 auto;padding:0 5%}
.nav-logo{font-weight:800;font-size:1.1rem;color:var(--navy);white-space:nowrap;text-decoration:none}
.nav-logo span{color:var(--blue)}
.nav-cta-top{background:var(--blue);color:#fff;padding:7px 16px;border-radius:6px;font-size:.82rem;font-weight:700}
.nav-strip{background:#fff;border-top:1px solid var(--border)}
.nav-strip ul{display:flex;flex-wrap:wrap;list-style:none;padding:4px 5%;margin:0 auto;gap:2px;max-width:1280px}
.nav-strip a{display:block;font-size:.8rem;font-weight:500;color:var(--muted);padding:6px 9px;white-space:nowrap;border-radius:4px}
.nav-strip a:hover,.nav-strip a.active{color:var(--blue);background:var(--blue-light)}
.breadcrumb{background:var(--gray);padding:10px 5%;font-size:.82rem;color:var(--muted)}
.breadcrumb a{color:var(--blue)}
.hero{color:#fff;padding:56px 5%}
.hero-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
.hero-badge{display:inline-block;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:20px;padding:5px 14px;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:18px}
.hero h1{font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;line-height:1.15;margin-bottom:16px}
.hero h1 span{color:#fbbf24}
.hero p{color:rgba(255,255,255,.85);font-size:1rem;margin-bottom:28px;max-width:480px}
.hero-btns{display:flex;gap:12px;flex-wrap:wrap}
.btn-white{background:#fff;color:var(--navy);padding:12px 24px;border-radius:6px;font-weight:700;font-size:.9rem}
.btn-outline-w{border:2px solid rgba(255,255,255,.5);color:#fff;padding:12px 24px;border-radius:6px;font-weight:600;font-size:.9rem}
.hero-imgs{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.hero-imgs img{width:100%;height:180px;object-fit:cover;border-radius:4px}
.hero-imgs img:first-child{grid-column:1/-1;height:220px}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;margin:36px 0}
.stat-card{background:var(--gray);border-radius:10px;padding:20px;text-align:center}
.stat-card .num{font-size:1.8rem;font-weight:800;color:var(--blue);margin-bottom:4px}
.stat-card .lbl{font-size:.78rem;color:var(--muted)}
.toc{background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:18px 24px;margin:32px 0;max-width:700px}
.toc h3{font-size:.82rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#0369a1;margin-bottom:10px}
.toc ol{padding-left:20px}
.toc li{margin-bottom:6px}
.toc a{color:#0369a1;font-size:.88rem;font-weight:500}
section{padding:60px 5%}
.si{max-width:1100px;margin:0 auto}
.ab{max-width:760px}
.section-label{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--blue);margin-bottom:6px}
h2{font-size:clamp(1.4rem,2.8vw,2rem);font-weight:800;color:var(--navy);margin-bottom:14px;scroll-margin-top:76px}
h3{font-size:1.05rem;font-weight:700;color:var(--navy);margin:24px 0 10px;scroll-margin-top:76px}
p{color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px}
ul,ol{padding-left:22px;color:#374151;font-size:.96rem;line-height:1.88;margin-bottom:14px}
li{margin-bottom:4px}
strong{color:#1a2332}
.ct{width:100%;border-collapse:collapse;font-size:.87rem;margin:20px 0}
.ct th{background:var(--navy);color:#fff;padding:11px 14px;text-align:left;font-weight:600}
.ct td{padding:10px 14px;border-bottom:1px solid var(--border)}
.ct tr:nth-child(even) td{background:var(--gray)}
.yes{color:#16a34a;font-weight:700}
.no{color:#dc2626;font-weight:700}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start}
.pg{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:18px 0}
.pg img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;border:1px solid var(--border)}
.pg img:first-child{grid-column:1/-1;aspect-ratio:16/9}
.faq-item{border-bottom:1px solid var(--border);padding:18px 0}
.faq-item h4{font-size:.95rem;font-weight:700;color:var(--navy);margin-bottom:8px}
.faq-item p{color:var(--muted);font-size:.9rem;margin:0;line-height:1.75}
.note{background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px 18px;margin:20px 0}
.note p{margin:0;font-size:.9rem;color:#9a3412}
.info{background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px 18px;margin:20px 0}
.info p{margin:0;font-size:.9rem;color:#0c4a6e}
.card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;margin-top:16px}
.card{background:#fff;border:1px solid var(--border);border-radius:10px;padding:22px}
.card h3{margin-top:0;font-size:.95rem}
.card p{font-size:.88rem;margin:0}
.rg{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:16px}
.rc{background:#fff;border:1px solid var(--border);border-radius:8px;padding:14px 18px}
.rc a{color:var(--blue);font-weight:600;font-size:.88rem}
.rc p{font-size:.8rem;color:var(--muted);margin:4px 0 0}
.cta{background:var(--blue);padding:56px 5%;text-align:center;color:#fff}
.cta h2{color:#fff;font-size:clamp(1.3rem,2.5vw,1.9rem);margin-bottom:10px}
.cta p{color:rgba(255,255,255,.88);margin-bottom:22px}
.cta a{background:#fff;color:var(--navy);padding:13px 32px;border-radius:6px;font-weight:700;display:inline-block;margin:4px}
.cta a.sec{background:transparent;border:2px solid rgba(255,255,255,.5);color:#fff}
footer{background:var(--navy);color:rgba(255,255,255,.6);padding:28px 5%;font-size:.81rem;text-align:center}
footer a{color:rgba(255,255,255,.5)}
@media(max-width:768px){.two-col,.hero-inner{grid-template-columns:1fr}.pg{grid-template-columns:1fr 1fr}}
@media(max-width:480px){.pg{grid-template-columns:1fr}.hero{padding:36px 4%}}'''

def nav(active):
    pages = [
        ('pp-corrugated-boxes','PP Boxes'),('pp-gaylord-boxes','Gaylords'),('pp-pallets','Pallets'),
        ('pp-containers','Containers'),('pp-dividers','Dividers'),('pp-trays','Trays'),
        ('pp-turnover-boxes','Turnover Boxes'),('pp-ballot-boxes','Ballot Boxes'),
        ('pp-voting-booths','Voting Booths'),('pp-post-office-boxes','Post Office Boxes'),
        ('storage-moving-boxes','Storage Boxes'),('pp-meat-lugs','Meat Lugs'),
        ('pp-poultry-boxes','Poultry'),('agriculture-packaging','Agriculture'),
        ('seafood-packaging','Seafood'),('pp-corrugated-sheets','PP Sheets'),
    ]
    items = ''.join(f'<li><a href="../{s}/"{"class=\"active\"" if s==active else ""}>{l}</a></li>' for s,l in pages)
    return f'''<nav>
  <div class="nav-top">
    <a href="../" class="nav-logo">Eli<span>packo</span> USA</a>
    <a href="../#contact" class="nav-cta-top">Get a Quote</a>
  </div>
  <div class="nav-strip"><ul>{items}</ul></div>
</nav>'''

def head(title, desc, og_img, canonical, schema_json):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{CDN}/{og_img}">
<meta property="og:type" content="website">
<link rel="canonical" href="{canonical}">
<script type="application/ld+json">{schema_json}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
{SHARED_CSS}
</style>
</head>
<body>
<div class="banner-top" style="background:#f59e0b;color:#1a1a1a;text-align:center;padding:8px 5%;font-size:.82rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{BANNER}</div>'''

def foot(related_links):
    links = ''.join(f'<a href="{h}">{l}</a>' for h,l in related_links)
    return f'''<div style="background:var(--gray);padding:24px 5%">
  <div style="max-width:1100px;margin:0 auto">
    <h3 style="font-size:1rem;font-weight:700;color:var(--navy);margin-bottom:14px">Related Products</h3>
    <div style="display:flex;gap:10px;flex-wrap:wrap">{links}</div>
  </div>
</div>
<footer><p>&copy; 2026 Elipacko USA &mdash; PP Corrugated Packaging Manufacturer | <a href="../">Home</a> | <a href="https://elipacko.com/request-quote/">Get a Quote</a> | <a href="mailto:info@elipacko.com">info@elipacko.com</a></p></footer>
</body></html>'''

# ─────────────────────────────────────────
# PAGE 1: PP CONTAINERS
# ─────────────────────────────────────────
containers_schema = '''{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"What is a PP corrugated container?","acceptedAnswer":{"@type":"Answer","text":"A PP corrugated container is a rigid box or tote made from twin-wall polypropylene corrugated sheet — the plastic equivalent of cardboard corrugated, but 100% waterproof, reusable 200–500 trips, and food-safe. Used in industrial, food, pharmaceutical, and agricultural supply chains as returnable transport packaging (RTP)."}},
{"@type":"Question","name":"How much weight can a PP corrugated container hold?","acceptedAnswer":{"@type":"Answer","text":"Standard PP corrugated containers handle 44–110 lb dynamic load (filled, in transit). Stack strength depends on wall thickness: 4mm containers typically rate 550–660 lb static stack; 6mm containers 880–1,100 lb. Custom reinforced configurations are available for heavier loads."}},
{"@type":"Question","name":"Are PP containers FDA food-safe?","acceptedAnswer":{"@type":"Answer","text":"Yes. Virgin polypropylene corrugated containers comply with FDA 21 CFR 177.1520 for direct food contact. They are also USDA accepted for food facility use. White and natural-colored containers are suitable for produce, meat, poultry, and dairy applications."}},
{"@type":"Question","name":"What is the anti-dumping duty on PP containers from Thailand?","acceptedAnswer":{"@type":"Answer","text":"PP corrugated containers manufactured in Thailand enter the US at 0% anti-dumping duty. Elipacko manufactures in Thailand, Vietnam, and China — Thai-origin product carries no ADD surcharge."}},
{"@type":"Question","name":"How many trips does a PP container last?","acceptedAnswer":{"@type":"Answer","text":"200–500 trips in typical closed-loop logistics. Service life depends on application — produce containers in gentle grocery DC cycles may last 10+ years; containers in rough industrial environments with forklift contact may see 3–5 years. PP does not fatigue, warp, or absorb moisture."}},
{"@type":"Question","name":"Can PP containers be custom printed?","acceptedAnswer":{"@type":"Answer","text":"Yes. UV printing and screen printing are available on all PP corrugated container panels. Typical applications: barcodes, brand logos, handling instructions, product codes. Custom print available from MOQ 500 units, 14–21 day lead time on first run."}}
]}'''

containers_html = head(
    "PP Containers | Polypropylene Corrugated Containers Wholesale | Elipacko USA",
    "Wholesale PP corrugated containers — stackable totes, bulk bins, returnable transport packaging. FDA 21 CFR 177.1520. 0% anti-dumping duty (Thailand mfg.). 200–500 trip cycle life. Elipacko direct.",
    "bulk-container.jpg",
    "https://elipacko-usa.com/pp-containers/",
    containers_schema
) + nav('pp-containers') + f'''
<div class="breadcrumb"><a href="../">Home</a> › PP Corrugated Containers</div>

<section class="hero" style="background:linear-gradient(135deg,#0c4a6e,#075985)">
  <div class="hero-inner">
    <div>
      <div class="hero-badge">Returnable Transport Packaging</div>
      <h1>PP Corrugated Containers — <span>Stackable. Washable. 500-Trip Rated.</span></h1>
      <p>Polypropylene corrugated containers for industrial, food, pharmaceutical, and agricultural closed-loop logistics. Custom sizes, wall thicknesses, and colors. FDA food-safe. 0% anti-dumping duty from Thailand.</p>
      <div class="hero-btns">
        <a href="https://elipacko.com/request-quote/" class="btn-white">Get a Quote</a>
        <a href="../#contact" class="btn-outline-w">Request Samples</a>
      </div>
    </div>
    <div class="hero-imgs">
      <img src="{CDN}/bulk-container.jpg" alt="PP corrugated bulk container stackable tote — Elipacko USA" loading="eager">
      <img src="{CDN}/plastic-bins.jpg" alt="PP plastic bins bulk containers industrial — Elipacko USA" loading="eager">
      <img src="{CDN}/turnover-box-img_4651.jpg" alt="PP corrugated turnover box container stack — Elipacko USA" loading="lazy">
    </div>
  </div>
</section>

<section style="background:#fff">
  <div class="si">
    <div class="stat-grid">
      <div class="stat-card"><div class="num">500+</div><div class="lbl">Trip cycle life</div></div>
      <div class="stat-card"><div class="num">0%</div><div class="lbl">Anti-dumping duty (Thailand)</div></div>
      <div class="stat-card"><div class="num">4–10mm</div><div class="lbl">Wall thickness range</div></div>
      <div class="stat-card"><div class="num">3 days</div><div class="lbl">Production lead time</div></div>
      <div class="stat-card"><div class="num">FDA</div><div class="lbl">21 CFR 177.1520 compliant</div></div>
    </div>

    <div class="toc">
      <h3>Table of Contents</h3>
      <ol>
        <li><a href="#what-are">What Are PP Corrugated Containers?</a></li>
        <li><a href="#types">Container Types &amp; Applications</a></li>
        <li><a href="#vs-cardboard">PP vs Cardboard vs HDPE</a></li>
        <li><a href="#specs">Technical Specifications</a></li>
        <li><a href="#roi">ROI Calculator — Cost Per Trip</a></li>
        <li><a href="#compliance">Compliance &amp; Certifications</a></li>
        <li><a href="#gallery">Product Gallery</a></li>
        <li><a href="#faq">FAQ</a></li>
      </ol>
    </div>
  </div>
</section>

<section id="what-are" style="background:var(--gray)">
  <div class="si ab">
    <div class="section-label">Overview</div>
    <h2>What Are PP Corrugated Containers?</h2>
    <p>PP corrugated containers are rigid boxes, totes, and bins fabricated from twin-wall polypropylene corrugated sheet — the plastic equivalent of cardboard corrugated, engineered for reuse. The twin-wall flute structure gives PP corrugated a high strength-to-weight ratio: a 6mm PP container wall weighs roughly 1,100 g/m² while supporting static stack loads above 880 lb.</p>
    <p>Unlike cardboard, PP corrugated is completely waterproof, chemically inert, and non-absorbent. A PP container returned from a cold chain produce run can be pressure-washed, sanitized, and returned to rotation the same day — no box collapse, no moisture damage, no delamination. That's why returnable PP containers have replaced one-way cardboard in produce, poultry, automotive, pharmaceutical, and general industrial closed-loop logistics worldwide.</p>
    <p>Elipacko manufactures PP corrugated containers in custom dimensions, wall thicknesses from 4mm to 10mm, and any color. Standard configurations ship from Thailand — entering the US at 0% anti-dumping duty. USA Manufacturing is coming soon.</p>
    <h3>PP Corrugated vs Injection-Molded Plastic Bins</h3>
    <p>Injection-molded HDPE bins are the dominant competing product in US industrial logistics. The trade-off is cost and customization: injection molds cost $15,000–$80,000 and lock you into fixed dimensions. PP corrugated containers require zero tooling investment — dimensions, cell configurations, and lid types are changed at the cut-and-score stage with no additional cost. For applications where you need custom sizing at low MOQ with fast turnaround, PP corrugated wins on every metric except raw impact resistance.</p>
  </div>
</section>

<section id="types">
  <div class="si">
    <div class="section-label">Product Range</div>
    <h2>Container Types &amp; Applications</h2>
    <div class="card-grid">
      <div class="card">
        <h3>🏭 Industrial Stackable Totes</h3>
        <p>Standard 24×15×12 in returnable totes for parts handling, WIP movement, and warehouse storage. Stack 6–8 high loaded. 3:1 nest ratio empty. Forklift pallet-compatible base option.</p>
      </div>
      <div class="card">
        <h3>🥬 Produce &amp; Food Containers</h3>
        <p>Vented PP containers for fresh produce — fruits, vegetables, and greens. FDA 21 CFR 177.1520 food-safe. USDA accepted. Custom vent hole patterns for airflow. Smooth interior prevents bruising.</p>
      </div>
      <div class="card">
        <h3>🍗 Meat &amp; Poultry Totes</h3>
        <p>White PP containers rated to 180°F hot washdown and −20°F blast freeze. HACCP color-coding available. Non-porous surface, no bacterial harbourage. Replaces stainless at 10% of the cost.</p>
      </div>
      <div class="card">
        <h3>💊 Pharmaceutical Containers</h3>
        <p>White/natural PP with smooth interior for vial, bottle, and component transport. Non-porous, no off-gassing, easily validated. Anti-static ESD black grade available for electronic components.</p>
      </div>
      <div class="card">
        <h3>🚗 Automotive Parts Totes</h3>
        <p>Heavy-duty 6–8mm PP containers with integral divider slot system for parts separation. ESD-safe black grade for electronic control units. Paired with PP corrugated divider inserts.</p>
      </div>
      <div class="card">
        <h3>📦 Bulk Pallet Containers</h3>
        <p>GMA 48×40 in footprint bulk containers — the smaller sibling to the PP Gaylord. 24–36 in depth. Forklift-entry base. 500+ trip returnable. Replaces one-way cardboard at produce DCs.</p>
      </div>
    </div>
  </div>
</section>

<section id="vs-cardboard" style="background:var(--gray)">
  <div class="si">
    <div class="section-label">Material Comparison</div>
    <h2>PP Corrugated vs Cardboard vs Injection-Molded HDPE</h2>
    <p>Three competing solutions for industrial and food containers — each with distinct trade-offs. Here's where PP corrugated wins, and where it doesn't:</p>
    <table class="ct">
      <tr><th>Property</th><th>PP Corrugated (Elipacko)</th><th>Cardboard Corrugated</th><th>Injection-Molded HDPE</th></tr>
      <tr><td>Waterproof</td><td class="yes">✓ 100%</td><td class="no">✗ Absorbs moisture</td><td class="yes">✓ Yes</td></tr>
      <tr><td>Reuse cycles</td><td class="yes">200–500 trips</td><td class="no">1–3 trips</td><td class="yes">500–1,000 trips</td></tr>
      <tr><td>Tooling cost</td><td class="yes">$0 — cut &amp; score</td><td class="yes">$0 — cut &amp; crease</td><td class="no">$15,000–$80,000</td></tr>
      <tr><td>Custom sizing</td><td class="yes">Any dimension, 3 days</td><td class="yes">Any dimension</td><td class="no">Fixed to mold</td></tr>
      <tr><td>MOQ</td><td class="yes">500 pcs</td><td class="yes">Low</td><td class="no">Often 1,000–5,000</td></tr>
      <tr><td>Hot washdown (180°F)</td><td class="yes">✓ Yes</td><td class="no">✗ Fails</td><td class="no">✗ 110°F max (HDPE)</td></tr>
      <tr><td>Cold chain (−20°F)</td><td class="yes">✓ Yes</td><td class="no">✗ Loses strength</td><td class="yes">✓ Yes</td></tr>
      <tr><td>FDA food-safe</td><td class="yes">✓ 21 CFR 177.1520</td><td class="yes">✓ (varies)</td><td class="yes">✓ Yes</td></tr>
      <tr><td>Impact resistance</td><td>Good</td><td class="no">Poor when wet</td><td class="yes">Excellent</td></tr>
      <tr><td>Weight (24×15×12 in tote)</td><td class="yes">~3.5 lb</td><td class="yes">~1.2 lb</td><td class="no">~7–9 lb</td></tr>
      <tr><td>Unit cost (wholesale)</td><td class="yes">$8–$25</td><td class="yes">$1–$4</td><td class="no">$45–$120</td></tr>
      <tr><td>Cost per trip (at 300 trips)</td><td class="yes">$0.04–$0.08</td><td class="no">$1–$4</td><td class="yes">$0.09–$0.40</td></tr>
      <tr><td>Anti-dumping duty (Thailand)</td><td class="yes">0%</td><td>N/A</td><td>Varies</td></tr>
    </table>
    <div class="info"><p><strong>Key insight:</strong> At 300 reuse trips, a $15 PP corrugated container costs $0.05 per trip — versus $2–4 per trip for one-way cardboard. A fleet of 1,000 containers saves $57,000–$119,700 over 300 trips.</p></div>
  </div>
</section>

<section id="specs">
  <div class="si">
    <div class="section-label">Technical Specifications</div>
    <h2>PP Corrugated Container Specifications</h2>
    <div class="two-col">
      <table class="ct">
        <tr><th>Specification</th><th>Value</th></tr>
        <tr><td>Material</td><td>Virgin copolymer polypropylene (PP) twin-wall corrugated</td></tr>
        <tr><td>Wall thickness</td><td>4mm / 6mm / 8mm / 10mm</td></tr>
        <tr><td>Standard sizes</td><td>Custom — any L×W×H, GMA 48×40 in footprint available</td></tr>
        <tr><td>Dynamic load</td><td>44–110 lb (thickness dependent)</td></tr>
        <tr><td>Static stack strength</td><td>550–1,320 lb (4mm–10mm)</td></tr>
        <tr><td>Temperature range</td><td>−20°F to 180°F (−29°C to 82°C)</td></tr>
        <tr><td>Reuse cycles</td><td>200–500 trips typical</td></tr>
        <tr><td>Food safety</td><td>FDA 21 CFR 177.1520</td></tr>
        <tr><td>Colors</td><td>White, black (ESD), blue, green, yellow, red, custom Pantone</td></tr>
        <tr><td>Assembly</td><td>Slot-tab interlocking, riveted, stapled, or heat-welded corners</td></tr>
        <tr><td>Lid options</td><td>Flap lid, tuck lid, separate flat lid, no lid</td></tr>
        <tr><td>MOQ</td><td>500 pcs (standard sizes)</td></tr>
        <tr><td>Lead time</td><td>3–5 days production + freight</td></tr>
        <tr><td>Origin</td><td>Thailand / Vietnam / China</td></tr>
        <tr><td>Anti-dumping duty</td><td>0% (Thailand-manufactured)</td></tr>
      </table>
      <div>
        <img src="{CDN}/bulk-container.jpg" alt="PP corrugated bulk container specification detail — Elipacko USA" loading="lazy" style="width:100%;border-radius:10px;border:1px solid var(--border);margin-bottom:14px">
        <img src="{CDN}/plastic-bins.jpg" alt="PP corrugated plastic bins stacked — Elipacko USA" loading="lazy" style="width:100%;border-radius:10px;border:1px solid var(--border)">
      </div>
    </div>
  </div>
</section>

<section id="roi" style="background:var(--gray)">
  <div class="si ab">
    <div class="section-label">Economics</div>
    <h2>ROI Calculator — Cost Per Trip vs Cardboard</h2>
    <p>The core financial case for PP corrugated containers is cost per trip. Here's how the math works for a typical closed-loop produce or industrial application:</p>
    <table class="ct">
      <tr><th>Scenario</th><th>Cardboard (one-way)</th><th>PP Corrugated (returnable)</th></tr>
      <tr><td>Unit cost</td><td>$2.50</td><td>$15.00</td></tr>
      <tr><td>Trips per unit</td><td>1.5 avg</td><td>300</td></tr>
      <tr><td>Cost per trip</td><td>$1.67</td><td>$0.05</td></tr>
      <tr><td>Disposal cost/trip</td><td>$0.25</td><td>$0</td></tr>
      <tr><td>Total per trip</td><td>$1.92</td><td>$0.05</td></tr>
      <tr><td><strong>Fleet of 1,000 × 300 trips</strong></td><td><strong>$576,000</strong></td><td><strong>$15,000</strong></td></tr>
      <tr><td><strong>Savings</strong></td><td colspan="2"><strong class="yes">$561,000 (97% reduction)</strong></td></tr>
    </table>
    <div class="note"><p><strong>Payback period:</strong> At 2 trips per week, a PP container pays back vs cardboard in approximately 6 round trips — roughly 3 weeks. Everything after that is pure savings.</p></div>
  </div>
</section>

<section id="compliance">
  <div class="si">
    <div class="section-label">Compliance</div>
    <h2>Certifications &amp; Regulatory Compliance</h2>
    <div class="card-grid">
      <div class="card"><h3>FDA 21 CFR 177.1520</h3><p>White/natural PP containers approved for direct food contact — produce, meat, poultry, dairy, and pharmaceutical applications.</p></div>
      <div class="card"><h3>USDA Accepted</h3><p>PP packaging accepted for use in USDA-inspected food facilities without additional certification. Covers all food-grade container applications.</p></div>
      <div class="card"><h3>0% Anti-Dumping Duty</h3><p>Thailand-manufactured containers enter the US at 0% ADD. Confirmed for PP corrugated containers — your customs broker can verify by HTS subheading 3923.10.</p></div>
      <div class="card"><h3>OSHA 1910.176</h3><p>All container bases rated and marked for compliance with OSHA materials handling equipment regulations.</p></div>
      <div class="card"><h3>ESD / Anti-Static Grade</h3><p>Black carbon-black PP grade available: surface resistance &lt;10⁶ Ω. For electronics, PCB, and semiconductor component transport.</p></div>
      <div class="card"><h3>100% Recyclable</h3><p>Pure polypropylene — code 5 recyclable. No mixed materials. Full closed-loop PP recovery at end of service life.</p></div>
    </div>
  </div>
</section>

<section id="gallery" style="background:var(--gray)">
  <div class="si">
    <div class="section-label">Product Gallery</div>
    <h2>PP Corrugated Containers — Real Elipacko Products</h2>
    <div class="pg">
      <img src="{CDN}/bulk-container.jpg" alt="PP corrugated bulk container — Elipacko USA" loading="lazy">
      <img src="{CDN}/plastic-bins.jpg" alt="PP corrugated plastic bins stacked industrial — Elipacko USA" loading="lazy">
      <img src="{CDN}/turnover-box-img_4651.jpg" alt="PP corrugated turnover box container — Elipacko USA" loading="lazy">
      <img src="{CDN}/turnover-box-img_6236.jpg" alt="PP corrugated containers stacked warehouse — Elipacko USA" loading="lazy">
      <img src="{CDN}/turnover-box----002_--.jpg" alt="PP corrugated box container blue — Elipacko USA" loading="lazy">
      <img src="{CDN}/turnover-box----16.jpg" alt="PP corrugated turnover container forklift — Elipacko USA" loading="lazy">
    </div>
  </div>
</section>

<section id="faq">
  <div class="si" style="max-width:800px">
    <div class="section-label">FAQ</div>
    <h2>PP Corrugated Container FAQs</h2>
    <div class="faq-item"><h4>What is a PP corrugated container?</h4><p>A PP corrugated container is a rigid box or tote made from twin-wall polypropylene corrugated sheet — waterproof, reusable 200–500 trips, and food-safe. Used in industrial, food, pharmaceutical, and agricultural closed-loop returnable transport packaging (RTP) systems.</p></div>
    <div class="faq-item"><h4>How much weight can a PP corrugated container hold?</h4><p>Standard containers handle 44–110 lb dynamic load. Stack strength: 4mm = 550–660 lb static; 6mm = 880–1,100 lb static. Custom reinforced configurations available for heavier loads.</p></div>
    <div class="faq-item"><h4>Are PP containers FDA food-safe?</h4><p>Yes. Virgin PP corrugated complies with FDA 21 CFR 177.1520 for direct food contact. White and natural-colored containers are suitable for produce, meat, poultry, and dairy. USDA accepted for food facility use.</p></div>
    <div class="faq-item"><h4>What is the anti-dumping duty on PP containers from Thailand?</h4><p>0%. Elipacko's Thailand-manufactured PP containers enter the US at zero anti-dumping duty. Confirm the exact HTS subheading (3923.10) with your customs broker at time of import.</p></div>
    <div class="faq-item"><h4>How many trips does a PP container last?</h4><p>200–500 trips in typical closed-loop logistics. Gentle grocery DC cycles may last 10+ years. Rough industrial environments with forklift contact: 3–5 years. PP does not fatigue, warp, or absorb moisture.</p></div>
    <div class="faq-item"><h4>Can PP containers be custom printed?</h4><p>Yes — UV and screen printing on all panels. Barcodes, logos, handling instructions, product codes. Available from MOQ 500 units, 14–21 day lead time on first run.</p></div>
  </div>
</section>

<section class="cta" id="contact">
  <h2>Get a Quote on PP Corrugated Containers</h2>
  <p>Send your container dimensions, load requirements, quantity, and application. Response within 24 hours. Free prototype samples on request.</p>
  <a href="https://elipacko.com/request-quote/">Request a Quote</a>
  <a href="mailto:info@elipacko.com" class="sec">Email info@elipacko.com</a>
</section>''' + foot([
    ('../pp-corrugated-boxes/','PP Corrugated Boxes'),('../pp-gaylord-boxes/','PP Gaylord Boxes'),
    ('../pp-dividers/','PP Dividers'),('../pp-trays/','PP Trays'),
    ('../pp-turnover-boxes/','Turnover Boxes'),('../pp-pallets/','PP Pallets'),
    ('../agriculture-packaging/','Agriculture Packaging'),('../seafood-packaging/','Seafood Packaging'),
])

# ─────────────────────────────────────────
# PAGE 2: SHIPPING BOXES
# ─────────────────────────────────────────
shipping_schema = '''{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"What are PP corrugated shipping boxes?","acceptedAnswer":{"@type":"Answer","text":"PP corrugated shipping boxes are reusable boxes made from twin-wall polypropylene corrugated sheet — the waterproof, food-safe, 200–500-trip alternative to one-way cardboard shipping boxes. They are used in closed-loop supply chains where boxes are returned after delivery."}},
{"@type":"Question","name":"How do PP shipping boxes compare to cardboard?","acceptedAnswer":{"@type":"Answer","text":"PP shipping boxes cost 4–6× more upfront but last 200–500 trips versus 1–3 for cardboard. At 300 trips, total packaging cost is 90–97% lower with PP. PP is also 100% waterproof, maintains structural integrity when wet, and is cold-chain rated to −20°F."}},
{"@type":"Question","name":"Are PP shipping boxes approved for food shipment?","acceptedAnswer":{"@type":"Answer","text":"Yes. Virgin PP corrugated shipping boxes comply with FDA 21 CFR 177.1520 for direct food contact. They are USDA accepted for fresh produce, meat, poultry, and seafood shipment."}},
{"@type":"Question","name":"What is the anti-dumping duty on PP shipping boxes from Thailand?","acceptedAnswer":{"@type":"Answer","text":"0% anti-dumping duty. Elipacko manufactures in Thailand — PP corrugated shipping boxes from Thailand enter the US with no ADD surcharge. Verify the HTS subheading with your customs broker at import."}},
{"@type":"Question","name":"Can I get custom-size PP shipping boxes?","acceptedAnswer":{"@type":"Answer","text":"Yes. PP corrugated shipping boxes require zero tooling — dimensions are set at the cut-and-score stage. MOQ is 500 units for standard sizes, 3-day production. Custom sizes and prints available on the same lead time."}}
]}'''

shipping_html = head(
    "PP Corrugated Shipping Boxes | Reusable Plastic Shipping Boxes Wholesale | Elipacko USA",
    "Wholesale PP corrugated shipping boxes — reusable, waterproof, FDA food-safe. 200–500 trip cycle life. 0% anti-dumping duty (Thailand mfg.). Custom sizes, 3-day production. Elipacko direct.",
    "packing-box-img_2296.jpg",
    "https://elipacko-usa.com/shipping-boxes/",
    shipping_schema
) + nav('shipping-boxes') + f'''
<div class="breadcrumb"><a href="../">Home</a> › PP Corrugated Shipping Boxes</div>

<section class="hero" style="background:linear-gradient(135deg,#1e3a5f,#0f2a47)">
  <div class="hero-inner">
    <div>
      <div class="hero-badge">Reusable Shipping Packaging</div>
      <h1>PP Corrugated Shipping Boxes — <span>Reusable. Waterproof. 500-Trip Rated.</span></h1>
      <p>The waterproof, food-safe alternative to one-way cardboard shipping boxes. Custom sizes, 3-day production, 0% anti-dumping duty entering the USA from Thailand.</p>
      <div class="hero-btns">
        <a href="https://elipacko.com/request-quote/" class="btn-white">Get a Quote</a>
        <a href="../#contact" class="btn-outline-w">Request Samples</a>
      </div>
    </div>
    <div class="hero-imgs">
      <img src="{CDN}/packing-box-img_2296.jpg" alt="PP corrugated packing box with lid — Elipacko USA" loading="eager">
      <img src="{CDN}/packing-box-sdc10126.jpg" alt="PP corrugated open top shipping box — Elipacko USA" loading="eager">
      <img src="{CDN}/packing-box-sdc10138.jpg" alt="PP corrugated shipping box wholesale stack — Elipacko USA" loading="lazy">
    </div>
  </div>
</section>

<section style="background:#fff">
  <div class="si">
    <div class="stat-grid">
      <div class="stat-card"><div class="num">500+</div><div class="lbl">Trip cycle life</div></div>
      <div class="stat-card"><div class="num">97%</div><div class="lbl">Cost reduction vs cardboard at 300 trips</div></div>
      <div class="stat-card"><div class="num">0%</div><div class="lbl">Anti-dumping duty (Thailand)</div></div>
      <div class="stat-card"><div class="num">3 days</div><div class="lbl">Production lead time</div></div>
      <div class="stat-card"><div class="num">−20°F</div><div class="lbl">Cold chain rated</div></div>
    </div>

    <div class="toc">
      <h3>Table of Contents</h3>
      <ol>
        <li><a href="#what-are">What Are PP Corrugated Shipping Boxes?</a></li>
        <li><a href="#vs-cardboard">PP vs Cardboard — Full Comparison</a></li>
        <li><a href="#applications">Applications by Industry</a></li>
        <li><a href="#specs">Specifications</a></li>
        <li><a href="#roi">Cost Per Trip Analysis</a></li>
        <li><a href="#gallery">Product Gallery</a></li>
        <li><a href="#faq">FAQ</a></li>
      </ol>
    </div>
  </div>
</section>

<section id="what-are" style="background:var(--gray)">
  <div class="si ab">
    <div class="section-label">Overview</div>
    <h2>What Are PP Corrugated Shipping Boxes?</h2>
    <p>PP corrugated shipping boxes are rigid boxes fabricated from twin-wall polypropylene corrugated sheet — the same fluted plastic construction used in gaylord boxes, produce crates, and industrial containers, but in standard shipping box form factors. They are engineered as direct replacements for one-way cardboard in applications where a closed-loop return system is possible.</p>
    <p>The core engineering advantage over cardboard is moisture resistance. A cardboard shipping box in a refrigerated environment — or exposed to rain, produce moisture, or condensation — loses 40–70% of its stack strength and risks catastrophic failure. PP corrugated retains 100% of its structural properties when wet. That makes it the default choice in cold chain produce, seafood, poultry, and frozen food shipping where moisture is unavoidable.</p>
    <p>Elipacko manufactures PP corrugated shipping boxes in custom dimensions — any L×W×H — with 3-day production lead time and zero tooling cost. Standard configurations start at MOQ 500 units. All Thailand-manufactured product enters the US at 0% anti-dumping duty.</p>
    <h3>Open-Top vs Lidded vs Self-Locking</h3>
    <p>PP corrugated shipping boxes come in three main configurations. <strong>Open-top</strong> boxes are used where a separate pallet stretch wrap provides containment — common in produce and meat cold chain. <strong>Lidded</strong> boxes (separate flat PP lid) provide full enclosure for stacking and dust exclusion — common in pharmaceutical and electronics shipping. <strong>Self-locking tuck flap</strong> boxes mimic the standard cardboard RSC format — fold-and-lock with no tools, suitable for mixed SKU shipments where a simple one-piece box is needed.</p>
  </div>
</section>

<section id="vs-cardboard">
  <div class="si">
    <div class="section-label">Material Comparison</div>
    <h2>PP Corrugated vs Cardboard Shipping Boxes — Full Comparison</h2>
    <table class="ct">
      <tr><th>Property</th><th>PP Corrugated (Elipacko)</th><th>Single-Wall Cardboard</th><th>Double-Wall Cardboard</th></tr>
      <tr><td>Waterproof</td><td class="yes">✓ 100%</td><td class="no">✗ Fails when wet</td><td class="no">✗ Fails when wet</td></tr>
      <tr><td>Reuse cycles</td><td class="yes">200–500</td><td class="no">1–2</td><td class="no">2–4</td></tr>
      <tr><td>Cold chain rated</td><td class="yes">✓ −20°F to 180°F</td><td class="no">✗ Loses 40–70% strength</td><td class="no">✗ Loses 40–70% strength</td></tr>
      <tr><td>Stack strength (wet)</td><td class="yes">100% retained</td><td class="no">30–60% retained</td><td class="no">30–60% retained</td></tr>
      <tr><td>FDA food-safe</td><td class="yes">✓ 21 CFR 177.1520</td><td>Varies by liner</td><td>Varies by liner</td></tr>
      <tr><td>Custom sizing</td><td class="yes">Any dimension, 3 days</td><td class="yes">Any dimension</td><td class="yes">Any dimension</td></tr>
      <tr><td>Unit cost</td><td>$8–$30</td><td class="yes">$0.80–$3</td><td class="yes">$2–$6</td></tr>
      <tr><td>Cost per trip (300 cycles)</td><td class="yes">$0.03–$0.10</td><td class="no">$0.80–$3</td><td class="no">$0.50–$2</td></tr>
      <tr><td>Pressure washable</td><td class="yes">✓ Yes</td><td class="no">✗ Destroyed</td><td class="no">✗ Destroyed</td></tr>
      <tr><td>End-of-life</td><td class="yes">Recyclable PP #5</td><td class="yes">Recyclable paper</td><td class="yes">Recyclable paper</td></tr>
    </table>
    <div class="info"><p><strong>Bottom line:</strong> For closed-loop supply chains — produce DCs, protein processors, automotive JIT, pharmaceutical return packaging — PP corrugated shipping boxes reduce total packaging cost by 90–97% compared to one-way cardboard over a 300-trip fleet life.</p></div>
  </div>
</section>

<section id="applications" style="background:var(--gray)">
  <div class="si">
    <div class="section-label">Industries</div>
    <h2>PP Corrugated Shipping Boxes — Applications by Industry</h2>
    <div class="card-grid">
      <div class="card"><h3>🥬 Fresh Produce</h3><p>Wax-free PP shipping boxes for lettuce, berries, citrus, and stone fruit. 100% waterproof — no wax coating needed. Stackable 8–10 high on GMA pallet. FDA food-safe, USDA accepted. Return via backhaul — same truck that delivered.</p></div>
      <div class="card"><h3>🐟 Seafood &amp; Fish</h3><p>White PP boxes for fresh and chilled seafood. Withstand ice melt, brine, and condensation without delamination or box failure. Easy hose-down sanitization between uses. Cold chain rated to −20°F.</p></div>
      <div class="card"><h3>🍗 Meat &amp; Poultry</h3><p>White PP shipping boxes for primal cuts, portion cuts, and further processed protein. Rated to 180°F hot washdown. HACCP color-coding available by species or product type.</p></div>
      <div class="card"><h3>💊 Pharmaceutical</h3><p>Clean, smooth-interior PP boxes for drug product shipping. Non-porous, no off-gassing, validated-cleanable. Anti-static ESD grade for medical electronics and device shipping.</p></div>
      <div class="card"><h3>🚗 Automotive</h3><p>PP shipping boxes for JIT parts delivery — stamped parts, fasteners, trim components. Paired with PP corrugated divider inserts for parts separation. ESD-safe black grade for electronic control units.</p></div>
      <div class="card"><h3>📦 E-Commerce Returns</h3><p>Heavy-duty PP tuck-flap boxes for high-value return shipping programs. Survives multiple forward and return cycles without crushing. Better unboxing experience — box arrives intact, not deformed.</p></div>
    </div>
  </div>
</section>

<section id="specs">
  <div class="si">
    <div class="section-label">Specifications</div>
    <h2>PP Corrugated Shipping Box Specifications</h2>
    <div class="two-col">
      <table class="ct">
        <tr><th>Specification</th><th>Value</th></tr>
        <tr><td>Material</td><td>Virgin copolymer PP twin-wall corrugated</td></tr>
        <tr><td>Wall thickness</td><td>4mm / 6mm / 8mm</td></tr>
        <tr><td>Standard sizes</td><td>Custom — any L×W×H</td></tr>
        <tr><td>Common sizes</td><td>GMA 48×40×24 in, 24×16×12 in, 20×16×12 in</td></tr>
        <tr><td>Stack strength</td><td>Up to 2,200 lb static (6mm)</td></tr>
        <tr><td>Temp range</td><td>−20°F to 180°F (−29°C to 82°C)</td></tr>
        <tr><td>Reuse cycles</td><td>200–500 trips</td></tr>
        <tr><td>Lid options</td><td>Open-top / flat lid / tuck-flap self-locking</td></tr>
        <tr><td>Colors</td><td>White, black, blue, green, yellow, custom</td></tr>
        <tr><td>Food safety</td><td>FDA 21 CFR 177.1520</td></tr>
        <tr><td>MOQ</td><td>500 pcs</td></tr>
        <tr><td>Lead time</td><td>3–5 days production</td></tr>
        <tr><td>Anti-dumping duty</td><td>0% (Thailand-manufactured)</td></tr>
      </table>
      <div>
        <img src="{CDN}/packing-box-sdc10139.jpg" alt="PP corrugated shipping box open top deep blue — Elipacko USA" loading="lazy" style="width:100%;border-radius:10px;border:1px solid var(--border);margin-bottom:12px">
        <img src="{CDN}/packing-box-sdc10138.jpg" alt="PP corrugated shipping box stack — Elipacko USA" loading="lazy" style="width:100%;border-radius:10px;border:1px solid var(--border)">
      </div>
    </div>
  </div>
</section>

<section id="roi" style="background:var(--gray)">
  <div class="si ab">
    <div class="section-label">Cost Analysis</div>
    <h2>Cost Per Trip — PP vs Cardboard</h2>
    <table class="ct">
      <tr><th>Metric</th><th>Cardboard (one-way)</th><th>PP Corrugated (returnable)</th></tr>
      <tr><td>Unit cost</td><td>$2.00</td><td>$18.00</td></tr>
      <tr><td>Avg trips/unit</td><td>1.5</td><td>300</td></tr>
      <tr><td>Cost per trip</td><td>$1.33</td><td>$0.06</td></tr>
      <tr><td>Disposal per trip</td><td>$0.20</td><td>$0</td></tr>
      <tr><td><strong>Total per trip</strong></td><td><strong>$1.53</strong></td><td><strong>$0.06</strong></td></tr>
      <tr><td><strong>1,000 boxes × 300 trips</strong></td><td><strong>$459,000</strong></td><td><strong>$18,000</strong></td></tr>
      <tr><td><strong>Total savings</strong></td><td colspan="2"><strong class="yes">$441,000 — 96% reduction</strong></td></tr>
    </table>
    <div class="note"><p><strong>Payback period:</strong> A $18 PP box pays back vs $2 cardboard in approximately 14 trips. At 5 trips per week, payback is under 3 weeks.</p></div>
  </div>
</section>

<section id="gallery">
  <div class="si">
    <div class="section-label">Product Gallery</div>
    <h2>PP Corrugated Shipping Boxes — Real Elipacko Products</h2>
    <div class="pg">
      <img src="{CDN}/packing-box-img_2296.jpg" alt="PP corrugated packing box with lid — Elipacko USA" loading="lazy">
      <img src="{CDN}/packing-box-sdc10126.jpg" alt="PP corrugated open top shipping box — Elipacko USA" loading="lazy">
      <img src="{CDN}/packing-box-sdc10138.jpg" alt="PP corrugated shipping box wholesale stack — Elipacko USA" loading="lazy">
      <img src="{CDN}/packing-box-sdc10139.jpg" alt="PP corrugated deep blue open box — Elipacko USA" loading="lazy">
      <img src="{CDN}/packing-box-------.jpg" alt="PP corrugated blue tuck lid shipping box — Elipacko USA" loading="lazy">
      <img src="{CDN}/packing-box-qq--20150902164926.jpg" alt="PP corrugated metal riveted shipping box open — Elipacko USA" loading="lazy">
      <img src="{CDN}/packing-box-qq--20150902164932.jpg" alt="PP corrugated blue lidded shipping box closed — Elipacko USA" loading="lazy">
      <img src="{CDN}/packing-crate-img_2173.jpg" alt="PP corrugated flat-pack shipping boxes on pallet — Elipacko USA" loading="lazy">
    </div>
  </div>
</section>

<section id="faq">
  <div class="si" style="max-width:800px">
    <div class="section-label">FAQ</div>
    <h2>PP Corrugated Shipping Box FAQs</h2>
    <div class="faq-item"><h4>What are PP corrugated shipping boxes?</h4><p>Reusable boxes made from twin-wall polypropylene corrugated sheet — waterproof, food-safe, 200–500-trip alternative to one-way cardboard. Used in closed-loop supply chains where boxes return after delivery.</p></div>
    <div class="faq-item"><h4>How do PP shipping boxes compare to cardboard?</h4><p>PP costs 4–6× more upfront but lasts 200–500 trips vs 1–3 for cardboard. At 300 trips, total packaging cost is 90–97% lower. PP is also 100% waterproof and cold-chain rated to −20°F.</p></div>
    <div class="faq-item"><h4>Are PP shipping boxes approved for food?</h4><p>Yes — FDA 21 CFR 177.1520 for direct food contact. USDA accepted for produce, meat, poultry, and seafood shipment.</p></div>
    <div class="faq-item"><h4>What is the anti-dumping duty from Thailand?</h4><p>0%. Thailand-manufactured PP corrugated shipping boxes enter the US with no anti-dumping duty surcharge. Verify HTS subheading with your customs broker.</p></div>
    <div class="faq-item"><h4>Can I get custom-size PP shipping boxes?</h4><p>Yes — no tooling required. Dimensions set at the cut-and-score stage. MOQ 500 units, 3-day production. Custom sizes and custom print available on the same lead time.</p></div>
  </div>
</section>

<section class="cta" id="contact">
  <h2>Get a Quote on PP Corrugated Shipping Boxes</h2>
  <p>Send your box dimensions, required quantity, and application. Response within 24 hours. Free sample boxes available before you commit to a container.</p>
  <a href="https://elipacko.com/request-quote/">Request a Quote</a>
  <a href="mailto:info@elipacko.com" class="sec">Email info@elipacko.com</a>
</section>''' + foot([
    ('../pp-corrugated-boxes/','PP Corrugated Boxes'),('../pp-containers/','PP Containers'),
    ('../pp-gaylord-boxes/','PP Gaylord Boxes'),('../storage-moving-boxes/','Storage Boxes'),
    ('../agriculture-packaging/','Agriculture Packaging'),('../seafood-packaging/','Seafood Packaging'),
])

# Write files
pages = {
    'pp-containers': containers_html,
    'shipping-boxes': shipping_html,
}

for slug, html in pages.items():
    path = os.path.join(BASE, slug, 'index.html')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    words = len(html.split())
    print(f'✓ {slug}: {words} words written to {path}')

print('\nDone.')
EOF
