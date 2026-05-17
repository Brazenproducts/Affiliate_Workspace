#!/usr/bin/env node
/**
 * duplicate-image-audit.js
 *
 * Scan every affiliate site repo for duplicate / mismatched vehicle-card images.
 * Flags:
 *  (a) Same image URL (Amazon media-amazon ID or Shopify CDN path) used by >1
 *      distinct vehicle/product card on the same HTML page.
 *  (b) Obvious mismatches:
 *       - Wrangler TJ Bartact image (29023020023851) used on non-Jeep sites
 *       - Broken DERA image
 *       - BAKFlip MX4 hard-fold image (61mpK93Qg0L) repeated across non-BAKFlip cards
 *       - Tonneau-identified image used on seat-cover site or vice versa
 *
 * Output: /tmp/duplicate-image-audit.md
 *
 * Usage: node scripts/duplicate-image-audit.js
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const REPORT = '/tmp/duplicate-image-audit.md';

// find every top-level directory that looks like a site repo (.com/ or -site/) with .git
const siteDirs = fs.readdirSync(WORKSPACE, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .filter(n => (/\.com$/.test(n) || /-site$/.test(n)) && fs.existsSync(path.join(WORKSPACE, n, '.git')))
  .sort();

// Known "dangerous" image identifiers
const KNOWN_BAD = {
  'DERA-BARTACT-UNIVERSAL-TAN-1.jpg': 'Broken DERA image (404)',
};
const WRANGLER_TJ_ID = '29023020023851';
const BAKFLIP_MX4_ID = '61mpK93Qg0L';

// Jeep-like tokens in site names where Wrangler TJ image is acceptable
const JEEP_SITES = /(jeep|wrangler|gladiator|tj|jk|jl)/i;
// Tonneau-related tokens
const TONNEAU_SITES = /(tonneau|bed|truck)/i;

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (entry.isFile() && /\.html?$/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Given HTML, identify "cards" — blocks of HTML that contain an <img> plus
 * some card-ish surrounding text (h3/h2, vehicle token, product token).
 * We segment by common card-ending tags.
 *
 * Approach: find every <img ... src="..."> occurrence, then grab ~600 chars
 * before it to capture the card context (heading).
 */
function extractCards(html) {
  const cards = [];
  const imgRe = /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = imgRe.exec(html)) !== null) {
    const src = m[1];
    const start = Math.max(0, m.index - 800);
    const end = Math.min(html.length, m.index + 400);
    const ctx = html.slice(start, end);
    // try to pull nearest heading text before the img
    const headMatch = ctx.match(/<h[1-4][^>]*>([\s\S]{0,200}?)<\/h[1-4]>/gi);
    const lastHead = headMatch ? headMatch[headMatch.length - 1].replace(/<[^>]+>/g, '').trim() : '';
    cards.push({ src, ctx, heading: lastHead, index: m.index });
  }
  return cards;
}

