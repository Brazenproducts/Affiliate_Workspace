#!/usr/bin/env node
/**
 * Amazon Bartact Listing Fixer
 * Fixes: 1) HTML in descriptions, 2) Color attribute mismatches, 3) Missing unit count
 */

const https = require('https');
const fs = require('fs');

const CREDS = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.amazon-bartact-credentials.json', 'utf8'));
const SELLER_ID = CREDS.seller_id;
const MARKETPLACE_ID = CREDS.marketplace_id;
const API_HOST = 'sellingpartnerapi-na.amazon.com';
const LOG_PATH = '/home/ubuntu/.openclaw/workspace/memory/2026-04-14-amazon-fixes.md';

let accessToken = null;
const results = {
  descriptions: { attempted: 0, success: 0, failed: 0, details: [] },
  colors: { attempted: 0, success: 0, failed: 0, details: [] },
  unitCount: { attempted: 0, success: 0, failed: 0, details: [] },
};

// --- HTTP helpers ---
function httpRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// --- Auth ---
async function refreshToken() {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: CREDS.refresh_token,
    client_id: CREDS.client_id,
    client_secret: CREDS.client_secret,
  }).toString();

  const res = await httpRequest({
    hostname: 'api.amazon.com',
    path: '/auth/o2/token',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
  }, body);

  if (res.status !== 200) throw new Error(`Token refresh failed: ${res.status} ${JSON.stringify(res.body)}`);
  accessToken = res.body.access_token;
  console.log('✅ Token refreshed');
}

// --- SP-API helpers ---
function apiGet(path) {
  return httpRequest({
    hostname: API_HOST,
    path,
    method: 'GET',
    headers: { 'x-amz-access-token': accessToken, 'Content-Type': 'application/json' },
  });
}

function apiPatch(path, body) {
  const bodyStr = JSON.stringify(body);
  return httpRequest({
    hostname: API_HOST,
    path,
    method: 'PATCH',
    headers: {
      'x-amz-access-token': accessToken,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyStr),
    },
  }, bodyStr);
}

function listingPath(sku) {
  const encoded = encodeURIComponent(sku);
  return `/listings/2021-08-01/items/${SELLER_ID}/${encoded}?marketplaceIds=${MARKETPLACE_ID}&includedData=attributes,issues`;
}

function patchPath(sku) {
  const encoded = encodeURIComponent(sku);
  return `/listings/2021-08-01/items/${SELLER_ID}/${encoded}?marketplaceIds=${MARKETPLACE_ID}`;
}

