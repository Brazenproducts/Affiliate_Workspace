#!/usr/bin/env python3
"""Add buy buttons to all affiliate sites."""

import os, re, glob, subprocess, json
from bs4 import BeautifulSoup, NavigableString

BASE = "/home/ubuntu/.openclaw/workspace/affiliate-sites"
TAG = "brazenprodu01-20"

# CSS to inject into each site
BUY_BTN_CSS = """
/* Buy Button Styles */
.buy-btn{display:inline-block;padding:12px 24px;border-radius:6px;font-weight:700;font-size:15px;text-decoration:none;text-align:center;transition:opacity .2s,transform .1s;margin:8px 4px;cursor:pointer}
.buy-btn:hover{opacity:.85;transform:translateY(-1px)}
.buy-btn-primary{background:#e8600a;color:#fff !important}
.buy-btn-amazon{background:#f0c14b;color:#111 !important;border:1px solid #a88734}
.buy-btn-store{background:#2563eb;color:#fff !important}
.buy-btn-bullstrap{background:#1a1a1a;color:#fff !important}
.card-buttons{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center}
.card-buttons a{flex:1;min-width:120px;text-align:center;font-size:13px;padding:10px 12px}
"""

# ASIN mappings for Amazon product sites
PRODUCT_ASINS = {
    # bestfirestick.com
    "fire tv stick 4k max": "B0BT6M3CM7",
    "fire tv stick lite": "B091G4YP57",
    "fire tv cube": "B09BZZ3MM7",
    "fire tv stick 4k": "B0BT6M3CM7",
    "roku streaming stick 4k": "B09BKCDXZC",
    "roku express": "B09ZXTFHQS",
    "roku ultra": "B09T4BGGJC",
    "chromecast with google tv": "B0B9HS8DLM",
    "chromecast": "B0B9HS8DLM",
    "apple tv 4k": "B0BTHY3N2Y",
    "apple tv": "B0BTHY3N2Y",
    "nvidia shield tv": "B07YP9FBMM",
    "nvidia shield tv pro": "B07YP94PBJ",
    # bestinstantpot.com
    "instant pot duo": "B00FLYWNYQ",
    "instant pot duo plus": "B075CYMYK6",
    "instant pot pro": "B09BCZML8T",
    "instant pot ultra": "B06Y1MP2PY",
    "instant pot pro plus": "B09MDZQ5M1",
    "instant pot duo crisp": "B07VQ35KFJ",
    "ninja foodi": "B07S85TPLG",
    "instant pot rio": "B0B2TQJML8",
    # bestsmokergrill.com
    "traeger ironwood 650": "B08HGPW3JW",
    "traeger pro 575": "B07NFCZ8K9",
    "weber smokefire ex4": "B0849WQXPY",
    "camp chef woodwind": "B076KL8QN9",
    "pit boss 700fb": "B00NCRHQKW",
    "masterbuilt gravity 560": "B0842CJQC5",
    "green mountain grills daniel boone": "B08NWBL3T1",
    "weber kettle": "B00MKB5TXA",
    "oklahoma joe": "B00KGNIUM6",
    "masterbuilt electric smoker": "B077JBQ68P",
    # bestmeshwifi.com
    "eero pro 6e": "B09HJJN7MS",
    "eero 6+": "B09HJD6VMS",
    "google nest wifi pro": "B0BCQT9JLQ",
    "netgear orbi": "B09GYR8WFT",
    "tp-link deco xe75": "B0B5GKTY2V",
    "asus zenwifi ax": "B083Q4M4MX",
    "linksys velop": "B01N2NLNEH",
    "tp-link deco x20": "B085Z35GY6",
    "netgear nighthawk": "B086HJXKJY",
    "ubiquiti amplifi": "B07MF35X7P",
    # bestgarageorganizer.com
    "gladiator garageworks": "B001F0K244",
    "newage bold": "B082KFCCBP",
    "fleximounts": "B01ICF3B3A",
    "monkey bars": "B07QY8D5D3",
    "hyloft": "B000XBCXQY",
    "husky garage cabinet": "B08QZVLRQB",
    "wall control": "B00BQ09MBQ",
    "seville classics": "B005HCICBM",
    "rubbermaid fasttrack": "B000CBLNTC",
    "gladiator geartrack": "B0009J5NRQ",
    # bestcordlesstools.com
    "dewalt 20v max drill": "B09JY3TWXG",
    "milwaukee m18": "B07KDDKJK5",
    "makita 18v lxt": "B003GSAE22",
    "ryobi one+": "B09H2ZCPX2",
    "bosch 18v": "B07L6H7BTN",
    "dewalt 20v": "B09JY3TWXG",
    "milwaukee": "B07KDDKJK5",
    "makita": "B003GSAE22",
    "dewalt combo kit": "B09JY3TWXG",
    "milwaukee combo kit": "B07KDDKJK5",
    # besttonneaucovers.com
    "bakflip mx4": "B01MU9YNWI",
    "bak revolver x4s": "B082DCN5LG",
    "retrax pro xr": "B079CXWFHB",
    "gator efx": "B074HBCK1R",
    "tyger auto t1": "B00WLMWJHU",
    "tonno pro lo roll": "B01MRN62KQ",
    "extang solid fold": "B019NRJZPC",
    "truxedo truxport": "B001G4Z11Y",
    "undercover ultra flex": "B07PLGYDSC",
    "roll-n-lock m-series": "B001CLQXEW",
    # bestwindshieldwiper.com
    "bosch icon": "B00E4PKH16",
    "rain-x latitude": "B018GSVQP0",
    "michelin stealth ultra": "B07YFPCPCG",
    "piaa super silicone": "B000BPHKE0",
    "trico exact fit": "B002TW9FE8",
    "aero premium": "B00V5MVYGK",
    "valeo ultimate": "B003OC7AGA",
    "anco contour": "B00D8WNKFE",
    # homehvacfilters.com
    "filtrete 1900": "B005GK7UEQ",
    "honeywell elite allergen": "B01MRN6HV2",
    "nordic pure": "B004Q06YB6",
    "filtrete 2200": "B003BXFZMQ",
    "aerostar allergen": "B01HQHJNFY",
    "lennox x6675": "B00DZGNPIG",
    "aprilaire 213": "B00DGSQ0TA",
    "filterbuy": "B00APCGP38",
}

