#!/usr/bin/env python3
"""
Amazon Backend Keywords Adder for Bartact
- Fetches listings missing generic_keyword
- Generates relevant backend search terms
- Applies via PATCH or saves to file if 403
"""

import json
import time
import re
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime

# Credentials
CLIENT_ID = "amzn1.application-oa2-client.0647cd373f01442ba17be4f1bdb22e10"
CLIENT_SECRET = "amzn1.oa2-cs.v1.5d520549f7a15ffd865ab34da9de8d99caf60f2acd0eae4651006b6c7a5e51b9"
REFRESH_TOKEN = "Atzr|IwEBICZ7yuAruub5HX_QZLliVyKVSYFFlGAcBTt0kJ-RXZJxLDfK9VmZt-x99Vx5Ze6N6BnASjJhL82QU2gqEjuupYYmK4IbHzElg9fNVuv8JRnFwX95jHZMAx_jo_HGRwIU1El4lRubwoDcZ9OlCmLsPcSLdVQUV9H4lGNpmGo0mnPEcajwMgjJbw35F2epxZuIheJKpyS1jE89nOj8BmQ7ygsH_vhMcgy9LNSFRVYPfqQ7JptZryDKfOmenPowptdrLIwCyV35Vt-D0epSOqofbN6VlRqNKmI73ASZZurhOkzF5flAj9gvwI1wBlX3CkHH6NU"
SELLER_ID = "A239XCX0K8RYS8"
MARKETPLACE_ID = "ATVPDKIKX0DER"

OUTPUT_FILE = "/home/ubuntu/.openclaw/workspace/memory/amazon-keywords-added.json"

# ─── Token management ────────────────────────────────────────────────────────

_access_token = None
_token_expiry = 0

def get_access_token():
    global _access_token, _token_expiry
    if _access_token and time.time() < _token_expiry - 60:
        return _access_token
    
    data = urllib.parse.urlencode({
        "grant_type": "refresh_token",
        "refresh_token": REFRESH_TOKEN,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }).encode()
    
    req = urllib.request.Request(
        "https://api.amazon.com/auth/o2/token",
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
    
    _access_token = result["access_token"]
    _token_expiry = time.time() + result.get("expires_in", 3600)
    print(f"[token] Refreshed, expires in {result.get('expires_in')}s")
    return _access_token


def sp_get(path, params=None):
    token = get_access_token()
    url = f"https://sellingpartnerapi-na.amazon.com{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={
        "x-amz-access-token": token,
        "Content-Type": "application/json",
    })
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read()), resp.status
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return {"error": body, "status": e.code}, e.code


def sp_patch(path, body):
    token = get_access_token()
    url = f"https://sellingpartnerapi-na.amazon.com{path}"
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers={
        "x-amz-access-token": token,
        "Content-Type": "application/json",
    }, method="PATCH")
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read()), resp.status
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return {"error": body, "status": e.code}, e.code


# ─── Keyword generation ───────────────────────────────────────────────────────

