# Bartact Checkout Config — Captured April 17, 2026

## Checkout Setup
- Contact method: Phone number or email
- No sign-in required
- Marketing opt-in: Email only (checkbox on checkout + sign-in page, preselected in certain regions)
- SMS: Don't show
- Tipping: Enabled
- Post-purchase: Upsell.com ex ReConvert installed (no config shown)
- Checkout language: English
- Add-to-cart limit: ON (protects inventory quantities)
- Negate Bot Protection: ACTIVE (2 instances)
- ReConvert cart-transformer-rust: ACTIVE

## Abandoned Checkout Emails
- NOT VISIBLE in this checkout settings page
- Shopify may have moved this to Marketing → Automations in newer versions
- NEED TO FIND AND ENABLE

## Order Status Page Additional Scripts (DEPRECATED but still running)
### Thank you message text
"Thank you for your purchase from Bartact!..." (custom text about shipping times, USPS tracking delays, etc.)

### GA4 Tracking (G-9K6CY3YDJF)
- gtag.js loaded
- Purchase event fires on first_time_accessed with:
  - transaction_id, value (total_price/100), currency, tax, shipping, line items

### Google Ads Conversion (AW-739987346)
- Enhanced conversions enabled (email, name, address)
- Conversion action: AW-739987346/1kc2CJ3-xO0YEJKf7eAC
- Value: checkout.total_price / 100
- Currency: {{ CURRENCY }}
- Transaction ID: {{ order_number }}

### Microsoft Ads UET
- **NOT PRESENT** — This is why all MS Ads conversions show $1 revenue
- The Shopify Microsoft Channel app was supposed to handle this but wasn't passing values
- FIX: Add UET snippet here with real order values

## NOTE: No abandoned checkout auto-email setting visible
- G&P was handling ALL email flows
- With G&P uninstalled, NOTHING is sending recovery emails
- Must set up Shopify native automations via Marketing → Automations
