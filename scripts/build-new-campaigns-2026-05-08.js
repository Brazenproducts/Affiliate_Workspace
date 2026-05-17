#!/usr/bin/env node
// Build 5 new Google Ads Search campaigns for Bartact
// Date: 2026-05-08

const https = require('https');
const fs = require('fs');

const CREDS = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json', 'utf8'));
const CUSTOMER_ID = '1770651698';

// Orphaned budget resource names from failed first run — remove before creating new ones
const ORPHANED_BUDGETS = [
  'customers/1770651698/campaignBudgets/15564851979',
  'customers/1770651698/campaignBudgets/15570076300',
  'customers/1770651698/campaignBudgets/15560209640',
  'customers/1770651698/campaignBudgets/15570063739',
  'customers/1770651698/campaignBudgets/15570076729',
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

function checkResponse(res, label) {
  if (res.status !== 200) {
    throw new Error(`${label} failed (${res.status}): ${res.body}`);
  }
  return JSON.parse(res.body);
}

async function removeOrphanedBudgets(token) {
  console.log('Removing orphaned budgets from failed first run...');
  const operations = ORPHANED_BUDGETS.map(r => ({ remove: r }));
  const res = await apiPost(token, `/v23/customers/${CUSTOMER_ID}/campaignBudgets:mutate`, { operations });
  if (res.status !== 200) {
    console.warn('  Warning: could not remove orphaned budgets:', res.body);
  } else {
    console.log(`  ✓ Removed ${ORPHANED_BUDGETS.length} orphaned budgets`);
  }
}

async function createBudget(token, name, dailyMicros) {
  const res = await apiPost(token, `/v23/customers/${CUSTOMER_ID}/campaignBudgets:mutate`, {
    operations: [{
      create: {
        name: `${name} Budget`,
        amountMicros: dailyMicros,
        deliveryMethod: 'STANDARD',
      }
    }]
  });
  const data = checkResponse(res, `Budget for ${name}`);
  const resourceName = data.results[0].resourceName;
  console.log(`  ✓ Budget created: ${resourceName}`);
  return resourceName;
}

async function createCampaign(token, name, budgetResource) {
  const res = await apiPost(token, `/v23/customers/${CUSTOMER_ID}/campaigns:mutate`, {
    operations: [{
      create: {
        name: name,
        status: 'ENABLED',
        advertisingChannelType: 'SEARCH',
        campaignBudget: budgetResource,
        biddingStrategyType: 'MAXIMIZE_CONVERSION_VALUE',
        maximizeConversionValue: {
          targetRoas: 3.0,
        },
        networkSettings: {
          targetGoogleSearch: true,
          targetSearchNetwork: true,
          targetContentNetwork: false,
        },
        containsEuPoliticalAdvertising: 'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING',
      }
    }]
  });
  const data = checkResponse(res, `Campaign ${name}`);
  const resourceName = data.results[0].resourceName;
  console.log(`  ✓ Campaign created: ${resourceName}`);
  return resourceName;
}

async function createAdGroup(token, campaignResource, name) {
  const res = await apiPost(token, `/v23/customers/${CUSTOMER_ID}/adGroups:mutate`, {
    operations: [{
      create: {
        name: name,
        campaign: campaignResource,
        status: 'ENABLED',
        type: 'SEARCH_STANDARD',
      }
    }]
  });
  const data = checkResponse(res, `Ad group ${name}`);
  const resourceName = data.results[0].resourceName;
  console.log(`  ✓ Ad group created: ${resourceName}`);
  return resourceName;
}

async function createKeywords(token, adGroupResource, keywords) {
  const operations = [];
  for (const kw of keywords) {
    operations.push({
      create: {
        adGroup: adGroupResource,
        status: 'ENABLED',
        keyword: { text: kw, matchType: 'EXACT' }
      }
    });
    operations.push({
      create: {
        adGroup: adGroupResource,
        status: 'ENABLED',
        keyword: { text: kw, matchType: 'PHRASE' }
      }
    });
  }
  const res = await apiPost(token, `/v23/customers/${CUSTOMER_ID}/adGroupCriteria:mutate`, { operations });
  const data = checkResponse(res, `Keywords for ${adGroupResource}`);
  console.log(`  ✓ ${data.results.length} keywords created`);
  return data.results.map(r => r.resourceName);
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
            headlines: headlines.map(h => ({ text: h })),
            descriptions: descriptions.map(d => ({ text: d })),
          }
        }
      }
    }]
  });
  const data = checkResponse(res, `RSA for ${adGroupResource}`);
  const resourceName = data.results[0].resourceName;
  console.log(`  ✓ RSA created: ${resourceName}`);
  return resourceName;
}

