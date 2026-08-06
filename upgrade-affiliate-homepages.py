#!/usr/bin/env python3
"""
Upgrade affiliate homepages to 1500+ word deep content pages.
Same wranglerspecs-level treatment: ToC, comparison tables, real depth, FAQ schema, internal links.
"""
import os, json
from datetime import date

CDN = "https://brazenproducts.github.io/elipacko-assets"
BASE = "/home/ubuntu/.openclaw/workspace/elipacko-sites"

def faq_schema(faqs):
    return json.dumps({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in faqs]})

CSS = """*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;color:#1a2332;line-height:1.65;background:#fff}a{text-decoration:none}:root{--border:#e2e8f0;--gray:#f7f9fc;--muted:#6b7a8d}nav{background:VAR_COLOR;padding:14px 5%;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;position:sticky;top:0;z-index:100}.nav-brand{color:#fff;font-weight:800;font-size:1.1rem}.nav-links a{color:rgba(255,255,255,.85);margin-left:18px;font-size:.88rem;font-weight:500}.nav-cta{background:#fff;color:VAR_COLOR!important;padding:7px 16px;border-radius:6px;font-weight:700;font-size:.85rem}.hero{background:linear-gradient(135deg,VAR_COLOR,VAR_COLOR2);color:#fff;padding:56px 5%}.hero-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}.hero h1{font-size:clamp(1.7rem,3.5vw,2.6rem);font-weight:800;line-height:1.18;margin-bottom:14px}.hero p{color:rgba(255,255,255,.88);font-size:1rem;margin-bottom:24px}.hero-btns{display:flex;gap:12px;flex-wrap:wrap}.btn-p{background:#fff;color:VAR_COLOR;padding:12px 24px;border-radius:6px;font-weight:700;font-size:.92rem;display:inline-block}.btn-s{border:2px solid rgba(255,255,255,.6);color:#fff;padding:12px 24px;border-radius:6px;font-weight:600;font-size:.92rem;display:inline-block}.hero-gallery{display:grid;grid-template-columns:1fr 1fr;gap:8px}.hero-gallery img{width:100%;border-radius:8px;object-fit:cover}.hero-gallery img:first-child{grid-column:1/-1;aspect-ratio:16/9}.hero-gallery img:not(:first-child){aspect-ratio:4/3}.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin:28px 0}.stat-card{background:var(--gray);border-radius:10px;padding:18px;text-align:center}.stat-card .num{font-size:1.6rem;font-weight:800;color:VAR_COLOR2;margin-bottom:4px}.stat-card .lbl{font-size:.78rem;color:var(--muted)}.toc{background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:18px 22px;margin:28px 0}.toc h3{font-size:.85rem;font-weight:700;text-transform:uppercase;color:#0369a1;margin-bottom:10px}.toc ol{padding-left:18px}.toc li{margin-bottom:5px}.toc a{color:#0369a1;font-size:.88rem;font-weight:500}section{padding:52px 5%}.si{max-width:1100px;margin:0 auto}.ab{max-width:760px}.lbl{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:VAR_COLOR2;margin-bottom:6px}h2{font-size:clamp(1.35rem,2.5vw,1.9rem);font-weight:800;color:#0a2540;margin-bottom:12px;scroll-margin-top:76px}h3{font-size:1.02rem;font-weight:700;color:#0a2540;margin:22px 0 9px;scroll-margin-top:76px}p{color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:13px}ul,ol{padding-left:20px;color:#374151;font-size:.96rem;line-height:1.88;margin-bottom:13px}li{margin-bottom:3px}strong{color:#1a2332}.ct{width:100%;border-collapse:collapse;font-size:.87rem;margin:18px 0}.ct th{background:#0a2540;color:#fff;padding:10px 13px;text-align:left;font-weight:600}.ct td{padding:9px 13px;border-bottom:1px solid var(--border)}.ct tr:nth-child(even) td{background:var(--gray)}.yes{color:#16a34a;font-weight:700}.no{color:#dc2626;font-weight:700}.maybe{color:#d97706;font-weight:600}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:start}.pg{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:16px 0}.pg img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;border:1px solid var(--border)}.faq-item{border-bottom:1px solid var(--border);padding:16px 0}.faq-item h4{font-size:.95rem;font-weight:700;color:#0a2540;margin-bottom:7px}.faq-item p{color:var(--muted);font-size:.9rem;margin:0}.note{background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px 18px;margin:18px 0}.note p{margin:0;font-size:.9rem;color:#9a3412}.info{background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px 18px;margin:18px 0}.info p{margin:0;font-size:.9rem;color:#0c4a6e}.rg{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:11px;margin-top:14px}.rc{background:#fff;border:1px solid var(--border);border-radius:8px;padding:13px 16px}.rc a{color:VAR_COLOR2;font-weight:600;font-size:.88rem}.rc p{font-size:.8rem;color:var(--muted);margin:3px 0 0}.cta{background:VAR_COLOR;padding:52px 5%;text-align:center;color:#fff}.cta h2{color:#fff;font-size:clamp(1.3rem,2.2vw,1.8rem);margin-bottom:9px}.cta p{color:rgba(255,255,255,.88);margin-bottom:20px}.cta a{background:#fff;color:VAR_COLOR;padding:13px 30px;border-radius:6px;font-weight:700;display:inline-block}footer{background:#0a2540;color:rgba(255,255,255,.6);padding:26px 5%;font-size:.81rem;text-align:center}footer a{color:rgba(255,255,255,.5)}@media(max-width:768px){.hero-inner{grid-template-columns:1fr}.two-col{grid-template-columns:1fr}.pg{grid-template-columns:1fr 1fr}}@media(max-width:480px){.hero{padding:34px 4%}.pg{grid-template-columns:1fr}}"""

def build(domain, color, color2, kw, kw_title, tagline, hero_desc, elipacko_page, photos, stats, toc_items, sections_html, faqs, related_links, affiliate_links=""):
    css = CSS.replace("VAR_COLOR", color).replace("VAR_COLOR2", color2)
    
    gallery = ""
    for i,(url,alt) in enumerate(photos[:4]):
        gallery += f'<img src="{url}" alt="{alt}" loading="{"eager" if i<2 else "lazy"}">\n'
    
    stat_cards = "".join(f'<div class="stat-card"><div class="num">{n}</div><div class="lbl">{l}</div></div>' for n,l in stats)
    toc_html = "".join(f'<li><a href="#{s}">{t}</a></li>' for s,t in toc_items)
    faq_items = "".join(f'<div class="faq-item"><h4>{q}</h4><p>{a}</p></div>' for q,a in faqs)
    related = "".join(f'<div class="rc"><a href="/{s}/">{t}</a><p>{d}</p></div>' for s,t,d in related_links)
    
    return f"""<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{kw_title} — {tagline} | {domain}</title>
<meta name="description" content="{hero_desc[:155]}">
<link rel="canonical" href="https://{domain}/">
<meta property="og:title" content="{kw_title} — {tagline}">
<meta property="og:description" content="{hero_desc[:155]}">
<meta property="og:image" content="{photos[0][0]}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://{domain}/">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{faq_schema(faqs)}</script>
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"WebSite","name":"{domain}","url":"https://{domain}/"}}</script>
<style>{css}</style>
</head>
<body>
<nav>
  <span class="nav-brand">{domain}</span>
  <div class="nav-links">
    <a href="/">Home</a><a href="/faq/">FAQ</a>
    <a href="https://elipacko.com{elipacko_page}" target="_blank" rel="noopener" class="nav-cta">Get a Quote</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-inner">
    <div>
      <div class="lbl" style="color:rgba(255,255,255,.75);margin-bottom:8px">Sourcing Resource</div>
      <h1>{kw_title} —<br>{tagline}</h1>
      <p>{hero_desc}</p>
      <div class="hero-btns">
        <a href="https://elipacko.com{elipacko_page}" class="btn-p" target="_blank" rel="noopener">Get a Quote from Elipacko</a>
        <a href="/faq/" class="btn-s">FAQ &amp; Specs</a>
      </div>
    </div>
    <div class="hero-gallery">{gallery}</div>
  </div>
</section>

<section style="background:#fff">
  <div class="si">
    <div class="stat-grid">{stat_cards}</div>
    <div class="toc"><h3>On This Page</h3><ol>{toc_html}</ol></div>
  </div>
</section>

{sections_html}

<section style="background:var(--gray)" id="faq">
  <div class="si">
    <div class="lbl">FAQ</div>
    <h2>Frequently Asked Questions</h2>
    {faq_items}
  </div>
</section>

<section style="background:#fff" id="related">
  <div class="si">
    <div class="lbl">Related Pages</div>
    <h2>More About {kw_title}</h2>
    <div class="rg">{related}</div>
    {"<p style='margin-top:12px;font-size:.88rem;color:#374151'>Also see: " + affiliate_links + "</p>" if affiliate_links else ""}
  </div>
</section>

<div class="cta">
  <h2>Get {kw_title} Wholesale Pricing</h2>
  <p>Manufacturer direct from Elipacko — Asia's largest PP factory. 0% anti-dumping duty entering the USA.</p>
  <a href="https://elipacko.com{elipacko_page}" target="_blank" rel="noopener">Request a Quote from Elipacko →</a>
</div>

<footer>
  <p>&copy; 2026 {domain} &mdash; Sourcing resource for <a href="https://elipacko.com{elipacko_page}" rel="noopener">Elipacko.com</a> | <a href="/">Home</a> | <a href="/faq/">FAQ</a> | <a href="/sitemap.xml">Sitemap</a></p>
</footer>
</body></html>"""

