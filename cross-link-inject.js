#!/usr/bin/env node
// Cross-link injection - builds ALL buttons for each product first, then writes once per product

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const fs = require('fs');

const SHOP = 'bartact.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;
const BASE = `https://${SHOP}/admin/api/2024-01`;
const DELAY = 600;
const STORE_BASE = 'https://bartactseats.com/products';

const sleep = ms => new Promise(r => setTimeout(r, ms));

const { handles, titles } = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/product-handles.json'));

function url(id) {
  if (!handles[id]) throw new Error(`No handle for ID ${id}`);
  return `${STORE_BASE}/${handles[id]}`;
}

async function getProduct(id) {
  const res = await fetch(`${BASE}/products/${id}.json`, {
    headers: { 'X-Shopify-Access-Token': TOKEN }
  });
  if (!res.ok) throw new Error(`GET ${id} failed: ${res.status} ${await res.text()}`);
  return (await res.json()).product;
}

async function updateProductBody(id, newBody) {
  const res = await fetch(`${BASE}/products/${id}.json`, {
    method: 'PUT',
    headers: {
      'X-Shopify-Access-Token': TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ product: { id: String(id), body_html: newBody } })
  });
  if (!res.ok) throw new Error(`PUT ${id} failed: ${res.status} ${await res.text()}`);
  return (await res.json()).product;
}

function redBtn(label, href) {
  return `<a href='${href}' style='display:inline-block;background:#b8001f;color:#ffffff;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;'>${label}</a>`;
}

function goldBtn(label, href) {
  return `<a href='${href}' style='display:inline-block;background:#e0a800;color:#000000;font-weight:700;font-size:0.95em;padding:8px 16px;border-radius:4px;text-decoration:none;'>${label} →</a>`;
}

function redBox(warningText, btns) {
  return `<div style='background:#1a1a1a;border-left:4px solid #b8001f;padding:12px 16px;margin-bottom:10px;'><p style='margin:0 0 10px 0;color:#ffffff;font-size:1.1em;font-weight:700;'>⚠️ ${warningText}</p><div style='display:flex;flex-wrap:wrap;gap:8px;'>${btns.join('')}</div></div>`;
}

function goldBox(upsellText, btns) {
  return `<div style='background:#1a1a1a;border-left:4px solid #e0a800;padding:12px 16px;margin-bottom:10px;'><p style='margin:0 0 10px 0;color:#e0a800;font-size:1.1em;font-weight:700;'>🎨 ${upsellText}</p>${btns.join('')}</div>`;
}

// ============================================================
// Build the complete nav HTML per product ID
// Key: product ID, Value: array of HTML blocks to prepend
// ============================================================
const navBlocks = {}; // id -> [{group, html, desc}]

function addNav(id, group, html, desc) {
  if (!navBlocks[id]) navBlocks[id] = [];
  navBlocks[id].push({ group, html, desc });
}

// ---- GROUP 1: JL 2-Door ↔ JLU 4-Door front covers ----
// JL 2-Door → "Have a 4-Door JLU?"
addNav(1398110846999, 'G1', redBox('Wrong fit? Make sure you have the right door count!', [redBtn('Have a 4-Door JLU? →', url(602085392407))]), 'RED: Have a 4-Door JLU? → [602085392407]');
addNav(1398118711319, 'G1', redBox('Wrong fit? Make sure you have the right door count!', [redBtn('Have a 4-Door JLU? →', url(602069172247))]), 'RED: Have a 4-Door JLU? → [602069172247]');
addNav(6935857659947, 'G1', redBox('Wrong fit? Make sure you have the right door count!', [redBtn('Have a 4-Door JLU? →', url(6948931108907))]), 'RED: Have a 4-Door JLU? → [6948931108907]');

// JLU 4-Door → "Have a 2-Door JL?"
addNav(602085392407, 'G1', redBox('Wrong fit? Make sure you have the right door count!', [redBtn('Have a 2-Door JL? →', url(1398110846999))]), 'RED: Have a 2-Door JL? → [1398110846999]');
addNav(602069172247, 'G1', redBox('Wrong fit? Make sure you have the right door count!', [redBtn('Have a 2-Door JL? →', url(1398118711319))]), 'RED: Have a 2-Door JL? → [1398118711319]');
addNav(6948931108907, 'G1', redBox('Wrong fit? Make sure you have the right door count!', [redBtn('Have a 2-Door JL? →', url(6935857659947))]), 'RED: Have a 2-Door JL? → [6935857659947]');

