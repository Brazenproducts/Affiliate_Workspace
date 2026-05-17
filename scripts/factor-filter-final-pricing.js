const https = require('https');

const STORE = 'factorfilters.myshopify.com';
const TOKEN = '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';
const MIN_MARGIN = 0.15; // 15% floor

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
  let url = '/admin/api/2024-01/products.json?limit=250&status=active';
  while (url) {
    const r = await httpReq({ hostname: STORE, path: url, method: 'GET', headers: { 'X-Shopify-Access-Token': TOKEN } });
    if (r.statusCode !== 200) break;
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
  return r.statusCode;
}

// COGS per filter
const COGS = {
  '10x20x1': { 8: 4.48, 10: 4.93, 13: 8.07 },
  '10x24x1': { 8: 4.55, 10: 5.01, 13: 8.20 },
  '12x20x1': { 8: 4.36, 10: 4.80, 13: 7.85 },
  '12x24x1': { 8: 4.51, 10: 4.96, 13: 8.12 },
  '12x25x1': { 8: 4.71, 10: 5.18, 13: 8.48 },
  '14x18x1': { 8: 5.17, 10: 5.68, 13: 9.30 },
  '14x20x1': { 8: 4.56, 10: 5.02, 13: 8.21 },
  '14x24x1': { 8: 4.78, 10: 5.25, 13: 8.60 },
  '14x25x1': { 8: 4.82, 10: 5.30, 13: 8.67 },
  '14x30x1': { 8: 7.08, 10: 7.79, 13: 12.74 },
  '15x20x1': { 8: 7.16, 10: 7.88, 13: 12.90 },
  '16x20x1': { 8: 4.27, 10: 4.70, 13: 7.69 },
  '16x24x1': { 8: 5.12, 10: 5.63, 13: 9.21 },
  '16x25x1': { 8: 4.69, 10: 5.15, 13: 8.44 },
  '16x30x1': { 8: 8.11, 10: 8.92, 13: 14.60 },
  '18x18x1': { 8: 5.95, 10: 6.54, 13: 10.70 },
  '18x20x1': { 8: 5.17, 10: 5.68, 13: 9.30 },
  '18x24x1': { 8: 5.39, 10: 5.93, 13: 9.70 },
  '18x25x1': { 8: 5.14, 10: 5.66, 13: 9.26 },
  '20x20x1': { 8: 4.67, 10: 5.14, 13: 8.41 },
  '20x22x1': { 8: 5.06, 10: 5.57, 13: 9.12 },
  '20x24x1': { 8: 5.45, 10: 5.99, 13: 9.80 },
  '20x25x1': { 8: 5.08, 10: 5.59, 13: 9.15 },
  '20x30x1': { 8: 5.83, 10: 6.41, 13: 10.49 },
  '24x24x1': { 8: 6.72, 10: 7.39, 13: 12.10 },
  '25x25x1': { 8: 7.05, 10: 7.76, 13: 12.69 },
  '12x24x2': { 8: 4.64, 10: 5.10, 13: 9.81 },
  '14x20x2': { 8: 4.87, 10: 5.36, 13: 10.04 },
  '15x20x2': { 8: 4.91, 10: 5.40, 13: 10.31 },
  '16x20x2': { 8: 4.60, 10: 5.05, 13: 10.07 },
  '16x24x2': { 8: 5.15, 10: 5.66, 13: 11.56 },
  '16x25x2': { 8: 5.06, 10: 5.56, 13: 11.60 },
  '18x20x2': { 8: 5.62, 10: 6.18, 13: 11.97 },
  '18x24x2': { 8: 5.53, 10: 6.09, 13: 12.62 },
  '18x25x2': { 8: 6.18, 10: 6.80, 13: 13.75 },
  '20x20x2': { 8: 5.05, 10: 5.56, 13: 11.56 },
  '20x24x2': { 8: 5.84, 10: 6.42, 13: 13.58 },
  '20x25x2': { 8: 5.68, 10: 6.25, 13: 13.56 },
  '20x30x2': { 8: 7.06, 10: 7.77, 13: 16.69 },
  '20x35x2': { 8: 14.17, 10: 15.59, 13: 25.51 },
  '12x24x4': { 8: 7.87, 10: 8.66, 13: 14.17 },
  '16x20x4': { 8: 7.85, 10: 8.64, 13: 14.13 },
  '16x25x4': { 8: 8.85, 10: 9.74, 13: 15.93 },
  '18x24x4': { 8: 8.51, 10: 9.36, 13: 15.31 },
  '20x20x4': { 8: 8.88, 10: 9.76, 13: 15.97 },
  '20x24x4': { 8: 10.05, 10: 11.05, 13: 18.08 },
  '20x25x4': { 8: 10.00, 10: 11.00, 13: 18.00 },
  '24x24x4': { 8: 11.20, 10: 12.32, 13: 20.16 },
  '16x25x5': { 8: 12.22, 10: 13.44, 13: 21.99 },
  '20x20x5': { 8: 12.22, 10: 13.44, 13: 21.99 },
  '20x25x5': { 8: 14.34, 10: 15.77, 13: 25.80 },
};

