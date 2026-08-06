const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');

// Known from session history
const CLIENT_ID = '351767043397-mkr950se4f5ot5km83h5eho9q0agvvlk.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:9876/oauth/callback';
const SCOPES = [
  'https://www.googleapis.com/auth/adwords',
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/content'
].join(' ');

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&access_type=offline` +
  `&prompt=consent`;

console.log('\n✅ OAuth server running on port 9876');
console.log('\nOpen this URL in your browser:\n');
console.log(authUrl);
console.log('\nWaiting for callback...\n');

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  if (!parsed.query.code) {
    res.end('No code received');
    return;
  }
  const code = parsed.query.code;
  console.log('Got auth code, exchanging for tokens...');

  const body = new URLSearchParams({
    code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI, grant_type: 'authorization_code'
  }).toString();

  const tokenReq = https.request({
    hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
  }, r => {
    let d = ''; r.on('data', c => d += c);
    r.on('end', () => {
      const tokens = JSON.parse(d);
      if (!tokens.refresh_token) {
        console.error('❌ No refresh_token in response:', d);
        res.end('Error — no refresh token. See console.');
        return;
      }
      const creds = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: tokens.refresh_token,
        developer_token: 'TIfup5TmHbbX3ICzZFZh2w',
        customer_id: '1770651698'
      };
      const outPath = '/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json';
      fs.writeFileSync(outPath, JSON.stringify(creds, null, 2));
      console.log('✅ Credentials saved to', outPath);
      console.log('⚠️  Still need developer_token — update the file manually');
      res.end('<h1>✅ Auth complete! Return to terminal.</h1>');
      server.close();
    });
  });
  tokenReq.on('error', e => { console.error(e); res.end('Error'); });
  tokenReq.write(body); tokenReq.end();
});

server.listen(9876);
