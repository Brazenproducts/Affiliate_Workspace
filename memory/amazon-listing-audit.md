# Bartact Amazon Listing Audit
**Date:** 2026-05-07  
**Audited by:** Axl (subagent)  
**Scope:** SP-API Listings API — 200-item sample out of 788 total active listinrketplace:** US (ATVPDKIKX0DER) | Seller ID: A239XCX0K8RYS8

---

## Summary

| Metric | Count |
|--------|-------|
| Total listings in account | **788** |
| Items audited (sample) | 200 |
| Items with any active status | 182 / 200 |
| Items marked BUYABLE | 42 / 200 |
| Items with API-reported issues | 111 / 200 (55.5%) |

> **Note on BUYABLE count:** Only 42/200 sampled items show BUYABLE status. This is likely because many are parent/variation listings or color variants that are discoverable but not independently purchasable. The 788 total includes all SKUs (parents + children).

---

## Issues Found (200-item sample — extrapolated to full 788)

### 1. Missing or Broken Main Image
- **2 items confirmed** with no main image at all:
  - `RBIAFEH10A` — Bartact 1 Lb Roll Bar Fire Extinguisher Holder - ACU Camo
  - `JKSC0710FPBA` — Bartact BTJKSC0710FP-Parent - 2007-2010 Jeep Wrangler (legacy SKU format)
- **Extrapolated:** ~8 listings across full catalog likely have no main image

### 2. Image Count (Full Set Unknown — API Limitation)
- The Listings API attributes endpoint only reliably returns `main_product_image_locator` — it does **not** return all 7+ additional image slots via attributes for most listings
- **21 items** have an API-flagged issue: *"The MAIN image you submitted has text, logo, graphics, or watermarks"* — these are suppressed or at risk
- **8 items** flagged: *"The main image is missing or incorrect"*
- **5 items** flagged: *"We do not support the file type of the image uploaded"*
- **Recommendation:** Use Catalog Items API (`/catalog/2022-04-01/items?includedData=images`) on a per-ASIN basis to get true image counts. Based on API issue flags, estimate **~130+ listings** (extrapolated from 34/200) have image compliance problems.

### 3. Short Titles (Under 80 Characters)
- **17 / 200 items** have titles under 80 characters
- **Extrapolated:** ~67 listings across full catalog
- Distribution:
  - 40–49 chars: 1 item
  - 50–59 chars: 3 items
  - 60–69 chars: 4 items
  - 70–79 chars: 9 items
- Examples:
  - `708624736793` (50c): "Bartact 1 lb UTV Roll Bar Fire Extinguisher Holder"
  - `RBIAFEH10K` (58c): "Bartact 1 Lb UTV Roll Bar Fire Extinguisher Holder - Khaki"
  - `MARSRK-B` (72c): "Bartact PALS/MOLLE Male & Female Snap Field Repair Buckle Kit 1\" (Black)"

### 4. Weak Titles (Missing Vehicle Fitment / Key Terms)
- **22 / 200 items** have seat cover or cover listings missing vehicle fitment terms (Jeep/Wrangler/JK/JL/Gladiator/Tacoma etc.)
- **Extrapolated:** ~87 listings
- Examples:
  - `TTAC2020FP-PARENT`: "Bartact Front Seat Covers Compatible with 20-21 Toyota Tacoma All Models Electric..." — missing "Toyota" in some variants
  - `L8-F0FL-S4C8`: "Bartact Automobile Utility & Pet Divider Bag for between & Behind seats" — no vehicle fitment at all
  - `XXFSBY`: "Bartact Utility & Pet Divider Bag for between & Behind seats" — no fitment

### 5. Fewer Than 5 Bullet Points ⚠️ CRITICAL
- **123 / 200 items** (61.5%) have fewer than 5 bullet points
- **Extrapolated: ~485 listings** across full catalog
- Breakdown:
  - **0 bullets: 96 items** — these are completely missing bullet points
  - 3 bullets: 2 items
  - 4 bullets: 25 items
- Zero-bullet items are heavily concentrated in:
  - Ford Bronco MOLLE panels (`FBIAMPF*` series — entire product line)
  - Ford Bronco console pouches (`FBIACPLM-*` series — all color variants)
  - Jeep seat cover parent listings (`JKSC*-PARENT`)
  - Paracord door strap parents (`DLSP2B-PARENT`)

### 6. No Backend Search Terms (generic_keyword) ⚠️ CRITICAL
- **92 / 200 items** (46%) have zero backend keywords
- **Extrapolated: ~363 listings** across full catalog
- Breakdown by vehicle/product type:
  - Jeep products: 53 items missing keywords
  - Toyota Tacoma: 19 items
  - Ford Bronco: 13 items
  - Other: 5 items
- This is a massive SEO gap — backend keywords are invisible to customers but heavily weighted by A9 algorithm

