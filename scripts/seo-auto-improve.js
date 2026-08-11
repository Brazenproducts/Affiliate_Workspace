#!/usr/bin/env node
/**
 * SEO Auto-Improve — Universal Daily Improvement Loop
 *
 * For every failing priority keyword:
 *   1. Grok live SERP → find who's #1 on Google right now
 *   2. Fetch that competitor page → analyze word count, H tags, schema, key phrases
 *   3. Pull our matching page from Shopify/site
 *   4. If we're deficient → generate improved content via Grok
 *   5. Push improvement to Shopify (GraphQL) or static site (git)
 *   6. Submit URL to Google Indexing API + IndexNow
 *   7. Log action + send Telegram summary
 *
 * Usage:
 *   node seo-auto-improve.js --brand=bartact
 *   node seo-auto-improve.js --brand=bullstrap
 *
 * Config files expected:
 *   scripts/seo-targets-bartact.json   — keyword → shopify collection/page mapping
 *   scripts/seo-targets-bullstrap.json
 */

const fs = require('fs');
const https = require('https');
const { createSign } = require('crypto');

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const env = {};
fs.readFileSync(`${WORKSPACE}/.env`, 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const GROK_KEY  = 'xai-S5hLItB2sSmg3xR10q6UPzUvlTjDKA1riY44VljVHiZP7jQrTBVhI8QkZvo7OuuLd1VPctYX560cHhhr';
const TELEGRAM_TOKEN = env.TELEGRAM_TOKEN || env.SLASHDADDY_TELEGRAM_TOKEN;
const TELEGRAM_CHAT  = '7550065844';
const GCP_KEY_FILE   = `${WORKSPACE}/.gcp-service-account.json`;

const brand = (process.argv.find(a => a.startsWith('--brand=')) || '--brand=bartact').split('=')[1];
const SHOPIFY_TOKEN  = brand === 'bartact' ? env.SHOPIFY_TOKEN_BARTACT : env.SHOPIFY_TOKEN_BULLSTRAP;
const SHOPIFY_DOMAIN = brand === 'bartact' ? 'bartact.myshopify.com' : 'bullstrap.myshopify.com';
const INDEXNOW_HOST  = brand === 'bartact' ? 'www.bartact.com' : 'www.bullstrap.com';
const INDEXNOW_KEY   = brand === 'bartact' ? 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5' : env.BULLSTRAP_INDEXNOW_KEY;
const FIX_QUEUE_FILE = `${WORKSPACE}/memory/bartact-seo-fix-queue.json`;
const STATE_FILE     = `${WORKSPACE}/memory/seo-auto-improve-${brand}-state.json`;
const LOG_FILE       = `${WORKSPACE}/memory/seo-auto-improve-${brand}-log.md`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function httpsPost(host, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const req = https.request(
      { hostname: host, path, method: 'POST', headers: { 'Content-Length': Buffer.byteLength(data), ...headers } },
      res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); }
    );
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(data);
    req.end();
  });
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      { hostname: u.hostname, path: u.pathname + u.search, method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEOBot/1.0)' } },
      res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(httpsGet(res.headers.location));
        }
        let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
      }
    );
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

async function sendTelegram(msg) {
  if (!TELEGRAM_TOKEN) { console.warn('⚠️ No Telegram token — skipping send'); return; }
  await httpsPost('api.telegram.org', `/bot${TELEGRAM_TOKEN}/sendMessage`, { 'Content-Type': 'application/json' },
    { chat_id: TELEGRAM_CHAT, text: msg, parse_mode: 'HTML' });
}

