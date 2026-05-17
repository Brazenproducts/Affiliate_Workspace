#!/bin/bash
# Commit + push dead-image cleanup for every modified affiliate site.
set -u
WS=/home/ubuntu/.openclaw/workspace
SITES=(
  besttonneaucovers.com
  cybertruckbumpers.com
  cybertruckseatcovers.com
  cybertruckstorage.com
  cybertrucktires.com
  r1sparts.com
  bestcordlesstools.com
  jeepseatcover.com
  affiliate-sites/r1tparts.com
  affiliate-sites/rivianaftermarket.com
  affiliate-sites/broncoseatcover.com
  affiliate-sites/tacomaseats.com
)
MSG="Dead-image cleanup: strip 404 Amazon image refs + clean empty wrappers; index re-image where verified IDs available"
echo "" > /tmp/commit-hashes.txt
for d in "${SITES[@]}"; do
  cd "$WS/$d" || { echo "SKIP $d (no dir)"; continue; }
  if [ -z "$(git status -s)" ]; then
    echo "$d: clean"
    continue
  fi
  git add -A
  git -c user.email=axl@brazenproducts.local -c user.name=Axl commit -m "$MSG" > /dev/null 2>&1 || { echo "$d: commit failed"; continue; }
  HASH=$(git rev-parse --short HEAD)
  if git push origin HEAD 2>&1 | tail -3 | grep -q "rejected\|error"; then
    git pull --rebase origin HEAD 2>&1 | tail -3
    git push origin HEAD 2>&1 | tail -3
  fi
  echo "$d $HASH" | tee -a /tmp/commit-hashes.txt
done
echo "---DONE---"
cat /tmp/commit-hashes.txt
