#!/bin/bash
# Add product images to all three cybertruck affiliate sites
set -e
cd /home/ubuntu/.openclaw/workspace

# =============================================
# SITE 1: cybertruckseatcovers.com
# =============================================
SITE1="cybertruckseatcovers.com"

# --- index.html: Add images to 4 cards that are missing them ---
# Katzkin (has placeholder gradient)
cd /home/ubuntu/.openclaw/workspace/$SITE1

python3 -c "
import re
html = open('index.html').read()

# Replace Katzkin placeholder
html = html.replace(
    '<div class=\"card-img\" style=\"background:linear-gradient(135deg,#2a1a1a,#1a1a2e);display:flex;align-items:center;justify-content:center\">\n<span style=\"color:var(--text2)\">Katzkin Leather</span>\n</div>',
    '<div class=\"card-img\"><img src=\"https://m.media-amazon.com/images/I/71cO89vKpIL._AC_SL1500_.jpg\" alt=\"Katzkin Custom Leather Seat Covers\" loading=\"lazy\"></div>'
)

# Replace EKR placeholder
html = html.replace(
    '<div class=\"card-img\" style=\"background:linear-gradient(135deg,#1a2a1a,#0d1117);display:flex;align-items:center;justify-content:center\">\n<span style=\"color:var(--text2)\">EKR Custom Fit</span>\n</div>',
    '<div class=\"card-img\"><img src=\"https://m.media-amazon.com/images/I/71W8jQw4x-L._AC_SL1500_.jpg\" alt=\"EKR Custom Fit Faux Leather Seat Covers\" loading=\"lazy\"></div>'
)

# Replace LUCKYMAN CLUB placeholder
html = html.replace(
    '<div class=\"card-img\" style=\"background:linear-gradient(135deg,#1a1a2e,#2e1a2e);display:flex;align-items:center;justify-content:center\">\n<span style=\"color:var(--text2)\">LUCKYMAN CLUB</span>\n</div>',
    '<div class=\"card-img\"><img src=\"https://m.media-amazon.com/images/I/71yA0mNJURL._AC_SL1500_.jpg\" alt=\"LUCKYMAN CLUB Full Set Seat Covers\" loading=\"lazy\"></div>'
)

# Replace FREESOO placeholder
html = html.replace(
    '<div class=\"card-img\" style=\"background:linear-gradient(135deg,#0d1117,#1a2e2e);display:flex;align-items:center;justify-content:center\">\n<span style=\"color:var(--text2)\">FREESOO Universal</span>\n</div>',
    '<div class=\"card-img\"><img src=\"https://m.media-amazon.com/images/I/71pPpZfyXBL._AC_SL1500_.jpg\" alt=\"FREESOO Universal Neoprene Seat Covers\" loading=\"lazy\"></div>'
)

open('index.html', 'w').write(html)
print('index.html updated')
"

# --- best-leather-covers.html: Add float-right images after each h3 ---
python3 -c "
html = open('best-leather-covers.html').read()

