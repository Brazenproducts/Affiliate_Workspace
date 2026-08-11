#!/usr/bin/env node
require('dotenv').config({ path: '/home/ubuntu/.openclaw/workspace/.env' });
const https = require('https');
const fs = require('fs');
const path = require('path');

const SHOP = 'bartact.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;
const INDEXNOW_KEY = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';
const CONTENT_DIR = path.join(__dirname, 'content');

const PAGES = [
  {
    handle: 'jeep-gladiator-grab-handles',
    id: 'gid://shopify/Collection/688348889131',
    url: 'https://www.bartact.com/collections/jeep-gladiator-grab-handles',
    contentFile: 'gladiator-grab-handles.html',
    seoTitle: 'Jeep Gladiator Grab Handles — Paracord JT 2019-2024 | Bartact',
    seoDescription: 'Custom-fit paracord grab handles for Jeep Gladiator JT 2019-2024. Type III 550 paracord, solid steel core, 30+ colors, bolt-on. Invented by Bartact. Made in USA.',
  },
  {
    handle: 'ford-bronco-seat-covers',
    id: 'gid://shopify/Collection/265140207659',
    url: 'https://www.bartact.com/collections/ford-bronco-seat-covers',
    contentFile: 'ford-bronco-seat-covers.html',
    seoTitle: 'Ford Bronco Seat Covers — 2021-2026 Custom Fit | Bartact',
    seoDescription: 'Custom-fit seat covers for Ford Bronco 2021-2026. 2-door and 4-door. Cordura 1000D, MOLLE compatible, Made in USA. All trims including Raptor.',
  },
  {
    handle: 'jeep-wrangler-seat-covers',
    id: 'gid://shopify/Collection/275720732715',
    url: 'https://www.bartact.com/collections/jeep-wrangler-seat-covers',
    contentFile: 'jeep-wrangler-seat-covers.html',
    seoTitle: 'Jeep Wrangler Seat Covers — Custom Fit JL JK TJ | Bartact',
    seoDescription: 'Custom-fit Jeep Wrangler seat covers for JL (2018-2026), JK (2007-2018), TJ (1997-2006). Cordura 1000D, MOLLE compatible, Made in USA.',
  },
  {
    handle: 'jeep-gladiator-seat-covers',
    id: 'gid://shopify/Collection/688530751531',
    url: 'https://www.bartact.com/collections/jeep-gladiator-seat-covers',
    contentFile: 'jeep-gladiator-seat-covers.html',
    seoTitle: 'Jeep Gladiator Seat Covers — JT 2019-2024 Custom Fit | Bartact',
    seoDescription: 'Custom-fit seat covers for Jeep Gladiator JT 2019-2024. All trims including Mojave. Cordura 1000D, MOLLE compatible, Made in USA.',
  },
  {
    handle: 'jeep-wrangler-jl-seat-covers',
    id: 'gid://shopify/Collection/688526164011',
    url: 'https://www.bartact.com/collections/jeep-wrangler-jl-seat-covers',
    contentFile: 'jl-seat-covers.html',
    seoTitle: 'Jeep Wrangler JL Seat Covers — 2018-2026 Custom Fit | Bartact',
    seoDescription: 'Custom-fit seat covers for Jeep Wrangler JL & JLU 2018-2026. All trims including 4xe. Cordura 1000D, MOLLE compatible, Made in USA.',
  },
  {
    handle: 'jeep-wrangler-jl-jlu-grab-handles',
    id: 'gid://shopify/Collection/688525672491',
    url: 'https://www.bartact.com/collections/jeep-wrangler-jl-jlu-grab-handles',
    contentFile: 'jl-grab-handles.html',
    seoTitle: 'Jeep Wrangler JL Grab Handles — Paracord 2018-2026 | Bartact',
    seoDescription: 'Custom-fit paracord grab handles for Jeep Wrangler JL & JLU 2018-2026. Type III 550 paracord, solid steel core. Invented by Bartact. Made in USA.',
  },
  {
    handle: 'jeep-wrangler-jl-molle-accessories',
    id: 'gid://shopify/Collection/688526196779',
    url: 'https://www.bartact.com/collections/jeep-wrangler-jl-molle-accessories',
    contentFile: 'jl-molle.html',
    seoTitle: 'Jeep Wrangler JL MOLLE Accessories — 2018-2026 | Bartact',
    seoDescription: 'MOLLE accessories for Jeep Wrangler JL & JLU 2018-2026. Seat back panels, roll bar bags. Cordura 1000D, Made in USA. Custom-fit, not universal.',
  },
  {
    handle: 'jeep-wrangler-jk-jku-grab-handles',
    id: 'gid://shopify/Collection/688525705259',
    url: 'https://www.bartact.com/collections/jeep-wrangler-jk-jku-grab-handles',
    contentFile: 'jk-grab-handles.html',
    seoTitle: 'Jeep JK Grab Handles — Paracord 2007-2018 Custom Fit | Bartact',
    seoDescription: 'Custom-fit paracord grab handles for Jeep Wrangler JK & JKU 2007-2018. Type III 550 paracord, solid steel core. Invented by Bartact. Made in USA.',
  },
  {
    handle: 'ford-bronco-grab-handles',
    id: 'gid://shopify/Collection/688348921899',
    url: 'https://www.bartact.com/collections/ford-bronco-grab-handles',
    contentFile: 'bronco-grab-handles.html',
    seoTitle: 'Ford Bronco Grab Handles — Paracord 2021-2026 | Bartact',
    seoDescription: 'Custom-fit paracord grab handles for Ford Bronco 2021-2026. Type III 550 paracord, solid steel core. Made by Bartact — inventor of the paracord grab handle.',
  },
];

