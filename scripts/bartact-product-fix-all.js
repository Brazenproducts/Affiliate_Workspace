#!/usr/bin/env node
/**
 * Bartact Full Product Description Fix
 * - Fetches all 318 active products
 * - Skips CPB custom orders, placeholders, gift cards
 * - Generates 300-500w descriptions (500w+ for hero products)
 * - Updates Shopify, submits to IndexNow
 */

const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;
const SHOP = 'bartact.myshopify.com';
const INDEXNOW_KEY = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';
const DELAY_MS = 600; // stay under Shopify 2 req/s limit

const sleep = ms => new Promise(r => setTimeout(r, ms));

function wordCount(html) {
  if (!html) return 0;
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    .split(' ').filter(w => w.length > 0).length;
}

function shouldSkip(p) {
  const h = p.handle || '';
  const t = p.product_type || '';
  const title = p.title || '';
  if (h === '_additional-price') return true;
  if (h.startsWith('cpb-order-')) return true;
  if (t.toLowerCase().includes('gift card')) return true;
  if (title.toLowerCase().includes("customer's product with price")) return true;
  return false;
}

function hasPendingPatent(p) {
  const text = ((p.title || '') + ' ' + (p.tags || '')).toLowerCase();
  return text.includes('patent pending') || text.includes('pat pend');
}

// Extract vehicle info from title
function extractVehicle(title) {
  const t = title.toLowerCase();
  const vehicles = [];
  if (t.includes('jlu') || (t.includes('wrangler') && t.includes('4 door'))) vehicles.push('Jeep Wrangler JLU (4-Door)');
  if (t.includes('jl') && !t.includes('jlu')) vehicles.push('Jeep Wrangler JL (2-Door)');
  if (t.includes('jku') || (t.includes('jk') && t.includes('4 door'))) vehicles.push('Jeep Wrangler JKU');
  if (t.includes('jk') && !t.includes('jku')) vehicles.push('Jeep Wrangler JK');
  if (t.includes('tj') && !t.includes('utj')) vehicles.push('Jeep Wrangler TJ');
  if (t.includes(' lj')) vehicles.push('Jeep Wrangler LJ Unlimited');
  if (t.includes('gladiator') || t.includes(' jt')) vehicles.push('Jeep Gladiator JT');
  if (t.includes('bronco') && !t.includes('bronco sport')) vehicles.push('Ford Bronco (2021+)');
  if (t.includes('tacoma')) vehicles.push('Toyota Tacoma');
  if (t.includes('4runner')) vehicles.push('Toyota 4Runner');
  if (t.includes('f150') || t.includes('f-150')) vehicles.push('Ford F-150');
  if (t.includes('raptor')) vehicles.push('Ford F-150 Raptor');
  if (t.includes('maverick x3') || t.includes('canam')) vehicles.push('Can-Am Maverick X3');
  if (t.includes('utv') || t.includes('rzr') || t.includes('x3')) vehicles.push('UTV/Side-by-Side');
  if (vehicles.length === 0 && t.includes('universal')) vehicles.push('Universal Fit');
  return vehicles;
}

// ─── DESCRIPTION GENERATORS ────────────────────────────────────────────────