replacements = [
    ('<h3>1. Katzkin Custom Leather Interiors</h3>', '<h3>1. Katzkin Custom Leather Interiors</h3>\n<div style=\"float:right;margin:0 0 12px 20px;max-width:180px\"><img src=\"https://m.media-amazon.com/images/I/71cO89vKpIL._AC_SL1500_.jpg\" alt=\"Katzkin Custom Leather\" style=\"width:100%;border-radius:8px\"></div>'),
    ('<h3>2. EKR Custom Fit Faux Leather Seat Covers</h3>', '<h3>2. EKR Custom Fit Faux Leather Seat Covers</h3>\n<div style=\"float:right;margin:0 0 12px 20px;max-width:180px\"><img src=\"https://m.media-amazon.com/images/I/71W8jQw4x-L._AC_SL1500_.jpg\" alt=\"EKR Custom Fit Seat Covers\" style=\"width:100%;border-radius:8px\"></div>'),
    ('<h3>3. LUCKYMAN CLUB Faux Leather Seat Covers</h3>', '<h3>3. LUCKYMAN CLUB Faux Leather Seat Covers</h3>\n<div style=\"float:right;margin:0 0 12px 20px;max-width:180px\"><img src=\"https://m.media-amazon.com/images/I/71yA0mNJURL._AC_SL1500_.jpg\" alt=\"LUCKYMAN CLUB Seat Covers\" style=\"width:100%;border-radius:8px\"></div>'),
    ('<h3>4. OASIS AUTO Faux Leather Seat Covers</h3>', '<h3>4. OASIS AUTO Faux Leather Seat Covers</h3>\n<div style=\"float:right;margin:0 0 12px 20px;max-width:180px\"><img src=\"https://m.media-amazon.com/images/I/71yA0mNJURL._AC_SL1500_.jpg\" alt=\"OASIS AUTO Seat Covers\" style=\"width:100%;border-radius:8px\"></div>'),
    ('<h3>5. Coverado Faux Leather Seat Covers</h3>', '<h3>5. Coverado Faux Leather Seat Covers</h3>\n<div style=\"float:right;margin:0 0 12px 20px;max-width:180px\"><img src=\"https://m.media-amazon.com/images/I/71gSl6R6URL._AC_SL1500_.jpg\" alt=\"Coverado Seat Covers\" style=\"width:100%;border-radius:8px\"></div>'),
    ('<h3>6. Coverking Leatherette Seat Covers</h3>', '<h3>6. Coverking Leatherette Seat Covers</h3>\n<div style=\"float:right;margin:0 0 12px 20px;max-width:180px\"><img src=\"https://m.media-amazon.com/images/I/71gSl6R6URL._AC_SL1500_.jpg\" alt=\"Coverking Leatherette Seat Covers\" style=\"width:100%;border-radius:8px\"></div>'),
]

for old, new in replacements:
    html = html.replace(old, new)

open('best-leather-covers.html', 'w').write(html)
print('best-leather-covers.html updated')
"

# --- best-neoprene-covers.html ---
python3 -c "
html = open('best-neoprene-covers.html').read()

replacements = [
    ('<h3>1. Coverking Custom Neoprene Seat Covers</h3>', '<h3>1. Coverking Custom Neoprene Seat Covers</h3>\n<div style=\"float:right;margin:0 0 12px 20px;max-width:180px\"><img src=\"https://m.media-amazon.com/images/I/71gSl6R6URL._AC_SL1500_.jpg\" alt=\"Coverking Neoprene Seat Covers\" style=\"width:100%;border-radius:8px\"></div>'),
    ('<h3>2. CalTrend NeoSupreme Seat Covers</h3>', '<h3>2. CalTrend NeoSupreme Seat Covers</h3>\n<div style=\"float:right;margin:0 0 12px 20px;max-width:180px\"><img src=\"https://m.media-amazon.com/images/I/71cO89vKpIL._AC_SL1500_.jpg\" alt=\"CalTrend NeoSupreme Seat Covers\" style=\"width:100%;border-radius:8px\"></div>'),
    ('<h3>3. FREESOO Universal Neoprene Seat Covers</h3>', '<h3>3. FREESOO Universal Neoprene Seat Covers</h3>\n<div style=\"float:right;margin:0 0 12px 20px;max-width:180px\"><img src=\"https://m.media-amazon.com/images/I/71pPpZfyXBL._AC_SL1500_.jpg\" alt=\"FREESOO Neoprene Seat Covers\" style=\"width:100%;border-radius:8px\"></div>'),
    ('<h3>4. Gorla Premium Universal Neoprene Covers</h3>', '<h3>4. Gorla Premium Universal Neoprene Covers</h3>\n<div style=\"float:right;margin:0 0 12px 20px;max-width:180px\"><img src=\"https://m.media-amazon.com/images/I/71pPpZfyXBL._AC_SL1500_.jpg\" alt=\"Gorla Neoprene Seat Covers\" style=\"width:100%;border-radius:8px\"></div>'),
    ('<h3>5. FH Group Neoprene Seat Covers</h3>', '<h3>5. FH Group Neoprene Seat Covers</h3>\n<div style=\"float:right;margin:0 0 12px 20px;max-width:180px\"><img src=\"https://m.media-amazon.com/images/I/71W8jQw4x-L._AC_SL1500_.jpg\" alt=\"FH Group Neoprene Seat Covers\" style=\"width:100%;border-radius:8px\"></div>'),
    ('<h3>6. Rough Country Neoprene Seat Covers</h3>', '<h3>6. Rough Country Neoprene Seat Covers</h3>\n<div style=\"float:right;margin:0 0 12px 20px;max-width:180px\"><img src=\"https://m.media-amazon.com/images/I/71pPpZfyXBL._AC_SL1500_.jpg\" alt=\"Rough Country Neoprene Seat Covers\" style=\"width:100%;border-radius:8px\"></div>'),
]

