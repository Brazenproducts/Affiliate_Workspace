#!/usr/bin/env node
/**
 * set-chain-tip-status.js
 *
 * Bulk-sets tip_screen_status + tip_screen_notes for all restaurants
 * belonging to a chain, based on the chain-registry.js master list.
 *
 * Run once after adding a chain to the registry, or whenever the
 * tip screen status for a chain changes.
 *
 * Cost: $0 — pure Supabase REST writes.
 *
 * Usage:
 *   node scripts/set-chain-tip-status.js              # update ALL chains
 *   node scripts/set-chain-tip-status.js --chain="Subway"
 *   node scripts/set-chain-tip-status.js --dry-run
 */

const path = require('path');
const fs   = require('fs');
const { createClient } = require(path.join(__dirname, '..', 'skipatip', 'node_modules', '@supabase', 'supabase-js'));
const { CHAINS } = require('./chain-registry.js');

const SUPABASE_URL = 'https://zqmepfdghljknyojfsmq.supabase.co';
const envFile   = fs.readFileSync(path.join(__dirname, '..', 'skipatip', '.env.local'), 'utf8');
const SERVICE_KEY = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim();
const supabase  = createClient(SUPABASE_URL, SERVICE_KEY);

const args      = process.argv.slice(2);
const DRY_RUN   = args.includes('--dry-run');
const CHAIN_FILTER = args.find(a => a.startsWith('--chain='))?.split('=').slice(1).join('=');

async function main() {
  console.log(`\n🏷  Chain Tip Status Sync`);
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE WRITE'}\n`);

  const chains = CHAIN_FILTER
    ? CHAINS.filter(c => c.name.toLowerCase().includes(CHAIN_FILTER.toLowerCase()))
    : CHAINS.filter(c => c.tipScreenStatus); // only chains with an explicit status

  let totalUpdated = 0;

  for (const chain of chains) {
    if (!chain.tipScreenStatus) continue;
    process.stdout.write(`  ${chain.name.padEnd(28)} ${chain.tipScreenStatus.padEnd(25)} `);

    if (!DRY_RUN) {
      const { count, error } = await supabase
        .from('restaurants')
        .update({
          tip_screen_status: chain.tipScreenStatus,
          tip_screen_notes:  chain.tipScreenNotes || null,
        })
        .eq('name', chain.name)
        .select('id', { count: 'exact', head: true });

      if (error) { console.log(`❌ ${error.message}`); continue; }
      console.log(`✓ ${count || 0} rows`);
      totalUpdated += (count || 0);
    } else {
      console.log('(dry run)');
    }
  }

  console.log(`\n✅ Done. ${totalUpdated} restaurants updated.`);
}

main().catch(console.error);
