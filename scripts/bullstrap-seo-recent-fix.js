#!/usr/bin/env node
// Bull Strap SEO Recent-Fix — Near-real-time counter to DH2T sync
// Checks products updated since last run, rewrites title_tag, description_tag,
// body_html (fitment table), and image alt text.
// Lockfile guard prevents overlapping runs.

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.SHOPIFY_TOKEN_BULLSTRAP;
const SHOP = 'bull-strap-78.myshopify.com';
const STATE_FILE = path.join(__dirname, '..', 'memory', 'bullstrap-seo-recent-fix-state.json');
const LOCK_FILE = path.join(__dirname, '..', 'memory', 'bullstrap-seo-recent-fix.lock');
const DELAY_MS = 550;

function restReq(method, p, body) {
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

const BAD_ALT_SUFFIXES = [
  / - Performance Part - Image \d+$/i,
  / - OEM Replacement - Image \d+$/i,
  / - Genuine Part - Image \d+$/i,
  / - Bull Strap$/i,
  / - Image \d+$/i,
];
const IMG_LABELS = ['product view', 'alternate view', 'detail view', 'close-up view', 'installed view', 'package view', 'side view', 'rear view'];

// ─── SEO BUILDERS ───────────────────────────────────────────────────────────

function buildTitle(productTitle, vendor) {
  const cats = {
    'coil spring':'Coil Springs','leaf spring':'Leaf Springs','track bar':'Track Bar',
    'steering stabilizer':'Steering Stabilizer','bump stop':'Bump Stop','shackle':'Shackle',
    'radius arm':'Radius Arm','coilover':'Coilovers','lift kit':'Lift Kit','exhaust':'Exhaust',
    'intake':'Intake','seat cover':'Seat Covers','floor mat':'Floor Mats','floormat':'Floor Mats',
    'shock':'Shocks','bumper':'Bumper','suspension':'Suspension','leveling':'Leveling Kit',
    'skid plate':'Skid Plate','sway bar':'Sway Bar','ball joint':'Ball Joints',
    'control arm':'Control Arms','brake line':'Brake Lines','limit strap':'Limit Straps',
    'differential':'Differential Guard','tonneau':'Tonneau Cover',
    'running board':'Running Boards','nerf bar':'Nerf Bars','light bar':'Light Bar','winch':'Winch'
  };
  const t = productTitle.toLowerCase();
  const category = Object.entries(cats).find(([k]) => t.includes(k))?.[1] || null;
  const yearMatch = productTitle.match(/(\d{2,4}[-–]\d{2,4}|\d{4}\+)/i);
  const yearStr = yearMatch?.[0] || null;
  const vRe = vendor ? new RegExp('^' + vendor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*', 'i') : null;
  let base = productTitle.replace(/(\d{2,4}[-–]\d{2,4}|\d{4}\+)/gi, '').replace(vRe || /^$/, '').replace(/\s{2,}/g, ' ').trim();
  const bp = (vendor && vendor !== 'Bull Strap' && !base.toLowerCase().startsWith((vendor || '').toLowerCase())) ? vendor + ' ' : '';
  let title;
  if (category && yearStr) title = `${bp}${category} ${yearStr} | BullStrap`;
  else if (category) title = `${bp}${category} | BullStrap`;
  else { let tb = `${bp}${base}`; if (tb.length > 52) tb = tb.substring(0, 52).replace(/\s+\S*$/, ''); title = `${tb} | BullStrap`; }
  if (title.length > 65) title = title.substring(0, 65).replace(/\s+\S*$/, '') + ' | BullStrap';
  return title;
}

function parseFitment(tags) {
  const tagArray = Array.isArray(tags) ? tags : (tags || '').split(',').map(t => t.trim());
  const fitTags = tagArray.filter(t => t.startsWith('fits_'));
  const vehicleMap = {};
  for (const tag of fitTags) {
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

function fixImageAlt(alt, title, index) {
  if (!alt) return null;
  if (!BAD_ALT_SUFFIXES.some(r => r.test(alt))) return null;
  let cleanName = title.substring(0, 80);
  let label = IMG_LABELS[index] || ('view ' + (index + 1));
  let newAlt = cleanName + ' - ' + label;
  if (newAlt.length > 125) newAlt = cleanName.substring(0, 110) + ' - ' + label;
  return newAlt;
}

// ─── STATE / LOCK ────────────────────────────────────────────────────────────

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch (e) { return { lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), totalFixed: 0, totalImages: 0 }; }
}
function saveState(state) { fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); }
function lockExists() { return fs.existsSync(LOCK_FILE); }
function acquireLock() { fs.writeFileSync(LOCK_FILE, Date.now().toString()); }
function releaseLock() { try { fs.unlinkSync(LOCK_FILE); } catch (e) {} }

async function retryOnRateLimit(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const result = await fn();
    if (result && result.status === 429) { console.log('  Rate limited, waiting 5s...'); await sleep(5000); continue; }
    return result;
  }
  return null;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  if (lockExists()) { console.log('Lockfile exists — previous run still in progress. Exiting cleanly.'); process.exit(0); }
  acquireLock();

  try {
    const state = loadState();
    const lastRunISO = state.lastRun || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    console.log('Checking products updated since:', lastRunISO);

    // Save the new timestamp NOW before we start — so even if SIGTERM hits, we advance
    state.lastRun = new Date().toISOString();
    saveState(state);

    let runFixed = 0, runProcessed = 0, runImages = 0;

    const resp = await retryOnRateLimit(() =>
      restReq('GET', 'products.json?limit=250&updated_at_min=' + encodeURIComponent(lastRunISO) + '&fields=id,title,handle,vendor,product_type,images,tags,body_html,updated_at'));

    if (!resp || resp.status === 429) { console.error('Rate limited — could not fetch products'); releaseLock(); process.exit(1); }

    const products = JSON.parse(resp.body).products || [];
    console.log('Found ' + products.length + ' products updated since last run');

    if (products.length === 0) {
      state.lastRun = new Date().toISOString();
      saveState(state);
      releaseLock();
      return;
    }

    for (const product of products) {
      if (product.vendor === 'Bartact' || product.vendor === 'Bull Strap') continue;
      let didFix = false;

      // Fetch metafields
      await sleep(DELAY_MS);
      const mfResp = await retryOnRateLimit(() => restReq('GET', 'products/' + product.id + '/metafields.json?namespace=global'));
      if (!mfResp) continue;
      const allMf = JSON.parse(mfResp.body).metafields || [];
      const descMf = allMf.find(m => m.key === 'description_tag');
      const titleMf = allMf.find(m => m.key === 'title_tag');

      // title_tag
      const newTitle = buildTitle(product.title, product.vendor);
      if (newTitle) {
        await sleep(DELAY_MS);
        if (titleMf) {
          if (titleMf.value !== newTitle) {
            await retryOnRateLimit(() => restReq('PUT', 'products/' + product.id + '/metafields/' + titleMf.id + '.json',
              { metafield: { id: titleMf.id, value: newTitle, type: 'single_line_text_field' } }));
            didFix = true;
          }
        } else {
          await retryOnRateLimit(() => restReq('POST', 'products/' + product.id + '/metafields.json',
            { metafield: { namespace: 'global', key: 'title_tag', value: newTitle, type: 'single_line_text_field' } }));
          didFix = true;
        }
      }

      // description_tag
      const newDesc = buildFitmentDescription(product.title, product.vendor, product.tags);
      if (newDesc) {
        await sleep(DELAY_MS);
        if (descMf) {
          await retryOnRateLimit(() => restReq('PUT', 'products/' + product.id + '/metafields/' + descMf.id + '.json',
            { metafield: { id: descMf.id, value: newDesc, type: 'single_line_text_field' } }));
        } else {
          await retryOnRateLimit(() => restReq('POST', 'products/' + product.id + '/metafields.json',
            { metafield: { namespace: 'global', key: 'description_tag', value: newDesc, type: 'single_line_text_field' } }));
        }
        didFix = true;
      }

      // body_html — unique fitment table, overwrites DH2T generic version
      const newBody = buildUniqueBodyHtml(product.title, product.vendor, product.tags, product.body_html);
      if (newBody && newBody !== product.body_html) {
        await sleep(DELAY_MS);
        await retryOnRateLimit(() => restReq('PUT', 'products/' + product.id + '.json',
          { product: { id: product.id, body_html: newBody } }));
        didFix = true;
      }

      // image alt text
      if (product.images && product.images.length > 0) {
        for (let i = 0; i < product.images.length; i++) {
          const img = product.images[i];
          const newAlt = fixImageAlt(img.alt, product.title, i);
          if (newAlt) {
            await sleep(DELAY_MS);
            await retryOnRateLimit(() => restReq('PUT', 'products/' + product.id + '/images/' + img.id + '.json',
              { image: { id: img.id, alt: newAlt } }));
            runImages++;
            didFix = true;
          }
        }
      }

      if (didFix) { runFixed++; console.log('FIXED: ' + newTitle + ' | ' + product.vendor); }
      runProcessed++;
      // Save progress every 50 products so SIGTERM doesn't lose our place
      if (runProcessed % 50 === 0) {
        state.lastRun = product.updated_at || new Date().toISOString();
        saveState(state);
      }
    }

    state.lastRun = new Date().toISOString();
    state.totalFixed = (state.totalFixed || 0) + runFixed;
    state.totalImages = (state.totalImages || 0) + runImages;
    saveState(state);

    console.log('\n=== RECENT-FIX COMPLETE ===');
    console.log('Checked: ' + runProcessed + ' | Fixed: ' + runFixed + ' | Images: ' + runImages);
    console.log('Cumulative: ' + state.totalFixed + ' products, ' + state.totalImages + ' images');

    releaseLock();
  } catch (e) {
    console.error('Error:', e.message);
    releaseLock();
    process.exit(1);
  }
}

main().catch(e => { console.error('Fatal:', e.message); releaseLock(); process.exit(1); });
