#!/usr/bin/env python3
"""
Build multi-page SEO affiliate sites for Elipacko backlink network.
Each site gets: index + 7 content pages + sitemap.xml + robots.txt + IndexNow key
"""
import os, re, shutil
from datetime import date

CDN = "https://brazenproducts.github.io/elipacko-assets"
TODAY = date.today().isoformat()
INDEXNOW_KEY = "e9c8f5a4b3d2c1a0f9e8d7c6b5a4e9c8"
BASE = "/home/ubuntu/.openclaw/workspace/elipacko-sites"
ELIPACKO_URL = "https://elipacko.com"

# ─────────────────────────────────────────────────────────────────────────────
# SITE DEFINITIONS
# ─────────────────────────────────────────────────────────────────────────────
SITES = [
  {
    "dir": "meatlugs",
    "domain": "meatlugs.com",
    "keyword": "meat lugs",
    "keyword_plural": "meat lugs",
    "title_kw": "Meat Lugs",
    "color": "#7f1d1d",
    "color2": "#b91c1c",
    "elipacko_page": "/pp-meat-lugs/",
    "tagline": "Food-Grade PP Meat Lugs for Processing Plants",
    "hero_desc": "Polypropylene meat lugs for abattoirs and meat processing facilities. FDA 21 CFR 177.1520, blast-freeze rated, stackable and nestable. Wholesale from Elipacko.",
    "photos": [
      (f"{CDN}/meat-lug-white-empty.jpg", "White PP meat lug tray empty stackable — Elipacko USA"),
      (f"{CDN}/meat-lug-5color-set.jpg", "PP meat lugs 5-color HACCP set — Elipacko USA"),
      (f"{CDN}/meat-lug-filled-meat.jpg", "PP meat lug filled with raw meat — Elipacko USA"),
    ],
    "specs": [
      ("Material","Food-grade impact copolymer PP"),
      ("Compliance","FDA 21 CFR 177.1520, USDA"),
      ("Temp Range","−20°F to 180°F"),
      ("Colors","White, red, blue, yellow, green"),
      ("Capacities","8 / 15 / 30 / 55 gal"),
      ("MOQ","250 units"),
      ("Lead Time","3–4 weeks to US port"),
      ("Anti-Dump Duty","0% (PP not subject)"),
    ],
    "features": [
      ("🧼","Non-Porous Surface","Closed-cell PP won't absorb blood, fat, or odor. Full HACCP biofilm prevention — sanitizes clean every cycle."),
      ("❄️","Blast-Freeze Rated","Copolymer PP stays tough at −20°F. No embrittlement, no cracking during freeze-thaw cycling."),
      ("🌡️","180°F Washdown Safe","Withstands high-pressure hot water sanitization between shifts without warping or deformation."),
      ("🎨","HACCP Color-Coding","Red for red meat, yellow for poultry, blue for fish, white for cooked. Stable pigment won't fade with chemical washing."),
      ("📦","Stackable Full","Stacking rails locate onto rim below — stable 4–6 high under full load on the pallet."),
      ("🔄","Nestable Empty","3:1 nest ratio — empties take 60% less space. Cut return transport and storage costs significantly."),
    ],
    "pages": [
      ("wholesale-meat-lugs", "Wholesale Meat Lugs — Bulk PP Containers for Meat Processing",
       "Buy wholesale PP meat lugs direct. Bulk pricing on food-grade polypropylene meat tubs for abattoirs, processors, and distributors.",
       "wholesale meat lugs bulk buy",
       "Wholesale Meat Lugs — Bulk PP Containers"),
      ("plastic-meat-lugs", "Plastic Meat Lugs — PP vs HDPE vs Stainless Comparison 2026",
       "Compare plastic meat lug materials. PP copolymer vs HDPE vs stainless steel for meat processing. Which lasts longer?",
       "plastic meat lugs comparison",
       "Plastic Meat Lugs — Material Comparison"),
      ("meat-lug-sizes", "Meat Lug Sizes — 8 Gallon to 55 Gallon PP Containers",
       "Full guide to meat lug sizes. 8-gallon trim lugs to 55-gallon offal bins. Capacity, dimensions, and stack height for every application.",
       "meat lug sizes dimensions capacity",
       "Meat Lug Sizes — Complete Guide"),
      ("food-grade-meat-containers", "Food-Grade Meat Containers — FDA Compliant PP Lugs",
       "FDA 21 CFR 177.1520 compliant PP meat containers. USDA accepted for direct food contact in meat processing facilities.",
       "food grade meat containers FDA",
       "Food-Grade Meat Containers"),
      ("meat-processing-tubs", "Meat Processing Tubs — Industrial PP Containers for Abattoirs",
       "Heavy-duty PP meat processing tubs for kill floors, deboning rooms, and cold chain. Industrial grade, 5–10 year service life.",
       "meat processing tubs industrial",
       "Meat Processing Tubs — Industrial Grade"),
      ("haccp-color-coded-lugs", "HACCP Color-Coded Meat Lugs — 5-Color PP System",
       "HACCP color-coded PP meat lugs. Red, yellow, white, blue, green for protein segregation. Stable food-grade pigment lasts through chemical washdowns.",
       "HACCP color coded meat lugs",
       "HACCP Color-Coded Meat Lugs"),
      ("buy-meat-lugs", "Buy Meat Lugs — PP Manufacturer Direct Pricing | Elipacko",
       "Where to buy PP meat lugs wholesale. Manufacturer direct pricing from Elipacko — the largest PP corrugated factory in Asia.",
       "buy meat lugs wholesale price",
       "Buy Meat Lugs — Wholesale Pricing"),
    ],
  },
  {
    "dir": "plasticgaylord",
    "domain": "plasticgaylord.com",
    "keyword": "plastic gaylord",
    "keyword_plural": "plastic gaylords",
    "title_kw": "Plastic Gaylord",
    "color": "#1e3a5f",
    "color2": "#1a6bdb",
    "elipacko_page": "/pp-gaylord-boxes/",
    "tagline": "Wholesale PP Plastic Gaylord Boxes — Manufacturer Direct",
    "hero_desc": "Polypropylene plastic gaylord boxes for bulk material handling. Stackable, reusable, 2000+ lb capacity. Manufacturer direct from Elipacko — Asia's largest PP factory.",
    "photos": [
      (f"{CDN}/pp-gaylord-box-1.jpg", "PP plastic gaylord box white bulk container — Elipacko USA"),
      (f"{CDN}/pp-gaylord-box-2.jpg", "PP gaylord box stacked warehouse — Elipacko USA"),
      (f"{CDN}/pp-gaylord-box-3.jpg", "PP gaylord corrugated box detail — Elipacko USA"),
      (f"{CDN}/pp-gaylord-on-pallet-strapped.jpg", "PP gaylord box on plastic pallet strapped — Elipacko USA"),
      (f"{CDN}/pp-gaylord-on-pallet-lidded.jpg", "PP gaylord box lidded on pallet — Elipacko USA"),
    ],
    "specs": [
      ("Material","PP corrugated twin-wall"),
      ("Capacity","Up to 2,200 lbs"),
      ("Volume","45–55 cu ft standard"),
      ("Colors","White, black, blue, custom"),
      ("Wall Thickness","4mm / 6mm / 8mm"),
      ("MOQ","One 40HQ container"),
      ("Lead Time","3–4 weeks to US port"),
      ("Anti-Dump Duty","0%"),
    ],
    "features": [
      ("💪","2,200 lb Capacity","Heavy-gauge PP corrugated walls handle bulk loads — grains, resins, hardware, produce. Outperforms cardboard in wet or humid conditions."),
      ("🔄","Reusable 50+ Cycles","PP gaylords last 5–10 years vs single-use cardboard. ROI typically under 6 months at volume."),
      ("💧","100% Waterproof","No moisture absorption — critical for food, produce, and outdoor staging. Cardboard fails; PP doesn't."),
      ("📦","Flat-Pack Ships Flat","Empty gaylords flat-pack for return shipping — cut reverse logistics costs dramatically."),
      ("🏗️","Forklift Compatible","4-way pallet base entry. Bottom reinforced for forklift tines and pallet jack movement."),
      ("♻️","Fully Recyclable","100% PP — resin code #5. Closed-loop recyclable at end of service life."),
    ],
    "pages": [
      ("pp-gaylord-boxes", "PP Gaylord Boxes — Polypropylene Bulk Containers Wholesale",
       "Wholesale PP corrugated gaylord boxes. 2,200 lb capacity, waterproof, reusable. Direct from Elipacko manufacturer.",
       "PP gaylord boxes wholesale",
       "PP Gaylord Boxes Wholesale"),
      ("reusable-gaylord-boxes", "Reusable Gaylord Boxes — PP vs Cardboard Cost Comparison",
       "Why reusable PP gaylord boxes beat cardboard at scale. Cost per use analysis, ROI calculator, and material comparison.",
       "reusable gaylord boxes PP vs cardboard",
       "Reusable Gaylord Boxes"),
      ("gaylord-box-dimensions", "Gaylord Box Dimensions — Standard Sizes and Custom Options",
       "Standard gaylord box dimensions and custom size guide. 45 x 48, 48 x 45, 40 x 48 inch footprints explained.",
       "gaylord box dimensions sizes",
       "Gaylord Box Dimensions Guide"),
      ("bulk-container-boxes", "Bulk Container Boxes — Industrial PP Gaylords for Warehouses",
       "Industrial bulk container boxes for warehouse, distribution, and manufacturing. PP corrugated gaylords with 2,200 lb rating.",
       "bulk container boxes industrial warehouse",
       "Bulk Container Boxes"),
      ("corrugated-plastic-gaylord", "Corrugated Plastic Gaylord — PP Twin-Wall Bulk Containers",
       "Corrugated plastic gaylord boxes with twin-wall PP construction. Waterproof, chemical resistant, forklift ready.",
       "corrugated plastic gaylord boxes",
       "Corrugated Plastic Gaylord"),
      ("gaylord-box-wholesale", "Gaylord Box Wholesale — Container-Load Pricing from Elipacko",
       "Wholesale gaylord box pricing direct from manufacturer. Container-load quantities, custom specs, 0% anti-dumping duty.",
       "gaylord box wholesale price",
       "Gaylord Box Wholesale Pricing"),
      ("heavy-duty-gaylord", "Heavy Duty Gaylord Boxes — 2200 lb PP Bulk Containers",
       "Heavy duty gaylord boxes rated to 2,200 lbs. 8mm wall PP corrugated for demanding industrial applications.",
       "heavy duty gaylord boxes 2200 lb",
       "Heavy Duty Gaylord Boxes"),
    ],
  },
  {
    "dir": "plasticgaylordbox",
    "domain": "plasticgaylordbox.com",
    "keyword": "plastic gaylord box",
    "keyword_plural": "plastic gaylord boxes",
    "title_kw": "Plastic Gaylord Box",
    "color": "#1e3a5f",
    "color2": "#1a6bdb",
    "elipacko_page": "/pp-gaylord-boxes/",
    "tagline": "Plastic Gaylord Boxes — PP Wholesale Direct",
    "hero_desc": "Polypropylene plastic gaylord boxes wholesale. Reusable, waterproof, 2,200 lb capacity. 0% anti-dumping duty entering the USA.",
    "photos": [
      (f"{CDN}/pp-gaylord-box-1.jpg", "Plastic gaylord box white PP bulk container — Elipacko"),
      (f"{CDN}/pp-gaylord-box-2.jpg", "Plastic gaylord box stacked — Elipacko"),
      (f"{CDN}/pp-gaylord-on-pallet-strapped.jpg", "Plastic gaylord box on pallet — Elipacko"),
    ],
    "specs": [
      ("Material","PP corrugated"),("Capacity","2,200 lbs"),("Volume","45–55 cu ft"),
      ("Colors","White, blue, black, custom"),("MOQ","One 40HQ container"),
      ("Duty","0% anti-dumping"),("Lead Time","3–4 weeks"),("Reuse","50+ cycles"),
    ],
    "features": [
      ("💧","Waterproof","No moisture absorption. PP gaylord boxes survive rain, condensation, and wet staging areas that destroy cardboard."),
      ("🔄","Reusable","50+ reuse cycles. PP gaylord boxes pay for themselves vs cardboard within months."),
      ("💪","Heavy Load Rated","2,200 lb capacity with 4-way forklift entry. Built for bulk grains, resins, produce, hardware."),
      ("📐","Custom Sizes","Custom dimensions, wall thickness (4mm–8mm), and color to match your operation."),
      ("♻️","Recyclable PP","100% resin code #5 recyclable at end of service life."),
      ("0️⃣","0% Anti-Dump Duty","PP corrugated is not subject to anti-dumping duty entering the USA."),
    ],
    "pages": [
      ("buy-plastic-gaylord-box", "Buy Plastic Gaylord Box — Wholesale PP Bulk Containers",
       "Where to buy plastic gaylord boxes wholesale. PP corrugated manufacturer direct pricing from Elipacko.",
       "buy plastic gaylord box wholesale",
       "Buy Plastic Gaylord Box"),
      ("plastic-gaylord-box-sizes", "Plastic Gaylord Box Sizes — 45x48 48x45 40x48 Standard Footprints",
       "Standard plastic gaylord box sizes. 45x48, 48x45, 40x48 inch footprints. Custom dimensions available from Elipacko.",
       "plastic gaylord box sizes dimensions",
       "Plastic Gaylord Box Sizes"),
      ("pp-gaylord-box", "PP Gaylord Box — Polypropylene Corrugated Bulk Containers",
       "PP polypropylene gaylord boxes for industrial bulk handling. Twin-wall corrugated construction, 2,200 lb rated.",
       "PP gaylord box polypropylene",
       "PP Gaylord Box"),
      ("reusable-plastic-gaylord", "Reusable Plastic Gaylord — Cost Per Use vs Cardboard",
       "Reusable plastic gaylord box cost analysis. PP pays for itself vs cardboard gaylords within 6–12 months at volume.",
       "reusable plastic gaylord cost",
       "Reusable Plastic Gaylord"),
      ("waterproof-gaylord-boxes", "Waterproof Gaylord Boxes — PP for Wet and Outdoor Applications",
       "Waterproof gaylord boxes for wet staging, outdoor storage, and refrigerated environments. PP corrugated won't absorb moisture.",
       "waterproof gaylord boxes outdoor",
       "Waterproof Gaylord Boxes"),
      ("gaylord-container-wholesale", "Gaylord Container Wholesale — Manufacturer Direct Pricing",
       "Wholesale gaylord container pricing direct from Elipacko. Container-load MOQ, fast production, 0% anti-dumping duty.",
       "gaylord container wholesale manufacturer",
       "Gaylord Container Wholesale"),
      ("corrugated-gaylord-box", "Corrugated Gaylord Box — PP Twin-Wall vs Single-Wall",
       "PP corrugated gaylord box comparison. Twin-wall vs single-wall construction. Which is right for your application?",
       "corrugated gaylord box twin wall",
       "Corrugated Gaylord Box"),
    ],
  },
  {
    "dir": "plasticgaylordboxes",
    "domain": "plasticgaylordboxes.com",
    "keyword": "plastic gaylord boxes",
    "keyword_plural": "plastic gaylord boxes",
    "title_kw": "Plastic Gaylord Boxes",
    "color": "#1e3a5f",
    "color2": "#1a6bdb",
    "elipacko_page": "/pp-gaylord-boxes/",
    "tagline": "Plastic Gaylord Boxes Wholesale — PP Bulk Containers",
    "hero_desc": "Wholesale plastic gaylord boxes in polypropylene corrugated. Reusable bulk containers for food, manufacturing, and distribution. 0% US anti-dumping duty.",
    "photos": [
      (f"{CDN}/pp-gaylord-box-1.jpg", "Plastic gaylord boxes white PP wholesale — Elipacko"),
      (f"{CDN}/pp-gaylord-box-3.jpg", "Plastic gaylord boxes corrugated detail — Elipacko"),
      (f"{CDN}/pp-gaylord-on-pallet-lidded.jpg", "Plastic gaylord boxes lidded on pallet — Elipacko"),
    ],
    "specs": [
      ("Material","PP corrugated"),("Capacity","2,200 lbs"),("Volume","45–55 cu ft"),
      ("Wall","4mm / 6mm / 8mm"),("MOQ","One 40HQ"),("Duty","0%"),
      ("Lead Time","3–4 weeks"),("Recyclable","Yes — PP #5"),
    ],
    "features": [
      ("🏭","Manufacturer Direct","Order direct from Elipacko — Asia's largest PP corrugated factory. No middleman markup."),
      ("💪","2,200 lb Rated","Heavy-gauge twin-wall PP handles the toughest bulk material loads."),
      ("💧","Waterproof","100% moisture proof — outlasts cardboard gaylords in any environment."),
      ("📦","Flat-Pack Return","Empties flat-pack for cost-effective return shipping."),
      ("🎨","Custom Color/Print","Any color, custom logo or print on PP corrugated panels."),
      ("0️⃣","0% Anti-Dump","PP corrugated not subject to US anti-dumping duty."),
    ],
    "pages": [
      ("wholesale-plastic-gaylord-boxes", "Wholesale Plastic Gaylord Boxes — Bulk PP Containers",
       "Wholesale plastic gaylord boxes from PP manufacturer. Bulk pricing on corrugated polypropylene gaylord containers.",
       "wholesale plastic gaylord boxes bulk",
       "Wholesale Plastic Gaylord Boxes"),
      ("plastic-gaylord-boxes-for-sale", "Plastic Gaylord Boxes for Sale — PP Direct from Manufacturer",
       "Plastic gaylord boxes for sale direct from Elipacko manufacturer. No distributors, no markup. Container-load pricing.",
       "plastic gaylord boxes for sale",
       "Plastic Gaylord Boxes For Sale"),
      ("large-plastic-gaylord-boxes", "Large Plastic Gaylord Boxes — 45x48 and Custom Oversized",
       "Large plastic gaylord boxes for high-volume bulk handling. Standard 45x48 footprint and custom oversized options.",
       "large plastic gaylord boxes oversized",
       "Large Plastic Gaylord Boxes"),
      ("food-grade-gaylord-boxes", "Food Grade Gaylord Boxes — PP for Food and Produce",
       "Food grade plastic gaylord boxes for produce, grain, and food manufacturing. FDA-compliant PP, waterproof, easy clean.",
       "food grade gaylord boxes produce",
       "Food Grade Gaylord Boxes"),
      ("industrial-gaylord-boxes", "Industrial Gaylord Boxes — Heavy Duty PP Bulk Containers",
       "Industrial plastic gaylord boxes for manufacturing, chemical, and distribution applications. Heavy-duty PP construction.",
       "industrial gaylord boxes heavy duty",
       "Industrial Gaylord Boxes"),
      ("gaylord-box-with-lid", "Gaylord Box with Lid — PP Covered Bulk Containers",
       "PP gaylord boxes with matching lids for contamination protection, stacking, and transit. Custom lid options available.",
       "gaylord box with lid covered",
       "Gaylord Box with Lid"),
      ("cheap-gaylord-boxes", "Cheap Gaylord Boxes — Best Value PP vs Cardboard Pricing",
       "Best value gaylord boxes — PP vs cardboard cost per use. Why cheap cardboard costs more over time than reusable PP.",
       "cheap gaylord boxes best value",
       "Cheap Gaylord Boxes — Best Value"),
    ],
  },
  {
    "dir": "gaylordboxesplastic",
    "domain": "gaylordboxesplastic.com",
    "keyword": "gaylord boxes plastic",
    "keyword_plural": "gaylord boxes plastic",
    "title_kw": "Gaylord Boxes Plastic",
    "color": "#1e3a5f",
    "color2": "#1a6bdb",
    "elipacko_page": "/pp-gaylord-boxes/",
    "tagline": "Gaylord Boxes Plastic — PP Wholesale Bulk Containers",
    "hero_desc": "Plastic gaylord boxes in polypropylene corrugated. The reusable, waterproof alternative to cardboard gaylords. Wholesale direct from Elipacko.",
    "photos": [
      (f"{CDN}/pp-gaylord-box-2.jpg", "Gaylord boxes plastic PP stacked — Elipacko"),
      (f"{CDN}/pp-gaylord-box-1.jpg", "Gaylord boxes plastic white bulk — Elipacko"),
      (f"{CDN}/pp-gaylord-on-pallet-strapped.jpg", "Plastic gaylord box on pallet strapped — Elipacko"),
    ],
    "specs": [
      ("Material","PP corrugated"),("Capacity","2,200 lbs"),("Volume","45–55 cu ft"),
      ("Colors","White, blue, black"),("MOQ","Container load"),("Duty","0%"),
      ("Reuse Cycles","50+"),("Recyclable","Yes #5 PP"),
    ],
    "features": [
      ("🔄","50+ Reuse Cycles","Plastic gaylord boxes outlast cardboard by 50x. ROI in under 6 months at volume."),
      ("💧","Waterproof","PP doesn't absorb moisture — no collapse, no mold, no contamination risk."),
      ("🏭","Direct from Factory","Elipacko — Asia's largest PP corrugated plant. Container-load pricing, 3-day production."),
      ("📐","Any Size","Custom footprint, height, wall thickness. Matches your pallet and racking dimensions."),
      ("🌡️","Temperature Stable","PP stays rigid from −40°F frozen storage to 140°F staging areas."),
      ("♻️","100% Recyclable","Resin code #5. Full closed-loop PP recovery at end of service."),
    ],
    "pages": [
      ("plastic-vs-cardboard-gaylord", "Plastic vs Cardboard Gaylord Boxes — Full Cost Analysis 2026",
       "Plastic vs cardboard gaylord boxes compared. Total cost of ownership, durability, and environmental impact.",
       "plastic vs cardboard gaylord boxes",
       "Plastic vs Cardboard Gaylord"),
      ("gaylord-box-manufacturer", "Gaylord Box Manufacturer — PP Direct from Elipacko",
       "Source gaylord boxes direct from PP manufacturer Elipacko. No distributors, factory pricing, 3-day production.",
       "gaylord box manufacturer direct",
       "Gaylord Box Manufacturer"),
      ("pp-corrugated-gaylord", "PP Corrugated Gaylord Boxes — Twin-Wall Bulk Containers",
       "PP corrugated twin-wall gaylord boxes for industrial bulk handling. Stronger than cardboard, 100% waterproof.",
       "PP corrugated gaylord boxes",
       "PP Corrugated Gaylord Boxes"),
      ("gaylord-pallet-box", "Gaylord Pallet Box — PP Containers with Forklift Base",
       "Plastic gaylord pallet boxes with 4-way forklift entry. Integrated pallet base for seamless warehouse handling.",
       "gaylord pallet box forklift",
       "Gaylord Pallet Box"),
      ("used-gaylord-boxes-vs-new", "Used Gaylord Boxes vs New PP — Why New PP Wins",
       "Used cardboard gaylord boxes vs new PP corrugated. Why new plastic gaylords are cheaper long-term than used cardboard.",
       "used gaylord boxes vs new plastic",
       "Used vs New Gaylord Boxes"),
      ("gaylord-box-dimensions-guide", "Gaylord Box Dimensions — Complete Size Guide 2026",
       "Complete gaylord box dimensions guide. Standard sizes, custom options, and how to spec a gaylord for your pallet.",
       "gaylord box dimensions guide",
       "Gaylord Box Dimensions Guide"),
      ("buy-gaylord-boxes-bulk", "Buy Gaylord Boxes Bulk — Wholesale Plastic Pricing",
       "Buy plastic gaylord boxes in bulk. Wholesale pricing direct from Elipacko manufacturer. Container-load MOQ.",
       "buy gaylord boxes bulk wholesale",
       "Buy Gaylord Boxes Bulk"),
    ],
  },
  {
    "dir": "heavydutypallets",
    "domain": "heavydutypallets.com",
    "keyword": "heavy duty pallets",
    "keyword_plural": "heavy duty pallets",
    "title_kw": "Heavy Duty Pallets",
    "color": "#1c3d2e",
    "color2": "#16a34a",
    "elipacko_page": "/pp-pallets/",
    "tagline": "Heavy Duty PP Plastic Pallets — Wholesale Direct",
    "hero_desc": "Heavy duty polypropylene plastic pallets for industrial racking, cold chain, and export. Static load 10,000+ lbs. Manufacturer direct from Elipacko.",
    "photos": [
      (f"{CDN}/pp-pallet-heavy-duty.jpg", "Heavy duty PP plastic pallet industrial — Elipacko USA"),
      (f"{CDN}/pp-pallet-heavy-duty-2.jpg", "Heavy duty plastic pallet racking warehouse — Elipacko USA"),
      (f"{CDN}/pp-pallet-heavy-duty-3.jpg", "Heavy duty PP pallet forklift — Elipacko USA"),
      (f"{CDN}/pp-gaylord-on-pallet-strapped.jpg", "Gaylord on heavy duty PP pallet — Elipacko USA"),
    ],
    "specs": [
      ("Material","Injection-molded PP or PP corrugated"),
      ("Static Load","10,000+ lbs"),
      ("Dynamic Load","4,400 lbs"),
      ("Racking Load","2,200 lbs"),
      ("Footprint","48×40 in standard"),
      ("Entry","4-way or 2-way"),
      ("MOQ","One 40HQ container"),
      ("Duty","0%"),
    ],
    "features": [
      ("💪","10,000 lb Static","PP pallets handle 10,000+ lbs static load — exceeding GMA wood pallet specs."),
      ("💧","100% Waterproof","No moisture absorption, no splinters, no nails. Clean room and food-safe environments approved."),
      ("🏗️","Racking Compatible","Racking-rated PP pallets tested to 2,200 lbs for selective and drive-in rack systems."),
      ("🌡️","Temperature Stable","Performs from −40°F frozen storage to 140°F staging. Wood warps; PP doesn't."),
      ("🔄","Reusable 10+ Years","PP pallets last a decade or more vs 3–5 trips for a GMA wood pallet."),
      ("0️⃣","0% Anti-Dump Duty","PP pallets not subject to US anti-dumping duty. Save on landed cost."),
    ],
    "pages": [
      ("plastic-pallets-heavy-duty", "Plastic Pallets Heavy Duty — PP vs Wood Load Comparison",
       "Heavy duty plastic pallets vs wood. Static load, dynamic load, and racking comparison. PP wins at scale.",
       "plastic pallets heavy duty load",
       "Plastic Pallets Heavy Duty"),
      ("pp-plastic-pallets", "PP Plastic Pallets — Polypropylene Wholesale Direct",
       "Wholesale PP plastic pallets manufacturer direct. Injection-molded and corrugated options. 0% anti-dumping duty.",
       "PP plastic pallets wholesale",
       "PP Plastic Pallets Wholesale"),
      ("industrial-plastic-pallets", "Industrial Plastic Pallets — Racking and Cold Chain Rated",
       "Industrial PP plastic pallets for selective racking, cold chain, and export applications.",
       "industrial plastic pallets racking",
       "Industrial Plastic Pallets"),
      ("food-grade-pallets", "Food Grade Pallets — PP for FDA and USDA Facilities",
       "Food grade plastic pallets for FDA and USDA-regulated facilities. No splinters, no nails, no contamination risk.",
       "food grade pallets FDA USDA",
       "Food Grade Plastic Pallets"),
      ("export-pallets", "Export Pallets — PP Plastic No ISPM-15 Required",
       "PP plastic export pallets require no ISPM-15 heat treatment. Eliminates fumigation and customs delays.",
       "export pallets no ISPM-15",
       "Export Pallets — No ISPM-15"),
      ("plastic-pallet-dimensions", "Plastic Pallet Dimensions — 48x40 and Custom Sizes",
       "Standard and custom plastic pallet dimensions. 48x40 GMA footprint and custom sizes for European and Asian markets.",
       "plastic pallet dimensions sizes",
       "Plastic Pallet Dimensions"),
      ("buy-plastic-pallets-wholesale", "Buy Plastic Pallets Wholesale — Container-Load Pricing",
       "Buy heavy duty plastic pallets wholesale. Container-load pricing from Elipacko manufacturer. 0% anti-dumping duty.",
       "buy plastic pallets wholesale",
       "Buy Plastic Pallets Wholesale"),
    ],
  },
  {
    "dir": "heavydutyplasticpallets",
    "domain": "heavydutyplasticpallets.com",
    "keyword": "heavy duty plastic pallets",
    "keyword_plural": "heavy duty plastic pallets",
    "title_kw": "Heavy Duty Plastic Pallets",
    "color": "#1c3d2e",
    "color2": "#16a34a",
    "elipacko_page": "/pp-pallets/",
    "tagline": "Heavy Duty Plastic Pallets — Wholesale PP Direct",
    "hero_desc": "Heavy duty plastic pallets in polypropylene. 10,000+ lb static, racking-rated, export-ready. Wholesale from Elipacko — Asia's largest PP factory.",
    "photos": [
      (f"{CDN}/pp-pallet-heavy-duty.jpg", "Heavy duty plastic pallet PP warehouse — Elipacko"),
      (f"{CDN}/pp-pallet-heavy-duty-2.jpg", "Heavy duty PP plastic pallet — Elipacko"),
      (f"{CDN}/pp-pallet-heavy-duty-3.jpg", "PP heavy duty pallet forklift ready — Elipacko"),
    ],
    "specs": [
      ("Material","PP injection-molded or corrugated"),
      ("Static Load","10,000+ lbs"),("Dynamic Load","4,400 lbs"),
      ("Racking","2,200 lbs"),("Footprint","48×40 in standard"),
      ("MOQ","Container load"),("Duty","0%"),("Lifespan","10+ years"),
    ],
    "features": [
      ("🏗️","Racking Rated","PP plastic pallets tested for selective, drive-in, and cantilever rack systems."),
      ("🧊","Cold Chain Ready","No moisture absorption, no warping in freezers or blast chillers."),
      ("✈️","Export Ready","No ISPM-15 treatment required for PP pallets — ship internationally without fumigation."),
      ("🧹","Easy Clean","Smooth PP surface — pressure wash clean between product runs."),
      ("💪","10,000 lb Static","Exceeds GMA wood pallet static load spec."),
      ("0️⃣","0% Duty","Zero anti-dumping duty on PP pallets entering the USA."),
    ],
    "pages": [
      ("heavy-duty-plastic-pallet-specs", "Heavy Duty Plastic Pallet Specs — Load Ratings 2026",
       "Complete heavy duty plastic pallet specifications. Static, dynamic, and racking load ratings for PP pallets.",
       "heavy duty plastic pallet specs ratings",
       "Heavy Duty Plastic Pallet Specs"),
      ("plastic-pallets-vs-wood", "Plastic Pallets vs Wood — Heavy Duty Comparison 2026",
       "Heavy duty plastic pallets vs wood. Load ratings, lifespan, hygiene, and total cost compared.",
       "plastic pallets vs wood comparison",
       "Plastic Pallets vs Wood"),
      ("racking-compatible-pallets", "Racking Compatible Plastic Pallets — PP for Selective Rack",
       "PP plastic pallets for selective, drive-in, and push-back racking. Tested racking load ratings.",
       "racking compatible plastic pallets",
       "Racking Compatible Pallets"),
      ("cold-storage-pallets", "Cold Storage Plastic Pallets — Freezer Rated PP",
       "Freezer-rated PP plastic pallets for cold storage, blast chilling, and frozen distribution.",
       "cold storage plastic pallets freezer",
       "Cold Storage Plastic Pallets"),
      ("wholesale-plastic-pallets", "Wholesale Plastic Pallets — Factory Direct Pricing",
       "Wholesale heavy duty plastic pallets direct from Elipacko. Container-load MOQ, 0% anti-dumping duty.",
       "wholesale plastic pallets factory direct",
       "Wholesale Plastic Pallets"),
      ("plastic-pallet-manufacturer", "Plastic Pallet Manufacturer — Elipacko PP Factory Direct",
       "Source plastic pallets direct from Elipacko — Asia's largest PP corrugated and injection-molded pallet factory.",
       "plastic pallet manufacturer direct",
       "Plastic Pallet Manufacturer"),
      ("reusable-plastic-pallets", "Reusable Plastic Pallets — 10 Year Service Life PP",
       "Reusable PP plastic pallets last 10+ years vs 3–5 trips for wood. Total cost of ownership analysis.",
       "reusable plastic pallets lifespan",
       "Reusable Plastic Pallets"),
    ],
  },
  {
    "dir": "poultrycrates",
    "domain": "poultrycrates.com",
    "keyword": "poultry crates",
    "keyword_plural": "poultry crates",
    "title_kw": "Poultry Crates",
    "color": "#78350f",
    "color2": "#d97706",
    "elipacko_page": "/pp-poultry-boxes/",
    "tagline": "PP Poultry Crates — Live Bird Transport Containers",
    "hero_desc": "Polypropylene poultry crates for live bird transport. Ventilated, stackable, washable. USDA-accepted food-contact PP. Wholesale from Elipacko.",
    "photos": [
      (f"{CDN}/poultry-box.jpg", "PP poultry crate live bird transport — Elipacko"),
    ],
    "specs": [
      ("Material","PP corrugated or injection-molded"),
      ("Ventilation","Perforated wall panels"),
      ("Stacking","4–6 high loaded"),
      ("Wash","Pressure wash safe"),
      ("Colors","White, yellow, custom"),
      ("MOQ","One 40HQ container"),
      ("Duty","0%"),
      ("Compliance","USDA food-contact PP"),
    ],
    "features": [
      ("🐔","Live Bird Rated","Ventilated PP panels provide airflow for live poultry transport. Meets welfare and biosecurity requirements."),
      ("💧","Pressure Wash Safe","PP withstands high-pressure hot water sanitization between flocks."),
      ("📦","Stackable","Stacks 4–6 high when loaded — efficient loading for transport vehicles."),
      ("🔄","Reusable","PP crates last 5–10 years vs single-use cardboard. Significant cost saving at flock scale."),
      ("🧪","Biosecurity Clean","Non-porous PP surface — disinfect fully between every flock. No biofilm harboring."),
      ("0️⃣","0% Duty","PP poultry crates not subject to US anti-dumping duty."),
    ],
    "pages": [
      ("plastic-poultry-crates", "Plastic Poultry Crates — PP for Live Bird Transport",
       "Plastic PP poultry crates for live bird transport. Ventilated, stackable, biosecurity-compliant.",
       "plastic poultry crates live bird",
       "Plastic Poultry Crates"),
      ("chicken-transport-crates", "Chicken Transport Crates — PP Ventilated Live Bird Boxes",
       "PP chicken transport crates for broiler and layer farms. Ventilated panels, stackable, USDA accepted.",
       "chicken transport crates ventilated",
       "Chicken Transport Crates"),
      ("broiler-crates", "Broiler Crates — Heavy Duty PP for Commercial Poultry",
       "Heavy duty PP broiler crates for commercial poultry operations. Sized for broiler transport from farm to processing.",
       "broiler crates commercial poultry",
       "Broiler Crates"),
      ("poultry-transport-boxes", "Poultry Transport Boxes — Stackable PP Ventilated Containers",
       "Stackable PP poultry transport boxes. 4–6 high loading, ventilated sides, pressure wash sanitization.",
       "poultry transport boxes stackable",
       "Poultry Transport Boxes"),
      ("poultry-crate-dimensions", "Poultry Crate Dimensions — Standard and Custom Sizes",
       "Standard poultry crate dimensions for broilers, layers, and turkeys. Custom sizes from Elipacko.",
       "poultry crate dimensions sizes",
       "Poultry Crate Dimensions"),
      ("buy-poultry-crates", "Buy Poultry Crates — PP Wholesale from Elipacko",
       "Buy PP poultry crates wholesale direct from Elipacko manufacturer. 0% anti-dumping duty entering USA.",
       "buy poultry crates wholesale",
       "Buy Poultry Crates Wholesale"),
      ("reusable-poultry-crates", "Reusable Poultry Crates — PP vs Single-Use Cardboard",
       "Why reusable PP poultry crates beat cardboard at commercial scale. Cost per flock analysis.",
       "reusable poultry crates vs cardboard",
       "Reusable Poultry Crates"),
    ],
  },
  {
    "dir": "poultryboxes",
    "domain": "poultryboxes.com",
    "keyword": "poultry boxes",
    "keyword_plural": "poultry boxes",
    "title_kw": "Poultry Boxes",
    "color": "#78350f",
    "color2": "#d97706",
    "elipacko_page": "/pp-poultry-boxes/",
    "tagline": "PP Poultry Boxes — Ventilated Live Bird Containers",
    "hero_desc": "PP corrugated poultry boxes for live bird transport and processing. Ventilated, stackable, reusable. Wholesale from Elipacko.",
    "photos": [
      (f"{CDN}/poultry-box.jpg", "PP poultry boxes live bird transport — Elipacko"),
    ],
    "specs": [
      ("Material","PP corrugated"),("Use","Live bird transport + processing"),
      ("Ventilation","Perforated walls"),("Stacking","4–6 high"),
      ("Wash","Pressure wash safe"),("MOQ","Container load"),
      ("Duty","0%"),("Colors","White, custom"),
    ],
    "features": [
      ("🐔","Live Bird Ready","Ventilated corrugated PP sides for airflow during live bird transport."),
      ("🔄","Multi-Use","Reuse 20+ times — massive cost saving vs single-use cardboard boxes."),
      ("💧","Easy Sanitize","Pressure wash between flocks. Non-porous PP — no disease harboring."),
      ("📦","Efficient Stack","Stack 4–6 high loaded for truck and shed storage."),
      ("🏭","Direct from Factory","Elipacko manufacturer direct — no markup."),
      ("0️⃣","0% US Duty","Zero anti-dumping duty on PP corrugated poultry boxes."),
    ],
    "pages": [
      ("corrugated-poultry-boxes", "Corrugated Poultry Boxes — PP for Live Bird and Processing",
       "PP corrugated poultry boxes for live bird transport and processing plant use. Ventilated, washable.",
       "corrugated poultry boxes PP",
       "Corrugated Poultry Boxes"),
      ("chicken-boxes-wholesale", "Chicken Boxes Wholesale — PP Poultry Containers Direct",
       "Wholesale chicken and poultry boxes direct from Elipacko PP manufacturer. Container-load pricing.",
       "chicken boxes wholesale PP",
       "Chicken Boxes Wholesale"),
      ("pp-poultry-boxes", "PP Poultry Boxes — Polypropylene Live Bird Containers",
       "PP polypropylene poultry boxes for live bird and processed poultry. FDA-contact grade material.",
       "PP poultry boxes polypropylene",
       "PP Poultry Boxes"),
      ("poultry-shipping-boxes", "Poultry Shipping Boxes — PP for Export and Distribution",
       "PP poultry shipping boxes for export and domestic distribution. Stackable, no ISPM-15 required.",
       "poultry shipping boxes export",
       "Poultry Shipping Boxes"),
      ("live-bird-containers", "Live Bird Containers — Ventilated PP Transport Boxes",
       "Ventilated PP live bird transport containers for broilers and layers. Meets biosecurity requirements.",
       "live bird containers ventilated transport",
       "Live Bird Containers"),
      ("poultry-box-sizes", "Poultry Box Sizes — Broiler Layer Turkey Dimensions",
       "Standard PP poultry box sizes for broilers, layers, and turkeys. Custom dimensions available.",
       "poultry box sizes dimensions",
       "Poultry Box Sizes"),
      ("buy-poultry-boxes", "Buy Poultry Boxes — PP Wholesale Direct",
       "Buy PP poultry boxes wholesale. Manufacturer direct pricing, 0% anti-dumping duty, fast production.",
       "buy poultry boxes wholesale",
       "Buy Poultry Boxes"),
    ],
  },
  {
    "dir": "poultryshippingboxes",
    "domain": "poultryshippingboxes.com",
    "keyword": "poultry shipping boxes",
    "keyword_plural": "poultry shipping boxes",
    "title_kw": "Poultry Shipping Boxes",
    "color": "#78350f",
    "color2": "#d97706",
    "elipacko_page": "/pp-poultry-boxes/",
    "tagline": "PP Poultry Shipping Boxes — Export-Grade Live Bird Containers",
    "hero_desc": "PP corrugated poultry shipping boxes for live bird export and domestic distribution. Ventilated, stackable, no ISPM-15 fumigation required.",
    "photos": [
      (f"{CDN}/poultry-box.jpg", "PP poultry shipping boxes export grade — Elipacko"),
    ],
    "specs": [
      ("Material","PP corrugated"),("Application","Live bird export + distribution"),
      ("Ventilation","Perforated panels"),("ISPM-15","Not required for PP"),
      ("Stacking","4–6 high loaded"),("MOQ","Container load"),
      ("Duty","0%"),("Compliance","USDA food-contact"),
    ],
    "features": [
      ("✈️","No ISPM-15","PP poultry shipping boxes require no heat treatment fumigation for international export."),
      ("🐔","Ventilated","Perforated PP panels provide required airflow for live bird transport."),
      ("📦","Stackable","4–6 high under load — efficient container and truck loading."),
      ("💧","Washable","Pressure-wash sanitize between every flock. No disease carryover."),
      ("🏭","Factory Direct","Elipacko — wholesale direct, no distributors."),
      ("0️⃣","0% US Duty","Zero anti-dumping duty entering USA."),
    ],
    "pages": [
      ("live-poultry-export-boxes", "Live Poultry Export Boxes — PP No ISPM-15 Required",
       "PP live poultry export boxes for international shipment. No ISPM-15 fumigation required vs wood crates.",
       "live poultry export boxes no ISPM",
       "Live Poultry Export Boxes"),
      ("chicken-shipping-boxes", "Chicken Shipping Boxes — PP Corrugated Wholesale",
       "PP corrugated chicken shipping boxes for domestic and export distribution. Ventilated, stackable.",
       "chicken shipping boxes PP wholesale",
       "Chicken Shipping Boxes"),
      ("pp-poultry-shipping", "PP Poultry Shipping Containers — Corrugated Plastic",
       "PP corrugated poultry shipping containers for live bird and processed product transport.",
       "PP poultry shipping containers",
       "PP Poultry Shipping Containers"),
      ("poultry-export-packaging", "Poultry Export Packaging — PP Boxes for International Markets",
       "Poultry export packaging in PP corrugated. Meets international transport and biosecurity requirements.",
       "poultry export packaging international",
       "Poultry Export Packaging"),
      ("ventilated-poultry-boxes", "Ventilated Poultry Boxes — PP Airflow Transport Containers",
       "Ventilated PP poultry boxes engineered for maximum airflow during live bird transport.",
       "ventilated poultry boxes airflow",
       "Ventilated Poultry Boxes"),
      ("poultry-box-manufacturer", "Poultry Box Manufacturer — Elipacko PP Factory Direct",
       "Order poultry shipping boxes direct from Elipacko PP manufacturer. No middleman, container-load pricing.",
       "poultry box manufacturer direct",
       "Poultry Box Manufacturer"),
      ("wholesale-poultry-boxes", "Wholesale Poultry Boxes — Bulk PP Pricing Direct",
       "Wholesale poultry boxes direct from Elipacko. Bulk pricing, 0% anti-dumping duty, fast lead times.",
       "wholesale poultry boxes bulk",
       "Wholesale Poultry Boxes"),
    ],
  },
  {
    "dir": "producecrates",
    "domain": "producecrates.com",
    "keyword": "produce crates",
    "keyword_plural": "produce crates",
    "title_kw": "Produce Crates",
    "color": "#14532d",
    "color2": "#16a34a",
    "elipacko_page": "/agriculture-packaging/",
    "tagline": "PP Produce Crates — Wholesale Farm-to-Market Containers",
    "hero_desc": "Polypropylene produce crates for farm, market, and distribution. Ventilated, stackable, reusable. Replace cardboard boxes with PP that lasts 50+ harvests.",
    "photos": [
      (f"{CDN}/produce------.jpg", "PP produce crates farm wholesale — Elipacko"),
      (f"{CDN}/produce-----.jpg", "PP produce crates stacked — Elipacko"),
      (f"{CDN}/produce----.jpg", "PP produce crates ventilated — Elipacko"),
      (f"{CDN}/vegetables-farm.jpg", "Farm produce in PP crates — Elipacko"),
    ],
    "specs": [
      ("Material","PP corrugated"),("Ventilation","Perforated walls or open slats"),
      ("Capacity","30–60 lbs typical"),("Stacking","5–8 high"),
      ("Colors","Any — custom per crop"),("MOQ","Container load"),
      ("Duty","0%"),("Reuse Cycles","50+"),
    ],
    "features": [
      ("🌱","Farm to Market","PP produce crates handle the full chain — field harvest, pack house, transport, retail display."),
      ("💧","Waterproof","No moisture damage — produce stays protected even with wet product or ice."),
      ("🔄","50+ Harvests","Reuse across 50+ harvest cycles. PP produce crates pay for themselves fast."),
      ("🎨","Color by Crop","Custom colors per crop type for instant visual sorting at the pack house."),
      ("🧹","Easy Clean","Pressure wash between uses. No mold, no odor carryover between products."),
      ("0️⃣","0% Duty","PP not subject to US anti-dumping duty."),
    ],
    "pages": [
      ("plastic-produce-crates", "Plastic Produce Crates — PP for Farm and Distribution",
       "Plastic PP produce crates for farm harvest, pack house, and distribution. Reusable, ventilated, waterproof.",
       "plastic produce crates farm PP",
       "Plastic Produce Crates"),
      ("reusable-produce-crates", "Reusable Produce Crates — PP vs Cardboard Cost Analysis",
       "Reusable PP produce crates vs cardboard. Cost per use, harvest count, and total ROI comparison.",
       "reusable produce crates vs cardboard",
       "Reusable Produce Crates"),
      ("vegetable-crates-wholesale", "Vegetable Crates Wholesale — PP Farm to Market",
       "Wholesale PP vegetable crates for farms, co-ops, and distributors. Custom color, size, and print.",
       "vegetable crates wholesale farm",
       "Vegetable Crates Wholesale"),
      ("fruit-crates", "Fruit Crates — PP Ventilated Harvest Containers",
       "PP ventilated fruit crates for harvest and distribution. Available for berries, citrus, stone fruit, and more.",
       "fruit crates PP ventilated harvest",
       "Fruit Crates"),
      ("produce-crate-dimensions", "Produce Crate Dimensions — Standard and Custom Sizes",
       "Standard produce crate dimensions for common crops. Custom sizes and vent patterns from Elipacko.",
       "produce crate dimensions sizes",
       "Produce Crate Dimensions"),
      ("farm-produce-boxes", "Farm Produce Boxes — PP Crates for Harvest Operations",
       "PP produce boxes for farm harvest operations. Built for field use, pack house, and cold store.",
       "farm produce boxes PP harvest",
       "Farm Produce Boxes"),
      ("buy-produce-crates", "Buy Produce Crates — PP Wholesale from Elipacko",
       "Buy PP produce crates wholesale direct from Elipacko. 0% anti-dumping duty, container-load pricing.",
       "buy produce crates wholesale",
       "Buy Produce Crates"),
    ],
  },
  {
    "dir": "vegetablecrates",
    "domain": "vegetablecrates.com",
    "keyword": "vegetable crates",
    "keyword_plural": "vegetable crates",
    "title_kw": "Vegetable Crates",
    "color": "#14532d",
    "color2": "#16a34a",
    "elipacko_page": "/agriculture-packaging/",
    "tagline": "PP Vegetable Crates — Wholesale Farm to Market",
    "hero_desc": "Polypropylene vegetable crates for harvest, transport, and market. Reusable, ventilated, waterproof. Wholesale direct from Elipacko.",
    "photos": [
      (f"{CDN}/produce------.jpg", "PP vegetable crates wholesale — Elipacko"),
      (f"{CDN}/produce-----.jpg", "PP vegetable crates stacked farm — Elipacko"),
      (f"{CDN}/vegetables-farm.jpg", "Vegetables in PP crates farm — Elipacko"),
    ],
    "specs": [
      ("Material","PP corrugated"),("Use","Harvest, transport, retail"),
      ("Ventilation","Perforated or slatted"),("Capacity","30–60 lbs"),
      ("Colors","Green, white, custom"),("MOQ","Container load"),
      ("Duty","0%"),("Reuse","50+ harvests"),
    ],
    "features": [
      ("🥦","Crop-Ready","Designed for vegetables from harvest to market. Vents prevent moisture buildup."),
      ("💧","Water Resistant","PP doesn't absorb water — no collapse, no mold, no contamination."),
      ("🔄","Reusable","50+ harvest cycles. Major cost saving over single-use cardboard."),
      ("🎨","Custom Color","Per-crop color coding for instant visual ID at pack house and market."),
      ("🧹","Pressure Washable","Clean between every use. No residue, no odor carryover."),
      ("0️⃣","0% US Duty","No anti-dumping duty on PP corrugated crates."),
    ],
    "pages": [
      ("plastic-vegetable-crates", "Plastic Vegetable Crates — PP for Farms and Markets",
       "Plastic PP vegetable crates for farms, co-ops, and produce markets. Reusable and waterproof.",
       "plastic vegetable crates farms PP",
       "Plastic Vegetable Crates"),
      ("reusable-vegetable-crates", "Reusable Vegetable Crates — 50+ Harvest PP Containers",
       "Reusable PP vegetable crates last 50+ harvests. Total cost analysis vs single-use cardboard.",
       "reusable vegetable crates harvest",
       "Reusable Vegetable Crates"),
      ("wholesale-vegetable-crates", "Wholesale Vegetable Crates — PP Direct from Elipacko",
       "Wholesale PP vegetable crates manufacturer direct. Container-load pricing, 0% anti-dumping duty.",
       "wholesale vegetable crates PP",
       "Wholesale Vegetable Crates"),
      ("ventilated-produce-crates", "Ventilated Produce Crates — PP Airflow Harvest Boxes",
       "Ventilated PP produce crates with perforated walls for airflow during transport and cold storage.",
       "ventilated produce crates airflow",
       "Ventilated Produce Crates"),
      ("vegetable-box-sizes", "Vegetable Box Sizes — PP Crate Dimensions by Crop",
       "PP vegetable box sizes by crop type. Standard dimensions for tomatoes, peppers, leafy greens, and more.",
       "vegetable box sizes dimensions crop",
       "Vegetable Box Sizes"),
      ("farm-vegetable-containers", "Farm Vegetable Containers — Harvest to Cold Store PP",
       "PP vegetable containers for the full farm chain — field harvest, pack house, cold store, distribution.",
       "farm vegetable containers harvest cold store",
       "Farm Vegetable Containers"),
      ("buy-vegetable-crates", "Buy Vegetable Crates — PP Wholesale Pricing",
       "Buy PP vegetable crates wholesale. Direct from Elipacko — Asia's largest PP factory.",
       "buy vegetable crates wholesale PP",
       "Buy Vegetable Crates"),
    ],
  },
  {
    "dir": "cardboardproduceboxes",
    "domain": "cardboardproduceboxes.com",
    "keyword": "cardboard produce boxes",
    "keyword_plural": "cardboard produce boxes",
    "title_kw": "Cardboard Produce Boxes",
    "color": "#92400e",
    "color2": "#b45309",
    "elipacko_page": "/agriculture-packaging/",
    "tagline": "PP Produce Boxes — Better Than Cardboard",
    "hero_desc": "PP corrugated produce boxes outperform cardboard on every metric — waterproof, reusable 50+ times, no collapse. Wholesale direct from Elipacko.",
    "photos": [
      (f"{CDN}/produce------.jpg", "PP produce boxes vs cardboard — Elipacko"),
      (f"{CDN}/produce-----.jpg", "PP corrugated produce boxes — Elipacko"),
      (f"{CDN}/produce----.jpg", "Produce boxes PP corrugated — Elipacko"),
    ],
    "specs": [
      ("Material","PP corrugated (alternative to cardboard)"),
      ("Reuse","50+ cycles vs 1 for cardboard"),
      ("Water","100% waterproof"),("Mold","Non-porous, no mold"),
      ("Colors","Any color + custom print"),("MOQ","Container load"),
      ("Duty","0%"),("Compliance","FDA food contact"),
    ],
    "features": [
      ("💧","Waterproof","Cardboard collapses when wet. PP holds its shape in any condition."),
      ("🔄","50x Reusable","Reuse PP produce boxes 50+ times vs once for cardboard. Cost per use drops to pennies."),
      ("🚫","No Mold","Non-porous PP surface — no mold growth, no odor, no contamination."),
      ("🌱","Eco-Friendly","100% recyclable PP at end of life vs cardboard that contaminates recycling streams with food residue."),
      ("🎨","Custom Print","Full-color print direct on PP corrugated — brand your boxes at no extra tooling cost."),
      ("0️⃣","0% Duty","No anti-dumping duty entering USA."),
    ],
    "pages": [
      ("pp-vs-cardboard-produce-boxes", "PP vs Cardboard Produce Boxes — Full Comparison 2026",
       "PP corrugated vs cardboard produce boxes. Waterproofing, cost per use, mold resistance, and ROI.",
       "PP vs cardboard produce boxes comparison",
       "PP vs Cardboard Produce Boxes"),
      ("wax-cardboard-vs-pp", "Wax Cardboard vs PP Produce Boxes — Why PP Wins",
       "Wax-coated cardboard vs PP corrugated produce boxes. PP is cheaper per use, recyclable, and waterproof.",
       "wax cardboard vs PP produce boxes",
       "Wax Cardboard vs PP"),
      ("produce-packaging-boxes", "Produce Packaging Boxes — PP Corrugated Wholesale",
       "Wholesale PP corrugated produce packaging boxes. Custom color, size, and print for any crop.",
       "produce packaging boxes PP wholesale",
       "Produce Packaging Boxes"),
      ("fruit-vegetable-boxes", "Fruit and Vegetable Boxes — PP Reusable Produce Crates",
       "PP reusable fruit and vegetable boxes for farm, market, and distribution. Replaces cardboard permanently.",
       "fruit vegetable boxes PP reusable",
       "Fruit and Vegetable Boxes"),
      ("custom-produce-boxes", "Custom Produce Boxes — PP Print and Color Options",
       "Custom PP produce boxes with full-color print, logo, and crop-specific color coding.",
       "custom produce boxes PP print",
       "Custom Produce Boxes"),
      ("produce-box-manufacturer", "Produce Box Manufacturer — Elipacko PP Direct",
       "Source produce boxes direct from Elipacko PP manufacturer. No distributors, factory pricing.",
       "produce box manufacturer direct",
       "Produce Box Manufacturer"),
      ("buy-produce-boxes", "Buy Produce Boxes — PP Wholesale Direct Pricing",
       "Buy PP produce boxes wholesale. Container-load MOQ, 0% anti-dumping duty, fast production.",
       "buy produce boxes wholesale PP",
       "Buy Produce Boxes"),
    ],
  },
  {
    "dir": "waxproduceboxes",
    "domain": "waxproduceboxes.com",
    "keyword": "wax produce boxes",
    "keyword_plural": "wax produce boxes",
    "title_kw": "Wax Produce Boxes",
    "color": "#92400e",
    "color2": "#b45309",
    "elipacko_page": "/agriculture-packaging/",
    "tagline": "PP Produce Boxes — The Reusable Alternative to Wax Boxes",
    "hero_desc": "PP corrugated produce boxes replace wax cardboard boxes. Waterproof, reusable 50+ times, fully recyclable. Wholesale from Elipacko.",
    "photos": [
      (f"{CDN}/produce------.jpg", "PP produce boxes alternative to wax boxes — Elipacko"),
      (f"{CDN}/produce-----.jpg", "PP corrugated vs wax produce boxes — Elipacko"),
    ],
    "specs": [
      ("Material","PP corrugated"),("vs Wax Box","100% recyclable; 50x reuse"),
      ("Waterproof","Yes — PP structure"),("Mold","None — non-porous"),
      ("Colors","Any custom color"),("Print","Full color direct print"),
      ("MOQ","Container load"),("Duty","0%"),
    ],
    "features": [
      ("♻️","Fully Recyclable","Wax cardboard ruins recycling streams. PP is 100% recyclable — resin code #5."),
      ("🔄","Reuse 50x","One PP box replaces 50 wax boxes. Cost per use calculation is decisive."),
      ("💧","Equally Waterproof","PP corrugated matches wax cardboard on moisture resistance — beats it on reuse."),
      ("🧹","Easy Clean","Pressure wash between uses. No wax flaking, no contamination."),
      ("🌱","Better for Environment","No wax coating to contaminate compost or recycling. PP is cleaner end-of-life."),
      ("0️⃣","0% Duty","PP corrugated not subject to anti-dumping duty."),
    ],
    "pages": [
      ("pp-vs-wax-produce-boxes", "PP vs Wax Produce Boxes — Full Comparison 2026",
       "PP corrugated vs wax cardboard produce boxes. Cost per use, recyclability, and performance compared.",
       "PP vs wax produce boxes comparison",
       "PP vs Wax Produce Boxes"),
      ("wax-coated-produce-boxes", "Wax Coated Produce Boxes — Why PP is Better",
       "How wax-coated produce boxes compare to PP corrugated. Why processors and farms are switching to PP.",
       "wax coated produce boxes alternative",
       "Wax Coated vs PP Boxes"),
      ("reusable-wax-box-alternative", "Reusable Alternative to Wax Boxes — PP Corrugated",
       "The reusable alternative to single-use wax boxes for produce. PP corrugated costs less per use at scale.",
       "reusable alternative wax boxes PP",
       "Reusable Wax Box Alternative"),
      ("produce-cold-storage-boxes", "Produce Cold Storage Boxes — PP for Refrigerated Distribution",
       "PP produce boxes for cold storage and refrigerated distribution. Waterproof, stackable, no wax.",
       "produce cold storage boxes PP",
       "Produce Cold Storage Boxes"),
      ("seafood-produce-boxes", "Seafood and Produce Boxes — PP Waterproof Containers",
       "PP waterproof boxes for seafood and wet produce. Replaces wax boxes in wet and iced applications.",
       "seafood produce boxes waterproof PP",
       "Seafood and Produce Boxes"),
      ("bulk-produce-boxes", "Bulk Produce Boxes — Wholesale PP from Elipacko",
       "Bulk PP produce boxes wholesale direct from Elipacko. Container-load MOQ, 0% anti-dumping duty.",
       "bulk produce boxes wholesale",
       "Bulk Produce Boxes"),
      ("buy-wax-produce-boxes", "Best Wax Box Alternative — PP Produce Boxes Wholesale",
       "The best alternative to wax produce boxes. PP corrugated wholesale from Elipacko manufacturer.",
       "buy wax produce box alternative",
       "Best Wax Box Alternative"),
    ],
  },
  {
    "dir": "reusableshippingboxes",
    "domain": "reusableshippingboxes.com",
    "keyword": "reusable shipping boxes",
    "keyword_plural": "reusable shipping boxes",
    "title_kw": "Reusable Shipping Boxes",
    "color": "#1e3a5f",
    "color2": "#1a6bdb",
    "elipacko_page": "/pp-corrugated-boxes/",
    "tagline": "PP Reusable Shipping Boxes — Wholesale Industrial Containers",
    "hero_desc": "Polypropylene reusable shipping boxes for industrial and commercial use. Replace single-use cardboard with PP that lasts 50+ shipments. Wholesale from Elipacko.",
    "photos": [
      (f"{CDN}/pp-gaylord-box-1.jpg", "PP reusable shipping boxes industrial — Elipacko"),
      (f"{CDN}/pp-gaylord-box-2.jpg", "Reusable PP shipping boxes stacked — Elipacko"),
      (f"{CDN}/turnover-box-0ac876e7-39f9-4814-b77f-603422efbf84.jpg", "PP reusable shipping boxes turnover — Elipacko"),
    ],
    "specs": [
      ("Material","PP corrugated"),("Reuse Cycles","50+"),
      ("Waterproof","100%"),("Stackable","Yes — rail-stacking"),
      ("Colors","Any custom color"),("Print","Full color available"),
      ("MOQ","Container load"),("Duty","0%"),
    ],
    "features": [
      ("🔄","50+ Reuse Cycles","PP reusable shipping boxes last 50+ shipments. Eliminate single-use cardboard from your supply chain."),
      ("💧","Waterproof","No moisture damage in transit, warehouses, or outdoor staging."),
      ("💰","Lower Cost Per Use","Amortize the PP cost over 50 trips — cost per shipment drops far below cardboard."),
      ("📦","Flat-Pack","Empty boxes flat-pack for efficient return logistics."),
      ("🏭","Custom Built","Custom dimensions, wall thickness, color, and print for your exact application."),
      ("0️⃣","0% Duty","PP not subject to US anti-dumping duty."),
    ],
    "pages": [
      ("reusable-plastic-shipping-boxes", "Reusable Plastic Shipping Boxes — PP vs Cardboard ROI",
       "Reusable PP plastic shipping boxes vs cardboard. Cost per shipment, ROI, and environmental comparison.",
       "reusable plastic shipping boxes PP ROI",
       "Reusable Plastic Shipping Boxes"),
      ("corrugated-plastic-shipping-boxes", "Corrugated Plastic Shipping Boxes — PP Industrial",
       "PP corrugated plastic shipping boxes for industrial and commercial applications. Waterproof, reusable.",
       "corrugated plastic shipping boxes PP",
       "Corrugated Plastic Shipping Boxes"),
      ("reusable-industrial-containers", "Reusable Industrial Containers — PP Turnover Boxes",
       "Reusable PP industrial containers for manufacturing, logistics, and distribution. 50+ cycle lifespan.",
       "reusable industrial containers PP turnover",
       "Reusable Industrial Containers"),
      ("sustainable-shipping-boxes", "Sustainable Shipping Boxes — PP Reusable vs Cardboard",
       "Sustainable shipping box options. PP reusable corrugated vs single-use cardboard — environmental and cost analysis.",
       "sustainable shipping boxes reusable PP",
       "Sustainable Shipping Boxes"),
      ("wholesale-reusable-boxes", "Wholesale Reusable Boxes — PP Direct from Elipacko",
       "Wholesale reusable PP shipping boxes from Elipacko manufacturer. Container-load pricing, 0% duty.",
       "wholesale reusable boxes PP",
       "Wholesale Reusable Boxes"),
      ("reusable-moving-boxes", "Reusable Moving Boxes — PP Corrugated Rental Alternative",
       "PP reusable moving boxes as alternative to cardboard. Waterproof, stackable, no assembly required.",
       "reusable moving boxes PP corrugated",
       "Reusable Moving Boxes"),
      ("buy-reusable-shipping-boxes", "Buy Reusable Shipping Boxes — PP Wholesale Pricing",
       "Buy reusable PP shipping boxes wholesale. Manufacturer direct from Elipacko, 0% anti-dumping duty.",
       "buy reusable shipping boxes wholesale",
       "Buy Reusable Shipping Boxes"),
    ],
  },
]

