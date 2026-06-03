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

// All 2018+ JLU bench covers are the same regardless of front edition
const stdRearBlock = `<div style="background:#2a1a00;border:2px solid #e0a800;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#e0a800;font-weight:bold;font-size:1.05em;margin:0 0 8px;">🪑 Complete your interior — matching rear bench covers</p>
  <p style="margin:0 0 12px;line-height:1.6;">All 2018+ JLU rear bench covers are the same regardless of front edition (Standard, Mojave, 392, or 4XE). Just pick your bench configuration:</p>
  <div>
    <a href="/products/rear-bench-tactical-seat-covers-for-jeep-wrangler-jlu-2018-4-door-no-fold-down-armrest-only-w-molle-not-for-4xe-edition-bartact" style="background:#e0a800;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:0 8px 8px 0;">Rear Bench — No Armrest</a>
    <a href="/products/rear-bench-tactical-seat-covers-for-jeep-wrangler-jlu-2018-4-door-with-fold-down-armrest-only-w-molle-not-for-4xe-edition-bartact" style="background:#e0a800;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:0 8px 8px 0;">Rear Bench — With Armrest</a>
    <a href="/products/rear-bench-tactical-seat-covers-for-jeep-wrangler-4xe-jlu-2021-4-door-bartact-with-fold-down-armrest-only-4xe-edition-only-w-molle-3" style="background:#e0a800;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:0 8px 8px 0;">Rear Bench — 4XE Edition</a>
  </div>
</div>`;

const customRearBlock = `<div style="background:#2a1a00;border:2px solid #e0a800;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#e0a800;font-weight:bold;font-size:1.05em;margin:0 0 8px;">🪑 Complete your interior — matching rear bench covers</p>
  <p style="margin:0 0 12px;line-height:1.6;">All 2018+ JLU rear bench covers are the same regardless of front edition (Standard, Mojave, 392, or 4XE). Just pick your bench configuration:</p>
  <div>
    <a href="/products/fully-customized-rear-bench-tactical-seat-covers-for-jeep-wrangler-jlu-2018-4-door-bartact-no-fold-down-armrest-only-not-for-4xe-edition-w-molle" style="background:#e0a800;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:0 8px 8px 0;">Build Custom Rear — No Armrest</a>
    <a href="/products/fully-customized-rear-bench-tactical-seat-covers-for-jeep-wrangler-jlu-2018-4-door-bartact-with-fold-down-armrest-only-not-for-4xe-edition-w-molle" style="background:#e0a800;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:0 8px 8px 0;">Build Custom Rear — With Armrest</a>
    <a href="/products/fully-customized-rear-bench-tactical-seat-covers-for-jeep-wrangler-4xe-jlu-2021-4-door-bartact-with-fold-down-armrest-only-4xe-edition-only-w-molle-3" style="background:#e0a800;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:0 8px 8px 0;">Build Custom Rear — 4XE Edition</a>
  </div>
</div>`;

function injectOrReplaceRearBlock(html, block) {
  // Replace existing rear bench block if present
  if (html.includes('matching rear bench covers')) {
    return html.replace(/<div style="background:#2a1a00[^>]*>[\s\S]*?matching rear bench covers[\s\S]*?<\/div>/i, block);
  }
  // Otherwise inject before closing sign-off line
  return html.replace(
    '<p style="font-size:1.1em;font-weight:bold;text-align:center',
    block + '\n\n<p style="font-size:1.1em;font-weight:bold;text-align:center'
  );
}

const products = [
  { id: 602069172247,   block: stdRearBlock,    name: 'JLU standard front' },
  { id: 6596028760107,  block: stdRearBlock,    name: 'Mojave/392 2021+ standard front' },
  { id: 7185963057195,  block: stdRearBlock,    name: 'Mojave/392 2024+ standard front' },
  { id: 6948931108907,  block: customRearBlock, name: 'JLU fully customized front' },
  { id: 6949976178731,  block: customRearBlock, name: 'Mojave/392 2021+ fully customized front' },
];

async function main() {
  for (const prod of products) {
    const { product: p } = await req('GET', `/admin/api/2024-01/products/${prod.id}.json`);
    const newDesc = injectOrReplaceRearBlock(p.body_html, prod.block);
    const r = await req('PUT', `/admin/api/2024-01/products/${prod.id}.json`, {
      product: { id: prod.id, body_html: newDesc }
    });
    const rearLinks = [...r.product.body_html.matchAll(/href="([^"]+)"/g)]
      .map(m => m[1]).filter(l => l.includes('rear') || l.includes('bench'));
    console.log(prod.name + ':', r.product ? '✅' : '❌');
    rearLinks.forEach(l => console.log('  ->', l));
  }
}
main().catch(console.error);
