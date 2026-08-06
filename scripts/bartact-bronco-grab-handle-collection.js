const token = 'REDACTED_SHOPIFY_TOKEN';

const body_html = `
<h2>Ford Bronco Paracord Grab Handles — Invented by Bartact</h2>
<p>Bartact invented the paracord grab handle. Not a universal fit. Not a knock-off. The original Ford Bronco grab handle, custom-cut for 2021-2026 Ford Bronco 2-door and 4-door models. Built in the USA from 550 paracord and Cordura fabric — the same materials trusted by the US military.</p>
<p>Unlike the generic aluminum handles sold by distributors, Bartact Bronco grab handles wrap your existing roll bar with a soft, grippy paracord weave that won't rattle, scratch your interior, or cut into your hands on the trail. Every handle is made to order in our facility — Berry Amendment compliant, American made.</p>
<p>Amazon sells cheap knock-offs. ExtremeTerrain and CJ Pony Parts sell other brands. Bartact <em>is</em> the brand — we invented this product and we sell direct, so you get the real thing at the best price with free shipping over $99.</p>
<p>Browse our full <a href="/collections/ford-bronco-accessories-2021-2022-2023">Ford Bronco accessories</a> or all <a href="/collections/grab-handles">Bartact grab handles</a> by vehicle.</p>
`;

const payload = {
  custom_collection: {
    title: 'Ford Bronco Grab Handles',
    handle: 'ford-bronco-grab-handles',
    body_html,
    seo: {
      title: 'Ford Bronco Grab Handles — Invented by Bartact | Made in USA',
      description: 'The original Ford Bronco paracord grab handles, invented and made in the USA by Bartact. Custom-fit for 2021-2026 Bronco 2-door & 4-door. Not universal — exact fit. Free shipping over $99.'
    },
    published: true
  }
};

fetch('https://bartact.myshopify.com/admin/api/2024-01/custom_collections.json', {
  method: 'POST',
  headers: {'X-Shopify-Access-Token': token, 'Content-Type': 'application/json'},
  body: JSON.stringify(payload)
}).then(r => r.json()).then(d => {
  if (d.custom_collection) {
    console.log('✅ Created: /collections/' + d.custom_collection.handle + ' (ID: ' + d.custom_collection.id + ')');
  } else {
    console.log('ERR:', JSON.stringify(d).slice(0, 300));
  }
}).catch(e => console.log('ERR:', e.message));
