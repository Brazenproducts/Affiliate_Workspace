#!/usr/bin/env node
// Bull Strap Priority Category Sweep
// ============================================================
// WHAT THIS DOES (read this before touching anything):
//
// Processes Turn14 products in category priority order so Google
// builds topical authority for bullstrap.com one category at a time.
//
// For each product it writes:
//   1. title_tag metafield   — "Brand Category Year | Bull Strap"
//   2. description_tag       — fitment + ALL trim levels from DH2T tags
//   3. body_html             — unique fitment table (year/make/model/trim)
//                              replaces DH2T generic content
//   4. image alt text        — descriptive, keyword-rich
//
// Then immediately submits the product URL to Google Indexing API
// so Google crawls the fresh unique content ASAP.
//
// CATEGORY ORDER:
//   Phase 1: Suspension (Carli, ICON, Fox, Bilstein, Rancho, Fabtech,
//             Skyjacker, SuperLift, Zone Offroad, Old Man Emu, ARB,
//             Eibach, KW, Tein, Whiteline, Moog, ReadyLift, Rough Country,
//             Dobinsons, King)
//   Phase 2: Lift Kits (same brands, different product types)
//   Phase 3: Wheels & Tires
//   Phase 4: Exterior (bumpers, skid plates, armor, running boards)
//   Phase 5: Interior (seat covers, floor mats, cargo)
//   Phase 6: Everything else
//
// WHY THIS ORDER:
//   Mitch is an authorized Carli dealer. Suspension is the highest-value
//   category. Google needs to associate bullstrap.com with suspension
//   before it will trust us for other categories. Do NOT change the order
//   without understanding this.
//
// STATE FILE: memory/bullstrap-priority-sweep-state.json
//   { phase, brandIndex, sinceId, totalFixed, totalIndexed, lastRun }
//   Saves after every product — SIGTERM safe.
//
// INDEXING API:
//   Uses the same credentials as bullstrap-full-indexing.js
//   File: sites/indexing-credentials/.bullstrap-merchant-center-credentials.json
//   Quota: 199 URLs/day. Script tracks daily count and stops at 195 to leave buffer.
//
// CRON: runs every 15 minutes via cron job bullstrap-priority-sweep
// DO NOT run alongside bullstrap-fix-turn14-seo.js — they will conflict.
// The recent-fix cron (bullstrap-seo-recent-fix.js) is separate and fine to run.
// ============================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.SHOPIFY_TOKEN_BULLSTRAP;
const SHOP = 'bull-strap-78.myshopify.com';
const STATE_FILE = path.join(__dirname, '..', 'memory', 'bullstrap-priority-sweep-state.json');
const LOCK_FILE = path.join(__dirname, '..', 'memory', 'bullstrap-priority-sweep.lock');
const INDEXING_CREDS_FILE = path.join(__dirname, '..', 'sites', 'indexing-credentials', '.bullstrap-merchant-center-credentials.json');
const DELAY_MS = 600;
const MAX_PER_RUN = 200; // products per 15-min cron run
const INDEXING_DAILY_LIMIT = 195; // leave buffer below Google's 199/day quota

// ─── CATEGORY PHASES ────────────────────────────────────────────────────────

