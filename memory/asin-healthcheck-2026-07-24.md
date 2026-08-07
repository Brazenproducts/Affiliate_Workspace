# ASIN Health Check Report — 2026-07-24

**Run Time:** 2026-07-24 18:09–18:23 UTC  
**Method:** Browser automation via Chrome CDP (no PA-API)  
**Batch:** ASINs 201–400 of 548 total  
**Progress:** 200/2400 checked = **8.3%** of full catalog

---

## Summary

| Metric | Count | % |
|--------|------:|--:|
| Total ASINs Checked | 200 | 100% |
| ✅ Live / Available | 193 | 96.5% |
| ❌ Dead / Unavailable | 7 | 3.5% |
| ⚠️ Errors / Timeouts | 0 | 0% |
| 🤖 CAPTCHA Blocks | 0 | 0% |

**Dead Rate: 3.5%** (7 of 200)

---

## ❌ Dead ASINs (7)

All 7 dead ASINs show "Currently unavailable" on their product page (the listing exists but inventory is depleted or the item is delisted from sale).

| # | ASIN | Name | Reason | Amazon Title |
|---|------|------|--------|--------------|
| 1 | [B0BWHZJHPL](https://www.amazon.com/dp/B0BWHZJHPL) | Euhomy Countertop Ice Maker | Currently unavailable | EUHOMY Countertop Ice Maker Machine with Handle, 26lbs in 24Hrs, 9 Ice Cubes Ready in 6 Mins... |
| 2 | [B08K3BDHR6](https://www.amazon.com/dp/B08K3BDHR6) | MERV 13 office building filters | Currently unavailable | Merv 13 Filter Material for Air Filters (16Ft²), Air Particles, Clean Living Basic Dust... |
| 3 | [B01HG3ZQNO](https://www.amazon.com/dp/B01HG3ZQNO) | Makita BO5041 | Currently unavailable | Makita BO5041-R 120V 3 Amp Variable Speed 5 in. Corded Random Orbit Sander (Renewed) |
| 4 | [B0015IVOQ0](https://www.amazon.com/dp/B0015IVOQ0) | Ridgid R2611 | Currently unavailable | RIDGID ZRR2611 Professional 6-inch Random Orbit Variable Speed Sander (Renewed) |
| 5 | [B0FB8SSWY4](https://www.amazon.com/dp/B0FB8SSWY4) | Honeywell MO08CESWK Portable AC | Currently unavailable | 8,000 BTU Portable Air Conditioner – 3-in-1 AC Unit with Cooling, Dehumidifier & Fan... |
| 6 | [B07NF3V21T](https://www.amazon.com/dp/B07NF3V21T) | Husqvarna Z254F Zero Turn Mower | Currently unavailable | Husqvarna Z254F 54 in. 23 HP Kawasaki Zero Hydrostatic Turn Riding Mower |
| 7 | [B0BVSTNBBM](https://www.amazon.com/dp/B0BVSTNBBM) | Ariens IKON XD Zero Turn Mower | Currently unavailable | Ariens IKON (42") 21.5HP Kawasaki Zero Turn Mower 918002 |

---

## Dead ASIN Details

### 1. B0BWHZJHPL — Euhomy Countertop Ice Maker
- **Category:** Kitchen Appliances / Ice Makers
- **Status:** Currently unavailable
- **Note:** Page exists with full title and description, but item cannot be purchased

### 2. B08K3BDHR6 — MERV 13 office building filters
- **Category:** HVAC / Air Filters
- **Status:** Currently unavailable
- **Note:** DIY filter material listing; may be seasonal or discontinued

### 3. B01HG3ZQNO — Makita BO5041
- **Category:** Power Tools / Sanders
- **Status:** Currently unavailable
- **Note:** Renewed/refurbished listing — these go in and out of stock frequently

### 4. B0015IVOQ0 — Ridgid R2611
- **Category:** Power Tools / Sanders
- **Status:** Currently unavailable
- **Note:** Renewed/refurbished listing — RIDGID ZRR2611 model

### 5. B0FB8SSWY4 — Honeywell MO08CESWK Portable AC
- **Category:** Home Appliances / Portable Air Conditioners
- **Status:** Currently unavailable
- **Note:** Seasonal item; likely end-of-season inventory depletion

### 6. B07NF3V21T — Husqvarna Z254F Zero Turn Mower
- **Category:** Lawn & Garden / Riding Mowers
- **Status:** Currently unavailable
- **Note:** Large outdoor power equipment; seasonal and limited Amazon inventory

### 7. B0BVSTNBBM — Ariens IKON XD Zero Turn Mower
- **Category:** Lawn & Garden / Riding Mowers
- **Status:** Currently unavailable
- **Note:** Large outdoor power equipment; listing exists but no active inventory

---

## Observations & Patterns

### Dead ASIN Categories
- **Power Tools (Renewed):** 2 ASINs (B01HG3ZQNO, B0015IVOQ0) — Renewed/refurbished listings are inherently volatile
- **Zero-Turn Mowers:** 2 ASINs (B07NF3V21T, B0BVSTNBBM) — Seasonal; large equipment low on Amazon's direct fulfillment
- **Portable AC:** 1 ASIN (B0FB8SSWY4) — Seasonal depletion (post-summer)
- **Ice Maker:** 1 ASIN (B0BWHZJHPL) — Countertop appliance
- **HVAC Filter Material:** 1 ASIN (B08K3BDHR6) — DIY/niche product

### Key Findings
1. **No hard 404s** — All dead ASINs still have active listings; they're "unavailable" not deleted
2. **Renewed/used items** (2 of 7) are high-churn by nature — consider excluding from monitoring or treating separately
3. **Seasonal pattern** — Portable AC and zero-turn mowers going unavailable in late July aligns with seasonal inventory wind-down
4. **Overall health: 96.5% live** — Strong catalog health for this batch

### Recommendations
- Flag B01HG3ZQNO and B0015IVOQ0 as "Renewed" listings — lower priority for replacement
- B07NF3V21T and B0BVSTNBBM likely need alternative ASINs for next mowing season
- B0FB8SSWY4 (Honeywell Portable AC) may recover next spring — monitor in Q1
- B0BWHZJHPL and B08K3BDHR6 should be replaced with active alternative ASINs

---

## Full Batch Coverage

This batch covered a wide range of categories:
- Firewood & fire starters
- HVAC/air filters (multiple brands: Filtrete, Aerostar, Nordic Pure, Honeywell, Aprilaire)
- Water filters (pitcher, whole-house, refrigerator, under-sink)
- Ice makers
- Power tools (sanders, saws, drills)
- LED light bars
- Portable air conditioners
- Pasta makers
- Stand mixers
- Sous vide cookers
- Tire inflators
- Truck accessories (floor mats, seat covers, toppers)
- Zero-turn mowers
- Wiper blades
- Air purifiers
- Recovery gear
- Ford Bronco parts

---

*Generated by ASIN Health Check Subagent | 2026-07-24 | Batch 201-400 of 548*
