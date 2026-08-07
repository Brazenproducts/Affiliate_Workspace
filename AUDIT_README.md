# Daily Affiliate Site Audit — Complete Setup

**Cron Job:** `e7dfeb15-d657-404d-a495-0c0cac906f1e`  
**Status:** ✅ OPERATIONAL  
**Last Updated:** 2026-08-07 14:00 UTC

---

## 📋 Quick Overview

**What:** Automated daily health check of 400+ affiliate sites  
**When:** Every day at **8:00 AM UTC**  
**Who Gets Alerts:** Mitch (@slashdaddy) on Telegram  
**Alert Trigger:** Critical thresholds exceeded (down sites > 10, missing tags > 20, broken links > 20)

**Status Today:**
- ✅ Audit ran successfully
- ✅ All metrics within normal ranges
- ✅ No critical alerts sent
- ✅ Results saved to `memory/affiliate-audit-latest.md`

---

## 📚 Documentation Files

### For You (Setting Up)
| File | Purpose |
|------|---------|
| **[AUDIT_COMPLETE.md](AUDIT_COMPLETE.md)** | ← **START HERE** — Complete summary of what's been set up |
| [AUDIT_SETUP.md](AUDIT_SETUP.md) | Full setup guide with configuration options |
| [AUDIT_IMPLEMENTATION.md](AUDIT_IMPLEMENTATION.md) | Technical details, architecture, troubleshooting |
| [SETUP_TELEGRAM_DELIVERY.sh](SETUP_TELEGRAM_DELIVERY.sh) | Script to configure Telegram alerts (optional) |

### For Mitch (Alert Recipient)
| File | Purpose |
|------|---------|
| **[MITCH_AUDIT_ALERTS.md](MITCH_AUDIT_ALERTS.md)** | ← **HE SHOULD READ THIS** — How to understand & respond to alerts |

---

## 🚀 Quick Start

### Check Today's Results
```bash
cat memory/affiliate-audit-latest.md
```

### View Latest Alert (if any)
```bash
cat memory/affiliate-audit-CRITICAL.md
```

### Run Manual Audit
```bash
bash scripts/run-audit-with-alerts.sh
echo "Exit code: $?"  # 0 = pass, 1 = critical
```

### View Cron Job Details
```bash
openclaw cron get e7dfeb15-d657-404d-a495-0c0cac906f1e
```

---

## 📊 What the Audit Checks

✅ **Tracking ID Validation**  
- Verify all sites use valid Amazon Associates tags
- Flag invalid or missing tags

✅ **HTTPS Certificate Check**  
- Ensure all domains have valid SSL/TLS
- Detect expired or misconfigured certificates

✅ **Blog Freshness**  
- Verify blog posts are being published
- Detect stale sites (no posts in 24h)

✅ **Live Site Spot Check**  
- Sample 20 random sites
- Verify they respond with HTTP 200/301/302

✅ **Link Health**  
- Count product links (/dp/) vs search links (/s?k=)
- Detect broken/malformed Amazon links

✅ **Missing Links**  
- Flag sites with zero Amazon affiliate links
- Identify revenue loss opportunities

---

## 🚨 Critical Thresholds

Alert triggers when **ANY** of these are exceeded:

| Metric | Threshold | Means |
|--------|-----------|-------|
| **Down sites** | > 10 | 10+ sites returning HTTP errors |
| **Missing tags** | > 20 | 20+ sites without affiliate tags (lost revenue) |
| **Broken links** | > 20 | 20+ broken/malformed Amazon links |

When triggered: Telegram message to Mitch with breakdown + details saved to `memory/affiliate-audit-CRITICAL.md`

---

## 📁 Output Files

### Daily Results (Always Updated)
**Path:** `memory/affiliate-audit-latest.md`

Contains:
- Timestamp
- Status (✅ PASS or 🚨 CRITICAL)
- Quick metrics (down sites, missing tags, etc.)
- Full audit report

### Critical Alerts (When Thresholds Exceeded)
**Path:** `memory/affiliate-audit-CRITICAL.md`

Contains:
- Alert timestamp
- Which thresholds exceeded
- Detailed breakdown of affected sites
- Full audit output

