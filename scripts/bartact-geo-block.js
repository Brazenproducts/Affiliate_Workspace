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
  console.log('Token OK, length:', token.length);

  const customerId = creds.customer_id;
  const headers = {
    'Authorization': 'Bearer ' + token,
    'developer-token': creds.dev_token,
    'Content-Type': 'application/json'
  };

  const campaignIds = [
    '15614296956','21473410016','23698692938','23698692941','23698692944',
    '23698692947','23825826387','23825826429','23831173367','23831175782',
    '23831664860','23838067130','23842638625'
  ];

  // USA only = geoTargetConstants/2840
  const operations = campaignIds.map(id => ({
    create: {
      campaign: 'customers/' + customerId + '/campaigns/' + id,
      negative: false,
      location: { geoTargetConstant: 'geoTargetConstants/2840' }
    }
  }));

  console.log('Adding USA-only positive geo target to', operations.length, 'campaigns...');
  const r = await fetch('https://googleads.googleapis.com/v21/customers/' + customerId + '/campaignCriteria:mutate', {
    method: 'POST',
    headers,
    body: JSON.stringify({operations})
  });
  const d = await r.json();
  if (d.results) {
    console.log('✅ Done. USA-only targeting set on', d.results.length, 'campaigns.');
  } else {
    console.log('❌', JSON.stringify(d).slice(0,1000));
  }
}

run().catch(console.error);
