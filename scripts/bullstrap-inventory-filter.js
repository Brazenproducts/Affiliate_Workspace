#!/usr/bin/env node
// Bull Strap Inventory Filter
// ============================================================
// WHAT THIS DOES:
//   Hides Turn14 products with insufficient inventory from
//   collections and search — WITHOUT drafting them (drafting = 404 = SEO death).
//
// RULES:
//   - Bartact + Bull Strap products: ALWAYS visible, never touched
//   - Turn14 products with inventory_policy=continue: ALWAYS visible (orderable)
//   - Turn14 products with inventory_policy=deny + total_inv >= 2: VISIBLE
//   - Turn14 products with inventory_policy=deny + total_inv < 2: HIDDEN
//
// HOW HIDING WORKS (SEO-safe):
//   Sets product.published_at = null on Shopify storefront channel ONLY.
//   This means:
//     - Product URL still works (no 404)
//     - Google can still crawl/index the product
//     - But it won't appear in collections, search, or sitemaps
//     - Customer can't add to cart (inventory_policy=deny + 0 stock)
//
//   Actually: we use Shopify's sales channel publication API to unpublish
//   from the Online Store channel only. Product stays "active" in admin.
//
// APPROACH: Tag-based + publication status
//   Add tag "inv_hidden" when hiding, remove when restoring.
//   This lets us track state without a separate state file per product.
//
// STATE: memory/bullstrap-inventory-filter-state.json
// CRON: every 60 minutes
// ============================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.SHOPIFY_TOKEN_BULLSTRAP;
const SHOP = 'bull-strap-78.myshopify.com';
const STATE_FILE = path.join(__dirname, '..', 'memory', 'bullstrap-inventory-filter-state.json');
const LOCK_FILE = path.join(__dirname, '..', 'memory', 'bullstrap-inventory-filter.lock');
const DELAY_MS = 500;
const MAX_PER_RUN = 500; // products to check per run
const HIDE_TAG = 'inv_hidden';

// ─── HTTP HELPERS ────────────────────────────────────────────────────────────

function shopifyReq(method, p, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: SHOP, path: '/admin/api/2024-01/' + p, method,
      headers: {
        'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function retryOnRateLimit(fn, retries = 5) {
  for (let i = 0; i < retries; i++) {
    const r = await fn();
    if (r && r.status === 429) {
      console.log('  Rate limited, waiting 10s...');
      await sleep(10000);
      continue;
    }
    return r;
  }
  return null;
}

// ─── STATE / LOCK ────────────────────────────────────────────────────────────

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch (e) {
    return { sinceId: 0, totalHidden: 0, totalRestored: 0, lastRun: null };
  }
}
function saveState(s) { fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); }
function lockExists() {
  if (!fs.existsSync(LOCK_FILE)) return false;
  const age = Date.now() - parseInt(fs.readFileSync(LOCK_FILE, 'utf8') || '0');
  return age < 15 * 60 * 1000;
}
function acquireLock() { fs.writeFileSync(LOCK_FILE, Date.now().toString()); }
function releaseLock() { try { fs.unlinkSync(LOCK_FILE); } catch (e) {} }

// ─── PRODUCT HELPERS ─────────────────────────────────────────────────────────

function isT14Product(product) {
  return (product.tags || '').includes('ClearanceItem:');
}

function isOwnProduct(product) {
  return product.vendor === 'Bartact' || product.vendor === 'Bull Strap';
}

function shouldBeVisible(product) {
  // Own products always visible
  if (isOwnProduct(product)) return true;
  // Not a T14 product — leave alone
  if (!isT14Product(product)) return true;
  // T14: continue policy = always visible (orderable regardless of inv)
  const hasContinue = (product.variants || []).some(v => v.inventory_policy === 'continue');
  if (hasContinue) return true;
  // T14: deny policy — need inv >= 2
  const totalInv = (product.variants || []).reduce((s, v) => s + (v.inventory_quantity || 0), 0);
  return totalInv >= 2;
}

