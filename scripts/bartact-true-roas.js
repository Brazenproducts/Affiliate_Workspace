#!/usr/bin/env node
// bartact-true-roas.js — Shopify-verified TRUE ROAS by month
// Revenue = Shopify orders with gclid= or utm_source=google in landing_site
// Spend = Google Ads API (v23)

const https = require('https');
const fs = require('fs');

const env = {};
fs.readFileSync('.env','utf8').split('\n').forEach(l => { const [k,...v]=l.split('='); if(k&&v.length) env[k.trim()]=v.join('=').trim(); });
const SHOPIFY_TOKEN = env['SHOPIFY_TOKEN_BARTACT'];
const creds = JSON.parse(fs.readFileSync('.google-ads-credentials.json','utf8'));
const CUSTOMER_ID = '1770651698';

function sleep(ms) { return new Promise(r=>setTimeout(r,ms)); }

async function getToken() {
  const body = new URLSearchParams({
    client_id: creds.client_id, client_secret: creds.client_secret,
    refresh_token: creds.refresh_token, grant_type: 'refresh_token'
  }).toString();
  return new Promise((res,rej) => {
    const req = https.request({ hostname:'oauth2.googleapis.com', path:'/token', method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(body)}
    }, r => { let b=''; r.on('data',d=>b+=d); r.on('end',()=>res(JSON.parse(b).access_token)); });
    req.on('error',rej); req.write(body); req.end();
  });
}

async function adsQuery(token, query) {
  const body = JSON.stringify({ query });
  return new Promise((res,rej) => {
    const req = https.request({
      hostname: 'googleads.googleapis.com', method: 'POST',
      path: `/v23/customers/${CUSTOMER_ID}/googleAds:search`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'developer-token': creds.developer_token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, r => { let b=''; r.on('data',d=>b+=d); r.on('end',()=>res({status:r.statusCode,body:b})); });
    req.on('error',rej); req.write(body); req.end();
  });
}

function shopifyGet(path) {
  return new Promise((res,rej) => {
    const req = https.request({
      hostname:'bartact.myshopify.com', path, method:'GET',
      headers:{'X-Shopify-Access-Token':SHOPIFY_TOKEN,'Content-Type':'application/json'}
    }, r => {
      let b=''; r.on('data',d=>b+=d);
      r.on('end',()=>{
        const link = r.headers['link']||'';
        const m = link.match(/<https:\/\/bartact\.myshopify\.com([^>]+page_info[^>]*)>;\s*rel="next"/);
        res({ data: JSON.parse(b), nextPath: m ? m[1] : null });
      });
    });
    req.on('error',rej); req.end();
  });
}

async function getAllOrders(since, until) {
  let path = `/admin/api/2024-01/orders.json?status=any&limit=250&created_at_min=${since}&created_at_max=${until}&fields=id,total_price,landing_site,created_at`;
  let all = [];
  while (path) {
    const r = await shopifyGet(path);
    all.push(...(r.data.orders||[]));
    path = r.nextPath;
    if (path) await sleep(400);
  }
  return all;
}

function calcGoogleRev(orders) {
  let rev = 0, count = 0, total = 0, totalCount = 0;
  for (const o of orders) {
    const r = parseFloat(o.total_price)||0;
    total += r; totalCount++;
    const landing = (o.landing_site||'').toLowerCase();
    if (landing.includes('gclid=') || landing.includes('utm_source=google')) { rev += r; count++; }
  }
  return { rev, count, total, totalCount };
}

async function getSpend(token, start, end) {
  const r = await adsQuery(token, `
    SELECT campaign.id, campaign.name, metrics.cost_micros
    FROM campaign
    WHERE segments.date >= '${start}' AND segments.date <= '${end}'
      AND metrics.cost_micros > 0
    ORDER BY metrics.cost_micros DESC
  `);
  if (r.status !== 200) { console.error(`Ads API ${r.status}`); return { total: 0, campaigns: {} }; }
  const parsed = JSON.parse(r.body);
  let total = 0;
  const campaigns = {};
  for (const row of (parsed.results||[])) {
    const cost = (row.metrics?.costMicros||0)/1e6;
    total += cost;
    campaigns[row.campaign.name] = (campaigns[row.campaign.name]||0) + cost;
  }
  return { total, campaigns };
}

async function main() {
  console.log('Pulling data from Shopify + Google Ads...');
  const token = await getToken();

  const periods = [
    { label: 'June 2026', since: '2026-06-01T00:00:00Z', until: '2026-06-30T23:59:59Z', adsStart: '2026-06-01', adsEnd: '2026-06-30' },
    { label: 'July 2026', since: '2026-07-01T00:00:00Z', until: '2026-07-31T23:59:59Z', adsStart: '2026-07-01', adsEnd: '2026-07-31' },
    { label: 'Aug 1-13',  since: '2026-08-01T00:00:00Z', until: '2026-08-13T23:59:59Z', adsStart: '2026-08-01', adsEnd: '2026-08-13' },
  ];

  const results = [];
  for (const p of periods) {
    const [orders, spend] = await Promise.all([
      getAllOrders(p.since, p.until),
      getSpend(token, p.adsStart, p.adsEnd)
    ]);
    const shopify = calcGoogleRev(orders);
    const roas = spend.total > 0 ? (shopify.rev / spend.total) : 0;
    results.push({ ...p, shopify, spend, roas });
    await sleep(300);
  }

  console.log('\n========================================');
  console.log('BARTACT TRUE ROAS — SHOPIFY VERIFIED');
  console.log('Revenue = orders with gclid= or utm_source=google');
  console.log('========================================\n');

  for (const r of results) {
    console.log(`${r.label}:`);
    console.log(`  Store total:     $${r.shopify.total.toFixed(0)} (${r.shopify.totalCount} orders)`);
    console.log(`  Google revenue:  $${r.shopify.rev.toFixed(0)} (${r.shopify.count} orders)`);
    console.log(`  Google spend:    $${r.spend.total.toFixed(0)}`);
    console.log(`  TRUE ROAS:       ${r.roas.toFixed(2)}x`);
    console.log(`  Google % of rev: ${r.shopify.total > 0 ? (r.shopify.rev/r.shopify.total*100).toFixed(1) : 0}%\n`);
  }

  // Campaign breakdown for Aug
  const aug = results.find(r => r.label === 'Aug 1-13');
  const jul = results.find(r => r.label === 'July 2026');
  const jun = results.find(r => r.label === 'June 2026');

  console.log('--- Aug 1-13 Spend by Campaign ---');
  for (const [name, cost] of Object.entries(aug.spend.campaigns).sort((a,b)=>b[1]-a[1])) {
    const julCost = jul.spend.campaigns[name] || 0;
    const junCost = jun.spend.campaigns[name] || 0;
    console.log(`  Aug $${cost.toFixed(0).padStart(5)} | Jul $${julCost.toFixed(0).padStart(5)} | Jun $${junCost.toFixed(0).padStart(5)} | ${name}`);
  }

  // Campaigns that spent in Jul/Jun but not Aug
  console.log('\n--- Campaigns that ran Jul/Jun but not Aug 1-13 ---');
  const augNames = new Set(Object.keys(aug.spend.campaigns));
  for (const [name, cost] of Object.entries(jul.spend.campaigns).sort((a,b)=>b[1]-a[1])) {
    if (!augNames.has(name) && cost > 50) {
      console.log(`  Jul $${cost.toFixed(0).padStart(5)} | ${name}`);
    }
  }
}

main().catch(e => console.error('Fatal:', e.message));
