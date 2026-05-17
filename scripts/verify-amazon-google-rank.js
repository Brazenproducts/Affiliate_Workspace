#!/usr/bin/env node
/**
 * Verify Amazon ranks top 3 on Google for our top affiliate domain candidates.
 * Uses DuckDuckGo HTML search (no API key, less aggressive blocking than Google direct).
 */

const https = require('https');

const queries = [
  'best magnesium glycinate',
  'best magnetic eyelashes',
  'best walking pad',
  'best neck lift tape',
  'best protein powder',
  'best compression socks',
  'best air fryer',
  'best lash clusters',
  'best weighted vest',
  'best portable charger',
  'best pimple patches',
  'best mini fridge',
  'best water bottle',
  'best mushroom coffee',
  'best air purifier',
  'best queen mattress',
  'best heating pad',
  'best massage gun',
  'best robot vacuum',
  'best espresso machine'
];

function fetch(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        ...headers
      }
    };
    https.get(opts, (res) => {
      // Follow redirects
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        return fetch(res.headers.location.startsWith('http') ? res.headers.location : 'https://' + u.hostname + res.headers.location, headers).then(resolve, reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function checkQuery(query) {
  // DuckDuckGo HTML version (less anti-bot than Google, similar results)
  const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
  try {
    const res = await fetch(url);
    if (res.status !== 200) return { query, error: 'status=' + res.status, amazonRank: null };
    
    // Extract result URLs in order
    const linkRegex = /<a[^>]+class="result__a"[^>]+href="([^"]+)"/g;
    const urls = [];
    let m;
    while ((m = linkRegex.exec(res.body)) !== null && urls.length < 15) {
      let url = m[1];
      // DDG wraps URLs - extract real URL
      if (url.startsWith('//duckduckgo.com/l/?uddg=')) {
        url = decodeURIComponent(url.split('uddg=')[1].split('&')[0]);
      }
      urls.push(url);
    }
    
    // Find Amazon position
    let amazonRank = null;
    let amazonUrl = null;
    for (let i = 0; i < urls.length; i++) {
      try {
        const host = new URL(urls[i]).hostname.toLowerCase();
        if (host === 'amazon.com' || host === 'www.amazon.com' || host.endsWith('.amazon.com')) {
          amazonRank = i + 1;
          amazonUrl = urls[i].slice(0, 80);
          break;
        }
      } catch {}
    }
    
    return { query, amazonRank, amazonUrl, top3: urls.slice(0, 3).map(u => { try { return new URL(u).hostname; } catch { return u; } }) };
  } catch (e) {
    return { query, error: e.message, amazonRank: null };
  }
}

(async () => {
  const results = [];
  for (const q of queries) {
    const r = await checkQuery(q);
    const tag = r.amazonRank === null ? '❌ NO AMAZON' : (r.amazonRank <= 3 ? '✅ #' + r.amazonRank : '⚠️  #' + r.amazonRank);
    console.log(tag.padEnd(15) + ' | ' + q.padEnd(35) + ' | top3: ' + (r.top3 ? r.top3.join(', ') : r.error));
    results.push(r);
    await sleep(2500);
  }
  
  console.log('\n=== SUMMARY ===');
  const top3 = results.filter(r => r.amazonRank && r.amazonRank <= 3);
  const top10 = results.filter(r => r.amazonRank && r.amazonRank <= 10);
  const noAmazon = results.filter(r => !r.amazonRank);
  console.log('Amazon top 3: ' + top3.length + '/' + queries.length);
  console.log('Amazon top 10: ' + top10.length + '/' + queries.length);
  console.log('Amazon not found: ' + noAmazon.length + '/' + queries.length);
})();