// Shipping per case (FedEx Home Delivery Zone 8)
const SHIP = {
  '10x20x1': 22.58, '10x24x1': 24.36, '12x20x1': 24.36, '12x24x1': 26.61,
  '12x25x1': 27.20, '14x18x1': 26.61, '14x20x1': 26.61, '14x24x1': 27.70,
  '14x25x1': 28.54, '14x30x1': 31.93, '15x20x1': 27.20, '16x20x1': 27.86,
  '16x24x1': 30.38, '16x25x1': 31.06, '16x30x1': 35.38, '18x18x1': 29.34,
  '18x20x1': 29.34, '18x24x1': 32.92, '18x25x1': 34.17, '20x20x1': 31.06,
  '20x22x1': 34.17, '20x24x1': 35.38, '20x25x1': 35.93, '20x30x1': 40.43,
  '24x24x1': 40.43, '25x25x1': 42.00,
  '12x24x2': 39.57, '14x20x2': 38.27, '15x20x2': 40.43, '16x20x2': 42.00,
  '16x24x2': 47.96, '16x25x2': 48.62, '18x20x2': 45.81, '18x24x2': 67.45,
  '18x25x2': 67.48, '20x20x2': 48.62, '20x24x2': 68.47, '20x25x2': 69.09,
  '20x30x2': 74.23, '20x35x2': 81.83,
  '12x24x4': 39.57, '16x20x4': 42.00, '16x25x4': 48.62, '18x24x4': 67.45,
  '20x20x4': 48.62, '20x24x4': 68.47, '20x25x4': 69.09, '24x24x4': 68.47,
  '16x25x5': 67.44, '20x20x5': 45.99, '20x25x5': 70.02,
};

// FilterBuy 4-pack prices (per filter) — confirmed via browser
const FB4 = {
  '12x24x1': { 8: 8.49, 13: 12.49 },  // estimated from 12x24x2 ratio
  '16x20x1': { 8: 8.24, 13: 11.99 },
  '16x25x1': { 8: 8.49, 13: 11.24 },
  '20x20x1': { 8: 7.49, 13: 11.49 },
  '20x25x1': { 8: 9.49, 11: 11.24, 13: 14.99 },
  '12x24x2': { 8: 11.45, 13: 17.08 },
  '16x25x2': { 8: 11.99, 13: 17.49 },
  '20x25x2': { 8: 12.49, 13: 19.99 },
  '12x24x4': { 13: 23.99 },
  '16x20x4': { 13: 21.99 },
  '16x25x4': { 8: 18.74, 13: 27.49 },
  '18x24x4': { 8: 25.74, 13: 29.99 },
  '20x20x4': { 13: 24.66 },
  '20x24x4': { 13: 27.49 },
  '20x25x4': { 8: 19.99, 11: 24.49, 13: 26.49 },
  '24x24x4': { 13: 29.49 },
};

function getCaseQty(depth) {
  if (depth <= 2) return 12;
  if (depth === 4) return 6;
  if (depth === 5) return 5;
  return 12;
}

