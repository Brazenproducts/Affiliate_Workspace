#!/usr/bin/env node
// seed-restaurants-v3.js
// ACCURATE geographic seeding — chains only seeded into states/cities where they actually operate
// Run: node scripts/seed-restaurants-v3.js

const https = require('https');

const SUPABASE_URL = 'https://zqmepfdghljknyojfsmq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbWVwZmRnaGxqa255b2pmc21xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUzNjgyNCwiZXhwIjoyMDk0MTEyODI0fQ.jtzXSN0ze19VLmVzzx6Vb7-heEW15jPMHVxZ7RisiCc';

// ─── TRULY NATIONAL CHAINS (all 50 states) ────────────────────────────────────
// These have confirmed locations in virtually every US city with 50k+ population
const NATIONAL_CHAINS = [
  { name: "McDonald's",     slug_prefix: 'mcdonalds',     has_drive_thru: true  },
  { name: "Burger King",    slug_prefix: 'burger-king',   has_drive_thru: true  },
  { name: "Taco Bell",      slug_prefix: 'taco-bell',     has_drive_thru: true  },
  { name: "Wendy's",        slug_prefix: 'wendys',        has_drive_thru: true  },
  { name: "Chick-fil-A",    slug_prefix: 'chick-fil-a',   has_drive_thru: true  },
  { name: "Arby's",         slug_prefix: 'arbys',         has_drive_thru: true  },
  { name: "Dairy Queen",    slug_prefix: 'dairy-queen',   has_drive_thru: true  },
  { name: "Popeyes",        slug_prefix: 'popeyes',       has_drive_thru: true  },
  { name: "Five Guys",      slug_prefix: 'five-guys',     has_drive_thru: false },
  { name: "Panda Express",  slug_prefix: 'panda-express', has_drive_thru: true,  cuisine_type: 'Chinese'    },
  { name: "Little Caesars", slug_prefix: 'little-caesars',has_drive_thru: false, cuisine_type: 'Pizza'      },
  { name: "Papa John's",    slug_prefix: 'papa-johns',    has_drive_thru: false, cuisine_type: 'Pizza'      },
  { name: "Domino's",       slug_prefix: 'dominos',       has_drive_thru: false, cuisine_type: 'Pizza'      },
  { name: "Jersey Mike's",  slug_prefix: 'jersey-mikes',  has_drive_thru: false, cuisine_type: 'Sandwiches' },
  { name: "Raising Cane's", slug_prefix: 'raising-canes', has_drive_thru: true  },
];

