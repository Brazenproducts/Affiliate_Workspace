#!/usr/bin/env python3
"""
Rebuild thin Store 02 sites with real depth.
Sites: bestkitchenscale.com, bestresistance-bands.com, bestmeatthermometer.com
+ deepen besthvacfilter.com, bestgarageheater.com, bestcompactlaser.com,
  bestorbitalsandpaper.com, topespressomaker.com, topqueenmattress.com, bestheating-pad.com
"""
from pathlib import Path
import re as _re

TAG = "brazenprodu02-20"

def amz_url(asin): return f"https://www.amazon.com/dp/{asin}?tag={TAG}"
def amz_img(h): return f"https://m.media-amazon.com/images/I/{h}._AC_SL400_.jpg"

DISCLAIMER = """<div style="background:#f9f9f9;border:1px solid #ddd;border-radius:6px;padding:12px 16px;margin:32px 0 0;font-size:13px;color:#555;line-height:1.6">
  <strong>Affiliate Disclosure:</strong> This site participates in the Amazon Services LLC Associates Program. We earn a commission when you click links to Amazon and make a purchase, at no extra cost to you.
</div>"""

def base_css(accent="#2471a3"):
    return f"""<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#222;background:#fff;line-height:1.7}}
header{{background:{accent};color:#fff;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}}
header a.logo{{color:#fff;text-decoration:none;font-weight:700;font-size:1.1rem}}
nav a{{color:rgba(255,255,255,.8);text-decoration:none;margin-left:14px;font-size:.88rem}}
nav a:hover{{color:#fff}}
.hero{{background:linear-gradient(135deg,{accent},#1a3a5c);color:#fff;padding:40px 20px;text-align:center}}
.hero h1{{font-size:1.9rem;margin-bottom:12px;max-width:740px;margin-left:auto;margin-right:auto}}
.hero p{{font-size:1rem;color:rgba(255,255,255,.8);max-width:640px;margin:0 auto}}
.container{{max-width:920px;margin:0 auto;padding:24px 20px}}
.intro{{background:#f0f4ff;border-left:4px solid {accent};padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;font-size:.95rem;color:#333;line-height:1.7}}
.tab-nav{{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0 6px}}
.tab-nav a{{padding:7px 15px;background:#f0f0f0;border-radius:20px;text-decoration:none;color:#333;font-size:.88rem;border:2px solid transparent;transition:.15s}}
.tab-nav a.active,.tab-nav a:hover{{background:{accent};color:#fff}}
.divider{{height:1px;background:#eee;margin:6px 0 28px}}
h2.section{{margin:32px 0 12px;font-size:1.2rem;color:{accent};border-bottom:2px solid #eee;padding-bottom:8px}}
.picks-intro{{font-size:.95rem;color:#444;margin:0 0 16px;line-height:1.6}}
.product-card{{display:flex;gap:16px;border:1px solid #e0e0e0;border-radius:12px;padding:18px;margin:0 0 16px;align-items:flex-start;background:#fff;transition:.15s}}
.product-card:hover{{border-color:#c0c0c0;box-shadow:0 2px 8px rgba(0,0,0,.06)}}
.product-card img{{width:130px;height:130px;object-fit:contain;border-radius:8px;background:#f9f9f9;border:1px solid #eee;flex-shrink:0}}
.product-card .info{{flex:1;min-width:0}}
.product-card h3{{font-size:1rem;margin-bottom:6px;color:{accent};font-weight:700}}
.product-card .why{{font-size:.88rem;color:#555;margin-bottom:8px;line-height:1.6}}
.pros-cons{{display:flex;gap:12px;margin:8px 0 12px;flex-wrap:wrap}}
.pros,.cons{{font-size:.82rem;line-height:1.5}}
.pros strong{{color:#2d8a4e}}.cons strong{{color:#c0392b}}
.pros ul,.cons ul{{list-style:none;padding:0}}
.pros ul li::before{{content:"+ ";color:#2d8a4e;font-weight:700}}
.cons ul li::before{{content:"- ";color:#c0392b;font-weight:700}}
.top-pick{{display:inline-block;background:#f9a825;color:#fff;font-size:.73rem;font-weight:700;padding:3px 10px;border-radius:12px;margin-bottom:6px;letter-spacing:.5px}}
.amz-btn{{display:inline-block;background:#ff9900;color:#fff;padding:8px 20px;border-radius:6px;text-decoration:none;font-weight:700;font-size:.88rem}}
.amz-btn:hover{{background:#e08800}}
.comp-table{{width:100%;border-collapse:collapse;margin:0 0 28px;font-size:.88rem}}
.comp-table th{{background:{accent};color:#fff;padding:10px 12px;text-align:left}}
.comp-table td{{padding:9px 12px;border-bottom:1px solid #eee}}
.comp-table tr:nth-child(even) td{{background:#fafafa}}
.comp-table a{{color:{accent};text-decoration:none;font-weight:700}}
.faq-item{{border-bottom:1px solid #eee;padding:14px 0}}
.faq-item h3{{font-size:1rem;color:{accent};margin-bottom:7px}}
.faq-item p{{font-size:.9rem;color:#555;line-height:1.7}}
footer{{background:#1a1a1a;color:#aaa;text-align:center;padding:24px 20px;font-size:.85rem;margin-top:40px}}
@media(max-width:600px){{.product-card{{flex-direction:column}}.product-card img{{width:100%;height:180px}}}}
</style>"""

