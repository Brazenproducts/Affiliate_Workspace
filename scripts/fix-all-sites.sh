#!/bin/bash
# Fix wrong Bartact prices, wrong images, and broken brand images across ALL affiliate sites
# Run from workspace root

set -e

WORKSPACE="/home/ubuntu/.openclaw/workspace"
GITHUB_TOKEN="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"
FIXED_REPOS=()
ERRORS=()

# Correct Bartact prices by vehicle:
# Tacoma front: $420-$470/row
# 4Runner front: $470-$570/row  
# Jeep (Wrangler/Gladiator) front: $300-$510/row (Baseline $300, Tactical $460-$510)
# Bronco front: $470-$500/row
# Generic "Bartact seat covers": $300-$510/row

# Files that are live repos (not /projects/ or /affiliate-sites/ or /tmp/)
LIVE_REPOS=(
  "besttruckaccessories.com"
  "besttonneaucovers.com"
  "whatarebest.com"
  "broncolift.com"
  "rivianaftermarket.com"
  "jeepseatcover.com"
  "wranglerseatcover.com"
  "autopartsreviewed.com"
)

echo "=== Phase 1: Fix wrong prices ==="
for repo in "${LIVE_REPOS[@]}"; do
  REPO_DIR="$WORKSPACE/$repo"
  if [ ! -d "$REPO_DIR" ]; then
    echo "SKIP: $repo (not cloned)"
    continue
  fi
  
  CHANGED=false
  
  # Find HTML files with wrong prices
  for f in "$REPO_DIR"/*.html; do
    [ -f "$f" ] || continue
    if grep -q '\$650.*\$900\|\$650-\$900' "$f" 2>/dev/null; then
      echo "  FIX PRICE: $f"
      # Context-aware price replacement
      # If file mentions Tacoma specifically
      if grep -q -i 'tacoma' "$f"; then
        sed -i 's/~\$650-\$900 depending on row and trim/~\$420-\$470 per row/g' "$f"
        sed -i 's/~\$650-\$900/~\$420-\$470 per row/g' "$f"
        sed -i 's/\$650–\$900/\$420–\$470\/row/g' "$f"
      # If file mentions 4Runner specifically
      elif grep -q -i '4runner\|4-runner' "$f"; then
        sed -i 's/~\$650-\$900/~\$470-\$570 per row/g' "$f"
        sed -i 's/\$650–\$900/\$470–\$570\/row/g' "$f"
      # Generic Bartact price
      else
        sed -i 's/~\$650-\$900/~\$300-\$510 per row/g' "$f"
        sed -i 's/\$650–\$900/\$300–\$510\/row/g' "$f"
        sed -i 's/\$650-\$900/\$300-\$510\/row/g' "$f"
      fi
      CHANGED=true
    fi
  done
  
  # Fix broken DERA brand images
  for f in "$REPO_DIR"/*.html; do
    [ -f "$f" ] || continue
    if grep -q 'DERA-BARTACT' "$f" 2>/dev/null; then
      echo "  FIX DERA IMAGE: $f"
      sed -i 's|<div style="float:right;margin:0 0 12px 20px;max-width:160px"><img src="https://bartact.com/cdn/shop/files/DERA-BARTACT-UNIVERSAL-TAN-1.jpg[^"]*" alt="Bartact" style="width:100%;border-radius:8px" loading="lazy"></div>||g' "$f"
      CHANGED=true
    fi
  done
  
  if [ "$CHANGED" = true ]; then
    cd "$REPO_DIR"
    git add -A
    if git diff --cached --quiet; then
      echo "  No actual changes in $repo"
    else
      git commit -m "Fix: correct Bartact prices to real Shopify data, remove broken images"
      git push origin main && echo "  PUSHED: $repo" || ERRORS+=("$repo: push failed")
      FIXED_REPOS+=("$repo")
    fi
  fi
done

echo ""
echo "=== Phase 2: Fix Wrangler TJ images on NON-Jeep sites ==="
# whatarebest.com and autopartsreviewed.com should NOT have Wrangler TJ as their Bartact representative image
# Replace with a generic Bartact product shot (use Tacoma 2020-23 as general brand image)
TACOMA_IMG="https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-toyota-tacoma-seat-covers-black-red-front-tactical-seat-covers-for-toyota-tacoma-2020-22-all-models-w-electric-driver-manual-passenger-seat-trd-non-trd-bartact-w-molle-pair-29.jpg?v=1762457325"

for repo in "whatarebest.com" "autopartsreviewed.com"; do
  REPO_DIR="$WORKSPACE/$repo"
  if [ ! -d "$REPO_DIR" ]; then continue; fi
  
  for f in "$REPO_DIR"/*.html; do
    [ -f "$f" ] || continue
    if grep -q '29023020023851' "$f" 2>/dev/null; then
      echo "  FIX WRANGLER TJ IMAGE: $f (replacing with Tacoma product shot)"
      sed -i "s|https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-jeep-wrangler-seat-covers-black-graphite-front-tactical-seat-covers-for-jeep-wrangler-tj-1997-02-pair-w-molle-bartact-29023020023851.jpg?v=1762457055|$TACOMA_IMG|g" "$f"
    fi
  done
  
  cd "$REPO_DIR"
  git add -A
  if ! git diff --cached --quiet; then
    git commit -m "Fix: replace Wrangler TJ image with actual product photo"
    git push origin main && echo "  PUSHED: $repo" || ERRORS+=("$repo: push failed")
    FIXED_REPOS+=("$repo")
  fi
done

echo ""
echo "=== RESULTS ==="
echo "Fixed repos: ${FIXED_REPOS[*]}"
echo "Errors: ${ERRORS[*]:-none}"
