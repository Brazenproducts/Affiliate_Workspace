#!/usr/bin/env node
// Pulls Google Organic revenue using EXACT same logic as bartact-daily-sales-report.js
const https = require('https');
const fs = require('fs');

const env = {};
fs.readFileSync('/home/ubuntu/.openclaw/workspace/.env', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const TOKEN = env.SHOPIFY_TOKEN_BARTACT;

function shopifyGet(path) {
  return new Promise((res, rej) => {
    const req = https.request({
      hostname: 'bartact.myshopify.com', path,
      headers: { 'X-Shopify-Access-Token': TOKEN }
    }, r => {
      let b = ''; r.on('data', d => b += d);
      r.on('end', () => res({ status: r.statusCode, body: JSON.parse(b), link: r.headers['link'] || '' }));
    });
    req.on('error', rej); req.end();
  });
}

// Exact attribution from bartact-daily-sales-report.js
function getSource(order) {
  const src = (order.source_name || '').toLowerCase();
  const ref = (order.referring_site || '').toLowerCase();
  const land = (order.landing_site || '').toLowerCase();
  const utm = order.utm_parameters || {};
  const utmSrc = (utm.utm_source || '').toLowerCase();
  const utmMed = (utm.utm_medium || '').toLowerCase();
  const notes = order.note_attributes || [];
  const hasGclid = notes.some(n => n.name === 'gclid' && n.value) || land.includes('gclid=');

  if (utmSrc === 'google' && utmMed === 'cpc') return 'Google Ads';
  if (utmSrc === 'bing' || utmSrc === 'microsoft') return 'Microsoft Ads';
  if (utmMed === 'cpc' || utmMed === 'ppc') return 'Paid Search (other)';
  if (ref.includes('google.') || utmSrc === 'google') return 'Google Organic';
  if (ref.includes('facebook.com') || ref.includes('l.facebook.com') || land.includes('fbclid=') || utmSrc === 'facebook') return 'Meta';
  if (src === 'shopify_draft_order' || src === 'pos' || src === 'admin') return 'Shopify Internal / Manual';
  return 'Direct / Unknown';
}

// Exact same date window as daily report: T07:00:00Z = PST midnight
async function getDayOrganic(dateStr) {
  const start = dateStr + 'T07:00:00Z';
  const nextDay = new Date(new Date(start).getTime() + 86400000);
  const end = nextDay.toISOString().slice(0, 10) + 'T07:00:00Z';

  let orders = [];
  let path = `/admin/api/2024-01/orders.json?status=any&financial_status=paid&limit=250&created_at_min=${start}&created_at_max=${end}&fields=id,total_price,source_name,referring_site,landing_site,utm_parameters,note_attributes`;
  while (path) {
    const r = await shopifyGet(path);
    orders = orders.concat(r.body.orders || []);
    const next = r.link.match(/<([^>]+)>; rel="next"/);
    path = next ? '/admin/api/2024-01/orders.json' + new URL(next[1]).search : null;
  }

  let rev = 0, cnt = 0;
  for (const o of orders) {
    if (getSource(o) === 'Google Organic') { rev += parseFloat(o.total_price) || 0; cnt++; }
  }
  return { date: dateStr, rev, cnt };
}

(async () => {
  const days = [
    '2026-07-27','2026-07-28','2026-07-29','2026-07-30','2026-07-31',
    '2026-08-01','2026-08-02','2026-08-03','2026-08-04','2026-08-05',
    '2026-08-06','2026-08-07','2026-08-08','2026-08-09',
    '2026-08-10','2026-08-11'
  ];

  const results = [];
  for (const d of days) {
    const r = await getDayOrganic(d);
    results.push(r);
  }

  const prior = results.slice(0, 14);
  const avgRev = prior.reduce((s, d) => s + d.rev, 0) / 14;
  const avgCnt = prior.reduce((s, d) => s + d.cnt, 0) / 14;

  console.log('Google Organic — Jul 27 to Aug 9 (14-day prior):');
  for (const d of prior) console.log(` ${d.date.slice(5)}  $${d.rev.toFixed(0).padStart(5)}  ${d.cnt} orders`);
  console.log(`\n14-day avg: $${avgRev.toFixed(0)} | ${avgCnt.toFixed(1)} orders/day\n`);

  const aug10 = results[14];
  const aug11 = results[15];
  console.log(`Aug 10: $${aug10.rev.toFixed(0)} | ${aug10.cnt} orders | vs avg: ${aug10.rev >= avgRev ? '+' : ''}$${(aug10.rev - avgRev).toFixed(0)}`);
  console.log(`Aug 11: $${aug11.rev.toFixed(0)} | ${aug11.cnt} orders | vs avg: ${aug11.rev >= avgRev ? '+' : ''}$${(aug11.rev - avgRev).toFixed(0)}`);
})().catch(console.error);
