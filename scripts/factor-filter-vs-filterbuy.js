// Factor Filter vs FilterBuy — "barely beat" pricing analysis
// Uses real COGS from First Line Filters + FedEx Zone 8 shipping

// FilterBuy bulk pricing (per filter at their best bulk qty)
// For 1" and 2": 12+ price. For 4": 6-11 price. 
// Note: FilterBuy sells MERV 11, we sell MERV 10. Their MERV 11 ≈ our MERV 10 competitor.
// Where we don't have exact FB data, we estimate from known ratios.

// Confirmed FilterBuy 12+ prices (per filter):
const FB = {
  // 1" filters — 12+ price/ea
  '16x25x1': { 8: 6.24, 11: 7.49, 13: 8.24 },
  '20x25x1': { 8: 6.66, 11: 9.41, 13: 11.08 },
  // 2" filters — 12+ price/ea
  '16x25x2': { 8: 8.33, 13: 14.99 },
  '20x25x2': { 8: 9.58, 13: 16.66 },
  // 4" filters — 6-11 price/ea (our case of 6)
  '12x24x4': { 8: null, 13: 23.99 },
  '16x20x4': { 8: null, 13: 21.99 },
  '16x25x4': { 8: 15.99, 13: 22.66 },
  '18x24x4': { 8: 22.99, 13: 26.83 },
  '20x20x4': { 8: null, 13: 24.66 },
  '20x24x4': { 8: null, 13: 27.49 },
  '20x25x4': { 8: 16.66, 11: 20.99, 13: 23.33 },
  '24x24x4': { 8: null, 13: 29.49 },
};

// COGS per filter (First Line Filters)
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

// Shipping per case (FedEx Home Delivery Zone 8, direct account)
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

// Case quantities
function getCaseQty(depth) {
  if (depth === 1 || depth === 2) return 12;
  if (depth === 4) return 6;
  if (depth === 5) return 5;
  return 12;
}

// "Barely beat" = FilterBuy price - $0.01/filter (1 cent under per filter)
// If no FB data, use ratio-based estimate

// Build FilterBuy estimates for sizes we don't have exact data
// Pattern from confirmed data:
// 1" M8: ~$6.24-6.66/ea at 12+. Scales roughly with area.
// 1" M11: ~$7.49-9.41/ea at 12+. ~1.2-1.4x M8.
// 1" M13: ~$8.24-11.08/ea at 12+. ~1.3-1.7x M8.
// 2" M8: ~$8.33-9.58/ea at 12+. ~1.3-1.5x of 1" M8.
// 2" M13: ~$14.99-16.66/ea at 12+. ~1.7-1.8x of 2" M8.
// 4" M8: ~$15.99-22.99/ea at 6+. 
// 4" M13: ~$21.99-29.49/ea at 6+. ~1.3-1.4x of 4" M8.

// For sizes without FB data, estimate using area ratio from nearest known size
function estimateFB(sizeKey, merv) {
  const fb = FB[sizeKey];
  if (fb && fb[merv]) return fb[merv];
  if (fb && fb[11] && merv === 10) return fb[11]; // FB MERV 11 ≈ our MERV 10
  
  // Estimate from known ratios
  const d = parseInt(sizeKey.split('x')[2]);
  const w = parseInt(sizeKey.split('x')[0]);
  const h = parseInt(sizeKey.split('x')[1]);
  const area = w * h;
  
  if (d === 1) {
    // Use 16x25x1 and 20x25x1 as anchors
    const ref16 = FB['16x25x1'];
    const ref20 = FB['20x25x1'];
    const refArea16 = 16*25; // 400
    const refArea20 = 20*25; // 500
    
    let baseM8, baseM11, baseM13;
    if (area <= 400) {
      baseM8 = ref16[8]; baseM11 = ref16[11]; baseM13 = ref16[13];
    } else if (area >= 500) {
      baseM8 = ref20[8]; baseM11 = ref20[11]; baseM13 = ref20[13];
    } else {
      const t = (area - 400) / 100;
      baseM8 = ref16[8] + t * (ref20[8] - ref16[8]);
      baseM11 = ref16[11] + t * (ref20[11] - ref16[11]);
      baseM13 = ref16[13] + t * (ref20[13] - ref16[13]);
    }
    // Scale by area ratio
    const scale = area / 450; // midpoint
    if (merv === 8) return +(baseM8 * scale).toFixed(2);
    if (merv === 10) return +(baseM11 * scale).toFixed(2);
    if (merv === 13) return +(baseM13 * scale).toFixed(2);
  }
  
  if (d === 2) {
    const ref16 = FB['16x25x2'];
    const ref20 = FB['20x25x2'];
    const refArea16 = 400;
    const refArea20 = 500;
    
    let baseM8, baseM13;
    if (area <= 400) {
      baseM8 = ref16[8]; baseM13 = ref16[13];
    } else if (area >= 500) {
      baseM8 = ref20[8]; baseM13 = ref20[13];
    } else {
      const t = (area - 400) / 100;
      baseM8 = ref16[8] + t * (ref20[8] - ref16[8]);
      baseM13 = ref16[13] + t * (ref20[13] - ref16[13]);
    }
    const scale = area / 450;
    if (merv === 8) return +(baseM8 * scale).toFixed(2);
    if (merv === 10) return +((baseM8 * 1.15) * scale).toFixed(2); // M10 ≈ M8 * 1.15
    if (merv === 13) return +(baseM13 * scale).toFixed(2);
  }
  
  if (d === 4) {
    // Use 20x25x4 as anchor
    const ref = FB['20x25x4'];
    const refArea = 500;
    const scale = area / refArea;
    if (merv === 8) return +((ref[8] || 16.66) * scale).toFixed(2);
    if (merv === 10) return +((ref[11] || 20.99) * scale).toFixed(2);
    if (merv === 13) return +((ref[13] || 23.33) * scale).toFixed(2);
  }
  
  if (d === 5) {
    // 5" — FB doesn't sell standard 5", use Honeywell replacement pricing
    // 20x25x5 M13 = $23.99/ea at 4+
    const refArea = 500;
    const scale = area / refArea;
    if (merv === 13) return +(23.99 * scale).toFixed(2);
    if (merv === 10) return +(20.00 * scale).toFixed(2);
    if (merv === 8) return +(17.00 * scale).toFixed(2);
  }
  
  return null;
}

