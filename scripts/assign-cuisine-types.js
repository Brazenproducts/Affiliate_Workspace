#!/usr/bin/env node
// Bulk-assign cuisine_type to restaurants with null cuisine based on name keywords
const { createClient } = require('@supabase/supabase-js')

const sb = createClient(
  'https://zqmepfdghljknyojfsmq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbWVwZmRnaGxqa255b2pmc21xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUzNjgyNCwiZXhwIjoyMDk0MTEyODI0fQ.jtzXSN0ze19VLmVzzx6Vb7-heEW15jPMHVxZ7RisiCc'
)

const RULES = [
  // Mexican
  { cuisine: 'Mexican', keywords: ['mexican', 'taco', 'taqueria', 'cantina', 'cocina', 'mariachi', 'jalisco', 'guadalajara', 'hacienda', 'tortilla', 'burrito', 'enchilada', 'fonda', 'loca', 'landeros', 'margarita'] },
  // Italian
  { cuisine: 'Italian', keywords: ['italian', 'italia', 'pizza', 'pizzeria', 'trattoria', 'osteria', 'ristorante', 'pasta', 'grill and cellar', 'francesca', 'filippi', 'bottega', 'gourmet italia', 'ponte', 'portofino'] },
  // Asian
  { cuisine: 'Asian', keywords: ['asian', 'sushi', 'japanese', 'chinese', 'korean', 'thai', 'vietnamese', 'ramen', 'pho', 'wok', 'benihana', 'shogun', 'mongol', 'tasty pot', 'wagyu', 'momotaro'] },
  // BBQ
  { cuisine: 'BBQ', keywords: ['bbq', 'barbeque', 'barbecue', 'smokehouse', 'smoker', 'swing inn', 'texas lil'] },
  // Burgers
  { cuisine: 'Burgers', keywords: ['burger', 'burgers', 'five guys', 'smashburger', 'shake shack', 'whataburger'] },
  // Breakfast
  { cuisine: 'Breakfast', keywords: ['breakfast', 'brunch', 'cafe', 'pancake', 'waffle', 'egg', 'bakery', 'annie', 'penfold', 'mo\'s egg', 'toast', 'broken yolk', 'wildberry'] },
  // American
  { cuisine: 'American', keywords: ['american', 'steakhouse', 'grill', 'tavern', 'pub', 'brewhouse', 'brewery', 'bar', 'kitchen', 'diner', 'house', 'grille', 'yard', 'black angus', 'longhorn', 'bj\'s', 'islands', 'creekside', 'bluewater', 'hendo', 'rodeo', 'cowboy', 'gambling', 'small barn', 'corkfire', 'goat & vine', '1909', 'local provisions', 'crush & brew', 'baily', 'oscar', 'public house', 'blackbird', 'pangaea', 'archive', 'mad madeline', 'ten hut', 'luke\'s', 'bolero', 'old town pub'] },
]

function guessCuisine(name) {
  const lower = name.toLowerCase()
  for (const rule of RULES) {
    if (rule.keywords.some(k => lower.includes(k))) {
      return rule.cuisine
    }
  }
  return 'Other'
}

async function main() {
  // Get all restaurants with null cuisine_type
  const { data, error } = await sb
    .from('restaurants')
    .select('id, name, cuisine_type')
    .is('cuisine_type', null)
    .eq('is_approved', true)

  if (error) { console.error('Fetch error:', error.message); process.exit(1) }

  console.log(`Found ${data.length} restaurants with null cuisine_type`)

  let updated = 0
  let skipped = 0

  for (const r of data) {
    const cuisine = guessCuisine(r.name)
    const { error: upErr } = await sb
      .from('restaurants')
      .update({ cuisine_type: cuisine })
      .eq('id', r.id)

    if (upErr) {
      console.error(`Error updating ${r.name}:`, upErr.message)
      skipped++
    } else {
      console.log(`✅ ${r.name} → ${cuisine}`)
      updated++
    }
  }

  console.log(`\nDone. Updated: ${updated}, Failed: ${skipped}`)
}

main().catch(console.error)
