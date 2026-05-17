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
      res.on('data', (c) => data += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(data) }); } catch { resolve({ status: res.statusCode, body: data }); } });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}
async function refreshToken() {
  const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: CREDS.refresh_token, client_id: CREDS.client_id, client_secret: CREDS.client_secret }).toString();
  const res = await httpRequest({ hostname: 'api.amazon.com', path: '/auth/o2/token', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } }, body);
  accessToken = res.body.access_token;
}
function apiGet(path) { return httpRequest({ hostname: API_HOST, path, method: 'GET', headers: { 'x-amz-access-token': accessToken, 'Content-Type': 'application/json' } }); }
function listingPath(sku) { return `/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(sku)}?marketplaceIds=${MARKETPLACE_ID}&includedData=attributes,summaries`; }
const bases = ['JLVM2018','JLRSCB-B','JLIA2018CC','B0GRGXMH6J','3511255793687','40517132648491','32924355592235'];
const suffixes = ['', '-FXVD', '-FXVB', '-FXBK', '-FXBL', '-Parent', '-PARENT', '-BLACK', '-B', '-BK'];
(async()=>{
  await refreshToken();
  for (const base of bases) {
    for (const suffix of suffixes) {
      const sku = `${base}${suffix}`;
      const res = await apiGet(listingPath(sku));
      if (res.status === 200) {
        const title = (((res.body.attributes||{}).item_name||[{}])[0].value || '');
        console.log(JSON.stringify({sku,status:res.status,title}));
      }
    }
  }
})();
