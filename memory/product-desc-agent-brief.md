# Bartact Product Description Rewrite — Agent Brief

## Shopify Access
- Store: bartact.myshopify.com
- Token: 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
- API: https://bartact.myshopify.com/admin/api/2023-10/products/{id}.json

## What You're Doing
Rewriting `body_html` for Bartact seat cover products in a consistent dark theme style.
You are NOT touching: titles, handles, tags, variants, prices, images, SEO meta fields, or collections.
ONLY `body_html` gets updated.

## CRITICAL SEO RULES — DO NOT VIOLATE
1. **Never change product titles, handles, tags, or metafields** — only body_html
2. **Never remove existing cross-link blocks** — the `data-tier-nav="1"` div at the top and any `data-bench-link="1"` divs must be preserved EXACTLY as-is
3. **Write your new content AFTER the existing nav blocks**, not before or instead of them
4. **Do not invent specs** — use only what's in the existing description or what's known about Bartact products (see below)
5. **Verify via API GET after every PUT** — confirm body_html was saved correctly

## How to Update a Product
```js
// GET existing HTML first
GET https://bartact.myshopify.com/admin/api/2023-10/products/{ID}.json?fields=id,title,body_html
Headers: X-Shopify-Access-Token: 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

// PUT updated HTML
PUT https://bartact.myshopify.com/admin/api/2023-10/products/{ID}.json
Headers: X-Shopify-Access-Token: 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
Body: { "product": { "id": ID, "body_html": "NEW HTML" } }
```

## Existing Nav Blocks to PRESERVE
Each product has one or more of these at the top of body_html — keep them verbatim:
- `<div data-tier-nav="1" ...>` — tier navigation (Base Line / Tactical / Fully Customized)
- `<div data-bench-link="1" ...>` — bench cross-link button

Extract these blocks first, write your new content, then reassemble:
`[existing nav blocks] + [new dark theme description]`

## Dark Theme Style Guide

### Wrapper
```html
<div style="background:#000;color:#fff;font-family:Arial,sans-serif;padding:24px;border-radius:8px;">
```

### H2 heading (red)
```html
<h2 style="color:#b8001f;font-size:1.6em;margin-bottom:8px;">PRODUCT NAME | VEHICLE</h2>
```

### Opening paragraph
One punchy paragraph. No fluff. Speak to a Jeep owner who knows their stuff.

### Feature bullet list (dark card)
```html
<div style="background:#1a1a1a;border-left:4px solid #b8001f;padding:16px;margin:20px 0;border-radius:4px;">
  <ul style="margin:0;padding-left:20px;line-height:1.9;">
    <li><strong>Exact fit for [YEAR] Jeep [MODEL]</strong> — not a universal cut</li>
    <li><strong>True mil-spec PALS / MOLLE webbing</strong> — compatible with standard issue MOLLE pouches</li>
    <li><strong>Mil-spec Bar Tack stitching</strong> on all webbing — built for punishment</li>
    <li><strong>Free MOLLE pouch included</strong> — mounts anywhere on the PALS system</li>
    <li><strong>[N] insert color options</strong> — Black, Graphite, Red, Blue, Navy, Orange, Olive Drab, Coyote, Khaki, ACU Camo</li>
    <li><strong>Fully fabricated in the USA</strong> — cut, stitched, and embroidered right here at home</li>
  </ul>
</div>
```

### Fitment warning box (red border) — use when needed
```html
<div style="background:#1a0000;border:2px solid #b8001f;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#ff4444;font-weight:bold;font-size:1.05em;margin:0 0 8px;">⚠️ Fitment Warning</p>
  <p style="margin:0;line-height:1.6;">WARNING TEXT. Button if applicable.</p>
</div>
```

### Gold upsell box (custom configurator / rear bench)
```html
<div style="background:#2a1a00;border:2px solid #e0a800;padding:16px;margin:20px 0;border-radius:6px;">
  <p style="color:#e0a800;font-weight:bold;font-size:1.05em;margin:0 0 8px;">TITLE</p>
  <p style="margin:0;line-height:1.6;">TEXT</p>
  <p style="margin:10px 0 0;"><a href="/products/HANDLE" style="background:#e0a800;color:#000;padding:8px 18px;border-radius:4px;text-decoration:none;font-weight:bold;">BUTTON TEXT →</a></p>
</div>
```

### Closing line (always last, inside wrapper)
```html
<p style="font-size:1.1em;font-weight:bold;text-align:center;margin-top:24px;color:#fff;">You can find cheaper. You won't find better.</p>
```

## Known Bartact Facts (use these, don't invent others)
- All seat covers: exact-fit, not universal
- Tactical line: True mil-spec PALS/MOLLE webbing, mil-spec Bar Tack stitching, free MOLLE pouch included
- Front pairs include 2 pouches (8"×7.5"×2" each)
- Rear bench includes 1 pouch (13.5"×6"×2")
- Standard polyester: 3-year anti-fade warranty
- Coyote, Olive Drab, ACU Camo, Multicam = US-made Cordura Nylon — NO fade warranty on these
- Waterproof-backed polyester fabric (not 100% waterproof due to stitching)
- Headrest covers included with Tactical seat covers
- Lumbar support sleeve on front covers
- Full zippered rear AND front pocket on each cover
- Custom embroidery available (headrests) — .dst file or they digitize ~$50-60
- CPB/Fully Customized: allow 6-12 weeks lead time for custom builds
- "Fully fabricated in the USA — cut, stitched, and embroidered right here at home"
- USA wording: never mention a specific state
- Use "stitched" not "sewn"
- SRS = side-impact airbag seats — always warn on non-SRS products, always call out on SRS products
- Baseline = no MOLLE webbing, simpler construction, lower price point
- Sky One-Touch Top = correct name (not "One Touch Electric Top")
- 2007-2012 JK seats are the same design (different headrests)

## Color Options by Product Type
### Tactical (standard in-stock):
Black/Black, Black/Graphite, Black/Red, Black/Blue, Black/Navy, Black/Orange, Black/Olive Drab, Black/Coyote, Black/Khaki, Black/ACU Camo

### Baseline:
Check the existing product variants — don't assume

### Fully Customized (CPB):
Full color selection including all above plus custom options — don't list specific combos, just say "full color and option selection via the custom configurator"

## Tone
- Speak to Jeep/off-road enthusiasts
- Confident, direct, no fluff
- Don't say "Great quality" or "Premium" — show it with specifics
- Closing line is always: "You can find cheaper. You won't find better."

## After Each Product
- GET the product back and confirm your HTML is saved
- Log each completed product ID + title
- Report back with: completed IDs, any products skipped and why
