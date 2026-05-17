#!/bin/bash
###############################################################################
# affiliate-post-build-qa.sh — Mandatory QA after ANY affiliate site build/update
#
# Run this EVERY TIME a sub-agent finishes work on an affiliate site.
# Do NOT tell Mitch a site is done until this passes clean.
#
# Usage:
#   ./scripts/affiliate-post-build-qa.sh <site-domain>
#   ./scripts/affiliate-post-build-qa.sh besttruckaccessories.com
#
# Exit codes:
#   0 = all checks pass
#   1 = failures found (details in stdout + /tmp/qa-<site>.log)
###############################################################################
set -euo pipefail

SITE="${1:?Usage: $0 <site-domain>}"
ROOT="/home/ubuntu/.openclaw/workspace"
SITE_DIR="${ROOT}/${SITE}"
LOG="/tmp/qa-${SITE}.log"
AFFILIATE_TAG="brazenprodu01-20"
# Valid Amazon Associates tracking IDs (must match EXACTLY one of these)
# Source: https://affiliate-program.amazon.com/home/account/tag/manage
VALID_TAGS=(
  "brazenprodu01-20"
  "brazenprodu01-20-recipsaw-20"
  "brazenprodu01-20-pastamaker-20"
  "brazenprodu01-20-dutchoven-20"
  "brazenprodu01-20-sousvide-20"
  "brazenprodu01-20-tireinflator-20"
  "brazenprodu01-20-headlight-20"
  "brazenprodu01-20-tirepatch-20"
  "brazenprodu01-20-towingstrap-20"
  "brazenprodu01-20-showerhead-20"
  "brazenprodu01-20-labelmaker-20"
  "brazenprodu01-20-powerbank-20"
  "brazenprodu01-20-portableac-20"
  "brazenprodu01-20-icemaker-20"
  "brazenprodu01-20-gamingchair-20"
  "brazenprodu01-20-massagegun-20"
  "brazenprodu01-20-minifridge-20"
  "brazenprodu01-20-protein-20"
  "brazenprodu01-20-resistance-20"
  "brazenprodu01-20-vibration-20"
  "brazenprodu01-20-heatingpad-20"
  "brazenprodu01-20-charger-20"
  "brazenprodu01-20-necklift-20"
  "brazenprodu01-20-magnesium-20"
)
FAILURES=0

log() { echo "$1" | tee -a "$LOG"; }
fail() { log "❌ FAIL: $1"; FAILURES=$((FAILURES + 1)); }
pass() { log "✅ PASS: $1"; }

echo "" > "$LOG"
log "═══════════════════════════════════════════════════════"
log "  AFFILIATE SITE QA: ${SITE}"
log "  $(date -u '+%Y-%m-%d %H:%M UTC')"
log "═══════════════════════════════════════════════════════"
log ""

# Verify site directory exists
if [ ! -d "$SITE_DIR" ]; then
  fail "Site directory not found: $SITE_DIR"
  exit 1
fi

###############################################################################
# 1. AFFILIATE LINK AUDIT — tag=brazenprodu01-20 on ALL outbound Amazon links
###############################################################################
log "── 1. Affiliate Link Audit ──"
# Find all outbound Amazon product links (not image CDN)
AMAZON_LINKS=$(grep -roh 'href="https\?://\(www\.\)\?amazon\.com[^"]*"' "$SITE_DIR"/*.html "$SITE_DIR"/**/*.html 2>/dev/null || true)
TOTAL_LINKS=$(echo "$AMAZON_LINKS" | grep -c 'amazon.com' || echo 0)
MISSING_TAG=$(echo "$AMAZON_LINKS" | grep -v "$AFFILIATE_TAG" | grep -c 'amazon.com' || echo 0)

