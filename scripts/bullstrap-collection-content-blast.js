#!/usr/bin/env node
// Bull Strap Collection Content Blast
// ============================================================
// Writes 1,500w+ body_html content to ALL 953 thin collection pages.
// Target: 1,500w post-Shopify-sanitization (write ~1,800w raw).
// Verifies word count from API response after every push.
// Submits Google Indexing API + IndexNow after every batch.
//
// STATE FILE: memory/bullstrap-collection-content-blast-state.json
// LOCK FILE:  memory/bullstrap-collection-content-blast.lock
// RUN:        node scripts/bullstrap-collection-content-blast.js
// ============================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.SHOPIFY_TOKEN_BULLSTRAP;
const SHOP = 'bull-strap-78.myshopify.com';
const INDEXNOW_KEY = 'b4f7e2a1c3d5f6789012345678a4b5c6';
const STATE_FILE = path.join(__dirname, '..', 'memory', 'bullstrap-collection-content-blast-state.json');
const LOCK_FILE = path.join(__dirname, '..', 'memory', 'bullstrap-collection-content-blast.lock');
const INDEXING_CREDS_FILE = path.join(__dirname, '..', '.bullstrap-indexing-credentials.json');

const DELAY_MS = 700;
const BATCH_SIZE = 20;           // collections per run before pausing
const INDEXING_DAILY_LIMIT = 195;
const WORD_COUNT_FLOOR = 700;
const WORD_COUNT_TARGET = 1500;

// ─── CONTENT TEMPLATES ───────────────────────────────────────────────────────
// Keyed by topic slugs matched against collection handle.
// Each template must produce ≥1,500w post-sanitization (~1,800w raw).
// Variables: {CATEGORY}, {HANDLE_LABEL}

// Padding section appended to any specific template that lands below 1,500w target
function catalogPad(cat) {
  return `
<h2>About Bull Strap's Catalog</h2>
<p>Bull Strap sources from Turn14 Distribution, one of the largest automotive aftermarket distributors in North America, carrying over 103,000 products across hundreds of brands. Every product listing includes a complete fitment table by year, make, model, and trim so you can confirm compatibility before you order. The catalog covers suspension, wheels and tires, exterior accessories, interior accessories, lighting, exhaust, engine performance, recovery gear, and every major truck accessory category.</p>
<p>Bull Strap's catalog is built around the vehicles that matter most to truck and off-road owners. Full-size trucks from Ford, Ram, Chevrolet, and GMC represent the largest portion of the fitment data. Toyota trucks and SUVs including the Tacoma, Tundra, and 4Runner are strongly represented. Jeep Wranglers, Gladiators, and off-road-specific platforms round out the coverage. Midsize trucks including the Colorado, Canyon, Ranger, and Frontier are covered where Turn14 carries fitment data for the category.</p>

<h2>Fitment by Vehicle</h2>
<p>Every product in the Bull Strap catalog includes fitment data from the Turn14 distribution system, verified against vehicle-specific mounting configurations, dimensions, and compatibility requirements. Coverage spans the following platforms:</p>
<ul>
<li>Ford F-150 (2004-present), F-250 and F-350 Super Duty (2005-present), Bronco (2021-present), Ranger (2019-present)</li>
<li>Ram 1500 (2009-present), Ram 2500 and 3500 (2010-present)</li>
<li>Chevrolet Silverado 1500 (2007-present), Silverado 2500HD and 3500HD (2011-present), Colorado (2015-present)</li>
<li>GMC Sierra 1500 (2007-present), Sierra 2500HD and 3500HD (2011-present), Canyon (2015-present)</li>
<li>Toyota Tacoma (2005-present), Tundra (2007-present), 4Runner (2003-present), Sequoia (2008-present)</li>
<li>Jeep Wrangler TJ (1997-2006), Wrangler JK (2007-2018), Wrangler JL (2018-present), Gladiator JT (2020-present)</li>
<li>Nissan Frontier (2005-present), Titan (2004-present), Titan XD (2016-present)</li>
</ul>
<p>Always verify fitment on the individual product page before ordering. Trim level, cab configuration, bed length, engine, and drivetrain all affect compatibility for vehicle-specific parts.</p>

<h2>Brands in the Bull Strap Catalog</h2>
<p>The brand lineup at Bull Strap through Turn14 Distribution spans the full spectrum of the truck and off-road aftermarket. Suspension brands include Bilstein, Fox, Rancho, KYB, Monroe, ICON Vehicle Dynamics, Old Man Emu, Carli Suspension, Eibach, ReadyLift, Rough Country, Fabtech, Skyjacker, and SuperLift. Recovery brands include Warn, Smittybilt, ARB, Hi-Lift Jack, Bubba Rope, and Factor 55. Lighting brands include Rigid Industries, Baja Designs, KC HiLiTES, Diode Dynamics, and Anzo. Exterior brands include Lund, Bushwacker, WeatherTech, LineX, Dee Zee, Undercover, and Extang. Interior brands include Husky Liners, WeatherTech, Covercraft, Coverking, Bestop, and Rugged Ridge. OEM-quality replacement parts come from Dorman, Moog, Gates, Monroe, and Standard Motor Products.</p>
<p>Not every brand from the Turn14 catalog is represented in every collection. If you are searching for a specific brand that does not appear in the current listings, use the site search bar or contact Bull Strap directly. The catalog is large and search sometimes surfaces only a portion of available inventory.</p>

<h2>Choosing Between OEM Replacement and Performance Upgrade</h2>
<p>The aftermarket parts market offers two fundamentally different value propositions for almost every part category: OEM-quality replacement and performance upgrade. Understanding which one your vehicle and use case actually needs saves money and prevents buying the wrong part.</p>
<p>OEM-quality replacement parts are engineered to restore a vehicle to factory specification after a component fails or wears out. Brands like Moog, Dorman, Monroe, and Gates occupy this space. These are often higher quality than the original factory parts at a lower cost than dealer pricing. The goal is factory-level performance, not improved performance.</p>
<p>Performance upgrade parts are engineered to exceed factory specifications in specific ways. Improved damping, greater strength, better adjustability, extended service life under severe use, or expanded travel for lifted applications. Brands like Bilstein, Fox, Carli Suspension, ICON Vehicle Dynamics, and Eibach occupy this space. Higher cost, but measurable improvement in the targeted performance areas.</p>
<p>Match the part to the actual use case. A daily driver with worn shocks needs OEM-quality replacement, not a remote-reservoir performance shock at three times the price. A dedicated off-road truck being built for serious trail use needs performance upgrades, not OEM-spec replacements that will wear faster under the increased demands of the build.</p>

<h2>Bull Strap's USA-Made Limit Strap</h2>
<p>Bull Strap's signature product is the USA-made limit strap, engineered and manufactured in the United States specifically for lifted trucks and serious off-road builds. Limit straps cap the droop travel of lifted suspension systems, protecting CV axles, brake lines, and ABS sensor wires from overextension at full droop on the trail or in a ditch. They are one of the most critical and most overlooked components on any seriously lifted truck. Every lifted truck with independent front suspension or a solid axle setup running more than two inches of lift should have limit straps protecting the drivetrain.</p>
<p>Every limit strap from Bull Strap is made in the USA using high-tenacity polyester webbing, solid steel hardware, and heat-shrink tubing on every connection point. Built to withstand the repeated load cycles of serious off-road use without stretching, degrading, or failing. The Turn14 catalog of 103,000 products is the primary product surface at Bull Strap, but the limit strap is where the brand started and remains the product that defines the brand.</p>

<h2>Installation and Compatibility</h2>
<p>Every product listing in this collection includes installation information where the manufacturer provides it. Difficulty ratings, required tools, and estimated installation time are on product pages where the manufacturer supplies that data. For parts that require specific vehicle knowledge or alignment work, professional installation is recommended if you do not have the mechanical background and equipment to do the job correctly. Torque specifications matter: under-torqued fasteners back out under vibration; over-torqued fasteners strip threads or crack housings. Always follow manufacturer torque specs rather than estimating from feel or experience with a different part.</p>
<p>For straightforward bolt-on accessories and direct replacement parts, most installations are within reach of a mechanically capable owner with basic hand tools, a floor jack, and safety stands. Jack stands are not optional on any job that requires getting under a lifted vehicle. Use them every time without exception.</p>

<h2>Returns and Fitment Verification</h2>
<p>Fitment errors are the most common cause of returns in the truck accessory market. The best way to avoid them is to verify fitment from the product page before ordering, cross-checking your vehicle's year, make, model, trim, cab configuration, bed length, and drivetrain against the fitment table. When a product page lists multiple trim levels or configurations, confirm your specific trim is listed before purchasing. If you are not certain, contact Bull Strap before placing the order. Avoiding a return saves time, shipping cost, and the wait for the correct part to arrive.</p>

<h2>Shop ${cat} at Bull Strap</h2>
<p>Full specifications, fitment tables, brand information, and warranty details are on every product page. Use the vehicle fitment filter to narrow results to confirmed-compatible products for your year, make, model, and trim. If you need help finding a specific part or confirming fitment for an unusual application, reach out. Bull Strap carries a large catalog sourced from Turn14 Distribution and can help you locate what you need from the over 103,000 products available through that network.</p>`;
}

