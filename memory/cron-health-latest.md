# Cron Health Report
**Generated:** Thursday, August 6th, 2026 - 3:00 AM UTC

## Summary
- **Total Jobs:** 69
- **Healthy Jobs:** 66
- **Broken Jobs:** 3

## Job Status Breakdown
- ✅ OK: 50
- ⏳ Running: 1
- ⏭️ Skipped: 9
- ❌ Error: 3
- 🔄 Idle: 1

---

## Broken Jobs (Error Status)

### 1. Daily Affiliate Site Audit
- **ID:** `e7dfeb15-d657-404d-a495-0c0cac906f1e`
- **Status:** ❌ Error
- **Schedule:** `0 7 * * * @ America/Los_Angeles` (Daily at 7 AM PT)
- **Last Run:** 12 hours ago (failed)
- **Duration:** 212,217 ms (~3.5 minutes)
- **Consecutive Errors:** 1
- **Error Message:** 
  ```
  ⚠️ ⏰ Cron: `Daily Affiliate Site Audit with Critical Alerting` failed
  ```
- **Error Details:** Generic failure diagnostic (insufficient logging to diagnose root cause)
- **Description:** Audits 370 affiliate sites for broken tags, dead links, down sites, and search-only links

---

### 2. Weekly Non-Brand SEO Audit — Bartact
- **ID:** `7c9789a8-319d-4ae6-b1ef-62d20b894857`
- **Status:** ❌ Error
- **Schedule:** `0 17 * * 1 @ UTC` (Mondays at 5 PM UTC)
- **Last Run:** 2 days ago (failed)
- **Duration:** 36,575 ms (~36 seconds)
- **Consecutive Errors:** 1
- **Error Message:** 
  ```
  ⚠️ ⏰ Cron failed
  ```
- **Error Details:** Generic failure diagnostic (insufficient logging)
- **Description:** Weekly Bartact SEO audit using Node.js script

---

### 3. Bartact SEO pages — Google Indexing Submit
- **ID:** `dfe38a26-a60a-40b6-bc78-ee05cf88c6a8`
- **Status:** ❌ Error
- **Schedule:** `0 7 14 7 * @ America/Los_Angeles` (July 14th at 7 AM PT — yearly)
- **Last Run:** 23 days ago (failed)
- **Duration:** 140 ms (failed at preflight check)
- **Consecutive Errors:** 1
- **Error Message:** 
  ```
  cron payload.model 'myclaw/claude-haiku-4.5' rejected by agents.defaults.models allowlist
  ```
- **Error Details:** **Configuration Error** — Job specifies invalid model `myclaw/claude-haiku-4.5`
  - Rejected by agents.defaults.models allowlist
  - Valid models: 
    - anthropic/claude-haiku-4-5-20251001
    - anthropic/claude-sonnet-4-5-20250929
    - anthropic/claude-sonnet-4-6
    - myclaw/MiniMax-M3, myclaw/Qwen3.7-max, myclaw/Qwen3.7-plus
    - myclaw/gemini-3-flash, myclaw/gemini-3-pro, myclaw/gemini-3.1-pro
    - myclaw/gpt-5.1 through myclaw/gpt-5.4-mini
    - myclaw/kimi-k2.5, myclaw/minimax-m2.5, myclaw/minimax-m2.7
- **Description:** Submits Bartact collection URLs to Google Indexing API

---

## Recommendations (No Auto-Fix Performed)

1. **Daily Affiliate Site Audit** — Requires debugging:
   - Check if `/home/ubuntu/.openclaw/workspace/scripts/daily-affiliate-audit.sh` exists and is executable
   - Run manually to see actual error output
   - Check memory files for previous audit results

2. **Weekly Non-Brand SEO Audit** — Requires debugging:
   - Check if `/home/ubuntu/.openclaw/workspace/scripts/bartact-seo-audit-weekly.js` exists
   - Verify Google Ads credentials at `.google-ads-credentials.json`
   - Run script manually to diagnose

3. **Bartact SEO pages Google Indexing Submit** — **Actionable Fix**:
   - Update job to use a valid model (e.g., `anthropic/claude-haiku-4-5-20251001` or `anthropic/claude-sonnet-4-6`)
   - This is a configuration issue, not a runtime failure
   - Job scheduled for July 14, 2026 (already passed; next run: July 14, 2027)

---

**Report Status:** Health check complete. No automatic remediation performed per instructions.
