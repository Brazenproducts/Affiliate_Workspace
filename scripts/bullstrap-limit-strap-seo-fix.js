const https = require('https');

const DOMAIN = 'bull-strap-78.myshopify.com';
const TOKEN = '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';
const PRODUCT_ID = 8259763372305;

function shopifyReq(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: DOMAIN, path, method,
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch(e) { resolve({ status: res.statusCode, raw: d }); } });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  // Get current metafields
  const mf = await shopifyReq('GET', `/admin/api/2024-01/products/${PRODUCT_ID}/metafields.json`);
  console.log('Current metafields:');
  for (const m of (mf.data?.metafields || [])) {
    console.log(`  ${m.namespace}.${m.key} (id:${m.id}) = ${String(m.value).slice(0, 150)}`);
  }

  // New SEO title: target "limit straps" as primary keyword, include "Made in USA" for trust
  const newTitle = 'Limit Straps — Made in USA 4130 Chromoly | Bull Strap';
  // New meta description: 155 chars, keyword-rich, CTA
  const newDesc = 'Bull Strap limit straps with heat-treated 4130 Chromoly ends and quad-wrap 7,000 lb nylon. Made in USA, Berry Compliant. 39 sizes from 6" to 44". Shop now.';

  console.log(`\nNew title tag (${newTitle.length} chars): ${newTitle}`);
  console.log(`New meta desc (${newDesc.length} chars): ${newDesc}`);

  // Set SEO metafields (Shopify uses global.title_tag and global.description_tag)
  const titleMf = await shopifyReq('POST', `/admin/api/2024-01/products/${PRODUCT_ID}/metafields.json`, {
    metafield: { namespace: 'global', key: 'title_tag', value: newTitle, type: 'single_line_text_field' }
  });
  console.log('\nTitle tag set:', titleMf.status, titleMf.data?.metafield?.id ? 'OK' : JSON.stringify(titleMf.data?.errors || titleMf.raw?.slice(0,200)));

  const descMf = await shopifyReq('POST', `/admin/api/2024-01/products/${PRODUCT_ID}/metafields.json`, {
    metafield: { namespace: 'global', key: 'description_tag', value: newDesc, type: 'single_line_text_field' }
  });
  console.log('Meta desc set:', descMf.status, descMf.data?.metafield?.id ? 'OK' : JSON.stringify(descMf.data?.errors || descMf.raw?.slice(0,200)));

  // Verify
  const verify = await shopifyReq('GET', `/admin/api/2024-01/products/${PRODUCT_ID}/metafields.json`);
  console.log('\nVerification — current metafields:');
  for (const m of (verify.data?.metafields || [])) {
    if (m.namespace === 'global' && (m.key === 'title_tag' || m.key === 'description_tag')) {
      console.log(`  ✓ ${m.key} = ${m.value}`);
    }
  }
})();