---

## ⚙️ Scripts

### Main Pipeline
**Path:** `scripts/run-audit-with-alerts.sh`

Complete orchestration that:
1. Runs the audit engine
2. Extracts metrics
3. Saves results
4. Checks thresholds
5. Triggers alerts if needed

Exit codes:
- `0` = All clear (no critical issues)
- `1` = Critical issues detected

### Audit Engine
**Path:** `scripts/daily-affiliate-audit.sh`

Core audit logic that performs all the checks (tracking IDs, HTTPS, freshness, spot checks, link health, etc.)

---

## 🔧 Configuration

### Schedule
**Current:** Every day at 8:00 AM UTC

To change:
```bash
openclaw cron update e7dfeb15-d657-404d-a495-0c0cac906f1e \
  --patch '{"schedule": {"expr": "0 14 * * *"}}'  # 2 PM UTC
```

### Thresholds
**Current:** Down > 10, Missing > 20, Broken > 20

Edit `scripts/run-audit-with-alerts.sh` lines 90-102 to adjust.

### Alert Recipient
**Current:** Mitch (@slashdaddy, ID: 7550065844)

To change, update the cron job payload message to include different Telegram user.

### Alert Delivery Method
**Current:** Isolated agent detects exit code & sends message

Optional: Configure webhook delivery to Telegram bot (see SETUP_TELEGRAM_DELIVERY.sh)

---

## 👤 For Mitch

**You will get alerts on Telegram when:**
- Down sites > 10
- Missing affiliate tags > 20
- Broken links > 20

**What to do when you get an alert:**
1. Read the Telegram message for quick summary
2. Check `memory/affiliate-audit-CRITICAL.md` for full details
3. See `MITCH_AUDIT_ALERTS.md` for how to investigate & fix

**To check results anytime:**
```bash
cat memory/affiliate-audit-latest.md
```

---

## ✅ Verification

Today's test run (2026-08-07 14:01–14:03 UTC):

| Metric | Count | Threshold | Status |
|--------|-------|-----------|--------|
| Down sites | 8 | > 10 | ✅ |
| Missing tags | 11 | > 20 | ✅ |
| Broken links | 8 | > 20 | ✅ |

**Result:** ✅ All clear, no alert sent

---

## 📞 Support

### Scripts Not Running?
1. Verify scripts are executable: `ls -la scripts/run-audit-*.sh`
2. Check cron job is enabled: `openclaw cron get e7dfeb15-d657-404d-a495-0c0cac906f1e`
3. Run manually to test: `bash scripts/run-audit-with-alerts.sh`

### Alert Not Sending?
1. Verify script exits with code 1: Check `$?` after running
2. Check critical file created: `ls memory/affiliate-audit-CRITICAL.md`
3. Review cron delivery settings in job configuration

### Thresholds Need Adjusting?
Edit `scripts/run-audit-with-alerts.sh` lines 90-102, then redeploy.

### More Help?
See detailed docs:
- **Setup:** [AUDIT_SETUP.md](AUDIT_SETUP.md)
- **Technical:** [AUDIT_IMPLEMENTATION.md](AUDIT_IMPLEMENTATION.md)
- **Alerts:** [MITCH_AUDIT_ALERTS.md](MITCH_AUDIT_ALERTS.md)

---

## 📝 Change Log

**2026-08-07 14:00 UTC**
- ✅ Complete audit pipeline created
- ✅ Scripts tested and working
- ✅ Cron job configured
- ✅ Documentation complete
- ✅ First test run successful (all clear)

---

## 🎯 Next Steps

1. ✅ **Setup complete** — Audit is operational
2. ⏳ **Monitor first run** — Tomorrow at 8:00 AM UTC
3. ⏳ **Adjust as needed** — Change thresholds/schedule if desired
4. ⏳ **Share with Mitch** — Send him `MITCH_AUDIT_ALERTS.md`

---

**Setup by:** Agent (main session)  
**Date:** 2026-08-07  
**Cron Job:** e7dfeb15-d657-404d-a495-0c0cac906f1e  
**Status:** ✅ READY
