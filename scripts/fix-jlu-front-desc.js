require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');
const SHOPIFY_STORE = 'bartact.myshopify.com';
const SHOPIFY_TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;

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

async function main() {
  const { product: p } = await req('GET', '/admin/api/2024-01/products/602069172247.json');
  let desc = p.body_html;

  // 1. Fix 2-door domain: bartactseats.com → www.bartact.com (front covers link only)
  desc = desc.replace(
    'https://bartactseats.com/products/front-tactical-seat-covers-for-jeep-wrangler-jl-2018-2-door-only-bartact-w-molle',
    'https://www.bartact.com/products/front-tactical-seat-covers-for-jeep-wrangler-jl-2018-2-door-only-bartact-w-molle'
  );

  // 2. Fix rear bench links domain: bartactseats.com → /products/ relative
  desc = desc.replace(
    'https://bartactseats.com/products/rear-bench-tactical-seat-covers-for-jeep-wrangler-jlu-2018-4-door-no-fold-down-armrest-only-w-molle-not-for-4xe-edition-bartact',
    '/products/rear-bench-tactical-seat-covers-for-jeep-wrangler-jlu-2018-4-door-no-fold-down-armrest-only-w-molle-not-for-4xe-edition-bartact'
  );
  desc = desc.replace(
    'https://bartactseats.com/products/rear-bench-tactical-seat-covers-for-jeep-wrangler-jlu-2018-4-door-with-fold-down-armrest-only-w-molle-not-for-4xe-edition-bartact',
    '/products/rear-bench-tactical-seat-covers-for-jeep-wrangler-jlu-2018-4-door-with-fold-down-armrest-only-w-molle-not-for-4xe-edition-bartact'
  );

  // 3. Fix button spacing — add margin:0 8px 8px 0 to all anchor buttons in the rear block
  // Target the Complete your interior block buttons specifically
  desc = desc.replace(
    /(<a href="\/products\/rear-bench[^"]*"[^>]*style=")([^"]*)(">)/g,
    (match, pre, style, post) => {
      // Add margin if not already present
      const newStyle = style.includes('margin') ? style : style.replace('display:inline-block', 'display:inline-block;margin:0 8px 8px 0');
      return pre + newStyle + post;
    }
  );

  const r = await req('PUT', '/admin/api/2024-01/products/602069172247.json', {
    product: { id: 602069172247, body_html: desc }
  });
  console.log('Updated:', r.product ? '✅' : '❌');

  // Verify links
  const links = [...r.product.body_html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  console.log('Links now:');
  links.forEach(l => console.log(' ', l));
}
main().catch(console.error);