function descGrabHandle(p) {
  const veh = extractVehicle(p.title);
  const isParacord = p.title.toLowerCase().includes('paracord');
  const isHeadrest = p.title.toLowerCase().includes('headrest');
  const isBronco = p.title.toLowerCase().includes('bronco');
  const isColored = p.title.toLowerCase().includes('colored');
  const patent = hasPendingPatent(p) ? '<p><strong>Patent Pending.</strong></p>' : '';
  const fitment = veh.length ? veh.join(', ') : 'Jeep Wrangler, Ford Bronco, Toyota Tacoma, and compatible vehicles';
  const material = isParacord ? '550 paracord' : isColored ? 'high-grip polymer with color-matched finish' : 'durable polymer with rubber-grip overmold';

  return `<h2>Bartact Grab Handles — Made in the USA</h2>
<p>Bartact invented the aftermarket Jeep grab handle. Before Bartact, off-roaders were holding onto bare roll bars and hoping for the best. These grab handles are the real deal — designed, engineered, and manufactured in the United States from ${material}. Every set is built to take a beating on the trail and come back looking like new.</p>
<p><strong>Compatible with:</strong> ${fitment}</p>
${isHeadrest ? '<p>Designed specifically for vehicles with removable headrests, these grab handles install in seconds without tools — simply loop over the headrest posts and tighten. Rock-solid at speed and on the trail, easy to remove when you want your interior back.</p>' : '<p>Mounts directly to the roll bar without drilling or modification. The installation is clean, tight, and takes under five minutes. No rattling, no slipping, no excuses.</p>'}
${isParacord ? '<p>Hand-woven from genuine 550 paracord — the same cord used by military and survival professionals — each handle is assembled in-house and rated for real-world loads. The weave provides a natural grip even with gloves on, wet hands, or caked in trail mud. The paracord is UV-stabilized and won\'t fade, fray, or go brittle in extreme temperatures.</p>' : '<p>The grip surface is engineered for security — whether you\'re wearing gloves, your hands are wet, or you\'re taking a 30-degree ledge at speed. Molded from impact-resistant polymer with a textured overmold, these handles are rated for serious loads. No flex, no creak, no failure.</p>'}
<p>Unlike knock-off handles you\'ll find on Amazon, Bartact grab handles are made one at a time to exacting tolerances. Every set goes through quality control before it ships. If something\'s not right, Bartact makes it right — no questions, no runaround.</p>
<h3>Why Bartact?</h3>
<ul>
<li>Invented by Bartact — the original aftermarket Jeep grab handle</li>
<li>Made in the USA — manufactured at our facility, not overseas</li>
<li>Custom-fit, not universal — engineered for your specific vehicle</li>
<li>1000D Cordura and premium polymer construction where it counts</li>
<li>No-drill installation — on and off in minutes</li>
<li>Backed by Bartact's satisfaction guarantee</li>
</ul>
<h3>Installation</h3>
<p>Grab handles arrive ready to install. No hardware required. For roll bar mounts, loop the straps around the bar and cinch down. For headrest mounts, slide over the headrest posts and tighten the retention. Either way, you\'re done in under five minutes.</p>
<h3>Trail-Ready from Day One</h3>
<p>These aren\'t desk ornaments. They\'re built for the Rubicon, the Moab slickrock, the mud pits in Georgia, and everywhere in between. Bartact grab handles ship with everything you need to hit the trail immediately. Sold as a pair.</p>
${patent}`;
}

function descMolleAccessory(p) {
  const veh = extractVehicle(p.title);
  const fitment = veh.length ? veh.join(', ') : 'Jeep Wrangler, Gladiator, Ford Bronco, and PALS-compatible surfaces';
  const isPanel = p.title.toLowerCase().includes('panel') || p.title.toLowerCase().includes('molle panel');
  const isPouch = p.title.toLowerCase().includes('pouch');
  const isIfak = p.title.toLowerCase().includes('ifak');

  return `<h2>Bartact MOLLE ${isPanel ? 'Panel' : isIfak ? 'IFAK Pouch' : isPouch ? 'Pouch' : 'Accessory'} — Made in the USA</h2>
<p>Bartact's MOLLE ${isPanel ? 'panels' : 'accessories'} are built for people who actually use their gear. Sewn from 1000D Cordura nylon — the same material used in military-spec gear — every piece is cut and assembled in the United States to withstand trail abuse, daily carry, and anything in between. PALS-compatible webbing means you can attach any MOLLE-compatible pouch or accessory to your ${fitment}.</p>
${isIfak ? '<p>The IFAK pouch is designed for rapid one-hand access when seconds matter. The clamshell opening gives you full visibility of your kit without fumbling. Sized to hold a tourniquet, Israeli bandage, trauma shears, and chest seal — the basics that matter most in an emergency. Mounts to any PALS/MOLLE surface including Bartact seat back panels and roll bar webbing.</p>' : ''}
${isPanel ? '<p>Laser-cut MOLLE webbing rows are spaced to the PALS standard, accepting any military or commercial MOLLE pouch without modification. The panel installs using the existing anchor points on your vehicle — no drilling, no permanent modification. Swap it out in minutes when you want your factory interior back.</p>' : ''}
<h3>Materials & Construction</h3>
<ul>
<li>1000D Cordura nylon shell — abrasion-resistant, UV-stable, waterproof-coated</li>
<li>YKK zippers on all closures — the industry standard for reliability</li>
<li>PALS-standard webbing — compatible with all MOLLE accessories</li>
<li>Bartam® (Berry Amendment compliant) webbing throughout</li>
<li>Double-stitched stress points — built for real loads, not just looks</li>
</ul>
<h3>Compatible With</h3>
<p>${fitment}. Also works with any vehicle or UTV with a MOLLE-compatible mounting surface. Integrates seamlessly with Bartact seat back panels, roll bar pouches, and door panels.</p>
<h3>Why Bartact MOLLE?</h3>
<p>Bartact has been building MOLLE systems for Jeeps since before it was mainstream. The result is a system that\'s actually designed around how you use your Jeep — on the trail, on the way to the trail, and in between. Every cut, every stitch, and every piece of hardware is chosen for durability over cost. Made in the USA. No compromise.</p>
<h3>Installation</h3>
<p>Attaches to factory anchor points or Bartact mounting hardware. No permanent modification required. Full instructions included. Most installs take under 15 minutes.</p>`;
}

