/**
 * chain-registry.js — Master list of tip-free restaurant chains for SkipATip
 *
 * What qualifies: counter service, drive-thru, fast food, fast casual —
 * any place that does NOT show a tip screen at checkout.
 *
 * Structure:
 *   name         — exact name to seed/search with
 *   slug_prefix  — used for generating slugs
 *   cuisine_type — comma-separated cuisine tags
 *   has_drive_thru
 *   has_dine_in
 *   scope        — 'national' | 'regional'
 *   states       — array of state codes (regional only; omit for national)
 *   notes        — optional human note
 *   do_not_seed  — true = has tip screens, excluded from seeding
 *
 * To add a new chain: add an entry here, then run:
 *   node scripts/seed-from-registry.js --chain="Chain Name"
 *   node scripts/backfill-from-store-locators.js --chain="Chain Name"
 *
 * DO NOT SEED (tip screens): Chipotle, Sweetgreen, Shake Shack, Panera,
 *   Starbucks, Dutch Bros, Toast-based restaurants, Square-based restaurants
 */

const CHAINS = [

  // ─── NATIONAL ─────────────────────────────────────────────────────────────

  { name: "McDonald's",      slug_prefix: 'mcdonalds',      cuisine_type: 'American, Burgers, Breakfast', has_drive_thru: true,  has_dine_in: true,  scope: 'national' },
  { name: "Burger King",     slug_prefix: 'burger-king',    cuisine_type: 'American, Burgers',            has_drive_thru: true,  has_dine_in: true,  scope: 'national' },
  { name: "Taco Bell",       slug_prefix: 'taco-bell',      cuisine_type: 'Mexican, Tacos, Burritos',     has_drive_thru: true,  has_dine_in: true,  scope: 'national' },
  { name: "Wendy's",         slug_prefix: 'wendys',         cuisine_type: 'American, Burgers',            has_drive_thru: true,  has_dine_in: true,  scope: 'national' },
  { name: "Chick-fil-A",     slug_prefix: 'chick-fil-a',    cuisine_type: 'American, Chicken, Breakfast', has_drive_thru: true,  has_dine_in: true,  scope: 'national' },
  { name: "Arby's",          slug_prefix: 'arbys',          cuisine_type: 'American, Sandwiches',         has_drive_thru: true,  has_dine_in: true,  scope: 'national' },
  { name: "Popeyes",         slug_prefix: 'popeyes',        cuisine_type: 'American, Chicken',            has_drive_thru: true,  has_dine_in: true,  scope: 'national' },
  { name: "Dairy Queen",     slug_prefix: 'dairy-queen',    cuisine_type: 'American, Burgers, Dessert',   has_drive_thru: true,  has_dine_in: true,  scope: 'national' },
  { name: "Panda Express",   slug_prefix: 'panda-express',  cuisine_type: 'Chinese',                      has_drive_thru: true,  has_dine_in: true,  scope: 'national' },
  { name: "Five Guys",       slug_prefix: 'five-guys',      cuisine_type: 'American, Burgers',            has_drive_thru: false, has_dine_in: true,  scope: 'national' },
  { name: "Subway",          slug_prefix: 'subway',         cuisine_type: 'American, Sandwiches',         has_drive_thru: false, has_dine_in: true,  scope: 'national' },
  { name: "Jersey Mike's",   slug_prefix: 'jersey-mikes',   cuisine_type: 'American, Sandwiches',         has_drive_thru: false, has_dine_in: true,  scope: 'national' },
  { name: "Firehouse Subs",  slug_prefix: 'firehouse-subs', cuisine_type: 'American, Sandwiches',         has_drive_thru: false, has_dine_in: true,  scope: 'national' },
  { name: "Jimmy John's",    slug_prefix: 'jimmy-johns',    cuisine_type: 'American, Sandwiches',         has_drive_thru: false, has_dine_in: true,  scope: 'national' },
  { name: "Raising Cane's",  slug_prefix: 'raising-canes',  cuisine_type: 'American, Chicken',            has_drive_thru: true,  has_dine_in: true,  scope: 'national' },
  { name: "KFC",             slug_prefix: 'kfc',            cuisine_type: 'American, Chicken',            has_drive_thru: true,  has_dine_in: true,  scope: 'national' },
  { name: "Little Caesars",  slug_prefix: 'little-caesars', cuisine_type: 'Pizza',                        has_drive_thru: false, has_dine_in: false, scope: 'national', notes: 'Walk-in counter only, no tip screen' },
  { name: "Domino's",        slug_prefix: 'dominos',        cuisine_type: 'Pizza',                        has_drive_thru: false, has_dine_in: false, scope: 'national', notes: 'Takeout/delivery, no tip screen' },
  { name: "Papa John's",     slug_prefix: 'papa-johns',     cuisine_type: 'Pizza',                        has_drive_thru: false, has_dine_in: false, scope: 'national', notes: 'Takeout/delivery, no tip screen' },
  { name: "Wingstop",        slug_prefix: 'wingstop',       cuisine_type: 'American, Chicken, Wings',     has_drive_thru: false, has_dine_in: true,  scope: 'national' },
  { name: "Qdoba",           slug_prefix: 'qdoba',          cuisine_type: 'Mexican, Burritos',            has_drive_thru: false, has_dine_in: true,  scope: 'national' },
  { name: "Moe's Southwest Grill", slug_prefix: 'moes',     cuisine_type: 'Mexican, Burritos',            has_drive_thru: false, has_dine_in: true,  scope: 'national' },
  { name: "McAlister's Deli",slug_prefix: 'mcalisters-deli',cuisine_type: 'American, Sandwiches, Soups',  has_drive_thru: false, has_dine_in: true,  scope: 'national' },
  { name: "Jason's Deli",    slug_prefix: 'jasons-deli',    cuisine_type: 'American, Sandwiches, Soups',  has_drive_thru: false, has_dine_in: true,  scope: 'national' },
  { name: "Noodles & Company",slug_prefix:'noodles-company', cuisine_type: 'American, Pasta, Asian',      has_drive_thru: false, has_dine_in: true,  scope: 'national' },
  { name: "Pei Wei",         slug_prefix: 'pei-wei',        cuisine_type: 'Asian, Chinese',               has_drive_thru: false, has_dine_in: true,  scope: 'national' },

  // ─── REGIONAL ─────────────────────────────────────────────────────────────

  { name: "In-N-Out Burger",  slug_prefix: 'in-n-out',       cuisine_type: 'American, Burgers',       has_drive_thru: true,  has_dine_in: true,  scope: 'regional',
    states: ['CA','NV','AZ','UT','TX','CO','OR','ID'] },

  { name: "Whataburger",      slug_prefix: 'whataburger',    cuisine_type: 'American, Burgers',       has_drive_thru: true,  has_dine_in: true,  scope: 'regional',
    states: ['TX','FL','AL','AZ','AR','CO','GA','KS','LA','MO','MS','NM','OK','TN'] },

  { name: "Jack in the Box",  slug_prefix: 'jack-in-the-box',cuisine_type: 'American, Burgers',       has_drive_thru: true,  has_dine_in: true,  scope: 'regional',
    states: ['CA','NV','AZ','OR','WA','TX','OK','CO','NM','UT','ID','HI','FL','GA','AL','MS','LA','AR','MO','KS'] },

  { name: "Del Taco",         slug_prefix: 'del-taco',       cuisine_type: 'Mexican, Tacos',          has_drive_thru: true,  has_dine_in: true,  scope: 'regional',
    states: ['CA','NV','AZ','OR','WA','TX','CO','UT','ID','FL','GA','OH','TN','VA','NM'] },

  { name: "Carl's Jr",        slug_prefix: 'carls-jr',       cuisine_type: 'American, Burgers',       has_drive_thru: true,  has_dine_in: true,  scope: 'regional',
    states: ['CA','NV','AZ','OR','WA','TX','CO','UT','ID','NM','WY','MT','ND','SD','NE','KS','OK','MO','AR','LA','MS','AL','TN','GA','FL'] },

  { name: "Wienerschnitzel",  slug_prefix: 'wienerschnitzel',cuisine_type: 'American, Hot Dogs',      has_drive_thru: true,  has_dine_in: false, scope: 'regional',
    states: ['CA','NV','AZ','TX','CO','NM','OR','WA','ID','UT'] },

  { name: "Sonic Drive-In",   slug_prefix: 'sonic-drive-in', cuisine_type: 'American, Burgers',       has_drive_thru: true,  has_dine_in: false, scope: 'regional',
    states: ['AL','AR','AZ','CA','CO','FL','GA','IA','ID','IL','IN','KS','KY','LA','MI','MN','MO','MS','MT','NC','ND','NE','NM','NV','OH','OK','OR','SC','SD','TN','TX','UT','VA','WA','WI','WV','WY'] },

  { name: "Culver's",         slug_prefix: 'culvers',        cuisine_type: 'American, Burgers, Custard', has_drive_thru: true, has_dine_in: true, scope: 'regional',
    states: ['WI','IL','IN','MN','IA','MO','MI','OH','KY','TN','FL','GA','NC','SC','VA','TX','OK','KS','NE','SD','ND','MT','CO','WY','ID','UT','AZ','NV'] },

  { name: "Freddy's",         slug_prefix: 'freddys',        cuisine_type: 'American, Burgers, Custard', has_drive_thru: true, has_dine_in: true, scope: 'regional',
    states: ['KS','MO','TX','OK','CO','NE','IA','IL','IN','OH','TN','NC','SC','GA','FL','AL','MS','LA','AR','AZ','NV','CA','WA','OR','ID','UT','WY','MT','ND','SD','MI','WI','MN','VA','WV','KY'] },

  { name: "Hardee's",         slug_prefix: 'hardees',        cuisine_type: 'American, Burgers, Breakfast', has_drive_thru: true, has_dine_in: true, scope: 'regional',
    states: ['AL','AR','GA','IA','IL','IN','KS','KY','LA','MD','MI','MN','MO','MS','NC','NE','OH','OK','SC','SD','TN','VA','WI','WV'] },

  { name: "Bojangles",        slug_prefix: 'bojangles',      cuisine_type: 'American, Chicken, Biscuits', has_drive_thru: true, has_dine_in: true, scope: 'regional',
    states: ['AL','FL','GA','KY','MD','MS','NC','OH','PA','SC','TN','VA','WV'] },

  { name: "Cook Out",         slug_prefix: 'cook-out',       cuisine_type: 'American, Burgers, BBQ',  has_drive_thru: true,  has_dine_in: false, scope: 'regional',
    states: ['AL','GA','KY','MD','MS','NC','SC','TN','VA','WV'] },

  { name: "Zaxby's",          slug_prefix: 'zaxbys',         cuisine_type: 'American, Chicken, Wings', has_drive_thru: true, has_dine_in: true, scope: 'regional',
    states: ['AL','AR','FL','GA','IN','KY','LA','MD','MS','NC','OH','SC','TN','TX','VA'] },

  { name: "Checkers",         slug_prefix: 'checkers',       cuisine_type: 'American, Burgers',       has_drive_thru: true,  has_dine_in: false, scope: 'regional',
    states: ['AL','FL','GA','IL','IN','KY','LA','MD','MI','MS','NC','NJ','NY','OH','PA','SC','TN','VA'] },

  { name: "Rally's",          slug_prefix: 'rallys',         cuisine_type: 'American, Burgers',       has_drive_thru: true,  has_dine_in: false, scope: 'regional',
    states: ['AL','AR','IL','IN','KY','LA','MI','MO','MS','OH','TN','WI'] },

  { name: "El Pollo Loco",    slug_prefix: 'el-pollo-loco',  cuisine_type: 'Mexican, Chicken',        has_drive_thru: true,  has_dine_in: true,  scope: 'regional',
    states: ['CA','NV','AZ','TX','OR','UT'] },

  { name: "Portillo's",       slug_prefix: 'portillos',      cuisine_type: 'American, Hot Dogs, Italian Beef', has_drive_thru: true, has_dine_in: true, scope: 'regional',
    states: ['IL','IN','AZ','CA','FL','MN','WI','MO','OH','TX','GA'] },

  { name: "Steak 'n Shake",   slug_prefix: 'steak-n-shake',  cuisine_type: 'American, Burgers, Shakes', has_drive_thru: true, has_dine_in: true, scope: 'regional',
    states: ['AL','AR','FL','GA','IL','IN','KS','KY','MI','MO','MS','NC','OH','OK','SC','TN','TX','VA','WI'] },

  { name: "Taco Bueno",       slug_prefix: 'taco-bueno',     cuisine_type: 'Mexican, Tacos, Burritos', has_drive_thru: true, has_dine_in: true, scope: 'regional',
    states: ['TX','OK','KS','MO','AR','CO','LA'] },

  { name: "Krystal",          slug_prefix: 'krystal',        cuisine_type: 'American, Burgers',       has_drive_thru: true,  has_dine_in: true,  scope: 'regional',
    states: ['AL','FL','GA','KY','MS','NC','SC','TN','VA'] },

  // ─── DO NOT SEED — these have tip screens ─────────────────────────────────

  { name: "Chipotle",         do_not_seed: true, notes: 'Has tip prompt on card readers' },
  { name: "Sweetgreen",       do_not_seed: true, notes: 'Has tip prompt' },
  { name: "Shake Shack",      do_not_seed: true, notes: 'Has tip prompt' },
  { name: "Panera Bread",     do_not_seed: true, notes: 'Has tip prompt at kiosks/drive-thru' },
  { name: "Starbucks",        do_not_seed: true, notes: 'Has tip prompt on app and readers' },
  { name: "Dutch Bros",       do_not_seed: true, notes: 'Has tip prompt' },
  { name: "Wingstop",         do_not_seed: false, notes: 'Verify - some locations use tablet ordering with tip screen' },

];