function imageKey(src) {
  // Amazon media-amazon image ID
  let mm = src.match(/m\.media-amazon\.com\/images\/I\/([A-Za-z0-9+%-]+)(?:\._[^.]+)?\.(?:jpg|png|jpeg|webp)/i);
  if (mm) return { kind: 'amazon', key: mm[1], norm: `amazon:${mm[1]}` };
  // Shopify CDN
  let sh = src.match(/cdn\.shopify\.com\/[^"'\s]+/i);
  if (sh) {
    // normalize by stripping ?v=... and trailing size suffixes
    let u = sh[0].split('?')[0];
    return { kind: 'shopify', key: u, norm: `shopify:${u}` };
  }
  // Local images/ path
  let loc = src.match(/\/?images\/[^"'\s]+/i);
  if (loc) return { kind: 'local', key: loc[0], norm: `local:${loc[0]}` };
  return null;
}

// vehicle token detection (to see if cards reference different vehicles)
const VEHICLE_TOKENS = [
  'f-150','f150','f-250','f250','f-350','f350',
  'silverado','colorado','canyon','tundra','tacoma',
  'ram 1500','ram 2500','ram 3500','ranger','4runner','4-runner',
  'bronco','wrangler','gladiator','cherokee','grand cherokee',
  'cybertruck','rivian','r1t','r1s','r2t','r2s',
  'jl','jk','tj','yj','jt',
  'sierra','titan','frontier','ridgeline','maverick',
];
function vehicleOf(text) {
  const lower = text.toLowerCase();
  for (const t of VEHICLE_TOKENS) if (lower.includes(t)) return t;
  return null;
}

function isSeatCoverUrl(src) {
  return /seat-cover|seatcover|bartact/i.test(src);
}
function isTonneauUrl(src) {
  return /tonneau|bakflip|tri-?fold|retractable-bed|gator-etx|truxedo/i.test(src);
}

const report = { sites: {} };
let grandViolations = 0;

for (const site of siteDirs) {
  const root = path.join(WORKSPACE, site);
  const isJeepSite = JEEP_SITES.test(site);
  const isTonneauSite = TONNEAU_SITES.test(site) && !/seat/i.test(site);
  const isSeatSite = /seat/i.test(site);
  const htmls = walk(root);
  const siteEntry = { pages: {}, totals: 0 };

  for (const file of htmls) {
    let html;
    try { html = fs.readFileSync(file, 'utf8'); } catch { continue; }
    const cards = extractCards(html);
    if (!cards.length) continue;

    // Group cards by normalized image key
    const groups = new Map(); // norm -> [{src,heading,vehicle,idx}]
    for (const c of cards) {
      const k = imageKey(c.src);
      if (!k) continue;
      // skip obvious non-card images: icons, logos, favicons, hero banner marked as hero
      if (/logo|favicon|icon-|sprite|placeholder|banner-bg/i.test(c.src)) continue;
      // skip svg
      if (/\.svg(\?|$)/i.test(c.src)) continue;
      const vehicle = vehicleOf(c.ctx) || vehicleOf(c.heading);
      const arr = groups.get(k.norm) || [];
      arr.push({ src: c.src, heading: c.heading.slice(0, 120), vehicle, idx: c.index, kind: k.kind, key: k.key });
      groups.set(k.norm, arr);
    }

    const violations = [];

    // (a) dup detection — same image used across cards with DIFFERENT vehicle tokens
    for (const [norm, arr] of groups.entries()) {
      if (arr.length < 2) continue;
      const distinctVehicles = new Set(arr.map(x => x.vehicle).filter(Boolean));
      const distinctHeadings = new Set(arr.map(x => x.heading).filter(Boolean));
      // flag if >1 distinct vehicle OR >1 distinct card heading shares same image
      if (distinctVehicles.size > 1 || distinctHeadings.size > 1) {
        violations.push({
          type: 'duplicate-image',
          image: arr[0].src,
          norm,
          count: arr.length,
          vehicles: [...distinctVehicles],
          headings: [...distinctHeadings].slice(0, 6),
        });
      }
    }

    // (b) mismatches
    for (const c of cards) {
      // Broken DERA
      for (const bad of Object.keys(KNOWN_BAD)) {
        if (c.src.includes(bad)) {
          violations.push({ type: 'known-bad', image: c.src, reason: KNOWN_BAD[bad], heading: c.heading.slice(0, 120) });
        }
      }
      // Wrangler TJ on non-Jeep
      if (!isJeepSite && c.src.includes(WRANGLER_TJ_ID)) {
        violations.push({ type: 'wrangler-tj-on-nonjeep', image: c.src, heading: c.heading.slice(0, 120) });
      }
      // BAKFlip MX4 used on a non-BAKFlip card
      if (c.src.includes(BAKFLIP_MX4_ID) && !/bakflip|mx4/i.test(c.heading)) {
        violations.push({ type: 'bakflip-mx4-mislabeled', image: c.src, heading: c.heading.slice(0, 120) });
      }
      // Tonneau image on seat-cover site
      if (isSeatSite && isTonneauUrl(c.src) && !isSeatCoverUrl(c.src)) {
        violations.push({ type: 'tonneau-on-seatsite', image: c.src, heading: c.heading.slice(0, 120) });
      }
      // Seat cover image on pure tonneau site card that is NOT a seat-cover card
      if (isTonneauSite && isSeatCoverUrl(c.src) && !/seat/i.test(c.heading)) {
        violations.push({ type: 'seat-cover-on-tonneausite', image: c.src, heading: c.heading.slice(0, 120) });
      }
    }

    if (violations.length) {
      const rel = path.relative(root, file);
      siteEntry.pages[rel] = violations;
      siteEntry.totals += violations.length;
    }
  }

  if (siteEntry.totals > 0) {
    report.sites[site] = siteEntry;
    grandViolations += siteEntry.totals;
  }
}

// Write markdown report
const lines = [];
lines.push(`# Duplicate Image Audit Report`);
lines.push('');
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push(`Sites scanned: ${siteDirs.length}`);
lines.push(`Sites with violations: ${Object.keys(report.sites).length}`);
lines.push(`Total violations: ${grandViolations}`);
lines.push('');

// sort sites by violation count desc
const sorted = Object.entries(report.sites).sort((a, b) => b[1].totals - a[1].totals);

lines.push(`## Summary (violations per site)`);
lines.push('');
for (const [site, entry] of sorted) {
  lines.push(`- **${site}** — ${entry.totals} violations across ${Object.keys(entry.pages).length} page(s)`);
}
lines.push('');

for (const [site, entry] of sorted) {
  lines.push(`---`);
  lines.push(`## ${site}  (${entry.totals} violations)`);
  lines.push('');
  for (const [page, vios] of Object.entries(entry.pages)) {
    lines.push(`### \`${page}\``);
    lines.push('');
    for (const v of vios) {
      if (v.type === 'duplicate-image') {
        lines.push(`- 🔁 **Duplicate image used ${v.count}× across different cards**`);
        lines.push(`  - image: \`${v.image}\``);
        if (v.vehicles.length) lines.push(`  - vehicles touched: ${v.vehicles.join(', ')}`);
        if (v.headings.length) lines.push(`  - card headings: ${v.headings.map(h => `"${h}"`).join(' | ')}`);
      } else if (v.type === 'wrangler-tj-on-nonjeep') {
        lines.push(`- ❌ **Wrangler TJ Bartact image on non-Jeep site**`);
        lines.push(`  - heading: "${v.heading}"`);
        lines.push(`  - image: \`${v.image}\``);
      } else if (v.type === 'known-bad') {
        lines.push(`- ❌ **Known-bad image (${v.reason})**`);
        lines.push(`  - heading: "${v.heading}"`);
        lines.push(`  - image: \`${v.image}\``);
      } else if (v.type === 'bakflip-mx4-mislabeled') {
        lines.push(`- ⚠️  **BAKFlip MX4 image on non-BAKFlip card**`);
        lines.push(`  - heading: "${v.heading}"`);
        lines.push(`  - image: \`${v.image}\``);
      } else if (v.type === 'tonneau-on-seatsite') {
        lines.push(`- ⚠️  **Tonneau image on seat-cover site card**`);
        lines.push(`  - heading: "${v.heading}"`);
        lines.push(`  - image: \`${v.image}\``);
      } else if (v.type === 'seat-cover-on-tonneausite') {
        lines.push(`- ⚠️  **Seat-cover image on tonneau/truck-bed site card**`);
        lines.push(`  - heading: "${v.heading}"`);
        lines.push(`  - image: \`${v.image}\``);
      }
    }
    lines.push('');
  }
}

fs.writeFileSync(REPORT, lines.join('\n'));
console.log(`Wrote ${REPORT}`);
console.log(`Sites scanned: ${siteDirs.length}, with violations: ${Object.keys(report.sites).length}, total: ${grandViolations}`);

// also emit JSON for machine consumption
fs.writeFileSync(REPORT.replace(/\.md$/, '.json'), JSON.stringify(report, null, 2));
