/**
 * seo-audit-affiliate.js — Weekly SEO audit for all affiliate sites
 * Checks: title length, meta desc length, missing descs, blank alt text
 * Saves JSON report to: /home/ubuntu/.openclaw/workspace/memory/seo-audit-latest.json
 * 
 * Run: node scripts/seo-audit-affiliate.js
 */
const fs = require('fs');
const path = require('path');

const SITE_ROOTS = [
  '/home/ubuntu/.openclaw/workspace/sites',
  '/home/ubuntu/.openclaw/workspace/elipacko-sites',
  '/home/ubuntu/.openclaw/workspace/elipacko-usa.com',
];

const REPORT_PATH = '/home/ubuntu/.openclaw/workspace/memory/seo-audit-latest.json';

function decodeEntities(s) {
  return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&mdash;/g,'—').replace(/&ndash;/g,'–').replace(/&#\d+;/g,'').replace(/&[a-z]+;/g,'');
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? decodeEntities(m[1].replace(/<[^>]+>/g,'')) : null;
}

function extractMetaDesc(html) {
  // Use double-quote delimiter to handle apostrophes in content
  let m = html.match(/<meta\s+name=["']description["']\s+content="([^"]*?)"\s*\/?>/i);
  if (!m) m = html.match(/<meta\s+content="([^"]*?)"\s+name=["']description["']\s*\/?>/i);
  if (m) return m[1];
  // Fall back to single-quote delimiter
  m = html.match(/<meta\s+name=["']description["']\s+content='([^']*?)'\s*\/?>/i);
  if (!m) m = html.match(/<meta\s+content='([^']*?)'\s+name=["']description["']\s*\/?>/i);
  if (m) return m[1];
  return null;
}

function getBlankAltCount(html) {
  let count = 0;
  const imgRe = /<img([^>]*)>/gi;
  let m;
  while ((m = imgRe.exec(html)) !== null) {
    const attrs = m[1];
    const altM = attrs.match(/alt=["']([^"']*)["']/i);
    if (!altM || altM[1].trim() === '') {
      const srcM = attrs.match(/src=["']([^"']*)["']/i);
      if (srcM && !srcM[1].startsWith('data:')) count++;
    }
  }
  return count;
}

function walkHtml(dir) {
  const out = [], stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    let entries; try { entries = fs.readdirSync(d); } catch(e) { continue; }
    for (const f of entries) {
      if (f === '.git' || f === 'node_modules') continue;
      const p = path.join(d, f);
      let stat; try { stat = fs.statSync(p); } catch(e) { continue; }
      if (stat.isDirectory()) { stack.push(p); continue; }
      if (f.endsWith('.html')) out.push(p);
    }
  }
  return out;
}

const results = {
  generated: new Date().toISOString(),
  titleTooLong: [],
  descMissing: [],
  descTooLong: [],
  descTooShort: [],
  blankAlt: [],
  total: { pages: 0 }
};

const allFiles = [];
for (const root of SITE_ROOTS) {
  if (!fs.existsSync(root)) continue;
  const entries = fs.readdirSync(root).filter(f => !f.startsWith('.') && f !== 'node_modules');
  const hasHtml = entries.some(f => f.endsWith('.html'));
  if (hasHtml) {
    allFiles.push(...walkHtml(root));
  } else {
    for (const sub of entries) {
      if (sub.startsWith('{') || sub === 'DO_NOT_USE_IMAGES.md') continue;
      const subPath = path.join(root, sub);
      try { if (fs.statSync(subPath).isDirectory()) allFiles.push(...walkHtml(subPath)); } catch(e) {}
    }
  }
}

const seen = new Set();
for (const file of allFiles) {
  if (seen.has(file)) continue;
  seen.add(file);
  results.total.pages++;

  let html; try { html = fs.readFileSync(file, 'utf8'); } catch(e) { continue; }

  const rel = file.replace('/home/ubuntu/.openclaw/workspace/', '');
  const isIndex = file.endsWith('index.html');

  const title = extractTitle(html);
  if (title && title.length > 65) {
    results.titleTooLong.push({ file: rel, len: title.length, title });
  }

  const desc = extractMetaDesc(html);
  if (!desc && isIndex) {
    results.descMissing.push({ file: rel });
  }
  if (desc) {
    const decoded = decodeEntities(desc);
    if (decoded.length > 160) {
      results.descTooLong.push({ file: rel, len: decoded.length, desc: decoded });
    } else if (decoded.length < 80 && isIndex) {
      results.descTooShort.push({ file: rel, len: decoded.length, desc: decoded });
    }
  }

  const blankAlts = getBlankAltCount(html);
  if (blankAlts > 0) {
    results.blankAlt.push({ file: rel, count: blankAlts });
  }
}

fs.writeFileSync(REPORT_PATH, JSON.stringify(results, null, 2));

console.log('SEO AUDIT — ' + new Date().toISOString());
console.log('Pages audited:', results.total.pages);
console.log('Title >65 chars:', results.titleTooLong.length, results.titleTooLong.length > 0 ? '❌' : '✅');
console.log('Meta desc missing (index):', results.descMissing.length, results.descMissing.length > 0 ? '❌' : '✅');
console.log('Meta desc >160 chars:', results.descTooLong.length, results.descTooLong.length > 0 ? '❌' : '✅');
console.log('Meta desc <80 chars (index):', results.descTooShort.length, results.descTooShort.length > 0 ? '⚠️ ' : '✅');
console.log('Pages with blank img alt:', results.blankAlt.length, results.blankAlt.length > 0 ? '❌' : '✅');
console.log('\nReport saved to', REPORT_PATH);