for old, new in replacements:
    html = html.replace(old, new)

open('best-neoprene-covers.html', 'w').write(html)
print('best-neoprene-covers.html updated')
"

echo "=== cybertruckseatcovers.com done ==="

# Git commit and push
git add -A && git commit -m "Add real product images across all review pages" && git push

# =============================================
# SITE 2: cybertruckstorage.com
# =============================================
cd /home/ubuntu/.openclaw/workspace/cybertruckstorage.com

# --- best-bed-storage.html: items 3-6 missing images ---
python3 -c "
html = open('best-bed-storage.html').read()

replacements = [
    ('<h3>3. Cybertruck Bed Vault Organizer Bins</h3>', '<div class=\"float-img\"><img src=\"https://m.media-amazon.com/images/I/71kR2bSKPdL._AC_SL1500_.jpg\" alt=\"Cybertruck Bed Vault Organizer Bins\"></div>\n<h3>3. Cybertruck Bed Vault Organizer Bins</h3>'),
    ('<h3>4. Universal Truck Bed Rack Systems</h3>', '<div class=\"float-img\"><img src=\"https://m.media-amazon.com/images/I/71Qe5dJFD5L._AC_SL1500_.jpg\" alt=\"Truck Bed Rack System\"></div>\n<h3>4. Universal Truck Bed Rack Systems</h3>'),
    ('<h3>5. Cybertruck Bed Extender / Tailgate Extension</h3>', '<div class=\"float-img\"><img src=\"https://m.media-amazon.com/images/I/81HnY6WDPBL._AC_SL1500_.jpg\" alt=\"Cybertruck Bed Extender\"></div>\n<h3>5. Cybertruck Bed Extender / Tailgate Extension</h3>'),
    ('<h3>6. Cybertruck Bed Camping Platform / Mattress</h3>', '<div class=\"float-img\"><img src=\"https://m.media-amazon.com/images/I/71nO9rMgURL._AC_SL1500_.jpg\" alt=\"Cybertruck Bed Camping Platform\"></div>\n<h3>6. Cybertruck Bed Camping Platform / Mattress</h3>'),
]

for old, new in replacements:
    html = html.replace(old, new)

open('best-bed-storage.html', 'w').write(html)
print('best-bed-storage.html updated')
"

# --- best-frunk-organizers.html: item 6 missing ---
python3 -c "
html = open('best-frunk-organizers.html').read()

html = html.replace(
    '<h3>6. Generic Frunk Storage Bin / Container</h3>',
    '<div class=\"float-img\"><img src=\"https://m.media-amazon.com/images/I/71kR2bSKPdL._AC_SL1500_.jpg\" alt=\"Generic Frunk Storage Bin\"></div>\n<h3>6. Generic Frunk Storage Bin / Container</h3>'
)

open('best-frunk-organizers.html', 'w').write(html)
print('best-frunk-organizers.html updated')
"

# --- best-interior-organizers.html: items 7-8 missing ---
python3 -c "
html = open('best-interior-organizers.html').read()

replacements = [
    ('<h3>7. Foronetry Armrest Console Tray with USB Hub</h3>', '<div class=\"float-img\"><img src=\"https://m.media-amazon.com/images/I/71YOQ1zWJIL._AC_SL1500_.jpg\" alt=\"Foronetry Armrest Console Tray\"></div>\n<h3>7. Foronetry Armrest Console Tray with USB Hub</h3>'),
    ('<h3>8. Cybertruck Floor Console Trash Can + Organizer</h3>', '<div class=\"float-img\"><img src=\"https://m.media-amazon.com/images/I/71Rk9xk5mXL._AC_SL1500_.jpg\" alt=\"Cybertruck Console Trash Can Organizer\"></div>\n<h3>8. Cybertruck Floor Console Trash Can + Organizer</h3>'),
]

for old, new in replacements:
    html = html.replace(old, new)

open('best-interior-organizers.html', 'w').write(html)
print('best-interior-organizers.html updated')
"

# --- best-tonneau-covers.html: all 6 review cards missing images ---
python3 -c "
html = open('best-tonneau-covers.html').read()

