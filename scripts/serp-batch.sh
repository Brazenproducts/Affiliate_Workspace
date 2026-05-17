#!/usr/bin/env bash
# Verify Google SERP rank for Amazon across all our top affiliate domain candidates.
KEY="xai-S5hLItB2sSmg3xR10q6UPzUvlTjDKA1riY44VljVHiZP7jQrTBVhI8QkZvo7OuuLd1VPctYX560cHhhr"
OUT=/home/ubuntu/.openclaw/workspace/memory/serp-rankings.jsonl
> "$OUT"

QUERIES=(
  "best magnesium glycinate"
  "best magnetic eyelashes"
  "best walking pad"
  "best neck lift tape"
  "best protein powder"
  "best compression socks"
  "best air fryer"
  "best lash clusters"
  "best weighted vest"
  "best portable charger"
  "best pimple patches"
  "best mini fridge"
  "best water bottle"
  "best mushroom coffee"
  "best air purifier"
  "best queen mattress"
  "best heating pad"
  "best massage gun"
  "best robot vacuum"
  "best espresso machine"
  "best electric toothbrush"
  "best gaming chair"
  "best dash cam"
  "best ice maker"
  "best standing desk"
  "best floor mats"
  "best car seat covers"
  "best portable ac"
  "best weighted blanket"
  "best noise cancelling headphones"
  "best 3d printer"
  "best digital camera"
  "best power bank"
  "best ring doorbell"
  "best vibration plate"
  "best label maker"
  "best golf balls"
  "best office chair"
  "best solar lights outdoor"
  "best patio furniture"
  "best resistance bands"
  "best shower head"
  "best rice cooker"
  "best pheromone cologne"
  "best creatine"
)

echo "Checking ${#QUERIES[@]} queries..."
i=0
for Q in "${QUERIES[@]}"; do
  i=$((i+1))
  PAYLOAD=$(jq -nc --arg q "$Q" '{
    model: "grok-4-fast",
    tools: [{"type":"web_search"}],
    input: ("Search Google for: " + $q + ". Return ONLY a JSON object: {query, top10 (array of domain names without www), amazonRank (number 1-10 if amazon.com appears in top 10, or null)}. No other text.")
  }')
  RESP=$(curl -s -X POST https://api.x.ai/v1/responses -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d "$PAYLOAD")
  TEXT=$(echo "$RESP" | jq -r '.output[] | select(.type=="message") | .content[0].text // empty' 2>/dev/null)
  if [ -z "$TEXT" ]; then
    echo "[$i/${#QUERIES[@]}] $Q -> ERROR: $(echo "$RESP" | head -c 200)"
    continue
  fi
  # Strip code fences if present
  CLEAN=$(echo "$TEXT" | sed 's/^```json//;s/^```//;s/```$//' | tr -d '\n' | sed 's/  */ /g')
  RANK=$(echo "$CLEAN" | jq -r '.amazonRank // "null"' 2>/dev/null)
  TOP10=$(echo "$CLEAN" | jq -r '.top10 | join(", ")' 2>/dev/null)
  printf "[%2d/%d] rank=%-4s | %-38s | %s\n" "$i" "${#QUERIES[@]}" "$RANK" "$Q" "$TOP10"
  echo "$CLEAN" >> "$OUT"
done

echo ""
echo "Done. Results in $OUT"