# ─────────────────────────────────────────────────────────────────────────────
# HTML GENERATORS
# ─────────────────────────────────────────────────────────────────────────────

def nav_links(domain, current_slug=""):
    return f'<a href="/">Home</a><a href="/about/">About</a><a href="/faq/">FAQ</a><a href="https://elipacko.com" target="_blank" rel="noopener">Get a Quote</a>'

def page_template(site, title, meta_desc, h1, body_html, slug="", canonical=None):
    domain = site["domain"]
    canon = canonical or f"https://{domain}/{slug}{'/' if slug else ''}"
    color = site["color"]
    color2 = site["color2"]
    kw = site["keyword"]
    return f"""<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{meta_desc}">
<link rel="canonical" href="{canon}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{meta_desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="{canon}">
<meta property="og:site_name" content="{domain}">
<meta property="og:image" content="{site['photos'][0][0]}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{meta_desc}">
<script type="application/ld+json">
{{"@context":"https://schema.org","@type":"WebPage","name":"{title}","description":"{meta_desc}","url":"{canon}","publisher":{{"@type":"Organization","name":"Elipacko USA","url":"https://elipacko.com"}}}}
</script>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Segoe UI',system-ui,sans-serif;color:#1a2332;line-height:1.65;background:#fff}}
a{{color:{color2};text-decoration:none}}a:hover{{text-decoration:underline}}
nav{{background:{color};padding:14px 5%;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}}
.nav-brand{{color:#fff;font-weight:800;font-size:1.1rem}}
.nav-links a{{color:rgba(255,255,255,.85);margin-left:18px;font-size:.88rem;font-weight:500}}
.nav-links a:hover{{color:#fff;text-decoration:none}}
.nav-cta{{background:#fff;color:{color}!important;padding:7px 16px;border-radius:6px;font-weight:700;font-size:.85rem}}
.hero{{background:linear-gradient(135deg,{color},{color2});color:#fff;padding:56px 5%}}
.hero-inner{{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}}
.hero h1{{font-size:clamp(1.7rem,3.5vw,2.6rem);font-weight:800;line-height:1.18;margin-bottom:14px}}
.hero p{{color:rgba(255,255,255,.88);font-size:1rem;margin-bottom:24px}}
.hero-btns{{display:flex;gap:12px;flex-wrap:wrap}}
.btn-primary{{background:#fff;color:{color};padding:12px 24px;border-radius:6px;font-weight:700;font-size:.92rem;display:inline-block}}
.btn-secondary{{border:2px solid rgba(255,255,255,.6);color:#fff;padding:12px 24px;border-radius:6px;font-weight:600;font-size:.92rem;display:inline-block}}
.hero-gallery{{display:grid;grid-template-columns:1fr 1fr;gap:8px}}
.hero-gallery img{{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px}}
.hero-gallery img:first-child{{grid-column:1/-1;aspect-ratio:16/9}}
section{{padding:56px 5%}}
.section-inner{{max-width:1100px;margin:0 auto}}
.label{{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:{color2};margin-bottom:6px}}
h2{{font-size:clamp(1.4rem,2.8vw,2rem);font-weight:800;color:#0a2540;margin-bottom:12px}}
h3{{font-size:1rem;font-weight:700;color:#0a2540;margin:20px 0 8px}}
p{{color:#4b5563;font-size:.95rem;line-height:1.8;margin-bottom:12px}}
ul{{padding-left:20px;color:#4b5563;font-size:.95rem;line-height:1.9;margin-bottom:12px}}
.feature-grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;margin-top:8px}}
.feature-card{{background:#f7f9fc;border:1px solid #e2e8f0;border-radius:10px;padding:22px}}
.feature-card .icon{{font-size:1.8rem;margin-bottom:10px}}
.feature-card h3{{margin-top:0;font-size:.95rem}}
.feature-card p{{font-size:.87rem;margin-bottom:0}}
.spec-table{{width:100%;border-collapse:collapse;font-size:.9rem}}
.spec-table th{{background:#0a2540;color:#fff;padding:11px 16px;text-align:left;font-weight:600}}
.spec-table td{{padding:11px 16px;border-bottom:1px solid #e2e8f0}}
.spec-table tr:nth-child(even) td{{background:#f7f9fc}}
.photo-grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-top:16px}}
.photo-grid img{{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0}}
.two-col{{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start}}
.page-links{{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;margin-top:8px}}
.page-link{{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;transition:box-shadow .15s}}
.page-link:hover{{box-shadow:0 4px 16px rgba(0,0,0,.08);text-decoration:none}}
.page-link h4{{font-size:.93rem;font-weight:700;color:#0a2540;margin-bottom:4px}}
.page-link p{{font-size:.82rem;color:#6b7a8d;margin:0}}
.cta-bar{{background:{color};padding:56px 5%;text-align:center;color:#fff}}
.cta-bar h2{{color:#fff;margin-bottom:8px}}
.cta-bar p{{color:rgba(255,255,255,.88);margin-bottom:22px}}
.cta-bar a{{background:#fff;color:{color};padding:14px 32px;border-radius:6px;font-weight:700;display:inline-block}}
footer{{background:#0a2540;color:rgba(255,255,255,.6);padding:28px 5%;font-size:.82rem;text-align:center}}
footer a{{color:rgba(255,255,255,.5)}}
@media(max-width:768px){{.hero-inner{{grid-template-columns:1fr}}.two-col{{grid-template-columns:1fr}}}}
@media(max-width:480px){{.hero{{padding:36px 4%}}nav{{padding:12px 4%}}}}
</style>
</head>
<body>
<nav>
  <span class="nav-brand">{domain}</span>
  <div class="nav-links">
    <a href="/">Home</a>
    <a href="/faq/">FAQ</a>
    <a href="https://elipacko.com{site['elipacko_page']}" target="_blank" rel="noopener" class="nav-cta">Get a Quote</a>
  </div>
</nav>
{body_html}
<footer>
  <p>&copy; 2026 {domain} &mdash; Sourcing resource for <a href="https://elipacko.com{site['elipacko_page']}" rel="noopener">Elipacko.com</a> | <a href="/">Home</a> | <a href="/faq/">FAQ</a> | <a href="/sitemap.xml">Sitemap</a></p>
</footer>
</body>
</html>"""

