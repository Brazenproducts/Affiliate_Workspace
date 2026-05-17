#!/bin/bash
set -e
SITE="$1"
cd "/home/ubuntu/.openclaw/workspace/$SITE"
node /home/ubuntu/.openclaw/workspace/scripts/fix-scaffold-seo.js "$SITE" > /tmp/fix-$SITE.json
git add -A
if git diff --cached --quiet; then
  echo "NO_CHANGES $SITE"
  exit 0
fi
GIT_AUTHOR_NAME="Axl" GIT_AUTHOR_EMAIL="axl@brazenproducts.local" \
GIT_COMMITTER_NAME="Axl" GIT_COMMITTER_EMAIL="axl@brazenproducts.local" \
  git commit -m "SEO: boost internal linking + add JSON-LD schema" --quiet
SHA=$(git rev-parse HEAD)
git push origin HEAD --quiet 2>&1 | tail -5
echo "COMMIT $SITE $SHA"
