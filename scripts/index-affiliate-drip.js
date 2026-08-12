const {google} = require('googleapis');
const fs = require('fs');

// Shared GCP quota guard — Bartact gets priority (runs at 0:01 UTC)
// This script must not consume quota until Bartact has had its turn
const QUOTA_STATE_PATH = '/home/ubuntu/.openclaw/workspace/memory/gcp-indexing-quota.json';
const GCP_DAILY_LIMIT = 199;
const BARTACT_RESERVED = 80; // minimum reserved for Bartact each night

function getQuotaState() {
  try {
    const d = JSON.parse(fs.readFileSync(QUOTA_STATE_PATH, 'utf8'));
    const today = new Date().toISOString().slice(0, 10);
    if (d.date !== today) return { date: today, used: 0, bartactDone: false };
    return d;
  } catch { return { date: new Date().toISOString().slice(0, 10), used: 0, bartactDone: false }; }
}

function saveQuotaState(state) {
  fs.writeFileSync(QUOTA_STATE_PATH, JSON.stringify(state, null, 2));
}

function checkQuota() {
  const state = getQuotaState();
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMin = now.getUTCMinutes();
  const afterBartact = utcHour > 0 || (utcHour === 0 && utcMin >= 15);
  if (!afterBartact && !state.bartactDone) {
    console.log('Bartact cron has not run yet (before 0:15 UTC) — skipping to preserve quota');
    process.exit(0);
  }
  const remaining = GCP_DAILY_LIMIT - state.used;
  if (remaining <= 0) {
    console.log(`GCP quota exhausted for today (${state.used}/${GCP_DAILY_LIMIT} used) — skipping`);
    process.exit(0);
  }
  return { state, remaining };
}

const QUEUE_FILE = '/home/ubuntu/.openclaw/workspace/memory/indexing-affiliate-queue.json';

const ALL_URLS = [
  'https://whatarebest.com/', 'https://bestseatcover.com/', 'https://jeepseatcover.com/',
  'https://bestbroncoaccessories.com/', 'https://besttruckaccessories.com/',
  'https://besttonneaucovers.com/', 'https://bestcordlesstools.com/', 'https://bestfirestick.com/',
  'https://bestmeshwifi.com/', 'https://bestgarageorganizer.com/', 'https://bestinstantpot.com/',
  'https://bestsmokergrill.com/', 'https://tacticalseatcovers.com/', 'https://wranglerseatcover.com/',
  'https://jlseatcovers.com/', 'https://tacomaseats.com/', 'https://bestoffroadbrands.com/',
  'https://broncograbhandles.com/', 'https://homehvacfilters.com/', 'https://bestwindshieldwiper.com/',
  'https://autopartsreviewed.com/', 'https://topoffroadstores.com/', 'https://gladiatorseatcover.com/',
  'https://broncoseatcover.com/', 'https://tacticalseats.com/'
];

async function run() {
  // Load queue (or init)
  let queue;
  try { queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8')); }
  catch(e) { queue = {remaining: ALL_URLS, done: []}; }

  if (queue.remaining.length === 0) {
    console.log('All affiliate homepages already indexed. Nothing to do.');
    return;
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: '/home/ubuntu/.openclaw/workspace/.gcp-service-account.json',
    scopes: ['https://www.googleapis.com/auth/indexing']
  });
  const client = await auth.getClient();
  const indexing = google.indexing({version: 'v3', auth: client});

  // Try up to 10 per run (conserve quota for Bartact)
  const batch = queue.remaining.slice(0, 10);
  let submitted = 0;

  for (const url of batch) {
    try {
      await indexing.urlNotifications.publish({requestBody: {url, type: 'URL_UPDATED'}});
      console.log('✅', url);
      queue.done.push(url);
      queue.remaining = queue.remaining.filter(u => u !== url);
      submitted++;
    } catch(e) {
      if (e.message.includes('Quota exceeded')) {
        console.log('⚠️ Quota hit after', submitted, 'submissions. Will retry tomorrow.');
        break;
      }
      console.log('❌', url, e.message.substring(0, 60));
    }
    await new Promise(r => setTimeout(r, 500));
  }

  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
  console.log(`\nSubmitted: ${submitted} | Remaining: ${queue.remaining.length} | Done: ${queue.done.length}`);
}

run().catch(e => console.error('Fatal:', e.message));
