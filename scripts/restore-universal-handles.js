const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const SHOP = 'bartact.myshopify.com';
const TOKEN = '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';
const headers = { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' };

const airbagBox = `<div style="background:#1a1a1a;border-left:4px solid #b8001f;padding:12px 16px;margin-bottom:10px;">
  <p style="margin:0 0 10px 0;color:#ffffff;font-size:1.1em;font-weight:700;">⚠️ 2024+ Wrangler, Gladiator, or Ford Bronco owners — these will NOT work for you:</p>
  <p style="margin:0 0 10px 0;font-size:0.95em;color:#ffffff;">These are universal wrap-around handles. The 2024+ Wrangler, Gladiator, and Ford Bronco have airbags in the roll bars — wrapping anything around them is unsafe. You need our bolt-on versions which use existing hardware holes and are airbag-safe.</p>
  <div style="display:flex;flex-wrap:wrap;gap:8px;">
    <a href="https://www.bartact.com/products/paracord-grab-handles-bolt-on-for-jeep-wrangler-jl-jlu-2018-made-in-usa-550-paracord-bartact-1" style="display:inline-block;background:#b8001f;color:#ffffff;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;">JL / JLU 2018+ Bolt-On Handles →</a>
    <a href="https://www.bartact.com/products/paracord-grab-handles-bolt-on-for-jeep-gladiator-2019-front-pair-made-in-usa-550-paracord-bartact" style="display:inline-block;background:#b8001f;color:#ffffff;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;">Gladiator 2019+ Bolt-On Handles →</a>
    <a href="https://www.bartact.com/products/bronco-paracord-grab-handles-custom-for-ford-bronco-full-size-2021-2022-2023-2024-2025-2026-pair-of-2-bartact" style="display:inline-block;background:#b8001f;color:#ffffff;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;">Ford Bronco 2021+ Handles →</a>
  </div>
</div>`;

const skyTopBox = `<div style="background:#1a1a1a;border-left:4px solid #b8001f;padding:12px 16px;margin-bottom:20px;">
  <p style="margin:0 0 10px 0;color:#ffffff;font-size:1.1em;font-weight:700;">⚠️ JL, JLU &amp; Gladiator Owners with Sky One-Touch Top:</p>
  <p style="margin:0 0 10px 0;font-size:0.95em;color:#ffffff;">Because of the way the Sky One-Touch Top connects to the roll bar, these universal grab handles are <strong>NOT compatible</strong> on those versions. Use our bolt-on versions instead:</p>
  <div style="display:flex;flex-wrap:wrap;gap:8px;">
    <a href="https://www.bartact.com/products/paracord-grab-handles-bolt-on-for-jeep-wrangler-jl-jlu-2018-made-in-usa-550-paracord-bartact-1" style="display:inline-block;background:#b8001f;color:#ffffff;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;">JL / JLU Bolt-On Handles →</a>
    <a href="https://www.bartact.com/products/paracord-grab-handles-bolt-on-for-jeep-gladiator-2019-front-pair-made-in-usa-550-paracord-bartact" style="display:inline-block;background:#b8001f;color:#ffffff;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;">Gladiator Bolt-On Handles →</a>
  </div>
</div>`;

const makeBody = (title, isSet) => `<div style="font-family:inherit;max-width:800px;">

${airbagBox}

${skyTopBox}

  <h2 style="font-size:1.4em;font-weight:700;color:#b8001f;margin-bottom:8px;letter-spacing:0.01em;">${title}</h2>
  <p style="font-size:1em;color:#ffffff;line-height:1.6;margin-bottom:16px;">Hand woven in the USA using 100% American-made 550 paracord. Work on both padded and non-padded roll bars — Jeep, UTV, RZR, Maverick X3, Buggy, and more. Copied by many in China. Matched by none.</p>

  <ul style="list-style:none;padding:0;margin:0 0 16px 0;">
    <li style="padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;">🇺🇸 <strong>Fully fabricated in the USA</strong> — hand woven using 100% USA-made 550 paracord</li>
    <li style="padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;">💪 <strong>Strongest handles in the industry</strong> — steel hardware, rubber non-slip backing</li>
    <li style="padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;">🔧 <strong>Universal fit</strong> — works on padded and non-padded roll bars</li>
    <li style="padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;">🎨 <strong>Tons of color options</strong> — customize your look</li>
    ${isSet
      ? `<li style="padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;">📦 <strong>Set of 4</strong> — covers both front and rear roll bar positions</li>`
      : `<li style="padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;">📦 <strong>Pair of 2</strong> — front or rear</li>`}
  </ul>

  <div style="margin-bottom:16px;">
    <iframe width="640" height="360" src="https://www.youtube.com/embed/5afV-kDra-Y" style="max-width:100%;"></iframe>
  </div>

  <p style="font-size:1em;font-weight:700;color:#b8001f;margin:0;">You can find cheaper. You won&rsquo;t find better.</p>
</div>`;

async function main() {
  const products = [
    { id: 1287344773, title: 'Paracord Grab Handles for Roll Bar — Universal (Pair of 2)', isSet: false },
    { id: 3948249481239, title: 'Paracord Grab Handles for Roll Bars — Universal Set of 4 (Front &amp; Rear)', isSet: true },
  ];
  for (const p of products) {
    const put = await fetch('https://'+SHOP+'/admin/api/2024-01/products/'+p.id+'.json', {
      method: 'PUT', headers, body: JSON.stringify({ product: { id: p.id, body_html: makeBody(p.title, p.isSet) } })
    });
    const d = await put.json();
    console.log(d.product ? '✅ ' + d.product.title : '❌ FAILED', d.errors || '');
    await new Promise(res => setTimeout(res, 500));
  }
}
main().catch(console.error);
