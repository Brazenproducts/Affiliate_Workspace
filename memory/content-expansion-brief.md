# Content Expansion Agent Brief

## Your Job
Expand thin affiliate site pages to 1,000-1,500 words each. Add FAQ schema. Make them look and read like real expert review sites — not AI slop.

## Amazon Affiliate Tag
ALL Amazon links must use: tag=brazenprodu01-20
Link format: https://www.amazon.com/s?k=SEARCH+KEYWORDS&tag=brazenprodu01-20
Or direct product: https://www.amazon.com/dp/ASIN?tag=brazenprodu01-20

## Content Standards
- Real product names (don't invent ASINs but use real brand/model names)
- Honest pros AND cons — no product is perfect
- Specific details: dimensions, weight, price ranges, compatibility notes
- Comparison tables where relevant
- "Best for" callouts (Best for Budget, Best for Heavy Use, Editor's Pick, etc.)
- Buyer's guide section on every page

## FAQ Schema (add to EVERY content page, skip about/contact)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "SPECIFIC QUESTION ABOUT THIS PAGE'S TOPIC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Genuinely useful answer, 2-4 sentences. Specific, not vague."
      }
    }
  ]
}
</script>
```
Also add a visible FAQ section in the page body (before </body>) with the same Q&As styled to match the site.

## Tone
- Enthusiast level — assume the reader knows what they're looking for
- Direct and opinionated — "This is the one we'd buy" not "This might be a good choice"
- No fluff intros like "Are you looking for the best X?" — just get into it
- Closing CTA on every page: button linking to Amazon search for the category

## Style
- Match existing site dark/light theme exactly
- Keep existing nav, header, footer intact
- Add content inside the main content area only

## Git Push
After updating all files in a site, run:
```bash
cd /path/to/site
git add -A
git commit -m "Content expansion + FAQ schema"
git push origin main
```

## Verification
After push, confirm with: git log -1 --oneline