function isCurrentlyHidden(product) {
  return (product.tags || '').includes(HIDE_TAG);
}

async function hideProduct(product) {
  // Add inv_hidden tag + unpublish from online store
  const currentTags = (product.tags || '').split(',').map(t => t.trim()).filter(Boolean);
  if (!currentTags.includes(HIDE_TAG)) currentTags.push(HIDE_TAG);
  const newTags = currentTags.join(', ');

  await retryOnRateLimit(() => shopifyReq('PUT', `products/${product.id}.json`, {
    product: { id: product.id, tags: newTags, published: false }
  }));
}

async function restoreProduct(product) {
  // Remove inv_hidden tag + republish to online store
  const currentTags = (product.tags || '').split(',').map(t => t.trim()).filter(t => t && t !== HIDE_TAG);
  const newTags = currentTags.join(', ');

  await retryOnRateLimit(() => shopifyReq('PUT', `products/${product.id}.json`, {
    product: { id: product.id, tags: newTags, published: true }
  }));
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  if (lockExists()) { console.log('Locked. Exiting.'); process.exit(0); }
  acquireLock();

  const state = loadState();
  state.lastRun = new Date().toISOString();
  saveState(state);

  let processed = 0, hidden = 0, restored = 0;

  try {
    let sinceId = state.sinceId;

    while (processed < MAX_PER_RUN) {
      await sleep(DELAY_MS);
      const r = await retryOnRateLimit(() =>
        shopifyReq('GET', `products.json?limit=50&since_id=${sinceId}&fields=id,vendor,tags,variants,published_at`)
      );
      if (!r) break;

      const products = JSON.parse(r.body).products || [];
      if (products.length === 0) {
        // Reached end of catalog — reset for next cycle
        console.log('Full catalog sweep complete — resetting sinceId for maintenance cycle');
        state.sinceId = 0;
        saveState(state);
        break;
      }

      for (const product of products) {
        sinceId = product.id;
        processed++;

        // Skip own products entirely
        if (isOwnProduct(product)) {
          state.sinceId = sinceId;
          continue;
        }

        // Skip non-T14 products
        if (!isT14Product(product)) {
          state.sinceId = sinceId;
          continue;
        }

        const visible = shouldBeVisible(product);
        const currentlyHidden = isCurrentlyHidden(product);
        const isPublished = !!product.published_at;

        if (!visible && isPublished) {
          // Should be hidden but is visible — hide it
          const totalInv = (product.variants || []).reduce((s, v) => s + (v.inventory_quantity || 0), 0);
          console.log(`HIDE: ${product.id} (vendor: ${product.vendor}, inv: ${totalInv})`);
          await sleep(DELAY_MS);
          await hideProduct(product);
          hidden++;
          state.totalHidden++;
        } else if (visible && currentlyHidden) {
          // Was hidden but now has stock — restore it
          const totalInv = (product.variants || []).reduce((s, v) => s + (v.inventory_quantity || 0), 0);
          console.log(`RESTORE: ${product.id} (vendor: ${product.vendor}, inv: ${totalInv})`);
          await sleep(DELAY_MS);
          await restoreProduct(product);
          restored++;
          state.totalRestored++;
        }

        state.sinceId = sinceId;
        if (processed % 50 === 0) saveState(state);
      }
    }

    saveState(state);

    console.log(`\n=== INVENTORY FILTER COMPLETE ===`);
    console.log(`Checked: ${processed} | Hidden: ${hidden} | Restored: ${restored}`);
    console.log(`All-time hidden: ${state.totalHidden} | All-time restored: ${state.totalRestored}`);
    console.log(`Next sinceId: ${state.sinceId}`);

  } catch (e) {
    console.error('Error:', e.message);
    saveState(state);
  }

  releaseLock();
}

main().catch(e => { console.error('Fatal:', e.message); releaseLock(); process.exit(1); });
