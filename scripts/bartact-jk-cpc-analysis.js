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

  const JK_ID = '23838067130';

  // Campaign-level bid strategy
  const cr = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/googleAds:search', {
    method:'POST', headers:h,
    body:JSON.stringify({query:`SELECT
      campaign.name,
      campaign.bidding_strategy_type,
      campaign.target_cpa.target_cpa_micros,
      campaign.target_roas.target_roas,
      campaign.maximize_conversions.target_cpa_micros,
      campaign.maximize_conversion_value.target_roas,
      campaign.manual_cpc.enhanced_cpc_enabled,
      campaign_budget.amount_micros,
      campaign_budget.name
      FROM campaign WHERE campaign.id = ${JK_ID}`})
  });
  const cd = await cr.json();
  const camp = cd.results?.[0];
  process.stdout.write('=== JK CAMPAIGN BID STRATEGY ===\n');
  process.stdout.write('Bidding strategy: '+camp?.campaign?.biddingStrategyType+'\n');
  process.stdout.write('Budget: $'+((camp?.campaignBudget?.amountMicros||0)/1e6).toFixed(2)+'/day\n');
  if (camp?.campaign?.targetCpa?.targetCpaMicros) process.stdout.write('Target CPA: $'+((camp.campaign.targetCpa.targetCpaMicros)/1e6).toFixed(2)+'\n');
  if (camp?.campaign?.targetRoas?.targetRoas) process.stdout.write('Target ROAS: '+camp.campaign.targetRoas.targetRoas+'x\n');
  if (camp?.campaign?.maximizeConversions?.targetCpaMicros) process.stdout.write('Max Conv target CPA: $'+(camp.campaign.maximizeConversions.targetCpaMicros/1e6).toFixed(2)+'\n');
  process.stdout.write('\n');

  // Ad group bid
  const agr = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/googleAds:search', {
    method:'POST', headers:h,
    body:JSON.stringify({query:`SELECT ad_group.id, ad_group.name, ad_group.cpc_bid_micros, ad_group.effective_cpc_bid_micros FROM ad_group WHERE campaign.id = ${JK_ID} AND ad_group.status = ENABLED`})
  });
  const agd = await agr.json();
  process.stdout.write('=== AD GROUP BIDS ===\n');
  (agd.results||[]).forEach(r => {
    process.stdout.write('Ad Group: '+r.adGroup.name+'\n');
    process.stdout.write('  CPC bid: $'+((r.adGroup.cpcBidMicros||0)/1e6).toFixed(2)+'\n');
    process.stdout.write('  Effective CPC bid: $'+((r.adGroup.effectiveCpcBidMicros||0)/1e6).toFixed(2)+'\n');
  });

  // Keyword-level bids and quality scores
  const kwr = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/googleAds:search', {
    method:'POST', headers:h,
    body:JSON.stringify({query:`SELECT
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      ad_group_criterion.cpc_bid_micros,
      ad_group_criterion.effective_cpc_bid_micros,
      ad_group_criterion.quality_info.quality_score,
      ad_group_criterion.quality_info.search_predicted_ctr,
      ad_group_criterion.quality_info.creative_quality_score,
      ad_group_criterion.quality_info.post_click_quality_score,
      metrics.average_cpc,
      metrics.clicks,
      metrics.cost_micros,
      metrics.impressions
      FROM ad_group_criterion
      WHERE campaign.id = ${JK_ID}
      AND ad_group_criterion.type = KEYWORD
      AND ad_group_criterion.status = ENABLED
      AND segments.date DURING LAST_7_DAYS`})
  });
  const kwd = await kwr.json();
  process.stdout.write('\n=== KEYWORD BIDS & QUALITY SCORES ===\n');
  (kwd.results||[]).forEach(r => {
    const kw = r.adGroupCriterion;
    const m = r.metrics;
    process.stdout.write('\n"'+kw.keyword.text+'" ('+kw.keyword.matchType+')\n');
    process.stdout.write('  Quality Score: '+(kw.qualityInfo?.qualityScore||'N/A')+'/10\n');
    process.stdout.write('  Predicted CTR: '+(kw.qualityInfo?.searchPredictedCtr||'N/A')+'\n');
    process.stdout.write('  Ad Relevance:  '+(kw.qualityInfo?.creativeQualityScore||'N/A')+'\n');
    process.stdout.write('  Landing Page:  '+(kw.qualityInfo?.postClickQualityScore||'N/A')+'\n');
    process.stdout.write('  CPC bid: $'+((kw.cpcBidMicros||0)/1e6).toFixed(2)+'\n');
    process.stdout.write('  Avg actual CPC: $'+((m.averageCpc||0)/1e6).toFixed(2)+'\n');
    process.stdout.write('  Clicks: '+m.clicks+' | Spend: $'+((m.costMicros||0)/1e6).toFixed(2)+'\n');
  });
}

run().catch(e => process.stdout.write('ERROR: '+e.message+'\n'));