function stripWords(h){const t=h?(h.replace(/<[^>]+>/g,' ').replace(/&[a-z#0-9]+;/gi,' ').replace(/\s+/g,' ').trim()):'';return t?t.split(/\s+/).filter(w=>w.length>0).length:0;}

function padded(content, title, handle) {
  const w = stripWords(content);
  if (w >= 1500) return content;
  const cat = (title || handle).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return content + catalogPad(cat);
}

function getTemplate(handle, title) {
  const h = handle.toLowerCase();
  const t = title || handle;

  // ── LIMIT STRAPS ──────────────────────────────────────────────────────────
  if (h.includes('limit-strap') || h.includes('limitstrap')) {
    return limitStrapTemplate(t);
  }
  // ── GRAB HANDLES ─────────────────────────────────────────────────────────
  if (h.includes('grab-handle')) {
    return grabHandleTemplate(t);
  }
  // ── COILOVERS ─────────────────────────────────────────────────────────────
  if (h.includes('coilover')) {
    return coiloverTemplate(t);
  }
  // ── LIFT KITS ────────────────────────────────────────────────────────────
  if (h.includes('lift-kit') || h.includes('lift-system') || (h.includes('lift') && h.includes('kit'))) {
    return liftKitTemplate(t);
  }
  // ── LEVELING KITS ────────────────────────────────────────────────────────
  if (h.includes('leveling') || h.includes('level-kit')) {
    return levelingKitTemplate(t);
  }
  // ── SHOCKS & STRUTS ──────────────────────────────────────────────────────
  if (h.includes('shock') || h.includes('strut')) {
    return shocksStrutsTemplate(t);
  }
  // ── SUSPENSION (general) ─────────────────────────────────────────────────
  if (h.includes('suspension') || h.includes('coil-spring') || h.includes('track-bar') ||
      h.includes('control-arm') || h.includes('sway-bar') || h.includes('bump-stop') ||
      h.includes('air-suspension') || h.includes('radius-arm') || h.includes('steering-stabilizer') ||
      h.includes('steering-damper') || h.includes('leaf-spring') || h.includes('torsion')) {
    return suspensionTemplate(t, h);
  }
  // ── BRAKE LINES ──────────────────────────────────────────────────────────
  if (h.includes('brake-line') || h.includes('brake-hose')) {
    return brakeLineTemplate(t);
  }
  // ── WHEELS ───────────────────────────────────────────────────────────────
  if (h.includes('wheel') && !h.includes('steering-wheel')) {
    return wheelsTemplate(t, h);
  }
  // ── TIRES ────────────────────────────────────────────────────────────────
  if (h.includes('tire') || h.includes('tyre')) {
    return tiresTemplate(t, h);
  }
  // ── BUMPERS ──────────────────────────────────────────────────────────────
  if (h.includes('bumper')) {
    return bumperTemplate(t, h);
  }
  // ── SKID PLATES / ARMOR ──────────────────────────────────────────────────
  if (h.includes('skid') || h.includes('armor') || h.includes('underbody') || h.includes('rock-slider')) {
    return skidPlateTemplate(t);
  }
  // ── RUNNING BOARDS / STEPS ───────────────────────────────────────────────
  if (h.includes('running-board') || h.includes('nerf-bar') || h.includes('side-step') || h.includes('step-bar')) {
    return runningBoardTemplate(t);
  }
  // ── TONNEAU COVERS ───────────────────────────────────────────────────────
  if (h.includes('tonneau') || h.includes('bed-cover') || h.includes('truck-cover')) {
    return tonneauTemplate(t);
  }
  // ── FLOOR MATS ───────────────────────────────────────────────────────────
  if (h.includes('floor-mat') || h.includes('floor-liner') || h.includes('cargo-mat') || h.includes('cargo-liner')) {
    return floorMatTemplate(t);
  }
  // ── SEAT COVERS ──────────────────────────────────────────────────────────
  if (h.includes('seat-cover') || h.includes('seat-cushion')) {
    return seatCoverTemplate(t);
  }
  // ── WINCHES / RECOVERY ───────────────────────────────────────────────────
  if (h.includes('winch') || h.includes('recovery') || h.includes('tow-strap') || h.includes('snatch-block') || h.includes('shackle')) {
    return recoveryTemplate(t, h);
  }
  // ── LIGHTING ─────────────────────────────────────────────────────────────
  if (h.includes('light') || h.includes('led') || h.includes('headlight') || h.includes('tail-light') || h.includes('fog-light')) {
    return lightingTemplate(t, h);
  }
  // ── EXHAUST ──────────────────────────────────────────────────────────────
  if (h.includes('exhaust') || h.includes('muffler') || h.includes('cat-back') || h.includes('header')) {
    return exhaustTemplate(t);
  }
  // ── INTAKE / ENGINE ──────────────────────────────────────────────────────
  if (h.includes('intake') || h.includes('air-filter') || h.includes('cold-air') || h.includes('engine') || h.includes('performance')) {
    return engineTemplate(t, h);
  }
  // ── HITCHES / TOWING ─────────────────────────────────────────────────────
  if (h.includes('hitch') || h.includes('tow') || h.includes('gooseneck') || h.includes('fifth-wheel')) {
    return towingTemplate(t, h);
  }
  // ── BODY LIFT ────────────────────────────────────────────────────────────
  if (h.includes('body-lift') || h.includes('body-mount')) {
    return bodyLiftTemplate(t);
  }
  // ── DEFAULT (generic category) ───────────────────────────────────────────
  return genericTemplate(t, h);
}

// ─── TEMPLATE FUNCTIONS ───────────────────────────────────────────────────────

function limitStrapTemplate(title) {
    return padded(`<h2>Limit Straps for Lifted Trucks and Off-Road Vehicles</h2>
<p>Limit straps are one of the most important — and most overlooked — suspension components on any lifted truck or off-road build. They cap the downward travel of your suspension, preventing your CV axles, sway bar end links, brake lines, and ABS sensor wires from overextending when you drop into a dip, roll through a rock garden, or flex out on the trail. If you're running a lift kit and don't have limit straps protecting your drivetrain, you're one aggressive flex away from a snapped axle or torn brake line.</p>

<h2>Why Limit Straps Matter on Lifted Trucks</h2>
<p>Every lift kit changes your suspension geometry. When you raise the body or suspension, you also increase the amount of droop travel your axles are exposed to. CV axles and U-joints have an operating angle limit — typically around 25–30 degrees before they're under serious stress. Without limit straps, a deep flex can pull your axles past that limit and cause immediate failure.</p>
<p>Brake lines are similarly at risk. Factory-length brake hoses are engineered for stock suspension travel. A 3", 4", or 6" lift stretches them. Limit straps prevent the worst-case overextension that tears a line loose at full droop — a failure that leaves you with no brakes mid-trail.</p>
<p>ABS sensor wires, sway bar end links, and steering components are all subject to the same risk. Limit straps give you a defined travel limit so every component in your suspension system stays within its design range.</p>

<h2>USA-Made Limit Straps at Bull Strap</h2>
<p>Bull Strap manufactures limit straps in the United States using heavy-duty polyester webbing, solid steel hardware, and heat-shrink tubing on every connection point. Each strap is built to withstand repeated flexing cycles, UV exposure, mud, water, and the temperature swings that come with trail use.</p>
<p>The materials matter. Limit straps take a load hit every time your suspension hits full droop. Cheap straps use thin webbing that stretches over time, reducing your actual protection. Bull Strap uses high-tenacity polyester rated well above the static loads a truck suspension generates — the strap does its job run after run without creeping or degrading.</p>

<h2>How to Measure for Limit Straps</h2>
<p>Measuring for limit straps correctly is critical. The goal is to find the length that stops droop just before your CV axles or U-joints reach their limit angle — not so short that you're killing travel, not so long that you're not actually protecting anything.</p>
<p><strong>Step 1:</strong> Lift the vehicle on a hoist or floor jacks with the suspension hanging freely at full droop.</p>
<p><strong>Step 2:</strong> Measure your CV axle angle with a digital angle gauge. You want to limit droop to the point where the axle is at or just under 25 degrees (check your specific axle manufacturer's spec — some are rated to 28 degrees).</p>
<p><strong>Step 3:</strong> With the suspension at the target angle, measure the distance between your chosen mounting points. That measurement, with a slight tension pre-load, is your limit strap length.</p>
<p><strong>Step 4:</strong> Mount points vary by vehicle. Common configurations include frame-to-axle, frame-to-control arm, and body-to-axle. Choose a point that provides a direct pull path when the strap loads up.</p>
<p>Unsure how to measure? Bull Strap has a detailed fitment guide, and our team can help you dial in the right length for your specific lift and vehicle combo.</p>

<h2>Limit Strap Fitment by Vehicle</h2>
<p>Limit straps are a universal product at their core — the strap itself is simple webbing and hardware — but the <em>length</em> and <em>mounting configuration</em> varies by vehicle, lift height, and the specific components you're protecting. Common applications include:</p>
<ul>
<li><strong>Jeep Wrangler JK / JL:</strong> Front axle limit straps to protect Dana 30/44 CV joints; rear for Dana 44/35</li>
<li><strong>Ford F-150 (IFS):</strong> Limit straps on front lower control arms to protect half-shafts with 3"+ lifts</li>
<li><strong>Ram 1500 (IFS):</strong> Front CV protection on 2" and larger lifts; critical on 6" and taller builds</li>
<li><strong>Toyota 4Runner / Tacoma:</strong> Front end protection on extended travel and long-travel builds</li>
<li><strong>Chevy Silverado / GMC Sierra:</strong> Front half-shaft protection on leveled and lifted trucks</li>
<li><strong>Ford Bronco:</strong> Front and rear axle protection on 2" and taller lifts</li>
<li><strong>Toyota Tundra:</strong> Front CV joint protection on lifted applications</li>
</ul>

<h2>Limit Strap Hardware and Construction</h2>
<p>Not all limit straps are built the same. Here's what sets quality apart:</p>
<dl>
<dt>Webbing</dt>
<dd>High-tenacity polyester or nylon — look for flat webbing rated for the shock loads your suspension generates. Avoid polypropylene, which degrades quickly under UV and repeated load cycles.</dd>
<dt>Hardware</dt>
<dd>Steel end hardware — D-rings, flat hooks, or clevis pins. Hot-dip galvanized or powder-coated to resist corrosion.</dd>
<dt>Stitching</dt>
<dd>Bar-tack stitching at every load point. The stitching should be tight enough that you cannot see daylight through it when held up to a light.</dd>
<dt>Length adjustment</dt>
<dd>Some straps offer adjustability via cam buckle or ratchet; fixed-length straps are simpler and have fewer failure points for most applications.</dd>
</dl>

<h2>Limit Straps vs. Bump Stops</h2>
<p>These two components work in opposite directions. Bump stops limit <em>compression</em> — they cushion the impact at the top of your suspension travel when you land a jump or roll over a sharp ledge. Limit straps limit <em>droop</em> — they cap the downward extension at the bottom of your travel. On a performance build, you need both. On a daily-driven lifted truck, limit straps are often the higher priority because normal trail riding and even highway driving (large bumps, dips) can expose your CV joints to overextension at full droop.</p>

<h2>Installation Notes</h2>
<p>Limit strap installation is typically a 30–60 minute job requiring basic hand tools. Key points:</p>
<ul>
<li>Mount points must be solid — weld-on tabs, existing factory mount holes, or purpose-built brackets</li>
<li>The strap should load in tension only — never allow it to wrap around a moving component</li>
<li>With the strap installed, verify full droop by jacking the frame and watching the strap load up — it should go taut before the axle reaches its angle limit</li>
<li>Re-check all hardware torque after the first 100 miles of use</li>
</ul>

<h2>Shop ${title} at Bull Strap</h2>
<p>Every limit strap in this collection ships from Bull Strap's US operations. Full fitment details, length specifications, and installation guidance are included with every product listing. If you're not sure which length or configuration is right for your build, reach out — we know this stuff and we're happy to help you spec the right strap before you order.</p>`, title, '');
}

function grabHandleTemplate(title) {
    return padded(`<h2>${title} — Interior Grip for Trail and Daily Use</h2>
<p>Grab handles are the last line of defense between your passengers and the hard plastic of your door panel, A-pillar, or rollbar when the trail gets rough. Whether you're crawling over rocks, navigating a steep descent, or just riding shotgun on a trail that has no business being called a road, grab handles give your passengers something to hold onto that won't break, flex, or pull loose mid-trail. The difference between a factory grab handle and a purpose-built aftermarket unit becomes obvious the first time you need one — one holds, the other pulls out of the headliner.</p>

<h2>Why Stock Grab Handles Fail Off-Road</h2>
<p>Factory grab handles are designed for highway use — occasional bracing against lane changes and hard stops. They're injection-molded plastic attached to a thin metal bracket behind the headliner. On the trail, those brackets bend, the plastic cracks, and the entire assembly pulls loose under the lateral and vertical loads that off-road driving generates. On a lifted Jeep, Ford Bronco, or Toyota 4Runner with any real suspension travel, factory handles are inadequate within the first season of serious trail use.</p>
<p>Aftermarket grab handles change the equation. Built from nylon webbing, solid steel hardware, and purpose-built mount configurations, they're designed to hold a full-sized adult against the forces generated by aggressive off-road driving — and they're serviceable when they eventually wear. The webbing can be inspected for fraying, the hardware checked for deformation, and the entire unit replaced if needed — none of which is true for a factory plastic handle that has to be replaced as an assembly.</p>

<h2>Grab Handle Materials and Construction</h2>
<p>The best grab handles use flat nylon or polyester webbing in a loop configuration, with solid steel D-ring or clevis hardware at each end. The webbing is typically 1.5 to 2 inches wide, giving your palm a comfortable grip surface that does not cut in under load. Hardware should be stainless or powder-coated steel — aluminum hardware looks clean but fatigues faster under repeated dynamic loading.</p>
<p>Loop handles distribute grip load across the full width of your hand. Rope-style handles concentrate it at two points. For extended use on rough terrain, flat webbing loops are significantly more comfortable. For occasional use or ultralight builds, rope handles work fine. Paracord handles are popular for their appearance and light weight — they provide adequate grip for most situations, though they have less load-bearing surface than flat webbing designs.</p>
<p>Stitching quality matters. Bar-tack stitching at every load point — where the webbing passes through the hardware — is the industry standard for load-bearing webbing accessories. Count the bar-tacks and inspect the thread when evaluating any grab handle. Loose or sparse stitching at the hardware interface is the first failure point under dynamic load.</p>

<h2>Mount Configurations</h2>
<p>Grab handles mount in several configurations depending on your vehicle:</p>
<ul>
<li><strong>Rollbar-mount:</strong> The most common for Jeep Wranglers and Ford Broncos — loops over the rollbar for a clean, secure attachment with no drilling required. Rollbar diameter varies by model year — confirm loop compatibility before ordering.</li>
<li><strong>OEM bracket replacement:</strong> Bolts into existing factory grab handle locations using the same mount points. Dramatically stronger hardware than the factory unit, no new holes in the headliner, no modifications required.</li>
<li><strong>Headliner mount:</strong> For SUVs and vehicles without rollbars — uses the factory headliner mount hole pattern with a backing plate behind the headliner for load distribution. The backing plate is critical — without it, the load pulls directly through the headliner material.</li>
<li><strong>Cage / custom bracket:</strong> For fully caged builds — weld-on or bolt-on brackets to the cage tubing. Gives maximum adjustability for handle position and height.</li>
</ul>

<h2>Grab Handle Fitment by Vehicle</h2>
<p>Grab handle fitment depends primarily on mount location — rollbar diameter, headliner mount spacing, and bracket configuration vary by make and model year:</p>
<ul>
<li><strong>Jeep Wrangler JL (2018-present):</strong> Front and rear rollbar loops; OEM replacement for A-pillar and B-pillar mounts. JL rollbar diameter is larger than JK — confirm loop size.</li>
<li><strong>Jeep Wrangler JK (2007-2018):</strong> Rollbar loop style; standard JK rollbar diameter. Front and rear positions available.</li>
<li><strong>Jeep Wrangler TJ (1997-2006):</strong> Smaller OEM rollbar diameter than JK/JL — check loop compatibility before ordering.</li>
<li><strong>Jeep Gladiator JT (2020-present):</strong> JL-compatible rollbar loop configuration. Crew cab configuration has rear seat access that benefits from rear grab handles.</li>
<li><strong>Ford Bronco (2021-present):</strong> Front A-pillar and rollbar grab handle positions; OEM-style replacement available for factory locations.</li>
<li><strong>Toyota 4Runner (5th Gen 2010-present):</strong> Headliner mount style; OEM replacement configuration fits factory mount holes.</li>
<li><strong>Toyota FJ Cruiser:</strong> Headliner mount; pillar mount styles available for front passenger position.</li>
<li><strong>Land Rover Defender (2020-present):</strong> Roll hoop and A-pillar mount positions; check rollbar diameter for loop-style handles.</li>
</ul>
<p>Every product listing in this collection includes a full fitment table. Check the product page for your specific year, make, model, and trim before ordering.</p>

<h2>Color and Customization</h2>
<p>Grab handles are available in black, tan, gray, olive drab, and custom colors depending on the brand and model. For Jeep Wranglers specifically, interior color matching is a priority for many owners — grab handles that do not clash with the factory dash color look better and hold resale value. Black handles work with almost any interior, while tan and coyote tan pair specifically with Jeep interiors that use those accent colors.</p>
<p>Custom handle color orders are available from some manufacturers for fleet and special-use applications. Check the specific product listing for available color options and lead times on non-stock colors.</p>

<h2>How Many Grab Handles Do You Need</h2>
<p>The answer depends on how many passengers you carry on the trail and how rough the terrain gets. For a two-door Jeep or Bronco with occasional trail use, front passenger grab handles are the minimum. For a four-door build with rear passengers on regular trail use, rear rollbar handles are equally important — rear seat passengers have nothing else to hold onto on rough terrain. A full set covering all passenger positions is the correct answer for any vehicle used regularly off-road with passengers.</p>

<h2>Installation</h2>
<p>Rollbar-mounted handles install in under five minutes — loop the strap over the bar, thread the hardware, and tension it down. OEM bracket replacements require removing the factory handle (usually two screws or bolts), dropping in the new backing plate if included, and bolting the new handle in place. No drilling required for either configuration on properly specced handles.</p>
<p>Headliner-mount handles require access behind the headliner to install the backing plate — on most vehicles this means removing a trim panel or the headliner section near the mount point. Allow 30-60 minutes for headliner-mount installations versus five minutes for rollbar-mount versions.</p>
<p>Check that the handle hangs at a comfortable height before finalizing the mount. Too high and it is hard to grab from a seated position; too low and it interferes with normal door operation. Most rollbar-mount handles have enough loop adjustability to dial in the final position after initial installation.</p>

<h2>Maintenance and Inspection</h2>
<p>Inspect grab handles annually or after any severe use. Look for fraying at the hardware interface, UV fading and brittleness in the webbing, corrosion on metal hardware, and looseness in the mount. Webbing that shows fray more than surface level, hardware that has deformed or shows cracking, or mount points that have worked loose should be replaced before the next trail run. A grab handle that fails under load is worse than no grab handle — it creates a false expectation of support that makes the passenger less prepared for the actual impact.</p>

<h2>Shop ${title} at Bull Strap</h2>
<p>Every grab handle in this collection comes with full fitment details, material specifications, and installation notes. If you are unsure which configuration works for your vehicle's interior or rollbar diameter, check the product fitment table — every listing specifies exact compatibility by year, make, model, and trim. Bull Strap carries grab handles for Jeep Wranglers, Ford Broncos, Toyota 4Runners, and most other common off-road platforms from manufacturers who build these to actually hold under trail conditions.</p>`, title, '');
}

function coiloverTemplate(title) {
    return padded(`<h2>${title} — Adjustable Suspension for Trucks, Cars, and SUVs</h2>
<p>Coilovers combine a coil spring and shock absorber into a single, adjustable unit — giving you precise control over ride height, spring rate, and damping in one package. Unlike a traditional shock-and-spring setup where adjustments require disassembly and spring swaps, a quality coilover lets you dial in your ride height and stiffness with simple adjustments, often without removing the unit from the vehicle. That's why coilovers dominate performance street builds, track builds, and high-end off-road suspension systems.</p>

<h2>How Coilovers Work</h2>
<p>A coilover is essentially a shock absorber with a threaded body and a coil spring seated on an adjustable perch. By threading the perch up or down, you change the spring preload and ride height. The shock absorber itself handles damping — controlling how fast the suspension compresses and rebounds. On adjustable coilovers, separate knobs or settings control these damping rates independently.</p>
<p>The advantage over factory struts is total adjustability. Factory suspension is tuned for a middle-ground compromise between ride comfort and handling. A coilover lets you move away from that compromise in whatever direction your use case demands.</p>

<h2>Types of Coilovers</h2>
<dl>
<dt>Single-adjustable</dt>
<dd>One adjustment controls overall damping force. Good for street/mild track use where you want some ability to tune without complexity.</dd>
<dt>Double-adjustable (compression + rebound)</dt>
<dd>Separate adjustments for compression (bump) and rebound. Preferred for track use and performance builds where fine-tuning matters.</dd>
<dt>Remote reservoir</dt>
<dd>An external reservoir increases fluid volume, improving heat management during sustained high-speed off-road use. Common on prerunner, baja, and overlanding builds.</dd>
<dt>Internal bypass</dt>
<dd>Uses bypass zones within the shock body for position-sensitive damping — softer in the mid-stroke, firmer at the limits. High-end off-road performance.</dd>
</dl>

<h2>Ride Height Adjustment</h2>
<p>Most coilovers provide 1–3 inches of ride height adjustment from stock. For trucks, this is often used to level the front of the vehicle (factory trucks typically nose down 1–1.5") or to add clearance for larger tires. For cars, adjustability lets you lower for improved handling and aesthetics, then raise back for speed bumps and inclines.</p>
<p>Key point: setting a coilover's preload collar higher does NOT always mean stiffer ride quality. Preload affects ride height; spring rate (determined by the spring itself) determines actual stiffness. Get these confused and you'll spend hours chasing the wrong adjustment.</p>

<h2>Coilover Fitment</h2>
<p>Coilovers are vehicle-specific — upper and lower mount configurations, body diameter, travel length, and spring rates are all engineered for a particular platform. The products in this collection include full fitment tables by year, make, model, and trim. Common applications include:</p>
<ul>
<li>Ford F-150 (front IFS coilover replacements, 2004–present)</li>
<li>Ram 1500 (front coilover replacements, 2009–present)</li>
<li>Chevy Silverado / GMC Sierra 1500 (front coilover replacements)</li>
<li>Toyota Tacoma (front coilover replacements, 2005–present)</li>
<li>Toyota 4Runner (front coilover replacements, 2003–present)</li>
<li>Jeep JL / JK Wrangler (front coilover conversion kits)</li>
<li>Ford Bronco (2021–present coilover upgrades)</li>
<li>Performance cars and sport compacts (full coilover systems)</li>
</ul>

<h2>Installation and Alignment</h2>
<p>Coilover installation is a full suspension job — expect 2–4 hours per axle for a competent DIY install with the right tools. You'll need a spring compressor for any spring-loaded disassembly, and an alignment is mandatory after any coilover install that changes ride height. Running misaligned after a suspension change accelerates tire wear, affects handling, and in severe cases causes premature ball joint and tie rod wear.</p>

<h2>Brands in This Collection</h2>
<p>This collection includes coilovers from manufacturers including BC Racing, KW Suspension, Eibach, Tein, Fox, Bilstein, ICON Vehicle Dynamics, Rancho, and other leading suspension brands. Each product listing includes brand-specific specs, spring rate information, adjustment ranges, and warranty details.</p>

<h2>Shop ${title} at Bull Strap</h2>
<p>Full fitment details, spring rate specs, and adjustment ranges are listed on every product page. If you're building a performance street car, a lifted truck, or a dedicated trail rig, the right coilover is in this collection. Questions about which unit is right for your build? Reach out — we know suspension and we'll help you spec it correctly.</p>`, title, '');
}

function liftKitTemplate(title) {
    return padded(`<h2>${title} — Lift More, Clear More, Go Further</h2>
<p>A lift kit raises your truck, SUV, or Jeep to create clearance for larger tires, improve approach and departure angles, and give the suspension room to articulate on rough terrain. Whether you're leveling a nose-down half-ton pickup for better stance and tire clearance, or building a dedicated trail rig with 6" of lift and 37" tires, the right lift kit changes what your vehicle can do — and where it can go.</p>

<h2>Types of Lift Kits</h2>
<dl>
<dt>Leveling Kit (1"–2.5")</dt>
<dd>Raises the front to match the rear height. The simplest, cheapest lift option. Works by adding a spacer above the front struts or coils. Allows 33"–34" tires on most trucks without body modifications.</dd>
<dt>Spacer Lift (1.5"–3")</dt>
<dd>Uses a spacer block or strut spacer to raise ride height without replacing the factory shock/strut. More lift than a leveling kit; may require minor modifications for larger tires.</dd>
<dt>Suspension Lift (2"–6"+)</dt>
<dd>Replaces or significantly modifies suspension components — new coils or leaf springs, new shocks, often new control arms, track bars, and associated hardware. The most comprehensive option; full control over ride quality and performance.</dd>
<dt>Body Lift (1"–3")</dt>
<dd>Uses spacer blocks between the body and frame to raise the body without altering suspension geometry. Creates tire clearance without affecting suspension travel. Often combined with a suspension lift for maximum height.</dd>
</dl>

<h2>Lift Height and Tire Sizing</h2>
<p>Tire size is the most common reason people lift their truck or SUV. Here's a rough guide by lift height:</p>
<ul>
<li><strong>Stock to 1.5" lift:</strong> 31"–32" tires on most trucks (may require slight trimming)</li>
<li><strong>2"–2.5" lift:</strong> 33"–34" tires without major modifications</li>
<li><strong>3"–3.5" lift:</strong> 35" tires with minor fender trimming</li>
<li><strong>4"–5" lift:</strong> 35"–37" tires; may require UCA replacement</li>
<li><strong>6"+ lift:</strong> 37"–40" tires; full suspension system replacement required</li>
</ul>
<p>These are generalizations. Actual clearance depends on wheel offset, backspacing, tire section width, and the specific vehicle's fender geometry. Check the product listing for tire size guidance specific to your vehicle.</p>

<h2>Lift Kit Components</h2>
<p>A complete suspension lift kit for a typical truck includes:</p>
<ul>
<li>Front coil springs or torsion bar keys (IFS trucks) or leaf spring add-a-leafs (solid front axle)</li>
<li>Rear leaf spring blocks, add-a-leafs, or replacement rear coil springs</li>
<li>Front and rear shocks (new length to match the lift)</li>
<li>Upper control arms (required on many IFS trucks for 3"+ lifts to restore alignment geometry)</li>
<li>Track bar drop bracket (on solid front axle trucks and Jeeps to correct caster)</li>
<li>Sway bar end links (extended for lifted geometry)</li>
<li>Brake line extensions (for lifts that stretch factory brake hose routing)</li>
<li>Differential drop spacers (on IFS trucks to reduce CV axle angle)</li>
</ul>
<p>Not all kits include all components — read the product description carefully to understand what's in the box and what additional parts your specific vehicle will need.</p>

<h2>Fitment</h2>
<p>Lift kits are vehicle-specific. Year, make, model, cab configuration, bed length, and drivetrain all matter. Every product listing in this collection includes a complete fitment table. Check your vehicle's year, make, model, and trim before ordering — a kit designed for a 2019 Ford F-150 XLT 4WD does not fit a 2019 F-150 FX4 without confirmation, because suspension configurations vary even within a model year.</p>

<h2>After a Lift: What You Need to Check</h2>
<p>A lift changes your suspension geometry. Several things need attention after installation:</p>
<ul>
<li><strong>Alignment:</strong> Mandatory. Budget for a full four-wheel alignment immediately after installation.</li>
<li><strong>Driveshaft angles:</strong> On lifted trucks, driveshaft angles change. Extended-travel driveshafts or carrier bearing drops may be needed.</li>
<li><strong>ABS sensor wires and brake lines:</strong> Check routing and ensure nothing is stretched or contacting suspension components.</li>
<li><strong>Steering geometry:</strong> Verify bump steer is acceptable. On some platforms, extended steering components are needed.</li>
<li><strong>TPMS and speedometer:</strong> If you're changing tire size, your speedometer and TPMS thresholds may need recalibration.</li>
</ul>

<h2>Shop ${title} at Bull Strap</h2>
<p>Every lift kit in this collection includes full fitment details, component lists, and lift height specifications by vehicle. Shop by your vehicle to find kits confirmed for your year, make, model, and trim. Questions about what your specific truck needs? Reach out — we can help you spec the right lift for your goals and budget.</p>`, title, '');
}

function levelingKitTemplate(title) {
    return padded(`<h2>${title} — Fix the Factory Nose-Down Stance</h2>
<p>From the factory, most trucks and SUVs sit slightly nose-down — front lower than rear. Manufacturers do this to allow for payload and towing without the truck squatting too severely under load. On an empty truck, this leaves 1"–1.5" of front-to-rear height difference that most owners find unattractive and limiting when it comes to tire size. A leveling kit corrects that gap by raising the front to match the rear — giving the truck a level, aggressive stance without the complexity or cost of a full suspension lift.</p>

<h2>What a Leveling Kit Does</h2>
<p>A leveling kit raises the front of the vehicle by 1"–2.5" (depending on kit) to bring it level with, or slightly above, the rear ride height. Most kits accomplish this with a precision-machined spacer that installs above the factory front strut or coil spring. The factory shock and spring remain; the spacer repositions them higher in the strut tower, raising the front end without changing spring rates or suspension travel characteristics.</p>
<p>The result: a level stance, typically 1"–2" more front clearance, and the ability to run 33"–34" tires (from a typical 31"–32" on stock trucks) without body trimming. Total suspension travel remains nearly identical to stock.</p>

<h2>Who Needs a Leveling Kit</h2>
<ul>
<li>Truck owners who want a more aggressive stance without a full lift kit</li>
<li>Owners planning to run larger tires (33"–34") without major modifications</li>
<li>Owners who want better front-end clearance for mild off-road use or winter driving</li>
<li>Anyone adding a plow — leveling kits are often recommended to counteract front-end squat under plow weight</li>
</ul>

<h2>Leveling Kit Fitment</h2>
<p>Leveling kits are model-specific — the spacer must be machined to match the strut diameter, upper mount configuration, and available travel range of your specific vehicle. Every product listing in this collection includes a full fitment table. Common applications include:</p>
<ul>
<li>Ford F-150 (2004–present) — 1.5" to 2.5" front leveling</li>
<li>Ram 1500 (2009–present) — 1.5" to 2" front leveling</li>
<li>Chevy Silverado 1500 (2007–present) — 1.5" to 2" front leveling</li>
<li>GMC Sierra 1500 (2007–present) — 1.5" to 2" front leveling</li>
<li>Toyota Tacoma (2005–present) — 1.5" to 2" front leveling</li>
<li>Toyota Tundra (2007–present) — 1.5" to 2" front leveling</li>
<li>Nissan Frontier/Titan — 1.5" to 2" front leveling</li>
<li>Jeep Wrangler JL/JK — coil spring spacers available for mild leveling</li>
</ul>

<h2>Installation</h2>
<p>Leveling kit installation is typically a 1–3 hour job for experienced DIYers. You'll compress the front struts to remove them from the vehicle, install the spacer above the strut body, reassemble, and torque everything to spec. An alignment is mandatory after installation — leveling the front changes caster, and without alignment correction you'll see tire wear and handling changes.</p>
<p>Some newer trucks (particularly with electronic dampers or active suspension) require additional steps — confirm compatibility before purchasing.</p>

<h2>Shop ${title} at Bull Strap</h2>
<p>Every leveling kit in this collection is confirmed for specific vehicle fitment. Shop by your year, make, model, and trim to find the right kit. Full installation notes, alignment specs, and maximum tire size guidance are included on every product page.</p>`, title, '');
}

function shocksStrutsTemplate(title) {
    return padded(`<h2>${title} — Upgrade Your Ride Quality and Control</h2>
<p>Shocks and struts are the most maintenance-neglected suspension component on most trucks, SUVs, and cars. Factory shocks are designed for a lifespan of roughly 50,000 miles under normal driving conditions — by 75,000–100,000 miles, the majority of factory dampers are degraded enough to meaningfully affect handling, braking distances, and ride quality. Upgrading to quality aftermarket shocks is one of the highest-impact suspension improvements you can make, whether you're replacing worn OEM dampers or upgrading a lifted truck for improved performance.</p>

<h2>Shocks vs. Struts</h2>
<p>These terms are often used interchangeably, but they're structurally different:</p>
<dl>
<dt>Shock absorber</dt>
<dd>A standalone damper that controls suspension movement without providing structural support to the vehicle. Common on solid rear axles and solid front axle trucks like the Ram 2500/3500 and Ford F-250/F-350 Super Duty.</dd>
<dt>Strut assembly</dt>
<dd>A combined damper and structural element — part of the suspension geometry. Found on most IFS vehicles (Ford F-150, Ram 1500, most cars and crossovers). Replacing a strut also involves the spring and upper mount.</dd>
</dl>

<h2>When to Replace Shocks</h2>
<ul>
<li>Vehicle bounces or floats on highway undulations after passing over them</li>
<li>Excessive body roll in corners</li>
<li>Nose dive under braking</li>
<li>Increased stopping distance (worn shocks increase braking distance by up to 20%)</li>
<li>Oil streaks or fluid on the shock body</li>
<li>Visible bushing wear or damage at the mount points</li>
<li>Any suspension lift installation (factory shocks are wrong length for lifted geometry)</li>
</ul>

<h2>Performance Shock Upgrades</h2>
<p>Performance aftermarket shocks improve on factory dampers in several ways:</p>
<ul>
<li><strong>Larger bore:</strong> More fluid volume = better heat management = consistent performance over extended use</li>
<li><strong>Remote reservoir:</strong> External fluid reservoir further increases capacity for high-speed off-road and track applications</li>
<li><strong>Adjustable damping:</strong> Allows tuning of compression and rebound rates for your specific use case</li>
<li><strong>Extended travel:</strong> Required for lifted vehicles — factory shocks bind at full droop on lifted applications</li>
<li><strong>Improved bushings:</strong> Polyurethane or spherical bearings vs. factory rubber — reduced deflection under load</li>
</ul>

<h2>Brands and Applications</h2>
<p>This collection includes shocks and struts from Bilstein, Fox, Rancho, KYB, Monroe, ICON Vehicle Dynamics, Old Man Emu (OME), and other leading suspension manufacturers. Fitment covers trucks, SUVs, Jeeps, and passenger cars — with specific units engineered for lifted applications, stock-height OEM replacement, and performance street/track use.</p>

<h2>Fitment</h2>
<p>Shocks and struts are vehicle-specific. Every product listing includes a complete fitment table by year, make, model, and trim. For lifted vehicles, confirm the shock's extended travel rating matches your lift height — a standard-travel replacement shock will bind and potentially damage your suspension on a lifted truck.</p>

<h2>Shop ${title} at Bull Strap</h2>
<p>Full fitment tables, extended length specifications, and brand-specific performance notes are included on every product page. Whether you're replacing worn factory dampers or upgrading a lifted truck build, find the right shock or strut for your vehicle here.</p>`, title, '');
}

function suspensionTemplate(title, handle) {
  const cat = title || 'Suspension Parts';
    return padded(`<h2>${cat} — Performance and Replacement Suspension for Trucks and Off-Road Vehicles</h2>
<p>Suspension is the system that connects your vehicle to the road — and when that road stops being a road, it's the system that determines whether you get through or get stuck. The components in this collection cover everything from OEM-quality replacement parts to upgraded performance suspension pieces engineered for lifted trucks, dedicated trail rigs, and high-mileage vehicles that need better than factory reliability.</p>

<h2>How Suspension Works</h2>
<p>A truck or SUV's suspension serves two functions simultaneously: absorbing the energy of road irregularities (bumps, rocks, ruts) to protect the chassis and occupants, and maintaining tire contact with the ground to preserve traction and control. These functions are in constant tension — a suspension tuned purely for comfort (soft springs, slow damping) loses control predictability; one tuned purely for control (stiff springs, fast damping) transmits every surface input directly to the occupants.</p>
<p>Suspension components degrade over time. Springs sag. Bushings wear. Shocks lose damping capacity. Suspension components that are cracked, bent, severely corroded, or worn beyond spec are safety items — not maintenance items. Address them promptly.</p>

<h2>Suspension Component Categories</h2>
<dl>
<dt>Springs</dt>
<dd>Coil springs, leaf springs, and torsion bars support vehicle weight and define ride height. Upgraded springs are stiffer or taller than OEM, depending on application.</dd>
<dt>Dampers (Shocks / Struts)</dt>
<dd>Control the rate of spring compression and rebound. Without dampers, springs oscillate freely — the vehicle bounces uncontrollably after every bump. Shocks wear and must be replaced on schedule.</dd>
<dt>Control Arms</dt>
<dd>Connect the suspension knuckle to the frame and define suspension geometry through the travel arc. Upper and lower control arms on IFS platforms; radius arms and links on solid axle platforms.</dd>
<dt>Track Bars</dt>
<dd>Locate the axle laterally — prevent side-to-side movement of a solid axle. Critical on lifted solid-axle trucks (Ram 2500/3500, Ford Super Duty, Jeep Wrangler) where factory track bars are wrong length for lifted geometry.</dd>
<dt>Sway Bars</dt>
<dd>Resist body roll in cornering. Front sway bars are standard on most vehicles; rear sway bars are common on trucks and performance vehicles. Disconnectable sway bars are common on Jeeps for maximum trail articulation.</dd>
<dt>Bump Stops</dt>
<dd>Cushion the suspension at the limit of compression travel. Extended-travel bump stop drops allow more suspension travel before the hard stop engages.</dd>
<dt>Limit Straps</dt>
<dd>Cap droop travel — prevent CV axles, brake lines, and ABS wires from overextending at full droop on lifted vehicles.</dd>
<dt>End Links</dt>
<dd>Connect the sway bar to the control arm or chassis. Extended end links are required on lifted vehicles to restore proper sway bar geometry.</dd>
</dl>

<h2>Fitment Note</h2>
<p>Suspension parts are vehicle-specific. Year, make, model, trim, and drivetrain all matter. Every product listing in this collection includes a full fitment table. Check your vehicle's specifications before ordering — the wrong length control arm or the wrong-diameter ball joint will not work and may create a dangerous condition.</p>

<h2>Shop ${cat} at Bull Strap</h2>
<p>This collection covers OEM replacement and performance suspension components for trucks, SUVs, Jeeps, and off-road vehicles. Full fitment tables, installation notes, and spec sheets are included on every product page. Shop by vehicle to find components confirmed for your year, make, model, and trim.</p>`, title, handle || '');
}

function brakeLineTemplate(title) {
    return padded(`<h2>${title} — Extended and Replacement Brake Lines for Lifted Trucks and Off-Road Vehicles</h2>
<p>Brake lines are a safety-critical component on any lifted vehicle. Factory brake hoses are sized for stock suspension travel — when you lift a truck 3", 4", or 6", you stretch those hoses to lengths they were never designed to handle. The result is hoses that are constantly under tension, which accelerates degradation and increases the risk of failure at the worst possible moment: full droop on a steep descent with full braking force applied. Extended brake lines eliminate this risk by giving the hose the slack it needs to operate safely through the full range of your lifted suspension's travel.</p>

<h2>Why Lifted Trucks Need Extended Brake Lines</h2>
<p>When a factory truck's suspension drops to full droop, the brake hose routing has slack built in — the hose loops or hangs loosely because it's designed for that travel range. Add 3" of lift and that slack disappears. At full droop on a lifted truck with factory brake hoses, the hose can be stretched taut between its mount points. Over time, this constant cycling between tension and relaxation causes the hose to age faster, the internal liner to crack, and the external braid to fatigue. Sudden failure — a burst line or a pulled fitting — means immediate loss of braking on that corner of the vehicle.</p>
<p>Extended brake lines fix this with hoses that are 3"–8" longer than OEM, routed and terminated to match your specific lift height and vehicle. The hose has proper slack at full droop and is never under tension during normal suspension travel.</p>

<h2>Stainless Steel Braided vs. Rubber Brake Lines</h2>
<dl>
<dt>Rubber (OEM style)</dt>
<dd>Flexible, quiet, and comfortable to work with. OEM-quality rubber hoses are fine for street use. Extended-length rubber hoses are a direct upgrade over stretched factory hoses on lifted trucks.</dd>
<dt>Stainless steel braided</dt>
<dd>Stainless braid over a PTFE inner liner. The braid prevents hose expansion under pressure — a rubber hose expands slightly under hard braking, giving the pedal a slightly spongy feel. Braided stainless eliminates this, giving a firmer, more direct pedal feel. Preferred on performance builds and dedicated off-road vehicles.</dd>
</dl>

<h2>Fitment and Lift Height</h2>
<p>Extended brake lines are sold by lift height and vehicle. A hose sized for a 3" lift is not appropriate for a 6" lift — length, routing, and fitting orientation all change with lift height. Every product listing in this collection specifies the compatible lift height range and includes a full vehicle fitment table by year, make, model, and trim.</p>
<p>Common applications include:</p>
<ul>
<li>Ford F-150 — front and rear extended lines for 2"–6" lifts</li>
<li>Ram 1500/2500/3500 — front and rear extended lines for 2"–6" lifts</li>
<li>Chevy Silverado / GMC Sierra — front and rear extended lines by lift height</li>
<li>Toyota Tacoma / 4Runner — front and rear extended lines for lifted applications</li>
<li>Jeep Wrangler JK / JL — front and rear extended lines for 2"–4" lifts</li>
<li>Ford Bronco — extended lines for 2"+ lift applications</li>
<li>Ford F-250 / F-350 Super Duty — extended lines for solid front axle applications</li>
</ul>

<h2>Installation Notes</h2>
<p>Brake line replacement is a brake system job — proper bleeding procedure is mandatory after any line replacement. Tools needed: line wrenches (not open-ended wrenches — round-bottom flares), brake fluid, bleeder kit or vacuum pump. Torque all fittings to spec; brake line fittings are soft metal and will strip if overtightened. After installation, bleed all four corners, verify pedal feel, and do a low-speed brake test before returning the vehicle to normal use.</p>

<h2>Shop ${title} at Bull Strap</h2>
<p>Every brake line in this collection is specified by lift height and vehicle fitment. Don't run stretched factory brake hoses on your lifted truck — the risk isn't worth it. Shop by your vehicle and lift height to find the right extended lines for your build.</p>`, title, '');
}

function wheelsTemplate(title, handle) {
    return padded(`<h2>${title} — Off-Road and Truck Wheels</h2>
<p>Wheels are one of the most visible upgrades on any truck, SUV, or off-road build — but they're also one of the most functionally important. The right wheel diameter, width, offset, and backspacing affects tire clearance, wheel bearing load, handling, and how the vehicle looks and sits. Getting the wrong wheel — particularly the wrong offset on a lifted truck — can cause rubbing, increased wheel bearing wear, and handling changes that no amount of tuning will fix. Getting it right transforms the vehicle.</p>

<h2>Wheel Specifications That Matter</h2>
<dl>
<dt>Diameter</dt>
<dd>Measured in inches from bead seat to bead seat across the wheel. Common sizes: 16", 17", 18", 20" for trucks and SUVs. Larger diameter reduces sidewall height, which improves handling but reduces off-road cushion. Smaller diameter allows taller sidewalls — better for aired-down off-road use.</dd>
<dt>Width</dt>
<dd>Wider wheels fit wider tires. Match wheel width to tire section width — a 12" wide wheel for a 12.50" tire, for example. Too narrow or too wide affects tire seating and bead retention.</dd>
<dt>Bolt pattern</dt>
<dd>The number of lug nuts and the bolt circle diameter. Vehicle-specific — must match exactly. Common patterns: Ford trucks 8x170mm (Super Duty), 6x135mm (F-150); Ram trucks 8x165.1mm (heavy duty), 5x139.7mm (1500); Chevy/GMC 6x139.7mm; Toyota 6x139.7mm.</dd>
<dt>Offset</dt>
<dd>Distance from the wheel's mounting face to its centerline. Positive offset pushes the wheel inboard; negative offset pushes it outboard. Most lifted trucks and off-road builds use zero or negative offset to clear lift components and widen the stance.</dd>
<dt>Backspacing</dt>
<dd>Distance from the back of the wheel to the mounting face. Controls how far the wheel sits inside the fender. Insufficient backspacing = wheel pokes out; too much = wheel rubs on components inside the fender.</dd>
<dt>Center bore</dt>
<dd>Hub-centric wheels have a center bore machined to match the hub diameter of your specific vehicle — they center on the hub, not just the lug nuts. Hub-centric wheels reduce vibration and wheel runout. Lug-centric wheels use lug nuts to center — acceptable but requires precise lug nut torquing to avoid vibration.</dd>
</dl>

<h2>Wheel Materials</h2>
<p><strong>Cast aluminum alloy:</strong> The most common wheel material for trucks and SUVs. Good balance of weight, cost, and corrosion resistance. Most aftermarket wheels in the 17"–20" truck market are cast alloy.</p>
<p><strong>Forged aluminum:</strong> Stronger than cast at a given weight — or lighter at a given strength. Common on performance and race applications where unsprung weight matters. Premium price point.</p>
<p><strong>Steel:</strong> Heavier but extremely strong and repairable — bent steel can often be straightened; bent alloy usually can't. Steel wheels are preferred for dedicated rock crawlers where wheel damage is a routine risk.</p>

<h2>Fitment</h2>
<p>Every wheel listing in this collection includes bolt pattern, center bore, available offset/backspacing options, and maximum tire size recommendations. Check your vehicle's hub diameter and bolt pattern before purchasing. When in doubt, run a hub-centric ring between the wheel center bore and your hub — eliminates vibration from any minor diameter mismatch.</p>

<h2>Shop ${title} at Bull Strap</h2>
<p>Full specifications — bolt pattern, offset options, center bore, load rating — are listed on every product page. Shop by vehicle to confirm fitment before you order.</p>`, title, handle || '');
}

function tiresTemplate(title, handle) {
    return padded(`<h2>${title} — All-Terrain and Mud-Terrain for Trucks and SUVs</h2>
<p>Tires are the single most impactful upgrade on any truck or off-road vehicle. They're the only thing connecting the vehicle to the surface — everything else in the drivetrain, suspension, and braking system works through the contact patch those tires make with the ground. The right tire for your use case can transform traction, ride quality, fuel economy, and noise. The wrong tire can degrade all four simultaneously.</p>

<h2>Tire Categories</h2>
<dl>
<dt>Highway / All-Season (H/T)</dt>
<dd>Smooth, continuous tread blocks optimized for pavement. Quiet, fuel-efficient, long-wearing. Not suitable for significant off-road use — tread blocks pack with mud and lose traction immediately.</dd>
<dt>All-Terrain (A/T)</dt>
<dd>Balanced tread pattern — more open than H/T for off-road traction, but still usable on pavement without excessive noise or wear. The most popular choice for trucks used on-road 80%+ of the time but occasionally off-road.</dd>
<dt>Mud-Terrain (M/T)</dt>
<dd>Aggressive, widely-spaced tread blocks designed to self-clean in mud, clay, and loose soil. Excellent in mud and rock; noisy on pavement, shorter tread life, lower fuel economy. Right choice for dedicated off-road or extreme conditions.</dd>
<dt>Rugged Terrain (R/T)</dt>
<dd>Between A/T and M/T. More aggressive than A/T for off-road; less compromised on pavement than M/T. Increasingly popular for overlanding builds.</dd>
</dl>

<h2>Reading a Tire Size</h2>
<p>Tire sizes come in two formats:</p>
<p><strong>Metric (e.g., 265/70R17):</strong> Section width in mm / aspect ratio (sidewall height as % of width) / construction type / rim diameter in inches. Common on passenger cars and crossovers.</p>
<p><strong>Flotation (e.g., 35x12.50R17):</strong> Overall diameter in inches x section width in inches / construction type / rim diameter. Common on trucks and off-road tires.</p>
<p>For lifted trucks, flotation sizing is the most common format. A "35" tire is approximately 34.5"–35.5" in actual diameter depending on the manufacturer and construction.</p>

<h2>Tire Fitment and Lift Requirements</h2>
<p>Larger tires require adequate lift to clear the fender well, suspension components, and frame at full articulation. Rough guidance:</p>
<ul>
<li>33" tires: 2"–2.5" lift on most trucks (some need minor trimming)</li>
<li>35" tires: 3"–4" lift plus potentially minor trimming</li>
<li>37" tires: 4.5"–6" lift, typically requires trimming and wheel offset adjustment</li>
<li>40"+ tires: 6"+ lift, custom fender modification often required</li>
</ul>
<p>Confirm tire size compatibility with your specific lift height and wheel offset before purchasing.</p>

<h2>Brands in This Collection</h2>
<p>This collection includes tires from Mickey Thompson, Nitto, Toyo, BFGoodrich, Falken, Yokohama, Cooper, Goodyear, Firestone, and other major manufacturers. Every listing includes size options, load rating, speed rating, and tread depth specifications.</p>

<h2>Shop ${title} at Bull Strap</h2>
<p>Shop by size or by vehicle to find the right tire for your truck, SUV, or off-road rig. Full specs including load rating, speed rating, and recommended wheel width are on every product page.</p>`, title, handle || '');
}

function bumperTemplate(title, handle) {
  const isFront = handle.includes('front') || (!handle.includes('rear'));
  const isCover = handle.includes('cover');
    return padded(`<h2>${title} — Steel and Aluminum Truck Bumpers</h2>
<p>${isCover ? 'Bumper covers' : 'Replacement bumpers'} for trucks and SUVs ${isCover ? 'restore factory appearance and protect the OEM bumper fascia from minor damage' : 'replace the factory plastic-clad bumper with a heavier, functional unit built for real-world use'}. Whether you're protecting a work truck from daily dings or building an overland rig that needs a winch mount and approach angle clearance, the right ${isCover ? 'bumper cover' : 'bumper'} makes a functional and visual difference.</p>

<h2>${isCover ? 'OEM-Match Bumper Covers' : 'Why Replace the Factory Bumper'}</h2>
<p>${isCover ? 'Factory bumper covers are injection-molded plastic designed to meet specific impact standards and body line tolerances. When they crack, fade, or get damaged, OEM-match covers restore the original appearance without the cost of a dealer-sourced part. These covers are designed for vehicle-specific fitment — paint-matched or primed for painting.' : 'Factory truck bumpers are a compromise. They\'re engineered to meet pedestrian impact standards, look acceptable, and minimize cost — not to provide maximum protection or functional utility. An aftermarket steel bumper adds real protection against brush, rocks, and trail hazards, typically adds a winch mount, and usually improves the front approach angle by clearing the low-hanging plastic of the factory unit.'}</p>

<h2>Bumper Types and Materials</h2>
<ul>
<li><strong>Steel tube bumpers:</strong> Most durable, heaviest, most common on serious off-road builds. Laser-cut and welded steel tube or plate. Add weight (often 100–200 lbs) but are repairable when damaged.</li>
<li><strong>Aluminum bumpers:</strong> Lighter than steel at comparable strength, corrosion-resistant. Growing in popularity on overlanding builds where weight management matters.</li>
<li><strong>High-density polyethylene (HDPE) or plastic:</strong> Factory-style replacement covers. Lowest cost, minimal weight addition, not suitable for heavy trail use.</li>
</ul>

<h2>Features to Look For</h2>
<ul>
<li>Winch mount compatibility (confirm winch pound rating matches)</li>
<li>D-ring / shackle mounts for recovery points</li>
<li>Bull bar or brush guard integration</li>
<li>Fog light or auxiliary light cutouts</li>
<li>Approach angle improvement vs. factory</li>
<li>Powder coat finish — color options and quality</li>
</ul>

<h2>Fitment</h2>
<p>Bumpers are vehicle-specific. Mounting points, sensor locations (parking sensors, radar, camera), and body line geometry all vary by year and trim. Every product in this collection includes a full fitment table. If your truck has factory parking sensors or radar — common on 2017+ trucks — confirm the bumper accommodates sensor relocation or includes sensor mounts.</p>

<h2>Shop ${title} at Bull Strap</h2>
<p>Full fitment tables, material specs, and weight ratings are listed on every product page. Shop by vehicle to find confirmed-fit bumpers for your year, make, model, and trim.</p>`, title, handle || '');
}

function skidPlateTemplate(title) {
    return padded(`<h2>${title} — Underbody Protection for Off-Road Vehicles</h2>
<p>Skid plates protect the vulnerable underside of your truck, SUV, or Jeep from rock strikes, stumps, and trail debris that would otherwise damage or destroy critical components. The oil pan, transmission, transfer case, fuel tank, and differential housings hang below the frame on most vehicles — any of them can be cracked or holed by a direct rock strike on aggressive terrain. Skid plates turn potential trail-enders into minor inconveniences.</p>

<h2>What Skid Plates Protect</h2>
<ul>
<li><strong>Engine/oil pan:</strong> The lowest-hanging component on most IFS trucks — first thing to contact a high-centered rock</li>
<li><strong>Transmission/transfer case:</strong> Center of the vehicle; vulnerable on ledge crossings and high-centered situations</li>
<li><strong>Fuel tank:</strong> Often the widest component under the vehicle; vulnerable on off-camber trails</li>
<li><strong>Rear differential:</strong> Particularly exposed on solid rear axle trucks on rough terrain</li>
<li><strong>Front differential:</strong> Common strike point on IFS trucks with front differentials hanging low</li>
<li><strong>Steering rack:</strong> Low-hanging and vulnerable on IFS platforms</li>
</ul>

<h2>Skid Plate Materials</h2>
<dl>
<dt>Steel (3/16" or 1/4")</dt>
<dd>Maximum protection, heaviest weight. Absorbs and deflects impacts without cracking. Can be repaired by welding. Standard for dedicated rock crawlers and serious trail rigs.</dd>
<dt>Aluminum (1/4" or 5/16")</dt>
<dd>Lighter than steel, corrosion-resistant, still strong enough for most trail use. Preferred for overlanding and general trail use where weight matters. Does not absorb impacts as well as steel — slides over rocks rather than stopping them.</dd>
<dt>HDPE (polyethylene)</dt>
<dd>Flexible, extremely slippery, lightweight. Excellent for slickrock where sliding over obstacles is preferable to deflecting. Less protection against sharp impacts.</dd>
</dl>

<h2>Fitment</h2>
<p>Skid plates are vehicle-specific — mounting points, ground clearance, component locations, and drain plug access all vary by make and model. Every product in this collection includes a full fitment table by year, make, model, and trim. Confirm drain plug access before purchasing — some skid plate designs require removal for oil changes; others include access ports.</p>

<h2>Shop ${title} at Bull Strap</h2>
<p>Material specs, coverage area, and fitment tables are on every product page. Shop by your vehicle to find confirmed-fit skid plate kits for your truck, SUV, or Jeep.</p>`, title, '');
}

function runningBoardTemplate(title) {
    return padded(`<h2>${title} — Running Boards and Nerf Bars for Trucks and SUVs</h2>
<p>Running boards and nerf bars make entry and exit easier — a practical necessity on lifted trucks where the step-in height can exceed 24" from the ground. Beyond pure function, they protect the door sills and rocker panels from dings, rocks, and trail debris. On work trucks, they're a daily convenience. On lifted builds, they're borderline essential for passengers who aren't six feet tall.</p>

<h2>Running Boards vs. Nerf Bars</h2>
<dl>
<dt>Running boards</dt>
<dd>Full-length step platforms running along the lower edge of the door sills. Broad flat surface — easier to step on, more comfortable for multiple entry/exit points. Common in OEM-style and replacement applications.</dd>
<dt>Nerf bars (tube steps)</dt>
<dd>Steel or aluminum tube running along the rocker, with step pads at the door locations. More off-road durable — narrower profile reduces clearance loss and is less likely to catch terrain. More common on lifted trucks and off-road builds.</dd>
<dt>Power running boards</dt>
<dd>Motorized boards that retract flush with the body when not in use and extend when the door opens. Factory option on many full-size trucks; aftermarket versions available. Maximum ground clearance when retracted.</dd>
</dl>

<h2>Materials and Finish</h2>
<ul>
<li><strong>Stainless steel:</strong> Corrosion-resistant, bright finish. Common on factory-replacement and styling-focused applications.</li>
<li><strong>Black powder-coated steel:</strong> Durable, matte finish. Common on off-road and truck-focused applications. Some surface rust on chips over time in high-moisture environments.</li>
<li><strong>Aluminum:</strong> Lightweight, corrosion-resistant, common in OEM-replacement boards.</li>
</ul>

<h2>Step Surface</h2>
<p>Check the step pad material and coverage area — a step bar with small non-slip pads in the wrong location for your door jamb is functionally useless in wet conditions. The best step pads are wide, full-grip aluminum tread or molded rubber covering the full usable step area.</p>

<h2>Fitment</h2>
<p>Running boards and nerf bars are vehicle-specific — cab length (regular, extended, crew), body configuration, and rocker mount locations all vary. Every product listing includes a fitment table by year, make, model, cab configuration, and trim.</p>

<h2>Shop ${title} at Bull Strap</h2>
<p>Full fitment tables, material specs, and step surface details are on every product page. Shop by your vehicle to find confirmed-fit running boards and nerf bars.</p>`, title, '');
}

function tonneauTemplate(title) {
    return padded(`<h2>${title} — Truck Bed Covers for Full-Size and Midsize Pickups</h2>
<p>Tonneau covers protect your truck bed cargo from weather, theft, and road debris while improving aerodynamics and fuel economy. They're one of the most practical upgrades for any work truck or daily-driven pickup — and with the range of styles now available, there's a cover for every use case from daily grocery runs to weekend off-road trips where you need full bed access in seconds.</p>

<h2>Types of Tonneau Covers</h2>
<dl>
<dt>Soft roll-up</dt>
<dd>Vinyl cover that rolls toward the cab for full bed access. Most affordable option. Provides weather resistance; not a theft deterrent. Lightweight and easy to install and remove.</dd>
<dt>Soft folding (tri-fold / quad-fold)</dt>
<dd>Vinyl panels that fold forward in sections. Better structure than roll-up; faster to open. Medium price range. Not lockable; moderate weather resistance.</dd>
<dt>Hard folding (aluminum or fiberglass)</dt>
<dd>Rigid panels that fold forward. Better weather seal than soft options. Lockable when closed. Most popular category for daily truck use balancing access and security.</dd>
<dt>Hard retractable</dt>
<dd>Aluminum slats that retract into a housing at the front of the bed. Opens like a garage door. Best aerodynamics; excellent weather seal; locks in any open position. Premium price.</dd>
<dt>One-piece fiberglass</dt>
<dd>Painted fiberglass shell matching truck color. Looks factory; excellent weather seal; high theft deterrence. Heavy; bed access requires removing or prop-opening the entire cover.</dd>
</dl>

<h2>Fitment</h2>
<p>Tonneau covers are vehicle-specific — bed length, rail width, and stake pocket configuration all vary by make, model, and cab/bed combination. Every product listing includes fitment by year, make, model, and bed length. Confirm your bed length before ordering: most full-size trucks come in 5.5', 6.5', and 8' bed lengths; some models offer 5'7" or 6'2" beds. Measure your own bed if uncertain.</p>

<h2>Installation</h2>
<p>Most soft and hard folding covers install in 15–30 minutes with basic tools using clamps that attach to the bed rail — no drilling required. Retractable covers take longer and may require stake pocket mounting. One-piece covers require bed rail seal and hinge installation.</p>

<h2>Shop ${title} at Bull Strap</h2>
<p>Full fitment tables, style comparisons, and warranty information are on every product page. Shop by your truck's year, make, model, and bed length to find confirmed-fit covers.</p>`, title, '');
}

function floorMatTemplate(title) {
    return padded(`<h2>${title} — Custom-Fit Floor Mats and Cargo Liners</h2>
<p>Custom-fit floor mats protect the carpet in your truck, SUV, or car from mud, water, snow, and everyday wear that degrade factory carpet and dramatically reduce resale value. Unlike universal mats that shift around and leave gaps, custom-fit mats are laser-scanned or digitally patterned to the exact floor contours of your specific vehicle — they stay in place and protect every square inch of the floor area they cover.</p>

<h2>Custom-Fit vs. Universal Mats</h2>
<p>The difference is significant. Universal mats are cut to a generic shape that loosely fits a range of vehicles — they rarely cover the corners and edges of the floor, they don't anchor to the factory mat retention hooks, and they shift constantly. Custom-fit mats cover the specific contours of your vehicle's floor including the raised sections around the center tunnel and kick panels. They anchor to factory hooks and don't move under your feet or when passengers get in and out.</p>

<h2>Mat Materials</h2>
<dl>
<dt>Thermoplastic elastomer (TPE) / rubber</dt>
<dd>Waterproof, flexible, easy to hose clean. The standard for all-weather floor protection. Some rubber mats have a strong odor from manufacturing — check for low-VOC or odor-free options if sensitive.</dd>
<dt>Nylon / carpet</dt>
<dd>Softer feel, more OEM-like appearance. Less protective against heavy water and mud compared to rubber but appropriate for dry climates and less extreme use.</dd>
<dt>High-wall / lip mats</dt>
<dd>Feature raised edges that contain spills and heavy mud before they overflow onto the carpet beneath. Essential for trucks that see regular off-road use, snowy climates, or kids with wet sports gear.</dd>
</dl>

<h2>Cargo Liners</h2>
<p>For SUVs and crossovers, cargo liners protect the trunk area from the same mud, water, and wear as floor mats. Custom-fit cargo liners follow the exact floor and side wall contours of your load floor — far more effective than a universal cargo mat that doesn't contact the sides or fit around wheel well humps.</p>

<h2>Fitment</h2>
<p>Floor mats are vehicle-specific — floor contours, mat retention hook locations, and floor area dimensions are unique to each make, model, and cab configuration. Every product listing includes fitment by year, make, model, cab (regular, extended, crew), and trim. Check your vehicle's specific cab and trim before ordering.</p>

<h2>Shop ${title} at Bull Strap</h2>
<p>Full fitment tables, material specs, and warranty information are on every product page. Shop by your vehicle to find confirmed-fit floor protection.</p>`, title, '');
}

function seatCoverTemplate(title) {
    return padded(`<h2>${title} — Custom-Fit Seat Covers for Trucks, SUVs, and Cars</h2>
<p>Seat covers protect the factory upholstery in your truck or SUV from wear, stains, UV fading, and the kind of daily abuse that comes with work trucks, family vehicles, and off-road rigs. The right seat cover maintains the value of factory leather, prevents cloth seats from absorbing pet hair and moisture, and gives a worn interior a fresh appearance — all without permanently altering the factory seat.</p>

<h2>Custom-Fit vs. Universal Seat Covers</h2>
<p>Custom-fit seat covers are patterned or laser-measured for specific vehicle models — they fit over the factory seat contours without bunching, gaping, or blocking airbag deployment. Universal covers are a rough approximation that stretches over a range of seat shapes — they're cheaper and look it. For a vehicle you drive daily and care about, custom-fit is the correct choice.</p>

<h2>Seat Cover Materials</h2>
<dl>
<dt>Neoprene</dt>
<dd>Waterproof, comfortable, durable. The most popular choice for trucks. Feels similar to a wetsuit — slightly springy, warm in cold weather. Good UV resistance. Machine washable.</dd>
<dt>Canvas / heavy-duty polyester</dt>
<dd>Tough and abrasion-resistant. Common on work trucks where the seat sees tools, boots, and rough use. Less comfortable for long drives than neoprene but nearly indestructible.</dd>
<dt>Leatherette / faux leather</dt>
<dd>Looks like leather, easy to wipe clean. Not as breathable as fabric options — can feel hot in summer. Good for family vehicles and light daily use.</dd>
<dt>Factory-match upholstery</dt>
<dd>Premium option — real leather or high-quality cloth matched to the factory color and pattern. Requires professional installation on some designs.</dd>
</dl>

<h2>Airbag Compatibility</h2>
<p>Critical: trucks and SUVs from approximately 2005 onwards have side-curtain or side-thorax airbags integrated into the seat structure. A seat cover must have designated airbag cutouts or sewn release seams in the correct location — otherwise the airbag may not deploy correctly in an accident. Every product listing in this collection specifies airbag compatibility. Do not install a seat cover that is not confirmed airbag-compatible for your specific vehicle.</p>

<h2>Fitment</h2>
<p>Seat covers are vehicle-specific — seat contour, headrest configuration, armrest integration, and airbag location all vary by year and trim. Every product listing includes fitment by year, make, model, and trim level. Front and rear covers are typically sold separately or as a set.</p>

<h2>Shop ${title} at Bull Strap</h2>
<p>Full fitment tables, material specs, and airbag compatibility details are on every product page. Shop by your vehicle to find confirmed-fit, airbag-safe seat covers.</p>`, title, '');
}

function recoveryTemplate(title, handle) {
    return padded(`<h2>${title} — Off-Road Recovery Gear</h2>
<p>Recovery gear is the difference between a minor trail inconvenience and an overnight stuck-in-the-mud situation. Whether you're running a winch line to a distant anchor point, pulling a buddy out of a bog with a kinetic recovery rope, or rigging a pulley block for a mechanical advantage pull, the gear you carry and the knowledge of how to use it determines whether you get yourself home or you call for help.</p>

<h2>Recovery Gear Categories</h2>
<dl>
<dt>Winch and winch accessories</dt>
<dd>Electric winches mount to the front bumper and use a steel cable or synthetic rope to self-recover or assist others. Accessories include winch lines, hooks, rope covers, and synthetic rope replacements for steel cable.</dd>
<dt>Kinetic recovery ropes (snatch ropes)</dt>
<dd>Stretch under load and release their stored energy to jerk a stuck vehicle free. More effective than a static tow strap for most recovery situations. Rated by diameter and breaking strength.</dd>
<dt>Tow straps (static)</dt>
<dd>Non-stretch straps for towing a vehicle under control. Not suitable for snatch recoveries — static straps transmit shock load directly to recovery points and can cause failure.</dd>
<dt>Shackles (D-rings / bow shackles)</dt>
<dd>Connect recovery gear to vehicle recovery points. Rated by working load limit. Use rated shackles only — never substitute hardware store shackles in recovery applications.</dd>
<dt>Snatch blocks</dt>
<dd>Pulleys that redirect a winch line or recovery rope. A snatch block in a simple redirect doubles the effective pulling force of a winch. Essential recovery tool.</dd>
<dt>Hi-Lift jack</dt>
<dd>Mechanical jack that can lift, winch, and clamp. High-clearance recovery tool for situations where a hydraulic jack won't reach a lift point.</dd>
</dl>

<h2>Recovery Point Rating</h2>
<p>Every piece of recovery gear has a working load limit (WLL) and a break strength rating. The WLL is the maximum load the piece should ever see in use — typically 25–33% of the break strength. For vehicle recovery, use gear rated to at least 2x the vehicle's GVWR for static recovery situations; 4x or higher for dynamic/snatch situations where shock loads are involved.</p>
<p>Recovery points on the vehicle also matter. Factory tow hooks are typically rated for towing loads, not recovery loads — always check your vehicle's recovery point rating before attaching recovery gear.</p>

<h2>Shop ${title} at Bull Strap</h2>
<p>Working load limits, break strengths, and length/diameter specifications are listed on every product page. Shop by application — winch, snatch, static tow — to find the right gear for your recovery kit.</p>`, title, handle || '');
}

function lightingTemplate(title, handle) {
    return padded(`<h2>${title} — Lighting Upgrades for Trucks and Off-Road Vehicles</h2>
<p>Lighting upgrades improve visibility, safety, and the functional capability of your truck or off-road vehicle after dark. Whether you're replacing dim factory headlights with modern LED projectors, adding auxiliary lights for trail use, or upgrading work truck bed lighting for late-night job sites, the right lighting upgrade is one of the most immediately noticeable improvements you can make to any vehicle.</p>

<h2>Lighting Types</h2>
<dl>
<dt>LED headlights</dt>
<dd>Upgrade over factory halogen or early HID headlights. Modern LED headlights produce more light output (lumens), consume less power, and have a much longer service life. Beam pattern matters — properly designed LED headlights produce a sharp cutoff to avoid blinding oncoming traffic.</dd>
<dt>HID / Xenon</dt>
<dd>High-intensity discharge headlights. Bright blue-white light; high output. Being displaced by LED in most applications. Still found in many factory systems on vehicles from 2005–2015.</dd>
<dt>Auxiliary driving lights</dt>
<dd>Supplemental forward lighting for night driving at speed. Driving pattern illuminates a long, narrow beam ahead of the vehicle on high-speed desert runs and trail use. Requires relay and switch installation.</dd>
<dt>Fog lights</dt>
<dd>Wide, flat beam pattern to illuminate the road surface under fog conditions without reflecting back from water vapor. Also useful for low-speed trail navigation where a wide near-field beam is more useful than a narrow driving beam.</dd>
<dt>Light bars</dt>
<dd>Linear LED arrays for maximum off-road auxiliary lighting. Available in spot, flood, and combo beam patterns. Roof mount, bumper mount, and grille mount configurations.</dd>
<dt>Work / bed lights</dt>
<dd>For work truck applications — illuminate the truck bed for nighttime loading and job site use.</dd>
</dl>

<h2>Fitment and Legal Compliance</h2>
<p>Headlight replacements must match the projector or reflector style of your factory housings — a properly designed LED replacement in a reflector housing produces a legal, effective beam. A poorly designed one creates glare and reduced effective range. Every headlight listing in this collection specifies compatibility with factory housing type. Auxiliary lights must comply with local regulations regarding mounting location and use conditions — many states prohibit auxiliary forward lights on public roads.</p>

<h2>Shop ${title} at Bull Strap</h2>
<p>Full fitment tables, lumen output ratings, beam pattern specifications, and warranty information are on every product page. Shop by your vehicle to find confirmed-fit lighting upgrades.</p>`, title, handle || '');
}

function exhaustTemplate(title) {
    return padded(`<h2>${title} — Performance Exhaust Systems and Components</h2>
<p>An exhaust system upgrade improves engine breathing, increases power output, changes exhaust tone, and on most setups reduces overall system weight versus the factory OEM exhaust. The gains vary by vehicle, existing exhaust configuration, and the specific components installed — a cat-back system on a turbocharged truck produces measurably different results than the same upgrade on a naturally aspirated V8 — but exhaust work is a consistent value proposition for trucks and performance vehicles at any level of build.</p>

<h2>Exhaust System Components</h2>
<dl>
<dt>Headers / manifolds</dt>
<dd>The first component after the combustion chamber. Equal-length headers improve exhaust scavenging — the pulse timing that draws exhaust gases out of adjacent cylinders. Significant power gains on high-revving naturally aspirated engines; less impactful on turbocharged platforms where the turbo dominates exhaust backpressure.</dd>
<dt>Catalytic converters</dt>
<dd>Reduce exhaust emissions by converting CO, HC, and NOx into CO2, H2O, and N2. High-flow catalytic converters reduce restriction versus OEM converters while maintaining emissions compliance.</dd>
<dt>Mid-pipe / down-pipe</dt>
<dd>Connects the header or turbo outlet to the cat-back system. Down-pipe (turbo applications) is often the highest-impact single piece — connecting the turbocharger to the rest of the exhaust; up-pipe on diesel trucks connects the exhaust manifold to the turbocharger.</dd>
<dt>Cat-back systems</dt>
<dd>Everything from the catalytic converter back to the tip. The most common aftermarket exhaust upgrade — no catalytic converter modification, fully legal in most applications. Typically includes mid-pipe, resonator (optional), muffler, and tips.</dd>
<dt>Axle-back systems</dt>
<dd>From the rear axle back — just muffler and tips. Tone change only, minimal power impact, lowest cost exhaust upgrade.</dd>
<dt>Mufflers</dt>
<dd>Standalone muffler replacement. Performance mufflers reduce restriction versus OEM; straight-through designs (glasspacks) are loudest; baffled designs (Flowmaster, Borla) balance tone with restriction reduction.</dd>
</dl>

<h2>Fitment</h2>
<p>Exhaust systems are vehicle-specific — pipe diameter, hanger locations, and component positioning vary by year, engine, and cab/bed configuration. Every product listing includes fitment by year, make, model, engine, and cab configuration. Diesel and gas versions often differ even within the same model year — confirm engine type before ordering.</p>

<h2>Shop ${title} at Bull Strap</h2>
<p>Pipe diameter, system weight, sound level, and power gain claims are listed on every product page where available. Shop by your vehicle to find confirmed-fit exhaust systems and components.</p>`, title, '');
}

function engineTemplate(title, handle) {
    return padded(`<h2>${title} — Engine Performance Parts for Trucks and Cars</h2>
<p>Engine performance upgrades improve power output, throttle response, fuel economy, or all three — depending on the modification and the vehicle. The products in this collection cover the intake side of the equation: cold air intakes, air filters, throttle body spacers, and associated components that improve the volume and quality of air entering the engine. More air, correctly delivered, means more power from the same displacement and fuel.</p>

<h2>Cold Air Intakes</h2>
<p>A cold air intake (CAI) replaces the factory airbox and intake tube with a larger-diameter intake pipe and a high-flow air filter, positioned to draw from a cooler location than the factory airbox (typically lower and forward, away from engine heat). The benefits:</p>
<ul>
<li><strong>Cooler intake air:</strong> Denser air means more oxygen per cubic foot — more power potential per combustion cycle</li>
<li><strong>Reduced restriction:</strong> Larger diameter pipe and higher-flow filter reduces intake restriction vs. factory</li>
<li><strong>Intake sound:</strong> Open intake systems produce an audible induction roar under throttle that many truck owners prefer to the muffled sound of a sealed airbox</li>
</ul>
<p>Measurable gains on naturally aspirated trucks: typically 5–15 hp. On turbocharged trucks, the intercooler limits how much intake air temperature matters — gains are usually smaller unless the factory intake is a significant restriction.</p>

<h2>Air Filters</h2>
<p>High-flow replacement air filters (oiled gauze or dry synthetic media) flow more air than factory paper filters while maintaining filtration efficiency. Reusable — cleaned and re-oiled rather than replaced. Long-term cost advantage over disposable OEM filters. Drop-in replacements fit factory airbox locations — no intake modification required.</p>

<h2>Throttle Body Spacers</h2>
<p>A spacer installed between the throttle body and intake manifold increases air velocity entering the manifold by creating a venturi effect. Gains are modest on most modern fuel-injected vehicles. More effective on older port-injection and carbureted applications. Simple, no-tune installation.</p>

<h2>Fitment</h2>
<p>Intake components are vehicle and engine specific. Cold air intakes in particular are engineered for specific engine bay geometry and intake sensor locations — a kit designed for a 5.0L Coyote does not fit a 3.5L EcoBoost even in the same model year. Every product listing includes fitment by year, make, model, and engine. Confirm your engine code before ordering.</p>

<h2>Shop ${title} at Bull Strap</h2>
<p>HP/torque gain claims, filter flow ratings, and fitment tables are on every product page. Shop by your engine to find confirmed-fit performance intake upgrades.</p>`, title, handle || '');
}

function towingTemplate(title, handle) {
    return padded(`<h2>${title} — Towing Equipment for Trucks</h2>
<p>Towing capacity is one of the primary selling points of full-size and heavy-duty trucks — but the right towing equipment is what makes that capacity safe and functional in practice. The receiver hitch, ball mount, weight distribution system, brake controller, and associated hardware all need to be rated for the load you're pulling and properly configured for your vehicle. Undersized towing equipment is a safety risk; properly selected and installed equipment makes heavy towing manageable and controlled.</p>

<h2>Towing System Components</h2>
<dl>
<dt>Receiver hitches</dt>
<dd>The primary connection point between vehicle and trailer. Class ratings define tongue weight capacity (the downward force of the trailer tongue) and gross trailer weight rating. Class I (2,000 lb GTW) through Class V (20,000+ lb GTW). Must match or exceed your vehicle's factory tow rating and your intended trailer weight.</dd>
<dt>Ball mounts</dt>
<dd>The adjustable drawbar that slides into the receiver and positions the ball height to match the trailer coupler height. Available in fixed, adjustable, and drop/rise configurations. Ball diameter must match coupler: 1-7/8", 2", 2-5/16" are the three common sizes.</dd>
<dt>Weight distribution systems</dt>
<dd>Spring bars attached between the hitch head and the trailer frame distribute trailer tongue weight across the tow vehicle's front axle and trailer axles. Required for many heavy trailers — without WD, the rear of the tow vehicle squats under tongue weight, reducing front axle traction and braking.</dd>
<dt>Sway control</dt>
<dd>Friction bars or electronic sway control systems that dampen trailer oscillation. Critical for large trailers at highway speed — trailer sway is one of the most dangerous towing conditions.</dd>
<dt>Gooseneck and fifth-wheel</dt>
<dd>For heavy-duty towing over 15,000 lbs. Fifth-wheel connects in the bed over the rear axle for maximum stability. Gooseneck uses a ball in the bed with a coupler on the trailer.</dd>
</dl>

<h2>Tow Rating and Tongue Weight</h2>
<p>Your vehicle's tow rating is a maximum — not a target. Operating near maximum tow capacity with improper weight distribution, worn brakes, or over-inflated tires is dangerous. Tongue weight should be 10–15% of total trailer weight. Too little tongue weight causes trailer sway; too much causes rear squat and front axle unloading.</p>

<h2>Fitment</h2>
<p>Hitches are vehicle-specific — frame rail width, receiver position, and mounting hole patterns vary by make, model, and year. Every product listing includes fitment by year, make, model, and trim. Class ratings and tongue weight limits are listed on every hitch product page.</p>

<h2>Shop ${title} at Bull Strap</h2>
<p>Class ratings, tongue weight limits, gross trailer weight ratings, and fitment tables are on every product page. Shop by your vehicle and tow rating to find confirmed-fit towing equipment.</p>`, title, handle || '');
}

function bodyLiftTemplate(title) {
    return padded(`<h2>${title} — Body Lift Kits for Trucks and SUVs</h2>
<p>A body lift raises the cab and bed of your truck above the frame by installing polyurethane or nylon spacers between the body mounts and the frame. Unlike a suspension lift, a body lift does not change suspension geometry, spring rates, or shock travel — it simply creates vertical space between the body and frame, allowing larger tires to clear the fender wells without the cost or complexity of a full suspension system replacement.</p>

<h2>How Body Lifts Work</h2>
<p>Factory trucks are bolted to their frames through rubber body mounts — large rubber isolators that absorb vibration and noise. A body lift kit replaces these factory isolators with taller spacer blocks — typically 1", 2", or 3" — that sit between the body and the frame at each mount location. The body rises by the height of the spacer. All steering, drivetrain, and suspension components remain at their original height relative to the ground.</p>

<h2>Body Lift Advantages</h2>
<ul>
<li>Lower cost than a suspension lift for equivalent tire clearance</li>
<li>No change to suspension geometry — no alignment issues, no CV angle changes</li>
<li>No change to suspension travel or shock specifications</li>
<li>Relatively simple installation vs. full suspension replacement</li>
</ul>

<h2>Body Lift Considerations</h2>
<ul>
<li>Creates a visible gap between body and frame — cosmetically acceptable up to 2"; more visible at 3"</li>
<li>Requires extension of hood brace, radiator, and steering shaft on most applications</li>
<li>Does not improve ground clearance for suspension components — the frame, axles, and driveline remain at the same height</li>
<li>Bumper drop brackets required to bring factory bumpers back to correct height relative to the body</li>
<li>Maximum practical body lift is 3" — beyond that, body gap and accessory extension requirements become impractical</li>
</ul>

<h2>Body Lift vs. Suspension Lift</h2>
<p>Body lifts create tire clearance by raising the body away from the tires. Suspension lifts increase ground clearance by raising the entire vehicle (frame, body, and mechanical components) above the axles. For maximum off-road capability, both are often combined. For simply fitting larger tires on a street truck, a body lift is a cost-effective option.</p>

<h2>Fitment</h2>
<p>Body lifts are vehicle-specific — body mount locations, bolt sizes, and the accessories requiring extension (steering shaft, radiator, hood brace) all vary by make and model. Every product listing includes fitment by year, make, and model with a component list of all included spacers, brackets, and extension hardware.</p>

<h2>Shop ${title} at Bull Strap</h2>
<p>Full component lists, included hardware specifications, and fitment tables are on every product page. Shop by your vehicle to find confirmed-fit body lift kits.</p>`, title, '');
}

function genericTemplate(title, handle) {
  const cat = (title || handle).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return `<h2>${cat} for Trucks, SUVs, and Off-Road Vehicles</h2>
<p>The ${cat} collection at Bull Strap carries parts and accessories for trucks, SUVs, and off-road vehicles sourced from Turn14 Distribution, one of the largest automotive aftermarket distributors in North America. Every product listing includes a complete fitment table by year, make, model, and trim so you confirm compatibility before the order ships, not after it arrives. Bull Strap catalog covers over 103,000 products across hundreds of brands, giving truck and off-road vehicle owners access to a comprehensive selection of aftermarket parts from a single source with verified fitment data.</p>

<h2>Choosing the Right Part</h2>
<p>Aftermarket parts span a wide quality spectrum. At the low end, you have unbranded overseas imports with no documented specifications, no fitment data, and no warranty. At the high end, you have engineered components from manufacturers who test their parts to defined load and durability standards before releasing them to market. The products in this collection come from established brands with real specifications, documented fitment data, and legitimate warranty programs that back up their claims. When you are evaluating any aftermarket part, the following criteria separate quality parts from the rest of the market.</p>
<p>Fitment specificity matters more than most buyers realize. Parts engineered for your exact year, make, model, and trim install correctly without modification and perform as designed from the first use. Universal-fit parts require trimming and adjustment that degrades final fit quality and often leaves gaps in coverage or function that create problems down the road. Always confirm vehicle-specific fitment before purchasing any structural, safety-adjacent, or precision-fit component.</p>
<p>Material specifications tell you what you are actually buying. A quality part from a reputable manufacturer lists the material clearly: steel gauge, alloy grade, polymer type, coating specification, and tensile or yield strength where relevant. If a product description says heavy-duty without specifying what that means in measurable terms, treat that as a red flag. Vague materials claims are a consistent indicator of parts that will not perform as expected under real-world use conditions.</p>
<p>Load ratings are critical for structural and safety-adjacent components. Recovery gear, hitch components, skid plates, grab handles, limit straps, and tow hooks all need to be rated for the loads they will see in use. If a product listing for a structural component has no load rating, ask the manufacturer for documentation before purchasing. Installing unrated hardware in a load-bearing application is a liability and a safety risk.</p>
<p>Warranty terms vary significantly across brands and part types. A lifetime warranty on a fifteen dollar part is a different proposition than a one-year warranty on a three hundred dollar suspension component from an established manufacturer. Read the warranty terms before you commit. Understand what is covered, what voids coverage, and how claims are processed. A strong warranty from a manufacturer with an established claims process is meaningful. A lifetime warranty from a company with no contact information or claims process is not.</p>
<p>Fitment verification is the last step before ordering. Fitment tables are only as good as the data that went into them. Cross-check the fitment table against your specific vehicle, paying attention to engine, cab configuration, bed length, and trim level where those fields are listed. If something does not look right for your application, contact the seller to confirm before the order ships. Return shipping costs on heavy truck parts make mistaken orders expensive.</p>

<h2>Vehicle Coverage in This Collection</h2>
<p>Products in this collection cover the most common trucks, SUVs, and off-road vehicles on the market today. Full-size trucks represent the largest segment of the fitment data in the Turn14 catalog, followed by midsize trucks and purpose-built off-road platforms. The following makes and model years are covered across this collection.</p>
<p>Ford coverage includes the F-150 from 2004 through the current model year, F-250 Super Duty from 2005 through present, F-350 Super Duty from 2005 through present, Bronco from 2021 through present, Bronco Sport from 2021 through present, Ranger from 2019 through present, and Maverick from 2022 through present. Ford is the best-selling truck brand in the United States and carries the broadest aftermarket part support of any manufacturer in the Turn14 catalog.</p>
<p>Ram and Dodge coverage includes the Ram 1500 from 2009 through present, Ram 1500 Classic from 2019 through present, Ram 2500 from 2010 through present, Ram 3500 from 2010 through present, and Ram 4500/5500 for select heavy-duty applications. Ram HD trucks including the 2500 and 3500 are particularly well supported by the suspension and towing categories in the Turn14 catalog.</p>
<p>Chevrolet and GMC coverage includes the Silverado 1500 from 2007 through present, Silverado 2500HD from 2011 through present, Silverado 3500HD from 2011 through present, Sierra 1500 from 2007 through present, Sierra 2500HD from 2011 through present, Sierra 3500HD from 2011 through present, Colorado from 2015 through present, and Canyon from 2015 through present.</p>
<p>Toyota coverage includes the Tacoma from 2005 through present, Tundra from 2007 through present, 4Runner from 2003 through present, Sequoia from 2008 through present, and Land Cruiser for select applications. Toyota trucks and SUVs have a particularly strong following in the overlanding and off-road communities and are well represented in the catalog.</p>
<p>Jeep coverage includes the Wrangler TJ from 1997 through 2006, Wrangler JK from 2007 through 2018, Wrangler JL from 2018 through present, Gladiator JT from 2020 through present, and select Cherokee and Grand Cherokee applications. Jeep Wranglers are among the most accessorized vehicles in the aftermarket, with extensive support across suspension, exterior, interior, lighting, and recovery categories.</p>
<p>Nissan coverage includes the Frontier from 2005 through present, Titan from 2004 through present, and Titan XD from 2016 through present. Individual product listings specify exact fitment within these broad platform groups. Always check the product page fitment table for your specific year, make, model, and trim before ordering to confirm compatibility.</p>

<h2>Brands Carried at Bull Strap</h2>
<p>Bull Strap catalog through Turn14 Distribution includes parts from hundreds of aftermarket manufacturers spanning every major truck and off-road accessory category. The brand mix covers the full range from OEM-quality replacements through high-performance upgrades.</p>
<p>Suspension brands represented include Bilstein, Fox, Rancho, KYB, Monroe, ICON Vehicle Dynamics, Old Man Emu, Carli Suspension, Eibach, ReadyLift, Rough Country, Fabtech, Skyjacker, and SuperLift among others. Recovery and off-road brands include Warn, Smittybilt, ARB, Hi-Lift Jack, Bubba Rope, and Factor 55. Lighting brands include Rigid Industries, Baja Designs, KC HiLiTES, Diode Dynamics, Putco, and Anzo. Exterior brands include Lund, Bushwacker, WeatherTech, LineX, Dee Zee, Undercover, and Extang. Interior brands include Husky Liners, WeatherTech, Covercraft, Coverking, Bestop, and Rugged Ridge.</p>
<p>OEM-quality replacement parts come from Dorman, Moog, Gates, Monroe, Standard Motor Products, and ACDelco among others. Performance and specialty brands vary by category. Not every brand available through Turn14 is represented in this specific collection, but the most commonly searched and purchased brands in this category are included. If you are looking for a specific brand that does not appear in the current listings, use the search bar or contact Bull Strap directly for availability.</p>

<h2>OEM Replacement vs Performance Upgrade</h2>
<p>The aftermarket parts market divides into two broad approaches for most parts categories: OEM-quality replacement and performance upgrade. Understanding which approach your project needs before you shop saves time, money, and the frustration of buying the wrong part twice.</p>
<p>OEM-quality replacement parts are engineered to meet or exceed OEM specifications for a component that is worn, failed, or damaged. The goal is to restore the vehicle to factory spec with a part that matches or improves on the original quality level. Brands like Moog, Dorman, Gates, and Monroe occupy this space. These parts are often higher quality than the original OEM parts at a lower price point, using better materials and tighter manufacturing tolerances. They are not designed to change the vehicle performance characteristics, only to restore and maintain them at factory levels.</p>
<p>Performance upgrade parts are engineered to improve on factory specifications in specific, measurable ways. More strength, more adjustability, better damping performance, improved corrosion resistance, extended service life under heavy use, or expanded travel range for lifted applications. Brands like Bilstein, Fox, Carli Suspension, ICON Vehicle Dynamics, and Eibach occupy this space. The cost is higher than OEM-replacement parts, but the performance improvement in the targeted areas is real and measurable.</p>
<p>Most vehicle owners need OEM-quality replacement parts for worn items and reserve performance upgrades for specific capabilities they want to improve beyond factory levels. A truck with worn factory shocks benefits more from a quality OEM-spec shock replacement than from a performance coilover at three times the price, unless the owner also intends to lift the truck and use it seriously off-road. Match the part category to the actual use case rather than defaulting to the most expensive option in every category.</p>

<h2>Installation Resources</h2>
<p>Every product listing in this collection includes installation information where the manufacturer provides it. Difficulty ratings, required tools, and estimated installation time are included on product pages where applicable. For parts requiring specific vehicle knowledge or alignment work, including suspension components, brake system parts, and steering components, professional installation is recommended unless you have the relevant mechanical background and proper equipment to do the job correctly.</p>
<p>For straightforward bolt-on accessories and replacement parts, most installations are within reach of a mechanically competent owner with basic hand tools and a floor jack with safety stands. Torque specifications and installation sequences are provided in the product documentation. Follow the manufacturer torque specifications rather than estimating. Under-torqued hardware backs out under vibration and road shock. Over-torqued hardware strips threads or cracks, particularly on aluminum components and the soft-metal fasteners common in interior and electrical applications where the consequences of improper torque are not immediately visible.</p>

<h2>Bull Strap and the USA-Made Limit Strap</h2>
<p>Bull Strap original and signature product is the USA-made limit strap engineered and manufactured in the United States for lifted trucks and serious off-road builds. Limit straps cap the droop travel of a lifted vehicle suspension, protecting CV axles, brake lines, and ABS sensor wires from overextension at full droop on the trail. They are one of the most overlooked but functionally important components on any seriously lifted truck or off-road build. Every lifted truck with independent front suspension or a lifted solid axle setup that sees real trail use should have limit straps protecting the drivetrain from overextension damage.</p>
<p>The Turn14 catalog of over 103,000 products is the primary product surface at Bull Strap today, but the limit strap is where the brand started and it remains the benchmark product. Every limit strap sold by Bull Strap is made in the USA using high-tenacity polyester webbing, solid steel hardware, and heat-shrink tubing on every connection point. Built to withstand the repeated load cycles of serious off-road use across a range of vehicle applications from Jeep Wranglers to lifted Ram 2500 heavy-duty trucks to purpose-built prerunners.</p>

<h2>Shop ${cat} at Bull Strap</h2>
<p>Full product specifications, fitment tables, brand information, and warranty details are on every product page in this collection. Every listing includes the data you need to confirm the right part before you order. Shop by your vehicle using the fitment filter to narrow results to confirmed-compatible products for your specific year, make, model, and trim level. If you need help finding a specific part or confirming fitment for an unusual application or combination of modifications, reach out. Bull Strap carries a large catalog sourced from Turn14 Distribution and we can help you locate what you need.</p>`;
}

// ─── WORD COUNT ───────────────────────────────────────────────────────────────

function stripHtml(h) {
  return h ? h.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim() : '';
}
function wordCount(h) {
  const t = stripHtml(h);
  return t ? t.split(/\s+/).filter(w => w.length > 0).length : 0;
}

// ─── HTTP / API ───────────────────────────────────────────────────────────────

function shopifyReq(method, p, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: SHOP, path: '/admin/api/2024-01/' + p, method,
      headers: {
        'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function retryOnRateLimit(fn, retries = 4) {
  for (let i = 0; i < retries; i++) {
    const r = await fn();
    if (r && r.status === 429) { console.log('  [rate limit] waiting 10s...'); await sleep(10000); continue; }
    return r;
  }
  return null;
}

// ─── GOOGLE INDEXING API ─────────────────────────────────────────────────────

let _gToken = null, _gTokenExp = 0;

async function getGoogleToken() {
  if (_gToken && Date.now() < _gTokenExp) return _gToken;
  try {
    const creds = JSON.parse(fs.readFileSync(INDEXING_CREDS_FILE, 'utf8'));
    const body = new URLSearchParams({ client_id: creds.client_id, client_secret: creds.client_secret, refresh_token: creds.refresh_token, grant_type: 'refresh_token' }).toString();
    const opts = { hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } };
    const resp = await new Promise((resolve, reject) => {
      const req = https.request(opts, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d))); });
      req.on('error', reject); req.write(body); req.end();
    });
    if (resp.access_token) { _gToken = resp.access_token; _gTokenExp = Date.now() + 55 * 60 * 1000; return _gToken; }
  } catch (e) { console.log('  [Google token error]:', e.message); }
  return null;
}