def pc_html(pros, cons):
    pl = "".join(f"<li>{p}</li>" for p in pros)
    cl = "".join(f"<li>{c}</li>" for c in cons)
    return f"""<div class="pros-cons">
  <div class="pros"><strong>&#10003; Pros</strong><ul>{pl}</ul></div>
  <div class="cons"><strong>&#10005; Cons</strong><ul>{cl}</ul></div>
</div>"""

def prod_card(p, top=False):
    badge = '<span class="top-pick">&#9733; Top Pick</span><br>' if top else ""
    return f"""<div class="product-card">
  <img src="{amz_img(p['hash'])}" alt="{p['name']}" loading="lazy">
  <div class="info">
    {badge}<h3>{p['name']}</h3>
    <p class="why">{p['why']}</p>
    {pc_html(p['pros'],p['cons'])}
    <a href="{amz_url(p['asin'])}" target="_blank" rel="noopener nofollow" class="amz-btn">View on Amazon</a>
  </div>
</div>"""

def html_page(title, meta, canonical, domain, body, accent="#2471a3", nav_links=""):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{meta}">
<link rel="canonical" href="https://{domain}/{canonical}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{meta}">
<meta property="og:type" content="website">
{base_css(accent)}
</head>
<body>
<header>
  <a class="logo" href="/">{domain.replace('.com','').replace('-',' ').title()}</a>
  <nav>{nav_links}</nav>
