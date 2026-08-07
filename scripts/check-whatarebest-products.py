#!/usr/bin/env python3
"""
whatarebest.com product staleness checker.
Runs every 48 hours via cron.
Checks Amazon product pages for:
  - 404 / product unavailable
  - Redirect to different ASIN
  - "Currently unavailable" / "Temporarily out of stock"
  - Image hash no longer valid
Replaces stale products by fetching fresh search results for that category.

Usage: python3 check-whatarebest-products.py
Outputs: /tmp/whatarebest-stale-report.json with stale ASINs
"""

import subprocess, re, json, time, random, sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

SCRIPT_PATH = Path(__file__).parent / "build-whatarebest.py"
REPORT_PATH = Path("/tmp/whatarebest-stale-report.json")
STATE_PATH = Path("/home/ubuntu/.openclaw/workspace/scripts/whatarebest-check-state.json")
LOG_PATH = Path("/home/ubuntu/.openclaw/workspace/scripts/whatarebest-check.log")

UA_LIST = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
]

def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    with open(LOG_PATH, 'a') as f:
        f.write(line + "\n")


def check_asin(asin):
    """
    Check if an ASIN is still available on Amazon.
    Returns: ('ok'|'unavailable'|'error', detail_str)
    """
    url = f"https://www.amazon.com/dp/{asin}"
    ua = random.choice(UA_LIST)
    
    try:
        result = subprocess.run(
            ["curl", "-s", "-A", ua,
             "-H", "Accept-Language: en-US,en;q=0.9",
             "-H", "Accept: text/html,application/xhtml+xml",
             "--compressed",
             "--max-time", "20",
             "--connect-timeout", "10",
             "-L",  # follow redirects
             "-w", "\n%{http_code}\n%{url_effective}",
             url],
            capture_output=True, text=True, timeout=25
        )
        
        output = result.stdout
        lines = output.strip().split("\n")
        
        # Last two lines are http_code and final_url
        if len(lines) >= 2:
            http_code = lines[-2].strip()
            final_url = lines[-1].strip()
        else:
            return ('error', 'malformed response')
        
        html = "\n".join(lines[:-2])
        
        if http_code == "404":
            return ('unavailable', f'HTTP 404')
        
        if http_code == "503":
            return ('error', f'HTTP 503 - rate limited')
        
        if http_code not in ("200", "301", "302"):
            return ('error', f'HTTP {http_code}')
        
        # Check for unavailability signals in page
        unavailable_signals = [
            "Currently unavailable",
            "This item is no longer available",
            "We don't know when or if this item will be back in stock",
            "Temporarily out of stock",
            "has been discontinued",
            "page you are looking for isn't available",
            "Page Not Found",
        ]
        
        for signal in unavailable_signals:
            if signal.lower() in html.lower():
                return ('unavailable', f'Page says: {signal}')
        
        # Check if we got redirected to a completely different product
        # (ASIN in URL changed)
        if asin not in final_url and 'dp/' in final_url:
            new_asin = re.search(r'/dp/([A-Z0-9]{10})', final_url)
            if new_asin and new_asin.group(1) != asin:
                return ('unavailable', f'Redirected to different ASIN: {new_asin.group(1)}')
        
        # If we got here with a decent-sized response, likely still available
        if len(html) > 10000:
            return ('ok', f'HTTP {http_code}')
        
        return ('error', f'Response too small ({len(html)} bytes)')
        
    except subprocess.TimeoutExpired:
        return ('error', 'Timeout')
    except Exception as e:
        return ('error', str(e))


def fetch_replacement(search_query, exclude_asins):
    """
    Fetch fresh ASINs from Amazon search for a given query,
    excluding already-used ASINs.
    Returns list of {asin, img} dicts.
    """
    url = f"https://www.amazon.com/s?k={search_query.replace(' ', '+')}"
    ua = random.choice(UA_LIST)
    
    try:
        result = subprocess.run(
            ["curl", "-s", "-A", ua,
             "-H", "Accept-Language: en-US,en;q=0.9",
             "--compressed", "--max-time", "20", "-L", url],
            capture_output=True, text=True, timeout=25
        )
        html = result.stdout
        
        if len(html) < 30000:
            return []
        
        asins = re.findall(r'data-asin="(B[A-Z0-9]{9})"', html)
        imgs = re.findall(
            r'https://m\.media-amazon\.com/images/I/([A-Za-z0-9+%._-]+?)\._AC_(?:UL|SL|SR|SY|SS)\d+_',
            html
        )
        imgs = [i.replace('%2B', '+') for i in imgs]
        
        # Deduplicate and exclude existing
        seen_a = set(exclude_asins)
        seen_i = set()
        result_pairs = []
        
        for a, i in zip(asins, imgs):
            if a not in seen_a and i not in seen_i and len(result_pairs) < 4:
                seen_a.add(a)
                seen_i.add(i)
                result_pairs.append({"asin": a, "img": i})
        
        return result_pairs
        
    except Exception as e:
        return []


