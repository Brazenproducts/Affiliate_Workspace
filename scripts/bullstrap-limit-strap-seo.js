require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');

const DOMAIN = 'bull-strap-78.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BULLSTRAP;

function shopifyReq(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: DOMAIN, path, method,
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch(e) { resolve({ status: res.statusCode, raw: d }); } });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  // 1. Get the product
  const { data } = await shopifyReq('GET', '/admin/api/2024-01/products/limit-straps-bullstrap.json');
  if (!data?.product) {
    // Try searching
    const search = await shopifyReq('GET', '/admin/api/2024-01/products.json?handle=limit-straps-bullstrap&limit=1');
    if (search.data?.products?.length) {
      console.log('Found product:', search.data.products[0].id, search.data.products[0].title);
    } else {
      console.log('Product not found by handle. Searching by title...');
      const all = await shopifyReq('GET', '/admin/api/2024-01/products.json?title=Limit+Straps&limit=5');
      for (const p of (all.data?.products || [])) {
        console.log(`  ${p.id} | ${p.handle} | ${p.title}`);
      }
    }
    return;
  }
  const product = data.product;
  console.log('Product ID:', product.id);
  console.log('Handle:', product.handle);
  console.log('Title:', product.title);
  console.log('Variants:', product.variants?.length);

  // 2. Get current metafields
  const mf = await shopifyReq('GET', `/admin/api/2024-01/products/${product.id}/metafields.json`);
  console.log('\nCurrent metafields:');
  for (const m of (mf.data?.metafields || [])) {
    console.log(`  ${m.namespace}.${m.key} = ${String(m.value).slice(0, 100)}`);
  }
})();