# ── MEAT LUGS ─────────────────────────────────────────────────────────────────
meatlugs_sections = f"""
<section style="background:var(--gray)" id="what-are">
  <div class="si ab">
    <div class="lbl">Fundamentals</div>
    <h2>What Are Meat Lugs?</h2>
    <p>Meat lugs — also called meat tubs, processing tubs, or offal bins — are rigid rectangular plastic containers used throughout the meat processing chain. They collect trim on the deboning line, hold offal under the evisceration line, carry bone to rendering, and move product through blast chillers and cold storage. Every commercial abattoir and meat processing plant runs on them.</p>
    <p>The term "lug" comes from the handles (lugs) on early steel designs. Today the design has evolved into stackable, nestable PP containers that a single operative can carry when empty and move with a pallet jack when full. The geometry, wall thickness, and polymer specification are all chosen for wet, chilled, and heavily loaded environments.</p>
    <h3>PP vs HDPE vs Stainless — Which to Choose</h3>
    <table class="ct">
      <tr><th>Material</th><th>Hot Washdown (180°F)</th><th>Blast Freeze (−20°F)</th><th>Weight</th><th>Cost</th></tr>
      <tr><td><strong>PP Copolymer</strong></td><td class="yes">Yes ✓</td><td class="yes">Yes ✓</td><td class="yes">Lightest ✓</td><td class="yes">Low ✓</td></tr>
      <tr><td>HDPE</td><td class="no">110°F max ✗</td><td class="yes">Yes ✓</td><td class="yes">Light ✓</td><td class="yes">Low ✓</td></tr>
      <tr><td>Stainless Steel</td><td class="yes">Yes ✓</td><td class="yes">Yes ✓</td><td class="no">5–8× heavier ✗</td><td class="no">High ✗</td></tr>
    </table>
    <p>PP copolymer covers the widest thermal range at the lowest weight and cost. HDPE fails at hot-washdown temperatures standard in USDA facilities. Stainless is the right call for fixed tanks and large vessels, not mobile lugs that operatives handle dozens of times per shift.</p>
  </div>
</section>

<section style="background:#fff" id="haccp">
  <div class="si">
    <div class="lbl">Food Safety</div>
    <h2>HACCP Color-Coding — Why It Matters</h2>
    <div class="two-col">
      <div>
        <p>Color-coded PP meat lugs are one of the most effective and auditable cross-contamination controls in a processing facility. When every container is visually identified by protein type and processing zone, contamination events are prevented before they happen — not caught in lab testing after the fact.</p>
        <table class="ct">
          <tr><th>Color</th><th>Protein Zone</th></tr>
          <tr><td><strong style="color:#dc2626">Red</strong></td><td>Raw red meat (beef, pork, lamb)</td></tr>
          <tr><td><strong style="color:#d97706">Yellow</strong></td><td>Raw poultry</td></tr>
          <tr><td><strong style="color:#2563eb">Blue</strong></td><td>Fish and seafood</td></tr>
          <tr><td><strong>White</strong></td><td>Cooked / ready-to-eat</td></tr>
          <tr><td><strong style="color:#16a34a">Green</strong></td><td>Produce, by-products</td></tr>
        </table>
        <p>Elipacko's food-grade PP pigments are stable under repeated QAC, PAA, and chlorinated washdown cycles. The color stays consistent through the full service life of the lug — critical for HACCP audit compliance.</p>
      </div>
      <div>
        <div class="pg" style="grid-template-columns:1fr">
          <img src="{CDN}/meat-lug-white-empty.jpg" alt="White PP meat lug tray empty HACCP — meatlugs.com" loading="lazy" style="aspect-ratio:4/3">
          <img src="{CDN}/meat-lug-5color-set.jpg" alt="PP meat lugs 5-color HACCP set — meatlugs.com" loading="lazy" style="aspect-ratio:4/3">
          <img src="{CDN}/meat-lug-filled-meat.jpg" alt="PP meat lug in use filled with raw meat — meatlugs.com" loading="lazy" style="aspect-ratio:4/3">
        </div>
      </div>
    </div>
  </div>
</section>

<section style="background:var(--gray)" id="sizes">
  <div class="si ab">
    <div class="lbl">Size Guide</div>
    <h2>Meat Lug Sizes — Which to Choose</h2>
    <table class="ct">
      <tr><th>Size</th><th>Typical Load</th><th>Primary Application</th><th>Movement Method</th></tr>
      <tr><td><strong>8-gallon</strong></td><td>60–80 lbs</td><td>Retail trim, variety meats</td><td>Hand carry</td></tr>
      <tr><td><strong>15-gallon</strong></td><td>120–160 lbs</td><td>Deboning trim, grinding room</td><td>Hand carry / 2-person</td></tr>
      <tr><td><strong>30-gallon</strong></td><td>200–280 lbs</td><td>Line trim, large-batch grinding</td><td>Pallet jack</td></tr>
      <tr><td><strong>55-gallon</strong></td><td>300–450 lbs</td><td>Offal, fat, bone, high-volume</td><td>Forklift</td></tr>
    </table>
    <p>All sizes are available with optional drain plug (standard on 30-gal and 55-gal) and in the full 5-color HACCP range. Custom sizes are available on container-load orders.</p>
    <div class="info"><p><strong>Nesting ratio:</strong> All Elipacko meat lugs nest 3:1 empty — three clean lugs take the footprint of one loaded lug. For a 500-lug operation, this cuts empty storage and return transport space by 66%.</p></div>
  </div>
</section>

<section style="background:#fff" id="source">
  <div class="si ab">
    <div class="lbl">Where to Buy</div>
    <h2>Where to Source PP Meat Lugs</h2>
    <p><a href="https://elipacko.com/pp-meat-lugs/" rel="noopener" style="color:#b91c1c">Elipacko</a> is Asia's largest PP corrugated manufacturer and the source for the PP meat lugs featured on this site. Direct factory ordering means no distributor markup, full custom specification capability, and 3-day production of a 40HQ container load.</p>
    <h3>What to Include in Your Quote Request</h3>
    <ul>
      <li>Lug size (8, 15, 30, or 55 gallon)</li>
      <li>Quantity (one 40HQ container MOQ)</li>
      <li>Color (standard or custom Pantone)</li>
      <li>Drain plug (yes/no)</li>
      <li>Destination port</li>
      <li>Any compliance documentation requirements (FDA 21 CFR, HACCP, third-party audit)</li>
    </ul>
    <div class="info"><p><strong>Anti-dumping duty:</strong> PP corrugated products are not subject to US anti-dumping duty. 0% ADD applies. Confirm HTS code with your customs broker.</p></div>
  </div>
</section>"""