// ─── GROK LIVE SERP ───────────────────────────────────────────────────────────
async function grokSERP(keywords) {
  const prompt = `For each keyword below, search Google RIGHT NOW and return the actual top 5 organic results (US desktop, no ads).
Return ONLY a JSON array. Each item: { "keyword": "...", "results": [{"rank":1,"domain":"...","title":"...","url":"..."},...] }
No markdown, no commentary.

Keywords:
${keywords.map(k => `- ${k}`).join('\n')}`;

  const resp = await httpsPost('api.x.ai', '/v1/chat/completions',
    { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROK_KEY}` },
    { model: 'grok-4-fast', messages: [{ role: 'user', content: prompt }],
      search_parameters: { mode: 'on', return_citations: false }, max_tokens: 3000 }
  );
  const content = JSON.parse(resp.body).choices?.[0]?.message?.content || '[]';
  try {
    const clean = content.replace(/```json\n?|```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch {
    console.error('Grok SERP parse error — raw:', content.substring(0, 300));
    return [];
  }
}

// ─── FETCH & ANALYZE COMPETITOR PAGE ─────────────────────────────────────────
async function analyzeCompetitorPage(url) {
  try {
    const { body } = await httpsGet(url);
    const wordCount = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').split(' ').filter(w => w.length > 2).length;
    const h1 = (body.match(/<h1[^>]*>(.*?)<\/h1>/si) || [])[1]?.replace(/<[^>]+>/g, '').trim() || '';
    const h2s = [...body.matchAll(/<h2[^>]*>(.*?)<\/h2>/gsi)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).slice(0, 8);
    const hasSchema = body.includes('application/ld+json');
    const hasFAQ = body.includes('"FAQPage"');
    const title = (body.match(/<title>(.*?)<\/title>/si) || [])[1]?.replace(/<[^>]+>/g, '').trim() || '';
    return { url, wordCount, title, h1, h2s, hasSchema, hasFAQ };
  } catch (e) {
    return { url, error: e.message };
  }
}

// ─── GCP TOKEN FOR GOOGLE INDEXING API ────────────────────────────────────────
async function getGCPToken() {
  const key = JSON.parse(fs.readFileSync(GCP_KEY_FILE, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const hdr = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const pay = Buffer.from(JSON.stringify({
    iss: key.client_email, scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600
  })).toString('base64url');
  const sign = createSign('RSA-SHA256');
  sign.update(`${hdr}.${pay}`);
  const jwt = `${hdr}.${pay}.${sign.sign(key.private_key, 'base64url')}`;
  const resp = await httpsPost('oauth2.googleapis.com', '/token',
    { 'Content-Type': 'application/x-www-form-urlencoded' },
    `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  );
  return JSON.parse(resp.body).access_token;
}

