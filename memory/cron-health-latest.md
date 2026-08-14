# Cron Health Monitor Report
**Generated:** Friday, August 14, 2026 - 3:00 AM UTC

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Jobs** | 82 |
| **Healthy Jobs** | 77 |
| **Broken Jobs** | 5 |
| **Health Percentage** | 93.9% |

---

## Broken Jobs (5)

### 1. **weekly-content-engine**
- **Job ID:** `276e8dd6-acd2-4b98-bc5c-85a378437aa4`
- **Status:** error
- **Last Error:** 2026-08-09 06:02:58 UTC
- **Error Type:** Model not found
- **Error Message:** 
  ```
  FailoverError: Unknown model: anthropic/claude-haiku-4-5. Found agents.defaults.models["anthropic/claude-haiku-4-5"], 
  but no matching models.providers["anthropic"].models[] entry. Add { "id": "claude-haiku-4-5" } to 
  models.providers["anthropic"].models[] to register this provider model.
  ```
- **Cause:** The model `anthropic/claude-haiku-4-5` is configured in the job but not registered in the gateway's model provider list.
- **Previous Status:** Job was running successfully (last successful run: July 5, 2026 with 3,035 articles written)

---

### 2. **Gclid capture rate check - weekly**
- **Job ID:** `fc95f4b4-1011-4f07-80ae-7a9a7b9c0bcd`
- **Status:** error
- **Last Error:** 2026-08-09 21:00:02 UTC
- **Error Type:** Model not found
- **Error Message:** 
  ```
  FailoverError: Unknown model: anthropic/claude-haiku-4-5. Found agents.defaults.models["anthropic/claude-haiku-4-5"], 
  but no matching models.providers["anthropic"].models[] entry. Add { "id": "claude-haiku-4-5" } to 
  models.providers["anthropic"].models[] to register this provider model.
  ```
- **Cause:** Same as above — missing model registration.
- **Previous Status:** Job was running successfully with capture rate analysis (last successful run: Aug 2, 2026)

---

### 3. **SEO Discoveries — Monday 5am PST**
- **Job ID:** `c7a1278d-565b-465a-8eec-7cc3be228405`
- **Status:** error
- **Last Error:** 2026-08-10 12:05:35 UTC
- **Error Type:** Message delivery failed
- **Error Message:** 
  ```
  ⚠️ ✉️ Message failed
  ```
- **Cause:** The job executed successfully but failed to deliver results via messaging (Telegram).
- **Previous Status:** Job completed work (SEO playbook updated, sites processed) but delivery to Mitch blocked.

---

### 4. **Affiliate Network IndexNow + Sitemap Resubmit**
- **Job ID:** `c5ef1a45-997d-4fb1-9e22-751dde54b355`
- **Status:** error
- **Last Error:** 2026-08-11 11:02:53 UTC
- **Error Type:** Message delivery failed
- **Error Message:** 
  ```
  ⚠️ ✉️ Message failed
  ```
- **Cause:** Job executed successfully (102/104 IndexNow submissions passed, 0% error rate on that task), but failed to deliver alert via messaging. Secondary issue: GSC sitemap submission has 93.4% failure rate due to permission errors.
- **Previous Status:** Job runs weekly with mixed results (some weeks 0% errors, some weeks high IndexNow failure rates). Current run worked but delivery blocked.

---

### 5. **Bartact SEO pages — Google Indexing submit**
- **Job ID:** `dfe38a26-a60a-40b6-bc78-ee05cf88c6a8`
- **Status:** error
- **Last Error:** 2026-07-14 14:00:07 UTC
- **Error Type:** Model not found (config)
- **Error Message:** 
  ```
  cron payload.model 'myclaw/claude-haiku-4.5' rejected by agents.defaults.models allowlist: 
  myclaw/claude-haiku-4.5 is not in [anthropic/claude-haiku-4-5-20251001, ...]
  ```
- **Cause:** Job configuration references an old/invalid model ID that's no longer in the allowlist.
- **Previous Status:** Has not run successfully since July 14; scheduled for annual run (next: 2027-07-14).

---

## Root Cause Analysis

### Primary Issues (Blocking 3 Jobs)
**Model Registration Mismatch** — Jobs 1, 2, and 5 all fail due to model configuration issues:
- The cron jobs reference `anthropic/claude-haiku-4-5` (and `myclaw/claude-haiku-4.5` in one case)
- The gateway's model allowlist has been updated but doesn't include these IDs
- **Fix Required:** Register the missing models in `models.providers["anthropic"].models[]` or update the job configurations to use an available model ID from the allowlist

**Available Models (from error diagnostics):**
- `anthropic/claude-haiku-4-5-20251001`
- `anthropic/claude-sonnet-4-5-20250929`
- `anthropic/claude-sonnet-4-6`
- Various `myclaw/*` models (gpt-5.1-5.4, Qwen3.7, MiniMax-M3, gemini-3, kimi-k2.5)

### Secondary Issues (Non-Critical)
**Messaging Delivery Failures** — Jobs 3 and 4:
- Jobs complete successfully but fail when trying to send results to external channels (Telegram)
- Error indicates no channel is configured in the delivery setup
- Jobs are completing their work; only the notification is failing

**GSC Permission Errors** — Job 4 (secondary issue):
- Google Search Console API calls failing with "User does not have sufficient permission" errors
- 93.4% failure rate on sitemap resubmissions
- Likely cause: Service account permissions changed or GSC access was revoked

---

## Recommendation

**Immediate Action (Critical):**
1. Update cron jobs 1, 2, and 5 to use a model ID from the available allowlist
   - Suggested: Replace `anthropic/claude-haiku-4-5` with `anthropic/claude-haiku-4-5-20251001`
   - Or register the old model ID in the gateway config
2. Verify that model `anthropic/claude-haiku-4-5` should be supported or if it's been deprecated

**Secondary Actions (Non-Critical):**
3. Configure message delivery channels for jobs 3 and 4 if they need to send notifications
4. Investigate GSC API credentials for job 4 (check service account permissions)

---

## Job Status Summary

**Running Successfully:** 77 of 82 jobs
- Daily jobs (Bull Strap, affiliate indexing, etc.): All running
- Weekly jobs: Most running except broken ones listed above
- One-time/seasonal jobs: Mostly idle/scheduled

**Not Running:** 5 jobs (detailed above)
