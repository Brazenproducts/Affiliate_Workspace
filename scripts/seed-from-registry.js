#!/usr/bin/env node
/**
 * seed-from-registry.js — Seed a chain into all cities it operates in
 * Uses chain-registry.js as the source of truth.
 * $0 cost — pure Supabase REST, no AI tokens.
 *
 * Usage:
 *   node scripts/seed-from-registry.js --chain="Krystal"
 *   node scripts/seed-from-registry.js --chain="Cook Out" --state=NC
 *   node scripts/seed-from-registry.js --list-chains
 *   node scripts/seed-from-registry.js --dry-run --chain="Krystal"
 */

const path = require('path');
const fs = require('fs');
const { createClient } = require(path.join(__dirname, '..', 'skipatip', 'node_modules', '@supabase', 'supabase-js'));
const { getChain, chainOperatesIn, SEEDABLE } = require('./chain-registry.js');

const SUPABASE_URL = 'https://zqmepfdghljknyojfsmq.supabase.co';
const envFile = fs.readFileSync(path.join(__dirname, '..', 'skipatip', '.env.local'), 'utf8');
const SERVICE_KEY = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim()
  || envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const CHAIN_NAME = args.find(a => a.startsWith('--chain='))?.split('=').slice(1).join('=');
const STATE_FILTER = args.find(a => a.startsWith('--state='))?.split('=')[1];
const LIST = args.includes('--list-chains');

// All US cities we currently have in the DB — pulled fresh each run
async function getCitiesForState(state) {
  const { data } = await supabase
    .from('restaurants')
    .select('city, state')
    .eq('state', state)
    .order('city');
  if (!data) return [];
  const seen = new Set();
  return data.filter(r => {
    const k = `${r.city}|${r.state}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function slugify(name, city, state) {
  const base = `${name}-${city}-${state}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

async function main() {
  if (LIST) {
    console.log('\nSeedable chains in registry:\n');
    SEEDABLE.forEach(c => {
      const scope = c.scope === 'national' ? '🌎 National' : `📍 ${(c.states||[]).join(', ')}`;
      console.log(`  ${c.name.padEnd(25)} ${scope}`);
    });
    return;
  }

  if (!CHAIN_NAME) {
    console.error('Usage: node seed-from-registry.js --chain="Chain Name" [--state=XX] [--dry-run]');
    console.error('       node seed-from-registry.js --list-chains');
    process.exit(1);
  }

  const chain = getChain(CHAIN_NAME);
  if (!chain) {
    console.error(`Chain not found: "${CHAIN_NAME}"`);
    console.error('Run with --list-chains to see available chains.');
    process.exit(1);
  }
  if (chain.do_not_seed) {
    console.error(`❌ ${chain.name} is in the DO NOT SEED list: ${chain.notes}`);
    process.exit(1);
  }

  console.log(`\n🍔 Seeding: ${chain.name}`);
  console.log(`   Scope: ${chain.scope === 'national' ? 'All states' : (chain.states||[]).join(', ')}`);
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE WRITE'}\n`);

  const targetStates = chain.scope === 'national'
    ? ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']
    : (chain.states || []);

  const filteredStates = STATE_FILTER ? targetStates.filter(s => s === STATE_FILTER.toUpperCase()) : targetStates;

  let totalInserted = 0, totalSkipped = 0;

  for (const state of filteredStates) {
    const cities = await getCitiesForState(state);
    if (!cities.length) continue;

    // Which cities already have this chain?
    const { data: existing } = await supabase
      .from('restaurants')
      .select('city')
      .eq('name', chain.name)
      .eq('state', state);
    const existingCities = new Set((existing || []).map(r => r.city.toLowerCase()));

    const toInsert = cities.filter(c => !existingCities.has(c.city.toLowerCase()));
    if (!toInsert.length) {
      console.log(`  ${state}: already seeded in all ${cities.length} cities`);
      totalSkipped += cities.length;
      continue;
    }

    const rows = toInsert.map(c => ({
      name: chain.name,
      slug: slugify(chain.name, c.city, c.state),
      city: c.city,
      state: c.state,
      cuisine_type: chain.cuisine_type || 'American',
      has_drive_thru: chain.has_drive_thru || false,
      has_dine_in: chain.has_dine_in !== false,
      has_takeout: true,
      is_approved: true,
      is_certified: false,
      is_featured: false,
      is_founding_member: false,
    }));

    console.log(`  ${state}: inserting ${rows.length} cities (${existingCities.size} already exist)`);

    if (!DRY_RUN) {
      const { error } = await supabase.from('restaurants').insert(rows);
      if (error) console.error(`    ⚠ insert error: ${error.message}`);
      else totalInserted += rows.length;
    } else {
      totalInserted += rows.length;
    }
  }

  console.log(`\n✅ ${DRY_RUN ? '[DRY RUN] Would insert' : 'Inserted'}: ${totalInserted}`);
  console.log(`⏭  Skipped (already seeded): ${totalSkipped}`);
  console.log(`\nNext: run backfill to get real addresses:`);
  console.log(`  node scripts/backfill-from-store-locators.js --chain="${chain.name}"`);
}

main().catch(console.error);