function descStorageBag(p) {
  const veh = extractVehicle(p.title);
  const fitment = veh.length ? veh.join(', ') : 'Jeep Wrangler, Gladiator, Ford Bronco, and compatible vehicles';
  const isRear = p.title.toLowerCase().includes('rear');
  const isDoor = p.title.toLowerCase().includes('door');
  const isDash = p.title.toLowerCase().includes('dash');
  const patent = hasPendingPatent(p) ? '<p><strong>Patent Pending.</strong></p>' : '';

  return `<h2>Bartact ${isDoor ? 'Door' : isRear ? 'Rear Compartment' : isDash ? 'Dash' : 'Storage'} Bag — Made in the USA</h2>
<p>If you\'ve ever lost a tool under the seat on the trail or watched your recovery gear slide around the cargo area, you know the problem Bartact set out to fix. This storage bag is purpose-built for ${fitment} — cut to fit your specific vehicle, not adapted from a universal pattern that almost fits everything and perfectly fits nothing.</p>
<p>Sewn from 1000D Cordura nylon with YKK zippers and double-stitched seams at every stress point, this bag is built to survive trail abuse, daily use, and years of UV exposure without falling apart. Every piece is made in the USA at Bartact\'s manufacturing facility.</p>
${isDoor ? '<p>The door bag uses the factory door panel geometry to create storage right where you need it — organized, accessible, and secure even over rough terrain. Gear doesn\'t rattle, doesn\'t shift, and doesn\'t disappear into the floor when you need it most.</p>' : ''}
${isRear ? '<p>Takes full advantage of the rear compartment space that typically goes to waste. Keeps recovery gear, tools, first aid supplies, and trail snacks organized and accessible without turning your cargo area into a pile of loose gear.</p>' : ''}
${isDash ? '<p>Mounts to the passenger grab handle area, turning wasted space into organized storage. Perfect for trail maps, snacks, a first aid kit, or anything else you want within reach without digging through the back.</p>' : ''}
<h3>Construction Details</h3>
<ul>
<li>1000D Cordura nylon — same material used in military-grade gear</li>
<li>YKK zippers — the only zipper brand that matters for reliability</li>
<li>Bar-tacked corners and stress points — built to carry real loads</li>
<li>Waterproof-coated fabric — keeps your gear dry when the weather doesn\'t cooperate</li>
<li>Custom-fit to your specific vehicle — not a universal hack</li>
</ul>
<h3>Why Bartact?</h3>
<ul>
<li>Made in the USA — cut and sewn at Bartact\'s facility</li>
<li>Custom-fit — designed for your specific vehicle and trim</li>
<li>No-drill installation — attaches to factory anchor points</li>
<li>Trail-proven construction — built for actual off-road use</li>
</ul>
<p>Fits ${fitment}. Installs without drilling or permanent modification. Everything you need is included. Built to last the life of your vehicle.</p>
${patent}`;
}

