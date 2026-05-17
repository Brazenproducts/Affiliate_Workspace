#!/bin/bash
# Push 15 new affiliate sites to GitHub and enable Pages

GITHUB_TOKEN="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"
GITHUB_USER="Brazenproducts"

SITES=(
  "bestmagnesiumglycinate.com"
  "bestnecklifttape.com"
  "bestportable-charger.com"
  "bestheating-pad.com"
  "bestvibrationplate.com"
  "bestresistance-bands.com"
  "bestprotein-powder.com"
  "bestmini-fridge.com"
  "bestmassage-gun.com"
  "bestgaming-chair.com"
  "bestice-maker.com"
  "bestportable-ac.com"
  "bestpower-bank.com"
  "bestlabel-maker.com"
  "bestshower-head.com"
)

cd /home/ubuntu/.openclaw/workspace/sites

for site in "${SITES[@]}"; do
  echo "=== Processing $site ==="
  
  # Create GitHub repo via API
  curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/user/repos \
    -d "{\"name\":\"$site\",\"private\":false,\"has_issues\":false,\"has_wiki\":false,\"has_projects\":false}"
  
  # Initialize git and push
  cd "$site"
  git init
  git branch -M main
  git add .
  git commit -m "Initial commit: $site affiliate site"
  git remote add origin "https://$GITHUB_TOKEN@github.com/$GITHUB_USER/$site.git"
  git push -u origin main
  
  # Enable GitHub Pages via API
  curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$GITHUB_USER/$site/pages" \
    -d '{"source":{"branch":"main","path":"/"}}'
  
  cd ..
  echo "✅ $site pushed and Pages enabled"
  sleep 2
done

echo "🎉 All 15 sites pushed to GitHub!"
