const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const SHOP = 'bartact.myshopify.com';
const TOKEN = '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';
const headers = { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' };

const newPowerTopNote = `<div style='background:#1a1a1a;border-left:4px solid #b8001f;padding:12px 16px;margin-bottom:20px;'>
  <p style='margin:0 0 6px 0;color:#ffffff;font-size:1em;font-weight:700;'>⚠️ JL, JLU &amp; Gladiator Owners with Sky One-Touch Top or Automatic Power Top Roof:</p>
  <p style='margin:0 0 6px 0;font-size:0.95em;color:#ffffff;'>Because of the way the Sky One-Touch / power top roof connects to the roll bar, these universal grab handles are <strong>NOT compatible</strong> on those versions.</p>
  <p style='margin:0;font-size:0.95em;color:#ffffff;'>Use our bolt-on versions instead: <a href='https://www.bartact.com/products/paracord-grab-handles-bolt-on-for-jeep-wrangler-jl-jlu-2018-made-in-usa-550-paracord-bartact-1' style='color:#b8001f;font-weight:600;'>JL / JLU Bolt-On →</a> &nbsp;|&nbsp; <a href='https://www.bartact.com/products/paracord-grab-handles-bolt-on-for-jeep-gladiator-2019-front-pair-made-in-usa-550-paracord-bartact' style='color:#b8001f;font-weight:600;'>Gladiator Bolt-On →</a></p>
</div>`;

const oldPowerTopNote = `<div style='background:#1a1a1a;border-left:4px solid #b8001f;padding:12px 16px;margin-bottom:20px;'>
  <p style='margin:0 0 4px 0;color:#ffffff;font-size:1em;font-weight:700;'>⚠️ JL & JLU Owners with Automatic Power Top Roof:</p>
  <p style='margin:0;font-size:0.95em;color:#ffffff;'>Because of the way the power top roof connects to the roll bar, these universal grab handles are <strong>NOT compatible</strong> on that version. Use our <a href='https://www.bartact.com/products/paracord-grab-handles-bolt-on-for-jeep-wrangler-jl-jlu-2018-made-in-usa-550-paracord-bartact-1' style='color:#b8001f;font-weight:600;'>bolt-on handles</a> instead.</p>
</div>`;

async function main() {
  // 1. Update Gladiator bolt-on — add Sky One-Touch to compatibility note
  const gr = await fetch('https://'+SHOP+'/admin/api/2024-01/products/7394524692523.json?fields=body_html', { headers });
  const gd = await gr.json();
  const gbody = gd.product.body_html.replace(
    'Compatible with <strong>Hard Top</strong> and <strong>One Touch Electric Top</strong> only.',
    'Compatible with <strong>Hard Top</strong>, <strong>Sky One-Touch Top</strong>, and <strong>One Touch Electric Top</strong> only.'
  );
  const gput = await fetch('https://'+SHOP+'/admin/api/2024-01/products/7394524692523.json', {
    method: 'PUT', headers, body: JSON.stringify({ product: { id: 7394524692523, body_html: gbody } })
  });
  const gpd = await gput.json();
  console.log(gpd.product ? '✅ Gladiator bolt-on updated' : '❌ FAILED', gpd.errors || '');
  await new Promise(res => setTimeout(res, 500));

  // 2. Update both universal handle products — update power top note to include Gladiator
  for (const id of [1287344773, 3948249481239]) {
    const r = await fetch('https://'+SHOP+'/admin/api/2024-01/products/'+id+'.json?fields=body_html', { headers });
    const d = await r.json();
    const body = d.product.body_html.replace(oldPowerTopNote, newPowerTopNote);
    const put = await fetch('https://'+SHOP+'/admin/api/2024-01/products/'+id+'.json', {
      method: 'PUT', headers, body: JSON.stringify({ product: { id, body_html: body } })
    });
    const pd = await put.json();
    console.log(pd.product ? '✅ ' + pd.product.title : '❌ FAILED', pd.errors || '');
    await new Promise(res => setTimeout(res, 500));
  }
}
main().catch(console.error);
