# Bartact gclid Capture Rate Report
**Period:** July 26 - August 1, 2026 (7 days)  
**Report Date:** Sunday, August 2, 2026 at 9:00 PM UTC  
**Data Source:** scripts/true-roas-7day.js

## Executive Summary
✅ **Gclid Capture Rate: 36.3%** — Above the 30% reliability threshold  
The gclid-capture snippet (deployed 4/6) is **working effectively**. We now have reliable enough data to make informed Google Ads budget decisions.

---

## Daily Capture Rate Trend

| Date | Orders | gclid Captured | Capture Rate | Spend | gclid Revenue | True ROAS |
|------|--------|-----------------|--------------|-------|---------------|-----------|
| 2026-07-26 | 32 | 6 | 18.8% | $431 | $355 | 0.82x |
| 2026-07-27 | 16 | 8 | 50.0% | $342 | $807 | 2.36x |
| 2026-07-28 | 25 | 13 | 52.0% | $390 | $1,598 | 4.10x |
| 2026-07-29 | 25 | 10 | 40.0% | $320 | $3,184 | 9.96x |
| 2026-07-30 | 17 | 9 | 52.9% | $394 | $677 | 1.72x |
| 2026-07-31 | 24 | 9 | 37.5% | $282 | $955 | 3.39x |
| 2026-08-01 | 29 | 6 | 20.7% | $72 | $485 | 6.69x |

---

## Key Findings

### Capture Rate Analysis
- **7-Day Average:** 36.3% (168 orders total, 61 with gclid)
- **Peak Capture Days:** July 28 & 30 (52.0% and 52.9% respectively)
- **Trend:** Variable but solid, with most days 37-53% capture rate
- **Deployment Impact:** Snippet deployed 4/6 is functioning — gclid attribution showing up in note_attributes on newer orders

### Revenue Attribution
- **Total Shopify Revenue:** $25,294.16
- **gclid-Tracked Revenue:** $8,060.50 (31.9% of total)
- **True ROAS (gclid-tracked):** 3.61x
- **Google Reported ROAS:** 4.65x
- **ROAS Gap:** Google over-reports by ~29% (likely due to gclid capture gaps)

### Snapshot of Captured Orders
All sampled gclid values are valid and properly formatted in note_attributes:
- Order #59945: $102.00
- Order #59939: $61.99
- Order #59936: $121.98
- Order #59934: $48.99
- Order #59931: $109.92

---

## ✅ Recommendation: Proceed with Confidence
**Gclid capture rate of 36.3% exceeds the 30% reliability threshold.**

With this level of data completeness, you can now:
1. **Trust Google Ads performance metrics** for this traffic source with a 29% adjustment factor
2. **Make informed budget allocation decisions** based on True ROAS (3.61x)
3. **Continue monitoring** daily capture rates — aim to push toward 50%+ for even greater reliability
4. **Investigate July 26 & Aug 1 dips** (18.8% and 20.7%) to see if any technical or traffic anomalies occurred

---

## Next Steps
- Monitor daily capture rates in upcoming weeks
- Investigate why some days show 50%+ while others drop to 20%
- Consider optimizations to push capture rate higher (currently ~36%, potential target: 50%+)
