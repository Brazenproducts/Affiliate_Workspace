const { google } = require('googleapis');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const sa = require('/home/ubuntu/.openclaw/workspace/.gcp-service-account.json');

const auth = new google.auth.GoogleAuth({
  credentials: sa,
  scopes: ['https://www.googleapis.com/auth/siteverification','https://www.googleapis.com/auth/webmasters']
});
const sv = google.siteVerification({ version: 'v1', auth });
const sc = google.searchconsole({ version: 'v1', auth });
const SITES_DIR = '/home/ubuntu/.openclaw/workspace/sites';

const ALL_SITES = [
  "wranglerjeepaccessories.com","bestledlightbars.com","bestgolfcartaccessories.com",
  "broncointerior.com","broncoupgrade.com","overlanderupgrades.com","lightninginterior.com",
  "lightningaftermarket.com","bestrecoverykit.com","bestheadlightrestoration.com",
  "besttruckfloorliner.com","bigrigseatcovers.com","bestseatcover.com","wranglerseatcover.com",
  "tacticalseatcovers.com","besttrucktopper.com","wranglerseats.com","4runnerseats.com",
  "tacomaseats.com","tacticaltailgate.com","jlseatcovers.com","bestcarwashkit.com",
  "bestdetailingkit.com","besttireinflator.com","broncograbhandles.com","broncofloormats.com",
  "broncocargo.com","gladiatorseatcover.com","cybertruckseatcover.com","wranglergrabhandles.com",
  "broncoseat.com","cybertruckstorage.com","cybertruckbumper.com","jluseatcovers.com",
  "ridgeutv.com","jtseatcovers.com","besttruckaccessories.com","jeepseatcover.com",
  "jlcovers.com","jkseatcovers.com","tjseatcovers.com","jlseatcover.com",
  "broncoseatcover.com","fordbroncoaccessories.com","broncotents.com","broncotops.com",
  "broncoshade.com","broncorollbars.com","molleattachments.com","broncobumper.com",
  "bestgaming-chair.com","bestmassage-gun.com","bestice-maker.com","bestmini-fridge.com",
  "bestportable-ac.com","bestportable-charger.com","bestpower-bank.com",
  "topportablepowerstation.com","besthvacfilter.com","topsnowblower.com","toppelletgrill.com",
  "topgaragedooropener.com","topchainsaw.com","bestzeroturnmower.com","bestgarageheater.com",
  "bestreciprocatingsaw.com","beststandmixer.com","bestdutchoven.com","bestsousvide.com",
  "bestmeatthermometer.com","bestkitchenscale.com","commercialhvacfilter.com",
  "bestcompactlaser.com","bestorbitalsandpaper.com","bestpastamaker.com","bestshower-head.com",
  "bestlabel-maker.com","bestresistance-bands.com","bestvibrationplate.com",
  "bestweightedvest.com","bestheating-pad.com","utilityshedsforhomes.com",
  "purchasefilters.com","furnaceprefilter.com","outdoorseatingcushion.com","topwalkingpad.com",
  "topespressomaker.com","topqueenmattress.com","bestwaterfilterpitcher.com",
  "whicharebest.com","bestofficefilters.com","toppowerstation.com","120sfshed.com",
  "shedswithoutpermit.com","hvacprefilter.com","kawasakiridgeutv.com","whatarebest.com"
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  let verified = 0, sitemapOk = 0, failed = [];

  for (const domain of ALL_SITES) {
    const siteUrl = `https://${domain}/`;
    const repoDir = path.join(SITES_DIR, domain);
    if (!fs.existsSync(repoDir) || !fs.existsSync(path.join(repoDir, '.git'))) {
      console.log(`SKIP: ${domain}`);
      continue;
    }

    try {
      // Get token
      const tokenRes = await sv.webResource.getToken({
        requestBody: { site: { type: 'SITE', identifier: siteUrl }, verificationMethod: 'FILE' }
      });
      const filename = tokenRes.data.token;
      const filePath = path.join(repoDir, filename);

      // Write verification file
      fs.writeFileSync(filePath, `google-site-verification: ${filename}`);

      // Commit and push (suppress if nothing to commit)
      try {
        execSync(`cd "${repoDir}" && git add "${filename}" && git diff --cached --quiet || git commit -m "Add GSC HTML verification" && git push 2>&1`, { timeout: 15000 });
      } catch(gitErr) {
        // If push fails due to diverged, try pull+push
        try {
          execSync(`cd "${repoDir}" && git pull --rebase origin main 2>&1 && git push 2>&1`, { timeout: 15000 });
        } catch(e2) { /* continue anyway — file may already be there */ }
      }

      await sleep(3000); // Wait for GitHub Pages to propagate

      // Verify with Google
      await sv.webResource.insert({
        verificationMethod: 'FILE',
        requestBody: { site: { type: 'SITE', identifier: siteUrl } }
      });
      verified++;

      // Submit sitemap
      try {
        await sc.sitemaps.submit({ siteUrl, feedpath: `${siteUrl}sitemap.xml` });
        sitemapOk++;
        console.log(`✓ VERIFIED+SITEMAP: ${domain}`);
      } catch(e) {
        console.log(`✓ VERIFIED (sitemap skipped): ${domain}`);
      }

    } catch(e) {
      failed.push(`${domain}: ${(e.message||'').slice(0,100)}`);
      console.log(`✗ FAIL: ${domain}: ${(e.message||'').slice(0,100)}`);
    }

    await sleep(300);
  }

  console.log(`\n=== DONE ===`);
  console.log(`Verified: ${verified}/97 | Sitemaps: ${sitemapOk} | Failed: ${failed.length}`);
  fs.writeFileSync('/tmp/gsc-verify-results.json', JSON.stringify({verified, sitemapOk, failed}, null, 2));
}

run().catch(e => { console.error(e); process.exit(1); });
