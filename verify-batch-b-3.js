const https = require('https');
const {google} = require('googleapis');
const SITES = ['hvachomefilters.com','besthomefilter.com','besthvacfilter.com'];
const GODADDY_KEY = '9QCBbdvZc9n_N3jPNv71WzKBpDcn8XCmyV';
const GODADDY_SECRET = 'VVAAEQkkEyCVAtwqyCadwG';
function godaddyRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: 'api.godaddy.com', path, method, headers: { 'Authorization': `sso-key ${GODADDY_KEY}:${GODADDY_SECRET}`, 'Content-Type': 'application/json' } };
    const req = https.request(opts, res => { let d=''; res.on('data', c => d += c); res.on('end', () => { if (res.statusCode >= 200 && res.statusCode < 300) resolve(d ? JSON.parse(d) : {}); else reject(new Error(`${res.statusCode}: ${d.substring(0,200)}`)); }); });
    req.on('error', reject); if (body) req.write(JSON.stringify(body)); req.end();
  });
}
(async () => {
  const auth = new google.auth.GoogleAuth({ keyFile: '.gcp-service-account.json', scopes: ['https://www.googleapis.com/auth/webmasters','https://www.googleapis.com/auth/siteverification'] });
  const client = await auth.getClient();
  const siteVerify = google.siteVerification({version: 'v1', auth: client});
  const wm = google.searchconsole({version: 'v1', auth: client});
  for (const domain of SITES) {
    console.log(`\n=== ${domain} ===`);
    try {
      const tokenResp = await siteVerify.webResource.getToken({ requestBody: { site: {type: 'INET_DOMAIN', identifier: domain}, verificationMethod: 'DNS_TXT' } });
      const token = tokenResp.data.token;
      console.log(`Token: ${token}`);
      let existing = [];
      try { existing = await godaddyRequest('GET', `/v1/domains/${domain}/records/TXT`); } catch {}
      if (!Array.isArray(existing) || !existing.some(r => r.data === token)) {
        await godaddyRequest('PATCH', `/v1/domains/${domain}/records`, [{type: 'TXT', name: '@', data: token, ttl: 600}]);
        console.log('TXT added');
      } else {
        console.log('TXT already exists');
      }
      await new Promise(r => setTimeout(r, 5000));
      try {
        await siteVerify.webResource.insert({ requestBody: { site: {type: 'INET_DOMAIN', identifier: domain} }, verificationMethod: 'DNS_TXT' });
        console.log('VERIFIED');
      } catch (e) {
        console.log('VERIFY:', e.message.substring(0, 120));
      }
      try {
        await wm.sitemaps.submit({siteUrl: `sc-domain:${domain}`, feedpath: `https://${domain}/sitemap.xml`});
        console.log('SITEMAP SUBMITTED');
      } catch (e) {
        console.log('SITEMAP:', e.message.substring(0, 120));
      }
    } catch (e) {
      console.log('ERROR:', e.message.substring(0, 160));
    }
  }
})();