meatlugs_faqs = [
    ("What temperature range do PP meat lugs handle?", "Elipacko meat lugs use copolymer PP — rated from −20°F (blast-freeze) to 180°F (hot washdown). This covers the full processing and cold chain range. Standard PP homopolymer is not rated for blast-freeze; copolymer PP is."),
    ("What sanitizers are compatible with PP meat lugs?", "PP is compatible with quaternary ammonium compounds (QACs), peracetic acid (PAA), chlorinated alkaline solutions, and hydrogen peroxide at normal food-safety use concentrations. Elipacko can provide chemical compatibility data for your specific cleaning program."),
    ("How many lugs fit in a 40HQ container?", "The number depends on lug size and configuration. As a rough guide: 8-gallon lugs — 600–800 units; 15-gallon — 400–550; 30-gallon — 200–300; 55-gallon — 120–180. Elipacko provides exact container configurations at the quoting stage."),
    ("Can PP meat lugs be custom-sized?", "Yes. Custom dimensions are available on container-load orders. Standard sizes (8, 15, 30, 55 gallon) are produced without custom tooling costs. Custom dimensions require tooling — Elipacko advises on tooling cost and amortization at your projected order volume."),
    ("Are PP meat lugs recyclable?", "Yes. PP is resin code #5 — fully recyclable through PP-capable recycling facilities. At end of service life, Elipacko meat lugs can enter the PP recycling stream. This is a genuine sustainability advantage over single-use alternatives."),
]

build_result = build(
    "meatlugs.com", "#7f1d1d", "#b91c1c",
    "meat lugs", "Meat Lugs",
    "PP Food-Grade Meat Processing Containers — Wholesale Direct",
    "Polypropylene meat lugs for commercial meat processing. FDA 21 CFR 177.1520, blast-freeze rated to −20°F, 180°F washdown safe. HACCP 5-color system. Wholesale from Elipacko — Asia's largest PP factory.",
    "/pp-meat-lugs/",
    [(f"{CDN}/meat-lug-white-empty.jpg","White PP meat lug empty stackable — meatlugs.com"),
     (f"{CDN}/meat-lug-5color-set.jpg","PP meat lugs HACCP 5-color set — meatlugs.com"),
     (f"{CDN}/meat-lug-filled-meat.jpg","PP meat lug filled with raw meat — meatlugs.com")],
    [("−20°F","Blast-freeze rated"),("180°F","Hot washdown safe"),("5 colors","HACCP coded"),("50+","Reuse cycles"),("0%","Anti-dump duty USA"),("3 days","Production time")],
    [("what-are","What Are Meat Lugs?"),("haccp","HACCP Color-Coding"),("sizes","Meat Lug Sizes"),("source","Where to Source"),("faq","FAQ")],
    meatlugs_sections,
    meatlugs_faqs,
    [("wholesale-meat-lugs","Wholesale Meat Lugs","Bulk pricing and container-load ordering"),("haccp-color-coded-lugs","HACCP Color-Coded Lugs","5-color system guide"),("meat-lug-sizes","Meat Lug Sizes","8 to 55 gallon guide"),("food-grade-meat-containers","Food-Grade Containers","FDA compliance guide"),("buy-meat-lugs","Buy Meat Lugs","Where and how to order"),("faq","FAQ","All common questions answered")],
    '<a href="https://elipacko.com/pp-meat-lugs/" rel="noopener" style="color:#b91c1c">elipacko.com/pp-meat-lugs</a>'
)
with open(f"{BASE}/meatlugs/index.html","w") as f: f.write(build_result)
print("✓ meatlugs.com")


# ── GAYLORD SITES (shared sections, different domain/color) ──────────────────
gaylord_sections = f"""
<section style="background:var(--gray)" id="what-is">
  <div class="si ab">
    <div class="lbl">Background</div>
    <h2>What Is a Gaylord Box?</h2>
    <p>A gaylord box is a large bulk container — typically 40×48 or 45×48 inches — designed to sit on a GMA pallet and hold bulk materials. The name comes from the Gaylord Container Company. Today it refers to any large bulk bin in this size class, regardless of manufacturer or material.</p>
    <p>Traditional gaylords are single-use triple-wall cardboard. PP corrugated gaylords are the reusable, waterproof replacement. At scale, the cost-per-use math is decisive: a PP gaylord that costs 10× more than cardboard but lasts 50+ uses has a cost-per-trip 5× lower.</p>
    <table class="ct">
      <tr><th>Factor</th><th>Cardboard Gaylord</th><th>PP Gaylord Box</th></tr>
      <tr><td>Cost per unit</td><td>$8–$15</td><td>$80–$140</td></tr>
      <tr><td>Reuse cycles</td><td class="no">1 ✗</td><td class="yes">50+ ✓</td></tr>
      <tr><td>Cost per trip (amortized)</td><td>$8–$15</td><td class="yes">$1.60–$2.80 ✓</td></tr>
      <tr><td>Waterproof</td><td class="no">No ✗</td><td class="yes">100% ✓</td></tr>
      <tr><td>Mold/collapse when wet</td><td class="no">Yes ✗</td><td class="yes">Never ✓</td></tr>
      <tr><td>ISPM-15 export</td><td class="maybe">N/A ⚠</td><td class="yes">Not required ✓</td></tr>
      <tr><td>Recyclable</td><td class="maybe">Contaminated OCC ⚠</td><td class="yes">100% PP #5 ✓</td></tr>
    </table>
  </div>
</section>

<section style="background:#fff" id="specs">
  <div class="si">
    <div class="lbl">Specifications</div>
    <h2>PP Gaylord Box Specifications</h2>
    <div class="two-col">
      <div>
        <table class="ct">
          <tr><th>Spec</th><th>Value</th></tr>
          <tr><td>Material</td><td>PP corrugated twin-wall</td></tr>
          <tr><td>Static Load</td><td>2,200 lbs</td></tr>
          <tr><td>Standard Footprints</td><td>48×40, 45×48, 40×40 + custom</td></tr>
          <tr><td>Wall Thickness</td><td>4mm / 6mm / 8mm</td></tr>
          <tr><td>Colors</td><td>White, black, blue, custom</td></tr>
          <tr><td>Lid Available</td><td>Yes — matching PP lid</td></tr>
          <tr><td>Reuse</td><td>50+ cycles (5–10 yr life)</td></tr>
          <tr><td>ISPM-15</td><td>Not required (PP not wood)</td></tr>
          <tr><td>Anti-Dump Duty</td><td>0%</td></tr>
          <tr><td>MOQ</td><td>One 40HQ container</td></tr>
          <tr><td>Lead Time</td><td>3 days + 14–21 days freight</td></tr>
        </table>
      </div>
      <div>
        <div class="pg" style="grid-template-columns:1fr">
          <img src="{CDN}/pp-gaylord-box-1.jpg" alt="PP gaylord box white wholesale — plasticgaylord.com" loading="lazy" style="aspect-ratio:4/3">
          <img src="{CDN}/pp-gaylord-on-pallet-strapped.jpg" alt="PP gaylord box on pallet strapped for shipment — plasticgaylord.com" loading="lazy" style="aspect-ratio:4/3">
          <img src="{CDN}/pp-gaylord-on-pallet-lidded.jpg" alt="PP gaylord box with lid on pallet — plasticgaylord.com" loading="lazy" style="aspect-ratio:4/3">
        </div>
      </div>
    </div>
  </div>
</section>

<section style="background:var(--gray)" id="export">
  <div class="si ab">
    <div class="lbl">Export Advantage</div>
    <h2>No ISPM-15 — Export Without Fumigation</h2>
    <p>ISPM-15 requires heat treatment or fumigation for wood packaging crossing international borders. PP corrugated is plastic — entirely exempt. Switching from wood crates or cardboard-gaylord shipments to PP gaylords eliminates ISPM-15 costs and customs delays in the EU, Australia, China, Japan, and all other ISPM-15 enforcement markets.</p>
    <div class="info"><p><strong>Typical ISPM-15 savings:</strong> $3–$8 per pallet in treatment costs, plus faster customs clearance at border inspection points. For a container of 20 pallets, that's $60–$160 per shipment — every shipment.</p></div>
  </div>
</section>

<section style="background:#fff" id="source">
  <div class="si ab">
    <div class="lbl">How to Order</div>
    <h2>Where to Source PP Gaylord Boxes</h2>
    <p><a href="https://elipacko.com/pp-gaylord-boxes/" rel="noopener" style="color:#1a6bdb">Elipacko</a> manufactures PP gaylord boxes at Asia's largest PP corrugated facility. Direct factory ordering means no markup, custom spec capability, and 3-day production of a 40HQ container load.</p>
    <ul>
      <li>Specify footprint (48×40, 45×48, custom)</li>
      <li>Height (24, 30, 36, 48 in)</li>
      <li>Wall thickness (4mm, 6mm, 8mm)</li>
      <li>Color and print requirements</li>
      <li>Lid required (yes/no)</li>
      <li>Destination port for freight calculation</li>
    </ul>
  </div>
</section>"""

