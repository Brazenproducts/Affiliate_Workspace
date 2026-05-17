const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Config
const SA_PATH = path.join(__dirname, '..', '.gcp-service-account.json');
const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));

const SITES = [
  { name: 'BARTACT', url: 'https://www.bartact.com/', brandRegex: /bartact|bar\s*tact/i },
  { name: 'BULL STRAP', url: 'https://www.bullstrap.com/', brandRegex: /bullstrap|bull\s*strap/i },
  { name: 'BOWTIE FILTERS', url: 'sc-domain:bowtiefilters.com', brandRegex: /bowtie|bow\s*tie/i },
  { name: 'WALK INDUSTRIAL', url: 'https://walkindustrial.com/', brandRegex: /walk\s*industrial/i },
  { name: 'BLOX FILTERS', url: 'https://bloxfilters.com/', brandRegex: /blox/i },
  { name: 'GRIDGUARDS USA', url: 'https://gridguardsusa.com/', brandRegex: /gridguard/i },
  { name: 'BEST SEAT COVER', url: 'sc-domain:bestseatcover.com', brandRegex: /bestseatcover/i },
  { name: 'JEEP SEAT COVER', url: 'sc-domain:jeepseatcover.com', brandRegex: /jeepseatcover/i },
  { name: 'WRANGLER SEAT COVER', url: 'sc-domain:wranglerseatcover.com', brandRegex: /wranglerseatcover/i },
  { name: 'TACTICAL SEATS', url: 'sc-domain:tacticalseats.com', brandRegex: /tacticalseats/i },
  { name: 'BEST BRONCO ACCESSORIES', url: 'sc-domain:bestbroncoaccessories.com', brandRegex: /bestbroncoaccessories/i },
];

// Date ranges: this week = Apr 27 - May 3, prior week = Apr 20 - Apr 26
const THIS_START = '2026-04-27';
const THIS_END = '2026-05-03';
const PRIOR_START = '2026-04-20';
const PRIOR_END = '2026-04-26';

async function getAuth() {
  const auth = new google.auth.JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  await auth.authorize();
  return auth;
}

async function queryGSC(webmasters, siteUrl, startDate, endDate, dimensions, rowLimit = 25, dimensionFilterGroups = undefined) {
  try {
    const res = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions,
        rowLimit,
        ...(dimensionFilterGroups ? { dimensionFilterGroups } : {}),
      },
    });
    return res.data.rows || [];
  } catch (e) {
    if (e.code === 403 || (e.response && e.response.status === 403)) {
      return { error: 'NO_ACCESS' };
    }
    throw e;
  }
}

