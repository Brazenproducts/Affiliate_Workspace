const https = require('https');
const SHOP = 'bull-strap-78.myshopify.com';
const TOKEN = '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';

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
  // Get products from different ranges to get a diverse sample
  let allProducts = [];
  
  for (const sinceId of [0, 1000000000, 3000000000, 5000000000, 7000000000]) {
    const path = sinceId === 0 
      ? '/products.json?limit=5&fields=id,title,product_type,vendor,tags,handle'
      : `/products.json?limit=5&since_id=${sinceId}&fields=id,title,product_type,vendor,tags,handle`;
    const data = await shopifyGet(path);
    if (data.products) allProducts.push(...data.products);
    await new Promise(r => setTimeout(r, 600));
  }
  
  console.log(`\n=== SAMPLED ${allProducts.length} PRODUCTS ===\n`);
  for (const p of allProducts) {
    console.log(`ID: ${p.id}`);
    console.log(`  Title: ${p.title}`);
    console.log(`  Type: ${p.product_type || '(empty)'}`);
    console.log(`  Vendor: ${p.vendor || '(empty)'}`);
    console.log(`  Handle: ${p.handle}`);
    console.log(`  Tags: ${(p.tags || '').substring(0, 200)}`);
    console.log('');
  }
  
  // Now get product types distribution - sample larger batches
  console.log('\n=== COLLECTING PRODUCT TYPES (sampling 1000 products) ===\n');
  const typeCounts = {};
  const vendorCounts = {};
  let nextPageUrl = '/products.json?limit=250&fields=id,product_type,vendor,title';
  let totalSampled = 0;
  
  for (let i = 0; i < 4; i++) {
    const data = await shopifyGet(nextPageUrl);
    if (!data.products || data.products.length === 0) break;
    for (const p of data.products) {
      const t = p.product_type || '(empty)';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
      const v = p.vendor || '(empty)';
      vendorCounts[v] = (vendorCounts[v] || 0) + 1;
    }
    totalSampled += data.products.length;
    const lastId = data.products[data.products.length - 1].id;
    nextPageUrl = `/products.json?limit=250&since_id=${lastId}&fields=id,product_type,vendor,title`;
    await new Promise(r => setTimeout(r, 600));
  }
  
  console.log(`Sampled ${totalSampled} products for type distribution:`);
  const sorted = Object.entries(typeCounts).sort((a,b) => b[1] - a[1]);
  for (const [type, count] of sorted.slice(0, 40)) {
    console.log(`  ${type}: ${count} (${(count/totalSampled*100).toFixed(1)}%)`);
  }
  
  console.log(`\nTop 20 vendors:`);
  const vendorSorted = Object.entries(vendorCounts).sort((a,b) => b[1] - a[1]);
  for (const [vendor, count] of vendorSorted.slice(0, 20)) {
    console.log(`  ${vendor}: ${count}`);
  }
  
  // Now check existing SEO metafields on a few products
  console.log('\n=== CHECKING EXISTING SEO METAFIELDS ===\n');
  const sampleIds = allProducts.slice(0, 5).map(p => p.id);
  for (const id of sampleIds) {
    const meta = await shopifyGet(`/products/${id}/metafields.json`);
    const seoMeta = (meta.metafields || []).filter(m => 
      m.namespace === 'global' && (m.key === 'title_tag' || m.key === 'description_tag')
    );
    console.log(`Product ${id}: ${seoMeta.length} SEO metafields`);
    for (const m of seoMeta) {
      console.log(`  ${m.key}: ${(m.value || '').substring(0, 150)}`);
    }
    await new Promise(r => setTimeout(r, 600));
  }
}

main().catch(console.error);
