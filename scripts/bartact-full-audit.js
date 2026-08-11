#!/usr/bin/env node
require('dotenv').config({ path: '/home/ubuntu/.openclaw/workspace/.env' });
const https = require('https');
const fs = require('fs');

const SHOP = 'bartact.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;

function gql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const req = https.request({
      hostname: SHOP, path: '/admin/api/2024-01/graphql.json', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN, 'Content-Length': Buffer.byteLength(body) }
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d))); });
    req.on('error', reject); req.write(body); req.end();
  });
}

function countWords(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(w => w.length > 0).length;
}

async function fetchAllCollections() {
  let all = [];
  let cursor = null;
  let page = 0;
  do {
    const afterClause = cursor ? `, after: "${cursor}"` : '';
    const { data } = await gql(`{
      collections(first: 50, query: "published_status:published"${afterClause}) {
        pageInfo { hasNextPage endCursor }
        edges { node { id handle title descriptionHtml seo { title } } }
      }
    }`);
    const edges = data?.collections?.edges || [];
    all = all.concat(edges.map(e => e.node));
    const pi = data?.collections?.pageInfo;
    cursor = pi?.hasNextPage ? pi.endCursor : null;
    page++;
    process.stderr.write(`  page ${page}: ${edges.length} collections (total: ${all.length})\n`);
  } while (cursor);
  return all;
}

async function fetchProductSample() {
  // Fetch first 250 products for description audit
  let all = [];
  let cursor = null;
  do {
    const afterClause = cursor ? `, after: "${cursor}"` : '';
    const { data } = await gql(`{
      products(first: 50${afterClause}) {
        pageInfo { hasNextPage endCursor }
        edges { node { id handle title bodyHtml status } }
      }
    }`);
    const edges = data?.products?.edges || [];
    all = all.concat(edges.map(e => e.node).filter(p => p.status === 'ACTIVE'));
    const pi = data?.products?.pageInfo;
    cursor = pi?.hasNextPage ? pi.endCursor : null;
    if (all.length >= 250) break;
  } while (cursor);
  return all;
}

async function main() {
  console.log('=== BARTACT FULL CONTENT AUDIT ===\n');

  // ── COLLECTIONS ──────────────────────────────────────────────────────────
  console.log('Fetching all published collections...');
  const collections = await fetchAllCollections();
  const colResults = collections.map(c => ({
    id: c.id, handle: c.handle, title: c.title,
    words: countWords(c.descriptionHtml),
    seoTitle: c.seo?.title || '',
  })).sort((a, b) => a.words - b.words);

  const crit = colResults.filter(r => r.words < 100);
  const low  = colResults.filter(r => r.words >= 100 && r.words < 500);
  const mid  = colResults.filter(r => r.words >= 500 && r.words < 1000);
  const close = colResults.filter(r => r.words >= 1000 && r.words < 1500);
  const ok   = colResults.filter(r => r.words >= 1500);

  console.log(`\nCOLLECTIONS AUDIT (${colResults.length} published)\n${'='.repeat(60)}`);
  console.log(`🔴 CRITICAL <100w (${crit.length}):`);
  crit.forEach(r => console.log(`  ${String(r.words).padStart(4)}w  ${r.handle}`));
  console.log(`\n🟠 LOW 100-499w (${low.length}):`);
  low.forEach(r => console.log(`  ${String(r.words).padStart(4)}w  ${r.handle}`));
  console.log(`\n🟡 MID 500-999w (${mid.length}):`);
  mid.forEach(r => console.log(`  ${String(r.words).padStart(4)}w  ${r.handle}`));
  console.log(`\n🟨 CLOSE 1000-1499w (${close.length}):`);
  close.forEach(r => console.log(`  ${String(r.words).padStart(4)}w  ${r.handle}`));
  console.log(`\n✅ COMPLIANT 1500w+ (${ok.length}):`);
  ok.forEach(r => console.log(`  ${String(r.words).padStart(4)}w  ${r.handle}`));

  // ── PRODUCTS ─────────────────────────────────────────────────────────────
  console.log('\n\nFetching active products...');
  const products = await fetchProductSample();
  const prodResults = products.map(p => ({
    id: p.id, handle: p.handle, title: p.title,
    words: countWords(p.bodyHtml),
  })).sort((a, b) => a.words - b.words);

  const pCrit  = prodResults.filter(r => r.words < 50);
  const pLow   = prodResults.filter(r => r.words >= 50 && r.words < 300);
  const pOk    = prodResults.filter(r => r.words >= 300);

  console.log(`\nPRODUCT DESCRIPTIONS AUDIT (${prodResults.length} active)\n${'='.repeat(60)}`);
  console.log(`🔴 EMPTY <50w (${pCrit.length}):`);
  pCrit.forEach(r => console.log(`  ${String(r.words).padStart(4)}w  ${r.handle}`));
  console.log(`\n🟠 THIN 50-299w (${pLow.length}):`);
  pLow.forEach(r => console.log(`  ${String(r.words).padStart(4)}w  ${r.handle}`));
  console.log(`\n✅ OK 300w+ (${pOk.length}):`);
  pOk.slice(0, 20).forEach(r => console.log(`  ${String(r.words).padStart(4)}w  ${r.handle}`));
  if (pOk.length > 20) console.log(`  ... and ${pOk.length - 20} more`);

  // ── SAVE QUEUE ────────────────────────────────────────────────────────────
  const fixQueue = {
    asOf: new Date().toISOString(),
    collections: {
      critical: crit.map(r => ({ handle: r.handle, words: r.words, id: r.id })),
      low: low.map(r => ({ handle: r.handle, words: r.words, id: r.id })),
      mid: mid.map(r => ({ handle: r.handle, words: r.words, id: r.id })),
      close: close.map(r => ({ handle: r.handle, words: r.words, id: r.id })),
    },
    products: {
      empty: pCrit.map(r => ({ handle: r.handle, words: r.words, id: r.id })),
      thin: pLow.map(r => ({ handle: r.handle, words: r.words, id: r.id })),
    },
    summary: {
      totalCollections: colResults.length,
      collectionsBelowFloor: colResults.filter(r => r.words < 1500).length,
      collectionsCompliant: ok.length,
      totalProductsAudited: prodResults.length,
      productsBelowMin: pCrit.length + pLow.length,
      productsOk: pOk.length,
    }
  };
  fs.writeFileSync('/home/ubuntu/.openclaw/workspace/memory/bartact-full-audit.json', JSON.stringify(fixQueue, null, 2));
  console.log('\n\nFull audit saved to memory/bartact-full-audit.json');
  console.log('\n=== SUMMARY ===');
  console.log(`Collections: ${colResults.length} total | ${ok.length} compliant (1500w+) | ${colResults.length - ok.length} need work`);
  console.log(`Products: ${prodResults.length} audited | ${pOk.length} ok (300w+) | ${pCrit.length + pLow.length} need work`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