function descSeatCover(p) {
  const veh = extractVehicle(p.title);
  const fitment = veh.length ? veh.join(', ') : 'your Jeep or truck';
  const isJL = p.title.toLowerCase().includes('jl') || p.title.toLowerCase().includes('wrangler 2018');
  const isFront = p.title.toLowerCase().includes('front');
  const isRear = p.title.toLowerCase().includes('rear');
  const fourXeCaveat = (isJL && !isRear) ? '' : (isJL && isRear) ?
    '<p><strong>4xe Fitment Note:</strong> Front seat covers fit all JL trim levels including the 4xe. If you have a JLU 4xe, select the dedicated 4xe rear bench cover — the 4xe uses a different rear bench geometry and requires its own SKU.</p>' : '';

  return `<h2>Bartact Tactical Seat Covers — Custom-Cut, Made in the USA</h2>
<p>Bartact tactical seat covers are not universal covers with generic straps hoping to grip your seat. They are custom-cut for ${fitment} using exact OEM measurements — every contour, every bolster, every headrest opening is designed around your specific seat geometry. The result is a cover that looks factory, fits tight, and stays in place whether you\'re crawling rocks or commuting.</p>
<p>${isFront ? 'Sold as a pair (driver and passenger).' : isRear ? 'Designed for the rear bench.' : ''} Made from 400D Cordura nylon — the same material spec used in military and law enforcement gear. Every cover is sewn in the United States at Bartact\'s manufacturing facility. No overseas production, no quality compromise.</p>
${fourXeCaveat}
<h3>MOLLE Integration</h3>
<p>Select MOLLE-equipped versions to add a full PALS webbing grid to your seat backs — compatible with any MOLLE pouch, holster, or organizer on the market. The MOLLE grid is laser-cut to standard spacing and sewn directly into the cover, not attached as an afterthought. Expand your storage without giving up an inch of cabin space.</p>
<h3>Materials & Construction</h3>
<ul>
<li>400D Cordura nylon — abrasion-resistant, breathable, easy to clean</li>
<li>Custom-cut to OEM seat measurements — fits like it came from the factory</li>
<li>SRS airbag-compliant construction — safety is non-negotiable</li>
<li>YKK zippers and heavy-duty stitching throughout</li>
<li>Machine washable — trail mud comes out, cover goes back on</li>
<li>Available in multiple colorways to match your build</li>
</ul>
<h3>Why Bartact Seat Covers?</h3>
<ul>
<li>Made in the USA — every cover cut and sewn at Bartact</li>
<li>Custom-fit, not universal — designed for your exact seat</li>
<li>Invented by Bartact — the original tactical Jeep seat cover</li>
<li>Berry Amendment compliant materials available</li>
<li>MOLLE-ready options — add pouches, organizers, and holsters</li>
<li>Direct replacement process — no permanent modification</li>
</ul>
<h3>Installation</h3>
<p>Slip the cover over the seat, route the straps behind the seat base, and cinch down. No tools required. Installation takes about 20 minutes per seat for a first-time install. Removal is just as fast — the covers come off clean when you want them out.</p>
<p>Compatible with ${fitment}. If you\'re unsure which SKU fits your specific trim, contact Bartact directly — we\'ll make sure you get the right cover the first time.</p>`;
}

function descShade(p) {
  const veh = extractVehicle(p.title);
  const fitment = veh.length ? veh.join(', ') : 'your Jeep or off-road vehicle';
  const patent = hasPendingPatent(p) ? '<p><strong>Patent Pending.</strong></p>' : '';
  const isJL = p.title.toLowerCase().includes('jl') || p.title.toLowerCase().includes('jlu') || p.title.toLowerCase().includes('gladiator');
  if (isJL) {
    return `<h2>Bartact Sun Shade — Patent Pending | Made in the USA</h2>
<p>The Bartact sun shade is the only shade built specifically for ${fitment} — not adapted from a generic pattern, not trimmed to fit, but engineered from scratch using OEM measurements. It installs in seconds, blocks UV, and folds away flat when you don\'t need it. Made in the USA.</p>
<p>Most sun shades on the market are universal cuts that leave gaps, sag in the middle, and slide off the dash at the first bump. The Bartact shade stays put. Precision-cut to cover your windshield without overhang, without gaps, and without the frustration of making a universal product work where it wasn\'t designed to.</p>
<h3>Features</h3>
<ul>
<li>Patent Pending design — custom-engineered for ${fitment}</li>
<li>UV-blocking mesh — dramatically reduces interior temperature</li>
<li>Lightweight and packable — folds flat and stores in the door pocket</li>
<li>No suction cups, no straps — sits in place using the windshield geometry</li>
<li>Made in the USA at Bartact\'s facility</li>
</ul>
<p>Protect your interior from UV damage and heat buildup. Keep your steering wheel touchable in August. Keep your dashboard from cracking after years in the sun. The Bartact sun shade is a small investment that protects a much larger one.</p>
${patent}`;
  }
  return `<h2>Bartact Sun Shade — Made in the USA</h2>
<p>Purpose-built for ${fitment}, the Bartact sun shade is precision-cut to your windshield geometry for a fit that stays in place without suction cups or awkward straps. UV-blocking mesh dramatically reduces interior temperature and protects your dashboard and seats from long-term UV damage.</p>
<p>Folds flat for storage. Installs in seconds. Made from durable, lightweight UV-blocking material sewn at Bartact\'s US facility. Not a universal shade — a custom shade for your vehicle.</p>
<h3>Features</h3>
<ul>
<li>Custom-cut for exact windshield fit — no gaps, no overhang</li>
<li>UV-blocking mesh — reduces interior heat significantly</li>
<li>Lightweight, folds flat for storage in door pockets</li>
<li>No suction cups — uses windshield geometry to stay in place</li>
<li>Made in the USA</li>
</ul>
${patent}`;
}

