// Strip "Free Shipping" and "— BullStrap" from all Turn14 product title_tags
// Replace with clean: "Brand Category Year | BullStrap"
const https = require('https');
const fs = require('fs');

const TOKEN = 'REDACTED_SHOPIFY_TOKEN_BULLSTRAP';
const SHOP = 'bull-strap-78.myshopify.com';
const STATE_FILE = '/home/ubuntu/.openclaw/workspace/memory/bullstrap-title-fix-state.json';

const sleep = ms => new Promise(r => setTimeout(r, ms));

function restReq(method, p, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: SHOP, path: '/admin/api/2024-01/' + p, method,
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch (e) { resolve({ status: res.statusCode, data: {} }); } });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function retryOnRateLimit(fn, max = 4) {
  for (let i = 0; i < max; i++) {
    const r = await fn();
    if (r && r.status === 429) { console.log('  Rate limited, waiting 10s...'); await sleep(10000); continue; }
    return r;
  }
  return null;
}

function getCat(t) {
  if (t.includes('coilover')) return 'Coilovers';
  if (t.includes('exhaust') || t.includes('catback') || t.includes('cat-back') || t.includes('muffler')) return 'Exhaust';
  if (t.includes('cold air intake') || t.includes('air intake') || t.includes('intake kit')) return 'Air Intake';
  if (t.includes('air filter')) return 'Air Filter';
  if (t.includes('brake pad')) return 'Brake Pads';
  if (t.includes('rotor')) return 'Rotors';
  if (t.includes('shock') || t.includes('strut')) return 'Shocks';
  if (t.includes('lift kit') || t.includes('leveling kit')) return 'Lift Kit';
  if (t.includes('intercooler')) return 'Intercooler';
  if (t.includes('downpipe')) return 'Downpipe';
  if (t.includes('turbo')) return 'Turbo';
  if (t.includes('header')) return 'Headers';
  if (t.includes('suspension')) return 'Suspension';
  if (t.includes('sway bar')) return 'Sway Bar';
  if (t.includes('control arm')) return 'Control Arms';
  if (t.includes('seat cover')) return 'Seat Covers';
  if (t.includes('floor mat') || t.includes('floor liner')) return 'Floor Mats';
  if (t.includes('wheel spacer')) return 'Wheel Spacers';
  if (t.includes('skid plate')) return 'Skid Plate';
  if (t.includes('bumper')) return 'Bumper';
  if (t.includes('winch')) return 'Winch';
  if (t.includes('catch can')) return 'Catch Can';
  if (t.includes('fuel pump')) return 'Fuel Pump';
  if (t.includes('radiator')) return 'Radiator';
  if (t.includes('battery')) return 'Battery';
  if (t.includes('tonneau') || t.includes('bed cover')) return 'Tonneau Cover';
  if (t.includes('roof rack')) return 'Roof Rack';
  return null;
}

function buildCleanTitle(productTitle, vendor) {
  if (!productTitle) return null;
  const tl = productTitle.toLowerCase();
  const yearMatch = productTitle.match(/(\d{2,4}[-\u2013]\d{2,4}|\d{4}\+|\d{4}-present)/i);
  const yearStr = yearMatch ? yearMatch[0] : null;
  const category = getCat(tl);
  const brandPart = vendor && vendor !== 'Bull Strap' ? vendor + ' ' : '';
  let title;
  if (category && yearStr) {
    title = brandPart + category + ' ' + yearStr + ' | BullStrap';
  } else if (category) {
    title = brandPart + category + ' | BullStrap';
  } else {
    const base = productTitle.replace(/(\d{2,4}[-\u2013]\d{2,4}|\d{4}\+)/gi, '').replace(/\s{2,}/g, ' ').trim();
    title = (brandPart + base).substring(0, 48) + ' | BullStrap';
  }
  if (title.length > 60) title = title.substring(0, 57) + '...';
  return title;
}

async function main() {
  let state = { sinceId: 0, fixed: 0, processed: 0 };
  try { state = JSON.parse(fs.readFileSync(STATE_FILE)); } catch (e) {}
  let { sinceId, fixed, processed } = state;
  console.log('Starting from since_id:', sinceId, '| fixed so far:', fixed);

  while (true) {
    const r = await retryOnRateLimit(() => restReq('GET', 'products.json?limit=250&since_id=' + sinceId + '&fields=id,title,vendor'));
    if (!r || !r.data.products) { console.log('API error, stopping'); break; }
    const products = r.data.products;
    if (!products.length) { console.log('All done! Fixed:', fixed, 'total processed:', processed); break; }

    for (const p of products) {
      if (p.vendor === 'Bartact' || p.vendor === 'Bull Strap') continue;

      await sleep(250);
      const mfr = await retryOnRateLimit(() => restReq('GET', 'products/' + p.id + '/metafields.json?namespace=global'));
      if (!mfr) continue;
      const titleMf = (mfr.data.metafields || []).find(m => m.key === 'title_tag');
      const cur = titleMf ? titleMf.value : '';

      // Only touch titles with "Free Shipping" or the em-dash BullStrap pattern
      if (!cur.includes('Free Shipping') && !cur.includes('\u2014 BullStrap') && !cur.includes('— BullStrap')) continue;

      const newTitle = buildCleanTitle(p.title, p.vendor);
      if (!newTitle || newTitle === cur) continue;

      await sleep(250);
      if (titleMf) {
        await retryOnRateLimit(() => restReq('PUT', 'products/' + p.id + '/metafields/' + titleMf.id + '.json', { metafield: { id: titleMf.id, value: newTitle, type: 'single_line_text_field' } }));
      } else {
        await retryOnRateLimit(() => restReq('POST', 'products/' + p.id + '/metafields.json', { metafield: { namespace: 'global', key: 'title_tag', value: newTitle, type: 'single_line_text_field' } }));
      }
      fixed++;
      if (fixed % 50 === 0) console.log('Fixed', fixed, '| last:', p.title.substring(0, 40), '->', newTitle);
    }

    sinceId = products[products.length - 1].id;
    processed += products.length;
    fs.writeFileSync(STATE_FILE, JSON.stringify({ sinceId, fixed, processed }));
    console.log('Batch done: processed', processed, '| fixed', fixed, '| since_id', sinceId);
  }
}

main().catch(e => console.error('Fatal:', e.message));
