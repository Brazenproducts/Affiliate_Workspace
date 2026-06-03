require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');
const SHOPIFY_STORE = 'bartact.myshopify.com';
const SHOPIFY_TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;

if (!process.env.BARTACT_CONFIRMED) {
  console.error('ERROR: Set BARTACT_CONFIRMED=1 to run this script against Bartact Shopify.');
  console.error('Example: BARTACT_CONFIRMED=1 node ' + require('path').basename(__filename));
  process.exit(1);
}

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

async function setMetafield(productId, key, value) {
  const existing = await req('GET', `/admin/api/2024-01/products/${productId}/metafields.json?namespace=global&key=${key}`);
  if (existing.metafields && existing.metafields.length > 0) {
    const mf = existing.metafields[0];
    return req('PUT', `/admin/api/2024-01/metafields/${mf.id}.json`, { metafield: { id: mf.id, value, type: 'single_line_text_field' } });
  }
  return req('POST', `/admin/api/2024-01/products/${productId}/metafields.json`, { metafield: { namespace: 'global', key, value, type: 'single_line_text_field' } });
}

// ── HANDLES ──────────────────────────────────────────────────────────────────
const h = {
  // Standard fronts
  frontStd:       'tactical-seat-covers-for-jeep-wrangler-jlu-2018-4-dr-only-not-for-mojave-or-392-edition-front-pair-bartact',
  // Custom fronts
  frontCustom:    'fully-customized-front-tactical-custom-seat-covers-for-jeep-wrangler-jlu-2018-4-door-pair-w-molle-not-for-mojave-or-392-edition-bartact-6',
  // Standard rears
  rearNoArm:      'rear-bench-tactical-seat-covers-for-jeep-wrangler-jlu-2018-4-door-no-fold-down-armrest-only-w-molle-not-for-4xe-edition-bartact',
  rearWithArm:    'rear-bench-tactical-seat-covers-for-jeep-wrangler-jlu-2018-4-door-with-fold-down-armrest-only-w-molle-not-for-4xe-edition-bartact',
  rear4XE:        'rear-bench-tactical-seat-covers-for-jeep-wrangler-4xe-jlu-2021-4-door-bartact-with-fold-down-armrest-only-4xe-edition-only-w-molle-3',
  // Custom rears
  rearCustomNoArm:   'fully-customized-rear-bench-tactical-seat-covers-for-jeep-wrangler-jlu-2018-4-door-bartact-no-fold-down-armrest-only-not-for-4xe-edition-w-molle',
  rearCustomWithArm: 'fully-customized-rear-bench-tactical-seat-covers-for-jeep-wrangler-jlu-2018-4-door-bartact-with-fold-down-armrest-only-not-for-4xe-edition-w-molle',
  rearCustom4XE:     'fully-customized-rear-bench-tactical-seat-covers-for-jeep-wrangler-4xe-jlu-2021-4-door-bartact-with-fold-down-armrest-only-4xe-edition-only-w-molle-3',
};

// ── REAR BENCH CROSS-LINK BLOCK (STANDARD) ───────────────────────────────────
function rearStdCrossLinks(current) {
  const options = [
    { label: 'No Fold-Down Armrest (most common)', handle: h.rearNoArm, current: current === 'noarm' },
    { label: 'With Fold-Down Armrest', handle: h.rearWithArm, current: current === 'witharm' },
    { label: '4XE Edition (With Armrest)', handle: h.rear4XE, current: current === '4xe' },
  ];
  const links = options.map(o =>
    o.current
      ? `<span style="background:#b8001f;color:#fff;padding:8px 16px;border-radius:4px;font-weight:bold;display:inline-block;margin:4px;">${o.label} ← You are here</span>`
      : `<a href="/products/${o.handle}" style="background:#1a1a1a;color:#fff;border:1px solid #555;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:4px;">${o.label}</a>`
  ).join('\n    ');
  return `<div style="background:#1a1a1a;border:2px solid #555;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#fff;font-weight:bold;font-size:1.05em;margin:0 0 12px;">🪑 Choose your rear bench configuration:</p>
  <div style="display:flex;flex-wrap:wrap;gap:4px;">
    ${links}
  </div>
</div>`;
}

