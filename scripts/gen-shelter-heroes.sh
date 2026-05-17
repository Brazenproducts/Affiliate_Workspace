#!/usr/bin/env bash
set -e
KEY="xai-S5hLItB2sSmg3xR10q6UPzUvlTjDKA1riY44VljVHiZP7jQrTBVhI8QkZvo7OuuLd1VPctYX560cHhhr"
OUTDIR="/home/ubuntu/.openclaw/workspace/affiliate-sites"

gen_image() {
  local domain="$1"
  local prompt="$2"
  local outpath="$OUTDIR/$domain/images/hero.jpg"
  mkdir -p "$OUTDIR/$domain/images"
  echo "=== $domain ==="
  local resp
  resp=$(curl -s https://api.x.ai/v1/images/generations \
    -H "Authorization: Bearer $KEY" \
    -H "Content-Type: application/json" \
    -d "{\"model\":\"grok-imagine-image\",\"prompt\":$(jq -Rs . <<<"$prompt"),\"n\":1,\"response_format\":\"url\"}")
  local url
  url=$(echo "$resp" | jq -r '.data[0].url // empty')
  if [ -z "$url" ]; then
    echo "FAIL $domain: $resp" | head -c 400
    echo
    return 1
  fi
  curl -s -L -o "$outpath" "$url"
  ls -la "$outpath"
}

gen_image "bestemergencyshelters.com" "Professional photo: modern above-ground steel emergency tornado shelter installed outside a community center, daytime, clear sky, no people, architectural photography, high detail, clean composition, no text overlays"

gen_image "bestsaferooms.com" "Professional photo: interior of a residential FEMA-compliant safe room, reinforced steel door open showing solid concrete walls, fluorescent lighting, organized emergency supplies on shelves, no people, architectural photography, no text"

gen_image "besthurricaneshelter.com" "Professional photo: large concrete hurricane shelter building exterior in coastal Florida setting, palm trees in distance, partly cloudy sky, institutional architecture, no people, no text overlays, photorealistic"

gen_image "stormshelterreviews.com" "Professional photo: row of underground storm shelter hatches installed in a suburban backyard, green grass, daylight, clean composition, no people, no text, architectural detail"

gen_image "emergencyhousingreviews.com" "Professional photo: row of modern modular emergency housing units arranged in a staging area after a natural disaster, daytime, organized layout, clean white units, no people, no text overlays, photorealistic documentary style"

gen_image "bestdisasterhousing.com" "Professional photo: aerial view of a temporary disaster relief housing village with neat rows of small modular homes, cleared land, sunny day, no people visible, no text, photorealistic documentary style"

gen_image "bestcommunityshelters.com" "Professional photo: large municipal community storm shelter building exterior, brick and concrete construction, American flag on pole nearby, civic architecture, daytime, no people in frame, no text overlays, photorealistic"

gen_image "bestmodularshelters.com" "Professional photo: prefabricated modular shelter units being delivered on flatbed truck to installation site, industrial setting, daytime, clean composition, no people, no text overlays, photorealistic"

echo
echo "Done. Generated images:"
ls -la $OUTDIR/*/images/hero.jpg 2>/dev/null
