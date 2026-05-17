#!/usr/bin/env node
// Add internal links to Bull Strap blog articles that mention Bartact product categories
// but don't link to any product/collection pages

const https = require('https');
const TOKEN = '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';
const SHOP = 'bull-strap-78.myshopify.com';
const BLOG_ID = 96543015185;

function httpReq(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SHOP, path: '/admin/api/2024-01/' + path,
      method, headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' }
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Map of keywords → product/collection links to inject
const LINK_MAP = [
  {
    keywords: ['limit strap', 'limiting strap', 'bull strap'],
    links: [
      { text: 'Bull Strap limit straps', url: '/products/limit-straps-bullstrap' },
      { text: 'limit strap collection', url: '/collections/limit-straps' }
    ],
    cta: '<p><strong>🔗 Shop Bull Strap Limit Straps:</strong> <a href="/products/limit-straps-bullstrap">Proudly Made in USA with 4130 Chromoly heat-treated end pieces</a>. Available in multiple lengths and configurations.</p>'
  },
  {
    keywords: ['seat cover', 'seat covers'],
    links: [
      { text: 'Bartact tactical seat covers', url: '/collections/jeep-wrangler-seat-covers-1' },
    ],
    cta: '<p><strong>🔗 Shop Bartact Seat Covers:</strong> <a href="/collections/jeep-wrangler-seat-covers-1">Custom-fit tactical seat covers</a> made in Temecula, CA. UV-protected polyester with 1000D Cordura reinforcement. SRS airbag compatible.</p>'
  },
  {
    keywords: ['grab handle', 'paracord'],
    links: [
      { text: 'Bartact paracord grab handles', url: '/collections/grab-handles' },
    ],
    cta: '<p><strong>🔗 Shop Bartact Grab Handles:</strong> <a href="/collections/grab-handles">The original paracord grab handles</a> — handmade in USA. Fits Jeep Wrangler, Gladiator, Ford Bronco, and UTVs.</p>'
  },
  {
    keywords: ['door bag', 'door storage'],
    links: [
      { text: 'Bartact door storage bags', url: '/products/bronco-accessories-door-bags-for-ford-bronco-2021-2022-2023-full-size-front-door-interior-storage-bartact-pat-pending' },
    ],
    cta: '<p><strong>🔗 Shop Bartact Door Bags:</strong> <a href="/products/bronco-accessories-door-bags-for-ford-bronco-2021-2022-2023-full-size-front-door-interior-storage-bartact-pat-pending">Patent pending door storage bags</a> with interior MOLLE panels. Made in USA.</p>'
  },
  {
    keywords: ['molle', 'pals'],
    links: [
      { text: 'MOLLE accessories by Bartact', url: '/collections/molle-accessories' },
    ],
    cta: '<p><strong>🔗 Shop MOLLE Accessories:</strong> <a href="/collections/molle-accessories">Visor covers, headrest panels, seat back organizers</a> and more — all PALS/MOLLE compatible by Bartact.</p>'
  },
  {
    keywords: ['fire extinguisher'],
    links: [
      { text: 'fire extinguisher mounts', url: '/collections/fire-extinguisher-mounts' },
    ],
    cta: '<p><strong>🔗 Shop Fire Extinguisher Mounts:</strong> <a href="/collections/fire-extinguisher-mounts">Roll bar fire extinguisher holders</a> with PALS/MOLLE compatibility. Element E50 & E100 combo kits available.</p>'
  },
  {
    keywords: ['recovery', 'recovery strap', 'recovery gear'],
    links: [
      { text: 'Bull Strap recovery gear', url: '/collections/recovery-gear' },
    ],
    cta: '<p><strong>🔗 Shop Recovery Gear:</strong> <a href="/collections/recovery-gear">Heavy duty recovery straps, D-ring shackles, and tie downs</a> by Bull Strap. Made in USA.</p>'
  },
  {
    keywords: ['tie down', 'ratchet strap'],
    links: [
      { text: 'Bull Strap tie downs', url: '/collections/tie-downs' },
    ],
    cta: '<p><strong>🔗 Shop Tie Downs:</strong> <a href="/collections/tie-downs">Heavy duty ratchet tie down straps</a> with twist snap hooks. 10,000 LB rated. By Bull Strap.</p>'
  },
  {
    keywords: ['roll bar', 'roll cage'],
    links: [
      { text: 'roll bar covers and accessories', url: '/collections/roll-bar-accessories' },
    ],
    cta: '<p><strong>🔗 Shop Roll Bar Accessories:</strong> <a href="/collections/roll-bar-accessories">Roll bar covers, MOLLE sleeves, and barrel bags</a> by Bartact. Full sets and individual pieces available.</p>'
  },
  {
    keywords: ['lift kit', 'suspension'],
    links: [
      { text: 'suspension limit straps', url: '/products/limit-straps-bullstrap' },
    ],
    cta: '<p><strong>🔗 Don\'t forget limit straps for your lift:</strong> <a href="/products/limit-straps-bullstrap">Bull Strap limit straps</a> prevent over-extension damage. Made in USA with 4130 Chromoly. Essential for any lift kit build.</p>'
  },
  {
    keywords: ['bronco'],
    links: [
      { text: 'Ford Bronco accessories', url: '/collections/ford-bronco-accessories' },
    ],
    cta: '<p><strong>🔗 Shop Ford Bronco Accessories:</strong> <a href="/collections/ford-bronco-accessories">Seat covers, door bags, grab handles, visor covers</a> and more for 2021+ Ford Bronco. All made in USA by Bartact.</p>'
  },
  {
    keywords: ['wrangler', 'gladiator', 'jeep'],
    links: [
      { text: 'Jeep Wrangler accessories', url: '/collections/jeep-wrangler-seat-covers-1' },
    ],
    cta: '<p><strong>🔗 Shop Jeep Accessories:</strong> <a href="/collections/jeep-wrangler-seat-covers-1">Tactical seat covers, grab handles, MOLLE panels, door bags</a> and more for Jeep Wrangler & Gladiator. Made in USA by Bartact.</p>'
  },
];

async function main() {
  // Get all articles
  let articles = [];
  let sinceId = 0;
  while (true) {
    const resp = await httpReq('GET', 'blogs/' + BLOG_ID + '/articles.json?limit=250&since_id=' + sinceId + '&fields=id,title,handle,body_html');
    const data = JSON.parse(resp.body);
    if (!data.articles || data.articles.length === 0) break;
    articles.push(...data.articles);
    sinceId = data.articles[data.articles.length - 1].id;
    if (data.articles.length < 250) break;
  }
  console.log('Total articles:', articles.length);

  let updated = 0;
  for (const article of articles) {
    const body = article.body_html || '';
    const bodyLower = body.toLowerCase();
    const titleLower = article.title.toLowerCase();

    // Skip if already has internal product/collection links
    if (body.includes('/products/') || body.includes('/collections/')) continue;

    // Find matching link categories
    const matchedCTAs = [];
    const usedUrls = new Set();
    for (const mapping of LINK_MAP) {
      const hasKeyword = mapping.keywords.some(k => titleLower.includes(k) || bodyLower.includes(k));
      if (hasKeyword) {
        // Only add if we haven't used this URL yet
        const ctaUrl = mapping.cta.match(/href="([^"]+)"/)?.[1];
        if (ctaUrl && !usedUrls.has(ctaUrl)) {
          matchedCTAs.push(mapping.cta);
          usedUrls.add(ctaUrl);
        }
      }
    }

    if (matchedCTAs.length === 0) continue;

    // Limit to max 3 CTAs per article
    const ctasToAdd = matchedCTAs.slice(0, 3);
    
    // Add CTAs before the last paragraph or at the end
    const divider = '<hr><h3>Related Products from Bull Strap</h3>';
    const newBody = body + '\n' + divider + '\n' + ctasToAdd.join('\n');

    // Update the article
    const updateResp = await httpReq('PUT', 'blogs/' + BLOG_ID + '/articles/' + article.id + '.json', {
      article: { id: article.id, body_html: newBody }
    });

    if (updateResp.status === 200) {
      console.log('✅ Updated: ' + article.title.substring(0, 60) + ' (+' + ctasToAdd.length + ' links)');
      updated++;
    } else {
      console.log('❌ Failed: ' + article.title.substring(0, 60) + ' → ' + updateResp.status);
    }

    await sleep(600); // Rate limit
  }

  console.log('\n=== DONE ===');
  console.log('Articles updated with internal links:', updated);
}

main().catch(e => console.error('Error:', e.message));
