#!/usr/bin/env node
// Fix IndexNow key file for bartact.com
// Uses the correct full key (no ellipsis substitution)

const https = require('https');
const fs = require('fs');
const path = require('path');

const env = {};
fs.readFileSync(path.join(__dirname, '../.env'), 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const TOKEN = env['SHOPIFY_TOKEN_BARTACT'];
const KEY = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';  // full 32-char key, no substitution
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

function httpGetFollow(hostname, urlPath, maxRedirects = 5) {
  return new Promise((res) => {
    function doReq(h, p, remaining) {
      const req = https.request({ hostname: h, path: p, method: 'GET', headers: { 'User-Agent': 'IndexNow/1.0', 'Accept': 'text/plain,*/*' } }, r => {
        let b = ''; r.on('data', d => b += d);
        r.on('end', () => {
          if ((r.statusCode === 301 || r.statusCode === 302) && r.headers.location && remaining > 0) {
            const loc = r.headers.location;
            console.log('   -> Redirect to:', loc);
            try {
              const u = new URL(loc.startsWith('http') ? loc : 'https://' + h + loc);
              doReq(u.hostname, u.pathname + u.search, remaining - 1);
            } catch (e) { res({ status: r.statusCode, body: b.slice(0, 200), location: loc }); }
          } else {
            res({ status: r.statusCode, body: b.slice(0, 200), location: r.headers.location || '' });
          }
        });
      });
      req.on('error', e => res({ status: 0, body: e.message, location: '' }));
      req.end();
    }
    doReq(hostname, urlPath, maxRedirects);
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
  console.log('=== Bartact IndexNow Key File Fix ===');
  console.log('Key:', KEY, '(', KEY.length, 'chars)\n');

  // 1. Fix redirect to use correct key (without encoding issues)
  console.log('1. Fix redirect: /' + KEY + '.txt -> /pages/' + PAGE_HANDLE);
  const upRedir = await shopifyReq('DELETE', '/admin/api/2024-01/redirects/' + REDIRECT_ID + '.json');
  console.log('   Deleted old redirect: HTTP', upRedir.status);

  const newRedir = await shopifyReq('POST', '/admin/api/2024-01/redirects.json', {
    redirect: { path: '/' + KEY + '.txt', target: '/pages/' + PAGE_HANDLE }
  });
  console.log('   Created new redirect: HTTP', newRedir.status);
  console.log('   Path:', newRedir.body.redirect?.path);
  console.log('   Target:', newRedir.body.redirect?.target);

  // 2. Ensure page body is exactly the key
  console.log('\n2. Update page body to key content...');
  const upPage = await shopifyReq('PUT', '/admin/api/2024-01/pages/' + PAGE_ID + '.json', {
    page: { id: PAGE_ID, body_html: KEY, template_suffix: 'indexnow-key', published: true }
  });
  console.log('   Page update: HTTP', upPage.status);
  console.log('   body_html:', (upPage.body.page?.body_html || '').slice(0, 50));

  // 3. Verify template
  console.log('\n3. Template check...');
  const tmpl = await shopifyReq('GET', '/admin/api/2024-01/themes/' + THEME_ID + '/assets.json?asset[key]=templates/page.indexnow-key.liquid');
  console.log('   Template:', (tmpl.body.asset?.value || '').trim());

  // 4. Test direct page access
  console.log('\n4. Testing page directly (following redirects)...');
  await sleep(3000);
  const directCheck = await httpGetFollow('www.bartact.com', '/pages/' + PAGE_HANDLE);
  console.log('   /pages/' + PAGE_HANDLE + ': HTTP', directCheck.status);
  console.log('   Body:', directCheck.body.slice(0, 100).trim());
  const pageHasKey = directCheck.body.trim().includes(KEY);
  console.log('   Contains key:', pageHasKey ? '✅' : '❌');

  // 5. Test via .txt path (following redirects)
  console.log('\n5. Testing /' + KEY + '.txt (following redirects)...');
  for (let attempt = 1; attempt <= 5; attempt++) {
    const check = await httpGetFollow('www.bartact.com', '/' + KEY + '.txt');
    console.log('   Attempt', attempt + ': HTTP', check.status, '| body:', check.body.slice(0, 80).trim());
    if (check.status === 200 && check.body.trim().includes(KEY)) {
      console.log('   ✅ Key file accessible and correct!');
      break;
    }
    if (attempt < 5) await sleep(5000);
  }

  // 6. Submit 303 product URLs
  console.log('\n6. Fetching products...');
  let products = [], apiPath = '/admin/api/2024-01/products.json?limit=250&status=active&fields=id,handle,product_type';
  while (apiPath) {
    const r = await shopifyReq('GET', apiPath);
    products = products.concat(r.body.products || []);
    const next = (r.headers?.link || '').match(/<([^>]+)>; rel="next"/);
    apiPath = next ? next[1].replace('https://bartact.myshopify.com', '') : null;
  }
  const urls = products
    .filter(p => !p.handle.startsWith('cpb-order-') && p.handle !== '_additional-price' && !(p.product_type || '').toLowerCase().includes('gift card'))
    .map(p => 'https://' + HOST + '/products/' + p.handle);
  console.log('   URLs:', urls.length);

  console.log('\n7. Submitting to IndexNow...');
  const sub = await httpPost('api.indexnow.org', '/IndexNow', { 'Content-Type': 'application/json' }, {
    host: HOST,
    key: KEY,
    keyLocation: 'https://' + HOST + '/' + KEY + '.txt',
    urlList: urls
  });
  console.log('   api.indexnow.org: HTTP', sub.status, '|', sub.body.slice(0, 150));

  const subBing = await httpPost('www.bing.com', '/indexnow', { 'Content-Type': 'application/json' }, {
    host: HOST,
    key: KEY,
    keyLocation: 'https://' + HOST + '/' + KEY + '.txt',
    urlList: urls
  });
  console.log('   www.bing.com: HTTP', subBing.status, '|', subBing.body.slice(0, 150));

  console.log('\n=== DONE ===');
}

main().catch(e => { console.error('FATAL:', e.message, e.stack); process.exit(1); });
