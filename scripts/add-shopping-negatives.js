const https = require('https');
const fs = require('fs');
const creds = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json'));

// Negative keywords to add to Bartact Shopping - All Products
// Based on 30-day search terms report: zero conversions, high spend
const negativeKeywords = [
  // Molle generic (people looking for backpack molle, not Bartact products)
  'molle attachments for backpack',
  'molle accessories for backpack',
  'molle pouches',
  'molle clips',
  // Straps generic
  'ladder rack straps',
  'velcro straps',
  'ratchet strap',
  'come along strap',
  'retractable strap',
  'transom straps',
  // Fire extinguisher generic
  'marine fire extinguisher',
  'sxs fire extinguisher',
  'car fire extinguisher',
  // Hardware generic
  'zipper pull replacement',
  'zipper pulls',
  'elastic zipper pulls',
  'plastic buckle replacement',
  'plastic buckle clips',
  'plastic clasp',
  'qasm buckles',
  // Tools
  'tool kit',
  'tool bag',
  // Irrelevant
  'coyote protection',
  'coyote suit',
  'dog barrier',
  'dog divider',
  'harness french bulldog',
  'toiletries bag',
  'braided keychain',
  'racing seat belt covers',
  // Other zero-conv bleeders
  'blue ridge overland gear',
  'rough country winch cover',
  'badlands apex winch cover',
  'trek armor seat covers'
];

async function main() {
  // Refresh token
  const tokenResp = await httpReq({
    hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }, new URLSearchParams({
    client_id: creds.client_id, client_secret: creds.client_secret,
    refresh_token: creds.refresh_token, grant_type: 'refresh_token'
  }).toString());
  const token = JSON.parse(tokenResp).access_token;

  // Step 1: Find the campaign ID for Bartact Shopping
  const campResp = await gaSearch(token, "SELECT campaign.id, campaign.name FROM campaign WHERE campaign.name = 'Bartact Shopping - All Products'");
  const campId = campResp[0].results[0].campaign.id;
  console.log('Campaign ID:', campId);

  // Step 2: Check for existing shared negative keyword list, or add directly to campaign
  // For Shopping campaigns, we add campaign-level negative keywords via CampaignCriterion
  const operations = negativeKeywords.map(kw => ({
    create: {
      campaign: `customers/${creds.customer_id}/campaigns/${campId}`,
      negative: true,
      keyword: {
        text: kw,
        matchType: 'PHRASE'  // Phrase match to catch variations
      }
    }
  }));

  // Add in batches of 20
  let added = 0;
  let errors = 0;
  for (let i = 0; i < operations.length; i += 20) {
    const batch = operations.slice(i, i + 20);
    const result = await gaPost(token,
      `/v23/customers/${creds.customer_id}/campaignCriteria:mutate`,
      { operations: batch }
    );
    const parsed = JSON.parse(result);
    if (parsed.results) {
      added += parsed.results.length;
      console.log(`Batch ${Math.floor(i/20)+1}: Added ${parsed.results.length} negative keywords`);
    } else if (parsed.error) {
      // Check for duplicates
      const msg = parsed.error.message || '';
      if (msg.includes('DUPLICATE') || msg.includes('already exists')) {
        console.log(`Batch ${Math.floor(i/20)+1}: Some duplicates, trying one by one...`);
        for (const op of batch) {
          const single = await gaPost(token,
            `/v23/customers/${creds.customer_id}/campaignCriteria:mutate`,
            { operations: [op] }
          );
          const sp = JSON.parse(single);
          if (sp.results) { added++; }
          else { errors++; }
        }
      } else {
        console.log(`Batch ${Math.floor(i/20)+1} error:`, msg.substring(0, 200));
        errors += batch.length;
      }
    }
  }

  console.log(`\nDone! Added: ${added}, Errors/Duplicates: ${errors}`);
  console.log('Total negative keywords submitted:', negativeKeywords.length);
}

function httpReq(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function gaSearch(token, query) {
  return httpReq({
    hostname: 'googleads.googleapis.com',
    path: `/v23/customers/${creds.customer_id}/googleAds:searchStream`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'developer-token': creds.dev_token,
      'Content-Type': 'application/json'
    }
  }, JSON.stringify({ query })).then(d => JSON.parse(d));
}

function gaPost(token, path, body) {
  return httpReq({
    hostname: 'googleads.googleapis.com',
    path: path,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'developer-token': creds.dev_token,
      'Content-Type': 'application/json'
    }
  }, JSON.stringify(body));
}

main().catch(e => console.error('Error:', e.message));
