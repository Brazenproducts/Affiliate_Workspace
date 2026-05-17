const https = require('https');

const STORE = 'factorfilters.myshopify.com';
const TOKEN = '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';

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

// First Line Filters COGS per filter (from Mitch's pricing sheet)
// Key: "WxHxD" -> { 8: cost, 10: cost, 13: cost }
const COGS = {
  // 1" depth
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
  // 2" depth
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
  // 4" depth — reading from screenshot (per filter, case of 6)
  '12x24x4': { 8: 7.87, 10: 8.66, 13: 14.17 },
  '16x20x4': { 8: 7.85, 10: 8.64, 13: 14.13 },
  '16x25x4': { 8: 8.85, 10: 9.74, 13: 15.93 },
  '18x24x4': { 8: 8.51, 10: 9.36, 13: 15.31 },
  '20x20x4': { 8: 8.88, 10: 9.76, 13: 15.97 },
  '20x24x4': { 8: 10.05, 10: 11.05, 13: 18.08 },
  '20x25x4': { 8: 10.00, 10: 11.00, 13: 18.00 },
  '24x24x4': { 8: 11.20, 10: 12.32, 13: 20.16 },
  // 5" depth — per filter, case of 5
  '16x25x5': { 8: 12.22, 10: 13.44, 13: 21.99 },
  '20x20x5': { 8: 12.22, 10: 13.44, 13: 21.99 },
  '20x25x5': { 8: 14.34, 10: 15.77, 13: 25.80 },
};

// Shipping costs from our earlier analysis (FedEx Home Delivery Zone 8, direct account)
const SHIPPING = {
  // 1" x12 cases
  '10x20x1': 22.58, '10x24x1': 24.36, '12x20x1': 24.36, '12x24x1': 26.61,
  '12x25x1': 27.20, '14x18x1': 26.61, '14x20x1': 26.61, '14x24x1': 27.70,
  '14x25x1': 28.54, '14x30x1': 31.93, '15x20x1': 27.20, '16x20x1': 27.86,
  '16x24x1': 30.38, '16x25x1': 31.06, '16x30x1': 35.38, '18x18x1': 29.34,
  '18x20x1': 29.34, '18x24x1': 32.92, '18x25x1': 34.17, '20x20x1': 31.06,
  '20x22x1': 34.17, '20x24x1': 35.38, '20x25x1': 35.93, '20x30x1': 40.43,
  '24x24x1': 40.43, '25x25x1': 42.00,
  // 2" x12 cases
  '12x24x2': 39.57, '14x20x2': 38.27, '15x20x2': 40.43, '16x20x2': 42.00,
  '16x24x2': 47.96, '16x25x2': 48.62, '18x20x2': 45.81, '18x24x2': 67.45,
  '18x25x2': 67.48, '20x20x2': 48.62, '20x24x2': 68.47, '20x25x2': 69.09,
  '20x30x2': 74.23, '20x35x2': 81.83,
  // 4" x6 cases
  '12x24x4': 39.57, '16x20x4': 42.00, '16x25x4': 48.62, '18x24x4': 67.45,
  '20x20x4': 48.62, '20x24x4': 68.47, '20x25x4': 69.09, '24x24x4': 68.47,
  // 5" x5 cases
  '16x25x5': 67.44, '20x20x5': 45.99, '20x25x5': 70.02,
};