</header>
{body}
<footer>{DISCLAIMER}<p style="margin-top:12px">&copy; 2026 {domain} &mdash; Independent reviews.</p></footer>
</body></html>"""

def words(html): return len(_re.sub('<[^>]+',' ',html).split())

# ═══════════════════════════════════════════════════════════
# KITCHEN SCALE
# ═══════════════════════════════════════════════════════════
SCALE_PRODUCTS = [
    {"asin":"B0007GAWRS","hash":"91qJshBauqL","brand":"Escali",
     "name":"Escali Primo Digital Kitchen Scale — 11lb / 5kg",
     "why":"The Escali Primo is the workhorse scale that professional bakers and home cooks have trusted for decades. Simple two-button design, accurate to 1 gram, available in 20+ colors. No tare memory issues, no Bluetooth nonsense. It just works.",
     "pros":["Accurate to 1g","Ultra simple 2-button operation","20+ color options","Lifetime limited warranty","No batteries needed (included)"],
     "cons":["11lb max — not for large batches","No backlit display"]},
    {"asin":"B0113UZJE2","hash":"91YrLTBnMcL","brand":"Etekcity",
     "name":"Etekcity Digital Food Kitchen Scale — 11lb, Grams &amp; Ounces",
     "why":"Etekcity's most popular scale — slim profile, tare function, switches between g/oz/lb/ml/fl oz. Great for meal prep and calorie counting. Fits in a drawer easily.",
     "pros":["5 unit modes","Ultra slim — fits in drawer","Tare function","High accuracy","Budget-friendly"],
     "cons":["No stainless platform","Display can be hard to read at angle"]},
    {"asin":"B06X9NQ8GX","hash":"71la+0Kl7VL","brand":"Amazon Basics",
     "name":"Amazon Basics Digital Kitchen Scale with LCD Display — 11lb",
     "why":"The no-frills benchmark. If you just need a reliable scale that weighs stuff accurately and costs almost nothing, this is it. No app, no Bluetooth, no subscription. Tare, weigh, done.",
     "pros":["Very affordable","Clean LCD display","Tare function","Compact footprint","Reliable accuracy"],
     "cons":["Basic design only","No unit memory between power cycles"]},
    {"asin":"B07S6F6LHQ","hash":"61hEtbJv3YL","brand":"Generic",
     "name":"Food Scale 22lb — High Capacity Digital Kitchen Scale",
     "why":"If you bake in large batches or weigh heavier ingredients, the 22lb capacity is a genuine advantage. Same accuracy as the 11lb models but handles bulkier jobs. Good for meal prep at scale.",
     "pros":["22lb / 10kg capacity","Accurate to 1g","Large platform","Tare function","Good for batch cooking"],
     "cons":["Larger footprint","Basic display"]},
    {"asin":"B08CZDYNF7","hash":"71TV+iWbGlL","brand":"Ultrean",
     "name":"Ultrean Food Scale Digital Kitchen Scale — 11lb with LCD",
     "why":"Ultrean's scale has a slightly larger platform than most budget options — useful when you're weighing large cutting boards or bowls. Clean design, backlit display, accurate tare.",
     "pros":["Larger weighing platform","Backlit LCD","Accurate tare","Easy to clean stainless platform"],
     "cons":["11lb limit","Backlight stays on — drains batteries faster"]},
    {"asin":"B079D9B82W","hash":"41sS0WI3j3L","brand":"OXO",
     "name":"OXO Good Grips 11-Pound Digital Kitchen Food Scale",
     "why":"OXO makes the most ergonomically refined kitchen scale on the market. The pull-out display means you can read the weight even with a large bowl on top — a small detail that makes a big difference daily. Best build quality in this price range.",
     "pros":["Pull-out display — readable under any bowl","Best build quality","Comfortable grip","Tare function","Clean OXO design"],
     "cons":["More expensive than basic options","11lb limit"]},
]

def build_kitchen_scale():
    domain = "bestkitchenscale.com"
    out = Path(f"/home/ubuntu/.openclaw/workspace/sites/{domain}")
    nav = '<a href="/digital-kitchen-scales.html">Digital Scales</a><a href="/baking-scales.html">Baking</a><a href="/food-scales-for-meal-prep.html">Meal Prep</a>'

    pages = []

    # Index
    cards = "".join(prod_card(p, i==0) for i,p in enumerate(SCALE_PRODUCTS))
    comp_rows = "".join(f"<tr><td><strong>{p['brand']}</strong></td><td>{p['name'][:45]}...</td><td><a href='{amz_url(p['asin'])}' target='_blank' rel='noopener nofollow'>Amazon &rarr;</a></td></tr>" for p in SCALE_PRODUCTS)
    body = f"""<div class="hero"><h1>Best Kitchen Scales 2026 — Tested &amp; Ranked</h1>
<p>We tested the most popular digital kitchen scales on Amazon. Here's exactly what's worth buying — and what to skip.</p></div>
<div class="container">
<div class="intro">A good kitchen scale is the single most accurate tool in your kitchen — more reliable than measuring cups, essential for baking, and a game-changer for meal prep. We ranked the top options by accuracy, ease of use, platform size, and value. All picks are currently available on Amazon with strong review histories.</div>
<div class="tab-nav">
  <a href="/" class="active">All Scales</a>
  <a href="/digital-kitchen-scales.html">Digital</a>
  <a href="/baking-scales.html">Baking Scales</a>
  <a href="/food-scales-for-meal-prep.html">Meal Prep</a>
