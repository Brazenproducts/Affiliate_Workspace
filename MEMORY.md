## 🔑 GOOGLE ADS RE-AUTH — HOW TO DO IT (30 SECONDS, NOT 45 MINUTES)
When `.google-ads-credentials.json` is missing or has invalid_grant:
1. Run local OAuth server on port 9876 (node script that catches the callback)
2. Give Mitch ONE URL to open in browser signed in as bartactinc@gmail.com
3. He clicks Allow, gets redirected to localhost:9876/callback with a code in the URL
4. Exchange the code server-side immediately — DO NOT send Mitch to OAuth Playground, DO NOT ask him to paste tokens
5. Done. Token saved automatically.

Client ID: `351767043397-mkr950se4f5ot5km83h5eho9q0agvvlk.apps.googleusercontent.com`
Client secret: `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`
Dev token: `TIfup5TmHbbX3ICzZFZh2w`
Customer ID: `1770651698` | MCC: `3931546976`
Creds file: `/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json`

⛔ NEVER send Mitch to OAuth Playground. NEVER ask him to paste tokens. Run the local server, give him one URL, catch the callback yourself.

## ⛔ NO SUBAGENTS WITHOUT MITCH'S APPROVAL — HARD RULE (2026-07-21)
- NEVER spawn a subagent (sessions_spawn) without explicit approval from Mitch first
- Subagents use weaker models and have caused problems (timeouts, bad output, breaking things)
- If a task seems like it needs a subagent, ASK MITCH first and explain why
- This applies to ALL bots: Slashdaddy, Bartact, Filli, any cron-spawned isolated sessions

## ACCOUNT CREDENTIALS
- **Amazon Associates**: `info@brazenauto.com` / `Fuckitall69!` (capital F — confirmed 2026-07-24) | Tag: `brazenprodu01-20`
- **GitHub**: `Brazenproducts` / `Fucktrek69!`
- **Amazon Creators API Client ID**: `amzn1.application-oa2-client.1f5cc922103448c0b9cf9857a75b1959`
- **Bartact Shopify token**: `REDACTED_SHOPIFY_TOKEN`

## GODADDY CREDENTIALS (updated 2026-08-04)
- **New PAT (080426)**: `gd_pat_t6cs0SUXv0CvHYhOyZh8Av3ya2kitbjV1h8ruCo7AB2_467fe711`
- **Auth header**: `Authorization: Bearer <token>` (NOT sso-key format — old key dead)
- **Login**: `walkwayinc@gmail.com` / `Fuckthis69!!!` | Customer #: `28649509`
- **Scope**: DNS Read/Write being added by Mitch — do NOT use for DNS until confirmed
- **Old key** `9QCBbdvZc9n_N3jPNv71WzKBpDcn8XCmyV` — DEAD, expired July 27

## ELIPACKO AFFILIATE SITES — HARD RULES
- **NO PRICING on any affiliate site** — EVER. We don't know Elipacko's prices. All pricing tables and dollar amounts for Elipacko products are FAKE and must not appear.
- Replace any pricing with: "Contact Elipacko directly for factory-direct pricing"
- This applies to all 28 affiliate sites and elipacko-usa.com
- Script to check: `grep -r "\$[0-9]" elipacko-sites/ elipacko-usa.com/ --include="*.html"`

## ANTI-DUMPING DUTY — CORRECT LEGAL POSITION (updated 2026-08-05)
- **NEVER say "0% ADD" without the Thailand qualifier** — it is legally false for China/Vietnam product
- **China**: US DOC initiated ADD investigation April 2025; preliminary determination August 26, 2025: **83.64% ADD rate** (73.10% adjusted after CVD offset)
- **Vietnam**: Also under ADD investigation (initiated April 2025) — NOT safe to claim 0%
- **Thailand**: NOT named in investigation — 0% ADD claim is valid ONLY for Thailand-manufactured product
- **Correct language**: "0% anti-dumping duty on Thailand-manufactured product — confirm HTS code with your customs broker"
- **FAQ answers**: Never answer "No" to "is there ADD from China" — answer must note the 2025 investigation
- Script to check: `grep -r "not subject to US anti-dumping" elipacko-sites/ --include="*.html"`

