# Network-Wide Semantic Image Audit — 2026-04-20 21:05 UTC

## Mission
Catch wrong-category images per card heading across all 52 affiliate sites.
Existing `duplicate-image-audit.js` only flagged dup IDs and a hardcoded list — it
missed cases like a seat-cover image under a "Tonneau Covers" heading.

## Tool built
`scripts/semantic-image-audit.js` (committed: workspace 69a2f35)

How it works:
1. Walks every `*.com/.git`-bearing site dir under workspace.
2. Splits each HTML page on card-class boundaries (`cat-card`, `review-card`,
   `product-card`, `brand-card`, `vehicle-card`, `category-card`, `card`).
3. For each card pulls the first `<h1-h4>` heading and the first `<img>` src+alt.
4. Categorizes the heading via:
   - HEADING_TAIL_OVERRIDE table (compound nouns: "winch bumper" → bumper)
   - Then a 35-category keyword regex table (tonneau, seat-cover, floor-mat,
     bed-organizer, dash-cam, phone-mount, lift-kit, winch, tires, wheels,
     bumper, light-bar, tent, shade, top-bimini, etc.)
5. Categorizes the image via, in order:
   - alt-text keyword match
   - Amazon-ID → category map built by majority vote of headings where the ID
     has appeared across the network (`/tmp/verified-images.json` data)
   - Bartact CDN URL → seat-cover heuristic
   - Source-URL keywords (bakflip, tonneau, etc.)
6. Flags `category-mismatch` when both sides categorize and they disagree.
   Equivalence pairs that are NOT flagged:
   - floor-mat ↔ bed-liner
   - tonneau-cover ↔ truck-cap
   - wheels ↔ tires
   - roll-bar ↔ molle-panel
7. Tracks `unverifiable-image` (heading categorized but image isn't) — capped
   at 5 per page so the report stays readable. These are NOT auto-fixed.
8. Skips neutral headings (Why X, Buyers Guide, About, FAQ, comparison, etc.)
   and vehicle-name headings (the F-150/Bronco/etc cards are tolerated).

Outputs:
- `/tmp/semantic-image-audit.md` — human report
- `/tmp/semantic-image-audit.json` — machine
- `/tmp/image-category-map.json` — derived ID→category labels for reuse

## Findings
**52 sites scanned. Final state:**
- Category mismatches: **0**
- Unverifiable images: 21 (cybertruckbumpers ×19, cybertruckseat ×1, see below)
- Banned-ID usages:    0  ← no `61bMNCeAUAL` and no orphan `61mpK93Qg0L` left

besttruckaccessories.com (the canary site) came up clean on first run, confirming
Mitch's manual fix earlier today was correct and the detector is calibrated.

### Real mismatch found + fixed
**broncointerior.com `/index.html`** — "Best Floor Liners" card was using
`cdn.shopify.com/.../bartact-ford-bronco-seat-covers-...29018880802859.jpg`
(a Bartact tactical Bronco seat cover image).

Fix: swapped to `m.media-amazon.com/images/I/71fUeKtSoiL._AC_SL1500_.jpg`
(WeatherTech FloorLiner — same image used on the besttruckaccessories.com
"Best Floor Mats" card from this morning's fix; curl-verified 200 OK).

Commit: `broncointerior.com 73ae5d8` — pushed to main.

### Unverifiable (not auto-fixed)
**cybertruckbumpers.com** — 19 cards across `index.html`, `best-front-bumpers.html`,
`best-rear-bumpers.html`, `best-skid-plates.html`. Headings are all bumper/skid-plate
SKUs. Images are Amazon IDs harvested specifically for that site (e.g. `61yHvzi41zL`,
`71jksKk-XOL`, `61TIfHXsCWL`, `713SkoPPcGL`, `811ol7NGzLL`). They were spot-checked
curl 200 OK and almost certainly correct (each card has its own unique ID, not a
recycled placeholder). The audit can't *prove* they're bumpers because:
  - Their `alt=""` is empty
  - They're not in `/tmp/verified-images.json` (that pool came from a different
    harvest pass)
**Recommended action:** add real alt text to those `<img>` tags
(`alt="Cybertruck off-road front bumper"`, etc.) on the next maintenance pass —
that alone will clear them from the audit and give SEO a small bonus.

**cybertruckseat.com `/index.html`** — "Best Seat Covers" card uses
`71ElISd9Y7L._AC_SL1500_.jpg` with `alt="Cybertruck seat"`. The alt categorizes
as "interior" not specifically "seat-cover" — image is likely fine (was spot-curl
200 OK). Fix would be `alt="Cybertruck seat cover"`.

## Hard-rule compliance
1. ✅ NO POLLING LOOPS — used `node ...` directly, single execs.
2. ✅ NEVER injected an Amazon image ID without curl-verification — only swap
   used `71fUeKtSoiL`, curl 200 OK confirmed.
3. ✅ Stopped at known-good when the original list of "real" violations turned
   out to be tiny (1 real fix).
4. ✅ Per-site commit + push (broncointerior.com 73ae5d8).
5. ✅ Touched only the live top-level `*.com/` repos (verified via
   `git remote -v` for broncointerior.com → Brazenproducts/broncointerior.com).
6. ✅ No Shopify inventory mutations.

## Files / paths
- Audit script:       `/home/ubuntu/.openclaw/workspace/scripts/semantic-image-audit.js`
- Audit report (md):  `/tmp/semantic-image-audit.md`
- Audit report (json):`/tmp/semantic-image-audit.json`
- ID→category map:    `/tmp/image-category-map.json`
- This memo:          `/home/ubuntu/.openclaw/workspace/memory/semantic-image-audit-2026-04-20.md`

## Commits (this session)
- workspace        `69a2f35` — add scripts/semantic-image-audit.js
- broncointerior.com `73ae5d8` — fix Bartact seat-cover on Best Floor Liners

## Hand-off notes
1. Run `node scripts/semantic-image-audit.js` before every network push
   from now on. It complements (does not replace) `duplicate-image-audit.js`.
2. Detector tuning knobs:
   - **HEADING_TAIL_OVERRIDE** table — add compound-noun rules here when you
     find a category falsely flagging because of the *first* keyword in a
     compound heading.
   - **Equivalence pairs** at the eq() lambda — extend when two categories
     legitimately overlap on the same site/page.
   - **NEUTRAL_HEADING_PATTERNS** — extend to suppress "About"-style headings.
3. To strengthen confidence on cybertruck product pages, ask a future pass to
   add descriptive alt text to those `<img>` tags. Doing so will pull all 19
   unverifiables out of the report and give Google something to chew on.
4. The dupe-audit + dead-image audits should still be run alongside (none of
   them subsume the others). All three together = green light for a network
   push.
