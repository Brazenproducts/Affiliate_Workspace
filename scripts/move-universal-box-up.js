const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const SHOP = 'bartact.myshopify.com';
const TOKEN = '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';
const headers = { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' };

const universalBox = `<div style="background:#1a1a1a;border-left:4px solid #e0a800;padding:12px 16px;margin-bottom:20px;">
  <p style="margin:0 0 10px 0;color:#e0a800;font-size:1.1em;font-weight:700;">🔧 Don't have 2024+ roll bar airbags?</p>
  <p style="margin:0 0 10px 0;font-size:0.95em;color:#ffffff;">If your Wrangler or Gladiator doesn't have airbags in the roll bar, our universal wrap-around handles are a great option and come in even more color combinations:</p>
  <div style="display:flex;flex-wrap:wrap;gap:8px;">
    <a href="https://www.bartact.com/products/jeep-grab-handles-for-roll-bar-pair-of-2-paracord-grab-handles-for-jeep-wrangler-gladiator-polaris-rzr-canam-maverick-x3" style="display:inline-block;background:#e0a800;color:#000000;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;">Universal Pair of 2 →</a>
    <a href="https://www.bartact.com/products/paracord-grab-handles-for-roll-bars-set-of-4-for-jeep-wrangler-jl-jlu-tj-yj-cj-gladiator-utv-rzr-x3-front-and-rear-bartact" style="display:inline-block;background:#e0a800;color:#000000;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;">Universal Set of 4 →</a>
  </div>
</div>`;

const oldUniversalBox = `<div style="background:#1a1a1a;border-left:4px solid #e0a800;padding:12px 16px;margin-bottom:20px;">
  <p style="margin:0 0 10px 0;color:#e0a800;font-size:1.1em;font-weight:700;">🔧 Don't have 2024+ roll bar airbags?</p>
  <p style="margin:0 0 10px 0;font-size:0.95em;color:#ffffff;">If your Wrangler or Gladiator doesn't have airbags in the roll bar, our universal wrap-around handles are a great option and come in even more color combinations:</p>
  <div style="display:flex;flex-wrap:wrap;gap:8px;">
    <a href="https://www.bartact.com/products/jeep-grab-handles-for-roll-bar-pair-of-2-paracord-grab-handles-for-jeep-wrangler-gladiator-polaris-rzr-canam-maverick-x3" style="display:inline-block;background:#e0a800;color:#000000;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;">Universal Pair of 2 →</a>
    <a href="https://www.bartact.com/products/paracord-grab-handles-for-roll-bars-set-of-4-for-jeep-wrangler-jl-jlu-tj-yj-cj-gladiator-utv-rzr-x3-front-and-rear-bartact" style="display:inline-block;background:#e0a800;color:#000000;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;">Universal Set of 4 →</a>
  </div>
</div>
  <p style="font-size:1em;font-weight:700;color:#b8001f;margin:0;">You can find cheaper. You won't find better.</p>`;

const newEnding = `  <p style="font-size:1em;font-weight:700;color:#b8001f;margin:0;">You can find cheaper. You won't find better.</p>`;

// The H2 heading that appears after the warning boxes on each product
const jluMarker = `<h2 style="font-size:1.4em;font-weight:700;color:#b8001f;margin-bottom:8px;letter-spacing:0.01em;">Paracord Grab Handles &mdash; Jeep&reg; Wrangler JL &amp; JLU 2018+ (Bolt-On)</h2>`;
const gladMarker = `<h2 style="font-size:1.4em;font-weight:700;color:#b8001f;margin-bottom:8px;letter-spacing:0.01em;">Paracord Grab Handles &mdash; Jeep&reg; Gladiator 2019+ (Front Pair, Bolt-On)</h2>`;

async function main() {
  const products = [
    { id: 7177738387499, marker: jluMarker },
    { id: 7394524692523, marker: gladMarker },
  ];

  for (const p of products) {
    const r = await fetch('https://'+SHOP+'/admin/api/2024-01/products/'+p.id+'.json?fields=id,title,body_html', { headers });
    const d = await r.json();

    // Remove old universal box from bottom, insert above the H2
    let body = d.product.body_html
      .replace('\n' + universalBox + '\n  ' + newEnding.trim(), '\n  ' + newEnding.trim())
      .replace(p.marker, universalBox + '\n\n  ' + p.marker);

    if (body === d.product.body_html) {
      console.log('⚠️ No changes made for id', p.id, '— may already be in correct position');
      continue;
    }

    const put = await fetch('https://'+SHOP+'/admin/api/2024-01/products/'+p.id+'.json', {
      method: 'PUT', headers, body: JSON.stringify({ product: { id: p.id, body_html: body } })
    });
    const pd = await put.json();
    console.log(pd.product ? '✅ ' + pd.product.title : '❌ FAILED', pd.errors || '');
    await new Promise(res => setTimeout(res, 500));
  }
}
main().catch(console.error);
