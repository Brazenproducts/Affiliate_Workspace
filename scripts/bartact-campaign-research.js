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

  // 1. Check what search terms are ALREADY triggering MOLLE/fire ext purchases via PMax
  process.stdout.write('=== SEARCH TERMS ALREADY CONVERTING (PMax, last 30 days) ===\n');
  const pmax = ['23698692941','23698692944','23698692947','23698692938']; // Wrangler, Gladiator, Bronco, Tacoma PMax

  for (const id of pmax) {
    const r = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/googleAds:search', {
      method:'POST', headers:h,
      body:JSON.stringify({query:`SELECT campaign.name, search_term_view.search_term, metrics.clicks, metrics.conversions, metrics.cost_micros, metrics.conversions_value FROM search_term_view WHERE campaign.id = ${id} AND segments.date DURING LAST_30_DAYS AND metrics.conversions > 0 ORDER BY metrics.conversions DESC LIMIT 20`})
    });
    const d = await r.json();
    if ((d.results||[]).length) {
      process.stdout.write('\n'+d.results[0].campaign.name+':\n');
      d.results.forEach(r => {
        process.stdout.write(`  "${r.searchTermView.searchTerm}" | conv: ${r.metrics.conversions} | clicks: ${r.metrics.clicks} | value: $${r.metrics.conversionsValue}\n`);
      });
    }
  }

  // 2. Keyword ideas via Google Ads keyword planning
  process.stdout.write('\n=== KEYWORD IDEAS — checking search volume ===\n');
  const keywords = [
    'jeep molle accessories',
    'pals molle buckles',
    'molle buckle kit',
    'molle attachments jeep',
    'jeep roll bar molle mount',
    'molle pouches jeep wrangler',
    'jeep wrangler fire extinguisher mount',
    'jeep fire extinguisher holder',
    'roll bar fire extinguisher mount',
    'jeep wrangler fire extinguisher holder roll bar',
    'molle fire extinguisher holder',
    'fire extinguisher mount jeep',
  ];

  const kwRes = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+':generateKeywordIdeas', {
    method:'POST', headers:h,
    body:JSON.stringify({
      keywordSeed: {keywords},
      geoTargetConstants: ['geoTargetConstants/2840'],
      language: 'languageConstants/1000',
      keywordPlanNetwork: 'GOOGLE_SEARCH_AND_PARTNERS'
    })
  });
  const kwData = await kwRes.json();
  if (kwData.results) {
    const sorted = kwData.results
      .filter(r => r.keywordIdeaMetrics?.avgMonthlySearches > 0)
      .sort((a,b) => (b.keywordIdeaMetrics.avgMonthlySearches||0) - (a.keywordIdeaMetrics.avgMonthlySearches||0));
    sorted.slice(0,30).forEach(r => {
      const m = r.keywordIdeaMetrics;
      process.stdout.write(`  "${r.text}" | vol: ${m.avgMonthlySearches}/mo | competition: ${m.competitionIndex||'N/A'}\n`);
    });
  } else {
    process.stdout.write('Keyword planner error: '+JSON.stringify(kwData).slice(0,200)+'\n');
  }
}

run().catch(e => process.stdout.write('ERROR: '+e.message+'\n'));
