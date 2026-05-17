# Affiliate Site Launch & Ranking System

_Last updated: 2026-04-20_

This is the standard operating procedure for launching a new affiliate site and keeping
every existing site ranking healthy. Runs fast, enforceable via scripts, Mitch-proof.

## Why this exists
Affiliate sites only rank if Google/Bing can find them, crawl them, trust them, and
connect them to real search queries. A scattered build breaks at least one of those
every time. This system enforces all four consistently across the network.

---

## The 10-step launch sequence

Run for every NEW affiliate site, in order. Script names reference
`/home/ubuntu/.openclaw/workspace/scripts/`.

### 1. Build the site files
- Use the canonical affiliate template (nav, footer network block, schema hooks, disclosure)
- Every page must have: `<title>` (50–60 chars), `<meta name="description">` (150–160 chars),
  canonical `<link>`, Open Graph tags, JSON-LD schema where relevant
- Every product/category card image must pass `scripts/duplicate-image-audit.js` and
  `scripts/semantic-image-audit.js`
- No fake claims, no made-up prices, Bartact wording from `reference/bartact-correct-data.md`
- Contact form at `/contact.html` (standard Web3Forms stub, see reference template)

### 2. Pre-push QA bundle
Run **all three** and fix any failures before committing:
```
node scripts/duplicate-image-audit.js       # no dup images per page
node scripts/semantic-image-audit.js        # image category matches heading
node scripts/harvest-images-all.js && node scripts/verify-harvest-all.js   # no dead Amazon IDs
```

### 3. Create GitHub Pages repo + CNAME
- Repo under `Brazenproducts` org
- `CNAME` file in repo root with bare domain
- Enforce HTTPS on GitHub Pages after cert provisions (~5–20 min after DNS)

### 4. Point DNS (GoDaddy API)
```
bash scripts/godaddy-github-dns.sh <domain>
```
This flips A records to GitHub Pages IPs (185.199.108–111.153) + adds www CNAME.

### 5. Push to GitHub + wait for live
Typical propagation: 1–5 min for initial serve, 5–20 min for HTTPS cert.
Verify:
```
curl -sI https://<domain>/ -o /dev/null -w "%{http_code}\n"  # expect 200 or 301→200
```

### 6. Search Console domain verification
```
node scripts/verify-affiliate-sc.js <domain>
node scripts/verify-retry.js <domain>    # after DNS TXT propagates
```
This adds the Google Site Verification TXT record via GoDaddy API and then
confirms verification on Search Console. MUST complete before step 7.

### 7. Submit sitemap
```
node scripts/submit-sitemaps.js <domain>
```
Submits `https://<domain>/sitemap.xml` to Search Console.

### 8. IndexNow submission
```
node scripts/indexnow-submit.js <domain>
```
Submits every URL in the sitemap to Bing/Yandex via IndexNow API.
Key file (`b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5.txt`) must be in repo root.

### 9. Internal linking audit
Every new page should link to:
- at least 1 money page on the same site
- at least 1 relevant site elsewhere in the network (if vehicle/category overlap)
- Bartact / Bull Strap collection pages where vehicle coverage applies
  (Wrangler TJ/JK/JKU/JL/JLU, Gladiator, Tacoma 2005–2023, 4Runner 2010–2024, Bronco 2021+)

### 10. Set up blog cron (if site is content-rich)
- 2–3 posts/week cadence
- Topic pool from Search Console opportunity keywords
- Every post auto-submitted to IndexNow + sitemap updated on publish

---

## Network health — weekly automated checks

Run via cron every Monday 10:00 UTC (3 AM PDT):
```
node scripts/affiliate-network-qa.js --weekly
```
(see below — this script ties it all together)

Reports any:
- Dead Amazon IDs (broken product images)
- Duplicate card images on same page
- Category-mismatched images
- Missing contact.html / missing Web3Forms key
- Exposed email addresses
- Missing Search Console verification
- Missing sitemap or stale sitemap (> 30 days old)
- Pages with fewer than N internal links
- Pages with thin content (< 500 words)

