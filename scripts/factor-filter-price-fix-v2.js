const https = require('https');

const STORE = 'factorfilters.myshopify.com';
const TOKEN = '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';
const DISCOUNT = 0.04; // 4% under FilterBuy

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
  return { statusCode: r.statusCode, body: r.body.slice(0, 200) };
}

// FilterBuy MERV 13 pricing — 6-pack price per filter (our case of 6 equivalent)
// Source: browser scrape 2026-05-04
const filterbuyM13_6pack = {
  '12x24x4': { perFilter: 23.99, casePrice: 143.94 },
  '16x20x4': { perFilter: 21.99, casePrice: 131.94 },
  '16x25x4': { perFilter: 22.66, casePrice: 135.96 },
  '18x24x4': { perFilter: 26.83, casePrice: 160.98 },
  '20x20x4': { perFilter: 24.66, casePrice: 147.96 },
  '20x24x4': { perFilter: 27.49, casePrice: 164.94 },
  '20x25x4': { perFilter: 23.33, casePrice: 139.98 },
  '24x24x4': { perFilter: 29.49, casePrice: 176.94 },
};

// 5" filters — FilterBuy sells as brand replacements, 4-pack pricing
// Honeywell 20x25x5 MERV 13: $23.99/ea for 4+ = $119.95 for 5 (extrapolated)
// Using ~$24/ea as baseline for 5" MERV 13
const filterbuyM13_5pack = {
  '16x25x5': { perFilter: 24.00, casePrice: 120.00 },  // estimated from similar
  '20x20x5': { perFilter: 24.00, casePrice: 120.00 },
  '20x25x5': { perFilter: 23.99, casePrice: 119.95 },
};

function getTargetPrice(sizeKey, thickness, caseQty) {
  let fbData;
  if (thickness === 5) {
    fbData = filterbuyM13_5pack[sizeKey];
  } else {
    fbData = filterbuyM13_6pack[sizeKey];
  }
  
  if (!fbData) return null;
  
  // Calculate our price: FilterBuy case price * (1 - discount), rounded to .99
  const target = fbData.casePrice * (1 - DISCOUNT);
  // Round to nearest .99
  const rounded = Math.floor(target) + 0.99;
  // But if that's higher than the discounted price, go one dollar lower
  if (rounded > target) return (rounded - 1).toFixed(2);
  return rounded.toFixed(2);
}

(async () => {
  const products = await getAllProducts();
  console.log('Total products:', products.length);
  
  let updates = 0;
  let errors = 0;
  const changes = [];

  for (const p of products) {
    const dimMatch = p.title.match(/(\d+)X(\d+)X(\d+)/i);
    if (!dimMatch) continue;
    const w = parseInt(dimMatch[1]);
    const h = parseInt(dimMatch[2]);
    const d = parseInt(dimMatch[3]);
    const sizeKey = w + 'x' + h + 'x' + d;

    for (const v of p.variants) {
      if (!v.title.includes('MERV 13')) continue;
      
      const caseMatch = v.title.match(/Case of (\d+)/i);
      if (!caseMatch) continue;
      const caseQty = parseInt(caseMatch[1]);
      
      // Only fix 4" and 5" filters
      if (d < 4) continue;
      
      const currentPrice = parseFloat(v.price);
      const targetPrice = getTargetPrice(sizeKey, d, caseQty);
      
      if (!targetPrice) {
        console.log('NO FB DATA: ' + sizeKey + ' ' + v.title + ' (current $' + currentPrice + ')');
        continue;
      }
      
      const tp = parseFloat(targetPrice);
      
      // Skip if already within 2% of target
      if (Math.abs(currentPrice - tp) / tp < 0.02) {
        console.log('ALREADY OK: ' + sizeKey + ' ' + v.title + ' $' + currentPrice + ' (target $' + targetPrice + ')');
        continue;
      }
      
      const fbKey = d === 5 ? filterbuyM13_5pack[sizeKey] : filterbuyM13_6pack[sizeKey];
      const fbCase = fbKey ? fbKey.casePrice : '?';
      
      console.log('UPDATE: ' + sizeKey + ' ' + v.title + ': $' + currentPrice + ' -> $' + targetPrice + ' (FB=$' + fbCase + ', -4%=$' + (fbCase * 0.96).toFixed(2) + ')');
      
      const result = await updateVariantPrice(v.id, targetPrice);
      if (result.statusCode === 200) {
        updates++;
        changes.push({ size: sizeKey, variant: v.title, was: currentPrice, now: tp, filterbuy: fbCase });
        console.log('  OK');
      } else {
        errors++;
        console.log('  ERROR: ' + result.statusCode);
      }
      await sleep(500);
    }
  }

  console.log('\n=== COMPLETE ===');
  console.log('Updated: ' + updates + ', Errors: ' + errors);
  
  if (changes.length > 0) {
    console.log('\n=== PRICE CHANGES ===');
    console.log('Size | Variant | Was | Now | FilterBuy | Discount');
    for (const c of changes) {
      const pct = ((c.filterbuy - c.now) / c.filterbuy * 100).toFixed(1);
      console.log(c.size + ' | ' + c.variant + ' | $' + c.was + ' | $' + c.now + ' | $' + c.filterbuy + ' | ' + pct + '% under');
    }
  }
})();
