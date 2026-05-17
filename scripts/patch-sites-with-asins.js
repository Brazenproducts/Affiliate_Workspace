#!/usr/bin/env node
/**
 * patch-sites-with-asins.js
 *
 * For each of the 388 sites in /home/ubuntu/.openclaw/workspace/sites/:
 *   1. Reads the site's topic from its HTML title / h1
 *   2. Looks up top 5 ASINs for that topic via Amazon SP-API Catalog Items API
 *   3. Replaces all `amazon.com/s?k=` search links with `amazon.com/dp/{ASIN}?tag=brazenprodu01-20`
 *      (one ASIN per product card, cycled across cards)
 *   4. Commits + pushes to GitHub (Brazenproducts org)
 *
 * Rate limit: 1 SP-API catalog request per second
 *
 * DO NOT RUN until reviewed — see README notes below.
 *
 * Usage:
 *   node patch-sites-with-asins.js [--dry-run] [--site=<domain>]
 *
 * Options:
 *   --dry-run      Print what would change but don't write files or push
 *   --site=<name>  Process only the specified site directory name
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// ============================================================
// CONFIG
// ============================================================
const SITES_DIR = '/home/ubuntu/.openclaw/workspace/sites';
const CREDS_FILE = '/home/ubuntu/.openclaw/workspace/.amazon-bartact-credentials.json';
const AFFILIATE_TAG = 'brazenprodu01-20';
const MARKETPLACE_ID = 'ATVPDKIKX0DER';
const RATE_LIMIT_MS = 1100; // >1 req/sec to stay under SP-API limit
const PAGE_SIZE = 5;

const ARGS = process.argv.slice(2);
const DRY_RUN = ARGS.includes('--dry-run');
const SITE_FILTER = (ARGS.find(a => a.startsWith('--site=')) || '').replace('--site=', '') || null;

// ============================================================
// CREDENTIALS
// ============================================================
function loadCredentials() {
  const raw = fs.readFileSync(CREDS_FILE, 'utf8');
  return JSON.parse(raw);
}

// ============================================================
// AUTH: Get SP-API access token via OAuth2 token endpoint
// ============================================================
async function getAccessToken(creds) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: creds.refresh_token,
      client_id: creds.client_id,
      client_secret: creds.client_secret,
    }).toString();

    const options = {
      hostname: 'api.amazon.com',
      path: '/auth/o2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) {
            resolve(parsed.access_token);
          } else {
            reject(new Error(`Token error: ${data}`));
          }
        } catch (e) {
          reject(new Error(`Token parse error: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ============================================================
// SP-API: Search catalog items by keyword
// Returns array of ASINs (up to PAGE_SIZE)
// ============================================================
async function searchCatalogItems(keywords, accessToken) {
  return new Promise((resolve, reject) => {
    const encodedKeywords = encodeURIComponent(keywords);
    const queryPath = `/catalog/2022-04-01/items?marketplaceIds=${MARKETPLACE_ID}&keywords=${encodedKeywords}&includedData=summaries&pageSize=${PAGE_SIZE}`;

    const options = {
      hostname: 'sellingpartnerapi-na.amazon.com',
      path: queryPath,
      method: 'GET',
      headers: {
        'x-amz-access-token': accessToken,
        'x-amz-date': new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            const asins = (parsed.items || []).map(item => item.asin).filter(Boolean);
            resolve(asins);
          } catch (e) {
            reject(new Error(`Catalog parse error: ${data.slice(0, 200)}`));
          }
        } else if (res.statusCode === 429) {
          reject(new Error(`RATE_LIMITED: ${res.statusCode} ${data.slice(0, 200)}`));
        } else {
          reject(new Error(`SP-API error ${res.statusCode}: ${data.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// ============================================================
// TOPIC EXTRACTION: Read title/h1 from index.html
// ============================================================
function extractTopic(siteDir) {
  const indexPath = path.join(siteDir, 'index.html');
  if (!fs.existsSync(indexPath)) return null;

  const html = fs.readFileSync(indexPath, 'utf8');

  // Try <title> first
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    // Strip common suffixes like "— Reviews", "| 2026", etc.
    let title = titleMatch[1]
      .replace(/&amp;/g, '&')
      .replace(/\s*[—|–|-]\s*.*/g, '')
      .replace(/\s*(2026|2025|reviews?|rankings?|comparisons?|guide|honest)\s*/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (title.length > 5) return title;
  }

  // Fallback to <h1>
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    return h1Match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
  }

  // Last resort: domain name
  return path.basename(siteDir).replace(/[-_]/g, ' ').replace(/\.(com|net|org)$/, '');
}

