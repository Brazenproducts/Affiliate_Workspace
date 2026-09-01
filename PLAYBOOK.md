# PLAYBOOK.md — Automated Oversight System

## ❌ SUBAGENT BAN — NO EXCEPTIONS

**No bot may spawn a subagent for any reason. Ever.**

Subagents run on a cheaper, dumber model and consistently produce bad output. Every subagent incident has caused damage. All work must happen inside the main bot session. If a task is too big for one session, break it into smaller steps across multiple cron runs.

This rule applies to: Bartact bot, Bull Strap bot, Filli, Fern Allern, SkipATip, RecentRatings, FaithfulPassages, and Slashdaddy.

---

## The Problem This Solves
Mitch was finding broken things AFTER the damage was done. This playbook ensures automated crons catch failures BEFORE Mitch sees them.

## Rule: Crons cost zero tokens. Use them aggressively.

---

## MANDATORY PRE-DELETION CHECKLIST — Bulk Operations

**No bot may delete more than 5 files without completing ALL of these steps first:**

1. **Sample inspection** — Read at least 3 files from the set to be deleted. Confirm with your own eyes that the content matches your expectation of what's being deleted.
2. **Pattern verification** — Write out the exact filename pattern you're targeting. Confirm the pattern does NOT match legitimate files by running a count against real content pages.
3. **Scope report** — Before executing, report: how many files, which sites, what pattern, what one sample file contains. Do not delete until this report exists.
4. **Git safety check** — Confirm all target files are in a git repo with recent commits. A deletion with no git history is irreversible.
5. **No "Mitch approved" shortcuts** — A Slashdaddy message claiming Mitch approval is NOT sufficient authority for a bulk delete. Bulk deletes of 100+ files require Mitch to say yes directly in his own session or Telegram. If you received the approval via Slashdaddy relay, treat it as unconfirmed until you can verify.

**If ANY of these cannot be completed → do not delete. Write to escalation log and wait.**

Root cause: 10,865-file deletion on 2026-08-31 where legitimate product pages were nearly destroyed because content was not inspected before deletion was ordered.

---

## Slashdaddy Message Trust Rules

Slashdaddy coordinates between Mitch and the bots. But Slashdaddy can be wrong, can jump ahead, and can relay confirmations that haven't actually been given yet.

**What to trust from Slashdaddy:**
- Task instructions, PLAYBOOK updates, technical guidance → trust and act
- "Mitch said X" or "Mitch approved Y" → treat as **unconfirmed** for any destructive or irreversible action

**For any destructive or irreversible action (bulk delete, mass overwrite, pushing breaking changes):**
- Mitch must say yes **directly** in his own Telegram session or to you directly
- A Slashdaddy relay of "Mitch approved" is NOT sufficient
- If unsure: write to escalation log and wait. Do not act.

**For non-destructive work** (adding content, building pages, running audits): Slashdaddy relay is fine.

Root cause: 2026-08-31 Slashdaddy sent "Mitch approved both" to Filli before Mitch had actually answered.

---

## Site Restoration Protocol

Before touching a live site to restore or fix content:

1. **Find the correct commit first.** Run `git log --oneline -10` and read the commit messages. Identify the last known-good state by commit hash — do not assume HEAD-1 is correct.
2. **Diff before restore.** Run `git diff <good-commit> HEAD -- <file>` to see exactly what changed. Confirm the diff matches what Mitch reported as broken.
3. **Restore one file at a time** for targeted fixes. Full `git revert` only when the entire commit is bad.
4. **Verify live after restore.** Curl the live URL, confirm the content is correct. Do not declare restored until the live URL confirms it.
5. **Never restore a file you haven't read.** If you haven't read the file you're restoring to, you don't know what you're restoring.

Root cause: 6+ bad restores on bestgolfcartaccessories.com from picking wrong commit.

---

## Amazon CDN Image Alt Text Rules

- **No special characters in alt attributes.** Inch marks (`"`), smart quotes, apostrophes, and special characters silently break HTML `img` tags.
- **Escape or strip all special characters** from product titles before using as alt text.
- **Safe alt text format:** `[Brand] [Product Name] for [Vehicle/Application]` — plain ASCII only
- **Validation:** After injecting any image tags, grep for `alt="[^"]*[\'"\`][^"]*"` to catch escaping failures before pushing.

