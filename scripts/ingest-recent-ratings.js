#!/usr/bin/env node
/**
 * ingest-recent-ratings.js
 * Pulls Google Places ratings for restaurants in the DB and stores in recent_ratings.
 * Zero AI tokens — pure Google Places API + Supabase REST.
 *
 * Usage:
 *   node scripts/ingest-recent-ratings.js                    # process 200 restaurants
 *   node scripts/ingest-recent-ratings.js --limit 500        # process 500
 *   node scripts/ingest-recent-ratings.js --city "Austin" --state "TX"  # specific city
 *   node scripts/ingest-recent-ratings.js --force            # re-fetch even if recent
 *
 * Cost: ~$17 per 1,000 restaurants (Google Places Details API)
 * Free tier: 1,000 requests/month free — use --limit 900 to stay free
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

// ─── Config ──────────────────────────────────────────────────────────────────
const envPath = path.join(__dirname, '../skipatip/.env.local')
const env = fs.readFileSync(envPath, 'utf8')
const getEnv = (key) => {
  const matches = [...env.matchAll(new RegExp(`^${key}=(.+)$`, 'gm'))]
  return matches.length ? matches[matches.length - 1][1].trim() : null
}

const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const SUPABASE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY')
const GOOGLE_KEY   = getEnv('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')

if (!SUPABASE_URL || !SUPABASE_KEY || !GOOGLE_KEY) {
  console.error('Missing env vars. Check skipatip/.env.local')
  process.exit(1)
}

// ─── Args ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const LIMIT  = parseInt(args[args.indexOf('--limit') + 1]  || '200')
const CITY   = args[args.indexOf('--city') + 1]  || null
const STATE  = args[args.indexOf('--state') + 1] || null
const FORCE  = args.includes('--force')
const STALE_DAYS = 7 // re-fetch if older than this

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', d => data += d)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch(e) { reject(e) }
      })
    }).on('error', reject)
  })
}

function supabaseRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path)
    const bodyStr = body ? JSON.stringify(body) : null
    const opts = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'resolution=merge-duplicates,return=minimal' : 'return=representation',
      }
    }
    const req = https.request(opts, (res) => {
      let data = ''
      res.on('data', d => data += d)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null }) }
        catch(e) { resolve({ status: res.statusCode, data }) }
      })
    })
    req.on('error', reject)
    if (bodyStr) req.write(bodyStr)
    req.end()
  })
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ─── Google Places helpers ────────────────────────────────────────────────────
async function findPlaceId(name, city, state) {
  const query = encodeURIComponent(`${name} ${city} ${state}`)
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,name,rating,user_ratings_total&key=${GOOGLE_KEY}`
  const res = await fetchJson(url)
  if (res.status === 'OK' && res.candidates?.length > 0) {
    return res.candidates[0]
  }
  return null
}

async function getPlaceDetails(placeId) {
  const fields = 'place_id,name,rating,user_ratings_total,price_level'
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_KEY}`
  const res = await fetchJson(url)
  if (res.status === 'OK') return res.result
  return null
}

// ─── Combined score formula ───────────────────────────────────────────────────
// Google 40% + Yelp 35% + (no Facebook for now = redistribute)
// Without Yelp: Google 100% of what we have
// With Yelp: Google 53% + Yelp 47%
function calcCombined(googleRating, yelpRating) {
  if (!googleRating && !yelpRating) return null
  if (googleRating && !yelpRating) return Math.round(googleRating * 10) / 10
  if (!googleRating && yelpRating) return Math.round(yelpRating * 10) / 10
  const combined = (googleRating * 0.53) + (yelpRating * 0.47)
  return Math.round(combined * 10) / 10
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n⭐ Combined Ratings Ingestion')
  console.log(`   Limit: ${LIMIT} | City: ${CITY || 'all'} | Force: ${FORCE}\n`)

  // 1. Fetch restaurants that need ratings
  let query = `/rest/v1/restaurants?select=slug,name,city,state,google_place_id,google_rating&is_approved=eq.true&address=not.is.null&order=created_at.asc&limit=${LIMIT}`
  if (CITY) query += `&city=eq.${encodeURIComponent(CITY)}`
  if (STATE) query += `&state=eq.${encodeURIComponent(STATE)}`

  const { data: restaurants } = await supabaseRequest('GET', query)
  if (!restaurants?.length) { console.log('No restaurants found.'); return }

  // 2. Get already-ingested slugs (skip if fresh)
  const staleDate = new Date(Date.now() - STALE_DAYS * 86400000).toISOString()
  const { data: existing } = await supabaseRequest('GET',
    `/rest/v1/recent_ratings?select=restaurant_slug,fetched_at&fetched_at=gte.${staleDate}`)
  const freshSlugs = new Set((existing || []).map(r => r.restaurant_slug))

  const toProcess = FORCE
    ? restaurants
    : restaurants.filter(r => !freshSlugs.has(r.slug))

  console.log(`   ${restaurants.length} fetched, ${toProcess.length} need ingestion\n`)

  let done = 0, skipped = 0, errors = 0

  for (const r of toProcess) {
    try {
      // Use existing google_place_id or find it
      let placeId = r.google_place_id
      let googleRating = r.google_rating
      let reviewCount = null

      if (!placeId) {
        const found = await findPlaceId(r.name, r.city, r.state)
        if (found) {
          placeId = found.place_id
          googleRating = found.rating || null
          reviewCount = found.user_ratings_total || null
          // Save place_id back to restaurants table
          await supabaseRequest('PATCH',
            `/rest/v1/restaurants?slug=eq.${encodeURIComponent(r.slug)}`,
            { google_place_id: placeId, google_rating: googleRating, google_review_count: reviewCount }
          )
        }
        await sleep(200) // FindPlace costs money — be careful
      } else if (placeId) {
        const details = await getPlaceDetails(placeId)
        if (details) {
          googleRating = details.rating || googleRating
          reviewCount = details.user_ratings_total || null
        }
        await sleep(100)
      }

      if (!googleRating) { skipped++; continue }

      const combined = calcCombined(googleRating, null) // Yelp integration later

      const record = {
        restaurant_slug: r.slug,
        restaurant_name: r.name,
        city: r.city,
        state: r.state,
        google_place_id: placeId || null,
        google_rating_alltime: googleRating,
        google_rating_365d: null, // requires review-level data — future
        google_rating_90d: null,  // requires review-level data — future
        google_review_count: reviewCount,
        combined_score_alltime: combined,
        combined_score_365d: null,
        combined_score_90d: null,
        fetched_at: new Date().toISOString(),
      }

      await supabaseRequest('POST', '/rest/v1/recent_ratings', record)
      done++

      if (done % 25 === 0) {
        console.log(`   [${done}/${toProcess.length}] ${r.name}, ${r.city} ${r.state} → ⭐${googleRating}`)
      }

    } catch(e) {
      errors++
      console.log(`   ⚠️  Error on ${r.name}: ${e.message}`)
    }
  }

  console.log(`\n✅ Done — ${done} ingested, ${skipped} skipped (no rating), ${errors} errors`)
  console.log(`   Run again tomorrow to keep ratings fresh.`)
}

main().catch(console.error)
