const https = require('https');
const SHOPIFY_STORE = 'bartact.myshopify.com';
const SHOPIFY_TOKEN = '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';

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

const cpbPattern = /- Customer's Product with price \d|ID [A-Za-z0-9_\-]{15,}/;

async function main() {
  // Fetch all products
  let all = [];
  let sinceId = 0;
  while (true) {
    const d = await req('GET', '/admin/api/2024-01/products.json?limit=250&since_id=' + sinceId);
    if (!d.products || d.products.length === 0) break;
    all = all.concat(d.products);
    sinceId = d.products[d.products.length-1].id;
    if (d.products.length < 250) break;
  }

  const targets = all.filter(p => p.status === 'draft' && cpbPattern.test(p.title));
  console.log('Targeting', targets.length, 'CPB customer products to archive...');

  let success = 0, failed = 0;
  for (const p of targets) {
    const r = await req('PUT', `/admin/api/2024-01/products/${p.id}.json`, {
      product: { id: p.id, status: 'archived' }
    });
    if (r.product && r.product.status === 'archived') {
      success++;
      if (success % 10 === 0) console.log(`  ${success}/${targets.length} archived...`);
    } else {
      failed++;
      console.log('  FAILED:', p.id, p.title.substring(0, 60));
    }
    await sleep(250);
  }

  console.log(`\nDone. ${success} archived, ${failed} failed.`);
}
main().catch(console.error);