// ── REAR BENCH CROSS-LINK BLOCK (CUSTOM) ─────────────────────────────────────
function rearCustomCrossLinks(current) {
  const options = [
    { label: 'No Fold-Down Armrest (most common)', handle: h.rearCustomNoArm, current: current === 'noarm' },
    { label: 'With Fold-Down Armrest', handle: h.rearCustomWithArm, current: current === 'witharm' },
    { label: '4XE Edition (With Armrest)', handle: h.rearCustom4XE, current: current === '4xe' },
  ];
  const links = options.map(o =>
    o.current
      ? `<span style="background:#b8001f;color:#fff;padding:8px 16px;border-radius:4px;font-weight:bold;display:inline-block;margin:4px;">${o.label} ← You are here</span>`
      : `<a href="/products/${o.handle}" style="background:#1a1a1a;color:#fff;border:1px solid #555;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:4px;">${o.label}</a>`
  ).join('\n    ');
  return `<div style="background:#1a1a1a;border:2px solid #555;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#fff;font-weight:bold;font-size:1.05em;margin:0 0 12px;">🪑 Choose your rear bench configuration:</p>
  <div style="display:flex;flex-wrap:wrap;gap:4px;">
    ${links}
  </div>
</div>`;
}

// ── FRONT COMPLETE-YOUR-INTERIOR BLOCK (STANDARD) ────────────────────────────
const frontStdRearBlock = `<div style="background:#2a1a00;border:2px solid #e0a800;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#e0a800;font-weight:bold;font-size:1.05em;margin:0 0 10px;">🪑 Complete your interior — matching rear bench covers</p>
  <p style="margin:0 0 12px;line-height:1.6;">Same spec, same fabrics, same MOLLE system. Pick the version that matches your JLU:</p>
  <div style="display:flex;flex-wrap:wrap;gap:4px;">
    <a href="/products/${h.rearNoArm}" style="background:#e0a800;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:4px;">No Fold-Down Armrest</a>
    <a href="/products/${h.rearWithArm}" style="background:#e0a800;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:4px;">With Fold-Down Armrest</a>
    <a href="/products/${h.rear4XE}" style="background:#e0a800;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:4px;">4XE Edition (With Armrest)</a>
  </div>
</div>`;

// ── FRONT COMPLETE-YOUR-INTERIOR BLOCK (CUSTOM) ──────────────────────────────
const frontCustomRearBlock = `<div style="background:#2a1a00;border:2px solid #e0a800;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#e0a800;font-weight:bold;font-size:1.05em;margin:0 0 10px;">🪑 Complete your interior — matching fully customized rear bench covers</p>
  <p style="margin:0 0 12px;line-height:1.6;">Build matching rear covers with the same custom fabrics and colors. Pick your configuration:</p>
  <div style="display:flex;flex-wrap:wrap;gap:4px;">
    <a href="/products/${h.rearCustomNoArm}" style="background:#e0a800;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:4px;">No Fold-Down Armrest</a>
    <a href="/products/${h.rearCustomWithArm}" style="background:#e0a800;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:4px;">With Fold-Down Armrest</a>
    <a href="/products/${h.rearCustom4XE}" style="background:#e0a800;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin:4px;">4XE Edition (With Armrest)</a>
  </div>
</div>`;

// ── FULL DESCRIPTIONS ─────────────────────────────────────────────────────────

