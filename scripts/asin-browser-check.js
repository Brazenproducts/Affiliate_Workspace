#!/usr/bin/env node
/**
 * ASIN Browser Health Check
 * Uses OpenClaw browser automation to check ASIN status
 * 
 * Requirements:
 * - OpenClaw browser tool (CDP/Chromium)
 * - HTTP server to call into OpenClaw
 * 
 * Usage:
 *   node asin-browser-check.js <asin-list.txt> [--limit N] [--timeout MS]
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

class ASINChecker {
  constructor(options = {}) {
    this.baseUrl = 'http://localhost:18800'; // CDP endpoint
    this.timeout = options.timeout || 30000;
    this.results = {
      checked: [],
      alive: [],
      dead: [],
      errors: []
    };
  }

  /**
   * Call browser action via HTTP
   */
  async browserAction(action, params) {
    return new Promise((resolve, reject) => {
      const payload = {
        action,
        ...params
      };

      const reqUrl = new URL(this.baseUrl);
      const postData = JSON.stringify(payload);

      const options = {
        hostname: reqUrl.hostname,
        port: reqUrl.port,
        path: '/devtools/protocol',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: this.timeout
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Check a single ASIN
   */
  async checkASIN(asin, productTitle = '') {
    console.log(`Checking ${asin}...`);
    
    try {
      const productUrl = `https://www.amazon.com/dp/${asin}`;
      
      // Navigate to product page
      const openResult = await this.browserAction('open', {
        url: productUrl,
        label: `check-${asin}`
      });

      const targetId = openResult.suggestedTargetId || openResult.targetId;
      
      // Wait for page load
      await new Promise(r => setTimeout(r, 2000));
      
      // Take snapshot to check page state
      const snapshot = await this.browserAction('snapshot', {
        targetId
      });

      // Analyze snapshot for dead indicators
      const snapshotText = JSON.stringify(snapshot);
      
      // Check for 404 or unavailable
      const is404 = snapshotText.includes('404') || snapshotText.includes('not found');
      const isUnavailable = snapshotText.includes('Currently unavailable') || 
                            snapshotText.includes('unavailable') ||
                            snapshotText.includes('out of stock');
      
      // Check for title element
      const hasTitle = snapshotText.includes('productTitle') || 
                       snapshotText.includes('heading') ||
                       snapshotText.toLowerCase().includes('title');

      if (is404 || isUnavailable || !hasTitle) {
        this.results.dead.push({
          asin,
          productTitle,
          reason: is404 ? '404' : isUnavailable ? 'unavailable' : 'no-title',
          url: productUrl,
          checkedAt: new Date().toISOString()
        });
        console.log(`  ❌ DEAD (${is404 ? '404' : isUnavailable ? 'unavailable' : 'no-title'})`);
      } else {
        this.results.alive.push({
          asin,
          productTitle,
          url: productUrl,
          checkedAt: new Date().toISOString()
        });
        console.log(`  ✅ ALIVE`);
      }
      
      this.results.checked.push(asin);
      
    } catch (error) {
      this.results.errors.push({
        asin,
        productTitle,
        error: error.message,
        checkedAt: new Date().toISOString()
      });
      console.log(`  ⚠️  ERROR: ${error.message}`);
    }
  }

  /**
   * Check multiple ASINs
   */
  async checkBatch(asins, limit = null) {
    const batch = limit ? asins.slice(0, limit) : asins;
    
    console.log(`Starting health check of ${batch.length} ASINs`);
    console.log(`================================================\n`);
    
    for (const item of batch) {
      const asin = item.asin || item;
      const title = item.title || 'Unknown';
      await this.checkASIN(asin, title);
    }
    
    console.log(`\n================================================`);
    console.log(`Health Check Complete`);
    console.log(`  Checked: ${this.results.checked.length}`);
    console.log(`  Alive: ${this.results.alive.length}`);
    console.log(`  Dead: ${this.results.dead.length}`);
    console.log(`  Errors: ${this.results.errors.length}`);
    
    return this.results;
  }
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const batchFile = args[0] || '/tmp/asin-batch.txt';
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx > -1 ? parseInt(args[limitIdx + 1]) : null;
  
  if (!fs.existsSync(batchFile)) {
    console.error(`Error: Batch file not found: ${batchFile}`);
    process.exit(1);
  }

  // Read batch
  const content = fs.readFileSync(batchFile, 'utf8');
  const asins = [];
  
  for (const line of content.split('\n')) {
    if (!line.trim()) continue;
    if (line.includes('|')) {
      const [title, asin] = line.split('|').map(s => s.trim());
      if (asin) asins.push({ asin, title });
    } else if (line.match(/^B[0-9A-Z]{9}$/)) {
      asins.push({ asin: line, title: 'Unknown' });
    }
  }

  console.log(`Loaded ${asins.length} ASINs from ${batchFile}`);
  
  // Create checker and run
  const checker = new ASINChecker();
  const results = await checker.checkBatch(asins, limit);
  
  // Output results
  console.log(JSON.stringify(results, null, 2));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