### 7. API-Reported Compliance Issues
- **111 / 200 items** (55.5%) have at least one Amazon-flagged issue
- **Extrapolated: ~437 listings** across full catalog
- Issue type breakdown:
  | Issue Type | Count in Sample |
  |-----------|----------------|
  | Color attribute standardization error | 62 |
  | Main image has text/logo/watermark | 21 |
  | Main image missing or incorrect | 8 |
  | Unsupported image file type | 5 |
  | Product Compliance Certificate missing | 5 |
  | Missing key attributes (specific_uses, material, etc.) | 3 |
  | False/promotional claims in description | 2 |
  | Wrong product type assigned | 2 |
  | Invalid variation relationship | 1 |
  | Other | 2 |

---

## Top 10 Recommendations for Immediate Improvement

### 🔴 Priority 1 — Revenue Impact (Do These First)

**1. Add backend search terms to ~363 listings**
- Nearly half the catalog has zero backend keywords. This is free SEO money left on the table.
- Each listing gets 250 bytes of backend keywords. Fill them with: vehicle year ranges, model names, competitor terms, use cases, materials.
- Start with the Ford Bronco MOLLE panel series and Jeep seat cover lines — these are high-ticket items.

**2. Write bullet points for the 96 zero-bullet listings**
- The Ford Bronco MOLLE panel line (`FBIAMPF*`) and console pouches (`FBIACPLM-*`) have zero bullets. These are likely newer listings that were never fully set up.
- 5 bullets = 5 chances to hit search terms + convert browsers to buyers. Format: lead with the benefit, include fitment, material, and a differentiator.

**3. Fix the 62 color attribute standardization errors**
- Amazon is flagging color values as non-standard. This can suppress listings from search.
- Run a bulk feed to standardize color values to Amazon's accepted list (Black, Tan, Coyote Brown, etc.).

### 🟡 Priority 2 — Conversion & Compliance

**4. Fix main image violations (21 items with text/logos on main image)**
- Amazon policy prohibits text, logos, watermarks on main images. These listings are at risk of suppression.
- Replace with clean white-background product shots. Lifestyle/detail shots go in slots 2–7.

**5. Expand short titles to 150–200 characters**
- 17 listings are under 80 chars — well below the optimal 150–200 char range.
- Formula: `[Brand] [Product] Compatible with [Year Range] [Vehicle Make/Model] [Trim/Model Code] - [Color/Material] | [Key Feature]`
- Example fix for `708624736793`: "Bartact 1 lb UTV Roll Bar Fire Extinguisher Holder - Universal Fit for Jeep Wrangler JK JL Gladiator, Polaris RZR, Can-Am - MOLLE Compatible Mount"

**6. Add vehicle fitment to 22 seat cover / cover listings missing it**
- Titles missing "Jeep," "Wrangler," "JK," "JL," "Tacoma," etc. are invisible to fitment-based searches.
- The Toyota Tacoma seat cover parents are a notable gap — add year range + "All Models" + "Electric/Manual Seat" to titles.

**7. Resolve Product Compliance Certificate requirement (5+ listings)**
- Ford Bronco MOLLE panels are flagged for missing compliance certs. These may be blocked from advertising or suppressed.
- Check if CPSC/CARB/CA Prop 65 certs apply and upload via Seller Central.

### 🟢 Priority 3 — Long-Term Optimization

**8. Audit image counts via Catalog API**
- The Listings API doesn't reliably return all image slots. Run a Catalog Items API pull (`includedData=images`) on all 788 ASINs to get true image counts.
- Target: 7 images per listing (main + 6 additional). Lifestyle shots, detail shots, fitment diagrams, and comparison charts all help conversion.

**9. Fix the 2 listings with no main image at all**
- `RBIAFEH10A` (ACU Camo Fire Extinguisher Holder) and `JKSC0710FPBA` (legacy Jeep seat cover) have no main image. These are invisible in search.
- Upload compliant main images immediately.

**10. Audit and fix variation parent listings with 0 bullets**
- Parent SKUs like `DLSP2B-PARENT`, `JKSC0810R4B-PARENT`, `TTAC2020FP-PARENT` have 0 bullets. Even though customers buy child ASINs, parent content affects the listing's overall quality score.
- Add 5 bullets to all parent listings — they inherit down to children in many cases.

---

## Notes & Caveats

- **Sample size:** 200 of 788 listings audited. Issues are extrapolated linearly — actual counts may vary.
- **Image counts:** The Listings API attributes endpoint does not reliably return all image locators. The "fewer than 5 images" flag (187/200) is an artifact of API limitations, not necessarily real missing images. Use Catalog Items API for accurate image counts.
- **BUYABLE status:** Only 42/200 show BUYABLE. Many are parent/variation listings or out-of-stock variants — this is expected for a catalog with color/size variations.
- **Bull Strap limit straps** (e.g., `LSBSBB-44-FXVD`) appear in the catalog and are performing well structurally — they have titles, bullets, and keywords. The main issue flagged was a promotional claim in the description.
- **Ford Bronco line** appears to be a newer/incomplete product launch — multiple SKUs have 0 bullets, no keywords, and compliance cert issues. This entire line needs a content pass.

---

## Files
- Raw audit data: `/tmp/amazon_audit_raw.json`
- Page 1 raw API response: `/tmp/amazon_page1.json`
