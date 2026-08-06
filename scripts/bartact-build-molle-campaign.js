const fs = require('fs');
const creds = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json','utf8'));

async function getToken() {
  const p = new URLSearchParams({client_id:creds.client_id,client_secret:creds.client_secret,refresh_token:creds.refresh_token,grant_type:'refresh_token'});
  return (await (await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:p})).json()).access_token;
}

async function gads(token, endpoint, body) {
  const cid = creds.customer_id;
  const r = await fetch(`https://googleads.googleapis.com/v21/customers/${cid}/${endpoint}`, {
    method:'POST',
    headers:{'Authorization':'Bearer '+token,'developer-token':creds.dev_token,'Content-Type':'application/json'},
    body:JSON.stringify(body)
  });
  return r.json();
}

async function run() {
  const token = await getToken();
  const cid = creds.customer_id;

  // Step 1: Create campaign budget ($20/day to start — conservative)
  process.stdout.write('Creating campaign budget...\n');
  const budgetRes = await gads(token, 'campaignBudgets:mutate', {
    operations:[{
      create:{
        name: 'MOLLE Accessories Search Budget July24b',
        amountMicros: 20000000, // $20/day
        deliveryMethod: 'STANDARD'
      }
    }]
  });
  if (!budgetRes.results) { process.stdout.write('Budget error: '+JSON.stringify(budgetRes).slice(0,300)+'\n'); return; }
  const budgetResource = budgetRes.results[0].resourceName;
  process.stdout.write('✅ Budget created: '+budgetResource+'\n');

  // Step 2: Create campaign
  process.stdout.write('Creating campaign...\n');
  const campRes = await gads(token, 'campaigns:mutate', {
    operations:[{
      create:{
        name: 'MOLLE Accessories - Search',
        advertisingChannelType: 'SEARCH',
        status: 'PAUSED', // Start paused for review
        campaignBudget: budgetResource,
        biddingStrategyType: 'MANUAL_CPC',
        manualCpc: { enhancedCpcEnabled: false },
        networkSettings: {
          targetGoogleSearch: true,
          targetSearchNetwork: true,
          targetContentNetwork: false,
          targetPartnerSearchNetwork: false
        },

      }
    }]
  });
  if (!campRes.results) { process.stdout.write('Campaign error: '+JSON.stringify(campRes).slice(0,300)+'\n'); return; }
  const campResource = campRes.results[0].resourceName;
  const campId = campResource.split('/').pop();
  process.stdout.write('✅ Campaign created: '+campResource+'\n');

  // Step 3: Add USA geo target
  const geoRes = await gads(token, 'campaignCriteria:mutate', {
    operations:[{
      create:{
        campaign: campResource,
        negative: false,
        location: { geoTargetConstant: 'geoTargetConstants/2840' }
      }
    }]
  });
  process.stdout.write('✅ USA geo target set\n');

  // Step 4: Create ad group
  process.stdout.write('Creating ad group...\n');
  const agRes = await gads(token, 'adGroups:mutate', {
    operations:[{
      create:{
        name: 'MOLLE Accessories',
        campaign: campResource,
        status: 'ENABLED',
        type: 'STANDARD',
        cpcBidMicros: 800000 // $0.80/click
      }
    }]
  });
  if (!agRes.results) { process.stdout.write('Ad group error: '+JSON.stringify(agRes).slice(0,300)+'\n'); return; }
  const agResource = agRes.results[0].resourceName;
  process.stdout.write('✅ Ad group created\n');

  // Step 5: Add keywords (mix of exact and phrase, focused on buying intent)
  process.stdout.write('Adding keywords...\n');
  const keywords = [
    // MOLLE accessories - buying intent
    {text: 'jeep molle accessories', type: 'PHRASE'},
    {text: 'jeep molle accessories', type: 'EXACT'},
    {text: 'molle attachments jeep', type: 'PHRASE'},
    {text: 'molle attachments jeep', type: 'EXACT'},
    {text: 'jeep molle bags', type: 'PHRASE'},
    {text: 'jeep molle bags', type: 'EXACT'},
    {text: 'jeep wrangler molle accessories', type: 'PHRASE'},
    {text: 'jeep wrangler molle accessories', type: 'EXACT'},
    {text: 'pals molle buckles', type: 'PHRASE'},
    {text: 'pals molle buckles', type: 'EXACT'},
    {text: 'molle buckle kit', type: 'PHRASE'},
    {text: 'molle buckle kit', type: 'EXACT'},
    {text: 'jeep jl molle bags', type: 'EXACT'},
    {text: 'jeep jl molle bags', type: 'PHRASE'},
    {text: 'molle pouches jeep wrangler', type: 'PHRASE'},
    {text: 'molle pouches jeep wrangler', type: 'EXACT'},
    {text: 'jeep roll bar molle mount', type: 'PHRASE'},
    {text: 'jeep roll bar molle mount', type: 'EXACT'},
    {text: 'molle panels jeep', type: 'PHRASE'},
    {text: 'molle panels jeep', type: 'EXACT'},
    {text: 'molle seat back panel jeep', type: 'PHRASE'},
    {text: 'molle visor covers jeep', type: 'PHRASE'},
  ];

  const kwOps = keywords.map(kw => ({
    create:{
      adGroup: agResource,
      status: 'ENABLED',
      keyword:{ text: kw.text, matchType: kw.type }
    }
  }));
  const kwRes = await gads(token, 'adGroupCriteria:mutate', {operations: kwOps});
  process.stdout.write('✅ Added '+(kwRes.results||[]).length+' keywords\n');

  // Step 6: Add negative keywords
  process.stdout.write('Adding negative keywords...\n');
  const negKeywords = [
    'bartact', 'bartac', 'ford bronco sport', 'bronco sport',
    'military molle', 'tactical vest molle', 'molle backpack', 'molle vest',
    'airsoft molle', 'molle plate carrier', 'molle chest rig',
    'free', 'cheap', 'diy', 'how to'
  ];
  const negOps = negKeywords.map(kw => ({
    create:{
      campaign: campResource,
      negative: true,
      keyword:{ text: kw, matchType: 'BROAD' }
    }
  }));
  const negRes = await gads(token, 'campaignCriteria:mutate', {operations: negOps});
  process.stdout.write('✅ Added '+(negRes.results||[]).length+' negative keywords\n');

  // Step 7: Create responsive search ad
  process.stdout.write('Creating ad...\n');
  const adRes = await gads(token, 'adGroupAds:mutate', {
    operations:[{
      create:{
        adGroup: agResource,
        status: 'ENABLED',
        ad:{
          finalUrls: ['https://www.bartact.com/collections/molle-accessories'],
          responsiveSearchAd:{
            headlines:[
              {text: 'Jeep MOLLE Accessories'},
              {text: 'PALS MOLLE Jeep Gear'},
              {text: 'MOLLE Pouches & Mounts'},
              {text: 'Bartact MOLLE Accessories'},
              {text: 'Made in USA MOLLE Gear'},
              {text: 'Jeep Wrangler MOLLE Bags'},
              {text: 'MOLLE Seat Back Panels'},
              {text: 'MOLLE Visor Covers Jeep'},
              {text: 'Roll Bar MOLLE Mounts'},
              {text: 'PALS MOLLE Buckle Kits'},
              {text: 'MOLLE Pouches for Jeep'},
              {text: 'Tactical Jeep Accessories'},
              {text: 'Free Shipping Over $99'},
              {text: 'MOLLE Panels & Pouches'},
              {text: 'Shop Bartact MOLLE Gear'}
            ],
            descriptions:[
              {text: 'PALS/MOLLE compatible accessories for Jeep Wrangler, Gladiator & Bronco. Made in USA. Free shipping over $99.'},
              {text: 'Bartact MOLLE gear — visor covers, seat back panels, pouches, buckle kits & roll bar mounts. Built for the trail.'},
              {text: 'Shop Bartact\'s full line of MOLLE accessories. Custom-fit for JL, JLU, JK, JT & Bronco. American made.'},
              {text: 'MOLLE pouches, panels, buckle kits and mounts. Designed for Jeep and Ford Bronco. Ships from USA.'}
            ]
          }
        }
      }
    }]
  });
  if (adRes.results) process.stdout.write('✅ Ad created\n');
  else process.stdout.write('❌ Ad error: '+JSON.stringify(adRes).slice(0,300)+'\n');

  process.stdout.write('\n✅ MOLLE Accessories Search campaign created (PAUSED for review)\n');
  process.stdout.write('Campaign ID: '+campId+'\n');
  process.stdout.write('Budget: $20/day | CPC: $0.80 | USA only\n');
  process.stdout.write('Landing: /collections/molle-accessories\n');
  process.stdout.write('\nReview in Google Ads UI before enabling.\n');
}

run().catch(e => process.stdout.write('ERROR: '+e.message+'\n'));
