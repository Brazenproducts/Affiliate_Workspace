#!/usr/bin/env node
require('dotenv').config({path:'/home/ubuntu/.openclaw/workspace/.env'});
const fs = require('fs');
const path = require('path');
const https = require('https');

const SITES_DIR = '/home/ubuntu/.openclaw/workspace/sites';

const TARGETS = {
  '/collections/grab-handles': 2000,
  '/collections/limit-straps': 2500,
  '/collections/carli-suspension': 2500,
  '/collections/molle-accessories': 1000,
  '/collections/ford-bronco-accessories': 1000,
  '/collections/jeep-wrangler-seat-covers-1': 1000,
  '/collections/bull-strap-tie-downs-and-recovery': 500,
  '/collections/2016-19-toyota-tacoma': 500,
  '/collections/jeep-gladiator-2019-22-accessories': 500,
  '/collections/roll-cages': 500,
  '/collections/fire-extinguishers-mounts': 200,
};

const IRRELEVANT_KEYWORDS = ['blockchain','crypto','bath','heater','supplement','dining','kitchen','airfilter','allergen','virus','firewood','hardwood','cement','cushion','embroid','corrugat','pallet','racking','shipping','packaging'];

function sendTelegram(text) {
  return new Promise((res) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) { console.log('No Telegram token — skipping send'); return res(); }
    const body = JSON.stringify({ chat_id: '7550065844', text, parse_mode: 'Markdown' });
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, r => { r.resume(); r.on('end', res); });
    req.on('error', () => res());
    req.write(body); req.end();
  });
}

async function main() {
  const counts = {};
  const violations = { homepage: 0, collectionsAll: 0, irrelevant: new Set() };
  let totalFiles = 0;

  const siteDirs = fs.readdirSync(SITES_DIR).filter(d => {
    try { return fs.statSync(path.join(SITES_DIR,d)).isDirectory(); } catch(e) { return false; }
  });

  for (const site of siteDirs) {
    const siteDir = path.join(SITES_DIR, site);
    let files;
    try { files = fs.readdirSync(siteDir).filter(f => f.endsWith('.html')); } catch(e) { continue; }

    const isIrrelevant = IRRELEVANT_KEYWORDS.some(k => site.toLowerCase().includes(k));

    for (const file of files) {
      totalFiles++;
      let content;
      try { content = fs.readFileSync(path.join(siteDir, file), 'utf8'); } catch(e) { continue; }

      const links = content.match(/href="https:\/\/bullstrap\.com([^"]*)"/g) || [];
      for (const link of links) {
        const urlPath = link.replace('href="https://bullstrap.com', '').replace('"','').trim() || '/';
        if (urlPath === '/' || urlPath === '') violations.homepage++;
        else if (urlPath === '/collections/all') violations.collectionsAll++;
        else {
          counts[urlPath] = (counts[urlPath] || 0) + 1;
          if (isIrrelevant) violations.irrelevant.add(site);
        }
      }
    }
  }

  // Build report
  let report = `*Bull Strap Backlink Audit — ${new Date().toISOString().slice(0,10)}*\n`;
  report += `Scanned ${siteDirs.length} sites, ${totalFiles} files\n\n`;
  report += `*Collection Links vs Targets:*\n`;

  const gaps = [];
  for (const [col, target] of Object.entries(TARGETS)) {
    const count = counts[col] || 0;
    const pct = Math.round(count/target*100);
    const status = count >= target ? '✅' : count >= target*0.5 ? '⚠️' : '🔴';
    report += `${status} ${col.replace('/collections/','')}: ${count.toLocaleString()}/${target.toLocaleString()} (${pct}%)\n`;
    if (count < target) gaps.push({ col, count, target });
  }

  // Other specific links
  report += `\n*Other specific links found:*\n`;
  const otherLinks = Object.entries(counts)
    .filter(([k]) => !TARGETS[k])
    .sort((a,b) => b[1]-a[1])
    .slice(0,10);
  for (const [col, count] of otherLinks) {
    report += `  ${col}: ${count}\n`;
  }

  report += `\n*Violations:*\n`;
  report += `🔴 Homepage links (bullstrap.com): ${violations.homepage}\n`;
  report += `🔴 /collections/all links: ${violations.collectionsAll}\n`;
  report += `🔴 Irrelevant sites: ${violations.irrelevant.size}${violations.irrelevant.size ? ' — '+[...violations.irrelevant].slice(0,3).join(', ') : ''}\n`;

  const hasProblems = gaps.length || violations.homepage > 0 || violations.collectionsAll > 0 || violations.irrelevant.size > 0;
  if (hasProblems) {
    report += `\n⚠️ *Action required: Filli must fix gaps per SEO Playbook Section 28*`;
  } else {
    report += `\n✅ All targets met!`;
  }

  console.log(report);
  fs.writeFileSync('/home/ubuntu/.openclaw/workspace/memory/bullstrap-backlink-audit-latest.md', report);

  if (hasProblems) await sendTelegram(report);
}

main().catch(e => console.error(e.message));
