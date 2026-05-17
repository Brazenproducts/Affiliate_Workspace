#!/usr/bin/env node
// Bartact Discount Code Leak Scanner
// Checks major coupon aggregator sites for leaked Bartact discount codes
// Run weekly via cron — alerts if codes are found

const https = require('https');
const http = require('http');
const fs = require('fs');

const COUPON_SITES = [
  { name: 'RetailMeNot', url: 'https://www.retailmenot.com/view/bartact.com' },
  { name: 'Honey/PayPal', url: 'https://www.joinhoney.com/shop/bartact.com' },
  { name: 'WeThrift', url: 'https://www.wethrift.com/bartact' },
  { name: 'Knoji', url: 'https://www.knoji.com/bartact-com-coupons/' },
  { name: 'CouponFollow', url: 'https://couponfollow.com/site/bartact.com' },
  { name: 'Dealspotr', url: 'https://dealspotr.com/promo-codes/bartact.com' },
  { name: 'GoodShop', url: 'https://www.goodshop.com/coupons/bartact.com' },
  { name: 'CouponCabin', url: 'https://www.couponcabin.com/coupons/bartact/' },
  { name: 'Offers.com', url: 'https://www.offers.com/bartact/' },
  { name: 'SimplyCodes', url: 'https://www.simplycodes.com/store/bartact.com' },
];

// Known codes to watch for (add any new ones here)
const KNOWN_CODES = ['SAVE5', 'WELCOME5', 'SAVE10', 'SAVE15', 'SAVE20', 'BARTACT', 'MILITARY', 'FIRSTRESPONDER', 'VETERAN'];

// Also search Google for "bartact coupon code" / "bartact promo code" / "bartact discount"
const GOOGLE_QUERIES = [
  'bartact coupon code 2026',
  'bartact promo code',
  'bartact discount code',
  'bartact.com coupon',
];

const STATE_FILE = '/home/ubuntu/.openclaw/workspace/memory/coupon-leak-scan.json';

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000,
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function checkSite(site) {
  try {
    const { status, body } = await fetch(site.url);
    const lower = body.toLowerCase();
    
    // Check if page exists and has content about Bartact
    const hasBartact = lower.includes('bartact');
    
    // Look for discount code patterns
    const codePattern = /(?:code|coupon|promo|discount)[:\s]*["']?([A-Z0-9]{3,20})["']?/gi;
    const foundCodes = [];
    let match;
    while ((match = codePattern.exec(body)) !== null) {
      const code = match[1].toUpperCase();
      if (code.length >= 3 && code.length <= 20 && !/^(HTTP|HTML|UTF|CSS|THE|AND|FOR|GET|POST)/.test(code)) {
        foundCodes.push(code);
      }
    }
    
    // Also check for known codes specifically
    const knownFound = KNOWN_CODES.filter(c => lower.includes(c.toLowerCase()));
    
    // Check for percentage off mentions
    const percentPattern = /(\d{1,2})%\s*off/gi;
    const percentOffs = [];
    while ((match = percentPattern.exec(body)) !== null) {
      percentOffs.push(match[0]);
    }
    
    return {
      site: site.name,
      url: site.url,
      status,
      hasBartactPage: hasBartact,
      codesFound: [...new Set([...foundCodes, ...knownFound])],
      percentOffs: [...new Set(percentOffs)],
      blocked: lower.includes('cloudflare') || lower.includes('just a moment') || lower.includes('captcha'),
    };
  } catch (e) {
    return {
      site: site.name,
      url: site.url,
      status: 'error',
      error: e.message,
      hasBartactPage: false,
      codesFound: [],
      percentOffs: [],
      blocked: false,
    };
  }
}

async function main() {
  console.log('=== Bartact Discount Code Leak Scanner ===');
  console.log(`Scan time: ${new Date().toISOString()}\n`);
  
  const results = [];
  let alerts = [];
  
  for (const site of COUPON_SITES) {
    const result = await checkSite(site);
    results.push(result);
    
    if (result.blocked) {
      console.log(`⚠️  ${result.site}: Blocked by Cloudflare/captcha (needs browser check)`);
    } else if (result.hasBartactPage) {
      console.log(`🔍 ${result.site}: Bartact page EXISTS (status ${result.status})`);
      if (result.codesFound.length > 0) {
        console.log(`   🚨 CODES FOUND: ${result.codesFound.join(', ')}`);
        alerts.push(`${result.site}: codes ${result.codesFound.join(', ')} at ${result.url}`);
      }
      if (result.percentOffs.length > 0) {
        console.log(`   💰 Discounts mentioned: ${result.percentOffs.join(', ')}`);
      }
    } else if (result.status === 404) {
      console.log(`✅ ${result.site}: No Bartact page (404)`);
    } else {
      console.log(`ℹ️  ${result.site}: Status ${result.status || result.error}`);
    }
  }
  
  // Save state
  const state = {
    lastScan: new Date().toISOString(),
    results,
    alerts,
    alertCount: alerts.length,
  };
  
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  
  console.log(`\n--- Summary ---`);
  console.log(`Sites checked: ${results.length}`);
  console.log(`Blocked by captcha: ${results.filter(r => r.blocked).length}`);
  console.log(`Bartact pages found: ${results.filter(r => r.hasBartactPage).length}`);
  console.log(`Code leaks detected: ${alerts.length}`);
  
  if (alerts.length > 0) {
    console.log(`\n🚨 ALERT: Leaked codes found!`);
    alerts.forEach(a => console.log(`  - ${a}`));
    console.log(`\nAction: Check these codes in Shopify Discounts. If active, deactivate them.`);
  } else {
    console.log(`\n✅ No leaked codes detected (some sites blocked — browser scan recommended weekly)`);
  }
  
  // Output for cron consumption
  if (alerts.length > 0) {
    console.log(`\nCRON_ALERT: ${alerts.length} leaked Bartact discount codes found on coupon sites. Details in ${STATE_FILE}`);
  }
}

main().catch(e => { console.error('Scanner error:', e); process.exit(1); });
