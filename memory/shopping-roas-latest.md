# Shopping ROAS Monitor - 2026-08-06 10:00 UTC

**Status:** ⚠️ API ERROR

## Run Details
- **Timestamp:** Thursday, August 6th, 2026 - 10:00 AM UTC
- **Checked Date:** 2026-08-05 (yesterday)
- **Alert Threshold:** ROAS < 2.0x | Budget: $250/day

## Result
❌ **Unable to retrieve data** — Google Ads API error 404

### Error Details
- Script tried to fetch Shopping campaign data via Google Ads API v19 → failed, retried v23
- API returned: `404 Not Found` on `/v23/customers/1770651698/googleAds:search`
- Authentication confirmed as working (✅ Auth: OK)

### Possible Causes
1. Invalid API endpoint version (v19/v23 mismatch)
2. Customer ID mismatch (1770651698)
3. API credentials have expired or lack proper scope
4. Google Ads API service outage

## Action Required
- Verify Google Ads API credentials and scopes
- Check if customer ID is correct for the Bartact Shopping account
- Confirm API version compatibility with current Google Ads API

## Escalation
**No message to Mitch** — This is an infrastructure issue, not a ROAS problem. Will retry on next run.

---
_Last checked: 2026-08-06 10:00 UTC_
