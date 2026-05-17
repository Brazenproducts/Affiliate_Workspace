#!/usr/bin/env node
// Remove empty <div style="float:..."> wrappers (leftover from img stripping).
const fs = require('fs'); const path = require('path');
const WS = '/home/ubuntu/.openclaw/workspace';

function findRepos() {
  const repos = [];
  for (const d of fs.readdirSync(WS, { withFileTypes: true })) {
    if (d.isDirectory() && (/\.com$/.test(d.name) || /-site$/.test(d.name)) && fs.existsSync(path.join(WS, d.name, '.git'))) repos.push(path.join(WS, d.name));
  }
  const sub = path.join(WS, 'affiliate-sites');
  if (fs.existsSync(sub)) for (const d of fs.readdirSync(sub, { withFileTypes: true })) {
    if (d.isDirectory() && (/\.com$/.test(d.name) || /-site$/.test(d.name)) && fs.existsSync(path.join(sub, d.name, '.git'))) repos.push(path.join(sub, d.name));
  }
  return repos;
}
function walk(dir, out=[]) { for (const e of fs.readdirSync(dir,{withFileTypes:true})) { if (e.name==='.git'||e.name==='node_modules') continue; const fp=path.join(dir,e.name); if (e.isDirectory()) walk(fp,out); else if (e.name.endsWith('.html')) out.push(fp);} return out; }

const log = {};
for (const repo of findRepos()) {
  for (const fp of walk(repo)) {
    let html = fs.readFileSync(fp, 'utf8');
    const before = html;
    // Remove empty float-wrapper divs
    html = html.replace(/<div[^>]*float[^>]*>\s*<\/div>\s*/g, '');
    // Also remove empty <a class="card"> with only a heading? No — leave structural anchors alone.
    if (html !== before) {
      fs.writeFileSync(fp, html);
      const rel = path.relative(WS, fp);
      log[rel] = true;
    }
  }
}
console.log('Files cleaned:', Object.keys(log).length);
for (const f of Object.keys(log)) console.log('  ' + f);
