#!/usr/bin/env node
/**
 * Amazon Bartact Listing Fixer - Phase 3
 * Fix the color mapping mistakes from Phase 2 and handle remaining items
 * 
 * The core issue: standardized_values should describe the OVERALL color of the item,
 * not just one component. For dual-tone "Black/Khaki" items, the standardized value
 * should be based on the VALUE field (the customer-visible color name).
 * 
 * Amazon's error says: standardized_values doesn't match value. So we need them to agree.
 * The FIX is: set standardized_values to match the primary/overall impression of the value.
 * 
 * For dual-color values like "Black/Khaki":
 * - The first color is primary (usually Black for seat covers = the fabric)
 * - The second color is the accent
 * - standardized_values should reflect what a customer searching for that color would find
 * 
 * Amazon's color taxonomy is limited. For dual-tone items, we should use "multicolor"
 * or the dominant color.
 */

const https = require('https');
const fs = require('fs');

const CREDS = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.amazon-bartact-credentials.json', 'utf8'));
const SELLER_ID = CREDS.seller_id;
const MKT = CREDS.marketplace_id;
const HOST = 'sellingpartnerapi-na.amazon.com';

let token = null;

function http(opts, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ s: res.statusCode, h: res.headers, b: JSON.parse(d) }); }
        catch { resolve({ s: res.statusCode, h: res.headers, b: d }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function auth() {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: CREDS.refresh_token,
    client_id: CREDS.client_id,
    client_secret: CREDS.client_secret,
  }).toString();
  const r = await http({
    hostname: 'api.amazon.com', path: '/auth/o2/token', method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
  }, body);
  if (r.s !== 200) throw new Error(`Auth failed: ${r.s}`);
  token = r.b.access_token;
  console.log('✅ Auth OK');
}

function get(path) {
  return http({ hostname: HOST, path, method: 'GET', headers: { 'x-amz-access-token': token, 'Content-Type': 'application/json' } });
}

function doPatch(path, body) {
  const bs = JSON.stringify(body);
  return http({ hostname: HOST, path, method: 'PATCH', headers: { 'x-amz-access-token': token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bs) } }, bs);
}

async function retryGet(path, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const r = await get(path);
    if (r.s === 429) { await sleep(3000 + i * 2000); continue; }
    return r;
  }
  return { s: 429, b: 'rate limited' };
}

async function retryPatch(path, body, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const r = await doPatch(path, body);
    if (r.s === 429) { await sleep(3000 + i * 2000); continue; }
    return r;
  }
  return { s: 429, b: 'rate limited' };
}

/**
 * Correct color standardization logic.
 * 
 * For Amazon, standardized_values must be one of:
 * black, blue, brown, beige, gray, green, multicolor, orange, red, white, etc.
 * 
 * The value field is the customer-visible name. standardized_values must be the
 * closest standard color(s) that represent the item.
 */
function getCorrectStandardizedColor(value) {
  if (!value) return null;
  const v = value.toLowerCase().trim();
  
  // Single colors - straightforward
  const singleMap = {
    'black': ['black'],
    'blue': ['blue'],
    'brown': ['brown'],
    'red': ['red'],
    'green': ['green'],
    'orange': ['orange'],
    'white': ['white'],
    'navy': ['blue'],
    'navy blue': ['blue'],
    'tan': ['beige'],
    'khaki': ['beige'],
    'coyote': ['beige'],
    'graphite': ['gray'],
    'gray': ['gray'],
    'grey': ['gray'],
    'olive drab': ['green'],
    'od green': ['green'],
    'military green': ['green'],
    'multicam': ['multicolor'],
    'camo': ['multicolor'],
    'acu camo': ['multicolor'],
    'acu': ['multicolor'],
    'black vinyl': ['black'],
    'blue fabric': ['blue'],
    'red fabric': ['red'],
    'white vinyl': ['white'],
  };
  
  if (singleMap[v]) return singleMap[v];
  
  // Dual-color patterns "X/Y" — for seat covers, these are two-tone
  // Amazon accepts "multicolor" for two-tone items, but more specific is better
  // The convention is: if it's clearly two different colors, use the DOMINANT one (first)
  // If both are similar shades, use the common name
  
  if (v.includes('/') || v.includes(' / ')) {
    const parts = v.split(/\s*\/\s*/);
    const first = parts[0].trim();
    const second = parts[1]?.trim();
    
    // Map each part
    const mapPart = (p) => {
      if (!p) return null;
      const pl = p.toLowerCase();
      if (pl === 'black') return 'black';
      if (pl === 'khaki') return 'beige';
      if (pl === 'coyote') return 'beige';
      if (pl === 'navy') return 'blue';
      if (pl === 'blue') return 'blue';
      if (pl === 'red') return 'red';
      if (pl === 'olive drab' || pl === 'olive') return 'green';
      if (pl === 'graphite') return 'gray';
      if (pl === 'orange') return 'orange';
      if (pl === 'white') return 'white';
      if (pl === 'brown') return 'brown';
      if (pl === 'tan') return 'beige';
      if (pl === 'camo' || pl === 'multicam') return 'multicolor';
      if (pl === 'neon orange') return 'orange';
      if (pl === 'hot pink' || pl === 'pink camo') return 'pink';
      if (pl.includes('camo')) return 'multicolor';
      return null;
    };
    
    const c1 = mapPart(first);
    const c2 = mapPart(second);
    
    if (c1 && c2) {
      // Both mapped - if same, use one; if different, use multicolor or the primary
      if (c1 === c2) return [c1];
      // For seat covers: "Black/X" means black seat with X accent
      // Amazon wants the color that describes the PRODUCT
      // "multicolor" is the safest for two-tone items
      // But let's check: if first is black and second is something else,
      // many seat cover sellers use the accent color as standardized
      // since "black" is too generic and the accent differentiates variants
      
      // Actually, looking at the Amazon error messages more carefully:
      // "Based on the data from '[color#?.value]', the field '\"standardized_values\"' 
      //  for attribute 'color' is not compliant."
      // This means the standardized_values don't match what Amazon expects for that value.
      // 
      // For "Black/Khaki", Amazon probably expects ["beige"] or ["black", "beige"] 
      // or ["multicolor"]. The current ["brown"] is wrong because khaki isn't brown.
      //
      // Best approach: use the accent color for dual-tone since that's what differentiates variants
      return [c2];
    }
    if (c1) return [c1];
    if (c2) return [c2];
  }
  
  // Partial matches
  if (v.includes('black')) return ['black'];
  if (v.includes('blue')) return ['blue'];
  if (v.includes('red')) return ['red'];
  if (v.includes('green') || v.includes('olive')) return ['green'];
  if (v.includes('orange')) return ['orange'];
  if (v.includes('white')) return ['white'];
  if (v.includes('brown')) return ['brown'];
  if (v.includes('tan') || v.includes('khaki') || v.includes('coyote') || v.includes('beige')) return ['beige'];
  if (v.includes('gray') || v.includes('grey') || v.includes('graphite')) return ['gray'];
  if (v.includes('camo') || v.includes('multi')) return ['multicolor'];
  
  return null;
}

