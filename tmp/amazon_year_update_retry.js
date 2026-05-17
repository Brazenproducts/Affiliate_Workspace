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
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function token() {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: creds.refresh_token,
    client_id: creds.client_id,
    client_secret: creds.client_secret,
  }).toString();
  const res = await req({ hostname:'api.amazon.com', path:'/auth/o2/token', method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(body)}}, body);
  if (res.status !== 200) throw new Error('token failed ' + JSON.stringify(res.body));
  accessToken = res.body.access_token;
}

function api(path, method='GET', bodyObj) {
  const body = bodyObj ? JSON.stringify(bodyObj) : null;
  return req({ hostname:API_HOST, path, method, headers:{ 'x-amz-access-token': accessToken, 'content-type':'application/json', ...(body ? {'content-length': Buffer.byteLength(body)} : {}) } }, body);
}

function enc(s) { return encodeURIComponent(s); }

async function getListing(sku) {
  return api(`/listings/2021-08-01/items/${SELLER_ID}/${enc(sku)}?marketplaceIds=${MARKETPLACE_ID}&includedData=attributes,issues,summaries`);
}

async function patchTitle(sku, productType, title) {
  return api(`/listings/2021-08-01/items/${SELLER_ID}/${enc(sku)}?marketplaceIds=${MARKETPLACE_ID}`,'PATCH',{
    productType,
    patches:[{ op:'replace', path:'/attributes/item_name', value:[{ value:title, marketplace_id:MARKETPLACE_ID }] }]
  });
}

async function catalogByAsin(asin) {
  return api(`/catalog/2022-04-01/items?marketplaceIds=${MARKETPLACE_ID}&identifiers=${encodeURIComponent(asin)}&identifiersType=ASIN&includedData=attributes,summaries&sellerId=${SELLER_ID}`);
}

(async () => {
  await token();
  const known = [
    { asin:'B0845ZKPMH', sku:'JLVM2019FG', fallbackSkus:['JLVM2018','JLVM2018FG'], desired:'Bartact Compatible with Wrangler 2018+ Visor Covers with PALS - MOLLE - (Mirrored Visors with Internal Garage Door Opener only (Graphite)' },
    { asin:'B07MVPR33F', sku:'C8-GIDS-XZ5F', fallbackSkus:['JLRSCB-B'], desired:'Bartact Compatible with Wrangler 2018+ JLU Rear Storage Compartment Tool Bag' },
    { asin:'B09LHVSX44', sku:'DLSP2B-PARENT', fallbackSkus:['DLSP2BR-FXVD','DLSP2BR'], desired:null },
    { asin:'B0845P53LT', sku:'JTIA2019CCGB', fallbackSkus:['JLIA2018CC','JTIA2019CC','JTIA2019CCG','JTIA2019CCGB-FXVD'], desired:'Bartact Compatible with 2019+ Gladiator Padded Center Console Arm Rest Cover (Graphite/Black)' },
  ];
  const unknownAsins = ['B0GRGXMH6J','B0GS2G761B','B0GS2TDXDV','B0GS2H3VPY','B0GS238N5R','B0GS28P4HJ','B0GS36RC7X'];

  const out = { known: [], unknown: [] };

  for (const item of known) {
    const tried = [];
    let found = null;
    for (const sku of [item.sku, ...item.fallbackSkus]) {
      const res = await getListing(sku);
      tried.push({ sku, status: res.status, body: res.body });
      if (res.status === 200) { found = { sku, res }; break; }
    }
    const row = { asin:item.asin, requestedSku:item.sku, tried: tried.map(t => ({ sku:t.sku, status:t.status })) };
    if (!found) {
      row.result = 'not_found';
      out.known.push(row);
      continue;
    }
    const body = found.res.body;
    const productType = body.productType || 'PRODUCT';
    const title = body.attributes?.item_name?.[0]?.value || null;
    row.resolvedSku = found.sku;
    row.productType = productType;
    row.currentTitle = title;
    if (item.asin === 'B09LHVSX44' && title) {
      row.desiredTitle = title.replace(/1987-2021/g, '1987+').replace(/1987 to 2021/g, '1987+');
    } else {
      row.desiredTitle = item.desired;
    }
    if (row.desiredTitle && row.desiredTitle !== title) {
      const patch = await patchTitle(found.sku, productType, row.desiredTitle);
      row.patchStatus = patch.status;
      row.patchBody = patch.body;
    } else {
      row.patchStatus = 'skipped';
    }
    out.known.push(row);
  }

  for (const asin of unknownAsins) {
    const cat = await catalogByAsin(asin);
    const row = { asin, catalogStatus: cat.status };
    if (cat.status === 200) {
      row.catalogBody = cat.body;
    } else {
      row.catalogError = cat.body;
    }
    out.unknown.push(row);
  }

  console.log(JSON.stringify(out, null, 2));
})().catch(err => { console.error(err); process.exit(1); });
