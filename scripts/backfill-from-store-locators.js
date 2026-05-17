#!/usr/bin/env node
/**
 * backfill-from-store-locators.js
 * 
 * Backfills real addresses + lat/lng for all chain restaurants in the DB.
 * Uses OpenStreetMap Nominatim geocoding (FREE, no key, 1 req/sec limit).
 * 
 * Strategy: For each unique chain+city+state combo, geocode it properly.
 * This gives us: real address, real lat/lng, confirmation of existence.
 * Cost: $0
 * 
 * Usage:
 *   node scripts/backfill-from-store-locators.js             # all chains
 *   node scripts/backfill-from-store-locators.js --dry-run   # preview only
 *   node scripts/backfill-from-store-locators.js --chain="In-N-Out Burger"
 *   node scripts/backfill-from-store-locators.js --state=CA
 *   node scripts/backfill-from-store-locators.js --limit=100 # batch size
 */

const https = require('https');
const path = require('path');
const fs = require('fs');

// Use skipatip's node_modules
const { createClient } = require(path.join(__dirname, '..', 'skipatip', 'node_modules', '@supabase', 'supabase-js'));

const SUPABASE_URL = 'https://zqmepfdghljknyojfsmq.supabase.co';
const envFile = fs.readFileSync(path.join(__dirname, '..', 'skipatip', '.env.local'), 'utf8');
const SERVICE_KEY = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim()
  || envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const CHAIN_FILTER = args.find(a => a.startsWith('--chain='))?.split('=')[1];
const STATE_FILTER = args.find(a => a.startsWith('--state='))?.split('=')[1];
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '500');

// Nominatim: 1 req/sec
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function nominatimGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'SkipATip/1.0 (skipatip.com; contact@skipatip.com)' }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch { resolve(null); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function geocodeRestaurant(name, city, state) {
  // Query: "McDonald's, Temecula, CA, USA"
  const q = encodeURIComponent(`${name}, ${city}, ${state}, USA`);
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=3&countrycodes=us&addressdetails=1`;

  try {
    const results = await nominatimGet(url);
    if (!results || !results.length) return null;

    // Prefer amenity/fast_food/restaurant results
    const best = results.find(r =>
      r.class === 'amenity' && ['restaurant', 'fast_food', 'cafe', 'food_court'].includes(r.type)
    ) || results[0];

    return {
      lat: parseFloat(best.lat),
      lng: parseFloat(best.lon),
      address: best.address
        ? [best.address.house_number, best.address.road].filter(Boolean).join(' ') || null
        : null,
      display_name: best.display_name
    };
  } catch {
    return null;
  }
}

async function main() {
  console.log(`🍔 SkipATip Restaurant Backfill`);
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE WRITE'}`);
  if (CHAIN_FILTER) console.log(`   Chain filter: ${CHAIN_FILTER}`);
  if (STATE_FILTER) console.log(`   State filter: ${STATE_FILTER}`);
  console.log(`   Batch limit: ${LIMIT}\n`);

  // Fetch restaurants missing lat/lng
  let query = supabase
    .from('restaurants')
    .select('id, name, city, state, address, lat, lng')
    .is('lat', null)
    .eq('is_approved', true)
    .order('name')
    .limit(LIMIT);

  if (CHAIN_FILTER) query = query.eq('name', CHAIN_FILTER);
  if (STATE_FILTER) query = query.eq('state', STATE_FILTER);

  const { data: restaurants, error } = await query;
  if (error) { console.error('DB error:', error); process.exit(1); }

  console.log(`Found ${restaurants.length} restaurants to geocode\n`);

  let updated = 0, failed = 0, skipped = 0;
  const LOG = [];

  for (let i = 0; i < restaurants.length; i++) {
    const r = restaurants[i];
    process.stdout.write(`[${i+1}/${restaurants.length}] ${r.name} — ${r.city}, ${r.state} ... `);

    const geo = await geocodeRestaurant(r.name, r.city, r.state);
    await sleep(1100); // Nominatim 1 req/sec

    if (!geo) {
      console.log('❌ no result');
      failed++;
      LOG.push({ id: r.id, name: r.name, city: r.city, state: r.state, result: 'no_result' });
      continue;
    }

    console.log(`✓ ${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}${geo.address ? ' — ' + geo.address : ''}`);

    if (!DRY_RUN) {
      const update = { lat: geo.lat, lng: geo.lng };
      if (geo.address && !r.address) update.address = geo.address;

      const { error: upErr } = await supabase
        .from('restaurants')
        .update(update)
        .eq('id', r.id);

      if (upErr) {
        console.error(`  ⚠ update failed: ${upErr.message}`);
        failed++;
      } else {
        updated++;
      }
    } else {
      updated++;
    }

    LOG.push({ id: r.id, name: r.name, city: r.city, state: r.state, lat: geo.lat, lng: geo.lng, result: 'ok' });
  }

  const logPath = path.join(__dirname, '..', 'memory', 'backfill-geocode.log');
  fs.writeFileSync(logPath, JSON.stringify(LOG, null, 2));

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✅ Updated: ${updated}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log(`⏭  Skipped: ${skipped}`);
  console.log(`📄 Log: ${logPath}`);

  if (restaurants.length === LIMIT) {
    console.log(`\n⚠  Hit batch limit (${LIMIT}). Run again to continue.`);
  }
}

main().catch(console.error);
