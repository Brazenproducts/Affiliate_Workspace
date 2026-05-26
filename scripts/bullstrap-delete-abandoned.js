/**
 * Bull Strap — Delete Filtered:Abandoned Products v2
 * Uses GraphQL bulk query to fetch ONLY tagged products efficiently.
 * Sequence:
 *   1. Fetch all products tagged "Filtered:Abandoned" via GraphQL paginated query
 *   2. Export backup CSV
 *   3. Unpublish all (set status=draft)
 *   4. Delete all
 *   5. Output URL removal list
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');
const fs = require('fs');
const path = require('path');

const STORE = 'bull-strap-78.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BULLSTRAP;
const TAG = 'Filtered:Abandoned';
const BACKUP_PATH = path.join(__dirname, '../memory/bullstrap-abandoned-backup.csv');
const URL_LIST_PATH = path.join(__dirname, '../memory/bullstrap-abandoned-url-removal.txt');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function req(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: STORE,
      path: endpoint,
      method,
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    };
    let data = '';
    const r = https.request(options, res => {
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data), headers: res.headers }); }
        catch(e) { resolve({ status: res.statusCode, body: { raw: data }, headers: res.headers }); }
      });
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

async function fetchAllAbandoned() {
  const products = [];
  let pageInfo = null;
  let page = 0;

  while (true) {
    page++;
    let url;
    if (pageInfo) {
      url = `/admin/api/2024-01/products.json?limit=250&page_info=${pageInfo}&fields=id,title,handle,vendor,tags,status`;
    } else {
      url = `/admin/api/2024-01/products.json?limit=250&tag=${encodeURIComponent(TAG)}&fields=id,title,handle,vendor,tags,status`;
    }

    const res = await req('GET', url);
    if (!res.body.products) {
      console.error('Unexpected response:', JSON.stringify(res.body).slice(0, 200));
      break;
    }

    const batch = res.body.products;
    // When using page_info, filter client-side since tag param can't be combined
    const filtered = pageInfo
      ? batch.filter(p => p.tags && p.tags.split(',').map(t => t.trim()).includes(TAG))
      : batch;

    products.push(...filtered);
    process.stdout.write(`\r  Fetched page ${page}: ${products.length} abandoned so far...`);

    // Check for next page via Link header
    const link = res.headers['link'] || '';
    const nextMatch = link.match(/<[^>]*page_info=([^&>]+)[^>]*>;\s*rel="next"/);
    if (nextMatch && batch.length === 250) {
      pageInfo = nextMatch[1];
      await sleep(300);
    } else {
      break;
    }
  }

  console.log(`\n  Total fetched: ${products.length}`);
  return products;
}

async function unpublishBatch(products) {
  let done = 0;
  for (const p of products) {
    if (p.status === 'draft' || p.status === 'archived') {
      done++;
      continue; // already not active
    }
    const res = await req('PUT', `/admin/api/2024-01/products/${p.id}.json`, {
      product: { id: p.id, status: 'draft' }
    });
    if (res.status !== 200) {
      console.warn(`  ⚠️  Unpublish failed for ${p.id} (${p.title.slice(0,40)}): HTTP ${res.status}`);
    }
    done++;
    if (done % 50 === 0) process.stdout.write(`\r  Unpublished ${done}/${products.length}...`);
    await sleep(150); // ~6 req/sec, well under 2/sec limit
  }
  console.log(`\n  Unpublished ${done} products.`);
}

async function deleteBatch(products) {
  let deleted = 0;
  let failed = 0;
  for (const p of products) {
    const res = await req('DELETE', `/admin/api/2024-01/products/${p.id}.json`);
    if (res.status === 200 || res.status === 204) {
      deleted++;
    } else {
      failed++;
      console.warn(`  ⚠️  Delete failed for ${p.id} (${p.title.slice(0,40)}): HTTP ${res.status}`);
    }
    if ((deleted + failed) % 100 === 0) {
      process.stdout.write(`\r  Deleted ${deleted}/${products.length} (${failed} failed)...`);
    }
    await sleep(150);
  }
  console.log(`\n  Deleted: ${deleted}, Failed: ${failed}`);
  return { deleted, failed };
}

async function main() {
  console.log('=== Bull Strap — Delete Filtered:Abandoned Products ===\n');

  // Step 1: Fetch all
  console.log('Step 1: Fetching all products tagged "Filtered:Abandoned"...');
  const products = await fetchAllAbandoned();

  if (products.length === 0) {
    console.log('No products found with that tag. Nothing to do.');
    process.exit(0);
  }

  console.log(`\nFound ${products.length} products to process.\n`);

  // Step 2: Export backup CSV
  console.log('Step 2: Writing backup CSV...');
  const csvLines = ['id,title,handle,vendor,status,tags'];
  for (const p of products) {
    const safe = (s) => `"${String(s || '').replace(/"/g, '""')}"`;
    csvLines.push([p.id, safe(p.title), safe(p.handle), safe(p.vendor), p.status, safe(p.tags)].join(','));
  }
  fs.writeFileSync(BACKUP_PATH, csvLines.join('\n'));
  console.log(`  Backup saved: ${BACKUP_PATH}`);

  // Step 3: Unpublish all
  console.log('\nStep 3: Unpublishing all (setting to draft)...');
  await unpublishBatch(products);

  // Step 4: Delete all
  console.log('\nStep 4: Deleting all...');
  const { deleted, failed } = await deleteBatch(products);

  // Step 5: URL removal list
  console.log('\nStep 5: Writing URL removal list...');
  const urls = products.map(p => `https://bullstrap.com/products/${p.handle}`);
  fs.writeFileSync(URL_LIST_PATH, urls.join('\n'));
  console.log(`  URL list saved: ${URL_LIST_PATH}`);

  console.log('\n=== DONE ===');
  console.log(`Total found:   ${products.length}`);
  console.log(`Deleted:       ${deleted}`);
  console.log(`Failed:        ${failed}`);
  console.log(`Backup CSV:    ${BACKUP_PATH}`);
  console.log(`URL list:      ${URL_LIST_PATH} (${urls.length} URLs for search removal)`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
