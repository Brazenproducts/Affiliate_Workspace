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
    scopes: ['https://www.googleapis.com/auth/webmasters']
  });
  const client = await auth.getClient();
  const wm = google.searchconsole({version: 'v1', auth: client});

  // List current properties
  const props = await wm.sites.list();
  const existing = (props.data.siteEntry || []).map(s => s.siteUrl);
  console.log('Properties now:', existing.length);
  
  let submitted = 0;
  for (const domain of SITES) {
    const scDomain = `sc-domain:${domain}`;
    const httpsUrl = `https://${domain}/`;
    
    // Try sc-domain first, then https prefix
    for (const siteUrl of [scDomain, httpsUrl]) {
      try {
        await wm.sitemaps.submit({siteUrl, feedpath: `https://${domain}/sitemap.xml`});
        console.log(`✅ ${domain} — sitemap submitted via ${siteUrl}`);
        submitted++;
        break;
      } catch(e) {
        const msg = e.message.substring(0,60);
        if (siteUrl === httpsUrl) console.log(`❌ ${domain} — ${msg}`);
      }
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log(`\n=== ${submitted}/25 sitemaps submitted ===`);
}

run().catch(e => console.error('Fatal:', e.message));