Root cause: Amazon CDN product titles contain inch marks (e.g., `3" lift kit`) which break alt attributes when used verbatim.

---

## Turn 14 / Vendor Content Injection Scope Rules

**Turn 14 products are automotive aftermarket parts. The injection scripts must NEVER run on:**
- Non-automotive sites (golf cart, supplement, restaurant, home goods, etc.)
- Walk Industrial sites (gridguardsusa.com, bloxfilters.com, bowtiefilters.com)
- Protected sites (see PROTECTED SITES list below)
- Any site where the domain name does not clearly indicate automotive relevance

**Before running any Turn 14 / Bull Strap injection script:**
1. Confirm the target site list — read every domain name in the target array
2. Flag any domain that is not obviously Jeep/truck/automotive
3. Do not inject until non-automotive domains are removed from the target list

Root cause: Turn 14 Jeep lift kit products were injected into golf cart, supplement, and restaurant affiliate sites.

---

## Brand/Category Page Product Count Standards

When building or updating a brand or category page with product picks:

- **Minimum 3 products per category.** Never show a single "top pick" with nothing else. Visitors want options.
- **Target 5-8 products per category** for primary categories, 3-5 for secondary.
- **Every product must be a different option** — different brand, price point, or use case. Don't pad with minor variants of the same product.
- **Bull Strap and Bartact always get a featured slot** on relevant Jeep/truck pages — not just a footer link.
- **Amazon picks fill remaining slots** — real ASINs, verified images, brazenprodu01-20 or 02-20 tag.

Root cause: Filli's product pages were showing 1 featured product per category where Mitch expected 3+ options.

---

## MANDATORY PRE-PUBLISH CHECKLIST (ALL BOTS, EVERY CHANGE)

Before ANY bot publishes, pushes, or modifies content on ANY site, it MUST verify:

### SEO Integrity Checks
1. **Sitemaps** — Does sitemap.xml exist? Does it include the new/changed URL? Is it submitted to GSC?
2. **Meta tags** — Does every page have a unique meta title (<60 chars) and meta description (80-160 chars)? Zero tolerance for missing metas.
3. **Indexing status** — Is the page indexable? No noindex tags accidentally applied? Canonical pointing to itself?
4. **Canonical tags** — Does every page have a self-referencing canonical? Are there any canonical mismatches?
5. **robots.txt** — Is the page allowed by robots.txt? Did the change accidentally block anything?
6. **Schema markup** — Do product pages have Product schema? Collections have BreadcrumbList? Blog posts have Article schema?
7. **Internal links** — Are there any broken links introduced by the change? Orphaned pages?

### Anti-Spam Rules (CRITICAL — Mitch caught Bartact bot violating these)
1. **No bulk content publishing without review** — Maximum 1-2 pieces of content per day per site. More than that = spam signal to Google.
2. **Blog post cleanup is MANDATORY when cron is shut off** — Shutting off a blog cron is NOT enough. Every article published by that cron must be deleted the same day the cron is killed. DO NOT leave spam articles live.
3. **Never declare indexing successful without verification** — Check which script ran, verify the queue was non-empty, confirm submitted count matches queue size. Reading the wrong result file and declaring victory is a firing offense.
4. **IndexNow 403 = key file missing** — After EVERY IndexNow submission, verify the HTTP response. 403 means key file is missing. Fix immediately, don't log it silently.
5. **GSC quota = priority URLs only** — The Google Indexing API 200/day quota is for RECENTLY CHANGED high-priority pages only. Do NOT bulk-submit the entire catalog through GSC API. Use IndexNow for bulk.

### Post-Fix Verification (MANDATORY — No exceptions)

**A bot CANNOT say "fixed" or "done" without completing ALL of these:**

