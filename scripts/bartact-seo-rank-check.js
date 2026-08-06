#!/usr/bin/env node
/**
 * Bartact Daily SEO Health & Rank Check
 * - Reads Google rank results from /tmp/bartact-rank-results.json
 * - Reads Bing rank results from /tmp/bartact-bing-rank-results.json
 * - Checks sitemap, robots.txt, page speed basics
 * - Sends Telegram alert if issues found
 * - Writes summary to memory/seo-daily-YYYY-MM-DD.md
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const GOOGLE_RANK_FILE = '/tmp/bartact-rank-results.json';
const BING_RANK_FILE = '/tmp/bartact-bing-rank-results.json';
const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const MEMORY_DIR = path.join(WORKSPACE, 'memory');

// Telegram config (from existing scripts)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

const today = new Date().toISOString().split('T')[0];

function fetchUrl(url, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BartactSEOBot/1.0)',
        'Accept': '*/*'
      }
    };
    const req = lib.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data, url }));
    });
    req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
    req.on('error', reject);
    req.end();
  });
}

async function sendTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('No Telegram credentials configured — skipping alert');
    return false;
  }
  try {
    await fetchUrl(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}&parse_mode=Markdown`
    );
    return true;
  } catch (e) {
    console.log(`Telegram send failed: ${e.message}`);
    return false;
  }
}

async function checkSitemap() {
  const issues = [];
  try {
    const res = await fetchUrl('https://www.bartact.com/sitemap.xml');
    if (res.status !== 200) {
      issues.push(`Sitemap HTTP ${res.status}`);
    } else if (!res.body.includes('<urlset') && !res.body.includes('<sitemapindex')) {
      issues.push('Sitemap response not valid XML');
    } else {
      const urlCount = (res.body.match(/<url>/g) || []).length;
      const sitemapCount = (res.body.match(/<sitemap>/g) || []).length;
      console.log(`Sitemap OK — URLs: ${urlCount}, Sitemaps: ${sitemapCount}`);
      return { ok: true, urlCount, sitemapCount };
    }
  } catch (e) {
    issues.push(`Sitemap fetch error: ${e.message}`);
  }
  return { ok: false, issues };
}

async function checkRobots() {
  const issues = [];
  try {
    const res = await fetchUrl('https://www.bartact.com/robots.txt');
    if (res.status !== 200) {
      issues.push(`robots.txt HTTP ${res.status}`);
    } else if (res.body.includes('Disallow: /') && !res.body.includes('Allow:')) {
      issues.push('robots.txt may be blocking all crawlers!');
    } else {
      const hasUserAgent = res.body.includes('User-agent:');
      const hasSitemap = res.body.toLowerCase().includes('sitemap:');
      console.log(`robots.txt OK — User-agent: ${hasUserAgent}, Sitemap ref: ${hasSitemap}`);
      return { ok: true, hasUserAgent, hasSitemap };
    }
  } catch (e) {
    issues.push(`robots.txt fetch error: ${e.message}`);
  }
  return { ok: false, issues };
}

async function checkHomepage() {
  const issues = [];
  try {
    const startTime = Date.now();
    const res = await fetchUrl('https://www.bartact.com/', 15000);
    const loadMs = Date.now() - startTime;
    
    if (res.status !== 200) {
      issues.push(`Homepage HTTP ${res.status}`);
      return { ok: false, issues };
    }

    const body = res.body;
    const checks = {
      hasTitle: /<title[^>]*>[^<]{10,}<\/title>/i.test(body),
      hasH1: /<h1[^>]*>[^<]+<\/h1>/i.test(body),
      hasCanonical: /rel=["']canonical["']/i.test(body),
      hasMetaDesc: /name=["']description["']/i.test(body),
      hasStructuredData: /application\/ld\+json/i.test(body),
      hasOGTags: /property=["']og:/i.test(body),
      loadMs,
      slowLoad: loadMs > 3000
    };

    if (checks.slowLoad) issues.push(`Homepage slow: ${loadMs}ms`);
    if (!checks.hasTitle) issues.push('Missing <title> tag');
    if (!checks.hasH1) issues.push('Missing <h1> tag');
    if (!checks.hasMetaDesc) issues.push('Missing meta description');

    console.log(`Homepage OK — ${loadMs}ms | Title: ${checks.hasTitle} | H1: ${checks.hasH1} | Canonical: ${checks.hasCanonical} | Schema: ${checks.hasStructuredData}`);
    return { ok: true, ...checks };
  } catch (e) {
    issues.push(`Homepage error: ${e.message}`);
    return { ok: false, issues };
  }
}

async function main() {
  console.log(`\n=== BARTACT DAILY SEO HEALTH CHECK — ${today} ===\n`);

  const report = {
    date: today,
    googleRanks: null,
    bingRanks: null,
    sitemap: null,
    robots: null,
    homepage: null,
    issues: [],
    alerts: []
  };

  // 1. Load Google rank results
  console.log('--- Google Rank Results ---');
  if (fs.existsSync(GOOGLE_RANK_FILE)) {
    try {
      report.googleRanks = JSON.parse(fs.readFileSync(GOOGLE_RANK_FILE, 'utf8'));
      const ranked = Object.entries(report.googleRanks).filter(([k, v]) => v.rank !== null);
      const unranked = Object.entries(report.googleRanks).filter(([k, v]) => v.rank === null);
      console.log(`  Ranked in top 20: ${ranked.length} / ${Object.keys(report.googleRanks).length} keywords`);
      ranked.sort((a, b) => a[1].rank - b[1].rank).forEach(([kw, d]) => {
        console.log(`  #${d.rank} — ${kw}`);
      });
      if (unranked.length > 0) {
        console.log(`  Not ranked (top 20): ${unranked.map(([k]) => k).join(', ')}`);
      }
      
      // Flag if < 10 keywords rank top 20
      if (ranked.length < 10) {
        report.issues.push(`Only ${ranked.length}/18 target keywords rank in Google top 20`);
      }
    } catch (e) {
      console.log(`  Failed to load Google ranks: ${e.message}`);
      report.issues.push(`Google rank file parse error: ${e.message}`);
    }
  } else {
    console.log('  Google rank results file not found');
    report.issues.push('Google rank results not available');
  }

  // 2. Load Bing rank results
  console.log('\n--- Bing Rank Results ---');
  if (fs.existsSync(BING_RANK_FILE)) {
    try {
      report.bingRanks = JSON.parse(fs.readFileSync(BING_RANK_FILE, 'utf8'));
      if (report.bingRanks.topPages && report.bingRanks.topPages.length > 0) {
        console.log(`  Top Bing pages (by clicks):`);
        report.bingRanks.topPages.slice(0, 10).forEach((p, i) => {
          console.log(`  ${i+1}. ${p.url} — ${p.clicks} clicks, pos ${p.avgPosition || '?'}`);
        });
      } else {
        console.log('  No Bing top pages data');
        report.issues.push('Bing top pages data unavailable');
      }
      if (report.bingRanks.topKeywords && report.bingRanks.topKeywords.length > 0) {
        console.log(`  Top Bing keywords:`);
        report.bingRanks.topKeywords.slice(0, 10).forEach((k, i) => {
          console.log(`  ${i+1}. "${k.keyword}" — ${k.clicks} clicks, pos ${k.avgPosition || '?'}`);
        });
      }
      if (report.bingRanks.errors && report.bingRanks.errors.length > 0) {
        report.bingRanks.errors.forEach(e => report.issues.push(`Bing API: ${e}`));
      }
    } catch (e) {
      console.log(`  Failed to load Bing ranks: ${e.message}`);
      report.issues.push(`Bing rank file parse error: ${e.message}`);
    }
  } else {
    console.log('  Bing rank results file not found');
    report.issues.push('Bing rank results not available');
  }

  // 3. Technical SEO checks
  console.log('\n--- Technical SEO Health ---');
  const [sitemap, robots, homepage] = await Promise.all([
    checkSitemap(),
    checkRobots(),
    checkHomepage()
  ]);
  
  report.sitemap = sitemap;
  report.robots = robots;
  report.homepage = homepage;

  if (!sitemap.ok) report.issues.push(...(sitemap.issues || ['Sitemap issue']));
  if (!robots.ok) report.issues.push(...(robots.issues || ['robots.txt issue']));
  if (!homepage.ok) report.issues.push(...(homepage.issues || ['Homepage issue']));

  // 4. Summary
  console.log('\n--- Summary ---');
  if (report.issues.length === 0) {
    console.log('✅ All SEO checks passed. No issues found.');
  } else {
    console.log(`⚠️  ${report.issues.length} issue(s) found:`);
    report.issues.forEach(i => console.log(`  • ${i}`));
  }

  // 5. Telegram alert if issues
  let telegramSent = false;
  if (report.issues.length > 0) {
    const ranked = report.googleRanks
      ? Object.entries(report.googleRanks).filter(([k, v]) => v.rank !== null).length
      : '?';
    const msg = `🔍 *Bartact SEO Daily Check — ${today}*\n\n` +
      `Google: ${ranked}/18 keywords ranked top 20\n\n` +
      `⚠️ Issues (${report.issues.length}):\n` +
      report.issues.slice(0, 8).map(i => `• ${i}`).join('\n');
    telegramSent = await sendTelegram(msg);
    console.log(`\nTelegram alert: ${telegramSent ? 'SENT' : 'NOT SENT (no credentials)'}`);
  } else {
    console.log('\nNo issues — Telegram alert not needed');
  }
  report.telegramSent = telegramSent;

  // 6. Write daily memory file
  if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });
  
  const googleRankSummary = report.googleRanks
    ? Object.entries(report.googleRanks)
        .filter(([k, v]) => v.rank !== null)
        .sort((a, b) => a[1].rank - b[1].rank)
        .map(([kw, d]) => `- #${d.rank} ${kw}`)
        .join('\n')
    : 'No data';

  const bingTopPages = report.bingRanks && report.bingRanks.topPages
    ? report.bingRanks.topPages.slice(0, 5).map((p, i) => `- ${i+1}. ${p.url} (${p.clicks} clicks)`).join('\n')
    : 'No data';

  const memContent = `# Bartact SEO Daily Check — ${today}

## Google Ranks (Top 20 organic)
${googleRankSummary}

## Bing Top Pages
${bingTopPages}

## Technical Health
- Sitemap: ${sitemap.ok ? '✅ OK' + (sitemap.urlCount !== undefined ? ` (${sitemap.urlCount} URLs)` : '') : '❌ ' + (sitemap.issues || []).join(', ')}
- robots.txt: ${robots.ok ? '✅ OK' : '❌ ' + (robots.issues || []).join(', ')}
- Homepage: ${homepage.ok ? `✅ OK (${homepage.loadMs}ms)` : '❌ ' + (homepage.issues || []).join(', ')}

## Issues
${report.issues.length === 0 ? 'None ✅' : report.issues.map(i => `- ${i}`).join('\n')}

## Alert
Telegram sent: ${telegramSent ? 'Yes' : 'No'}
`;

  const memFile = path.join(MEMORY_DIR, `seo-daily-${today}.md`);
  fs.writeFileSync(memFile, memContent);
  console.log(`\nDaily SEO report written to ${memFile}`);
  
  console.log('\n=== DONE ===');
  return report;
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
