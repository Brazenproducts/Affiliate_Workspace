#!/usr/bin/env node
/**
 * GROK BUSINESS EXPANDER — Add ALL business types to RecentRatings
 *
 * Current state: 519,826 places in DB, almost all restaurants.
 * Goal: expand to every rankable local business category.
 *
 * Grok approach: Instead of crawling Google Places API city-by-city
 * (450 calls/day limit), use Grok live search to pull complete
 * business lists per category per city in a single API call.
 *
 * One Grok call = ~20-50 businesses found per category per city.
 * At 50 cities/day × 10 categories = 500 Grok calls = ~10,000 new businesses/day.
 * Google API approach would take years for the same coverage.
 *
 * CATEGORIES SUPPORTED:
 *   restaurant, bar, cafe, bakery, hotel, spa, salon, barbershop,
 *   gym, dentist, doctor, urgent_care, vet, pharmacy, auto_repair,
 *   car_wash, tire_shop, gas_station, grocery, supermarket,
 *   laundry, dry_cleaner, bank, atm, post_office, library,
 *   movie_theater, bowling, golf, yoga, pilates, massage,
 *   nail_salon, tattoo, piercing, escape_room, axe_throwing
 *
 * Usage:
 *   node grok-business-expander.js --city="Austin" --state="TX" --categories=all
 *   node grok-business-expander.js --city="Austin" --state="TX" --categories=spa,salon,gym
 *   node grok-business-expander.js --from-queue --limit=10  (process cities from queue)
 */

const fs = require('fs');

const GROK_KEY = 'xai-S5hLItB2sSmg3xR10q6UPzUvlTjDKA1riY44VljVHiZP7jQrTBVhI8QkZvo7OuuLd1VPctYX560cHhhr';
const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const env = {};
fs.readFileSync(`${WORKSPACE}/skipatip/.env.local`, 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const args = Object.fromEntries(
  process.argv.slice(2).filter(a => a.startsWith('--')).map(a => a.slice(2).split('='))
);
const CITY       = args.city || null;
const STATE      = args.state || null;
const FROM_QUEUE = args['from-queue'] !== undefined;
const QUEUE_LIMIT = parseInt(args.limit || '5');
const DRY_RUN    = args['dry-run'] === 'true';

const ALL_CATEGORIES = [
  'restaurant', 'bar', 'cafe', 'bakery', 'food_truck',
  'hotel', 'motel', 'vacation_rental',
  'spa', 'nail_salon', 'hair_salon', 'barbershop', 'tattoo', 'massage',
  'gym', 'yoga', 'pilates', 'crossfit', 'personal_trainer',
  'dentist', 'doctor', 'urgent_care', 'chiropractor', 'vet', 'pharmacy',
  'auto_repair', 'car_wash', 'tire_shop', 'oil_change', 'towing',
  'grocery', 'supermarket', 'convenience_store',
  'laundry', 'dry_cleaner',
  'bank', 'credit_union',
  'movie_theater', 'bowling', 'golf', 'escape_room', 'axe_throwing', 'trampoline_park',
  'tutoring', 'music_school', 'martial_arts',
  'pet_grooming', 'dog_daycare',
  'moving_company', 'storage',
  'florist', 'wedding_venue', 'event_venue',
  'photographer', 'videographer',
  'real_estate', 'mortgage', 'insurance',
  'attorney', 'accountant',
  'plumber', 'electrician', 'hvac', 'roofer', 'landscaper', 'pool_service', 'handyman',
];

const reqCats = args.categories === 'all' || !args.categories
  ? ALL_CATEGORIES
  : args.categories.split(',').map(c => c.trim());

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function supaFetch(path, opts = {}) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': opts.prefer || 'return=minimal',
    },
    ...opts,
  });
  return resp.json();
}

async function grokSearch(prompt) {
  // New endpoint: POST /v1/responses with tools:[{type:"web_search"}] (old search_parameters is 410)
  const resp = await fetch('https://api.x.ai/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROK_KEY}` },
    body: JSON.stringify({
      model: 'grok-4',
      tools: [{ type: 'web_search' }],
      input: prompt,
      max_output_tokens: 4000,
    }),
  });
  const d = await resp.json();
  const outputItem = Array.isArray(d.output) ? d.output.find(o => o.type === 'message') : null;
  return outputItem?.content?.[0]?.text || d.output_text || d.error?.message || '';
}

