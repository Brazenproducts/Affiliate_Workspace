# Cron Health Report
**Generated:** Thursday, August 13, 2026 at 3:00 AM UTC

## Summary
- **Total Jobs:** 77
- **Healthy Jobs:** 68
- **Broken Jobs:** 6
- **Skipped Jobs:** 3

## Broken Jobs (consecutiveErrors > 0)

### 1. **Bartact SEO content audit**
- **ID:** `d9d63f5d-8d7a-4a27-a50e-42052e7c7880`
- **Schedule:** Every Monday/Thursday at 10 AM (America/New_York)
- **Last Run:** 3 days ago (2026-08-10)
- **Status:** `error` (1 consecutive error)
- **Error Type:** Model configuration failure
- **Details:**
  - Primary model `anthropic/claude-haiku-4-5` is unknown/unregistered in provider config
  - Fallback model `anthropic/claude-sonnet-4-6` also failed: auth expired or no API key found
  - Requires: Either register the model or re-authenticate with `openclaw models auth login --provider anthropic --force`

---

### 2. **weekly-content-engine**
- **ID:** `276e8dd6-acd2-4b98-bc5c-85a378437aa4`
- **Schedule:** Every Sunday at 6 AM (UTC)
- **Last Run:** 6 days ago (2026-08-07)
- **Status:** `error` (1 consecutive error)
- **Error Type:** Model not registered
- **Details:**
  - Model `anthropic/claude-haiku-4-5` is not registered in `models.providers[anthropic].models[]`
  - No fallback available (same model listed as fallback)
  - Requires: Add `{ "id": "claude-haiku-4-5" }` to Anthropic provider models config

---

### 3. **Gclid capture rate check - weekly**
- **ID:** `fc95f4b4-1011-4f07-80ae-7a9a7b9c0bcd`
- **Schedule:** Every Sunday at 2 PM (America/Los_Angeles)
- **Last Run:** 7 days ago (2026-08-06)
- **Status:** `error` (1 consecutive error)
- **Error Type:** Model not registered
- **Details:**
  - Model `anthropic/claude-haiku-4-5` unknown/unregistered
  - No valid fallback
  - Same root cause as jobs #1 and #2

---

### 4. **SEO Discoveries — Monday 5am PST**
- **ID:** `c7a1278d-565b-465a-8eec-7cc3be228405`
- **Schedule:** Every Monday at 5 AM (America/Los_Angeles)
- **Last Run:** 3 days ago (2026-08-10)
- **Status:** `error` (1 consecutive error)
- **Error Type:** Message delivery failure
- **Details:**
  - Job ran successfully (duration: 178.2 seconds)
  - Failed at final delivery step: `⚠️ ✉️ Message failed`
  - Agent: `slashdaddy`
  - Task: Sends SEO discoveries to Mitch via Telegram (target: 7550065844)
  - Likely cause: Telegram delivery misconfiguration or connection issue

---

### 5. **Affiliate Network IndexNow + Sitemap Resubmit**
- **ID:** `c5ef1a45-997d-4fb1-9e22-751dde54b355`
- **Schedule:** Every Tuesday at 11 AM (UTC)
- **Last Run:** 2 days ago (2026-08-11)
- **Status:** `error` (1 consecutive error)
- **Error Type:** Message delivery failure
- **Details:**
  - Job ran for 63.2 seconds (likely completed work)
  - Failed at delivery: `⚠️ ✉️ Message failed`
  - Scheduled delivery: `none -> telegram:openclaw-control-ui`
  - Same messaging/delivery issue as job #4

---

### 6. **Bartact SEO pages — Google Indexing submit**
- **ID:** `dfe38a26-a60a-40b6-bc78-ee05cf88c6a8`
- **Schedule:** July 14 at 7 AM (America/Los_Angeles) — one-shot job (deleteAfterRun: true)
- **Last Run:** 30 days ago (2026-07-14)
- **Status:** `error` (1 consecutive error)
- **Error Type:** Model allowlist rejection
- **Details:**
  - Job payload specifies deprecated model: `myclaw/claude-haiku-4.5` (with dot, not dash)
  - Model not in allowed list: `anthropic/claude-haiku-4-5-20251001`, `anthropic/claude-sonnet-4-5-20250929`, `anthropic/claude-sonnet-4-6`, etc.
  - Job marked for deletion after run but still persists due to error
  - Requires: Update model name to one from the allowlist

---

## Error Categories

### Model Registration Issues (3 jobs)
Jobs #1, #2, #3 all stem from `anthropic/claude-haiku-4-5` not being properly registered or authenticated:
- Likely a recent configuration change or provider migration
- **Suggested action:** Verify Anthropic provider setup in gateway config and re-authenticate if needed

### Message/Delivery Failures (2 jobs)
Jobs #4, #5 both complete execution but fail during message delivery:
- `⚠️ ✉️ Message failed` during Telegram delivery
- Both target Telegram channels
- **Suggested action:** Check Telegram account connectivity and API credentials

### Deprecated Model Name (1 job)
Job #6 uses old model ID format (`myclaw/claude-haiku-4.5` with dot):
- **Suggested action:** Update to `anthropic/claude-sonnet-4-6` or another from allowlist

---

## Status Jobs (Not Errors, But Worth Noting)

### Skipped Jobs (3 total)
- `7bcae443-61ab-47d7-84e9-42fcdd550bfa` — SiteStripe daily health check (skipped)
- `558f70fa-4993-46ef-801f-345fd3b30e5d` — Daily Amazon Associates (skipped)
- `8ac9d03f-9d8b-4dda-ae43-d43eabc3941a` — Reminder: High-Commission affiliates (skipped)

These are normal skip conditions (likely conditional triggers). Not errors.

---

## Recommendations

1. **Urgent:** Fix model registration for `anthropic/claude-haiku-4-5` or update jobs #1, #2, #3 to use `anthropic/claude-sonnet-4-6`
2. **Check:** Verify Telegram delivery configuration for jobs #4 and #5
3. **Update:** Job #6 model ID before it tries to run again (though it's a one-shot)
4. **Monitor:** Next 24-48 hours to see if errors clear after model fix

---

*Report generated by Cron Health Monitor (cron:0e1d1a0f-bd7b-4778-bd33-ab7c8198b28f)*
