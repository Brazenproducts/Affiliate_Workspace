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

  const r = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
    method: 'POST', headers,
    body: JSON.stringify({query: `
      SELECT campaign.name, campaign.id,
        metrics.cost_micros, metrics.clicks, metrics.impressions,
        metrics.conversions, metrics.conversions_value,
        metrics.average_cpc
      FROM campaign
      WHERE campaign.id IN (23842638625, 23838067130)
      AND segments.date DURING LAST_7_DAYS`})
  });
  const d = await r.json();
  if (!d.results) { console.log('Error:', JSON.stringify(d)); return; }

  d.results.forEach(r => {
    const spend = (r.metrics.costMicros||0)/1e6;
    const clicks = r.metrics.clicks||0;
    const cpc = (r.metrics.averageCpc||0)/1e6;
    const conv = r.metrics.conversions||0;
    const convVal = r.metrics.conversionsValue||0;
    console.log(`\n${r.campaign.name}`);
    console.log(`  Spend:       $${spend.toFixed(2)}`);
    console.log(`  Clicks:      ${clicks}`);
    console.log(`  Avg CPC:     $${cpc.toFixed(2)}`);
    console.log(`  Impressions: ${r.metrics.impressions||0}`);
    console.log(`  Conversions: ${conv}`);
    console.log(`  Conv Value:  $${convVal.toFixed(2)}`);
    console.log(`  Cost/Conv:   ${conv > 0 ? '$'+(spend/conv).toFixed(2) : 'N/A — zero conversions'}`);
  });
}

run().catch(console.error);
