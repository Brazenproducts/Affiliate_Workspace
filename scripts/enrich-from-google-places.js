#!/usr/bin/env node
/**
 * enrich-from-google-places.js
 *
 * Backfills Google Places data for every restaurant in the DB:
 *   - google_place_id, google_rating, google_review_count
 *   - google_photo_url, google_price_level
 *   - hours (open/close per day as JSON)
 *   - has_outdoor_seating (from place types/attributes)
 *   - lat/lng (if still missing)
 *   - phone, website (if missing)
 *
 * Cost: $0 — uses the free tier (28,500 req/month included)
 * Rate limit: 10 req/sec max. We run at ~2/sec to be safe.
 *
 * Usage:
 *   node scripts/enrich-from-google-places.js               # all missing
 *   node scripts/enrich-from-google-places.js --chain="Taco Bell"
 *   node scripts/enrich-from-google-places.js --state=CA
 *   node scripts/enrich-from-google-places.js --limit=200
 *   node scripts/enrich-from-google-places.js --dry-run
 *
 * Requires: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in skipatip/.env.local
 */

const https = require('https');
const path = require('path');
const fs = require('fs');
const { createClient } = require(path.join(__dirname, '..', 'skipatip', 'node_modules', '@supabase', 'supabase-js'));

const envFile = fs.readFileSync(path.join(__dirname, '..', 'skipatip', '.env.local'), 'utf8');
const SUPABASE_URL = 'https://zqmepfdghljknyojfsmq.supabase.co';
const SERVICE_KEY = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim();
const GOOGLE_KEY  = envFile.match(/NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=(.+)/)?.[1]?.trim()
  || envFile.match(/GOOGLE_MAPS_API_KEY=(.+)/)?.[1]?.trim();

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const args    = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const CHAIN   = args.find(a => a.startsWith('--chain='))?.split('=').slice(1).join('=');
const STATE   = args.find(a => a.startsWith('--state='))?.split('=')[1];
const LIMIT   = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '200');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function googleGet(url) {
  return new Promise((resolve) => {
    https.get(url, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(null); } });
    }).on('error', () => resolve(null)).setTimeout(10000, function() { this.destroy(); resolve(null); });
  });
}

async function findPlace(name, city, state) {
  // Text Search: "McDonald's Temecula CA"
  const q = encodeURIComponent(`${name} ${city} ${state}`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${q}&type=restaurant&key=${GOOGLE_KEY}`;
  const data = await googleGet(url);
  return data?.results?.[0] || null;
}

async function getPlaceDetails(placeId) {
  const fields = 'place_id,rating,user_ratings_total,price_level,photos,opening_hours,formatted_phone_number,website,geometry,types';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_KEY}`;
  const data = await googleGet(url);
  return data?.result || null;
}

function extractHours(openingHours) {
  if (!openingHours?.periods) return null;
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const hours = {};
  for (const period of openingHours.periods) {
    const day = days[period.open?.day];
    if (!day) continue;
    hours[day] = {
      open:  period.open?.time  ? `${period.open.time.slice(0,2)}:${period.open.time.slice(2)}` : null,
      close: period.close?.time ? `${period.close.time.slice(0,2)}:${period.close.time.slice(2)}` : null,
    };
  }
  return Object.keys(hours).length ? hours : null;
}

async function main() {
  if (!GOOGLE_KEY) { console.error('❌ No Google Maps API key found in .env.local'); process.exit(1); }

  console.log(`\n🗺  Google Places Enrichment`);
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE WRITE'} | Limit: ${LIMIT}`);
  if (CHAIN) console.log(`   Chain: ${CHAIN}`);
  if (STATE) console.log(`   State: ${STATE}`);

  // Fetch restaurants missing google_place_id
  let query = supabase
    .from('restaurants')
    .select('id, name, city, state, lat, lng, phone, website')
    .is('google_place_id', null)
    .eq('is_approved', true)
    .limit(LIMIT);
  if (CHAIN) query = query.eq('name', CHAIN);
  if (STATE) query = query.eq('state', STATE);

  const { data: restaurants, error } = await query;
  if (error) { console.error('DB error:', error); process.exit(1); }
  console.log(`\nFound ${restaurants.length} restaurants to enrich\n`);

  let updated = 0, failed = 0;

  for (let i = 0; i < restaurants.length; i++) {
    const r = restaurants[i];
    process.stdout.write(`[${i+1}/${restaurants.length}] ${r.name} — ${r.city}, ${r.state} ... `);
    await sleep(500); // ~2 req/sec

    const place = await findPlace(r.name, r.city, r.state);
    if (!place) { console.log('❌ not found'); failed++; continue; }

    const details = await getPlaceDetails(place.place_id);
    await sleep(500);

    if (!details) { console.log('⚠ details failed'); failed++; continue; }

    const photoUrl = details.photos?.[0]
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${details.photos[0].photo_reference}&key=${GOOGLE_KEY}`
      : null;

    const hours = extractHours(details.opening_hours);
    const hasOutdoor = (details.types || []).includes('outdoor_seating') ||
      (details.opening_hours?.weekday_text || []).join('').toLowerCase().includes('outdoor');

    const update = {
      google_place_id:     details.place_id,
      google_rating:       details.rating || null,
      google_review_count: details.user_ratings_total || null,
      google_price_level:  details.price_level || null,
      google_photo_url:    photoUrl,
      ...(hours ? { hours } : {}),
      ...(hasOutdoor ? { has_outdoor_seating: true } : {}),
      ...(details.geometry?.location?.lat && !r.lat ? { lat: details.geometry.location.lat, lng: details.geometry.location.lng } : {}),
      ...(details.formatted_phone_number && !r.phone ? { phone: details.formatted_phone_number } : {}),
      ...(details.website && !r.website ? { website: details.website } : {}),
    };

    console.log(`✓ ⭐${details.rating || '?'} (${details.user_ratings_total || 0} reviews)${photoUrl ? ' 📷' : ''}${hours ? ' 🕐' : ''}`);

    if (!DRY_RUN) {
      const { error: upErr } = await supabase.from('restaurants').update(update).eq('id', r.id);
      if (upErr) { console.error(`  ⚠ ${upErr.message}`); failed++; } else { updated++; }
    } else {
      updated++;
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✅ Enriched: ${updated} | ❌ Failed: ${failed}`);
  if (restaurants.length === LIMIT) console.log(`⚠  Hit limit (${LIMIT}) — run again to continue`);
}

main().catch(console.error);
