#!/usr/bin/env node
// Fix disapproved Google Ads sitelink assets with broken destination URLs
// Maps old 404 URLs → correct live URLs, then removes broken assets

const https = require('https');
const fs = require('fs');
const creds = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json'));

// URL mapping: broken → correct
const URL_FIXES = {
  'https://www.bartact.com/collections/frontpage': 'https://www.bartact.com/collections/all',
  'https://www.bartact.com/collections/frontpage/ppe': null, // PPE collection doesn't exist, remove asset
  'https://www.bartact.com/collections/bags-and-pouches': 'https://www.bartact.com/collections/molle-pouches-molle-accessories-gear-bags-by-bartact',
  'https://www.bartact.com/collections/toyota-tacoma-seat-covers-accessories': 'https://www.bartact.com/collections/toyota-tacoma-seat-covers-accessories-2005-15-2016-2019-2020-2024',
  'https://www.bartact.com/collections/jeep-gladiator-seat-covers-accessories': 'https://www.bartact.com/collections/jeep-gladiator-seat-covers-accessories-2019',
  'https://www.bartact.com/collections/jeep-gladiator-accessories-2019-24': 'https://www.bartact.com/collections/jeep-gladiator-accessories-2019',
  'https://www.bartact.com/collections/molle-buckles': 'https://www.bartact.com/collections/molle-buckles-attachments-accessories',
  // Product URLs - old handles → new handles (year ranges updated)
  'https://www.bartact.com/products/bronco-paracord-grab-handles-custom-for-ford-bronco-full-size-2021-2022-2023-pair-of-2-bartact': 'https://www.bartact.com/products/bronco-paracord-grab-handles-custom-for-ford-bronco-full-size-2021-2022-2023-2024-2025-2026-pair-of-2-bartact',
  'https://www.bartact.com/products/bronco-accessories-door-bags-for-ford-bronco-2021-2022-2023-full-size-front-door-interior-storage-bartact-pat-pending': 'https://www.bartact.com/products/bronco-accessories-door-storage-pocket-bags-for-ford-bronco-2021-full-size-front-door-interior-storage-bartact-pat-pending',
  'https://www.bartact.com/products/bronco-accessories-center-console-bag-for-ford-bronco-2021-2022-2023-passenger-side-lower-area-bartact-pat-pending': 'https://www.bartact.com/products/bronco-accessories-center-console-storage-bag-for-ford-bronco-2021-2022-2023-2024-2025-2026-passenger-side-lower-area-bartact-pat-pending',
  'https://www.bartact.com/products/bronco-accessories-visor-covers-w-molle-for-ford-bronco-2021-2022-2023-full-size-sun-visor-panel-storage-bartact-pat-pending': null, // DRAFT status in Shopify, remove asset
};

function post(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method: 'POST', headers }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve({ raw: data, statusCode: res.statusCode }); } });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function getToken() {
  const body = `client_id=${creds.client_id}&client_secret=${creds.client_secret}&refresh_token=${creds.refresh_token}&grant_type=refresh_token`;
  const res = await post('oauth2.googleapis.com', '/token', { 'Content-Type': 'application/x-www-form-urlencoded' }, body);
  return res.access_token;
}

async function main() {
  const token = await getToken();
  if (!token) { console.log('AUTH FAILED'); return; }

  // Get all disapproved assets with their sitelink text
  const query = `SELECT asset.resource_name, asset.type, asset.final_urls, asset.sitelink_asset.description1, asset.sitelink_asset.description2, asset.sitelink_asset.link_text, asset.policy_summary.approval_status FROM asset WHERE asset.policy_summary.approval_status = 'DISAPPROVED'`;
  
  const res = await post('googleads.googleapis.com', `/v23/customers/${creds.customer_id}/googleAds:searchStream`,
    { 'Authorization': `Bearer ${token}`, 'developer-token': creds.dev_token, 'Content-Type': 'application/json' },
    JSON.stringify({ query })
  );

  const results = (res[0] && res[0].results) || [];
  console.log(`Found ${results.length} disapproved assets\n`);

  const toRemove = [];
  const summary = [];
  
  for (const r of results) {
    const urls = r.asset.finalUrls || [];
    const baseUrl = urls[0] ? urls[0].split('?')[0] : 'N/A';
    const linkText = r.asset.sitelinkAsset?.linkText || r.asset.type;
    const resourceName = r.asset.resourceName;
    
    if (URL_FIXES[baseUrl] !== undefined) {
      if (URL_FIXES[baseUrl] === null) {
        summary.push(`REMOVE: ${linkText} → ${baseUrl} (no valid replacement)`);
        toRemove.push(resourceName);
      } else {
        summary.push(`NEEDS UPDATE: ${linkText} → ${baseUrl} → ${URL_FIXES[baseUrl]}`);
        // Note: Google Ads API doesn't support updating asset URLs directly.
        // Assets are immutable - must remove and recreate.
        toRemove.push(resourceName);
      }
    } else {
      summary.push(`UNKNOWN: ${linkText} → ${baseUrl}`);
    }
  }

  console.log('=== SUMMARY ===');
  summary.forEach(s => console.log(s));
  console.log(`\nTotal to remove: ${toRemove.length}`);
  console.log('\nAsset resource names to remove:');
  toRemove.forEach(r => console.log(r));
}

main().catch(e => console.error(e.message));
