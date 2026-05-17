#!/bin/bash
set -u
WS=/home/ubuntu/.openclaw/workspace
SITES=(
  broncobumper.com
  broncorollbar.com
  broncotent.com
  broncotents.com
  broncomolle.com
  broncoheadliner.com
  broncointerior.com
  broncoupgrade.com
  broncolift.com
  broncorollcage.com
  cybertruckbumpers.com
  cybertruckgen1.com
  cybertruckseat.com
  cybertruckshell.com
  cybertrucktires.com
)
MSG="Restore real Amazon product images on category cards (verified 200 OK, vehicle-appropriate, unique per page)"
echo "" > /tmp/commit-hashes-step2.txt
for d in "${SITES[@]}"; do
  cd "$WS/$d" || continue
  if [ -z "$(git status -s)" ]; then echo "$d: clean"; continue; fi
  git add -A
  git -c user.email=axl@brazenproducts.local -c user.name=Axl commit -m "$MSG" > /dev/null 2>&1 || { echo "$d: commit failed"; continue; }
  HASH=$(git rev-parse --short HEAD)
  if git push origin HEAD 2>&1 | tail -2 | grep -q "rejected\|error"; then
    git pull --rebase origin HEAD 2>&1 | tail -2
    git push origin HEAD 2>&1 | tail -2
  fi
  echo "$d $HASH" | tee -a /tmp/commit-hashes-step2.txt
done
echo "---DONE---"
