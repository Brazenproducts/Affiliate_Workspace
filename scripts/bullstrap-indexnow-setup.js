#!/usr/bin/env node
// Serve IndexNow key file on bullstrap.com via Shopify theme snippet
// Key file must be accessible at: https://www.bullstrap.com/b4f7e2a1c3d5f6789012345678a4b5c6.txt
// Content of key file must be: b4f7e2a1c3d5f6789012345678a4b5c6

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');

const STORE = 'bull-strap-78.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BULLSTRAP;
const KEY = 'b4f7e2a1c3d5f6789012345678a4b5c6';
const API = '2024-10';

function shopifyRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: STORE,
      path: `/admin/api/${API}${path}`,
      method,
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  // Step 1: Get the active theme
  console.log('Fetching active theme...');
  const themes = await shopifyRequest('GET', '/themes.json');
  const active = themes.body.themes.find(t => t.role === 'main');
  if (!active) { console.error('No active theme found'); process.exit(1); }
  console.log(`Active theme: ${active.name} (id: ${active.id})`);

  // Step 2: Add a snippet that serves the key file content
  // We'll add it to the theme.liquid <head> via a snippet
  const snippetKey = `indexnow-key`;
  const snippetContent = `{% if request.path == '/${KEY}.txt' %}{{ '${KEY}' }}{% endif %}`;

  // Step 3: Create/update the snippet file
  console.log('Creating indexnow-key snippet...');
  const snippetRes = await shopifyRequest('PUT', `/themes/${active.id}/assets.json`, {
    asset: {
      key: `snippets/${snippetKey}.liquid`,
      value: snippetContent
    }
  });
  console.log('Snippet result:', snippetRes.status, snippetRes.body.asset?.key || snippetRes.body.errors);

  // Step 4: Read theme.liquid and inject the snippet if not already there
  console.log('Reading theme.liquid...');
  const themeAsset = await shopifyRequest('GET', `/themes/${active.id}/assets.json?asset[key]=layout/theme.liquid`);
  let themeLiquid = themeAsset.body.asset?.value;
  if (!themeLiquid) { console.error('Could not read theme.liquid'); process.exit(1); }

  if (themeLiquid.includes('indexnow-key')) {
    console.log('IndexNow snippet already in theme.liquid — skipping inject');
  } else {
    // Inject at very top before <!DOCTYPE or <html>
    themeLiquid = `{% render 'indexnow-key' %}\n` + themeLiquid;
    console.log('Injecting snippet into theme.liquid...');
    const updateRes = await shopifyRequest('PUT', `/themes/${active.id}/assets.json`, {
      asset: {
        key: 'layout/theme.liquid',
        value: themeLiquid
      }
    });
    console.log('theme.liquid update:', updateRes.status, updateRes.body.asset?.key || updateRes.body.errors);
  }

  console.log(`\nDone! Test with: curl https://www.bullstrap.com/${KEY}.txt`);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
