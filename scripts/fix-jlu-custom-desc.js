const https = require('https');
const SHOPIFY_STORE = 'bartact.myshopify.com';
const SHOPIFY_TOKEN = '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';

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = { hostname: SHOPIFY_STORE, path, method, headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN, 'Content-Type': 'application/json', ...(payload ? {'Content-Length': Buffer.byteLength(payload)} : {}) } };
    let data = '';
    const r = https.request(options, res => { res.on('data', d => data += d); res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve({raw:data}); } }); });
    r.on('error', reject); if (payload) r.write(payload); r.end();
  });
}

const newDesc = `<div data-crosslink-v1="6948931108907">
<div style="background:#1a1a1a;border-left:4px solid #b8001f;padding:12px 16px;margin-bottom:10px;">
<p style="margin:0 0 10px 0;color:#ffffff;font-size:1.1em;font-weight:700;">⚠️ Wrong fit? Make sure you have the right door count!</p>
<div style="display:flex;flex-wrap:wrap;gap:8px;"><a href="https://www.bartact.com/products/fully-customized-front-tactical-seat-covers-for-jeep-wrangler-jl-2-dr-only-not-for-mojave-or-392-edition-w-molle-bartact" style="display:inline-block;background:#b8001f;color:#ffffff;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;">Have a 2-Door JL? →</a></div>
</div>
</div>
<div style="font-family:inherit;max-width:800px;">
  <h2 style="font-size:1.4em;font-weight:700;color:#b8001f;margin-bottom:8px;letter-spacing:0.01em;">Fully Customized Front Tactical Seat Covers — Jeep® Wrangler JLU 2018+ (4-Door)</h2>
  <p style="font-size:1em;color:#ffffff;line-height:1.6;margin-bottom:16px;">Build it exactly the way you want it. Choose your edition, seat adjuster type, colors, patterns, fabrics, and options from scratch — every cover is cut, stitched, and embroidered to order right here in the USA. This is the one for customers who refuse to settle for off-the-shelf.</p>

  <ul style="list-style:none;padding:0;margin:0 0 16px 0;">
    <li style="padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;">🇺🇸 <strong>Fully fabricated in the USA</strong> — cut, stitched, and embroidered right here at home</li>
    <li style="padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;">🧵 <strong>MOLLE/PALS webbing available on Tactical Seat Covers</strong> — add pouches, storage, and gear without drilling a thing</li>
    <li style="padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;">🛡️ <strong>Top-grade materials</strong> — UV resistant, weatherproof, and 3-year anti-fade warranty (polyester colors)</li>
    <li style="padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;">📦 <strong>Included with each front pair:</strong> two MOLLE pouches, full zippered rear + front pockets, interior lumbar sleeve</li>
    <li style="padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;">✂️ <strong>Optional add-ons:</strong> custom embroidery, lumbar support, custom colored stitching</li>
    <li style="padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;">⚡ <strong>2024+ models:</strong> select your seat adjuster type (manual, electric driver, or both electric) in the builder</li>
    <li style="padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;">🏔️ <strong>Mojave &amp; 392 editions:</strong> select your edition in the builder — covered in the same product</li>
  </ul>

  <p style="font-size:0.85em;color:#aaaaaa;line-height:1.5;margin-bottom:8px;">⚠️ <em>Coyote, Olive Drab, ACU Camo, and Multicam are USA-made Cordura Nylon — no UV inhibitors, so the 3-year anti-fade warranty does not apply to those colors. All other colors are UV-treated 600D polyester with waterproof polyurethane backing.</em></p>
  <p style="font-size:0.85em;color:#aaaaaa;line-height:1.5;margin-bottom:8px;">⚠️ <em>All seat covers have airbag openings. Fabric is waterproof but not 100% sealed due to stitching.</em></p>
  <p style="font-size:0.85em;color:#aaaaaa;line-height:1.5;margin-bottom:16px;">⏱️ <em>We try to keep popular combinations in stock. Custom builds may take 6-12 weeks. Contact us before ordering if you need a specific combo quickly.</em></p>
  <p style="margin-bottom:12px;"><a href="https://cdn.shopify.com/s/files/1/0936/7476/files/Install_Instructions_2007-16_Front.pdf?2498913696720319858" style="color:#b8001f;font-weight:600;" target="_blank">📄 Download Installation Instructions →</a></p>
  <p style="font-size:1em;font-weight:700;color:#b8001f;margin:0;">You can find cheaper. You won't find better.</p>
</div>`;

async function main() {
  const r = await req('PUT', '/admin/api/2024-01/products/6948931108907.json', {
    product: { id: 6948931108907, body_html: newDesc }
  });
  console.log('Updated:', r.product ? '✅' : '❌');
  // Verify no bad links remain
  const links = [...r.product.body_html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  links.forEach(l => console.log(' ->', l));
}
main().catch(console.error);