# Bartact site link mappings
BARTACT_LINKS = {
    "bestseatcover.com": {
        "jeep": "https://bartact.com/collections/jeep-wrangler-seat-covers",
        "gladiator": "https://bartact.com/collections/jeep-gladiator-seat-covers",
        "bronco": "https://bartact.com/collections/ford-bronco-seat-covers",
        "tacoma": "https://bartact.com/collections/toyota-tacoma-seat-covers",
        "4runner": "https://bartact.com/collections/toyota-4runner-seat-covers",
        "dog": "https://bartact.com/collections/pet-gear",
        "pet": "https://bartact.com/collections/pet-gear",
        "truck": "https://bartact.com/collections/jeep-wrangler-seat-covers",
        "default": "https://bartact.com/collections/jeep-wrangler-seat-covers",
    },
    "bestbroncoaccessories.com": {
        "seat": "https://bartact.com/collections/ford-bronco-seat-covers",
        "grab": "https://bartact.com/collections/grab-handles",
        "door": "https://bartact.com/collections/door-storage-bags",
        "bag": "https://bartact.com/collections/door-storage-bags",
        "strap": "https://bartact.com/collections/limit-straps",
        "default": "https://bartact.com/collections/ford-bronco-seat-covers",
    },
    "besttruckaccessories.com": {
        "seat": "https://bartact.com/collections/jeep-wrangler-seat-covers",
        "tonneau": "https://bartact.com/collections/limit-straps",
        "default": "https://bartact.com",
    },
    "jeepseatcover.com": {
        "wrangler": "https://bartact.com/collections/jeep-wrangler-seat-covers",
        "gladiator": "https://bartact.com/collections/jeep-gladiator-seat-covers",
        "jl": "https://bartact.com/collections/jeep-wrangler-seat-covers",
        "jk": "https://bartact.com/collections/jeep-wrangler-seat-covers",
        "tj": "https://bartact.com/collections/jeep-wrangler-seat-covers",
        "default": "https://bartact.com/collections/jeep-wrangler-seat-covers",
    },
    "tacticalseats.com": {
        "default": "https://bartact.com/collections/jeep-wrangler-seat-covers",
    },
    "tacticalseatcovers.com": {
        "default": "https://bartact.com/collections/jeep-wrangler-seat-covers",
    },
    "tacomaseats.com": {
        "default": "https://bartact.com/collections/toyota-tacoma-seat-covers",
    },
    "petwearhouse.com": {
        "default": "https://bartact.com/collections/pet-gear",
    },
}

