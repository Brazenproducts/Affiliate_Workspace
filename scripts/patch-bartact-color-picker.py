#!/usr/bin/env python3
"""
Patch all seat cover builders to add Bartact color customization info
inside the Bartact card — outer color, insert color, logo color options.
Run once. Updates all 6 builders + wranglerjeepaccessories.
"""
from pathlib import Path
import re

BASE = Path("/home/ubuntu/.openclaw/workspace/scripts")

# The HTML block to inject into each Bartact card function
# We insert it just before the CTA button line
COLOR_PICKER_HTML = '''    <div class="bartact-colors">
      <div class="color-row">
        <span class="color-label">Outer:</span>
        <span class="color-swatch" style="background:#111;color:#fff" title="Black">Black</span>
      </div>
      <div class="color-row">
        <span class="color-label">Insert:</span>
        <span class="color-swatch" style="background:#111;color:#fff" title="Black">Black</span>
        <span class="color-swatch" style="background:#555;color:#fff" title="Graphite">Graphite</span>
        <span class="color-swatch" style="background:#c0392b;color:#fff" title="Red">Red</span>
        <span class="color-swatch" style="background:#2471a3;color:#fff" title="Blue">Blue</span>
        <span class="color-swatch" style="background:#1a3a5c;color:#fff" title="Navy">Navy</span>
        <span class="color-swatch" style="background:#e67e22;color:#fff" title="Orange">Orange</span>
        <span class="color-swatch" style="background:#556b2f;color:#fff" title="Olive Drab">OD</span>
        <span class="color-swatch" style="background:#b8914a;color:#fff" title="Coyote">Coyote</span>
        <span class="color-swatch" style="background:#c8b87a;color:#222" title="Khaki">Khaki</span>
        <span class="color-swatch" style="background:#9fb4c7;color:#222" title="ACU Camo">ACU</span>
      </div>
      <div class="color-row">
        <span class="color-label">Logo:</span>
        <span style="font-size:.82rem;color:#666;font-style:italic">Embroidered — matches insert color</span>
      </div>
      <p style="font-size:.8rem;color:#888;margin-top:6px">&#9432; All 10 insert colors available. Outer is black only. Logo is embroidered in the USA to match your insert color. <a href="https://bartact.com" target="_blank" rel="noopener" style="color:#c8860a">Customize at bartact.com &rarr;</a></p>
    </div>'''

COLOR_CSS = """
.bartact-colors{margin:10px 0 14px;padding:10px 12px;background:#fefefe;border:1px solid #e8d8b0;border-radius:8px}
.color-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:5px 0}
.color-label{font-size:.8rem;font-weight:700;color:#555;min-width:52px}
.color-swatch{display:inline-block;padding:3px 9px;border-radius:12px;font-size:.75rem;font-weight:600;cursor:default;border:1px solid rgba(0,0,0,.15)}"""

# ── Builders to patch ─────────────────────────────────────────────────────

def patch_css(content, css_block):
    """Add color CSS just before </style>"""
    if ".bartact-colors" in content:
        return content  # already patched
    return content.replace("</style>", css_block + "\n</style>", 1)

def patch_bartact_function(content, fn_name, cta_pattern, insert_html):
    """Insert color picker HTML just before the CTA anchor line inside the fn"""
    if "bartact-colors" in content:
        return content  # already patched
    
    # Find the CTA anchor and insert before it
    # Different builders use different CTA patterns
    patterns = [
        r'(\s+<a href=.*?class="cta">)',
        r'(\s+<a [^>]*class="cta"[^>]*>)',
        r"(    <a href.*?bartact.*?>)",
    ]
    for pat in patterns:
        m = re.search(pat, content)
        if m:
            insert_pos = m.start()
            return content[:insert_pos] + "\n" + insert_html + "\n" + content[insert_pos:]
    return content

# Map of builder file → (css_target, injection_approach)
BUILDERS = {
    "build-jkseatcovers.py": "standard",
    "build-jlseatcovers.py": "standard", 
    "build-jtseatcovers.py": "standard",
    "build-tjseatcovers.py": "standard",
    "build-broncoseatcover.py": "standard",
    "build-wranglerseatcover.py": "standard",
    "build-wranglerjeepaccessories.py": "standard",
}

patched = []
for fname in BUILDERS:
    p = BASE / fname
    if not p.exists():
        print(f"  ⚠️  {fname} not found — skipping")
        continue
    
    original = p.read_text()
    content = original
    
    # 1) Add CSS
    content = patch_css(content, COLOR_CSS)
    
    # 2) Find CTA link inside bartact function and inject before it
    # We look for the <a ... class="cta"> pattern in bartact functions
    if "bartact-colors" not in content:
        # Try different CTA patterns used across builders
        cta_patterns = [
            r'(    <a href="https://bartact\.com[^"]*"[^>]*class="cta")',
            r'(        <a href="https://bartact\.com[^"]*"[^>]*class="cta")',
            r'(<a href="\{BARTACT_COLLECTION\}"[^>]*class="cta")',
            r'(<a href="https://bartact\.com[^"]*" target="_blank" rel="noopener" class="cta")',
        ]
        inserted = False
        for pat in cta_patterns:
            m = re.search(pat, content)
            if m:
                insert_pos = m.start()
                content = content[:insert_pos] + COLOR_PICKER_HTML + "\n" + content[insert_pos:]
                inserted = True
                break
        if not inserted:
            print(f"  ⚠️  {fname}: could not find CTA anchor to inject before — check manually")
            continue
    
    if content != original:
        p.write_text(content)
        patched.append(fname)
        print(f"  ✅ {fname} patched")
    else:
        print(f"  ⏭️  {fname} already patched or no changes needed")

print(f"\nPatched {len(patched)} builders")
