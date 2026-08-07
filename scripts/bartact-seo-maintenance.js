#!/usr/bin/env node
// bartact-seo-maintenance.js
// Weekly SEO maintenance for Bartact Shopify store.
// Uses GraphQL (not REST) to accurately read seo.title / seo.description fields.
// Only fixes genuinely missing/empty SEO fields — never overwrites good hand-crafted metadata.
// Also checks key collection titles for tampering.
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const https = require('https');

const SHOP = 'bartact.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT || 'REDACTED_SHOPIFY_TOKEN';
const API_VERSION = '2024-01';

// Key collections to watch for title tampering
// Format: [handle, expectedTitle]
const WATCHED_COLLECTIONS = [
  ['jeep-seat-covers', 'Jeep Seat Covers'],
  ['jeep-wrangler-seat-covers', 'Jeep Wrangler Seat Covers | Bartact'],
  ['jeep-gladiator-seat-covers-1', 'Jeep Gladiator Seat Covers | Bartact'],
  ['ford-bronco-seat-covers', 'Ford Bronco Seat Covers | Bartact'],
  ['toyota-tacoma-seat-covers', 'Toyota Tacoma Seat Covers | Bartact'],
  ['paracord-grab-handles', 'Paracord Grab Handles | Bartact'],
  ['molle-gear-bags-pouches', 'MOLLE Gear Bags & Pouches | Bartact'],
];

