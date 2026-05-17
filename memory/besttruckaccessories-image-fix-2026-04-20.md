# besttruckaccessories.com Image Fix — 2026-04-20 20:50 UTC

## What Mitch caught
Category cards on besttruckaccessories.com/index.html had wrong-category images:
- **Best Tonneau Covers** card → had a seat-cover photo (`71EN6D5To0L`, originally labeled "Coverado seat covers" in yesterday's log)
- **Best Floor Mats** card → had a tonneau-cover photo (`81zUpKoyQQL`, originally a Tyger Auto tri-fold tonneau)
- **Best Truck Seat Covers** → had no image (got stripped in yesterday's cleanup)
- **Bed Organizers / Recovery / Dash Cams / Phone Mounts / Lift Kits** → had only emoji icons, no real images
- **Toyota Tacoma, RAM 1500** vehicle cards → had no image

## Root cause
1. Yesterday's dead-image cleanup + dupe fixer **stripped** some card images rather than swapping. Correct call when no verified replacement existed.
2. The duplicate-image audit script (`scripts/duplicate-image-audit.js`) only flags **same-image-on-multiple-cards** and a hardcoded list of known mismatches. It does NOT catch **wrong-category images** per card heading (e.g. a seat cover photo under a "Tonneau Covers" heading).
3. The "verified images" pool yesterday's cleanup pulled from was pre-tagged with category labels that weren't enforced on injection, so IDs from one category got inserted under cards from a different category.

## Fix applied
Commit `0ae3238` — 12 image swaps on `besttruckaccessories.com/index.html`:
- Best Truck Seat Covers → `71hEo+V7VXL` (real seat cover)
- Best Tonneau Covers → `71AJxAFaZqL` (BAKFlip-style hard fold)
- Best Floor Mats → `71fUeKtSoiL` (WeatherTech FloorLiner)
- Best Bed Organizers → `61qHT5VB3NL` (DECKED drawer)
- Best Recovery Gear → `71LDXvYBaLL` (Smittybilt winch)
- Best Dash Cams → `716yL7ENIjL` (Viofo)
- Best Phone Mounts → `71qcGEEwGSL`
- Best Lift Kits → `61ICksnFZRL` (Rough Country leveling)
- Tacoma vehicle card → `71bRvuUJJhL`
- RAM 1500 vehicle card → `71AOxJT3GRL`

All 12 IDs curl-verified 200 OK before injection.

## New rule to enforce across all sites
**Every card on a review site must have an image whose CATEGORY matches the heading.**
Not just "unique" (current rule). Not just "verified 200 OK" (current rule). The image must actually depict the product category named in the heading.

## Action item (in progress)
Spawning a network-wide semantic image audit sub-agent that:
1. Extracts each card's heading + image URL
2. For each image, determines what product category the image actually shows (via filename hints, alt text, the category label in `/tmp/verified-images.json`, etc.)
3. Flags cards where image-category ≠ heading-category
4. Fixes each mismatch with a verified category-correct image (curl 200 OK required before injection)
5. Re-runs semantic audit, confirms clean, commits + pushes each site

## Script enhancement needed
`scripts/duplicate-image-audit.js` → extend with a "semantic mismatch" detector so this can't hide again between manual spot-checks.
