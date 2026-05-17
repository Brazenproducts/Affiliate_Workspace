#!/usr/bin/env node
/**
 * Shopping ROAS Emergency Monitor
 * Checks yesterday's Bartact Shopping campaign performance via Google Ads API v23
 * Alerts if ROAS < 2.0x or spend is significantly below $250 budget
 */

const https = require('https');
const fs = require('fs');

const gadsCreds = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json', 'utf8'));
const GOOGLE_CLIENT_ID = gadsCreds.client_id;
const GOOGLE_CLIENT_SECRET = gadsCreds.client_secret;
const GOOGLE_REFRESH_TOKEN = gadsCreds.refresh_token;
const GOOGLE_DEV_TOKEN = gadsCreds.dev_token;
const CUSTOMER_ID = '1770651698'; // Bartact

// Yesterday's date string
const yesterday = new Date(Date.now() - 86400000);
const dateStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD

const SHOPPING_BUDGET = 250.00;
const ROAS_ALERT_THRESHOLD = 2.0;

function httpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function getAccessToken() {
  const postData = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    refresh_token: GOOGLE_REFRESH_TOKEN,
    grant_type: 'refresh_token'
  }).toString();

  const res = await httpRequest({
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, postData);

  const json = JSON.parse(res.body);
  if (!json.access_token) {
    throw new Error(`Auth failed: ${res.body}`);
  }
  return json.access_token;
}

