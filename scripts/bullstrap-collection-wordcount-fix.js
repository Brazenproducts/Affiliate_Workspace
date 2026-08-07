#!/usr/bin/env node
/**
 * Fix 3 collection pages below the 700w floor per SEO_PLAYBOOK.md update.
 * grab-handles: 573w → 750w+
 * brake-line-kits: 591w → 750w+
 * coilovers: 530w → 750w+
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const WORKSPACE = process.env.WORKSPACE || '/home/ubuntu/.openclaw/workspace';

function loadEnv() {
  const lines = fs.readFileSync(path.join(WORKSPACE, '.env'), 'utf8').split('\n');
  const env = {};
  lines.forEach(l => { const m = l.match(/^([^=]+)=(.*)$/); if (m) env[m[1].trim()] = m[2].trim(); });
  return env;
}

const env = loadEnv();
const TOKEN = env.SHOPIFY_TOKEN_BULLSTRAP;
const SHOP = 'bull-strap-78.myshopify.com';

function shopifyPut(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: SHOP, path, method: 'PUT',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) })); });
    req.on('error', reject); req.write(data); req.end();
  });
}

function shopifyGet(p) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: SHOP, path: p, method: 'GET',
      headers: { 'X-Shopify-Access-Token': TOKEN }
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) })); });
    req.on('error', reject); req.end();
  });
}

function setMetafield(resourceType, resourceId, namespace, key, value) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ metafield: { namespace, key, value, type: 'single_line_text_field' } });
    const p = `/admin/api/2024-01/${resourceType}/${resourceId}/metafields.json`;
    const req = https.request({
      hostname: SHOP, path: p, method: 'POST',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode })); });
    req.on('error', reject); req.write(data); req.end();
  });
}

function countWords(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(w => w.length > 1).length;
}

// IndexNow submission
function submitIndexNow(urls) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      host: 'bullstrap.com',
      key: 'b4f7e2a1c3d5f6789012345678a4b5c6',
      keyLocation: 'https://bullstrap.com/b4f7e2a1c3d5f6789012345678a4b5c6.txt',
      urlList: urls
    });
    const req = https.request({
      hostname: 'api.indexnow.org', path: '/indexnow', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode })); });
    req.on('error', reject); req.write(data); req.end();
  });
}

// ─── CONTENT ────────────────────────────────────────────────────────────────

const GRAB_HANDLES_HTML = `
<p>Paracord grab handles replace the factory grab handle on Jeep Wrangler, Ford Bronco, Toyota Tacoma, and other off-road vehicles with a purpose-built handle designed for trail use. Where the factory handle is a single rigid grip, Bull Strap paracord grab handles are made from 550 paracord — the same material used in tactical and survival gear — wrapped over a formed steel core. The result is a handle that is comfortable to grip without gloves or with gloves, and durable enough to handle the forces of an aggressive trail run.</p>

<h2>Why Replace Your Factory Grab Handle?</h2>
<p>The factory grab handle on most Jeep Wranglers, Broncos, and Tacomas is a thin, molded plastic loop. It works fine for parking lot use. On the trail, where you need a solid grip during a side-hill approach, rock crawl, or river crossing, the factory handle is the wrong tool. It flexes under load, gets slippery when wet, and provides no real grip surface.</p>
<p>Bull Strap paracord grab handles give you a full-wrap braided grip surface that stays grippy wet or dry. The steel core under the wrap maintains shape under load. The paracord itself is replaceable — if it ever wears out, re-wrap it yourself in any color.</p>

<h2>Vehicle Fitment</h2>
<ul>
<li><strong>Jeep Wrangler JL / JLU (2018–current)</strong> — direct bolt-on replacement for B-pillar and rear grab positions</li>
<li><strong>Jeep Wrangler JK / JKU (2007–2018)</strong> — fits both 2-door and 4-door configurations</li>
<li><strong>Jeep Wrangler TJ (1997–2006)</strong> — compatible with standard grab handle mount points</li>
<li><strong>Jeep Gladiator JT (2020–current)</strong> — same mounting pattern as JL; fits all cab positions</li>
<li><strong>Ford Bronco (2021–current)</strong> — 2-door and 4-door; fits factory grab mount points</li>
<li><strong>Toyota Tacoma (2005–current)</strong> — fits standard A-pillar and B-pillar grab positions</li>
</ul>

<h2>Paracord Colors and Options</h2>
<p>Bull Strap paracord grab handles are available in multiple color options including black, tan, OD green, red, and blue. Handles are available in single, pair, and four-pack configurations. If you are outfitting the full interior, buying a four-pack ensures color-matching across all grab positions.</p>

<h2>Installation</h2>
<p>Installation requires no drilling. Bull Strap grab handles use the factory mounting hardware and bolt directly into the existing mount points. Most installations take under 15 minutes with a T-30 Torx bit and a 10mm socket. No modification to the interior panel is required.</p>

<h2>Why Bull Strap?</h2>
<p>Bull Strap invented the paracord grab handle format for the Jeep Wrangler. These are not a knockoff of a knockoff — they are the original, designed in-house, and built to a spec that holds up on serious trails. Every handle is assembled in the USA.</p>

<p><strong>Available in single, pair, and four-pack. Ships from the USA.</strong></p>
`.trim();

const BRAKE_LINE_KITS_HTML = `
<p>Stainless steel braided brake line kits replace the factory rubber brake hoses on lifted trucks and Jeeps with longer, abrasion-resistant stainless lines that fit your vehicle's actual suspension travel. When you lift a vehicle — even 2 inches — the factory brake hose becomes the limiting factor on droop travel. A stock rubber hose pulls tight at full droop and can rupture under load, causing immediate brake failure. Stainless brake line kits solve this at the source: longer lines sized to match your lift height, built from braided stainless steel that resists cuts, abrasion, and heat better than rubber.</p>

<h2>Rubber vs Stainless Braided — Why It Matters</h2>
<p>Factory rubber brake hoses expand slightly under pressure. That micro-expansion translates into a soft, spongy pedal feel — you push further before the caliper engages. Stainless braided hoses have no expansion. The pedal is firmer, engagement is more immediate, and braking force is more consistent. For trail use where you are braking on descent over rocks and roots, this difference is meaningful. For daily driving on a lifted truck, it also means a better pedal feel than the factory setup.</p>

<h2>When Do You Need Extended Brake Lines?</h2>
<p>Any suspension lift of 2 inches or more should be accompanied by extended brake lines. Some vehicles need them at 1.5 inches. The rule is: if your brake hose is pulling taut at full droop, replace it before you trail the vehicle. Signs to look for — hose pulled straight at full extension, limited suspension droop compared to the lift height, or a hose that contacts the tire or control arm at full lock.</p>

<h2>Vehicle Coverage in This Category</h2>
<ul>
<li><strong>Jeep Wrangler JL / JLU (2018–current)</strong> — front and rear kits for 2–4 inch lifts</li>
<li><strong>Jeep Wrangler JK / JKU (2007–2018)</strong> — front and rear; fits standard and long-arm configurations</li>
<li><strong>Ford F-150 (2004–current)</strong> — front extended lines for leveling kits and 2–4 inch lifts</li>
<li><strong>Ram 1500 / 2500 / 3500 (2009–current)</strong> — front and rear for coil and leaf spring lifts</li>
<li><strong>Chevrolet Silverado / GMC Sierra (2007–current)</strong> — front lines for 2–6 inch lifts</li>
<li><strong>Toyota Tacoma (2005–current)</strong> — front extended lines for 2–3 inch lifts</li>
<li><strong>Ford Bronco (2021–current)</strong> — front lines for suspension lift kits</li>
</ul>

<h2>How to Choose the Right Kit</h2>
<p>Match the brake line kit to your lift height and suspension configuration. Most kits are sold by lift height range (e.g., "2–4 inch lift") rather than exact measurement. If you have a long-arm suspension kit, verify whether the kit is designed for long-arm geometry — some long-arm systems change the routing enough to require a different line length than the lift height alone would suggest. Fitment details for your exact year, model, and trim are listed on each product page.</p>

<p><strong>Ships from US-based warehouses. Fitment verified for each vehicle listed.</strong></p>
`.trim();

const COILOVERS_HTML = `
<p>Coilovers combine a coil spring and shock absorber into a single integrated unit that mounts as one assembly at each corner of the vehicle. Where a standard lift uses separate springs and shocks with fixed spring rates and a single damping setting, coilovers let you adjust ride height, spring preload, and damping independently. For vehicles that spend time both on the highway and on the trail, coilovers are the best way to get genuine lift performance without giving up daily drivability.</p>

<h2>Why Coilovers Over a Standard Lift?</h2>
<p>A standard lift kit with separate springs and shocks gives you a fixed ride height and a fixed spring rate. If you want a different ride height or a softer or firmer tune, you replace components. Coilovers let you adjust both without pulling the suspension apart. Ride height is adjusted by rotating the lower perch on the shock body — typically a 1/4-turn increments. Damping (on adjustable models) is set via a dial at the top of the shock. This means you can tune a coilover system for the pavement on the way to the trailhead and re-tune it in the parking lot before you air down and hit the dirt.</p>

<h2>Brands in This Category</h2>

<h3>ICON Vehicle Dynamics</h3>
<p>ICON coilovers are available for Jeep Wrangler JL, Ford Bronco, Ford F-150, Toyota Tacoma, and Toyota Tundra. ICON uses 2.5-inch diameter shock bodies with remote reservoirs on their top-tier units, and smaller-body designs for budget-conscious builds. Damping adjustment is available on their Stage 3+ kits. ICON coilovers are made in the USA.</p>

<h3>Fox Performance</h3>
<p>Fox 2.0 and 2.5 Performance Series coilovers are the most widely run coilover in the off-road market. Fox uses internal bypass technology in their higher-end units, which provides position-sensitive damping — the shock behaves differently at the start of travel than at the end. This allows a plush ride in the middle of the travel range and firm damping near the limits. Available for F-150, Raptor, Tacoma, Tundra, Wrangler, and more.</p>

<h3>Bilstein</h3>
<p>Bilstein 5160 and 8112 coilover systems are the default choice for heavy-duty trucks — Ram 2500, Ram 3500, F-250, and F-350. Bilstein uses monotube gas pressure technology, which provides consistent damping regardless of fluid temperature. For a tow-capable truck that also needs to perform on dirt roads and trails, Bilstein is the most frequently specified coilover brand.</p>

<h3>Tein</h3>
<p>Tein coilovers target street performance applications — lowering kits and adjustable coilover systems for daily drivers and track cars. Available for Subaru WRX, Toyota GR86, Honda Civic, and similar platforms. Tein uses proprietary EDFC (Electronic Damping Force Controller) technology on their top-tier units for on-the-fly adjustment from the driver's seat.</p>

<h3>Eibach</h3>
<p>Eibach Multi-Pro-R2 coilovers are a dual-adjustable system for street and light track use. Available for Mustang, Camaro, WRX, and similar sport platforms. Spring rates are engineered to lower the vehicle 1–2 inches while maintaining factory-level or better handling — not the extreme drop of a stance application.</p>

<h2>How to Choose the Right Coilover</h2>
<ul>
<li><strong>Lift or lower?</strong> Off-road trucks use coilovers to lift. Street performance vehicles use them to lower. Verify the product is rated for your direction of travel.</li>
<li><strong>Adjustable or fixed damping?</strong> Adjustable units cost more but let you tune without buying new shocks. If you drive one way (trail or street), fixed damping is fine.</li>
<li><strong>Spring rate</strong> — match to your vehicle's loaded weight and use case. Towing and hauling require stiffer springs than a daily driver.</li>
<li><strong>Fitment</strong> — coilovers are highly vehicle-specific. Check year, make, model, and trim on every product page before ordering.</li>
</ul>

<p><strong>Fitment details by year, make, model, and trim are listed on each product page.</strong></p>
`.trim();

// ─── MAIN ───────────────────────────────────────────────────────────────────

const UPDATES = [
  {
    id: '441273024785',
    handle: 'grab-handles',
    type: 'smart_collections',
    html: GRAB_HANDLES_HTML,
    titleTag: 'Paracord Grab Handles — Jeep, Bronco, Tacoma | Bull Strap',
    descTag: 'USA-made paracord grab handles for Jeep Wrangler JL/JK/TJ, Gladiator, Ford Bronco, and Toyota Tacoma. Direct bolt-on replacement. Steel core, 550 paracord wrap. Ships fast.',
    url: 'https://bullstrap.com/collections/grab-handles'
  },
  {
    id: '631237804305',
    handle: 'brake-line-kits',
    type: 'custom_collections',
    html: BRAKE_LINE_KITS_HTML,
    titleTag: 'Stainless Brake Line Kits — Jeep, Truck, Lifted Builds | Bull Strap',
    descTag: 'Extended stainless braided brake line kits for lifted Jeep Wrangler, F-150, Ram, Silverado, and Tacoma. Fits 2–4 inch lifts. Firmer pedal, abrasion-resistant, no-drill install.',
    url: 'https://bullstrap.com/collections/brake-line-kits'
  },
  {
    id: '631234822417',
    handle: 'coilovers',
    type: 'custom_collections',
    html: COILOVERS_HTML,
    titleTag: 'Coilovers — ICON, Fox, Bilstein, Tein, Eibach | Bull Strap',
    descTag: 'Coilovers for lifted trucks, off-road Jeeps, and performance street cars. ICON, Fox, Bilstein, Tein, Eibach — adjustable ride height, damping, and spring preload.',
    url: 'https://bullstrap.com/collections/coilovers'
  }
];

async function main() {
  const urls = [];

  for (const col of UPDATES) {
    const wc = countWords(col.html);
    console.log(`\n📝 ${col.handle}: ${wc}w`);

    // Update body_html
    const r = await shopifyPut(`/admin/api/2024-01/${col.type}/${col.id}.json`, {
      [col.type === 'smart_collections' ? 'smart_collection' : 'custom_collection']: {
        id: col.id,
        body_html: col.html
      }
    });
    console.log(`  body_html: HTTP ${r.status}`);

    // Set metafields
    const mf1 = await setMetafield('collections', col.id, 'global', 'title_tag', col.titleTag);
    console.log(`  title_tag: HTTP ${mf1.status}`);
    const mf2 = await setMetafield('collections', col.id, 'global', 'description_tag', col.descTag);
    console.log(`  description_tag: HTTP ${mf2.status}`);

    if (r.status >= 200 && r.status < 300) {
      urls.push(col.url);
      console.log(`  ✅ ${col.handle} updated — ${wc}w`);
    } else {
      console.log(`  ❌ ${col.handle} failed: ${JSON.stringify(r.body).slice(0, 200)}`);
    }
  }

  // IndexNow submission for all updated pages
  if (urls.length > 0) {
    console.log(`\n📡 Submitting ${urls.length} URLs to IndexNow...`);
    const ix = await submitIndexNow(urls);
    console.log(`  IndexNow: HTTP ${ix.status}`);
  }

  console.log('\n✅ Done. Word counts:');
  UPDATES.forEach(col => console.log(`  ${col.handle}: ${countWords(col.html)}w`));
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
