# Cron Health Report
**Generated:** Tuesday, August 11th, 2026 - 3:01 PM (UTC)

## Summary
- **Total Jobs:** 76
- **Healthy Jobs:** 65
- **Broken Jobs:** 9
- **Other Status:** 2 skipped, 0 idle pending

---

## Broken Jobs (consecutiveErrors > 0)

### 1. **Bull Strap — Daily Google Indexing API (200/day, 2x daily)**
- **Job ID:** `20b526f0-c7a6-44ce-876e-9c06f74a23b9`
- **Status:** `error (3x)`
- **Consecutive Errors:** 3
- **Last Run:** 14 hours ago
- **Error:** `⚠️ 🧰 Process: 'wild-zephyr' failed`
- **Description:** Pushes 200 URLs/day to Google Indexing API for Bull Strap catalog

### 2. **affiliate-indexnow-ping**
- **Job ID:** `54b4be62-228d-44e5-96af-957dd11ea4bd`
- **Status:** `error`
- **Consecutive Errors:** 1
- **Last Run:** 1 day ago
- **Error:** `FallbackSummaryError: All models failed (2)`
  - Primary: `anthropic/claude-haiku-4-5` — Unknown model (not registered in models.providers[\"anthropic\"].models[])
  - Fallback: `anthropic/claude-sonnet-4-6` — No API key found / auth expired
- **Description:** Submit all affiliate sites to IndexNow

### 3. **Bartact SEO content audit**
- **Job ID:** `d9d63f5d-8d7a-4a27-a50e-42052e7c7880`
- **Status:** `error`
- **Consecutive Errors:** 1
- **Last Run:** 1 day ago
- **Error:** `FallbackSummaryError: All models failed (2)`
  - Primary: `anthropic/claude-haiku-4-5` — Unknown model (not registered)
  - Fallback: `anthropic/claude-sonnet-4-6` — No API key found / auth expired
- **Description:** Update Bartact collection descriptions on Shopify

### 4. **Bull Strap — Weekly IndexNow Blast (all 100k URLs)**
- **Job ID:** `416e3ec8-52d9-4f69-8009-3105585f0e2d`
- **Status:** `error`
- **Consecutive Errors:** 1
- **Last Run:** 4 days ago
- **Error:** `FallbackSummaryError: All models failed (2)`
  - Primary: `anthropic/claude-haiku-4-5` — Unknown model (not registered)
  - Fallback: `anthropic/claude-sonnet-4-6` — No API key found / auth expired (slashdaddy agent)
- **Description:** Submit all product URLs to IndexNow weekly

### 5. **weekly-content-engine**
- **Job ID:** `276e8dd6-acd2-4b98-bc5c-85a378437aa4`
- **Status:** `error`
- **Consecutive Errors:** 1
- **Last Run:** 2 days ago
- **Error:** `FailoverError: Unknown model: anthropic/claude-haiku-4-5`
  - Not registered in models.providers[\"anthropic\"].models[]
- **Description:** Write 2 new articles per site weekly, auto-commit/push

### 6. **Gclid capture rate check - weekly**
- **Job ID:** `fc95f4b4-1011-4f07-80ae-7a9a7b9c0bcd`
- **Status:** `error`
- **Consecutive Errors:** 1
- **Last Run:** 2 days ago
- **Error:** `FailoverError: Unknown model: anthropic/claude-haiku-4-5`
  - Not registered in models.providers[\"anthropic\"].models[]
- **Description:** Check Bartact gclid capture rate from Google Ads

### 7. **SEO Discoveries — Monday 5am PST**
- **Job ID:** `c7a1278d-565b-465a-8eec-7cc3be228405`
- **Status:** `error`
- **Consecutive Errors:** 1
- **Last Run:** 1 day ago
- **Error:** `⚠️ ✉️ Message failed`
- **Description:** Monday morning SEO summary for slashdaddy (Telegram delivery failed)

### 8. **Affiliate Network IndexNow + Sitemap Resubmit**
- **Job ID:** `c5ef1a45-997d-4fb1-9e22-751dde54b355`
- **Status:** `error`
- **Consecutive Errors:** 1
- **Last Run:** 7 hours ago
- **Error:** `⚠️ ✉️ Message failed`
- **Description:** Weekly IndexNow + sitemap resubmission for affiliate sites

### 9. **Bartact SEO pages — Google Indexing submit**
- **Job ID:** `dfe38a26-a60a-40b6-bc78-ee05cf88c6a8`
- **Status:** `error`
- **Consecutive Errors:** 1
- **Last Run:** 28 days ago
- **Error:** `cron payload.model rejected by agents.defaults.models allowlist`
  - Job specifies: `myclaw/claude-haiku-4.5` (outdated format)
  - Allowed models: anthropic/claude-haiku-4-5-20251001, anthropic/claude-sonnet-4-5-20250929, etc.
  - Job scheduled for July 14 (one-time, deleteAfterRun=true but never deleted)
- **Description:** Submit Bartact collection URLs to Google Indexing API

---

## Root Causes

### 🔴 **Model Configuration Issues (6 jobs)**
Multiple jobs fail because `anthropic/claude-haiku-4-5` is not registered in `models.providers["anthropic"].models[]`. This model appears in `agents.defaults.models` but lacks a corresponding provider entry.
- Jobs: `54b4be62`, `d9d63f5d`, `416e3ec8`, `276e8dd6`, `fc95f4b4`

### 🔴 **Authentication Expired (Affects fallback chain)**
`anthropic/claude-sonnet-4-6` also fails with "No API key found" — Anthropic auth may be expired across multiple agents:
- `main` agent: No API key found
- `slashdaddy` agent: No API key found

### 🔴 **Process Failure (1 job)**
`20b526f0` — Bull Strap Google Indexing: Subprocess `wild-zephyr` failed. Likely dependency issue or script error in `bullstrap-full-indexing.js`.

### 🔴 **Message Delivery Failures (2 jobs)**
- `c7a1278d` & `c5ef1a45` — Both fail at the message delivery step (Telegram). Jobs complete but delivery fails.

### 🔴 **Model Format Mismatch (1 job)**
`dfe38a26` — Job specifies `myclaw/claude-haiku-4.5` (old format). Current allowlist expects hyphenated versions like `anthropic/claude-haiku-4-5-20251001`.

---

## Recommendations

1. **Register missing model** — Add `{ "id": "claude-haiku-4-5" }` to `models.providers["anthropic"].models[]` OR update job payloads to use registered model IDs.
2. **Re-authenticate Anthropic** — Run `openclaw models auth login --provider anthropic --force` for both `main` and `slashdaddy` agents.
3. **Debug subprocess failure** — Check `/home/ubuntu/.openclaw/workspace/sites/indexing-credentials/scripts/bullstrap-full-indexing.js` for dependency or runtime issues.
4. **Fix message delivery** — Verify Telegram account (7550065844) is still active and accessible.
5. **Clean up stale job** — Job `dfe38a26` has `deleteAfterRun=true` but is still present; manually remove it or let it run with corrected model ID.
