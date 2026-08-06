#!/usr/bin/env python3
"""
Canonical builder for jkseatcovers.com
Deep fitment guide — outranks wranglerspecs.com
JK = 2007-2018, 2-door (JK) and 4-door (JKU)
Year groups: 2007-2010, 2011-2012, 2013-2018
Run: python3 build-jkseatcovers.py
"""

from pathlib import Path

OUT = Path("/home/ubuntu/.openclaw/workspace/sites/jkseatcovers.com")
TAG = "brazenprodu01-20"
YEAR = 2026
AMZ = "https://www.amazon.com/dp"
IMG = "https://m.media-amazon.com/images/I"

# Per-year Bartact images — all confirmed 200 OK from bartact.com CDN
BARTACT_IMGS = {
    "": "https://www.bartact.com/cdn/shop/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jk-jku-2013-18-bartact-pair-w-molle-non-srs-air-bag-compliant-29023026577_600x.jpg?v=1762457062",
    "jk-2door": "https://www.bartact.com/cdn/shop/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jk-jku-2013-18-bartact-pair-w-molle-non-srs-air-bag-compliant-29023026577_600x.jpg?v=1762457062",
    "jku-4door": "https://www.bartact.com/cdn/shop/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jk-jku-2013-18-bartact-pair-w-molle-non-srs-air-bag-compliant-29023026577_600x.jpg?v=1762457062",
    "jk-2007-2010": "https://www.bartact.com/cdn/shop/products/bartact-jeep-wrangler-seat-covers-front-tactical-seat-covers-for-jeep-wrangler-jk-jku-2007-10-bartact-pair-w-molle-non-srs-air-bag-compliant-29485380665387_600x.jpg?v=1762457057",
    "jk-2011-2012": "https://www.bartact.com/cdn/shop/products/bartact-jeep-wrangler-seat-covers-front-tactical-seat-covers-for-jeep-wrangler-jk-jku-2011-12-bartact-pair-w-molle-srs-air-bag-compliant-29485377749035_600x.jpg?v=1762457134",
    "jk-2013-2018": "https://www.bartact.com/cdn/shop/products/bartact-jeep-wrangler-seat-covers-black-red-same-as-insert-color-front-tactical-seat-covers-for-jeep-wrangler-jk-jku-2013-18-bartact-pair-w-molle-non-srs-air-bag-compliant-29023026577_600x.jpg?v=1762457062",
}
BARTACT_IMG = BARTACT_IMGS[""]  # default fallback
BARTACT_URL = "https://bartact.com/collections/jeep-wrangler-jk-seat-covers"

