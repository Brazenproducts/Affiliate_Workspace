#!/usr/bin/env node
// GSC snapshot — overall + target keywords + 5 priority collections
const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const sa = require('/home/ubuntu/.openclaw/workspace/.gcp-service-account.json');

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
    const r = https.request(o, r => { let b = ''; r.on('data', c => b += c); r.on('end', () => res(b)); });
    r.on('error', rej); if (d) r.write(d); r.end();
  });
}

async function main() {
  const t = await httpReq(
    { hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: createJWT() }).toString()
  );
  const token = JSON.parse(t).access_token;
  if (!token) { console.error('Auth failed:', t); process.exit(1); }

  const now = new Date();
  const end = new Date(now - 2 * 86400000).toISOString().slice(0, 10); // GSC 2-day lag
  const start28 = new Date(now - 30 * 86400000).toISOString().slice(0, 10);
  const start7  = new Date(now -  9 * 86400000).toISOString().slice(0, 10);

  async function gscQuery(startDate, endDate, dims, rowLimit, filters) {
    const body = { startDate, endDate, dimensions: dims, rowLimit };
    if (filters) body.dimensionFilterGroups = [{ filters }];
    const resp = await httpReq({
      hostname: 'www.googleapis.com',
      path: '/webmasters/v3/sites/https%3A%2F%2Fbullstrap.com%2F/searchAnalytics/query',
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
    }, JSON.stringify(body));
    return JSON.parse(resp);
  }

  // ── Overall 28-day ──────────────────────────────────────────────
  const ov28 = await gscQuery(start28, end, ['date'], 30);
  let c28=0, i28=0, p28=0, d28=0;
  (ov28.rows||[]).forEach(r => { c28+=r.clicks; i28+=r.impressions; p28+=r.position; d28++; });

  // ── Overall 7-day ───────────────────────────────────────────────
  const ov7 = await gscQuery(start7, end, ['date'], 10);
  let c7=0, i7=0, p7=0, d7=0;
  (ov7.rows||[]).forEach(r => { c7+=r.clicks; i7+=r.impressions; p7+=r.position; d7++; });

  console.log('\n=== OVERALL ===');
  console.log(`28-day: ${c28} clicks | ${i28.toLocaleString()} impressions | avg pos ${d28?(p28/d28).toFixed(1):'n/a'}`);
  console.log(`7-day:  ${c7} clicks | ${i7.toLocaleString()} impressions | avg pos ${d7?(p7/d7).toFixed(1):'n/a'}`);

  // ── Top 20 queries 28-day ───────────────────────────────────────
  const qs = await gscQuery(start28, end, ['query'], 20);
  console.log('\n=== TOP 20 QUERIES (28-day) ===');
  (qs.rows||[]).forEach(r => {
    console.log(`  pos ${r.position.toFixed(1).padStart(5)}  ${r.clicks}c / ${r.impressions}imp  "${r.keys[0]}"`);
  });

  // ── Target keywords ─────────────────────────────────────────────
  const TARGETS = [
    'limit straps', 'limit strap', 'how to measure for limit straps',
    'carli suspension', 'carli suspension ram 2500', 'carli coilovers',
    'coilovers', 'brake line kits', 'grab handles jeep wrangler',
    'bull strap', 'bullstrap'
  ];
  console.log('\n=== TARGET KEYWORDS (28-day) ===');
  for (const kw of TARGETS) {
    const r = await gscQuery(start28, end, ['query'], 1, [{ dimension: 'query', operator: 'equals', expression: kw }]);
    if (r.rows?.length) {
      const row = r.rows[0];
      console.log(`  pos ${row.position.toFixed(1).padStart(5)}  ${row.clicks}c / ${row.impressions}imp  "${kw}"`);
    } else {
      console.log(`  pos   n/a  0c / 0imp  "${kw}"`);
    }
  }

  // ── 5 priority collections ──────────────────────────────────────
  const PRIORITY = [
    '/collections/limit-straps',
    '/collections/carli-suspension',
    '/collections/grab-handles',
    '/collections/coilovers',
    '/collections/brake-line-kits',
  ];
  console.log('\n=== 5 PRIORITY COLLECTIONS (28-day) ===');
  for (const p of PRIORITY) {
    const url = 'https://bullstrap.com' + p;
    const r = await gscQuery(start28, end, ['page'], 1, [{ dimension: 'page', operator: 'equals', expression: url }]);
    if (r.rows?.length) {
      const row = r.rows[0];
      console.log(`  pos ${row.position.toFixed(1).padStart(5)}  ${row.clicks}c / ${row.impressions}imp  ${p}`);
    } else {
      console.log(`  pos   n/a  0c / 0imp  ${p}`);
    }
  }

  // ── Top 15 pages 28-day ─────────────────────────────────────────
  const pg = await gscQuery(start28, end, ['page'], 15);
  console.log('\n=== TOP 15 PAGES (28-day) ===');
  (pg.rows||[]).forEach(r => {
    const path = r.keys[0].replace('https://bullstrap.com','') || '/';
    console.log(`  pos ${r.position.toFixed(1).padStart(5)}  ${r.clicks}c / ${r.impressions}imp  ${path}`);
  });
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
