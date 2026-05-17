#!/bin/bash
###############################################################################
# fix-github-pages-https-v2.sh — Force cert provisioning by removing & re-adding CNAME
#
# The original phase1 just re-set the CNAME which didn't trigger cert creation.
# This version: removes CNAME → waits → re-adds CNAME → cert provisioning starts.
###############################################################################
set -uo pipefail

SITES_DIR="/home/ubuntu/.openclaw/workspace/sites"
TOKEN="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"
ORG="Brazenproducts"
LOG="/tmp/https-fix-v2-$(date -u +%Y%m%d-%H%M).log"

echo "═══════════════════════════════════════════════════════" | tee "$LOG"
echo "  HTTPS Fix v2 — $(date -u '+%Y-%m-%d %H:%M UTC')" | tee -a "$LOG"
echo "  Remove + re-add CNAME to force cert provisioning" | tee -a "$LOG"
echo "═══════════════════════════════════════════════════════" | tee -a "$LOG"

TRIGGERED=0
ALREADY=0
FAILED=0
SKIPPED=0

for site_dir in "$SITES_DIR"/*/; do
  [ -d "$site_dir/.git" ] || continue
  
  site=$(basename "$site_dir")
  remote=$(git -C "$site_dir" remote get-url origin 2>/dev/null || true)
  repo=$(echo "$remote" | grep -oP '[^/]+\.git$' | sed 's/\.git$//' || true)
  domain=$(cat "$site_dir/CNAME" 2>/dev/null || echo "$site")
  
  [ -z "$repo" ] && continue
  
  # Only process affiliate sites
  has_amazon=$(grep -rl "amazon.com" "$site_dir"/*.html 2>/dev/null | head -1)
  [ -z "$has_amazon" ] && continue

  # Check current status
  pages_json=$(curl -s -H "Authorization: token $TOKEN" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$ORG/$repo/pages" 2>/dev/null)
  
  https_enforced=$(echo "$pages_json" | python3 -c "import sys,json; print(json.load(sys.stdin).get('https_enforced',False))" 2>/dev/null || echo "Unknown")
  cert_state=$(echo "$pages_json" | python3 -c "import sys,json; d=json.load(sys.stdin); c=d.get('https_certificate',{}); print(c.get('state','none') if c else 'none')" 2>/dev/null || echo "none")
  
  if [ "$https_enforced" = "True" ]; then
    ALREADY=$((ALREADY + 1))
    continue
  fi
  
  # If cert is already being provisioned (new/pending), skip
  if [ "$cert_state" = "new" ] || [ "$cert_state" = "authorization_created" ] || [ "$cert_state" = "approved" ]; then
    echo "  ⏳ PROVISIONING: $site ($cert_state)" | tee -a "$LOG"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi
  
  # Remove CNAME
  curl -s -o /dev/null -X PUT \
    -H "Authorization: token $TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -d '{"cname": null, "source": {"branch": "main", "path": "/"}}' \
    "https://api.github.com/repos/$ORG/$repo/pages" 2>/dev/null
  
  sleep 1
  
  # Re-add CNAME
  resp=$(curl -s -w "%{http_code}" -o /dev/null -X PUT \
    -H "Authorization: token $TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -d "{\"cname\": \"$domain\", \"source\": {\"branch\": \"main\", \"path\": \"/\"}}" \
    "https://api.github.com/repos/$ORG/$repo/pages" 2>/dev/null)
  
  if [ "$resp" = "204" ]; then
    echo "  🔄 TRIGGERED: $site → $repo" | tee -a "$LOG"
    TRIGGERED=$((TRIGGERED + 1))
  else
    echo "  ❌ FAILED: $site → $repo (HTTP $resp)" | tee -a "$LOG"
    FAILED=$((FAILED + 1))
  fi
  
  sleep 1
done

echo "" | tee -a "$LOG"
echo "═══════════════════════════════════════════════════════" | tee -a "$LOG"
echo "  RESULTS" | tee -a "$LOG"
echo "  Already HTTPS: $ALREADY" | tee -a "$LOG"
echo "  Cert provisioning triggered: $TRIGGERED" | tee -a "$LOG"
echo "  Already provisioning: $SKIPPED" | tee -a "$LOG"
echo "  Failed: $FAILED" | tee -a "$LOG"
echo "═══════════════════════════════════════════════════════" | tee -a "$LOG"
echo "Log: $LOG" | tee -a "$LOG"
