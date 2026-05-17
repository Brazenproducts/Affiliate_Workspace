#!/usr/bin/env node
// Build JK + 4Runner campaigns (TJ already created), then add groups/keywords/RSAs for all 3

const fs = require('fs');
const creds = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json', 'utf8'));
const CID = '1770651698';

async function getToken() {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: creds.client_id, client_secret: creds.client_secret, refresh_token: creds.refresh_token, grant_type: 'refresh_token' })
  });
  return (await r.json()).access_token;
}

async function gads(token, path, body) {
  const r = await fetch('https://googleads.googleapis.com/v23/customers/' + CID + '/' + path, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const d = await r.json();
  if (d.error) throw new Error(path + ': ' + (d.error.details?.[0]?.errors?.[0]?.message || d.error.message));
  return d;
}

async function query(token, gaql) {
  return gads(token, 'googleAds:search', { query: gaql });
}

const CONFIGS = [
  {
    name: 'Jeep TJ Seat Covers - Search',
    budgetName: 'Jeep TJ Seat Covers Budget',
    agName: 'Jeep TJ Seat Covers',
    url: 'https://www.bartact.com/collections/jeep-wrangler-tj-seat-covers',
    keywords: ['jeep tj seat covers','jeep wrangler tj seat covers','tj seat covers','jeep tj accessories','jeep wrangler tj accessories','1997 2006 jeep wrangler seat covers','jeep tj custom seat covers'],
    headlines: ['Jeep TJ Seat Covers','Custom Wrangler TJ Covers','Bartact TJ Seat Covers','Best Jeep TJ Seat Covers','Jeep TJ Interior Upgrades','Durable TJ Seat Covers'],
    descs: ['Custom-fit seat covers for Jeep Wrangler TJ 1997-2006. Heavy-duty, exact fit. Free shipping over $99.','Protect your Jeep TJ seats with Bartact. Built tough for off-road. Shop now.']
  },
  {
    name: 'Jeep JK Seat Covers - Search',
    budgetName: 'Jeep JK Seat Covers Budget',
    agName: 'Jeep JK Seat Covers',
    url: 'https://www.bartact.com/collections/jeep-wrangler-jk-seat-covers',
    keywords: ['jeep jk seat covers','jeep wrangler jk seat covers','jk seat covers','jeep wrangler jku seat covers','jeep jk accessories','2007 2018 jeep wrangler seat covers','jeep jk custom seat covers','jeep wrangler 2 door seat covers'],
    headlines: ['Jeep JK Seat Covers','Custom Wrangler JK Covers','Bartact JK Seat Covers','Best Jeep JK Seat Covers','Jeep JK Interior Upgrades','Durable JK Seat Covers'],
    descs: ['Custom-fit seat covers for Jeep Wrangler JK 2007-2018. Heavy-duty, exact fit. Free shipping over $99.','Protect your Jeep JK seats with Bartact. Built tough for off-road. Shop now.']
  },
  {
    name: '4Runner Seat Covers - Search',
    budgetName: '4Runner Seat Covers Budget',
    agName: '4Runner Seat Covers',
    url: 'https://www.bartact.com/collections/toyota-4runner-seat-covers',
    keywords: ['4runner seat covers','toyota 4runner seat covers','3rd gen 4runner seat covers','4th gen 4runner seat covers','5th gen 4runner seat covers','4runner accessories','toyota 4runner custom seat covers','3rd generation 4runner accessories'],
    headlines: ['4Runner Seat Covers','Toyota 4Runner Seat Covers','Bartact 4Runner Covers','Custom 4Runner Seat Covers','3rd 4th 5th Gen 4Runner','Best 4Runner Seat Covers'],
    descs: ['Custom-fit seat covers for Toyota 4Runner 3rd, 4th & 5th gen. Heavy-duty, exact fit. Free shipping over $99.','Protect your 4Runner seats with Bartact. Built for off-road. Shop now.']
  }
];

(async () => {
  const token = await getToken();
  console.log('Token OK');

  // Get budgets
  const bRes = await query(token, "SELECT campaign_budget.name, campaign_budget.resource_name FROM campaign_budget WHERE campaign_budget.name IN ('Jeep TJ Seat Covers Budget','Jeep JK Seat Covers Budget','4Runner Seat Covers Budget')");
  const budgets = {};
  (bRes.results || []).forEach(r => { budgets[r.campaignBudget.name] = r.campaignBudget.resourceName; });

  // Get or create each campaign
  const campMap = {};
  for (const cfg of CONFIGS) {
    const check = await query(token, "SELECT campaign.name, campaign.resource_name FROM campaign WHERE campaign.name = '" + cfg.name + "'");
    if (check.results && check.results.length > 0) {
      campMap[cfg.name] = check.results[0].campaign.resourceName;
      console.log('Campaign exists:', cfg.name);
    } else {
      const r = await gads(token, 'campaigns:mutate', { operations: [{ create: {
        name: cfg.name, status: 'ENABLED', advertisingChannelType: 'SEARCH',
        campaignBudget: budgets[cfg.budgetName],
        manualCpc: {},
        networkSettings: { targetGoogleSearch: true, targetSearchNetwork: true, targetContentNetwork: false },
        containsEuPoliticalAdvertising: 'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING'
      }}]});
      campMap[cfg.name] = r.results[0].resourceName;
      console.log('Created campaign:', cfg.name, campMap[cfg.name]);
    }
  }

  // Ad groups, keywords, RSAs
  for (const cfg of CONFIGS) {
    console.log('\n--- ' + cfg.name + ' ---');
    const campRN = campMap[cfg.name];

    // Ad group
    const agCheck = await query(token, "SELECT ad_group.name, ad_group.resource_name FROM ad_group WHERE campaign.resource_name = '" + campRN + "' AND ad_group.status != 'REMOVED'");
    let agRN;
    if (agCheck.results && agCheck.results.length > 0) {
      agRN = agCheck.results[0].adGroup.resourceName;
      console.log('Ad group exists');
    } else {
      const r = await gads(token, 'adGroups:mutate', { operations: [{ create: {
        name: cfg.agName, campaign: campRN, status: 'ENABLED', type: 'SEARCH_STANDARD', cpcBidMicros: 1500000
      }}]});
      agRN = r.results[0].resourceName;
      console.log('Created ad group:', agRN);
    }

    // Keywords
    try {
      const kwR = await gads(token, 'adGroupCriteria:mutate', {
        operations: cfg.keywords.map(kw => ({ create: { adGroup: agRN, status: 'ENABLED', keyword: { text: kw, matchType: 'PHRASE' } } }))
      });
      console.log(kwR.results.length + ' keywords added');
    } catch(e) {
      console.log('Keywords:', e.message.slice(0, 100));
    }

    // RSA
    const adCheck = await query(token, "SELECT ad_group_ad.ad.id FROM ad_group_ad WHERE ad_group.resource_name = '" + agRN + "' AND ad_group_ad.status != 'REMOVED'");
    if (adCheck.results && adCheck.results.length > 0) {
      console.log('RSA already exists');
    } else {
      try {
        await gads(token, 'adGroupAds:mutate', { operations: [{ create: {
          adGroup: agRN, status: 'ENABLED',
          ad: {
            finalUrls: [cfg.url],
            responsiveSearchAd: {
              headlines: cfg.headlines.map(t => ({ text: t })),
              descriptions: cfg.descs.map(t => ({ text: t }))
            }
          }
        }}]});
        console.log('RSA created');
      } catch(e) {
        console.log('RSA error:', e.message.slice(0, 150));
      }
    }
  }

  console.log('\nALL DONE');
})().catch(e => console.error('FATAL:', e.message));
