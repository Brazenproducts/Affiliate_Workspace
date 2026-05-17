#!/bin/bash
TOKEN="Atza|IwEBIM_KZBUs-iTJDr4xMDSeDix7TwszSJcYl77abulEGKL2D8EW1eDbVe8f5GgmUBoiIZb0eJlJVHLappU1cwzScCHXfTX7MiSTEi9-BaOKF6AEuiaVYE9k9ovgf4_1QkR2LqAo3jQi_T5Z6GEJKMcJB48G4oF_l52b62qHrRa9W3Z4sW7STZRTGLRd50q74d8BSUTyKs7DUcUgqzjNSLgoQmpTJPFFW6yZvI9WmySPavmDRFRkNmRBtxMF8_59B__bIp9iDk0hQ7YVo4xNZrv4o_Ph_Ki8Y-srr_vVkTAaOOmaHtP5D5T1HBicocUTV3zFjMX3oLwQZxbZZbALS3nZCSkc"
SELLER="A239XCX0K8RYS8"
MARKETPLACE="ATVPDKIKX0DER"

# Fetch first 3 pages (60 items) with full attributes for audit sampling
PAGE=1
NEXT_TOKEN=""
ALL_ITEMS="[]"

for i in 1 2 3; do
  if [ -z "$NEXT_TOKEN" ]; then
    URL="https://sellingpartnerapi-na.amazon.com/listings/2021-08-01/items/${SELLER}?marketplaceIds=${MARKETPLACE}&pageSize=20&includedData=summaries,attributes,issues,offers,fulfillmentAvailability"
  else
    ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$NEXT_TOKEN'))")
    URL="https://sellingpartnerapi-na.amazon.com/listings/2021-08-01/items/${SELLER}?marketplaceIds=${MARKETPLACE}&pageSize=20&includedData=summaries,attributes,issues,offers,fulfillmentAvailability&pageToken=${ENCODED}"
  fi
  
  RESPONSE=$(curl -s "$URL" \
    -H "x-amz-access-token: $TOKEN" \
    -H "Content-Type: application/json")
  
  echo "=== PAGE $i ===" >> /tmp/amazon_raw.json
  echo "$RESPONSE" >> /tmp/amazon_raw.json
  
  NEXT_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('pagination',{}).get('nextToken',''))" 2>/dev/null)
  
  if [ -z "$NEXT_TOKEN" ]; then
    break
  fi
  
  sleep 0.5
done

echo "Done fetching pages"
