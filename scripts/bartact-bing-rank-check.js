#!/usr/bin/env node
/**
 * Bartact Bing Webmaster Tools Rank Check
 * Pulls top pages and keyword rankings from Bing Webmaster Tools API
 * Writes results to /tmp/bartact-bing-rank-results.json
 */

const https = require('https');
const fs = require('fs');

const API_KEY = 'ed298ad4e7244db380e73e24b68b197d';
const SITE_URL = 'https://www.bartact.com/';
const OUTPUT_FILE = '/tmp/bartact-bing-rank-results.json';

function bingApiRequest(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'ssl.bing.com',
      path: `/webmaster/api.svc/json/${path}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'api-key': API_KEY,
      }
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

// Date helpers
function toDateStr(d) {
  return d.toISOString().split('T')[0];
}

async function main() {
  const results = {
    fetchedAt: new Date().toISOString(),
    siteUrl: SITE_URL,
    topPages: [],
    topKeywords: [],
    errors: []
  };

  // Get date range: last 7 days
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    // 1. Get top pages by clicks
    console.log('Fetching top pages from Bing Webmaster Tools...');
    const pagesPath = `GetPageStats?siteUrl=${encodeURIComponent(SITE_URL)}&startDate=${toDateStr(startDate)}&endDate=${toDateStr(endDate)}&type=1`;
    const pagesRes = await bingApiRequest(pagesPath);
    console.log(`Pages API status: ${pagesRes.status}`);
    
    if (pagesRes.status === 200 && pagesRes.body && pagesRes.body.d) {
      const pages = pagesRes.body.d;
      results.topPages = pages
        .sort((a, b) => (b.Clicks || 0) - (a.Clicks || 0))
        .slice(0, 20)
        .map(p => ({
          url: p.Url || p.url || '',
          clicks: p.Clicks || 0,
          impressions: p.Impressions || 0,
          avgPosition: p.AvgPosition || p.avgPosition || null,
          ctr: p.Ctr || null
        }));
      console.log(`Found ${results.topPages.length} top pages`);
    } else {
      const errMsg = `Pages API error: status=${pagesRes.status}, body=${JSON.stringify(pagesRes.body).slice(0, 200)}`;
      console.log(errMsg);
      results.errors.push(errMsg);
    }
  } catch (e) {
    console.log(`Pages fetch error: ${e.message}`);
    results.errors.push(`Pages fetch error: ${e.message}`);
  }

  try {
    // 2. Get top keywords
    console.log('Fetching top keywords from Bing Webmaster Tools...');
    const kwPath = `GetKeywordStats?siteUrl=${encodeURIComponent(SITE_URL)}&startDate=${toDateStr(startDate)}&endDate=${toDateStr(endDate)}&type=1`;
    const kwRes = await bingApiRequest(kwPath);
    console.log(`Keywords API status: ${kwRes.status}`);
    
    if (kwRes.status === 200 && kwRes.body && kwRes.body.d) {
      const keywords = kwRes.body.d;
      results.topKeywords = keywords
        .sort((a, b) => (b.Clicks || 0) - (a.Clicks || 0))
        .slice(0, 30)
        .map(k => ({
          keyword: k.Query || k.query || k.Keyword || '',
          clicks: k.Clicks || 0,
          impressions: k.Impressions || 0,
          avgPosition: k.AvgPosition || k.avgPosition || null,
          ctr: k.Ctr || null
        }));
      console.log(`Found ${results.topKeywords.length} top keywords`);
    } else {
      const errMsg = `Keywords API error: status=${kwRes.status}, body=${JSON.stringify(kwRes.body).slice(0, 200)}`;
      console.log(errMsg);
      results.errors.push(errMsg);
    }
  } catch (e) {
    console.log(`Keywords fetch error: ${e.message}`);
    results.errors.push(`Keywords fetch error: ${e.message}`);
  }

  try {
    // 3. Try alternate endpoint: GetRankedKeywords
    console.log('Fetching ranked keywords...');
    const rkPath = `GetRankedKeywords?siteUrl=${encodeURIComponent(SITE_URL)}&startDate=${toDateStr(startDate)}&endDate=${toDateStr(endDate)}`;
    const rkRes = await bingApiRequest(rkPath);
    console.log(`RankedKeywords API status: ${rkRes.status}`);
    
    if (rkRes.status === 200 && rkRes.body && rkRes.body.d) {
      results.rankedKeywords = rkRes.body.d.slice(0, 30);
      console.log(`Found ${results.rankedKeywords.length} ranked keywords`);
    } else {
      const msg = `RankedKeywords: ${rkRes.status} - ${JSON.stringify(rkRes.body).slice(0, 150)}`;
      console.log(msg);
    }
  } catch (e) {
    console.log(`RankedKeywords error: ${e.message}`);
  }

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\nBing rank results written to ${OUTPUT_FILE}`);
  console.log(`Top pages found: ${results.topPages.length}`);
  console.log(`Top keywords found: ${results.topKeywords.length}`);
  if (results.errors.length > 0) {
    console.log(`Errors: ${results.errors.length}`);
    results.errors.forEach(e => console.log(`  - ${e}`));
  }
  
  return results;
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ error: err.message, fetchedAt: new Date().toISOString() }, null, 2));
  process.exit(1);
});
