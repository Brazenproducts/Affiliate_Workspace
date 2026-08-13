#!/usr/bin/env node
// bartact-seo-collection-fix.js
// Fixes: missing meta descs, over-length descs, missing Made in USA, blank image alt, Bartact-first title
// Run: node scripts/bartact-seo-collection-fix.js

const https = require('https');
const fs = require('fs');

const env = {};
fs.readFileSync('.env','utf8').split('\n').forEach(l => { const [k,...v]=l.split('='); if(k&&v.length) env[k.trim()]=v.join('=').trim(); });
const TOKEN = env['SHOPIFY_TOKEN_BARTACT'];

function gql(query, variables={}) {
  const body = JSON.stringify({ query, variables });
  return new Promise((res,rej) => {
    const req = https.request({
      hostname:'bartact.myshopify.com',
      path:'/admin/api/2024-01/graphql.json',
      method:'POST',
      headers:{'X-Shopify-Access-Token':TOKEN,'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)}
    }, r => { let b=''; r.on('data',d=>b+=d); r.on('end',()=>res(JSON.parse(b))); });
    req.on('error',rej); req.write(body); req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// All collection fixes to apply
// Format: { id, seoTitle (optional), seoDesc (optional), imageAlt (optional) }
const fixes = [
  // --- Missing meta descriptions ---
  {
    id: 'gid://shopify/Collection/265140207659', // ford-bronco-seat-covers
    seoDesc: 'Custom-fit Ford Bronco seat covers for 2021-2026. Cordura fabric, bolt-in install, no universal fit. Made in USA by Bartact.',
  },
  {
    id: 'gid://shopify/Collection/688526164011', // jeep-wrangler-jl-seat-covers
    seoDesc: 'Custom-fit Jeep Wrangler JL seat covers for 2018-2026. Cordura 1000D, MOLLE-compatible, Berry Amendment compliant. Made in USA by Bartact.',
  },

  // --- Title starts with Bartact → fix to keyword-first ---
  {
    id: 'gid://shopify/Collection/69914821', // best-sellers
    seoTitle: 'Best Sellers — Top-Rated Seat Covers & Off-Road Accessories | Bartact',
    seoDesc: 'Shop Bartact best sellers — top-rated seat covers, paracord grab handles, MOLLE accessories, and storage bags. Made in USA for Jeep, Bronco, and Toyota.',
  },

  // --- Desc >160 chars → trim ---
  {
    id: 'gid://shopify/Collection/281613369387', // hitch-receivers [170]
    seoDesc: 'Heavy-duty hitch receivers for Jeep Wrangler, Gladiator, Ford Bronco and off-road vehicles. Towing-ready, corrosion-resistant. Made in USA by Bartact.',
  },
  {
    id: 'gid://shopify/Collection/281627525163', // hitch-covers [165]
    seoDesc: 'Hitch cover accessories for Jeep, truck, and SUV. Durable hitch receiver covers protect from rust and trail debris. Multiple styles. Made in USA by Bartact.',
  },
  {
    id: 'gid://shopify/Collection/281632178219', // flashlights [161]
    seoDesc: 'Heavy-duty tactical flashlights for off-road and outdoor use. High-lumen, weather-resistant for Jeep Wrangler, Gladiator, Ford Bronco and UTV adventures.',
  },
  {
    id: 'gid://shopify/Collection/281641910315', // hvac-filters [168]
    seoDesc: 'Replacement cabin air filters for Jeep Wrangler, Gladiator, Ford Bronco and Toyota Tacoma. Superior filtration, easy install, made for off-road conditions.',
  },
  {
    id: 'gid://shopify/Collection/679584071723', // ebay-collection [167]
    seoDesc: 'Bartact tactical storage and accessories — bags, pouches, organizers, off-road gear. MOLLE-compatible, made in USA for Jeep, Bronco, and Toyota vehicles.',
  },
  {
    id: 'gid://shopify/Collection/688348889131', // jeep-gladiator-grab-handles [161]
    seoDesc: 'Paracord grab handles for Jeep Gladiator JT 2019-2024. Type III 550 paracord, solid steel core, 30+ colors, bolt-on. Invented by Bartact. Made in USA.',
  },
];

// Collections needing "Made in USA" added to existing desc + image alt fixes
// These will be fetched fresh and patched inline
const madeInUSAHandles = [
  'motorcycle-gear',
  'seat-belt-safety-harnesses',
  'winch-fairlead-winch-accessories-winch-recovery',
  'bull-strap',
  'all',
  'jeep-wrangler-tj-1997-02-accessories',
  'shackles',
  'fire-extinguishers-mounts',
  'kitchen-fire-extinguishers',
  '2013-18-jeep-wrangler-jk-jku',
  '2007-10-jeep-wrangler-jk-jku-accessories',
  'winch-shackles',
  'winch-shackle-1',
  'bags-backpacks',
  'winch-accessories',
  'seat-belts-harnesses',
  'flashlights',
  'hvac-filters',
  'ford-bronco-grab-handles',
  'fire-extinguisher-holders',
];

async function fetchAll() {
  let cursor = null, all = [], done = false;
  while (!done) {
    const q = `query($cursor: String) {
      collections(first: 50, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        edges { node { id title handle seo { title description } image { id altText url } } }
      }
    }`;
    const r = await gql(q, { cursor });
    const page = r.data?.collections;
    if (!page) break;
    all.push(...page.edges.map(e=>e.node));
    if (page.pageInfo.hasNextPage) cursor = page.pageInfo.endCursor;
    else done = true;
  }
  return all;
}

async function updateCollection(id, seoTitle, seoDesc, imageAlt, currentTitle, currentDesc) {
  const input = { id };
  if (seoTitle !== undefined || seoDesc !== undefined) {
    input.seo = {};
    if (seoTitle !== undefined) input.seo.title = seoTitle;
    if (seoDesc !== undefined) input.seo.description = seoDesc;
  }
  if (imageAlt !== undefined) input.image = { altText: imageAlt };

  const mutation = `mutation($input: CollectionInput!) {
    collectionUpdate(input: $input) {
      collection { id handle seo { title description } image { altText } }
      userErrors { field message }
    }
  }`;
  const r = await gql(mutation, { input });
  const errors = r.data?.collectionUpdate?.userErrors;
  if (errors?.length) return { ok: false, errors };
  return { ok: true, col: r.data?.collectionUpdate?.collection };
}

async function main() {
  console.log('Fetching all collections...');
  const all = await fetchAll();
  const byHandle = {};
  const byId = {};
  for (const c of all) {
    byHandle[c.handle] = c;
    byId[c.id] = c;
  }

  let fixed = 0, errors = 0;

  // Apply direct fixes
  for (const fix of fixes) {
    const current = byId[fix.id];
    if (!current) { console.log(`Not found: ${fix.id}`); continue; }

    // Build alt text from title if needed
    const imageAlt = current.image && (!current.image.altText || current.image.altText.trim() === '')
      ? `${current.title} — Made in USA | Bartact`
      : undefined;

    const r = await updateCollection(fix.id, fix.seoTitle, fix.seoDesc, imageAlt);
    if (r.ok) {
      console.log(`✅ ${current.handle}`);
      fixed++;
    } else {
      console.log(`❌ ${current.handle}:`, r.errors);
      errors++;
    }
    await sleep(300);
  }

  // Apply Made in USA fixes to collections with existing desc
  for (const handle of madeInUSAHandles) {
    const c = byHandle[handle];
    if (!c) { console.log(`Not found: ${handle}`); continue; }

    const desc = c.seo?.description || '';
    if (!desc) { console.log(`⚠️  ${handle}: no desc to append to`); continue; }
    const lower = desc.toLowerCase();
    if (lower.includes('made in usa') || lower.includes('made in the usa')) {
      console.log(`✓ ${handle}: already has Made in USA`); continue;
    }

    // Append Made in USA — keep under 160 chars
    let newDesc = desc;
    if ((desc + ' Made in USA by Bartact.').length <= 160) {
      newDesc = desc + ' Made in USA by Bartact.';
    } else {
      // Trim and append
      const suffix = ' Made in USA by Bartact.';
      newDesc = desc.substring(0, 160 - suffix.length).trimEnd() + suffix;
    }

    // Also fix blank image alt
    const imageAlt = c.image && (!c.image.altText || c.image.altText.trim() === '')
      ? `${c.title} — Made in USA | Bartact`
      : undefined;

    const r = await updateCollection(c.id, undefined, newDesc, imageAlt);
    if (r.ok) {
      console.log(`✅ ${handle} [Made in USA added${imageAlt ? ' + alt' : ''}]`);
      fixed++;
    } else {
      console.log(`❌ ${handle}:`, r.errors);
      errors++;
    }
    await sleep(300);
  }

  // Fix remaining blank image alts (collections not already covered above)
  const alreadyFixed = new Set([
    ...fixes.map(f => byId[f.id]?.handle).filter(Boolean),
    ...madeInUSAHandles,
    'best-sellers'
  ]);

  for (const c of all) {
    if (alreadyFixed.has(c.handle)) continue;
    if (!c.image) continue;
    if (c.image.altText && c.image.altText.trim() !== '') continue;

    const imageAlt = `${c.title} — Made in USA | Bartact`;
    const r = await updateCollection(c.id, undefined, undefined, imageAlt);
    if (r.ok) {
      console.log(`✅ ${c.handle} [alt text added]`);
      fixed++;
    } else {
      console.log(`❌ ${c.handle} alt:`, r.errors);
      errors++;
    }
    await sleep(300);
  }

  console.log(`\nDone. Fixed: ${fixed} | Errors: ${errors}`);
}

main().catch(e => console.error('Fatal:', e.message));
