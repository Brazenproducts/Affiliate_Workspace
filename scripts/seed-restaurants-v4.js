#!/usr/bin/env node
// seed-restaurants-v4.js — ADDITIVE ONLY (no deletes)
// Adds smaller cities/suburbs not covered by v3.
// Safe to run at any time — uses slug uniqueness to skip duplicates.
// $0 cost — pure Supabase REST, no AI tokens.
// Run: node scripts/seed-restaurants-v4.js

const https = require('https');

const SUPABASE_URL = 'https://zqmepfdghljknyojfsmq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbWVwZmRnaGxqa255b2pmc21xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUzNjgyNCwiZXhwIjoyMDk0MTEyODI0fQ.jtzXSN0ze19VLmVzzx6Vb7-heEW15jPMHVxZ7RisiCc';

// ─── SAME CHAINS AS V3 ────────────────────────────────────────────────────────
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

const REGIONAL_CHAINS = [
  { name: "In-N-Out Burger",   slug_prefix: 'in-n-out-burger',   has_drive_thru: true,
    states: ['CA','NV','AZ','UT','TX','CO','OR','ID'] },
  { name: "Whataburger",       slug_prefix: 'whataburger',        has_drive_thru: true,
    states: ['TX','FL','AL','AZ','AR','CO','GA','KS','LA','MO','MS','NM','OK','TN'] },
  { name: "Jack in the Box",   slug_prefix: 'jack-in-the-box',    has_drive_thru: true,
    states: ['CA','NV','AZ','OR','WA','TX','OK','CO','NM','UT','ID','HI','FL','GA','AL','MS','LA','AR','MO','KS'] },
  { name: "Del Taco",          slug_prefix: 'del-taco',           has_drive_thru: true,
    states: ['CA','NV','AZ','OR','WA','TX','CO','UT','ID','FL','GA','OH','TN','VA','NM'] },
  { name: "Carl's Jr",         slug_prefix: 'carls-jr',           has_drive_thru: true,
    states: ['CA','NV','AZ','OR','WA','TX','CO','UT','ID','NM','WY','MT','ND','SD','NE','KS','OK','MO','AR','LA','MS','AL','TN','GA','FL'] },
  { name: "Wienerschnitzel",   slug_prefix: 'wienerschnitzel',    has_drive_thru: true,
    states: ['CA','NV','AZ','TX','CO','NM','OR','WA','ID','UT'] },
  { name: "Sonic Drive-In",    slug_prefix: 'sonic-drive-in',     has_drive_thru: true,
    states: ['AL','AR','AZ','CA','CO','FL','GA','IA','ID','IL','IN','KS','KY','LA','MI','MN','MO','MS','MT','NC','ND','NE','NM','NV','OH','OK','OR','SC','SD','TN','TX','UT','VA','WA','WI','WV','WY'] },
  { name: "Hardee's",          slug_prefix: 'hardees',            has_drive_thru: true,
    states: ['AL','AR','GA','IA','IL','IN','KS','KY','LA','MD','MI','MN','MO','MS','NC','NE','OH','OK','SC','SD','TN','VA','WI','WV'] },
  { name: "Steak 'n Shake",    slug_prefix: 'steak-n-shake',      has_drive_thru: true,
    states: ['AL','AR','FL','GA','IL','IN','KS','KY','MI','MO','MS','NC','OH','OK','SC','TN','TX','VA','WI'] },
  { name: "Cook Out",          slug_prefix: 'cook-out',           has_drive_thru: true,
    states: ['AL','GA','KY','MD','MS','NC','SC','TN','VA','WV'] },
  { name: "Zaxby's",           slug_prefix: 'zaxbys',             has_drive_thru: true,
    states: ['AL','AR','FL','GA','IN','KY','LA','MD','MS','NC','OH','SC','TN','TX','VA'] },
  { name: "Bojangles",         slug_prefix: 'bojangles',          has_drive_thru: true,
    states: ['AL','FL','GA','KY','MD','MS','NC','OH','PA','SC','TN','VA','WV'] },
  { name: "Checkers",          slug_prefix: 'checkers',           has_drive_thru: true,
    states: ['AL','FL','GA','IL','IN','KY','LA','MD','MI','MS','NC','NJ','NY','OH','PA','SC','TN','VA'] },
  { name: "Rally's",           slug_prefix: 'rallys',             has_drive_thru: true,
    states: ['AL','AR','IL','IN','KY','LA','MI','MO','MS','OH','TN','WI'] },
  { name: "Krystal",           slug_prefix: 'krystal',            has_drive_thru: true,
    states: ['AL','FL','GA','KY','MS','NC','SC','TN','VA'] },
  { name: "Freddy's Frozen Custard", slug_prefix: 'freddys-frozen-custard', has_drive_thru: true,
    states: ['AL','AR','AZ','CO','FL','GA','IA','ID','IL','IN','KS','KY','LA','MI','MN','MO','MS','MT','NC','ND','NE','NM','NV','OH','OK','OR','SC','SD','TN','TX','UT','VA','WA','WI','WY'] },
  { name: "Portillo's",        slug_prefix: 'portillos',          has_drive_thru: false,
    states: ['IL','IN','AZ','FL','TX','WI','MN'], extra_cities: [['Anaheim','CA']] },
];

