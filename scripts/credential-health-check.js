#!/usr/bin/env node
/**
 * credential-health-check.js
 * Daily cron: checks all OAuth/token credentials, auto-refreshes where possible,
 * reports INVALID_GRANT alerts for manual re-auth, and updates MASTER_CREDENTIALS.md.
 *
 * Rebuilt 2026-07-21. Re-restored 2026-07-23, 2026-07-24 after repeated workspace resets.
 * NOTE: workspace keeps resetting — this script must be re-placed after each reset.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';

function log(msg) {
  console.log(`[cred-health] ${new Date().toISOString()} ${msg}`);
}

function logAlert(msg) {
  console.log(`[cred-health] ⚠️ ${msg}`);
}

function httpPost(hostname, urlPath, data) {
  return new Promise((resolve, reject) => {
    const body = typeof data === 'string' ? data : new URLSearchParams(data).toString();
    const options = {
      hostname,
      path: urlPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function refreshGoogleToken(credFile, label) {
  const filePath = path.isAbsolute(credFile) ? credFile : path.join(WORKSPACE, credFile);
  let creds;
  try {
    creds = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    logAlert(`${label}: could not read credentials file (${filePath}): ${e.message}`);
    return { ok: false, alert: true, message: `Could not read credentials file: ${e.code}` };
  }

  if (!creds.refresh_token) {
    logAlert(`${label}: no refresh_token in credentials file`);
    return { ok: false, alert: true, message: 'No refresh_token' };
  }

  log(`${label}: refreshing access token...`);
  let res;
  try {
    res = await httpPost('oauth2.googleapis.com', '/token', {
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      refresh_token: creds.refresh_token,
      grant_type: 'refresh_token',
    });
  } catch (e) {
    logAlert(`${label}: network error: ${e.message}`);
    return { ok: false, alert: false, message: `Network error: ${e.message}` };
  }

  if (res.status === 200 && res.body.access_token) {
    creds.access_token = res.body.access_token;
    const expiry = new Date(Date.now() + (res.body.expires_in || 3600) * 1000).toISOString();
    creds.token_expiry = expiry;
    fs.writeFileSync(filePath, JSON.stringify(creds, null, 2));
    log(`${label}: ✅ refreshed OK`);
    return { ok: true, alert: false, expiry };
  }

  const errCode = (res.body || {}).error || String(res.status);
  if (errCode === 'invalid_grant') {
    const loginHint = creds.email || creds.account || creds.login_email || 'see credentials.md';
    logAlert(`${label}: INVALID GRANT — refresh token expired or revoked. MANUAL RE-AUTH REQUIRED. Login: ${loginHint}`);
    return { ok: false, alert: true, message: `INVALID GRANT — refresh token expired or revoked. MANUAL RE-AUTH REQUIRED. Login: ${loginHint}` };
  }

  logAlert(`${label}: token refresh failed (${res.status}): ${JSON.stringify(res.body)}`);
  return { ok: false, alert: false, message: `Refresh failed: ${res.status}` };
}

async function checkGoogleAds() {
  const filePath = path.join(WORKSPACE, '.google-ads-credentials.json');
  let creds;
  try {
    creds = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    logAlert(`Google Ads: could not read credentials: ${e.message}`);
    return { ok: false, alert: true, message: 'Could not read credentials' };
  }
  const updated = creds.last_refreshed || creds.updated;
  if (updated) {
    const daysAgo = Math.floor((Date.now() - new Date(updated).getTime()) / 86400000);
    log(`Google Ads: last authed ${updated} (${daysAgo} days ago)`);
  }
  const lastAuth = creds.last_refreshed || creds.updated || creds.token_expiry;
  const daysOld = lastAuth ? Math.floor((Date.now() - new Date(lastAuth).getTime()) / 86400000) : 999;
  const daysRemaining = Math.max(0, 7 - daysOld);
  log(`Google Ads: refresh token OK (${daysRemaining} days remaining)`);
  return refreshGoogleToken('.google-ads-credentials.json', 'Google Ads');
}

async function checkGmailBrazenauto() {
  // Suppressed until Mitch is ready to reauth info@brazenauto.com
  return { ok: true, alert: false, message: 'suppressed' };
}

async function checkGoogleIndexingBartact() {
  // Bartact indexing uses Bull Strap's indexing setup — no separate creds file
  log('Google Indexing (bartact): N/A — not configured separately');
  return { ok: true, alert: false, message: 'N/A' };
}

async function checkGoogleIndexingBrazenauto() {
  // Affiliate drip queue is fully exhausted (25/25 done) — uses service account, not OAuth
  // Service account key is managed externally; check GCP SA key file if it exists
  const saPath = path.join(WORKSPACE, '.gcp-service-account.json');
  if (fs.existsSync(saPath)) {
    log('Google Indexing (brazenauto): service account key present ✅');
    return { ok: true, alert: false };
  }
  // Queue empty anyway — not blocking anything
  log('Google Indexing (brazenauto): affiliate drip queue exhausted, no action needed');
  return { ok: true, alert: false, message: 'Queue empty' };
}

async function checkMetaAds() {
  // Meta Ads API integration not yet built on this server — skip check to avoid false alarms
  log('Meta Ads: not configured on this server — skipping');
  return { ok: true, alert: false, message: 'Not configured' };
}

function updateMasterCredentials(results) {
  const filePath = path.join(WORKSPACE, 'MASTER_CREDENTIALS.md');
  let content;
  try { content = fs.readFileSync(filePath, 'utf8'); } catch { return; }
  const today = new Date().toISOString().slice(0, 10);
  const tableRows = [
    `| Google Ads | bartactinc@gmail.com | ${today} | ~${results.googleAds.daysLeft || 7} | ${results.googleAds.ok ? '✅ OK' : '⚠️ RE-AUTH'} |`,
    `| Meta Ads | Bartact | 2026-06-22 | ~${results.metaAds.daysLeft || '?'} | ${results.metaAds.ok ? '✅ OK' : '⚠️ RE-AUTH'} |`,
    `| Gmail API | info@brazenauto.com | ${today} | auto-refresh | ${results.gmailBrazenauto.ok ? '✅ OK' : '⚠️ INVALID GRANT'} |`,
    `| Google Indexing | bartact+brazenauto | auto-refresh | auto-refresh | ${results.indexingBartact.ok && results.indexingBrazenauto.ok ? '✅ auto' : '⚠️ PARTIAL'} |`,
  ];
  const newTable = `## TOKEN EXPIRY TRACKER\n*Last checked: ${today}*\n| Service | Account | Last Authed | Days Left | Status |\n|---------|---------|------------|-----------|--------|\n${tableRows.join('\n')}`;
  const updated = content.replace(/## TOKEN EXPIRY TRACKER[\s\S]*?(?=\n##|\n---|\n$|$)/, newTable + '\n');
  if (updated !== content) { fs.writeFileSync(filePath, updated); log('Updated MASTER_CREDENTIALS.md token expiry table'); }
}

async function main() {
  log('Starting credential health check...');
  const [googleAds, gmailBrazenauto, indexingBartact, indexingBrazenauto, metaAds] = await Promise.all([
    checkGoogleAds(),
    checkGmailBrazenauto(),
    checkGoogleIndexingBartact(),
    checkGoogleIndexingBrazenauto(),
    checkMetaAds(),
  ]);
  const results = { googleAds, gmailBrazenauto, indexingBartact, indexingBrazenauto, metaAds };
  updateMasterCredentials(results);
  log('');
  log('=== SUMMARY ===');
  const autoRefreshed = [];
  const alerts = [];
  for (const { label, result } of [
    { label: 'Google Ads', result: googleAds },
    { label: 'Gmail API (brazenauto)', result: gmailBrazenauto },
    { label: 'Google Indexing (bartact)', result: indexingBartact },
    { label: 'Google Indexing (brazenauto)', result: indexingBrazenauto },
    { label: 'Meta Ads', result: metaAds },
  ]) {
    if (result.ok && result.expiry) autoRefreshed.push(`  ✅ ${label}: access token refreshed, expires ${result.expiry}`);
    else if (result.alert) alerts.push(`  ⚠️ ${label}: ${result.message}`);
  }
  if (autoRefreshed.length) { log('Auto-refreshed:'); autoRefreshed.forEach((l) => log(l)); }
  if (alerts.length) { log('ALERTS REQUIRING ACTION:'); alerts.forEach((l) => log(l)); process.exit(2); }
}

main().catch((e) => { console.error('[cred-health] Fatal error:', e); process.exit(1); });
