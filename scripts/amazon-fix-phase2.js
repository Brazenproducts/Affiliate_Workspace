#!/usr/bin/env node
/**
 * Amazon Bartact Listing Fixer - Phase 2
 * Paginate all SKUs, collect error issues, then fix them
 */

const https = require('https');
const fs = require('fs');

const CREDS = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.amazon-bartact-credentials.json', 'utf8'));
const SELLER_ID = CREDS.seller_id;
const MKT = CREDS.marketplace_id;
const HOST = 'sellingpartnerapi-na.amazon.com';
const LOG_PATH = '/home/ubuntu/.openclaw/workspace/memory/2026-04-14-amazon-fixes.md';

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

function patch(path, body) {
  const bs = JSON.stringify(body);
  return http({ hostname: HOST, path, method: 'PATCH', headers: { 'x-amz-access-token': token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bs) } }, bs);
}

async function retryGet(path, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const r = await get(path);
    if (r.s === 429) { console.log('  ⏳ 429, waiting...'); await sleep(3000 + i * 2000); continue; }
    return r;
  }
  return { s: 429, b: 'rate limited after retries' };
}

async function retryPatch(path, body, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const r = await patch(path, body);
    if (r.s === 429) { console.log('  ⏳ 429 on PATCH, waiting...'); await sleep(3000 + i * 2000); continue; }
    return r;
  }
  return { s: 429, b: 'rate limited after retries' };
}

// ---- Step 1: Paginate all SKUs, collect ones with ERROR issues ----
async function collectAllErrorSkus() {
  console.log('\n📋 Paginating all listings to find ERROR issues...');
  const errorSkus = [];
  let nextToken = null;
  let page = 0;
  let total = 0;

  do {
    page++;
    let path = `/listings/2021-08-01/items/${SELLER_ID}?marketplaceIds=${MKT}&includedData=issues&pageSize=20&issueLocale=en_US`;
    if (nextToken) path += `&pageToken=${encodeURIComponent(nextToken)}`;

    const r = await retryGet(path);
    if (r.s !== 200) { console.log(`  ❌ Page ${page}: ${r.s}`); break; }

    const items = r.b.items || [];
    total += items.length;

    for (const item of items) {
      const errors = (item.issues || []).filter(i => i.severity === 'ERROR');
      if (errors.length > 0) {
        errorSkus.push({
          sku: item.sku,
          issues: errors.map(e => ({
            code: e.code,
            msg: (e.message || '').slice(0, 120),
            attrs: e.attributeNames || [],
          })),
        });
      }
    }

    nextToken = r.b.pagination?.nextToken || null;
    if (page % 10 === 0) console.log(`  Page ${page}: ${total} scanned, ${errorSkus.length} with errors`);
    await sleep(300);
  } while (nextToken);

  console.log(`\n📊 Scanned ${total} SKUs across ${page} pages. Found ${errorSkus.length} with ERROR issues.`);
  return errorSkus;
}

// ---- Categorize issues ----
function categorize(errorSkus) {
  const colorSkus = [];
  const descSkus = [];
  const unitSkus = [];
  const otherSkus = [];

  for (const item of errorSkus) {
    let categorized = false;
    for (const issue of item.issues) {
      if (issue.attrs.includes('color')) { colorSkus.push(item.sku); categorized = true; break; }
    }
    if (categorized) continue;
    for (const issue of item.issues) {
      if (issue.attrs.includes('product_description')) { descSkus.push(item.sku); categorized = true; break; }
    }
    if (categorized) continue;
    for (const issue of item.issues) {
      if (issue.attrs.includes('unit_count') || issue.attrs.includes('unit_count_type')) { unitSkus.push(item.sku); categorized = true; break; }
    }
    if (!categorized) otherSkus.push({ sku: item.sku, issues: item.issues });
  }

  return { colorSkus, descSkus, unitSkus, otherSkus };
}

// ---- Helpers ----
function stripHtml(text) {
  if (!text) return text;
  return text.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\n{3,}/g, '\n\n').trim();
}

