# Daily Affiliate Audit Log — 2026-08-06 06:00 UTC

## Execution Details
- **Time:** 2026-08-06 06:00 UTC (Thursday)
- **Type:** Automated daily cron job (9a43876c-dfde-41e2-8b70-aefef1ce5848)
- **Script:** bash /home/ubuntu/.openclaw/workspace/scripts/daily-affiliate-audit.sh
- **Duration:** ~2 minutes (completed successfully)

## Audit Results Summary

### Critical Threshold Status: ✅ ALL CLEAR (sites down < 10)

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Sites DOWN | 4 | > 10 | ✅ PASS |
| Invalid tracking IDs | 9 | — | ⚠️ KNOWN |
| Missing tracking tag | 1 | — | 🚨 ACTION NEEDED |

**Action Taken:** No critical alert needed. No Telegram message sent (4 sites down < 10 threshold).

### Key Metrics

| Metric | Today | Yesterday | Change |
|--------|-------|-----------|--------|
| Total affiliate sites | 722 | 724 | -2 |
| Direct product links (/dp/) | 60,584 | 60,180 | +404 (↑0.7%) |
| Search links | 573 | 573 | — |
| Sites down (spot check 20) | 4 | 5 | -1 (↓ recovering) |
| Invalid tracking IDs | 9 | 9 | — (unchanged) |
| Missing tracking tag | 1 | 1 | — (unchanged) |
| Blog posts fresh (24h) | 0 | 250 | ⚠️ BLOG GENERATOR DOWN |
| HTTPS broken | 247 | — | ⚠️ Many *.github.io certs |
| No affiliate links | 12 | 11 | +1 |

### Down Sites (4 total — spot check of 20 random)
1. saltonpepper.com (HTTP 000000)
2. filtersizes-com (HTTP 000000)
3. garrisonhats.com (HTTP 000000)
4. storagesleeve.com (HTTP 000000)

*Note: Yesterday's 5 down sites included shoerubber.com, rangewolf.com, palletrackstraps.com, bestweightedvest.com, hvachomefilters-com — different rotation in today's random sample.*

### Issues Requiring Action

#### 🚨 Urgent (1 site)
- **whatarebest.com** — Missing tracking tag entirely (revenue loss, unchanged from yesterday)

#### ⚠️ Critical (9 sites) — Invalid tracking IDs (non-standard format)
- bestgaming-chair.com (brazenprodu02-20-gamingchair)
- bestheating-pad.com (brazenprodu02-20-heatingpad)
- bestice-maker.com (brazenprodu02-20-icemaker)
- bestlabel-maker.com (brazenprodu02-20-labelmaker)
- bestmagnesiumglycinate.com (brazenprodu01-20-magnesium)
- bestnecklifttape.com (brazenprodu01-20-necklift)
- bestportable-ac.com (brazenprodu02-20-portableac)
- bestpower-bank.com (brazenprodu02-20-powerbank)
- bestshower-head.com (brazenprodu02-20-showerhead)

#### ⚠️ Blog Generator Alert
- 0 fresh posts in last 24h (vs 250 yesterday)
- 20 stale sites
- Blog generator may be down or rotation file stale

#### 📋 Zero Links (12 sites)
- bestprotein-powder.com, factorfilters.com, faithfulpassages.com, indexing-credentials
- limitstraps.com, rangewolf-com, stratratchets.com, truckdubai.com, truckuae.com
- whatsizehvacfilter.com, wholehouseairfilter.com, wranglerseat.com

## Dashboard Rebuild
- ✅ `/tmp/axl-dashboard-new.html` — rebuilt with today's stats
- ✅ Pushed to GitHub: `Brazenproducts/axl-dashboard` → commit `e1e87fc` "Daily audit rebuild"
- Updated: last updated date (2026-08-06), audit note (722 sites, 60,584 links, 4 down, 9 invalid tags)

## Output Files
- Raw report: `/tmp/affiliate-audit-2026-08-06.txt`
- This log: `/home/ubuntu/.openclaw/workspace/memory/2026-08-06-affiliate-audit.md`

## Next Actions
1. **Immediate:** Add tracking tag to whatarebest.com
2. **Soon:** Fix 9 sites with invalid tracking ID formats (strip product suffixes)
3. **Investigate:** Blog generator — why 0 fresh posts today vs 250 yesterday
4. **Monitor:** 247 sites showing *.github.io cert (DNS propagation issue for custom domains)

---
**Status:** ✅ Complete — Under threshold (4 down < 10), no critical alert sent.
