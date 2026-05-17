#!/usr/bin/env python3
"""
Bartact product description rewrite script.
Works product by product: GET -> build HTML -> PUT -> verify GET
"""
import json, urllib.request, sys, time

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
    """Extract all data-tier-nav and data-bench-link top-level divs."""
    patterns = ['data-tier-nav="1"', 'data-bench-link="1"']
    result_blocks = []
    pos = 0

    while pos < len(html):
        found_start = -1
        for pat in patterns:
            idx = html.find(pat, pos)
            if idx != -1:
                open_idx = html.rfind('<', 0, idx)
                if open_idx != -1 and (found_start == -1 or open_idx < found_start):
                    found_start = open_idx

        if found_start == -1:
            break

        pre_content = html[pos:found_start].strip()
        if pre_content:
            break

        depth = 0
        i = found_start
        while i < len(html):
            if html[i:i+4] == '<div':
                depth += 1
                i += 4
            elif html[i:i+6] == '</div>':
                depth -= 1
                i += 6
                if depth == 0:
                    result_blocks.append(html[found_start:i])
                    pos = i
                    break
            else:
                i += 1
        else:
            break

    return '\n'.join(result_blocks)