// ─── Exports ──────────────────────────────────────────────────────────────────

/** All chains eligible for seeding (not do_not_seed) */
const SEEDABLE = CHAINS.filter(c => !c.do_not_seed);

/** National chains (all 50 states eligible) */
const NATIONAL = SEEDABLE.filter(c => c.scope === 'national');

/** Regional chains with state restrictions */
const REGIONAL = SEEDABLE.filter(c => c.scope === 'regional');

/** Chains that are explicitly excluded */
const EXCLUDED = CHAINS.filter(c => c.do_not_seed);

/** Look up a chain by name */
function getChain(name) {
  return CHAINS.find(c => c.name.toLowerCase() === name.toLowerCase());
}

/** Check if a chain operates in a given state */
function chainOperatesIn(chain, state) {
  if (chain.do_not_seed) return false;
  if (chain.scope === 'national') return true;
  return (chain.states || []).includes(state.toUpperCase());
}

module.exports = { CHAINS, SEEDABLE, NATIONAL, REGIONAL, EXCLUDED, getChain, chainOperatesIn };

// CLI: node scripts/chain-registry.js --list
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--list')) {
    console.log('\n✅ SEEDABLE CHAINS:\n');
    SEEDABLE.forEach(c => {
      const scope = c.scope === 'national' ? '🌎 National' : `📍 Regional (${(c.states||[]).join(', ')})`;
      console.log(`  ${c.name.padEnd(25)} ${scope}`);
    });
    console.log('\n🚫 DO NOT SEED:\n');
    EXCLUDED.forEach(c => console.log(`  ${c.name.padEnd(25)} — ${c.notes}`));
    console.log('');
  }
  if (args.includes('--count')) {
    console.log(`Seedable: ${SEEDABLE.length} chains (${NATIONAL.length} national, ${REGIONAL.length} regional)`);
    console.log(`Excluded: ${EXCLUDED.length} chains`);
  }
}
