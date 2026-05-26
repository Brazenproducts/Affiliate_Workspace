require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');
const SHOPIFY_STORE = 'bartact.myshopify.com';
const SHOPIFY_TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;

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

const rearHandle = 'rear-bench-tactical-seat-cover-for-jeep-wrangler-tj-lj-2003-06-w-molle-bartact';

const customFrontDesc = `<div style="background:#000;color:#fff;font-family:Arial,sans-serif;padding:24px;border-radius:8px;">

<h2 style="color:#b8001f;font-size:1.6em;margin-bottom:8px;">Fully Customized Front Tactical Seat Covers — Jeep® Wrangler TJ / LJ 2003-2006 | Pair</h2>

<p style="font-size:1.05em;line-height:1.6;">Build it exactly the way you want it. Choose your outer fabric, insert color, and configuration for a completely custom set of front seat covers made for the 2003-2006 Jeep Wrangler TJ and LJ (Unlimited). Every set is made by hand in the USA. <strong>Please allow 6–12 weeks lead time</strong> — if you need to confirm availability on a specific combo before ordering, give us a call at <strong>951-319-4008</strong>.</p>

<div style="background:#1a1a1a;border-left:4px solid #b8001f;padding:16px;margin:20px 0;border-radius:4px;">
  <ul style="margin:0;padding-left:20px;line-height:1.9;">
    <li><strong>Exact fit for 2003-2006 Jeep Wrangler TJ &amp; LJ (Unlimited)</strong></li>
    <li><strong>True mil-spec PALS / MOLLE webbing</strong> — compatible with standard issue MOLLE pouches</li>
    <li><strong>Mil-spec Bar Tack stitching</strong> on all webbing</li>
    <li><strong>Two MOLLE pouches included</strong> (8"×7.5"×2") — mount anywhere on the PALS system</li>
    <li><strong>Fabric is waterproof</strong> — note: not 100% waterproof due to stitch openings</li>
    <li><strong>Fully fabricated in the USA</strong> — cut, stitched, and embroidered right here at home</li>
  </ul>
</div>

<div style="background:#2a1a00;border:2px solid #e0a800;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#e0a800;font-weight:bold;font-size:1.05em;margin:0 0 8px;">🪑 Complete your interior</p>
  <p style="margin:0;line-height:1.6;">Add matching rear bench covers to finish the set. Same spec, same fabrics, same MOLLE system.</p>
  <p style="margin:10px 0 0;"><a href="/products/${rearHandle}" style="background:#e0a800;color:#000;padding:8px 18px;border-radius:4px;text-decoration:none;font-weight:bold;">Shop Matching Rear Bench Covers →</a></p>
</div>

<p style="font-size:1.1em;font-weight:bold;text-align:center;margin-top:24px;color:#fff;">You can find cheaper. You won't find better.</p>

</div>`;

const standardFrontDesc = `<div style="background:#000;color:#fff;font-family:Arial,sans-serif;padding:24px;border-radius:8px;">

<h2 style="color:#b8001f;font-size:1.6em;margin-bottom:8px;">Front Tactical Seat Covers — Jeep® Wrangler TJ / LJ 2003-2006 | Pair</h2>

<p style="font-size:1.05em;line-height:1.6;">Custom-fit front seat covers built specifically for the 2003-2006 Jeep Wrangler TJ and LJ (Unlimited). True mil-spec PALS webbing, real bar tack stitching, and a free MOLLE pouch included with every pair. These aren't generic covers cut down to fit — every panel is made for your TJ.</p>

<div style="background:#1a1a1a;border-left:4px solid #b8001f;padding:16px;margin:20px 0;border-radius:4px;">
  <ul style="margin:0;padding-left:20px;line-height:1.9;">
    <li><strong>Exact fit for 2003-2006 Jeep Wrangler TJ &amp; LJ (Unlimited)</strong> — not a universal cut</li>
    <li><strong>True mil-spec PALS / MOLLE webbing</strong> — compatible with standard issue MOLLE pouches</li>
    <li><strong>Mil-spec Bar Tack stitching</strong> on all webbing — built for punishment</li>
    <li><strong>Free MOLLE pouch included</strong> — mounts anywhere on the PALS system</li>
    <li><strong>10 insert color options</strong> — Black, Graphite, Red, Blue, Navy, Orange, Olive Drab, Coyote, Khaki, ACU Camo</li>
    <li><strong>Fully fabricated in the USA</strong> — cut, stitched, and embroidered right here at home</li>
  </ul>
</div>

<div style="background:#2a1a00;border:2px solid #e0a800;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#e0a800;font-weight:bold;font-size:1.05em;margin:0 0 8px;">🎨 Want a fully custom build?</p>
  <p style="margin:0;line-height:1.6;">This listing covers our most popular in-stock color combos. For custom fabric, color, and configuration options — including two-tone builds — use the Fully Customized version.</p>
  <p style="margin:10px 0 0;"><a href="/products/fully-customized-front-tactical-custom-seat-covers-for-jeep-wrangler-tj-lj-2003-06-pair-w-molle-bartact" style="background:#e0a800;color:#000;padding:8px 18px;border-radius:4px;text-decoration:none;font-weight:bold;">Build Your Custom TJ / LJ Seat Covers →</a></p>
</div>

<div style="background:#2a1a00;border:2px solid #e0a800;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#e0a800;font-weight:bold;font-size:1.05em;margin:0 0 8px;">🪑 Complete your interior</p>
  <p style="margin:0;line-height:1.6;">Grab matching rear bench covers to finish the look. Built to the same spec, same fabrics, same MOLLE system.</p>
  <p style="margin:10px 0 0;"><a href="/products/${rearHandle}" style="background:#e0a800;color:#000;padding:8px 18px;border-radius:4px;text-decoration:none;font-weight:bold;">Shop Matching Rear Bench Covers →</a></p>
</div>

<p style="font-size:1.1em;font-weight:bold;text-align:center;margin-top:24px;color:#fff;">You can find cheaper. You won't find better.</p>

</div>`;

async function main() {
  const r1 = await req('PUT', '/admin/api/2024-01/products/1481137946647.json', {
    product: { id: 1481137946647, body_html: standardFrontDesc }
  });
  console.log('Standard front fixed:', r1.product ? '✅' : '❌');

  const r2 = await req('PUT', '/admin/api/2024-01/products/6973385211947.json', {
    product: { id: 6973385211947, body_html: customFrontDesc }
  });
  console.log('Custom front fixed:', r2.product ? '✅' : '❌');
}
main().catch(console.error);
