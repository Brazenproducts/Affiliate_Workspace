const https = require('https');
const {google} = require('googleapis');

const GODADDY_KEY = '9QCBbdvZc9n_N3jPNv71WzKBpDcn8XCmyV';
const GODADDY_SECRET = 'VVAAEQkkEyCVAtwqyCadwG';

const SITES = [
  'whatarebest.com','bestseatcover.com','jeepseatcover.com','bestbroncoaccessories.com',
  'besttruckaccessories.com','besttonneaucovers.com','bestcordlesstools.com','bestfirestick.com',
  'bestmeshwifi.com','bestgarageorganizer.com','bestinstantpot.com','bestsmokergrill.com',
  'tacticalseatcovers.com','wranglerseatcover.com','jlseatcovers.com','tacomaseats.com',
  'bestoffroadbrands.com','broncograbhandles.com','homehvacfilters.com','bestwindshieldwiper.com',
  'autopartsreviewed.com','topoffroadstores.com','gladiatorseatcover.com','broncoseatcover.com',
  'tacticalseats.com',
  'bestmagnesiumglycinate.com','bestnecklifttape.com','bestportable-charger.com',
  'bestheating-pad.com','bestvibrationplate.com','bestresistance-bands.com',
  'bestprotein-powder.com','bestmini-fridge.com','bestmassage-gun.com',
  'bestgaming-chair.com','bestice-maker.com','besttirepatch.com','besttowingstrap.com','bestportable-ac.com',
  'bestpower-bank.com','bestlabel-maker.com','bestshower-head.com',
];

function godaddyRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.godaddy.com',
      path,
      method,
      headers: {
        'Authorization': `sso-key ${GODADDY_KEY}:${GODADDY_SECRET}`,
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(d ? JSON.parse(d) : {});
        else reject(new Error(`${res.statusCode}: ${d.substring(0,200)}`));
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  const auth = new google.auth.GoogleAuth({
    keyFile: '.gcp-service-account.json',
    scopes: [
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/siteverification'
    ]
  });
  const client = await auth.getClient();
  const siteVerify = google.siteVerification({version: 'v1', auth: client});
  const wm = google.searchconsole({version: 'v1', auth: client});

  for (const domain of SITES) {
    console.log(`\n=== ${domain} ===`);
    try {
      // Step 1: Get verification token
      const tokenResp = await siteVerify.webResource.getToken({
        requestBody: {
          site: {type: 'INET_DOMAIN', identifier: domain},
          verificationMethod: 'DNS_TXT'
        }
      });
      const token = tokenResp.data.token;
      console.log(`  Token: ${token}`);

      // Step 2: Add DNS TXT record via GoDaddy
      try {
        let existingTxt = [];
        try {
          existingTxt = await godaddyRequest('GET', `/v1/domains/${domain}/records/TXT`);
        } catch(e) {}
        
        if (Array.isArray(existingTxt) && existingTxt.some(r => r.data === token)) {
          console.log(`  TXT record already exists`);
        } else {
          await godaddyRequest('PATCH', `/v1/domains/${domain}/records`, [
            {type: 'TXT', name: '@', data: token, ttl: 600}
          ]);
          console.log(`  Added TXT record`);
        }
      } catch(e) {
        console.log(`  GoDaddy error: ${e.message.substring(0,100)}`);
        continue;
      }

      // Step 3: Wait for propagation then verify
      await new Promise(r => setTimeout(r, 5000));
      
      try {
        const result = await siteVerify.webResource.insert({
          requestBody: {
            site: {type: 'INET_DOMAIN', identifier: domain}
          },
          verificationMethod: 'DNS_TXT'
        });
        console.log(`  ✅ VERIFIED`);
      } catch(e) {
        console.log(`  Verify attempt: ${e.message.substring(0,100)}`);
      }

      // Step 4: Submit sitemap
      const scUrl = `sc-domain:${domain}`;
      try {
        await wm.sitemaps.submit({siteUrl: scUrl, feedpath: `https://${domain}/sitemap.xml`});
        console.log(`  📋 Sitemap submitted`);
      } catch(e) {
        // Try HTTPS URL prefix instead
        try {
          await wm.sitemaps.submit({siteUrl: `https://${domain}/`, feedpath: `https://${domain}/sitemap.xml`});
          console.log(`  📋 Sitemap submitted (URL prefix)`);
        } catch(e2) {
          console.log(`  Sitemap: ${e2.message.substring(0,80)}`);
        }
      }

    } catch(e) {
      console.log(`  ERROR: ${e.message.substring(0,100)}`);
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n=== ALL DONE ===');
}

run().catch(e => console.error('Fatal:', e.message));
