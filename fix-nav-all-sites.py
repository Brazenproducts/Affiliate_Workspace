#!/usr/bin/env python3
"""Fix nav across all affiliate sites:
1. Remove /.git/ from nav links  
2. Replace the entire <nav> block with a clean consistent one
"""

import os
import re

SITES_DIR = '/home/ubuntu/.openclaw/workspace/elipacko-sites'

SITES = {
    'meatlugs':               ('meatlugs.com',               '#7f1d1d'),
    'plasticgaylord':         ('plasticgaylord.com',          '#1a3a5c'),
    'plasticgaylordbox':      ('plasticgaylordbox.com',       '#1a3a5c'),
    'plasticgaylordboxes':    ('plasticgaylordboxes.com',     '#1a3a5c'),
    'gaylordboxesplastic':    ('gaylordboxesplastic.com',     '#1a3a5c'),
    'heavydutypallets':       ('heavydutypallets.com',        '#1a3a2a'),
    'heavydutyplasticpallets':('heavydutyplasticpallets.com', '#1a3a2a'),
    'poultrycrates':          ('poultrycrates.com',           '#5c3a00'),
    'poultryboxes':           ('poultryboxes.com',            '#5c3a00'),
    'poultryshippingboxes':   ('poultryshippingboxes.com',    '#5c3a00'),
    'producecrates':          ('producecrates.com',           '#1a4a1a'),
    'vegetablecrates':        ('vegetablecrates.com',         '#1a4a1a'),
    'cardboardproduceboxes':  ('cardboardproduceboxes.com',   '#1a4a1a'),
    'waxproduceboxes':        ('waxproduceboxes.com',         '#1a4a1a'),
    'reusableshippingboxes':  ('reusableshippingboxes.com',   '#1a2a4a'),
}

def slug_to_label(slug):
    special = {'faq': 'FAQ', 'haccp-color-coded-lugs': 'HACCP Color-Coded Lugs'}
    if slug in special:
        return special[slug]
    return ' '.join(w.capitalize() for w in slug.replace('-', ' ').split())

def get_subpages(site_dir):
    """Get subpage slugs, excluding .git and other hidden/non-page dirs."""
    pages = []
    for entry in sorted(os.listdir(site_dir)):
        if entry.startswith('.') or entry.startswith('_'):
            continue
        full = os.path.join(site_dir, entry)
        if os.path.isdir(full) and os.path.exists(os.path.join(full, 'index.html')):
            pages.append(entry)
    # Put faq last
    if 'faq' in pages:
        pages.remove('faq')
        pages.append('faq')
    return pages

def build_nav(domain, color, pages, active_slug=None):
    links = ['<a href="/">Home</a>']
    for page in pages:
        label = slug_to_label(page)
        active_style = ' style="background:rgba(255,255,255,.2)"' if page == active_slug else ''
        links.append(f'<a href="/{page}/"{active_style}>{label}</a>')
    links.append(
        f'<a href="https://elipacko.com" target="_blank" rel="noopener" '
        f'style="background:#fff;color:{color};padding:7px 16px;border-radius:6px;'
        f'font-weight:700;font-size:.85rem">Get a Quote</a>'
    )
    return (
        f'<nav style="background:{color};padding:12px 5%;display:flex;align-items:center;'
        f'justify-content:space-between;flex-wrap:wrap;gap:8px;position:sticky;top:0;z-index:100">'
        f'<a href="/" style="color:#fff;font-weight:800;font-size:1.05rem;text-decoration:none">{domain}</a>'
        f'<div style="display:flex;flex-wrap:wrap;gap:3px;align-items:center">'
        + ''.join(
            f'<a href="{("/" + p + "/") if p != "home" else "/"}" '
            f'style="color:rgba(255,255,255,.85);padding:5px 9px;font-size:.78rem;font-weight:500;'
            f'border-radius:4px;white-space:nowrap'
            + (';background:rgba(255,255,255,.2)' if p == active_slug else '')
            + f'">{slug_to_label(p)}</a>'
            for p in pages
        )
        + f'<a href="https://elipacko.com" target="_blank" rel="noopener" '
        f'style="background:#fff;color:{color};padding:7px 16px;border-radius:6px;'
        f'font-weight:700;font-size:.85rem;margin-left:4px">Get a Quote</a>'
        f'</div></nav>'
    )

def fix_file(filepath, domain, color, pages, active_slug=None):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content

    # Replace the entire <nav>...</nav> block with our clean inline-styled version
    new_nav = build_nav(domain, color, pages, active_slug)
    content = re.sub(r'<nav\b[^>]*>.*?</nav>', new_nav, content, flags=re.DOTALL)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

total_fixed = 0

for site_name, (domain, color) in SITES.items():
    site_dir = os.path.join(SITES_DIR, site_name)
    if not os.path.isdir(site_dir):
        print(f'SKIP {site_name} — dir missing')
        continue

    pages = get_subpages(site_dir)
    print(f'\n{site_name}: {pages}')

    # Fix homepage
    hp = os.path.join(site_dir, 'index.html')
    if os.path.exists(hp):
        changed = fix_file(hp, domain, color, pages, active_slug=None)
        print(f'  index.html {"✓ fixed" if changed else "— no change"}')
        if changed: total_fixed += 1

    # Fix each subpage
    for page in pages:
        fp = os.path.join(site_dir, page, 'index.html')
        if os.path.exists(fp):
            changed = fix_file(fp, domain, color, pages, active_slug=page)
            print(f'  {page}/ {"✓ fixed" if changed else "— no change"}')
            if changed: total_fixed += 1

print(f'\n✅ Done. {total_fixed} files updated.')