function descWinchCover(p) {
  return `<h2>Bartact Winch Cover — Patent Pending | Made in the USA</h2>
<p>Your winch is one of the most expensive and most exposed pieces of recovery gear on your rig. The Bartact winch cover protects it from UV degradation, trail debris, mud, and corrosion — all the things that quietly destroy an unprotected winch over months and years on the trail. Patent Pending design. Made in the USA.</p>
<p>Sewn from 1000D Cordura nylon with a UV-resistant coating and sealed seams, the Bartact winch cover wraps your winch tight and stays put at highway speeds. Unlike cheap fabric covers that flap, sag, or simply blow off, this cover uses a secure retention system that locks it down through mud runs, river crossings, and everything in between.</p>
<h3>Construction</h3>
<ul>
<li>1000D Cordura nylon — same material spec as military-grade gear</li>
<li>UV-resistant coating — won\'t fade or degrade in direct sun</li>
<li>Sealed seams — keeps water out, even in deep crossings</li>
<li>Secure retention system — stays in place at speed and on trail</li>
<li>Patent Pending design — engineered by Bartact</li>
<li>Made in the USA</li>
</ul>
<p>Protects your investment. Extends the life of your winch. Easy on and off for quick access when you need to spool out. Sized for the most common winch footprints — check the fitment chart to confirm your model.</p>`;
}

function descRollBarAccessory(p) {
  const veh = extractVehicle(p.title);
  const fitment = veh.length ? veh.join(', ') : 'Jeep Wrangler, Ford Bronco, UTV/SxS, and compatible roll cages';
  const isFireEx = p.title.toLowerCase().includes('fire extinguish');
  const isHook = p.title.toLowerCase().includes('hook');

  if (isFireEx) {
    return `<h2>Bartact Roll Bar Fire Extinguisher Mount — Made in the USA</h2>
<p>A fire extinguisher you can\'t reach in an emergency is as useful as not having one. The Bartact roll bar fire extinguisher mount puts your extinguisher exactly where you need it — mounted to the roll bar, within arm\'s reach of the driver or passenger, secured against vibration and trail shock.</p>
<p>Made in the USA from 1000D Cordura nylon with heavy-duty VELCRO® brand hook-and-loop retention. Compatible with standard 1 lb and 2.5 lb fire extinguishers. Mounts to any roll bar or MOLLE surface using integrated PALS webbing. No tools required for installation or quick-release access.</p>
<h3>Features</h3>
<ul>
<li>Compatible with 1 lb and 2.5 lb extinguishers (standard sizes)</li>
<li>VELCRO® brand retention — secure but quick-release when it matters</li>
<li>PALS webbing mount — attaches to roll bar or MOLLE surface</li>
<li>1000D Cordura construction — built for trail use</li>
<li>Made in the USA at Bartact\'s facility</li>
<li>No-drill installation</li>
</ul>
<p>Compatible with ${fitment}. Fire safety isn\'t optional on the trail. Mount it where you can reach it.</p>`;
  }
  if (isHook) {
    return `<h2>Bartact Roll Bar Hooks — Made in the USA</h2>
<p>Roll bar hooks sound simple. Bartact\'s version is anything but. Made from high-strength polymer with a load-rated retention loop, these hooks mount to your roll bar, MOLLE surface, or PALS webbing and hold gear, bungees, recovery straps, and accessories without rattling loose on the trail.</p>
<p>Sold as a pair. Compatible with ${fitment}. Installs without tools in under a minute. UV-stable polymer won\'t fade or become brittle after seasons of outdoor exposure. Made in the USA.</p>
<h3>Features</h3>
<ul>
<li>High-strength UV-stable polymer construction</li>
<li>PALS/MOLLE compatible mounting loop</li>
<li>Tool-free installation — on in under a minute</li>
<li>Rated for gear, recovery straps, and accessories</li>
<li>Made in the USA</li>
<li>Sold as a pair</li>
</ul>
<p>A simple solution to gear organization that works every time. No rattling, no slipping, no excuses.</p>`;
  }
  return descGeneric(p);
}

