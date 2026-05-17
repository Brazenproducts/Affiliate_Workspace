const https = require('https');
const fs = require('fs');

const CREDS = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.amazon-bartact-credentials.json', 'utf8'));
const SELLER_ID = CREDS.seller_id;
const MARKETPLACE_ID = CREDS.marketplace_id;
const API_HOST = 'sellingpartnerapi-na.amazon.com';

let accessToken = null;
function httpRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}
async function refreshToken() {
  const body = new URLSearchParams({
    grant_type: 'refresh_token', refresh_token: CREDS.refresh_token, client_id: CREDS.client_id, client_secret: CREDS.client_secret,
  }).toString();
  const res = await httpRequest({ hostname: 'api.amazon.com', path: '/auth/o2/token', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } }, body);
  accessToken = res.body.access_token;
}
function apiGet(path) {
  return httpRequest({ hostname: API_HOST, path, method: 'GET', headers: { 'x-amz-access-token': accessToken, 'Content-Type': 'application/json' } });
}
function listingPath(sku) {
  return `/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(sku)}?marketplaceIds=${MARKETPLACE_ID}&includedData=attributes,summaries`;
}
const candidates = [
  'JLVM2018','JLVM2018-FXVD','JLRSCB-B','JLRSCB-B-FXVD','TAOGHUPBB','TAOGHUPBB-FXVD','DLSP2BR','DLSP2BR-FXVD','JLIA2018CC','JLIA2018CC-FXVD',
  '32924355592235','3511255793687','40517132648491','41154166390827','6949960417323','40774943277099','JL2DSUNSHADE','B0GRGXMH6J'
];
(async()=>{
  await refreshToken();
  for (const sku of candidates) {
    const res = await apiGet(listingPath(sku));
    const title = res.status===200 ? (((res.body.attributes||{}).item_name||[{}])[0].value || '') : '';
    console.log(JSON.stringify({sku,status:res.status,title}));
  }
})();
