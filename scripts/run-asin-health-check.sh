#!/bin/bash

# ASIN Health Check - checks 200 ASINs per day
# Parse batch file and check each ASIN

BATCH_FILE="/tmp/asin-batch.txt"
RESULTS_FILE="/tmp/asin-results.json"
STATE_FILE="/home/ubuntu/.openclaw/workspace/scripts/sitestripe-healthcheck-state.json"
MEMORY_FILE="/home/ubuntu/.openclaw/workspace/memory/asin-healthcheck-latest.md"

# Initialize results array
echo "[]" > "$RESULTS_FILE"

# Read ASINs and check each one
DEAD_COUNT=0
CHECKED_COUNT=0
TITLES=()
ASINS=()

# Parse the batch file
while IFS='|' read -r title asin; do
  # Skip empty lines and summary lines
  if [[ -z "$title" ]] || [[ "$title" == *"Progress:"* ]] || [[ "$title" == *"Prepared batch"* ]]; then
    continue
  fi
  
  title=$(echo "$title" | xargs)  # trim
  asin=$(echo "$asin" | xargs)    # trim
  
  TITLES+=("$title")
  ASINS+=("$asin")
done < "$BATCH_FILE"

TOTAL_TO_CHECK=${#ASINS[@]}

echo "Checking $TOTAL_TO_CHECK ASINs..."

# Check each ASIN
for i in "${!ASINS[@]}"; do
  asin="${ASINS[$i]}"
  title="${TITLES[$i]}"
  
  # Skip duplicate ASINs (only check once per batch)
  if [[ $(printf '%s\n' "${ASINS[@]}" | grep -o "^$asin$" | wc -l) -gt 1 ]] && [[ $((i % 2)) -eq 1 ]]; then
    continue
  fi
  
  CHECKED_COUNT=$((CHECKED_COUNT + 1))
  
  # Check with curl (5 second timeout, follow redirects)
  HTTP_CODE=$(curl -s -o /tmp/asin_page.html -w '%{http_code}' --max-time 5 --connect-timeout 3 "https://www.amazon.com/dp/$asin" 2>/dev/null)
  
  IS_DEAD=0
  DEAD_REASON=""
  
  # Check for 404 or other error codes
  if [[ "$HTTP_CODE" == "404" ]]; then
    IS_DEAD=1
    DEAD_REASON="404 Not Found"
  elif [[ "$HTTP_CODE" != "200" ]]; then
    IS_DEAD=1
    DEAD_REASON="HTTP $HTTP_CODE"
  else
    # Check page content for "unavailable" or missing title
    if grep -q "Currently unavailable" /tmp/asin_page.html 2>/dev/null; then
      IS_DEAD=1
      DEAD_REASON="Currently unavailable"
    elif ! grep -q "id=\"productTitle\"" /tmp/asin_page.html 2>/dev/null; then
      IS_DEAD=1
      DEAD_REASON="No product title found"
    fi
  fi
  
  if [[ $IS_DEAD -eq 1 ]]; then
    DEAD_COUNT=$((DEAD_COUNT + 1))
    echo "DEAD: $asin - $DEAD_REASON"
  else
    echo "ALIVE: $asin"
  fi
  
  # Rate limit: 1 request per 500ms (2 per second)
  sleep 0.5
done

echo ""
echo "Check complete: $CHECKED_COUNT checked, $DEAD_COUNT dead"
