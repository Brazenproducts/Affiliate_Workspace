const { google } = require('googleapis');
const sa = require('/home/ubuntu/.openclaw/workspace/.gcp-service-account.json');

const auth = new google.auth.GoogleAuth({
  credentials: sa,
  scopes: ['https://www.googleapis.com/auth/webmasters']
});

const sc = google.searchconsole({ version: 'v1', auth });

// CANONICAL LIST — 112 sites (per associates-site-lists-confirmed.md + MEMORY notes)
// Last synced: 2026-08-10
const ALL_SITES = [
  // ── STORE 01 — brazenprodu01-20 — AUTOMOTIVE (50) ──
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
  "broncoseatcover.com","bestbroncoaccessories.com","broncotents.com","broncotops.com",
  "broncoshade.com","broncorollbars.com","molleattachments.com","broncobumper.com",

  // ── STORE 02 — brazenprodu02-20 — NON-AUTOMOTIVE (48 = 47 + whatarebest.com added 2026-07-24) ──
  "bestgaming-chair.com","bestmassage-gun.com","bestice-maker.com","bestmini-fridge.com",
  "bestportable-ac.com","bestportable-charger.com","bestpower-bank.com",
  "topportablepowerstation.com","besthvacfilter.com","topsnowblower.com","toppelletgrill.com",
  "topgaragedooropener.com","topchainsaw.com","bestzeroturnmower.com","bestgarageheater.com",
  "bestreciprocatingsaw.com","beststandmixer.com","bestdutchoven.com","bestsousvide.com",
  "bestmeatthermometer.com","bestkitchenscale.com","commercialhvacfilter.com",
  "bestcompactlaser.com","bestorbitalsandpaper.com","bestpastamaker.com","bestshower-head.com",
  "bestlabel-maker.com","bestresistance-bands.com","bestvibrationplate.com",
  "bestweightedvest.com","bestheating-pad.com","whicharebest.com","purchasefilters.com",
  "furnaceprefilter.com","outdoorseatingcushion.com","topwalkingpad.com","topespressomaker.com",
  "topqueenmattress.com","bestwaterfilterpitcher.com","utilityshedsforhomes.com",
  "bestofficefilters.com","toppowerstation.com","120sfshed.com","shedswithoutpermit.com",
  "shedwithoutpermit.com","hvacprefilter.com","kawasakiridgeutv.com","whatarebest.com",

  // ── CJ AFFILIATE (8) ──
  "bestprotein-powder.com","bestmagnesiumglycinate.com","bestketosupplement.com",
  "bestnootropicguide.com","besthairgrowthsupplement.com","bestantiagingsupplement.com",
  "bestfatburnerpills.com","besttestosteronepills.com",

  // ── SWALMY BACKLINK SITES (4) ──
  "disastermodularhousing.com","rapiddeployshelter.com","prefabemergencyhousing.com",
  "emergencymodularhousing.com",

  // ── NOTES / FUTURE STORE 01 SITES (3) ──
  "slatetruckaccessories.com","stoutparts.com","scoutupgrades.com"
];

async function run() {
  console.log(`Total sites to attempt: ${ALL_SITES.length}`);
  const client = await auth.getClient();
  const submitted = [], unverified = [], failed = [];

  for (const domain of ALL_SITES) {
    const siteUrl = `sc-domain:${domain}`;
    const sitemapUrl = `https://${domain}/sitemap.xml`;
    try {
      await sc.sitemaps.submit({ siteUrl, feedpath: sitemapUrl });
      console.log(`OK: ${domain}`);
      submitted.push(domain);
    } catch (e) {
      const msg = e.message || '';
      const code = e.code || (e.response && e.response.status);
      if (code === 403 || msg.includes('not a verified') || msg.includes('not verified') || msg.includes('User does not have')) {
        unverified.push(domain);
        console.log(`UNVERIFIED: ${domain}`);
      } else {
        failed.push(`${domain}: [${code}] ${msg.slice(0, 100)}`);
        console.log(`FAIL: ${domain}: [${code}] ${msg.slice(0, 100)}`);
      }
    }
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n══════════════════════════════════════════');
  console.log(`SUBMITTED (${submitted.length}): ${submitted.join(', ')}`);
  console.log(`\nUNVERIFIED (${unverified.length}): ${unverified.join(', ')}`);
  console.log(`\nFAILED/OTHER (${failed.length}):`);
  failed.forEach(f => console.log('  ' + f));
  console.log('══════════════════════════════════════════');
}

run().catch(console.error);
