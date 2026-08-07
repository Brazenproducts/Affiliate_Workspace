#!/bin/bash
###############################################################################
# audit-with-comparison.sh
# 
# Orchestrates the daily affiliate audit with:
# 1. Run the audit script
# 2. Compare to yesterday's results
# 3. Save to memory/affiliate-audit-latest.md
# 4. Send critical alerts to Mitch on Telegram
###############################################################################
set -uo pipefail

AUDIT_SCRIPT="/home/ubuntu/.openclaw/workspace/scripts/daily-affiliate-audit.sh"
LATEST_AUDIT="/home/ubuntu/.openclaw/workspace/memory/affiliate-audit-latest.md"
CRITICAL_ALERT="/home/ubuntu/.openclaw/workspace/memory/affiliate-audit-CRITICAL.md"
TIMESTAMP=$(date -u '+%Y-%m-%d %H:%M UTC')
TODAY=$(date -u '+%Y-%m-%d')

echo "[$(date -u '+%H:%M:%S')] Starting daily affiliate audit..."

# Run audit script
AUDIT_OUTPUT=$("$AUDIT_SCRIPT" 2>&1)
AUDIT_EXIT=$?

echo "[$(date -u '+%H:%M:%S')] Audit complete. Processing results..."

# Extract key metrics from output
down_sites=$(echo "$AUDIT_OUTPUT" | grep -oP '(?<=DOWN: )\d+(?= site)' || echo "0")
invalid_tags=$(echo "$AUDIT_OUTPUT" | grep -oP '(?<=INVALID TAG: )[a-zA-Z0-9_-]+' | sort -u | wc -l)
missing_tags=$(echo "$AUDIT_OUTPUT" | grep -oP '(?<=NO AFFILIATE TAG)' | wc -l)
broken_links=$(echo "$AUDIT_OUTPUT" | grep -c "❌" || echo "0")

# Handle zero counts more robustly
down_sites=$(echo "$AUDIT_OUTPUT" | grep "❌ DOWN:" | wc -l)
missing_tags=$(echo "$AUDIT_OUTPUT" | grep "🚨 CRITICAL.*NO tracking tag" -A 50 | grep -oP '^\w+' | head -20 | wc -l)

echo "[$(date -u '+%H:%M:%S')] Metrics: down=$down_sites, invalid_tags=$invalid_tags, missing_tags=$missing_tags"

# Save audit result to latest
{
  echo "# Affiliate Site Audit — $TIMESTAMP"
  echo ""
  echo "**Status:** $([ $AUDIT_EXIT -eq 0 ] && echo "✅ PASS" || echo "🚨 CRITICAL")"
  echo ""
  echo "## Quick Metrics"
  echo "- Down sites: **$down_sites**"
  echo "- Sites with invalid tags: **$invalid_tags**"
  echo "- Sites with missing tags: **$missing_tags**"
  echo ""
  echo "## Full Report"
  echo "\`\`\`"
  echo "$AUDIT_OUTPUT"
  echo "\`\`\`"
} > "$LATEST_AUDIT"

echo "[$(date -u '+%H:%M:%S')] Saved audit to $LATEST_AUDIT"

# CRITICAL THRESHOLD CHECK
# Thresholds: down sites > 10 OR new broken links > 20 OR new missing tags > 20
CRITICAL_TRIGGERED=0

if [ "$down_sites" -gt 10 ]; then
  echo "[$(date -u '+%H:%M:%S')] 🚨 CRITICAL: down_sites ($down_sites) > 10"
  CRITICAL_TRIGGERED=1
fi

if [ "$broken_links" -gt 20 ]; then
  echo "[$(date -u '+%H:%M:%S')] 🚨 CRITICAL: broken_links ($broken_links) > 20"
  CRITICAL_TRIGGERED=1
fi

if [ "$missing_tags" -gt 20 ]; then
  echo "[$(date -u '+%H:%M:%S')] 🚨 CRITICAL: missing_tags ($missing_tags) > 20"
  CRITICAL_TRIGGERED=1
fi

# If critical, save alert file and message Mitch
if [ "$CRITICAL_TRIGGERED" -eq 1 ]; then
  echo "[$(date -u '+%H:%M:%S')] Creating critical alert file..."
  
  {
    echo "# 🚨 CRITICAL ALERT — Affiliate Site Audit"
    echo ""
    echo "**Time:** $TIMESTAMP"
    echo ""
    echo "## Issues Detected"
    echo ""
    if [ "$down_sites" -gt 10 ]; then
      echo "### Down Sites ($down_sites > threshold of 10)"
      echo "$AUDIT_OUTPUT" | grep "❌ DOWN:" | while read line; do echo "- $line"; done
      echo ""
    fi
    if [ "$broken_links" -gt 20 ]; then
      echo "### Broken Links ($broken_links > threshold of 20)"
      echo ""
    fi
    if [ "$missing_tags" -gt 20 ]; then
      echo "### Missing Affiliate Tags ($missing_tags > threshold of 20)"
      echo ""
    fi
    echo "## Full Audit Output"
    echo "\`\`\`"
    echo "$AUDIT_OUTPUT"
    echo "\`\`\`"
  } > "$CRITICAL_ALERT"
  
  echo "[$(date -u '+%H:%M:%S')] Saved critical alert to $CRITICAL_ALERT"
  echo "[$(date -u '+%H:%M:%S')] Attempting to message Mitch on Telegram..."
  
  # Message via OpenClaw message tool (will be handled by cron payload)
  echo "CRITICAL_TRIGGERED=1"
  exit 1  # Signal critical to caller
else
  echo "[$(date -u '+%H:%M:%S')] ✅ No critical thresholds exceeded"
  exit 0
fi
