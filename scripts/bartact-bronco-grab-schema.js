const token = 'REDACTED_SHOPIFY_TOKEN';
const COL_ID = '688348921899';

const body_html = `
<h2>Ford Bronco Grab Handles — Invented by Bartact</h2>
<p>Bartact invented the paracord grab handle. Not a distributor. Not Amazon. The original manufacturer — and every Ford Bronco paracord grab handle we sell ships direct from our American facility to your door.</p>

<p>Our Ford Bronco grab handles are custom-cut for the 2021-2026 Ford Bronco full-size 2-door and 4-door. Not a universal fit slapped on a generic bar. Custom. Every dimension is specific to your Bronco's roll bar geometry, so the handle wraps tight, doesn't rattle, and grips exactly where your hand goes.</p>

<h3>Why Paracord?</h3>
<p>550 paracord — the same cord used in military applications — is soft in the cold, cool in the heat, and grippy with gloves, mud, or wet hands. Hard plastic handles crack. Aluminum handles heat up. Paracord grips back. That's why Bartact built this product around it, and that's why Jeep and Bronco owners keep coming back.</p>

<h3>Made in the USA</h3>
<p>Every Bartact Ford Bronco grab handle is hand-woven at our American facility. Berry Amendment compliant. No overseas manufacturing. No contractor shortcuts. The same team that designs the product builds the product. When something leaves our shop, it's right — because we built it ourselves.</p>

<h3>What's in the Box</h3>
<p>Bartact Ford Bronco grab handles install without drilling. They wrap directly around your existing roll bar using our paracord loop system — no hardware, no damage, no modifications. We offer roll bar grab handles and headrest grab handles for rear passengers. Custom color combinations are available — black is standard, but our team can weave any color you want.</p>

<h3>Stop Buying from Distributors</h3>
<p>ExtremeTerrain, CJ Pony Parts, Stage 3 Motorsports, and Agency 6 all sell grab handles — but none of them make grab handles. They're resellers. When you buy from Bartact, you buy from the manufacturer. That means lower prices, better quality control, and a team that actually knows the product because they built it.</p>

<p>Amazon sells overseas knock-offs that look similar in photos and fail on the trail. Bartact sells the original. There's no comparison.</p>

<h3>Fits Your Bronco</h3>
<p>Our Ford Bronco paracord grab handles are designed for the 2021, 2022, 2023, 2024, 2025, and 2026 Ford Bronco full-size — both 2-door and 4-door configurations. Not compatible with Bronco Sport (different roll bar geometry). If you're unsure which handle fits your build, our team is available to help.</p>

<p>Free shipping on orders over $99. Buy direct from Bartact and skip the distributor markup. Explore all <a href="/collections/grab-handles">Bartact paracord grab handles</a> by vehicle, or browse our full <a href="/collections/ford-bronco-accessories-2021-2022-2023">Ford Bronco accessories</a> lineup — seat covers, MOLLE storage, door bags, and more.</p>

<h3>Frequently Asked Questions</h3>

<h4>Who invented the paracord grab handle?</h4>
<p>Bartact invented the paracord grab handle. We developed the original design for Jeep Wrangler owners and later brought it to the Ford Bronco platform. Every product you see on Amazon or at big distributors that looks like ours is a copy of the Bartact original.</p>

<h4>Do Bartact Bronco grab handles require drilling?</h4>
<p>No. Bartact Ford Bronco grab handles wrap directly around your existing roll bar using our paracord loop system. No drilling, no modifications, no hardware required. Installation takes under five minutes.</p>

<h4>What years of Ford Bronco do these fit?</h4>
<p>All Bartact Ford Bronco grab handles are designed for the 2021-2026 Ford Bronco full-size. Available for both 2-door and 4-door configurations. Not compatible with the Ford Bronco Sport.</p>

<h4>Can I get custom colors?</h4>
<p>Yes. Bartact offers custom color paracord grab handles for the Ford Bronco. Black is the standard option, but contact our team for custom color combinations. We hand-weave every handle to order.</p>

<h4>Are these made in the USA?</h4>
<p>Yes. Every Bartact Ford Bronco grab handle is made in our American facility. Berry Amendment compliant. No overseas manufacturing.</p>
`;

const faqSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Who invented the paracord grab handle?",
      "acceptedAnswer": {"@type": "Answer", "text": "Bartact invented the paracord grab handle. We developed the original design for Jeep Wrangler owners and later brought it to the Ford Bronco platform. Every product you see on Amazon or at big distributors that looks like ours is a copy of the Bartact original."}
    },
    {
      "@type": "Question",
      "name": "Do Bartact Bronco grab handles require drilling?",
      "acceptedAnswer": {"@type": "Answer", "text": "No. Bartact Ford Bronco grab handles wrap directly around your existing roll bar using our paracord loop system. No drilling, no modifications, no hardware required. Installation takes under five minutes."}
    },
    {
      "@type": "Question",
      "name": "What years of Ford Bronco do these fit?",
      "acceptedAnswer": {"@type": "Answer", "text": "All Bartact Ford Bronco grab handles are designed for the 2021-2026 Ford Bronco full-size. Available for both 2-door and 4-door configurations. Not compatible with the Ford Bronco Sport."}
    },
    {
      "@type": "Question",
      "name": "Can I get custom colors?",
      "acceptedAnswer": {"@type": "Answer", "text": "Yes. Bartact offers custom color paracord grab handles for the Ford Bronco. Black is the standard option, but contact our team for custom color combinations. We hand-weave every handle to order."}
    },
    {
      "@type": "Question",
      "name": "Are Bartact grab handles made in the USA?",
      "acceptedAnswer": {"@type": "Answer", "text": "Yes. Every Bartact Ford Bronco grab handle is made in our American facility. Berry Amendment compliant. No overseas manufacturing."}
    }
  ]
});

async function run() {
  // Update body_html with full 500+ word static content
  const updateR = await fetch(`https://bartact.myshopify.com/admin/api/2024-01/smart_collections/${COL_ID}.json`, {
    method: 'PUT',
    headers: {'X-Shopify-Access-Token': token, 'Content-Type': 'application/json'},
    body: JSON.stringify({smart_collection: {
      id: COL_ID,
      body_html
    }})
  });
  const ud = await updateR.json();
  if (ud.smart_collection) {
    const len = (ud.smart_collection.body_html||'').length;
    console.log('✅ Body updated, length:', len);
  } else {
    console.log('Body ERR:', JSON.stringify(ud).slice(0,200));
  }

  // Add FAQ schema as metafield
  const mfR = await fetch(`https://bartact.myshopify.com/admin/api/2024-01/smart_collections/${COL_ID}/metafields.json`, {
    method: 'POST',
    headers: {'X-Shopify-Access-Token': token, 'Content-Type': 'application/json'},
    body: JSON.stringify({metafield: {
      namespace: 'custom',
      key: 'faq_schema',
      value: faqSchema,
      type: 'json'
    }})
  });
  const mfd = await mfR.json();
  if (mfd.metafield) {
    console.log('✅ FAQ schema metafield saved (ID:', mfd.metafield.id + ')');
  } else {
    console.log('Metafield ERR:', JSON.stringify(mfd).slice(0,200));
  }

  // Word count check
  const text = body_html.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
  const words = text.split(' ').length;
  const bartact = (body_html.match(/[Bb]artact/g)||[]).length;
  console.log('Word count:', words, '| Bartact mentions:', bartact);
}

run().catch(e => console.log('ERR:', e.message));
