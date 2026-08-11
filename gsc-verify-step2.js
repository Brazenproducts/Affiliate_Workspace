#!/usr/bin/env node
// GSC Site Verification — Step 2: Call verify API after token files are live

const { google } = require('googleapis');
const fs = require('fs');

const CREDS_PATH = '/home/ubuntu/.openclaw/workspace/.gcp-service-account.json';
const SERVICE_ACCOUNT = 'axl-348@proud-stage-397621.iam.gserviceaccount.com';

const SITES = [
  'https://elipacko-usa.com/',
  'https://cardboardproduceboxes.com/',
  'https://corrugatedplasticboxes.com/',
  'https://corrugatedplasticusa.com/',
  'https://corrugatedslipsheet.com/',
  'https://corrugatedslipsheets.com/',
  'https://corrugatesheet.com/',
  'https://customplasticcorrugate.com/',
  'https://gaylordboxesplastic.com/',
  'https://heavydutypallets.com/',
  'https://heavydutyplasticpallets.com/',
  'https://meatlugs.com/',
  'https://plasticcorrugatedbox.com/',
  'https://plasticgaylord.com/',
  'https://plasticgaylordbox.com/',
  'https://plasticgaylordboxes.com/',
  'https://polypropylenebox.com/',
  'https://polypropylenecontainer.com/',
  'https://poultryboxes.com/',
  'https://poultrycrates.com/',
  'https://poultryshippingboxes.com/',
  'https://ppcontainers.com/',
  'https://ppcorrugate.com/',
  'https://ppcorrugatebox.com/',
  'https://ppcorrugatedboxes.com/',
  'https://producecrates.com/',
  'https://reusableshippingboxes.com/',
  'https://vegetablecrates.com/',
  'https://waxproduceboxes.com/',
];

async function run() {
  const creds = JSON.parse(fs.readFileSync(CREDS_PATH));
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/siteverification'],
  });
  const client = await auth.getClient();
  const siteVerification = google.siteVerification({ version: 'v1', auth: client });

  const verified = [], failed = [];

  for (const url of SITES) {
    try {
      // Call verify
      const res = await siteVerification.webResource.insert({
        verificationMethod: 'FILE',
        requestBody: {
          site: { type: 'SITE', identifier: url },
        },
      });
      console.log(`✅ VERIFIED: ${url}`);
      verified.push(url);

      // Step 2: Add service account as delegated owner (already owner via service account, but make explicit)
      // The insert call above already verifies ownership under the service account
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('already verified') || msg.includes('already a verified owner')) {
        console.log(`✅ ALREADY VERIFIED: ${url}`);
        verified.push(url);
      } else {
        console.log(`❌ FAILED: ${url} — ${msg.substring(0, 120)}`);
        failed.push({ url, error: msg.substring(0, 200) });
      }
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n========== STEP 2 RESULTS ==========');
  console.log(`Verified: ${verified.length}/${SITES.length}`);
  console.log(`Failed: ${failed.length}`);
  if (failed.length) {
    console.log('\nFailed:');
    failed.forEach(f => console.log(`  ${f.url}: ${f.error}`));
  }

  // Update state file
  const state = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/memory/gsc-verify-elipacko-state.json'));
  state.step2 = { runAt: new Date().toISOString(), verified, failed };
  fs.writeFileSync(
    '/home/ubuntu/.openclaw/workspace/memory/gsc-verify-elipacko-state.json',
    JSON.stringify(state, null, 2)
  );
  console.log('\nState updated.');
}

run().catch(console.error);
