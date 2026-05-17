# Affiliate Network Social / YouTube Architecture

_Last updated: 2026-04-20_

## TL;DR
52 affiliate sites ≠ 52 social accounts. Use **4 umbrella brand accounts** per platform, each feeding a cluster of sites. Product brands (Bartact, Bull Strap, Ballkinis) keep their own accounts — those are real businesses with real customers. Affiliate sites borrow the umbrella account for distribution.

---

## Current state (what already exists)

### Product brand accounts (DO NOT TOUCH — these are real businesses)
- **Bartact** — Facebook + Instagram with permanent tokens ✅
- **Ballkinis** — Facebook + Instagram with ~60-day tokens (expire ~May 2026)
- **Bull Strap** — currently no social per creds file; may exist separately

### Umbrella affiliate accounts (existing)
- **YouTube** — `@whatarebestpicks` (youtube.com/@whatarebestpicks)
- **Pinterest** — `pinterest.com/whatarebest`
  - Both on email `info@brazenauto.com`, password known

### Missing
- No Instagram/TikTok/Facebook umbrella accounts for the affiliate network
- No cluster-specific YouTube channels
- No crosspost automation

---

## Proposed cluster map (52 sites → 4 hubs)

### Cluster A: **Off-Road & Trucks** (~32 sites)
Sites: bestbroncoaccessories, broncobumper/biminis/cargo/exterior/floormats/grab/handles/headliner/interior/lift/molle/rollbar/rollcage/shade/tent/tents/tops/upgrade, besttonneaucovers, besttruckaccessories, broncoseatcover, gladiatorseatcover, jeepseatcover, wranglerseatcover, bestseatcover, tacomaseats, topoffroadstores, bestoffroadbrands, autopartsreviewed, slatetruckparts, sportadventurevehicleparts, ramrevparts, scoutruvparts, scoutsuvparts, scoutterraparts

Audience: Jeep/Bronco/truck owners, off-road enthusiasts. Overlaps heavily with Bartact/Bull Strap customer base.

**Hub brand:** `@bestoffroadpicks` (or Mitch picks better name)

### Cluster B: **EV / Electric** (~10 sites)
Sites: rivianaftermarket, r1sparts, r1sstorage, r1tparts, r1tstorage, r2sparts, r2tparts, cybertruckbumpers/gen1/seat/seatcovers/shell/storage/tires

Audience: Rivian / Cybertruck / Scout EV owners — early adopters, high disposable income, hungry for aftermarket info.

**Hub brand:** `@bestevaftermarket` or similar

### Cluster C: **Home & General** (~6 sites)
Sites: bestcordlesstools, bestfirestick, bestgarageorganizer, bestinstantpot, bestmeshwifi, bestsmokergrill

Audience: General consumer, Amazon shopper. Different audience from off-road.

**Hub brand:** Reuse existing **`@whatarebestpicks` (YouTube) + `@whatarebest` (Pinterest)** — already aligned with whatarebest.com

### Cluster D: **Reserved / Niche** (~4 sites)
Sites: whatarebest (meta-site), broncobiminis/shade/tent/tents (could fold into Cluster A)

For now: roll into A or C as the content dictates.

---

## Platform strategy per cluster

### YouTube — highest-leverage platform for affiliate
YouTube product roundups rank for years, drive Amazon clicks passively, don't require daily posting.

| Cluster | Channel | Status | Content format |
|---|---|---|---|
| A – Off-Road | new `@bestoffroadpicks` | **Mitch creates** | Product roundups, vehicle-specific build guides, comparison videos |
| B – EV | new `@bestevaftermarket` | **Mitch creates** | Rivian/Cybertruck accessory reviews, install guides |
| C – Home/General | `@whatarebestpicks` | ✅ exists | Product roundups across categories |

**Content pipeline:** every major blog post on an affiliate site → 2–5 min talking-head or slideshow video → upload to the cluster's YouTube channel → pin comment with link back to the site.

**Automation I can do:**
- Generate video scripts from existing blog posts
- Create slideshow-style videos programmatically (product images + text overlays + voice via ElevenLabs)
- Upload via YouTube Data API v3 (needs OAuth token per channel)

