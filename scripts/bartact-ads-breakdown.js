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
  const j = await r.json();
  if (!j.access_token) throw new Error('Token failed: ' + JSON.stringify(j));
  return j.access_token;
}

async function run() {
  const token = await getToken();
  const customerId = creds.customer_id;
  const headers = {
    'Authorization': 'Bearer ' + token,
    'developer-token': creds.dev_token,
    'Content-Type': 'application/json'
  };

  const query = `SELECT
    campaign.id,
    campaign.name,
    campaign.status,
    metrics.cost_micros,
    metrics.conversions_value,
    metrics.conversions,
    metrics.clicks,
    metrics.impressions
    FROM campaign
    WHERE segments.date DURING LAST_7_DAYS
    AND campaign.status != REMOVED
    ORDER BY metrics.cost_micros DESC`;

  const r = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
    method: 'POST',
    headers,
    body: JSON.stringify({query})
  });
  const d = await r.json();
  if (!d.results) { console.log('Error:', JSON.stringify(d).slice(0,500)); return; }

  let totalSpend = 0, totalConvValue = 0, totalClicks = 0, totalConversions = 0;
  const rows = d.results.map(r => {
    const spend = (r.metrics.costMicros || 0) / 1e6;
    const convVal = r.metrics.conversionsValue || 0;
    const convs = r.metrics.conversions || 0;
    const roas = spend > 0 ? (convVal / spend).toFixed(2) : 'N/A';
    totalSpend += spend;
    totalConvValue += convVal;
    totalClicks += (r.metrics.clicks || 0);
    totalConversions += convs;
    return {
      name: r.campaign.name,
      status: r.campaign.status,
      spend,
      convVal,
      convs,
      clicks: r.metrics.clicks || 0,
      impressions: r.metrics.impressions || 0,
      roas
    };
  });

  console.log('=== GOOGLE ADS BREAKDOWN ===\n');
  rows.forEach(r => {
    if (r.spend === 0 && r.clicks === 0) return;
    const emoji = r.roas === 'N/A' ? '⚪' : parseFloat(r.roas) >= 3 ? '✅' : parseFloat(r.roas) >= 1.5 ? '⚠️' : '🚨';
    console.log(`${emoji} ${r.name}`);
    console.log(`   Spend: $${r.spend.toFixed(2)} | Conv Value: $${r.convVal.toFixed(2)} | ROAS: ${r.roas}x | Clicks: ${r.clicks} | Conversions: ${r.convs.toFixed(1)}`);
  });

  console.log('\n=== TOTALS ===');
  console.log(`Total Spend:           $${totalSpend.toFixed(2)}`);
  console.log(`Total Conv Value:      $${totalConvValue.toFixed(2)} (Google-reported)`);
  console.log(`Google Reported ROAS:  ${(totalConvValue/totalSpend).toFixed(2)}x`);
  console.log(`Total Clicks:          ${totalClicks}`);
  console.log(`Total Conversions:     ${totalConversions.toFixed(1)}`);
  console.log(`\nNote: True ROAS (Shopify gclid-matched) runs ~50% lower than Google-reported.`);
  console.log(`Estimated True ROAS:   ~${(totalConvValue/totalSpend/1.5).toFixed(2)}x`);
}

run().catch(console.error);
