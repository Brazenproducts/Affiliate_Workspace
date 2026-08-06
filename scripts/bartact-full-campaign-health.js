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

  // All enabled campaigns
  const cr = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/googleAds:search',{
    method:'POST',headers:h,
    body:JSON.stringify({query:'SELECT campaign.id, campaign.name, campaign.advertising_channel_type FROM campaign WHERE campaign.status = ENABLED ORDER BY campaign.name'})
  });
  const campaigns = (await cr.json()).results || [];
  process.stdout.write('Checking '+campaigns.length+' enabled campaigns...\n\n');

  for (const c of campaigns) {
    const id = c.campaign.id;
    const name = c.campaign.name;
    const type = c.campaign.advertisingChannelType;

    if (type === 'PERFORMANCE_MAX') {
      // Check asset groups
      const agR = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/googleAds:search',{
        method:'POST',headers:h,
        body:JSON.stringify({query:'SELECT asset_group.id, asset_group.name, asset_group.status, asset_group.final_urls FROM asset_group WHERE campaign.id = '+id})
      });
      const ags = (await agR.json()).results || [];
      const status = ags.length === 0 ? '🚨 NO ASSET GROUPS' : '✅';
      process.stdout.write(status+' [PMax] '+name+' — asset groups: '+ags.length+'\n');
      if (ags.length) ags.forEach(a => process.stdout.write('   → '+a.assetGroup.name+' | '+a.assetGroup.status+' | '+( a.assetGroup.finalUrls||[]).join(',')+'\n'));

    } else {
      // Check network settings — Display Network should NEVER be on for search campaigns
      const nsR = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/googleAds:search',{
        method:'POST',headers:h,
        body:JSON.stringify({query:'SELECT campaign.network_settings.target_content_network FROM campaign WHERE campaign.id = '+id})
      });
      const nsData = ((await nsR.json()).results||[])[0];
      if (nsData && nsData.campaign.networkSettings.targetContentNetwork) {
        process.stdout.write('🚨 DISPLAY NETWORK ON — '+name+'\n');
      }

      // Check ad groups
      const agR = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/googleAds:search',{
        method:'POST',headers:h,
        body:JSON.stringify({query:'SELECT ad_group.id, ad_group.name FROM ad_group WHERE campaign.id = '+id+' AND ad_group.status = ENABLED'})
      });
      const adGroups = (await agR.json()).results || [];

      // Check keywords
      const kwR = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/googleAds:search',{
        method:'POST',headers:h,
        body:JSON.stringify({query:'SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type FROM ad_group_criterion WHERE campaign.id = '+id+' AND ad_group_criterion.type = KEYWORD AND ad_group_criterion.negative = FALSE AND ad_group_criterion.status = ENABLED'})
      });
      const keywords = (await kwR.json()).results || [];

      // Check ads
      const adR = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/googleAds:search',{
        method:'POST',headers:h,
        body:JSON.stringify({query:'SELECT ad_group_ad.ad.id, ad_group_ad.ad.type, ad_group_ad.ad.final_urls FROM ad_group_ad WHERE campaign.id = '+id+' AND ad_group_ad.status = ENABLED LIMIT 3'})
      });
      const ads = (await adR.json()).results || [];

      // Check campaign-level negatives
      const negR = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/googleAds:search',{
        method:'POST',headers:h,
        body:JSON.stringify({query:'SELECT campaign_criterion.keyword.text FROM campaign_criterion WHERE campaign.id = '+id+' AND campaign_criterion.type = KEYWORD AND campaign_criterion.negative = TRUE'})
      });
      const negs = (await negR.json()).results || [];

      const issues = [];
      if (adGroups.length === 0) issues.push('NO AD GROUPS');
      if (keywords.length === 0) issues.push('NO KEYWORDS');
      if (ads.length === 0) issues.push('NO ADS');
      if (negs.length === 0) issues.push('NO NEGATIVES');

      const status = issues.length > 0 ? '🚨 '+issues.join(', ') : '✅';
      process.stdout.write(status+' [Search] '+name+'\n');
      process.stdout.write('   ad groups:'+adGroups.length+' | keywords:'+keywords.length+' | ads:'+ads.length+' | negatives:'+negs.length+'\n');
      if (keywords.length > 0) {
        const broad = keywords.filter(k => k.adGroupCriterion.keyword.matchType === 'BROAD');
        if (broad.length > 0) process.stdout.write('   ⚠️  BROAD MATCH KEYWORDS: '+broad.map(k=>'"'+k.adGroupCriterion.keyword.text+'"').join(', ')+'\n');
      }
      if (ads.length > 0) {
        const urls = ads.flatMap(a => a.adGroupAd?.ad?.finalUrls||[]).slice(0,1);
        if (urls.length) process.stdout.write('   landing: '+urls[0]+'\n');
      }
    }
  }
  process.stdout.write('\nDone.\n');
}

run().catch(e=>process.stdout.write('ERR:'+e.message+'\n'));