gaylord_faqs = [
    ("How much does a PP gaylord box hold?", "Elipacko PP gaylord boxes are rated to 2,200 lbs static load. Actual fill weight depends on bulk density — grain fills at 1,500–1,800 lbs, plastic resin at 1,200–1,600 lbs, produce at 400–900 lbs. The 2,200 lb structural rating exceeds most real-world fill weights."),
    ("Can PP gaylords be used in food applications?", "Yes. Food-grade PP formulation (FDA 21 CFR 177.1520) is available for direct food contact applications — produce, grain, and food manufacturing. Specify food-grade PP at the quoting stage."),
    ("Do PP gaylords need ISPM-15 for export?", "No. ISPM-15 applies to wood packaging only. PP corrugated gaylords are entirely exempt — no fumigation, no heat treatment, no phytosanitary certificate required for the packaging."),
    ("What wall thickness should I choose?", "4mm is correct for most applications — produce, grain, manufactured parts. 6mm for heavier or abrasive materials. 8mm for the highest load applications or repeated forklift impact environments. Elipacko advises based on your specific application."),
    ("What is the MOQ for PP gaylord boxes?", "One 40HQ container. Production takes 3 days. Sea freight to US West Coast is 14–21 days. Contact Elipacko for exact unit count at your specified configuration."),
]

gaylord_related = [("pp-gaylord-boxes","PP Gaylord Boxes","Overview and product range"),("reusable-gaylord-boxes","Reusable Gaylord Boxes","PP vs cardboard cost analysis"),("gaylord-box-dimensions","Gaylord Box Dimensions","Standard sizes explained"),("heavy-duty-gaylord","Heavy Duty Gaylord","2200 lb specifications"),("gaylord-box-wholesale","Wholesale Pricing","Container-load pricing guide"),("faq","FAQ","All common questions")]

for site_dir, domain, color, color2 in [
    ("plasticgaylord","plasticgaylord.com","#1e3a5f","#1a6bdb"),
    ("plasticgaylordbox","plasticgaylordbox.com","#1e3a5f","#1a6bdb"),
    ("plasticgaylordboxes","plasticgaylordboxes.com","#1e3a5f","#1a6bdb"),
    ("gaylordboxesplastic","gaylordboxesplastic.com","#1e3a5f","#1a6bdb"),
]:
    result = build(
        domain, color, color2, "PP gaylord boxes", "Plastic Gaylord Boxes",
        "PP Reusable Bulk Containers — 2,200 lb Wholesale Direct",
        "Wholesale PP corrugated gaylord boxes. 2,200 lb capacity, reusable 50+ cycles, 100% waterproof. No ISPM-15, 0% anti-dumping duty. Manufacturer direct from Elipacko — Asia's largest PP factory.",
        "/pp-gaylord-boxes/",
        [(f"{CDN}/pp-gaylord-box-1.jpg",f"PP gaylord box white bulk wholesale — {domain}"),
         (f"{CDN}/pp-gaylord-box-2.jpg",f"PP gaylord boxes stacked — {domain}"),
         (f"{CDN}/pp-gaylord-on-pallet-strapped.jpg",f"PP gaylord on pallet strapped — {domain}"),
         (f"{CDN}/pp-gaylord-on-pallet-lidded.jpg",f"PP gaylord box lidded on pallet — {domain}")],
        [("2,200 lbs","Static load"),("50+","Reuse cycles"),("100%","Waterproof"),("0%","Anti-dump duty"),("No","ISPM-15 needed"),("3 days","Production time")],
        [("what-is","What Is a Gaylord Box?"),("specs","PP Gaylord Specifications"),("export","No ISPM-15 Export Advantage"),("source","Where to Source"),("faq","FAQ")],
        gaylord_sections, gaylord_faqs, gaylord_related,
        f'<a href="https://elipacko.com/pp-gaylord-boxes/" rel="noopener" style="color:#1a6bdb">elipacko.com/pp-gaylord-boxes</a>'
    )
    with open(f"{BASE}/{site_dir}/index.html","w") as f: f.write(result)
    print(f"✓ {domain}")


