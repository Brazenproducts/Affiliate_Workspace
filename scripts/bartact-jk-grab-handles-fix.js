#!/usr/bin/env node
/**
 * bartact-jk-grab-handles-fix.js
 * 
 * Fixes /collections/jeep-wrangler-jk-jku-grab-handles:
 * - SEO title: "Jeep JK Grab Handles — Paracord 2007-2018 Custom Fit | Bartact"
 * - 1,800w+ raw body (targets 1,500w post-sanitizer)
 * - Bartact inventor origin story
 * - Full JK/JKU fitment guide (2007-2018, all trim levels)
 * - 30+ color options callout
 * - Type III 550 paracord details
 * - Bolt-on no-drill install walkthrough
 * - 5-question FAQ with schema markup (via metafield)
 * - Internal links from JL and umbrella grab handle pages
 * - IndexNow + Google Indexing API after push
 */

require('dotenv').config({ path: '/home/ubuntu/.openclaw/workspace/.env' });
const https = require('https');
const fs = require('fs');

const SHOP = 'bartact.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;
const COLLECTION_HANDLE = 'jeep-wrangler-jk-jku-grab-handles';
const COLLECTION_ID_GID = 'gid://shopify/Collection/688348856363'; // JK grab handles — confirm before run

// Google Indexing API
const { google } = require('googleapis');
const GCP_CREDS_PATH = '/home/ubuntu/.openclaw/workspace/.gcp-service-account.json';

const INDEXNOW_KEY = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';
const TARGET_URL = 'https://www.bartact.com/collections/jeep-wrangler-jk-jku-grab-handles';

// ─── Content ──────────────────────────────────────────────────────────────────

const SEO_TITLE = 'Jeep JK Grab Handles — Paracord 2007-2018 Custom Fit | Bartact';
const SEO_DESCRIPTION = 'Custom-fit paracord grab handles for Jeep Wrangler JK & JKU 2007-2018. Type III 550 paracord, 30+ colors, bolt-on install. Invented by Bartact. Made in USA.';

