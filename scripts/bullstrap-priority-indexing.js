#!/usr/bin/env node
// Push priority Bartact/Bull Strap product URLs for re-crawl via Indexing API
// Uses OAuth creds (not service account) which have owner access

const https = require('https');
const creds = require('/home/ubuntu/.openclaw/workspace/sites/besttirepatch.com/.bartactinc-indexing-credentials.json');

function httpReq(o, d) {
  return new Promise((res, rej) => {
    const r = https.request(o, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(d)); });
    r.on('error', rej); if (d) r.write(d); r.end();
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

const PRIORITY_URLS = [
  // Collections
  '/collections/grab-handles',
  '/collections/limit-straps',
  '/collections/jeep-wrangler-seat-covers-1',
  '/collections/ford-bronco-accessories',
  '/collections/molle-accessories',
  '/collections/fire-extinguisher-mounts',
  '/collections/recovery-gear',
  '/collections/tie-downs',
  '/collections/roll-bar-accessories',
  // Top products - Limit straps & tie downs
  '/products/limit-straps-bullstrap',
  '/products/limit-straps-4-layer-quad-wrap-made-in-usa-bartact',
  '/products/ratchet-tie-down-straps-w-twist-snap-hooks-qty-4-w-4-free-bull-wraps-bull-strap-2-x-12-10-000-lb-heavy-duty',
  '/products/ratchet-tie-down-straps-w-twist-snap-hooks-adj-axle-strap-combo-heavy-duty-pair-of-4-w-4-free-bull-wraps-bull-strap-2-x-12-10-000-lb',
  '/products/bull-strap-by-bartact-2-20k-lb-weavable-recovery-strap',
  // Grab handles
  '/products/paracord-grab-handles-for-roll-bars-set-of-4-for-jeep-wrangler-jl-jlu-tj-yj-cj-gladiator-utv-rzr-x3-front-and-rear-bartact',
  '/products/jeep-grab-handles-for-roll-bar-pair-of-2-paracord-grab-handles-for-jeep-wrangler-gladiator-polaris-rzr-canam-maverick-x3',
  '/products/tj-door-handles-paracord-jeep-grab-handles-for-jeep-wrangler-tj-lj-97-06-pair',
  '/products/bronco-paracord-grab-handles-custom-for-ford-bronco-full-size-2021-2024',
  // Door bags
  '/products/bronco-accessories-door-bags-for-ford-bronco-2021-2022-2023-full-size-front-door-interior-storage-bartact-pat-pending',
  '/products/wrangliator-door-storage-bags-for-jeep-wrangler-jl-jlu-amp-gladiator-bartact-nbsp-pat-pending',
  '/products/can-am-x3-door-bags-front-pair-driver-and-passenger-w-pals-molle-and-lockable-interior-pistol-pocket-bartact',
  // MOLLE & accessories
  '/products/tailgate-molle-panel-kit-with-pouches-for-jeep-wrangler-jl-jlu-2018-22-bartact',
  '/products/bronco-accessories-visor-covers-w-molle-for-ford-bronco-2021-2022-2023-full-size-sun-visor-panel-storage-bartact-pat-pending',
  '/products/molle-seat-back-panel-pouch-system-w-2-zippered-pockets-bartact-patent-pending',
  // Seat covers - top sellers
  '/products/molle-tactical-custom-seat-covers-for-jeep-wrangler-jlu-2018-22-4-door-only-not-for-mojave-or-392-edition-front-pair-bartact',
  '/products/front-tactical-seat-covers-for-jeep-wrangler-jl-2018-22-2-door-only-not-for-mojave-or-392-edition-bartact-w-molle',
  '/products/front-tactical-custom-seat-covers-for-jeep-gladiator-2019-22-jt-bartact-pair-w-molle-not-for-mojave-or-392-edition',
  '/products/bronco-seat-covers-front-tactical-custom-seat-covers-for-ford-bronco-full-size-2021-2022-2023-4-door-only-bartact',
  '/products/front-tactical-seat-covers-for-toyota-tacoma-2020-22-all-models-w-electric-driver-manual-passenger-seat-trd-non-trd-bartact-w-molle-pair',
  // Fire extinguisher
  '/products/element-e100-fire-extinguisher-100-second-plus-roll-bar-strap-holder-combo-kit-pals-molle-compatible-bartact',
  // Tactical seat (RZR)
  '/products/bartact-tactic-seat-for-polaris-rzr-front-or-rear-w-pals-molle-mount-sold-separately-patents-and-patent-pending-made-in-usa',
  // Recovery
  '/products/bullstrap-3-4-heavy-duty-8t-shackle-kit-w-isolators-washers-qty-2',
  '/products/bull-strap-2-hitch-receiver-w-3-4-5t-d-ring-shackle-isolators-washers-pin',
  // Blog posts with most impressions
  '/blogs/news/best-lift-kits-2026-how-to-choose-the-right-suspension-lift-for-your',
  '/blogs/news/best-limit-straps-for-off-road-vehicles-2026',
  '/blogs/news/seat-covers-buying-guide-2026-materials-fitment-and-how-to-protect-your-interior',
  '/blogs/news/what-are-limit-straps-the-complete-guide-to-suspension-limiting-straps',
  '/blogs/news/how-to-choose-the-right-limit-straps-for-your-suspension-build',
  '/blogs/news/how-to-measure-limit-strap-length-for-your-suspension',
  '/blogs/news/limit-straps-vs-bump-stops-which-does-your-truck-actually-need',
  '/blogs/news/essential-recovery-gear-every-off-roader-should-carry',
  '/blogs/news/how-to-choose-the-right-lift-kit-for-your-truck-or-suv',
];

async function main() {
  const t = await httpReq({ hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    new URLSearchParams({ client_id: creds.client_id, client_secret: creds.client_secret, refresh_token: creds.refresh_token, grant_type: 'refresh_token' }).toString());
  const token = JSON.parse(t).access_token;
  if (!token) { console.log('Auth failed'); return; }

  let success = 0, fail = 0;
  for (const path of PRIORITY_URLS) {
    const url = 'https://bullstrap.com' + path;
    const resp = await httpReq({ hostname: 'indexing.googleapis.com', path: '/v3/urlNotifications:publish', method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } },
      JSON.stringify({ url, type: 'URL_UPDATED' }));
    const r = JSON.parse(resp);
    if (r.urlNotificationMetadata) { console.log('✅ ' + path.substring(0, 70)); success++; }
    else { console.log('❌ ' + path.substring(0, 70) + ' → ' + (r.error?.message || '').substring(0, 60)); fail++; }
    await sleep(300);
  }
  console.log('\nDone: ' + success + ' pushed, ' + fail + ' failed');
}

main().catch(e => console.error(e.message));
