#!/usr/bin/env node
// Harvest Amazon image IDs across BOTH top-level *.com and affiliate-sites/*.com repos.
const fs = require('fs'); const path = require('path');
const WS = '/home/ubuntu/.openclaw/workspace';

function findRepos() {
  const repos = [];
  for (const d of fs.readdirSync(WS, { withFileTypes: true })) {
    if (d.isDirectory() && (/\.com$/.test(d.name) || /-site$/.test(d.name)) && fs.existsSync(path.join(WS, d.name, '.git'))) {
      repos.push({ key: d.name, dir: path.join(WS, d.name) });
    }
  }
  const sub = path.join(WS, 'affiliate-sites');
  if (fs.existsSync(sub)) {
    for (const d of fs.readdirSync(sub, { withFileTypes: true })) {
      if (d.isDirectory() && (/\.com$/.test(d.name) || /-site$/.test(d.name)) && fs.existsSync(path.join(sub, d.name, '.git'))) {
        repos.push({ key: 'affiliate-sites/' + d.name, dir: path.join(sub, d.name) });
      }
    }
  }
  return repos;
}

function walk(dir, out=[]) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) walk(fp, out);
    else if (e.name.endsWith('.html')) out.push(fp);
  }
  return out;
}

const out = {};
for (const r of findRepos()) {
  for (const file of walk(r.dir)) {
    let html;
    try { html = fs.readFileSync(file, 'utf8'); } catch { continue; }
    const re = /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = re.exec(html))) {
      const src = m[1];
      const idMatch = src.match(/m\.media-amazon\.com\/images\/I\/([^.\/_"']+)/);
      if (!idMatch) continue;
      const id = idMatch[1];
      // find nearest preceding heading
      const before = html.slice(0, m.index);
      const hMatch = [...before.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)].pop();
      const heading = hMatch ? hMatch[1].replace(/<[^>]+>/g,'').trim() : '';
      if (!out[id]) out[id] = [];
      out[id].push({ site: r.key, file: path.relative(WS, file), heading, src });
    }
  }
}
fs.writeFileSync('/tmp/harvested-images-all.json', JSON.stringify(out, null, 2));
console.log('Unique IDs:', Object.keys(out).length);
