#!/usr/bin/env node
// Full indexing blast — IndexNow + Google Indexing API
// All 28 Elipacko affiliate sites
// Section 0.5: site count confirmed from filesystem before running

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SITES_BASE = '/home/ubuntu/.openclaw/workspace/elipacko-sites';
const CREDS_PATH = '/home/ubuntu/.openclaw/workspace/.gcp-service-account.json';
const INDEXNOW_KEY = 'e9c8f5a4b3d2c1a0f9e8d7c6b5a4e9c8';

// Confirmed 28 sites from filesystem — DO NOT hardcode, derived from git remotes
const SITE_DIRS = fs.readdirSync(SITES_BASE).filter(d => {
  const full = path.join(SITES_BASE, d);
  return fs.statSync(full).isDirectory() &&
    !d.startsWith('{') && !d.startsWith('DO_') && !d.endsWith('.com');
});

console.log(`Section 0.5 check: ${SITE_DIRS.length} site directories found`);
if (SITE_DIRS.length !== 28) {
  console.error(`STOP: expected 28, got ${SITE_DIRS.length}. Verify before proceeding.`);
  process.exit(1);
}

// Build domain → dir mapping
const { execSync } = require('child_process');
const sites = [];
for (const dir of SITE_DIRS) {
  try {
    const remote = execSync(`cd "${path.join(SITES_BASE, dir)}" && git remote get-url origin`, { encoding: 'utf8' }).trim();
    const domain = remote.replace(/.*github\.com[:/]Brazenproducts\//, '').replace(/\.git$/, '');
    sites.push({ dir, domain, repoPath: path.join(SITES_BASE, dir) });
  } catch (e) {
    console.warn(`Could not get remote for ${dir}: ${e.message}`);
  }
}

// customplasticcorrugate.com is domain-squatted — skip Google Indexing API for it
// (DNS resolves to wrong content; submitting would confuse Google)
const SKIP_INDEXING_API = new Set(['customplasticcorrugate.com']);

// Collect all HTML URLs per site
function getUrls(site) {
  const urls = [];
  const files = execSync(`find "${site.repoPath}" -name "*.html" -not -path "*/.git/*"`, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  for (const f of files) {
    const rel = f.replace(site.repoPath, '').replace(/\/index\.html$/, '/').replace(/^\//, '');
    const url = rel === 'index.html' || rel === '/'
      ? `https://${site.domain}/`
      : `https://${site.domain}/${rel.replace(/^\//, '')}`;
    // Skip Google verification file
    if (!url.includes('googlec55128789f00e1a7')) urls.push(url);
  }
  return [...new Set(urls)];
}

async function submitIndexNow(domain, urls) {
  // Submit per-domain (required: host must match)
  const body = {
    host: domain,
    key: INDEXNOW_KEY,
    keyLocation: `https://${domain}/${INDEXNOW_KEY}.txt`,
    urlList: urls
  };
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.status;
}

async function submitGoogleIndexing(auth, urls) {
  const indexing = google.indexing({ version: 'v3', auth });
  let pushed = 0, errors = 0;
  // Batch in groups of 100
  for (let i = 0; i < urls.length; i += 100) {
    const batch = urls.slice(i, i + 100);
    for (const url of batch) {
      try {
        await indexing.urlNotifications.publish({
          requestBody: { url, type: 'URL_UPDATED' }
        });
        pushed++;
      } catch (e) {
        const msg = e.message || '';
        if (msg.includes('Quota') || msg.includes('quota')) {
          console.log(`  ⚠️  Quota hit at ${pushed} URLs`);
          return { pushed, errors, quotaHit: true };
        }
        errors++;
      }
    }
    await new Promise(r => setTimeout(r, 200));
  }
  return { pushed, errors, quotaHit: false };
}

async function run() {
  const creds = JSON.parse(fs.readFileSync(CREDS_PATH));
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
  const authClient = await auth.getClient();

  const results = [];
  let totalUrls = 0;
  let totalIndexNowOk = 0;
  let totalGooglePushed = 0;

  for (const site of sites) {
    const urls = getUrls(site);
    totalUrls += urls.length;
    console.log(`\n[${site.domain}] ${urls.length} URLs`);

    // IndexNow
    let indexNowStatus = 'skipped';
    try {
      const status = await submitIndexNow(site.domain, urls);
      indexNowStatus = status === 200 || status === 202 ? `✅ ${status}` : `❌ ${status}`;
      if (status === 200 || status === 202) totalIndexNowOk++;
    } catch (e) {
      indexNowStatus = `❌ ${e.message.substring(0, 60)}`;
    }
    console.log(`  IndexNow: ${indexNowStatus}`);

    // Google Indexing API (skip squatted domain)
    let googleResult = { pushed: 0, errors: 0, note: 'skipped (domain squatted)' };
    if (!SKIP_INDEXING_API.has(site.domain)) {
      try {
        googleResult = await submitGoogleIndexing(authClient, urls);
        totalGooglePushed += googleResult.pushed;
        console.log(`  Google Indexing API: ${googleResult.pushed}/${urls.length} pushed, ${googleResult.errors} errors${googleResult.quotaHit ? ' (QUOTA HIT)' : ''}`);
      } catch (e) {
        googleResult = { pushed: 0, errors: 0, note: e.message.substring(0, 100) };
        console.log(`  Google Indexing API: ❌ ${googleResult.note}`);
      }
    } else {
      console.log(`  Google Indexing API: skipped (domain squatted — not serving our content)`);
    }

    results.push({ domain: site.domain, urlCount: urls.length, indexNowStatus, googleResult });
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n========== FINAL SUMMARY ==========');
  console.log(`Sites processed: ${sites.length}/28`);
  console.log(`Total URLs: ${totalUrls}`);
  console.log(`IndexNow success: ${totalIndexNowOk}/${sites.length}`);
  console.log(`Google Indexing API URLs pushed: ${totalGooglePushed}`);

  // Save results
  fs.writeFileSync(
    '/home/ubuntu/.openclaw/workspace/memory/indexing-blast-2026-08-10.json',
    JSON.stringify({ runAt: new Date().toISOString(), totalUrls, totalIndexNowOk, totalGooglePushed, results }, null, 2)
  );
  console.log('\nResults saved to memory/indexing-blast-2026-08-10.json');
}

run().catch(console.error);
