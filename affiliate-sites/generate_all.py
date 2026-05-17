#!/usr/bin/env python3
"""Generate all 3 affiliate sites."""
import os

BASE = "/home/ubuntu/.openclaw/workspace/affiliate-sites"

def write_file(site, filename, content):
    path = os.path.join(BASE, site, filename)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f"  wrote {path} ({len(content)} bytes)")

# Will call site generators
print("Generator script created. Running site builders...")
