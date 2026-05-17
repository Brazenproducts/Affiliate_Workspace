#!/usr/bin/env bash
# Use Grok with web_search tool (Agent Tools API) to verify Google SERP rankings.
KEY="xai-S5hLItB2sSmg3xR10q6UPzUvlTjDKA1riY44VljVHiZP7jQrTBVhI8QkZvo7OuuLd1VPctYX560cHhhr"

QUERY="$1"

JSON_BODY=$(jq -nc --arg q "$QUERY" '{
  model: "grok-4-fast",
  tools: [{ type: "web_search" }],
  tool_choice: "auto",
  messages: [
    { role: "system", content: "You are a SERP research assistant. Use web_search to look up the live Google search results for the query. Return ONLY a JSON object with keys: query, top10 (array of domain names in order, no www, no protocol), amazonRank (number 1-10 or null), reviewSites (count of how many top 10 are review/affiliate sites like wirecutter, forbes, healthline, etc). No markdown, no commentary, just the JSON." },
    { role: "user", content: ("Look up the live Google US search results for: " + $q + "\nReturn the JSON.") }
  ]
}')

curl -s -X POST https://api.x.ai/v1/chat/completions \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d "$JSON_BODY" | jq -r '.choices[0].message.content // (.error|tostring) // tostring'