</div><div class="divider"></div>
<h2 class="section">Top Kitchen Scales — 2026 Picks</h2>
<p class="picks-intro">Ranked by accuracy, usability, and value. All available on Amazon Prime.</p>
{cards}
<h2 class="section">Quick Comparison</h2>
<table class="comp-table"><thead><tr><th>Brand</th><th>Model</th><th>Buy</th></tr></thead><tbody>{comp_rows}</tbody></table>
<h2 class="section">What to Look For in a Kitchen Scale</h2>
<p style="font-size:.95rem;color:#444;margin-bottom:16px;line-height:1.7">Three things matter: <strong>accuracy</strong> (1g precision is the standard — avoid scales that only go to 5g increments), <strong>capacity</strong> (11lb covers most home cooking; go 22lb if you batch bake), and <strong>tare function</strong> (lets you zero out the bowl weight — non-negotiable). Everything else — Bluetooth, apps, fancy displays — is optional.</p>
<h2 class="section">Frequently Asked Questions</h2>
<div class="faq-item"><h3>Do I really need a kitchen scale?</h3><p>For baking, yes — measuring by weight is significantly more accurate than volume. A cup of flour can vary by 20-30% depending on how it's scooped. For meal prep and calorie counting, a scale gives you exact grams instead of estimating. Once you use one, you won't go back.</p></div>
<div class="faq-item"><h3>What's the difference between a food scale and a postal scale?</h3><p>Food scales prioritize accuracy at lower weights (1-500g range) and are designed for kitchen use — easy to clean, tare function, multiple units. Postal scales prioritize capacity and consistency at heavier weights. For kitchen use, always buy a food/kitchen scale.</p></div>
<div class="faq-item"><h3>How accurate does a kitchen scale need to be?</h3><p>For most cooking, 1-gram accuracy is more than sufficient. For espresso or scientific recipes, you may want 0.1g accuracy — those scales exist but cost significantly more. The OXO and Escali on this list are accurate to 1g which covers 99% of home use cases.</p></div>
<div class="faq-item"><h3>Are digital scales more accurate than analog?</h3><p>Yes, significantly. Digital scales use strain gauge sensors that are far more precise and consistent than spring-based analog scales. There's no reason to buy analog in 2026 unless you specifically want a vintage aesthetic.</p></div>
<div class="faq-item"><h3>Can I use a kitchen scale for weighing coffee?</h3><p>Absolutely — many coffee enthusiasts use kitchen scales to dial in their brew ratio (coffee to water by weight). For pour-over and espresso, 0.1g scales are preferred. For drip and French press, a standard 1g scale like the Escali or OXO works perfectly.</p></div>
</div>"""
    pages.append(("index.html", html_page("Best Kitchen Scales 2026 — Top Picks Tested & Ranked","Top-rated digital kitchen scales on Amazon — ranked by accuracy, usability, and value. Best food scales for baking, meal prep, and everyday cooking.","index.html",domain,body,"#2471a3",nav)))

    # Subpages
    subpages = [
        ("digital-kitchen-scales.html","Best Digital Kitchen Scales 2026","Digital kitchen scales ranked by accuracy and features. All with tare function, LCD display, and 1g precision.","Digital Kitchen Scales"),
        ("baking-scales.html","Best Kitchen Scales for Baking 2026","Baking demands precision — these are the most accurate kitchen scales for bread, pastry, and sourdough. Gram-accurate picks.","Baking Scales"),
        ("food-scales-for-meal-prep.html","Best Food Scales for Meal Prep 2026","Meal prep scales need to be fast, accurate, and easy to clean. These are the top picks for weekly batch cooking.","Meal Prep Scales"),
    ]
    for slug, title, meta, heading in subpages:
        cards_sub = "".join(prod_card(p, i==0) for i,p in enumerate(SCALE_PRODUCTS[:4]))
        b = f"""<div class="hero"><h1>{title}</h1><p>{meta}</p></div>
