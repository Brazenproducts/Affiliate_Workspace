require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');
const SHOPIFY_STORE = 'bartact.myshopify.com';
const SHOPIFY_TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = { hostname: SHOPIFY_STORE, path, method, headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN, 'Content-Type': 'application/json', ...(payload ? {'Content-Length': Buffer.byteLength(payload)} : {}) } };
    let data = '';
    const r = https.request(options, res => { res.on('data', d => data += d); res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve({raw:data}); } }); });
    r.on('error', reject); if (payload) r.write(payload); r.end();
  });
}

if (!process.env.BARTACT_CONFIRMED) {
  console.error('ERROR: Set BARTACT_CONFIRMED=1 to run this script against Bartact Shopify.');
  console.error('Example: BARTACT_CONFIRMED=1 node ' + require('path').basename(__filename));
  process.exit(1);
}

async function main() {
  const {product: p} = await req('GET', '/admin/api/2024-01/products/7103062376491.json');
  let desc = p.body_html;

  // Remove old plain-text paragraph with outdated "NOT for Mojave" title
  desc = desc.replace(/<p>Fully Customized Front Tactical[\s\S]*?<\/p>/i, '');

  // Remove "PLEASE NOTE" separate listing sentence
  desc = desc.replace(/\*PLEASE NOTE, THESE ARE SIZE SPECIFIC[\s\S]*?SEPARATE LISTING\.<br[^>]*>/i, '');

  // Add clean Mojave-included note after the crosslink div
  const noteBlock = [
    '<div style="background:#1a1a1a;border-left:4px solid #b8001f;padding:12px 16px;margin-bottom:16px;">',
    '<p style="margin:0;color:#ffffff;font-size:1em;line-height:1.6;">',
    '\uD83C\uDFD4\uFE0F <strong>Mojave Edition is now included</strong> \u2014 select your trim version (Standard or Mojave) and seat adjusters in the builder below.',
    '</p>',
    '</div>'
  ].join('');

  desc = desc.replace('</div>\n\n\n\n<p>', '</div>\n\n' + noteBlock + '\n\n<p>');
  if (!desc.includes(noteBlock)) {
    // fallback — insert after first closing crosslink div
    desc = desc.replace('</div>', '</div>\n\n' + noteBlock);
  }

  const r = await req('PUT', '/admin/api/2024-01/products/7103062376491.json', { product: { id: 7103062376491, body_html: desc } });
  const stillHas = r.product.body_html.toLowerCase().includes('not for mojave');
  console.log('Updated:', r.product ? 'OK' : 'FAIL');
  console.log('Old Mojave text gone:', !stillHas ? 'YES' : 'STILL PRESENT');
  // Show first 500 chars of cleaned desc
  console.log(r.product.body_html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').substring(0, 300));
}
main().catch(console.error);