# Extract actual tag values used in the HTML and verify each is a registered tracking ID
BAD_TAGS=0
if [ "$TOTAL_LINKS" -gt 0 ]; then
  USED_TAGS=$(grep -roh 'tag=[a-zA-Z0-9_-]*' "$SITE_DIR"/*.html "$SITE_DIR"/**/*.html 2>/dev/null | sed 's/^tag=//' | sort -u || true)
  for used in $USED_TAGS; do
    FOUND=0
    for valid in "${VALID_TAGS[@]}"; do
      if [ "$used" = "$valid" ]; then
        FOUND=1
        break
      fi
    done
    if [ "$FOUND" -eq 0 ]; then
      fail "UNREGISTERED tracking ID used: tag=${used} (not in Amazon Associates account)"
      BAD_TAGS=$((BAD_TAGS + 1))
    fi
  done
  [ "$BAD_TAGS" -eq 0 ] && pass "All tracking IDs match registered Amazon Associates tags"
fi

if [ "$TOTAL_LINKS" -eq 0 ]; then
  fail "No Amazon affiliate links found — site has no monetization"
elif [ "$MISSING_TAG" -gt 0 ]; then
  fail "${MISSING_TAG}/${TOTAL_LINKS} Amazon links MISSING tag=${AFFILIATE_TAG}"
  echo "$AMAZON_LINKS" | grep -v "$AFFILIATE_TAG" | head -5 >> "$LOG"
else
  pass "All ${TOTAL_LINKS} Amazon links have affiliate tag"

# 1b. SEARCH LINKS CHECK — /s?k= links convert at near-zero; require /dp/ASIN links
SEARCH_LINKS=$(echo "$AMAZON_LINKS" | grep -c '/s?k=' || echo 0)
DP_LINKS=$(echo "$AMAZON_LINKS" | grep -c '/dp/' || echo 0)
if [ "$SEARCH_LINKS" -gt 0 ] && [ "$DP_LINKS" -eq 0 ]; then
  fail "ALL ${SEARCH_LINKS} Amazon links go to search results (/s?k=) — NOT product pages. Use /dp/ASIN links. Search links = near-zero conversion."
elif [ "$SEARCH_LINKS" -gt 0 ]; then
  warn "${SEARCH_LINKS} Amazon links still use search (/s?k=) — replace with /dp/ASIN for better conversion"
else
  pass "All Amazon links use direct product pages (/dp/ASIN)"
fi
fi

###############################################################################
# 2. IMAGE VERIFICATION — every <img src> must return HTTP 200
###############################################################################
log ""
log "── 2. Image Verification ──"
ALL_IMGS=$(grep -roh 'src="https://[^"]*"' "$SITE_DIR"/*.html "$SITE_DIR"/**/*.html 2>/dev/null | sed 's/src="//;s/"$//' | sort -u || true)
IMG_COUNT=$(echo "$ALL_IMGS" | grep -c 'http' || echo 0)
BROKEN_IMGS=0

if [ "$IMG_COUNT" -eq 0 ]; then
  log "⚠️  No external images found (text-only site — acceptable but not ideal)"
else
  while IFS= read -r url; do
    [ -z "$url" ] && continue
    STATUS=$(curl -sI --max-time 5 "$url" -o /dev/null -w "%{http_code}" 2>/dev/null || echo "000")
    if [ "$STATUS" != "200" ]; then
      fail "Image 404/broken (HTTP ${STATUS}): ${url}"
      BROKEN_IMGS=$((BROKEN_IMGS + 1))
    fi
  done <<< "$ALL_IMGS"
  
  if [ "$BROKEN_IMGS" -eq 0 ]; then
    pass "All ${IMG_COUNT} images return HTTP 200"
  fi
fi

