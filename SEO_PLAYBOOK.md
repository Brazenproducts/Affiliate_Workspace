# SEO_PLAYBOOK.md — Master SEO Guide for All Bots
**Last updated:** 2026-08-11
**Maintained by:** Slashdaddy (main session)
**All bots must read this file before doing any SEO work.**

---

## ⚡ TL;DR — THE NON-NEGOTIABLES

1. **Submit to ALL search engines after EVERY push, no exceptions** — Google Indexing API + IndexNow (Bing + Yandex) must both fire after every single git push, every single Shopify update, every individual file change. "Major pushes only" is not acceptable. IndexNow does NOT cover Google — they are separate and both required.
2. **Title tag: keyword FIRST, brand LAST, max 65 chars**
3. **Meta description: 80–160 chars, include fitment + material + "Made in USA"**
4. **No thin content** — 1,500w TARGET on every Bartact collection page (competitors are at 1,000–1,500w — to rank #1 we must beat them, not match them); floors are MINIMUMS everywhere else, always aim for the target column in the pre-task gate table
5. **Bartact is ALWAYS #1** on any page featuring their product categories
6. **Never fabricate product specs, patent claims, or material details**
7. **Blog posts = backlinks = authority** — every site needs a blog with internal links
8. **A job is NOT done until 100% of pages meet the standard** — not the first batch, not "most" of them
9. **Always audit scope BEFORE starting** — count total pages, report X/total so everyone knows the real picture
10. **IndexNow is always available** — if Google Indexing API scope is missing, use IndexNow; never block progress on a credential issue
11. **GSC setup is mandatory before any SEO work** — every new site must have GSC property added, ownership verified, service account added as Owner, and sitemap submitted BEFORE Indexing API or any SEO work is considered started. No GSC = phantom submissions. See Section 0.
12. **Pull the canonical site list before any network-wide task** — never work from memory or a cached list. Pull from the source file, count it, confirm it, then proceed. See Section 0.5.

---

## ⛔ MANDATORY PRE-TASK GATE — EVERY BOT, EVERY SESSION, NO EXCEPTIONS

**Before writing a single word of content for ANY site, run this checklist. Do not skip steps. Do not work from memory.**

### Step 1 — Identify the site type
| Site | Absolute Floor (MINIMUM — do not stop here) | Target (AIM FOR THIS) |
|---|---|---|
| Bartact collection pages | 1,000w | 1,500w |
| Bartact product pages | 700w | 1,000w |
| Bull Strap collection/product pages | 700w | 1,500w |
| Owned site homepages (Ballkinis, limitstraps, etc.) | 700w | 1,000w |
| Affiliate site homepages | 800w | 1,500w |
| Affiliate site inner pages | 700w | 1,000w |
| Blog posts | 1,000w | 1,500–2,500w |
| Any page under 400w | FIX IMMEDIATELY | — |

⚠️ **The floor is the MINIMUM — it is NOT the goal. Always aim for the target column. Writing to the floor and stopping is a failure. If you hit the floor and have more to say, keep writing. The target is where you should land.**

**The Bartact 1,500w target does NOT apply universally. Do not apply it to Ballkinis, affiliate sites, or other owned properties unless they are in a competitive keyword battle. Check this table before writing.**

### Step 2 — Fetch current word count from the live source
- Shopify: fetch `body_html` from the Admin API and count words from the response — NOT from your script's input
- GitHub Pages / static HTML: fetch the live page via curl and strip tags
- Never self-report a word count. Always verify from the source.

### Step 3 — Audit scope before starting
- Count total pages needing work
- Report: X/total complete, not "done" when only some are fixed
- A job is NOT done until 100% of pages meet the floor

### Step 4 — After every push, verify from API response
- Shopify sanitizer can reduce word count below what you wrote
- Always check `body_html` in the PUT response, not the input
- If the response count is below floor, expand and re-push immediately

### Step 5 — Submit to search engines after every push
- Google Indexing API + IndexNow both fire. Always. No exceptions.

**If you cannot confirm the live post-push word count from the API or live page, the task is NOT done. Do not report it as done to Mitch.**

---

## 0. NEW SITE MANDATORY SETUP — DO THIS BEFORE ANY SEO WORK

⚠️ **Discovered 2026-08-10: GSC dashboard visibility was missing for 96 affiliate sites. Indexing API was working for 61/66 verified sites, but Mitch had zero dashboard access for any of them — no keyword data, no coverage reports, no crawl errors, no sitemap confirmation.**

**Two separate systems. Both required. Don’t confuse them:**
- **Site Verification API** (service account) → enables Indexing API. Already automated.
- **Search Console dashboard** (OAuth2 / info@brazenauto.com) → enables keyword data, coverage reports, sitemap UI, crawl errors. Was never set up.

### STEP 1 — Verify domain under service account (automated)
- Use Site Verification API with `axl-348@proud-stage-397621.iam.gserviceaccount.com`
- HTML file method for GitHub Pages: push verification token to repo root
- This is what enables the **Indexing API** to accept submissions
- Script: already automated in Filli’s pipeline

### STEP 2 — Add service account as delegated owner (automated)
- Grants `axl-348@...` full programmatic control
- Run immediately after Step 1 verifies

### STEP 3 — Add property to GSC dashboard via webmasters API
- Requires valid OAuth2 credentials for `info@brazenauto.com` — **currently expired (invalid_grant)**
- Until reathed: add manually via browser at [search.google.com/search-console](https://search.google.com/search-console)
- Add Property → URL prefix → `https://yourdomain.com`
- This is what puts the site in **Mitch’s dashboard**

### STEP 4 — Submit sitemap via SC API (or manually)
- `https://yourdomain.com/sitemap.xml`
- Programmatic: `webmasters.sitemaps.submit()` using OAuth2 credentials
- Manual fallback: GSC → Sitemaps → Add new

### STEP 5 — Submit initial URLs via Indexing API
- Blast all existing pages after Steps 1-2 are complete
- 199 URL/day quota per property

### STEP 6 — Confirm coverage in GSC dashboard
- Verify sitemap is accepted (not pending)
- Confirm no coverage errors in first 24-48h
- Check that impressions begin appearing within 1-2 weeks

### VERIFICATION BEFORE CLAIMING DONE
- After any DNS change: confirm via registrar API (not just bot's word) before reporting to Mitch
- After GSC verification: confirm service account shows as Owner in the GSC property, not just that the script ran
- After sitemap submission: confirm GSC API returns 200 and sitemap shows as "Success"
- A task is NOT done until the API/endpoint independently confirms it — never relay a bot's self-report as confirmation

### ALERTING PROTOCOL — WHEN TO NOTIFY MITCH
- GSC verification fails after 3 retries → notify Mitch with: site name, exact error, what we tried, what's blocking
- DNS change applied but site still not resolving after 2 hours → notify Mitch
- Any site stuck for >24h at a step → notify Mitch with status
- Do NOT alert for propagation delays under 2 hours (normal)
- Slashdaddy is the alerting layer — bots report to Slashdaddy, Slashdaddy tells Mitch only when action is needed

**Current status (2026-08-10): 61/66 affiliate sites verified (Steps 1-2 done). Steps 3-6 done for 0 sites. OAuth2 for info@brazenauto.com expired — reauth required before Steps 3-6 can be automated. 4 sites still pending Step 1 (GitHub Pages propagation).

**Reauth:** Same procedure as Google Ads reauth — local OAuth server port 9876, Mitch opens one URL, clicks Allow. Takes 2 minutes.

---

## 0.5 SCOPE VERIFICATION BEFORE ANY WORK — MANDATORY

**Added 2026-08-10. Triggered by: Filli spent a full day adding 66 sites to GSC when the real number is 112. The missing 46 were skipped because Filli worked from a memorized subset instead of pulling the actual confirmed list.**

### The Rule

Before executing ANY network-wide task — GSC setup, sitemap submission, indexing, content injection, affiliate tag audits, image pushes, schema updates, or anything that touches multiple sites — every bot MUST:

1. **Pull the full authoritative site list from the canonical source file** (see below)
2. **Count the entries** — print/log the exact number
3. **Confirm the count matches expectations** — if it's different from what you remember, the file is correct, your memory is wrong
4. **Then proceed** — using only the list from the file, not from memory or a previously cached list

Memory does not count. A previously used list does not count. The file is the truth.

### Canonical Source Files

| Scope | Canonical File |
|---|---|
| All affiliate sites (Filli) | `/home/ubuntu/.openclaw/agents/filli/workspace/memory/associates-site-lists-confirmed.md` |
| Elipacko backlink sites (Fern Allen) | Fern Allen's confirmed site list in her workspace memory |
| Bull Strap GSC properties | Confirmed from live GSC API — always query, never assume |
| Bartact | Single site — `https://www.bartact.com/` |

### What This Looks Like in Practice

```
# WRONG — never do this
"I'll process the 66 affiliate sites like last time"

# RIGHT — always do this
cat /home/ubuntu/.openclaw/agents/filli/workspace/memory/associates-site-lists-confirmed.md | grep -c 'http'
# Output: 112
# Confirmed: 112 sites. Proceeding with full list.
```

### The Cost of Getting This Wrong

Filli spent a full day processing 66 sites when the real number was 112. 46 sites got zero GSC work done. That's hours of wasted effort and incomplete coverage. This rule exists because that already happened.

### Applies To

All bots. Every task. Every time. No exceptions for "quick" tasks or "I remember the list."

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
- **⚠️ Shopify stores:** The key file CANNOT be uploaded via Shopify Files — that gives a CDN URL (`cdn.shopify.com/...`), not the required root URL. Must be uploaded as a **theme asset** so it's served at `https://yourdomain.com/{key}.txt`
- **Verify with:** `curl https://yourdomain.com/b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5.txt` — should return just the key string. IndexNow returns HTTP 202 even when the key file is wrong — submissions are silently discarded.

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

### ⚠️ Limit Strap Content Rule (limitingstraps.com + any limit strap pages)
- **Lead with trucks, UTVs, and off-road racing — NOT Jeep/Bronco**
- Core audience: prerunner trucks, long-travel builds, desert racing, UTVs (Can-Am, Polaris RZR, Yamaha YXZ), rock crawlers, sand rails
- Jeep and Bronco are secondary/compatibility mentions — never the hero
- Feature ALL brands Bull Strap makes limit straps for: Kartek, ORW (Off Road Warehouse), Carli Suspension — confirm others before adding
- Jeep-first angle will alienate the serious off-road builder who is the actual buyer

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
- **Product/collection pages:** 700w floor — TARGET 1,000w+
- **Blog posts:** 1,000w floor — TARGET 1,500–2,500w for pillar content
- **Affiliate site homepages:** 800w floor — TARGET 1,500w
- **Thin content threshold:** Under 400 words = fix immediately
- **Floors are minimums, not goals.** Hitting 701w on a product page is a near-miss, not a win.

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

### Content Position Matters
- **Keyword and primary value prop must be in the first 100 words** — Google weights content order heavily
- Never append depth content to the bottom of a page — it buries keyword signal
- **Correct structure:** intro (keyword in first sentence) → content expansion → FAQ section
- Inserting a "boost block" after the FAQ section = wasted words

### CTR Is a Separate Problem From Ranking
- High rank + terrible CTR = wasted position — you're invisible even when you're visible
- **Any keyword at positions 1–10 with CTR under 1% requires immediate title tag + meta description rewrite**
- CTR benchmarks by position:
  - Position 1: expect 25–35%
  - Position 3: expect 10–15%
  - Position 5: expect 5–8%
  - Position 10: expect 2–3%
  - **Under 1% at any top-10 position = rewrite the snippet immediately**
- Current Bartact CTR emergencies: "winch cover" #6.9 / 0.16% CTR 🚨 | "jeep grab handles" #5.5 / 0.14% CTR 🚨

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

## 7. KEYWORD RANKING TARGETS

These are the positions we are actively chasing. Every bot reports against these weekly. Slashdaddy flags anything off-target.

### BARTACT — Position Targets

| Keyword | Current | Target | Priority |
|---------|---------|--------|----------|
| jeep seat covers | ~8 | Top 3 | 🔴 Critical |
| jeep wrangler seat covers | ~8 | Top 3 | 🔴 Critical |
| jeep wrangler jl seat covers | TBD | Top 3 | 🔴 Critical |
| jeep wrangler jk seat covers | TBD | Top 5 | 🔴 High |
| jeep wrangler tj seat covers | TBD | Top 5 | 🔴 High |
| jeep gladiator seat covers | TBD | Top 3 | 🔴 High |
| ford bronco seat covers | TBD | Top 5 | 🟡 Medium |
| toyota tacoma seat covers | TBD | Top 10 | 🟡 Medium |
| jeep grab handles | TBD | #1 | 🔴 Critical |
| paracord grab handles | TBD | #1 | 🔴 Critical |
| jeep wrangler grab handles | TBD | #1 | 🔴 Critical |
| ford bronco grab handles | TBD | Top 3 | 🟡 Medium |
| jeep molle seat back | TBD | Top 3 | 🟡 Medium |
| ford bronco door storage | TBD | Top 3 | 🟡 Medium |
| ford bronco console organizer | TBD | Top 3 | 🟡 Medium |
| jeep fire extinguisher mount | TBD | Top 3 | 🟡 Medium |
| roll bar fire extinguisher mount | TBD | Top 3 | 🟡 Medium |
| jeep winch cover | TBD | Top 5 | 🟡 Medium |
| jeep wrangler sun shade | TBD | Top 5 | 🟡 Medium |
| bartact | TBD | #1 | 🔴 Brand |
| bartact seat covers | TBD | #1 | 🔴 Brand |

### BULL STRAP — Position Targets

| Keyword | Current | Target | Priority |
|---------|---------|--------|----------|
| suspension limit straps | TBD | Top 5 | 🔴 Critical |
| jeep limit straps | TBD | Top 5 | 🔴 Critical |
| limit straps | TBD | Top 10 | 🔴 Critical |
| how to measure for limit straps | ~7 | Top 3 | 🔴 Critical |
| what are limit straps | TBD | Top 5 | 🔴 High |
| limit straps vs bump stops | TBD | Top 5 | 🔴 High |
| carli suspension ram 2500 | TBD | Top 10 | 🔴 High |
| carli suspension dealers | TBD | Top 5 | 🔴 High |
| carli suspension | TBD | Top 15 | 🟡 Medium |
| bull strap | TBD | #1 | 🔴 Brand |
| bull strap limit straps | TBD | #1 | 🔴 Brand |

### REPORTING RULES
- **Every Friday**: each bot pulls GSC data and reports current position for ALL target keywords above
- **Alert immediately** when any keyword drops 3+ positions
- **Alert immediately** when any keyword with 1,000+ impressions is stuck below position 20 (opportunity)
- **Alert immediately** when a target is hit (win to replicate)
- When a keyword is off-target: identify the page targeting it, word count, backlinks, and what competitor has the top spot

---

## 8. SHOPIFY-SPECIFIC TECHNICAL RULES

### Shopify body_html Sanitizer — CRITICAL
Shopify's sanitizer strips content on every PUT. This is not optional behavior — it always runs.

**Stripped tags/attributes:**
- `<div>` — stripped entirely
- `<img>` — stripped entirely
- All `style=` inline attributes — stripped from every tag
- Tables lose all formatting but survive structurally

**Allowed tags:** `<p>`, `<h2>`–`<h6>`, `<ul>`, `<ol>`, `<li>`, `<strong>`, `<em>`, `<a>`, `<br>`, `<table>`, `<tr>`, `<td>`, `<th>` — NO inline styles on any of them

**Word count buffer rules (required):**
- Write **1,200–1,400w raw** to reliably land at 1,000w+ post-sanitizer
- Write **1,800w+ raw** to reliably land at 1,500w+ post-sanitizer
- **Never trust pre-sanitizer word counts** — a page that looks 1,500w in your script can come back 900w after Shopify processes it
- **Always verify word count from the API response**, not the input

### BOOST Append Regression Risk
When you PUT updated body_html to Shopify, the sanitizer re-processes the EXISTING content too — this can REDUCE word count below what was there before the update.

**Rule:** Always fetch current body_html first → count words from API response → then expand → push → verify word count from the response body. Never assume the existing word count is stable after a PUT.

### Smart Collection Rule Logic — OR vs AND
Broad OR-logic smart collection rules (e.g., `tag contains "jeep"`) pull in the entire catalog and can cause cross-contamination.

**Correct pattern:**
- `disjunctive: false` with a single unique tag per collection when narrow filtering is needed
- For broad collections, use `disjunctive: true` ONLY with tags specific enough not to cross-contaminate
- Always preview the collection product count before publishing — unexpected large counts = wrong rule logic

### FAQ Schema on Shopify Collections
FAQPage JSON-LD **cannot** be placed in `body_html` — it gets stripped by the sanitizer.

**Working pattern:** Store FAQ schema in a metafield, render it in the collection Liquid template:
```liquid
<!-- In collection.liquid -->
{% if collection.metafields.custom.faq_schema != blank %}
  <script type="application/ld+json">
    {{ collection.metafields.custom.faq_schema }}
  </script>
{% endif %}
```
Metafield: `custom.faq_schema`, type `multi_line_text_field`. Push via Admin API metafields endpoint, not body_html.

**IndexNow key on Shopify — correct method:** Theme file assets don't serve at the root domain URL. The working approach is a Liquid page template:
1. Create `templates/page.indexnow-key.liquid` containing just the key string
2. Create a Shopify Page with handle = the key value (e.g. `b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5`), assign that template
3. Verify: `curl -sL https://yourdomain.com/pages/{key}` returns just the key
4. Submit to IndexNow with `keyLocation: https://yourdomain.com/pages/{key}`

⚠️ **VERIFY RENDERING — metafield existing ≠ schema rendering.** After patching the theme, confirm with:
```
curl -s https://yourdomain.com/collections/your-handle | grep -c "application/ld+json"
```
Must return 1 or more. If it returns 0, the theme patch failed — check that the Liquid snippet is in the correct template file and the theme was published after the edit.

---

## 9. BARTACT-SPECIFIC SEO RULES (NON-NEGOTIABLE)

### Material Specs — EXACT CORRECT SPEC
- **Standard colors:** 600D polyester (PU waterproof backing, laminated foam, UV protection)
- **Specialty colors (Coyote Tan, Olive Drab, ACU):** 1000D Cordura nylon
- **"mil-spec" rule:** Only use "mil-spec" when the thing you are describing IS actually mil-spec. If you wouldn't be able to cite the actual MIL spec number for it, don't call it mil-spec.
  - ✅ "Mil-spec 1000D Cordura nylon" — genuinely meets military specification (MIL-C-43734)
  - ✅ "Mil-spec MOLLE/PALS webbing" — accurate, keep it
  - ✅ Cordura nylon broadly — mil-spec is an accurate descriptor, keep it
  - ❌ "Mil-spec stitching" or "mil-spec construction" applied broadly to seat covers — false claim, remove
  - ❌ "Mil-spec" applied to paracord grab handles — grab handles are NOT mil-spec rated, remove
  - ❌ Generic "mil-spec quality" as a marketing descriptor — banned everywhere
- Material guide heading: "600D Polyester vs 1000D Cordura vs Neoprene vs Faux Leather" — 600D leads because it's the PRIMARY material for most seat covers
- **600D polyester is the MAIN material** — most Bartact seat covers are 600D; never bury it or treat it as secondary

### Fabric Comparison Chart — MANDATORY ON ALL SEAT COVER PAGES
- **The canonical HTML chart is at:** `assets/bartact-fabric-comparison.html`
- **The source XLSX is at:** `assets/bartact-fabric-comparison-chart.xlsx`
- This chart MUST be embedded on every Bartact seat cover collection page and every affiliate seat cover page
- Bartact scores A / 76-80 stars / 9/9 bonus on both materials — every competitor scores B or lower
- Key talking points from the chart:
  - Only Bartact has MOLLE storage, front zippered pocket, rear zippered pocket, and internal lumbar pocket
  - Only Bartact is machine washable AND seat heater compatible AND waterproof
  - 600D Patriot Polyester: 76/80 stars, grade A — beats neoprene (53/80), leatherette (55-58/80), poly cotton (57/80)
  - Neoprene is NOT seat heater compatible — always call this out
  - Fake neoprene ("Neoprene Look") scores 50/80 — dead last
- Filli must embed this chart on ALL seat cover affiliate pages (bestseatcover.com, jeepseatcover.com, jlseats.com, gladiatorseatcover.com, wranglerseatcover.com, etc.)

### Patent Claims — CRITICAL
**ONLY use "patent pending" or "patented" if the product description ALREADY says it.**
- ✅ Products WITH patents: winch covers, sun shades (JL/JLU/Gladiator), MOLLE seat back panel, Bronco door storage, Bronco console organizer, console organizer door pouch (JL/JLU/Gladiator), JLU aluminum roll bar fire extinguisher mount
- ❌ Products WITHOUT patents: grab handles, standard roll bar fire extinguisher holder
- **When in doubt: DO NOT add "patent pending."** This is a legal claim.

### Bartact Ranking Rules
- **Bartact must be #1 on EVERY page that features their product categories**
- **Before any Filli/Fern Allen page goes live:** verify Bartact is #1, images show correct product
- Filli must NOT pull random Bartact CDN images — verify filename matches the product

### Bartact Collection Page Minimum Standard — NON-NEGOTIABLE
**Every Bartact Shopify collection page must meet ALL of the following before the job is considered done:**

1. **1,500w TARGET, 1,000w minimum** — competitors are at 1,000–1,500w. To rank #1 we must beat them. 800w will not win. Every page should aim for 1,500w with the goal of being the single most comprehensive page on that topic.
2. **Fitment table** — vehicle years, trim levels, compatible SKUs listed explicitly
3. **FAQ schema** — minimum 3 Q&As in `application/ld+json` FAQPage schema on every collection page
4. **Keyword in H1, first 100 words, at least 2 subheadings, and meta title/description**
5. **Internal links** — link to at least 2 related collection pages
6. **IndexNow + Google Indexing API submitted** after every update

**As of 2026-08-07: 112 of 118 published Bartact collections are under 800w. Only 6 meet the standard.**

**Priority order for expansion (by GSC impressions — highest traffic first):**
1. `jeep-wrangler-tj-seat-covers` — 395w, #7.9, 560 impr 🚨
2. `jeep-wrangler-jk-seat-covers` — 497w, #7.0, 196 impr 🚨
3. `winch-covers-patent-pending-by-bartact` — 193w, #6.9, 1,215 impr 🚨
4. `jeep-wrangler-jl-molle-accessories` — 346w (high MOLLE traffic)
5. `jeep-wrangler-jk-molle-accessories` — 202w
6. `jeep-gladiator-molle-accessories` — 175w
7. `jeep-gladiator-seat-covers-accessories-2019` — 226w
8. `jeep-wrangler-jl-sun-shades` — 349w
9. `jeep-wrangler-jl-seat-covers` — 746w (close — push over 800w)
10. `ford-bronco-storage-bags` — 775w (close — push over 800w)

**The job is NOT done until all 118 collections are at 800w+. Batch through systematically. Report progress as: X/118 complete.**

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

## 10. AFFILIATE SITE SEO RULES

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

## 11. BULL STRAP SEO RULES

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

## 12. ELIPACKO SEO RULES

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

## 13. TOOLS & SCRIPTS REFERENCE

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

## 14. WHAT HAS ACTUALLY MOVED RANKINGS

### Confirmed Wins
- **Adding FAQPage schema** → featured snippet appearances increased
- **Rewriting collection page body_html** from boilerplate → longer specific content
- **Daily blog publishing** → fresh content signal, internal links
- **IndexNow submissions** → Bing/Yandex pickup within 24h (vs weeks without)
- **Fixing title tags to keyword-first** → CTR improvement visible in GSC
- **noindexing thin/duplicate pages** → concentrates authority on quality pages
- **Backlinks from affiliate network** → 6,911 Bartact backlinks from Filli's 96 affiliate sites (as of 2026-08-08)
- **Vehicle-specific fitment content** → Google rewards specificity
- **FAQ schema across ALL collection pages** → 106/106 Bartact collections now have FAQPage JSON-LD (confirmed via curl, Aug 2026) — every collection page is now featured snippet eligible
- **Canonical fabric comparison chart** → Bartact Grade A scoring deployed across all 16 seat cover affiliate sites (Aug 2026) — shows neoprene as NOT seat-heater compatible, Bartact as only brand with MOLLE + machine-washable + waterproof
- **1,500w expansion across affiliate network** → 2,332 pages across 96 affiliate sites expanded to 1,500w+ with FAQPage schema (Aug 2026)
- **Blog at 6x/day with 3 backlinks per post** → Bull Strap getting 18 real internal backlinks/day to Turn14 collection pages; 249-collection rotation prevents repeats for 40+ days
- **SkipATip root IndexNow key fix** → valid root key file went live on 2026-08-08; first real bulk submission was 190 URLs after all prior 202 responses had been silently discarded
- **Faithful Passages full-page expansion pattern** → 28/29 pages now at 1,000w+ and 22/29 at 1,500w+ with live Article + FAQPage schema verification, showing the prayer/devotional niche responds to scripture expansion + FAQ blocks
- **Bull Strap FAQ schema via metafield render** → `custom.faq_schema` rendered successfully on 5 priority collections with live 1,523-1,560w post-sanitizer counts verified from Shopify API

### Confirmed Losers
- **Universal/generic copy** — never ranks against vehicle-specific pages
- **Boilerplate meta descriptions** — low CTR, no click improvement
- **Thin product descriptions** — pages under 400 words don't rank
- **Missing IndexNow key file** — silently kills all IndexNow submissions
- **Duplicate Amazon tracking tags** — loses commission AND gets flagged
- **Fabricated specs/claims** — legal risk + trust loss if caught
- **Shopify canonical header on CDN assets** — Shopify's `Link: <cdn.shopify.com/...>; rel="canonical"` header on theme assets causes Bing IndexNow to see a domain mismatch and silently reject all submissions. Fix: Shopify Page + URL Redirect pattern (proven on Bartact), or Cloudflare Worker proxy.
- **GCP credential expiry with no alert** — both Bull Strap and brazenauto Google Indexing API credentials have expired without visible failure (stalled logs only). Set calendar reminders or credential health crons. Bull Strap indexing stalled 9+ days before detection (Aug 2026).
- **Trusting bot self-reports of Telegram sends** — scripts log "sent ✅" even when TELEGRAM_TOKEN is missing — all Telegram sends from Bartact monitoring were silently failing. Always verify the token exists in env before trusting success logs.

---

## 17. ISSUE ROUTING — HOW PROBLEMS BECOME PLAYBOOK RULES

**This playbook is a living document. Every bug, failure, and gap a bot encounters is a potential playbook entry.**

### The Chain

```
Bot hits a problem or question
        ↓
Bot sends it to Slashdaddy (NOT Mitch)
        ↓
Slashdaddy reviews:
  → Can fix it directly? Fix it + update playbook if it's a pattern
  → Can't fix it / needs a decision? Bring it to Mitch with context + recommendation
        ↓
Mitch decides
        ↓
Fix applied + rule added to playbook
```

### How Bots Send Issues to Slashdaddy

Use `sessions_send` with this exact session key:
```
sessionKey: "agent:slashdaddy:telegram:slashdaddy:direct:7550065844"
```

Format your message as:
- **What happened** (brief, factual)
- **What you tried**
- **What you need** (a fix, a decision, or just a heads-up)

### What Counts as an Issue Worth Routing

**Route to Slashdaddy immediately:**
- Auth errors or credential failures
- A script behaved differently than the playbook says it should
- You're blocked and can't proceed without a decision
- You caught a gap the playbook doesn't cover
- Something broke that was working
- You're about to do something irreversible and want a second opinion

**Handle silently (don't route):**
- Normal quota limits (expected behavior)
- Propagation delays under 2 hours
- Routine task completion
- Things the playbook already covers clearly

### What Slashdaddy Does With Issues

1. **Verifies** the issue is real (doesn't just take the bot's word for it)
2. **Fixes directly** when possible — updates configs, patches crons, corrects instructions
3. **Escalates to Mitch** only when it needs a decision, budget, or external action
4. **Adds to playbook** when the issue reveals a pattern or gap

### What Makes a Good Playbook Addition

A playbook rule is worth adding when:
- The same type of problem has happened more than once
- A bot made an incorrect assumption that the playbook could have prevented
- A fix was non-obvious and others would benefit from knowing it
- A tool, API, or platform behaved unexpectedly

**Format for new entries:** Short heading + what went wrong + the correct approach. Put it in the most relevant existing section, or create a new one if it doesn't fit.

---

## 18. UNIVERSAL vs VERTICAL-SPECIFIC SCOPE

Not all bots work on ecommerce/affiliate SEO. This section defines what applies to everyone vs what is vertical-specific.

### Universal — Applies to ALL Bots

- Submit to search engines after every push (Google Indexing API + IndexNow)
- GSC property setup before any indexing work (Section 0)
- Pull canonical site list before any network-wide task (Section 0.5)
- Content must be substantive — no thin/duplicate pages
- Schema markup where appropriate for content type
- Image alt text on all images
- Verify before claiming done — API confirmation required
- Issue routing: problems go to Slashdaddy, not Mitch (Section 17)

### Ecommerce/Affiliate Only (Filli, Bull Strap, Bartact, Fern Allen)

- Amazon tracking tag rules
- Shopify sanitizer rules
- Turn14 sync protection
- Patent claim rules
- Bartact #1 ranking rule
- Protected domain list
- Google Ads / Merchant Center rules

### Faithful Passages — Scope

Universal standards apply. Ecommerce rules do NOT apply. Specific notes:
- Content: prayer/devotional/scripture — quality and depth matter for E-E-A-T
- Indexing: Google Indexing API + IndexNow after every content push
- Schema: Article + FAQPage where appropriate (already confirmed working)
- GSC: standard setup — sitemap submitted, service account verified
- Word count: 800w floor universal minimum; 1,000w+ target for key pages
- No affiliate rules, no Amazon tags, no Shopify rules apply

### SkipaTip — Scope

Universal standards apply. Ecommerce rules do NOT apply. Specific notes:
- This is a review/app site — structured data (LocalBusiness, Review schema) matters
- Indexing: all new pages/reviews pushed to Google Indexing API + IndexNow
- GSC: standard setup maintained
- Affiliate/ecommerce rules do not apply

---

## 15. GOOGLE ADS — ROAS TRACKING

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

## 16. MEMORY & CONTINUITY

### Where to Log SEO Work
- Daily session notes: `memory/YYYY-MM-DD.md`
- Indexing logs: `memory/bullstrap-indexing-daily-log.md`
- Ranking state: `memory/bartact-ranking-state.json`
- Update THIS file when new lessons are learned

### Playbook Change Log
- 2026-08-06: Playbook created
- 2026-08-10: Section 0.5 added (canonical site list rule)
- 2026-08-10: Section 17 added (issue routing + living playbook protocol)
- 2026-08-10: Universal vs vertical-specific bot scope clarified
- 2026-08-11: Section 20 added — Google Ads campaign modification rules (NEVER pause to replace; root cause: Bronco Storage PMax destruction July 31)
- 2026-08-11: Section 21 added — Existing Bartact collection page compliance audit rule; "invented by Bartact" mandatory on all grab handle pages
- 2026-08-11: Section 22 added — Compliance Verification Protocol (never self-report, mandatory weekly sweep, word count standards by page type)
- 2026-08-11: Section 23 added — Mandatory Full Audit standing rule (ALL 119 collections + ALL 255 products, every session before content work begins, plus Sunday sweeps)
- 2026-08-11: Section 24 added — Operational Failure Rules (5 rules from Mitch-flagged failures: phase large tasks, always paginate, IndexNow covers all 4 URL types, verify cron model on create, verify bulk ops with API count before reporting done)
- 2026-08-11: Section 25 added — Google Indexing API quota priority: our pages first, Turn14 last. Bartact cron expanded to all 638 URLs, Bull Strap Turn14 pushed to 23:00 UTC.
- 2026-08-12: Section 25 updated — Bull Strap internal quota split enforced: priority sweep hard-capped at 119/day, full-indexing gets max 80. Shared quota state file: `memory/bullstrap-indexing-shared-quota.json`. Credential note added: Bull Strap uses separate OAuth2 creds from Bartact (axl-348@ service account), but cap is non-negotiable per Mitch's directive.

### Key Dates
- 2026-04-16: Bull Strap 97,200 pages noindexed; 28 backlinks added from affiliate network
- 2026-04-20: Bull Strap SEO diagnosis — problem is low baseline, not ranking decay
- 2026-07-20: Bartact SEO rules propagated to all bots
- 2026-08-05: Bartact collection SEO cron running; daily blog publishing started
- 2026-08-06: This playbook created
- 2026-08-07: Bartact 106/106 collection pages — FAQPage schema deployed and curl-verified. Gladiator seat covers expanded 406→756w. Clicks -18% WoW (440 vs 537) — monitor trend.
- 2026-08-08: Filli milestone — 2,332 pages across 96 affiliate sites at 1,500w+; 6,911 Bartact backlinks; canonical fabric chart on all 16 seat cover sites; 307 bad mil-spec instances stripped. Bull Strap indexing confirmed stalled (9 days). GCP reauth needed for both brazenauto and Bull Strap.
- 2026-08-08: SkipATip IndexNow root key file fixed and verified; first valid 190-URL bulk submission accepted after prior silent failures.
- 2026-08-09: Bull Strap 5 priority collections confirmed live with FAQPage schema in `custom.faq_schema` plus 1,523-1,560w post-sanitizer body counts.
- 2026-08-07: Faithful Passages expanded 28/29 pages to 1,000w+, with 22/29 at 1,500w+ and live Article + FAQPage schema verification across expanded pages.

---

*This file is maintained by Slashdaddy. All bots should read it at the start of any SEO task. Update it when you discover something new that works or doesn't work.*

---

## 19. COMPETITOR MONITORING & DAILY SEO AUTO-IMPROVEMENT

### The Rule
**Every bot checks its ranking daily. If we're not #1, we improve until we are.**
Competitors will have Claude too. The only edge is moving faster, improving smarter, learning continuously.

### How It Works — The Daily Loop

```
[6am] bartact-ranking-monitor.js
        ↓ pulls GSC data
        ↓ identifies keywords not on page 1
        ↓ writes memory/bartact-seo-fix-queue.json
        ↓ sends Telegram report

[6:05am] seo-auto-improve.js --brand=bartact
        ↓ reads fix queue
        ↓ Grok live SERP → who's #1 right now?
        ↓ fetch competitor page → word count, H2s, schema
        ↓ if we trail by >100 words or missing schema → generate improved content via Grok
        ↓ push to Shopify via GraphQL
        ↓ submit to Google Indexing API + IndexNow
        ↓ Telegram report to Mitch: what improved, what still needs work
```

### SERP Data Source
- **Grok live search** (`grok-4-fast` with `search_parameters.mode=on`) — real-time Google results, no SERP API cost
- Grok key in `.env` as `GROK_API_KEY` (or hardcoded in serp scripts)
- Bing positions: `bartact-bing-rank-check.js` (Bing Webmaster API, key: in script)
- Google positions: GSC via service account (`bartact-ranking-monitor.js`)

### What Triggers an Auto-Improvement

| Condition | Action |
|-----------|--------|
| Keyword not in top 10 AND competitor page >100w more than ours | Rewrite body_html, push, index |
| Keyword not in top 10 AND competitor has FAQ schema, we don't | Flag for schema run |
| Keyword in top 10 but #3-10 AND word count already competitive | Flag for backlink/CTR work |
| We're already #1 | Skip — no action |

### Competitor Analysis — What We Check
1. **Word count** — beat them by 200+ words minimum
2. **H2 structure** — match depth, improve specificity
3. **FAQPage schema** — if they have it and we don't, we're at a schema disadvantage
4. **Title tag** — Grok returns their title; compare to ours
5. **Content gaps** — topics they cover that we don't (fitment, comparison, install guide)

### Competitors to Watch (Bartact)
- `wranglerspecs.com` — fitment content hub; deep JL coverage; tracked in `memory/raj-competitive-tracking.md`
- Smittybilt, Rough Country, PRP Seats, Covercraft — product pages on those domains
- Amazon listings — if Amazon ranks above us, improve our PDP + target long-tail
- `extremeterrain.com`, `quadratec.com` — category aggregators

### Target Config Files
- `scripts/seo-targets-bartact.json` — keyword → Shopify handle mapping
- `scripts/seo-targets-bullstrap.json` — (add when Bull Strap loop is live)
- Add new keywords here as they enter the priority list

### Cron Schedule
```
Daily 6am UTC  — Keyword Ranking Pull (76f90c7b)
                 runs bartact-ranking-monitor.js → writes fix queue
Daily 6:10am UTC — SEO Auto-Improve (new cron)
                 runs seo-auto-improve.js --brand=bartact
                 reads fix queue, checks SERP, improves, indexes
```

### Alert Thresholds — When to Wake Mitch
- 🔴 Any priority keyword dropped 3+ positions since last week → immediate Telegram
- 🔴 We're no longer in top 10 for a keyword that was page 1 → immediate
- 🟡 Competitor published new content targeting our exact keyword → flag next morning
- 🟡 Our word count now trails top competitor by >300 words → auto-improve
- ✅ We hit #1 for a target keyword → celebrate in morning report

### Extending to Other Bots
Each bot runs the same loop for their own vertical:
- **Filli**: affiliate site keyword monitoring — GSC per site, fix queue per site, web fetch competitor affiliate pages
- **Bull Strap**: limit straps, recovery gear keywords — same script with `--brand=bullstrap`
- **Faithful Passages**: travel/faith keywords — GSC + content improvement
- Every bot should have its own `seo-targets-[brand].json` and daily cron

### Playbook Change Log
- 2026-08-10: Section 19 added — Grok-powered daily competitor SERP check + auto-improvement loop

---

## 20. GOOGLE ADS — CAMPAIGN MODIFICATION RULES (NON-NEGOTIABLE)

**Added 2026-08-11. Root cause: Bartact bot created a brand new "Bronco Storage PMax" at $22/day on July 31 and paused the original "Bronco Storage" PMax that was running at 13.35x ROAS, $100/day. Revenue dropped from $5,067/day (Jul 29) to ~$464/day by Aug 1. Account is still recovering.**

### The Prime Directive
**NEVER pause an active Google Ads campaign to replace it with a new one. Ever. For any reason.**

Creating a new campaign means Google's machine learning starts from zero. A working campaign's learning history — bidding signals, auction behavior, conversion patterns — is worth thousands of dollars and weeks of time. You cannot transfer that history. You destroy it the moment you pause the campaign.

### What You CAN Do (within an existing campaign)
- Update ad copy
- Update keywords
- Update landing pages
- Adjust budget up or down
- Add/remove ad groups
- Pause individual ad groups or ads (NOT the campaign)
- Update bidding strategy targets (e.g., tROAS)

### What You CANNOT Do (without explicit dual instruction from Mitch)
- ❌ Create a new campaign to replace a working one
- ❌ Pause an active campaign for any reason
- ❌ Reduce budget below what's needed for Smart Bidding to function
- ❌ Change campaign type (e.g., PMax → Standard Shopping)

### The ONLY Exception
Mitch explicitly instructs you to:
1. Create a new campaign — AND
2. Pause the old one

**Both instructions must come directly from Mitch in the same instruction set.** Inferring one from the other is not allowed.

### Applies To
ALL bots. ALL campaign types: Performance Max, Standard Shopping, Search, Display, Demand Gen. No exceptions.

### Why Google's ML Learning Matters
- PMax and Smart Bidding use machine learning that builds up auction data over weeks
- Pausing a campaign resets this learning completely — restart is treated as a brand-new campaign
- Restarting goes through a learning phase (typically 2–6 weeks of suboptimal performance)
- Even budget changes trigger ML recalibration — make budget changes gradually (≤20% per week)
- A campaign spending with zero reported conversions may be in a trough, seasonally slow, or benefiting from view-through attribution — check Shopify gclid data before drawing conclusions

---

## 21. BARTACT COLLECTION PAGE CONTENT COMPLIANCE — EXISTING PAGES

**Added 2026-08-11. Root cause: The 1,500-word rule in Section 9 was being applied to NEW pages only. Existing pages were never audited or brought into compliance. `/collections/jeep-wrangler-jk-jku-grab-handles` is at #27.9 in GSC with 34 impressions and 0 clicks — thin content on a page where Bartact invented the category.**

### The Rule
**Every Bartact collection page — existing or new — must meet the 1,500-word target and 1,000-word minimum.** There is no grandfathering. A page that was "good enough" when it was published is not good enough now if it's below standard.

### "Invented by Bartact" — Mandatory on All Grab Handle Pages
Bartact invented the paracord grab handle. This is a unique authority signal no competitor can copy or claim. It MUST appear on EVERY grab handle collection page:
- `/collections/jeep-wrangler-grab-handles`
- `/collections/jeep-wrangler-jl-jlu-grab-handles`
- `/collections/jeep-wrangler-jk-jku-grab-handles`
- `/collections/jeep-gladiator-grab-handles`
- `/collections/ford-bronco-grab-handles`

Suggested framing: *"Bartact invented the paracord grab handle — the original, custom-engineered for Jeep Wrangler. Every grab handle on the market today is following Bartact's lead."*

### Compliance Audit Process
1. Pull ALL Bartact collection page handles via Shopify API
2. For each page, fetch current `body_html` from Shopify API response (NOT input — post-sanitizer count)
3. Count words in the API response body
4. Any page under 1,000 words → immediately queue for expansion
5. Any page between 1,000–1,500 words → queue for expansion within 7 days
6. Report: X/total pages compliant
7. The audit is NOT complete until EVERY page meets the standard — not "most", not "the priority ones"

### Content Must Be Verified at Source
- **Compliance is not determined by what you wrote** — it's determined by what the Shopify API returns after sanitization
- Always verify word count from the API response body after every push
- A page that looked 1,800 words in your script can come back 900 words after Shopify processes it
- See Section 8 (Shopify sanitizer rules) for word count buffer guidance

---

## 22. COMPLIANCE VERIFICATION PROTOCOL — MANDATORY FOR ALL BOTS

**Added 2026-08-11. Root cause: bots self-reported pages as compliant without re-fetching live word counts. Pages claimed as done had 278–419 words. The rule was always there — enforcement was missing.**

### Rule 1: Never Self-Report Compliance

A page is **NOT** compliant because you wrote content for it. It is compliant when:
1. You push the content to Shopify via GraphQL mutation
2. You read back `collection.descriptionHtml` from the **mutation response** (not from your script's input variable)
3. You count words on that response body
4. The count meets the floor

If you cannot confirm the live word count from the API response, the task is NOT done. Do not tell Mitch it's done.

### Rule 2: Weekly Word Count Sweep — Every Sunday

Every Sunday, run a word count check across all priority Bartact collection pages (the 14 in the priority list at minimum — ideally all 119). If any page drops below 1,500 words from any cause (theme update, bulk edit, botched push), flag to Mitch immediately and fix same day. The sweep script is: `scripts/bartact-full-audit.js`.

### Rule 3: Audit Existing Pages Before Writing New Content

Before writing content for any new collection page, run `bartact-full-audit.js` to confirm existing priority pages are compliant. Do not add new content to a noncompliant house.

### Rule 4: The 1,500-Word Rule Is Retroactive — No Grandfathering

Every Bartact collection page — whether it was published in 2018 or 2026 — must meet the 1,500-word floor. There is no "was compliant when it was published" exception. If it's below 1,500 words today, it needs to be fixed.

### Rule 5: Word Count Standards by Page Type

| Page Type | Minimum | Target | Notes |
|---|---|---|---|
| Collection pages | 1,500w | 1,700w | Buffer above floor — edits and theme updates can shrink pages |
| Hero product pages (seat covers, grab handles) | 500w | 700w | Full fitment, material specs, FAQ |
| Standard product pages | 300w | 400w | At minimum: what it is, what it fits, why Bartact |
| Blog posts | 800w | 1,200w | Thin blog posts don't rank |
| Utility pages (gift card, patches, accessories) | 100w | 200w | Floor is lower — these don't rank for money keywords |

### Rule 6: Reporting Format — No Exceptions

No bot may tell Mitch a content task is "done" without providing all three:
1. **Live word count** — from the API response body, not from the script input
2. **IndexNow status** — HTTP status code from `api.indexnow.org`
3. **Google Indexing API status** — "submitted" or specific error (quota, creds missing, etc.)

Example compliant report:
```
✅ jeep-gladiator-grab-handles: 1,910w live | IndexNow: 200 OK | Google Indexing: submitted
```

Example non-compliant report (never send this):
```
✅ jeep-gladiator-grab-handles: done
```

### Rule 7: Product Page Floor Is Now Enforced

Full audit run 2026-08-11 found 147/255 active products below 300w. Fix priority:
1. Hero products (seat covers, grab handles, fire extinguisher mounts) — 500w target
2. Storage bags, MOLLE panels, console covers — 300w minimum
3. Accessories, patches, keychains — 100w floor (lowest priority)

Product descriptions must include at minimum: what the product is, exact vehicle fitment (year/make/trim), key material/feature, and why Bartact.

---

## 25. GOOGLE INDEXING API QUOTA PRIORITY — NON-NEGOTIABLE

**Added 2026-08-11. Mitch's direct directive.**

All properties using the `axl-348@proud-stage-397621` service account share a single 199 URL/day Google Indexing API quota. Bull Strap has 78,820+ Turn14 product URLs being dripped at 199/day — if Turn14 runs before our money pages, our own sites get nothing.

**NOTE on credentials:** Bartact/affiliates use `axl-348@proud-stage-397621` (service account). Bull Strap's crons use separate OAuth2 user credentials (`.bullstrap-merchant-center-credentials.json` / `.bullstrap-indexing-credentials.json`) — technically a different 199/day quota pool. However, Mitch's directive (2026-08-12) imposes a hard cap of 119/day on Bull Strap's priority sweep regardless, implemented via shared quota state file (`memory/bullstrap-indexing-shared-quota.json`).

### Bull Strap Internal Quota Split (enforced 2026-08-12)

Within Bull Strap's own 199/day OAuth2 quota, the two indexing crons are hard-capped:

| Cron | Script | Daily Cap | Priority |
|---|---|---|---|
| Priority Sweep | `bullstrap-priority-sweep.js` | **119 MAX** | #1 — high-value Carli/suspension products |
| Full Catalog | `bullstrap-full-indexing.js` | **80 MAX** (199 − 119) | #2 — Turn14 long tail |

- Both crons read/write `memory/bullstrap-indexing-shared-quota.json` (resets midnight UTC)
- Priority sweep hard-stops at 119 regardless of time of day — continues SEO fixes without submitting
- Full-indexing reads shared quota first; gets max 80 of whatever the priority sweep left unused
- Check today's usage: `cat memory/bullstrap-indexing-shared-quota.json`

### The Rule: Our Pages Eat First, Turn14 Eats Last

Priority order — quota must be consumed in this order every day:

1. **Bartact.com** — always first. 638 URLs rotating (products 318 + collections 119 + blog posts ~170 + pages ~31)
2. **Our owned properties** — SkipATip, Faithful Passages, brazenauto.com, and the DO NOT TOUCH sites (factorfilters.com, thedailycheer.com, recentratings.com, hspseats.com, fernallern.com, thornwoodaccord.com)
3. **Affiliate sites** — Filli's network (~112 sites)
4. **Bull Strap Turn14 bulk catalog** — LAST. Low-priority filler on bullstrap.com. It will never finish anyway (78,820 URLs ÷ 199/day = 396 days). There is zero reason to let it starve our real pages.

### Cron Schedule — Enforced Order (UTC)

| Time (UTC) | Cron | Priority |
|---|---|---|
| 0:15 | **Bartact Full-Site Indexing** | ✅ #1 — Bartact always first |
| 0:30 | Owned properties (SkipATip, Faithful Passages, DO NOT TOUCH sites) | ✅ #2 — our owned sites |
| 0:45 | Affiliate Sites Indexing (daily) | ✅ #3 — affiliate network |
| 12:00 | Filli Google Indexing API | ✅ #3 continued — additional affiliate coverage |
| 23:00 | Bull Strap Full Catalog (Turn14 on bullstrap.com) | ⬇️ #4 — leftover quota only |

### What Changed 2026-08-11
- Bartact indexing cron (`7c688931`) expanded from 73 seat cover URLs → **all 638 Bartact URLs** rotating at 199/day. Script: `scripts/bartact-full-site-indexing.js`
- Bull Strap Full Catalog cron (`81210002`) moved from **12:00 UTC → 23:00 UTC** (last slot)
- Bartact cron fallbacks cleared to `[]`

### Applies To Any New Indexing Cron
Whenever a new Google Indexing API cron is created, it must be scheduled BEFORE `23:00 UTC` and BEFORE the Bull Strap Turn14 cron. Turn14 always runs last. No exceptions.

### Bartact Full-Site Indexing — How It Works
- Script: `scripts/bartact-full-site-indexing.js`
- Fetches all 4 URL types from Shopify API with full pagination on first run, caches for 7 days
- Rotates through ~638 total URLs at 199/day → full rotation every ~4 days
- State file: `memory/bartact-full-indexing-state.json` (tracks position in rotation)
- Every page gets submitted to Google roughly twice a week

---

## 24. OPERATIONAL FAILURE RULES — LEARNED 2026-08-11

**Added 2026-08-11. All five rules below came from direct Mitch flags during the Bartact product audit. Non-negotiable.**

### Rule 1: Large Tasks Must Be Phased With Checkpoints

Any task involving 100+ API calls, content generation, AND indexing submissions in a single session WILL blow the context window (138K token limit confirmed). When it blows, the session crashes mid-task and Mitch has to manually intervene.

**The rule:** Break large multi-phase tasks into explicit phases. Checkpoint between each phase by writing progress state to a file. If continuing in a new session or cron, read that state file first.

Phase structure for large Bartact tasks:
1. **Audit phase** — fetch all records, count them, write results to JSON state file
2. **Fix phase** — read state file, process in batches of 25-50, write progress after each batch
3. **Verify phase** — re-fetch counts from API, confirm numbers match, THEN report
4. **Index phase** — submit to IndexNow + Google Indexing API as a separate step after verify

Never combine all four phases in a single session run. Write state between phases.

### Rule 2: Always Paginate Shopify API Calls — No Exceptions

Shopify's REST API returns **250 records max per page**. GraphQL has its own pagination limits. If you don't paginate, you get a partial dataset and report a wrong number.

**The rule:** Every bulk Shopify fetch MUST paginate until no `Link: <...>; rel="next"` header is present (REST) or `pageInfo.hasNextPage` is false (GraphQL). After any bulk operation, verify the processed count against the `/count.json` endpoint (or `totalCount` in GraphQL) before reporting done.

```js
// REST — correct pagination pattern
let url = `https://${SHOP}/admin/api/2024-01/products.json?limit=250&status=active`;
let allProducts = [];
while (url) {
  const res = await fetch(url, { headers: { 'X-Shopify-Access-Token': TOKEN } });
  const data = await res.json();
  allProducts.push(...data.products);
  const link = res.headers.get('Link') || '';
  const next = link.match(/<([^>]+)>;\s*rel="next"/);
  url = next ? next[1] : null;
}
// Then verify:
const countRes = await fetch(`https://${SHOP}/admin/api/2024-01/products/count.json?status=active`, ...);
const { count } = await countRes.json();
if (allProducts.length !== count) throw new Error(`Pagination gap: got ${allProducts.length}, expected ${count}`);
```

**Confirmed failure:** 2026-08-11 audit reported 255 active products. Actual count: 318. 63 products missed. Bartact bot had to fix the remaining 192 thin products after the session crashed.

### Rule 3: Full-Site IndexNow Blast = ALL Four URL Types

A Bartact "full site IndexNow submission" covers **638 indexable URLs** across four types:
- Products: 318 active
- Collections: 119 published
- Blog posts: ~170
- Static pages: ~31

**The rule:** Never submit only one URL type and call it a full submission. Use the Shopify API to fetch all four types:
- Products: `/admin/api/2024-01/products.json?limit=250&status=active` (paginate)
- Collections: `/admin/api/2024-01/custom_collections.json` + `/admin/api/2024-01/smart_collections.json` (paginate both)
- Blog posts: `/admin/api/2024-01/blogs/{blog_id}/articles.json?published_status=published` (paginate)
- Pages: `/admin/api/2024-01/pages.json?published_status=published`

Build the full URL list from all four, then submit in a single IndexNow POST (max 10,000 URLs per call).

**Confirmed failure:** 2026-08-11 — only product URLs submitted to IndexNow. 320 collections + blog posts + pages missed entirely.

### Rule 4: Every New Cron Must Explicitly Set Model — Then Verify

Crons that don't explicitly set the model field inherit the default, which may be a myclaw/ model that burns myclaw credits. This has happened repeatedly.

**The rule:** Every time you create a new cron:
1. Set `model: "anthropic/claude-haiku-4-5"` explicitly in the cron config
2. Set `fallbacks: []` explicitly (empty array — no fallback that could route to myclaw/)
3. After creating, immediately read the cron record back and confirm those two fields are set correctly
4. Do NOT mark the cron creation as done until the verification read confirms it

This is not optional. This is not "probably fine." Every cron. Every time.

### Rule 5: Bulk Operation Completion Requires a Final Verification Read

Section 22 already says this for content tasks. Expanding it to ALL bulk operations.

**The rule:** No bulk operation is complete until you've done a final independent verification:
- Bulk product update → hit `/products/count.json` and confirm count matches what you processed
- Bulk collection update → hit `/custom_collections/count.json` + `/smart_collections/count.json`
- Bulk IndexNow submission → confirm the response was HTTP 200 and log the URL count submitted
- Bulk Google Indexing API → confirm no quota errors and log URLs submitted vs quota remaining

The verification must come from the API — not from your script's input variables, not from your loop counter. The API is truth. Your counter is a guess.

**Format for reporting bulk operations:**
```
✅ Products: processed 318/318 (verified via /count.json = 318)
✅ IndexNow: submitted 638 URLs (products 318 + collections 119 + posts 170 + pages 31) — HTTP 200
✅ Google Indexing API: 199 submitted, 0 quota errors, 119 remaining in today's quota
```

---

## 23. MANDATORY FULL AUDIT — ALL COLLECTIONS + ALL PRODUCTS (STANDING RULE)

**Added 2026-08-11. Root cause: the 119-collection + 255-product audit only happened because the session crashed and a new session caught the gap. The audit should be a standing, scheduled process — not a one-time catch-up.**

### The Rule
**Before ANY Bartact SEO content work begins in a session, run `bartact-full-audit.js` first.** Do not write new content for a page until you know whether existing pages are compliant. Do not add to a noncompliant house.

### Mandatory Audit Triggers
The full audit (`scripts/bartact-full-audit.js`) MUST be run:
1. **Before any session starts Bartact SEO work** — always. No exceptions.
2. **Every Sunday** — standing weekly sweep (Section 22, Rule 2)
3. **After any bulk content push** — confirm pages held their word count post-sanitizer
4. **After any Shopify theme update** — theme changes can strip metafields and body_html

### What the Audit Covers
- ALL published Bartact collections (currently 119) — word count from `descriptionHtml` via GraphQL
- ALL active Bartact products (currently 255) — word count from `bodyHtml` via GraphQL
- Results saved to `memory/bartact-full-audit.json`

### Audit Report Format — Required
```
BART ACT FULL AUDIT — [date]
Collections: X/119 compliant (≥1,500w) | Y flagged (under floor)
Products: X/255 compliant (≥300w hero / ≥100w utility) | Y flagged
Next: [what gets fixed first]
```

### Why This Is Standing — Not One-Time
- Shopify sanitizer can silently shrink pages on theme updates or bulk edits
- New collections get added — each starts at 0w and needs content
- Product descriptions reset when Turn14/DH2T sync runs — must be re-verified
- The scope changes: 119 collections today, might be 125 next month
- No audit = flying blind. The Aug 11 crash revealed 9 priority pages were non-compliant after months of "done" being claimed.

### Scope as of 2026-08-11
- 107/119 collections compliant (≥1,500w)
- 12 under floor: overstock-clearance (113w), bull-strap (129w), all (154w), bull-strap-tie-downs-and-recovery (158w), accessories (158w), barktact-dog-gear (158w), uncategorized (0w), miscellaneous-1 (54w), new-products (62w), best-sellers (62w), hvac-filters (62w), bull-strap-heavy-duty-2-ratchet-tie-downs (86w)
- 108/255 products compliant | 147 thin | 4 empty (morale patches)
- Hero seat cover SKUs: 260–300w → target 500w+
