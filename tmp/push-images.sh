#!/bin/bash
PAT="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"
IMGS="/home/ubuntu/.openclaw/workspace/tmp/site-images"
TMPDIR=$(mktemp -d)

push_image() {
  local repo=$1 img=$2
  cd "$TMPDIR"
  git clone --depth 1 "https://${PAT}@github.com/Brazenproducts/$repo.git" "$repo" 2>/dev/null
  cd "$repo"
  mkdir -p images
  cp "$IMGS/$img" images/hero.png
  git add images/hero.png
  git commit -m "Add hero image" 2>/dev/null
  git push 2>/dev/null
  cd "$TMPDIR"
  rm -rf "$repo"
  echo "$repo: pushed"
}

push_image "tacticalseats.com" "tactical-hero.png"
push_image "tacticalseatcovers.com" "offroad-hero.png"
push_image "bestoffroadbrands.com" "offroad-brands.png"
push_image "topoffroadstores.com" "offroad-hero.png"
push_image "autopartsreviewed.com" "autoparts-store.png"
push_image "homehvacfilters.com" "hvac-hero.png"
push_image "bestwindshieldwiper.com" "wiper-hero.png"
push_image "tacomaseats.com" "tacoma-hero.png"

rm -rf "$TMPDIR"
echo "ALL DONE"
