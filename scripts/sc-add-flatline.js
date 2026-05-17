const {google} = require('googleapis');
async function run() {
  const auth = new google.auth.GoogleAuth({keyFile:'/home/ubuntu/.openclaw/workspace/.gcp-service-account.json',
    scopes:['https://www.googleapis.com/auth/webmasters']});
  const client = await auth.getClient();
  const wm = google.searchconsole({version:'v1',auth:client});
  // Try adding sc-domain property
  for (const url of ['sc-domain:flatlinefilter.com','https://flatlinefilter.com/']) {
    try {
      await wm.sites.add({siteUrl: url});
      console.log(`Added ${url}`);
    } catch(e) {console.log(`Add ${url}: ${e.message.substring(0,100)}`);}
  }
  // List
  const sites = await wm.sites.list();
  console.log('Owned:', (sites.data.siteEntry||[]).filter(s=>s.siteUrl.includes('flatline')));
  // Try submit again
  for (const url of ['sc-domain:flatlinefilter.com','https://flatlinefilter.com/']) {
    try {
      await wm.sitemaps.submit({siteUrl:url,feedpath:'https://flatlinefilter.com/sitemap.xml'});
      console.log(`📋 Sitemap submitted to ${url}`); break;
    } catch(e) {console.log(`Submit ${url}: ${e.message.substring(0,120)}`);}
  }
}
run().catch(e=>console.error('Fatal:',e.message));
