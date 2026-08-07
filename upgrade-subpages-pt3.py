#!/usr/bin/env python3
"""Poultry + produce + reusable shipping subpages"""
import os, json

BASE = "/home/ubuntu/.openclaw/workspace/elipacko-sites"
CDN = "https://brazenproducts.github.io/elipacko-assets"

def faq_json(faqs):
    return json.dumps({"@context":"https://schema.org","@type":"FAQPage",
        "mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in faqs]})

def p(t): return f'<p style="color:#374151;font-size:.96rem;line-height:1.82;margin-bottom:14px">{t}</p>'
def h2(t): return f'<h2 style="font-size:clamp(1.35rem,2.5vw,1.9rem);font-weight:800;color:#0a2540;margin-bottom:12px">{t}</h2>'
def h3(t): return f'<h3 style="font-size:1.02rem;font-weight:700;color:#0a2540;margin:22px 0 9px">{t}</h3>'
def ul(*i): return f'<ul style="padding-left:20px;color:#374151;font-size:.96rem;line-height:1.88;margin-bottom:14px">{"".join(f"<li style=margin-bottom:4px>{x}</li>" for x in i)}</ul>'
def table(headers, rows):
    ths = "".join(f'<th style="padding:10px 13px;text-align:left">{h}</th>' for h in headers)
    trs = "".join(f'<tr>{"".join(f"<td style=padding:9px_13px;border-bottom:1px_solid_#e2e8f0>{c}</td>" for c in row)}</tr>' for row in rows)
    return f'<table style="width:100%;border-collapse:collapse;font-size:.87rem;margin:18px 0"><tr style="background:#0a2540;color:#fff">{ths}</tr>{trs}</table>'
def table2(headers, rows):
    ths = "".join(f'<th style="padding:10px 13px;text-align:left;font-weight:600">{h}</th>' for h in headers)
    trs = ""
    for i,row in enumerate(rows):
        bg = "background:#f7f9fc;" if i%2 else ""
        tds = "".join(f'<td style="padding:9px 13px;border-bottom:1px solid #e2e8f0;{bg}">{c}</td>' for c in row)
        trs += f"<tr>{tds}</tr>"
    return f'<table style="width:100%;border-collapse:collapse;font-size:.87rem;margin:18px 0"><tr style="background:#0a2540;color:#fff">{ths}</tr>{trs}</table>'
def infobox(t): return f'<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px 18px;margin:18px 0"><p style="margin:0;font-size:.92rem;color:#0c4a6e">{t}</p></div>'
def photos(*items):
    imgs = "".join(f'<img src="{u}" alt="{a}" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0" loading="lazy">' for u,a in items)
    return f'<div style="display:grid;grid-template-columns:repeat({min(len(items),3)},1fr);gap:9px;margin:16px 0">{imgs}</div>'
def sec(bg, inner): return f'<section style="background:{bg};padding:52px 5%"><div style="max-width:1100px;margin:0 auto">{inner}</div></section>'

def build_page(site_dir, page_slug, color, color2, domain, page_title, meta_desc, h1_text, intro_text, sections_html, faqs, hero_photos_html=""):
    faq_items = "".join(f'<div style="border-bottom:1px solid #e2e8f0;padding:18px 0"><h4 style="font-size:.95rem;font-weight:700;color:#0a2540;margin-bottom:8px">{q}</h4><p style="color:#6b7a8d;font-size:.9rem;margin:0">{a}</p></div>' for q,a in faqs)
    skip = {"e9c8f5a4b3d2c1a0f9e8d7c6b5a4e9c8.txt","CNAME","robots.txt","sitemap.xml","index.html"}
    try:
        sub_dirs = sorted([e for e in os.listdir(f"{BASE}/{site_dir}") if os.path.isdir(f"{BASE}/{site_dir}/{e}") and e not in skip])
    except: sub_dirs = []
    nav_links = '<a href="/">Home</a>'
    for sd in sub_dirs:
        active = ' style="background:rgba(255,255,255,.2)"' if sd == page_slug else ''
        nav_links += f'<a href="/{sd}/"{active}>{sd.replace("-"," ").title()}</a>'
    nav_links += f'<a href="https://elipacko.com" target="_blank" rel="noopener" style="background:#fff;color:{color};padding:7px 16px;border-radius:6px;font-weight:700;font-size:.85rem">Get Quote</a>'
    
    html = f"""<!DOCTYPE html><html lang="en-US"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{page_title} | {domain}</title>
<meta name="description" content="{meta_desc[:155]}">
<link rel="canonical" href="https://{domain}/{page_slug}/">
<meta property="og:title" content="{page_title}"><meta property="og:image" content="{CDN}/meat-lug-white-empty.jpg">
<script type="application/ld+json">{faq_json(faqs)}</script>
<style>*{{margin:0;padding:0;box-sizing:border-box}}body{{font-family:'Segoe UI',system-ui,sans-serif;color:#1a2332;line-height:1.65;background:#fff}}a{{text-decoration:none}}
nav{{background:{color};padding:12px 5%;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;position:sticky;top:0;z-index:100}}
.nb{{color:#fff;font-weight:800;font-size:1.05rem}}.nl{{display:flex;flex-wrap:wrap;gap:3px;align-items:center}}
.nl a{{color:rgba(255,255,255,.85);padding:5px 9px;font-size:.78rem;font-weight:500;border-radius:4px;white-space:nowrap}}
.nl a:hover{{background:rgba(255,255,255,.15)}}
@media(max-width:600px){{nav{{flex-direction:column;align-items:flex-start}}}}
</style></head><body>
<nav><span class="nb">{domain}</span><div class="nl">{nav_links}</div></nav>
<div style="background:#f7f9fc;padding:10px 5%;font-size:.82rem;color:#6b7a8d"><a href="/" style="color:{color2}">Home</a> › {page_title}</div>
<section style="background:linear-gradient(135deg,{color},{color}ee);color:#fff;padding:52px 5%">
  <div style="max-width:1100px;margin:0 auto">
    <div style="display:inline-block;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:20px;padding:5px 14px;font-size:.78rem;font-weight:700;text-transform:uppercase;margin-bottom:14px">Sourcing Guide</div>
    <h1 style="font-size:clamp(1.6rem,3.2vw,2.4rem);font-weight:800;line-height:1.18;max-width:700px;margin-bottom:12px">{h1_text}</h1>
    <p style="color:rgba(255,255,255,.88);font-size:.98rem;max-width:550px;margin-bottom:22px">{intro_text}</p>
    <a href="https://elipacko.com" style="background:#fff;color:{color};padding:11px 24px;border-radius:6px;font-weight:700;font-size:.9rem;display:inline-block">Get a Quote from Elipacko →</a>
  </div>
</section>
<section style="background:#fff;padding:28px 5% 8px"><div style="max-width:1100px;margin:0 auto">{hero_photos_html}</div></section>
{sections_html}
<section style="background:#f7f9fc;padding:48px 5%"><div style="max-width:1100px;margin:0 auto">
  <h2 style="font-size:clamp(1.35rem,2.5vw,1.9rem);font-weight:800;color:#0a2540;margin-bottom:20px">Frequently Asked Questions</h2>
  {faq_items}
</div></section>
<div style="background:{color};padding:44px 5%;text-align:center;color:#fff">
  <h2 style="color:#fff;margin-bottom:8px">{page_title} — Wholesale from Elipacko</h2>
  <a href="https://elipacko.com" style="background:#fff;color:{color};padding:12px 28px;border-radius:6px;font-weight:700;display:inline-block;margin-top:12px">Request a Quote →</a>
</div>
<footer style="background:#0a2540;color:rgba(255,255,255,.6);padding:24px 5%;font-size:.81rem;text-align:center">
  <p>&copy; 2026 {domain} | <a href="/" style="color:rgba(255,255,255,.5)">Home</a> | <a href="/faq/" style="color:rgba(255,255,255,.5)">FAQ</a> | <a href="https://elipacko.com" style="color:rgba(255,255,255,.5)">Elipacko.com</a></p>
</footer></body></html>"""
    
    os.makedirs(f"{BASE}/{site_dir}/{page_slug}", exist_ok=True)
    with open(f"{BASE}/{site_dir}/{page_slug}/index.html", "w") as f: f.write(html)
    return len(html.split())

POULTRY_COLOR = "#78350f"
POULTRY_COLOR2 = "#d97706"
POULTRY_IMG = f"{CDN}/poultry-box.jpg"

POULTRY_PAGES = [
("plastic-poultry-crates","Plastic Poultry Crates — PP for Live Bird Transport","PP plastic poultry crates for live bird transport. Ventilated, stackable, HPAI biosecurity rated. Wholesale from Elipacko.","Plastic Poultry Crates — Why PP Replaced Wood in Commercial Poultry","PP corrugated poultry crates are the biosecurity-safe replacement for wood. Here's why the whole industry has made the switch.",
sec("#fff", h2("PP vs Wood Poultry Crates — Biosecurity") + table2(["Property","Wood","PP Corrugated"],
  [["Biofilm","Yes — grain absorbs","Non-porous — none"],["Full disinfection","Incomplete","Full surface contact"],
   ["HPAI elimination","Uncertain","Full log-reduction"],["Splinter injury","Yes","None"],
   ["ISPM-15","Required","Not required"],["Service life","5–10 yrs","15–20 yrs"]]) +
p("Avian influenza (HPAI) biosecurity programs require containers that can achieve full log-reduction of HPAI virus on all contact surfaces. Wood grain prevents this — the grain absorbs disinfectant, allowing pathogen survival even after standard wash protocols. PP's non-porous surface achieves full contact with the disinfectant on 100% of the surface.") +
photos((POULTRY_IMG,"PP plastic poultry crates ventilated transport"),(POULTRY_IMG,"Plastic poultry crates stacked loaded truck"),(POULTRY_IMG,"PP poultry transport containers farm"))) +
sec("#f7f9fc", h3("What to Include in a Quote Request") + ul("Bird species and average live weight","Birds per crate target","Climate zone (ventilation %)","Any welfare certification requirements (e.g. Costco WAP)","Destination port","Quantity (one 40HQ container MOQ)") + infobox("0% anti-dumping duty: PP corrugated poultry crates are not subject to US anti-dumping duties.")),
[("Why are PP crates better than wood for poultry biosecurity?","PP is non-porous — disinfectants achieve full surface contact for complete log-reduction of avian pathogens including HPAI. Wood grain absorbs disinfectant and prevents equivalent decontamination."),("What vent percentage do PP poultry crates have?","Standard: 20–30%. Custom patterns available for climate and welfare certification requirements."),("Do PP poultry crates require ISPM-15?","No. PP is exempt from ISPM-15."),("Can PP poultry crates handle cold weather?","Yes. PP is rated to −40°F. Ventilation % can be reduced for cold-climate transport to limit chilling."),("What is the MOQ?","One 40HQ container. 3 days production + 14–21 days freight.")]),

("chicken-transport-crates","Chicken Transport Crates — Broiler Ventilated Containers","PP chicken transport crates for broiler live haul. Ventilated 20–30%, stackable 4–6 high, biosecurity sanitizable. Wholesale Elipacko.","Chicken Transport Crates — Broiler Live Haul Specifications","Everything a commercial broiler integrator needs to know about specifying PP chicken transport crates.",
sec("#fff", h2("Broiler Live Haul Crate Specifications") + table2(["Spec","Standard Broiler","Heavy Broiler"],
  [["Live weight","4–6 lbs","7–10 lbs"],["Birds/crate","6–10","4–6"],
   ["Crate size","600×400×280mm","700×500×320mm"],["Vent %","20–25%","20–25%"],
   ["Stack height","4–6 loaded","4 loaded"]]) +
p("Standard broiler crates at 600×400×280mm are the most common size in US commercial live haul operations. They handle 4–6 lb birds at 6–10 per crate with adequate airflow for all-season transport. Heavy broiler configurations add wall area and reduce birds per crate to maintain welfare specifications under the greater per-bird weight.") +
photos((POULTRY_IMG,"Chicken transport crates broiler live haul PP"),(POULTRY_IMG,"PP chicken crates ventilated transport truck"),(POULTRY_IMG,"Broiler chicken transport crates stacked"))) +
sec("#f7f9fc", h3("Stack Height on Transport Vehicles") + p("4–6 stack height loaded is standard for commercial live haul. The stacking locators on Elipacko poultry crates engage the rim of the unit below, preventing lateral shift on the truck. Exact safe stack height depends on vehicle suspension and bird weight — higher stack = more total load on bottom crate.") + infobox("APHIS biosecurity: Sanitize poultry crates at the processing plant before returning to farm. Plant-side wash prevents cross-contamination in the reverse direction.")),
[("What size crate for standard broilers?","600×400×280mm for 4–6 lb birds at 6–10 per crate. Standard size for most US commercial integrators."),("What vent % for summer transport?","25–35% for maximum airflow in hot-weather live haul. Standard crates are 20–25% — add custom high-vent pattern for summer season."),("How are PP chicken crates sanitized?","Hot pressure wash (140–160°F) with approved disinfectant (QAC or PAA), final rinse, air dry. PP achieves full avian pathogen log-reduction with this protocol."),("Do chicken transport crates need ISPM-15?","No. PP corrugated is exempt from ISPM-15."),("What is the MOQ?","One 40HQ container from Elipacko.")]),

("poultry-transport-boxes","Poultry Transport Boxes — Stackable PP Containers","PP poultry transport boxes for broiler, turkey, and duck live transport. Stackable, ventilated, biosecurity-compatible. Wholesale Elipacko.","Poultry Transport Boxes — Species Guide and Specifications","PP poultry transport boxes for every commercially farmed species. Broiler to turkey — here are the right specs.",
sec("#fff", h2("Species Specification Guide") + table2(["Species","Live Weight","Birds/Box","Box Size","Key Spec"],
  [["Broiler","4–6 lbs","6–10","600×400×280mm","High vent, lightweight"],
   ["Heavy broiler","7–10 lbs","4–6","700×500×320mm","Higher structural rating"],
   ["Spent layer","3–5 lbs","8–12","600×400×250mm","Gentle handling"],
   ["Turkey","20–40 lbs","2–4","800×600×400mm","Wide opening, high rating"],
   ["Duck","5–8 lbs","6–8","650×450×280mm","Drain points for wet birds"]]) +
photos((POULTRY_IMG,"Poultry transport boxes PP broiler turkey"),(POULTRY_IMG,"PP poultry transport boxes stackable"),(POULTRY_IMG,"Poultry transport PP containers farm")) +
h3("Turkey Transport Boxes") + p("Turkey transport requires larger boxes and higher structural ratings — a 40-lb bird in a 4-bird box equals 160 lbs plus box weight. Elipacko 800×600×400mm turkey boxes have a wide top opening for easy loading and a higher structural rating for the greater per-box load.")),
[("What size PP box for turkeys?","800×600×400mm standard for 20–40 lb birds, 2–4 birds per box."),("What size for broilers?","600×400×280mm standard for 4–6 lb birds at 6–10 per crate."),("Can PP boxes be used for ducks?","Yes. Duck-specific boxes with drain points for wet birds are available. 650×450×280mm standard configuration."),("Are PP poultry transport boxes ISPM-15 exempt?","Yes. PP is exempt from ISPM-15."),("What is the MOQ?","One 40HQ container.")]),

("poultry-crate-dimensions","Poultry Crate Dimensions — All Species Size Guide","PP poultry crate dimensions for broiler, turkey, duck, and spent layer. Standard sizes and custom configurations from Elipacko.","Poultry Crate Dimensions — Standard and Custom Sizes",  "Standard poultry crate dimensions by species, plus how to request custom configurations from Elipacko.",
sec("#fff", h2("Standard Poultry Crate Dimensions by Species") + table2(["Species","L×W×H (mm)","Interior Depth","Stack Height","Vent %"],
  [["Broiler (std)","600×400×280","260mm","4–6 high","20–25%"],
   ["Broiler (heavy)","700×500×320","300mm","4–5 high","20–25%"],
   ["Spent layer","600×400×250","230mm","5–6 high","20–25%"],
   ["Turkey","800×600×400","380mm","3–4 high","20–25%"],
   ["Duck","650×450×280","260mm","4–5 high","20–30%"],
   ["Quail/small bird","500×350×200","185mm","6–8 high","25–30%"]]) +
p("Dimensions are for Elipacko standard configurations. Custom dimensions are available on container-load orders. If your integrator welfare certification specifies a dimension requirement, Elipacko can match it with custom tooling.") +
photos((POULTRY_IMG,"Poultry crate dimensions broiler turkey PP"),(POULTRY_IMG,"PP poultry crate size guide"))),
[("What are standard broiler crate dimensions?","600×400×280mm L×W×H. Standard for 4–6 lb birds at 6–10 per crate across most US commercial integrators."),("What are standard turkey crate dimensions?","800×600×400mm for 20–40 lb birds, 2–4 per crate."),("Are custom dimensions available?","Yes. Custom dimensions on container-load orders. Custom tooling may apply."),("How tall is a standard poultry crate?","280mm (broiler) to 400mm (turkey). Measured to top of crate."),("How many crates fit in a 40HQ container?","Depends on crate size — broiler: approximately 400–600 units; turkey: approximately 200–300 units.")]),

("reusable-poultry-crates","Reusable Poultry Crates — PP 20-Year Service Life","Reusable PP poultry crates lasting 15–20 years vs single-use alternatives. Cost analysis and ROI. Wholesale from Elipacko.","Reusable PP Poultry Crates — Why 20-Year Service Life Changes the Math","Wood and single-use plastic crates seem cheap per unit. Here's what 20 years of reusable PP actually costs vs the alternative.",
sec("#fff", h2("Reusable vs Single-Use Poultry Crate Cost") + table2(["Scenario","Single-Use (annual)","PP Reusable (over life)"],
  [["Unit cost","$3–$8","$25–$45 (one time)"],["Replacement frequency","Annual","Never (15–20 yr life)"],
   ["5-year total (1000 crates)","$15,000–$40,000","$25,000–$45,000"],["10-year total","$30,000–$80,000","$25,000–$45,000"],["15-year total","$45,000–$120,000","$25,000–$45,000"]]) +
p("The crossover point for reusable PP vs single-use is typically year 4–8 depending on unit prices and volume. After that, the PP crate fleet generates savings every year with zero capital outlay.") +
photos((POULTRY_IMG,"Reusable PP poultry crates 20-year service"),(POULTRY_IMG,"Reusable poultry transport crates stacked"),(POULTRY_IMG,"PP poultry crates reusable flock")) +
h3("Sanitization for Long Service Life") + p("PP crates sanitized with proper protocol (hot wash + approved disinfectant) between every flock maintain their biosecurity performance for the full service life. The surface doesn't degrade under standard washdown conditions — unlike wood which starts to fail at disinfection after only a few years of use.")),
[("How long do PP poultry crates last?","15–20 years in commercial live haul use. The limiting factor is physical damage (forklift impact, drops) not material degradation."),("What is the break-even vs single-use crates?","Typically year 4–8 depending on volumes and pricing. Every year after break-even generates savings."),("How many times can a PP crate be sanitized?","Hundreds of times. PP doesn't degrade under repeated QAC or PAA disinfection cycles."),("Are reusable PP poultry crates recyclable?","Yes. PP resin code #5 — fully recyclable at end of service life."),("What is the MOQ for reusable PP crates?","One 40HQ container. 3 days production + 14–21 days freight.")]),

("faq","Poultry Crate FAQ","Frequently asked questions about PP poultry crates: biosecurity, dimensions, sanitization, ordering.","Poultry Crate FAQ","All common questions about PP poultry crates answered.",
sec("#fff",photos((POULTRY_IMG,"PP poultry crate FAQ ventilation"),(POULTRY_IMG,"Poultry crate FAQ stack height"),(POULTRY_IMG,"PP poultry transport FAQ biosecurity"))),
[("What vent % do PP poultry crates have?","20–30% standard. Custom patterns available."),("How do you sanitize PP poultry crates?","Hot pressure wash (140–160°F) + approved disinfectant + final rinse + air dry."),("Do PP poultry crates need ISPM-15?","No. PP is exempt."),("Stack height?","4–6 high loaded on transport vehicles."),("What is the MOQ?","One 40HQ container. 3 days + 14–21 days freight."),("What colors are available?","White and yellow standard; custom available."),("Are custom dimensions available?","Yes on container-load orders."),("HPAI biosecurity?","PP achieves full avian pathogen log-reduction with standard disinfection. Wood cannot."),("Service life?","15–20 years."),("Anti-dumping duty?","0%.")])
]

POULTRY_SITES = [("poultrycrates","poultrycrates.com"),("poultryboxes","poultryboxes.com"),("poultryshippingboxes","poultryshippingboxes.com")]
for site_dir, domain in POULTRY_SITES:
    print(f"\n{domain}:")
    for args in POULTRY_PAGES:
        page_slug = args[0]
        POULTRY_HERO = photos((f"{CDN}/42.jpg",f"PP corrugated ventilated produce box — {domain}"),(f"{CDN}/86.jpg",f"PP corrugated box ventilated sides — {domain}"),(f"{CDN}/29.jpg",f"PP corrugated box stacked — {domain}"))
        words = build_page(site_dir, page_slug, POULTRY_COLOR, POULTRY_COLOR2, domain, *args[1:], hero_photos_html=POULTRY_HERO)
        print(f"  ✓ {page_slug} — ~{words} words")


# PRODUCE SITES
PRODUCE_COLOR = "#14532d"
PRODUCE_COLOR2 = "#16a34a"
PRODUCE_IMG1 = f"{CDN}/produce------.jpg"
PRODUCE_IMG2 = f"{CDN}/vegetables-farm.jpg"
PRODUCE_IMG3 = f"{CDN}/produce----.jpg"

PRODUCE_PAGES = [
("plastic-produce-crates","Plastic Produce Crates — PP for Farm and Distribution","PP plastic produce crates replacing wax cardboard. 50+ harvest reuse, waterproof, food-grade. Wholesale from Elipacko.","Plastic Produce Crates — What Makes PP the Right Material","PP produce crates outperform cardboard on every metric that matters to growers and distributors. Here's the full comparison.",
sec("#fff", h2("PP vs Wax Cardboard Produce Crates") + table2(["Factor","Wax Cardboard","PP Produce Crate"],
  [["Reuse cycles","1","50+"],["Waterproof","Wax delays, fails","100%"],
   ["Cost per harvest","$1.50–$4","$0.10–$0.30 amortized"],
   ["Recyclability","Wax contaminates OCC","100% PP #5"],
   ["Mold between uses","Single-use only","Pressure wash clean"],
   ["Color coding","Limited","Any Pantone"]]) +
photos((PRODUCE_IMG1,"PP plastic produce crates farm harvest"),(PRODUCE_IMG2,"Plastic produce crates vegetables farm"),(PRODUCE_IMG3,"PP produce crates ventilated wholesale")) +
h3("Food Contact Safety") + p("Elipacko produce crates use food-grade PP complying with FDA 21 CFR 177.1520. Non-porous surface is pressure-washable and doesn't harbor mold, bacteria, or odor between harvest cycles.") + infobox("0% anti-dumping duty: PP corrugated produce crates are not subject to US anti-dumping duties.")),
[("How long do PP produce crates last?","50+ harvest cycles. 3–8 years of continuous use in field conditions."),("Are PP produce crates food contact safe?","Yes. FDA 21 CFR 177.1520 food-grade PP."),("Can PP replace wax cardboard for produce?","Yes. PP is waterproof, reusable 50+ times, and fully recyclable — wax cardboard is none of those things."),("What ventilation patterns are available?","Solid to 35% open — custom patterns by crop available from Elipacko."),("What is the MOQ?","One 40HQ container. 3 days + 14–21 days freight.")]),

("reusable-produce-crates","Reusable Produce Crates — PP Cost vs Cardboard Analysis","Reusable PP produce crates: 50+ harvest cycles vs single-use cardboard. Cost analysis, break-even, and ROI for growers.","Reusable Produce Crates — The Case Against Buying Cardboard Every Season","The economics of reusable PP produce crates vs single-use cardboard: break-even in 20 harvests, savings for 8 years after.",
sec("#fff", h2("Reusable PP vs Single-Use Cardboard — 10-Year Cost") + table2(["Scenario","Cardboard (annual)","PP Reusable (amortized)"],
  [["Unit cost","$2.50–$4","$40–$80 (one time)"],["Reuse cycles","1","50+"],
   ["Annual cost per 1,000 units","$2,500–$4,000","$400–$800 (yr 1)"],
   ["Year 5 cumulative","$12,500–$20,000","$400–$800"],["Year 10 cumulative","$25,000–$40,000","$400–$800"]]) +
p("After break-even (typically 15–25 harvests), the PP crate fleet costs nothing additional — no annual cardboard purchase, no recycling fees, no cardboard disposal. For a 1,000-crate fleet, that's $2,500–$4,000 per season saved indefinitely.") +
photos((PRODUCE_IMG1,"Reusable produce crates PP farm"),(PRODUCE_IMG2,"Reusable vegetable crates harvest"))),
[("How many harvests do reusable PP crates last?","50+ harvests. 3–8 years in field conditions."),("What's the break-even vs cardboard?","At $50 PP vs $3 cardboard, break-even is ~17 uses. After that: zero marginal cost."),("Are reusable produce crates food-grade?","Yes. FDA 21 CFR 177.1520."),("Can I customize the ventilation pattern?","Yes. Any vent pattern for your specific crop."),("MOQ?","One 40HQ container.")]),

("vegetable-crates-wholesale","Vegetable Crates Wholesale — Factory Direct PP Pricing","Buy wholesale PP vegetable crates from Elipacko. Container-load pricing, custom ventilation, crop-specific design. 0% anti-dumping.","Wholesale Vegetable Crates — Factory Direct from Elipacko","Cut the distributor. Buy PP vegetable crates direct from Elipacko at factory prices.",
sec("#fff", h2("Wholesale PP Vegetable Crate Pricing") + table2(["Size","US Distributor","Elipacko Direct","Savings"],
  [["Small (10–15 kg)","$30–$45","$15–$25","40–50%"],
   ["Medium (20–30 kg)","$45–$60","$22–$35","40–50%"],
   ["Large (40–60 kg)","$60–$90","$30–$50","40–50%"]]) +
p("Factory-direct wholesale pricing from Elipacko eliminates the distributor margin. At one 40HQ container, you receive 300–800 units (depending on size) at factory-direct prices.") +
photos((PRODUCE_IMG1,"Wholesale vegetable crates PP farm"),(PRODUCE_IMG2,"Wholesale produce crates factory direct"),(PRODUCE_IMG3,"Vegetable crates wholesale PP"))) +
sec("#f7f9fc", h3("What to Include in Your Wholesale Quote") + ul("Crate dimensions or capacity target (kg)","Ventilation pattern (or crop type and let Elipacko advise)","Color requirements","Quantity (containers or units)","Destination port","Any food-grade documentation required")),
[("What is the MOQ for wholesale vegetable crates?","One 40HQ container from Elipacko."),("How long does a wholesale order take?","3 days production + 14–21 days ocean freight = 17–24 days to US West Coast."),("Can I get custom crop-specific ventilation?","Yes. Elipacko engineers custom vent patterns for any crop at volume."),("What is the anti-dumping duty?","0%."),("Are wholesale vegetable crates food-grade?","Yes. FDA 21 CFR 177.1520.")]),

("produce-crate-dimensions","Produce Crate Dimensions — Standard Sizes Guide","PP produce crate dimensions: standard footprints and heights for different crops. Custom sizes from Elipacko.","Produce Crate Dimensions — Standard Sizes by Crop Type","Which produce crate dimensions for your crop? Here are the standard footprints used in US commercial agriculture.",
sec("#fff", h2("Standard PP Produce Crate Dimensions by Crop") + table2(["Crop","Crate Size (L×W×H mm)","Capacity","Stack Height"],
  [["Berries (small)","400×300×120","5 kg","8–10 high"],
   ["Leafy greens","600×400×200","10–12 kg","6–8 high"],
   ["Tomatoes","600×400×250","15–20 kg","6–8 high"],
   ["Citrus","600×400×300","20–25 kg","6–8 high"],
   ["Potatoes/root veg","700×500×350","30–40 kg","4–6 high"],
   ["Bulk citrus/apple","800×600×400","40–60 kg","4–5 high"]]) +
p("These are standard configurations. Elipacko produces custom dimensions for any crop on container-load orders. Include your capacity target and crop type in your quote request — Elipacko will recommend appropriate dimensions and ventilation.") +
photos((PRODUCE_IMG1,"Produce crate dimensions PP standard sizes"),(PRODUCE_IMG2,"Vegetable crate dimensions by crop"))),
[("What are standard produce crate dimensions?","Common: 600×400mm footprint in 200–300mm heights for leafy greens and tomatoes. 700×500mm footprint for heavier root vegetables."),("Are custom dimensions available?","Yes on container-load orders."),("How tall can a loaded produce crate stack?","6–8 high for most crops. 4–6 high for heavy root vegetables."),("What is the inside dimension vs outside?","Wall thickness reduces inside dimension. For 4mm PP: inside is ~8mm less than outside on each wall."),("MOQ for custom dimensions?","One 40HQ container.")]),

("buy-produce-crates","Buy Produce Crates — How to Order PP Crates from Elipacko","How to buy PP produce crates wholesale from Elipacko. Quote process, container loads, lead times, customs.","Buy PP Produce Crates — Complete Ordering Guide","Step-by-step: how to order PP produce crates factory-direct from Elipacko.",
sec("#fff", h2("How to Order PP Produce Crates") + 
'<ol style="padding-left:20px;color:#374151;font-size:.96rem;line-height:2;margin-bottom:14px"><li>Submit quote at <a href="https://elipacko.com/agriculture-packaging/" style="color:#16a34a">elipacko.com/agriculture-packaging</a></li><li>Specify: crate size, crop type, ventilation, color, quantity, destination port</li><li>Receive CIF quote within 24 hours</li><li>Confirm spec and approve</li><li>Production: 3 days</li><li>Ocean freight: 14–21 days to US West Coast</li><li>Customs clearance (your broker)</li><li>Delivery</li></ol>' +
table2(["Crate Size","Units per 40HQ"],[["Small (10kg)","700–900"],["Medium (20kg)","500–700"],["Large (40kg)","300–450"]]) +
infobox("0% anti-dumping duty on PP produce crates. Standard import duty ~3.4% for PP articles. No ADD, no Section 301.")+
photos((PRODUCE_IMG1,"Buy produce crates Elipacko ordering guide"),(PRODUCE_IMG3,"PP produce crates buy wholesale factory"))),
[("What is the MOQ?","One 40HQ container."),("How long does delivery take?","17–24 days to US West Coast (3 days production + 14–21 days freight)."),("Can I get food-grade documentation?","Yes. FDA 21 CFR 177.1520 compliance statement included."),("Can I mix sizes in one container?","Yes — contact Elipacko for exact mixed-size configuration."),("Is private label available?","Yes at container-load quantities.")]),

("faq","Produce Crate FAQ","FAQ about PP produce crates: reuse cycles, food safety, ventilation, ordering, pricing.","Produce Crate FAQ","All common questions about PP produce crates answered.",
sec("#fff",photos((PRODUCE_IMG1,"PP produce crates FAQ"),(PRODUCE_IMG2,"Produce crate FAQ ventilation"),(PRODUCE_IMG3,"PP vegetable crate FAQ ordering"))),
[("How many harvests do PP produce crates last?","50+ — typically 3–8 years."),("Are PP produce crates food-grade?","Yes. FDA 21 CFR 177.1520."),("Can I get custom ventilation?","Yes. Any vent pattern for your crop."),("What is the break-even vs cardboard?","~20 harvests (1–2 years)."),("MOQ?","One 40HQ container."),("What colors?","Any Pantone."),("Anti-dumping duty?","0%."),("Waterproof?","100%."),("Stack height?","6–8 high (crop dependent)."),("ISPM-15?","Not required.")])
]

PRODUCE_SITES = [("producecrates","producecrates.com"),("vegetablecrates","vegetablecrates.com"),("cardboardproduceboxes","cardboardproduceboxes.com"),("waxproduceboxes","waxproduceboxes.com")]
for site_dir, domain in PRODUCE_SITES:
    print(f"\n{domain}:")
    for args in PRODUCE_PAGES:
        page_slug = args[0]
        PRODUCE_HERO = photos((f"{CDN}/42.jpg",f"PP corrugated produce box — {domain}"),(f"{CDN}/39.jpg",f"PP corrugated mango box — {domain}"),(f"{CDN}/86.jpg",f"PP corrugated broccoli box — {domain}"))
        words = build_page(site_dir, page_slug, PRODUCE_COLOR, PRODUCE_COLOR2, domain, *args[1:], hero_photos_html=PRODUCE_HERO)
        print(f"  ✓ {page_slug} — ~{words} words")


# REUSABLE SHIPPING BOXES
SHIP_COLOR = "#1e3a5f"
SHIP_COLOR2 = "#1a6bdb"
SHIP_IMG1 = f"{CDN}/pp-gaylord-box-1.jpg"
SHIP_IMG2 = f"{CDN}/turnover-box-0ac876e7-39f9-4814-b77f-603422efbf84.jpg"

SHIP_PAGES = [
("reusable-plastic-shipping-boxes","Reusable Plastic Shipping Boxes — PP vs Cardboard ROI","PP reusable plastic shipping boxes: 50+ trips, 100% waterproof, fully recyclable. Cost vs cardboard. Wholesale from Elipacko.","Reusable Plastic Shipping Boxes — ROI vs Cardboard","The 50-trip math on reusable PP shipping boxes vs single-use cardboard.",
sec("#fff", h2("PP Reusable vs Cardboard — Cost Per Shipment") + table2(["Factor","Cardboard Box","PP Reusable Box"],
  [["Unit cost","$1–$5","$12–$40"],["Reuse cycles","1–3","50+"],["Cost per shipment","$1–$5","$0.24–$0.80"],
   ["Waterproof","No","Yes"],["Recyclable","Limited","100% PP #5"]]) +
photos((SHIP_IMG1,"Reusable plastic shipping boxes PP"),(SHIP_IMG2,"PP corrugated reusable box industrial")) +
h3("Where Reusable PP Boxes Work Best") + ul("Closed-loop manufacturing logistics (factory to DC to factory)","Refrigerated/cold chain distribution","High-volume return logistics","Export shipping — no ISPM-15") + infobox("0% anti-dumping duty on PP corrugated shipping boxes.")),
[("How many trips do PP reusable boxes handle?","50+ trips. 5–10 year service life."),("Do PP boxes flat-pack empty?","Yes — significantly reduces return freight cost."),("Are PP shipping boxes waterproof?","100%."),("MOQ?","One 40HQ container from Elipacko."),("Anti-dumping duty?","0%.")]),

("corrugated-plastic-shipping-boxes","Corrugated Plastic Shipping Boxes — PP Twin-Wall Construction","PP corrugated plastic shipping boxes: twin-wall construction, waterproof, reusable 50+ trips. Wholesale Elipacko.","Corrugated Plastic Shipping Boxes — What Twin-Wall PP Means","How PP twin-wall corrugated construction compares to regular cardboard corrugated.",
sec("#fff", h2("PP Twin-Wall vs Cardboard Corrugated") + table2(["Property","Cardboard Corrugated","PP Twin-Wall Corrugated"],
  [["Waterproof","No","Yes"],["Reuse","1–5 trips","50+ trips"],["Structural wet","Collapses","Unchanged"],["Weight","Light","Slightly heavier"],["Recyclable","OCC (if dry)","100% PP #5"]]) +
p("PP twin-wall corrugated is produced by extruding two flat PP sheets with perpendicular internal ribs between them. The result is a rigid, lightweight panel that resists compression, bending, and moisture — all the properties cardboard corrugated achieves only when dry.") +
photos((SHIP_IMG1,"PP corrugated plastic shipping boxes twin-wall"),(SHIP_IMG2,"Corrugated plastic boxes PP wholesale"))),
[("What is twin-wall PP corrugated?","Two flat PP sheets with extruded internal ribs. Rigid, lightweight, waterproof — equivalent structure to cardboard corrugated but in plastic."),("Is PP corrugated the same as Coroplast?","Coroplast is a brand of PP twin-wall corrugated. Elipacko produces the same material category."),("How thick is PP corrugated shipping boxes?","Standard: 4mm. Heavy: 6mm, 8mm."),("Are PP corrugated boxes recyclable?","Yes. 100% PP resin code #5."),("MOQ?","One 40HQ container.")]),

("sustainable-shipping-boxes","Sustainable Shipping Boxes — PP Corrugated Environmental Case","PP corrugated reusable shipping boxes vs single-use cardboard: environmental comparison. 50+ reuse, 100% recyclable.","Sustainable Shipping Boxes — Why Reusable PP Beats Single-Use Cardboard","The environmental case for PP reusable shipping boxes over single-use cardboard or wax.",
sec("#fff", h2("Environmental Comparison") + table2(["Factor","Single-Use Cardboard","PP Reusable Box"],
  [["Production energy per use","Full box each use","Amortized over 50 uses"],["End-of-life","OCC recycling (if dry/not waxed)","100% PP #5 recyclable"],
   ["Service life","1–5 uses","50+ uses"],["Wax cardboard recyclable?","No — wax contaminates OCC","N/A"]]) +
p("The lifecycle environmental impact of PP reusable boxes is significantly lower than single-use cardboard when production energy is amortized across 50+ uses. The manufacturing energy of one PP box spread over 50 trips equals the energy of manufacturing 1–2 cardboard boxes.") +
photos((SHIP_IMG1,"Sustainable PP shipping boxes reusable"),(SHIP_IMG2,"Sustainable corrugated plastic boxes"))),
[("Are PP shipping boxes more sustainable than cardboard?","Yes when reused 50+ times. Manufacturing energy amortized over 50 uses = ~2% of single-use cardboard's lifecycle energy."),("Can PP corrugated boxes be recycled?","Yes. PP resin code #5. Fully recyclable at end of service life."),("Can wax cardboard shipping boxes be recycled?","No. Wax contaminates the OCC recycling stream."),("What is the carbon footprint of reusable PP vs cardboard?","Lifecycle studies show 50-trip PP boxes have 60–80% lower carbon footprint per trip vs single-use cardboard at the same trip count."),("MOQ?","One 40HQ container.")]),

("wholesale-reusable-boxes","Wholesale Reusable Boxes — Factory Direct PP Pricing","Buy wholesale reusable PP shipping boxes from Elipacko. Container-load pricing, custom sizes, 0% anti-dumping duty.","Wholesale Reusable Shipping Boxes — Factory Direct","Factory-direct wholesale pricing on PP reusable boxes. No distributor markup.",
sec("#fff", h2("Wholesale PP Reusable Box Pricing") + table2(["Size","US Distributor","Elipacko Direct","Savings"],
  [["Small (12×9×6 in)","$15–$25","$7–$12","40–50%"],["Medium (18×12×8 in)","$25–$40","$12–$20","40–50%"],
   ["Large (24×18×12 in)","$40–$65","$20–$32","40–50%"]]) +
p("One 40HQ container holds 500–1,500 units depending on box size. Factory-direct pricing eliminates the 40–60% distributor markup on domestic PP reusable box pricing.") +
infobox("0% anti-dumping duty on PP corrugated boxes from China.") +
photos((SHIP_IMG1,"Wholesale reusable boxes PP factory direct"),(SHIP_IMG2,"Wholesale PP corrugated boxes"))),
[("What is the MOQ for wholesale reusable boxes?","One 40HQ container."),("How much does wholesale PP box freight cost?","$3,500–$5,000 per 40HQ to US West Coast."),("Can I get custom sizes at wholesale?","Yes on container-load orders."),("How long does a wholesale order take?","17–24 days to US West Coast."),("Is private label available?","Yes at container-load quantities.")]),

("buy-reusable-shipping-boxes","Buy Reusable Shipping Boxes — Elipacko Ordering Guide","How to buy PP reusable shipping boxes from Elipacko. Quote process, sizes, lead times, customs.","Buy Reusable Shipping Boxes — Complete Ordering Guide","Step-by-step guide to ordering PP reusable shipping boxes from Elipacko factory-direct.",
sec("#fff", h2("How to Order Reusable PP Shipping Boxes") +
'<ol style="padding-left:20px;color:#374151;font-size:.96rem;line-height:2;margin-bottom:14px"><li>Contact Elipacko at <a href="https://elipacko.com/pp-corrugated-boxes/" style="color:#1a6bdb">elipacko.com/pp-corrugated-boxes</a></li><li>Specify box dimensions, wall thickness, quantity, color, destination port</li><li>Receive CIF quote within 24 hours</li><li>Confirm and approve</li><li>Production: 3 days</li><li>Ocean freight: 14–21 days to US West Coast</li></ol>' +
table2(["Box Size","Units per 40HQ"],[["Small","1,000–1,500"],["Medium","600–900"],["Large","300–500"]]) +
infobox("0% anti-dumping duty. Total landed cost = unit price + ocean freight + ~3.4% standard import duty.") +
photos((SHIP_IMG1,"Buy reusable shipping boxes Elipacko"),(SHIP_IMG2,"PP reusable box ordering guide factory"))),
[("MOQ?","One 40HQ container."),("Lead time?","17–24 days to US West Coast."),("Can I get samples?","Contact Elipacko directly — sample availability depends on production schedule."),("Import documentation?","Commercial invoice, packing list, bill of lading, HS code. Elipacko provides all export docs."),("Anti-dumping duty?","0%.")]),

("faq","Reusable Shipping Box FAQ","FAQ: PP reusable shipping boxes — trips, waterproofing, flat-pack, ordering.","Reusable Shipping Box FAQ","All common questions about PP reusable shipping boxes.",
sec("#fff",photos((SHIP_IMG1,"Reusable shipping box FAQ PP"),(SHIP_IMG2,"PP corrugated box FAQ wholesale"))),
[("How many trips?","50+ trips. 5–10 year service life."),("Waterproof?","100%."),("Flat-pack?","Yes — empties flat for return shipping."),("Recyclable?","Yes — PP #5."),("MOQ?","One 40HQ container."),("Anti-dumping?","0%."),("Custom sizes?","Yes on container-load."),("Food-grade?","Available."),("ISPM-15?","Not required."),("Lead time?","17–24 days.")])
]

print(f"\nreusableshippingboxes.com:")
for args in SHIP_PAGES:
    page_slug = args[0]
    SHIP_HERO = photos((f"{CDN}/pp-gaylord-box-1.jpg","Reusable PP corrugated box wholesale"),(f"{CDN}/pp-gaylord-box-2.jpg","PP reusable shipping box stacked"),(f"{CDN}/pp-gaylord-on-pallet-strapped.jpg","PP reusable boxes on pallet"))
    words = build_page("reusableshippingboxes", page_slug, SHIP_COLOR, SHIP_COLOR2, "reusableshippingboxes.com", *args[1:], hero_photos_html=SHIP_HERO)
    print(f"  ✓ {page_slug} — ~{words} words")

print("\n✓ All subpages complete!")