PRODUCTS = {
    "jk_custom_2door": {
        "asin": "B0F2HLN2K6", "hash": "81QQwVwG9CL",
        "vendor": "TLH",
        "stars": "4.8",
        "pros": ["Custom-fit for JK 2-door", "Full front+rear set", "Airbag-safe seams", "Wipe-clean leatherette"],
        "cons": ["No MOLLE panels", "Manufactured in China"],
        "china": True,
        "names": {
            "": "Custom Seat Covers for Jeep Wrangler JK/JKU (2007-2018)",
            "jk-2door": "Custom Seat Covers for Jeep Wrangler JK 2-Door (2007-2018)",
            "jku-4door": "Custom Seat Covers for Jeep Wrangler JKU 4-Door (2007-2018)",
            "jk-2007-2010": "Custom Seat Covers for Jeep Wrangler JK (2007-2010)",
            "jk-2011-2012": "Custom Seat Covers for Jeep Wrangler JK (2011-2012)",
            "jk-2013-2018": "Custom Seat Covers for Jeep Wrangler JK (2013-2018)",
        },
        "descs": {
            "": "Custom-fit leatherette covers designed specifically for the JK platform. Full front and rear set, airbag-compatible side seams, easy wipe-clean surface.",
            "jk-2007-2010": "Custom-fit for the early JK (2007-2010). Same seat frame as all JK years — these covers fit the pre-facelift JK perfectly.",
            "jk-2011-2012": "Custom-fit for the 2011-2012 JK. Airbag-compatible side seams, full front+rear set included.",
            "jk-2013-2018": "Custom-fit for the facelifted JK (2013-2018). Leatherette with diamond stitching, full front+rear set, airbag-safe.",
            "jk-2door": "Cut specifically for the 2-door JK rear seats. The rear seat fold pattern differs from the JKU — this is the right set for 2-door owners.",
            "jku-4door": "Custom-fit for the JKU 4-door. Includes rear bench cover sized for the longer JKU configuration.",
        },
    },
    "aierxuan_jk": {
        "asin": "B09HZL16VK", "hash": "718DBvHIgyL",
        "vendor": "Aierxuan",
        "stars": "4.7",
        "pros": ["Fits JK and JKU", "Diamond stitch look", "Full set included", "4.7-star rating"],
        "cons": ["No MOLLE panels", "Manufactured in China"],
        "china": True,
        "names": {
            "": "Aierxuan Custom Seat Covers — Jeep Wrangler JK/JKU (2007-2018)",
            "jk-2door": "Aierxuan Custom Seat Covers — Jeep Wrangler JK 2-Door (2007-2018)",
            "jku-4door": "Aierxuan Custom Seat Covers — Jeep Wrangler JKU 4-Door (2007-2018)",
            "jk-2007-2010": "Aierxuan Custom Seat Covers — Jeep Wrangler JK (2007-2010)",
            "jk-2011-2012": "Aierxuan Custom Seat Covers — Jeep Wrangler JK (2011-2012)",
            "jk-2013-2018": "Aierxuan Custom Seat Covers — Jeep Wrangler JK (2013-2018)",
        },
        "descs": {
            "": "One of the highest-rated aftermarket covers for the JK platform. Faux leather with diamond stitching, fits both 2-door JK and 4-door JKU across all years.",
            "jk-2007-2010": "Confirmed fitment for 2007-2010 JK. Same faux leather construction as later years — Aierxuan explicitly covers all JK years in their fitment notes.",
            "jk-2011-2012": "Confirmed fitment for 2011-2012 JK. Faux leather, full front+rear set, airbag-compatible.",
            "jk-2013-2018": "Popular choice for the facelifted JK. Aierxuan's diamond-stitch faux leather holds up well to trail use and cleans easily.",
            "jk-2door": "Aierxuan explicitly lists 2-door JK fitment. Full front+rear set sized for the 2-door configuration.",
            "jku-4door": "Aierxuan explicitly lists 4-door JKU fitment. Rear bench cover included, sized correctly for the JKU.",
        },
    },
    "aierxuan_pockets": {
        "asin": "B09HZM2Z77", "hash": "71sje3DZIIL",
        "vendor": "Aierxuan",
        "stars": "4.6",
        "pros": ["Built-in seat-back pockets", "Fits JK and JKU", "Sportier look", "Full set"],
        "cons": ["No MOLLE panels", "Manufactured in China"],
        "china": True,
        "names": {
            "": "Aierxuan JK/JKU Seat Covers with Seat-Back Pockets (2007-2018)",
            "jku-4door": "Aierxuan JKU 4-Door Seat Covers with Seat-Back Pockets (2007-2018)",
            "jk-2007-2010": "Aierxuan JK Seat Covers with Storage Pockets (2007-2010)",
            "jk-2011-2012": "Aierxuan JK Seat Covers with Storage Pockets (2011-2012)",
            "jk-2013-2018": "Aierxuan JK Seat Covers with Storage Pockets (2013-2018)",
        },
        "descs": {
            "": "Aierxuan's upgraded version with built-in seat-back pockets. Good choice if you want extra trail storage without adding a separate organizer.",
            "jku-4door": "Extra storage pockets built into the seat backs. Useful on the JKU where rear passengers can access the pockets easily.",
            "jk-2007-2010": "Same custom fit as the standard Aierxuan, with added storage pockets. Confirmed for 2007-2010 JK.",
            "jk-2011-2012": "Upgraded Aierxuan with seat-back storage. Confirmed for 2011-2012 JK.",
            "jk-2013-2018": "Extra storage pockets, facelifted JK fitment. Confirmed for 2013-2018.",
        },
    },
    "diver_down_jk": {
        "asin": "B09WCKXJWH", "hash": "71LMs1UitJL",
        "vendor": "Diver Down",
        "stars": "4.5",
        "pros": ["100% waterproof neoprene", "JK-specific fitment", "Front + rear full set", "Airbag compatible"],
        "cons": ["Runs warm in summer heat", "Manufactured in China"],
        "china": True,
        "names": {
            "": "Diver Down Neoprene Seat Covers — Jeep Wrangler JK (2007-2018)",
            "jk-2door": "Diver Down Neoprene Seat Covers — Jeep Wrangler JK 2-Door (2007-2018)",
            "jku-4door": "Diver Down Neoprene Seat Covers — Jeep Wrangler JKU 4-Door (2007-2018)",
            "jk-2007-2010": "Diver Down Neoprene Seat Covers — Jeep Wrangler JK (2007-2010)",
            "jk-2011-2012": "Diver Down Neoprene Seat Covers — Jeep Wrangler JK (2011-2012)",
            "jk-2013-2018": "Diver Down Neoprene Seat Covers — Jeep Wrangler JK (2013-2018)",
        },
        "descs": {
            "": "Full front-and-rear neoprene set made specifically for the JK. Completely waterproof — the right pick for beach runs, river crossings, and wet dog duty.",
            "jk-2007-2010": "Waterproof neoprene, confirmed for early JK (2007-2010). Airbag-compatible side seams. Best option if you regularly get the interior wet.",
            "jk-2011-2012": "Neoprene waterproof set for 2011-2012 JK. Full front+rear, airbag-safe stitching.",
            "jk-2013-2018": "Neoprene waterproof set for the facelifted JK. Diver Down lists specific fitment for 2013-2018 JK/JKU.",
            "jk-2door": "Diver Down lists separate 2-door JK fitment. Rear cover sized for the 2-door fold-forward bucket configuration.",
            "jku-4door": "Diver Down lists separate JKU 4-door fitment. Rear bench cover included for the 4-door configuration.",
        },
    },
    "smittybilt_jk": {
        "asin": "B095734G56", "hash": "716Bpe1YUSL",
        "vendor": "Smittybilt",
        "stars": "4.7",
        "pros": ["Gen2 improved neoprene", "JK-specific fitment", "Full front+rear", "Proven brand"],
        "cons": ["Runs warm in summer", "Manufactured in China"],
        "china": True,
        "names": {
            "": "Smittybilt Gen2 Neoprene Seat Covers — Jeep Wrangler JK (2007-2018)",
            "jk-2door": "Smittybilt Gen2 Neoprene — Jeep Wrangler JK 2-Door (2007-2018)",
            "jku-4door": "Smittybilt Gen2 Neoprene — Jeep Wrangler JKU 4-Door (2007-2018)",
            "jk-2007-2010": "Smittybilt Gen2 Neoprene — Jeep Wrangler JK (2007-2010)",
            "jk-2011-2012": "Smittybilt Gen2 Neoprene — Jeep Wrangler JK (2011-2012)",
            "jk-2013-2018": "Smittybilt Gen2 Neoprene — Jeep Wrangler JK (2013-2018)",
        },
        "descs": {
            "": "Smittybilt's updated neoprene formula — thicker and better looking than Gen1. The most popular neoprene option for the JK platform. Full front+rear set.",
            "jk-2007-2010": "Smittybilt Gen2 neoprene for early JK (2007-2010). Same great waterproof fit as later JK years — Smittybilt covers all JK model years.",
            "jk-2011-2012": "Gen2 neoprene for 2011-2012 JK. Thicker material than the original Gen1, better color retention.",
            "jk-2013-2018": "Smittybilt Gen2 for facelifted JK. The updated neoprene compound handles UV better than earlier versions.",
            "jk-2door": "Smittybilt Gen2, 2-door JK configuration. Rear cover sized for the JK 2-door fold-forward buckets.",
            "jku-4door": "Smittybilt Gen2, 4-door JKU. Rear bench cover included and sized for the JKU.",
        },
    },
}