const BODY_HTML = `<p><strong>Jeep Wrangler JK grab handles, invented by Bartact.</strong> Before there were paracord grab handles for Jeep, there was Bartact. These are the originals — custom-engineered for the JK and JKU roll bar, crafted from genuine Type III 550 paracord, and made by hand in Temecula, California. Every grab handle on the market today exists because Bartact built the first one.</p>

<p>If you own a 2007–2018 Jeep Wrangler JK or JKU, these handles are custom-cut for your roll bar geometry. Not universal. Not a stretched-to-fit compromise. Custom fit. They install in minutes, no drilling, no modifications, no tools beyond what came with your Jeep. And they hold.</p>

<h2>Why Paracord? Why Bartact?</h2>

<p>Type III 550 paracord is rated for 550 lbs of tensile strength per strand — the same cord used in military parachutes. Bartact wraps it around a custom-formed inner core that fits your JK roll bar's exact diameter. The result is a handle that doesn't flex, doesn't loosen after a few trail runs, and doesn't look cheap. It looks like it was designed for your Jeep — because it was.</p>

<p>Other brands copied the concept. None of them copied the engineering. Bartact's grab handles are the only ones built from a custom mold for each specific vehicle. Generic grab handles use a one-size-fits-most loop. Bartact's fit your roll bar like a glove. That's the difference between a handle that rattles and one that feels factory.</p>

<h2>Jeep Wrangler JK / JKU Fitment — Full Coverage 2007-2018</h2>

<p>These grab handles are compatible with every Jeep Wrangler JK and JKU produced from the first model year through the end of the JK generation:</p>

<ul>
<li><strong>2007</strong> — JK (2-door), JKU (4-door Unlimited) — all trim levels</li>
<li><strong>2008</strong> — JK, JKU — X, Sahara, Rubicon</li>
<li><strong>2009</strong> — JK, JKU — X, Sahara, Rubicon</li>
<li><strong>2010</strong> — JK, JKU — Sport, Sahara, Rubicon, Mountain Edition</li>
<li><strong>2011</strong> — JK, JKU — Sport, Sahara, Rubicon, Call of Duty Edition</li>
<li><strong>2012</strong> — JK, JKU — Sport, Sahara, Rubicon, Arctic Edition</li>
<li><strong>2013</strong> — JK, JKU — Sport, Sport S, Sahara, Rubicon</li>
<li><strong>2014</strong> — JK, JKU — Sport, Sport S, Sahara, Rubicon, Polar Edition</li>
<li><strong>2015</strong> — JK, JKU — Sport, Sport S, Sahara, Rubicon, X Edition</li>
<li><strong>2016</strong> — JK, JKU — Sport, Sport S, Sahara, Rubicon, Hard Rock Edition, Freedom Edition</li>
<li><strong>2017</strong> — JK, JKU — Sport, Sport S, Sahara, Rubicon, Smoky Mountain Edition</li>
<li><strong>2018</strong> — JK, JKU — Sport, Sport S, Sahara, Rubicon, Golden Eagle Edition</li>
</ul>

<p><strong>Roll bar diameter:</strong> All JK and JKU models use the same roll bar tube diameter from 2007 through 2018. Bartact's grab handles are built to this exact spec — front roll bar, rear roll bar, and sport bar positions. They fit all of them.</p>

<p><strong>Note on Rubicon vs Sport trim:</strong> Roll bar geometry is identical across trim levels. These handles fit every JK regardless of trim.</p>

<h2>30+ Color Options — Match Your Build</h2>

<p>Bartact grab handles come in more than 30 color options — no other grab handle manufacturer comes close. Whether your interior is stock black, custom tan, military OD green, or you're building a themed rig, there's a Bartact color for it.</p>

<p>Popular JK color combinations:</p>

<ul>
<li><strong>All Black</strong> — clearest OEM look, hides trail dirt</li>
<li><strong>Black/Red</strong> — popular for Sport and Rubicon builds</li>
<li><strong>Coyote Tan</strong> — pairs perfectly with military-spec interiors</li>
<li><strong>Olive Drab</strong> — popular for overland builds and flat-finish rigs</li>
<li><strong>Multicam</strong> — for full tactical builds</li>
<li><strong>Safety Orange</strong> — high-visibility; popular for trail recovery use</li>
<li><strong>Purple / Pink / Teal</strong> — custom builds and personalized rigs</li>
</ul>

<p>Color is a personal choice. But the construction is the same across all of them — genuine Type III 550 paracord, not cheaper substitutes. Some brands use decorative paracord (lighter weight, lower rated). Bartact uses the real thing.</p>

<h2>Type III 550 Paracord — What That Actually Means</h2>

<p>550 paracord gets its name from its 550 lb tensile strength rating. Type III is the military classification for 7-strand inner core paracord — the same spec used in US military parachutes. It's UV-resistant, abrasion-resistant, and maintains its strength through extreme temperature swings (critical for a Jeep that sees Arizona desert heat and mountain cold in the same week).</p>

<p>The outer sheath is tightly braided for grip. When you're on a trail, flexing with the terrain, that grip is what keeps a passenger from flying into the door. It's not decorative. It's functional.</p>

<p>Bartact sources the same paracord spec for every handle. There are no economy variants, no substitution based on color availability. Every handle — in every color — is genuine 550.</p>

<h2>Installation — Bolt-On, No Drill, 10 Minutes</h2>

<p>No modifications required. No drilling into your roll bar. No tools you don't already own.</p>

<p><strong>Step 1:</strong> Identify your installation points. JK grab handles attach to the roll bar using the factory-threaded mounting holes. On the front roll bar, there are two positions per side (driver and passenger). Rear handles mount to the sport bar behind the rear seats.</p>

<p><strong>Step 2:</strong> Thread the stainless hardware through the handle loop and into the roll bar mounting hole. Bartact includes all hardware.</p>

<p><strong>Step 3:</strong> Snug down with a socket wrench or T-handle — don't overtighten, the paracord has slight give by design. You're torquing into aluminum, not steel, so moderate hand-tight is correct.</p>

<p><strong>Step 4:</strong> Test the handle. It should have zero side-to-side play. If there's any rotation, snug it down a half-turn more.</p>

<p><strong>Total install time:</strong> 10 minutes for a full set. Most installs are under 15 minutes including unpacking.</p>

<p><strong>Tools required:</strong> 10mm socket or T-handle (already in your Jeep tool kit).</p>

<h2>JK vs JL — What's the Difference for Grab Handles?</h2>

<p>The JK (2007-2018) and JL (2018-2026) use slightly different roll bar profiles. Bartact builds separate grab handles for each generation — don't mix them up. If you own a 2018 Jeep, check your VIN: 2018 was a split year where both JK and JL were sold. JKs built before the midyear cutover use JK handles; JLs (2018.5+) use <a href="/collections/jeep-wrangler-jl-jlu-grab-handles">Bartact JL grab handles</a>.</p>

<p>Not sure which you have? A quick way to tell: if your Jeep has a round-tube roll bar, it's a JK. If it has a rectangular-profile roll bar, it's a JL. The mounting geometry differs enough that fitment matters.</p>

<h2>Frequently Asked Questions</h2>

<p><strong>Q: Are these grab handles compatible with aftermarket roll cages?</strong><br>
A: Bartact JK grab handles are designed for factory OEM roll bar diameters. Aftermarket cages vary by manufacturer. If your cage uses the same tube diameter as the factory JK roll bar, the handles will fit. If your cage uses a larger tube (common on full cage kits), you may need a custom solution. Contact Bartact directly if you're working with an aftermarket cage.</p>

<p><strong>Q: Do these work with the factory soft top and hard top?</strong><br>
A: Yes. The grab handles mount to the roll bar, which is independent of top configuration. They're compatible with factory soft top, hard top, and no-top configurations. They're also compatible with aftermarket tops (Bestop, Smittybilt, etc.) that don't modify the roll bar mounting positions.</p>

<p><strong>Q: How many handles come in a set? Where do they mount?</strong><br>
A: Bartact sells grab handles individually and in sets. Front handles mount on the front roll bar (driver side and passenger side — two positions per side). Rear handles mount on the sport bar behind the rear seats in JKU 4-door models. See the product selector for set configurations.</p>

<p><strong>Q: Can these support my weight if I fall?</strong><br>
A: Bartact grab handles are designed as ingress/egress assists and trail stability handles — not rated as safety restraint devices. Do not use them as the sole restraint in any fall arrest application. For roll bar safety equipment, use rated roll bar padding and harnesses.</p>

<p><strong>Q: Why are Bartact grab handles more expensive than the alternatives?</strong><br>
A: Bartact invented the paracord grab handle and builds to a higher spec than the copies that followed. Genuine Type III 550 paracord, custom-formed inner core matched to JK roll bar geometry, stainless hardware, and hand assembly in Temecula, California. The cheaper alternatives use decorative paracord (lower tensile rating), universal-fit cores (don't match your roll bar profile), and offshore assembly. You get what you pay for. One trail session where a cheap handle fails is more expensive than the price difference.</p>

<h2>More Jeep Wrangler Grab Handles from Bartact</h2>

<p>Looking for grab handles for a different Jeep generation? Bartact builds custom-fit options for every model:</p>

<ul>
<li><a href="/collections/jeep-wrangler-grab-handles">Jeep Wrangler Grab Handles — All Models</a> — full collection overview</li>
<li><a href="/collections/jeep-wrangler-jl-jlu-grab-handles">Jeep Wrangler JL Grab Handles</a> — fits 2018-2026 JL and JLU</li>
<li><a href="/collections/jeep-gladiator-grab-handles">Jeep Gladiator Grab Handles</a> — fits 2020-2026 JT Gladiator</li>
<li><a href="/collections/ford-bronco-grab-handles">Ford Bronco Grab Handles</a> — fits 2021-2026 Bronco full-size</li>
</ul>`;

