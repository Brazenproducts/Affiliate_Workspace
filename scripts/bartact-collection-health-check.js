#!/usr/bin/env node
/**
 * BARTACT COLLECTION HEALTH CHECK
 *
 * 1. Fetches ALL smart + custom collections (paginated)
 * 2. Checks priority handles — auto-republishes if unpublished
 * 3. Full report: total, live, unpublished, auto-fixed
 * 4. IndexNow for any auto-fixed URLs
 * 5. Saves report to memory/bartact-collection-health-YYYY-MM-DD.json
 *
 * Usage:
 *   node bartact-collection-health-check.js
 *   node bartact-collection-health-check.js --dry-run
 */

const fs   = require('fs');
const path = require('path');

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const env = {};
fs.readFileSync(`${WORKSPACE}/.env`, 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const TOKEN    = env.SHOPIFY_TOKEN_BARTACT;
const API      = 'https://bartact.myshopify.com/admin/api/2024-01';
const SHOP     = 'www.bartact.com';
const IN_KEY   = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';
const DRY_RUN  = process.argv.includes('--dry-run');

// ─── PRIORITY HANDLES — always keep published ────────────────────────────────
// type: 'smart' | 'custom'   id: confirmed live as of 2026-08-10
const PRIORITY = [
  { handle: 'jeep-wrangler-seat-covers',          type: 'custom', id: 275720732715  },
  { handle: 'jeep-wrangler-jl-seat-covers',       type: 'smart',  id: 688526164011  },
  { handle: 'jeep-wrangler-jk-seat-covers',       type: 'custom', id: 687837380651  },
  { handle: 'jeep-gladiator-seat-covers',         type: 'smart',  id: 688530751531  },
  { handle: 'ford-bronco-seat-covers',            type: 'smart',  id: 265140207659  },
  { handle: 'toyota-tacoma-seat-covers',          type: 'custom', id: 275721355307  },
  { handle: 'jeep-wrangler-grab-handles',         type: 'smart',  id: 688348856363  },
  { handle: 'ford-bronco-grab-handles',           type: 'smart',  id: 688348921899  },
  { handle: 'jeep-gladiator-grab-handles',        type: 'smart',  id: 688348889131  },
  { handle: 'jeep-wrangler-jl-storage-bags',      type: 'smart',  id: 688526622763  },
  { handle: 'ford-bronco-storage-bags',           type: 'smart',  id: 688526786603  },
  { handle: 'jeep-wrangler-jl-molle-accessories', type: 'smart',  id: 688526196779  },
];

const PRIORITY_SET = new Set(PRIORITY.map(p => p.handle));

// ─── NEVER REPUBLISH — intentionally unpublished, confirmed by Mitch 2026-08-10 ──
const NEVER_REPUBLISH = new Set([
  'molle-storage-strips',
  'roll-bar-covers',
  'hitch-covers',
  'hitch-receivers',
  'seat-belt-safety-harnesses',
  'seat-belts-harnesses',
  'face-masks',
  'motorcycle-gear',
  'flashlights',
  'ebay-collection',
  'winch-shackle-1',
  'winch-covers',
  'jeep-gladiator-seat-covers-1',
  'jeep-wrangler-seat-covers-1',
  'toyota-tacoma-seat-covers-1',
  // rule: any handle ending in -1 is an old duplicate — never republish
]);

function isNeverRepublish(handle) {
  return NEVER_REPUBLISH.has(handle) || /-.+\-1$/.test(handle);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function shopFetch(path, opts = {}) {
  return fetch(`${API}${path}`, {
    headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  }).then(r => ({ res: r, json: () => r.json() }));
}

async function fetchAllCollections(type) {
  const key = type;
  let all = [];
  let url = `${API}/${type}.json?limit=250&fields=id,handle,title,published_at,updated_at`;
  while (url) {
    const r = await fetch(url, { headers: { 'X-Shopify-Access-Token': TOKEN } });
    const link = r.headers.get('link') || '';
    const d = await r.json();
    all.push(...(d[key] || []));
    const next = link.match(/<([^>]+)>;\s*rel="next"/);
    url = next ? next[1] : null;
  }
  return all.map(c => ({ ...c, collType: type === 'smart_collections' ? 'smart' : 'custom' }));
}

/**
 * verifyPublished — reusable helper, call after any collection write.
 * Re-fetches the collection and auto-republishes if published_at is null.
 * Returns { wasPublished, fixed }
 */
async function verifyPublished(type, id, handle) {
  const apiType = type === 'smart' ? 'smart_collections' : 'custom_collections';
  const r = await fetch(`${API}/${apiType}/${id}.json?fields=id,handle,published_at`, {
    headers: { 'X-Shopify-Access-Token': TOKEN }
  });
  const d = await r.json();
  const coll = d.smart_collection || d.custom_collection;

  if (!coll) {
    console.warn(`  ⚠️ verifyPublished: could not fetch ${type}/${id}`);
    return { wasPublished: false, fixed: false };
  }

  if (coll.published_at) return { wasPublished: true, fixed: false };

  // Unpublished — auto-republish
  console.warn(`  ⚠️ ${handle || id} is unpublished after write — auto-republishing...`);
  if (DRY_RUN) { console.log('  [DRY RUN] would republish'); return { wasPublished: false, fixed: false }; }

  const body = type === 'smart'
    ? JSON.stringify({ smart_collection:  { id, published: true } })
    : JSON.stringify({ custom_collection: { id, published: true } });

  const pr = await fetch(`${API}/${apiType}/${id}.json`, {
    method: 'PUT',
    headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' },
    body,
  });
  const fixed = pr.ok;
  console.log(fixed ? `  ✅ Republished: ${handle || id}` : `  ❌ Republish failed: ${pr.status}`);
  return { wasPublished: false, fixed };
}

async function republish(type, id, handle) {
  const apiType = type === 'smart' ? 'smart_collections' : 'custom_collections';
  const body = type === 'smart'
    ? JSON.stringify({ smart_collection:  { id, published: true } })
    : JSON.stringify({ custom_collection: { id, published: true } });
  const r = await fetch(`${API}/${apiType}/${id}.json`, {
    method: 'PUT',
    headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' },
    body,
  });
  if (!r.ok) console.error(`  ❌ Republish failed for ${handle}: HTTP ${r.status}`);
  return r.ok;
}

async function indexNow(urls) {
  if (!urls.length) return;
  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ host: SHOP, key: IN_KEY, urlList: urls }),
  });
  console.log(`  📡 IndexNow: ${r.status === 200 ? 'accepted' : r.status} (${urls.length} URLs)`);
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  const today = new Date().toISOString().split('T')[0];
  console.log(`\n🔍 Bartact Collection Health Check — ${today}${DRY_RUN ? ' [DRY RUN]' : ''}\n`);

  // 1. Fetch all collections
  const [smart, custom] = await Promise.all([
    fetchAllCollections('smart_collections'),
    fetchAllCollections('custom_collections'),
  ]);
  const all = [...smart, ...custom];
  console.log(`📦 Total collections: ${all.length} (${smart.length} smart, ${custom.length} custom)`);

  // 2. Categorize
  const live     = all.filter(c =>  c.published_at);
  const unpubAll = all.filter(c => !c.published_at);
  console.log(`   ✅ Published: ${live.length}`);
  console.log(`   ⚠️  Unpublished: ${unpubAll.length}\n`);

  // 3. Check priority handles
  const autoFixed = [];
  const priorityStatus = [];

  for (const p of PRIORITY) {
    const found = all.find(c => c.handle === p.handle);
    if (!found) {
      console.warn(`  ❌ PRIORITY MISSING: ${p.handle} — not found in API!`);
      priorityStatus.push({ handle: p.handle, id: p.id, status: 'NOT_FOUND' });
      continue;
    }
    if (!found.published_at) {
      if (isNeverRepublish(p.handle)) {
        // Shouldn't happen — priority handles should never be in NEVER_REPUBLISH
        // But if someone added one by mistake, log loudly and skip
        console.error(`  ‼️  CONFLICT: ${p.handle} is in both PRIORITY and NEVER_REPUBLISH — skipping republish, manual review needed`);
        priorityStatus.push({ handle: p.handle, id: p.id, status: 'CONFLICT' });
        continue;
      }
      console.warn(`  🚨 PRIORITY UNPUBLISHED: ${p.handle} (${p.type}/${p.id})`);
      if (!DRY_RUN) {
        const ok = await republish(p.type, p.id, p.handle);
        if (ok) {
          autoFixed.push(p.handle);
          console.log(`     ✅ Auto-republished`);
        }
      } else {
        console.log(`     [DRY RUN] would republish`);
      }
      priorityStatus.push({ handle: p.handle, id: p.id, status: 'FIXED' });
    } else {
      priorityStatus.push({ handle: p.handle, id: p.id, status: 'OK' });
      process.stdout.write(`  ✅ ${p.handle}\n`);
    }
  }

  // 4. IndexNow for auto-fixed
  if (autoFixed.length) {
    const urls = autoFixed.map(h => `https://${SHOP}/collections/${h}`);
    await indexNow(urls);
  }

  // 5. Non-priority unpublished — split into known-intentional vs unknown
  const nonPriorityUnpub = unpubAll.filter(c => !PRIORITY_SET.has(c.handle));
  const intentional = nonPriorityUnpub.filter(c => isNeverRepublish(c.handle));
  const unknown     = nonPriorityUnpub.filter(c => !isNeverRepublish(c.handle));

  console.log(`\n📋 Intentionally unpublished (${intentional.length}) — confirmed by Mitch, skipped:`);
  intentional.forEach(c => console.log(`   - ${c.handle} [${c.collType}] id:${c.id}`));

  if (unknown.length) {
    console.warn(`\n⚠️  Unknown unpublished (${unknown.length}) — NOT in never-republish list, needs review:`);
    unknown.forEach(c => console.warn(`   - ${c.handle} [${c.collType}] id:${c.id}`));
  } else {
    console.log(`\n✅ No unknown unpublished collections.`);
  }

  // 6. Save report
  const report = {
    date: today,
    dryRun: DRY_RUN,
    summary: {
      total: all.length,
      smart: smart.length,
      custom: custom.length,
      published: live.length,
      unpublished: unpubAll.length,
      autoFixed: autoFixed.length,
    },
    priorityStatus,
    autoFixed,
    intentionallyUnpublished: intentional.map(c => ({ handle: c.handle, id: c.id, type: c.collType })),
    unknownUnpublished: unknown.map(c => ({ handle: c.handle, id: c.id, type: c.collType })),
    allUnpublished: unpubAll.map(c => ({ handle: c.handle, id: c.id, type: c.collType, title: c.title })),
  };

  const outPath = `${WORKSPACE}/memory/bartact-collection-health-${today}.json`;
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Report saved: ${outPath}`);

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`SUMMARY: ${all.length} total | ${live.length} live | ${unpubAll.length} unpublished | ${autoFixed.length} auto-fixed`);
  if (autoFixed.length) console.log(`Auto-fixed: ${autoFixed.join(', ')}`);

  return report;
}

// Export verifyPublished for use in other scripts
module.exports = { verifyPublished };

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
