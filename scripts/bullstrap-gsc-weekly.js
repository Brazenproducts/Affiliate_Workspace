#!/usr/bin/env node
// Bull Strap Weekly GSC Report — tracks organic search progress
// Saves to memory/bullstrap-gsc-weekly.json and logs summary

const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');
const sa = require('/home/ubuntu/.openclaw/workspace/.gcp-service-account.json');
const TRACKER = path.join(__dirname, '..', 'memory', 'bullstrap-gsc-weekly.json');

function createJWT() {
  const now = Math.floor(Date.now() / 1000);
  const h = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const p = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600
  })).toString('base64url');
  return h + '.' + p + '.' + crypto.createSign('RSA-SHA256').update(h + '.' + p).sign(sa.private_key, 'base64url');
}

function httpReq(o, d) {
  return new Promise((res, rej) => {
    const r = https.request(o, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(d)); });
    r.on('error', rej); if (d) r.write(d); r.end();
  });
}

async function main() {
  const t = await httpReq({ hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: createJWT() }).toString());
  const token = JSON.parse(t).access_token;
  if (!token) { console.log('Auth failed'); return; }

  const now = new Date();
  const endDate = new Date(now - 2 * 86400000).toISOString().split('T')[0]; // 2 days ago (GSC delay)
  const startDate7 = new Date(now - 9 * 86400000).toISOString().split('T')[0];
  const startDate30 = new Date(now - 32 * 86400000).toISOString().split('T')[0];

  async function query(startDate, dims, limit = 100) {
    const body = JSON.stringify({ startDate, endDate, dimensions: dims, rowLimit: limit });
    const resp = await httpReq({
      hostname: 'www.googleapis.com',
      path: '/webmasters/v3/sites/https%3A%2F%2Fbullstrap.com%2F/searchAnalytics/query',
      method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
    }, body);
    return JSON.parse(resp);
  }

  // 7-day totals
  const week = await query(startDate7, ['date']);
  let weekClicks = 0, weekImpr = 0, weekPos = 0, weekDays = 0;
  if (week.rows) {
    week.rows.forEach(r => { weekClicks += r.clicks; weekImpr += r.impressions; weekPos += r.position; weekDays++; });
  }

  // 30-day totals
  const month = await query(startDate30, ['date']);
  let monthClicks = 0, monthImpr = 0;
  if (month.rows) month.rows.forEach(r => { monthClicks += r.clicks; monthImpr += r.impressions; });

  // Top queries this week
  const queries = await query(startDate7, ['query'], 20);
  const topQueries = queries.rows?.map(r => ({ q: r.keys[0], clicks: r.clicks, impr: r.impressions, pos: r.position.toFixed(1) })) || [];

  // Top pages this week
  const pages = await query(startDate7, ['page'], 20);
  const topPages = pages.rows?.map(r => ({ url: r.keys[0].replace('https://bullstrap.com', ''), clicks: r.clicks, impr: r.impressions, pos: r.position.toFixed(1) })) || [];

  const report = {
    date: now.toISOString().split('T')[0],
    week: { clicks: weekClicks, impressions: weekImpr, avgPosition: weekDays ? (weekPos / weekDays).toFixed(1) : 0 },
    month: { clicks: monthClicks, impressions: monthImpr },
    topQueries: topQueries.slice(0, 10),
    topPages: topPages.slice(0, 10)
  };

  // Load history and append
  let history = [];
  try { history = JSON.parse(fs.readFileSync(TRACKER, 'utf8')); } catch (e) {}
  history.push(report);
  // Keep last 52 weeks
  if (history.length > 52) history = history.slice(-52);
  fs.writeFileSync(TRACKER, JSON.stringify(history, null, 2));

  // Print summary
  console.log('=== BULL STRAP GSC WEEKLY REPORT ===');
  console.log('Date:', report.date);
  console.log('7-day: ' + weekClicks + ' clicks, ' + weekImpr + ' impressions, avg pos ' + report.week.avgPosition);
  console.log('30-day: ' + monthClicks + ' clicks, ' + monthImpr + ' impressions');
  if (history.length > 1) {
    const prev = history[history.length - 2];
    const clickDelta = weekClicks - prev.week.clicks;
    const imprDelta = weekImpr - prev.week.impressions;
    console.log('vs last week: clicks ' + (clickDelta >= 0 ? '+' : '') + clickDelta + ', impressions ' + (imprDelta >= 0 ? '+' : '') + imprDelta);
  }
  console.log('\nTop queries:', topQueries.slice(0, 5).map(q => q.q + ' (' + q.clicks + 'c/' + q.impr + 'i)').join(', '));
}

main().catch(e => console.error('Error:', e.message));
