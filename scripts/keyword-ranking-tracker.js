#!/usr/bin/env node
/**
 * keyword-ranking-tracker.js
 * Tracks keyword rankings across all sites via GSC.
 * - Pulls top 100 keywords by impressions for each site
 * - Compares against target keywords for each site
 * - Identifies position changes vs last run
 * - Flags opportunities (high impressions, low position)
 * - Flags threats (dropping keywords)
 * - Sends report to Slashdaddy session
 * 
 * Runs: daily at 6am UTC
 */

'use strict';

const crypto = require('crypto');
const https  = require('https');
const fs     = require('fs');
const path   = require('path');

const MEMORY_DIR = path.resolve(__dirname, '../memory');
const STATE_FILE = path.join(MEMORY_DIR, 'keyword-ranking-state.json');
const sa = require('/home/ubuntu/.openclaw/workspace/.gcp-service-account.json');

// ── SITES TO TRACK ─────────────────────────────────────────────────────────
const SITES = [
  {
    name: 'Bartact',
    gscProperty: 'https://bartact.com/',
    credsFile: '/home/ubuntu/.openclaw/workspace/.gcp-service-account.json',
    useServiceAccount: true,
    targetKeywords: [
      // ── SEAT COVERS (primary battleground) ──
      'jeep seat covers',
      'jeep wrangler seat covers',
      'jeep wrangler jl seat covers',
      'jeep wrangler jk seat covers',
      'jeep wrangler tj seat covers',
      'jeep gladiator seat covers',
      'ford bronco seat covers',
      'toyota tacoma seat covers',
      'jeep 4xe seat covers',
      'custom jeep seat covers',
      'neoprene jeep seat covers',
      'cordura jeep seat covers',
      // ── GRAB HANDLES ──
      'jeep grab handles',
      'jeep wrangler grab handles',
      'paracord grab handles',
      'jeep wrangler paracord grab handles',
      'ford bronco grab handles',
      'jeep gladiator grab handles',
      'jeep roll bar grab handles',
      // ── MOLLE / STORAGE ──
      'jeep molle accessories',
      'jeep wrangler molle',
      'jeep molle seat back',
      'jeep wrangler storage bags',
      'jeep wrangler door storage',
      'ford bronco door storage',
      'ford bronco console organizer',
      'ford bronco molle',
      // ── FIRE EXTINGUISHER MOUNTS ──
      'jeep fire extinguisher mount',
      'jeep wrangler fire extinguisher holder',
      'roll bar fire extinguisher mount',
      'ford bronco fire extinguisher mount',
      // ── WINCH COVERS ──
      'jeep winch cover',
      'jeep wrangler winch cover',
      'winch cover waterproof',
      // ── SUN SHADES ──
      'jeep wrangler sun shade',
      'jeep wrangler jl sun shade',
      'jeep gladiator sun shade',
      // ── BRAND + GENERAL ──
      'bartact',
      'bartact seat covers',
      'bartact grab handles',
      'bartact molle',
      'mil spec jeep accessories',
      'made in usa jeep accessories',
    ],
    positionTargets: {
      // Seat covers
      'jeep seat covers': 3,
      'jeep wrangler seat covers': 3,
      'jeep wrangler jl seat covers': 3,
      'jeep wrangler jk seat covers': 5,
      'jeep wrangler tj seat covers': 5,
      'jeep gladiator seat covers': 3,
      'ford bronco seat covers': 5,
      'toyota tacoma seat covers': 10,
      // Grab handles
      'jeep grab handles': 1,
      'paracord grab handles': 1,
      'jeep wrangler grab handles': 1,
      'ford bronco grab handles': 3,
      // MOLLE
      'jeep molle seat back': 3,
      'ford bronco door storage': 3,
      'ford bronco console organizer': 3,
      // Fire extinguisher
      'jeep fire extinguisher mount': 3,
      'roll bar fire extinguisher mount': 3,
      // Brand
      'bartact': 1,
      'bartact seat covers': 1,
    }
  },
  {
    name: 'Bull Strap',
    gscProperty: 'https://bullstrap.com/',
    credsFile: '/home/ubuntu/.openclaw/workspace/.bullstrap-indexing-credentials.json',
    useServiceAccount: false,
    targetKeywords: [
      // ── LIMIT STRAPS (hero product) ──
      'suspension limit straps',
      'limit straps',
      'jeep limit straps',
      'how to measure for limit straps',
      'limit strap jeep wrangler',
      'off road limit straps',
      'jeep wrangler limit straps',
      'jeep jk limit straps',
      'jeep jl limit straps',
      'limit strap length',
      'limit strap install',
      'what are limit straps',
      'limit straps vs bump stops',
      // ── CARLI SUSPENSION ──
      'carli suspension',
      'carli suspension ram 2500',
      'carli suspension ram 3500',
      'carli suspension ford f-250',
      'carli suspension coilovers',
      'carli suspension track bar',
      'carli suspension radius arms',
      'carli suspension dealers',
      // ── SUSPENSION PARTS ──
      'coilovers jeep wrangler',
      'jeep wrangler coilovers',
      'ram 2500 suspension lift',
      'ford f-250 suspension lift',
      'jeep lift kit',
      'jeep wrangler lift kit',
      // ── BRAKE LINES ──
      'brake line kit jeep',
      'jeep wrangler brake lines',
      'stainless brake lines jeep',
      // ── GRAB HANDLES / ACCESSORIES ──
      'jeep grab handles',
      'off road grab handles',
      // ── BRAND ──
      'bull strap',
      'bullstrap',
      'bull strap limit straps',
    ],
    positionTargets: {
      // Limit straps
      'suspension limit straps': 5,
      'limit straps': 10,
      'jeep limit straps': 5,
      'how to measure for limit straps': 3,
      'limit straps vs bump stops': 5,
      'what are limit straps': 5,
      // Carli
      'carli suspension ram 2500': 10,
      'carli suspension': 15,
      'carli suspension dealers': 5,
      // Brand
      'bull strap': 1,
      'bullstrap': 1,
      'bull strap limit straps': 1,
    }
  }
];

