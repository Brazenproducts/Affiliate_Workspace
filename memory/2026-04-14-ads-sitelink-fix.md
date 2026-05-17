# Google Ads Sitelink Fix — 2026-04-14

## Summary
Fixed disapproved sitelink assets for Bartact (customer ID 1770651698). URL handles changed on Shopify but sitelinks still pointed to old 404 URLs.

## What Was Done

### Campaign Asset Links Removed (14 total)
Detached broken sitelink assets from campaigns (non-Smart campaigns only):

| Campaign | Asset | Old URL |
|----------|-------|---------|
| Bronco Storage-Search (20908673514) | Best Sellers (23277501823) | /collections/frontpage |
| Bronco Storage-Search #2 (23473216021) | Best Sellers (23277501823) | /collections/frontpage |
| Bronco Storage (20225960377) | Bronco Paracord Handles (85395877135) | /products/bronco-paracord-grab-handles-...-2023-pair-of-2-bartact |
| Bronco Storage (20225960377) | Bronco Storage Bags (85395877138) | /products/bronco-accessories-door-bags-... |
| Bronco Storage (20225960377) | Bronco Passenger Storage (85395877141) | /products/bronco-accessories-center-console-bag-... |
| Bronco Storage (20225960377) | Bronco MOLLE Visor Covers (85395877144) | /products/bronco-accessories-visor-covers-... |
| Wrangler Seat Covers - Search (23670944772) | Featured Products (341980772700) | /collections/frontpage |
| Gladiator Seat Covers - Search (23670948615) | Featured Products (341980772700) | /collections/frontpage |
| Bronco Seat Covers - Search (23676384419) | Featured Products (341980772700) | /collections/frontpage |
| Toyota Seat Covers - Search (23681026960) | Featured Products (341980772700) | /collections/frontpage |
| Wrangler Seat Covers - Search (23670944772) | Bags And Pouches (341980772706) | /collections/bags-and-pouches |
| Gladiator Seat Covers - Search (23670948615) | Bags And Pouches (341980772706) | /collections/bags-and-pouches |
| Bronco Seat Covers - Search (23676384419) | Bags And Pouches (341980772706) | /collections/bags-and-pouches |
| Toyota Seat Covers - Search (23681026960) | Bags And Pouches (341980772706) | /collections/bags-and-pouches |

### New Sitelink Assets Created (15 total)
All with corrected URLs, currently in REVIEW_IN_PROGRESS:

| ID | Link Text | New URL |
|----|-----------|---------|
| 349625174251 | Best Sellers | /collections/all |
| 349625174254 | Featured Products | /collections/all |
| 349625174257 | Featured Products (w/ descriptions) | /collections/all |
| 349625174260 | Bags And Pouches | /collections/molle-pouches-molle-accessories-gear-bags-by-bartact |
| 349625174263 | Bags And Pouches (desc: Bronco) | /collections/molle-pouches-molle-accessories-gear-bags-by-bartact |
| 349625174266 | Bags And Pouches (desc: Wrangliator) | /collections/molle-pouches-molle-accessories-gear-bags-by-bartact |
| 349625174269 | Bronco Paracord Handles | /products/bronco-paracord-grab-handles-...-2024-2025-2026-pair-of-2-bartact |
| 349625174272 | Bronco Storage Bags | /products/bronco-accessories-door-storage-pocket-bags-...-bartact-pat-pending |
| 349625174275 | Bronco Passenger Storage | /products/bronco-accessories-center-console-storage-bag-...-bartact-pat-pending |
| 349625174278 | Jeep Gladiator | /collections/jeep-gladiator-seat-covers-accessories-2019 |
| 349625174281 | Jeep Gladiator 2019-23 | /collections/jeep-gladiator-accessories-2019 |
| 349625174284 | Jeep Gladiator 2019-23 (w/ descriptions) | /collections/jeep-gladiator-accessories-2019 |
| 349625174287 | Toyota Tacoma | /collections/toyota-tacoma-seat-covers-accessories-2005-15-2016-2019-2020-2024 |
| 349625174290 | MOLLE Buckles | /collections/molle-buckles-attachments-accessories |
| 349625174293 | Grab Handles | /collections/grab-handles |

### New Campaign Attachments Created (13 total)
| Campaign | New Asset |
|----------|-----------|
| Bronco Storage-Search | Best Sellers → /collections/all |
| Bronco Storage-Search #2 | Best Sellers → /collections/all |
| Wrangler Seat Covers - Search | Featured Products → /collections/all |
| Gladiator Seat Covers - Search | Featured Products → /collections/all |
| Bronco Seat Covers - Search | Featured Products → /collections/all |
| Toyota Seat Covers - Search | Featured Products → /collections/all |
| Wrangler Seat Covers - Search | Bags And Pouches → /collections/molle-pouches-... |
| Gladiator Seat Covers - Search | Bags And Pouches → /collections/molle-pouches-... |
| Bronco Seat Covers - Search | Bags And Pouches → /collections/molle-pouches-... |
| Toyota Seat Covers - Search | Bags And Pouches → /collections/molle-pouches-... |
| Bronco Storage | Bronco Paracord Handles → new URL |
| Bronco Storage | Bronco Storage Bags → new URL |
| Bronco Storage | Bronco Passenger Storage → new URL |

### Intentionally NOT Replaced
- **Bronco MOLLE Visor Covers** — product is in DRAFT status in Shopify, no valid destination
- **/collections/frontpage/ppe** — no replacement URL exists

### Left Unchanged
- **Asset 185142904178** (Toyota Tacoma → correct URL already): STALE disapproval, no campaign links. Will auto-clear.

## Known Limitations

### 2 Immutable Campaign Links (Smart Campaigns)
These campaigns are `SMART` type and reject all `campaignAssets:mutate` operations:

1. **Bartact Jeep Wrangler Gladiator** (1944917029) — still has old "Best Sellers" → /collections/frontpage (PAUSED)
2. **Truck & SUV Accessories Store** (16147115195) — still has old "Grab Handles" → /collections/grab-handles (PAUSED, STALE_DISAPPROVAL)

Both campaigns are PAUSED so the broken sitelinks won't serve. To fix these, Mitch would need to:
- Go to Google Ads UI → these Smart campaigns → manually edit the sitelink assets
- OR convert them from Smart to regular campaigns first

### Old Assets Can't Be Deleted
Google Ads API does not support deleting asset resources. The 25 old broken assets still exist in the account but have been detached from all non-Smart campaigns. They're effectively orphaned and won't serve.

## Next Steps
- Monitor new assets for approval (currently REVIEW_IN_PROGRESS)
- Consider removing the 2 PAUSED Smart campaigns entirely if they're no longer needed
- The Toyota Tacoma URL (185142904178) STALE disapproval may need manual investigation if it doesn't clear — Google flagged it as DESTINATION_NOT_WORKING on Android even though URL is correct