BULLSTRAP_LINKS = {
    "limitstraps.com": "https://bullstrap.com/collections/limit-straps",
}

def get_amazon_link(product_name):
    """Find ASIN for product or fall back to search link."""
    name_lower = product_name.lower().strip()
    for key, asin in PRODUCT_ASINS.items():
        if key in name_lower or name_lower in key:
            return f"https://www.amazon.com/dp/{asin}?tag={TAG}"
    # Fallback to search
    search_term = product_name.replace(" ", "+")
    return f"https://www.amazon.com/s?k={search_term}&tag={TAG}"

def get_bartact_link(site_name, card_text):
    """Get appropriate Bartact link based on card content."""
    if site_name not in BARTACT_LINKS:
        return None
    links = BARTACT_LINKS[site_name]
    text_lower = card_text.lower()
    for keyword, url in links.items():
        if keyword != "default" and keyword in text_lower:
            return url
    return links.get("default")

def inject_css(soup, site_dir):
    """Add buy button CSS to the page."""
    # Check if already added
    for style in soup.find_all("style"):
        if "buy-btn" in (style.string or ""):
            return
    
    # Also try injecting into CSS file
    css_file = os.path.join(site_dir, "css", "style.css")
    if os.path.exists(css_file):
        with open(css_file, "r") as f:
            css_content = f.read()
        if "buy-btn" not in css_content:
            with open(css_file, "a") as f:
                f.write("\n" + BUY_BTN_CSS)
    
    # Also add inline style as fallback
    style_tag = soup.new_tag("style")
    style_tag.string = BUY_BTN_CSS
    if soup.head:
        soup.head.append(style_tag)

def make_buy_button(soup, url, text, btn_class):
    """Create a buy button element."""
    btn = soup.new_tag("a", href=url, **{
        "class": f"buy-btn {btn_class}",
        "target": "_blank",
        "rel": "nofollow noopener"
    })
    btn.string = text
    return btn

def process_cat_card(card, soup, site_name):
    """Add buy button to a cat-card/category card on index/listing pages."""
    # Skip if already has buy button
    if card.find(class_=re.compile(r"buy-btn")):
        return False
    
    # Get card text for context
    h3 = card.find("h3")
    if not h3:
        h3 = card.find("h2")
    if not h3:
        return False
    
    product_name = h3.get_text(strip=True)
    card_text = card.get_text()
    
    # Find existing link to wrap alongside
    existing_link = card.find("a")
    
    # Create button container
    btn_container = soup.new_tag("div", **{"class": "card-buttons"})
    
    # Keep existing review link as a button
    if existing_link:
        review_btn = soup.new_tag("a", href=existing_link.get("href", "#"), **{
            "class": "buy-btn buy-btn-store",
            "style": "background:#555;font-size:13px;padding:8px 12px"
        })
        review_btn.string = existing_link.get_text(strip=True)
        btn_container.append(review_btn)
    
    # Determine buy button type
    is_bartact_site = site_name in BARTACT_LINKS
    is_bullstrap_site = site_name in BULLSTRAP_LINKS
    is_store_site = site_name in ("autopartsreviewed.com", "topoffroadstores.com", "bestoffroadbrands.com")
    
    if is_bartact_site:
        bartact_url = get_bartact_link(site_name, card_text)
        if bartact_url:
            buy_btn = make_buy_button(soup, bartact_url, "Shop at Bartact →", "buy-btn-primary")
            btn_container.append(buy_btn)
        else:
            amazon_url = get_amazon_link(product_name)
            buy_btn = make_buy_button(soup, amazon_url, "Check Price on Amazon →", "buy-btn-amazon")
            btn_container.append(buy_btn)
    elif is_bullstrap_site:
        bs_url = BULLSTRAP_LINKS[site_name]
        buy_btn = make_buy_button(soup, bs_url, "Shop Bull Strap →", "buy-btn-bullstrap")
        btn_container.append(buy_btn)
    elif is_store_site:
        # These are store directories - skip cat cards as they link to store pages
        return False
    else:
        # Amazon affiliate site
        amazon_url = get_amazon_link(product_name)
        buy_btn = make_buy_button(soup, amazon_url, "Buy on Amazon →", "buy-btn-amazon")
        btn_container.append(buy_btn)
    
    # Replace existing link with button container, or append
    if existing_link:
        existing_link.replace_with(btn_container)
    else:
        card.append(btn_container)
    
    return True

