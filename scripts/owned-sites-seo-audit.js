#!/usr/bin/env node
// Slashdaddy Owned Sites SEO Audit + Google Indexing API + IndexNow
// Sites: thedailycheer.com, recentratings.com, hspseats.com, brazenauto.com,
//        ballkinis.com, bowtiefilters.com, limitstraps.com, factorfilters.com
//
// What this does every run:
// 1. Fetch each site's homepage + sitemap to get all URLs
// 2. Check word count, title tag, meta description vs playbook standards
// 3. Submit all URLs to Google Indexing API (service account)
// 4. Submit all URLs to IndexNow (Bing/Yandex)
// 5. Report gaps (thin content, missing meta, bad title format) for manual fix

const https = require('https');
const fs = require('fs');
const path = require('path');
const { createSign } = require('crypto');

const WORD_TARGET = 1500;  // Target — flag anything below this for improvement
const WORD_FLOOR  = 800;   // Absolute floor — flag as CRITICAL if below this

const SITES = [
  { domain: 'thedailycheer.com',  wordTarget: WORD_TARGET, wordFloor: WORD_FLOOR },
  { domain: 'hspseats.com',       wordTarget: WORD_TARGET, wordFloor: WORD_FLOOR },
  { domain: 'brazenauto.com',     wordTarget: WORD_TARGET, wordFloor: WORD_FLOOR },
  { domain: 'ballkinis.com',      wordTarget: WORD_TARGET, wordFloor: WORD_FLOOR },
  { domain: 'bowtiefilters.com',  wordTarget: WORD_TARGET, wordFloor: WORD_FLOOR },
  { domain: 'limitstraps.com',    wordTarget: WORD_TARGET, wordFloor: WORD_FLOOR },
  { domain: 'factorfilters.com',  wordTarget: WORD_TARGET, wordFloor: WORD_FLOOR, isShopify: true },
  // NOT in scope: recentratings.com (RecentRatings bot), skipatip.com (SkipATip bot),
  // faithfulpassages.com (FP bot), bartact.com (Bartact bot), bullstrap.com (Bull Strap bot),
  // fernallern.com + thornwoodaccord.com (Fernallern)
];

const INDEXNOW_KEY = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';
const KEY_PATH = '/home/ubuntu/.openclaw/workspace/sites/besttirepatch.com/.google-indexing-service-account.json';
const STATE_PATH = '/home/ubuntu/.openclaw/workspace/memory/owned-sites-seo-state.json';

const sleep = ms => new Promise(r => setTimeout(r, ms));

function httpReq(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SlashdaddySEOBot/1.0)' }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

// Extract URLs from sitemap XML
function parseSitemap(xml) {
  const urls = [];
  const matches = xml.matchAll(/<loc>\s*(https?:\/\/[^\s<]+)\s*<\/loc>/gi);
  for (const m of matches) urls.push(m[1].trim());
  return urls;
}

// Basic content analysis
function analyzeHtml(html, domain) {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter(w => w.length > 1).length;
  const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&ndash;/g, '–').trim() : null;
  const desc = descMatch ? descMatch[1].trim() : null;

  const issues = [];
  if (!title) issues.push('MISSING title tag');
  else if (title.length > 65) issues.push(`Title too long (${title.length} chars, max 65)`);
  if (!desc) issues.push('MISSING meta description');
  else if (desc.length > 160) issues.push(`Meta desc too long (${desc.length} chars)`);
  else if (desc.length < 80) issues.push(`Meta desc too short (${desc.length} chars, min 80)`);

  return { words, title, desc, issues };
}

// Get service account access token
async function getGoogleToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600, iat: now
  })).toString('base64url');
  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(sa.private_key, 'base64url');
  const jwt = `${header}.${payload}.${sig}`;
  const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
  const res = await httpReq({
    hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
  }, body);
  const data = JSON.parse(res.body);
  if (!data.access_token) throw new Error(`Token error: ${res.body}`);
  return data.access_token;
}

async function submitGoogleIndexing(url, token) {
  const body = JSON.stringify({ url, type: 'URL_UPDATED' });
  const res = await httpReq({
    hostname: 'indexing.googleapis.com',
    path: '/v3/urlNotifications:publish',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, body);
  return res.status;
}

async function submitIndexNow(domain, urls) {
  const body = JSON.stringify({
    host: domain,
    key: INDEXNOW_KEY,
    keyLocation: `https://${domain}/${INDEXNOW_KEY}.txt`,
    urlList: urls.slice(0, 10000)
  });
  const res = await httpReq({
    hostname: 'api.indexnow.org',
    path: '/indexnow',
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) }
  }, body);
  return res.status;
}

