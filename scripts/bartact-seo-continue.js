#!/usr/bin/env node
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');
const fs = require('fs');

const SHOP = 'bartact.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;
const API = '2024-01';
const OUT = '/home/ubuntu/.openclaw/workspace/tmp/bartact-seo-state.json';

if (!process.env.BARTACT_CONFIRMED) {
  console.error('ERROR: Set BARTACT_CONFIRMED=1 to run this script against Bartact Shopify.');
  console.error('Example: BARTACT_CONFIRMED=1 node ' + require('path').basename(__filename));
  process.exit(1);
}

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: SHOP,
      path: `/admin/api/${API}/${path}`,
      method,
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        let parsed = data;
        try { parsed = JSON.parse(data); } catch {}
        resolve({ status: res.statusCode, body: parsed, headers: res.headers });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function paginate(path, key) {
  const items = [];
  let nextPath = path;
  while (nextPath) {
    const res = await request('GET', nextPath);
    if (res.status !== 200) throw new Error(`GET ${nextPath} failed ${res.status}`);
    items.push(...(res.body[key] || []));
    const link = res.headers.link || '';
    let found = null;
    if (link.includes('rel="next"')) {
      for (const part of link.split(',')) {
        if (part.includes('rel="next"')) {
          found = part.split('<')[1].split('>')[0].replace(`https://${SHOP}/admin/api/${API}/`, '');
        }
      }
    }
    nextPath = found;
  }
  return items;
}

async function main() {
  const custom = await paginate('custom_collections.json?limit=250&fields=id,handle,title,metafields_global_title_tag,metafields_global_description_tag,body_html,updated_at', 'custom_collections');
  const smart = await paginate('smart_collections.json?limit=250&fields=id,handle,title,metafields_global_title_tag,metafields_global_description_tag,body_html,updated_at', 'smart_collections');
  const articles = await paginate('blogs/19510597/articles.json?limit=250&fields=id,title,handle,updated_at,body_html', 'articles');
  const pages = await paginate('pages.json?limit=250&fields=id,title,handle,updated_at,body_html', 'pages');
  fs.writeFileSync(OUT, JSON.stringify({ custom, smart, articles, pages }, null, 2));
  console.log(JSON.stringify({ custom: custom.length, smart: smart.length, articles: articles.length, pages: pages.length, out: OUT }, null, 2));
}

main().catch(err => {
  console.error(err.stack || String(err));
  process.exit(1);
});
