#!/usr/bin/env node
// Swap SET_ME_ACCESS_KEY -> real Web3Forms key across all live affiliate contact.html files.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = '/home/ubuntu/.openclaw/workspace';
const KEY = process.argv[2];
if (!KEY || !/^[0-9a-f-]{30,}$/i.test(KEY)) {
  console.error('Usage: node update-contact-form-key.js <access-key>');
  process.exit(1);
}

const sites = fs.readdirSync(ROOT).filter(d => {
  try {
    return d.endsWith('.com') &&
      fs.statSync(path.join(ROOT, d)).isDirectory() &&
      fs.existsSync(path.join(ROOT, d, '.git')) &&
      fs.existsSync(path.join(ROOT, d, 'contact.html'));
  } catch { return false; }
}).sort();

console.log(`Updating ${sites.length} sites\n`);
const results = [];
for (const site of sites) {
  const dir = path.join(ROOT, site);
  const cp = path.join(dir, 'contact.html');
  let html = fs.readFileSync(cp, 'utf8');
  if (!html.includes('SET_ME_ACCESS_KEY')) {
    results.push({ site, status: 'already-keyed' });
    console.log(`-  ${site}  (already keyed)`);
    continue;
  }
  html = html.replace(/SET_ME_ACCESS_KEY/g, KEY);
  fs.writeFileSync(cp, html);
  try {
    execSync(`cd ${dir} && git add contact.html`, { stdio: 'pipe' });
    execSync(`cd ${dir} && git -c user.email=axl@brazenproducts.local -c user.name=Axl commit -m "Contact form: set Web3Forms access key (go live)"`, { stdio: 'pipe' });
    execSync(`cd ${dir} && git pull --rebase origin main`, { stdio: 'pipe' });
    execSync(`cd ${dir} && git push origin HEAD`, { stdio: 'pipe' });
    const sha = execSync(`cd ${dir} && git rev-parse --short HEAD`, { encoding: 'utf8' }).trim();
    results.push({ site, sha, status: 'pushed' });
    console.log(`✓  ${site}  ${sha}`);
  } catch (e) {
    results.push({ site, status: 'error', error: (e.stderr?.toString() || e.message).slice(0, 200) });
    console.log(`✗  ${site}  ${(e.stderr?.toString() || e.message).slice(0, 120)}`);
  }
}
fs.writeFileSync('/tmp/contact-form-key-update.json', JSON.stringify(results, null, 2));
console.log(`\nPushed: ${results.filter(r => r.status === 'pushed').length}`);
console.log(`Errors: ${results.filter(r => r.status === 'error').length}`);
