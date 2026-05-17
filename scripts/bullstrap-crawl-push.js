#!/usr/bin/env node
// Bull Strap crawl acceleration — IndexNow + Google Indexing API
const https = require('https');
const zlib = require('zlib');
const DOMAIN = 'bullstrap.com';
const INDEXNOW_KEY = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';
const ROOT_KEY_URL = 'https://' + DOMAIN + '/' + INDEXNOW_KEY + '.txt';
const SHOPIFY_CDN_KEY_URL = 'https://cdn.shopify.com/s/files/1/0739/5930/9585/t/5/assets/' + INDEXNOW_KEY + '.txt';

function get(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } }, r => {
      const chunks = [];
      r.on('data', c => chunks.push(c));
      r.on('end', () => {
        let buf = Buffer.concat(chunks);
        const enc = r.headers['content-encoding'];
        if (enc === 'gzip' || enc === 'br' || enc === 'deflate') {
          try {
            if (enc === 'gzip') buf = zlib.gunzipSync(buf);
            else if (enc === 'deflate') buf = zlib.inflateSync(buf);
            else if (enc === 'br') buf = zlib.brotliDecompressSync(buf);
          } catch (e) { /* use raw */ }
        }
        res({ status: r.statusCode, body: buf.toString('utf8') });
      });
    }).on('error', rej);
  });
}

function post(hostname, path, body) {
  return new Promise((res, rej) => {
    const data = JSON.stringify(body);
    const req = https.request({ hostname, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, r => {
      let d = ''; r.on('data', c => d += c);
      r.on('end', () => res({ status: r.statusCode, body: d }));
    });
    req.on('error', rej);
    req.write(data);
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function extractLocs(xml) {
  const urls = [];
  const tag = '<loc>';
  const endTag = '</loc>';
  let pos = 0;
  while (true) {
    const s = xml.indexOf(tag, pos);
    if (s === -1) break;
    const e = xml.indexOf(endTag, s);
    if (e === -1) break;
    urls.push(xml.substring(s + tag.length, e).replace(/&amp;/g, '&').trim());
    pos = e + endTag.length;
  }
  return urls;
}

async function main() {
  console.log('=== Bull Strap Crawl Push ===\n');

  // 0. Verify IndexNow key is actually served from the Bull Strap root domain.
  const rootKey = await get(ROOT_KEY_URL);
  const cdnKey = await get(SHOPIFY_CDN_KEY_URL);
  console.log('Root key URL: ' + rootKey.status + ' (' + ROOT_KEY_URL + ')');
  console.log('CDN key URL: ' + cdnKey.status + ' (' + SHOPIFY_CDN_KEY_URL + ')');
  if (rootKey.status !== 200 || !rootKey.body.includes(INDEXNOW_KEY)) {
    console.log('\nIndexNow BLOCKED for Bull Strap: key file is not available at the root domain.');
    console.log('Shopify CDN asset exists, but IndexNow requires a same-host key location.');
    console.log('Needed next step: Cloudflare Worker/root route OR Bing Webmaster Tools API credentials.\n');
  }

  // 1. Fetch sitemap index
  const idx = await get('https://' + DOMAIN + '/sitemap.xml');
  console.log('Sitemap index: ' + idx.status + ', ' + idx.body.length + ' bytes');
  const sitemaps = extractLocs(idx.body);
  console.log('Sitemaps found: ' + sitemaps.length);
  if (sitemaps.length === 0) {
    console.log('DEBUG first 500 chars:', idx.body.substring(0, 500));
    return;
  }

  // 2. Collect all URLs from all sitemaps
  let allUrls = [];
  for (const sm of sitemaps) {
    await sleep(500);
    try {
      const resp = await get(sm);
      const urls = extractLocs(resp.body);
      const label = sm.split('?')[0].split('/').pop();
      console.log('  ' + label + ': ' + urls.length + ' URLs');
      allUrls.push(...urls);
    } catch (e) { console.log('  Error fetching: ' + sm.substring(0, 60)); }
  }
  console.log('\nTotal URLs collected: ' + allUrls.length);

  // 3. Submit to IndexNow in batches only if the root-domain key file is valid.
  console.log('\n=== IndexNow Submission ===');
  let submitted = 0;
  if (rootKey.status === 200 && rootKey.body.includes(INDEXNOW_KEY)) {
    const BATCH = 10000;
    for (let i = 0; i < allUrls.length; i += BATCH) {
      const batch = allUrls.slice(i, i + BATCH);
      try {
        const resp = await post('api.indexnow.org', '/indexnow', {
          host: DOMAIN, key: INDEXNOW_KEY, keyLocation: ROOT_KEY_URL, urlList: batch
        });
        console.log('Batch ' + (Math.floor(i / BATCH) + 1) + ': ' + resp.status + ' (' + batch.length + ' URLs)');
        if (resp.status === 200 || resp.status === 202) submitted += batch.length;
        else console.log('  Response: ' + resp.body.substring(0, 300));
      } catch (e) { console.log('  Error: ' + e.message); }
      await sleep(2000);
    }
  } else {
    console.log('Skipped IndexNow submission because Bull Strap root key file is not live.');
  }

  console.log('\n=== RESULTS ===');
  console.log('Sitemaps: ' + sitemaps.length);
  console.log('Total URLs: ' + allUrls.length);
  console.log('IndexNow submitted: ' + submitted);
}

main().catch(e => console.error('Fatal:', e.message));
