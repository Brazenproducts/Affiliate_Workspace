# Affiliate Site Issue Patterns to Prevent Recurrence

Last updated: 2026-04-20 21:00 UTC

This file is the "don't do dumb shit twice" list for affiliate-site builds and maintenance.
Every new site build, image pass, or cleanup pass should check against this list.

## 1. Duplicate image reuse across cards on the same page
**Pattern:** same Amazon ID / Shopify CDN image used on multiple vehicle or category cards.
**Examples:**
- besttruckaccessories.com used the same BAKFlip MX4 photo across multiple vehicle cards before fix
- scaffold sites reused `61mpK93Qg0L` across whole homepages
**Risk:** looks lazy, lowers trust, wrong visual match to user intent.
**Prevention:** run `node scripts/duplicate-image-audit.js` before push.

## 2. Wrong-category image under the right heading
**Pattern:** image is real and live, but depicts the wrong product category for the card.
**Examples:**
- besttruckaccessories.com: seat-cover photo under "Best Tonneau Covers"
- besttruckaccessories.com: tonneau-cover photo under "Best Floor Mats"
- broncointerior.com: Bartact Bronco seat-cover image under "Best Floor Liners"
**Risk:** Mitch catches it instantly; kills credibility.
**Prevention:** run `node scripts/semantic-image-audit.js` before push.

## 3. Dead / hallucinated Amazon image IDs
**Pattern:** image URL 404s because the Amazon ID was invented or copied wrong.
**Examples:** 60 dead IDs found on 2026-04-20 network cleanup.
**Risk:** broken-image icons on production.
**Prevention:** every Amazon image ID must be curl-verified 200 OK before injection.

## 4. Missing images after cleanup strips
**Pattern:** cleanup removes bad image but no good replacement gets sourced.
**Examples:** Tacoma and RAM 1500 cards on besttruckaccessories.com had no images after earlier cleanup.
**Risk:** pages feel unfinished, especially on homepage category/vehicle cards.
**Prevention:** after strip pass, do a targeted re-image pass for every empty high-visibility card.

## 5. Wrong live repo / stale mirror confusion
**Pattern:** changing `sites/` or stale `affiliate-sites/` copy instead of the live repo.
**Examples:** topoffroadstores.com had multiple copies in workspace.
**Risk:** fix appears done locally but never goes live.
**Prevention:** always verify live repo with `git remote -v` before editing/pushing.

## 6. Bad external destination URLs
**Pattern:** outbound merchant/store links point at dead or wrong domains.
**Examples:** topoffroadstores.com Kartek link was wrong twice before final correction to `https://www.kartek.com`.
**Risk:** obvious broken UX, lost clicks, lost trust.
**Prevention:** curl/GET verify external domains before publishing store links.

## 7. Bartact material wording drift
**Pattern:** shorthand or made-up wording like "Mil-Spec Cordura" as the whole material story.
**Risk:** factually wrong, Mitch notices immediately, legal/liability risk.
**Prevention:** exact wording only: "UV-protected polyester and/or 1000D Cordura nylon option, waterproof polyurethane backing, high-grade foam, Berry Compliant, MOLLE panels."

## 8. Made-up pricing / product data
**Pattern:** guessed prices or specs in comparisons.
**Risk:** factual errors, legal/commercial risk.
**Prevention:** Bartact prices only from `reference/bartact-correct-data.md` / verified Shopify data.

## 9. Empty / weak alt text on product cards
**Pattern:** image exists but `alt=""` or generic alt text prevents validation and weakens SEO.
**Examples:** cybertruckbumpers.com cards remained "unverifiable" in semantic audit because alt text was empty.
**Risk:** harder automated QA + weaker image SEO/accessibility.
**Prevention:** every product/category image gets descriptive alt text tied to the card heading.

## 10. Homepage review-site CTA misuse
**Pattern:** homepage vehicle/category cards link directly to merchant/shop instead of internal roundup pages.
**Risk:** hurts review-site trust + bad funnel structure.
**Prevention:** homepage cards should link to internal review pages ("See Picks/Rankings →"), not direct-buy buttons.

## Standard pre-push QA for affiliate sites
Run all three before major pushes:
1. `node scripts/duplicate-image-audit.js`
2. `node scripts/semantic-image-audit.js`
3. `node scripts/harvest-images-all.js && node scripts/verify-harvest-all.js`

Plus manual spot checks on:
- homepage category grid
- homepage vehicle grid
- top money page
- one subpage with multiple review cards

## If Mitch catches a new pattern
Add it here immediately with:
- what happened
- why it happened
- how to detect it automatically next time
