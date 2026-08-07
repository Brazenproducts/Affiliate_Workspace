const fs = require('fs');
const creds = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json','utf8'));

async function getToken() {
  const params = new URLSearchParams({
    client_id: creds.client_id,
    client_secret: creds.client_secret,
    refresh_token: creds.refresh_token,
    grant_type: 'refresh_token'
  });
  const r = await fetch('https://oauth2.googleapis.com/token', {method:'POST', body:params});
  return (await r.json()).access_token;
}

async function run() {
  const token = await getToken();
  const customerId = creds.customer_id;
  const headers = {
    'Authorization': 'Bearer ' + token,
    'developer-token': creds.dev_token,
    'Content-Type': 'application/json'
  };

  // TJ = 23842638625, JK = 23838067130
  for (const [name, id] of [['Jeep TJ', '23842638625'], ['Jeep JK', '23838067130']]) {
    console.log(`\n=== ${name} Campaign ===`);

    // Ad groups
    const ag = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
      method: 'POST', headers,
      body: JSON.stringify({query: `SELECT ad_group.id, ad_group.name, ad_group.status, metrics.clicks, metrics.conversions, metrics.cost_micros FROM ad_group WHERE campaign.id = ${id} AND segments.date DURING LAST_7_DAYS`})
    });
    const agd = await ag.json();
    console.log('Ad groups:', (agd.results||[]).length);
    (agd.results||[]).forEach(r => console.log(' -', r.adGroup.name, '| status:', r.adGroup.status, '| clicks:', r.metrics.clicks, '| spend: $'+(r.metrics.costMicros/1e6).toFixed(2)));

    // Keywords
    const kw = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
      method: 'POST', headers,
      body: JSON.stringify({query: `SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, metrics.clicks, metrics.impressions, metrics.cost_micros FROM ad_group_criterion WHERE campaign.id = ${id} AND ad_group_criterion.type = KEYWORD AND segments.date DURING LAST_7_DAYS ORDER BY metrics.clicks DESC LIMIT 20`})
    });
    const kwd = await kw.json();
    console.log('Top keywords:');
    (kwd.results||[]).slice(0,10).forEach(r => console.log(' -', r.adGroupCriterion.keyword.text, '('+r.adGroupCriterion.keyword.matchType+')', '| clicks:', r.metrics.clicks, '| impressions:', r.metrics.impressions));

    // Final URLs from ads
    const ads = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
      method: 'POST', headers,
      body: JSON.stringify({query: `SELECT ad_group_ad.ad.final_urls, ad_group_ad.ad.type, ad_group_ad.status FROM ad_group_ad WHERE campaign.id = ${id} LIMIT 5`})
    });
    const adsd = await ads.json();
    console.log('Ad final URLs:');
    (adsd.results||[]).forEach(r => console.log(' -', (r.adGroupAd.ad.finalUrls||[]).join(', '), '| status:', r.adGroupAd.status));
  }
}

run().catch(console.error);
