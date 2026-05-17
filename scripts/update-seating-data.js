// update-seating-data.js — bulk-sets has_dine_in, has_outdoor_seating, has_drive_thru per chain
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args))

const BASE = 'https://zqmepfdghljknyojfsmq.supabase.co'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbWVwZmRnaGxqa255b2pmc21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MzY4MjQsImV4cCI6MjA5NDExMjgyNH0.5iSZ8j78oIVTHEwL09FD5w-qnYHvY2OAQaLlhOxWcsc'

// dine_in, outdoor_seating, drive_thru
const CHAIN_SEATING = {
  // Drive-thru + dine-in + outdoor
  "McDonald's":         { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: true },
  "Burger King":        { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: true },
  "Wendy's":            { has_dine_in: true,  has_outdoor_seating: false, has_drive_thru: true },
  "Taco Bell":          { has_dine_in: true,  has_outdoor_seating: false, has_drive_thru: true },
  "Chick-fil-A":        { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: true },
  "Popeyes":            { has_dine_in: true,  has_outdoor_seating: false, has_drive_thru: true },
  "KFC":                { has_dine_in: true,  has_outdoor_seating: false, has_drive_thru: true },
  "Jack in the Box":    { has_dine_in: true,  has_outdoor_seating: false, has_drive_thru: true },
  "Carl's Jr.":         { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: true },
  "Hardee's":           { has_dine_in: true,  has_outdoor_seating: false, has_drive_thru: true },
  "Arby's":             { has_dine_in: true,  has_outdoor_seating: false, has_drive_thru: true },
  "Sonic Drive-In":     { has_dine_in: false, has_outdoor_seating: true,  has_drive_thru: true },
  "Dairy Queen":        { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: true },
  "Culver's":           { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: true },
  "Whataburger":        { has_dine_in: true,  has_outdoor_seating: false, has_drive_thru: true },
  "In-N-Out Burger":    { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: true },
  "Five Guys":          { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: false },
  "Shake Shack":        { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: false },
  "Freddy's":           { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: true },
  "Smashburger":        { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: false },
  "Steak 'n Shake":     { has_dine_in: true,  has_outdoor_seating: false, has_drive_thru: true },
  "Rally's":            { has_dine_in: false, has_outdoor_seating: true,  has_drive_thru: true },
  "Checkers":           { has_dine_in: false, has_outdoor_seating: true,  has_drive_thru: true },
  "Del Taco":           { has_dine_in: true,  has_outdoor_seating: false, has_drive_thru: true },
  "Chipotle":           { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: false },
  "Qdoba":              { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: false },
  "Moe's Southwest Grill": { has_dine_in: true, has_outdoor_seating: true, has_drive_thru: false },
  "Panda Express":      { has_dine_in: true,  has_outdoor_seating: false, has_drive_thru: true },
  "Raising Cane's":     { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: true },
  "Wingstop":           { has_dine_in: true,  has_outdoor_seating: false, has_drive_thru: false },
  "El Pollo Loco":      { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: true },
  "Wienerschnitzel":    { has_dine_in: false, has_outdoor_seating: true,  has_drive_thru: true },
  "Little Caesars":     { has_dine_in: false, has_outdoor_seating: false, has_drive_thru: false },
  "Domino's":           { has_dine_in: false, has_outdoor_seating: false, has_drive_thru: false },
  "Papa John's":        { has_dine_in: false, has_outdoor_seating: false, has_drive_thru: false },
  "Subway":             { has_dine_in: true,  has_outdoor_seating: false, has_drive_thru: false },
  "Jersey Mike's":      { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: false },
  "Jimmy John's":       { has_dine_in: true,  has_outdoor_seating: false, has_drive_thru: false },
  "Firehouse Subs":     { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: false },
  "McAlister's Deli":   { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: false },
  "Jason's Deli":       { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: false },
  "Potbelly":           { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: false },
  "Waffle House":       { has_dine_in: true,  has_outdoor_seating: false, has_drive_thru: false },
  "Cracker Barrel":     { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: false },
  "Denny's":            { has_dine_in: true,  has_outdoor_seating: false, has_drive_thru: false },
  "IHOP":               { has_dine_in: true,  has_outdoor_seating: false, has_drive_thru: false },
  "Dickey's Barbecue Pit": { has_dine_in: true, has_outdoor_seating: true, has_drive_thru: false },
  "Zaxby's":            { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: true },
  "Bojangles":          { has_dine_in: true,  has_outdoor_seating: false, has_drive_thru: true },
  "Yogurt Island":      { has_dine_in: true,  has_outdoor_seating: true,  has_drive_thru: false },
}

async function updateChain(name, data) {
  const res = await fetch(`${BASE}/rest/v1/restaurants?name=eq.${encodeURIComponent(name)}`, {
    method: 'PATCH',
    headers: {
      apikey: KEY,
      Authorization: 'Bearer ' + KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(data)
  })
  const text = await res.text()
  const rows = text === '[]' || text === '' ? [] : JSON.parse(text)
  return rows.length
}

async function main() {
  let total = 0
  for (const [chain, data] of Object.entries(CHAIN_SEATING)) {
    const count = await updateChain(chain, data)
    if (count > 0) {
      console.log(`✅ ${chain} — dine_in:${data.has_dine_in} outdoor:${data.has_outdoor_seating} drive_thru:${data.has_drive_thru} (${count} locations)`)
      total += count
    }
  }
  console.log(`\nDone. Updated ${total} total records.`)
}

main().catch(console.error)
