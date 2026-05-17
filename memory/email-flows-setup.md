# Bartact Email Flows Setup — April 17, 2026

## ✅ COMPLETED VIA API

### Discount Codes Deactivated
| Code | Was | Status |
|------|-----|--------|
| `take10off` | 10% off, on coupon sites | **DEACTIVATED** |
| `SAVE5` | 5% off, unlimited use | **DEACTIVATED** |
| `WELCOME5` | 5% off, once per customer | **DEACTIVATED** |
| `THANKS5` | 5% off, once per customer | **DEACTIVATED** |

### Codes NOT Touched (correct)
- Military, Responder, Medical (legit verification codes)
- Shopify Collabs codes (MULANA, LAURIE, NANOOK, JLYNNE)
- 2026 Rob Shows (12% show codes)
- google (tracking code)
- FB-EMAIL-* codes (single-use Facebook lead gen codes)

### New Discount Codes Created (all ACTIVE)
| Code | Purpose | % Off | Once/Customer | Usage Limit |
|------|---------|-------|---------------|-------------|
| `BARTACT-WELCOME-5PCT` | Welcome series emails | 5% | Yes | Unlimited |
| `BARTACT-SAVE-5PCT` | Abandonment flow emails | 5% | Yes | Unlimited |
| `BARTACT-THANKS-5PCT` | Post-purchase emails | 5% | Yes | Unlimited |
| `BARTACT-WINBACK-5PCT` | Winback emails | 5% | Yes | Unlimited |

**Why these names?** Less guessable than SAVE5/WELCOME5. The `-5PCT` suffix makes them harder to stumble on. They're once-per-customer so even if leaked, each person only gets one use.

**Even better option:** Shopify's native email automations can auto-generate truly unique codes per recipient. See manual steps below.

---

## 🔧 MANUAL STEPS FOR MITCH (can't be done via API)

### Already Active (no action needed)
- ✅ Abandoned checkout automation
- ✅ Abandoned cart automation  
- ✅ Abandoned product browse automation

### Step 1: Add Discount Codes to Active Abandonment Automations
For each of the 3 active automations (abandoned checkout, cart, browse):

1. Go to **Marketing → Automations** in Shopify admin
2. Click on the automation (e.g., "Abandoned checkout")
3. Click **Edit** on the email template
4. Option A (preferred): Add a **"Discount"** block — Shopify can auto-generate unique single-use codes
5. Option B: Add text mentioning code `BARTACT-SAVE-5PCT` with "Save 5% — use code BARTACT-SAVE-5PCT"
6. Save & the automation stays active

**If Option A (unique codes) is available:** Use it! Set to 5% off, all products, one use per customer. This is the gold standard — each customer gets a unique code that can't be shared.

**If only Option B:** The BARTACT-SAVE-5PCT code is already created and active.

### Step 2: Create Welcome Series Automation
1. Go to **Marketing → Automations**
2. Click **Create automation**
3. Choose **"Welcome new subscriber"** or **"First purchase upsell"** template
4. Edit the email:
   - Subject: "Welcome to Bartact — Here's 5% Off Your First Order"
   - Body: Bartact logo, welcome message, code `BARTACT-WELCOME-5PCT` or use Shopify's unique code block
   - CTA: "Shop Now" → bartact.com
5. Set trigger: Customer subscribes to email / creates account
6. **Turn on**

### Step 3: Create Post-Purchase Thank You Automation
1. Go to **Marketing → Automations**
2. Click **Create automation**
3. Choose **"Post-purchase"** or **"Thank you"** template (or build custom)
4. Edit the email:
   - Subject: "Thanks for Your Order — Here's 5% Off Your Next"
   - Body: Thank you message, code `BARTACT-THANKS-5PCT`
   - CTA: "Shop Now" → bartact.com
5. Set trigger: Order fulfilled (or order created + delay 3 days)
6. Set delay: 3 days after fulfillment
7. **Turn on**

### Step 4: Create Customer Winback Automation
1. Go to **Marketing → Automations**
2. Click **Create automation**
3. Choose **"Customer winback"** template
4. Edit the email:
   - Subject: "It's Been a While — Come Back & Save 5%"
   - Body: "We miss you" message, code `BARTACT-WINBACK-5PCT`
   - CTA: "Shop Now" → bartact.com
5. Set trigger: Customer hasn't ordered in 60 days
6. **Turn on**

### Step 5 (Optional): Multi-Email Series
Shopify native automations support only 1 email per automation (unlike Grid & Pixel's 3-email series). Options:
- **Keep it simple:** 1 email per flow is fine for now — the ROI is in the first email anyway
- **Want multi-step?** Install **Shopify Flow** (free) + **Shopify Email** to chain delays + emails. Or consider Klaviyo free tier (250 contacts free).

---

## 🔍 Coupon Site Findings

The old static codes were definitely on coupon sites:
- `take10off` — confirmed leaked (Mitch flagged it)
- `SAVE5` / `WELCOME5` — generic enough to be guessed/scraped even if not directly posted
- All now **deactivated**

New codes (`BARTACT-WELCOME-5PCT` etc.) are:
- Less guessable names
- Once-per-customer (even if shared, limited damage)
- Can be replaced by Shopify's auto-generated unique codes in automations (best option)

---

## Summary of What's Live Right Now
| Flow | Status | Discount Code |
|------|--------|--------------|
| Abandoned checkout | ✅ Active (Shopify native) | None yet — Mitch needs to add |
| Abandoned cart | ✅ Active (Shopify native) | None yet — Mitch needs to add |
| Abandoned browse | ✅ Active (Shopify native) | None yet — Mitch needs to add |
| Welcome series | ❌ Needs manual setup | BARTACT-WELCOME-5PCT ready |
| Post-purchase | ❌ Needs manual setup | BARTACT-THANKS-5PCT ready |
| Winback | ❌ Needs manual setup | BARTACT-WINBACK-5PCT ready |
