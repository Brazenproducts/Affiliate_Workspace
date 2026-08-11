#!/usr/bin/env node
// Ballkinis — SEO word count audit + Google Indexing API + IndexNow
// Covers all products and collections (public Shopify JSON endpoints, no token needed)

const https = require('https');
const fs = require('fs');
const path = require('path');

const SHOP_DOMAIN = 'ballkinis.com';
const INDEXNOW_KEY = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';
const KEY_PATH = '/home/ubuntu/.openclaw/workspace/.gcp-service-account.json';

function httpGet(url) {
  return new Promise((res, rej) => {
    const u = new URL(url);
    const opts = { hostname: u.hostname, path: u.pathname + u.search, method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' } };
    https.request(opts, r => {
      let b = ''; r.on('data', c => b += c); r.on('end', () => res({ status: r.statusCode, body: b }));
    }).on('error', rej).end();
  });
}

function httpPost(url, data, headers = {}) {
  return new Promise((res, rej) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const opts = {
      hostname: u.hostname, path: u.pathname + u.search, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...headers }
    };
    const req = https.request(opts, r => {
      let b = ''; r.on('data', c => b += c); r.on('end', () => res({ status: r.statusCode, body: b }));
    });
    req.on('error', rej); req.write(body); req.end();
  });
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function wordCount(text) {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

// Google Indexing API via service account JWT
const { execSync } = require('child_process');

function getGoogleToken() {
  try {
    const key = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      iss: key.client_email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600, iat: now
    })).toString('base64url');
    const crypto = require('crypto');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(`${header}.${payload}`);
    const sig = sign.sign(key.private_key).toString('base64url');
    const jwt = `${header}.${payload}.${sig}`;
    return new Promise((res, rej) => {
      const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
      const opts = {
        hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
      };
      const req = https.request(opts, r => {
        let b = ''; r.on('data', c => b += c);
        r.on('end', () => {
          const d = JSON.parse(b);
          d.access_token ? res(d.access_token) : rej(new Error('No token: ' + b));
        });
      });
      req.on('error', rej); req.write(body); req.end();
    });
  } catch (e) { return Promise.reject(e); }
}

async function googleIndex(token, url) {
  const r = await new Promise((res, rej) => {
    const body = JSON.stringify({ url, type: 'URL_UPDATED' });
    const opts = {
      hostname: 'indexing.googleapis.com',
      path: '/v3/urlNotifications:publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(opts, r => {
      let b = ''; r.on('data', c => b += c); r.on('end', () => res({ status: r.statusCode, body: b }));
    });
    req.on('error', rej); req.write(body); req.end();
  });
  return r;
}

async function main() {
  console.log('=== Ballkinis SEO Audit + Indexing ===\n');

  // 1. Fetch all products
  const prodResp = await httpGet(`https://${SHOP_DOMAIN}/products.json?limit=250`);
  const products = JSON.parse(prodResp.body).products;

  // 2. Fetch all collections  
  const collResp = await httpGet(`https://${SHOP_DOMAIN}/collections.json?limit=250`);
  const collections = JSON.parse(collResp.body).collections;

  console.log(`Products: ${products.length} | Collections: ${collections.length}\n`);

  // 3. Build URL list
  const urls = [];
  
  // Homepage
  urls.push({ url: `https://${SHOP_DOMAIN}/`, type: 'page', title: 'Homepage' });

  // Collections
  for (const c of collections) {
    urls.push({ url: `https://${SHOP_DOMAIN}/collections/${c.handle}`, type: 'collection', title: c.title, handle: c.handle, body: c.body_html || '' });
  }

  // Products
  for (const p of products) {
    urls.push({ url: `https://${SHOP_DOMAIN}/products/${p.handle}`, type: 'product', title: p.title, handle: p.handle, body: p.body_html || '' });
  }

  // 4. Word count audit
  console.log('--- Word Count Audit ---');
  const issues = [];
  for (const item of urls) {
    if (item.type === 'page') continue;
    const text = stripHtml(item.body || '');
    const wc = wordCount(text);
    const flag = wc < 150 ? '🔴 THIN' : wc < 300 ? '🟡 WEAK' : '✅';
    console.log(`${flag} [${item.type}] ${item.title} — ${wc}w`);
    if (wc < 150) issues.push({ ...item, wordCount: wc });
  }

  if (issues.length > 0) {
    console.log(`\n⚠️  ${issues.length} thin pages (under 150w):`);
    issues.forEach(i => console.log(`  - ${i.url} (${i.wordCount}w)`));
  }

  // 5. Google Indexing API
  console.log('\n--- Google Indexing API ---');
  let googleToken;
  try {
    googleToken = await getGoogleToken();
    console.log('✅ Got Google auth token');
  } catch (e) {
    console.log('❌ Google auth failed:', e.message);
  }

  const googleResults = { ok: 0, fail: 0, errors: [] };
  if (googleToken) {
    for (const item of urls) {
      try {
        const r = await googleIndex(googleToken, item.url);
        if (r.status === 200) {
          console.log(`  ✅ Google indexed: ${item.url}`);
          googleResults.ok++;
        } else {
          console.log(`  ⚠️  Google ${r.status}: ${item.url} — ${r.body.substring(0, 120)}`);
          googleResults.fail++;
          googleResults.errors.push({ url: item.url, status: r.status });
        }
        await new Promise(r => setTimeout(r, 200)); // rate limit
      } catch (e) {
        console.log(`  ❌ Google error: ${item.url} — ${e.message}`);
        googleResults.fail++;
      }
    }
  }

  // 6. IndexNow
  console.log('\n--- IndexNow ---');
  const allUrls = urls.map(u => u.url);
  try {
    const r = await httpPost('https://api.indexnow.org/indexnow', {
      host: SHOP_DOMAIN,
      key: INDEXNOW_KEY,
      keyLocation: `https://${SHOP_DOMAIN}/${INDEXNOW_KEY}.txt`,
      urlList: allUrls
    });
    console.log(`IndexNow: HTTP ${r.status} — submitted ${allUrls.length} URLs`);
    if (r.status !== 200 && r.status !== 202) {
      console.log('  Response:', r.body.substring(0, 200));
    }
  } catch (e) {
    console.log('IndexNow error:', e.message);
  }

  // 7. Summary
  console.log('\n=== Summary ===');
  console.log(`Total URLs submitted: ${allUrls.length}`);
  console.log(`Google Indexing API: ${googleResults.ok} ok / ${googleResults.fail} failed`);
  console.log(`Thin content pages: ${issues.length}`);
  
  // Save results
  const report = {
    timestamp: new Date().toISOString(),
    totalUrls: allUrls.length,
    products: products.length,
    collections: collections.length,
    googleResults,
    thinPages: issues.map(i => ({ url: i.url, title: i.title, wordCount: i.wordCount })),
    urls: allUrls
  };
  fs.writeFileSync('/home/ubuntu/.openclaw/workspace/memory/ballkinis-seo-audit.json', JSON.stringify(report, null, 2));
  console.log('\nReport saved to memory/ballkinis-seo-audit.json');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
