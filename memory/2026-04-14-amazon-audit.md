# Amazon Bartact Audit — 2026-04-14

## Revenue
**Last 7 days: 60 orders / $2,099 revenue** (~$300/day avg)

| Date | Orders | Revenue |
|------|--------|---------|
| 4/7 | 10 | $407 |
| 4/8 | 9 | $388 |
| 4/9 | 9 | $292 |
| 4/10 | 7 | $336 |
| 4/11 | 2 | $61 |
| 4/12 | 10 | $320 |
| 4/13 | 5 | $130 |
| 4/14 | 5 | $119 |

## Listing Health
- **788 total SKUs** in seller account
- **248 items with ERROR-level issues** (31.5% of all listings!)
- **540 items clean** (no issues)

## Issue Breakdown (by category)

### 1. Color Attribute Errors (~100+ SKUs)
**Problem:** Color values don't match Amazon's standardized list. "standardized_values" and "value" fields mismatched.
**Impact:** These SKUs may be suppressed or unsearchable by color filter.
**Fix:** Update color attributes via Listings API to use Amazon-approved color names.
**Can I fix this now?** YES — via Listings API PATCH.

### 2. Image Issues (~80+ SKUs)
- **Main image has text/logo/watermark** — Amazon requires pure product photo, white background, no text overlays
- **Main image missing** — no image uploaded at all
- **Non-white background** — product image not on pure white
- **Unsupported file type** — wrong image format
**Impact:** SUPPRESSED — these products are not buyable/searchable.
**Fix:** Need new compliant product photos from Mitch's team. Can't fix via API alone.

### 3. Product Description Policy (99300) — ~10 parent SKUs
**Problem:** Descriptions contain "false/promotional claims or external links"
**Impact:** Listing suppressed.
**Fix:** Remove external links and promotional language via Listings API PATCH.
**Can I fix this now?** YES — can clean up descriptions via API.

### 4. Missing Attributes — various
- Unit Count type missing (~15 SKUs) — fix via API
- Department Name missing (~4 SKUs) — fix via API
- Product Description missing (~1 SKU) — fix via API
- Color language_tag missing (~12 grab handle SKUs) — fix via API

### 5. Compliance / Legal — CAN'T FIX VIA API
- **Fire Extinguisher certification required** (100390) — 5 SKUs need ps_fireExtinguisherMAVERi docs
- **Trademark misuse** (18146) — 3 SKUs: PVCMEDWR, TJSC0306FPBN, TJSC0306FPBU
- **Trademark on Product Detail Page** (QUALIFICATION_REQUIRED) — 4 SKUs
- **Copyright Infringement** — 1 SKU (RBFEFEH25U)
- **Order cancellation pause** — 1 SKU (C8-GIDS-XZ5F)
- **Product Compliance Certificate** — 6 fire extinguisher SKUs (FBIAMPF*)

### 6. Parent ASIN Issues — 2 SKUs
- JLBC2018F2G, JLBC2018F2B — suppressed due to parent ASIN B07Z42HMPW issues

## What I Can Fix RIGHT NOW (no Mitch needed)
1. **Color attribute fixes** — ~100 SKUs, standardize color values
2. **Description cleanup** — ~10 SKUs, remove external links/promo claims  
3. **Missing attributes** — Unit Count, Department Name, language_tag — ~30 SKUs
4. **Total fixable via API: ~140 SKUs**

## What Needs Mitch
1. **New product photos** — ~80 SKUs need compliant main images (white background, no text/logo)
2. **Fire extinguisher compliance docs** — certification paperwork for 5-6 SKUs
3. **Trademark issues** — 7 SKUs need investigation (may be using trademarked terms incorrectly)

## Priority
Fix the 140 API-fixable issues first → could unsuppress 30-50 additional products → more buyable inventory → more Amazon revenue.
