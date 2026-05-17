#!/bin/bash
set -e
cd /home/ubuntu/.openclaw/workspace
mkdir -p logs

run_upgrade() {
  local SITE="$1"
  local TASK="$2"
  echo "[$(date -u +%FT%TZ)] Starting $SITE" >> logs/affiliate-upgrade.log
  openclaw sessions spawn --runtime subagent --mode run --light-context --run-timeout-seconds 900 \
    --label "upgrade-${SITE}" \
    --task "$TASK" >> logs/affiliate-upgrade.log 2>&1 || true
}

COMMON='Read /home/ubuntu/.openclaw/workspace/reference/affiliate-site-rules.md FIRST.
CRITICAL REQUIREMENTS (non-negotiable):
1. ALL outbound Amazon links MUST include tag=brazenprodu01-20 — no exceptions.
2. ALL images must be REAL verified URLs (curl -sI must return 200). AI CANNOT invent Amazon image IDs — they will 404. Use SP-API or known-good URLs only.
3. Each product card must have a UNIQUE image — never reuse the same image across cards.
4. Hero/banner text must be WHITE (#fff) with text-shadow on dark backgrounds.
5. Every page needs: <title>, <meta name="description">, <link rel="canonical">.
6. sitemap.xml and robots.txt (with Sitemap: directive) must exist.
7. contact.html must have a real Web3Forms access key (not SET_ME_ACCESS_KEY).
8. No fake claims, no made-up specs, no "we tested" language.
Use real Amazon CDN product images, real pricing, real pros/cons, no placeholders/gradients. Clone repo, upgrade all HTML pages, commit and push. Git config: user.email axl@openclaw.ai, user.name Axl. Update /home/ubuntu/.openclaw/workspace/memory/affiliate-upgrade-progress.md marking the site complete.'

run_upgrade "bestmeshwifi.com" "Upgrade bestmeshwifi.com. Repo: Brazenproducts/bestmeshwifi.com. Amazon affiliate tag brazenprodu01-20. Top brands: eero, Google Nest Wifi, TP-Link Deco, ASUS ZenWiFi, Netgear Orbi. ${COMMON}"
run_upgrade "bestinstantpot.com" "Upgrade bestinstantpot.com. Repo: Brazenproducts/bestinstantpot.com. Amazon affiliate tag brazenprodu01-20. Top brands: Instant Pot Duo, Duo Plus, Duo Crisp, Pro, Ninja Foodi, Crock-Pot multicooker. ${COMMON}"
run_upgrade "bestgarageorganizer.com" "Upgrade bestgarageorganizer.com. Repo: Brazenproducts/bestgarageorganizer.com. Amazon affiliate tag brazenprodu01-20. Top brands: Gladiator, Husky, FLEXIMOUNTS, Seville Classics, Keter, Rubbermaid. ${COMMON}"
run_upgrade "bestfirestick.com" "Upgrade bestfirestick.com. Repo: Brazenproducts/bestfirestick.com. Amazon affiliate tag brazenprodu01-20. Top brands/devices: Fire TV Stick 4K, Fire TV Cube, Roku Ultra, Apple TV 4K, Chromecast with Google TV, Onn 4K. ${COMMON}"
run_upgrade "besttruckaccessories.com" "Upgrade besttruckaccessories.com. Repo: Brazenproducts/besttruckaccessories.com. Amazon affiliate tag brazenprodu01-20. Use real images for tonneau covers, bed racks, mats, steps, lighting. ${COMMON}"
run_upgrade "bestbroncoaccessories.com" "Upgrade bestbroncoaccessories.com. Repo: Brazenproducts/bestbroncoaccessories.com. Amazon affiliate tag brazenprodu01-20. Bartact door bags and grab handles must use real Bartact Shopify CDN images if featured. Other brands from Amazon CDN. ${COMMON}"
run_upgrade "broncolift.com" "Upgrade broncolift.com. Repo: Brazenproducts/broncolift.com. Amazon affiliate tag brazenprodu01-20. Top brands: Rough Country, ReadyLIFT, Zone Offroad, BDS, Fabtech, ICON, Bilstein. ${COMMON}"
