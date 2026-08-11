#!/usr/bin/env node
// Local OAuth callback server for Google re-authentication
// Listens on port 9876, catches the code, exchanges it, saves creds

const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');

const CLIENT_ID = '351767043397-mkr950se4f5ot5km83h5eho9q0agvvlk.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:9876/callback';
const CREDS_FILE = '/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json';
const SERVICE_ACCOUNT_CHECK = '/home/ubuntu/.openclaw/workspace/.gcp-service-account.json';

// Scopes needed: Google Indexing API + Google Ads
const SCOPES = [
  'https://www.googleapis.com/auth/indexing',
  'https://www.googleapis.com/auth/adwords',
  'https://www.googleapis.com/auth/webmasters',
].join(' ');

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&access_type=offline` +
  `&prompt=consent` +
  `&login_hint=info%40brazenauto.com`;

let server;

server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  if (parsed.pathname === '/callback') {
    const code = parsed.query.code;
    const error = parsed.query.error;

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h2>Error: ${error}</h2><p>Close this tab and check the terminal.</p>`);
      console.error('OAuth error:', error);
      server.close();
      process.exit(1);
    }

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<h2>No code received</h2>');
      server.close();
      process.exit(1);
    }

    console.log('\n✅ Got authorization code, exchanging for tokens...');

    const postData = new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }).toString();

    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const tokenReq = https.request(options, (tokenRes) => {
      let data = '';
      tokenRes.on('data', chunk => data += chunk);
      tokenRes.on('end', () => {
        const tokens = JSON.parse(data);

        if (tokens.error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`<h2>Token exchange failed: ${tokens.error}</h2><p>${tokens.error_description}</p>`);
          console.error('Token error:', tokens);
          server.close();
          process.exit(1);
        }

        // Save credentials
        const creds = {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          refresh_token: tokens.refresh_token,
          access_token: tokens.access_token,
          token_type: tokens.token_type,
          expiry_date: Date.now() + (tokens.expires_in * 1000),
          scope: tokens.scope,
          saved_at: new Date().toISOString(),
        };

        fs.writeFileSync(CREDS_FILE, JSON.stringify(creds, null, 2));
        console.log(`\n✅ Credentials saved to ${CREDS_FILE}`);
        console.log(`   refresh_token: ${tokens.refresh_token ? tokens.refresh_token.slice(0, 20) + '...' : 'MISSING — reauth needed'}`);

        if (!tokens.refresh_token) {
          console.error('\n⚠️  No refresh_token in response. Google only sends it on first consent.');
          console.error('   The prompt=consent parameter should have forced it. Check that you clicked Allow on a fresh consent screen.');
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <h2 style="color:green">✅ Done! Credentials saved.</h2>
          <p>refresh_token: ${tokens.refresh_token ? '✅ received' : '❌ missing'}</p>
          <p>You can close this tab.</p>
        `);

        console.log('\n🎉 All done. Close this terminal when ready.');
        server.close();
        process.exit(0);
      });
    });

    tokenReq.on('error', (e) => {
      console.error('Request error:', e);
      server.close();
      process.exit(1);
    });

    tokenReq.write(postData);
    tokenReq.end();

  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(9876, '127.0.0.1', () => {
  console.log('\n========================================');
  console.log('OAuth server running on port 9876');
  console.log('========================================');
  console.log('\nOpen this URL in Chrome signed in as info@brazenauto.com:\n');
  console.log(authUrl);
  console.log('\nWaiting for callback...');
});
