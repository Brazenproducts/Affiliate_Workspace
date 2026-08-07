# Affiliate Site Audit Alerts — For Mitch

This document explains the automated daily audit alerts you'll receive on Telegram.

---

## What You'll Get

**Every day at 8:00 AM UTC**, you'll receive an automated message on Telegram (@slashdaddy) IF there are critical issues.

### "All Clear" Days
If everything is fine:
- No message (silent pass)
- Results saved to `memory/affiliate-audit-latest.md`
- You can check anytime

### "Critical Alert" Days
If thresholds are exceeded, you get a Telegram message like:

```
🚨 CRITICAL ALERT — Affiliate Site Audit
Time: 2026-08-07 14:00 UTC
Severity: CRITICAL

Thresholds Exceeded:
🔴 Down sites: 15 (threshold: 10)
🔴 Missing tags: 25 (threshold: 20)

Down Sites (15):
- example-site-1.com (HTTP 502)
- example-site-2.com (HTTP 503)
[... full list ...]

Invalid Tracking Tags:
- site-foo.com (tag=invalid-tag-xyz)

Missing Affiliate Tags:
- site-bar.com
- site-baz.com
[... full list ...]
```

---

## Alert Thresholds

Your audit alerts **only** when these conditions are met:

| Issue | Threshold | What It Means |
|-------|-----------|---------------|
| **Down sites** | > 10 | 10+ sites returning HTTP errors (502, 503, 504, timeout) |
| **Missing tags** | > 20 | 20+ sites without ANY Amazon affiliate tracking ID |
| **Broken links** | > 20 | 20+ broken/malformed Amazon links across sites |

If **ANY** of these thresholds is exceeded, you get an alert.

### Why These Thresholds?
- **Down sites > 10:** Indicates infrastructure issues (hosting, DNS, deployment)
- **Missing tags > 20:** Revenue leakage—affiliate commissions not being tracked
- **Broken links > 20:** User experience problem + tracking loss

---

## What to Do When You Get an Alert

### Step 1: Read the Alert
The message tells you:
- Which threshold(s) are exceeded
- Count of affected sites
- Lists of sites with issues

### Step 2: Access Full Details
Check this file for comprehensive breakdown:
```
memory/affiliate-audit-CRITICAL.md
```

Contains:
- Detailed list of every affected site
- HTTP status codes for down sites
- Invalid tracking tag values
- Full audit output

### Step 3: Identify the Root Cause

#### If **Down sites > 10**
Likely causes:
- **Hosting issue** — GitHub Pages, Netlify, or CDN down
- **DNS propagation** — Domain pointing to wrong IP
- **SSL certificate** — Expired or misconfigured
- **Deployment failure** — Last publish didn't go through

**Action:** Check hosting status, verify DNS, check deployment logs

#### If **Missing tags > 20**
Likely causes:
- **Template change** — Affiliate tag variable removed from template
- **Bulk import** — New sites added without proper tag injection
- **Site corruption** — Automated cleanup script removed tags accidentally
- **Blog generator** — Failed to include tracking IDs in new posts

**Action:** Check blog generator logs, verify template, rescan affected sites

#### If **Broken links > 20**
Likely causes:
- **Amazon API change** — Amazon changed link format or deprecated endpoints
- **Link generation script** — Bug in ASIN→link converter
- **Migration** — Old links not properly updated during refactoring
- **Partial data loss** — ASIN or affiliate tag field got corrupted

**Action:** Check link generator, verify ASIN database, test a few links manually

### Step 4: Take Action

**For down sites:**
```bash
# Check specific site
curl -I https://example-site.com/

# Check hosting status
# — GitHub Pages: github.com/status
# — Netlify: status.netlify.com
# — Cloudflare: status.cloudflare.com
```

**For missing tags:**
```bash
# Find which sites are missing tags
grep "NO AFFILIATE TAG" memory/affiliate-audit-CRITICAL.md

# Check one site
cat sites/example-site/index.html | grep "tag=" | head -5
```

**For broken links:**
```bash
# Test a broken link
curl -I "https://amazon.com/s?k=test&tag=brazenprodu01-20"

# Check for common patterns
grep -o 'tag=[a-zA-Z0-9_-]*' sites/*/index.html | sort | uniq -c | sort -rn
```

### Step 5: Fix & Verify

Fix the issue, then:
1. Deploy changes
2. Wait for next day's audit (8 AM UTC)
3. Check if alert disappears

For urgent issues, you can **manually trigger** the audit:
```bash
bash /home/ubuntu/.openclaw/workspace/scripts/run-audit-with-alerts.sh
```

