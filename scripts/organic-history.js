#!/usr/bin/env node
// Runs the exact same getChannel() logic as bartact-daily-sales-report.js
// for a given date window and returns Google Organic only.

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
      r.on('end', () => res({ body: JSON.parse(b), link: r.headers['link'] || '' }));
    });
    req.on('error', rej); req.end();
  });
}

// EXACT copy of getChannel() from bartact-daily-sales-report.js
function getChannel(order) {
  const src = (order.source_name || '').toLowerCase();
  const ref = (order.referring_site || '').toLowerCase();
  const land = (order.landing_site || '').toLowerCase();
  const utm = order.utm_parameters || {};
  const utmSrc = (utm.utm_source || '').toLowerCase();
  const utmMed = (utm.utm_medium || '').toLowerCase();
  const notes = order.note_attributes || [];
  const hasGclid = notes.some(n => n.name === 'gclid' && n.value) || land.includes('gclid=');

  if (hasGclid) return 'Google Ads';
  if (utmSrc === 'google' && utmMed === 'cpc') return 'Google Ads';
  if (utmSrc === 'bing' || utmSrc === 'microsoft') return 'Microsoft Ads';
  if (utmMed === 'cpc' || utmMed === 'ppc') return 'Paid Search (other)';
  if (ref.includes('google.') || utmSrc === 'google') return 'Google Organic';
  if (ref.includes('bing.com') || ref.includes('duckduckgo.com')) return 'Bing/DDG Organic';
  if (ref.includes('bartact.com')) return 'Internal Referral';
  if (ref.includes('facebook.com') || ref.includes('l.facebook.com') || land.includes('fbclid=') || utmSrc === 'facebook') return 'Meta (Facebook/Instagram)';
  if (ref.includes('instagram.com') || utmSrc === 'instagram') return 'Instagram';
  if (/^\d+$/.test(src)) return 'Shopify Internal / Manual';
  if (src === 'pos') return 'POS';
  if (ref && !ref.includes('bartact')) return 'Referral';
  return 'Direct / Unknown';
}

async function getDayOrganic(dateStr) {
  const minDate = dateStr + 'T07:00:00Z';
  const next = new Date(new Date(minDate).getTime() + 86400000);
  const maxDate = next.toISOString().slice(0, 10) + 'T07:00:00Z';

  let orders = [];
  let path = `/admin/api/2024-01/orders.json?status=any&financial_status=paid&limit=250&created_at_min=${minDate}&created_at_max=${maxDate}&fields=id,total_price,source_name,referring_site,landing_site,utm_parameters,note_attributes`;
  while (path) {
    const r = await shopifyGet(path);
    orders = orders.concat(r.body.orders || []);
    const next = r.link.match(/<([^>]+)>; rel="next"/);
    path = next ? '/admin/api/2024-01/orders.json' + new URL(next[1]).search : null;
  }

  const channels = {};
  for (const o of orders) {
    const ch = getChannel(o);
    const amt = parseFloat(o.total_price) || 0;
    channels[ch] = channels[ch] || { rev: 0, cnt: 0 };
    channels[ch].rev += amt;
    channels[ch].cnt++;
  }
  const org = channels['Google Organic'] || { rev: 0, cnt: 0 };
  const ads = channels['Google Ads'] || { rev: 0, cnt: 0 };
  return { date: dateStr, org, ads };
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
  const avgOrg = prior.reduce((s, d) => s + d.org.rev, 0) / 14;
  const avgAds = prior.reduce((s, d) => s + d.ads.rev, 0) / 14;

  console.log('                Organic          Google Ads');
  console.log('Date        Rev      Ord      Rev      Ord');
  for (const d of prior) {
    console.log(`${d.date.slice(5)}   $${d.org.rev.toFixed(0).padStart(5)}   ${String(d.org.cnt).padStart(2)}      $${d.ads.rev.toFixed(0).padStart(5)}   ${String(d.ads.cnt).padStart(2)}`);
  }
  console.log(`\n14-day avg   $${avgOrg.toFixed(0).padStart(5)}              $${avgAds.toFixed(0).padStart(5)}\n`);

  const aug10 = results[14];
  const aug11 = results[15];
  console.log(`Aug 10       $${aug10.org.rev.toFixed(0).padStart(5)}   ${String(aug10.org.cnt).padStart(2)}      $${aug10.ads.rev.toFixed(0).padStart(5)}   ${String(aug10.ads.cnt).padStart(2)}  (vs avg org: +$${(aug10.org.rev-avgOrg).toFixed(0)}, ads: +$${(aug10.ads.rev-avgAds).toFixed(0)})`);
  console.log(`Aug 11       $${aug11.org.rev.toFixed(0).padStart(5)}   ${String(aug11.org.cnt).padStart(2)}      $${aug11.ads.rev.toFixed(0).padStart(5)}   ${String(aug11.ads.cnt).padStart(2)}  (vs avg org: +$${(aug11.org.rev-avgOrg).toFixed(0)}, ads: +$${(aug11.ads.rev-avgAds).toFixed(0)})`);
})().catch(console.error);