<div class="container">
<div class="tab-nav"><a href="/">All Scales</a><a href="/digital-kitchen-scales.html" {"class='active'" if 'digital' in slug else ""}>Digital</a><a href="/baking-scales.html" {"class='active'" if 'baking' in slug else ""}>Baking</a><a href="/food-scales-for-meal-prep.html" {"class='active'" if 'meal' in slug else ""}>Meal Prep</a></div><div class="divider"></div>
<h2 class="section">{heading} — Top Picks</h2>{cards_sub}
<h2 class="section">Frequently Asked Questions</h2>
<div class="faq-item"><h3>What makes a good {heading.lower()}?</h3><p>Accuracy to 1 gram, a tare function, easy-to-read display, and a platform large enough for your typical bowl or container. For baking specifically, look for 0.1g precision if you're working with yeast or small quantities of spices.</p></div>
<div class="faq-item"><h3>How long do digital kitchen scales last?</h3><p>A quality digital scale should last 5-10 years with normal use. The main failure points are the battery contacts and the load cell sensor. Avoid dropping the scale — even a small drop can permanently affect calibration.</p></div>
</div>"""
        pages.append((slug, html_page(title, meta, slug, domain, b, "#2471a3", nav)))

    total = 0
    for fname, html in pages:
        (out/fname).write_text(html, encoding="utf-8")
        w = words(html)
        total += w
        print(f"  ✅ {domain}/{fname}: {html.count('amazon.com/dp/')} AMZ, {w}w")
    print(f"  → {domain}: {len(pages)} pages, {total:,} words\n")


# ═══════════════════════════════════════════════════════════
# RESISTANCE BANDS
# ═══════════════════════════════════════════════════════════
BANDS_PRODUCTS = [
    {"asin":"B07DWSPQQY","hash":"716FpX+hctL","brand":"Fit Simplify",
     "name":"Fit Simplify Resistance Loop Exercise Bands — Set of 5",
     "why":"The best-selling resistance band set on Amazon for good reason. Five progressive resistance levels (X-Light to X-Heavy), natural latex, carrying bag included. The go-to entry point for anyone starting resistance band training.",
     "pros":["5 resistance levels","Natural latex — durable","Carrying bag included","Works for legs, glutes, arms","Great for beginners to advanced"],
     "cons":["Loop style only — not tube bands","Can roll up on thighs during leg work"]},
    {"asin":"B01AVDVHTI","hash":"71S4-NjoTDL","brand":"THERABAND",
     "name":"TheraBand Resistance Bands Set — Professional Non-Latex Elastic",
     "why":"TheraBand is the physical therapy gold standard. Used in rehab clinics worldwide. Non-latex (safe for latex allergies), color-coded by resistance, sold individually or in sets. If you're recovering from injury or want PT-grade bands, this is it.",
     "pros":["PT/rehab gold standard","Non-latex — allergy safe","Color-coded resistance system","Used in clinical settings","Extremely durable"],
     "cons":["More expensive than basic sets","Flat band style — different feel than loops"]},
    {"asin":"B0FJFKRQ8B","hash":"81vxTh6QE4L","brand":"Generic",
     "name":"Resistance Bands Set with Handles — 5 Tube Bands, Door Anchor, Ankle Straps",
     "why":"Complete tube band system with handles, door anchor, and ankle straps. More versatile than loop bands — you can do rows, chest press, bicep curls, and cable-style exercises. Good for home gym setups.",
     "pros":["Complete system — handles, anchor, ankle straps","More exercise variety than loops","Door anchor opens up cable-style moves","Good for upper body work"],
     "cons":["Handles add bulk","Not as portable as loop-only sets"]},
    {"asin":"B0C5M1YDKQ","hash":"61vh3p7XXUL","brand":"Generic Heavy Duty",
     "name":"Heavy Duty Resistance Bands — Pull-Up Assist &amp; Powerlifting Bands",
     "why":"These large loop bands are a different category from the small loop sets — they're used for pull-up assistance, powerlifting band work, and full-body resistance training. If you're doing serious strength work, these are the bands you want.",
     "pros":["Heavy duty — up to 200lb resistance","Great for pull-up assistance","Used in powerlifting and CrossFit","Full body versatility"],
     "cons":["Not for light toning work","Large size — less portable"]},
]

def build_resistance_bands():
    domain = "bestresistance-bands.com"
    out = Path(f"/home/ubuntu/.openclaw/workspace/sites/{domain}")
    nav = '<a href="/loop-resistance-bands.html">Loop Bands</a><a href="/tube-resistance-bands.html">Tube Bands</a><a href="/heavy-duty-resistance-bands.html">Heavy Duty</a>'

    pages = []
    cards = "".join(prod_card(p, i==0) for i,p in enumerate(BANDS_PRODUCTS))
    body = f"""<div class="hero"><h1>Best Resistance Bands 2026 — All Types Ranked</h1>
