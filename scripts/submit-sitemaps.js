const { google } = require('googleapis');
const fs = require('fs');

const SA = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.gcp-service-account.json'));
const SITES = JSON.parse(fs.readFileSync('/tmp/verified-sites.json'));

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const auth = new google.auth.JWT({
    email: SA.client_email,
    key: SA.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters']
  });
  await auth.authorize();
  const sc = google.searchconsole({ version: 'v1', auth });
  
  let ok = 0, failed = [];
  console.log(`Submitting sitemaps for ${SITES.length} verified sites...`);
  
  for (const domain of SITES) {
    const siteUrl = `https://${domain}/`;
    try {
      await sc.sitemaps.submit({ siteUrl, feedpath: `${siteUrl}sitemap.xml` });
      ok++;
      console.log(`✓ ${domain}`);
    } catch(e) {
      const msg = (e.message||'').slice(0,100);
      failed.push(`${domain}: ${msg}`);
      console.log(`✗ ${domain}: ${msg}`);
    }
    await sleep(300);
  }
  
  console.log(`\n=== DONE === Submitted: ${ok}/${SITES.length} | Failed: ${failed.length}`);
  if (failed.length) { console.log('Failed:'); failed.forEach(f => console.log(' ', f)); }
}

run().catch(console.error);
