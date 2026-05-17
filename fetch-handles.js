#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const SHOP = 'bartact.myshopify.com';
const TOKEN = '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';
const BASE = `https://${SHOP}/admin/api/2024-01`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

// All product IDs we need
const ALL_IDS = [
  // Group 1 - JL 2-Door / JLU 4-Door front
  1398110846999, 1398118711319, 6935857659947,
  602085392407, 602069172247, 6948931108907,
  // Group 2 - JL/JLU rear
  6563528343595, 1528278810647, 6955991171115,
  4825121423403, 1381624545303, 1390915911703, 6989961723947, 6992450977835,
  // Group 3 - Standard vs Fully Customized
  1261819717, 6981954928683,
  1481137946647, 6973385211947,
  1263011717, 6985833578539,
  1420814469, 6985802645547,
  1566640898071, 6985669017643,
  1420816389, 6985626812459,
  1263040197, 6959562358827,
  1420824069, 6959588900907,
  // 1398118711319 already listed
  // 6935857659947 already listed
  3497888251927, 7103062376491,
  // Group 4 - SRS/Non-SRS (IDs already covered in group 3)
  // Group 5 - Gladiator Mojave
  6596031283243, 6949960417323,
  // Group 6 - Front/Rear pairs
  1262997893, 1263004165, 1285757125,
  // 1528278810647 already listed
  // 1381624545303 already listed, 1390915911703 already listed
  4172629934103, 3853995966487,
];

const UNIQUE_IDS = [...new Set(ALL_IDS)];

async function getProduct(id) {
  const res = await fetch(`${BASE}/products/${id}.json`, {
    headers: { 'X-Shopify-Access-Token': TOKEN }
  });
  if (!res.ok) {
    console.error(`GET ${id} failed: ${res.status}`);
    return null;
  }
  const data = await res.json();
  return data.product;
}

async function main() {
  const handles = {};
  const titles = {};
  
  console.log(`Fetching ${UNIQUE_IDS.length} products...`);
  
  for (const id of UNIQUE_IDS) {
    await sleep(500);
    const p = await getProduct(id);
    if (p) {
      handles[id] = p.handle;
      titles[id] = p.title;
      console.log(`[${id}] "${p.title}" → ${p.handle}`);
    } else {
      handles[id] = null;
      titles[id] = 'NOT FOUND';
      console.log(`[${id}] NOT FOUND`);
    }
  }
  
  // Write to file for reference
  const fs = require('fs');
  fs.writeFileSync('/home/ubuntu/.openclaw/workspace/product-handles.json', 
    JSON.stringify({ handles, titles }, null, 2));
  console.log('\nSaved to product-handles.json');
}

main().catch(console.error);
