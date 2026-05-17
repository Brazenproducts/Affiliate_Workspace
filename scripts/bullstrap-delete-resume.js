const https = require('https');
const fs = require('fs');
const STORE = 'bull-strap-78.myshopify.com';
const TOKEN = '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';
const BACKUP = '/home/ubuntu/.openclaw/workspace/memory/bullstrap-abandoned-backup.csv';
const URLLIST = '/home/ubuntu/.openclaw/workspace/memory/bullstrap-abandoned-url-removal.txt';
const SKIP_UNPUBLISH = 800;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function restReq(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: STORE, path, method,
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}) }
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

async function main() {
  const lines = fs.readFileSync(BACKUP, 'utf8').split('\n').slice(1).filter(l => l.trim());
  const products = lines.map(l => {
    const m = l.match(/^(gid:\/\/shopify\/Product\/\d+),/);
    const hm = l.match(/,"([^"]+)","([^"]+)"/);
    return { id: m ? m[1] : '', handle: hm ? hm[1] : '' };
  });
  console.log('Total products in backup: ' + products.length);
  console.log('Skipping first ' + SKIP_UNPUBLISH + ' (already unpublished)\n');

  // Resume unpublish from 801 onward
  console.log('Step 3 (resumed): Unpublishing from #' + (SKIP_UNPUBLISH+1) + '...');
  let done = SKIP_UNPUBLISH;
  for (let i = SKIP_UNPUBLISH; i < products.length; i++) {
    const numId = products[i].id.replace('gid://shopify/Product/', '');
    if (numId) await restReq('PUT', '/admin/api/2024-01/products/' + numId + '.json', { product: { id: numId, status: 'draft' } });
    done++;
    if (done % 200 === 0) process.stdout.write('\r  Unpublished ' + done + '/' + products.length + '...');
    await sleep(100);
  }
  console.log('\n  Unpublished all ' + done);

  // Delete ALL
  console.log('\nStep 4: Deleting all ' + products.length + ' products...');
  let deleted = 0, failed = 0;
  for (const p of products) {
    const numId = p.id.replace('gid://shopify/Product/', '');
    if (!numId) { failed++; continue; }
    const res = await restReq('DELETE', '/admin/api/2024-01/products/' + numId + '.json');
    if (res.status === 200 || res.status === 204) { deleted++; } else { failed++; }
    if ((deleted + failed) % 200 === 0) process.stdout.write('\r  Deleted ' + deleted + '/' + products.length + ' (' + failed + ' failed)...');
    await sleep(100);
  }
  console.log('\n  Deleted: ' + deleted + ', Failed: ' + failed);

  // URL list
  console.log('\nStep 5: Writing URL removal list...');
  const handles = lines.map(l => { const m = l.match(/,"([^"]+)","([^"]+)"/); return m ? m[1] : ''; }).filter(Boolean);
  const urls = handles.map(h => 'https://bullstrap.com/products/' + h);
  fs.writeFileSync(URLLIST, urls.join('\n'));
  console.log('  Saved: ' + URLLIST);

  console.log('\n=== DONE ===');
  console.log('Total:   ' + products.length);
  console.log('Deleted: ' + deleted);
  console.log('Failed:  ' + failed);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