const PHASES = [
  {
    name: 'Phase 1 — Suspension',
    brands: ['Carli','ICON','Fox','Bilstein','Rancho','Fabtech','Skyjacker','SuperLift',
             'Zone Offroad','Old Man Emu','ARB','Eibach','KW','Tein','Whiteline','Moog',
             'ReadyLift','Rough Country','Dobinsons','King']
  },
  {
    name: 'Phase 2 — Wheels & Tires',
    brands: ['Method Race Wheels','Black Rhino','Fuel','KMC','Moto Metal','Pro Comp',
             'Mickey Thompson','BFGoodrich','Nitto','Toyo','Falken','Cooper','Goodyear']
  },
  {
    name: 'Phase 3 — Exterior',
    brands: ['ARB','Warn','Smittybilt','Rugged Ridge','Bestop','Bushwacker','Lund',
             'Westin','AMP Research','N-Fab','Go Rhino','Ranch Hand','Iron Cross']
  },
  {
    name: 'Phase 4 — Interior',
    brands: ['Covercraft','WeatherTech','3D MAXpider','Husky Liners','Lloyd Mats',
             'Coverking','Neoprene','CalTrend','Katzkin']
  },
  {
    name: 'Phase 5 — Performance',
    brands: ['K&N','aFe','Banks Power','BD Diesel','PPE','EFI Live','Mishimoto',
             'Mishimoto','Injen','Borla','Magnaflow','Flowmaster','Gibson','MBRP']
  },
  {
    name: 'Phase 6 — Everything Else',
    brands: ['__ALL_REMAINING__'] // special token — processes all non-Bartact/Bull Strap vendors
  }
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

function googleReq(method, hostname, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname, path, method,
      headers: {
        'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json',
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

async function retryOnRateLimit(fn, maxRetries = 4) {
  for (let i = 0; i < maxRetries; i++) {
    const result = await fn();
    if (result && result.status === 429) {
      console.log('  Rate limited, waiting 8s...');
      await sleep(8000);
      continue;
    }
    return result;
  }
  return null;
}

// ─── GOOGLE INDEXING API ─────────────────────────────────────────────────────

let _googleToken = null;
let _googleTokenExpiry = 0;

async function getGoogleToken() {
  if (_googleToken && Date.now() < _googleTokenExpiry) return _googleToken;
  try {
    const creds = JSON.parse(fs.readFileSync(INDEXING_CREDS_FILE, 'utf8'));
    const body = new URLSearchParams({
      client_id: creds.client_id, client_secret: creds.client_secret,
      refresh_token: creds.refresh_token, grant_type: 'refresh_token'
    }).toString();
    const opts = {
      hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
    };
    const resp = await new Promise((resolve, reject) => {
      const req = https.request(opts, res => {
        let d = ''; res.on('data', c => d += c);
        res.on('end', () => resolve(JSON.parse(d)));
      });
      req.on('error', reject);
      req.write(body); req.end();
    });
    if (resp.access_token) {
      _googleToken = resp.access_token;
      _googleTokenExpiry = Date.now() + 55 * 60 * 1000; // 55 min
      return _googleToken;
    }
  } catch (e) {
    console.log('  Google token error:', e.message);
  }
  return null;
}

async function submitToIndexingAPI(url, dailyCount) {
  if (dailyCount >= INDEXING_DAILY_LIMIT) return false;
  const token = await getGoogleToken();
  if (!token) return false;
  try {
    const r = await googleReq('POST', 'indexing.googleapis.com', '/v3/urlNotifications:publish',
      { url, type: 'URL_UPDATED' }, token);
    return r.status === 200;
  } catch (e) {
    return false;
  }
}

// ─── SEO BUILDERS ───────────────────────────────────────────────────────────

function buildTitle(productTitle, vendor) {
  const cats = {
    'coil spring':'Coil Springs','leaf spring':'Leaf Springs','track bar':'Track Bar',
    'steering stabilizer':'Steering Stabilizer','bump stop':'Bump Stop','shackle':'Shackle',
    'radius arm':'Radius Arm','coilover':'Coilovers','lift kit':'Lift Kit',
    'leveling kit':'Leveling Kit','leveling':'Leveling Kit','exhaust':'Exhaust',
    'intake':'Intake','seat cover':'Seat Covers','floor mat':'Floor Mats',
    'floormat':'Floor Mats','shock':'Shocks','strut':'Struts','bumper':'Bumper',
    'suspension':'Suspension','skid plate':'Skid Plate','sway bar':'Sway Bar',
    'ball joint':'Ball Joints','control arm':'Control Arms','brake line':'Brake Lines',
    'limit strap':'Limit Straps','differential':'Differential Guard',
    'tonneau':'Tonneau Cover','running board':'Running Boards','nerf bar':'Nerf Bars',
    'light bar':'Light Bar','winch':'Winch','wheel':'Wheels','tire':'Tires',
    'air filter':'Air Filter','cold air':'Cold Air Intake','intercooler':'Intercooler',
    'catch can':'Catch Can','programmer':'Tuner','tuner':'Tuner'
  };
  const t = productTitle.toLowerCase();
  const category = Object.entries(cats).find(([k]) => t.includes(k))?.[1] || null;
  const yearMatch = productTitle.match(/(\d{2,4}[-–]\d{2,4}|\d{4}\+)/i);
  const yearStr = yearMatch?.[0] || null;
  const vRe = vendor ? new RegExp('^' + vendor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*', 'i') : null;
  let base = productTitle
    .replace(/(\d{2,4}[-–]\d{2,4}|\d{4}\+)/gi, '')
    .replace(vRe || /^$/, '')
    .replace(/\s{2,}/g, ' ').trim();
  const bp = (vendor && vendor !== 'Bull Strap' && !base.toLowerCase().startsWith((vendor || '').toLowerCase())) ? vendor + ' ' : '';
  let title;
  if (category && yearStr) title = `${bp}${category} ${yearStr} | Bull Strap`;
  else if (category) title = `${bp}${category} | Bull Strap`;
  else {
    let tb = `${bp}${base}`;
    if (tb.length > 52) tb = tb.substring(0, 52).replace(/\s+\S*$/, '');
    title = `${tb} | Bull Strap`;
  }
  if (title.length > 65) title = title.substring(0, 65).replace(/\s+\S*$/, '') + ' | Bull Strap';
  return title;
}

function parseFitment(tags) {
  const tagArray = Array.isArray(tags) ? tags : (tags || '').split(',').map(t => t.trim());
  const vehicleMap = {};
  for (const tag of tagArray.filter(t => t.startsWith('fits_'))) {
    for (const entry of tag.replace('fits_', '').split('~')) {
      const parts = entry.split('`');
      if (parts.length >= 3) {
        const key = `${parts[1]}|${parts[2]}`;
        if (!vehicleMap[key]) vehicleMap[key] = { make: parts[1], model: parts[2], years: new Set(), trims: new Set() };
        vehicleMap[key].years.add(parts[0]);
        if (parts[3]) vehicleMap[key].trims.add(parts[3]);
      }
    }
  }
  return vehicleMap;
}

function yearRange(yearsSet) {
  const yrs = Array.from(yearsSet).sort();
  const nums = yrs.flatMap(y => y.split('-').map(n => n.trim())).filter(n => /^\d{4}$/.test(n)).map(Number);
  if (!nums.length) return yrs[0] || '';
  const mn = Math.min(...nums), mx = Math.max(...nums);
  return mn === mx ? String(mn) : `${mn}–${mx}`;
}

function buildFitmentDescription(productTitle, vendor, tags) {
  const vehicleMap = parseFitment(tags);
  const vehicleEntries = Object.entries(vehicleMap).slice(0, 3);
  const fitmentStr = vehicleEntries.map(([, v]) => `${yearRange(v.years)} ${v.make} ${v.model}`).join(', ');
  let trimStr = '';
  if (vehicleEntries.length > 0) {
    const trims = Array.from(vehicleEntries[0][1].trims).slice(0, 12);
    if (trims.length) trimStr = trims.join(', ');
  }
  const vRe = vendor ? new RegExp('^' + vendor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*', 'i') : null;
  const cleanTitle = vRe ? productTitle.replace(vRe, '').trim() : productTitle;
  const bp = vendor && vendor !== 'Bull Strap' ? vendor + ' ' : '';
  let desc = `${bp}${cleanTitle}`;
  if (fitmentStr) desc += ` — fits ${fitmentStr}`;
  if (trimStr) desc += `. Fits: ${trimStr}.`;
  if (desc.length > 255) desc = desc.substring(0, 252).replace(/\s+\S*$/, '') + '.';
  return desc;
}

function buildUniqueBodyHtml(productTitle, vendor, tags, existingBody) {
  const vehicleMap = parseFitment(tags);
  if (!Object.keys(vehicleMap).length) return null;
  let baseBody = (existingBody || '')
    .replace(/<p[^>]*>\s*<strong>Compatible Vehicles[\s\S]*$/i, '').trim()
    .replace(/<p[^>]*>This Part Fits:[^<]*<\/p>[\s\S]*/i, '').trim();
  let rows = '';
  for (const v of Object.values(vehicleMap)) {
    const yr = yearRange(v.years);
    const trimsArr = Array.from(v.trims).sort();
    if (trimsArr.length) {
      for (const trim of trimsArr) rows += `<tr><td>${yr}</td><td>${v.make}</td><td>${v.model}</td><td>${trim}</td></tr>\n`;
    } else {
      rows += `<tr><td>${yr}</td><td>${v.make}</td><td>${v.model}</td><td>All Trims</td></tr>\n`;
    }
  }
  return baseBody + `\n<p><strong>Compatible Vehicles — ${productTitle}</strong></p>\n<table>\n<thead><tr><th>Year</th><th>Make</th><th>Model</th><th>Trim</th></tr></thead>\n<tbody>\n${rows}</tbody>\n</table>`;
}

const BAD_ALT_SUFFIXES = [/ - Performance Part - Image \d+$/i, / - OEM Replacement - Image \d+$/i, / - Genuine Part - Image \d+$/i, / - Bull Strap$/i, / - Image \d+$/i];
const IMG_LABELS = ['product view', 'alternate view', 'detail view', 'close-up view', 'installed view', 'package view', 'side view', 'rear view'];

function fixImageAlt(alt, title, index) {
  if (!alt || !BAD_ALT_SUFFIXES.some(r => r.test(alt))) return null;
  let newAlt = title.substring(0, 80) + ' - ' + (IMG_LABELS[index] || 'view ' + (index + 1));
  if (newAlt.length > 125) newAlt = title.substring(0, 110) + ' - ' + (IMG_LABELS[index] || 'view ' + (index + 1));
  return newAlt;
}

// ─── STATE / LOCK ────────────────────────────────────────────────────────────

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch (e) {
    return {
      phase: 0, brandIndex: 0, sinceId: 0,
      totalFixed: 0, totalIndexed: 0,
      dailyCount: 0, dailyDate: '',
      lastRun: null, completedPhases: []
    };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function lockExists() { return fs.existsSync(LOCK_FILE); }
function acquireLock() { fs.writeFileSync(LOCK_FILE, Date.now().toString()); }
function releaseLock() { try { fs.unlinkSync(LOCK_FILE); } catch (e) {} }

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  if (lockExists()) {
    const lockAge = Date.now() - parseInt(fs.readFileSync(LOCK_FILE, 'utf8') || '0');
    if (lockAge < 10 * 60 * 1000) { console.log('Locked — previous run in progress. Exiting.'); process.exit(0); }
    console.log('Stale lock detected (>10min), removing...');
    releaseLock();
  }
  acquireLock();

  const state = loadState();

  // Reset daily indexing count if new day
  const today = new Date().toISOString().slice(0, 10);
  if (state.dailyDate !== today) { state.dailyCount = 0; state.dailyDate = today; }

  // Check if all phases complete
  if (state.phase >= PHASES.length) {
    console.log('All phases complete! Resetting to phase 0 for maintenance sweep.');
    state.phase = 0; state.brandIndex = 0; state.sinceId = 0;
  }

  const currentPhase = PHASES[state.phase];
  const currentBrand = currentPhase.brands[state.brandIndex];

  console.log(`\n=== ${currentPhase.name} ===`);
  console.log(`Brand: ${currentBrand} | sinceId: ${state.sinceId}`);
  console.log(`Daily indexing: ${state.dailyCount}/${INDEXING_DAILY_LIMIT}`);

  // Save state immediately so SIGTERM doesn't repeat same work
  state.lastRun = new Date().toISOString();
  saveState(state);

  let processed = 0, fixed = 0, indexed = 0;

  try {
    // Build query
    let query = 'products.json?limit=50&since_id=' + state.sinceId +
      '&fields=id,title,handle,vendor,product_type,images,tags,body_html,updated_at';
    if (currentBrand !== '__ALL_REMAINING__') {
      query += '&vendor=' + encodeURIComponent(currentBrand);
    }

    const resp = await retryOnRateLimit(() => shopifyReq('GET', query));
    if (!resp) { console.log('No response from Shopify'); releaseLock(); return; }

    const products = JSON.parse(resp.body).products || [];
    console.log(`Fetched ${products.length} products`);

    if (products.length === 0) {
      // This brand is done — advance to next brand
      state.brandIndex++;
      state.sinceId = 0;
      if (state.brandIndex >= currentPhase.brands.length) {
        // Phase complete — advance to next phase
        console.log(`✓ ${currentPhase.name} complete!`);
        state.completedPhases = state.completedPhases || [];
        state.completedPhases.push(currentPhase.name);
        state.phase++;
        state.brandIndex = 0;
        state.sinceId = 0;
      } else {
        console.log(`→ Next brand: ${currentPhase.brands[state.brandIndex]}`);
      }
      saveState(state);
      releaseLock();
      return;
    }

    for (const product of products) {
      if (processed >= MAX_PER_RUN) break;
      if (product.vendor === 'Bartact' || product.vendor === 'Bull Strap') {
        state.sinceId = product.id;
        continue;
      }

      let didFix = false;

      // Fetch metafields
      await sleep(DELAY_MS);
      const mfResp = await retryOnRateLimit(() => shopifyReq('GET', 'products/' + product.id + '/metafields.json?namespace=global'));
      if (!mfResp) continue;
      const allMf = JSON.parse(mfResp.body).metafields || [];
      const titleMf = allMf.find(m => m.key === 'title_tag');
      const descMf = allMf.find(m => m.key === 'description_tag');

      // 1. title_tag
      const newTitle = buildTitle(product.title, product.vendor);
      if (newTitle) {
        await sleep(DELAY_MS);
        if (titleMf) {
          if (titleMf.value !== newTitle) {
            await retryOnRateLimit(() => shopifyReq('PUT', 'products/' + product.id + '/metafields/' + titleMf.id + '.json',
              { metafield: { id: titleMf.id, value: newTitle, type: 'single_line_text_field' } }));
            didFix = true;
          }
        } else {
          await retryOnRateLimit(() => shopifyReq('POST', 'products/' + product.id + '/metafields.json',
            { metafield: { namespace: 'global', key: 'title_tag', value: newTitle, type: 'single_line_text_field' } }));
          didFix = true;
        }
      }

      // 2. description_tag
      const newDesc = buildFitmentDescription(product.title, product.vendor, product.tags);
      if (newDesc) {
        await sleep(DELAY_MS);
        if (descMf) {
          if (descMf.value !== newDesc) {
            await retryOnRateLimit(() => shopifyReq('PUT', 'products/' + product.id + '/metafields/' + descMf.id + '.json',
              { metafield: { id: descMf.id, value: newDesc, type: 'single_line_text_field' } }));
            didFix = true;
          }
        } else {
          await retryOnRateLimit(() => shopifyReq('POST', 'products/' + product.id + '/metafields.json',
            { metafield: { namespace: 'global', key: 'description_tag', value: newDesc, type: 'single_line_text_field' } }));
          didFix = true;
        }
      }

      // 3. body_html — unique fitment table, beats DH2T every time
      const newBody = buildUniqueBodyHtml(product.title, product.vendor, product.tags, product.body_html);
      if (newBody && newBody !== product.body_html) {
        await sleep(DELAY_MS);
        await retryOnRateLimit(() => shopifyReq('PUT', 'products/' + product.id + '.json',
          { product: { id: product.id, body_html: newBody } }));
        didFix = true;
      }

      // 4. image alt text
      if (product.images && product.images.length > 0) {
        for (let i = 0; i < Math.min(product.images.length, 4); i++) {
          const img = product.images[i];
          const newAlt = fixImageAlt(img.alt, product.title, i);
          if (newAlt) {
            await sleep(DELAY_MS);
            await retryOnRateLimit(() => shopifyReq('PUT', 'products/' + product.id + '/images/' + img.id + '.json',
              { image: { id: img.id, alt: newAlt } }));
            didFix = true;
          }
        }
      }

      // 5. Submit to Google Indexing API immediately
      if (product.handle && state.dailyCount < INDEXING_DAILY_LIMIT) {
        const url = `https://bullstrap.com/products/${product.handle}`;
        const submitted = await submitToIndexingAPI(url, state.dailyCount);
        if (submitted) { state.dailyCount++; indexed++; }
        await sleep(200);
      }

      if (didFix) {
        fixed++;
        console.log(`FIXED: ${newTitle}`);
      }

      state.sinceId = product.id;
      state.totalFixed = (state.totalFixed || 0) + (didFix ? 1 : 0);
      state.totalIndexed = (state.totalIndexed || 0) + (indexed > 0 ? 1 : 0);
      processed++;

      // Hard save every product — SIGTERM safe
      saveState(state);
    }

    console.log(`\nRun complete: processed=${processed} fixed=${fixed} indexed=${indexed}`);
    console.log(`Total: fixed=${state.totalFixed} indexed=${state.totalIndexed}`);
    console.log(`Daily indexing quota used: ${state.dailyCount}/${INDEXING_DAILY_LIMIT}`);

  } catch (e) {
    console.error('Error:', e.message);
  }

  saveState(state);
  releaseLock();
}

main().catch(e => { console.error('Fatal:', e.message); releaseLock(); process.exit(1); });
