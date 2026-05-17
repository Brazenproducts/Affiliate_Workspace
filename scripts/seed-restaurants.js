#!/usr/bin/env node
// seed-restaurants.js — Bulk seed fast food chains into SkipATip Supabase DB

const https = require('https');

const SUPABASE_URL = 'https://zqmepfdghljknyojfsmq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbWVwZmRnaGxqa255b2pmc21xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUzNjgyNCwiZXhwIjoyMDk0MTEyODI0fQ.jtzXSN0ze19VLmVzzx6Vb7-heEW15jPMHVxZ7RisiCc';

// ─── CHAINS ───────────────────────────────────────────────────────────────────
const CHAINS = [
  { name: "McDonald's",              slug_prefix: 'mcdonalds',           has_drive_thru: true  },
  { name: "Burger King",             slug_prefix: 'burger-king',         has_drive_thru: true  },
  { name: "Taco Bell",               slug_prefix: 'taco-bell',           has_drive_thru: true  },
  { name: "Wendy's",                 slug_prefix: 'wendys',              has_drive_thru: true  },
  { name: "Jack in the Box",         slug_prefix: 'jack-in-the-box',     has_drive_thru: true  },
  { name: "Del Taco",                slug_prefix: 'del-taco',            has_drive_thru: true  },
  { name: "Carl's Jr",               slug_prefix: 'carls-jr',            has_drive_thru: true  },
  { name: "In-N-Out Burger",         slug_prefix: 'in-n-out-burger',     has_drive_thru: true  },
  { name: "Raising Cane's",          slug_prefix: 'raising-canes',       has_drive_thru: true  },
  { name: "Wienerschnitzel",         slug_prefix: 'wienerschnitzel',     has_drive_thru: true  },
  { name: "Chick-fil-A",             slug_prefix: 'chick-fil-a',         has_drive_thru: true  },
  { name: "Culver's",                slug_prefix: 'culvers',             has_drive_thru: true  },
  { name: "Arby's",                  slug_prefix: 'arbys',               has_drive_thru: true  },
  { name: "Dairy Queen",             slug_prefix: 'dairy-queen',         has_drive_thru: true  },
  { name: "Freddy's Frozen Custard", slug_prefix: 'freddys-frozen-custard', has_drive_thru: true },
  { name: "Whataburger",             slug_prefix: 'whataburger',         has_drive_thru: true  },
  { name: "Popeyes",                 slug_prefix: 'popeyes',             has_drive_thru: true  },
  { name: "Sonic Drive-In",          slug_prefix: 'sonic-drive-in',      has_drive_thru: true  },
  { name: "Five Guys",               slug_prefix: 'five-guys',           has_drive_thru: false },
  { name: "Hardee's",                slug_prefix: 'hardees',             has_drive_thru: true  },
  { name: "Steak 'n Shake",          slug_prefix: 'steak-n-shake',       has_drive_thru: true  },
  { name: "Cook Out",                slug_prefix: 'cook-out',            has_drive_thru: true  },
  { name: "Zaxby's",                 slug_prefix: 'zaxbys',              has_drive_thru: true  },
  { name: "Bojangles",               slug_prefix: 'bojangles',           has_drive_thru: true  },
  { name: "Checkers",                slug_prefix: 'checkers',            has_drive_thru: true  },
  { name: "Rally's",                 slug_prefix: 'rallys',              has_drive_thru: true  },
  { name: "Krystal",                 slug_prefix: 'krystal',             has_drive_thru: true  },
  { name: "Portillo's",              slug_prefix: 'portillos',           has_drive_thru: false },
];