def process_brand_card(card, soup, site_name):
    """Add buy button to brand-card."""
    if card.find(class_=re.compile(r"buy-btn")):
        return False
    
    card_text = card.get_text()
    brand_name = card.find(class_="brand-name")
    if not brand_name:
        return False
    
    # Find all existing links
    links = card.find_all("a")
    
    # Create button container
    btn_container = soup.new_tag("div", **{"class": "card-buttons"})
    
    # Keep first link as review link
    if links:
        review_btn = soup.new_tag("a", href=links[0].get("href", "#"), **{
            "class": "buy-btn buy-btn-store",
            "style": "background:#555;font-size:13px;padding:8px 12px"
        })
        review_btn.string = links[0].get_text(strip=True)
        btn_container.append(review_btn)
    
    # Add bartact button
    if site_name in BARTACT_LINKS:
        bartact_url = get_bartact_link(site_name, card_text)
        if bartact_url:
            buy_btn = make_buy_button(soup, bartact_url, "Shop at Bartact →", "buy-btn-primary")
            btn_container.append(buy_btn)
    
    # Remove existing links and add container
    for link in links:
        link.decompose()
    card.append(btn_container)
    return True

def process_product_card(card, soup, site_name):
    """Ensure product-card in review pages has buy button."""
    if card.find(class_=re.compile(r"buy-btn|btn-amazon")):
        return False  # Already has button
    
    h3 = card.find("h3") or card.find("h2")
    product_name = h3.get_text(strip=True) if h3 else ""
    card_text = card.get_text()
    
    if site_name in BARTACT_LINKS:
        bartact_url = get_bartact_link(site_name, card_text)
        if bartact_url:
            buy_btn = make_buy_button(soup, bartact_url, "Shop at Bartact →", "buy-btn-primary")
            card.append(buy_btn)
            return True
    
    if site_name in BULLSTRAP_LINKS:
        bs_url = BULLSTRAP_LINKS[site_name]
        buy_btn = make_buy_button(soup, bs_url, "Shop Bull Strap →", "buy-btn-bullstrap")
        card.append(buy_btn)
        return True
    
    amazon_url = get_amazon_link(product_name)
    buy_btn = make_buy_button(soup, amazon_url, "Check Price on Amazon →", "buy-btn-amazon")
    card.append(buy_btn)
    return True

def process_verdict_box(box, soup, site_name):
    """Ensure verdict boxes have buy buttons."""
    if box.find(class_=re.compile(r"buy-btn|btn-amazon")):
        return False
    
    card_text = box.get_text()
    if site_name in BARTACT_LINKS:
        bartact_url = get_bartact_link(site_name, card_text)
        if bartact_url:
            buy_btn = make_buy_button(soup, bartact_url, "Shop at Bartact →", "buy-btn-primary")
            box.append(buy_btn)
            return True
    
    # Try to find product name from page context
    amazon_url = f"https://www.amazon.com?tag={TAG}"
    buy_btn = make_buy_button(soup, amazon_url, "Check Price on Amazon →", "buy-btn-amazon")
    box.append(buy_btn)
    return True

def process_store_card(card, soup, site_name):
    """Add visit store buttons to store directory cards."""
    if card.find(class_=re.compile(r"buy-btn")):
        return False
    
    card_text = card.get_text().lower()
    existing_link = card.find("a")
    
    # Determine if this is Bartact/Bull Strap
    is_bartact = "bartact" in card_text
    is_bullstrap = "bull strap" in card_text or "bullstrap" in card_text
    
    btn_container = soup.new_tag("div", **{"class": "card-buttons"})
    
    if existing_link:
        href = existing_link.get("href", "#")
        if is_bartact:
            buy_btn = make_buy_button(soup, "https://bartact.com", "Shop Bartact →", "buy-btn-primary")
        elif is_bullstrap:
            buy_btn = make_buy_button(soup, "https://bullstrap.com", "Shop Bull Strap →", "buy-btn-primary")
        else:
            buy_btn = make_buy_button(soup, href, "Visit Store →", "buy-btn-store")
        
        review_text = existing_link.get_text(strip=True)
        review_btn = soup.new_tag("a", href=href, **{
            "class": "buy-btn",
            "style": "background:#555;color:#fff;font-size:13px;padding:8px 12px"
        })
        review_btn.string = review_text
        btn_container.append(review_btn)
        btn_container.append(buy_btn)
        existing_link.replace_with(btn_container)
        return True
    
    return False