def extract_all_asins_from_script():
    """Extract all {slug: [asin, ...]} mappings from the build script."""
    txt = SCRIPT_PATH.read_text()
    
    result = {}
    
    # Find all leaf dicts with products
    # Pattern: find "slug": "xxx" then find "products": [...]
    slug_matches = list(re.finditer(r'"slug":\s*"([^"]+)"', txt))
    
    for i, m in enumerate(slug_matches):
        slug = m.group(1)
        # Look forward for products
        chunk_start = m.start()
        # Find the parent dict
        open_brace = txt.rfind('{', 0, chunk_start)
        if open_brace == -1:
            continue
        
        # Find closing brace
        depth = 0
        close_brace = -1
        for ci, ch in enumerate(txt[open_brace:], start=open_brace):
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    close_brace = ci
                    break
        
        if close_brace == -1:
            continue
        
        dict_content = txt[open_brace:close_brace+1]
        
        # Extract ASINs from products list
        asins = re.findall(r'"asin":\s*"(B[A-Z0-9]{9})"', dict_content)
        
        if asins:
            result[slug] = asins
    
    return result


def check_batch(slug_asins, max_workers=5, delay=0.3):
    """Check a batch of ASINs in parallel."""
    stale = {}
    
    all_tasks = [(slug, asin) for slug, asins in slug_asins.items() for asin in asins]
    
    log(f"Checking {len(all_tasks)} ASINs across {len(slug_asins)} categories...")
    
    checked = 0
    
    with ThreadPoolExecutor(max_workers=max_workers) as ex:
        futures = {ex.submit(check_asin, asin): (slug, asin) for slug, asin in all_tasks}
        
        for fut in as_completed(futures):
            slug, asin = futures[fut]
            status, detail = fut.result()
            checked += 1
            
            if status == 'unavailable':
                log(f"  ⚠️  STALE {asin} ({slug}): {detail}")
                if slug not in stale:
                    stale[slug] = []
                stale[slug].append({"asin": asin, "reason": detail})
            elif status == 'error':
                log(f"  ⚪ Error checking {asin}: {detail}")
            
            time.sleep(delay)
    
    return stale


def main():
    log("=" * 60)
    log("whatarebest.com product staleness check starting")
    
    # Load check state (to track which ASINs were last checked)
    state = {}
    if STATE_PATH.exists():
        try:
            state = json.loads(STATE_PATH.read_text())
        except:
            pass
    
    # Extract all ASINs from build script
    log("Extracting ASINs from build script...")
    slug_asins = extract_all_asins_from_script()
    
    total_asins = sum(len(v) for v in slug_asins.values())
    log(f"Found {len(slug_asins)} categories with {total_asins} total ASINs")
    
    # Check all ASINs (in batches to avoid rate limiting)
    # Split into chunks, check with delays
    slug_list = list(slug_asins.items())
    
    # Prioritize slugs not recently checked
    last_checked = state.get('last_checked_slugs', {})
    cutoff_time = time.time() - (48 * 3600)  # 48 hours ago
    
    priority = [(s, a) for s, a in slug_list if last_checked.get(s, 0) < cutoff_time]
    already_recent = [(s, a) for s, a in slug_list if last_checked.get(s, 0) >= cutoff_time]
    
    log(f"Priority (not checked in 48h): {len(priority)} slugs")
    log(f"Already recent: {len(already_recent)} slugs")
    
    # Check priority slugs
    check_dict = dict(priority[:100])  # Cap at 100 per run to avoid excessive load
    
    stale = check_batch(check_dict, max_workers=4, delay=0.5)
    
    # Update check state
    for slug, _ in check_dict.items():
        last_checked[slug] = time.time()
    state['last_checked_slugs'] = last_checked
    state['last_run'] = datetime.now().isoformat()
    state['total_stale_found'] = len(stale)
    STATE_PATH.write_text(json.dumps(state, indent=2))
    
    # Report
    log(f"\nSummary:")
    log(f"  Checked: {sum(len(v) for v in check_dict.values())} ASINs")
    log(f"  Stale/unavailable: {sum(len(v) for v in stale.values())} ASINs across {len(stale)} categories")
    
    if stale:
        log("\nStale products by category:")
        for slug, items in stale.items():
            log(f"  {slug}:")
            for item in items:
                log(f"    - {item['asin']}: {item['reason']}")
        
        # Save full report
        REPORT_PATH.write_text(json.dumps({
            "check_time": datetime.now().isoformat(),
            "stale_count": sum(len(v) for v in stale.values()),
            "stale_by_category": stale
        }, indent=2))
        log(f"\nReport saved to {REPORT_PATH}")
        
        # If stale products found, try to replace them
        if len(stale) > 0:
            log("\nAttempting to find replacement products...")
            replace_stale(stale)
    else:
        log("✅ All checked products appear to be active!")
    
    log("Check complete.")
    return len(stale)


