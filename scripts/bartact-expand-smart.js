#!/usr/bin/env node
// Expand smart collection body_html for Bartact collections that need deeper content
const https = require('https');
const fs = require('fs');

const TOKEN = 'REDACTED_SHOPIFY_TOKEN';
const SHOP = 'bartact.myshopify.com';

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: SHOP, path: '/admin/api/2024-01' + path, method,
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      },
    };
    const r = https.request(opts, res => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, data: JSON.parse(b) }); } catch (e) { resolve({ status: res.statusCode, data: b }); } });
    });
    r.on('error', reject); if (data) r.write(data); r.end();
  });
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// All collections with corrected types
const updates = [
  {
    id: '688526164011', handle: 'jeep-wrangler-jl-seat-covers', type: 'smart',
    html: `<p><strong>Jeep Wrangler JL seat covers</strong> from Bartact are purpose-built for the 2018+ JL platform—precise fitment, zero compromise. Every cover is hand-sewn in the USA from military-spec 1000D Cordura nylon, the same fabric trusted by the US Armed Forces for its abrasion resistance, UV stability, and waterproof performance. Cordura outlasts neoprene and faux-leather alternatives by years, not months.</p>

<p>The JL Wrangler's bucket seats, rear bench, and optional half-doors create unique fitment demands. Bartact engineers have mapped every contour, headrest, armrest pass-through, seat-belt slot, and airbag deployment zone to deliver a cover that installs in minutes and stays put on the trail.</p>

<h2>Why Bartact Cordura Beats the Competition</h2>
<ul>
  <li><strong>1000D Cordura vs. Neoprene:</strong> Neoprene traps heat and cracks in UV. Cordura breathes, stays cool on summer wheeling, and resists tearing on jagged trail debris.</li>
  <li><strong>1000D Cordura vs. Faux Leather:</strong> Vinyl splits, peels, and becomes slippery when wet. Cordura grips, flexes, and won't peel after a season on the rocks.</li>
  <li><strong>OEM Airbag Compatibility:</strong> Every Bartact JL cover is engineered with split-seam airbag panels—side-impact bags deploy without obstruction.</li>
  <li><strong>MOLLE Webbing Ready:</strong> Integrated MOLLE panels let you attach pouches, tools, and organizers directly to your seat back.</li>
</ul>

<h2>Made in the USA — Gainesville, Georgia</h2>
<p>Bartact's factory is in Gainesville, GA. Every stitch, cut, and quality check happens on American soil. When you buy Bartact JL seat covers you're supporting US manufacturing and getting a product built to the same standard as military and law-enforcement gear.</p>

<h2>Frequently Asked Questions</h2>
<dl>
  <dt><strong>Do these fit both 2-door and 4-door JL models?</strong></dt>
  <dd>Yes. Bartact offers separate SKUs for the 2-door and 4-door Wrangler JL to ensure precise fitment on both configurations.</dd>
  <dt><strong>Will they fit over my factory heated seats?</strong></dt>
  <dd>Absolutely. The fabric is breathable enough that heat transfer remains effective. Heated-seat function is not impaired.</dd>
  <dt><strong>How do I clean Cordura seat covers?</strong></dt>
  <dd>Spot-clean with mild soap and water or remove and hose them down. Cordura dries quickly and doesn't absorb odors the way neoprene does.</dd>
  <dt><strong>Are side airbags still safe with these installed?</strong></dt>
  <dd>Yes. Bartact uses airbag-split seams that allow side curtain and seat-mounted airbags to deploy correctly.</dd>
  <dt><strong>Do you make matching rear-seat covers?</strong></dt>
  <dd>Yes—front and rear sets are available. Mixing and matching colors/patterns across front and rear is fully supported.</dd>
</dl>

<h2>Browse Related Collections</h2>
<ul>
  <li><a href="/collections/jeep-wrangler-grab-handles">Jeep Wrangler Grab Handles</a></li>
  <li><a href="/collections/molle-accessories">MOLLE Seat Accessories</a></li>
  <li><a href="/collections/jeep-wrangler-storage-bags-organizers">Jeep Storage Bags &amp; Organizers</a></li>
  <li><a href="/collections/fire-extinguisher-holders">Fire Extinguisher Holders</a></li>
  <li><a href="/collections/winch-covers">Winch Covers</a></li>
</ul>`
  },
  {
    id: '275721355307', handle: 'toyota-tacoma-seat-covers', type: 'custom',
    html: `<p>The <strong>Toyota Tacoma seat covers</strong> from Bartact deliver the same USA-made, military-grade Cordura quality that off-road and work-truck drivers demand. Built specifically for the Tacoma's contoured seats—including the double-cab rear bench and the unique seat-belt tower pass-through on 3rd-gen models—these covers install without tools and won't shift on the gnarliest terrain.</p>

<p>Tacoma owners push their trucks hard. Whether you're a daily commuter hauling muddy hiking boots or a weekend overlander with trail dust everywhere, Bartact's 1000D Cordura nylon handles it all. Cordura resists abrasion, UV degradation, and moisture far better than neoprene or faux-leather alternatives that crack and peel within a season.</p>

<h2>Cordura vs. the Alternatives</h2>
<ul>
  <li><strong>Cordura vs. Neoprene:</strong> Neoprene is soft but heat-retaining and UV-sensitive. Cordura is cooler, tougher, and lasts years longer.</li>
  <li><strong>Cordura vs. Faux Leather:</strong> Vinyl cracks in cold weather and gets dangerously slippery when wet. Cordura grips, flexes, and ages gracefully.</li>
  <li><strong>Made in USA:</strong> Every Tacoma cover is cut and sewn in Gainesville, Georgia—domestic manufacturing, domestic quality control.</li>
</ul>

<h2>Tacoma-Specific Fitment Details</h2>
<p>Bartact patterns accommodate the 2016–2026 3rd-gen Tacoma across Access Cab and Double Cab configurations. Rear pass-through slots, seat-belt towers, and fold-flat rear benches are all accounted for. If you have the optional heated seats, the breathable Cordura fabric keeps heat transfer efficient.</p>

<h2>Frequently Asked Questions</h2>
<dl>
  <dt><strong>Do these fit the Tacoma TRD Pro's sport seats?</strong></dt>
  <dd>Yes. Bartact offers Tacoma-specific patterns that cover both standard and sport-bolstered TRD seats.</dd>
  <dt><strong>Can I use MOLLE pouches with these seat covers?</strong></dt>
  <dd>Yes. Bartact Tacoma covers include integrated MOLLE webbing on the seat backs for attaching pouches and organizers.</dd>
  <dt><strong>Will they work with my rear-seat flip-up storage?</strong></dt>
  <dd>The rear covers are designed to allow the standard flip-up seat storage access on Double Cab models.</dd>
  <dt><strong>How long does installation take?</strong></dt>
  <dd>Most Tacoma owners complete front and rear installation in under 30 minutes with no tools required.</dd>
  <dt><strong>Are these machine washable?</strong></dt>
  <dd>Spot-clean recommended. For deep cleans, remove and hand-wash; Cordura dries fast and holds its shape.</dd>
</dl>

<h2>Related Gear for Your Tacoma</h2>
<ul>
  <li><a href="/collections/molle-accessories">MOLLE Accessories</a></li>
  <li><a href="/collections/winch-covers">Winch Covers</a></li>
  <li><a href="/collections/jeep-wrangler-storage-bags-organizers">Storage Bags &amp; Organizers</a></li>
  <li><a href="/collections/fire-extinguisher-holders">Fire Extinguisher Holders</a></li>
  <li><a href="/collections/jeep-wrangler-suspension-limit-straps">Suspension Limit Straps</a></li>
</ul>`
  },
  {
    id: '688348856363', handle: 'jeep-wrangler-grab-handles', type: 'smart',
    html: `<p><strong>Jeep Wrangler grab handles</strong> from Bartact give passengers a secure, confidence-inspiring hold on trails that would send factory-style assists flying. Bartact's grab handles are hand-crafted in Gainesville, Georgia from 1000D Cordura and paracord—the same materials that outfit US military gear—so they absorb shock, resist abrasion, and never fail you mid-flex.</p>

<p>The stock Jeep Wrangler roll bar handles are notorious for cracking and becoming slippery when wet. Bartact replaces them with a tactile, grippy paracord wrap over a reinforced Cordura base that stays secure in gloves, muddy hands, or freezing temps.</p>

<h2>Paracord vs. Plastic: No Contest</h2>
<ul>
  <li><strong>Paracord grip:</strong> Textured surface grips even with gloves on—essential for winter wheeling or wet-weather trails.</li>
  <li><strong>Cordura base:</strong> The underlying fabric sleeve resists UV, moisture, and the constant flexing that cracks plastic handles over time.</li>
  <li><strong>Weight rated:</strong> Bartact handles are tested to handle real passenger loads under dynamic off-road conditions.</li>
  <li><strong>Made in USA:</strong> Hand-assembled in Georgia; no overseas supply chain shortcuts.</li>
</ul>

<h2>Fits JK, JL, and JT Models</h2>
<p>Bartact makes grab handle sets for all modern Wrangler generations. JK (2007–2018), JL (2018+), and Gladiator JT roll bars all share compatible mounting points. Installation is bolt-on—no drilling, no modification, under 10 minutes per handle.</p>

<h2>Frequently Asked Questions</h2>
<dl>
  <dt><strong>Do these replace the factory handles or install on the roll bar?</strong></dt>
  <dd>Bartact grab handles mount directly to the existing roll bar attachment points—no drilling required.</dd>
  <dt><strong>What colors are available?</strong></dt>
  <dd>Handles come in dozens of paracord colors and Cordura color combinations so you can match or contrast your interior.</dd>
  <dt><strong>Can kids use these safely?</strong></dt>
  <dd>Yes. The handles are rated for adult loads and are ergonomically sized for smaller hands too.</dd>
  <dt><strong>Do they fit the JLU 4-door rear roll bar?</strong></dt>
  <dd>Yes. Bartact offers sets specifically sized for the JLU rear overhead bar.</dd>
  <dt><strong>How do I clean them?</strong></dt>
  <dd>Rinse with water; paracord dries quickly and doesn't absorb grime the way foam-padded handles do.</dd>
</dl>

<h2>Complete Your Wrangler Build</h2>
<ul>
  <li><a href="/collections/jeep-wrangler-jl-seat-covers">Jeep Wrangler JL Seat Covers</a></li>
  <li><a href="/collections/molle-accessories">MOLLE Accessories</a></li>
  <li><a href="/collections/fire-extinguisher-holders">Fire Extinguisher Holders</a></li>
  <li><a href="/collections/jeep-wrangler-storage-bags-organizers">Storage Bags &amp; Organizers</a></li>
  <li><a href="/collections/roll-bar-fire-extinguisher-holder">Roll Bar Fire Extinguisher Holder</a></li>
</ul>`
  },
  {
    id: '137429778455', handle: 'molle-accessories', type: 'smart',
    html: `<p>Bartact's <strong>MOLLE seat covers</strong> and MOLLE accessories transform your Jeep, Bronco, or truck's interior into a fully configurable tactical gear station. The Modular Lightweight Load-carrying Equipment (MOLLE) system—originally developed for US military use—lets you attach pouches, tools, first-aid kits, and organizers exactly where you need them, without permanent modification.</p>

<p>Every Bartact MOLLE product is cut and sewn in Gainesville, Georgia from 1000D Cordura nylon. This isn't the flimsy MOLLE you'll find on imported accessories—it's the same spec as the packs used by service members in the field.</p>

<h2>MOLLE Seat Covers: Gear On Your Seat Back</h2>
<p>Bartact's MOLLE-integrated seat covers add a full grid of webbing to your seat backs, turning dead space into organized storage. Attach hydration pouches, dump pouches, radio holders, or med kits—all accessible from the rear seats without opening the trunk or digging under gear.</p>

<h2>Why 1000D Cordura MOLLE?</h2>
<ul>
  <li><strong>Mil-spec webbing:</strong> MOLLE channels are stitched at the correct 1-inch spacing per MOLLE standard, so all compatible pouches attach and lock correctly.</li>
  <li><strong>1000D Cordura base:</strong> Far stronger than 500D or 600D fabric used by budget brands. Resists tearing even under loaded pouches on rough trails.</li>
  <li><strong>Made in USA:</strong> No outsourced stitching. Every piece of webbing is attached to specification in Bartact's Georgia factory.</li>
  <li><strong>Cordura vs. Nylon Mesh:</strong> Mesh tears and stretches. Cordura holds its shape and load under years of use.</li>
</ul>

<h2>Compatible Vehicles</h2>
<p>Bartact MOLLE accessories are available for Jeep Wrangler JK/JL, Jeep Gladiator, Ford Bronco, Toyota Tacoma, and more. Check product pages for specific fitment.</p>

<h2>Frequently Asked Questions</h2>
<dl>
  <dt><strong>Are all MOLLE pouches compatible with Bartact panels?</strong></dt>
  <dd>Any standard MOLLE/PALS-compatible pouch will work. Bartact panels use the correct 1-inch webbing spacing per spec.</dd>
  <dt><strong>Can I add MOLLE panels to existing non-MOLLE seat covers?</strong></dt>
  <dd>Bartact makes standalone MOLLE seat-back panels that can attach over many factory seats. Check fitment on the product page.</dd>
  <dt><strong>How much weight can a MOLLE panel hold?</strong></dt>
  <dd>Individual panels vary, but 1000D Cordura with double-stitched webbing handles typical field loads (hydration, radio, first-aid kit) without issue.</dd>
  <dt><strong>Will MOLLE pouches scratch my center console or seat backs?</strong></dt>
  <dd>No. All Bartact panels use a felt-back or smooth-back construction that protects your interior surfaces.</dd>
  <dt><strong>Do you sell MOLLE pouches as well as panels?</strong></dt>
  <dd>Yes. Bartact offers a range of compatible pouches sized for off-road and overlanding use.</dd>
</dl>

<h2>Build Out Your Rig</h2>
<ul>
  <li><a href="/collections/jeep-wrangler-jl-seat-covers">Jeep Wrangler JL Seat Covers</a></li>
  <li><a href="/collections/jeep-wrangler-grab-handles">Grab Handles</a></li>
  <li><a href="/collections/fire-extinguisher-holders">Fire Extinguisher Holders</a></li>
  <li><a href="/collections/jeep-wrangler-storage-bags-organizers">Storage Bags &amp; Organizers</a></li>
  <li><a href="/collections/roll-bar-fire-extinguisher-holder">Roll Bar Fire Extinguisher Holder</a></li>
</ul>`
  },
  {
    id: '688526360619', handle: 'roll-bar-fire-extinguisher-holder', type: 'smart',
    html: `<p>Mount your extinguisher on the roll bar where it belongs—accessible from the front seats, out of the cargo area, and ready in seconds. Bartact's <strong>roll bar fire extinguisher holder</strong> is engineered for Jeep Wrangler JK, JL, and Ford Bronco roll bars. It's hand-sewn in Gainesville, Georgia from 1000D Cordura with a bolt-on aluminum bracket—no drilling into your roll bar required.</p>

<p>Off-road safety professionals recommend mounting fire extinguishers at a known, fixed, driver-accessible location. The roll bar is ideal: it's central, visible, protected from cargo movement, and reachable from the driver's seat without exiting the vehicle. A fabric holder damps trail vibration that would crack a plastic bracket within a season.</p>

<h2>Why Roll Bar Mounting?</h2>
<ul>
  <li><strong>Driver-accessible:</strong> Reachable from the front seat—no need to exit the vehicle in an emergency.</li>
  <li><strong>Vibration-damped:</strong> 1000D Cordura sleeve absorbs trail vibration; plastic brackets crack and rattle loose.</li>
  <li><strong>Secure retention:</strong> Dual Velcro + cinch strap system holds the extinguisher through rock crawls and high-speed dirt runs.</li>
  <li><strong>Made in USA:</strong> Every holder is made in Bartact's Gainesville, GA factory—mil-spec stitching, domestic hardware.</li>
</ul>

<h2>Fits JK, JL, and Bronco Roll Bars</h2>
<p>Bartact's roll bar mount uses a padded clamp that fits standard 1.75-inch and 2-inch diameter tubular roll bars without scratching the powder coat. Available for 1-lb, 2.5-lb, and 5-lb extinguisher canisters.</p>

<h2>Frequently Asked Questions</h2>
<dl>
  <dt><strong>Will this fit my JL Wrangler's A-pillar bar?</strong></dt>
  <dd>The mount is designed for the main rear roll bar. A-pillar mounting options are available separately.</dd>
  <dt><strong>Does the clamp damage my roll bar's powder coat?</strong></dt>
  <dd>No. The clamp includes a rubber-backed pad that protects the finish while providing a secure grip.</dd>
  <dt><strong>What extinguisher size is recommended for off-road use?</strong></dt>
  <dd>Most trail-safety guides recommend a minimum 2.5-lb ABC extinguisher. Bartact holders are available for both 1-lb and 2.5-lb canisters.</dd>
  <dt><strong>Can I mount this on a custom cage?</strong></dt>
  <dd>Yes, as long as the tube diameter matches (1.75" or 2"). Aftermarket and custom cage tube diameters vary—check your cage spec before ordering.</dd>
  <dt><strong>Is the extinguisher included?</strong></dt>
  <dd>No. The holder is sold separately; any standard ABC extinguisher of the compatible diameter will fit.</dd>
</dl>

<h2>Trail Safety Collection</h2>
<ul>
  <li><a href="/collections/fire-extinguisher-holders">All Fire Extinguisher Holders</a></li>
  <li><a href="/collections/molle-accessories">MOLLE Accessories</a></li>
  <li><a href="/collections/jeep-wrangler-grab-handles">Grab Handles</a></li>
  <li><a href="/collections/jeep-wrangler-storage-bags-organizers">Storage Bags &amp; Organizers</a></li>
  <li><a href="/collections/jeep-wrangler-jl-seat-covers">Jeep Wrangler JL Seat Covers</a></li>
</ul>`
  },
  {
    id: '684493013035', handle: 'jeep-wrangler-storage-bags-organizers', type: 'smart',
    html: `<p>Keep your Wrangler organized on trail and in town with Bartact's <strong>Jeep storage bags</strong> and organizers—hand-sewn in Gainesville, Georgia from 1000D Cordura nylon. Whether you need overhead organization, seat-back pouches, or cargo area management, Bartact makes storage solutions purpose-built for the Wrangler's odd angles and tight spaces.</p>

<p>The Jeep Wrangler is legendary for capability but notorious for storage. Bartact solves that with fitment-specific bags that use every cubic inch efficiently—without rattling, shifting, or blocking sight lines.</p>

<h2>Cordura Storage: Built to Last</h2>
<ul>
  <li><strong>1000D Cordura vs. cheap nylon:</strong> Budget bags use thin 210D or 420D nylon that tears on sharp cargo edges. Bartact's 1000D Cordura is the same spec as military field gear.</li>
  <li><strong>Heavy-duty zippers:</strong> YKK zippers on all closures—they work in mud, sand, and freezing temps when cheap zippers jam or split.</li>
  <li><strong>MOLLE integration:</strong> Most Bartact storage bags include MOLLE webbing so you can attach additional pouches as your needs grow.</li>
  <li><strong>Made in USA:</strong> Every bag is cut, sewn, and quality-checked in Gainesville, Georgia.</li>
</ul>

<h2>Storage Options for Every Part of Your Wrangler</h2>
<p>Bartact offers overhead storage bags for the JK and JL grab handles, seat-back organizers, center console bags, and cargo area organizers. Mix and match to build a complete interior organization system.</p>

<h2>Frequently Asked Questions</h2>
<dl>
  <dt><strong>Do these bags work with the hardtop and softtop?</strong></dt>
  <dd>Yes. Overhead bags mount to the grab handle bars and work with both hardtop and softtop configurations.</dd>
  <dt><strong>Can I use these in a JK and a JL?</strong></dt>
  <dd>Some bags are interchangeable; others are model-specific. Each product listing specifies compatibility.</dd>
  <dt><strong>Will the overhead bag obstruct my view through the top?</strong></dt>
  <dd>Bartact overhead bags are profiled to sit close to the overhead bar and minimize forward sight-line obstruction.</dd>
  <dt><strong>Are the zippers waterproof?</strong></dt>
  <dd>The YKK zippers are weather-resistant. For fully waterproof storage, Bartact offers dry-bag options for valuables.</dd>
  <dt><strong>How do I attach seat-back organizers?</strong></dt>
  <dd>They slip over the headrest posts and secure with adjustment straps—no tools, installs in under a minute.</dd>
</dl>

<h2>More Interior Upgrades</h2>
<ul>
  <li><a href="/collections/jeep-wrangler-jl-seat-covers">Jeep Wrangler JL Seat Covers</a></li>
  <li><a href="/collections/molle-accessories">MOLLE Accessories</a></li>
  <li><a href="/collections/jeep-wrangler-grab-handles">Grab Handles</a></li>
  <li><a href="/collections/fire-extinguisher-holders">Fire Extinguisher Holders</a></li>
  <li><a href="/collections/winch-covers">Winch Covers</a></li>
</ul>`
  },
  {
    id: '688526786603', handle: 'ford-bronco-storage-bags', type: 'smart',
    html: `<p>The Ford Bronco's modular interior is begging for smart organization—and Bartact's <strong>Ford Bronco storage bags</strong> deliver it. Made in Gainesville, Georgia from 1000D Cordura nylon, these bags are purpose-fit for the Bronco's grab handles, cargo area, and seat backs, giving you organized access to trail gear without the chaos.</p>

<p>The Bronco's removable doors and top create unique storage challenges—gear that was locked behind a door is suddenly exposed to the elements when you go topless. Bartact's Cordura bags are water-resistant enough to handle a light rain and tough enough to survive being tossed in a pile while you bolt the doors back on.</p>

<h2>Why Bartact for Ford Bronco Storage</h2>
<ul>
  <li><strong>Bronco-specific fitment:</strong> Bags engineered for the Bronco's grab bar dimensions, seat proportions, and cargo layout—not generic.</li>
  <li><strong>1000D Cordura durability:</strong> Resists the abrasion of tools, recovery gear, and cargo that tears through thin nylon bags.</li>
  <li><strong>MOLLE-ready:</strong> Attach additional pouches—first aid, recovery tools, comms—directly to the bag exterior.</li>
  <li><strong>Made in USA:</strong> Hand-sewn in Gainesville, Georgia. Same factory, same standards as Bartact's military and law-enforcement contracts.</li>
</ul>

<h2>Cordura vs. Neoprene vs. Faux Leather</h2>
<p>Many aftermarket storage accessories use neoprene or vinyl. Neoprene stretches and deforms under load. Vinyl cracks in cold weather. Cordura maintains its shape, handles sharp-edged cargo, and outlasts both alternatives by years.</p>

<h2>Frequently Asked Questions</h2>
<dl>
  <dt><strong>Do these fit both the 2-door and 4-door Bronco?</strong></dt>
  <dd>Bartact makes separate bags for the 2-door and 4-door configurations due to differing grab bar and cargo dimensions.</dd>
  <dt><strong>Are these bags waterproof when the doors are off?</strong></dt>
  <dd>The 1000D Cordura fabric is water-resistant; contents should be fine in light rain. For full waterproofing, use Bartact's dry-bag inserts for valuables.</dd>
  <dt><strong>Can I use these with the Bronco Sport?</strong></dt>
  <dd>These bags are fitted for the full-size Bronco. The Bronco Sport has different interior dimensions—check product listings for compatibility.</dd>
  <dt><strong>How do they attach to the grab bars?</strong></dt>
  <dd>Overhead bags use a slip-over sleeve with cinch adjusters that clamp to the Bronco's overhead bar—no hardware, no modification.</dd>
  <dt><strong>Do they interfere with the removable top panels?</strong></dt>
  <dd>No. Bartact's overhead bags are sized to clear the modular top panel tracks and don't interfere with removal.</dd>
</dl>

<h2>More Bronco Accessories</h2>
<ul>
  <li><a href="/collections/ford-bronco-grab-handles">Ford Bronco Grab Handles</a></li>
  <li><a href="/collections/molle-accessories">MOLLE Accessories</a></li>
  <li><a href="/collections/fire-extinguisher-holders">Fire Extinguisher Holders</a></li>
  <li><a href="/collections/winch-covers">Winch Covers</a></li>
  <li><a href="/collections/jeep-wrangler-storage-bags-organizers">Jeep Wrangler Storage Bags</a></li>
</ul>`
  },
  {
    id: '137430564887', handle: 'winch-covers', type: 'smart',
    html: `<p>A quality <strong>winch cover</strong> from Bartact protects your recovery equipment investment from UV degradation, trail dust, moisture, and the abrasion of brush and branches. Made in Gainesville, Georgia from 1000D Cordura nylon, Bartact winch covers fit snugly over your winch housing while still allowing quick removal when you need to hook up and pull.</p>

<p>Winches are expensive. Synthetic rope degrades in UV; steel cable corrodes and frays; motor housings oxidize. A proper Cordura cover addresses all three threats in one product. Unlike the thin nylon or vinyl covers sold by big-box retailers, Bartact's 1000D Cordura resists tearing on trail brush, stands up to UV year after year, and doesn't crack in freezing temps.</p>

<h2>1000D Cordura vs. Vinyl Winch Covers</h2>
<ul>
  <li><strong>UV resistance:</strong> Cordura's tight weave blocks UV far better than vinyl, protecting synthetic rope from becoming brittle.</li>
  <li><strong>Abrasion resistance:</strong> Brush, rocks, and branch impacts that tear thin covers leave Cordura unmarked.</li>
  <li><strong>Temperature stability:</strong> Cordura doesn't stiffen in cold or get pliable/sticky in summer heat the way vinyl does.</li>
  <li><strong>Made in USA:</strong> Every Bartact winch cover is hand-sewn in Georgia. The stitching is the same spec as military field gear.</li>
</ul>

<h2>Fitment</h2>
<p>Bartact winch covers are available for 8,000–12,000 lb winches from Warn, Smittybilt, Rugged Ridge, and other major brands. Measure your winch drum width and housing depth—or use the fitment chart on the product page—to select the right size.</p>

<h2>Frequently Asked Questions</h2>
<dl>
  <dt><strong>Will this fit over a synthetic rope winch?</strong></dt>
  <dd>Yes. The cover fits over the entire drum assembly regardless of rope type. Synthetic rope especially benefits from UV protection.</dd>
  <dt><strong>How do I secure the cover so it doesn't blow off at speed?</strong></dt>
  <dd>Bartact covers include an underside cinch strap that routes behind the fairlead for a secure fit at highway speeds.</dd>
  <dt><strong>Does the cover need to come off before I can use the winch?</strong></dt>
  <dd>Yes—remove the cover before deploying the winch line. The quick-release design takes under 10 seconds.</dd>
  <dt><strong>Is the cover compatible with roller and hawse fairleads?</strong></dt>
  <dd>Yes. The cover sits behind the fairlead; it's compatible with both roller and hawse styles.</dd>
  <dt><strong>What colors are available?</strong></dt>
  <dd>Black, coyote/tan, and ranger green—matching Bartact's broader product color range.</dd>
</dl>

<h2>Recovery &amp; Trail Gear</h2>
<ul>
  <li><a href="/collections/molle-accessories">MOLLE Accessories</a></li>
  <li><a href="/collections/jeep-wrangler-storage-bags-organizers">Storage Bags &amp; Organizers</a></li>
  <li><a href="/collections/fire-extinguisher-holders">Fire Extinguisher Holders</a></li>
  <li><a href="/collections/jeep-wrangler-suspension-limit-straps">Suspension Limit Straps</a></li>
  <li><a href="/collections/jeep-wrangler-jl-seat-covers">Jeep Wrangler JL Seat Covers</a></li>
</ul>`
  },
];

