const token = 'REDACTED_SHOPIFY_TOKEN';
const BLOG_ID = '19510597';

const broncoAddition = `
<h2>What to Look for When Buying Bronco Accessories</h2>
<p>The Bronco aftermarket is flooded with products right now — most of them made overseas, most of them designed to fit "most Broncos" rather than your specific configuration. Here's how to separate the good from the junk.</p>

<p><strong>Custom-fit vs. universal fit.</strong> Universal fit accessories are designed to fit everything, which means they fit nothing perfectly. Bartact cuts every product specifically for the 2021-2026 Ford Bronco full-size. That means the seat covers don't gap at the edges, the grab handles don't slide on the bar, and the storage bags align with your Bronco's actual attachment points.</p>

<p><strong>Where it's made.</strong> This matters more than most people think. Overseas manufacturing means no quality control accountability, no warranty support, and materials that often don't match what's advertised. Bartact builds in the USA. If something is wrong, we fix it. That's a lot harder for a seller shipping from a warehouse in Shenzhen.</p>

<p><strong>Who actually makes it.</strong> Most of the big aftermarket sites — ExtremeTerrain, CJ Pony Parts, Stage 3, Agency 6 — are distributors. They sell products made by other companies. Bartact manufactures everything we sell. That means better quality control, faster problem resolution, and a team that actually knows the product because they built it.</p>

<h2>Building Your Bronco Over Time</h2>
<p>Most Bronco owners don't buy everything at once. They start with the upgrades that matter most to how they use the vehicle, then add from there. If you're daily driving and occasionally trailing, start with seat covers — your interior takes the most abuse and the protection pays off immediately. Add grab handles next because they're inexpensive and passengers notice them on the first trail run.</p>

<p>From there it depends on your use case. Storage bags if you run doors-off regularly. MOLLE panels if you carry gear. Limit straps if you're lifting or running aggressive flex. Fire extinguisher mount before your first serious trail day — not after.</p>

<p>Bartact makes all of it. Everything custom-fit for your Bronco, everything made in the USA, everything sold direct so you're paying manufacturer price, not distributor price. Free shipping on orders over $99. Browse the full <a href="/collections/ford-bronco-accessories-2021-2022-2023">Ford Bronco accessories</a> lineup and build your Bronco the right way — with parts that were actually made for it.</p>
`;

const gladiatorAddition = `
<h2>How the Gladiator Is Different from the Wrangler</h2>
<p>Most Jeep accessory brands treat the Gladiator as a long Wrangler. It's not. The JT has a different wheelbase, different rear seat configuration, different suspension geometry, and different use cases. Products designed for the JL and stretched to fit the Gladiator show the gaps — literally. Bartact developed separate patterns for the Gladiator from scratch because that's what custom-fit actually means.</p>

<p>The Gladiator's truck bed also changes how you carry gear. Tailgate and bed access means you think differently about where things live. MOLLE panels inside the cab keep the cab organized so the bed can do bed things. Seat back storage means tools and trail gear don't end up loose in the truck bed where they slide around and get damaged.</p>

<h2>Gladiator-Specific Considerations</h2>
<p>A few things to know when shopping accessories for the Gladiator specifically:</p>

<p><strong>Rear seat geometry.</strong> The JT's rear seat folds differently than the JL. Seat covers and MOLLE panels designed for the JL won't fit the Gladiator rear seat correctly. Bartact's Gladiator seat covers are patterned specifically for the JT fold mechanism and seat bolster shape.</p>

<p><strong>Suspension droop.</strong> The Gladiator's longer wheelbase means more articulation at full droop. Limit straps that work fine on a JL may not have enough travel for a Gladiator on a lift. Bartact makes Gladiator-specific limit strap lengths to account for this.</p>

<p><strong>Trail and work use.</strong> Most Wrangler owners go to the trail on weekends. Many Gladiator owners use their rigs for work during the week. That changes wear patterns on seat covers and storage significantly. Bartact's 1000D Cordura construction handles daily work-truck abuse better than seat covers designed for weekend trail use only.</p>

<h2>Why Bartact Gladiator Accessories?</h2>
<p>Because we actually make them. Not source them. Not distribute them. Make them — in our American facility, to our standards, from materials we select. Bartact has been making Jeep accessories long enough to know that what works on a JL doesn't always translate to a Gladiator, and we build our products accordingly.</p>

<p>Everything ships direct from Bartact to your door. No distributor in the middle. Free shipping on orders over $99. Browse the full <a href="/collections/jeep-gladiator-seat-covers">Jeep Gladiator seat covers</a> lineup, explore <a href="/collections/jeep-grab-handles">Bartact grab handles</a> by vehicle, or shop all <a href="/collections/molle-accessories">MOLLE accessories</a> to start building your loadout.</p>
`;

async function expandArticle(articleId, addition) {
  // Get current body
  const r = await fetch(`https://bartact.myshopify.com/admin/api/2024-01/blogs/${BLOG_ID}/articles/${articleId}.json`, {
    headers: {'X-Shopify-Access-Token': token}
  });
  const d = await r.json();
  const current = d.article.body_html || '';
  const newBody = current + addition;

  // Update
  const ur = await fetch(`https://bartact.myshopify.com/admin/api/2024-01/blogs/${BLOG_ID}/articles/${articleId}.json`, {
    method: 'PUT',
    headers: {'X-Shopify-Access-Token': token, 'Content-Type': 'application/json'},
    body: JSON.stringify({article: {id: articleId, body_html: newBody}})
  });
  const ud = await ur.json();
  if (ud.article) {
    const text = newBody.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
    const words = text.split(' ').length;
    const bartact = (newBody.match(/[Bb]artact/g)||[]).length;
    const links = (newBody.match(/\/collections\//g)||[]).length;
    console.log('✅ ' + ud.article.title);
    console.log('   Words: ' + words + ' | Bartact: ' + bartact + ' | Links: ' + links);
  } else {
    console.log('ERR:', JSON.stringify(ud).slice(0,150));
  }
}

async function main() {
  await expandArticle('568239063083', broncoAddition);   // Bronco article
  await expandArticle('568239095851', gladiatorAddition); // Gladiator article

  // Resubmit to IndexNow
  const ir = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({host:'www.bartact.com',key:'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5',urlList:[
      'https://www.bartact.com/blogs/news/best-ford-bronco-accessories-for-off-road-and-daily-driving',
      'https://www.bartact.com/blogs/news/best-jeep-gladiator-accessories-for-work-trail-and-everything-between'
    ]})
  });
  console.log('\n✅ IndexNow resubmitted — status:', ir.status);
}

main().catch(e => console.log('ERR:', e.message));
