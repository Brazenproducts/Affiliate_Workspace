#!/usr/bin/env python3
"""
fix-seo-titles.py
Fixes SEO title tags across all 28 elipacko affiliate sites + elipacko-usa.com.

Rules (SEO Playbook):
- Keyword FIRST, brand LAST, max 65 chars
- Pattern: [Keyword — Differentiator] | [Brand/Site]
- If title is under 65 chars, leave it alone
- If title > 65 chars: truncate/shorten the keyword portion; keep brand suffix
"""

import os, re, subprocess

def shorten_title(title: str, max_len=65) -> str:
    if len(title) <= max_len:
        return title
    
    # Split on | to find prefix + suffix
    if '|' in title:
        parts = title.split('|')
        suffix = parts[-1].strip()
        prefix = '|'.join(parts[:-1]).strip()
        
        # Available space: max_len - " | " - len(suffix)
        avail = max_len - 3 - len(suffix)
        
        if avail >= 15:
            # Truncate prefix to available space
            # Try to cut at a word boundary using —
            if '—' in prefix and len(prefix) > avail:
                # Take just the first segment before the first —
                first_seg = prefix.split('—')[0].strip()
                if len(first_seg) <= avail:
                    prefix = first_seg
                else:
                    # Hard cut at word boundary
                    prefix = prefix[:avail].rsplit(' ', 1)[0].rstrip(' —')
            elif len(prefix) > avail:
                prefix = prefix[:avail].rsplit(' ', 1)[0].rstrip(' —')
            
            candidate = f"{prefix} | {suffix}"
            if len(candidate) <= max_len:
                return candidate
        
        # Suffix alone already > 65 — just truncate the whole thing at word boundary
        return title[:max_len].rsplit(' ', 1)[0].rstrip(' |—')
    
    # No | separator — just truncate at word boundary
    return title[:max_len].rsplit(' ', 1)[0].rstrip(' —')


def fix_file(fpath: str) -> bool:
    """Returns True if file was modified."""
    try:
        html = open(fpath, encoding='utf-8', errors='ignore').read()
    except:
        return False
    
    # Extract title
    m = re.search(r'<title>(.*?)</title>', html, re.DOTALL | re.IGNORECASE)
    if not m:
        return False
    
    old_title = m.group(1).strip()
    if len(old_title) <= 65:
        return False
    
    new_title = shorten_title(old_title)
    
    if new_title == old_title:
        return False
    
    if len(new_title) > 65:
        # Emergency fallback: hard cut
        new_title = new_title[:65].rsplit(' ', 1)[0].rstrip(' —|')
    
    new_html = re.sub(
        r'<title>.*?</title>',
        f'<title>{new_title}</title>',
        html,
        flags=re.DOTALL | re.IGNORECASE
    )
    
    if new_html == html:
        return False
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(new_html)
    
    return True


def main():
    bases = []
    sites_dir = 'elipacko-sites'
    for d in sorted(os.listdir(sites_dir)):
        bases.append(os.path.join(sites_dir, d))
    bases.append('elipacko-usa.com')
    
    fixed_by_repo = {}
    total_fixed = 0
    
    for base in bases:
        repo_name = os.path.basename(base)
        fixed_files = []
        
        for root, dirs, files in os.walk(base):
            for fname in files:
                if not fname.endswith('.html') or 'googlec55' in fname:
                    continue
                fpath = os.path.join(root, fname)
                if fix_file(fpath):
                    fixed_files.append(fpath)
                    total_fixed += 1
        
        if fixed_files:
            fixed_by_repo[repo_name] = fixed_files
    
    print(f"Total files fixed: {total_fixed}")
    print(f"Repos affected: {len(fixed_by_repo)}")
    print()
    
    for repo, files in fixed_by_repo.items():
        print(f"{repo}: {len(files)} files")
    
    return fixed_by_repo


def verify():
    """Quick verification that no titles over 65 chars remain."""
    bases = [os.path.join('elipacko-sites', d) for d in sorted(os.listdir('elipacko-sites'))]
    bases.append('elipacko-usa.com')
    
    over = []
    for base in bases:
        for root, dirs, files in os.walk(base):
            for fname in files:
                if not fname.endswith('.html') or 'googlec55' in fname:
                    continue
                fpath = os.path.join(root, fname)
                try:
                    html = open(fpath, encoding='utf-8', errors='ignore').read()
                except:
                    continue
                m = re.search(r'<title>(.*?)</title>', html, re.DOTALL | re.IGNORECASE)
                if m:
                    t = m.group(1).strip()
                    if len(t) > 65:
                        over.append((len(t), fpath, t))
    return over


if __name__ == '__main__':
    os.chdir('/home/ubuntu/.openclaw/workspace')
    print("=== Fixing SEO titles ===")
    fixed_by_repo = main()
    
    print()
    print("=== Verification pass ===")
    remaining = verify()
    print(f"Still over 65 chars: {len(remaining)}")
    for ln, fp, t in remaining[:10]:
        print(f"  [{ln}c] {fp}: {t}")
