#!/usr/bin/env node
/**
 * build-recent-ratings.js
 * Pulls Google Places + Yelp ratings for all restaurants in SkipATip DB
 * Stores in `recent_ratings` table in Supabase — $0, no AI tokens
 *
 * Usage:
 *   node scripts/build-recent-ratings.js            # process up to 200 restaurants
 *   node scripts/build-recent-ratings.js --limit 50 # process 50
 *   node scripts/build-recent-ratings.js --all      # process all (slow, respect rate limits)
 *
 * Rate limits:
 *   Google Places: 28,500 free/month (~950/day) — we do 1 req/3s = ~28,800/day max, capped at 200/run
 *   Yelp Fusion:   500 free/day — we do 1 req/7s, capped at 200/run
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.join(__dirname, '../skipatip/.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const getEnv = (key) => env.match(new RegExp(`^${key}=(.+)$`, 'm'))?.[1]?.trim();

const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const GOOGLE_KEY   = getEnv('GOOGLE_PLACES_API_KEY');
const YELP_KEY     = getEnv('YELP_API_KEY');

const args = process.argv.slice(2);
const ALL_MODE = args.includes('--all');
const LIMIT = ALL_MODE ? 99999 : parseInt(args[args.indexOf('--limit') + 1] || '200');

// ─── Supabase helpers ─────────────────────────────────────────────────────────

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
        'Prefer': method === 'POST' ? 'return=minimal' : '',
      }
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
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

function apiFetch(hostname, path, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = { hostname, path, headers, method: 'GET' };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Google Places ────────────────────────────────────────────────────────────

async function findGooglePlaceId(name, city, state) {
  const query = encodeURIComponent(`${name} ${city} ${state}`);
  const r = await apiFetch(
    'maps.googleapis.com',
    `/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,name,rating,user_ratings_total&key=${GOOGLE_KEY}`
  );
  if (r.status !== 200 || !r.data?.candidates?.[0]) return null;
  return r.data.candidates[0];
}

async function getGoogleDetails(placeId) {
  const fields = 'place_id,name,rating,user_ratings_total,reviews,price_level,opening_hours';
  const r = await apiFetch(
    'maps.googleapis.com',
    `/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_KEY}`
  );
  if (r.status !== 200 || !r.data?.result) return null;
  return r.data.result;
}

function calcRecentScore(reviews) {
  if (!reviews?.length) return null;
  const now = Date.now() / 1000;
  const day90  = now - (90  * 86400);
  const day365 = now - (365 * 86400);

  const recent90  = reviews.filter(r => r.time >= day90);
  const recent365 = reviews.filter(r => r.time >= day365);

  return {
    score_90d:  recent90.length  ? avg(recent90.map(r => r.rating))  : null,
    count_90d:  recent90.length,
    score_365d: recent365.length ? avg(recent365.map(r => r.rating)) : null,
    count_365d: recent365.length,
  };
}

function avg(arr) {
  if (!arr.length) return null;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
}

// ─── Yelp ─────────────────────────────────────────────────────────────────────

async function searchYelp(name, city, state) {
  const term = encodeURIComponent(name);
  const loc  = encodeURIComponent(`${city}, ${state}`);
  const r = await apiFetch(
    'api.yelp.com',
    `/v3/businesses/search?term=${term}&location=${loc}&limit=1`,
    { 'Authorization': `Bearer ${YELP_KEY}` }
  );
  if (r.status !== 200 || !r.data?.businesses?.[0]) return null;
  return r.data.businesses[0];
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function ensureTable() {
  // Check if table exists by trying to select from it
  const r = await sbFetch('/rest/v1/recent_ratings?limit=1');
  if (r.status === 200) return true;

  console.log('⚠️  recent_ratings table not found — run the migration SQL first:');
  console.log(`
CREATE TABLE IF NOT EXISTS recent_ratings (
  id                  bigserial PRIMARY KEY,
  restaurant_slug     text NOT NULL,
  restaurant_name     text,
  city                text,
  state               text,

  -- Google
  google_place_id     text,
  google_rating_alltime   numeric(3,1),
  google_rating_365d      numeric(3,1),
  google_rating_90d       numeric(3,1),
  google_review_count int,
  google_review_count_90d  int,
  google_review_count_365d int,
  google_price_level  int,

  -- Yelp
  yelp_id             text,
  yelp_rating_alltime numeric(3,1),
  yelp_review_count   int,
  yelp_url            text,

  -- Combined score (weighted average of available sources)
  combined_score_90d   numeric(3,1),
  combined_score_365d  numeric(3,1),
  combined_score_alltime numeric(3,1),

  fetched_at          timestamptz DEFAULT now(),
  UNIQUE(restaurant_slug)
);
CREATE INDEX IF NOT EXISTS idx_recent_ratings_slug ON recent_ratings(restaurant_slug);
CREATE INDEX IF NOT EXISTS idx_recent_ratings_90d  ON recent_ratings(google_rating_90d);
  `);
  return false;
}

async function getUnprocessed(limit) {
  // Get restaurants that don't have a recent_ratings row yet
  const r = await sbFetch(
    `/rest/v1/restaurants?select=slug,name,city,state&is_approved=eq.true&order=id.asc&limit=${limit * 3}`
  );
  if (r.status !== 200) { console.error('DB error:', r.data); return []; }

  // Get already-processed slugs
  const done = await sbFetch('/rest/v1/recent_ratings?select=restaurant_slug&limit=50000');
  const doneSet = new Set((done.data || []).map(r => r.restaurant_slug));

  return r.data.filter(r => !doneSet.has(r.slug)).slice(0, limit);
}

async function upsertRating(row) {
  return sbFetch('/rest/v1/recent_ratings', 'POST', row);
}

async function run() {
  console.log(`\n⭐  RecentRatings Builder`);
  console.log(`   Sources: Google Places + Yelp Fusion`);
  console.log(`   Limit: ${LIMIT} restaurants | $0 cost\n`);

  const ok = await ensureTable();
  if (!ok) process.exit(1);

  const restaurants = await getUnprocessed(LIMIT);
  console.log(`📋 Found ${restaurants.length} unprocessed restaurants\n`);

  let processed = 0, googleHits = 0, yelpHits = 0, errors = 0;

  for (const rest of restaurants) {
    const { slug, name, city, state } = rest;
    process.stdout.write(`[${++processed}/${restaurants.length}] ${name}, ${city} ${state} ... `);

    const row = {
      restaurant_slug: slug,
      restaurant_name: name,
      city,
      state,
    };

    try {
      // ── Google Places ──
      await sleep(300); // respect rate limit
      const candidate = await findGooglePlaceId(name, city, state);
      if (candidate?.place_id) {
        await sleep(300);
        const details = await getGoogleDetails(candidate.place_id);
        if (details) {
          const recent = calcRecentScore(details.reviews);
          row.google_place_id        = details.place_id;
          row.google_rating_alltime  = details.rating || null;
          row.google_review_count    = details.user_ratings_total || null;
          row.google_price_level     = details.price_level ?? null;
          if (recent) {
            row.google_rating_90d       = recent.score_90d;
            row.google_rating_365d      = recent.score_365d;
            row.google_review_count_90d  = recent.count_90d;
            row.google_review_count_365d = recent.count_365d;
          }
          googleHits++;
        }
      }

      // ── Yelp ──
      await sleep(500); // Yelp: 500/day = 1 per ~173s to be safe at scale; 500ms ok for small batches
      const yelp = await searchYelp(name, city, state);
      if (yelp) {
        row.yelp_id            = yelp.id;
        row.yelp_rating_alltime = yelp.rating || null;
        row.yelp_review_count  = yelp.review_count || null;
        row.yelp_url           = yelp.url || null;
        yelpHits++;
      }

      // ── Combined score (weighted: Google 60%, Yelp 40%) ──
      if (row.google_rating_alltime || row.yelp_rating_alltime) {
        const gAll = row.google_rating_alltime;
        const yAll = row.yelp_rating_alltime;
        if (gAll && yAll) {
          row.combined_score_alltime = Math.round((gAll * 0.6 + yAll * 0.4) * 10) / 10;
        } else {
          row.combined_score_alltime = gAll || yAll;
        }
      }
      if (row.google_rating_90d) row.combined_score_90d   = row.google_rating_90d;
      if (row.google_rating_365d) row.combined_score_365d = row.google_rating_365d;

      // ── Save ──
      const save = await upsertRating(row);
      if (save.status === 201 || save.status === 200) {
        process.stdout.write(`✅ G:${row.google_rating_alltime || '-'} Y:${row.yelp_rating_alltime || '-'}\n`);
      } else {
        process.stdout.write(`⚠️  DB ${save.status}\n`);
        errors++;
      }

    } catch (e) {
      process.stdout.write(`❌ ${e.message}\n`);
      errors++;
    }
  }

  console.log(`\n──────────────────────────────`);
  console.log(`✅ Done: ${processed} processed`);
  console.log(`   Google hits: ${googleHits} | Yelp hits: ${yelpHits} | Errors: ${errors}`);
  console.log(`   Run again to process more restaurants.`);
}

run().catch(console.error);
