const fs = require('fs');
const creds = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json','utf8'));
const CID = '1770651698';
const CAMPAIGN_ID = '21473410016';

async function getToken() {
  const p = new URLSearchParams({client_id:creds.client_id,client_secret:creds.client_secret,refresh_token:creds.refresh_token,grant_type:'refresh_token'});
  return (await (await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:p})).json()).access_token;
}

function h(token) {
  return {'Authorization':'Bearer '+token,'developer-token':creds.dev_token,'Content-Type':'application/json'};
}

async function gaql(token, query) {
  const r = await fetch(`https://googleads.googleapis.com/v21/customers/${CID}/googleAds:search`,{
    method:'POST', headers:h(token), body:JSON.stringify({query})
  });
  return r.json();
}

async function mutate(token, operations, resource) {
  const r = await fetch(`https://googleads.googleapis.com/v21/customers/${CID}/${resource}:mutate`,{
    method:'POST', headers:h(token), body:JSON.stringify({operations})
  });
  return r.json();
}

async function main() {
  const token = await getToken();

  // First fix network settings — turn off display
  console.log('Fixing network settings...');
  const nr = await mutate(token, [{update:{
    resourceName:`customers/${CID}/campaigns/${CAMPAIGN_ID}`,
    networkSettings:{targetGoogleSearch:true,targetSearchNetwork:true,targetContentNetwork:false}
  },updateMask:'network_settings.target_content_network'}], 'campaigns');
  if(nr.results) console.log('✅ Display Network off');
  else console.log('Network ERR:', JSON.stringify(nr).slice(0,150));

  // Create one ad group
  console.log('\nCreating ad group...');
  const agr = await mutate(token, [{create:{
    campaign:`customers/${CID}/campaigns/${CAMPAIGN_ID}`,
    name:'Competitor Brands',
    status:'ENABLED',
    type:'SEARCH_STANDARD',
    cpcBidMicros: 1500000  // $1.50/click — competitor searches are high intent
  }}], 'adGroups');
  if(!agr.results) { console.log('AdGroup ERR:', JSON.stringify(agr).slice(0,200)); return; }
  const agResourceName = agr.results[0].resourceName;
  const agId = agResourceName.split('/').pop();
  console.log('✅ Ad group created:', agId);

  // Keywords — exact and phrase match for each competitor
  const competitors = [
    'prp seats', 'prp seat covers', 'prp jeep seat covers',
    'covercraft seat covers', 'covercraft jeep',
    'rough country seat covers', 'rough country jeep seat covers',
    'smittybilt seat covers', 'smittybilt jeep seat covers',
    'diver down seat covers', 'diver down jeep',
    'quadratec seat covers', 'quadratec jeep seat covers',
    'seat covers unlimited jeep', 'seat covers unlimited wrangler',
    'wet okole seat covers', 'wet okole jeep',
    'coverado seat covers', 'coverado jeep seat covers'
  ];

  const kwOps = [];
  competitors.forEach(kw => {
    // Exact match
    kwOps.push({create:{
      adGroup: agResourceName,
      keyword:{text:kw, matchType:'EXACT'},
      status:'ENABLED'
    }});
    // Phrase match
    kwOps.push({create:{
      adGroup: agResourceName,
      keyword:{text:kw, matchType:'PHRASE'},
      status:'ENABLED'
    }});
  });

  console.log('\nAdding '+kwOps.length+' keywords...');
  const kwr = await mutate(token, kwOps, 'adGroupCriteria');
  if(kwr.results) console.log('✅ '+kwr.results.length+' keywords added');
  else console.log('KW ERR:', JSON.stringify(kwr).slice(0,200));

  // Negative keywords — don't want to show for Bartact searches
  const negOps = [
    'bartact','prp','covercraft','rough country','smittybilt','diver down',
    'cheap','free','diy','how to','review','vs','compare','amazon'
  ].map(kw=>({create:{
    adGroup: agResourceName,
    keyword:{text:kw, matchType:'BROAD'},
    negative:true,
    status:'ENABLED'
  }}));

  console.log('Adding negatives...');
  const negr = await mutate(token, negOps, 'adGroupCriteria');
  if(negr.results) console.log('✅ '+negr.results.length+' negative keywords added');
  else console.log('Neg ERR:', JSON.stringify(negr).slice(0,200));

  // Create RSA ad
  console.log('\nCreating ad...');
  const adr = await mutate(token, [{create:{
    adGroup: agResourceName,
    status:'ENABLED',
    ad:{
      responsiveSearchAd:{
        headlines:[
          {text:'Better Than {KeyWord:Competitor Brands}'},
          {text:'Bartact — Made in the USA'},
          {text:'Custom Fit Jeep Seat Covers'},
          {text:'Not a Universal Fit'},
          {text:'Inventor of Paracord Grab Handles'},
          {text:'Free Shipping Over $99'},
          {text:'Direct from the Manufacturer'},
          {text:'1000D Cordura — Built to Last'},
          {text:'Jeep Wrangler Seat Covers'},
          {text:'Gladiator & Bronco Seat Covers'},
          {text:'Berry Amendment Compliant'},
          {text:'American Made Jeep Accessories'},
          {text:'Shop Bartact Direct'},
          {text:'Custom Jeep Accessories'},
          {text:'Trail-Tested Seat Covers'}
        ],
        descriptions:[
          {text:'Bartact makes custom-fit Jeep seat covers and paracord grab handles in the USA. Not universal fit — exact fit for your JL, JK, TJ, Gladiator, or Bronco.'},
          {text:'Skip the distributor. Bartact sells direct — 1000D Cordura seat covers, paracord grab handles, MOLLE gear. All made in America. Free shipping over $99.'},
          {text:'Why settle for a brand that resells? Bartact invented the paracord grab handle and manufactures every product in the USA. Custom-fit for your specific Jeep.'},
          {text:'Bartact vs the competition: we make it here, custom-cut for your vehicle, backed by real support. Free shipping over $99. Shop direct at bartact.com.'}
        ]
      },
      finalUrls:['https://www.bartact.com/collections/jeep-wrangler-jl-jlu-seat-covers']
    }
  }}], 'adGroupAds');
  if(adr.results) console.log('✅ RSA ad created');
  else console.log('Ad ERR:', JSON.stringify(adr).slice(0,300));

  console.log('\n✅ Competitors Campaign rebuilt. Keywords: '+competitors.length*2+' | Budget: $23/day | CPC: $1.50');
  console.log('Give it 1 week to accumulate search term data.');
}

main().catch(e=>console.log('ERR:',e.message));
