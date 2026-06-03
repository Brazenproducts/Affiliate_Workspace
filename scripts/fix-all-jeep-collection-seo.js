require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const SHOP = 'bartact.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;
const headers = { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' };

if (!process.env.BARTACT_CONFIRMED) {
  console.error('ERROR: Set BARTACT_CONFIRMED=1 to run this script against Bartact Shopify.');
  console.error('Example: BARTACT_CONFIRMED=1 node ' + require('path').basename(__filename));
  process.exit(1);
}

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

const fixes = [
  // Mixed collections named "accessories only" — rename to SC+ACC
  {
    handle: 'jeep-wrangler-jl-jlu-accessories-2018', type: 'smart',
    title: 'Jeep Wrangler JL & JLU Seat Covers & Accessories 2018+ | Bartact',
    desc: 'Shop Bartact seat covers and accessories for Jeep Wrangler JL and JLU 2018+ — tactical MOLLE seat covers, grab handles, Wrangliator door bags, console covers, and more. Made in USA.'
  },
  {
    handle: 'jeep-wrangler-jk-jku-2007-18-accessories', type: 'smart',
    title: 'Jeep Wrangler JK & JKU Seat Covers & Accessories 2007-2018 | Bartact',
    desc: 'Shop Bartact seat covers and accessories for Jeep Wrangler JK and JKU 2007-2018 — tactical MOLLE seat covers, paracord grab handles, console covers, and storage gear. Made in USA.'
  },
  {
    handle: 'jeep-gladiator-accessories-2019', type: 'smart',
    title: 'Jeep Gladiator Seat Covers & Accessories 2019+ | Bartact',
    desc: 'Shop Bartact seat covers and accessories for Jeep Gladiator JT 2019+ — tactical MOLLE seat covers, grab handles, console covers, MOLLE panels, and storage bags. Made in USA.'
  },
  {
    handle: 'jeep-wrangler-tj-1997-02-accessories', type: 'smart',
    title: 'Jeep Wrangler TJ Seat Covers & Accessories 1997-2002 | Bartact',
    desc: 'Shop Bartact seat covers and accessories for Jeep Wrangler TJ 1997-2002 — tactical MOLLE seat covers, grab handles, and interior gear. Made in USA.'
  },
  {
    handle: 'jeep-wrangler-tj-lj-2003-06-accessories', type: 'smart',
    title: 'Jeep Wrangler TJ & LJ Seat Covers & Accessories 2003-2006 | Bartact',
    desc: 'Shop Bartact seat covers and accessories for Jeep Wrangler TJ and LJ 2003-2006 — tactical MOLLE seat covers, grab handles, and interior upgrades. Made in USA.'
  },
  {
    handle: '2007-10-jeep-wrangler-jk-jku-accessories', type: 'smart',
    title: 'Jeep Wrangler JK & JKU Seat Covers & Accessories 2007-2010 | Bartact',
    desc: 'Shop Bartact seat covers and accessories for Jeep Wrangler JK and JKU 2007-2010 — tactical MOLLE seat covers, paracord grab handles, console covers, and storage pouches. Made in USA.'
  },
  // Named "neither" — add proper titles
  {
    handle: '2011-12-jeep-wrangler-jk-jku', type: 'smart',
    title: 'Jeep Wrangler JK & JKU Seat Covers & Accessories 2011-2012 | Bartact',
    desc: 'Shop Bartact seat covers and accessories for Jeep Wrangler JK and JKU 2011-2012 — tactical MOLLE seat covers, grab handles, console covers, and more. Made in USA.'
  },
  {
    handle: '2013-18-jeep-wrangler-jk-jku', type: 'smart',
    title: 'Jeep Wrangler JK & JKU Seat Covers & Accessories 2013-2018 | Bartact',
    desc: 'Shop Bartact seat covers and accessories for Jeep Wrangler JK and JKU 2013-2018 — tactical MOLLE seat covers, grab handles, console covers, and more. Made in USA.'
  },
  {
    handle: 'jeep-bronco-4runner-tacoma-truck-parts', type: 'smart',
    title: 'Jeep, Bronco, 4Runner & Tacoma Seat Covers & Accessories | Bartact',
    desc: 'Shop Bartact seat covers and accessories for Jeep, Ford Bronco, Toyota 4Runner, and Toyota Tacoma — tactical MOLLE seat covers, grab handles, and interior gear. Made in USA.'
  },
  // Named "SC only" but actually 49% accessories
  {
    handle: 'jeep-wrangler-seat-covers', type: 'custom',
    title: 'Best Jeep Seat Covers | Wrangler JL, JK, TJ & Gladiator | Bartact',
    desc: 'Shop the best Jeep seat covers — custom-fit for Wrangler JL, JLU, JK, JKU & TJ. Tactical MOLLE design, SRS airbag compatible, made in USA.'
    // Keep this as-is — already fixed today, SEO value in keeping it seat-cover focused
  },
];

async function main() {
  for (const fix of fixes) {
    const col = await getCollection(fix.handle, fix.type);
    if (!col) { console.log('NOT FOUND:', fix.handle); continue; }
    const t = await upsertMeta(col.id, 'global', 'title_tag', fix.title);
    const d = await upsertMeta(col.id, 'global', 'description_tag', fix.desc);
    console.log('✅', fix.handle.substring(0,50));
    console.log('   Title:', (t||'ERROR').substring(0,70));
    console.log('   Desc: ', (d||'ERROR').substring(0,70));
  }
  console.log('\nAll done.');
}
main().catch(console.error);
