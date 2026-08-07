# SkipATip SEO Notes

## ✅ IndexNow Key File — FIXED 2026-08-08
- Key file `b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5.txt` now live at root via `public/` directory
- Verified: `curl https://www.skipatip.com/b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5.txt` returns the key
- **ALL prior IndexNow submissions were silently discarded** (key file didn't exist — returns 202 regardless)
- First valid bulk submission: 190 URLs submitted 2026-08-08
- Future submits will work properly

## ✅ Word Count Audit — 2026-08-08
Scope: **162 rankable pages** (80 blog + 72 guides + 10 tipping-laws)

| Tier | Count | Status |
|------|-------|--------|
| 🚨 Under 500w | 0/162 | Fixed Charlotte, Minneapolis, Philadelphia, SF |
| ⚠️ 500-999w | 27/162 | Next batch — in progress |
| ✅ 1,000-1,499w | 104/162 | Meets minimum |
| 💪 1,500w+ | 31/162 | Meets target |

**135/162 pages at 1,000w minimum. 0% done when 162/162 hit 1,500w target.**

### 27 Pages Under 1,000w (next batch — priority order):
1. `blog/tip-free-restaurants-new-york-city` — 958w (major market)
2. `guides/temecula-ca` — 958w (home market)
3. `guides/phoenix-az` — 993w (close)
4. `blog/tip-free-restaurants-chicago` — 823w (major market)
5. `blog/restaurant-tipping-statistics-2026` — 908w
6. `blog/restaurants-eliminating-tips` — 983w
7. `blog/tip-culture-out-of-control` — 923w
8. `blog/counter-service-vs-full-service-tipping` — 931w
9. `blog/best-no-tip-restaurants-near-me-2026` — 937w
10. `blog/how-to-avoid-tip-screens` — 828w
11. `blog/no-tip-restaurants-near-me` — 856w
12. `blog/does-jack-in-the-box-have-tip-screens` — 881w
13. `blog/does-del-taco-have-tip-screens` — 894w
14. `blog/tip-free-restaurants-champaign-il` — 640w
15. `guides/sacramento-ca` — 608w
16. `guides/austin-tx` — 629w
17. `blog/tip-free-fast-food-chains` — 708w
18. `blog/best-drive-thru-restaurants-no-tip` — 1,446w (actually hits minimum already)
19. `tipping-laws/california` — 798w
20. `tipping-laws/new-york` — 749w
21. `tipping-laws/texas` — 659w
22. `tipping-laws/colorado` — 935w
23. `tipping-laws/florida` — 995w
24. `tipping-laws/illinois` — 940w
25. `tipping-laws/nevada` — 953w
26. `tipping-laws/oregon` — 949w
27. `tipping-laws/washington` — 917w

## SEO Playbook Section 8 Applied (2026-08-08)
- **CTR < 1% at positions 1-10 = rewrite title + meta immediately**
  - Benchmarks: pos 1 = 25-35%, pos 5 = 5-8%, pos 10 = 2-3%
  - No GSC data yet for SkipATip — need to connect Google Search Console
- **Keyword must appear in first 100 words** — verified on all 4 fixed pages ✅
- **Always verify schema rendering with curl** — metafield ≠ rendering, 202 from IndexNow ≠ valid submission

## Key Gaps Still Open
- **Zero Google Search Console data** — flying blind on rankings, CTR, impressions
- **No Google Indexing API** for skipatip.com — using IndexNow only (covers Bing/Yandex but not Google)
- **No schema markup** on any SkipATip pages — LocalBusiness + FAQPage would help ranking
- **Static city pages** — `/restaurants/[city]-[state]` needed for "tip-free restaurants [city]" keyword
- **IndexNow was silently broken** from day 1 — fixed 2026-08-08

## Competitor Analysis
- Zero competition for "tip-free restaurants [city]" and "no tip screen restaurants [city]"
- Yelp/Google dominate "restaurants [city]" — can't compete on that
- "tip-free restaurants near me" — SkipATip has unique angle nobody else has
- These are completely uncontested keywords; we just need pages Google can find and read

## Strategy
1. Static city pages: `/restaurants/temecula-ca` etc. (query strings won't rank)
2. Fix all 27 pages under 1,000w 
3. Add FAQPage schema to blog posts and guides
4. Connect Google Search Console to get real data
5. IndexNow daily submission script for new content