def build_homepage(site):
    domain = site["domain"]
    kw = site["keyword"]
    kwp = site["keyword_plural"]
    kw_title = site["title_kw"]
    color = site["color"]
    color2 = site["color2"]
    photos = site["photos"]
    
    # Hero gallery
    gallery_imgs = ""
    for i, (url, alt) in enumerate(photos[:4]):
        gallery_imgs += f'<img src="{url}" alt="{alt}" loading="{("eager" if i==0 else "lazy")}">\n'
    
    # Features
    feat_html = ""
    for icon, title, desc in site["features"]:
        feat_html += f'<div class="feature-card"><div class="icon">{icon}</div><h3>{title}</h3><p>{desc}</p></div>\n'
    
    # Specs
    spec_rows = ""
    for k, v in site["specs"]:
        spec_rows += f"<tr><td><strong>{k}</strong></td><td>{v}</td></tr>\n"
    
    # Photo grid (all photos)
    all_photos = ""
    for url, alt in photos:
        all_photos += f'<img src="{url}" alt="{alt}" loading="lazy">\n'
    
    # Sub-page links
    page_links_html = ""
    for slug, title, desc, pg_kw, short in site["pages"]:
        page_links_html += f'<a href="/{slug}/" class="page-link"><h4>{short}</h4><p>{desc[:80]}...</p></a>\n'
    
    body = f"""
<section class="hero">
  <div class="hero-inner">
    <div>
      <p class="label" style="color:rgba(255,255,255,.7);margin-bottom:8px">Elipacko Wholesale</p>
      <h1>{kw_title} — {site['tagline']}</h1>
      <p>{site['hero_desc']}</p>
      <div class="hero-btns">
        <a href="https://elipacko.com{site['elipacko_page']}" class="btn-primary" target="_blank" rel="noopener">Get a Quote from Elipacko</a>
        <a href="/faq/" class="btn-secondary">FAQ &amp; Specs</a>
      </div>
    </div>
    <div class="hero-gallery">
      {gallery_imgs}
    </div>
  </div>
</section>

<section style="background:#fff">
  <div class="section-inner">
    <div class="label">Why PP</div>
    <h2>Why Polypropylene {kw_title}?</h2>
    <div class="feature-grid">{feat_html}</div>
  </div>
</section>

<section style="background:#f7f9fc">
  <div class="section-inner">
    <div class="label">Specifications</div>
    <h2>{kw_title} — Key Specifications</h2>
    <div class="two-col">
      <div>
        <table class="spec-table">
          <tr><th>Property</th><th>Value</th></tr>
          {spec_rows}
        </table>
        <p style="margin-top:16px;font-size:.88rem;color:#6b7a8d">All specifications confirmed at quote stage. Contact <a href="https://elipacko.com{site['elipacko_page']}" rel="noopener">Elipacko.com</a> for custom requirements.</p>
      </div>
      <div>
        <div class="photo-grid">{all_photos}</div>
      </div>
    </div>
  </div>
</section>

<section style="background:#fff">
  <div class="section-inner">
    <div class="label">Guides &amp; Resources</div>
    <h2>Everything About {kw_title}</h2>
    <div class="page-links">{page_links_html}</div>
  </div>
</section>

<div class="cta-bar">
  <h2>Get {kw_title} Wholesale Pricing</h2>
  <p>Manufacturer direct from Elipacko — Asia's largest PP corrugated factory. 0% anti-dumping duty entering the USA.</p>
  <a href="https://elipacko.com{site['elipacko_page']}" target="_blank" rel="noopener">Request a Quote from Elipacko →</a>
</div>
"""
    title = f"{kw_title} — {site['tagline']} | {domain}"
    meta = site["hero_desc"][:155]
    return page_template(site, title, meta, kw_title, body, "", f"https://{domain}/")

