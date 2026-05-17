# Grid & Pixel — Archived Configuration (Bartact)

**Archived:** 2026-04-15
**Reason:** Cancelling G&P ($200/mo) — generated $29.44 from 464 emails in 30 days. Not worth it.

## Active Automations (as of cancellation)

### 1. Post-Purchase Thank You
- **Status:** Active
- **Sent (30 days):** 156
- **Click rate:** 6%
- **Orders:** 0
- **Revenue:** $0
- **Trigger:** After order placed/fulfilled
- **Purpose:** Thank customer, encourage repeat purchase / leave review

### 2. Welcome Email Series
- **Status:** Active
- **Sent (30 days):** Not shown (likely included in 529 total)
- **Click rate:** Unknown
- **Orders:** 0
- **Revenue:** $0
- **Trigger:** New customer/subscriber signup
- **Purpose:** Introduce brand, highlight products, build relationship

### 3. Customer Winback
- **Status:** Active
- **Sent (30 days):** 162
- **Click rate:** 3%
- **Orders:** 0
- **Revenue:** $0
- **Trigger:** Customer hasn't ordered in X days (likely 60-90)
- **Purpose:** Re-engage lapsed customers with incentive

### 4. Abandoned Product Browse
- **Status:** Active
- **Sent (30 days):** 146
- **Click rate:** 5%
- **Orders:** 1
- **Revenue:** $29.44
- **Trigger:** Customer viewed product but didn't add to cart
- **Purpose:** Remind customer of products they looked at

## Inactive Automations (already disabled March 25)

### 5. Abandoned Cart
- **Status:** Inactive (replaced by Shopify built-in)

### 6. Abandoned Checkout
- **Status:** Inactive (replaced by Shopify built-in)

## Overall 30-Day Stats
- **Total sent:** 529
- **Overall click rate:** 4.96%
- **Total orders:** 1
- **Total revenue:** $29.44
- **AOV:** $29.44
- **Cost:** ~$200/mo
- **ROI:** -85% ($29.44 revenue vs $200 cost)

## Shopify Built-In Replacement (already running)
- **Abandoned checkout:** Active, 65 sent, 6% click rate, 0 orders yet

## Replacement Plan (Shopify Flow + Shopify Email)

### Welcome Series
- **Trigger:** Shopify Flow → Customer Created
- **Delay:** 1 hour
- **Email 1:** Welcome to Bartact — brand story, Made in USA, Berry Compliant
- **Delay:** 3 days
- **Email 2:** Best sellers + vehicle fitment guide
- **Delay:** 5 days
- **Email 3:** Customer reviews / social proof + 10% first order code (if no purchase yet)

### Post-Purchase Thank You
- **Trigger:** Shopify Flow → Order Fulfilled
- **Delay:** 2 days
- **Email 1:** Thank you + care instructions for seat covers
- **Delay:** 14 days
- **Email 2:** Review request + "share your install" social CTA
- **Delay:** 30 days
- **Email 3:** Cross-sell related products (grab handles, door bags if they bought covers)

### Customer Winback
- **Trigger:** Shopify Flow → Customer hasn't ordered in 90 days
- **Email 1:** "We miss you" + what's new at Bartact
- **Delay:** 14 days (if no purchase)
- **Email 2:** Exclusive returning customer discount (10-15% off)

### Browse Abandonment
- **Note:** This is the trickiest to replicate natively. Shopify Flow doesn't have a native "viewed product but didn't add to cart" trigger.
- **Options:**
  1. Skip it — it only generated 1 order ($29.44) in 30 days
  2. Use Shopify's Marketing Automations (if available on plan)
  3. Use a lightweight free app like Shopify Email's built-in browse abandonment (if supported)
- **Recommendation:** Skip it. Not worth the complexity for $29/mo.

## Email Design Archive (from screenshots)

All emails use: Bartact logo header, dark/black background, bold white uppercase text, product imagery, clean CTA buttons.

### Design Pattern
- **Header:** Bartact logo (white on dark)
- **Body:** Large bold headline, product image or lifestyle shot, brief copy
- **CTA:** Colored button (orange/red) — "SHOP", "CHECKOUT NOW", "APPLY 5% OFF"
- **Discount code:** SAVE5 (5% off) used across winback, cart abandonment, checkout abandonment
- **Tone:** Direct, urgency-driven ("LAST CHANCE", "THIS OFFER EXPIRES SOON", "FINISH YOUR ORDER")

### Template Details
| Template | Headline | CTA | Discount |
|----------|----------|-----|----------|
| WINBACK #1 | "IT'S BEEN A WHILE" / "Come Back & Save 5%" | SHOP | SAVE5 (5%) |
| THANK YOU #1 | "A SPECIAL OFFER FOR YOU" / "take 5% off your next purchase" | SHOP NOW | 5% code |
| CHECKOUT ABANDONMENT #1 | "You're So Close!" / "FINISH YOUR ORDER" | CHECKOUT NOW | None visible |
| CHECKOUT ABANDONMENT #2 | "ON ITEMS IN YOUR CART" / "THIS OFFER EXPIRES SOON" | CHECKOUT | Likely SAVE5 |
| CHECKOUT ABANDONMENT #3 | "LAST CHANCE" / "SAVE 5%" | Button | SAVE5 |
| CART ABANDONMENT #3 | "LAST CHANCE TO SAVE" / "APPLY 5% OFF" | USE CODE SAVE5 | SAVE5 |
| CART ABANDONMENT #1-2 | Not fully visible | — | — |
| BROWSE ABANDONMENT #1 | "Still thinking about it?" / "Complete your order today!" | SHOP NOW | None visible |
| BROWSE ABANDONMENT #2 | "Hey there" / 5-star review / "Your 5% offer is expiring soon!" | SHOP NOW | SAVE5 |
| BROWSE ABANDONMENT #3 | Not visible in screenshots | — | — |
| WELCOME #1 | Product lifestyle image / "Save 5% Today" | APPLY OFFER | WELCOME5 |
| WELCOME #2 | "5% OFF" / "We've got you more than covered" | SHOP | WELCOME5 |
| WELCOME #3 | "LAST CHANCE" / "Redeem 5% off your first purchase" | Button | WELCOME5 |
| FOOTER | "Best Sellers" with product thumbnails (grab handles, seat covers, fire extinguisher mount) | — | — |

### Discount Codes (MUST VERIFY IN SHOPIFY DISCOUNTS)
- **SAVE5** — 5% off, used in winback + cart/checkout/browse abandonment flows
- **WELCOME5** — 5% off first purchase, used in welcome series
- Both codes must exist in Shopify Discounts independently of G&P. If G&P created them, they may survive uninstall (Shopify discounts are store-level). Verify before cancelling.

### Key Takeaway for Replacements
- Keep the dark/bold aesthetic — it matches Bartact's tactical brand
- SAVE5 discount code needs to exist in Shopify Discounts (verify before building flows)
- Escalating urgency pattern: Email 1 = soft reminder, Email 2 = offer, Email 3 = "LAST CHANCE"
- Product images are dynamic (pulled from cart/browse data) — Shopify Email supports this natively
