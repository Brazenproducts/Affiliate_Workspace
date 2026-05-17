const https = require('https');
const fs = require('fs');
const STORE = 'bull-strap-78.myshopify.com';
const TOKEN = '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';
const BACKUP = '/home/ubuntu/.openclaw/workspace/memory/bullstrap-abandoned-backup.csv';
const URLLIST = '/home/ubuntu/.openclaw/workspace/memory/bullstrap-abandoned-url-removal.txt';
const SKIP = 800;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function restReq(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: STORE, path, method, timeout: 30000,
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}) }
    };
    let data = '';
    const r = https.request(options, res => {
      res.on('data', d => data += d);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(data), headers: res.headers }); } catch(e) { resolve({ status: res.statusCode, body: {}, headers: res.headers }); } });
    });
    r.on('timeout', () => { r.destroy(); reject(new Error('timeout')); });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

async function deleteWithRetry(numId, attempt) {
  attempt = attempt || 1;
  try {
    const res = await restReq('DELETE', '/admin/api/2024-01/products/' + numId + '.json');
    if (res.status === 429) {
      const wait = parseInt(res.headers['retry-after'] || '2') * 1000;
      console.log('  429 rate limited, waiting ' + wait + 'ms...');
      await sleep(wait);
      if (attempt < 3) return deleteWithRetry(numId, attempt + 1);
      return 'failed';
    }
    if (res.status === 200 || res.status === 204 || res.status === 404) return 'ok';
    return 'failed';
  } catch(e) {
    if (attempt < 3) { await sleep(2000); return deleteWithRetry(numId, attempt + 1); }
    return 'failed';
  }
}

async function main() {
  const lines = fs.readFileSync(BACKUP, 'utf8').split('\n').slice(1).filter(l => l.trim());
  const products = lines.map(l => {
    const m = l.match(/^(gid:\/\/shopify\/Product\/(\d+)),/);
    return m ? m[2] : '';
  }).filter(Boolean);
  console.log('Total products: ' + products.length);
  console.log('Skipping first ' + SKIP + ' (already processed)\n');

  let deleted = 0, failed = 0;
  for (let i = SKIP; i < products.length; i++) {
    const result = await deleteWithRetry(products[i]);
    if (result === 'ok') deleted++; else failed++;
    if ((deleted + failed) % 100 === 0) {
      console.log('Progress: ' + (i+1) + '/' + products.length + ' | deleted=' + (SKIP+deleted) + ' failed=' + failed);
    }
    await sleep(250);
  }
  console.log('\nDONE! Deleted this run: ' + deleted + ', Failed: ' + failed);
  console.log('Total deleted (all runs): ' + (SKIP + deleted - 70));

  const handles = lines.map(l => { const m = l.match(/,"([^"]+)","([^"]+)"/); return m ? m[1] : ''; }).filter(Boolean);
  fs.writeFileSync(URLLIST, handles.map(h => 'https://bullstrap.com/products/' + h).join('\n'));
  console.log('URL removal list: ' + URLLIST + ' (' + handles.length + ' URLs)');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
