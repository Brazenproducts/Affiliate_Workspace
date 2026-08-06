const { google } = require('googleapis');
const sa = require('/home/ubuntu/.openclaw/workspace/.gcp-service-account.json');

const auth = new google.auth.GoogleAuth({
  credentials: sa,
  scopes: ['https://www.googleapis.com/auth/webmasters']
});

const sc = google.searchconsole({ version: 'v1', auth });

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
  const client = await auth.getClient();
  let submitted = 0, skipped = 0, failed = [];

  for (const domain of ALL_SITES) {
    const siteUrl = `https://${domain}/`;
    const sitemapUrl = `https://${domain}/sitemap.xml`;
    try {
      await sc.sitemaps.submit({ siteUrl, feedpath: sitemapUrl });
      console.log(`OK: ${domain}`);
      submitted++;
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('not a verified') || msg.includes('403') || msg.includes('not verified')) {
        skipped++;
        console.log(`UNVERIFIED: ${domain}`);
      } else {
        failed.push(`${domain}: ${msg.slice(0,80)}`);
        console.log(`FAIL: ${domain}: ${msg.slice(0,80)}`);
      }
    }
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nSubmitted: ${submitted} | Unverified: ${skipped} | Failed: ${failed.length}`);
}

run().catch(console.error);
