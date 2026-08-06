const fs = require('fs');
const creds = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json','utf8'));

async function getToken() {
  const p = new URLSearchParams({client_id:creds.client_id,client_secret:creds.client_secret,refresh_token:creds.refresh_token,grant_type:'refresh_token'});
  return (await (await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:p})).json()).access_token;
}

async function run() {
  const token = await getToken();
  const cid = creds.customer_id;
  const h = {'Authorization':'Bearer '+token,'developer-token':creds.dev_token,'Content-Type':'application/json'};

  // 1. Competitors Campaign daily spend breakdown
  process.stdout.write('=== 1. COMPETITORS CAMPAIGN — DAILY SPEND BREAKDOWN ===\n');
  const compR = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/googleAds:search',{
    method:'POST',headers:h,
    body:JSON.stringify({query:`SELECT segments.date, metrics.cost_micros, metrics.clicks, metrics.conversions, metrics.conversions_value
      FROM campaign WHERE campaign.id = 21473410016 AND segments.date DURING LAST_14_DAYS ORDER BY segments.date DESC`})
  });
  const compD = await compR.json();
  (compD.results||[]).forEach(r => {
    process.stdout.write(r.segments.date+' | spend: $'+((r.metrics.costMicros||0)/1e6).toFixed(2)+' | clicks: '+r.metrics.clicks+' | conv: '+r.metrics.conversions+' | value: $'+(r.metrics.conversionsValue||0).toFixed(2)+'\n');
  });

  // Also check budget history
  const budR = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/googleAds:search',{
    method:'POST',headers:h,
    body:JSON.stringify({query:`SELECT campaign.name, campaign_budget.amount_micros, campaign_budget.name FROM campaign WHERE campaign.id = 21473410016`})
  });
  const budD = await budR.json();
  process.stdout.write('Current budget: $'+((budD.results?.[0]?.campaignBudget?.amountMicros||0)/1e6)+'/day\n');

  // 2. Dynamic Remarketing audit
  process.stdout.write('\n=== 2. DYNAMIC REMARKETING AUDIT ===\n');
  const dmR = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/googleAds:search',{
    method:'POST',headers:h,
    body:JSON.stringify({query:`SELECT campaign.id, campaign.name, campaign.advertising_channel_type, campaign.status FROM campaign WHERE campaign.name LIKE '%Remarketing%' OR campaign.name LIKE '%remarketing%'`})
  });
  const dmD = await dmR.json();
  for(const c of (dmD.results||[])) {
    process.stdout.write('Campaign: '+c.campaign.name+' | type: '+c.campaign.advertisingChannelType+' | status: '+c.campaign.status+'\n');
    // Check audience lists
    const audR = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/googleAds:search',{
      method:'POST',headers:h,
      body:JSON.stringify({query:`SELECT ad_group_criterion.user_list.user_list, ad_group_criterion.status FROM ad_group_criterion WHERE campaign.id = ${c.campaign.id} AND ad_group_criterion.type = USER_LIST LIMIT 5`})
    });
    const audD = await audR.json();
    process.stdout.write('Audience targets: '+(audD.results||[]).length+'\n');

    // Check ads
    const adR = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/googleAds:search',{
      method:'POST',headers:h,
      body:JSON.stringify({query:`SELECT ad_group_ad.ad.type, ad_group_ad.status, ad_group_ad.ad.final_urls FROM ad_group_ad WHERE campaign.id = ${c.campaign.id} AND ad_group_ad.status = ENABLED LIMIT 5`})
    });
    const adD = await adR.json();
    process.stdout.write('Active ads: '+(adD.results||[]).length+'\n');
    (adD.results||[]).forEach(a => process.stdout.write('  type: '+a.adGroupAd.ad.type+' | url: '+(a.adGroupAd.ad.finalUrls||[]).join(',')+'\n'));
  }

  // 3. TJ negative keyword gaps — what search terms are still coming through
  process.stdout.write('\n=== 3. TJ REMAINING JUNK SEARCH TERMS ===\n');
  const tjR = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/googleAds:search',{
    method:'POST',headers:h,
    body:JSON.stringify({query:`SELECT search_term_view.search_term, metrics.clicks, metrics.cost_micros, metrics.conversions FROM search_term_view WHERE campaign.id = 23842638625 AND segments.date DURING LAST_7_DAYS ORDER BY metrics.clicks DESC LIMIT 30`})
  });
  const tjD = await tjR.json();
  (tjD.results||[]).forEach(r => {
    const isJunk = r.metrics.conversions === 0 && r.metrics.clicks > 2;
    process.stdout.write((isJunk?'❌':'✅')+' "'+r.searchTermView.searchTerm+'" | clicks:'+r.metrics.clicks+' | spend:$'+((r.metrics.costMicros||0)/1e6).toFixed(2)+'\n');
  });

  // 4. Check Google Indexing cron ran
  process.stdout.write('\n=== 4. INDEXING CRON STATUS ===\n');
  process.stdout.write('Check cron f6094fa3 separately\n');
}

run().catch(e=>process.stdout.write('ERR:'+e.message+'\n'));