// ─── CITIES (200+ across all 50 states) ──────────────────────────────────────
// Format: [city, state_abbr]
const CITIES = [
  // Priority cities
  ['Temecula','CA'], ['Murrieta','CA'], ['Champaign','IL'], ['Mattoon','IL'],

  // Alabama
  ['Birmingham','AL'], ['Montgomery','AL'], ['Huntsville','AL'], ['Mobile','AL'], ['Tuscaloosa','AL'],
  // Alaska
  ['Anchorage','AK'], ['Fairbanks','AK'], ['Juneau','AK'],
  // Arizona
  ['Phoenix','AZ'], ['Tucson','AZ'], ['Mesa','AZ'], ['Chandler','AZ'], ['Scottsdale','AZ'],
  ['Glendale','AZ'], ['Gilbert','AZ'], ['Tempe','AZ'], ['Peoria','AZ'], ['Surprise','AZ'],
  // Arkansas
  ['Little Rock','AR'], ['Fort Smith','AR'], ['Fayetteville','AR'], ['Springdale','AR'],
  // California
  ['Los Angeles','CA'], ['San Diego','CA'], ['San Jose','CA'], ['San Francisco','CA'],
  ['Fresno','CA'], ['Sacramento','CA'], ['Long Beach','CA'], ['Oakland','CA'],
  ['Bakersfield','CA'], ['Anaheim','CA'], ['Riverside','CA'], ['Stockton','CA'],
  ['Irvine','CA'], ['Chula Vista','CA'], ['Fremont','CA'], ['San Bernardino','CA'],
  ['Modesto','CA'], ['Fontana','CA'], ['Moreno Valley','CA'], ['Glendale','CA'],
  ['Huntington Beach','CA'], ['Santa Ana','CA'], ['Garden Grove','CA'], ['Oxnard','CA'],
  ['Rancho Cucamonga','CA'], ['Ontario','CA'], ['Corona','CA'], ['Elk Grove','CA'],
  ['Pomona','CA'], ['Escondido','CA'], ['Torrance','CA'], ['Pasadena','CA'],
  ['Fullerton','CA'], ['Orange','CA'], ['Roseville','CA'], ['Visalia','CA'],
  ['Victorville','CA'], ['Sunnyvale','CA'], ['Santa Clarita','CA'], ['Concord','CA'],
  ['Thousand Oaks','CA'], ['Simi Valley','CA'], ['Hayward','CA'], ['Salinas','CA'],
  ['Palmdale','CA'], ['Lancaster','CA'], ['Pomona','CA'], ['Chico','CA'],
  ['Murrieta','CA'], ['Temecula','CA'], ['Vallejo','CA'], ['Antioch','CA'],
  // Colorado
  ['Denver','CO'], ['Colorado Springs','CO'], ['Aurora','CO'], ['Fort Collins','CO'],
  ['Lakewood','CO'], ['Thornton','CO'], ['Arvada','CO'], ['Westminster','CO'],
  ['Pueblo','CO'], ['Boulder','CO'],
  // Connecticut
  ['Bridgeport','CT'], ['New Haven','CT'], ['Hartford','CT'], ['Stamford','CT'], ['Waterbury','CT'],
  // Delaware
  ['Wilmington','DE'], ['Dover','DE'], ['Newark','DE'],
  // Florida
  ['Jacksonville','FL'], ['Miami','FL'], ['Tampa','FL'], ['Orlando','FL'],
  ['St. Petersburg','FL'], ['Hialeah','FL'], ['Tallahassee','FL'], ['Fort Lauderdale','FL'],
  ['Port St. Lucie','FL'], ['Cape Coral','FL'], ['Pembroke Pines','FL'], ['Hollywood','FL'],
  ['Gainesville','FL'], ['Miramar','FL'], ['Coral Springs','FL'], ['Clearwater','FL'],
  ['Palm Bay','FL'], ['Lakeland','FL'], ['West Palm Beach','FL'], ['Pompano Beach','FL'],
  ['Davie','FL'], ['Miami Gardens','FL'], ['Boca Raton','FL'], ['Deltona','FL'],
  ['Sunrise','FL'], ['Plantation','FL'], ['Fort Myers','FL'], ['Deerfield Beach','FL'],
  // Georgia
  ['Atlanta','GA'], ['Columbus','GA'], ['Augusta','GA'], ['Savannah','GA'],
  ['Athens','GA'], ['Sandy Springs','GA'], ['Roswell','GA'], ['Macon','GA'],
  ['Johns Creek','GA'], ['Albany','GA'], ['Warner Robins','GA'], ['Alpharetta','GA'],
  // Hawaii
  ['Honolulu','HI'], ['Pearl City','HI'], ['Hilo','HI'], ['Kailua','HI'],
  // Idaho
  ['Boise','ID'], ['Nampa','ID'], ['Meridian','ID'], ['Idaho Falls','ID'], ['Pocatello','ID'],
  // Illinois
  ['Chicago','IL'], ['Aurora','IL'], ['Rockford','IL'], ['Joliet','IL'],
  ['Naperville','IL'], ['Springfield','IL'], ['Peoria','IL'], ['Elgin','IL'],
  ['Waukegan','IL'], ['Cicero','IL'], ['Champaign','IL'], ['Bloomington','IL'],
  ['Decatur','IL'], ['Evanston','IL'], ['Mattoon','IL'], ['Galesburg','IL'],
  // Indiana
  ['Indianapolis','IN'], ['Fort Wayne','IN'], ['Evansville','IN'], ['South Bend','IN'],
  ['Carmel','IN'], ['Fishers','IN'], ['Bloomington','IN'], ['Hammond','IN'],
  ['Gary','IN'], ['Lafayette','IN'],
  // Iowa
  ['Des Moines','IA'], ['Cedar Rapids','IA'], ['Davenport','IA'], ['Sioux City','IA'],
  ['Iowa City','IA'], ['Waterloo','IA'], ['Ames','IA'],
  // Kansas
  ['Wichita','KS'], ['Overland Park','KS'], ['Kansas City','KS'], ['Topeka','KS'],
  ['Olathe','KS'], ['Lawrence','KS'],
  // Kentucky
  ['Louisville','KY'], ['Lexington','KY'], ['Bowling Green','KY'], ['Owensboro','KY'],
  ['Covington','KY'], ['Richmond','KY'],
  // Louisiana
  ['New Orleans','LA'], ['Baton Rouge','LA'], ['Shreveport','LA'], ['Metairie','LA'],
  ['Lafayette','LA'], ['Lake Charles','LA'], ['Kenner','LA'], ['Bossier City','LA'],
  // Maine
  ['Portland','ME'], ['Lewiston','ME'], ['Bangor','ME'], ['South Portland','ME'],
  // Maryland
  ['Baltimore','MD'], ['Frederick','MD'], ['Rockville','MD'], ['Gaithersburg','MD'],
  ['Bowie','MD'], ['Hagerstown','MD'], ['Annapolis','MD'],
  // Massachusetts
  ['Boston','MA'], ['Worcester','MA'], ['Springfield','MA'], ['Lowell','MA'],
  ['Cambridge','MA'], ['New Bedford','MA'], ['Brockton','MA'], ['Quincy','MA'],
  ['Lynn','MA'], ['Fall River','MA'],
  // Michigan
  ['Detroit','MI'], ['Grand Rapids','MI'], ['Warren','MI'], ['Sterling Heights','MI'],
  ['Ann Arbor','MI'], ['Lansing','MI'], ['Flint','MI'], ['Dearborn','MI'],
  ['Livonia','MI'], ['Westland','MI'], ['Troy','MI'], ['Farmington Hills','MI'],
  ['Kalamazoo','MI'], ['Wyoming','MI'], ['Southfield','MI'],
  // Minnesota
  ['Minneapolis','MN'], ['Saint Paul','MN'], ['Rochester','MN'], ['Duluth','MN'],
  ['Bloomington','MN'], ['Brooklyn Park','MN'], ['Plymouth','MN'], ['Maple Grove','MN'],
  ['Woodbury','MN'], ['St. Cloud','MN'],
  // Mississippi
  ['Jackson','MS'], ['Gulfport','MS'], ['Southaven','MS'], ['Hattiesburg','MS'],
  ['Biloxi','MS'], ['Meridian','MS'],
  // Missouri
  ['Kansas City','MO'], ['Saint Louis','MO'], ['Springfield','MO'], ['Columbia','MO'],
  ['Independence','MO'], ['Lee\'s Summit','MO'], ['O\'Fallon','MO'], ['St. Joseph','MO'],
  ['St. Charles','MO'], ['Blue Springs','MO'],
  // Montana
  ['Billings','MT'], ['Missoula','MT'], ['Great Falls','MT'], ['Bozeman','MT'],
  // Nebraska
  ['Omaha','NE'], ['Lincoln','NE'], ['Bellevue','NE'], ['Grand Island','NE'],
  // Nevada
  ['Las Vegas','NV'], ['Henderson','NV'], ['Reno','NV'], ['North Las Vegas','NV'],
  ['Sparks','NV'], ['Carson City','NV'],
  // New Hampshire
  ['Manchester','NH'], ['Nashua','NH'], ['Concord','NH'], ['Derry','NH'],
  // New Jersey
  ['Newark','NJ'], ['Jersey City','NJ'], ['Paterson','NJ'], ['Elizabeth','NJ'],
  ['Lakewood','NJ'], ['Edison','NJ'], ['Woodbridge','NJ'], ['Toms River','NJ'],
  ['Hamilton','NJ'], ['Trenton','NJ'],
  // New Mexico
  ['Albuquerque','NM'], ['Las Cruces','NM'], ['Rio Rancho','NM'], ['Santa Fe','NM'],
  ['Roswell','NM'],
  // New York
  ['New York City','NY'], ['Buffalo','NY'], ['Rochester','NY'], ['Yonkers','NY'],
  ['Syracuse','NY'], ['Albany','NY'], ['New Rochelle','NY'], ['Mount Vernon','NY'],
  ['Schenectady','NY'], ['Utica','NY'], ['White Plains','NY'], ['Hempstead','NY'],
  ['Troy','NY'], ['Niagara Falls','NY'], ['Binghamton','NY'],
  // North Carolina
  ['Charlotte','NC'], ['Raleigh','NC'], ['Greensboro','NC'], ['Durham','NC'],
  ['Winston-Salem','NC'], ['Fayetteville','NC'], ['Cary','NC'], ['Wilmington','NC'],
  ['High Point','NC'], ['Concord','NC'], ['Greenville','NC'], ['Asheville','NC'],
  // North Dakota
  ['Fargo','ND'], ['Bismarck','ND'], ['Grand Forks','ND'], ['Minot','ND'],
  // Ohio
  ['Columbus','OH'], ['Cleveland','OH'], ['Cincinnati','OH'], ['Toledo','OH'],
  ['Akron','OH'], ['Dayton','OH'], ['Parma','OH'], ['Canton','OH'],
  ['Youngstown','OH'], ['Lorain','OH'], ['Hamilton','OH'], ['Springfield','OH'],
  // Oklahoma
  ['Oklahoma City','OK'], ['Tulsa','OK'], ['Norman','OK'], ['Broken Arrow','OK'],
  ['Lawton','OK'], ['Edmond','OK'], ['Moore','OK'], ['Midwest City','OK'],
  // Oregon
  ['Portland','OR'], ['Salem','OR'], ['Eugene','OR'], ['Gresham','OR'],
  ['Hillsboro','OR'], ['Beaverton','OR'], ['Bend','OR'], ['Medford','OR'],
  // Pennsylvania
  ['Philadelphia','PA'], ['Pittsburgh','PA'], ['Allentown','PA'], ['Erie','PA'],
  ['Reading','PA'], ['Scranton','PA'], ['Bethlehem','PA'], ['Lancaster','PA'],
  ['Harrisburg','PA'], ['Altoona','PA'], ['York','PA'], ['Wilkes-Barre','PA'],
  // Rhode Island
  ['Providence','RI'], ['Cranston','RI'], ['Warwick','RI'], ['Pawtucket','RI'],
  // South Carolina
  ['Columbia','SC'], ['Charleston','SC'], ['North Charleston','SC'], ['Mount Pleasant','SC'],
  ['Rock Hill','SC'], ['Greenville','SC'], ['Summerville','SC'], ['Sumter','SC'],
  // South Dakota
  ['Sioux Falls','SD'], ['Rapid City','SD'], ['Aberdeen','SD'],
  // Tennessee
  ['Nashville','TN'], ['Memphis','TN'], ['Knoxville','TN'], ['Chattanooga','TN'],
  ['Clarksville','TN'], ['Murfreesboro','TN'], ['Franklin','TN'], ['Jackson','TN'],
  ['Johnson City','TN'], ['Bartlett','TN'],
  // Texas
  ['Houston','TX'], ['San Antonio','TX'], ['Dallas','TX'], ['Austin','TX'],
  ['Fort Worth','TX'], ['El Paso','TX'], ['Arlington','TX'], ['Corpus Christi','TX'],
  ['Plano','TX'], ['Laredo','TX'], ['Lubbock','TX'], ['Garland','TX'],
  ['Irving','TX'], ['Amarillo','TX'], ['Grand Prairie','TX'], ['Brownsville','TX'],
  ['McKinney','TX'], ['Frisco','TX'], ['Pasadena','TX'], ['Killeen','TX'],
  ['McAllen','TX'], ['Mesquite','TX'], ['Waco','TX'], ['Carrollton','TX'],
  ['Denton','TX'], ['Midland','TX'], ['Abilene','TX'], ['Beaumont','TX'],
  ['Round Rock','TX'], ['Odessa','TX'], ['Richardson','TX'], ['Tyler','TX'],
  ['Pearland','TX'], ['College Station','TX'], ['Lewisville','TX'], ['League City','TX'],
  ['Wichita Falls','TX'], ['Allen','TX'], ['San Angelo','TX'], ['Sugar Land','TX'],
  // Utah
  ['Salt Lake City','UT'], ['West Valley City','UT'], ['Provo','UT'], ['West Jordan','UT'],
  ['Orem','UT'], ['Sandy','UT'], ['Ogden','UT'], ['St. George','UT'],
  ['Layton','UT'], ['Taylorsville','UT'],
  // Vermont
  ['Burlington','VT'], ['South Burlington','VT'], ['Rutland','VT'],
  // Virginia
  ['Virginia Beach','VA'], ['Norfolk','VA'], ['Chesapeake','VA'], ['Richmond','VA'],
  ['Newport News','VA'], ['Alexandria','VA'], ['Hampton','VA'], ['Roanoke','VA'],
  ['Portsmouth','VA'], ['Suffolk','VA'], ['Lynchburg','VA'], ['Harrisonburg','VA'],
  // Washington
  ['Seattle','WA'], ['Spokane','WA'], ['Tacoma','WA'], ['Vancouver','WA'],
  ['Bellevue','WA'], ['Kent','WA'], ['Everett','WA'], ['Renton','WA'],
  ['Spokane Valley','WA'], ['Federal Way','WA'], ['Kirkland','WA'], ['Bellingham','WA'],
  // West Virginia
  ['Charleston','WV'], ['Huntington','WV'], ['Morgantown','WV'], ['Parkersburg','WV'],
  // Wisconsin
  ['Milwaukee','WI'], ['Madison','WI'], ['Green Bay','WI'], ['Kenosha','WI'],
  ['Racine','WI'], ['Appleton','WI'], ['Waukesha','WI'], ['Oshkosh','WI'],
  ['Eau Claire','WI'], ['Janesville','WI'],
  // Wyoming
  ['Cheyenne','WY'], ['Casper','WY'], ['Laramie','WY'], ['Gillette','WY'],
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function postJSON(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(SUPABASE_URL + path);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'resolution=merge-duplicates,return=minimal',
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ─── BUILD RECORDS ────────────────────────────────────────────────────────────
const records = [];
const seen = new Set();

for (const chain of CHAINS) {
  for (const [city, state] of CITIES) {
    const citySlug = toSlug(city);
    const stateSlug = state.toLowerCase();
    const slug = `${chain.slug_prefix}-${citySlug}-${stateSlug}`;

    if (seen.has(slug)) continue;
    seen.add(slug);

    records.push({
      name: chain.name,
      slug,
      city,
      state,
      is_approved: true,
      is_certified: false,
      restaurant_type: 'fast_food',
      tipping_policy: 'no_tip',
      has_drive_thru: chain.has_drive_thru,
      has_takeout: true,
      has_dine_in: true,
    });
  }
}

// ─── SEED ─────────────────────────────────────────────────────────────────────
const BATCH_SIZE = 100;

async function seed() {
  console.log(`Total records to insert: ${records.length}`);
  const batches = [];
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    batches.push(records.slice(i, i + BATCH_SIZE));
  }
  console.log(`Batches: ${batches.length} (size ${BATCH_SIZE})`);

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    try {
      await postJSON('/rest/v1/restaurants?on_conflict=slug', batch);
      inserted += batch.length;
      if ((i + 1) % 10 === 0 || i === batches.length - 1) {
        console.log(`Inserted batch ${i + 1}/${batches.length} (${inserted} restaurants so far)`);
      }
    } catch (err) {
      errors++;
      console.error(`Batch ${i + 1} error: ${err.message}`);
    }
    // Small delay to avoid hammering the API
    if (i < batches.length - 1) {
      await new Promise(r => setTimeout(r, 50));
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`Records attempted: ${records.length}`);
  console.log(`Batches succeeded: ${batches.length - errors}/${batches.length}`);
  console.log(`Estimated inserted: ${inserted}`);
  console.log(`Batch errors: ${errors}`);
}

seed().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
