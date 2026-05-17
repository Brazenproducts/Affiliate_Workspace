#!/bin/bash
set -e

GH_TOKEN="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"
ORG="Brazenproducts"
BASE="/home/ubuntu/.openclaw/workspace/affiliate-sites"

for SITE in autopartsreviewed.com topoffroadstores.com bestoffroadbrands.com; do
  echo "=== Deploying $SITE ==="
  
  # Create repo via API
  echo "  Creating repo..."
  curl -s -X POST \
    -H "Authorization: token $GH_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/orgs/$ORG/repos" \
    -d "{\"name\":\"$SITE\",\"private\":false,\"has_issues\":false,\"has_wiki\":false}" \
    | grep -o '"full_name":"[^"]*"' || true
  
  # Init and push
  cd "$BASE/$SITE"
  git init -b main
  git config user.email "deploy@brazenproducts.com"
  git config user.name "Brazen Deploy"
  git add -A
  git commit -m "Initial site deployment - $(date +%Y-%m-%d)"
  git remote add origin "https://$GH_TOKEN@github.com/$ORG/$SITE.git" 2>/dev/null || git remote set-url origin "https://$GH_TOKEN@github.com/$ORG/$SITE.git"
  git push -u origin main --force
  
  # Enable GitHub Pages
  echo "  Enabling GitHub Pages..."
  curl -s -X POST \
    -H "Authorization: token $GH_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$ORG/$SITE/pages" \
    -d '{"source":{"branch":"main","path":"/"}}' \
    | grep -o '"html_url":"[^"]*"' || echo "  (Pages may already be enabled)"
  
  echo "  ✅ $SITE deployed!"
  echo ""
done

echo "=== ALL 3 SITES DEPLOYED ==="
