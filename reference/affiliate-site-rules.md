# Affiliate Site Build Rules (from tacticalseats.com review with Mitch 4/17)

## NON-NEGOTIABLE
1. **No fake claims.** No warranty claims, no made-up specs, no "we tested" language unless we actually tested. No exaggerated numbers.
2. **Bartact material description (EXACT):** UV-protected polyester and/or 1000D Cordura nylon with waterproof polyurethane backing and high-grade foam. 1000D Cordura is an OPTION, not standard on all products. Say "1000D mil-spec Cordura option" in pros.
   - **Comparison tables:** `UV-protected polyester & 1000D Cordura nylon option`
   - **Never write:** `Mil-Spec Cordura` or `1000D Cordura` as if that is the entire seat-cover material story
3. **Bartact key features:** Real MOLLE System w/ PALS Webbing, true Bar Tack stitching, SRS airbag compatible, made in USA, Berry Amendment compliant (link to bartact.com for details).
4. **All links must work.** Verify every Bartact collection URL returns 200 before publishing. Gladiator is `/collections/jeep-gladiator-seat-covers-1` (NOT `/jeep-gladiator-seat-covers`).
5. **Use real product/vehicle photos.** No AI-generated images with weird backgrounds. If you can't get a real photo, use a clean product shot or no image at all.
   - Wrangler TJ Bartact image (`29023020023851`) is ONLY for Jeep-specific sites. Do not use it on truck/general sites.
   - Broken Bartact DERA image (`DERA-BARTACT-UNIVERSAL-TAN-1.jpg`) must never be used.
6. **Smittybilt G.E.A.R. covers are priced per seat, not per row.** Always note this for customers.
7. **Razorback is NOT tactical and does NOT have MOLLE panels.** They're offroad seat covers, not tactical.
8. **No broken animations.** Don't use IntersectionObserver scroll-reveal animations — they break and cause images to disappear. Just show content immediately.
9. **Consistent button styling.** All brand cards should have the same button layout/colors. Bartact shouldn't look visually different from competitors in the comparison sections.
10. **No emojis in nav/logo.** Keep branding clean and professional.
11. **"Shop Covers" on vehicle cards → subpages on the site, NOT directly to Bartact.**
12. **Don't claim "we buy every product we test" or "no sponsored placements."** These are affiliate sites.

## Button Pattern (brand cards)
- Primary button: Shop link (yellow `btn-amazon` for Amazon brands, orange `btn-bartact` for Bartact)
- Secondary button: Outline "Compare" linking to #comparison
- ALL brands use the same pattern — no special treatment for Bartact

## Product Images on Review Cards
- Every brand review card (homepage AND subpages) must have a real product photo floated right
- Use `<div style="float:right;margin:0 0 12px 20px;max-width:180px"><img src="images/..." ...></div>` right after the `<h3>` brand name
- Source images from manufacturer websites (Shopify CDN, brand .com), NOT AI-generated
- Minimum 500px wide source image, displayed at max-width 180px
- If a manufacturer site blocks direct download, use browser to find CDN URLs
- Homepage brand cards: image inside card div with `width:100%;border-radius:8px`
- Subpage review cards: float-right pattern as described above

## Nav Structure
- Include ALL vehicle subpages in nav, not just 2-3
- Add "All Vehicles ▼" or similar catch-all link (orange, font-weight:600) pointing to YMM search or homepage
- If site has a "Why [Product]?" benefits page, include in nav
- Update nav on ALL pages when adding new links (homepage + all subpages + benefits pages)

