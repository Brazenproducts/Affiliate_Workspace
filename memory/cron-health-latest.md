# Cron Health Report

**Generated:** Thursday, August 13th, 2026 - 3:00 PM (UTC)  
**Report Time:** 2026-08-13 15:00 UTC

## Summary

- **Total Jobs:** 86
- **Healthy (ok):** 72
- **Skipped:** 7
- **Running:** 2
- **Idle:** 3
- **Error:** 6

## Broken Jobs (Status: error)

### 1. Bull Strap Priority Customers Check
- **Job ID:** `4e55f402-458a-411d-b9b6-e7030fc1110d`
- **Status:** error
- **Schedule:** every 15m
- **Last Run:** 9m ago
- **Agent:** main
- **Target:** isolated
- **Delivery:** not requested

### 2. weekly-content-engine
- **Job ID:** `276e8dd6-acd2-4b98-bc5c-85a378437aa4`
- **Status:** error
- **Schedule:** cron 0 6 * * 0 @ UTC (exact)
- **Last Run:** 4d ago
- **Agent:** main
- **Target:** isolated
- **Delivery:** not requested

### 3. Gclid capture rate check
- **Job ID:** `fc95f4b4-1011-4f07-80ae-7a9a7b9c0bcd`
- **Status:** error
- **Schedule:** cron 0 14 * * 0 @ America/Los_Angeles
- **Last Run:** 4d ago
- **Agent:** main
- **Target:** isolated
- **Delivery:** telegram:openclaw-control-ui

### 4. SEO Discoveries — Monday
- **Job ID:** `c7a1278d-565b-465a-8eec-7cc3be228405`
- **Status:** error
- **Schedule:** cron 0 5 * * 1 @ America/Los_Angeles
- **Last Run:** 3d ago
- **Agent:** slashdaddy
- **Target:** isolated
- **Delivery:** not requested

### 5. Affiliate Network Indexing Tool
- **Job ID:** `c5ef1a45-997d-4fb1-9e22-751dde54b355`
- **Status:** error
- **Schedule:** cron 0 11 * * 2 @ UTC (exact)
- **Last Run:** 2d ago
- **Agent:** main
- **Target:** isolated
- **Delivery:** telegram:openclaw-control-ui

### 6. Bartact SEO pages — Google Updates & Rankings
- **Job ID:** `dfe38a26-a60a-40b6-bc78-ee05cf88c6a8`
- **Status:** error
- **Schedule:** cron 0 7 14 7 * @ America/Los_Angeles
- **Last Run:** 30d ago
- **Agent:** main
- **Target:** isolated
- **Delivery:** telegram:7550065844

## Status Notes

- **Running jobs:** 2 currently executing (Cron Health Monitor and Affiliate Daily Health Check)
- **Idle jobs:** 3 scheduled for future execution with no recent runs
- **Skipped jobs:** 7 jobs marked as skipped (misconfigured or intentionally disabled)

## Next Steps

⚠️ **No automatic fixes applied.** These broken jobs should be reviewed manually for:
1. Agent/model availability
2. External API failures or rate limits
3. Configuration issues in payload or delivery settings
4. Missing or expired credentials

### Recommended Actions

1. Review error details for each broken job (details not accessible in this restricted cron context)
2. Check agent logs for the affected agents (main, slashdaddy)
3. Verify external dependencies (APIs, webhooks, databases)
4. Consider disabling or updating jobs that are no longer needed
5. For recurring failures, consider reducing frequency or adding retry logic
