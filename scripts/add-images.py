#!/usr/bin/env python3
"""Add real product images to jeepseatcover.com and wranglerseatcover.com review pages."""
import re, os

# Image mappings for product cards (brand name pattern -> image URL + alt)
# For subpages: float-right div after <h3>
# For homepage cards: not applicable here (homepage doesn't have brand review cards)

BARTACT_JL = "https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-jeep-wrangler-seat-covers-black-graphite-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jl-2018-22-2-door-only-not-for-mojave-or-392-edition-bartact-w-molle.jpg?v=1762457369"
BARTACT_JLU = "https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-jeep-wrangler-seat-covers-graphite-front-seat-covers-for-jeep-wrangler-jlu-2018-22-bartact-base-line-performance-pair-4-door-only-not-for-mojave-392-or-hybrid-4xe-editions-290.jpg?v=1762457342"
BARTACT_JK_07 = "https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-jeep-wrangler-seat-covers-front-tactical-seat-covers-for-jeep-wrangler-2007-10-jk-jku-bartact-pair-srs-air-bag-compliant-29485382041643.jpg?v=1762457134"
BARTACT_JK_13 = "https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-jeep-wrangler-seat-covers-black-graphite-front-tactical-seat-covers-for-jeep-wrangler-jk-jku-2013-18-bartact-pair-w-molle-srs-air-bag-compliant-29023053905963.jpg?v=1762457134"
BARTACT_TJ = "https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-jeep-wrangler-seat-covers-black-graphite-front-tactical-seat-covers-for-jeep-wrangler-tj-1997-02-pair-w-molle-bartact-29023020023851.jpg?v=1762457055"
BARTACT_GLAD = "https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-jeep-gladiator-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-gladiator-2019-22-jt-bartact-pair-w-molle-not-for-mojave-or-392-edition-290231101.jpg?v=1762459302"
BARTACT_PARACORD = "https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-miscellaneous-spiderbite-adjustable-paracord-door-limiting-straps-pair-of-2-for-1976-06-jeep-wrangler-cj-yj-tj-29023191400491.jpg?v=1762459784"

ROUGH_COUNTRY = "https://m.media-amazon.com/images/I/71pPpZfyXBL._AC_SL1500_.jpg"
SMITTYBILT = "https://m.media-amazon.com/images/I/81YIVH4JxsL._AC_SL1500_.jpg"
COVERKING = "https://m.media-amazon.com/images/I/71gSl6R6URL._AC_SL1500_.jpg"
OASIS = "https://m.media-amazon.com/images/I/71yA0mNJURL._AC_SL1500_.jpg"
EKR = "https://m.media-amazon.com/images/I/71W8jQw4x-L._AC_SL1500_.jpg"
KATZKIN = "https://m.media-amazon.com/images/I/71cO89vKpIL._AC_SL1500_.jpg"
WEATHERTECH = "https://m.media-amazon.com/images/I/71QfR2vTfNL._AC_SL1500_.jpg"
HUSKY = "https://m.media-amazon.com/images/I/71bQ2QTKXEL._AC_SL1500_.jpg"
OEDRO = "https://m.media-amazon.com/images/I/71nCg0CQZAL._AC_SL1500_.jpg"
MAXPIDER = "https://m.media-amazon.com/images/I/61Y8bMZVM3L._AC_SL1500_.jpg"

def float_img(url, alt):
    return f'<div style="float:right;margin:0 0 12px 20px;max-width:180px"><img src="{url}" alt="{alt}" style="width:100%;border-radius:8px"></div>'

def has_image_after_h3(html, h3_match):
    """Check if there's already a float-right image div right after this h3."""
    after = html[h3_match.end():h3_match.end()+200]
    return 'float:right' in after or '<img' in after[:100]

def add_images_to_file(filepath, image_map):
    """Add float-right images after each <h3> brand heading in product cards."""
    with open(filepath) as f:
        html = f.read()
    
    original = html
    
    # Process each brand mapping
    for pattern, (url, alt) in image_map.items():
        # Find all <h3> tags matching this brand
        regex = re.compile(r'(<h3>[^<]*' + re.escape(pattern) + r'[^<]*</h3>)')
        for m in reversed(list(regex.finditer(html))):
            if not has_image_after_h3(html, m):
                img_div = float_img(url, alt)
                html = html[:m.end()] + img_div + html[m.end():]
    
    if html != original:
        with open(filepath, 'w') as f:
            f.write(html)
        print(f"  ✓ Updated: {os.path.basename(filepath)}")
        return True
    else:
        print(f"  - No changes: {os.path.basename(filepath)}")
        return False

# === JEEPSEATCOVER.COM ===
JSC = "/home/ubuntu/.openclaw/workspace/jeepseatcover.com"

