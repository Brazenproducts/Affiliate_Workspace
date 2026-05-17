// Use Google Search Console to check which of our domains already have impressions
// That's the best real signal we have right now
const {google} = require('googleapis');

async function run() {
  const auth = new google.auth.GoogleAuth({
    keyFile: '/home/ubuntu/.openclaw/workspace/.gcp-service-account.json',
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
  });
  const client = await auth.getClient();
  const wm = google.searchconsole({version: 'v1', auth: client});

  // Check original 25 + top new sites
  const domains = [
    // Original 25
    'bestseatcover.com','jeepseatcover.com','bestbroncoaccessories.com','besttruckaccessories.com',
    'besttonneaucovers.com','bestcordlesstools.com','bestfirestick.com','bestmeshwifi.com',
    'bestgarageorganizer.com','bestinstantpot.com','bestsmokergrill.com','whatarebest.com',
    'tacticalseatcovers.com','wranglerseatcover.com','jlseatcovers.com','tacomaseats.com',
    'bestoffroadbrands.com','broncograbhandles.com','homehvacfilters.com','bestwindshieldwiper.com',
    'autopartsreviewed.com','topoffroadstores.com','gladiatorseatcover.com','broncoseatcover.com','tacticalseats.com',
    // Best new sites
    'r1sparts.com','r1tparts.com','cybertruckseatcovers.com','cybertruckstorage.com',
    'cybertruckbumpers.com','cybertrucktires.com','broncofloormats.com','broncolift.com',
    'rivianaftermarket.com','ramrevparts.com'
  ];

  const results = [];
  for (const domain of domains) {
    try {
      const res = await wm.searchanalytics.query({
        siteUrl: `sc-domain:${domain}`,
        requestBody: {
          startDate: '2026-03-19',
          endDate: '2026-04-18',
          dimensions: [],
          type: 'web'
        }
      });
      const row = res.data.rows && res.data.rows[0];
      if (row) {
        results.push({domain, clicks: row.clicks, impressions: row.impressions, ctr: (row.ctr*100).toFixed(1), position: row.position.toFixed(1)});
      } else {
        results.push({domain, clicks: 0, impressions: 0, ctr: '0', position: '-'});
      }
    } catch(e) {
      results.push({domain, clicks: 0, impressions: 0, ctr: '0', position: '-', err: e.message.slice(0,40)});
    }
  }

  // Sort by impressions descending
  results.sort((a,b) => b.impressions - a.impressions);
  
  console.log('DOMAIN | CLICKS | IMPRESSIONS | CTR | AVG POS');
  console.log('-------|--------|-------------|-----|--------');
  for (const r of results) {
    console.log(`${r.domain} | ${r.clicks} | ${r.impressions} | ${r.ctr}% | ${r.position}${r.err ? ' ['+r.err+']' : ''}`);
  }
}

run().catch(e => console.error('Fatal:', e.message));