// ─── REGIONAL CHAINS — state-restricted ───────────────────────────────────────
const REGIONAL_CHAINS = [
  // In-N-Out: CA, NV, AZ, UT, TX, CO, OR, ID
  {
    name: "In-N-Out Burger", slug_prefix: 'in-n-out-burger', has_drive_thru: true,
    states: ['CA','NV','AZ','UT','TX','CO','OR','ID']
  },
  // Whataburger: TX, FL, AL, AZ, AR, CO, GA, KS, LA, MO, MS, NM, OK, TN
  {
    name: "Whataburger", slug_prefix: 'whataburger', has_drive_thru: true,
    states: ['TX','FL','AL','AZ','AR','CO','GA','KS','LA','MO','MS','NM','OK','TN']
  },
  // Jack in the Box: CA, NV, AZ, OR, WA, TX, OK, CO, NM, UT, ID, HI, FL, GA, AL, MS, LA, AR, MO, KS
  {
    name: "Jack in the Box", slug_prefix: 'jack-in-the-box', has_drive_thru: true,
    states: ['CA','NV','AZ','OR','WA','TX','OK','CO','NM','UT','ID','HI','FL','GA','AL','MS','LA','AR','MO','KS']
  },
  // Del Taco: CA, NV, AZ, OR, WA, TX, CO, UT, ID, FL, GA, OH, TN, VA, NM
  {
    name: "Del Taco", slug_prefix: 'del-taco', has_drive_thru: true,
    states: ['CA','NV','AZ','OR','WA','TX','CO','UT','ID','FL','GA','OH','TN','VA','NM']
  },
  // Carl's Jr: CA, NV, AZ, OR, WA, TX, CO, UT, ID, NM, WY, MT, ND, SD, NE, KS, OK, MO, AR, LA, MS, AL, TN, GA, FL
  {
    name: "Carl's Jr", slug_prefix: 'carls-jr', has_drive_thru: true,
    states: ['CA','NV','AZ','OR','WA','TX','CO','UT','ID','NM','WY','MT','ND','SD','NE','KS','OK','MO','AR','LA','MS','AL','TN','GA','FL']
  },
  // Wienerschnitzel: CA, NV, AZ, TX, CO, NM, OR, WA, ID, UT
  {
    name: "Wienerschnitzel", slug_prefix: 'wienerschnitzel', has_drive_thru: true,
    states: ['CA','NV','AZ','TX','CO','NM','OR','WA','ID','UT']
  },
  // Sonic: all states except AK, HI, ME, VT, NH, RI, CT, MA, NY, NJ, PA, DE, MD, DC
  {
    name: "Sonic Drive-In", slug_prefix: 'sonic-drive-in', has_drive_thru: true,
    states: ['AL','AR','AZ','CA','CO','FL','GA','IA','ID','IL','IN','KS','KY','LA','MI','MN','MO','MS','MT','NC','ND','NE','NM','NV','OH','OK','OR','SC','SD','TN','TX','UT','VA','WA','WI','WV','WY']
  },
  // Hardee's: Southeast + Midwest — NOT in CA, NY, FL (Carl's Jr territory)
  {
    name: "Hardee's", slug_prefix: 'hardees', has_drive_thru: true,
    states: ['AL','AR','GA','IA','IL','IN','KS','KY','LA','MD','MI','MN','MO','MS','NC','NE','OH','OK','SC','SD','TN','VA','WI','WV']
  },
  // Steak 'n Shake: Midwest + Southeast
  {
    name: "Steak 'n Shake", slug_prefix: 'steak-n-shake', has_drive_thru: true,
    states: ['AL','AR','FL','GA','IL','IN','KS','KY','MI','MO','MS','NC','OH','OK','SC','TN','TX','VA','WI']
  },
  // Cook Out: Southeast only
  {
    name: "Cook Out", slug_prefix: 'cook-out', has_drive_thru: true,
    states: ['AL','GA','KY','MD','MS','NC','SC','TN','VA','WV']
  },
  // Zaxby's: Southeast only
  {
    name: "Zaxby's", slug_prefix: 'zaxbys', has_drive_thru: true,
    states: ['AL','AR','FL','GA','IN','KY','LA','MD','MS','NC','OH','SC','TN','TX','VA']
  },
  // Bojangles: Southeast only
  {
    name: "Bojangles", slug_prefix: 'bojangles', has_drive_thru: true,
    states: ['AL','FL','GA','KY','MD','MS','NC','OH','PA','SC','TN','VA','WV']
  },
  // Checkers/Rally's: Southeast + Midwest
  {
    name: "Checkers", slug_prefix: 'checkers', has_drive_thru: true,
    states: ['AL','FL','GA','IL','IN','KY','LA','MD','MI','MS','NC','NJ','NY','OH','PA','SC','TN','VA']
  },
  {
    name: "Rally's", slug_prefix: 'rallys', has_drive_thru: true,
    states: ['AL','AR','IL','IN','KY','LA','MI','MO','MS','OH','TN','WI']
  },
  // Krystal: Deep South only
  {
    name: "Krystal", slug_prefix: 'krystal', has_drive_thru: true,
    states: ['AL','FL','GA','KY','MS','NC','SC','TN','VA']
  },
  // Freddy's: Midwest + expanding
  {
    name: "Freddy's Frozen Custard", slug_prefix: 'freddys-frozen-custard', has_drive_thru: true,
    states: ['AL','AR','AZ','CO','FL','GA','IA','ID','IL','IN','KS','KY','LA','MI','MN','MO','MS','MT','NC','ND','NE','NM','NV','OH','OK','OR','SC','SD','TN','TX','UT','VA','WA','WI','WY']
  },
  // Portillo's: IL, IN, AZ, FL, TX, WI, MN, CA (Buena Park area only — use Anaheim as closest major city)
  {
    name: "Portillo's", slug_prefix: 'portillos', has_drive_thru: false,
    states: ['IL','IN','AZ','FL','TX','WI','MN'],
    // CA only in Anaheim/Buena Park area — handled separately below
    extra_cities: [['Anaheim','CA']]
  },
];

