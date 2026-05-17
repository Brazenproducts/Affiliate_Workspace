# Affiliate Audit — 2026-04-29

## Critical

### bestoffroadbrands.com
- Severity: CRITICAL
- Issue: Site reads like an obvious Bartact sales page rather than a neutral review property. Multiple categories are hard-coded to Bartact as `#1` on the homepage with direct manufacturer links.
- Evidence: `Bartact — #1` appears for Seat Covers, Grab Handles, Limit Straps, and Storage on the homepage.
- Evidence: `Industry-leading limit straps. Also available through Bull Strap.`
- Risk: This is too overt and undermines the "independent review" positioning. It also concentrates too much of the site around one connected brand family.

## High

### jeepseatcover.com
- Severity: HIGH
- Issue: Homepage is still too sales-heavy toward Bartact, with direct shop CTAs on the homepage instead of staying mostly editorial/neutral.
- Evidence: `Shop Bartact →`
- Evidence: `Shop Jeep Accessories →`
- Evidence: `Why Bartact Leads the Pack`
- Risk: The site looks less like a neutral review property and more like a Bartact funnel.

### bestbroncoaccessories.com
- Severity: HIGH
- Issue: Homepage still includes direct Bartact shopping CTAs in category cards, which pushes it toward a sales page feel.
- Evidence: `Shop Bartact →`
- Evidence: `Shop Door Bags →`
- Evidence: `Shop Grab Handles →`
- Risk: Homepage should feel neutral first, with outbound brand CTAs kept mostly to ranking/detail pages.

## Medium

### besttruckaccessories.com
- Severity: MEDIUM
- Issue: Rendering bug / malformed HTML leaking raw attribute text into the page.
- Evidence: Literal text visible in DOM: `style="margin-top:1.5rem;padding:1rem 1.5rem;background:#f0f7ff;border-left:4px solid #2563eb;border-radius:8px">`
- Risk: This is a visible quality-control failure and makes the page look broken.

### besttruckaccessories.com
- Severity: MEDIUM
- Issue: Fabricated or weakly-supported claims on homepage.
- Evidence: `We analyze thousands of reviews, compare real-world performance`
- Evidence: `Every recommendation is backed by review data, return rate analysis, and real-world testing. No paid placements.`
- Risk: Claims like `return rate analysis` and `real-world testing` are stronger than what we should state unless we can prove them.

### bestseatcover.com
- Severity: MEDIUM
- Issue: Homepage still makes broad claims that may overstate our testing/verification process.
- Evidence: `verified owner feedback, proper SRS airbag compatibility, and real-world durability data`
- Risk: `real-world durability data` is stronger than we should claim unless we actually have and document it.

## Notes
- First-pass completed on the highest-risk off-road / seat-cover / truck sites where competitor bleed and fake-neutrality problems are most likely.
- Sites checked in this pass: `bestoffroadbrands.com`, `bestseatcover.com`, `jeepseatcover.com`, `bestbroncoaccessories.com`, `besttruckaccessories.com`.
- No confidentiality breach found yet in this pass.
- No banned competitor references found yet on these homepages beyond normal category comparisons on non-Mitch-owned categories.
- Next pass should cover: `tacticalseats.com`, `besttonneaucovers.com`, `wranglerseatcover.com`, `tacomaseats.com`, `jlseatcovers.com`, `gladiatorseatcover.com`, `broncoseatcover.com`, `tacticalseatcovers.com`, `topoffroadstores.com`, `autopartsreviewed.com`, `petwearhouse.com`.
