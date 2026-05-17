#!/usr/bin/env node
// Check GoDaddy domain availability for niche review site network
// Run at 9 AM PST — reports back to Mitch

const https = require('https');

const GODADDY_KEY = '9QCBbdvZc9n_N3jPNv71WzKBpDcn8XCmyV';
const GODADDY_SECRET = 'VVAAEQkkEyCVAtwqyCadwG';

const candidates = {
  'Auto/Mechanic': [
    'honestmechanic.com', 'skiptheupsell.com', 'fairshop.com',
    'notmymechanic.com', 'trustedmechanic.com', 'honestyautorepair.com',
    'straightshooterautoshop.com', 'nowrenchrequired.com'
  ],
  'Dentist': [
    'skipthedrill.com', 'fairdentist.com', 'nodrillupsell.com',
    'honestdentist.com', 'straightteeth.com', 'nodentistupsell.com'
  ],
  'Landlord/Rental': [
    'rateyourlandlord.com', 'tenantreview.com', 'honestlandlord.com',
    'renterreviews.com', 'landlordtruth.com', 'mylandlordreview.com'
  ],
  'Hotel': [
    'skiptheresortfee.com', 'nohiddenfees.com', 'fairhotel.com',
    'hoteltruth.com', 'noresortfee.com', 'nohotelhiddenfees.com'
  ],
  'Salon/Barber': [
    'stillagoodcut.com', 'freshcutreviews.com', 'honestbarber.com',
    'salontruth.com', 'goodcutreviews.com', 'myhairreviews.com'
  ],
  'Gym': [
    'honestgym.com', 'easycancelgym.com', 'gymtruth.com',
    'nodirtygym.com', 'skipthegymfee.com', 'gymreviewer.com'
  ],
  'Contractor': [
    'fairquote.com', 'honestcontractor.com', 'contractortruth.com',
    'nosurprisebills.com', 'trustycontractor.com', 'fairhandyman.com'
  ]
};

function checkDomain(domain) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.godaddy.com',
      path: `/v1/domains/available?domain=${domain}`,
      method: 'GET',
      headers: {
        'Authorization': `sso-key ${GODADDY_KEY}:${GODADDY_SECRET}`,
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            domain,
            available: json.available,
            price: json.price ? `$${(json.price / 1000000).toFixed(2)}` : 'N/A',
            currency: json.currency || 'USD'
          });
        } catch(e) {
          resolve({ domain, available: false, price: 'error' });
        }
      });
    });
    req.on('error', () => resolve({ domain, available: false, price: 'error' }));
    req.setTimeout(5000, () => { req.destroy(); resolve({ domain, available: false, price: 'timeout' }); });
    req.end();
  });
}

async function main() {
  console.log('🔍 Checking domain availability for niche review site network...\n');
  
  const results = {};
  
  for (const [category, domains] of Object.entries(candidates)) {
    console.log(`\n=== ${category} ===`);
    results[category] = [];
    
    for (const domain of domains) {
      // Rate limit: 60 req/min = 1/sec
      await new Promise(r => setTimeout(r, 1100));
      const result = await checkDomain(domain);
      const status = result.available ? `✅ AVAILABLE — ${result.price}` : '❌ taken';
      console.log(`  ${domain}: ${status}`);
      if (result.available) results[category].push({ domain, price: result.price });
    }
  }

  console.log('\n\n══════════════════════════════════════');
  console.log('📋 AVAILABLE DOMAINS SUMMARY');
  console.log('══════════════════════════════════════\n');
  
  let totalAvailable = 0;
  for (const [category, available] of Object.entries(results)) {
    if (available.length > 0) {
      console.log(`${category}:`);
      available.forEach(d => console.log(`  → ${d.domain} (${d.price})`));
      totalAvailable += available.length;
    }
  }
  
  console.log(`\nTotal available: ${totalAvailable} domains`);
  console.log('\nReady for Mitch to pick. Grab them at godaddy.com or I can buy via API.');
}

main().catch(console.error);
