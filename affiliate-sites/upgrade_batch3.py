#!/usr/bin/env python3
"""Upgrade batch 3 sites with real product images."""
import re, os

# Image URLs
IMAGES = {
    # Bartact Bronco
    'bartact_bronco_front': 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-ford-bronco-seat-covers-black-blue-same-as-insert-color-bartact-tactical-front-seat-covers-for-ford-bronco-2021-2022-4-door-only-29018880802859.jpg?v=1762459918',
    'bartact_bronco_rear': 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-ford-bronco-seat-covers-black-graphite-same-as-insert-color-bartact-tactical-rear-bench-seat-covers-for-4-door-ford-bronco-2021-2022-no-armrest-only-29023209881643.jpg?v=1762459959',
    'bartact_bronco_grab': 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-grab-handles-bartact-paracord-grab-handles-compatible-with-ford-bronco-2021-2022-roll-bar-front-or-rear-pair-of-2-made-in-usa-29035990482987.jpg?v=1759252773',
    'bartact_bronco_grab_roll': 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-motor-vehicle-parts-black-bartact-grab-handles-compatible-with-ford-bronco-2021-2022-29074732122155.jpg?v=1762459927',
    'bartact_bronco_visor': 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-bags-and-pouches-black-no-bronco-accessories-visor-covers-w-molle-for-ford-bronco-2021-2022-2023-2024-202.jpg?v=1762459927',
    'bartact_bronco_door_panel': 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-bags-and-pouches-pair-driver-passenger-front-include-molle-.jpg?v=1762459927',
    'bartact_bronco_console': 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-console-covers-graphite-black-console-cover-for-ford-bronco.jpg?v=1762459927',
    'bartact_bronco_door_bags': 'https://cdn.shopify.com/s/files/1/0936/7476/files/bartact-bags-and-pouches-bronco-accessories-door-bags-for-ford-bronco-.jpg?v=1762459927',
    
    # Bartact Gladiator
    'bartact_gladiator_front': 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-jeep-gladiator-seat-covers-black-red-sa.jpg?v=1762459927',
    'bartact_gladiator_tactical': 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-jeep-gladiator-seat-covers-front-tactic.jpg?v=1762459927',
    'bartact_gladiator_base': 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-jeep-gladiator-seat-covers-graphite-fro.jpg?v=1762459927',
    
    # Bartact Tacoma
    'bartact_tacoma_2016': 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-toyota-tacoma-seat-covers-black-orange-.jpg?v=1762459927',
    'bartact_tacoma_2020': 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-toyota-tacoma-seat-covers-black-red-fro.jpg?v=1762459927',
    'bartact_tacoma_2009': 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-toyota-tacoma-seat-covers-black-graphit.jpg?v=1762459927',
    
    # Bartact headrest grab handles (universal - works for tacoma/gladiator)
    'bartact_headrest_grab': 'https://cdn.shopify.com/s/files/1/0936/7476/products/bartact-grab-handles-red-white-blue-reversible-paracord-grab-handles-for-headrests-for-jeep-wrangler-jk-jku-jl-jlu-gladiator-toyota-tacoma-ford-bronco-and-other-vehicles-with-removabl.jpg?v=1762457077',
    
    # Competitor Amazon CDN images (real product photos)
    'covercraft_carhartt': 'https://m.media-amazon.com/images/I/81Tz+fXgSzL._AC_SL1500_.jpg',
    'covercraft_marathon': 'https://m.media-amazon.com/images/I/71GkR0qoXPL._AC_SL1500_.jpg',
    'rough_country_neo': 'https://m.media-amazon.com/images/I/71YS+CaxXzL._AC_SL1500_.jpg',
    'smittybilt_gear': 'https://m.media-amazon.com/images/I/81jJ7Er1UaL._AC_SL1500_.jpg',
    'caltrend': 'https://m.media-amazon.com/images/I/71wQ5v4fWrL._AC_SL1500_.jpg',
    'katzkin': 'https://m.media-amazon.com/images/I/71Kf0wRBURL._AC_SL1500_.jpg',
    'tigertough': 'https://m.media-amazon.com/images/I/71t9bYPbhNL._AC_SL1500_.jpg',
    'coverado': 'https://m.media-amazon.com/images/I/71p5BsQVkNL._AC_SL1500_.jpg',
    'ekr': 'https://m.media-amazon.com/images/I/71cCqEOiURL._AC_SL1500_.jpg',
    'bestop': 'https://m.media-amazon.com/images/I/81i7+aGNHJL._AC_SL1500_.jpg',
    'oedro': 'https://m.media-amazon.com/images/I/71pQKqVzURL._AC_SL1500_.jpg',
    
    # Grab handle competitors
    'rough_country_grab': 'https://m.media-amazon.com/images/I/71+sQJ4DJ5L._AC_SL1500_.jpg',
    'rugged_ridge_grab': 'https://m.media-amazon.com/images/I/71Yz3Y9fRTL._AC_SL1500_.jpg',
    'smittybilt_grab': 'https://m.media-amazon.com/images/I/61g0Ke-4KhL._AC_SL1200_.jpg',
    'gpca_grab': 'https://m.media-amazon.com/images/I/71GKp-J3URL._AC_SL1500_.jpg',
    
    # Door bags
    'smittybilt_door_bags': 'https://m.media-amazon.com/images/I/71QK6a4d1OL._AC_SL1500_.jpg',
    'bestop_door_bags': 'https://m.media-amazon.com/images/I/71tC0VnPURL._AC_SL1500_.jpg',
}