async function submitIndexing(urls) {
  try {
    const token = await getGCPToken();
    for (const url of urls) {
      await httpsPost('indexing.googleapis.com', '/v3/urlNotifications:publish',
        { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        { url, type: 'URL_UPDATED' }
      );
    }
    console.log(`  ✅ Google Indexing API: ${urls.length} URLs submitted`);
  } catch (e) {
    console.warn(`  ⚠️ Indexing API error: ${e.message}`);
  }
  // IndexNow
  try {
    const ir = await httpsPost('api.indexnow.org', '/indexnow',
      { 'Content-Type': 'application/json' },
      { host: INDEXNOW_HOST, key: INDEXNOW_KEY, urlList: urls }
    );
    console.log(`  ✅ IndexNow: ${ir.status}`);
  } catch (e) {
    console.warn(`  ⚠️ IndexNow error: ${e.message}`);
  }
}

// ─── SHOPIFY — GET COLLECTION BY HANDLE ───────────────────────────────────────
async function getShopifyCollection(handle) {
  const r = await httpsGet(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/smart_collections.json?handle=${handle}`);
  const d = JSON.parse(r.body);
  if (d.smart_collections?.[0]) return { type: 'smart', col: d.smart_collections[0] };
  const r2 = await httpsGet(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/custom_collections.json?handle=${handle}`);
  const d2 = JSON.parse(r2.body);
  if (d2.custom_collections?.[0]) return { type: 'custom', col: d2.custom_collections[0] };
  return null;
}

async function shopifyGQL(query, variables = {}) {
  const resp = await httpsPost(SHOPIFY_DOMAIN, '/admin/api/2024-01/graphql.json',
    { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_TOKEN },
    { query, variables }
  );
  return JSON.parse(resp.body);
}

// ─── GROK CONTENT IMPROVEMENT ─────────────────────────────────────────────────
async function generateImprovedBody(keyword, ourPage, competitorAnalysis, brandRules) {
  const prompt = `You are an expert SEO copywriter for ${brand === 'bartact' ? 'Bartact' : 'Bull Strap'}.

TARGET KEYWORD: "${keyword}"
OUR CURRENT WORD COUNT: ${ourPage.wordCount || 'unknown'}
TOP COMPETITOR: ${competitorAnalysis.url} (${competitorAnalysis.wordCount} words, ${competitorAnalysis.h2s?.length || 0} H2s)
COMPETITOR H2s: ${(competitorAnalysis.h2s || []).join(' | ')}

BRAND RULES:
${brandRules}

TASK: Write improved HTML body content for our collection page targeting "${keyword}".
- Beat the competitor's word count by at least 200 words (target: ${(competitorAnalysis.wordCount || 800) + 300}+ words)
- Use their H2 structure as inspiration but make ours BETTER and more specific
- Include: material specs, fitment guide, why Bartact beats competitors, FAQ section (3-5 Q&As)
- Tone: direct, knowledgeable, no fluff
- Output ONLY the HTML body content (h2, p, ul, dl tags). No h1. No full page wrapper.`;

  const resp = await httpsPost('api.x.ai', '/v1/chat/completions',
    { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROK_KEY}` },
    { model: 'grok-4-fast', messages: [{ role: 'user', content: prompt }], max_tokens: 4000 }
  );
  return JSON.parse(resp.body).choices?.[0]?.message?.content || '';
}

// ─── LOAD TARGET MAP ──────────────────────────────────────────────────────────
function loadTargets() {
  const f = `${WORKSPACE}/scripts/seo-targets-${brand}.json`;
  if (!fs.existsSync(f)) {
    console.warn(`⚠️ No target map at ${f} — run seo-targets-builder.js first`);
    return {};
  }
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔍 SEO Auto-Improve — ${brand} — ${new Date().toISOString()}\n`);

  // Load failing keywords from fix queue
  let failingKeywords = [];
  if (fs.existsSync(FIX_QUEUE_FILE)) {
    const q = JSON.parse(fs.readFileSync(FIX_QUEUE_FILE, 'utf8'));
    failingKeywords = (q.failingKeywords || []).slice(0, 5); // cap at 5 per run to avoid rate limits
  }
  if (!failingKeywords.length) {
    console.log('✅ No failing keywords in queue — nothing to do');
    return;
  }
  console.log(`📋 Failing keywords to fix: ${failingKeywords.join(', ')}\n`);

  // Load keyword → page target map
  const targets = loadTargets();

  // Load state (for change detection)
  const state = fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) : {};

  // STEP 1 — Grok SERP for all failing keywords
  console.log('🌐 Checking live SERP via Grok...');
  const serpData = await grokSERP(failingKeywords);

  const actions = [];
  const urlsToIndex = [];

  for (const kw of failingKeywords) {
    console.log(`\n📊 Keyword: "${kw}"`);
    const serpResult = serpData.find(s => s.keyword === kw);
    if (!serpResult) { console.log('  ⚠️ No SERP data returned'); continue; }

    const topResult = serpResult.results?.[0];
    const ourResult = serpResult.results?.find(r => r.domain?.includes(brand === 'bartact' ? 'bartact' : 'bullstrap'));
    const ourRank = ourResult?.rank || 'not in top 5';
    console.log(`  #1: ${topResult?.domain} — "${topResult?.title}"`);
    console.log(`  Our rank: ${ourRank}`);

    // Skip if we're already #1
    if (ourRank === 1) { console.log('  ✅ Already #1 — skipping'); continue; }

    // Skip if competitor is us under a different domain
    if (topResult?.url?.includes('bartact') || topResult?.url?.includes('bullstrap')) {
      console.log('  ✅ Our domain at #1 — skipping'); continue;
    }

    // STEP 2 — Analyze competitor page
    console.log(`  🔎 Analyzing competitor: ${topResult?.url}`);
    const compAnalysis = await analyzeCompetitorPage(topResult?.url || '');
    console.log(`  Competitor: ${compAnalysis.wordCount} words, ${compAnalysis.h2s?.length} H2s, FAQ: ${compAnalysis.hasFAQ}`);

    // Find our matching page
    const pageTarget = targets[kw];
    if (!pageTarget) {
      console.log(`  ⚠️ No page target mapped for "${kw}" — add to seo-targets-${brand}.json`);
      actions.push({ keyword: kw, status: 'no_target', competitor: topResult?.domain, competitorWords: compAnalysis.wordCount });
      continue;
    }

    // STEP 3 — Get our current page
    console.log(`  📄 Fetching our page: ${pageTarget.handle}`);
    const colData = await getShopifyCollection(pageTarget.handle);
    if (!colData) {
      console.log(`  ❌ Collection not found: ${pageTarget.handle}`);
      actions.push({ keyword: kw, status: 'not_found', handle: pageTarget.handle });
      continue;
    }
    const col = colData.col;
    const ourWordCount = col.body_html ? col.body_html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 2).length : 0;
    console.log(`  Our page: ${ourWordCount} words`);

    // STEP 4 — Generate improved content if we're trailing
    const gap = (compAnalysis.wordCount || 0) - ourWordCount;
    if (gap < 100 && ourWordCount > 800) {
      console.log(`  ✅ Word count competitive (${ourWordCount} vs ${compAnalysis.wordCount}) — checking schema only`);
      // Just flag for schema if needed
      if (!col.body_html?.includes('"FAQPage"') && compAnalysis.hasFAQ) {
        actions.push({ keyword: kw, status: 'needs_schema', handle: pageTarget.handle, ourWords: ourWordCount, competitorWords: compAnalysis.wordCount });
      }
      continue;
    }

    const brandRules = brand === 'bartact'
      ? 'Custom-cut not universal fit. Cordura 400D/1000D. Berry Amendment compliant. Made in USA. Invented by Bartact. Patent pending where applicable. Never mention competitor brand names.'
      : 'Limit straps prevent axle drop on 4x4 vehicles. Reinforced webbing. Never undersell load rating. Made in USA.';

    console.log(`  ✍️ Generating improved content (closing ${gap}w gap)...`);
    const newBody = await generateImprovedBody(kw, { wordCount: ourWordCount }, compAnalysis, brandRules);
    if (!newBody || newBody.length < 200) {
      console.log('  ❌ Content generation failed — skipping');
      continue;
    }

    // STEP 5 — Push to Shopify
    console.log('  📤 Pushing to Shopify...');
    const colGID = `gid://shopify/Collection/${col.id}`;
    const mutation = `mutation collectionUpdate($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection { id handle }
        userErrors { field message }
      }
    }`;
    const result = await shopifyGQL(mutation, { input: { id: colGID, descriptionHtml: newBody } });
    const errors = result.data?.collectionUpdate?.userErrors;
    if (errors?.length) {
      console.log(`  ❌ Shopify error: ${JSON.stringify(errors)}`);
      continue;
    }
    console.log('  ✅ Shopify updated');

    // STEP 6 — Index
    const pageUrl = `https://${INDEXNOW_HOST}/collections/${pageTarget.handle}`;
    urlsToIndex.push(pageUrl);

    const newWordCount = newBody.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 2).length;
    actions.push({
      keyword: kw,
      status: 'improved',
      handle: pageTarget.handle,
      url: pageUrl,
      ourWords: ourWordCount,
      newWords: newWordCount,
      competitorDomain: topResult?.domain,
      competitorWords: compAnalysis.wordCount,
      competitorRank: 1
    });
  }

  // Submit indexing for all updated pages
  if (urlsToIndex.length > 0) {
    console.log(`\n🔍 Submitting ${urlsToIndex.length} URLs to indexing...`);
    await submitIndexing(urlsToIndex);
  }

  // Save state
  state.lastRun = new Date().toISOString();
  state.lastActions = actions;
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

  // Log to daily MD
  const logEntry = `\n## ${new Date().toISOString().split('T')[0]} — SEO Auto-Improve (${brand})\n` +
    actions.map(a => `- **${a.keyword}**: ${a.status}${a.ourWords ? ` | ${a.ourWords}w → ${a.newWords || a.ourWords}w` : ''}${a.competitorDomain ? ` | beat: ${a.competitorDomain}` : ''}`).join('\n') + '\n';
  fs.appendFileSync(LOG_FILE, logEntry);

  // Telegram report
  const improved = actions.filter(a => a.status === 'improved');
  const skipped = actions.filter(a => a.status === 'no_target' || a.status === 'not_found');
  const schemaNeeded = actions.filter(a => a.status === 'needs_schema');

  if (actions.length === 0) {
    console.log('\n✅ All failing keywords already competitive — nothing to improve');
    return;
  }

  let msg = `<b>🔍 SEO Auto-Improve — ${brand}</b>\n<i>${new Date().toISOString().split('T')[0]}</i>\n\n`;
  if (improved.length) {
    msg += `<b>✅ Improved (${improved.length})</b>\n`;
    improved.forEach(a => { msg += `• ${a.keyword}: ${a.ourWords}w → ${a.newWords}w (beat ${a.competitorDomain})\n`; });
  }
  if (schemaNeeded.length) {
    msg += `\n<b>⚠️ Schema gap (${schemaNeeded.length})</b>\n`;
    schemaNeeded.forEach(a => { msg += `• ${a.keyword}: competitor has FAQ schema, we don't\n`; });
  }
  if (skipped.length) {
    msg += `\n<b>🔴 No target mapped (${skipped.length})</b>\n`;
    skipped.forEach(a => { msg += `• ${a.keyword} — add to seo-targets-${brand}.json\n`; });
  }
  if (urlsToIndex.length) msg += `\n📤 Submitted to Google + IndexNow: ${urlsToIndex.length} URLs`;

  await sendTelegram(msg);
  console.log('\n✅ Done. Report sent to Telegram.');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
