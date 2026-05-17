const crypto = require('crypto');
const https = require('https');
const sa = require('/home/ubuntu/.openclaw/workspace/.gcp-service-account.json');

function createJWT() {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600
  })).toString('base64url');
  const sig = crypto.createSign('RSA-SHA256').update(`${header}.${payload}`).sign(sa.private_key, 'base64url');
  return `${header}.${payload}.${sig}`;
}

function httpReq(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function main() {
  const jwt = createJWT();
  const tokenResp = await httpReq({
    hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }, new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }).toString());
  const token = JSON.parse(tokenResp).access_token;
  if (!token) { console.log('Auth failed:', tokenResp.substring(0, 200)); return; }

  // Bull Strap weekly clicks/impressions
  const body = JSON.stringify({
    startDate: '2026-01-01', endDate: '2026-04-16',
    dimensions: ['date'], rowLimit: 25000, dataState: 'all'
  });
  const resp = await httpReq({
    hostname: 'www.googleapis.com',
    path: '/webmasters/v3/sites/https%3A%2F%2Fbullstrap.com%2F/searchAnalytics/query',
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
  }, body);
  const data = JSON.parse(resp);
  if (!data.rows) { console.log('GSC error:', resp.substring(0, 300)); return; }

  let byWeek = {};
  for (const r of data.rows) {
    const d = new Date(r.keys[0]);
    const weekStart = new Date(d); weekStart.setDate(d.getDate() - d.getDay());
    const wk = weekStart.toISOString().split('T')[0];
    if (!byWeek[wk]) byWeek[wk] = { clicks: 0, impr: 0, pos: 0, count: 0 };
    byWeek[wk].clicks += r.clicks;
    byWeek[wk].impr += r.impressions;
    byWeek[wk].pos += r.position;
    byWeek[wk].count++;
  }
  console.log('=== BULL STRAP SEARCH CONSOLE - WEEKLY ===');
  console.log('Week | Clicks | Impressions | Avg Position');
  Object.entries(byWeek).sort().forEach(([w, d]) => {
    console.log(w + ' | ' + d.clicks + ' | ' + d.impr + ' | ' + (d.pos / d.count).toFixed(1));
  });

  // Top queries losing traffic
  console.log('\n=== TOP QUERIES (last 30 days vs prior 30) ===');
  const recent = JSON.stringify({
    startDate: '2026-03-17', endDate: '2026-04-16',
    dimensions: ['query'], rowLimit: 20, dataState: 'all'
  });
  const prior = JSON.stringify({
    startDate: '2026-02-15', endDate: '2026-03-16',
    dimensions: ['query'], rowLimit: 50, dataState: 'all'
  });
  const [recentData, priorData] = await Promise.all([
    httpReq({ hostname: 'www.googleapis.com', path: '/webmasters/v3/sites/https%3A%2F%2Fbullstrap.com%2F/searchAnalytics/query', method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } }, recent),
    httpReq({ hostname: 'www.googleapis.com', path: '/webmasters/v3/sites/https%3A%2F%2Fbullstrap.com%2F/searchAnalytics/query', method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } }, prior)
  ]);
  const rd = JSON.parse(recentData), pd = JSON.parse(priorData);
  const priorMap = {};
  if (pd.rows) pd.rows.forEach(r => priorMap[r.keys[0]] = r);

  console.log('Query | Recent Clicks | Prior Clicks | Change | Position');
  if (rd.rows) {
    for (const r of rd.rows) {
      const q = r.keys[0];
      const p = priorMap[q];
      const change = p ? r.clicks - p.clicks : 'NEW';
      console.log(q + ' | ' + r.clicks + ' | ' + (p ? p.clicks : 0) + ' | ' + (typeof change === 'number' ? (change > 0 ? '+' : '') + change : change) + ' | ' + r.position.toFixed(1));
    }
  }
}

main().catch(e => console.error('Error:', e.message));
