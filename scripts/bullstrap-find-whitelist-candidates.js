const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
  keyFile: '/home/ubuntu/.openclaw/workspace/.gcp-service-account.json',
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
});

(async () => {
  const webmasters = google.webmasters({ version: 'v3', auth: await auth.getClient() });
  const SITE = 'https://bullstrap.com/';
  const today = new Date();
  const daysAgo = n => { const d = new Date(today); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); };

  // Look at 90 days prior to today
  const { data } = await webmasters.searchanalytics.query({
    siteUrl: SITE,
    requestBody: {
      startDate: daysAgo(90),
      endDate: daysAgo(3),  // exclude last 3 days because that's when noindex kicked in
      dimensions: ['page'],
      rowLimit: 25000,
      dataState: 'all'
    }
  });
  const rows = data.rows || [];
  console.log(`Total pages with >=1 impression in last 90d: ${rows.length}`);

  // Filter to: likely Turn 14 (not own brand or blog), had real rankings
  // Own brand signatures: bartact, bull strap, bullstrap in URL. Also seat covers, tactical etc.
  const ownBrandHints = /bartact|bull[- ]?strap|seat-cover|tactical|baseline|console-cover|grab-handle|door-bag|molle-panel/i;
  const blogHints = /\/blogs\//;
  const earners = [];
  for (const r of rows) {
    const url = r.keys[0];
    if (blogHints.test(url)) continue;
    if (ownBrandHints.test(url)) continue;
    if (url === SITE || url === SITE.slice(0, -1)) continue;
    if (r.clicks >= 2 && r.position <= 30 && r.impressions >= 20) {
      earners.push({ url, clicks: r.clicks, impressions: r.impressions, position: Number(r.position.toFixed(1)), ctr: Number((r.ctr*100).toFixed(2)) });
    }
  }
  earners.sort((a,b) => b.clicks - a.clicks);

  console.log(`\n=== Turn-14-likely pages that EARNED (>=5 clicks, pos<=20, >=50 impressions) ===`);
  console.log(`Total: ${earners.length}`);
  console.log();
  for (const e of earners.slice(0, 50)) {
    console.log(`${e.clicks.toString().padStart(4)} clicks | ${e.impressions.toString().padStart(5)} impr | pos ${String(e.position).padStart(4)} | CTR ${String(e.ctr).padStart(5)}% | ${e.url.replace('https://bullstrap.com','').slice(0, 80)}`);
  }

  const outPath = '/home/ubuntu/.openclaw/workspace/memory/bullstrap-noindex-whitelist-candidates-2026-04-20.json';
  fs.writeFileSync(outPath, JSON.stringify(earners, null, 2));
  console.log(`\nSaved ${earners.length} candidates to ${outPath}`);
  console.log(`Total clicks in the 90-day window from these pages: ${earners.reduce((s,e)=>s+e.clicks,0)}`);
  console.log(`Total impressions: ${earners.reduce((s,e)=>s+e.impressions,0)}`);
})().catch(e => console.error('ERR', e.message));
