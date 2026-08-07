# recentratings.com — New Bot Handoff Doc
_Maintained by SkipATip bot. Updated as things change._

## Bot Info
- **Telegram bot**: @recentratingsbot — t.me/recentratingsbot
- **Telegram bot token**: `8804175034:AAHepIV9YyYMq04DVIgVzpB4sPdTHclzmpw`
- **Created**: 2026-07-27

---

## What Is This?

**recentratings.com** — A restaurant review aggregator with a key differentiator: **time-filtered ratings**. Users can see a restaurant's score for the last 30 days, 6 months, 12 months, or all time. Nobody else does this. Google/Yelp show one static average; we show how a place is trending *right now*.

---

## The Core Concept

Most review sites show a single all-time average. A restaurant can coast on old reviews while quietly going downhill. recentratings.com exposes that by letting users filter reviews by recency.

**Composite Score Formula:**
- Google: 40%
- Yelp: 35%
- Facebook: 25% _(not yet integrated — placeholder for now)_

**Time Buckets:**
- Last 30 days
- Last 6 months
- Last 12 months
- All time

---

## Data Source

All data comes from the **SkipATip Supabase database** — same project, same credentials.

### Supabase Credentials
- See `/home/ubuntu/.openclaw/workspace/.env` or `/home/ubuntu/.openclaw/workspace/skipatip/.env` for `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Same keys SkipATip pipeline uses — you have read/write access to the whole DB

### Key Tables

**`places_raw`** — 432k+ restaurants (growing ~2,300/day)
- Fields: `place_id`, `name`, `address`, `city`, `state`, `zip`, `lat`, `lng`, `phone`, `website`, `google_rating`, `google_review_count`, `yelp_rating`, `yelp_review_count`, `yelp_id`, `combined_rating`, `combined_score_90d`, `combined_score_180d`, `combined_score_365d`, `google_photo_url`, `price_level`, `hours`, `slug`, `source`
- Sources in DB: `pipeline` (Google Places, 212k), `city_opendata` (Socrata, 202k), `wikidata` (18k chains)

**`reviews_cache`** — 126k+ individual reviews with timestamps
- This is what powers time-bucketing — reviews have `created_at` (Google's original review date)
- Fields: `place_id`, `author_name`, `rating`, `text`, `time` (Unix timestamp), `created_at`

**`recent_ratings`** — Pre-synced table specifically for recentratings.com
- Sync script: `/home/ubuntu/.openclaw/workspace/skipatip/scripts/data-pipeline/sync-to-recent-ratings.js`
- Run: `node sync-to-recent-ratings.js --all` to populate from places_raw
- Has `combined_score_90d`, `combined_score_180d`, `combined_score_365d` fields

---

## Current Data Status (as of 2026-07-27)
- Total places: **432,234** (+~2,300/day)
- Reviews with timestamps: **126,682**
- Cities covered: **914 done**, 20,347 pending (~4.2M more restaurants to collect)
- Yelp data: **NOT YET collected** — 0 Yelp API keys configured. Google-only for now.
- The composite score is effectively Google-only until Yelp keys are added.

---

## What's NOT Built Yet (Your Job)
- [ ] recentratings.com frontend (website)
- [ ] Search by city/restaurant name
- [ ] Restaurant detail page with time-bucket toggle (30d / 6mo / 1yr / all time)
- [ ] Composite score calculation (currently just Google)
- [ ] Yelp API integration (get keys, wire into data pipeline)
- [ ] Facebook reviews integration (Phase 3, not urgent)
- [ ] SEO — target "[city] restaurant ratings", "[restaurant name] recent reviews"

---

## What IS Built
- [x] Supabase DB with 432k places and growing
- [x] `recent_ratings` table schema exists
- [x] `sync-to-recent-ratings.js` script to populate it
- [x] `reviews_cache` table with timestamped reviews for time-bucketing
- [x] Daily pipeline collecting ~2,300 new places/day automatically
- [x] Domain: recentratings.com (owned by Mitch)

---

## Pipeline (Runs Automatically — Don't Touch)
These crons run daily and are managed by the SkipATip bot:
- **Daily Places** (2am PST): `03-collect-places.js --limit=20` — adds ~2,300 places
- **Daily Reviews** (4am PST): `04-collect-reviews.js --limit=500` — syncs review timestamps

You consume the output. You don't need to run the pipeline yourself.

---

## Yelp API Setup (When Ready)
1. Sign up at https://www.yelp.com/developers
2. Get API key
3. Add to `/home/ubuntu/.openclaw/workspace/skipatip/scripts/data-pipeline/config.js` under `YELP_API_KEYS`
4. Run `05-collect-yelp.js` to backfill
5. Update composite score formula once Yelp data is flowing

---

## GitHub
- GitHub org: `Brazenproducts`
- Token: see `/home/ubuntu/.openclaw/workspace/memory/api-credentials.md` or MEMORY.md under GitHub credentials
- Pattern: create repo `Brazenproducts/recentratings.com`, enable GitHub Pages, point DNS

---

## DNS / Hosting
- Registrar: GoDaddy (same account as all other domains)
- Likely hosting: GitHub Pages (static) or Vercel (if dynamic/Next.js)
- If GitHub Pages: A records → 185.199.108-111.153, CNAME www → brazenproducts.github.io
- If Vercel: A → 76.76.21.21, CNAME www → cname.vercel-dns.com

---

## Key Decisions Still Open
1. **Stack**: Static site (fast, free) vs Next.js on Vercel (dynamic search, SSR) — recommend Vercel/Next.js given search + time-bucket filtering needs
2. **Yelp keys**: Need to get these before composite scores mean anything
3. **Monetization**: TBD — could be ads, premium features, restaurant claiming

---

## Contact
- Mitch (owner): Telegram 7550065844
- SkipATip bot (data pipeline owner): has all pipeline context, update this doc when schema changes
