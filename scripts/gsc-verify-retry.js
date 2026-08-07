const { google } = require('googleapis');
const fs = require('fs');
const sa = require('/home/ubuntu/.openclaw/workspace/.gcp-service-account.json');

const auth = new google.auth.GoogleAuth({
  credentials: sa,
  scopes: ['https://www.googleapis.com/auth/siteverification','https://www.googleapis.com/auth/webmasters']
});
const sv = google.siteVerification({ version: 'v1', auth });
const sc = google.searchconsole({ version: 'v1', auth });
const sleep = ms => new Promise(r => setTimeout(r, ms));

// All 97 sites — retry verification only (files already pushed)
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

async function run() {
  let verified = 0, sitemapOk = 0, failed = [];

  for (const domain of ALL_SITES) {
    const siteUrl = `https://${domain}/`;
    try {
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
        console.log(`✓ VERIFIED: ${domain}`);
      }
    } catch(e) {
      const msg = (e.message||'').slice(0,80);
      failed.push(`${domain}: ${msg}`);
      console.log(`✗ ${domain}: ${msg}`);
    }
    await sleep(200);
  }

  console.log(`\n=== DONE === Verified: ${verified} | Sitemaps: ${sitemapOk} | Failed: ${failed.length}`);
  if (failed.length) failed.forEach(f => console.log(' ', f));
}

run().catch(console.error);
