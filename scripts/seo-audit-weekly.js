const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SA_KEY = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '.gcp-service-account.json'), 'utf8'));

const SITES = [
  { name: 'Bartact', siteUrl: 'https://www.bartact.com/', brandRegex: /bartact|bar\s*tact/i },
  { name: 'Bull Strap', siteUrl: 'https://bullstrap.com/', brandRegex: /bullstrap|bull\s*strap/i },
  { name: 'BowTie Filters', siteUrl: 'https://bowtiefilters.com/', brandRegex: /bowtie|bow\s*tie/i },
  { name: 'Walk Industrial', siteUrl: 'https://walkindustrial.com/', brandRegex: /walk\s*industrial/i },
  { name: 'Blox Filters', siteUrl: 'https://bloxfilters.com/', brandRegex: /blox/i },
  { name: 'GridGuards USA', siteUrl: 'https://gridguardsusa.com/', brandRegex: /gridguard/i },
  { name: 'Best Seat Cover', siteUrl: 'https://bestseatcover.com/', brandRegex: /bestseatcover/i },
  { name: 'Jeep Seat Cover', siteUrl: 'https://jeepseatcover.com/', brandRegex: /jeepseatcover/i },
  { name: 'Wrangler Seat Cover', siteUrl: 'https://wranglerseatcover.com/', brandRegex: /wranglerseatcover/i },
  { name: 'Tactical Seats', siteUrl: 'https://tacticalseats.com/', brandRegex: /tacticalseats/i },
  { name: 'Best Bronco Accessories', siteUrl: 'https://bestbroncoaccessories.com/', brandRegex: /bestbroncoaccessories/i },
];

// Also try sc-domain: variants and with/without www/trailing slash
function siteUrlVariants(s) {
  const variants = [s.siteUrl];
  const u = new URL(s.siteUrl);
  // sc-domain variant
  variants.push('sc-domain:' + u.hostname);
  // without trailing slash
  if (s.siteUrl.endsWith('/')) variants.push(s.siteUrl.slice(0, -1));
  // with/without www
  if (u.hostname.startsWith('www.')) {
    variants.push(s.siteUrl.replace('www.', ''));
    variants.push('sc-domain:' + u.hostname.replace('www.', ''));
  } else {
    variants.push(s.siteUrl.replace('://', '://www.'));
  }
  // http variant
  variants.push(s.siteUrl.replace('https://', 'http://'));
  return [...new Set(variants)];
}