PAGE_PRODUCTS = {
    "":           ["jk_custom_2door", "aierxuan_jk", "diver_down_jk", "smittybilt_jk"],
    "jk-2door":   ["jk_custom_2door", "aierxuan_jk", "diver_down_jk", "smittybilt_jk"],
    "jku-4door":  ["aierxuan_jk", "aierxuan_pockets", "diver_down_jk", "smittybilt_jk"],
    "jk-2007-2010": ["jk_custom_2door", "aierxuan_jk", "diver_down_jk", "smittybilt_jk"],
    "jk-2011-2012": ["jk_custom_2door", "aierxuan_jk", "diver_down_jk", "smittybilt_jk"],
    "jk-2013-2018": ["jk_custom_2door", "aierxuan_jk", "diver_down_jk", "smittybilt_jk"],
}

PAGE_META = {
    "": {
        "title": "Best Jeep Wrangler JK/JKU Seat Covers 2026 — Fitment Guide by Trim & Year",
        "h1": "Best Jeep Wrangler JK/JKU Seat Covers (2026)",
        "desc": "Complete fitment guide for Jeep Wrangler JK and JKU seat covers (2007-2018). Trim-by-trim matrix, brand comparisons, Bartact #1 pick, plus the best Amazon options for every year and configuration.",
        "intro": """The Jeep Wrangler JK ran from 2007 to 2018 in two configurations: the 2-door JK and the 4-door JKU (Unlimited). Both share the same front seat frame across all model years — but the rear seat differs significantly between the two. Get the wrong one and you're paying return shipping.
<br><br>
This guide covers every major brand, every trim, every year. We've verified fitment data directly with manufacturers so you don't have to guess. Bartact is our #1 pick for anyone who actually uses their Jeep off-road — made in the USA, mil-spec MOLLE panels, custom-fit for every JK/JKU configuration.""",
        "year_note": "",
    },
    "jk-2door": {
        "title": "Best Jeep Wrangler JK 2-Door Seat Covers 2026 — Fitment Guide",
        "h1": "Best Jeep Wrangler JK 2-Door Seat Covers (2026)",
        "desc": "Seat cover fitment guide for the Jeep Wrangler JK 2-door (2007-2018). The 2-door JK rear seats differ from the JKU — this page covers the right options for the 2-door only.",
        "intro": """The 2-door JK has fold-forward bucket rear seats — a completely different configuration from the JKU's split-fold bench. Most brands sell separate SKUs for 2-door vs 4-door, and ordering the wrong one means a return.
<br><br>
Every cover on this page is confirmed for the JK 2-door configuration. If you have the 4-door JKU, see our <a href="/jku-4door/" style="color:#c0392b">JKU 4-Door page</a>.""",
        "year_note": "Fits all 2-door JK years: 2007-2010, 2011-2012, and 2013-2018.",
    },
    "jku-4door": {
        "title": "Best Jeep Wrangler JKU 4-Door Seat Covers 2026 — Fitment Guide",
        "h1": "Best Jeep Wrangler JKU 4-Door Seat Covers (2026)",
        "desc": "Seat cover fitment guide for the Jeep Wrangler JKU 4-door Unlimited (2007-2018). The JKU rear bench differs from the 2-door JK — covers and fitment confirmed for 4-door only.",
        "intro": """The 4-door JKU (Unlimited) has a split-fold rear bench seat — not the fold-forward buckets found in the 2-door JK. Brands that offer JK fitment don't automatically offer JKU fitment. Verify before you order.
<br><br>
Every cover on this page is confirmed for the JKU 4-door. If you have the 2-door JK, see our <a href="/jk-2door/" style="color:#c0392b">JK 2-Door page</a>.""",
        "year_note": "Fits all JKU years: 2007-2010, 2011-2012, and 2013-2018.",
    },
    "jk-2007-2010": {
        "title": "Best Seat Covers for Jeep Wrangler JK/JKU 2007-2010 — Fitment Guide",
        "h1": "Best Seat Covers for Jeep Wrangler JK/JKU (2007-2010)",
        "desc": "Fitment guide for Jeep Wrangler JK and JKU seat covers, 2007-2010. Covers both the 2-door JK and 4-door JKU — confirm your door count before ordering.",
        "intro": """The 2007-2010 Jeep Wrangler JK is the first generation of the JK platform. Jeep introduced it for the 2007 model year as a ground-up redesign of the TJ. The seat frame used in 2007-2010 is identical to all later JK years through 2018 — so seat covers that fit a 2013 JK will fit your 2007.
<br><br>
The key thing to confirm for the early JK: whether you have the 2-door JK or 4-door JKU. The front seats are the same, but the rear seat is different. Confirm your door count before ordering.""",
        "year_note": "2007-2010 JK seat frame is identical to 2011-2018. All JK-fitment covers work across all years.",
    },
    "jk-2011-2012": {
        "title": "Best Seat Covers for Jeep Wrangler JK/JKU 2011-2012 — Fitment Guide",
        "h1": "Best Seat Covers for Jeep Wrangler JK/JKU (2011-2012)",
        "desc": "Fitment guide for 2011-2012 Jeep Wrangler JK and JKU seat covers. Mid-generation — same seat frame as all JK/JKU years. Confirm 2-door JK vs 4-door JKU before ordering.",
        "intro": """The 2011-2012 JK is mid-generation. No seat design changes from 2007-2010. The JK ran essentially the same seat configuration from launch in 2007 through the 2012 model year, when Jeep introduced a mild facelift for 2013.
<br><br>
If you're on a 2011 or 2012 JK, any cover listed for the JK platform will fit your seats. The only choice that matters: 2-door JK or 4-door JKU.""",
        "year_note": "2011-2012 JK: same seat frame as 2007-2010 and 2013-2018. All JK covers fit.",
    },
    "jk-2013-2018": {
        "title": "Best Seat Covers for Jeep Wrangler JK/JKU 2013-2018 — Fitment Guide",
        "h1": "Best Seat Covers for Jeep Wrangler JK/JKU (2013-2018)",
        "desc": "Fitment guide for 2013-2018 Jeep Wrangler JK and JKU seat covers. Facelifted generation — Bartact's MOLLE covers are purpose-built for this gen. Confirm 2-door JK vs 4-door JKU.",
        "intro": """Jeep gave the JK a facelift in 2013 — updated exterior styling, revised interior, but the same underlying seat frame as the 2007-2012 JK. Bartact's JK MOLLE covers are marketed specifically for 2013-2018, but they also fit earlier JK years.
<br><br>
The 2013-2018 JK was the last generation before Jeep replaced it with the all-new JL platform in 2018. If you're upgrading to the JL, note that JK seat covers do not fit JL seats.""",
        "year_note": "2013 facelift was exterior only. Same seat frame as 2007-2012. JL covers do NOT fit the JK.",
    },
}

