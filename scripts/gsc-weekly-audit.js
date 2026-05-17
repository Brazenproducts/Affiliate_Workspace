/**
 * Weekly Non-Brand SEO Audit — ALL Sites
 * Dates: current = last 7 days, prior = 7 days before that
 * Run: node gsc-weekly-audit.js
 */

const { google } = require('googleapis');
const sa = require('/home/ubuntu/.openclaw/workspace/.gcp-service-account.json');

const auth = new google.auth.GoogleAuth({
  credentials: sa,
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
});

const sc = google.searchconsole({ version: 'v1', auth });

// Date ranges — current week: May 4–10, prior week: Apr 27–May 3
const CURRENT = { startDate: '2026-05-04', endDate: '2026-05-10' };
const PRIOR   = { startDate: '2026-04-27', endDate: '2026-05-03' };

// Sites config: siteUrl, brandRegex to exclude
const SITES = [
  {
    name: 'Bartact',
    siteUrl: 'https://www.bartact.com/',
    brandRegex: /bartact|bar\s*tact|bartec|bartech|bartact|batact|bartac/i
  },
  {
    name: 'Bull Strap',
    siteUrl: 'https://bullstrap.com/',
    brandRegex: /bull\s*strap|bullstrap/i
  },
  {
    name: 'BowTie Filters',
    siteUrl: 'https://bowtiefilters.com/',
    brandRegex: /bowtie\s*filter|bow\s*tie\s*filter/i
  },
  {
    name: 'Walk Industrial',
    siteUrl: 'https://walkindustrial.com/',
    brandRegex: /walk\s*industrial/i
  },
  {
    name: 'Blox Filters',
    siteUrl: 'https://bloxfilters.com/',
    brandRegex: /blox\s*filter/i
  },
  {
    name: 'GridGuards USA',
    siteUrl: 'https://gridguardsusa.com/',
    brandRegex: /gridguard|grid\s*guard/i
  },
  // Affiliate sites
  {
    name: 'Best Seat Cover',
    siteUrl: 'https://bestseatcover.com/',
    brandRegex: /bestseatcover/i
  },
  {
    name: 'Jeep Seat Cover',
    siteUrl: 'https://jeepseatcover.com/',
    brandRegex: /jeepseatcover/i
  },
  {
    name: 'Wrangler Seat Cover',
    siteUrl: 'https://wranglerseatcover.com/',
    brandRegex: /wranglerseatcover/i
  },
  {
    name: 'Tactical Seats',
    siteUrl: 'https://tacticalseats.com/',
    brandRegex: /tacticalseats/i
  },
  {
    name: 'Best Bronco Accessories',
    siteUrl: 'https://bestbroncoaccessories.com/',
    brandRegex: /bestbroncoaccessories/i
  }
];

async function queryGSC(siteUrl, startDate, endDate, dimensions, rowLimit = 25, filters = []) {
  try {
    const res = await sc.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions,
        rowLimit,
        dimensionFilterGroups: filters.length ? [{ filters }] : undefined
      }
    });
    return res.data.rows || [];
  } catch (e) {
    if (e.code === 403 || e.code === 404 || (e.message && e.message.includes('not found'))) {
      return null; // no access
    }
    throw e;
  }
}

