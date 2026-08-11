const TOKEN = process.env.SHOPIFY_TOKEN_BARTACT;
const SHOP = 'bartact.myshopify.com';

function wordCount(html) {
  if (!html) return 0;
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(w => w.length > 0).length;
}

async function fetchAllProducts() {
  const products = [];
  let url = `https://${SHOP}/admin/api/2024-01/products.json?status=active&limit=250&fields=id,title,handle,body_html,product_type,tags,variants`;
  
  while (url) {
    const res = await fetch(url, { headers: { 'X-Shopify-Access-Token': TOKEN } });
    const linkHeader = res.headers.get('link') || '';
    const data = await res.json();
    products.push(...(data.products || []));
    
    const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    url = nextMatch ? nextMatch[1] : null;
  }
  return products;
}

async function main() {
  const products = await fetchAllProducts();
  console.log(`Total active products fetched: ${products.length}`);
  
  const results = products.map(p => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    type: p.product_type,
    wc: wordCount(p.body_html),
    url: `https://www.bartact.com/products/${p.handle}`
  })).sort((a, b) => a.wc - b.wc);
  
  const empty = results.filter(p => p.wc < 50);
  const thin = results.filter(p => p.wc >= 50 && p.wc < 300);
  const ok = results.filter(p => p.wc >= 300);
  
  console.log(`\nEmpty (<50w): ${empty.length}`);
  console.log(`Thin (50-299w): ${thin.length}`);
  console.log(`OK (300w+): ${ok.length}`);
  
  console.log('\n--- EMPTY/NEAR-EMPTY PRODUCTS ---');
  empty.forEach(p => console.log(`  [${p.wc}w] ${p.title} (${p.handle})`));
  
  console.log('\n--- THIN PRODUCTS (50-299w) — sample bottom 30 ---');
  thin.slice(0, 30).forEach(p => console.log(`  [${p.wc}w] ${p.title} (${p.handle})`));
  
  console.log('\n--- PRODUCT TYPE BREAKDOWN (thin only) ---');
  const typeMap = {};
  [...empty, ...thin].forEach(p => {
    typeMap[p.type || 'untyped'] = (typeMap[p.type || 'untyped'] || 0) + 1;
  });
  Object.entries(typeMap).sort((a,b) => b[1]-a[1]).forEach(([t, c]) => console.log(`  ${t}: ${c}`));
}

main().catch(console.error);
