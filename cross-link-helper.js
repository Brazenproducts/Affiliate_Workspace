#!/usr/bin/env node

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const SHOP = 'bartact.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;
const BASE = `https://${SHOP}/admin/api/2024-01`;
const DELAY = 600; // ms between calls

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getProduct(id) {
  const res = await fetch(`${BASE}/products/${id}.json`, {
    headers: { 'X-Shopify-Access-Token': TOKEN }
  });
  if (!res.ok) throw new Error(`GET ${id} failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.product;
}

async function updateProductBody(id, newBody) {
  const res = await fetch(`${BASE}/products/${id}.json`, {
    method: 'PUT',
    headers: {
      'X-Shopify-Access-Token': TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ product: { id, body_html: newBody } })
  });
  if (!res.ok) throw new Error(`PUT ${id} failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.product;
}

// Button HTML builders
function redButton(label, href) {
  return `<a href='${href}' style='display:inline-block;background:#b8001f;color:#ffffff;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;'>${label}</a>`;
}

function goldButton(label, href) {
  return `<a href='${href}' style='display:inline-block;background:#e0a800;color:#000000;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;'>${label} →</a>`;
}

function redContainer(warningText, buttons) {
  return `<div style='background:#1a1a1a;border-left:4px solid #b8001f;padding:12px 16px;margin-bottom:10px;'>
  <p style='margin:0 0 10px 0;color:#ffffff;font-size:1.1em;font-weight:700;'>⚠️ ${warningText}</p>
  <div style='display:flex;flex-wrap:wrap;gap:8px;'>
    ${buttons.join('\n    ')}
  </div>
</div>`;
}

function goldContainer(upsellText, buttons) {
  return `<div style='background:#1a1a1a;border-left:4px solid #e0a800;padding:12px 16px;margin-bottom:10px;'>
  <p style='margin:0 0 10px 0;color:#e0a800;font-size:1.1em;font-weight:700;'>🎨 ${upsellText}</p>
  ${buttons.join('\n  ')}
</div>`;
}

// Product URL builder
function productUrl(id) {
  // We'll use the product ID to build URL — we need the handle though
  // We'll fetch handle from product data
  return null; // placeholder
}

// Main processing function
async function processProduct(id, prependHtml) {
  await sleep(DELAY);
  const product = await getProduct(id);
  const title = product.title;
  const handle = product.handle;
  const currentBody = product.body_html || '';
  
  // Check if already has our nav (avoid duplicates)
  // We use a marker comment to detect
  const marker = `<!-- bartact-crosslink-${id} -->`;
  if (currentBody.includes(marker)) {
    console.log(`  SKIP [${id}] "${title}" - already has cross-link nav`);
    return { id, title, handle, skipped: true };
  }
  
  const newBody = marker + '\n' + prependHtml + '\n' + currentBody;
  
  await sleep(DELAY);
  const updated = await updateProductBody(id, newBody);
  console.log(`  ✅ [${id}] "${title}" - updated`);
  return { id, title, handle, updated: true };
}

// Build product page URL from handle
function handleUrl(handle) {
  return `https://bartactseats.com/products/${handle}`;
}

module.exports = { getProduct, updateProductBody, processProduct, redButton, goldButton, redContainer, goldContainer, handleUrl, sleep, DELAY };
