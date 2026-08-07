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
    'Authorization': '***' + token,
    'developer-token': creds.dev_token,
    'Content-Type': 'application/json'
  };

  // Get all enabled campaigns
  const cr = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
    method: 'POST', headers,
    body: JSON.stringify({query: `SELECT campaign.id, campaign.name, campaign.advertising_channel_type FROM campaign WHERE campaign.status = ENABLED ORDER BY campaign.name`})
  });
  const cd = await cr.json();
  const campaigns = cd.results || [];

  for (const c of campaigns) {
    const cid = c.campaign.id;
    const name = c.campaign.name;
    const type = c.campaign.advertisingChannelType;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`CAMPAIGN: ${name} [${type}]`);
    console.log(`${'='.repeat(60)}`);

    if (type === 'PERFORMANCE_MAX') {
      // Asset groups
      const agr = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
        method: 'POST', headers,
        body: JSON.stringify({query: `SELECT asset_group.name, asset_group.status, asset_group.final_urls FROM asset_group WHERE campaign.id = ${cid}`})
      });
      const agd = await agr.json();
      (agd.results||[]).forEach(r => {
        console.log(`  Asset Group: ${r.assetGroup.name} | ${r.assetGroup.status}`);
        console.log(`  URLs: ${(r.assetGroup.finalUrls||[]).join(', ')}`);
      });

      // Search terms for PMax
      const str = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
        method: 'POST', headers,
        body: JSON.stringify({query: `SELECT search_term_view.search_term, metrics.clicks, metrics.cost_micros, metrics.conversions FROM search_term_view WHERE campaign.id = ${cid} AND segments.date DURING LAST_7_DAYS ORDER BY metrics.clicks DESC LIMIT 20`})
      });
      const std = await str.json();
      if ((std.results||[]).length > 0) {
        console.log(`  Top search terms:`);
        std.results.forEach(r => {
          console.log(`    "${r.searchTermView.searchTerm}" | clicks: ${r.metrics.clicks} | spend: $${(r.metrics.costMicros/1e6).toFixed(2)} | conv: ${r.metrics.conversions}`);
        });
      }

    } else {
      // Keywords
      const kwr = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
        method: 'POST', headers,
        body: JSON.stringify({query: `SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ad_group_criterion.status, metrics.clicks, metrics.cost_micros, metrics.conversions FROM ad_group_criterion WHERE campaign.id = ${cid} AND ad_group_criterion.type = KEYWORD AND segments.date DURING LAST_7_DAYS ORDER BY metrics.clicks DESC LIMIT 20`})
      });
      const kwd = await kwr.json();
      console.log(`  Keywords (${(kwd.results||[]).length}):`);
      (kwd.results||[]).forEach(r => {
        const status = r.adGroupCriterion.status === 'ENABLED' ? '✅' : '⏸';
        console.log(`    ${status} "${r.adGroupCriterion.keyword.text}" (${r.adGroupCriterion.keyword.matchType}) | clicks: ${r.metrics.clicks} | spend: $${(r.metrics.costMicros/1e6).toFixed(2)}`);
      });

      // Ads / headlines
      const adr = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
        method: 'POST', headers,
        body: JSON.stringify({query: `SELECT ad_group_ad.ad.responsive_search_ad.headlines, ad_group_ad.ad.responsive_search_ad.descriptions, ad_group_ad.ad.final_urls, ad_group_ad.status FROM ad_group_ad WHERE campaign.id = ${cid} AND ad_group_ad.status = ENABLED LIMIT 3`})
      });
      const add = await adr.json();
      (add.results||[]).forEach((r, i) => {
        const ad = r.adGroupAd.ad;
        const headlines = (ad.responsiveSearchAd?.headlines||[]).map(h=>h.text);
        const descs = (ad.responsiveSearchAd?.descriptions||[]).map(d=>d.text);
        const urls = ad.finalUrls||[];
        console.log(`\n  Ad ${i+1}:`);
        console.log(`    URL: ${urls[0]||'MISSING'}`);
        console.log(`    Headlines: ${headlines.join(' | ')}`);
        console.log(`    Descriptions: ${descs.join(' | ')}`);
      });

      // Search terms
      const str = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
        method: 'POST', headers,
        body: JSON.stringify({query: `SELECT search_term_view.search_term, metrics.clicks, metrics.cost_micros, metrics.conversions FROM search_term_view WHERE campaign.id = ${cid} AND segments.date DURING LAST_7_DAYS ORDER BY metrics.clicks DESC LIMIT 20`})
      });
      const std = await str.json();
      if ((std.results||[]).length > 0) {
        console.log(`\n  Actual search terms triggering ads:`);
        std.results.forEach(r => {
          const flag = r.metrics.conversions === 0 && r.metrics.clicks > 0 ? ' ⚠️' : '';
          console.log(`    "${r.searchTermView.searchTerm}" | clicks: ${r.metrics.clicks} | spend: $${(r.metrics.costMicros/1e6).toFixed(2)} | conv: ${r.metrics.conversions}${flag}`);
        });
      }

      // Negative keywords
      const negr = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
        method: 'POST', headers,
        body: JSON.stringify({query: `SELECT ad_group_criterion.keyword.text FROM ad_group_criterion WHERE campaign.id = ${cid} AND ad_group_criterion.type = KEYWORD AND ad_group_criterion.negative = TRUE LIMIT 20`})
      });
      const negd = await negr.json();
      if ((negd.results||[]).length > 0) {
        console.log(`\n  Negative keywords: ${negd.results.map(r=>'"'+r.adGroupCriterion.keyword.text+'"').join(', ')}`);
      } else {
        console.log(`\n  ⚠️  NO NEGATIVE KEYWORDS`);
      }
    }
  }
}

run().catch(console.error);
