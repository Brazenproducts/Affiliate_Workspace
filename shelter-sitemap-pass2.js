const crypto = require('crypto');
const https = require('https');
const fs = require('fs');

const SA = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-credentials.json', 'utf8'));

const DOMAINS = [
  'emergencyhousingreviews.com',
  'bestdisasterhousing.com',
  'bestcommunityshelters.com',
  'bestmodularshelters.com',
];

function base64url(buf) {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function createJWT(scopes) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const payload = base64url(Buffer.from(JSON.stringify({
    iss: SA.client_email, scope: scopes, aud: SA.token_uri, iat: now, exp: now + 3600,
  })));
  const sig = crypto.createSign('RSA-SHA256').update(`${header}.${payload}`).sign(SA.private_key);
  return `${header}.${payload}.${base64url(sig)}`;
}

function getToken(scopes) {
  return new Promise((resolve, reject) => {
    const jwt = createJWT(scopes);
    const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
    const req = https.request(SA.token_uri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d).access_token); } catch (e) { reject(new Error(d)); } });
    });
    req.on('error', reject);
    req.end(body);
  });
}

function apiCall(url, method, token, bodyObj) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname, path: u.pathname + u.search, method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    if (bodyObj) req.write(JSON.stringify(bodyObj));
    req.end();
  });
}

async function run() {
  const token = await getToken('https://www.googleapis.com/auth/webmasters');
  console.log('Got webmasters token');

  for (const domain of DOMAINS) {
    const siteUrl = `sc-domain:${domain}`;
    console.log(`\n=== ${domain} ===`);

    // Step 1: Add the site property to Search Console
    console.log('Adding site to Search Console...');
    const addResp = await apiCall(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}`,
      'PUT', token, null
    );
    console.log('Add site:', addResp.status, addResp.body || '(empty - success)');

    // Step 2: Verify it's there
    const getResp = await apiCall(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}`,
      'GET', token, null
    );
    console.log('Get site:', getResp.status, getResp.body);

    // Step 3: Submit sitemap
    const feedpath = `https://${domain}/sitemap.xml`;
    const smResp = await apiCall(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(feedpath)}`,
      'PUT', token, null
    );
    console.log('Sitemap submit:', smResp.status, smResp.body || '(empty - success)');

    if (smResp.status === 200 || smResp.status === 204) {
      console.log(`✅ Sitemap submitted for ${domain}`);
    } else {
      console.log(`❌ Sitemap failed: ${smResp.status}`);
    }
  }
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
