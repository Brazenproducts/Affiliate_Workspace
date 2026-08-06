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
  const JK_ID = '23838067130';

  // Get ad group id
  const r = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/googleAds:search', {
    method:'POST', headers:h,
    body:JSON.stringify({query:`SELECT ad_group.id, ad_group.name, ad_group.cpc_bid_micros FROM ad_group WHERE campaign.id = ${JK_ID} AND ad_group.status = ENABLED`})
  });
  const d = await r.json();
  const adGroups = d.results || [];
  if (!adGroups.length) { process.stdout.write('No ad groups found\n'); return; }

  const ops = adGroups.map(ag => ({
    update: {
      resourceName: 'customers/'+cid+'/adGroups/'+ag.adGroup.id,
      cpcBidMicros: 750000  // $0.75
    },
    updateMask: 'cpcBidMicros'
  }));

  const rr = await fetch('https://googleads.googleapis.com/v21/customers/'+cid+'/adGroups:mutate', {
    method:'POST', headers:h, body:JSON.stringify({operations:ops})
  });
  const dd = await rr.json();
  if (dd.results) process.stdout.write('✅ JK bid lowered to $0.75/click (was $1.50)\n');
  else process.stdout.write('❌ '+JSON.stringify(dd).slice(0,300)+'\n');
}

run().catch(e => process.stdout.write('ERROR: '+e.message+'\n'));