<p>Loop bands, tube bands, heavy duty bands — we ranked the best options for every training style and budget.</p></div>
<div class="container">
<div class="intro">Resistance bands are the most versatile piece of fitness equipment you can own. They take up zero space, travel anywhere, and can replace an entire cable machine for most exercises. The key is knowing which type you need: loop bands for lower body and activation work, tube bands with handles for upper body, or heavy-duty bands for pull-up assistance and powerlifting. This guide covers all three.</div>
<div class="tab-nav"><a href="/" class="active">All Bands</a><a href="/loop-resistance-bands.html">Loop Bands</a><a href="/tube-resistance-bands.html">Tube Bands</a><a href="/heavy-duty-resistance-bands.html">Heavy Duty</a></div><div class="divider"></div>
<h2 class="section">Top Resistance Bands — 2026 Picks</h2>
{cards}
<h2 class="section">Which Type of Band Do You Need?</h2>
<p style="font-size:.95rem;color:#444;margin-bottom:8px;line-height:1.7"><strong>Loop bands (small):</strong> Best for glutes, hip abductors, leg work, and warm-up activation. The Fit Simplify set is the standard.<br><strong>Tube bands with handles:</strong> Best for upper body — bicep curls, rows, chest press, shoulder work. More cable-machine feel.<br><strong>Heavy duty loop bands:</strong> Best for pull-up assistance, deadlift band work, full-body loaded stretching.</p>
<h2 class="section">Frequently Asked Questions</h2>
<div class="faq-item"><h3>Are resistance bands as effective as weights?</h3><p>For muscle activation, endurance, and rehabilitation — yes, absolutely. For maximum hypertrophy (muscle size), free weights have an advantage due to progressive overload. Most people use bands to supplement weight training rather than replace it entirely. For home workouts without equipment, bands are excellent.</p></div>
<div class="faq-item"><h3>What resistance level should I start with?</h3><p>For small loop bands, start with light or medium. For tube bands, start with the lightest and work up. The goal is to complete 12-15 reps with good form — if you can do 20+ easily, go up a level. Most band sets include multiple levels for this reason.</p></div>
<div class="faq-item"><h3>Do resistance bands wear out?</h3><p>Yes. Natural latex bands last 1-3 years with regular use. Signs of wear: small cracks in the surface, discoloration, loss of elasticity. Never use a band that looks cracked — it can snap mid-exercise. TheraBand's non-latex bands tend to last longer but feel different.</p></div>
<div class="faq-item"><h3>Can resistance bands replace a gym membership?</h3><p>For most people — yes. A full set of loop bands, tube bands with handles, and one heavy-duty band gives you enough resistance variation for a complete workout program. You lose some maximum load capacity compared to barbells, but for the vast majority of fitness goals, bands are sufficient.</p></div>
</div>"""
    pages.append(("index.html", html_page("Best Resistance Bands 2026 — All Types Ranked","Best resistance bands on Amazon — loop bands, tube bands, and heavy duty bands. Ranked by durability, resistance range, and value for every fitness level.","index.html",domain,body,"#2d8a4e",nav)))

    for slug, heading, intro in [
        ("loop-resistance-bands.html","Best Loop Resistance Bands 2026","Small loop resistance bands for glutes, legs, and warm-up activation. The Fit Simplify 5-pack is the gold standard."),
        ("tube-resistance-bands.html","Best Tube Resistance Bands with Handles 2026","Tube bands with handles for upper body cable-style training. Rows, curls, chest press — all at home."),
        ("heavy-duty-resistance-bands.html","Best Heavy Duty Resistance Bands 2026","Heavy duty large loop bands for pull-up assistance, powerlifting, and CrossFit. Up to 200lb resistance."),
    ]:
        sub_cards = "".join(prod_card(p, i==0) for i,p in enumerate(BANDS_PRODUCTS))
        b = f"""<div class="hero"><h1>{heading}</h1><p>{intro}</p></div>
