const { google } = require('googleapis');
const fs = require('fs');

const KEY_PATH = '/home/ubuntu/.openclaw/workspace/.gcp-service-account.json';
const SITE = 'https://www.bartact.com/';

const currentStart = '2026-04-13';
const currentEnd = '2026-04-19';
const priorStart = '2026-04-06';
const priorEnd = '2026-04-12';

async function run() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  async function fetchTop(startDate, endDate) {
    const res = await searchconsole.searchanalytics.query({
      siteUrl: SITE,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 25,
        type: 'web',
      },
    });
    return res.data.rows || [];
  }

  const [currentRows, priorRows] = await Promise.all([
    fetchTop(currentStart, currentEnd),
    fetchTop(priorStart, priorEnd),
  ]);

  const priorMap = {};
  for (const r of priorRows) {
    priorMap[r.keys[0]] = r;
  }

  currentRows.sort((a, b) => b.clicks - a.clicks);
  const top10 = currentRows.slice(0, 10);

  const totalClicksCurrent = currentRows.reduce((s, r) => s + r.clicks, 0);
  const totalClicksPrior = priorRows.reduce((s, r) => s + r.clicks, 0);

  const priorSorted = [...priorRows].sort((a, b) => b.clicks - a.clicks);
  const priorTop10Queries = priorSorted.slice(0, 10).map(r => r.keys[0]);
  const currentTop10Queries = top10.map(r => r.keys[0]);

  const newInTop10 = currentTop10Queries.filter(q => !priorTop10Queries.includes(q));
  const droppedFromTop10 = priorTop10Queries.filter(q => !currentTop10Queries.includes(q));

  const queries = top10.map(r => {
    const q = r.keys[0];
    const prior = priorMap[q];
    const clicksPrior = prior ? prior.clicks : null;
    const posPrior = prior ? Math.round(prior.position * 10) / 10 : null;
    const avgPos = Math.round(r.position * 10) / 10;
    return {
      query: q,
      clicks: r.clicks,
      clicks_prior: clicksPrior,
      clicks_delta: clicksPrior !== null ? r.clicks - clicksPrior : null,
      impressions: r.impressions,
      avg_position: avgPos,
      position_prior: posPrior,
      position_delta: posPrior !== null ? Math.round((avgPos - posPrior) * 10) / 10 : null,
      ctr: Math.round(r.ctr * 10000) / 100,
    };
  });

  const highlights = [];
  for (const q of queries) {
    if (q.clicks_delta !== null && q.clicks_delta >= 3) highlights.push('"' + q.query + '" +' + q.clicks_delta + ' clicks');
    if (q.clicks_delta !== null && q.clicks_delta <= -3) highlights.push('"' + q.query + '" ' + q.clicks_delta + ' clicks');
    if (q.position_delta !== null && q.position_delta <= -1) highlights.push('"' + q.query + '" position improved ' + Math.abs(q.position_delta) + ' spots');
    if (q.position_delta !== null && q.position_delta >= 1.5) highlights.push('"' + q.query + '" position slipped ' + q.position_delta + ' spots');
  }

  const pctChange = totalClicksPrior > 0 ? Math.round((totalClicksCurrent - totalClicksPrior) / totalClicksPrior * 100) : 0;
  const result = {
    date: '2026-04-23',
    period_current: currentStart + ' to ' + currentEnd,
    period_prior: priorStart + ' to ' + priorEnd,
    site: SITE,
    total_clicks_current: totalClicksCurrent,
    total_clicks_prior: totalClicksPrior,
    total_clicks_delta: totalClicksCurrent - totalClicksPrior,
    top_queries: queries,
    new_in_top10: newInTop10,
    dropped_from_top10: droppedFromTop10,
    highlights: highlights,
    comparison: 'Top-10 clicks: ' + totalClicksCurrent + ' (' + (pctChange >= 0 ? '+' : '') + pctChange + '% WoW). ' + highlights.join('. ') + '. New in top 10: ' + (newInTop10.join(', ') || 'none') + '. Dropped: ' + (droppedFromTop10.join(', ') || 'none') + '.',
  };

  fs.writeFileSync('/home/ubuntu/.openclaw/workspace/memory/seo-weekly.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
}

run().catch(e => { console.error(e.message); process.exit(1); });