// ─── CITIES by state ──────────────────────────────────────────────────────────
const CITIES_BY_STATE = {
  AL: [['Birmingham','AL'],['Montgomery','AL'],['Huntsville','AL'],['Mobile','AL'],['Tuscaloosa','AL']],
  AK: [['Anchorage','AK'],['Fairbanks','AK']],
  AZ: [['Phoenix','AZ'],['Tucson','AZ'],['Mesa','AZ'],['Chandler','AZ'],['Scottsdale','AZ'],['Glendale','AZ'],['Gilbert','AZ'],['Tempe','AZ'],['Peoria','AZ'],['Surprise','AZ']],
  AR: [['Little Rock','AR'],['Fort Smith','AR'],['Fayetteville','AR'],['Springdale','AR']],
  CA: [['Los Angeles','CA'],['San Diego','CA'],['San Jose','CA'],['San Francisco','CA'],['Fresno','CA'],['Sacramento','CA'],['Long Beach','CA'],['Oakland','CA'],['Bakersfield','CA'],['Anaheim','CA'],['Riverside','CA'],['Stockton','CA'],['Irvine','CA'],['Chula Vista','CA'],['Fremont','CA'],['San Bernardino','CA'],['Modesto','CA'],['Fontana','CA'],['Moreno Valley','CA'],['Glendale','CA'],['Huntington Beach','CA'],['Santa Ana','CA'],['Garden Grove','CA'],['Oxnard','CA'],['Rancho Cucamonga','CA'],['Ontario','CA'],['Corona','CA'],['Elk Grove','CA'],['Torrance','CA'],['Pasadena','CA'],['Fullerton','CA'],['Orange','CA'],['Roseville','CA'],['Visalia','CA'],['Victorville','CA'],['Sunnyvale','CA'],['Santa Clarita','CA'],['Concord','CA'],['Thousand Oaks','CA'],['Simi Valley','CA'],['Hayward','CA'],['Salinas','CA'],['Palmdale','CA'],['Lancaster','CA'],['Chico','CA'],['Vallejo','CA'],['Antioch','CA']],
  CO: [['Denver','CO'],['Colorado Springs','CO'],['Aurora','CO'],['Fort Collins','CO'],['Lakewood','CO'],['Thornton','CO'],['Arvada','CO'],['Westminster','CO'],['Pueblo','CO'],['Boulder','CO']],
  CT: [['Bridgeport','CT'],['New Haven','CT'],['Hartford','CT'],['Stamford','CT'],['Waterbury','CT']],
  DE: [['Wilmington','DE'],['Dover','DE']],
  FL: [['Jacksonville','FL'],['Miami','FL'],['Tampa','FL'],['Orlando','FL'],['St. Petersburg','FL'],['Hialeah','FL'],['Tallahassee','FL'],['Fort Lauderdale','FL'],['Port St. Lucie','FL'],['Cape Coral','FL'],['Pembroke Pines','FL'],['Hollywood','FL'],['Gainesville','FL'],['Miramar','FL'],['Coral Springs','FL'],['Clearwater','FL'],['Palm Bay','FL'],['Lakeland','FL'],['West Palm Beach','FL'],['Pompano Beach','FL']],
  GA: [['Atlanta','GA'],['Columbus','GA'],['Augusta','GA'],['Macon','GA'],['Savannah','GA'],['Athens','GA'],['Sandy Springs','GA'],['Roswell','GA'],['Johns Creek','GA'],['Albany','GA'],['Warner Robins','GA'],['Alpharetta','GA']],
  HI: [['Honolulu','HI'],['Pearl City','HI'],['Hilo','HI']],
  ID: [['Boise','ID'],['Nampa','ID'],['Meridian','ID'],['Idaho Falls','ID'],['Pocatello','ID']],
  IL: [['Chicago','IL'],['Aurora','IL'],['Joliet','IL'],['Naperville','IL'],['Rockford','IL'],['Springfield','IL'],['Elgin','IL'],['Peoria','IL'],['Champaign','IL'],['Waukegan','IL'],['Cicero','IL'],['Bloomington','IL']],
  IN: [['Indianapolis','IN'],['Fort Wayne','IN'],['Evansville','IN'],['South Bend','IN'],['Carmel','IN'],['Fishers','IN'],['Bloomington','IN'],['Hammond','IN'],['Gary','IN'],['Lafayette','IN']],
  IA: [['Des Moines','IA'],['Cedar Rapids','IA'],['Davenport','IA'],['Sioux City','IA'],['Iowa City','IA']],
  KS: [['Wichita','KS'],['Overland Park','KS'],['Kansas City','KS'],['Topeka','KS'],['Olathe','KS']],
  KY: [['Louisville','KY'],['Lexington','KY'],['Bowling Green','KY'],['Owensboro','KY'],['Covington','KY']],
  LA: [['New Orleans','LA'],['Baton Rouge','LA'],['Shreveport','LA'],['Metairie','LA'],['Lafayette','LA'],['Lake Charles','LA'],['Kenner','LA'],['Bossier City','LA']],
  ME: [['Portland','ME'],['Lewiston','ME'],['Bangor','ME']],
  MD: [['Baltimore','MD'],['Frederick','MD'],['Rockville','MD'],['Gaithersburg','MD'],['Bowie','MD'],['Hagerstown','MD'],['Annapolis','MD']],
  MA: [['Boston','MA'],['Worcester','MA'],['Springfield','MA'],['Lowell','MA'],['Cambridge','MA'],['New Bedford','MA'],['Brockton','MA'],['Quincy','MA']],
  MI: [['Detroit','MI'],['Grand Rapids','MI'],['Warren','MI'],['Sterling Heights','MI'],['Ann Arbor','MI'],['Lansing','MI'],['Flint','MI'],['Dearborn','MI'],['Livonia','MI'],['Westland','MI'],['Troy','MI'],['Farmington Hills','MI'],['Kalamazoo','MI']],
  MN: [['Minneapolis','MN'],['Saint Paul','MN'],['Rochester','MN'],['Duluth','MN'],['Bloomington','MN'],['Brooklyn Park','MN'],['Plymouth','MN'],['Maple Grove','MN'],['Woodbury','MN'],['St. Cloud','MN']],
  MS: [['Jackson','MS'],['Gulfport','MS'],['Southaven','MS'],['Hattiesburg','MS'],['Biloxi','MS'],['Meridian','MS']],
  MO: [['Kansas City','MO'],['St. Louis','MO'],['Springfield','MO'],['Columbia','MO'],['Independence','MO'],['Lee\'s Summit','MO'],['O\'Fallon','MO'],['St. Joseph','MO'],['St. Charles','MO'],['Blue Springs','MO']],
  MT: [['Billings','MT'],['Missoula','MT'],['Great Falls','MT'],['Bozeman','MT']],
  NE: [['Omaha','NE'],['Lincoln','NE'],['Bellevue','NE'],['Grand Island','NE']],
  NV: [['Las Vegas','NV'],['Henderson','NV'],['Reno','NV'],['North Las Vegas','NV'],['Sparks','NV'],['Carson City','NV']],
  NH: [['Manchester','NH'],['Nashua','NH'],['Concord','NH']],
  NJ: [['Newark','NJ'],['Jersey City','NJ'],['Paterson','NJ'],['Elizabeth','NJ'],['Edison','NJ'],['Woodbridge','NJ'],['Lakewood','NJ'],['Toms River','NJ'],['Hamilton','NJ'],['Trenton','NJ']],
  NM: [['Albuquerque','NM'],['Las Cruces','NM'],['Rio Rancho','NM'],['Santa Fe','NM'],['Roswell','NM']],
  NY: [['New York City','NY'],['Buffalo','NY'],['Rochester','NY'],['Yonkers','NY'],['Syracuse','NY'],['Albany','NY'],['New Rochelle','NY'],['Mount Vernon','NY'],['Schenectady','NY'],['Utica','NY']],
  NC: [['Charlotte','NC'],['Raleigh','NC'],['Greensboro','NC'],['Durham','NC'],['Winston-Salem','NC'],['Fayetteville','NC'],['Cary','NC'],['Wilmington','NC'],['High Point','NC'],['Concord','NC']],
  ND: [['Fargo','ND'],['Bismarck','ND'],['Grand Forks','ND'],['Minot','ND']],
  OH: [['Columbus','OH'],['Cleveland','OH'],['Cincinnati','OH'],['Toledo','OH'],['Akron','OH'],['Dayton','OH'],['Parma','OH'],['Canton','OH'],['Youngstown','OH'],['Lorain','OH']],
  OK: [['Oklahoma City','OK'],['Tulsa','OK'],['Norman','OK'],['Broken Arrow','OK'],['Lawton','OK'],['Edmond','OK'],['Moore','OK'],['Midwest City','OK']],
  OR: [['Portland','OR'],['Salem','OR'],['Eugene','OR'],['Gresham','OR'],['Hillsboro','OR'],['Beaverton','OR'],['Bend','OR'],['Medford','OR']],
  PA: [['Philadelphia','PA'],['Pittsburgh','PA'],['Allentown','PA'],['Erie','PA'],['Reading','PA'],['Scranton','PA'],['Bethlehem','PA'],['Lancaster','PA'],['Harrisburg','PA'],['Altoona','PA']],
  RI: [['Providence','RI'],['Cranston','RI'],['Warwick','RI'],['Pawtucket','RI']],
  SC: [['Columbia','SC'],['Charleston','SC'],['North Charleston','SC'],['Mount Pleasant','SC'],['Rock Hill','SC'],['Greenville','SC'],['Summerville','SC'],['Spartanburg','SC']],
  SD: [['Sioux Falls','SD'],['Rapid City','SD'],['Aberdeen','SD']],
  TN: [['Nashville','TN'],['Memphis','TN'],['Knoxville','TN'],['Chattanooga','TN'],['Clarksville','TN'],['Murfreesboro','TN'],['Franklin','TN'],['Jackson','TN'],['Johnson City','TN'],['Bartlett','TN']],
  TX: [['Houston','TX'],['San Antonio','TX'],['Dallas','TX'],['Austin','TX'],['Fort Worth','TX'],['El Paso','TX'],['Arlington','TX'],['Corpus Christi','TX'],['Plano','TX'],['Laredo','TX'],['Lubbock','TX'],['Garland','TX'],['Irving','TX'],['Amarillo','TX'],['Grand Prairie','TX'],['Brownsville','TX'],['Pasadena','TX'],['Killeen','TX'],['McKinney','TX'],['Frisco','TX'],['Mesquite','TX'],['McAllen','TX'],['Waco','TX'],['Carrollton','TX'],['Denton','TX'],['Midland','TX'],['Abilene','TX'],['Beaumont','TX'],['Round Rock','TX'],['Odessa','TX']],
  UT: [['Salt Lake City','UT'],['West Valley City','UT'],['Provo','UT'],['West Jordan','UT'],['Orem','UT'],['Sandy','UT'],['Ogden','UT'],['St. George','UT'],['Layton','UT'],['Taylorsville','UT']],
  VT: [['Burlington','VT'],['South Burlington','VT']],
  VA: [['Virginia Beach','VA'],['Norfolk','VA'],['Chesapeake','VA'],['Richmond','VA'],['Newport News','VA'],['Alexandria','VA'],['Hampton','VA'],['Roanoke','VA'],['Portsmouth','VA'],['Suffolk','VA']],
  WA: [['Seattle','WA'],['Spokane','WA'],['Tacoma','WA'],['Vancouver','WA'],['Bellevue','WA'],['Kent','WA'],['Everett','WA'],['Renton','WA'],['Spokane Valley','WA'],['Federal Way','WA'],['Kirkland','WA'],['Bellingham','WA']],
  WV: [['Charleston','WV'],['Huntington','WV'],['Morgantown','WV'],['Parkersburg','WV']],
  WI: [['Milwaukee','WI'],['Madison','WI'],['Green Bay','WI'],['Kenosha','WI'],['Racine','WI'],['Appleton','WI'],['Waukesha','WI'],['Oshkosh','WI'],['Eau Claire','WI'],['Janesville','WI']],
  WY: [['Cheyenne','WY'],['Casper','WY'],['Laramie','WY'],['Gillette','WY']],
};

