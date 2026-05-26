# Affiliate Site Image Upgrade Instructions

## Goal
Add real Amazon CDN product images to every brand review card on every page of the site.

## Image Source Pattern
For Amazon products, use `https://m.media-amazon.com/images/I/{ASIN-IMAGE-ID}._AC_SL1500_.jpg`

To find real product images:
1. Search Amazon for the product (e.g., "Bartact Jeep JL seat covers")
2. Use common known ASINs/image IDs
3. For Bartact products, use Shopify CDN: query `https://bartact.myshopify.com/admin/api/2024-01/products.json` with token `shpat_[REDACTED-SEE-.ENV]`

## Image Placement Rules
- **Homepage brand cards:** Add `<img src="URL" alt="Product Name" style="width:100%;border-radius:8px;margin-bottom:8px">` inside each card div, right after the opening card div
- **Subpage review sections:** Use float-right pattern after the `<h3>` brand heading:
  ```html
  <div style="float:right;margin:0 0 12px 20px;max-width:180px"><img src="URL" alt="Product Name" style="width:100%;border-radius:8px"></div>
  ```

## For Bartact vehicle sites (jeepseatcover, wranglerseatcover, broncofloormats, cybertruckseatcovers)
- Bartact MUST be listed as #1 pick
- Use Bartact Shopify CDN images where possible
- Other brands use Amazon CDN images

## Amazon Tag
All Amazon links must include `tag=brazenprodu01-20`

## Git
After changes: `git add -A && git commit -m "Add real product images across all review pages" && git push`
Token for push: use the URL already in .git/config (has token embedded from clone)
