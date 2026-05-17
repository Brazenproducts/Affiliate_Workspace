#!/bin/bash
# Build all 8 emergency shelter affiliate sites
set -e

BASEDIR="/home/ubuntu/.openclaw/workspace/affiliate-sites"
GITHUB_PAT="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"
GITHUB_ORG="Brazenproducts"
GODADDY_KEY="9QCBbdvZc9n_N3jPNv71WzKBpDcn8XCmyV"
GODADDY_SECRET="VVAAEQkkEyCVAtwqyCadwG"
INDEXNOW_KEY="b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5"

DOMAINS=(
  "bestemergencyshelters.com"
  "bestsaferooms.com"
  "besthurricaneshelter.com"
  "stormshelterreviews.com"
  "emergencyhousingreviews.com"
  "bestdisasterhousing.com"
  "bestcommunityshelters.com"
  "bestmodularshelters.com"
)

for domain in "${DOMAINS[@]}"; do
  echo ""
  echo "=========================================="
  echo "  Processing: $domain"
  echo "=========================================="
  
  SITEDIR="$BASEDIR/$domain"
  
  # Step 1: Create GitHub repo
  echo "  [1/6] Creating GitHub repo..."
  REPO_RESP=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: token $GITHUB_PAT" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/orgs/$GITHUB_ORG/repos" \
    -d "{\"name\":\"$domain\",\"private\":false,\"has_issues\":false,\"has_wiki\":false}")
  HTTP_CODE=$(echo "$REPO_RESP" | tail -1)
  echo "    Repo create status: $HTTP_CODE"
  
  # Step 2: Build site (done by node script)
  echo "  [2/6] Building site..."
  node "$BASEDIR/shelter-build/generate-site.js" "$domain"
  
  # Step 3: Git push
  echo "  [3/6] Pushing to GitHub..."
  cd "$SITEDIR"
  git init -b main 2>/dev/null || git init && git checkout -b main 2>/dev/null
  git add -A
  git commit -m "Initial site build" 2>/dev/null || echo "    Already committed"
  git remote remove origin 2>/dev/null || true
  git remote add origin "https://$GITHUB_PAT@github.com/$GITHUB_ORG/$domain.git"
  git push -u origin main --force 2>&1 | head -5
  
  # Enable GitHub Pages
  echo "  [3b/6] Enabling GitHub Pages..."
  curl -s -X POST \
    -H "Authorization: token $GITHUB_PAT" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$GITHUB_ORG/$domain/pages" \
    -d '{"source":{"branch":"main","path":"/"}}' | head -c 200
  echo ""
  
  # Set custom domain via CNAME in repo
  echo "  [3c/6] Setting custom domain..."
  curl -s -X PUT \
    -H "Authorization: token $GITHUB_PAT" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$GITHUB_ORG/$domain/pages" \
    -d "{\"cname\":\"$domain\",\"source\":{\"branch\":\"main\",\"path\":\"/\"}}" | head -c 200
  echo ""
  
  # Step 4: Set DNS via GoDaddy
  echo "  [4/6] Setting DNS records..."
  DNS_RESP=$(curl -s -w "\n%{http_code}" -X PUT \
    -H "Authorization: sso-key $GODADDY_KEY:$GODADDY_SECRET" \
    -H "Content-Type: application/json" \
    "https://api.godaddy.com/v1/domains/$domain/records" \
    -d '[
      {"type":"A","name":"@","data":"185.199.108.153","ttl":600},
      {"type":"A","name":"@","data":"185.199.109.153","ttl":600},
      {"type":"A","name":"@","data":"185.199.110.153","ttl":600},
      {"type":"A","name":"@","data":"185.199.111.153","ttl":600},
      {"type":"CNAME","name":"www","data":"Brazenproducts.github.io","ttl":600}
    ]')
  DNS_CODE=$(echo "$DNS_RESP" | tail -1)
  echo "    DNS set status: $DNS_CODE"
  
  # Step 5 & 6 handled by node scripts after all sites built
  
  echo "  ✅ $domain site built and pushed"
  sleep 2
done

echo ""
echo "=========================================="
echo "  All 8 sites built and pushed!"
echo "=========================================="
