#!/usr/bin/env node
/**
 * Test if Bartact SP-API has Brand Analytics access.
 * Tries to create a Search Query Performance report (the goldmine).
 */

const https = require('https');
const fs = require('fs');

const CREDS = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.amazon-bartact-credentials.json', 'utf8'));
const MARKETPLACE_ID = CREDS.marketplace_id;
const API_HOST = 'sellingpartnerapi-na.amazon.com';

function httpRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
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
  if (res.status !== 200) { console.error('Token refresh failed:', res); process.exit(1); }
  return res.body.access_token;
}

async function tryReport(token, reportType, label) {
  // Date range: prior 4 full weeks
  const end = new Date(); end.setUTCDate(end.getUTCDate() - (end.getUTCDay() || 7));
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - 28);
  const fmt = (d) => d.toISOString().split('T')[0] + 'T00:00:00+00:00';

  const body = JSON.stringify({
    reportType,
    marketplaceIds: [MARKETPLACE_ID],
    dataStartTime: fmt(start),
    dataEndTime: fmt(end),
    reportOptions: { reportPeriod: 'WEEK' }
  });

  const res = await httpRequest({
    hostname: API_HOST, path: '/reports/2021-06-30/reports', method: 'POST',
    headers: {
      'x-amz-access-token': token,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, body);

  console.log(`\n=== ${label} (${reportType}) ===`);
  console.log('Status:', res.status);
  console.log('Body:', JSON.stringify(res.body, null, 2));
  return res;
}

(async () => {
  const token = await refreshToken();
  console.log('Got access token. Marketplace:', MARKETPLACE_ID);

  // Brand Analytics Search Query Performance — the goldmine
  await tryReport(token, 'GET_BRAND_ANALYTICS_SEARCH_TERMS_REPORT', 'Search Terms (top searches)');
  await tryReport(token, 'GET_BRAND_ANALYTICS_SEARCH_QUERY_PERFORMANCE_REPORT', 'Search Query Performance');
  await tryReport(token, 'GET_BRAND_ANALYTICS_REPEAT_PURCHASE_REPORT', 'Repeat Purchase');
  await tryReport(token, 'GET_BRAND_ANALYTICS_MARKET_BASKET_REPORT', 'Market Basket');
  await tryReport(token, 'GET_BRAND_ANALYTICS_ITEM_COMPARISON_REPORT', 'Item Comparison');
})();