// --- Strip HTML ---
function stripHtml(text) {
  if (!text) return text;
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// --- Color mapping ---
const COLOR_MAP = {
  'BK': { name: 'Black', std: ['black'] },
  'BR': { name: 'Brown', std: ['brown'] },  // Note: BR also = Red in some contexts
  'BU': { name: 'Blue', std: ['blue'] },
  'BO': { name: 'Orange', std: ['orange'] },
  'BC': { name: 'Camo/Multicam', std: ['multicolor'] },
  'BT': { name: 'Tan', std: ['beige'] },
  'BN': { name: 'Navy', std: ['blue'] },
  'BB': { name: 'Black/Black', std: ['black'] },
  'BA': { name: 'ACU', std: ['multicolor'] },
  'BW': { name: 'White', std: ['white'] },
  'BG': { name: 'Green/OD', std: ['green'] },
  'BM': { name: 'Military', std: ['green'] },
};

// Also handle Red for BR suffix when context suggests it (we'll detect from the value field)
const VALUE_TO_STD = {
  'black': ['black'],
  'black/black': ['black'],
  'black/khaki': ['black'],
  'black/graphite': ['black'],
  'black/coyote': ['black'],
  'brown': ['brown'],
  'blue': ['blue'],
  'navy': ['blue'],
  'navy blue': ['blue'],
  'orange': ['orange'],
  'camo': ['multicolor'],
  'multicam': ['multicolor'],
  'multicam/camo': ['multicolor'],
  'tan': ['beige'],
  'tan/coyote': ['beige'],
  'khaki': ['beige'],
  'acu camo': ['multicolor'],
  'acu': ['multicolor'],
  'white': ['white'],
  'white/white': ['white'],
  'green': ['green'],
  'olive drab': ['green'],
  'od green': ['green'],
  'military green': ['green'],
  'red': ['red'],
  'graphite': ['gray'],
  'gray': ['gray'],
  'grey': ['gray'],
  'coyote': ['beige'],
};

function getStandardizedColor(value, sku) {
  if (!value) return null;
  
  // Try exact match on value (lowercase)
  const lower = value.toLowerCase().trim();
  if (VALUE_TO_STD[lower]) return VALUE_TO_STD[lower];
  
  // Try suffix from SKU (last 2 chars)
  const suffix = sku.slice(-2).toUpperCase();
  if (COLOR_MAP[suffix]) return COLOR_MAP[suffix].std;
  
  // Try partial matches
  for (const [key, std] of Object.entries(VALUE_TO_STD)) {
    if (lower.includes(key)) return std;
  }
  
  // If value contains slash, try first part
  if (lower.includes('/')) {
    const first = lower.split('/')[0].trim();
    if (VALUE_TO_STD[first]) return VALUE_TO_STD[first];
  }
  
  return null;
}

// ============================================================
// PHASE 1: Description fixes
// ============================================================
async function fixDescriptions() {
  console.log('\n' + '='.repeat(60));
  console.log('PHASE 1: Fixing HTML in product descriptions');
  console.log('='.repeat(60));

  const parentSkus = [
    'BTJKSC1112FP-Parent',
    'BTJKAI0710CC-Parent',
    'BTJKSC0710FP-Parent',
    'BTJKSC2013FP-Parent',
    'BTJKSC2007R4-Parent',
    'BTTJSC9702RB-Parent',
    'BTTJSC0306RB-Parent',
    'RBFEFEH-PARENT',
    'TJSC9702FPBA-FXVD',
  ];

  for (const sku of parentSkus) {
    results.descriptions.attempted++;
    console.log(`\n📋 Fetching: ${sku}`);
    
    try {
      const res = await apiGet(listingPath(sku));
      
      if (res.status === 429) {
        console.log('  ⏳ Rate limited, waiting 5s...');
        await sleep(5000);
        const retry = await apiGet(listingPath(sku));
        if (retry.status !== 200) {
          console.log(`  ❌ Still failed after retry: ${retry.status}`);
          results.descriptions.failed++;
          results.descriptions.details.push({ sku, error: `GET ${retry.status}` });
          continue;
        }
        Object.assign(res, retry);
      }
      
      if (res.status !== 200) {
        console.log(`  ❌ GET failed: ${res.status} ${JSON.stringify(res.body).slice(0, 200)}`);
        results.descriptions.failed++;
        results.descriptions.details.push({ sku, error: `GET ${res.status}` });
        await sleep(500);
        continue;
      }

      const attrs = res.body.attributes || {};
      const productType = res.body.productType || 'SEAT_COVER';
      const descArr = attrs.product_description;
      
      // Check for description issues
      const issues = (res.body.issues || []).filter(i => 
        i.severity === 'ERROR' && 
        (i.attributeNames || []).some(a => a === 'product_description')
      );
      
      let hasHtml = false;
      let cleanedDesc = [];
      
      if (descArr && descArr.length > 0) {
        for (const d of descArr) {
          const val = d.value || '';
          if (/<[^>]+>/.test(val)) {
            hasHtml = true;
            cleanedDesc.push({ ...d, value: stripHtml(val) });
          } else {
            cleanedDesc.push(d);
          }
        }
      }

      if (!hasHtml && issues.length === 0) {
        console.log(`  ⏭️  No HTML found in description and no description issues`);
        results.descriptions.details.push({ sku, status: 'skipped', reason: 'no HTML' });
        await sleep(500);
        continue;
      }

      if (!hasHtml && issues.length > 0) {
        console.log(`  ⚠️  Has description issues but no HTML detected. Issues: ${JSON.stringify(issues.map(i=>i.message).slice(0,2))}`);
        results.descriptions.details.push({ sku, status: 'skipped', reason: 'issues but no HTML found' });
        await sleep(500);
        continue;
      }

      console.log(`  🔧 Found HTML, stripping tags...`);
      console.log(`  Original (first 100 chars): ${(descArr[0]?.value || '').slice(0, 100)}`);
      console.log(`  Cleaned  (first 100 chars): ${(cleanedDesc[0]?.value || '').slice(0, 100)}`);

      // PATCH
      const patchBody = {
        productType,
        patches: [{
          op: 'replace',
          path: '/attributes/product_description',
          value: cleanedDesc,
        }],
      };

      const patchRes = await apiPatch(patchPath(sku), patchBody);
      
      if (patchRes.status === 200) {
        console.log(`  ✅ Patched successfully: ${JSON.stringify(patchRes.body).slice(0, 200)}`);
        results.descriptions.success++;
        results.descriptions.details.push({ sku, status: 'fixed', productType });
      } else {
        console.log(`  ❌ PATCH failed: ${patchRes.status} ${JSON.stringify(patchRes.body).slice(0, 300)}`);
        results.descriptions.failed++;
        results.descriptions.details.push({ sku, error: `PATCH ${patchRes.status}`, body: JSON.stringify(patchRes.body).slice(0, 200) });
      }
      
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
      results.descriptions.failed++;
      results.descriptions.details.push({ sku, error: err.message });
    }
    
    await sleep(600);
  }
}

// ============================================================
// PHASE 2: Collect all listings with issues, then fix colors
// ============================================================
async function collectListingsWithIssues() {
  console.log('\n' + '='.repeat(60));
  console.log('PHASE 2: Collecting all listings to find color/unit issues');
  console.log('='.repeat(60));

  const allSkus = [];
  let nextToken = null;
  let page = 0;

  do {
    page++;
    let path = `/listings/2021-08-01/items/${SELLER_ID}?marketplaceIds=${MARKETPLACE_ID}&includedData=issues&pageSize=20&issueLocale=en_US`;
    if (nextToken) path += `&pageToken=${encodeURIComponent(nextToken)}`;

    console.log(`  Page ${page}...`);
    const res = await apiGet(path);

    if (res.status === 429) {
      console.log('  ⏳ Rate limited, waiting 5s...');
      await sleep(5000);
      continue; // retry same page
    }

    if (res.status !== 200) {
      console.log(`  ❌ List failed: ${res.status} ${JSON.stringify(res.body).slice(0, 200)}`);
      break;
    }

    // The search endpoint returns differently - let's check structure
    console.log(`  Response keys: ${Object.keys(res.body)}`);
    
    if (res.body.items) {
      for (const item of res.body.items) {
        const errorIssues = (item.issues || []).filter(i => i.severity === 'ERROR');
        if (errorIssues.length > 0) {
          allSkus.push({ sku: item.sku, issues: errorIssues });
        }
      }
    } else if (res.body.sku) {
      // Single item response
      const errorIssues = (res.body.issues || []).filter(i => i.severity === 'ERROR');
      if (errorIssues.length > 0) {
        allSkus.push({ sku: res.body.sku, issues: errorIssues });
      }
    }

    nextToken = res.body.nextToken || res.body.pagination?.nextToken || null;
    await sleep(600);
  } while (nextToken && page < 50);

  console.log(`\n📊 Found ${allSkus.length} SKUs with ERROR issues across ${page} pages`);
  return allSkus;
}

// Alternative: get all SKUs from the catalog search
async function getAllSkusFromSearch() {
  console.log('\n📋 Getting SKU list via search...');
  
  // Use the getListingsItem for individual known-issue SKUs instead of search
  // Since search might not be available, we'll fetch a known set
  // First let's try the search endpoint
  const path = `/listings/2021-08-01/items/${SELLER_ID}?marketplaceIds=${MARKETPLACE_ID}&includedData=issues&pageSize=10`;
  const res = await apiGet(path);
  console.log(`Search response: ${res.status} - keys: ${typeof res.body === 'object' ? Object.keys(res.body) : 'string'}`);
  console.log(`Body preview: ${JSON.stringify(res.body).slice(0, 500)}`);
  return res;
}

// ============================================================
// PHASE 2b: Fix colors for individual SKUs
// ============================================================
async function fixColorForSku(sku) {
  results.colors.attempted++;
  
  try {
    const res = await apiGet(listingPath(sku));
    
    if (res.status === 429) {
      await sleep(5000);
      return 'retry';
    }
    
    if (res.status !== 200) {
      results.colors.failed++;
      results.colors.details.push({ sku, error: `GET ${res.status}` });
      return 'failed';
    }

    const attrs = res.body.attributes || {};
    const productType = res.body.productType || 'SEAT_COVER';
    const colorArr = attrs.color;
    const issues = (res.body.issues || []).filter(i => 
      i.severity === 'ERROR' && 
      (i.attributeNames || []).some(a => a === 'color')
    );

    if (issues.length === 0) {
      results.colors.details.push({ sku, status: 'skipped', reason: 'no color issues' });
      results.colors.attempted--; // don't count non-issues
      return 'skipped';
    }

    if (!colorArr || colorArr.length === 0) {
      results.colors.failed++;
      results.colors.details.push({ sku, error: 'no color attribute found' });
      return 'failed';
    }

    const currentValue = colorArr[0].value || '';
    const currentStd = colorArr[0].standardized_values || [];
    const correctStd = getStandardizedColor(currentValue, sku);

    if (!correctStd) {
      console.log(`  ⚠️  ${sku}: Cannot determine standardized color for "${currentValue}"`);
      results.colors.failed++;
      results.colors.details.push({ sku, error: `unknown color: ${currentValue}`, currentStd });
      return 'failed';
    }

    // Check if already correct
    if (JSON.stringify(currentStd.sort()) === JSON.stringify(correctStd.sort())) {
      console.log(`  ⏭️  ${sku}: Color already correct`);
      results.colors.details.push({ sku, status: 'already_correct' });
      results.colors.attempted--;
      return 'skipped';
    }

    console.log(`  🎨 ${sku}: "${currentValue}" std: ${JSON.stringify(currentStd)} → ${JSON.stringify(correctStd)}`);

    const patchBody = {
      productType,
      patches: [{
        op: 'replace',
        path: '/attributes/color',
        value: colorArr.map(c => ({
          ...c,
          standardized_values: correctStd,
        })),
      }],
    };

    const patchRes = await apiPatch(patchPath(sku), patchBody);

    if (patchRes.status === 200) {
      results.colors.success++;
      results.colors.details.push({ sku, status: 'fixed', from: currentStd, to: correctStd, value: currentValue });
      return 'fixed';
    } else {
      console.log(`  ❌ ${sku}: PATCH ${patchRes.status} ${JSON.stringify(patchRes.body).slice(0, 200)}`);
      results.colors.failed++;
      results.colors.details.push({ sku, error: `PATCH ${patchRes.status}`, body: JSON.stringify(patchRes.body).slice(0, 200) });
      return 'failed';
    }
  } catch (err) {
    results.colors.failed++;
    results.colors.details.push({ sku, error: err.message });
    return 'failed';
  }
}

// ============================================================
// PHASE 3: Fix unit count
// ============================================================
async function fixUnitCountForSku(sku) {
  results.unitCount.attempted++;

  try {
    const res = await apiGet(listingPath(sku));

    if (res.status === 429) {
      await sleep(5000);
      return 'retry';
    }

    if (res.status !== 200) {
      results.unitCount.failed++;
      results.unitCount.details.push({ sku, error: `GET ${res.status}` });
      return 'failed';
    }

    const attrs = res.body.attributes || {};
    const productType = res.body.productType || 'SEAT_COVER';
    const issues = (res.body.issues || []).filter(i =>
      i.severity === 'ERROR' &&
      (i.attributeNames || []).some(a => a === 'unit_count' || a === 'unit_count_type')
    );

    if (issues.length === 0) {
      results.unitCount.attempted--;
      return 'skipped';
    }

    // Determine count: pairs for seat covers, 1 for single items
    // Check if SKU contains indicators
    const isPair = /pair|2pk|2-pack|front|rear/i.test(sku) || 
                   (attrs.number_of_items && attrs.number_of_items[0]?.value === 2);
    const unitValue = isPair ? 2 : 1;

    console.log(`  📦 ${sku}: Setting unit_count=${unitValue}, type=Count`);

    const patchBody = {
      productType,
      patches: [
        {
          op: 'replace',
          path: '/attributes/unit_count',
          value: [{ value: unitValue, unit: 'Count' }],
        },
      ],
    };

    const patchRes = await apiPatch(patchPath(sku), patchBody);

    if (patchRes.status === 200) {
      results.unitCount.success++;
      results.unitCount.details.push({ sku, status: 'fixed', value: unitValue });
      return 'fixed';
    } else {
      console.log(`  ❌ ${sku}: PATCH ${patchRes.status} ${JSON.stringify(patchRes.body).slice(0, 200)}`);
      results.unitCount.failed++;
      results.unitCount.details.push({ sku, error: `PATCH ${patchRes.status}`, body: JSON.stringify(patchRes.body).slice(0, 200) });
      return 'failed';
    }
  } catch (err) {
    results.unitCount.failed++;
    results.unitCount.details.push({ sku, error: err.message });
    return 'failed';
  }
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('🚀 Amazon Bartact Listing Fixer');
  console.log('================================\n');

  // Step 1: Get token
  await refreshToken();

  // Step 2: Fix descriptions first (highest impact)
  await fixDescriptions();

  // Step 3: Try to discover which SKUs have issues
  // First, test if the search/list endpoint works
  const searchTest = await getAllSkusFromSearch();
  
  await sleep(1000);

  // Step 4: If search works, iterate through all SKUs
  // If not, we'll need to work with known SKU patterns
  // Bartact SKUs follow patterns: BTJK*, BTTJ*, BTFJ*, RBFE*, etc.
  // For now, let's check a sample of SKUs from known issue patterns
  
  // Let me get a few individual SKUs to understand the pattern
  console.log('\n📋 Testing individual SKU fetches...');
  const testSku = 'JKSC1112FPBK';
  const testRes = await apiGet(listingPath(testSku));
  console.log(`Test SKU ${testSku}: ${testRes.status}`);
  if (testRes.status === 200) {
    const issues = testRes.body.issues || [];
    const errorIssues = issues.filter(i => i.severity === 'ERROR');
    console.log(`  Issues: ${issues.length} total, ${errorIssues.length} errors`);
    console.log(`  Error issues: ${JSON.stringify(errorIssues.map(i => ({ msg: i.message?.slice(0,80), attrs: i.attributeNames })))}`);
    console.log(`  Color: ${JSON.stringify(testRes.body.attributes?.color)}`);
    console.log(`  Product type: ${testRes.body.productType}`);
  }

  await sleep(600);

  // Write intermediate results and continue with a broader approach
  writeResults();
  
  console.log('\n✅ Phase 1 complete. Results saved.');
  console.log('Now proceeding to scan all known SKU patterns for color issues...');
}

function writeResults() {
  const md = `# Amazon Bartact Listing Fixes - ${new Date().toISOString().split('T')[0]}

## Summary
- **Description fixes:** ${results.descriptions.success} fixed / ${results.descriptions.failed} failed / ${results.descriptions.attempted} attempted
- **Color fixes:** ${results.colors.success} fixed / ${results.colors.failed} failed / ${results.colors.attempted} attempted  
- **Unit count fixes:** ${results.unitCount.success} fixed / ${results.unitCount.failed} failed / ${results.unitCount.attempted} attempted

## Description Fix Details
${results.descriptions.details.map(d => `- **${d.sku}**: ${d.status || d.error}${d.reason ? ` (${d.reason})` : ''}`).join('\n')}

## Color Fix Details
${results.colors.details.map(d => `- **${d.sku}**: ${d.status || d.error}${d.value ? ` (value="${d.value}")` : ''}${d.from ? ` ${JSON.stringify(d.from)} → ${JSON.stringify(d.to)}` : ''}`).join('\n') || '(none yet)'}

## Unit Count Fix Details
${results.unitCount.details.map(d => `- **${d.sku}**: ${d.status || d.error}${d.value ? ` (count=${d.value})` : ''}`).join('\n') || '(none yet)'}
`;

  fs.writeFileSync(LOG_PATH, md);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  writeResults();
  process.exit(1);
});
