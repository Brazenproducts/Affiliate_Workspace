#!/usr/bin/env bash
# Commit and push image-dedupe fixes across all modified affiliate-site repos.
set -u
LOG=/tmp/commit-push-log.txt
: > "$LOG"
SITES=$(node -e "console.log(Object.keys(JSON.parse(require('fs').readFileSync('/tmp/duplicate-image-fixes-log.json','utf8'))).join('\n'))")
OK=0; FAIL=0
for site in $SITES; do
  dir="/home/ubuntu/.openclaw/workspace/$site"
  [ -d "$dir/.git" ] || { echo "SKIP $site (no .git)" >> "$LOG"; continue; }
  cd "$dir" || continue
  # Only push if there are real file changes tracked
  if [ -z "$(git status --porcelain)" ]; then
    echo "NOOP $site" >> "$LOG"
    continue
  fi
  n=$(node -e "const l=JSON.parse(require('fs').readFileSync('/tmp/duplicate-image-fixes-log.json','utf8'));const a=l['$site']||[];const sw=a.filter(x=>x.action==='swap').length;const st=a.length-sw;console.log(a.length+' fixes ('+sw+' swap, '+st+' strip)')")
  git add -A
  git -c user.email=axl@openclaw.local -c user.name='Axl' commit -m "Fix duplicate/placeholder images across vehicle/product cards ($n)

Network-wide audit (scripts/duplicate-image-audit.js) caught identical
placeholder images (61mpK93Qg0L BAKFlip, 61bMNCeAUAL generic) and
duplicate Amazon images reused across distinct vehicle/product cards.
Swaps use verified-200 IDs harvested from in-network usage; cards with
no verified category-appropriate image had their placeholder <img>
removed rather than left with the duplicate/mismatched image." >> "$LOG" 2>&1
  if git push origin HEAD 2>>"$LOG" >>"$LOG"; then
    h=$(git rev-parse --short HEAD)
    echo "OK   $site $h" | tee -a "$LOG"
    OK=$((OK+1))
  else
    echo "FAIL $site" | tee -a "$LOG"
    FAIL=$((FAIL+1))
  fi
done
echo "--- Done: $OK pushed, $FAIL failed ---" | tee -a "$LOG"
