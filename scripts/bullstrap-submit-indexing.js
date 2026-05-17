const crypto = require('crypto');
const https = require('https');
const sa = require('/home/ubuntu/.openclaw/workspace/.gcp-service-account.json');

function createJWT() {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600
  })).toString('base64url');
  const sig = crypto.createSign('RSA-SHA256').update(`${header}.${payload}`).sign(sa.private_key, 'base64url');
  return `${header}.${payload}.${sig}`;
}

function httpReq(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

(async () => {
  const jwt = createJWT();
  const tokenRes = await httpReq({
    hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }, `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`);
  const token = JSON.parse(tokenRes.body).access_token;
  if (!token) { console.error('Auth failed:', tokenRes.body); return; }

  // Submit key URLs for re-indexing
  const urls = [
    'https://bullstrap.com/products/limit-straps-bullstrap',
    'https://bullstrap.com/collections/limit-straps',
    'https://bullstrap.com/',
  ];

  for (const url of urls) {
    const payload = JSON.stringify({ url, type: 'URL_UPDATED' });
    const res = await httpReq({
      hostname: 'indexing.googleapis.com', path: '/v3/urlNotifications:publish', method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    }, payload);
    const ok = res.status === 200;
    console.log(`${ok ? '✓' : '✗'} ${url} — HTTP ${res.status}`);
    if (!ok) console.log(`  ${res.body.slice(0, 200)}`);
  }
})();
