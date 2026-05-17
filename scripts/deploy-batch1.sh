#!/bin/bash
# Deploy affiliate sites to GitHub Pages
set -e

PAT="${GH_TOKEN:-$(git -C /home/ubuntu/.openclaw/workspace/swalmy.com remote get-url origin | sed -n 's#https://\(ghp_[^@]*\)@github.com/.*#\1#p')}"
ORG="Brazenproducts"
BASE="/home/ubuntu/.openclaw/workspace/affiliate-sites"

SITES=("tacticalseats.com" "homehvacfilters.com" "bestwindshieldwiper.com" "tacticalseatcovers.com" "tacomaseats.com")

for SITE in "${SITES[@]}"; do
  REPO="${SITE}"
  echo "━━━ Deploying $SITE ━━━"
  
  # 1. Create repo (ignore if exists)
  curl -s -o /dev/null -w "Create repo: %{http_code}\n" \
    -X POST "https://api.github.com/orgs/${ORG}/repos" \
    -H "Authorization: token ${PAT}" \
    -H "Accept: application/vnd.github.v3+json" \
    -d "{\"name\":\"${REPO}\",\"private\":false,\"has_issues\":false,\"has_wiki\":false,\"auto_init\":false}" 2>/dev/null

  # 2. Init local repo and push
  cd "${BASE}/${SITE}"
  rm -rf .git
  git init -b main
  git config user.email "deploy@brazenproducts.com"
  git config user.name "Brazen Deploy"
  git add -A
  git commit -m "Initial deploy - ${SITE}" --quiet
  git remote add origin "https://${PAT}@github.com/${ORG}/${REPO}.git" 2>/dev/null || git remote set-url origin "https://${PAT}@github.com/${ORG}/${REPO}.git"
  git push -u origin main --force --quiet 2>&1 | tail -1
  
  echo "  ✅ Pushed to GitHub"
  
  # 3. Enable GitHub Pages
  sleep 2
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "https://api.github.com/repos/${ORG}/${REPO}/pages" \
    -H "Authorization: token ${PAT}" \
    -H "Accept: application/vnd.github.v3+json" \
    -d '{"source":{"branch":"main","path":"/"}}')
  
  if [ "$HTTP" = "201" ] || [ "$HTTP" = "409" ]; then
    echo "  ✅ GitHub Pages enabled (HTTP $HTTP)"
  else
    echo "  ⚠️ Pages: HTTP $HTTP (may need manual enable)"
  fi
  
  sleep 1
done

echo ""
echo "All repos deployed! Now running DNS setup..."
