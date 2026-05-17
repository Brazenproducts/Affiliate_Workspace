#!/usr/bin/env python3
"""Second pass: add buy buttons to sites with different HTML structures (card, section-based, etc.)."""

import os, re, glob, subprocess
from bs4 import BeautifulSoup

BASE = "/home/ubuntu/.openclaw/workspace/affiliate-sites"
TAG = "brazenprodu01-20"

BUY_BTN_CSS = """
/* Buy Button Styles */
.buy-btn{display:inline-block;padding:12px 24px;border-radius:6px;font-weight:700;font-size:15px;text-decoration:none;text-align:center;transition:opacity .2s,transform .1s;margin:8px 4px;cursor:pointer}
.buy-btn:hover{opacity:.85;transform:translateY(-1px)}
.buy-btn-primary{background:#e8600a;color:#fff !important}
.buy-btn-amazon{background:#f0c14b;color:#111 !important;border:1px solid #a88734}
.buy-btn-store{background:#2563eb;color:#fff !important}
.buy-btn-bullstrap{background:#1a1a1a;color:#fff !important}
.card-buttons{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center}
.card-buttons a{flex:1;min-width:120px;text-align:center}
"""

# Site-specific Bartact link mappings
BARTACT_VEHICLE_LINKS = {
    "jeep wrangler": "https://bartact.com/collections/jeep-wrangler-seat-covers",
    "jeep gladiator": "https://bartact.com/collections/jeep-gladiator-seat-covers",
    "ford bronco": "https://bartact.com/collections/ford-bronco-seat-covers",
    "bronco": "https://bartact.com/collections/ford-bronco-seat-covers",
    "toyota tacoma": "https://bartact.com/collections/toyota-tacoma-seat-covers",
    "tacoma": "https://bartact.com/collections/toyota-tacoma-seat-covers",
    "toyota 4runner": "https://bartact.com/collections/toyota-4runner-seat-covers",
    "4runner": "https://bartact.com/collections/toyota-4runner-seat-covers",
    "grab handle": "https://bartact.com/collections/grab-handles",
    "limit strap": "https://bartact.com/collections/limit-straps",
    "door bag": "https://bartact.com/collections/door-storage-bags",
    "storage bag": "https://bartact.com/collections/door-storage-bags",
    "pet": "https://bartact.com/collections/pet-gear",
    "dog": "https://bartact.com/collections/pet-gear",
}

WIPER_ASINS = {
    "bosch icon": "B00E4PKH16",
    "rain-x latitude": "B018GSVQP0",
    "rain-x": "B018GSVQP0",
    "michelin stealth": "B07YFPCPCG",
    "piaa super silicone": "B000BPHKE0",
    "piaa": "B000BPHKE0",
    "trico exact": "B002TW9FE8",
    "trico": "B002TW9FE8",
    "aero premium": "B00V5MVYGK",
    "aero": "B00V5MVYGK",
    "valeo": "B003OC7AGA",
    "anco": "B00D8WNKFE",
    "silblade": "B01CZRQPSE",
}

HVAC_ASINS = {
    "filtrete": "B005GK7UEQ",
    "honeywell": "B01MRN6HV2",
    "nordic pure": "B004Q06YB6",
    "aerostar": "B01HQHNFY",
    "lennox": "B00DZGNPIG",
    "aprilaire": "B00DGSQ0TA",
    "filterbuy": "B00APCGP38",
    "3m": "B005GK7UEQ",
}

def get_bartact_url(text):
    text_lower = text.lower()
    for key, url in BARTACT_VEHICLE_LINKS.items():
        if key in text_lower:
            return url
    return "https://bartact.com"

def get_amazon_url(text, asin_map):
    text_lower = text.lower()
    for key, asin in asin_map.items():
        if key in text_lower:
            return f"https://www.amazon.com/dp/{asin}?tag={TAG}"
    search = text.replace(" ", "+")
    return f"https://www.amazon.com/s?k={search}&tag={TAG}"

def inject_css(soup, site_dir):
    for style in soup.find_all("style"):
        if "buy-btn" in (style.string or ""):
            return
    css_file = os.path.join(site_dir, "css", "style.css")
    if not os.path.exists(css_file):
        css_file = os.path.join(site_dir, "style.css")
    if os.path.exists(css_file):
        with open(css_file, "r") as f:
            if "buy-btn" not in f.read():
                with open(css_file, "a") as f2:
                    f2.write("\n" + BUY_BTN_CSS)
    style_tag = soup.new_tag("style")
    style_tag.string = BUY_BTN_CSS
    if soup.head:
        soup.head.append(style_tag)

