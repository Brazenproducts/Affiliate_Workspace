# Dead-Image Cleanup + Real Image Sourcing — 2026-04-20

## Final state
- **0 dead Amazon image IDs** in production HTML across all 58 sites (top-level + `affiliate-sites/`)
- **200 unique verified Amazon IDs** rendered (all curl-verified 200 OK on `m.media-amazon.com/images/I/<ID>._AC_SL1500_.jpg`)
- **0 banned-placeholder card misuse** (`61mpK93Qg0L`, `61bMNCeAUAL` only remain on legitimate "BAKFlip MX4" product cards on tonneau sites and as CSS hero backgrounds)
- **0 within-page duplicate card images** (the 2 audit "violations" remaining are known false positives: legit Bartact seat-cover images on besttruckaccessories.com index)

## Step 1: Dead-image cleanup — DONE
Stripped 200+ broken `<img>` tags referencing 60 dead Amazon IDs across 12 sites. Left text-only cards where no verified replacement was available (ratchet to be re-imaged in Step 2 work).

Tools added:
- `scripts/strip-dead-images.js` — escapes regex-special chars (`+` etc) in IDs; reads `/tmp/dead-images-all.json`
- `scripts/harvest-images-all.js` — covers BOTH top-level `*.com/` AND `affiliate-sites/*.com/` (prior harvest only saw top-level)
- `scripts/verify-harvest-all.js` — bulk HEAD checks
- `scripts/clean-empty-wrappers.js` — removes leftover empty `<div style="float:right">` wrappers

Per-site Step 1 commits + pushes:
- besttonneaucovers.com 20db426 → a080e21 (cat-card dedupe)
- cybertruckbumpers.com 07eff2f
- cybertruckseatcovers.com 2cc6710
- cybertruckstorage.com ce359ed
- cybertrucktires.com 4983c86
- r1sparts.com 1c4e3ce
- bestcordlesstools.com 11d9dc9
- jeepseatcover.com 8f98cf7
- affiliate-sites/r1tparts.com 5aa6663
- affiliate-sites/rivianaftermarket.com 6e753c2
- affiliate-sites/broncoseatcover.com 9240497
- affiliate-sites/tacomaseats.com 0fba865

## Step 2: Real image sourcing for scaffold sites — PARTIAL
Browser-sourced 80+ verified Amazon IDs across 10 categories (Bronco bumpers, Bronco roll bars, Bronco tents, Bronco MOLLE, Bronco headliner/interior/upgrade, Bronco lift, Bronco roll cage, Cybertruck bumpers/skid plates, Cybertruck seat cushions, Cybertruck tires, Cybertruck shells, Cybertruck gen-1 accessories).

Workflow used: `browser action=open url=https://www.amazon.com/s?k=...` then in-page DOM eval to extract `m.media-amazon.com/images/I/<ID>` URLs → bulk curl HEAD-verify → inject into card markup.

Sites fully re-imaged on index.html:
- broncobumper.com 5802112 (4 cards: front/rear/winch/buyer)
- broncorollbar.com ea4f7b6 (3 cards)
- broncotent.com b985c4f (4 cards)
- broncotents.com 4622b4b (4 cards)
- broncomolle.com 1e0867d (3 cards)
- broncoheadliner.com 35b38d9 (2 cards)
- broncointerior.com b5bd771 (2 cards)
- broncoupgrade.com d23e309 (3 cards)
- broncolift.com fc4076d → d52193e (4 cards, then dedupe)
- broncorollcage.com 253971d (4 cards)
- cybertruckbumpers.com 86686e8 (26 review-card img-wrap slots filled across index + 3 subpages)
- cybertruckgen1.com b1bc57a (4 cards)
- cybertruckseat.com 268190a (3 cards)
- cybertruckshell.com 23c632e (4 cards)
- cybertrucktires.com 51699cf (4 cards)

Tooling added:
- `scripts/fill-img-wraps.js` — reusable img-wrap slot filler with cursor-rotation for uniqueness
- `scripts/inject-bronco-scaffold-images.js` — per-site inject plan

## Step 3: besttonneaucovers.com index re-image — DONE
8 truck-vehicle cards each got a unique verified tonneau image (F-150 → Tyger T1, RAM 1500 → Gator ETX, Silverado → Extang Solid Fold, Tacoma → RetraxPRO XR, Tundra → Tyger T3, Gladiator → Gator EFX, Colorado → Rough Country Hard Tri-Fold, Ranger → Extang Trifecta). Also fixed two existing miscategorized cat-cards (Hard Fold → UnderCover Armor Flex; Retractable → Roll-N-Lock M-Series). Commit a080e21.

## Step 4: Verification — CLEAN
Final `harvest-images-all.js + verify-harvest-all.js`: `verified=200 dead=0`.
Final `duplicate-image-audit.js`: 1 site with 1 real-but-known-false-positive (besttruckaccessories.com Bartact warning).
Output at `/tmp/duplicate-image-audit.md`.

## Not done (handoff for next session)
1. **Subpage cards on most bronco scaffold sites** still text-only (only index.html got re-imaged). Need to source per-page (e.g., broncobumper.com/best-front-bumpers.html etc — each subpage was a 0-img scaffold). That's ~80+ more pages. The infrastructure (search → verify → inject) is now established and reusable.
2. **r1*parts.com / r2*parts.com / scoutruvparts.com / scoutsuvparts.com / scoutterraparts.com / slatetruckparts.com / sportadventurevehicleparts.com / ramrevparts.com** — none re-imaged this pass. Same scaffold pattern; same workflow applies.
3. **Bronco/Cybertruck SUBPAGE deep review cards** — only cybertruckbumpers.com had its subpages filled (via `img-wrap` slot pattern). Other cybertruck sites with "review-card" markup may also have empty img slots from the prior strip pass.
4. **EV chargers** category — not sourced this pass.

## Counts
- Sites touched (Step 1 cleanup): 12
- Sites re-imaged (Step 2 + 3): 16
- Total commits this session: 29
- Verified IDs net-added to network: 200 - 117 = +83 new verified IDs
- Dead IDs eliminated: 60 → 0

## Hard rules followed
1. Every injected ID was curl-verified 200 OK before injection.
2. Vehicle/category-appropriate sourcing (Bronco IDs from "Ford Bronco X" searches, Cybertruck from "Cybertruck X").
3. Each page's cards have unique IDs (rotation cursor in `fill-img-wraps.js`; per-card explicit lists in `inject-bronco-scaffold-images.js`; deduped 1 broncolift collision after audit).
4. Banned placeholders (`61mpK93Qg0L`, `61bMNCeAUAL`) never injected as new images. Existing legitimate uses (BAKFlip MX4 product cards, hero CSS) left in place.
5. Per-site commits with descriptive messages; pushed to GitHub Pages individually.
