#!/usr/bin/env node
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');
const fs = require('fs');

const SHOP = 'bartact.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;
const API = '2024-01';
const STATE = '/home/ubuntu/.openclaw/workspace/tmp/bartact-seo-state.json';
const LOG = '/home/ubuntu/.openclaw/workspace/tmp/bartact-seo-apply-log.json';

if (!process.env.BARTACT_CONFIRMED) {
  console.error('ERROR: Set BARTACT_CONFIRMED=1 to run this script against Bartact Shopify.');
  console.error('Example: BARTACT_CONFIRMED=1 node ' + require('path').basename(__filename));
  process.exit(1);
}

function request(method, path, body) {
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
        resolve({ status: res.statusCode, body: parsed, raw: data });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function replaceTemecula(text) {
  if (!text) return text;
  return text
    .replace(/Temecula, California/g, 'Southern California')
    .replace(/Temecula, CA/g, 'Southern California')
    .replace(/Temecula/g, 'Southern California');
}

function faqSchema() {
  return `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [\n    {\n      "@type": "Question",\n      "name": "What Jeep seat covers does Bartact make?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Bartact makes custom-fit Jeep seat covers for Wrangler TJ, JK, JL, and Gladiator models, with front and rear options built for specific model years."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "Are Bartact Jeep seat covers made in the USA?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Yes. Bartact Jeep seat covers are made in the USA in Southern California using UV-protected materials, foam backing, and heavy-duty stitching."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "Do Bartact Jeep seat covers work with side airbags?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Yes. Bartact seat covers for applicable Jeep models are designed with airbag-compatible seams for safe deployment."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "What materials are used in Bartact Jeep seat covers?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Bartact uses UV-protected polyester and/or 1000D Cordura nylon with waterproof polyurethane backing, foam padding, and double or triple stitching depending on the application."\n      }\n    }\n  ]\n}\n</script>`;
}

function hubPageBody() {
  return `<h1>Jeep Seat Covers — Made in the USA</h1>
<p>Bartact Jeep seat covers are built for owners who actually use their Jeeps. Whether you drive a Wrangler TJ, JK, JL, or a Gladiator, our covers are designed around specific model years for a tight fit, clean look, and long-term durability. They are made in the USA in Southern California using premium materials chosen for real trail use, daily driving, and years of sun, dirt, and abuse.</p>
<p>Our lineup uses high-grade UV-protected polyester and select 1000D Cordura nylon, paired with waterproof polyurethane backing, foam padding, and double or triple stitching at stress points. The result is a seat cover that protects your factory upholstery while still feeling solid and comfortable on the road. Many Bartact Jeep seat covers also include MOLLE storage panels for added organization without wasting cabin space.</p>
<p>Fitment matters. Jeep seat covers are not one-size-fits-all, especially when you factor in different seat shapes, trim variations, and side airbag requirements. Bartact patterns each application around the actual Jeep seats for that generation, helping the covers stay in place and look like they belong in the vehicle instead of sitting on top of it.</p>
<p>If you are shopping by model, start with our <a href="/collections/jeep-wrangler-seat-covers">Jeep Wrangler seat covers</a> collection for the broad Wrangler lineup or go straight to <a href="/collections/jeep-gladiator-seat-covers-1">Jeep Gladiator seat covers</a> for JT trucks. If you need generation-specific fitment, browse <a href="/collections/jeep-wrangler-tj-1997-02-accessories">TJ seat cover options</a>, <a href="/collections/2013-18-jeep-wrangler-jk-jku">JK / JKU seat covers</a>, or <a href="/collections/jeep-wrangler-jl-jlu-accessories-2018">JL / JLU seat covers</a> to find the right match for your Jeep.</p>
<p>Every Bartact seat cover is built to protect your investment, improve utility, and hold up where cheap universal covers fail. If you want Jeep seat covers that are actually made for Jeep owners, this is where to start.</p>
${faqSchema()}`;
}

async function main() {
  const state = JSON.parse(fs.readFileSync(STATE, 'utf8'));
  const log = { collections: [], pages: [], rewrites: [] };
  const collectionSpecs = [
    ['custom_collections', 275720732715, 'Jeep Wrangler Seat Covers | Bartact', 'Custom-fit Jeep Wrangler seat covers with MOLLE options, durable materials, and Made in the USA construction for serious trail and daily use.'],
    ['custom_collections', 73831749, 'Jeep Wrangler Accessories | Bartact', 'Shop Jeep Wrangler accessories, MOLLE gear, grab handles, storage bags, and trail-ready interior upgrades made in the USA by Bartact.'],
    ['smart_collections', 137429778455, 'MOLLE Accessories & Pouches | Bartact', 'Shop Bartact MOLLE accessories, pouches, attachments, and tactical storage gear made in the USA for Jeep, Bronco, Tacoma, and more.'],
    ['smart_collections', 265140207659, 'Ford Bronco Seat Covers | Bartact', 'Custom-fit Ford Bronco seat covers with airbag-compatible seams, tactical storage, and Made in the USA durability for 2021+ models.'],
    ['smart_collections', 261741838379, 'Jeep Gladiator Seat Covers | Bartact', 'Custom-fit Jeep Gladiator seat covers with MOLLE storage, airbag-compatible design, and Made in the USA construction for JT trucks.'],
    ['custom_collections', 275721355307, 'Toyota Tacoma Seat Covers | Bartact', 'Custom-fit Toyota Tacoma seat covers made in the USA in Southern California with durable materials, MOLLE storage, and serious daily-use protection.'],
    ['smart_collections', 174233190443, 'Toyota 4Runner Seat Covers | Bartact', 'Shop Bartact Toyota 4Runner seat covers with custom fit, tactical durability, and Made in the USA construction for 5th Gen models.'],
    ['smart_collections', 265141485611, 'Paracord Grab Handles | Bartact', 'Shop Bartact paracord grab handles for Jeep, Gladiator, Bronco, UTVs, and more. Hand-woven in the USA for trail-ready grip and style.'],
    ['custom_collections', 73832005, 'Paracord Grab Handles for Jeep & Bronco', 'Hand-woven paracord grab handles for Jeep Wrangler, Gladiator, Ford Bronco, and UTV applications. Made in the USA by Bartact.'],
    ['custom_collections', 73832453, 'MOLLE Gear Bags & Pouches | Bartact', 'Browse Bartact MOLLE gear bags, pouches, and tactical organizers made in the USA for Jeep, Bronco, and overland vehicle storage.']
  ];

  for (const [type, id, title, desc] of collectionSpecs) {
    const key = type === 'smart_collections' ? 'smart_collection' : 'custom_collection';
    const body = { [key]: { id, metafields_global_title_tag: title, metafields_global_description_tag: desc } };
    const res = await request('PUT', `${type}/${id}.json`, body);
    log.collections.push({ id, type, status: res.status, title, desc });
  }

  for (const bucket of ['custom', 'smart', 'articles', 'pages']) {
    for (const item of state[bucket]) {
      const updated = replaceTemecula(item.body_html || '');
      if (updated !== (item.body_html || '')) {
        let path = null;
        let body = null;
        if (bucket === 'custom') {
          path = `custom_collections/${item.id}.json`;
          body = { custom_collection: { id: item.id, body_html: updated } };
        } else if (bucket === 'smart') {
          path = `smart_collections/${item.id}.json`;
          body = { smart_collection: { id: item.id, body_html: updated } };
        } else if (bucket === 'articles') {
          path = `blogs/19510597/articles/${item.id}.json`;
          body = { article: { id: item.id, body_html: updated } };
        } else if (bucket === 'pages') {
          path = `pages/${item.id}.json`;
          body = { page: { id: item.id, body_html: updated } };
        }
        const res = await request('PUT', path, body);
        log.rewrites.push({ bucket, id: item.id, status: res.status, handle: item.handle || null });
      }
    }
  }

  const existingPage = state.pages.find(p => p.handle === 'jeep-seat-covers');
  if (existingPage) {
    const res = await request('PUT', `pages/${existingPage.id}.json`, {
      page: {
        id: existingPage.id,
        title: 'Jeep Seat Covers',
        handle: 'jeep-seat-covers',
        body_html: hubPageBody(),
        metafields_global_title_tag: 'Jeep Seat Covers | Bartact',
        metafields_global_description_tag: 'Shop Jeep seat covers made in the USA for Wrangler TJ, JK, JL, and Gladiator models. Custom fit, durable materials, and tactical storage options.'
      }
    });
    log.pages.push({ action: 'updated', id: existingPage.id, status: res.status });
  } else {
    const res = await request('POST', 'pages.json', {
      page: {
        title: 'Jeep Seat Covers',
        handle: 'jeep-seat-covers',
        body_html: hubPageBody(),
        metafields_global_title_tag: 'Jeep Seat Covers | Bartact',
        metafields_global_description_tag: 'Shop Jeep seat covers made in the USA for Wrangler TJ, JK, JL, and Gladiator models. Custom fit, durable materials, and tactical storage options.'
      }
    });
    log.pages.push({ action: 'created', status: res.status, id: res.body.page?.id || null });
  }

  fs.writeFileSync(LOG, JSON.stringify(log, null, 2));
  console.log(JSON.stringify(log, null, 2));
}

main().catch(err => {
  console.error(err.stack || String(err));
  process.exit(1);
});