const VALUE_TO_STD = {
  'black': ['black'], 'black/black': ['black'], 'black/khaki': ['black'], 'black/graphite': ['black'],
  'black/coyote': ['black'], 'brown': ['brown'], 'blue': ['blue'], 'navy': ['blue'], 'navy blue': ['blue'],
  'orange': ['orange'], 'camo': ['multicolor'], 'multicam': ['multicolor'], 'multicam/camo': ['multicolor'],
  'tan': ['beige'], 'tan/coyote': ['beige'], 'khaki': ['beige'], 'acu camo': ['multicolor'], 'acu': ['multicolor'],
  'white': ['white'], 'white/white': ['white'], 'green': ['green'], 'olive drab': ['green'], 'od green': ['green'],
  'military green': ['green'], 'red': ['red'], 'graphite': ['gray'], 'gray': ['gray'], 'grey': ['gray'],
  'coyote': ['beige'],
};

const SKU_SUFFIX_MAP = {
  'BK': ['black'], 'BR': ['brown'], 'BU': ['blue'], 'BO': ['orange'], 'BC': ['multicolor'],
  'BT': ['beige'], 'BN': ['blue'], 'BB': ['black'], 'BA': ['multicolor'], 'BW': ['white'],
  'BG': ['green'], 'BM': ['green'], 'RD': ['red'],
};

function getStdColor(value, sku) {
  if (!value) return null;
  const lower = value.toLowerCase().trim();
  if (VALUE_TO_STD[lower]) return VALUE_TO_STD[lower];
  const suffix = sku.slice(-2).toUpperCase();
  if (SKU_SUFFIX_MAP[suffix]) return SKU_SUFFIX_MAP[suffix];
  for (const [key, std] of Object.entries(VALUE_TO_STD)) {
    if (lower.includes(key)) return std;
  }
  if (lower.includes('/')) {
    const first = lower.split('/')[0].trim();
    if (VALUE_TO_STD[first]) return VALUE_TO_STD[first];
  }
  return null;
}

// ---- Fix functions ----
const log = { desc: [], color: [], unit: [], other: [] };

async function fixDescription(sku) {
  const r = await retryGet(`/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(sku)}?marketplaceIds=${MKT}&includedData=attributes,issues,summaries`);
  if (r.s !== 200) { log.desc.push({ sku, err: `GET ${r.s}` }); return; }

  const attrs = r.b.attributes || {};
  const summaries = r.b.summaries || [];
  // Get productType from summaries or from the item
  let pt = null;
  if (summaries.length > 0) pt = summaries[0].productType;
  if (!pt && attrs.product_type) pt = attrs.product_type[0]?.value;
  
  // Also check the summaries response structure
  console.log(`  ${sku}: productType from summaries = ${pt}`);
  
  const descArr = attrs.product_description;
  if (!descArr || descArr.length === 0) { log.desc.push({ sku, status: 'no description attr' }); return; }

  let hasHtml = false;
  const cleaned = descArr.map(d => {
    if (/<[^>]+>/.test(d.value || '')) { hasHtml = true; return { ...d, value: stripHtml(d.value) }; }
    return d;
  });

  if (!hasHtml) {
    // Description issue but no HTML - might be promotional language
    log.desc.push({ sku, status: 'no HTML found', desc_preview: (descArr[0]?.value || '').slice(0, 100) });
    return;
  }

  // If no productType found, try common ones
  const productTypes = pt ? [pt] : ['SEAT_COVER', 'AUTO_ACCESSORY'];
  
  for (const tryPt of productTypes) {
    console.log(`  Trying productType: ${tryPt}`);
    const patchBody = {
      productType: tryPt,
      patches: [{ op: 'replace', path: '/attributes/product_description', value: cleaned }],
    };
    const pr = await retryPatch(`/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(sku)}?marketplaceIds=${MKT}`, patchBody);
    
    if (pr.s === 200) {
      const status = pr.b.status;
      const patchIssues = pr.b.issues || [];
      const ptError = patchIssues.find(i => i.code === '4000003');
      
      if (ptError && productTypes.length > 1 && tryPt === productTypes[0]) {
        console.log(`  productType ${tryPt} invalid, trying next...`);
        await sleep(500);
        continue;
      }
      
      console.log(`  ✅ ${sku}: PATCH status=${status}, issues=${patchIssues.length}`);
      log.desc.push({ sku, status: `patched (${status})`, productType: tryPt, issues: patchIssues.length });
      return;
    } else {
      log.desc.push({ sku, err: `PATCH ${pr.s}`, body: JSON.stringify(pr.b).slice(0, 200) });
      return;
    }
  }
}

