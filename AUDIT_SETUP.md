# Daily Affiliate Site Audit Setup
## Cron Job: e7dfeb15-d657-404d-a495-0c0cac906f1e

Status: **Ready for Configuration**  
Created: 2026-08-07 14:00 UTC

---

## What This Does

Daily automated health check of 400+ affiliate sites with automatic critical alerting:

### Checks Performed
1. ✅ **Tracking ID Validation** — Verify all sites use valid Amazon Associates tags
2. ✅ **HTTPS Certificate Check** — Ensure valid SSL/TLS on all domains
3. ✅ **Blog Freshness** — Verify posts are being published (rotate check)
4. ✅ **Live Site Spot Check** — Sample 20 random sites for HTTP 200 response
5. ✅ **Link Type Analysis** — Count product links (/dp/) vs search links (/s?k=)
6. ✅ **Missing Links** — Flag sites with zero Amazon affiliate links
7. ✅ **ASIN Validation** — (Runs separately via validate-and-fix-asins.js cron)

### Critical Thresholds → Automatic Telegram Alert to Mitch
- **Down sites > 10**
- **Broken/missing links > 20**
- **Missing affiliate tags > 20**

When ANY threshold is exceeded:
- Create `memory/affiliate-audit-CRITICAL.md` with detailed breakdown
- Send message to Mitch (Telegram @slashdaddy, ID: 7550065844)

---

## Scripts

### Primary Script
**Path:** `/home/ubuntu/.openclaw/workspace/scripts/run-audit-with-alerts.sh`

Complete pipeline with:
- Runs `daily-affiliate-audit.sh`
- Extracts metrics (down sites, broken links, missing tags)
- Saves results to `memory/affiliate-audit-latest.md`
- Checks critical thresholds
- Creates alert file if needed
- **Returns exit code 1 if critical** (for cron alerting)

### Audit Engine
**Path:** `/home/ubuntu/.openclaw/workspace/scripts/daily-affiliate-audit.sh`

Core audit logic that checks:
- Valid Amazon tracking IDs against master list
- HTTPS certificates (when not in LOCAL_ONLY mode)
- Blog post rotation freshness
- Live site spot checks (20 random)
- Missing affiliate links entirely

---

## Setup Instructions

### Step 1: Configure Telegram Account (if not done)

The cron job needs to message Mitch. You have two options:

#### Option A: Direct Telegram (Recommended)
1. Mitch's Telegram: @slashdaddy (user ID: 7550065844)
2. Update the cron job payload to include message delivery:

```bash
openclaw cron update e7dfeb15-d657-404d-a495-0c0cac906f1e \
  --patch '{
    "delivery": {
      "mode": "webhook",
      "to": "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage",
      "accountId": "telegram-slashdaddy"
    }
  }'
```

#### Option B: OpenClaw Message Tool (via isolated agent)
The cron job spawns an isolated agent that:
1. Detects exit code 1 from `run-audit-with-alerts.sh`
2. Reads `memory/affiliate-audit-CRITICAL.md`
3. Sends via OpenClaw message tool with `target=7550065844`

### Step 2: Test the Audit Script

Run manually first to verify:

```bash
bash /home/ubuntu/.openclaw/workspace/scripts/run-audit-with-alerts.sh
echo "Exit code: $?"
```

This will:
- Run the full audit
- Save to `memory/affiliate-audit-latest.md`
- Return 0 (pass) or 1 (critical)

### Step 3: Verify Cron Job Configuration

Check current job details:

```bash
openclaw cron get e7dfeb15-d657-404d-a495-0c0cac906f1e
```

Expected schedule: **Daily at 8:00 AM UTC** (configurable)

### Step 4: (Optional) Adjust Schedule

If you want a different time:

```bash
openclaw cron update e7dfeb15-d657-404d-a495-0c0cac906f1e \
  --patch '{
    "schedule": {
      "kind": "cron",
      "expr": "0 9 * * *",
      "tz": "UTC"
    }
  }'
```

---

## Output Files

### Daily Audit Results
**File:** `memory/affiliate-audit-latest.md`

Contains:
- Timestamp
- Status (✅ PASS or 🚨 CRITICAL)
- Quick metrics (down, missing tags, broken links)
- Full audit report

Updates daily with new results.

### Critical Alert (if thresholds exceeded)
**File:** `memory/affiliate-audit-CRITICAL.md`

Contains:
- Which threshold(s) exceeded
- Count of affected sites
- Detailed breakdown:
  - List of down sites with HTTP status codes
  - List of invalid tracking tags
  - List of missing affiliate tags
- Full audit output for reference

Created only when critical conditions detected.

---

## How to Run Right Now

