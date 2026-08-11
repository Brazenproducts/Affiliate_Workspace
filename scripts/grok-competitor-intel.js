#!/usr/bin/env node
/**
 * GROK COMPETITOR INTELLIGENCE — Universal Daily Cron
 *
 * Runs for every brand daily. Uses Grok live web search to:
 *   1. Check SERP positions for all priority keywords
 *   2. Find who's beating us and why (word count, schema, content angles)
 *   3. Detect new competitors entering our keyword space
 *   4. Spot competitor price changes / promotions
 *   5. Alert on competitor PR issues we can exploit as content angles
 *   6. Check for new Jeep/Bronco/truck model announcements (fitment changes)
 *   7. Monitor anti-dumping / legal news (Elipacko)
 *
 * Usage:
 *   node grok-competitor-intel.js --brand=bartact
 *   node grok-competitor-intel.js --brand=bullstrap
 *   node grok-competitor-intel.js --brand=elipacko
 *   node grok-competitor-intel.js --brand=affiliate
 */

const fs = require('fs');
const https = require('https');

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const env = {};
fs.readFileSync(`${WORKSPACE}/.env`, 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const GROK_KEY = 'xai-S5hLItB2sSmg3xR10q6UPzUvlTjDKA1riY44VljVHiZP7jQrTBVhI8QkZvo7OuuLd1VPctYX560cHhhr';
const TELEGRAM_TOKEN = env.TELEGRAM_TOKEN || env.SLASHDADDY_TELEGRAM_TOKEN;
const TELEGRAM_CHAT = '7550065844';

const brand = (process.argv.find(a => a.startsWith('--brand=')) || '--brand=bartact').split('=')[1];

// ─── BRAND PROFILES ────────────────────────────────────────────────────────────
const BRAND_PROFILES = {
  bartact: {
    name: 'Bartact',
    domain: 'bartact.com',
    priorityKeywords: [
      'jeep wrangler seat covers', 'ford bronco seat covers', 'jeep gladiator seat covers',
      'jeep wrangler jl seat covers', 'jeep grab handles', 'molle seat covers',
      'jeep fire extinguisher mount', 'winch cover', 'jeep limit straps'
    ],
    competitors: ['smittybilt.com', 'prpseats.com', 'roughcountry.com', 'extremeterrain.com', 'quadratec.com', 'wranglerspecs.com'],
    newsQueries: [
      'new Jeep Wrangler model announcement 2026 2027',
      'Ford Bronco new model year changes 2026 2027',
      'Jeep Gladiator new trim 2026',
    ],
    legalQueries: [],
    priceCheckProducts: ['bartact seat covers jeep wrangler price', 'smittybilt seat covers jeep price'],
  },
  bullstrap: {
    name: 'Bull Strap',
    domain: 'bullstrap.com',
    priorityKeywords: [
      'jeep limit straps', 'axle limit straps', 'jeep jl limit straps',
      'off road limit straps', 'jeep wrangler limit straps'
    ],
    competitors: ['evo-mfg.com', 'teraflex.com', 'roughcountry.com', 'artec-industries.com'],
    newsQueries: ['jeep wrangler aftermarket suspension 2026', 'axle limit strap recall safety'],
    legalQueries: [],
    priceCheckProducts: ['limit straps jeep price amazon'],
  },
  elipacko: {
    name: 'Elipacko',
    domain: 'elipacko-usa.com',
    priorityKeywords: [
      'polypropylene corrugated boxes', 'pp turnover boxes', 'reusable plastic containers manufacturer',
      'bulk polypropylene storage boxes', 'industrial plastic dividers'
    ],
    competitors: ['inplasticcorp.com', 'greystone.com', 'orbis.com', 'buckhorn.com'],
    newsQueries: [],
    legalQueries: [
      'polypropylene anti-dumping duty China 2026',
      'DOC preliminary determination plastic containers China',
      'anti-dumping duty Thailand polypropylene 2026',
    ],
    priceCheckProducts: ['polypropylene corrugated boxes bulk price'],
  },
  affiliate: {
    name: 'Affiliate Sites',
    domain: 'brazenauto.com',
    priorityKeywords: [
      'best jeep seat covers', 'best limit straps jeep', 'best winch cover',
      'best grab handles jeep wrangler'
    ],
    competitors: ['thedriven.com', 'motortrend.com', 'jk-forum.com'],
    newsQueries: ['Amazon affiliate program changes 2026', 'Amazon Associates commission rate 2026'],
    legalQueries: [],
    priceCheckProducts: [],
  }
};

const profile = BRAND_PROFILES[brand] || BRAND_PROFILES.bartact;

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function httpsPost(host, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      { hostname: host, path, method: 'POST', headers: { 'Content-Length': Buffer.byteLength(data), ...headers } },
      res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); }
    );
    req.on('error', reject);
    req.setTimeout(45000, () => { req.destroy(); reject(new Error('Grok timeout')); });
    req.write(data);
    req.end();
  });
}