function slugify(name, city, state) {
  return `${name}-${city}-${state}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 120);
}

// ─── TIP-FREE CLASSIFICATION ──────────────────────────────────────────────────
const TIP_FREE_CATEGORIES = new Set([
  'auto_repair', 'car_wash', 'tire_shop', 'oil_change', 'towing',
  'grocery', 'supermarket', 'convenience_store',
  'laundry', 'dry_cleaner',
  'bank', 'credit_union',
  'pharmacy', 'urgent_care', 'doctor', 'dentist', 'chiropractor', 'vet',
  'movie_theater', 'escape_room', 'axe_throwing', 'trampoline_park', 'bowling', 'golf',
  'moving_company', 'storage',
  'florist', 'real_estate', 'mortgage', 'insurance', 'attorney', 'accountant',
  'plumber', 'electrician', 'hvac', 'roofer', 'landscaper', 'pool_service', 'handyman',
  'tutoring', 'music_school', 'martial_arts',
  'pet_grooming', 'dog_daycare',
  'hotel', 'motel', // hotels have mandatory tip structure, not tip screen
  'photographer', 'videographer', 'wedding_venue', 'event_venue',
]);

function isCategoryTipFree(cat) {
  return TIP_FREE_CATEGORIES.has(cat) ? true : null; // null = unknown (needs check)
}

// ─── PULL BUSINESSES VIA GROK ────────────────────────────────────────────────
async function getBusinessesForCity(city, state, categories) {
  // Batch categories into groups of 8 per Grok call
  const CATS_PER_CALL = 8;
  const allPlaces = [];

  for (let i = 0; i < categories.length; i += CATS_PER_CALL) {
    const catBatch = categories.slice(i, i + CATS_PER_CALL);
    console.log(`  🔍 Grok search: ${catBatch.join(', ')} in ${city}, ${state}`);

    const prompt = `Search Google Maps and Yelp RIGHT NOW for businesses in ${city}, ${state}.

For each category below, find the top 15 most-reviewed businesses currently operating.

Categories: ${catBatch.join(', ')}

Return ONLY a valid JSON array. Each item:
{
  "name": "Business Name",
  "category": "exact category from list",
  "address": "full street address",
  "city": "${city}",
  "state": "${state}",
  "state_code": "${state}",
  "phone": "phone number or null",
  "website": "URL or null",
  "google_rating": 4.2,
  "google_review_count": 847,
  "price_level": 2,
  "permanently_closed": false,
  "lat": 30.2672,
  "lng": -97.7431
}

Only include REAL, currently open businesses you can verify exist on Google Maps or Yelp.
No chains with 1000+ locations (McDonald's etc.) — focus on local/regional businesses.
No markdown. Raw JSON array only.`;

    const raw = await grokSearch(prompt);

    try {
      const clean = raw.replace(/```json\n?|```\n?/g, '').trim();
      const match = clean.match(/\[[\s\S]*\]/);
      if (match) {
        const batch = JSON.parse(match[0]);
        allPlaces.push(...batch);
        console.log(`    Found ${batch.length} businesses`);
      }
    } catch (e) {
      console.warn(`    ⚠️ Parse failed: ${raw.substring(0, 100)}`);
    }

    await delay(1500);
  }

  return allPlaces;
}

// ─── SAVE TO SUPABASE ────────────────────────────────────────────────────────
async function savePlaces(places, city, state) {
  const CHUNK = 50;
  let saved = 0;

  const normalized = places
    .filter(p => p.name && p.city)
    .map(p => ({
      name: p.name,
      slug: slugify(p.name, p.city || city, p.state_code || state),
      address: p.address,
      city: p.city || city,
      state: p.state || state,
      state_code: p.state_code || state,
      lat: p.lat || null,
      lng: p.lng || null,
      phone: p.phone || null,
      website: p.website || null,
      google_rating: p.google_rating || null,
      google_review_count: p.google_review_count || 0,
      price_level: p.price_level || null,
      business_category: p.category || 'other',
      primary_category: p.category,
      is_permanently_closed: p.permanently_closed || false,
      is_tip_free: isCategoryTipFree(p.category),
      source: 'grok',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

  for (let i = 0; i < normalized.length; i += CHUNK) {
    const chunk = normalized.slice(i, i + CHUNK);
    const result = await supaFetch('places_raw', {
      method: 'POST',
      prefer: 'resolution=merge-duplicates,return=minimal',
      body: JSON.stringify(chunk),
    });
    saved += chunk.length;
  }

  return saved;
}

// ─── QUEUE MODE: pull pending cities ─────────────────────────────────────────
async function getPendingCities(limit) {
  const data = await supaFetch(
    `collection_queue?status=eq.pending&order=priority.desc,population.desc&limit=${limit}&select=city,state,state_code,lat,lng`
  );
  return Array.isArray(data) ? data : [];
}

async function markCityDone(city, state) {
  await supaFetch(`collection_queue?city=eq.${encodeURIComponent(city)}&state_code=eq.${state}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'done', last_run_at: new Date().toISOString() }),
  });
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  const date = new Date().toISOString().split('T')[0];
  console.log(`\n🚀 Grok Business Expander — ${date}`);
  console.log(`   Categories: ${reqCats.length} | Mode: ${FROM_QUEUE ? 'queue' : 'direct'}\n`);

  let citiesToProcess = [];

  if (FROM_QUEUE) {
    citiesToProcess = await getPendingCities(QUEUE_LIMIT);
    console.log(`📋 Pulled ${citiesToProcess.length} cities from queue\n`);
  } else if (CITY && STATE) {
    citiesToProcess = [{ city: CITY, state_code: STATE }];
  } else {
    console.error('❌ Need --city and --state, or --from-queue');
    process.exit(1);
  }

  let totalSaved = 0;

  for (const cityRow of citiesToProcess) {
    const { city, state_code: state } = cityRow;
    console.log(`\n🏙️  Processing: ${city}, ${state}`);

    const places = await getBusinessesForCity(city, state, reqCats);
    console.log(`  Total found: ${places.length}`);

    if (!DRY_RUN && places.length > 0) {
      const saved = await savePlaces(places, city, state);
      totalSaved += saved;
      console.log(`  ✅ Saved: ${saved}`);

      if (FROM_QUEUE) await markCityDone(city, state);
    }

    await delay(2000);
  }

  const summary = `✅ Grok Business Expander: ${citiesToProcess.length} cities → ${totalSaved} places saved`;
  console.log(`\n${summary}`);

  fs.writeFileSync(`${WORKSPACE}/memory/grok-expander-state.json`, JSON.stringify({
    lastRun: new Date().toISOString(), cities: citiesToProcess.length, placed: totalSaved
  }, null, 2));
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
