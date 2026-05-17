#!/usr/bin/env node
// Find every contact/email reference on affiliate sites.
const fs = require('fs');
const path = require('path');
const ROOT = '/home/ubuntu/.openclaw/workspace';

// Only scan top-level *.com repos that are the live published repos (have .git)
const sites = fs.readdirSync(ROOT).filter(d => {
  try {
    return d.endsWith('.com') &&
      fs.statSync(path.join(ROOT, d)).isDirectory() &&
      fs.existsSync(path.join(ROOT, d, '.git'));
  } catch { return false; }
});

const emailRe = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const contactFormRe = /<form[^>]*[^>]*action=|netlify|formspree|getform|formspark|web3forms|formsubmit|formbold|basin/i;
const contactLinkRe = /href="mailto:|\bcontact\.html|\bcontact-us\.html|contact\/\b/i;

const report = { sites: {} };

for (const site of sites.sort()) {
  const siteDir = path.join(ROOT, site);
  const entry = { emails: {}, formHints: [], contactPages: [], mailtos: [] };
  const walk = (dir) => {
    for (const f of fs.readdirSync(dir)) {
      if (f === '.git' || f === 'node_modules') continue;
      const p = path.join(dir, f);
      let st;
      try { st = fs.statSync(p); } catch { continue; }
      if (st.isDirectory()) { walk(p); continue; }
      if (!/\.(html?|md|txt|json|xml|js|css|liquid)$/i.test(f)) continue;
      let txt;
      try { txt = fs.readFileSync(p, 'utf8'); } catch { continue; }
      // Emails
      const emails = txt.match(emailRe) || [];
      for (const e of emails) {
        // filter noise like .png@ or sha-looking ones
        if (/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/i.test(e)) continue;
        if (e.length > 80) continue;
        entry.emails[e] = entry.emails[e] || [];
        entry.emails[e].push(path.relative(siteDir, p));
      }
      // Form hints
      if (contactFormRe.test(txt)) {
        entry.formHints.push(path.relative(siteDir, p));
      }
      // Contact link patterns
      if (/contact\.html|contact-us\.html/.test(f)) entry.contactPages.push(path.relative(siteDir, p));
      const mailtos = txt.match(/mailto:[^"'\s<>)]+/g);
      if (mailtos) entry.mailtos.push(...mailtos.map(m => `${path.relative(siteDir,p)}:${m}`));
    }
  };
  walk(siteDir);
  // Dedupe mailtos
  entry.mailtos = [...new Set(entry.mailtos)];
  entry.formHints = [...new Set(entry.formHints)];
  report.sites[site] = entry;
}

// Summary
const siteEntries = Object.entries(report.sites);
const hasContact = siteEntries.filter(([,e]) => Object.keys(e.emails).length || e.mailtos.length || e.contactPages.length || e.formHints.length);
console.log(`Scanned ${siteEntries.length} live repo sites.`);
console.log(`Sites with ANY contact/email artifact: ${hasContact.length}\n`);

// Aggregate unique emails
const allEmails = {};
for (const [site, e] of siteEntries) {
  for (const em of Object.keys(e.emails)) {
    allEmails[em] = allEmails[em] || new Set();
    allEmails[em].add(site);
  }
}
const emailRows = Object.entries(allEmails).sort((a,b) => b[1].size - a[1].size);
console.log(`Unique email addresses found: ${emailRows.length}`);
for (const [em, setOfSites] of emailRows) {
  console.log(`  ${em}  (${setOfSites.size} sites)`);
}

console.log('\nPer-site detail (only sites with findings):');
for (const [site, e] of hasContact) {
  console.log(`\n--- ${site} ---`);
  const emailKeys = Object.keys(e.emails);
  if (emailKeys.length) console.log(`  emails: ${emailKeys.join(', ')}`);
  if (e.mailtos.length) console.log(`  mailtos: ${e.mailtos.slice(0,3).join(' | ')}${e.mailtos.length>3?` (+${e.mailtos.length-3} more)`:''}`);
  if (e.contactPages.length) console.log(`  contact pages: ${e.contactPages.join(', ')}`);
  if (e.formHints.length) console.log(`  form hints: ${e.formHints.slice(0,5).join(', ')}${e.formHints.length>5?` (+${e.formHints.length-5} more)`:''}`);
}

fs.writeFileSync('/tmp/affiliate-contact-audit.json', JSON.stringify(report, null, 2));
console.log('\n\nFull JSON: /tmp/affiliate-contact-audit.json');
