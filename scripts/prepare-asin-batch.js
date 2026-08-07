#!/usr/bin/env node

/**
 * Prepare ASIN batch for daily health check
 * Reads from state file, gets next 200 ASINs to check
 * Output format: one ASIN per line with product name
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const STATE_FILE = path.join(WORKSPACE, 'scripts', 'sitestripe-healthcheck-state.json');
const ASIN_CACHE = path.join(WORKSPACE, 'memory', 'asin-cache.json');
const BATCH_SIZE = 200;

// Initialize or load state
let state = {
  lastBatchIndex: 0,
  totalAsinsChecked: 0,
  deadAsinsFound: [],
  lastRunDate: new Date().toISOString().split('T')[0]
};

if (fs.existsSync(STATE_FILE)) {
  try {
    const existing = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    state = { ...state, ...existing };
  } catch (e) {
    console.error('Warning: Could not parse state file, starting fresh');
  }
}

// Load ASIN cache
let asins = [];
if (fs.existsSync(ASIN_CACHE)) {
  try {
    const cache = JSON.parse(fs.readFileSync(ASIN_CACHE, 'utf8'));
    asins = Object.entries(cache).map(([title, asin]) => ({ title, asin }));
  } catch (e) {
    console.error('Error reading ASIN cache:', e.message);
    process.exit(1);
  }
}

if (asins.length === 0) {
  console.error('No ASINs found in cache');
  process.exit(1);
}

// Check if we've completed a full cycle
if (state.lastBatchIndex >= asins.length) {
  state.lastBatchIndex = 0; // Reset for next cycle
}

// Get next batch
const batchStart = state.lastBatchIndex;
const batchEnd = Math.min(batchStart + BATCH_SIZE, asins.length);
const batch = asins.slice(batchStart, batchEnd);

// Update state
state.lastBatchIndex = batchEnd;
state.lastRunDate = new Date().toISOString().split('T')[0];

// Output batch (name|ASIN format for easy parsing)
batch.forEach(item => {
  console.log(`${item.title}|${item.asin}`);
});

// Save updated state
try {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
} catch (e) {
  console.error('Warning: Could not save state file:', e.message);
}

// Log summary
console.error(`Prepared batch: ${batch.length} ASINs (${batchStart + 1}-${batchEnd} of ${asins.length})`);
console.error(`Progress: ${Math.round((batchEnd / asins.length) * 100)}%`);