// ── JWT + AUTH ──────────────────────────────────────────────────────────────
function createJWT(saData) {
  const now = Math.floor(Date.now() / 1000);
  const h = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const p = Buffer.from(JSON.stringify({
    iss: saData.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600
  })).toString('base64url');
  const sig = crypto.createSign('RSA-SHA256').update(h + '.' + p).sign(saData.private_key, 'base64url');
  return h + '.' + p + '.' + sig;
}

function httpReq(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function getTokenServiceAccount(saData) {
  const jwt = createJWT(saData);
  const resp = await httpReq({
    hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }, new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }).toString());
  return JSON.parse(resp).access_token;
}

async function getTokenOAuth(creds) {
  const resp = await httpReq({
    hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }, new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: creds.client_id,
    client_secret: creds.client_secret,
    refresh_token: creds.refresh_token,
  }).toString());
  return JSON.parse(resp).access_token;
}

async function queryGSC(token, property, startDate, endDate, limit = 200) {
  const encodedProp = encodeURIComponent(property);
  const body = JSON.stringify({
    startDate, endDate,
    dimensions: ['query'],
    rowLimit: limit,
    orderBy: [{ fieldName: 'impressions', sortOrder: 'DESCENDING' }]
  });
  const resp = await httpReq({
    hostname: 'www.googleapis.com',
    path: `/webmasters/v3/sites/${encodedProp}/searchAnalytics/query`,
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
  }, body);
  return JSON.parse(resp);
}

