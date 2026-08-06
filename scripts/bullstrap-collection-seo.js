#!/usr/bin/env node
// Bull Strap Collection SEO
// ============================================================
// WHAT THIS DOES:
//
// 1. Creates missing brand/category collection pages (Carli first)
// 2. Fixes title_tag and description_tag on ALL collection pages
// 3. Fixes collection body_html with real brand/vehicle/fitment content
// 4. Submits every collection URL to:
//    - Google Indexing API
//    - Bing IndexNow
//    - Yandex IndexNow
//
// WHY COLLECTION PAGES MATTER:
//   When someone searches "Carli suspension Ram 2500" they land on a
//   COLLECTION page, not a product page. Collection pages rank for
//   category-level searches. Right now they all have generic boilerplate
//   ("competitive prices, fast shipping") — zero SEO value.
//
// COLLECTION PRIORITY ORDER (mirrors priority sweep brands):
//   1. Carli Suspension (create if missing — our #1 brand)
//   2. All suspension collections (coilovers, lift kits, shocks, etc.)
//   3. Wheels & tires
//   4. Exterior
//   5. Interior
//   6. Everything else
//
// STATE FILE: memory/bullstrap-collection-seo-state.json
//   Saves per-collection — SIGTERM safe.
//
// CRON: runs every 60 minutes (collections change less often than products)
// ============================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.SHOPIFY_TOKEN_BULLSTRAP;
const SHOP = 'bull-strap-78.myshopify.com';
const INDEXNOW_KEY = 'b4f7e2a1c3d5f6789012345678a4b5c6';
const STATE_FILE = path.join(__dirname, '..', 'memory', 'bullstrap-collection-seo-state.json');
const LOCK_FILE = path.join(__dirname, '..', 'memory', 'bullstrap-collection-seo.lock');
const INDEXING_CREDS_FILE = path.join(__dirname, '..', 'sites', 'indexing-credentials', '.bullstrap-merchant-center-credentials.json');
const DELAY_MS = 600;
const MAX_PER_RUN = 30; // collections per run — slower than products, more API calls each
const INDEXING_DAILY_LIMIT = 195;

// ─── COLLECTION DEFINITIONS ─────────────────────────────────────────────────
// Collections to CREATE if missing, with full SEO content
// Carli first — always.

const COLLECTIONS_TO_CREATE = [
  {
    handle: 'carli-suspension',
    title: 'Carli Suspension',
    title_tag: 'Carli Suspension Parts — Ram 2500, Ram 3500, Ford F-250, F-350 | Bull Strap',
    description_tag: 'Carli Suspension coil springs, track bars, radius arms, bump stop drops, and steering stabilizers for 2014–2023 Ram 2500/3500 and 2005–2024 Ford F-250/F-350. Authorized Carli dealer.',
    body_html: `<h1>Carli Suspension — Authorized Dealer</h1>
<p>Bull Strap is an authorized Carli Suspension dealer carrying the complete Carli lineup for Ram 2500, Ram 3500, Ford F-250, and Ford F-350. Every Carli component is engineered specifically for HD trucks — not adapted from a lighter-duty platform.</p>

<h2>Carli Suspension for Ram 2500 &amp; Ram 3500</h2>
<p>Carli's Ram lineup covers 2014 through 2023 model years across all trim levels — Big Horn, Laramie, Laramie Longhorn, Limited, Lone Star, Power Wagon, Rebel, SLT, and Tradesman. Available components include:</p>
<ul>
<li>Rear coil springs (1" lift, multi-rate)</li>
<li>Bump stop drops (front and rear)</li>
<li>Fabricated leaf spring shackles</li>
<li>Adjustable track bars</li>
<li>Steering stabilizer kits</li>
<li>Radius arm drop brackets</li>
<li>Shocks and complete systems</li>
</ul>

<h2>Carli Suspension for Ford F-250 &amp; F-350 Super Duty</h2>
<p>The Super Duty lineup spans 2005 through current model years, covering XL, XLT, Lariat, King Ranch, Platinum, and Tremor trims. Carli components for the Super Duty include coil springs, track bars, radius arm drop brackets, steering stabilizers, and complete lift systems.</p>

<h2>Why Carli?</h2>
<p>Carli Suspension components are designed to work together as a complete system. Every component — coil springs, track bars, radius arms, bump stops — is engineered to complement each other for HD trucks that tow, haul, and go off-road.</p>

<h2>Fitment</h2>
<p>Every Carli product listing at Bull Strap includes a full compatibility table showing year, make, model, and trim level. Check the product page for your specific vehicle before ordering.</p>`,
    vendor_filter: 'Carli',
    tags_filter: null
  }
];

