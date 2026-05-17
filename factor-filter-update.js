const https = require('https');

const STORE = 'bb1awe-vp.myshopify.com';
const TOKEN = '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';
const API_VERSION = '2024-01';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: STORE,
      path: `/admin/api/${API_VERSION}${path}`,
      method,
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null, headers: res.headers });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 500)}`));
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Fetch all active products with pagination
async function fetchAllProducts() {
  let products = [];
  let path = '/products.json?limit=250&status=active';
  while (path) {
    console.log(`Fetching: ${path}`);
    const res = await request('GET', path);
    products = products.concat(res.body.products);
    // Parse Link header for next page
    const link = res.headers['link'] || '';
    const next = link.match(/<[^>]*page_info=([^>&]+)[^>]*>;\s*rel="next"/);
    if (next) {
      path = `/products.json?limit=250&page_info=${next[1]}`;
    } else {
      path = null;
    }
    if (path) await sleep(500);
  }
  return products;
}

// Convert a nominal dimension (W or H) to actual with ½ symbols
function convertWH(val) {
  // val is a number; actual = val - 0.5
  const actual = val - 0.5;
  const whole = Math.floor(actual);
  const frac = actual - whole;
  if (Math.abs(frac - 0.5) < 0.01) {
    return whole === 0 ? '½' : `${whole}½`;
  }
  // No fraction
  return `${actual}`;
}

// Convert depth nominal to actual string
function convertDepth(depthStr) {
  const depthMap = {
    '1': '¾',
    '2': '1¾',
    '4': '3¾',
    '5': '4¾',
  };
  // Check direct map first
  if (depthMap[depthStr]) return depthMap[depthStr];

  // Specialty depths
  const lower = depthStr.toLowerCase();
  if (lower === '3ab') return '2¾';
  if (lower === '4.375') return '3⅞';
  if (lower === '5ab') return '4¾';
  if (lower === '5hc') return '4¾';

  // Generic: subtract 0.5
  const num = parseFloat(depthStr);
  if (!isNaN(num)) {
    const actual = num - 0.5;
    const whole = Math.floor(actual);
    const frac = actual - whole;
    if (Math.abs(frac - 0.75) < 0.01) {
      return whole === 0 ? '¾' : `${whole}¾`;
    }
    if (Math.abs(frac - 0.5) < 0.01) {
      return whole === 0 ? '½' : `${whole}½`;
    }
    if (Math.abs(frac - 0.25) < 0.01) {
      return whole === 0 ? '¼' : `${whole}¼`;
    }
    if (Math.abs(frac - 0.875) < 0.01) {
      return whole === 0 ? '⅞' : `${whole}⅞`;
    }
    if (Math.abs(frac - 0.125) < 0.01) {
      return whole === 0 ? '⅛' : `${whole}⅛`;
    }
    if (Math.abs(frac) < 0.01) {
      return `${whole}`;
    }
    return `${actual}`;
  }

  return null; // Can't parse
}

// Parse nominal size from title: e.g. "16X25X2", "10x20x1"
function parseNominalSize(title) {
  // Match patterns like 16X25X2, 10x20x1, 20x25x4.375, 14x25x5AB
  const match = title.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?[a-zA-Z]*)/);
  if (!match) return null;
  return { w: match[1], h: match[2], d: match[3] };
}

async function main() {
  console.log('=== Factor Filter: Adding Actual Dimensions ===\n');

  // Step 1: Fetch all products
  const products = await fetchAllProducts();
  console.log(`\nTotal active products fetched: ${products.length}\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;
  const skippedReasons = [];

  for (const product of products) {
    const { id, title, body_html } = product;

    // Skip if already has actual size
    if (body_html && body_html.toLowerCase().includes('actual size')) {
      console.log(`SKIP (already has actual size): [${id}] ${title}`);
      skipped++;
      skippedReasons.push(`${title} — already has actual size`);
      continue;
    }

    // Parse nominal size from title
    const nominal = parseNominalSize(title);
    if (!nominal) {
      console.log(`SKIP (can't parse size from title): [${id}] ${title}`);
      skipped++;
      skippedReasons.push(`${title} — can't parse nominal size`);
      continue;
    }

    // Convert dimensions
    const wNum = parseFloat(nominal.w);
    const hNum = parseFloat(nominal.h);
    if (isNaN(wNum) || isNaN(hNum)) {
      console.log(`SKIP (can't parse W/H): [${id}] ${title}`);
      skipped++;
      skippedReasons.push(`${title} — can't parse W/H`);
      continue;
    }

    const actualW = convertWH(wNum);
    const actualH = convertWH(hNum);
    const actualD = convertDepth(nominal.d);

    if (!actualD) {
      console.log(`SKIP (can't convert depth "${nominal.d}"): [${id}] ${title}`);
      skipped++;
      skippedReasons.push(`${title} — can't convert depth "${nominal.d}"`);
      continue;
    }

    const actualLine = `<li><strong>Actual size:</strong> ${actualW} x ${actualH} x ${actualD}"</li>`;

    // Find the nominal size line and insert after it
    if (!body_html) {
      console.log(`SKIP (no body_html): [${id}] ${title}`);
      skipped++;
      skippedReasons.push(`${title} — no body_html`);
      continue;
    }

    // Match the nominal size <li> line
    const nominalRegex = /(<li><strong>Nominal size:<\/strong>[^<]*<\/li>)/i;
    const nomMatch = body_html.match(nominalRegex);

    if (!nomMatch) {
      console.log(`SKIP (no "Nominal size" line in body): [${id}] ${title}`);
      skipped++;
      skippedReasons.push(`${title} — no Nominal size line in body`);
      continue;
    }

    // Insert actual size line right after the nominal size line
    const newBody = body_html.replace(nominalRegex, `$1\n${actualLine}`);

    // PUT update - only body_html
    try {
      await request('PUT', `/products/${id}.json`, {
        product: { id, body_html: newBody },
      });
      console.log(`UPDATED: [${id}] ${title} → ${actualW} x ${actualH} x ${actualD}"`);
      updated++;
    } catch (err) {
      console.error(`ERROR updating [${id}] ${title}: ${err.message}`);
      errors++;
    }

    await sleep(500);
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Total products: ${products.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);

  if (skippedReasons.length > 0) {
    console.log('\nSkipped details:');
    skippedReasons.forEach((r) => console.log(`  - ${r}`));
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
