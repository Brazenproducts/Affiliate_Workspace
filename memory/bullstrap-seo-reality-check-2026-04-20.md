# Bull Strap SEO Diagnosis — 2026-04-20 (evening)

## TL;DR — the "slide" narrative was wrong

The position slide from 20 → 28.6 over 4 weeks **is real in the aggregate metric** but that metric is misleading. The underlying story:

1. **Bull Strap never had meaningful non-brand organic traffic.** Over 90 days, the top earning pages are all brand/info pages. The #1 earner got 13 clicks.
2. **Today's noindex change (16:42 UTC) on ~97,200 Turn 14 product pages is temporarily hurting the aggregate** because those pages had SOMETHING in impressions (even though individually low).
3. **The real problem is not ranking decay, it's low baseline.** Bull Strap barely ranks for anything non-brand.

## Proof

### 90-day top earners (from Search Console, ending 3 days ago)

| Clicks | Impressions | Pos | Page | Type |
|---|---|---|---|---|
| 13 | 1024 | 5.5 | /pages/return-policy | Info/brand |
| 10 | 5020 | 8.3 | / | Homepage / brand query |
| 10 | 267 | 8.1 | /pages/military-discounts | Info/brand |
| **8** | **99** | **25.2** | **/products/limit-straps-bullstrap** | **Own-brand money page** |
| 7 | 308 | 7.2 | /pages/contact | Info |
| 3 | 138 | 57.2 | /collections/brake-line-kits | Category |
| 3 | 96 | 34.8 | /collections/fuel-pump-hangers | Category |

**The only own-brand product page in the top 10 is `/products/limit-straps-bullstrap` at position 25.** That's the #1 revenue opportunity: getting that to position 5-10 could 10x its clicks.

### Turn 14 products that WERE earning and now noindexed

Relaxed filter to: >=2 clicks in 90d, pos <=30, >=20 impressions.
**Result: 0 Turn 14 products meet even this loose bar.**

Meaning: the noindex didn't kill any real earners. The ~200 impressions/week lost are from pages that individually contributed ~1 click/week. Noise, not signal.

## Today's noindex change assessment

**Strategically sound. Tactically has 2-6 weeks of aggregate metric turbulence.**

- 97,200 low-quality product pages noindexed → concentrates authority
- 74 thin blog posts noindexed → removes index bloat
- 421 quality pages remain indexable (own-brand products, good blogs, core pages)

Predicted outcome over 4-8 weeks (per standard Google recrawl timelines):
- Aggregate impressions drop further (~50-70%) as noindexed pages leave the index entirely
- Per-page authority on remaining 421 pages strengthens
- Non-brand rankings on quality pages should start improving
- Click count recovers once the remaining pages climb

**Do NOT reverse the noindex change.** That would re-bloat the catalog.

## Real opportunities (what to actually work on)

### 1. Get `/products/limit-straps-bullstrap` from position 25 → top 10
Currently 8 clicks from 99 impressions at position 25.2 (8% CTR).
At position 5-8 CTR jumps to ~20%+. Could earn 20-30 clicks.
Interventions:
- Rewrite title for primary "limit straps" query (check what top-ranking sites use)
- Add FAQ schema
- Add internal links from every blog post + every collection page mentioning limit straps
- Longer-form product description (2000+ words with H2s for: "how limit straps work", "what size to buy", "install guide", "when to replace")
- Video content (embed YouTube review when available)
- Backlinks from Jeep/off-road forums, affiliate sites (we already crosslinked 23 affiliate sites on 4/20 AM)

### 2. Build out 5-10 core content pillars
Blog is shallow. Need pillars that actually earn non-brand traffic:
- "How to install limit straps on Jeep Wrangler" (step-by-step)
- "Best Jeep sway bar disconnects 2026" (roundup with Bull Strap limit straps featured)
- "Jeep JL coil-over install guide" (shoulder content)
- etc.

### 3. Own-brand product catalog expansion in Shopify
Only ~296 own-brand products in the catalog. Could expand to:
- More vehicle-specific limit strap SKUs
- Paracord grab handles (Bull Strap version)
- Other small-volume high-margin adjacent products

### 4. Stop defining Bull Strap's SEO success by aggregate position
That metric is dominated by 10,000+ Turn 14 pages ranking at position 30-100.
New KPI to watch instead:
- **Non-brand clicks/week** on /products/limit-straps-bullstrap (currently ~1-2)
- **Non-brand queries with position <= 10** count
- **Limit strap category page** impressions

## Tonight's decisions (no action needed from Mitch)

✅ Do nothing to reverse the noindex
✅ Tag this finding in morning briefing so Mitch sees the context
✅ Propose 10-day work plan for Mitch to approve tomorrow

## Proposed 10-day work plan for Mitch approval

Day 1-2: Rewrite /products/limit-straps-bullstrap PDP (title, description, FAQ, schema, internal links)
Day 3-4: Write 3 high-intent blog posts targeting limit strap queries
Day 5: Add internal link structure from every Jeep/off-road related page back to PDP
Day 6: Submit all to Indexing API + IndexNow
Day 7-10: Monitor, iterate, add more pillars

Estimated lift: 10-30 non-brand clicks/week within 30 days. Not huge in absolute, but 10x the current baseline and builds compounding equity.

---

## Files
- `scripts/bullstrap-drop-analysis.js` — biggest losers prior 14d vs last 14d
- `scripts/bullstrap-disappeared-pages.js` — pages that dropped out of index
- `scripts/bullstrap-find-whitelist-candidates.js` — Turn 14 earners to whitelist
- `scripts/bs-top-clicks-debug.js` — top 30 earners debug
- `memory/bullstrap-disappeared-pages-2026-04-20.json` — checked 30 pages, 24 noindex (expected)
- `memory/bullstrap-noindex-whitelist-candidates-2026-04-20.json` — zero candidates
