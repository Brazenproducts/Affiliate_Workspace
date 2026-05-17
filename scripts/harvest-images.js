#!/usr/bin/env node
/**
 * Harvest every Amazon image ID currently in use across all affiliate sites,
 * with context (site, file, nearest heading).
 * Output: /tmp/harvested-images.json as a map id -> [{site,file,heading,src}]
 */
const fs = require('fs'); const path = require('path');
const WS = '/home/ubuntu/.openclaw/workspace';
const sites = fs.readdirSync(WS, { withFileTypes: true })
  .filter(d => d.isDirectory() && (/\.com$/.test(d.name) || /-site$/.test(d.name)) && fs.existsSync(path.join(WS, d.name, '.git')))
  .map(d => d.name);

function walk(dir, out=[]) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.html?$/i.test(e.name)) out.push(p);
  }
  return out;
}

const map = new Map();
for (const site of sites) {
  for (const file of walk(path.join(WS, site))) {
    let html;
    try { html = fs.readFileSync(file, 'utf8'); } catch { continue; }
    const re = /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      const src = m[1];
      const idm = src.match(/m\.media-amazon\.com\/images\/I\/([A-Za-z0-9+%-]+)(?:\._[^.]+)?\.(?:jpg|jpeg|png|webp)/i);
      if (!idm) continue;
      const id = idm[1];
      // nearest heading before img
      const ctx = html.slice(Math.max(0, m.index - 800), m.index + 400);
      const heads = ctx.match(/<h[1-4][^>]*>([\s\S]{0,200}?)<\/h[1-4]>/gi) || [];
      const heading = heads.length ? heads[heads.length - 1].replace(/<[^>]+>/g, '').trim().slice(0, 140) : '';
      const arr = map.get(id) || [];
      arr.push({ site, file: path.relative(WS, file), heading, src });
      map.set(id, arr);
    }
  }
}

const obj = {};
for (const [id, arr] of map.entries()) obj[id] = arr;
fs.writeFileSync('/tmp/harvested-images.json', JSON.stringify(obj, null, 2));
console.log(`Harvested ${map.size} unique Amazon image IDs across ${sites.length} sites`);
