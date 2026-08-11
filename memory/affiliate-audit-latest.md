# Affiliate Site Audit — 2026-08-11 14:00 UTC

**Status:** ⚠️ WATCH (4 down, same critical tracking issues)

## Quick Metrics
- Down sites: **4** (threshold: 10) ✅
- Invalid tracking IDs: **9** (threshold: unbounded)
- Missing affiliate tags: **1** (threshold: 20) ✅
- Sites with zero links: **13** (up 1 from yesterday)

## 24-Hour Comparison
| Metric | Today | Yesterday | Change |
|--------|-------|-----------|--------|
| Down sites | 4 | 8 | ✅ -4 |
| Invalid tracking IDs | 9 | 9 | — No change |
| Missing tags | 1 | 1 | — No change |
| Zero affiliate links | 13 | 12 | ⚠️ +1 |

**Assessment:** No critical thresholds exceeded. Down sites actually improved (8→4). Same tracking ID issues persist from previous days — need to fix these 9 sites' tag assignments.

## New Issues Since Yesterday
- **Missing links added:** 4runnerseats.com (was not listed yesterday)

## Resolved Issues Since Yesterday
- **Down sites fixed:** customizedhatusa.com, redisupplies.com, nutsboltsusa.com, redigloves.com, topmassagegun.com, bestofficefilter-com, handimasks.com, steritol.com (8 total recovered)

## Currently Down (4 sites)
1. tbargear.com (HTTP 000000)
2. governmentemergencyhousing.com (HTTP 000000)
3. cleanbuttle.com (HTTP 000000)
4. footrubbers.com (HTTP 000000)

## Critical Issues (Persistent)
These 9 sites have **invalid tracking tags** and need immediate fixing:
1. bestgaming-chair.com (tag=brazenprodu02-20-gamingchair)
2. bestheating-pad.com (tag=brazenprodu02-20-heatingpad)
3. bestice-maker.com (tag=brazenprodu02-20-icemaker)
4. bestlabel-maker.com (tag=brazenprodu02-20-labelmaker)
5. bestmagnesiumglycinate.com (tag=brazenprodu01-20-magnesium)
6. bestnecklifttape.com (tag=brazenprodu01-20-necklift)
7. bestportable-ac.com (tag=brazenprodu02-20-portableac)
8. bestpower-bank.com (tag=brazenprodu02-20-powerbank)
9. bestshower-head.com (tag=brazenprodu02-20-showerhead)

**Fix:** These tags should be one of the valid base tags (brazenprodu01-20 through brazenprodu13-20) without the product suffix. The script expects tags from memory/tracking-id-redistribution-report.json.

## Sites Missing Affiliate Links Entirely (13 total)
- 4runnerseats.com (NEW)
- bestprotein-powder.com
- factorfilters.com
- faithfulpassages.com
- indexing-credentials
- limitstraps.com
- rangewolf-com
- stratratchets.com
- truckdubai.com
- truckuae.com
- whatsizehvacfilter.com
- wholehouseairfilter.com
- wranglerseat.com

## HTTPS Issues (244 sites)
- HTTPS valid: 480
- HTTPS broken/missing: 244

Large number of sites with *.github.io or missing certs. These are GitHub Pages deployments that may need custom domain SSL setup.

## Blog Rotation Status
- Fresh (posted last 24h): **125 sites** ✅
- Stale (no post in 24h+): **20 sites** ⚠️

## Full Report
See `/tmp/affiliate-audit-2026-08-11.txt` for complete details.
