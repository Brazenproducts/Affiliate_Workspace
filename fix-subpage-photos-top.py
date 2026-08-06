#!/usr/bin/env python3
"""Inject a 3-photo grid immediately after the hero section on all subpages
that are missing photos at the top."""

import os, re

BASE = "/home/ubuntu/.openclaw/workspace/elipacko-sites"
CDN = "https://brazenproducts.github.io/elipacko-assets"

def photo_grid(imgs):
    """Build a 3-col photo grid HTML block."""
    items = "".join(
        f'<img src="{url}" alt="{alt}" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0" loading="lazy">'
        for url, alt in imgs
    )
    return (
        f'<section style="background:#fff;padding:24px 5% 8px">'
        f'<div style="max-width:1100px;margin:0 auto">'
        f'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">{items}</div>'
        f'</div></section>'
    )

# Photos per site category
PHOTOS = {
    # corrugated plastic / general PP boxes — use numbered produce box photos
    "corrugatedplasticboxes": [
        (f"{CDN}/42.jpg", "PP corrugated box lemon — Elipacko"),
        (f"{CDN}/86.jpg", "PP corrugated ventilated box — Elipacko"),
        (f"{CDN}/39.jpg", "PP corrugated mango box — Elipacko"),
    ],
    "ppcorrugatedboxes": [
        (f"{CDN}/42.jpg", "PP corrugated box — Elipacko"),
        (f"{CDN}/29.jpg", "PP corrugated orange box — Elipacko"),
        (f"{CDN}/86.jpg", "PP corrugated broccoli box — Elipacko"),
    ],
    "corrugatedplasticusa": [
        (f"{CDN}/42.jpg", "PP corrugated box USA — Elipacko"),
        (f"{CDN}/86.jpg", "PP corrugated ventilated — Elipacko"),
        (f"{CDN}/packing-box-img_2296.jpg", "PP corrugated packing box — Elipacko"),
    ],
    "corrugatedslipsheet": [
        (f"{CDN}/packing-box-img_2296.jpg", "PP corrugated slip sheet box — Elipacko"),
        (f"{CDN}/packing-box-sdc10126.jpg", "PP corrugated open box — Elipacko"),
        (f"{CDN}/42.jpg", "PP corrugated box — Elipacko"),
    ],
    "corrugatedslipsheets": [
        (f"{CDN}/packing-box-img_2296.jpg", "PP corrugated slip sheets — Elipacko"),
        (f"{CDN}/packing-box-sdc10126.jpg", "PP corrugated box — Elipacko"),
        (f"{CDN}/86.jpg", "PP corrugated ventilated box — Elipacko"),
    ],
    "corrugatesheet": [
        (f"{CDN}/packing-box-img_2296.jpg", "PP corrugated sheet box — Elipacko"),
        (f"{CDN}/packing-box-sdc10126.jpg", "PP corrugated sheet — Elipacko"),
        (f"{CDN}/42.jpg", "PP corrugated produce box — Elipacko"),
    ],
    "customplasticcorrugate": [
        (f"{CDN}/42.jpg", "Custom PP corrugated box — Elipacko"),
        (f"{CDN}/packing-box-img_2296.jpg", "Custom PP corrugated packing box — Elipacko"),
        (f"{CDN}/86.jpg", "Custom PP corrugated ventilated box — Elipacko"),
    ],
    "plasticcorrugatedbox": [
        (f"{CDN}/42.jpg", "Plastic corrugated box PP — Elipacko"),
        (f"{CDN}/86.jpg", "Plastic corrugated ventilated box — Elipacko"),
        (f"{CDN}/packing-box-sdc10126.jpg", "Plastic corrugated open box — Elipacko"),
    ],
    "polypropylenebox": [
        (f"{CDN}/42.jpg", "Polypropylene PP box — Elipacko"),
        (f"{CDN}/39.jpg", "PP polypropylene mango box — Elipacko"),
        (f"{CDN}/86.jpg", "PP polypropylene ventilated box — Elipacko"),
    ],
    "polypropylenecontainer": [
        (f"{CDN}/84.jpg", "PP polypropylene container — Elipacko"),
        (f"{CDN}/85.jpg", "PP polypropylene container produce — Elipacko"),
        (f"{CDN}/42.jpg", "PP polypropylene box container — Elipacko"),
    ],
    "ppcontainers": [
        (f"{CDN}/84.jpg", "PP container wholesale — Elipacko"),
        (f"{CDN}/85.jpg", "PP container produce — Elipacko"),
        (f"{CDN}/42.jpg", "PP corrugated container — Elipacko"),
    ],
    "ppcorrugate": [
        (f"{CDN}/42.jpg", "PP corrugate box — Elipacko"),
        (f"{CDN}/86.jpg", "PP corrugate ventilated box — Elipacko"),
        (f"{CDN}/packing-box-img_2296.jpg", "PP corrugate packing box — Elipacko"),
    ],
    "ppcorrugatebox": [
        (f"{CDN}/42.jpg", "PP corrugate box lemon — Elipacko"),
        (f"{CDN}/28.jpg", "PP corrugate corn box — Elipacko"),
        (f"{CDN}/86.jpg", "PP corrugate broccoli box — Elipacko"),
    ],
}