def build_subpage(site, slug, title, meta_desc, pg_kw, short_title):
    domain = site["domain"]
    kw = site["keyword"]
    kw_title = site["title_kw"]
    photos = site["photos"]
    
    photo_grid = ""
    for url, alt in photos[:3]:
        photo_grid += f'<img src="{url}" alt="{alt}" loading="lazy">\n'
    
    spec_rows = ""
    for k, v in site["specs"]:
        spec_rows += f"<tr><td><strong>{k}</strong></td><td>{v}</td></tr>\n"
    
    # Generate other page links
    other_pages = ""
    for s, t, d, pk, sh in site["pages"]:
        if s != slug:
            other_pages += f'<a href="/{s}/" class="page-link"><h4>{sh}</h4><p>{d[:80]}...</p></a>\n'
    
    body = f"""
<div style="background:#f7f9fc;padding:10px 5%;font-size:.82rem;color:#6b7a8d">
  <a href="/" style="color:#1a6bdb">Home</a> › <span>{short_title}</span>
</div>

<section style="background:linear-gradient(135deg,{site['color']},{site['color2']});color:#fff;padding:48px 5%">
  <div class="section-inner">
    <h1 style="font-size:clamp(1.6rem,3vw,2.4rem);font-weight:800;margin-bottom:14px;color:#fff">{title}</h1>
    <p style="color:rgba(255,255,255,.88);max-width:640px;font-size:1rem;margin-bottom:22px">{meta_desc}</p>
    <a href="https://elipacko.com{site['elipacko_page']}" class="btn-primary" target="_blank" rel="noopener" style="background:#fff;color:{site['color']};padding:12px 24px;border-radius:6px;font-weight:700;font-size:.92rem;display:inline-block">Get a Quote from Elipacko</a>
  </div>
</section>

<section style="background:#fff">
  <div class="section-inner">
    <div class="two-col">
      <div>
        <div class="label">About</div>
        <h2>{short_title}</h2>
        <p>{meta_desc} Elipacko is Asia's largest PP corrugated manufacturer, supplying wholesale direct with 0% anti-dumping duty entering the USA.</p>
        <h3>Key Advantages</h3>
        <ul>
          {''.join(f"<li><strong>{t}</strong> — {d}</li>" for _,t,d in site['features'][:4])}
        </ul>
        <h3>Why Elipacko?</h3>
        <p>Elipacko manufactures all PP products in-house at Asia's largest PP corrugated facility. Direct factory pricing, 3-day production for one 40HQ container, and 0% anti-dumping duty entering the USA on PP corrugated products.</p>
        <h3>Request a Quote</h3>
        <p>Contact Elipacko at <a href="https://elipacko.com{site['elipacko_page']}" rel="noopener">elipacko.com</a> with your specifications — dimensions, quantity, color, and any custom requirements. Free sample available before container commitment.</p>
      </div>
      <div>
        <div class="photo-grid">{photo_grid}</div>
        <table class="spec-table" style="margin-top:16px">
          <tr><th>Spec</th><th>Value</th></tr>
          {spec_rows}
        </table>
      </div>
    </div>
  </div>
</section>

<section style="background:#f7f9fc">
  <div class="section-inner">
    <div class="label">More Resources</div>
    <h2>More About {kw_title}</h2>
    <div class="page-links">{other_pages}
    <a href="/" class="page-link"><h4>{kw_title} — Overview</h4><p>Return to the main {kw} page with full specs and gallery.</p></a>
    </div>
  </div>
</section>

<div class="cta-bar">
  <h2>Get {kw_title} Pricing</h2>
  <p>Wholesale direct from Elipacko — 0% anti-dumping duty, manufacturer direct pricing.</p>
  <a href="https://elipacko.com{site['elipacko_page']}" target="_blank" rel="noopener">Request a Quote →</a>
</div>
"""
    return page_template(site, title, meta_desc, short_title, body, slug, f"https://{domain}/{slug}/")

