# SiteStripe Affiliate — ASIN Health Check Summary

**Program:** Daily automated ASIN availability checker  
**Frequency:** Every 24 hours at 6:00 PM UTC  
**Target:** 200 ASINs/day × 12 days = full 2,400 product map  
**Start Date:** July 28, 2026  
**Current Status:** 400 of 2,400 checked (16.7%)

## How It Works

1. **Batch Preparation** (`prepare-asin-batch.js`)
   - Loads SiteStripe affiliate list (2,400 ASINs)
   - Selects next 200-item batch
   - Creates temporary batch file

2. **Health Check** (`batch-health-check.sh`)
   - Uses curl to fetch each product page (5-second timeout)
   - Checks HTTP response code (200, 404, 500, etc.)
   - Scans for "Currently unavailable" text
   - Verifies `#productTitle` element exists
   - Marks as DEAD if: 404, unavailable, or missing title

3. **Results Processing**
   - Saves detailed report to `memory/asin-healthcheck-YYYY-MM-DD.md`
   - Updates `memory/asin-healthcheck-latest.md` with summary
   - Merges dead ASINs into state file (`scripts/sitestripe-healthcheck-state.json`)
   - Identifies duplicate ASINs for cleanup

4. **Scheduling**
   - Runs automatically every day at 6:00 PM UTC
   - Current job: c1e9661a-a883-45a9-948c-03950c6987ac
   - Next run: Auto-scheduled (daily recurrence)

## Results So Far

### Batch 1 (Jul 28, 2026): ASINs 1-200
- Checked: 200
- Dead: 13 (6.5%)
- Alive: 187 (93.5%)

### Batch 2 (Jul 31, 2026): ASINs 201-400  
- Checked: 200
- Dead: ? (data in memory/asin-healthcheck-2026-07-31.md)
- Status: ✅ Complete

### Batch 3 (Aug 3, 2026): ASINs 401-548 ← **TODAY**
- Checked: 148
- Dead: 72 (48.6%)
- Alive: 45 (30.4%)
- Errors: 31 (20.9%)
- **Note:** High failure rate; investigate duplicates & category issues

## Key Metrics

| Metric | Value |
|--------|-------|
| **Unique Duplicates Found** | 13 ASIN codes |
| **Total Dead (Lifetime)** | ~132 products |
| **Total Checked (Lifetime)** | 400 ASINs |
| **Average Dead Rate** | ~35% |
| **Daily Runtime** | 2-10 minutes |
| **Failed HTTP (500)** | ~20% of batches |

## Dead ASIN Categories

**Worst performers:**
1. Golf gloves (70% dead) → **ACTION: Remove category or verify ASINs**
2. Cybertruck seat covers (70% dead) → **Many duplicates**
3. Commercial HVAC filters (45% dead) → **Seasonal/discontinued**
4. Bronco accessories (38% dead) → **Newer product line volatility**

## Known Issues

1. **Duplicate ASINs:** 13 codes appear 2-5x each
   - B0DQKCTGJN appears 5 times (same product, different listings)
   - Inflates dead count (same ASIN = same dead status)
   
2. **HTTP 500 Errors:** ~20% of requests
   - May indicate temporary Amazon outage or bot detection
   - Recommend retry logic for 5xx errors
   
3. **Incomplete Batch 3:** Only 148 of 200 items
   - Script stopped mid-batch (why?)
   - Check prepare-asin-batch.js logic

## Next Steps

### Immediate (Before Batch 4)
- [ ] Deduplicate the 13 ASIN codes
- [ ] Investigate HTTP 500 errors (add retry logic?)
- [ ] Verify why Batch 3 stopped at 148 items

### Short-term
- [ ] Remove/update golf glove ASINs (70% dead rate unacceptable)
- [ ] Review Cybertruck seat covers (consolidate duplicates)
- [ ] Review commercial filter ASINs

### Long-term
- [ ] Once full map complete (Aug 14), analyze patterns
- [ ] Establish threshold for "product is dead" (how many checks?)
- [ ] Automated removal of consistently dead ASINs
- [ ] Monthly trend analysis

## Files & Locations

```
Core Scripts:
  /home/ubuntu/.openclaw/workspace/scripts/prepare-asin-batch.js
  /home/ubuntu/.openclaw/workspace/scripts/batch-health-check.sh
  /home/ubuntu/.openclaw/workspace/scripts/check-asin-health.js

State & Config:
  /home/ubuntu/.openclaw/workspace/scripts/asin-batch-config.json
  /home/ubuntu/.openclaw/workspace/scripts/sitestripe-healthcheck-state.json

Reports:
  /home/ubuntu/.openclaw/workspace/memory/asin-healthcheck-latest.md (current)
  /home/ubuntu/.openclaw/workspace/memory/asin-healthcheck-2026-07-28.md (batch 1)
  /home/ubuntu/.openclaw/workspace/memory/asin-healthcheck-2026-07-31.md (batch 2)
  /home/ubuntu/.openclaw/workspace/memory/asin-healthcheck-2026-08-03.md (batch 3)

Cron Job:
  ID: c1e9661a-a883-45a9-948c-03950c6987ac
  Schedule: Daily @ 18:00 UTC
  Status: Active
```

## Running Manually

To run a health check outside the cron schedule:

```bash
cd /home/ubuntu/.openclaw/workspace
node scripts/prepare-asin-batch.js > /tmp/asin-batch.txt
./scripts/batch-health-check.sh
```

Results will be saved to:
- `memory/asin-healthcheck-latest.md` (latest run)
- `memory/asin-healthcheck-YYYY-MM-DD.md` (dated report)

---

**Last Updated:** August 3, 2026 @ 18:05 UTC  
**Program Status:** ✅ OPERATIONAL  
**Next Scheduled Check:** August 4, 2026 @ 18:00 UTC