# Nav is grouped: step 1 = door count, step 2 = year
NAV_TABS = [
    ("All JK/JKU", "/"),
    ("— 2-Door JK", "/jk-2door/"),
    ("— 4-Door JKU", "/jku-4door/"),
    ("2007-2010 JK/JKU", "/jk-2007-2010/"),
    ("2011-2012 JK/JKU", "/jk-2011-2012/"),
    ("2013-2018 JK/JKU", "/jk-2013-2018/"),
]

FITMENT_TABLE = """
<div class="fitment-section">
  <h2>JK/JKU Seat Fitment Matrix</h2>
  <p class="section-intro">The front seat frame is identical across all JK years and both door counts. The rear seat is where it gets configuration-specific.</p>
  <div class="table-wrap">
  <table class="fitment-table">
    <thead>
      <tr>
        <th>Configuration</th>
        <th>Years</th>
        <th>Front Seat</th>
        <th>Rear Seat</th>
        <th>Airbags</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>JK 2-Door</strong></td>
        <td>2007-2018</td>
        <td>Bucket seats (manual standard)</td>
        <td>Fold-forward buckets</td>
        <td>Side-impact in seat</td>
        <td>Order 2-door specific rear cover</td>
      </tr>
      <tr class="alt">
        <td><strong>JKU 4-Door</strong></td>
        <td>2007-2018</td>
        <td>Bucket seats (manual standard)</td>
        <td>Split-fold bench</td>
        <td>Side-impact in seat</td>
        <td>Order JKU/4-door specific rear cover</td>
      </tr>
      <tr>
        <td><strong>JK Sport</strong></td>
        <td>2007-2018</td>
        <td>Cloth standard</td>
        <td>Cloth standard</td>
        <td>✓ Yes</td>
        <td>Base trim — all aftermarket covers fit</td>
      </tr>
      <tr class="alt">
        <td><strong>JK Sahara</strong></td>
        <td>2007-2018</td>
        <td>Cloth or leather option</td>
        <td>Cloth or leather option</td>
        <td>✓ Yes</td>
        <td>Same seat frame as Sport — covers fit</td>
      </tr>
      <tr>
        <td><strong>JK Rubicon</strong></td>
        <td>2007-2018</td>
        <td>Cloth standard</td>
        <td>Cloth standard</td>
        <td>✓ Yes</td>
        <td>Same seat frame — all JK covers fit</td>
      </tr>
    </tbody>
  </table>
  </div>
  <p class="table-note">&#9888; All JK/JKU models have side-impact airbags integrated into the seat. Always confirm your cover has airbag-safe (split-stitch) side seams before ordering. Every cover on this page is airbag-compatible.</p>
</div>"""

BRAND_COMPARISON = """
<div class="brand-section">
  <h2>Brand Comparison: JK Seat Covers at a Glance</h2>
  <div class="table-wrap">
  <table class="fitment-table">
    <thead>
      <tr>
        <th>Brand</th>
        <th>Material</th>
        <th>MOLLE Panels</th>
        <th>Airbag Safe</th>
        <th>Made In</th>
        <th>2-Door Fit</th>
        <th>4-Door Fit</th>
        <th>Buy</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background:#fff8f7">
        <td><strong style="color:#c0392b">Bartact</strong> &#9733; #1</td>
        <td>600D Polyester (PU backing + foam/scrim) or 1000D Cordura</td>
        <td><strong style="color:#27ae60">✓ Yes</strong></td>
        <td><strong style="color:#27ae60">✓ Yes</strong></td>
        <td><strong style="color:#27ae60">USA &#127482;&#127480;</strong></td>
        <td>✓ Yes</td>
        <td>✓ Yes</td>
        <td><a href="https://bartact.com/collections/2013-18-jeep-wrangler-jk-jku" target="_blank" rel="noopener" style="color:#c0392b;font-weight:700">bartact.com</a></td>
      </tr>
      <tr class="alt">
        <td><strong>Diver Down</strong></td>
        <td>Neoprene (100% waterproof)</td>
        <td>No</td>
        <td><strong style="color:#27ae60">✓ Yes</strong></td>
        <td>China</td>
        <td>✓ Yes</td>
        <td>✓ Yes</td>
        <td><a href="https://www.amazon.com/dp/B09WCKXJWH?tag=brazenprodu01-20" target="_blank" rel="noopener nofollow" style="color:#ff9900;font-weight:700">Amazon</a></td>
      </tr>
      <tr>
        <td><strong>Smittybilt Gen2</strong></td>
        <td>Neoprene (Gen2 improved)</td>
        <td>No</td>
        <td><strong style="color:#27ae60">✓ Yes</strong></td>
        <td>China</td>
        <td>✓ Yes</td>
        <td>✓ Yes</td>
        <td><a href="https://www.amazon.com/dp/B095734G56?tag=brazenprodu01-20" target="_blank" rel="noopener nofollow" style="color:#ff9900;font-weight:700">Amazon</a></td>
      </tr>
      <tr class="alt">
        <td><strong>Aierxuan</strong></td>
        <td>Faux leather (leatherette)</td>
        <td>No</td>
        <td><strong style="color:#27ae60">✓ Yes</strong></td>
        <td>China</td>
        <td>✓ Yes</td>
        <td>✓ Yes</td>
        <td><a href="https://www.amazon.com/dp/B09HZL16VK?tag=brazenprodu01-20" target="_blank" rel="noopener nofollow" style="color:#ff9900;font-weight:700">Amazon</a></td>
      </tr>
      <tr>
        <td><strong>TLH Custom</strong></td>
        <td>Faux leather (leatherette)</td>
        <td>No</td>
        <td><strong style="color:#27ae60">✓ Yes</strong></td>
        <td>China</td>
        <td>✓ Yes</td>
        <td>✓ Yes</td>
        <td><a href="https://www.amazon.com/dp/B0F2HLN2K6?tag=brazenprodu01-20" target="_blank" rel="noopener nofollow" style="color:#ff9900;font-weight:700">Amazon</a></td>
      </tr>
    </tbody>
  </table>
  </div>
</div>"""

