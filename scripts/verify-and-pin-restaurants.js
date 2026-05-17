#!/usr/bin/env node
/**
 * verify-and-pin-restaurants.js
 *
 * For every restaurant in DB with no address/lat/lng:
 *   1. Search Google Places for "Name City State"
 *   2. If found → save real address + lat/lng + place_id
 *   3. If NOT found → delete the record (chain doesn't exist in that city)
 *
 * This fixes phantom chain locations seeded without verification.
 *
 * Usage:
 *   node scripts/verify-and-pin-restaurants.js             # 200 at a time
 *   node scripts/verify-and-pin-restaurants.js --limit 50  # smaller batch
 *   node scripts/verify-and-pin-restaurants.js --dry-run   # preview only
 *
 * Rate: ~1 req/sec = ~950/day free tier. Run daily until all verified.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../skipatip/.env.local');
const env = fs.readFileSync(envPath, 'utf8');
// Get LAST occurrence of key (env file has duplicate GOOGLE_PLACES_API_KEY entries)
const getEnv = k => { const all = [...env.matchAll(new RegExp(`^${k}=(.+)$`, 'gm'))]; return all[all.length-1]?.[1]?.trim(); };

const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const GOOGLE_KEY   = getEnv('GOOGLE_PLACES_API_KEY');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const LIMIT = parseInt(args[args.indexOf('--limit') + 1] || '200');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function sbFetch(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const opts = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'PATCH' ? 'return=minimal' : '',
      }
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function googleSearch(name, city, state) {
  return new Promise((resolve) => {
    const query = encodeURIComponent(`${name} ${city} ${state}`);
    const path = `/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,name,formatted_address,geometry&key=${GOOGLE_KEY}`;
    const req = https.request({ hostname: 'maps.googleapis.com', path }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const result = JSON.parse(d);
          resolve(result?.candidates?.[0] || null);
        } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

async function getUnverified(limit) {
  // Get restaurants with no address AND no lat/lng
  const r = await sbFetch(
    `/rest/v1/restaurants?select=id,name,city,state,slug&address=is.null&lat=is.null&is_approved=eq.true&order=id.asc&limit=${limit}`
  );
  if (r.status !== 200) { console.error('DB fetch error:', r.status, r.data); return []; }
  return Array.isArray(r.data) ? r.data : [];
}

async function updateRestaurant(id, address, lat, lng, placeId) {
  return sbFetch(
    `/rest/v1/restaurants?id=eq.${id}`,
    'PATCH',
    { address, lat, lng, google_place_id: placeId }
  );
}

async function deleteRestaurant(id, slug) {
  return sbFetch(`/rest/v1/restaurants?id=eq.${id}`, 'DELETE');
}

async function run() {
  console.log(`\n📍 Restaurant Verify & Pin`);
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'} | Limit: ${LIMIT}`);
  console.log(`   Strategy: Google Places verify → pin real locations, delete phantoms\n`);

  const restaurants = await getUnverified(LIMIT);
  console.log(`Found ${restaurants.length} unverified restaurants\n`);

  let verified = 0, deleted = 0, errors = 0;

  for (let i = 0; i < restaurants.length; i++) {
    const { id, name, city, state, slug } = restaurants[i];
    process.stdout.write(`[${i+1}/${restaurants.length}] ${name}, ${city} ${state} ... `);

    await sleep(120); // ~8 req/sec, well within free tier

    const place = await googleSearch(name, city, state);

    if (place?.geometry?.location) {
      const { lat, lng } = place.geometry.location;
      const address = place.formatted_address || null;

      process.stdout.write(`✅ FOUND — ${address}\n`);

      if (!DRY_RUN) {
        const r = await updateRestaurant(id, address, lat, lng, place.place_id);
        if (r.status !== 204) {
          process.stdout.write(`   ⚠️  DB update failed: ${r.status}\n`);
          errors++;
        } else {
          verified++;
        }
      } else {
        verified++;
      }
    } else {
      process.stdout.write(`❌ NOT FOUND — deleting\n`);

      if (!DRY_RUN) {
        const r = await deleteRestaurant(id, slug);
        if (r.status !== 204) {
          process.stdout.write(`   ⚠️  Delete failed: ${r.status}\n`);
          errors++;
        } else {
          deleted++;
        }
      } else {
        deleted++;
      }
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✅ Verified & pinned: ${verified}`);
  console.log(`🗑️  Deleted (not found): ${deleted}`);
  console.log(`⚠️  Errors: ${errors}`);
  console.log(`\nRun again to process the next batch.`);
  if (DRY_RUN) console.log(`\n(DRY RUN — no changes made. Remove --dry-run to apply.)`);
}

run().catch(console.error);
