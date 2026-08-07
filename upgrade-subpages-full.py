#!/usr/bin/env python3
"""Full subpage upgrade — all remaining subpages across all 15 sites"""
import os, json, re

BASE = "/home/ubuntu/.openclaw/workspace/elipacko-sites"
CDN = "https://brazenproducts.github.io/elipacko-assets"

def faq_json(faqs):
    return json.dumps({"@context":"https://schema.org","@type":"FAQPage",
        "mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in faqs]})

def section(bg, inner, max_w="1100px"):
    return f'<section style="background:{bg};padding:52px 5%"><div style="max-width:{max_w};margin:0 auto">{inner}</div></section>'

def lbl(text, color):
    return f'<div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:{color};margin-bottom:6px">{text}</div>'

def h2(text):
    return f'<h2 style="font-size:clamp(1.35rem,2.5vw,1.9rem);font-weight:800;color:#0a2540;margin-bottom:12px;scroll-margin-top:76px">{text}</h2>'

def h3(text):
    return f'<h3 style="font-size:1.02rem;font-weight:700;color:#0a2540;margin:22px 0 9px">{text}</h3>'

def p(text):
    return f'<p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">{text}</p>'

def ul(*items):
    lis = "".join(f"<li style='margin-bottom:4px'>{i}</li>" for i in items)
    return f'<ul style="padding-left:20px;color:#374151;font-size:.96rem;line-height:1.88;margin-bottom:14px">{lis}</ul>'

def table(headers, rows):
    ths = "".join(f'<th style="padding:10px 13px;text-align:left;font-weight:600">{h}</th>' for h in headers)
    trs = ""
    for i,row in enumerate(rows):
        bg = "background:#f7f9fc;" if i%2 else ""
        tds = "".join(f'<td style="padding:9px 13px;border-bottom:1px solid #e2e8f0;{bg}">{c}</td>' for c in row)
        trs += f"<tr>{tds}</tr>"
    return f'<table style="width:100%;border-collapse:collapse;font-size:.87rem;margin:18px 0"><tr style="background:#0a2540;color:#fff">{ths}</tr>{trs}</table>'

def infobox(text):
    return f'<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px 18px;margin:18px 0"><p style="margin:0;font-size:.92rem;color:#0c4a6e">{text}</p></div>'

def notebox(text):
    return f'<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px 18px;margin:18px 0"><p style="margin:0;font-size:.92rem;color:#9a3412">{text}</p></div>'

def photos(*items):  # items = (url, alt) pairs
    imgs = "".join(f'<img src="{u}" alt="{a}" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0" loading="lazy">' for u,a in items)
    cols = min(len(items), 3)
    return f'<div style="display:grid;grid-template-columns:repeat({cols},1fr);gap:9px;margin:16px 0">{imgs}</div>'

def related(*items):  # items = (url, title, desc)
    cards = "".join(f'<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:13px 16px"><a href="{u}" style="color:var(--c2,#1a6bdb);font-weight:600;font-size:.88rem">{t}</a><p style="font-size:.8rem;color:#6b7a8d;margin:3px 0 0">{d}</p></div>' for u,t,d in items)
    return f'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:11px;margin-top:14px">{cards}</div>'

def build_subpage(site_dir, page_slug, color, color2, domain, page_title, meta_desc, h1_text, intro_text, sections_html, faqs, hero_photos_html=""):
    path = f"{BASE}/{site_dir}/{page_slug}/index.html"
    if not os.path.exists(path):
        os.makedirs(f"{BASE}/{site_dir}/{page_slug}", exist_ok=True)
    
    faq_items = "".join(f'''<div style="border-bottom:1px solid #e2e8f0;padding:18px 0">
      <h4 style="font-size:.95rem;font-weight:700;color:#0a2540;margin-bottom:8px">{q}</h4>
      <p style="color:#6b7a8d;font-size:.9rem;margin:0">{a}</p></div>''' for q,a in faqs)

    # Get subpages from dir for nav
    skip = {"e9c8f5a4b3d2c1a0f9e8d7c6b5a4e9c8.txt", "CNAME", "robots.txt", "sitemap.xml", "index.html"}
    try:
        sub_dirs = sorted([e for e in os.listdir(f"{BASE}/{site_dir}") 
                          if os.path.isdir(f"{BASE}/{site_dir}/{e}") and e not in skip])
    except:
        sub_dirs = []
    
    nav_links = '<a href="/">Home</a>'
    for sd in sub_dirs:
        name = sd.replace("-", " ").title()
        active = ' style="background:rgba(255,255,255,.2)"' if sd == page_slug else ''
        nav_links += f'<a href="/{sd}/"{active}>{name}</a>'
    nav_links += f'<a href="https://elipacko.com" target="_blank" rel="noopener" style="background:#fff;color:{color};padding:7px 16px;border-radius:6px;font-weight:700;font-size:.85rem">Get a Quote</a>'

    return f"""<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{page_title} | {domain}</title>
<meta name="description" content="{meta_desc[:155]}">
<link rel="canonical" href="https://{domain}/{page_slug}/">
<meta property="og:title" content="{page_title}">
<meta property="og:description" content="{meta_desc[:155]}">
<meta property="og:image" content="{CDN}/meat-lug-white-empty.jpg">
<meta property="og:url" content="https://{domain}/{page_slug}/">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{faq_json(faqs)}</script>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}body{{font-family:'Segoe UI',system-ui,sans-serif;color:#1a2332;line-height:1.65;background:#fff}}a{{text-decoration:none}}
nav{{background:{color};padding:12px 5%;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;position:sticky;top:0;z-index:100}}
.nb{{color:#fff;font-weight:800;font-size:1.05rem}}
.nl{{display:flex;flex-wrap:wrap;gap:3px;align-items:center}}
.nl a{{color:rgba(255,255,255,.85);padding:5px 9px;font-size:.78rem;font-weight:500;border-radius:4px;white-space:nowrap}}
.nl a:hover{{background:rgba(255,255,255,.15)}}
@media(max-width:600px){{nav{{flex-direction:column;align-items:flex-start}}}}
</style>
</head>
<body>
<nav><span class="nb">{domain}</span><div class="nl">{nav_links}</div></nav>

<div style="background:#f7f9fc;padding:10px 5%;font-size:.82rem;color:#6b7a8d">
  <a href="/" style="color:{color2}">Home</a> › {page_title}
</div>

<section style="background:linear-gradient(135deg,{color},{color}ee);color:#fff;padding:52px 5%">
  <div style="max-width:1100px;margin:0 auto">
    <div style="display:inline-block;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:20px;padding:5px 14px;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px">Sourcing Guide</div>
    <h1 style="font-size:clamp(1.6rem,3.2vw,2.4rem);font-weight:800;line-height:1.18;max-width:700px;margin-bottom:12px">{h1_text}</h1>
    <p style="color:rgba(255,255,255,.88);font-size:.98rem;max-width:550px;margin-bottom:22px">{intro_text}</p>
    <a href="https://elipacko.com" style="background:#fff;color:{color};padding:11px 24px;border-radius:6px;font-weight:700;font-size:.9rem;display:inline-block">Get a Quote from Elipacko →</a>
  </div>
</section>

<section style="background:#fff;padding:28px 5% 8px">
  <div style="max-width:1100px;margin:0 auto">
    {hero_photos_html}
  </div>
</section>

{sections_html}

<section style="background:#f7f9fc;padding:48px 5%">
  <div style="max-width:1100px;margin:0 auto">
    <div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:{color2};margin-bottom:6px">FAQ</div>
    <h2 style="font-size:clamp(1.35rem,2.5vw,1.9rem);font-weight:800;color:#0a2540;margin-bottom:20px">Frequently Asked Questions</h2>
    {faq_items}
  </div>
</section>

<div style="background:{color};padding:44px 5%;text-align:center;color:#fff">
  <h2 style="color:#fff;font-size:clamp(1.3rem,2.2vw,1.8rem);margin-bottom:8px">{page_title} — Wholesale from Elipacko</h2>
  <p style="color:rgba(255,255,255,.88);margin-bottom:20px">Factory direct. 0% anti-dumping duty entering the USA.</p>
  <a href="https://elipacko.com" style="background:#fff;color:{color};padding:12px 28px;border-radius:6px;font-weight:700;display:inline-block">Request a Quote →</a>
</div>

<footer style="background:#0a2540;color:rgba(255,255,255,.6);padding:24px 5%;font-size:.81rem;text-align:center">
  <p>&copy; 2026 {domain} — <a href="/" style="color:rgba(255,255,255,.5)">Home</a> | <a href="/faq/" style="color:rgba(255,255,255,.5)">FAQ</a> | <a href="https://elipacko.com" rel="noopener" style="color:rgba(255,255,255,.5)">Elipacko.com</a></p>
</footer>
</body></html>"""


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MEATLUGS — remaining subpages
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MEATLUGS = [
  ("meat-lug-sizes", "Meat Lug Sizes — 8 to 55 Gallon Guide",
   "PP meat lug sizes from 8 to 55 gallon. Which size for your processing line — hand carry to forklift. Load ratings, birds per size, and ordering guide from Elipacko.",
   "Meat Lug Sizes — Which Size for Your Processing Line?",
   "Choosing the right meat lug size affects labor efficiency, line speed, and ergonomics. Too small means more trips; too large means manual handling injuries. Here's the full size guide.",
   f"""<section style="background:#fff;padding:52px 5%"><div style="max-width:1100px;margin:0 auto">
{h2("Meat Lug Size Guide — All Sizes")}
{table(["Size","Capacity","Max Load","Movement","Primary Use"],
  [["8-gallon","~60 lbs","80 lbs","Hand carry (1 person)","Retail trim, variety meats, small batch"],
   ["15-gallon","~120 lbs","160 lbs","Hand carry (2 person)","Deboning trim, grinding room line"],
   ["30-gallon","~200 lbs","280 lbs","Hand truck / pallet jack","Line trim, large batch grinding, offal"],
   ["55-gallon","~350 lbs","450 lbs","Forklift / pallet jack","High-volume offal, fat, bone, rendering"]])}
{infobox("<strong>Ergonomics rule of thumb:</strong> Any lug regularly lifted by a single operative should weigh under 50 lbs loaded. 8-gallon lugs at full load (60–80 lbs) are borderline — consider 50% fill protocols or 2-person movement for regulatory compliance with OSHA ergonomic guidelines.")}
{h3("8-Gallon Meat Lugs")}
{p("The 8-gallon lug is the workhorse of retail butcher shops, small abattoirs, and specialty processors. Light enough for a single person to carry full (at conservative fill), stackable 6+ high empty. Used for whole-muscle trim, variety meats (liver, heart, kidney), and small-batch grinding. The 8-gallon is the most economical unit and packs the most units per container load.")}
{h3("15-Gallon Meat Lugs")}
{p("The 15-gallon is the standard production lug for commercial deboning lines. Two-person carry at full load; easily moved empty by one person. Fits standard pallet jack movement when stacked. This is Elipacko's highest-volume size — if you're not sure which size to start with, 15-gallon is the right answer for most commercial processors.")}
{h3("30-Gallon Meat Lugs")}
{p("The 30-gallon lug moves by pallet jack or hand truck. Standard for large-volume trim collection, grinding room accumulation, and offal under medium-volume evisceration lines. Drain plug is standard on 30-gallon and larger — melt water and processing liquids drain without tipping the lug.")}
{h3("55-Gallon Meat Lugs")}
{p("The 55-gallon is a forklift-moved bulk container for the highest-volume applications: large evisceration lines, rendering collection, fat and bone accumulation. At 450-lb maximum load, this is not a hand-carry container. Forklift pockets or pallet compatibility is standard on Elipacko 55-gallon.")}
{photos((f"{CDN}/meat-lug-white-empty.jpg","8-gallon PP meat lug white — meatlugs.com"),(f"{CDN}/meat-lug-5color-set.jpg","PP meat lugs all sizes HACCP — meatlugs.com"),(f"{CDN}/meat-lug-filled-meat.jpg","PP meat lug 15-gallon filled — meatlugs.com"))}
</div></section>
<section style="background:#f7f9fc;padding:52px 5%"><div style="max-width:760px;margin:0 auto">
{h3("Nesting Ratio — Storage and Return Logistics")}
{p("All Elipacko meat lugs nest 3:1 empty. Three clean, empty lugs take the storage footprint of one loaded lug. For a 500-lug operation, this means empty return transport requires about 170 units worth of space — cutting return freight costs by 66% vs non-nesting containers.")}
{h3("Custom Sizes")}
{p("Custom dimensions are available on container-load orders. If you need a non-standard height, width, or capacity, Elipacko can quote custom tooling and advise on amortization at your expected order volume.")}
</div></section>""",
   [("Which meat lug size should I start with?","15-gallon is the standard starting point for commercial processors. It handles most trim and deboning line applications with a two-person carry at full load. 8-gallon for retail or specialty; 30-gallon or 55-gallon if you're running high-volume central kill operations."),
    ("What is the weight limit for single-person carry?","OSHA ergonomic guidelines recommend 50 lbs max for regular single-person lifts. The 8-gallon lug at 60–80 lbs full load is borderline — most facilities use 50% fill protocols for single-person carry, or 2-person handling."),
    ("Do 30-gallon and 55-gallon lugs come with drain plugs?","Yes. Drain plugs are standard on 30-gallon and 55-gallon Elipacko meat lugs. Smaller sizes have drain plugs as an optional add-on."),
    ("Can different sizes be mixed in one container order?","Yes. Elipacko can produce multiple sizes in one 40HQ container order as long as each size meets a minimum production run. Contact Elipacko with your size breakdown for exact container configuration."),
    ("What is the nesting ratio for empty meat lugs?","All Elipacko meat lugs nest 3:1 empty — three empty lugs take the space of one loaded lug. This reduces empty storage and return freight costs by approximately 66%.")]
  ),
  ("food-grade-meat-containers", "Food-Grade Meat Containers — FDA Compliance Guide",
   "PP food-grade meat containers for USDA and FDA regulated facilities. FDA 21 CFR 177.1520 compliant, BPA-free, compatible with HACCP sanitization programs.",
   "Food-Grade Meat Containers — What FDA Compliance Actually Means",
   "Not all PP containers are food-grade. Here's what the FDA classification actually requires and how Elipacko meat lugs meet it.",
   f"""<section style="background:#fff;padding:52px 5%"><div style="max-width:1100px;margin:0 auto">
{h2("What Does 'Food-Grade PP' Actually Mean?")}
{p("Food-grade polypropylene must comply with FDA 21 CFR 177.1520 — the regulation governing olefin polymer materials in food contact applications. This regulation sets restrictions on additives, stabilizers, and processing aids used in the PP formulation. Not all PP is food-grade: industrial-grade PP may use additives not cleared for food contact.")}
{table(["Property","Non-Food-Grade PP","Food-Grade PP (FDA 21 CFR 177.1520)"],
  [["Additives","Industrial stabilizers, no restriction","Only FDA-cleared additives"],
   ["Pigments","Any industrial pigment","Food-grade pigments only"],
   ["Documentation","None required","Compliance statement available"],
   ["BPA content","None (PP is BPA-free)","None (PP is BPA-free)"],
   ["Suitable for USDA/FDA facilities","No","Yes"]])}
{p("Elipacko meat lugs are produced from PP formulations complying with FDA 21 CFR 177.1520. Compliance documentation is available on request for USDA and FDA audit purposes.")}
{h3("BPA-Free")}
{p("Polypropylene is inherently BPA-free — BPA is associated with polycarbonate and epoxy resins, not PP. Elipacko meat lugs contain no BPA, phthalates, or other plasticizers restricted under FDA food contact regulations.")}
{h3("Sanitizer Compatibility")}
{table(["Sanitizer","Compatibility","Concentration"],
  [["Quaternary ammonium compounds (QAC)","✅ Compatible","Up to USDA no-rinse concentration"],
   ["Peracetic acid (PAA)","✅ Compatible","Up to 400 ppm"],
   ["Sodium hypochlorite (bleach)","✅ Compatible","Up to 200 ppm food-contact"],
   ["Hydrogen peroxide","✅ Compatible","Up to 6% solution"],
   ["Caustic (NaOH)","✅ Compatible","Up to 3% solution"],
   ["Hot water (180°F)","✅ Compatible","Full CIP cycle"]])}
{infobox("<strong>Third-party testing:</strong> Elipacko can provide third-party migration testing results for specific applications (e.g., fatty food contact, acidic food contact) on request. Testing to EU No 10/2011 migration standards is available for export compliance.")}
{photos((f"{CDN}/meat-lug-white-empty.jpg","Food-grade PP meat container white FDA — meatlugs.com"),(f"{CDN}/meat-lug-5color-set.jpg","Food-grade PP HACCP meat lugs — meatlugs.com"))}
</div></section>""",
   [("What regulation covers food-grade PP?","FDA 21 CFR 177.1520 — 'Olefin polymers' — is the primary US regulation for food-grade polypropylene. It sets restrictions on additives, stabilizers, and processing aids that can be used in PP formulations intended for food contact."),
    ("Are PP meat lugs BPA-free?","Yes. Polypropylene is a different resin from polycarbonate and epoxy resins, which are associated with BPA. PP contains no BPA, phthalates, or restricted plasticizers."),
    ("Can I get FDA compliance documentation for Elipacko lugs?","Yes. Elipacko provides FDA 21 CFR 177.1520 compliance statements on request. For US USDA or FDA facility audits, this documentation is included with your order."),
    ("Are Elipacko meat lugs suitable for USDA-inspected plants?","Yes. Food-grade PP, HACCP color-coding capability, and hot washdown compatibility make Elipacko meat lugs suitable for use in USDA FSIS-inspected establishments."),
    ("What temperature can food-grade PP meat lugs handle?","Copolymer PP is rated from −20°F (blast freeze) to 180°F (hot washdown). This covers the full USDA meat processing thermal range.")]
  ),
  ("plastic-meat-lugs", "Plastic Meat Lugs — PP vs HDPE vs Stainless Comparison",
   "Plastic meat lugs comparison: PP vs HDPE vs stainless steel. Which material for your temperature range, budget, and application? Full spec comparison from Elipacko.",
   "Plastic Meat Lugs — PP vs HDPE vs Stainless Steel",
   "Three main materials for meat processing containers — each with different strengths. Here's how to choose based on your actual requirements.",
   f"""<section style="background:#fff;padding:52px 5%"><div style="max-width:1100px;margin:0 auto">
{h2("PP vs HDPE vs Stainless — Full Comparison")}
{table(["Property","PP Copolymer","HDPE","Stainless Steel 304"],
  [["Hot washdown (180°F)","✅ Yes","❌ 110°F max","✅ Yes"],
   ["Blast freeze (−20°F)","✅ Yes","✅ Yes","✅ Yes"],
   ["Weight (15-gal empty)","~5 lbs","~6 lbs","~25 lbs"],
   ["Unit cost (wholesale)","$12–$18","$15–$22","$80–$200"],
   ["Impact resistance","Good","Very good","Excellent"],
   ["Dent/deform","No","No","Yes (dents)"],
   ["Color-coding","Any color","Any color","No (silver only)"],
   ["HACCP visual ID","✅ Yes","✅ Yes","❌ No"],
   ["Service life","15–20 years","15–20 years","20–30+ years"],
   ["Recyclable","✅ PP #5","✅ HDPE #2","✅ Scrap metal"],
   ["Anti-dump duty (USA)","0%","0%","25% (Section 301)"]])}
{h3("When to Choose PP")}
{p("PP copolymer is the right choice when: you need hot washdown capability (180°F CIP), you want HACCP color-coding for visual food safety, your budget targets the lowest total cost of ownership, or you're buying at wholesale quantities where per-unit cost matters. PP covers 90% of commercial meat processing lug applications.")}
{h3("When to Choose HDPE")}
{p("HDPE is appropriate for cold-only applications where you don't need hot CIP sanitation — cold brine, frozen product staging, refrigerated storage. HDPE is slightly more impact-resistant than PP but cannot handle the 180°F hot washdown standard in most USDA-inspected facilities. At similar pricing, PP's wider thermal range makes it the better default choice for versatile processing environments.")}
{h3("When to Choose Stainless Steel")}
{p("Stainless steel is the right choice for fixed tanks, large vessels, and applications with extreme chemical exposure or physical abuse that would damage plastic. For mobile processing lugs that operatives handle dozens of times per shift, stainless is 5–8× heavier than PP — creating ergonomic risks and increasing fatigue. Most modern USDA facilities that switched from stainless lugs to PP report significant ergonomic improvements.")}
{notebox("<strong>Anti-dumping duty note:</strong> Stainless steel containers from China are subject to 25% Section 301 tariffs. PP corrugated meat lugs have 0% anti-dumping duty — a significant landed cost difference at volume.")}
{photos((f"{CDN}/meat-lug-white-empty.jpg","Plastic PP meat lug vs stainless — meatlugs.com"),(f"{CDN}/meat-lug-5color-set.jpg","PP plastic meat lugs all colors — meatlugs.com"),(f"{CDN}/meat-lug-filled-meat.jpg","Plastic meat lug in use processing — meatlugs.com"))}
</div></section>""",
   [("Is PP or HDPE better for meat processing lugs?","PP copolymer is better for most meat processing applications because it handles 180°F hot washdown that HDPE cannot. HDPE is limited to ~110°F, which fails at standard CIP/hot-washdown temperatures used in USDA-inspected plants."),
    ("Why are PP meat lugs better than stainless?","For mobile processing lugs, PP is 5–8× lighter than stainless steel, costing 80–90% less per unit, with equal food safety when food-grade PP is specified. Stainless remains appropriate for fixed tanks and very high-abuse environments."),
    ("What is the anti-dumping duty on plastic meat lugs from China?","PP corrugated plastic meat lugs from China are not subject to US anti-dumping duties — 0% ADD. Stainless steel containers are subject to 25% Section 301 tariffs."),
    ("How long do PP plastic meat lugs last?","15–20 years typical service life in commercial processing environments. The limiting factor is usually physical damage from forklift contact or high-temperature abuse, not material degradation."),
    ("Can plastic meat lugs go in a blast freezer?","Yes — PP copolymer is rated to −20°F. HDPE also handles blast freeze. Neither deform or crack at blast-freeze temperatures under normal loading.")]
  ),
  ("meat-processing-tubs", "Meat Processing Tubs — Abattoir and Plant Applications",
   "PP meat processing tubs for abattoirs, deboning rooms, grinding, and cold chain. USDA-facility compatible, HACCP color-coded, food-grade PP. Wholesale from Elipacko.",
   "Meat Processing Tubs — Applications Throughout the Plant",
   "From kill floor to cold chain, PP processing tubs move product through every stage. Here's how they're used and specified for each application.",
   f"""<section style="background:#fff;padding:52px 5%"><div style="max-width:1100px;margin:0 auto">
{h2("Meat Processing Tub Applications by Department")}
{table(["Department","Tub Application","Size","Color Code"],
  [["Kill floor / stunroom","Blood and offal collection","30–55 gallon","Yellow"],
   ["Evisceration line","Offal, GI tract, trim","30–55 gallon","Yellow/Red"],
   ["Deboning room","Trim collection at each station","15 gallon","Red"],
   ["Grinding room","Trim accumulation, batch staging","30 gallon","Red"],
   ["Cold chain / chiller","Product staging, temperature hold","15–30 gallon","White/Red"],
   ["Blast freeze input","Pre-freeze product batching","30 gallon","White"],
   ["Packaging line","Trim, rework, overweight","8–15 gallon","Red/White"],
   ["Rendering staging","Fat, bone, trim for rendering","55 gallon","Green/Yellow"],
   ["Ready-to-eat zone","Post-cook, post-pasteurization","8–15 gallon","White"]])}
{h3("Kill Floor / Stunroom")}
{p("At the point of harvest, 30-gallon and 55-gallon PP tubs collect blood, primary offal, and initial trim. The non-porous PP surface is critical here — blood contains biohazard contamination that must be fully removed in sanitation. PP achieves complete surface decontamination with approved disinfectants. Drain plugs are essential at this stage.")}
{h3("Deboning Room")}
{p("The deboning room is the highest-density lug-use area in most plants. Each deboning station operates with 2–4 lugs simultaneously: a collection lug for trim (red), a separate lug for bone (typically green or yellow), and a staging lug for portioned whole-muscle. 15-gallon is the standard size — hand-movable empty, two-person at full load.")}
{h3("Cold Chain and Blast Freeze")}
{p("PP copolymer's −20°F rating makes it the only plastic suitable for direct blast-freeze contact. Tubs go from the trim room into the blast chiller pre-loaded — the same container that held the room-temperature trim goes directly into the blast freeze without transfer. This reduces product handling (less contamination risk) and labor (less transfer time).")}
{infobox("<strong>HACCP color audit tip:</strong> US FSIS HACCP auditors verify that color-coding is implemented and followed consistently. Documented color assignment, visible container labeling, and matched tub colors in each zone provide audit evidence. Elipacko can provide containers with screen-printed color zone labels on request.")}
{photos((f"{CDN}/meat-lug-white-empty.jpg","Meat processing tub white RTE zone — meatlugs.com"),(f"{CDN}/meat-lug-5color-set.jpg","Meat processing tubs HACCP all zones — meatlugs.com"),(f"{CDN}/meat-lug-filled-meat.jpg","Meat processing tub filled deboning room — meatlugs.com"))}
</div></section>""",
   [("What size meat processing tub is standard for deboning?","15-gallon is the standard deboning room tub. It handles a reasonable trim accumulation before movement, is two-person carry at full load, and stacks efficiently on pallets for cold chain movement."),
    ("Can PP meat processing tubs go directly into blast freeze?","Yes. PP copolymer is rated to −20°F. Tubs loaded at room temperature can go directly into blast chillers without transfer."),
    ("What color tub should I use in a ready-to-eat zone?","White is the universal HACCP color for ready-to-eat and post-cook product. White containers in the RTE zone provide instant visual identification that prevents raw product from entering the cooked side."),
    ("How should meat processing tubs be cleaned between uses?","Standard protocol: dry debris removal → cold pre-soak → hot pressure wash (140–160°F) with approved detergent → approved disinfectant → final rinse → air dry inverted. PP achieves full log-reduction of meat pathogens with this protocol."),
    ("Are PP meat processing tubs compatible with automated wash tunnels?","Yes. PP tubs are compatible with standard automated conveyor wash tunnels operating at up to 180°F. Ensure tub dimensions match your wash tunnel conveyor width before ordering.")]
  ),
  ("buy-meat-lugs", "Buy Meat Lugs — How to Order PP Containers from Elipacko",
   "How to buy PP meat lugs wholesale from Elipacko. What to include in a quote request, container load counts, lead times, and what to expect from factory-direct ordering.",
   "Buy Meat Lugs — Complete Ordering Guide",
   "Everything you need to know to place a wholesale meat lug order with Elipacko — from quote request to delivery.",
   f"""<section style="background:#fff;padding:52px 5%"><div style="max-width:760px;margin:0 auto">
{h2("Step-by-Step: How to Buy Meat Lugs from Elipacko")}
{p("Buying direct from Elipacko is straightforward. There are no intermediaries, no catalog to navigate, and no minimum dollar value — just a container-unit minimum. Here's how the process works from first contact to delivery.")}
<ol style="padding-left:20px;color:#374151;font-size:.96rem;line-height:2;margin-bottom:14px">
  <li><strong>Submit a quote request</strong> at <a href="https://elipacko.com/pp-meat-lugs/" style="color:#b91c1c">elipacko.com/pp-meat-lugs</a></li>
  <li><strong>Receive a CIF quote</strong> within 24 hours — includes unit price, freight, and container count</li>
  <li><strong>Approve spec and price</strong> — confirm size, color, drain plug, quantity</li>
  <li><strong>Production: 3 days</strong> from order confirmation</li>
  <li><strong>Container loading and export</strong> — Elipacko handles all export documentation</li>
  <li><strong>Ocean freight: 14–21 days</strong> to US West Coast ports</li>
  <li><strong>Customs clearance</strong> — your customs broker handles import; Elipacko provides HS code and documentation</li>
  <li><strong>Delivery</strong> to your port or door</li>
</ol>
{h3("What to Include in Your Quote Request")}
{ul(
  "Lug size: 8, 15, 30, or 55 gallon (or all four if you need multiple)",
  "Quantity: total units or total containers (one 40HQ minimum)",
  "Colors: white, red, yellow, blue, green, or custom Pantone",
  "Drain plug: yes or no (standard on 30-gal and 55-gal)",
  "Destination port: needed for freight calculation",
  "Documentation needed: FDA 21 CFR, COA, third-party test reports",
  "Custom print or branding requirements (if any)"
)}
{h3("Container Load Counts (Approximate)")}
{table(["Size","Units per 40HQ"],
  [["8-gallon","600–800"],["15-gallon","400–550"],["30-gallon","200–300"],["55-gallon","120–180"]])}
{h3("Total Lead Time")}
{p("3 days production + 14–21 days sea freight to US West Coast = 17–24 days total. East Coast or Gulf ports add 7–10 days. If you need faster delivery for an urgent restock, Elipacko can advise on air freight for smaller quantities.")}
{infobox("<strong>0% anti-dumping duty:</strong> PP corrugated meat lugs are not subject to US anti-dumping duties. Total landed cost = unit cost + ocean freight + standard import duty (typically 3.4% for PP articles). No ADD, no Section 301 surcharge.")}
{h3("Private Label and Custom Branding")}
{p("If you're buying for resale, Elipacko can produce private-label meat lugs with your brand, logo, or product marking screen-printed directly on the PP surface. Available at no tooling cost for standard sizes on container-load orders. Custom mold tooling available for unique shapes or sizes.")}
</div></section>""",
   [("What is the minimum order for PP meat lugs?","One 40HQ container from Elipacko. Depending on size, that's 120–800 units. There is no dollar minimum — just the container quantity minimum."),
    ("How long does delivery take?","3 days production + 14–21 days ocean freight to US West Coast. Total: 17–24 days. East Coast adds 7–10 days."),
    ("Is there a rush option?","Air freight is available for smaller quantities at a significant premium. For most volume orders, standard ocean freight is the only economical option. Plan 3–5 weeks for first container delivery."),
    ("Can I get a sample before ordering a container?","Contact Elipacko directly — sample availability depends on current production schedule. Some sizes have stock available; custom colors and sizes require production."),
    ("What import documentation is needed?","Your customs broker needs: commercial invoice, packing list, bill of lading, and HS code (3923.10 or 3923.90 for PP containers). Elipacko provides all standard export documentation.")]
  ),
]

# Write upgraded subpages for meatlugs
MEAT_PHOTOS = photos((f"{CDN}/meat-lug-white-empty.jpg","PP meat lug white empty — meatlugs.com"),(f"{CDN}/meat-lug-5color-set.jpg","PP meat lugs HACCP color set — meatlugs.com"),(f"{CDN}/meat-lug-filled-meat.jpg","PP meat lug filled in use — meatlugs.com"))
for page_slug, page_title, meta_desc, h1_text, intro_text, sections_html, faqs in MEATLUGS:
    html = build_subpage("meatlugs", page_slug, "#7f1d1d", "#b91c1c", "meatlugs.com",
                         page_title, meta_desc, h1_text, intro_text, sections_html, faqs, MEAT_PHOTOS)
    path = f"{BASE}/meatlugs/{page_slug}/index.html"
    os.makedirs(f"{BASE}/meatlugs/{page_slug}", exist_ok=True)
    with open(path, "w") as f: f.write(html)
    words = len(html.split())
    print(f"  ✓ meatlugs/{page_slug} — ~{words} words")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# GAYLORD SITES — shared subpage content for all 4 gaylord domains
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\nGaylord sites:")
GAYLORD_SITES = [
    ("plasticgaylord","plasticgaylord.com"),
    ("plasticgaylordbox","plasticgaylordbox.com"),
    ("plasticgaylordboxes","plasticgaylordboxes.com"),
    ("gaylordboxesplastic","gaylordboxesplastic.com"),
]

def gaylord_subpages(domain):
    return [
    ("pp-gaylord-boxes",
     "PP Gaylord Boxes — Reusable Bulk Containers | " + domain,
     "PP corrugated gaylord boxes: reusable 50+ cycles, 2,200 lb static load, no ISPM-15. Wholesale direct from Elipacko.",
     "PP Gaylord Boxes — Why Plastic Beats Cardboard at Scale",
     "At any meaningful volume, the economics of PP gaylord boxes vs single-use cardboard are decisive. Here's the full picture.",
     f"""<section style="background:#fff;padding:52px 5%"><div style="max-width:1100px;margin:0 auto">
{h2("PP Gaylord Box vs Cardboard — Cost Per Trip")}
{table(["Factor","Cardboard Gaylord","PP Gaylord Box"],
  [["Unit cost","$8–$15","$80–$140"],
   ["Reuse cycles","1 (single-use)","50+"],
   ["Cost per trip","$8–$15","$1.60–$2.80 amortized"],
   ["Waterproof","No — collapses wet","Yes — 100%"],
   ["ISPM-15 export","N/A","Not required"],
   ["Recyclable","Contaminated OCC","100% PP #5"],
   ["Mold in wet applications","Yes","No"],
   ["Break-even vs cardboard","—","20–25 trips (≈1–2 years)"]])}
{p(f"The break-even calculation is the key insight. A PP gaylord costing $100 vs $10 cardboard reaches break-even at trip 11. Every trip after trip 11, the PP gaylord operates at zero marginal container cost. For operations making 50 trips per year, the payback period is under 3 months.")}
{h3("Key PP Gaylord Specifications")}
{table(["Spec","Value"],
  [["Static load","2,200 lbs"],["Footprints","48×40, 45×48, 40×40 + custom"],["Wall thickness","4mm / 6mm / 8mm"],
   ["Temp range","−40°F to 140°F"],["Colors","White, black, blue, custom"],["Lid option","Matching PP lid"],["ISPM-15","Not required"],["Anti-dump duty","0%"],["MOQ","One 40HQ container"]])}
{photos((f"{CDN}/pp-gaylord-box-1.jpg",f"PP gaylord box white — {domain}"),(f"{CDN}/pp-gaylord-box-2.jpg",f"PP gaylord boxes stacked — {domain}"),(f"{CDN}/pp-gaylord-on-pallet-strapped.jpg",f"PP gaylord on pallet — {domain}"))}
{h3("No ISPM-15 — Export Without Fumigation")}
{p("ISPM-15 requires heat treatment or fumigation for wood packaging crossing international borders. PP corrugated is plastic — entirely exempt. Every shipment with PP gaylords saves $3–$8 per pallet vs wood in treatment costs and border delay time.")}
</div></section>""",
     [("How much does a PP gaylord box hold?","2,200 lbs static load. Actual fill weight depends on bulk density: grain 1,500–1,800 lbs, plastic resin 1,200–1,600 lbs, produce 400–900 lbs."),
      ("Do PP gaylords need ISPM-15?","No. PP is plastic — entirely exempt from ISPM-15 wood packaging requirements. No fumigation, no heat treatment, no phytosanitary certificate."),
      ("What wall thickness should I choose?","4mm for standard applications. 6mm for abrasive or heavy materials. 8mm for maximum load and repeated forklift impact."),
      ("Can PP gaylords be used in food applications?","Yes. Food-grade PP (FDA 21 CFR 177.1520) is available for direct food contact. Specify food-grade at quoting stage."),
      ("What is the MOQ?","One 40HQ container. 3 days production + 14–21 days ocean freight.")]
    ),
    ("reusable-gaylord-boxes",
     "Reusable Gaylord Boxes — PP vs Cardboard ROI | " + domain,
     "Reusable PP gaylord boxes that pay for themselves in 20 trips. 50+ reuse cycles vs single-use cardboard. Wholesale from Elipacko.",
     "Reusable Gaylord Boxes — Real ROI Numbers",
     "Single-use cardboard gaylords look cheap on the invoice. Here's what they actually cost vs reusable PP.",
     f"""<section style="background:#fff;padding:52px 5%"><div style="max-width:760px;margin:0 auto">
{h2("Real ROI: Reusable PP Gaylords vs Single-Use Cardboard")}
{p("The math on reusable gaylord boxes is simple and decisive. A single-use cardboard gaylord at $10 per unit, used 100 times per year, costs $1,000 per year in container purchases alone. A PP reusable gaylord at $100 used 100 times per year costs $100 to buy and $0 per use after that — the capital cost is recovered in the first year.")}
{table(["Scenario","Cardboard (100/yr × 5 yrs)","PP Gaylord (100/yr × 5 yrs)"],
  [["Container purchases","$5,000","$100 (one time)"],
   ["Disposal / recycling","$250–$500","$0 (returned to use)"],
   ["Storage empty","Minimal (flat pack)","Nests 3:1"],
   ["5-year total","$5,250–$5,500","~$100"],
   ["5-year savings","—","$5,150–$5,400 per gaylord"]])}
{infobox("At 500 gaylords in rotation, the 5-year savings vs cardboard exceeds <strong>$2.5 million</strong>. Even at 50 gaylords, the savings are over $250,000. The capital cost to switch is a fraction of that.")}
{h3("Where Reusable Gaylords Work Best")}
{ul("Closed-loop logistics (your product shipped in gaylords that return to you)","Distribution center staging — product moves from DC to store in reusable gaylords","In-plant bulk material handling — raw materials, intermediate product, bulk ingredients","Agricultural bulk containers — grain, seed, produce")}
{h3("Limitations of Reusable PP Gaylords")}
{p("Reusable gaylords don't work in one-way open-ended supply chains where you have no mechanism to recover the container. If your gaylords ship to customers who keep them, you need a deposit/return program or a single-use solution. PP gaylords are also not suited for extremely abrasive bulk materials (sharp metal parts, glass cullet) without the appropriate wall thickness specification.")}
{photos((f"{CDN}/pp-gaylord-on-pallet-lidded.jpg",f"Reusable PP gaylord with lid — {domain}"),(f"{CDN}/pp-gaylord-box-3.jpg",f"PP gaylord boxes reusable stacked — {domain}"))}
</div></section>""",
     [("How many times can PP gaylord boxes be reused?","50+ reuse cycles. In practice, PP gaylords last 5–10 years in continuous use. The limiting factor is usually physical damage from forklifts or falls, not material wear."),
      ("What is the break-even point vs cardboard?","At $100 PP vs $10 cardboard, break-even is 11 trips. Every trip after that is zero marginal container cost."),
      ("Can reusable gaylords be used open-loop (one-way)?","Technically yes, but the economics only work in closed-loop systems where you recover the gaylord. In one-way shipments, you'd need a deposit/return program."),
      ("What happens to PP gaylords at end of life?","PP gaylord boxes are 100% recyclable under resin code #5. At end of service life, the material enters the PP recycling stream."),
      ("Are reusable gaylords available in food-grade?","Yes. Food-grade PP (FDA 21 CFR 177.1520) for direct food contact applications. Specify food-grade at quoting stage.")]
    ),
    ("gaylord-box-dimensions",
     "Gaylord Box Dimensions — Standard Sizes and Custom | " + domain,
     "Gaylord box dimensions: 48×40, 45×48, 40×40 standard footprints. Heights 24\"-48\". Custom sizes available. PP and cardboard specifications.",
     "Gaylord Box Dimensions — Standard Footprints and Heights",
     "What are the standard gaylord box dimensions? Here's the full guide to footprints, heights, and when to choose custom.",
     f"""<section style="background:#fff;padding:52px 5%"><div style="max-width:1100px;margin:0 auto">
{h2("Standard Gaylord Dimensions")}
{table(["Footprint","Height Options","Pallet Compatibility","Common Application"],
  [["48×40 in","24 / 30 / 36 / 48 in","GMA pallet (standard)","Most common — bulk manufacturing, distribution"],
   ["45×48 in","24 / 30 / 36 in","European pallet compatible","Food grade, export"],
   ["40×40 in","24 / 30 / 36 in","Narrow aisle compatible","Small format distribution centers"],
   ["Custom","Any","Specify at order","Unique conveyor or racking dimensions"]])}
{h3("Which Dimension to Choose")}
{p("48×40 is the GMA standard and the most common US gaylord footprint. If your forklifts, racking, and pallets are all built to GMA standard, 48×40 is the default choice. 45×48 (or sometimes called 45×45) works better for European pallet systems or when you need a slightly wider opening. 40×40 fits narrow-aisle DC configurations.")}
{h3("Height Selection")}
{p("Height determines capacity. The same 48×40 footprint at 24 in holds approximately 25–30 cubic feet; at 48 in it holds 50–60 cubic feet. Choose height based on your target fill weight and the stack height of your forklifts — taller gaylords with heavier loads require higher lift capacity.")}
{table(["Height","Approx Capacity","Common Load"],
  [["24 in","25–30 cu ft","Light bulkgoods, small parts"],
   ["30 in","32–38 cu ft","Produce, grain, medium bulk"],
   ["36 in","38–46 cu ft","Heavy bulk, high-density materials"],
   ["48 in","50–60 cu ft","Maximum capacity, bulk storage"]])}
{photos((f"{CDN}/pp-gaylord-box-1.jpg",f"Gaylord box standard dimensions — {domain}"),(f"{CDN}/pp-gaylord-box-2.jpg",f"PP gaylord box 48x40 — {domain}"),(f"{CDN}/pp-gaylord-on-pallet-strapped.jpg",f"Gaylord box on pallet shipped — {domain}"))}
</div></section>""",
     [("What is the standard gaylord box size?","The most common US gaylord is 48×40 inches (matching a GMA standard pallet) in heights of 24–48 inches. 48×40×36 is the most common single configuration."),
      ("What is the inside dimension vs outside?","Wall thickness affects inside dimension. For 4mm PP corrugated, inside dimension is approximately 7mm less than outside on each wall. For a 48×40 gaylord: inside ≈ 47.4×39.4 in."),
      ("Can I get a custom gaylord size?","Yes. Elipacko produces custom footprints and heights on container-load orders. Custom tooling may apply for unique sizes."),
      ("How tall can a loaded gaylord stack?","Loaded PP gaylord boxes stack 2 high maximum. Empty gaylords nest 3–4 high."),
      ("What is the inside depth of a 36-inch gaylord?","36-inch height gaylords have approximately 34–35 in usable interior depth, depending on base flange design.")]
    ),
    ("heavy-duty-gaylord",
     "Heavy Duty Gaylord Boxes — 2,200 lb PP Containers | " + domain,
     "Heavy duty PP gaylord boxes rated to 2,200 lbs static. 8mm wall, forklift compatible, food-grade available. Wholesale from Elipacko.",
     "Heavy Duty Gaylord Boxes — 2,200 lb Rated PP Construction",
     "When standard corrugated gaylords fail under load, heavy-duty PP is the answer. 2,200 lb static rating, forklift compatible.",
     f"""<section style="background:#fff;padding:52px 5%"><div style="max-width:1100px;margin:0 auto">
{h2("Heavy Duty PP Gaylord Specifications")}
{table(["Spec","Standard PP (4mm)","Heavy Duty PP (8mm)"],
  [["Static load","1,200 lbs","2,200 lbs"],
   ["Wall thickness","4mm twin-wall","8mm twin-wall"],
   ["Forklift contact","Light contact only","Full forklift lip contact"],
   ["Abrasive materials","Light duty","Suitable"],
   ["Heavy aggregate","Not recommended","Suitable"],
   ["Cost premium","Base","+30–40%"],
   ["Weight","Lighter","Heavier (but still 5× lighter than steel)"]])}
{p("Heavy-duty PP gaylords with 8mm twin-wall construction are rated to 2,200 lbs static. This covers virtually all bulk material applications — high-density plastics, grain, metal parts (non-sharp), food ingredients, and agricultural bulk. The 8mm wall also provides significantly better forklift impact resistance.")}
{h3("Applications for Heavy-Duty PP Gaylords")}
{ul("Metal part distribution (non-sharp/non-abrasive)","High-density resin pellets","Food ingredient bulk (salt, sugar, flour, grain)","Heavy produce (potatoes, root vegetables, citrus)","Industrial bulk chemical containers (check chemical compatibility)")}
{notebox("<strong>Sharp metal or glass:</strong> Heavy-duty 8mm PP gaylords resist impact well but can be punctured by sharp sheet metal edges or glass cullet under load. For those specific applications, specify a lining or contact Elipacko for the appropriate wall construction.")}
{photos((f"{CDN}/pp-gaylord-box-1.jpg",f"Heavy duty PP gaylord box 2200lb — {domain}"),(f"{CDN}/pp-gaylord-on-pallet-strapped.jpg",f"Heavy duty gaylord on pallet — {domain}"))}
</div></section>""",
     [("What load can a heavy-duty PP gaylord hold?","2,200 lbs static load with 8mm twin-wall construction. This is the same static rating as most wood gaylords — except PP maintains that rating consistently over 50+ uses where wood degrades."),
      ("Can heavy-duty PP gaylords be used for metal parts?","Yes, for non-sharp metal parts. Sheet metal edges or sharp fabricated parts can puncture PP over time. For bulk castings, formed parts, or small hardware, 8mm PP is suitable."),
      ("What is the difference between 4mm and 8mm PP gaylords?","4mm handles 1,200 lbs static; 8mm handles 2,200 lbs. 8mm also provides better forklift impact resistance. Cost premium for 8mm is approximately 30–40% over 4mm."),
      ("Are heavy-duty PP gaylords still lighter than wood?","Yes. Even 8mm PP gaylord boxes are significantly lighter than equivalent wood constructions. The weight advantage of PP vs wood is maintained regardless of wall thickness."),
      ("Are heavy-duty PP gaylords food-grade?","Food-grade PP (FDA 21 CFR 177.1520) is available in 8mm construction. Specify food-grade at the quoting stage.")]
    ),
    ("gaylord-box-wholesale",
     "Gaylord Box Wholesale — Factory-Direct Pricing | " + domain,
     "Wholesale PP gaylord boxes direct from Elipacko. Container-load pricing, no distributor markup, 0% anti-dumping duty. How to order.",
     "Gaylord Box Wholesale — How Factory-Direct Pricing Works",
     "Cut out the distributor. Buy PP gaylord boxes direct from Elipacko at factory prices.",
     f"""<section style="background:#fff;padding:52px 5%"><div style="max-width:760px;margin:0 auto">
{h2("Why Buy Wholesale Gaylords Direct from Elipacko?")}
{p("US distributor pricing for PP gaylord boxes runs $120–$200+ per unit depending on size and specification. Elipacko factory-direct pricing at container-load quantities is $80–$140 per unit — a 30–50% cost reduction before freight.")}
{table(["Size","US Distributor","Elipacko Direct","Savings"],
  [["48×40×36 standard","$120–$150","$80–$100","30–40%"],
   ["48×40×48 tall","$150–$200","$95–$130","30–40%"],
   ["Custom size","$180–$250+","$90–$140","35–50%"]])}
{h3("What Wholesale Ordering Looks Like")}
{p("One 40HQ container holds approximately 200–300 standard gaylord boxes depending on configuration. At $90–$100 per unit, a container order is $18,000–$30,000 in product before freight. Ocean freight to US West Coast ports typically adds $3,500–$5,000 per container.")}
{infobox("<strong>0% anti-dumping duty:</strong> PP corrugated gaylords are not subject to US anti-dumping duties. Total landed cost = unit price + ocean freight + standard import duty (~3.4% for PP articles). No ADD, no Section 301.")}
{h3("How to Request a Wholesale Quote")}
{ul("Visit elipacko.com/pp-gaylord-boxes/","Specify: footprint (48×40, 45×48, or custom), height, wall thickness (4mm/6mm/8mm)","State quantity (containers or units)","Include destination port","Include any food-grade or custom print requirements")}
{h3("Lead Time")}
{p("3 days production + 14–21 days ocean freight to US West Coast = 17–24 days total. Plan 3–5 weeks for first delivery.")}
{photos((f"{CDN}/pp-gaylord-box-1.jpg",f"Wholesale PP gaylord boxes factory — {domain}"),(f"{CDN}/pp-gaylord-box-2.jpg",f"PP gaylord box wholesale pricing — {domain}"),(f"{CDN}/pp-gaylord-on-pallet-lidded.jpg",f"Wholesale gaylords lidded on pallet — {domain}"))}
</div></section>""",
     [("What is the MOQ for wholesale PP gaylords?","One 40HQ container — approximately 200–300 units at standard size. No dollar minimum."),
      ("How much does wholesale gaylord freight cost?","Approximately $3,500–$5,000 per 40HQ container to US West Coast ports. East Coast adds $1,000–$1,500."),
      ("How long does a wholesale gaylord order take?","3 days production + 14–21 days ocean freight = 17–24 days to US West Coast. Plan 3–5 weeks."),
      ("Can I mix sizes in one wholesale container?","Yes. Elipacko can produce multiple sizes in one container as long as each size meets a minimum production run."),
      ("Is private label available on wholesale gaylord orders?","Yes. Custom branding, print, and private label available at container-load quantities at no tooling cost for standard sizes.")]
    ),
    ("faq",
     "PP Gaylord Box FAQ | " + domain,
     "Frequently asked questions about PP gaylord boxes: sizes, load ratings, food grade, ISPM-15, ordering, and more.",
     "PP Gaylord Box — Frequently Asked Questions",
     "All the common questions about PP gaylord boxes answered in one place.",
     f"""<section style="background:#fff;padding:52px 5%"><div style="max-width:760px;margin:0 auto">
{h2("PP Gaylord Box — Complete FAQ")}
{photos((f"{CDN}/pp-gaylord-box-1.jpg",f"PP gaylord box FAQ — {domain}"),(f"{CDN}/pp-gaylord-on-pallet-strapped.jpg",f"PP gaylord on pallet FAQ — {domain}"),(f"{CDN}/pp-gaylord-on-pallet-lidded.jpg",f"PP gaylord with lid FAQ — {domain}"))}
</div></section>""",
     [("What is the load rating of a PP gaylord box?","2,200 lbs static at 8mm; 1,200 lbs at 4mm. Consistent across 50+ use cycles — PP doesn't fatigue like cardboard or wood."),
      ("Do PP gaylords need ISPM-15?","No. PP is plastic — entirely exempt from ISPM-15 wood packaging requirements."),
      ("What sizes does Elipacko make?","Standard: 48×40, 45×48, 40×40 footprints in 24/30/36/48 in heights. Custom dimensions available on container-load orders."),
      ("Are PP gaylords food-grade?","Food-grade PP (FDA 21 CFR 177.1520) is available. Specify at quoting stage."),
      ("How many fit in a container?","200–300 standard 48×40×36 gaylords per 40HQ. Exact count depends on configuration."),
      ("What is the anti-dumping duty?","0%. PP corrugated gaylords are not subject to US anti-dumping duties."),
      ("Can PP gaylords be used outdoors?","Yes. PP is UV-stable for short-term outdoor use. For extended outdoor storage, carbon-black UV-stabilized formulation is recommended — available from Elipacko on request."),
      ("Are lids available?","Yes. Matching PP corrugated lids are available for all standard footprints."),
      ("How long do PP gaylords last?","5–10 years in continuous commercial use. 50+ reuse cycles."),
      ("What does a PP gaylord weigh empty?","Approximately 15–25 lbs depending on size and wall thickness. Significantly lighter than equivalent wood.")]
    ),
]

GAYLORD_PHOTOS = photos((f"{CDN}/pp-gaylord-box-1.jpg","PP gaylord box white — wholesale"),(f"{CDN}/pp-gaylord-box-2.jpg","PP gaylord boxes stacked — Elipacko"),(f"{CDN}/pp-gaylord-on-pallet-strapped.jpg","PP gaylord on pallet strapped"))
def build_all_gaylord_subpages(site_dir, domain):
    for page_slug, page_title, meta_desc, h1_text, intro_text, sections_html, faqs in gaylord_subpages(domain):
        existing_path = f"{BASE}/{site_dir}/{page_slug}/index.html"
        html = build_subpage(site_dir, page_slug, "#1e3a5f", "#1a6bdb", domain,
                             page_title, meta_desc, h1_text, intro_text, sections_html, faqs, GAYLORD_PHOTOS)
        os.makedirs(f"{BASE}/{site_dir}/{page_slug}", exist_ok=True)
        with open(f"{BASE}/{site_dir}/{page_slug}/index.html", "w") as f: f.write(html)
        words = len(html.split())
        print(f"  ✓ {page_slug} — ~{words} words")

for site_dir, domain in GAYLORD_SITES:
    print(f"\n{domain}:")
    build_all_gaylord_subpages(site_dir, domain)

print("\n✓ Gaylords done")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PALLET SITES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PALLET_SITES = [("heavydutypallets","heavydutypallets.com"),("heavydutyplasticpallets","heavydutyplasticpallets.com")]

def pallet_subpages(domain):
    return [
    ("plastic-pallets-heavy-duty","Heavy Duty Plastic Pallets | "+domain,
     "Heavy duty PP plastic pallets: 10,000 lb static, food-safe, no ISPM-15, 0% anti-dumping. Wholesale from Elipacko.",
     "Heavy Duty Plastic Pallets — 10,000 lb Static Load Rated",
     "PP plastic pallets that outperform GMA wood on every specification that matters. Static load, food safety, ISPM-15 exemption.",
     f"""<section style="background:#fff;padding:52px 5%"><div style="max-width:1100px;margin:0 auto">
{h2("PP Plastic Pallet vs GMA Wood — Why Heavy Duty Plastic Wins")}
{table(["Property","GMA Wood (new)","PP Corrugated Plastic"],
  [["Static load","2,500 lbs","10,000+ lbs"],
   ["Dynamic (forklift)","2,200 lbs","4,400 lbs"],
   ["Moisture resistance","Warps / absorbs","100% waterproof"],
   ["Splinter/nail hazard","Yes","None"],
   ["ISPM-15","Required for export","Not required"],
   ["Food facility","Restricted in many","Approved"],
   ["Service life","1–2 years","10–15 years"],
   ["Anti-dump duty","0%","0%"]])}
{p("The 10,000 lb static load of PP corrugated pallets is 4× the new GMA wood rating — and GMA wood degrades rapidly after the first few trips. PP maintains its static rating consistently across 100–200 uses because PP doesn't fatigue, absorb moisture, or lose fastener integrity.")}
{photos((f"{CDN}/pp-pallet-heavy-duty.jpg",f"Heavy duty PP plastic pallet — {domain}"),(f"{CDN}/pp-pallet-heavy-duty-2.jpg",f"PP plastic pallet forklift — {domain}"),(f"{CDN}/pp-pallet-heavy-duty-3.jpg",f"Heavy duty plastic pallet stacked — {domain}"))}
{h3("Food Facility Compliance")}
{p("Most FDA and USDA food facilities have transitioned away from wood pallets due to wood's inability to be fully sanitized. PP plastic pallets are pressure-wash sanitizable, non-porous, and accepted in all FDA and USDA regulated facilities including FSMA-regulated warehouses.")}
</div></section>""",
     [("What load can a heavy duty plastic pallet hold?","PP corrugated plastic pallets: 10,000 lbs static, 4,400 lbs dynamic. Injection-molded PP: 2,200 lbs racking."),
      ("Are heavy duty plastic pallets ISPM-15 exempt?","Yes. PP is plastic — entirely exempt from ISPM-15 wood packaging treatment requirements."),
      ("Do heavy duty plastic pallets work in cold storage?","Yes. PP performs from −40°F to 140°F without deformation or moisture absorption."),
      ("Can plastic pallets replace GMA wood pallets?","Yes. PP plastic pallets use the same 48×40 GMA footprint with 4-way entry. Drop-in replacement for wood in most operations."),
      ("What is the MOQ for plastic pallets?","One 40HQ container from Elipacko. 3 days production + 14–21 days freight.")]
    ),
    ("pp-plastic-pallets","PP Plastic Pallets — Polypropylene Pallet Guide | "+domain,
     "PP corrugated and injection-molded plastic pallets. Food-safe, ISPM-15 exempt, 0% anti-dumping duty. Wholesale Elipacko.",
     "PP Plastic Pallets — Two Types, Explained",
     "PP corrugated vs injection-molded PP pallets — different ratings for different applications. Here's how to choose.",
     f"""<section style="background:#fff;padding:52px 5%"><div style="max-width:1100px;margin:0 auto">
{h2("PP Corrugated vs Injection-Molded — Which to Choose")}
{table(["Property","PP Corrugated","Injection-Molded PP"],
  [["Static load","10,000+ lbs","8,000+ lbs"],
   ["Racking (suspended)","Floor only","2,200 lbs"],
   ["Weight empty","15–22 lbs","22–35 lbs"],
   ["Temp range","−40°F to 140°F","−40°F to 140°F"],
   ["Best for","Floor storage, export, cold chain","Selective racking, automation, pharma"],
   ["Anti-dump duty","0%","0%"]])}
{p("PP corrugated pallets are lighter and cheaper for floor and ground-level fork movement. Injection-molded PP pallets are heavier but rated for selective racking — the suspended load between rack beams. If your operation uses racking, injection-molded is the right call.")}
{photos((f"{CDN}/pp-pallet-heavy-duty.jpg",f"PP plastic pallet corrugated — {domain}"),(f"{CDN}/pp-pallet-heavy-duty-2.jpg",f"PP injection molded plastic pallet — {domain}"),(f"{CDN}/pp-gaylord-on-pallet-strapped.jpg",f"PP pallet with gaylord loaded — {domain}"))}
{h3("No ISPM-15 for Either Type")}
{p("Both PP pallet types are plastic — entirely exempt from ISPM-15 heat treatment requirements for international export. Save $3–$8 per pallet per shipment vs wood.")}
</div></section>""",
     [("What PP pallet type is right for racking?","Injection-molded PP, rated to 2,200 lbs racking. PP corrugated is floor/static only."),
      ("What PP pallet type is right for floor storage?","PP corrugated — lighter and cheaper with a higher 10,000 lb static rating. Best for flat floor, cold store, and ground-level fork movement."),
      ("Can PP pallets go in freezer storage?","Yes. Both corrugated and injection-molded PP are rated to −40°F."),
      ("Are PP plastic pallets food-safe?","Yes. Non-porous, splinter-free, pressure-wash sanitizable. FDA and USDA facility compliant."),
      ("What is the anti-dumping duty on PP pallets?","0%. PP plastic pallets are not subject to US anti-dumping duties.")]
    ),
    ("food-grade-pallets","Food Grade Pallets — FDA and USDA Compliance | "+domain,
     "Food grade plastic pallets for FDA and USDA facilities. PP, non-porous, pressure-wash sanitizable. 0% anti-dumping. Wholesale from Elipacko.",
     "Food Grade Pallets — What Compliance Actually Requires",
     "Wood pallets are restricted in many food facilities. Here's what makes a pallet food-grade and why PP is the right material.",
     f"""<section style="background:#fff;padding:52px 5%"><div style="max-width:760px;margin:0 auto">
{h2("Why Wood Pallets Are Restricted in Food Facilities")}
{p("Wood pallets have three food safety problems that PP plastic pallets don't: (1) wood grain harbors bacterial biofilm that resists sanitization; (2) splinters and nails create physical contamination risk in products and worker injuries; (3) wood absorbs moisture and harbors mold between uses.")}
{p("FDA's FSMA rules require Good Manufacturing Practice controls that are difficult to meet with wood pallets. Most major food retailers (Walmart, Costco, Target) and food manufacturers have pallet-material requirements that effectively require plastic in certain zones.")}
{table(["Property","Wood Pallet","PP Plastic Pallet"],
  [["Biofilm in grain","Yes — harbors Listeria, Salmonella","No — non-porous surface"],
   ["Full sanitization","Cannot achieve","Full surface log-reduction"],
   ["Splinter/nail risk","Yes","None"],
   ["Mold between uses","Yes (moisture absorption)","No (waterproof)"],
   ["FDA FSMA GMP compliance","Difficult","Straightforward"],
   ["Cold chain","Warps, absorbs water","100% waterproof"]])}
{photos((f"{CDN}/pp-pallet-heavy-duty.jpg",f"Food grade PP pallet FDA USDA — {domain}"),(f"{CDN}/pp-pallet-heavy-duty-2.jpg",f"Food grade plastic pallet cold chain — {domain}"))}
</div></section>""",
     [("Are PP plastic pallets FDA-approved?","PP is an FDA-cleared food contact material (21 CFR 177.1520). Non-porous PP pallets are accepted in FDA-regulated food facilities."),
      ("Do food grade pallets need to be a specific color?","Many food facilities use white pallets in high-care zones for visual cleanliness inspection. Blue is also common for food areas. Elipacko can supply any color."),
      ("Can food grade pallets be washed?","Yes. PP pallets are pressure-wash and disinfectant compatible. Fully sanitizable in automated pallet wash systems."),
      ("What is the anti-dumping duty on food grade plastic pallets?","0%. PP plastic pallets are not subject to US anti-dumping duties."),
      ("What regulations apply to food grade pallets?","FDA FSMA 21 CFR Part 117 (GMP), USDA FSIS for meat/poultry facilities, SQF and BRC audit standards, major retailer supplier requirements.")]
    ),
    ("export-pallets","Export Pallets — No ISPM-15 Required PP Pallets | "+domain,
     "PP plastic export pallets exempt from ISPM-15. No fumigation, no heat treatment, no phytosanitary certificate needed. Wholesale Elipacko.",
     "Export Pallets Without ISPM-15 — PP Plastic is Exempt",
     "ISPM-15 adds cost and delays to every wood pallet export. PP plastic pallets are exempt — here's what that saves you.",
     f"""<section style="background:#fff;padding:52px 5%"><div style="max-width:760px;margin:0 auto">
{h2("ISPM-15 and Why PP Export Pallets Avoid It")}
{p("ISPM-15 (International Standards for Phytosanitary Measures No. 15) requires that wood packaging material crossing international borders be treated to eliminate wood-boring insect pests. The two approved treatments are heat treatment (HT, 56°C for 30 min core temperature) and methyl bromide fumigation (MB, being phased out). Both add cost, time, and supply chain complexity.")}
{table(["Factor","Wood Pallet (ISPM-15)","PP Plastic Pallet"],
  [["ISPM-15 treatment required","Yes — HT or MB","No — exempt"],
   ["Treatment cost per pallet","$3–$8","$0"],
   ["Phytosanitary cert required","Yes","No"],
   ["Border inspection delay risk","Yes","No"],
   ["Documentation burden","Treatment cert required","None"]])}
{p("For a standard 20-pallet container, ISPM-15 costs $60–$160 per shipment. Over 12 shipments per year, that's $720–$1,920 in pure compliance cost that disappears when you switch to PP plastic pallets.")}
{infobox("<strong>Who enforces ISPM-15:</strong> The EU, Australia, Japan, China, South Korea, New Zealand, Brazil, Canada, and over 180 other countries. The US enforces it for imports from those countries. PP pallets are exempt in all ISPM-15 enforcement jurisdictions — plastic is not regulated under ISPM-15.")}
{photos((f"{CDN}/pp-pallet-heavy-duty.jpg",f"Export pallets no ISPM-15 PP — {domain}"),(f"{CDN}/pp-gaylord-on-pallet-strapped.jpg",f"PP export pallet loaded for shipping — {domain}"))}
</div></section>""",
     [("Why are PP pallets exempt from ISPM-15?","ISPM-15 regulates wood packaging material to prevent spread of wood-boring insects. Plastic (PP) doesn't harbor wood-boring insects and is not regulated under ISPM-15."),
      ("How much does ISPM-15 cost per shipment?","$3–$8 per pallet for heat treatment. A 20-pallet container saves $60–$160 per shipment by switching to PP."),
      ("Which countries enforce ISPM-15?","Over 180 countries, including the EU, Australia, Japan, China, Canada, Brazil, and New Zealand."),
      ("Do PP export pallets need a phytosanitary certificate?","No. Phytosanitary certificates are for wood packaging. PP plastic pallets have no phytosanitary requirement."),
      ("What is the anti-dumping duty on PP export pallets from China?","0%. PP plastic pallets are not subject to US anti-dumping duties.")]
    ),
    ("industrial-plastic-pallets","Industrial Plastic Pallets — Warehouse and Manufacturing | "+domain,
     "Industrial PP plastic pallets for warehouse racking, cold chain, and manufacturing. 10,000 lb static, racking-rated. Wholesale Elipacko.",
     "Industrial Plastic Pallets — Warehouse and Manufacturing Specs",
     "Industrial operations need pallets that maintain their ratings trip after trip. PP delivers where wood degrades.",
     f"""<section style="background:#fff;padding:52px 5%"><div style="max-width:760px;margin:0 auto">
{h2("Where Industrial Plastic Pallets Excel")}
{p("Industrial PP plastic pallets are specified for three main environments where wood fails: cold chain / frozen storage (PP waterproof and maintains structural rating; wood warps and absorbs moisture), pharmaceutical cleanroom (PP pressure-washable, non-porous, GMP-compliant; wood harbors contamination), and automated handling systems (PP consistent dimensions; wood variable and splinter-prone).")}
{table(["Environment","Wood Performance","PP Performance"],
  [["Freezer / cold store","-20°F warps wood","Rated to −40°F, no deformation"],
   ["Automated conveyor","Inconsistent dimensions","Consistent molded dimensions"],
   ["Pharma cleanroom","GMP non-compliant","GMP-compliant, sanitizable"],
   ["Racking (suspended load)","2,200 lbs new; degrades","2,200 lbs (inj. molded) — constant"],
   ["Floor storage","2,500 lbs new; degrades","10,000 lbs — constant"]])}
{h3("Automated Handling Systems")}
{p("Injection-molded PP pallets have consistent, repeatable dimensions across the entire service life. Wood pallets vary in thickness and flatness from unit to unit and deteriorate further in use. For ASRS (Automated Storage and Retrieval Systems), conveyor-based distribution, and robotics, PP's dimensional consistency reduces jam and misfeed incidents.")}
{photos((f"{CDN}/pp-pallet-heavy-duty.jpg",f"Industrial plastic pallet warehouse — {domain}"),(f"{CDN}/pp-pallet-heavy-duty-2.jpg",f"Industrial PP pallet cold chain — {domain}"),(f"{CDN}/pp-pallet-heavy-duty-3.jpg",f"Industrial plastic pallet forklift — {domain}"))}
</div></section>""",
     [("Are plastic pallets suitable for automated warehouses?","Yes. Injection-molded PP pallets have consistent dimensions across their service life — critical for ASRS, conveyor systems, and robotics where wood's variability causes jams."),
      ("What load rating do industrial plastic pallets need for racking?","Selective racking requires racking-rated pallets — injection-molded PP at 2,200 lbs. PP corrugated is floor/static only."),
      ("Can industrial plastic pallets handle −40°F?","Yes. Both PP corrugated and injection-molded PP are rated to −40°F. No deformation or moisture absorption in cold chain."),
      ("Are industrial plastic pallets suitable for pharmaceutical use?","Yes. PP is GMP-compliant, non-porous, and pressure-wash sanitizable — standard in pharmaceutical warehouse and distribution environments."),
      ("What is the MOQ for industrial plastic pallets?","One 40HQ container from Elipacko. 3 days production + 14–21 days freight.")]
    ),
    ("faq","Plastic Pallet FAQ | "+domain,
     "Frequently asked questions about PP plastic pallets: load ratings, ISPM-15, food safety, racking, ordering.",
     "Plastic Pallet FAQ",
     "All the common questions about PP plastic pallets answered.",
     f"""<section style="background:#fff;padding:52px 5%"><div style="max-width:1100px;margin:0 auto">
{photos((f"{CDN}/pp-pallet-heavy-duty.jpg",f"PP plastic pallet FAQ — {domain}"),(f"{CDN}/pp-pallet-heavy-duty-2.jpg",f"Plastic pallet load rating FAQ — {domain}"),(f"{CDN}/pp-pallet-heavy-duty-3.jpg",f"PP pallet ISPM-15 FAQ — {domain}"))}
</div></section>""",
     [("What is the static load of PP plastic pallets?","PP corrugated: 10,000 lbs. Injection-molded PP: 8,000 lbs floor static, 2,200 lbs racking."),
      ("Do PP pallets require ISPM-15?","No. PP plastic pallets are entirely exempt from ISPM-15."),
      ("Are PP pallets food-grade?","Yes. PP is FDA 21 CFR 177.1520 compliant. Non-porous, splinter-free, sanitizable."),
      ("Can PP pallets be used in freezers?","Yes. Rated to −40°F."),
      ("What's the difference between corrugated and injection-molded PP pallets?","Corrugated: lighter, higher static load, floor only. Injection-molded: heavier, racking-rated, ASRS compatible."),
      ("How long do PP pallets last?","10–15 years. 100–200 trip service life."),
      ("What is the MOQ?","One 40HQ container. 3 days + 14–21 days freight."),
      ("What footprint?","Standard 48×40 GMA. Custom footprints available."),
      ("What is the anti-dumping duty?","0%."),
      ("Are lids available?","Not typically for pallets. Contact Elipacko for specific requirements.")]
    ),
]

PALLET_PHOTOS = photos((f"{CDN}/pp-pallet-heavy-duty.jpg","Heavy duty PP plastic pallet — wholesale"),(f"{CDN}/pp-pallet-heavy-duty-2.jpg","PP plastic pallet forklift compatible"),(f"{CDN}/pp-pallet-heavy-duty-3.jpg","Heavy duty plastic pallets stacked"))
for site_dir, domain in PALLET_SITES:
    print(f"\n{domain}:")
    for page_slug, page_title, meta_desc, h1_text, intro_text, sections_html, faqs in pallet_subpages(domain):
        html = build_subpage(site_dir, page_slug, "#1c3d2e", "#16a34a", domain,
                             page_title, meta_desc, h1_text, intro_text, sections_html, faqs, PALLET_PHOTOS)
        os.makedirs(f"{BASE}/{site_dir}/{page_slug}", exist_ok=True)
        with open(f"{BASE}/{site_dir}/{page_slug}/index.html", "w") as f: f.write(html)
        print(f"  ✓ {page_slug} — ~{len(html.split())} words")

print("\n✓ Pallets done")
