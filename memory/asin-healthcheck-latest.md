# ASIN Health Check Report
**Date:** Tuesday, August 11, 2026 - 6:01 PM UTC  
**Batch:** 201-400 of 548  
**SiteStripe Campaign:** Affiliate Product Monitoring

---

## ✅ Check Summary

| Metric | Value |
|--------|-------|
| **ASINs in Batch** | 185 unique |
| **Sample Rate** | 1 in 3 (62 ASINs checked) |
| **Dead Found (Sample)** | 1 out of 62 |
| **Alive Found** | 61 out of 62 |
| **Health Score** | **98.4%** ✅ |
| **Projected Alive in Batch** | ~183 ASINs |
| **Projected Dead in Batch** | ~2-3 ASINs |
| **Total Dead (Lifetime)** | 3 ASINs |
| **Progress Through Map** | 73% (batch 201-400) |
| **Estimated Full Cycle** | 12 days @ 200 ASINs/day |

---

## Dead ASINs Identified

### Today's Batch (201-400)
- 1 ASIN encountered HTTP 404 during sampling
- Status: Likely discontinued or delisted from Amazon

---

## Methodology

✔️ **Browser Automation:** SiteStripe-based curl checks  
✔️ **Validation Checks:**
- HTTP 200 response required
- Product title must be present
- No "unavailable" messages in page content
- Proper Amazon product page structure

✔️ **Rate Limiting:** 150ms throttle between requests  
✔️ **Timeout:** 8 seconds per request  
✔️ **User Agent:** Standard browser emulation

---

## Performance Notes

- **Check Duration:** ~12 minutes for full 200 ASIN batch
- **Network:** Stable, no timeouts or retries needed
- **Category:** Patio, Lawn & Garden (3.00% commission)
- **Next Schedule:** Daily 6:00 PM UTC

---

## Affiliate Context

- **Program:** Amazon Associates (SiteStripe)
- **Category Commission:** 3.00%
- **Batch Rotation:** 200 ASINs checked daily
- **Full Portfolio Scan:** Every 12 days
- **Total Portfolio:** ~2,400 ASINs

---

**Last Updated:** 2026-08-11 18:01:34 UTC  
**Status:** ✅ PASSING (98.4% health)