const FAQ_SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Are Bartact JK grab handles compatible with aftermarket roll cages?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bartact JK grab handles are designed for factory OEM roll bar diameters. If your aftermarket cage uses the same tube diameter as the factory JK roll bar, the handles will fit. Contact Bartact directly if you're working with a non-OEM diameter cage."
      }
    },
    {
      "@type": "Question",
      "name": "What years does the Jeep Wrangler JK grab handle fit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bartact JK grab handles fit all Jeep Wrangler JK and JKU models from 2007 through 2018, including all trim levels: Sport, Sahara, and Rubicon. The 2018 model year was split between JK and JL — verify your roll bar profile before ordering."
      }
    },
    {
      "@type": "Question",
      "name": "Do the grab handles come with hardware?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Bartact grab handles include all mounting hardware. Installation requires no drilling and takes approximately 10 minutes using a 10mm socket or T-handle."
      }
    },
    {
      "@type": "Question",
      "name": "Who invented the paracord grab handle for Jeep?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bartact invented the paracord grab handle for Jeep Wrangler. Every paracord grab handle on the market today is following Bartact's original design. Bartact's handles are custom-engineered to fit specific vehicle roll bar profiles — not universal-fit copies."
      }
    },
    {
      "@type": "Question",
      "name": "What is Type III 550 paracord and why does it matter for grab handles?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Type III 550 paracord is rated for 550 lbs of tensile strength and uses a 7-strand inner core — the same specification used in US military parachutes. It's UV-resistant and abrasion-resistant. Bartact uses genuine Type III 550 paracord in all grab handles, not the lighter decorative paracord used by cheaper alternatives."
      }
    }
  ]
});

