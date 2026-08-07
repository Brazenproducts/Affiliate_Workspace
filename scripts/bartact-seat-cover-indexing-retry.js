#!/usr/bin/env node
// Bartact Seat Cover Product URL Indexing via Google Indexing API
// Uses service account (axl-348@proud-stage-397621) for persistent, non-expiring auth
// Submit all weak-description & weak-title seat cover URLs for re-crawl

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load service account key
const keyPath = '/home/ubuntu/.openclaw/workspace/sites/besttirepatch.com/.google-indexing-service-account.json';
let serviceAccount = null;
try {
  if (fs.existsSync(keyPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    console.log(`✓ Loaded service account: ${serviceAccount.client_email}`);
  } else {
    console.warn(`⚠ Service account key not found at ${keyPath}`);
    console.log('Falling back to OAuth credentials if available...');
  }
} catch (e) {
  console.error(`✗ Error loading service account: ${e.message}`);
}

function httpReq(o, d) {
  return new Promise((res, rej) => {
    const r = https.request(o, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(d)); });
    r.on('error', rej); if (d) r.write(d); r.end();
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Load seat cover product URLs from memory files
function loadSeatCoverUrls() {
  const urls = new Set();
  const baseDir = '/home/ubuntu/.openclaw/workspace/memory';
  
  // Load from weak description seat covers
  try {
    const descData = JSON.parse(fs.readFileSync(path.join(baseDir, 'bartact-weak-description-seat-covers.json'), 'utf8'));
    descData.forEach(item => {
      urls.add(`https://www.bartact.com/products/${item.handle}`);
    });
    console.log(`✓ Loaded ${descData.length} from weak description file`);
  } catch (e) {
    console.warn(`⚠ Could not load weak description file: ${e.message}`);
  }
  
  // Load from weak title seat covers
  try {
    const titleData = JSON.parse(fs.readFileSync(path.join(baseDir, 'bartact-weak-title-seat-covers.json'), 'utf8'));
    titleData.forEach(item => {
      urls.add(`https://www.bartact.com/products/${item.handle}`);
    });
    console.log(`✓ Loaded ${titleData.length} from weak title file`);
  } catch (e) {
    console.warn(`⚠ Could not load weak title file: ${e.message}`);
  }
  
  return Array.from(urls);
}

// Get access token using service account JWT
async function getServiceAccountToken() {
  if (!serviceAccount) return null;
  
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64');
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  const payload = Buffer.from(JSON.stringify(claim)).toString('base64');
  const crypto = require('crypto');
  const sig = crypto.createSign('sha256').update(`${header}.${payload}`).sign(serviceAccount.private_key, 'base64');
  const jwt = `${header}.${payload}.${sig}`;
  
  const resp = await httpReq(
    { hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }).toString()
  );
  
  const parsed = JSON.parse(resp);
  return parsed.access_token;
}

async function main() {
  const urls = loadSeatCoverUrls();
  console.log(`\n📋 Total unique seat cover URLs: ${urls.length}\n`);
  
  if (urls.length === 0) {
    console.log('No URLs to process.');
    return;
  }
  
  let token = null;
  if (serviceAccount) {
    try {
      token = await getServiceAccountToken();
      if (!token) {
        console.error('✗ Failed to get service account token');
        return;
      }
      console.log('✓ Authenticated with service account\n');
    } catch (e) {
      console.error(`✗ Service account auth failed: ${e.message}`);
      return;
    }
  } else {
    // Try OAuth fallback
    try {
      const credsPath = '/home/ubuntu/.openclaw/workspace/sites/besttirepatch.com/.bullstrap-indexing-credentials.json';
      const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
      const resp = await httpReq(
        { hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        new URLSearchParams({ client_id: creds.client_id, client_secret: creds.client_secret, refresh_token: creds.refresh_token, grant_type: 'refresh_token' }).toString()
      );
      const parsed = JSON.parse(resp);
      token = parsed.access_token;
      if (!token) {
        console.error('✗ OAuth auth failed');
        return;
      }
      console.log('✓ Authenticated with OAuth\n');
    } catch (e) {
      console.error(`✗ OAuth fallback failed: ${e.message}`);
      console.log('Ensure service account key is available at:', keyPath);
      return;
    }
  }
  
  let success = 0, fail = 0;
  const results = [];
  
  for (const url of urls) {
    try {
      const resp = await httpReq(
        { hostname: 'indexing.googleapis.com', path: '/v3/urlNotifications:publish', method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } },
        JSON.stringify({ url, type: 'URL_UPDATED' })
      );
      const r = JSON.parse(resp);
      if (r.urlNotificationMetadata) {
        console.log('✅ ' + url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('/') + 50));
        success++;
        results.push({ url, status: 'success' });
      } else {
        const errMsg = r.error?.message || 'Unknown error';
        console.log('❌ ' + url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('/') + 50) + ` → ${errMsg.substring(0, 40)}`);
        fail++;
        results.push({ url, status: 'failed', error: errMsg });
      }
    } catch (e) {
      console.log('❌ ' + url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('/') + 50) + ` → ${e.message.substring(0, 40)}`);
      fail++;
      results.push({ url, status: 'failed', error: e.message });
    }
    await sleep(300); // Rate limiting
  }
  
  // Save results
  const resultsFile = '/home/ubuntu/.openclaw/workspace/memory/bartact-seat-cover-indexing-results.json';
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    total: urls.length,
    success,
    failed: fail,
    results
  }, null, 2));
  
  console.log(`\n✨ Done: ${success} submitted, ${fail} failed (out of ${urls.length})`);
  console.log(`📊 Results saved to ${resultsFile}`);
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