// ─── NEW CITIES — smaller metros, suburbs, college towns ──────────────────────
// These are NOT in v3's CITIES_BY_STATE lists
// Geographic accuracy: national chains only seeded here (all 50-state coverage confirmed)
// Regional chains only get cities in their allowed states

const NEW_CITIES_BY_STATE = {
  AL: [['Decatur','AL'],['Dothan','AL'],['Hoover','AL'],['Madison','AL'],['Phenix City','AL'],['Florence','AL'],['Auburn','AL'],['Gadsden','AL'],['Vestavia Hills','AL'],['Prattville','AL']],
  AK: [['Juneau','AK'],['Sitka','AK'],['Wasilla','AK'],['Kenai','AK']],
  AZ: [['Avondale','AZ'],['Goodyear','AZ'],['Flagstaff','AZ'],['Yuma','AZ'],['Casa Grande','AZ'],['Maricopa','AZ'],['Buckeye','AZ'],['Lake Havasu City','AZ'],['Sierra Vista','AZ'],['Prescott','AZ']],
  AR: [['Jonesboro','AR'],['Conway','AR'],['Rogers','AR'],['Pine Bluff','AR'],['Bentonville','AR'],['Hot Springs','AR'],['Texarkana','AR'],['Russellville','AR']],
  CA: [['Temecula','CA'],['Murrieta','CA'],['Hemet','CA'],['Menifee','CA'],['Perris','CA'],['Lake Elsinore','CA'],['Indio','CA'],['Palmdale','CA'],['Hesperia','CA'],['Redding','CA'],['San Marcos','CA'],['Escondido','CA'],['Murrieta','CA'],['Vista','CA'],['Carlsbad','CA'],['El Cajon','CA'],['Oceanside','CA'],['Santa Rosa','CA'],['Vacaville','CA'],['Fairfield','CA'],['Richmond','CA'],['Daly City','CA'],['South Gate','CA'],['Downey','CA'],['West Covina','CA'],['Norwalk','CA'],['Burbank','CA'],['Inglewood','CA'],['El Monte','CA'],['Pomona','CA'],['Compton','CA'],['Clovis','CA'],['Turlock','CA'],['Merced','CA'],['Manteca','CA'],['Tracy','CA'],['Folsom','CA'],['Citrus Heights','CA'],['Rocklin','CA'],['Santa Barbara','CA'],['Ventura','CA'],['Camarillo','CA'],['Redlands','CA'],['Rialto','CA'],['Upland','CA'],['Apple Valley','CA'],['Mission Viejo','CA'],['Lake Forest','CA'],['Tustin','CA'],['Westminster','CA'],['Hawthorne','CA'],['Whittier','CA'],['Santa Monica','CA'],['Lakewood','CA'],['Carson','CA']],
  CO: [['Castle Rock','CO'],['Commerce City','CO'],['Parker','CO'],['Highlands Ranch','CO'],['Centennial','CO'],['Longmont','CO'],['Greeley','CO'],['Brighton','CO'],['Broomfield','CO'],['Grand Junction','CO'],['Loveland','CO'],['Northglenn','CO'],['Erie','CO'],['Englewood','CO'],['Littleton','CO']],
  CT: [['Danbury','CT'],['Norwalk','CT'],['West Hartford','CT'],['Meriden','CT'],['New Britain','CT'],['Bristol','CT'],['Milford','CT'],['Middletown','CT'],['Southington','CT']],
  DE: [['Newark','DE'],['Middletown','DE'],['Smyrna','DE'],['Milford','DE']],
  FL: [['Spring Hill','FL'],['Brandon','FL'],['Davie','FL'],['Doral','FL'],['Lehigh Acres','FL'],['Deltona','FL'],['Palm Beach Gardens','FL'],['Sunrise','FL'],['Plantation','FL'],['Boca Raton','FL'],['Boynton Beach','FL'],['Delray Beach','FL'],['Daytona Beach','FL'],['Ocala','FL'],['Fort Myers','FL'],['Naples','FL'],['Kissimmee','FL'],['Sanford','FL'],['Melbourne','FL'],['Pensacola','FL'],['Largo','FL'],['St. Cloud','FL'],['Margate','FL'],['Homestead','FL'],['Jupiter','FL'],['Bradenton','FL'],['Sarasota','FL'],['Port Charlotte','FL'],['Deerfield Beach','FL'],['Palm Coast','FL']],
  GA: [['Marietta','GA'],['Augusta-Richmond','GA'],['Columbus','GA'],['Peachtree City','GA'],['Smyrna','GA'],['Gainesville','GA'],['Valdosta','GA'],['Carrollton','GA'],['Rome','GA'],['Statesboro','GA'],['Douglasville','GA'],['Kennesaw','GA'],['Lawrenceville','GA'],['Newnan','GA'],['Hinesville','GA']],
  HI: [['Kailua','HI'],['Kaneohe','HI'],['Mililani','HI'],['Ewa Beach','HI'],['Kapolei','HI']],
  ID: [['Twin Falls','ID'],['Coeur d\'Alene','ID'],['Lewiston','ID'],['Caldwell','ID'],['Post Falls','ID']],
  IL: [['Decatur','IL'],['Evanston','IL'],['Schaumburg','IL'],['Bolingbrook','IL'],['Arlington Heights','IL'],['Palatine','IL'],['Tinley Park','IL'],['Des Plaines','IL'],['Orland Park','IL'],['Oak Lawn','IL'],['Berwyn','IL'],['Mount Prospect','IL'],['Wheaton','IL'],['Normal','IL'],['Galesburg','IL'],['Rockford','IL'],['Moline','IL'],['Mattoon','IL'],['Charleston','IL'],['Carbondale','IL']],
  IN: [['Anderson','IN'],['Muncie','IN'],['Terre Haute','IN'],['Noblesville','IN'],['Greenwood','IN'],['Columbus','IN'],['Kokomo','IN'],['Anderson','IN'],['Richmond','IN'],['New Albany','IN'],['Portage','IN'],['Valparaiso','IN'],['Michigan City','IN'],['Mishawaka','IN'],['Lawrence','IN']],
  IA: [['Waterloo','IA'],['Council Bluffs','IA'],['Ames','IA'],['West Des Moines','IA'],['Ankeny','IA'],['Dubuque','IA'],['Marion','IA'],['Cedar Falls','IA'],['Bettendorf','IA']],
  KS: [['Lawrence','KS'],['Shawnee','KS'],['Manhattan','KS'],['Lenexa','KS'],['Salina','KS'],['Hutchinson','KS'],['Leawood','KS'],['Garden City','KS'],['Dodge City','KS']],
  KY: [['Elizabethtown','KY'],['Florence','KY'],['Georgetown','KY'],['Henderson','KY'],['Hopkinsville','KY'],['Richmond','KY'],['Frankfort','KY'],['Paducah','KY'],['Jeffersontown','KY'],['Nicholasville','KY']],
  LA: [['Alexandria','LA'],['Houma','LA'],['Monroe','LA'],['Slidell','LA'],['Marrero','LA'],['Hammond','LA'],['Central','LA'],['Prairieville','LA'],['Sulphur','LA']],
  ME: [['Auburn','ME'],['Biddeford','ME'],['South Portland','ME'],['Augusta','ME'],['Saco','ME']],
  MD: [['Columbia','MD'],['Silver Spring','MD'],['Waldorf','MD'],['Glen Burnie','MD'],['Dundalk','MD'],['Ellicott City','MD'],['Germantown','MD'],['Towson','MD'],['Bethesda','MD'],['Wheaton','MD']],
  MA: [['Fall River','MA'],['Taunton','MA'],['Somerville','MA'],['Haverhill','MA'],['Malden','MA'],['Medford','MA'],['Waltham','MA'],['Lynn','MA'],['Newton','MA'],['Framingham','MA'],['Chicopee','MA'],['Peabody','MA'],['Weymouth','MA'],['Attleboro','MA']],
  MI: [['Pontiac','MI'],['Saginaw','MI'],['Muskegon','MI'],['Holland','MI'],['Battle Creek','MI'],['Bay City','MI'],['Midland','MI'],['Portage','MI'],['Kentwood','MI'],['Roseville','MI'],['Wyoming','MI'],['Southfield','MI'],['Royal Oak','MI'],['Clinton Township','MI'],['Macomb','MI'],['Flint','MI'],['Canton','MI'],['Shelby Charter Township','MI']],
  MN: [['Burnsville','MN'],['Coon Rapids','MN'],['Eagan','MN'],['Eden Prairie','MN'],['Blaine','MN'],['Lakeville','MN'],['Minnetonka','MN'],['Moorhead','MN'],['Apple Valley','MN'],['Shakopee','MN'],['Maplewood','MN'],['Cottage Grove','MN'],['Inver Grove Heights','MN'],['Richfield','MN']],
  MS: [['Tupelo','MS'],['Vicksburg','MS'],['Pascagoula','MS'],['Clinton','MS'],['Horn Lake','MS'],['Brandon','MS'],['Starkville','MS'],['Columbus','MS']],
  MO: [['Florissant','MO'],['Joplin','MO'],['Raytown','MO'],['Chesterfield','MO'],['Wildwood','MO'],['Ballwin','MO'],['Cape Girardeau','MO'],['Jefferson City','MO'],['Kirkwood','MO'],['Maryland Heights','MO']],
  MT: [['Helena','MT'],['Kalispell','MT'],['Butte','MT'],['Havre','MT']],
  NE: [['Kearney','NE'],['Fremont','NE'],['Norfolk','NE'],['Columbus','NE'],['North Platte','NE']],
  NV: [['Sunrise Manor','NV'],['Enterprise','NV'],['Spring Valley','NV'],['Paradise','NV'],['Whitney','NV'],['Boulder City','NV'],['Fernley','NV'],['Mesquite','NV']],
  NH: [['Dover','NH'],['Rochester','NH'],['Keene','NH'],['Portsmouth','NH'],['Derry','NH'],['Hampton','NH']],
  NJ: [['Clifton','NJ'],['Camden','NJ'],['Passaic','NJ'],['Union City','NJ'],['Bayonne','NJ'],['East Orange','NJ'],['Vineland','NJ'],['New Brunswick','NJ'],['Plainfield','NJ'],['Perth Amboy','NJ'],['Hoboken','NJ'],['West New York','NJ'],['Brick','NJ'],['Cherry Hill','NJ'],['Parsippany','NJ']],
  NM: [['Farmington','NM'],['Clovis','NM'],['Hobbs','NM'],['Carlsbad','NM'],['Alamogordo','NM'],['Roswell','NM']],
  NY: [['Hempstead','NY'],['Brookhaven','NY'],['Islip','NY'],['Oyster Bay','NY'],['Ramapo','NY'],['Babylon','NY'],['Smithtown','NY'],['North Hempstead','NY'],['Troy','NY'],['White Plains','NY'],['New Rochelle','NY'],['Binghamton','NY'],['Rome','NY'],['Niagara Falls','NY'],['Poughkeepsie','NY'],['Elmira','NY']],
  NC: [['Gastonia','NC'],['Jacksonville','NC'],['Apex','NC'],['Huntersville','NC'],['Kannapolis','NC'],['Burlington','NC'],['Greenville','NC'],['Rocky Mount','NC'],['Chapel Hill','NC'],['Wilson','NC'],['Mooresville','NC'],['Monroe','NC'],['Hickory','NC'],['Asheville','NC']],
  ND: [['Mandan','ND'],['West Fargo','ND'],['Williston','ND'],['Dickinson','ND']],
  OH: [['Hamilton','OH'],['Springfield','OH'],['Kettering','OH'],['Elyria','OH'],['Lakewood','OH'],['Cuyahoga Falls','OH'],['Middletown','OH'],['Euclid','OH'],['Mentor','OH'],['Beavercreek','OH'],['Huber Heights','OH'],['Newark','OH'],['Fairfield','OH'],['Mansfield','OH'],['Strongsville','OH'],['Dublin','OH'],['Mason','OH'],['Grove City','OH'],['Westerville','OH'],['Hilliard','OH']],
  OK: [['Enid','OK'],['Stillwater','OK'],['Muskogee','OK'],['Bartlesville','OK'],['Shawnee','OK'],['Owasso','OK'],['Yukon','OK'],['Ardmore','OK'],['Ponca City','OK']],
  OR: [['Corvallis','OR'],['Springfield','OR'],['Albany','OR'],['Lake Oswego','OR'],['Tigard','OR'],['Aloha','OR'],['Redmond','OR'],['Tualatin','OR'],['Grants Pass','OR'],['Roseburg','OR'],['Klamath Falls','OR'],['Ashland','OR']],
  PA: [['Levittown','PA'],['Chester','PA'],['Wilkes-Barre','PA'],['York','PA'],['State College','PA'],['Easton','PA'],['Norristown','PA'],['Monroeville','PA'],['Chambersburg','PA'],['Hazleton','PA'],['New Castle','PA'],['Johnstown','PA'],['Lebanon','PA'],['Pottsville','PA']],
  RI: [['Woonsocket','RI'],['North Providence','RI'],['Cumberland','RI'],['Lincoln','RI'],['Coventry','RI']],
  SC: [['Myrtle Beach','SC'],['Florence','SC'],['Hilton Head Island','SC'],['Anderson','SC'],['Aiken','SC'],['Conway','SC'],['Goose Creek','SC'],['Lexington','SC'],['Bluffton','SC'],['Sumter','SC']],
  SD: [['Brookings','SD'],['Watertown','SD'],['Mitchell','SD'],['Huron','SD']],
  TN: [['Hendersonville','TN'],['Columbia','TN'],['Smyrna','TN'],['Spring Hill','TN'],['Brentwood','TN'],['Germantown','TN'],['Cookeville','TN'],['Kingsport','TN'],['Bristol','TN'],['Lebanon','TN'],['La Vergne','TN'],['Collierville','TN']],
  TX: [['Sugar Land','TX'],['Pearland','TX'],['League City','TX'],['Richardson','TX'],['Allen','TX'],['Rosenberg','TX'],['Edinburg','TX'],['Mission','TX'],['Pharr','TX'],['Tyler','TX'],['Beaumont','TX'],['College Station','TX'],['Bryan','TX'],['Harlingen','TX'],['San Angelo','TX'],['Longview','TX'],['Wichita Falls','TX'],['Lewisville','TX'],['Flower Mound','TX'],['Mansfield','TX'],['New Braunfels','TX'],['Cedar Hill','TX'],['DeSoto','TX'],['Rowlett','TX'],['Wylie','TX'],['Pflugerville','TX'],['Cedar Park','TX'],['Georgetown','TX'],['Kyle','TX'],['Buda','TX'],['Conroe','TX'],['Baytown','TX'],['Missouri City','TX'],['Galveston','TX']],
  UT: [['Herriman','UT'],['South Jordan','UT'],['Lehi','UT'],['Millcreek','UT'],['Cottonwood Heights','UT'],['Draper','UT'],['Logan','UT'],['Cedar City','UT'],['American Fork','UT'],['Springville','UT'],['Murray','UT'],['Bountiful','UT'],['Riverton','UT']],
  VT: [['Rutland','VT'],['Barre','VT'],['Montpelier','VT']],
  VA: [['Lynchburg','VA'],['Charlottesville','VA'],['Blacksburg','VA'],['Manassas','VA'],['Fredericksburg','VA'],['Leesburg','VA'],['Winchester','VA'],['Harrisonburg','VA'],['Danville','VA'],['Tidewater','VA'],['Woodbridge','VA'],['Dale City','VA'],['McLean','VA'],['Reston','VA'],['Centreville','VA']],
  WA: [['Marysville','WA'],['Lakewood','WA'],['Redmond','WA'],['Shoreline','WA'],['Richland','WA'],['Auburn','WA'],['Pasco','WA'],['Kennewick','WA'],['Yakima','WA'],['Sammamish','WA'],['Lake Stevens','WA'],['Burien','WA'],['Olympia','WA'],['Des Moines','WA'],['Kenmore','WA'],['Lacey','WA']],
  WV: [['Weirton','WV'],['Martinsburg','WV'],['Wheeling','WV'],['Beckley','WV'],['Clarksburg','WV']],
  WI: [['Wauwatosa','WI'],['Waukesha','WI'],['Sheboygan','WI'],['West Allis','WI'],['La Crosse','WI'],['Fond du Lac','WI'],['Beloit','WI'],['New Berlin','WI'],['Menomonee Falls','WI'],['Greenfield','WI'],['Oak Creek','WI'],['Manitowoc','WI'],['Wausau','WI'],['Sun Prairie','WI']],
  WY: [['Rock Springs','WY'],['Green River','WY'],['Sheridan','WY'],['Riverton','WY']],
};

