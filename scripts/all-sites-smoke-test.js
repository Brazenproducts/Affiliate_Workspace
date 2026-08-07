#!/usr/bin/env node

/**
 * All-Sites Daily Smoke Test
 * Checks health of all major sites
 * Exit code 0 = all OK, non-zero = failures found
 */

const https = require('https');
const http = require('http');

// Sites to test: [name, url, expectedStatus]
const SITES = [
  ['BullStrap', 'https://bullstrap.com/', 200],
  ['BartAct', 'https://bartact.com/', 200],
  ['WhatAreBest', 'https://whatarebest.com/', 200],
  ['FaithfulPassages', 'https://faithfulpassages.com/', 200],
];

const TIMEOUT_MS = 10000;
const MAX_REDIRECTS = 5;

async function checkUrl(name, url, expectedStatus = 200) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, {
      timeout: TIMEOUT_MS,
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SmokeTest/1.0)',
      },
    }, (res) => {
      const isOk = res.statusCode === expectedStatus || (res.statusCode >= 200 && res.statusCode < 300);
      resolve({
        ok: isOk,
        name,
        url,
        status: res.statusCode,
        expected: expectedStatus,
      });
    });

    req.on('error', (err) => {
      resolve({
        ok: false,
        name,
        url,
        error: err.message,
        status: null,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        ok: false,
        name,
        url,
        error: `Timeout after ${TIMEOUT_MS}ms`,
        status: null,
      });
    });

    req.end();
  });
}

async function run() {
  console.log(`📋 All-Sites Smoke Test [${new Date().toISOString()}]`);
  console.log('━'.repeat(60));

  const results = await Promise.all(
    SITES.map(([name, url, status]) => checkUrl(name, url, status))
  );

  const failures = results.filter(r => !r.ok);
  const passes = results.filter(r => r.ok);

  // Print results
  passes.forEach(r => {
    console.log(`✅ ${r.name.padEnd(20)} ${r.url} (${r.status})`);
  });

  failures.forEach(r => {
    console.log(`❌ ${r.name.padEnd(20)} ${r.url}`);
    if (r.error) {
      console.log(`   └─ Error: ${r.error}`);
    } else {
      console.log(`   └─ Status: ${r.status} (expected ${r.expected})`);
    }
  });

  console.log('━'.repeat(60));
  
  if (failures.length > 0) {
    console.log(`\n🚨 FAILURES: ${failures.length}/${results.length} sites failed\n`);
    failures.forEach(r => {
      console.log(`- ${r.name}: ${r.error || `Status ${r.status}`}`);
    });
    process.exit(1);
  } else {
    console.log(`\n✨ All ${results.length} sites are healthy!`);
    process.exit(0);
  }
}

run().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(2);
});