# ── PALLET SITES ──────────────────────────────────────────────────────────────
pallet_sections = f"""
<section style="background:var(--gray)" id="pp-vs-wood">
  <div class="si">
    <div class="lbl">Comparison</div>
    <h2>PP vs Wood Pallets — Full Cost Analysis</h2>
    <table class="ct">
      <tr><th>Property</th><th>GMA Wood Pallet</th><th>PP Plastic Pallet</th></tr>
      <tr><td>Unit cost</td><td>$12–$25</td><td>$90–$180</td></tr>
      <tr><td>Trip life</td><td>3–5 trips</td><td class="yes">100–200+ trips ✓</td></tr>
      <tr><td>Cost per trip</td><td>$4–$8</td><td class="yes">$0.90–$1.80 ✓</td></tr>
      <tr><td>Static load</td><td>2,500 lbs (new)</td><td class="yes">10,000+ lbs ✓</td></tr>
      <tr><td>Moisture resistance</td><td class="no">Warps and absorbs ✗</td><td class="yes">100% waterproof ✓</td></tr>
      <tr><td>Splinter/nail hazard</td><td class="no">Yes ✗</td><td class="yes">None ✓</td></tr>
      <tr><td>ISPM-15 export</td><td class="no">Required ✗</td><td class="yes">Not required ✓</td></tr>
      <tr><td>Food facility</td><td class="maybe">Restricted in many ⚠</td><td class="yes">Approved ✓</td></tr>
      <tr><td>Pest risk</td><td class="no">Wood-boring insects ✗</td><td class="yes">None ✓</td></tr>
      <tr><td>Service life</td><td>1–2 years</td><td class="yes">10–15 years ✓</td></tr>
    </table>
    <div class="info"><p><strong>10-year cost at 1,000 pallets:</strong> Wood — $15,000–$25,000 (replace 5–10× over 10 years). PP — $9,000–$18,000 total, no replacement. PP wins by year 2–3 and the gap grows every year after.</p></div>
  </div>
</section>

<section style="background:#fff" id="types">
  <div class="si">
    <div class="lbl">Product Types</div>
    <h2>PP Pallet Types</h2>
    <div class="two-col">
      <div>
        <h3>PP Corrugated Pallets</h3>
        <p>Twin-wall PP corrugated construction. Lightest option (15–22 lbs). Highest static load (10,000+ lbs). Best for floor storage, export, and food cold chain. 4-way entry, 48×40 GMA standard footprint.</p>
        <h3>Injection-Molded PP Pallets</h3>
        <p>Solid PP construction. Heavier (22–35 lbs) but higher racking load (2,200 lbs). Best for selective racking, automated warehouses, and pharmaceutical cleanrooms. Nestable 3:1 empty.</p>
        <h3>No ISPM-15 for Either Type</h3>
        <p>Both PP pallet types are plastic — entirely exempt from ISPM-15 heat treatment or fumigation requirements for international export. Save $3–$8 per pallet per shipment vs wood.</p>
      </div>
      <div>
        <div class="pg" style="grid-template-columns:1fr">
          <img src="{CDN}/pp-pallet-heavy-duty.jpg" alt="Heavy duty PP plastic pallet — heavydutypallets.com" loading="lazy" style="aspect-ratio:4/3">
          <img src="{CDN}/pp-pallet-heavy-duty-2.jpg" alt="PP plastic pallet racking compatible — heavydutypallets.com" loading="lazy" style="aspect-ratio:4/3">
          <img src="{CDN}/pp-pallet-heavy-duty-3.jpg" alt="PP heavy duty pallet forklift 4-way entry — heavydutypallets.com" loading="lazy" style="aspect-ratio:4/3">
        </div>
      </div>
    </div>
  </div>
</section>

<section style="background:var(--gray)" id="load-ratings">
  <div class="si ab">
    <div class="lbl">Load Ratings</div>
    <h2>Understanding Pallet Load Ratings</h2>
    <table class="ct">
      <tr><th>Rating Type</th><th>PP Corrugated</th><th>Injection-Molded PP</th><th>GMA Wood (new)</th></tr>
      <tr><td><strong>Static</strong> (floor storage)</td><td class="yes">10,000+ lbs ✓</td><td>8,000+ lbs</td><td>2,500 lbs</td></tr>
      <tr><td><strong>Dynamic</strong> (forklift loaded)</td><td>4,400 lbs</td><td>4,400 lbs</td><td>2,200 lbs (new)</td></tr>
      <tr><td><strong>Racking</strong> (suspended)</td><td class="no">Floor only ✗</td><td class="yes">2,200 lbs ✓</td><td>2,200 lbs (new)</td></tr>
    </table>
    <p>Wood pallet ratings degrade with every trip — nails loosen, slats crack. PP pallet ratings are consistent across the service life because PP doesn't fatigue under normal cycling.</p>
  </div>
</section>

<section style="background:#fff" id="source">
  <div class="si ab">
    <div class="lbl">How to Order</div>
    <h2>Where to Source Heavy Duty Plastic Pallets</h2>
    <p><a href="https://elipacko.com/pp-pallets/" rel="noopener" style="color:#16a34a">Elipacko</a> manufactures PP pallets at Asia's largest PP corrugated facility. Specify footprint, entry type, racking vs floor rating, and food-grade requirement. 3-day production of a container load, 14–21 days to US port.</p>
    <div class="info"><p><strong>0% anti-dumping duty:</strong> PP pallets are not subject to US anti-dumping duties. Confirm HTS code with your broker.</p></div>
  </div>
</section>"""

pallet_faqs = [
    ("What is the load rating for PP plastic pallets?", "Elipacko PP corrugated pallets are rated to 10,000+ lbs static, 4,400 lbs dynamic. Injection-molded PP pallets are rated to 2,200 lbs racking. Ratings are consistent across the service life — PP doesn't fatigue like wood."),
    ("Do PP pallets require ISPM-15 for export?", "No. ISPM-15 applies to wood packaging only. PP plastic pallets are exempt — no heat treatment, fumigation, or phytosanitary certificate required."),
    ("Can PP pallets be used in freezer storage?", "Yes. PP performs from −40°F to 140°F without deformation. No moisture absorption means no freeze-thaw swelling or cracking."),
    ("Are PP pallets FDA-approved for food facilities?", "Yes. Food-grade PP pallets are accepted in FDA and USDA-regulated facilities. Non-porous surface, no splinters, no nails — pressure-wash sanitizable."),
    ("What is the MOQ for PP plastic pallets?", "One 40HQ container. Production takes 3 days. Sea freight to US West Coast is 14–21 days."),
]

pallet_related = [("plastic-pallets-heavy-duty","Heavy Duty Plastic Pallets","PP vs wood load comparison"),("pp-plastic-pallets","PP Plastic Pallets","Polypropylene wholesale direct"),("industrial-plastic-pallets","Industrial Pallets","Racking and cold chain specs"),("food-grade-pallets","Food Grade Pallets","FDA and USDA applications"),("export-pallets","Export Pallets","No ISPM-15 required"),("faq","FAQ","All common questions")]

for site_dir, domain in [("heavydutypallets","heavydutypallets.com"),("heavydutyplasticpallets","heavydutyplasticpallets.com")]:
    result = build(
        domain, "#1c3d2e", "#16a34a", "heavy duty plastic pallets", "Heavy Duty Plastic Pallets",
        "PP Pallets — 10,000 lb Static, Racking-Rated, No ISPM-15",
        "Heavy duty PP plastic pallets for industrial racking, cold chain, and export. 10,000+ lb static, racking-rated, ISPM-15 exempt, food-safe. Wholesale from Elipacko.",
        "/pp-pallets/",
        [(f"{CDN}/pp-pallet-heavy-duty.jpg",f"Heavy duty PP plastic pallet — {domain}"),
         (f"{CDN}/pp-pallet-heavy-duty-2.jpg",f"PP plastic pallet racking — {domain}"),
         (f"{CDN}/pp-pallet-heavy-duty-3.jpg",f"PP pallet forklift ready — {domain}"),
         (f"{CDN}/pp-gaylord-on-pallet-strapped.jpg",f"Gaylord on PP pallet — {domain}")],
        [("10,000+","lbs static load"),("2,200","lbs racking"),("10+","year service life"),("0%","anti-dump duty"),("No","ISPM-15"),("−40°F","cold chain rated")],
        [("pp-vs-wood","PP vs Wood Pallets"),("types","PP Pallet Types"),("load-ratings","Load Ratings"),("source","Where to Source"),("faq","FAQ")],
        pallet_sections, pallet_faqs, pallet_related,
        f'<a href="https://elipacko.com/pp-pallets/" rel="noopener" style="color:#16a34a">elipacko.com/pp-pallets</a>'
    )
    with open(f"{BASE}/{site_dir}/index.html","w") as f: f.write(result)
    print(f"✓ {domain}")