def process_html_file(filepath, site_name):
    """Process a single HTML file."""
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()
    
    soup = BeautifulSoup(content, "html.parser")
    modified = False
    site_dir = os.path.dirname(filepath)
    
    # Inject CSS
    inject_css(soup, os.path.join(BASE, site_name))
    
    # Process cat-cards (index/listing pages)
    for card in soup.find_all(class_="cat-card"):
        if process_cat_card(card, soup, site_name):
            modified = True
    
    # Process brand-cards
    for card in soup.find_all(class_="brand-card"):
        if process_brand_card(card, soup, site_name):
            modified = True
    
    # Process product-cards (review pages)
    for card in soup.find_all(class_="product-card"):
        if process_product_card(card, soup, site_name):
            modified = True
    
    # Process verdict boxes
    for box in soup.find_all(class_="verdict-box"):
        if process_verdict_box(box, soup, site_name):
            modified = True
    
    # Process store cards (for directory sites)
    is_store_site = site_name in ("autopartsreviewed.com", "topoffroadstores.com", "bestoffroadbrands.com")
    if is_store_site:
        for card in soup.find_all(class_=re.compile(r"store-card|brand-card|retailer-card|cat-card")):
            if process_store_card(card, soup, site_name):
                modified = True
    
    # For review-card elements (whatarebest.com)
    for card in soup.find_all(class_="review-card"):
        if card.find(class_=re.compile(r"buy-btn")):
            continue
        card_text = card.get_text().lower()
        if "seat cover" in card_text or "bartact" in card_text:
            buy_btn = make_buy_button(soup, "https://bartact.com", "Shop at Bartact →", "buy-btn-primary")
            card.append(buy_btn)
            modified = True
        elif any(kw in card_text for kw in ["jeep", "bronco", "tacoma"]):
            buy_btn = make_buy_button(soup, "https://bartact.com", "Shop at Bartact →", "buy-btn-primary")
            card.append(buy_btn)
            modified = True
    
    if modified:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(str(soup))
        return True
    return False

def process_site(site_name):
    """Process all HTML files in a site."""
    site_dir = os.path.join(BASE, site_name)
    if not os.path.isdir(site_dir):
        print(f"  SKIP: {site_name} not found")
        return 0
    
    html_files = glob.glob(os.path.join(site_dir, "*.html"))
    count = 0
    for f in html_files:
        fname = os.path.basename(f)
        if fname in ("404.html",):
            continue
        result = process_html_file(f, site_name)
        if result:
            count += 1
            print(f"  ✓ {fname}")
    return count

def git_push(site_name):
    """Commit and push changes."""
    site_dir = os.path.join(BASE, site_name)
    cmds = [
        ["git", "add", "-A"],
        ["git", "commit", "-m", "Add prominent buy/CTA buttons to all product cards and review pages"],
        ["git", "push"],
    ]
    for cmd in cmds:
        result = subprocess.run(cmd, cwd=site_dir, capture_output=True, text=True)
        if result.returncode != 0 and "nothing to commit" not in result.stdout + result.stderr:
            print(f"  Git error: {result.stderr[:200]}")
            return False
    return True

# All sites to process
ALL_SITES = [
    # Amazon affiliate review sites
    "bestfirestick.com",
    "bestinstantpot.com",
    "bestsmokergrill.com",
    "bestmeshwifi.com",
    "bestgarageorganizer.com",
    "bestcordlesstools.com",
    "besttonneaucovers.com",
    "bestwindshieldwiper.com",
    "homehvacfilters.com",
    # Bartact-focused sites
    "bestseatcover.com",
    "bestbroncoaccessories.com",
    "besttruckaccessories.com",
    "jeepseatcover.com",
    "tacticalseats.com",
    "tacticalseatcovers.com",
    "tacomaseats.com",
    "petwearhouse.com",
    # Bull Strap sites
    "limitstraps.com",
    # Store directory sites
    "autopartsreviewed.com",
    "topoffroadstores.com",
    "bestoffroadbrands.com",
    # Hub site
    "whatarebest.com",
]

if __name__ == "__main__":
    total = 0
    for site in ALL_SITES:
        print(f"\n{'='*50}")
        print(f"Processing: {site}")
        count = process_site(site)
        total += count
        if count > 0:
            print(f"  Pushing {count} modified files...")
            git_push(site)
        else:
            print(f"  No changes needed")
    
    print(f"\n{'='*50}")
    print(f"Done! Modified {total} files across {len(ALL_SITES)} sites.")
