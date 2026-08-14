#!/usr/bin/env node
/**
 * Audit thin products (<800w body_html) and save handle list
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

function shopifyGet(p) {
  return new Promise((res, rej) => {
    const req = https.request({ hostname: 'bartact.myshopify.com', path: p, headers: { 'X-Shopify-Access-Token': TOKEN } }, r => {
      let b = ''; r.on('data', d => b += d); r.on('end', () => { try { res(JSON.parse(b)); } catch (e) { res({}); } });
    });
    req.on('error', rej); req.end();
  });
}

function wc(html) {
  if (!html) return 0;
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(w => w.length > 0).length;
}

async function main() {
  let products = [], p = '/admin/api/2024-01/products.json?limit=250&status=active&fields=id,title,handle,body_html,product_type';
  while (p) {
    const r = await shopifyGet(p);
    products = products.concat(r.products || []);
    const next = (r.link || '').match(/<([^>]+)>; rel="next"/);
    p = next ? next[1].replace('https://bartact.myshopify.com', '') : null;
  }

  const thin = [], ok = [], skip = [];
  for (const prod of products) {
    if (prod.handle.startsWith('cpb-order-') || prod.handle === '_additional-price' ||
        (prod.product_type || '').toLowerCase().includes('gift card') ||
        (prod.title || '').toLowerCase().includes("customer's product")) {
      skip.push(prod.handle); continue;
    }
    const w = wc(prod.body_html);
    if (w < 800) thin.push({ h: prod.handle, w, t: prod.title.slice(0, 70) });
    else ok.push(prod.handle);
  }

  console.log('Total active: ' + products.length);
  console.log('Skipped (CPB/gift): ' + skip.length);
  console.log('Thin (<800w): ' + thin.length);
  console.log('OK (800w+): ' + ok.length);
  console.log('\nThinnest 30:');
  thin.sort((a, b) => a.w - b.w).slice(0, 30).forEach(p => console.log('  ' + String(p.w).padStart(4) + 'w  ' + p.h.slice(0, 70)));
  if (thin.length > 30) console.log('  ...and ' + (thin.length - 30) + ' more');

  fs.writeFileSync(path.join(__dirname, '../memory/bartact-thin-products.json'), JSON.stringify(thin.map(p => p.h), null, 2));
  console.log('\nSaved: memory/bartact-thin-products.json (' + thin.length + ' handles)');
}
main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
