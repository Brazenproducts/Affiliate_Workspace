const https = require('https');

const DOMAIN = 'bull-strap-78.myshopify.com';
const TOKEN = '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';

function shopifyReq(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: DOMAIN, path, method,
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch(e) { resolve({ status: res.statusCode, raw: d }); } });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  // Find blog posts that should link to limit straps
  const blogs = await shopifyReq('GET', '/admin/api/2024-01/blogs.json');
  console.log('Blogs:', (blogs.data?.blogs || []).map(b => `${b.id}: ${b.title}`).join(', '));

  for (const blog of (blogs.data?.blogs || [])) {
    const articles = await shopifyReq('GET', `/admin/api/2024-01/blogs/${blog.id}/articles.json?limit=250`);
    const arts = articles.data?.articles || [];
    console.log(`\nBlog "${blog.title}" (${blog.id}): ${arts.length} articles`);

    // Find articles mentioning limit straps, suspension, bump stops, etc.
    const relevant = arts.filter(a => {
      const text = (a.title + ' ' + (a.body_html || '')).toLowerCase();
      return text.includes('limit strap') || text.includes('bump stop') || text.includes('suspension travel') ||
             text.includes('suspension upgrade') || text.includes('lift kit') || text.includes('coilover') ||
             text.includes('shock') || text.includes('axle wrap');
    });

    console.log(`  Relevant articles (mention limit straps/suspension): ${relevant.length}`);
    for (const a of relevant) {
      const hasLink = (a.body_html || '').includes('/products/limit-straps-bullstrap');
      console.log(`  ${hasLink ? '✓' : '✗'} ${a.id} | ${a.title.slice(0, 70)} | ${hasLink ? 'ALREADY LINKED' : 'NEEDS LINK'}`);
    }
  }
})();
