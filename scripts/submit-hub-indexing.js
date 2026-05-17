const { google } = require('googleapis');
const https = require('https');
const fs = require('fs');
const path = require('path');

const KEY_PATH = path.join(__dirname, '..', '.gcp-service-account.json');
const SITE_URL = 'https://www.bartact.com/';
const INDEXNOW_KEY = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';

const URLS = [
  'https://www.bartact.com/pages/jeep-seat-covers',
  'https://www.bartact.com/pages/jeep-wrangler-accessories',
  'https://www.bartact.com/pages/jeep-gladiator-accessories',
  'https://www.bartact.com/pages/ford-bronco-accessories',
  'https://www.bartact.com/pages/toyota-tacoma-accessories',
  'https://www.bartact.com/pages/molle-accessories-guide',
  'https://www.bartact.com/pages/paracord-grab-handles',
  'https://www.bartact.com/pages/tactical-seat-covers',
];

async function submitGoogleIndexing() {
  const keyFile = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: keyFile.client_email,
      private_key: keyFile.private_key,
    },
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
  const client = await auth.getClient();

  const results = [];
  for (const url of URLS) {
    try {
      const res = await google.indexing({ version: 'v3', auth: client }).urlNotifications.publish({
        requestBody: { url, type: 'URL_UPDATED' }
      });
      results.push({ url, status: res.status, ok: true });
      console.log(`✅ Google Indexing: ${url} → ${res.status}`);
    } catch (err) {
      const code = err.response?.status || err.code || 'unknown';
      const msg = err.response?.data?.error?.message || err.message;
      results.push({ url, status: code, error: msg, ok: false });
      console.log(`❌ Google Indexing: ${url} → ${code}: ${msg}`);
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }
  return results;
}

function submitIndexNow() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      host: 'www.bartact.com',
      key: INDEXNOW_KEY,
      keyLocation: `https://www.bartact.com/${INDEXNOW_KEY}.txt`,
      urlList: URLS
    });

    const req = https.request({
      hostname: 'api.indexnow.org',
      path: '/IndexNow',
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        console.log(`IndexNow: ${res.statusCode} ${data || '(empty body)'}`);
        resolve({ status: res.statusCode, body: data });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  console.log('=== Google Indexing API ===');
  const googleResults = await submitGoogleIndexing();

  console.log('\n=== IndexNow ===');
  const indexNowResult = await submitIndexNow();

  // Output summary as JSON for parsing
  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify({ google: googleResults, indexNow: indexNowResult }, null, 2));
})();
