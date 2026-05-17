#!/usr/bin/env node
const fs = require('fs');
// Extract every ID referenced in the POOL object of fix-duplicate-images.js
const src = fs.readFileSync('/home/ubuntu/.openclaw/workspace/scripts/fix-duplicate-images.js', 'utf8');
const poolBlock = src.match(/const POOL = \{([\s\S]*?)\n\};/)[1];
const ids = new Set();
for (const m of poolBlock.matchAll(/'([A-Za-z0-9+%-]{8,15})'/g)) ids.add(m[1]);
console.log([...ids].join(' '));
