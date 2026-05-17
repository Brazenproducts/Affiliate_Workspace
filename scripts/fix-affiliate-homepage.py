#!/usr/bin/env python3
"""Remove 'Shop at Bartact' buttons from affiliate site homepages.
Keeps editorial Bartact mentions in body text, only removes CTA buttons."""
import re, sys, json, base64, os
import urllib.request

GH_TOKEN = os.environ.get('GH_TOKEN', '')

def gh_get(path):
    req = urllib.request.Request(
        f'https://api.github.com{path}',
        headers={'Authorization': f'token {GH_TOKEN}', 'Accept': 'application/vnd.github+json'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def gh_put(path, data):
    req = urllib.request.Request(
        f'https://api.github.com{path}',
        data=json.dumps(data).encode(),
        headers={'Authorization': f'token {GH_TOKEN}', 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json'},
        method='PUT')
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def fix_homepage(html):
    fixes = 0
    # Remove "Shop at Bartact" CTA buttons
    pattern = r'<a class="buy-btn buy-btn-primary"[^>]*href="https://bartact\.com/[^"]*"[^>]*>\s*Shop at Bartact\s*→?\s*</a>'
    new_html = re.sub(pattern, '', html)
    fixes = len(re.findall(pattern, html))
    
    # Replace "See <Vehicle> Picks →" with "See Our Picks →" for cleaner copy
    new_html = re.sub(r'See [A-Z][a-zA-Z0-9]+ Picks →', 'See Our Picks →', new_html)
    
    return new_html, fixes

repo = sys.argv[1]
file_data = gh_get(f'/repos/Brazenproducts/{repo}/contents/index.html')
sha = file_data['sha']
content = base64.b64decode(file_data['content']).decode('utf-8')
new_content, fixes = fix_homepage(content)
if fixes == 0:
    print(f"{repo}: nothing to fix on homepage")
else:
    encoded = base64.b64encode(new_content.encode('utf-8')).decode('ascii')
    gh_put(f'/repos/Brazenproducts/{repo}/contents/index.html', {
        'message': f'Remove Shop at Bartact CTAs from homepage - keep neutral review feel',
        'content': encoded,
        'sha': sha
    })
    print(f"{repo}: {fixes} fixes pushed")