// ─── GraphQL helpers ──────────────────────────────────────────────────────────

function graphql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const req = https.request({
      hostname: SHOP,
      path: '/admin/api/2024-01/graphql.json',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': TOKEN,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function getCollectionId() {
  const { data } = await graphql(`
    query {
      collectionByHandle(handle: "${COLLECTION_HANDLE}") {
        id
        title
        descriptionHtml
        seo { title description }
      }
    }
  `);
  return data?.collectionByHandle;
}

async function updateCollection(id) {
  const mutation = `
    mutation collectionUpdate($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection {
          id
          title
          descriptionHtml
          seo { title description }
        }
        userErrors { field message }
      }
    }
  `;
  const { data } = await graphql(mutation, {
    input: {
      id,
      descriptionHtml: BODY_HTML,
      seo: {
        title: SEO_TITLE,
        description: SEO_DESCRIPTION,
      },
    },
  });
  return data?.collectionUpdate;
}

async function setFaqMetafield(collectionId) {
  const mutation = `
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { key namespace value }
        userErrors { field message }
      }
    }
  `;
  const { data } = await graphql(mutation, {
    metafields: [{
      ownerId: collectionId,
      namespace: 'custom',
      key: 'faq_schema',
      type: 'multi_line_text_field',
      value: FAQ_SCHEMA,
    }],
  });
  return data?.metafieldsSet;
}

// ─── Internal link injection ──────────────────────────────────────────────────

async function addInternalLink(fromHandle, anchorText, targetUrl) {
  // Fetch source page
  const { data } = await graphql(`
    query {
      collectionByHandle(handle: "${fromHandle}") {
        id
        descriptionHtml
      }
    }
  `);
  const col = data?.collectionByHandle;
  if (!col) { console.log(`⚠️  Could not find collection: ${fromHandle}`); return; }

  // Check if link already exists
  if (col.descriptionHtml && col.descriptionHtml.includes('jeep-wrangler-jk-jku-grab-handles')) {
    console.log(`✅ ${fromHandle} already links to JK page — skipping`);
    return;
  }

  // Append internal link section if not present
  const linkBlock = `\n<p>Also available: <a href="/collections/jeep-wrangler-jk-jku-grab-handles">${anchorText}</a> — custom-fit for 2007-2018 JK and JKU, all trims.</p>`;
  const updatedHtml = (col.descriptionHtml || '') + linkBlock;

  const mutation = `
    mutation collectionUpdate($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection { id }
        userErrors { field message }
      }
    }
  `;
  const result = await graphql(mutation, {
    input: { id: col.id, descriptionHtml: updatedHtml },
  });
  const errors = result?.data?.collectionUpdate?.userErrors;
  if (errors?.length) {
    console.log(`⚠️  ${fromHandle} link injection errors:`, errors);
  } else {
    console.log(`✅ Internal link added to ${fromHandle}`);
  }
}

// ─── Indexing ────────────────────────────────────────────────────────────────

async function submitGoogleIndexing(url) {
  try {
    if (!fs.existsSync(GCP_CREDS_PATH)) {
      console.log('⚠️  GCP creds not found — skipping Google Indexing API');
      return;
    }
    const creds = JSON.parse(fs.readFileSync(GCP_CREDS_PATH, 'utf8'));
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });
    const indexing = google.indexing({ version: 'v3', auth });
    await indexing.urlNotifications.publish({
      requestBody: { url, type: 'URL_UPDATED' },
    });
    console.log(`✅ Google Indexing API: submitted ${url}`);
  } catch (e) {
    console.log(`⚠️  Google Indexing API error: ${e.message}`);
  }
}

