#!/bin/bash
# Audit affiliate site word counts against playbook targets
# Floors: homepage 800w, inner pages 700w
# Targets: homepage 1500w, inner pages 1000w

SITES_DIR="/home/ubuntu/.openclaw/workspace/sites"
CANONICAL="/home/ubuntu/.openclaw/agents/filli/workspace/memory/associates-site-lists-confirmed.md"

# Extract site list from canonical file
SITES=$(grep -E "^[a-zA-Z0-9][a-zA-Z0-9.-]+\.(com|net|org)" "$CANONICAL" | sort -u)

TOTAL=0
HOME_PASS=0
HOME_FAIL=0
INNER_PASS=0
INNER_FAIL=0
INNER_BELOW_FLOOR=0

echo "=== AFFILIATE NETWORK WORD COUNT AUDIT ==="
echo "Playbook targets: homepage=1500w (floor 800w) | inner pages=1000w (floor 700w)"
echo "Date: $(date -u)"
echo ""
echo "FORMAT: [site] homepage:[words]w([status]) | inner: X/Y at target, Z under floor"
echo "========================================================"

for site in $SITES; do
  TOTAL=$((TOTAL + 1))
  dir="$SITES_DIR/$site"
  
  if [ ! -d "$dir" ]; then
    echo "❓ $site: NO LOCAL REPO"
    continue
  fi

  # Homepage
  if [ -f "$dir/index.html" ]; then
    hw=$(sed 's/<[^>]*>//g' "$dir/index.html" | tr -s ' \n\t' ' ' | wc -w)
    if [ "$hw" -ge 1500 ]; then
      hstatus="✅ ${hw}w"
      HOME_PASS=$((HOME_PASS + 1))
    elif [ "$hw" -ge 800 ]; then
      hstatus="⚠️  ${hw}w (above floor, below 1500w target)"
      HOME_FAIL=$((HOME_FAIL + 1))
    else
      hstatus="❌ ${hw}w (UNDER 800w FLOOR)"
      HOME_FAIL=$((HOME_FAIL + 1))
    fi
  else
    hstatus="❓ no index.html"
    HOME_FAIL=$((HOME_FAIL + 1))
  fi

  # Inner pages (all html except index.html, skip utility pages)
  inner_total=0
  inner_at_target=0
  inner_above_floor=0
  inner_under_floor=0
  inner_under_floor_list=""

  for f in "$dir"/*.html "$dir"/blog/*.html 2>/dev/null; do
    [ -f "$f" ] || continue
    fname=$(basename "$f")
    # Skip utility pages and verification files
    case "$fname" in
      index.html|privacy.html|about.html|contact.html|thanks.html|sitemap.html) continue ;;
      google*.html) continue ;;
      b4f7e2a1*.html) continue ;;
    esac
    inner_total=$((inner_total + 1))
    wc=$(sed 's/<[^>]*>//g' "$f" | tr -s ' \n\t' ' ' | wc -w)
    if [ "$wc" -ge 1000 ]; then
      inner_at_target=$((inner_at_target + 1))
    elif [ "$wc" -ge 700 ]; then
      inner_above_floor=$((inner_above_floor + 1))
    else
      inner_under_floor=$((inner_under_floor + 1))
      inner_under_floor_list="$inner_under_floor_list $fname(${wc}w)"
    fi
  done

  INNER_PASS=$((INNER_PASS + inner_at_target))
  INNER_FAIL=$((INNER_FAIL + inner_above_floor + inner_under_floor))
  INNER_BELOW_FLOOR=$((INNER_BELOW_FLOOR + inner_under_floor))

  if [ "$inner_total" -eq 0 ]; then
    inner_summary="no inner pages"
  else
    inner_summary="${inner_at_target}/${inner_total} at 1000w+ target | ${inner_above_floor} above floor | ${inner_under_floor} under floor"
    if [ -n "$inner_under_floor_list" ]; then
      inner_summary="$inner_summary | UNDER FLOOR:$inner_under_floor_list"
    fi
  fi

  echo "$site | home: $hstatus | inner: $inner_summary"
done

echo ""
echo "========================================================"
echo "SUMMARY"
echo "Total sites in canonical list: $TOTAL"
echo "Homepages at 1500w+ target: $HOME_PASS"
echo "Homepages below target (incl under floor): $HOME_FAIL"
echo "Inner pages at 1000w+ target: $INNER_PASS"
echo "Inner pages above floor but below target: $INNER_FAIL"
echo "Inner pages UNDER 700w floor: $INNER_BELOW_FLOOR"
