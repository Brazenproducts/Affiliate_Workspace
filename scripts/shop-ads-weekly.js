// Shop Ads Weekly Performance Check
// Looks for orders with source_name=3890849 (Shop app) tagged "Shop Cash offers acquired"
// Week: May 9-15, 2026 (PST ≈ May 9 07:00 UTC to May 16 07:00 UTC)

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');

const SHOP = 'bartact.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;

function shopifyGet(path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: SHOP,
      path: `/admin/api/2024-01/${path}`,
      method: 'GET',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}: ${d.slice(0,200)}`));
        resolve({ data: JSON.parse(d), headers: res.headers });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function fetchOrders(sinceDate) {
  let allOrders = [];
  // Fetch from sinceDate, paginate if needed
  let url = `orders.json?status=any&created_at_min=${sinceDate}&limit=250&fields=id,name,created_at,source_name,tags,total_price,customer,financial_status`;
  while (url) {
    const { data, headers } = await shopifyGet(url);
    const batch = data.orders || [];
    allOrders = allOrders.concat(batch);
    // Handle pagination
    const linkHeader = headers['link'] || '';
    const nextMatch = linkHeader.match(/<[^>]+\/admin\/api\/2024-01\/([^>]+)>;\s*rel="next"/);
    if (nextMatch && batch.length === 250) {
      url = nextMatch[1];
      await new Promise(r => setTimeout(r, 300));
    } else {
      url = null;
    }
  }
  return allOrders;
}

function isShopAdsOrder(order) {
  // Source from Shop channel
  if (order.source_name !== '3890849') return false;
  // Must have Shop Cash tag
  const tags = (order.tags || '').toLowerCase();
  return tags.includes('shop cash offers acquired');
}

function isThisWeek(dateStr) {
  // Week = May 9 2026 00:00 PST to May 16 00:00 PST
  // PST = UTC-7 (DST), so May 9 07:00 UTC to May 16 07:00 UTC
  const d = new Date(dateStr);
  const start = new Date('2026-05-09T07:00:00Z');
  const end   = new Date('2026-05-16T07:00:00Z');
  return d >= start && d < end;
}

function isLifetime(dateStr) {
  // Campaign launched Apr 8 2026
  const d = new Date(dateStr);
  return d >= new Date('2026-04-08T00:00:00Z');
}

async function main() {
  console.log('Fetching Bartact orders since Apr 8...');
  const orders = await fetchOrders('2026-04-08T00:00:00Z');
  console.log(`Total orders fetched: ${orders.length}`);

  const shopAdsOrders = orders.filter(isShopAdsOrder);
  const weekOrders = shopAdsOrders.filter(o => isThisWeek(o.created_at));
  const lifetimeOrders = shopAdsOrders.filter(o => isLifetime(o.created_at));

  // Also: how many orders have source_name=3890849 (even without the Shop Cash tag)?
  const allShopSourceOrders = orders.filter(o => o.source_name === '3890849');
  const weekShopSource = allShopSourceOrders.filter(o => isThisWeek(o.created_at));

  console.log('\n=== THIS WEEK (May 9-15, 2026) ===');
  console.log(`Shop Ads orders (with Shop Cash tag): ${weekOrders.length}`);
  const weekRevenue = weekOrders.reduce((s, o) => s + parseFloat(o.total_price || 0), 0);
  console.log(`Revenue: $${weekRevenue.toFixed(2)}`);
  console.log(`AOV: $${weekOrders.length > 0 ? (weekRevenue / weekOrders.length).toFixed(2) : 'N/A'}`);
  const weekCustomers = new Set(weekOrders.map(o => o.customer?.id).filter(Boolean));
  console.log(`Unique customers: ${weekCustomers.size}`);

  console.log('\n--- Week orders detail ---');
  weekOrders.forEach(o => {
    console.log(`  ${o.name} | ${o.created_at.slice(0,10)} | $${o.total_price} | tags: ${o.tags}`);
  });

  console.log('\n--- All source=3890849 this week (with or without Shop Cash tag) ---');
  weekShopSource.forEach(o => {
    console.log(`  ${o.name} | ${o.created_at.slice(0,10)} | $${o.total_price} | tags: ${o.tags}`);
  });

  console.log('\n=== LIFETIME (since Apr 8) ===');
  console.log(`Shop Ads orders: ${lifetimeOrders.length}`);
  const lifetimeRevenue = lifetimeOrders.reduce((s, o) => s + parseFloat(o.total_price || 0), 0);
  console.log(`Revenue: $${lifetimeRevenue.toFixed(2)}`);
  console.log(`AOV: $${lifetimeOrders.length > 0 ? (lifetimeRevenue / lifetimeOrders.length).toFixed(2) : 'N/A'}`);
  const lifetimeCustomers = new Set(lifetimeOrders.map(o => o.customer?.id).filter(Boolean));
  console.log(`Unique customers: ${lifetimeCustomers.size}`);

  // Check for "Test" campaign orders
  const testOrders = orders.filter(o => {
    const tags = (o.tags || '').toLowerCase();
    return tags.includes('test') && !tags.includes('shop cash offers acquired');
  });
  const testOrdersWeek = testOrders.filter(o => isThisWeek(o.created_at));
  console.log(`\n=== OLD "TEST" CAMPAIGN ===`);
  console.log(`Exclusive Test orders this week (no Shop Cash tag): ${testOrdersWeek.length}`);
  console.log(`Exclusive Test orders lifetime: ${testOrders.length}`);
}

main().catch(console.error);
