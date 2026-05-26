require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');
const SHOP = 'bull-strap-78.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BULLSTRAP;

function shopifyGet(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SHOP,
      path: `/admin/api/2024-01${path}`,
      headers: { 'X-Shopify-Access-Token': TOKEN }
    };
    https.get(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch(e) { reject(d); }
      });
    }).on('error', reject);
  });
}

async function main() {
  // Sample from many different ranges to get full category picture
  const typeCounts = {};
  const vendorCounts = {};
  let totalSampled = 0;
  
  // Sample 5000 products across different ID ranges
  let sinceId = 0;
  for (let batch = 0; batch < 20; batch++) {
    const path = sinceId === 0
      ? '/products.json?limit=250&fields=id,product_type,vendor'
      : `/products.json?limit=250&since_id=${sinceId}&fields=id,product_type,vendor`;
    const data = await shopifyGet(path);
    if (!data.products || data.products.length === 0) break;
    for (const p of data.products) {
      const t = p.product_type || '(empty)';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
      const v = p.vendor || '(empty)';
      vendorCounts[v] = (vendorCounts[v] || 0) + 1;
    }
    totalSampled += data.products.length;
    sinceId = data.products[data.products.length - 1].id;
    await new Promise(r => setTimeout(r, 550));
  }
  
  console.log(`Sampled ${totalSampled} products\n`);
  
  console.log('=== ALL PRODUCT TYPES ===');
  const sorted = Object.entries(typeCounts).sort((a,b) => b[1] - a[1]);
  for (const [type, count] of sorted) {
    console.log(`  ${type}: ${count} (${(count/totalSampled*100).toFixed(1)}%)`);
  }
  
  console.log(`\n=== ALL VENDORS (${Object.keys(vendorCounts).length} total) ===`);
  const vendorSorted = Object.entries(vendorCounts).sort((a,b) => b[1] - a[1]);
  for (const [vendor, count] of vendorSorted.slice(0, 50)) {
    console.log(`  ${vendor}: ${count}`);
  }
}

main().catch(console.error);
