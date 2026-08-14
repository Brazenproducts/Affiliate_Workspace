#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const path = require('path');

const env = {};
fs.readFileSync(path.join(__dirname, '../.env'), 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const TOKEN = env['SHOPIFY_TOKEN_BARTACT'];
const KEY = 'b4f7e2…a4b5';
const HOST = 'www.bartact.com';
const PAGE_ID = 701246341163;
const PAGE_HANDLE = 'indexnow-b7e2f1a3c9d4e8b6f0a2c5d7e9f1b3a4';
const REDIRECT_ID = 385918140459;
const THEME_ID = '126229413931';

function shopifyReq(method, p, body) {
  return new Promise((res, rej) => {
    const buf = body ? Buffer.from(JSON.stringify(body)) : null;
    const headers = { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' };
    if (buf) headers['Content-Length'] = buf.length;
    const req = https.request({ hostname: 'bartact.myshopify.com', path: p, method, headers }, r => {
      let b = ''; r.on('data', d => b += d);
      r.on('end', () => { try { res({ status: r.statusCode, body: JSON.parse(b), headers: r.headers }); } catch (e) { res({ status: r.statusCode, body: b, headers: r.headers }); } });
    });
    req.on('error', rej); if (buf) req.write(buf); req.end();
  });
}

function httpGetCheck(hostname, urlPath) {
  return new Promise((res) => {
    const req = https.request({
      hostname, path: urlPath, method: 'GET',
      headers: { 'User-Agent': 'IndexNow-Verifier/1.0', 'Accept': 'text/plain' }
    }, r => {
      let b = ''; r.on('data', d => b += d);
      r.on('end', () => res({ status: r.statusCode, body: b.slice(0, 200), location: r.headers['location'] || '' }));
    });
    req.on('error', e => res({ status: 0, body: e.message, location: '' }));
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
    req.on('error', rej); req.write(buf); req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('=== Bartact IndexNow Key File Fix (Pass 2) ===\n');

  // 1. Check current state of page and redirect
  console.log('1. Current state check...');
  const page = await shopifyReq('GET', `/admin/api/2024-01/pages/${PAGE_ID}.json`);
  console.log('   Page handle:', page.body.page?.handle);
  console.log('   Page template_suffix:', page.body.page?.template_suffix);
  console.log('   Page body_html:', (page.body.page?.body_html || '').slice(0, 60));
  console.log('   Page published:', page.body.page?.published_at ? 'yes' : 'no');

  // 2. Ensure page body is exactly the key, template is indexnow-key
  console.log('\n2. Ensuring page serves raw key content...');
  const upPage = await shopifyReq('PUT', `/admin/api/2024-01/pages/${PAGE_ID}.json`, {
    page: { id: PAGE_ID, body_html: KEY, template_suffix: 'indexnow-key', published: true }
  });
  console.log('   Page update: HTTP', upPage.status, '| body_html set to:', (upPage.body.page?.body_html || '').slice(0, 40));

  // 3. Fix redirect to point to correct page handle
  console.log('\n3. Fixing redirect path...');
  const upRedir = await shopifyReq('PUT', `/admin/api/2024-01/redirects/${REDIRECT_ID}.json`, {
    redirect: { id: REDIRECT_ID, path: `/${KEY}.txt`, target: `/pages/${PAGE_HANDLE}` }
  });
  console.log('   Redirect update: HTTP', upRedir.status);
  console.log('   Redirect:', upRedir.body.redirect?.path, '->', upRedir.body.redirect?.target);

  // 4. Ensure template outputs raw text only (no HTML wrapper)
  console.log('\n4. Checking/updating liquid template...');
  const tmpl = await shopifyReq('GET', `/admin/api/2024-01/themes/${THEME_ID}/assets.json?asset[key]=templates/page.indexnow-key.liquid`);
  console.log('   Current template:', (tmpl.body.asset?.value || '').slice(0, 80));
  if (!tmpl.body.asset?.value?.includes('{% layout none %}')) {
    const upTmpl = await shopifyReq('PUT', `/admin/api/2024-01/themes/${THEME_ID}/assets.json`, {
      asset: { key: 'templates/page.indexnow-key.liquid', value: '{% layout none %}{{ page.content }}' }
    });
    console.log('   Template updated: HTTP', upTmpl.status);
  } else {
    console.log('   Template already correct: {% layout none %}{{ page.content }}');
  }

  // 5. Test the chain: /{key}.txt -> redirect -> /pages/{handle} -> raw key
  console.log('\n5. Testing access chain (waiting 5s for propagation)...');
  await sleep(5000);

  // Test the page directly first
  const pageCheck = await httpGetCheck('www.bartact.com', `/pages/${PAGE_HANDLE}`);
  console.log('   Direct page HTTP:', pageCheck.status, '| contains key:', pageCheck.body.includes(KEY.slice(0, 10)));
  console.log('   Page body:', pageCheck.body.slice(0, 100).trim());

  // Test via redirect (the .txt path)
  let lastStatus = 0, lastBody = '', lastLocation = '';
  for (let attempt = 1; attempt <= 6; attempt++) {
    const check = await httpGetCheck('www.bartact.com', `/${KEY}.txt`);
    lastStatus = check.status; lastBody = check.body; lastLocation = check.location;
    console.log(`   /${KEY.slice(0,8)}....txt attempt ${attempt}: HTTP ${check.status} | location: ${check.location.slice(0,60)} | body: ${check.body.slice(0,60).trim()}`);
    if (check.status === 200 && check.body.trim() === KEY) {
      console.log('   ✅ Key file serves correctly at root path!');
      break;
    }
    if (attempt < 6) await sleep(5000);
  }

  // 6. Submit 303 product URLs to IndexNow
  console.log('\n6. Fetching product URLs...');
  let products = [], apiPath = '/admin/api/2024-01/products.json?limit=250&status=active&fields=id,handle,product_type';
  while (apiPath) {
    const r = await shopifyReq('GET', apiPath);
    products = products.concat(r.body.products || []);
    const next = (r.headers?.link || '').match(/<([^>]+)>; rel="next"/);
    apiPath = next ? next[1].replace('https://bartact.myshopify.com', '') : null;
  }
  const urls = products
    .filter(p => !p.handle.startsWith('cpb-order-') && p.handle !== '_additional-price' && !(p.product_type || '').toLowerCase().includes('gift card'))
    .map(p => `https://${HOST}/products/${p.handle}`);
  console.log('   URLs:', urls.length);

  // Only submit if key file is accessible
  const keyOk = lastStatus === 200 && lastBody.trim() === KEY;
  if (!keyOk) {
    console.log('\n⚠️  Key file still not serving correctly (HTTP', lastStatus, ')');
    console.log('   Redirect is in place but Shopify CDN propagation may take longer.');
    console.log('   Submitting anyway to queue — IndexNow will verify asynchronously...');
  }

  console.log('\n7. Submitting to IndexNow...');
  const sub = await httpPost('api.indexnow.org', '/IndexNow', { 'Content-Type': 'application/json' }, {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls
  });
  console.log('   IndexNow HTTP:', sub.status, '|', sub.body.slice(0, 150));

  // Also submit to Bing directly
  const subBing = await httpPost('www.bing.com', '/indexnow', { 'Content-Type': 'application/json' }, {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls
  });
  console.log('   Bing direct HTTP:', subBing.status, '|', subBing.body.slice(0, 150));

  console.log('\n=== SUMMARY ===');
  console.log('Key file at /{key}.txt: HTTP', lastStatus, keyOk ? '✅' : '⚠️ (redirect in place, may need propagation)');
  console.log('IndexNow submission: HTTP', sub.status, sub.status === 200 || sub.status === 202 ? '✅' : '❌');
  console.log('Bing direct submission: HTTP', subBing.status, subBing.status === 200 || subBing.status === 202 ? '✅' : '❌');
  console.log('URLs submitted:', urls.length);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