async function auditSite(site) {
  const result = {
    name: site.name,
    siteUrl: site.siteUrl,
    accessible: true,
    currentQueries: [],
    priorQueries: [],
    drops: [],
    cannibalization: [],
    topPageDetails: [],
    alerts: []
  };

  // Pull top 25 queries for current period
  const currentRows = await queryGSC(site.siteUrl, CURRENT.startDate, CURRENT.endDate, ['query'], 25);
  if (currentRows === null) {
    result.accessible = false;
    return result;
  }

  // Pull top 25 queries for prior period
  const priorRows = await queryGSC(site.siteUrl, PRIOR.startDate, PRIOR.endDate, ['query'], 25);

  // Filter out brand terms, keep top 20 non-brand
  const filterBrand = (rows) => rows
    .filter(r => !site.brandRegex.test(r.keys[0]))
    .slice(0, 20);

  const currentNB = filterBrand(currentRows || []);
  const priorNB = filterBrand(priorRows || []);

  result.currentQueries = currentNB;
  result.priorQueries = priorNB;

  // Build prior map
  const priorMap = {};
  priorNB.forEach(r => { priorMap[r.keys[0]] = r; });

  // Find drops > 1 position
  const drops = [];
  for (const row of currentNB) {
    const query = row.keys[0];
    const prior = priorMap[query];
    if (prior) {
      const posDiff = row.position - prior.position; // positive = dropped
      if (posDiff > 1) {
        drops.push({
          query,
          priorPos: prior.position,
          currentPos: row.position,
          drop: posDiff,
          priorClicks: prior.clicks,
          currentClicks: row.clicks
        });
      }
    }
  }
  result.drops = drops;

  // For dropped queries, pull page-level data
  for (const drop of drops) {
    try {
      const pageRows = await queryGSC(
        site.siteUrl,
        CURRENT.startDate, CURRENT.endDate,
        ['page', 'query'],
        10,
        [{ dimension: 'query', operator: 'equals', expression: drop.query }]
      );
      drop.pages = (pageRows || []).map(r => ({
        url: r.keys[0],
        query: r.keys[1],
        position: r.position,
        clicks: r.clicks,
        impressions: r.impressions
      }));
    } catch(e) {
      drop.pages = [];
    }
  }

  // Cannibalization check: queries where multiple pages rank
  // Pull query+page for top 20 non-brand queries
  const cannibMap = {};
  for (const row of currentNB.slice(0, 10)) {
    try {
      const pageRows = await queryGSC(
        site.siteUrl,
        CURRENT.startDate, CURRENT.endDate,
        ['query', 'page'],
        10,
        [{ dimension: 'query', operator: 'equals', expression: row.keys[0] }]
      );
      if (pageRows && pageRows.length > 1) {
        cannibMap[row.keys[0]] = pageRows.map(r => ({
          query: r.keys[0],
          url: r.keys[1],
          position: r.position,
          clicks: r.clicks
        }));
      }
    } catch(e) {}
  }
  result.cannibalization = cannibMap;

  // Top 5 pages by clicks — pull title tags and internal link counts via page dimension
  const topPages = await queryGSC(site.siteUrl, CURRENT.startDate, CURRENT.endDate, ['page'], 5);
  result.topPageDetails = (topPages || []).map(r => ({
    url: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    position: r.position,
    ctr: r.ctr
  }));

  // Alerts: top 10 query falling off page 1 (pos > 10)
  for (const row of currentNB.slice(0, 10)) {
    const query = row.keys[0];
    const prior = priorMap[query];
    if (prior && prior.position <= 10 && row.position > 10) {
      result.alerts.push({
        query,
        priorPos: prior.position,
        currentPos: row.position,
        priorClicks: prior.clicks,
        currentClicks: row.clicks
      });
    }
  }

  // Also check: queries that were in prior top 10 but disappeared from current top 20
  for (const pRow of priorNB.slice(0, 10)) {
    const query = pRow.keys[0];
    const inCurrent = currentNB.find(r => r.keys[0] === query);
    if (!inCurrent && pRow.position <= 10 && pRow.clicks > 0) {
      result.alerts.push({
        query,
        priorPos: pRow.position,
        currentPos: 'dropped out of top 20',
        priorClicks: pRow.clicks,
        currentClicks: 0,
        note: 'disappeared from top 20'
      });
    }
  }

  return result;
}

async function main() {
  const results = [];
  for (const site of SITES) {
    process.stderr.write(`Auditing ${site.name}...\n`);
    try {
      const r = await auditSite(site);
      results.push(r);
    } catch(e) {
      results.push({
        name: site.name,
        siteUrl: site.siteUrl,
        accessible: false,
        error: e.message
      });
    }
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(JSON.stringify(results, null, 2));
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