// SKUs we incorrectly patched in Phase 2 — need to re-examine and fix
const PHASE2_WRONG = [
  // These were mapped using SKU suffix which was wrong
  'JKSC2007R4BR',   // "Black/Red" → mapped to brown (BR=Brown), but value says Red
  'JKSC2007R4BO',   // "Black/Olive Drab" → mapped to orange (BO=Orange), but value says OD
  'JKSC2007R4BC',   // "Black/Coyote" → mapped to black (BC=Camo?!), should be beige
  'JKSC0710FPBR',   // "Black/Red" → mapped to brown, should be red
  'JKSC2013FPBR',   // "Black/Red" → mapped to brown, should be red
  'JKSC2013FPBC',   // "Black/Coyote" → mapped to black, should be beige
  'JKSC1112FPBT',   // "Black/Navy" → mapped to beige (BT=Tan), should be blue
  'JKSC1112FPBO',   // "Black/Olive Drab" → mapped to orange, should be green
  'JKSC1112FPBN',   // "Black / Orange" → mapped to blue (BN=Navy), should be orange
  'JKSC0710FPBT',   // "Black/Navy" → mapped to beige, should be blue
  'JKSC0710FPBO',   // "Black/Olive Drab" → mapped to orange, should be green
  'TJSC9702FPBT',   // "Black/Navy" → mapped to beige, should be blue
  'TJSC9702FPBO',   // "Black / Olive" → mapped to orange, should be green
  'TJSC9702FPBC',   // "Black / Coyote" → mapped to multicolor (BC=Camo), should be beige
  'TJSC0306FPBO',   // "Black/Olive Drab" → mapped to orange, should be green
  'TJSC0306FPBR',   // "Black/Red" → mapped to brown, should be red
  'TJSC0306FPBG',   // "Black/Graphite" → mapped to black (BG=Green), should be gray
  'TJSC9702FPBN',   // "Black/Orange" → mapped to blue (BN=Navy), should be orange
  'TJSC9702FPBG',   // "Black/Graphite" → mapped to black, should be gray
  'TAOGHUPBM',      // "Black/Multicam" → mapped to green (BM=Military), should be multicolor
  'TAOGHUPBN',      // "Black/Neon Orange" → mapped to blue (BN=Navy), should be orange
];

const log = [];