async function grok(prompt, search = true) {
  const body = {
    model: 'grok-4-fast',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2000,
  };
  if (search) body.search_parameters = { mode: 'on', return_citations: false };

  const resp = await httpsPost('api.x.ai', '/v1/chat/completions',
    { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROK_KEY}` }, body);
  return JSON.parse(resp.body).choices?.[0]?.message?.content || '';
}

async function sendTelegram(msg) {
  if (!TELEGRAM_TOKEN) { console.warn('No Telegram token'); return; }
  await httpsPost('api.telegram.org', `/bot${TELEGRAM_TOKEN}/sendMessage`,
    { 'Content-Type': 'application/json' },
    { chat_id: TELEGRAM_CHAT, text: msg, parse_mode: 'HTML' });
}

// ─── CHECKS ────────────────────────────────────────────────────────────────────

async function checkSERPPositions() {
  console.log('📊 Checking SERP positions via Grok live search...');
  const prompt = `Search Google RIGHT NOW for each of these keywords and tell me:
1. What domain is #1?
2. Is ${profile.domain} in the top 10? What position?
3. Which of these competitor domains appear in top 5: ${profile.competitors.join(', ')}?

Return ONLY a JSON array. Each item: {"keyword":"...","rank1Domain":"...","ourPosition":null,"competitorHits":[{"domain":"...","position":1}]}
No markdown, no commentary.

Keywords:
${profile.priorityKeywords.slice(0, 8).map(k => `- ${k}`).join('\n')}`;

  const raw = await grok(prompt);
  try {
    const clean = raw.replace(/```json\n?|```\n?/g, '').trim();
    // find JSON array
    const match = clean.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    console.warn('SERP parse failed:', raw.substring(0, 200));
    return [];
  }
}

async function checkCompetitorActivity() {
  console.log('🔎 Checking competitor activity...');
  const prompt = `Search the web RIGHT NOW and answer these questions about our competitors in the ${profile.name} space.
Competitors to watch: ${profile.competitors.join(', ')}

1. Has any competitor published new content in the last 7 days targeting these topics: ${profile.priorityKeywords.slice(0, 4).join(', ')}?
2. Has any competitor run a sale or promotion in the last 7 days?
3. Has any competitor received notable negative press, reviews, or recall notices?
4. Are there any NEW competitors I haven't listed that are now appearing for these keywords?

Be specific — name URLs and dates where possible. If nothing notable, say "No significant changes."
Keep response under 300 words.`;

  return await grok(prompt);
}

async function checkNewsAndTrends() {
  if (!profile.newsQueries.length && !profile.legalQueries.length) return null;
  console.log('📰 Checking news and trends...');

  const allQueries = [...profile.newsQueries, ...profile.legalQueries];
  const prompt = `Search the web RIGHT NOW for recent news on these topics. Report only if there's something actionable in the last 30 days. Be brief — 1-2 sentences per topic max.

${allQueries.map(q => `- ${q}`).join('\n')}

Format: topic | finding | date | action needed (yes/no)
If nothing found: "No relevant news."`;

  return await grok(prompt);
}

async function checkFitmentChanges() {
  if (brand !== 'bartact' && brand !== 'bullstrap') return null;
  console.log('🚗 Checking for vehicle model changes...');

  const prompt = `Search RIGHT NOW: have Ford, Jeep (Stellantis), or Toyota announced any seat design changes, new trim levels, or new model years for these vehicles that would affect aftermarket seat cover fitment?
- Jeep Wrangler JL (2018-2026)
- Jeep Gladiator JT (2020-2026)
- Ford Bronco (2021-2026)
- Toyota Tacoma (2024-2026)

Only report if there's a CONFIRMED announcement in the last 90 days that would require a NEW fitment variant (different seat mounting, seat shape, or power seat configuration). If nothing: "No fitment-relevant announcements."`;

  return await grok(prompt);
}

// ─── MAIN ───────────────────────────────────────────────────────────────────────
async function main() {
  const date = new Date().toISOString().split('T')[0];
  console.log(`\n🔍 Grok Competitor Intel — ${profile.name} — ${date}\n`);

  const stateFile = `${WORKSPACE}/memory/grok-intel-${brand}-state.json`;
  const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : {};

  // Run all checks in parallel where possible
  const [serpData, competitorActivity, newsData, fitmentData] = await Promise.all([
    checkSERPPositions(),
    checkCompetitorActivity(),
    checkNewsAndTrends(),
    checkFitmentChanges(),
  ]);

  // Build alerts
  const alerts = [];
  const wins = [];
  const watching = [];

  // Process SERP data
  for (const kw of serpData) {
    if (kw.ourPosition === 1) {
      wins.push(`✅ #1: ${kw.keyword}`);
    } else if (kw.ourPosition === null || kw.ourPosition > 10) {
      alerts.push(`🔴 NOT PAGE 1: "${kw.keyword}" — #1 is ${kw.rank1Domain}`);
    } else if (kw.ourPosition > 5) {
      watching.push(`🟡 #${kw.ourPosition}: "${kw.keyword}" — #1 is ${kw.rank1Domain}`);
    } else {
      watching.push(`🟢 #${kw.ourPosition}: "${kw.keyword}"`);
    }
  }

  // Load existing fix queue and merge
  const fixQueueFile = `${WORKSPACE}/memory/bartact-seo-fix-queue.json`;
  const newFailingKws = serpData.filter(k => !k.ourPosition || k.ourPosition > 10).map(k => k.keyword);
  if (newFailingKws.length && brand === 'bartact') {
    const existing = fs.existsSync(fixQueueFile) ? JSON.parse(fs.readFileSync(fixQueueFile, 'utf8')) : {};
    const merged = [...new Set([...(existing.failingKeywords || []), ...newFailingKws])];
    fs.writeFileSync(fixQueueFile, JSON.stringify({ date: new Date().toISOString(), failingKeywords: merged }, null, 2));
    console.log(`  Updated fix queue: ${merged.length} failing keywords`);
  }

  // Save state
  state.lastRun = new Date().toISOString();
  state.serpSnapshot = serpData;
  state.lastCompetitorActivity = competitorActivity;
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

  // Only send Telegram if there's something worth reporting
  const hasAlerts = alerts.length > 0;
  const hasCompetitorNews = competitorActivity && !competitorActivity.toLowerCase().includes('no significant');
  const hasNews = newsData && !newsData.toLowerCase().includes('no relevant');
  const hasFitment = fitmentData && !fitmentData.toLowerCase().includes('no fitment');

  if (!hasAlerts && !hasCompetitorNews && !hasNews && !hasFitment && wins.length === serpData.length) {
    console.log('\n✅ All clear — no issues to report. Staying silent.');
    // Log silently
    fs.appendFileSync(`${WORKSPACE}/memory/grok-intel-${brand}-log.md`,
      `\n## ${date} — ✅ All clear (${wins.length} keywords at #1)\n`);
    return;
  }

  // Build Telegram message
  let msg = `<b>🔍 SEO Intel — ${profile.name}</b>\n<i>${date}</i>\n\n`;

  if (alerts.length) {
    msg += `<b>🔴 Losing (${alerts.length})</b>\n${alerts.join('\n')}\n\n`;
  }
  if (watching.length) {
    msg += `<b>🟡 Watching (${watching.length})</b>\n${watching.join('\n')}\n\n`;
  }
  if (wins.length) {
    msg += `<b>✅ Winning (${wins.length})</b>\n${wins.join('\n')}\n\n`;
  }
  if (hasCompetitorNews) {
    msg += `<b>🕵️ Competitor Activity</b>\n${competitorActivity.substring(0, 400)}\n\n`;
  }
  if (hasNews) {
    msg += `<b>📰 News/Legal</b>\n${newsData.substring(0, 300)}\n\n`;
  }
  if (hasFitment) {
    msg += `<b>🚗 Fitment Alert</b>\n${fitmentData.substring(0, 300)}\n`;
  }

  await sendTelegram(msg);
  console.log('✅ Report sent to Telegram');

  // Log to file
  fs.appendFileSync(`${WORKSPACE}/memory/grok-intel-${brand}-log.md`,
    `\n## ${date}\n${alerts.join('\n')}\n${watching.join('\n')}\n`);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
