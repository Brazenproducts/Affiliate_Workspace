#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SITES_DIR = '/home/ubuntu/.openclaw/workspace/sites';
const AFFILIATE_TAG = 'tag=brazenprodu01-20';
const DEAD_DOMAIN = 'bartactseats.com';

function getAllHtmlFiles(dir) {
  let results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) results = results.concat(getAllHtmlFiles(full));
      else if (e.isFile() && e.name.endsWith('.html')) results.push(full);
    }
  } catch(err) {}
  return results;
}

function extractLinks(html) {
  const links = [];
  const re = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) links.push(m[1]);
  return links;
}

function extractAmazonLinks(html) {
  const links = [];
  const re = /https?:\/\/(?:www\.)?amazon\.com[^\s"'<>]*/gi;
  let m;
  while ((m = re.exec(html)) !== null) links.push(m[0]);
  return links;
}

const siteDirs = fs.readdirSync(SITES_DIR).map(name => ({
  name,
  dir: path.join(SITES_DIR, name),
  count: 0
})).filter(s => {
  try { return fs.statSync(s.dir).isDirectory(); } catch(e) { return false; }
});

for (const s of siteDirs) {
  s.count = getAllHtmlFiles(s.dir).length;
}
siteDirs.sort((a, b) => b.count - a.count);
const top10 = siteDirs.slice(0, 10);

console.log('TOP 10 SITES BY PAGE COUNT:');
top10.forEach((s, i) => console.log('  ' + (i+1) + '. ' + s.name + ' (' + s.count + ' pages)'));
console.log('');

const report = [];
for (const site of top10) {
  const htmlFiles = getAllHtmlFiles(site.dir);
  const siteIssues = { site: site.name, dir: site.dir, pages: htmlFiles.length, issues: [] };

  for (const file of htmlFiles) {
    const rel = path.relative(site.dir, file);
    let html;
    try { html = fs.readFileSync(file, 'utf8'); } catch(e) { continue; }
    const links = extractLinks(html);

    for (const link of links) {
      if (link.startsWith('http') || link.startsWith('//') || link.startsWith('#') || link.startsWith('mailto:') || link.startsWith('tel:')) continue;
      if (!link.includes('.html')) continue;
      const linkPath = link.split('#')[0].split('?')[0];
      if (!linkPath) continue;
      const resolved = path.resolve(path.dirname(file), linkPath);
      if (!fs.existsSync(resolved)) {
        siteIssues.issues.push({ type: 'broken_internal', file: rel, link });
      }
    }

    const amazonLinks = extractAmazonLinks(html);
    for (const alink of amazonLinks) {
      if (!alink.includes(AFFILIATE_TAG)) {
        siteIssues.issues.push({ type: 'missing_affiliate_tag', file: rel, link: alink });
      }
    }

    if (html.includes(DEAD_DOMAIN)) {
      const re2 = /href=["'][^"']*bartactseats\.com[^"']*["']/gi;
      let m2;
      while ((m2 = re2.exec(html)) !== null) {
        siteIssues.issues.push({ type: 'dead_domain_bartactseats', file: rel, link: m2[0] });
      }
    }
  }

  report.push(siteIssues);
  const broken = siteIssues.issues.filter(i => i.type === 'broken_internal').length;
  const noTag = siteIssues.issues.filter(i => i.type === 'missing_affiliate_tag').length;
  const dead = siteIssues.issues.filter(i => i.type === 'dead_domain_bartactseats').length;
  console.log(site.name + ': ' + broken + ' broken internal, ' + noTag + ' missing affiliate tag, ' + dead + ' dead domain');
}

fs.writeFileSync('/tmp/affiliate-link-check-report.json', JSON.stringify(report, null, 2));
console.log('\nFull report written to /tmp/affiliate-link-check-report.json');
