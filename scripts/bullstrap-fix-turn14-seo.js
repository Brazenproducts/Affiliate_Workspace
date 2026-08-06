#!/usr/bin/env node
// Bull Strap SEO Fixer — Fast GraphQL version
// Fixes: title_tag, description_tag, and image alt text
// Saves progress to state file for resume across runs
// Uses GraphQL for bulk reads (1 call per 50 products vs 3 calls per product)

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.SHOPIFY_TOKEN_BULLSTRAP;
const SHOP = 'bull-strap-78.myshopify.com';
const STATE_FILE = path.join(__dirname, '..', 'memory', 'bullstrap-seo-fix-state.json');
const MAX_PER_RUN = 999999; // Run until complete or rate limited
const DELAY_MS = 250; // Stay under 2 calls/sec

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

// Category keywords for buyer-intent title suffixes
function getCategoryAction(title) {
  const tl = title.toLowerCase();
  if (tl.includes('exhaust') || tl.includes('muffler') || tl.includes('catback') || tl.includes('axle-back')) return 'Exhaust';
  if (tl.includes('coilover')) return 'Coilovers';
  if (tl.includes('lift kit') || tl.includes('leveling kit')) return 'Lift Kit';
  if (tl.includes('cold air intake') || tl.includes('air intake') || tl.includes('intake kit')) return 'Air Intake';
  if (tl.includes('air filter') || tl.includes('replacement filter')) return 'Air Filter';
  if (tl.includes('brake pad') || tl.includes('brake pads')) return 'Brake Pads';
  if (tl.includes('rotor') || tl.includes('brake rotor')) return 'Rotors';
  if (tl.includes('brake line') || tl.includes('brake hose')) return 'Brake Lines';
  if (tl.includes('shock') || tl.includes('strut')) return 'Shocks';
  if (tl.includes('suspension')) return 'Suspension';
  if (tl.includes('intercooler')) return 'Intercooler';
  if (tl.includes('downpipe') || tl.includes('down pipe')) return 'Downpipe';
  if (tl.includes('turbo')) return 'Turbo';
  if (tl.includes('supercharger')) return 'Supercharger';
  if (tl.includes('header') || tl.includes('manifold')) return 'Headers';
  if (tl.includes('fuel injector')) return 'Fuel Injectors';
  if (tl.includes('fuel pump')) return 'Fuel Pump';
  if (tl.includes('radiator')) return 'Radiator';
  if (tl.includes('oil cooler')) return 'Oil Cooler';
  if (tl.includes('differential') || tl.includes('diff cover')) return 'Differential';
  if (tl.includes('axle')) return 'Axle';
  if (tl.includes('driveshaft')) return 'Driveshaft';
  if (tl.includes('control arm')) return 'Control Arms';
  if (tl.includes('sway bar') || tl.includes('anti-roll')) return 'Sway Bar';
  if (tl.includes('wheel spacer')) return 'Wheel Spacers';
  if (tl.includes('skid plate') || tl.includes('armor')) return 'Skid Plate';
  if (tl.includes('bumper')) return 'Bumper';
  if (tl.includes('winch')) return 'Winch';
  if (tl.includes('light bar') || tl.includes('led bar')) return 'Light Bar';
  if (tl.includes('led') || tl.includes('light kit')) return 'Lights';
  if (tl.includes('seat cover')) return 'Seat Covers';
  if (tl.includes('floor mat') || tl.includes('floor liner')) return 'Floor Mats';
  if (tl.includes('tonneau') || tl.includes('bed cover')) return 'Tonneau Cover';
  if (tl.includes('roof rack') || tl.includes('cargo rack')) return 'Roof Rack';
  if (tl.includes('tow hitch') || tl.includes('trailer hitch')) return 'Tow Hitch';
  if (tl.includes('spark plug')) return 'Spark Plugs';
  if (tl.includes('ignition coil')) return 'Ignition Coils';
  if (tl.includes('battery')) return 'Battery';
  if (tl.includes('alternator')) return 'Alternator';
  if (tl.includes('gauge') || tl.includes('meter')) return 'Gauges';
  if (tl.includes('catch can') || tl.includes('oil separator')) return 'Catch Can';
  if (tl.includes('blow off') || tl.includes('bypass valve') || tl.includes('bov')) return 'BOV';
  if (tl.includes('tune') || tl.includes('ecu') || tl.includes('tuner')) return 'Tune';
  return null;
}

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

