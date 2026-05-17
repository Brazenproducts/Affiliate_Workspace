const https = require('https');
const SHOP = 'bb1awe-vp.myshopify.com';
const TOKEN = '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';

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SHOP, path: '/admin/api/2024-01' + path, method,
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' }
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 429) {
          const retry = (parseFloat(res.headers['retry-after']) || 2) * 1000;
          setTimeout(() => api(method, path, body).then(resolve).catch(reject), retry);
          return;
        }
        try { resolve(JSON.parse(d)); } catch(e) { resolve(d); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function actualDim(nom) {
  const half = n => {
    const whole = n - 1;
    return whole + '½';
  };
  const m = nom.match(/^(\d+)X(\d+)X(\d+(?:\.\d+)?)(AB|HC)?$/i);
  if (!m) return null;
  const w = parseInt(m[1]), h = parseInt(m[2]);
  const dRaw = m[3], suffix = m[4] || '';
  const aw = half(w), ah = half(h);
  const dNum = parseFloat(dRaw);
  let ad;
  if (dNum === 1) ad = '¾';
  else if (dNum === 2) ad = '1¾';
  else if (dNum === 3) ad = '2¾';
  else if (dNum === 4) ad = '3¾';
  else if (dNum === 4.375) ad = '3⅞';
  else if (dNum === 5) ad = '4¾';
  else ad = (dNum - 0.25) + '';
  return aw + ' x ' + ah + ' x ' + ad + '"';
}

async function getAllProducts() {
  let all = [], url = '/products.json?limit=250&status=active';
  while (url) {
    const data = await api('GET', url, null);
    all = all.concat(data.products || []);
    url = null; // simple single page for <250
    if ((data.products || []).length === 250) {
      const lastId = data.products[data.products.length - 1].id;
      url = '/products.json?limit=250&status=active&since_id=' + lastId;
    }
  }
  return all;
}

async function run() {
  const products = await getAllProducts();
  console.log('Total active products:', products.length);
  let updated = 0, skipped = 0, noMatch = 0;

  for (const p of products) {
    const sizeMatch = p.title.match(/^(\d+X\d+X\d+(?:\.\d+)?(?:AB|HC)?)\s/i);
    if (!sizeMatch) { noMatch++; continue; }
    const nominal = sizeMatch[1];
    
    if (p.body_html && p.body_html.includes('Actual size:')) {
      skipped++;
      continue;
    }

    const actual = actualDim(nominal);
    if (!actual) { noMatch++; console.log('No mapping for:', nominal); continue; }

    let body = p.body_html || '';
    const nominalLine = body.match(/<li>\s*<strong>Nominal size:<\/strong>[^<]*<\/li>/i);
    if (nominalLine) {
      const insertAfter = nominalLine[0];
      const newLine = '\n  <li><strong>Actual size:</strong> ' + actual + '</li>';
      body = body.replace(insertAfter, insertAfter + newLine);
    } else {
      // No nominal size line found, prepend to specs or append
      const newLine = '<p><strong>Actual size:</strong> ' + actual + '</p>';
      body = body + '\n' + newLine;
    }

    await api('PUT', '/products/' + p.id + '.json', { product: { id: p.id, body_html: body } });
    updated++;
    console.log('Updated:', p.title, '→', actual);
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\nDone! Updated:', updated, '| Skipped (already had):', skipped, '| No size match:', noMatch);
}

run().catch(e => { console.error(e); process.exit(1); });