async function processSite(site, googleToken) {
  const { domain, wordFloor } = site;
  console.log(`\n--- ${domain} ---`);

  const result = { domain, urls: [], homepageWords: 0, issues: [], googleOk: 0, googleErr: 0, indexNowStatus: null };

  // Try homepage
  try {
    const home = await httpGet(`https://${domain}`);
    if (home.status === 200) {
      const analysis = analyzeHtml(home.body, domain);
      result.homepageWords = analysis.words;
      result.title = analysis.title;
      result.desc = analysis.desc;
      result.issues = analysis.issues;
      if (analysis.words < site.wordFloor) result.issues.push(`🔴 CRITICAL thin content: ${analysis.words}w (floor: ${site.wordFloor}w)`);
      else if (analysis.words < site.wordTarget) result.issues.push(`🟡 Below target: ${analysis.words}w (target: ${site.wordTarget}w)`);
      console.log(`  Homepage: ${analysis.words}w | Title: ${analysis.title ? analysis.title.slice(0,50) : 'MISSING'}`);
      if (analysis.issues.length) console.log(`  Issues: ${analysis.issues.join('; ')}`);
    } else {
      console.log(`  Homepage returned ${home.status}`);
      result.issues.push(`Homepage ${home.status}`);
    }
  } catch (e) {
    console.log(`  Homepage fetch failed: ${e.message}`);
    result.issues.push(`Homepage fetch error: ${e.message}`);
  }

  // Try sitemap
  result.urls = [`https://${domain}/`];
  for (const sitemapUrl of [`https://${domain}/sitemap.xml`, `https://${domain}/sitemap_index.xml`]) {
    try {
      const sm = await httpGet(sitemapUrl);
      if (sm.status === 200 && sm.body.includes('<loc>')) {
        const parsed = parseSitemap(sm.body);
        if (parsed.length > 0) {
          result.urls = [...new Set([...result.urls, ...parsed])];
          console.log(`  Sitemap: ${parsed.length} URLs found`);
          break;
        }
      }
    } catch {}
  }
  console.log(`  Total URLs to submit: ${result.urls.length}`);

  // Google Indexing API
  for (const url of result.urls) {
    try {
      const status = await submitGoogleIndexing(url, googleToken);
      if (status === 200) result.googleOk++;
      else { result.googleErr++; if (status === 429) { console.log('  Rate limited, sleeping 5s'); await sleep(5000); } }
    } catch (e) { result.googleErr++; }
    await sleep(150);
  }
  console.log(`  Google Indexing: ${result.googleOk} ok, ${result.googleErr} errors`);

  // IndexNow
  try {
    const inStatus = await submitIndexNow(domain, result.urls);
    result.indexNowStatus = inStatus;
    console.log(`  IndexNow: HTTP ${inStatus}`);
  } catch (e) {
    result.indexNowStatus = `error: ${e.message}`;
    console.log(`  IndexNow error: ${e.message}`);
  }

  return result;
}

async function main() {
  console.log(`=== Owned Sites SEO Audit + Indexing — ${new Date().toISOString()} ===`);

  let sa;
  try {
    sa = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
    console.log(`Service account: ${sa.client_email}`);
  } catch (e) {
    console.error(`Failed to load service account: ${e.message}`);
    process.exit(1);
  }

  const googleToken = await getGoogleToken(sa);
  const results = [];
  const needsAttention = [];

  for (const site of SITES) {
    const result = await processSite(site, googleToken);
    results.push(result);
    if (result.issues.length > 0) needsAttention.push({ domain: site.domain, issues: result.issues });
    await sleep(500);
  }

  // Save state
  const state = { lastRun: new Date().toISOString(), results, needsAttention };
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));

  // Summary
  console.log('\n=== SUMMARY ===');
  const totalUrls = results.reduce((s, r) => s + r.urls.length, 0);
  const totalGoogleOk = results.reduce((s, r) => s + r.googleOk, 0);
  const totalGoogleErr = results.reduce((s, r) => s + r.googleErr, 0);
  console.log(`Sites: ${results.length} | Total URLs: ${totalUrls} | Google: ${totalGoogleOk} ok / ${totalGoogleErr} err`);

  if (needsAttention.length > 0) {
    console.log('\n⚠️  NEEDS ATTENTION:');
    for (const s of needsAttention) {
      console.log(`  ${s.domain}: ${s.issues.join(' | ')}`);
    }
  } else {
    console.log('✅ All sites passing playbook standards');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
