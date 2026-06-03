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
    const options = { hostname: SHOPIFY_STORE, path, method, headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN, 'Content-Type': 'application/json', ...(payload ? {'Content-Length': Buffer.byteLength(payload)} : {}) } };
    let data = '';
    const r = https.request(options, res => { res.on('data', d => data += d); res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve({raw:data}); } }); });
    r.on('error', reject); if (payload) r.write(payload); r.end();
  });
}

const rtsIds = [
  6935857659947,  // JL 2-door
  6959562358827,  // JK/JKU 2013-18 (v1)
  6959588900907,  // JK/JKU 2013-18 (v2)
  6981954928683,  // TJ 1997-02
  6985626812459,  // JK/JKU 2011-12 (v1)
  6985669017643,  // JK/JKU 2011-12 (v2)
  6985802645547,  // JK/JKU 2007-10 (v1)
  6985833578539,  // JK/JKU 2007-10 (v2)
  7103062376491,  // Gladiator 2019+
];

// Remove any block that contains "ready to ship" or "ready-to-ship"
function removeRTSBlock(html) {
  // Match the containing div block with ready to ship text
  return html.replace(/<div[^>]*>(?:[^<]|<(?!div))*?(?:ready.to.ship|ready-to-ship)(?:[^<]|<(?!\/div))*?<\/div>/gi, '');
}

async function main() {
  for (const id of rtsIds) {
    const { product: p } = await req('GET', `/admin/api/2024-01/products/${id}.json`);
    const cleaned = removeRTSBlock(p.body_html);
    
    // Verify it's actually gone
    if (cleaned.toLowerCase().includes('ready to ship') || cleaned.toLowerCase().includes('ready-to-ship')) {
      console.log(id, '⚠️ still has RTS — needs manual check');
      continue;
    }
    
    const r = await req('PUT', `/admin/api/2024-01/products/${id}.json`, { product: { id, body_html: cleaned } });
    console.log(id, r.product ? '✅ cleaned' : '❌', p.title.substring(0, 60));
  }
}
main().catch(console.error);