// Now compute everything
const allSizes = Object.keys(COGS).sort((a, b) => {
  const da = parseInt(a.split('x')[2]);
  const db = parseInt(b.split('x')[2]);
  if (da !== db) return da - db;
  return a.localeCompare(b);
});

const results = [];

for (const size of allSizes) {
  const d = parseInt(size.split('x')[2]);
  const caseQty = getCaseQty(d);
  const shipCase = SHIP[size] || 0;
  const shipEa = shipCase / caseQty;
  
  for (const merv of [8, 10, 13]) {
    const cogs = COGS[size]?.[merv];
    if (cogs === undefined) continue;
    
    const fbPrice = estimateFB(size, merv);
    // "Barely beat" = FB price - $0.01
    const beatPrice = fbPrice ? +(fbPrice - 0.01).toFixed(2) : null;
    const beatCase = beatPrice ? +(beatPrice * caseQty).toFixed(2) : null;
    
    const totalCostCase = +(cogs * caseQty + shipCase).toFixed(2);
    const totalCostEa = +(cogs + shipEa).toFixed(2);
    
    const profitCase = beatCase ? +(beatCase - totalCostCase).toFixed(2) : null;
    const profitEa = beatPrice ? +(beatPrice - totalCostEa).toFixed(2) : null;
    const margin = beatCase && beatCase > 0 ? +((profitCase / beatCase) * 100).toFixed(1) : null;
    
    results.push({
      size, merv, caseQty, d,
      cogs, shipEa: +shipEa.toFixed(2), totalCostEa,
      fbPrice, beatPrice, beatCase,
      totalCostCase, profitCase, profitEa, margin,
      fbExact: FB[size]?.[merv] || FB[size]?.[merv === 10 ? 11 : merv] ? true : false,
    });
  }
}

// Print by depth
for (const depth of [1, 2, 4, 5]) {
  const group = results.filter(r => r.d === depth);
  if (group.length === 0) continue;
  
  const caseLabel = depth <= 2 ? 'case of 12' : depth === 4 ? 'case of 6' : 'case of 5';
  console.log(`\n## ${depth}" Filters (${caseLabel}) — "Barely Beat FilterBuy" Pricing`);
  console.log('Filter | MERV | Cost/ea | Ship/ea | Total Cost/ea | FB Price/ea | Our Price/ea | Profit/ea | Margin');
  console.log('---|---|---|---|---|---|---|---|---');
  
  for (const r of group) {
    const fb = r.fbPrice ? '$' + r.fbPrice.toFixed(2) + (r.fbExact ? '' : '~') : '?';
    const beat = r.beatPrice ? '$' + r.beatPrice.toFixed(2) : '?';
    const prof = r.profitEa !== null ? '$' + r.profitEa.toFixed(2) : '?';
    const marg = r.margin !== null ? r.margin + '%' : '?';
    const flag = r.margin !== null && r.margin < 0 ? ' ⛔' : r.margin !== null && r.margin < 15 ? ' ⚠️' : '';
    
    console.log(`${r.size} | ${r.merv} | $${r.cogs.toFixed(2)} | $${r.shipEa.toFixed(2)} | $${r.totalCostEa.toFixed(2)} | ${fb} | ${beat} | ${prof} | ${marg}${flag}`);
  }
}

// Summary
const profitable = results.filter(r => r.margin !== null && r.margin > 0);
const losers = results.filter(r => r.margin !== null && r.margin <= 0);
const thin = results.filter(r => r.margin !== null && r.margin > 0 && r.margin < 15);
const ok = results.filter(r => r.margin !== null && r.margin >= 15 && r.margin < 25);
const good = results.filter(r => r.margin !== null && r.margin >= 25);

console.log('\n## Summary — "Barely Beat FilterBuy"');
console.log('Losing money: ' + losers.length + ' variants');
console.log('Thin margin (<15%): ' + thin.length + ' variants');
console.log('OK (15-25%): ' + ok.length + ' variants');
console.log('Good (25%+): ' + good.length + ' variants');

if (losers.length > 0) {
  console.log('\n⛔ MONEY LOSERS even at FilterBuy pricing:');
  for (const r of losers) {
    console.log(`  ${r.size} M${r.merv}: cost $${r.totalCostEa.toFixed(2)}/ea, FB $${r.fbPrice?.toFixed(2)}/ea, loss $${Math.abs(r.profitEa).toFixed(2)}/filter`);
  }
}

// Average margins by depth
for (const depth of [1, 2, 4, 5]) {
  const group = results.filter(r => r.d === depth && r.margin !== null);
  if (group.length === 0) continue;
  const avgMargin = group.reduce((s, r) => s + r.margin, 0) / group.length;
  console.log(`\n${depth}" avg margin at "barely beat FB": ${avgMargin.toFixed(1)}%`);
  
  for (const merv of [8, 10, 13]) {
    const mg = group.filter(r => r.merv === merv);
    if (mg.length === 0) continue;
    const avg = mg.reduce((s, r) => s + r.margin, 0) / mg.length;
    console.log(`  MERV ${merv}: ${avg.toFixed(1)}%`);
  }
}
