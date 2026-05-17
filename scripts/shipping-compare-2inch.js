const https = require('https');
const SS_KEY = '338f293665d846778416b722efcb75a4';
const SS_SECRET = 'fed134d52a514c79be26be6c718aff99';
const ssAuth = Buffer.from(SS_KEY + ':' + SS_SECRET).toString('base64');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getRate(weightLbs, dimL, dimW, dimH) {
  const payload = {
    carrierCode: 'fedex',
    serviceCode: 'fedex_home_delivery',
    fromPostalCode: '74107',
    toPostalCode: '10001',
    toCountry: 'US',
    weight: { value: weightLbs, units: 'pounds' },
    dimensions: { length: dimL, width: dimW, height: dimH, units: 'inches' },
    confirmation: 'none',
    residential: true
  };
  const body = JSON.stringify(payload);
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'ssapi.shipstation.com',
      path: '/shipments/getrates',
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + ssAuth, 'Content-Type': 'application/json' }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const rates = JSON.parse(data);
          const hd = rates.find(r => r.serviceCode === 'fedex_home_delivery');
          resolve(hd ? (hd.shipmentCost + hd.otherCost) : null);
        } else resolve(null);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  // 2" filters — compare case of 12 (24" stack) vs case of 6 (12" stack)
  const sizes = [
    { name: '12x24x2', w: 12, h: 24 },
    { name: '16x20x2', w: 16, h: 20 },
    { name: '16x25x2', w: 16, h: 25 },
    { name: '18x24x2', w: 18, h: 24 },
    { name: '18x25x2', w: 18, h: 25 },
    { name: '20x20x2', w: 20, h: 20 },
    { name: '20x24x2', w: 20, h: 24 },
    { name: '20x25x2', w: 20, h: 25 },
    { name: '20x30x2', w: 20, h: 30 },
  ];

  console.log('2" Filter Shipping: Case of 12 vs Case of 6');
  console.log('(FedEx Home Delivery, Zone 8, Tulsa OK -> NYC)');
  console.log('');
  console.log('Size | Box 12 (LxWxH) | Ship 12 | Ship/ea 12 | Box 6 (LxWxH) | Ship 6 | Ship/ea 6 | Savings/ea');
  console.log('---|---|---|---|---|---|---|---');

  for (const s of sizes) {
    const boxL = Math.max(s.w, s.h);
    const boxW = Math.min(s.w, s.h);
    
    // Case of 12: stack height = 12 * 2" = 24"
    const box12H = 24;
    const weight12 = 15; // estimate ~1.25 lbs per 2" filter
    
    // Case of 6: stack height = 6 * 2" = 12"
    const box6H = 12;
    const weight6 = 8; // estimate
    
    const rate12 = await getRate(weight12, boxL, boxW, box12H);
    await sleep(1500);
    const rate6 = await getRate(weight6, boxL, boxW, box6H);
    await sleep(1500);
    
    const perEa12 = rate12 ? (rate12 / 12).toFixed(2) : '?';
    const perEa6 = rate6 ? (rate6 / 6).toFixed(2) : '?';
    const savings = (rate12 && rate6) ? ((rate6/6) - (rate12/12)).toFixed(2) : '?';
    
    console.log(`${s.name} | ${boxL}x${boxW}x${box12H} | $${rate12?.toFixed(2)||'?'} | $${perEa12} | ${boxL}x${boxW}x${box6H} | $${rate6?.toFixed(2)||'?'} | $${perEa6} | $${savings}`);
  }
})();
