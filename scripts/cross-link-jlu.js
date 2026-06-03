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

// Shared nav buttons snippet builders
const mojaveBtns = `
  <div style='background:#1a1a1a;border-left:4px solid #b8001f;padding:12px 16px;margin-bottom:10px;'>
    <p style='margin:0 0 10px 0;color:#ffffff;font-size:1.1em;font-weight:700;'>⚠️ Wrong edition? You need a different cover:</p>
    <div style='display:flex;flex-wrap:wrap;gap:8px;'>
      <a href='https://www.bartact.com/products/front-tactical-seat-covers-for-jeep-wrangler-mojave-392-jlu-2021-bartact-pair-for-mojave-392-editions-only' style='display:inline-block;background:#b8001f;color:#ffffff;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;'>Mojave &amp; 392 (2021-2023) →</a>
      <a href='https://www.bartact.com/products/front-tactical-seat-covers-for-jeep-wrangler-mojave-392-jlu-2024-bartact-pair-for-mojave-392-editions-only' style='display:inline-block;background:#b8001f;color:#ffffff;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;'>Mojave &amp; 392 (2024+) →</a>
    </div>
  </div>`;

const standardBtn = `
  <div style='background:#1a1a1a;border-left:4px solid #b8001f;padding:12px 16px;margin-bottom:10px;'>
    <p style='margin:0 0 10px 0;color:#ffffff;font-size:1.1em;font-weight:700;'>⚠️ Not a Mojave or 392? You need a different cover:</p>
    <div style='display:flex;flex-wrap:wrap;gap:8px;'>
      <a href='https://www.bartact.com/products/tactical-seat-covers-for-jeep-wrangler-jlu-2018-4-dr-only-not-for-mojave-or-392-edition-front-pair-bartact' style='display:inline-block;background:#b8001f;color:#ffffff;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;'>Standard JLU 2018+ →</a>
    </div>
  </div>`;

const customBtn = `
  <div style='background:#1a1a1a;border-left:4px solid #e0a800;padding:12px 16px;margin-bottom:20px;'>
    <p style='margin:0 0 10px 0;color:#e0a800;font-size:1.1em;font-weight:700;'>🎨 Want it built exactly how you want it?</p>
    <a href='https://www.bartact.com/products/fully-customized-front-tactical-custom-seat-covers-for-jeep-wrangler-jlu-2018-4-door-pair-w-molle-not-for-mojave-or-392-edition-bartact-6' style='display:inline-block;background:#e0a800;color:#000000;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;'>Build Your Fully Customized Version →</a>
  </div>`;

const standardFromCustomBtn = `
  <div style='background:#1a1a1a;border-left:4px solid #e0a800;padding:12px 16px;margin-bottom:20px;'>
    <p style='margin:0 0 10px 0;color:#e0a800;font-size:1.1em;font-weight:700;'>🛒 Want a ready-to-ship version?</p>
    <a href='https://www.bartact.com/products/tactical-seat-covers-for-jeep-wrangler-jlu-2018-4-dr-only-not-for-mojave-or-392-edition-front-pair-bartact' style='display:inline-block;background:#e0a800;color:#000000;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;'>Shop Standard JLU 2018+ Covers →</a>
  </div>`;

// Shared product details used across descriptions
const sharedDetails = `
  <ul style='list-style:none;padding:0;margin:0 0 16px 0;'>
    <li style='padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;'>🇺🇸 <strong>Fully fabricated in the USA</strong> &mdash; cut, stitched, and embroidered right here at home</li>
    <li style='padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;'>🧵 <strong>MOLLE/PALS webbing available on Tactical Seat Covers</strong> &mdash; add pouches, storage, and gear without drilling a thing</li>
    <li style='padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;'>🛡️ <strong>Top-grade materials</strong> &mdash; UV resistant, weatherproof, and 3-year anti-fade warranty (polyester colors)</li>
    <li style='padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;'>📦 <strong>Included with each front pair:</strong> two MOLLE pouches, full zippered rear + front pockets, interior lumbar sleeve</li>
    <li style='padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;'>✂️ <strong>Optional add-ons:</strong> custom embroidery, lumbar support, custom colored stitching</li>
  </ul>
  <p style='font-size:0.85em;color:#aaaaaa;line-height:1.5;margin-bottom:8px;'>⚠️ <em>Coyote, Olive Drab, ACU Camo, and Multicam are USA-made Cordura Nylon — no UV inhibitors, so the 3-year anti-fade warranty does not apply to those colors. All other colors are UV-treated 600D polyester with waterproof polyurethane backing.</em></p>
  <p style='font-size:0.85em;color:#aaaaaa;line-height:1.5;margin-bottom:8px;'>⚠️ <em>All seat covers have airbag openings. Fabric is waterproof but not 100% sealed due to stitching.</em></p>
  <p style='font-size:0.85em;color:#aaaaaa;line-height:1.5;margin-bottom:16px;'>⏱️ <em>We try to keep popular combinations in stock. Custom builds may take 6-12 weeks. Contact us before ordering if you need a specific combo quickly.</em></p>
  <p style='margin-bottom:12px;'><a href='https://cdn.shopify.com/s/files/1/0936/7476/files/Install_Instructions_2007-16_Front.pdf?2498913696720319858' style='color:#b8001f;font-weight:600;' target='_blank'>📄 Download Installation Instructions →</a></p>`;

