const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const auth = new GoogleAuth({
  keyFile: '/home/ubuntu/.openclaw/workspace/.gcp-service-account.json',
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
});
const sc = google.searchconsole({ version: 'v1', auth });
const siteUrl = 'https://www.bartact.com/';

// Today is May 6. GSC lags ~2 days so use May 1-4 as "current week"
// 1 week ago: Apr 24-27
// 2 weeks ago: Apr 17-20
const periods = {
  current:   { start: '2026-04-30', end: '2026-05-04', label: 'This week (Apr 30 – May 4)' },
  week1:     { start: '2026-04-23', end: '2026-04-27', label: '1 week ago (Apr 23–27)' },
  week2:     { start: '2026-04-16', end: '2026-04-20', label: '2 weeks ago (Apr 16–20)' },
};

async function queryPeriod(start, end, dimensions, rowLimit = 25) {
  const res = await sc.searchanalytics.query({
    siteUrl,
    requestBody: { startDate: start, endDate: end, dimensions, rowLimit,
      orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }] }
  });
  return res.data.rows || [];
}

async function main() {
  // 1. Overall metrics per period
  console.log('\n========== OVERALL PERFORMANCE ==========');
  for (const [key, p] of Object.entries(periods)) {
    const rows = await queryPeriod(p.start, p.end, ['date'], 10);
    const totals = rows.reduce((a, r) => ({
      clicks: a.clicks + r.clicks,
      impressions: a.impressions + r.impressions,
      ctr: 0,
      position: a.position + r.position
    }), { clicks: 0, impressions: 0, position: 0 });
    const avgPos = rows.length ? (totals.position / rows.length).toFixed(1) : 'n/a';
    const avgCtr = totals.impressions ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : '0';
    console.log(`\n${p.label}`);
    console.log(`  Clicks: ${totals.clicks} | Impressions: ${totals.impressions} | Avg CTR: ${avgCtr}% | Avg Position: ${avgPos}`);
  }

  // 2. Top 25 queries this week with position comparison
  console.log('\n\n========== TOP 25 QUERIES (by clicks, this week) with position comparison ==========');
  const currentRows = await queryPeriod(periods.current.start, periods.current.end, ['query'], 25);
  const week1Rows   = await queryPeriod(periods.week1.start,   periods.week1.end,   ['query'], 50);
  const week2Rows   = await queryPeriod(periods.week2.start,   periods.week2.end,   ['query'], 50);

  const w1Map = Object.fromEntries(week1Rows.map(r => [r.keys[0], r]));
  const w2Map = Object.fromEntries(week2Rows.map(r => [r.keys[0], r]));

  console.log(`${'Query'.padEnd(50)} | ${'Now Pos'.padStart(7)} | ${'1wk Pos'.padStart(7)} | ${'2wk Pos'.padStart(7)} | ${'Clicks'.padStart(6)} | ${'Impr'.padStart(6)}`);
  console.log('-'.repeat(105));
  for (const row of currentRows) {
    const q = row.keys[0];
    const nowPos  = row.position.toFixed(1);
    const w1      = w1Map[q] ? w1Map[q].position.toFixed(1) : '—';
    const w2      = w2Map[q] ? w2Map[q].position.toFixed(1) : '—';
    const delta1  = w1Map[q] ? (w1Map[q].position - row.position).toFixed(1) : '';
    const arrow1  = delta1 > 0 ? '↑' : delta1 < 0 ? '↓' : '=';
    console.log(`${q.slice(0,50).padEnd(50)} | ${nowPos.padStart(7)} | ${w1.padStart(7)} | ${w2.padStart(7)} | ${row.clicks.toString().padStart(6)} | ${row.impressions.toString().padStart(6)}`);
  }

  // 3. Big movers — queries that improved or dropped 3+ positions
  console.log('\n\n========== BIG MOVERS (vs 1 week ago, ≥3 position change) ==========');
  const allCurrentRows = await queryPeriod(periods.current.start, periods.current.end, ['query'], 100);
  const movers = [];
  for (const row of allCurrentRows) {
    const q = row.keys[0];
    if (!w1Map[q]) continue;
    const delta = w1Map[q].position - row.position; // positive = improved (lower number)
    if (Math.abs(delta) >= 3) movers.push({ q, now: row.position, w1: w1Map[q].position, delta, clicks: row.clicks });
  }
  movers.sort((a, b) => b.delta - a.delta);
  console.log('IMPROVED:');
  movers.filter(m => m.delta > 0).forEach(m =>
    console.log(`  ↑ ${m.delta.toFixed(1)} pos | ${m.q} | Now: ${m.now.toFixed(1)} | Was: ${m.w1.toFixed(1)} | Clicks: ${m.clicks}`)
  );
  console.log('DROPPED:');
  movers.filter(m => m.delta < 0).sort((a,b) => a.delta - b.delta).forEach(m =>
    console.log(`  ↓ ${Math.abs(m.delta).toFixed(1)} pos | ${m.q} | Now: ${m.now.toFixed(1)} | Was: ${m.w1.toFixed(1)} | Clicks: ${m.clicks}`)
  );
}

main().catch(console.error);
