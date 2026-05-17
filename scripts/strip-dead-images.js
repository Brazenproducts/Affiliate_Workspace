#!/usr/bin/env node
// Strip all <img> tags referencing dead Amazon image IDs.
// Uses /tmp/dead-images-all.json (covers top-level + affiliate-sites/).
// Properly escapes regex metacharacters in IDs (handles `+` etc).
const fs = require('fs');
const path = require('path');

const dead = JSON.parse(fs.readFileSync('/tmp/dead-images-all.json','utf8'));
const deadIds = Object.keys(dead);
const WS = '/home/ubuntu/.openclaw/workspace';

const filesBySite = {};
for (const id of deadIds) {
  for (const u of dead[id].usages) {
    if (!filesBySite[u.site]) filesBySite[u.site] = new Set();
    filesBySite[u.site].add(u.file);
  }
}

function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

const log = {};
for (const site of Object.keys(filesBySite)) {
  log[site] = { files: [], stripped: 0 };
  for (const rel of filesBySite[site]) {
    const fp = path.join(WS, rel);
    if (!fs.existsSync(fp)) { console.error('MISSING', fp); continue; }
    let html = fs.readFileSync(fp, 'utf8');
    const before = html;
    let stripped = 0;
    for (const id of deadIds) {
      const e = escRe(id);
      const divRe = new RegExp(`<div[^>]*float[^>]*>\\s*<img[^>]*I\\/${e}[^>]*>\\s*<\\/div>`, 'g');
      html = html.replace(divRe, () => { stripped++; return ''; });
      const imgRe = new RegExp(`<img[^>]*I\\/${e}[^>]*>\\s*`, 'g');
      html = html.replace(imgRe, () => { stripped++; return ''; });
    }
    if (html !== before) {
      fs.writeFileSync(fp, html);
      log[site].files.push({ file: rel, stripped });
      log[site].stripped += stripped;
    }
  }
}

fs.writeFileSync('/tmp/dead-image-strip-log.json', JSON.stringify(log, null, 2));
console.log('Sites touched:', Object.keys(log).filter(s => log[s].stripped > 0).length);
for (const s of Object.keys(log)) {
  if (log[s].stripped) console.log(`  ${s}: ${log[s].stripped} stripped across ${log[s].files.length} files`);
}