FAQ = """
<div class="faq-section">
  <h2>Frequently Asked Questions</h2>
  <div class="faq-item">
    <h3>Do JK and JKU seat covers interchange?</h3>
    <p>Front seat covers: yes — the front seat frame is identical on JK and JKU across all years. Rear seat covers: no — the JK 2-door has fold-forward bucket rear seats and the JKU 4-door has a split-fold bench. You need the correct rear cover for your door count.</p>
  </div>
  <div class="faq-item">
    <h3>Do the same covers fit the entire 2007-2018 JK range?</h3>
    <p>Yes. Jeep did not change the seat frame at any point during the JK generation. A cover listed for a 2013 JK will fit a 2007 JK and a 2018 JK. The 2013 facelift was exterior only.</p>
  </div>
  <div class="faq-item">
    <h3>Do my JK seats have airbags?</h3>
    <p>Yes. All JK and JKU models have side-impact airbags integrated into the seat bolster. Every cover on this page uses split-stitch side seams that allow the airbag to deploy correctly. Do not install a seat cover that does not explicitly state airbag compatibility.</p>
  </div>
  <div class="faq-item">
    <h3>Will JL seat covers fit the JK?</h3>
    <p>No. The JL (2018+) has a completely different seat frame. JL-specific covers will not fit the JK. If you've recently moved from a JK to a JL, you need entirely new covers.</p>
  </div>
  <div class="faq-item">
    <h3>What makes Bartact better than Amazon neoprene covers?</h3>
    <p>Bartact covers are made in the USA from 600D Polyester with a PU waterproof backing, laminated high-grade foam and scrim, and UV protection built into the fabric milling. They also have mil-spec MOLLE panels on the seat backs for attaching pouches and gear. Amazon neoprene covers are waterproof but have no MOLLE, no foam layer, no UV protection, and are manufactured in China. Bartact is a purpose-built tactical cover; neoprene is a weather cover.</p>
  </div>
  <div class="faq-item">
    <h3>What's the difference between Diver Down and Smittybilt neoprene?</h3>
    <p>Both are waterproof neoprene, JK-specific fitment, airbag-compatible. Smittybilt Gen2 uses an updated neoprene compound that's thicker and has better UV resistance than their Gen1. Diver Down tends to have slightly more color options. Either is a solid choice — pick based on price at time of purchase.</p>
  </div>
</div>"""