function rearStdDesc(variant) {
  const titles = {
    noarm:   'Rear Bench Tactical Seat Covers — Jeep® Wrangler JLU 2018+ | No Fold-Down Armrest',
    witharm: 'Rear Bench Tactical Seat Covers — Jeep® Wrangler JLU 2018+ | With Fold-Down Armrest',
    '4xe':   'Rear Bench Tactical Seat Covers — Jeep® Wrangler 4XE JLU 2021+ | With Fold-Down Armrest',
  };
  const warnings = {
    noarm:   `<div style="background:#1a0000;border:2px solid #b8001f;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#ff4444;font-weight:bold;font-size:1.05em;margin:0 0 8px;">⚠️ Fitment Warning</p>
  <p style="margin:0;line-height:1.6;">This cover fits JLU rear benches <strong>WITHOUT a fold-down center armrest</strong>. If your JLU has a fold-down armrest, choose the "With Fold-Down Armrest" version. <strong>NOT compatible with 4XE Edition.</strong></p>
</div>`,
    witharm: `<div style="background:#1a0000;border:2px solid #b8001f;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#ff4444;font-weight:bold;font-size:1.05em;margin:0 0 8px;">⚠️ Fitment Warning</p>
  <p style="margin:0;line-height:1.6;">This cover fits JLU rear benches <strong>WITH a fold-down center armrest</strong>. If your JLU does not have an armrest, choose the "No Fold-Down Armrest" version. <strong>NOT compatible with 4XE Edition.</strong></p>
</div>`,
    '4xe':   `<div style="background:#1a0000;border:2px solid #b8001f;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#ff4444;font-weight:bold;font-size:1.05em;margin:0 0 8px;">⚠️ 4XE Edition ONLY</p>
  <p style="margin:0;line-height:1.6;">This cover is designed <strong>specifically for the Jeep Wrangler 4XE</strong> rear bench with fold-down armrest. The 4XE has a different rear bench configuration than standard JLU models. <strong>NOT for standard JLU.</strong></p>
</div>`,
  };

  return `<div style="background:#000;color:#fff;font-family:Arial,sans-serif;padding:24px;border-radius:8px;">

<h2 style="color:#b8001f;font-size:1.6em;margin-bottom:8px;">${titles[variant]}</h2>

<p style="font-size:1.05em;line-height:1.6;">Exact-fit rear bench tactical seat covers for the 2018+ Jeep Wrangler JLU. Built to the same mil-spec standard as our front covers — true PALS/MOLLE webbing, bar tack stitching, and a MOLLE pouch included. Fully fabricated in the USA.</p>

${rearStdCrossLinks(variant)}

<div style="background:#1a1a1a;border-left:4px solid #b8001f;padding:16px;margin:20px 0;border-radius:4px;">
  <ul style="margin:0;padding-left:20px;line-height:1.9;">
    <li><strong>Exact fit for 2018+ Jeep Wrangler JLU 4-Door</strong> — not a universal cut</li>
    <li><strong>True mil-spec PALS / MOLLE webbing</strong> — compatible with standard issue MOLLE pouches</li>
    <li><strong>Mil-spec Bar Tack stitching</strong> on all webbing — built for punishment</li>
    <li><strong>MOLLE pouch included</strong> — mounts anywhere on the PALS system</li>
    <li><strong>Multiple color options</strong> to match your front covers</li>
    <li><strong>Fully fabricated in the USA</strong> — cut, stitched, and embroidered right here at home</li>
  </ul>
</div>

${warnings[variant]}

<div style="background:#2a1a00;border:2px solid #e0a800;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#e0a800;font-weight:bold;font-size:1.05em;margin:0 0 8px;">🎨 Want a fully custom build?</p>
  <p style="margin:0;line-height:1.6;">Choose your own fabrics and colors with the fully customized version.</p>
  <p style="margin:10px 0 0;"><a href="/products/${variant === 'noarm' ? h.rearCustomNoArm : variant === 'witharm' ? h.rearCustomWithArm : h.rearCustom4XE}" style="background:#e0a800;color:#000;padding:8px 18px;border-radius:4px;text-decoration:none;font-weight:bold;">Build Your Custom Rear Bench →</a></p>
</div>

<div style="background:#2a1a00;border:2px solid #e0a800;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#e0a800;font-weight:bold;font-size:1.05em;margin:0 0 8px;">🏁 Complete your interior — matching front covers</p>
  <p style="margin:0 0 10px;line-height:1.6;">Pair these with matching JLU front tactical seat covers.</p>
  <a href="/products/${h.frontStd}" style="background:#e0a800;color:#000;padding:8px 18px;border-radius:4px;text-decoration:none;font-weight:bold;">Shop Matching Front Covers →</a>
</div>

<p style="font-size:1.1em;font-weight:bold;text-align:center;margin-top:24px;color:#fff;">You can find cheaper. You won't find better.</p>

</div>`;
}

