const puppeteer = require('puppeteer-core');

const sites = [
'bestseatcover.com','jeepseatcover.com','bestbroncoaccessories.com',
'tacticalseatcovers.com','wranglerseatcover.com','jlseatcovers.com',
'tacomaseats.com','broncograbhandles.com','whatarebest.com',
'besttruckaccessories.com','besttonneaucovers.com','bestcordlesstools.com',
'bestfirestick.com','bestsmokergrill.com','bestinstantpot.com',
'homehvacfilters.com','bestwindshieldwiper.com','bestoffroadbrands.com',
'autopartsreviewed.com','topoffroadstores.com','gladiatorseatcover.com',
'broncoseatcover.com','tacticalseats.com','bestmeshwifi.com','bestgarageorganizer.com'
];

async function check() {
  const browser = await puppeteer.connect({browserWSEndpoint: 'ws://127.0.0.1:18800'});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  for (const site of sites) {
    try {
      await page.goto('https://www.google.com/search?q=site:' + site, {waitUntil: 'networkidle2', timeout: 15000});
      await new Promise(r => setTimeout(r, 1500));
      
      const stats = await page.evaluate(() => {
        const el = document.getElementById('result-stats');
        if (el) return el.innerText;
        // Check if "did not match any documents"
        const noResults = document.querySelector('#topstuff');
        if (noResults && noResults.innerText.includes('did not match')) return '0 results';
        return 'unknown';
      });
      
      const count = stats.match(/About ([\d,]+) result/);
      const num = count ? count[1] : stats.match(/([\d,]+) result/) ? stats.match(/([\d,]+) result/)[1] : stats;
      console.log(site.padEnd(30), '|', num);
    } catch(e) {
      console.log(site.padEnd(30), '| error:', e.message.substring(0,40));
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  await page.close();
}
check().catch(e => console.error(e.message));
