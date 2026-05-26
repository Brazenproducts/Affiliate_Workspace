require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const SHOP = 'bartact.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;
const headers = { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' };

const newBody = `<h1>Jeep&reg; Wrangler Accessories by Bartact</h1>
<p>Bartact&reg; Jeep&reg; Wrangler accessories are built for owners who demand more from their interior. Every piece is designed for real trail use and daily driving &mdash; no cheap plastics, no shortcuts. All made in the USA in Southern California.</p>

<p><img alt="Jeep Wrangler interior accessories by Bartact" src="https://cdn.shopify.com/s/files/1/0936/7476/files/JK_2_Door_Pic_480x480.jpg?v=1635206121"></p>

<h2>Jeep Wrangler Door Storage Bags &amp; Door Pockets</h2>
<p>Replace your factory door nets with real storage. The Wrangliator door bags for Jeep Wrangler JL, JLU, and Gladiator bolt on with zero drilling or modifications &mdash; available in front, rear, or full set. The best Jeep Wrangler door storage upgrade on the market.</p>

<h2>Jeep Wrangler Grab Handles</h2>
<p>Paracord grab handles for Jeep Wrangler JL, JLU, JK, JKU, and Gladiator &mdash; hand-woven in the USA from 550 paracord. Available for roll bars, headrests, and A/B pillars. The most popular Jeep Wrangler grab handle upgrade, built to last.</p>

<h2>Jeep Wrangler Console Covers &amp; Center Console Accessories</h2>
<p>Padded MOLLE console covers for Jeep Wrangler JL, JK, and Gladiator. Add storage pouches, attach MOLLE gear, and protect your center console &mdash; all with Bartact's signature PALS/MOLLE webbing system.</p>

<h2>Jeep Wrangler MOLLE Panels, Pouches &amp; Storage</h2>
<p>Bartact MOLLE panels, sunglass pouches, flashlight holders, and storage bags for Jeep Wrangler and Gladiator. Compatible with any PALS/MOLLE gear. Built for the trail, practical for every day.</p>

<h2>Jeep Wrangler Sun Visors &amp; Interior Accessories</h2>
<p>MOLLE visor covers, dash handle bags, spare tire trash bags, and more &mdash; designed specifically for Jeep Wrangler JL, JLU, JK, JKU, TJ, and Gladiator. Every Bartact accessory is SRS airbag compatible and made in the USA.</p>`;

async function main() {
  const r = await fetch('https://' + SHOP + '/admin/api/2024-01/custom_collections/73831749.json', {
    method: 'PUT', headers,
    body: JSON.stringify({ custom_collection: { id: 73831749, body_html: newBody } })
  });
  const d = await r.json();
  if (d.custom_collection) {
    console.log('✅ Collection description updated');
    console.log('Preview:', d.custom_collection.body_html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().substring(0,300));
  } else {
    console.log('Error:', JSON.stringify(d).substring(0,200));
  }
}
main().catch(console.error);
