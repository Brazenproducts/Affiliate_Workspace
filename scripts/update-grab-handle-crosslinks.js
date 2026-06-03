require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const SHOP = 'bartact.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;
const headers = { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' };

if (!process.env.BARTACT_CONFIRMED) {
  console.error('ERROR: Set BARTACT_CONFIRMED=1 to run this script against Bartact Shopify.');
  console.error('Example: BARTACT_CONFIRMED=1 node ' + require('path').basename(__filename));
  process.exit(1);
}

async function main() {
  // 1. Update H2 headings in universal handle descriptions
  const universals = [
    { id: 1287344773, oldH2: 'Paracord Grab Handles for Roll Bar \u2014 Universal (Pair of 2)', newH2: 'Paracord Grab Handles for Jeep\u00ae Wrangler &amp; Gladiator Roll Bar \u2014 Universal (Pair of 2)' },
    { id: 3948249481239, oldH2: 'Paracord Grab Handles for Roll Bars \u2014 Universal Set of 4 (Front &amp; Rear)', newH2: 'Paracord Grab Handles for Jeep\u00ae Wrangler &amp; Gladiator Roll Bar \u2014 Universal Set of 4 (Front &amp; Rear)' },
  ];

  for (const p of universals) {
    const r = await fetch('https://'+SHOP+'/admin/api/2024-01/products/'+p.id+'.json?fields=id,body_html', { headers });
    const d = await r.json();
    const body = d.product.body_html.replace(p.oldH2, p.newH2);
    const put = await fetch('https://'+SHOP+'/admin/api/2024-01/products/'+p.id+'.json', {
      method: 'PUT', headers, body: JSON.stringify({ product: { id: p.id, body_html: body } })
    });
    const pd = await put.json();
    console.log(pd.product ? '✅ H2 updated: ' + pd.product.title : '❌ FAILED', pd.errors || '');
    await new Promise(res => setTimeout(res, 500));
  }

  // 2. Add gold "pre-2024" upsell box to both bolt-on pages
  const universalBox = `<div style="background:#1a1a1a;border-left:4px solid #e0a800;padding:12px 16px;margin-bottom:20px;">
  <p style="margin:0 0 10px 0;color:#e0a800;font-size:1.1em;font-weight:700;">🔧 Don't have 2024+ roll bar airbags?</p>
  <p style="margin:0 0 10px 0;font-size:0.95em;color:#ffffff;">If your Wrangler or Gladiator doesn't have airbags in the roll bar, our universal wrap-around handles are a great option and come in even more color combinations:</p>
  <div style="display:flex;flex-wrap:wrap;gap:8px;">
    <a href="https://www.bartact.com/products/jeep-grab-handles-for-roll-bar-pair-of-2-paracord-grab-handles-for-jeep-wrangler-gladiator-polaris-rzr-canam-maverick-x3" style="display:inline-block;background:#e0a800;color:#000000;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;">Universal Pair of 2 \u2192</a>
    <a href="https://www.bartact.com/products/paracord-grab-handles-for-roll-bars-set-of-4-for-jeep-wrangler-jl-jlu-tj-yj-cj-gladiator-utv-rzr-x3-front-and-rear-bartact" style="display:inline-block;background:#e0a800;color:#000000;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;">Universal Set of 4 \u2192</a>
  </div>
</div>`;

  const boltOns = [7177738387499, 7394524692523];
  for (const id of boltOns) {
    const r = await fetch('https://'+SHOP+'/admin/api/2024-01/products/'+id+'.json?fields=id,title,body_html', { headers });
    const d = await r.json();
    // Insert gold box just before the closing mic-drop line
    const body = d.product.body_html.replace(
      `<p style="font-size:1em;font-weight:700;color:#b8001f;margin:0;">You can find cheaper. You won\u2019t find better.</p>`,
      universalBox + `\n  <p style="font-size:1em;font-weight:700;color:#b8001f;margin:0;">You can find cheaper. You won\u2019t find better.</p>`
    );
    if (body === d.product.body_html) { console.log('⚠️ No match for id', id); continue; }
    const put = await fetch('https://'+SHOP+'/admin/api/2024-01/products/'+id+'.json', {
      method: 'PUT', headers, body: JSON.stringify({ product: { id, body_html: body } })
    });
    const pd = await put.json();
    console.log(pd.product ? '✅ Gold box added: ' + pd.product.title : '❌ FAILED', pd.errors || '');
    await new Promise(res => setTimeout(res, 500));
  }
}
main().catch(console.error);
