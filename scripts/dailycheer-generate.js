#!/usr/bin/env node
// The Daily Cheer — Daily Content Generator
// Generates fresh feel-good stories daily with real Unsplash images
// Builds: index.html (today) + archive/YYYY-MM-DD.html + archive/index.html
// Pushes to GitHub, submits to Google Indexing API + IndexNow

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createSign } = require('crypto');

const SITE_DIR = '/home/ubuntu/.openclaw/workspace/sites/thedailycheer.com';
const ARCHIVE_DIR = path.join(SITE_DIR, 'archive');
const STATE_PATH = '/home/ubuntu/.openclaw/workspace/memory/dailycheer-state.json';
const KEY_PATH = '/home/ubuntu/.openclaw/workspace/.bartact-indexing-service-account.json';
const INDEXNOW_KEY = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';
const BASE_URL = 'https://thedailycheer.com';

const sleep = ms => new Promise(r => setTimeout(r, ms));

function httpReq(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

// Format date nicely
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Unsplash source URL — free, no API key, relevant image by keyword
function unsplashImg(keyword, w = 800, h = 480) {
  const clean = encodeURIComponent(keyword.replace(/[^a-zA-Z0-9 ]/g, '').trim());
  return `https://source.unsplash.com/${w}x${h}/?${clean}`;
}

// Load stories from a JSON file written by the cron agent
function loadStories(dateStr) {
  const p = path.join('/home/ubuntu/.openclaw/workspace/memory', `dailycheer-stories-${dateStr}.json`);
  if (fs.existsSync(p)) {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  }
  return null;
}

// Load archive index
function loadArchiveIndex() {
  const p = path.join(ARCHIVE_DIR, 'index.json');
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  return [];
}

function saveArchiveIndex(entries) {
  if (!fs.existsSync(ARCHIVE_DIR)) fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
  fs.writeFileSync(path.join(ARCHIVE_DIR, 'index.json'), JSON.stringify(entries, null, 2));
}

// Build a story card HTML with real image
function storyCard(story, isHero = false) {
  const img = unsplashImg(story.imageKeyword || story.category + ' ' + story.title.split(' ').slice(0, 3).join(' '));
  if (isHero) {
    return `
  <div class="featured">
    <img class="featured-img" src="${img}" alt="${story.title}" loading="eager" width="800" height="420">
    <div class="featured-body">
      <span class="featured-label">⭐ Today's Top Story</span>
      <h2>${story.title}</h2>
      <p>${story.body}</p>
    </div>
  </div>`;
  }
  return `
    <div class="story-card">
      <img src="${img}" alt="${story.title}" loading="lazy" width="400" height="220">
      <div class="card-body">
        <div class="category">${story.category}</div>
        <h3>${story.title}</h3>
        <p>${story.excerpt}</p>
      </div>
    </div>`;
}

// Build full page HTML
function buildPage(dateStr, stories, isIndex = true) {
  const displayDate = formatDate(dateStr);
  const hero = stories.hero;
  const quote = stories.quote;
  const sections = stories.sections; // array of { heading, emoji, cards: [{title, excerpt, body, category, imageKeyword}] }

  const sectionHtml = sections.map(sec => `
  <h2 class="section"><span>${sec.emoji}</span> ${sec.heading}</h2>
  <div class="story-grid">
    ${sec.cards.map(c => storyCard(c)).join('\n')}
  </div>`).join('\n');

  const archiveLinkHtml = isIndex
    ? `<a class="archive-link" href="/archive/">📅 Browse Past Stories</a>`
    : `<a class="archive-link" href="/">← Back to Today</a>`;

  const canonicalUrl = isIndex ? `${BASE_URL}/` : `${BASE_URL}/archive/${dateStr}.html`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Daily Cheer — ${isIndex ? 'Good News ' + displayDate : displayDate + ' — Feel-Good Stories'}</title>
  <meta name="description" content="Your daily dose of uplifting, feel-good news and inspiring stories — ${displayDate}. Real good news, updated every morning.">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:title" content="The Daily Cheer — ${displayDate}">
  <meta property="og:description" content="Uplifting stories and good news for ${displayDate}. Start your day with something that makes you smile.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fffdf7; color: #1a1a1a; line-height: 1.7; }

    header { background: #fff; border-bottom: 3px solid #f9c74f; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
    .logo { font-size: 1.4rem; font-weight: 800; color: #1a1a1a; text-decoration: none; }
    .logo span { color: #f9c74f; }
    nav { display: flex; gap: 20px; flex-wrap: wrap; align-items: center; }
    nav a { color: #555; text-decoration: none; font-size: .9rem; font-weight: 500; }
    nav a:hover { color: #f9a825; }
    .archive-link { background: #f9c74f; color: #1a1a1a !important; padding: 6px 16px; border-radius: 20px; font-weight: 700 !important; font-size: .85rem !important; }

    .date-banner { background: #f9c74f; text-align: center; padding: 10px; font-size: .9rem; font-weight: 700; color: #1a1a1a; }

    .hero-section { background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%); padding: 48px 24px 32px; text-align: center; border-bottom: 1px solid #f0e0a0; }
    .hero-section h1 { font-size: 2rem; font-weight: 800; margin-bottom: 10px; max-width: 680px; margin-left: auto; margin-right: auto; line-height: 1.2; }
    .hero-section .sub { font-size: 1rem; color: #666; max-width: 500px; margin: 0 auto; }

    .container { max-width: 1060px; margin: 0 auto; padding: 40px 24px; }

    /* Featured */
    .featured { background: #fff; border-radius: 16px; overflow: hidden; margin-bottom: 48px; border: 2px solid #f9c74f; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
    .featured-img { width: 100%; height: 420px; object-fit: cover; display: block; }
    .featured-body { padding: 28px 32px 32px; }
    .featured-label { display: inline-block; background: #f9c74f; color: #1a1a1a; font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 3px 12px; border-radius: 12px; margin-bottom: 12px; }
    .featured h2 { font-size: 1.6rem; font-weight: 800; color: #1a1a1a; margin-bottom: 12px; line-height: 1.3; }
    .featured p { color: #555; font-size: 1rem; line-height: 1.75; }

    /* Quote */
    .quote-block { background: linear-gradient(135deg, #fff9e6, #fffdf7); border-left: 5px solid #f9c74f; border-radius: 0 12px 12px 0; padding: 24px 28px; margin-bottom: 48px; }
    .quote-block blockquote { font-size: 1.2rem; font-style: italic; color: #333; margin-bottom: 8px; line-height: 1.6; }
    .quote-block cite { font-size: .85rem; color: #888; font-style: normal; font-weight: 600; }

    /* Section headers */
    h2.section { font-size: 1.4rem; font-weight: 800; color: #1a1a1a; margin: 0 0 20px; display: flex; align-items: center; gap: 10px; }

    /* Story grid */
    .story-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 48px; }
    .story-card { background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.07); border: 1px solid #f0e8d0; transition: .2s; }
    .story-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,.1); }
    .story-card img { width: 100%; height: 200px; object-fit: cover; display: block; background: #f5f0e0; }
    .story-card .card-body { padding: 18px 20px 20px; }
    .story-card .category { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #f9a825; margin-bottom: 6px; }
    .story-card h3 { font-size: 1rem; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; line-height: 1.4; }
    .story-card p { font-size: .88rem; color: #666; line-height: 1.6; }

    /* Archive strip */
    .archive-strip { background: #fff; border-radius: 14px; padding: 24px 28px; margin-bottom: 48px; border: 1px solid #f0e8d0; }
    .archive-strip h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 16px; }
    .archive-links { display: flex; flex-wrap: wrap; gap: 10px; }
    .archive-links a { padding: 6px 16px; background: #fffdf7; border: 1.5px solid #f9c74f; border-radius: 20px; font-size: .85rem; font-weight: 600; color: #1a1a1a; text-decoration: none; }
    .archive-links a:hover { background: #f9c74f; }

    footer { background: #1a1a1a; color: #aaa; text-align: center; padding: 32px 24px; font-size: .85rem; }
    footer a { color: #f9c74f; text-decoration: none; }

    @media(max-width:600px) {
      .hero-section h1 { font-size: 1.5rem; }
      .featured-img { height: 240px; }
      .featured-body { padding: 20px; }
    }
  </style>
</head>
<body>

<header>
  <a class="logo" href="/">The Daily<span>Cheer</span></a>
  <nav>
    <a href="#stories">Good News</a>
    <a href="#animals">Animals</a>
    <a href="#inspiration">Inspiration</a>
    ${archiveLinkHtml}
  </nav>
</header>

<div class="date-banner">☀️ ${displayDate} — Fresh good news, every morning</div>

<div class="hero-section">
  <h1>Good News Is Happening.<br>We Found It For You.</h1>
  <p class="sub">Real uplifting stories from around the world — updated every single day.</p>
</div>

<div class="container" id="stories">

  ${storyCard(hero, true)}

  <div class="quote-block">
    <blockquote>"${quote.text}"</blockquote>
    <cite>— ${quote.author}</cite>
  </div>

  ${sectionHtml}

  <div class="archive-strip">
    <h3>📅 Past Issues</h3>
    <div class="archive-links">
      <a href="/archive/">Full Archive →</a>
      ${loadArchiveIndex().slice(0, 10).map(e =>
        `<a href="/archive/${e.date}.html">${formatDate(e.date)}</a>`
      ).join('\n      ')}
    </div>
  </div>

</div>

<footer>
  <p>© ${new Date().getFullYear()} The Daily Cheer — <a href="/">Home</a> &nbsp;·&nbsp; <a href="/archive/">Archive</a> &nbsp;·&nbsp; Good news, every day.</p>
</footer>

</body>
</html>`;
}

// Build archive index page
function buildArchiveIndex(entries) {
  const rows = entries.map(e => `
    <a class="archive-entry" href="/archive/${e.date}.html">
      <span class="entry-date">${formatDate(e.date)}</span>
      <span class="entry-hero">${e.heroTitle}</span>
    </a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Story Archive — The Daily Cheer</title>
  <meta name="description" content="Browse all past feel-good stories from The Daily Cheer. Every day's uplifting news, archived and searchable.">
  <link rel="canonical" href="${BASE_URL}/archive/">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fffdf7; color: #1a1a1a; line-height: 1.7; }
    header { background: #fff; border-bottom: 3px solid #f9c74f; padding: 16px 24px; display: flex; align-items: center; gap: 20px; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
    .logo { font-size: 1.4rem; font-weight: 800; color: #1a1a1a; text-decoration: none; }
    .logo span { color: #f9c74f; }
    header a.back { color: #555; text-decoration: none; font-size: .9rem; }
    .container { max-width: 780px; margin: 0 auto; padding: 40px 24px; }
    h1 { font-size: 1.8rem; font-weight: 800; margin-bottom: 8px; }
    .sub { color: #666; margin-bottom: 32px; font-size: .95rem; }
    .archive-list { display: flex; flex-direction: column; gap: 12px; }
    .archive-entry { display: flex; flex-direction: column; background: #fff; border-radius: 12px; padding: 18px 22px; border: 1px solid #f0e8d0; text-decoration: none; color: inherit; transition: .15s; }
    .archive-entry:hover { border-color: #f9c74f; box-shadow: 0 4px 14px rgba(0,0,0,.08); }
    .entry-date { font-size: .8rem; font-weight: 700; color: #f9a825; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 4px; }
    .entry-hero { font-size: 1rem; font-weight: 600; color: #1a1a1a; line-height: 1.4; }
    footer { background: #1a1a1a; color: #aaa; text-align: center; padding: 24px; font-size: .85rem; margin-top: 60px; }
    footer a { color: #f9c74f; text-decoration: none; }
  </style>
</head>
<body>
<header>
  <a class="logo" href="/">The Daily<span>Cheer</span></a>
  <a class="back" href="/">← Today's Stories</a>
</header>
<div class="container">
  <h1>📅 Story Archive</h1>
  <p class="sub">Every day's feel-good news, going back to when we started. Click any date to read that day's stories.</p>
  <div class="archive-list">
    ${rows || '<p>No archive entries yet — check back tomorrow!</p>'}
  </div>
</div>
<footer><p>© ${new Date().getFullYear()} The Daily Cheer — <a href="/">Home</a></p></footer>
</body>
</html>`;
}

// Google Indexing API
async function getGoogleToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email, scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now
  })).toString('base64url');
  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(sa.private_key, 'base64url');
  const jwt = `${header}.${payload}.${sig}`;
  const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
  const res = await httpReq({ hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } }, body);
  return JSON.parse(res.body).access_token;
}

async function submitGoogle(url, token) {
  const body = JSON.stringify({ url, type: 'URL_UPDATED' });
  const res = await httpReq({ hostname: 'indexing.googleapis.com', path: '/v3/urlNotifications:publish', method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, body);
  return res.status;
}

async function submitIndexNow(urls) {
  const body = JSON.stringify({ host: 'thedailycheer.com', key: INDEXNOW_KEY, keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`, urlList: urls });
  const res = await httpReq({ hostname: 'api.indexnow.org', path: '/indexnow', method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) } }, body);
  return res.status;
}

async function main() {
  const today = todayStr();
  console.log(`=== The Daily Cheer Generator — ${today} ===`);

  // Load today's stories (written by cron agent before running this script)
  const stories = loadStories(today);
  if (!stories) {
    console.error(`No stories file found at memory/dailycheer-stories-${today}.json`);
    console.error('The cron agent should generate stories and write them before calling this script.');
    process.exit(1);
  }

  // Ensure dirs exist
  if (!fs.existsSync(ARCHIVE_DIR)) fs.mkdirSync(ARCHIVE_DIR, { recursive: true });

  // If there's an existing index.html, archive yesterday's first
  const archiveIndex = loadArchiveIndex();
  const state = fs.existsSync(STATE_PATH) ? JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')) : {};

  if (state.lastDate && state.lastDate !== today && state.lastStories) {
    const prevDate = state.lastDate;
    const prevStories = state.lastStories;
    const archivePath = path.join(ARCHIVE_DIR, `${prevDate}.html`);
    if (!fs.existsSync(archivePath)) {
      console.log(`Archiving ${prevDate}...`);
      const archiveHtml = buildPage(prevDate, prevStories, false);
      fs.writeFileSync(archivePath, archiveHtml);
      // Add to archive index if not already there
      if (!archiveIndex.find(e => e.date === prevDate)) {
        archiveIndex.unshift({ date: prevDate, heroTitle: prevStories.hero.title });
        saveArchiveIndex(archiveIndex);
      }
    }
  }

  // Build today's index.html
  console.log('Building index.html...');
  const indexHtml = buildPage(today, stories, true);
  fs.writeFileSync(path.join(SITE_DIR, 'index.html'), indexHtml);

  // Build archive index page
  console.log('Building archive/index.html...');
  fs.writeFileSync(path.join(ARCHIVE_DIR, 'index.html'), buildArchiveIndex(archiveIndex));

  // Save state
  fs.writeFileSync(STATE_PATH, JSON.stringify({ lastDate: today, lastStories: stories, updatedAt: new Date().toISOString() }, null, 2));

  // Git push
  console.log('Pushing to GitHub...');
  try {
    execSync(`cd ${SITE_DIR} && git config user.email "slashdaddy@openclaw.ai" && git config user.name "Slashdaddy" && git add -A && git diff --cached --quiet || git commit -m "Daily update: ${today}" && git push origin main`, { stdio: 'inherit' });
    console.log('✅ Pushed to GitHub');
  } catch (e) {
    console.error('Git push failed:', e.message);
  }

  // Google Indexing API + IndexNow
  const urlsToSubmit = [
    `${BASE_URL}/`,
    `${BASE_URL}/archive/`,
    `${BASE_URL}/archive/${today}.html`,
  ];
  if (state.lastDate && state.lastDate !== today) {
    urlsToSubmit.push(`${BASE_URL}/archive/${state.lastDate}.html`);
  }

  try {
    const sa = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
    const token = await getGoogleToken(sa);
    let googleOk = 0;
    for (const url of urlsToSubmit) {
      const s = await submitGoogle(url, token);
      if (s === 200) googleOk++;
      await sleep(200);
    }
    console.log(`✅ Google Indexing API: ${googleOk}/${urlsToSubmit.length} submitted`);
  } catch (e) {
    console.error('Google Indexing error:', e.message);
  }

  try {
    const inStatus = await submitIndexNow(urlsToSubmit);
    console.log(`✅ IndexNow: HTTP ${inStatus}`);
  } catch (e) {
    console.error('IndexNow error:', e.message);
  }

  console.log(`\n✅ Done — thedailycheer.com updated for ${today}`);
  console.log(`Archive entries: ${archiveIndex.length + 1}`);
}

main().catch(e => { console.error(e); process.exit(1); });