Output: `memory/weekly-network-qa-<date>.md` + Discord/email alert if any red flags.

---

## SEO defaults on every page

### `<head>` template
```html
<title>{Descriptive + year, 50–60 chars}</title>
<meta name="description" content="{Benefit-led, 150–160 chars}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="https://{domain}{path}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="https://{domain}{path}">
<meta property="og:type" content="article">
<meta property="og:image" content="{primary product image URL}">
```

### JSON-LD schema (per page type)
- **Review pages** → `Review` + `ItemList` with each product as a listItem
- **Buyers guides** → `Article` + `FAQPage` if Q&A section present
- **Vehicle pages** → `ItemList` of products with `Vehicle` subject property
- **Home pages** → `WebSite` + `BreadcrumbList`

### Internal link density
- Target 3–7 internal links per page
- Link anchor text descriptive (not "click here"); use target keyword + context
- Link from blog posts → money pages consistently

### Image SEO
- Descriptive `alt` on EVERY product/category image
- `loading="lazy"` on all below-the-fold images
- `loading="eager"` on hero / LCP image only
- Prefer Amazon's `_AC_SL1500_.jpg` variant (large enough for CTR, not so large it tanks LCP)

---

## Blog content pipeline

### Topic sourcing
1. Export Search Console queries with impressions > 50 and CTR < 2%
2. Filter for queries where site has page 2/3 rankings but not page 1
3. Draft a dedicated content piece targeting each (1,200–2,000 words)
4. Cross-link back to the main money page + 1–2 network sites

### Cadence rules
- 2–3 posts/week per site MAX (quality over quantity)
- Never auto-publish an unverified-image post — must pass all 3 audits
- Monday/Wednesday/Friday publish slots (US morning)

### Post structure
- H1 with target keyword (near-exact match but natural)
- 80–120 word intro answering the query directly
- H2 sections with logical flow
- Real product recommendations with affiliate links (Amazon `tag=brazenprodu01-20`)
- FAQ section near bottom (feeds `FAQPage` schema)
- Internal links in first 1/3 + conclusion
- Author byline + date + updated date

---

## Cross-linking network rules

Network sites cross-link to each other based on audience overlap. Canonical map:

- **Seat covers cluster:** bestseatcover, jeepseatcover, wranglerseatcover, jlseatcovers,
  tacticalseats, tacticalseatcovers, tacomaseats, broncoseatcover, gladiatorseatcover,
  cybertruckseatcovers → all cross-link
- **Trucks cluster:** besttruckaccessories, besttonneaucovers, topoffroadstores,
  autopartsreviewed, bestoffroadbrands, cybertruckbumpers/shell/tires/etc → all cross-link
- **Bronco cluster:** bestbroncoaccessories, broncobumper/grab/handles/molle/lift/rollbar
  /rollcage/tent/tents/headliner/interior/upgrade/floormats/biminis/shade/tops/cargo/
  exterior, broncoseatcover, broncolift → all cross-link
- **Off-road cluster:** topoffroadstores, bestoffroadbrands, autopartsreviewed,
  slatetruckparts, sportadventurevehicleparts, ramrevparts, scout*parts
- **EV cluster:** rivianaftermarket, r1sparts, r1sstorage, r1tparts, r1tstorage,
  r2sparts, r2tparts, cybertruck*
- **General:** whatarebest → links to all major clusters

Bartact + Bull Strap product links whenever vehicle coverage applies (see vehicle list above).

---

## Anti-patterns (what breaks ranking)

See `memory/affiliate-site-issue-patterns.md` for the full list. TL;DR:
1. Duplicate card images
2. Wrong-category card images
3. Dead Amazon IDs (404 images)
4. Empty card images after strip
5. Editing wrong repo (use `git remote -v`)
6. Broken outbound merchant links
7. Bad Bartact material wording
8. Made-up prices or specs
9. Empty alt text on product images
10. Homepage cards linking to merchants directly (should link to internal roundups)