# Hero section end markers to inject after
HERO_END_MARKERS = [
    '</section>\n\n<section',   # standard gap
    '</section>\n<section',     # no gap
    'Get a Quote from Elipacko →</a>\n  </div>\n</section>',
    'Get a Quote →</a>\n  </div>\n</section>',
    'Get a Quote</a>\n  </div>\n</section>',
    'Request a Quote →</a>\n</div>\n</section>',
    # fallback: first </section> after <body>
]

fixed = 0
skipped = 0

for site_name, imgs in PHOTOS.items():
    site_path = os.path.join(BASE, site_name)
    if not os.path.isdir(site_path):
        print(f"SKIP (not found): {site_name}")
        continue

    grid = photo_grid(imgs)

    # Walk all subpages
    for entry in os.listdir(site_path):
        sub_path = os.path.join(site_path, entry)
        if not os.path.isdir(sub_path) or entry.startswith('.'):
            continue
        html_path = os.path.join(sub_path, "index.html")
        if not os.path.exists(html_path):
            continue

        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Skip if already has a photo grid near top (within first 4000 chars)
        top_chunk = content[:4000]
        if 'elipacko-assets' in top_chunk and 'img src' in top_chunk:
            skipped += 1
            continue

        # Find the end of the hero section and inject after it
        injected = False

        # Strategy: find the CTA button line + closing </section> that ends the hero
        # Pattern: the gradient hero section always ends with </section> before the first content section
        # Find position of first </section> after the <body> tag
        body_pos = content.find('<body>')
        if body_pos == -1:
            body_pos = 0

        # Find the hero section end — look for the gradient section close
        hero_pattern = re.compile(
            r'((?:Get a Quote|Request a Quote|Get Quote)[^<]*</a>\s*</div>\s*</section>)',
            re.DOTALL
        )
        m = hero_pattern.search(content, body_pos)
        if m:
            insert_at = m.end()
            content = content[:insert_at] + '\n' + grid + '\n' + content[insert_at:]
            injected = True

        if not injected:
            # Fallback: inject after the first </section> past <body>
            first_section_end = content.find('</section>', body_pos)
            if first_section_end != -1:
                insert_at = first_section_end + len('</section>')
                content = content[:insert_at] + '\n' + grid + '\n' + content[insert_at:]
                injected = True

        if injected:
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed += 1
            print(f"  ✓ {site_name}/{entry}")
        else:
            print(f"  ✗ FAILED: {site_name}/{entry}")

print(f"\nDone: {fixed} fixed, {skipped} already had top photos")
