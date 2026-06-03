#!/usr/bin/env node
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');

const SHOP = 'bartact.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;
const API = '2024-01';
const INDEXNOW_KEY = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';

if (!process.env.BARTACT_CONFIRMED) {
  console.error('ERROR: Set BARTACT_CONFIRMED=1 to run this script against Bartact Shopify.');
  console.error('Example: BARTACT_CONFIRMED=1 node ' + require('path').basename(__filename));
  process.exit(1);
}

function shopify(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: SHOP,
      path: `/admin/api/${API}/${path}`,
      method,
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        let parsed = data;
        try { parsed = JSON.parse(data); } catch {}
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function indexNow(urlList) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      host: 'www.bartact.com',
      key: INDEXNOW_KEY,
      urlList
    });
    const req = https.request({
      hostname: 'api.indexnow.org',
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function faqSchema(qa) {
  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a }
    }))
  })}</script>`;
}

function pageTemplate({ h1, paragraphs, links, faqs }) {
  const body = [];
  body.push(`<h1>${h1}</h1>`);
  paragraphs.forEach(p => body.push(`<p>${p}</p>`));
  body.push('<h2>Shop Bartact Collections</h2>');
  body.push('<ul>');
  links.forEach(link => body.push(`<li><a href="${link.href}">${link.text}</a></li>`));
  body.push('</ul>');
  body.push(faqSchema(faqs));
  return body.join('\n');
}

const pages = [
  {
    title: 'Jeep Wrangler Accessories',
    handle: 'jeep-wrangler-accessories',
    seoTitle: 'Jeep Wrangler Accessories | Bartact',
    seoDescription: 'Shop Jeep Wrangler accessories made in the USA, including MOLLE gear, grab handles, storage bags, and interior upgrades by Bartact.',
    body: pageTemplate({
      h1: 'Jeep Wrangler Accessories — Made in the USA',
      paragraphs: [
        'Bartact Jeep Wrangler accessories are built for owners who actually use their rigs on the trail, on the road, and everywhere in between. Beyond seat covers, the Wrangler lineup includes practical upgrades that improve storage, organization, comfort, and daily usability without looking cheap or universal.',
        'Our Wrangler accessories are made in the USA in Southern California and designed around real Jeep fitment. That means MOLLE storage solutions, paracord grab handles, console covers, storage bags, and fire extinguisher mounts that actually fit the vehicle and hold up to sun, dirt, and regular abuse.',
        'Bartact is especially strong in interior organization. MOLLE panels, pouches, and attachment systems let you keep essential gear within reach instead of loose around the cabin. If you want matching protection, our Jeep Wrangler seat covers pair naturally with the same tactical style and functional storage approach.',
        'For owners building out a Wrangler for overlanding, trail riding, or just a cleaner daily driver, these accessories solve real problems. The goal is not generic dress-up parts. It is durable, useful gear that fits right and lasts.'
      ],
      links: [
        { href: '/collections/jeep-wrangler-seat-covers', text: 'Jeep Wrangler Seat Covers' },
        { href: '/collections/jeep-wrangler-seat-covers-accessories', text: 'Jeep Wrangler Accessories Collection' },
        { href: '/collections/molle-accessories', text: 'MOLLE Accessories' },
        { href: '/collections/grab-handles-for-jeep-wrangler-gladiator-ford-bronco-utvs-buggies-rails', text: 'Grab Handles' },
        { href: '/collections/paracord-grab-handles', text: 'Paracord Grab Handles' }
      ],
      faqs: [
        { q: 'What Wrangler accessories does Bartact make?', a: 'Bartact makes Jeep Wrangler accessories including seat covers, MOLLE panels, paracord grab handles, console covers, storage bags, and fire extinguisher mounts.' },
        { q: 'Are Bartact Wrangler accessories made in the USA?', a: 'Yes. Bartact Wrangler accessories are made in the USA in Southern California.' },
        { q: 'Do Bartact Wrangler accessories fit specific Jeep models?', a: 'Yes. Bartact products are designed around specific Wrangler applications rather than generic one-size-fits-all fitment.' }
      ]
    })
  },
  {
    title: 'Jeep Gladiator Accessories',
    handle: 'jeep-gladiator-accessories',
    seoTitle: 'Jeep Gladiator Accessories | Bartact',
    seoDescription: 'Shop Jeep Gladiator accessories made in the USA, including seat covers, MOLLE gear, grab handles, and storage upgrades by Bartact.',
    body: pageTemplate({
      h1: 'Jeep Gladiator Accessories — Made in the USA',
      paragraphs: [
        'The Jeep Gladiator needs accessories built around truck use, not just Wrangler assumptions. Bartact makes Gladiator accessories that improve protection, storage, and daily usability while keeping the interior trail-ready and organized.',
        'Our lineup includes Jeep Gladiator seat covers, MOLLE storage solutions, and grab handles designed for real use. These are made in the USA in Southern California with durable materials, airbag-compatible construction where applicable, and the same hard-use standards Bartact is known for.',
        'Gladiator owners also care about practical storage. Bartact door storage bags for JL, JLU, and Gladiator applications are patent pending and solve one of the most annoying cabin storage problems with a clean, purpose-built design.',
        'If you want Gladiator accessories that feel like real upgrades instead of random add-ons, Bartact is the right place to start.'
      ],
      links: [
        { href: '/collections/jeep-gladiator-seat-covers-1', text: 'Jeep Gladiator Seat Covers' },
        { href: '/collections/molle-accessories', text: 'MOLLE Accessories' },
        { href: '/collections/grab-handles-for-jeep-wrangler-gladiator-ford-bronco-utvs-buggies-rails', text: 'Grab Handles' }
      ],
      faqs: [
        { q: 'What Jeep Gladiator accessories does Bartact make?', a: 'Bartact makes Jeep Gladiator accessories including seat covers, MOLLE storage products, grab handles, and interior storage solutions.' },
        { q: 'Are Gladiator door storage bags available from Bartact?', a: 'Yes. Bartact offers Gladiator door storage bag solutions, including patent-pending designs shared across JL, JLU, and Gladiator applications.' },
        { q: 'Are Bartact Gladiator accessories made in the USA?', a: 'Yes. Bartact Gladiator accessories are made in the USA in Southern California.' }
      ]
    })
  },
  {
    title: 'Ford Bronco Accessories',
    handle: 'ford-bronco-accessories',
    seoTitle: 'Ford Bronco Accessories | Bartact',
    seoDescription: 'Shop Ford Bronco accessories made in the USA, including seat covers, grab handles, and storage upgrades for 2021+ Bronco models.',
    body: pageTemplate({
      h1: 'Ford Bronco Accessories — Made in the USA',
      paragraphs: [
        'The 2021+ Ford Bronco created a huge aftermarket, but most accessories still feel generic. Bartact focuses on the parts that actually improve how the Bronco works day to day: protection, storage, organization, and easy access to the gear you use most.',
        'Our Bronco lineup includes custom-fit seat covers, grab handles, and interior upgrades made in the USA in Southern California. The fit is application-specific, the materials are durable, and the products are built for real use instead of just photos.',
        'Bartact door storage bags for the Bronco are some of the best accessories on the market. They solve real interior storage problems without wasting space, and they fit the Bronco cleanly instead of looking like an afterthought.',
        'If you want Ford Bronco accessories that feel durable, useful, and purpose-built, Bartact covers the core upgrades that matter most.'
      ],
      links: [
        { href: '/collections/ford-bronco-seat-covers', text: 'Ford Bronco Seat Covers' },
        { href: '/collections/ford-bronco-accessories-2021-2022-2023', text: 'Ford Bronco Accessories Collection' },
        { href: '/collections/grab-handles-for-jeep-wrangler-gladiator-ford-bronco-utvs-buggies-rails', text: 'Grab Handles' }
      ],
      faqs: [
        { q: 'What Ford Bronco accessories does Bartact make?', a: 'Bartact makes Ford Bronco seat covers, grab handles, and storage-focused interior accessories for 2021 and newer full-size Bronco models.' },
        { q: 'Are Bartact Bronco accessories made in the USA?', a: 'Yes. Bartact Bronco accessories are made in the USA in Southern California.' },
        { q: 'What is Bartact known for on the Bronco?', a: 'Bartact is especially strong in custom-fit seat covers, grab handles, and Bronco door storage bags.' }
      ]
    })
  },
  {
    title: 'Toyota Tacoma Accessories',
    handle: 'toyota-tacoma-accessories',
    seoTitle: 'Toyota Tacoma Accessories | Bartact',
    seoDescription: 'Shop Toyota Tacoma accessories and seat covers made in the USA, with custom-fit protection, MOLLE storage, and durable trail-ready materials.',
    body: pageTemplate({
      h1: 'Toyota Tacoma Accessories — Made in the USA',
      paragraphs: [
        'Toyota Tacoma owners need accessories that fit correctly, hold up to daily use, and look like they belong in the truck. Bartact makes Tacoma products with that exact goal in mind, focusing on custom-fit protection and practical storage instead of generic universal parts.',
        'Our Tacoma seat covers are built for real use, with durable materials, tactical styling, and custom fitment across model years. They are made in the USA in Southern California and designed to protect the factory seats without looking sloppy or shifting around after a few weeks.',
        'Tacoma owners who want more organization can also build around Bartact MOLLE accessories. Panels, attachments, and storage systems help keep gear under control inside the cabin instead of bouncing around the truck.',
        'If you are searching for Tacoma accessories or Tacoma seat covers, Bartact is one of the strongest options for long-term interior protection and utility.'
      ],
      links: [
        { href: '/collections/toyota-tacoma-seat-covers', text: 'Toyota Tacoma Seat Covers' },
        { href: '/collections/molle-accessories', text: 'MOLLE Accessories' }
      ],
      faqs: [
        { q: 'What Tacoma accessories does Bartact make?', a: 'Bartact is best known for Toyota Tacoma seat covers and MOLLE-compatible storage accessories.' },
        { q: 'Are Bartact Tacoma seat covers made in the USA?', a: 'Yes. Bartact Tacoma seat covers are made in the USA in Southern California.' },
        { q: 'What Tacoma years does Bartact cover?', a: 'Bartact covers Toyota Tacoma applications from 2005 through current supported model years.' }
      ]
    })
  },
  {
    title: 'MOLLE Accessories Guide',
    handle: 'molle-accessories-guide',
    seoTitle: 'MOLLE Accessories Guide | Bartact',
    seoDescription: 'Learn what MOLLE accessories are, how they work, and which Bartact panels, pouches, and attachments fit your setup.',
    body: pageTemplate({
      h1: 'MOLLE Accessories — Organize Your Gear',
      paragraphs: [
        'MOLLE stands for Modular Lightweight Load-carrying Equipment, and it is one of the best systems for keeping gear organized, accessible, and secure inside a vehicle. Bartact builds MOLLE accessories for real-world off-road and daily-driver use, not just for looks.',
        'The system works through PALS webbing, which gives you fixed rows where pouches, straps, clips, and attachments can be mounted. That makes it easy to customize your storage setup depending on the vehicle, the trip, and the gear you carry most often.',
        'Bartact offers MOLLE panels, pouches, clips, buckles, D-rings, and attachment hardware, plus seat covers that incorporate MOLLE storage directly into the design. This gives Jeep, Bronco, Tacoma, and 4Runner owners a way to organize tools, medical gear, flashlights, radios, and trail essentials without clutter.',
        'If you are comparing MOLLE accessories, the important differences are fit, material quality, and how well the system works in a real vehicle. Bartact focuses on durable construction, practical layouts, and clean fitment that looks intentional instead of improvised.'
      ],
      links: [
        { href: '/collections/molle-accessories', text: 'MOLLE Accessories Collection' },
        { href: '/collections/molle-pouches-molle-accessories-gear-bags-by-bartact', text: 'MOLLE Gear Bags & Pouches' },
        { href: '/collections/jeep-wrangler-seat-covers', text: 'Seat Covers with MOLLE Storage' }
      ],
      faqs: [
        { q: 'What are MOLLE accessories?', a: 'MOLLE accessories are modular storage products and attachments that use PALS webbing to mount pouches, clips, tools, and other gear in a customizable layout.' },
        { q: 'What vehicles fit Bartact MOLLE panels?', a: 'Bartact MOLLE solutions are used across Jeep Wrangler, Jeep Gladiator, Ford Bronco, Toyota Tacoma, 4Runner, and other supported applications.' },
        { q: 'Are Bartact MOLLE accessories mil-spec?', a: 'Bartact uses mil-spec style PALS webbing and heavy-duty materials designed for hard use and practical in-vehicle organization.' }
      ]
    })
  },
  {
    title: 'Paracord Grab Handles',
    handle: 'paracord-grab-handles',
    seoTitle: 'Paracord Grab Handles | Bartact',
    seoDescription: 'Shop the original Bartact paracord grab handles, made in the USA for Jeep, Gladiator, Bronco, and UTV applications.',
    body: pageTemplate({
      h1: 'Paracord Grab Handles — The Original, Made in USA',
      paragraphs: [
        'Bartact is the original maker of paracord grab handles. Everyone else copied them. If you are looking for the real version built with proper materials and made in the USA, this is where to start.',
        'These grab handles are made in the USA in Southern California and are built for real use in Jeep Wrangler, Jeep Gladiator, Ford Bronco, UTV, buggy, and similar applications. They provide a cleaner look than cheap universal handles and hold up better over time.',
        'Bartact is also the largest manufacturer of paracord grab handles, which matters because consistency, fitment, and finish all show up fast in a product that gets touched every time someone climbs in or braces on rough terrain.',
        'Whether you want a trail-ready grip upgrade or just a cleaner interior detail, Bartact paracord grab handles are the benchmark product in this category.'
      ],
      links: [
        { href: '/collections/grab-handles-for-jeep-wrangler-gladiator-ford-bronco-utvs-buggies-rails', text: 'Grab Handles Collection' },
        { href: '/collections/paracord-grab-handles', text: 'Paracord Grab Handles Collection' }
      ],
      faqs: [
        { q: 'Who made the original paracord grab handles?', a: 'Bartact made the original paracord grab handles before the rest of the market copied the idea.' },
        { q: 'Are Bartact paracord grab handles made in the USA?', a: 'Yes. Bartact paracord grab handles are made in the USA in Southern California.' },
        { q: 'What vehicles can use Bartact paracord grab handles?', a: 'Bartact paracord grab handles are available for Jeep Wrangler, Jeep Gladiator, Ford Bronco, UTV, buggy, and related applications.' }
      ]
    })
  },
  {
    title: 'Tactical Seat Covers',
    handle: 'tactical-seat-covers',
    seoTitle: 'Tactical Seat Covers | Bartact',
    seoDescription: 'Learn what makes a seat cover tactical and shop Bartact tactical seat covers for Jeep, Gladiator, Bronco, Tacoma, and 4Runner.',
    body: pageTemplate({
      h1: 'Tactical Seat Covers — Built for Real Use',
      paragraphs: [
        'A tactical seat cover is not just a styling term. The real difference is utility. Bartact tactical seat covers combine custom fit, durable materials, MOLLE storage, and everyday protection in one product that is built to work hard instead of just looking aggressive.',
        'Bartact uses UV-protected polyester and or 1000D Cordura nylon with waterproof polyurethane backing and high-grade foam, plus double or triple stitching and airbag-compatible construction where required. The result is a cover that protects the factory seats, holds its shape, and adds usable storage.',
        'Tactical seat covers matter most when a vehicle actually gets used. Jeep, Gladiator, Bronco, Tacoma, and 4Runner owners all benefit from added organization and better protection, especially when gear, tools, pets, mud, and sun are part of normal life.',
        'If you want tactical seat covers that are made in the USA in Southern California and built around real fitment, Bartact is one of the strongest options on the market.'
      ],
      links: [
        { href: '/collections/jeep-wrangler-seat-covers', text: 'Jeep Wrangler Seat Covers' },
        { href: '/collections/jeep-gladiator-seat-covers-1', text: 'Jeep Gladiator Seat Covers' },
        { href: '/collections/ford-bronco-seat-covers', text: 'Ford Bronco Seat Covers' },
        { href: '/collections/toyota-tacoma-seat-covers', text: 'Toyota Tacoma Seat Covers' },
        { href: '/collections/toyota-4runner-accessories', text: 'Toyota 4Runner Seat Covers' }
      ],
      faqs: [
        { q: 'What makes a seat cover tactical?', a: 'Tactical seat covers typically include modular storage like MOLLE webbing, durable materials, and construction intended for hard daily use.' },
        { q: 'What materials does Bartact use?', a: 'Bartact uses UV-protected polyester and or 1000D Cordura nylon with waterproof polyurethane backing and high-grade foam.' },
        { q: 'Are Bartact tactical seat covers made in the USA?', a: 'Yes. Bartact tactical seat covers are made in the USA in Southern California.' }
      ]
    })
  }
];

async function listPages() {
  const all = [];
  let pageInfo = null;
  do {
    const path = pageInfo ? `pages.json?limit=250&page_info=${pageInfo}` : 'pages.json?limit=250';
    const res = await shopify('GET', path);
    if (res.status !== 200) throw new Error(`list pages failed ${res.status}`);
    all.push(...(res.body.pages || []));
    const linkHeader = '';
    pageInfo = null;
  } while (pageInfo);
  return all;
}

async function main() {
  const existing = await listPages();
  const existingByHandle = new Map(existing.map(p => [p.handle, p]));
  const created = [];
  const skipped = [];

  for (const spec of pages) {
    if (existingByHandle.has(spec.handle)) {
      skipped.push({ handle: spec.handle, id: existingByHandle.get(spec.handle).id, url: `https://www.bartact.com/pages/${spec.handle}` });
      continue;
    }
    const res = await shopify('POST', 'pages.json', {
      page: {
        title: spec.title,
        handle: spec.handle,
        body_html: spec.body,
        metafields_global_title_tag: spec.seoTitle,
        metafields_global_description_tag: spec.seoDescription
      }
    });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`create ${spec.handle} failed ${res.status}: ${JSON.stringify(res.body)}`);
    }
    const page = res.body.page;
    created.push({ handle: spec.handle, id: page.id, url: `https://www.bartact.com/pages/${spec.handle}` });
  }

  const urls = created.map(x => x.url);
  let indexNowResult = null;
  if (urls.length) indexNowResult = await indexNow(urls);

  console.log(JSON.stringify({ created, skipped, indexNowResult }, null, 2));
}

main().catch(err => {
  console.error(err.stack || String(err));
  process.exit(1);
});
