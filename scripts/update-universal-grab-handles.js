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

// The airbag warning block to prepend — same for both products
const warningBlock = `<div style='background:#1a1a1a;border-left:4px solid #b8001f;padding:12px 16px;margin-bottom:10px;'>
  <p style='margin:0 0 10px 0;color:#ffffff;font-size:1.1em;font-weight:700;'>⚠️ 2024+ Wrangler, Gladiator, or Ford Bronco owners — these will NOT work for you:</p>
  <p style='margin:0 0 10px 0;font-size:0.95em;color:#ffffff;'>These are universal wrap-around handles. The 2024+ Wrangler, Gladiator, and Ford Bronco have airbags in the roll bars — wrapping anything around them is unsafe. You need our bolt-on versions which use existing hardware holes and are airbag-safe.</p>
  <div style='display:flex;flex-wrap:wrap;gap:8px;'>
    <a href='https://www.bartact.com/products/paracord-grab-handles-bolt-on-for-jeep-wrangler-jl-jlu-2018-made-in-usa-550-paracord-bartact-1' style='display:inline-block;background:#b8001f;color:#ffffff;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;'>JL / JLU 2018+ Bolt-On Handles →</a>
    <a href='https://www.bartact.com/products/paracord-grab-handles-bolt-on-for-jeep-gladiator-2019-front-pair-made-in-usa-550-paracord-bartact' style='display:inline-block;background:#b8001f;color:#ffffff;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;'>Gladiator 2019+ Bolt-On Handles →</a>
    <a href='https://www.bartact.com/products/bronco-paracord-grab-handles-custom-for-ford-bronco-full-size-2021-2022-2023-2024-2025-2026-pair-of-2-bartact' style='display:inline-block;background:#b8001f;color:#ffffff;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;'>Ford Bronco 2021+ Handles →</a>
  </div>
</div>`;

async function main() {
  for (const id of [1287344773, 3948249481239]) {
    const r = await fetch('https://'+SHOP+'/admin/api/2024-01/products/'+id+'.json?fields=id,body_html', { headers });
    const d = await r.json();
    const updated = warningBlock + '\n' + d.product.body_html;
    const put = await fetch('https://'+SHOP+'/admin/api/2024-01/products/'+id+'.json', {
      method: 'PUT', headers, body: JSON.stringify({ product: { id, body_html: updated } })
    });
    const pd = await put.json();
    console.log(pd.product ? '✅ ' + pd.product.title : '❌ FAILED', pd.errors || '');
    await new Promise(res => setTimeout(res, 500));
  }
}
main().catch(console.error);
