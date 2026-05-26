require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const https = require('https');

const DOMAIN = 'bull-strap-78.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN_BULLSTRAP;
const BLOG_ID = 96543015185;
const LIMIT_STRAP_URL = '/products/limit-straps-bullstrap';

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

// High-value articles to add limit strap links to (most relevant to limit straps / suspension)
const TARGET_ARTICLES = [
  { id: 682362700049, anchor: 'limit straps' },           // What Happens When Limit Straps Fail
  { id: 682256695569, anchor: 'limit straps' },           // Limit Straps Explained 2026
  { id: 682214064401, anchor: 'limit straps' },           // Best Limit Straps for Off-Road 2026
  { id: 682273866001, anchor: 'limit straps' },           // Essential Recovery Gear
  { id: 682265674001, anchor: 'limit straps' },           // Locking vs Limited-Slip Differentials
  { id: 682265641233, anchor: 'limit straps' },           // Driveshaft Vibration
  { id: 682256728337, anchor: 'limit straps' },           // Tie-Down Straps 2026
  { id: 682242900241, anchor: 'limit straps' },           // Driveshaft Basics 2026
  { id: 682242408721, anchor: 'limit straps' },           // Steering Upgrades 2026
  { id: 682241130769, anchor: 'limit straps' },           // Off-Road Recovery Gear Guide
  { id: 682237395217, anchor: 'limit straps' },           // Axles and Drivetrain Explained
  { id: 682237264145, anchor: 'limit straps' },           // Control Arms, Ball Joints
  { id: 682219831569, anchor: 'limit straps' },           // Coilovers vs Lift Springs vs Air
  { id: 682214981905, anchor: 'limit straps' },           // Best Winches 2026
  { id: 682214555921, anchor: 'limit straps' },           // Best Lift Kits 2026
  { id: 682214293777, anchor: 'limit straps' },           // Shocks vs Struts
  { id: 682214097169, anchor: 'limit straps' },           // How to Choose Tie Downs
  { id: 682230907153, anchor: 'limit straps' },           // Overlanding Cargo
  { id: 682230841617, anchor: 'limit straps' },           // Rock Rails, Skid Plates
  { id: 682265608465, anchor: 'limit straps' },           // Trailer Hitch Classes
];

const LINK_HTML = `<a href="${LIMIT_STRAP_URL}">Bull Strap limit straps</a>`;
const CTA_BLOCK = `<p><strong>🔗 Looking for limit straps?</strong> Check out our <a href="${LIMIT_STRAP_URL}">Made in USA Bull Strap Limit Straps</a> — heat-treated 4130 Chromoly, quad-wrap 7,000 lb nylon, 39 sizes available.</p>`;

(async () => {
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const target of TARGET_ARTICLES) {
    try {
      const { data } = await shopifyReq('GET', `/admin/api/2024-01/blogs/${BLOG_ID}/articles/${target.id}.json`);
      const article = data?.article;
      if (!article) { console.log(`✗ ${target.id}: not found`); errors++; continue; }

      // Skip if already has link
      if (article.body_html && article.body_html.includes(LIMIT_STRAP_URL)) {
        console.log(`⊘ ${target.id}: already linked — ${article.title.slice(0, 50)}`);
        skipped++;
        continue;
      }

      // Add CTA block before the last </p> or at the end
      let newBody = article.body_html || '';
      // Insert before the last paragraph
      const lastP = newBody.lastIndexOf('</p>');
      if (lastP > 0) {
        newBody = newBody.slice(0, lastP + 4) + '\n' + CTA_BLOCK;
      } else {
        newBody += '\n' + CTA_BLOCK;
      }

      const result = await shopifyReq('PUT', `/admin/api/2024-01/blogs/${BLOG_ID}/articles/${target.id}.json`, {
        article: { id: target.id, body_html: newBody }
      });

      if (result.status === 200) {
        console.log(`✓ ${target.id}: linked — ${article.title.slice(0, 60)}`);
        updated++;
      } else {
        console.log(`✗ ${target.id}: HTTP ${result.status} — ${article.title.slice(0, 50)}`);
        errors++;
      }

      // Rate limit: 2 req/sec
      await new Promise(r => setTimeout(r, 600));
    } catch(e) {
      console.log(`✗ ${target.id}: ERROR ${e.message}`);
      errors++;
    }
  }

  console.log(`\n=== DONE: ${updated} linked, ${skipped} already had link, ${errors} errors ===`);
})();
