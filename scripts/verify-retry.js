const {google} = require('googleapis');

const SITES = [
  'whatarebest.com','bestseatcover.com','jeepseatcover.com','bestbroncoaccessories.com',
  'besttruckaccessories.com','besttonneaucovers.com','bestcordlesstools.com','bestfirestick.com',
  'bestmeshwifi.com','bestgarageorganizer.com','bestinstantpot.com','bestsmokergrill.com',
  'tacticalseatcovers.com','wranglerseatcover.com','jlseatcovers.com','tacomaseats.com',
  'bestoffroadbrands.com','broncograbhandles.com','homehvacfilters.com','bestwindshieldwiper.com',
  'autopartsreviewed.com','topoffroadstores.com','gladiatorseatcover.com','broncoseatcover.com',
  'tacticalseats.com'
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

  let verified = 0, failed = 0;

  for (const domain of SITES) {
    try {
      const result = await siteVerify.webResource.insert({
        requestBody: {
          site: {type: 'INET_DOMAIN', identifier: domain}
        },
        verificationMethod: 'DNS_TXT'
      });
      console.log(`✅ ${domain} — VERIFIED`);
      verified++;

      // Submit sitemap
      try {
        await wm.sitemaps.submit({siteUrl: `sc-domain:${domain}`, feedpath: `https://${domain}/sitemap.xml`});
        console.log(`   📋 Sitemap submitted`);
      } catch(e) {
        console.log(`   Sitemap: ${e.message.substring(0,60)}`);
      }
    } catch(e) {
      console.log(`❌ ${domain} — ${e.message.substring(0,80)}`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n=== RESULTS: ${verified} verified, ${failed} failed ===`);
}

run().catch(e => console.error('Fatal:', e.message));
