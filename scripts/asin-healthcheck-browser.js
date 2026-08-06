#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read ASINs from stdin or file
const asinsText = fs.readFileSync(0, 'utf-8');
const asins = asinsText.trim().split('\n').map(line => {
  const [name, asin] = line.split('|');
  return { asin: asin.trim(), name: name.trim() };
});

// Read existing state
const stateFile = path.join(__dirname, '../scripts/sitestripe-healthcheck-state.json');
const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));

const deadAsins = new Set(state.deadASINs || []);
const checked = new Set();
const results = {
  checkedToday: [],
  newDeadFound: [],
  errors: []
};

// Report results to OpenClaw via special markers
console.log('ASIN_HEALTHCHECK_START');
console.log(JSON.stringify({
  totalToCheck: asins.length,
  uniqueAsins: new Set(asins.map(a => a.asin)).size,
  previouslyDead: deadAsins.size,
  timestamp: new Date().toISOString()
}));

// Output each ASIN for browser checking
asins.forEach((item, index) => {
  if (!checked.has(item.asin)) {
    console.log(JSON.stringify({
      action: 'check',
      index: index,
      asin: item.asin,
      name: item.name,
      isDuplicate: checked.has(item.asin),
      wasAlreadyDead: deadAsins.has(item.asin)
    }));
    checked.add(item.asin);
  }
});

console.log('ASIN_HEALTHCHECK_END');