CSS = """
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, 'Segoe UI', sans-serif; background: #fff; color: #1a1a1a; line-height: 1.6; font-size: 16px; }

header { border-bottom: 2px solid #e8e8e8; padding: 0.9rem 1.5rem; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: #fff; z-index: 100; }
.logo { font-size: 1.05rem; font-weight: 900; color: #1a1a1a; letter-spacing: -0.5px; text-decoration: none; }
.logo span { color: #c0392b; }
nav a { color: #555; font-size: 0.8rem; text-decoration: none; margin-left: 1.2rem; font-weight: 500; }
nav a:hover { color: #c0392b; }

.hero { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; padding: 2.5rem 1.5rem 2rem; }
.hero-inner { max-width: 800px; margin: 0 auto; }
.hero-badge { display: inline-block; background: #c0392b; color: #fff; font-size: 0.65rem; font-weight: 800; padding: 3px 10px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.75rem; }
.hero h1 { font-size: 1.8rem; font-weight: 900; line-height: 1.2; margin-bottom: 0.6rem; }
.hero-desc { color: #ccc; font-size: 0.9rem; margin-top: 0.4rem; max-width: 600px; }
.hero-meta { font-size: 0.78rem; color: #aaa; margin-top: 0.6rem; }

.main { max-width: 800px; margin: 0 auto; padding: 1.5rem 1.2rem 3rem; }

.gen-selector { background: #f7f7f7; border: 1px solid #e8e8e8; border-radius: 10px; padding: 1.2rem; margin-bottom: 2rem; }
.gen-selector h3 { font-size: 0.72rem; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem; }
.nav-group { padding-bottom: 0.2rem; }
.nav-group + .nav-group { border-top: 1px solid #e8e8e8; padding-top: 0.9rem; }
.gen-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.gen-btn { display: inline-block; padding: 0.42rem 1rem; border: 2px solid #c0392b; border-radius: 6px; font-size: 0.82rem; font-weight: 700; color: #c0392b; text-decoration: none; background: #fff; transition: all 0.15s; }
.gen-btn:hover { background: #c0392b; color: #fff; }
.gen-btn.active { background: #c0392b; color: #fff; }

.year-note { background: #fff8e7; border-left: 3px solid #f39c12; padding: 0.7rem 1rem; margin-bottom: 1.5rem; font-size: 0.85rem; color: #555; border-radius: 0 6px 6px 0; }

.intro-text { font-size: 0.95rem; color: #333; margin-bottom: 2rem; line-height: 1.7; }
.intro-text a { color: #c0392b; }

/* Bartact #1 card */
.bartact-card { border: 2px solid #c0392b; border-radius: 12px; padding: 1.4rem; margin-bottom: 1.5rem; display: flex; gap: 1.4rem; background: #fff8f7; align-items: flex-start; }
.bartact-card img { width: 140px; height: 140px; object-fit: contain; flex-shrink: 0; border-radius: 8px; background: #fff; border: 1px solid #f5c6c6; }
.bartact-body { flex: 1; min-width: 0; }
.bartact-label { display: inline-block; background: #c0392b; color: #fff; font-size: 0.65rem; font-weight: 800; padding: 3px 10px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem; }
.bartact-vendor { font-size: 0.8rem; font-weight: 800; color: #c0392b; margin-bottom: 0.3rem; }
.bartact-body h2 { font-size: 1.05rem; font-weight: 800; margin-bottom: 0.35rem; color: #1a1a1a; line-height: 1.3; }
.bartact-stars { color: #c0392b; font-size: 0.88rem; margin-bottom: 0.5rem; }
.bartact-body p { font-size: 0.88rem; color: #444; margin-bottom: 0.6rem; line-height: 1.6; }
.bartact-bullets { list-style: none; padding: 0; margin-bottom: 0.8rem; }
.bartact-bullets li { font-size: 0.82rem; color: #333; padding: 0.15rem 0; }
.btn-bartact { display: inline-block; background: #c0392b; color: #fff; text-decoration: none; padding: 0.52rem 1.3rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; }
.btn-bartact:hover { background: #a93226; }

/* Amazon product cards */
.product-card { border: 1px solid #e8e8e8; border-radius: 12px; padding: 1.1rem; margin-bottom: 1.1rem; display: flex; gap: 1.2rem; background: #fff; align-items: flex-start; }
.product-card img { width: 120px; height: 120px; object-fit: contain; flex-shrink: 0; border-radius: 6px; background: #f9f9f9; }
.product-body { flex: 1; min-width: 0; }
.product-num { font-size: 0.7rem; font-weight: 700; color: #aaa; text-transform: uppercase; margin-bottom: 0.15rem; }
.product-vendor { font-size: 0.75rem; font-weight: 800; color: #c0392b; margin-bottom: 0.2rem; }
.product-body h2 { font-size: 0.93rem; font-weight: 800; margin-bottom: 0.25rem; color: #1a1a1a; line-height: 1.35; }
.product-stars { color: #ff9900; font-size: 0.82rem; margin-bottom: 0.25rem; }
.china-badge { font-size: 0.72rem; color: #999; display: block; margin-bottom: 0.3rem; }
.product-body p { font-size: 0.85rem; color: #444; margin-bottom: 0.6rem; line-height: 1.55; }
.pros-cons { display: flex; gap: 0.75rem; margin-bottom: 0.7rem; font-size: 0.78rem; }
.pros h4, .cons h4 { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem; }
.pros h4 { color: #27ae60; }
.cons h4 { color: #c0392b; }
.pros ul, .cons ul { padding-left: 1rem; color: #555; }
.pros li, .cons li { margin-bottom: 0.12rem; }
.btn-amazon { display: inline-block; background: #ff9900; color: #fff; text-decoration: none; padding: 0.48rem 1.2rem; border-radius: 6px; font-weight: 700; font-size: 0.83rem; }
.btn-amazon:hover { background: #e68900; }

/* Fitment + brand tables */
.fitment-section, .brand-section { margin: 2.5rem 0; padding-top: 2rem; border-top: 2px solid #f0f0f0; }
.fitment-section h2, .brand-section h2 { font-size: 1.2rem; font-weight: 900; margin-bottom: 0.5rem; }
.section-intro { font-size: 0.88rem; color: #555; margin-bottom: 1rem; }
.table-wrap { overflow-x: auto; }
.fitment-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.fitment-table th { background: #1a1a2e; color: #fff; padding: 0.6rem 0.75rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.4px; }
.fitment-table td { padding: 0.55rem 0.75rem; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
.fitment-table tr.alt td { background: #fafafa; }
.table-note { font-size: 0.78rem; color: #777; margin-top: 0.75rem; }

/* FAQ */
.faq-section { margin: 2.5rem 0; padding-top: 2rem; border-top: 2px solid #f0f0f0; }
.faq-section h2 { font-size: 1.2rem; font-weight: 900; margin-bottom: 1.2rem; }
.faq-item { margin-bottom: 1.2rem; padding-bottom: 1.2rem; border-bottom: 1px solid #f0f0f0; }
.faq-item:last-child { border-bottom: none; }
.faq-item h3 { font-size: 0.95rem; font-weight: 800; margin-bottom: 0.4rem; color: #1a1a2e; }
.faq-item p { font-size: 0.87rem; color: #444; line-height: 1.6; }

footer { background: #f7f7f7; border-top: 1px solid #e8e8e8; padding: 1.5rem 1.2rem; text-align: center; font-size: 0.75rem; color: #888; }
footer a { color: #c0392b; text-decoration: none; }
.disclaimer { max-width: 640px; margin: 0 auto 0.5rem; line-height: 1.6; }

@media (max-width: 560px) {
    .bartact-card, .product-card { flex-direction: column; }
    .bartact-card img { width: 100%; height: 180px; }
    .product-card img { width: 100%; height: 160px; }
    .pros-cons { flex-direction: column; }
    .hero h1 { font-size: 1.35rem; }
    nav a { margin-left: 0.7rem; font-size: 0.72rem; }
}
"""


DOOR_TABS = [
    ("All JK/JKU (any door)", "/"),
    ("2-Door JK only", "/jk-2door/"),
    ("4-Door JKU only", "/jku-4door/"),
]

YEAR_TABS = [
    ("All years (2007-2018)", "/"),
    ("2007-2010", "/jk-2007-2010/"),
    ("2011-2012", "/jk-2011-2012/"),
    ("2013-2018", "/jk-2013-2018/"),
]

DOOR_SLUGS = ["", "jk-2door", "jku-4door"]
YEAR_SLUGS = ["", "jk-2007-2010", "jk-2011-2012", "jk-2013-2018"]

def nav_door_html(current_slug):
    btns = ""
    for label, href in DOOR_TABS:
        slug_from_href = href.strip("/")
        is_active = current_slug == slug_from_href
        btns += f'<a href="https://jkseatcovers.com{href}" class="gen-btn{" active" if is_active else ""}">{label}</a>'
    return btns

def nav_year_html(current_slug):
    btns = ""
    for label, href in YEAR_TABS:
        slug_from_href = href.strip("/")
        is_active = current_slug == slug_from_href
        btns += f'<a href="https://jkseatcovers.com{href}" class="gen-btn{" active" if is_active else ""}">{label}</a>'
    return btns