def process_bartact_site(site_name, site_dir):
    """Process Bartact-focused sites (tacticalseats, tacticalseatcovers, tacomaseats)."""
    modified_count = 0
    for filepath in glob.glob(os.path.join(site_dir, "*.html")):
        fname = os.path.basename(filepath)
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
        
        if "buy-btn" in content:
            continue
        
        soup = BeautifulSoup(content, "html.parser")
        inject_css(soup, site_dir)
        modified = False
        
        # Process .card elements
        for card in soup.find_all(class_="card"):
            if card.find(class_=re.compile(r"buy-btn")):
                continue
            card_text = card.get_text()
            existing_link = card.find("a", class_="btn")
            
            bartact_url = get_bartact_url(card_text)
            
            btn_container = soup.new_tag("div", **{"class": "card-buttons"})
            if existing_link:
                review_btn = soup.new_tag("a", href=existing_link.get("href", "#"), **{
                    "class": "buy-btn", "style": "background:#555;color:#fff;font-size:13px;padding:8px 12px"
                })
                review_btn.string = existing_link.get_text(strip=True)
                btn_container.append(review_btn)
            
            buy_btn = soup.new_tag("a", href=bartact_url, **{
                "class": "buy-btn buy-btn-primary", "target": "_blank", "rel": "nofollow noopener"
            })
            buy_btn.string = "Shop at Bartact →"
            btn_container.append(buy_btn)
            
            if existing_link:
                existing_link.replace_with(btn_container)
            else:
                card_body = card.find(class_="card-body")
                if card_body:
                    card_body.append(btn_container)
                else:
                    card.append(btn_container)
            modified = True
        
        # Process sections with product mentions (h2/h3 followed by content)
        for heading in soup.find_all(["h2", "h3"]):
            text = heading.get_text().lower()
            # Skip nav/footer headings
            parent_classes = " ".join(heading.parent.get("class", []))
            if any(skip in parent_classes for skip in ["footer", "nav", "header"]):
                continue
            
            # Check if there's already a buy button nearby
            next_sibs = list(heading.next_siblings)[:5]
            has_btn = any(s.find(class_=re.compile(r"buy-btn")) for s in next_sibs if hasattr(s, 'find') and callable(getattr(s, 'find_all', None)))
            if has_btn:
                continue
            
            # Add button after relevant content sections
            if any(kw in text for kw in ["bartact", "seat cover", "tactical", "wrangler", "tacoma", "bronco", "4runner", "gladiator"]):
                bartact_url = get_bartact_url(heading.get_text())
                buy_btn = soup.new_tag("a", href=bartact_url, **{
                    "class": "buy-btn buy-btn-primary", "target": "_blank", "rel": "nofollow noopener",
                    "style": "margin:12px 0;display:inline-block"
                })
                buy_btn.string = "Shop at Bartact →"
                # Insert after the next paragraph
                next_p = heading.find_next_sibling("p")
                if next_p:
                    next_p.insert_after(buy_btn)
                else:
                    heading.insert_after(buy_btn)
                modified = True
        
        if modified:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(str(soup))
            modified_count += 1
            print(f"  ✓ {fname}")
    
    return modified_count

def process_amazon_review_site(site_name, site_dir, asin_map):
    """Process Amazon affiliate review sites with non-standard structure."""
    modified_count = 0
    for filepath in glob.glob(os.path.join(site_dir, "*.html")):
        fname = os.path.basename(filepath)
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
        
        if "buy-btn" in content:
            continue
        
        soup = BeautifulSoup(content, "html.parser")
        inject_css(soup, site_dir)
        modified = False
        
        # Process .card elements
        for card in soup.find_all(class_="card"):
            if card.find(class_=re.compile(r"buy-btn")):
                continue
            h3 = card.find(["h3", "h2"])
            if not h3:
                continue
            product_name = h3.get_text(strip=True)
            amazon_url = get_amazon_url(product_name, asin_map)
            
            existing_link = card.find("a")
            btn_container = soup.new_tag("div", **{"class": "card-buttons"})
            
            if existing_link:
                review_btn = soup.new_tag("a", href=existing_link.get("href", "#"), **{
                    "class": "buy-btn", "style": "background:#555;color:#fff;font-size:13px;padding:8px 12px"
                })
                review_btn.string = existing_link.get_text(strip=True)
                btn_container.append(review_btn)
            
            buy_btn = soup.new_tag("a", href=amazon_url, **{
                "class": "buy-btn buy-btn-amazon", "target": "_blank", "rel": "nofollow noopener"
            })
            buy_btn.string = "Buy on Amazon →"
            btn_container.append(buy_btn)
            
            if existing_link:
                existing_link.replace_with(btn_container)
            else:
                card.append(btn_container)
            modified = True
        
        # Process product mentions in review content (h2/h3 with product names)
        for heading in soup.find_all(["h2", "h3"]):
            text = heading.get_text()
            parent_classes = " ".join(heading.parent.get("class", []))
            if any(skip in parent_classes for skip in ["footer", "nav", "header", "card"]):
                continue
            
            next_sibs = list(heading.next_siblings)[:5]
            has_btn = any(s.find(class_=re.compile(r"buy-btn|btn-amazon")) for s in next_sibs if hasattr(s, 'find') and callable(getattr(s, 'find_all', None)))
            if has_btn:
                continue
            
            # Check if heading mentions a product
            text_lower = text.lower()
            matched = False
            for key in asin_map:
                if key in text_lower:
                    matched = True
                    break
            
            if matched or any(kw in text_lower for kw in ["best", "top pick", "editor", "winner", "#1", "recommend"]):
                amazon_url = get_amazon_url(text, asin_map)
                buy_btn = soup.new_tag("a", href=amazon_url, **{
                    "class": "buy-btn buy-btn-amazon", "target": "_blank", "rel": "nofollow noopener",
                    "style": "margin:12px 0;display:inline-block"
                })
                buy_btn.string = "Check Price on Amazon →"
                next_p = heading.find_next_sibling("p")
                if next_p:
                    next_p.insert_after(buy_btn)
                else:
                    heading.insert_after(buy_btn)
                modified = True
        
        if modified:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(str(soup))
            modified_count += 1
            print(f"  ✓ {fname}")
    
    return modified_count

