#!/usr/bin/env node
// High-Yield Affiliate Domain Research
// 1. Generates candidate domains in HIGH-COMMISSION categories (4.5%+)
// 2. Checks GoDaddy availability
// 3. Outputs vetted list ready for SERP verification

const https = require('https');
const fs = require('fs');

const GODADDY_KEY = '9QCBbdvZc9n_N3jPNv71WzKBpDcn8XCmyV';
const GODADDY_SECRET = 'VVAAEQkkEyCVAtwqyCadwG';
const AUTH = `sso-key ${GODADDY_KEY}:${GODADDY_SECRET}`;

// HIGH-YIELD candidate domains organized by commission tier
const candidates = {
  'Luxury Beauty (10%)': [
    'bestluxuryperfume', 'bestnicheperfume', 'bestluxuryskincare', 'bestluxurymakeup',
    'bestdesignerfragrance', 'bestluxuryfragrance', 'bestluxurycologne', 'bestnichefragrance',
    'bestluxurylotion', 'bestluxuryserum', 'bestluxuryeyecream', 'bestluxuryfacecream',
    'bestmensluxurycologne', 'bestwomensluxuryperfume', 'bestluxuryhaircare',
    'bestluxurylipstick', 'bestluxuryfoundation', 'bestluxurymascara', 'bestluxurybeauty'
  ],
  'Kitchen (4.5%)': [
    'bestespressomachine', 'beststandmixer', 'bestsousvide', 'bestrangehood',
    'bestcoffeegrinder', 'bestimmersionblender', 'bestpastamaker', 'bestdutchoven',
    'bestcookwareset', 'bestnonstickpan', 'bestcastironskillet', 'bestknifeset',
    'bestbreadmaker', 'bestricecooker', 'bestfoodprocessor', 'bestjuicer',
    'bestpelletgrill', 'bestoutdoorkitchen', 'bestmeatgrinder', 'bestvacuumsealer',
    'bestmilkfrother', 'bestautodripcoffeemaker', 'bestpressurecooker', 'besttoasteroven',
    'bestwaffleiron', 'bestelectrickettle', 'bestcoffeemaker', 'bestkitchenscale'
  ],
  'Automotive (4.5%)': [
    'bestcarwashkit', 'bestcarwax', 'bestbatterycharger', 'bestdashcam',
    'bestjumpstarter', 'bestcardetailing', 'bestcarpolisher', 'bestobd2scanner',
    'besttireinflator', 'bestcarvacuum', 'bestcarcover', 'bestrooftopcargo',
    'bestcarseatcover', 'bestfloormats', 'bestcarphone-mount', 'bestbacku-pcamera',
    'besttowingstrap', 'bestleafblower', 'bestpressurewasher', 'bestcarcleaningkit',
    'bestbikeracksuv', 'besttruckbedliner', 'bestautomotivetools', 'besttirepatch',
    'bestmotoroil', 'bestairfreshener-car', 'bestwiperblades', 'bestheadlightrestoration'
  ],
  'Furniture/Home (3% high-$)': [
    'beststandingdesk', 'bestofficechair', 'bestmattress2026', 'bestrecliner',
    'bestsectionalsofa', 'bestbedframe', 'bestdiningtable', 'bestkingmattress',
    'bestmemoryfoammattress', 'bestadjustablebed', 'bestdesk-chair', 'bestmasagechair',
    'bestpatiofurniture', 'bestoutdoorsofa', 'bestmurphybed', 'bestplatformbed',
    'bestnightstands', 'bestbookshelves', 'bestbarstools', 'bestbarcabinet'
  ],
  'Tools (3% high-$)': [
    'bestcordlessdrill', 'bestmitersaw', 'besttablesaw', 'besttoolchest',
    'bestgenerator', 'bestpressurewasher2026', 'bestbenchgrinder', 'bestrouter-tool',
    'bestairsander', 'bestnailgun', 'bestjigsaw', 'bestreciprocatingsaw',
    'bestplaner', 'bestdrumsander', 'bestbandsaw', 'bestcombinationsquare',
    'bestlevelset', 'beststudfinder', 'bestlasermeasure', 'bestmultitool'
  ]
};

function checkAvailability(domain) {
  return new Promise((resolve) => {
    const fullDomain = domain + '.com';
    const req = https.request({
      hostname: 'api.godaddy.com',
      path: `/v1/domains/available?domain=${fullDomain}&checkType=FAST`,
      method: 'GET',
      headers: { 'Authorization': AUTH, 'Accept': 'application/json' },
      timeout: 10000
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const r = JSON.parse(data);
          resolve({
            domain: fullDomain,
            available: r.available === true,
            price: r.price ? r.price / 1000000 : null,
            currency: r.currency || 'USD'
          });
        } catch {
          resolve({ domain: fullDomain, available: false, error: 'parse' });
        }
      });
    });
    req.on('error', () => resolve({ domain: fullDomain, available: false, error: 'net' }));
    req.on('timeout', () => { req.destroy(); resolve({ domain: fullDomain, available: false, error: 'timeout' }); });
    req.end();
  });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const results = {};
  
  for (const [category, domains] of Object.entries(candidates)) {
    console.log(`\n📂 ${category} (${domains.length} candidates)`);
    console.log('─'.repeat(60));
    results[category] = [];
    
    for (const domain of domains) {
      const r = await checkAvailability(domain);
      const icon = r.available ? '✅' : '❌';
      const priceTag = r.price ? `$${r.price.toFixed(2)}` : '';
      console.log(`  ${icon} ${r.domain.padEnd(35)} ${priceTag}`);
      results[category].push(r);
      await sleep(150); // Rate limit
    }
  }
  
  // Save results
  fs.writeFileSync(
    '/home/ubuntu/.openclaw/workspace/memory/high-yield-domain-availability.json',
    JSON.stringify(results, null, 2)
  );
  
  // Print summary of available domains
  console.log('\n\n🏆 AVAILABLE HIGH-YIELD DOMAINS (sorted by commission tier):\n');
  console.log('═'.repeat(80));
  
  for (const [category, domains] of Object.entries(results)) {
    const available = domains.filter(d => d.available && (!d.price || d.price <= 20));
    if (available.length === 0) continue;
    
    console.log(`\n${category}:`);
    available.forEach(d => {
      console.log(`  ${d.domain.padEnd(40)} $${(d.price || 12.99).toFixed(2)}/yr`);
    });
  }
  
  const totalAvailable = Object.values(results).flat().filter(d => d.available).length;
  console.log(`\n\n✅ Total available: ${totalAvailable} domains`);
  console.log(`📁 Saved to: memory/high-yield-domain-availability.json`);
  console.log(`\nNext step: Run SERP check on the available ones to confirm Amazon ranks top 5`);
}

main().catch(e => console.error('Error:', e));
