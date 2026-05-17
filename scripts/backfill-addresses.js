// backfill-addresses.js
// Finds restaurants with duplicate name+city, looks up addresses via OSM Nominatim, updates Supabase
// Rate limited to 1 req/sec per OSM policy. Zero AI cost.

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args))

const BASE = 'https://zqmepfdghljknyojfsmq.supabase.co'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbWVwZmRnaGxqa255b2pmc21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MzY4MjQsImV4cCI6MjA5NDExMjgyNH0.5iSZ8j78oIVTHEwL09FD5w-qnYHvY2OAQaLlhOxWcsc'
const HEADERS = { apikey: KEY, Authorization: 'Bearer ' + KEY }

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function getAllDuplicates() {
  // Fetch all restaurants with null address in batches
  let all = []
  let offset = 0
  const batchSize = 1000
  while (true) {
    const r = await fetch(`${BASE}/rest/v1/restaurants?is_approved=eq.true&address=is.null&select=id,name,city,state&limit=${batchSize}&offset=${offset}`, { headers: HEADERS })
    const d = await r.json()
    if (!d.length) break
    all = all.concat(d)
    offset += batchSize
    if (d.length < batchSize) break
  }
  console.log(`Total null-address restaurants: ${all.length}`)

  // Find duplicate name+city combos
  const groups = {}
  for (const r of all) {
    const k = `${r.name}|${r.city}|${r.state}`
    if (!groups[k]) groups[k] = []
    groups[k].push(r)
  }

  const dupes = Object.entries(groups).filter(([, v]) => v.length > 1)
  console.log(`Duplicate name+city groups: ${dupes.length}`)
  return dupes
}

async function nominatimSearch(name, city, state) {
  const q = encodeURIComponent(`${name}, ${city}, ${state}, USA`)
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&addressdetails=1&limit=5&countrycodes=us`
  const r = await fetch(url, {
    headers: { 'User-Agent': 'SkipATip address backfill (skipatipofficial@gmail.com)' }
  })
  if (!r.ok) return []
  return await r.json()
}

async function updateAddress(id, address) {
  const r = await fetch(`${BASE}/rest/v1/restaurants?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...HEADERS, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ address })
  })
  return r.ok
}

async function main() {
  const dupes = await getAllDuplicates()
  let updated = 0
  let skipped = 0
  let failed = 0

  for (const [key, restaurants] of dupes) {
    const [name, city, state] = key.split('|')
    console.log(`\n🔍 ${name} in ${city}, ${state} (${restaurants.length} locations)`)

    try {
      const results = await nominatimSearch(name, city, state)
      await sleep(1100) // respect 1 req/sec

      // Filter to results that look like real addresses (have house_number)
      const withAddr = results.filter(r =>
        r.address?.house_number && r.address?.road
      )

      if (withAddr.length === 0) {
        console.log(`  ⚠️  No address results from Nominatim`)
        skipped++
        continue
      }

      // Assign addresses to restaurants — match by index, skip if fewer results than restaurants
      for (let i = 0; i < restaurants.length; i++) {
        const osmResult = withAddr[i]
        if (!osmResult) {
          console.log(`  ⚠️  No address for location ${i + 1}`)
          continue
        }
        const addr = `${osmResult.address.house_number} ${osmResult.address.road}`
        const ok = await updateAddress(restaurants[i].id, addr)
        if (ok) {
          console.log(`  ✅ Updated ${restaurants[i].id}: ${addr}`)
          updated++
        } else {
          console.log(`  ❌ Failed to update ${restaurants[i].id}`)
          failed++
        }
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`)
      failed++
      await sleep(1100)
    }
  }

  console.log(`\n✅ Done. Updated: ${updated} | Skipped: ${skipped} | Failed: ${failed}`)
}

main().catch(console.error)