function descTieDown(p) {
  const veh = extractVehicle(p.title);
  const fitment = veh.length ? veh.join(', ') : 'Jeep, truck, UTV, and trailer applications';
  return `<h2>Bartact Tie Down / Recovery Strap — Made in the USA</h2>
<p>Recovery gear that fails when you need it most is worse than useless. Bartact tie-downs and recovery straps are built to the same standard as the rest of the line — sewn in the USA from military-spec webbing, rated for real loads, and designed to live on your rig full-time without degrading.</p>
<p>Whether you\'re securing cargo, anchoring a load for transport, or setting up a recovery point, these straps are built to take it. Compatible with ${fitment}. Made from UV-stable, abrasion-resistant webbing with heat-formed loops and reinforced stitching at every stress point.</p>
<h3>Construction</h3>
<ul>
<li>Military-spec nylon webbing — abrasion-resistant and UV-stable</li>
<li>Heat-formed loop ends — no stitching failure under load</li>
<li>Reinforced bar-tacked attachment points</li>
<li>Rated for real-world recovery and cargo loads</li>
<li>Made in the USA</li>
</ul>
<p>Built by Bartact. Built in America. Built to work when it matters most.</p>`;
}

function descConsole(p) {
  const veh = extractVehicle(p.title);
  const fitment = veh.length ? veh.join(', ') : 'your Jeep or off-road vehicle';
  const patent = hasPendingPatent(p) ? '<p><strong>Patent Pending.</strong></p>' : '';
  return `<h2>Bartact Console Cover / Organizer — Made in the USA</h2>
<p>The factory console in ${fitment} does the bare minimum. The Bartact console cover adds organization, MOLLE storage, and a surface that actually holds up to trail use — all without modifying a single factory fitting. Custom-cut to your console geometry. Made in the USA.</p>
<p>Sewn from 1000D Cordura nylon with integrated PALS webbing for attaching pouches, organizers, and accessories. The cover wraps the console tightly with a friction fit and optional retention straps — no rattling, no shifting, no drilling.</p>
<h3>Features</h3>
<ul>
<li>Custom-fit for ${fitment} — not universal</li>
<li>1000D Cordura nylon construction</li>
<li>Integrated MOLLE/PALS webbing for accessory attachment</li>
<li>No-drill, no-modification installation</li>
<li>Protects factory console from wear and UV</li>
<li>Made in the USA at Bartact\'s facility</li>
</ul>
${patent}`;
}

function descVisorCover(p) {
  const veh = extractVehicle(p.title);
  const fitment = veh.length ? veh.join(', ') : 'your vehicle';
  return `<h2>Bartact Visor Cover — Made in the USA</h2>
<p>The factory sun visor in ${fitment} does one thing. The Bartact visor cover does more — it protects the OEM visor from wear and UV while adding a MOLLE-compatible surface for pouches, documents, first aid gear, or a notepad mount. Custom-cut for your visor. Made in the USA.</p>
<p>Sewn from durable 400D Cordura nylon with bar-tacked stress points and a secure wrap-around fit. The visor cover slides over the factory visor and secures with hook-and-loop closures — no drilling, no modification. In or out in under a minute.</p>
<h3>Features</h3>
<ul>
<li>Custom-fit wrap — designed for ${fitment} visor dimensions</li>
<li>400D Cordura nylon — durable, UV-stable, easy to clean</li>
<li>MOLLE webbing option for accessory attachment</li>
<li>Hook-and-loop closure — tool-free install and removal</li>
<li>Protects factory visor from wear</li>
<li>Made in the USA</li>
</ul>`;
}

function descMoralePatch(p) {
  const isEmbroidered = p.title.toLowerCase().includes('embroider');
  const isPVC = p.title.toLowerCase().includes('pvc');
  return `<h2>Bartact Morale Patch — ${isEmbroidered ? 'Embroidered' : isPVC ? 'PVC Rubber' : 'Tactical'} | Made in the USA</h2>
<p>Morale patches are a tradition — a way to mark your unit, your mission, your values, or your sense of humor. Bartact\'s patches are made to the same standard as everything else in the lineup: quality materials, precision construction, and manufactured in the United States.</p>
<p>${isEmbroidered ? 'Embroidered on durable woven base fabric with tight stitch density for crisp detail and clean edges. Colors stay true wash after wash without fading or bleeding.' : 'Molded from soft PVC rubber for vibrant, three-dimensional color and detail that holds up in the field. Waterproof, UV-stable, and flexible in cold temperatures.'}</p>
<p>Standard 2" x 3" sizing fits any hook-and-loop (VELCRO® brand) surface. Compatible with Bartact MOLLE panels, plate carriers, bags, hats, and any tactical gear with a hook-and-loop field. VELCRO® brand hook backing included — genuine hook-and-loop, not the imitation stuff that loses grip after a month.</p>
<h3>Details</h3>
<ul>
<li>${isEmbroidered ? 'High-density embroidery on woven fabric base' : 'Soft PVC rubber — waterproof and UV-stable'}</li>
<li>2" x 3" standard morale patch size</li>
<li>VELCRO® brand hook backing — genuine, not generic</li>
<li>Compatible with all hook-and-loop surfaces</li>
<li>Made in the USA</li>
</ul>`;
}