## BARTACT SEO RULES — PROPAGATED 2026-07-20 (apply to any Bartact-related work)
- **Title tags**: keyword FIRST, brand LAST, max 65 chars. Pattern: `[Keyword] — [Differentiator] | Bartact`. Never start with "Bartact" unless brand IS the product name.
- **Meta descriptions**: max 160 chars (hard), min 80 chars. Must include: vehicle fitment, key material/feature, "Made in USA".
- **Patent/legal claims — CRITICAL**: ONLY use "patent pending" or "patented" if the product description ALREADY says it. Products WITH patents: winch covers, sun shades (JL/JLU/Gladiator), MOLLE seat back panel, Bronco door storage, Bronco console organizer, console organizer door pouch (JL/JLU/Gladiator), JLU aluminum roll bar fire extinguisher mount. Products WITHOUT patents: grab handles, standard roll bar fire extinguisher holder. When in doubt: DO NOT add "patent pending."
- **Keyword cannibalization**: each collection/product page owns ONE distinct keyword. Link to SPECIFIC vehicle collections, not umbrella.
- **Bartact differentiators**: "custom-cut not universal fit", "Cordura 400D/1000D", "Berry Amendment compliant", "invented by Bartact" (grab handles), "only manufacturer".
- **Image alt text**: Pattern: `[Product Name] — [vehicle fitment] — [key material] | Bartact`. Never blank. Vary across multiple images. No keyword stuffing.
- Full brief at: `memory/bartact-seo-intel-2026-07-20.md`

## YELP API CREDENTIALS
- **API Key**: `lhArGjZT4ldEagxumH5QxVMkSV58_CZwPOnFGOIhfYLe9onwj_t4LQBvQZNl-hZND5A6SPi1GaYAEu1JXlDiAdyMLqB8vsM9V6qRf3ik4WMp0rAO8eO6FMd8T0tqanYx`
- **Client ID**: `R32-QIDvL3g4ItW-TfBPdQ`
- **App Name**: Brazen | **Account**: info@brazenauto.com
- **Saved to**: skipatip/.env.local as YELP_API_KEY

## VERCEL TOKEN
- **Token**: `REDACTED_VERCEL_TOKEN`
- **Saved to**: skipatip/.env.local as VERCEL_TOKEN
- **Plan**: Base (free) — 500 req/day, 3 reviews/business with timestamps
- **Use**: SkipATip review pipeline supplement (free nationwide coverage)

## APIFY CREDENTIALS
- **API Key**: `REDACTED_APIFY_TOKEN`
- **Account**: Brazenproducts | Plan: Starter ($29/mo, $29 credits)
- **Actor**: `Xb8osYTtOjlsgI6k9` (Google Maps Reviews Scraper — 142M runs)
- **Scraper script**: `skipatip/scripts/data-pipeline/apify-reviews.js`
- **Usage**: `node apify-reviews.js --city=Temecula --state=CA --limit=100`

## ELIPACKO DOMAIN AVAILABILITY CHECK — 2026-08-03
Available to buy on GoDaddy:
- ppdividers.com ✅
- plasticdividers.com ✅
- pptrays.com ✅
- ppturnoverboxes.com ✅
- plasticturnoverboxes.com ✅
- returnabletotes.com ✅
- ppstorageboxes.com ✅
- ppballotboxes.com ✅
- plasticballotboxes.com ✅

