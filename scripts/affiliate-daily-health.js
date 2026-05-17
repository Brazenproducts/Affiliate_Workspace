#!/usr/bin/env node
/**
 * affiliate-daily-health.js
 * Daily health monitor for all affiliate sites.
 * Usage:
 *   node affiliate-daily-health.js            # full check (includes live HTTPS)
 *   node affiliate-daily-health.js --local-only # skip live HTTP checks (fast)
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');
const http  = require('http');

// ── CONFIG ──────────────────────────────────────────────────────────────────
const SITES_DIR   = path.resolve(__dirname, '../sites');
const MEMORY_DIR  = path.resolve(__dirname, '../memory');
const AFFILIATE_TAG = 'tag=brazenprodu01-20';
const LIVE_TIMEOUT_MS = 10_000;
const LOCAL_ONLY  = process.argv.includes('--local-only');

// ── HELPERS ──────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Fetch a URL; resolves { status, ok } or { status: 0, ok: false, error } */
function fetchHead(url) {
  return new Promise(resolve => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: LIVE_TIMEOUT_MS }, res => {
      resolve({ status: res.statusCode, ok: res.statusCode === 200 });
      res.resume(); // drain
    });
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, ok: false, error: 'timeout' }); });
    req.on('error',   e  => resolve({ status: 0, ok: false, error: e.message }));
  });
}

/** Recursively collect all files under a directory */
function allFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) allFiles(full, acc);
    else acc.push(full);
  }
  return acc;
}

/** Read a file as string, or null if it doesn't exist */
function readFileSafe(filePath) {
  try { return fs.readFileSync(filePath, 'utf8'); }
  catch { return null; }
}

/** Extract all href values from HTML content */
function extractHrefs(html) {
  const hrefs = [];
  const re = /href\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) hrefs.push(m[1]);
  return hrefs;
}

/** Extract all amazon.com URLs from HTML content.
 * Extracts from href="..." and href='...' attributes to avoid truncation
 * at apostrophes in URLs like De'Longhi. Falls back to free-text matching
 * for unquoted contexts.
 */