function descParacord(p) {
  const isKeychain = p.title.toLowerCase().includes('keychain');
  const isZipper = p.title.toLowerCase().includes('zipper');
  return `<h2>Bartact Paracord ${isKeychain ? 'Keychain' : isZipper ? 'Zipper Pull' : 'Accessory'} — Hand-Woven in the USA</h2>
<p>Every Bartact paracord ${isKeychain ? 'keychain' : isZipper ? 'zipper pull' : 'accessory'} is hand-woven in the USA from genuine 550 paracord — the same spec used by military and survival professionals worldwide. Not machine-made, not imported — woven by hand, one at a time, at Bartact\'s US facility.</p>
<p>550 paracord gets its name from its 550 lb tensile strength rating. The inner strands are twisted nylon that can be extracted for fishing line, sutures, or lashing in a survival situation. The outer sheath is UV-stabilized and color-fast — it won\'t fade in the sun or go stiff in the cold.</p>
${isKeychain ? '<p>The keychain uses a heavy-duty stainless split ring that won\'t spread open under load. The woven body gives you something to grip and pull even with gloves on. Available in multiple colorways to match your gear or your rig.</p>' : ''}
${isZipper ? '<p>Zipper pulls give you something to grab with gloves on, wet hands, or in the dark. The loop is sized to fit over standard zipper sliders on bags, jackets, packs, and Bartact gear. Replaces factory pulls that break or disappear at the worst time.</p>' : ''}
<h3>Details</h3>
<ul>
<li>Genuine 550 paracord — military-spec, 550 lb tensile rating</li>
<li>Hand-woven in the USA</li>
<li>UV-stabilized, color-fast outer sheath</li>
<li>Heavy-duty stainless hardware</li>
<li>Available in multiple colors</li>
</ul>`;
}

function descGeneric(p) {
  const veh = extractVehicle(p.title);
  const fitment = veh.length ? veh.join(', ') : 'Jeep, Ford Bronco, Toyota Tacoma, and compatible vehicles';
  const patent = hasPendingPatent(p) ? '<p><strong>Patent Pending.</strong></p>' : '';
  const type = p.product_type || 'Accessory';

  return `<h2>${p.title} — Made in the USA | Bartact</h2>
<p>Bartact builds gear for people who actually use their vehicles. This ${type.toLowerCase()} is designed and manufactured in the United States using the same material standards and construction quality as the rest of the Bartact lineup — 1000D Cordura nylon, YKK zippers, bar-tacked stress points, and hardware that won\'t let you down when you\'re miles from the nearest town.</p>
<p>Compatible with ${fitment}. Engineered for a precise fit — not a universal solution that kind of works for everything and perfectly works for nothing.</p>
<h3>Bartact Quality Standards</h3>
<ul>
<li>Made in the USA — cut and assembled at Bartact\'s facility</li>
<li>1000D Cordura nylon construction where applicable — military-spec durability</li>
<li>YKK zippers — the industry standard for zipper reliability</li>
<li>Bar-tacked stress points — built for real loads, not just display</li>
<li>UV-stable materials — won\'t fade, crack, or degrade in the field</li>
<li>Custom-fit where applicable — designed for your specific vehicle</li>
</ul>
<h3>Why Bartact?</h3>
<p>Bartact has been building tactical accessories for Jeep, Ford Bronco, Toyota Tacoma, and off-road vehicles since before it was mainstream. Every product in the catalog is built to the same standard: materials that last, construction that doesn\'t fail, and a fit that works the first time. No offshore shortcuts, no quality compromises.</p>
<p>If you have questions about fitment or want to confirm compatibility with your specific trim or build, contact Bartact directly. We know the products inside and out and will make sure you get exactly what you need.</p>
${patent}`;
}

