#!/usr/bin/env python3
"""Fix besttonneaucovers.com: replace BAKFlip MX4 image with correct product-specific images."""
import re, os, glob

WORKSPACE = "/home/ubuntu/.openclaw/workspace/besttonneaucovers.com"

# Correct image mapping: product name -> correct Amazon image ID
PRODUCT_IMAGES = {
    "BAKFlip MX4":           "61mpK93Qg0L",  # correct - this IS a hard fold
    "Gator ETX":             "71fecWaWt3L",  # soft roll-up
    "TruXedo TruXport":      "611248fNOPL",  # soft roll-up
    "Tyger Auto T1":         "81zUpKoyQQL",  # soft roll-up
    "RetraxPRO":             "71GDokYxXHL",  # retractable
    "Extang Solid Fold":     "71Gw5nLmGPL",  # hard fold
    "Roll-N-Lock":           "61oyRqb-fxL",  # retractable
    "Gator Recoil":          "61Pd8Rz2tSL",  # retractable
    "MaxMate":               "71ieo4E7NwL",  # soft roll-up
    "Tonno Pro":             "71Y6lnTWcZL",  # soft roll-up
    "UnderCover":            "615nOY-jE1L",  # hard fold
    "Rough Country":         "71FV4e5HBKL",  # hard tri-fold
    "BAK Revolver":          "61QcI-1m4CL",  # retractable
    "Extang Trifecta":       "71Gw5nLmGPL",  # soft tri-fold (use Extang image)
}

# BAKFlip MX4 image ID (the one being used everywhere)
BAKFLIP_ID = "61mpK93Qg0L"

changes = []

for filepath in sorted(glob.glob(os.path.join(WORKSPACE, "*.html"))):
    fname = os.path.basename(filepath)
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # Find all product cards that use the BAKFlip image but aren't actually BAKFlip
    # Pattern: look for <h3>ProductName</h3> followed by an img with BAKFlip ID
    # We need to find product-card blocks and fix images within them
    
    for product_name, correct_id in PRODUCT_IMAGES.items():
        if correct_id == BAKFLIP_ID:
            continue  # Skip BAKFlip itself
        
        # Find pattern: product name appears near a BAKFlip image
        # Look for the product name in an h3, then find the nearest image
        pattern = re.compile(
            r'(<h3>[^<]*' + re.escape(product_name) + r'[^<]*</h3>.*?)'
            r'(src="https://m\.media-amazon\.com/images/I/' + BAKFLIP_ID + r'\._AC_SL1500_\.jpg")',
            re.DOTALL
        )
        
        replacement_url = f'src="https://m.media-amazon.com/images/I/{correct_id}._AC_SL1500_.jpg"'
        
        new_content = pattern.sub(lambda m: m.group(1) + replacement_url, content)
        if new_content != content:
            # Also fix the alt text
            content = new_content
            changes.append(f"  {fname}: {product_name} image fixed ({BAKFLIP_ID} -> {correct_id})")
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)

if changes:
    print(f"Fixed {len(changes)} images:")
    for c in changes:
        print(c)
else:
    print("No changes needed (or pattern didn't match)")