function buildFitmentDescription(productTitle, vendor, tags) {
  // Parse fitment from DH2T tags: fits_YEAR`Make`Model`Trim~...
  // REST API returns tags as comma-separated string; GraphQL returns array
  const tagArray = Array.isArray(tags) ? tags : (tags || '').split(',').map(t => t.trim());
  const fitTags = tagArray.filter(t => t.startsWith('fits_'));

  // Build make/model => {years, trims} map
  const vehicleMap = {};
  for (const tag of fitTags) {
    for (const entry of tag.replace('fits_', '').split('~')) {
      const parts = entry.split('`');
      if (parts.length >= 3) {
        const key = `${parts[1]} ${parts[2]}`;
        if (!vehicleMap[key]) vehicleMap[key] = { years: new Set(), trims: new Set() };
        vehicleMap[key].years.add(parts[0]);
        if (parts[3]) vehicleMap[key].trims.add(parts[3]);
      }
    }
  }

  const vehicleEntries = Object.entries(vehicleMap).slice(0, 3);

  // Year range per vehicle
  const fitmentStr = vehicleEntries.map(([makeModel, data]) => {
    const yrs = Array.from(data.years).sort();
    const yearRange = yrs[0] + (yrs.length > 1 ? '-' + yrs[yrs.length - 1].slice(-2) : '');
    return `${yearRange} ${makeModel}`;
  }).join(', ');

  // Trim levels from first vehicle
  let trimStr = '';
  if (vehicleEntries.length > 0) {
    const trims = Array.from(vehicleEntries[0][1].trims).slice(0, 12);
    if (trims.length > 0) trimStr = trims.join(', ');
  }

  // Avoid vendor doubling
  const vRe = vendor ? new RegExp('^' + vendor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*', 'i') : null;
  const cleanTitle = vRe ? productTitle.replace(vRe, '').trim() : productTitle;
  const bp = vendor && vendor !== 'Bull Strap' ? vendor + ' ' : '';

  let desc = `${bp}${cleanTitle}`;
  if (fitmentStr) desc += ` — fits ${fitmentStr}`;
  if (trimStr) desc += `. Fits: ${trimStr}.`;

  // 255 chars — maximize keyword surface, no filler
  if (desc.length > 255) desc = desc.substring(0, 252).replace(/\s+\S*$/, '') + '.';
  return desc;
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
  if (newDesc.length > 155) newDesc = newDesc.substring(0, 152) + '.';
  return newDesc;
}

// Build a buyer-intent title: "[Brand] [Category] [YearFitment] | BullStrap"
function buildBuyerIntentTitle(productTitle, vendor) {
  if (!productTitle) return null;

  // Extract year range if present (e.g. "16-20", "2019-2022", "2018+")
  const yearMatch = productTitle.match(/(\d{2,4}[-–]\d{2,4}|\d{4}\+|\d{4}-present)/i);
  const yearStr = yearMatch ? yearMatch[0] : null;

  // Get category keyword
  const category = getCategoryAction(productTitle);

  // Clean up the base title: strip year ranges, noise, AND leading vendor name to avoid doubling
  const vendorPrefix = vendor ? vendor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : null;
  let base = productTitle
    .replace(/(\d{2,4}[-–]\d{2,4}|\d{4}\+|\d{4}-present)/gi, '')
    .replace(vendorPrefix ? new RegExp('^' + vendorPrefix + '\\s*', 'i') : /^$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Brand prefix — only add if base doesn't already start with vendor name
  const bp = (vendor && vendor !== 'Bull Strap' && !base.toLowerCase().startsWith(vendor.toLowerCase()))
    ? vendor + ' ' : '';

  // Build the title
  let title;
  if (category && yearStr) {
    title = `${bp}${category} ${yearStr} | BullStrap`;
  } else if (category) {
    title = `${bp}${category} | BullStrap`;
  } else {
    // Fallback: vendor + trimmed base, never cut mid-word
    let trimmedBase = `${bp}${base}`;
    if (trimmedBase.length > 52) trimmedBase = trimmedBase.substring(0, 52).replace(/\s+\S*$/, '');
    title = `${trimmedBase} | BullStrap`;
  }

  // Cap at 65 chars — hard cut, no ellipsis (never save truncation artifacts)
  if (title.length > 65) title = title.substring(0, 65).replace(/\s+\S*$/, '') + ' | BullStrap';

  // Only write if different from current (avoid unnecessary API calls)
  return title;
}

function fixTitle(currentTitle, vendor, productTitle) {
  if (!productTitle) return null;
  const newTitle = buildBuyerIntentTitle(productTitle, vendor);
  if (!newTitle) return null;
  // Always rewrite — Sidekick's titles are just the product title repeated, not buyer-intent
  if (newTitle === currentTitle) return null;
  return newTitle;
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

function buildUniqueBodyHtml(productTitle, vendor, tags, existingBody) {
  // Parse full fitment from tags
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

  // Strip any existing fitment table and our marker from body
  let baseBody = (existingBody || '').replace(/<p[^>]*>\s*<strong>Compatible Vehicles[^<]*<\/strong>[\s\S]*$/i, '').trim();
  // Also strip old fitment tables
  baseBody = baseBody.replace(/<p[^>]*>This Part Fits:[^<]*<\/p>[\s\S]*/i, '').trim();

  if (Object.keys(vehicleMap).length === 0) return null; // no fitment data, don't touch

  // Build fitment table rows
  let rows = '';
  for (const v of Object.values(vehicleMap)) {
    const yrs = Array.from(v.years).sort();
    // yrs may already be ranges like '2014-2023' — extract start/end years
    const allNums = yrs.flatMap(y => y.split('-').map(n => n.trim())).filter(n => /^\d{4}$/.test(n)).map(Number);
    const minY = allNums.length ? Math.min(...allNums) : yrs[0];
    const maxY = allNums.length ? Math.max(...allNums) : yrs[yrs.length-1];
    const yearStr = minY === maxY ? String(minY) : `${minY}–${maxY}`;
    const trimsArr = Array.from(v.trims).sort();
    if (trimsArr.length > 0) {
      for (const trim of trimsArr) {
        rows += `<tr><td>${yearStr}</td><td>${v.make}</td><td>${v.model}</td><td>${trim}</td></tr>\n`;
      }
    } else {
      rows += `<tr><td>${yearStr}</td><td>${v.make}</td><td>${v.model}</td><td>All Trims</td></tr>\n`;
    }
  }

  const fitmentTable = `<p><strong>Compatible Vehicles — ${productTitle}</strong></p>
<table>
<thead><tr><th>Year</th><th>Make</th><th>Model</th><th>Trim</th></tr></thead>
<tbody>
${rows}</tbody>
</table>`;

  return baseBody + '\n' + fitmentTable;
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
      restReq('GET', 'products.json?limit=250&since_id=' + sinceId + '&fields=id,title,handle,vendor,product_type,images,tags,body_html'));
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

      const newDesc = buildFitmentDescription(product.title, product.vendor, product.tags);
      const newTitle = fixTitle(titleMf?.value, product.vendor, product.title);

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

      // --- Fix body HTML — append unique fitment table DH2T doesn't provide ---
      const newBody = buildUniqueBodyHtml(product.title, product.vendor, product.tags, product.body_html);
      if (newBody && newBody !== product.body_html) {
        await sleep(DELAY_MS);
        await retryOnRateLimit(() => restReq('PUT', 'products/' + product.id + '.json',
          { product: { id: product.id, body_html: newBody } }));
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