def git_push(site_dir):
    cmds = [
        ["git", "add", "-A"],
        ["git", "commit", "-m", "Add prominent buy/CTA buttons to all product mentions"],
        ["git", "push"],
    ]
    for cmd in cmds:
        result = subprocess.run(cmd, cwd=site_dir, capture_output=True, text=True)
        if result.returncode != 0 and "nothing to commit" not in result.stdout + result.stderr:
            print(f"  Git: {result.stderr[:200]}")
            # Try pull --rebase then push
            if "rejected" in result.stderr:
                subprocess.run(["git", "pull", "--rebase"], cwd=site_dir, capture_output=True)
                subprocess.run(["git", "push"], cwd=site_dir, capture_output=True)
            return
    print("  Pushed OK")

SITES = {
    "tacticalseats.com": ("bartact", None),
    "tacticalseatcovers.com": ("bartact", None),
    "tacomaseats.com": ("bartact", None),
    "bestwindshieldwiper.com": ("amazon", WIPER_ASINS),
    "homehvacfilters.com": ("amazon", HVAC_ASINS),
}

if __name__ == "__main__":
    for site_name, (site_type, asin_map) in SITES.items():
        site_dir = os.path.join(BASE, site_name)
        print(f"\n{'='*50}")
        print(f"Processing: {site_name} ({site_type})")
        
        if site_type == "bartact":
            count = process_bartact_site(site_name, site_dir)
        else:
            count = process_amazon_review_site(site_name, site_dir, asin_map)
        
        if count > 0:
            print(f"  Modified {count} files, pushing...")
            git_push(site_dir)
        else:
            print(f"  No changes")
    
    # Also check topoffroadstores.com which had no changes
    site_dir = os.path.join(BASE, "topoffroadstores.com")
    print(f"\n{'='*50}")
    print(f"Processing: topoffroadstores.com (store directory)")
    count = 0
    for filepath in glob.glob(os.path.join(site_dir, "*.html")):
        fname = os.path.basename(filepath)
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
        if "buy-btn" in content:
            continue
        soup = BeautifulSoup(content, "html.parser")
        inject_css(soup, site_dir)
        mod = False
        for card in soup.find_all(class_=re.compile(r"card|store|brand|retailer")):
            if card.find(class_=re.compile(r"buy-btn")):
                continue
            card_text = card.get_text().lower()
            existing_link = card.find("a")
            if not existing_link:
                continue
            
            btn_container = soup.new_tag("div", **{"class": "card-buttons"})
            href = existing_link.get("href", "#")
            
            review_btn = soup.new_tag("a", href=href, **{
                "class": "buy-btn", "style": "background:#555;color:#fff;font-size:13px;padding:8px 12px"
            })
            review_btn.string = existing_link.get_text(strip=True)
            btn_container.append(review_btn)
            
            if "bartact" in card_text:
                buy_btn = soup.new_tag("a", href="https://bartact.com", **{
                    "class": "buy-btn buy-btn-primary", "target": "_blank", "rel": "noopener"
                })
                buy_btn.string = "Shop Bartact →"
            elif "bull strap" in card_text or "bullstrap" in card_text:
                buy_btn = soup.new_tag("a", href="https://bullstrap.com", **{
                    "class": "buy-btn buy-btn-primary", "target": "_blank", "rel": "noopener"
                })
                buy_btn.string = "Shop Bull Strap →"
            else:
                buy_btn = soup.new_tag("a", href=href, **{
                    "class": "buy-btn buy-btn-store", "target": "_blank", "rel": "noopener"
                })
                buy_btn.string = "Visit Store →"
            
            btn_container.append(buy_btn)
            existing_link.replace_with(btn_container)
            mod = True
        
        if mod:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(str(soup))
            count += 1
            print(f"  ✓ {fname}")
    
    if count > 0:
        print(f"  Modified {count} files, pushing...")
        git_push(site_dir)
    else:
        print(f"  No changes")