async function submitGoogle(url, state) {
  if (state.dailyCount >= INDEXING_DAILY_LIMIT) return false;
  const token = await getGoogleToken();
  if (!token) return false;
  try {
    const body = JSON.stringify({ url, type: 'URL_UPDATED' });
    const opts = { hostname: 'indexing.googleapis.com', path: '/v3/urlNotifications:publish', method: 'POST', headers: { 'Authorization': '***' + token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } };
    const r = await new Promise((resolve, reject) => {
      const req = https.request(opts, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
      req.on('error', reject); req.write(body); req.end();
    });
    if (r.status === 200) { state.dailyCount++; return true; }
    if (r.status === 429) { console.log('  [Google] quota hit'); return false; }
    console.log('  [Google] status', r.status);
    return false;
  } catch (e) { return false; }
}

async function submitIndexNow(urls) {
  if (!urls.length) return;
  const body = JSON.stringify({ host: 'bullstrap.com', key: INDEXNOW_KEY, urlList: urls });
  for (const host of ['api.indexnow.org', 'yandex.com']) {
    try {
      const path = '/indexnow';
      const opts = { hostname: host, path, method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) } };
      const status = await new Promise((resolve) => {
        const req = https.request(opts, res => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
        req.on('error', () => resolve(0)); req.write(body); req.end();
      });
      console.log(`  [IndexNow] ${host}: ${status} (${urls.length} URLs)`);
    } catch (e) { /* non-fatal */ }
  }
}

