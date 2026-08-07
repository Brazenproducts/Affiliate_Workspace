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

  // Get ALL enabled campaigns
  const r = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
    method: 'POST', headers,
    body: JSON.stringify({query: `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type FROM campaign WHERE campaign.status = ENABLED ORDER BY campaign.name`})
  });
  const d = await r.json();
  const campaigns = d.results || [];
  console.log(`Found ${campaigns.length} enabled campaigns\n`);

  for (const c of campaigns) {
    const cid = c.campaign.id;
    const name = c.campaign.name;
    const type = c.campaign.advertisingChannelType;

    if (type === 'PERFORMANCE_MAX') {
      // Check asset groups for PMax
      const agr = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
        method: 'POST', headers,
        body: JSON.stringify({query: `SELECT asset_group.id, asset_group.name, asset_group.status, asset_group.final_urls FROM asset_group WHERE campaign.id = ${cid}`})
      });
      const agd = await agr.json();
      const assetGroups = agd.results || [];

      const hasAssets = assetGroups.length > 0;
      const status = hasAssets ? '✅' : '🚨 EMPTY';
      console.log(`${status} [PMax] ${name}`);
      assetGroups.forEach(ag => {
        const urls = ag.assetGroup.finalUrls || [];
        console.log(`   Asset Group: ${ag.assetGroup.name} | status: ${ag.assetGroup.status} | URLs: ${urls.join(', ')}`);
      });
      if (!hasAssets) console.log(`   ⚠️  NO ASSET GROUPS — campaign is running blind`);

    } else {
      // Check ad groups + ads for Search/Display
      const agr = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
        method: 'POST', headers,
        body: JSON.stringify({query: `SELECT ad_group.id, ad_group.name, ad_group.status FROM ad_group WHERE campaign.id = ${cid} AND ad_group.status = ENABLED`})
      });
      const agd = await agr.json();
      const adGroups = agd.results || [];

      const adsr = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
        method: 'POST', headers,
        body: JSON.stringify({query: `SELECT ad_group_ad.ad.id, ad_group_ad.ad.type, ad_group_ad.ad.final_urls, ad_group_ad.ad.responsive_search_ad.headlines, ad_group_ad.status FROM ad_group_ad WHERE campaign.id = ${cid} AND ad_group_ad.status = ENABLED LIMIT 3`})
      });
      const adsd = await adsr.json();
      const ads = adsd.results || [];

      // Keywords
      const kwr = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
        method: 'POST', headers,
        body: JSON.stringify({query: `SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ad_group_criterion.status FROM ad_group_criterion WHERE campaign.id = ${cid} AND ad_group_criterion.type = KEYWORD AND ad_group_criterion.status = ENABLED LIMIT 10`})
      });
      const kwd = await kwr.json();
      const keywords = kwd.results || [];

      const status = (ads.length === 0) ? '🚨 NO ADS' : (keywords.length === 0) ? '⚠️  NO KEYWORDS' : '✅';
      console.log(`${status} [${type}] ${name}`);
      console.log(`   Ad Groups: ${adGroups.length} | Ads: ${ads.length} | Keywords: ${keywords.length}`);
      if (ads.length > 0) {
        const urls = ads.flatMap(a => a.adGroupAd?.ad?.finalUrls || []).slice(0,1);
        if (urls.length) console.log(`   Landing: ${urls[0]}`);
        const headlines = ads[0]?.adGroupAd?.ad?.responsiveSearchAd?.headlines || [];
        if (headlines.length) console.log(`   Headlines: ${headlines.slice(0,3).map(h=>h.text).join(' | ')}`);
      }
      if (keywords.length > 0) {
        console.log(`   Keywords: ${keywords.slice(0,5).map(k=>'"'+k.adGroupCriterion.keyword.text+'" ('+k.adGroupCriterion.keyword.matchType+')').join(', ')}`);
      }
    }
    console.log('');
  }
}

run().catch(console.error);
