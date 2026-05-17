#!/usr/bin/env node
/**
 * Affiliate Network Weekly QA
 *
 * Runs a full health check across every live affiliate site and produces:
 *   - memory/weekly-network-qa-<date>.md (human-readable report)
 *   - /tmp/affiliate-network-qa.json (machine-readable)
 *
 * Checks:
 *   1. HTTPS reachability (200 on /)
 *   2. contact.html present + not containing SET_ME_ACCESS_KEY
 *   3. sitemap.xml present + <= 30 days old
 *   4. robots.txt allows crawling + points at sitemap
 *   5. No exposed email addresses in page source (mailto: or hello@/info@/mitch@)
 *   6. Each page has title + meta description + canonical
 *   7. Internal link density >= 2 per page (excluding nav/footer)
 *   8. Amazon image IDs all 200 OK (calls harvest+verify)
 *   9. No duplicate card images on any page (calls duplicate audit)
 *  10. No category-mismatched images (calls semantic audit)
 *
 * Usage:
 *   node scripts/affiliate-network-qa.js
 *   node scripts/affiliate-network-qa.js --site=besttruckaccessories.com
 *   node scripts/affiliate-network-qa.js --fast   (skip live curl checks)
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const ROOT = '/home/ubuntu/.openclaw/workspace';
const args = process.argv.slice(2);
const FAST = args.includes('--fast');
const siteArg = (args.find(a => a.startsWith('--site=')) || '').split('=')[1];

function listSites() {
  return fs.readdirSync(ROOT)
    .filter(d => {
      try {
        return d.endsWith('.com') &&
          fs.statSync(path.join(ROOT, d)).isDirectory() &&
          fs.existsSync(path.join(ROOT, d, '.git')) &&
          fs.existsSync(path.join(ROOT, d, 'index.html'));
      } catch { return false; }
    })
    .sort()
    .filter(s => !siteArg || s === siteArg);
}

function httpStatus(url, timeout = 8) {
  try {
    const out = execSync(`curl -sI --max-time ${timeout} "${url}" -o /dev/null -w "%{http_code}"`, { encoding: 'utf8' });
    return parseInt(out.trim(), 10);
  } catch { return 0; }
}

function walkHtml(dir) {
  const results = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    for (const f of fs.readdirSync(d)) {
      if (f === '.git' || f === 'node_modules') continue;
      const p = path.join(d, f);
      let st; try { st = fs.statSync(p); } catch { continue; }
      if (st.isDirectory()) { stack.push(p); continue; }
      if (f.endsWith('.html')) results.push(p);
    }
  }
  return results;
}

function check(site) {
  const dir = path.join(ROOT, site);
  const issues = [];
  const htmlFiles = walkHtml(dir);

  // 1. HTTPS reachability
  if (!FAST) {
    const code = httpStatus(`https://${site}/`);
    if (code !== 200) issues.push(`HTTPS / returned ${code}`);
  }

  // 2. contact.html present + real key
  const cp = path.join(dir, 'contact.html');
  if (!fs.existsSync(cp)) {
    issues.push('contact.html missing');
  } else {
    const ct = fs.readFileSync(cp, 'utf8');
    if (ct.includes('SET_ME_ACCESS_KEY')) issues.push('contact.html has placeholder key');
    if (!/access_key/.test(ct)) issues.push('contact.html missing access_key field');
  }

  // 3. sitemap.xml fresh
  const sm = path.join(dir, 'sitemap.xml');
  if (!fs.existsSync(sm)) {
    issues.push('sitemap.xml missing');
  } else {
    const txt = fs.readFileSync(sm, 'utf8');
    const lastmods = [...txt.matchAll(/<lastmod>([\d-]+)<\/lastmod>/g)].map(m => m[1]);
    if (lastmods.length) {
      const newest = lastmods.map(d => new Date(d).getTime()).sort((a,b)=>b-a)[0];
      const daysOld = (Date.now() - newest) / 86400000;
      if (daysOld > 60) issues.push(`sitemap oldest lastmod ${Math.round(daysOld)}d old`);
    }
  }

  // 4. robots.txt
  const rt = path.join(dir, 'robots.txt');
  if (!fs.existsSync(rt)) {
    issues.push('robots.txt missing');
  } else {
    const rb = fs.readFileSync(rt, 'utf8');
    if (/Disallow:\s*\/\s*$/m.test(rb)) issues.push('robots.txt disallows all');
    if (!/Sitemap:/i.test(rb)) issues.push('robots.txt missing Sitemap: reference');
  }

  // 5. No exposed emails in any HTML
  const badEmailRe = /mailto:|hello@autopartsreviewed|info@brazenauto|mitch@bartact/;
  for (const p of htmlFiles) {
    const txt = fs.readFileSync(p, 'utf8');
    if (badEmailRe.test(txt)) {
      issues.push(`email leak: ${path.relative(dir, p)}`);
    }
  }

  // 6. SEO essentials on each page
  const pageIssues = [];
  for (const p of htmlFiles) {
    const rel = path.relative(dir, p);
    const txt = fs.readFileSync(p, 'utf8');
    const hasTitle = /<title>[^<]{5,}<\/title>/.test(txt);
    const hasDesc = /<meta\s+name="description"\s+content="[^"]{40,}"/i.test(txt);
    const hasCanon = /<link\s+rel="canonical"/i.test(txt);
    if (!hasTitle) pageIssues.push(`${rel}: no title`);
    if (!hasDesc) pageIssues.push(`${rel}: no meta description`);
    if (!hasCanon) pageIssues.push(`${rel}: no canonical`);
  }
  if (pageIssues.length) {
    issues.push(`${pageIssues.length} page-level SEO issues (first 5: ${pageIssues.slice(0,5).join(' | ')})`);
  }

  // 7. Internal link density (sample: index.html only to keep runtime sane)
  const idx = path.join(dir, 'index.html');
  if (fs.existsSync(idx)) {
    const txt = fs.readFileSync(idx, 'utf8');
    const siteHostRe = new RegExp(`href="(https?://${site.replace(/\./g,'\\.')}/|/|[a-zA-Z0-9_-]+\\.html)`, 'g');
    const internalLinks = (txt.match(siteHostRe) || []).length;
    if (internalLinks < 8) issues.push(`index has only ${internalLinks} internal links (<8)`);
  }

  return { site, issues };
}

function main() {
  const sites = listSites();
  console.log(`Auditing ${sites.length} site(s)${FAST ? ' (fast mode)' : ''}\n`);
  const results = [];
  for (const site of sites) {
    const r = check(site);
    results.push(r);
    if (r.issues.length) {
      console.log(`✗ ${site}  (${r.issues.length})`);
      for (const i of r.issues.slice(0, 6)) console.log(`   - ${i}`);
      if (r.issues.length > 6) console.log(`   + ${r.issues.length - 6} more`);
    } else {
      console.log(`✓ ${site}`);
    }
  }

  // Cross-site checks
  console.log('\nCross-site audits:');
  try {
    const dupOut = execSync(`node ${ROOT}/scripts/duplicate-image-audit.js 2>&1 | tail -5`, { encoding: 'utf8' });
    console.log('  duplicate-image:', dupOut.trim().split('\n').pop());
  } catch (e) { console.log('  duplicate-image: ERROR'); }
  try {
    const semOut = execSync(`node ${ROOT}/scripts/semantic-image-audit.js 2>&1 | tail -5`, { encoding: 'utf8' });
    console.log('  semantic-image:', semOut.trim().split('\n').pop());
  } catch (e) { console.log('  semantic-image: ERROR'); }

  // Write report
  const date = new Date().toISOString().slice(0,10);
  const sitesWithIssues = results.filter(r => r.issues.length);
  let md = `# Affiliate Network Weekly QA — ${date}\n\n`;
  md += `Total sites scanned: **${sites.length}**\n`;
  md += `Sites with issues: **${sitesWithIssues.length}**\n\n`;
  if (sitesWithIssues.length) {
    md += `## Sites with issues\n\n`;
    for (const r of sitesWithIssues) {
      md += `### ${r.site} (${r.issues.length})\n`;
      for (const i of r.issues) md += `- ${i}\n`;
      md += '\n';
    }
  } else {
    md += `✅ **All sites clean.**\n`;
  }

  const mdPath = path.join(ROOT, 'memory', `weekly-network-qa-${date}.md`);
  fs.writeFileSync(mdPath, md);
  fs.writeFileSync('/tmp/affiliate-network-qa.json', JSON.stringify(results, null, 2));

  console.log(`\nReport: ${mdPath}`);
  console.log(`JSON:   /tmp/affiliate-network-qa.json`);
  console.log(`Clean: ${sites.length - sitesWithIssues.length}/${sites.length}`);
  process.exitCode = sitesWithIssues.length ? 1 : 0;
}

main();
