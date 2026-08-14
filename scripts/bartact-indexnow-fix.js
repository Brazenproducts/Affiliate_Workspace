#!/usr/bin/env node
/**
 * Fix IndexNow key file for bartact.com
 * Shopify theme assets are served at CDN URLs, not at the root domain.
 * The only Shopify-native way to serve a file at /{key}.txt is via a page
 * with a custom URL redirect, but Shopify doesn't support arbitrary root paths.
 * 
 * Plan: Upload key file as theme asset + create/update a Shopify page that
 * serves the key content at a known path, then use Shopify's URL redirect 
 * feature to redirect /{key}.txt → that page.
 * 
 * Actually the CORRECT approach: Shopify URL redirects can redirect /file.txt
 * to any URL. We create a redirect from /{key}.txt to a page that just outputs
 * the key content. Let's try that.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const env = {};
fs.readFileSync(path.join(__dirname, '../.env'), 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const TOKEN = env['SHOPIFY_TOKEN_BARTACT'];
const THEME_ID = '126229413931'; // main theme: Copy of Supply ZDZ
const KEY = 'b4f7e2…a4b5';
const HOST = 'www.bartact.com';

function shopifyReq(method, p, body) {
  return new Promise((res, rej) => {
    const buf = body ? Buffer.from(JSON.stringify(body)) : null;
    const headers = { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' };
    if (buf) headers['Content-Length'] = buf.length;
    const req = https.request({ hostname: 'bartact.myshopify.com', path: p, method, headers }, r => {
      let b = ''; r.on('data', d => b += d);
      r.on('end', () => { try { res({ status: r.statusCode, body: JSON.parse(b), headers: r.headers }); } catch (e) { res({ status: r.statusCode, body: b, headers: r.headers }); } });
    });
    req.on('error', rej);
    if (buf) req.write(buf);
    req.end();
  });
}

function httpGet(hostname, p) {
  return new Promise((res, rej) => {
    const req = https.request({ hostname, path: p, method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' } }, r => {
      let b = ''; r.on('data', d => b += d);
      r.on('end', () => res({ status: r.statusCode, body: b.slice(0, 300), headers: r.headers }));
    });
    req.on('error', e => res({ status: 0, body: e.message }));
    req.end();
  });
}

function httpPost(hostname, p, headers, body) {
  return new Promise((res, rej) => {
    const buf = Buffer.from(JSON.stringify(body));
    const req = https.request({ hostname, path: p, method: 'POST', headers: { ...headers, 'Content-Length': buf.length } }, r => {
      let b = ''; r.on('data', d => b += d);
      r.on('end', () => res({ status: r.statusCode, body: b.slice(0, 300) }));
    });
    req.on('error', rej);
    req.write(buf); req.end();
  });
}

async function main() {
  console.log('=== Bartact IndexNow Key File Fix ===\n');

  // Step 1: Check current theme assets and understand what's available
  console.log('1. Checking theme assets...');
  const assets = await shopifyReq('GET', `/admin/api/2024-01/themes/${THEME_ID}/assets.json`);
  const allAssets = assets.body.assets || [];
  console.log('   Total assets:', allAssets.length);
  const existing = allAssets.find(a => a.key.includes('b4f7e2') || a.key.includes('indexnow'));
  console.log('   Existing indexnow asset:', existing ? existing.key : 'none');

  // Step 2: Upload key as theme asset — it'll be at CDN URL, not root
  // BUT: we can also create a Shopify page that outputs ONLY the key text
  // and then use a URL redirect from /{key}.txt → /pages/indexnow-key
  // Shopify redirects work for root-level paths
  
  console.log('\n2. Creating/updating page that serves key content...');
  // Find existing page
  const pages = await shopifyReq('GET', '/admin/api/2024-01/pages.json?limit=250&fields=id,handle,title');
  const existingPage = (pages.body.pages || []).find(p => p.handle === 'indexnow-key' || p.handle.includes('indexnow'));
  
  let pageId;
  if (existingPage) {
    console.log('   Found existing page:', existingPage.id, existingPage.handle);
    // Update it to output just the key
    const up = await shopifyReq('PUT', `/admin/api/2024-01/pages/${existingPage.id}.json`, {
      page: {
        id: existingPage.id,
        body_html: KEY,
        template_suffix: 'indexnow-key'
      }
    });
    pageId = existingPage.id;
    console.log('   Updated page: HTTP', up.status);
  } else {
    const cp = await shopifyReq('POST', '/admin/api/2024-01/pages.json', {
      page: {
        title: 'IndexNow Key',
        handle: 'indexnow-key',
        body_html: KEY,
        template_suffix: 'indexnow-key',
        published: true
      }
    });
    pageId = cp.body.page?.id;
    console.log('   Created page:', pageId, '| HTTP', cp.status);
  }

  // Step 3: Ensure the page.indexnow-key.liquid template outputs ONLY the key
  console.log('\n3. Updating template to output raw key text (no layout/HTML)...');
  const tmplUp = await shopifyReq('PUT', `/admin/api/2024-01/themes/${THEME_ID}/assets.json`, {
    asset: {
      key: 'templates/page.indexnow-key.liquid',
      value: `{% layout none %}{{ page.content }}`
    }
  });
  console.log('   Template update: HTTP', tmplUp.status);

  // Step 4: Check existing URL redirects
  console.log('\n4. Checking URL redirects...');
  const redirects = await shopifyReq('GET', '/admin/api/2024-01/redirects.json?limit=250');
  const existing_redirect = (redirects.body.redirects || []).find(r => r.path && r.path.includes('b4f7e2'));
  console.log('   Existing redirect for key:', existing_redirect ? JSON.stringify(existing_redirect) : 'none');

  // Step 5: Create redirect from /{key}.txt to /pages/indexnow-key
  const targetPath = '/pages/indexnow-key';
  if (existing_redirect) {
    if (existing_redirect.target !== targetPath) {
      const up = await shopifyReq('PUT', `/admin/api/2024-01/redirects/${existing_redirect.id}.json`, {
        redirect: { id: existing_redirect.id, path: `/${KEY}.txt`, target: targetPath }
      });
      console.log('   Updated redirect: HTTP', up.status);
    } else {
      console.log('   Redirect already correct:', existing_redirect.path, '->', existing_redirect.target);
    }
  } else {
    const cr = await shopifyReq('POST', '/admin/api/2024-01/redirects.json', {
      redirect: { path: `/${KEY}.txt`, target: targetPath }
    });
    console.log('   Created redirect: HTTP', cr.status, '|', JSON.stringify(cr.body.redirect || cr.body).slice(0, 100));
  }

  // Step 6: Test if /{key}.txt now resolves correctly (allow a few seconds for propagation)
  console.log('\n5. Testing key file access (may need a moment to propagate)...');
  await new Promise(r => setTimeout(r, 3000));
  
  for (let attempt = 1; attempt <= 5; attempt++) {
    const check = await httpGet('www.bartact.com', `/${KEY}.txt`);
    console.log(`   Attempt ${attempt}: HTTP ${check.status} | body: ${check.body.slice(0, 80).trim()}`);
    if (check.status === 200 && check.body.includes(KEY.slice(0, 8))) {
      console.log('   ✅ Key file is live and correct!');
      break;
    }
    if (attempt < 5) await new Promise(r => setTimeout(r, 3000));
  }

  // Step 7: Resubmit 303 product URLs to IndexNow
  console.log('\n6. Fetching product URLs...');
  let products = [];
  let apiPath = '/admin/api/2024-01/products.json?limit=250&status=active&fields=id,handle,product_type';
  while (apiPath) {
    const r = await shopifyReq('GET', apiPath);
    products = products.concat(r.body.products || []);
    const next = r.headers?.link?.match(/<([^>]+)>; rel="next"/);
    apiPath = next ? next[1].replace('https://bartact.myshopify.com', '') : null;
  }
  const urls = products
    .filter(p => !p.handle.startsWith('cpb-order-') && p.handle !== '_additional-price' && !(p.product_type || '').toLowerCase().includes('gift card'))
    .map(p => `https://${HOST}/products/${p.handle}`);
  console.log('   Product URLs:', urls.length);

  console.log('\n7. Submitting to IndexNow...');
  const r = await httpPost('api.indexnow.org', '/IndexNow', { 'Content-Type': 'application/json' }, {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls
  });
  console.log('   IndexNow batch: HTTP', r.status, '|', r.body.slice(0, 100));

  console.log('\n=== DONE ===');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
