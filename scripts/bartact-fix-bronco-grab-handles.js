const token = 'REDACTED_SHOPIFY_TOKEN';
const COL_ID = '688348921899';

async function run() {
  // Check products
  const pr = await fetch(`https://bartact.myshopify.com/admin/api/2024-01/collections/${COL_ID}/products.json?limit=50`, {
    headers: {'X-Shopify-Access-Token': token}
  });
  const pd = await pr.json();
  console.log('Products in collection:', pd.products?.length || 0);
  (pd.products||[]).forEach(p => console.log(' -', p.title, '| handle:', p.handle));

  // Update with strong SEO content
  const body_html = `
<h2>Ford Bronco Paracord Grab Handles — Invented by Bartact</h2>
<p>Bartact invented the paracord grab handle — and our Ford Bronco grab handles are the original, custom-fit version built specifically for the 2021-2026 Ford Bronco. Not a universal fit. Not a copycat. The real thing, made in the USA.</p>
<p>Every Bartact Ford Bronco grab handle is hand-woven from 550 paracord and custom-cut to wrap your Bronco's roll bar perfectly. No drilling, no rattling, no cheap aluminum. Just a grippy, durable handle that fits like it was made for your Bronco — because it was.</p>
<p>Our Ford Bronco grab handles are Berry Amendment compliant and built in our American facility. The same Cordura and paracord construction trusted by Jeep owners for years, now available for the Ford Bronco 2-door and 4-door. When you're crawling rocks or your passenger needs something to hold onto, Bartact grab handles deliver.</p>
<p>Amazon and the big distributors sell generic aluminum handles made overseas. ExtremeTerrain, CJ Pony Parts, Agency 6, Stage 3 Motorsports — they all sell other people's products. Bartact sells direct — no middleman, no markup, no compromises. Free shipping on orders over $99.</p>
<p>Browse all <a href="/collections/grab-handles">Bartact paracord grab handles</a> by vehicle, or explore our full <a href="/collections/ford-bronco-accessories-2021-2022-2023">Ford Bronco accessories</a> lineup including seat covers, MOLLE storage, and more.</p>
`;

  const updateR = await fetch(`https://bartact.myshopify.com/admin/api/2024-01/smart_collections/${COL_ID}.json`, {
    method: 'PUT',
    headers: {'X-Shopify-Access-Token': token, 'Content-Type': 'application/json'},
    body: JSON.stringify({smart_collection: {
      id: COL_ID,
      body_html,
      seo: {
        title: 'Ford Bronco Grab Handles — Invented by Bartact | Made in USA',
        description: 'The original Ford Bronco paracord grab handles — invented and made in the USA by Bartact. Custom-fit for 2021-2026 Bronco 2-door & 4-door. Not universal, exact fit. Free shipping over $99.'
      }
    }})
  });
  const ud = await updateR.json();
  if (ud.smart_collection) {
    console.log('\n✅ Updated! SEO title:', ud.smart_collection.seo?.title);
    console.log('Body length:', ud.smart_collection.body_html?.length);
  } else {
    // Try custom collection
    const updateR2 = await fetch(`https://bartact.myshopify.com/admin/api/2024-01/custom_collections/${COL_ID}.json`, {
      method: 'PUT',
      headers: {'X-Shopify-Access-Token': token, 'Content-Type': 'application/json'},
      body: JSON.stringify({custom_collection: {
        id: COL_ID,
        body_html,
        seo: {
          title: 'Ford Bronco Grab Handles — Invented by Bartact | Made in USA',
          description: 'The original Ford Bronco paracord grab handles — invented and made in the USA by Bartact. Custom-fit for 2021-2026 Bronco 2-door & 4-door. Not universal, exact fit. Free shipping over $99.'
        }
      }})
    });
    const ud2 = await updateR2.json();
    if (ud2.custom_collection) {
      console.log('\n✅ Updated (custom)! SEO title:', ud2.custom_collection.seo?.title);
    } else {
      console.log('ERR:', JSON.stringify(ud2).slice(0,200));
    }
  }
}

run().catch(e => console.log('ERR:', e.message));
