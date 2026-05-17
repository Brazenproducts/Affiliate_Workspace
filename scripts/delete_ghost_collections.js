#!/usr/bin/env node
/**
 * Bartact Ghost COLLECTION URL Cleanup
 * Sends URL_DELETED via Indexing API for Turn 14 ghost collection pages.
 * These were temporarily hidden by 120 prefix removals in Search Console (Mar 19, 2026)
 * that expire ~September 2026. This script permanently removes them.
 *
 * Uses proud-stage-397621 service account, 200/day quota.
 * Shares quota with delete_ghost_urls.js — but that script has nothing left to do.
 *
 * Run daily via cron at 07:05 UTC (same slot as the old product ghost script).
 */
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const CREDENTIALS = path.join(WORKSPACE, '.gcp-service-account.json');
const GHOST_FILE = path.join(WORKSPACE, 'ghost_collection_urls_to_delete.json');
const STATUS_FILE = path.join(WORKSPACE, 'memory', 'ghost-collection-status.json');
const MAX_PER_RUN = 200;

async function main() {
  console.log('=== Bartact Ghost Collection URL Cleanup ===');
  console.log(`Time: ${new Date().toISOString()}`);

  if (!fs.existsSync(GHOST_FILE)) {
    console.log('No ghost collection URLs file found. All done! 🎉');
    const status = { lastRun: new Date().toISOString(), deleted: 0, remaining: 0, message: 'All ghost collection URLs cleared!' };
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
    return;
  }

  const ghosts = JSON.parse(fs.readFileSync(GHOST_FILE, 'utf-8'));
  if (ghosts.length === 0) {
    console.log('Ghost collection URL list is empty. All done! 🎉');
    fs.unlinkSync(GHOST_FILE);
    const status = { lastRun: new Date().toISOString(), deleted: 0, remaining: 0, message: 'All ghost collection URLs cleared!' };
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
    return;
  }

  console.log(`Ghost collection URLs remaining: ${ghosts.length}`);
  console.log(`Will delete up to ${MAX_PER_RUN} this run`);

  const auth = new google.auth.GoogleAuth({ keyFile: CREDENTIALS, scopes: ['https://www.googleapis.com/auth/indexing'] });
  const client = await auth.getClient();
  const indexing = google.indexing({ version: 'v3', auth: client });

  const batch = ghosts.slice(0, MAX_PER_RUN);
  const remaining = ghosts.slice(MAX_PER_RUN);

  let deleted = 0;
  let errors = 0;
  const failedUrls = [];

  for (let i = 0; i < batch.length; i++) {
    const url = batch[i];
    try {
      await indexing.urlNotifications.publish({ requestBody: { url, type: 'URL_DELETED' } });
      deleted++;
      if ((i + 1) % 25 === 0) console.log(`  [${i + 1}/${batch.length}] ${deleted} deleted...`);
    } catch (e) {
      const code = e?.response?.status || e?.code || 'unknown';
      if (code === 429) {
        console.log(`  Quota hit at ${i + 1}. Saving remaining.`);
        remaining.unshift(...batch.slice(i));
        break;
      }
      errors++;
      failedUrls.push(url);
      if (errors > 10) {
        console.log(`  Too many errors (${errors}). Stopping.`);
        remaining.unshift(...batch.slice(i + 1));
        break;
      }
    }
  }

  // Save remaining URLs back
  const allRemaining = [...remaining, ...failedUrls];
  if (allRemaining.length > 0) {
    fs.writeFileSync(GHOST_FILE, JSON.stringify(allRemaining, null, 2));
  } else {
    fs.unlinkSync(GHOST_FILE);
  }

  const estDays = Math.ceil(allRemaining.length / MAX_PER_RUN);
  console.log(`\n=== SUMMARY ===`);
  console.log(`Deleted: ${deleted} | Errors: ${errors} | Remaining: ${allRemaining.length}`);
  if (allRemaining.length > 0) console.log(`Est. days to clear: ${estDays}`);
  else console.log('🎉🎉🎉 ALL GHOST COLLECTION URLS CLEARED! 🎉🎉🎉');

  const status = {
    lastRun: new Date().toISOString(),
    deleted,
    errors,
    remaining: allRemaining.length,
    estDaysToComplete: estDays,
    message: allRemaining.length === 0 ? 'All cleared!' : `${deleted} deleted this run, ${allRemaining.length} remaining (~${estDays} days)`
  };
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
