#!/bin/bash
# Master build script - creates all 8 sites and deploys to GitHub Pages
set -e
GH_TOKEN="${GH_TOKEN:-$(git -C /home/ubuntu/.openclaw/workspace/swalmy.com remote get-url origin | sed -n 's#https://\(ghp_[^@]*\)@github.com/.*#\1#p')}"
GH_ORG="Brazenproducts"
INDEXNOW_KEY="b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5"
WORK="/home/ubuntu/.openclaw/workspace/sites"
mkdir -p "$WORK"

create_repo() {
    local name="$1"
    echo "Creating repo $name..."
    curl -s -o /dev/null -w "%{http_code}" -X POST \
        -H "Authorization: token $GH_TOKEN" \
        -H "Accept: application/vnd.github+json" \
        "https://api.github.com/orgs/$GH_ORG/repos" \
        -d "{\"name\":\"$name\",\"public\":true,\"auto_init\":false,\"has_issues\":false,\"has_wiki\":false}"
}

push_site() {
    local domain="$1"
    local repo_name="${domain//./-}"
    local dir="$WORK/$repo_name"
    echo "Pushing $repo_name..."
    cd "$dir"
    git init -b main 2>/dev/null
    git config user.email "deploy@$domain"
    git config user.name "Deploy"
    git add -A
    git commit -m "Initial deploy" 2>/dev/null || git commit --allow-empty -m "redeploy"
    git remote add origin "https://x-access-token:${GH_TOKEN}@github.com/${GH_ORG}/${repo_name}.git" 2>/dev/null || \
        git remote set-url origin "https://x-access-token:${GH_TOKEN}@github.com/${GH_ORG}/${repo_name}.git"
    git push -u origin main --force 2>&1 | tail -1
}

enable_pages() {
    local domain="$1"
    local repo_name="${domain//./-}"
    echo "Enabling Pages for $repo_name..."
    # Create pages
    curl -s -o /dev/null -w "%{http_code}" -X POST \
        -H "Authorization: token $GH_TOKEN" \
        -H "Accept: application/vnd.github+json" \
        "https://api.github.com/repos/$GH_ORG/$repo_name/pages" \
        -d '{"source":{"branch":"main","path":"/"}}'
    echo ""
    # Set CNAME
    sleep 1
    curl -s -o /dev/null -w "%{http_code}" -X PUT \
        -H "Authorization: token $GH_TOKEN" \
        -H "Accept: application/vnd.github+json" \
        "https://api.github.com/repos/$GH_ORG/$repo_name/pages" \
        -d "{\"cname\":\"$domain\",\"source\":{\"branch\":\"main\",\"path\":\"/\"}}"
    echo ""
}

echo "=== Step 1: Generate all site files ==="
for script in /home/ubuntu/.openclaw/workspace/scripts/gen-site-*.sh; do
    [ -f "$script" ] && bash "$script" &
done
wait
echo "All sites generated."

echo "=== Step 2: Create repos ==="
DOMAINS="autopartsreviewed.com topoffroadstores.com bestoffroadbrands.com tacticalseats.com homehvacfilters.com bestwindshieldwiper.com tacticalseatcovers.com tacomaseats.com"
for d in $DOMAINS; do
    repo="${d//./-}"
    create_repo "$repo"
    echo ""
done

echo "=== Step 3: Push all sites ==="
for d in $DOMAINS; do
    push_site "$d"
done

echo "=== Step 4: Enable Pages ==="
for d in $DOMAINS; do
    enable_pages "$d"
    sleep 1
done

echo "=== Step 5: DNS for remaining domains ==="
cd /home/ubuntu/.openclaw/workspace
bash scripts/godaddy-github-dns.sh tacticalseats.com homehvacfilters.com bestwindshieldwiper.com tacticalseatcovers.com tacomaseats.com

echo "=== DONE ==="