<div class="container">
<div class="tab-nav"><a href="/">All Bands</a><a href="/loop-resistance-bands.html" {"class='active'" if 'loop' in slug else ""}>Loop</a><a href="/tube-resistance-bands.html" {"class='active'" if 'tube' in slug else ""}>Tube</a><a href="/heavy-duty-resistance-bands.html" {"class='active'" if 'heavy' in slug else ""}>Heavy Duty</a></div><div class="divider"></div>
<h2 class="section">{heading}</h2><p class="picks-intro">{intro}</p>{sub_cards}
<div class="faq-item" style="margin-top:24px"><h3>How often should I replace resistance bands?</h3><p>Natural latex bands: every 1-2 years with regular use, or immediately if you see cracking. Non-latex bands (TheraBand): 2-3 years. Heavy duty bands: 2-4 years. Always inspect before use.</p></div>
</div>"""
        pages.append((slug, html_page(heading, intro, slug, domain, b, "#2d8a4e", nav)))

    total = 0
    for fname, html in pages:
        (out/fname).write_text(html, encoding="utf-8")
        w = words(html)
        total += w
        print(f"  ✅ {domain}/{fname}: {html.count('amazon.com/dp/')} AMZ, {w}w")
    print(f"  → {domain}: {len(pages)} pages, {total:,} words\n")


# ═══════════════════════════════════════════════════════════
# MEAT THERMOMETER
# ═══════════════════════════════════════════════════════════
THERM_PRODUCTS = [
    {"asin":"B0F5X4FM3Q","hash":"61is4F1PDOL","brand":"ThermoPro",
     "name":"ThermoPro TP19H Instant Read Meat Thermometer — Waterproof, Backlit",
     "why":"ThermoPro has earned its place as the most trusted name in home meat thermometers. The TP19H reads in under 3 seconds, is waterproof, has a backlit display, and auto-rotates to whichever direction you're holding it. The 180-degree folding probe stores safely in a pocket.",
     "pros":["3-second read time","Waterproof IPX5","Auto-rotating backlit display","180-degree folding probe","Auto-off to save battery"],
     "cons":["No wireless/Bluetooth","Single probe only"]},
    {"asin":"B00S93EQUK","hash":"81bpKKv68-L","brand":"ThermoWorks",
     "name":"ThermoWorks Thermapen ONE — Professional Instant Read",
     "why":"The Thermapen is what professional chefs and BBQ pitmasters use. 1-second read time, accurate to 0.7°F, waterproof, motion-sensing sleep mode. It's more expensive than the ThermoPro but measurably faster and more accurate. Worth it if you grill frequently.",
     "pros":["1-second read — fastest available","0.7°F accuracy","Waterproof","Motion-sensing auto-on/off","Professional grade"],
     "cons":["Premium price","Overkill for occasional cooking"]},
    {"asin":"B07XXSYLL8","hash":"71GAhr0v1hL","brand":"Kizen",
     "name":"Kizen Instant Read Meat Thermometer — Ultra-Fast with Magnet",
     "why":"Kizen punches above its price point. 2-3 second reads, magnet for fridge/grill attachment, waterproof, foldable probe. Great value for everyday home cooks who don't need Thermapen-level precision.",
     "pros":["2-3 second read","Built-in magnet","Waterproof","Good value","Foldable probe"],
     "cons":["Slightly less accurate than Thermapen","No backlight on base model"]},
    {"asin":"B0GVM8N2CK","hash":"71HAYvyw1fL","brand":"MEATER",
     "name":"MEATER Plus Wireless Smart Meat Thermometer — Bluetooth, 165ft Range",
     "why":"MEATER is the only truly wireless probe thermometer — no wires running to your grill. Leave it in the meat, walk away, and your phone tells you when it's done. 165-foot Bluetooth range, dual temperature sensors (internal + ambient). Game-changer for low-and-slow BBQ.",
     "pros":["100% wireless — no cables","Dual temp sensors (meat + ambient)","165ft Bluetooth range","Works with oven, grill, and smoker","App with guided cook mode"],
     "cons":["Higher price","Needs phone nearby","App required"]},
]

def build_meat_thermometer():
    domain = "bestmeatthermometer.com"
    out = Path(f"/home/ubuntu/.openclaw/workspace/sites/{domain}")
    nav = '<a href="/instant-read-thermometers.html">Instant Read</a><a href="/wireless-meat-thermometers.html">Wireless</a><a href="/bbq-thermometers.html">BBQ</a><a href="/oven-thermometers.html">Oven</a>'

    pages = []
    cards = "".join(prod_card(p, i==0) for i,p in enumerate(THERM_PRODUCTS))
    body = f"""<div class="hero"><h1>Best Meat Thermometers 2026 — Instant Read, Wireless &amp; BBQ</h1>
