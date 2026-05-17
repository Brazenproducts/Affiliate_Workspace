#!/usr/bin/env node
const https = require('https');
const fs = require('fs');

const CREDS = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.amazon-bartact-credentials.json', 'utf8'));
const SELLER_ID = CREDS.seller_id;
const MARKETPLACE_ID = CREDS.marketplace_id;
const API_HOST = 'sellingpartnerapi-na.amazon.com';
const LOG_PATH = '/home/ubuntu/.openclaw/workspace/memory/2026-04-24.md';

const TARGETS = [
  { asin: 'B09ZGKML3H', sku: 'FBIACPLM-B', note: 'Console lid organizer pouch black' },
  { asin: 'B09ZG81524', sku: 'FBIACPLM-G', note: 'Console lid organizer pouch grey' },
  { asin: 'B09ZG6XMHR', sku: 'FBIACPLM-R', note: 'Console lid organizer pouch red' },
  { asin: 'B09ZGKHLBN', sku: 'FBIACPLM-T', note: 'Console lid organizer pouch navy' },
  { asin: 'B09ZGKMY96', sku: 'FBIACPLM-U', note: 'Console lid organizer pouch blue' },
  { asin: 'B09ZGFPXJL', sku: 'FBIACPLM-W', note: 'Console lid organizer pouch white' },
  { asin: 'B09ZG94QQV', sku: 'FBIACPLM-Y', note: 'Console lid organizer pouch yellow' },
  { asin: 'B09ZH7DBBC', sku: 'FBIAMPF2', note: 'Front door MOLLE panels pair' },
  { asin: 'B09ZHL8HVZ', sku: 'FBIAMPFD', note: 'Front door MOLLE panel driver' },
  { asin: 'B09ZH9S8TJ', sku: 'FBIAMPFD-MP', note: 'Front door MOLLE panel driver with pouch' },
  { asin: 'B09ZHHD1FK', sku: 'FBIAMPFP', note: 'Front door MOLLE panel passenger' },
  { asin: 'B09ZGXTC4Y', sku: 'FBIAMPFP-MP', note: 'Front door MOLLE panel passenger with pouch' },
  { asin: 'B09LHW93RV', sku: 'FBGHR2-PARENT', note: 'Roll bar grab handles parent' },
  { asin: 'B0GS238N5R', sku: 'B0GS238N5R', note: 'Seat covers newer listing candidate', fallbackFromTsv: true },
  { asin: 'B0GS28P4HJ', sku: 'B0GS28P4HJ', note: 'Console cover newer listing candidate', fallbackFromTsv: true },
  { asin: 'B0GS36RC7X', sku: 'B0GS36RC7X', note: 'Grab handles newer listing candidate', fallbackFromTsv: true },
];

let accessToken = null;

function httpRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function refreshToken() {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: CREDS.refresh_token,
    client_id: CREDS.client_id,
    client_secret: CREDS.client_secret,
  }).toString();

  const res = await httpRequest({
    hostname: 'api.amazon.com',
    path: '/auth/o2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);

  if (res.status !== 200) {
    throw new Error(`Token refresh failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  accessToken = res.body.access_token;
}

function apiGet(path) {
  return httpRequest({
    hostname: API_HOST,
    path,
    method: 'GET',
    headers: {
      'x-amz-access-token': accessToken,
      'Content-Type': 'application/json',
    },
  });
}

function apiPatch(path, body) {
  const payload = JSON.stringify(body);
  return httpRequest({
    hostname: API_HOST,
    path,
    method: 'PATCH',
    headers: {
      'x-amz-access-token': accessToken,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  }, payload);
}

function listingPath(sku) {
  return `/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(sku)}?marketplaceIds=${MARKETPLACE_ID}&includedData=attributes,summaries`;
}

function patchPath(sku) {
  return `/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(sku)}?marketplaceIds=${MARKETPLACE_ID}`;
}

function replaceTitleYears(text) {
  if (!text || typeof text !== 'string') return text;
  let updated = text;
  updated = updated.replace(/2021\s*2022\s*2023/g, '2021+');
  updated = updated.replace(/2021\s*-\s*2025/g, '2021+');
  updated = updated.replace(/21\s*-\s*22/g, '2021+');
  updated = updated.replace(/21-22/g, '2021+');
  return updated;
}

function replaceBodyYears(text) {
  if (!text || typeof text !== 'string') return text;
  let updated = text;
  updated = updated.replace(/2021\s*2022\s*2023/g, '2021-2026');
  updated = updated.replace(/2021\s*-\s*2025/g, '2021-2026');
  updated = updated.replace(/21\s*-\s*22/g, '2021-2026');
  updated = updated.replace(/21-22/g, '2021-2026');
  return updated;
}

function transformArray(values, replacer) {
  if (!Array.isArray(values)) return null;
  let changed = false;
  const next = [];
  for (const entry of values) {
    if (!entry || typeof entry.value !== 'string') {
      next.push(entry);
      continue;
    }
    const value = replacer(entry.value);
    if (value !== entry.value) changed = true;
    next.push({ ...entry, value });
  }
  return changed ? next : null;
}

function getTextArray(attrs, key) {
  return Array.isArray(attrs[key]) ? attrs[key].map((entry) => entry && entry.value).filter(Boolean) : [];
}

function buildPatches(attrs) {
  const patches = [];

  const itemName = transformArray(attrs.item_name, replaceTitleYears);
  if (itemName) {
    patches.push({ op: 'replace', path: '/attributes/item_name', value: itemName });
  }

  const description = transformArray(attrs.product_description, replaceBodyYears);
  if (description) {
    patches.push({ op: 'replace', path: '/attributes/product_description', value: description });
  }

  const bullets = transformArray(attrs.bullet_point, replaceBodyYears);
  if (bullets && bullets.length > 0) {
    patches.push({ op: 'replace', path: '/attributes/bullet_point', value: bullets });
  }

  return patches;
}

function summarize(attrs) {
  return {
    title: getTextArray(attrs, 'item_name')[0] || '',
    description: getTextArray(attrs, 'product_description')[0] || '',
    bullets: getTextArray(attrs, 'bullet_point'),
  };
}

function appendLog(lines) {
  fs.appendFileSync(LOG_PATH, `${lines.join('\n')}\n`, 'utf8');
}

async function fetchWithRetry(sku) {
  const res = await apiGet(listingPath(sku));
  if (res.status !== 429) return res;
  await sleep(5000);
  return apiGet(listingPath(sku));
}

async function patchWithRetry(sku, body) {
  const res = await apiPatch(patchPath(sku), body);
  if (res.status !== 429) return res;
  await sleep(5000);
  return apiPatch(patchPath(sku), body);
}

async function run() {
  await refreshToken();

  const startedAt = new Date().toISOString();
  const logLines = [
    '',
    '## Amazon Bronco Year Updates — Retry with Correct SKUs',
    `- Run started: ${startedAt}`,
  ];

  let attempted = 0;
  let patched = 0;
  let skipped = 0;
  let failed = 0;

  for (const target of TARGETS) {
    attempted += 1;
    logLines.push(`- ASIN ${target.asin} / SKU ${target.sku}: ${target.note}`);

    const getRes = await fetchWithRetry(target.sku);
    if (getRes.status !== 200) {
      failed += 1;
      logLines.push(`  - GET failed: ${getRes.status} ${JSON.stringify(getRes.body)}`);
      await sleep(400);
      continue;
    }

    const attrs = getRes.body.attributes || {};
    const before = summarize(attrs);
    const patches = buildPatches(attrs);

    logLines.push(`  - Current title: ${before.title || '[missing]'}`);
    if (before.description) {
      logLines.push(`  - Current description: ${before.description}`);
    }
    if (before.bullets.length > 0) {
      logLines.push(`  - Current bullets: ${before.bullets.join(' | ')}`);
    }

    if (patches.length === 0) {
      skipped += 1;
      logLines.push('  - No year-range changes needed; skipped');
      await sleep(400);
      continue;
    }

    const patchBody = {
      productType: getRes.body.productType,
      patches,
    };

    let patchRes = await patchWithRetry(target.sku, patchBody);
    if ((patchRes.status < 200 || patchRes.status >= 300) && patches.length > 1) {
      const titleOnlyBody = {
        productType: getRes.body.productType,
        patches: patches.filter((patch) => patch.path === '/attributes/item_name'),
      };
      if (titleOnlyBody.patches.length === 1) {
        logLines.push('  - Full PATCH rejected; retrying title-only patch');
        patchRes = await patchWithRetry(target.sku, titleOnlyBody);
      }
    }

    if (patchRes.status < 200 || patchRes.status >= 300) {
      failed += 1;
      logLines.push(`  - PATCH failed: ${patchRes.status} ${JSON.stringify(patchRes.body)}`);
      await sleep(400);
      continue;
    }

    patched += 1;
    logLines.push(`  - PATCH accepted: ${patchRes.status} ${JSON.stringify(patchRes.body)}`);
    await sleep(700);
  }

  logLines.push(`- Summary: attempted ${attempted}, patched ${patched}, skipped ${skipped}, failed ${failed}`);
  appendLog(logLines);
  console.log(JSON.stringify({ attempted, patched, skipped, failed }, null, 2));
}

run().catch((error) => {
  fs.appendFileSync(LOG_PATH, `\n## Amazon Bronco Year Updates — Retry with Correct SKUs\n- Fatal error: ${error.stack || error.message}\n`, 'utf8');
  console.error(error);
  process.exit(1);
});
