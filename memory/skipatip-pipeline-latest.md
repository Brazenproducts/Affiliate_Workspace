# SkipATip Pipeline — Last Run

**Date:** Monday, July 27, 2026 — 3:00–3:10 AM UTC  
**Run Duration:** ~10 minutes (591 seconds)

## 📊 Statistics

| Metric | Total | 24h Delta |
|--------|-------|-----------|
| **Places** | 430,605 | +66,371 ✅ |
| **Reviews** | 122,317 | +246 places synced ✅ |
| **Unique Cities** | 12 | — |

## 📍 Pipeline Steps

1. **03-collect-places.js** — ✅ COMPLETE
   - Cities processed: 20
   - Places collected this run: 4,089
   - API requests: 20 (balanced across 3 keys: 7, 7, 6)
   - Duplicates: ~50–60 (409 errors, already in DB)
   - Status: All 20 cities successfully processed

2. **04-collect-reviews.js** — ⚠️ PARTIAL
   - Started with 50 places in review queue
   - Processed: 2 places before interruption
   - Status: Process terminated (SIGTERM)
   - Note: Database upsert errors on duplicate google_place_id constraints

## 🟢 Health Status

✅ **Data collection is ACTIVE** — significant 24h growth (66K+ new places)  
✅ **No critical errors** — duplicate key errors are expected & benign  
⚠️ **Review sync incomplete** — reviews step interrupted after 2/50 places

## Next Steps

- Resume reviews collection (04) when pipeline runs again
- Consider implementing de-duplication filter on initial place fetch to reduce 409 errors
- Monitor for sustained growth patterns

---

*Pipeline runs nightly at 03:00 UTC. Last run: 2026-07-27 03:00:18Z*