function extractAmazonLinks(html) {
  const links = [];
  // Primary: extract amazon URLs from href attributes (handles De'Longhi etc.)
  const attrReDouble = /href\s*=\s*"([^"]*amazon\.com[^"]*)"/gi;
  const attrReSingle = /href\s*=\s*'([^']*amazon\.com[^']*)'/gi;
  let m;
  while ((m = attrReDouble.exec(html)) !== null) links.push(m[1]);
  while ((m = attrReSingle.exec(html)) !== null) links.push(m[1]);
  // Secondary: free-text amazon URLs not inside an href (e.g. plain text mentions)
  // Remove already-captured href values to avoid double-counting
  const stripped = html
    .replace(/href\s*=\s*"[^"]*amazon\.com[^"]*"/gi, '')
    .replace(/href\s*=\s*'[^']*amazon\.com[^']*'/gi, '');
  const freeRe = /https?:\/\/(?:www\.)?amazon\.com[^\s"'<>]*/gi;
  while ((m = freeRe.exec(stripped)) !== null) links.push(m[0]);
  return links;
}

// ── PER-SITE CHECK ────────────────────────────────────────────────────────────

async function checkSite(domain) {
  const siteDir  = path.join(SITES_DIR, domain);
  const result = {
    domain,
    live: null,
    httpsStatus: null,
    amazonLinks: 0,
    missingAffiliateTags: 0,
    privacyPage: false,
    sitemapExists: false,
    robotsOk: false,
    brokenInternalLinks: 0,
    status: 'ok',
    flags: [],
  };

  // ── 1. LIVE CHECK ────────────────────────────────────────────────────────
  if (!LOCAL_ONLY) {
    const res = await fetchHead(`https://${domain}/`);
    result.live = res.ok;
    result.httpsStatus = res.status;
    if (!res.ok) {
      result.flags.push(`site down (${res.error || 'HTTP ' + res.status})`);
    }
  } else {
    result.live = null;     // not checked
    result.httpsStatus = null;
  }

  // Collect all HTML files in this site directory
  const htmlFiles = allFiles(siteDir).filter(f => f.endsWith('.html'));

  // Build set of all relative file paths for internal link resolution
  // Key: path relative to siteDir, lowercase, e.g. "about.html", "subdir/page.html"
  const existingFiles = new Set(
    allFiles(siteDir).map(f => '/' + path.relative(siteDir, f).replace(/\\/g, '/'))
  );
  // Also allow "/" to refer to index.html
  if (existingFiles.has('/index.html')) existingFiles.add('/');

  let totalAmazonLinks = 0;
  let missingTagLinks  = 0;
  const brokenLinks    = new Set();

  for (const htmlFile of htmlFiles) {
    const content = readFileSafe(htmlFile);
    if (!content) continue;

    // ── 2. AFFILIATE TAGS & 5. AMAZON LINK COUNT ────────────────────────
    const amazonLinks = extractAmazonLinks(content);
    totalAmazonLinks += amazonLinks.length;
    for (const link of amazonLinks) {
      if (!link.includes(AFFILIATE_TAG)) missingTagLinks++;
    }

    // ── 7. INTERNAL LINK CHECKER ─────────────────────────────────────────
    const hrefs = extractHrefs(content);
    for (const href of hrefs) {
      // Only check root-relative paths (starts with /) — skip external, anchors, mailto etc.
      if (!href.startsWith('/')) continue;
      // Strip query string and fragment
      const cleanHref = href.split('?')[0].split('#')[0];
      if (!cleanHref || cleanHref === '/') continue;
      // Check if file exists relative to site root
      if (!existingFiles.has(cleanHref)) {
        // Also try with trailing slash → index.html
        const withIndex = cleanHref.replace(/\/$/, '') + '/index.html';
        if (!existingFiles.has(withIndex)) {
          brokenLinks.add(cleanHref);
        }
      }
    }
  }

  result.amazonLinks          = totalAmazonLinks;
  result.missingAffiliateTags = missingTagLinks;
  result.brokenInternalLinks  = brokenLinks.size;

  // ── 3. PRIVACY PAGE ──────────────────────────────────────────────────────
  result.privacyPage = fs.existsSync(path.join(siteDir, 'privacy.html'));

  // ── 4. SITEMAP ────────────────────────────────────────────────────────────
  result.sitemapExists = fs.existsSync(path.join(siteDir, 'sitemap.xml'));

  // ── 6. ROBOTS.TXT ────────────────────────────────────────────────────────
  const robotsPath = path.join(siteDir, 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    const robotsContent = readFileSafe(robotsPath) || '';
    // Disallow all = "Disallow: /" with no Allow overrides
    const disallowAll = /Disallow:\s*\//i.test(robotsContent) &&
                        !/Allow:\s*\//i.test(robotsContent);
    result.robotsOk = !disallowAll;
    if (disallowAll) result.flags.push('robots.txt disallows all crawlers');
  } else {
    result.robotsOk = false;
    result.flags.push('robots.txt missing');
  }

  // ── BUILD FLAGS ───────────────────────────────────────────────────────────
  if (missingTagLinks > 0)
    result.flags.push(`missing affiliate tags (${missingTagLinks} links)`);
  if (totalAmazonLinks === 0)
    result.flags.push('no Amazon links — no monetization');
  if (!result.privacyPage)
    result.flags.push('privacy.html missing');
  if (!result.sitemapExists)
    result.flags.push('sitemap.xml missing');
  if (result.brokenInternalLinks > 0)
    result.flags.push(`${result.brokenInternalLinks} broken internal link(s)`);

  // ── STATUS ────────────────────────────────────────────────────────────────
  const isCritical =
    (result.live === false) ||
    missingTagLinks > 0     ||
    totalAmazonLinks === 0;

  const isWarning =
    !result.privacyPage     ||
    !result.sitemapExists   ||
    !result.robotsOk;

  result.status = isCritical ? 'critical' : isWarning ? 'warning' : 'ok';

  return result;
}

// ── AMAZON ACCOUNT CHECK ──────────────────────────────────────────────────────

async function checkAmazonAccount() {
  // Look for amazon-related cookies or session files
  const searchPaths = [
    path.resolve(__dirname, '../memory'),
    path.resolve(__dirname, '../..'),   // ~/.openclaw
  ];
  const cookieFiles = [];
  for (const sp of searchPaths) {
    if (!fs.existsSync(sp)) continue;
    try {
      for (const f of fs.readdirSync(sp)) {
        if (/amazon|affiliate/i.test(f)) cookieFiles.push(path.join(sp, f));
      }
    } catch { /* skip */ }
  }

  if (cookieFiles.length === 0) {
    return 'Amazon account check: manual login required (OTP)';
  }

  // If cookies found, note them but still recommend manual check (OTP)
  return `Amazon account check: cookie file(s) found (${cookieFiles.map(f => path.basename(f)).join(', ')}) — but OTP required for live status; verify manually`;
}

// ── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(SITES_DIR)) {
    console.error(`Sites directory not found: ${SITES_DIR}`);
    process.exit(1);
  }

  const domains = fs.readdirSync(SITES_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort();

  const dateStr = today();
  console.log(`\nAFFILIATE HEALTH CHECK — ${dateStr}`);
  if (LOCAL_ONLY) console.log('(local-only mode — live HTTPS checks skipped)');
  console.log('=====================================');
  console.log(`Scanning ${domains.length} sites...\n`);

  const results = [];
  // Process in batches of 20 to avoid overwhelming I/O
  const BATCH = LOCAL_ONLY ? 50 : 10;
  for (let i = 0; i < domains.length; i += BATCH) {
    const batch = domains.slice(i, i + BATCH);
    const batchResults = await Promise.all(batch.map(d => checkSite(d)));
    results.push(...batchResults);
    if (!LOCAL_ONLY) {
      process.stdout.write(`  Checked ${Math.min(i + BATCH, domains.length)}/${domains.length}...\r`);
    }
  }

  // ── COUNTS ────────────────────────────────────────────────────────────────
  const ok       = results.filter(r => r.status === 'ok');
  const warnings = results.filter(r => r.status === 'warning');
  const critical = results.filter(r => r.status === 'critical');

  // ── AMAZON ACCOUNT ────────────────────────────────────────────────────────
  const amazonStatus = await checkAmazonAccount();

  // ── SAVE REPORT ───────────────────────────────────────────────────────────
  if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });
  const reportPath = path.join(MEMORY_DIR, `affiliate-health-${dateStr}.json`);
  const report = {
    date: dateStr,
    generatedAt: new Date().toISOString(),
    localOnly: LOCAL_ONLY,
    summary: {
      total: results.length,
      ok: ok.length,
      warning: warnings.length,
      critical: critical.length,
    },
    amazonAccountStatus: amazonStatus,
    sites: results,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // ── PRINT SUMMARY ─────────────────────────────────────────────────────────
  console.log(`Total sites: ${results.length}`);
  console.log(`✅ OK:        ${ok.length}`);
  console.log(`⚠️  Warning:  ${warnings.length}`);
  console.log(`🔴 Critical:  ${critical.length}`);
  console.log();

  if (critical.length > 0) {
    console.log('CRITICAL (fix immediately):');
    for (const r of critical) {
      console.log(`  - ${r.domain}: ${r.flags.join('; ')}`);
    }
    console.log();
  }

  if (warnings.length > 0) {
    console.log('WARNING:');
    for (const r of warnings) {
      console.log(`  - ${r.domain}: ${r.flags.join('; ')}`);
    }
    console.log();
  }

  console.log(`${amazonStatus}`);
  console.log(`\nReport saved: ${reportPath}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
