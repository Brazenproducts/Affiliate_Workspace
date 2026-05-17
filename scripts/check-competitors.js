const https=require('https');const fs=require('fs');
const creds=JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json'));

async function run(){
  const params=new URLSearchParams({client_id:creds.client_id,client_secret:creds.client_secret,refresh_token:creds.refresh_token,grant_type:'refresh_token'});
  const tResp=await httpReq({hostname:'oauth2.googleapis.com',path:'/token',method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'}},params.toString());
  const token=JSON.parse(tResp).access_token;

  // Competitor campaigns - monthly for last 6 months
  const q1 = `SELECT campaign.id, campaign.name, campaign.status, campaign_budget.amount_micros, segments.month, metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions, metrics.conversions_value FROM campaign WHERE campaign.name LIKE '%Competitor%' AND segments.date BETWEEN '2025-10-01' AND '2026-04-16'`;
  const data = await gaSearch(token, q1);
  if(data[0]&&data[0].results){
    console.log('=== COMPETITOR CAMPAIGNS - MONTHLY BREAKDOWN ===\n');
    console.log('Campaign | Month | Status | Spend | Clicks | Conv | Rev | ROAS');
    console.log('---|---|---|---|---|---|---|---');
    const sorted = data[0].results.sort((a,b)=>(a.campaign.name+a.segments.month).localeCompare(b.campaign.name+b.segments.month));
    for(const r of sorted){
      const spend=(parseInt(r.metrics.costMicros)/1000000).toFixed(2);
      if(parseFloat(spend)===0) continue;
      const conv=parseFloat(r.metrics.conversions).toFixed(1);
      const rev=parseFloat(r.metrics.conversionsValue).toFixed(2);
      const roas=parseFloat(spend)>0?(parseFloat(rev)/parseFloat(spend)).toFixed(2):'N/A';
      const budget=(parseInt(r.campaignBudget.amountMicros)/1000000).toFixed(0);
      console.log(`${r.campaign.name} | ${r.segments.month} | ${r.campaign.status} | $${spend} | ${r.metrics.clicks} | ${conv} | $${rev} | ${roas}x`);
    }
  }

  // Also get search terms for competitors campaign
  console.log('\n=== COMPETITOR CAMPAIGN - TOP SEARCH TERMS (last 30 days) ===\n');
  const q2 = `SELECT search_term_view.search_term, metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions, metrics.conversions_value FROM search_term_view WHERE campaign.name LIKE '%Competitor%' AND segments.date DURING LAST_30_DAYS ORDER BY metrics.cost_micros DESC LIMIT 30`;
  const data2 = await gaSearch(token, q2);
  if(data2[0]&&data2[0].results){
    console.log('Search Term | Clicks | Spend | Conv | Rev');
    console.log('---|---|---|---|---');
    for(const r of data2[0].results){
      const spend=(parseInt(r.metrics.costMicros)/1000000).toFixed(2);
      const conv=parseFloat(r.metrics.conversions).toFixed(1);
      const rev=parseFloat(r.metrics.conversionsValue).toFixed(2);
      console.log(`${r.searchTermView.searchTerm} | ${r.metrics.clicks} | $${spend} | ${conv} | $${rev}`);
    }
  } else {
    console.log('No search term data (campaign may have been paused too long)');
  }

  // Get the campaign details
  console.log('\n=== CAMPAIGN CONFIG ===\n');
  const q3 = `SELECT campaign.id, campaign.name, campaign.status, campaign.bidding_strategy_type, campaign_budget.amount_micros, campaign.start_date, campaign.advertising_channel_type FROM campaign WHERE campaign.name LIKE '%Competitor%'`;
  const data3 = await gaSearch(token, q3);
  if(data3[0]&&data3[0].results){
    for(const r of data3[0].results){
      console.log(`${r.campaign.name}:`);
      console.log(`  ID: ${r.campaign.id}`);
      console.log(`  Status: ${r.campaign.status}`);
      console.log(`  Type: ${r.campaign.advertisingChannelType}`);
      console.log(`  Bidding: ${r.campaign.biddingStrategyType}`);
      console.log(`  Budget: $${(parseInt(r.campaignBudget.amountMicros)/1000000).toFixed(0)}/day`);
      console.log(`  Start: ${r.campaign.startDate}`);
    }
  }
}

function httpReq(options, postData){return new Promise((resolve,reject)=>{const req=https.request(options,res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve(d));});req.on('error',reject);if(postData)req.write(postData);req.end();});}
function gaSearch(token,query){return httpReq({hostname:'googleads.googleapis.com',path:`/v23/customers/${creds.customer_id}/googleAds:searchStream`,method:'POST',headers:{'Authorization':'Bearer '+token,'developer-token':creds.dev_token,'Content-Type':'application/json'}},JSON.stringify({query})).then(d=>JSON.parse(d));}

run().catch(e=>console.error('Error:',e.message));