# ── POULTRY SITES ─────────────────────────────────────────────────────────────
poultry_sections = f"""
<section style="background:var(--gray)" id="pp-vs-wood-poultry">
  <div class="si">
    <div class="lbl">Biosecurity</div>
    <h2>PP vs Wood Poultry Crates — Biosecurity Comparison</h2>
    <table class="ct">
      <tr><th>Property</th><th>Wood Crate</th><th>PP Corrugated Crate</th></tr>
      <tr><td>Biofilm harboring</td><td class="no">Wood grain — yes ✗</td><td class="yes">Non-porous — none ✓</td></tr>
      <tr><td>Full disinfection</td><td class="no">Incomplete ✗</td><td class="yes">Full surface contact ✓</td></tr>
      <tr><td>Splinter injury risk</td><td class="no">Yes — welfare issue ✗</td><td class="yes">None ✓</td></tr>
      <tr><td>ISPM-15 export</td><td class="no">Required ✗</td><td class="yes">Not required ✓</td></tr>
      <tr><td>Sanitization temp</td><td class="maybe">Limited ⚠</td><td class="yes">140°F+ ✓</td></tr>
      <tr><td>Service life</td><td>5–10 years</td><td class="yes">15–20+ years ✓</td></tr>
    </table>
    <div class="note"><p><strong>HPAI biosecurity:</strong> PP surfaces achieve full log-reduction of avian influenza virus with standard QAC or PAA disinfection. Wood grain absorption prevents equivalent log-reduction — a critical distinction for USDA APHIS compliance in HPAI surveillance zones.</p></div>
  </div>
</section>

<section style="background:#fff" id="species">
  <div class="si">
    <div class="lbl">Species Guide</div>
    <h2>Species and Size Guide</h2>
    <table class="ct">
      <tr><th>Species</th><th>Live Weight</th><th>Birds/Crate</th><th>Crate Size</th></tr>
      <tr><td><strong>Broiler</strong></td><td>4–6 lbs</td><td>6–10</td><td>600×400×280mm</td></tr>
      <tr><td><strong>Heavy Broiler</strong></td><td>7–10 lbs</td><td>4–6</td><td>700×500×320mm</td></tr>
      <tr><td><strong>Layer (spent)</strong></td><td>3–5 lbs</td><td>8–12</td><td>600×400×250mm</td></tr>
      <tr><td><strong>Turkey</strong></td><td>20–40 lbs</td><td>2–4</td><td>800×600×400mm</td></tr>
      <tr><td><strong>Duck</strong></td><td>5–8 lbs</td><td>6–8</td><td>650×450×280mm</td></tr>
    </table>
    <div class="pg">
      <img src="{CDN}/poultry-box.jpg" alt="PP poultry crate ventilated live bird transport — poultrycrates.com" loading="lazy">
      <img src="{CDN}/poultry-box.jpg" alt="PP poultry boxes stacked for transport — poultrycrates.com" loading="lazy">
      <img src="{CDN}/poultry-box.jpg" alt="PP corrugated poultry container farm — poultrycrates.com" loading="lazy">
    </div>
  </div>
</section>

<section style="background:var(--gray)" id="ventilation">
  <div class="si ab">
    <div class="lbl">Ventilation</div>
    <h2>Ventilation Design by Climate</h2>
    <table class="ct">
      <tr><th>Climate</th><th>Vent Area</th><th>Priority</th></tr>
      <tr><td>Hot summer transport</td><td>25–35%</td><td>Maximum airflow — heat stress prevention</td></tr>
      <tr><td>Temperate year-round</td><td>20–25%</td><td>Balanced airflow and structural strength</td></tr>
      <tr><td>Cold winter transport</td><td>15–20%</td><td>Reduce chilling while maintaining welfare airflow</td></tr>
    </table>
    <p>Elipacko custom vent patterns available for any climate or integrator welfare certification specification. Standard round-hole and elongated-slot patterns available without custom tooling on volume orders.</p>
  </div>
</section>

<section style="background:#fff" id="source">
  <div class="si ab">
    <div class="lbl">How to Order</div>
    <h2>Where to Source PP Poultry Crates</h2>
    <p><a href="https://elipacko.com/pp-poultry-boxes/" rel="noopener" style="color:#d97706">Elipacko</a> manufactures PP poultry crates to your species and integrator specification. Specify bird species, average live weight, birds-per-crate target, climate zone, and any welfare certification requirements. 3-day production, 14–21 days to US port.</p>
    <div class="info"><p><strong>0% anti-dumping duty:</strong> PP corrugated poultry crates are not subject to US anti-dumping duties. No ISPM-15 required for export.</p></div>
  </div>
</section>"""

poultry_faqs = [
    ("What vent percentage do PP poultry crates have?", "Standard Elipacko poultry crates have 20–30% vent area. Custom vent patterns are available for specific climate conditions or bird welfare certification requirements."),
    ("How do you sanitize PP poultry crates between flocks?", "Standard protocol: dry debris removal, cold pre-soak, hot-pressure wash (140–160°F) with approved detergent, approved disinfectant (QAC or PAA), final rinse, air dry inverted. PP achieves full log-reduction of avian pathogens with this protocol."),
    ("Can PP poultry crates be used for turkey?", "Yes. Elipacko produces crates sized for turkeys (800×600×400mm standard) with higher structural ratings for the greater weight per bird. Custom dimensions available."),
    ("What is the stack height for loaded poultry crates?", "4–6 high on transport vehicles. The stacking locators on the base engage the rim below to prevent lateral shift during transport. Exact stack height depends on your crate configuration and vehicle racking."),
    ("Do PP poultry crates require ISPM-15 for export?", "No. PP is plastic — entirely exempt from ISPM-15 wood packaging requirements."),
]

poultry_related = [("plastic-poultry-crates","Plastic Poultry Crates","PP for live bird transport"),("chicken-transport-crates","Chicken Transport Crates","Ventilated broiler crates"),("poultry-transport-boxes","Poultry Transport Boxes","Stackable containers"),("poultry-crate-dimensions","Dimensions Guide","All species sizes"),("reusable-poultry-crates","Reusable Crates","PP vs single-use cost"),("faq","FAQ","All common questions")]

for site_dir, domain in [("poultrycrates","poultrycrates.com"),("poultryboxes","poultryboxes.com"),("poultryshippingboxes","poultryshippingboxes.com")]:
    result = build(
        domain, "#78350f", "#d97706", "PP poultry crates", "PP Poultry Crates",
        "Ventilated Live Bird Transport Containers — Wholesale Direct",
        "PP corrugated poultry crates for live bird transport. Ventilated 20–30%, stackable 4–6 high, biosecurity sanitizable. HPAI-rated disinfection protocol. Wholesale from Elipacko.",
        "/pp-poultry-boxes/",
        [(f"{CDN}/poultry-box.jpg",f"PP poultry crate ventilated live bird — {domain}"),
         (f"{CDN}/poultry-box.jpg",f"PP poultry boxes stacked transport — {domain}"),
         (f"{CDN}/poultry-box.jpg",f"PP corrugated poultry container — {domain}")],
        [("20–30%","Vent area"),("4–6","Stack height loaded"),("20+ yrs","Service life"),("0%","Anti-dump duty"),("No","ISPM-15"),("Custom","Vent patterns")],
        [("pp-vs-wood-poultry","PP vs Wood Biosecurity"),("species","Species & Size Guide"),("ventilation","Ventilation by Climate"),("source","Where to Source"),("faq","FAQ")],
        poultry_sections, poultry_faqs, poultry_related,
        f'<a href="https://elipacko.com/pp-poultry-boxes/" rel="noopener" style="color:#d97706">elipacko.com/pp-poultry-boxes</a>'
    )
    with open(f"{BASE}/{site_dir}/index.html","w") as f: f.write(result)
    print(f"✓ {domain}")


