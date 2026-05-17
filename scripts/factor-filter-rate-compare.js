const https = require('https');

const SS_KEY = '338f293665d846778416b722efcb75a4';
const SS_SECRET = 'fed134d52a514c79be26be6c718aff99';
const ssAuth = Buffer.from(SS_KEY + ':' + SS_SECRET).toString('base64');

function httpReq(opts, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getRates(carrierCode, weight, dimL, dimW, dimH) {
  const payload = {
    carrierCode,
    fromPostalCode: '74107',
    toPostalCode: '10001',
    toCountry: 'US',
    weight: { value: weight, units: 'pounds' },
    dimensions: { length: dimL, width: dimW, height: dimH, units: 'inches' },
    confirmation: 'none',
    residential: true
  };
  const r = await httpReq({
    hostname: 'ssapi.shipstation.com',
    path: '/shipments/getrates',
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + ssAuth, 'Content-Type': 'application/json' }
  }, payload);
  if (r.statusCode === 200) return JSON.parse(r.body);
  console.error('Rate error ' + carrierCode + ':', r.statusCode, r.body.slice(0, 200));
  return [];
}

// Test box sizes that cover the range of filter products
const testBoxes = [
  { name: '10x20x1 case12', l: 20, w: 10, h: 12, wt: 4.17 },
  { name: '12x24x1 case12', l: 24, w: 12, h: 12, wt: 6 },
  { name: '16x25x1 case12', l: 25, w: 16, h: 12, wt: 8.33 },
  { name: '20x25x1 case12', l: 25, w: 20, h: 12, wt: 10.42 },
  { name: '12x24x2 case12', l: 24, w: 12, h: 24, wt: 12 },
  { name: '16x25x2 case12', l: 25, w: 16, h: 24, wt: 16.67 },
  { name: '20x25x2 case12', l: 25, w: 20, h: 24, wt: 20.83 },
  { name: '16x25x4 case6',  l: 25, w: 16, h: 24, wt: 16.67 },
  { name: '20x25x4 case6',  l: 25, w: 20, h: 24, wt: 20.83 },
  { name: '18x24x4 case6',  l: 24, w: 18, h: 24, wt: 18 },
  { name: '20x30x2 case12', l: 30, w: 20, h: 24, wt: 25 },
  { name: '20x35x2 case12', l: 35, w: 20, h: 24, wt: 29.17 },
];

(async () => {
  console.log('Box Size | FedEx Acct Ground | FedEx Acct Home Del | SS OneBalance Ground | SS OneBalance Home Del | Cheaper By');
  console.log('---|---|---|---|---|---');

  for (const box of testBoxes) {
    // Get rates from direct FedEx account
    const fedexRates = await getRates('fedex', box.wt, box.l, box.w, box.h);
    await sleep(1600);

    // Get rates from ShipStation FedEx One Balance
    const ssRates = await getRates('fedex_walleted', box.wt, box.l, box.w, box.h);
    await sleep(1600);

    const fedexGround = fedexRates.find(r => r.serviceCode === 'fedex_ground');
    const fedexHD = fedexRates.find(r => r.serviceCode === 'fedex_home_delivery');
    const ssGround = ssRates.find(r => r.serviceCode === 'fedex_ground');
    const ssHD = ssRates.find(r => r.serviceCode === 'fedex_home_delivery');

    const fgTotal = fedexGround ? (fedexGround.shipmentCost + fedexGround.otherCost).toFixed(2) : 'n/a';
    const fhTotal = fedexHD ? (fedexHD.shipmentCost + fedexHD.otherCost).toFixed(2) : 'n/a';
    const sgTotal = ssGround ? (ssGround.shipmentCost + ssGround.otherCost).toFixed(2) : 'n/a';
    const shTotal = ssHD ? (ssHD.shipmentCost + ssHD.otherCost).toFixed(2) : 'n/a';

    // Compare Home Delivery rates
    let cheaper = '';
    if (fhTotal !== 'n/a' && shTotal !== 'n/a') {
      const diff = parseFloat(fhTotal) - parseFloat(shTotal);
      if (diff > 0) cheaper = 'SS saves $' + diff.toFixed(2);
      else if (diff < 0) cheaper = 'FedEx saves $' + (-diff).toFixed(2);
      else cheaper = 'same';
    }

    console.log(box.name + ' | $' + fgTotal + ' | $' + fhTotal + ' | $' + sgTotal + ' | $' + shTotal + ' | ' + cheaper);
  }
})();