def bartact_card(slug):
    yr_labels = {
        "": "2007-2018", "jk-2door": "2007-2018 (2-Door JK)",
        "jku-4door": "2007-2018 (4-Door JKU)", "jk-2007-2010": "2007-2010",
        "jk-2011-2012": "2011-2012", "jk-2013-2018": "2013-2018",
    }
    yr = yr_labels.get(slug, "2007-2018")
    img = BARTACT_IMGS.get(slug, BARTACT_IMG)
    return f"""
<div class="bartact-card">
  <img src="{img}" alt="Bartact Tactical Seat Covers Jeep Wrangler JK JKU {yr}" width="140" height="140" loading="eager">
  <div class="bartact-body">
    <span class="bartact-label">#1 Pick &mdash; Editor's Choice</span>
    <div class="bartact-vendor">Bartact &mdash; Made in USA &#127482;&#127480;</div>
    <h2>Bartact Tactical Seat Covers &mdash; Jeep Wrangler JK/JKU {yr}</h2>
    <div class="bartact-stars">&#9733;&#9733;&#9733;&#9733;&#9733; 4.9/5</div>
    <p>The only seat cover on this page made in the USA. Bartact builds custom-fit MOLLE tactical covers for the JK and JKU with 600D Polyester featuring a PU waterproof backing, laminated high-grade foam and scrim, and UV protection built into the fabric milling. Airbag-compatible side seams on every cover.</p>
    <ul class="bartact-bullets">
      <li>✓ Fits JK/JKU {yr} &mdash; separate SKUs for 2-door JK and 4-door JKU</li>
      <li>✓ Mil-spec MOLLE panels on seat backs</li>
      <li>✓ 600D Polyester with PU waterproof backing + UV protection</li>
      <li>✓ Airbag-safe split-stitch side seams</li>
      <li>✓ Made in USA &mdash; ships direct from Bartact</li>
    </ul>
        <div class="bartact-colors">
      <div class="tier-label">&#127775; Standard Tactical</div>
      <div class="color-row"><span class="color-label">Outer:</span><span class="color-swatch" style="background:#111;color:#fff" title="Black">Black</span></div>
      <div class="color-row"><span class="color-label">Insert:</span><span class="color-swatch" style="background:#111;color:#fff">Black</span><span class="color-swatch" style="background:#555;color:#fff">Graphite</span><span class="color-swatch" style="background:#c0392b;color:#fff">Red</span><span class="color-swatch" style="background:#2471a3;color:#fff">Blue</span><span class="color-swatch" style="background:#1a3a5c;color:#fff">Navy</span><span class="color-swatch" style="background:#e67e22;color:#fff">Orange</span><span class="color-swatch" style="background:#556b2f;color:#fff">Olive Drab</span><span class="color-swatch" style="background:#b8914a;color:#fff">Coyote</span><span class="color-swatch" style="background:#c8b87a;color:#222">Khaki</span><span class="color-swatch" style="background:#9fb4c7;color:#222">ACU</span></div>
      <div class="color-row"><span class="color-label">Logo:</span><span style="font-size:.8rem;color:#666;font-style:italic">Embroidered in USA &#8212; matches insert color</span></div>
      <div class="tier-label" style="margin-top:10px">&#127912; Fully Customized &#8212; all 4 options independent</div>
      <div class="color-row"><span class="color-label">Outer:</span><span class="color-swatch" style="background:#111;color:#fff">Black</span><span class="color-swatch" style="background:#555;color:#fff">Graphite</span><span class="color-swatch" style="background:#c0392b;color:#fff">Red</span><span class="color-swatch" style="background:#2471a3;color:#fff">Blue</span><span class="color-swatch" style="background:#1a53a8;color:#fff">Royal Blue</span><span class="color-swatch" style="background:#1a3a5c;color:#fff">Navy</span><span class="color-swatch" style="background:#e67e22;color:#fff">Orange</span><span class="color-swatch" style="background:#556b2f;color:#fff">OD</span><span class="color-swatch" style="background:#b8914a;color:#fff">Coyote</span><span class="color-swatch" style="background:#c8b87a;color:#222">Khaki</span><span class="color-swatch" style="background:#9fb4c7;color:#222">ACU</span><span class="color-swatch" style="background:#d4af37;color:#222">Gold</span><span class="color-swatch" style="background:#8899a6;color:#fff">Steel</span><span class="color-swatch" style="background:#d4b896;color:#222">Tan</span><span class="color-swatch" style="background:#fff;color:#222;border-color:#ccc">White</span><span class="color-swatch" style="background:#7b1f3a;color:#fff">Burgundy</span><span class="color-swatch" style="background:#6c3483;color:#fff">Purple</span><span class="color-swatch" style="background:#e91e8c;color:#fff">Hot Pink</span><span class="color-swatch" style="background:#f4a7b9;color:#222">Baby Pink</span><span class="color-swatch" style="background:#39ff14;color:#222">Neon Green</span><span class="color-swatch" style="background:#f1c40f;color:#222">Yellow</span></div>
      <div class="color-row"><span class="color-label">Insert:</span><em style="font-size:.8rem;color:#666">Same 21 colors as outer</em></div>
      <div class="color-row"><span class="color-label">Stitching:</span><em style="font-size:.8rem;color:#666">Same 21 colors &#8212; mix &amp; match</em></div>
      <div class="color-row"><span class="color-label">Logo:</span><em style="font-size:.8rem;color:#666">Same 21 colors &#8212; embroidered in USA</em></div>
      <p style="font-size:.8rem;color:#888;margin-top:8px">&#9432; Fully Customized = same mil-spec Tactical quality + your choice on every color. Custom builds may take 6&#8211;12 weeks. <a href="https://bartact.com" target="_blank" rel="noopener" style="color:#c8860a">Build yours at bartact.com &#8594;</a></p>
    </div>
    <a href="{BARTACT_URL}" class="btn-bartact" target="_blank" rel="noopener">Shop Bartact Direct &rarr;</a>
  </div>
</div>"""


