#!/usr/bin/env node
// Pull 30-day campaign performance breakdown via Google Ads REST API

const https = require('https');
const fs = require('fs');

const CREDS = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json', 'utf8'));

function post(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method: 'POST', headers }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function getAccessToken() {
  const body = new URLSearchParams({
    client_id: CREDS.client_id,
    client_secret: CREDS.client_secret,
    refresh_token: CREDS.refresh_token,
    grant_type: 'refresh_token',
  }).toString();
  const res = await post('oauth2.googleapis.com', '/token', {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(body),
  }, body);
  const json = JSON.parse(res.body);
  if (!json.access_token) throw new Error('Token refresh failed: ' + res.body);
  return json.access_token;
}

async function run() {
  const token = await getAccessToken();
  const customerId = CREDS.customer_id.replace(/-/g, '');

  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      metrics.cost_micros,
      metrics.conversions_value,
      metrics.conversions,
      metrics.clicks,
      metrics.impressions
    FROM campaign
    WHERE segments.date DURING LAST_30_DAYS
    AND campaign.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
  `;

  const body = JSON.stringify({ query });
  const res = await post('googleads.googleapis.com',
    `/v23/customers/${customerId}/googleAds:search`,
    {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'developer-token': CREDS.dev_token,
      'Content-Length': Buffer.byteLength(body),
    }, body);

  if (res.status !== 200) {
    console.error('API error:', res.body);
    process.exit(1);
  }

  const data = JSON.parse(res.body);
  const rows = data.results || [];

  console.log('\n=== BARTACT GOOGLE ADS — LAST 30 DAYS ===\n');
  console.log(`${'Campaign'.padEnd(45)} ${'Spend'.padStart(9)} ${'Revenue'.padStart(10)} ${'ROAS'.padStart(6)} ${'Convs'.padStart(6)} ${'Clicks'.padStart(7)}`);
  console.log('-'.repeat(90));

  let totalSpend = 0, totalRev = 0, totalConvs = 0;

  rows.forEach(r => {
    const spend = r.metrics.costMicros / 1e6;
    const rev = parseFloat(r.metrics.conversionsValue || 0);
    const roas = spend > 0 ? (rev / spend).toFixed(2) : '—';
    const convs = parseFloat(r.metrics.conversions || 0).toFixed(1);
    const clicks = r.metrics.clicks || 0;
    const name = r.campaign.name.substring(0, 44);
    totalSpend += spend;
    totalRev += rev;
    totalConvs += parseFloat(convs);
    console.log(`${name.padEnd(45)} $${spend.toFixed(2).padStart(8)} $${rev.toFixed(2).padStart(9)} ${String(roas).padStart(6)}x ${convs.padStart(6)} ${String(clicks).padStart(7)}`);
  });

  console.log('-'.repeat(90));
  const totalRoas = totalSpend > 0 ? (totalRev / totalSpend).toFixed(2) : '—';
  console.log(`${'TOTAL'.padEnd(45)} $${totalSpend.toFixed(2).padStart(8)} $${totalRev.toFixed(2).padStart(9)} ${String(totalRoas).padStart(6)}x ${totalConvs.toFixed(1).padStart(6)}`);
}

run().catch(console.error);
