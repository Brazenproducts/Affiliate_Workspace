#!/usr/bin/env node
const https = require('https');
const fs = require('fs');

const CREDS = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json', 'utf8'));
const CUSTOMER_ID = '1770651698';

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

function checkResponse(res, label) {
  if (res.status !== 200) {
    throw new Error(`${label} failed (${res.status}): ${res.body}`);
  }
  return JSON.parse(res.body);
}

async function createBudget(token, name, dailyMicros) {
  const res = await apiPost(token, `/v23/customers/${CUSTOMER_ID}/campaignBudgets:mutate`, {
    operations: [{ create: { name: `${name} Budget`, amountMicros: dailyMicros, deliveryMethod: 'STANDARD' } }]
  });
  return checkResponse(res, `Budget for ${name}`).results[0].resourceName;
}

async function createCampaign(token, name, budgetResource) {
  const res = await apiPost(token, `/v23/customers/${CUSTOMER_ID}/campaigns:mutate`, {
    operations: [{
      create: {
        name,
        status: 'ENABLED',
        advertisingChannelType: 'SEARCH',
        campaignBudget: budgetResource,
        biddingStrategyType: 'MAXIMIZE_CONVERSION_VALUE',
        maximizeConversionValue: { targetRoas: 3.0 },
        networkSettings: {
          targetGoogleSearch: true,
          targetSearchNetwork: true,
          targetContentNetwork: false,
        },
        containsEuPoliticalAdvertising: 'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING',
      }
    }]
  });
  return checkResponse(res, `Campaign ${name}`).results[0].resourceName;
}

async function createAdGroup(token, campaignResource, name) {
  const res = await apiPost(token, `/v23/customers/${CUSTOMER_ID}/adGroups:mutate`, {
    operations: [{ create: { name, campaign: campaignResource, status: 'ENABLED', type: 'SEARCH_STANDARD' } }]
  });
  return checkResponse(res, `Ad group ${name}`).results[0].resourceName;
}

async function createKeywords(token, adGroupResource, keywords) {
  const operations = [];
  for (const kw of keywords) {
    operations.push({ create: { adGroup: adGroupResource, status: 'ENABLED', keyword: { text: kw, matchType: 'EXACT' } } });
    operations.push({ create: { adGroup: adGroupResource, status: 'ENABLED', keyword: { text: kw, matchType: 'PHRASE' } } });
  }
  const res = await apiPost(token, `/v23/customers/${CUSTOMER_ID}/adGroupCriteria:mutate`, { operations });
  return checkResponse(res, `Keywords for ${adGroupResource}`).results.map(r => r.resourceName);
}

async function createRSA(token, adGroupResource, headlines, descriptions, finalUrl) {
  const res = await apiPost(token, `/v23/customers/${CUSTOMER_ID}/adGroupAds:mutate`, {
    operations: [{
      create: {
        adGroup: adGroupResource,
        status: 'ENABLED',
        ad: {
          finalUrls: [finalUrl],
          responsiveSearchAd: {
            headlines: headlines.map(text => ({ text })),
            descriptions: descriptions.map(text => ({ text })),
          }
        }
      }
    }]
  });
  return checkResponse(res, `RSA for ${adGroupResource}`).results[0].resourceName;
}

const CAMPAIGNS = [
  {
    name: 'Wrangler Storage - Search NEW',
    dailyBudget: 45 * 1e6,
    adGroupName: 'Wrangler Storage',
    keywords: [
      'jeep wrangler storage',
      'wrangler storage bags',
      'jl storage bags',
      'jku storage bags',
      'wrangler interior storage',
    ],
    headlines: [
      'Jeep Wrangler Storage',
      'Wrangler Storage Bags',
      'Shop JL JKU Storage',
    ],
    descriptions: [
      'Storage bags for Jeep Wrangler JL and JKU.',
      'Shop Bartact storage for trail gear and tools.',
    ],
    finalUrl: 'https://www.bartact.com/collections/storage-bags',
  },
  {
    name: 'Gladiator Storage - Search NEW',
    dailyBudget: 40 * 1e6,
    adGroupName: 'Gladiator Storage',
    keywords: [
      'jeep gladiator storage',
      'gladiator storage bags',
      'jt storage bags',
      'gladiator interior storage',
      'gladiator gear bags',
    ],
    headlines: [
      'Jeep Gladiator Storage',
      'Gladiator Storage Bags',
      'Shop JT Storage Gear',
    ],
    descriptions: [
      'Storage bags for Jeep Gladiator JT interiors.',
      'Keep trail gear organized with Bartact storage.',
    ],
    finalUrl: 'https://www.bartact.com/collections/storage-bags',
  },
  {
    name: 'Bronco Storage - Search NEW',
    dailyBudget: 40 * 1e6,
    adGroupName: 'Bronco Storage',
    keywords: [
      'ford bronco storage',
      'bronco storage bags',
      'bronco interior storage',
      'bronco gear bags',
      'bronco cargo bags',
    ],
    headlines: [
      'Ford Bronco Storage',
      'Bronco Storage Bags',
      'Shop Bronco Gear Bags',
    ],
    descriptions: [
      'Storage bags for Ford Bronco interiors and gear.',
      'Organize tools and trail gear with Bartact bags.',
    ],
    finalUrl: 'https://www.bartact.com/collections/storage-bags',
  },
];

async function run() {
  const token = await getAccessToken();
  const log = { created: new Date().toISOString(), customerId: CUSTOMER_ID, campaigns: [] };

  for (const camp of CAMPAIGNS) {
    try {
      const budget = await createBudget(token, camp.name, camp.dailyBudget);
      const campaign = await createCampaign(token, camp.name, budget);
      const adGroup = await createAdGroup(token, campaign, camp.adGroupName);
      const keywords = await createKeywords(token, adGroup, camp.keywords);
      const rsa = await createRSA(token, adGroup, camp.headlines, camp.descriptions, camp.finalUrl);
      log.campaigns.push({ name: camp.name, budget, campaign, adGroup, keywords, rsa, finalUrl: camp.finalUrl, dailyBudgetUSD: camp.dailyBudget / 1e6 });
      console.log(`OK ${camp.name}`);
    } catch (error) {
      log.campaigns.push({ name: camp.name, error: error.message });
      console.error(`FAIL ${camp.name}: ${error.message}`);
    }
  }

  const logPath = '/home/ubuntu/.openclaw/workspace/memory/storage-campaigns-2026-05-08.json';
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
  console.log(`LOG ${logPath}`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
