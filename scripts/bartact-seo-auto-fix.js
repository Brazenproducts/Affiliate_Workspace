#!/usr/bin/env node
// Bartact SEO Auto-Fix
// Reads the fix queue from the ranking monitor and takes action on failing keywords
// Called after bartact-ranking-monitor.js as part of the daily cron

const fs = require('fs');

const env = {};
fs.readFileSync('/home/ubuntu/.openclaw/workspace/.env','utf8').split('\n').forEach(l=>{const[k,...v]=l.split('=');if(k&&v.length)env[k.trim()]=v.join('=').trim();});
const token = env.SHOPIFY_TOKEN_BARTACT;

// Map keywords to their primary collection handles and IDs
const KEYWORD_COLLECTION_MAP = {
  'jeep seat covers': { handle: 'jeep-wrangler-seat-covers', id: 275720732715, type: 'custom' },
  'jeep wrangler seat covers': { handle: 'jeep-wrangler-seat-covers', id: 275720732715, type: 'custom' },
  'jeep wrangler jl seat covers': { handle: 'jeep-wrangler-jl-seat-covers', id: 688526164011, type: 'smart' },
  'jeep wrangler jk seat covers': { handle: 'jeep-wrangler-jk-seat-covers', id: 688530260011, type: 'smart' },
  'jeep gladiator seat covers': { handle: 'jeep-gladiator-seat-covers', id: 688530751531, type: 'smart' },
  'ford bronco seat covers': { handle: 'ford-bronco-seat-covers', id: 688526098475, type: 'smart' },
  'toyota tacoma seat covers': { handle: 'toyota-tacoma-seat-covers', id: 275721355307, type: 'custom' },
  'jeep grab handles': { handle: 'jeep-grab-handles', id: 688907452459, type: 'custom' },
  'paracord grab handles': { handle: 'paracord-grab-handles', id: 73832005, type: 'custom' },
  'ford bronco grab handles': { handle: 'ford-bronco-grab-handles', id: 688348921899, type: 'smart' },
  'bronco grab handles': { handle: 'ford-bronco-grab-handles', id: 688348921899, type: 'smart' },
  'jeep wrangler grab handles': { handle: 'jeep-wrangler-grab-handles', id: 688348856363, type: 'smart' },
  'molle seat covers': { handle: 'molle-accessories', id: 137429778455, type: 'smart' },
  'jeep molle accessories': { handle: 'molle-accessories', id: 137429778455, type: 'smart' },
  'jeep fire extinguisher mount': { handle: 'fire-extinguisher-holders', id: 688907485227, type: 'custom' },
  'roll bar fire extinguisher': { handle: 'roll-bar-fire-extinguisher-holder', id: 688526360619, type: 'smart' },
  'jeep storage bags': { handle: 'jeep-wrangler-storage-bags-organizers', id: 684493013035, type: 'smart' },
  'ford bronco storage': { handle: 'ford-bronco-storage-bags', id: 688526786603, type: 'smart' },
  'winch cover': { handle: 'winch-covers', id: 137430564887, type: 'smart' },
  'jeep limit straps': { handle: 'jeep-wrangler-suspension-limit-straps', id: 688526458923, type: 'smart' },
  'best seat covers for jeep wrangler': { handle: 'jeep-wrangler-seat-covers', id: 275720732715, type: 'custom' },
  'best jeep gladiator seat covers': { handle: 'jeep-gladiator-seat-covers', id: 688530751531, type: 'smart' },
  'best ford bronco seat covers': { handle: 'ford-bronco-seat-covers', id: 688526098475, type: 'smart' },
};

async function getCollectionContent(type, id) {
  const r = await fetch(`https://bartact.myshopify.com/admin/api/2024-01/${type}_collections/${id}.json?fields=id,handle,body_html`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const d = await r.json();
  return d[type + '_collection'];
}

async function main() {
  const queueFile = '/home/ubuntu/.openclaw/workspace/memory/bartact-seo-fix-queue.json';
  if (!fs.existsSync(queueFile)) {
    console.log('No fix queue found — nothing to fix.');
    return;
  }

  const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
  const failing = queue.failingKeywords || [];

  if (failing.length === 0) {
    console.log('No failing keywords in queue.');
    return;
  }

  console.log('Failing keywords to investigate: ' + failing.length);

  const actions = [];

  for (const kw of failing) {
    const col = KEYWORD_COLLECTION_MAP[kw];
    if (!col) {
      console.log('No collection mapped for: ' + kw);
      actions.push({ kw, action: 'NEEDS_BLOG_ARTICLE', reason: 'No collection mapped — need dedicated blog article targeting this keyword' });
      continue;
    }

    const content = await getCollectionContent(col.type, col.id);
    if (!content) { console.log('Could not fetch: ' + col.handle); continue; }

    const wordCount = (content.body_html || '').replace(/<[^>]+>/g,' ').trim().split(/\s+/).filter(w=>w.length>0).length;
    console.log(col.handle + ': ' + wordCount + ' words');

    if (wordCount < 400) {
      actions.push({ kw, handle: col.handle, id: col.id, type: col.type, action: 'THIN_CONTENT', words: wordCount });
    } else if (wordCount < 600) {
      actions.push({ kw, handle: col.handle, action: 'COULD_BE_DEEPER', words: wordCount });
    } else {
      actions.push({ kw, handle: col.handle, action: 'CONTENT_OK_CHECK_LINKS', words: wordCount });
    }
    await new Promise(r => setTimeout(r, 200));
  }

  // Save action report
  const reportFile = '/home/ubuntu/.openclaw/workspace/memory/bartact-seo-action-report.json';
  fs.writeFileSync(reportFile, JSON.stringify({ date: new Date().toISOString(), actions }, null, 2));

  console.log('\n=== ACTION REPORT ===');
  actions.forEach(a => console.log(a.action + ': ' + (a.handle || a.kw) + (a.words ? ' (' + a.words + 'w)' : '')));

  // Log what needs to be done in the next session
  const thinContent = actions.filter(a => a.action === 'THIN_CONTENT');
  const needsArticle = actions.filter(a => a.action === 'NEEDS_BLOG_ARTICLE');

  if (thinContent.length > 0) {
    console.log('\nTHIN CONTENT — need to expand these collection pages:');
    thinContent.forEach(a => console.log('  ' + a.handle + ' (' + a.words + 'w) — needs 600+w for keyword: ' + a.kw));
  }
  if (needsArticle.length > 0) {
    console.log('\nNEEDS BLOG ARTICLE — no collection page, need content:');
    needsArticle.forEach(a => console.log('  ' + a.kw));
  }
}

main().catch(e => { console.error('ERR:', e.message); process.exit(1); });