async function main() {
  const results = [];
  for (const col of updates) {
    const endpoint = col.type === 'smart'
      ? `/smart_collections/${col.id}.json`
      : `/custom_collections/${col.id}.json`;
    const key = col.type === 'smart' ? 'smart_collection' : 'custom_collection';
    const payload = { [key]: { id: col.id, body_html: col.html } };
    process.stdout.write(`Updating ${col.handle}... `);
    const res = await req('PUT', endpoint, payload);
    if (res.status === 200) {
      console.log('✅');
      results.push({ handle: col.handle, status: 'updated' });
    } else {
      console.log(`❌ ${res.status}`);
      console.log(JSON.stringify(res.data).slice(0, 300));
      results.push({ handle: col.handle, status: 'error', code: res.status });
    }
    await sleep(500);
  }
  console.log('\n=== RESULTS ===');
  results.forEach(r => console.log(`${r.status === 'updated' ? '✅' : '❌'} ${r.handle}`));
  const existing = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/memory/bartact-expand-results.json', 'utf8'));
  const merged = { date: new Date().toISOString(), results: [...existing.results, ...results] };
  fs.writeFileSync('/home/ubuntu/.openclaw/workspace/memory/bartact-expand-results.json', JSON.stringify(merged, null, 2));
  console.log('\nResults saved.');
}

main().catch(console.error);
