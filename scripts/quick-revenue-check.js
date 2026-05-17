const https = require('https');
const fs = require('fs');
const creds = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/memory/credentials.md', 'utf8').match(/```json\n([\s\S]+?)```/)?.[1] || '{}');

// Find Shopify tokens
const stores = {};
const credsRaw = fs.readFileSync('/home/ubuntu/.openclaw/workspace/memory/credentials.md', 'utf8');

function extractToken(store) {
  const re = new RegExp(`${store}[\\s\\S]*?shpat_[a-f0-9]+`, 'i');
  const m = credsRaw.match(re);
  return m ? m[0].match(/shpat_[a-f0-9]+/)[0] : null;
}

function extractDomain(store) {
  const re = new RegExp(`${store}[\\s\\S]*?(${store.toLowerCase().replace(/\s/g,'')}[a-z0-9-]*\\.myshopify\\.com)`, 'i');
  const m = credsRaw.match(re);
  return m ? m[1] : null;
}

function shopifyGet(domain, token, path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: domain,
      path: path,
      method: 'GET',
      headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch(e) { reject(new Error(`Parse error: ${d.slice(0,200)}`)); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function getOrders(domain, token, daysBack) {
  const since = new Date();
  since.setDate(since.getDate() - daysBack);
  const path = `/admin/api/2024-01/orders.json?status=any&created_at_min=${since.toISOString()}&limit=250`;
  const data = await shopifyGet(domain, token, path);
  return data.orders || [];
}

(async () => {
  // Manual store config from credentials
  const storeConfigs = [
    { name: 'Bartact', domain: 'bartact.myshopify.com' },
    { name: 'Bull Strap', domain: 'bull-strap.myshopify.com' },
    { name: 'HSP', domain: 'hsp-inc.myshopify.com' },
    { name: 'Brazen', domain: 'brazen-auto.myshopify.com' },
  ];

  // Extract tokens
  const tokenMap = {};
  const tokenRegex = /### (\w[\w\s]+)\n[^#]*?Token:\s*`(shpat_[a-f0-9]+)`/gi;
  let tm;
  while ((tm = tokenRegex.exec(credsRaw)) !== null) {
    tokenMap[tm[1].trim().toLowerCase()] = tm[2];
  }

  // Fallback: find all shpat tokens
  const allTokens = [...credsRaw.matchAll(/(\w[\w\s]*?)(?:Token|token|ACCESS).*?(shpat_[a-f0-9]+)/g)];
  for (const t of allTokens) {
    const key = t[1].trim().toLowerCase().replace(/[:\s]+$/,'');
    if (!tokenMap[key]) tokenMap[key] = t[2];
  }

  console.log('Found tokens for:', Object.keys(tokenMap).join(', '));

  const results = {};
  for (const store of storeConfigs) {
    const token = tokenMap[store.name.toLowerCase()] || tokenMap[store.name.toLowerCase().replace(/\s/g,'')];
    if (!token) {
      console.log(`No token found for ${store.name}`);
      continue;
    }
    try {
      const orders = await getOrders(store.domain, token, 7);
      const revenue = orders.reduce((s, o) => s + parseFloat(o.total_price || 0), 0);
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
      const yd = yesterday.toISOString().slice(0,10);
      const ydOrders = orders.filter(o => o.created_at.slice(0,10) === yd);
      const ydRevenue = ydOrders.reduce((s, o) => s + parseFloat(o.total_price || 0), 0);
      results[store.name] = { orders7d: orders.length, revenue7d: revenue.toFixed(2), yesterdayOrders: ydOrders.length, yesterdayRevenue: ydRevenue.toFixed(2) };
      console.log(`${store.name}: 7d=${orders.length} orders / $${revenue.toFixed(2)} | yesterday=${ydOrders.length} / $${ydRevenue.toFixed(2)}`);
    } catch(e) {
      console.log(`${store.name}: ERROR ${e.message}`);
    }
  }
  fs.writeFileSync('/tmp/revenue-fresh.json', JSON.stringify(results, null, 2));
})();
