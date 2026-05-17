const { google } = require('googleapis');
const sa = require('/home/ubuntu/.openclaw/workspace/.gcp-service-account.json');

const auth = new google.auth.JWT(sa.client_email, null, sa.private_key, ['https://www.googleapis.com/auth/webmasters.readonly']);
const searchconsole = google.searchconsole({ version: 'v1', auth });

async function checkUrl(urlFragment) {
  const res = await searchconsole.searchanalytics.query({
    siteUrl: 'sc-domain:bartact.com',
    requestBody: {
      startDate: '2026-04-01',
      endDate: '2026-05-06',
      dimensions: ['page'],
      dimensionFilterGroups: [{ filters: [{ dimension: 'page', operator: 'contains', expression: urlFragment }] }],
      rowLimit: 5
    }
  });
  return res.data.rows || [];
}

async function main() {
  // Check standalone Mojave Gladiator builder
  const gladiatorMojave = await checkUrl('fully-customized-front-tactical-seat-covers-for-jeep-gladiator-2021-jt-bartact-pair-for-mojave-edition-only');
  console.log('Gladiator Mojave standalone:');
  if (gladiatorMojave.length) gladiatorMojave.forEach(r => console.log('  clicks:', r.clicks, '| impr:', r.impressions, '| pos:', r.position.toFixed(1)));
  else console.log('  No traffic found');

  // Also check the JLU Mojave standalone we archived earlier
  const jluMojave = await checkUrl('fully-customized-front-tactical-seat-covers-for-jeep-wrangler-mojave-392-jlu-4-dr-2021');
  console.log('JLU Mojave/392 standalone:');
  if (jluMojave.length) jluMojave.forEach(r => console.log('  clicks:', r.clicks, '| impr:', r.impressions, '| pos:', r.position.toFixed(1)));
  else console.log('  No traffic found');
}
main().catch(console.error);
