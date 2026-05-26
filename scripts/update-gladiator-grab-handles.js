require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const SHOP = 'bartact.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;
const headers = { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' };

const body = `<div style='font-family:inherit;max-width:800px;'>

  <div style='background:#1a1a1a;border-left:4px solid #b8001f;padding:12px 16px;margin-bottom:10px;'>
    <p style='margin:0 0 6px 0;color:#ffffff;font-size:1.1em;font-weight:700;'>⚠️ Compatibility Note:</p>
    <p style='margin:0 0 6px 0;font-size:1em;color:#ffffff;'>Compatible with <strong>Hard Top</strong> and <strong>One Touch Electric Top</strong> only.</p>
    <p style='margin:0 0 6px 0;font-size:1em;color:#ffffff;'>This listing is for the <strong>front pair only</strong> — rear handles for the Gladiator are not yet available.</p>
    <p style='margin:0;font-size:0.9em;color:#aaaaaa;'>Manual Soft Top version coming soon &mdash; check back or <a href="/pages/contact" style="color:#b8001f;">contact us</a> to be notified.</p>
  </div>

  <div style='background:#1a1a1a;border-left:4px solid #e0a800;padding:12px 16px;margin-bottom:20px;'>
    <p style='margin:0 0 4px 0;color:#e0a800;font-size:1.05em;font-weight:700;'>✅ 2024+ Owners:</p>
    <p style='margin:0;font-size:0.95em;color:#ffffff;'>These are the <strong>only safe grab handles</strong> for the 2024+ Gladiator with side curtain airbags &mdash; custom hardware uses the existing Sky One-Touch top holes, so no new drilling, no airbag interference.</p>
  </div>

  <h2 style='font-size:1.4em;font-weight:700;color:#b8001f;margin-bottom:8px;letter-spacing:0.01em;'>Paracord Grab Handles &mdash; Jeep&reg; Gladiator 2019+ (Front Pair, Bolt-On)</h2>
  <p style='font-size:1em;color:#ffffff;line-height:1.6;margin-bottom:16px;'>Hand woven in the USA using 100% American-made 550 paracord. Bartact grab handles bolt straight into existing holes using stock hardware &mdash; no drilling, no guessing, no compromises. Custom-fit for the Gladiator from day one.</p>

  <ul style='list-style:none;padding:0;margin:0 0 16px 0;'>
    <li style='padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;'>🇺🇸 <strong>Fully fabricated in the USA</strong> &mdash; hand woven using 100% USA-made 550 paracord</li>
    <li style='padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;'>💪 <strong>Strongest handles in the industry</strong> &mdash; built to the same standard as our military products</li>
    <li style='padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;'>🔩 <strong>No drilling required</strong> &mdash; uses existing Sky One-Touch top holes with included custom hardware and rubber washers to protect your paint</li>
    <li style='padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;'>🛡️ <strong>Airbag safe</strong> &mdash; the only grab handle designed specifically for 2024+ side curtain airbag models</li>
    <li style='padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;'>✅ <strong>All hardware included</strong> &mdash; ready to install in minutes</li>
  </ul>

  <p style='margin-bottom:12px;'><a href='https://cdn.shopify.com/s/files/1/0936/7476/files/2024_JL_Grab_Handle_Install_copy.jpg?v=1710274829' style='color:#b8001f;font-weight:600;' target='_blank'>📄 Installation Instructions →</a></p>

  <p style='font-size:1em;font-weight:700;color:#b8001f;margin:0;'>You can find cheaper. You won&rsquo;t find better.</p>
</div>`;

async function main() {
  const payload = { product: { id: 7394524692523, body_html: body } };
  const r = await fetch('https://'+SHOP+'/admin/api/2024-01/products/7394524692523.json', {
    method: 'PUT', headers, body: JSON.stringify(payload)
  });
  const d = await r.json();
  console.log(d.product ? '✅ ' + d.product.title : '❌ FAILED', d.errors || '');
}
main().catch(console.error);
