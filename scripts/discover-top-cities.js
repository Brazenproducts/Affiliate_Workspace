#!/usr/bin/env node
/**
 * discover-top-cities.js
 * Runs discover-restaurants-from-google.js against the top 50 US cities by population
 */

const { execSync } = require('child_process');
const path = require('path');

const TOP_50 = [
  ['New York','NY'],['Los Angeles','CA'],['Chicago','IL'],['Houston','TX'],
  ['Phoenix','AZ'],['Philadelphia','PA'],['San Antonio','TX'],['San Diego','CA'],
  ['Dallas','TX'],['San Jose','CA'],['Austin','TX'],['Jacksonville','FL'],
  ['Fort Worth','TX'],['Columbus','OH'],['Charlotte','NC'],['Indianapolis','IN'],
  ['San Francisco','CA'],['Seattle','WA'],['Denver','CO'],['Nashville','TN'],
  ['Oklahoma City','OK'],['El Paso','TX'],['Washington','DC'],['Las Vegas','NV'],
  ['Louisville','KY'],['Memphis','TN'],['Portland','OR'],['Baltimore','MD'],
  ['Milwaukee','WI'],['Albuquerque','NM'],['Tucson','AZ'],['Fresno','CA'],
  ['Sacramento','CA'],['Mesa','AZ'],['Kansas City','MO'],['Atlanta','GA'],
  ['Omaha','NE'],['Colorado Springs','CO'],['Raleigh','NC'],['Long Beach','CA'],
  ['Virginia Beach','VA'],['Minneapolis','MN'],['Tampa','FL'],['New Orleans','LA'],
  ['Arlington','TX'],['Bakersfield','CA'],['Honolulu','HI'],['Anaheim','CA'],
  ['Aurora','CO'],['Santa Ana','CA']
];

const script = path.join(__dirname, 'discover-restaurants-from-google.js');
let totalAdded = 0;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log(`\n🇺🇸 Top 50 US Cities Restaurant Discovery`);
  console.log(`   Estimated cost: ~$96 (3,000 Text Search calls @ $32/1,000)\n`);

  for (let i = 0; i < TOP_50.length; i++) {
    const [city, state] = TOP_50[i];
    console.log(`\n[${i+1}/50] ${city}, ${state}`);
    try {
      const out = execSync(
        `node ${script} --city "${city}" --state "${state}"`,
        { timeout: 120000, encoding: 'utf8', cwd: path.join(__dirname, '..') }
      );
      const match = out.match(/Done: \+(\d+) added/);
      const added = match ? parseInt(match[1]) : 0;
      totalAdded += added;
      console.log(`   → +${added} restaurants added`);
    } catch(e) {
      console.log(`   ⚠️  Error: ${e.message?.slice(0,80)}`);
    }
    // Small pause between cities to be polite to API
    if (i < TOP_50.length - 1) await sleep(1000);
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`🎉 DONE — Total new restaurants added: ${totalAdded}`);
  console.log(`   All have real addresses + map pins from Google`);
}

run().catch(console.error);
