#!/usr/bin/env node
/**
 * GROK REVIEW ENRICHER — Turbocharge RecentRatings/SkipATip pipeline
 *
 * Problem: 491,997 places need reviews. Google Places API = max 5 reviews/place,
 * 450 calls/day with current keys = 1,093 days to complete.
 *
 * Grok solution: For each place, ask Grok (with live search) to find:
 * - Recent reviews from Google Maps, Yelp, TripAdvisor, Facebook
 * - Hours, price level, menu highlights, notable dishes
 * - Whether the place has a tip screen / tip pressure (SkipATip classification)
 * - Category confirmation (restaurant, spa, salon, gym, etc.)
 * - Whether permanently closed
 *
 * Grok processes 10-20 places per API call in batch = ~$0.002/place vs
 * Google Places Detail API = $0.017/place (8.5x cheaper + more data).
 *
 * Usage:
 *   node grok-review-enricher.js --limit=50
 *   node grok-review-enricher.js --city="Austin" --state="TX" --limit=100
 *   node grok-review-enricher.js --category=restaurant --limit=100
 *   node grok-review-enricher.js --business-type=all --limit=200
 */

const fs   = require('fs');
const https = require('https');

const GROK_KEY = 'xai-S5hLItB2sSmg3xR10q6UPzUvlTjDKA1riY44VljVHiZP7jQrTBVhI8QkZvo7OuuLd1VPctYX560cHhhr';
const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const env = {};
fs.readFileSync(`${WORKSPACE}/skipatip/.env.local`, 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const TELEGRAM_TOKEN = (() => {
  const main = {};
  fs.readFileSync(`${WORKSPACE}/.env`, 'utf8').split('\n').forEach(l => {
    const [k,...v] = l.split('='); if(k&&v.length) main[k.trim()]=v.join('=').trim();
  });
  return main.TELEGRAM_TOKEN || main.SLASHDADDY_TELEGRAM_TOKEN;
})();
const TELEGRAM_CHAT = '7550065844';

const args = Object.fromEntries(
  process.argv.slice(2).filter(a => a.startsWith('--')).map(a => a.slice(2).split('='))
);
const LIMIT        = parseInt(args.limit || '50');
const CITY         = args.city || null;
const STATE        = args.state || null;
const CATEGORY     = args.category || null;
const BATCH_SIZE   = 10; // places per Grok call
const DRY_RUN      = args['dry-run'] === 'true';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function supaFetch(path, opts = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': opts.prefer || 'return=minimal',
      ...opts.headers,
    },
    ...opts,
  }).then(r => r.json());
}

async function grokBatch(prompt) {
  // New endpoint: POST /v1/responses with tools:[{type:"web_search"}] (old search_parameters is 410)
  const resp = await fetch('https://api.x.ai/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROK_KEY}` },
    body: JSON.stringify({
      model: 'grok-4',
      tools: [{ type: 'web_search' }],
      input: prompt,
      max_output_tokens: 4000,
    }),
  });
  const d = await resp.json();
  // /v1/responses returns output array; find the message output item
  const outputItem = Array.isArray(d.output) ? d.output.find(o => o.type === 'message') : null;
  return outputItem?.content?.[0]?.text || d.output_text || d.error?.message || '';
}

async function sendTelegram(msg) {
  if (!TELEGRAM_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT, text: msg, parse_mode: 'HTML' }),
  });
}

// ─── GET PLACES NEEDING ENRICHMENT ───────────────────────────────────────────
async function getPlacesNeedingReviews() {
  let url = `places_raw?is_permanently_closed=eq.false&order=google_review_count.desc&limit=${LIMIT}`;
  url += `&or=(reviews_synced_at.is.null,reviews_synced_at.lt.${new Date(Date.now() - 30*86400000).toISOString()})`;
  if (CITY)  url += `&city=ilike.*${CITY}*`;
  if (STATE) url += `&state_code=eq.${STATE}`;
  if (CATEGORY) url += `&business_category=eq.${CATEGORY}`;

  const data = await supaFetch(url, {
    headers: { 'Prefer': 'count=exact' },
  });
  return Array.isArray(data) ? data : [];
}

