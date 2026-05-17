const https = require('https');
const {google} = require('googleapis');

const GODADDY_KEY = '9QCBbdvZc9n_N3jPNv71WzKBpDcn8XCmyV';
const GODADDY_SECRET = 'VVAAEQkkEyCVAtwqyCadwG';
const SITES = ['flatlinefilter.com'];

function godaddyRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {hostname:'api.godaddy.com',path,method,headers:{
      'Authorization':`sso-key ${GODADDY_KEY}:${GODADDY_SECRET}`,'Content-Type':'application/json'}};
    const req = https.request(opts, res => {let d='';res.on('data',c=>d+=c);res.on('end',()=>{
      if(res.statusCode>=200&&res.statusCode<300)resolve(d?JSON.parse(d):{});
      else reject(new Error(`${res.statusCode}: ${d.substring(0,200)}`));});});
    req.on('error',reject);if(body)req.write(JSON.stringify(body));req.end();});
}

async function run() {
  const auth = new google.auth.GoogleAuth({keyFile:'/home/ubuntu/.openclaw/workspace/.gcp-service-account.json',
    scopes:['https://www.googleapis.com/auth/webmasters','https://www.googleapis.com/auth/siteverification']});
  const client = await auth.getClient();
  const sv = google.siteVerification({version:'v1',auth:client});
  const wm = google.searchconsole({version:'v1',auth:client});
  for (const domain of SITES) {
    console.log(`=== ${domain} ===`);
    try {
      const tokenResp = await sv.webResource.getToken({
        requestBody:{site:{type:'INET_DOMAIN',identifier:domain},verificationMethod:'DNS_TXT'}});
      const token = tokenResp.data.token;
      console.log(`Token: ${token}`);
      try {
        await godaddyRequest('PATCH',`/v1/domains/${domain}/records`,
          [{type:'TXT',name:'@',data:token,ttl:600}]);
        console.log(`Added TXT`);
      } catch(e) {console.log(`GoDaddy: ${e.message.substring(0,120)}`);}
      console.log('Waiting 30s for DNS propagation...');
      await new Promise(r=>setTimeout(r,30000));
      try {
        await sv.webResource.insert({
          requestBody:{site:{type:'INET_DOMAIN',identifier:domain}},verificationMethod:'DNS_TXT'});
        console.log(`✅ VERIFIED`);
      } catch(e) {console.log(`Verify: ${e.message.substring(0,150)}`);}
      try {
        await wm.sitemaps.submit({siteUrl:`sc-domain:${domain}`,feedpath:`https://${domain}/sitemap.xml`});
        console.log(`📋 Sitemap submitted (sc-domain)`);
      } catch(e) {
        try {
          await wm.sitemaps.submit({siteUrl:`https://${domain}/`,feedpath:`https://${domain}/sitemap.xml`});
          console.log(`📋 Sitemap submitted (URL prefix)`);
        } catch(e2){console.log(`Sitemap: ${e2.message.substring(0,150)}`);}
      }
    } catch(e) {console.log(`ERROR: ${e.message.substring(0,200)}`);}
  }
}
run().catch(e=>console.error('Fatal:',e.message));
