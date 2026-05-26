require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const SHOP = 'bartact.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;
const headers = { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' };

async function getCollection(handle, type) {
  const endpoint = type === 'smart' ? 'smart_collections' : 'custom_collections';
  const r = await fetch('https://' + SHOP + '/admin/api/2024-01/' + endpoint + '.json?handle=' + handle + '&fields=id,handle,title', { headers });
  const d = await r.json();
  const key = type === 'smart' ? 'smart_collections' : 'custom_collections';
  return (d[key]||[])[0];
}

async function getMeta(id, namespace, key) {
  const r = await fetch('https://' + SHOP + '/admin/api/2024-01/metafields.json?metafield[owner_id]=' + id + '&metafield[owner_resource]=collection&metafield[namespace]=' + namespace + '&metafield[key]=' + key, { headers });
  return ((await r.json()).metafields||[])[0];
}

async function upsertMeta(ownerId, namespace, key, value) {
  const existing = await getMeta(ownerId, namespace, key);
  const type = existing?.type || 'single_line_text_field';
  if (existing) {
    const r = await fetch('https://' + SHOP + '/admin/api/2024-01/metafields/' + existing.id + '.json', {
      method: 'PUT', headers,
      body: JSON.stringify({ metafield: { id: existing.id, value, type } })
    });
    return (await r.json()).metafield?.value;
  } else {
    const r = await fetch('https://' + SHOP + '/admin/api/2024-01/metafields.json', {
      method: 'POST', headers,
      body: JSON.stringify({ metafield: { owner_id: ownerId, owner_resource: 'collection', namespace, key, value, type: 'single_line_text_field' } })
    });
    return (await r.json()).metafield?.value;
  }
}

// Issues found:
// 1. jeep-gladiator-seat-covers-accessories-2019: desc = same as title (needs real desc)
// 2. jeep-wrangler-seat-covers-accessories: desc = same as title (needs real desc) — already fixed title today
// 3. 2007-10-jeep-wrangler-jk-jku-accessories: Booster JSON leaking into display (global fields are fine)
// 4. jeep-gladiator-accessories-2019: desc = same as title
// 5. jeep-wrangler-jk-jku-2007-18-accessories: desc = same as title
// 6. jeep-wrangler-jl-jlu-accessories-2018: desc = same as title
// 7. jeep-wrangler-tj-lj-2003-06-accessories: title says "Seat Covers" not "Accessories" — WRONG
// 8. jeep-wrangler-tj-1997-02-accessories: title says "Seat Covers" not "Accessories" — WRONG

const fixes = [
  {
    handle: 'jeep-gladiator-seat-covers-accessories-2019', type: 'custom',
    title: 'Jeep Gladiator Accessories 2019+ | Seat Covers, MOLLE Gear & More | Bartact',
    desc: 'Shop Bartact Jeep Gladiator JT accessories — seat covers, MOLLE panels, grab handles, console covers, and storage bags. Custom-fit for 2019+ Gladiator. Made in USA.'
  },
  {
    handle: 'jeep-wrangler-seat-covers-accessories', type: 'custom',
    // Title already fixed today — just fix desc which was set to same as title
    title: null, // skip title
    desc: 'Bartact Jeep Wrangler interior accessories — MOLLE panels, paracord grab handles, sun visors, console covers & more. Made in USA for JL, JK & TJ.'
  },
  {
    handle: 'jeep-gladiator-accessories-2019', type: 'smart',
    title: 'Jeep Gladiator Accessories 2019+ | MOLLE, Grab Handles & Storage | Bartact',
    desc: 'Bartact accessories for Jeep Gladiator JT 2019+ — grab handles, MOLLE panels, console covers, door bags, and storage pouches. No drilling, made in USA.'
  },
  {
    handle: 'jeep-wrangler-jk-jku-2007-18-accessories', type: 'smart',
    title: 'Jeep Wrangler JK & JKU Accessories 2007-2018 | MOLLE, Grab Handles | Bartact',
    desc: 'Bartact accessories for Jeep Wrangler JK and JKU 2007-2018 — paracord grab handles, MOLLE console covers, storage bags, and visor covers. Made in USA.'
  },
  {
    handle: 'jeep-wrangler-jl-jlu-accessories-2018', type: 'smart',
    title: 'Jeep Wrangler JL & JLU Accessories 2018+ | MOLLE, Door Bags & More | Bartact',
    desc: 'Bartact accessories for Jeep Wrangler JL and JLU 2018+ — Wrangliator door bags, grab handles, MOLLE console covers, visor covers, and storage pouches. Made in USA.'
  },
  {
    handle: 'jeep-wrangler-tj-lj-2003-06-accessories', type: 'smart',
    // Title wrongly says "Seat Covers" — fix to "Accessories"
    title: 'Jeep Wrangler TJ & LJ Accessories 2003-2006 | MOLLE & Interior Gear | Bartact',
    desc: 'Bartact accessories for Jeep Wrangler TJ and LJ 2003-2006 — grab handles, MOLLE gear, seat covers, and interior upgrades. Made in USA.'
  },
  {
    handle: 'jeep-wrangler-tj-1997-02-accessories', type: 'smart',
    // Title wrongly says "Seat Covers" — fix to "Accessories"
    title: 'Jeep Wrangler TJ Accessories 1997-2002 | MOLLE & Interior Gear | Bartact',
    desc: 'Bartact accessories for Jeep Wrangler TJ 1997-2002 — grab handles, MOLLE gear, seat covers, and interior upgrades. Made in USA.'
  }
];

async function main() {
  for (const fix of fixes) {
    const col = await getCollection(fix.handle, fix.type);
    if (!col) { console.log('NOT FOUND:', fix.handle); continue; }

    if (fix.title) {
      const t = await upsertMeta(col.id, 'global', 'title_tag', fix.title);
      console.log('✅ ' + fix.handle.substring(0,45).padEnd(45) + ' | title: ' + (t||'ERROR').substring(0,55));
    }
    const d = await upsertMeta(col.id, 'global', 'description_tag', fix.desc);
    console.log('   ' + ' '.padEnd(45) + ' | desc:  ' + (d||'ERROR').substring(0,55));
  }
  console.log('\nAll done.');
}
main().catch(console.error);