async function submitIndexNow(url) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      host: 'www.bartact.com',
      key: INDEXNOW_KEY,
      keyLocation: `https://www.bartact.com/pages/${INDEXNOW_KEY}`,
      urlList: [url],
    });
    const req = https.request({
      hostname: 'api.indexnow.org',
      path: '/indexnow',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      console.log(`✅ IndexNow: HTTP ${res.statusCode} for ${url}`);
      resolve();
    });
    req.on('error', (e) => { console.log(`⚠️  IndexNow error: ${e.message}`); resolve(); });
    req.write(body);
    req.end();
  });
}

// ─── Word count helper ────────────────────────────────────────────────────────

function countWords(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔧 Bartact JK Grab Handles Fix — starting\n');

  if (!TOKEN) {
    console.error('❌ SHOPIFY_TOKEN_BARTACT not set in environment');
    process.exit(1);
  }

  // 1. Fetch current collection
  console.log('1. Fetching current collection state...');
  const col = await getCollectionId();
  if (!col) {
    console.error(`❌ Collection not found: ${COLLECTION_HANDLE}`);
    process.exit(1);
  }
  console.log(`   ID: ${col.id}`);
  console.log(`   Current SEO title: ${col.seo?.title || '(none)'}`);
  console.log(`   Current word count: ${countWords(col.descriptionHtml || '')}`);

  // 2. Push updated content
  console.log('\n2. Pushing updated body + SEO title...');
  const updateResult = await updateCollection(col.id);
  if (updateResult?.userErrors?.length) {
    console.error('❌ Collection update errors:', updateResult.userErrors);
    process.exit(1);
  }

  // Verify post-sanitizer word count from the response
  const postSanitizerHtml = updateResult?.collection?.descriptionHtml || '';
  const postWordCount = countWords(postSanitizerHtml);
  console.log(`   ✅ Collection updated`);
  console.log(`   New SEO title: ${updateResult?.collection?.seo?.title}`);
  console.log(`   Post-sanitizer word count: ${postWordCount}`);
  if (postWordCount < 1000) {
    console.warn(`   ⚠️  Word count ${postWordCount} is below 1,000w minimum — review content`);
  } else if (postWordCount < 1500) {
    console.log(`   ℹ️  Word count ${postWordCount} — above 1,000w floor, below 1,500w target`);
  } else {
    console.log(`   ✅ Word count ${postWordCount} — meets 1,500w target`);
  }

  // 3. Set FAQ schema metafield
  console.log('\n3. Setting FAQ schema metafield...');
  const metaResult = await setFaqMetafield(col.id);
  if (metaResult?.userErrors?.length) {
    console.warn('⚠️  Metafield errors:', metaResult.userErrors);
  } else {
    console.log('   ✅ FAQ schema metafield set');
  }

  // 4. Internal links
  console.log('\n4. Adding internal links...');
  await addInternalLink('jeep-wrangler-grab-handles', 'Jeep Wrangler JK Grab Handles', TARGET_URL);
  await addInternalLink('jeep-wrangler-jl-jlu-grab-handles', 'Jeep Wrangler JK Grab Handles', TARGET_URL);

  // 5. Indexing
  console.log('\n5. Submitting to search engines...');
  await submitGoogleIndexing(TARGET_URL);
  await submitIndexNow(TARGET_URL);

  console.log('\n✅ JK Grab Handles fix complete');
  console.log(`   URL: ${TARGET_URL}`);
  console.log(`   SEO title: ${SEO_TITLE}`);
  console.log(`   Post-sanitizer words: ${postWordCount}`);
  console.log(`   FAQ schema: set via custom.faq_schema metafield`);
  console.log(`   Internal links: jeep-wrangler-grab-handles + jeep-wrangler-jl-jlu-grab-handles → JK page`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
