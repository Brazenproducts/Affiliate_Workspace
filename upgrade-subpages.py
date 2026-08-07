#!/usr/bin/env python3
"""
Upgrade all subpages across 15 affiliate sites to 900-1500 words each.
Reuse the same CSS/nav structure as the upgraded homepage but inject deep content.
"""
import os, json, re

BASE = "/home/ubuntu/.openclaw/workspace/elipacko-sites"
CDN = "https://brazenproducts.github.io/elipacko-assets"

def faq_json(faqs):
    return json.dumps({"@context":"https://schema.org","@type":"FAQPage",
        "mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in faqs]})

def read_page(path):
    with open(path) as f: return f.read()

def inject_deep_content(html, title, h1, intro, sections_html, faqs, color):
    """Replace the thin body content with deep content while keeping head/nav/footer intact."""
    
    faq_items = "".join(f'''
    <div style="border-bottom:1px solid #e2e8f0;padding:18px 0">
      <h4 style="font-size:.95rem;font-weight:700;color:#0a2540;margin-bottom:8px">{q}</h4>
      <p style="color:#6b7a8d;font-size:.9rem;margin:0">{a}</p>
    </div>''' for q,a in faqs)

    new_body = f"""
<div style="background:#f7f9fc;padding:10px 5%;font-size:.82rem;color:#6b7a8d">
  <a href="/" style="color:{color}">Home</a> › {title}
</div>

<section style="background:linear-gradient(135deg,{color},{color}dd);color:#fff;padding:56px 5%">
  <div style="max-width:1100px;margin:0 auto">
    <div style="display:inline-block;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:20px;padding:5px 14px;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px">Sourcing Guide</div>
    <h1 style="font-size:clamp(1.7rem,3.5vw,2.5rem);font-weight:800;line-height:1.15;max-width:700px;margin-bottom:14px">{h1}</h1>
    <p style="color:rgba(255,255,255,.88);font-size:1rem;max-width:560px;margin-bottom:24px">{intro}</p>
    <a href="https://elipacko.com" style="background:#fff;color:{color};padding:12px 26px;border-radius:6px;font-weight:700;font-size:.92rem;display:inline-block">Get a Quote from Elipacko →</a>
  </div>
</section>

{sections_html}

<section style="background:#f7f9fc;padding:52px 5%">
  <div style="max-width:1100px;margin:0 auto">
    <div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:{color};margin-bottom:6px">FAQ</div>
    <h2 style="font-size:clamp(1.35rem,2.5vw,1.9rem);font-weight:800;color:#0a2540;margin-bottom:20px">Frequently Asked Questions</h2>
    <script type="application/ld+json">{faq_json(faqs)}</script>
    {faq_items}
  </div>
</section>

<div style="background:{color};padding:48px 5%;text-align:center;color:#fff">
  <h2 style="color:#fff;font-size:clamp(1.3rem,2.2vw,1.8rem);margin-bottom:10px">{title} — Wholesale Pricing from Elipacko</h2>
  <p style="color:rgba(255,255,255,.88);margin-bottom:22px">Manufacturer direct. 0% anti-dumping duty entering the USA.</p>
  <a href="https://elipacko.com" style="background:#fff;color:{color};padding:13px 30px;border-radius:6px;font-weight:700;display:inline-block">Request a Quote →</a>
</div>
"""
    # Find the hero section (starts after nav close) and footer, replace everything between
    nav_end = html.find('</nav>') + len('</nav>')
    footer_start = html.rfind('<footer')
    if nav_end == -1 or footer_start == -1:
        return html  # fallback
    return html[:nav_end] + new_body + html[footer_start:]

# ── CONTENT LIBRARY ──────────────────────────────────────────────────────────

CONTENT = {

"meatlugs": {
  "color": "#7f1d1d",
  "pages": {
    "wholesale-meat-lugs": {
      "title": "Wholesale Meat Lugs",
      "h1": "Wholesale Meat Lugs — Bulk PP Containers Direct from the Factory",
      "intro": "Buy wholesale PP meat lugs factory-direct. Bulk pricing on food-grade polypropylene meat tubs for abattoirs, processors, and large-volume distributors.",
      "sections": f"""
<section style="background:#fff;padding:52px 5%">
  <div style="max-width:1100px;margin:0 auto">
    <div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#b91c1c;margin-bottom:6px">Wholesale Direct</div>
    <h2 style="font-size:clamp(1.35rem,2.5vw,1.9rem);font-weight:800;color:#0a2540;margin-bottom:12px">Why Buy Wholesale Meat Lugs Factory-Direct?</h2>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">Wholesale meat lugs purchased factory-direct from Elipacko carry none of the distributor markup that adds 25–40% to domestic restocking prices. At container-load quantities (400–800 lugs per 40HQ depending on size), the per-unit price drops to $8–$22 depending on size — a fraction of what the same PP lug costs through a US distributor at $35–$65 each.</p>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">The economics are straightforward for any operation running 200+ lugs: one container order pays for itself within the first replacement cycle of equivalent domestic product. After that, every subsequent order is pure savings.</p>
    <table style="width:100%;border-collapse:collapse;font-size:.87rem;margin:18px 0">
      <tr style="background:#0a2540;color:#fff"><th style="padding:10px 13px;text-align:left">Size</th><th style="padding:10px 13px;text-align:left">Domestic Distributor</th><th style="padding:10px 13px;text-align:left">Elipacko Wholesale</th><th style="padding:10px 13px;text-align:left">Savings</th></tr>
      <tr><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">8-gallon</td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">$35–$45</td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">$8–$12</td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0;color:#16a34a;font-weight:700">65–75%</td></tr>
      <tr style="background:#f7f9fc"><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">15-gallon</td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">$50–$65</td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">$12–$18</td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0;color:#16a34a;font-weight:700">65–75%</td></tr>
      <tr><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">30-gallon</td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">$90–$120</td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">$18–$28</td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0;color:#16a34a;font-weight:700">68–77%</td></tr>
      <tr style="background:#f7f9fc"><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">55-gallon</td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">$120–$180</td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">$22–$38</td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0;color:#16a34a;font-weight:700">68–80%</td></tr>
    </table>
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px 18px;margin:18px 0">
      <p style="margin:0;font-size:.92rem;color:#0c4a6e"><strong>Anti-dumping duty:</strong> PP corrugated meat lugs from China are not subject to US anti-dumping duties — 0% ADD. Total landed cost includes only ocean freight and standard import duties.</p>
    </div>
    <h3 style="font-size:1.02rem;font-weight:700;color:#0a2540;margin:24px 0 10px">What Goes Into a Wholesale Order</h3>
    <ul style="padding-left:20px;color:#374151;font-size:.96rem;line-height:1.88;margin-bottom:14px">
      <li>One 40HQ container minimum order</li>
      <li>Specify size (8, 15, 30, or 55 gallon), color, drain plug (yes/no)</li>
      <li>Production: 3 days</li>
      <li>Sea freight to US West Coast: 14–21 days; East Coast: 24–30 days</li>
      <li>FDA 21 CFR 177.1520 food-grade compliance documentation included</li>
      <li>HACCP 5-color system available at no extra cost</li>
    </ul>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:16px 0">
      <img src="{CDN}/meat-lug-white-empty.jpg" alt="Wholesale PP meat lugs white empty — meatlugs.com" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0" loading="lazy">
      <img src="{CDN}/meat-lug-5color-set.jpg" alt="Wholesale PP meat lugs HACCP 5-color — meatlugs.com" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0" loading="lazy">
      <img src="{CDN}/meat-lug-filled-meat.jpg" alt="Wholesale meat lugs in use processing plant — meatlugs.com" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0" loading="lazy">
    </div>
    <h3 style="font-size:1.02rem;font-weight:700;color:#0a2540;margin:24px 0 10px">How to Request a Wholesale Quote</h3>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">Contact Elipacko directly at <a href="https://elipacko.com/pp-meat-lugs/" style="color:#b91c1c">elipacko.com/pp-meat-lugs</a>. Include your lug size, quantity, color specification, drain plug preference, and destination port. Elipacko will provide a CIF price and container unit count within 24 hours.</p>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">For distributors sourcing for resale: Elipacko can provide custom-branded packaging, private label, or white-label product without a branding surcharge at container-load quantities.</p>
  </div>
</section>
<section style="background:#f7f9fc;padding:52px 5%">
  <div style="max-width:760px;margin:0 auto">
    <div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#b91c1c;margin-bottom:6px">Also See</div>
    <h2 style="font-size:clamp(1.35rem,2.5vw,1.9rem);font-weight:800;color:#0a2540;margin-bottom:16px">Related Pages</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:11px">
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:13px 16px"><a href="/haccp-color-coded-lugs/" style="color:#b91c1c;font-weight:600;font-size:.88rem">HACCP Color-Coded Lugs</a><p style="font-size:.8rem;color:#6b7a8d;margin:3px 0 0">5-color system for food safety</p></div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:13px 16px"><a href="/meat-lug-sizes/" style="color:#b91c1c;font-weight:600;font-size:.88rem">Meat Lug Sizes</a><p style="font-size:.8rem;color:#6b7a8d;margin:3px 0 0">8 to 55 gallon guide</p></div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:13px 16px"><a href="/food-grade-meat-containers/" style="color:#b91c1c;font-weight:600;font-size:.88rem">Food-Grade Containers</a><p style="font-size:.8rem;color:#6b7a8d;margin:3px 0 0">FDA compliance guide</p></div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:13px 16px"><a href="https://elipacko.com/pp-meat-lugs/" style="color:#b91c1c;font-weight:600;font-size:.88rem">Elipacko Meat Lugs</a><p style="font-size:.8rem;color:#6b7a8d;margin:3px 0 0">Full product page</p></div>
    </div>
  </div>
</section>""",
      "faqs": [
        ("What is the minimum order for wholesale meat lugs?", "One 40HQ container from Elipacko. Depending on size, that's 400–800 units. Production is 3 days; sea freight to US West Coast is 14–21 days."),
        ("Can I mix sizes in one wholesale container order?", "Yes. Elipacko can produce multiple sizes in one container order as long as each size meets a minimum production run. Contact Elipacko for specifics — mixed-size containers are common for distributors stocking multiple sizes."),
        ("Are wholesale meat lugs available with private label?", "Yes. Custom branding, private label, and white-label meat lugs are available at container-load quantities. Elipacko can print your logo, brand name, or food safety markings directly on the lug surface."),
        ("What documentation comes with wholesale orders?", "Standard wholesale orders include: packing list, commercial invoice, bill of lading, material safety data sheet, FDA 21 CFR 177.1520 compliance statement. Additional documentation (third-party testing, COA) available on request."),
        ("How long does a wholesale meat lug order take to arrive?", "3 days production + 14–21 days ocean freight to US West Coast. East Coast ports add 7–10 days. Total lead time from order to delivery: 3–5 weeks."),
      ]
    },
    "haccp-color-coded-lugs": {
      "title": "HACCP Color-Coded Meat Lugs",
      "h1": "HACCP Color-Coded Meat Lugs — 5-Color Food Safety System",
      "intro": "PP meat lugs in 5 HACCP colors for cross-contamination prevention in meat and poultry processing. Red, yellow, blue, white, green — food-grade pigments stable through hundreds of washdown cycles.",
      "sections": f"""
<section style="background:#fff;padding:52px 5%">
  <div style="max-width:1100px;margin:0 auto">
    <h2 style="font-size:clamp(1.35rem,2.5vw,1.9rem);font-weight:800;color:#0a2540;margin-bottom:12px">HACCP Color-Coding — How It Works</h2>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">HACCP (Hazard Analysis Critical Control Point) color-coding assigns a specific color to each protein type or processing zone in a meat facility. When every container, utensil, and surface in a zone matches a single color, visual inspection becomes the primary cross-contamination control. Workers don't need to read labels; they just see the wrong color and know the problem immediately.</p>
    <table style="width:100%;border-collapse:collapse;font-size:.87rem;margin:18px 0">
      <tr style="background:#0a2540;color:#fff"><th style="padding:10px 13px;text-align:left">Color</th><th style="padding:10px 13px;text-align:left">Protein / Zone</th><th style="padding:10px 13px;text-align:left">Regulatory Basis</th></tr>
      <tr><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0"><strong style="color:#dc2626">Red</strong></td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">Raw red meat (beef, pork, lamb, veal)</td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">USDA FSIS HACCP, SQF, BRC, FSSC 22000</td></tr>
      <tr style="background:#f7f9fc"><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0"><strong style="color:#d97706">Yellow</strong></td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">Raw poultry (chicken, turkey, duck)</td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">USDA FSIS, USDA APHIS, SQF</td></tr>
      <tr><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0"><strong style="color:#2563eb">Blue</strong></td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">Fish and seafood</td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">FDA HACCP (21 CFR Part 123)</td></tr>
      <tr style="background:#f7f9fc"><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0"><strong>White</strong></td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">Cooked / ready-to-eat product</td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">USDA FSIS RTE product handling rules</td></tr>
      <tr><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0"><strong style="color:#16a34a">Green</strong></td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">Produce, by-products, non-meat</td><td style="padding:9px 13px;border-bottom:1px solid #e2e8f0">Facility HACCP plan (varies)</td></tr>
    </table>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:16px 0">
      <img src="{CDN}/meat-lug-white-empty.jpg" alt="White HACCP meat lug RTE zone — meatlugs.com" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0" loading="lazy">
      <img src="{CDN}/meat-lug-5color-set.jpg" alt="HACCP 5-color PP meat lug set — meatlugs.com" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0" loading="lazy">
      <img src="{CDN}/meat-lug-filled-meat.jpg" alt="Red HACCP meat lug raw red meat zone — meatlugs.com" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0" loading="lazy">
    </div>
    <h3 style="font-size:1.02rem;font-weight:700;color:#0a2540;margin:24px 0 10px">Why Elipacko's PP Pigments Are Food-Safety Compliant</h3>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">Food-grade PP pigments used by Elipacko are stable through the washdown chemicals used in USDA-inspected facilities: quaternary ammonium compounds (QACs), peracetic acid (PAA), chlorinated alkaline solutions. The color doesn't fade or migrate into food contact surfaces under repeated exposure. This stability is critical for HACCP audit evidence — an auditor checking your color-coding system needs to see consistent, unambiguous color after years of use.</p>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">Non-food-grade pigments in cheaper PP containers can leach color under aggressive washdown, creating two problems: the container color becomes ambiguous (defeating the HACCP purpose) and the migrating pigment creates a potential food contact contamination issue.</p>
    <h3 style="font-size:1.02rem;font-weight:700;color:#0a2540;margin:24px 0 10px">Custom Color Schemes</h3>
    <p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">Elipacko can produce PP meat lugs in any Pantone color. If your facility uses a non-standard HACCP color assignment or needs an additional color to differentiate a specific processing zone, custom colors are available at no tooling cost on container-load orders.</p>
  </div>
</section>""",
      "faqs": [
        ("What HACCP color should I use for raw beef?", "The standard HACCP color for raw red meat (beef, pork, lamb) is red. This is consistent with USDA FSIS HACCP guidelines and the most widely adopted food manufacturing standards (SQF, BRC, FSSC 22000)."),
        ("Are Elipacko HACCP meat lug colors stable through washdown?", "Yes. Elipacko uses food-grade PP pigments rated for repeated QAC, PAA, and chlorinated alkaline washdown at concentrations used in USDA facilities. Colors remain consistent through hundreds of cycles."),
        ("Can I get custom colors outside the standard 5?", "Yes. Any Pantone color is available at container-load quantities. No custom tooling cost for color — Elipacko blends pigments to match your specification."),
        ("Do HACCP color-coded lugs cost more than single-color?", "Elipacko charges the same per-unit price for standard HACCP colors (red, yellow, blue, white, green) as single-color white. Custom Pantone colors may carry a small premium for pigment blending."),
        ("What standards require HACCP color-coding?", "USDA FSIS HACCP regulations, SQF Level 2+, BRC Food Safety Standard, FSSC 22000, and most major retailer audit programs (Costco, Walmart, etc.) require or strongly encourage HACCP color-coding as a cross-contamination control measure."),
      ]
    }
  }
},

}  # End CONTENT dict

def get_nav_html(html):
    """Extract existing nav block from page"""
    nav_match = re.search(r'<nav.*?</nav>', html, re.DOTALL)
    return nav_match.group(0) if nav_match else ""

def get_footer_html(html):
    footer_match = re.search(r'<footer.*?</footer>', html, re.DOTALL)
    return footer_match.group(0) if footer_match else ""

def upgrade_subpage(site, page, data):
    path = f"{BASE}/{site}/{page}/index.html"
    if not os.path.exists(path):
        print(f"  SKIP (not found): {path}")
        return
    
    html = read_page(path)
    color = CONTENT[site]["color"]
    
    # Get existing nav and footer
    nav = get_nav_html(html)
    footer = get_footer_html(html)
    
    # Get head (up to </head>)
    head_end = html.find('</head>') + len('</head>')
    head = html[:head_end]
    
    # Inject FAQ schema into head
    faq_script = f'<script type="application/ld+json">{faq_json(data["faqs"])}</script>\n</head>'
    head = head.replace('</head>', faq_script)
    
    # Build new page
    body_content = inject_deep_content(html, data["title"], data["h1"], data["intro"], data["sections"], data["faqs"], color)
    
    # Reconstruct: head + body_content (which already has nav/footer from original)
    # Find body open tag
    body_start = html.find('<body>') + len('<body>')
    result = head + '<body>' + inject_deep_content(html[body_start:], data["title"], data["h1"], data["intro"], data["sections"], data["faqs"], color)
    
    with open(path, "w") as f:
        f.write(result)
    words = len(result.split())
    print(f"  ✓ {page} — ~{words} words")

# Run upgrades
for site, site_data in CONTENT.items():
    print(f"\n{site}:")
    for page, page_data in site_data["pages"].items():
        upgrade_subpage(site, page, page_data)

print("\nDone. (2 pages upgraded as test — expanding to all sites next)")
