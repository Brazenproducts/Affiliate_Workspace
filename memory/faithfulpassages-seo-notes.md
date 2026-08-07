# Faithful Passages — SEO Discovery Notes
**Maintained by:** Faithful Passages bot (main session)
**Purpose:** Track SEO discoveries + playbook updates between Friday 5pm PST / Monday 5am PST check-ins
**Review cycle:** Slashdaddy asks → I report → Mitch approves → implement

---

## SITE CONTEXT
- **Niche:** Prayer, scripture, Christian content
- **Target searches:** prayer guides, scripture devotionals, Christian living, Bible study, spiritual growth
- **Required on every post:** Article schema + FAQPage schema (verified via curl)
- **Indexing:** IndexNow (primary — no Google Indexing API creds for FP yet)

---

## STANDING RULES (from playbook)

1. Submit to Google Indexing API + IndexNow after every publish/update
2. Title tags: keyword FIRST, brand LAST, max 65 chars
3. Meta descriptions: 80–160 chars
4. Article schema on EVERY post — verified live, not just pushed
5. 1,500w TARGET / 1,000w minimum on every rankable page
6. Keyword must appear in first 100 words
7. Job is NOT done until verified via curl against live CDN
8. CTR benchmarks: pos 1 = 25-35%, pos 5 = 5-8%, pos 10 = 2-3% — under 1% CTR at any top-10 position = rewrite title + meta immediately
9. **No unverifiable claims** — verify exact scripture wording before publishing; never misquote or misattribute; no "all Christians believe X" without qualification; say "many Christians" or "one tradition holds" where appropriate (FP equivalent of the mil-spec rule)

---

## PLAYBOOK UPDATES LOG

### 2026-08-07 — Mil-spec rule (Slashdaddy)
- Rule: only call something mil-spec if you can cite the actual MIL spec number
- Clarification: Cordura nylon IS mil-spec — "mil-spec Cordura nylon" is accurate and allowed
- FP equivalent: never publish a scripture claim you can't verify. Always check exact verse wording. Never overstate theological consensus.

### 2026-08-07 — CTR + verification rules
- CTR under 1% at top-10 = rewrite title + meta immediately
- Keyword in first 100 words required
- Schema verified live via curl before marking done
- Never report done without verifying actual output

### 2026-08-07 — Word count raised
- Target: 1,500w per page (competitors at 1,000-1,500w — must beat them for #1)
- Minimum: 1,000w
- Rule 8: 100% of pages must meet standard — not "most"

---

## CURRENT PAGE STATUS (as of 2026-08-07)

**Total content pages: 29**
- 22/29 at 1,500w+ target ✅
- 28/29 at 1,000w+ minimum ✅
- 1/29 still under 1,000w: `prayer-for-julie-surgery.html` (864w — awaiting decision: repurpose as evergreen "prayer for surgery" or expand)
- `jeremiah-29-11-more-than-a-promise-2026-07-26.html` at 1,081w — needs ~420w more to hit 1,500w

**Schema verified live (curl):**
- Article + FAQPage confirmed rendering on all expanded pages ✅

**Banner removed:** Julie surgery dedication banner gone from homepage (verified live) ✅

---

## SEO DISCOVERIES LOG

### 2026-08-07 — Initial audit findings
- All 29 pages were under 1,000w before expansion work today — thin content across the board
- Prayers were worst: 443-565w. Songs: 531-763w. Scripture pages: 634-1,081w.
- Added to each page: scripture section (3 verses + explanations), expanded reflection (3-4 paragraphs), FAQ section with FAQPage schema, related links
- Result: 28/29 pages now 1,000w+; 22/29 at 1,500w target
- FAQPage schema adds featured snippet eligibility — "People Also Ask" for prayer/faith queries is significant traffic opportunity

### Research queue (hypotheses to validate before next check-in)
1. **PAA targeting** — prayer queries dominate "People Also Ask" boxes. Track which of our FAQs start appearing
2. **Seasonal content** — Advent, Lent, Holy Week all have predictable search spikes. Plan pages months ahead
3. **E-E-A-T for religious content** — author bio + About page authority matters more here than in product niches
4. **GSC integration** — need to wire this up to get real CTR/position data for check-ins

---

## PENDING PROPOSALS FOR COMMITTEE

*(none formally pending — awaiting Monday 5am PST check-in)*

---

## IMPLEMENTED

- Daily publishing: running continuously since 2026-07-24 (13 posts live)
- Songs page: rebuilt as card grid with filter buttons (Classic Hymns / Modern Worship / Original)
- All 28/29 content pages: expanded to 1,000w+ with scripture + FAQ + schema
- IndexNow: key file live at site root; submitting on every push
- Julie dedication banner: removed from homepage

*Updated: 2026-08-07*
