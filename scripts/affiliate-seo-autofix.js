#!/usr/bin/env node
/**
 * Auto-add canonical links + basic meta descriptions to every affiliate HTML page
 * that's missing them. Safe / idempotent — skips files that already have them.
 *
 * Canonical = https://<domain>/<path>
 * Meta description = generated from <title> fallback if missing.
 *
 * Usage:
 *   node scripts/affiliate-seo-autofix.js               (all sites)
 *   node scripts/affiliate-seo-autofix.js --site=foo.com
 *   node scripts/affiliate-seo-autofix.js --dry         (preview only)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = '/home/ubuntu/.openclaw/workspace';
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const siteArg = (args.find(a => a.startsWith('--site=')) || '').split('=')[1];

function listSites() {
  return fs.readdirSync(ROOT).filter(d => {
    try {
      return d.endsWith('.com') &&
        fs.statSync(path.join(ROOT, d)).isDirectory() &&
        fs.existsSync(path.join(ROOT, d, '.git')) &&
        fs.existsSync(path.join(ROOT, d, 'index.html'));
    } catch { return false; }
  }).sort().filter(s => !siteArg || s === siteArg);
}

function walkHtml(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    for (const f of fs.readdirSync(d)) {
      if (f === '.git' || f === 'node_modules') continue;
      const p = path.join(d, f);
      let st; try { st = fs.statSync(p); } catch { continue; }
      if (st.isDirectory()) { stack.push(p); continue; }
      if (f.endsWith('.html')) out.push(p);
    }
  }
  return out;
}

function deriveDescription(html, fileName) {
  // Try to pull first paragraph text after h1
  const afterH1 = html.split(/<\/h1>/i)[1];
  if (afterH1) {
    const p = afterH1.match(/<p[^>]*>([\s\S]{40,300}?)<\/p>/i);
    if (p) {
      const text = p[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (text.length >= 60) return text.slice(0, 158);
    }
  }
  // Fallback to first <p>
  const anyP = html.match(/<p[^>]*>([\s\S]{40,300}?)<\/p>/i);
  if (anyP) {
    const text = anyP[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (text.length >= 60) return text.slice(0, 158);
  }
  // Generic fallback
  const base = fileName.replace(/\.html$/, '').replace(/[-_]/g, ' ');
  return `${base.charAt(0).toUpperCase() + base.slice(1)} — real-world picks, verified prices, no fake claims.`.slice(0, 158);
}

function fixFile(filePath, site) {
  let html = fs.readFileSync(filePath, 'utf8');
  const orig = html;
  const rel = path.relative(path.join(ROOT, site), filePath);
  const canonUrl = `https://${site}/${rel === 'index.html' ? '' : rel}`.replace(/\/$/, rel === 'index.html' ? '/' : '');
  const changes = [];

  // Must have <head>
  if (!/<head\b/i.test(html)) return { changed: false, changes: [] };

  // Canonical
  if (!/<link\s+rel="canonical"/i.test(html)) {
    const tag = `<link rel="canonical" href="${canonUrl}">`;
    if (/<meta\s+charset[^>]*>/i.test(html)) {
      html = html.replace(/(<meta\s+charset[^>]*>)/i, `$1\n${tag}`);
    } else {
      html = html.replace(/<head[^>]*>/i, m => `${m}\n${tag}`);
    }
    changes.push('canonical');
  }

  // Meta description
  if (!/<meta\s+name="description"\s+content="[^"]{40,}"/i.test(html)) {
    const desc = deriveDescription(html, path.basename(filePath)).replace(/"/g, "'");
    const tag = `<meta name="description" content="${desc}">`;
    if (/<title>[^<]+<\/title>/i.test(html)) {
      html = html.replace(/(<title>[^<]+<\/title>)/i, `$1\n${tag}`);
    } else {
      html = html.replace(/<head[^>]*>/i, m => `${m}\n${tag}`);
    }
    changes.push('meta-description');
  }

  // robots index,follow (only if missing)
  if (!/<meta\s+name="robots"/i.test(html)) {
    const tag = `<meta name="robots" content="index,follow">`;
    html = html.replace(/<head[^>]*>/i, m => `${m}\n${tag}`);
    changes.push('robots');
  }

  if (html !== orig && !DRY) fs.writeFileSync(filePath, html);
  return { changed: html !== orig, changes };
}

function main() {
  const sites = listSites();
  console.log(`SEO autofix across ${sites.length} site(s)${DRY ? ' (DRY RUN)' : ''}\n`);
  const results = [];
  for (const site of sites) {
    const siteDir = path.join(ROOT, site);
    const files = walkHtml(siteDir);
    let fixed = 0;
    const perFile = [];
    for (const f of files) {
      const r = fixFile(f, site);
      if (r.changed) {
        fixed++;
        perFile.push(`${path.relative(siteDir, f)} (${r.changes.join(', ')})`);
      }
    }
    if (fixed) {
      console.log(`  ${site}: ${fixed} file(s) updated`);
      if (!DRY) {
        try {
          execSync(`cd ${siteDir} && git add -A`, { stdio: 'pipe' });
          execSync(`cd ${siteDir} && git -c user.email=axl@brazenproducts.local -c user.name=Axl commit -m "SEO autofix: add missing canonical/meta-description/robots tags"`, { stdio: 'pipe' });
          execSync(`cd ${siteDir} && git pull --rebase origin main 2>&1`, { stdio: 'pipe' });
          execSync(`cd ${siteDir} && git push origin HEAD 2>&1`, { stdio: 'pipe' });
          const sha = execSync(`cd ${siteDir} && git rev-parse --short HEAD`, { encoding: 'utf8' }).trim();
          results.push({ site, fixed, sha, files: perFile });
        } catch (e) {
          results.push({ site, fixed, error: (e.stderr?.toString() || e.message).slice(0, 300) });
          console.log(`    ✗ push failed: ${(e.stderr?.toString() || e.message).slice(0, 120)}`);
        }
      }
    } else {
      results.push({ site, fixed: 0 });
      console.log(`  ${site}: clean`);
    }
  }
  fs.writeFileSync('/tmp/affiliate-seo-autofix.json', JSON.stringify(results, null, 2));
  console.log(`\nSites updated: ${results.filter(r => r.fixed).length}/${sites.length}`);
}
main();
