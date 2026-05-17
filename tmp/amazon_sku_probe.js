const https = require('https');
const fs = require('fs');
const creds = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.amazon-bartact-credentials.json','utf8'));
const SELLER_ID = creds.seller_id;
const MARKETPLACE_ID = creds.marketplace_id;
const API_HOST = 'sellingpartnerapi-na.amazon.com';
let accessToken;

function req(options, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        let parsed = data;
        try { parsed = JSON.parse(data); } catch {}
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}
async function token() {
  const body = new URLSearchParams({ grant_type:'refresh_token', refresh_token:creds.refresh_token, client_id:creds.client_id, client_secret:creds.client_secret }).toString();
  const res = await req({ hostname:'api.amazon.com', path:'/auth/o2/token', method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(body)}}, body);
  accessToken = res.body.access_token;
}
function api(path) {
  return req({ hostname:API_HOST, path, method:'GET', headers:{'x-amz-access-token': accessToken, 'content-type':'application/json'} });
}
function enc(s) { return encodeURIComponent(s); }
async function getListing(sku) {
  return api(`/listings/2021-08-01/items/${SELLER_ID}/${enc(sku)}?marketplaceIds=${MARKETPLACE_ID}&includedData=attributes,summaries`);
}

(async () => {
  await token();
  const candidates = {
    B0GRGXMH6J: ['B0GRGXMH6J','713937','713937806','713937806330','00713937806330','0713937806330','JL2DSUNSHADE','JL2DSHADE'],
    B0GS2G761B: ['B0GS2G761B','32924355592235'],
    B0GS2TDXDV: ['B0GS2TDXDV','3511255793687'],
    B0GS2H3VPY: ['B0GS2H3VPY','40517132648491'],
    B0GS238N5R: ['B0GS238N5R','713937805654','00713937805654','0713937805654'],
    B0GS28P4HJ: ['B0GS28P4HJ','713937806040','00713937806040','0713937806040'],
    B0GS36RC7X: ['B0GS36RC7X','713937806330','00713937806330','0713937806330']
  };
  const out = {};
  for (const [asin, skus] of Object.entries(candidates)) {
    out[asin] = [];
    for (const sku of skus) {
      const res = await getListing(sku);
      out[asin].push({ sku, status: res.status, title: res.body?.attributes?.item_name?.[0]?.value || null });
    }
  }
  console.log(JSON.stringify(out, null, 2));
})().catch(err => { console.error(err); process.exit(1); });
