#!/usr/bin/env node
// Bartact Full-Site Google Indexing API — ALL URL types, rotating 199/day
// Covers: products (318), collections (119), blog posts (~170), pages (~31) = ~638 total
// Uses service account axl-348@proud-stage-397621 (never expires)
// Rotates through all URLs so every page gets submitted roughly every 3-4 days
// State file: memory/bartact-full-indexing-state.json

const https = require('https');
const fs = require('fs');
const path = require('path');

const SHOP = 'bartact.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT || process.env.BARTACT_SHOPIFY_TOKEN || (() => {
  try {
    const env = fs.readFileSync('/home/ubuntu/.openclaw/workspace/.env', 'utf8');
    const m = env.match(/SHOPIFY_TOKEN_BARTACT=(.+)/) || env.match(/BARTACT_SHOPIFY_TOKEN=(.+)/);
    return m ? m[1].trim() : null;
  } catch { return null; }
})();

const KEY_PATH = '/home/ubuntu/.openclaw/workspace/sites/besttirepatch.com/.google-indexing-service-account.json';
const STATE_PATH = '/home/ubuntu/.openclaw/workspace/memory/bartact-full-indexing-state.json';
const BLOG_ID = '19510597'; // confirmed 2026-08-12 — single blog: News (news)
const QUOTA = 199;

function httpReq(o, d) {
  return new Promise((res, rej) => {
    const r = https.request(o, r => { let b = ''; r.on('data', c => b += c); r.on('end', () => res({ status: r.statusCode, body: b })); });
    r.on('error', rej); if (d) r.write(d); r.end();
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function shopifyGet(path) {
  const res = await httpReq({
    hostname: SHOP, path: `/admin/api/2024-01${path}`,
    headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' }
  });
  return JSON.parse(res.body);
}

async function paginatedFetch(endpoint, key) {
  let results = [];
  let url = `https://${SHOP}/admin/api/2024-01${endpoint}`;
  while (url) {
    const res = await new Promise((resolve, reject) => {
      const u = new URL(url);
      const req = https.request({
        hostname: u.hostname, path: u.pathname + u.search,
        headers: { 'X-Shopify-Access-Token': TOKEN }
      }, r => {
        let body = '';
        r.on('data', c => body += c);
        r.on('end', () => resolve({ status: r.statusCode, body, headers: r.headers }));
      });
      req.on('error', reject);
      req.end();
    });
    const data = JSON.parse(res.body);
    results.push(...(data[key] || []));
    // Parse Link header for next page
    const link = res.headers['link'] || '';
    const next = link.match(/<([^>]+)>;\s*rel="next"/);
    url = next ? next[1] : null;
    if (url) await sleep(300);
  }
  return results;
}

async function getAllBartactUrls() {
  const base = 'https://www.bartact.com';
  const urls = [];

  console.log('Fetching products...');
  const products = await paginatedFetch('/products.json?limit=250&status=active&fields=handle', 'products');
  products.forEach(p => urls.push(`${base}/products/${p.handle}`));
  console.log(`  Products: ${products.length}`);

  console.log('Fetching custom collections...');
  const custom = await paginatedFetch('/custom_collections.json?limit=250&published_status=published&fields=handle', 'custom_collections');
  custom.forEach(c => urls.push(`${base}/collections/${c.handle}`));
  console.log(`  Custom collections: ${custom.length}`);

  console.log('Fetching smart collections...');
  const smart = await paginatedFetch('/smart_collections.json?limit=250&published_status=published&fields=handle', 'smart_collections');
  smart.forEach(c => urls.push(`${base}/collections/${c.handle}`));
  console.log(`  Smart collections: ${smart.length}`);

  console.log('Fetching blog posts...');
  const articles = await paginatedFetch(`/blogs/${BLOG_ID}/articles.json?limit=250&published_status=published&fields=handle`, 'articles');
  articles.forEach(a => urls.push(`${base}/blogs/news/${a.handle}`));
  console.log(`  Blog posts: ${articles.length}`);

  console.log('Fetching pages...');
  const pages = await paginatedFetch('/pages.json?limit=250&published_status=published&fields=handle', 'pages');
  pages.forEach(p => urls.push(`${base}/pages/${p.handle}`));
  console.log(`  Pages: ${pages.length}`);

  console.log(`Total URLs: ${urls.length}`);
  return urls;
}

// JWT for service account
async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600, iat: now
  })).toString('base64url');

  const { createSign } = require('crypto');
  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(sa.private_key, 'base64url');
  const jwt = `${header}.${payload}.${sig}`;

  const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
  const res = await httpReq({
    hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
  }, body);
  return JSON.parse(res.body).access_token;
}

