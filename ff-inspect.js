const https = require('https');

const STORE = 'bb1awe-vp.myshopify.com';
const TOKEN = 'process.env.SHOPIFY_TOKEN';
const API_VERSION = '2024-01';

function request(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: STORE,
      path: `/admin/api/${API_VERSION}${path}`,
      method,
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const res = await request('GET', '/products.json?limit=3&status=active');
  for (const p of res.products) {
    console.log(`\n=== ${p.title} (ID: ${p.id}) ===`);
    console.log('body_html:');
    console.log(p.body_html ? p.body_html.slice(0, 3000) : '(empty)');
    console.log('\n---');
  }
}

main().catch(console.error);
