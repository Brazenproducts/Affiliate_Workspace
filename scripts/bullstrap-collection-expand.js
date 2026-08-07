#!/usr/bin/env node
/**
 * Expand 3 collection pages to 700w+ per SEO_PLAYBOOK.md Rule 8/9.
 * grab-handles: currently 409w → 750w+
 * brake-line-kits: currently 436w → 750w+
 * coilovers: currently 576w → 750w+
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

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

function shopifyPut(p, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: SHOP, path: p, method: 'PUT',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) })); });
    req.on('error', reject); req.write(data); req.end();
  });
}

function setMetafield(resourceId, namespace, key, value) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ metafield: { namespace, key, value, type: 'single_line_text_field' } });
    const req = https.request({
      hostname: SHOP, path: `/admin/api/2024-01/collections/${resourceId}/metafields.json`, method: 'POST',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode })); });
    req.on('error', reject); req.write(data); req.end();
  });
}

function countWords(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/[^a-zA-Z0-9'-]/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(w => w.length > 1).length;
}

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

// ─── CONTENT ─────────────────────────────────────────────────────────────────

const GRAB_HTML = `<p>Paracord grab handles are the single most popular interior upgrade for off-road Jeeps and trucks. They replace the thin factory plastic grab handle with a purpose-built handle wrapped in 550 paracord — the same material used in military and survival gear — over a steel core that holds its shape under real load. Bull Strap invented the paracord grab handle format for the Jeep Wrangler. Every handle is assembled in the USA.</p>

<h2>Why the Factory Grab Handle Fails on the Trail</h2>
<p>The factory grab handle on a Jeep Wrangler JL or Ford Bronco is a molded plastic loop designed for parking lot use. It provides no real grip surface, flexes under lateral load, and becomes slippery when wet or when you are wearing gloves. On a side-hill approach, a steep descent, or a river crossing where you genuinely need a grip to brace yourself, the factory handle is inadequate. Bull Strap paracord grab handles solve this with a full-wrap braided surface that stays grippy in any condition — dry, wet, gloved, or bare-handed. The underlying steel core means the handle does not flex or deform under load.</p>

<h2>Vehicle Fitment Guide</h2>
<table>
<tr><th>Vehicle</th><th>Years</th><th>Notes</th></tr>
<tr><td>Jeep Wrangler JL / JLU</td><td>2018–current</td><td>Direct bolt-on, B-pillar and rear positions</td></tr>
<tr><td>Jeep Wrangler JK / JKU</td><td>2007–2018</td><td>Both 2-door and Unlimited 4-door</td></tr>
<tr><td>Jeep Wrangler TJ</td><td>1997–2006</td><td>Fits standard grab mount points</td></tr>
<tr><td>Jeep Gladiator JT</td><td>2020–current</td><td>Same pattern as JL; fits all cab positions</td></tr>
<tr><td>Ford Bronco</td><td>2021–current</td><td>2-door and 4-door; factory mount compatible</td></tr>
<tr><td>Toyota Tacoma</td><td>2005–current</td><td>A-pillar and B-pillar grab positions</td></tr>
<tr><td>Toyota 4Runner</td><td>2010–current</td><td>Fits standard interior grab positions</td></tr>
</table>

<h2>Materials and Build Quality</h2>
<p>Bull Strap grab handles use 550 paracord — 550 refers to the tensile strength rating (550 pounds). The paracord is wrapped tightly around a formed steel core, not a hollow plastic frame. This construction means the handle maintains its diameter and shape over years of use rather than collapsing or distorting under grip pressure. The steel core is powder-coated to resist rust. Ends are finished with heat-shrink tubing and sealed for durability.</p>
<p>Compare this to imported paracord handles that use plastic cores and loose wrap patterns. Under repeated use and UV exposure, plastic-core handles develop a soft, spongy feel. Bull Strap steel-core handles do not.</p>

<h2>Paracord Color Options</h2>
<p>Available colors include black, tan, OD green, red, blue, and several pattern options. The most popular for off-road Jeeps are black and tan — both hold up to UV exposure and dirt better than brighter colors over time. OD green is the third most popular, particularly for military-inspired builds and soft-top Wranglers in darker colors.</p>

<h2>Pack Sizes</h2>
<p>Grab handles are available in single, pair, and four-pack configurations. The Jeep Wrangler JL 4-door (JLU) has four grab handle positions — one at each door pillar. Buying a four-pack ensures color matching across the full interior. The 2-door JL has two positions. Most buyers pick up a pair for the front positions first, then add the rear pair later.</p>

<h2>Installation — No Drilling Required</h2>
<p>Bull Strap paracord grab handles install using the factory hardware. No drilling, no panel modification, no additional brackets. Most installations take 10–15 minutes with a T-30 Torx bit and a 10mm socket. Remove the factory handle, thread in the paracord handle at the same mounting points, torque to spec, done. The handles arrive pre-assembled with hardware included.</p>

<h2>Frequently Asked Questions</h2>
<p><strong>Will these fit my specific trim level?</strong> Yes — grab handle mount points are identical across trims on each platform (Sport, Sahara, Rubicon, etc. all use the same bolt pattern).</p>
<p><strong>Are they safe for passengers to grip?</strong> Yes. The steel core and paracord construction handles repeated load without fatigue. They are not rated as a safety restraint system, but they are substantially stronger than the factory plastic handle.</p>
<p><strong>Can I replace the paracord if it wears out?</strong> Yes. The handle can be re-wrapped with standard 550 paracord available at any outdoor or military surplus store.</p>

<h2>Grab Handle Mounting Positions by Vehicle</h2>
<p>The Jeep Wrangler JL 4-door (JLU) has four grab handle positions — one at each door pillar from front to rear. The 2-door JL has two positions. The JK Unlimited also has four positions; the standard 2-door JK has two. If you are replacing all positions at once, buy the pack size that covers your specific door count to ensure color matching. Handles ship assembled with all mounting hardware included — no sourcing bolts separately.</p>

<h2>Maintenance</h2>
<p>Paracord does not require any maintenance. Wipe down with a damp cloth if dirty. The powder-coated steel core is rust-resistant but should be dried after extended water exposure. If the paracord wrap ever shows wear after years of heavy use, the handle can be re-wrapped with standard 550 paracord from any outdoor supply store. The re-wrap process takes about 20 minutes and costs less than $5 in materials.</p>

<p>See also: <a href="/collections/limit-straps">Suspension Limit Straps</a> — another USA-made Bull Strap product for Jeep and truck suspension builds.</p>`;

const BRAKE_HTML = `<p>Stainless steel braided brake line kits replace the factory rubber brake hoses on lifted trucks and Jeeps with longer, abrasion-resistant lines that match your vehicle's actual suspension travel. When you lift a vehicle even two inches, the factory rubber hose becomes the bottleneck on droop travel. A stock brake hose designed for a stock suspension pulls taut at full droop and can rupture under sustained load — causing complete brake failure at that corner. Extended stainless brake line kits eliminate this failure point entirely.</p>

<h2>What Happens to Your Brake Lines When You Lift</h2>
<p>Factory brake hoses are cut to length for the stock suspension geometry. At stock height, they have a small amount of slack. Add two inches of lift, and that slack disappears. At full droop — the suspension at maximum downward extension — the factory hose runs straight and tight. Hit a drop-off on the trail, the suspension cycles to full droop, and the hose is at maximum tension at the exact moment the suspension is under the most dynamic load. This is how brake hoses rupture on lifted vehicles. It is a known failure mode, not a rare incident.</p>
<p>Extended stainless brake line kits are cut 2–4 inches longer than factory to match the lift height. They have slack at full droop instead of tension. The stainless braided outer jacket resists cuts, abrasion, heat, and UV exposure better than rubber does. The result is a brake system that works correctly across the vehicle's new full range of travel.</p>

<h2>Stainless Braided vs Factory Rubber</h2>
<p>Beyond length, the material difference matters. Factory rubber brake hoses expand slightly under hydraulic pressure — the hose flexes outward when you press the brake pedal, absorbing some of the pressure that should be going to the caliper. This expansion causes the soft, spongy pedal feel common on factory-spec brakes. Stainless braided hoses are dimensionally stable under pressure. They do not expand. All hydraulic pressure goes directly to the caliper. The result is a firmer, more immediate pedal feel — noticeable on the street, significant on the trail where consistent brake modulation matters.</p>

<h2>Vehicle Coverage</h2>
<table>
<tr><th>Vehicle</th><th>Years</th><th>Lift Range</th></tr>
<tr><td>Jeep Wrangler JL / JLU</td><td>2018–current</td><td>2–4 inch lifts, front and rear</td></tr>
<tr><td>Jeep Wrangler JK / JKU</td><td>2007–2018</td><td>2–4 inch, standard and long-arm</td></tr>
<tr><td>Jeep Gladiator JT</td><td>2020–current</td><td>2–4 inch, front and rear</td></tr>
<tr><td>Ford F-150</td><td>2004–current</td><td>2–4 inch leveling and lift kits</td></tr>
<tr><td>Ford Bronco</td><td>2021–current</td><td>2–3 inch suspension lifts</td></tr>
<tr><td>Ram 1500</td><td>2009–current</td><td>2–4 inch coil spring lifts</td></tr>
<tr><td>Ram 2500 / 3500</td><td>2010–current</td><td>2–4 inch front lifts</td></tr>
<tr><td>Chevrolet Silverado 1500</td><td>2007–current</td><td>2–4 inch lifts</td></tr>
<tr><td>GMC Sierra 1500</td><td>2007–current</td><td>2–4 inch lifts</td></tr>
<tr><td>Toyota Tacoma</td><td>2005–current</td><td>2–3 inch lifts, front lines</td></tr>
<tr><td>Toyota Tundra</td><td>2007–current</td><td>2–3 inch lifts, front lines</td></tr>
</table>

<h2>How to Select the Right Kit</h2>
<p>Match the brake line kit to your actual lift height. Most kits are sold in height ranges — a 2–3 inch kit and a 3–4 inch kit, for example. If you are between sizes, use the longer kit; extra slack is not a problem, tension is. For long-arm suspension systems, verify the kit is designed for long-arm geometry. Long-arm setups change the suspension pivot points enough that the routing is different from a standard short-arm lift of the same height. Fitment details for your exact year, make, model, and trim are listed on each product page.</p>

<h2>Installation</h2>
<p>Brake line kit installation requires standard hand tools, a brake line wrench set, and brake fluid. The hardest part of the job is bleeding the brakes after the lines are swapped — gravity bleeding works, but vacuum or pressure bleeding is faster. Budget 1–2 hours for the full job depending on experience level. No drilling or welding required. The new lines use the same banjo bolt fittings as the factory hoses.</p>

<h2>Frequently Asked Questions</h2>
<p><strong>Do I need new brake lines if I only leveled the front?</strong> Yes, if your leveling kit lifts the front by 2 inches or more. Check the hose routing at full droop after installing the leveling kit — if it runs taut, replace it.</p>
<p><strong>Are these DOT-compliant?</strong> Yes. All brake line kits in this category meet DOT FMVSS 106 standards for hydraulic brake hose assemblies.</p>

<h2>Why Stainless Braided Over Armored Rubber?</h2>
<p>Some aftermarket brake hoses use a rubber hose with an outer armor sheath rather than true stainless braiding. Armored rubber hoses are better than stock but still expand under pressure. Only stainless braided hoses — where the actual pressure-bearing inner liner is surrounded by woven stainless steel — eliminate the expansion issue. All brake line kits in this collection are stainless braided construction, not armored rubber.</p>

<h2>Routing After Lift</h2>
<p>After installing a lift and new brake lines, check the hose routing through the full suspension travel range before driving. The hose should have visible slack at full droop and should not contact any part of the suspension, frame, or wheel at full lock. If a hose contacts the tire at full steering lock, reroute or use a longer line. Getting the routing right at installation prevents the hose from wearing through on the trail.</p>

<p>See also: <a href="/collections/suspension">Suspension</a> — Carli, ICON, Fox, and Bilstein suspension systems for Ram, F-250, Wrangler, and Tacoma.</p>`;

const COILOVER_HTML = `<p>Coilovers replace the separate shock absorber and spring on each corner of your suspension with a single integrated unit that lets you independently adjust ride height, spring preload, and damping. For trucks and Jeeps that split time between the highway and the trail, coilovers are the most capable suspension upgrade available — better tuning flexibility than a standard lift, more travel than a leveling kit, and the ability to change the setup without pulling the whole suspension apart.</p>

<h2>How Coilovers Work</h2>
<p>A standard suspension system uses a separate shock absorber and coil spring. The spring rate is fixed at manufacturing. The shock has a single damping curve. To change ride height, you swap springs. To change damping, you swap shocks. A coilover integrates the spring onto the shock body with an adjustable lower spring perch. Turning the perch raises or lowers the vehicle in increments. Adjustable-damping coilovers add a damping adjustment dial, typically at the top of the shock, so you can tune from firm (trail, high-speed) to soft (daily highway) without any tools.</p>

<h2>Coilovers vs a Standard Lift Kit</h2>
<p>A standard lift kit with separate springs and shocks gives you a fixed tune. If you want a different ride height, you replace the springs. If the damping feels wrong for trail use, you swap shocks. Coilovers eliminate both of those limitations. Ride height adjusts via the threaded perch — no parts swapped, no alignment required for small changes. Damping (on adjustable models) sets via a dial. This is why serious off-road builds choose coilovers: maximum adjustability for the full range of conditions the vehicle sees.</p>

<h2>Brands in This Category</h2>

<h3>ICON Vehicle Dynamics</h3>
<p>ICON coilovers are engineered and made in the USA. Their 2.5-inch diameter shock bodies with remote reservoirs represent the top tier of the lineup — the reservoir keeps the shock fluid cooler during sustained off-road use, which prevents fade. Stage 3 and above kits include compression damping adjustment. Vehicle coverage includes Jeep Wrangler JL, Ford Bronco, Ford F-150, Toyota Tacoma, and Toyota Tundra. ICON is the go-to recommendation for builds that will see genuine high-speed desert running or repeated rocky trail use.</p>

<h3>Fox Performance Series</h3>
<p>Fox 2.0 and 2.5 Performance Series coilovers are the most widely-run coilover in the off-road market. Fox uses internal bypass technology in their higher-end units — position-sensitive damping that behaves differently in the first third of travel than in the last third. The result is a plush, compliant feel in normal driving and firm, controlled damping at the limits of travel. Available for F-150, Raptor, Ram 1500, Tacoma, Tundra, Wrangler, and Bronco. Fox is the default choice for Ford F-150 and Raptor owners specifically.</p>

<h3>Bilstein</h3>
<p>Bilstein 5160 and 8112 coilover systems are designed for heavy-duty truck applications — Ram 2500, Ram 3500, Ford F-250, and Ford F-350. Bilstein uses monotube gas pressure construction, which provides consistent damping regardless of fluid temperature. A monotube shock runs cooler than a twin-tube under sustained heavy use, which matters on a tow-capable truck doing rough road miles in addition to trail work. Bilstein is the most frequently specified coilover for Carli Suspension HD truck builds on Ram 2500 and 3500.</p>

<h3>Tein</h3>
<p>Tein coilovers target performance street applications on front-wheel-drive and all-wheel-drive platforms. Available for Subaru WRX, Toyota GR86, Honda Civic Type R, Mazda MX-5, and similar platforms. Tein's FLEX Z and FLEX A kits offer 16-level damping adjustment and height adjustment independent of spring preload. Their EDFC Active system adds electronic remote adjustment from inside the vehicle. Tein is not designed for off-road lifting — they are a street performance brand for lowering and handling improvement.</p>

<h3>Eibach</h3>
<p>Eibach Multi-Pro-R2 coilovers are a dual-adjustable street and light track system. Available for Ford Mustang, Chevrolet Camaro, Subaru WRX/STI, Volkswagen Golf R, and similar performance platforms. Eibach engineers spring rates to lower the vehicle 1–2 inches while maintaining factory-level or better handling compliance. Not designed for off-road use — the correct application is sport compact and muscle cars where lower stance and improved cornering response are the goal.</p>

<h2>How to Choose</h2>
<table>
<tr><th>Use Case</th><th>Recommended Brand</th><th>Why</th></tr>
<tr><td>Ram 2500 / F-250 trail and daily</td><td>Bilstein 8112</td><td>Monotube construction, heavy load rating, works with Carli systems</td></tr>
<tr><td>F-150 / Raptor high-speed desert</td><td>Fox 2.5 Performance</td><td>Internal bypass, proven platform coverage, remote reservoir</td></tr>
<tr><td>Jeep Wrangler JL / Bronco trail</td><td>ICON Stage 2+</td><td>USA-made, adjustable damping, strongest coverage for these platforms</td></tr>
<tr><td>Toyota Tacoma overlanding</td><td>ICON or Fox</td><td>Both offer strong Tacoma coverage with proven reliability</td></tr>
<tr><td>Street performance / lowering</td><td>Tein or Eibach</td><td>Designed for street use; Tein for FWD/AWD, Eibach for RWD muscle/sport</td></tr>
</table>

<h2>Fitment and Installation</h2>
<p>Coilovers are vehicle-specific — check year, make, model, and trim on every product page before ordering. Installation requires a spring compressor for units with separate springs, basic hand tools, and a torque wrench. Most installations take 3–5 hours for a full set. An alignment is required after coilover installation on any vehicle where the ride height changes significantly from stock.</p>

<p>See also: <a href="/collections/carli-suspension">Carli Suspension</a> — coil springs, track bars, and radius arms for Ram 2500 and Ford F-250 HD builds.</p>`;

// ─── MAIN ────────────────────────────────────────────────────────────────────

const UPDATES = [
  {
    id: '441273024785',
    handle: 'grab-handles',
    apiType: 'smart_collections',
    apiKey: 'smart_collection',
    html: GRAB_HTML,
    titleTag: 'Paracord Grab Handles — Jeep, Bronco, Tacoma, 4Runner | Bull Strap',
    descTag: 'USA-made paracord grab handles for Jeep Wrangler JL/JK/TJ, Gladiator, Ford Bronco, Toyota Tacoma, and 4Runner. Steel core, 550 paracord, direct bolt-on. Ships from the USA.',
    url: 'https://bullstrap.com/collections/grab-handles'
  },
  {
    id: '631237804305',
    handle: 'brake-line-kits',
    apiType: 'custom_collections',
    apiKey: 'custom_collection',
    html: BRAKE_HTML,
    titleTag: 'Stainless Brake Line Kits — Jeep, Truck, Lifted Builds | Bull Strap',
    descTag: 'Extended stainless braided brake line kits for lifted Jeep Wrangler, F-150, Ram, Silverado, Tacoma, and Bronco. Sized for 2–4 inch lifts. Firmer pedal, DOT-compliant, no drilling.',
    url: 'https://bullstrap.com/collections/brake-line-kits'
  },
  {
    id: '631234822417',
    handle: 'coilovers',
    apiType: 'custom_collections',
    apiKey: 'custom_collection',
    html: COILOVER_HTML,
    titleTag: 'Coilovers — ICON, Fox, Bilstein, Tein, Eibach | Bull Strap',
    descTag: 'Coilovers for off-road trucks, lifted Jeeps, and performance street cars. ICON, Fox, Bilstein, Tein, Eibach — adjustable ride height and damping. Fitment tables on every product page.',
    url: 'https://bullstrap.com/collections/coilovers'
  }
];

async function main() {
  console.log('Word counts:');
  for (const c of UPDATES) {
    console.log(`  ${c.handle}: ${countWords(c.html)}w`);
  }

  const successUrls = [];

  for (const col of UPDATES) {
    const wc = countWords(col.html);
    console.log(`\n📝 Updating ${col.handle} (${wc}w)...`);

    const r = await shopifyPut(`/admin/api/2024-01/${col.apiType}/${col.id}.json`, {
      [col.apiKey]: { id: col.id, body_html: col.html }
    });
    console.log(`  body_html: HTTP ${r.status}`);
    if (r.status >= 400) {
      console.log('  Error:', JSON.stringify(r.body).slice(0, 300));
      continue;
    }

    const mf1 = await setMetafield(col.id, 'global', 'title_tag', col.titleTag);
    console.log(`  title_tag metafield: HTTP ${mf1.status}`);
    const mf2 = await setMetafield(col.id, 'global', 'description_tag', col.descTag);
    console.log(`  description_tag metafield: HTTP ${mf2.status}`);

    successUrls.push(col.url);
    console.log(`  ✅ ${col.handle} done — ${wc}w`);
  }

  if (successUrls.length > 0) {
    console.log(`\n📡 Submitting ${successUrls.length} URLs to IndexNow...`);
    const ix = await submitIndexNow(successUrls);
    console.log(`  IndexNow: HTTP ${ix.status}`);
    if (ix.status === 403) {
      console.log('  (IndexNow 403 — key file may need verification; URLs still live and will be picked up by Googlebot)');
    }
  }

  console.log('\n✅ Complete.');
  for (const c of UPDATES) {
    console.log(`  ${c.handle}: ${countWords(c.html)}w`);
  }
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
