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

  // Get all enabled campaigns with spend
  const r = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
    method: 'POST', headers,
    body: JSON.stringify({query: `SELECT campaign.id, campaign.name, campaign.status, metrics.cost_micros, metrics.clicks FROM campaign WHERE campaign.status = ENABLED AND segments.date DURING LAST_7_DAYS ORDER BY metrics.cost_micros DESC`})
  });
  const d = await r.json();
  const campaigns = (d.results || []).filter(x => (x.metrics.costMicros||0) > 0);

  console.log(`=== CAMPAIGN HEALTH AUDIT — ${campaigns.length} active campaigns spending money ===\n`);

  for (const c of campaigns) {
    const cid = c.campaign.id;
    const name = c.campaign.name;
    const spend = (c.metrics.costMicros/1e6).toFixed(2);

    // Check ad groups
    const agr = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
      method: 'POST', headers,
      body: JSON.stringify({query: `SELECT ad_group.id, ad_group.name, ad_group.status FROM ad_group WHERE campaign.id = ${cid} AND ad_group.status = ENABLED`})
    });
    const agd = await agr.json();
    const adGroups = agd.results || [];

    // Check ads
    const adsr = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
      method: 'POST', headers,
      body: JSON.stringify({query: `SELECT ad_group_ad.ad.id, ad_group_ad.status, ad_group_ad.ad.final_urls FROM ad_group_ad WHERE campaign.id = ${cid} AND ad_group_ad.status = ENABLED LIMIT 5`})
    });
    const adsd = await adsr.json();
    const ads = adsd.results || [];

    const hasAdGroups = adGroups.length > 0;
    const hasAds = ads.length > 0;
    const status = (!hasAdGroups && !hasAds) ? '🚨 EMPTY — NO ADS' : (!hasAds) ? '⚠️  AD GROUPS BUT NO ADS' : '✅ OK';

    console.log(`${status} | ${name}`);
    console.log(`   Spend 7d: $${spend} | Ad Groups: ${adGroups.length} | Ads: ${ads.length}`);
    if (ads.length > 0) {
      const urls = ads.flatMap(a => a.adGroupAd.ad.finalUrls || []).slice(0,2);
      if (urls.length) console.log(`   Landing: ${urls.join(', ')}`);
    }
  }
}

run().catch(console.error);
