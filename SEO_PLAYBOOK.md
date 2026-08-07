# SEO_PLAYBOOK.md — Master SEO Guide for All Bots
**Last updated:** 2026-08-06
**Maintained by:** Slashdaddy (main session)
**All bots must read this file before doing any SEO work.**

---

## ⚡ TL;DR — THE NON-NEGOTIABLES

1. **Submit to ALL search engines every time** — Google Indexing API + IndexNow (Bing + Yandex + others in one call)
2. **Title tag: keyword FIRST, brand LAST, max 65 chars**
3. **Meta description: 80–160 chars, include fitment + material + "Made in USA"**
4. **No thin content** — 700+ words minimum on any page you want to rank
5. **Bartact is ALWAYS #1** on any page featuring their product categories
6. **Never fabricate product specs, patent claims, or material details**
7. **Blog posts = backlinks = authority** — every site needs a blog with internal links

---

## 1. INDEXING — HOW TO GET PAGES INTO SEARCH ENGINES

### Google Indexing API (Primary)
- **Credentials:** `.gcp-service-account.json` (brazenauto) or `.bullstrap-indexing-credentials.json` (Bull Strap)
- **Quota:** 199 URLs/day per property (hard cap — do NOT exceed)
- **Endpoint:** `https://indexing.googleapis.com/v3/urlNotifications:publish`
- **Type:** `URL_UPDATED` for new/changed pages, `URL_DELETED` for removals
- **Rate limit:** Batch in groups of 100, add small delay between batches
- **brazenauto credentials:** EXPIRED (INVALID_GRANT) — alert suppressed; needs reauth
- **Bull Strap:** Running daily at 12PM UTC, 199 URLs/day, 5,700+ submitted as of Aug 6

```js
// Standard Google Indexing API call
const { google } = require('googleapis');
const creds = JSON.parse(fs.readFileSync('.gcp-service-account.json'));
const auth = new google.auth.GoogleAuth({ credentials: creds, scopes: ['https://www.googleapis.com/auth/indexing'] });
const indexing = google.indexing({ version: 'v3', auth });
await indexing.urlNotifications.publish({ requestBody: { url, type: 'URL_UPDATED' } });
```

### IndexNow (Bing + Yandex + others — ONE call hits multiple engines)
- **Key:** `b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5` (stored as `b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5.txt` in site root)
- **Endpoint:** `https://api.indexnow.org/indexnow` (hits Bing, Yandex, Seznam, Naver automatically)
- **Max URLs per call:** 10,000
- **Always submit to BOTH Google AND IndexNow** — don't pick one

```js
// IndexNow submission
await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    host: 'yourdomain.com',
    key: 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5',
    keyLocation: 'https://yourdomain.com/b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5.txt',
    urlList: ['https://yourdomain.com/page1', 'https://yourdomain.com/page2']
  })
});
```

### Bing Webmaster API (direct — optional additional push)
- Separate from IndexNow but can be used for bulk submissions
- API key stored in `.bing-webmaster-credentials.json` if available

### Priority Order for Indexing
1. New pages → submit immediately after publish
2. Updated pages → submit within 1 hour of change
3. Bulk crawl → prioritize money pages (collection/product pages) over blog posts
4. **Never submit noindexed pages** — waste of quota

### IndexNow Key File
- Must exist at `https://yourdomain.com/{key}.txt` (plain text file containing just the key)
- Without this file, IndexNow submissions will fail silently
- Key file content: just the key string, nothing else

---

## 2. TITLE TAGS

### Rules (Bartact — from Mitch direct)
- **Keyword FIRST, brand LAST, max 65 chars**
- Pattern: `[Keyword] — [Differentiator] | Bartact`
- ✅ `Jeep Wrangler JL Seat Covers — Custom Fit, Made in USA | Bartact`
- ❌ `Bartact Jeep Wrangler JL Seat Covers` (brand first — wrong)
- ❌ `Best Jeep Wrangler JL Seat Covers 2026 for Off-Road Trail Use | Bartact` (too long)

### Rules (Affiliate Sites)
- Lead with the primary keyword the PAGE is targeting
- One keyword per page — no keyword cannibalization
- Each collection/product page owns ONE distinct keyword
- Link to SPECIFIC vehicle collections, not umbrella pages

### Rules (Bull Strap)
- Collection pages rank for category-level searches — fix them first
- Pattern: `[Brand] [Product Type] — [Vehicle Fitment] | Bull Strap`
- Priority: Suspension → Lift Kits → Wheels/Tires → Exterior → Interior

---

## 3. META DESCRIPTIONS