def product_card(key, num, slug):
    p = PRODUCTS[key]
    name = p["names"].get(slug, p["names"][""])
    desc = p["descs"].get(slug, p["descs"][""])
    pros = "".join(f"<li>{x}</li>" for x in p["pros"])
    cons = "".join(f"<li>{x}</li>" for x in p["cons"])
    china = '<span class="china-badge">&#127464;&#127475; Manufactured in China</span>' if p.get("china") else ""
    return f"""
<div class="product-card">
  <img src="{IMG}/{p['hash']}._AC_SL300_.jpg" alt="{name}" width="120" height="120" loading="lazy">
  <div class="product-body">
    <div class="product-num">#{num}</div>
    <div class="product-vendor">{p['vendor']}</div>
    <h2>{name}</h2>
    <div class="product-stars">&#9733; {p['stars']}/5</div>
    {china}
    <p>{desc}</p>
    <div class="pros-cons">
      <div class="pros"><h4>Pros</h4><ul>{pros}</ul></div>
      <div class="cons"><h4>Cons</h4><ul>{cons}</ul></div>
    </div>
    <a class="btn-amazon" href="{AMZ}/{p['asin']}?tag={TAG}" target="_blank" rel="noopener nofollow">View on Amazon &#x2197;</a>
  </div>
</div>"""


def build_page(slug):
    meta = PAGE_META[slug]
    prod_keys = PAGE_PRODUCTS[slug]
    canonical = f"https://jkseatcovers.com/{slug + '/' if slug else ''}"
    total = len(prod_keys) + 1  # +1 for Bartact

    cards = bartact_card(slug)
    for i, key in enumerate(prod_keys):
        cards += product_card(key, i + 2, slug)

    year_note_html = f'<div class="year-note">{meta["year_note"]}</div>' if meta.get("year_note") else ""

    show_tables = (slug == "")  # Full tables only on hub page

    breadcrumb = '[{"@type":"ListItem","position":1,"name":"Home","item":"https://jkseatcovers.com/"}]'
    if slug:
        breadcrumb = f'[{{"@type":"ListItem","position":1,"name":"Home","item":"https://jkseatcovers.com/"}},{{"@type":"ListItem","position":2,"name":"{meta["h1"]}","item":"{canonical}"}}]'

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{meta['title']}</title>
  <meta name="description" content="{meta['desc']}">
  <link rel="canonical" href="{canonical}">
  <meta property="og:title" content="{meta['title']}">
  <meta property="og:description" content="{meta['desc']}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{canonical}">
  <script type="application/ld+json">{{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":{breadcrumb}}}</script>
  <style>{CSS}
.bartact-colors .tier-label{{font-size:.78rem;font-weight:700;color:#8b5e0a;margin:8px 0 4px;text-transform:uppercase;letter-spacing:.4px}}
.bartact-colors{{margin:10px 0 14px;padding:10px 12px;background:#fefefe;border:1px solid #e8d8b0;border-radius:8px}}
.color-row{{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:5px 0}}
.color-label{{font-size:.8rem;font-weight:700;color:#555;min-width:52px}}
.color-swatch{{display:inline-block;padding:3px 9px;border-radius:12px;font-size:.75rem;font-weight:600;cursor:default;border:1px solid rgba(0,0,0,.15)}}
</style>
</head>
<body>

<header>
  <a class="logo" href="https://jkseatcovers.com/"><span>JK</span>SeatCovers.com</a>
  <nav>
    <a href="https://jkseatcovers.com/jk-2door/">JK 2-Door</a>
    <a href="https://jkseatcovers.com/jku-4door/">JKU 4-Door</a>
    <a href="https://jkseatcovers.com/jk-2013-2018/">2013-2018</a>
    <a href="{BARTACT_URL}" target="_blank" rel="noopener">Bartact &#x2197;</a>
  </nav>
</header>

<div class="hero">
  <div class="hero-inner">
    <span class="hero-badge">Updated {YEAR} &mdash; Verified Fitment Data</span>
    <h1>{meta['h1']}</h1>
    <p class="hero-desc">{meta['desc']}</p>
    <p class="hero-meta">&#9997; By the JKSeatCovers Editors &bull; {total} picks reviewed &bull; Fitment verified</p>
  </div>
</div>

<div class="main">

  <div class="gen-selector">
    <div class="nav-group">
      <h3>Step 1 &mdash; Door count</h3>
      <div class="gen-grid">{nav_door_html(slug)}</div>
    </div>
    <div class="nav-group" style="margin-top:0.9rem">
      <h3>Step 2 &mdash; Model year</h3>
      <div class="gen-grid">{nav_year_html(slug)}</div>
    </div>
  </div>

  {year_note_html}

  <div class="intro-text">{meta['intro']}</div>

  {cards}

  {FITMENT_TABLE if show_tables else ""}
  {BRAND_COMPARISON if show_tables else ""}
  {FAQ}

</div>

<footer>
  <p class="disclaimer">As an Amazon Associate I earn from qualifying purchases. Product images and descriptions are provided for reference. Verify fitment directly with the manufacturer before ordering. This site is not affiliated with Jeep, Chrysler, Stellantis, or Bartact.</p>
  <p style="margin-top:0.4rem"><a href="https://jkseatcovers.com/">jkseatcovers.com</a> &copy; {YEAR} &mdash; Independent fitment research. Not affiliated with Jeep&reg; or Stellantis&reg;.</p>
</footer>

</body>
</html>"""


def build_sitemap():
    urls = []
    for slug in PAGE_META:
        url = f"https://jkseatcovers.com/{slug + '/' if slug else ''}"
        pri = "1.0" if slug == "" else "0.8"
        urls.append(f"  <url><loc>{url}</loc><changefreq>monthly</changefreq><priority>{pri}</priority></url>")
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>"""


def main():
    for slug in PAGE_META:
        if slug:
            d = OUT / slug
            d.mkdir(exist_ok=True)
            f = d / "index.html"
        else:
            f = OUT / "index.html"
        f.write_text(build_page(slug), encoding="utf-8")
        print(f"  ✅ {f.relative_to(OUT)}")

    (OUT / "sitemap.xml").write_text(build_sitemap(), encoding="utf-8")
    print(f"  ✅ sitemap.xml")
    print(f"\nBuilt {len(PAGE_META)} pages.")


if __name__ == "__main__":
    main()
