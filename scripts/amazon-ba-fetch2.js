#!/usr/bin/env node
/**
 * Poll and download the Brand Analytics reports we just created.
 * Reports: search-terms (272176020578), sales-traffic (272177020578), sqp-brand (272178020578)
 */
const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

const CREDS = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.amazon-bartact-credentials.json', 'utf8'));
const API_HOST = 'sellingpartnerapi-na.amazon.com';

const REPORTS = {
  'search-terms': '272176020578',
  'sales-traffic': '272177020578',
  'sqp-brand': '272178020578',
};

function httpRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        try { resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(buf.toString()), raw: buf }); }
        catch { resolve({ status: res.statusCode, headers: res.headers, body: buf.toString(), raw: buf }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, raw: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
}

async function refreshToken() {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: CREDS.refresh_token,
    client_id: CREDS.client_id,
    client_secret: CREDS.client_secret,
  }).toString();
  const res = await httpRequest({
    hostname: 'api.amazon.com', path: '/auth/o2/token', method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
  }, body);
  return res.body.access_token;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  let token = await refreshToken();
  const status = {};
  for (const [name, id] of Object.entries(REPORTS)) status[name] = { id, state: 'PENDING' };

  // Poll up to 10 min
  for (let i = 0; i < 60; i++) {
    let allDone = true;
    for (const [name, info] of Object.entries(status)) {
      if (['DONE', 'FATAL', 'CANCELLED'].includes(info.state)) continue;
      const res = await httpRequest({
        hostname: API_HOST, path: `/reports/2021-06-30/reports/${info.id}`, method: 'GET',
        headers: { 'x-amz-access-token': token }
      });
      info.state = res.body.processingStatus || 'UNKNOWN';
      info.documentId = res.body.reportDocumentId;
      console.log(`[${new Date().toISOString().slice(11,19)}] ${name}: ${info.state}`);
      if (!['DONE', 'FATAL', 'CANCELLED'].includes(info.state)) allDone = false;
    }
    if (allDone) break;
    await sleep(10000);
  }

  // Download DONE reports
  for (const [name, info] of Object.entries(status)) {
    if (info.state !== 'DONE' || !info.documentId) {
      console.log(`\nSkipping ${name}: state=${info.state}`);
      continue;
    }
    const doc = await httpRequest({
      hostname: API_HOST, path: `/reports/2021-06-30/documents/${info.documentId}`, method: 'GET',
      headers: { 'x-amz-access-token': token }
    });
    console.log(`\n=== ${name} document ===`);
    if (doc.body.url) {
      const dl = await fetchUrl(doc.body.url);
      let raw = dl.raw;
      if (doc.body.compressionAlgorithm === 'GZIP') raw = zlib.gunzipSync(raw);
      const outPath = `/home/ubuntu/.openclaw/workspace/memory/amazon-ba-${name}.json`;
      fs.writeFileSync(outPath, raw);
      console.log(`Saved: ${outPath} (${raw.length} bytes)`);
    } else {
      console.log('No URL in document:', JSON.stringify(doc.body));
    }
  }
  console.log('\nDone.');
})();
