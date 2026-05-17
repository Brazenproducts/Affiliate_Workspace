#!/usr/bin/env bash
# Use Grok with live search to verify Google SERP for our affiliate domain candidates.
# Grok has built-in real-time web access.

KEY="xai-S5hLItB2sSmg3xR10q6UPzUvlTjDKA1riY44VljVHiZP7jQrTBVhI8QkZvo7OuuLd1VPctYX560cHhhr"

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
)

PROMPT='For each of these Google search queries, look up the actual top 5 organic Google search results RIGHT NOW (US-based, desktop). For each query return: 1) the query, 2) the top 5 result domains in order, 3) whether amazon.com appears in the top 10. Return ONLY a JSON array of objects with keys: query, top5 (array of domains, no www), amazonRank (number 1-10 or null if not in top 10). No markdown, no commentary.

Queries:
'

for q in "${QUERIES[@]}"; do
  PROMPT+="- $q"$'\n'
done

JSON_BODY=$(jq -nc --arg p "$PROMPT" '{
  model: "grok-4-fast",
  search_parameters: { mode: "on", return_citations: true },
  messages: [
    { role: "system", content: "You are a SERP research assistant. You MUST use live Google search to answer. Return only valid JSON." },
    { role: "user", content: $p }
  ]
}')

curl -s -X POST https://api.x.ai/v1/chat/completions \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d "$JSON_BODY" | jq -r '.choices[0].message.content // .error // .'
