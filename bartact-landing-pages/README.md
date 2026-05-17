# Bartact Google Ads Landing Pages

Static HTML landing pages for Bartact Google Ads campaigns. Each page is self-contained with inline CSS and zero external dependencies.

## Pages

| File | Vehicle | Collection URL |
|------|---------|---------------|
| `lp-jl-wrangler.html` | Jeep Wrangler JL/JLU 2018+ | `/collections/jeep-wrangler-jl-jlu-accessories-2018` |
| `lp-jk-wrangler.html` | Jeep Wrangler JK/JKU 2007-2018 | `/collections/jeep-wrangler-jk-jku-2007-18-accessories` |
| `lp-gladiator.html` | Jeep Gladiator 2019+ | `/collections/jeep-gladiator-accessories-2019` |
| `lp-bronco-storage.html` | Ford Bronco Storage/Cargo 2021+ | `/collections/jeep-bronco-4runner-tacoma-truck-parts` |
| `lp-tacoma.html` | Toyota Tacoma 2005-2023 | `/collections/jeep-bronco-4runner-tacoma-truck-parts` |

## Design

- **Theme:** Dark (`#0a0a0a` background, `#b8001f` red, white text)
- **Responsive:** Mobile-first with `clamp()` typography and CSS Grid
- **No external deps:** All CSS inline, no JS, no CDN calls
- **Accessibility:** Semantic HTML, proper heading hierarchy, alt text on images

## Page Structure (each page)

1. **Hero** — Vehicle-specific headline + CTA button
2. **Trust Bar** — Made in USA · 5-Star Rated · Berry Compliant · Exact-Fit · MOLLE · SRS Airbag
3. **Products Grid** — 4 product cards with name, price range, and link to collection
4. **Social Proof** — 4 review cards with star ratings and owner quotes
5. **Comparison Table** — Bartact vs. Generic/Amazon across 8 features
6. **FAQ** — 4 vehicle-specific questions and answers
7. **Closing CTA** — "You can find cheaper. You won't find better." + final CTA button
8. **Footer** — Copyright + bartact.com link

## Deployment Options

### Option 1: Shopify Pages (Recommended)
Upload each HTML file as a Shopify page using the **Custom HTML** content type:
1. Shopify Admin → Online Store → Pages → Add page
2. Set the template to a blank/custom template
3. Paste the full HTML into the content editor (HTML view)
4. Set the page URL to match the filename (e.g., `/pages/lp-jl-wrangler`)
5. Use the Shopify page URL as the Google Ads final URL

**Note:** Shopify may inject its own `<head>` and `<body>` wrapper. If so, extract only the `<style>` block and body content, omitting the outer `<!DOCTYPE html>` wrapper.

### Option 2: Shopify Theme Files
Add each page as a standalone Liquid template:
1. Shopify Admin → Online Store → Themes → Edit code
2. Create a new template: `templates/page.lp-jl-wrangler.liquid`
3. Paste the HTML (Shopify will handle the outer HTML shell)
4. Assign the template to a new page via the page editor

### Option 3: External Static Hosting (Netlify / Vercel / S3)
Host the files on any static host and use the external URL as the Google Ads final URL:
```bash
# Netlify CLI example
netlify deploy --dir=bartact-landing-pages --prod

# Or drag-and-drop the folder at app.netlify.com
```
**Pros:** Full control, no Shopify injection, instant deploys  
**Cons:** Separate domain from bartact.com (may affect Quality Score slightly)

### Option 4: Shopify CDN via Files
1. Shopify Admin → Content → Files → Upload each HTML file
2. Get the CDN URL (e.g., `https://cdn.shopify.com/s/files/...`)
3. Use the CDN URL as the Google Ads final URL

**Note:** CDN-hosted files won't have Shopify's tracking/analytics injected.

## Google Ads Setup Notes

- **Final URL:** Set to the deployed page URL
- **Display URL:** Use `bartact.com` as the display domain
- **UTM Parameters:** Append `?utm_source=google&utm_medium=cpc&utm_campaign=<campaign_name>` to track in GA4
- **Quality Score:** Pages are designed with relevant, keyword-rich content matching likely ad copy

## Updating Products

Product cards use placeholder images (`product-img-placeholder` divs). To add real product images:
1. Replace `<div class="product-img-placeholder">...</div>` with `<img class="product-img" src="<shopify_cdn_url>" alt="<description>" onerror="...">`
2. Use Shopify CDN URLs from the actual product listings for best performance

## Notes

- Product prices are estimates based on comparable Bartact products — verify against live store before publishing
- Reviews are representative composites — replace with verified Shopify review content if available
- "Temecula" is intentionally omitted per brand guidelines