---

## Ongoing Quality Standards (NON-NEGOTIABLE)

These checks apply to EVERY site — new builds AND existing sites. Run before every push
and during weekly QA sweeps.

### 1. Text Contrast on Hero/Banner Sections
- Every hero/banner with a background image or dark overlay MUST have white text (#ffffff)
- Subtitle/body text: #f0f0f0 or lighter
- text-shadow: 0 2px 10px rgba(0,0,0,0.4) minimum
- Overlay: min rgba(0,0,0,0.5) when using background images
- NEVER use CSS variables (var(--gray-900), var(--muted)) for text on dark backgrounds
- Visual verify before push — Mitch should never catch this

### 2. Product Image Accuracy
- Every product image must match the product being discussed
- No placeholder/stock photos — use real product images from Amazon, Shopify CDN, or manufacturer
- No AI-generated images unless explicitly approved and QC'd against real product specs
- Factor Filter = white cardboard frame + diamond/X expanded-metal grid (NOT square mesh, NOT metal frame)
- Run image audit before push: do images match headings/product names?

### 3. Professional Appearance
- Sites must look like real editorial/review sites, not quick template dumps
- Consistent nav, footer, typography, spacing
- No broken layouts, overlapping elements, or unstyled sections
- Mobile responsive — check at 375px width minimum
- No lorem ipsum, placeholder text, or TODO comments in live HTML

### 4. SEO (Non-Spammy)
- Title tags: 50-60 chars, descriptive, include primary keyword naturally
- Meta descriptions: 150-160 chars, benefit-led, not keyword-stuffed
- H1: one per page, matches search intent
- Image alt text: descriptive, not keyword-stuffed
- No hidden text, no cloaking, no doorway page patterns
- Content must be genuinely useful (min 500 words on money pages)
- JSON-LD schema on every page (Article, Review, FAQPage as appropriate)

### 5. Google Indexing
- Search Console verified (sc-domain: via DNS TXT)
- Sitemap submitted and up-to-date
- IndexNow pinged on every content update
- No accidental noindex/nofollow tags
- Check indexing status weekly — flag any drops

### 6. Working Backlinks
- All outbound links tested (no 404s, no redirect chains > 2 hops)
- Bartact links → specific collection URLs (not generic bartact.com)
- Bull Strap links → specific collection URLs
- Factor Filter links → factorfilters.com (correct domain)
- Internal cross-links between network sites per cluster rules
- Weekly broken link scan

### 7. Amazon Affiliate Integration
- All Amazon links use tag=brazenprodu01-20
- Product images sourced from real Amazon listings (not dead ASINs)
- No affiliate links on pages where products aren't actually available on Amazon
- Run `scripts/harvest-images-all.js && scripts/verify-harvest-all.js` to catch dead IDs

### 8. Content Freshness
- Every site gets content updates at minimum monthly
- Blog posts: 2-3/week on content-rich sites (Mon/Wed/Fri)
- "Updated" dates must reflect actual updates, not fake freshness signals
- Seasonal content refreshed before relevant season
- Product recommendations updated when prices/availability change

### Weekly QA Sweep (automated)
Run `node scripts/affiliate-network-qa.js --weekly` every Monday.
Additionally, manually spot-check 5 random sites per week for:
- Visual appearance (does it look legit?)
- Hero text readability
- Image relevance
- Link functionality
- Mobile layout

---

## Social / YouTube ecosystem (summary — full plan in separate doc)

Hub-and-spoke: a few umbrella brand accounts feed content to niche site clusters.
Central posting from one API layer per platform. Every new blog post auto-crossposts
to the appropriate hub account(s). Full architecture in `reference/affiliate-social-architecture.md`
when that doc exists.
