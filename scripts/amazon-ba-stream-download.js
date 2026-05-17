#!/usr/bin/env node
/**
 * Download Brand Analytics Search Terms report (handles large gzipped files via streaming).
 */
const https = require('https');
const fs = require('fs');
const zlib = require('zlib');
const { pipeline } = require('stream/promises');

const CREDS = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.amazon-bartact-credentials.json', 'utf8'));
const API_HOST = 'sellingpartnerapi-na.amazon.com';

function httpRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        try { resolve({ status: res.statusCode, body: JSON.parse(buf.toString()) }); }
        catch { resolve({ status: res.statusCode, body: buf.toString() }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
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

function streamDownload(url, outPath, isGzip) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const writeStream = fs.createWriteStream(outPath);
      if (isGzip) {
        const gunzip = zlib.createGunzip();
        res.pipe(gunzip).pipe(writeStream);
      } else {
        res.pipe(writeStream);
      }
      writeStream.on('finish', () => resolve());
      writeStream.on('error', reject);
      res.on('error', reject);
    }).on('error', reject);
  });
}

(async () => {
  const token = await refreshToken();

  // Get search-terms report document
  const report = await httpRequest({
    hostname: API_HOST, path: '/reports/2021-06-30/reports/272176020578', method: 'GET',
    headers: { 'x-amz-access-token': token }
  });
  console.log('Search-terms status:', report.body.processingStatus);
  if (report.body.processingStatus !== 'DONE') { console.log('Not done yet'); process.exit(1); }

  const doc = await httpRequest({
    hostname: API_HOST, path: `/reports/2021-06-30/documents/${report.body.reportDocumentId}`, method: 'GET',
    headers: { 'x-amz-access-token': token }
  });
  console.log('Compression:', doc.body.compressionAlgorithm);
  
  const outPath = '/home/ubuntu/.openclaw/workspace/memory/amazon-ba-search-terms.json';
  console.log('Streaming download...');
  await streamDownload(doc.body.url, outPath, doc.body.compressionAlgorithm === 'GZIP');
  
  const stats = fs.statSync(outPath);
  console.log(`Saved: ${outPath} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);
  
  // Print first 2000 chars as preview
  const fd = fs.openSync(outPath, 'r');
  const buf = Buffer.alloc(3000);
  fs.readSync(fd, buf, 0, 3000, 0);
  fs.closeSync(fd);
  console.log('\nPreview:\n', buf.toString('utf8', 0, 2000));

  // Also get sqp-brand
  const report2 = await httpRequest({
    hostname: API_HOST, path: '/reports/2021-06-30/reports/272178020578', method: 'GET',
    headers: { 'x-amz-access-token': token }
  });
  console.log('\n\nSQP-brand status:', report2.body.processingStatus);
  if (report2.body.processingStatus === 'DONE') {
    const doc2 = await httpRequest({
      hostname: API_HOST, path: `/reports/2021-06-30/documents/${report2.body.reportDocumentId}`, method: 'GET',
      headers: { 'x-amz-access-token': token }
    });
    const outPath2 = '/home/ubuntu/.openclaw/workspace/memory/amazon-ba-sqp-brand.json';
    await streamDownload(doc2.body.url, outPath2, doc2.body.compressionAlgorithm === 'GZIP');
    const stats2 = fs.statSync(outPath2);
    console.log(`Saved: ${outPath2} (${(stats2.size / 1024 / 1024).toFixed(1)} MB)`);
    const fd2 = fs.openSync(outPath2, 'r');
    const buf2 = Buffer.alloc(3000);
    fs.readSync(fd2, buf2, 0, 3000, 0);
    fs.closeSync(fd2);
    console.log('\nSQP Preview:\n', buf2.toString('utf8', 0, 2000));
  }
})();
