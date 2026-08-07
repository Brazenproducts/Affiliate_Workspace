#!/usr/bin/env node
// One-time blast: hide ALL T14 products with inv<2 and deny policy right now.
// Runs through the full 103k catalog as fast as rate limits allow.
// After this, the hourly cron maintains it ongoing.

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.SHOPIFY_TOKEN_BULLSTRAP;
const SHOP = 'bull-strap-78.myshopify.com';
const STATE_FILE = path.join(__dirname, '..', 'memory', 'bullstrap-inv-blast-state.json');

function shopify(method, p, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: SHOP, path: '/admin/api/2024-01/' + p, method,
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) }
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ s: res.statusCode, b: d })); });
    req.on('error', reject); if (data) req.write(data); req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function retryOn429(fn) {
  for (let i = 0; i < 6; i++) {
    const r = await fn();
    if (r && r.s === 429) { await sleep(10000); continue; }
    return r;
  }
}

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch (e) { return { sinceId: 0, hidden: 0, checked: 0, done: false }; }
}
function saveState(s) { fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); }

async function main() {
  const state = loadState();
  if (state.done) { console.log('Blast already complete. hidden:', state.hidden); process.exit(0); }

  console.log('Starting inventory filter blast from sinceId:', state.sinceId);
  let batch = [];

  while (true) {
    await sleep(400);
    const r = await retryOn429(() =>
      shopify('GET', `products.json?limit=250&since_id=${state.sinceId}&fields=id,vendor,tags,variants,published_at`)
    );
    if (!r) break;
    const prods = JSON.parse(r.b).products || [];
    if (!prods.length) { state.done = true; break; }

    for (const p of prods) {
      state.sinceId = p.id;
      state.checked++;
      const isT14 = (p.tags || '').includes('ClearanceItem:');
      if (!isT14) continue;
      const hasContinue = (p.variants || []).some(v => v.inventory_policy === 'continue');
      if (hasContinue) continue;
      const inv = (p.variants || []).reduce((s, v) => s + (v.inventory_quantity || 0), 0);
      if (inv < 2 && p.published_at && !(p.tags || '').includes('inv_hidden')) {
        batch.push(p);
      }
    }

    // Hide in batches of 10
    while (batch.length >= 10) {
      const chunk = batch.splice(0, 10);
      await Promise.all(chunk.map(async p => {
        const tags = (p.tags || '').split(',').map(t => t.trim()).filter(Boolean);
        tags.push('inv_hidden');
        await retryOn429(() => shopify('PUT', `products/${p.id}.json`, {
          product: { id: p.id, tags: tags.join(', '), published: false }
        }));
        state.hidden++;
      }));
      await sleep(1000);
    }

    if (state.checked % 5000 === 0 || state.checked % 2500 === 0) {
      saveState(state);
      console.log(`Checked: ${state.checked} | Hidden so far: ${state.hidden} | sinceId: ${state.sinceId}`);
    }
  }

  // Hide remaining batch
  for (const p of batch) {
    await sleep(300);
    const tags = (p.tags || '').split(',').map(t => t.trim()).filter(Boolean);
    tags.push('inv_hidden');
    await retryOn429(() => shopify('PUT', `products/${p.id}.json`, {
      product: { id: p.id, tags: tags.join(', '), published: false }
    }));
    state.hidden++;
  }

  saveState(state);
  console.log(`\n=== BLAST COMPLETE ===`);
  console.log(`Total checked: ${state.checked} | Total hidden: ${state.hidden}`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
