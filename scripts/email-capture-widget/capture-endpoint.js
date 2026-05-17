/**
 * capture-endpoint.js — Email capture POST endpoint
 *
 * Standalone Node.js HTTP server (or export handler for Vercel/CF Workers).
 *
 * POST /api/subscribe
 * Body: { email, source_site, signup_type }
 *
 * Run standalone:
 *   node capture-endpoint.js
 *   PORT=3001 node capture-endpoint.js
 *
 * For Vercel: export the `handler` function (see bottom of file).
 */

'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');

/* ── Config ─────────────────────────────────────────────── */
const PORT         = process.env.PORT || 3001;
const DATA_FILE    = process.env.DATA_FILE ||
  path.join(__dirname, '../../data/email-subscribers.json');
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*').split(',');

/* ── CORS headers ───────────────────────────────────────── */
function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes('*') ? '*' : (ALLOWED_ORIGINS.includes(origin) ? origin : '');
  return {
    'Access-Control-Allow-Origin':  allow || '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age':       '86400',
  };
}

/* ── Email validation ───────────────────────────────────── */
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

/* ── Read subscribers file ──────────────────────────────── */
function readSubscribers() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/* ── Write subscribers file (atomic-ish) ───────────────── */
function writeSubscribers(list) {
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2), 'utf8');
  fs.renameSync(tmp, DATA_FILE);
}

/* ── Core handler ───────────────────────────────────────── */
function handleSubscribe(body, origin) {
  const email      = (body.email      || '').trim().toLowerCase();
  const sourceSite = (body.source_site || '').trim().slice(0, 100);
  const signupType = (body.signup_type || 'unknown').trim().slice(0, 50);

  if (!isValidEmail(email)) {
    return { status: 400, body: { success: false, error: 'Invalid email address.' } };
  }

  const subscribers = readSubscribers();

  // Deduplicate by email
  const exists = subscribers.some(function (s) { return s.email === email; });
  if (exists) {
    // Silently succeed — don't leak whether email is already subscribed
    return { status: 200, body: { success: true, message: 'Already subscribed.' } };
  }

  subscribers.push({
    email:       email,
    source_site: sourceSite,
    signup_type: signupType,
    subscribed_at: new Date().toISOString(),
  });

  try {
    writeSubscribers(subscribers);
  } catch (e) {
    console.error('[EC] Failed to write subscribers file:', e.message);
    return { status: 500, body: { success: false, error: 'Server error. Please try again.' } };
  }

  console.log('[EC] New subscriber:', email, 'from', sourceSite, 'via', signupType);
  return { status: 200, body: { success: true, message: 'Subscribed!' } };
}


/* ── HTTP server ────────────────────────────────────────── */
function parseBody(req) {
  return new Promise(function (resolve, reject) {
    let data = '';
    req.on('data', function (chunk) {
      data += chunk;
      if (data.length > 4096) { reject(new Error('Payload too large')); }
    });
    req.on('end', function () {
      try { resolve(JSON.parse(data)); }
      catch (e) { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async function (req, res) {
  const origin = req.headers['origin'] || '';
  const headers = Object.assign({ 'Content-Type': 'application/json' }, corsHeaders(origin));

  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  // Only handle POST /api/subscribe (or just POST /)
  const url = req.url.split('?')[0];
  if (req.method !== 'POST' || (url !== '/api/subscribe' && url !== '/')) {
    res.writeHead(404, headers);
    res.end(JSON.stringify({ success: false, error: 'Not found.' }));
    return;
  }

  let body;
  try {
    body = await parseBody(req);
  } catch (e) {
    res.writeHead(400, headers);
    res.end(JSON.stringify({ success: false, error: e.message }));
    return;
  }

  const result = handleSubscribe(body, origin);
  res.writeHead(result.status, headers);
  res.end(JSON.stringify(result.body));
});

/* ── Vercel / serverless export ─────────────────────────── */
// For Vercel: rename this file to api/subscribe.js and export handler
async function handler(req, res) {
  const origin = (req.headers && req.headers['origin']) || '';
  const cors = corsHeaders(origin);
  Object.keys(cors).forEach(function (k) { res.setHeader(k, cors[k]); });
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST')    { res.status(405).json({ success: false, error: 'Method not allowed.' }); return; }

  const body = typeof req.body === 'object' ? req.body : {};
  const result = handleSubscribe(body, origin);
  res.status(result.status).json(result.body);
}

module.exports = { handler, handleSubscribe };

/* ── Start standalone server ────────────────────────────── */
if (require.main === module) {
  server.listen(PORT, function () {
    console.log('[EC] Email capture endpoint running on port ' + PORT);
    console.log('[EC] Data file:', DATA_FILE);
    console.log('[EC] POST http://localhost:' + PORT + '/api/subscribe');
  });
}