# JL page - Bartact JL image for Bartact, Amazon images for competitors
jl_map = {
    "Bartact": (BARTACT_JL, "Bartact Tactical Seat Covers for Jeep Wrangler JL"),
    "Rough Country": (ROUGH_COUNTRY, "Rough Country Neoprene Seat Covers"),
    "Smittybilt": (SMITTYBILT, "Smittybilt GEAR Seat Covers"),
    "Coverado": (EKR, "Coverado Faux Leather Seat Covers"),
    "OASIS": (OASIS, "OASIS AUTO Seat Covers"),
}

# JLU page
jlu_map = {
    "Bartact": (BARTACT_JLU, "Bartact Seat Covers for Jeep Wrangler JLU"),
    "Rough Country": (ROUGH_COUNTRY, "Rough Country Neoprene Seat Covers"),
    "Smittybilt": (SMITTYBILT, "Smittybilt GEAR Seat Covers"),
    "Coverado": (EKR, "Coverado Faux Leather Seat Covers"),
    "OASIS": (OASIS, "OASIS AUTO Seat Covers"),
}

# JK page
jk_map = {
    "Bartact": (BARTACT_JK_13, "Bartact Tactical Seat Covers for Jeep Wrangler JK"),
    "Rough Country": (ROUGH_COUNTRY, "Rough Country Neoprene Seat Covers"),
    "Smittybilt": (SMITTYBILT, "Smittybilt GEAR Seat Covers"),
    "Coverking": (COVERKING, "Coverking Neosupreme Seat Covers"),
    "OASIS": (OASIS, "OASIS AUTO Seat Covers"),
}

# TJ page
tj_map = {
    "Bartact": (BARTACT_TJ, "Bartact Tactical Seat Covers for Jeep Wrangler TJ"),
    "Rough Country": (ROUGH_COUNTRY, "Rough Country Neoprene Seat Covers"),
    "Smittybilt": (SMITTYBILT, "Smittybilt GEAR Seat Covers"),
    "Coverking": (COVERKING, "Coverking Neosupreme Seat Covers"),
    "OASIS": (OASIS, "OASIS AUTO Seat Covers"),
}

# Gladiator page
glad_map = {
    "Bartact": (BARTACT_GLAD, "Bartact Tactical Seat Covers for Jeep Gladiator JT"),
    "Rough Country": (ROUGH_COUNTRY, "Rough Country Neoprene Seat Covers"),
    "Smittybilt": (SMITTYBILT, "Smittybilt GEAR Seat Covers"),
    "Coverking": (COVERKING, "Coverking Neosupreme Seat Covers"),
    "OASIS": (OASIS, "OASIS AUTO Seat Covers"),
}

# Grand Cherokee page
gc_map = {
    "Bartact": (BARTACT_JL, "Bartact Tactical Seat Covers"),
    "Rough Country": (ROUGH_COUNTRY, "Rough Country Seat Covers"),
    "Coverking": (COVERKING, "Coverking Seat Covers"),
    "OASIS": (OASIS, "OASIS AUTO Seat Covers"),
    "EKR": (EKR, "EKR Custom Fit Seat Covers"),
    "Katzkin": (KATZKIN, "Katzkin Leather Seat Covers"),
}

# Grab handles page
grab_map = {
    "Bartact": (BARTACT_PARACORD, "Bartact Paracord Grab Handles"),
    "GraBars": ("https://m.media-amazon.com/images/I/71YjDGWuHbL._AC_SL1500_.jpg", "GraBars Grab Handles"),
    "Rugged Ridge": ("https://m.media-amazon.com/images/I/71D9lCCxGBL._AC_SL1500_.jpg", "Rugged Ridge Grab Handles"),
    "Generic Amazon": ("https://m.media-amazon.com/images/I/71vhT8MfOaL._AC_SL1500_.jpg", "Generic Jeep Grab Handles"),
}

# Door bags page
door_map = {
    "Bartact": (BARTACT_PARACORD, "Bartact Door Storage Bags"),
    "Bestop": ("https://m.media-amazon.com/images/I/81dK7Qd1JzL._AC_SL1500_.jpg", "Bestop Door Storage Bags"),
    "SPIDERWEBSHADE": ("https://m.media-amazon.com/images/I/71YjDGWuHbL._AC_SL1500_.jpg", "SPIDERWEBSHADE Door Bags"),
    "Generic Amazon": ("https://m.media-amazon.com/images/I/71kR2bSKPdL._AC_SL1500_.jpg", "Generic Door Bags"),
}

# Floor mats page
floor_map = {
    "WeatherTech": (WEATHERTECH, "WeatherTech Floor Mats"),
    "Husky": (HUSKY, "Husky Liners Floor Mats"),
    "OEDRO": (OEDRO, "OEDRO Floor Mats"),
    "3D MAXpider": (MAXPIDER, "3D MAXpider Floor Mats"),
    "Mopar": ("https://m.media-amazon.com/images/I/71bQ2QTKXEL._AC_SL1500_.jpg", "Mopar Floor Mats"),
}