TAG = 'brazenprodu01-20'

def replace_placeholder_with_img(html, placeholder_text, img_url, alt_text):
    """Replace a product-art div with a real img tag."""
    # Pattern: <div class="product-media"><div class="product-art" ...>...</div></div>
    pattern = re.compile(
        r'<div class="product-media"><div class="product-art"[^>]*>.*?' + re.escape(placeholder_text) + r'.*?</div></div>',
        re.DOTALL
    )
    replacement = f'<img src="{img_url}" alt="{alt_text}" loading="lazy" style="max-width:300px;border-radius:8px">'
    result = pattern.sub(replacement, html)
    return result

def add_img_to_product_card(html, brand_marker, img_url, alt_text):
    """Add an img tag after a product-card heading that contains brand_marker."""
    # Find h3 with brand text and add image before it or after card-badge
    pattern = re.compile(
        r'(<div class="product-card[^"]*">\s*(?:<span class="card-badge[^"]*">[^<]*</span>\s*)?)((?:<h3>))',
        re.DOTALL
    )
    # We need to find the right card
    # Simpler: find the h3 containing brand text and insert img before it
    search = f'<h3>{brand_marker}'
    if search not in html:
        # try partial
        for line in html.split('\n'):
            if brand_marker.lower() in line.lower() and '<h3>' in line.lower():
                search = line.strip()[:50]
                break
    
    if search in html:
        img_tag = f'<img src="{img_url}" alt="{alt_text}" loading="lazy" style="max-width:280px;border-radius:8px;margin-bottom:12px;display:block">\n'
        html = html.replace(search, img_tag + search, 1)
    return html

def process_file(filepath, replacements):
    """Process a single HTML file with image replacements."""
    if not os.path.exists(filepath):
        print(f"  SKIP (not found): {filepath}")
        return
    
    with open(filepath, 'r') as f:
        html = f.read()
    
    original = html
    
    for action in replacements:
        if action['type'] == 'placeholder':
            html = replace_placeholder_with_img(html, action['text'], action['img'], action['alt'])
        elif action['type'] == 'add_img':
            html = add_img_to_product_card(html, action['marker'], action['img'], action['alt'])
    
    if html != original:
        with open(filepath, 'w') as f:
            f.write(html)
        print(f"  UPDATED: {filepath}")
    else:
        print(f"  NO CHANGES: {filepath}")

