#!/usr/bin/env python3
"""Replace all elipacko.com/subpage/ links with elipacko.com/ homepage temporarily.
Run again with restore=True when elipacko-usa.com is live."""

import os
import re

SITES_DIR = '/home/ubuntu/.openclaw/workspace/elipacko-sites'

# All subpage links that are currently 404s on elipacko.com
# Replace these with the homepage
SUBPAGE_PATTERN = re.compile(
    r'https://elipacko\.com/(agriculture-packaging|pp-gaylord-boxes|pp-poultry-boxes|pp-pallets|pp-corrugated-boxes|pp-corrugated-sheets|pp-containers|pp-meat-lugs)/'
)
REPLACEMENT = 'https://elipacko.com/'

changed_files = 0
changed_instances = 0

for site in sorted(os.listdir(SITES_DIR)):
    site_path = os.path.join(SITES_DIR, site)
    if not os.path.isdir(site_path) or site.startswith('.'):
        continue
    for root, dirs, files in os.walk(site_path):
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        for fname in files:
            if not fname.endswith('.html'):
                continue
            fpath = os.path.join(root, fname)
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read()
            new_content, count = SUBPAGE_PATTERN.subn(REPLACEMENT, content)
            if count > 0:
                with open(fpath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                changed_files += 1
                changed_instances += count
                rel = os.path.relpath(fpath, SITES_DIR)
                print(f'  {count:3d} links fixed: {rel}')

print(f'\nTotal: {changed_instances} links updated across {changed_files} files')
