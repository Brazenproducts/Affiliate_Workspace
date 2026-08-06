const fs = require('fs');
const creds = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json','utf8'));
const SHOPIFY_TOKEN = 'REDACTED_SHOPIFY_TOKEN';

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

  // Get campaign spend
  const r = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
    method: 'POST', headers,
    body: JSON.stringify({query: `SELECT campaign.id, campaign.name, metrics.cost_micros, metrics.conversions_value, metrics.conversions
      FROM campaign WHERE segments.date DURING LAST_7_DAYS AND campaign.status != REMOVED ORDER BY metrics.cost_micros DESC`})
  });
  const d = await r.json();
  const campaigns = (d.results || []).filter(x => (x.metrics.costMicros||0) > 0).map(x => ({
    id: x.campaign.id,
    name: x.campaign.name,
    spend: (x.metrics.costMicros||0)/1e6,
    googleConvValue: x.metrics.conversionsValue||0
  }));

  // Get Shopify orders with gclid + utm_campaign for last 7 days
  const shopifyRes = await fetch('https://bartact.myshopify.com/admin/api/2024-01/orders.json?status=any&limit=250&created_at_min=2026-07-17T07:00:00Z&fields=id,created_at,total_price,source_name,landing_site,note_attributes,referring_site', {
    headers: {'X-Shopify-Access-Token': SHOPIFY_TOKEN}
  });
  const shopifyData = await shopifyRes.json();
  const orders = shopifyData.orders || [];

  // Match gclid orders to campaigns via utm_campaign in landing_site
  let totalGclidRevenue = 0;
  const campaignRevenue = {};

  orders.forEach(o => {
    const price = parseFloat(o.total_price || 0);
    const attrs = o.note_attributes || [];
    const hasGclid = attrs.some(a => a.name === 'gclid' && a.value);
    const landingGclid = (o.landing_site || '').includes('gclid=');

    if (!hasGclid && !landingGclid) return;

    totalGclidRevenue += price;

    // Try to extract utm_campaign from landing_site
    const landing = o.landing_site || '';
    const utmMatch = landing.match(/utm_campaign=([^&]+)/);
    const utmCampaign = utmMatch ? decodeURIComponent(utmMatch[1]).toLowerCase() : 'unknown';

    if (!campaignRevenue[utmCampaign]) campaignRevenue[utmCampaign] = 0;
    campaignRevenue[utmCampaign] += price;
  });

  console.log('=== TRUE ROAS BY CAMPAIGN (Shopify gclid-matched, last 7 days) ===\n');

  let totalSpend = 0;
  campaigns.forEach(c => {
    totalSpend += c.spend;
    const emoji = c.googleConvValue/c.spend >= 3 ? '✅' : c.googleConvValue/c.spend >= 1.5 ? '⚠️' : '🚨';
    console.log(`${emoji} ${c.name}`);
    console.log(`   Spend: $${c.spend.toFixed(2)} | Google-reported ROAS: ${(c.googleConvValue/c.spend).toFixed(2)}x`);
  });

  console.log('\n=== SHOPIFY gclid-MATCHED TOTALS ===');
  console.log('Total gclid revenue (all campaigns): $' + totalGclidRevenue.toFixed(2));
  console.log('Total spend: $' + totalSpend.toFixed(2));
  console.log('Overall True ROAS: ' + (totalGclidRevenue/totalSpend).toFixed(2) + 'x');
  console.log('\nNote: utm_campaign matching for per-campaign true ROAS:');
  Object.entries(campaignRevenue).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => {
    console.log('  utm_campaign="'+k+'" → $'+v.toFixed(2));
  });
  console.log('\nTotal orders checked:', orders.length, '| gclid-matched orders:', orders.filter(o => {
    const attrs = o.note_attributes || [];
    return attrs.some(a => a.name === 'gclid' && a.value) || (o.landing_site||'').includes('gclid=');
  }).length);
}

run().catch(console.error);
