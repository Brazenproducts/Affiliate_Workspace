const https = require('https');
const fs = require('fs');

const STORE = 'factorfilters.myshopify.com';
const TOKEN = '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';
const SS_KEY = '338f293665d846778416b722efcb75a4';
const SS_SECRET = 'fed134d52a514c79be26be6c718aff99';
const ssAuth = Buffer.from(SS_KEY + ':' + SS_SECRET).toString('base64');

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

async function getShipRate(weightLbs, dimL, dimW, dimH) {
  const payload = {
    carrierCode: 'fedex',
    serviceCode: 'fedex_home_delivery',
    fromPostalCode: '74107',
    toPostalCode: '10001',
    toCountry: 'US',
    weight: { value: weightLbs, units: 'pounds' },
    dimensions: { length: dimL, width: dimW, height: dimH, units: 'inches' },
    confirmation: 'none',
    residential: true
  };
  const r = await httpReq({
    hostname: 'ssapi.shipstation.com',
    path: '/shipments/getrates',
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + ssAuth, 'Content-Type': 'application/json' }
  }, payload);
  if (r.statusCode === 200) {
    const rates = JSON.parse(r.body);
    const hd = rates.find(r => r.serviceCode === 'fedex_home_delivery');
    if (hd) return (hd.shipmentCost + hd.otherCost);
  }
  return null;
}

(async () => {
  const products = await getAllProducts();
  console.log('Active products: ' + products.length);

  const rateCache = {};
  const results = [];

  for (const p of products) {
    const dimMatch = p.title.match(/(\d+)X(\d+)X(\d+)/i);
    if (!dimMatch) continue;
    const w = parseInt(dimMatch[1]);
    const h = parseInt(dimMatch[2]);
    const d = parseInt(dimMatch[3]);

    for (const v of p.variants) {
      const caseMatch = v.title.match(/Case of (\d+)/i);
      if (!caseMatch) continue;
      const caseQty = parseInt(caseMatch[1]);
      const weight = parseFloat(v.weight) || 0;
      const price = parseFloat(v.price);

      // Box dims
      const stackHeight = d * caseQty;
      const boxL = Math.max(w, h);
      const boxW = Math.min(w, h);
      const boxH = stackHeight;
      const useWeight = weight > 0 ? weight : 5;

      const cacheKey = boxL + 'x' + boxW + 'x' + boxH + '@' + useWeight;

      if (!(cacheKey in rateCache)) {
        const rate = await getShipRate(useWeight, boxL, boxW, boxH);
        rateCache[cacheKey] = rate;
        await sleep(1600);
        process.stderr.write('.');
      }

      const shipCost = rateCache[cacheKey] || 0;
      const profit = price - shipCost;
      const profitPct = price > 0 ? (profit / price * 100) : 0;
      const perFilter = price / caseQty;
      const shipPerFilter = shipCost / caseQty;
      const profitPerFilter = profit / caseQty;

      results.push({
        size: w + 'x' + h + 'x' + d,
        variant: v.title,
        caseQty,
        retail: price.toFixed(2),
        shipCost: shipCost.toFixed(2),
        profit: profit.toFixed(2),
        profitPct: profitPct.toFixed(1),
        perFilter: perFilter.toFixed(2),
        shipPerFilter: shipPerFilter.toFixed(2),
        profitPerFilter: profitPerFilter.toFixed(2),
        profitPctPerFilter: profitPct.toFixed(1),
      });
    }
  }

  results.sort((a, b) => a.size.localeCompare(b.size) || a.variant.localeCompare(b.variant));

  // Per-case table
  console.log('\n\n=== PER CASE ===');
  console.log('Filter | MERV | Case | Retail | Shipping | Profit | Profit %');
  console.log('---|---|---|---|---|---|---');
  for (const r of results) {
    const merv = r.variant.match(/MERV (\d+)/)?.[1] || '?';
    console.log(r.size + ' | ' + merv + ' | ' + r.caseQty + ' | $' + r.retail + ' | $' + r.shipCost + ' | $' + r.profit + ' | ' + r.profitPct + '%');
  }

  // Per-filter table
  console.log('\n=== PER FILTER ===');
  console.log('Filter | MERV | Case | Retail/ea | Ship/ea | Profit/ea | Profit %');
  console.log('---|---|---|---|---|---|---');
  for (const r of results) {
    const merv = r.variant.match(/MERV (\d+)/)?.[1] || '?';
    console.log(r.size + ' | ' + merv + ' | ' + r.caseQty + ' | $' + r.perFilter + ' | $' + r.shipPerFilter + ' | $' + r.profitPerFilter + ' | ' + r.profitPct + '%');
  }

  // Danger zone
  const losers = results.filter(r => parseFloat(r.profit) <= 0);
  const thin = results.filter(r => parseFloat(r.profitPct) > 0 && parseFloat(r.profitPct) < 30);
  console.log('\n=== SUMMARY ===');
  console.log('Total variants: ' + results.length);
  console.log('Losing money: ' + losers.length);
  console.log('Thin margin (<30%): ' + thin.length);
  console.log('Healthy (30%+): ' + results.filter(r => parseFloat(r.profitPct) >= 30).length);

  if (losers.length > 0) {
    console.log('\nMONEY LOSERS:');
    for (const r of losers) console.log('  ' + r.size + ' ' + r.variant + ': $' + r.retail + ' - $' + r.shipCost + ' = $' + r.profit);
  }
})();