// ─── STATE / LOCK ─────────────────────────────────────────────────────────────

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch (e) { return { sinceId: 0, smartSinceId: 0, doneSmarts: false, totalPushed: 0, totalVerifiedAboveTarget: 0, totalVerifiedAboveFloor: 0, totalFailed: 0, dailyCount: 0, dailyDate: '', lastRun: null }; }
}
function saveState(s) { fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); }
function lockExists() { return fs.existsSync(LOCK_FILE); }
function acquireLock() { fs.writeFileSync(LOCK_FILE, Date.now().toString()); }
function releaseLock() { try { fs.unlinkSync(LOCK_FILE); } catch (e) {} }

// ─── PAGINATE ALL COLLECTIONS ─────────────────────────────────────────────────

async function fetchCollectionBatch(type, sinceId) {
  const r = await retryOnRateLimit(() =>
    shopifyReq('GET', `${type}_collections.json?limit=50&since_id=${sinceId}&fields=id,handle,title,body_html,published_at`));
  if (!r || r.status !== 200) return [];
  try { return JSON.parse(r.body)[`${type}_collections`] || []; }
  catch (e) { return []; }
}

async function updateCollection(type, id, body_html) {
  const key = type === 'custom' ? 'custom_collection' : 'smart_collection';
  const r = await retryOnRateLimit(() =>
    shopifyReq('PUT', `${type}_collections/${id}.json`, { [key]: { id, body_html } }));
  if (!r) return null;
  try {
    const parsed = JSON.parse(r.body);
    return parsed[key] || null;
  } catch (e) { return null; }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!TOKEN) { console.error('SHOPIFY_TOKEN_BULLSTRAP not set'); process.exit(1); }

  if (lockExists()) {
    const age = Date.now() - parseInt(fs.readFileSync(LOCK_FILE, 'utf8') || '0');
    if (age < 20 * 60 * 1000) { console.log('Locked. Exiting.'); process.exit(0); }
    releaseLock();
  }
  acquireLock();

  const state = loadState();
  const today = new Date().toISOString().slice(0, 10);
  if (state.dailyDate !== today) { state.dailyCount = 0; state.dailyDate = today; }
  state.lastRun = new Date().toISOString();
  saveState(state);

  let batchPushed = 0, batchVerifiedTarget = 0, batchVerifiedFloor = 0, batchFailed = 0;
  const indexNowBatch = [];

  try {
    // Process custom collections first, then smart
    const types = state.doneSmarts ? [] : ['custom', 'smart'];
    
    outer: for (const type of ['custom', 'smart']) {
      if (type === 'smart' && !state.doneSmarts && state.sinceId === 0 && batchPushed >= BATCH_SIZE) break;
      
      const sinceKey = type === 'custom' ? 'sinceId' : 'smartSinceId';
      
      while (batchPushed < BATCH_SIZE) {
        const batch = await fetchCollectionBatch(type, state[sinceKey]);
        if (!batch.length) {
          if (type === 'custom') { console.log('[custom] complete'); }
          if (type === 'smart') { state.doneSmarts = true; console.log('[smart] complete'); }
          saveState(state);
          break;
        }

        for (const col of batch) {
          if (batchPushed >= BATCH_SIZE) break outer;

          // Skip if already above target
          const currentWc = wordCount(col.body_html);
          if (currentWc >= WORD_COUNT_TARGET) {
            console.log(`  SKIP (already ${currentWc}w): ${col.handle}`);
            state[sinceKey] = col.id;
            continue;
          }

          // Generate content
          const content = getTemplate(col.handle, col.title);
          const rawWc = wordCount(content);

          await sleep(DELAY_MS);

          // Push to Shopify
          const updated = await updateCollection(type, col.id, content);
          if (!updated) {
            console.log(`  ✗ PUSH FAILED: ${col.handle}`);
            batchFailed++;
            state[sinceKey] = col.id;
            state.totalFailed++;
            saveState(state);
            continue;
          }

          // Verify from API response (mandatory per SEO_PLAYBOOK Step 4)
          const verifiedWc = wordCount(updated.body_html);
          const url = `https://bullstrap.com/collections/${col.handle}`;

          if (verifiedWc >= WORD_COUNT_TARGET) {
            batchVerifiedTarget++;
            state.totalVerifiedAboveTarget++;
            console.log(`  ✓ TARGET ${verifiedWc}w (raw ${rawWc}w): ${col.handle}`);
          } else if (verifiedWc >= WORD_COUNT_FLOOR) {
            batchVerifiedFloor++;
            state.totalVerifiedAboveFloor++;
            console.log(`  ⚠ FLOOR ${verifiedWc}w (raw ${rawWc}w — below target, needs expansion): ${col.handle}`);
          } else {
            batchFailed++;
            state.totalFailed++;
            console.log(`  ✗ BELOW FLOOR ${verifiedWc}w (raw ${rawWc}w — FAILED): ${col.handle}`);
          }

          batchPushed++;
          state.totalPushed++;

          // Submit to Google Indexing API
          const googleOk = await submitGoogle(url, state);
          if (!googleOk && state.dailyCount >= INDEXING_DAILY_LIMIT) {
            console.log('  [Google] daily quota hit — continuing without Google submission');
          }

          // Batch for IndexNow
          indexNowBatch.push(url);

          state[sinceKey] = col.id;
          saveState(state);
          await sleep(DELAY_MS);
        }

        if (batch.length < 50) {
          if (type === 'custom') { console.log('[custom] all pages fetched'); }
          if (type === 'smart') { state.doneSmarts = true; }
          saveState(state);
          break;
        }
      }
    }

    // Submit IndexNow batch (Bing + Yandex)
    if (indexNowBatch.length > 0) {
      await submitIndexNow(indexNowBatch);
    }

    saveState(state);

    console.log(`\n=== BATCH COMPLETE ===`);
    console.log(`This run: pushed=${batchPushed} ≥1500w=${batchVerifiedTarget} ≥700w=${batchVerifiedFloor} failed=${batchFailed}`);
    console.log(`All-time: pushed=${state.totalPushed} ≥1500w=${state.totalVerifiedAboveTarget} ≥700w=${state.totalVerifiedAboveFloor} failed=${state.totalFailed}`);
    console.log(`Google quota used today: ${state.dailyCount}/${INDEXING_DAILY_LIMIT}`);
    console.log(`IndexNow batch: ${indexNowBatch.length} URLs submitted`);
    console.log(`Custom cursor: ${state.sinceId} | Smart cursor: ${state.smartSinceId} | SmartsDone: ${state.doneSmarts}`);

  } catch (e) {
    console.error('Fatal error:', e.message);
    saveState(state);
  }

  releaseLock();
}

main().catch(e => { console.error('Fatal:', e.message); releaseLock(); process.exit(1); });
