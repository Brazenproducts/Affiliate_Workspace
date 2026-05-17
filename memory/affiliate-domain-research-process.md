# Affiliate Domain Research Process (May 5, 2026)

## Goal
Find available domains for affiliate sites that match high-volume product searches where Amazon ranks well on Google.

## Process

### Step 1: Get Real Amazon Search Volume Data
- **Source:** Amazon Brand Analytics (SP-API)
- **Report:** `GET_BRAND_ANALYTICS_SEARCH_TERMS_REPORT`
- **Data:** Top searched terms on Amazon marketplace by week, with search frequency rank
- **Why:** This is ACTUAL search volume on Amazon (not estimates), ranked by popularity
- **Script:** `scripts/amazon-brand-analytics-test.js` → `scripts/amazon-ba-stream-download.js`
- **Output:** 3.4GB JSON with ~millions of search terms ranked by frequency
- **Parsed:** First 10MB extracted top 300+ terms, filtered for physical products (excluded media/groceries/single-letter queries)

### Step 2: Generate Domain Candidates
- **Pattern:** `best[product].com`, `best[product-with-hyphens].com`, `top[product].com`
- **Why "best":** Matches buyer-research intent on Google, exact-match domain SEO boost, consistent with existing affiliate network
- **Script:** Node.js inline script using GoDaddy API bulk availability check
- **API:** GoDaddy `/v1/domains/available` (POST with array of domains)
- **Rate limit:** 60 req/min, batched 5 domains per request with 1.1s delay
- **Result:** 84 available domains from first pass (hyphenated "best-" prefix), 65 total after filtering

### Step 3: Verify Amazon Ranks on Google for Those Queries
- **Critical step:** Confirm Amazon actually ranks top 10 on Google for "best [product]" queries
- **Why:** If Amazon doesn't rank, your affiliate site has nothing to point to
- **Method:** xAI Grok Agent Tools API with `web_search` tool (live Google search)
- **API:** `https://api.x.ai/v1/responses` with `tools: [{"type":"web_search"}]`
- **Model:** `grok-4-fast`
- **Cost:** ~$0.057 per query, 45 queries = ~$2.50 total
- **Script:** `scripts/serp-batch.sh`
- **Output:** `memory/serp-rankings.jsonl` (one JSON object per line with query, top10 domains, amazonRank)
- **Result:** Amazon ranks top 10 for 43 of 45 queries tested

### Step 4: Prioritize by Amazon SERP Rank
- **Logic:** Lower Amazon rank = more clicks convert (Amazon is already at the top)
- **Tier 1 (buy first):** Amazon ranks #1-3 on Google
- **Tier 2:** Amazon ranks #4-5
- **Tier 3:** Amazon ranks #6-10
- **Skip:** Amazon not in top 10 (only 2 cases: espresso machine, floor mats)

## Key Findings

### Amazon SERP Performance
- **43 of 45** queries had Amazon in top 10
- **17 queries** had Amazon in top 3 (elite tier)
- **7 queries** had Amazon at #1 or #2 (instant conversions)

### Competition Analysis
- For "best [product]" queries, top results are review/affiliate sites (NYTimes Wirecutter, Forbes, Reddit, niche review sites)
- Amazon doesn't try to rank for "best X" — they rank for the product name itself
- This means affiliate sites compete against other review sites, NOT against Amazon directly
- Niche/trending products (neck lift tape, pheromone cologne, vibration plate) have less competition than huge categories (air fryer, espresso machine)

### Domain Availability Patterns
- No-hyphen "best[product].com" mostly taken
- Hyphenated "best-[product].com" mostly available
- "top[product].com" (no hyphen) mostly available
- Both work for SEO; hyphenated slightly better for readability

## Recommended Buy List (15 domains, ~$195)
All have Amazon ranking #1-3 on Google:

1. bestmagnesiumglycinate.com — Amazon #1, search rank #13 on Amazon
2. bestnecklifttape.com — Amazon #1, search rank #32
3. bestportable-charger.com — Amazon #2, search rank #61
4. bestheating-pad.com — Amazon #2, search rank #98
5. bestvibrationplate.com — Amazon #2, search rank #307
6. bestresistance-bands.com — Amazon #2, search rank #222
7. bestprotein-powder.com — Amazon #3, search rank #33
8. bestmini-fridge.com — Amazon #3, search rank #87
9. bestmassage-gun.com — Amazon #3, high volume
10. bestgaming-chair.com — Amazon #3, high volume
11. bestice-maker.com — Amazon #3, high volume
12. bestportable-ac.com — Amazon #3, high volume
13. bestpower-bank.com — Amazon #3, search rank #134
14. bestlabel-maker.com — Amazon #3, search rank #313
15. bestshower-head.com — Amazon #3, search rank #142

## Tools & APIs Used

### Amazon SP-API (Brand Analytics)
- **Endpoint:** `https://sellingpartnerapi-na.amazon.com/reports/2021-06-30/reports`
- **Auth:** LWA OAuth refresh token → access token
- **Report type:** `GET_BRAND_ANALYTICS_SEARCH_TERMS_REPORT`
- **Credentials:** `.amazon-bartact-credentials.json`
- **Rate limit:** Generous, reports are async (202 → poll → download)

### GoDaddy Domains API
- **Endpoint:** `https://api.godaddy.com/v1/domains/available`
- **Auth:** `Authorization: sso-key {key}:{secret}`
- **Method:** POST with JSON array of domains
- **Rate limit:** 60 req/min
- **Credentials:** `memory/credentials.md` (GoDaddy API section)

### xAI Grok Agent Tools API
- **Endpoint:** `https://api.x.ai/v1/responses`
- **Auth:** `Authorization: Bearer {key}`
- **Model:** `grok-4-fast` (or `grok-4-fast-reasoning` for complex queries)
- **Tool:** `{"type":"web_search"}` for live Google search
- **Cost:** ~$0.05-0.06 per query with web search
- **Credentials:** `memory/credentials.md` (xAI section)
- **Note:** Old `live_search` parameter is deprecated; use Agent Tools API with `web_search` tool

## Files Created
- `scripts/amazon-brand-analytics-test.js` — test BA report access
- `scripts/amazon-ba-stream-download.js` — download large BA reports via streaming
- `scripts/grok-serp-check.sh` — batch SERP verification via Grok
- `scripts/serp-batch.sh` — final production SERP batch script
- `memory/serp-rankings.jsonl` — SERP results (45 queries, one JSON per line)

## Replication Steps
1. Pull Amazon Brand Analytics search terms report (weekly, last complete week)
2. Parse top 200-500 product terms, filter out media/groceries/junk
3. Generate domain candidates: `best[product].com`, `best-[product].com`, `top[product].com`
4. Bulk check availability via GoDaddy API (batches of 5, 1.1s delay)
5. For available domains, verify Amazon SERP rank via Grok web_search (costs ~$0.05/query)
6. Prioritize: Amazon #1-3 = tier 1, #4-5 = tier 2, #6-10 = tier 3, null = skip
7. Buy tier 1 first (~15-20 domains), then tier 2 if budget allows

## Future Improvements
- Automate monthly: pull fresh BA data, check new trending products
- Add Google Search Console data from existing affiliate sites to find "almost ranking" queries
- Cross-reference with Google Trends to catch seasonal spikes (e.g., "best space heater" in winter)
- Track domain age: older domains rank faster, so prioritize building out tier 1 before buying tier 2
