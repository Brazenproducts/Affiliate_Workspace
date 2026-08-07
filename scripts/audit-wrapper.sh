#!/bin/bash

# Daily Affiliate Audit Wrapper with 24h Comparison & Critical Threshold Alerting
# This script wraps the audit runner and handles comparison + alerting

set -e

AUDIT_SCRIPT="/home/ubuntu/.openclaw/workspace/scripts/daily-affiliate-audit.sh"
WORKSPACE="/home/ubuntu/.openclaw/workspace"
MEMORY_DIR="$WORKSPACE/memory"
LATEST_FILE="$MEMORY_DIR/affiliate-audit-latest.md"
CRITICAL_FILE="$MEMORY_DIR/affiliate-audit-CRITICAL.md"
BACKUP_FILE="$MEMORY_DIR/affiliate-audit-yesterday.md"

# Ensure memory directory exists
mkdir -p "$MEMORY_DIR"

# Step 1: Save yesterday's audit as backup
if [ -f "$LATEST_FILE" ]; then
    cp "$LATEST_FILE" "$BACKUP_FILE"
    echo "[$(date -u +%Y-%m-%d\ %H:%M:%S\ UTC)] Backed up previous audit to affiliate-audit-yesterday.md"
fi

# Step 2: Run the audit
echo "[$(date -u +%Y-%m-%d\ %H:%M:%S\ UTC)] Starting affiliate audit..."
bash "$AUDIT_SCRIPT" 2>&1 | tee "$MEMORY_DIR/audit-run-$(date -u +%s).log"

# Step 3: Check if new audit results exist
CURRENT_AUDIT=$(find "$MEMORY_DIR" -maxdepth 1 -name "affiliate-audit-*.md" -newer "$BACKUP_FILE" -type f 2>/dev/null | head -1)

if [ -z "$CURRENT_AUDIT" ]; then
    echo "[$(date -u +%Y-%m-%d\ %H:%M:%S\ UTC)] ERROR: No new audit results found!"
    exit 1
fi

cp "$CURRENT_AUDIT" "$LATEST_FILE"
echo "[$(date -u +%Y-%m-%d\ %H:%M:%S\ UTC)] Audit results saved to affiliate-audit-latest.md"

# Step 4: Extract metrics for 24h comparison
echo "[$(date -u +%Y-%m-%d\ %H:%M:%S\ UTC)] Analyzing metrics for critical thresholds..."

# Parse the latest audit for critical metrics
DOWN_SITES=$(grep -oP "Sites DOWN.*?\*\*\K\d+" "$LATEST_FILE" | head -1 || echo "0")
BROKEN_LINKS=$(grep -oP "broken links.*?\*\*\K\d+" "$LATEST_FILE" | head -1 || echo "0")
MISSING_TAGS=$(grep -oP "missing tags.*?\*\*\K\d+" "$LATEST_FILE" | head -1 || echo "0")

echo "DOWN_SITES=$DOWN_SITES, BROKEN_LINKS=$BROKEN_LINKS, MISSING_TAGS=$MISSING_TAGS"

# Step 5: Check critical thresholds
CRITICAL_TRIGGERED=0

if [ "$DOWN_SITES" -gt 10 ]; then
    echo "[CRITICAL] Sites down ($DOWN_SITES) exceeds threshold (>10)"
    CRITICAL_TRIGGERED=1
fi

if [ "$BROKEN_LINKS" -gt 20 ]; then
    echo "[CRITICAL] New broken links ($BROKEN_LINKS) exceeds threshold (>20)"
    CRITICAL_TRIGGERED=1
fi

if [ "$MISSING_TAGS" -gt 20 ]; then
    echo "[CRITICAL] New missing tags ($MISSING_TAGS) exceeds threshold (>20)"
    CRITICAL_TRIGGERED=1
fi

# Step 6: If critical triggered, save alert file and notify
if [ "$CRITICAL_TRIGGERED" = "1" ]; then
    echo "[$(date -u +%Y-%m-%d\ %H:%M:%S\ UTC)] CRITICAL THRESHOLD TRIGGERED - Creating alert..."
    
    # Save critical alert file
    {
        echo "# 🚨 CRITICAL AFFILIATE AUDIT ALERT"
        echo ""
        echo "**Timestamp:** $(date -u +%Y-%m-%d\ %H:%M:%S\ UTC)"
        echo ""
        echo "## Critical Thresholds Exceeded"
        echo ""
        echo "- **Sites Down:** $DOWN_SITES (threshold: >10) $([ "$DOWN_SITES" -gt 10 ] && echo "🔴 EXCEEDED" || echo "✅")"
        echo "- **New Broken Links:** $BROKEN_LINKS (threshold: >20) $([ "$BROKEN_LINKS" -gt 20 ] && echo "🔴 EXCEEDED" || echo "✅")"
        echo "- **New Missing Tags:** $MISSING_TAGS (threshold: >20) $([ "$MISSING_TAGS" -gt 20 ] && echo "🔴 EXCEEDED" || echo "✅")"
        echo ""
        echo "## Details from Latest Audit"
        echo ""
        tail -n +3 "$LATEST_FILE"
    } > "$CRITICAL_FILE"
    
    echo "[$(date -u +%Y-%m-%d\ %H:%M:%S\ UTC)] Critical alert saved to affiliate-audit-CRITICAL.md"
    echo "[$(date -u +%Y-%m-%d\ %H:%M:%S\ UTC)] Would message Mitch on Telegram (account: slashdaddy, target: 7550065844)"
else
    echo "[$(date -u +%Y-%m-%d\ %H:%M:%S\ UTC)] All critical thresholds OK ✅"
fi

echo "[$(date -u +%Y-%m-%d\ %H:%M:%S\ UTC)] Affiliate audit complete!"
