const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const SHOP = 'bartact.myshopify.com';
const TOKEN = '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';
const headers = { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' };

const fixes = [
  { handle: 'jeep-gladiator-accessories-2019',
    oldText: 'Jeep® Gladiator Accessories 2019+',
    newH1: 'Jeep® Gladiator Seat Covers &amp; Accessories 2019+' },
  { handle: 'jeep-wrangler-jk-jku-2007-18-accessories',
    oldText: 'Jeep® Wrangler JK / JKU 2007-18 Accessories by Bartact®',
    newH1: 'Jeep® Wrangler JK &amp; JKU Seat Covers &amp; Accessories 2007-2018 | Bartact®' },
  { handle: 'jeep-wrangler-tj-1997-02-accessories',
    oldText: 'Jeep® Wrangler TJ 1997-02 Accessories',
    newH1: 'Jeep® Wrangler TJ Seat Covers &amp; Accessories 1997-2002' },
  { handle: 'jeep-wrangler-tj-lj-2003-06-accessories',
    oldText: 'Jeep® Wrangler TJ &amp; LJ 2003-06 Accessories',
    newH1: 'Jeep® Wrangler TJ &amp; LJ Seat Covers &amp; Accessories 2003-2006' },
  { handle: '2013-18-jeep-wrangler-jk-jku',
    oldText: 'Jeepr Wrangler Seat Covers',
    newH1: 'Jeep® Wrangler JK &amp; JKU Seat Covers &amp; Accessories 2013-2018 | Bartact®' },
  { handle: 'jeep-wrangler-jl-jlu-accessories-2018',
    oldText: null,
    newH1: 'Jeep® Wrangler JL &amp; JLU Seat Covers &amp; Accessories 2018+ | Bartact®' },
  { handle: '2007-10-jeep-wrangler-jk-jku-accessories',
    oldText: null,
    newH1: 'Jeep® Wrangler JK &amp; JKU Seat Covers &amp; Accessories 2007-2010 | Bartact®' },
  { handle: '2011-12-jeep-wrangler-jk-jku',
    oldText: null,
    newH1: 'Jeep® Wrangler JK &amp; JKU Seat Covers &amp; Accessories 2011-2012 | Bartact®' },
];

async function main() {
  for (const fix of fixes) {
    const r = await fetch('https://' + SHOP + '/admin/api/2024-01/smart_collections.json?handle=' + fix.handle + '&fields=id,title,body_html', { headers });
    const d = await r.json();
    const col = (d.smart_collections || [])[0];
    if (!col) { console.log('NOT FOUND:', fix.handle); continue; }

    let body = col.body_html || '';
    let updated = false;

    if (fix.oldText && body.includes(fix.oldText)) {
      // Replace old heading text wherever it appears in a tag
      body = body.replace(fix.oldText, fix.newH1);
      updated = true;
    } else if (!/<h1/i.test(body)) {
      // No H1 at all — prepend one
      body = '<h1>' + fix.newH1 + '</h1>\n' + body;
      updated = true;
    } else {
      // Has H1 already — replace its content
      body = body.replace(/<h1[^>]*>.*?<\/h1>/i, '<h1>' + fix.newH1 + '</h1>');
      updated = true;
    }

    const r2 = await fetch('https://' + SHOP + '/admin/api/2024-01/smart_collections/' + col.id + '.json', {
      method: 'PUT', headers,
      body: JSON.stringify({ smart_collection: { id: col.id, body_html: body } })
    });
    const d2 = await r2.json();
    const preview = (d2.smart_collection ? d2.smart_collection.body_html : '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 90);
    console.log('OK ' + fix.handle.substring(0, 45).padEnd(45) + ' | ' + preview);
  }
  console.log('Done.');
}
main().catch(console.error);
