#!/usr/bin/env bash
# SERP check the cleanest high-yield candidates via Grok web_search
KEY="xai-S5hLItB2sSmg3xR10q6UPzUvlTjDKA1riY44VljVHiZP7jQrTBVhI8QkZvo7OuuLd1VPctYX560cHhhr"

# Top picks (skip typo'd domains, prioritize by commission tier)
QUERIES=(
  # Luxury Beauty 10%
  "best luxury perfume"
  "best niche perfume"
  "best luxury skincare"
  "best designer fragrance"
  "best luxury cologne"
  "best luxury eye cream"
  "best luxury face cream"
  "best mens luxury cologne"
  "best luxury lipstick"
  "best luxury foundation"
  "best luxury mascara"
  "best luxury hair care"
  "best luxury serum"
  # Kitchen 4.5%
  "best sous vide"
  "best pasta maker"
  "best dutch oven"
  "best cast iron skillet"
  # Automotive 4.5%
  "best car wash kit"
  "best car polisher"
  "best tire inflator"
  "best rooftop cargo"
  "best towing strap"
  "best bike rack suv"
  "best tire patch"
  "best headlight restoration"
  # Furniture/Tools high-ticket 3%
  "best dining table"
  "best king mattress"
  "best murphy bed"
  "best platform bed"
  "best tool chest"
  "best bench grinder"
  "best nail gun"
  "best reciprocating saw"
  "best band saw"
  "best laser measure"
)

PROMPT='For each Google search query below, look up the actual top 5 organic Google results RIGHT NOW (US-based, desktop). Return ONLY a JSON array with keys: query, top5 (array of domains, no www), amazonRank (1-10 or null), notes (short string about competition).

Queries:
'

for q in "${QUERIES[@]}"; do
  PROMPT+="- $q"$'\n'
done

JSON_BODY=$(jq -nc --arg p "$PROMPT" '{
  model: "grok-4-fast",
  input: $p,
  tools: [{type: "web_search"}]
}')

echo "Querying Grok for SERP rankings on $(echo "${#QUERIES[@]}") queries..."
RESPONSE=$(curl -s -X POST "https://api.x.ai/v1/responses" \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d "$JSON_BODY")

echo "$RESPONSE" | jq -r '.output[] | select(.type=="message") | .content[].text' 2>/dev/null > /home/ubuntu/.openclaw/workspace/memory/high-yield-serp-raw.txt

echo "✅ Saved to memory/high-yield-serp-raw.txt"
cat /home/ubuntu/.openclaw/workspace/memory/high-yield-serp-raw.txt