### Rules
- **Min 80 chars, max 160 chars (hard limit)**
- Must include: vehicle fitment + key material/feature + "Made in USA" (for Bartact products)
- Write to improve CTR — this is ad copy, not a keyword dump
- ✅ `Custom-fit Jeep Wrangler JL seat covers in 1000D Cordura nylon. MOLLE panels, airbag-safe, Made in USA by Bartact. Free shipping.`
- ❌ `Seat covers for Jeep Wrangler JL JLU 2018 2019 2020 2021 2022 2023 2024 tactical molle bartact`

---

## 4. CONTENT — WORD COUNT & AUTHORITY

### Minimum Word Counts
- **Product/collection pages:** 700 words minimum to avoid "thin content" flag
- **Blog posts:** 1,000+ words for authority; 1,500–2,500 for pillar content
- **Affiliate site homepages:** 800+ words
- **Thin content threshold:** Under 400 words = fix immediately

### Authority Signals That Work
- **Specific fitment data** — year/make/model callouts (Google rewards specificity)
- **Material specs** — exact denier, fabric type, certification (e.g., "1000D Cordura nylon", "Berry Amendment compliant")
- **Comparison content** — ranking competitors honestly builds trust and time-on-page
- **FAQ sections** — add FAQPage schema; Google uses these for featured snippets
- **Long-form descriptions** — 2,000+ word product descriptions with H2 subheadings outperform short ones
- **Video embeds** — YouTube embeds increase dwell time
- **Internal linking** — link from every blog post and collection page to related money pages

### Content Structure That Works
```
H1: [Primary keyword — exact match or close variant]
Intro paragraph: lead with the keyword + differentiator
H2: [Product #1 — Bartact — always first]
  - Detailed description (150+ words)
  - Specific fitment/specs
  - Buy button
H2: [Product #2 — Amazon alternative]
  ...
H2: Materials Guide / How to Choose
H2: FAQ (with FAQPage schema)
H2: Internal links to related pages
```

### What HURTS Rankings
- **Thin content** — under 400 words, Google ignores it
- **Duplicate content** — DH2T/Turn14 pushes manufacturer copy to ALL retailers nightly; must rewrite
- **Keyword cannibalization** — two pages fighting for same keyword splits authority
- **Noindex on money pages** — double-check before adding noindex
- **No internal links** — pages with zero internal links from the rest of the site don't rank
- **Boilerplate copy** — "competitive prices, fast shipping" = zero SEO value, replace immediately
- **Too many low-quality pages** — Bull Strap had 97,200 Turn14 product pages diluting authority; noindexed them

---

## 5. BLOG STRATEGY

### Why Blogs Matter
- Blog posts provide the internal links that pass authority to money pages
- Fresh content signals to Google the site is active
- Long-tail keyword traffic from blog posts converts
- Backlinks from other sites link to blog posts (not collection pages)

### Blog Best Practices
- **15-topic rotation** minimum — don't repeat topics within 2 weeks
- **Publish daily** for established sites (Bartact runs 10am UTC daily)
- **No competitor names in blog posts** (Bartact rule — avoids brand association issues)
- **Every blog post must link internally** to at least 2–3 money pages
- **Pillar posts** (2,000+ words) should be the foundation; shorter posts support them

### Blog Topics That Work for Jeep/Truck Niche
- "Best [Product] for [Vehicle] [Year]" — direct buyer intent
- "How to install [Product] on [Vehicle]" — how-to content ranks well
- "Materials comparison: [Material A] vs [Material B]" — education content
- "Why [Brand] beats [Category] on [Vehicle]" — brand authority
- "[Vehicle] [Year] accessories guide" — broad authority builder

### Cross-Linking Rule
- Every affiliate site blog post should link back to the primary Bartact/Bull Strap page
- Use descriptive anchor text, not "click here"
- ✅ `custom-fit Jeep Wrangler seat covers by Bartact`
- ❌ `click here for seat covers`

---

## 6. IMAGE ALT TEXT

### Pattern
`[Product Name] — [vehicle fitment] — [key material] | [Brand]`

