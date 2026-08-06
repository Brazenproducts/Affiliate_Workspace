#!/usr/bin/env node
// Affiliate Sites IndexNow Blast — submit all affiliate domain URLs to IndexNow
// IndexNow allows 10,000 URLs per request, 100,000 per day
// Pings Bing, Yandex, and other search engines

const https = require('https');
const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(__dirname, '..');
const AFFILIATE_DATA_FILE = path.join(WORKSPACE, 'data/affiliate-sites.json');
const INDEXNOW_KEY = 'f3e8a1b2c5d4e6f7g8h9i0j1k2l3m4n5'; // IndexNow key for affiliate domains
const BATCH_SIZE = 10000; // Max per IndexNow request
const DELAY_BETWEEN_BATCHES = 5000; // 5 seconds between batches

function log(msg) { 
  console.log(`[AFFILIATE-INDEXNOW] ${new Date().toISOString()} ${msg}`); 
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
  
  // Scan workspace root for domain directories (e.g., bestfirestick.com, 4x4king.com)
  const workspaceEntries = fs.readdirSync(WORKSPACE);
  for (const entry of workspaceEntries) {
    const fullPath = path.join(WORKSPACE, entry);
    try {
      const stat = fs.lstatSync(fullPath);
      // Skip symlinks and non-directories
      if (!stat.isDirectory() || stat.isSymbolicLink()) continue;
      
      // Check if it looks like a domain (contains a dot, not a special dir)
      if (entry.includes('.com') || entry.includes('.co') || entry.includes('.io')) {
        urls.add(`https://${entry}/`);
      }
    } catch (e) {
      // Skip inaccessible entries
      continue;
    }
  }
  
  // Also check affiliate-sites directory
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
              urls.add(`https://${config.domain}/`);
            }
          } catch (e) {
            // Silently skip malformed configs
          }
        }
      }
    } catch (e) {
      log(`Warn: Error scanning affiliate-sites directory: ${e.message}`);
    }
  }
  
  const urlArray = Array.from(urls);
  log(`Discovered ${urlArray.length} affiliate domains`);
  return urlArray;
}

async function submitToIndexNow(urls) {
  if (urls.length === 0) {
    log('ERROR: No URLs to submit');
    return { submitted: 0, failed: [], success: [] };
  }

  let totalSubmitted = 0;
  const failedDomains = [];
  const successDomains = [];

  // Group URLs by domain to submit separately
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

  const domains = Object.keys(urlsByDomain);
  log(`Preparing to submit ${urls.length} URLs across ${domains.length} domains...`);

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
          log(`⚠ ${domain} rate limited (HTTP 429). Waiting 60 seconds...`);
          await sleep(60000);
          b--; // Retry this batch
          continue;
        } else {
          log(`✗ ${domain}: HTTP ${resp.status}`);
          if (!failedDomains.includes(domain)) {
            failedDomains.push(domain);
          }
        }
      } catch (e) {
        log(`✗ ${domain}: ${e.message}`);
        if (!failedDomains.includes(domain)) {
          failedDomains.push(domain);
        }
      }

      if (b < batches - 1) await sleep(2000);
    }

    if (i < domains.length - 1) await sleep(DELAY_BETWEEN_BATCHES);
  }

  return { submitted: totalSubmitted, failed: failedDomains, success: successDomains };
}

async function main() {
  log('Starting affiliate sites IndexNow blast...');
  
  try {
    const urls = await getAffiliateUrls();
    
    if (urls.length === 0) {
      log('ERROR: No affiliate URLs found to submit');
      process.exit(1);
    }

    const result = await submitToIndexNow(urls);

    // Summary report
    const successCount = result.success.length;
    const failureCount = result.failed.length;
    
    log('╔════════════════════════════════════════════╗');
    log(`║ INDEXNOW BLAST REPORT                      ║`);
    log(`║ Successfully submitted: ${String(result.submitted).padEnd(22)} ║`);
    log(`║ Successful domains: ${String(successCount).padEnd(23)} ║`);
    log(`║ Failed domains: ${String(failureCount).padEnd(28)} ║`);
    log('╠════════════════════════════════════════════╣');
    
    if (successCount > 0) {
      log(`║ ✓ Successes:                               ║`);
      const displayCount = Math.min(5, successCount);
      for (let i = 0; i < displayCount; i++) {
        log(`║   ${result.success[i].padEnd(40)} ║`);
      }
      if (successCount > 5) {
        log(`║   ... and ${String(successCount - 5).padEnd(34)} more ║`);
      }
    }
    
    if (failureCount > 0) {
      log(`║                                            ║`);
      log(`║ ✗ Failures:                                ║`);
      const displayCount = Math.min(5, failureCount);
      for (let i = 0; i < displayCount; i++) {
        log(`║   ${result.failed[i].padEnd(40)} ║`);
      }
      if (failureCount > 5) {
        log(`║   ... and ${String(failureCount - 5).padEnd(34)} more ║`);
      }
    }
    
    log('╚════════════════════════════════════════════╝');
    
    process.exit(failureCount > 0 ? 1 : 0);
  } catch (e) {
    log('FATAL: ' + e.message);
    process.exit(1);
  }
}

main();
