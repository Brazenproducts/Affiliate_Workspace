# Affiliate Social System — Status

_Last updated: 2026-04-20 22:15 UTC_

Central source of truth for the affiliate network social automation.

---

## Cluster definitions

### Cluster A — Off-Road / Trucks (~32 sites)
Sites: bestbroncoaccessories, broncobumper, broncobiminis, broncocargo, broncoexterior, broncofloormats, broncoheadliner, broncointerior, broncolift, broncomolle, broncorollbar, broncorollcage, broncoshade, broncotent, broncotents, broncotops, broncoupgrade, besttonneaucovers, besttruckaccessories, gladiatorseatcover, jeepseatcover, wranglerseatcover, bestseatcover, tacomaseats, topoffroadstores, slatetruckparts, sportadventurevehicleparts, ramrevparts, scoutruvparts, scoutsuvparts, scoutterraparts, autopartsreviewed

### Cluster B — EV / Electric (~13 sites)
Sites: rivianaftermarket, r1sparts, r1sstorage, r1tparts, r1tstorage, r2sparts, r2tparts, cybertruckbumpers, cybertruckgen1, cybertruckseat, cybertruckseatcovers, cybertruckshell, cybertruckstorage, cybertrucktires

### Cluster C — Home / General (~7 sites)
Sites: bestcordlesstools, bestfirestick, bestgarageorganizer, bestinstantpot, bestmeshwifi, bestsmokergrill, whatarebest

---

## Account roster

### Cluster A — Best Offroad Picks
| Platform | Handle | Status | Credentials |
|---|---|---|---|
| YouTube | `@BestOffroadPicks` | **Pending Mitch create** | will use info@brazenauto.com |
| Instagram | `@bestoffroadpicks` | **Pending Mitch create** | Business, link to FB Page |
| Facebook Page | Best Offroad Picks | **Pending Mitch create** | - |
| Pinterest | bestoffroadpicks | To-do (phase 2) | - |

### Cluster B — EV Aftermarket Picks
| Platform | Handle | Status | Credentials |
|---|---|---|---|
| YouTube | `@EVAftermarketPicks` | **Pending Mitch create** | info@brazenauto.com |
| Instagram | `@evaftermarketpicks` | **Pending Mitch create** | Business, link to FB Page |
| Facebook Page | EV Aftermarket Picks | **Pending Mitch create** | - |
| Pinterest | evaftermarketpicks | To-do (phase 2) | - |

### Cluster C — What Are Best Picks
| Platform | Handle | Status | Credentials |
|---|---|---|---|
| YouTube | `@whatarebestpicks` | ✅ Exists | info@brazenauto.com — pwd in credentials.md |
| Instagram | `@whatarebestpicks` | **Pending Mitch create** | Business, link to FB Page |
| Facebook Page | What Are Best Picks | **Pending Mitch create** | - |
| Pinterest | whatarebest | ✅ Exists | info@brazenauto.com — pwd in credentials.md |

### Product brands (separate — DO NOT merge)
- Bartact — FB + IG with permanent tokens
- Ballkinis — FB + IG with ~60d tokens
- Bull Strap — status TBD

---

## API capabilities needed (Axl side)

| Platform | API | Current status | Needs |
|---|---|---|---|
| YouTube Data v3 | Upload + manage | **Not set up** | OAuth refresh token per channel |
| Meta Graph (FB+IG) | Post + read comments | ✅ working for Bartact | Long-lived page tokens per new hub |
| Pinterest | Create pins | **Not set up** | API key + board IDs |
| ElevenLabs | TTS for YouTube voiceover | **Not set up** | API key — need Mitch to sign up |

### Scripts to build (in order)
1. ✅ `scripts/deploy-contact-form.js` — done
2. ✅ `scripts/affiliate-network-qa.js` — done
3. ✅ `scripts/affiliate-seo-autofix.js` — done
4. ⏳ `scripts/social-hub-token-bootstrap.js` — fetches long-lived FB+IG tokens for each hub after accounts exist
5. ⏳ `scripts/youtube-upload.js` — uploads video + description + tags per channel
6. ⏳ `scripts/video-gen-slideshow.js` — turns a blog post into a slideshow video (ffmpeg)
7. ⏳ `scripts/voiceover-elevenlabs.js` — generates voiceover from script
8. ⏳ `scripts/blog-to-social-pipeline.js` — orchestrator: new post → queue IG/YT/Pinterest jobs
9. ⏳ `scripts/social-dm-triage.js` — reads inbox/DMs/comments, triages spam vs. real

---

## Production pipeline (once accounts exist)

```
new blog post published
  ↓
blog-to-social-pipeline.js detects via git diff or RSS
  ↓
classify cluster (A / B / C)
  ↓
generate:
  - Instagram carousel (cover + 5 product slides + CTA)
  - Instagram Reel script + slideshow video (ffmpeg + ElevenLabs voiceover)
  - YouTube long-form video (3–5 min, slideshow + voiceover)
  - Pinterest pins (one per product image)
  ↓
post via API to cluster's hub account
  ↓
log to memory/crosspost-log.jsonl
```

Posting cadence (month 1):
- 1 YouTube/week per channel
- 3 IG posts + 2 Reels/week per hub
- 10 Pinterest pins/week per hub

---

## Monitoring + triage

Daily 16:00 UTC cron pulls:
- New comments on YouTube (per channel)
- New DMs + comments on Instagram (per hub)
- New messages on Facebook Pages
- New Pinterest pin stats

Triage logic:
- Spam / link drops / guest post pitches → trash silently
- Product questions → Axl answers using site content
- Brand partnership / media / press → **ping Mitch**
- Customer complaint or legal-sounding → **ping Mitch immediately**
- Anything ambiguous → **ping Mitch**

All activity logged to `memory/social-inbox-triage-<date>.jsonl`.

---

## Current blockers

1. Mitch hasn't created the 2 new YT channels yet (Best Offroad Picks, EV Aftermarket Picks)
2. Mitch hasn't created the 3 IG Business accounts + FB Pages yet
3. No ElevenLabs API key yet — need Mitch to sign up (recommend https://elevenlabs.io — Creator plan $22/mo, ~100k chars/mo, enough for 10+ long-form videos)

Everything else Axl can build in parallel while waiting.