// ─── SEO CONTENT FOR EXISTING COLLECTIONS ───────────────────────────────────
// Keyed by handle fragment — first match wins

const COLLECTION_SEO = [
  // Suspension
  { match: 'carli', title_tag: 'Carli Suspension Parts — Ram 2500, F-250, F-350 | Bull Strap', description_tag: 'Shop Carli Suspension coil springs, track bars, radius arms, and bump stop drops for 2014–2023 Ram 2500/3500 and 2005–2024 Ford F-250/F-350. Authorized Carli dealer at Bull Strap.' },
  { match: 'coilover', title_tag: 'Coilovers — Adjustable Suspension for Trucks & Cars | Bull Strap', description_tag: 'Shop coilovers from BC Racing, KW, Eibach, Tein, and more. Full fitment tables by year, make, model, and trim. Find the right coilover kit for your truck or car at Bull Strap.' },
  { match: 'lift-kit', title_tag: 'Lift Kits — 2" to 6" Lifts for Trucks & SUVs | Bull Strap', description_tag: 'Shop lift kits from Rough Country, Fabtech, ReadyLift, Skyjacker, and more for Ford F-150, Ram 1500, Chevy Silverado, Jeep Wrangler, and Toyota Tacoma. Fitment by year and trim.' },
  { match: 'leveling', title_tag: 'Leveling Kits — Bolt-On Leveling for Trucks | Bull Strap', description_tag: 'Truck leveling kits for Ford F-150, Ram 1500, Chevy Silverado, GMC Sierra, Toyota Tundra, and Nissan Titan. Fits: 2004–2024 model years. Shop by vehicle at Bull Strap.' },
  { match: 'shock', title_tag: 'Shocks & Struts — Performance Replacements | Bull Strap', description_tag: 'Shop Bilstein, Fox, Rancho, and Monroe shocks and struts for trucks, SUVs, and off-road vehicles. Fitment by year, make, model, and trim at Bull Strap.' },
  { match: 'suspension', title_tag: 'Suspension Parts & Kits for Trucks & SUVs | Bull Strap', description_tag: 'Complete suspension parts and kits from Carli, ICON, Fox, Bilstein, Rancho, and Fabtech. Coil springs, track bars, control arms, sway bars — fitment by year and trim.' },
  { match: 'coil-spring', title_tag: 'Coil Springs — Lift & Replacement for Trucks | Bull Strap', description_tag: 'Coil springs for Ram 2500, Ford F-250, Jeep Wrangler, Toyota 4Runner, and more. Brands: Carli, Eibach, Dobinsons, Old Man Emu. Fitment by year, make, model, and trim.' },
  { match: 'track-bar', title_tag: 'Track Bars — Adjustable & Replacement | Bull Strap', description_tag: 'Adjustable and replacement track bars for lifted trucks and Jeeps. Brands: Carli, Synergy, Rough Country. Fits Ram 2500, Ford F-250, Jeep Wrangler JK/JL.' },
  { match: 'sway-bar', title_tag: 'Sway Bars & End Links — Handling Upgrades | Bull Strap', description_tag: 'Sway bars and end links from Eibach, Whiteline, and Moog for improved handling. Fitment by year, make, model, and trim at Bull Strap.' },
  { match: 'control-arm', title_tag: 'Control Arms — OEM Replacement & Upgraded | Bull Strap', description_tag: 'Control arms for trucks, SUVs, and cars. Brands: Moog, Dorman, Carli, ICON. Fitment by year, make, model, and trim. Shop at Bull Strap.' },
  { match: 'bump-stop', title_tag: 'Bump Stops — HD Truck Suspension | Bull Strap', description_tag: 'Bump stop drops and replacement bump stops for Ram 2500, Ford F-250, and lifted trucks. Brands: Carli, ICON, Fox. Fitment by year and trim at Bull Strap.' },
  // Wheels & Tires
  { match: 'wheel', title_tag: 'Wheels — Off-Road & Truck Wheels | Bull Strap', description_tag: 'Shop off-road and truck wheels from Method, Black Rhino, Fuel, KMC, and Moto Metal. Fitment by year, make, model, and trim at Bull Strap.' },
  { match: 'tire', title_tag: 'Tires — All-Terrain & Mud-Terrain | Bull Strap', description_tag: 'All-terrain and mud-terrain tires from Mickey Thompson, Nitto, Toyo, BFGoodrich, and Falken. Shop by size and fitment at Bull Strap.' },
  // Exterior
  { match: 'bumper', title_tag: 'Bumpers — Steel & Aluminum for Trucks | Bull Strap', description_tag: 'Front and rear bumpers from ARB, Warn, Smittybilt, and Ranch Hand. Fits Ford F-250, Ram 2500, Chevy Silverado, Jeep Wrangler. Fitment by year and trim at Bull Strap.' },
  { match: 'skid-plate', title_tag: 'Skid Plates — Underbody Protection | Bull Strap', description_tag: 'Skid plates and underbody armor for trucks, SUVs, and Jeeps. Brands: ARB, Smittybilt, Fishbone Offroad. Fitment by year, make, model, and trim.' },
  { match: 'running-board', title_tag: 'Running Boards & Nerf Bars | Bull Strap', description_tag: 'Running boards and nerf bars from AMP Research, N-Fab, Go Rhino, and Westin. Fits Ford F-150, Ram 1500, Chevy Silverado, GMC Sierra. Fitment by year and trim.' },
  { match: 'tonneau', title_tag: 'Tonneau Covers — Truck Bed Covers | Bull Strap', description_tag: 'Tonneau covers for Ford F-150, Ram 1500, Chevy Silverado, GMC Sierra, Toyota Tacoma, and Nissan Frontier. Roll-up, folding, and retractable styles at Bull Strap.' },
  // Interior
  { match: 'floor-mat', title_tag: 'Floor Mats — Custom Fit for Trucks & SUVs | Bull Strap', description_tag: 'Custom-fit floor mats from WeatherTech, 3D MAXpider, Husky Liners, and Covercraft. Fits by year, make, model, and trim. All-weather and carpet options at Bull Strap.' },
  { match: 'seat-cover', title_tag: 'Seat Covers — Custom Fit Truck & SUV | Bull Strap', description_tag: 'Custom-fit seat covers from Covercraft, Coverking, and CalTrend. Fits Ford F-150, Ram 1500, Chevy Silverado, Jeep Wrangler, and Toyota Tacoma by year and trim.' },
  // Default fallback
  { match: '', title_tag: null, description_tag: null } // skip if no match
];

