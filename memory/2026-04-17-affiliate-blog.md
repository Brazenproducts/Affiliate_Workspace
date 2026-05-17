# Session: 2026-04-17 18:40:00 UTC

- **Session Key**: agent:main:main
- **Session ID**: e2551fd3-96c4-42af-9521-777178cfa740
- **Source**: webchat

## Conversation Summary

assistant: Let me verify by loading the Bronco page (should show the blue Bronco seat cover instead of the Jeep one):
assistant: The Bronco page now shows Bartact's actual blue/black Bronco seat covers instead of the Jeep ones. Both fixes are live:

**1. Vehicle-specific Bartact images:**
- Wrangler → keeps original Jeep JK red/black covers ✅
- Gladiator → Gladiator-specific red/black covers ✅
- Tacoma → Tacoma-specific red/black covers ✅
- 4Runner → 4Runner-specific graphite/black covers ✅
- Bronco → Bronco-specific blue/black covers ✅

**2. Wrangler page shop buttons:**
- TJ/LJ (1997-2006) → Shop button ✅ (already existed)
- JK/JKU (2007-2018) → Shop button ✅ (NEW)
- JL/JLU (2018+) → Shop button ✅ (NEW)

Each generation now has its own section with description and a "Shop at Bartact" button. Page is refreshed on your iMac.
assistant: The open thread is the blog build. I’m checking what the sub-agent actually finished so I can verify and close it out cleanly instead of guessing.
assistant: The posts exist and are pushed. I’m doing one final live check of the blog index and one article before I wrap this up.
assistant: Blog is live and working.

What’s now in place on `tacticalseats.com`:
- Blog index at `blog/index.html`
- 6 published posts
- Nav link to Blog across the site
- IndexNow key file deployed and submitted
- The site build rules updated and logged so future affiliate sites follow this same pattern

The key rule set is now captured:
- Affiliate sites need to be built visually, with real product photos next to reviews
- People need to see what they’re buying
- Pages need multiple reviewed brands, not thin one-brand fluff
- Blog content is required for traffic growth, not optional

The blog posts pushed are:
- `blog/molle-vs-pouches.html`
- `blog/best-seat-covers-jeep-wrangler-2026.html`
- `blog/neoprene-vs-cordura.html`
- `blog/ford-bronco-accessories-2026.html`
- `blog/seat-cover-installation-guide.html`
- `blog/tacoma-overlanding-seat-setup.html`

I also logged the blog calendar in [tacticalseats-blog-calendar.md](/home/ubuntu/.openclaw/workspace/memory/tacticalseats-blog-calendar.md) and added the broader affiliate-site build requirements to [affiliate-site-rules.md](/home/ubuntu/.openclaw/workspace/reference/affiliate-site-rules.md).

One caveat: I haven’t yet built the cron automation that actually writes and publishes future posts on schedule. The content calendar and blog structure are ready, but the automated publisher itself still needs to be implemented if you want true hands-off posting.
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Fri 2026-04-17 18:31 UTC] I lost your browser
assistant: Opened on your iMac — tacticalseats.com homepage. Should be up now.
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Fri 2026-04-17 18:34 UTC] I think it closed again
assistant: The tab is still there — it navigated to the Wrangler page though. It's tab `53FF69E20B6663B9708D06EB63DD65FD` showing `tacticalseats.com/jeep-wrangler-seat-covers.html`. Looks like you may have clicked a link on it.

I can see it in your Chrome but I can't force-focus a tab from here — you'll need to click on it in your tab bar. It should say "Best Seat Covers 2026 - TacticalSeats". You've got a lot of tabs open so it might be buried.
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Fri 2026-04-17 18:36 UTC] Is it chrome? I don't see yours as one of my browsers that is open on my computer
assistant: Yeah it's Chrome — the one running with the OpenClaw node. It's a separate Chrome instance that launched with remote debugging enabled, so it might not show up the same way in your Dock. It could be minimized or behind other windows.

Try clicking the Chrome icon in your Dock — if there are multiple Chrome windows, it should cycle through them. The one I'm controlling has tabs for MS Ads, Shopify, Amazon, Bartact, and the tacticalseats.com page.
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Fri 2026-04-17 18:37 UTC] There it is. Thanks. OK. Log everything . Let's work on more sites. Send me a prompt to work on more using the same rules as this site, and I'll start a new session
assistant: Everything's logged. Here's your prompt for the next session:

---

**Apply the tacticalseats.com playbook to the next affiliate site.** Rules are in `reference/affiliate-site-rules.md`. The gold standard is now tacticalseats.com — dark theme, real product images, 6+ brands reviewed per page, YMM/product finder dropdown, blog section with 6 initial posts, IndexNow, network footer linking all sites, no fake claims. Pick the highest-impact site from our 14 to upgrade next (bestseatcover.com or jeepseatcover.com are probably the best candidates since they overlap with Bartact's market). Same process: audit what's there, fix it to match the new standard, add blog + content calendar, set up cron for ongoing posts. Don't replace existing good content — fix and expand.

---

Want me to paste that into TASKS.md too so it's queued up?
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Fri 2026-04-17 18:38 UTC] yes please
assistant: Done — tacticalseats.com marked complete and the next site upgrade is queued in TASKS.md. When you start a new session just say "let's upgrade the next affiliate site" and I'll pick it up from there. 🎸