---

## Understanding the Audit Details

### What "Down Sites" Means
```
❌ DOWN: example-site.com → HTTP 502 (Bad Gateway)
```
- Site is not responding with HTTP 200/301/302
- Could be temporary (server restart) or permanent (deployment failed)
- Affects user ability to reach your affiliate links
- No commissions earned while site is down

### What "Invalid Tag" Means
```
❌ INVALID TAG: fake-tag-12345
```
- Site uses a tracking ID that's not in your approved list
- Amazon won't track the click to your account
- No commission for that traffic
- Site needs to be updated with valid tag (brazenprodu01-20, brazenprodu02-20, etc.)

### What "Missing Tag" Means
```
❌ NO AFFILIATE TAG
```
- Site has Amazon links but no tracking ID parameter at all
- Clicks are tracked to Amazon account, but NOT to your affiliate account
- You don't earn commission
- Lost revenue

### What "Broken Links" Means
- Links are malformed or point to invalid products
- Could be:
  - Invalid ASIN (product doesn't exist)
  - Broken affiliate link format
  - Expired link redirect chain
- Users get errors instead of product pages
- Zero commission + poor UX

---

## File Structure

When you get an alert:

**Daily Results File** (always updated)
```
memory/affiliate-audit-latest.md
├─ Timestamp
├─ Status (✅ PASS or 🚨 CRITICAL)
├─ Quick metrics
└─ Full audit report
```

**Critical Alert File** (only when thresholds exceeded)
```
memory/affiliate-audit-CRITICAL.md
├─ Alert timestamp
├─ Which thresholds exceeded
├─ Detailed issue lists
└─ Full audit output
```

---

## Common Issues & Solutions

### "Down Sites" Keeps Appearing
**Symptom:** Same sites failing audit day after day

**Possible causes:**
- Hosting account suspended
- Domain expired
- DNS misconfigured
- Permanent server issue

**Fix:**
- Contact hosting provider
- Verify domain registration active
- Check DNS records point to correct IP
- Review server logs for errors

### "Missing Tags" Suddenly Spikes
**Symptom:** 20+ sites suddenly missing tags (was 2 yesterday)

**Possible causes:**
- Blog generator crashed
- Bulk import without tags
- Automated cleanup removed tags
- Tag variable name changed

**Fix:**
- Check blog generator logs
- Verify template includes tag variable
- Restore from backup if needed
- Manually fix critical sites first, then batch fix others

### "Broken Links" Keep Growing
**Symptom:** Day 1: 5 broken, Day 2: 8 broken, Day 3: 12 broken

**Possible causes:**
- Amazon deprecated product (ASIN no longer valid)
- Link generator bug affecting new sites
- ASIN database corruption
- Affiliate tag format change

**Fix:**
- Check which ASINs are problematic
- Verify link generation script
- Update Amazon API integration if needed
- Replace broken ASINs with current products

---

## Quick Reference

| When | What | Where |
|------|------|-------|
| **Every day** | Audit runs | 8:00 AM UTC |
| **All clear** | Nothing (silent) | — |
| **Issues found** | Telegram alert | @slashdaddy |
| **Details** | Full report | `memory/affiliate-audit-latest.md` |
| **Critical only** | Alert file | `memory/affiliate-audit-CRITICAL.md` |

---

## Need Help?

### Check Audit Results
```bash
# Latest results
cat memory/affiliate-audit-latest.md

# If critical alert today
cat memory/affiliate-audit-CRITICAL.md

# Check site-specific issues
grep "example-site.com" memory/affiliate-audit-CRITICAL.md
```

### Manual Audit Run
```bash
bash /home/ubuntu/.openclaw/workspace/scripts/run-audit-with-alerts.sh
echo "Exit code: $?"
# 0 = All clear
# 1 = Critical issues
```

### Check Sites Directory
```bash
# List all affiliate sites
ls sites/ | wc -l

# Check specific site
cat sites/example-site/index.html | grep -o 'tag=[^"&]*' | sort -u
```

---

## Next Steps

1. ✅ Audit runs automatically every day at **8:00 AM UTC**
2. ⏳ You'll receive alerts only when thresholds are exceeded
3. ⏳ Review critical alerts and take action as needed
4. ⏳ Sites should recover within 24 hours of fix

Happy monitoring! 🚀

---

**Setup Date:** 2026-08-07 14:00 UTC  
**Your Contact:** Telegram @slashdaddy  
**Thresholds:** Down sites > 10 | Missing tags > 20 | Broken links > 20
