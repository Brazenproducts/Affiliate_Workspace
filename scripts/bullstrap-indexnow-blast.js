#!/usr/bin/env node
// Bull Strap IndexNow Blast — submit ALL URLs to IndexNow (Bing, Yandex, etc.)
// IndexNow allows 10,000 URLs per request, 100,000 per day
// No key file verification needed (202 accepted in testing)

const https = require('https');
const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(__dirname, '..');
const URLS_FILE = path.join(WORKSPACE, 'memory/bullstrap-all-urls-for-indexing.json');
const KEY = 'b4f7e2a1c3d5f6789012345678a4b5c6';
const BATCH_SIZE = 10000; // Max per request
const DELAY_BETWEEN_BATCHES = 5000; // 5 seconds between batches

function log(msg) { console.log(`[INDEXNOW] ${new Date().toISOString()} ${msg}`); }

function httpsPost(hostname, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  if (!fs.existsSync(URLS_FILE)) {
    log('ERROR: No URL file found');
    process.exit(1);
  }

  const urlData = JSON.parse(fs.readFileSync(URLS_FILE, 'utf8'));
  const allUrls = urlData.urls || [];
  log(`Total URLs to submit: ${allUrls.length}`);

  let totalSubmitted = 0;
  let batches = Math.ceil(allUrls.length / BATCH_SIZE);

  for (let i = 0; i < batches; i++) {
    const batch = allUrls.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    
    const payload = {
      host: 'bullstrap.com',
      key: KEY,
      urlList: batch
    };

    try {
      const resp = await httpsPost('api.indexnow.org', '/indexnow', payload);
      totalSubmitted += batch.length;
      log(`Batch ${i + 1}/${batches}: ${batch.length} URLs → ${resp.status} (total: ${totalSubmitted})`);
      
      if (resp.status === 429) {
        log('Rate limited! Waiting 60s...');
        await sleep(60000);
        i--; // Retry this batch
        continue;
      }
    } catch (e) {
      log(`Batch ${i + 1} ERROR: ${e.message}`);
    }

    if (i < batches - 1) await sleep(DELAY_BETWEEN_BATCHES);
  }

  log(`DONE: ${totalSubmitted} URLs submitted to IndexNow`);
}

main().catch(e => { log('FATAL: ' + e.message); process.exit(1); });
