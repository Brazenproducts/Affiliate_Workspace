#!/usr/bin/env node
/**
 * Poll Brand Analytics reports until DONE, then download.
 */
const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

const CREDS = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.amazon-bartact-credentials.json', 'utf8'));
const API_HOST = 'sellingpartnerapi-na.amazon.com';

const REPORTS = {
  'search-terms': '272170020578',
  'search-query-performance': '272171020578',
  'repeat-purchase': '272172020578',
  'market-basket': '272173020578',
  'item-comparison': '272174020578',
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

async function getReport(token, id) {
  const res = await httpRequest({
    hostname: API_HOST, path: `/reports/2021-06-30/reports/${id}`, method: 'GET',
    headers: { 'x-amz-access-token': token }
  });
  return res.body;
}

async function getReportDocument(token, docId) {
  const res = await httpRequest({
    hostname: API_HOST, path: `/reports/2021-06-30/documents/${docId}`, method: 'GET',
    headers: { 'x-amz-access-token': token }
  });
  return res.body;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  let token = await refreshToken();
  const status = {};
  for (const [name, id] of Object.entries(REPORTS)) status[name] = { id, state: 'PENDING' };

  for (let i = 0; i < 30; i++) { // up to ~5 min
    let allDone = true;
    for (const [name, info] of Object.entries(status)) {
      if (info.state === 'DONE' || info.state === 'FATAL' || info.state === 'CANCELLED') continue;
      const r = await getReport(token, info.id);
      info.state = r.processingStatus || 'UNKNOWN';
      info.documentId = r.reportDocumentId;
      console.log(`[${new Date().toISOString()}] ${name}: ${info.state}`);
      if (info.state !== 'DONE' && info.state !== 'FATAL' && info.state !== 'CANCELLED') allDone = false;
    }
    if (allDone) break;
    await sleep(10000);
  }

  // Download all DONE reports
  for (const [name, info] of Object.entries(status)) {
    if (info.state !== 'DONE' || !info.documentId) {
      console.log(`Skipping ${name}: state=${info.state}`);
      continue;
    }
    const doc = await getReportDocument(token, info.documentId);
    console.log(`\n=== ${name} ===`);
    console.log('Document:', JSON.stringify(doc, null, 2));
    if (doc.url) {
      const dl = await fetchUrl(doc.url);
      let raw = dl.raw;
      if (doc.compressionAlgorithm === 'GZIP') {
        raw = zlib.gunzipSync(raw);
      }
      const outPath = `/home/ubuntu/.openclaw/workspace/memory/amazon-ba-${name}.json`;
      fs.writeFileSync(outPath, raw);
      console.log(`Saved: ${outPath} (${raw.length} bytes)`);
    }
  }
  fs.writeFileSync('/home/ubuntu/.openclaw/workspace/memory/amazon-ba-status.json', JSON.stringify(status, null, 2));
})();