# Product-type keyword pools
KEYWORD_POOLS = {
    # Seat covers / upholstery
    "seat": [
        "seat cover seat protector seat wrap car seat cover truck seat cover",
        "tactical seat cover nylon seat cover cordura seat cover waterproof seat cover",
        "heavy duty seat cover off road seat cover overlanding seat cover molle seat cover",
        "jeep wrangler jl jlu 2018 2019 2020 2021 2022 2023 2024 2025",
        "jeep gladiator jt 2019 2020 2021 2022 2023 2024 2025",
        "coverking smittybilt rough country seats rugged ridge",
        "military seat cover pals webbing seat cover custom fit seat cover",
        "front seat cover rear seat cover bench seat cover bucket seat cover",
    ],
    # Limit straps / suspension
    "limit strap": [
        "suspension limit strap bump stop strap axle strap droop strap",
        "off road limit strap 4x4 limit strap rock crawler strap",
        "jeep wrangler jk jl jlu tj yj xj limit strap",
        "ford bronco tacoma 4runner fj cruiser limit strap",
        "chromoly end pieces mil spec webbing nylon strap heavy duty strap",
        "made in usa limit strap race proven strap overlanding strap",
        "smittybilt rough country rugged ridge suspension strap",
        "4130 chromoly strap quad wrap strap",
    ],
    # Bags / storage
    "bag": [
        "tactical bag molle bag pals bag storage bag gear bag",
        "off road bag overlanding bag camping bag military bag",
        "cordura bag nylon bag waterproof bag heavy duty bag",
        "jeep bag truck bag suv bag vehicle bag",
        "seat back bag headrest bag roll bar bag",
    ],
    # Grab handles
    "grab handle": [
        "grab handle roll bar handle jeep handle off road handle",
        "jeep wrangler jl jlu jk grab handle 2007 2008 2009 2010 2011 2012 2013 2014 2015 2016 2017 2018 2019 2020 2021 2022 2023 2024",
        "tactical grab handle nylon grab handle heavy duty grab handle",
        "paracord grab handle molle grab handle",
        "smittybilt rugged ridge rough country grab handle",
    ],
    # Tie downs / straps (generic)
    "tie down": [
        "tie down strap cargo strap ratchet strap cam buckle strap",
        "off road tie down overlanding tie down truck tie down",
        "mil spec webbing strap nylon tie down heavy duty tie down",
        "made in usa tie down strap",
    ],
    # Roll bar / cage pads
    "pad": [
        "roll bar pad cage pad tube pad padding",
        "jeep wrangler roll bar pad jl jlu jk tj yj",
        "neoprene pad cordura pad foam pad",
        "off road cage pad safety pad",
        "smittybilt rugged ridge rough country roll bar pad",
    ],
    # Default / generic Bartact
    "default": [
        "off road overlanding camping military tactical",
        "jeep wrangler jl jlu jk tj yj gladiator jt",
        "ford bronco tacoma 4runner fj cruiser",
        "cordura nylon waterproof heavy duty mil spec",
        "made in usa american made quality",
        "smittybilt rough country rugged ridge coverking",
        "molle pals webbing attachment system",
        "2018 2019 2020 2021 2022 2023 2024 2025",
    ],
}

def detect_product_type(title: str, sku: str) -> str:
    t = (title + " " + sku).lower()
    if any(w in t for w in ["seat cover", "seat wrap", "seat protector", "seat pad"]):
        return "seat"
    if any(w in t for w in ["limit strap", "suspension strap", "droop strap", "bump strap"]):
        return "limit strap"
    if any(w in t for w in ["grab handle", "grab bar"]):
        return "grab handle"
    if any(w in t for w in [" bag", "pouch", "storage"]):
        return "bag"
    if any(w in t for w in ["tie down", "cargo strap", "ratchet"]):
        return "tie down"
    if any(w in t for w in [" pad", "padding", "roll bar pad", "cage pad"]):
        return "pad"
    return "default"


def generate_keywords(title: str, sku: str, existing_words: set) -> str:
    """Generate backend keywords ≤250 bytes, avoiding words already in title."""
    product_type = detect_product_type(title, sku)
    pools = KEYWORD_POOLS.get(product_type, KEYWORD_POOLS["default"])
    
    # Normalize existing words from title
    title_words = set(re.sub(r'[^a-z0-9 ]', ' ', title.lower()).split())
    # Also exclude brand
    title_words.update(["bartact", "bull", "strap"])
    
    collected = []
    seen = set()
    
    for pool_line in pools:
        for word in pool_line.split():
            w = word.lower().strip()
            if w and w not in title_words and w not in seen and len(w) > 2:
                seen.add(w)
                collected.append(w)
    
    # Build keyword string up to 250 bytes
    result_words = []
    byte_count = 0
    for w in collected:
        addition = (w if not result_words else " " + w)
        if byte_count + len(addition.encode()) <= 250:
            result_words.append(w)
            byte_count += len(addition.encode())
        else:
            break
    
    return " ".join(result_words)


# ─── Main logic ───────────────────────────────────────────────────────────────

