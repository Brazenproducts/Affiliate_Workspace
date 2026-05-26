require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const SHOP = 'bartact.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;
const headers = { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' };

const skyTopBox = `<div style="background:#1a1a1a;border-left:4px solid #b8001f;padding:12px 16px;margin-bottom:20px;">
  <p style="margin:0 0 6px 0;color:#ffffff;font-size:1em;font-weight:700;">⚠️ JL, JLU &amp; Gladiator Owners with Sky One-Touch Top:</p>
  <p style="margin:0 0 6px 0;font-size:0.95em;color:#ffffff;">Because of the way the Sky One-Touch Top connects to the roll bar, these universal grab handles are <strong>NOT compatible</strong> on those versions.</p>
  <p style="margin:0;font-size:0.95em;color:#ffffff;">Use our bolt-on versions instead: <a href="https://www.bartact.com/products/paracord-grab-handles-bolt-on-for-jeep-wrangler-jl-jlu-2018-made-in-usa-550-paracord-bartact-1" style="color:#b8001f;font-weight:600;">JL / JLU Bolt-On →</a> &nbsp;|&nbsp; <a href="https://www.bartact.com/products/paracord-grab-handles-bolt-on-for-jeep-gladiator-2019-front-pair-made-in-usa-550-paracord-bartact" style="color:#b8001f;font-weight:600;">Gladiator Bolt-On →</a></p>
</div>`;

async function main() {
  for (const id of [1287344773, 3948249481239]) {
    const r = await fetch('https://'+SHOP+'/admin/api/2024-01/products/'+id+'.json?fields=id,title,body_html', { headers });
    const d = await r.json();
    const body = d.product.body_html.replace(skyTopBox, '').replace('\n\n\n', '\n\n');
    const put = await fetch('https://'+SHOP+'/admin/api/2024-01/products/'+id+'.json', {
      method: 'PUT', headers, body: JSON.stringify({ product: { id, body_html: body } })
    });
    const pd = await put.json();
    console.log(pd.product ? '✅ ' + pd.product.title : '❌ FAILED', pd.errors || '');
    await new Promise(res => setTimeout(res, 500));
  }
}
main().catch(console.error);
