#!/usr/bin/env bash
FAILED=(bestcordlesstools.com bestinstantpot.com bestsmokergrill.com broncofloormats.com broncolift.com cybertruckbumpers.com cybertruckseatcovers.com cybertruckstorage.com r1sparts.com)
LOG=/tmp/retry-push-log.txt
: > "$LOG"
for site in "${FAILED[@]}"; do
  dir="/home/ubuntu/.openclaw/workspace/$site"
  cd "$dir" || continue
  git pull --rebase origin main >> "$LOG" 2>&1
  if git push origin HEAD >> "$LOG" 2>&1; then
    h=$(git rev-parse --short HEAD)
    echo "OK   $site $h" | tee -a "$LOG"
  else
    echo "FAIL $site" | tee -a "$LOG"
  fi
done
