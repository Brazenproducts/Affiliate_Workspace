const { google } = require('googleapis');
const https = require('https');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
  keyFile: '/home/ubuntu/.openclaw/workspace/.gcp-service-account.json',
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
});

function head(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'GET', timeout: 10000 }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        const noindex = /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(body) ||
                        /<meta[^>]+name=["']googlebot["'][^>]+noindex/i.test(body);
        const canonical = (body.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || [])[1];
        resolve({ status: res.statusCode, noindex, canonical, finalUrl: res.responseUrl || url });
      });
    });
    req.on('error', () => resolve({ status: 0 }));
    req.on('timeout', () => { req.destroy(); resolve({ status: -1 }); });
    req.end();
  });
}

(async () => {
  const webmasters = google.webmasters({ version: 'v3', auth: await auth.getClient() });
  const SITE = 'https://bullstrap.com/';
  const today = new Date();
  const daysAgo = n => { const d = new Date(today); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); };
  const recent = { start: daysAgo(14), end: daysAgo(0) };
  const prior  = { start: daysAgo(42), end: daysAgo(15) };

  async function q(dim, startDate, endDate, rowLimit=500) {
    const { data } = await webmasters.searchanalytics.query({
      siteUrl: SITE,
      requestBody: { startDate, endDate, dimensions: [dim], rowLimit, dataState: 'all' }
    });
    return data.rows || [];
  }

  const rp = await q('page', recent.start, recent.end, 1000);
  const pp = await q('page', prior.start, prior.end, 1000);
  const map = {};
  for (const r of pp) map[r.keys[0]] = { prior: r, recent: null };
  for (const r of rp) {
    map[r.keys[0]] = map[r.keys[0]] || { prior: null, recent: null };
    map[r.keys[0]].recent = r;
  }

  // Pages that HAD rankings (impressions >= 5 + position <= 100) in prior period
  // and fell to no-rank (position > 100 or zero impressions) in recent
  const drops = [];
  for (const [url, v] of Object.entries(map)) {
    const pp_ = v.prior?.position || 999;
    const rp_ = v.recent?.position || 999;
    const pi = v.prior?.impressions || 0;
    const ri = v.recent?.impressions || 0;
    if (pi >= 3 && pp_ <= 100 && (rp_ > 100 || ri === 0)) {
      drops.push({ url, priorPos: pp_, recentPos: rp_, priorImpr: pi, recentImpr: ri, priorClicks: v.prior?.clicks||0 });
    }
  }
  drops.sort((a,b) => b.priorImpr - a.priorImpr);
  console.log(`\n=== PAGES THAT DISAPPEARED (had rankings, now gone) ===`);
  console.log(`Total: ${drops.length}`);
  console.log(`\nTop 30 by prior impressions:\n`);

  const results = [];
  for (let i = 0; i < Math.min(30, drops.length); i++) {
    const d = drops[i];
    process.stdout.write(`${i+1}. ${d.url.slice(0, 85)}\n   impr ${d.priorImpr}→${d.recentImpr}, pos ${d.priorPos.toFixed(1)}→${d.recentPos.toFixed(1)}... `);
    const h = await head(d.url);
    console.log(`HTTP ${h.status} noindex=${h.noindex}`);
    results.push({ ...d, http: h.status, noindex: h.noindex, canonical: h.canonical });
    await new Promise(r => setTimeout(r, 300));
  }

  fs.writeFileSync('/home/ubuntu/.openclaw/workspace/memory/bullstrap-disappeared-pages-2026-04-20.json', JSON.stringify(results, null, 2));
  console.log(`\nSaved full analysis to memory/bullstrap-disappeared-pages-2026-04-20.json`);

  // Summary
  const byIssue = { noindex: 0, notFound: 0, redirect: 0, ok: 0, other: 0 };
  for (const r of results) {
    if (r.noindex) byIssue.noindex++;
    else if (r.http === 404 || r.http === 410) byIssue.notFound++;
    else if (r.http >= 300 && r.http < 400) byIssue.redirect++;
    else if (r.http === 200) byIssue.ok++;
    else byIssue.other++;
  }
  console.log(`\nSummary of ${results.length} checked:`);
  console.log(`  ✗ noindex: ${byIssue.noindex}`);
  console.log(`  ✗ 404/410: ${byIssue.notFound}`);
  console.log(`  ✗ redirects: ${byIssue.redirect}`);
  console.log(`  ? 200-OK but dropped: ${byIssue.ok} (these are the real SEO slide — live, indexable, but Google demoted them)`);
  console.log(`  ? other: ${byIssue.other}`);
})().catch(e => console.error('ERR', e.message));