### Rules
- Never blank alt text
- Vary alt text across multiple images of same product (don't repeat)
- No keyword stuffing — read naturally
- ✅ `Bartact tactical seat covers for Jeep Wrangler JL — 1000D Cordura nylon, MOLLE panels | Bartact`
- ❌ `seat covers seat covers jeep wrangler seat covers tactical`

---

## 7. SCHEMA MARKUP

### What Works
- **FAQPage schema** — dramatically improves featured snippet chance; add to any page with Q&A section
- **Product schema** — on product pages with price, availability, reviews
- **Article schema** — on blog posts with datePublished, author, publisher
- **BreadcrumbList schema** — helps Google understand site structure

### FAQPage Schema Template
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What are the best Jeep Wrangler JL seat covers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bartact tactical seat covers are the #1 pick for the JL/JLU..."
      }
    }
  ]
}
```

---

## 8. BARTACT-SPECIFIC SEO RULES (NON-NEGOTIABLE)

### Material Specs — EXACT CORRECT SPEC
- **Standard colors:** 600D polyester (PU waterproof backing, laminated foam, UV protection)
- **Specialty colors (Coyote Tan, Olive Drab, ACU):** 1000D Cordura nylon
- **NEVER say:** "mil-spec" in content (Mitch's rule — do not add this)
- Material guide heading: "1000D Cordura vs Neoprene vs Faux Leather"

### Patent Claims — CRITICAL
**ONLY use "patent pending" or "patented" if the product description ALREADY says it.**
- ✅ Products WITH patents: winch covers, sun shades (JL/JLU/Gladiator), MOLLE seat back panel, Bronco door storage, Bronco console organizer, console organizer door pouch (JL/JLU/Gladiator), JLU aluminum roll bar fire extinguisher mount
- ❌ Products WITHOUT patents: grab handles, standard roll bar fire extinguisher holder
- **When in doubt: DO NOT add "patent pending."** This is a legal claim.

### Bartact Ranking Rules
- **Bartact must be #1 on EVERY page that features their product categories**
- **Before any Filli/Fern Allen page goes live:** verify Bartact is #1, images show correct product
- Filli must NOT pull random Bartact CDN images — verify filename matches the product

### Bartact Key Differentiators (use these)
- "custom-cut not universal fit"
- "1000D Cordura nylon / 600D polyester"
- "Berry Amendment compliant"
- "invented by Bartact" (grab handles only)
- "only manufacturer" (where factually true)
- "Made in USA" / "hand-sewn in Temecula, California"
- "MOLLE/PALS webbing" (not just "MOLLE pockets")
- "SRS airbag-compliant seam construction"

---

## 9. AFFILIATE SITE SEO RULES

### Amazon Tracking Tags
- **Only valid tags:** `brazenprodu01-20` and `brazenprodu02-20`
- Use regex `/tag=brazenprodu0[12]-20/` to validate — no variants
- Every Amazon product link must have one of these tags
- Check: `grep -r "amazon.com/dp" site/ | grep -v "tag=brazenprodu"`

### Bartact #1 Rule
- Bartact must always be listed first on any page featuring their categories
- Validate at build time — `validate_products()` function enforced in `build-bestbroncoaccessories.py`
- Do NOT let competitor content bleed into Bartact sections

### Protected Domains — NEVER TOUCH
`factorfilters.com`, `thedailycheer.com`, `recentratings.com`, `hspseats.com`, `brazenauto.com`, `fernallern.com`, `thornwoodaccord.com`

### Image Rules for Affiliate Sites
- Use `/dp/ASIN/` format links only (not full product URLs)
- Use `m.media-amazon.com` images only
- Verify image filename matches the product being shown
- Never use numbered files (84.jpg, 85.jpg etc.) — these are random CDN files

---

## 10. BULL STRAP SEO RULES

### Core Strategy
- Google needs to see bullstrap.com as a suspension authority before trusting it for other categories
- Priority order: **Suspension → Lift Kits → Wheels/Tires → Exterior → Interior → Everything else**
- Carli Suspension is the #1 priority brand — content must lead with Carli

### The DH2T Problem
- Turn14/DH2T pushes identical manufacturer copy to ALL retailers every night (~9am PT)
- CARiD, ExtremeTerrain, RockAuto all have identical content → Google picks the biggest brand
- **Only unique content wins** — rewrite ALL product/collection descriptions
- fitment data from `fits_` tags is the secret weapon for unique content

### Collection Pages
- Collection pages rank for category-level searches (e.g., "Carli suspension Ram 2500")
- Old boilerplate ("competitive prices, fast shipping") = zero value — replace immediately
- Title: `[Brand] [Parts] — [Vehicle Fitment] | Bull Strap`

### Key Bull Strap Facts
- DH2T sync time: ~9am PT (16:00 UTC) — fixes must land before this
- Shopify timestamps are PT (-07:00) but accept UTC ISO in API queries
- Google Indexing API quota: 199 URLs/day
- Indexing creds: `sites/indexing-credentials/.bullstrap-merchant-center-credentials.json`
- Blog ID: `96543015185` | Theme ID: `177071489297`
- Bull Strap is an authorized Carli dealer — mention this

### noindex Decision
- 97,200 Turn14 product pages noindexed April 2026 — correct decision
- These pages had near-zero clicks but were diluting domain authority
- Do NOT reverse the noindex — keep Turn14 pages noindexed

---

## 11. ELIPACKO SEO RULES

### Photo Policy
- **NEVER remove existing photos** — new photos are ADDITIONS only
- Verify image filename matches the product before using
- Banned images: `82.jpg` ("CHARRIES" box), `cherry-box.jpg`, `vegetable-crate.jpg` (salad bowl), `poultry-box.jpg` (live chickens), `produce------.jpg` (crab box)
- Numbered files (72.jpg, 84.jpg, 85.jpg etc.) are random produce photos — DO NOT use on container/industrial pages

### Pricing Rule
- **NO PRICING on any Elipacko affiliate site — EVER**
- We don't know Elipacko's prices — all pricing tables are fake
- Replace with: "Contact Elipacko directly for factory-direct pricing"

### Anti-Dumping Duty — Legal Position
- **NEVER say "0% ADD" without the Thailand qualifier**
- China: 83.64% ADD rate (preliminary, Aug 26, 2025 determination)
- Vietnam: Also under ADD investigation
- Thailand: NOT named — "0% anti-dumping duty on Thailand-manufactured product" is valid
- Always add: "confirm HTS code with your customs broker"

---

## 12. TOOLS & SCRIPTS REFERENCE

| Tool | Location | Purpose |
|---|---|---|
| Bull Strap indexing | `scripts/bullstrap-full-indexing.js` | Daily 199-URL drip to Google |
| Bartact SEO fix | `scripts/bartact-seo-recent-fix.js` | Fix thin content on Bartact collections |
| Bartact collection SEO | `scripts/bullstrap-collection-seo.js` | Fix/create collection pages |
| Bartact blog daily | `scripts/bartact-blog-daily.js` | Daily blog post, 10am UTC |
| Affiliate health | `scripts/affiliate-daily-health.js` | Daily affiliate tag + uptime check |
| Credential health | `scripts/credential-health-check.js` | API key status |
| Shopping ROAS | `scripts/shopping-roas-monitor.js` | Google Ads ROAS alerts (ENABLED campaigns only) |

### Indexing State Files
- Bull Strap: `memory/bullstrap-full-indexing-state.json` + `memory/bullstrap-indexing-daily-log.md`
- Bartact: `memory/bartact-seat-cover-indexing-results.json`

---

## 13. WHAT HAS ACTUALLY MOVED RANKINGS

### Confirmed Wins
- **Adding FAQPage schema** → featured snippet appearances increased
- **Rewriting collection page body_html** from boilerplate → longer specific content
- **Daily blog publishing** → fresh content signal, internal links
- **IndexNow submissions** → Bing/Yandex pickup within 24h (vs weeks without)
- **Fixing title tags to keyword-first** → CTR improvement visible in GSC
- **noindexing thin/duplicate pages** → concentrates authority on quality pages
- **Backlinks from affiliate network** → 28+ bullstrap.com backlinks from owned sites
- **Vehicle-specific fitment content** → Google rewards specificity

### Confirmed Losers
- **Universal/generic copy** — never ranks against vehicle-specific pages
- **Boilerplate meta descriptions** — low CTR, no click improvement
- **Thin product descriptions** — pages under 400 words don't rank
- **Missing IndexNow key file** — silently kills all IndexNow submissions
- **Duplicate Amazon tracking tags** — loses commission AND gets flagged
- **Fabricated specs/claims** — legal risk + trust loss if caught

---

## 14. GOOGLE ADS — ROAS TRACKING

### The Under-Reporting Problem
- Google Ads conversion tracking captures only ~14-36% of actual conversions
- Gclid capture rate 14-23% = Google is under-reporting by 75-85%
- **True ROAS = Shopify gclid-adjusted revenue ÷ Google spend**
- A "0.72x ROAS" alert from Google often = 15-29x actual ROAS in Shopify
- Do NOT pause campaigns based on Google-reported ROAS alone — check Shopify first

### Bartact Campaign Structure (as of Aug 2026)
- Jeep Wrangler PMax: $162/day
- Gladiator PMax: $100/day
- Bronco Storage PMax: $36/day (cut from $60 — 0 convs on $91 spend)
- Tacoma PMax: $10/day
- Competitors Search: $15/day (under review)
- Various Search campaigns: $5-26/day each
- Total: ~$563/day

---

## 15. MEMORY & CONTINUITY

### Where to Log SEO Work
- Daily session notes: `memory/YYYY-MM-DD.md`
- Indexing logs: `memory/bullstrap-indexing-daily-log.md`
- Ranking state: `memory/bartact-ranking-state.json`
- Update THIS file when new lessons are learned

### Key Dates
- 2026-04-16: Bull Strap 97,200 pages noindexed; 28 backlinks added from affiliate network
- 2026-04-20: Bull Strap SEO diagnosis — problem is low baseline, not ranking decay
- 2026-07-20: Bartact SEO rules propagated to all bots
- 2026-08-05: Bartact collection SEO cron running; daily blog publishing started
- 2026-08-06: This playbook created

---

*This file is maintained by Slashdaddy. All bots should read it at the start of any SEO task. Update it when you discover something new that works or doesn't work.*
