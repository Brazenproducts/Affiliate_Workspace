require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const SHOP = 'bartact.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;
const headers = { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' };

const updates = [
  {
    id: 1287344773,
    title_tag: 'Jeep Wrangler & Gladiator Paracord Grab Handles | Pair of 2 | Bartact®',
    description_tag: 'Hand-woven USA-made 550 paracord grab handles for Jeep Wrangler, Gladiator, UTV, RZR & more. 30+ colors, steel hardware, fits padded & non-padded roll bars. NOT for 2024+ airbag models.'
  },
  {
    id: 3948249481239,
    title_tag: 'Jeep Wrangler & Gladiator Paracord Grab Handles | Set of 4 | Bartact®',
    description_tag: 'Set of 4 hand-woven USA-made 550 paracord grab handles — covers front & rear roll bar positions. Fits Jeep Wrangler, Gladiator, UTV, RZR & more. 30+ colors. NOT for 2024+ airbag models.'
  },
  {
    id: 7177738387499,
    title_tag: 'Jeep Wrangler JL & JLU Bolt-On Grab Handles 2018-2026+ | Bartact®',
    description_tag: 'The only safe bolt-on paracord grab handles for 2024+ Jeep Wrangler JL & JLU with roll bar airbags. Hand-woven in the USA from 550 paracord. No drilling — uses stock hardware.'
  },
  {
    id: 7394524692523,
    title_tag: 'Jeep Gladiator Bolt-On Paracord Grab Handles 2019+ | Bartact®',
    description_tag: 'The only safe bolt-on paracord grab handles for 2024+ Jeep Gladiator with roll bar airbags. Hand-woven in the USA from 550 paracord. No drilling — uses existing Sky One-Touch Top hardware holes.'
  },
];

async function main() {
  for (const p of updates) {
    // Get existing metafield IDs
    const r = await fetch('https://'+SHOP+'/admin/api/2024-01/products/'+p.id+'/metafields.json?namespace=global', { headers });
    const d = await r.json();
    const titleMF = d.metafields.find(m => m.key === 'title_tag');
    const descMF = d.metafields.find(m => m.key === 'description_tag');

    // Update title_tag
    if (titleMF) {
      await fetch('https://'+SHOP+'/admin/api/2024-01/metafields/'+titleMF.id+'.json', {
        method: 'PUT', headers, body: JSON.stringify({ metafield: { id: titleMF.id, value: p.title_tag } })
      });
    } else {
      await fetch('https://'+SHOP+'/admin/api/2024-01/products/'+p.id+'/metafields.json', {
        method: 'POST', headers, body: JSON.stringify({ metafield: { namespace: 'global', key: 'title_tag', value: p.title_tag, type: 'single_line_text_field' } })
      });
    }

    // Update description_tag
    if (descMF) {
      await fetch('https://'+SHOP+'/admin/api/2024-01/metafields/'+descMF.id+'.json', {
        method: 'PUT', headers, body: JSON.stringify({ metafield: { id: descMF.id, value: p.description_tag } })
      });
    } else {
      await fetch('https://'+SHOP+'/admin/api/2024-01/products/'+p.id+'/metafields.json', {
        method: 'POST', headers, body: JSON.stringify({ metafield: { namespace: 'global', key: 'description_tag', value: p.description_tag, type: 'single_line_text_field' } })
      });
    }

    console.log('✅', p.id, '|', p.title_tag);
    await new Promise(res => setTimeout(res, 500));
  }
}
main().catch(console.error);
