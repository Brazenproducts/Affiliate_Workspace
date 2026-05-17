const {google} = require('googleapis');
const fs = require('fs');

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
