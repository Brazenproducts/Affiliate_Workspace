#!/usr/bin/env node
/**
 * Amazon Brand Analytics - Search Terms Report (correct endpoint)
 * Uses the dedicated Brand Analytics API (analytics/v1) not the Reports API.
 * The Search Terms report shows top search terms on Amazon marketplace-wide.
 */

const https = require('https');
const fs = require('fs');

const CREDS = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.amazon-bartact-credentials.json', 'utf8'));
const MARKETPLACE_ID = CREDS.marketplace_id;
const API_HOST = 'sellingpartnerapi-na.amazon.com';

function httpRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        try { resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(buf.toString()) }); }
        catch { resolve({ status: res.statusCode, headers: res.headers, body: buf.toString() }); }
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

(async () => {
  const token = await refreshToken();
  console.log('Token acquired. Testing Brand Analytics endpoints...\n');

  // Try the Search Catalog endpoint for top search terms
  // Method 1: Reports API with correct parameters (weekly, last complete week)
  const now = new Date();
  // Get last complete week (Sun-Sat)
  const dayOfWeek = now.getUTCDay();
  const lastSat = new Date(now);
  lastSat.setUTCDate(now.getUTCDate() - dayOfWeek - 1);
  const lastSun = new Date(lastSat);
  lastSun.setUTCDate(lastSat.getUTCDate() - 6);
  
  const startDate = lastSun.toISOString().split('T')[0];
  const endDate = lastSat.toISOString().split('T')[0];
  console.log(`Date range: ${startDate} to ${endDate}`);

  // Try Search Terms report with WEEK granularity (correct format)
  const reportBody = JSON.stringify({
    reportType: 'GET_BRAND_ANALYTICS_SEARCH_TERMS_REPORT',
    marketplaceIds: [MARKETPLACE_ID],
    dataStartTime: `${startDate}T00:00:00+00:00`,
    dataEndTime: `${endDate}T23:59:59+00:00`,
    reportOptions: { reportPeriod: 'WEEK' }
  });

  console.log('Requesting Search Terms report (WEEK)...');
  const r1 = await httpRequest({
    hostname: API_HOST, path: '/reports/2021-06-30/reports', method: 'POST',
    headers: { 'x-amz-access-token': token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(reportBody) }
  }, reportBody);
  console.log('Status:', r1.status);
  console.log('Response:', JSON.stringify(r1.body, null, 2));

  // Also try the newer Sales and Traffic report (always works for brand owners)
  const r2body = JSON.stringify({
    reportType: 'GET_SALES_AND_TRAFFIC_REPORT',
    marketplaceIds: [MARKETPLACE_ID],
    dataStartTime: `${startDate}T00:00:00+00:00`,
    dataEndTime: `${endDate}T23:59:59+00:00`,
    reportOptions: { dateGranularity: 'WEEK', asinGranularity: 'SKU' }
  });
  console.log('\nRequesting Sales & Traffic report...');
  const r2 = await httpRequest({
    hostname: API_HOST, path: '/reports/2021-06-30/reports', method: 'POST',
    headers: { 'x-amz-access-token': token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(r2body) }
  }, r2body);
  console.log('Status:', r2.status);
  console.log('Response:', JSON.stringify(r2.body, null, 2));

  // Try the Search Query Performance report with correct ASIN-level params
  const sqpBody = JSON.stringify({
    reportType: 'GET_BRAND_ANALYTICS_SEARCH_QUERY_PERFORMANCE_REPORT',
    marketplaceIds: [MARKETPLACE_ID],
    dataStartTime: `${startDate}T00:00:00+00:00`,
    dataEndTime: `${endDate}T23:59:59+00:00`,
    reportOptions: { reportPeriod: 'WEEK', queryType: 'BRAND' }
  });
  console.log('\nRequesting Search Query Performance (BRAND)...');
  const r3 = await httpRequest({
    hostname: API_HOST, path: '/reports/2021-06-30/reports', method: 'POST',
    headers: { 'x-amz-access-token': token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(sqpBody) }
  }, sqpBody);
  console.log('Status:', r3.status);
  console.log('Response:', JSON.stringify(r3.body, null, 2));
})();
