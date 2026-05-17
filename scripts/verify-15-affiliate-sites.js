#!/usr/bin/env node
// Verify 15 new affiliate sites in Search Console + submit sitemaps

const GODADDY_KEY = '9QCBbdvZc9n_N3jPNv71WzKBpDcn8XCmyV';
const GODADDY_SECRET = 'VVAAEQkkEyCVAtwqyCadwG';

const sites = [
  'bestmagnesiumglycinate.com',
  'bestnecklifttape.com',
  'bestportable-charger.com',
  'bestheating-pad.com',
  'bestvibrationplate.com',
  'bestresistance-bands.com',
  'bestprotein-powder.com',
  'bestmini-fridge.com',
  'bestmassage-gun.com',
  'bestgaming-chair.com',
  'bestice-maker.com',
  'bestportable-ac.com',
  'bestpower-bank.com',
  'bestlabel-maker.com',
  'bestshower-head.com'
];

async function addDNSTXT(domain, token) {
  const record = [{type: 'TXT', name: '@', data: token, ttl: 600}];
  const res = await fetch(`https://api.godaddy.com/v1/domains/${domain}/records/TXT/@`, {
    method: 'PUT',
    headers: {
      'Authorization': `sso-key ${GODADDY_KEY}:${GODADDY_SECRET}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(record)
  });
  return res.ok;
}

async function verifySite(domain) {
  const { google } = await import('googleapis');
  const auth = new google.auth.GoogleAuth({
    keyFile: '/home/ubuntu/.openclaw/workspace/.gcp-ghost-cleanup-decoded.json',
    scopes: ['https://www.googleapis.com/auth/webmasters']
  });
  const webmasters = google.webmasters({ version: 'v3', auth });
  
  try {
    // Add site
    await webmasters.sites.add({ siteUrl: `sc-domain:${domain}` });
    console.log(`✅ ${domain} added to Search Console`);
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log(`⚠️  ${domain} already in Search Console`);
    } else {
      console.log(`❌ ${domain} add failed: ${e.message}`);
      return false;
    }
  }
  
  // Get verification token
  let token;
  try {
    const tokenRes = await webmasters.sites.get({ siteUrl: `sc-domain:${domain}` });
    token = tokenRes.data.verificationMethod?.find(m => m.type === 'DNS_TXT')?.identifier;
    if (!token) {
      console.log(`❌ ${domain} no DNS TXT token found`);
      return false;
    }
  } catch (e) {
    console.log(`❌ ${domain} token fetch failed: ${e.message}`);
    return false;
  }
  
  // Add DNS TXT
  const dnsOk = await addDNSTXT(domain, token);
  if (!dnsOk) {
    console.log(`❌ ${domain} DNS TXT add failed`);
    return false;
  }
  console.log(`✅ ${domain} DNS TXT added: ${token.substring(0, 30)}...`);
  
  // Wait 5 seconds for DNS propagation
  await new Promise(r => setTimeout(r, 5000));
  
  // Verify
  try {
    await webmasters.sites.verify({ siteUrl: `sc-domain:${domain}` });
    console.log(`✅ ${domain} VERIFIED`);
  } catch (e) {
    console.log(`⚠️  ${domain} verify pending (DNS propagation): ${e.message.substring(0, 80)}`);
    return false;
  }
  
  // Submit sitemap
  try {
    await webmasters.sitemaps.submit({
      siteUrl: `sc-domain:${domain}`,
      feedpath: `https://${domain}/sitemap.xml`
    });
    console.log(`✅ ${domain} sitemap submitted`);
  } catch (e) {
    console.log(`⚠️  ${domain} sitemap submit failed: ${e.message.substring(0, 80)}`);
  }
  
  return true;
}

(async () => {
  for (const site of sites) {
    console.log(`\n=== ${site} ===`);
    await verifySite(site);
    await new Promise(r => setTimeout(r, 2000)); // rate limit
  }
  console.log('\n🎉 Done!');
})();
