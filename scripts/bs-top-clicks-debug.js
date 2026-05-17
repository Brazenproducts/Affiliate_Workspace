const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: '/home/ubuntu/.openclaw/workspace/.gcp-service-account.json',
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
});
(async () => {
  const webmasters = google.webmasters({ version: 'v3', auth: await auth.getClient() });
  const today = new Date();
  const daysAgo = n => { const d = new Date(today); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); };
  const { data } = await webmasters.searchanalytics.query({
    siteUrl: 'https://bullstrap.com/',
    requestBody: { startDate: daysAgo(90), endDate: daysAgo(3), dimensions: ['page'], rowLimit: 500, dataState: 'all' }
  });
  const rows = (data.rows || []).sort((a,b)=>b.clicks-a.clicks);
  console.log('Top 30 pages by clicks (last 87 days, ending 3 days ago):');
  for (const r of rows.slice(0, 30)) {
    console.log(`${r.clicks.toString().padStart(4)} c | ${r.impressions.toString().padStart(5)} i | pos ${r.position.toFixed(1).padStart(5)} | ${r.keys[0].replace('https://bullstrap.com','').slice(0, 80)}`);
  }
})();
