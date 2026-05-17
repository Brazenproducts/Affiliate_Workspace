# Scaffold Site SEO Sweep — 2026-04-20

## Summary
- **Total sites touched:** 28
- **Sites now passing QA:** 28 / 28 (network-wide: 52 / 52 clean)
- **Failures:** none

## What changed per site
For each site we modified `index.html` + every `best-*.html` + `buyers-guide.html`:

**index.html**
- Injected `<section id="more-guides">` linking every non-nav `.html` file in the repo (best-*.html, buyers-guide.html, contact.html) — bare-path hrefs so the QA regex counts them as internal.
- Injected `<section id="related-network">` with 4 deterministic sibling-cluster site links (Cluster A/B/C picked from `reference/affiliate-social-architecture.md`; deterministic rotation keyed off the domain so runs are stable).
- Added JSON-LD `WebSite` + `BreadcrumbList` schema in `<head>` (values pulled from the page's existing `<title>` / meta description / canonical — no invented claims).

**best-*.html and buyers-guide.html**
- Added JSON-LD `Article` schema in `<head>` (headline = page title, description = existing meta description, mainEntityOfPage = existing canonical, publisher = site domain).
- Opted for `Article` over `ItemList` because the scaffold best-*.html pages list site categories (e.g. "Best Mesh Bimini Tops") rather than real named products — an `ItemList` of category labels would have been fluff. Per the task spec ("if too complex, at least add Article schema"), `Article` is the honest choice.

**Not touched:** image URLs, product names, pricing, Bartact wording, nav, footer, or any factual copy. Pure additive DOM + head-level markup.

## Tooling
- `/home/ubuntu/.openclaw/workspace/scripts/fix-scaffold-seo.js` — idempotent fixer (strips any prior inserted blocks before re-applying, so re-runs converge).
- `/home/ubuntu/.openclaw/workspace/scripts/fix-and-commit-site.sh` — wraps fixer + per-site commit + push.

## Commits (one per site, message: "SEO: boost internal linking + add JSON-LD schema")

| Site | SHA |
|------|-----|
| broncobiminis.com | 64c67cf8161cc92f5fcfe1223ee015fa73769e00 |
| broncobumper.com | 93680c84cf9a512d50ef4317722056b9d1b2430c |
| broncocargo.com | b14bc0fba9f3cc096b0c5938d378999640b77d1d |
| broncoexterior.com | b702d7d599df4f9de7a078e8123e557d7136242f |
| broncoheadliner.com | 01d50460c7a2a7d00359e63e12b8c4217ec2286b |
| broncointerior.com | e4ca6548528d1992cebbbaed2bfc94f387e621a8 |
| broncomolle.com | 7e11bdeb7d2d57f1cdff6a6c2e446b3f9dcaad7f |
| broncorollbar.com | b308ecdfd19847e8576c1f825e46437b41393337 |
| broncorollcage.com | 24286e2beb04ba90602a8630b6757afe1ba71e20 |
| broncoshade.com | 51e62e2da20e33e371bd5072325c1b890e456d6e |
| broncotent.com | 56558321cc5cc28581800188eeca0325927f0246 |
| broncotents.com | 6bfb213177acabc9f465f6ee6abb0ae8f6a8b4df |
| broncotops.com | 669819c15ec1673c74a09ede71cc77aa93118af9 |
| broncoupgrade.com | 8d0efa5bba0eb2306ba393b72e83c07360534946 |
| cybertruckgen1.com | bae1134b896e2d157f700eab5e5678c2dd75e7ca |
| cybertruckseat.com | 3a200dcede7218e343bff60169831f89f0d9e9bb |
| cybertruckseatcovers.com | 0b7033384b1e825c43e5e33a0d1132f024653de5 |
| cybertruckshell.com | ab90920e3a80137ea57222e277b432a3f6855324 |
| r1sstorage.com | d167ec810d6e7a6e2a63666fd81fc459736eeae1 |
| r1tstorage.com | 290afca4bbd283c4e1212e826f78ef3ad520bcf6 |
| r2sparts.com | 24d0605073c4bddfbb393308b096d41d90132a05 |
| r2tparts.com | 34008b21931ce2f2a652cec614842298d7877d1f |
| ramrevparts.com | de32ca66f1182f7ee21989be8f0a2dbbf3ba5f09 |
| scoutruvparts.com | 42896838c6fa1e070b638e4da129ee10b7f1675e |
| scoutsuvparts.com | a5cedafe98a39f699565422b82e9e79993f65663 |
| scoutterraparts.com | 044e62352a1479e7a753c24b30053d09cf000e0a |
| slatetruckparts.com | 9dd3d1cb3f3bf64aab9344c59c58c83fa7e92188 |
| sportadventurevehicleparts.com | 4880a353c68014e485f0d91c13b40d89604d5244 |

All pushed to `origin` on Brazenproducts GitHub.

## Final QA
```
node scripts/affiliate-network-qa.js --fast
Clean: 52/52
```

## Notes / Issues
- No failures.
- `duplicate-image` cross-site audit still reports 1 site with violations (2 dupes) — unrelated to this sweep (internal-link-density/schema task only), pre-existing, flagging for awareness.
- `semantic-image` reports 21 unverifiable images (also pre-existing, unrelated).
- Bartact vehicle-coverage rule was not exercised — none of the added internal links point to bartact.com; all are same-site bare-path or sibling-cluster affiliate domains.
- The sibling-cluster footer links use absolute `https://` URLs to network peers. The QA regex does not count those as internal (by design — they're cross-domain). They provide the "network footer" the task asked for; the ≥8 requirement is met via the "More guides" block alone.
