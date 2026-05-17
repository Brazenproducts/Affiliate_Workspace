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

async function setMetafield(productId, key, value) {
  const existing = await req('GET', `/admin/api/2024-01/products/${productId}/metafields.json?namespace=global&key=${key}`);
  if (existing.metafields && existing.metafields.length > 0) {
    const mf = existing.metafields[0];
    return req('PUT', `/admin/api/2024-01/metafields/${mf.id}.json`, { metafield: { id: mf.id, value, type: 'single_line_text_field' } });
  }
  return req('POST', `/admin/api/2024-01/products/${productId}/metafields.json`, { metafield: { namespace: 'global', key, value, type: 'single_line_text_field' } });
}

function removeMojaveBlock(html) {
  // Remove any warning block mentioning mojave/392 edition redirect
  return html.replace(/<div[^>]*>(?:[^<]|<(?!div))*?(?:NOT for Mojave|For Mojave Edition ONLY|Wrong edition)(?:[^<]|<(?!\/div))*?<\/div>/gi, '');
}

async function main() {
  const id = 7103062376491;

  // 1. Fix title
  const r1 = await req('PUT', `/admin/api/2024-01/products/${id}.json`, {
    product: { id, title: 'Fully Customized Front Tactical Seat Covers for Jeep® Gladiator 2019+ JT BARTACT - (PAIR) w/ MOLLE | All Editions incl. Mojave | Bartact' }
  });
  console.log('Title:', r1.product ? '✅ ' + r1.product.title.substring(0,80) : '❌');

  // 2. Remove Mojave/392 warning block from description
  const { product: p } = await req('GET', `/admin/api/2024-01/products/${id}.json`);
  const cleaned = removeMojaveBlock(p.body_html);
  const stillHasMojave = cleaned.toLowerCase().includes('not for mojave') || cleaned.toLowerCase().includes('wrong edition');
  
  const r2 = await req('PUT', `/admin/api/2024-01/products/${id}.json`, { product: { id, body_html: cleaned } });
  console.log('Mojave block removed:', !stillHasMojave ? '✅' : '⚠️ still present');

  // 3. Update SEO
  const s1 = await setMetafield(id, 'title_tag', 'Fully Customized Jeep Gladiator Front Tactical Seat Covers | All Editions incl. Mojave | Bartact');
  console.log('SEO title:', s1.metafield ? '✅' : '❌');
  const s2 = await setMetafield(id, 'description_tag', 'Build fully customized front tactical seat covers for Jeep Gladiator 2019+ — all editions including Mojave. Choose trim version, colors, and fabrics. Made in USA.');
  console.log('SEO desc:', s2.metafield ? '✅' : '❌');

  // 4. Archive the standalone Mojave-only Gladiator builder + redirect
  const archive = await req('PUT', '/admin/api/2024-01/products/6949960417323.json', {
    product: { id: 6949960417323, status: 'archived' }
  });
  console.log('Archived Mojave-only builder:', archive.product?.status === 'archived' ? '✅' : '❌');

  const redirect = await req('POST', '/admin/api/2024-01/redirects.json', {
    redirect: {
      path: '/products/fully-customized-front-tactical-seat-covers-for-jeep-gladiator-2021-jt-bartact-pair-for-mojave-edition-only',
      target: '/products/fully-customized-front-tactical-custom-seat-covers-for-jeep-gladiator-2019-jt-bartact-pair-w-molle-not-for-mojave-or-392-edition'
    }
  });
  console.log('Redirect:', redirect.redirect ? '✅' : '❌ ' + JSON.stringify(redirect).substring(0,100));
}
main().catch(console.error);