async function run() {
  const auth = new google.auth.JWT({
    email: SA_KEY.client_email,
    key: SA_KEY.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const sc = google.searchconsole({ version: 'v1', auth });

  // Get list of sites the SA has access to
  let accessibleSites;
  try {
    const res = await sc.sites.list();
    accessibleSites = (res.data.siteEntry || []).map(e => e.siteUrl);
    console.log('Accessible GSC sites:', JSON.stringify(accessibleSites));
  } catch (e) {
    console.error('Failed to list sites:', e.message);
    return;
  }

  // Date ranges: last 7 days vs prior 7 days
  // GSC data has ~3 day lag, so "last 7 days" = 10 days ago to 3 days ago
  const now = new Date('2026-04-27T17:00:00Z');
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() - 3); // Apr 24
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 6); // Apr 18 (7 days: 18-24)

  const priorEnd = new Date(startDate);
  priorEnd.setDate(priorEnd.getDate() - 1); // Apr 17
  const priorStart = new Date(priorEnd);
  priorStart.setDate(priorStart.getDate() - 6); // Apr 11 (7 days: 11-17)

  const fmt = d => d.toISOString().split('T')[0];

  console.log(`Current period: ${fmt(startDate)} to ${fmt(endDate)}`);
  console.log(`Prior period: ${fmt(priorStart)} to ${fmt(priorEnd)}`);

  const results = {};
  const criticalDrops = [];

  for (const site of SITES) {
    const variants = siteUrlVariants(site);
    const matchedUrl = variants.find(v => accessibleSites.includes(v));

    if (!matchedUrl) {
      results[site.name] = { error: 'NO_ACCESS', variants };
      console.log(`\n❌ ${site.name}: No GSC access (tried ${variants.join(', ')})`);
      continue;
    }

    console.log(`\n✅ ${site.name}: Using ${matchedUrl}`);

    try {
      // Step 1: Pull top non-brand queries for current period
      const [currentRes, priorRes] = await Promise.all([
        sc.searchanalytics.query({
          siteUrl: matchedUrl,
          requestBody: {
            startDate: fmt(startDate),
            endDate: fmt(endDate),
            dimensions: ['query'],
            rowLimit: 100,
            dimensionFilterGroups: [],
          },
        }),
        sc.searchanalytics.query({
          siteUrl: matchedUrl,
          requestBody: {
            startDate: fmt(priorStart),
            endDate: fmt(priorEnd),
            dimensions: ['query'],
            rowLimit: 100,
            dimensionFilterGroups: [],
          },
        }),
      ]);

      const currentRows = (currentRes.data.rows || []).filter(r => !site.brandRegex.test(r.keys[0]));
      const priorRows = (priorRes.data.rows || []).filter(r => !site.brandRegex.test(r.keys[0]));

      // Build prior lookup
      const priorMap = {};
      for (const r of priorRows) {
        priorMap[r.keys[0]] = r;
      }

      // Top 20 non-brand by clicks (current)
      const top20 = currentRows.slice(0, 20).map(r => {
        const prior = priorMap[r.keys[0]];
        return {
          query: r.keys[0],
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: (r.ctr * 100).toFixed(1),
          position: r.position.toFixed(1),
          priorClicks: prior ? prior.clicks : null,
          priorImpressions: prior ? prior.impressions : null,
          priorPosition: prior ? prior.position.toFixed(1) : null,
          positionChange: prior ? (r.position - prior.position).toFixed(1) : null,
        };
      });

      // Step 2: Queries that dropped >1 position
      const dropped = top20.filter(q => q.positionChange !== null && parseFloat(q.positionChange) > 1);

      // Pull page-level data for dropped queries
      const droppedDetails = [];
      for (const dq of dropped) {
        try {
          const pageRes = await sc.searchanalytics.query({
            siteUrl: matchedUrl,
            requestBody: {
              startDate: fmt(startDate),
              endDate: fmt(endDate),
              dimensions: ['query', 'page'],
              dimensionFilterGroups: [{
                filters: [{ dimension: 'query', expression: dq.query, operator: 'equals' }],
              }],
              rowLimit: 10,
            },
          });
          dq.pages = (pageRes.data.rows || []).map(r => ({
            url: r.keys[1],
            clicks: r.clicks,
            impressions: r.impressions,
            position: r.position.toFixed(1),
          }));
        } catch (e) {
          dq.pages = [{ error: e.message }];
        }
      }

      // Step 3: Cannibalization check — queries with multiple pages ranking
      const cannibalization = [];
      try {
        const cannRes = await sc.searchanalytics.query({
          siteUrl: matchedUrl,
          requestBody: {
            startDate: fmt(startDate),
            endDate: fmt(endDate),
            dimensions: ['query', 'page'],
            rowLimit: 500,
          },
        });
        const queryPages = {};
        for (const r of (cannRes.data.rows || []).filter(r => !site.brandRegex.test(r.keys[0]))) {
          const q = r.keys[0];
          if (!queryPages[q]) queryPages[q] = [];
          queryPages[q].push({ url: r.keys[1], clicks: r.clicks, position: r.position.toFixed(1) });
        }
        for (const [q, pages] of Object.entries(queryPages)) {
          if (pages.length >= 2) {
            cannibalization.push({ query: q, pages });
          }
        }
      } catch (e) {
        console.log(`  Cannibalization check error: ${e.message}`);
      }

      // Step 4: Top 5 pages — we can get these from GSC page dimension
      let top5Pages = [];
      try {
        const pagesRes = await sc.searchanalytics.query({
          siteUrl: matchedUrl,
          requestBody: {
            startDate: fmt(startDate),
            endDate: fmt(endDate),
            dimensions: ['page'],
            rowLimit: 5,
          },
        });
        top5Pages = (pagesRes.data.rows || []).map(r => ({
          url: r.keys[0],
          clicks: r.clicks,
          impressions: r.impressions,
          position: r.position.toFixed(1),
        }));
      } catch (e) {
        console.log(`  Top pages error: ${e.message}`);
      }

      // Check for critical drops (top-10 query that fell off page 1, i.e., was <=10, now >10)
      for (const q of top20) {
        if (q.priorPosition && parseFloat(q.priorPosition) <= 10 && parseFloat(q.position) > 10) {
          criticalDrops.push({ site: site.name, ...q });
        }
      }

      // Also check if a query that was in top 20 prior disappeared entirely (big drop)
      const currentQuerySet = new Set(currentRows.map(r => r.keys[0]));
      for (const pr of priorRows.slice(0, 20)) {
        if (!currentQuerySet.has(pr.keys[0]) && pr.position <= 10 && pr.clicks >= 3) {
          criticalDrops.push({
            site: site.name,
            query: pr.keys[0],
            clicks: 0,
            position: 'GONE',
            priorClicks: pr.clicks,
            priorPosition: pr.position.toFixed(1),
            positionChange: 'DISAPPEARED',
          });
        }
      }

      results[site.name] = {
        matchedUrl,
        top20,
        dropped,
        cannibalization: cannibalization.slice(0, 15), // top 15 cannibalization issues
        top5Pages,
        totalNonBrandQueries: currentRows.length,
      };
    } catch (e) {
      results[site.name] = { error: e.message, matchedUrl };
      console.log(`  Error: ${e.message}`);
    }
  }

  // Output JSON for processing
  const output = { results, criticalDrops, timestamp: now.toISOString() };
  fs.writeFileSync(path.join(__dirname, '..', 'tmp', 'seo-audit-raw.json'), JSON.stringify(output, null, 2));
  console.log('\n=== RAW OUTPUT SAVED ===');
  console.log('Critical drops:', criticalDrops.length);
  console.log(JSON.stringify(output, null, 2));
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
