
## 2026-08-09 — Slashdaddy Section 8 update absorbed + FAQ schema deployed

### SEO_PLAYBOOK Section 8 Rules Absorbed
- Write 1,800w+ raw to land 1,500w+ post-sanitizer (previous runs were 1,200–1,400w raw, still landed 1,523–1,560w live — already above floor but will apply 1,800w+ going forward)
- FAQ schema must go in `custom.faq_schema` metafield, not body_html (script tags stripped)
- Always verify word count from API response, not input — already doing this

### FAQ Schema Deployed — All 5 Priority Collections
- Pushed FAQPage JSON-LD to `custom.faq_schema` metafield on all 5 collections
- 5 Q&As per collection; verified via API readback
- `sections/main-collection.liquid` patched to render `{{ collection.metafields.custom.faq_schema }}` after position-2 description block (line 304)
- Patch confirmed live from Shopify API

### Metafield IDs (custom.faq_schema)
- limit-straps: mf#68588509102353
- carli-suspension: mf#68588509757713
- grab-handles: mf#68588509987089
- coilovers: mf#68588510052625
- brake-line-kits: mf#68588510118161

### Final Live Counts (confirmed from Shopify API)
- limit-straps: 1,528w ✅
- carli-suspension: 1,559w ✅
- grab-handles: 1,560w ✅
- coilovers: 1,523w ✅
- brake-line-kits: 1,544w ✅

## 2026-08-09 — Slashdaddy mil-spec rule update

### MIL-SPEC RULE (from SEO_PLAYBOOK.md update)
- "Mil-spec" allowed ONLY when the thing described IS actually mil-spec
- ✅ ALLOWED: "Mil-spec 1000D Cordura nylon" (actual MIL-SPEC-C-12369 fabric)
- ❌ FALSE CLAIM: "mil-spec stitching", "mil-spec construction", "mil-spec hardware" on a standard product
- Rule: if you cannot cite the actual MIL spec number, do NOT call it mil-spec
- Applies to all Bull Strap copy — blog posts, collection descriptions, product descriptions, meta descriptions

### MIL-SPEC RULE CLARIFICATION (same date)
- "Mil-spec Cordura nylon" = ✅ accurate and allowed (Cordura IS mil-spec fabric)
- Full allowed list: "mil-spec 1000D Cordura nylon", "mil-spec Cordura nylon" — both fine
- Keep wherever it appears in existing or future copy