Already taken (don't try):
- plastictrays.com ❌
- plasticstorageboxes.com ❌
- plasticstoragebox.com ❌

## ELIPACKO PROGRESS — 2026-08-03
- 5 new elipacko-usa.com pages built: /pp-dividers/, /pp-trays/, /pp-turnover-boxes/, /pp-ballot-boxes/, /storage-moving-boxes/
- 57 new photos added to 11 existing elipacko-usa.com pages (kept all originals)
- 28 affiliate sites updated with new CDN photos (all originals kept)
- customplasticcorrugate.com — new clone, GitHub Pages enabled
- sitemap.xml and robots.txt added to elipacko-usa.com
- All IndexNow submissions: 202 (accepted)
- Next step: buy available domains on GoDaddy and build new backlink sites for dividers, trays, turnover boxes

## ELIPACKO SESSION PROGRESS — 2026-08-03 (continued)
### Photos added to CDN today:
- pp-gaylord-box-1.jpg, pp-gaylord-box-2.jpg, pp-gaylord-box-3.jpg (white PP gaylord boxes)
- pp-gaylord-on-pallet-strapped.jpg, pp-gaylord-on-pallet-lidded.jpg (gaylord on blue PP pallet — dual-use: gaylord + pallet pages)
- meat-lug-white-empty.jpg, meat-lug-5color-set.jpg, meat-lug-filled-meat.jpg

### Pages updated:
- /pp-gaylord-boxes/ — 5 real gaylord photos, all fake warehouse/produce photos removed, gallery CSS fixed (contain not cover, 3-col grid)
- /pp-pallets/ — gaylord-on-pallet photos added (shows blue PP plastic pallet)
- /pp-meat-lugs/ — 3 real meat lug photos added + OG image fixed
- meatlugs.com affiliate — same 3 meat lug photos added
- 4 gaylord affiliate sites (plasticgaylord, plasticgaylordbox, plasticgaylordboxes, gaylordboxesplastic) — 3 gaylord photos added

### Poultry page — NO PHOTOS EXIST:
- /pp-poultry-boxes/ has ZERO real product photos
- All wrong/broken images removed (stock chicken photo, salad bowl, fake warehouses, numbered produce boxes)
- poultry-crate.jpg does NOT exist in CDN
- vegetable-crate.jpg is a salad bowl stock photo — DO NOT USE
- poultry-box.jpg is a stock photo of live chickens — DO NOT USE on any page
- ⚠️ Need Elipacko to send actual PP poultry box / live bird crate photos

### DO NOT USE (additions):
- vegetable-crate.jpg — salad bowl stock photo, not a crate
- poultry-box.jpg — live chickens stock photo, not a PP box
- 82.jpg — "CHARRIES" box (Elipacko misspelling of cherries) — Mitch explicitly banned this
- cherry-box.jpg — same charries product, do not use
- produce------.jpg — crab box, not a produce/agriculture photo

## BULL STRAP SEO — WHAT ACTUALLY WORKS (hard-learned 2026-08-05)

### The Core Problem (now fixed)
DH2T pushes manufacturer copy to ALL retailers every night. CARiD, ExtremeTerrain, RockAuto all have identical content. Google won't rank any of them — it picks the biggest brand. The ONLY way to win is unique content.

The fitment data is the secret weapon. Every Turn14/DH2T product has `fits_` tags:
`fits_2014-2023\`Ram\`2500\`Power Wagon~2014-2023\`Ram\`2500\`Laramie~...`
This data is UNIQUE. No other retailer surfaces it in meta descriptions or body HTML. We do.

### The Three Scripts (DO NOT BREAK THESE)

**1. `scripts/bullstrap-seo-recent-fix.js`** — runs every 15 min via cron `7a25c7d8`
- Fetches products updated since `lastRun` timestamp (catches DH2T syncs)
- Saves timestamp at START of run (SIGTERM-safe)
- Writes: title_tag, description_tag (trim-level fitment), body_html (unique fitment table), image alt text
- State: `memory/bullstrap-seo-recent-fix-state.json`

**2. `scripts/bullstrap-priority-sweep.js`** — runs every 15 min via cron `4e55f402`
- Processes products in CATEGORY ORDER: suspension first, then wheels/tires, exterior, interior
- Suspension brands: Carli, ICON, Fox, Bilstein, Rancho, Fabtech, Skyjacker, SuperLift, Zone Offroad, Old Man Emu, ARB, Eibach, KW, Tein, Whiteline, Moog, ReadyLift, Rough Country, Dobinsons, King
- After fixing each product, immediately submits URL to Google Indexing API
- Saves state per-product (SIGTERM-safe)
- State: `memory/bullstrap-priority-sweep-state.json`

**3. `scripts/bullstrap-fix-turn14-seo.js`** — full catalog sweep via cron `7a25c7d8`
- Sweeps all 103k products continuously
- State: `memory/bullstrap-seo-fix-state.json`

### What Each Script Writes
- **title_tag**: `Brand Category Year | BullStrap` — no doubling, no truncation, no false claims
- **description_tag**: `Carli 14-23 Ram 2500 Coil Springs — fits 2014–2023 Ram 2500. Fits: Big Horn, Laramie, Power Wagon, Tradesman.` — trim-level fitment nobody else publishes
- **body_html**: Manufacturer description + full year/make/model/trim table — unique, beats DH2T generic every time
- **image alt**: `Product Name - product view` etc.

### Why DH2T Can't Win
- DH2T syncs once/day (~9am PT observed)
- Our cron runs every 15 min
- `updated_at_min` query catches exactly what DH2T touched
- We rewrite within 15 minutes, every time
- title_tag and description_tag are metafields — DH2T NEVER touches metafields
- body_html IS overwritten by DH2T but we rewrite it back within 15 min

### What NOT To Do (hard lessons — DO NOT REPEAT)
- NEVER write "Free Shipping" or any shipping/returns claims in titles or descriptions — Bull Strap does NOT offer free shipping; doing this got 39k titles poisoned and likely caused ranking drops
- NEVER turn off Mitch's working systems without inspecting them first — the SEO V2 app was working; I turned it off and replaced it with something broken; this tanked Turn14 sales
- NEVER guess product URLs for testing — fake handles return 404 which looks like broken pages
- NEVER save truncated strings as metafield values — the old script saved `| Bull...` literally; always trim at word boundary
- NEVER fabricate claims of any kind in product content

### Category Authority Strategy
Google needs to see bullstrap.com as a suspension authority before trusting it for other categories.
Priority order: Suspension → Lift Kits → Wheels/Tires → Exterior → Interior → Everything else
The priority sweep script enforces this order automatically.

### Key Facts
- Mitch is an authorized Carli dealer — this matters for trust signals
- Turn14 vendor name is `Carli` (NOT "Carli Suspension")
- DH2T sync time: ~9am PT (16:00 UTC) — NOT midnight as previously assumed
- Shopify timestamps are in PT (-07:00) but accept UTC ISO in API queries
- Google Indexing API quota: 199 URLs/day — priority sweep tracks this
- Indexing creds: `sites/indexing-credentials/.bullstrap-merchant-center-credentials.json`
- Shopify token: `REDACTED_SHOPIFY_TOKEN_BULLSTRAP`
- Store: `bull-strap-78.myshopify.com`
- Blog ID: `96543015185` | Theme ID: `177071489297`

## CARLI IS THE #1 PRIORITY BRAND FOR BULL STRAP
- Carli customers buy Bull Strap limit straps — DO NOT say this explicitly anywhere
- Blog, SEO titles, descriptions, and category content should lead with Carli above all other brands
- Carli blog posts get their own deep-dive template (not the generic brand template)
- Key Carli vehicles: Ram 2500, Ram 3500, Ford F-250, Ford F-350
- Key Carli products: coil springs, track bars, radius arms, bump stop drops, steering stabilizers, shocks
- Bull Strap is an authorized Carli dealer — mention this on product pages and blog posts
- Carli vendor name in Shopify: `Carli` (NOT "Carli Suspension")
- 118 Carli products in catalog — all fixed with fitment data as of 2026-08-05

## BULL STRAP COLLECTION SEO — ADDED 2026-08-05

### Script: `scripts/bullstrap-collection-seo.js` — cron `944775d8`, every 60 min

**What it does:**
1. Creates missing brand collection pages (Carli first — `bullstrap.com/collections/carli-suspension`)
2. Fixes title_tag + description_tag on ALL collection pages — real brands, vehicles, fitment
3. Fixes boilerplate body_html (anything with "competitive prices" or "fast shipping" gets replaced)
4. Submits every fixed collection URL to Google Indexing API + Bing IndexNow + Yandex IndexNow

**Why collection pages matter:**
- "Carli suspension Ram 2500" searches land on COLLECTION pages, not product pages
- Collection pages rank for category-level searches
- Old content was all boilerplate ("competitive prices, fast shipping") — zero SEO value

**Carli collection created:** `bullstrap.com/collections/carli-suspension`
- Title tag: `Carli Suspension Parts — Ram 2500, Ram 3500, Ford F-250, F-350 | Bull Strap`
- Description: full vehicle + trim coverage, authorized dealer mention
- Body HTML: deep content covering Ram 2500/3500 and F-250/F-350 product types

**State:** `memory/bullstrap-collection-seo-state.json`
**IndexNow key:** `b4f7e2a1c3d5f6789012345678a4b5c6`

## ⛔ PROTECTED / DO-NOT-TOUCH SITES — HARD RULE
These are real brand or protected sites. No bot touches them. No Amazon links expected. Never audit for affiliate tags. Never run scripts on them.

- **factorfilters.com** — Mitch's HVAC filter brand (Shopify). No Amazon links. Do not touch ever.
- **limitstraps.com** — Bull Strap brand domain. No Amazon links. Do not touch.
- **fernallern.com** — protected. Do not touch.
- **thornwoodaccord.com** — protected. Do not touch.
- **thedailycheer.com** — protected. Do not touch.
- **stratratchets.com** — brand site. No Amazon links expected.
- **hspseats.com** — protected without Mitch direct confirmation.
- **brazenauto.com** — Brazen Auto brand. Not an affiliate site.
- **bartact.com** — Bartact brand (Shopify). Not an affiliate site.
- **bullstrap.com** — Bull Strap brand (Shopify). Not an affiliate site.
- **skipatip.com** — SkipaTip app. Not an affiliate site.
- **recentratings.com** — RecentRatings app. Not an affiliate site.
- **truckdubai.com / truckuae.com** — international sites, no Amazon affiliate program.

Affiliate health check script exempts all of the above automatically as of 2026-08-07.
