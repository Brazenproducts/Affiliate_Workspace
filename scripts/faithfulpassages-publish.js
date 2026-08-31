#!/usr/bin/env node
/**
 * Faithful Passages — Daily Content Publisher
 *
 * Reads a JSON content file (prayer/song/scripture),
 * generates TTS audio via gTTS (EN + ES),
 * builds the HTML page,
 * updates the sitemap,
 * and commits + pushes to GitHub Pages.
 *
 * Usage: node faithfulpassages-publish.js --file /tmp/fp-content-today.json
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ── Config ────────────────────────────────────────────────────────────────────
const SITE_DIR = process.env.SITE_DIR || path.join(__dirname, '../sites/faithfulpassages.com');
const AUDIO_DIR = path.join(SITE_DIR, 'audio');
const SITE_URL = 'https://faithfulpassages.com';

// Parse args
const args = process.argv.slice(2);
let contentFile = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--file' && args[i + 1]) {
    contentFile = args[i + 1];
  }
}

if (!contentFile) {
  console.error('ERROR: --file <path> required');
  process.exit(1);
}

if (!fs.existsSync(contentFile)) {
  console.error('ERROR: File not found:', contentFile);
  process.exit(1);
}

const content = JSON.parse(fs.readFileSync(contentFile, 'utf8'));
const { type, slug, date } = content;

// ── Validation gate — catch bad fields before writing HTML ────────────────────
const REQUIRED_FIELDS = { prayer: ['title','theme','slug','date','prayer_en','prayer_es'], song: ['title','theme','slug','date','lyrics_en','lyrics_es','scripture','style'], scripture: ['title','theme','slug','date','body_en','body_es'] };
const required = REQUIRED_FIELDS[type] || [];
const missing = required.filter(f => !content[f] || content[f] === 'undefined' || String(content[f]).trim() === '');
if (missing.length) { console.error(`VALIDATION ERROR: Missing required fields: ${missing.join(', ')}`); process.exit(1); }
// Title must be ≤65 chars when appended with " — Faithful Passages" (20 chars)
const titleWithBrand = `${content.title} — Faithful Passages`;
if (titleWithBrand.length > 65) { const max = 65 - 20; console.warn(`WARN: title too long (${titleWithBrand.length}c). Truncating at ${max}c.`); content.title = content.title.slice(0, max).replace(/[\s—|]+$/, ''); }
// Meta desc must be 80–160 chars
const themeLen = String(content.theme || '').length;
if (themeLen < 80 || themeLen > 160) { console.warn(`WARN: theme/meta-desc is ${themeLen} chars (need 80–160). Please fix in content JSON.`); }

console.log(`Publishing ${type}: ${content.title} (${slug})`);

// ── TTS via gTTS ─────────────────────────────────────────────────────────────
function generateAudio(text, lang, outPath) {
  // Clean text for TTS
  const clean = text
    .replace(/\n+/g, ' ')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const pyScript = `/tmp/fp-tts-${lang}.py`;
  const escaped = clean.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"');

  fs.writeFileSync(pyScript, `
from gtts import gTTS
import sys

text = """${escaped}"""
lang = "${lang}"
out_path = "${outPath}"

try:
    tts = gTTS(text=text, lang=lang, slow=False)
    tts.save(out_path)
    import os
    print(f"Generated {lang} audio: {out_path} ({os.path.getsize(out_path)} bytes)")
except Exception as e:
    print(f"ERROR: {e}", file=sys.stderr)
    sys.exit(1)
`);

  try {
    execSync(`python3 ${pyScript}`, { stdio: 'inherit' });
    return true;
  } catch (e) {
    console.error(`Audio generation failed for ${lang}:`, e.message);
    return false;
  }
}

// ── HTML Builder ──────────────────────────────────────────────────────────────
const STRIPE_DONATE_URL = 'https://donate.stripe.com/faithfulpassages';
const nav = `<nav><a class="nav-brand" href="/">Faithful <span>Passages</span></a><ul class="nav-links"><li><a href="/prayers.html">Prayers</a></li><li><a href="/songs.html">Songs</a></li><li><a href="/scripture.html">Scripture</a></li><li><a href="/about.html">About</a></li><li><a href="${STRIPE_DONATE_URL}" class="nav-donate" target="_blank" rel="noopener">❤️ Support</a></li></ul></nav>`;
const footer = `<div class="donate-section" style="background:linear-gradient(135deg,#7A9E7E 0%,#5a7a5e 100%);color:white;text-align:center;padding:48px 24px;">
<h2 style="font-size:1.7rem;margin-bottom:12px;">Keep This Free for Everyone</h2>
<p style="font-size:1.05rem;opacity:0.9;max-width:520px;margin:0 auto 28px;">Faithful Passages is free — no ads, no paywalls, no algorithms. If these words have helped you, consider supporting the work.</p>
<a href="${STRIPE_DONATE_URL}" target="_blank" rel="noopener" style="display:inline-block;background:white;color:#5a7a5e;font-weight:700;font-size:1.05rem;padding:14px 36px;border-radius:50px;text-decoration:none;box-shadow:0 4px 20px rgba(0,0,0,0.2);">❤️ Give a Gift</a>
<p style="font-size:0.8rem;opacity:0.7;margin-top:16px;">Secure · Any amount · Cancel anytime</p>
</div>
<div class="email-section"><h2>Get Daily Prayers Delivered Free</h2><p>A new prayer every morning. Real words for real life.</p><form class="email-form" onsubmit="handleSignup(event)"><input type="email" placeholder="Your email address" required><button type="submit">Subscribe Free</button></form></div>
<footer><div class="footer-links"><a href="/prayers.html">Prayers</a><a href="/songs.html">Songs</a><a href="/scripture.html">Scripture</a><a href="/about.html">About</a><a href="/privacy.html">Privacy</a></div><p>© 2026 Faithful Passages</p></footer>
<script src="/app.js"></script>`;

// Canonical URL helper
const canonicalUrl = (c) => `${SITE_URL}/${c.slug}.html`;

const ldJson = (c) => JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": c.title,
  "datePublished": c.date,
  "publisher": { "@type": "Organization", "name": "Faithful Passages", "url": SITE_URL }
});

function buildPrayerHtml(c) {
  const prayerEn = c.prayer_en.replace(/\n/g, '<br>\n');
  const prayerEs = c.prayer_es.replace(/\n/g, '<br>\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${c.title} — Faithful Passages</title>
<meta name="description" content="${c.theme}">
<link rel="canonical" href="${canonicalUrl(c)}">
<link rel="stylesheet" href="/style.css">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script type="application/ld+json">${ldJson(c)}</script>
</head>
<body>
${nav}
<div class="hero" style="padding:56px 24px 48px;"><p class="hero-eyebrow">Prayer · ${c.date}</p><h1>${c.title}</h1><p>${c.theme}</p></div>
<section>
<div class="prayer-card">
<span class="prayer-tag">${c.tag}</span>
<p style="font-size:0.85rem;color:#888;margin-bottom:8px;">▶ Listen in English</p><audio controls preload="none" style="width:100%;border-radius:8px;margin-bottom:20px;"><source src="/audio/${c.slug}-en.mp3" type="audio/mpeg"></audio>
<p>${prayerEn}</p>
</div>
<div class="prayer-card" style="background:#f9f7f4;"><h3 style="font-size:1rem;color:#7A9E7E;">Reflection</h3><p style="font-style:italic;">${c.reflection}</p></div>
<hr class="divider">
<div class="prayer-card">
<p class="section-label">En Español</p>
<h2 style="font-size:1.3rem;margin-bottom:16px;">${c.title}</h2>
<p style="font-size:0.85rem;color:#888;margin-bottom:8px;">▶ Escuchar en Español</p><audio controls preload="none" style="width:100%;border-radius:8px;margin-bottom:20px;"><source src="/audio/${c.slug}-es.mp3" type="audio/mpeg"></audio>
<p>${prayerEs}</p>
</div>
</section>
${footer}
</body></html>`;
}

function buildSongHtml(c) {
  const fmtLyrics = (txt) => txt.split('\n').map(l => l.trim() ? `<p>${l}</p>` : '<br>').join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${c.title} — Faithful Passages</title>
<meta name="description" content="${c.theme}">
<link rel="canonical" href="${canonicalUrl(c)}">
<link rel="stylesheet" href="/style.css">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script type="application/ld+json">${ldJson(c)}</script>
</head>
<body>
${nav}
<div class="hero" style="padding:56px 24px 48px;"><p class="hero-eyebrow">Song · ${c.date}</p><h1>${c.title}</h1><p>${c.theme}</p><p style="font-size:0.9rem;color:#888;margin-top:8px;">Based on ${c.scripture} · ${c.style}</p></div>
<section>
<div class="prayer-card">
<p style="font-size:0.85rem;color:#888;margin-bottom:8px;">▶ Listen in English</p>
<audio controls preload="none" style="width:100%;border-radius:8px;margin-bottom:20px;"><source src="/audio/${c.slug}-en.mp3" type="audio/mpeg"></audio>
<div class="lyrics">
${fmtLyrics(c.lyrics_en)}
</div>
</div>
<hr class="divider">
<div class="prayer-card">
<p class="section-label">En Español</p>
<h2 style="font-size:1.3rem;margin-bottom:16px;">${c.title}</h2>
<p style="font-size:0.85rem;color:#888;margin-bottom:8px;">▶ Escuchar en Español</p>
<audio controls preload="none" style="width:100%;border-radius:8px;margin-bottom:20px;"><source src="/audio/${c.slug}-es.mp3" type="audio/mpeg"></audio>
<div class="lyrics">
${fmtLyrics(c.lyrics_es)}
</div>
</div>
</section>
${footer}
</body></html>`;
}

function buildScriptureHtml(c) {
  // Support both old (reading_en/verse/ref) and new (body_en/scripture_text/scripture_ref) field names
  const rawEn = c.body_en || c.reading_en || '';
  const rawEs = c.body_es || c.reading_es || '';
  // If content is already HTML (contains tags), use as-is; otherwise convert newlines
  const isHtml = (s) => /<[a-z][\s\S]*>/i.test(s);
  const readingEn = isHtml(rawEn) ? rawEn : rawEn.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>\n');
  const readingEs = isHtml(rawEs) ? rawEs : rawEs.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>\n');
  const verseText = c.scripture_text || c.verse || '';
  const verseRef = c.scripture_ref || c.ref || '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${c.title} — Faithful Passages</title>
<meta name="description" content="${c.theme}">
<link rel="canonical" href="${canonicalUrl(c)}">
<link rel="stylesheet" href="/style.css">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script type="application/ld+json">${ldJson(c)}</script>
</head>
<body>
${nav}
<div class="hero" style="padding:56px 24px 48px;"><p class="hero-eyebrow">Scripture · ${c.date}</p><h1>${c.title}</h1><p>${c.theme}</p></div>
<section>
<div class="prayer-card" style="background:#f0ebe3;border-left:4px solid #7A9E7E;padding:24px 28px;">
<p style="font-size:1.15rem;font-style:italic;line-height:1.8;">"${verseText}"</p>
<p style="font-size:0.85rem;color:#888;margin-top:8px;">— ${verseRef}</p>
</div>
<div class="prayer-card">
<p style="font-size:0.85rem;color:#888;margin-bottom:8px;">▶ Listen in English</p>
<audio controls preload="none" style="width:100%;border-radius:8px;margin-bottom:20px;"><source src="/audio/${c.slug}-en.mp3" type="audio/mpeg"></audio>
<p>${readingEn}</p>
</div>
${c.misconception ? `<div class="prayer-card" style="background:#f9f7f4;">
<h3 style="font-size:1rem;color:#7A9E7E;">What People Often Think</h3>
<p>${c.misconception}</p>
<h3 style="font-size:1rem;color:#7A9E7E;margin-top:16px;">What It Actually Means</h3>
<p>${c.real_meaning}</p>
<h3 style="font-size:1rem;color:#7A9E7E;margin-top:16px;">How to Apply It</h3>
<p>${c.application}</p>
</div>` : ''}
<hr class="divider">
<div class="prayer-card">
<p class="section-label">En Español</p>
<h2 style="font-size:1.3rem;margin-bottom:16px;">${c.title}</h2>
<p style="font-size:0.85rem;color:#888;margin-bottom:8px;">▶ Escuchar en Español</p>
<audio controls preload="none" style="width:100%;border-radius:8px;margin-bottom:20px;"><source src="/audio/${c.slug}-es.mp3" type="audio/mpeg"></audio>
<p>${readingEs}</p>
</div>
</section>
${footer}
</body></html>`;
}

// ── Sitemap updater ───────────────────────────────────────────────────────────
function updateSitemap(slug) {
  const sitemapPath = path.join(SITE_DIR, 'sitemap.xml');
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const entry = `  <url><loc>${SITE_URL}/${slug}.html</loc><lastmod>${date}</lastmod></url>`;
  if (!sitemap.includes(`${slug}.html`)) {
    sitemap = sitemap.replace('</urlset>', `${entry}\n</urlset>`);
    fs.writeFileSync(sitemapPath, sitemap);
    console.log('✓ Sitemap updated');
  } else {
    console.log('  Sitemap entry already exists');
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Generate audio
  console.log('\n── Generating audio ──');
  const audioText = content.prayer_en || content.lyrics_en || content.reading_en || content.text_en || content.body_en;
  const audioTextEs = content.prayer_es || content.lyrics_es || content.reading_es || content.text_es || content.body_es;

  const enPath = path.join(AUDIO_DIR, `${slug}-en.mp3`);
  const esPath = path.join(AUDIO_DIR, `${slug}-es.mp3`);

  const enOk = generateAudio(audioText, 'en', enPath);
  const esOk = generateAudio(audioTextEs, 'es', esPath);

  // 2. Build HTML
  console.log('\n── Building HTML ──');
  let html;
  if (type === 'prayer') html = buildPrayerHtml(content);
  else if (type === 'song') html = buildSongHtml(content);
  else if (type === 'scripture') html = buildScriptureHtml(content);
  else { console.error('Unknown type:', type); process.exit(1); }

  const htmlPath = path.join(SITE_DIR, `${slug}.html`);
  fs.writeFileSync(htmlPath, html);
  console.log(`✓ HTML written: ${slug}.html`);

  // 3. Update sitemap
  updateSitemap(slug);

  // 4. Git commit and push
  console.log('\n── Git commit + push ──');
  const gitDir = SITE_DIR;

  try {
    execSync(`git -C "${gitDir}" config user.email "axl@openclaw.ai"`, { stdio: 'inherit' });
    execSync(`git -C "${gitDir}" config user.name "Axl"`, { stdio: 'inherit' });
    execSync(`git -C "${gitDir}" add "${htmlPath}" "${path.join(SITE_DIR, 'sitemap.xml')}"`, { stdio: 'inherit' });
    if (enOk) execSync(`git -C "${gitDir}" add "${enPath}"`, { stdio: 'inherit' });
    if (esOk) execSync(`git -C "${gitDir}" add "${esPath}"`, { stdio: 'inherit' });

    const msg = `Daily content: ${content.title} (${date})`;
    execSync(`git -C "${gitDir}" commit -m "${msg}"`, { stdio: 'inherit' });
    execSync(`git -C "${gitDir}" push origin main`, { stdio: 'inherit' });
    console.log('✓ Pushed to GitHub Pages');
  } catch (e) {
    console.error('Git error:', e.message);
    process.exit(1);
  }

  const url = `${SITE_URL}/${slug}.html`;
  const audioStatus = (enOk && esOk) ? 'Audio EN+ES generated' : (enOk ? 'Audio EN only' : 'Audio skipped');

  // 5. Submit to IndexNow (Bing + Yandex) — Rule #1: every push, no exceptions
  console.log('\n── IndexNow submission ──');
  const INDEXNOW_KEY = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';
  const indexNowBody = JSON.stringify({
    host: 'faithfulpassages.com',
    key: INDEXNOW_KEY,
    keyLocation: `https://faithfulpassages.com/${INDEXNOW_KEY}.txt`,
    urlList: [url, `${SITE_URL}/sitemap.xml`]
  });
  await new Promise((resolve) => {
    const https = require('https');
    const req = https.request({
      hostname: 'api.indexnow.org',
      path: '/indexnow',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(indexNowBody) }
    }, res => {
      console.log(`✓ IndexNow: ${res.statusCode}`);
      resolve();
    });
    req.on('error', e => { console.error('IndexNow error:', e.message); resolve(); });
    req.write(indexNowBody);
    req.end();
  });
  // NOTE: Google Indexing API for faithfulpassages.com is not yet wired up.
  // Blocked on: verify faithfulpassages.com in GSC under axl-348@proud-stage-397621.iam.gserviceaccount.com
  // TODO: add Google Indexing API call here once service account is verified.

  console.log(`\n✅ Published ${type}: ${content.title} — ${url} — ${audioStatus}`);
  process.stdout.write(`RESULT:${JSON.stringify({ url, type, title: content.title, slug, audioStatus })}\n`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