function rearCustomDesc(variant) {
  const titles = {
    noarm:   'Fully Customized Rear Bench Tactical Seat Covers — Jeep® Wrangler JLU 2018+ | No Fold-Down Armrest',
    witharm: 'Fully Customized Rear Bench Tactical Seat Covers — Jeep® Wrangler JLU 2018+ | With Fold-Down Armrest',
    '4xe':   'Fully Customized Rear Bench Tactical Seat Covers — Jeep® Wrangler 4XE JLU 2021+ | With Fold-Down Armrest',
  };
  const warnings = {
    noarm:   `<div style="background:#1a0000;border:2px solid #b8001f;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#ff4444;font-weight:bold;font-size:1.05em;margin:0 0 8px;">⚠️ Fitment Warning</p>
  <p style="margin:0;line-height:1.6;">This cover fits JLU rear benches <strong>WITHOUT a fold-down center armrest</strong>. If your JLU has a fold-down armrest, choose the "With Fold-Down Armrest" version. <strong>NOT compatible with 4XE Edition.</strong></p>
</div>`,
    witharm: `<div style="background:#1a0000;border:2px solid #b8001f;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#ff4444;font-weight:bold;font-size:1.05em;margin:0 0 8px;">⚠️ Fitment Warning</p>
  <p style="margin:0;line-height:1.6;">This cover fits JLU rear benches <strong>WITH a fold-down center armrest</strong>. If your JLU does not have an armrest, choose the "No Fold-Down Armrest" version. <strong>NOT compatible with 4XE Edition.</strong></p>
</div>`,
    '4xe':   `<div style="background:#1a0000;border:2px solid #b8001f;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#ff4444;font-weight:bold;font-size:1.05em;margin:0 0 8px;">⚠️ 4XE Edition ONLY</p>
  <p style="margin:0;line-height:1.6;">This cover is designed <strong>specifically for the Jeep Wrangler 4XE</strong> rear bench with fold-down armrest. <strong>NOT for standard JLU.</strong></p>
</div>`,
  };

  return `<div style="background:#000;color:#fff;font-family:Arial,sans-serif;padding:24px;border-radius:8px;">

<h2 style="color:#b8001f;font-size:1.6em;margin-bottom:8px;">${titles[variant]}</h2>

<p style="font-size:1.05em;line-height:1.6;">Build your rear bench exactly the way you want it. Choose your outer fabric, insert color, and configuration for a completely custom rear bench seat cover made for the 2018+ Jeep Wrangler JLU. Every set is made by hand in the USA. <strong>Please allow 6–12 weeks lead time.</strong></p>

${rearCustomCrossLinks(variant)}

<div style="background:#1a1a1a;border-left:4px solid #b8001f;padding:16px;margin:20px 0;border-radius:4px;">
  <ul style="margin:0;padding-left:20px;line-height:1.9;">
    <li><strong>Exact fit for 2018+ Jeep Wrangler JLU 4-Door</strong></li>
    <li><strong>True mil-spec PALS / MOLLE webbing</strong> — compatible with standard issue MOLLE pouches</li>
    <li><strong>Mil-spec Bar Tack stitching</strong> on all webbing</li>
    <li><strong>MOLLE pouch included</strong> — mounts anywhere on the PALS system</li>
    <li><strong>Fully fabricated in the USA</strong> — cut, stitched, and embroidered right here at home</li>
  </ul>
</div>

${warnings[variant]}

<div style="background:#2a1a00;border:2px solid #e0a800;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#e0a800;font-weight:bold;font-size:1.05em;margin:0 0 8px;">🏁 Complete your interior — matching front covers</p>
  <p style="margin:0 0 10px;line-height:1.6;">Pair with fully customized JLU front tactical seat covers.</p>
  <a href="/products/${h.frontCustom}" style="background:#e0a800;color:#000;padding:8px 18px;border-radius:4px;text-decoration:none;font-weight:bold;">Build Matching Front Covers →</a>
</div>

<p style="font-size:1.1em;font-weight:bold;text-align:center;margin-top:24px;color:#fff;">You can find cheaper. You won't find better.</p>

</div>`;
}

// ── FRONT STANDARD DESC (already has description, just add rear block) ────────
async function updateFrontStd() {
  const {product: p} = await req('GET', `/admin/api/2024-01/products/602069172247.json`);
  // Replace existing rear block if present, otherwise append before closing div
  let desc = p.body_html;
  if (desc.includes('Complete your interior')) {
    desc = desc.replace(/<div style="background:#2a1a00[^<]*<\/div>\s*(?=<p style="font-size:1\.1em[^"]*font-weight:bold[^"]*text-align:center)/s, frontStdRearBlock + '\n\n');
  } else {
    desc = desc.replace('<p style="font-size:1.1em;font-weight:bold;text-align:center', frontStdRearBlock + '\n\n<p style="font-size:1.1em;font-weight:bold;text-align:center');
  }
  return req('PUT', `/admin/api/2024-01/products/602069172247.json`, { product: { id: 602069172247, body_html: desc } });
}

