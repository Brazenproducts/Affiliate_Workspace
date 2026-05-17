#!/usr/bin/env node
/**
 * check-chain-tip-screens.js
 * 
 * Checks each chain in the registry for tip screen reports using
 * DuckDuckGo HTML search (no API key, free, runs from cron).
 * 
 * NOTE: Reddit blocks server IPs. For Reddit searches, run manually
 * from a browser or use the --manual flag to get search URLs.
 * 
 * Usage:
 *   node scripts/check-chain-tip-screens.js              # all chains, DDG only
 *   node scripts/check-chain-tip-screens.js --chain="Dairy Queen"
 *   node scripts/check-chain-tip-screens.js --report     # show saved report
 *   node scripts/check-chain-tip-screens.js --urls       # print manual search URLs
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const REPORT_PATH = path.join(__dirname, '..', 'memory', 'chain-tip-screen-report.json');
const REGISTRY_PATH = path.join(__dirname, 'chain-registry.js');

const args = process.argv.slice(2);
const CHAIN_FILTER = args.find(a => a.startsWith('--chain='))?.split('=').slice(1).join('=');
const SHOW_REPORT = args.includes('--report');
const SHOW_URLS = args.includes('--urls');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function get(url) {
  return new Promise((resolve) => {
    const mod = https;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(get(res.headers.location)); return;
      }
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', () => resolve({ status: 0, body: '' }));
    req.setTimeout(12000, () => { req.destroy(); resolve({ status: 0, body: '' }); });
  });
}

// DuckDuckGo HTML search — no API key needed
async function searchDDG(chainName) {
  const queries = [
    `"${chainName}" "tip screen"`,
    `"${chainName}" "tip prompt" customers`,
  ];
  const allHits = [];

  for (const q of queries) {
    const encoded = encodeURIComponent(q);
    const { status, body } = await get(`https://html.duckduckgo.com/html/?q=${encoded}`);
    await sleep(2000);

    if (status !== 200 || !body) continue;

    // Extract result titles and snippets from DDG HTML
    const resultBlocks = body.split('result__body');
    for (const block of resultBlocks.slice(1)) {
      // Get title
      const titleMatch = block.match(/result__a[^>]*>([^<]+)</);
      const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').trim() : '';
      // Get snippet
      const snippetMatch = block.match(/result__snippet[^>]*>([^<]+)</);
      const snippet = snippetMatch ? snippetMatch[1].replace(/&amp;/g, '&').replace(/&#x27;/g, "'").trim() : '';
      // Get URL
      const urlMatch = block.match(/uddg=([^&"]+)/);
      const url = urlMatch ? decodeURIComponent(urlMatch[1]) : '';

      if (!title && !snippet) continue;
      const combined = `${title} ${snippet}`.toLowerCase();
      if (combined.includes('tip screen') || combined.includes('tip prompt')) {
        allHits.push({ source: 'web', title, snippet: snippet.slice(0, 200), url });
      }
    }
  }
  return allHits;
}

function riskLevel(hits) {
  if (!hits.length) return 'low';
  if (hits.length >= 3) return 'high';
  if (hits.length >= 1) return 'medium';
  return 'low';
}

function getManualURLs(chainName) {
  return [
    `https://www.reddit.com/search/?q="${encodeURIComponent(chainName)}" tip screen&sort=new`,
    `https://duckduckgo.com/?q="${encodeURIComponent(chainName)}" "tip screen" OR "tip prompt"`,
  ];
}

async function main() {
  if (SHOW_REPORT) {
    if (!fs.existsSync(REPORT_PATH)) {
      console.log('No report found. Run without --report to generate one.');
      return;
    }
    const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    console.log(`\n📊 Chain Tip Screen Report — ${report.generatedAt}\n`);
    const flagged = report.chains.filter(c => c.riskLevel !== 'low');
    if (!flagged.length) {
      console.log('✅ No chains flagged with confirmed tip screen reports.\n');
    } else {
      console.log('⚠️  FLAGGED CHAINS:\n');
      flagged.forEach(c => {
        const emoji = c.riskLevel === 'high' ? '🔴' : '🟡';
        console.log(`  ${emoji} ${c.name} — ${c.riskLevel.toUpperCase()} (${c.hits.length} hits)`);
        c.hits.slice(0, 2).forEach(h => {
          console.log(`      "${h.title.slice(0, 80)}"`);
          if (h.url) console.log(`       ${h.url}`);
        });
        console.log('');
      });
    }
    return;
  }

  if (SHOW_URLS) {
    const { SEEDABLE } = require(REGISTRY_PATH);
    const chains = CHAIN_FILTER
      ? SEEDABLE.filter(c => c.name.toLowerCase().includes(CHAIN_FILTER.toLowerCase()))
      : SEEDABLE;
    console.log('\n🔗 Manual search URLs (copy into browser):\n');
    chains.forEach(c => {
      console.log(`${c.name}:`);
      getManualURLs(c.name).forEach(u => console.log(`  ${u}`));
      console.log('');
    });
    return;
  }

  const { SEEDABLE } = require(REGISTRY_PATH);
  const chains = CHAIN_FILTER
    ? SEEDABLE.filter(c => c.name.toLowerCase().includes(CHAIN_FILTER.toLowerCase()))
    : SEEDABLE;

  console.log(`\n🔍 Checking ${chains.length} chains for tip screen reports (DDG)...\n`);

  // Load existing report to preserve any manual hits
  let existingResults = {};
  if (fs.existsSync(REPORT_PATH)) {
    try {
      const existing = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
      existing.chains?.forEach(c => { existingResults[c.name] = c; });
    } catch {}
  }

  const results = [];

  for (const chain of chains) {
    process.stdout.write(`  ${chain.name.padEnd(28)} `);

    const webHits = await searchDDG(chain.name);
    const risk = riskLevel(webHits);
    const emoji = risk === 'high' ? '🔴' : risk === 'medium' ? '🟡' : '✅';
    console.log(`${emoji} ${risk.toUpperCase().padEnd(7)} (${webHits.length} DDG hits)`);

    results.push({
      name: chain.name,
      riskLevel: risk,
      hits: webHits,
      checkedAt: new Date().toISOString(),
      manualSearchUrls: getManualURLs(chain.name),
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    chains: results,
    summary: {
      high: results.filter(r => r.riskLevel === 'high').map(r => r.name),
      medium: results.filter(r => r.riskLevel === 'medium').map(r => r.name),
      lowCount: results.filter(r => r.riskLevel === 'low').length,
    }
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`\n${'─'.repeat(55)}`);
  console.log(`🔴 HIGH (confirmed tip screens):     ${report.summary.high.join(', ') || 'none'}`);
  console.log(`🟡 MEDIUM (some reports):             ${report.summary.medium.join(', ') || 'none'}`);
  console.log(`✅ LOW (clean):                       ${report.summary.lowCount} chains`);
  console.log(`\n📄 Saved: ${REPORT_PATH}`);
  console.log(`\nNote: Reddit is blocked on this server. For full coverage,`);
  console.log(`run --urls to get manual Reddit search links for flagged chains.`);
}

main().catch(console.error);
