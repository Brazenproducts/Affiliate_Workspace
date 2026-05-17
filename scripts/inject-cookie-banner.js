#!/usr/bin/env node
/**
 * inject-cookie-banner.js
 * Injects a lightweight cookie consent banner into all HTML files
 * across the affiliate sites network (sites/ directory).
 * 
 * - Idempotent: skips files that already have the banner
 * - Inserts just before </body>
 * - Banner: bottom bar, "Accept" dismisses it forever (localStorage)
 * - Zero external deps, ~600 bytes inline HTML/CSS/JS
 */

const fs = require('fs');
const path = require('path');

const SITES_DIR = path.join(__dirname, '..', 'sites');
const BANNER_MARKER = 'cookie-consent-banner';

const COOKIE_BANNER = `
<div id="cookie-consent-banner" style="position:fixed;bottom:0;left:0;right:0;background:#1a1a1a;color:#ccc;font-family:sans-serif;font-size:13px;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;z-index:99999;border-top:1px solid #333;box-shadow:0 -2px 8px rgba(0,0,0,.4)">
  <span>We use cookies to improve your experience and serve relevant ads. By using this site, you agree to our use of cookies. <a href="/privacy.html" style="color:#f0a500;text-decoration:underline">Privacy Policy</a></span>
  <button onclick="document.getElementById('cookie-consent-banner').style.display='none';localStorage.setItem('cookie_ok','1')" style="background:#f0a500;color:#000;border:none;padding:8px 20px;border-radius:4px;cursor:pointer;font-weight:700;white-space:nowrap;font-size:13px">Accept</button>
</div>
<script>if(localStorage.getItem('cookie_ok'))document.getElementById('cookie-consent-banner').style.display='none';</script>`;

function injectBanner(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has our banner
  if (html.includes(BANNER_MARKER)) return false;
  
  // Skip if no </body> tag
  if (!html.includes('</body>')) return false;
  
  // Insert before last </body>
  const lastBodyIdx = html.lastIndexOf('</body>');
  html = html.slice(0, lastBodyIdx) + COOKIE_BANNER + '\n</body>' + html.slice(lastBodyIdx + 7);
  
  fs.writeFileSync(filePath, html, 'utf8');
  return true;
}

// Walk all sites
let totalFiles = 0;
let injected = 0;
let skipped = 0;
let errors = 0;
const failedDirs = [];

const siteDirs = fs.readdirSync(SITES_DIR).filter(d => {
  const full = path.join(SITES_DIR, d);
  return fs.statSync(full).isDirectory() && !d.startsWith('_');
});

console.log(`Found ${siteDirs.length} site directories`);

for (const siteDir of siteDirs) {
  const siteRoot = path.join(SITES_DIR, siteDir);
  
  // Find all HTML files in this site (not too deep — max 2 levels)
  let htmlFiles = [];
  try {
    const walk = (dir, depth) => {
      if (depth > 2) return;
      for (const entry of fs.readdirSync(dir)) {
        if (entry.startsWith('.') || entry === 'node_modules') continue;
        const full = path.join(dir, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          walk(full, depth + 1);
        } else if (entry.endsWith('.html')) {
          htmlFiles.push(full);
        }
      }
    };
    walk(siteRoot, 0);
  } catch (e) {
    errors++;
    failedDirs.push(siteDir);
    continue;
  }
  
  let siteInjected = 0;
  for (const f of htmlFiles) {
    totalFiles++;
    try {
      if (injectBanner(f)) {
        injected++;
        siteInjected++;
      } else {
        skipped++;
      }
    } catch (e) {
      errors++;
    }
  }
}

console.log(`\n=== Cookie Banner Injection Complete ===`);
console.log(`Total HTML files processed: ${totalFiles}`);
console.log(`Injected: ${injected}`);
console.log(`Skipped (already have banner or no </body>): ${skipped}`);
console.log(`Errors: ${errors}`);
if (failedDirs.length) console.log(`Failed dirs: ${failedDirs.join(', ')}`);