const CAMPAIGNS = [
  {
    name: 'Gladiator Seat Covers - Search NEW',
    dailyBudget: 50 * 1e6,
    adGroupName: 'Gladiator Seat Covers',
    keywords: [
      'gladiator seat covers',
      'jeep gladiator seat covers',
      'gladiator jt seat covers',
      '2019 gladiator seat covers',
      'bartact gladiator seat covers',
    ],
    headlines: [
      'Jeep Gladiator Seat Covers',
      'Custom JT Seat Covers | Bartact',
      'Shop Gladiator Seat Covers Now',
    ],
    descriptions: [
      'Premium Jeep Gladiator seat covers built to last. Shop Bartact for the best fit and protection.',
      'Durable, custom-fit seat covers for your Jeep Gladiator JT. Free shipping on orders over $99.',
    ],
    finalUrl: 'https://www.bartact.com/collections/gladiator-seat-covers',
  },
  {
    name: 'Bronco Seat Covers + Storage - Search NEW',
    dailyBudget: 50 * 1e6,
    adGroupName: 'Bronco Seat Covers & Storage',
    keywords: [
      'bronco seat covers',
      'ford bronco seat covers',
      'bronco 2021 seat covers',
      'bronco storage bags',
      'bronco interior accessories',
    ],
    headlines: [
      'Ford Bronco Seat Covers',
      'Bronco Storage Bags | Bartact',
      'Shop Bronco Interior Accessories',
    ],
    descriptions: [
      'Custom-fit Ford Bronco seat covers and storage solutions. Built tough for off-road adventures.',
      'Shop Bartact for premium Bronco seat covers, storage bags, and interior accessories.',
    ],
    finalUrl: 'https://www.bartact.com/collections/bronco-seat-covers',
  },
  {
    name: 'Paracord Grab Handles Wrangler JL - Search',
    dailyBudget: 40 * 1e6,
    adGroupName: 'Paracord Grab Handles Wrangler JL',
    keywords: [
      'jeep wrangler grab handles',
      'jl grab handles',
      'jlu grab handles',
      'paracord grab handles jeep',
      'wrangler jl grab handles paracord',
      'bartact grab handles',
    ],
    headlines: [
      'Paracord Grab Handles for JL',
      'Wrangler JL Grab Handles | Bartact',
      'Shop Jeep Grab Handles Now',
    ],
    descriptions: [
      'Heavy-duty paracord grab handles for Jeep Wrangler JL/JLU. Easy install, built for the trail.',
      'Bartact paracord grab handles — the strongest grip for your Wrangler JL. Shop now.',
    ],
    finalUrl: 'https://www.bartact.com/collections/grab-handles',
  },
  {
    name: 'Paracord Grab Handles Gladiator - Search',
    dailyBudget: 40 * 1e6,
    adGroupName: 'Paracord Grab Handles Gladiator',
    keywords: [
      'gladiator grab handles',
      'jeep gladiator grab handles',
      'gladiator paracord grab handles',
      'jt grab handles',
    ],
    headlines: [
      'Gladiator Paracord Grab Handles',
      'Jeep Gladiator Grab Handles | Bartact',
      'Shop JT Grab Handles Now',
    ],
    descriptions: [
      'Tough paracord grab handles built for the Jeep Gladiator JT. Easy install, trail-ready.',
      'Bartact grab handles for Jeep Gladiator — durable paracord construction. Shop now.',
    ],
    finalUrl: 'https://www.bartact.com/collections/grab-handles',
  },
  {
    name: 'Paracord Grab Handles Bronco - Search',
    dailyBudget: 35 * 1e6,
    adGroupName: 'Paracord Grab Handles Bronco',
    keywords: [
      'bronco grab handles',
      'ford bronco grab handles',
      'bronco roll bar grab handles',
      'bronco paracord grab handles',
    ],
    headlines: [
      'Ford Bronco Paracord Grab Handles',
      'Bronco Roll Bar Grab Handles | Bartact',
      'Shop Bronco Grab Handles Now',
    ],
    descriptions: [
      'Paracord grab handles designed for the Ford Bronco roll bar. Durable and trail-tested.',
      'Bartact Bronco grab handles — strong paracord build, easy install. Shop now.',
    ],
    finalUrl: 'https://www.bartact.com/collections/grab-handles',
  },
];