const products = [
  // Fully Customized JLU 2018+
  {
    id: 6948931108907,
    body: `<div style='font-family:inherit;max-width:800px;'>
${mojaveBtns}
${standardFromCustomBtn}
  <h2 style='font-size:1.4em;font-weight:700;color:#b8001f;margin-bottom:8px;letter-spacing:0.01em;'>Fully Customized Front Tactical Seat Covers &mdash; Jeep&reg; Wrangler JLU 2018+ (4-Door)</h2>
  <p style='font-size:1em;color:#ffffff;line-height:1.6;margin-bottom:16px;'>Build it exactly the way you want it. Choose your colors, patterns, fabrics, and options from scratch &mdash; every cover is cut, stitched, and embroidered to order right here in the USA. This is the one for customers who refuse to settle for off-the-shelf.</p>
${sharedDetails}
  <p style='font-size:1em;font-weight:700;color:#b8001f;margin:0;'>You can find cheaper. You won&rsquo;t find better.</p>
</div>`
  },
  // Mojave & 392 JLU 2021+
  {
    id: 6596028760107,
    body: `<div style='font-family:inherit;max-width:800px;'>
${standardBtn}
${customBtn}
  <h2 style='font-size:1.4em;font-weight:700;color:#b8001f;margin-bottom:8px;letter-spacing:0.01em;'>Front Tactical Seat Covers &mdash; Jeep&reg; Wrangler Mojave &amp; 392 JLU (2021-2023)</h2>
  <p style='font-size:1em;color:#ffffff;line-height:1.6;margin-bottom:16px;'>Built specifically for the Mojave and 392 editions with their larger side bolsters &mdash; standard JLU covers won't fit right, and Bartact doesn't do close enough. Precise fitment, military-grade construction, made in the USA.</p>
${sharedDetails}
  <p style='font-size:1em;font-weight:700;color:#b8001f;margin:0;'>You can find cheaper. You won&rsquo;t find better.</p>
</div>`
  },
  // Mojave & 392 JLU 2024+
  {
    id: 7185963057195,
    body: `<div style='font-family:inherit;max-width:800px;'>
${standardBtn}
${customBtn}
  <h2 style='font-size:1.4em;font-weight:700;color:#b8001f;margin-bottom:8px;letter-spacing:0.01em;'>Front Tactical Seat Covers &mdash; Jeep&reg; Wrangler Mojave &amp; 392 JLU (2024+)</h2>
  <p style='font-size:1em;color:#ffffff;line-height:1.6;margin-bottom:16px;'>The 2024+ Mojave and 392 editions have larger side bolsters than standard JLU models &mdash; these covers are built specifically for that fitment. Don't guess, don't settle. Get the cover that was made for your exact seat.</p>
${sharedDetails}
  <p style='font-size:1em;font-weight:700;color:#b8001f;margin:0;'>You can find cheaper. You won&rsquo;t find better.</p>
</div>`
  },
];

async function main() {
  for (const p of products) {
    const payload = { product: { id: p.id, body_html: p.body } };
    const r = await fetch('https://'+SHOP+'/admin/api/2024-01/products/'+p.id+'.json', {
      method: 'PUT', headers, body: JSON.stringify(payload)
    });
    const d = await r.json();
    console.log(d.product ? '✅ ' + d.product.title : '❌ FAILED id='+p.id, d.errors || '');
    await new Promise(res => setTimeout(res, 500));
  }
}
main().catch(console.error);
