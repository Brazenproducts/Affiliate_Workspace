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

// Corrected custom front block — single configurator handles all editions incl. 2024+
const customFrontBlock = `<div style="background:#2a1a00;border:2px solid #e0a800;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#e0a800;font-weight:bold;font-size:1.05em;margin:0 0 8px;">🏁 Complete your interior — matching front covers</p>
  <p style="margin:0 0 12px;line-height:1.6;">These rear bench covers fit all JLU editions including Mojave and 392 — only the fronts are different. The fully customized builder covers all model years and editions — just select your edition during configuration:</p>
  <div>
    <a href="/products/fully-customized-front-tactical-custom-seat-covers-for-jeep-wrangler-jlu-2018-4-door-pair-w-molle-not-for-mojave-or-392-edition-bartact-6" style="background:#e0a800;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:0 8px 8px 0;">Build Custom JLU Front (All Editions incl. Mojave & 392) →</a>
  </div>
</div>`;

const customRearIds = [6989961723947, 6992450977835, 6992429088811];

async function main() {
  for (const id of customRearIds) {
    const { product: p } = await req('GET', `/admin/api/2024-01/products/${id}.json`);
    const newDesc = p.body_html.replace(
      /<div style="background:#2a1a00[^>]*>[\s\S]*?matching front covers[\s\S]*?<\/div>/i,
      customFrontBlock
    );
    const r = await req('PUT', `/admin/api/2024-01/products/${id}.json`, {
      product: { id, body_html: newDesc }
    });
    const links = [...r.product.body_html.matchAll(/href="([^"]+)"/g)].map(m => m[1]).filter(l => l.includes('front'));
    console.log(id, r.product ? '✅' : '❌');
    links.forEach(l => console.log('  ->', l));
  }
}
main().catch(console.error);