def build_faq(site):
    domain = site["domain"]
    kw = site["keyword"]
    kw_title = site["title_kw"]
    
    faqs = [
        (f"What are {kw} made of?", f"Elipacko {kw} are made from polypropylene (PP) corrugated twin-wall sheet or injection-molded PP. Both are 100% food-contact safe, waterproof, and chemically resistant."),
        (f"What is the minimum order quantity for {kw}?", "Minimum order is typically one 40HQ container. Elipacko can confirm MOQ and lead time at the quoting stage based on your specification and destination."),
        (f"Is there anti-dumping duty on {kw} from China entering the USA?", "Anti-dumping duty rates change — always confirm current rates with a licensed customs broker. Elipacko manufactures across multiple countries including Thailand, Vietnam, and China, giving them the flexibility to source from the most favorable origin for your order. At the time of this writing, Thailand-manufactured PP corrugated products enter the US at 0% anti-dumping duty. Elipacko is also actively developing US manufacturing capacity, which would eliminate import duty considerations entirely for domestic orders."),
        (f"What is the lead time for {kw}?", "Production of one 40HQ container takes approximately 3 days. Sea freight to US West Coast ports is 14–21 days. Total order-to-dock time is typically 3–4 weeks."),
        (f"Can {kw} be custom colored or printed?", "Yes. Any Pantone or RAL color match is available. Full-color printing direct on the PP corrugated surface is available for logos, crop labels, barcodes, and instructional text."),
        (f"Are Elipacko {kw} food-contact safe?", "Yes. Food-contact grades are formulated under FDA 21 CFR 177.1520. Material compliance documentation is available for qualifying orders."),
        (f"How do {kw} compare to cardboard?", f"PP {kw} are 100% waterproof, reusable 50+ times, mold-resistant, and fully recyclable. Cardboard is single-use and collapses when wet. PP has a lower total cost of ownership at any meaningful volume."),
        (f"Where can I buy {kw} wholesale?", f"Source {kw} wholesale direct from Elipacko at elipacko.com. Manufacturer direct pricing, no distributor markup, container-load MOQ."),
    ]
    
    faq_schema = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
        for q, a in faqs
    ]}
    import json
    faq_json = json.dumps(faq_schema)
    
    faq_html = "".join(f'<div style="border-bottom:1px solid #e2e8f0;padding:18px 0"><h3 style="font-size:.95rem;font-weight:700;color:#0a2540;margin-bottom:6px">{q}</h3><p style="margin:0">{a}</p></div>' for q, a in faqs)
    
    body = f"""
<script type="application/ld+json">{faq_json}</script>
<div style="background:#f7f9fc;padding:10px 5%;font-size:.82rem;color:#6b7a8d">
  <a href="/" style="color:#1a6bdb">Home</a> › FAQ
</div>
<section style="background:#fff">
  <div class="section-inner">
    <div class="label">FAQ</div>
    <h2>{kw_title} — Frequently Asked Questions</h2>
    <p style="margin-bottom:28px">Common questions about sourcing, specifications, and pricing for {kw} from Elipacko.</p>
    {faq_html}
    <div style="margin-top:32px;padding:24px;background:#f0f9ff;border-radius:10px;border:1px solid #bae6fd">
      <strong>Have another question?</strong> Contact Elipacko directly at <a href="https://elipacko.com{site['elipacko_page']}" rel="noopener">elipacko.com</a> — they respond to quote requests and technical questions quickly.
    </div>
  </div>
</section>
<div class="cta-bar">
  <h2>Ready to Get a Quote?</h2>
  <p>Manufacturer direct wholesale pricing from Elipacko — 0% anti-dumping duty, fast lead times.</p>
  <a href="https://elipacko.com{site['elipacko_page']}" target="_blank" rel="noopener">Request a Quote from Elipacko →</a>
</div>
"""
    title = f"{kw_title} FAQ — Specifications, Pricing, MOQ | {domain}"
    meta = f"Frequently asked questions about {kw} wholesale. Specifications, MOQ, pricing, lead times, and anti-dumping duty explained."
    return page_template(site, title, meta, f"{kw_title} FAQ", body, "faq", f"https://{domain}/faq/")

