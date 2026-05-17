# Email Capture Widget — Bartact Affiliate Network

Dark-themed, gold-accented email capture system for affiliate sites. Three variants: sticky bottom bar, exit-intent popup, and inline form between product cards.

---

## Files

| File | Purpose |
|------|---------|
| `email-capture.js` | Main widget (all three variants) |
| `email-capture.css` | Styles (dark theme, gold #f0a500) |
| `capture-endpoint.js` | Node.js POST endpoint |
| `inject-capture.sh` | Bash deploy script for static sites |

---

## Quick Start

### 1. Add to any HTML page manually

```html
<!-- In <head> -->
<link rel="stylesheet" href="email-capture.css">

<!-- Before </body> -->
<script
  src="email-capture.js"
  data-variants="sticky,popup,inline"
  data-endpoint="https://your-endpoint.com/api/subscribe"
  data-source-site="my-affiliate-site"
></script>
```

**data-variants** — comma-separated, any combo of: `sticky`, `popup`, `inline`  
**data-endpoint** — your POST URL (default: `/api/subscribe`)  
**data-source-site** — identifier logged with each signup

### 2. Inject into a static site directory

```bash
./inject-capture.sh /path/to/your/site
```

This copies the JS/CSS and injects tags before `</body>` in every `.html` file. Already-injected files are skipped safely.

### 3. Inline form placement

Auto-detects product cards (`.product-card`, `.product-item`, etc.) and inserts after the 4th card. To control placement manually, add an empty div:

```html
<div data-ec-inline></div>
```

---

## Deploying the Endpoint

### Option A — Standalone Node.js

```bash
# Install (no dependencies — uses built-in http/fs modules)
node capture-endpoint.js

# Custom port and data file
PORT=3001 DATA_FILE=/var/data/subscribers.json node capture-endpoint.js

# Allow specific origins only
ALLOWED_ORIGINS=https://mysite.com,https://affiliate2.com node capture-endpoint.js
```

### Option B — Vercel (recommended for zero-ops)

1. Copy `capture-endpoint.js` to `api/subscribe.js` in your Vercel project
2. Add to `api/subscribe.js` at the bottom:
   ```js
   module.exports = handler;  // replace the existing module.exports line
   ```
3. Set environment variable `DATA_FILE` to a writable path, or swap the file storage for Vercel KV / Upstash Redis (see "Scaling" below)
4. Deploy: `vercel --prod`

### Option C — Cloudflare Workers

Cloudflare Workers don't have a filesystem. Swap the file storage for:
- **Cloudflare KV** — `await KV.put('subscribers', JSON.stringify(list))`
- **D1 database** — `INSERT OR IGNORE INTO subscribers (email, source_site, signup_type, subscribed_at) VALUES (?, ?, ?, ?)`

Minimal Workers adapter:

```js
// worker.js
import { handleSubscribe } from './capture-endpoint.js';

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    const body = await request.json();
    // Replace file writes with KV or D1 calls here
    const result = handleSubscribe(body, request.headers.get('origin'));
    return Response.json(result.body, { status: result.status, headers: corsHeaders() });
  }
};
```

---

## Connecting to Klaviyo

1. In `capture-endpoint.js`, after `writeSubscribers(subscribers)`, add:

```js
// Klaviyo list subscribe
await fetch('https://a.klaviyo.com/api/v2/list/LIST_ID/members', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Api-Key': process.env.KLAVIYO_PRIVATE_KEY,
  },
  body: JSON.stringify({
    profiles: [{ email: email, source_site: sourceSite, signup_type: signupType }]
  })
});
```

2. Set `KLAVIYO_PRIVATE_KEY` and `LIST_ID` as environment variables.

## Connecting to Mailchimp

```js
// Mailchimp Marketing API v3
const crypto = require('crypto');
const md5 = crypto.createHash('md5').update(email).digest('hex');
await fetch(`https://us1.api.mailchimp.com/3.0/lists/LIST_ID/members/${md5}`, {
  method: 'PUT',
  headers: {
    'Authorization': 'Basic ' + Buffer.from('anystring:' + process.env.MAILCHIMP_API_KEY).toString('base64'),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email_address: email, status_if_new: 'subscribed',
    merge_fields: { SOURCE: sourceSite, STYPE: signupType } })
});
```

---

## Revenue Math

| Metric | Value |
|--------|-------|
| Subscribers | 10,000 |
| Email → site conversion | 2% |
| Average order value | $400 |
| **Annual revenue** | **$80,000** |

At 5% conversion (warm list, good segmentation): **$200,000/yr**

Affiliate commission at 8%: **$6,400–$16,000/yr passive** from email alone.

---

## Dismissal Behavior

All three variants store dismissal in `localStorage` with a 7-day TTL. After 7 days, the widget reappears. To change the TTL, edit `DISMISS_TTL_MS` in `email-capture.js`.

---

## Data Format

`data/email-subscribers.json` — flat JSON array:

```json
[
  {
    "email": "rider@example.com",
    "source_site": "jeep-accessories-review.com",
    "signup_type": "exit_popup",
    "subscribed_at": "2026-05-07T17:30:00.000Z"
  }
]
```

Duplicates are silently deduplicated by email address.
