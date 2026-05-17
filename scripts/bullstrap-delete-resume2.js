const https = require('https');
const fs = require('fs');
const STORE = 'bull-strap-78.myshopify.com';
const TOKEN = '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';
const BACKUP = '/home/ubuntu/.openclaw/workspace/memory/bullstrap-abandoned-backup.csv';
const URLLIST = '/home/ubuntu/.openclaw/workspace/memory/bullstrap-abandoned-url-removal.txt';
const SKIP_DELETE = 599;

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
    return { id: m ? m[1] : '' };
  });
  console.log('Total products: ' + products.length);
  console.log('Skipping first ' + SKIP_DELETE + ' (already deleted)\n');

  console.log('Deleting from #' + (SKIP_DELETE+1) + '...');
  let deleted = SKIP_DELETE, failed = 0;
  for (let i = SKIP_DELETE; i < products.length; i++) {
    const numId = products[i].id.replace('gid://shopify/Product/', '');
    if (!numId) { failed++; continue; }
    const res = await restReq('DELETE', '/admin/api/2024-01/products/' + numId + '.json');
    if (res.status === 200 || res.status === 204) { deleted++; } else { failed++; }
    if ((deleted + failed) % 200 === 0) process.stdout.write('\r  Progress: ' + (deleted+failed) + '/' + products.length + ' (deleted=' + deleted + ' failed=' + failed + ')...');
    await sleep(80);
  }
  console.log('\n\nDone! Deleted: ' + deleted + ', Failed: ' + failed);

  // URL list
  const handles = lines.map(l => { const m = l.match(/,"([^"]+)","([^"]+)"/); return m ? m[1] : ''; }).filter(Boolean);
  const urls = handles.map(h => 'https://bullstrap.com/products/' + h);
  fs.writeFileSync(URLLIST, urls.join('\n'));
  console.log('URL removal list saved: ' + URLLIST);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