async function auditSite(webmasters, site) {
  const result = {
    name: site.name,
    hasAccess: true,
    thisWeek: [],
    priorWeek: [],
    drops: [],
    cannibalization: [],
    criticalDrops: [],
    topPages: [],
    error: null,
  };

  // Pull query data for both weeks
  const [thisRows, priorRows] = await Promise.all([
    queryGSC(webmasters, site.url, THIS_START, THIS_END, ['query'], 500),
    queryGSC(webmasters, site.url, PRIOR_START, PRIOR_END, ['query'], 500),
  ]);

  if (thisRows.error || priorRows.error) {
    result.hasAccess = false;
    result.error = 'NO GSC ACCESS — Service account gets permission denied.';
    return result;
  }

  // Filter out brand terms
  const filterBrand = (rows) => rows.filter(r => !site.brandRegex.test(r.keys[0]));
  const thisFiltered = filterBrand(thisRows).sort((a, b) => a.position - b.position).slice(0, 20);
  const priorFiltered = filterBrand(priorRows).sort((a, b) => a.position - b.position).slice(0, 20);

  result.thisWeek = thisFiltered;
  result.priorWeek = priorFiltered;

  // Build lookup maps
  const thisMap = new Map(thisFiltered.map(r => [r.keys[0], r]));
  const priorMap = new Map(priorFiltered.map(r => [r.keys[0], r]));

  // Find drops: queries that dropped >1 position or disappeared
  const allQueries = new Set([...thisMap.keys(), ...priorMap.keys()]);
  for (const q of allQueries) {
    const prior = priorMap.get(q);
    const current = thisMap.get(q);

    if (prior && !current) {
      // Query disappeared from top 20
      result.drops.push({
        query: q,
        priorPos: prior.position,
        currentPos: null,
        change: null,
        priorClicks: prior.clicks,
        priorImpressions: prior.impressions,
        status: 'DISAPPEARED',
      });
      // Critical if was on page 1
      if (prior.position <= 10) {
        result.criticalDrops.push({
          query: q,
          priorPos: prior.position,
          currentPos: 'GONE',
          priorClicks: prior.clicks,
        });
      }
    } else if (prior && current && current.position - prior.position > 1) {
      const change = current.position - prior.position;
      result.drops.push({
        query: q,
        priorPos: prior.position,
        currentPos: current.position,
        change: change,
        priorClicks: prior.clicks,
        currentClicks: current.clicks,
        priorImpressions: prior.impressions,
        currentImpressions: current.impressions,
        status: 'DROPPED',
      });
      // Critical if was in top 10 and now off page 1
      if (prior.position <= 10 && current.position > 10) {
        result.criticalDrops.push({
          query: q,
          priorPos: prior.position,
          currentPos: current.position,
          change: change,
        });
      }
    }
  }

  // For dropped queries, get page-level data
  for (const drop of result.drops) {
    try {
      const pageRows = await queryGSC(webmasters, site.url, THIS_START, THIS_END, ['query', 'page'], 25, [{
        filters: [{ dimension: 'query', expression: drop.query, operator: 'equals' }]
      }]);
      if (!pageRows.error && pageRows.length > 0) {
        drop.pages = pageRows.map(r => ({
          url: r.keys[1],
          position: r.position,
          clicks: r.clicks,
          impressions: r.impressions,
        }));
      }

      // Also get prior week page data for comparison
      const priorPageRows = await queryGSC(webmasters, site.url, PRIOR_START, PRIOR_END, ['query', 'page'], 25, [{
        filters: [{ dimension: 'query', expression: drop.query, operator: 'equals' }]
      }]);
      if (!priorPageRows.error && priorPageRows.length > 0) {
        drop.priorPages = priorPageRows.map(r => ({
          url: r.keys[1],
          position: r.position,
          clicks: r.clicks,
          impressions: r.impressions,
        }));
      }
    } catch (e) {
      drop.pageError = e.message;
    }
  }

  // Check cannibalization: multiple pages for same query in top 20
  const topQueries = thisFiltered.slice(0, 10).map(r => r.keys[0]);
  for (const q of topQueries) {
    try {
      const pageRows = await queryGSC(webmasters, site.url, THIS_START, THIS_END, ['query', 'page'], 25, [{
        filters: [{ dimension: 'query', expression: q, operator: 'equals' }]
      }]);
      if (!pageRows.error && pageRows.length > 1) {
        result.cannibalization.push({
          query: q,
          pages: pageRows.map(r => ({
            url: r.keys[1],
            position: r.position,
            clicks: r.clicks,
            impressions: r.impressions,
          })),
        });
      }
    } catch (e) {
      // skip
    }
  }

  // Top 5 pages by clicks
  try {
    const pageData = await queryGSC(webmasters, site.url, THIS_START, THIS_END, ['page'], 5);
    if (!pageData.error) {
      result.topPages = pageData.map(r => ({
        url: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        position: r.position,
        ctr: r.ctr,
      }));
    }
  } catch (e) {
    // skip
  }

  return result;
}

