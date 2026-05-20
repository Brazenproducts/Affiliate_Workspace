const https = require('https');

const STORE = 'factorfilters.myshopify.com';
const TOKEN = 'process.env.SHOPIFY_TOKEN';

function httpReq(opts, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getAllProducts() {
  let all = [];
  let url = '/admin/api/2024-01/products.json?limit=250';
  while (url) {
    const r = await httpReq({ hostname: STORE, path: url, method: 'GET', headers: { 'X-Shopify-Access-Token': TOKEN } });
    if (r.statusCode !== 200) { console.error('Fetch error:', r.statusCode); break; }
    const data = JSON.parse(r.body);
    all = all.concat(data.products || []);
    const link = r.headers['link'];
    if (link && link.includes('rel="next"')) {
      const m = link.match(/<https:\/\/[^/]+([^>]+)>;\s*rel="next"/);
      url = m ? m[1] : null;
    } else url = null;
  }
  return all;
}

async function updateVariantPrice(variantId, newPrice) {
  const body = JSON.stringify({ variant: { id: variantId, price: newPrice } });
  const r = await httpReq({
    hostname: STORE,
    path: '/admin/api/2024-01/variants/' + variantId + '.json',
    method: 'PUT',
    headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' }
  }, body);
  return { statusCode: r.statusCode, body: r.body.slice(0, 200) };
}

// FilterBuy 6-pack prices for reference (what we're undercutting):
// 12x24x4 M13: ~$130 (estimated from similar sizes)
// 16x20x4 M13: ~$130
// 16x25x4 M13: $135.96
// 18x24x4 M13: $160.98
// 20x20x4 M13: ~$130
// 20x24x4 M13: ~$155
// 20x25x4 M13: $139.98
// 16x25x5 M13: ~$160+
// 20x20x5 M13: ~$160+
// 20x25x5 M13: ~$170+

// Our new prices (just under FilterBuy):
// For MERV 13 case-of-6 (4" filters): price based on FilterBuy comparison
// For MERV 13 case-of-5 (5" filters): price higher since 5" is premium
// For MERV 13 case-of-12 (1" and 2"): these seem correctly priced already, skip

(async () => {
  const products = await getAllProducts();
  console.log('Total products:', products.length);

  let updates = 0;
  let errors = 0;

  for (const p of products) {
    const title = p.title;
    // Parse filter dims
    const dimMatch = title.match(/(\d+)X(\d+)X(\d+)/i);
    if (!dimMatch) continue;
    const w = parseInt(dimMatch[1]);
    const h = parseInt(dimMatch[2]);
    const d = parseInt(dimMatch[3]);
    const sizeKey = w + 'x' + h + 'x' + d;

    for (const v of p.variants) {
      const vTitle = v.title;
      const currentPrice = parseFloat(v.price);

      // Only fix MERV 13 variants that are underpriced
      if (!vTitle.includes('MERV 13')) continue;

      // Get case qty
      const caseMatch = vTitle.match(/Case of (\d+)/i);
      if (!caseMatch) continue;
      const caseQty = parseInt(caseMatch[1]);

      // Find the MERV 8 price for same product to sanity check
      const merv8Variant = p.variants.find(vv => vv.title.includes('MERV 8'));
      const merv8Price = merv8Variant ? parseFloat(merv8Variant.price) : null;

      // If MERV 13 is already more expensive than MERV 8, it's probably fine
      if (merv8Price && currentPrice > merv8Price * 1.2) {
        console.log('SKIP (already priced ok): ' + sizeKey + ' ' + vTitle + ' $' + currentPrice + ' (M8=$' + merv8Price + ')');
        continue;
      }

      // Calculate new price based on thickness and size
      let newPrice;
      if (d === 4 && caseQty === 6) {
        // 4" filters, case of 6 — price just under FilterBuy
        if (w <= 12 && h <= 24) newPrice = '125.99';
        else if (w <= 16 && h <= 20) newPrice = '125.99';
        else if (w <= 16 && h <= 25) newPrice = '129.99';
        else if (w <= 18 && h <= 24) newPrice = '154.99';
        else if (w <= 20 && h <= 20) newPrice = '129.99';
        else if (w <= 20 && h <= 24) newPrice = '154.99';
        else if (w <= 20 && h <= 25) newPrice = '134.99';
        else newPrice = '154.99'; // default for larger
      } else if (d === 5 && caseQty === 5) {
        // 5" filters, case of 5 — premium pricing
        if (w <= 16) newPrice = '149.99';
        else if (w <= 20 && h <= 20) newPrice = '149.99';
        else newPrice = '164.99';
      } else if (d >= 4 && caseQty === 12) {
        // Thick filters in case of 12? Unlikely but handle
        newPrice = null; // skip
      } else {
        // 1" or 2" MERV 13 — check if underpriced vs MERV 8
        if (merv8Price && currentPrice < merv8Price) {
          // MERV 13 cheaper than MERV 8 = definitely wrong
          // Price at MERV 8 * 1.65 (FilterBuy ratio is ~1.4-1.5x, we go slightly higher)
          newPrice = (merv8Price * 1.65).toFixed(2);
        } else {
          continue; // seems ok
        }
      }

      if (!newPrice) continue;

      console.log('UPDATE: ' + sizeKey + ' ' + vTitle + ': $' + currentPrice + ' -> $' + newPrice + (merv8Price ? ' (M8=$' + merv8Price + ')' : ''));
      const result = await updateVariantPrice(v.id, newPrice);
      if (result.statusCode === 200) {
        updates++;
        console.log('  ✅ Done');
      } else {
        errors++;
        console.log('  ❌ Error: ' + result.statusCode + ' ' + result.body);
      }
      await sleep(500); // rate limit
    }
  }

  console.log('\n=== COMPLETE ===');
  console.log('Updated: ' + updates);
  console.log('Errors: ' + errors);
})();
