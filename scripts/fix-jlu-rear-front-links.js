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

// Full front covers block — all JLU options
// isCustom = whether we're on a fully customized rear (show custom fronts)
function frontCoversBlock(isCustom) {
  if (isCustom) {
    return `<div style="background:#2a1a00;border:2px solid #e0a800;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#e0a800;font-weight:bold;font-size:1.05em;margin:0 0 8px;">🏁 Complete your interior — matching front covers</p>
  <p style="margin:0 0 12px;line-height:1.6;">These rear bench covers fit all JLU editions including Mojave and 392 — only the fronts are different. Pick the fully customized front that matches your build:</p>
  <div>
    <a href="/products/fully-customized-front-tactical-custom-seat-covers-for-jeep-wrangler-jlu-2018-4-door-pair-w-molle-not-for-mojave-or-392-edition-bartact-6" style="background:#e0a800;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:0 8px 8px 0;">Custom JLU Front (Standard)</a>
    <a href="/products/fully-customized-front-tactical-seat-covers-for-jeep-wrangler-mojave-392-jlu-4-dr-2021-bartact-pair-for-mojave-392-editions-only" style="background:#e0a800;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:0 8px 8px 0;">Custom Mojave & 392 Front (2021+)</a>
  </div>
</div>`;
  }

  return `<div style="background:#2a1a00;border:2px solid #e0a800;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#e0a800;font-weight:bold;font-size:1.05em;margin:0 0 8px;">🏁 Complete your interior — matching front covers</p>
  <p style="margin:0 0 12px;line-height:1.6;">These rear bench covers fit all JLU editions including Mojave and 392 — only the fronts are different. Pick the front that matches your build:</p>
  <div>
    <a href="/products/tactical-seat-covers-for-jeep-wrangler-jlu-2018-4-dr-only-not-for-mojave-or-392-edition-front-pair-bartact" style="background:#e0a800;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:0 8px 8px 0;">JLU Front (Standard)</a>
    <a href="/products/front-tactical-seat-covers-for-jeep-wrangler-mojave-392-jlu-2021-bartact-pair-for-mojave-392-editions-only" style="background:#e0a800;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:0 8px 8px 0;">Mojave & 392 Front (2021+)</a>
    <a href="/products/front-tactical-seat-covers-for-jeep-wrangler-mojave-392-jlu-2024-bartact-pair-for-mojave-392-editions-only" style="background:#e0a800;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:0 8px 8px 0;">Mojave & 392 Front (2024+)</a>
    <a href="/products/fully-customized-front-tactical-custom-seat-covers-for-jeep-wrangler-jlu-2018-4-door-pair-w-molle-not-for-mojave-or-392-edition-bartact-6" style="background:#1a1a1a;color:#e0a800;border:1px solid #e0a800;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:0 8px 8px 0;">Build Fully Custom Front →</a>
  </div>
</div>`;
}

// Replace the existing front covers block in a description
function replaceFrontBlock(html, isCustom) {
  const newBlock = frontCoversBlock(isCustom);
  // Match the existing "matching front covers" block
  const regex = /<div style="background:#2a1a00[^>]*>[\s\S]*?matching front covers[\s\S]*?<\/div>/i;
  if (regex.test(html)) {
    return html.replace(regex, newBlock);
  }
  // If not found, insert before closing line
  return html.replace(
    '<p style="font-size:1.1em;font-weight:bold;text-align:center',
    newBlock + '\n\n<p style="font-size:1.1em;font-weight:bold;text-align:center'
  );
}

const products = [
  { id: 1381624545303, isCustom: false, name: 'Rear no armrest (std)' },
  { id: 1390915911703, isCustom: false, name: 'Rear with armrest (std)' },
  { id: 6979514007595, isCustom: false, name: 'Rear 4XE (std)' },
  { id: 6989961723947, isCustom: true,  name: 'Rear no armrest (custom)' },
  { id: 6992450977835, isCustom: true,  name: 'Rear with armrest (custom)' },
  { id: 6992429088811, isCustom: true,  name: 'Rear 4XE (custom)' },
];

async function main() {
  for (const prod of products) {
    const { product: p } = await req('GET', `/admin/api/2024-01/products/${prod.id}.json`);
    const newDesc = replaceFrontBlock(p.body_html, prod.isCustom);
    const r = await req('PUT', `/admin/api/2024-01/products/${prod.id}.json`, {
      product: { id: prod.id, body_html: newDesc }
    });
    console.log(prod.name + ':', r.product ? '✅' : '❌');
    // Verify links
    const links = [...r.product.body_html.matchAll(/href="([^"]+)"/g)].map(m => m[1]).filter(l => l.includes('front') || l.includes('mojave') || l.includes('392'));
    links.forEach(l => console.log('  ->', l));
  }
}
main().catch(console.error);
