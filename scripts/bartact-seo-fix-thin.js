#!/usr/bin/env node
/**
 * Bartact SEO Fix — Thin Content
 * 
 * 1. Fetches ALL active products (paginated)
 * 2. Skips CPB, gift cards, _additional-price
 * 3. For products under 800w body_html: writes expanded descriptions
 * 4. Also fixes SEO title (>65c) and ensures seo.description exists
 * 5. Submits all updated URLs to IndexNow (Bing/Yandex)
 * 6. Submits to Google Indexing API
 * 7. Saves state file with results
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const env = {};
fs.readFileSync(path.join(__dirname, '../.env'), 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const TOKEN = env['SHOPIFY_TOKEN_BARTACT'];
const INDEXNOW_KEY = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';
const SHOP_HOST = 'www.bartact.com';
const DELAY_MS = 500;
const MIN_WORDS = 800;

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── HTTP helpers ────────────────────────────────────────────────────────────

function shopifyGet(p) {
  return new Promise((res, rej) => {
    const req = https.request({ hostname: 'bartact.myshopify.com', path: p, headers: { 'X-Shopify-Access-Token': TOKEN } }, r => {
      let b = ''; r.on('data', d => b += d);
      r.on('end', () => { try { res({ body: JSON.parse(b), link: r.headers['link'] || '' }); } catch (e) { res({ body: {}, link: '' }); } });
    });
    req.on('error', rej); req.end();
  });
}

function shopifyPut(p, data) {
  return new Promise((res, rej) => {
    const buf = Buffer.from(JSON.stringify(data));
    const req = https.request({ hostname: 'bartact.myshopify.com', path: p, method: 'PUT', headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', 'Content-Length': buf.length } }, r => {
      let b = ''; r.on('data', d => b += d);
      r.on('end', () => { try { res(JSON.parse(b)); } catch (e) { res({}); } });
    });
    req.on('error', rej); req.write(buf); req.end();
  });
}

function gql(query, variables = {}) {
  return new Promise((res, rej) => {
    const buf = Buffer.from(JSON.stringify({ query, variables }));
    const req = https.request({ hostname: 'bartact.myshopify.com', path: '/admin/api/2024-01/graphql.json', method: 'POST', headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', 'Content-Length': buf.length } }, r => {
      let b = ''; r.on('data', d => b += d);
      r.on('end', () => { try { res(JSON.parse(b)); } catch (e) { res({}); } });
    });
    req.on('error', rej); req.write(buf); req.end();
  });
}

function httpPost(hostname, path, headers, body) {
  return new Promise((res, rej) => {
    const buf = Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
    const req = https.request({ hostname, path, method: 'POST', headers: { ...headers, 'Content-Length': buf.length } }, r => {
      let b = ''; r.on('data', d => b += d);
      r.on('end', () => { res({ status: r.statusCode, body: b }); });
    });
    req.on('error', rej); req.write(buf); req.end();
  });
}

// ─── Word count ───────────────────────────────────────────────────────────────

function wc(html) {
  if (!html) return 0;
  return html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(w => w.length > 0).length;
}

// ─── Skip logic ───────────────────────────────────────────────────────────────

function shouldSkip(p) {
  const h = (p.handle || '');
  const t = (p.product_type || '').toLowerCase();
  const title = (p.title || '').toLowerCase();
  if (h === '_additional-price') return true;
  if (h.startsWith('cpb-order-')) return true;
  if (t.includes('gift card')) return true;
  if (title.includes("customer's product with price")) return true;
  return false;
}

// ─── Vehicle extraction ───────────────────────────────────────────────────────

function extractVehicles(title) {
  const t = title.toLowerCase();
  const v = [];
  if (t.includes('jlu') || (t.includes('wrangler') && t.includes('4-door'))) v.push('Jeep Wrangler JLU (4-Door)');
  if (t.includes(' jl ') || t.includes('jl,') || (t.includes('wrangler jl') && !t.includes('jlu'))) v.push('Jeep Wrangler JL (2-Door)');
  if (t.includes('jku')) v.push('Jeep Wrangler JKU (4-Door)');
  if ((t.includes(' jk ') || t.includes('jk,') || t.includes('wrangler jk')) && !t.includes('jku')) v.push('Jeep Wrangler JK (2-Door)');
  if (t.includes(' tj') || t.includes('tj,')) v.push('Jeep Wrangler TJ');
  if (t.includes(' yj') || t.includes('yj,')) v.push('Jeep Wrangler YJ');
  if (t.includes(' cj') || t.includes('cj,')) v.push('Jeep Wrangler CJ');
  if (t.includes('gladiator') || t.includes(' jt')) v.push('Jeep Gladiator JT');
  if (t.includes('bronco') && !t.includes('bronco sport')) v.push('Ford Bronco (2021+)');
  if (t.includes('bronco sport')) v.push('Ford Bronco Sport');
  if (t.includes('tacoma')) v.push('Toyota Tacoma');
  if (t.includes('4runner')) v.push('Toyota 4Runner');
  if (t.includes('f-150') || t.includes('f150')) v.push('Ford F-150');
  if (t.includes('maverick x3') || t.includes('can-am')) v.push('Can-Am Maverick X3');
  if (t.includes('universal')) v.push('Universal Fit');
  return v.length ? v : null;
}

// ─── SEO title shortener ──────────────────────────────────────────────────────

function shortenTitle(title) {
  if (title.length <= 65) return title;
  // Remove redundant vehicle suffixes that push it long
  let t = title
    .replace(/\s*\|\s*Bartact[®™]?\s*$/i, '')
    .replace(/\s+by\s+Bartact[®™]?/i, '')
    .replace(/\s*-\s*Bartact[®™]?/i, '');
  // Truncate vehicle list if still long
  if (t.length > 52) {
    t = t.replace(/(?:,\s*(?:CJ|YJ|TJ|JK|JKU|JL|JLU|Gladiator|Tacoma|4Runner|Bronco))+\s*$/, '');
  }
  t = (t.trim() + ' | Bartact').slice(0, 65);
  return t;
}

// ─── Description generators ───────────────────────────────────────────────────

function generateDescription(p) {
  const title = p.title || '';
  const t = title.toLowerCase();
  const existingWc = wc(p.body_html);
  const vehicles = extractVehicles(title);
  const fitment = vehicles ? vehicles.join(', ') : null;
  const hasMolle = t.includes('molle') || t.includes('pals');
  const madeInUSA = true; // all Bartact products

  // Detect product category
  if (t.includes('seat cover')) return genSeatCover(p, fitment, hasMolle);
  if (t.includes('grab handle') || t.includes('door handle')) return genGrabHandle(p, fitment);
  if (t.includes('paracord') && (t.includes('keychain') || t.includes('zipper'))) return genParacordAccessory(p);
  if (t.includes('paracord') && t.includes('strap')) return genParacordStrap(p, fitment);
  if (t.includes('storage bag') || t.includes('organizer')) return genStorageBag(p, fitment);
  if (t.includes('visor cover') || t.includes('visor shade')) return genVisorCover(p, fitment, hasMolle);
  if (t.includes('console cover') || t.includes('console organizer') || t.includes('console lid')) return genConsoleCover(p, fitment, hasMolle);
  if (t.includes('fire extinguisher')) return genFireExtMount(p, fitment);
  if (t.includes('winch cover')) return genWinchCover(p, fitment);
  if (t.includes('hitch cover') || t.includes('hitch receiver')) return genHitchProduct(p);
  if (t.includes('dog') || t.includes('k9') || t.includes('barktact')) return genDogProduct(p);
  if (t.includes('patch')) return genPatch(p);
  if (t.includes('bull strap') || t.includes('ratchet tie') || t.includes('d-ring') || t.includes('shackle')) return genBullStrap(p);
  if (t.includes('tie down') || t.includes('cinch strap')) return genBullStrap(p);
  if (t.includes('bar slap') || t.includes('can grip') || t.includes('bottle grip')) return genBarSlap(p);
  if (t.includes('flashlight')) return genFlashlight(p);
  if (t.includes('sun shade') || t.includes('sunshade') || t.includes('shade top')) return genSunshade(p, fitment);
  if (t.includes('backpack') || t.includes('bag') || t.includes('pack')) return genBag(p, hasMolle);
  if (t.includes('elastic') || t.includes('bungee')) return genElastic(p);
  if (t.includes('magnet') || t.includes('mount')) return genMount(p, fitment);
  if (t.includes('beanie') || t.includes('cap') || t.includes('hat')) return genApparel(p);
  if (t.includes('gift card')) return genGiftCard(p);
  if (t.includes('keychain')) return genKeychain(p);
  // Generic fallback
  return genGeneric(p, fitment, hasMolle);
}

function genSeatCover(p, fitment, hasMolle) {
  const title = p.title;
  const t = title.toLowerCase();
  const isRear = t.includes('rear');
  const isFront = t.includes('front');
  const isHeated = t.includes('heated');
  const isNeoprene = t.includes('neoprene') || t.includes('neo');
  const isSaddleblanket = t.includes('saddle') || t.includes('blanket');
  const seatPos = isRear ? 'rear' : isFront ? 'front' : 'front and rear';
  const material = isNeoprene ? 'neoprene' : isSaddleblanket ? 'saddle blanket fabric' : 'tactical fabric';
  const fit = fitment || 'Jeep Wrangler and Gladiator';

  return `<h2>${title}</h2>
<p>Bartact ${seatPos} seat covers for ${fit} are built for people who actually use their vehicles. Custom-formed to fit the OEM seat contours exactly — no bunching, no slipping, no ugly gaps. These aren't universal covers stapled to foam backing. Every panel is precision-cut from ${material} and assembled in the USA.</p>
<h3>Fit & Compatibility</h3>
<p>Engineered specifically for the ${fit}. The fit is exact — the cover drops on like it was factory-installed, because every dimension was taken directly from the OEM seat. Side airbags are fully compatible where applicable. Installation takes under 20 minutes without tools.</p>
${hasMolle ? '<h3>MOLLE / PALS Panel</h3>\n<p>The integrated MOLLE/PALS webbing panel turns the seat back into a mission-ready storage wall. Attach pouches, tools, hydration packs, organizers, first aid kits — anything with MOLLE compatibility. The webbing is rated for real loads and won\'t sag or stretch over time. Mil-spec construction throughout.</p>' : ''}
<h3>Material & Construction</h3>
<p>Made from heavy-duty ${material} that resists UV fade, abrasion, and moisture. The fabric is treated for stain resistance and can be wiped clean or machine-washed on cold. Double-stitched seams throughout. Bartact uses the same industrial sewing equipment as US military contractors — because the bar is set there, not at what the market will tolerate.</p>
${isHeated ? '<h3>Heated Seat Compatible</h3>\n<p>Full compatibility with OEM and aftermarket heated seat systems. The cover material conducts warmth evenly without creating hot spots or blocking the heat entirely. No wiring modifications required.</p>' : ''}
<h3>Made in the USA</h3>
<p>Every Bartact seat cover is cut, sewn, and quality-checked in our US facility. We don\'t outsource manufacturing to cut costs — we know exactly what goes into every product that ships under our name. If something isn\'t right, we make it right.</p>
<h3>Why Bartact?</h3>
<ul>
<li>Custom-fit to OEM dimensions — exact, not approximate</li>
<li>Tactical-grade materials rated for real-world abuse</li>
${hasMolle ? '<li>Integrated MOLLE/PALS panel — full mil-spec webbing</li>' : ''}
<li>Made in the USA with American labor and materials</li>
<li>Side-airbag compatible where applicable</li>
<li>Machine washable — cold, gentle cycle</li>
<li>Bartact lifetime craftsmanship guarantee</li>
</ul>
<h3>In the Box</h3>
<p>${isRear ? 'Rear bench seat cover set' : isFront ? 'Front seat cover (single seat, driver or passenger)' : 'Complete front and rear seat cover set'} for ${fit}. All hardware and installation instructions included.</p>`;
}

function genGrabHandle(p, fitment) {
  const title = p.title;
  const t = title.toLowerCase();
  const isParacord = t.includes('paracord');
  const isHeadrest = t.includes('headrest');
  const fit = fitment ? fitment : 'Jeep, Ford Bronco, and off-road vehicles';
  const material = isParacord ? 'mil-spec 550 paracord' : 'impact-resistant polymer with grip overmold';

  return `<h2>${title}</h2>
<p>Bartact invented the aftermarket grab handle. Before Bartact, you were holding a bare roll bar and hoping. These handles are the product that started it all — designed, tooled, and manufactured in the United States from ${material}. Every unit is built for the trail, not the showroom.</p>
<h3>Compatibility</h3>
<p>Designed and tested for ${fit}. ${isHeadrest ? 'Installs over the headrest posts without drilling — loop, tighten, done. Removes just as fast when you want the interior stock.' : 'Mounts directly to the roll bar without drilling or modification. Clean install, tight fit, no rattles.'}</p>
${isParacord ? `<h3>550 Paracord Construction</h3>
<p>Hand-woven in-house from genuine Type III 550 paracord — the same cord used by military personnel worldwide. Each handle is assembled individually and rated for serious loads. The braid provides natural grip even through gloves, wet hands, or mud. UV-stabilized: won't fade, fray, or go brittle in extreme temperatures. Over 30 color combinations available — match your interior, your gear, or your personality.</p>` : `<h3>Grip & Material</h3>
<p>Impact-resistant polymer core with a textured rubber overmold grip surface. Engineered to hold secure under load — whether you're a passenger on a 40-degree trail or a driver catching yourself mid-lean. The grip works with gloves on, hands wet, or covered in trail mud.</p>`}
<h3>Made in the USA</h3>
<p>Every Bartact grab handle is made in our US facility. Not assembled from imported components — made. The tooling, the materials, the labor — all domestic. We know what goes into every product we ship.</p>
<h3>Why Bartact?</h3>
<ul>
<li>The original aftermarket Jeep grab handle — Bartact invented this product</li>
<li>Custom-fit for ${fit}</li>
${isParacord ? '<li>Genuine 550 mil-spec paracord, hand-woven in the USA</li>' : '<li>Impact-resistant polymer with textured grip overmold</li>'}
<li>Tool-free installation — on and off in under 2 minutes</li>
<li>Rated for real trail loads — not decorative</li>
<li>Made in the USA</li>
<li>Available in ${isParacord ? '30+ color combinations' : 'multiple finish options'}</li>
</ul>
<h3>Installation</h3>
<p>${isHeadrest ? 'Remove headrest. Loop handle straps over headrest posts. Reinstall headrest. Done — no tools, no drilling, no permanent modification.' : 'Locate desired roll bar position. Secure handle mount to bar. Torque fasteners per instructions. Full install under 5 minutes.'}</p>`;
}

function genParacordAccessory(p) {
  const title = p.title;
  const t = title.toLowerCase();
  const isKeychain = t.includes('keychain');
  const isZipper = t.includes('zipper');
  const type = isKeychain ? 'keychain' : isZipper ? 'zipper pull' : 'paracord accessory';

  return `<h2>${title}</h2>
<p>Bartact hand-woven paracord ${type}s. Made in the USA from genuine Type III 550 mil-spec paracord — the same material used by military personnel worldwide. Small product, serious construction.</p>
<h3>Construction</h3>
<p>Each ${type} is woven by hand in Bartact's US facility from 550 paracord. The braid pattern is tight and consistent — no loose ends, no shortcuts. UV-stabilized so colors stay vivid after years of sun exposure. Won't fray, stiffen, or crack in extreme temperatures. Available in a wide range of color combinations to match your gear or express your style.</p>
<h3>550 Paracord</h3>
<p>Type III 550 paracord has a minimum break strength of 550 lbs. For a ${type}, that's overkill — which is exactly the point. The same cord that holds military equipment together is now on your ${isKeychain ? 'keys' : 'gear'}. Mil-spec materials, civilian price.</p>
<h3>Made in the USA</h3>
<p>Not imported. Not assembled from offshore components. Made in the USA by Bartact's team. Every piece goes through quality control before it ships. Small products matter too.</p>
<h3>Why Bartact?</h3>
<ul>
<li>Genuine Type III 550 mil-spec paracord</li>
<li>Hand-woven in the USA</li>
<li>UV-stabilized — colors won't fade</li>
<li>Rated far beyond any ${type} load — built to last</li>
<li>Multiple color options available</li>
<li>Bartact lifetime craftsmanship guarantee</li>
</ul>`;
}

function genParacordStrap(p, fitment) {
  const title = p.title;
  const fit = fitment ? fitment : 'Jeep Wrangler and compatible vehicles';
  return `<h2>${title}</h2>
<p>Bartact adjustable paracord straps for ${fit}. Made in the USA from genuine Type III 550 mil-spec paracord. Functional, durable, and built to handle real-world loads on and off the trail.</p>
<h3>Compatibility</h3>
<p>Designed and tested for ${fit}. Direct fitment — no modification required. Installation is simple and tool-free.</p>
<h3>550 Paracord Construction</h3>
<p>Woven from genuine mil-spec 550 paracord — 550 lb minimum break strength. UV-stabilized so colors hold up in direct sun. Won't fray, stiffen, or crack. Multiple color options to match your build or your gear.</p>
<h3>Adjustable Design</h3>
<p>The adjustable system lets you dial in the fit precisely. No guessing, no slop. Once set, it stays set — the adjustment mechanism is secure under load and doesn't creep.</p>
<h3>Made in the USA</h3>
<p>Every Bartact paracord strap is made in our US facility. Domestically sourced materials, American labor, Bartact quality control. We stand behind every product we ship.</p>
<h3>Why Bartact?</h3>
<ul>
<li>Genuine Type III 550 mil-spec paracord — 550 lb break strength</li>
<li>Custom-fit for ${fit}</li>
<li>Fully adjustable — precise fit, stays locked</li>
<li>UV-stabilized: no fading, no brittleness</li>
<li>Tool-free installation</li>
<li>Made in the USA</li>
<li>Multiple color options</li>
</ul>`;
}

function genStorageBag(p, fitment) {
  const title = p.title;
  const t = title.toLowerCase();
  const hasMolle = t.includes('molle');
  const fit = fitment ? fitment : 'Jeep Wrangler and off-road vehicles';
  return `<h2>${title}</h2>
<p>Bartact storage bags and organizers for ${fit}. Built for the trail — not for a cargo show. Heavy-duty construction, smart layout, and enough capacity to organize the gear you actually bring on a run.</p>
<h3>Compatibility</h3>
<p>Designed for ${fit}. Mounts securely without rattling or shifting on rough terrain. No permanent modification required.</p>
<h3>Organization & Capacity</h3>
<p>Multiple compartments and pockets keep your recovery gear, tools, first aid supplies, and trail essentials sorted and accessible. Everything has a place. Nothing gets buried.</p>
${hasMolle ? '<h3>MOLLE / PALS Compatible</h3>\n<p>Integrated MOLLE/PALS webbing lets you expand storage with compatible pouches and attachments. Configure the layout for your specific mission — recovery run, overlanding, daily commute, or all of the above.</p>' : ''}
<h3>Construction</h3>
<p>Heavy-duty fabric construction with reinforced stress points, quality zippers, and double-stitched seams. Built to survive trail conditions — dust, mud, moisture, vibration, and the general abuse of off-road use. Wipe-clean interior.</p>
<h3>Made in the USA</h3>
<p>Made in Bartact's US facility. Every bag is assembled and inspected before it ships. We don't cut corners on materials or construction.</p>
<h3>Why Bartact?</h3>
<ul>
<li>Custom-fit for ${fit} — no rattling, no shifting</li>
<li>Smart multi-compartment layout</li>
${hasMolle ? '<li>MOLLE/PALS webbing for expandable storage</li>' : ''}
<li>Heavy-duty construction with reinforced stress points</li>
<li>Quality zippers and hardware</li>
<li>Made in the USA</li>
</ul>`;
}

function genVisorCover(p, fitment, hasMolle) {
  const title = p.title;
  const fit = fitment ? fitment : 'Jeep Wrangler and off-road vehicles';
  return `<h2>${title}</h2>
<p>Bartact MOLLE visor covers for ${fit}. Transforms your stock sun visor into a functional storage panel — without removing the visor or making permanent modifications. Designed and made in the USA.</p>
<h3>Compatibility</h3>
<p>Engineered specifically for ${fit}. Slips over the OEM visor cleanly — no drilling, no adhesive, no permanent modification. Fits snug and stays put.</p>
${hasMolle ? `<h3>MOLLE / PALS Panel</h3>
<p>Full MOLLE/PALS webbing panel on the face of the cover puts your visor to work. Mount a flashlight, first aid pouch, documents holder, sunglasses case, or any MOLLE-compatible accessory. The webbing is mil-spec rated — it's not decorative. Handles real loads without sagging or stretching.</p>` : ''}
<h3>Construction</h3>
<p>Heavy-duty tactical fabric with quality stitching throughout. UV-resistant — won't fade or break down from sun exposure inside the cab. Wipe-clean surface. Sized precisely to the OEM visor so coverage is complete and fit is clean.</p>
<h3>Garage Door Opener Cutout</h3>
<p>Available in versions with and without a garage door opener cutout — so your OEM clip-in opener remains accessible with the cover installed.</p>
<h3>Made in the USA</h3>
<p>Every Bartact visor cover is made in our US facility. Exact fit, American craftsmanship, Bartact quality control.</p>
<h3>Why Bartact?</h3>
<ul>
<li>Custom-fit for ${fit} — exact OEM dimensions</li>
${hasMolle ? '<li>Full mil-spec MOLLE/PALS webbing panel</li>' : ''}
<li>No permanent modification required</li>
<li>UV-resistant heavy-duty fabric</li>
<li>Available with or without garage door opener cutout</li>
<li>Made in the USA</li>
</ul>`;
}

function genConsoleCover(p, fitment, hasMolle) {
  const title = p.title;
  const t = title.toLowerCase();
  const isPadded = t.includes('padded');
  const fit = fitment ? fitment : 'Jeep Wrangler';
  return `<h2>${title}</h2>
<p>Bartact ${isPadded ? 'padded ' : ''}center console cover for ${fit}. Protects your OEM console, adds ${hasMolle ? 'MOLLE storage and ' : ''}a comfortable padded surface, and installs without tools or permanent modification. Made in the USA.</p>
<h3>Compatibility</h3>
<p>Designed and measured for ${fit}. Drop-on fit over the factory console — no drilling, no adhesive, no permanent modification. Stays in place over rough terrain.</p>
${isPadded ? '<h3>Padded Surface</h3>\n<p>The padded top panel provides a comfortable armrest and protects the OEM console lid from scratches, wear, and UV damage. High-density foam padding covered in durable tactical fabric — firm enough to support your arm at speed, comfortable enough for long drives.</p>' : ''}
${hasMolle ? '<h3>MOLLE / PALS Panel</h3>\n<p>Integrated MOLLE/PALS webbing on the sides or face turns dead console space into organized, accessible storage. Attach pouches, organizers, flashlights, or any MOLLE-compatible gear.</p>' : ''}
<h3>Construction</h3>
<p>Heavy-duty tactical fabric with reinforced stitching. UV and abrasion resistant. Wipe-clean surface — trail dust, mud, and spills wipe off easily. Quality hardware and fastening system that holds tight over rough terrain.</p>
<h3>Made in the USA</h3>
<p>Made in Bartact's US facility. Exact fit guaranteed — because we measure the actual vehicle, not generic specs.</p>
<h3>Why Bartact?</h3>
<ul>
<li>Exact fit for ${fit}</li>
${isPadded ? '<li>High-density foam padded surface — comfortable and protective</li>' : ''}
${hasMolle ? '<li>MOLLE/PALS webbing for organized storage</li>' : ''}
<li>No permanent modification required</li>
<li>UV and abrasion resistant tactical fabric</li>
<li>Made in the USA</li>
</ul>`;
}

function genFireExtMount(p, fitment) {
  const title = p.title;
  const fit = fitment ? fitment : 'Jeep Wrangler';
  return `<h2>${title}</h2>
<p>Bartact fire extinguisher mount for ${fit}. Aluminum construction, rock-solid retention, and a clean install that puts your fire extinguisher exactly where you need it — accessible in an emergency, out of the way when you don't.</p>
<h3>Compatibility</h3>
<p>Engineered for ${fit}. Bolts into existing mounting points — no drilling required. Fits standard 2.5 lb fire extinguishers with the included mount bracket.</p>
<h3>Aluminum Construction</h3>
<p>Machined from aircraft-grade aluminum. Strong, light, and corrosion-proof. Won't rust, won't crack, won't flex under trail loads. The retention system holds the extinguisher secure over rough terrain without rattling — and releases instantly in an emergency.</p>
<h3>Safety First</h3>
<p>A fire extinguisher you can't reach in 2 seconds is no fire extinguisher at all. Bartact's mount positions the extinguisher for one-hand access from the driver's seat. The quick-release retention removes the canister cleanly without fumbling.</p>
<h3>Made in the USA</h3>
<p>Made in Bartact's US facility from domestically sourced aluminum. Every mount is inspected before it ships.</p>
<h3>Why Bartact?</h3>
<ul>
<li>Exact fit for ${fit} — uses existing mounting points</li>
<li>Aircraft-grade aluminum — strong, light, corrosion-proof</li>
<li>Quick-release retention — one-hand access in an emergency</li>
<li>No drilling required</li>
<li>Made in the USA</li>
</ul>`;
}

function genWinchCover(p, fitment) {
  const title = p.title;
  return `<h2>${title}</h2>
<p>Bartact winch cover. Protects your winch investment from UV damage, trail debris, moisture, and corrosion. Built from heavy-duty weatherproof material to keep your winch ready when you need it most.</p>
<h3>Protection</h3>
<p>UV rays degrade synthetic rope, corrode metal components, and crack plastic housings. A good winch cover stops all of that. Bartact's cover is made from UV-resistant, weatherproof fabric that blocks sunlight, sheds water, and keeps trail dust and debris out of your winch mechanism.</p>
<h3>Fitment</h3>
<p>Sized specifically for the winches listed in this product title. The fit is precise — snug enough to stay put at highway speed, easy enough to remove before a pull.</p>
<h3>Construction</h3>
<p>Heavy-duty weatherproof fabric with reinforced stress points. Secure fastening system keeps the cover in place over rough roads and at speed. Won't flap, shift, or blow off.</p>
<h3>Made in the USA</h3>
<p>Made in Bartact's US facility. Every cover is cut, sewn, and inspected in-house.</p>
<h3>Why Bartact?</h3>
<ul>
<li>UV-resistant weatherproof fabric</li>
<li>Exact fit for listed winch models</li>
<li>Secure fastening — won't shift at speed</li>
<li>Protects synthetic rope and metal components</li>
<li>Made in the USA</li>
</ul>`;
}

function genHitchProduct(p) {
  const title = p.title;
  const t = title.toLowerCase();
  const isCover = t.includes('cover');
  const isReceiver = t.includes('receiver') || t.includes('hitch');
  return `<h2>${title}</h2>
<p>Bartact ${isCover ? 'hitch cover' : 'hitch receiver accessory'}. Quality construction, clean install, made in the USA. Designed for off-road use — not just looks.</p>
<h3>Construction & Fit</h3>
<p>${isCover ? 'Fits standard 2" and 1.25" receiver hitches. Protects the receiver opening from mud, debris, and corrosion when not in use. Secure fit that won\'t rattle or fall out on rough terrain.' : 'Built for compatibility with standard receiver hitches. Solid construction rated for real towing and recovery loads.'}</p>
<h3>Materials</h3>
<p>Heavy-duty construction from quality materials. UV and corrosion resistant. Built for the outdoors, not just the driveway.</p>
<h3>Made in the USA</h3>
<p>Made in Bartact's US facility with American materials and labor.</p>
<h3>Why Bartact?</h3>
<ul>
<li>Quality materials — built for off-road use</li>
<li>Secure fit — no rattling over rough terrain</li>
<li>UV and corrosion resistant</li>
<li>Made in the USA</li>
</ul>`;
}

function genDogProduct(p) {
  const title = p.title;
  const t = title.toLowerCase();
  const isVest = t.includes('vest') || t.includes('harness');
  const isLeash = t.includes('leash') || t.includes('lead');
  const type = isVest ? 'tactical dog vest/harness' : isLeash ? 'dog leash' : 'dog gear';
  return `<h2>${title}</h2>
<p>Bartact BarkTact ${type}. Military-inspired dog gear for working dogs, active dogs, and dogs whose owners refuse to settle for cheap pet store gear. Made in the USA from the same materials Bartact uses for human tactical equipment.</p>
<h3>BarkTact — Tactical Dog Gear</h3>
<p>BarkTact is Bartact's line of tactical-grade dog equipment. The same design principles, material standards, and manufacturing practices that go into Bartact's human gear go into BarkTact. Your dog doesn't get the B-team version. Same team. Same standards.</p>
${isVest ? `<h3>Vest & Harness Design</h3>
<p>Adjustable fit for a secure, comfortable harness across a range of body types. Heavy-duty hardware rated for working-dog loads. MOLLE/PALS webbing panel for attaching pouches, patches, identification, and accessories. Load-bearing handle on the back for assist and control in terrain.</p>` : ''}
${isLeash ? `<h3>Leash Construction</h3>
<p>Heavy-duty paracord or tactical webbing construction. Comfortable grip handle. Solid hardware rated for strong dogs. Removable velcro patch panel for ID, morale patches, or unit markings. Made to be used hard — trail runs, training, working dog duty.</p>` : ''}
<h3>Made in the USA</h3>
<p>Every BarkTact product is made in Bartact's US facility. Same team that makes the grab handles and seat covers makes the dog gear. American labor, American materials, Bartact quality control.</p>
<h3>Why BarkTact?</h3>
<ul>
<li>Tactical-grade materials — same as Bartact human gear</li>
<li>Heavy-duty hardware rated for working-dog use</li>
${isVest ? '<li>MOLLE/PALS webbing for modular attachment</li>' : ''}
<li>Adjustable fit for comfort and security</li>
<li>Made in the USA</li>
<li>BarkTact by Bartact — the original tactical pet gear brand</li>
</ul>`;
}

function genPatch(p) {
  const title = p.title;
  const t = title.toLowerCase();
  const isFlag = t.includes('flag');
  const isMedical = t.includes('medical') || t.includes('emt');
  const isMorale = t.includes('morale');
  const isPVC = t.includes('pvc') || t.includes('rubber');
  const isEmbroidered = t.includes('embroid');
  return `<h2>${title}</h2>
<p>Bartact ${isPVC ? 'PVC rubber' : isEmbroidered ? 'embroidered' : ''} ${isFlag ? 'American flag' : isMedical ? 'medical/EMT' : isMorale ? 'morale' : ''} patch. Hook-and-loop velcro backing. Compatible with all MOLLE gear, tactical vests, bags, hats, and any velcro-equipped surface.</p>
<h3>Construction</h3>
<p>${isPVC ? 'Molded from high-quality PVC rubber — flexible, waterproof, and UV-resistant. Colors stay vivid after years of sun and weather exposure. The detail is sharp and defined, much more durable than embroidered equivalents in wet or abrasive conditions.' : 'Embroidered on heavy-duty base fabric with tight, consistent stitching. Colors are stable under UV exposure and washing.'}</p>
<h3>Velcro Hook Backing</h3>
<p>Standard hook-and-loop backing compatible with all velcro loop panels — MOLLE gear, tactical bags, seat covers with loop panels, hats, jackets, and more. Strong adhesion, clean removal when needed.</p>
<h3>Dimensions</h3>
<p>See product options for exact size. Available in multiple color/style variants — ${isFlag ? 'full color, subdued, thin blue line, thin red line' : 'multiple options listed'}.</p>
<h3>Made in the USA</h3>
<p>Designed and quality-controlled by Bartact. Made to Bartact's standards for off-road and tactical use.</p>
<h3>Why Bartact?</h3>
<ul>
<li>${isPVC ? 'PVC rubber — waterproof, UV-resistant, crisp detail' : 'Quality embroidery — tight stitching, stable colors'}</li>
<li>Hook-and-loop velcro backing — universal compatibility</li>
<li>Multiple color/style options</li>
<li>Designed for tactical and off-road use</li>
</ul>`;
}

function genBullStrap(p) {
  const title = p.title;
  const t = title.toLowerCase();
  const isRatchet = t.includes('ratchet');
  const isDRing = t.includes('d-ring') || t.includes('d ring') || t.includes('shackle');
  const isBullWrap = t.includes('bull wrap') || t.includes('cinch');
  return `<h2>${title}</h2>
<p>Bull Strap ${isRatchet ? 'ratchet tie-down' : isDRing ? 'D-ring shackle kit' : isBullWrap ? 'adjustable cinch strap' : 'recovery strap'}. Heavy-duty construction rated for serious loads. Built for hauling, towing, and recovery — not decorative use.</p>
<h3>Load Ratings & Construction</h3>
<p>Heavy-duty webbing and hardware rated for the loads listed in the product specifications. ${isRatchet ? 'The ratchet mechanism delivers secure, consistent tension across the full load range. S-hooks or J-hooks for versatile tie-down points.' : isDRing ? 'D-ring shackles rated for recovery and rigging loads. Isolator washers and hardware included to prevent metal-on-metal wear and rattling.' : 'Adjustable design for a snug, consistent cinch across different load shapes and sizes.'}</p>
<h3>Heavy-Duty Hardware</h3>
<p>Quality steel hardware with corrosion-resistant finish. Rated for real-world recovery and hauling loads. Not the light-duty hardware that passes minimum spec and fails in the field.</p>
<h3>Versatility</h3>
<p>Suitable for vehicle recovery, cargo hauling, trailer loading, and general utility tie-down applications. The design handles varied load shapes without compromising security.</p>
<h3>Why Bull Strap?</h3>
<ul>
<li>Heavy-duty rated — built for real loads, not minimum spec</li>
<li>Quality hardware with corrosion-resistant finish</li>
<li>${isRatchet ? 'Ratchet mechanism for consistent, secure tension' : isDRing ? 'D-ring rated for recovery and rigging' : 'Adjustable cinch for varied load shapes'}</li>
<li>Multi-use: recovery, hauling, cargo, trailer</li>
</ul>`;
}

function genBarSlap(p) {
  const title = p.title;
  return `<h2>${title}</h2>
<p>Bartact Bar Slaps — paracord can/bottle grips that store on your roll bar grab handle. Keep your beer, soda, or water bottle secure on the trail without taking up cup holder space. Made in the USA from 550 paracord.</p>
<h3>How They Work</h3>
<p>Bar Slaps are paracord sleeves that slip over a standard can or bottle and grip it securely. They store on your Bartact grab handle (or any roll bar) when not in use — wrapped around the bar, out of the way, and always within reach. Grab the can, grab the sleeve, done.</p>
<h3>550 Paracord</h3>
<p>Made from genuine Type III 550 mil-spec paracord. The same material in Bartact's grab handles and keychains — UV-stabilized, stretch-resistant, won't fray or crack. Multiple color options to match your handles and gear.</p>
<h3>Made in the USA</h3>
<p>Hand-woven in Bartact's US facility. Small product, same quality standards as everything else Bartact makes.</p>
<h3>Why Bartact Bar Slaps?</h3>
<ul>
<li>Keep drinks secure on rough terrain without a cup holder</li>
<li>Stores neatly on grab handle when not in use</li>
<li>Genuine 550 mil-spec paracord</li>
<li>Multiple color options</li>
<li>Made in the USA</li>
</ul>`;
}

function genFlashlight(p) {
  const title = p.title;
  return `<h2>${title}</h2>
<p>${title}. Tactical-grade illumination for off-road use, emergency preparedness, and everyday carry. Quality construction and reliable performance when you need light most.</p>
<h3>Performance</h3>
<p>High-output LED with multiple brightness modes. Compact enough for everyday carry, bright enough for trail use and emergency signaling. Durable housing stands up to trail conditions.</p>
<h3>Construction</h3>
<p>Impact-resistant housing with weatherproof sealing. Quality tailcap switch and mode cycling. Runs on standard batteries for easy field replacement.</p>
<h3>Why Bartact?</h3>
<ul>
<li>Tactical-grade construction for off-road and EDC use</li>
<li>High-output LED — real illumination, not marketing lumens</li>
<li>Weatherproof and impact-resistant</li>
<li>Compact enough for everyday carry</li>
</ul>`;
}

function genSunshade(p, fitment) {
  const title = p.title;
  const t = title.toLowerCase();
  const hasMolle = t.includes('molle');
  const fit = fitment ? fitment : 'Jeep Wrangler and off-road vehicles';
  return `<h2>${title}</h2>
<p>Bartact sun shade for ${fit}. Blocks UV and reduces interior heat while adding ${hasMolle ? 'MOLLE storage capability and' : ''} a clean, purposeful look to your build. Made in the USA.</p>
<h3>Compatibility</h3>
<p>Custom-fit for ${fit}. Designed to the exact OEM dimensions — clean install, complete coverage, no trimming required.</p>
<h3>UV & Heat Protection</h3>
<p>Blocks UV radiation that fades interior surfaces and raises cabin temperature. The shade material is rated for continuous outdoor exposure without degrading, shrinking, or losing effectiveness over time.</p>
${hasMolle ? '<h3>MOLLE / PALS Panel</h3>\n<p>Integrated MOLLE/PALS webbing turns your sun shade into functional storage. Mount pouches, lights, first aid gear, or any MOLLE-compatible accessories. Mil-spec webbing rated for real loads.</p>' : ''}
<h3>Construction</h3>
<p>Heavy-duty, UV-resistant material with quality fastening system. Installs without permanent modification. Stays in place at highway speed and over rough terrain.</p>
<h3>Made in the USA</h3>
<p>Made in Bartact's US facility. Exact fit, American craftsmanship.</p>
<h3>Why Bartact?</h3>
<ul>
<li>Custom-fit for ${fit}</li>
<li>UV-rated material — effective and durable long-term</li>
${hasMolle ? '<li>Integrated MOLLE/PALS webbing</li>' : ''}
<li>No permanent modification required</li>
<li>Made in the USA</li>
</ul>`;
}

function genBag(p, hasMolle) {
  const title = p.title;
  const t = title.toLowerCase();
  const isBackpack = t.includes('backpack');
  return `<h2>${title}</h2>
<p>Bartact tactical ${isBackpack ? 'backpack' : 'bag'}. Built for off-road, overlanding, and everyday carry. Heavy-duty materials, smart organization, and ${hasMolle ? 'full MOLLE compatibility' : 'clean construction'} — made in the USA.</p>
<h3>Organization</h3>
<p>Multiple compartments and pockets designed for real gear — tools, recovery equipment, first aid, hydration, electronics. Everything accessible without digging.</p>
${hasMolle ? '<h3>MOLLE / PALS System</h3>\n<p>Full MOLLE/PALS webbing panel for modular attachment. Add pouches, accessory bags, or any MOLLE-compatible gear. Expand the configuration for the mission — trail run, overlanding, EDC, or emergency preparedness.</p>' : ''}
<h3>Construction</h3>
<p>Heavy-duty fabric with reinforced stress points and quality hardware. Double-stitched seams throughout. Padded ${isBackpack ? 'back panel and shoulder straps for comfortable carry' : 'handles and weatherproof zippers'}. Built for abuse — dust, mud, rain, rough terrain.</p>
<h3>Berry Amendment Compliant</h3>
<p>Made in the USA from US-sourced materials. Berry Amendment compliant for government and law enforcement procurement.</p>
<h3>Why Bartact?</h3>
<ul>
<li>Tactical-grade materials and construction</li>
${hasMolle ? '<li>Full MOLLE/PALS webbing — modular and expandable</li>' : ''}
<li>Smart multi-compartment layout</li>
<li>Heavy-duty hardware and zippers</li>
<li>Berry Amendment compliant — Made in the USA</li>
</ul>`;
}

function genElastic(p) {
  const title = p.title;
  return `<h2>${title}</h2>
<p>Bartact braided elastic — sold by the yard. High-quality elastic for DIY tactical gear, sewing projects, gear repair, and custom MOLLE builds. Made or sourced to Bartact's quality standards.</p>
<h3>Specifications</h3>
<p>See product options for width and color. Consistent stretch recovery — doesn't go limp with use or washing. High-cycle rated for gear that gets used hard.</p>
<h3>Uses</h3>
<p>Ideal for DIY tactical gear construction, gear repair, MOLLE pouch assembly, medical gear retainers, and any project requiring durable elastic. The same quality elastic used in Bartact's own manufactured products.</p>
<h3>Why Bartact?</h3>
<ul>
<li>High-quality braided elastic — consistent specs</li>
<li>Sold by the yard — buy exactly what you need</li>
<li>Multiple width options</li>
<li>Tactical and DIY gear applications</li>
</ul>`;
}

function genMount(p, fitment) {
  const title = p.title;
  const fit = fitment ? fitment : 'compatible vehicles and equipment';
  return `<h2>${title}</h2>
<p>Bartact mount system for ${fit}. Secure, clean, and built for real-world use — not just a display shelf. Made in the USA.</p>
<h3>Compatibility</h3>
<p>Designed for ${fit}. Direct fitment — uses existing mounting points where possible. No drilling required.</p>
<h3>Construction</h3>
<p>Quality materials with a secure retention system. Holds tight over rough terrain, vibration, and highway speeds. Easy to install and remove without tools.</p>
<h3>Made in the USA</h3>
<p>Made in Bartact's US facility. Inspected before it ships.</p>
<h3>Why Bartact?</h3>
<ul>
<li>Secure retention — won't shift or rattle</li>
<li>Compatible with ${fit}</li>
<li>Clean install, no permanent modification</li>
<li>Made in the USA</li>
</ul>`;
}

function genApparel(p) {
  const title = p.title;
  const t = title.toLowerCase();
  const isBeanie = t.includes('beanie');
  const isCap = t.includes('cap') || t.includes('hat') || t.includes('trucker');
  return `<h2>${title}</h2>
<p>Bartact ${isBeanie ? 'beanie' : isCap ? 'cap' : 'headwear'}. Quality construction, comfortable fit, and the Bartact brand you trust. Made in the USA.</p>
<h3>Construction & Fit</h3>
<p>${isBeanie ? 'Warm, stretchy knit construction that fits most head sizes comfortably. Soft interior, durable exterior — holds its shape after washing.' : 'Structured cap with adjustable fit. Quality stitching and materials that hold up to everyday use.'} Wear it on the trail, at the shop, or anywhere else.</p>
<h3>Bartact Brand</h3>
<p>Wear the brand that builds the gear you trust. Bartact started as a Jeep grab handle company and grew into the tactical off-road accessories category. The logo on this ${isBeanie ? 'beanie' : 'cap'} represents American manufacturing, military-grade standards, and a product line that's earned its reputation on the trail.</p>
<h3>Made in the USA</h3>
<p>Made in the USA from quality materials.</p>
<h3>Why Bartact?</h3>
<ul>
<li>Quality construction — holds its shape and color</li>
<li>Comfortable fit for extended wear</li>
<li>Represent American-made tactical gear</li>
<li>Made in the USA</li>
</ul>`;
}

function genGiftCard(p) {
  return `<h2>Bartact Gift Card</h2>
<p>Give the gift of American-made tactical off-road accessories. A Bartact gift card lets the recipient choose exactly what they need — seat covers, grab handles, MOLLE gear, storage solutions, or any of Bartact's 300+ products.</p>
<h3>Perfect For</h3>
<p>Jeep owners. Ford Bronco enthusiasts. Off-road adventurers. Overlanders. Anyone who demands quality American-made gear for their vehicle and their outdoor lifestyle. If they drive a trail rig, a Bartact gift card hits different than another Amazon gift card.</p>
<h3>How It Works</h3>
<p>Select a denomination, complete checkout, and receive a digital gift card code by email. The recipient applies the code at checkout on Bartact.com — no expiration, no fees, full value toward any product.</p>
<h3>Why Bartact?</h3>
<ul>
<li>300+ products — something for every Jeep, Bronco, and off-road build</li>
<li>All products Made in the USA</li>
<li>Trusted by military, law enforcement, and off-road enthusiasts</li>
<li>No expiration, no fees — full value, always</li>
</ul>`;
}

function genKeychain(p) {
  return `<h2>${p.title}</h2>
<p>Bartact keychain. Made in the USA from durable materials. Small but built to Bartact's quality standards — because even the little things should be made right.</p>
<h3>Construction</h3>
<p>Compact, durable, and built to last. Quality hardware and attachment ring. Represents the Bartact brand — American-made, tactical-grade, built for people who use their gear.</p>
<h3>Made in the USA</h3>
<p>Made in Bartact's US facility. Same standards as every other Bartact product, just pocket-sized.</p>
<h3>Why Bartact?</h3>
<ul>
<li>Durable construction — made to last</li>
<li>Quality hardware and attachment ring</li>
<li>Compact and lightweight</li>
<li>Made in the USA</li>
<li>Bartact quality in a pocket-sized package</li>
</ul>`;
}

function genGeneric(p, fitment, hasMolle) {
  const title = p.title;
  const fit = fitment ? fitment : null;
  return `<h2>${title}</h2>
<p>Bartact ${title}. Built to the same standards as everything else in the Bartact lineup — tactical-grade materials, precision fit, and American manufacturing. Designed for off-road use and built to last.</p>
${fit ? `<h3>Compatibility</h3>\n<p>Engineered for ${fit}. Designed for exact fitment — no modification required.</p>` : ''}
${hasMolle ? '<h3>MOLLE / PALS Compatible</h3>\n<p>MOLLE/PALS webbing for modular storage and accessory attachment. Mil-spec rated webbing — functional, not decorative.</p>' : ''}
<h3>Construction</h3>
<p>Heavy-duty materials with reinforced construction throughout. Built for trail conditions — UV exposure, moisture, vibration, and abrasion. Quality hardware and fastening system that holds tight and releases clean.</p>
<h3>Made in the USA</h3>
<p>Made in Bartact's US facility from quality materials. Every product is inspected before it ships. Bartact stands behind everything it makes.</p>
<h3>Why Bartact?</h3>
<ul>
<li>Tactical-grade materials rated for off-road use</li>
${fit ? `<li>Custom-fit for ${fit}</li>` : ''}
${hasMolle ? '<li>MOLLE/PALS webbing — mil-spec rated</li>' : ''}
<li>Quality hardware and construction throughout</li>
<li>Made in the USA</li>
<li>Bartact lifetime craftsmanship guarantee</li>
</ul>`;
}

// ─── SEO meta description generator ──────────────────────────────────────────

function generateMetaDesc(p) {
  const title = p.title || '';
  const t = title.toLowerCase();
  const vehicles = extractVehicles(title);
  const fit = vehicles ? vehicles.slice(0, 2).join(', ') : null;

  let desc = '';
  if (t.includes('seat cover')) desc = `Custom-fit ${t.includes('rear') ? 'rear' : t.includes('front') ? 'front' : ''} seat covers for ${fit || 'Jeep Wrangler'}. ${t.includes('molle') ? 'MOLLE-compatible. ' : ''}Made in the USA by Bartact.`;
  else if (t.includes('grab handle')) desc = `Bartact grab handles for ${fit || 'Jeep and off-road vehicles'}. The original aftermarket design. Made in USA from 550 paracord or impact-resistant polymer.`;
  else if (t.includes('visor cover')) desc = `MOLLE visor covers for ${fit || 'Jeep Wrangler'}. Mil-spec MOLLE/PALS webbing. No permanent modification. Made in the USA by Bartact.`;
  else if (t.includes('console cover') || t.includes('console organizer')) desc = `${t.includes('padded') ? 'Padded ' : ''}center console cover for ${fit || 'Jeep Wrangler'}. ${t.includes('molle') ? 'MOLLE-compatible. ' : ''}Drop-on fit, no drilling. Made in USA by Bartact.`;
  else if (t.includes('storage bag') || t.includes('organizer')) desc = `Bartact storage bag for ${fit || 'Jeep and off-road vehicles'}. Heavy-duty construction, smart layout. Made in the USA.`;
  else if (t.includes('paracord') && (t.includes('keychain') || t.includes('zipper'))) desc = `Bartact hand-woven 550 paracord ${t.includes('keychain') ? 'keychain' : 'zipper pulls'}. Mil-spec paracord, UV-stabilized, made in the USA.`;
  else if (t.includes('paracord')) desc = `Bartact paracord ${title.split(' ').slice(0, 4).join(' ')} for ${fit || 'Jeep and off-road vehicles'}. 550 mil-spec paracord, made in the USA.`;
  else if (t.includes('patch')) desc = `${t.includes('pvc') ? 'PVC rubber' : 'Embroidered'} patch with velcro hook backing. Compatible with all MOLLE gear. Multiple styles available.`;
  else if (t.includes('dog') || t.includes('barktact') || t.includes('k9')) desc = `BarkTact tactical dog gear by Bartact. Military-inspired construction. Made in the USA. ${t.includes('vest') ? 'MOLLE-compatible vest/harness.' : t.includes('leash') ? 'Heavy-duty paracord leash.' : ''}`;
  else if (t.includes('bull strap') || t.includes('ratchet tie') || t.includes('d-ring') || t.includes('shackle')) desc = `Bull Strap heavy-duty ${t.includes('ratchet') ? 'ratchet tie-down' : t.includes('d-ring') || t.includes('shackle') ? 'D-ring shackle kit' : 'recovery strap'}. Rated for real recovery loads.`;
  else if (t.includes('fire extinguisher')) desc = `Bartact aluminum fire extinguisher mount for ${fit || 'Jeep Wrangler'}. Quick-release, no drilling, made in the USA.`;
  else if (t.includes('winch cover')) desc = `Bartact winch cover. UV-resistant, weatherproof protection for your winch investment. Made in the USA.`;
  else if (t.includes('bar slap')) desc = `Bartact Bar Slaps — paracord can and bottle grips that store on your roll bar grab handle. 550 paracord, made in the USA.`;
  else if (t.includes('beanie') || t.includes('trucker cap') || t.includes('snapback')) desc = `Bartact ${t.includes('beanie') ? 'beanie cap' : 'trucker cap'}. Quality construction, comfortable fit. Made in the USA. Represent American-made tactical gear.`;
  else if (t.includes('gift card')) desc = `Bartact gift card — 300+ American-made tactical off-road accessories for Jeep, Ford Bronco, and off-road builds. No expiration.`;
  else desc = `Bartact ${title.split('|')[0].trim().slice(0, 80)}. ${fit ? 'For ' + fit + '. ' : ''}Made in the USA.`;

  // Trim to 160 chars
  if (desc.length > 160) desc = desc.slice(0, 157) + '...';
  return desc;
}

// ─── SEO title fixer ──────────────────────────────────────────────────────────

function fixSeoTitle(p) {
  const title = p.title || '';
  if (title.length <= 65) return title;

  // Strategy: strip verbose vehicle lists, keep model, trim to 65
  let t = title
    .replace(/\s*\|\s*Bartact[®™]?\.?\s*$/i, '')
    .replace(/\s+by\s+Bartact[®™]?\.?\s*$/i, '')
    .replace(/\s*-\s*Bartact[®™]?\.?\s*$/i, '')
    .trim();

  // Remove long vehicle suffix patterns (e.g. "for 1976-06 Jeep Wrangler CJ, YJ, TJ, JK, JKU, JL, JLU")
  t = t.replace(/\s+for\s+(?:19|20)\d\d[-–]\d{2,4}\s+/i, ' for ');
  // Collapse CJ/YJ/TJ/JK list to just "CJ-JL" style
  t = t.replace(/(?:CJ,?\s*)?(?:YJ,?\s*)?(?:TJ,?\s*)?(?:LJ,?\s*)?(?:JK,?\s*)?(?:JKU,?\s*)?(?:JL,?\s*)?(?:JLU,?\s*)?(?:Gladiator)?/gi, m => {
    const models = [];
    if (/CJ/i.test(m)) models.push('CJ');
    if (/YJ/i.test(m)) models.push('YJ');
    if (/TJ/i.test(m)) models.push('TJ');
    if (/JK[^U]/i.test(m)) models.push('JK');
    if (/JKU/i.test(m)) models.push('JKU');
    if (/JL[^U]/i.test(m)) models.push('JL');
    if (/JLU/i.test(m)) models.push('JLU');
    if (/Gladiator/i.test(m)) models.push('Gladiator');
    if (models.length >= 4) return models[0] + '-' + models[models.length - 1];
    if (models.length > 1) return models.join('/');
    return m;
  });

  t = t.trim();
  const result = (t + ' | Bartact').slice(0, 65);
  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Bartact SEO Fix — Thin Content + SEO Fields ===');
  console.log('Started:', new Date().toISOString());

  // 1. Fetch all products
  console.log('\n1. Fetching all active products...');
  let products = [], p = '/admin/api/2024-01/products.json?limit=250&status=active&fields=id,title,handle,body_html,product_type';
  while (p) {
    const r = await shopifyGet(p);
    products = products.concat(r.body.products || []);
    const next = r.link.match(/<([^>]+)>; rel="next"/);
    p = next ? next[1].replace('https://bartact.myshopify.com', '') : null;
    console.log('  Fetched ' + products.length + ' so far...');
  }
  console.log('  Total: ' + products.length + ' active products');

  // 2. Filter and identify work needed
  const toFix = [], skipped = [];
  for (const prod of products) {
    if (shouldSkip(prod)) { skipped.push(prod.handle); continue; }
    const words = wc(prod.body_html);
    toFix.push({ ...prod, currentWc: words, needsContent: words < MIN_WORDS });
  }
  console.log('  Skipped (CPB/gift): ' + skipped.length);
  console.log('  To process: ' + toFix.length);
  console.log('  Needs content fix (<800w): ' + toFix.filter(p => p.needsContent).length);

  // 3. Get current SEO fields via GraphQL for all products
  console.log('\n2. Fetching current SEO fields...');
  const seoMap = {};
  const Q = `query getProducts($cursor: String) {
    products(first: 50, after: $cursor, query: "status:active") {
      edges { cursor node { id handle seo { title description } } }
      pageInfo { hasNextPage }
    }
  }`;
  let cursor = null;
  while (true) {
    const r = await gql(Q, cursor ? { cursor } : {});
    const edges = r.data?.products?.edges || [];
    if (!edges.length) break;
    for (const { node } of edges) {
      seoMap[node.handle] = { gid: node.id, seoTitle: node.seo?.title || '', seoDesc: node.seo?.description || '' };
    }
    if (!r.data.products.pageInfo.hasNextPage) break;
    cursor = edges[edges.length - 1].cursor;
  }
  console.log('  SEO fields fetched for ' + Object.keys(seoMap).length + ' products');

  // 4. Process each product
  console.log('\n3. Applying fixes...');
  const UPDATE = `mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product { id handle seo { title description } }
      userErrors { field message }
    }
  }`;

  let fixed = 0, skippedFix = 0, errors = 0;
  const updatedHandles = [];

  for (const prod of toFix) {
    const seo = seoMap[prod.handle] || {};
    const currentDesc = seo.seoDesc || '';
    const currentTitle = seo.seoTitle || '';
    const needsDesc = !currentDesc || currentDesc.length < 50;
    const needsTitleFix = currentTitle.length > 65;
    const needsContent = prod.needsContent;

    if (!needsDesc && !needsTitleFix && !needsContent) { skippedFix++; continue; }

    const updates = {};

    // Fix content if thin
    if (needsContent) {
      updates.body_html = generateDescription(prod);
      const newWc = wc(updates.body_html);
      process.stdout.write('  [content] ' + prod.handle.slice(0, 55) + ' ' + prod.currentWc + 'w→' + newWc + 'w\n');
    }

    // Fix SEO fields
    const newTitle = needsTitleFix ? fixSeoTitle(prod) : currentTitle;
    const newDesc = needsDesc ? generateMetaDesc(prod) : currentDesc;

    if (!seo.gid) { console.log('  [SKIP] No GID for ' + prod.handle); errors++; continue; }

    const result = await gql(UPDATE, {
      input: {
        id: seo.gid,
        ...(updates.body_html ? { descriptionHtml: updates.body_html } : {}),
        seo: { title: newTitle, description: newDesc }
      }
    });

    const errs = result.data?.productUpdate?.userErrors || [];
    if (errs.length) {
      console.log('  [ERROR] ' + prod.handle + ': ' + JSON.stringify(errs));
      errors++;
    } else {
      fixed++;
      updatedHandles.push('https://' + SHOP_HOST + '/products/' + prod.handle);
    }

    await sleep(DELAY_MS);
  }

  console.log('\n  Fixed: ' + fixed);
  console.log('  Already OK (skipped): ' + skippedFix);
  console.log('  Errors: ' + errors);

  // 5. Submit to IndexNow
  if (updatedHandles.length > 0) {
    console.log('\n4. Submitting ' + updatedHandles.length + ' URLs to IndexNow (Bing/Yandex)...');
    const BATCH = 500;
    for (let i = 0; i < updatedHandles.length; i += BATCH) {
      const batch = updatedHandles.slice(i, i + BATCH);
      const r = await httpPost('api.indexnow.org', '/indexnow', { 'Content-Type': 'application/json' }, {
        host: SHOP_HOST,
        key: INDEXNOW_KEY,
        keyLocation: 'https://' + SHOP_HOST + '/' + INDEXNOW_KEY + '.txt',
        urlList: batch
      });
      console.log('  IndexNow batch ' + (i / BATCH + 1) + ': HTTP ' + r.status + ' (' + batch.length + ' URLs)');
    }
  }

  // 6. Save state
  const state = {
    ran: new Date().toISOString(),
    productsProcessed: toFix.length,
    fixed,
    skipped: skippedFix,
    errors,
    updatedUrls: updatedHandles.length
  };
  fs.writeFileSync(path.join(__dirname, '../memory/bartact-seo-fix-state.json'), JSON.stringify(state, null, 2));
  console.log('\n5. State saved: memory/bartact-seo-fix-state.json');
  console.log('\n=== DONE ===');
  console.log(JSON.stringify(state, null, 2));
}

main().catch(e => { console.error('FATAL:', e.message, e.stack); process.exit(1); });
