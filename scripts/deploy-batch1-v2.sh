#!/bin/bash
set -e
PAT="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"
USER="Brazenproducts"
BASE="/home/ubuntu/.openclaw/workspace/affiliate-sites"

SITES=("tacticalseats.com" "homehvacfilters.com" "bestwindshieldwiper.com" "tacticalseatcovers.com" "tacomaseats.com")

for SITE in "${SITES[@]}"; do
  echo "━━━ $SITE ━━━"
  
  # Create repo under user account
  HTTP=$(curl -s -o /tmp/gh_create.json -w "%{http_code}" \
    -X POST "https://api.github.com/user/repos" \
    -H "Authorization: token ${PAT}" \
    -H "Accept: application/vnd.github.v3+json" \
    -d "{\"name\":\"${SITE}\",\"private\":false,\"has_issues\":false,\"has_wiki\":false,\"auto_init\":false}")
  echo "  Create: HTTP $HTTP"
  if [ "$HTTP" != "201" ] && [ "$HTTP" != "422" ]; then
    cat /tmp/gh_create.json | python3 -c "import sys,json;print(json.load(sys.stdin).get('message',''))" 2>/dev/null
  fi

  cd "${BASE}/${SITE}"
  rm -rf .git
  git init -b main --quiet
  git config user.email "deploy@brazenproducts.com"
  git config user.name "Brazen Deploy"
  git add -A
  git commit -m "Initial deploy - ${SITE}" --quiet
  git remote add origin "https://${PAT}@github.com/${USER}/${SITE}.git" 2>/dev/null || git remote set-url origin "https://${PAT}@github.com/${USER}/${SITE}.git"
  
  if git push -u origin main --force --quiet 2>&1; then
    echo "  ✅ Pushed"
  else
    echo "  ❌ Push failed"
    continue
  fi
  
  sleep 2
  
  # Enable Pages
  PG=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "https://api.github.com/repos/${USER}/${SITE}/pages" \
    -H "Authorization: token ${PAT}" \
    -H "Accept: application/vnd.github.v3+json" \
    -d '{"source":{"branch":"main","path":"/"}}')
  echo "  Pages: HTTP $PG"
  
  sleep 1
done
echo "Done!"