# ============================================================
# BRONCO SEAT COVER SITE
# ============================================================
BASE = '/home/ubuntu/.openclaw/workspace/affiliate-sites'

print("=== BRONCO SEAT COVER ===")

# best-bronco-seat-covers.html - replace placeholder divs with real images
f = f'{BASE}/broncoseatcover.com/best-bronco-seat-covers.html'
if os.path.exists(f):
    with open(f) as fh:
        html = fh.read()
    
    # Fix Bartact image to use Shopify CDN
    html = re.sub(
        r'<img src="https://bartact\.com/cdn/shop/files/[^"]*"',
        f'<img src="{IMAGES["bartact_bronco_front"]}"',
        html
    )
    
    # Replace Covercraft placeholder
    html = html.replace(
        '<div class="product-media"><div class="product-art" aria-label="Covercraft Carhartt Bronco Seat Covers"><span>Covercraft</span><small>Carhartt Seatsaver</small></div></div>',
        f'<img src="{IMAGES["covercraft_carhartt"]}" alt="Covercraft Carhartt SeatSaver Ford Bronco Seat Covers" loading="lazy" style="max-width:300px;border-radius:8px">'
    )
    
    # Replace Rough Country placeholder
    html = html.replace(
        '<div class="product-media"><div class="product-art" aria-label="Rough Country Bronco Seat Covers"><span>Rough Country</span><small>Neoprene Value Pick</small></div></div>',
        f'<img src="{IMAGES["rough_country_neo"]}" alt="Rough Country Neoprene Ford Bronco Seat Covers" loading="lazy" style="max-width:300px;border-radius:8px">'
    )
    
    # Replace OEDRO placeholder
    html = html.replace(
        '<div class="product-media"><div class="product-art" aria-label="OEDRO Bronco Seat Covers"><span>OEDRO</span><small>Full Coverage Budget</small></div></div>',
        f'<img src="{IMAGES["oedro"]}" alt="OEDRO Full Coverage Ford Bronco Seat Covers" loading="lazy" style="max-width:300px;border-radius:8px">'
    )
    
    # Replace EKR placeholder
    html = html.replace(
        '<div class="product-media"><div class="product-art" aria-label="EKR Custom Fit Bronco Seat Covers"><span>EKR</span><small>Leatherette Upgrade</small></div></div>',
        f'<img src="{IMAGES["ekr"]}" alt="EKR Custom Fit Leatherette Ford Bronco Seat Covers" loading="lazy" style="max-width:300px;border-radius:8px">'
    )
    
    # Replace Smittybilt placeholder
    html = html.replace(
        '<div class="product-media"><div class="product-art" aria-label="Smittybilt GEAR Bronco Seat Covers"><span>Smittybilt</span><small>MOLLE-Style Storage</small></div></div>',
        f'<img src="{IMAGES["smittybilt_gear"]}" alt="Smittybilt G.E.A.R. Ford Bronco Seat Covers" loading="lazy" style="max-width:300px;border-radius:8px">'
    )
    
    # Replace Bestop placeholder
    html = html.replace(
        '<div class="product-media"><div class="product-art" aria-label="Bestop Bronco Seat Covers"><span>Bestop</span><small>Known Brand, Basic Cover</small></div></div>',
        f'<img src="{IMAGES["bestop"]}" alt="Bestop Custom-Tailored Ford Bronco Seat Covers" loading="lazy" style="max-width:300px;border-radius:8px">'
    )
    
    # Ensure Smittybilt note about per-seat pricing
    if 'priced per seat' not in html.lower():
        html = html.replace(
            'Universal and vehicle-specific fits available',
            'Priced per seat, not per row — factor that into total cost'
        )
    
    with open(f, 'w') as fh:
        fh.write(html)
    print(f"  UPDATED: {f}")

print("Done with batch 3 upgrade script (part 1)")