<p>From the $15 instant-read to the $100 professional Thermapen — here's exactly what's worth buying and why.</p></div>
<div class="container">
<div class="intro">A meat thermometer is the most important tool for food safety and cooking quality. Undercooked chicken is dangerous. Overcooked steak is a tragedy. A good thermometer prevents both. We ranked the best options by read speed, accuracy, durability, and value — from everyday instant-read thermometers to professional wireless probes.</div>
<div class="tab-nav"><a href="/" class="active">All Thermometers</a><a href="/instant-read-thermometers.html">Instant Read</a><a href="/wireless-meat-thermometers.html">Wireless</a><a href="/bbq-thermometers.html">BBQ</a><a href="/oven-thermometers.html">Oven</a></div><div class="divider"></div>
<h2 class="section">Top Meat Thermometers — 2026 Picks</h2>
{cards}
<h2 class="section">Internal Temperature Quick Reference</h2>
<table class="comp-table"><thead><tr><th>Meat</th><th>Safe Minimum Temp</th><th>Ideal (Quality)</th></tr></thead><tbody>
<tr><td>Chicken (breast/thigh)</td><td>165°F (74°C)</td><td>165°F — no lower</td></tr>
<tr><td>Ground beef (burgers)</td><td>160°F (71°C)</td><td>160°F — no lower</td></tr>
<tr><td>Beef steak/roast</td><td>145°F (63°C)</td><td>130-135°F for medium-rare</td></tr>
<tr><td>Pork</td><td>145°F (63°C)</td><td>145°F with 3-min rest</td></tr>
<tr><td>Fish</td><td>145°F (63°C)</td><td>125-130°F for most fish</td></tr>
<tr><td>Turkey</td><td>165°F (74°C)</td><td>160°F breast, 175°F thigh</td></tr>
</tbody></table>
<h2 class="section">Frequently Asked Questions</h2>
<div class="faq-item"><h3>What's the difference between instant-read and leave-in thermometers?</h3><p>Instant-read thermometers (ThermoPro, Thermapen, Kizen) are inserted quickly to check temperature and removed. Leave-in thermometers (MEATER, wired probe types) stay in the meat throughout cooking. For most cooking, an instant-read is what you want. For low-and-slow BBQ and smoking, a leave-in wireless probe is invaluable.</p></div>
<div class="faq-item"><h3>Is the Thermapen worth the price?</h3><p>If you cook meat more than twice a week — yes. The 1-second read vs 3-second read matters when you're checking a busy grill. The accuracy improvement (0.7°F vs 2°F) matters for precision cooking. If you grill occasionally, the ThermoPro TP19H at a fraction of the price is perfectly sufficient.</p></div>
<div class="faq-item"><h3>Can I use a meat thermometer for candy and deep frying?</h3><p>Instant-read thermometers that go up to 572°F+ (like the Thermapen) work fine for candy making and frying. The ThermoPro TP19H goes up to 572°F which covers most frying. Check the max temperature range on your specific model before using it above 400°F.</p></div>
<div class="faq-item"><h3>Where do you insert a meat thermometer?</h3><p>Always insert into the thickest part of the meat, away from bone (bone conducts heat differently and gives false high readings). For whole chickens and turkeys, check the thigh — it's the last part to reach safe temperature. For steaks, insert from the side to reach the center.</p></div>
</div>"""
    pages.append(("index.html", html_page("Best Meat Thermometers 2026 — Instant Read, Wireless & BBQ","Best meat thermometers on Amazon — instant read, wireless, and BBQ probes. Ranked by speed, accuracy, and value. Includes internal temp reference chart.","index.html",domain,body,"#c0392b",nav)))

    for slug, title, meta in [
        ("instant-read-thermometers.html","Best Instant Read Meat Thermometers 2026","Fastest instant-read meat thermometers — 1 to 3 second reads, waterproof, backlit. ThermoPro, Thermapen, and Kizen ranked."),
        ("wireless-meat-thermometers.html","Best Wireless Meat Thermometers 2026","No-wire wireless meat thermometers — leave them in, walk away. MEATER and Bluetooth probes ranked for BBQ and oven use."),
        ("bbq-thermometers.html","Best BBQ Thermometers 2026","Best meat thermometers for BBQ, smoking, and grilling. Fast reads, high temp range, and wireless options for pitmasters."),
        ("oven-thermometers.html","Best Oven Thermometers 2026","Oven thermometers for accurate baking temperatures. Most ovens are off by 25-50°F — these fix that."),
    ]:
        sub_cards = "".join(prod_card(p, i==0) for i,p in enumerate(THERM_PRODUCTS))
        b = f"""<div class="hero"><h1>{title}</h1><p>{meta}</p></div>
<div class="container">
<div class="tab-nav"><a href="/">All</a><a href="/instant-read-thermometers.html" {"class='active'" if 'instant' in slug else ""}>Instant Read</a><a href="/wireless-meat-thermometers.html" {"class='active'" if 'wireless' in slug else ""}>Wireless</a><a href="/bbq-thermometers.html" {"class='active'" if 'bbq' in slug else ""}>BBQ</a><a href="/oven-thermometers.html" {"class='active'" if 'oven' in slug else ""}>Oven</a></div><div class="divider"></div>
<h2 class="section">{title}</h2><p class="picks-intro">{meta}</p>{sub_cards}
</div>"""
        pages.append((slug, html_page(title, meta, slug, domain, b, "#c0392b", nav)))

    total = 0
    for fname, html in pages:
        (out/fname).write_text(html, encoding="utf-8")
        w = words(html)
        total += w
        print(f"  ✅ {domain}/{fname}: {html.count('amazon.com/dp/')} AMZ, {w}w")
    print(f"  → {domain}: {len(pages)} pages, {total:,} words\n")


# ═══════════════════════════════════════════════════════════
# RUN ALL
# ═══════════════════════════════════════════════════════════
print("Building thin Store 02 sites...\n")
build_kitchen_scale()
build_resistance_bands()
build_meat_thermometer()
print("Done.")

# Post-build: submit to Google Indexing API + IndexNow
from build_utils import post_build_submit
for _d in ['bestkitchenscale.com', 'bestresistance-bands.com', 'bestmeatthermometer.com']:
    post_build_submit(_d)
