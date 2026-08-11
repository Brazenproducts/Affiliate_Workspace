#!/usr/bin/env node
// GSC Site Verification — Elipacko sites (Steps 1-2)
// Uses HTML file method: push token file to repo root, then verify via API

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CREDS_PATH = '/home/ubuntu/.openclaw/workspace/.gcp-service-account.json';
const SITES_BASE = '/home/ubuntu/.openclaw/workspace/elipacko-sites';
const ELIPACKO_USA = '/home/ubuntu/.openclaw/workspace/elipacko-usa.com';

const SITES = [
  { domain: 'elipacko-usa.com', repoPath: ELIPACKO_USA },
  // 28 affiliate sites
  { domain: 'cardboardproduceboxes.com', repoPath: path.join(SITES_BASE, 'cardboardproduceboxes') },
  { domain: 'corrugatedplasticboxes.com', repoPath: path.join(SITES_BASE, 'corrugatedplasticboxes') },
  { domain: 'corrugatedplasticusa.com', repoPath: path.join(SITES_BASE, 'corrugatedplasticusa') },
  { domain: 'corrugatedslipsheet.com', repoPath: path.join(SITES_BASE, 'corrugatedslipsheet') },
  { domain: 'corrugatedslipsheets.com', repoPath: path.join(SITES_BASE, 'corrugatedslipsheets') },
  { domain: 'corrugatesheet.com', repoPath: path.join(SITES_BASE, 'corrugatesheet') },
  { domain: 'customplasticcorrugate.com', repoPath: path.join(SITES_BASE, 'customplasticcorrugate') },
  { domain: 'gaylordboxesplastic.com', repoPath: path.join(SITES_BASE, 'gaylordboxesplastic') },
  { domain: 'heavydutypallets.com', repoPath: path.join(SITES_BASE, 'heavydutypallets') },
  { domain: 'heavydutyplasticpallets.com', repoPath: path.join(SITES_BASE, 'heavydutyplasticpallets') },
  { domain: 'meatlugs.com', repoPath: path.join(SITES_BASE, 'meatlugs') },
  { domain: 'plasticcorrugatedbox.com', repoPath: path.join(SITES_BASE, 'plasticcorrugatedbox') },
  { domain: 'plasticgaylord.com', repoPath: path.join(SITES_BASE, 'plasticgaylord') },
  { domain: 'plasticgaylordbox.com', repoPath: path.join(SITES_BASE, 'plasticgaylordbox') },
  { domain: 'plasticgaylordboxes.com', repoPath: path.join(SITES_BASE, 'plasticgaylordboxes') },
  { domain: 'polypropylenebox.com', repoPath: path.join(SITES_BASE, 'polypropylenebox') },
  { domain: 'polypropylenecontainer.com', repoPath: path.join(SITES_BASE, 'polypropylenecontainer') },
  { domain: 'poultryboxes.com', repoPath: path.join(SITES_BASE, 'poultryboxes') },
  { domain: 'poultrycrates.com', repoPath: path.join(SITES_BASE, 'poultrycrates') },
  { domain: 'poultryshippingboxes.com', repoPath: path.join(SITES_BASE, 'poultryshippingboxes') },
  { domain: 'ppcontainers.com', repoPath: path.join(SITES_BASE, 'ppcontainers') },
  { domain: 'ppcorrugate.com', repoPath: path.join(SITES_BASE, 'ppcorrugate') },
  { domain: 'ppcorrugatebox.com', repoPath: path.join(SITES_BASE, 'ppcorrugatebox') },
  { domain: 'ppcorrugatedboxes.com', repoPath: path.join(SITES_BASE, 'ppcorrugatedboxes') },
  { domain: 'producecrates.com', repoPath: path.join(SITES_BASE, 'producecrates') },
  { domain: 'reusableshippingboxes.com', repoPath: path.join(SITES_BASE, 'reusableshippingboxes') },
  { domain: 'vegetablecrates.com', repoPath: path.join(SITES_BASE, 'vegetablecrates') },
  { domain: 'waxproduceboxes.com', repoPath: path.join(SITES_BASE, 'waxproduceboxes') },
];

async function run() {
  const creds = JSON.parse(fs.readFileSync(CREDS_PATH));
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/siteverification'],
  });
  const client = await auth.getClient();
  const siteVerification = google.siteVerification({ version: 'v1', auth: client });

  const results = { verified: [], pending: [], failed: [] };

  for (const site of SITES) {
    const url = `https://${site.domain}/`;
    console.log(`\nProcessing ${url}`);

    try {
      // Step 1: Get verification token
      const tokenRes = await siteVerification.webResource.getToken({
        requestBody: {
          site: { type: 'SITE', identifier: url },
          verificationMethod: 'FILE',
        },
      });

      const token = tokenRes.data.token;
      const filename = token; // Google's file token IS the filename
      console.log(`  Token: ${filename}`);

      // Write token file to repo
      const tokenPath = path.join(site.repoPath, filename);
      fs.writeFileSync(tokenPath, 'google-site-verification: ' + filename);
      console.log(`  Written: ${tokenPath}`);

      // Git add + commit + push
      execSync(`cd "${site.repoPath}" && git add "${filename}" && git commit -m "GSC verification: add HTML token file" && git push origin main`, {
        stdio: 'pipe',
        timeout: 30000,
      });
      console.log(`  Pushed to GitHub`);

      results.pending.push({ domain: site.domain, token: filename, url });
    } catch (err) {
      if (err.message && err.message.includes('nothing to commit')) {
        console.log(`  Token file already exists — skipping commit`);
        results.pending.push({ domain: site.domain, url, note: 'already_pushed' });
      } else {
        console.error(`  ERROR: ${err.message}`);
        results.failed.push({ domain: site.domain, error: err.message });
      }
    }

    // Small delay to avoid hammering the API
    await new Promise(r => setTimeout(r, 500));
  }

  // Summary
  console.log('\n========== SUMMARY ==========');
  console.log(`Attempted: ${SITES.length}`);
  console.log(`Token pushed (pending propagation): ${results.pending.length}`);
  console.log(`Failed: ${results.failed.length}`);
  if (results.failed.length) {
    console.log('\nFailed sites:');
    results.failed.forEach(f => console.log(`  ${f.domain}: ${f.error}`));
  }

  // Save state
  fs.writeFileSync(
    '/home/ubuntu/.openclaw/workspace/memory/gsc-verify-elipacko-state.json',
    JSON.stringify({ runAt: new Date().toISOString(), results }, null, 2)
  );
  console.log('\nState saved to memory/gsc-verify-elipacko-state.json');
  console.log('\nNOTE: GitHub Pages propagation takes ~1-5 min. Run gsc-verify-step2.js after that to call verify API.');
}

run().catch(console.error);
