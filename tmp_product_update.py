#!/usr/bin/env python3
import json, urllib.request, urllib.error, sys

TOKEN = "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"
BASE = "https://bartact.myshopify.com/admin/api/2023-10/products"
HEADERS = {
    "X-Shopify-Access-Token": TOKEN,
    "Content-Type": "application/json"
}

def get_product(pid):
    url = f"{BASE}/{pid}.json?fields=id,title,body_html"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())['product']

def put_product(pid, body_html):
    url = f"{BASE}/{pid}.json"
    data = json.dumps({"product": {"id": pid, "body_html": body_html}}).encode()
    req = urllib.request.Request(url, data=data, headers=HEADERS, method='PUT')
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())['product']

def extract_nav_blocks(html):
    """Extract all data-tier-nav and data-bench-link divs from the top of body_html"""
    import re
    # Find all top-level data-tier-nav and data-bench-link div blocks
    nav_blocks = []
    remaining = html
    
    # We'll parse greedily: find each opening div with those attributes
    patterns = ['data-tier-nav="1"', 'data-bench-link="1"']
    
    # Simple approach: find start of first div with our attribute, track depth to find end
    result_blocks = []
    pos = 0
    
    while pos < len(remaining):
        # Find next nav/bench div
        found_start = -1
        for pat in patterns:
            idx = remaining.find(pat, pos)
            if idx != -1:
                # Find the opening < before this attribute
                open_idx = remaining.rfind('<', 0, idx)
                if open_idx != -1 and (found_start == -1 or open_idx < found_start):
                    found_start = open_idx
        
        if found_start == -1:
            break
        
        # Check if there's non-whitespace content before this block
        pre_content = remaining[pos:found_start].strip()
        if pre_content and not all(c in ' \n\r\t' for c in pre_content):
            # There's real content before - stop extracting nav blocks
            break
        
        # Track depth to find end of this div
        depth = 0
        i = found_start
        while i < len(remaining):
            if remaining[i:i+4] == '<div':
                depth += 1
                i += 4
            elif remaining[i:i+6] == '</div>':
                depth -= 1
                i += 6
                if depth == 0:
                    result_blocks.append(remaining[found_start:i])
                    pos = i
                    break
            else:
                i += 1
        else:
            break
    
    nav_html = '\n'.join(result_blocks)
    rest = remaining[pos:].strip()
    return nav_html, rest

# Test extraction
if __name__ == '__main__':
    pid = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    if pid:
        p = get_product(pid)
        nav, rest = extract_nav_blocks(p['body_html'])
        print("=== NAV BLOCKS ===")
        print(nav[:500])
        print("=== REST (first 300) ===")
        print(rest[:300])
