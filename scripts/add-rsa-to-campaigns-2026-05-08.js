#!/usr/bin/env node
// Add RSAs to the 5 campaigns already created (budgets/campaigns/adgroups/keywords are done)
// Date: 2026-05-08

const https = require('https');
const fs = require('fs');

const CREDS = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json', 'utf8'));
const CUSTOMER_ID = '1770651698';

// Ad groups already created — just need RSAs
// Headlines: max 30 chars each | Descriptions: max 90 chars each
const RSA_JOBS = [
  {
    name: 'Gladiator Seat Covers - Search NEW',
    adGroup: 'customers/1770651698/adGroups/197082274220',
    headlines: [
      'Gladiator Seat Covers',      // 21
      'JT Seat Covers | Bartact',   // 24
      'Shop Gladiator Covers Now',  // 25
    ],
    descriptions: [
      'Premium Jeep Gladiator seat covers. Best fit, best protection. Shop Bartact.',  // 76
      'Custom-fit JT seat covers built to last. Free shipping on orders over $99.',    // 73
    ],
    finalUrl: 'https://www.bartact.com/collections/gladiator-seat-covers',
  },
  {
    name: 'Bronco Seat Covers + Storage - Search NEW',
    adGroup: 'customers/1770651698/adGroups/195042395406',
    headlines: [
      'Ford Bronco Seat Covers',    // 23
      'Bronco Storage | Bartact',   // 24
      'Bronco Interior Gear',       // 20
    ],
    descriptions: [
      'Custom-fit Bronco seat covers & storage. Built tough for off-road adventures.', // 78
      'Shop Bartact for Bronco seat covers, storage bags, and interior accessories.',   // 76
    ],
    finalUrl: 'https://www.bartact.com/collections/bronco-seat-covers',
  },
  {
    name: 'Paracord Grab Handles Wrangler JL - Search',
    adGroup: 'customers/1770651698/adGroups/199389034267',
    headlines: [
      'JL Paracord Grab Handles',   // 24
      'Wrangler JL Grab Handles',   // 24
      'Shop Jeep Grab Handles',     // 22
    ],
    descriptions: [
      'Heavy-duty paracord grab handles for Wrangler JL/JLU. Easy install, trail-ready.', // 82
      'Bartact paracord grab handles — strongest grip for your JL. Shop now.',             // 71
    ],
    finalUrl: 'https://www.bartact.com/collections/grab-handles',
  },
  {
    name: 'Paracord Grab Handles Gladiator - Search',
    adGroup: 'customers/1770651698/adGroups/194097842777',
    headlines: [
      'Gladiator Grab Handles',     // 22
      'JT Grab Handles | Bartact',  // 24
      'Shop Gladiator Handles',     // 22
    ],
    descriptions: [
      'Tough paracord grab handles for Jeep Gladiator JT. Easy install, trail-ready.',  // 80
      'Bartact grab handles for Gladiator — durable paracord build. Shop now.',          // 71
    ],
    finalUrl: 'https://www.bartact.com/collections/grab-handles',
  },
  {
    name: 'Paracord Grab Handles Bronco - Search',
    adGroup: 'customers/1770651698/adGroups/196380615837',
    headlines: [
      'Bronco Paracord Grab Handles', // 29 ✓
      'Bronco Roll Bar Handles',      // 24
      'Shop Bronco Grab Handles',     // 24
    ],
    descriptions: [
      'Paracord grab handles for Ford Bronco roll bar. Durable and trail-tested.',  // 74
      'Bartact Bronco grab handles — strong paracord build, easy install. Shop now.', // 78
    ],
    finalUrl: 'https://www.bartact.com/collections/grab-handles',
  },
];

function httpsRequest(hostname, path, method, headers, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : '';
    const reqHeaders = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyStr),
      ...headers,
    };
    const req = https.request({ hostname, path, method, headers: reqHeaders }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function getAccessToken() {
  const body = new URLSearchParams({
    client_id: CREDS.client_id,
    client_secret: CREDS.client_secret,
    refresh_token: CREDS.refresh_token,
    grant_type: 'refresh_token',
  }).toString();
  const res = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
  const json = JSON.parse(res.body);
  if (!json.access_token) throw new Error('Token refresh failed: ' + res.body);
  return json.access_token;
}

function apiPost(token, path, body) {
  return httpsRequest('googleads.googleapis.com', path, 'POST', {
    'Authorization': `Bearer ${token}`,
    'developer-token': CREDS.dev_token,
    'login-customer-id': CUSTOMER_ID,
  }, body);
}

// Validate lengths before sending
function validateCopy(job) {
  const errors = [];
  job.headlines.forEach((h, i) => {
    if (h.length > 30) errors.push(`Headline ${i} too long (${h.length}): "${h}"`);
  });
  job.descriptions.forEach((d, i) => {
    if (d.length > 90) errors.push(`Description ${i} too long (${d.length}): "${d}"`);
  });
  return errors;
}

async function createRSA(token, job) {
  const errors = validateCopy(job);
  if (errors.length) {
    throw new Error('Copy validation failed:\n' + errors.join('\n'));
  }

  const res = await apiPost(token, `/v23/customers/${CUSTOMER_ID}/adGroupAds:mutate`, {
    operations: [{
      create: {
        adGroup: job.adGroup,
        status: 'ENABLED',
        ad: {
          finalUrls: [job.finalUrl],
          responsiveSearchAd: {
            headlines: job.headlines.map(h => ({ text: h })),
            descriptions: job.descriptions.map(d => ({ text: d })),
          }
        }
      }
    }]
  });

  if (res.status !== 200) {
    throw new Error(`API error (${res.status}): ${res.body}`);
  }
  const data = JSON.parse(res.body);
  return data.results[0].resourceName;
}

async function run() {
  console.log('=== Adding RSAs to 5 Bartact Campaigns ===\n');
  const token = await getAccessToken();
  console.log('✓ Access token obtained\n');

  const results = {};

  for (const job of RSA_JOBS) {
    console.log(`--- ${job.name} ---`);
    try {
      const rsaResource = await createRSA(token, job);
      console.log(`  ✓ RSA created: ${rsaResource}`);
      results[job.name] = { rsa: rsaResource, adGroup: job.adGroup };
    } catch (err) {
      console.error(`  ✗ ERROR: ${err.message}`);
      results[job.name] = { error: err.message };
    }
  }

  // Update the log file
  const logPath = '/home/ubuntu/.openclaw/workspace/memory/new-campaigns-2026-05-08.md';
  let existing = fs.readFileSync(logPath, 'utf8');

  // Append RSA results section
  let rsaSection = '\n## RSA Creation (second pass)\n\n';
  for (const [name, r] of Object.entries(results)) {
    if (r.error) {
      rsaSection += `- ❌ **${name}**: ${r.error}\n`;
    } else {
      rsaSection += `- ✅ **${name}**: \`${r.rsa}\`\n`;
    }
  }
  fs.writeFileSync(logPath, existing + rsaSection);
  console.log(`\n✓ Log updated at ${logPath}`);
  console.log('\n=== Done ===');
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
