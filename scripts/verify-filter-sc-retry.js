const {google} = require('googleapis');

const SITES = [
  'hvachomefilters.com',
  'besthomefilter.com',
  'besthvacfilter.com',
  'subscriptionfilter.com',
  'autoshipfilter.com',
  'bestofficefilter.com',
  'furnaceprefilter.com'
];

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

  const results = {};

  for (const domain of SITES) {
    console.log(`\n=== ${domain} ===`);
    const r = {verified: false, sitemap: false, error: null};
    try {
      // Verify
      try {
        await siteVerify.webResource.insert({
          requestBody: {site: {type: 'INET_DOMAIN', identifier: domain}},
          verificationMethod: 'DNS_TXT'
        });
        r.verified = true;
        console.log(`  ✅ VERIFIED`);
      } catch(e) {
        // Already verified is OK
        if (e.message.includes('already') || e.code === 400) {
          // try get
          try {
            await siteVerify.webResource.get({id: `dns://${domain}/`});
            r.verified = true;
            console.log(`  ✅ Already verified`);
          } catch(e2) {
            console.log(`  ❌ Verify: ${e.message.substring(0,120)}`);
            r.error = e.message.substring(0,120);
          }
        } else {
          console.log(`  ❌ Verify: ${e.message.substring(0,120)}`);
          r.error = e.message.substring(0,120);
        }
      }

      // Sitemap
      const scUrl = `sc-domain:${domain}`;
      try {
        await wm.sitemaps.submit({siteUrl: scUrl, feedpath: `https://${domain}/sitemap.xml`});
        r.sitemap = true;
        console.log(`  📋 Sitemap submitted (sc-domain)`);
      } catch(e) {
        try {
          await wm.sitemaps.submit({siteUrl: `https://${domain}/`, feedpath: `https://${domain}/sitemap.xml`});
          r.sitemap = true;
          console.log(`  📋 Sitemap submitted (URL prefix)`);
        } catch(e2) {
          console.log(`  ❌ Sitemap: ${e2.message.substring(0,120)}`);
        }
      }
    } catch(e) {
      console.log(`  ERROR: ${e.message.substring(0,120)}`);
      r.error = e.message.substring(0,120);
    }
    results[domain] = r;
    await new Promise(r => setTimeout(r, 1500));
  }

  // flatlinefilter — sitemap double-check
  console.log(`\n=== flatlinefilter.com (sitemap check) ===`);
  try {
    const scUrl = `sc-domain:flatlinefilter.com`;
    const list = await wm.sitemaps.list({siteUrl: scUrl});
    const maps = (list.data.sitemap || []).map(s => s.path);
    console.log(`  Existing sitemaps:`, maps);
    if (!maps.some(m => m.includes('sitemap.xml'))) {
      await wm.sitemaps.submit({siteUrl: scUrl, feedpath: `https://flatlinefilter.com/sitemap.xml`});
      console.log(`  📋 Submitted sitemap`);
    } else {
      console.log(`  ✅ Already submitted`);
    }
  } catch(e) {
    console.log(`  ❌ ${e.message.substring(0,150)}`);
  }

  console.log('\n=== SUMMARY ===');
  for (const [d, r] of Object.entries(results)) {
    console.log(`${d} | verified=${r.verified} | sitemap=${r.sitemap}`);
  }
}

run().catch(e => console.error('Fatal:', e.message));