// All cities flat list for national chains
const ALL_CITIES = Object.values(CITIES_BY_STATE).flat();

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function randSuffix() {
  return Math.random().toString(36).slice(2, 6);
}

// Build records
const records = [];

// National chains → all cities
for (const chain of NATIONAL_CHAINS) {
  for (const [city, state] of ALL_CITIES) {
    const citySlug = slugify(city);
    const stateSlug = state.toLowerCase();
    const slug = `${chain.slug_prefix}-${citySlug}-${stateSlug}-${randSuffix()}`;
    records.push({
      slug,
      name: chain.name,
      city,
      state,
      is_approved: true,
      is_certified: false,
      is_featured: false,
      is_founding_member: false,
      has_drive_thru: chain.has_drive_thru,
      cuisine_type: chain.cuisine_type || 'Fast Food',
      tipping_policy: 'no_tip_screen',
    });
  }
}

// Regional chains → only their states
for (const chain of REGIONAL_CHAINS) {
  const cities = chain.states.flatMap(s => CITIES_BY_STATE[s] || []);
  const extraCities = chain.extra_cities || [];
  const allCities = [...cities, ...extraCities];
  for (const [city, state] of allCities) {
    const citySlug = slugify(city);
    const stateSlug = state.toLowerCase();
    const slug = `${chain.slug_prefix}-${citySlug}-${stateSlug}-${randSuffix()}`;
    records.push({
      slug,
      name: chain.name,
      city,
      state,
      is_approved: true,
      is_certified: false,
      is_featured: false,
      is_founding_member: false,
      has_drive_thru: chain.has_drive_thru,
      cuisine_type: chain.cuisine_type || 'Fast Food',
      tipping_policy: 'no_tip_screen',
    });
  }
}