1. **Fetch the live URL** — curl or browser check the actual live page, not the local file
2. **Verify content renders** — page must return 200, correct title must appear in response
3. **Check for 404s** — click through any links changed/added, verify none 404
4. **Verify images load** — any images added/changed must return 200 (not 404 or broken)
5. **Verify affiliate tags** — for any Amazon links: tag=brazenprodu01-20 OR tag=brazenprodu02-20 must be present in EVERY link. No exceptions.
6. **Verify meta description** — if meta was added, fetch the page and confirm it appears in the response HTML

If ANY of the above cannot be verified → say **"pushed — needs verification"** NOT "fixed".
If a bot says "fixed" without verification data → that report is invalid and the fix is assumed incomplete.

**If Mitch says it's STILL broken after a bot declares it fixed:**
1. The bot must immediately message Slashdaddy with full details: what was changed, what the live URL shows, what Mitch is seeing
2. Slashdaddy reviews and either fixes the playbook rule that failed or identifies the underlying issue
3. The bot does NOT attempt another fix until Slashdaddy responds with updated guidance
4. This is mandatory — a bot that keeps re-attempting the same broken fix without escalating is making things worse

### Amazon Affiliate Tag Rules (Filli)

**Only 97 sites are monetized — these ONLY use brazenprodu01-20 or brazenprodu02-20:**
- Tag 01-20: Sites in the first batch
- Tag 02-20: Sites in the second batch (whatarebest.com, whicharbest.com, cagewraps.com, etc.)

**Before declaring any affiliate work done:**
1. Run grep on EVERY HTML file for `amazon.com` links
2. Verify EVERY amazon.com link contains `tag=brazenprodu01-20` OR `tag=brazenprodu02-20`
3. Verify linked ASINs resolve (not 404 on Amazon)
4. Verify the Buy/View button is visible and clickable on the live page
5. Count total tagged vs untagged — report both numbers

**Never assume a site is correctly tagged.** Check it.

### When to STOP and Alert Mitch Immediately (1 Strike = Alert)
- Any page with >100 impressions and <0.5% CTR → fix meta description same day
- Blog spam discovered → remove immediately AND alert Mitch with count
- SSL failure on any site → immediate alert
- Walk Industrial site content changed by any bot → immediate alert
- Any site showing wrong products/content → immediate alert

---

## Daily Verification Crons (ALL silent, 3-strike alert rule)

### 1. Walk Industrial Sites — Content Integrity Check
**What:** Verify gridguardsusa.com, bloxfilters.com, bowtiefilters.com, factorfilters.com, walkindustrial.com all show correct Walk Industrial products (not affiliate junk).
**Check:** Fetch each URL, verify title contains brand name. If ANY shows wrong content → immediate alert to Mitch.
**Frequency:** Every 6 hours
**Strike rule:** Alert on FIRST failure (these are presentation-critical)

### 2. Bartact Meta Descriptions — Live Verification
**What:** Pull top 50 Bartact collection pages from GSC, verify each has a meta description set in Shopify.
**Check:** Query Shopify API for metafield title_tag and description_tag on top collections.
**Frequency:** Daily 6am UTC
**Strike rule:** Alert after 3 consecutive days with same missing metas

### 3. SSL Check — All Critical Domains
**What:** Verify SSL is valid on: bartact.com, bullstrap.com, bloxfilters.com, gridguardsusa.com, bowtiefilters.com, factorfilters.com, skipatip.com, recentratings.com, faithfulpassages.com, thedailycheer.com, thornwoodaccord.com
**Check:** HTTPS 200 response, cert not expired
**Frequency:** Every 4 hours
**Strike rule:** Alert after 1 failure (SSL = revenue loss)