// ---- GROUP 2: JL/JLU Rear ----
addNav(6563528343595, 'G2', redBox('Wrong fit? Make sure you have the right door count!', [redBtn('Have a 4-Door JLU? →', url(4825121423403))]), 'RED: Have a 4-Door JLU? → [4825121423403]');

addNav(1528278810647, 'G2', redBox('Wrong fit? Make sure you have the right door count!', [
  redBtn('Have a 4-Door JLU (No Armrest)? →', url(1381624545303)),
  redBtn('Have a 4-Door JLU (With Armrest)? →', url(1390915911703))
]), 'RED: Have a 4-Door JLU (No Armrest)? → [1381624545303]; Have a 4-Door JLU (With Armrest)? → [1390915911703]');

addNav(6955991171115, 'G2', redBox('Wrong fit? Make sure you have the right door count!', [
  redBtn('Have a 4-Door JLU (No Armrest)? →', url(6989961723947)),
  redBtn('Have a 4-Door JLU (With Armrest)? →', url(6992450977835))
]), 'RED: Have a 4-Door JLU (No Armrest)? → [6989961723947]; Have a 4-Door JLU (With Armrest)? → [6992450977835]');

addNav(4825121423403, 'G2', redBox('Wrong fit? Make sure you have the right door count!', [redBtn('Have a 2-Door JL? →', url(6563528343595))]), 'RED: Have a 2-Door JL? → [6563528343595]');

addNav(1381624545303, 'G2', redBox('Wrong fit? Make sure you have the right configuration!', [
  redBtn('Have a 2-Door JL? →', url(1528278810647)),
  redBtn('Have a JLU WITH Fold-Down Armrest? →', url(1390915911703))
]), 'RED: Have a 2-Door JL? → [1528278810647]; Have a JLU WITH Fold-Down Armrest? → [1390915911703]');

addNav(1390915911703, 'G2', redBox('Wrong fit? Make sure you have the right configuration!', [
  redBtn('Have a 2-Door JL? →', url(1528278810647)),
  redBtn('Have a JLU WITHOUT Fold-Down Armrest? →', url(1381624545303))
]), 'RED: Have a 2-Door JL? → [1528278810647]; Have a JLU WITHOUT Fold-Down Armrest? → [1381624545303]');

addNav(6989961723947, 'G2', redBox('Wrong fit? Make sure you have the right configuration!', [
  redBtn('Have a JLU WITH Fold-Down Armrest? →', url(6992450977835)),
  redBtn('Have a 2-Door JL? →', url(6955991171115))
]), 'RED: Have a JLU WITH Fold-Down Armrest? → [6992450977835]; Have a 2-Door JL? → [6955991171115]');

addNav(6992450977835, 'G2', redBox('Wrong fit? Make sure you have the right configuration!', [
  redBtn('Have a JLU WITHOUT Fold-Down Armrest? →', url(6989961723947)),
  redBtn('Have a 2-Door JL? →', url(6955991171115))
]), 'RED: Have a JLU WITHOUT Fold-Down Armrest? → [6989961723947]; Have a 2-Door JL? → [6955991171115]');

// ---- GROUP 3: Standard ↔ Fully Customized ----
const g3Pairs = [
  [1261819717, 6981954928683],
  [1481137946647, 6973385211947],
  [1263011717, 6985833578539],
  [1420814469, 6985802645547],
  [1566640898071, 6985669017643],
  [1420816389, 6985626812459],
  [1263040197, 6959562358827],
  [1420824069, 6959588900907],
  [1398118711319, 6935857659947],
  [3497888251927, 7103062376491],
];

for (const [stdId, customId] of g3Pairs) {
  addNav(stdId, 'G3', goldBox('Want it your way? Choose your own colors and fabrics!', [goldBtn('Build Your Fully Customized Version', url(customId))]), `GOLD: Build Your Fully Customized Version → [${customId}]`);
  addNav(customId, 'G3', goldBox('Need it now? Shop our ready-to-ship version!', [goldBtn('Shop Ready-to-Ship Version', url(stdId))]), `GOLD: Shop Ready-to-Ship Version → [${stdId}]`);
}