async function submitUrls(urls, token) {
  let ok = 0, errors = 0;
  for (const url of urls) {
    const body = JSON.stringify({ url, type: 'URL_UPDATED' });
    const res = await httpReq({
      hostname: 'indexing.googleapis.com',
      path: '/v3/urlNotifications:publish',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, body);
    if (res.status === 200) {
      ok++;
    } else {
      console.error(`  ✗ ${url} → ${res.status}: ${res.body.slice(0, 100)}`);
      errors++;
      if (res.status === 429) { console.log('Rate limited, sleeping 5s'); await sleep(5000); }
    }
    await sleep(150);
  }
  return { ok, errors };
}

async function main() {
  console.log(`=== Bartact Full-Site Indexing — ${new Date().toISOString()} ===`);

  if (!TOKEN) { console.error('No Shopify token found'); process.exit(1); }

  const sa = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
  console.log(`Service account: ${sa.client_email}`);

  // Load state
  let state = { lastIndex: 0, urls: [], lastRefresh: null };
  try { state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); } catch {}

  // Refresh URL list if empty or older than 7 days
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  if (!state.urls.length || !state.lastRefresh || Date.now() - state.lastRefresh > sevenDays) {
    console.log('Refreshing full URL list from Shopify API...');
    state.urls = await getAllBartactUrls();
    state.lastRefresh = Date.now();
    state.lastIndex = 0;
    console.log(`URL list refreshed: ${state.urls.length} total`);
  } else {
    console.log(`Using cached URL list: ${state.urls.length} total (refreshed ${new Date(state.lastRefresh).toISOString()})`);
  }

  // Get this batch (rotating window)
  const start = state.lastIndex % state.urls.length;
  let batch = state.urls.slice(start, start + QUOTA);
  if (batch.length < QUOTA) {
    // Wrap around
    batch = batch.concat(state.urls.slice(0, QUOTA - batch.length));
  }
  console.log(`Submitting batch: URLs ${start}–${(start + batch.length - 1) % state.urls.length} of ${state.urls.length}`);

  const accessToken = await getAccessToken(sa);
  const { ok, errors } = await submitUrls(batch, accessToken);

  // Advance pointer
  state.lastIndex = (start + QUOTA) % state.urls.length;
  state.lastRun = new Date().toISOString();
  state.lastBatchSubmitted = ok;
  state.lastBatchErrors = errors;
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));

  // Write to shared quota state so other scripts know Bartact has run and how much was used
  const QUOTA_STATE_PATH = '/home/ubuntu/.openclaw/workspace/memory/gcp-indexing-quota.json';
  const today = new Date().toISOString().slice(0, 10);
  let quotaState = { date: today, used: 0, bartactDone: false };
  try {
    const q = JSON.parse(fs.readFileSync(QUOTA_STATE_PATH, 'utf8'));
    if (q.date === today) quotaState = q;
  } catch {}
  quotaState.used = (quotaState.used || 0) + ok;
  quotaState.bartactDone = ok > 0;
  quotaState.bartactSubmitted = ok;
  quotaState.bartactErrors = errors;
  quotaState.bartactRunAt = new Date().toISOString();
  fs.writeFileSync(QUOTA_STATE_PATH, JSON.stringify(quotaState, null, 2));

  console.log(`\n✅ Done: ${ok} submitted, ${errors} errors`);
  console.log(`Next run starts at URL index ${state.lastIndex} of ${state.urls.length}`);
  console.log(`Full rotation every ~${Math.ceil(state.urls.length / QUOTA)} days`);
  console.log(`Quota state written: ${quotaState.used}/${QUOTA} used today, bartactDone=true`);

  // Immediately run Ballkinis with leftover quota
  const ballkinisOk = await runBallkinisAfterBartact(accessToken, quotaState.used);
  if (ballkinisOk > 0) {
    quotaState.used += ballkinisOk;
    quotaState.ballkinisDone = true;
    quotaState.ballkinisSubmitted = ballkinisOk;
    fs.writeFileSync(QUOTA_STATE_PATH, JSON.stringify(quotaState, null, 2));
  }
}

// After Bartact finishes, immediately submit remaining Ballkinis URLs using leftover quota
async function runBallkinisAfterBartact(googleToken, quotaUsed) {
  const BALLKINIS_URLS = [
    'https://ballkinis.com/',
    'https://ballkinis.com/collections/all',
    'https://ballkinis.com/collections/bikinis',
    'https://ballkinis.com/collections/one-piece',
    'https://ballkinis.com/products/ballkini-classic',
    'https://ballkinis.com/products/ballkini-thong',
    'https://ballkinis.com/products/ballkini-high-waist',
    'https://ballkinis.com/products/ballkini-sport',
    'https://ballkinis.com/products/ballkini-mini',
    'https://ballkinis.com/products/ballkini-micro',
    'https://ballkinis.com/products/ballkini-string',
    'https://ballkinis.com/products/ballkini-cheeky',
    'https://ballkinis.com/products/ballkini-brazilian',
    'https://ballkinis.com/products/ballkini-plus',
    'https://ballkinis.com/products/ballkini-bundle-2',
    'https://ballkinis.com/products/ballkini-bundle-3',
    'https://ballkinis.com/products/ballkini-gift-set',
    'https://ballkinis.com/products/ballkini-mens',
    'https://ballkinis.com/products/ballkini-kids',
  ];

  const remaining = Math.max(0, 199 - quotaUsed);
  if (remaining === 0) { console.log('\nBallkinis: no quota left today — will run tomorrow'); return 0; }

  const toSubmit = BALLKINIS_URLS.slice(0, remaining);
  console.log(`\nBallkinis: submitting ${toSubmit.length} URLs with remaining quota...`);

  let ok = 0;
  for (const url of toSubmit) {
    try {
      const body = JSON.stringify({ url, type: 'URL_UPDATED' });
      const r = await httpReq({
        hostname: 'indexing.googleapis.com',
        path: '/v3/urlNotifications:publish',
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      }, body);
      if (r.status === 200) { console.log('  ✓', url); ok++; }
      else console.log(`  ✗ ${url} → ${r.status}`);
      await sleep(500);
    } catch(e) { console.log('  ✗', url, e.message); }
  }
  console.log(`Ballkinis: ${ok}/${toSubmit.length} submitted`);
  return ok;
}

main().catch(e => { console.error(e); process.exit(1); });
