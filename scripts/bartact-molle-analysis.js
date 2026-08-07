const fs = require('fs');

const SHOPIFY_TOKEN = 'REDACTED_SHOPIFY_TOKEN';

async function run() {
  // Find orders containing MOLLE products in last 30 days
  const r = await fetch('https://bartact.myshopify.com/admin/api/2024-01/orders.json?status=any&limit=250&created_at_min=2026-06-24T07:00:00Z&fields=id,created_at,total_price,source_name,landing_site,referring_site,note_attributes,line_items', {
    headers: {'X-Shopify-Access-Token': SHOPIFY_TOKEN}
  });
  const d = await r.json();
  const orders = d.orders || [];

  const molleOrders = orders.filter(o =>
    o.line_items.some(li =>
      li.title && (
        li.title.toLowerCase().includes('molle') ||
        li.title.toLowerCase().includes('pals') ||
        li.title.toLowerCase().includes('buckle') ||
        li.title.toLowerCase().includes('versa') ||
        li.title.toLowerCase().includes('side release')
      )
    )
  );

  process.stdout.write('=== MOLLE/BUCKLE ORDERS — LAST 30 DAYS ===\n');
  process.stdout.write('Total orders scanned: '+orders.length+'\n');
  process.stdout.write('MOLLE-related orders: '+molleOrders.length+'\n\n');

  let totalMolleRevenue = 0;
  const sources = {};
  const products = {};

  molleOrders.forEach(o => {
    const price = parseFloat(o.total_price || 0);
    totalMolleRevenue += price;

    // Source attribution
    const attrs = o.note_attributes || [];
    const hasGclid = attrs.some(a => a.name === 'gclid' && a.value) || (o.landing_site||'').includes('gclid=');
    const landing = o.landing_site || '';
    const ref = o.referring_site || '';

    let source = 'Direct/Unknown';
    if (hasGclid) source = 'Google Ads';
    else if (ref.includes('google')) source = 'Google Organic';
    else if (ref.includes('bing') || ref.includes('microsoft')) source = 'Bing';
    else if (ref.includes('facebook') || ref.includes('instagram')) source = 'Social';
    else if (o.source_name === 'web') source = 'Direct';
    else if (ref) source = ref.replace(/https?:\/\/(www\.)?/,'').split('/')[0];

    sources[source] = (sources[source] || 0) + 1;

    // Which MOLLE products
    o.line_items.filter(li => li.title && (
      li.title.toLowerCase().includes('molle') ||
      li.title.toLowerCase().includes('pals') ||
      li.title.toLowerCase().includes('buckle') ||
      li.title.toLowerCase().includes('versa') ||
      li.title.toLowerCase().includes('side release')
    )).forEach(li => {
      products[li.title] = (products[li.title] || 0) + (li.quantity || 1);
    });

    // Log each order
    process.stdout.write('Order '+o.id+' | $'+price+' | '+source+' | '+new Date(o.created_at).toLocaleDateString()+'\n');
    process.stdout.write('  Landing: '+(landing||'none')+'\n');
    o.line_items.filter(li => li.title && li.title.toLowerCase().includes('molle') || (li.title||'').toLowerCase().includes('buckle')).forEach(li => {
      process.stdout.write('  - '+li.title+' x'+li.quantity+' @ $'+li.price+'\n');
    });
  });

  process.stdout.write('\n=== SOURCES ===\n');
  Object.entries(sources).sort((a,b)=>b[1]-a[1]).forEach(([s,n]) => process.stdout.write(s+': '+n+' orders\n'));

  process.stdout.write('\n=== TOP MOLLE PRODUCTS ===\n');
  Object.entries(products).sort((a,b)=>b[1]-a[1]).forEach(([p,n]) => process.stdout.write(n+'x '+p+'\n'));

  process.stdout.write('\nTotal MOLLE order revenue (30 days): $'+totalMolleRevenue.toFixed(2)+'\n');
}

run().catch(e => process.stdout.write('ERROR: '+e.message+'\n'));
