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

function mapColor(value) {
  if (!value) return null;
  const v = value.toLowerCase().trim();
  const direct = {
    black: ['black'], blue: ['blue'], brown: ['brown'], red: ['red'], green: ['green'], orange: ['orange'],
    white: ['white'], yellow: ['yellow'], navy: ['blue'], 'navy blue': ['blue'], tan: ['beige'], khaki: ['beige'],
    coyote: ['beige'], graphite: ['gray'], gray: ['gray'], grey: ['gray'], 'olive drab': ['green'], olive: ['green'],
    multicam: ['multicolor'], camo: ['multicolor'], 'acu camo': ['multicolor'], acu: ['multicolor'],
    'black vinyl': ['black'], 'blue fabric': ['blue'], 'red fabric': ['red'], 'white vinyl': ['white'],
  };
  if (direct[v]) return direct[v];
  if (v.includes('/')) {
    const parts = v.split(/\s*\/\s*/).filter(Boolean);
    const tail = parts[parts.length - 1];
    if (direct[tail]) return direct[tail];
    if (tail.includes('camo')) return ['multicolor'];
    if (tail.includes('pink')) return ['pink'];
    if (tail.includes('yellow')) return ['yellow'];
  }
  if (v.includes('yellow')) return ['yellow'];
  if (v.includes('pink')) return ['pink'];
  if (v.includes('camo')) return ['multicolor'];
  return null;
}

async function inspectSku(sku) {
  const path = `/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(sku)}?marketplaceIds=${MKT}&includedData=attributes,issues,summaries`;
  const r = await retryGet(path);
  return { sku, r };
}

async function patchColor(sku, productType, colorArr, standardized) {
  const body = {
    productType,
    patches: [{ op: 'replace', path: '/attributes/color', value: colorArr.map(c => ({ ...c, standardized_values: standardized })) }],
  };
  return retryPatch(`/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(sku)}?marketplaceIds=${MKT}`, body);
}

async function main() {
  await auth();

  const targets = [
    'BTJKSC2013FP-Parent',
    'WQ-VQ1G-GIFU',
    'JKSC2013FPBK',
    'D5-MCGU-E02C',
    'XXJC60FB-FXVD',
    'WM-MUMY-K2KB',
    'MASHKB-PARENT',
    'XXFSBY',
    'MASDKB-FXVD',
  ];

  const findings = [];
  const fixes = [];

  for (const sku of targets) {
    const { r } = await inspectSku(sku);
    if (r.s !== 200) {
      findings.push({ sku, status: `GET ${r.s}` });
      continue;
    }

    const attrs = r.b.attributes || {};
    const issues = (r.b.issues || []).filter(i => i.severity === 'ERROR' && (i.attributeNames || []).includes('color'));
    const summaries = r.b.summaries || [];
    const productType = summaries[0]?.productType || null;
    const colorArr = attrs.color || [];
    const value = colorArr[0]?.value || '';
    const current = colorArr[0]?.standardized_values || [];

    findings.push({
      sku,
      productType,
      colorCount: colorArr.length,
      value,
      current,
      issues: issues.map(i => ({ code: i.code, message: i.message })),
    });

    const mapped = mapColor(value);
    if (mapped && colorArr.length > 0 && JSON.stringify(mapped) !== JSON.stringify(current)) {
      const pr = await patchColor(sku, productType || 'AUTO_ACCESSORY', colorArr, mapped);
      fixes.push({ sku, value, from: current, to: mapped, result: pr.s, status: pr.b.status, issues: pr.b.issues || [] });
      await sleep(700);
    }
  }

  const appendix = [
    '',
    '## Phase 4: Remaining Color Failure Inspection',
    `_Run at ${new Date().toISOString().slice(0, 16)}Z_`,
    '',
    '### Findings',
    ...findings.map(f => `- **${f.sku}**: productType=${f.productType || '(none)'}; colorCount=${f.colorCount ?? 0}; value="${f.value || ''}"; current=${JSON.stringify(f.current || [])}; issues=${(f.issues || []).map(i => i.code).join(',') || 'none'}`),
    '',
    '### Fixes',
    ...(fixes.length ? fixes.map(f => `- **${f.sku}**: "${f.value}" ${JSON.stringify(f.from)} → ${JSON.stringify(f.to)}; PATCH ${f.result}; status=${f.status || '(none)'}`) : ['- none']),
    '',
  ].join('\n');

  const existing = fs.readFileSync(LOG_PATH, 'utf8');
  fs.writeFileSync(LOG_PATH, existing + appendix);

  console.log(JSON.stringify({ findings, fixes }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