# ── PRODUCE SITES ─────────────────────────────────────────────────────────────
produce_sections = f"""
<section style="background:var(--gray)" id="pp-vs-wax">
  <div class="si">
    <div class="lbl">Why Switch</div>
    <h2>PP vs Wax Cardboard — Why Farms Are Switching</h2>
    <table class="ct">
      <tr><th>Factor</th><th>Wax Cardboard</th><th>PP Corrugated Crate</th></tr>
      <tr><td>Reuse cycles</td><td class="no">1 (single-use) ✗</td><td class="yes">50+ ✓</td></tr>
      <tr><td>Moisture resistance</td><td class="maybe">Wax coating delays ⚠</td><td class="yes">100% waterproof ✓</td></tr>
      <tr><td>Cost per harvest</td><td>$1.50–$4.00</td><td class="yes">$0.10–$0.30 amortized ✓</td></tr>
      <tr><td>Recyclability</td><td class="no">Wax contaminates OCC ✗</td><td class="yes">100% PP #5 ✓</td></tr>
      <tr><td>Mold between uses</td><td class="no">Single-use only ✗</td><td class="yes">Pressure wash clean ✓</td></tr>
      <tr><td>Color-coding</td><td class="maybe">Limited ⚠</td><td class="yes">Any Pantone ✓</td></tr>
      <tr><td>Cold chain</td><td class="maybe">Degrades when wet ⚠</td><td class="yes">−40°F rated ✓</td></tr>
    </table>
  </div>
</section>

<section style="background:#fff" id="crop-guide">
  <div class="si">
    <div class="lbl">Crop Guide</div>
    <h2>Crop-by-Crop Container Guide</h2>
    <div class="two-col">
      <div>
        <table class="ct">
          <tr><th>Crop</th><th>Container</th><th>Key Need</th></tr>
          <tr><td>Leafy greens</td><td>Max-vent crate</td><td>High airflow, cold chain</td></tr>
          <tr><td>Tomatoes</td><td>Low-vent crate</td><td>Cushion, stackable 6 high</td></tr>
          <tr><td>Citrus</td><td>Medium-vent crate</td><td>High stack, water drain</td></tr>
          <tr><td>Root vegetables</td><td>Heavy-wall crate</td><td>High load, soil drain</td></tr>
          <tr><td>Bulk grain</td><td>Solid-wall gaylord</td><td>Sealed base, moisture barrier</td></tr>
        </table>
        <p>Elipacko produces custom ventilation patterns for any crop. Standard patterns (round holes, slots) available without tooling cost on volume orders.</p>
      </div>
      <div>
        <div class="pg" style="grid-template-columns:1fr">
          <img src="{CDN}/produce------.jpg" alt="PP produce crates farm to market — producecrates.com" loading="lazy" style="aspect-ratio:4/3">
          <img src="{CDN}/produce-----.jpg" alt="PP harvest crates stacked — producecrates.com" loading="lazy" style="aspect-ratio:4/3">
          <img src="{CDN}/vegetables-farm.jpg" alt="Vegetables in PP produce crates — producecrates.com" loading="lazy" style="aspect-ratio:4/3">
        </div>
      </div>
    </div>
  </div>
</section>

<section style="background:var(--gray)" id="specs-produce">
  <div class="si ab">
    <div class="lbl">Specifications</div>
    <h2>PP Produce Crate Specifications</h2>
    <table class="ct">
      <tr><th>Spec</th><th>Value</th></tr>
      <tr><td>Material</td><td>PP corrugated (3mm / 4mm / 5mm)</td></tr>
      <tr><td>Food Contact</td><td>FDA 21 CFR 177.1520</td></tr>
      <tr><td>Capacity</td><td>5 kg to 60 kg (custom)</td></tr>
      <tr><td>Ventilation</td><td>Solid to 35% open — custom patterns</td></tr>
      <tr><td>Colors</td><td>Any Pantone + custom print</td></tr>
      <tr><td>Temp Range</td><td>−40°F to 140°F</td></tr>
      <tr><td>Stacking</td><td>6–8 high (crop dependent)</td></tr>
      <tr><td>Reuse</td><td>50+ harvests (3–8 year life)</td></tr>
      <tr><td>Anti-Dump Duty</td><td>0%</td></tr>
      <tr><td>MOQ</td><td>One 40HQ container</td></tr>
    </table>
    <div class="info"><p><strong>Break-even vs wax boxes:</strong> At $2.50 wax box vs $50 PP crate, break-even is 20 uses — approximately 1–2 years at normal harvest frequency. Every use after that is essentially free container cost.</p></div>
  </div>
</section>

<section style="background:#fff" id="source">
  <div class="si ab">
    <div class="lbl">How to Order</div>
    <h2>Where to Source PP Produce Crates</h2>
    <p><a href="https://elipacko.com/agriculture-packaging/" rel="noopener" style="color:#16a34a">Elipacko</a> manufactures PP produce crates to your crop specification. Include crate dimensions, target capacity, ventilation requirement, color, and any print requirements. 3-day production, 14–21 days sea freight to US port.</p>
  </div>
</section>"""

produce_faqs = [
    ("How many harvests do PP produce crates last?", "50+ harvest cycles is the design target. In practice, farms report 3–8 years of continuous use depending on handling conditions — field use, mechanical loading, storage. PP doesn't degrade from moisture or UV at normal field exposure levels."),
    ("Can PP produce crates replace wax boxes?", "Yes, and the economics favor PP at any meaningful scale. PP is equally waterproof, reusable 50+ times, fully recyclable (wax cardboard isn't), and available in any color or print. The higher unit cost is recovered within 20–40 uses."),
    ("What vent pattern is right for my crop?", "Leafy greens need 25–35% vent area for maximum airflow. Tomatoes and peppers need 10–20%. Root vegetables need 5–15%. Elipacko produces custom patterns engineered for your crop's specific airflow and cold-chain requirements."),
    ("Are PP produce crates food contact safe?", "Yes. Food-grade PP complying with FDA 21 CFR 177.1520 is standard. Non-porous surface, pressure-wash sanitizable, no mold or odor retention between uses."),
    ("What is the MOQ?", "One 40HQ container. Exact unit count depends on crate size. 3-day production, 14–21 days to US West Coast port."),
]

produce_related = [("plastic-produce-crates","Plastic Produce Crates","PP for farm and distribution"),("reusable-produce-crates","Reusable Crates","PP vs cardboard cost"),("vegetable-crates-wholesale","Wholesale Pricing","Container-load guide"),("produce-crate-dimensions","Dimensions","Standard and custom sizes"),("buy-produce-crates","Buy Crates","How to order from Elipacko"),("faq","FAQ","All common questions")]

for site_dir, domain, tagline, hero_desc in [
    ("producecrates","producecrates.com","Wholesale PP Produce Crates — Farm to Market","PP corrugated produce crates replacing wax cardboard. 50+ harvest reuse, 100% waterproof, custom ventilation by crop. Wholesale from Elipacko."),
    ("vegetablecrates","vegetablecrates.com","Wholesale PP Vegetable Crates — Farm to Market","PP corrugated vegetable crates for harvest, transport, and retail. Reusable 50+ cycles, waterproof, food-grade. Wholesale direct from Elipacko."),
    ("cardboardproduceboxes","cardboardproduceboxes.com","PP Produce Boxes — Better Than Cardboard","PP corrugated produce boxes that replace single-use cardboard. 50x reuse, 100% waterproof, fully recyclable. Wholesale from Elipacko."),
    ("waxproduceboxes","waxproduceboxes.com","PP Produce Boxes — Better Than Wax Cardboard","PP corrugated produce boxes replacing wax cardboard. Equally waterproof, reusable 50× times, 100% recyclable. Wholesale from Elipacko."),
]:
    result = build(
        domain, "#14532d", "#16a34a", "PP produce crates", "PP Produce Crates",
        tagline, hero_desc, "/agriculture-packaging/",
        [(f"{CDN}/produce------.jpg",f"PP produce crates farm wholesale — {domain}"),
         (f"{CDN}/produce-----.jpg",f"PP harvest crates stacked — {domain}"),
         (f"{CDN}/produce----.jpg",f"PP ventilated produce crates — {domain}"),
         (f"{CDN}/vegetables-farm.jpg",f"Vegetables in PP produce crates — {domain}")],
        [("50+","Harvest reuse cycles"),("100%","Waterproof"),("FDA","21 CFR food-grade"),("0%","Anti-dump duty USA"),("Custom","Vent patterns"),("3 days","Production time")],
        [("pp-vs-wax","PP vs Wax Cardboard"),("crop-guide","Crop-by-Crop Guide"),("specs-produce","Specifications"),("source","Where to Source"),("faq","FAQ")],
        produce_sections, produce_faqs, produce_related,
        f'<a href="https://elipacko.com/agriculture-packaging/" rel="noopener" style="color:#16a34a">elipacko.com/agriculture-packaging</a>'
    )
    with open(f"{BASE}/{site_dir}/index.html","w") as f: f.write(result)
    print(f"✓ {domain}")