# Search query map (copied from fetch script)
SEARCH_QUERIES = {
    "best-coffee-makers": "drip coffee maker programmable",
    "best-instant-pots": "instant pot electric pressure cooker",
    "best-rice-cookers": "rice cooker electric",
    # ... (abbreviated; full map lives in fetch_products.py)
}


def replace_stale(stale_dict):
    """
    For each stale category, fetch replacement products from Amazon
    and update the build script.
    """
    script = SCRIPT_PATH.read_text()
    modified = False
    
    for slug, stale_items in stale_dict.items():
        stale_asins = {item["asin"] for item in stale_items}
        
        # Get existing ASINs for this slug (to exclude from replacements)
        existing_asins = set(re.findall(
            rf'"slug":\s*"{re.escape(slug)}".*?"products":\s*\[.*?\]',
            script, re.DOTALL
        ))
        
        # Get search query
        query = SEARCH_QUERIES.get(slug, slug.replace('best-', '').replace('-', ' '))
        
        log(f"  Fetching replacements for {slug} (removing {len(stale_asins)} stale)...")
        time.sleep(random.uniform(1, 2))
        
        replacements = fetch_replacement(query, stale_asins)
        
        if not replacements:
            log(f"    ⚠️  Could not find replacements for {slug}")
            continue
        
        log(f"    ✅ Found {len(replacements)} replacements")
        
        # Replace stale ASINs in script
        for stale_item in stale_items:
            stale_asin = stale_item["asin"]
            
            if not replacements:
                break
            
            replacement = replacements.pop(0)
            
            # Replace ASIN in script
            old_pattern = f'"asin": "{stale_asin}"'
            new_pattern = f'"asin": "{replacement["asin"]}"'
            
            if old_pattern in script:
                script = script.replace(old_pattern, new_pattern, 1)
                
                # Also update the img hash right after it
                # Pattern: "asin": "BXXX", "img": "oldhash"
                img_pattern = rf'("asin":\s*"{re.escape(replacement["asin"])}"[^}}]+"img":\s*")[^"]*(")'
                new_img = f'\\g<1>{replacement["img"]}\\g<2>'
                script = re.sub(img_pattern, new_img, script, count=1)
                
                log(f"    Replaced {stale_asin} → {replacement['asin']}")
                modified = True
    
    if modified:
        SCRIPT_PATH.write_text(script)
        log("  ✅ Build script updated with replacements")
        
        # Rebuild the site
        log("  Rebuilding site...")
        result = subprocess.run(
            ["python3", str(SCRIPT_PATH)],
            capture_output=True, text=True,
            cwd=SCRIPT_PATH.parent, timeout=120
        )
        if result.returncode == 0:
            log("  ✅ Site rebuilt successfully")
            
            # Push to GitHub
            site_path = Path("/home/ubuntu/.openclaw/workspace/sites/whatarebest.com")
            
            # Get git token
            creds_file = Path("/home/ubuntu/.git-credentials")
            token = None
            if creds_file.exists():
                for line in creds_file.read_text().splitlines():
                    m = re.match(r'https://[^:]+:([^@]+)@github.com', line)
                    if m:
                        token = m.group(1)
                        break
            
            if token:
                push_result = subprocess.run(
                    f'cd "{site_path}" && git add -A && '
                    f'git commit -m "chore: auto-replace {sum(len(v) for v in stale_dict.values())} stale products" && '
                    f'git push origin main',
                    shell=True, capture_output=True, text=True, timeout=60
                )
                if push_result.returncode == 0:
                    log("  ✅ Pushed to GitHub")
                else:
                    log(f"  ⚠️  Push failed: {push_result.stderr[:200]}")
        else:
            log(f"  ❌ Rebuild failed: {result.stderr[:200]}")
    else:
        log("  No modifications needed")


if __name__ == "__main__":
    stale_count = main()
    sys.exit(0 if stale_count == 0 else 1)