// ─── HTTP HELPERS ────────────────────────────────────────────────────────────

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
    if (r && r.status === 429) { console.log('  Rate limited, waiting 8s...'); await sleep(8000); continue; }
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
  } catch (e) { console.log('  Google token error:', e.message); }
  return null;
}

async function submitGoogle(url, dailyCount) {
  if (dailyCount >= INDEXING_DAILY_LIMIT) return false;
  const token = await getGoogleToken();
  if (!token) return false;
  try {
    const body = JSON.stringify({ url, type: 'URL_UPDATED' });
    const opts = { hostname: 'indexing.googleapis.com', path: '/v3/urlNotifications:publish', method: 'POST', headers: { 'Authorization': '***' + token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } };
    const r = await new Promise((resolve, reject) => {
      const req = https.request(opts, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode })); });
      req.on('error', reject); req.write(body); req.end();
    });
    return r.status === 200;
  } catch (e) { return false; }
}

// ─── BING / YANDEX INDEXNOW ─────────────────────────────────────────────────

async function submitIndexNow(urls) {
  if (!urls.length) return;
  const body = JSON.stringify({ host: 'bullstrap.com', key: INDEXNOW_KEY, urlList: urls });
  const hosts = ['api.indexnow.org', 'yandex.com'];
  for (const host of hosts) {
    try {
      const opts = { hostname: host, path: host === 'yandex.com' ? '/indexnow' : '/indexnow', method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) } };
      await new Promise((resolve, reject) => {
        const req = https.request(opts, res => { res.resume(); res.on('end', resolve); });
        req.on('error', resolve); req.write(body); req.end();
      });
      console.log(`  IndexNow submitted ${urls.length} URLs to ${host}`);
    } catch (e) { /* non-fatal */ }
  }
}

