require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');
const SHOPIFY_STORE = 'bartact.myshopify.com';
const SHOPIFY_TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;

if (!process.env.BARTACT_CONFIRMED) {
  console.error('ERROR: Set BARTACT_CONFIRMED=1 to run this script against Bartact Shopify.');
  console.error('Example: BARTACT_CONFIRMED=1 node ' + require('path').basename(__filename));
  process.exit(1);
}

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: SHOPIFY_STORE, path, method,
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_TOKEN,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    };
    let data = '';
    const r = https.request(options, res => {
      res.on('data', d => data += d);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve({raw: data}); } });
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('Fetching active+published products with handle starting cpb-order-...');

  // Fetch all active products
  let all = [];
  let sinceId = 0;
  while (true) {
    const d = await req('GET', `/admin/api/2024-01/products.json?limit=250&status=active&since_id=${sinceId}`);
    if (!d.products || d.products.length === 0) break;
    all = all.concat(d.products);
    sinceId = d.products[d.products.length - 1].id;
    if (d.products.length < 250) break;
    await sleep(300);
  }

  console.log(`Total active products fetched: ${all.length}`);

  // Filter: handle starts with 'cpb-order-' and published (published_at set)
  const targets = all.filter(p =>
    p.handle && p.handle.startsWith('cpb-order-') &&
    p.status === 'active' &&
    p.published_at
  );

  console.log(`Found ${targets.length} stray CPB per-order product(s) to archive.`);

  if (targets.length === 0) {
    console.log('Nothing to do. All clean!');
    return;
  }

  let success = 0, failed = 0;
  for (const p of targets) {
    console.log(`  Archiving: ${p.id} | ${p.handle} | "${p.title.substring(0, 60)}"`);
    const r = await req('PUT', `/admin/api/2024-01/products/${p.id}.json`, {
      product: { id: p.id, status: 'archived' }
    });
    if (r.product && r.product.status === 'archived') {
      success++;
    } else {
      failed++;
      console.log(`  FAILED: ${p.id} | ${p.handle}`, JSON.stringify(r).substring(0, 120));
    }
    await sleep(300);
  }

  console.log(`\nDone. ${success} archived, ${failed} failed.`);
}

main().catch(console.error);
