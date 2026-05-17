#!/usr/bin/env node
// Build TJ, JK, 4Runner campaigns + fix Shopping budget + check Brand Defense + add Bronco Sport negatives

const fs = require('fs');
const creds = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json', 'utf8'));
const CUSTOMER_ID = '1770651698';

async function getToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      refresh_token: creds.refresh_token,
      grant_type: 'refresh_token'
    })
  });
  const data = await res.json();
  if (data.error) throw new Error('Token: ' + JSON.stringify(data));
  return data.access_token;
}

async function query(token, gaql) {
  const res = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/googleAds:search`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'developer-token': creds.dev_token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: gaql })
  });
  const data = await res.json();
  if (data.error) throw new Error('Query: ' + JSON.stringify(data));
  return data;
}

async function mutate(token, resource, operations) {
  const res = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/${resource}:mutate`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'developer-token': creds.dev_token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ operations })
  });
  const data = await res.json();
  if (data.error) throw new Error(`Mutate ${resource}: ` + JSON.stringify(data.error));
  return data;
}

async function googleAdsPost(token, path, body) {
  const res = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/${path}`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'developer-token': creds.dev_token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.error) throw new Error(`POST ${path}: ` + JSON.stringify(data.error));
  return data;
}

(async () => {
  const token = await getToken();
  console.log('Token OK\n');

  // ============================================================
  // STEP 1: Check Brand Defense Campaign budget
  // ============================================================
  const brandRes = await query(token, `
    SELECT campaign.name, campaign_budget.amount_micros, campaign_budget.resource_name, metrics.cost_micros, metrics.conversions_value
    FROM campaign
    WHERE campaign.name = 'Brand Defense Campaign'
    AND segments.date BETWEEN '2026-05-04' AND '2026-05-10'
  `);

  if (brandRes.results.length > 0) {
    const b = brandRes.results[0];
    let totalSpend = 0, totalRev = 0;
    brandRes.results.forEach(r => { totalSpend += r.metrics.costMicros/1e6; totalRev += r.metrics.conversionsValue; });
    const budget = brandRes.results[0].campaignBudget.amountMicros / 1e6;
    console.log(`=== Brand Defense Campaign ===`);
    console.log(`Budget: $${budget}/day | 7-day spend: $${totalSpend.toFixed(2)} | 7-day rev: $${totalRev.toFixed(2)} | ROAS: ${(totalRev/totalSpend).toFixed(1)}x`);
    console.log(`Avg daily spend: $${(totalSpend/7).toFixed(2)} vs budget $${budget}`);
    const budgetResourceName = brandRes.results[0].campaignBudget.resourceName;

    // If avg daily spend is within 80% of budget, it's capped — raise it
    if ((totalSpend/7) >= budget * 0.8) {
      const newBudget = Math.ceil(budget * 1.5);
      const r = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/campaignBudgets:mutate`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ operations: [{ update: { resourceName: budgetResourceName, amountMicros: newBudget * 1e6 }, updateMask: 'amount_micros' }] })
      });
      const rd = await r.json();
      if (rd.error) console.log('Brand budget update FAIL:', rd.error.message);
      else console.log(`Brand Defense budget raised: $${budget} -> $${newBudget}`);
    } else {
      console.log(`Brand Defense budget OK — not capped`);
    }
  }

  // ============================================================
  // STEP 2: Bump Shopping budget $10 -> $40
  // ============================================================
  const shopRes = await query(token, `
    SELECT campaign.name, campaign_budget.amount_micros, campaign_budget.resource_name
    FROM campaign
    WHERE campaign.name = 'Bartact Shopping - All Products'
  `);
  if (shopRes.results.length > 0) {
    const budgetRN = shopRes.results[0].campaignBudget.resourceName;
    const cur = shopRes.results[0].campaignBudget.amountMicros / 1e6;
    const r = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/campaignBudgets:mutate`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ operations: [{ update: { resourceName: budgetRN, amountMicros: 40 * 1e6 }, updateMask: 'amount_micros' }] })
    });
    const rd = await r.json();
    if (rd.error) console.log('Shopping budget FAIL:', rd.error.message);
    else console.log(`Shopping budget: $${cur} -> $40 ✅`);
  }

  // ============================================================
  // STEP 3: Add "bronco sport" as negative keyword to ALL campaigns
  // ============================================================
  console.log('\n=== Adding Bronco Sport negatives ===');
  const allCampaigns = await query(token, `
    SELECT campaign.resource_name, campaign.name
    FROM campaign
    WHERE campaign.status = 'ENABLED'
  `);

  // Dedupe campaigns
  const campaignMap = {};
  allCampaigns.results.forEach(r => { campaignMap[r.campaign.name] = r.campaign.resourceName; });

  let negAdded = 0, negFailed = 0;
  for (const [name, resourceName] of Object.entries(campaignMap)) {
    const negRes = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/campaignCriteria:mutate`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operations: [
          {
            create: {
              campaign: resourceName,
              negative: true,
              keyword: { text: 'bronco sport', matchType: 'BROAD' }
            }
          },
          {
            create: {
              campaign: resourceName,
              negative: true,
              keyword: { text: 'ford bronco sport', matchType: 'BROAD' }
            }
          }
        ]
      })
    });
    const negData = await negRes.json();
    if (negData.error) {
      // Ignore "already exists" errors
      const msg = negData.error.message || '';
      if (!msg.includes('already exists') && !msg.includes('DUPLICATE')) {
        console.log(`  SKIP ${name}: ${msg.slice(0,80)}`);
        negFailed++;
      }
    } else {
      negAdded++;
    }
  }
  console.log(`Bronco Sport negatives added to ${negAdded} campaigns, ${negFailed} skipped`);

  // ============================================================
  // STEP 4: Create Jeep TJ Search campaign
  // ============================================================
  console.log('\n=== Creating Jeep TJ Campaign ===');

  // Create budget
  const tjBudgetRes = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/campaignBudgets:mutate`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operations: [{
        create: {
          name: 'Jeep TJ Seat Covers Budget',
          amountMicros: 50 * 1e6,
          deliveryMethod: 'STANDARD'
        }
      }]
    })
  });
  const tjBudgetData = await tjBudgetRes.json();
  if (tjBudgetData.error) throw new Error('TJ budget: ' + JSON.stringify(tjBudgetData.error));
  const tjBudgetRN = tjBudgetData.results[0].resourceName;
  console.log('TJ budget created:', tjBudgetRN);

  // Create campaign
  const tjCampRes = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/campaigns:mutate`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operations: [{
        create: {
          name: 'Jeep TJ Seat Covers - Search',
          status: 'ENABLED',
          advertisingChannelType: 'SEARCH',
          campaignBudget: tjBudgetRN,
          biddingStrategyType: 'MAXIMIZE_CONVERSIONS',
          networkSettings: {
            targetGoogleSearch: true,
            targetSearchNetwork: true,
            targetContentNetwork: false
          },
        }
      }]
    })
  });
  const tjCampData = await tjCampRes.json();
  if (tjCampData.error) throw new Error('TJ campaign: ' + JSON.stringify(tjCampData.error));
  const tjCampRN = tjCampData.results[0].resourceName;
  console.log('TJ campaign created:', tjCampRN);

  // Create ad group
  const tjAGRes = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/adGroups:mutate`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operations: [{
        create: {
          name: 'Jeep TJ Seat Covers',
          campaign: tjCampRN,
          status: 'ENABLED',
          type: 'SEARCH_STANDARD',
          cpcBidMicros: 1500000
        }
      }]
    })
  });
  const tjAGData = await tjAGRes.json();
  if (tjAGData.error) throw new Error('TJ ad group: ' + JSON.stringify(tjAGData.error));
  const tjAGRN = tjAGData.results[0].resourceName;
  console.log('TJ ad group created:', tjAGRN);

  // Add keywords
  const tjKeywords = [
    'jeep tj seat covers',
    'jeep wrangler tj seat covers',
    'tj seat covers',
    'jeep tj interior',
    'jeep wrangler tj accessories',
    '1997 2006 jeep wrangler seat covers',
    'jeep tj custom seat covers'
  ];
  const tjKWRes = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/adGroupCriteria:mutate`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operations: tjKeywords.map(kw => ({
        create: {
          adGroup: tjAGRN,
          status: 'ENABLED',
          keyword: { text: kw, matchType: 'PHRASE' }
        }
      }))
    })
  });
  const tjKWData = await tjKWRes.json();
  if (tjKWData.error) throw new Error('TJ keywords: ' + JSON.stringify(tjKWData.error));
  console.log(`TJ keywords added: ${tjKWData.results.length}`);

  // Add RSA
  const tjAdRes = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/adGroupAds:mutate`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operations: [{
        create: {
          adGroup: tjAGRN,
          status: 'ENABLED',
          ad: {
            finalUrls: ['https://www.bartact.com/collections/jeep-wrangler-tj-seat-covers'],
            responsiveSearchAd: {
              headlines: [
                { text: 'Jeep TJ Seat Covers' },
                { text: 'Custom Jeep Wrangler TJ Covers' },
                { text: 'Bartact TJ Seat Covers' },
                { text: 'Best Jeep TJ Seat Covers' },
                { text: 'Jeep TJ Interior Upgrades' },
                { text: 'Durable TJ Seat Covers' }
              ],
              descriptions: [
                { text: 'Custom-fit seat covers for Jeep Wrangler TJ 1997-2006. Heavy-duty materials, exact fit. Free shipping over $99.' },
                { text: 'Protect your Jeep TJ seats with Bartact covers. Built tough for off-road. Shop now.' }
              ]
            }
          }
        }
      }]
    })
  });
  const tjAdData = await tjAdRes.json();
  if (tjAdData.error) console.log('TJ RSA FAIL:', JSON.stringify(tjAdData.error.message));
  else console.log('TJ RSA created ✅');

  // ============================================================
  // STEP 5: Create Jeep JK Search campaign
  // ============================================================
  console.log('\n=== Creating Jeep JK Campaign ===');

  const jkBudgetRes = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/campaignBudgets:mutate`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operations: [{ create: { name: 'Jeep JK Seat Covers Budget', amountMicros: 50 * 1e6, deliveryMethod: 'STANDARD' } }]
    })
  });
  const jkBudgetData = await jkBudgetRes.json();
  if (jkBudgetData.error) throw new Error('JK budget: ' + JSON.stringify(jkBudgetData.error));
  const jkBudgetRN = jkBudgetData.results[0].resourceName;

  const jkCampRes = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/campaigns:mutate`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operations: [{
        create: {
          name: 'Jeep JK Seat Covers - Search',
          status: 'ENABLED',
          advertisingChannelType: 'SEARCH',
          campaignBudget: jkBudgetRN,
          biddingStrategyType: 'MAXIMIZE_CONVERSIONS',
          networkSettings: { targetGoogleSearch: true, targetSearchNetwork: true, targetContentNetwork: false },
        }
      }]
    })
  });
  const jkCampData = await jkCampRes.json();
  if (jkCampData.error) throw new Error('JK campaign: ' + JSON.stringify(jkCampData.error));
  const jkCampRN = jkCampData.results[0].resourceName;

  const jkAGRes = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/adGroups:mutate`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operations: [{ create: { name: 'Jeep JK Seat Covers', campaign: jkCampRN, status: 'ENABLED', type: 'SEARCH_STANDARD', cpcBidMicros: 1500000 } }]
    })
  });
  const jkAGData = await jkAGRes.json();
  if (jkAGData.error) throw new Error('JK ad group: ' + JSON.stringify(jkAGData.error));
  const jkAGRN = jkAGData.results[0].resourceName;

  const jkKeywords = [
    'jeep jk seat covers',
    'jeep wrangler jk seat covers',
    'jk seat covers',
    'jeep wrangler jku seat covers',
    'jeep jk accessories',
    '2007 2018 jeep wrangler seat covers',
    'jeep jk custom seat covers',
    'jeep wrangler 2 door seat covers',
    'jeep wrangler 4 door seat covers'
  ];
  const jkKWRes = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/adGroupCriteria:mutate`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operations: jkKeywords.map(kw => ({ create: { adGroup: jkAGRN, status: 'ENABLED', keyword: { text: kw, matchType: 'PHRASE' } } }))
    })
  });
  const jkKWData = await jkKWRes.json();
  if (jkKWData.error) throw new Error('JK keywords: ' + JSON.stringify(jkKWData.error));
  console.log(`JK keywords added: ${jkKWData.results.length}`);

  const jkAdRes = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/adGroupAds:mutate`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operations: [{
        create: {
          adGroup: jkAGRN,
          status: 'ENABLED',
          ad: {
            finalUrls: ['https://www.bartact.com/collections/jeep-wrangler-jk-seat-covers'],
            responsiveSearchAd: {
              headlines: [
                { text: 'Jeep JK Seat Covers' },
                { text: 'Custom Jeep Wrangler JK Covers' },
                { text: 'Bartact JK Seat Covers' },
                { text: 'Best Jeep JK Seat Covers' },
                { text: 'Jeep JK Interior Upgrades' },
                { text: 'Durable JK Seat Covers' }
              ],
              descriptions: [
                { text: 'Custom-fit seat covers for Jeep Wrangler JK 2007-2018. Heavy-duty materials, exact fit. Free shipping over $99.' },
                { text: 'Protect your Jeep JK seats with Bartact covers. Built tough for off-road. Shop now.' }
              ]
            }
          }
        }
      }]
    })
  });
  const jkAdData = await jkAdRes.json();
  if (jkAdData.error) console.log('JK RSA FAIL:', JSON.stringify(jkAdData.error.message));
  else console.log('JK RSA created ✅');

  // ============================================================
  // STEP 6: Create 4Runner Search campaign
  // ============================================================
  console.log('\n=== Creating 4Runner Campaign ===');

  const4BudgetRes = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/campaignBudgets:mutate`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operations: [{ create: { name: '4Runner Seat Covers Budget', amountMicros: 50 * 1e6, deliveryMethod: 'STANDARD' } }]
    })
  });
  const the4BudgetData = await the4BudgetRes.json();
  if (the4BudgetData.error) throw new Error('4Runner budget: ' + JSON.stringify(the4BudgetData.error));
  const the4BudgetRN = the4BudgetData.results[0].resourceName;

  const the4CampRes = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/campaigns:mutate`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operations: [{
        create: {
          name: '4Runner Seat Covers - Search',
          status: 'ENABLED',
          advertisingChannelType: 'SEARCH',
          campaignBudget: the4BudgetRN,
          biddingStrategyType: 'MAXIMIZE_CONVERSIONS',
          networkSettings: { targetGoogleSearch: true, targetSearchNetwork: true, targetContentNetwork: false },
        }
      }]
    })
  });
  const the4CampData = await the4CampRes.json();
  if (the4CampData.error) throw new Error('4Runner campaign: ' + JSON.stringify(the4CampData.error));
  const the4CampRN = the4CampData.results[0].resourceName;

  const the4AGRes = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/adGroups:mutate`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operations: [{ create: { name: '4Runner Seat Covers', campaign: the4CampRN, status: 'ENABLED', type: 'SEARCH_STANDARD', cpcBidMicros: 1500000 } }]
    })
  });
  const the4AGData = await the4AGRes.json();
  if (the4AGData.error) throw new Error('4Runner ad group: ' + JSON.stringify(the4AGData.error));
  const the4AGRN = the4AGData.results[0].resourceName;

  const the4Keywords = [
    '4runner seat covers',
    'toyota 4runner seat covers',
    '3rd gen 4runner seat covers',
    '4th gen 4runner seat covers',
    '5th gen 4runner seat covers',
    '4runner accessories',
    '4runner interior accessories',
    'toyota 4runner custom seat covers',
    '3rd generation 4runner accessories'
  ];
  const the4KWRes = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/adGroupCriteria:mutate`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operations: the4Keywords.map(kw => ({ create: { adGroup: the4AGRN, status: 'ENABLED', keyword: { text: kw, matchType: 'PHRASE' } } }))
    })
  });
  const the4KWData = await the4KWRes.json();
  if (the4KWData.error) throw new Error('4Runner keywords: ' + JSON.stringify(the4KWData.error));
  console.log(`4Runner keywords added: ${the4KWData.results.length}`);

  const the4AdRes = await fetch(`https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/adGroupAds:mutate`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operations: [{
        create: {
          adGroup: the4AGRN,
          status: 'ENABLED',
          ad: {
            finalUrls: ['https://www.bartact.com/collections/toyota-4runner-seat-covers'],
            responsiveSearchAd: {
              headlines: [
                { text: '4Runner Seat Covers' },
                { text: 'Toyota 4Runner Seat Covers' },
                { text: 'Bartact 4Runner Covers' },
                { text: 'Custom 4Runner Seat Covers' },
                { text: '3rd 4th 5th Gen 4Runner Covers' },
                { text: 'Best 4Runner Seat Covers' }
              ],
              descriptions: [
                { text: 'Custom-fit seat covers for Toyota 4Runner 3rd, 4th & 5th gen. Heavy-duty, exact fit. Free shipping over $99.' },
                { text: 'Protect your 4Runner seats with Bartact covers. Built for off-road adventures. Shop now.' }
              ]
            }
          }
        }
      }]
    })
  });
  const the4AdData = await the4AdRes.json();
  if (the4AdData.error) console.log('4Runner RSA FAIL:', JSON.stringify(the4AdData.error.message));
  else console.log('4Runner RSA created ✅');

  console.log('\n=== ALL DONE ===');

})().catch(e => console.error('FATAL:', e.message));
