const token = 'REDACTED_SHOPIFY_TOKEN';
const COL_ID = '688348921899';

const body_html = `
<h2>Ford Bronco Grab Handles — Invented and Made in the USA by Bartact</h2>
<p>Bartact invented the paracord grab handle. We originated this product right here in the USA — and as far as we know, we are the only brand that actually manufactures paracord grab handles in America. Every other brand you see selling paracord grab handles copied our design and had it made in China.</p>

<p>Here's the part that should make you angry: the grab handles on Amazon with American flags on them? Made in China. The ones with patriotic branding and red-white-blue packaging? Made in China. Bartact doesn't put a flag on our packaging to make you feel good. We put American workers to work instead.</p>

<p>Our Ford Bronco grab handles are custom-cut for the 2021-2026 Ford Bronco full-size 2-door and 4-door. Not a universal fit slapped on a generic bar. Custom. Every dimension is specific to your Bronco's roll bar geometry, so the handle wraps tight, doesn't rattle, and grips exactly where your hand goes.</p>

<h3>Why Paracord?</h3>
<p>550 paracord — the same cord used in military applications — is soft in the cold, cool in the heat, and grippy with gloves, mud, or wet hands. Hard plastic handles crack. Aluminum handles heat up. Paracord grips back. That's why Bartact built this product around it, and that's why Jeep and Bronco owners keep coming back.</p>

<h3>The Only Manufacturer. Everyone Else Is a Distributor or a Copycat.</h3>
<p>ExtremeTerrain, CJ Pony Parts, Stage 3 Motorsports, and Agency 6 all sell grab handles — but none of them make grab handles. They're resellers moving someone else's product. Amazon is flooded with overseas knock-offs that copied the Bartact design, slapped a flag on the box, and undercut our price by using cheap labor and cheap materials.</p>

<p>When you buy from Bartact, you buy from the inventor. The original. The only American manufacturer of paracord grab handles that we know of. There's no middleman. No distributor markup. No wondering where it was actually made.</p>

<h3>Made in the USA — For Real</h3>
<p>Every Bartact Ford Bronco grab handle is hand-woven at our American facility by our team. Berry Amendment compliant. No overseas manufacturing. No contractor shortcuts. The same people who design the product build the product. When something leaves our shop, it's right — because we built it ourselves and we stand behind it.</p>

<h3>What's in the Box</h3>
<p>Bartact Ford Bronco grab handles install without drilling. They wrap directly around your existing roll bar using our paracord loop system — no hardware, no damage, no modifications. We offer roll bar grab handles and headrest grab handles for rear passengers. Custom color combinations are available — black is standard, but our team can weave any color you want. That's something no Amazon seller and no distributor can offer.</p>

<h3>Fits Your Bronco</h3>
<p>Our Ford Bronco paracord grab handles are designed for the 2021, 2022, 2023, 2024, 2025, and 2026 Ford Bronco full-size — both 2-door and 4-door configurations. Not compatible with Bronco Sport (different roll bar geometry). If you're unsure which handle fits your build, our team is available to help.</p>

<p>Free shipping on orders over $99. Buy direct from Bartact and get the original — invented here, made here, shipped from here. Explore all <a href="/collections/grab-handles">Bartact paracord grab handles</a> by vehicle, or browse our full <a href="/collections/ford-bronco-accessories-2021-2022-2023">Ford Bronco accessories</a> lineup — seat covers, MOLLE storage, door bags, and more.</p>

<h3>Frequently Asked Questions</h3>

<h4>Who invented the paracord grab handle?</h4>
<p>Bartact invented the paracord grab handle and originated the design in the USA. Every other brand selling paracord grab handles copied our design — most of them manufacture overseas. We are the only brand we know of that still makes paracord grab handles in America.</p>

<h4>Are Bartact grab handles really made in the USA?</h4>
<p>Yes. Every Bartact Ford Bronco grab handle is hand-woven at our American facility. Berry Amendment compliant. The grab handles on Amazon with American flags on the packaging? Made in China. Bartact actually makes ours here.</p>

<h4>Do Bartact Bronco grab handles require drilling?</h4>
<p>No. Bartact Ford Bronco grab handles wrap directly around your existing roll bar using our paracord loop system. No drilling, no modifications, no hardware required. Installation takes under five minutes.</p>

<h4>What years of Ford Bronco do these fit?</h4>
<p>All Bartact Ford Bronco grab handles are designed for the 2021-2026 Ford Bronco full-size. Available for both 2-door and 4-door configurations. Not compatible with the Ford Bronco Sport.</p>

<h4>Can I get custom colors?</h4>
<p>Yes. Bartact offers custom color paracord grab handles for the Ford Bronco. Black is the standard option, but contact our team for custom color combinations. We hand-weave every handle to order — something no overseas manufacturer or Amazon seller can match.</p>
`;

async function run() {
  const r = await fetch(`https://bartact.myshopify.com/admin/api/2024-01/smart_collections/${COL_ID}.json`, {
    method: 'PUT',
    headers: {'X-Shopify-Access-Token': token, 'Content-Type': 'application/json'},
    body: JSON.stringify({smart_collection: {id: COL_ID, body_html}})
  });
  const d = await r.json();
  if (d.smart_collection) {
    const text = body_html.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
    console.log('✅ Collection updated');
    console.log('Word count:', text.split(' ').length);
    console.log('Bartact mentions:', (body_html.match(/[Bb]artact/g)||[]).length);
  } else {
    console.log('ERR:', JSON.stringify(d).slice(0,200));
  }
}
run().catch(e => console.log('ERR:', e.message));