async function run() {
  console.log('=== Building 5 New Bartact Google Ads Campaigns ===\n');
  const token = await getAccessToken();
  console.log('✓ Access token obtained\n');

  await removeOrphanedBudgets(token);

  const log = {
    created: new Date().toISOString(),
    campaigns: [],
  };

  for (const camp of CAMPAIGNS) {
    console.log(`\n--- ${camp.name} ---`);
    try {
      const budgetResource = await createBudget(token, camp.name, camp.dailyBudget);
      const campaignResource = await createCampaign(token, camp.name, budgetResource);
      const adGroupResource = await createAdGroup(token, campaignResource, camp.adGroupName);
      const keywordResources = await createKeywords(token, adGroupResource, camp.keywords);
      const rsaResource = await createRSA(token, adGroupResource, camp.headlines, camp.descriptions, camp.finalUrl);

      log.campaigns.push({
        name: camp.name,
        budget: budgetResource,
        campaign: campaignResource,
        adGroup: adGroupResource,
        keywords: keywordResources,
        rsa: rsaResource,
        dailyBudgetUSD: camp.dailyBudget / 1e6,
        finalUrl: camp.finalUrl,
      });
      console.log(`  ✓ Campaign "${camp.name}" fully built`);
    } catch (err) {
      console.error(`  ✗ ERROR on "${camp.name}": ${err.message}`);
      log.campaigns.push({ name: camp.name, error: err.message });
    }
  }

  // Write log
  const logPath = '/home/ubuntu/.openclaw/workspace/memory/new-campaigns-2026-05-08.md';
  let md = `# New Google Ads Campaigns — 2026-05-08\n\nCreated: ${log.created}\nCustomer ID: ${CUSTOMER_ID}\n\n`;
  for (const c of log.campaigns) {
    if (c.error) {
      md += `## ❌ ${c.name}\nError: ${c.error}\n\n`;
    } else {
      md += `## ✅ ${c.name}\n`;
      md += `- **Daily Budget:** $${c.dailyBudgetUSD}/day\n`;
      md += `- **Budget resource:** \`${c.budget}\`\n`;
      md += `- **Campaign resource:** \`${c.campaign}\`\n`;
      md += `- **Ad Group resource:** \`${c.adGroup}\`\n`;
      md += `- **RSA resource:** \`${c.rsa}\`\n`;
      md += `- **Final URL:** ${c.finalUrl}\n`;
      md += `- **Keywords (${c.keywords.length}):**\n`;
      for (const k of c.keywords) {
        md += `  - \`${k}\`\n`;
      }
      md += '\n';
    }
  }
  fs.writeFileSync(logPath, md);
  console.log(`\n✓ Log written to ${logPath}`);
  console.log('\n=== Done ===');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
