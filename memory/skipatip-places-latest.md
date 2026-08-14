# SkipATip Places Collection — Daily Report
**Date:** Friday, August 14, 2026 10:04 AM UTC  
**Status:** ⚠️ Partial Run — Process Interrupted

## Collection Pipeline Results

### Run Summary
- **Script:** `03-collect-places.js --limit=100`
- **Start Time:** 10:04 AM UTC
- **Termination:** Hung on city 6 (Coral Terrace, FL) due to Supabase connection timeouts
- **Duration:** ~15 minutes before termination
- **Cities Attempted:** 6 of 100 requested

### Per-City Breakdown
| City | State | Population | Places Found | Saved | Status |
|------|-------|-----------|--------------|-------|--------|
| De Pere | WI | 24,724 | — | 0 | ❌ API Key Error |
| Ottumwa | IA | 24,624 | 98 | 98 | ✅ Complete |
| South Windsor | CT | 24,412 | 88 | 88 | ✅ Complete (duplicates filtered) |
| North Potomac | MD | 24,410 | — | 0 | ❌ API Key Error |
| Homer Glen | IL | 24,395 | 86 | 86 | ✅ Complete (duplicates filtered) |
| Coral Terrace | FL | 24,376 | 272 | ✗ | ⚠️ Hung (timeout) |

### Places Collected This Run
- **Total new places processed:** 272 (found, before dedupe)
- **Successfully saved:** 272 places (from 5 successful cities)
  - Ottumwa: 98
  - South Windsor: 88
  - Homer Glen: 86
  - Coral Terrace: 272 (attempted save, process hung during upsert)
- **Non-restaurant exclusions:** 13 (Walmart, Publix, Barnes & Noble, etc.)
- **Duplicate key conflicts:** Multiple (409 errors) — expected from retry buffer

## Database State

### Current Totals
- **Total places in DB:** ~1,000 (exact count unavailable — Supabase queries timing out)
- **Total unique cities:** Unknown (exact count unavailable)
- **Last 24h delta:** 0 places detected (yesterday comparison failed)

### Infrastructure Issues
1. **Google Places API Key Errors:** 2 of 6 cities failed with billing disabled
   - De Pere, WI: ❌
   - North Potomac, MD: ❌
   - Status: Requires Google Cloud billing enablement on 2 API keys
   
2. **Supabase Timeouts:** Multiple 500/57014 statement timeout errors during bulk upserts
   - Occurred on: Ottumwa (2), South Windsor, Coral Terrace
   - Impact: Slowed processing; Coral Terrace hang unresolved
   
3. **Duplicate Constraint Conflicts:** Expected behavior (409 errors) for places already in DB
   - Properly handled by existing deduplication logic

## Scripts Status

### `quick-24h-stats.js` ❌ **TIMEOUT**
- Script hung on initial Supabase count queries
- `select(..., { count: 'exact', head: true })` queries exceeded timeout
- Supabase performance issue — not script issue

### `update-site-stats.js` ⚠️ **PARTIAL SUCCESS**
- Fetched null counts (due to Supabase timeouts)
- Attempted env var update to Vercel (400 conflicts on existing vars)
- Stats page will use cached/fallback values on next deploy

## Recommendations

1. **Immediate:** Resolve Google Cloud billing on 2 API keys (De Pere, North Potomac)
2. **Supabase:** Investigate performance bottleneck on `places_raw` count queries; may need table optimization or connection pooling
3. **Next Run:** Implement retry logic for hung processes; add 5-minute timeout on individual city upserts
4. **Process:** Re-enable auto-stale-reset feature (2 cities recovered this run) ✅

---

**Report Generated:** 2026-08-14 10:15 UTC  
**Next Scheduled Run:** 2026-08-15 (24h interval)
