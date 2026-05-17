#!/usr/bin/env node
const https = require('https');
const fs = require('fs');

const CREDS = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.amazon-bartact-credentials.json', 'utf8'));
const SELLER_ID = CREDS.seller_id;
const MKT = CREDS.marketplace_id;
const HOST = 'sellingpartnerapi-na.amazon.com';
const LOG_PATH = '/home/ubuntu/.openclaw/workspace/memory/2026-04-14-amazon-fixes.md';

let token = null;

function http(opts, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ s: res.statusCode, b: JSON.parse(d) }); }
        catch { resolve({ s: res.statusCode, b: d }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function auth() {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: CREDS.refresh_token,
    client_id: CREDS.client_id,
    client_secret: CREDS.client_secret,
  }).toString();
  const r = await http({
    hostname: 'api.amazon.com', path: '/auth/o2/token', method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
  }, body);
  if (r.s !== 200) throw new Error(`auth failed ${r.s}`);
  token = r.b.access_token;
}

function get(path) {
  return http({ hostname: HOST, path, method: 'GET', headers: { 'x-amz-access-token': token, 'Content-Type': 'application/json' } });
}

function patch(path, body) {
  const bs = JSON.stringify(body);
  return http({ hostname: HOST, path, method: 'PATCH', headers: { 'x-amz-access-token': token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bs) } }, bs);
}

async function retryGet(path, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const r = await get(path);
    if (r.s === 429) { await sleep(3000 + i * 2000); continue; }
    return r;
  }
  return { s: 429, b: 'rate limited' };
}

async function retryPatch(path, body, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const r = await patch(path, body);
    if (r.s === 429) { await sleep(3000 + i * 2000); continue; }
    return r;
  }
  return { s: 429, b: 'rate limited' };
}

function inferFromSku(sku) {
  const patterns = [
    { re: /(BK)(?:-FXVD)?$/i, value: 'Black', std: ['black'] },
    { re: /(BU)(?:-FXVD)?$/i, value: 'Blue', std: ['blue'] },
    { re: /(BR)(?:-FXVD)?$/i, value: 'Red', std: ['red'] },
    { re: /(BN)(?:-FXVD)?$/i, value: 'Orange', std: ['orange'] },
    { re: /(BO)(?:-FXVD)?$/i, value: 'Olive Drab', std: ['green'] },
    { re: /(BT)(?:-FXVD)?$/i, value: 'Navy', std: ['blue'] },
    { re: /(BC)(?:-FXVD)?$/i, value: 'Coyote', std: ['beige'] },
    { re: /(BG)(?:-FXVD)?$/i, value: 'Graphite', std: ['gray'] },
    { re: /(BB)(?:-FXVD)?$/i, value: 'Black/Black', std: ['black'] },
    { re: /(BA)(?:-FXVD)?$/i, value: 'ACU Camo', std: ['multicolor'] },
    { re: /(BY)(?:-FXVD)?$/i, value: 'Yellow', std: ['yellow'] },
  ];
  for (const p of patterns) {
    if (p.re.test(sku)) return { value: p.value, standardized_values: p.std };
  }
  return null;
}

async function main() {
  await auth();

  const targets = [
    'BTJKSC2013FP-Parent',
    'WQ-VQ1G-GIFU',
    'JKSC2013FPBK',
    'D5-MCGU-E02C',
    'WM-MUMY-K2KB',
    'XXFSBY'
  ];

  const results = [];

  for (const sku of targets) {
    const r = await retryGet(`/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(sku)}?marketplaceIds=${MKT}&includedData=attributes,issues,summaries`);
    if (r.s !== 200) {
      results.push({ sku, status: `GET ${r.s}` });
      continue;
    }

    const attrs = r.b.attributes || {};
    const summaries = r.b.summaries || [];
    const productType = summaries[0]?.productType || 'AUTO_ACCESSORY';
    const existingColor = attrs.color || [];
    const guessed = inferFromSku(sku);

    if (!guessed) {
      results.push({ sku, status: 'no defensible sku color inference' });
      continue;
    }

    const replacement = [{
      language_tag: existingColor[0]?.language_tag || 'en_US',
      marketplace_id: existingColor[0]?.marketplace_id || MKT,
      value: guessed.value,
      standardized_values: guessed.standardized_values,
    }];

    const pr = await retryPatch(
      `/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(sku)}?marketplaceIds=${MKT}`,
      {
        productType,
        patches: [{ op: 'replace', path: '/attributes/color', value: replacement }],
      }
    );

    results.push({
      sku,
      guessed,
      patchStatus: pr.s,
      submissionStatus: pr.b?.status || null,
      issues: pr.b?.issues || [],
    });

    await sleep(700);
  }

  const appendix = [
    '',
    '## Phase 5: Missing Color Value Backfill',
    `_Run at ${new Date().toISOString().slice(0, 16)}Z_`,
    '',
    ...results.map(r => `- **${r.sku}**: ${r.status || `patched ${JSON.stringify(r.guessed)}; HTTP ${r.patchStatus}; status=${r.submissionStatus || '(none)'}; issues=${(r.issues || []).map(i => i.code).join(',') || 'none'}`}`),
    '',
  ].join('\n');

    const existing = fs.readFileSync(LOG_PATH, 'utf8');
    fs.writeFileSync(LOG_PATH, existing + appendix);
    console.log(JSON.stringify(results, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
