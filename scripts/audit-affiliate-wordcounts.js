#!/usr/bin/env node
// Audit affiliate site word counts against playbook targets
// Floors: homepage 800w, inner pages 700w
// Targets: homepage 1500w, inner pages 1000w

const fs = require('fs');
const path = require('path');

const SITES_DIR = '/home/ubuntu/.openclaw/workspace/sites';
const CANONICAL = '/home/ubuntu/.openclaw/agents/filli/workspace/memory/associates-site-lists-confirmed.md';

// Utility pages to skip
const SKIP_PAGES = new Set([
  'privacy.html','about.html','contact.html','thanks.html',
  'sitemap.html','404.html','disclaimer.html'
]);

function countWords(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(w => w.length > 0).length;
}

function getHtmlFiles(dir, subdir) {
  const d = subdir ? path.join(dir, subdir) : dir;
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d)
    .filter(f => f.endsWith('.html'))
    .map(f => ({ file: path.join(d, f), name: subdir ? `${subdir}/${f}` : f }));
}

// Extract sites from canonical file
const canonicalContent = fs.readFileSync(CANONICAL, 'utf8');
const sites = canonicalContent
  .split('\n')
  .map(l => l.trim())
  .filter(l => /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.(com|net|org)$/.test(l))
  .sort();

console.log('=== AFFILIATE NETWORK WORD COUNT AUDIT ===');
console.log('Targets: homepage ≥1500w (floor 800w) | inner pages ≥1000w (floor 700w)');
console.log(`Date: ${new Date().toUTCString()}`);
console.log(`Sites in canonical list: ${sites.length}`);
console.log('');

const results = [];
let homeAtTarget = 0, homeAboveFloor = 0, homeBelowFloor = 0, homeNoRepo = 0;
let innerAtTarget = 0, innerAboveFloor = 0, innerBelowFloor = 0;

for (const site of sites) {
  const dir = path.join(SITES_DIR, site);
  const result = { site, hasRepo: false, homeWords: 0, homeStatus: '', inner: [] };

  if (!fs.existsSync(dir)) {
    result.homeStatus = 'NO_LOCAL_REPO';
    homeNoRepo++;
    results.push(result);
    continue;
  }

  result.hasRepo = true;

  // Homepage
  const indexPath = path.join(dir, 'index.html');
  if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, 'utf8');
    result.homeWords = countWords(html);
    if (result.homeWords >= 1500) { result.homeStatus = 'TARGET'; homeAtTarget++; }
    else if (result.homeWords >= 800) { result.homeStatus = 'ABOVE_FLOOR'; homeAboveFloor++; }
    else { result.homeStatus = 'BELOW_FLOOR'; homeBelowFloor++; }
  } else {
    result.homeStatus = 'NO_INDEX';
    homeBelowFloor++;
  }

  // Inner pages (root + blog/)
  const allInner = [
    ...getHtmlFiles(dir),
    ...getHtmlFiles(dir, 'blog')
  ];

  for (const { file, name } of allInner) {
    const fname = path.basename(name);
    if (fname === 'index.html') continue;
    if (SKIP_PAGES.has(fname)) continue;
    if (/^google[a-f0-9]+\.html$/.test(fname)) continue;
    if (/^b4f7e2a1/.test(fname)) continue;

    const html = fs.readFileSync(file, 'utf8');
    const wc = countWords(html);
    let status;
    if (wc >= 1000) { status = 'TARGET'; innerAtTarget++; }
    else if (wc >= 700) { status = 'ABOVE_FLOOR'; innerAboveFloor++; }
    else { status = 'BELOW_FLOOR'; innerBelowFloor++; }

    result.inner.push({ name, wc, status });
  }

  results.push(result);
}

// Print results
console.log('=== PER-SITE RESULTS ===');
for (const r of results) {
  if (!r.hasRepo) {
    console.log(`❓ ${r.site}: NO LOCAL REPO`);
    continue;
  }

  const homeIcon = r.homeStatus === 'TARGET' ? '✅' : r.homeStatus === 'ABOVE_FLOOR' ? '⚠️ ' : '❌';
  const homeStr = r.homeStatus === 'NO_INDEX' ? 'no index.html' : `${r.homeWords}w`;

  const innerAtTgt = r.inner.filter(p => p.status === 'TARGET').length;
  const innerAbvFloor = r.inner.filter(p => p.status === 'ABOVE_FLOOR').length;
  const innerBlwFloor = r.inner.filter(p => p.status === 'BELOW_FLOOR');
  const innerTotal = r.inner.length;

  let innerStr = innerTotal === 0 ? 'no inner pages' :
    `${innerAtTgt}/${innerTotal} at target`;
  if (innerAbvFloor > 0) innerStr += ` | ${innerAbvFloor} above floor`;
  if (innerBlwFloor.length > 0) {
    innerStr += ` | ❌ ${innerBlwFloor.length} under floor: ` +
      innerBlwFloor.map(p => `${p.name}(${p.wc}w)`).join(', ');
  }

  console.log(`${homeIcon} ${r.site} | home: ${homeStr} | inner: ${innerStr}`);
}

console.log('');
console.log('=== SUMMARY ===');
console.log(`Total sites in canonical list: ${sites.length}`);
console.log(`No local repo: ${homeNoRepo}`);
console.log(`Homepages at 1500w+ target: ${homeAtTarget}/${sites.length - homeNoRepo}`);
console.log(`Homepages above floor (800w+) but below 1500w target: ${homeAboveFloor}`);
console.log(`Homepages below 800w floor or missing: ${homeBelowFloor}`);
console.log(`Inner pages at 1000w+ target: ${innerAtTarget}`);
console.log(`Inner pages above floor (700w+) but below 1000w target: ${innerAboveFloor}`);
console.log(`Inner pages below 700w floor: ${innerBelowFloor}`);
console.log(`Total inner pages needing work (below 1000w target): ${innerAboveFloor + innerBelowFloor}`);
