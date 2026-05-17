const https = require('https');
const fs = require('fs');

const CREDS = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.amazon-bartact-credentials.json', 'utf8'));
const SELLER_ID = CREDS.seller_id;
const MARKETPLACE_ID = CREDS.marketplace_id;
const API_HOST = 'sellingpartnerapi-na.amazon.com';
const LOG_PATH = '/home/ubuntu/.openclaw/workspace/memory/2026-04-24.md';

let accessToken = null;

function httpRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, headers: res.headers, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function refreshToken() {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: CREDS.refresh_token,
    client_id: CREDS.client_id,
    client_secret: CREDS.client_secret,
  }).toString();
  const res = await httpRequest({
    hostname: 'api.amazon.com', path: '/auth/o2/token', method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
  }, body);
  if (res.status !== 200) throw new Error(`Token refresh failed: ${res.status} ${JSON.stringify(res.body)}`);
  accessToken = res.body.access_token;
}

function apiGet(path) {
  return httpRequest({ hostname: API_HOST, path, method: 'GET', headers: { 'x-amz-access-token': accessToken, 'Content-Type': 'application/json' } });
}
function apiPatch(path, body) {
  const bodyStr = JSON.stringify(body);
  return httpRequest({
    hostname: API_HOST, path, method: 'PATCH',
    headers: { 'x-amz-access-token': accessToken, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr) },
  }, bodyStr);
}
function listingPath(sku) {
  const encoded = encodeURIComponent(sku);
  return `/listings/2021-08-01/items/${SELLER_ID}/${encoded}?marketplaceIds=${MARKETPLACE_ID}&includedData=attributes,summaries,issues`;
}
function patchPath(sku) {
  const encoded = encodeURIComponent(sku);
  return `/listings/2021-08-01/items/${SELLER_ID}/${encoded}?marketplaceIds=${MARKETPLACE_ID}`;
}

function getTextArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(x => (x && typeof x.value === 'string') ? x.value : '').filter(Boolean);
}
function makeTextArray(values) {
  return values.map(v => ({ language_tag: 'en_US', value: v, marketplace_id: MARKETPLACE_ID }));
}
function replaceAll(s, pairs) {
  let out = s;
  for (const [from, to] of pairs) out = out.split(from).join(to);
  return out;
}

const targets = [
  {
    asin: 'B0GS2G761B', sku: '32924355592235', label: 'Wrangler JLU rear bench seat covers',
    replacements: [['2018-2025', '2018+']],
    descReplacements: [['2018-2025', '2018+']],
    bulletReplacements: [['2018-2025', '2018+']],
  },
  {
    asin: 'B0GRGXMH6J', skuCandidates: ['B0GRGXMH6J', 'JL2DSUNSHADE', 'JL2DSSHADES', 'JLSUNSHADE2D', 'JL2DSHADE'], label: 'Wrangler JL 2-door sun shade',
    replacements: [['2018-2025', '2018+']], descReplacements: [['2018-2025', '2018+']], bulletReplacements: [['2018-2025', '2018+']],
  },
  {
    asin: 'B0845ZKPMH', sku: 'JLVM2018', label: 'Wrangler visor covers',
    replacements: [['2018-2020', '2018+']], descReplacements: [['2018-2020', '2018+']], bulletReplacements: [['2018-2020', '2018+']],
  },
  {
    asin: 'B07MVPR33F', sku: 'JLRSCB-B', label: 'Wrangler rear storage compartment',
    replacements: [['2018-2019', '2018+']], descReplacements: [['2018-2019', '2018+']], bulletReplacements: [['2018-2019', '2018+']],
  },
  {
    asin: 'B096KZDWCM', sku: 'TAOGHUPBB', label: 'Grab handles multi-Jeep/Gladiator',
    replacements: [['1955-2023', '1955+'], ['1955–2023', '1955+'], ['1955�2023', '1955+']],
    descReplacements: [['1955-2023', '1955+'], ['1955–2023', '1955+'], ['1955�2023', '1955+']],
    bulletReplacements: [['1955-2023', '1955+'], ['1955–2023', '1955+'], ['1955�2023', '1955+']],
  },
  {
    asin: 'B09LHXXZL2', sku: 'DLSP2BR', label: 'Door limiting straps',
    replacements: [['1987-2021', '1987+']], descReplacements: [['1987-2021', '1987+']], bulletReplacements: [['1987-2021', '1987+']],
  },
  {
    asin: 'B0845P53LT', sku: 'JLIA2018CC', label: 'Gladiator padded center console',
    replacements: [['2019-20', '2019+']], descReplacements: [['2019-20', '2019+']], bulletReplacements: [['2019-20', '2019+']],
  },
  {
    asin: 'B0GS2TDXDV', sku: '3511255793687', label: 'Tacoma double cab seat covers',
    replacements: [['2016-23', '2016-2024']], descReplacements: [['2016-23', '2016-2024']], bulletReplacements: [['2016-23', '2016-2024']],
  },
  {
    asin: 'B0GS2H3VPY', sku: '40517132648491', label: 'Tacoma front tactical seat covers TRD/non-TRD',
    replacements: [['2016-19', '2016-2024']], descReplacements: [['2016-19', '2016-2024']], bulletReplacements: [['2016-19', '2016-2024']],
    conditionalTacomaCheck: true,
  },
];

