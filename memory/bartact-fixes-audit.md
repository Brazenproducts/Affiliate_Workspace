# Bartact Fixes Audit — 2026-04-20

## Source of Truth
- `reference/bartact-correct-data.md`
- `reference/affiliate-site-rules.md`

## Repos Changed

### besttruckaccessories.com
Files changed:
- `index.html`
- `best-truck-seat-covers.html`
- `best-tacoma-accessories.html`
- `best-4runner-accessories.html`

What was wrong:
- 4Runner treated as a truck instead of SUV
- Wrangler TJ Bartact image used on truck homepage
- 2005-08 Tacoma image used as main ranking image instead of newer Tacoma image
- Homepage had direct "Shop Bartact Seat Covers" button on review card
- Seat-cover page only covered 1500 trucks, missing HD trucks
- Bartact Tacoma/4Runner prices were made-up (`$650-$900`)
- Comparison table said Bartact material was just `Mil-Spec Cordura`
- Broken `DERA-BARTACT-UNIVERSAL-TAN-1.jpg` image on Tacoma/4Runner pages

Fixed to:
- 4Runner labeled `Toyota 4Runner (SUV)`
- Replaced Wrangler TJ image with Tacoma 2020-23 image
- Replaced 2005-08 Tacoma image with 2020-23 Tacoma image
- Removed direct homepage shop button; kept `See Rankings`
- Added F-250/F-350, Silverado 2500/3500, RAM 2500/3500 sections
- Tacoma price: `$420-$470 per row`
- 4Runner price: `$470-$570 per row`
- Comparison table material: `UV-protected polyester & 1000D Cordura nylon option`
- Removed broken DERA images

### whatarebest.com
Files changed:
- `index.html`

What was wrong:
- Wrangler TJ Bartact image used on a non-Jeep general site

Fixed to:
- Replaced with Tacoma 2020-23 Bartact image

### tacomaseats.com
Files changed:
- `index.html`
- `2nd-gen-seat-covers.html`
- `3rd-gen-seat-covers.html`
- `materials-compared.html`

What was wrong:
- Bartact comparison row had stale pricing (`$299-$549`)
- Bartact material shown as just `1000D Cordura`
- Material guide implied Bartact is purely all-Cordura
- Homepage verdict said `mil-spec Cordura`
- 2nd/3rd gen product descriptions described Bartact as just Cordura

Fixed to:
- Bartact Tacoma pricing: `$420-$470`
- Comparison table material: `UV-protected polyester & 1000D Cordura nylon option`
- Material guide rewritten to state Bartact uses `UV-protected polyester and/or 1000D Cordura nylon with waterproof polyurethane backing and high-grade foam`
- 2nd/3rd gen descriptions updated to same correct wording
- Homepage verdict updated from `mil-spec Cordura` to full correct material description

### wranglerseatcover.com
Files changed:
- `index.html`
- `jk-jku-seat-covers.html`
- `jl-jlu-seat-covers.html`
- `tj-seat-covers.html`
- `why-custom-fit.html`

What was wrong:
- Core Bartact feature paragraph started with `Mil-spec 1000D Cordura...` which overstates Cordura as the whole material story

Fixed to:
- Replaced with: `UV-protected polyester and/or 1000D Cordura nylon with waterproof polyurethane backing and high-grade foam, plus a real MOLLE System w/ PALS Webbing and true Bar Tack stitching...`

### autopartsreviewed.com
Files changed:
- `index.html`

What was wrong:
- ExtremeTerrain store card used a Bartact Wrangler TJ product image as if it were a store image

Fixed to:
- Replaced with non-Bartact generic storefront/vehicle image so the card no longer falsely shows a TJ seat-cover product

## Repos Checked / Clean for targeted issues
- `jeepseatcover.com` — Wrangler TJ image remains, but this is a Jeep-specific site so allowed. Core homepage material wording already correct. No `$650-$900` or DERA image issues found in live repo.
- `gladiatorseatcover.com` — Bartact wording already uses correct UV-protected polyester / Cordura phrasing in checked files.
- `bestbroncoaccessories.com` — no targeted Bartact price/image/material issue found in live repo during grep sweep.
- `bestseatcover.com` — no targeted Bartact price/image/material issue found in live repo during grep sweep.

## Notes
- Did NOT change any non-Bartact product prices (tonneau covers, lift kits, bumpers, racks, etc.) even when they legitimately contained `$900+` pricing.
- `autopartsreviewed.com` image replacement should ideally be updated later to a real ExtremeTerrain-specific image rather than a generic fallback.
- Mitch still needs to resend the exact materials chart he referenced; the chart itself was not found in memory/session logs.