function gql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ query, variables });
    const req = https.request({
      hostname: SHOP,
      path: `/admin/api/${API_VERSION}/graphql.json`,
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error: ' + data.slice(0, 200))); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function rest(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: SHOP,
      path: `/admin/api/${API_VERSION}/${path}`,
      method,
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Generate a basic SEO title from product title (keyword-first, brand-last pattern)
function generateTitle(productTitle) {
  // Strip any trailing | Bartact if already there, then reformat
  const clean = productTitle.replace(/\s*\|\s*Bartact\s*$/i, '').trim();
  const candidate = `${clean} | Bartact`;
  return candidate.length <= 65 ? candidate : clean.slice(0, 52) + '... | Bartact';
}

// Generate a basic meta description from product title
function generateDescription(productTitle) {
  const clean = productTitle.replace(/\s*\|\s*Bartact\s*$/i, '').trim();
  return `Shop ${clean} — Made in the USA by Bartact. Custom-fit, durable, and built for real-world use.`;
}

async function fetchAllProducts() {
  const products = [];
  let cursor = null;
  let page = 0;

  while (true) {
    page++;
    const query = `
      query GetProducts($cursor: String) {
        products(first: 100, after: $cursor, query: "status:active") {
          pageInfo { hasNextPage endCursor }
          edges {
            node {
              id
              title
              handle
              status
              seo {
                title
                description
              }
            }
          }
        }
      }
    `;
    const result = await gql(query, { cursor });
    if (result.errors) {
      throw new Error('GraphQL errors: ' + JSON.stringify(result.errors));
    }
    const conn = result.data.products;
    for (const edge of conn.edges) {
      products.push(edge.node);
    }
    if (!conn.pageInfo.hasNextPage) break;
    cursor = conn.pageInfo.endCursor;
    // Rate limit: ~2 req/s is safe for GraphQL cost
    await sleep(500);
  }
  return products;
}

async function fetchCollectionByHandle(handle) {
  const query = `
    query GetCollection($handle: String!) {
      collectionByHandle(handle: $handle) {
        id
        title
        handle
        seo { title description }
      }
    }
  `;
  const result = await gql(query, { handle });
  if (result.errors) return null;
  return result.data.collectionByHandle;
}

async function fixProductSeo(product, generatedTitle, generatedDesc) {
  // Use REST productUpdate via GID numeric id
  const numericId = product.id.replace('gid://shopify/Product/', '');
  const body = {
    product: {
      id: numericId,
      metafields_global_title_tag: generatedTitle,
      metafields_global_description_tag: generatedDesc,
    }
  };
  const res = await rest('PUT', `products/${numericId}.json`, body);
  return res.status;
}

async function main() {
  console.log('=== Bartact SEO Weekly Maintenance ===');
  console.log(`Run time: ${new Date().toISOString()}`);
  console.log('');

  // ── 1. Scan all active products ──────────────────────────────────────────
  console.log('Fetching all active products via GraphQL...');
  let products;
  try {
    products = await fetchAllProducts();
  } catch (err) {
    console.error('FATAL: Failed to fetch products:', err.message);
    process.exit(1);
  }
  console.log(`Total active products scanned: ${products.length}`);
  console.log('');

  // ── 2. Find products missing SEO ────────────────────────────────────────
  const missingSeo = [];
  for (const p of products) {
    const missingTitle = !p.seo.title || p.seo.title.trim() === '';
    const missingDesc = !p.seo.description || p.seo.description.trim() === '';
    if (missingTitle || missingDesc) {
      missingSeo.push({ ...p, missingTitle, missingDesc });
    }
  }

  console.log(`Products missing SEO (title and/or description): ${missingSeo.length}`);

  if (missingSeo.length === 0) {
    console.log('  ✅ All products have SEO metadata — nothing to fix.');
  } else {
    console.log('  Products needing fixes:');
    for (const p of missingSeo) {
      const flags = [];
      if (p.missingTitle) flags.push('missing title');
      if (p.missingDesc) flags.push('missing description');
      console.log(`  - [${p.handle}] "${p.title}" → ${flags.join(', ')}`);
    }
  }
  console.log('');

  // ── 3. Auto-fix genuine gaps ─────────────────────────────────────────────
  let fixed = 0;
  let fixErrors = 0;
  if (missingSeo.length > 0) {
    console.log('Fixing missing SEO fields...');
    for (const p of missingSeo) {
      const newTitle = p.missingTitle ? generateTitle(p.title) : p.seo.title;
      const newDesc = p.missingDesc ? generateDescription(p.title) : p.seo.description;
      try {
        const status = await fixProductSeo(p, newTitle, newDesc);
        if (status === 200) {
          fixed++;
          console.log(`  ✅ Fixed [${p.handle}] → title="${newTitle.slice(0, 50)}..." desc="${newDesc.slice(0, 60)}..."`);
        } else {
          fixErrors++;
          console.log(`  ⚠️  HTTP ${status} fixing [${p.handle}]`);
        }
      } catch (err) {
        fixErrors++;
        console.log(`  ❌ Error fixing [${p.handle}]: ${err.message}`);
      }
      await sleep(400); // rate limit
    }
    console.log('');
    console.log(`Fixed: ${fixed} | Errors: ${fixErrors}`);
  } else {
    console.log(`Fixed: 0 (nothing needed)`);
  }
  console.log('');

  // ── 4. Collection title tamper check ─────────────────────────────────────
  console.log('Checking key collection titles for tampering...');
  let tamperFlags = 0;
  let tamperOk = 0;

  for (const [handle, expectedTitle] of WATCHED_COLLECTIONS) {
    try {
      const col = await fetchCollectionByHandle(handle);
      if (!col) {
        console.log(`  ⚠️  Collection not found: "${handle}"`);
        tamperFlags++;
        continue;
      }
      if (col.title !== expectedTitle) {
        console.log(`  🚨 TAMPER FLAG: "${handle}"`);
        console.log(`     Expected: "${expectedTitle}"`);
        console.log(`     Actual:   "${col.title}"`);
        tamperFlags++;
      } else {
        console.log(`  ✅ OK: "${handle}" → "${col.title}"`);
        tamperOk++;
      }
      await sleep(300);
    } catch (err) {
      console.log(`  ❌ Error checking "${handle}": ${err.message}`);
      tamperFlags++;
    }
  }
  console.log('');

  // ── 5. Summary ────────────────────────────────────────────────────────────
  console.log('=== SUMMARY ===');
  console.log(`Total active products scanned: ${products.length}`);
  console.log(`Products missing SEO:          ${missingSeo.length}`);
  console.log(`Products fixed:                ${fixed}`);
  console.log(`Fix errors:                    ${fixErrors}`);
  console.log(`Collection tamper flags:       ${tamperFlags}`);
  console.log(`Collections verified clean:    ${tamperOk}`);
  console.log('');

  if (tamperFlags > 0) {
    console.log('⚠️  ACTION REQUIRED: Collection title tampering detected — review above flags.');
  }
  if (fixErrors > 0) {
    console.log('⚠️  Some fix attempts failed — check individual errors above.');
  }
  if (missingSeo.length === 0 && tamperFlags === 0) {
    console.log('✅ All clear — SEO metadata healthy, no collection tampering detected.');
  }

  process.exit(fixErrors > 0 || tamperFlags > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('FATAL:', err.stack || String(err));
  process.exit(1);
});
