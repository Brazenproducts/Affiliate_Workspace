#!/usr/bin/env node
// Bull Strap SEO Fixer — Fast GraphQL version
// Fixes: title_tag, description_tag, and image alt text
// Saves progress to state file for resume across runs
// Uses GraphQL for bulk reads (1 call per 50 products vs 3 calls per product)

const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = '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';
const SHOP = 'bull-strap-78.myshopify.com';
const STATE_FILE = path.join(__dirname, '..', 'memory', 'bullstrap-seo-fix-state.json');
const MAX_PER_RUN = 5000;
const DELAY_MS = 550; // Stay under 2 calls/sec

function restReq(method, p, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SHOP, path: '/admin/api/2024-01/' + p,
      method, headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' }
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 429) resolve({ status: 429, body: d });
        else resolve({ status: res.statusCode, body: d });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function graphql(query) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query });
    const opts = {
      hostname: SHOP, path: '/admin/api/2024-01/graphql.json', method: 'POST',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' }
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { resolve(null); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Template phrases to strip from descriptions
const TEMPLATE_PHRASES = [
  'premium quality guaranteed', 'fast shipping available', 'easy installation',
  'factory-grade quality', 'precision manufactured', 'engineered for durability',
  'direct fit replacement', 'perfect fit for your vehicle',
];

// Bad prefixes on titles
const BAD_PREFIXES = ['Direct Fit ', 'Heavy Duty ', 'Performance ', 'Replacement ', 'Aftermarket ', 'OEM '];

// Bad image alt suffixes from SEO app
const BAD_ALT_SUFFIXES = [
  / - Performance Part - Image \d+$/i,
  / - OEM Replacement - Image \d+$/i,
  / - Genuine Part - Image \d+$/i,
  / - Bull Strap$/i,
  / - Image \d+$/i,
];

// Image position labels for unique alt text
const IMG_LABELS = ['product view', 'alternate view', 'detail view', 'close-up view', 'installed view', 'package view', 'side view', 'rear view'];

function getCategorySuffix(title) {
  const tl = title.toLowerCase();
  if (tl.includes('exhaust') || tl.includes('muffler') || tl.includes('header') || tl.includes('cutout'))
    return 'Free shipping on orders over $99. Shop exhaust systems and upgrades.';
  if (tl.includes('suspension') || tl.includes('lift kit') || tl.includes('coilover') || tl.includes('shock'))
    return 'Expert fitment guides available. Shop suspension upgrades and lift kits.';
  if (tl.includes('brake') || tl.includes('rotor') || tl.includes('caliper') || tl.includes('pad'))
    return 'OE-spec and performance brake options. Free shipping on orders over $99.';
  if (tl.includes('air filter') || tl.includes('cold air') || tl.includes('intake') || tl.includes('airbox'))
    return 'Boost airflow and performance. Shop cold air intakes and filters.';
  if (tl.includes('fender') || tl.includes('bumper') || tl.includes('grille'))
    return 'Direct-fit exterior accessories. Free shipping on orders over $99.';
  if (tl.includes('tonneau') || tl.includes('bed cover') || tl.includes('truck bed'))
    return 'Multiple styles available. Shop truck bed covers and accessories.';
  if (tl.includes('winch') || tl.includes('recovery') || tl.includes('tow'))
    return 'Built for off-road reliability. Shop recovery gear and winches.';
  if (tl.includes('light') || tl.includes('led') || tl.includes('lamp'))
    return 'LED and auxiliary lighting options. Free shipping on orders over $99.';
  if (tl.includes('seat') && !tl.includes('bartact'))
    return 'Comfort and protection upgrades. Shop seat covers and accessories.';
  if (tl.includes('steering') || tl.includes('tie rod'))
    return 'Restore precision handling. Shop steering components and upgrades.';
  if (tl.includes('differential') || tl.includes('gear') || tl.includes('axle'))
    return 'Performance and replacement drivetrain parts. Free shipping over $99.';
  if (tl.includes('radiator') || tl.includes('cooling') || tl.includes('thermostat'))
    return 'Keep your engine running cool. Shop cooling system parts.';
  if (tl.includes('oil') || tl.includes('filter') || tl.includes('fluid'))
    return 'Keep your vehicle running right. Shop fluids and filters.';
  if (tl.includes('wheel') || tl.includes('tire') || tl.includes('spacer'))
    return 'Perfect fitment guaranteed. Shop wheels and tire accessories.';
  if (tl.includes('hose') || tl.includes('clamp') || tl.includes('fitting'))
    return 'Quality parts, fast shipping. Shop hoses and fittings.';
  if (tl.includes('armor') || tl.includes('skid') || tl.includes('guard'))
    return 'Built for the trail. Shop armor and underbody protection.';
  if (tl.includes('roof') || tl.includes('rack') || tl.includes('cargo'))
    return 'Maximize your hauling capacity. Shop roof racks and cargo systems.';
  return 'Free shipping on orders over $99. Top brands and fast delivery.';
}

function fixDescription(currentDesc, title) {
  if (!currentDesc) return null;
  const hasTemplate = TEMPLATE_PHRASES.some(p => currentDesc.toLowerCase().includes(p));
  if (!hasTemplate) return null;

  let newDesc = currentDesc;
  for (const phrase of TEMPLATE_PHRASES) {
    newDesc = newDesc.replace(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\.?\\s*', 'gi'), '');
  }
  newDesc = newDesc.trim();
  if (newDesc.length < 80) {
    newDesc = newDesc + (newDesc.endsWith('.') ? ' ' : '. ') + getCategorySuffix(title);
  }
  if (newDesc.length > 155) newDesc = newDesc.substring(0, 152) + '...';
  return newDesc;
}

function fixTitle(currentTitle, vendor) {
  if (!currentTitle) return null;
  let newTitle = currentTitle;
  let changed = false;
  for (const prefix of BAD_PREFIXES) {
    if (newTitle.startsWith(prefix)) { newTitle = newTitle.substring(prefix.length); changed = true; break; }
  }
  // Add vendor/brand name if not already present and fits (NOT "Bull Strap" — that's the store, not the brand)
  if (vendor && !newTitle.includes(vendor) && newTitle.length + vendor.length + 3 < 60) {
    newTitle += ' | ' + vendor;
    changed = true;
  }
  if (newTitle.length > 60) newTitle = newTitle.substring(0, 57) + '...';
  return changed ? newTitle : null;
}

function fixImageAlt(alt, title, index) {
  if (!alt) return null;
  let needsFix = BAD_ALT_SUFFIXES.some(r => r.test(alt));
  if (!needsFix) return null;

  // Build clean alt: short product name + position label
  let cleanName = title.substring(0, 80);
  let label = IMG_LABELS[index] || ('view ' + (index + 1));
  let newAlt = cleanName + ' - ' + label;
  if (newAlt.length > 125) newAlt = cleanName.substring(0, 110) + ' - ' + label;
  return newAlt;
}

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch (e) { return { sinceId: 0, totalFixed: 0, totalProcessed: 0, imagesFixed: 0, completed: false }; }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function retryOnRateLimit(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const result = await fn();
    if (result && result.status === 429) {
      console.log('  Rate limited, waiting 5s...');
      await sleep(5000);
      continue;
    }
    return result;
  }
  return null;
}

async function main() {
  const state = loadState();
  if (state.completed) { console.log('All done! Total fixed:', state.totalFixed); return; }

  // Reset state since SEO app just re-ran everything
  if (process.env.RESET_STATE === '1') {
    console.log('Resetting state — starting from scratch');
    state.sinceId = 0; state.totalFixed = 0; state.totalProcessed = 0; state.imagesFixed = 0; state.completed = false;
  }

  let { sinceId, totalFixed, totalProcessed, imagesFixed } = state;
  imagesFixed = imagesFixed || 0;
  let runFixed = 0, runSkipped = 0, runProcessed = 0, runImages = 0;
  console.log('Resuming from since_id:', sinceId, '| Total fixed:', totalFixed, '| Images fixed:', imagesFixed);

  while (runProcessed < MAX_PER_RUN) {
    const resp = await retryOnRateLimit(() =>
      restReq('GET', 'products.json?limit=250&since_id=' + sinceId + '&fields=id,title,handle,vendor,product_type,images'));
    if (!resp || resp.status === 429) { console.log('Persistent rate limit, saving and exiting'); break; }
    const data = JSON.parse(resp.body);
    if (!data.products || data.products.length === 0) {
      console.log('No more products — ALL DONE!');
      saveState({ sinceId, totalFixed: totalFixed + runFixed, totalProcessed: totalProcessed + runProcessed, imagesFixed: imagesFixed + runImages, completed: true });
      break;
    }

    for (const product of data.products) {
      if (product.vendor === 'Bartact' || product.vendor === 'Bull Strap') { runSkipped++; continue; }

      let didFix = false;

      // --- Fix description ---
      await sleep(DELAY_MS);
      const mfResp = await retryOnRateLimit(() =>
        restReq('GET', 'products/' + product.id + '/metafields.json?namespace=global'));
      if (!mfResp) continue;
      const mfData = JSON.parse(mfResp.body);
      const allMf = mfData.metafields || [];
      const descMf = allMf.find(m => m.key === 'description_tag');
      const titleMf = allMf.find(m => m.key === 'title_tag');

      const newDesc = fixDescription(descMf?.value, product.title);
      const newTitle = fixTitle(titleMf?.value, product.vendor);

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

      if (newTitle && titleMf) {
        await sleep(DELAY_MS);
        await retryOnRateLimit(() => restReq('PUT', 'products/' + product.id + '/metafields/' + titleMf.id + '.json',
          { metafield: { id: titleMf.id, value: newTitle, type: 'single_line_text_field' } }));
        didFix = true;
      }

      // --- Fix image alt text ---
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

      if (didFix) runFixed++;
      else runSkipped++;
    }

    sinceId = data.products[data.products.length - 1].id;
    runProcessed += data.products.length;
    console.log('Batch done: processed ' + runProcessed + ' | fixed ' + runFixed + ' | images ' + runImages + ' | skipped ' + runSkipped + ' | since_id ' + sinceId);

    if (runFixed % 50 === 0 && runFixed > 0) {
      console.log('Run: ' + runFixed + ' products fixed, ' + runImages + ' images | Total: ' + (totalFixed + runFixed) + ' products, ' + (imagesFixed + runImages) + ' images | Processed: ' + (totalProcessed + runProcessed));
      saveState({ sinceId, totalFixed: totalFixed + runFixed, totalProcessed: totalProcessed + runProcessed, imagesFixed: imagesFixed + runImages, completed: false });
    }
  }

  saveState({ sinceId, totalFixed: totalFixed + runFixed, totalProcessed: totalProcessed + runProcessed, imagesFixed: imagesFixed + runImages, completed: false });
  console.log('\n=== RUN COMPLETE ===');
  console.log('This run: ' + runFixed + ' products, ' + runImages + ' images fixed');
  console.log('Cumulative: ' + (totalFixed + runFixed) + ' products, ' + (imagesFixed + runImages) + ' images');
  console.log('Next since_id:', sinceId);
}

main().catch(e => console.error('Error:', e.message));
