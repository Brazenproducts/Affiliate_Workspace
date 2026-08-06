const fs = require('fs');
const creds = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json','utf8'));

async function getToken() {
  const p = new URLSearchParams({client_id:creds.client_id,client_secret:creds.client_secret,refresh_token:creds.refresh_token,grant_type:'refresh_token'});
  return (await (await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:p})).json()).access_token;
}

async function gads(token, endpoint, body) {
  const cid = creds.customer_id;
  const r = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/'+endpoint, {
    method:'POST',
    headers:{'Authorization':'Bearer '+token,'developer-token':creds.dev_token,'Content-Type':'application/json'},
    body:JSON.stringify(body)
  });
  return r.json();
}

function check(res, label) {
  if(res.results) { process.stdout.write('✅ '+label+': '+(res.results.length)+'\n'); return true; }
  process.stdout.write('❌ '+label+': '+JSON.stringify(res).slice(0,300)+'\n'); return false;
}

async function run() {
  const token = await getToken();
  const cid = creds.customer_id;

  // Budget - $25/day
  const budgetRes = await gads(token, 'campaignBudgets:mutate', {operations:[{create:{
    name:'Fire Extinguisher Holders Search Budget',
    amountMicros:25000000,
    deliveryMethod:'STANDARD'
  }}]});
  if(!check(budgetRes,'Budget')) return;
  const budgetResource = budgetRes.results[0].resourceName;

  // Campaign
  const campRes = await gads(token, 'campaigns:mutate', {operations:[{create:{
    name:'Fire Extinguisher Holders - Search',
    advertisingChannelType:'SEARCH',
    status:'ENABLED',
    campaignBudget:budgetResource,
    biddingStrategyType:'MANUAL_CPC',
    manualCpc:{enhancedCpcEnabled:false},
    networkSettings:{targetGoogleSearch:true,targetSearchNetwork:true,targetContentNetwork:false,targetPartnerSearchNetwork:false},
    containsEuPoliticalAdvertising:'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING'
  }}]});
  if(!check(campRes,'Campaign')) return;
  const campResource = campRes.results[0].resourceName;
  const campId = campResource.split('/').pop();

  // USA only
  await gads(token,'campaignCriteria:mutate',{operations:[{create:{
    campaign:campResource,negative:false,
    location:{geoTargetConstant:'geoTargetConstants/2840'}
  }}]});
  process.stdout.write('✅ USA geo set\n');

  // Negatives - campaign level
  const negOps = [
    'free','diy','how to','plans','diagram','cheap','wholesale','bulk',
    'amerex','element fire','halotron','kidde','ansul',
    'car fire extinguisher bracket','boat fire extinguisher','rv fire extinguisher',
    'home fire extinguisher','kitchen fire extinguisher','office fire extinguisher',
    'powder','dry chemical','halon','co2 extinguisher'
  ].map(kw=>({create:{campaign:campResource,negative:true,keyword:{text:kw,matchType:'BROAD'}}}));
  const negRes = await gads(token,'campaignCriteria:mutate',{operations:negOps});
  check(negRes,'Negatives');

  // ---- AD GROUP 1: Holders Only ----
  const ag1Res = await gads(token,'adGroups:mutate',{operations:[{create:{
    name:'Roll Bar Fire Extinguisher Holders',
    campaign:campResource,
    status:'ENABLED',
    type:'SEARCH_STANDARD',
    cpcBidMicros:900000 // $0.90 - $24-39 product, need quality clicks
  }}]});
  if(!check(ag1Res,'Ad Group 1')) return;
  const ag1Resource = ag1Res.results[0].resourceName;

  // Ad Group 1 Keywords
  const kw1 = [
    'jeep fire extinguisher holder','jeep wrangler fire extinguisher holder',
    'jeep roll bar fire extinguisher mount','roll bar fire extinguisher holder',
    'jeep fire extinguisher mount','fire extinguisher holder jeep wrangler',
    'jeep jl fire extinguisher holder','jeep jlu fire extinguisher mount',
    'jeep gladiator fire extinguisher holder','molle fire extinguisher holder',
    'pals fire extinguisher mount','roll bar fire extinguisher bracket',
    'jeep fire extinguisher bracket','off road fire extinguisher mount',
  ];
  const kw1Ops = kw1.flatMap(kw=>[
    {create:{adGroup:ag1Resource,status:'ENABLED',keyword:{text:kw,matchType:'EXACT'}}},
    {create:{adGroup:ag1Resource,status:'ENABLED',keyword:{text:kw,matchType:'PHRASE'}}}
  ]);
  check(await gads(token,'adGroupCriteria:mutate',{operations:kw1Ops}),'AG1 Keywords');

  // Ad Group 1 Ad
  const ad1Res = await gads(token,'adGroupAds:mutate',{operations:[{create:{
    adGroup:ag1Resource,
    status:'ENABLED',
    ad:{
      finalUrls:['https://www.bartact.com/collections/fire-extinguisher-holders'],
      responsiveSearchAd:{
        headlines:[
          {text:'Jeep Fire Extinguisher Holder'},
          {text:'Roll Bar Fire Ext Mount'},
          {text:'MOLLE Fire Ext Holder Jeep'},
          {text:'Bartact Fire Ext Holders'},
          {text:'JLU Aluminum Fire Ext Mount'},
          {text:'Patent Pending Fire Ext Mount'},
          {text:'Made in USA Fire Ext Holder'},
          {text:'Jeep Wrangler Fire Ext Mount'},
          {text:'Gladiator Fire Ext Holder'},
          {text:'PALS MOLLE Fire Ext Mount'},
          {text:'Free Shipping Over $99'},
          {text:'Roll Bar Extinguisher Bracket'},
          {text:'Shop Bartact Fire Ext Mounts'},
          {text:'Custom Fit Jeep Fire Ext'},
          {text:'Off Road Fire Ext Holder'}
        ],
        descriptions:[
          {text:'MOLLE-compatible roll bar fire extinguisher holders for Jeep Wrangler & Gladiator. Made in USA.'},
          {text:'Patent pending fire extinguisher mounts for JL, JLU, JK & Gladiator. Add extinguisher at checkout.'},
          {text:'Bartact roll bar fire ext holders — padded, MOLLE extreme & aluminum JLU mount. Ships from USA.'},
          {text:'Custom-fit fire extinguisher holders for Jeep roll bars. PALS/MOLLE compatible. Free ship $99+.'}
        ]
      }
    }
  }}]});
  check(ad1Res,'AG1 Ad');

  // ---- AD GROUP 2: Holder + Extinguisher Combos ----
  const ag2Res = await gads(token,'adGroups:mutate',{operations:[{create:{
    name:'Fire Extinguisher + Holder Combos',
    campaign:campResource,
    status:'ENABLED',
    type:'SEARCH_STANDARD',
    cpcBidMicros:1100000 // $1.10 - combo is $55-70, better margin
  }}]});
  if(!check(ag2Res,'Ad Group 2')) return;
  const ag2Resource = ag2Res.results[0].resourceName;

  // Ad Group 2 Keywords
  const kw2 = [
    'jeep fire extinguisher kit','jeep wrangler fire extinguisher kit',
    'fire extinguisher and holder jeep','jeep fire extinguisher combo',
    'jeep wrangler fire extinguisher and mount','roll bar fire extinguisher kit',
    'jeep fire extinguisher set','fire extinguisher holder combo jeep',
    'jeep gladiator fire extinguisher kit','off road fire extinguisher kit',
    'jeep trail fire extinguisher','first alert fire extinguisher jeep',
  ];
  const kw2Ops = kw2.flatMap(kw=>[
    {create:{adGroup:ag2Resource,status:'ENABLED',keyword:{text:kw,matchType:'EXACT'}}},
    {create:{adGroup:ag2Resource,status:'ENABLED',keyword:{text:kw,matchType:'PHRASE'}}}
  ]);
  check(await gads(token,'adGroupCriteria:mutate',{operations:kw2Ops}),'AG2 Keywords');

  // Ad Group 2 Ad
  const ad2Res = await gads(token,'adGroupAds:mutate',{operations:[{create:{
    adGroup:ag2Resource,
    status:'ENABLED',
    ad:{
      finalUrls:['https://www.bartact.com/collections/fire-extinguisher-holders'],
      responsiveSearchAd:{
        headlines:[
          {text:'Jeep Fire Extinguisher Kit'},
          {text:'Holder & Extinguisher Combo'},
          {text:'Fire Ext Kit for Jeep Wrangler'},
          {text:'Bartact Fire Ext Combo Kit'},
          {text:'Roll Bar Fire Ext Kit'},
          {text:'Jeep Trail Fire Ext Kit'},
          {text:'First Alert Fire Ext + Holder'},
          {text:'Gladiator Fire Ext Combo'},
          {text:'JLU Fire Ext Kit'},
          {text:'MOLLE Fire Ext Combo'},
          {text:'Made in USA Fire Ext Kit'},
          {text:'Off Road Fire Ext Combo'},
          {text:'Free Shipping Over $99'},
          {text:'Shop Fire Ext Combos'},
          {text:'Jeep Fire Safety Kit'}
        ],
        descriptions:[
          {text:'Holder plus First Alert fire extinguisher combos for Jeep Wrangler & Gladiator. Ships from USA.'},
          {text:'Roll bar fire extinguisher kits — choose holder color & add extinguisher in one order. Bartact.'},
          {text:'Bartact fire ext combos — MOLLE holder + First Alert ABC or Marine extinguisher. Made in USA.'},
          {text:'Complete Jeep fire ext kits from $54.99. Custom-fit holders for JL, JLU, JK & Gladiator.'}
        ]
      }
    }
  }}]});
  check(ad2Res,'AG2 Ad');

  process.stdout.write('\n✅ Fire Extinguisher Holders campaign LIVE\n');
  process.stdout.write('Campaign ID: '+campId+'\n');
  process.stdout.write('Budget: $25/day | USA only\n');
  process.stdout.write('Ad Group 1 (Holders): $0.90/click | 28 keywords\n');
  process.stdout.write('Ad Group 2 (Combos): $1.10/click | 24 keywords\n');
  process.stdout.write('Landing: bartact.com/collections/fire-extinguisher-holders\n');
}

run().catch(e=>process.stdout.write('ERR:'+e.message+'\n'));
