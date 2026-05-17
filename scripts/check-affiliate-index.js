const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: '.gcp-service-account.json',
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
});

const sites = [
'whatarebest.com','bestseatcover.com','jeepseatcover.com','bestbroncoaccessories.com',
'besttruckaccessories.com','besttonneaucovers.com','bestcordlesstools.com','bestfirestick.com',
'bestmeshwifi.com','bestgarageorganizer.com','bestinstantpot.com','bestsmokergrill.com',
'tacticalseatcovers.com','wranglerseatcover.com','jlseatcovers.com','tacomaseats.com',
'bestoffroadbrands.com','broncograbhandles.com','homehvacfilters.com','bestwindshieldwiper.com',
'autopartsreviewed.com','topoffroadstores.com','gladiatorseatcover.com','broncoseatcover.com',
'tacticalseats.com'
];

async function run() {
  const client = await auth.getClient();
  const wm = google.searchconsole({version:'v1', auth: client});
  
  const props = await wm.sites.list();
  const siteList = (props.data.siteEntry || []).map(s => s.siteUrl);
  console.log('=== SEARCH CONSOLE PROPERTIES ===');
  siteList.forEach(s => console.log('  ', s));
  
  console.log('\n=== AFFILIATE SITE STATUS (Apr 4-17) ===');
  for (const site of sites) {
    const scUrl = siteList.find(u => u.includes(site));
    let status = 'NOT in Search Console';
    
    if (scUrl) {
      try {
        const res = await wm.searchanalytics.query({
          siteUrl: scUrl,
          requestBody: {startDate: '2026-04-04', endDate: '2026-04-17', dimensions: [], type: 'web'}
        });
        const r = res.data.rows && res.data.rows[0];
        if (r) {
          status = 'IN SC | Clicks: ' + r.clicks + ' | Imp: ' + r.impressions + ' | Pos: ' + r.position.toFixed(1);
        } else {
          status = 'IN SC | No search data yet';
        }
      } catch(e) {
        status = 'IN SC | Error: ' + e.message.substring(0,60);
      }
    }
    console.log(site.padEnd(30), status);
  }
}
run().catch(e => console.error(e.message));
