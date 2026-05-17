#!/usr/bin/env python3
"""
Fix affiliate site review pages where every product card has "Shop at Bartact"
button - even non-Bartact products.

Rule: Only product cards where the product NAME starts with "Bartact" should have
the "Shop at Bartact" button. All others should have:
  - Amazon affiliate search link instead, OR
  - Just removed if no alternative
"""
import re
import sys
import json
import base64
import urllib.request
import urllib.parse
import os

GH_TOKEN = os.environ.get('GH_TOKEN', '')
AMAZON_TAG = 'brazenprodu01-20'

def gh_get(path):
    req = urllib.request.Request(
        f'https://api.github.com{path}',
        headers={'Authorization': f'token {GH_TOKEN}', 'Accept': 'application/vnd.github+json'}
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def gh_put(path, data):
    req = urllib.request.Request(
        f'https://api.github.com{path}',
        data=json.dumps(data).encode(),
        headers={'Authorization': f'token {GH_TOKEN}', 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json'},
        method='PUT'
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def fix_html(html, page_title=''):
    """
    Find product cards (h2 followed by content with a 'Shop at Bartact' button).
    For each card, check if the product is a Bartact product.
    If not Bartact, replace 'Shop at Bartact' button with Amazon affiliate search link.
    """
    fixes = 0
    
    # Pattern: find each product card section. They start with <h2>1. ProductName ...</h2>
    # We'll look for <h2>NUMBER. PRODUCT NAME ...</h2> patterns
    
    # Split content by product cards (h2 with number prefix) - careful regex
    # A product card spans from one numbered h2 to the next numbered h2 (or end)
    
    parts = re.split(r'(<h2[^>]*>\s*\d+\.\s*[^<]+</h2>)', html)
    
    new_parts = []
    for i, part in enumerate(parts):
        # Check if this is a product card heading
        h2_match = re.match(r'<h2[^>]*>\s*\d+\.\s*([^<]+?)\s*</h2>', part)
        if h2_match:
            product_name = h2_match.group(1).strip()
            new_parts.append(part)
            # Next part is the card body - check if it's a Bartact product
            is_bartact = product_name.lower().startswith('bartact')
            
            if i+1 < len(parts):
                body = parts[i+1]
                # If NOT a Bartact product but has Shop at Bartact button, fix it
                if not is_bartact:
                    # Find and replace "Shop at Bartact" buttons
                    bartact_btn_pattern = r'<a class="buy-btn buy-btn-primary"[^>]*href="https://bartact\.com/[^"]*"[^>]*>\s*Shop at Bartact\s*→?\s*</a>'
                    if re.search(bartact_btn_pattern, body):
                        # Build Amazon search URL using product name
                        search_query = urllib.parse.quote_plus(product_name + ' seat cover')
                        amazon_url = f'https://www.amazon.com/s?k={search_query}&tag={AMAZON_TAG}'
                        replacement = f'<a class="buy-btn buy-btn-amazon" href="{amazon_url}" rel="nofollow noopener" target="_blank">Search on Amazon →</a>'
                        body = re.sub(bartact_btn_pattern, replacement, body)
                        fixes += 1
                # Also check for any "View Details" or "Check Price at Bartact" type buttons that link to wrong Bartact URLs
                # Those should be removed for non-Bartact products too
                if not is_bartact:
                    other_bartact_link = r'<a[^>]*href="https://bartact\.com/[^"]*"[^>]*>(?:[^<]|<(?!/a>))*?</a>'
                    # Be careful - only remove buy-btn / CTA-style links, not editorial mentions
                    pass  # Skip for now to avoid over-fixing
                parts[i+1] = body
        else:
            new_parts.append(part)
    
    new_html = ''.join(new_parts)
    return new_html, fixes


def fix_repo_file(repo, filename):
    """Fix a single file in a repo. Returns (success, fixes_count)."""
    try:
        # Get file
        file_data = gh_get(f'/repos/Brazenproducts/{repo}/contents/{filename}')
        sha = file_data['sha']
        content = base64.b64decode(file_data['content']).decode('utf-8')
        
        # Apply fix
        new_content, fixes = fix_html(content, filename)
        
        if fixes == 0:
            return (True, 0)
        
        # Push
        encoded = base64.b64encode(new_content.encode('utf-8')).decode('ascii')
        gh_put(f'/repos/Brazenproducts/{repo}/contents/{filename}', {
            'message': f'Fix non-Bartact products having Shop at Bartact button on {filename}',
            'content': encoded,
            'sha': sha
        })
        return (True, fixes)
    except Exception as e:
        return (False, str(e))


if __name__ == '__main__':
    repo = sys.argv[1] if len(sys.argv) > 1 else 'bestseatcover.com'
    
    # List HTML files
    files = gh_get(f'/repos/Brazenproducts/{repo}/contents/')
    html_files = [f['name'] for f in files if f['name'].endswith('.html') and f['name'] != 'index.html' and f['name'] != 'about.html' and f['name'] != 'contact.html' and f['name'] != 'buyers-guide.html']
    
    print(f"Repo: {repo} - {len(html_files)} review pages to check")
    
    total_fixes = 0
    for fname in html_files:
        ok, result = fix_repo_file(repo, fname)
        if ok:
            if result > 0:
                print(f"  ✅ {fname}: {result} fixes")
                total_fixes += result
            else:
                print(f"  ⏭️  {fname}: nothing to fix")
        else:
            print(f"  ❌ {fname}: {result}")
    
    print(f"\nTotal fixes: {total_fixes}")
