const fs = require('fs');
const creds = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json','utf8'));

async function getToken() {
  const params = new URLSearchParams({
    client_id: creds.client_id,
    client_secret: creds.client_secret,
    refresh_token: creds.refresh_token,
    grant_type: 'refresh_token'
  });
  const r = await fetch('https://oauth2.googleapis.com/token', {method:'POST', body:params});
  return (await r.json()).access_token;
}

async function run() {
  const token = await getToken();
  const customerId = creds.customer_id;
  const headers = {
    'Authorization': 'Bearer ' + token,
    'developer-token': creds.dev_token,
    'Content-Type': 'application/json'
  };

  for (const [name, id] of [['Jeep TJ', '23842638625'], ['Jeep JK', '23838067130']]) {
    console.log(`\n=== ${name} — Search Terms (last 7 days) ===`);
    const r = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
      method: 'POST', headers,
      body: JSON.stringify({query: `SELECT search_term_view.search_term, metrics.clicks, metrics.impressions, metrics.cost_micros, metrics.conversions FROM search_term_view WHERE campaign.id = ${id} AND segments.date DURING LAST_7_DAYS ORDER BY metrics.clicks DESC LIMIT 20`})
    });
    const d = await r.json();
    if (!d.results || d.results.length === 0) {
      console.log('No search terms found — campaign may have no active ads');
    } else {
      d.results.forEach(r => {
        console.log(` "${r.searchTermView.searchTerm}" | clicks: ${r.metrics.clicks} | spend: $${(r.metrics.costMicros/1e6).toFixed(2)} | conv: ${r.metrics.conversions}`);
      });
    }
  }
}

run().catch(console.error);