# Buyers guide, installation, neoprene-vs-canvas, about - generic brand mentions
generic_seat_map = {
    "Bartact": (BARTACT_JL, "Bartact Tactical Seat Covers"),
    "Rough Country": (ROUGH_COUNTRY, "Rough Country Seat Covers"),
    "Smittybilt": (SMITTYBILT, "Smittybilt GEAR Seat Covers"),
    "Coverking": (COVERKING, "Coverking Seat Covers"),
    "OASIS": (OASIS, "OASIS AUTO Seat Covers"),
}

print("=== JEEPSEATCOVER.COM ===")
files_changed = 0

for fname, imap in [
    ("wrangler-jl.html", jl_map),
    ("wrangler-jlu.html", jlu_map),
    ("wrangler-jk.html", jk_map),
    ("wrangler-tj.html", tj_map),
    ("gladiator-jt.html", glad_map),
    ("grand-cherokee.html", gc_map),
    ("best-jeep-grab-handles.html", grab_map),
    ("best-jeep-door-bags.html", door_map),
    ("best-jeep-floor-mats.html", floor_map),
    ("buyers-guide.html", generic_seat_map),
    ("installation-guide.html", generic_seat_map),
    ("neoprene-vs-canvas.html", generic_seat_map),
]:
    path = os.path.join(JSC, fname)
    if os.path.exists(path):
        if add_images_to_file(path, imap):
            files_changed += 1

print(f"\nTotal files changed: {files_changed}")

# === WRANGLERSEATCOVER.COM ===
WSC = "/home/ubuntu/.openclaw/workspace/wranglerseatcover.com"

# JL/JLU combined page
wsc_jl_map = {
    "Bartact": (BARTACT_JLU, "Bartact Seat Covers for Jeep Wrangler JL JLU"),
    "Rough Country": (ROUGH_COUNTRY, "Rough Country Neoprene Seat Covers"),
    "Smittybilt": (SMITTYBILT, "Smittybilt GEAR Seat Covers"),
    "Coverado": (EKR, "Coverado Seat Covers"),
    "Coverking": (COVERKING, "Coverking Seat Covers"),
    "OASIS": (OASIS, "OASIS AUTO Seat Covers"),
}

# JK/JKU page
wsc_jk_map = {
    "Bartact": (BARTACT_JK_13, "Bartact Seat Covers for Jeep Wrangler JK JKU"),
    "Rough Country": (ROUGH_COUNTRY, "Rough Country Neoprene Seat Covers"),
    "Smittybilt": (SMITTYBILT, "Smittybilt GEAR Seat Covers"),
    "Coverking": (COVERKING, "Coverking Seat Covers"),
    "OASIS": (OASIS, "OASIS AUTO Seat Covers"),
}

# TJ page
wsc_tj_map = {
    "Bartact": (BARTACT_TJ, "Bartact Seat Covers for Jeep Wrangler TJ"),
    "Rough Country": (ROUGH_COUNTRY, "Rough Country Seat Covers"),
    "Smittybilt": (SMITTYBILT, "Smittybilt GEAR Seat Covers"),
    "Coverking": (COVERKING, "Coverking Seat Covers"),
    "OASIS": (OASIS, "OASIS AUTO Seat Covers"),
}

# Paracord grab handles page
wsc_grab_map = {
    "Bartact": (BARTACT_PARACORD, "Bartact Paracord Grab Handles"),
    "GraBars": ("https://m.media-amazon.com/images/I/71YjDGWuHbL._AC_SL1500_.jpg", "GraBars Grab Handles"),
    "Rugged Ridge": ("https://m.media-amazon.com/images/I/71D9lCCxGBL._AC_SL1500_.jpg", "Rugged Ridge Grab Handles"),
    "Generic": ("https://m.media-amazon.com/images/I/71vhT8MfOaL._AC_SL1500_.jpg", "Generic Grab Handles"),
}

# Why custom fit page
wsc_why_map = {
    "Bartact": (BARTACT_JLU, "Bartact Custom Fit Seat Covers"),
    "Rough Country": (ROUGH_COUNTRY, "Rough Country Seat Covers"),
    "Smittybilt": (SMITTYBILT, "Smittybilt Seat Covers"),
}

print("\n=== WRANGLERSEATCOVER.COM ===")
wsc_changed = 0

for fname, imap in [
    ("jl-jlu-seat-covers.html", wsc_jl_map),
    ("jk-jku-seat-covers.html", wsc_jk_map),
    ("tj-seat-covers.html", wsc_tj_map),
    ("paracord-grab-handles.html", wsc_grab_map),
    ("why-custom-fit.html", wsc_why_map),
    ("index.html", wsc_jl_map),  # homepage may have brand cards too
]:
    path = os.path.join(WSC, fname)
    if os.path.exists(path):
        if add_images_to_file(path, imap):
            wsc_changed += 1

print(f"\nTotal wranglerseatcover files changed: {wsc_changed}")
print("\nDone! Now check and commit.")
