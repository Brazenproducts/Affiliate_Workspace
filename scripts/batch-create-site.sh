#!/bin/bash
# Batch create affiliate sites on GitHub Pages
# Usage: Called by the site builder script

TOKEN="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"
GODADDY_KEY="9QCBbdvZc9n_N3jPNv71WzKBpDcn8XCmyV"
GODADDY_SECRET="VVAAEQkkEyCVAtwqyCadwG"
INDEXNOW_KEY="b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5"

create_repo() {
  local DOMAIN="$1"
  echo "Creating repo: $DOMAIN"
  curl -s -X POST -H "Authorization: token $TOKEN" \
    -H "Content-Type: application/json" \
    "https://api.github.com/user/repos" \
    -d "{\"name\":\"$DOMAIN\",\"public\":true,\"auto_init\":true}" | grep -o '"full_name":"[^"]*"'
}

setup_pages() {
  local DOMAIN="$1"
  echo "Setting up GitHub Pages for $DOMAIN"
  curl -s -X POST -H "Authorization: token $TOKEN" \
    -H "Content-Type: application/json" \
    "https://api.github.com/repos/Brazenproducts/$DOMAIN/pages" \
    -d '{"source":{"branch":"main","path":"/"}}' | grep -o '"status":"[^"]*"'
}

setup_dns() {
  local DOMAIN="$1"
  echo "Setting DNS for $DOMAIN"
  
  # Set A records for GitHub Pages
  curl -s -X PUT \
    "https://api.godaddy.com/v1/domains/$DOMAIN/records/A/@" \
    -H "Authorization: sso-key $GODADDY_KEY:$GODADDY_SECRET" \
    -H "Content-Type: application/json" \
    -d '[{"data":"185.199.108.153","ttl":600},{"data":"185.199.109.153","ttl":600},{"data":"185.199.110.153","ttl":600},{"data":"185.199.111.153","ttl":600}]'
  
  # Set CNAME for www
  curl -s -X PUT \
    "https://api.godaddy.com/v1/domains/$DOMAIN/records/CNAME/www" \
    -H "Authorization: sso-key $GODADDY_KEY:$GODADDY_SECRET" \
    -H "Content-Type: application/json" \
    -d "[{\"data\":\"brazenproducts.github.io\",\"ttl\":600}]"
  
  echo " DNS done"
}

setup_custom_domain() {
  local DOMAIN="$1"
  echo "Setting custom domain for $DOMAIN"
  curl -s -X PUT -H "Authorization: token $TOKEN" \
    -H "Content-Type: application/json" \
    "https://api.github.com/repos/Brazenproducts/$DOMAIN/pages" \
    -d "{\"cname\":\"$DOMAIN\",\"source\":{\"branch\":\"main\",\"path\":\"/\"}}" | grep -o '"cname":"[^"]*"'
}

echo "=== BATCH SITE CREATOR ==="
for DOMAIN in "$@"; do
  echo ""
  echo "--- $DOMAIN ---"
  create_repo "$DOMAIN"
  sleep 2
  setup_pages "$DOMAIN"
  sleep 1
  setup_dns "$DOMAIN"
  sleep 1
  setup_custom_domain "$DOMAIN"
  sleep 1
  echo "✅ $DOMAIN infrastructure ready"
done