// ─── STATE / LOCK ────────────────────────────────────────────────────────────

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch (e) { return { collectionIndex: 0, totalFixed: 0, totalIndexed: 0, dailyCount: 0, dailyDate: '', createdCollections: [], lastRun: null }; }
}
function saveState(s) { fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); }
function lockExists() { return fs.existsSync(LOCK_FILE); }
function acquireLock() { fs.writeFileSync(LOCK_FILE, Date.now().toString()); }
function releaseLock() { try { fs.unlinkSync(LOCK_FILE); } catch (e) {} }

// ─── METAFIELD UPSERT ────────────────────────────────────────────────────────

async function upsertCollectionMetafield(collectionId, key, value, existingMf) {
  const ex = existingMf.find(m => m.key === key && m.namespace === 'global');
  if (ex) {
    if (ex.value === value) return false;
    await retryOnRateLimit(() => shopifyReq('PUT', `custom_collections/${collectionId}/metafields/${ex.id}.json`,
      { metafield: { id: ex.id, value, type: 'single_line_text_field' } }));
  } else {
    await retryOnRateLimit(() => shopifyReq('POST', `custom_collections/${collectionId}/metafields.json`,
      { metafield: { namespace: 'global', key, value, type: 'single_line_text_field' } }));
  }
  return true;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  if (lockExists()) {
    const age = Date.now() - parseInt(fs.readFileSync(LOCK_FILE, 'utf8') || '0');
    if (age < 10 * 60 * 1000) { console.log('Locked. Exiting.'); process.exit(0); }
    releaseLock();
  }
  acquireLock();

  const state = loadState();
  const today = new Date().toISOString().slice(0, 10);
  if (state.dailyDate !== today) { state.dailyCount = 0; state.dailyDate = today; }

  // Save immediately — SIGTERM safe
  state.lastRun = new Date().toISOString();
  saveState(state);

  let processed = 0, fixed = 0, indexNowBatch = [];

  try {
    // ── Step 1: Create missing collections ──────────────────────────────────
    for (const col of COLLECTIONS_TO_CREATE) {
      if (state.createdCollections.includes(col.handle)) continue;

      // Check if it already exists
      const checkR = await retryOnRateLimit(() =>
        shopifyReq('GET', `custom_collections.json?handle=${col.handle}&fields=id,handle`));
      if (!checkR) continue;
      const existing = JSON.parse(checkR.body).custom_collections || [];

      if (existing.length === 0) {
        console.log(`Creating collection: ${col.handle}`);
        await sleep(DELAY_MS);
        const createR = await retryOnRateLimit(() =>
          shopifyReq('POST', 'custom_collections.json', {
            custom_collection: {
              title: col.title,
              handle: col.handle,
              body_html: col.body_html,
              published: true
            }
          }));
        if (!createR) continue;
        const newCol = JSON.parse(createR.body).custom_collection;
        if (!newCol) { console.log('  Failed to create'); continue; }

        // Set metafields
        await sleep(DELAY_MS);
        await retryOnRateLimit(() => shopifyReq('POST', `custom_collections/${newCol.id}/metafields.json`,
          { metafield: { namespace: 'global', key: 'title_tag', value: col.title_tag, type: 'single_line_text_field' } }));
        await sleep(DELAY_MS);
        await retryOnRateLimit(() => shopifyReq('POST', `custom_collections/${newCol.id}/metafields.json`,
          { metafield: { namespace: 'global', key: 'description_tag', value: col.description_tag, type: 'single_line_text_field' } }));

        console.log(`  ✓ Created ${col.handle} with SEO metafields`);

        // Auto-assign products by vendor if vendor_filter specified
        if (col.vendor_filter) {
          console.log(`  Assigning ${col.vendor_filter} products to collection...`);
          let assignSinceId = 0, assignedCount = 0;
          while (true) {
            await sleep(DELAY_MS);
            const pr = await retryOnRateLimit(() =>
              shopifyReq('GET', `products.json?limit=250&vendor=${encodeURIComponent(col.vendor_filter)}&since_id=${assignSinceId}&fields=id`));
            if (!pr) break;
            const prods = JSON.parse(pr.body).products || [];
            if (!prods.length) break;
            for (const prod of prods) {
              await sleep(200);
              await retryOnRateLimit(() =>
                shopifyReq('POST', 'collects.json', { collect: { product_id: prod.id, collection_id: newCol.id } }));
              assignedCount++;
              assignSinceId = prod.id;
            }
            if (prods.length < 250) break;
          }
          console.log(`  ✓ Assigned ${assignedCount} products to ${col.handle}`);
        }

        state.createdCollections.push(col.handle);
        saveState(state);

        // Submit to Google + IndexNow
        const url = `https://bullstrap.com/collections/${col.handle}`;
        await submitGoogle(url, state.dailyCount);
        state.dailyCount++;
        indexNowBatch.push(url);
        fixed++;
      } else {
        const existingCol = existing[0];
        // Check if collection exists but is empty — assign products
        if (col.vendor_filter && !state.createdCollections.includes(col.handle)) {
          await sleep(DELAY_MS);
          const collectsR = await retryOnRateLimit(() =>
            shopifyReq('GET', `collects.json?collection_id=${existingCol.id}&limit=1&fields=id`));
          const collectCount = JSON.parse(collectsR?.body || '{}').collects?.length || 0;
          if (collectCount === 0) {
            console.log(`Collection ${col.handle} exists but empty — assigning products...`);
            let assignSinceId = 0, assignedCount = 0;
            while (true) {
              await sleep(DELAY_MS);
              const pr = await retryOnRateLimit(() =>
                shopifyReq('GET', `products.json?limit=250&vendor=${encodeURIComponent(col.vendor_filter)}&since_id=${assignSinceId}&fields=id`));
              if (!pr) break;
              const prods = JSON.parse(pr.body).products || [];
              if (!prods.length) break;
              for (const prod of prods) {
                await sleep(200);
                await retryOnRateLimit(() =>
                  shopifyReq('POST', 'collects.json', { collect: { product_id: prod.id, collection_id: existingCol.id } }));
                assignedCount++;
                assignSinceId = prod.id;
              }
              if (prods.length < 250) break;
            }
            console.log(`  ✓ Assigned ${assignedCount} products to ${col.handle}`);
          } else {
            console.log(`Collection ${col.handle} already has products`);
          }
        }
        state.createdCollections.push(col.handle);
        saveState(state);
        console.log(`Collection ${col.handle} already exists`);
      }
    }

    // ── Step 2: Fix SEO on existing collections ──────────────────────────────
    const colsR = await retryOnRateLimit(() =>
      shopifyReq('GET', 'custom_collections.json?limit=250&fields=id,title,handle,body_html'));
    if (!colsR) { releaseLock(); return; }

    const allCols = JSON.parse(colsR.body).custom_collections || [];
    console.log(`\nTotal collections: ${allCols.length} | Starting at index: ${state.collectionIndex}`);

    const toProcess = allCols.slice(state.collectionIndex);

    for (const col of toProcess) {
      if (processed >= MAX_PER_RUN) break;

      // Find matching SEO config
      const seoConfig = COLLECTION_SEO.find(s => s.match && col.handle.includes(s.match));
      if (!seoConfig) {
        state.collectionIndex++;
        saveState(state);
        continue;
      }

      await sleep(DELAY_MS);
      const mfR = await retryOnRateLimit(() =>
        shopifyReq('GET', `custom_collections/${col.id}/metafields.json`));
      if (!mfR) continue;
      const mf = JSON.parse(mfR.body).metafields || [];

      let didFix = false;

      // Fix title_tag
      if (seoConfig.title_tag) {
        await sleep(DELAY_MS);
        const changed = await upsertCollectionMetafield(col.id, 'title_tag', seoConfig.title_tag, mf);
        if (changed) didFix = true;
      }

      // Fix description_tag
      if (seoConfig.description_tag) {
        await sleep(DELAY_MS);
        const changed = await upsertCollectionMetafield(col.id, 'description_tag', seoConfig.description_tag, mf);
        if (changed) didFix = true;
      }

      // Fix body_html if still generic boilerplate
      const body = col.body_html || '';
      const isBoilerplate = body.includes('competitive prices') || body.includes('fast shipping') ||
        body.includes('meet or exceed OEM') || body.includes('trusted manufacturers') ||
        body.length < 200;

      if (isBoilerplate && seoConfig.description_tag) {
        // Build a real description from the SEO config
        const newBody = `<p>${seoConfig.description_tag}</p>`;
        await sleep(DELAY_MS);
        await retryOnRateLimit(() => shopifyReq('PUT', `custom_collections/${col.id}.json`,
          { custom_collection: { id: col.id, body_html: newBody } }));
        didFix = true;
      }

      if (didFix) {
        fixed++;
        console.log(`FIXED: ${col.handle} — ${seoConfig.title_tag?.substring(0, 60)}`);
        // Submit to Google + batch for IndexNow
        const url = `https://bullstrap.com/collections/${col.handle}`;
        if (state.dailyCount < INDEXING_DAILY_LIMIT) {
          await submitGoogle(url, state.dailyCount);
          state.dailyCount++;
        }
        indexNowBatch.push(url);
      }

      state.collectionIndex++;
      processed++;
      saveState(state);
    }

    // Reset index when we reach the end
    if (state.collectionIndex >= allCols.length) {
      console.log('Full collection sweep complete — resetting for maintenance cycle');
      state.collectionIndex = 0;
      saveState(state);
    }

    // Submit IndexNow batch (Bing + Yandex)
    if (indexNowBatch.length > 0) {
      await submitIndexNow(indexNowBatch);
    }

    console.log(`\n=== COLLECTION SEO COMPLETE ===`);
    console.log(`Processed: ${processed} | Fixed: ${fixed} | Indexed: ${indexNowBatch.length}`);
    console.log(`Daily Google quota: ${state.dailyCount}/${INDEXING_DAILY_LIMIT}`);
    console.log(`Total fixed all-time: ${state.totalFixed + fixed}`);
    state.totalFixed = (state.totalFixed || 0) + fixed;
    saveState(state);

  } catch (e) {
    console.error('Error:', e.message);
  }

  releaseLock();
}

main().catch(e => { console.error('Fatal:', e.message); releaseLock(); process.exit(1); });
