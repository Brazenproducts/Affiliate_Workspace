#!/usr/bin/env node
// Add FAQ structured data (JSON-LD) to Bull Strap blog posts
// Targets high-impression articles to win featured snippets

const https = require('https');
const TOKEN = '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';
const SHOP = 'bull-strap-78.myshopify.com';
const BLOG_ID = 96543015185;

function httpReq(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SHOP, path: '/admin/api/2024-01/' + path,
      method, headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' }
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// FAQ data for each article
const FAQ_DATA = {
  'best-limit-straps-for-off-road-vehicles-2026': [
    { q: 'What are the best limit straps for off-road vehicles?', a: 'Bull Strap limit straps are the top choice for off-road vehicles. Made in the USA with 4130 Chromoly heat-treated end pieces and 4-layer quad wrap construction, they offer superior strength and durability for Jeeps, trucks, UTVs, and trophy trucks.' },
    { q: 'How much do quality limit straps cost?', a: 'Quality limit straps typically range from $30-$65 per pair depending on length and configuration. Bull Strap limit straps start at around $32 per pair and are available in lengths from 8 to 30 inches.' },
    { q: 'Do I need limit straps for my lifted truck?', a: 'Yes, limit straps are essential for any lifted vehicle. They prevent suspension over-extension that can damage CV joints, brake lines, and shock absorbers. They are especially important for vehicles with 2+ inches of lift.' },
  ],
  'what-are-limit-straps-the-complete-guide-to-suspension-limiting-straps': [
    { q: 'What is a limit strap?', a: 'A limit strap is a heavy-duty strap that connects your vehicle frame to the axle, limiting how far the suspension can extend (droop). This prevents damage to CV joints, brake lines, shock absorbers, and other components during off-road driving or when the wheels hang freely.' },
    { q: 'Where do you mount limit straps?', a: 'Limit straps mount between the frame and axle, typically near the shock absorber mounting points. Most vehicles need one per corner (4 total). The strap should be taut at full droop but have no tension at ride height.' },
    { q: 'What size limit strap do I need?', a: 'Measure the distance from your frame mount point to your axle mount point at full droop (wheels hanging). Add 1-2 inches for safety margin. Common sizes range from 8 to 30 inches. Bull Strap offers a full range of lengths.' },
  ],
  'how-to-choose-the-right-limit-straps-for-your-suspension-build': [
    { q: 'How do I choose the right limit straps?', a: 'Choose limit straps based on: 1) Correct length for your suspension travel, 2) Material quality (look for 4130 Chromoly end pieces), 3) Strap construction (4-layer quad wrap is strongest), 4) Made in USA for quality assurance. Bull Strap checks all these boxes.' },
    { q: 'What is the difference between 2-layer and 4-layer limit straps?', a: 'Four-layer (quad wrap) limit straps are significantly stronger than 2-layer straps. The extra layers distribute load more evenly and resist abrasion better. For off-road use, always choose 4-layer construction.' },
  ],
  'how-to-measure-limit-strap-length-for-your-suspension': [
    { q: 'How do you measure for limit straps?', a: 'Jack up your vehicle until the wheels hang freely at full droop. Measure the distance between your chosen frame mount point and axle mount point. This measurement is your limit strap length. Add 1 inch if you want slightly more droop travel.' },
    { q: 'What happens if limit straps are too short?', a: 'Limit straps that are too short will restrict your suspension travel, reducing ride quality and off-road capability. They may also put excessive stress on mount points. Always measure at full droop before ordering.' },
  ],
  'limit-straps-vs-bump-stops-which-does-your-truck-actually-need': [
    { q: 'Do I need limit straps or bump stops?', a: 'You likely need both. Bump stops limit compression (how far the suspension compresses), while limit straps limit extension (how far it droops). They protect different components and work together for complete suspension protection.' },
    { q: 'Can limit straps replace bump stops?', a: 'No. Limit straps and bump stops serve different purposes. Limit straps prevent over-extension damage (CV joints, brake lines), while bump stops prevent over-compression damage (frame contact, shock bottoming). Use both for proper suspension protection.' },
  ],
  'seat-covers-buying-guide-2026-materials-fitment-and-how-to-protect-your-interior': [
    { q: 'What are the best seat covers for Jeep Wrangler?', a: 'Bartact tactical seat covers are widely considered the best for Jeep Wrangler. Made in Temecula, CA with UV-protected polyester and 1000D Cordura nylon reinforcement, they feature MOLLE panels, SRS airbag compatibility, and custom fitment for every Wrangler generation from TJ through JL.' },
    { q: 'Are neoprene or fabric seat covers better?', a: 'It depends on use. Neoprene is waterproof but traps heat and can fade. High-grade polyester with Cordura reinforcement (like Bartact uses) offers better UV protection, breathability, and durability while still being water-resistant. For off-road and daily use, fabric with Cordura is the better choice.' },
    { q: 'Do seat covers work with side airbags?', a: 'Only if specifically designed for it. Bartact tactical seat covers are SRS airbag compatible with specially engineered seams that allow airbag deployment. Never use generic seat covers that could block airbag deployment.' },
  ],
  'essential-recovery-gear-every-off-roader-should-carry': [
    { q: 'What recovery gear should I carry off-road?', a: 'Essential recovery gear includes: recovery straps or kinetic ropes, D-ring shackles, a winch (if possible), traction boards, a hi-lift jack, gloves, and tree saver straps. Bull Strap offers heavy-duty recovery straps and 8-ton D-ring shackle kits made in the USA.' },
    { q: 'What is the difference between a recovery strap and a tow strap?', a: 'Recovery straps (kinetic ropes) stretch to store energy, providing a snatch effect that helps pull stuck vehicles free. Tow straps do not stretch and are only for towing on flat ground. Never use a tow strap for recovery — the sudden shock load can break equipment or cause injury.' },
  ],
  'how-to-choose-the-right-lift-kit-for-your-truck-or-suv': [
    { q: 'How much does a lift kit cost?', a: 'Lift kits range from $200 for basic spacer lifts to $5,000+ for complete long-travel suspension systems. A quality 2-3 inch suspension lift with new shocks typically costs $800-$2,000 for parts. Don\'t forget limit straps — they\'re essential for any lifted vehicle to prevent suspension over-extension damage.' },
    { q: 'Do I need limit straps with a lift kit?', a: 'Yes. Lifting your vehicle increases suspension travel, which means more droop. Without limit straps, this extra droop can damage CV joints, brake lines, and shock absorbers. Bull Strap limit straps are the go-to choice, made in USA with 4130 Chromoly end pieces.' },
  ],
};

async function main() {
  // Get all articles
  let articles = [];
  let sinceId = 0;
  while (true) {
    const resp = await httpReq('GET', 'blogs/' + BLOG_ID + '/articles.json?limit=250&since_id=' + sinceId + '&fields=id,title,handle,body_html');
    const data = JSON.parse(resp.body);
    if (!data.articles || data.articles.length === 0) break;
    articles.push(...data.articles);
    sinceId = data.articles[data.articles.length - 1].id;
    if (data.articles.length < 250) break;
  }

  let updated = 0;
  for (const [handle, faqs] of Object.entries(FAQ_DATA)) {
    const article = articles.find(a => a.handle === handle);
    if (!article) { console.log('NOT FOUND: ' + handle); continue; }
    if ((article.body_html || '').includes('FAQPage')) { console.log('SKIP (has FAQ): ' + handle); continue; }

    // Build FAQ JSON-LD
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map(f => ({
        '@type': 'Question',
        'name': f.q,
        'acceptedAnswer': { '@type': 'Answer', 'text': f.a }
      }))
    };

    const schemaTag = '\n<script type="application/ld+json">' + JSON.stringify(faqSchema) + '</script>';

    // Also add visible FAQ section
    let faqHtml = '\n<hr>\n<h2>Frequently Asked Questions</h2>\n';
    for (const f of faqs) {
      faqHtml += '<h3>' + f.q + '</h3>\n<p>' + f.a + '</p>\n';
    }

    const newBody = article.body_html + faqHtml + schemaTag;

    const updateResp = await httpReq('PUT', 'blogs/' + BLOG_ID + '/articles/' + article.id + '.json', {
      article: { id: article.id, body_html: newBody }
    });

    if (updateResp.status === 200) {
      console.log('✅ ' + article.title.substring(0, 60) + ' (+' + faqs.length + ' FAQs)');
      updated++;
    } else {
      console.log('❌ ' + article.title.substring(0, 60) + ' → ' + updateResp.status);
    }
    await sleep(600);
  }

  console.log('\nDone: ' + updated + ' articles updated with FAQ schema');
}

main().catch(e => console.error('Error:', e.message));