async function fixColor(sku) {
  const r = await retryGet(`/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(sku)}?marketplaceIds=${MKT}&includedData=attributes,issues,summaries`);
  if (r.s !== 200) { log.color.push({ sku, err: `GET ${r.s}` }); return; }

  const attrs = r.b.attributes || {};
  const colorArr = attrs.color;
  if (!colorArr || colorArr.length === 0) { log.color.push({ sku, err: 'no color attr' }); return; }

  const summaries = r.b.summaries || [];
  let pt = summaries.length > 0 ? summaries[0].productType : null;
  if (!pt && attrs.product_type) pt = attrs.product_type[0]?.value;

  const val = colorArr[0].value || '';
  const currentStd = colorArr[0].standardized_values || [];
  const correctStd = getStdColor(val, sku);

  if (!correctStd) {
    log.color.push({ sku, err: `unknown color: "${val}"`, currentStd });
    return;
  }

  if (JSON.stringify(currentStd.sort()) === JSON.stringify(correctStd.sort())) {
    log.color.push({ sku, status: 'already correct', val, std: currentStd });
    return;
  }

  const newColor = colorArr.map(c => ({ ...c, standardized_values: correctStd }));

  // Try different product types
  const productTypes = pt ? [pt] : ['SEAT_COVER', 'AUTO_ACCESSORY'];
  
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
      log.color.push({ sku, status: `fixed (${pr.b.status})`, val, from: currentStd, to: correctStd, pt: tryPt });
      return;
    } else {
      log.color.push({ sku, err: `PATCH ${pr.s}`, val, body: JSON.stringify(pr.b).slice(0, 200) });
      return;
    }
  }
}

async function fixUnitCount(sku) {
  const r = await retryGet(`/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(sku)}?marketplaceIds=${MKT}&includedData=attributes,issues,summaries`);
  if (r.s !== 200) { log.unit.push({ sku, err: `GET ${r.s}` }); return; }

  const attrs = r.b.attributes || {};
  const summaries = r.b.summaries || [];
  let pt = summaries.length > 0 ? summaries[0].productType : null;
  if (!pt && attrs.product_type) pt = attrs.product_type[0]?.value;

  const unitVal = 1; // default single item

  const productTypes = pt ? [pt] : ['SEAT_COVER', 'AUTO_ACCESSORY'];

  for (const tryPt of productTypes) {
    const patchBody = {
      productType: tryPt,
      patches: [{ op: 'replace', path: '/attributes/unit_count', value: [{ value: unitVal, unit: 'Count' }] }],
    };
    const pr = await retryPatch(`/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(sku)}?marketplaceIds=${MKT}`, patchBody);

    if (pr.s === 200) {
      const ptError = (pr.b.issues || []).find(i => i.code === '4000003');
      if (ptError && productTypes.length > 1 && tryPt === productTypes[0]) {
        await sleep(500);
        continue;
      }
      log.unit.push({ sku, status: `fixed (${pr.b.status})`, pt: tryPt });
      return;
    } else {
      log.unit.push({ sku, err: `PATCH ${pr.s}`, body: JSON.stringify(pr.b).slice(0, 200) });
      return;
    }
  }
}

