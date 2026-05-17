#!/usr/bin/env node
/**
 * Download the sales-traffic report that already completed (272177020578).
 * Then check if search-terms finished yet.
 */
const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

const CREDS = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.amazon-bartact-credentials.json', 'utf8'));
const API_HOST = 'sellingpartnerapi-na.amazon.com';

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

async function downloadReport(token, reportId, name) {
  // Get report status
  const report = await httpRequest({
    hostname: API_HOST, path: `/reports/2021-06-30/reports/${reportId}`, method: 'GET',
    headers: { 'x-amz-access-token': token }
  });
  console.log(`${name}: status=${report.body.processingStatus}`);
  if (report.body.processingStatus !== 'DONE') return null;
  
  // Get document
  const doc = await httpRequest({
    hostname: API_HOST, path: `/reports/2021-06-30/documents/${report.body.reportDocumentId}`, method: 'GET',
    headers: { 'x-amz-access-token': token }
  });
  if (!doc.body.url) { console.log('No URL'); return null; }
  
  const dl = await fetchUrl(doc.body.url);
  let raw = dl.raw;
  if (doc.body.compressionAlgorithm === 'GZIP') raw = zlib.gunzipSync(raw);
  const outPath = `/home/ubuntu/.openclaw/workspace/memory/amazon-ba-${name}.json`;
  fs.writeFileSync(outPath, raw);
  console.log(`Saved: ${outPath} (${raw.length} bytes)`);
  return raw.toString().slice(0, 2000);
}

(async () => {
  const token = await refreshToken();
  
  // Download sales-traffic (was DONE)
  const st = await downloadReport(token, '272177020578', 'sales-traffic');
  if (st) console.log('\nSales-traffic preview:\n', st.slice(0, 1000));
  
  // Check search-terms
  await downloadReport(token, '272176020578', 'search-terms');
  
  // Check sqp-brand
  await downloadReport(token, '272178020578', 'sqp-brand');
})();