// ── FRONT CUSTOM DESC ─────────────────────────────────────────────────────────
async function updateFrontCustom() {
  const {product: p} = await req('GET', `/admin/api/2024-01/products/6948931108907.json`);
  let desc = p.body_html;
  if (desc.includes('Complete your interior')) {
    desc = desc.replace(/<div style="background:#2a1a00[^<]*complete[^>]*>[\s\S]*?<\/div>/i, frontCustomRearBlock);
  } else {
    desc = desc.replace('<p style="font-size:1.1em;font-weight:bold;text-align:center', frontCustomRearBlock + '\n\n<p style="font-size:1.1em;font-weight:bold;text-align:center');
  }
  return req('PUT', `/admin/api/2024-01/products/6948931108907.json`, { product: { id: 6948931108907, body_html: desc } });
}

async function main() {
  const updates = [
    // Standard rears
    { id: 1381624545303, desc: rearStdDesc('noarm'), seoTitle: 'JLU Rear Bench Tactical Seat Covers — No Armrest 2018+ | Bartact', seoDesc: 'Bartact rear bench tactical seat covers for Jeep Wrangler JLU 2018+ without fold-down armrest. Mil-spec MOLLE, made in USA. Not for 4XE.' },
    { id: 1390915911703, desc: rearStdDesc('witharm'), seoTitle: 'JLU Rear Bench Tactical Seat Covers — With Armrest 2018+ | Bartact', seoDesc: 'Bartact rear bench tactical seat covers for Jeep Wrangler JLU 2018+ with fold-down center armrest. Mil-spec MOLLE, made in USA. Not for 4XE.' },
    { id: 6979514007595, desc: rearStdDesc('4xe'), seoTitle: 'Jeep Wrangler 4XE Rear Bench Tactical Seat Covers 2021+ | Bartact', seoDesc: 'Bartact rear bench tactical seat covers for Jeep Wrangler 4XE JLU 2021+. With fold-down armrest. Mil-spec MOLLE, made in USA. 4XE Edition only.' },
    // Custom rears
    { id: 6989961723947, desc: rearCustomDesc('noarm'), seoTitle: 'Fully Customized JLU Rear Bench Seat Covers — No Armrest | Bartact', seoDesc: 'Fully customized rear bench tactical seat covers for Jeep Wrangler JLU 2018+, no fold-down armrest. Build your colors. Made in USA. Not for 4XE.' },
    { id: 6992450977835, desc: rearCustomDesc('witharm'), seoTitle: 'Fully Customized JLU Rear Bench Seat Covers — With Armrest | Bartact', seoDesc: 'Fully customized rear bench tactical seat covers for Jeep Wrangler JLU 2018+ with fold-down armrest. Build your colors. Made in USA. Not for 4XE.' },
    { id: 6992429088811, desc: rearCustomDesc('4xe'), seoTitle: 'Fully Customized 4XE Rear Bench Tactical Seat Covers 2021+ | Bartact', seoDesc: 'Fully customized rear bench tactical seat covers for Jeep Wrangler 4XE JLU 2021+. With fold-down armrest. Build your colors. Made in USA.' },
  ];

  for (const u of updates) {
    const r = await req('PUT', `/admin/api/2024-01/products/${u.id}.json`, { product: { id: u.id, body_html: u.desc } });
    console.log(u.id, r.product ? '✅ desc' : '❌ desc');
    const r1 = await setMetafield(u.id, 'title_tag', u.seoTitle);
    console.log('  SEO title:', r1.metafield ? '✅' : '❌', u.seoTitle);
    const r2 = await setMetafield(u.id, 'description_tag', u.seoDesc);
    console.log('  SEO desc:', r2.metafield ? '✅' : '❌');
  }

  // Update fronts
  const rf = await updateFrontStd();
  console.log('Front std rear block:', rf.product ? '✅' : '❌');
  const rc = await updateFrontCustom();
  console.log('Front custom rear block:', rc.product ? '✅' : '❌');
}

main().catch(console.error);
