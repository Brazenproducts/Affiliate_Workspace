#!/usr/bin/env node
/**
 * Bull Strap SEO Metafield Writer
 * Writes custom.seo_content (1,500w target), SEO title (≤65c), SEO description (80–160c)
 * Verifies post-write word count from API response
 * Fires IndexNow immediately after each batch
 * Queues Google Indexing API submissions (capped at 199/day shared quota)
 *
 * Usage: node bullstrap-seo-metafield-writer.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SHOP = 'bull-strap-78.myshopify.com';
const TOKEN = 'REDACTED_SHOPIFY_ACCESS_TOKEN';
const INDEXNOW_KEY = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';
const QUOTA_FILE = path.join(__dirname, '../memory/bullstrap-indexing-shared-quota.json');
const LOG_FILE = path.join(__dirname, '../memory/bullstrap-seo-metafield-log.md');

// Word count floor
const WORD_COUNT_FLOOR = 1500;

// ─── SEO CONTENT LIBRARY ────────────────────────────────────────────────────
// Each product: unique content based on actual specs, fitment, differentiators
// NO templates. NO shared paragraphs. Every product stands alone.

const PRODUCTS = [

  // ══════════════════════════════════════════════════════════════════════════
  // PRIORITY 1: Bull Strap Suspension Limit Straps (main product)
  // ══════════════════════════════════════════════════════════════════════════
  {
    handle: 'limit-straps-bullstrap',
    id: 'gid://shopify/Product/8259763372305',
    seoTitle: 'Suspension Limit Straps — Made in USA 4130 Chromoly | Bull Strap',
    seoDescription: 'Bull Strap suspension limit straps: quad-wrap 7,000 lb nylon, heat-treated 4130 Chromoly ends, Berry Compliant. 39 sizes 6"–44". Made in USA.',
    seoContent: `<h2>Bull Strap Suspension Limit Straps — The Standard for Off-Road Builders</h2>

<p>Suspension limit straps are one of the most critical components in any serious off-road build, and Bull Strap has been manufacturing them right here in the USA for over 15 years. If you run long-travel suspension on a Jeep Wrangler, Toyota Tacoma, Ford Bronco, Polaris RZR, Can-Am Maverick X3, or any custom prerunner or desert race truck, a quality limit strap is what stands between your axle and your CV joints, ball joints, and brake lines when your suspension reaches full droop. A cheap strap — or worse, no strap — means a busted axle on the trail or on the race course. Bull Strap limit straps are what the best-in-class off-road racers have trusted for a decade and a half.</p>

<h2>What Makes a Bull Strap Limit Strap Different</h2>

<p>Not all limit straps are built the same, and the differences matter when you're hammering through whoops at speed or crawling off a ledge at full droop. Here's exactly what goes into every Bull Strap limit strap:</p>

<h3>4-Layer Quad Wrap Construction</h3>
<p>Bull Strap uses four full layers of 1-3/4" mil-spec, resin-coated, twisted-yarn nylon webbing rated at 7,000 lb per layer. That's 28,000 lb of total webbing strength, with two complete layers wrapped around each end buckle. Most competitors use single or double-wrap construction — that's half the webbing, half the protection. The quad wrap design isn't marketing language; it's a structural difference that shows up in load testing every time.</p>

<h3>Heat-Treated 4130 Chromoly Hardware</h3>
<p>The end pieces on Bull Strap limit straps are enamel-coated, heat-treated 4130 chromoly steel with 9/16" bolt holes and deflector sleeves for added webbing protection. These buckles are rated for over 12,500 lb and consistently hold above 15,000 lb in testing before failure. Compare that to counterfeit Chinese hardware that copies the "4130 Heat Treated" stamp but breaks at roughly 5,500 lb. If you're running a knockoff strap, you're running one hard landing away from a failure. Bull Strap does not use zinc-plated hardware — enamel coating is more durable and doesn't scratch off under flexing.</p>

<h3>Berry Amendment Compliant — Military-Grade Materials</h3>
<p>Every Bull Strap limit strap is built with Berry Amendment compliant materials — meaning the nylon webbing and all components are sourced and manufactured in the United States. This is the same compliance standard used for military vehicle equipment, including the new GM ISV (Infantry Squad Vehicle). Berry compliance isn't just a checkbox for Bull Strap — it's what enables these straps to be used in military applications while the rest of the market sources from overseas to cut costs.</p>

<h3>39 Sizes Available — Every Suspension Setup Covered</h3>
<p>Bull Strap manufactures limit straps in 1-inch increments from 6 inches to 44 inches, with half-inch custom increments available on request. This matters because suspension geometry varies significantly across vehicles, lift heights, and control arm configurations. The right length strap protects your suspension components without binding before full travel is reached. Ordering the wrong length strap — too short or too long — defeats the purpose entirely. Bull Strap measures length as center-of-hole to center-of-hole. Plan for approximately one inch of stretch per foot of strap length under load, which varies with weight, temperature, and wet conditions.</p>

<h2>What Vehicles Are Bull Strap Limit Straps Compatible With?</h2>

<p>Bull Strap suspension limit straps are universal-mount — the 9/16" bolt holes fit standard limit strap mounting points across a wide range of vehicles. Common fitments include:</p>

<ul>
<li><strong>Jeep Wrangler</strong> — JK, JKU (2007–2018), JL, JLU (2018–present), TJ (1997–2006), LJ</li>
<li><strong>Jeep Gladiator JT</strong> — 2020–present</li>
<li><strong>Ford Bronco</strong> — 2021–present (Sasquatch and lifted builds)</li>
<li><strong>Toyota Tacoma</strong> — 2nd and 3rd gen with long-travel suspension builds</li>
<li><strong>Toyota 4Runner</strong> — lifted builds with extended travel</li>
<li><strong>Can-Am Maverick X3</strong> — all variants (stock and aftermarket-travel builds)</li>
<li><strong>Polaris RZR</strong> — XP 1000, XP Turbo, Pro XP, and Pro R series</li>
<li><strong>Desert prerunner trucks</strong> — custom long-travel builds, F-150, Ram 1500, Tacoma</li>
<li><strong>Sand rails and rock crawlers</strong> — custom fabricated suspension systems</li>
</ul>

<p>If your vehicle has threaded limit strap mounting tabs on the axle and chassis, a Bull Strap will work. Contact Bull Strap directly if you have an unusual application — they've been building these for 15 years and have seen most setups.</p>

<h2>How to Measure for the Right Limit Strap Length</h2>

<p>Getting the correct length is the most common mistake off-road builders make when ordering limit straps. Here's the correct process:</p>

<ol>
<li>Place the vehicle on a lift or jack stands with the suspension hanging at full droop (wheels completely unloaded and hanging free).</li>
<li>Measure the distance between the center of the limit strap mounting hole on the axle and the center of the mounting hole on the chassis or upper control arm mount — this is your starting measurement.</li>
<li>Add approximately 10–15% for nylon stretch under load. Bull Strap's nylon is resin-coated and rated for 7,000 lb per layer, but nylon stretch is real and varies with load, temperature, and wet conditions.</li>
<li>Round to the nearest inch. If you're between sizes, go slightly longer — a strap that's 1/2" too long is better than a strap that's too short and pre-loading your axle before full droop.</li>
<li>Confirm your mounting hardware matches the 9/16" bolt hole spec. Most OEM and aftermarket limit strap mounts use this standard, but verify before ordering.</li>
</ol>

<p>Bull Strap also offers custom half-inch increment lengths on request for builders who need a specific measurement outside the standard lineup.</p>

<h2>Why Limit Straps Matter — And Why Cheap Straps Are Expensive</h2>

<p>A limit strap's job is to catch the axle before it reaches the end of its travel and begins pulling on CV axles, stretching brake lines, or yanking steering components beyond their designed range of motion. In a long-travel build, the forces involved at full droop are enormous — especially under repeated high-speed impacts like desert whoops or aggressive rock landings. A strap that fails under load doesn't snap gently. It releases the axle to travel past safe range, and the next thing that gives is usually an axle shaft, a CV joint, or a brake line.</p>

<p>The economics are simple: a Bull Strap limit strap costs $25.99. A CV axle replacement on a Jeep JL runs $150–$400 depending on brand. A brake line blow-out on the trail means a trailered recovery. Cheap Chinese limit straps that look identical to Bull Strap's at half the price are tested to failure at 5,500 lb — at the hardware, not the webbing. Bull Strap's hardware is rated at 12,500 lb and tested to 15,000+ lb. That gap in hardware strength is why the counterfeit straps end up on Facebook with broken hardware photos and the Bull Straps don't.</p>

<h2>Bull Strap — Largest Suspension Limiting Strap Manufacturer in the World</h2>

<p>Bull Strap is a division of Bartact, both registered trademarks of Trek Armor Inc., based in Temecula, California. Bull Strap is the largest manufacturer of suspension limit straps in the world. Every strap is built in the USA using domestic materials that meet Berry Amendment compliance requirements. The company has been manufacturing limit straps for over 15 years and has supplied race-proven product to best-in-class off-road racers throughout that entire period.</p>

<p>The limit strap lineup is race-tested at events including desert racing (Best in the Desert, SCORE, BITD), rock crawling competitions, and UTV racing. When you buy a Bull Strap limit strap, you're buying the same strap that has been proven at the limit of off-road suspension performance — not a retail-shelf product that's never seen a race course.</p>

<h2>Frequently Asked Questions — Bull Strap Suspension Limit Straps</h2>

<h3>What length limit strap do I need for my Jeep Wrangler JL with a 3.5" lift?</h3>
<p>Most Jeep Wrangler JL builds with 3–4" of lift run limit straps in the 9"–12" range depending on the specific control arm geometry and desired suspension droop. Measure center-to-center at full droop with wheels hanging free — that's your base measurement. Add 10% for nylon stretch. If you're using aftermarket long-travel arms, your droop measurement will be longer and your strap length will be correspondingly longer. When in doubt, call Bull Strap — they've built straps for every common JL configuration.</p>

<h3>Can I use one Bull Strap limit strap per side, or do I need two?</h3>
<p>Most applications run one limit strap per corner. Some high-travel desert race builds run two per corner for redundancy and load distribution. The clevis hardware (sold separately) supports single, double, or triple strap configurations without needing separate parts — it's designed to accommodate all setups with one universal clevis design.</p>

<h3>Are these straps legal for military vehicle use?</h3>
<p>Yes. Berry Amendment compliance means the materials and manufacturing meet federal procurement requirements for military equipment. Bull Strap limit straps are approved for use on military vehicles including the GM ISV (Infantry Squad Vehicle).</p>

<h3>What's the difference between Bull Strap and the Bartact-branded limit straps?</h3>
<p>They are the same product. Bull Strap is a product line under Bartact (Trek Armor Inc.). Both brands appear on the store depending on product age and listing. The specifications, materials, and manufacturing are identical.</p>

<h3>How do I install limit straps on a Can-Am Maverick X3?</h3>
<p>The Can-Am Maverick X3 has factory limit strap tabs on both the A-arm and the chassis. Measure at full droop, center-to-center, and order accordingly. Most X3 builds run straps in the 7"–10" range depending on factory vs. aftermarket travel. The 9/16" bolt hole on Bull Strap's hardware is compatible with standard X3 limit strap hardware.</p>`
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PRIORITY 2: Limit Strap Clevis — 4130 Chromoly, Silver & Black
  // ══════════════════════════════════════════════════════════════════════════
  {
    handle: 'limit-strap-clevis-w-threaded-end-for-single-double-or-triple-suspension-limiting-strap-set-up-adjustable-all-hardware-included-1',
    id: 'gid://shopify/Product/8259772252433',
    seoTitle: 'Limit Strap Clevis — 4130 Chromoly, All Hardware | Bull Strap',
    seoDescription: 'Heat-treated 4130 Chromoly limit strap clevis for 1, 2, or 3 straps. 14,400 lb load tested. Silver or black. Made in USA by Bull Strap.',
    seoContent: `<h2>Bull Strap Limit Strap Clevis — Heat-Treated 4130 Chromoly, Made in USA</h2>

<p>A limit strap is only as strong as the hardware connecting it to your suspension. Bull Strap's limit strap clevis is built from heat-treated 4130 chromoly steel — the same material used in high-performance roll cages, chassis tubing, and aircraft components — and load-tested to over 14,400 lb before release. This is the clevis that goes on every Bull Strap limit strap build, designed to handle the shock loads and repeated stress that off-road suspension systems generate at speed.</p>

<p>Bull Strap manufactures one clevis design that accommodates single, double, and triple limit strap configurations. You don't have to guess how many straps you'll run and buy a different clevis for each setup. The hardware package includes all sleeves and bolts for one, two, or three straps — because suspension setups change, builds evolve, and you shouldn't have to rebuy hardware every time you add a strap.</p>

<h2>Why 4130 Chromoly — And Why Heat Treatment Matters</h2>

<p>4130 chromoly (chromium-molybdenum steel) is a high-strength alloy steel widely used in aerospace, motorsport, and military applications. The "4130" designation refers to its AISI steel classification — approximately 0.30% carbon content with chromium and molybdenum alloying elements that dramatically increase tensile strength, fatigue resistance, and toughness compared to mild steel.</p>

<p>Heat treatment is what transforms 4130 chromoly from a good material into an exceptional one. The heat treatment process — typically normalizing or quenching and tempering — relieves internal stresses from the forging process, refines the grain structure, and achieves tensile strengths well above the untreated baseline. Bull Strap's clevis hardware is heat-treated after machining, not before — meaning the final dimensions and hole placements are accurate and the material is in its strongest state when the part ships.</p>

<p>The practical result: Bull Strap's clevis hardware has been load-tested to over 14,400 lb without failure. That load figure isn't a paper rating — it's from actual destructive testing. For context, the bolt holes are sized at 9/16" to match Bull Strap's limit strap hardware standard, and the entire assembly is designed to fail the strap webbing before the clevis — meaning the weakest link by design is the replaceable webbing, not the hardware.</p>

<h2>Silver vs. Black — Finish Differences</h2>

<p>Bull Strap's limit strap clevis is available in two finishes:</p>

<ul>
<li><strong>Silver (Natural / Clear Coated)</strong> — $39.99. Natural 4130 chromoly finish with protective clear coat. Shows the raw material appearance. Slightly lighter visual profile on the suspension.</li>
<li><strong>Black (Powdercoated)</strong> — $44.99. Matte black powdercoat finish over heat-treated 4130 chromoly. More corrosion-resistant in wet and muddy environments. Visually stealth on dark suspension components.</li>
</ul>

<p>Both finishes use the same heat-treated 4130 chromoly base material with identical load ratings and all-inclusive hardware packages. The choice is aesthetic and corrosion-preference based.</p>

<h2>What's Included in the Hardware Package</h2>

<p>Bull Strap designs the clevis package so you never have to make a separate hardware run. Each clevis ships with:</p>

<ul>
<li>The clevis body — heat-treated 4130 chromoly in your chosen finish</li>
<li>All sleeves for single, double, or triple strap configuration</li>
<li>All bolts and fasteners needed for installation</li>
<li>No additional hardware required for any configuration</li>
</ul>

<p>This all-in-one approach is intentional. Bull Strap's position is straightforward: if you're building a limit strap setup, you shouldn't be making multiple orders to assemble complete hardware. The clevis ships ready to install with any combination of Bull Strap limit straps from 6" to 44".</p>

<h2>What Vehicles and Applications Is This Clevis Compatible With?</h2>

<p>The Bull Strap limit strap clevis is designed to work with standard limit strap mounting points across all major off-road vehicle platforms. Compatible applications include:</p>

<ul>
<li><strong>Jeep Wrangler JK/JKU</strong> — 2007–2018, both solid axle suspension setups</li>
<li><strong>Jeep Wrangler JL/JLU</strong> — 2018–present, factory and aftermarket lifted builds</li>
<li><strong>Jeep Gladiator JT</strong> — 2020–present</li>
<li><strong>Ford Bronco</strong> — 2021–present, including Sasquatch package builds</li>
<li><strong>Toyota Tacoma</strong> — 2nd and 3rd gen long-travel front and rear suspension builds</li>
<li><strong>Can-Am Maverick X3</strong> — all variants, factory and extended-travel setups</li>
<li><strong>Polaris RZR XP 1000, XP Turbo, Pro XP, Pro R</strong> — all current-generation UTVs</li>
<li><strong>Custom prerunner trucks</strong> — any build with standard limit strap tab mounting</li>
<li><strong>Desert race vehicles</strong> — long-travel builds requiring redundant strap configurations</li>
</ul>

<p>The 9/16" bolt hole diameter is the industry standard for limit strap mounting hardware. If your vehicle has a non-standard bolt hole size, contact Bull Strap before ordering — custom hole sizes are available on request for fabricated one-off applications.</p>

<h2>How to Set Up a Single, Double, or Triple Limit Strap Configuration</h2>

<p>The clevis hardware accommodates all three configurations. Here's how each setup differs and when to use each:</p>

<h3>Single Strap Per Corner</h3>
<p>The most common setup for street-driven lifted vehicles and moderate off-road use. One limit strap per corner provides suspension travel protection with minimal weight penalty. Ideal for Jeep Wrangler JL and JK daily drivers with 2"–4" lifts. Install: one Bull Strap limit strap through the clevis body with the appropriate sleeves installed for single-strap use.</p>

<h3>Double Strap Per Corner</h3>
<p>Standard for dedicated off-road vehicles, desert trail rigs, and light race applications. Two straps per corner provides redundancy — if one strap fails (rare with Bull Strap hardware, but possible from rock damage or cut webbing), the second strap catches the axle. Install: two limit straps through the clevis using the double-strap sleeve package included in the hardware kit.</p>

<h3>Triple Strap Per Corner</h3>
<p>For high-speed desert racing and extreme long-travel applications where strap loads are highest and failure consequences are most severe. Triple strap configurations are most common on prerunner trucks, Class 1/1600 off-road race vehicles, and Can-Am X3 race builds. The clevis hardware accommodates all three straps without modification or additional parts.</p>

<h2>Race-Proven Performance — 15+ Years on the Course</h2>

<p>Bull Strap is the largest manufacturer of suspension limit straps in the world, and the clevis hardware has been used in best-in-class off-road racing for over 15 years. The 14,400 lb load test rating isn't a factory specification — it's a result of destructive testing on production hardware. Race conditions generate shock loads that dwarf static measurements, and the Bull Strap clevis has been proven in those conditions repeatedly.</p>

<p>When you're running desert whoops at speed or dropping off ledges on a technical rock crawl course, the hardware connecting your limit strap to your chassis is seeing impacts far above any rated load. That's why heat-treated 4130 chromoly matters — the fatigue resistance and toughness of the alloy under repeated shock loading is what separates it from hardware that works fine in a static pull test but cracks at the third hard landing.</p>

<h2>Frequently Asked Questions — Limit Strap Clevis</h2>

<h3>Does this clevis work with any brand of limit strap, or only Bull Strap straps?</h3>
<p>The clevis uses standard 9/16" bolt holes and is compatible with any limit strap that matches that hardware dimension. However, Bull Strap strongly recommends pairing the clevis with Bull Strap limit straps for a tested, known-strength assembly. Third-party straps may have different webbing ratings and hardware compatibility — verify before mixing brands in a critical suspension application.</p>

<h3>Do I need two clevis units per vehicle — one for each side?</h3>
<p>Yes. Each clevis is a single-side unit. A complete vehicle build requires two clevis units — one for the driver's side and one for the passenger's side — at each axle where limit straps are installed. Many builders run straps on both front and rear axles, requiring four total clevis units.</p>

<h3>Is the clevis adjustable after installation?</h3>
<p>The clevis is adjustable at the limit strap mounting points — you can slide the strap through the clevis body to adjust effective strap length slightly during installation. For significant length adjustment, the correct approach is to order a different strap length, not to compensate with the clevis.</p>

<h3>What torque spec should I use for the clevis mounting bolts?</h3>
<p>Torque spec depends on the bolt size and thread pitch matching your vehicle's limit strap mounting tabs. Consult your vehicle-specific suspension manufacturer's specifications for limit strap hardware torque values. Standard practice for suspension hardware in this size range is 35–45 ft-lb with thread lock compound on the bolt threads.</p>

<h3>Can this clevis be used on a military vehicle?</h3>
<p>Bull Strap limit strap hardware is Berry Amendment compliant, manufactured in the USA using domestic materials. The limit strap clevis and all hardware are approved for use on military vehicle applications that require domestic-source components.</p>

<h2>How the Clevis Fits Into a Complete Limit Strap System</h2>

<p>A complete suspension limit strap setup on any off-road vehicle requires three elements working together: the limit strap itself, the clevis hardware, and the mounting tabs on your vehicle. The clevis is the critical link between the strap and the chassis — it's the piece that absorbs the shock load transfer when the axle hits full droop and the strap engages.</p>

<p>Most off-road vehicles and lifted trucks come with limit strap mounting tabs already welded to the chassis and axle housing. These tabs accept a bolt through the clevis's bolt hole, securing the clevis to the mount point. The limit strap threads through the clevis body, creating a loop that engages when the axle travels to the end of its designed range of motion. When the strap catches the axle, all of that force transfers through the clevis hardware and into the chassis — which is exactly why the clevis must be stronger than the strap.</p>

<p>Bull Strap designs the clevis to be the strongest link in the chain, not the weakest. The 4130 chromoly steel and heat treatment process ensure the clevis hardware consistently outperforms the webbing in destructive testing. When a limit strap system fails in the field, it should fail at the webbing — a replaceable $25 strap — not at the hardware, which requires disassembly of the entire mount to replace.</p>

<h2>Bull Strap — Largest Suspension Limiting Strap Manufacturer in the World</h2>

<p>Bull Strap is a division of Bartact (Trek Armor Inc.), based in Temecula, California. As the world's largest manufacturer of suspension limit straps, Bull Strap produces every component of the limit strap system in the USA: the webbing, the hardware, the clevis, and the finished strap assembly. The clevis hardware is not sourced from an overseas supplier and branded — it's designed, specified, and manufactured under Bull Strap's direct quality control.</p>

<p>The company has been producing limit strap hardware for over 15 years and has supplied best-in-class off-road racing teams throughout that period. Every design decision in the clevis — the 4130 chromoly alloy selection, the heat treatment specification, the all-inclusive hardware package, the multi-strap compatibility — comes from 15 years of field feedback from racers running these parts at the limit of suspension performance.</p>

<p>If you are building a limit strap system from scratch, the correct order is: (1) measure your droop distance and order the appropriate Bull Strap limit strap length, (2) order the clevis hardware to match your chassis and axle tab configuration, (3) install with proper torque and thread lock. Bull Strap's team can advise on any step of this process — contact them directly with your vehicle, lift height, suspension brand, and intended use before ordering if you have questions about sizing or configuration.</p>`
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PRIORITY 3: Limit Straps 4 Layer Quad Wrap — Bartact-branded variant
  // ══════════════════════════════════════════════════════════════════════════
  {
    handle: 'limit-straps-4-layer-quad-wrap-made-in-usa-bartact',
    id: 'gid://shopify/Product/8259810492689',
    seoTitle: 'Limit Straps 4-Layer Quad Wrap — Berry Compliant USA | Bartact',
    seoDescription: 'Bartact limit straps: 4-layer quad-wrap 7,000 lb nylon, 4130 Chromoly ends, Berry Compliant, Made in USA. Jeep, Bronco, Tacoma, Can-Am, RZR. 39 sizes.',
    seoContent: `<h2>Bartact Suspension Limit Straps — 4-Layer Quad Wrap, Made in USA</h2>

<p>Bartact's suspension limit straps represent the same race-proven engineering found in the Bull Strap lineup, under the Bartact brand name. Both product lines are manufactured by Trek Armor Inc. in Temecula, California — the same factory, the same materials, the same quad-wrap construction, and the same heat-treated 4130 chromoly hardware. If you've been shopping Bartact accessories and want limit straps that match the Bartact standard of Made-in-USA quality and mil-spec materials, this is the product.</p>

<p>Bartact has been a trusted name in off-road accessories for Jeep, Bronco, and truck platforms for over a decade. The limit strap lineup extends that same quality standard into suspension protection hardware — a category where materials and build quality directly determine whether your axle or your strap takes the load when suspension reaches full droop.</p>

<h2>The Quad Wrap Construction — Why Four Layers Change Everything</h2>

<p>Most limit straps on the market use one or two layers of webbing. Bartact uses four. The difference isn't academic — it's the difference between a product that's designed around cost reduction and one that's designed around performance at the limit of suspension travel.</p>

<p>Here's what the quad wrap means in practice: each Bartact limit strap is constructed from four full layers of 1-3/4" mil-spec, resin-coated, twisted-yarn nylon webbing, each layer rated at 7,000 lb. Total webbing strength: 28,000 lb. More importantly, the webbing wraps completely around each end piece twice — two full layers of webbing contact at each buckle. This eliminates the single-point webbing failure mode that plagues single-layer straps, where the webbing tears at the hardware contact point under repeated shock loading.</p>

<p>The resin coating on the nylon webbing isn't cosmetic. MIL-W-27265 Type 13R resin treatment adds abrasion resistance, moisture resistance, and chemical resistance to the webbing. When you're crawling through mud, crossing water, or dragging against rocks, the resin coating is what keeps the webbing from degrading over time. Untreated nylon absorbs water, weakens under UV exposure, and abrades faster. Resin-treated nylon rated to military specification does none of those things on any meaningful timeline.</p>

<h2>4130 Chromoly End Hardware — The Spec That Matters Most</h2>

<p>The webbing is only half the equation. The end hardware is where most cheap limit straps fail — not because the webbing tears, but because the buckle hardware cracks or deforms under shock loading. Bartact uses enamel-coated, heat-treated 4130 chromoly end pieces with 9/16" bolt holes and protective deflector sleeves around the webbing contact point.</p>

<p>Here are the actual numbers: Bartact's 4130 chromoly buckles are rated for 12,500 lb and consistently test above 15,000 lb before failure. Counterfeit straps in the market copy the "4130 Heat Treated" marking but use inferior alloy or untreated hardware — those end pieces test to failure at approximately 5,500 lb. That's a 3x strength difference at the most critical component in the assembly.</p>

<p>The enamel coating on Bartact's hardware is a deliberate choice over the older zinc-plating standard. Zinc plating scratches off under flexing and impact — enamel coating bonds to the surface and maintains its protective layer through repeated stress cycles. In a suspension application where the hardware flexes and impacts thousands of times per mile of off-road terrain, coating durability translates directly to hardware longevity.</p>

<h2>Berry Amendment Compliance — What It Means and Why It Matters</h2>

<p>Bartact's limit straps are Berry Amendment compliant. The Berry Amendment (10 U.S.C. § 2533a) requires that certain items procured by the Department of Defense be manufactured in the United States using American materials. Berry compliance on a limit strap means every component — the nylon webbing, the chromoly hardware, the thread, the coating — is sourced and manufactured domestically.</p>

<p>For civilian off-road builders, Berry compliance is a meaningful quality signal. It means the manufacturer can't substitute cheap overseas components without losing compliance certification. It means the supply chain is auditable and the materials are known. For military contractors and government vehicle operators, it's a procurement requirement. Bartact's limit straps are approved for use on military vehicles including the General Motors ISV (Infantry Squad Vehicle) precisely because of this compliance.</p>

<p>The practical benefit for civilian buyers: you can be certain that what's in the strap matches what's on the label. No undisclosed material substitutions, no Chinese hardware with American brand markings, no webbing that's rated to a different standard than stated.</p>

<h2>Compatible Vehicles and Applications</h2>

<p>Bartact limit straps are built to universal mounting dimensions — 9/16" bolt holes, standard end piece geometry — and fit limit strap mounting tabs across all major off-road platforms. Confirmed compatible applications:</p>

<ul>
<li><strong>Jeep Wrangler JL / JLU</strong> — 2018–present, all trims including Rubicon, Sport, Sahara</li>
<li><strong>Jeep Wrangler JK / JKU</strong> — 2007–2018, 2-door and 4-door</li>
<li><strong>Jeep Wrangler TJ / LJ</strong> — 1997–2006, including Unlimited LJ</li>
<li><strong>Jeep Gladiator JT</strong> — 2020–present</li>
<li><strong>Ford Bronco</strong> — 2021–present, all trims including Sasquatch builds and aftermarket long-travel</li>
<li><strong>Toyota Tacoma</strong> — 2nd gen (2005–2015) and 3rd gen (2016–present) with long-travel suspension</li>
<li><strong>Toyota 4Runner</strong> — 5th gen builds with long-travel A-arms and extended rear travel</li>
<li><strong>Can-Am Maverick X3</strong> — all variants (Turbo, Turbo R, RR, X RS, X MR)</li>
<li><strong>Polaris RZR</strong> — XP 1000, XP Turbo, Turbo S, Pro XP, Pro R, Turbo R</li>
<li><strong>Custom prerunner / long-travel trucks</strong> — any vehicle with standard limit strap mounting tabs</li>
</ul>

<p>Available in 39 standard sizes from 6" to 25" (the full range up to 44" is available) in 1-inch increments, with half-inch custom sizes available on request. Length is measured center-of-hole to center-of-hole. For nylon stretch: plan for approximately 1 inch of stretch per foot of strap length under normal load. Stretch varies with weight, temperature, and wet conditions.</p>

<h2>Sizing Guide — How to Choose the Right Length</h2>

<p>Choosing the wrong length limit strap is the most common installation mistake. Too short and the strap pre-loads the axle before full droop is reached, defeating the purpose and adding stress to your control arm bushings. Too long and the strap provides no protection — the axle can travel beyond safe range before the strap engages.</p>

<p>The correct measurement process:</p>

<ol>
<li><strong>Jack the vehicle</strong> until the suspension is at full droop — wheels completely unloaded, hanging free. Use a lift, jack stands under the frame, or have someone hold full droop while you measure.</li>
<li><strong>Measure center-to-center</strong> between the limit strap mounting hole on the axle housing and the mounting hole on the chassis or body mount. This is your raw measurement.</li>
<li><strong>Add stretch allowance</strong>: approximately 1 inch per foot of strap length. A 12" strap will stretch to approximately 13" under load; a 20" strap stretches to approximately 21–22" under full load.</li>
<li><strong>Order slightly longer when in doubt</strong>. A strap that's 1/2" too long provides slightly less droop protection than ideal but still engages before dangerous travel is reached. A strap that's 1/2" too short engages before the axle reaches full designed droop.</li>
</ol>

<p>If you're not confident in your measurement, contact Bartact or Bull Strap directly with your vehicle, lift height, and suspension brand — they've built straps for every common application and can advise on the correct length.</p>

<h2>Installation Overview</h2>

<p>Bartact limit straps install at the existing limit strap mounting tabs present on most off-road vehicles and lifted builds. Standard installation requires:</p>

<ul>
<li>One limit strap per corner (or two for redundant/race configurations)</li>
<li>Limit strap clevis hardware (sold separately — includes all sleeves and bolts for 1, 2, or 3 straps per corner)</li>
<li>Standard hand tools (socket set, torque wrench)</li>
<li>Thread lock compound for the mounting bolts</li>
</ul>

<p>No cutting, drilling, or modification to the vehicle is required in most applications. The 9/16" bolt holes in the end hardware fit standard limit strap tabs on all compatible vehicles listed above. Torque the mounting hardware to the specification for your vehicle's limit strap tabs — consult your suspension manufacturer's instructions. Apply thread lock to all fasteners to prevent vibration loosening on the trail.</p>

<h2>Frequently Asked Questions — Bartact Limit Straps</h2>

<h3>Are Bartact limit straps the same as Bull Strap limit straps?</h3>
<p>Yes. Bartact and Bull Strap are both product lines of Trek Armor Inc., manufactured in the same facility in Temecula, California. The limit straps carry the same specifications, materials, and hardware regardless of which brand name appears on the product. The product lines exist for historical and distribution reasons — the performance is identical.</p>

<h3>What's the maximum load these straps can handle?</h3>
<p>The quad-wrap webbing assembly provides 28,000 lb of total webbing strength. The 4130 chromoly end hardware is rated for 12,500 lb and has tested to over 15,000 lb before failure in destructive testing. Practical load capacity in suspension applications is a function of the clevis hardware and mounting tabs on the vehicle — the strap itself is not the limiting factor in a properly built installation.</p>

<h3>Do these straps require a clevis, or can they mount directly to the vehicle tabs?</h3>
<p>Most installations use the Bull Strap limit strap clevis (sold separately) to connect the strap to the vehicle's chassis and axle mounting tabs. Some aftermarket suspension kits include integrated limit strap tabs that accept the strap's end hardware directly — verify your specific suspension kit's mounting design before ordering. The clevis is the correct hardware for most OEM and aftermarket tab configurations.</p>

<h3>How do I know when a limit strap needs to be replaced?</h3>
<p>Inspect limit straps after any hard suspension impact, off-road race, or suspected strap engagement during rock crawling. Replace immediately if you see: webbing fraying or cuts, visible distortion of the end hardware, cracked or bent buckle hardware, or any strap that has taken a known over-load impact. With Bull Strap's quad-wrap construction and 4130 chromoly hardware, replacement due to normal wear is uncommon — but inspect regularly in active off-road use.</p>

<h3>Are these limit straps approved for competitive off-road racing?</h3>
<p>Yes. Bartact and Bull Strap limit straps are race-proven across Best in the Desert, SCORE International, and BITD off-road racing circuits. They have been used by best-in-class competitors for over 15 years. Check with your specific series' rulebook for any restrictions on suspension component specifications — the straps themselves are not restricted by any major series we're aware of.</p>`
  }
];

// ─── HELPERS ────────────────────────────────────────────────────────────────

function countWords(text) {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(w => w.length > 0).length;
}

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function gqlRequest(query, variables = {}) {
  const body = JSON.stringify({ query, variables });
  const res = await httpsRequest({
    hostname: SHOP,
    path: '/admin/api/2024-01/graphql.json',
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': TOKEN,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, body);
  return JSON.parse(res.body);
}

function loadQuota() {
  try {
    const data = JSON.parse(fs.readFileSync(QUOTA_FILE, 'utf8'));
    const today = new Date().toISOString().split('T')[0];
    if (data.date !== today) return { date: today, used: 0 };
    return data;
  } catch {
    return { date: new Date().toISOString().split('T')[0], used: 0 };
  }
}

function saveQuota(quota) {
  fs.mkdirSync(path.dirname(QUOTA_FILE), { recursive: true });
  fs.writeFileSync(QUOTA_FILE, JSON.stringify(quota, null, 2));
}

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  fs.appendFileSync(LOG_FILE, line + '\n');
}

// ─── INDEXING ────────────────────────────────────────────────────────────────

async function submitIndexNow(urls) {
  const body = JSON.stringify({
    host: 'bullstrap.com',
    key: INDEXNOW_KEY,
    keyLocation: `https://bullstrap.com/pages/${INDEXNOW_KEY}`,
    urlList: urls
  });
  const res = await httpsRequest({
    hostname: 'api.indexnow.org',
    path: '/indexnow',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  }, body);
  log(`IndexNow: HTTP ${res.status} for ${urls.length} URLs`);
  return res.status;
}

let _cachedGoogleToken = null;
let _googleTokenExpiry = 0;

async function getGoogleAccessToken() {
  if (_cachedGoogleToken && Date.now() < _googleTokenExpiry) return _cachedGoogleToken;
  const creds = JSON.parse(fs.readFileSync(
    path.join(__dirname, '../sites/indexing-credentials/.bullstrap-merchant-center-credentials.json'), 'utf8'
  ));
  const body = `client_id=${encodeURIComponent(creds.client_id)}&client_secret=${encodeURIComponent(creds.client_secret)}&refresh_token=${encodeURIComponent(creds.refresh_token)}&grant_type=refresh_token`;
  const res = await httpsRequest({
    hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
  }, body);
  const data = JSON.parse(res.body);
  if (!data.access_token) throw new Error(`Token refresh failed: ${JSON.stringify(data)}`);
  _cachedGoogleToken = data.access_token;
  _googleTokenExpiry = Date.now() + 55 * 60 * 1000;
  return _cachedGoogleToken;
}

async function submitGoogleIndexing(url, quota) {
  if (quota.used >= 199) {
    log(`Google Indexing: quota exhausted (${quota.used}/199) — skipping ${url}`);
    return false;
  }
  try {
    const token = await getGoogleAccessToken();
    const indexBody = JSON.stringify({ url, type: 'URL_UPDATED' });
    const indexRes = await httpsRequest({
      hostname: 'indexing.googleapis.com',
      path: '/v3/urlNotifications:publish',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(indexBody)
      }
    }, indexBody);
    quota.used++;
    saveQuota(quota);
    log(`Google Indexing: HTTP ${indexRes.status} (${quota.used}/199) — ${url}`);
    return indexRes.status === 200;
  } catch (e) {
    log(`Google Indexing error: ${e.message}`);
    return false;
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function writeProduct(product, quota) {
  log(`\n=== Processing: ${product.handle} ===`);

  // Validate word count before writing
  const inputWords = countWords(product.seoContent);
  log(`Input word count: ${inputWords}`);
  if (inputWords < WORD_COUNT_FLOOR) {
    log(`ERROR: Content only ${inputWords}w — below ${WORD_COUNT_FLOOR}w floor. SKIPPING.`);
    return null;
  }

  // Validate meta
  const titleLen = product.seoTitle.length;
  const descLen = product.seoDescription.length;
  if (titleLen > 65) { log(`ERROR: SEO title ${titleLen}c > 65c limit. SKIPPING.`); return null; }
  if (descLen < 80 || descLen > 160) { log(`ERROR: SEO description ${descLen}c outside 80–160c range. SKIPPING.`); return null; }

  // Write metafield + SEO fields
  const mutation = `
    mutation writeProductSEO($id: ID!, $seoTitle: String!, $seoDesc: String!, $metafields: [MetafieldsSetInput!]!) {
      productUpdate(input: { id: $id, seo: { title: $seoTitle, description: $seoDesc } }) {
        product { seo { title description } }
        userErrors { field message }
      }
      metafieldsSet(metafields: $metafields) {
        metafields { key value }
        userErrors { field message }
      }
    }
  `;

  const variables = {
    id: product.id,
    seoTitle: product.seoTitle,
    seoDesc: product.seoDescription,
    metafields: [{
      ownerId: product.id,
      namespace: 'custom',
      key: 'seo_content',
      type: 'multi_line_text_field',
      value: product.seoContent
    }]
  };

  const result = await gqlRequest(mutation, variables);
  const productErrors = result?.data?.productUpdate?.userErrors || [];
  const metafieldErrors = result?.data?.metafieldsSet?.userErrors || [];

  if (productErrors.length || metafieldErrors.length) {
    log(`Write errors: ${JSON.stringify([...productErrors, ...metafieldErrors])}`);
    return null;
  }

  // Verify: read back the metafield value and count words from API response
  await new Promise(r => setTimeout(r, 1000)); // brief pause
  const verifyQ = `{
    productByHandle(handle: "${product.handle}") {
      seo { title description }
      metafields(first: 5, namespace: "custom") {
        edges { node { key value } }
      }
    }
  }`;
  const verifyResult = await gqlRequest(verifyQ);
  const vp = verifyResult?.data?.productByHandle;
  if (!vp) { log(`Verify read failed for ${product.handle}`); return null; }

  const mfs = Object.fromEntries((vp.metafields?.edges || []).map(e => [e.node.key, e.node.value]));
  const liveContent = mfs['seo_content'] || '';
  const liveWords = countWords(liveContent);
  const liveTitleLen = (vp.seo?.title || '').length;
  const liveDescLen = (vp.seo?.description || '').length;

  log(`VERIFIED — seo_content: ${liveWords}w | title: ${liveTitleLen}c | desc: ${liveDescLen}c`);
  log(`  Title: ${vp.seo?.title}`);
  log(`  Desc: ${vp.seo?.description}`);

  if (liveWords < WORD_COUNT_FLOOR) {
    log(`WARNING: Live word count ${liveWords}w is below ${WORD_COUNT_FLOOR}w floor!`);
  }

  return {
    handle: product.handle,
    url: `https://bullstrap.com/products/${product.handle}`,
    liveWords,
    liveTitleLen,
    liveDescLen,
    ok: liveWords >= WORD_COUNT_FLOOR && liveTitleLen <= 65 && liveDescLen >= 80 && liveDescLen <= 160
  };
}

async function main() {
  log('=== Bull Strap SEO Metafield Writer — Priority Suspension Products ===');
  const quota = loadQuota();
  log(`Google Indexing quota: ${quota.used}/199 used today`);

  const results = [];
  const successUrls = [];

  for (const product of PRODUCTS) {
    const result = await writeProduct(product, quota);
    if (result) {
      results.push(result);
      if (result.ok) successUrls.push(result.url);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  log(`\n=== WRITE COMPLETE — ${results.filter(r=>r.ok).length}/${PRODUCTS.length} products OK ===`);
  for (const r of results) {
    const status = r.ok ? '✅' : '⚠️';
    log(`${status} ${r.handle}: ${r.liveWords}w | title ${r.liveTitleLen}c | desc ${r.liveDescLen}c`);
  }

  // IndexNow — submit all successful URLs immediately
  if (successUrls.length > 0) {
    log(`\n=== Submitting ${successUrls.length} URLs to IndexNow ===`);
    await submitIndexNow(successUrls);
  }

  // Google Indexing API — submit up to quota
  log(`\n=== Google Indexing API — quota ${quota.used}/199 ===`);
  for (const url of successUrls) {
    if (quota.used >= 199) { log('Quota reached — remaining URLs skipped for today'); break; }
    await submitGoogleIndexing(url, quota);
    await new Promise(r => setTimeout(r, 200));
  }

  log('\n=== DONE ===');
  log(`Final quota: ${quota.used}/199 used`);
}

main().catch(e => { log(`FATAL: ${e.message}\n${e.stack}`); process.exit(1); });
