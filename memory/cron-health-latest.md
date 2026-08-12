# Cron Health Report
**Generated:** Wednesday, August 12th, 2026 - 3:01 AM (UTC)

## Summary
- **Total Jobs:** 92
- **Healthy (ok/idle/skipped):** 81
- **Broken (error):** 11

---

## Broken Jobs (Error Status)

### 1. Bull Strap Inventory Management (ID: aeaef431-f849-4d2a-bd25-fccd32dc3134)
- **Schedule:** every 1h
- **Last Run:** 5m ago
- **Status:** error
- **Target:** isolated
- **Agent ID:** main

### 2. SkipATip — nightly verification (ID: 2ba22e5a-7b74-4a40-9281-d0918f24b9ab)
- **Schedule:** cron 0 6 * * * @ UTC
- **Last Run:** 6h ago
- **Status:** error
- **Target:** isolated
- **Agent ID:** main

### 3. affiliate-indexnow-ping (ID: 54b4be62-228d-44e5-96af-957dd11ea4bd)
- **Schedule:** cron 0 8 * * 1,3,5 @ America/...
- **Last Run:** 2d ago
- **Status:** error
- **Target:** isolated
- **Agent ID:** main
- **Delivery:** telegram:openclaw-control-ui (explicit)

### 4. Bartact SEO content analysis (ID: d9d63f5d-8d7a-4a27-a50e-42052e7c7880)
- **Schedule:** cron 0 10 * * 1,4 @ America/New_York
- **Last Run:** 2d ago
- **Status:** error
- **Target:** isolated
- **Agent ID:** main

### 5. weekly-content-engine (ID: 276e8dd6-acd2-4b98-bc5c-85a378437aa4)
- **Schedule:** cron 0 6 * * 0 @ UTC
- **Last Run:** 3d ago
- **Status:** error
- **Target:** isolated
- **Agent ID:** main

### 6. Gclid capture rate check (ID: fc95f4b4-1011-4f07-80ae-7a9a7b9c0bcd)
- **Schedule:** cron 0 14 * * 0 @ America/Los_Angeles
- **Last Run:** 2d ago
- **Status:** error
- **Target:** isolated
- **Delivery:** telegram:openclaw-control-ui (explicit)
- **Agent ID:** main

### 7. SEO Discoveries — Monday (ID: c7a1278d-565b-465a-8eec-7cc3be228405)
- **Schedule:** cron 0 5 * * 1 @ America/Los_Angeles
- **Last Run:** 2d ago
- **Status:** error
- **Target:** isolated
- **Agent ID:** slashdaddy

### 8. Affiliate Network Indexing (ID: c5ef1a45-997d-4fb1-9e22-751dde54b355)
- **Schedule:** cron 0 11 * * 2 @ UTC
- **Last Run:** 16h ago
- **Status:** error
- **Target:** isolated
- **Delivery:** telegram:openclaw-control-ui (explicit)
- **Agent ID:** main

### 9. Bartact SEO pages — Google Indexing (ID: dfe38a26-a60a-40b6-bc78-ee05cf88c6a8)
- **Schedule:** cron 0 7 14 7 * @ America/Los_Angeles
- **Last Run:** 29d ago
- **Status:** error
- **Target:** isolated
- **Delivery:** telegram:7550065844 (explicit)
- **Agent ID:** main

---

## Status Breakdown

| Status | Count |
|--------|-------|
| ok | 55 |
| error | 11 |
| idle | 5 |
| running | 5 |
| skipped | 12 |
| **TOTAL** | **92** |

---

## Notes

- **Most recent error:** Bull Strap Inventory Management (5m ago) — running every 1h
- **Oldest unresolved error:** Bartact SEO pages job (29 days ago, July 14th run date)
- **High-frequency error:** affiliate-indexnow-ping has been failing for 2+ days
- Error details (consecutive failures, specific error messages) cannot be retrieved in isolated cron context due to tool restrictions

**Recommendation:** Review error logs via `openclaw cron get <jobId>` or contact support for detailed error messages on these 11 jobs.
