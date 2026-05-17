#!/usr/bin/env bash
# inject-capture.sh — Deploy email capture widget into a static site directory
#
# Usage:
#   ./inject-capture.sh /path/to/site-directory
#
# What it does:
#   1. Copies email-capture.js and email-capture.css into the site directory
#   2. Injects <link> and <script> tags before </body> in every .html file
#   3. Skips files that already have the tags injected
#   4. Does NOT modify any existing content

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_DIR="${1:-}"

# ── Validate input ───────────────────────────────────────────
if [[ -z "$SITE_DIR" ]]; then
  echo "Usage: $0 <site-directory>" >&2
  exit 1
fi

if [[ ! -d "$SITE_DIR" ]]; then
  echo "Error: '$SITE_DIR' is not a directory." >&2
  exit 1
fi

JS_SRC="$SCRIPT_DIR/email-capture.js"
CSS_SRC="$SCRIPT_DIR/email-capture.css"

if [[ ! -f "$JS_SRC" ]]; then
  echo "Error: email-capture.js not found at $JS_SRC" >&2
  exit 1
fi

if [[ ! -f "$CSS_SRC" ]]; then
  echo "Error: email-capture.css not found at $CSS_SRC" >&2
  exit 1
fi

# ── Copy assets ──────────────────────────────────────────────
echo "Copying assets to $SITE_DIR ..."
cp "$JS_SRC"  "$SITE_DIR/email-capture.js"
cp "$CSS_SRC" "$SITE_DIR/email-capture.css"
echo "  ✓ email-capture.js"
echo "  ✓ email-capture.css"

# ── Inject tags into HTML files ──────────────────────────────
INJECT_LINK='  <link rel="stylesheet" href="email-capture.css">'
INJECT_SCRIPT='  <script src="email-capture.js" data-variants="sticky,popup,inline" data-endpoint="/api/subscribe"></script>'
MARKER='email-capture.js'

HTML_COUNT=0
SKIP_COUNT=0
INJECT_COUNT=0

while IFS= read -r -d '' html_file; do
  HTML_COUNT=$((HTML_COUNT + 1))

  # Skip if already injected
  if grep -q "$MARKER" "$html_file" 2>/dev/null; then
    echo "  [skip] $html_file (already injected)"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    continue
  fi

  # Check file has a </body> tag
  if ! grep -qi '</body>' "$html_file" 2>/dev/null; then
    echo "  [skip] $html_file (no </body> tag found)"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    continue
  fi

  # Use a temp file for atomic replacement
  TMP_FILE="$(mktemp)"

  # Insert link + script before the first </body> (case-insensitive)
  awk -v link="$INJECT_LINK" -v script="$INJECT_SCRIPT" '
    !injected && tolower($0) ~ /<\/body>/ {
      print link
      print script
      injected = 1
    }
    { print }
  ' "$html_file" > "$TMP_FILE"

  mv "$TMP_FILE" "$html_file"
  echo "  [inject] $html_file"
  INJECT_COUNT=$((INJECT_COUNT + 1))

done < <(find "$SITE_DIR" -name "*.html" -type f -print0)

# ── Summary ──────────────────────────────────────────────────
echo ""
echo "Done."
echo "  HTML files found:    $HTML_COUNT"
echo "  Injected:            $INJECT_COUNT"
echo "  Skipped:             $SKIP_COUNT"
echo ""
echo "Next steps:"
echo "  1. Start the capture endpoint: node capture-endpoint.js"
echo "  2. Or deploy to Vercel/Cloudflare Workers (see README.md)"
