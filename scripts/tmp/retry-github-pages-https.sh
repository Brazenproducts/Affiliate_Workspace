#!/bin/bash
set -e
PAT="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"
for repo in bestinstantpot.com bestsmokergrill.com bestmeshwifi.com bestgarageorganizer.com whatarebest.com; do
  echo "=== $repo ==="
  curl -s \
    -X PUT \
    -H "Authorization: token $PAT" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/Brazenproducts/$repo/pages" \
    -d '{"cname":"'"$repo"'","https_enforced":true,"source":{"branch":"main","path":"/"}}' | head -c 300
  echo -e "\n"
done
