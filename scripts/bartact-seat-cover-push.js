#!/usr/bin/env node
// bartact-seat-cover-push.js
// Fixes the 3 critical seat cover ranking problems:
// 1. ford-bronco-seat-covers collection — rebuild/publish with full SEO content
// 2. jeep-wrangler-jl-seat-covers — retarget title/H1 to parent keyword
// 3. jeep-wrangler-seat-covers (parent) — strengthen as the primary "jeep wrangler seat covers" page
// Run with: node bartact-seat-cover-push.js <NEW_TOKEN>

const fs = require('fs');

const env = {};
fs.readFileSync('/home/ubuntu/.openclaw/workspace/.env','utf8').split('\n').forEach(l=>{
  const[k,...v]=l.split('='); if(k&&v.length) env[k.trim()]=v.join('=').trim();
});

// Accept token from CLI arg or env
const token = process.argv[2] || env.SHOPIFY_TOKEN_BARTACT;
if (!token || token.length < 10) { console.error('❌ No valid token. Usage: node bartact-seat-cover-push.js shpat_NEW_TOKEN'); process.exit(1); }

const SHOP = 'bartact.myshopify.com';

// ─── REUSABLE HELPER — call after every collection write ─────────────────────
async function verifyPublished(type, id, handle) {
  const apiType = type === 'smart' ? 'smart_collections' : 'custom_collections';
  const r = await fetch(`https://${SHOP}/admin/api/2024-01/${apiType}/${id}.json?fields=id,handle,published_at`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const d = await r.json();
  const coll = d.smart_collection || d.custom_collection;
  if (!coll) { console.warn(`  ⚠️ verifyPublished: could not fetch ${type}/${id}`); return false; }
  if (coll.published_at) { console.log(`  ✅ verified published: ${handle || id}`); return true; }
  console.warn(`  ⚠️ ${handle || id} is unpublished after write — auto-republishing...`);
  const body = type === 'smart'
    ? JSON.stringify({ smart_collection:  { id, published: true } })
    : JSON.stringify({ custom_collection: { id, published: true } });
  const pr = await fetch(`https://${SHOP}/admin/api/2024-01/${apiType}/${id}.json`, {
    method: 'PUT',
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
    body
  });
  if (pr.ok) { console.log(`  ✅ republished: ${handle || id}`); return true; }
  console.error(`  ❌ republish failed: HTTP ${pr.status}`);
  return false;
}
const API = 'https://bartact.myshopify.com/admin/api/2024-01';
const INDEXNOW_KEY = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';

async function shopifyGet(path) {
  const r = await fetch(`${API}${path}`, { headers: { 'X-Shopify-Access-Token': token } });
  return r.json();
}

// GraphQL helper — required for SEO meta on smart_collections (REST doesn't expose seo fields)
async function gql(query, variables = {}) {
  const r = await fetch(`https://${SHOP}/admin/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const d = await r.json();
  if (d.errors) throw new Error('GraphQL errors: ' + JSON.stringify(d.errors));
  return d;
}

async function shopifyPut(path, body) {
  const r = await fetch(`${API}${path}`, {
    method: 'PUT',
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const d = await r.json();
  if (d.errors) throw new Error(JSON.stringify(d.errors));
  return d;
}

async function shopifyPost(path, body) {
  const r = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const d = await r.json();
  if (d.errors) throw new Error(JSON.stringify(d.errors));
  return d;
}

// ─────────────────────────────────────────────
// CONTENT DEFINITIONS
// ─────────────────────────────────────────────

const BRONCO_SEAT_COVERS_BODY = `<h2>Ford Bronco Seat Covers — Custom-Cut, Not Universal Fit</h2>
<p>Bartact's Ford Bronco seat covers are engineered specifically for the 2021–2026 Ford Bronco 2-door and 4-door — not cut-to-fit universal covers that leave gaps, bunch up, or slip off the first time you go off-road. Every cover is custom-patterned to your exact Bronco trim, so installation takes minutes and the fit is perfect out of the box.</p>

<h2>Built for Open-Air Driving</h2>
<p>The Bronco was designed to run doorless, topless, and deep in the dirt. Your seat covers need to keep up. Bartact uses <strong>400D and 1000D Cordura nylon</strong> — the same material trusted by the U.S. military — so your covers handle mud, water, UV exposure, and trail debris without fading, cracking, or absorbing odors. Unlike neoprene, Cordura breathes in the heat and won't stiffen in the cold.</p>

<h2>Seat Cover Options for Your Bronco</h2>
<ul>
  <li><strong>Cordura 400D</strong> — Lightweight, flexible, and highly abrasion-resistant. Best for mixed on/off-road use where packability matters.</li>
  <li><strong>Cordura 1000D</strong> — Heavy-duty mil-spec fabric. Maximum durability for serious off-road builds and daily drivers that see real trail abuse.</li>
  <li><strong>MOLLE Panel Integration</strong> — Select Bronco seat covers include integrated MOLLE webbing on the seat backs, turning dead space into organized gear storage.</li>
</ul>

<h2>Fitment Guide — 2021–2026 Ford Bronco</h2>
<p>Bartact Bronco seat covers fit the following configurations:</p>
<ul>
  <li>2021 Ford Bronco — Base, Big Bend, Black Diamond, Outer Banks, Badlands, Wildtrak, First Edition (2-door &amp; 4-door)</li>
  <li>2022 Ford Bronco — all trim levels (2-door &amp; 4-door)</li>
  <li>2023 Ford Bronco — all trim levels including Raptor (2-door &amp; 4-door)</li>
  <li>2024 Ford Bronco — all trim levels (2-door &amp; 4-door)</li>
  <li>2025 Ford Bronco — all trim levels (2-door &amp; 4-door)</li>
  <li>2026 Ford Bronco — all trim levels (2-door &amp; 4-door)</li>
</ul>
<p><strong>Important:</strong> The 2021–2026 Ford Bronco full-size uses the same seat design across all model years and trim levels. Bartact covers fit every year identically — no year-specific variants needed. Confirm 2-door vs. 4-door at checkout for the correct rear seat cover.</p>
<p>Not sure which version you need? <a href="/pages/contact">Contact us</a> with your year, trim, and whether you have heated seats — we'll confirm fitment before you order.</p>

<h2>Why Bartact Beats Every Other Bronco Seat Cover Brand</h2>
<p>Most seat cover brands sell the same cover for 30 different vehicles. Bartact only sells covers designed for your specific vehicle. Here's what that means in practice:</p>
<ul>
  <li>✅ Headrest covers included — no bare factory headrest sticking out</li>
  <li>✅ Airbag-compatible side seams that don't block deployment</li>
  <li>✅ Seat heater pass-through compatible on equipped trims</li>
  <li>✅ Bottom bolster coverage for trail entry/exit wear</li>
  <li>✅ Berry Amendment compliant — made in the USA with domestic materials</li>
</ul>

<h2>Installation</h2>
<p>No tools required. Bartact Bronco seat covers install with a hook-and-loop system and seat-back straps that cinch tight and stay put — even when you're crawling rocks or bouncing through whoops. Most owners complete the full install in under 30 minutes.</p>

<h2>Frequently Asked Questions</h2>
<dl>
  <dt>Do Bartact seat covers work with heated seats?</dt>
  <dd>Yes. Bartact covers are thin enough that heat transfers through normally. We do not recommend thick neoprene covers for heated seats — Cordura is the better choice.</dd>
  <dt>Will these fit a Bronco Raptor?</dt>
  <dd>Yes — Bartact seat covers fit the 2023–2024 Bronco Raptor. The Raptor uses the same front seat as the standard Bronco across most trims. Confirm your seat configuration at checkout.</dd>
  <dt>Can I run the Bronco doorless with these covers?</dt>
  <dd>Absolutely. Cordura is UV-stable and water-resistant, so doorless and topless driving is exactly what these covers are built for. A quick shake or rinse gets trail dust and light mud off immediately.</dd>
  <dt>Are these machine washable?</dt>
  <dd>Yes. Remove the covers, cold wash on gentle cycle, hang dry. Do not use high heat — it can loosen the hook-and-loop attachment points.</dd>
  <dt>How do Bartact covers compare to Smittybilt or Rough Country?</dt>
  <dd>Smittybilt and Rough Country sell universal-fit covers in neoprene or polyester. Bartact covers are custom-patterned to the Bronco, use military-spec Cordura fabric, and are made in the USA. The fit, durability, and finish are not comparable.</dd>
</dl>

<p><strong>Shop Ford Bronco seat covers below</strong> — filter by trim, color, and fabric to find your exact build.</p>`;

const BRONCO_SEO_TITLE = 'Ford Bronco Seat Covers — Custom-Cut 2021–2026 | Bartact';
const BRONCO_SEO_DESC = 'Custom-cut Ford Bronco seat covers for 2021–2026 (2-door & 4-door). Same seat design across all 6 model years. Mil-spec Cordura 400D/1000D, Made in USA, airbag-compatible. Not universal — fits your Bronco exactly.';

// ─────────────────────────────────────────────
// Jeep Wrangler seat covers parent page (id 275720732715, custom)
// Primary target: "jeep wrangler seat covers" / "jeep seat covers"
// ─────────────────────────────────────────────
const JW_PARENT_BODY = `<h2>Jeep Wrangler Seat Covers — Every Generation, Custom-Cut</h2>
<p>Bartact makes Jeep Wrangler seat covers for every generation on the road today — JL (2018–2024), JK (2007–2018), TJ (1997–2006), and YJ (1987–1995). Every cover is custom-patterned to your specific Wrangler, not a universal cut-to-fit that bunches, slips, or leaves the headrests bare.</p>

<h2>Made for the Way Wranglers Are Actually Driven</h2>
<p>Wranglers go doorless. They go topless. They go through rivers and over rocks. Off-the-shelf seat covers fail fast in those conditions — neoprene holds heat, polyester abrades, and stitching fails at the seams. Bartact uses <strong>400D and 1000D Cordura nylon</strong> — the same fabric spec used in U.S. military load-bearing gear — so your covers are built for exactly this kind of abuse.</p>

<h2>Which Wrangler Seat Covers Do You Need?</h2>
<ul>
  <li><a href="/collections/jeep-wrangler-jl-seat-covers"><strong>Jeep Wrangler JL/JLU Seat Covers</strong></a> — Fits 2018–2026 Wrangler 2-door and 4-door (Unlimited). Includes Sport, Sahara, Rubicon, Willys, Xtreme Recon, and 4xe trims. Note: 4xe edition uses a dedicated rear bench cover — select 4xe at checkout.</li>
  <li><a href="/collections/jeep-wrangler-jk-seat-covers"><strong>Jeep Wrangler JK/JKU Seat Covers</strong></a> — Fits 2007–2018 Wrangler 2-door and 4-door (Unlimited).</li>
  <li><a href="/collections/jeep-gladiator-seat-covers"><strong>Jeep Gladiator (JT) Seat Covers</strong></a> — Fits 2020–2024 Gladiator Sport, Mojave, Rubicon, and Willys.</li>
</ul>

<h2>Material Options</h2>
<ul>
  <li><strong>Cordura 400D</strong> — Lightweight, flexible, breathable. Best everyday driver with trail capability.</li>
  <li><strong>Cordura 1000D</strong> — Mil-spec heavy duty. Built for serious builds that see constant trail abuse.</li>
  <li><strong>MOLLE Seat Back Panels</strong> — Patent-pending MOLLE webbing integrated into the seat back. Turns dead space into organized gear storage with any standard MOLLE pouch.</li>
</ul>

<h2>Why Bartact vs. the Other Brands</h2>
<ul>
  <li>✅ <strong>Invented by Bartact</strong> — Bartact pioneered the paracord grab handle and MOLLE seat cover category for Jeep. We don't follow trends, we set them.</li>
  <li>✅ <strong>Custom-cut, not universal</strong> — Patterned to your exact Wrangler generation, trim, and seat configuration</li>
  <li>✅ <strong>Made in USA</strong> — Berry Amendment compliant, domestic Cordura</li>
  <li>✅ <strong>Airbag-compatible</strong> — Side seams engineered to allow proper airbag deployment</li>
  <li>✅ <strong>Heated seat compatible</strong> — Cordura transmits heat normally, unlike thick neoprene</li>
</ul>

<h2>Frequently Asked Questions</h2>
<dl>
  <dt>What's the best seat cover for a Jeep Wrangler?</dt>
  <dd>For off-road and open-air use, Cordura Nylon is the best material — it's UV-resistant, abrasion-resistant, breathable, and machine washable. Neoprene holds heat and retains odors after trail use. Bartact's custom-fit Cordura covers are the top choice for serious Wrangler owners.</dd>
  <dt>Do Bartact seat covers fit JL and JK?</dt>
  <dd>No — JL and JK have different seat shapes and mounting points. Bartact makes separate custom covers for each generation. Make sure to select the right year when ordering.</dd>
  <dt>Are these compatible with heated and ventilated seats?</dt>
  <dd>Yes. Bartact Cordura covers are thin enough to allow heated seat function. We do not recommend neoprene for heated seats.</dd>
  <dt>Can I install these myself?</dt>
  <dd>Yes — hook-and-loop fastening system, no tools required. Most installs take 20–30 minutes for the full set.</dd>
  <dt>Do they come with headrest covers?</dt>
  <dd>Yes. Bartact seat cover sets include headrest covers for a complete, finished look.</dd>
</dl>

<p><strong>Select your Wrangler generation above</strong> to find your exact cover.</p>`;

const JW_PARENT_SEO_TITLE = 'Jeep Wrangler Seat Covers — JL, JK, TJ Custom-Cut | Bartact';
const JW_PARENT_SEO_DESC = 'Custom-cut Jeep Wrangler seat covers for JL (2018–2026), JK (2007–2018), and TJ. Mil-spec Cordura, Made in USA, airbag-compatible. Invented by Bartact — not universal fit.';

// ─────────────────────────────────────────────
// JL seat covers — retarget to capture "jeep wrangler seat covers" searches
// id: 688526164011 (smart collection)
// ─────────────────────────────────────────────
const JL_SEO_TITLE = 'Jeep Wrangler Seat Covers — JL/JLU 2018–2026 Custom Fit | Bartact';
const JL_SEO_DESC = 'Jeep Wrangler JL & JLU seat covers for 2018–2026. Custom-cut Cordura 400D/1000D, Made in USA, airbag-compatible, heated & ventilated seat-ready. Fits Sport, Sahara, Rubicon, Willys & 4xe.';

// ─────────────────────────────────────────────
// PUSH FUNCTIONS
// ─────────────────────────────────────────────

// Correct Bronco smart collection ID: 265140207659 (was wrong as 688526098475)
const BRONCO_COLLECTION_GID = 'gid://shopify/Collection/265140207659';

async function fixBroncoCollection() {
  console.log('\n📦 Fixing ford-bronco-seat-covers collection...');

  // REST for body_html + published (seo fields not available via REST on smart collections)
  const sc = await shopifyGet('/smart_collections/265140207659.json?fields=id,handle,title,published_at,body_html');
  const col = sc.smart_collection;

  if (!col) {
    console.error('  ❌ Collection 265140207659 not found in smart_collections');
    return false;
  }

  console.log('  Found: ' + col.handle + ' | published: ' + (col.published_at ? 'YES' : 'NO'));

  // REST update for body_html + published
  await shopifyPut('/smart_collections/265140207659.json', {
    smart_collection: {
      id: 265140207659,
      title: 'Ford Bronco Seat Covers',
      body_html: BRONCO_SEAT_COVERS_BODY,
      published: true
    }
  });

  // GraphQL update for seo_title + seo_description (REST doesn't expose these on smart_collections)
  await gql(`
    mutation collectionUpdate($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection { id seo { title description } }
        userErrors { field message }
      }
    }`, {
    input: {
      id: BRONCO_COLLECTION_GID,
      seo: { title: BRONCO_SEO_TITLE, description: BRONCO_SEO_DESC }
    }
  });

  console.log('  ✅ ford-bronco-seat-covers body + SEO title updated + published');
  return true;
}

async function fixJWParentCollection() {
  console.log('\n📦 Fixing jeep-wrangler-seat-covers (parent) collection...');
  
  const cc = await shopifyGet('/custom_collections/275720732715.json?fields=id,handle,title,body_html,seo_title,seo_description');
  const col = cc.custom_collection;
  
  if (!col) {
    console.error('  ❌ Collection 275720732715 not found in custom_collections');
    return false;
  }
  
  console.log('  Found: ' + col.handle);
  
  const update = {
    custom_collection: {
      id: 275720732715,
      title: 'Jeep Wrangler Seat Covers',
      body_html: JW_PARENT_BODY,
      seo_title: JW_PARENT_SEO_TITLE,
      seo_description: JW_PARENT_SEO_DESC
    }
  };
  
  await shopifyPut('/custom_collections/275720732715.json', update);
  console.log('  ✅ jeep-wrangler-seat-covers (parent) updated');
  return true;
}

async function fixJLSeoMeta() {
  console.log('\n📦 Fixing jeep-wrangler-jl-seat-covers SEO title/description...');
  
  const sc = await shopifyGet('/smart_collections/688526164011.json?fields=id,handle,title,seo_title,seo_description');
  const col = sc.smart_collection;
  
  if (!col) {
    console.error('  ❌ JL collection 688526164011 not found');
    return false;
  }
  
  console.log('  Current seo_title: ' + col.seo_title);
  
  const update = {
    smart_collection: {
      id: 688526164011,
      seo_title: JL_SEO_TITLE,
      seo_description: JL_SEO_DESC
    }
  };
  
  await shopifyPut('/smart_collections/688526164011.json', update);
  console.log('  ✅ JL seo_title + seo_description updated');
  return true;
}

async function submitIndexNow(urls) {
  console.log('\n🔍 Submitting to IndexNow...');
  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ host: 'www.bartact.com', key: INDEXNOW_KEY, urlList: urls })
  });
  console.log('  IndexNow status: ' + r.status);
}

async function main() {
  console.log('🚀 Bartact Seat Cover SEO Push');
  console.log('Token: ' + token.substring(0,12) + '...');
  
  // Verify token works
  const test = await shopifyGet('/shop.json?fields=name');
  if (test.errors) {
    console.error('❌ Token invalid: ' + JSON.stringify(test.errors));
    process.exit(1);
  }
  console.log('✅ Token valid — shop: ' + test.shop.name);
  
  const results = {
    bronco: await fixBroncoCollection(),
    jwParent: await fixJWParentCollection(),
    jlMeta: await fixJLSeoMeta()
  };
  
  const urlsToIndex = [];
  if (results.bronco) {
    urlsToIndex.push('https://www.bartact.com/collections/ford-bronco-seat-covers');
  }
  if (results.jwParent) {
    urlsToIndex.push('https://www.bartact.com/collections/jeep-wrangler-seat-covers');
  }
  if (results.jlMeta) {
    urlsToIndex.push('https://www.bartact.com/collections/jeep-wrangler-jl-seat-covers');
  }
  
  if (urlsToIndex.length > 0) {
    await submitIndexNow(urlsToIndex);
  }
  
  console.log('\n✅ Done. Summary:');
  console.log('  ford-bronco-seat-covers: ' + (results.bronco ? 'FIXED + PUBLISHED' : 'FAILED'));
  console.log('  jeep-wrangler-seat-covers (parent): ' + (results.jwParent ? 'UPDATED' : 'FAILED'));
  console.log('  jeep-wrangler-jl-seat-covers (SEO meta): ' + (results.jlMeta ? 'UPDATED' : 'FAILED'));
  console.log('  IndexNow submitted: ' + urlsToIndex.length + ' URLs');
  
  // Save state
  fs.writeFileSync('/home/ubuntu/.openclaw/workspace/memory/bartact-seat-cover-push-state.json', JSON.stringify({
    date: new Date().toISOString(), results, urlsIndexed: urlsToIndex
  }, null, 2));
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
