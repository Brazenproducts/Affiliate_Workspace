#!/usr/bin/env python3
"""
Fix affiliate homepages:
1. Add full nav with all subpages linked
2. Fix bad CSS color (#7f1d1d2 -> proper hex)
"""
import os, re

BASE = "/home/ubuntu/.openclaw/workspace/elipacko-sites"

SITES = {
    "meatlugs": {
        "domain": "meatlugs.com",
        "color": "#7f1d1d",
        "color2": "#b91c1c",
        "pages": [
            ("wholesale-meat-lugs", "Wholesale Meat Lugs"),
            ("haccp-color-coded-lugs", "HACCP Color-Coded"),
            ("meat-lug-sizes", "Sizes Guide"),
            ("food-grade-meat-containers", "Food-Grade"),
            ("plastic-meat-lugs", "Plastic Lugs"),
            ("meat-processing-tubs", "Processing Tubs"),
            ("buy-meat-lugs", "Buy Meat Lugs"),
            ("faq", "FAQ"),
        ]
    },
    "plasticgaylord": {
        "domain": "plasticgaylord.com",
        "color": "#1e3a5f",
        "color2": "#1a6bdb",
        "pages": []
    },
    "plasticgaylordbox": {
        "domain": "plasticgaylordbox.com",
        "color": "#1e3a5f",
        "color2": "#1a6bdb",
        "pages": []
    },
    "plasticgaylordboxes": {
        "domain": "plasticgaylordboxes.com",
        "color": "#1e3a5f",
        "color2": "#1a6bdb",
        "pages": []
    },
    "gaylordboxesplastic": {
        "domain": "gaylordboxesplastic.com",
        "color": "#1e3a5f",
        "color2": "#1a6bdb",
        "pages": []
    },
    "heavydutypallets": {
        "domain": "heavydutypallets.com",
        "color": "#1c3d2e",
        "color2": "#16a34a",
        "pages": []
    },
    "heavydutyplasticpallets": {
        "domain": "heavydutyplasticpallets.com",
        "color": "#1c3d2e",
        "color2": "#16a34a",
        "pages": []
    },
    "poultrycrates": {
        "domain": "poultrycrates.com",
        "color": "#78350f",
        "color2": "#d97706",
        "pages": []
    },
    "poultryboxes": {
        "domain": "poultryboxes.com",
        "color": "#78350f",
        "color2": "#d97706",
        "pages": []
    },
    "poultryshippingboxes": {
        "domain": "poultryshippingboxes.com",
        "color": "#78350f",
        "color2": "#d97706",
        "pages": []
    },
    "producecrates": {
        "domain": "producecrates.com",
        "color": "#14532d",
        "color2": "#16a34a",
        "pages": []
    },
    "vegetablecrates": {
        "domain": "vegetablecrates.com",
        "color": "#14532d",
        "color2": "#16a34a",
        "pages": []
    },
    "cardboardproduceboxes": {
        "domain": "cardboardproduceboxes.com",
        "color": "#14532d",
        "color2": "#16a34a",
        "pages": []
    },
    "waxproduceboxes": {
        "domain": "waxproduceboxes.com",
        "color": "#14532d",
        "color2": "#16a34a",
        "pages": []
    },
    "reusableshippingboxes": {
        "domain": "reusableshippingboxes.com",
        "color": "#1e3a5f",
        "color2": "#1a6bdb",
        "pages": []
    },
}

def get_subpages(site_dir):
    """Auto-discover subpage directories"""
    path = f"{BASE}/{site_dir}"
    pages = []
    skip = {"e9c8f5a4b3d2c1a0f9e8d7c6b5a4e9c8.txt", "CNAME", "robots.txt", "sitemap.xml", "index.html"}
    for entry in sorted(os.listdir(path)):
        full = os.path.join(path, entry)
        if os.path.isdir(full) and entry not in skip:
            # Make a human-readable name
            name = entry.replace("-", " ").title()
            pages.append((entry, name))
    return pages

def fix_site(site_dir, cfg):
    path = f"{BASE}/{site_dir}/index.html"
    with open(path) as f:
        html = f.read()

    color = cfg["color"]
    color2 = cfg["color2"]
    domain = cfg["domain"]
    
    # Auto-discover subpages if not explicitly set
    pages = cfg["pages"] if cfg["pages"] else get_subpages(site_dir)

    # Fix bad hex — color2 was getting appended: e.g. #7f1d1d2 -> #b91c1c
    # The bug was color2 appended without # so we got e.g. #7f1d1db91c1c or #7f1d1d2
    # Replace any VAR_COLOR2 remnant that leaked as literal string
    bad_colors = [
        color + color2.lstrip("#"),   # e.g. #7f1d1db91c1c
        color + "2",                   # e.g. #7f1d1d2
    ]
    for bad in bad_colors:
        html = html.replace(bad, color2)
    
    # Build proper nav links
    nav_links_html = '<a href="/">Home</a>'
    for slug, name in pages:
        nav_links_html += f'<a href="/{slug}/">{name}</a>'
    nav_links_html += f'<a href="https://elipacko.com" target="_blank" rel="noopener" class="nav-cta">Get a Quote</a>'

    # Replace the nav-links div content
    old_nav = re.search(r'<div class="nav-links">.*?</div>', html, re.DOTALL)
    if old_nav:
        new_nav = f'<div class="nav-links">{nav_links_html}</div>'
        html = html[:old_nav.start()] + new_nav + html[old_nav.end():]
    
    # Add nav-links responsive CSS if not present
    if "nav-links{flex-wrap" not in html and ".nav-links{flex-wrap" not in html:
        extra_css = """
.nav-links{display:flex;flex-wrap:wrap;gap:4px;align-items:center}
.nav-links a{color:rgba(255,255,255,.85);padding:5px 10px;font-size:.8rem;font-weight:500;border-radius:4px;white-space:nowrap}
.nav-links a:hover{background:rgba(255,255,255,.15)}
@media(max-width:600px){nav{flex-direction:column;align-items:flex-start;gap:6px}.nav-links{gap:2px}}
"""
        html = html.replace("</style>", extra_css + "</style>", 1)

    with open(path, "w") as f:
        f.write(html)
    print(f"✓ {domain} — {len(pages)} subpages linked in nav")

for site_dir, cfg in SITES.items():
    fix_site(site_dir, cfg)

print("\nAll navs fixed!")
