#!/usr/bin/env node
/**
 * ASIN Health Check - Browser Automation
 * Checks 148 ASINs from batch for:
 * - 404 errors
 * - "Currently unavailable" message
 * - Missing/empty title
 * - Missing product image
 */

const fs = require('fs');
const path = require('path');

// Read ASINs from batch file
const batchFile = '/tmp/asin-batch.txt';
const lines = fs.readFileSync(batchFile, 'utf-8').split('\n').filter(l => l.trim());

const asins = [];
const results = {
  checked: [],
  dead: [],
  alive: [],
  checkTime: new Date().toISOString(),
  total: 0,
  deadCount: 0
};

// Parse ASINs from batch format "Title|ASIN"
lines.forEach(line => {
  if (line.includes('|') && !line.includes('Progress') && !line.includes('Prepared')) {
    const [title, asin] = line.split('|');
    if (asin && asin.match(/^B[0-9A-Z]{9}$/)) {
      asins.push({ title: title.trim(), asin: asin.trim() });
    }
  }
});

console.log(`Found ${asins.length} ASINs to check`);
console.log('ASINs:', asins.slice(0, 5).map(a => a.asin).join(', '), '...');

// Export for browser automation to pick up
module.exports = {
  asins,
  results
};

// Also write to a file that the cron job can read
const configPath = '/home/ubuntu/.openclaw/workspace/scripts/asin-batch-config.json';
fs.writeFileSync(configPath, JSON.stringify({ asins, count: asins.length }, null, 2));
console.log(`Config written to ${configPath}`);
