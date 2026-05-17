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
    scopes: ['https://www.googleapis.com/auth/indexing']
  });
  const client = await auth.getClient();
  const indexing = google.indexing({version: 'v3', auth: client});

  let ok = 0, fail = 0;
  for (const domain of SITES) {
    const url = `https://${domain}/`;
    try {
      await indexing.urlNotifications.publish({
        requestBody: {url, type: 'URL_UPDATED'}
      });
      console.log(`✅ ${domain}`);
      ok++;
    } catch(e) {
      console.log(`❌ ${domain} — ${e.message.substring(0,80)}`);
      fail++;
    }
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`\n=== ${ok} submitted, ${fail} failed ===`);
}

run().catch(e => console.error('Fatal:', e.message));
