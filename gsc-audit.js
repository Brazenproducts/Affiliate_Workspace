const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SA_PATH = path.join(__dirname, '.gcp-service-account.json');
const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));

const SITES = [
  'sc-domain:bestseatcover.com',
  'sc-domain:jeepseatcover.com',
  'sc-domain:wranglerseatcover.com',
  'sc-domain:tacticalseats.com',
  'sc-domain:bestbroncoaccessories.com',
];

// Periods
const CURRENT_START = '2026-07-27';
const CURRENT_END   = '2026-08-02'; // GSC uses inclusive end; 7 days: 27,28,29,30,31,Aug1,Aug2
const PRIOR_START   = '2026-07-20';
const PRIOR_END     = '2026-07-26';

async function getAuth() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: sa.client_email,
      private_key: sa.private_key,
      private_key_id: sa.private_key_id,
      client_id: sa.client_id,
    },
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  return auth.getClient();
}

async function queryGSC(webmasters, siteUrl, startDate, endDate) {
  try {
    const res = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query', 'page'],
        rowLimit: 20,
        dataState: 'final',
      },
    });
    return res.data.rows || [];
  } catch (err) {
    return { error: err.message };
  }
}

function siteName(siteUrl) {
  return siteUrl.replace('sc-domain:', '');
}

async function auditSite(webmasters, siteUrl) {
  const name = siteName(siteUrl);
  console.log(`\n=== ${name} ===`);

  const [currentRows, priorRows] = await Promise.all([
    queryGSC(webmasters, siteUrl, CURRENT_START, CURRENT_END),
    queryGSC(webmasters, siteUrl, PRIOR_START, PRIOR_END),
  ]);

  if (currentRows.error) {
    console.log(`  ERROR (current): ${currentRows.error}`);
    return { site: name, error: currentRows.error };
  }
  if (priorRows.error) {
    console.log(`  ERROR (prior): ${priorRows.error}`);
    return { site: name, error: priorRows.error };
  }

  // Build prior map: query -> { position, clicks, impressions }
  const priorMap = {};
  for (const row of priorRows) {
    const q = row.keys[0];
    const pg = row.keys[1];
    priorMap[`${q}||${pg}`] = {
      position: row.position,
      clicks: row.clicks,
      impressions: row.impressions,
    };
  }

  const findings = [];
  const dropped_page1 = [];
  const dropped_over1 = [];

  console.log(`  Current rows: ${currentRows.length}, Prior rows: ${priorRows.length}`);
  console.log(`\n  Top 20 queries (current period ${CURRENT_START}–${CURRENT_END}):`);

  for (const row of currentRows) {
    const query = row.keys[0];
    const page  = row.keys[1];
    const curPos = row.position;
    const prior = priorMap[`${query}||${page}`];
    const priorPos = prior ? prior.position : null;
    const delta = priorPos !== null ? (curPos - priorPos) : null; // positive = dropped

    const flag_p1   = curPos > 10 && (priorPos !== null && priorPos <= 10);
    const flag_drop = delta !== null && delta > 1;

    const marker = flag_p1 ? ' ⚠️ PAGE1-DROP' : (flag_drop ? ' 📉 DROPPED' : '');

    console.log(
      `  [${curPos.toFixed(1)}${priorPos !== null ? ` (was ${priorPos.toFixed(1)}, Δ${delta >= 0 ? '+' : ''}${delta.toFixed(1)})` : ' (new)'}]` +
      ` "${query}" → ${page}${marker}`
    );

    const entry = {
      query,
      page,
      currentPosition: Math.round(curPos * 10) / 10,
      priorPosition: priorPos !== null ? Math.round(priorPos * 10) / 10 : null,
      delta: delta !== null ? Math.round(delta * 10) / 10 : null,
      clicks: row.clicks,
      impressions: row.impressions,
      dropped_off_page1: flag_p1,
      dropped_gt1pos: flag_drop,
    };
    findings.push(entry);
    if (flag_p1) dropped_page1.push(entry);
    if (flag_drop && !flag_p1) dropped_over1.push(entry);
  }

  return { site: name, findings, dropped_page1, dropped_over1 };
}

async function main() {
  const auth = await getAuth();
  const webmasters = google.webmasters({ version: 'v3', auth });

  const allResults = [];
  for (const siteUrl of SITES) {
    const result = await auditSite(webmasters, siteUrl);
    allResults.push(result);
  }

  // Write JSON for parent agent
  fs.writeFileSync(
    path.join(__dirname, 'gsc-audit-results.json'),
    JSON.stringify(allResults, null, 2)
  );
  console.log('\n\nResults written to gsc-audit-results.json');
}

main().catch(e => { console.error(e); process.exit(1); });
