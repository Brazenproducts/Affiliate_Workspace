# Affiliate Site Audit — 2026-08-12 14:00 UTC

**Status:** ⚠️ WATCH (6 down, 3 critical tracking tags missing)

## Quick Metrics
- Down sites: **6** (threshold: 10) ✅
- Invalid tracking ID format: **9** (persistent issue)
- Missing tracking tags entirely: **3** (NEW)
- Missing affiliate links: **14** (threshold: 20) ✅
- Blog posts fresh (24h): **250** ✅
- Blog posts stale (24h+): **20** ⚠️

## 24-Hour Comparison
| Metric | Today | Yesterday | Change |
|--------|-------|-----------|--------|
| Down sites | 6 | 4 | ⚠️ +2 |
| Invalid tracking IDs | 9 | 9 | — No change |
| Missing tracking tags | 3 | 0 | 🚨 +3 NEW |
| Missing affiliate links | 14 | 13 | ⚠️ +1 |
| Fresh blog posts | 250 | 125 | ✅ +125 |
| Stale blog posts | 20 | 20 | — No change |
| HTTPS valid | 480 | 480 | — No change |
| HTTPS broken/missing | 243 | 244 | ✅ -1 |

**Assessment:** No critical thresholds exceeded. Down sites increased by 2 (4→6), but still well below threshold of 10. Fresh blog rotation improved significantly (+125 new posts in 24h). Three new sites missing tracking tags entirely — these need immediate tagging.

## Currently Down (6 sites)
1. besthvacfilter-com (HTTP 000000)
2. topespressomaker.com (HTTP 000000)
3. stagaftermaket.com (HTTP 000000)
4. garrisonhats.com (HTTP 000000)
5. privatelabelhats.com (HTTP 000000)
6. customizedhatusa.com (HTTP 404)

## 🚨 Critical Issues

### Missing Tracking Tags (NEW — 3 sites)
These sites have **NO tracking tag at all** and need immediate assignment:
1. broncocage.com
2. broncorollbar.com
3. whatarebest.com

### Invalid Tracking Tags (PERSISTENT — 9 sites)
These sites have **malformed tracking tags** (product suffixes) that need fixing:
1. bestgaming-chair.com (tag=brazenprodu02-20-gamingchair) → should be brazenprodu02-20
2. bestheating-pad.com (tag=brazenprodu02-20-heatingpad) → should be brazenprodu02-20
3. bestice-maker.com (tag=brazenprodu02-20-icemaker) → should be brazenprodu02-20
4. bestlabel-maker.com (tag=brazenprodu02-20-labelmaker) → should be brazenprodu02-20
5. bestmagnesiumglycinate.com (tag=brazenprodu01-20-magnesium) → should be brazenprodu01-20
6. bestnecklifttape.com (tag=brazenprodu01-20-necklift) → should be brazenprodu01-20
7. bestportable-ac.com (tag=brazenprodu02-20-portableac) → should be brazenprodu02-20
8. bestpower-bank.com (tag=brazenprodu02-20-powerbank) → should be brazenprodu02-20
9. bestshower-head.com (tag=brazenprodu02-20-showerhead) → should be brazenprodu02-20

**Fix required:** Remove product suffixes from all tags. Use valid base tags only.

### Sites Missing Affiliate Links (14 total)
- 4runnerseats.com
- bowtiefilter.com (NEW)
- broncointerior.com (NEW)
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

## HTTPS Status
- HTTPS valid: **480** ✅
- HTTPS broken/missing: **243** (was 244, -1 improvement)
- Main issue: 243 sites with *.github.io certs or missing certs (GitHub Pages deployments needing custom SSL)

## Blog Rotation Status
- Fresh (posted last 24h): **250 sites** ✅ (+125 from yesterday)
- Stale (no post in 24h+): **20 sites** ⚠️

Excellent improvement in fresh content — most sites are maintaining daily blog rotation.

## Overall Portfolio Stats
- Total affiliate sites: **723**
- Direct product links (/dp/): **55,155** ✅
- Search links (/s?k=): **556** (minimal)
- Search-to-product ratio: **0%** (good — relying on direct ASINs)

## Action Items (Priority)
1. **URGENT:** Assign tracking tags to 3 new sites (broncocage.com, broncorollbar.com, whatarebest.com)
2. **HIGH:** Fix 9 sites with malformed tracking tags (remove product suffixes)
3. **MEDIUM:** Investigate and restore 2 newly down sites (besthvacfilter-com, topespressomaker.com)
4. **MEDIUM:** Add affiliate links to 2 new sites (bowtiefilter.com, broncointerior.com)
5. **LOW:** Enable HTTPS for 243 GitHub Pages sites (custom domains + SSL certificates)

## Full Report
Complete technical details: `/tmp/affiliate-audit-2026-08-12.txt`