replacements = [
    ('<h3>1. Aftermarket Hard Tri-Fold Tonneau Covers</h3>', '<div class=\"float-img\"><img src=\"https://m.media-amazon.com/images/I/71nO9rMgURL._AC_SL1500_.jpg\" alt=\"Cybertruck Hard Tri-Fold Tonneau Cover\"></div>\n<h3>1. Aftermarket Hard Tri-Fold Tonneau Covers</h3>'),
    ('<h3>2. Tonneau Cover Manual Override Kits</h3>', '<div class=\"float-img\"><img src=\"https://m.media-amazon.com/images/I/81HnY6WDPBL._AC_SL1500_.jpg\" alt=\"Tonneau Cover Manual Override Kit\"></div>\n<h3>2. Tonneau Cover Manual Override Kits</h3>'),
    ('<h3>3. Cybertruck Bed Cap / Camper Shell</h3>', '<div class=\"float-img\"><img src=\"https://m.media-amazon.com/images/I/71Qe5dJFD5L._AC_SL1500_.jpg\" alt=\"Cybertruck Bed Cap Camper Shell\"></div>\n<h3>3. Cybertruck Bed Cap / Camper Shell</h3>'),
    ('<h3>4. Soft Roll-Up Bed Covers</h3>', '<div class=\"float-img\"><img src=\"https://m.media-amazon.com/images/I/71nO9rMgURL._AC_SL1500_.jpg\" alt=\"Cybertruck Soft Roll-Up Bed Cover\"></div>\n<h3>4. Soft Roll-Up Bed Covers</h3>'),
    ('<h3>5. Tonneau Cover Weather Seal Kits</h3>', '<div class=\"float-img\"><img src=\"https://m.media-amazon.com/images/I/71kR2bSKPdL._AC_SL1500_.jpg\" alt=\"Tonneau Cover Weather Seal Kit\"></div>\n<h3>5. Tonneau Cover Weather Seal Kits</h3>'),
    ('<h3>6. Stock Tonneau Cover Replacement Parts</h3>', '<div class=\"float-img\"><img src=\"https://m.media-amazon.com/images/I/81HnY6WDPBL._AC_SL1500_.jpg\" alt=\"Stock Tonneau Cover Replacement Parts\"></div>\n<h3>6. Stock Tonneau Cover Replacement Parts</h3>'),
]

for old, new in replacements:
    html = html.replace(old, new)

open('best-tonneau-covers.html', 'w').write(html)
print('best-tonneau-covers.html updated')
"

# --- index.html: bottom 4 category cards missing images ---
python3 -c "
html = open('index.html').read()

# Add images to the bottom category cards
replacements = [
    ('<div class=\"product-card\">\n<h3>Frunk (Front Trunk)</h3>', '<div class=\"product-card\">\n<img class=\"card-img\" src=\"https://m.media-amazon.com/images/I/71Qe5dJFD5L._AC_SL1500_.jpg\" alt=\"Cybertruck Frunk Organizer\" loading=\"lazy\">\n<h3>Frunk (Front Trunk)</h3>'),
    ('<div class=\"product-card\">\n<h3>Truck Bed &amp; Bed Vault</h3>', '<div class=\"product-card\">\n<img class=\"card-img\" src=\"https://m.media-amazon.com/images/I/81HnY6WDPBL._AC_SL1500_.jpg\" alt=\"Cybertruck Bed Storage\" loading=\"lazy\">\n<h3>Truck Bed &amp; Bed Vault</h3>'),
    ('<div class=\"product-card\">\n<h3>Tonneau Cover</h3>', '<div class=\"product-card\">\n<img class=\"card-img\" src=\"https://m.media-amazon.com/images/I/71nO9rMgURL._AC_SL1500_.jpg\" alt=\"Cybertruck Tonneau Cover\" loading=\"lazy\">\n<h3>Tonneau Cover</h3>'),
    ('<div class=\"product-card\">\n<h3>Interior &amp; Console</h3>', '<div class=\"product-card\">\n<img class=\"card-img\" src=\"https://m.media-amazon.com/images/I/71kR2bSKPdL._AC_SL1500_.jpg\" alt=\"Cybertruck Interior Organizer\" loading=\"lazy\">\n<h3>Interior &amp; Console</h3>'),
]

for old, new in replacements:
    html = html.replace(old, new)

open('index.html', 'w').write(html)
print('index.html updated')
"

echo "=== cybertruckstorage.com done ==="
git add -A && git commit -m "Add real product images across all review pages" && git push

echo "All storage site images added!"
