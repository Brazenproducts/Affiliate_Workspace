#!/usr/bin/env node
// Bartact Daily Blog Generator
// Publishes one SEO article per run, rotating through high-value topics
// Target: 900-1200 words, 8+ Bartact mentions, 4+ internal /collections/ links

const fs = require('fs');
const env = {};
fs.readFileSync('/home/ubuntu/.openclaw/workspace/.env','utf8').split('\n').forEach(l=>{const[k,...v]=l.split('=');if(k&&v.length)env[k.trim()]=v.join('=').trim();});
const token = env.SHOPIFY_TOKEN_BARTACT;
const BLOG_ID = '19510597';
const STATE_FILE = '/home/ubuntu/.openclaw/workspace/memory/bartact-blog-daily-state.json';

// Topic queue — high-value SEO targets not yet covered
const TOPICS = [
  { title: 'Best Jeep Wrangler JL Seat Covers for 2024 and 2025', handle: 'best-jeep-wrangler-jl-seat-covers-2024-2025', primaryCollection: '/collections/jeep-wrangler-jl-seat-covers', keywords: 'jeep wrangler jl seat covers' },
  { title: 'Jeep Gladiator Seat Covers — Why Fitment Matters', handle: 'jeep-gladiator-seat-covers-fitment', primaryCollection: '/collections/jeep-gladiator-seat-covers-1', keywords: 'jeep gladiator seat covers' },
  { title: 'Ford Bronco Seat Covers — 2021, 2022, 2023, 2024 Guide', handle: 'ford-bronco-seat-covers-guide', primaryCollection: '/collections/ford-bronco-seat-covers', keywords: 'ford bronco seat covers' },
  { title: 'Toyota Tacoma Seat Covers — Custom Fit vs Universal', handle: 'toyota-tacoma-seat-covers-custom-fit', primaryCollection: '/collections/toyota-tacoma-seat-covers', keywords: 'toyota tacoma seat covers' },
  { title: 'MOLLE Seat Covers for Jeep Wrangler — Storage and Organization', handle: 'molle-seat-covers-jeep-wrangler', primaryCollection: '/collections/molle-accessories', keywords: 'molle seat covers jeep' },
  { title: 'Jeep Wrangler JL Grab Handles — Bolt-On vs Wrap-Around', handle: 'jeep-wrangler-jl-grab-handles-bolt-on-vs-wrap', primaryCollection: '/collections/jeep-wrangler-jl-jlu-grab-handles', keywords: 'jeep wrangler jl grab handles' },
  { title: 'Limit Straps for Jeep Wrangler and UTV — What They Do and Why You Need Them', handle: 'limit-straps-jeep-wrangler-utv-guide', primaryCollection: '/collections/limit-straps', keywords: 'limit straps jeep wrangler' },
  { title: 'Best Ford Bronco Grab Handles — Roll Bar and Headrest Options', handle: 'best-ford-bronco-grab-handles-roll-bar', primaryCollection: '/collections/ford-bronco-grab-handles', keywords: 'ford bronco grab handles' },
  { title: 'Jeep Wrangler Storage Bags — MOLLE and Under-Seat Options', handle: 'jeep-wrangler-storage-bags-molle-guide', primaryCollection: '/collections/jeep-wrangler-storage-bags', keywords: 'jeep wrangler storage bags' },
  { title: 'How to Choose Seat Covers for Off-Road Use', handle: 'how-to-choose-seat-covers-off-road', primaryCollection: '/collections/seat-covers', keywords: 'off road seat covers' },
  { title: 'Jeep Wrangler JK Accessories — Interior Upgrades Worth Buying', handle: 'jeep-wrangler-jk-accessories-interior', primaryCollection: '/collections/jeep-wrangler-jk-jku-2007-18-accessories', keywords: 'jeep wrangler jk accessories' },
  { title: 'Custom Fit vs Universal Seat Covers — Why It Matters', handle: 'custom-fit-vs-universal-seat-covers', primaryCollection: '/collections/jeep-wrangler-seat-covers', keywords: 'jeep seat covers custom fit' },
  { title: 'Jeep Gladiator Accessories — Best Interior Upgrades from Bartact', handle: 'jeep-gladiator-accessories-interior-bartact', primaryCollection: '/collections/jeep-gladiator-seat-covers-1', keywords: 'jeep gladiator accessories' },
  { title: 'Roll Bar Fire Extinguisher Mounts for Jeep and Bronco', handle: 'roll-bar-fire-extinguisher-mount-jeep-bronco', primaryCollection: '/collections/fire-extinguisher-holders', keywords: 'roll bar fire extinguisher holder' },
  { title: 'Paracord Grab Handles for Ford Bronco — The Bartact Advantage', handle: 'paracord-grab-handles-ford-bronco-bartact', primaryCollection: '/collections/ford-bronco-grab-handles', keywords: 'ford bronco paracord grab handles' },
];

async function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch(e) {
    return { lastIndex: -1, published: [] };
  }
}

async function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function publishArticle(title, handle, body) {
  const r = await fetch(`https://bartact.myshopify.com/admin/api/2024-01/blogs/${BLOG_ID}/articles.json`, {
    method: 'POST',
    headers: {'X-Shopify-Access-Token': token, 'Content-Type': 'application/json'},
    body: JSON.stringify({article: {title, handle, body_html: body, published: true}})
  });
  return r.json();
}

async function submitIndexNow(url) {
  await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({host: 'www.bartact.com', key: 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5', urlList: [url]})
  });
}

async function main() {
  const state = await loadState();
  const nextIndex = (state.lastIndex + 1) % TOPICS.length;
  const topic = TOPICS[nextIndex];

  console.log(`Publishing: ${topic.title}`);

  // Article content is generated by the AI agent calling this script via cron
  // The cron payload instructs the agent to generate content and call this with --content flag
  // For direct runs, we output the topic info for the agent to use
  console.log(JSON.stringify({ topic, nextIndex }));
}

main().catch(e => { console.error('ERR:', e.message); process.exit(1); });
