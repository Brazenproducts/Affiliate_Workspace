#!/usr/bin/env node
// Check info@brazenauto.com inbox for replies from Noah/Dom

const https = require('https');
const fs = require('fs');

const CREDS = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.gmail-brazenauto-credentials.json', 'utf8'));
const SEEN_PATH = '/home/ubuntu/.openclaw/workspace/memory/gmail-seen-ids.json';

function post(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method: 'POST', headers }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

function get(hostname, path, token) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, headers: { 'Authorization': 'Bearer ' + token } }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject); req.end();
  });
}

async function getToken() {
  const body = new URLSearchParams({
    client_id: CREDS.client_id, client_secret: CREDS.client_secret,
    refresh_token: CREDS.refresh_token, grant_type: 'refresh_token'
  }).toString();
  const res = await post('oauth2.googleapis.com', '/token',
    { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }, body);
  return JSON.parse(res.body).access_token;
}

async function run() {
  const token = await getToken();
  const seen = fs.existsSync(SEEN_PATH) ? JSON.parse(fs.readFileSync(SEEN_PATH, 'utf8')) : [];
  
  // Check for messages from Noah, Dom, Bartact, or Vercel
  const q = encodeURIComponent('from:(noah OR dom OR orders@bartact.com OR info@bartact.com OR noreply@vercel.com OR notifications@vercel.com) in:inbox newer_than:1d');
  const inbox = await get('gmail.googleapis.com', `/gmail/v1/users/me/messages?maxResults=20&q=${q}`, token);
  
  if (!inbox.messages || inbox.messages.length === 0) {
    console.log('NO_NEW_MESSAGES');
    return;
  }
  
  const newMessages = inbox.messages.filter(m => !seen.includes(m.id));
  if (newMessages.length === 0) {
    console.log('NO_NEW_MESSAGES');
    return;
  }
  
  // Get details for new messages
  for (const msg of newMessages) {
    const detail = await get('gmail.googleapis.com', `/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`, token);
    const headers = detail.payload?.headers || [];
    const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
    const subject = headers.find(h => h.name === 'Subject')?.value || '(no subject)';
    const date = headers.find(h => h.name === 'Date')?.value || '';
    console.log(`NEW_MESSAGE|${msg.id}|${from}|${subject}|${date}`);
    seen.push(msg.id);
  }
  
  fs.writeFileSync(SEEN_PATH, JSON.stringify(seen, null, 2));
}
run().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