// ---- GROUP 4: SRS ↔ Non-SRS ----
const g4Pairs = [
  [1263011717, 1420814469],
  [1566640898071, 1420816389],
  [1263040197, 1420824069],
];

for (const [nonSrsId, srsId] of g4Pairs) {
  addNav(nonSrsId, 'G4', redBox('Not sure if you have SRS airbags? Check your seat tag — this cover is for Non-SRS seats only!', [redBtn('Have SRS Airbags? Shop SRS Version →', url(srsId))]), `RED: Have SRS Airbags? Shop SRS Version → [${srsId}]`);
  addNav(srsId, 'G4', redBox('Not sure if you have SRS airbags? Check your seat tag — this cover is for SRS seats only!', [redBtn('No SRS Airbags? Shop Non-SRS Version →', url(nonSrsId))]), `RED: No SRS Airbags? Shop Non-SRS Version → [${nonSrsId}]`);
}

// ---- GROUP 5: Gladiator Standard ↔ Mojave ----
addNav(3497888251927, 'G5', redBox('This cover is NOT for the Mojave or 392 Edition! Wrong edition = wrong fit.', [redBtn('Have a Mojave Edition? Shop Here →', url(6596031283243))]), 'RED: Have a Mojave Edition? Shop Here → [6596031283243]');
addNav(6596031283243, 'G5', redBox('This cover is for Mojave Edition ONLY! Wrong edition = wrong fit.', [redBtn('NOT a Mojave Edition? Shop Standard Gladiator →', url(3497888251927))]), 'RED: NOT a Mojave Edition? Shop Standard Gladiator → [3497888251927]');
addNav(7103062376491, 'G5', redBox('This cover is NOT for the Mojave or 392 Edition! Wrong edition = wrong fit.', [redBtn('Have a Mojave Edition? Shop Here →', url(6949960417323))]), 'RED: Have a Mojave Edition? Shop Here → [6949960417323]');
addNav(6949960417323, 'G5', redBox('This cover is for Mojave Edition ONLY! Wrong edition = wrong fit.', [redBtn('NOT a Mojave Edition? Shop Standard Gladiator →', url(7103062376491))]), 'RED: NOT a Mojave Edition? Shop Standard Gladiator → [7103062376491]');

// ---- GROUP 6: Front ↔ Rear upsell ----
// Single rear pairs
const g6Single = [
  [1261819717, 1262997893],
  [1481137946647, 1263004165],
  [1263011717, 1285757125],
  [1398118711319, 1528278810647],
];

for (const [frontId, rearId] of g6Single) {
  addNav(frontId, 'G6', goldBox('Complete your interior protection with matching rear covers!', [goldBtn('Complete Your Set — Shop Matching Rear Covers', url(rearId))]), `GOLD: Complete Your Set — Shop Matching Rear Covers → [${rearId}]`);
  addNav(rearId, 'G6', goldBox('Complete your interior protection with matching front covers!', [goldBtn('Complete Your Set — Shop Matching Front Covers', url(frontId))]), `GOLD: Complete Your Set — Shop Matching Front Covers → [${frontId}]`);
}

// JLU Front (602069172247) → two rear options
addNav(602069172247, 'G6', goldBox('Complete your interior protection with matching rear covers!', [
  goldBtn('Complete Your Set — Shop JLU Rear (No Armrest)', url(1381624545303)),
  goldBtn('Complete Your Set — Shop JLU Rear (With Armrest)', url(1390915911703))
]), 'GOLD: JLU Rear (No Armrest) → [1381624545303]; JLU Rear (With Armrest) → [1390915911703]');

// JLU rear → JLU front
addNav(1381624545303, 'G6', goldBox('Complete your interior protection with matching front covers!', [goldBtn('Complete Your Set — Shop JLU Matching Front Covers', url(602069172247))]), 'GOLD: JLU Matching Front Covers → [602069172247]');
addNav(1390915911703, 'G6', goldBox('Complete your interior protection with matching front covers!', [goldBtn('Complete Your Set — Shop JLU Matching Front Covers', url(602069172247))]), 'GOLD: JLU Matching Front Covers → [602069172247]');

