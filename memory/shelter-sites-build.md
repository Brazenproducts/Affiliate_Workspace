# Shelter Sites Build Log — 2026-04-22

## Domains requested
1. bestemergencyshelters.com
2. bestsaferooms.com
3. besthurricaneshelter.com
4. stormshelterreviews.com
5. emergencyhousingreviews.com
6. bestdisasterhousing.com
7. bestcommunityshelters.com
8. bestmodularshelters.com

## What was built
- Created 8 single-page authority sites under `/home/ubuntu/.openclaw/workspace/affiliate-sites/`
- Each includes:
  - `index.html`
  - `robots.txt`
  - `sitemap.xml`
  - IndexNow key file `b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5.txt`
  - `CNAME`
- Sites use CSS-only branded panels and no stock photos
- Network footer links all 8 sites together
- Content targets municipality procurement officers and emergency managers
- Coverage includes STORMBOX, US Tornado Shelter, Survive-a-Storm, Clayton Homes, Cavco, Skyline Champion, NanoNest, Boxabl, and Pallet Shelter
- Funding language includes HMGP, BRIC/PDM, and CDBG
- Compliance language references FEMA P-361 and ICC 500-2020

## GitHub
- Created repos under `Brazenproducts` user account:
  - `Brazenproducts/bestemergencyshelters.com`
  - `Brazenproducts/bestsaferooms.com`
  - `Brazenproducts/besthurricaneshelter.com`
  - `Brazenproducts/stormshelterreviews.com`
  - `Brazenproducts/emergencyhousingreviews.com`
  - `Brazenproducts/bestdisasterhousing.com`
  - `Brazenproducts/bestcommunityshelters.com`
  - `Brazenproducts/bestmodularshelters.com`
- Pushed `main` branch for all 8
- Enabled GitHub Pages for all 8
- Added `CNAME` file to all 8 and pushed it

## GoDaddy / DNS
### Confirmed in GoDaddy account and pointed to GitHub Pages
- bestemergencyshelters.com
- bestsaferooms.com
- besthurricaneshelter.com
- emergencyhousingreviews.com
- bestdisasterhousing.com
- bestcommunityshelters.com
- bestmodularshelters.com

DNS set for those 7:
- A records: 185.199.108.153 / .109.153 / .110.153 / .111.153
- CNAME `www` -> `Brazenproducts.github.io`
- Google TXT verification tokens added during Search Console setup attempt

### Problem domain
- `stormshelterreviews.com` was NOT found in the GoDaddy shopper account via API (`NOT_FOUND` / `UNKNOWN_DOMAIN`)
- Repo exists and Pages exists, but GoDaddy API could not access the domain zone
- Mitch said he bought it, so likely one of:
  - checkout did not finish
  - purchased under another account
  - delayed account sync

## Search Console / verification status
### All 7 GoDaddy domains fully verified + sc-domain property added + sitemap submitted
- bestemergencyshelters.com — verified pass 1 (4/22) + sitemap + IndexNow
- bestsaferooms.com — verified pass 1 (4/22) + sitemap + IndexNow
- besthurricaneshelter.com — verified pass 1 (4/22) + sitemap + IndexNow
- emergencyhousingreviews.com — DNS_TXT verified pass 2 (4/23 ~01:15 UTC), sc-domain added (siteOwner), sitemap submitted ✅
- bestdisasterhousing.com — DNS_TXT verified pass 2 (4/23 ~01:15 UTC), sc-domain added (siteOwner), sitemap submitted ✅
- bestcommunityshelters.com — DNS_TXT verified pass 2 (4/23 ~01:15 UTC), sc-domain added (siteOwner), sitemap submitted ✅
- bestmodularshelters.com — DNS_TXT verified pass 2 (4/23 ~01:15 UTC), sc-domain added (siteOwner), sitemap submitted ✅

### Pass 2 notes (4/23)
- Site Verification API (webResource.insert DNS_TXT) succeeded for all 4 on first attempt — TXT records had propagated
- Sitemap submit initially got 403 because sc-domain property didn't exist yet in Search Console
- Fixed by calling `sites.add` (PUT) first to create the sc-domain property, then sitemap submit returned 204
- All 4 now show permissionLevel: siteOwner

### Not started because domain not found in GoDaddy API
- stormshelterreviews.com

## Indexing status
- 7 of 8 domains fully verified in Search Console with sitemap submitted
- `stormshelterreviews.com` still blocked by domain-account mismatch
- IndexNow pinged for first 3 domains (pass 1); remaining 4 can be pinged next

## Remaining follow-up
1. Resolve `stormshelterreviews.com` account issue and point DNS if actually purchased
2. Confirm GitHub Pages custom domains are binding cleanly on all resolving sites
3. Submit IndexNow for the 4 newly verified domains
4. Add entity/brand preferences as Mitch requested