## YMM (Year/Make/Model) Search
- Place above #1 pick section on homepage — it's the first interactive element visitors see
- Bartact-covered vehicles: show Bartact result prominently + Amazon secondary
- All other vehicles: send to Amazon affiliate search with tag `brazenprodu01-20`
- Cascade: Year → Make → Model (disable downstream until upstream selected)
- Script goes in `<script>` tag AFTER the YMM section HTML (don't lose the tag during edits!)

## Benefits / "Why" Page
- Every site should have a benefits page (e.g. `why-tactical-seat-covers.html`)
- Focus on the two biggest differentiators for the product category
- Include: benefit cards, material comparison table, tactical-vs-standard table, use-case cards, CTA back to YMM/homepage
- No unverified claims — stick to what's factually true about materials and features

## Content & Traffic Building
- Every affiliate site needs a blog section with regular posts (2-3x/week)
- Blog topics: buyer's guides, comparison posts, installation guides, "best X for Y" posts, seasonal content
- Target long-tail keywords from Search Console / keyword research
- Internal link every blog post back to review pages and product pages
- Blog posts need real product images, not stock photos
- IndexNow submit every new post immediately
- Cross-link blog posts between network sites where relevant

## Site Quality Checklist (EVERY affiliate site must have)
1. Real product photos next to every brand review (float-right pattern, 180px max-width)
2. Minimum 6 brands reviewed with full write-ups on every page
3. Comparison table on every review page
4. YMM or product finder dropdown where applicable
5. "Why [Product Category]" benefits page
6. Blog section with regular content
7. All nav links present across all pages
8. Network footer cross-links
9. Affiliate disclosure
10. Working Amazon affiliate links with brazenprodu01-20 tag
11. No fake claims, no made-up specs, no unverified warranties
12. Consistent button styling across all brand cards
13. Bartact prices must come from verified Shopify data, not guesses. Use `reference/bartact-correct-data.md`. Never write `$650-$900` unless verified for that exact vehicle/product, and note per-row/per-pair correctly.

## Unique Vehicle/Product Card Images (NON-NEGOTIABLE)
- Every vehicle card / product-category card on every review-site page must have a UNIQUE, category-appropriate image.
- **Category must match the heading.** A "Tonneau Covers" card must show a tonneau cover. A "Floor Mats" card must show a floor mat. No cross-category placeholders — even if the image is a "truck accessory," it must depict the category named in the heading. (Rule added 4/20 after Mitch caught seat-cover photo on Tonneau card and tonneau-cover photo on Floor Mats card on besttruckaccessories.com.)
- Never reuse the same Amazon image ID or Shopify CDN URL across multiple cards on the same page (except when the cards are deliberately the same product).
- **NEVER hallucinate Amazon image IDs.** Every `m.media-amazon.com/images/I/<ID>._AC_SL1500_.jpg` must be curl-verified `200 OK` before injection. ~34% of the previously-deployed IDs across the network were 404s caught by `scripts/verify-harvest.js` on 4/20.
- Placeholder IDs `61mpK93Qg0L` (BAKFlip MX4) and `61bMNCeAUAL` (generic Amazon filter) are banned as category/vehicle card images — they've been repeatedly abused as copy-paste placeholders.
- Use `scripts/duplicate-image-audit.js` before every network push. Zero tolerance for duplicates.
- If no verified category-appropriate image is available, REMOVE the `<img>` entirely — a text-only card is better than a duplicated/wrong photo.

## Standing Orders
- **New site launch (4/18):** Verify Google Search Console + submit sitemap as THE MOST IMPORTANT step after launch.
- **Full network cross-linking (4/20):** Every new affiliate site MUST include backlinks to ALL relevant sites in the network — bartact.com, bullstrap.com (NOT bullstrap.co), and all other affiliate sites that are topically related. Vehicle/off-road sites link to Bartact + Bull Strap + other vehicle sites. Non-vehicle sites get footer links to the full network. This is MANDATORY on every site build. Every site should boost every other relevant site.
- **DNS setup (4/20):** Every new site must have GoDaddy A records pointing to GitHub Pages IPs (185.199.108-111.153) and HTTPS enforced via GitHub Pages API. No more launching sites without custom domain DNS.

## Quality Standard
- Gold standard: bestfirestick.com
- Every site needs: working links, real images, accurate product info, proper affiliate disclosure, network footer cross-links, Bull Strap backlink
- Always cache-bust when verifying changes (`?v=N`) — GitHub Pages caches aggressively

## Unique SEO Titles & Meta Descriptions (NON-NEGOTIABLE — added 4/25)
- Every HTML page across the network must have a fully unique `<title>` tag.
- Every page must have a unique `<meta name="description">` — NEVER copy-paste a generic one across pages.
- Verified 4/25/2026: 269 pages across 42 sites, 0 cross-site duplicates. Maintain that.
- Before pushing a new page or new site, search the existing network for matching titles/descriptions.
- Unique H1 and first 100 words of body content also matter — don't template the lead paragraph.
- Quick audit: `find affiliate-sites -name '*.html' | xargs grep -h '<title>' | sort | uniq -d` should return empty.
