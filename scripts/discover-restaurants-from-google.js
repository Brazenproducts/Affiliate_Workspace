#!/usr/bin/env node
/**
 * discover-restaurants-from-google.js
 *
 * Discovers ALL restaurants in a city from Google Places and adds them to DB.
 * Every record comes in pre-verified with real address + lat/lng.
 * Uses place `types` to auto-tag venue style (fast_food vs sit-down).
 *
 * Display logic:
 *   fast_food / meal_takeaway  → venue_type=counter_service, tip_screen_status=unverified
 *   restaurant (sit-down)      → venue_type=full_service,    tip_screen_status=unverified
 *                                 shown in UI as "Tip expected — help us verify"
 *   Known chains from registry → tip_screen_status set from registry
 *
 * Usage:
 *   node scripts/discover-restaurants-from-google.js --city "Mattoon" --state "IL"
 *   node scripts/discover-restaurants-from-google.js --city "Temecula" --state "CA"
 *   node scripts/discover-restaurants-from-google.js --all   # runs all cities in DB
 *
 * Cost: $0 — Google Places Text Search free tier: 28,500/month
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../skipatip/.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const getEnv = k => { const all = [...env.matchAll(new RegExp(`^${k}=(.+)$`, 'gm'))]; return all[all.length-1]?.[1]?.trim(); };

const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const GOOGLE_KEY   = getEnv('GOOGLE_PLACES_API_KEY');

const args = process.argv.slice(2);
const CITY  = args[args.indexOf('--city')  + 1] || '';
const STATE = args[args.indexOf('--state') + 1] || '';
const ALL_MODE = args.includes('--all');
const DRY_RUN  = args.includes('--dry-run');

// Chains we never seed (show tip screens — we seed them separately as flagged)
const DO_NOT_SEED = new Set([
  'chipotle','panera','starbucks','dutch bros','sweetgreen','shake shack',
  'bluestone lane','colectivo','philz coffee','blue bottle',
  'peet\'s coffee','intelligentsia'
]);

// Known tip-screen chains (from our registry)
const TIP_SCREEN_CHAINS = new Set([
  'jersey mike\'s','five guys','panda express','raising cane\'s',
  'sonic','sonic drive-in','dairy queen','mod pizza','blaze pizza',
  'firehouse subs','mcalister\'s','jason\'s deli','corner bakery',
  'potbelly','einstein bros','bruegger\'s'
]);

// Known no-tip-screen chains
const NO_TIP_SCREEN_CHAINS = new Set([
  'mcdonald\'s','taco bell','burger king','wendy\'s','chick-fil-a',
  'in-n-out','in-n-out burger','whataburger','jack in the box',
  'del taco','carl\'s jr','hardee\'s','culver\'s','arby\'s',
  'popeyes','little caesars','domino\'s','papa john\'s','pizza hut',
  'subway','wingstop','checkers','rally\'s','freddy\'s',
  'habit burger','the habit','el pollo loco','steak \'n shake'
]);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

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
        'Prefer': method === 'POST' ? 'resolution=ignore-duplicates,return=minimal' : '',
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

function googleTextSearch(query, pageToken = null) {
  return new Promise((resolve) => {
    let p = `/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&type=restaurant&key=${GOOGLE_KEY}`;
    if (pageToken) p += `&pagetoken=${pageToken}`;
    const req = https.request({ hostname: 'maps.googleapis.com', path: p }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

function determineVenueType(types = []) {
  if (types.includes('fast_food') || types.includes('meal_takeaway')) return 'counter_service';
  if (types.includes('cafe') || types.includes('bakery')) return 'cafe';
  if (types.includes('bar')) return 'bar';
  return 'full_service'; // default sit-down
}

function determineTipStatus(name, venueType) {
  const lower = name.toLowerCase();
  for (const chain of TIP_SCREEN_CHAINS) {
    if (lower.includes(chain)) return 'tip_screen';
  }
  for (const chain of NO_TIP_SCREEN_CHAINS) {
    if (lower.includes(chain)) return 'no_tip_screen';
  }
  // Full service restaurants almost certainly have tip screens
  if (venueType === 'full_service') return 'unverified';
  return 'unverified';
}

async function getExistingNames(city, state) {
  const r = await sbFetch(
    `/rest/v1/restaurants?select=name&city=ilike.${encodeURIComponent('%'+city+'%')}&state=eq.${state}&limit=1000`
  );
  if (r.status !== 200 || !Array.isArray(r.data)) return new Set();
  return new Set(r.data.map(r => r.name.toLowerCase().trim()));
}

async function getCities() {
  const r = await sbFetch('/rest/v1/restaurants?select=city,state&is_approved=eq.true&limit=50000');
  if (r.status !== 200) return [];
  const seen = new Set();
  return r.data.filter(row => {
    const key = `${row.city}|${row.state}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function discoverCity(city, state) {
  console.log(`\n🔍 Discovering restaurants in ${city}, ${state}`);

  const existing = await getExistingNames(city, state);
  console.log(`   Existing: ${existing.size} restaurants already in DB`);

  const query = `restaurants in ${city} ${state}`;
  let added = 0, skipped = 0, pageToken = null;
  let page = 0;

  do {
    if (page > 0) await sleep(2000); // Google requires 2s between page_token requests
    page++;

    const result = await googleTextSearch(query, pageToken);
    if (!result || result.status === 'REQUEST_DENIED') {
      console.log(`   ❌ API error: ${result?.status} ${result?.error_message}`);
      break;
    }

    const places = result.results || [];
    console.log(`   Page ${page}: ${places.length} results`);

    for (const place of places) {
      const name = place.name;
      const lower = name.toLowerCase().trim();

      // Skip DO_NOT_SEED chains
      let skip = false;
      for (const chain of DO_NOT_SEED) {
        if (lower.includes(chain)) { skip = true; break; }
      }
      if (skip) { skipped++; continue; }

      // Skip if already in DB
      if (existing.has(lower)) { skipped++; continue; }

      const address = place.formatted_address || null;
      const lat = place.geometry?.location?.lat || null;
      const lng = place.geometry?.location?.lng || null;
      const types = place.types || [];
      const venueType = determineVenueType(types);
      const tipStatus = determineTipStatus(name, venueType);

      // Build slug (unique)
      const baseSlug = `${slugify(name)}-${slugify(city)}-${state.toLowerCase()}`;
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2,6)}`;

      const record = {
        name,
        slug,
        city,
        state,
        address,
        lat,
        lng,
        venue_type: venueType,
        tip_screen_status: tipStatus,
        is_approved: true,
        is_certified: false,
        is_featured: false,
        is_founding_member: false,
      };

      if (!DRY_RUN) {
        const r = await sbFetch('/rest/v1/restaurants', 'POST', record);
        if (r.status === 201 || r.status === 200) {
          added++;
          existing.add(lower);
          process.stdout.write(`   ✅ Added: ${name} (${venueType}, ${tipStatus})\n`);
        } else {
          process.stdout.write(`   ⚠️  Failed to add ${name}: ${r.status}\n`);
        }
      } else {
        added++;
        process.stdout.write(`   [DRY] Would add: ${name} (${venueType}, ${tipStatus}) — ${address}\n`);
      }

      await sleep(50);
    }

    pageToken = result.next_page_token || null;
  } while (pageToken && page < 3); // max 3 pages = 60 results per city

  console.log(`   Done: +${added} added, ${skipped} skipped`);
  return added;
}

async function run() {
  console.log(`\n🗺️  Google Places Restaurant Discovery`);
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`   DO NOT SEED: ${[...DO_NOT_SEED].join(', ')}\n`);

  if (!GOOGLE_KEY || GOOGLE_KEY.includes('YOUR_KEY')) {
    console.error('❌ No valid GOOGLE_PLACES_API_KEY found'); process.exit(1);
  }

  if (ALL_MODE) {
    const cities = await getCities();
    console.log(`Running for ${cities.length} cities...\n`);
    let total = 0;
    for (const { city, state } of cities) {
      total += await discoverCity(city, state);
      await sleep(500);
    }
    console.log(`\n🎉 Total added: ${total}`);
  } else if (CITY && STATE) {
    await discoverCity(CITY, STATE);
  } else {
    console.log('Usage:');
    console.log('  node scripts/discover-restaurants-from-google.js --city "Mattoon" --state "IL"');
    console.log('  node scripts/discover-restaurants-from-google.js --all');
    console.log('  Add --dry-run to preview without writing');
  }
}

run().catch(console.error);