// ============================================================
// URL REPLACEMENT: Replace search links with ASIN product links
// Cycles through available ASINs across product cards
// ============================================================
function patchHtmlWithAsins(html, asins) {
  if (!asins || asins.length === 0) return { html, changed: false, count: 0 };

  let asinIndex = 0;
  let count = 0;

  // Match all amazon.com/s?k= affiliate links
  const patched = html.replace(
    /https:\/\/www\.amazon\.com\/s\?k=[^"'&\s]+&tag=brazenprodu01-20/g,
    () => {
      const asin = asins[asinIndex % asins.length];
      asinIndex++;
      count++;
      return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`;
    }
  );

  return { html: patched, changed: count > 0, count };
}

// ============================================================
// GIT: Commit and push changes for a site
// ============================================================
function gitCommitAndPush(siteDir) {
  const domain = path.basename(siteDir);
  try {
    execSync('git add -A', { cwd: siteDir, stdio: 'pipe' });
    execSync(
      `git commit -m "fix: replace search links with direct ASIN product links"`,
      { cwd: siteDir, stdio: 'pipe' }
    );
    execSync('git push', { cwd: siteDir, stdio: 'pipe' });
    return true;
  } catch (e) {
    // If nothing to commit, git exits non-zero — that's fine
    if (e.stdout && e.stdout.toString().includes('nothing to commit')) {
      return false;
    }
    throw e;
  }
}

// ============================================================
// SLEEP
// ============================================================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log(`\n=== patch-sites-with-asins.js ===`);
  if (DRY_RUN) console.log('DRY RUN MODE — no files will be written or pushed\n');

  const creds = loadCredentials();
  console.log(`Loaded credentials for seller: ${creds.seller_id}`);

  // Get initial access token
  let accessToken = await getAccessToken(creds);
  let tokenFetchedAt = Date.now();
  console.log('Access token obtained\n');

  // Enumerate sites
  let siteDirs = fs.readdirSync(SITES_DIR)
    .map(name => path.join(SITES_DIR, name))
    .filter(d => fs.statSync(d).isDirectory());

  if (SITE_FILTER) {
    siteDirs = siteDirs.filter(d => path.basename(d) === SITE_FILTER);
    if (siteDirs.length === 0) {
      console.error(`ERROR: Site not found: ${SITE_FILTER}`);
      process.exit(1);
    }
  }

  console.log(`Processing ${siteDirs.length} site(s)...\n`);

  const results = { success: 0, skipped: 0, failed: 0, noAsins: 0 };
  const failures = [];

  for (let i = 0; i < siteDirs.length; i++) {
    const siteDir = siteDirs[i];
    const domain = path.basename(siteDir);

    // Refresh token every 50 minutes (tokens expire at 60 min)
    if (Date.now() - tokenFetchedAt > 50 * 60 * 1000) {
      console.log('Refreshing access token...');
      accessToken = await getAccessToken(creds);
      tokenFetchedAt = Date.now();
    }

    const topic = extractTopic(siteDir);
    if (!topic) {
      console.log(`[${i + 1}/${siteDirs.length}] SKIP ${domain} — no index.html or topic`);
      results.skipped++;
      continue;
    }

    console.log(`[${i + 1}/${siteDirs.length}] ${domain}`);
    console.log(`  Topic: "${topic}"`);

    // Fetch ASINs
    let asins = [];
    try {
      asins = await searchCatalogItems(topic, accessToken);
      console.log(`  ASINs: ${asins.join(', ') || '(none)'}`);
    } catch (err) {
      if (err.message.startsWith('RATE_LIMITED')) {
        console.log(`  RATE LIMITED — waiting 5s and retrying...`);
        await sleep(5000);
        try {
          asins = await searchCatalogItems(topic, accessToken);
          console.log(`  ASINs (retry): ${asins.join(', ') || '(none)'}`);
        } catch (retryErr) {
          console.error(`  FAILED (retry): ${retryErr.message}`);
          failures.push({ domain, error: retryErr.message });
          results.failed++;
          await sleep(RATE_LIMIT_MS);
          continue;
        }
      } else {
        console.error(`  FAILED: ${err.message}`);
        failures.push({ domain, error: err.message });
        results.failed++;
        await sleep(RATE_LIMIT_MS);
        continue;
      }
    }

    if (asins.length === 0) {
      console.log(`  No ASINs found — skipping`);
      results.noAsins++;
      await sleep(RATE_LIMIT_MS);
      continue;
    }

    // Find all HTML files in site
    const htmlFiles = fs.readdirSync(siteDir)
      .filter(f => f.endsWith('.html'))
      .map(f => path.join(siteDir, f));

    let totalPatched = 0;
    for (const htmlFile of htmlFiles) {
      const originalHtml = fs.readFileSync(htmlFile, 'utf8');
      const { html: patchedHtml, changed, count } = patchHtmlWithAsins(originalHtml, asins);

      if (changed) {
        if (!DRY_RUN) {
          fs.writeFileSync(htmlFile, patchedHtml, 'utf8');
        }
        totalPatched += count;
        console.log(`  Patched ${count} link(s) in ${path.basename(htmlFile)}`);
      }
    }

    if (totalPatched === 0) {
      console.log(`  No amazon search links found — nothing to patch`);
      results.skipped++;
      await sleep(RATE_LIMIT_MS);
      continue;
    }

    // Commit and push
    if (!DRY_RUN) {
      // Check if this is a git repo
      const gitDir = path.join(siteDir, '.git');
      if (fs.existsSync(gitDir)) {
        try {
          const pushed = gitCommitAndPush(siteDir);
          if (pushed) {
            console.log(`  ✓ Committed and pushed`);
          } else {
            console.log(`  (nothing to commit)`);
          }
        } catch (gitErr) {
          console.error(`  Git error: ${gitErr.message}`);
          failures.push({ domain, error: `git: ${gitErr.message}` });
        }
      } else {
        console.log(`  (no .git directory — skipping push)`);
      }
    } else {
      console.log(`  DRY RUN: would commit + push ${totalPatched} link changes`);
    }

    results.success++;

    // Rate limit: 1 request per second
    await sleep(RATE_LIMIT_MS);
  }

  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`  Success:    ${results.success}`);
  console.log(`  No ASINs:   ${results.noAsins}`);
  console.log(`  Skipped:    ${results.skipped}`);
  console.log(`  Failed:     ${results.failed}`);

  if (failures.length > 0) {
    console.log('\nFailed sites:');
    failures.forEach(f => console.log(`  - ${f.domain}: ${f.error}`));
  }

  console.log('\nDone.');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
