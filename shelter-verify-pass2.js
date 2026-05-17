const crypto = require('crypto');
const https = require('https');
const fs = require('fs');

const SA = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-credentials.json', 'utf8'));
const GODADDY_KEY = '9QCBbdvZc9n_N3jPNv71WzKBpDcn8XCmyV';
const GODADDY_SECRET = 'VVAAEQkkEyCVAtwqyCadwG';

const DOMAINS = [
  'emergencyhousingreviews.com',
  'bestdisasterhousing.com',
  'bestcommunityshelters.com',
  'bestmodularshelters.com',
];

// --- JWT / OAuth ---
function base64url(buf) {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function createJWT(scopes) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const payload = base64url(Buffer.from(JSON.stringify({
    iss: SA.client_email,
    scope: scopes,
    aud: SA.token_uri,
    iat: now,
    exp: now + 3600,
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
      res.on('end', () => {
        try { resolve(JSON.parse(d).access_token); } catch (e) { reject(new Error(d)); }
      });
    });
    req.on('error', reject);
    req.end(body);
  });
}

// --- HTTP helpers ---
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

function godaddyGet(path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.godaddy.com', path, method: 'GET',
      headers: { Authorization: `sso-key ${GODADDY_KEY}:${GODADDY_SECRET}`, Accept: 'application/json' },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.end();
  });
}

// --- Main ---
async function run() {
  const scopes = 'https://www.googleapis.com/auth/siteverification https://www.googleapis.com/auth/webmasters';
  const token = await getToken(scopes);
  console.log('Got OAuth token');

  const results = {};

  for (const domain of DOMAINS) {
    console.log(`\n=== ${domain} ===`);
    results[domain] = { verified: false, sitemap: false, txtRecords: null, error: null };

    // Step 1: Get verification token
    let tokenResp;
    try {
      tokenResp = await apiCall(
        'https://www.googleapis.com/siteVerification/v1/token',
        'POST', token,
        { site: { type: 'INET_DOMAIN', identifier: domain }, verificationMethod: 'DNS_TXT' }
      );
      console.log('Token response:', tokenResp.status, tokenResp.body);
    } catch (e) {
      console.log('Token fetch error:', e.message);
      results[domain].error = `Token fetch failed: ${e.message}`;
      continue;
    }

    // Step 2: Verify (insert)
    let verifyResp;
    try {
      verifyResp = await apiCall(
        'https://www.googleapis.com/siteVerification/v1/webResource?verificationMethod=DNS_TXT',
        'POST', token,
        { site: { type: 'INET_DOMAIN', identifier: domain } }
      );
      console.log('Verify response:', verifyResp.status, verifyResp.body);

      if (verifyResp.status === 200) {
        results[domain].verified = true;
        console.log(`✅ ${domain} VERIFIED`);
      } else {
        const parsed = JSON.parse(verifyResp.body);
        const errMsg = parsed.error?.message || verifyResp.body;
        console.log(`❌ Verification failed: ${errMsg}`);
        results[domain].error = errMsg;

        // Check GoDaddy TXT records for diagnosis
        console.log('Checking GoDaddy TXT records...');
        const txtResp = await godaddyGet(`/v1/domains/${domain}/records/TXT/@`);
        console.log('GoDaddy TXT:', txtResp.status, txtResp.body);
        try {
          results[domain].txtRecords = JSON.parse(txtResp.body);
        } catch { results[domain].txtRecords = txtResp.body; }
        continue;
      }
    } catch (e) {
      console.log('Verify error:', e.message);
      results[domain].error = `Verify call failed: ${e.message}`;
      continue;
    }

    // Step 3: Submit sitemap via Search Console
    try {
      const siteUrl = `sc-domain:${domain}`;
      const feedpath = `https://${domain}/sitemap.xml`;
      const smResp = await apiCall(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(feedpath)}`,
        'PUT', token, null
      );
      console.log('Sitemap response:', smResp.status, smResp.body);
      if (smResp.status === 200 || smResp.status === 204) {
        results[domain].sitemap = true;
        console.log(`✅ Sitemap submitted for ${domain}`);
      } else {
        results[domain].sitemap = false;
        console.log(`❌ Sitemap submit failed: ${smResp.status} ${smResp.body}`);
      }
    } catch (e) {
      console.log('Sitemap error:', e.message);
    }
  }

  console.log('\n\n=== FINAL RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