function countWords(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(w => w.length > 0).length;
}

function graphql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const req = https.request({
      hostname: SHOP, path: '/admin/api/2024-01/graphql.json', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN, 'Content-Length': Buffer.byteLength(body) },
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { reject(e); } }); });
    req.on('error', reject); req.write(body); req.end();
  });
}

async function pushCollection(id, seoTitle, seoDescription, bodyHtml) {
  const { data } = await graphql(`
    mutation collectionUpdate($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection { id descriptionHtml seo { title } }
        userErrors { field message }
      }
    }`, { input: { id, descriptionHtml: bodyHtml, seo: { title: seoTitle, description: seoDescription } } });
  return data?.collectionUpdate;
}

async function submitIndexNow(url) {
  return new Promise(resolve => {
    const body = JSON.stringify({ host: 'www.bartact.com', key: INDEXNOW_KEY, keyLocation: `https://www.bartact.com/${INDEXNOW_KEY}.txt`, urlList: [url] });
    const req = https.request({ hostname: 'api.indexnow.org', path: '/indexnow', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
      res => { console.log(`   IndexNow: ${res.statusCode}`); resolve(); });
    req.on('error', e => { console.log(`   IndexNow: ${e.message}`); resolve(); });
    req.write(body); req.end();
  });
}

async function main() {
  console.log(`\n🚀 Pushing ${PAGES.length} pages from content files\n${'='.repeat(60)}`);
  const results = [];

  for (let i = 0; i < PAGES.length; i++) {
    const page = PAGES[i];
    const contentPath = path.join(CONTENT_DIR, page.contentFile);
    const bodyHtml = fs.readFileSync(contentPath, 'utf8');
    const rawWords = countWords(bodyHtml);

    console.log(`\n[${i+1}/${PAGES.length}] ${page.handle}`);
    console.log(`   Raw: ${rawWords}w`);

    const result = await pushCollection(page.id, page.seoTitle, page.seoDescription, bodyHtml);
    if (result?.userErrors?.length) {
      console.error(`   ❌ Errors:`, result.userErrors);
      results.push({ handle: page.handle, status: 'ERROR' });
      continue;
    }

    const liveHtml = result?.collection?.descriptionHtml || '';
    const liveWords = countWords(liveHtml);
    const status = liveWords >= 1700 ? '✅ COMPLIANT' : liveWords >= 1500 ? '🟡 ABOVE_FLOOR' : '❌ BELOW_MIN';
    console.log(`   ${status}: ${liveWords}w live`);
    console.log(`   SEO: ${result?.collection?.seo?.title}`);

    await submitIndexNow(page.url);
    results.push({ handle: page.handle, liveWords, status });

    if (i < PAGES.length - 1) await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\n${'='.repeat(60)}\nSUMMARY\n${'='.repeat(60)}`);
  for (const r of results) {
    const icon = r.status?.includes('COMPLIANT') ? '✅' : r.status?.includes('FLOOR') ? '🟡' : '❌';
    console.log(`${icon} ${r.handle}: ${r.liveWords}w`);
  }
  const compliant = results.filter(r => r.liveWords >= 1700).length;
  const aboveFloor = results.filter(r => r.liveWords >= 1500 && r.liveWords < 1700).length;
  console.log(`\n${compliant}/9 at 1,700w+ | ${aboveFloor}/9 between 1,500-1,700w | ${9 - compliant - aboveFloor}/9 below`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
