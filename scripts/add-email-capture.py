#!/usr/bin/env python3
"""
Add email capture form to all affiliate site index.html files.
Also creates thanks.html in each site directory.
"""

import os
import re
import sys
from pathlib import Path

WORKSPACE = Path("/home/ubuntu/.openclaw/workspace")

# Directories to search
SITE_DIRS = [
    WORKSPACE / "affiliate-sites",
    WORKSPACE / "sites",
]

# Also check root workspace for domain-named dirs
ROOT_DOMAIN_PATTERN = re.compile(r'^[a-z0-9][a-z0-9\-]*\.(com|net|org|io|co)$')

ACCESS_KEY = "2a6ef7e0-b23f-4b0b-a2e4-5ca5b6a3e9d7"

EMAIL_CAPTURE_CSS = """
/* ===== EMAIL CAPTURE ===== */
.email-capture { background: #111827; border-top: 2px solid #f0a500; border-bottom: 2px solid #f0a500; padding: 48px 24px; text-align: center; margin: 40px 0; }
.email-capture h2 { color: #f0a500; font-size: 1.6em; margin-bottom: 12px; }
.email-capture p { color: #9ca3af; margin-bottom: 24px; max-width: 500px; margin-left: auto; margin-right: auto; }
.capture-form { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; max-width: 480px; margin: 0 auto; }
.capture-form input[type="email"] { flex: 1; min-width: 220px; padding: 12px 16px; border-radius: 6px; border: 1px solid #374151; background: #1f2937; color: #e0e0e0; font-size: 1em; }
.capture-form button { background: #f0a500; color: #000; font-weight: 700; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 1em; white-space: nowrap; }
.capture-form button:hover { background: #e09400; }
/* ========================= */
"""

EMAIL_CAPTURE_HTML_TEMPLATE = """
<!-- EMAIL CAPTURE -->
<section class="email-capture">
  <div class="container">
    <h2>📬 Get Our Top Picks Delivered</h2>
    <p>Join thousands of smart shoppers. We'll email our best finds, deals, and buying guides — no spam, ever.</p>
    <form class="capture-form" action="https://api.web3forms.com/submit" method="POST">
      <input type="hidden" name="access_key" value="{access_key}">
      <input type="hidden" name="subject" value="New Subscriber — {domain}">
      <input type="hidden" name="redirect" value="https://{domain}/thanks.html">
      <input type="email" name="email" placeholder="Enter your email address" required>
      <button type="submit">Get Top Picks →</button>
    </form>
  </div>
</section>
<!-- END EMAIL CAPTURE -->
"""