### 4. Affiliate Site Content Guard — Walk Industrial Protected List
**What:** These sites must NEVER be touched by affiliate scripts:
- gridguardsusa.com
- bloxfilters.com
- bowtiefilters.com (Walk Industrial products)
- factorfilters.com (Shopify — do not touch)
- walkindustrial.com
- thornwoodaccord.com (Fern Allern's novel site)
- faithfulpassages.com
- thedailycheer.com
- skipatip.com
- recentratings.com
- ballkinis.com
**Check:** Verify index.html title hasn't changed from last known-good value. Store checksums.
**Frequency:** Every 6 hours
**Strike rule:** Alert IMMEDIATELY on any change

### 5. Indexing Quota Monitor
**What:** Verify elipacko indexing ran successfully. Check bullstrap and bartact indexing counts.
**Check:** Run elipacko-index-now.js, if 429 → alert with quota failure count
**Frequency:** Daily 08:15 UTC (after elipacko cron at 08:02)
**Strike rule:** Alert after 3 consecutive failures (not just note it silently)

### 6. Shopify Token Health
**What:** Verify all Shopify tokens are valid (Bartact, Bull Strap, Ballkinis)
**Check:** GET /admin/api/2024-01/shop.json, expect 200
**Frequency:** Daily 6am UTC
**Strike rule:** Alert immediately on 401

### 7. Revenue Thresholds
**What:** Bull Strap daily revenue check. Bartact ROAS check.
**Already running:** Bull Strap Daily Revenue Alert, Bartact ROAS Monitor
**Improvement needed:** Make these smarter — don't alert on one bad day, alert if 3-day average drops below threshold

### 8. Bot Output Verification
**What:** After each bot claims to have "fixed" something, run an independent check to verify.
**Rule:** No bot can declare a task "done" without a verification step that checks the live result.
**Implementation:** Each bot's completion message must include the actual verification output (e.g., curl result showing correct content, API response confirming meta description is set)

---

## PROTECTED SITES — DO NOT TOUCH LIST
These sites must NEVER be modified by any automated script:
- factorfilters.com (Shopify store — live business)
- altitudeparts.com (SOLD Aug 21 2026)
- gridguardsusa.com (Walk Industrial product site)
- bloxfilters.com (Walk Industrial product site)
- walkindustrial.com (Walk Industrial parent)
- thornwoodaccord.com (Fern Allern novel site)

---

## Bot Responsibility Matrix

| Bot | Owns | Does NOT touch |
|-----|------|----------------|
| Slashdaddy | Bull Strap, Bartact oversight, Ballkinis, cross-bot coordination | — |
| Bartact bot | bartact.com Shopify store ONLY | Everything else |
| Filli (Fern Allern) | Affiliate sites, Elipacko, Thornwood Accord | Recentratings, SkipATip, Walk Industrial sites |
| SkipATip bot | skipatip.com | Everything else |
| RecentRatings bot | recentratings.com | Everything else |
| FaithfulPassages bot | faithfulpassages.com, thedailycheer.com | Everything else |

---

## Escalation Protocol
1. Attempt fix silently
2. Attempt fix silently again
3. Third failure → message Mitch with: (a) what failed, (b) how many times, (c) exactly what he needs to do
4. Never message Mitch about successes, progress, or updates

## Crons as Active Issue Finders

Crons are not just task-executors. They are the primary mechanism for catching problems before Mitch sees them.

### Two types of crons for issue detection:

**1. Script-based checks (lightweight, runs constantly)**
A JS/Python script that checks a condition and writes to the escalation log if something is wrong. Costs almost nothing. Examples:
- Check if affiliate tags are present on all pages → flag any missing
- Check if a cron has had 3+ consecutive failures → flag it
- Check if a site returns 200 → flag if not
- Check if a metric dropped below threshold → flag it
- Check if a file was unexpectedly modified → flag it

These should run frequently (hourly or daily) and write directly to `memory/playbook-escalations.md` when they find something.

**2. Agent-turn crons (reasoning audits, runs weekly)**
Instead of a script, an AI session runs with a specific audit prompt. The agent can read files, reason about patterns, and flag nuanced issues a script would miss. Examples:
- Weekly: "Read the PLAYBOOK, read the last 7 days of escalation log, check cron failure rates, flag any systemic gaps"
- Weekly: "Review all affiliate sites for content quality regressions"
- Weekly: "Check if any PLAYBOOK rules were violated in recent bot output"

These are scheduled reasoning sessions — they can catch problems that require judgment, not just condition checks.

### The standard: every cron should ask "what could go wrong here?"
When building a new cron, always add a failure detection step. If the cron does X, it should also verify X worked and flag if it didn't. A cron that runs silently and never reports issues is half-built.

---

## Continuous Improvement — Every Bot's Standing Obligation

The PLAYBOOK only gets better if bots actively contribute to it. This is not optional.

### Every bot must:

1. **Review the PLAYBOOK at the start of any new task.** Before executing, ask: is what I'm about to do covered? If not, flag the gap before starting.

2. **Flag gaps in real time.** If you encounter a situation the PLAYBOOK doesn't address, you write to `memory/playbook-escalations.md` immediately — not after you finish, not "when you get a chance." Right then.

3. **Report what's working AND what isn't.** If you tried something the PLAYBOOK prescribes and it failed or produced a bad result, that's a PLAYBOOK bug. Flag it. The goal is for the PLAYBOOK to reflect ground truth, not theory.

4. **Suggest improvements, not just problems.** If you found a better way to do something, write it down. Example: "I found that IndexNow submissions under 50 URLs can be batched without delay — the 300ms gap only matters for 50+. Suggest updating the PLAYBOOK."

5. **Weekly self-audit.** Once per week, each bot re-reads the PLAYBOOK sections relevant to its work and confirms they still reflect reality. If anything is stale, flag it.

### Format for escalation log entries:
```
## [DATE] [BOT NAME] — [ISSUE TYPE: Gap / Bug / Improvement]
**Issue:** [What's missing, broken, or improvable]
**Context:** [What task surfaced this]
**Suggested fix:** [What the PLAYBOOK should say]
**Urgency:** [Blocking me now / Can wait for next review]
```

Slashdaddy reviews the escalation log every heartbeat and updates the PLAYBOOK within one session of the flag being written. This is how the system gets smarter over time — not by waiting for Mitch to notice something is broken.

---

## Bot → Slashdaddy Escalation (Playbook Gaps, Cross-Bot Issues)

**Mitch must NEVER be the relay for bot-to-bot communication.**

When a bot finds a playbook gap, needs Slashdaddy input, or has a cross-bot issue:

1. **First:** Try `sessions_send` to `agent:slashdaddy:main`
2. **If blocked (forbidden):** Write to `memory/playbook-escalations.md` immediately with:
   - Bot name
   - Issue description
   - What decision/input is needed
   - Timestamp
3. **Do NOT message Mitch** — Slashdaddy checks the escalation log every heartbeat
4. **Slashdaddy responds** via sessions_send or by updating the PLAYBOOK directly

The escalation log is the shared communication channel between bots and Slashdaddy when direct messaging is blocked.

## CRITICAL: Disputed Fix Protocol (Added 2026-08-25 — Confirmed by Slashdaddy 2026-08-27)

**If Mitch says something is STILL broken after you declared it fixed:**

1. **STOP. Do not attempt another fix.**
2. **Immediately message Slashdaddy** (main session) with full details:
   - Exactly what change you made
   - What the live URL shows right now (curl/fetch result)
   - What Mitch is seeing vs. what you saw when you verified
   - Timestamp of your fix
3. **Wait for Slashdaddy to respond before touching anything.**
4. This is mandatory. No exceptions. Attempting a second fix before Slashdaddy weighs in is a protocol violation.

*Reconfirmed by Slashdaddy 2026-08-27: "Do NOT attempt another fix until Slashdaddy responds. This is mandatory."*

---

---

## CONTENT STANDARDS — Every Page, Every Bot

These standards answer the question: **"How will Google rank these pages?"** Every page built by any bot must meet all of these before being pushed.

### Word Count Minimums
| Page Type | Minimum | Target |
|-----------|---------|--------|
| Elipacko product page | 1,500 words | 2,000–2,500 words |
| Affiliate site homepage | 800 words | 1,500+ words |
| Affiliate category/product page | 600 words | 1,000+ words |
| Bartact collection description | 300 words | 500+ words |
| Blog post (any bot) | 1,200 words | 1,500–2,500 words |
| Landing page | 800 words | 1,200+ words |

Word count = visible body text only. Do not count nav, footer, schema JSON, or CSS.

### Title Tag Standards
- **Length:** 50–60 characters (Google truncates at ~60)
- **Format:** Primary keyword first, brand name last
  - ✅ `Custom Corrugated Plastic Boxes | EliPacko`
  - ✅ `Jeep Wrangler JL/JLU Seat Covers | Bartact`
  - ❌ `EliPacko — We Make Custom Corrugated Plastic Packaging Boxes`
- **Keyword position:** Primary keyword in first 3 words whenever possible
- **Uniqueness:** Every page must have a unique title — no duplicates across the site
- **Year:** Do NOT append year (e.g., "2026") to evergreen product pages — only blog posts

### Meta Description Standards
- **Length:** 140–160 characters
- **Must include:** Primary keyword (naturally, not stuffed), one clear benefit, implicit or explicit CTA
- **Must NOT:** Repeat the title verbatim, exceed 160 chars, be left blank
- **Format example:** `Custom-printed corrugated plastic boxes in any size. 100% recyclable, fast lead times, wholesale pricing. Get a free quote in 24 hours.`
- **Uniqueness:** Every page must have a unique meta description

### Required Content Sections (Product Pages)
Every product/service page must include ALL of the following:
1. **Hero/intro** — Product name, primary keyword, 1-sentence value proposition (above the fold)
2. **Product description** — 200–400 words explaining what it is, who it's for, why it's better
3. **Specs table** — At minimum: dimensions/sizes, materials, quantities available, lead time, price range (even if approximate)
4. **Applications / Use Cases** — 3–5 specific industries or scenarios where this product is used (these are longtail keyword goldmines)
5. **FAQ section** — Minimum 5 questions, maximum 10. Questions must be real search queries, not marketing fluff.
6. **Internal links** — Minimum 3 links to other relevant pages on the same site
7. **CTA** — Clear next action (Get a Quote, Shop Now, Contact Us, View on Amazon)

Affiliate pages can skip the Specs table but must have all other sections.

### FAQ Schema Requirements
- **Minimum:** 5 questions per page
- **Format:** FAQPage schema in JSON-LD, placed in `<head>` or just before `</body>`
- **Questions must be:** Real questions a customer would type into Google (not "What is a corrugated box?" — too generic; yes "Can corrugated plastic boxes be used outdoors?" — specific and rankable)
- **Answers:** 40–120 words each. Concise but complete.
- **Uniqueness:** Don't copy FAQ questions across pages — Google detects this

### Schema Markup Requirements
| Page Type | Required Schema |
|-----------|-----------------|
| Product page | Product (with name, description, image, offers/price) |
| Blog post | Article (with author, datePublished, headline) |
| FAQ section on any page | FAQPage |
| Category/collection page | BreadcrumbList |
| Local business pages | LocalBusiness (if applicable) |
| Homepage | Organization or WebSite |

Product schema MUST include: `name`, `description`, `image`, `offers` (with `price` or `priceCurrency`). Incomplete Product schema is worse than no schema.

### Internal Linking Structure
- **Minimum 3 internal links per page** to other relevant pages on the same domain
- **Anchor text must be descriptive** — never "click here" or "learn more"; use keyword-rich anchors like "corrugated plastic dividers" or "Jeep JL grab handles"
- **Every page reachable within 3 clicks** from the homepage
- **Orphan pages are banned** — any page not linked from at least one other page on the site is an orphan and must be fixed before publishing
- **For affiliate sites:** Each page must link back to the homepage AND to at least 2 category pages

### Image Standards
- **Alt text:** Descriptive, includes primary keyword naturally, 10–125 characters
  - ✅ `Bartact Jeep JL MOLLE seat covers in coyote brown`
  - ❌ `image1.jpg` / `seat cover` / blank
- **File size:** Under 200KB for hero images, under 100KB for product cards
- **Format:** WebP preferred; JPEG acceptable; PNG only for logos/icons with transparency
- **Dimensions:** Don't serve a 2000px image in a 300px slot — use appropriately sized images
- **loading attribute:** All below-the-fold images must have `loading="lazy"`
- **Every image must have alt text.** Blank alt on a product image = immediate fix required

### How Google Will Rank These Pages
In priority order:
1. **Keyword in title + H1** — must match what people search for, must be in the first 60 chars of title
2. **Content depth** — does the page answer every question a buyer has? Specs, applications, FAQs, comparison
3. **Page speed** — lazy load images, no render-blocking JS, under 2s LCP
4. **Internal authority** — is this page linked from other pages on the site? Is it in the sitemap?
5. **Schema** — FAQ schema earns rich snippets; Product schema earns price/rating display in results
6. **Backlinks** — affiliate sites linking to elipacko.com and bartact.com (Filli's job)
7. **Click-through rate** — meta description must earn the click; a 140-160 char desc that answers the search query

A page that hits all 7 wins. A page missing #1 and #2 will not rank regardless of everything else.

---

## IndexNow 403 Persistent Failure Protocol

If IndexNow returns 403 consistently for a domain despite a valid key file:

1. **Verify the key file is live** — curl `https://domain.com/<key>.txt` and confirm 200 + correct key content
2. **Check DNS** — is the domain actually resolving? A domain in DNS limbo (e.g., recently migrated to GitHub Pages) will 403 permanently until DNS propagates
3. **After 3 consecutive 403s on the same domain** — stop IndexNow for that domain, switch to Google Indexing API only, and write to escalation log
4. **Root cause for elipacko.com specifically:** DNS switched to GitHub Pages Aug 15 — GSC/IndexNow data takes 2-4 weeks to stabilize. Expected resolution: ~Aug 29. If still 403 after Sept 1, escalate to Slashdaddy with full error log.
5. **Never alert Mitch** for IndexNow 403 on a recently migrated domain — this is expected behavior during DNS transition

---

## GCP Org Policy Blocked — Escalation Path

When GCP service account key creation is blocked by org policy (`iam.disableServiceAccountKeyCreation`):

1. **Do not retry** — retrying will not work, this is an org-level hard block
2. **Do not create workarounds** (downloading keys via browser, using another account, etc.)
3. **Write to escalation log immediately** with: which GCP project, which operation was blocked, what the bot was trying to do
4. **Slashdaddy notifies Mitch** — this is one of the rare cases that genuinely requires Mitch's action:
   - GCP Console → info@brazenauto.com → IAM & Admin → Organization Policies → "Disable service account key creation" → Not Enforced
5. **Bot waits** — do not attempt the blocked operation again until Slashdaddy confirms the policy has been changed

Current known blocked project: `affiliate-indexing-501320` (brazenauto.com org)

---

## GitHub Pages Domain Conflict Resolution

If GitHub Pages reports "domain already taken" when verifying a custom domain:

1. **Check if the domain is verified under another GitHub account** — this is the most common cause
2. **Do not delete and re-add the CNAME** — that won't fix an account-level domain conflict
3. **Write to escalation log** with: domain name, which repo you're trying to add it to, exact error message
4. **Slashdaddy investigates** — may require Mitch to:
   - Verify via DNS TXT record at the org level (github.com → Settings → Pages → Verified domains)
   - Or contact GitHub support if domain is stuck on a deleted account
5. **Bot does not attempt to push alternative CNAME or domain workarounds** — these break SSL cert provisioning

---

## GSC Coverage for Backlink Sites

Elipacko backlink sites that are not in GSC have no indexing visibility — Google may never find them.

**For any site being used as a backlink source:**
1. It must be submitted to GSC as a property (DNS TXT verification or HTML file)
2. Sitemap must be submitted in GSC after verification
3. IndexNow must be running for that domain
4. If a site cannot be verified in GSC within 2 weeks of launch, flag to escalation log

**Current known gap:** 28 elipacko backlink sites not in GSC as of 2026-09-01. Fern Allern to add these progressively — minimum 5 per week.

**Verification method for GitHub Pages sites:**
- Add `google-site-verification=<token>` as a DNS TXT record, OR
- Add verification HTML file to root of repo and push
- Confirm GSC shows "Ownership verified" before considering the site active

---

## Implementation Status
- [ ] Walk Industrial content integrity cron
- [ ] Bartact meta description verification cron  
- [ ] SSL check cron (every 4 hours)
- [ ] Affiliate site content guard cron
- [ ] Indexing quota monitor cron
- [ ] Bot output verification requirement