async function queryGoogleAds(accessToken, query) {
  const body = JSON.stringify({ query });
  const res = await httpRequest({
    hostname: 'googleads.googleapis.com',
    path: `/v19/customers/${CUSTOMER_ID}/googleAds:search`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'developer-token': GOOGLE_DEV_TOKEN,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, body);

  if (res.statusCode !== 200) {
    throw new Error(`Google Ads API error ${res.statusCode}: ${res.body}`);
  }
  return JSON.parse(res.body);
}

async function main() {
  console.log(`\n=== BARTACT SHOPPING ROAS MONITOR ===`);
  console.log(`Checking: ${dateStr} (yesterday)`);
  console.log(`Alert threshold: ROAS < ${ROAS_ALERT_THRESHOLD}x | Budget: $${SHOPPING_BUDGET}/day\n`);

  // Get access token
  let accessToken;
  try {
    accessToken = await getAccessToken();
    console.log(`✅ Auth: OK`);
  } catch (e) {
    console.error(`❌ Auth FAILED: ${e.message}`);
    process.exit(1);
  }

  // Query Shopping campaigns specifically (advertising_channel_type = 'SHOPPING')
  const shoppingQuery = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.advertising_channel_type,
      campaign.status,
      campaign.campaign_budget,
      metrics.cost_micros,
      metrics.conversions_value,
      metrics.conversions,
      metrics.clicks,
      metrics.impressions
    FROM campaign
    WHERE
      campaign.advertising_channel_type = 'SHOPPING'
      AND segments.date = '${dateStr}'
    ORDER BY metrics.cost_micros DESC
  `;

  let shoppingData;
  try {
    shoppingData = await queryGoogleAds(accessToken, shoppingQuery);
  } catch (e) {
    // Try v23 if v19 fails
    console.log(`v19 failed, trying v23...`);
    try {
      const body = JSON.stringify({ query: shoppingQuery });
      const res = await httpRequest({
        hostname: 'googleads.googleapis.com',
        path: `/v23/customers/${CUSTOMER_ID}/googleAds:search`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': GOOGLE_DEV_TOKEN,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      }, body);
      if (res.statusCode !== 200) throw new Error(`v23 also failed ${res.statusCode}: ${res.body}`);
      shoppingData = JSON.parse(res.body);
    } catch (e2) {
      console.error(`❌ Google Ads query failed: ${e2.message}`);
      process.exit(1);
    }
  }

  const rows = shoppingData.results || [];

  if (rows.length === 0) {
    console.log(`⚠️  No Shopping campaign data found for ${dateStr}.`);
    console.log(`   Possible causes: campaigns paused, no spend, or date issue.`);
    
    // Try querying without date filter to see if campaigns exist
    const checkQuery = `
      SELECT campaign.name, campaign.status, campaign.advertising_channel_type
      FROM campaign
      WHERE campaign.advertising_channel_type = 'SHOPPING'
    `;
    try {
      const checkData = await queryGoogleAds(accessToken, checkQuery);
      const campaigns = (checkData.results || []);
      if (campaigns.length === 0) {
        console.log(`   No Shopping campaigns found in account at all.`);
      } else {
        console.log(`   Shopping campaigns in account (all time):`);
        campaigns.forEach(r => {
          console.log(`   - ${r.campaign.name} | Status: ${r.campaign.status}`);
        });
      }
    } catch (e) {
      console.log(`   Could not verify campaign existence: ${e.message}`);
    }
    
    process.exit(0);
  }

  // Aggregate totals across all Shopping campaigns
  let totalCostMicros = 0;
  let totalConversionsValue = 0;
  let totalConversions = 0;
  let totalClicks = 0;
  let totalImpressions = 0;

  console.log(`--- Shopping Campaigns Found: ${rows.length} ---\n`);

  rows.forEach(row => {
    const c = row.campaign;
    const m = row.metrics;
    const cost = (m.costMicros || 0) / 1e6;
    const value = m.conversionsValue || 0;
    const convs = m.conversions || 0;
    const clicks = m.clicks || 0;
    const imps = m.impressions || 0;
    const roas = cost > 0 ? value / cost : 0;

    totalCostMicros += (m.costMicros || 0);
    totalConversionsValue += value;
    totalConversions += convs;
    totalClicks += clicks;
    totalImpressions += imps;

    console.log(`  Campaign: ${c.name}`);
    console.log(`  Status:   ${c.status}`);
    console.log(`  Spend:    $${cost.toFixed(2)}`);
    console.log(`  Revenue:  $${value.toFixed(2)}`);
    console.log(`  ROAS:     ${roas.toFixed(2)}x`);
    console.log(`  Conv:     ${convs.toFixed(1)} | Clicks: ${clicks} | Impr: ${imps}`);
    console.log('');
  });

  // Totals
  const totalCost = totalCostMicros / 1e6;
  const totalROAS = totalCost > 0 ? totalConversionsValue / totalCost : 0;
  const budgetUtilization = (totalCost / SHOPPING_BUDGET) * 100;
  const budgetShortfall = SHOPPING_BUDGET - totalCost;

  console.log('=================================================');
  console.log(`TOTALS — Shopping | ${dateStr}`);
  console.log('=================================================');
  console.log(`Total Spend:   $${totalCost.toFixed(2)} / $${SHOPPING_BUDGET.toFixed(0)} budget (${budgetUtilization.toFixed(0)}%)`);
  console.log(`Total Revenue: $${totalConversionsValue.toFixed(2)}`);
  console.log(`Total ROAS:    ${totalROAS.toFixed(2)}x`);
  console.log(`Total Conv:    ${totalConversions.toFixed(1)}`);
  console.log(`Total Clicks:  ${totalClicks}`);
  console.log(`Total Impr:    ${totalImpressions}`);

  // ALERT EVALUATION
  console.log('\n=================================================');
  console.log('ALERTS');
  console.log('=================================================');

  let hasAlert = false;

  // ROAS check
  if (totalCost < 5) {
    console.log(`⚠️  INSUFFICIENT SPEND ($${totalCost.toFixed(2)}) — ROAS meaningless, but spend is extremely low.`);
    hasAlert = true;
  } else if (totalROAS < ROAS_ALERT_THRESHOLD) {
    console.log(`🚨 ROAS ALERT: ${totalROAS.toFixed(2)}x is BELOW the ${ROAS_ALERT_THRESHOLD}x threshold!`);
    console.log(`   Baseline was 4-5x before 4/25 SEO changes. Recovery target: 3.0x+.`);
    console.log(`   At current ROAS, spending $${totalCost.toFixed(2)} generated $${totalConversionsValue.toFixed(2)} — barely breaking even.`);
    hasAlert = true;
  } else if (totalROAS < 3.0) {
    console.log(`⚠️  ROAS WARNING: ${totalROAS.toFixed(2)}x — above alert floor (2.0x) but below 3.0x target floor.`);
    console.log(`   Monitor closely. Target: 4x+. Minimum floor: 3.0x.`);
    hasAlert = true;
  } else {
    console.log(`✅ ROAS OK: ${totalROAS.toFixed(2)}x (above ${ROAS_ALERT_THRESHOLD}x floor)`);
  }

  // Budget utilization check
  if (totalCost < 1.00) {
    console.log(`🚨 SPEND ALERT: Only $${totalCost.toFixed(2)} spent — campaigns may be paused or not serving!`);
    hasAlert = true;
  } else if (budgetShortfall > 50) {
    console.log(`⚠️  BUDGET ALERT: Spent $${totalCost.toFixed(2)} of $${SHOPPING_BUDGET} (${budgetUtilization.toFixed(0)}%) — $${budgetShortfall.toFixed(2)} short.`);
    console.log(`   Could indicate limited search volume, low bids, or serving issues.`);
    hasAlert = true;
  } else if (totalCost >= SHOPPING_BUDGET * 0.95) {
    console.log(`✅ BUDGET: Hit $${totalCost.toFixed(2)} — near/at $${SHOPPING_BUDGET} budget cap.`);
  } else {
    console.log(`✅ BUDGET: $${totalCost.toFixed(2)} spent (${budgetUtilization.toFixed(0)}% of $${SHOPPING_BUDGET} cap) — within normal range.`);
  }

  console.log('\n=================================================');
  if (hasAlert) {
    console.log('STATUS: ⚠️  NEEDS ATTENTION');
  } else {
    console.log('STATUS: ✅ ALL CLEAR');
  }
  console.log('=================================================\n');

  // Return structured result for output capture
  return {
    date: dateStr,
    spend: totalCost,
    revenue: totalConversionsValue,
    roas: totalROAS,
    conversions: totalConversions,
    clicks: totalClicks,
    impressions: totalImpressions,
    budgetUtilization,
    hasAlert,
    campaignCount: rows.length
  };
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