console.log(`Total records to seed: ${records.length}`);

// ─── STEP 1: Delete all previously seeded chain records ───────────────────────
const CHAIN_NAMES = [
  "McDonald's","Burger King","Taco Bell","Wendy's","Chick-fil-A","Arby's","Dairy Queen",
  "Popeyes","Five Guys","Panda Express","Little Caesars","Papa John's","Domino's",
  "Jersey Mike's","Raising Cane's","In-N-Out Burger","Whataburger","Jack in the Box",
  "Del Taco","Carl's Jr","Wienerschnitzel","Sonic Drive-In","Hardee's","Steak 'n Shake",
  "Cook Out","Zaxby's","Bojangles","Checkers","Rally's","Krystal","Freddy's Frozen Custard","Portillo's"
];

function supabaseRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'zqmepfdghljknyojfsmq.supabase.co',
      path,
      method,
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'resolution=merge-duplicates,return=minimal' : 'return=minimal',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function deleteChainRecords() {
  console.log('Deleting old seeded chain records...');
  // Delete in batches by chain name using IN filter
  // Supabase supports ?name=in.(A,B,C)
  const nameList = CHAIN_NAMES.map(n => `"${n}"`).join(',');
  const encodedNames = encodeURIComponent(`(${nameList})`);
  // Also protect records with google_place_id — those are real pinned locations, not generic seeds
  const res = await supabaseRequest('DELETE', `/rest/v1/restaurants?name=in.${encodedNames}&is_certified=eq.false&is_founding_member=eq.false&google_place_id=is.null`, null);
  console.log(`Delete response: ${res.status} — ${res.body.slice(0, 200)}`);
}

async function insertBatch(batch) {
  const res = await supabaseRequest('POST', '/rest/v1/restaurants', batch);
  if (res.status !== 201 && res.status !== 200) {
    console.error(`Insert error ${res.status}: ${res.body.slice(0, 300)}`);
    return false;
  }
  return true;
}

async function main() {
  // Step 1: purge old records
  await deleteChainRecords();

  // Step 2: insert new accurate records in batches of 200
  const BATCH_SIZE = 200;
  let inserted = 0;
  let failed = 0;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const ok = await insertBatch(batch);
    if (ok) {
      inserted += batch.length;
    } else {
      failed += batch.length;
    }
    if ((i / BATCH_SIZE) % 10 === 0) {
      process.stdout.write(`\rProgress: ${inserted}/${records.length} inserted...`);
    }
  }
  console.log(`\nDone. Inserted: ${inserted}, Failed: ${failed}`);
}

main().catch(console.error);