def build_sitemap(site, all_slugs):
    domain = site["domain"]
    urls = [f"https://{domain}/"] + [f"https://{domain}/{s}/" for s in all_slugs]
    url_els = "\n".join(f"  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod><changefreq>monthly</changefreq><priority>{'1.0' if i==0 else '0.8'}</priority></url>" for i, u in enumerate(urls))
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{url_els}
</url>"""

def build_robots(domain):
    return f"User-agent: *\nAllow: /\n\nSitemap: https://{domain}/sitemap.xml\n"

# ─────────────────────────────────────────────────────────────────────────────
# BUILD ALL SITES
# ─────────────────────────────────────────────────────────────────────────────
built = []
for site in SITES:
    d = os.path.join(BASE, site["dir"])
    print(f"Building {site['domain']}...")
    
    # Homepage
    with open(os.path.join(d, "index.html"), "w") as f:
        f.write(build_homepage(site))
    
    all_slugs = ["faq"]
    
    # Sub-pages
    for slug, title, meta, pg_kw, short in site["pages"]:
        slug_dir = os.path.join(d, slug)
        os.makedirs(slug_dir, exist_ok=True)
        with open(os.path.join(slug_dir, "index.html"), "w") as f:
            f.write(build_subpage(site, slug, title, meta, pg_kw, short))
        all_slugs.append(slug)
    
    # FAQ page
    faq_dir = os.path.join(d, "faq")
    os.makedirs(faq_dir, exist_ok=True)
    with open(os.path.join(faq_dir, "index.html"), "w") as f:
        f.write(build_faq(site))
    
    # Sitemap
    with open(os.path.join(d, "sitemap.xml"), "w") as f:
        f.write(build_sitemap(site, all_slugs))
    
    # Robots
    with open(os.path.join(d, "robots.txt"), "w") as f:
        f.write(build_robots(site["domain"]))
    
    # IndexNow key file
    with open(os.path.join(d, f"{INDEXNOW_KEY}.txt"), "w") as f:
        f.write(INDEXNOW_KEY)
    
    pages = len(all_slugs) + 1
    built.append((site["domain"], pages))
    print(f"  ✓ {pages} pages built")

print("\n=== DONE ===")
for domain, pages in built:
    print(f"  {domain}: {pages} pages")
EOF