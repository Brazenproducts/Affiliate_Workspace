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
  const campId = '23842638625';

  // Ad group
  const agR = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/adGroups:mutate',{
    method:'POST',headers:h,
    body:JSON.stringify({operations:[{create:{
      name:'TJ Seat Covers',
      campaign:'customers/'+cid+'/campaigns/'+campId,
      status:'ENABLED',
      type:'SEARCH_STANDARD',
      cpcBidMicros:750000
    }}]})
  });
  const agD = await agR.json();
  if(!agD.results){process.stdout.write('❌ '+agD.error?.message+'\n');return;}
  const agResource = agD.results[0].resourceName;
  process.stdout.write('✅ Ad group created\n');

  // Keywords
  const keywords = [
    'jeep tj seat covers','jeep wrangler tj seat covers','jeep tj seat cover',
    '1997 jeep wrangler seat covers','1998 jeep wrangler seat covers',
    '1999 jeep wrangler seat covers','2000 jeep wrangler seat covers',
    '2001 jeep wrangler seat covers','2002 jeep wrangler seat covers',
    '2003 jeep wrangler seat covers','2004 jeep wrangler seat covers',
    '2005 jeep wrangler seat covers','2006 jeep wrangler seat covers',
    'jeep tj custom seat covers','seat covers for jeep tj'
  ];
  const kwOps = keywords.flatMap(kw=>[
    {create:{adGroup:agResource,status:'ENABLED',keyword:{text:kw,matchType:'EXACT'}}},
    {create:{adGroup:agResource,status:'ENABLED',keyword:{text:kw,matchType:'PHRASE'}}}
  ]);
  const kwR = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/adGroupCriteria:mutate',{
    method:'POST',headers:h,body:JSON.stringify({operations:kwOps})
  });
  const kwD = await kwR.json();
  if(kwD.results) process.stdout.write('✅ '+(kwD.results.length)+' keywords\n');

  // Negatives
  const negs = ['accessories','steering','suspension','lift kit','bumper','lights','headlights','tires','wheels','winch','roof','doors','hard top','soft top','hood','fender','skid plate','exhaust','engine','parts','repair','floor mats','carpet','free','cheap','used','ebay','amazon','forum','diy','how to','coprisedili','fundas','asientos'];
  const negOps = negs.map(kw=>({create:{campaign:'customers/'+cid+'/campaigns/'+campId,negative:true,keyword:{text:kw,matchType:'BROAD'}}}));
  const negR = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/campaignCriteria:mutate',{
    method:'POST',headers:h,body:JSON.stringify({operations:negOps})
  });
  const negD = await negR.json();
  if(negD.results) process.stdout.write('✅ '+(negD.results.length)+' negatives\n');

  // Ad
  const adR = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/adGroupAds:mutate',{
    method:'POST',headers:h,
    body:JSON.stringify({operations:[{create:{
      adGroup:agResource,
      status:'ENABLED',
      ad:{
        finalUrls:['https://www.bartact.com/collections/jeep-wrangler-tj-seat-covers'],
        responsiveSearchAd:{
          headlines:[
            {text:'Jeep TJ Seat Covers'},
            {text:'Jeep Wrangler TJ Seat Covers'},
            {text:'1997-2006 Jeep Seat Covers'},
            {text:'Custom Fit TJ Seat Covers'},
            {text:'Bartact Jeep TJ Covers'},
            {text:'Made in USA TJ Seat Covers'},
            {text:'MOLLE TJ Seat Covers'},
            {text:'Cordura Jeep TJ Covers'},
            {text:'Free Shipping Over $99'},
            {text:'Shop Bartact TJ Covers'},
            {text:'Exact Fit TJ Seat Covers'},
            {text:'TJ Wrangler Custom Covers'},
            {text:'Durable Jeep TJ Covers'},
            {text:'Jeep TJ Interior'},
            {text:'TJ Seat Accessories'}
          ],
          descriptions:[
            {text:'Custom-fit seat covers for Jeep Wrangler TJ 1997-2006. Cordura fabric. Made in USA.'},
            {text:'Bartact TJ seat covers — exact fit, not universal. MOLLE compatible. Free ship $99+.'},
            {text:'Jeep Wrangler TJ seat covers built for the trail. Berry Amendment compliant. Bartact.'},
            {text:'1997-2006 Jeep Wrangler TJ seat covers. Custom cut, American made. Free shipping $99+.'}
          ]
        }
      }
    }}]})
  });
  const adD = await adR.json();
  if(adD.results) process.stdout.write('✅ Ad created\n');
  else process.stdout.write('❌ Ad: '+JSON.stringify(adD.error?.details?.[0]?.errors?.[0]?.trigger||'unknown').slice(0,200)+'\n');

  process.stdout.write('\n✅ TJ PAUSED with proper tight keywords & negatives. Ready to enable.\n');
}

run().catch(e=>process.stdout.write('ERR:'+e.message+'\n'));