// ─── GROK BATCH ENRICHMENT ────────────────────────────────────────────────────
async function enrichBatch(places) {
  const listStr = places.map((p, i) =>
    `${i+1}. "${p.name}" — ${p.address || ''}, ${p.city}, ${p.state_code} (Google place_id: ${p.google_place_id})`
  ).join('\n');

  const prompt = `You have live web search. For each business below, search Google Maps, Yelp, TripAdvisor, and Facebook RIGHT NOW.

Return ONLY a valid JSON array. One object per business. Fields:
- index: (1-based, matches list)
- foundOnline: true/false
- permanentlyClosed: true/false (confirmed closed = true)
- rating: number 1-5 or null
- reviewCount: integer or null
- recentReviews: array of up to 5 objects: { author, rating (1-5), text (max 200 chars), source ("google"|"yelp"|"tripadvisor"), daysAgo (integer) }
- priceLevel: 1-4 ($ to $$$$) or null
- primaryCategory: short string e.g. "Italian Restaurant", "Hair Salon", "Auto Repair"
- hasTipScreen: true/false/null (null=unknown; true if counter service with tip prompt; false if confirmed no tip screen)
- tipFreeReason: string or null (e.g. "fast food counter", "self checkout only")
- notableFeatures: array of strings (e.g. ["outdoor seating","dog friendly","BYOB"])
- hours: string or null (e.g. "Mon-Fri 9am-9pm, Sat-Sun 10am-8pm")

If you can't find a business, set foundOnline:false and leave other fields null.
No markdown, no commentary — raw JSON array only.

Businesses:
${listStr}`;

  const raw = await grokBatch(prompt);

  try {
    const clean = raw.replace(/```json\n?|```\n?/g, '').trim();
    const match = clean.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch (e) {
    console.warn('  ⚠️ Batch parse failed:', raw.substring(0, 300));
    return [];
  }
}

// ─── SAVE TO SUPABASE ────────────────────────────────────────────────────────
async function savePlaceEnrichment(place, enriched) {
  const now = new Date().toISOString();

  // Update places_raw
  const update = {
    reviews_synced_at: now,
    updated_at: now,
    is_permanently_closed: enriched.permanentlyClosed || false,
    ...(enriched.rating && { google_rating: enriched.rating }),
    ...(enriched.reviewCount && { google_review_count: enriched.reviewCount }),
    ...(enriched.priceLevel && { price_level: enriched.priceLevel }),
    ...(enriched.primaryCategory && { primary_category: enriched.primaryCategory }),
    ...(enriched.hasTipScreen === false && { is_tip_free: true }),
    ...(enriched.hasTipScreen === true && { is_tip_free: false }),
  };

  await supaFetch(`places_raw?id=eq.${place.id}`, {
    method: 'PATCH',
    body: JSON.stringify(update),
  });

  // Save reviews to reviews_cache
  if (enriched.recentReviews?.length) {
    const reviews = enriched.recentReviews.map(r => ({
      place_id: place.id,
      google_place_id: place.google_place_id,
      source: r.source || 'grok',
      review_id: `grok-${place.google_place_id}-${r.author}-${r.daysAgo}`.replace(/\s+/g, '-').substring(0, 200),
      author_name: r.author || 'Anonymous',
      rating: r.rating,
      text: r.text,
      time_published: r.daysAgo ? new Date(Date.now() - r.daysAgo * 86400000).toISOString() : now,
      days_ago: r.daysAgo,
    }));

    await supaFetch(`reviews_cache`, {
      method: 'POST',
      prefer: 'resolution=ignore-duplicates',
      body: JSON.stringify(reviews),
    });
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  const startTime = Date.now();
  const date = new Date().toISOString().split('T')[0];
  console.log(`\n🚀 Grok Review Enricher — ${date}`);
  console.log(`   Limit: ${LIMIT} | City: ${CITY || 'all'} | Category: ${CATEGORY || 'all'}\n`);

  const places = await getPlacesNeedingReviews();
  console.log(`📋 Found ${places.length} places needing enrichment\n`);

  if (!places.length) { console.log('✅ All caught up!'); return; }

  let totalEnriched = 0, totalReviews = 0, totalClosed = 0, totalErrors = 0;

  // Process in batches of BATCH_SIZE
  for (let i = 0; i < places.length; i += BATCH_SIZE) {
    const batch = places.slice(i, i + BATCH_SIZE);
    console.log(`⚡ Batch ${Math.floor(i/BATCH_SIZE)+1}/${Math.ceil(places.length/BATCH_SIZE)} — ${batch.map(p=>p.name).join(', ').substring(0,80)}...`);

    if (DRY_RUN) { console.log('  [DRY RUN]'); continue; }

    try {
      const enriched = await enrichBatch(batch);

      for (const result of enriched) {
        const place = batch[result.index - 1];
        if (!place) continue;

        if (!result.foundOnline) {
          console.log(`  ⚠️ Not found online: ${place.name}`);
          continue;
        }
        if (result.permanentlyClosed) {
          totalClosed++;
          console.log(`  🔴 Closed: ${place.name}`);
        }

        await savePlaceEnrichment(place, result);
        totalEnriched++;
        totalReviews += result.recentReviews?.length || 0;
        process.stdout.write(`  ✅ ${place.name} — ${result.recentReviews?.length || 0} reviews, rating: ${result.rating || 'n/a'}\n`);
      }
    } catch (e) {
      console.error(`  ❌ Batch error: ${e.message}`);
      totalErrors++;
    }

    // Rate limit: ~1 Grok call per 2s is fine
    if (i + BATCH_SIZE < places.length) await delay(2000);
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  const msg = `<b>⚡ Grok Review Enricher</b>\n${date}\n\n` +
    `✅ Enriched: ${totalEnriched}\n⭐ Reviews saved: ${totalReviews}\n🔴 Closed: ${totalClosed}\n❌ Errors: ${totalErrors}\n⏱ Time: ${elapsed}s\n💰 Est. cost: ~$${(Math.ceil(places.length/BATCH_SIZE)*0.02).toFixed(2)}`;

  console.log('\n' + msg.replace(/<[^>]+>/g, ''));
  await sendTelegram(msg);

  // Log to state file
  fs.writeFileSync(`${WORKSPACE}/memory/grok-enricher-state.json`, JSON.stringify({
    lastRun: new Date().toISOString(), totalEnriched, totalReviews, totalClosed, totalErrors, elapsedSeconds: elapsed
  }, null, 2));
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
