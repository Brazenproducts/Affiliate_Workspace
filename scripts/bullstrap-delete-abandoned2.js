require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');
const fs = require('fs');
const STORE = 'bull-strap-78.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BULLSTRAP;
const BACKUP = '/home/ubuntu/.openclaw/workspace/memory/bullstrap-abandoned-backup.csv';
const URLLIST = '/home/ubuntu/.openclaw/workspace/memory/bullstrap-abandoned-url-removal.txt';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function gql(query, variables) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ query, variables });
    const options = {
      hostname: STORE,
      path: '/admin/api/2024-01/graphql.json',
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    let data = '';
    const r = https.request(options, res => {
      res.on('data', d => data += d);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve({raw: data}); } });
    });
    r.on('error', reject);
    r.write(payload);
    r.end();
  });
}

async function fetchAllAbandoned() {
  const products = [];
  let cursor = null;
  let page = 0;
  while (true) {
    page++;
    const query = `
      query($cursor: String) {
        products(first: 250, after: $cursor, query: "tag:'Filtered:Abandoned'") {
          pageInfo { hasNextPage endCursor }
          edges {
            node { id title handle vendor status tags }
          }
        }
      }
    `;
    const res = await gql(query, { cursor });
    if (res.errors) { console.error('GQL error:', JSON.stringify(res.errors)); break; }
    const conn = res.data.products;
    const batch = conn.edges.map(e => e.node);
    products.push(...batch);
    process.stdout.write('\r  Page ' + page + ': ' + products.length + ' products...');
    if (conn.pageInfo.hasNextPage) {
      cursor = conn.pageInfo.endCursor;
      await sleep(200);
    } else {
      break;
    }
  }
  console.log('\n  Total: ' + products.length);
  return products;
}

function restReq(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: STORE, path, method,
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    };
    let data = '';
    const r = https.request(options, res => {
      res.on('data', d => data += d);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(data) }); } catch(e) { resolve({ status: res.statusCode, body: {} }); } });
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

async function unpublishAll(products) {
  let done = 0;
  for (const p of products) {
    const numId = p.id.replace('gid://shopify/Product/', '');
    await restReq('PUT', '/admin/api/2024-01/products/' + numId + '.json', { product: { id: numId, status: 'draft' } });
    done++;
    if (done % 100 === 0) process.stdout.write('\r  Unpublished ' + done + '/' + products.length + '...');
    await sleep(150);
  }
  console.log('\n  Unpublished ' + done);
}

async function deleteAll(products) {
  let deleted = 0, failed = 0;
  for (const p of products) {
    const numId = p.id.replace('gid://shopify/Product/', '');
    const res = await restReq('DELETE', '/admin/api/2024-01/products/' + numId + '.json');
    if (res.status === 200 || res.status === 204) { deleted++; } else { failed++; }
    if ((deleted + failed) % 100 === 0) process.stdout.write('\r  Deleted ' + deleted + '/' + products.length + ' (' + failed + ' failed)...');
    await sleep(150);
  }
  console.log('\n  Deleted: ' + deleted + ', Failed: ' + failed);
  return { deleted, failed };
}

async function main() {
  console.log('=== Bull Strap — Delete Filtered:Abandoned (v2 GraphQL) ===\n');

  console.log('Step 1: Fetching tagged products via GraphQL...');
  const products = await fetchAllAbandoned();

  if (products.length === 0) {
    console.log('No products found. Nothing to do.');
    process.exit(0);
  }

  console.log('\nStep 2: Writing backup CSV...');
  const csv = ['id,title,handle,vendor,status,tags'];
  for (const p of products) {
    const s = v => '"' + String(v||'').replace(/"/g,'""') + '"';
    csv.push([p.id, s(p.title), s(p.handle), s(p.vendor), p.status, s(p.tags.join(','))].join(','));
  }
  fs.writeFileSync(BACKUP, csv.join('\n'));
  console.log('  Saved: ' + BACKUP);

  console.log('\nStep 3: Unpublishing all...');
  await unpublishAll(products);

  console.log('\nStep 4: Deleting all...');
  const { deleted, failed } = await deleteAll(products);

  console.log('\nStep 5: Writing URL removal list...');
  const urls = products.map(p => 'https://bullstrap.com/products/' + p.handle);
  fs.writeFileSync(URLLIST, urls.join('\n'));
  console.log('  Saved: ' + URLLIST);

  console.log('\n=== DONE ===');
  console.log('Total found:  ' + products.length);
  console.log('Deleted:      ' + deleted);
  console.log('Failed:       ' + failed);
  console.log('Backup:       ' + BACKUP);
  console.log('URL list:     ' + URLLIST);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