function formatReport(results) {
  let md = `# Weekly Non-Brand SEO Audit — April 27 – May 3, 2026\n`;
  md += `**Generated:** 2026-05-04 17:00 UTC | **Compared to:** April 20–26, 2026\n\n`;
  md += `---\n\n`;

  // Collect all critical drops across sites
  const allCritical = [];
  for (const r of results) {
    for (const c of (r.criticalDrops || [])) {
      allCritical.push({ site: r.name, ...c });
    }
  }

  if (allCritical.length > 0) {
    md += `## 🚨 CRITICAL DROPS — ALERT REQUIRED\n\n`;
    for (const c of allCritical) {
      md += `- **${c.site}:** "${c.query}" — Position ${c.priorPos.toFixed(1)} → ${typeof c.currentPos === 'number' ? c.currentPos.toFixed(1) : c.currentPos}`;
      if (c.priorClicks) md += ` (was ${c.priorClicks} clicks/week)`;
      md += `\n`;
    }
    md += `\n---\n\n`;
  } else {
    md += `## ✅ No Critical Drops This Week\n\nNo top-10 queries fell off page 1 across any site.\n\n---\n\n`;
  }

  for (const r of results) {
    md += `## ${r.name}\n\n`;

    if (!r.hasAccess) {
      md += `**⚠️ NO GSC ACCESS** — ${r.error}\nNeed to add \`${sa.client_email}\` as a user in GSC for this property.\n\n---\n\n`;
      continue;
    }

    if (r.thisWeek.length === 0 && r.priorWeek.length === 0) {
      md += `**Zero non-brand queries.** No meaningful search presence detected for this period.\n\n---\n\n`;
      continue;
    }

    // Top 20 non-brand queries this week
    md += `### Top Non-Brand Queries (This Week)\n`;
    md += `| # | Query | Clicks | Impressions | Position | CTR |\n`;
    md += `|---|-------|--------|-------------|----------|-----|\n`;
    for (let i = 0; i < r.thisWeek.length; i++) {
      const q = r.thisWeek[i];
      md += `| ${i + 1} | ${q.keys[0]} | ${q.clicks} | ${q.impressions} | ${q.position.toFixed(1)} | ${(q.ctr * 100).toFixed(1)}% |\n`;
    }
    md += `\n`;

    // Drops
    if (r.drops.length > 0) {
      md += `### ⬇️ Position Drops (>1 position)\n\n`;
      for (const d of r.drops) {
        if (d.status === 'DISAPPEARED') {
          md += `**"${d.query}"** — DISAPPEARED from top 20\n`;
          md += `- Prior: pos ${d.priorPos.toFixed(1)}, ${d.priorClicks} clicks, ${d.priorImpressions} impressions\n`;
        } else {
          md += `**"${d.query}"** — Position ${d.priorPos.toFixed(1)} → ${d.currentPos.toFixed(1)} (+${d.change.toFixed(1)})\n`;
          md += `- Clicks: ${d.priorClicks} → ${d.currentClicks} | Impressions: ${d.priorImpressions} → ${d.currentImpressions}\n`;
        }
        if (d.pages && d.pages.length > 0) {
          md += `- **Current URLs ranking:**\n`;
          for (const p of d.pages) {
            md += `  - \`${p.url}\` — pos ${p.position.toFixed(1)}, ${p.clicks} clicks, ${p.impressions} imp\n`;
          }
        }
        if (d.priorPages && d.priorPages.length > 0) {
          md += `- **Prior week URLs:**\n`;
          for (const p of d.priorPages) {
            md += `  - \`${p.url}\` — pos ${p.position.toFixed(1)}, ${p.clicks} clicks, ${p.impressions} imp\n`;
          }
        }
        md += `\n`;
      }
    } else {
      md += `### ✅ No Significant Position Drops\n\n`;
    }

    // Cannibalization
    if (r.cannibalization.length > 0) {
      md += `### 🔀 Cannibalization Issues\n\n`;
      for (const c of r.cannibalization) {
        md += `**"${c.query}"** — ${c.pages.length} URLs competing:\n`;
        for (const p of c.pages) {
          md += `- \`${p.url}\` — pos ${p.position.toFixed(1)}, ${p.clicks} clicks, ${p.impressions} imp\n`;
        }
        md += `\n`;
      }
    } else {
      md += `### ✅ No Cannibalization Detected\n\n`;
    }

    // Top 5 pages
    if (r.topPages.length > 0) {
      md += `### Top 5 Pages by Clicks\n`;
      md += `| Page | Clicks | Impressions | Avg Position | CTR |\n`;
      md += `|------|--------|-------------|-------------|-----|\n`;
      for (const p of r.topPages) {
        const shortUrl = p.url.replace(/https?:\/\/[^/]+/, '');
        md += `| ${shortUrl || '/'} | ${p.clicks} | ${p.impressions} | ${p.position.toFixed(1)} | ${(p.ctr * 100).toFixed(1)}% |\n`;
      }
      md += `\n`;
    }

    md += `---\n\n`;
  }

  return md;
}

async function main() {
  console.log('Starting weekly SEO audit...');
  const auth = await getAuth();
  const webmasters = google.webmasters({ version: 'v3', auth });

  const results = [];
  for (const site of SITES) {
    console.log(`Auditing ${site.name}...`);
    try {
      const r = await auditSite(webmasters, site);
      results.push(r);
      console.log(`  ${site.name}: ${r.hasAccess ? 'OK' : 'NO ACCESS'} — ${r.thisWeek.length} queries, ${r.drops.length} drops, ${r.criticalDrops.length} critical`);
    } catch (e) {
      console.error(`  ${site.name} ERROR: ${e.message}`);
      results.push({
        name: site.name,
        hasAccess: false,
        thisWeek: [],
        priorWeek: [],
        drops: [],
        cannibalization: [],
        criticalDrops: [],
        topPages: [],
        error: e.message,
      });
    }
  }

  const report = formatReport(results);
  const outPath = path.join(__dirname, '..', 'memory', 'seo-audit-weekly.md');
  fs.writeFileSync(outPath, report);
  console.log(`\nReport written to ${outPath}`);

  // Output critical drops as JSON for alerting
  const allCritical = [];
  for (const r of results) {
    for (const c of (r.criticalDrops || [])) {
      allCritical.push({ site: r.name, ...c });
    }
  }
  console.log(`\n=== CRITICAL_DROPS_JSON ===`);
  console.log(JSON.stringify(allCritical));
  console.log(`=== END_CRITICAL_DROPS_JSON ===`);
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