# ── REUSABLE SHIPPING BOXES ───────────────────────────────────────────────────
shipping_sections = f"""
<section style="background:var(--gray)" id="pp-vs-cardboard">
  <div class="si">
    <div class="lbl">Cost Analysis</div>
    <h2>PP vs Cardboard Shipping Boxes — Total Cost</h2>
    <table class="ct">
      <tr><th>Factor</th><th>Cardboard Box</th><th>PP Corrugated Box</th></tr>
      <tr><td>Unit cost</td><td>$1–$5</td><td>$12–$40</td></tr>
      <tr><td>Reuse cycles</td><td class="no">1–3 ✗</td><td class="yes">50+ ✓</td></tr>
      <tr><td>Cost per shipment (amortized)</td><td>$1–$5</td><td class="yes">$0.25–$0.80 ✓</td></tr>
      <tr><td>Moisture resistance</td><td class="no">Collapses when wet ✗</td><td class="yes">100% waterproof ✓</td></tr>
      <tr><td>Returns/reverse logistics</td><td class="no">Single-use ✗</td><td class="yes">Flat-pack return ✓</td></tr>
      <tr><td>Custom print</td><td class="maybe">Limited ⚠</td><td class="yes">Full color ✓</td></tr>
      <tr><td>Environmental</td><td class="no">Single-use waste ✗</td><td class="yes">100% PP #5 recyclable ✓</td></tr>
    </table>
  </div>
</section>

<section style="background:#fff" id="applications">
  <div class="si">
    <div class="lbl">Applications</div>
    <h2>Where Reusable PP Shipping Boxes Fit</h2>
    <div class="two-col">
      <div>
        <h3>Manufacturing and Distribution</h3>
        <p>Reusable PP boxes for intra-company logistics — parts from manufacturing to assembly, finished goods from distribution center to retail. Closed-loop box pools with 50+ trips before retirement.</p>
        <h3>Cold Chain and Food</h3>
        <p>PP boxes for refrigerated and frozen product distribution. Waterproof surface, cold-chain rated, HACCP color-coding for food safety compliance.</p>
        <h3>E-Commerce Returns</h3>
        <p>Heavy-gauge PP boxes for high-volume return logistics where cardboard fails after 1–2 uses. PP maintains structural integrity through repeated inbound-outbound cycles.</p>
        <h3>Export Packaging</h3>
        <p>No ISPM-15 required. PP reusable shipping boxes ship internationally without fumigation or heat treatment costs.</p>
      </div>
      <div>
        <div class="pg" style="grid-template-columns:1fr">
          <img src="{CDN}/pp-gaylord-box-1.jpg" alt="PP reusable shipping boxes — reusableshippingboxes.com" loading="lazy" style="aspect-ratio:4/3">
          <img src="{CDN}/turnover-box-0ac876e7-39f9-4814-b77f-603422efbf84.jpg" alt="PP corrugated reusable box — reusableshippingboxes.com" loading="lazy" style="aspect-ratio:4/3">
        </div>
      </div>
    </div>
  </div>
</section>

<section style="background:var(--gray)" id="specs-shipping">
  <div class="si ab">
    <div class="lbl">Specifications</div>
    <h2>Specifications</h2>
    <table class="ct">
      <tr><th>Spec</th><th>Value</th></tr>
      <tr><td>Material</td><td>PP corrugated twin-wall</td></tr>
      <tr><td>Reuse Cycles</td><td>50+</td></tr>
      <tr><td>Waterproof</td><td>100%</td></tr>
      <tr><td>Colors</td><td>Any Pantone + custom print</td></tr>
      <tr><td>Flat-Pack</td><td>Yes — empties flat for return</td></tr>
      <tr><td>Temperature</td><td>−40°F to 140°F</td></tr>
      <tr><td>Anti-Dump Duty</td><td>0%</td></tr>
      <tr><td>MOQ</td><td>One 40HQ container</td></tr>
    </table>
  </div>
</section>"""

shipping_faqs = [
    ("How many times can PP shipping boxes be reused?", "50+ reuse cycles is the standard design target for Elipacko PP corrugated shipping boxes. In practice, service life depends on handling conditions — properly used and stored PP boxes commonly last 5–10 years in commercial logistics."),
    ("Do PP reusable shipping boxes flat-pack?", "Yes. PP corrugated boxes flat-pack for empty return shipping and storage — significantly reducing reverse logistics costs vs bulky empty boxes."),
    ("What is the MOQ for custom PP shipping boxes?", "One 40HQ container. 3-day production, 14–21 days sea freight to US port."),
    ("Are there anti-dumping duties on PP boxes from China?", "No. PP corrugated is not subject to US anti-dumping duties. 0% ADD rate applies."),
    ("Can PP shipping boxes be custom printed?", "Yes. Full-color printing direct on PP corrugated face sheets — logos, barcodes, handling instructions. No tooling cost for print on volume orders."),
]

shipping_related = [("reusable-plastic-shipping-boxes","Reusable Plastic Boxes","PP vs cardboard ROI"),("corrugated-plastic-shipping-boxes","Corrugated Plastic","PP twin-wall construction"),("sustainable-shipping-boxes","Sustainable Shipping","Environmental comparison"),("wholesale-reusable-boxes","Wholesale Pricing","Factory direct guide"),("buy-reusable-shipping-boxes","Buy Reusable Boxes","How to order"),("faq","FAQ","All common questions")]

result = build(
    "reusableshippingboxes.com", "#1e3a5f", "#1a6bdb",
    "reusable shipping boxes", "Reusable Shipping Boxes",
    "PP Corrugated — 50+ Trips, 100% Waterproof, Wholesale Direct",
    "PP corrugated reusable shipping boxes for industrial and commercial logistics. 50+ reuse cycles, waterproof, flat-pack empty, fully recyclable. Wholesale from Elipacko.",
    "/pp-corrugated-boxes/",
    [(f"{CDN}/pp-gaylord-box-1.jpg","PP reusable shipping boxes industrial — reusableshippingboxes.com"),
     (f"{CDN}/turnover-box-0ac876e7-39f9-4814-b77f-603422efbf84.jpg","PP corrugated reusable box — reusableshippingboxes.com"),
     (f"{CDN}/pp-gaylord-box-2.jpg","Reusable PP shipping boxes stacked — reusableshippingboxes.com")],
    [("50+","Reuse cycles"),("100%","Waterproof"),("0%","Anti-dump duty"),("Flat-pack","Empty return"),("Custom","Color & print"),("3 days","Production time")],
    [("pp-vs-cardboard","PP vs Cardboard Cost"),("applications","Applications"),("specs-shipping","Specifications"),("source","Where to Source"),("faq","FAQ")],
    shipping_sections, shipping_faqs, shipping_related,
    '<a href="https://elipacko.com/pp-corrugated-boxes/" rel="noopener" style="color:#1a6bdb">elipacko.com/pp-corrugated-boxes</a>'
)
with open(f"{BASE}/reusableshippingboxes/index.html","w") as f: f.write(result)
print("✓ reusableshippingboxes.com")

print("\nAll affiliate homepages upgraded!")
