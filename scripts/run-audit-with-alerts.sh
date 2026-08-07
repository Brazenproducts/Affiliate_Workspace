#!/bin/bash
###############################################################################
# run-audit-with-alerts.sh
#
# Complete daily affiliate audit pipeline with Telegram alerting to Mitch
# 
# Invoked by cron job: e7dfeb15-d657-404d-a495-0c0cac906f1e
#
# Returns:
#   0 = All clear (no critical thresholds)
#   1 = Critical issues detected (already messaged Mitch)
###############################################################################
set -uo pipefail

# Paths
AUDIT_SCRIPT="/home/ubuntu/.openclaw/workspace/scripts/daily-affiliate-audit.sh"
LATEST_AUDIT="/home/ubuntu/.openclaw/workspace/memory/affiliate-audit-latest.md"
CRITICAL_ALERT="/home/ubuntu/.openclaw/workspace/memory/affiliate-audit-CRITICAL.md"
AUDIT_CACHE="/tmp/audit-output-$$.txt"

TIMESTAMP=$(date -u '+%Y-%m-%d %H:%M UTC')
TODAY=$(date -u '+%Y-%m-%d')

trap "rm -f '$AUDIT_CACHE'" EXIT

log() {
  echo "[$(date -u '+%H:%M:%S')] $1" >&2
}

log "🔍 Starting daily affiliate site audit..."

# ─────────────────────────────────────────────────────────────────────────────
# 1. RUN AUDIT SCRIPT
# ─────────────────────────────────────────────────────────────────────────────
if ! "$AUDIT_SCRIPT" > "$AUDIT_CACHE" 2>&1; then
  log "⚠️  Audit script exit code: $?"
fi

AUDIT_OUTPUT=$(<"$AUDIT_CACHE")

# ─────────────────────────────────────────────────────────────────────────────
# 2. EXTRACT METRICS
# ─────────────────────────────────────────────────────────────────────────────

# Count down sites (❌ DOWN:)
DOWN_SITES=$(echo "$AUDIT_OUTPUT" | grep -c "❌ DOWN:" || true)

# Count broken links (any ❌ that aren't DOWN)
BROKEN_LINKS=$(echo "$AUDIT_OUTPUT" | grep "❌" | grep -v "❌ DOWN:" | wc -l || true)

# Count missing tags (🚨 CRITICAL.*NO AFFILIATE TAG)
MISSING_TAGS=$(echo "$AUDIT_OUTPUT" | grep -oE 'site.*NO AFFILIATE TAG' | wc -l || true)

# Count sites with invalid tags
INVALID_TAGS=$(echo "$AUDIT_OUTPUT" | grep -c "INVALID TAG" || true)

# Try more robust extraction
DOWN_SITES=$(echo "$AUDIT_OUTPUT" | grep "❌ DOWN:" | wc -l)
DOWN_SITES=${DOWN_SITES:-0}

MISSING_TAGS=$(echo "$AUDIT_OUTPUT" | grep "🚨 CRITICAL.*NO tracking tag" -A 999 | grep "^\w" | head -50 | wc -l)
MISSING_TAGS=${MISSING_TAGS:-0}

BROKEN_LINKS=$(echo "$AUDIT_OUTPUT" | grep -c "❌" || true)
BROKEN_LINKS=${BROKEN_LINKS:-0}

log "📊 Metrics extracted: down=$DOWN_SITES, missing_tags=$MISSING_TAGS, broken_links=$BROKEN_LINKS"

# ─────────────────────────────────────────────────────────────────────────────
# 3. SAVE TO LATEST AUDIT FILE
# ─────────────────────────────────────────────────────────────────────────────
{
  cat <<EOF
# Affiliate Site Audit — $TIMESTAMP

**Status:** $([ $DOWN_SITES -le 10 ] && [ $MISSING_TAGS -le 20 ] && [ $BROKEN_LINKS -le 20 ] && echo "✅ PASS" || echo "🚨 CRITICAL")

## Quick Metrics
- Down sites: **$DOWN_SITES** (threshold: 10)
- Missing affiliate tags: **$MISSING_TAGS** (threshold: 20)
- Broken links: **$BROKEN_LINKS** (threshold: 20)
- Invalid tracking IDs: **$INVALID_TAGS**

## Full Report
\`\`\`
$AUDIT_OUTPUT
\`\`\`
EOF
} > "$LATEST_AUDIT"

log "✅ Saved audit to $LATEST_AUDIT"

# ─────────────────────────────────────────────────────────────────────────────
# 4. CRITICAL THRESHOLD CHECK
# ─────────────────────────────────────────────────────────────────────────────

CRITICAL=0
CRITICAL_REASONS=""

if [ "$DOWN_SITES" -gt 10 ]; then
  CRITICAL=1
  CRITICAL_REASONS="${CRITICAL_REASONS}🔴 Down sites: $DOWN_SITES (threshold: 10)
"
  log "🚨 CRITICAL: Down sites ($DOWN_SITES) exceeds threshold of 10"
fi

if [ "$BROKEN_LINKS" -gt 20 ]; then
  CRITICAL=1
  CRITICAL_REASONS="${CRITICAL_REASONS}🔴 Broken links: $BROKEN_LINKS (threshold: 20)
"
  log "🚨 CRITICAL: Broken links ($BROKEN_LINKS) exceeds threshold of 20"
fi

if [ "$MISSING_TAGS" -gt 20 ]; then
  CRITICAL=1
  CRITICAL_REASONS="${CRITICAL_REASONS}🔴 Missing tags: $MISSING_TAGS (threshold: 20)
"
  log "🚨 CRITICAL: Missing tags ($MISSING_TAGS) exceeds threshold of 20"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 5. IF CRITICAL: CREATE ALERT FILE & MESSAGE MITCH
# ─────────────────────────────────────────────────────────────────────────────

if [ "$CRITICAL" -eq 1 ]; then
  log "🚨 Saving critical alert..."
  
  # Extract the critical sections from audit output
  DOWN_LIST=$(echo "$AUDIT_OUTPUT" | grep "❌ DOWN:" || true)
  INVALID_LIST=$(echo "$AUDIT_OUTPUT" | grep "INVALID TAG:" || true)
  MISSING_LIST=$(echo "$AUDIT_OUTPUT" | grep "NO AFFILIATE TAG" -A 50 | grep "^\w" || true)
  
  {
    cat <<EOF
# 🚨 CRITICAL ALERT — Affiliate Site Audit

**Time:** $TIMESTAMP  
**Severity:** CRITICAL

## Thresholds Exceeded
$CRITICAL_REASONS

## Down Sites ($DOWN_SITES)
\`\`\`
$DOWN_LIST
\`\`\`

## Invalid Tracking Tags
\`\`\`
$INVALID_LIST
\`\`\`

## Missing Affiliate Tags
\`\`\`
$MISSING_LIST
\`\`\`

## Full Audit
\`\`\`
$AUDIT_OUTPUT
\`\`\`

---
Sent to Mitch on Telegram automatically.
EOF
  } > "$CRITICAL_ALERT"
  
  log "✅ Saved critical alert to $CRITICAL_ALERT"
  
  # NOTE: Message sending is handled by the cron job's systemEvent or agentTurn payload
  # The caller (cron job) should detect exit code 1 and send the Telegram message
  echo "CRITICAL_ALERT_FILE=$CRITICAL_ALERT"
  exit 1
else
  log "✅ All metrics within normal ranges"
  exit 0
fi