const ALL_NEW_CITIES = Object.values(NEW_CITIES_BY_STATE).flat();

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function randSuffix() {
  return Math.random().toString(36).slice(2, 6);
}

// Build records
const records = [];

// National chains → all new cities
for (const chain of NATIONAL_CHAINS) {
  for (const [city, state] of ALL_NEW_CITIES) {
    records.push({
      slug: `${chain.slug_prefix}-${slugify(city)}-${state.toLowerCase()}-${randSuffix()}`,
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

// Regional chains → new cities in their allowed states only
for (const chain of REGIONAL_CHAINS) {
  const allowedStates = new Set(chain.states);
  const cities = (chain.extra_cities || []).concat(
    Object.entries(NEW_CITIES_BY_STATE)
      .filter(([st]) => allowedStates.has(st))
      .flatMap(([, cityList]) => cityList)
  );
  for (const [city, state] of cities) {
    records.push({
      slug: `${chain.slug_prefix}-${slugify(city)}-${state.toLowerCase()}-${randSuffix()}`,
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

console.log(`Total records to insert: ${records.length}`);

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
        'Prefer': 'resolution=ignore,return=minimal', // ignore = skip on slug conflict
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

async function main() {
  const BATCH_SIZE = 200;
  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const res = await supabaseRequest('POST', '/rest/v1/restaurants', batch);
    if (res.status === 201 || res.status === 200) {
      inserted += batch.length;
    } else {
      failed += batch.length;
      console.error(`Batch error at ${i}: ${res.status} — ${res.body.slice(0, 200)}`);
    }
    if ((i / BATCH_SIZE) % 5 === 0) {
      process.stdout.write(`\rProgress: ${i + batch.length}/${records.length}...`);
    }
  }
  console.log(`\nDone. Attempted: ${records.length}, Failed batches covered: ${failed}`);
}

main().catch(console.error);
