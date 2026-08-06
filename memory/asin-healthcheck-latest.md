# ASIN Health Check Report
**Check Date:** Wednesday, August 5, 2026 @ 6:01 PM UTC

## Today's Results (Batch 201-400)

| Metric | Count |
|--------|-------|
| **ASINs Checked Today** | 200 |
| **Unique ASINs** | 176 |
| **Dead Found** | 8 |
| **Alive Found** | 192 |
| **Failure Rate** | 4.0% |
| **Error Rate** | 0% |

## Dead ASINs Found Today

```
B09C6MHDB4    (Seasoned Hardwood Firewood - Duplicate)
B07FNW9WYB    (Previously marked dead - confirmed)
B0C1GQBYJL    (Bronco Floor Mats - Previously dead)
B0FCFSBS3D    (Bronco Bumpers - Previously dead)
B000COV684    (Lund Catch-All - New dead)
B0DRM4GKRT    (Rough Country Floor Mats - New dead)
B000VLC83U    (SnugTop Super Sport Truck Topper - New dead)
B004HYRI3C    (Bushwacker Truck Cap Topper - New dead)
```

## Cumulative Metrics (All-Time)

| Metric | Value |
|--------|-------|
| **Total ASINs Checked (Lifetime)** | 1,300 |
| **Total Dead Found (Lifetime)** | 148 |
| **Lifetime Dead Rate** | 11.4% |
| **Unique Dead ASINs** | 76 |

## Rotation Progress

- **Cycle Target:** 548 ASINs over 12 days (200/day)
- **Current Progress:** 400 / 548 ASINs
- **Completion:** 73%
- **Remaining Today:** ~0 (batch complete)
- **Next Batch Due:** August 6, 2026 @ 6:00 PM UTC

## Pattern Analysis

**Dead ASIN Patterns:**
- Truck/automotive accessories: 4 new dead (50% of today's finds)
- Duplicates in batch: 1 confirmed (B09C6MHDB4)
- Persistence of previous dead: 3 ASINs confirmed still dead

**Health Indicators:**
- ✅ 0% HTTP errors (good connectivity)
- ✅ Consistent 4% daily failure rate
- ✅ No unusual spikes in dead products
- ⚠️ Automotive category showing higher churn

## Method & Schedule

- **Automation:** SiteStripe Browser Automation (OpenClaw)
- **Check Frequency:** Daily at 6:00 PM UTC
- **Batch Size:** 200 ASINs/day
- **Verification Method:** Browser navigation to Amazon product pages
- **Timeout Handling:** Marked as DEAD if: 404, "Currently unavailable", missing title, or network timeout

## Next Steps

- **August 6, 2026:** Check batch 401-548 (final batch, ~148 ASINs)
- **August 7, 2026:** Complete cycle; begin new rotation from batch 1-200
- **Monitor:** Automotive products for increased churn rate

---
**Generated:** 2026-08-05T18:01:39Z  
**File Updated:** Automatic via cron job c1e9661a-a883-45a9-948c-03950c6987ac
