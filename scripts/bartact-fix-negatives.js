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

  const TJ_ID            = '23842638625';
  const JK_ID            = '23838067130';
  const JL_GRAB_ID       = '23825826387';
  const BRONCO_STOR_ID   = '23831664860';
  const GLAD_GRAB_ID     = '23825826429';

  // Helper: add campaign-level negative keywords in one batch
  async function addCampNegs(campaignId, keywords) {
    const ops = keywords.map(kw => ({
      create: {
        campaign: 'customers/'+cid+'/campaigns/'+campaignId,
        negative: true,
        keyword: { text: kw, matchType: 'BROAD' }
      }
    }));
    const r = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/campaignCriteria:mutate', {
      method:'POST', headers:h, body:JSON.stringify({operations:ops})
    });
    const d = await r.json();
    if (d.results) process.stdout.write('  ✅ Added '+d.results.length+' negatives\n');
    else process.stdout.write('  ❌ '+JSON.stringify(d).slice(0,300)+'\n');
  }

  // Helper: remove keyword from campaign (finds by text, removes from ad group)
  async function removeKeyword(campaignId, keywordText) {
    const r = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/googleAds:search', {
      method:'POST', headers:h,
      body:JSON.stringify({query:`SELECT ad_group.id, ad_group_criterion.criterion_id, ad_group_criterion.keyword.text FROM ad_group_criterion WHERE campaign.id = ${campaignId} AND ad_group_criterion.type = KEYWORD AND ad_group_criterion.status = ENABLED`})
    });
    const d = await r.json();
    const matches = (d.results||[]).filter(x => x.adGroupCriterion.keyword.text.toLowerCase() === keywordText.toLowerCase());
    if (!matches.length) { process.stdout.write('  ⚠️  Keyword not found: "'+keywordText+'"\n'); return; }
    const ops = matches.map(x => ({remove: 'customers/'+cid+'/adGroupCriteria/'+x.adGroup.id+'~'+x.adGroupCriterion.criterionId}));
    const rr = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/adGroupCriteria:mutate', {
      method:'POST', headers:h, body:JSON.stringify({operations:ops})
    });
    const dd = await rr.json();
    if (dd.results) process.stdout.write('  ✅ Removed keyword: "'+keywordText+'"\n');
    else process.stdout.write('  ❌ '+JSON.stringify(dd).slice(0,300)+'\n');
  }

  // FIX 1: Remove "jeep wrangler tj accessories" from TJ campaign
  process.stdout.write('\n--- FIX 1: Remove broad TJ keyword ---\n');
  await removeKeyword(TJ_ID, 'jeep wrangler tj accessories');

  // FIX 2: Add JL/JLU year negatives to JK to stop cannibalization
  process.stdout.write('\n--- FIX 2: JK campaign — block JL years ---\n');
  await addCampNegs(JK_ID, [
    'jeep wrangler jl seat covers', 'jeep wrangler jlu seat covers',
    'jl seat covers', 'jlu seat covers',
    '2018 jeep wrangler seat covers', '2019 jeep wrangler seat covers',
    '2020 jeep wrangler seat covers', '2021 jeep wrangler seat covers',
    '2022 jeep wrangler seat covers', '2023 jeep wrangler seat covers',
    '2024 jeep wrangler seat covers', '2025 jeep wrangler seat covers',
    '2026 jeep wrangler seat covers',
  ]);

  // FIX 3: Block JK terms from JL grab handles campaign
  process.stdout.write('\n--- FIX 3: JL grab handles — block JK terms ---\n');
  await addCampNegs(JL_GRAB_ID, ['jk grab handles', 'jeep jk grab handles', 'wrangler jk grab handles', 'jeep jk passenger grab bar']);

  // FIX 4: Block roof-related terms from Bronco Storage Search
  process.stdout.write('\n--- FIX 4: Bronco Storage — block roof terms ---\n');
  await addCampNegs(BRONCO_STOR_ID, ['bronco roof storage', 'roof storage', 'roof rack', 'roof basket', 'roof bag']);

  // FIX 5: Block mopar from Gladiator grab handles
  process.stdout.write('\n--- FIX 5: Gladiator grab handles — block mopar ---\n');
  await addCampNegs(GLAD_GRAB_ID, ['mopar', 'mopar grab handles', 'mopar gladiator grab handles']);

  process.stdout.write('\n✅ All 5 fixes applied.\n');
}

run().catch(e => process.stdout.write('ERROR: '+e.message+'\n'));