(async () => {
  const products = await getAllProducts();
  console.log('Products: ' + products.length);

  const rows = [];

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

      const retail = parseFloat(v.price);
      const cogsPerFilter = COGS[sizeKey]?.[merv];
      const shipPerCase = SHIPPING[sizeKey];

      if (cogsPerFilter === undefined || shipPerCase === undefined) {
        rows.push({
          sizeKey, merv, caseQty, retail,
          cogsCase: '?', shipCase: '?',
          totalCost: '?', profit: '?', margin: '?',
          retailEa: (retail / caseQty).toFixed(2),
          cogsEa: '?', shipEa: '?', profitEa: '?', marginEa: '?',
          missing: true
        });
        continue;
      }

      const cogsCase = cogsPerFilter * caseQty;
      const totalCost = cogsCase + shipPerCase;
      const profit = retail - totalCost;
      const margin = (profit / retail * 100);

      rows.push({
        sizeKey, merv, caseQty, retail,
        cogsCase: cogsCase.toFixed(2),
        shipCase: shipPerCase.toFixed(2),
        totalCost: totalCost.toFixed(2),
        profit: profit.toFixed(2),
        margin: margin.toFixed(1),
        retailEa: (retail / caseQty).toFixed(2),
        cogsEa: cogsPerFilter.toFixed(2),
        shipEa: (shipPerCase / caseQty).toFixed(2),
        profitEa: (profit / caseQty).toFixed(2),
        marginEa: margin.toFixed(1),
        missing: false
      });
    }
  }

  rows.sort((a, b) => {
    const da = parseInt(a.sizeKey.split('x')[2]);
    const db = parseInt(b.sizeKey.split('x')[2]);
    if (da !== db) return da - db;
    if (a.sizeKey !== b.sizeKey) return a.sizeKey.localeCompare(b.sizeKey);
    return a.merv - b.merv;
  });

  // Per-filter table
  console.log('\n## Factor Filter — Full Profit Analysis (Per Filter)');
  console.log('Shipping: FedEx Home Delivery Zone 8 (worst case), direct account');
  console.log('COGS: First Line Filters standard pleat pricing\n');
  console.log('Filter | MERV | Qty | Cost/ea | Ship/ea | Retail/ea | Profit/ea | Margin');
  console.log('---|---|---|---|---|---|---|---');
  for (const r of rows) {
    if (r.missing) {
      console.log(r.sizeKey + ' | ' + r.merv + ' | ' + r.caseQty + ' | ? | ? | $' + r.retailEa + ' | ? | ?');
    } else {
      console.log(r.sizeKey + ' | ' + r.merv + ' | ' + r.caseQty + ' | $' + r.cogsEa + ' | $' + r.shipEa + ' | $' + r.retailEa + ' | $' + r.profitEa + ' | ' + r.marginEa + '%');
    }
  }

  // Per-case table
  console.log('\n## Per Case');
  console.log('Filter | MERV | Qty | COGS | Shipping | Retail | Profit | Margin');
  console.log('---|---|---|---|---|---|---|---');
  for (const r of rows) {
    if (r.missing) {
      console.log(r.sizeKey + ' | ' + r.merv + ' | ' + r.caseQty + ' | ? | ? | $' + r.retail.toFixed(2) + ' | ? | ?');
    } else {
      console.log(r.sizeKey + ' | ' + r.merv + ' | ' + r.caseQty + ' | $' + r.cogsCase + ' | $' + r.shipCase + ' | $' + r.retail.toFixed(2) + ' | $' + r.profit + ' | ' + r.margin + '%');
    }
  }

  // Summary stats
  const valid = rows.filter(r => !r.missing);
  const losers = valid.filter(r => parseFloat(r.profit) <= 0);
  const thin = valid.filter(r => parseFloat(r.margin) > 0 && parseFloat(r.margin) < 20);
  const ok = valid.filter(r => parseFloat(r.margin) >= 20 && parseFloat(r.margin) < 40);
  const good = valid.filter(r => parseFloat(r.margin) >= 40);

  console.log('\n## Summary');
  console.log('Total variants: ' + rows.length);
  console.log('With COGS data: ' + valid.length);
  console.log('Missing COGS: ' + rows.filter(r => r.missing).length);
  console.log('');
  console.log('LOSING MONEY (margin <= 0%): ' + losers.length);
  if (losers.length > 0) {
    for (const r of losers) console.log('  ⛔ ' + r.sizeKey + ' M' + r.merv + ': retail $' + r.retail.toFixed(2) + ', cost $' + r.totalCost + ', loss $' + r.profit);
  }
  console.log('THIN (<20%): ' + thin.length);
  if (thin.length > 0) {
    for (const r of thin) console.log('  ⚠️  ' + r.sizeKey + ' M' + r.merv + ': ' + r.margin + '% ($' + r.profitEa + '/filter)');
  }
  console.log('OK (20-40%): ' + ok.length);
  console.log('GOOD (40%+): ' + good.length);

  // Best and worst
  if (valid.length > 0) {
    const best = valid.reduce((a, b) => parseFloat(a.margin) > parseFloat(b.margin) ? a : b);
    const worst = valid.reduce((a, b) => parseFloat(a.margin) < parseFloat(b.margin) ? a : b);
    console.log('\nBest margin: ' + best.sizeKey + ' M' + best.merv + ' at ' + best.margin + '% ($' + best.profitEa + '/filter)');
    console.log('Worst margin: ' + worst.sizeKey + ' M' + worst.merv + ' at ' + worst.margin + '% ($' + worst.profitEa + '/filter)');
  }
})();
