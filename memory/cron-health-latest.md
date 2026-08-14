# Cron Health Report
**Generated:** Friday, August 14th, 2026 - 3:03 PM (UTC)

## Summary
- **Total Jobs:** 66
- **Healthy Jobs:** 57
- **Broken Jobs:** 5
- **Skipped Jobs:** 4

## Jobs with Error Status

### 1. weekly-content-engine
- **ID:** 276e8dd6-acd2-4b98-bc5c-85a378437aa4
- **Status:** error
- **Schedule:** cron 0 6 * * 0 @ UTC (exact)
- **Last Run:** 5d ago
- **Agent:** main
- **Delivery:** not requested (not requested)
- **Note:** Weekly job failing as of 5 days ago

### 2. Gclid capture rate checker
- **ID:** fc95f4b4-1011-4f07-80ae-7a9a7b9c0bcd
- **Status:** error
- **Schedule:** cron 0 14 * * 0 @ America/Los_Angeles
- **Last Run:** 5d ago
- **Agent:** main
- **Delivery:** none -> telegram:openclaw-control-ui (explicit)
- **Note:** Weekly job failing as of 5 days ago

### 3. SEO Discoveries — Monday
- **ID:** c7a1278d-565b-465a-8eec-7cc3be228405
- **Status:** error
- **Schedule:** cron 0 5 * * 1 @ America/Los_Angeles
- **Last Run:** 4d ago
- **Agent:** slashdaddy
- **Delivery:** not requested (not requested)
- **Note:** Weekly job failing as of 4 days ago

### 4. Affiliate Network Indexing
- **ID:** c5ef1a45-997d-4fb1-9e22-751dde54b355
- **Status:** error
- **Schedule:** cron 0 11 * * 2 @ UTC (exact)
- **Last Run:** 3d ago
- **Agent:** main
- **Delivery:** none -> telegram:openclaw-control-ui (explicit)
- **Note:** Weekly job failing as of 3 days ago

### 5. Bartact SEO pages — Google Ads report
- **ID:** dfe38a26-a60a-40b6-bc78-ee05cf88c6a8
- **Status:** error
- **Schedule:** cron 0 7 14 7 * @ America/Los_Angeles
- **Last Run:** 31d ago
- **Agent:** main
- **Delivery:** announce -> telegram:7550065844 (explicit)
- **Note:** Monthly job failing as of 31 days ago (longest-running failure)

## Skipped Jobs (Not in Error State)
1. Daily Amazon Associate Affiliate Promotion
2. Reminder: High-Commission Affiliate Strategies
3. Bartact Daily Blog Post (duplicate; one is skipped)
4. SiteStripe daily health check
5. Weekly Amazon Seller Health Check
6. Monthly Bartact Negative Keyword Audit

## Recommendations
- **Immediate attention:** Jobs broken 3+ days should be reviewed
- **Use `openclaw cron runs <job-id>`** to view full run history and error messages
- **Check connectivity/credentials** for Telegram delivery failures
- **Review log output** for each failing job to understand root cause

---
**Note:** This report is read-only. Use `openclaw cron runs <job-id>` or the web dashboard to investigate failures in detail.
