require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');

const stores = [
  { name: 'Bartact', domain: 'bartact.myshopify.com', token: process.env.SHOPIFY_TOKEN_BARTACT },
  { name: 'Bull Strap', domain: 'bull-strap-78.myshopify.com', token: process.env.SHOPIFY_TOKEN_BULLSTRAP },
  { name: 'HSP Off Road', domain: 'hsp-off-road.myshopify.com', token: process.env.SHOPIFY_TOKEN_HSP },
  { name: 'Brazen Auto', domain: 'brazen-auto.myshopify.com', token: process.env.SHOPIFY_TOKEN_BRAZEN },
];

function shopifyGet(domain, token, path) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname: domain, path, method: 'GET',
      headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
    }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{ try{resolve(JSON.parse(d))}catch(e){reject(new Error(d.slice(0,200)))} }); });
    req.on('error', reject); req.end();
  });
}

(async () => {
  const now = new Date();
  const d7 = new Date(now); d7.setDate(d7.getDate()-7);
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate()-1);
  const yd = yesterday.toISOString().slice(0,10);

  for (const s of stores) {
    try {
      const path = `/admin/api/2024-01/orders.json?status=any&created_at_min=${d7.toISOString()}&limit=250`;
      const data = await shopifyGet(s.domain, s.token, path);
      const orders = data.orders || [];
      const rev = orders.reduce((sum,o) => sum + parseFloat(o.total_price||0), 0);
      const ydO = orders.filter(o => o.created_at.slice(0,10) === yd);
      const ydR = ydO.reduce((sum,o) => sum + parseFloat(o.total_price||0), 0);
      const avgDaily = rev / 7;
      console.log(`${s.name}: 7d = ${orders.length} orders / $${rev.toFixed(2)} ($${avgDaily.toFixed(0)}/day avg) | Yesterday (${yd}): ${ydO.length} orders / $${ydR.toFixed(2)}`);

      // Top products yesterday
      if (ydO.length > 0) {
        const prods = {};
        for (const o of ydO) for (const li of (o.line_items||[])) {
          prods[li.title] = (prods[li.title]||0) + parseFloat(li.price||0) * li.quantity;
        }
        const top = Object.entries(prods).sort((a,b)=>b[1]-a[1]).slice(0,3);
        for (const [t,v] of top) console.log(`  - ${t}: $${v.toFixed(2)}`);
      }
    } catch(e) { console.log(`${s.name}: ERROR ${e.message.slice(0,100)}`); }
  }
})();
