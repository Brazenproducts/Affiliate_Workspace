// update-cuisine-types.js
// Bulk-updates cuisine_type on all seeded chain restaurants
// Safe to re-run — uses PATCH by chain name match

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args))

const SUPABASE_URL = 'https://zqmepfdghljknyojfsmq.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbWVwZmRnaGxqa255b2pmc21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MzY4MjQsImV4cCI6MjA5NDExMjgyNH0.5iSZ8j78oIVTHEwL09FD5w-qnYHvY2OAQaLlhOxWcsc'

// Map of chain name → cuisine_type
const CHAIN_CUISINES = {
  // Chicken
  "Raising Cane's": 'Chicken',
  "Chick-fil-A": 'Chicken',
  "Wingstop": 'Chicken',
  "Popeyes": 'Chicken',
  "KFC": 'Chicken',
  "Zaxby's": 'Chicken',
  "Slim Chickens": 'Chicken',
  "Dave's Hot Chicken": 'Chicken',
  "Bojangles": 'Chicken',
  "El Pollo Loco": 'Chicken',
  "Golden Corral": 'American',

  // Burgers
  "McDonald's": 'Burgers',
  "Burger King": 'Burgers',
  "Wendy's": 'Burgers',
  "Five Guys": 'Burgers',
  "In-N-Out Burger": 'Burgers',
  "Whataburger": 'Burgers',
  "Shake Shack": 'Burgers',
  "Culver's": 'Burgers',
  "Steak 'n Shake": 'Burgers',
  "Freddy's": 'Burgers',
  "Smashburger": 'Burgers',
  "Fatburger": 'Burgers',
  "Jack in the Box": 'Burgers',
  "Carl's Jr.": 'Burgers',
  "Hardee's": 'Burgers',
  "Sonic Drive-In": 'Burgers',
  "Rally's": 'Burgers',
  "Checkers": 'Burgers',
  "Bobby's Burgers": 'Burgers',
  "MOOYAH": 'Burgers',
  "BurgerFi": 'Burgers',
  "Wayback Burgers": 'Burgers',

  // Mexican
  "Taco Bell": 'Mexican',
  "Del Taco": 'Mexican',
  "Chipotle": 'Mexican',
  "Qdoba": 'Mexican',
  "Moe's Southwest Grill": 'Mexican',
  "Taco John's": 'Mexican',
  "Taco Bueno": 'Mexican',
  "Tijuana Flats": 'Mexican',
  "Fuzzy's Taco Shop": 'Mexican',
  "Taco Cabana": 'Mexican',
  "Torchy's Tacos": 'Mexican',

  // Pizza
  "Pizza Hut": 'Pizza',
  "Domino's": 'Pizza',
  "Little Caesars": 'Pizza',
  "Papa John's": 'Pizza',
  "Papa Murphy's": 'Pizza',
  "MOD Pizza": 'Pizza',
  "Blaze Pizza": 'Pizza',
  "Pieology": 'Pizza',
  "Jet's Pizza": 'Pizza',
  "Hungry Howie's": 'Pizza',
  "Marco's Pizza": 'Pizza',
  "Godfather's Pizza": 'Pizza',
  "Sbarro": 'Pizza',

  // Sandwiches/Subs
  "Subway": 'Sandwiches',
  "Jimmy John's": 'Sandwiches',
  "Jersey Mike's": 'Sandwiches',
  "Firehouse Subs": 'Sandwiches',
  "Which Wich": 'Sandwiches',
  "Potbelly": 'Sandwiches',
  "McAlister's Deli": 'Sandwiches',
  "Jason's Deli": 'Sandwiches',
  "Quiznos": 'Sandwiches',
  "Charley's Philly Steaks": 'Sandwiches',
  "Penn Station": 'Sandwiches',
  "Schlotzsky's": 'Sandwiches',
  "Port of Subs": 'Sandwiches',
  "Erbert & Gerbert's": 'Sandwiches',

  // BBQ
  "Dickey's Barbecue Pit": 'BBQ',
  "Famous Dave's": 'BBQ',
  "Smokey Bones": 'BBQ',
  "Jim 'N Nick's": 'BBQ',
  "Dreamland BBQ": 'BBQ',

  // American
  "Arby's": 'American',
  "Dairy Queen": 'American',
  "A&W": 'American',
  "Steak 'n Shake": 'American',
  "Wienerschnitzel": 'American',
  "Long John Silver's": 'American',
  "Captain D's": 'American',

  // Breakfast
  "Cracker Barrel": 'Breakfast',
  "IHOP": 'Breakfast',
  "Denny's": 'Breakfast',
  "Bob Evans": 'Breakfast',
  "Waffle House": 'Breakfast',
  "First Watch": 'Breakfast',
  "The Original Pancake House": 'Breakfast',
  "Perkins": 'Breakfast',
  "Shari's": 'Breakfast',
  "Huddle House": 'Breakfast',

  // Dessert
  "Dairy Queen": 'Dessert',
  "Cold Stone Creamery": 'Dessert',
  "Baskin-Robbins": 'Dessert',
  "Rita's Italian Ice": 'Dessert',
  "Marble Slab Creamery": 'Dessert',
  "Dippin' Dots": 'Dessert',
  "Pinkberry": 'Dessert',
  "Yogurtland": 'Dessert',
  "Menchie's": 'Dessert',
  "16 Handles": 'Dessert',
  "Orange Leaf": 'Dessert',
  "Sweetfrog": 'Dessert',
  "Yogurt Island": 'Dessert',

  // Asian
  "Panda Express": 'Asian',
  "Pei Wei": 'Asian',
  "Leeann Chin": 'Asian',
  "Yoshinoya": 'Asian',

  // Italian
  "Fazoli's": 'Italian',
  "Noodles & Company": 'Italian',
}

async function updateChain(chainName, cuisineType) {
  const encoded = encodeURIComponent(chainName)
  const url = `${SUPABASE_URL}/rest/v1/restaurants?name=eq.${encoded}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify({ cuisine_type: cuisineType })
  })
  const text = await res.text()
  const count = text === '[]' || text === '' ? 0 : JSON.parse(text).length
  return count
}

async function main() {
  let total = 0
  for (const [chain, cuisine] of Object.entries(CHAIN_CUISINES)) {
    const count = await updateChain(chain, cuisine)
    if (count > 0) console.log(`✅ ${chain} → ${cuisine} (${count} locations)`)
  }
  console.log(`\nDone. Updated ${total} total records.`)
}

main().catch(console.error)