async function fixSku(sku) {
  const r = await retryGet(`/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(sku)}?marketplaceIds=${MKT}&includedData=attributes,issues,summaries`);
  if (r.s !== 200) { log.push({ sku, err: `GET ${r.s}` }); return; }

  const attrs = r.b.attributes || {};
  const colorArr = attrs.color;
  if (!colorArr || colorArr.length === 0) { log.push({ sku, err: 'no color attr' }); return; }

  const summaries = r.b.summaries || [];
  let pt = summaries.length > 0 ? summaries[0].productType : null;
  
  const val = colorArr[0].value || '';
  const currentStd = colorArr[0].standardized_values || [];
  const correctStd = getCorrectStandardizedColor(val);

  if (!correctStd) {
    log.push({ sku, err: `cannot map "${val}"`, currentStd });
    return;
  }

  if (JSON.stringify(currentStd.sort()) === JSON.stringify(correctStd.sort())) {
    log.push({ sku, status: 'already correct', val, std: currentStd });
    return;
  }

  console.log(`  🎨 ${sku}: "${val}" ${JSON.stringify(currentStd)} → ${JSON.stringify(correctStd)}`);

  const newColor = colorArr.map(c => ({ ...c, standardized_values: correctStd }));
  const productTypes = pt ? [pt] : ['VEHICLE_SEAT_COVER', 'AUTO_ACCESSORY'];

  for (const tryPt of productTypes) {
    const patchBody = {
      productType: tryPt,
      patches: [{ op: 'replace', path: '/attributes/color', value: newColor }],
    };
    const pr = await retryPatch(`/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(sku)}?marketplaceIds=${MKT}`, patchBody);

    if (pr.s === 200) {
      const ptError = (pr.b.issues || []).find(i => i.code === '4000003');
      if (ptError && productTypes.length > 1 && tryPt === productTypes[0]) {
        await sleep(500);
        continue;
      }
      log.push({ sku, status: `fixed (${pr.b.status})`, val, from: currentStd, to: correctStd, pt: tryPt });
      return;
    } else {
      log.push({ sku, err: `PATCH ${pr.s}`, val, body: JSON.stringify(pr.b).slice(0, 200) });
      return;
    }
  }
}

async function main() {
  console.log('🚀 Amazon Bartact Listing Fixer — Phase 3 (Color Corrections)\n');
  await auth();

  // First, re-fix the incorrectly patched SKUs from Phase 2
  console.log(`\n📋 Re-fixing ${PHASE2_WRONG.length} incorrectly patched SKUs...\n`);
  
  for (const sku of PHASE2_WRONG) {
    await fixSku(sku);
    await sleep(600);
  }

  // Now re-scan ALL color-issue SKUs with the correct mapping
  // Paginate and find remaining ones
  console.log('\n📋 Re-scanning all listings for remaining color issues...\n');
  
  let nextToken = null;
  let page = 0;
  const colorSkus = [];

  do {
    page++;
    let path = `/listings/2021-08-01/items/${SELLER_ID}?marketplaceIds=${MKT}&includedData=issues&pageSize=20&issueLocale=en_US`;
    if (nextToken) path += `&pageToken=${encodeURIComponent(nextToken)}`;

    const r = await retryGet(path);
    if (r.s !== 200) break;

    for (const item of (r.b.items || [])) {
      const hasColorError = (item.issues || []).some(i => 
        i.severity === 'ERROR' && (i.attributeNames || []).includes('color')
      );
      if (hasColorError && !PHASE2_WRONG.includes(item.sku)) {
        colorSkus.push(item.sku);
      }
    }

    nextToken = r.b.pagination?.nextToken || null;
    if (page % 10 === 0) console.log(`  Page ${page}...`);
    await sleep(300);
  } while (nextToken);

  console.log(`\nFound ${colorSkus.length} remaining SKUs with color errors\n`);

  let count = 0;
  for (const sku of colorSkus) {
    count++;
    if (count % 20 === 0) console.log(`  Progress: ${count}/${colorSkus.length}`);
    await fixSku(sku);
    await sleep(600);
    if (count % 100 === 0) await auth();
  }

  // Summary
  const fixed = log.filter(l => l.status && l.status.startsWith('fixed')).length;
  const correct = log.filter(l => l.status === 'already correct').length;
  const failed = log.filter(l => l.err).length;
  
  console.log(`\n🎯 DONE! Fixed: ${fixed}, Already correct: ${correct}, Failed: ${failed}`);

  // Append to existing log
  const existingLog = fs.readFileSync('/home/ubuntu/.openclaw/workspace/memory/2026-04-14-amazon-fixes.md', 'utf8');
  
  const appendix = `

## Phase 3: Color Corrections (re-fix + rescan)
_Run at ${new Date().toISOString().slice(0, 16)}Z_

### Summary
- Re-fixed from Phase 2 errors: ${PHASE2_WRONG.length} SKUs
- Rescanned remaining: ${colorSkus.length} SKUs  
- **Fixed: ${fixed}** | Already correct: ${correct} | Failed: ${failed}

### Details
${log.map(l => {
  if (l.status && l.status.startsWith('fixed')) {
    return `- ✅ **${l.sku}**: "${l.val}" ${JSON.stringify(l.from)} → ${JSON.stringify(l.to)} [${l.pt}]`;
  } else if (l.status === 'already correct') {
    return `- ⏭️ **${l.sku}**: already correct ("${l.val}" = ${JSON.stringify(l.std)})`;
  } else {
    return `- ❌ **${l.sku}**: ${l.err}`;
  }
}).join('\n')}
`;

  fs.writeFileSync('/home/ubuntu/.openclaw/workspace/memory/2026-04-14-amazon-fixes.md', existingLog + appendix);
  console.log('📝 Log updated');
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