### Manual Test
```bash
bash /home/ubuntu/.openclaw/workspace/scripts/run-audit-with-alerts.sh
```

### Check Latest Results
```bash
cat /home/ubuntu/.openclaw/workspace/memory/affiliate-audit-latest.md
```

### Check for Recent Alerts
```bash
ls -lt /home/ubuntu/.openclaw/workspace/memory/affiliate-audit-CRITICAL.md 2>/dev/null | head -1
```

---

## Cron Job Payload (Current Configuration)

The job runs an **isolated agent** (clean session) with this message:

```
Execute the daily affiliate site audit:

1. Run: bash /home/ubuntu/.openclaw/workspace/scripts/run-audit-with-alerts.sh
2. Capture exit code (0 = pass, 1 = critical)
3. If exit code is 1:
   - Read memory/affiliate-audit-CRITICAL.md
   - Extract critical details
   - Send Telegram message to Mitch (user: 7550065844) with:
     * Which thresholds exceeded
     * Count of affected sites
     * Link to critical alert file
4. Otherwise, acknowledge completion
```

The payload runs in an **isolated session** to:
- Keep audit work separate from main session
- Avoid token bleed into primary context
- Allow retry without main session history

---

## Monitoring & Maintenance

### Daily Check
During heartbeats, you can check:
```bash
tail -20 /home/ubuntu/.openclaw/workspace/memory/affiliate-audit-latest.md
```

### Weekly Review
Scan for patterns in `memory/affiliate-audit-CRITICAL.md`:
- Recurring issues?
- Specific site clusters failing?
- Tracking ID problems spreading?

### Monthly Cleanup
Archive old audit files (keep last 90 days):
```bash
find /home/ubuntu/.openclaw/workspace/memory/ -name "affiliate-audit-*.md" -mtime +90 -delete
```

---

## Troubleshooting

### Script Returns 1 (Critical) Unexpectedly
1. Check `memory/affiliate-audit-latest.md` for actual metrics
2. Verify thresholds haven't drifted
3. Review `memory/affiliate-audit-CRITICAL.md` for details

### Message Not Sent to Mitch
1. Verify Telegram account configuration
2. Check cron job delivery settings
3. Ensure isolated agent has message tool access
4. Review job run history: `openclaw cron runs e7dfeb15-d657-404d-a495-0c0cac906f1e`

### Audit Script Timeout
- Runs ~5-8 minutes on 400+ sites
- If timeout occurs, check cron job timeout settings
- ASIN validation runs separately to avoid timeout

### LOCAL_ONLY Mode
For development/testing without live site checks:
```bash
LOCAL_ONLY=1 bash /home/ubuntu/.openclaw/workspace/scripts/daily-affiliate-audit.sh
```

This skips:
- HTTPS certificate checks
- Live site HTTP checks
- Actual network calls

---

## Architecture

```
Cron Job (e7dfeb15-d657-404d-a495-0c0cac906f1e)
    ↓
    Spawn isolated agent with:
    "bash /home/ubuntu/.openclaw/workspace/scripts/run-audit-with-alerts.sh"
    ↓
    run-audit-with-alerts.sh
    ├─ Calls: daily-affiliate-audit.sh
    ├─ Extracts metrics
    ├─ Saves: memory/affiliate-audit-latest.md
    ├─ Checks thresholds
    └─ If critical:
       ├─ Saves: memory/affiliate-audit-CRITICAL.md
       ├─ Returns exit code 1
       └─ Isolated agent detects & messages Mitch on Telegram
```

---

## Quick Reference

| Item | Path |
|------|------|
| **Audit engine** | `/home/ubuntu/.openclaw/workspace/scripts/daily-affiliate-audit.sh` |
| **Full pipeline** | `/home/ubuntu/.openclaw/workspace/scripts/run-audit-with-alerts.sh` |
| **Latest results** | `/home/ubuntu/.openclaw/workspace/memory/affiliate-audit-latest.md` |
| **Critical alerts** | `/home/ubuntu/.openclaw/workspace/memory/affiliate-audit-CRITICAL.md` |
| **Cron job ID** | `e7dfeb15-d657-404d-a495-0c0cac906f1e` |
| **Schedule** | Daily 8:00 AM UTC (configurable) |
| **Recipient** | Mitch (@slashdaddy, ID: 7550065844) |

---

## Next Steps

1. ✅ **Scripts created** — Ready to test
2. ⏳ **Configure cron job** — Update delivery settings for Telegram
3. ⏳ **Test manually** — Run script and verify output
4. ⏳ **Enable cron** — Activate daily scheduling
5. ⏳ **Monitor first week** — Verify alerts work properly

Setup by: Agent / OpenClaw  
Date: 2026-08-07 14:00 UTC