THANKS_HTML_TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Thanks! — {domain}</title>
<meta name="robots" content="noindex">
<style>
body {{ font-family: sans-serif; background: #0f0f0f; color: #e0e0e0; display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; }}
h1 {{ color: #f0a500; }}
a {{ color: #f0a500; }}
</style>
</head>
<body>
<h1>✅ You're in!</h1>
<p>Thanks for subscribing. We'll send our best picks straight to your inbox.</p>
<p><a href="/">← Back to the site</a></p>
</body>
</html>
"""


def get_domain_from_path(site_dir: Path) -> str:
    """Extract domain name from site directory path."""
    name = site_dir.name
    # Handle -com style dirs (e.g., airfilterforpets-com -> airfilterforpets.com)
    if name.endswith('-com'):
        name = name[:-4] + '.com'
    elif name.endswith('-net'):
        name = name[:-4] + '.net'
    elif name.endswith('-org'):
        name = name[:-4] + '.org'
    
    # Try to extract from CNAME file
    cname_file = site_dir / "CNAME"
    if cname_file.exists():
        try:
            domain = cname_file.read_text().strip()
            if domain:
                return domain
        except Exception:
            pass
    
    # Try to extract from canonical link in index.html
    index_file = site_dir / "index.html"
    if index_file.exists():
        try:
            content = index_file.read_text(errors='replace')
            # Look for canonical URL
            m = re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']https?://([^/"\']+)', content)
            if not m:
                m = re.search(r'href=["\']https?://([^/"\']+)["\'][^>]*rel=["\']canonical["\']', content)
            if m:
                return m.group(1).rstrip('/')
        except Exception:
            pass
    
    return name


def inject_css(content: str, css: str) -> str:
    """Inject CSS into <style> block or before </head>."""
    # Check if there's an existing <style> tag
    style_match = re.search(r'(<style[^>]*>)(.*?)(</style>)', content, re.DOTALL | re.IGNORECASE)
    if style_match:
        # Append to existing style block
        new_style = style_match.group(1) + style_match.group(2) + css + style_match.group(3)
        return content[:style_match.start()] + new_style + content[style_match.end():]
    
    # No style block - inject before </head>
    head_close = re.search(r'</head>', content, re.IGNORECASE)
    if head_close:
        insert_pos = head_close.start()
        return content[:insert_pos] + f'<style>{css}</style>\n' + content[insert_pos:]
    
    # Fallback: inject at beginning
    return f'<style>{css}</style>\n' + content


def inject_html(content: str, html: str) -> str:
    """Insert email capture section before </footer> or before </body>."""
    # Try before </footer>
    footer_match = re.search(r'</footer>', content, re.IGNORECASE)
    if footer_match:
        insert_pos = footer_match.start()
        return content[:insert_pos] + html + '\n' + content[insert_pos:]
    
    # Try before </body>
    body_match = re.search(r'</body>', content, re.IGNORECASE)
    if body_match:
        insert_pos = body_match.start()
        return content[:insert_pos] + html + '\n' + content[insert_pos:]
    
    # Fallback: append
    return content + html


def process_site(site_dir: Path, domain: str) -> dict:
    """Process a single site directory."""
    result = {
        "site": str(site_dir),
        "domain": domain,
        "status": None,
        "thanks_created": False,
        "error": None,
    }
    
    index_file = site_dir / "index.html"
    if not index_file.exists():
        result["status"] = "no-index"
        return result
    
    try:
        content = index_file.read_text(errors='replace')
    except Exception as e:
        result["status"] = "read-error"
        result["error"] = str(e)
        return result
    
    # Check if already has email capture
    if 'email-capture' in content or 'web3forms' in content.lower():
        result["status"] = "already-done"
        return result
    
    # Build the HTML snippet
    html_snippet = EMAIL_CAPTURE_HTML_TEMPLATE.format(
        access_key=ACCESS_KEY,
        domain=domain,
    )
    
    # Inject CSS
    new_content = inject_css(content, EMAIL_CAPTURE_CSS)
    # Inject HTML
    new_content = inject_html(new_content, html_snippet)
    
    # Write back
    try:
        index_file.write_text(new_content)
        result["status"] = "updated"
    except Exception as e:
        result["status"] = "write-error"
        result["error"] = str(e)
        return result
    
    # Create thanks.html
    thanks_file = site_dir / "thanks.html"
    try:
        thanks_file.write_text(THANKS_HTML_TEMPLATE.format(domain=domain))
        result["thanks_created"] = True
    except Exception as e:
        result["error"] = f"thanks.html error: {e}"
    
    return result


def collect_all_sites() -> list:
    """Collect all site directories to process."""
    sites = []
    seen = set()
    
    # From affiliate-sites/ and sites/ directories
    for parent_dir in SITE_DIRS:
        if not parent_dir.exists():
            print(f"WARNING: {parent_dir} does not exist")
            continue
        for item in sorted(parent_dir.iterdir()):
            if item.is_dir() and not item.name.startswith('_') and not item.name.startswith('.'):
                key = item.resolve()
                if key not in seen:
                    seen.add(key)
                    sites.append(item)
    
    # Root workspace domain directories
    for item in sorted(WORKSPACE.iterdir()):
        if item.is_dir() and ROOT_DOMAIN_PATTERN.match(item.name):
            key = item.resolve()
            if key not in seen:
                seen.add(key)
                sites.append(item)
    
    return sites


def main():
    print("=== Email Capture Addition Script ===\n")
    
    sites = collect_all_sites()
    print(f"Found {len(sites)} site directories\n")
    
    stats = {
        "updated": [],
        "already-done": [],
        "no-index": [],
        "errors": [],
        "skipped": [],
    }
    
    for site_dir in sites:
        domain = get_domain_from_path(site_dir)
        result = process_site(site_dir, domain)
        status = result["status"]
        
        if status == "updated":
            print(f"✅ Updated: {site_dir.name} ({domain})")
            stats["updated"].append(result)
        elif status == "already-done":
            print(f"⏭️  Already done: {site_dir.name}")
            stats["already-done"].append(result)
        elif status == "no-index":
            print(f"⚠️  No index.html: {site_dir.name}")
            stats["no-index"].append(result)
        else:
            print(f"❌ Error ({status}): {site_dir.name} — {result.get('error')}")
            stats["errors"].append(result)
    
    print(f"\n{'='*50}")
    print(f"SUMMARY")
    print(f"{'='*50}")
    print(f"Total sites found:    {len(sites)}")
    print(f"Updated:              {len(stats['updated'])}")
    print(f"Already had capture:  {len(stats['already-done'])}")
    print(f"No index.html:        {len(stats['no-index'])}")
    print(f"Errors:               {len(stats['errors'])}")
    
    if stats["no-index"]:
        print(f"\nNo index.html:")
        for r in stats["no-index"]:
            print(f"  - {r['site']}")
    
    if stats["errors"]:
        print(f"\nErrors:")
        for r in stats["errors"]:
            print(f"  - {r['site']}: {r['error']}")
    
    print(f"\nDone! {len(stats['updated'])} sites updated.")
    return stats


if __name__ == "__main__":
    main()
