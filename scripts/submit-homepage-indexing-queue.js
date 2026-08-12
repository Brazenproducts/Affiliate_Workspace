#!/usr/bin/env node
/**
 * Submit expanded affiliate homepage URLs to Google Indexing API from queue.
 * 199 URL/day quota. Run daily until queue is empty.
 * Queue: /home/ubuntu/.openclaw/workspace/memory/homepage-indexing-queue.json
 */
'use strict';

const fs = require('fs');
const { google } = require('googleapis');

const QUEUE_FILE = '/home/ubuntu/.openclaw/workspace/memory/homepage-indexing-queue.json';
const GCP_KEY = '/home/ubuntu/.openclaw/workspace/.gcp-service-account.json';
const BATCH_SIZE = 100; // under 199/day quota; safe margin
const DELAY_MS = 500;

async function main() {
  let queue;
  try { queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8')); }
  catch (e) { console.log('No queue file found. Run expand-homepages-and-index.js first.'); return; }

  if (!queue.pending || queue.pending.length === 0) {
    console.log('✅ All homepage URLs already submitted to Google Indexing API.');
    return;
  }

  const auth = new google.auth.GoogleAuth({ keyFile: GCP_KEY, scopes: ['https://www.googleapis.com/auth/indexing'] });
  const client = await auth.getClient();
  const indexing = google.indexing({ version: 'v3', auth: client });

  const batch = queue.pending.slice(0, BATCH_SIZE);
  console.log(`Submitting ${batch.length} of ${queue.pending.length} remaining URLs…`);

  let submitted = 0;
  for (const url of batch) {
    try {
      await indexing.urlNotifications.publish({ requestBody: { url, type: 'URL_UPDATED' } });
      console.log(`  ✅ ${url}`);
      queue.done.push(url);
      queue.pending = queue.pending.filter(u => u !== url);
      submitted++;
    } catch (e) {
      if (e.message && e.message.includes('Quota')) {
        console.log(`  ⚠️ Quota hit after ${submitted} submissions. Will continue tomorrow.`);
        break;
      }
      console.log(`  ❌ ${url}: ${e.message.substring(0, 60)}`);
    }
    await new Promise(r => setTimeout(r, DELAY_MS));
  }

  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
  console.log(`\nSubmitted: ${submitted} | Remaining: ${queue.pending.length} | Done: ${queue.done.length}`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
