# Bull Strap Merchant Center Check - 2026-07-29

**Date:** Wednesday, July 29, 2026 - 2:06 PM (UTC)
**Generated:** 2026-07-29T14:06:43.243Z

## Execution Summary

### Script 1: bullstrap-merchant-center-daily.js
✓ **COMPLETED** (Exit code 1 - Alert condition)
- Credentials loaded successfully
- OAuth access token obtained
- Merchant Center API returned 404 (no data available)
- Google Search Console 404 errors: 0

### Script 2: bullstrap-mc-landing-cleanup.js
✗ **FAILED** (Module not found)
- Error: Cannot find module at `/home/ubuntu/.openclaw/workspace/scripts/bullstrap-mc-landing-cleanup.js`
- This script does not exist in the scripts directory

## Performance Metrics

| Metric | Value |
|--------|-------|
| ROAS | 0.00x ⚠️ ALERT |
| Revenue | $0.00 |
| Spend | $0.00 |
| Clicks | 0 |
| Impressions | 0 |
| 404 Errors | 0 ✓ |

## Alerts

⚠️ **LOW ROAS ALERT**: ROAS is 0.00x (below 2x threshold)

## Status Breakdown

- **Approved Count:** Not reported (API returned 404)
- **Disapproved Count:** Not reported (API returned 404)
- **Landing Page Errors Found:** 0
- **Landing Page Errors Removed:** N/A (cleanup script missing)
- **Auth Issues:** None detected in script 1

## Notes

- Merchant Center API is returning 404, indicating either the account is not connected or there's an API configuration issue
- No auth errors encountered
- 404 errors in Google Search Console are minimal (0)
- Cleanup script needs to be created or path corrected for future runs