def fetch_all_listings(max_pages=40):
    """Fetch all listings with attributes, return list of items."""
    all_items = []
    next_token = None
    page = 0
    
    while True:
        page += 1
        params = {
            "marketplaceIds": MARKETPLACE_ID,
            "pageSize": 20,
            "includedData": "attributes",
        }
        if next_token:
            params["pageToken"] = next_token
        
        print(f"[fetch] Page {page}...", end=" ", flush=True)
        result, status = sp_get(f"/listings/2021-08-01/items/{SELLER_ID}", params)
        
        if status != 200:
            print(f"ERROR {status}: {result}")
            break
        
        items = result.get("items", [])
        all_items.extend(items)
        print(f"got {len(items)} items (total: {len(all_items)})")
        
        next_token = result.get("pagination", {}).get("nextToken")
        if not next_token or page >= max_pages:
            break
        
        time.sleep(0.5)  # rate limit courtesy
    
    return all_items


def items_missing_keywords(items):
    missing = []
    for item in items:
        attrs = item.get("attributes", {})
        gk = attrs.get("generic_keyword", [])
        # Missing if empty list or all values are empty/whitespace
        has_keywords = any(
            entry.get("value", "").strip()
            for entry in gk
        )
        if not has_keywords:
            missing.append(item)
    return missing


def get_item_title(item):
    attrs = item.get("attributes", {})
    item_name = attrs.get("item_name", [])
    if item_name:
        return item_name[0].get("value", "")
    # Fallback: try bullet_point
    bp = attrs.get("bullet_point", [])
    if bp:
        return bp[0].get("value", "")
    return item.get("sku", "")


def detect_product_type_from_item(item):
    title = get_item_title(item)
    sku = item.get("sku", "")
    return detect_product_type(title, sku)


def patch_keywords(sku, keywords, product_type_guess):
    """Try PATCH to add backend keywords. Returns (success, status_code, response)."""
    # Try a few product types — Amazon requires the correct productType
    product_type_map = {
        "seat": "SEAT_COVER",
        "limit strap": "AUTOMOTIVE_PARTS_AND_ACCESSORIES",
        "grab handle": "AUTOMOTIVE_PARTS_AND_ACCESSORIES",
        "bag": "LUGGAGE",
        "tie down": "AUTOMOTIVE_PARTS_AND_ACCESSORIES",
        "pad": "AUTOMOTIVE_PARTS_AND_ACCESSORIES",
        "default": "AUTOMOTIVE_PARTS_AND_ACCESSORIES",
    }
    product_type = product_type_map.get(product_type_guess, "AUTOMOTIVE_PARTS_AND_ACCESSORIES")
    
    body = {
        "productType": product_type,
        "patches": [{
            "op": "replace",
            "path": "/attributes/generic_keyword",
            "value": [{
                "value": keywords,
                "marketplace_id": MARKETPLACE_ID
            }]
        }]
    }
    
    path = f"/listings/2021-08-01/items/{SELLER_ID}/{urllib.parse.quote(sku, safe='')}"
    params = f"?marketplaceIds={MARKETPLACE_ID}"
    
    result, status = sp_patch(path + params, body)
    return status in (200, 202), status, result


