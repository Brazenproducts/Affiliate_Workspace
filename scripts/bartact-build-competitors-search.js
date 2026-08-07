const fs = require('fs');
const creds = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json','utf8'));
const CID = '1770651698';

async function getToken() {
  const p = new URLSearchParams({client_id:creds.client_id,client_secret:creds.client_secret,refresh_token:creds.refresh_token,grant_type:'refresh_token'});
  return (await (await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:p})).json()).access_token;
}

function headers(token) {
  return {'Authorization':'Bearer '+token,'developer-token':creds.dev_token,'Content-Type':'application/json'};
}

async function mutate(token, resource, operations) {
  const r = await fetch(`https://googleads.googleapis.com/v21/customers/${CID}/${resource}:mutate`,{
    method:'POST', headers:headers(token), body:JSON.stringify({operations})
  });
  return r.json();
}

async function main() {
  const token = await getToken();
  const h = headers(token);

  // 1. Create campaign
  console.log('Creating Competitors Search campaign...');
  const cr = await mutate(token, 'campaigns', [{create:{
    name: 'Competitors - Search',
    status: 'ENABLED',
    advertisingChannelType: 'SEARCH',
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: false  // NO display
    },
    manualCpc: {enhancedCpcEnabled: false},
    campaignBudget: `customers/${CID}/campaignBudgets/-1`
  }}]);

  if (!cr.results) { console.log('Campaign ERR:', JSON.stringify(cr).slice(0,300)); return; }
  const campResourceName = cr.results[0].resourceName;
  const campId = campResourceName.split('/').pop();
  console.log('✅ Campaign created:', campId);

  // 2. Create budget
  console.log('Creating budget...');
  const br = await mutate(token, 'campaignBudgets', [{create:{
    name: 'Competitors Search Budget',
    amountMicros: 15000000,  // $15/day
    deliveryMethod: 'STANDARD'
  }}]);
  if (!br.results) { console.log('Budget ERR:', JSON.stringify(br).slice(0,200)); return; }
  const budgetResourceName = br.results[0].resourceName;

  // 3. Attach budget to campaign
  const ubr = await mutate(token, 'campaigns', [{update:{
    resourceName: campResourceName,
    campaignBudget: budgetResourceName
  }, updateMask: 'campaign_budget'}]);
  if (ubr.results) console.log('✅ Budget attached: $15/day');
  else console.log('Budget attach ERR:', JSON.stringify(ubr).slice(0,200));

  // 4. Create ad group
  console.log('Creating ad group...');
  const agr = await mutate(token, 'adGroups', [{create:{
    campaign: campResourceName,
    name: 'Competitor Brands',
    status: 'ENABLED',
    type: 'SEARCH_STANDARD',
    cpcBidMicros: 1500000  // $1.50/click
  }}]);
  if (!agr.results) { console.log('AdGroup ERR:', JSON.stringify(agr).slice(0,200)); return; }
  const agResourceName = agr.results[0].resourceName;
  console.log('✅ Ad group created');

  // 5. Keywords — exact and phrase for each competitor
  const competitors = [
    'prp seats',
    'prp seat covers',
    'prp jeep seat covers',
    'prp wrangler seat covers',
    'covercraft seat covers',
    'covercraft jeep seat covers',
    'rough country seat covers',
    'rough country jeep seat covers',
    'rough country wrangler seat covers',
    'diver down seat covers',
    'diver down jeep seat covers',
    'smittybilt seat covers',
    'smittybilt jeep seat covers',
    'quadratec seat covers',
    'quadratec jeep seat covers',
    'wet okole seat covers',
    'wet okole jeep seat covers',
    'seat covers unlimited jeep',
    'seat covers unlimited wrangler'
  ];

  const kwOps = [];
  competitors.forEach(kw => {
    kwOps.push({create:{adGroup:agResourceName,keyword:{text:kw,matchType:'EXACT'},status:'ENABLED'}});
    kwOps.push({create:{adGroup:agResourceName,keyword:{text:kw,matchType:'PHRASE'},status:'ENABLED'}});
  });

  console.log('Adding '+kwOps.length+' keywords...');
  const kwr = await mutate(token, 'adGroupCriteria', kwOps);
  if (kwr.results) console.log('✅ '+kwr.results.length+' keywords added');
  else console.log('KW ERR:', JSON.stringify(kwr).slice(0,300));

  // 6. Negative keywords — don't waste money on non-buyer searches
  const negatives = [
    'cheap','free','diy','how to','install','review','vs','compare',
    'amazon','walmart','ebay','youtube','reddit','forum',
    'bartact','coverado'
  ];
  const negOps = negatives.map(kw=>({create:{
    adGroup:agResourceName,
    keyword:{text:kw,matchType:'BROAD'},
    negative:true,
    status:'ENABLED'
  }}));
  const negr = await mutate(token, 'adGroupCriteria', negOps);
  if (negr.results) console.log('✅ '+negr.results.length+' negatives added');
  else console.log('Neg ERR:', JSON.stringify(negr).slice(0,200));

  // 7. USA geo targeting
  const geor = await mutate(token, 'campaignCriteria', [{create:{
    campaign: campResourceName,
    location: {geoTargetConstant: 'geoTargetConstants/2840'}
  }}]);
  if (geor.results) console.log('✅ USA geo targeting set');
  else console.log('Geo ERR:', JSON.stringify(geor).slice(0,200));

  // 8. RSA ad
  console.log('Creating ad...');
  const adr = await mutate(token, 'adGroupAds', [{create:{
    adGroup: agResourceName,
    status: 'ENABLED',
    ad: {
      responsiveSearchAd: {
        headlines: [
          {text:'Better Than {KeyWord:Competitor Seat Covers}'},
          {text:'Bartact — Made in the USA'},
          {text:'Custom Fit — Not Universal'},
          {text:'Jeep Seat Covers That Actually Fit'},
          {text:'Direct from the Manufacturer'},
          {text:'Free Shipping Over $99'},
          {text:'1000D Cordura Seat Covers'},
          {text:'Invented the Paracord Grab Handle'},
          {text:'Wrangler JL JK TJ Gladiator'},
          {text:'Berry Amendment Compliant'},
          {text:'American Made Jeep Accessories'},
          {text:'Shop Direct — No Markup'},
          {text:'Custom Jeep Seat Covers'},
          {text:'Built in the USA'},
          {text:'Exact Fit for Your Jeep'}
        ],
        descriptions: [
          {text:'Bartact makes custom-fit Jeep seat covers in the USA — 1000D Cordura, exact fit for JL, JK, TJ, Gladiator & Bronco. Not universal. Direct from the manufacturer.'},
          {text:'Why buy from a distributor? Bartact manufactures every seat cover and grab handle in America. Custom-fit, Berry Amendment compliant. Free shipping over $99.'},
          {text:'Compare Bartact to any competitor — custom fit vs universal fit, American made vs overseas, manufacturer direct vs distributor markup. Free shipping over $99.'},
          {text:'Bartact invented the paracord grab handle and builds the best Jeep seat covers in the USA. Custom-cut for your specific Jeep. Shop direct at bartact.com.'}
        ]
      },
      finalUrls: ['https://www.bartact.com/collections/jeep-wrangler-jl-jlu-seat-covers']
    }
  }}]);
  if (adr.results) console.log('✅ RSA ad created');
  else console.log('Ad ERR:', JSON.stringify(adr).slice(0,300));

  console.log('\n✅ Competitors Search campaign LIVE');
  console.log('Campaign ID:', campId);
  console.log('Budget: $15/day | CPC: $1.50 | Keywords:', competitors.length*2);
  console.log('USA only | Search + Search Partners | No Display');
  console.log('\nNext step: reduce PMax Competitors Campaign budget to $0 or pause it.');
}

main().catch(e=>console.log('ERR:',e.message));