**What Mitch must do:**
- Create the 2 new YouTube channels (needs Google account, can't automate)
- Verify phone (one-time) so each channel can upload videos over 15 min
- Approve the voiceover direction (Axl voice / AI voice / Mitch's voice)

### Instagram — visual product showcases + reels

| Cluster | Account | Status | Format |
|---|---|---|---|
| A – Off-Road | new `@bestoffroadpicks` | **Mitch creates** | Product carousels, reels, quick tips |
| B – EV | new `@bestevaftermarket` | **Mitch creates** | Same |
| C – Home/General | new `@whatarebestpicks` (match YT) | **Mitch creates** | Same |

**Automation:**
- Post via Instagram Graph API once tokens exist (same playbook as Bartact)
- Auto-crosspost: new blog post → 1 carousel post + 1 reel to cluster hub IG

**What Mitch must do:**
- Create each IG as a Business account (required for Graph API access)
- Link each to a matching Facebook Page (required for Business IG)
- Log in once so I can grab long-lived tokens (same process used for Bartact/Ballkinis)

### TikTok — high-volume, low-effort video

Same 3 hubs as Instagram. TikTok API is more restrictive than IG, but we can:
- Upload videos via TikTok Content Posting API (requires dev app + approval)
- Or: Mitch posts manually from a saved content queue I prep

**Recommend:** skip TikTok for month 1, add in month 2 once YouTube + IG are working.

### Pinterest — evergreen traffic driver, underrated

| Cluster | Account | Status |
|---|---|---|
| A – Off-Road | new `@bestoffroadpicks` | **Mitch creates** or extend existing |
| B – EV | new `@bestevaftermarket` | **Mitch creates** |
| C – Home/General | `pinterest.com/whatarebest` | ✅ exists |

**Automation:** Pinterest API allows pin creation + board management. Every product card image on an affiliate site → auto-pin to the correct cluster board with link back to the site's roundup.

Pinterest pins have a half-life of ~3 months (vs. Instagram's ~24 hours) — 10x more efficient per post.

### Facebook — low priority, organic is dead

Only reason to have Facebook Pages: they're required to get Business Instagram + Meta Business Manager. Create them, post occasionally, don't invest energy.

---

## What Mitch must create (the ask list)

In order of leverage. Each item is 2–5 minutes.

### Priority 1 (high-leverage, do first)
1. **YouTube channel:** `@bestoffroadpicks` (or pick name) — on `info@brazenauto.com` Google account (same as existing `@whatarebestpicks`)
2. **YouTube channel:** `@bestevaftermarket` (or pick name) — same Google account
3. **Instagram Business:** `@bestoffroadpicks` — link to a new FB Page of same name
4. **Instagram Business:** `@bestevaftermarket` — link to a new FB Page of same name
5. **Instagram Business:** `@whatarebestpicks` — link to a new FB Page of same name

### Priority 2 (do after 1)
6. **Pinterest Business:** `bestoffroadpicks` (or extend existing whatarebest to also serve off-road if you want to keep it simple)
7. **Pinterest Business:** `bestevaftermarket`

### Priority 3 (do in month 2+)
8. TikTok Business accounts for the 3 hubs
9. Twitter/X hub accounts (optional, low ROI)

### Naming — Mitch decides
Suggested handles (need to check availability):
- `@bestoffroadpicks` / `@offroadpicks` / `@bestoffroadreviews`
- `@bestevaftermarket` / `@evaftermarketpicks` / `@cybertruckrivianpicks`
- Keep `@whatarebestpicks` for home/general

I can check handle availability across all 4 platforms in one script once Mitch picks 2 preferred names per cluster.

---

## Automation I can build after accounts exist

### Per-blog-post crosspost pipeline
Every new post on a site in Cluster X:
1. Auto-generate Instagram carousel (cover + top 5 products + CTA slide)
2. Auto-generate Instagram reel script + slideshow video
3. Upload both to `@hub_x` via Graph API
4. Auto-generate Pinterest pin for hero image + each product image
5. Pin to the correct board on the cluster hub Pinterest
6. Queue YouTube roundup video (Axl generates script, slideshow, voiceover; Mitch approves before upload or auto-upload to unlisted for review)
7. Log to `memory/crosspost-log.jsonl`

### Weekly "best of" digest
Every Sunday: auto-compile the week's top products across all sites → cluster-specific digest reel/video.

### Cron schedule (proposed)
- Mon 15:00 UTC: weekly content planning — review which blog posts need social
- Daily 16:00 UTC: process crosspost queue (runs ~5 min, skips if empty)
- Sun 17:00 UTC: weekly digest generation

---

## Revenue model per cluster

Each cluster should drive:
1. **Direct Amazon Associates clicks** — existing tag `brazenprodu01-20`
2. **Direct Bartact/Bull Strap clicks** (Cluster A only, where vehicle coverage applies)
3. **Brand lift** — YouTube subscribers + IG followers are an owned audience

Success metric 90 days out:
- Cluster A: 1k YT subs, 500 IG followers, 20 Amazon purchases/mo via social, measurable Bartact click-through
- Cluster B: 500 YT subs, 300 IG (smaller market)
- Cluster C: continue @whatarebestpicks growth

---

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Meta flagging 3 new IG accounts from same infra as spam | Create them from Mitch's own phone on home Wi-Fi; warm up with 7 days of manual posting before API |
| YouTube demonetizes AI voiceover | Use ElevenLabs (high quality) not robotic TTS; disclose in description; Mitch's voice is option B |
| TikTok Content Posting API approval delays | Skip TikTok month 1, manual posting from scheduled queue |
| Audience mismatch (e.g. IG follower of off-road page sees seat cover post) | Cluster boundaries are tight — seat cover sites ARE in off-road cluster because audience is same |
| Pinterest account suspension for "too commercial" | Already have whatarebest running — use same playbook |

---

## Decision points for Mitch

1. Approve cluster map? (52 sites → 3 hubs + keep existing)
2. Approve names? (`@bestoffroadpicks`, `@bestevaftermarket`, or alternatives)
3. OK to use `info@brazenauto.com` Google account for all new YT channels?
4. YouTube voice: Axl's-style voice via ElevenLabs / generic AI voice / Mitch records / human hire?
5. Start with YouTube first (highest leverage) or Instagram first (fastest to content)?

---

## What happens next

After Mitch answers the 5 decision points + creates the Priority 1 accounts:
1. Axl grabs the IG long-lived tokens (same flow as Bartact)
2. Axl sets up YouTube Data API OAuth per channel
3. Axl builds the crosspost pipeline scripts
4. Axl generates the first batch of 3 videos (one per cluster) as demo
5. Mitch reviews, approves direction, automation goes live

Timeline: 1 week from Mitch's account creation to first automated posts.