def main():
    print("=" * 60)
    print("Bartact Amazon Backend Keywords Adder")
    print("=" * 60)
    
    # Step 1: Fetch all listings
    print("\n[1] Fetching all listings...")
    all_items = fetch_all_listings(max_pages=40)
    print(f"    Total fetched: {len(all_items)}")
    
    # Step 2: Find missing keywords
    print("\n[2] Identifying listings missing backend keywords...")
    missing = items_missing_keywords(all_items)
    print(f"    Missing keywords: {len(missing)} / {len(all_items)}")
    
    # Step 3: Test batch of 20 first
    test_batch = missing[:20]
    print(f"\n[3] Processing test batch of {len(test_batch)} listings...")
    
    results = {
        "run_date": datetime.utcnow().isoformat() + "Z",
        "total_listings": len(all_items),
        "total_missing_keywords": len(missing),
        "test_batch_size": len(test_batch),
        "updated": [],
        "saved_for_manual": [],
        "errors": [],
        "patch_supported": None,
    }
    
    patch_works = None  # Will determine from first attempt
    
    for i, item in enumerate(test_batch):
        sku = item.get("sku", "")
        title = get_item_title(item)
        pt = detect_product_type(title, sku)
        keywords = generate_keywords(title, sku, set())
        
        print(f"  [{i+1:2d}] SKU: {sku[:30]:<30} | type: {pt:<12} | kw bytes: {len(keywords.encode())}")
        print(f"        Title: {title[:70]}")
        print(f"        Keywords: {keywords[:80]}...")
        
        if patch_works is False:
            # Already know PATCH doesn't work, just save
            results["saved_for_manual"].append({
                "sku": sku,
                "title": title,
                "product_type": pt,
                "keywords": keywords,
                "keyword_bytes": len(keywords.encode()),
            })
            continue
        
        # Try PATCH
        success, status, response = patch_keywords(sku, keywords, pt)
        
        if status == 403:
            print(f"        → 403 Forbidden — PATCH not available, switching to save mode")
            patch_works = False
            results["patch_supported"] = False
            results["saved_for_manual"].append({
                "sku": sku,
                "title": title,
                "product_type": pt,
                "keywords": keywords,
                "keyword_bytes": len(keywords.encode()),
            })
        elif success:
            if patch_works is None:
                patch_works = True
                results["patch_supported"] = True
                print(f"        → ✓ PATCH works! Status {status}")
            else:
                print(f"        → ✓ Updated (status {status})")
            results["updated"].append({
                "sku": sku,
                "title": title,
                "product_type": pt,
                "keywords": keywords,
                "keyword_bytes": len(keywords.encode()),
                "api_status": status,
            })
        else:
            print(f"        → ✗ Error {status}: {str(response)[:100]}")
            results["errors"].append({
                "sku": sku,
                "title": title,
                "status": status,
                "error": str(response)[:200],
            })
        
        time.sleep(0.3)
    
    # Step 4: If PATCH works, continue with remaining listings
    if patch_works is True and len(missing) > 20:
        remaining = missing[20:]
        print(f"\n[4] PATCH works! Continuing with remaining {len(remaining)} listings...")
        
        for i, item in enumerate(remaining):
            sku = item.get("sku", "")
            title = get_item_title(item)
            pt = detect_product_type(title, sku)
            keywords = generate_keywords(title, sku, set())
            
            if (i + 1) % 10 == 0:
                print(f"  Progress: {i+1}/{len(remaining)}...")
            
            success, status, response = patch_keywords(sku, keywords, pt)
            
            if status == 429:
                print(f"  Rate limited at item {i+1}, sleeping 5s...")
                time.sleep(5)
                success, status, response = patch_keywords(sku, keywords, pt)
            
            if success:
                results["updated"].append({
                    "sku": sku,
                    "title": title,
                    "product_type": pt,
                    "keywords": keywords,
                    "keyword_bytes": len(keywords.encode()),
                    "api_status": status,
                })
            elif status == 403:
                # Switched to save mode
                patch_works = False
                results["patch_supported"] = False
                results["saved_for_manual"].append({
                    "sku": sku,
                    "title": title,
                    "product_type": pt,
                    "keywords": keywords,
                    "keyword_bytes": len(keywords.encode()),
                })
            else:
                results["errors"].append({
                    "sku": sku,
                    "title": title,
                    "status": status,
                    "error": str(response)[:200],
                })
            
            time.sleep(0.3)
    
    # Step 5: If PATCH failed, save ALL remaining missing listings
    if patch_works is False:
        remaining_missing = [
            item for item in missing
            if item.get("sku") not in {r["sku"] for r in results["saved_for_manual"]}
        ]
        print(f"\n[4] Saving remaining {len(remaining_missing)} listings for manual upload...")
        for item in remaining_missing:
            sku = item.get("sku", "")
            title = get_item_title(item)
            pt = detect_product_type(title, sku)
            keywords = generate_keywords(title, sku, set())
            results["saved_for_manual"].append({
                "sku": sku,
                "title": title,
                "product_type": pt,
                "keywords": keywords,
                "keyword_bytes": len(keywords.encode()),
            })
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Total listings:          {results['total_listings']}")
    print(f"  Missing keywords:        {results['total_missing_keywords']}")
    print(f"  PATCH API supported:     {results['patch_supported']}")
    print(f"  Updated via API:         {len(results['updated'])}")
    print(f"  Saved for manual upload: {len(results['saved_for_manual'])}")
    print(f"  Errors:                  {len(results['errors'])}")
    
    # Save results
    import os
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n  Results saved to: {OUTPUT_FILE}")
    
    return results


if __name__ == "__main__":
    main()