// Gladiator front (3497888251927) → two rear options
addNav(3497888251927, 'G6', goldBox('Complete your interior protection with matching rear covers!', [
  goldBtn('Complete Your Set — Shop Gladiator Rear (No Armrest)', url(4172629934103)),
  goldBtn('Complete Your Set — Shop Gladiator Rear (With Armrest)', url(3853995966487))
]), 'GOLD: Gladiator Rear (No Armrest) → [4172629934103]; Gladiator Rear (With Armrest) → [3853995966487]');

// Gladiator rear → Gladiator front
addNav(4172629934103, 'G6', goldBox('Complete your interior protection with matching front covers!', [goldBtn('Complete Your Set — Shop Gladiator Matching Front Covers', url(3497888251927))]), 'GOLD: Gladiator Matching Front Covers → [3497888251927]');
addNav(3853995966487, 'G6', goldBox('Complete your interior protection with matching front covers!', [goldBtn('Complete Your Set — Shop Gladiator Matching Front Covers', url(3497888251927))]), 'GOLD: Gladiator Matching Front Covers → [3497888251927]');

// ============================================================
// Now process each product once
// ============================================================
const results = [];

async function processProduct(id) {
  const blocks = navBlocks[id];
  if (!blocks || blocks.length === 0) return;

  await sleep(DELAY);
  const product = await getProduct(id);
  const currentBody = product.body_html || '';
  const marker = `data-crosslink-v1="${id}"`;

  if (currentBody.includes(marker)) {
    console.log(`  SKIP [${id}] "${product.title}"`);
    results.push({ id, title: product.title, status: 'skipped', groups: blocks.map(b => b.group).join(','), buttons: blocks.map(b => b.desc).join(' | ') });
    return;
  }

  // Combine all nav blocks for this product
  const combinedNav = blocks.map(b => b.html).join('\n');
  const newBody = `<div ${marker}>\n${combinedNav}\n</div>\n${currentBody}`;

  await sleep(DELAY);
  const updated = await updateProductBody(id, newBody);
  const groups = blocks.map(b => b.group).join(',');
  console.log(`  ✅ [${id}] "${product.title}" [Groups: ${groups}]`);
  results.push({ id, title: product.title, status: 'updated', groups, buttons: blocks.map(b => b.desc).join(' | ') });
}

async function main() {
  console.log('Building nav blocks per product...');
  const allIds = Object.keys(navBlocks).map(Number);
  console.log(`Total unique products to update: ${allIds.length}\n`);

  // Process in group order
  const orderedIds = [...new Set([
    // G1
    1398110846999, 1398118711319, 6935857659947, 602085392407, 602069172247, 6948931108907,
    // G2
    6563528343595, 1528278810647, 6955991171115, 4825121423403, 1381624545303, 1390915911703, 6989961723947, 6992450977835,
    // G3 unique
    1261819717, 6981954928683, 1481137946647, 6973385211947, 1263011717, 6985833578539, 1420814469, 6985802645547,
    1566640898071, 6985669017643, 1420816389, 6985626812459, 1263040197, 6959562358827, 1420824069, 6959588900907,
    3497888251927, 7103062376491,
    // G5
    6596031283243, 6949960417323,
    // G6 unique rear
    1262997893, 1263004165, 1285757125, 4172629934103, 3853995966487,
  ])];

  for (const id of orderedIds) {
    if (navBlocks[id]) {
      await processProduct(id);
    }
  }

  // Write results
  const updated = results.filter(r => r.status === 'updated').length;
  const skipped = results.filter(r => r.status === 'skipped').length;

  const lines = results.map(r =>
    `### [${r.id}] ${r.title}\n- Status: **${r.status}**\n- Groups: ${r.groups}\n- Buttons: ${r.buttons}`
  ).join('\n\n');

  const report = `# Bartact Cross-Link Nav Injection Results
Generated: ${new Date().toISOString()}

## Summary
- Total unique products: ${results.length}
- Updated: ${updated}
- Skipped (already had nav): ${skipped}

## Product Details

${lines}
`;

  fs.writeFileSync('/home/ubuntu/.openclaw/workspace/memory/cross-link-results.md', report);
  console.log(`\n📄 Results → memory/cross-link-results.md`);
  console.log(`\n🎉 DONE — ${updated} updated, ${skipped} skipped`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