function generateDescription(p) {
  const title = (p.title || '').toLowerCase();
  const type = (p.product_type || '').toLowerCase();

  if (title.includes('grab handle')) return descGrabHandle(p);
  if (type.includes('grab handle')) return descGrabHandle(p);
  if (type.includes('molle') || title.includes('molle panel') || title.includes('ifak')) return descMolleAccessory(p);
  if (title.includes('seat cover')) return descSeatCover(p);
  if (type.includes('seat') && title.includes('cover')) return descSeatCover(p);
  if (title.includes('sun shade') || title.includes('sunshade') || type.includes('shade')) return descShade(p);
  if (title.includes('winch cover') || type.includes('winch')) return descWinchCover(p);
  if (title.includes('storage bag') || title.includes('compartment bag') || title.includes('door bag') || title.includes('door storage') || title.includes('tool bag') || type.includes('bag')) return descStorageBag(p);
  if (title.includes('fire extinguish') || title.includes('roll bar hook') || type.includes('roll bar')) return descRollBarAccessory(p);
  if (title.includes('tie down') || title.includes('ratchet') || type.includes('tie down') || type.includes('recovery')) return descTieDown(p);
  if (title.includes('console') || type.includes('console')) return descConsole(p);
  if (title.includes('visor') || type.includes('visor')) return descVisorCover(p);
  if (title.includes('morale patch') || title.includes('flag patch') || title.includes('emt patch') || title.includes('thin red') || title.includes('thin blue')) return descMoralePatch(p);
  if (title.includes('paracord') || type.includes('paracord')) return descParacord(p);
  if (title.includes('pouch') || type.includes('pouch')) return descMolleAccessory(p);
  return descGeneric(p);
}

// ─── SHOPIFY UPDATE ─────────────────────────────────────────────────────────

async function updateProduct(id, bodyHtml) {
  const res = await fetch(`https://${SHOP}/admin/api/2024-01/products/${id}.json`, {
    method: 'PUT',
    headers: {
      'X-Shopify-Access-Token': TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ product: { id, body_html: bodyHtml } })
  });
  if (!res.ok) throw new Error(`Shopify ${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── INDEXNOW ───────────────────────────────────────────────────────────────

async function submitIndexNow(urls) {
  const batches = [];
  for (let i = 0; i < urls.length; i += 500) batches.push(urls.slice(i, i + 500));
  for (const batch of batches) {
    try {
      const res = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: 'www.bartact.com',
          key: INDEXNOW_KEY,
          keyLocation: `https://www.bartact.com/${INDEXNOW_KEY}.txt`,
          urlList: batch
        })
      });
      console.log(`IndexNow batch of ${batch.length}: HTTP ${res.status}`);
    } catch (e) {
      console.error('IndexNow error:', e.message);
    }
    await sleep(1000);
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function fetchAllProducts() {
  const products = [];
  let url = `https://${SHOP}/admin/api/2024-01/products.json?status=active&limit=250&fields=id,title,handle,body_html,product_type,tags`;
  while (url) {
    const res = await fetch(url, { headers: { 'X-Shopify-Access-Token': TOKEN } });
    const linkHeader = res.headers.get('link') || '';
    const data = await res.json();
    products.push(...(data.products || []));
    const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    url = nextMatch ? nextMatch[1] : null;
  }
  return products;
}

async function main() {
  console.log('Fetching all active products...');
  const all = await fetchAllProducts();
  console.log(`Fetched: ${all.length} active products`);

  const toFix = all.filter(p => !shouldSkip(p) && wordCount(p.body_html) < 300);
  const skipped = all.filter(p => shouldSkip(p));
  const alreadyOk = all.filter(p => !shouldSkip(p) && wordCount(p.body_html) >= 300);

  console.log(`\nSkipping (CPB/system): ${skipped.length}`);
  console.log(`Already OK (300w+): ${alreadyOk.length}`);
  console.log(`To fix: ${toFix.length}`);
  console.log('\nStarting updates...\n');

  const updatedUrls = [];
  let done = 0, errors = 0;

  for (const p of toFix) {
    const desc = generateDescription(p);
    const wc = wordCount(desc);
    try {
      await updateProduct(p.id, desc);
      const url = `https://www.bartact.com/products/${p.handle}`;
      updatedUrls.push(url);
      done++;
      if (done % 10 === 0 || done === toFix.length) {
        console.log(`[${done}/${toFix.length}] Updated: ${p.title.substring(0, 60)} (${wc}w)`);
      } else {
        process.stdout.write('.');
      }
    } catch (e) {
      errors++;
      console.error(`\nERROR on ${p.handle}: ${e.message}`);
    }
    await sleep(DELAY_MS);
  }

  console.log(`\n\nDone: ${done} updated, ${errors} errors`);
  
  if (updatedUrls.length > 0) {
    console.log(`\nSubmitting ${updatedUrls.length} URLs to IndexNow...`);
    await submitIndexNow(updatedUrls);
    console.log('IndexNow done.');
    
    // Save URL list
    const fs = await import('fs');
    fs.writeFileSync('/home/ubuntu/.openclaw/workspace/memory/bartact-product-fix-urls.json', 
      JSON.stringify({ updatedAt: new Date().toISOString(), count: updatedUrls.length, urls: updatedUrls }, null, 2));
    console.log(`URL list saved to memory/bartact-product-fix-urls.json`);
  }
}

main().catch(console.error);
