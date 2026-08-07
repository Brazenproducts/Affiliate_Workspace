#!/usr/bin/env node
// IndexNow Submit — comprehensive affiliate sites IndexNow submission
// Submits all affiliate domain URLs to IndexNow service
// Outputs __JSON_RESULTS__ with statistics for parsing

const https = require('https');
const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(__dirname, '..');
const INDEXNOW_KEY = 'f3e8a1b2c5d4e6f7g8h9i0j1k2l3m4n5';
const BATCH_SIZE = 10000;
const DELAY_BETWEEN_BATCHES = 1000; // Reduced for faster processing

function log(msg) {
  console.log(`[IndexNow] ${new Date().toISOString()} ${msg}`);
}

function httpsPost(hostname, pathname, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname,
      path: pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: responseBody }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getAffiliateUrls() {
  const urls = new Set();
  const sites = [];

  // Scan workspace root for domain directories
  const workspaceEntries = fs.readdirSync(WORKSPACE);
  for (const entry of workspaceEntries) {
    const fullPath = path.join(WORKSPACE, entry);
    try {
      const stat = fs.lstatSync(fullPath);
      if (!stat.isDirectory() || stat.isSymbolicLink()) continue;

      if (entry.includes('.com') || entry.includes('.co') || entry.includes('.io') || entry.includes('.net') || entry.includes('.org')) {
        const domainUrl = `https://${entry}/`;
        urls.add(domainUrl);
        sites.push(entry);
      }
    } catch (e) {
      continue;
    }
  }

  // Check affiliate-sites directory
  const affiliateSitesDir = path.join(WORKSPACE, 'affiliate-sites');
  if (fs.existsSync(affiliateSitesDir)) {
    try {
      const siteDirs = fs.readdirSync(affiliateSitesDir);
      for (const siteDir of siteDirs) {
        const configPath = path.join(affiliateSitesDir, siteDir, 'config.json');
        if (fs.existsSync(configPath)) {
          try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (config.domain) {
              const domainUrl = `https://${config.domain}/`;
              urls.add(domainUrl);
              sites.push(config.domain);
            }
          } catch (e) {
            // Skip malformed configs
          }
        }
      }
    } catch (e) {
      log(`Warning: Error scanning affiliate-sites: ${e.message}`);
    }
  }

  const urlArray = Array.from(urls).sort();
  log(`Discovered ${urlArray.length} affiliate URLs from ${sites.length} sites`);
  return { urls: urlArray, sites };
}

async function submitToIndexNow(urls) {
  if (urls.length === 0) {
    return {
      submitted: 0,
      failed: [],
      success: [],
      errors: [],
      totalUrls: 0
    };
  }

  let totalSubmitted = 0;
  const failedDomains = [];
  const successDomains = [];
  const errors = [];

  const urlsByDomain = {};
  for (const url of urls) {
    const domainMatch = url.match(/https?:\/\/([^/]+)/);
    if (domainMatch) {
      const domain = domainMatch[1];
      if (!urlsByDomain[domain]) {
        urlsByDomain[domain] = [];
      }
      urlsByDomain[domain].push(url);
    }
  }

  const domains = Object.keys(urlsByDomain).sort();
  log(`Submitting ${urls.length} URLs across ${domains.length} domains...`);

  for (let i = 0; i < domains.length; i++) {
    const domain = domains[i];
    const domainUrls = urlsByDomain[domain];
    const batches = Math.ceil(domainUrls.length / BATCH_SIZE);

    for (let b = 0; b < batches; b++) {
      const batch = domainUrls.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);

      const payload = {
        host: domain,
        key: INDEXNOW_KEY,
        urlList: batch
      };

      try {
        const resp = await httpsPost('api.indexnow.org', '/indexnow', payload);

        if (resp.status === 200 || resp.status === 202) {
          totalSubmitted += batch.length;
          if (batches === 1) {
            log(`✓ ${domain}: ${batch.length} URLs submitted`);
            successDomains.push(domain);
          } else {
            log(`✓ ${domain} (batch ${b + 1}/${batches}): ${batch.length} URLs`);
          }
        } else if (resp.status === 429) {
          log(`⚠ ${domain} rate limited (HTTP 429). Waiting...`);
          await sleep(60000);
          b--;
          continue;
        } else {
          const errorMsg = `${domain}: HTTP ${resp.status}`;
          log(`✗ ${errorMsg}`);
          errors.push(errorMsg);
          if (!failedDomains.includes(domain)) {
            failedDomains.push(domain);
          }
        }
      } catch (e) {
        const errorMsg = `${domain}: ${e.message}`;
        log(`✗ ${errorMsg}`);
        errors.push(errorMsg);
        if (!failedDomains.includes(domain)) {
          failedDomains.push(domain);
        }
      }

      if (b < batches - 1) await sleep(500); // Reduced delay
    }

    if (i < domains.length - 1) await sleep(DELAY_BETWEEN_BATCHES);
  }

  return {
    submitted: totalSubmitted,
    failed: failedDomains,
    success: successDomains,
    errors,
    totalUrls: urls.length
  };
}

async function main() {
  log('Starting IndexNow submission for all affiliate sites...');
  const startTime = Date.now();

  try {
    const { urls, sites } = await getAffiliateUrls();

    if (urls.length === 0) {
      log('ERROR: No affiliate URLs found');
      console.log('__JSON_RESULTS__');
      console.log(JSON.stringify({
        date: new Date().toISOString(),
        sitesProcessed: 0,
        totalUrls: 0,
        submittedCount: 0,
        errorCount: 1,
        errorRate: 100
      }));
      process.exit(1);
    }

    const result = await submitToIndexNow(urls);
    const elapsedMs = Date.now() - startTime;
    const errorCount = result.failed.length;
    const errorRate = urls.length > 0 ? Math.round((errorCount / urls.length) * 100) : 0;

    // Summary report
    log('╔════════════════════════════════════════════╗');
    log(`║ INDEXNOW SUBMISSION REPORT                 ║`);
    log(`║ Sites Processed: ${String(sites.length).padEnd(26)} ║`);
    log(`║ Total URLs: ${String(urls.length).padEnd(31)} ║`);
    log(`║ Successfully Submitted: ${String(result.submitted).padEnd(18)} ║`);
    log(`║ Failed Domains: ${String(result.failed.length).padEnd(27)} ║`);
    log(`║ Error Rate: ${String(errorRate + '%').padEnd(31)} ║`);
    log(`║ Duration: ${String(Math.round(elapsedMs / 1000) + 's').padEnd(32)} ║`);
    log('╚════════════════════════════════════════════╝');

    // JSON results for parsing
    console.log('\n__JSON_RESULTS__');
    const resultsJson = {
      date: new Date().toISOString(),
      sitesProcessed: sites.length,
      totalUrls: urls.length,
      submittedCount: result.submitted,
      errorCount: errorCount,
      errorRate: errorRate,
      successDomains: result.success,
      failedDomains: result.failed,
      errors: result.errors.slice(0, 10) // First 10 errors
    };
    console.log(JSON.stringify(resultsJson, null, 2));

    process.exit(result.failed.length > 0 ? 1 : 0);
  } catch (e) {
    log('FATAL: ' + e.message);
    console.log('\n__JSON_RESULTS__');
    console.log(JSON.stringify({
      date: new Date().toISOString(),
      sitesProcessed: 0,
      totalUrls: 0,
      submittedCount: 0,
      errorCount: 1,
      errorRate: 100,
      error: e.message
    }));
    process.exit(1);
  }
}

main();
