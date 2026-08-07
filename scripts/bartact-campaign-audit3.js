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
  const customerId = creds.customer_id; // 1770651698

  // Try WITH login-customer-id header (MCC)
  const headersWithMCC = {
    'Authorization': 'Bearer ' + token,
    'developer-token': creds.dev_token,
    'login-customer-id': creds.login_customer_id || '3931546976',
    'Content-Type': 'application/json'
  };

  // Try WITHOUT login-customer-id
  const headersWithout = {
    'Authorization': 'Bearer ' + token,
    'developer-token': creds.dev_token,
    'Content-Type': 'application/json'
  };

  console.log('Testing WITH login-customer-id (MCC)...');
  const r1 = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
    method: 'POST', headers: headersWithMCC,
    body: JSON.stringify({query: 'SELECT campaign.id, campaign.name, campaign.status FROM campaign WHERE campaign.status = ENABLED LIMIT 5'})
  });
  const d1 = await r1.json();
  console.log('With MCC:', (d1.results||[]).length, 'campaigns', d1.error ? '❌ '+d1.error.message : '');

  console.log('\nTesting WITHOUT login-customer-id...');
  const r2 = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/googleAds:search', {
    method: 'POST', headers: headersWithout,
    body: JSON.stringify({query: 'SELECT campaign.id, campaign.name, campaign.status FROM campaign WHERE campaign.status = ENABLED LIMIT 5'})
  });
  const d2 = await r2.json();
  console.log('Without MCC:', (d2.results||[]).length, 'campaigns', d2.error ? '❌ '+d2.error.message : '');
  if (d2.results) d2.results.forEach(r => console.log(' -', r.campaign.name));
}

run().catch(console.error);
