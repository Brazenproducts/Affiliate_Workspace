// 2" filters — Case of 6 pricing model vs FilterBuy/Filter King
// Bigger sizes where case of 12 shipping is nearly 2x

// COGS per filter (First Line Filters)
const COGS = {
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
};

// Shipping for case of 6 (from our rate comparison)
const SHIP6 = {
  '12x24x2': 26.61,
  '16x20x2': 27.86,
  '16x25x2': 31.06,
  '18x24x2': 32.92,
  '18x25x2': 34.17,
  '20x20x2': 31.06,
  '20x24x2': 35.38,
  '20x25x2': 35.93,
  '20x30x2': 40.43,
  // Estimates for sizes not tested
  '14x20x2': 26.61,
  '15x20x2': 27.86,
  '20x35x2': 45.00, // estimate
};

// FilterBuy pricing (per filter)
const FB = {
  '12x24x2': { 8: { p4: 11.45, p6: 9.43, p12: 8.33 }, 13: { p4: 17.08, p6: 15.05, p12: 14.76 } },
  '16x25x2': { 8: { p4: 11.99, p6: 9.99, p12: 8.33 }, 13: { p4: 17.49, p6: 16.66, p12: 14.99 } },
  '20x25x2': { 8: { p4: 12.49, p6: 10.83, p12: 9.58 }, 13: { p4: 19.99, p6: 18.83, p12: 16.66 } },
};

// Filter King pricing (per filter)
const FK = {
  '20x25x2': { 8: { p4: 11.99, p6: 9.16, p12: 8.54 }, 13: { p4: 19.94, p6: 18.78, p12: 16.62 } },
};

console.log('## 2" Filters — Case of 6 Pricing Model');
console.log('Shipping: FedEx Home Delivery Zone 8 (worst case)');
console.log('');
console.log('### Per-Filter Economics (Case of 6)');
console.log('Size | MERV | COGS | Ship/ea | Total Cost | FB 4-pk | FK 4-pk | Price @FB-4% | Profit | Margin');
console.log('---|---|---|---|---|---|---|---|---|---');

const allSizes = Object.keys(COGS).sort();
const results = [];

for (const size of allSizes) {
  const ship6 = SHIP6[size];
  if (!ship6) continue;
  const shipEa = ship6 / 6;
  
  for (const merv of [8, 10, 13]) {
    const cogs = COGS[size][merv];
    if (!cogs) continue;
    
    const totalCost = cogs + shipEa;
    
    // Get competitor prices
    const fb = FB[size]?.[merv];
    const fk = FK[size]?.[merv];
    const fbP4 = fb?.p4 || null;
    const fkP4 = fk?.p4 || null;
    
    // Price at 4% under the higher competitor's 4-pack
    const compP4 = Math.max(fbP4 || 0, fkP4 || 0);
    const ourPrice = compP4 > 0 ? +(compP4 * 0.96).toFixed(2) : null;
    
    // If no competitor data, price at cost + 20% margin
    const fallbackPrice = +(totalCost / 0.80).toFixed(2);
    const usePrice = ourPrice || fallbackPrice;
    
    const profit = +(usePrice - totalCost).toFixed(2);
    const margin = +((profit / usePrice) * 100).toFixed(1);
    const casePrice = +(usePrice * 6).toFixed(2);
    
    results.push({ size, merv, cogs, shipEa: +shipEa.toFixed(2), totalCost: +totalCost.toFixed(2), fbP4, fkP4, usePrice, profit, margin, casePrice });
    
    const fbStr = fbP4 ? '$' + fbP4.toFixed(2) : '—';
    const fkStr = fkP4 ? '$' + fkP4.toFixed(2) : '—';
    const flag = margin < 0 ? ' ⛔' : margin < 10 ? ' ⚠️' : '';
    
    console.log(`${size} | ${merv} | $${cogs.toFixed(2)} | $${shipEa.toFixed(2)} | $${totalCost.toFixed(2)} | ${fbStr} | ${fkStr} | $${usePrice.toFixed(2)} | $${profit.toFixed(2)} | ${margin}%${flag}`);
  }
}

console.log('');
console.log('### Case of 6 Sticker Prices (what customer sees)');
console.log('Size | MERV | Case Price | Per Filter | FB 4-pk/ea | Cheaper than FB?');
console.log('---|---|---|---|---|---');

for (const r of results) {
  const cheaper = r.fbP4 && r.usePrice < r.fbP4 ? 'YES (-$' + (r.fbP4 - r.usePrice).toFixed(2) + ')' : r.fbP4 ? 'NO (+$' + (r.usePrice - r.fbP4).toFixed(2) + ')' : '—';
  console.log(`${r.size} | ${r.merv} | $${r.casePrice.toFixed(2)} | $${r.usePrice.toFixed(2)} | ${r.fbP4 ? '$'+r.fbP4.toFixed(2) : '—'} | ${cheaper}`);
}

// Summary
console.log('');
console.log('### Summary');
const profitable = results.filter(r => r.margin > 0);
const good = results.filter(r => r.margin >= 15);
const ok = results.filter(r => r.margin >= 5 && r.margin < 15);
const thin = results.filter(r => r.margin > 0 && r.margin < 5);
const losers = results.filter(r => r.margin <= 0);

console.log(`Total: ${results.length} variants`);
console.log(`Good (15%+): ${good.length}`);
console.log(`OK (5-15%): ${ok.length}`);
console.log(`Thin (<5%): ${thin.length}`);
console.log(`Losers: ${losers.length}`);

if (losers.length > 0) {
  console.log('\nLosers:');
  for (const r of losers) console.log(`  ${r.size} M${r.merv}: cost $${r.totalCost}, price $${r.usePrice}`);
}
