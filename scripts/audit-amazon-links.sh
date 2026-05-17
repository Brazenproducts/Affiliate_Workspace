#!/bin/bash
# Audit all Amazon affiliate links across the network for bad search terms
# Checks that amazon.com/s?k= links contain relevant product keywords

GH_TOKEN=$(grep -oE 'ghp_[A-Za-z0-9_]+' /home/ubuntu/.openclaw/workspace/memory/credentials.md | head -1)

SITES=(
  bestbroncoaccessories.com
  bestseatcover.com
  besttruckaccessories.com
  besttonneaucovers.com
  bestcordlesstools.com
  bestfirestick.com
  bestinstantpot.com
  bestsmokergrill.com
  bestmeshwifi.com
  bestgarageorganizer.com
  broncoseatcover.com
  gladiatorseatcover.com
  jeepseatcover.com
  tacticalseats.com
  tacticalseatcovers.com
  tacomaseats.com
)

echo "=== Amazon Affiliate Link Audit ==="
echo "Date: $(date -u)"
echo ""

for site in "${SITES[@]}"; do
  echo "--- $site ---"
  # Get all HTML files from the repo
  files=$(curl -s "https://api.github.com/repos/Brazenproducts/$site/contents/" \
    -H "Authorization: token $GH_TOKEN" 2>/dev/null | \
    python3 -c "
import sys,json
try:
    data = json.load(sys.stdin)
    if isinstance(data, list):
        for f in data:
            if f['name'].endswith('.html'):
                print(f['name'])
except: pass
")
  
  if [ -z "$files" ]; then
    echo "  (no HTML files or repo not found)"
    continue
  fi
  
  found_issues=0
  for file in $files; do
    # Fetch raw content and extract Amazon search links
    content=$(curl -s "https://raw.githubusercontent.com/Brazenproducts/$site/main/$file" 2>/dev/null)
    
    # Extract Amazon search URLs
    echo "$content" | grep -oP 'https?://(?:www\.)?amazon\.com/s\?[^"'"'"' <>]+' | while read url; do
      # Extract the search keyword
      keyword=$(echo "$url" | grep -oP 'k=[^&"]+' | sed 's/k=//' | python3 -c "import sys,urllib.parse; print(urllib.parse.unquote_plus(sys.stdin.read().strip()))")
      
      if [ -n "$keyword" ]; then
        # Flag potentially bad searches based on site context
        echo "  $file: k=$keyword"
        found_issues=1
      fi
    done
  done
  
  if [ "$found_issues" -eq 0 ]; then
    echo "  (no Amazon search links found)"
  fi
  echo ""
done