function calcPrice(sizeKey, merv, caseQty) {
  const cogs = COGS[sizeKey]?.[merv];
  const shipCase = SHIP[sizeKey];
  if (cogs === undefined || shipCase === undefined) return null;

  const totalCostCase = cogs * caseQty + shipCase;
  const totalCostEa = totalCostCase / caseQty;

  // Get FilterBuy 4-pack price if available
  const fbPrice = FB4[sizeKey]?.[merv] || FB4[sizeKey]?.[merv === 10 ? 11 : null] || null;

  // Strategy: 4% under FilterBuy's 4-pack, but minimum 15% margin
  let targetPrice;
  if (fbPrice) {
    targetPrice = +(fbPrice * 0.96).toFixed(2);
  } else {
    // No competitor data — use 20% margin as default
    targetPrice = +(totalCostEa / 0.80).toFixed(2);
  }

  // Apply 15% margin floor
  const minPrice = +(totalCostEa / (1 - MIN_MARGIN)).toFixed(2);
  const finalPrice = Math.max(targetPrice, minPrice);

  // Round case price to .99
  const casePrice = +(finalPrice * caseQty).toFixed(2);
  const roundedCase = Math.floor(casePrice) + 0.99;
  const finalCasePrice = roundedCase;
  const finalPerFilter = +(finalCasePrice / caseQty).toFixed(2);

  const profit = +(finalCasePrice - totalCostCase).toFixed(2);
  const margin = +((profit / finalCasePrice) * 100).toFixed(1);
  const usedFloor = minPrice > targetPrice;

  return { finalCasePrice, finalPerFilter, totalCostCase, totalCostEa, profit, margin, fbPrice, usedFloor, minPrice, targetPrice };
}

(async () => {
  const products = await getAllProducts();
  console.log('Products: ' + products.length);

  let updates = 0;
  let errors = 0;
  let skipped = 0;
  const changes = [];

  for (const p of products) {
    const dimMatch = p.title.match(/(\d+)X(\d+)X(\d+)/i);
    if (!dimMatch) continue;
    const w = parseInt(dimMatch[1]);
    const h = parseInt(dimMatch[2]);
    const d = parseInt(dimMatch[3]);
    const sizeKey = w + 'x' + h + 'x' + d;

    for (const v of p.variants) {
      const mervMatch = v.title.match(/MERV (\d+)/);
      if (!mervMatch) continue;
      const merv = parseInt(mervMatch[1]);

      const caseMatch = v.title.match(/Case of (\d+)/i);
      if (!caseMatch) continue;
      const caseQty = parseInt(caseMatch[1]);

      const currentPrice = parseFloat(v.price);
      const calc = calcPrice(sizeKey, merv, caseQty);
      if (!calc) { skipped++; continue; }

      const newPrice = calc.finalCasePrice.toFixed(2);
      
      // Skip if within 1% of current
      if (Math.abs(currentPrice - calc.finalCasePrice) / currentPrice < 0.01) {
        continue;
      }

      const floorFlag = calc.usedFloor ? ' [FLOOR]' : '';
      const fbFlag = calc.fbPrice ? ' (FB4=$' + (calc.fbPrice * caseQty).toFixed(2) + ')' : '';
      
      console.log(`${sizeKey} M${merv} (${caseQty}): $${currentPrice} -> $${newPrice} | margin ${calc.margin}%${floorFlag}${fbFlag}`);

      const status = await updateVariantPrice(v.id, newPrice);
      if (status === 200) {
        updates++;
        changes.push({
          size: sizeKey, merv, caseQty,
          was: currentPrice, now: calc.finalCasePrice,
          margin: calc.margin, usedFloor: calc.usedFloor,
          fbCase: calc.fbPrice ? +(calc.fbPrice * caseQty).toFixed(2) : null
        });
      } else {
        errors++;
        console.log('  ERROR: ' + status);
      }
      await sleep(500);
    }
  }

  console.log('\n=== COMPLETE ===');
  console.log('Updated: ' + updates + ', Errors: ' + errors + ', Skipped (no data): ' + skipped);

  // Summary table
  if (changes.length > 0) {
    console.log('\n=== CHANGES ===');
    console.log('Size | MERV | Qty | Was | Now | Margin | Floor? | FB 4-pk case');
    for (const c of changes) {
      console.log(`${c.size} | ${c.merv} | ${c.caseQty} | $${c.was.toFixed(2)} | $${c.now.toFixed(2)} | ${c.margin}% | ${c.usedFloor ? 'YES' : 'no'} | ${c.fbCase ? '$'+c.fbCase.toFixed(2) : '—'}`);
    }

    const floored = changes.filter(c => c.usedFloor);
    const competitive = changes.filter(c => !c.usedFloor);
    console.log(`\nCompetitive (under FB): ${competitive.length}`);
    console.log(`Floor applied (above FB): ${floored.length}`);
    console.log(`Avg margin: ${(changes.reduce((s,c) => s + c.margin, 0) / changes.length).toFixed(1)}%`);
  }
})();
