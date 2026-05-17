#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const roots = [
  '/home/ubuntu/.openclaw/workspace/affiliate-sites/bestseatcover.com',
  '/home/ubuntu/.openclaw/workspace/affiliate-sites/jeepseatcover.com',
  '/home/ubuntu/.openclaw/workspace/wranglerseatcover.com',
  '/home/ubuntu/.openclaw/workspace/affiliate-sites/gladiatorseatcover.com',
  '/home/ubuntu/.openclaw/workspace/affiliate-sites/broncoseatcover.com',
  '/home/ubuntu/.openclaw/workspace/affiliate-sites/bestbroncoaccessories.com',
  '/home/ubuntu/.openclaw/workspace/affiliate-sites/besttruckaccessories.com',
  '/home/ubuntu/.openclaw/workspace/affiliate-sites/tacticalseatcovers.com',
  '/home/ubuntu/.openclaw/workspace/affiliate-sites/tacticalseats.com',
  '/home/ubuntu/.openclaw/workspace/affiliate-sites/bestoffroadbrands.com'
];

const replacements = [
  [/https:\/\/bartact\.com\/collections\/jeep-wrangler-jl-seat-covers/g, 'https://bartact.com/collections/jeep-wrangler-seat-covers'],
  [/https:\/\/bartact\.com\/collections\/jeep-wrangler-jlu-seat-covers/g, 'https://bartact.com/collections/jeep-wrangler-seat-covers'],
  [/https:\/\/bartact\.com\/collections\/jeep-wrangler-jk-seat-covers/g, 'https://bartact.com/collections/jeep-wrangler-seat-covers'],
  [/https:\/\/bartact\.com\/collections\/jeep-wrangler-jku-seat-covers/g, 'https://bartact.com/collections/jeep-wrangler-seat-covers'],
  [/https:\/\/bartact\.com\/collections\/jeep-wrangler-tj-seat-covers/g, 'https://bartact.com/collections/jeep-wrangler-seat-covers'],
  [/https:\/\/bartact\.com\/collections\/jeep-gladiator-seat-covers(?!-1)/g, 'https://bartact.com/collections/jeep-gladiator-seat-covers-1'],
  [/https:\/\/bartact\.com\/collections\/grab-handles(?!-for-jeep-wrangler-gladiator-ford-bronco-utvs-buggies-rails)/g, 'https://bartact.com/collections/grab-handles-for-jeep-wrangler-gladiator-ford-bronco-utvs-buggies-rails'],
  [/https:\/\/bartact\.com\/collections\/jeep-accessories/g, 'https://bartact.com/collections/jeep-wrangler-seat-covers-accessories'],
  [/https:\/\/bartact\.com\/collections\/ford-bronco-accessories/g, 'https://bartact.com/collections/ford-bronco-seat-covers'],
  [/https:\/\/bartact\.com\/collections\/tactical-seat-covers/g, 'https://bartact.com/collections/jeep-wrangler-seat-covers'],
  [/https:\/\/bartact\.com\/?(?=["'])/g, 'https://bartact.com/collections/jeep-wrangler-seat-covers'],
  [/https:\/\/bartact\.com(?=\s|<|$)/g, 'https://bartact.com/collections/jeep-wrangler-seat-covers']
];

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === '.git' || name === 'node_modules') continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (/\.(html|md|js|json)$/i.test(name)) out.push(full);
  }
  return out;
}

const changes = [];
for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  for (const file of walk(root)) {
    let text = fs.readFileSync(file, 'utf8');
    const original = text;
    for (const [pattern, replacement] of replacements) text = text.replace(pattern, replacement);
    text = text.replace(/Made in Temecula, California/g, 'Made in the USA in Southern California');
    text = text.replace(/made in Temecula, California/g, 'made in the USA in Southern California');
    text = text.replace(/Made in Temecula, CA/g, 'Made in the USA in Southern California');
    text = text.replace(/made in Temecula, CA/g, 'made in the USA in Southern California');
    text = text.replace(/Temecula, California/g, 'Southern California');
    text = text.replace(/Temecula, CA/g, 'Southern California');
    if (text !== original) {
      fs.writeFileSync(file, text);
      changes.push(file);
    }
  }
}

console.log(JSON.stringify({ changed: changes.length, files: changes }, null, 2));