// ---- Write log ----
function writeLog() {
  const lines = [`# Amazon Bartact Listing Fixes — ${new Date().toISOString().slice(0, 16)}Z\n`];

  const descOk = log.desc.filter(d => d.status && d.status.startsWith('patched')).length;
  const colorOk = log.color.filter(d => d.status && d.status.startsWith('fixed')).length;
  const unitOk = log.unit.filter(d => d.status && d.status.startsWith('fixed')).length;

  lines.push(`## Summary`);
  lines.push(`- Descriptions: **${descOk}** patched / ${log.desc.length} processed`);
  lines.push(`- Colors: **${colorOk}** fixed / ${log.color.length} processed`);
  lines.push(`- Unit count: **${unitOk}** fixed / ${log.unit.length} processed`);
  lines.push(`- Other issues (not fixable via API): ${log.other.length} SKUs\n`);

  lines.push(`## Description Fixes`);
  for (const d of log.desc) {
    lines.push(`- **${d.sku}**: ${d.status || d.err}${d.productType ? ` [${d.productType}]` : ''}${d.desc_preview ? ` — "${d.desc_preview}..."` : ''}`);
  }

  lines.push(`\n## Color Fixes`);
  for (const d of log.color) {
    if (d.status && d.status.startsWith('fixed')) {
      lines.push(`- **${d.sku}**: ✅ "${d.val}" ${JSON.stringify(d.from)} → ${JSON.stringify(d.to)} [${d.pt}]`);
    } else if (d.status === 'already correct') {
      lines.push(`- **${d.sku}**: ⏭️ already correct ("${d.val}" = ${JSON.stringify(d.std)})`);
    } else {
      lines.push(`- **${d.sku}**: ❌ ${d.err}${d.val ? ` (val="${d.val}")` : ''}`);
    }
  }

  lines.push(`\n## Unit Count Fixes`);
  for (const d of log.unit) {
    lines.push(`- **${d.sku}**: ${d.status || d.err}${d.pt ? ` [${d.pt}]` : ''}`);
  }

  if (log.other.length > 0) {
    lines.push(`\n## Other Issues (not auto-fixable)`);
    for (const d of log.other) {
      lines.push(`- **${d.sku}**: ${d.issues.map(i => i.msg.slice(0, 80)).join('; ')}`);
    }
  }

  fs.writeFileSync(LOG_PATH, lines.join('\n'));
  console.log(`\n📝 Log saved to ${LOG_PATH}`);
}

// ---- Main ----
async function main() {
  console.log('🚀 Amazon Bartact Listing Fixer — Phase 2\n');
  await auth();

  // Step 1: Collect all error SKUs
  const errorSkus = await collectAllErrorSkus();

  // Step 2: Categorize
  const { colorSkus, descSkus, unitSkus, otherSkus } = categorize(errorSkus);
  console.log(`\n📊 Categorized: ${colorSkus.length} color, ${descSkus.length} desc, ${unitSkus.length} unit, ${otherSkus.length} other`);
  log.other = otherSkus;

  // Save categories for debugging
  console.log('\nColor SKUs:', colorSkus.slice(0, 10).join(', '), colorSkus.length > 10 ? `... +${colorSkus.length - 10} more` : '');
  console.log('Desc SKUs:', descSkus.join(', '));
  console.log('Unit SKUs:', unitSkus.join(', '));
  console.log('Other issue types:');
  const otherTypes = {};
  for (const o of otherSkus) {
    for (const i of o.issues) {
      const key = i.attrs.join(',') || i.msg.slice(0, 50);
      otherTypes[key] = (otherTypes[key] || 0) + 1;
    }
  }
  for (const [k, v] of Object.entries(otherTypes).sort((a,b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`  ${k}: ${v}`);
  }

  // Step 3: Fix descriptions first
  console.log('\n' + '='.repeat(60));
  console.log('FIXING DESCRIPTIONS');
  console.log('='.repeat(60));
  for (const sku of descSkus) {
    console.log(`\n📝 ${sku}`);
    await fixDescription(sku);
    await sleep(600);
  }

  // Step 4: Fix colors
  console.log('\n' + '='.repeat(60));
  console.log('FIXING COLORS');
  console.log('='.repeat(60));
  let colorCount = 0;
  for (const sku of colorSkus) {
    colorCount++;
    if (colorCount % 20 === 0) console.log(`\n--- Progress: ${colorCount}/${colorSkus.length} ---`);
    await fixColor(sku);
    await sleep(600);
    
    // Re-auth every 100 calls (token might expire)
    if (colorCount % 100 === 0) {
      console.log('🔄 Re-authenticating...');
      await auth();
    }
  }

  // Step 5: Fix unit counts
  console.log('\n' + '='.repeat(60));
  console.log('FIXING UNIT COUNTS');
  console.log('='.repeat(60));
  for (const sku of unitSkus) {
    console.log(`\n📦 ${sku}`);
    await fixUnitCount(sku);
    await sleep(600);
  }

  writeLog();
  
  const descOk = log.desc.filter(d => d.status && d.status.startsWith('patched')).length;
  const colorOk = log.color.filter(d => d.status && d.status.startsWith('fixed')).length;
  const unitOk = log.unit.filter(d => d.status && d.status.startsWith('fixed')).length;
  console.log(`\n🎯 DONE! Descriptions: ${descOk}/${log.desc.length}, Colors: ${colorOk}/${log.color.length}, Unit: ${unitOk}/${log.unit.length}`);
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  writeLog();
  process.exit(1);
});
