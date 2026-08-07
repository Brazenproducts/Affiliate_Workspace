#!/usr/bin/env node
/**
 * Bull Strap Merchant Center Daily Check
 * Monitors Google Merchant Center performance for bullstrap.com
 * Checks ROAS and 404 errors; alerts if thresholds exceeded
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CREDS_PATH = '/home/ubuntu/.openclaw/workspace/sites/indexing-credentials/.bullstrap-merchant-center-credentials.json';
const MEMORY_PATH = '/home/ubuntu/.openclaw/workspace/memory/bullstrap-merchant-center-latest.md';

const ROAS_ALERT_THRESHOLD = 2.0;
const ERROR_404_ALERT_THRESHOLD = 5000;

let credentials = null;

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

async function loadCredentials() {
  try {
    if (!fs.existsSync(CREDS_PATH)) {
      console.error(`ERROR: Credentials file not found at ${CREDS_PATH}`);
      console.error('Please set up Google Merchant Center OAuth credentials first.');
      process.exit(1);
    }
    credentials = JSON.parse(fs.readFileSync(CREDS_PATH, 'utf8'));
    return credentials;
  } catch (err) {
    console.error(`Failed to load credentials: ${err.message}`);
    process.exit(1);
  }
}

async function getAccessToken() {
  const postData = new URLSearchParams({
    client_id: credentials.client_id,
    client_secret: credentials.client_secret,
    refresh_token: credentials.refresh_token,
    grant_type: 'refresh_token'
  }).toString();

  const res = await httpRequest({
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  }, postData);

  if (res.statusCode !== 200) {
    throw new Error(`OAuth token failed: ${res.statusCode} ${res.body}`);
  }

  const json = JSON.parse(res.body);
  return json.access_token;
}

async function getMerchantCenterData(accessToken) {
  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  // Merchant Center API endpoint for performance data
  // This uses the Google Shopping Content API v2.1
  const merchantId = credentials.merchant_id;
  if (!merchantId || merchantId === '0') {
    console.log('WARNING: merchant_id not configured in credentials. Skipping Merchant Center check.');
    console.log('Fix: Add real Bull Strap Merchant Center ID to', CREDS_PATH);
    process.exit(0); // Exit cleanly — no alert, no false alarm
  }
  
  const options = {
    hostname: 'merchantapi.googleapis.com',
    path: `/reports/query?merchantId=${merchantId}`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  };

  // Query for performance metrics from yesterday
  const yesterday = new Date(Date.now() - 86400000);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const postData = JSON.stringify({
    data: {
      dateRange: {
        startDate: yesterdayStr,
        endDate: yesterdayStr
      }
    }
  });

  const res = await httpRequest(options, postData);
  
  if (res.statusCode !== 200) {
    console.warn(`Merchant Center API returned ${res.statusCode}`);
    return null;
  }

  try {
    return JSON.parse(res.body);
  } catch (e) {
    console.warn(`Failed to parse MC response: ${e.message}`);
    return null;
  }
}

async function checkGSCErrors(accessToken) {
  // Google Search Console API for 404 error tracking
  // Check for 404 crawl errors
  const options = {
    hostname: 'www.googleapis.com',
    path: '/webmasters/v3/sites/bullstrap.com/crawlErrorsSamples?category=notFound&platform=web',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  };

  try {
    const res = await httpRequest(options);
    if (res.statusCode === 200) {
      const data = JSON.parse(res.body);
      return data.value || [];
    }
  } catch (e) {
    console.warn(`GSC API error: ${e.message}`);
  }
  
  return [];
}

async function generateReport(mcData, gscErrors) {
  const now = new Date();
  const timestamp = now.toISOString();
  const yesterday = new Date(Date.now() - 86400000);
  const dateStr = yesterday.toISOString().split('T')[0];

  let report = `# Bull Strap Merchant Center Daily Report\n\n`;
  report += `**Generated:** ${timestamp}\n`;
  report += `**Period:** ${dateStr}\n\n`;

  // Parse metrics
  let roas = 0;
  let revenue = 0;
  let spend = 0;
  let clicks = 0;
  let impressions = 0;

  if (mcData && mcData.results && mcData.results.length > 0) {
    const result = mcData.results[0];
    roas = result.roas || 0;
    revenue = result.revenue || 0;
    spend = result.spend || 0;
    clicks = result.clicks || 0;
    impressions = result.impressions || 0;
  }

  const error404Count = gscErrors.length;
  const alertRoas = roas < ROAS_ALERT_THRESHOLD;
  const alertErrors = error404Count > ERROR_404_ALERT_THRESHOLD;

  report += `## Performance Metrics\n\n`;
  report += `| Metric | Value |\n`;
  report += `|--------|-------|\n`;
  report += `| ROAS | ${roas.toFixed(2)}x ${alertRoas ? '⚠️ ALERT' : '✓'} |\n`;
  report += `| Revenue | $${revenue.toFixed(2)} |\n`;
  report += `| Spend | $${spend.toFixed(2)} |\n`;
  report += `| Clicks | ${clicks} |\n`;
  report += `| Impressions | ${impressions} |\n\n`;

  report += `## Error Tracking\n\n`;
  report += `| Type | Count |\n`;
  report += `|------|-------|\n`;
  report += `| 404 Errors | ${error404Count} ${alertErrors ? '⚠️ ALERT' : '✓'} |\n\n`;

  report += `## Thresholds\n\n`;
  report += `- ROAS Alert Threshold: ${ROAS_ALERT_THRESHOLD}x (Current: ${roas.toFixed(2)}x)\n`;
  report += `- 404 Error Alert Threshold: ${ERROR_404_ALERT_THRESHOLD} (Current: ${error404Count})\n\n`;

  report += `## Alerts\n\n`;
  if (alertRoas || alertErrors) {
    if (alertRoas) {
      report += `⚠️ **LOW ROAS ALERT**: ROAS is ${roas.toFixed(2)}x (below ${ROAS_ALERT_THRESHOLD}x threshold)\n`;
    }
    if (alertErrors) {
      report += `⚠️ **404 ERROR ALERT**: Found ${error404Count} 404 errors (above ${ERROR_404_ALERT_THRESHOLD} threshold)\n`;
    }
  } else {
    report += `✓ All systems normal - no alerts triggered.\n`;
  }

  return { report, alertRoas, alertErrors, roas, error404Count };
}

async function main() {
  try {
    console.log('Bull Strap Merchant Center Daily Check');
    console.log('=======================================\n');

    // Load credentials
    await loadCredentials();
    console.log('✓ Credentials loaded');

    // Get access token
    const accessToken = await getAccessToken();
    console.log('✓ OAuth access token obtained');

    // Fetch Merchant Center data
    console.log('Fetching Merchant Center performance data...');
    const mcData = await getMerchantCenterData(accessToken);
    
    // Fetch GSC 404 errors
    console.log('Fetching Google Search Console 404 errors...');
    const gscErrors = await checkGSCErrors(accessToken);

    // Generate report
    const { report, alertRoas, alertErrors, roas, error404Count } = await generateReport(mcData, gscErrors);
    
    // Ensure memory directory exists
    const memDir = path.dirname(MEMORY_PATH);
    if (!fs.existsSync(memDir)) {
      fs.mkdirSync(memDir, { recursive: true });
    }

    // Save report to memory
    fs.writeFileSync(MEMORY_PATH, report, 'utf8');
    console.log(`\n✓ Report saved to ${MEMORY_PATH}`);

    // Output report
    console.log('\n' + report);

    // Exit with alert status if needed
    if (alertRoas || alertErrors) {
      console.log('\n⚠️  ALERT CONDITIONS DETECTED');
      console.log(`   ROAS Alert: ${alertRoas ? 'YES' : 'NO'}`);
      console.log(`   Error Alert: ${alertErrors ? 'YES' : 'NO'}`);
      process.exit(1); // Non-zero exit to signal alerts
    }

  } catch (err) {
    console.error(`\nERROR: ${err.message}`);
    
    // Save error to memory
    const memDir = path.dirname(MEMORY_PATH);
    if (!fs.existsSync(memDir)) {
      fs.mkdirSync(memDir, { recursive: true });
    }
    
    const errorReport = `# Bull Strap Merchant Center Daily Report\n\n**ERROR**: ${err.message}\n\nTimestamp: ${new Date().toISOString()}\n`;
    fs.writeFileSync(MEMORY_PATH, errorReport, 'utf8');
    
    process.exit(1);
  }
}

main();
