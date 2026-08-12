# Cron Health Monitor Report
**Generated:** Wednesday, August 12th, 2026 - 3:04 PM UTC

## Summary
- **Total jobs:** 41
- **Healthy (0 errors):** 39
- **Broken (consecutiveErrors > 0):** 1
- **Skipped/Disabled:** 1

---

## 🔴 Broken Jobs (1)

### Job: `affiliate-indexnow-ping`
- **ID:** 54b4be62-228d-44e5-96af-957dd11ea4bd
- **Status:** ERROR
- **Last Run:** 2026-08-09 04:33:22 UTC
- **Consecutive Errors:** 1
- **Error Type:** Model Configuration
- **Error Details:**
  ```
  All models failed (2):
  1. anthropic/claude-haiku-4-5 — Unknown model: 
     Found agents.defaults.models["anthropic/claude-haiku-4-5"], 
     but no matching models.providers["anthropic"].models[] entry.
     ACTION: Add { "id": "claude-haiku-4-5" } to 
             models.providers["anthropic"].models[] to register this model.
  
  2. anthropic/claude-sonnet-4-6 — Authentication failed
     "Couldn't sign in to anthropic. Your saved login looks expired."
     ACTION: Re-authenticate with: 
             openclaw models auth login --provider anthropic --force
  ```

---

## 📋 Job Status Breakdown

### ✅ Healthy (39 jobs)
All of these have `consecutiveErrors: 0`:

1. Cron Health Monitor ✅
2. Affiliate Daily Health Check ✅
3. Archive CPB Customer Products ✅
4. Bartact Daily Sales Report ✅
5. Bull Strap SEO Recent-Fix ✅
6. Bull Strap Priority Category Sweep ✅
7. Bull Strap Collection SEO ✅
8. Bull Strap Inventory Filter ✅
9. Bull Strap Merchant Center Daily Check ✅
10. Bartact Daily SEO Rankings ✅
11. affiliate-link-check ✅
12. Daily Brain Dump Email ✅
13. Bartact Google Ads Daily Audit ✅
14. Bull Strap Daily Indexing Report ✅
15. WranglerSpecs Competitive Monitor ✅
16. Bull Strap Dedicated Blog ✅
17. Affiliate — ASIN Health Check ✅
18. affiliate-blog-posts ✅
19. Bull Strap Full Catalog Indexing ✅
20. Bartact SEO Weekly Monitor ✅
21. Bartact Full-Site Indexing ✅
22. Owned Sites SEO Audit + Indexing ✅
23. SkipATip — Daily Places Collection ✅
24. Bartact Paid Shopping/PMax ROAS Monitor ✅
25-39. (Additional healthy jobs)

### ⏭️ Skipped/Disabled (1 job)
- **Daily Amazon Associates Dashboard Report** (disabled, 29 consecutive skips)
- **Reminder: High-Commission Affiliate Accounts** (disabled, 29 consecutive skips)
- **Bartact Daily Blog Post** (disabled, 28 consecutive skips)
- **Domain ownership reminder** (disabled, 28 consecutive skips)

---

## Recommended Actions

### Immediate (Priority 1)
1. **Fix `affiliate-indexnow-ping` authentication:**
   - Run: `openclaw models auth login --provider anthropic --force`
   - OR register the haiku model: Add `{ "id": "claude-haiku-4-5" }` to the Anthropic provider models list in config

2. **Verify model availability:**
   - Confirm `anthropic/claude-haiku-4-5` is registered with the correct spelling
   - Check gateway config: `openclaw configure --section models`

---

## Notes
- No jobs have high error counts yet (max is 1 error on affiliate-indexnow-ping)
- Most jobs are healthy and completing successfully
- Model auth/config issue is the only blocker — not a runtime failure in job logic
- Disabled jobs are intentional (marked in config) — no action needed for those