async function getListingWithCandidates(target) {
  const candidates = [];
  if (target.sku) candidates.push(target.sku);
  if (target.skuCandidates) candidates.push(...target.skuCandidates);
  const tried = [];
  for (const sku of candidates) {
    const res = await apiGet(listingPath(sku));
    tried.push({ sku, status: res.status });
    if (res.status === 200) return { sku, res, tried };
    if (res.status === 429) {
      await sleep(5000);
      const retry = await apiGet(listingPath(sku));
      tried.push({ sku: sku + ' (retry)', status: retry.status });
      if (retry.status === 200) return { sku, res: retry, tried };
    }
  }
  return { sku: null, res: null, tried };
}

function shouldUpdateTacoma(attrs) {
  const texts = [
    ...getTextArray(attrs.item_name),
    ...getTextArray(attrs.product_description),
    ...getTextArray(attrs.bullet_point),
    ...getTextArray(attrs.bullet_points),
  ].join('\n').toLowerCase();
  return texts.includes('2024') || texts.includes('2020') || texts.includes('2021') || texts.includes('2022') || texts.includes('2023') || texts.includes('3rd gen') || texts.includes('third gen');
}

(async () => {
  await refreshToken();
  const lines = [];
  lines.push('\n## Amazon Year Range Updates — Non-Bronco Vehicles');
  lines.push(`- Run started: ${new Date().toISOString()}`);

  for (const t of targets) {
    lines.push(`- ASIN ${t.asin}${t.sku ? ` / SKU ${t.sku}` : ''}: ${t.label}`);
    try {
      const got = await getListingWithCandidates(t);
      if (!got.res) {
        lines.push(`  - GET failed for all SKU candidates: ${JSON.stringify(got.tried)}`);
        continue;
      }
      const sku = got.sku;
      const body = got.res.body || {};
      const attrs = body.attributes || {};
      const itemName = getTextArray(attrs.item_name);
      const bullets = getTextArray(attrs.bullet_point).length ? getTextArray(attrs.bullet_point) : getTextArray(attrs.bullet_points);
      const desc = getTextArray(attrs.product_description);
      lines.push(`  - Resolved SKU: ${sku}`);
      if (got.tried.length > 1 || (!t.sku && t.skuCandidates)) lines.push(`  - SKU attempts: ${JSON.stringify(got.tried)}`);
      lines.push(`  - Current title: ${itemName[0] || '(none)'}`);

      if (t.conditionalTacomaCheck) {
        const ok = shouldUpdateTacoma(attrs);
        lines.push(`  - Tacoma fitment check: ${ok ? 'listing copy suggests broader fit / safe to extend to 2016-2024' : 'listing appears 2016-2019-specific; left unchanged'}`);
        if (!ok) continue;
      }

      const newTitle = itemName.map(v => replaceAll(v, t.replacements || []));
      const newDesc = desc.map(v => replaceAll(v, t.descReplacements || []));
      const newBullets = bullets.map(v => replaceAll(v, t.bulletReplacements || []));

      const patches = [];
      if (JSON.stringify(newTitle) !== JSON.stringify(itemName) && newTitle.length) {
        patches.push({ op: 'replace', path: '/attributes/item_name', value: makeTextArray(newTitle) });
      }
      if (JSON.stringify(newDesc) !== JSON.stringify(desc) && newDesc.length) {
        patches.push({ op: 'replace', path: '/attributes/product_description', value: makeTextArray(newDesc) });
      }
      if (JSON.stringify(newBullets) !== JSON.stringify(bullets) && newBullets.length) {
        patches.push({ op: 'replace', path: '/attributes/bullet_point', value: makeTextArray(newBullets) });
      }

      if (!patches.length) {
        lines.push('  - No matching year-range text found in fetched title/description/bullets; no PATCH sent');
        await sleep(600);
        continue;
      }

      const patchBody = { productType: body.productType || 'AUTO_ACCESSORY', patches };
      const patchRes = await apiPatch(patchPath(sku), patchBody);
      lines.push(`  - PATCH status: ${patchRes.status}`);
      if (patchRes.status >= 200 && patchRes.status < 300) {
        lines.push(`  - Updated fields: ${patches.map(p => p.path).join(', ')}`);
        lines.push(`  - New title: ${newTitle[0] || '(unchanged)'}`);
      } else {
        lines.push(`  - PATCH response: ${JSON.stringify(patchRes.body).slice(0, 700)}`);
      }
      await sleep(800);
    } catch (err) {
      lines.push(`  - Error: ${err.message}`);
    }
  }

  fs.appendFileSync(LOG_PATH, lines.join('\n') + '\n');
  console.log(lines.join('\n'));
})();