###############################################################################
# 3. DUPLICATE IMAGE CHECK — no same image used on multiple cards
###############################################################################
log ""
log "── 3. Duplicate Image Check ──"
DUPE_FOUND=0
for htmlfile in "$SITE_DIR"/*.html; do
  [ -f "$htmlfile" ] || continue
  DUPES=$(grep -oh 'src="[^"]*"' "$htmlfile" | sort | uniq -d | grep -v "logo\|favicon\|icon" || true)
  if [ -n "$DUPES" ]; then
    fail "Duplicate images in $(basename $htmlfile): $(echo $DUPES | head -2)"
    DUPE_FOUND=1
  fi
done
[ "$DUPE_FOUND" -eq 0 ] && pass "No duplicate card images"

###############################################################################
# 3b. SEMANTIC IMAGE AUDIT — images match their card category
###############################################################################
log ""
log "── 3b. Semantic Image Match ──"
if [ -f "${ROOT}/scripts/semantic-image-audit.js" ]; then
  SEMANTIC_OUT=$(node "${ROOT}/scripts/semantic-image-audit.js" --site="${SITE}" 2>&1 || true)
  MISMATCHES=$(echo "$SEMANTIC_OUT" | grep -c "MISMATCH" || echo 0)
  if [ "$MISMATCHES" -gt 0 ]; then
    fail "${MISMATCHES} image(s) don't match their card category (wrong product photo)"
    echo "$SEMANTIC_OUT" | grep "MISMATCH" | head -5 >> "$LOG"
  else
    pass "All card images match their heading category"
  fi
else
  log "⚠️  semantic-image-audit.js not found — skipping category match check"
fi

###############################################################################
# 4. SEO ESSENTIALS — title, meta desc, canonical on every page
###############################################################################
log ""
log "── 4. SEO Essentials ──"
SEO_ISSUES=0
for htmlfile in "$SITE_DIR"/*.html; do
  [ -f "$htmlfile" ] || continue
  FNAME=$(basename "$htmlfile")
  
  if ! grep -q '<title>[^<]\{5,\}</title>' "$htmlfile"; then
    fail "${FNAME}: missing or empty <title>"
    SEO_ISSUES=$((SEO_ISSUES + 1))
  fi
  if ! grep -qi '<meta name="description" content="[^"]\{40,\}"' "$htmlfile"; then
    fail "${FNAME}: missing or short meta description"
    SEO_ISSUES=$((SEO_ISSUES + 1))
  fi
  if ! grep -qi '<link rel="canonical"' "$htmlfile"; then
    fail "${FNAME}: missing canonical tag"
    SEO_ISSUES=$((SEO_ISSUES + 1))
  fi
done
[ "$SEO_ISSUES" -eq 0 ] && pass "All pages have title + meta desc + canonical"

###############################################################################
# 5. HERO TEXT CONTRAST — white text on dark backgrounds
###############################################################################
log ""
log "── 5. Hero Text Contrast ──"
CONTRAST_ISSUES=0
for htmlfile in "$SITE_DIR"/*.html; do
  [ -f "$htmlfile" ] || continue
  # Check if there's a hero/banner section with dark overlay but non-white text
  if grep -q 'class="hero\|class="banner\|hero-section\|banner-section' "$htmlfile"; then
    if grep -A20 'class="hero\|class="banner\|hero-section\|banner-section' "$htmlfile" | grep -qi 'color:.*var(--gray\|color:.*#[0-3]'; then
      fail "$(basename $htmlfile): hero section may have dark text on dark background"
      CONTRAST_ISSUES=$((CONTRAST_ISSUES + 1))
    fi
  fi
done
[ "$CONTRAST_ISSUES" -eq 0 ] && pass "Hero text contrast looks OK"

###############################################################################
# 6. SITEMAP + ROBOTS.TXT
###############################################################################
log ""
log "── 6. Sitemap & Robots ──"
if [ ! -f "$SITE_DIR/sitemap.xml" ]; then
  fail "sitemap.xml missing"
else
  pass "sitemap.xml present"
fi
if [ ! -f "$SITE_DIR/robots.txt" ]; then
  fail "robots.txt missing"
elif ! grep -qi 'Sitemap:' "$SITE_DIR/robots.txt"; then
  fail "robots.txt missing Sitemap: directive"
else
  pass "robots.txt present with Sitemap reference"
fi

###############################################################################
# 7. LIVE SITE CHECK — confirm GitHub Pages is serving
###############################################################################
log ""
log "── 7. Live Site Check ──"
LIVE_STATUS=$(curl -sI --max-time 10 "https://${SITE}/" -o /dev/null -w "%{http_code}" 2>/dev/null || echo "000")
if [ "$LIVE_STATUS" = "200" ]; then
  pass "https://${SITE}/ returns HTTP 200"
elif [ "$LIVE_STATUS" = "301" ] || [ "$LIVE_STATUS" = "302" ]; then
  pass "https://${SITE}/ returns redirect (${LIVE_STATUS}) — likely www redirect"
else
  fail "https://${SITE}/ returned HTTP ${LIVE_STATUS} — site may not be live"
fi

###############################################################################
# 8. CONTACT FORM — not placeholder
###############################################################################
log ""
log "── 8. Contact Form ──"
if [ ! -f "$SITE_DIR/contact.html" ]; then
  fail "contact.html missing"
elif grep -q 'SET_ME_ACCESS_KEY' "$SITE_DIR/contact.html"; then
  fail "contact.html still has placeholder access key"
else
  pass "contact.html present with real key"
fi

###############################################################################
# 9. INTERNAL LINKS — every local href resolves to a real file
###############################################################################
log ""
log "── 9. Internal Links ──"
BROKEN_INTERNAL=0
for htmlfile in "$SITE_DIR"/*.html; do
  [ -f "$htmlfile" ] || continue
  LOCAL_HREFS=$(grep -oP 'href="\K[^"#][^"]*\.html' "$htmlfile" | grep -v '^http' | grep -v '^mailto' | sort -u || true)
  for href in $LOCAL_HREFS; do
    if [ ! -f "$SITE_DIR/$href" ]; then
      fail "Broken internal link in $(basename $htmlfile): $href"
      BROKEN_INTERNAL=$((BROKEN_INTERNAL + 1))
    fi
  done
done
[ "$BROKEN_INTERNAL" -eq 0 ] && pass "All internal links resolve"

###############################################################################
# 10. OUTBOUND LINK SPOT CHECK — sample up to 10 Amazon links for 200/301
###############################################################################
log ""
log "── 10. Outbound Link Spot Check ──"
DEAD_OUTBOUND=0
while IFS= read -r url; do
  [ -z "$url" ] && continue
  STATUS=$(curl -sI --max-time 8 -L "$url" -o /dev/null -w "%{http_code}" 2>/dev/null || echo "000")
  if [ "$STATUS" = "404" ] || [ "$STATUS" = "000" ]; then
    fail "Dead outbound link (HTTP ${STATUS}): ${url:0:80}"
    DEAD_OUTBOUND=$((DEAD_OUTBOUND + 1))
  fi
done < <(grep -roh 'href="https://www\.amazon\.com[^"]*"' "$SITE_DIR"/*.html 2>/dev/null | sed 's/href="//;s/"$//' | sort -u | head -10)
[ "$DEAD_OUTBOUND" -eq 0 ] && pass "Outbound Amazon links responding (sampled up to 10)"

###############################################################################
# 11. NETWORK CROSS-LINKS — footer links to brand sites + affiliate network
###############################################################################
log ""
log "── 11. Network Cross-Links ──"
NETWORK_ISSUES=0
IDX="$SITE_DIR/index.html"
if [ -f "$IDX" ]; then
  grep -qi 'bartact\.com' "$IDX" || { fail "Missing backlink to bartact.com"; NETWORK_ISSUES=$((NETWORK_ISSUES+1)); }
  grep -qi 'bullstrap\.com' "$IDX" || { fail "Missing backlink to bullstrap.com"; NETWORK_ISSUES=$((NETWORK_ISSUES+1)); }
  FOOTER_LINKS=$(grep -oc 'href="https://[a-z]' "$IDX" || echo 0)
  [ "$FOOTER_LINKS" -lt 3 ] && { fail "Only ${FOOTER_LINKS} outbound cross-links on homepage (<3)"; NETWORK_ISSUES=$((NETWORK_ISSUES+1)); }
fi
[ "$NETWORK_ISSUES" -eq 0 ] && pass "Network cross-links present"

###############################################################################
# 12. AFFILIATE DISCLOSURE — FTC required on every page
###############################################################################
log ""
log "── 12. Affiliate Disclosure ──"
NO_DISCLOSURE=0
for htmlfile in "$SITE_DIR"/*.html; do
  [ -f "$htmlfile" ] || continue
  grep -qi 'affiliate\|commission\|earn from qualifying\|associate' "$htmlfile" || {
    fail "No affiliate disclosure in $(basename $htmlfile)"
    NO_DISCLOSURE=$((NO_DISCLOSURE+1))
  }
done
[ "$NO_DISCLOSURE" -eq 0 ] && pass "Affiliate disclosure present on all pages"

###############################################################################
# 13. PLACEHOLDER TEXT — no Lorem ipsum / TODO / PLACEHOLDER
###############################################################################
log ""
log "── 13. Placeholder Text ──"
PH_FILES=$(grep -ril 'lorem ipsum\|TODO\|PLACEHOLDER\|INSERT HERE\|CHANGE THIS\|YOUR_.*_HERE\|example\.com' "$SITE_DIR"/*.html 2>/dev/null || true)
if [ -n "$PH_FILES" ]; then
  fail "Placeholder/TODO text found in: $(echo $PH_FILES | tr '\n' ' ' | head -c 120)"
else
  pass "No placeholder text found"
fi

###############################################################################
# 14. BLOG SECTION — site has at least one blog/article page
###############################################################################
log ""
log "── 14. Blog Content ──"
BLOG_PAGES=$(find "$SITE_DIR" -name '*.html' | xargs grep -l 'blog\|article\|guide\|review' 2>/dev/null | grep -v 'index\|contact\|about\|privacy\|sitemap' | wc -l || echo 0)
if [ "$BLOG_PAGES" -lt 2 ]; then
  fail "Only ${BLOG_PAGES} content/blog page(s) — site needs more content for SEO"
else
  pass "${BLOG_PAGES} content/blog pages found"
fi

###############################################################################
# 15. GITHUB PAGES HTTPS — ensure HTTPS is enforced on the repo
###############################################################################
log ""
log "── 15. GitHub Pages HTTPS Enforcement ──"
TOKEN="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"
ORG="Brazenproducts"

# Get repo name from git remote
REPO_NAME=$(git -C "$SITE_DIR" remote get-url origin 2>/dev/null | grep -oP '[^/]+\.git$' | sed 's/\.git$//' || true)
if [ -z "$REPO_NAME" ]; then
  fail "Could not determine GitHub repo name for HTTPS check"
else
  PAGES_JSON=$(curl -s -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$ORG/$REPO_NAME/pages" 2>/dev/null)
  HTTPS_ENFORCED=$(echo "$PAGES_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('https_enforced',False))" 2>/dev/null || echo "Unknown")
  
  if [ "$HTTPS_ENFORCED" = "True" ]; then
    pass "HTTPS enforced on GitHub Pages"
  else
    # Try to fix it automatically
    log "  ⚙️  HTTPS not enforced — triggering cert provisioning..."
    DOMAIN=$(cat "$SITE_DIR/CNAME" 2>/dev/null || basename "$SITE_DIR")
    curl -s -o /dev/null -X PUT -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github+json" \
      -d "{\"cname\": \"$DOMAIN\", \"source\": {\"branch\": \"main\", \"path\": \"/\"}}" \
      "https://api.github.com/repos/$ORG/$REPO_NAME/pages" 2>/dev/null
    sleep 5
    ENFORCE_RESP=$(curl -s -w "%{http_code}" -o /dev/null -X PUT -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github+json" \
      -d '{"https_enforced": true}' \
      "https://api.github.com/repos/$ORG/$REPO_NAME/pages" 2>/dev/null)
    if [ "$ENFORCE_RESP" = "204" ]; then
      pass "HTTPS enforcement enabled (was off, auto-fixed)"
    else
      fail "HTTPS NOT enforced — cert may need time to provision. Re-run QA in 30 min or run: scripts/fix-github-pages-https.sh phase2"
    fi
  fi
fi

###############################################################################
# SUMMARY
###############################################################################
log ""
log "═══════════════════════════════════════════════════════"
if [ "$FAILURES" -eq 0 ]; then
  log "  ✅ ALL CHECKS PASSED — safe to report done to Mitch"
else
  log "  ❌ ${FAILURES} FAILURE(S) — FIX BEFORE REPORTING DONE"
fi
log "═══════════════════════════════════════════════════════"
log "  Full log: ${LOG}"

exit $( [ "$FAILURES" -eq 0 ] && echo 0 || echo 1 )
