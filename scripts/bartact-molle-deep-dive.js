const fs = require('fs');
const SHOPIFY_TOKEN = 'REDACTED_SHOPIFY_TOKEN';

async function run() {
  // Get 60 days of orders to see the trend
  const r = await fetch('https://bartact.myshopify.com/admin/api/2024-01/orders.json?status=any&limit=250&created_at_min=2026-05-25T07:00:00Z&fields=id,created_at,total_price,source_name,landing_site,referring_site,note_attributes,line_items', {
    headers: {'X-Shopify-Access-Token': SHOPIFY_TOKEN}
  });
  const d = await r.json();
  const orders = d.orders || [];

  // Categorize products
  const isFireExt = t => t && (t.toLowerCase().includes('fire extinguisher') || t.toLowerCase().includes('ifak'));
  const isMolleAccessory = t => t && !isFireExt(t) && (
    t.toLowerCase().includes('molle') || t.toLowerCase().includes('pals') ||
    t.toLowerCase().includes('buckle') || t.toLowerCase().includes('versa') ||
    t.toLowerCase().includes('side release') || t.toLowerCase().includes('bull strap') ||
    t.toLowerCase().includes('flashlight holder') || t.toLowerCase().includes('roll bar')
  );

  // Weekly buckets
  const weeks = {};
  const getWeek = date => {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  };

  const fireExtSources = {};
  const molleSources = {};
  const fireExtLandings = [];
  const molleLandings = [];

  orders.forEach(o => {
    const week = getWeek(o.created_at);
    if (!weeks[week]) weeks[week] = {fireExt: 0, fireExtRev: 0, molle: 0, molleRev: 0};

    const attrs = o.note_attributes || [];
    const hasGclid = attrs.some(a => a.name === 'gclid' && a.value) || (o.landing_site||'').includes('gclid=');
    const ref = o.referring_site || '';
    const landing = o.landing_site || '';
    const fbclid = landing.includes('fbclid') || ref.includes('facebook');
    const msclkid = landing.includes('msclkid');

    let source = 'Direct';
    if (hasGclid) source = 'Google Ads';
    else if (landing.includes('srsltid')) source = 'Google Free Listings';
    else if (ref.includes('google')) source = 'Google Organic';
    else if (msclkid || ref.includes('bing') || ref.includes('microsoft')) source = 'Bing';
    else if (fbclid || ref.includes('facebook') || ref.includes('instagram')) source = 'Social/Meta';
    else if (ref.includes('shop.app')) source = 'Shop App';

    o.line_items.forEach(li => {
      const title = li.title || '';
      const rev = parseFloat(li.price) * (li.quantity || 1);

      if (isFireExt(title)) {
        weeks[week].fireExt += li.quantity || 1;
        weeks[week].fireExtRev += rev;
        fireExtSources[source] = (fireExtSources[source] || 0) + 1;
        if (landing) fireExtLandings.push(landing.split('?')[0]);
      } else if (isMolleAccessory(title)) {
        weeks[week].molle += li.quantity || 1;
        weeks[week].molleRev += rev;
        molleSources[source] = (molleSources[source] || 0) + 1;
        if (landing) molleLandings.push(landing.split('?')[0]);
      }
    });
  });

  process.stdout.write('=== WEEKLY TREND — FIRE EXTINGUISHER HOLDERS ===\n');
  Object.entries(weeks).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([w,v]) => {
    if (v.fireExt > 0) process.stdout.write(`Week of ${w}: ${v.fireExt} units | $${v.fireExtRev.toFixed(2)}\n`);
  });

  process.stdout.write('\n=== WEEKLY TREND — MOLLE ACCESSORIES (buckles, pouches, etc) ===\n');
  Object.entries(weeks).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([w,v]) => {
    if (v.molle > 0) process.stdout.write(`Week of ${w}: ${v.molle} units | $${v.molleRev.toFixed(2)}\n`);
  });

  process.stdout.write('\n=== FIRE EXTINGUISHER HOLDER — SOURCE BREAKDOWN ===\n');
  Object.entries(fireExtSources).sort((a,b)=>b[1]-a[1]).forEach(([s,n]) => process.stdout.write(`${s}: ${n} line items\n`));

  process.stdout.write('\n=== MOLLE ACCESSORIES — SOURCE BREAKDOWN ===\n');
  Object.entries(molleSources).sort((a,b)=>b[1]-a[1]).forEach(([s,n]) => process.stdout.write(`${s}: ${n} line items\n`));

  // Top landing pages driving fire ext sales
  const fireExtPageCounts = {};
  fireExtLandings.forEach(l => { fireExtPageCounts[l] = (fireExtPageCounts[l]||0)+1; });
  process.stdout.write('\n=== FIRE EXT — TOP LANDING PAGES ===\n');
  Object.entries(fireExtPageCounts).sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(([p,n]) => process.stdout.write(`${n}x ${p}\n`));

  // Top landing pages driving MOLLE sales
  const mollePageCounts = {};
  molleLandings.forEach(l => { mollePageCounts[l] = (mollePageCounts[l]||0)+1; });
  process.stdout.write('\n=== MOLLE ACCESSORIES — TOP LANDING PAGES ===\n');
  Object.entries(mollePageCounts).sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(([p,n]) => process.stdout.write(`${n}x ${p}\n`));
}

run().catch(e => process.stdout.write('ERROR: '+e.message+'\n'));