// ── MAIN ───────────────────────────────────────────────────────────────────
async function main() {
  const now = new Date();
  const endDate   = new Date(now - 2 * 86400000).toISOString().slice(0, 10);
  const startDate = new Date(now - 30 * 86400000).toISOString().slice(0, 10);
  const today     = now.toISOString().slice(0, 10);

  // Load previous state
  let prevState = {};
  if (fs.existsSync(STATE_FILE)) {
    try { prevState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch {}
  }

  const newState = { date: today, sites: {} };
  const allFindings = [];

  for (const site of SITES) {
    console.log(`\nProcessing ${site.name}...`);
    let token;
    try {
      if (site.useServiceAccount) {
        const saData = JSON.parse(fs.readFileSync(site.credsFile, 'utf8'));
        token = await getTokenServiceAccount(saData);
      } else {
        const creds = JSON.parse(fs.readFileSync(site.credsFile, 'utf8'));
        token = await getTokenOAuth(creds);
      }
    } catch (e) {
      console.log(`  Auth failed for ${site.name}: ${e.message}`);
      allFindings.push({ site: site.name, type: 'error', message: `Auth failed: ${e.message}` });
      continue;
    }

    let data;
    try {
      data = await queryGSC(token, site.gscProperty, startDate, endDate);
    } catch (e) {
      console.log(`  GSC query failed for ${site.name}: ${e.message}`);
      continue;
    }

    if (!data.rows) {
      console.log(`  No data rows for ${site.name}`);
      continue;
    }

    // Build keyword map
    const keywordMap = {};
    for (const row of data.rows) {
      keywordMap[row.keys[0].toLowerCase()] = {
        position: Math.round(row.position * 10) / 10,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: Math.round(row.ctr * 1000) / 10,
      };
    }

    newState.sites[site.name] = keywordMap;
    const prevKeywords = (prevState.sites || {})[site.name] || {};

    const findings = {
      site: site.name,
      topKeywords: [],
      targetKeywords: [],
      opportunities: [],
      threats: [],
      wins: [],
    };

    // Top 10 by impressions
    const top10 = data.rows.slice(0, 10).map(r => ({
      keyword: r.keys[0],
      position: Math.round(r.position * 10) / 10,
      impressions: r.impressions,
      clicks: r.clicks,
    }));
    findings.topKeywords = top10;

    // Target keyword tracking
    for (const kw of site.targetKeywords) {
      const current = keywordMap[kw];
      const prev    = prevKeywords[kw];
      const target  = (site.positionTargets || {})[kw];

      if (current) {
        const posChange = prev ? Math.round((prev.position - current.position) * 10) / 10 : null;
        const entry = {
          keyword: kw,
          position: current.position,
          impressions: current.impressions,
          clicks: current.clicks,
          change: posChange,
          target: target || null,
          gapToTarget: target ? Math.round((current.position - target) * 10) / 10 : null,
        };
        findings.targetKeywords.push(entry);

        // Wins — moved up 3+
        if (posChange && posChange >= 3) {
          findings.wins.push({ keyword: kw, improved: posChange, now: current.position });
        }
        // Threats — dropped 3+
        if (posChange && posChange <= -3) {
          findings.threats.push({ keyword: kw, dropped: Math.abs(posChange), now: current.position });
        }
      } else {
        findings.targetKeywords.push({ keyword: kw, position: 'not ranking', impressions: 0, clicks: 0 });
      }
    }

    // Opportunities — high impressions (1000+) but position > 20
    const opportunities = data.rows
      .filter(r => r.impressions >= 500 && r.position > 20)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 5)
      .map(r => ({ keyword: r.keys[0], position: Math.round(r.position * 10) / 10, impressions: r.impressions }));
    findings.opportunities = opportunities;

    allFindings.push(findings);

    // Console summary
    console.log(`  Top keyword: "${top10[0]?.keyword}" pos ${top10[0]?.position} (${top10[0]?.impressions} imps)`);
    if (findings.wins.length) console.log(`  ✅ Wins: ${findings.wins.map(w => `"${w.keyword}" +${w.improved}`).join(', ')}`);
    if (findings.threats.length) console.log(`  ⚠️  Threats: ${findings.threats.map(t => `"${t.keyword}" -${t.dropped}`).join(', ')}`);
    if (findings.opportunities.length) console.log(`  💡 Top opportunity: "${findings.opportunities[0].keyword}" pos ${findings.opportunities[0].position} (${findings.opportunities[0].impressions} imps)`);
  }

  // Save state
  fs.writeFileSync(STATE_FILE, JSON.stringify(newState, null, 2));

  // ── BUILD REPORT ──────────────────────────────────────────────────────────
  let report = `📊 **KEYWORD RANKING REPORT — ${today}**\n\n`;

  for (const f of allFindings) {
    if (f.type === 'error') {
      report += `**${f.site}** ❌ ${f.message}\n\n`;
      continue;
    }

    report += `**${f.site.toUpperCase()}**\n`;

    // Target keywords
    report += `\n🎯 Target Keywords:\n`;
    for (const kw of f.targetKeywords) {
      if (kw.position === 'not ranking') {
        report += `  • "${kw.keyword}" — not ranking\n`;
      } else {
        const changeStr = kw.change !== null ? (kw.change > 0 ? ` ↑${kw.change}` : kw.change < 0 ? ` ↓${Math.abs(kw.change)}` : ' —') : ' (new)';
        const targetStr = kw.gapToTarget ? (kw.gapToTarget <= 0 ? ' ✅ AT TARGET' : ` (${kw.gapToTarget} from target #${kw.target})`) : '';
        report += `  • "${kw.keyword}" — pos ${kw.position}${changeStr}${targetStr} | ${kw.impressions} imps / ${kw.clicks} clicks\n`;
      }
    }

    // Wins
    if (f.wins.length) {
      report += `\n✅ Wins (moved up 3+):\n`;
      f.wins.forEach(w => report += `  • "${w.keyword}" improved ${w.improved} spots → now pos ${w.now}\n`);
    }

    // Threats
    if (f.threats.length) {
      report += `\n⚠️ Threats (dropped 3+):\n`;
      f.threats.forEach(t => report += `  • "${t.keyword}" dropped ${t.dropped} spots → now pos ${t.now}\n`);
    }

    // Opportunities
    if (f.opportunities.length) {
      report += `\n💡 High-impression opportunities (pos 20+):\n`;
      f.opportunities.forEach(o => report += `  • "${o.keyword}" — pos ${o.position} | ${o.impressions} imps — build a page for this\n`);
    }

    report += `\n`;
  }

  report += `\nFull state saved to: ${STATE_FILE}`;

  console.log('\n' + report);

  // Save report to memory
  const reportPath = path.join(MEMORY_DIR, `keyword-rankings-${today}.md`);
  fs.writeFileSync(reportPath, report);
  console.log(`\nReport saved to ${reportPath}`);
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
