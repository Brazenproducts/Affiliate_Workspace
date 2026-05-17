const https = require('https');
const fs = require('fs');
const creds = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json'));

function refreshToken() {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({client_id:creds.client_id,client_secret:creds.client_secret,refresh_token:creds.refresh_token,grant_type:'refresh_token'});
    const body = params.toString();
    const req = https.request({hostname:'oauth2.googleapis.com',path:'/token',method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'}},res=>{
      let d='';res.on('data',c=>d+=c);res.on('end',()=>{
        const j=JSON.parse(d);
        if(j.access_token) resolve(j.access_token);
        else reject(new Error(d));
      });
    });
    req.write(body);req.end();
  });
}

function gaQuery(token, query) {
  const custId = creds.customer_id || creds.customerId;
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname:'googleads.googleapis.com',
      path:`/v23/customers/${custId}/googleAds:searchStream`,
      method:'POST',
      headers:{
        'Authorization':'Bearer '+token,
        'developer-token':creds.dev_token,
        'Content-Type':'application/json'
      }
    },res=>{
      let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve(JSON.parse(d)));
    });
    req.write(JSON.stringify({query}));req.end();
  });
}

function gaMutate(token, operations) {
  const custId = creds.customer_id || creds.customerId;
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname:'googleads.googleapis.com',
      path:`/v23/customers/${custId}/campaigns:mutate`,
      method:'POST',
      headers:{
        'Authorization':'Bearer '+token,
        'developer-token':creds.dev_token,
        'Content-Type':'application/json'
      }
    },res=>{
      let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve(JSON.parse(d)));
    });
    req.write(JSON.stringify({operations}));req.end();
  });
}

async function main() {
  const token = await refreshToken();
  
  // Find Brand Defense campaign
  const result = await gaQuery(token, "SELECT campaign.id, campaign.name, campaign.status FROM campaign WHERE campaign.name LIKE '%Brand%Defense%'");
  console.log('Search result:', JSON.stringify(result, null, 2));
  
  if (result[0] && result[0].results) {
    for (const r of result[0].results) {
      const id = r.campaign.id;
      const name = r.campaign.name;
      const status = r.campaign.status;
      console.log(`Found: ${name} (ID: ${id}, Status: ${status})`);
      
      if (status === 'ENABLED') {
        const custId = creds.customer_id || creds.customerId;
        const mutResult = await gaMutate(token, [{
          update: {
            resourceName: `customers/${custId}/campaigns/${id}`,
            status: 'PAUSED'
          },
          updateMask: 'status'
        }]);
        console.log('Pause result:', JSON.stringify(mutResult));
      }
    }
  }
}

main().catch(e => console.error('Error:', e.message));
