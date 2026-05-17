# Affiliate Site Audit Results

Date: 2026-04-22 UTC

## Scope audited
- topoffroadstores.com
- autopartsreviewed.com
- bestoffroadbrands.com
- bestseatcover.com
- besttruckaccessories.com
- besttonneaucovers.com
- bestbroncoaccessories.com
- gladiatorseatcover.com
- broncoseatcover.com
- tacomaseats.com
- jeepseatcover.com
- tacticalseatcovers.com
- homehvacfilters.com
- bestwindshieldwiper.com
- bestcordlesstools.com
- bestfirestick.com
- bestinstantpot.com
- bestsmokergrill.com
- bestmeshwifi.com
- bestgarageorganizer.com

## Issues found and fixed

### topoffroadstores.com
- Fixed known broken layout bug caused by an extra stray `</section>` after the comparison table.
- Synced duplicate copy at `sites/topoffroadstores-com/index.html`.
- Committed and pushed from `affiliate-sites/topoffroadstores.com`.

### tacticalseatcovers.com
- Removed all Unsplash/stock imagery from the homepage.
- Fixed one stray section/layout issue in the comparison area by wrapping the comparison block in a proper section.
- Fixed a nested product-card markup bug where the Rough Country card did not close before the Razorback card started.
- Synced duplicate copy at `sites/tacticalseatcovers-com/index.html`.
- Committed and pushed from `affiliate-sites/tacticalseatcovers.com`.

### bestseatcover.com
- Replaced Unsplash hero/background treatment with a non-stock CSS gradient approach appropriate for a vehicle-specific site.
- Repo already reflected the current safe state after upstream rebase/push activity.

### besttruckaccessories.com
- Unsplash hero issue was already resolved upstream when rebasing against remote.
- Verified index is clean and synced duplicate top-level copy.

### bestbroncoaccessories.com
- Unsplash hero issue was already resolved upstream when rebasing against remote.
- Verified index is clean.

### jeepseatcover.com
- Unsplash hero issue was already resolved upstream when rebasing against remote.
- Verified index is clean.

### bestinstantpot.com
- Unsplash hero issue was already resolved upstream when rebasing against remote.
- Verified index is clean.

### bestsmokergrill.com
- Replaced Unsplash hero with a non-stock CSS gradient treatment.
- Committed and pushed from `affiliate-sites/bestsmokergrill.com`.
- Synced top-level duplicate copy.

### bestmeshwifi.com
- Unsplash hero issue was already resolved upstream when rebasing against remote.
- Verified index is clean.

### bestgarageorganizer.com
- Unsplash hero issue was already resolved upstream when rebasing against remote.
- Verified index is clean.

### homehvacfilters.com
- Removed all Unsplash references from homepage.
- Replaced stock-style inline article thumbnails with branded gradient/info panels instead of stock photos.
- Cleared og:image stock reference.
- Synced duplicate copies at `homehvacfilters-site/index.html` and `sites/homehvacfilters-com/index.html` where applicable.

### bestwindshieldwiper.com
- Removed stock og:image reference.
- Synced duplicate copies at `bestwindshieldwiper-site/index.html` and `sites/bestwindshieldwiper-com/index.html` where applicable.

### besttonneaucovers.com
- Placeholder/duplicate-image issue was already resolved upstream by the time remote state was refreshed.
- Verified homepage no longer uses the repeated single Amazon placeholder image pattern.
- Synced top-level duplicate copy.

### autopartsreviewed.com
- Verified homepage is clean.
- Synced duplicate copy at `sites/autopartsreviewed-com/index.html`.

### bestoffroadbrands.com
- Verified homepage is clean.
- Synced duplicate copy at `sites/bestoffroadbrands-com/index.html`.

### gladiatorseatcover.com
- Verified homepage is clean and uses relevant Shopify CDN imagery.
- Synced top-level duplicate copy.

### broncoseatcover.com
- Verified homepage is clean and uses relevant Shopify CDN imagery.

### tacomaseats.com
- Verified homepage is clean and uses relevant Shopify CDN imagery.
- Synced duplicate copy at `sites/tacomaseats-com/index.html`.

### bestcordlesstools.com
- Verified homepage is clean with no Unsplash/stock-photo violations in `index.html`.
- Synced top-level duplicate copy.
- Left unrelated modified content pages alone because they were not part of this index-page audit task.

### bestfirestick.com
- Verified homepage is clean with no Unsplash/stock-photo violations in `index.html`.
- Synced top-level duplicate copy.
- Left unrelated modified content pages alone because they were not part of this index-page audit task.

## Sites that looked clean during audit
- autopartsreviewed.com
- bestoffroadbrands.com
- gladiatorseatcover.com
- broncoseatcover.com
- tacomaseats.com
- bestcordlesstools.com
- bestfirestick.com
- besttruckaccessories.com
- bestbroncoaccessories.com
- jeepseatcover.com
- bestinstantpot.com
- bestmeshwifi.com
- bestgarageorganizer.com

## Issues found but not fixed
- `wranglerseatcover.com`, `jlseatcovers.com`, and `broncograbhandles.com` were listed in the request, but matching `affiliate-sites/<domain>/` repos were not present in the workspace snapshot I audited. I did not fabricate changes for missing repos.
- A few sites have dense, hand-authored HTML patterns that can make raw open/close tag counting look suspicious, but I only changed concrete breakages I could verify in rendered structure or obvious source issues. I did not do speculative refactors.
- `bestcordlesstools.com` and `bestfirestick.com` had unrelated modified non-homepage files already present in git status. I left those untouched.

## Notes
- I avoided Unsplash and other stock-photo services on the target pages.
- For store-review sites, I kept the direction to use branded/CSS panels rather than generic stock visuals.
- For vehicle-specific sites, I kept imagery to real Shopify/Amazon CDN product assets or non-photo gradient panels.
