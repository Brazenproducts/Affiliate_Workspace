#!/usr/bin/env node
/**
 * Bartact SEO Content Expansion Script
 * Expands thin collection pages, publishes blog articles, submits IndexNow, sends Telegram summary.
 */

const https = require('https');

const SHOPIFY_TOKEN = 'REDACTED_SHOPIFY_TOKEN';
const SHOPIFY_STORE = 'bartact.myshopify.com';
const SHOPIFY_API = '2024-01';
const INDEXNOW_KEY = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';
const TELEGRAM_CHAT_ID = '7550065844';
// Token from task instructions (not in .env as TELEGRAM_TOKEN key)
const TELEGRAM_TOKEN = (() => {
  try {
    const fs = require('fs');
    const env = fs.readFileSync('/home/ubuntu/.openclaw/workspace/.env', 'utf8');
    const match = env.match(/TELEGRAM_TOKEN=(.+)/);
    if (match) return match[1].trim();
  } catch (e) {}
  return null;
})();

const results = {
  date: new Date().toISOString(),
  collections_updated: [],
  collections_failed: [],
  blog_articles_published: [],
  indexnow_submitted: [],
  telegram_sent: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// HTTP helpers
// ─────────────────────────────────────────────────────────────────────────────
function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function shopifyPut(path, payload) {
  const body = JSON.stringify(payload);
  const options = {
    hostname: SHOPIFY_STORE,
    path: `/admin/api/${SHOPIFY_API}/${path}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_TOKEN,
      'Content-Length': Buffer.byteLength(body),
    },
  };
  return httpRequest(options, body);
}

async function shopifyPost(path, payload) {
  const body = JSON.stringify(payload);
  const options = {
    hostname: SHOPIFY_STORE,
    path: `/admin/api/${SHOPIFY_API}/${path}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_TOKEN,
      'Content-Length': Buffer.byteLength(body),
    },
  };
  return httpRequest(options, body);
}

async function postJson(hostname, path, payload) {
  const body = JSON.stringify(payload);
  const options = {
    hostname,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };
  return httpRequest(options, body);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─────────────────────────────────────────────────────────────────────────────
// HTML content for each collection (600+ words each)
// ─────────────────────────────────────────────────────────────────────────────

const collectionContent = {

'jeep-wrangler-jl-seat-covers': `
<h2>Jeep Wrangler JL Seat Covers Built for the Trail</h2>
<p>If you're searching for the best <strong>jeep wrangler jl seat covers</strong>, you've come to the right place. Bartact designs and manufactures precision-fit seat covers specifically engineered for the Jeep Wrangler JL — including the 2-door and 4-door Unlimited models — right here in the USA. Whether you wheel hard on weekends or use your Wrangler as a daily driver, our seat covers deliver protection that keeps up with your lifestyle.</p>

<h2>Why JL-Specific Fit Matters</h2>
<p>The Jeep Wrangler JL (2018-present) introduced a redesigned interior with updated seat contours, side airbag positions, and new headrest geometries compared to the outgoing JK. Generic seat covers simply don't account for these differences. Bartact's JL-specific patterns are cut from digital measurements taken directly from JL seats, ensuring a snug, wrinkle-free fit that stays in place mile after mile — even on rock crawls, mud pits, and river crossings.</p>
<p>Our covers are fully compatible with JL side-impact airbags. Each seam is strategically placed to allow the airbag to deploy correctly in an emergency, so you never have to choose between protection and safety.</p>

<h2>Cordura vs. Neoprene vs. Faux Leather</h2>
<p>Many seat cover brands offer neoprene or faux leather options. While these materials have their place, Bartact's primary fabric — <strong>1000-denier Cordura nylon</strong> — outperforms them in nearly every off-road metric:</p>
<ul>
  <li><strong>Abrasion resistance:</strong> Cordura outlasts neoprene 4:1 in standardized rub tests. Gear, tools, and sandy gear shifters won't eat through Cordura.</li>
  <li><strong>Breathability:</strong> Neoprene traps heat. On a hot summer trail day, Cordura keeps you cooler by allowing airflow through the fabric.</li>
  <li><strong>Dryability:</strong> Faux leather cracks when repeatedly wet and dried. Cordura dries quickly and remains flexible in cold weather.</li>
  <li><strong>Odor resistance:</strong> Sweat and muddy water won't linger in Cordura the way they do in neoprene foam.</li>
</ul>
<p>For those who prefer a softer feel or maximum water resistance (think duck hunting or boat use), we also offer neoprene variants — but for dedicated off-road Jeep use, Cordura is our top recommendation.</p>

<h2>Proudly Made in the USA</h2>
<p>Every Bartact JL seat cover is cut, sewn, and quality-checked at our facility in the United States. We use American labor, American materials where available, and American quality standards. When you buy Bartact, you're supporting domestic manufacturing — and getting a product that reflects genuine pride in craftsmanship. No offshore cutting corners, no mystery fabrics.</p>

<h2>Features at a Glance</h2>
<ul>
  <li>Precision-fit pattern for Jeep Wrangler JL 2018-present (2-door &amp; 4-door Unlimited)</li>
  <li>Airbag-compatible stitching and seam placement</li>
  <li>1000-denier Cordura nylon or neoprene options</li>
  <li>MOLLE webbing panel options for attaching gear pouches</li>
  <li>Multiple color combinations to match your Jeep's interior or exterior theme</li>
  <li>Headrest covers included</li>
  <li>Machine-washable (Cordura variants)</li>
  <li>Lifetime warranty on workmanship</li>
</ul>

<h2>MOLLE-Ready Storage Integration</h2>
<p>Bartact's JL seat covers can be ordered with integrated MOLLE webbing panels on the front seat backs. This allows you to attach compatible pouches, organizers, and accessories directly to your seats — keeping maps, first aid kits, tools, and trail snacks within easy reach. Check out our <a href="/collections/molle-accessories">MOLLE accessories collection</a> for compatible add-ons.</p>

<h2>Frequently Asked Questions</h2>

<h3>Q: What's the difference between JL and JK seat covers?</h3>
<p>A: The JL uses a redesigned seat with different contours, side bolster shapes, and airbag integration points compared to the JK. JK covers will not fit the JL properly — you need JL-specific patterns like ours for a wrinkle-free, secure fit.</p>

<h3>Q: Are Bartact JL seat covers compatible with heated seats?</h3>
<p>A: Yes. Our Cordura covers are thin enough to allow heat transfer from the factory heated seat elements, so you won't notice a significant reduction in warmth.</p>

<h3>Q: Will the seat covers interfere with airbag deployment?</h3>
<p>A: No. Bartact covers are engineered specifically to allow proper side-impact airbag deployment. The seam placement follows the airbag deployment path so the bag can exit cleanly in an emergency.</p>

<h3>Q: How do I wash my Bartact seat covers?</h3>
<p>A: Cordura seat covers can be removed and machine washed in cold water on a gentle cycle. Air dry or tumble dry on low. Avoid bleach and high heat. Neoprene covers should be hand washed with mild soap and air dried.</p>

<h3>Q: Do I need to remove the seat to install them?</h3>
<p>A: No seat removal required. Bartact covers install directly over your factory seats using adjustable straps, hooks, and anchor points that route under the seat cushion and around the headrests. Most installs take 20-30 minutes per seat.</p>

<h2>Explore More Bartact Products</h2>
<p>Protect and personalize your entire Wrangler. Browse our full lineup of interior and exterior gear:</p>
<ul>
  <li><a href="/collections/jeep-seat-covers">All Jeep Seat Covers</a> — Find covers for JK, TJ, and other Jeep models</li>
  <li><a href="/collections/jeep-wrangler-seat-covers">Jeep Wrangler Seat Covers</a> — Full Wrangler lineup seat cover selection</li>
  <li><a href="/collections/jeep-accessories">Jeep Accessories</a> — Grab handles, storage bags, fire extinguisher mounts, and more</li>
  <li><a href="/collections/molle-accessories">MOLLE Accessories</a> — Compatible pouches, panels, and organizers for your MOLLE seat covers</li>
</ul>
`,

'toyota-tacoma-seat-covers': `
<h2>Toyota Tacoma Seat Covers That Go Where You Go</h2>
<p>Finding the perfect <strong>toyota tacoma seat covers</strong> means finding covers built specifically for the Tacoma's unique seat geometry — and that's exactly what Bartact delivers. Our Tacoma seat covers are precision-engineered for 2nd Gen (2005-2015) and 3rd Gen (2016-present) Tacomas, manufactured in the USA from the toughest fabrics available. Whether you're overlanding on forest roads, hauling gear to the job site, or just keeping your interior pristine, Bartact has you covered.</p>

<h2>Gen 2 and Gen 3 Tacoma — Why Fit Matters</h2>
<p>The Toyota Tacoma underwent significant interior redesigns between the 2nd and 3rd generations. Seat width, bolster height, headrest dimensions, and side airbag placements all differ. Using a generic or wrong-generation cover creates ugly bunching, slippage, and can even obstruct airbag deployment. Bartact's generation-specific patterns are cut from digital measurements taken directly from factory Tacoma seats, guaranteeing a tailored look and safe fit every time.</p>
<p>Our covers work on Access Cab, Double Cab, and Extended Cab configurations. Front row and rear bench/60-40 split options are available to cover every seating position.</p>

<h2>Cordura vs. Neoprene vs. Faux Leather for Tacoma Owners</h2>
<p>Tacoma owners are a diverse group — overlanders, hunters, construction workers, daily drivers. The seat cover material that's right for you depends on how you use your truck. Here's how Bartact's materials stack up:</p>
<ul>
  <li><strong>1000-Denier Cordura Nylon:</strong> The gold standard for abrasion resistance. Power tools, lumber, hunting gear, and sandy boots won't destroy Cordura. Breathable, quick-drying, and machine washable. Best for general off-road and work use.</li>
  <li><strong>Neoprene:</strong> Excellent water resistance — ideal for kayaking, fishing, or beach trips where soaking wet gear enters the cab. Slightly warmer in summer due to reduced breathability.</li>
  <li><strong>Faux Leather:</strong> Easy to wipe clean, professional appearance for fleet vehicles or work trucks. Not recommended for heavy abrasion or prolonged UV exposure — cracking is a long-term concern.</li>
</ul>
<p>For Tacoma owners who prioritize durability and all-weather versatility, Cordura is our top pick. For water-sport enthusiasts, neoprene is the way to go.</p>

<h2>Made in the USA — Bartact's Commitment</h2>
<p>Every Tacoma seat cover in the Bartact lineup is cut, sewn, and finished at our US manufacturing facility. We take pride in American craftsmanship and stand behind every stitch with a comprehensive warranty. Buying Bartact means supporting domestic jobs while getting a product built to a higher standard than overseas alternatives.</p>

<h2>Key Features</h2>
<ul>
  <li>Gen 2 (2005-2015) and Gen 3 (2016+) Tacoma-specific patterns</li>
  <li>Access Cab, Double Cab, and Extended Cab compatibility</li>
  <li>Side-impact airbag compatible seam placement</li>
  <li>1000-denier Cordura, neoprene, or faux leather options</li>
  <li>Optional MOLLE webbing panels for rear storage</li>
  <li>Multiple color and pattern configurations</li>
  <li>Machine washable (Cordura) or wipe-clean (faux leather)</li>
  <li>Limited lifetime warranty on workmanship</li>
</ul>

<h2>Installation Overview</h2>
<p>No tools, no seat removal required. Bartact Tacoma seat covers slip over your factory seats and secure with a combination of headrest loops, adjustable under-seat straps, and seat-back hooks. Most drivers complete a front and rear installation in under an hour. Detailed installation guides are included with every order, and video walkthroughs are available on the Bartact website.</p>

<h2>Frequently Asked Questions</h2>

<h3>Q: Will these fit my 2022 Tacoma TRD Pro?</h3>
<p>A: Yes. Our 3rd Gen patterns cover all 2016-present Tacoma trim levels, including TRD Pro, TRD Off-Road, Sport, SR5, and Limited. Seat dimensions are consistent across trims for the same cab configuration.</p>

<h3>Q: Do Bartact covers work with Tacoma heated seats?</h3>
<p>A: Yes. Cordura and neoprene materials are thin enough to allow heat transfer from factory heated seat elements. You may notice a slight reduction in warmth intensity, but functionality is maintained.</p>

<h3>Q: What is Bartact's warranty on Tacoma seat covers?</h3>
<p>A: Bartact offers a limited lifetime warranty covering workmanship defects — seam failures, zipper malfunctions, and fabric defects under normal use. Damage from misuse, chemical exposure, or improper washing is not covered.</p>

<h3>Q: Can I use these covers with aftermarket seat sliders or seat lift kits?</h3>
<p>A: In most cases, yes. As long as the seat cushion and backrest dimensions remain unchanged, the covers will fit. Contact our support team with specifics about your modification for confirmation.</p>

<h3>Q: How do I order the right configuration?</h3>
<p>A: Select your generation (Gen 2 or Gen 3), cab type (Access Cab or Double Cab), and which seats you need covered (front only, rear only, or full set). Use our product configurator or contact our team for help.</p>

<h2>Shop More Bartact Gear</h2>
<p>Outfit your entire Tacoma with American-made accessories built to last:</p>
<ul>
  <li><a href="/collections/jeep-seat-covers">All Seat Covers</a> — Seat covers for Jeep, Bronco, and more platforms</li>
  <li><a href="/collections/jeep-accessories">Off-Road Accessories</a> — Fire extinguisher mounts, grab handles, storage solutions</li>
  <li><a href="/collections/molle-accessories">MOLLE Accessories</a> — Add-on pouches and panels to maximize your storage</li>
  <li><a href="/collections/winch-covers">Winch Covers</a> — Protect your recovery gear investment with a quality winch cover</li>
</ul>
`,

'jeep-wrangler-grab-handles': `
<h2>Jeep Wrangler Grab Handles for Every Trail Situation</h2>
<p>The right set of <strong>jeep wrangler grab handles</strong> can make the difference between a white-knuckle trail ride and a confident, secure one. Bartact's Wrangler grab handles are built from mil-spec paracord and heavy-duty hardware, manufactured in the USA to withstand the forces generated during aggressive off-road use. Whether you're navigating rock ledges, creek crossings, or steep descents, a solid grab handle keeps passengers secure without cluttering the interior.</p>

<h2>Why Grab Handles Matter Off-Road</h2>
<p>Factory Jeep grab handles are designed for gentle highway turns — not for the lateral G-forces, vertical drops, and sudden jerks that come with real off-road driving. Many stock handles are thin plastic over nylon, and they flex or crack under heavy loads. Aftermarket passengers frequently report gripping door frames, roll bars, and windshield frames — none of which are designed to be handles and can compromise your grip or injure your hands.</p>
<p>Bartact grab handles mount directly to existing Wrangler roll bar anchor points and provide a purpose-built, load-rated grip point. They're positioned where your hands naturally reach and sized for a confident grip even with gloves on.</p>

<h2>Paracord Construction — Why It's Ideal</h2>
<p>Type III 550 paracord (military spec) is the backbone of Bartact's grab handles. Here's why it outperforms rubber, plastic, and woven nylon alternatives:</p>
<ul>
  <li><strong>Tensile strength:</strong> 550-lb minimum break strength per strand, woven into multi-strand configurations for handles rated well beyond typical passenger loads.</li>
  <li><strong>UV resistance:</strong> Paracord holds up to years of direct sun exposure without degrading or becoming brittle — critical for open-top Jeep use.</li>
  <li><strong>All-temperature performance:</strong> Unlike rubber, paracord remains flexible in sub-zero temperatures and doesn't soften or stretch excessively in summer heat.</li>
  <li><strong>Grip texture:</strong> The woven surface provides natural grip, especially when wet or muddy, without requiring rubberized coatings that peel over time.</li>
  <li><strong>Lightweight:</strong> Paracord handles add minimal weight — a critical consideration for serious wheelers tracking their build weight.</li>
</ul>

<h2>JL, JK, and TJ Compatibility</h2>
<p>Bartact grab handles are available for all major Wrangler generations:</p>
<ul>
  <li><strong>Jeep Wrangler JL (2018-present):</strong> Front and rear roll bar mount points, 2-door and 4-door Unlimited</li>
  <li><strong>Jeep Wrangler JK (2007-2018):</strong> Front and rear positions, 2-door and 4-door Unlimited</li>
  <li><strong>Jeep Wrangler TJ (1997-2006):</strong> Roll bar compatible configurations</li>
</ul>
<p>Select your generation when ordering. Hardware and strap lengths are generation-specific to ensure a tight, rattle-free fit.</p>

<h2>Made in the USA</h2>
<p>Every Bartact grab handle is assembled at our US facility using domestically sourced paracord and American-made hardware. No offshore production, no quality shortcuts. We stand behind every product with a satisfaction guarantee — if a handle fails under normal use, we make it right.</p>

<h2>Installation</h2>
<p>No drilling required. Bartact grab handles attach to existing factory roll bar anchor points using heavy-duty loop ends and stainless hardware. Installation typically takes under 10 minutes per handle with basic hand tools. Detailed instructions are included.</p>

<h2>Frequently Asked Questions</h2>

<h3>Q: What is the weight rating on Bartact grab handles?</h3>
<p>A: Our standard grab handles are load-tested to 500 lbs static load, well beyond the forces generated during normal off-road passenger use. They are not rated as climbing or fall-arrest anchors.</p>

<h3>Q: Will these fit my JK 4-door Unlimited?</h3>
<p>A: Yes. We offer JK-specific handles for both 2-door and 4-door Unlimited configurations. Select the JK option and specify 2-door or 4-door when ordering to get the correct strap lengths and hardware for your roll bar layout.</p>

<h3>Q: How does paracord compare to rubber grab handles?</h3>
<p>A: Rubber handles feel soft initially but crack and degrade with UV and temperature cycling. Paracord handles maintain consistent strength and flexibility across a wider temperature range, resist UV degradation, and provide better grip when wet or muddy.</p>

<h3>Q: Can I get custom color paracord?</h3>
<p>A: Yes. Bartact offers a wide range of paracord colors to match your Jeep's interior color scheme or exterior color. Check the product listing for available color options or contact us for custom orders.</p>

<h3>Q: How many grab handles do I need for a 4-door JL?</h3>
<p>A: Most 4-door JL owners install 4 handles — one at each front seat roll bar post and one at each rear roll bar post. Some owners also add additional handles for the cargo area or for children's reach heights. We sell handles individually and in sets.</p>

<h2>Explore More Bartact Accessories</h2>
<ul>
  <li><a href="/collections/jeep-grab-handles">All Jeep Grab Handles</a> — Full grab handle lineup for all Jeep models</li>
  <li><a href="/collections/jeep-accessories">Jeep Accessories</a> — Seat covers, storage bags, fire mounts, and more</li>
  <li><a href="/collections/molle-accessories">MOLLE Accessories</a> — Modular storage panels and pouches</li>
  <li><a href="/collections/jeep-wrangler-seat-covers">Jeep Wrangler Seat Covers</a> — Complete your interior build with precision-fit seat covers</li>
</ul>
`,

'fire-extinguisher-holders': `
<h2>Jeep Fire Extinguisher Mounts Built for the Trail</h2>
<p>Every serious off-road build should include a quality <strong>jeep fire extinguisher mount</strong>, and Bartact makes the most trusted mounts in the industry. Trail fires, electrical shorts, and fuel leaks can happen unexpectedly — having a fire extinguisher mounted and accessible can mean the difference between a quick snuff-out and a total loss. Bartact's fire extinguisher holders are engineered for secure, vibration-proof mounting on Jeep Wranglers, Gladiators, and other 4x4 platforms.</p>

<h2>Trail Safety Is Not Optional</h2>
<p>Off-road trails put unique stress on vehicle systems. Rocks can puncture fuel lines, battery terminals can arc against metal, and high-heat situations arise during sustained climbs or engine bay work. Trail etiquette and organized trail runs frequently require participants to carry fire extinguishers. Even if your trail club doesn't mandate it, a mounted extinguisher is one of the smartest safety investments in your build.</p>
<p>Bartact's mounts keep your extinguisher secured during the most violent trail conditions — no rattling, no bouncing loose, no risk of the extinguisher becoming a projectile during a rollover.</p>

<h2>Roll Bar and Cage Mounting</h2>
<p>Our fire extinguisher holders are designed for roll bar and cage mounting — the most secure and accessible locations in a Jeep interior. Roll bar mounting positions the extinguisher within easy reach of the driver or front passenger, keeps it off the floor (where it can get kicked or buried under gear), and keeps it visible so trail partners know you're equipped.</p>
<p>Mounting hardware is included and sized for standard Wrangler roll bar diameters. Adjustable strap systems accommodate a range of roll bar sizes across different Jeep models and aftermarket cage configurations.</p>

<h2>Cordura Construction — Why It Matters</h2>
<p>Unlike cheap plastic or flimsy nylon holders, Bartact fire extinguisher mounts are built from <strong>1000-denier Cordura nylon</strong> — the same material used in military gear and professional-grade outdoor equipment. Cordura resists abrasion, UV degradation, and moisture, meaning your mount stays intact and functional season after season. The mounting straps are reinforced at all stress points, and the hardware uses stainless or plated fasteners to resist corrosion.</p>
<p>Plastic holders crack in cold temperatures and become brittle after UV exposure. Cheap nylon straps fray. Cordura doesn't.</p>

<h2>Made in the USA</h2>
<p>Bartact fire extinguisher holders are cut, sewn, and assembled in our US facility. American craftsmanship, American materials, and a lifetime workmanship warranty. When you're counting on safety equipment, you want to know where it was made and how.</p>

<h2>Features</h2>
<ul>
  <li>Roll bar and cage mounting with included hardware</li>
  <li>1000-denier Cordura nylon construction</li>
  <li>Fits 1 lb, 2.5 lb, and 5 lb ABC fire extinguishers</li>
  <li>Quick-release buckle for rapid deployment</li>
  <li>Multiple color options to match your interior</li>
  <li>Reinforced stress-point stitching</li>
  <li>Made in USA with lifetime workmanship warranty</li>
</ul>

<h2>Frequently Asked Questions</h2>

<h3>Q: What size fire extinguisher does this hold?</h3>
<p>A: Bartact holders are available in sizes for 1 lb, 2.5 lb, and 5 lb ABC-rated fire extinguishers. Check the product listing for the specific size options. We recommend a minimum 2.5 lb extinguisher for trail use — it provides meaningful suppression capacity without excessive weight.</p>

<h3>Q: Can I mount this to an aftermarket cage?</h3>
<p>A: Yes. Our mounting straps are adjustable and work with most aftermarket cage tubing. Contact us with your cage tube diameter if you're unsure about compatibility.</p>

<h3>Q: Where is the best location to mount a fire extinguisher in a Jeep?</h3>
<p>A: Most Jeep owners mount on the front roll bar, either driver side or passenger side, within arm's reach from the seat. This keeps it accessible whether you're inside or exiting the vehicle. Avoid floor mounting where it can be buried under gear or kicked during access.</p>

<h3>Q: How quickly can I access the extinguisher in an emergency?</h3>
<p>A: Our quick-release buckle system allows one-handed extraction in seconds. The design is intentional — in a real emergency, you don't have time to fumble with multiple straps or snaps.</p>

<h3>Q: Are these required for organized trail runs?</h3>
<p>A: Many organized trail run groups and competitive off-road events require participants to carry a fire extinguisher. Check your specific event or club requirements. Bartact mounts satisfy typical trail run requirements for accessible, secured extinguisher mounting.</p>

<h2>Complete Your Trail Safety Build</h2>
<ul>
  <li><a href="/collections/jeep-accessories">Jeep Accessories</a> — Full range of Jeep trail and interior accessories</li>
  <li><a href="/collections/molle-accessories">MOLLE Accessories</a> — Modular storage systems for trail gear organization</li>
  <li><a href="/collections/roll-bar-fire-extinguisher-holder">Roll Bar Fire Extinguisher Holders</a> — Specifically optimized roll bar mount designs</li>
  <li><a href="/collections/jeep-wrangler-storage-bags-organizers">Jeep Storage Bags &amp; Organizers</a> — Keep recovery gear, first aid, and trail essentials organized</li>
</ul>
`,

'roll-bar-fire-extinguisher-holder': `
<h2>Roll Bar Fire Extinguisher Holders — Secure, Accessible, Trail-Ready</h2>
<p>A properly mounted <strong>roll bar fire extinguisher</strong> holder is one of the most critical safety accessories in any serious off-road build. Bartact's roll bar fire extinguisher holders are purpose-designed for Jeep Wrangler, Gladiator, and custom cage roll bar mounting — keeping your extinguisher secure on the roughest trails while allowing rapid one-handed deployment when seconds count.</p>

<h2>Roll Bar Mounting: The Optimal Position</h2>
<p>The roll bar is the single best location for a fire extinguisher in a Jeep or off-road vehicle. Here's why roll bar mounting beats other positions:</p>
<ul>
  <li><strong>Always accessible:</strong> Positioned within arm's reach from both front seats, whether you're buckled in or exiting the vehicle.</li>
  <li><strong>Above floor debris:</strong> Tools, gear, mud, and water accumulate on the floor. A roll bar mount keeps your extinguisher above all of that.</li>
  <li><strong>Visible to passengers:</strong> Trail partners and co-drivers can locate and access the extinguisher quickly in an emergency.</li>
  <li><strong>Protected from impact:</strong> The roll bar is designed to survive rollovers — your extinguisher stays intact even in worst-case scenarios.</li>
</ul>

<h2>Quick-Release Design</h2>
<p>In a fire emergency, you have seconds to act. Bartact's roll bar holders feature a single-motion quick-release buckle that allows immediate extraction with one hand. No fumbling with multiple straps, snaps, or clasps. Pull the buckle, grab the extinguisher, and go. The release mechanism is designed to stay locked during extreme vibration and trail impacts but releases smoothly under deliberate user force.</p>

<h2>Cordura vs. Generic Plastic Holders</h2>
<p>The market is flooded with cheap plastic fire extinguisher holders. They're inexpensive for a reason. Here's what you get with Cordura Bartact holders vs. generic plastic:</p>
<ul>
  <li><strong>Cold weather:</strong> Plastic becomes brittle below freezing and can crack during trail use in winter. Cordura remains flexible at sub-zero temperatures.</li>
  <li><strong>UV exposure:</strong> Plastic yellows, warps, and degrades with prolonged UV exposure. Cordura retains its properties for years of open-top trail use.</li>
  <li><strong>Vibration resistance:</strong> Plastic holders rattle and loosen over rough terrain. Bartact's fabric and strap system absorbs vibration without loosening the extinguisher.</li>
  <li><strong>Customization:</strong> Cordura holders can be ordered in custom colors and configurations. Plastic comes in plastic colors.</li>
  <li><strong>Repairability:</strong> Damaged stitching can be repaired. Cracked plastic cannot.</li>
</ul>

<h2>Made in the USA</h2>
<p>Bartact manufactures every roll bar fire extinguisher holder at our US facility using American labor and materials. Our quality control process inspects every seam, buckle, and mounting strap before shipment. You get a product built by people who take safety seriously.</p>

<h2>Compatible Roll Bar Diameters</h2>
<p>Our standard holders fit roll bar tubes from 1.5" to 2.0" diameter — covering the vast majority of factory Wrangler roll bars and common aftermarket cage tubing. Extended strap kits are available for larger diameter tubes. Specify your tube diameter when ordering if you're running a custom cage.</p>

<h2>Frequently Asked Questions</h2>

<h3>Q: What roll bar diameters does this holder fit?</h3>
<p>A: Standard configuration fits 1.5" to 2.0" outer diameter roll bar tubing. Extended strap configurations are available for tubes up to 2.5" OD. Contact us for larger diameter options for custom cage builds.</p>

<h3>Q: Does it work with any fire extinguisher brand?</h3>
<p>A: Yes. Our holders are sized by extinguisher capacity (1 lb, 2.5 lb, 5 lb), not by brand. They will fit standard-diameter extinguishers from Kidde, Amerex, Ansul, First Alert, H3R, and other major brands within the appropriate capacity range. Check the extinguisher body diameter against the holder size specifications if you're using a non-standard unit.</p>

<h3>Q: Are fire extinguishers required on trails?</h3>
<p>A: Many organized trail run groups, competitive events, and OHV parks require or strongly recommend fire extinguishers. Even where not mandated, carrying one is standard practice for responsible off-roaders. Check your specific event or location requirements for mandated sizes and ratings (typically ABC, 2.5 lb minimum).</p>

<h3>Q: How do I install this on my roll bar?</h3>
<p>A: The holder wraps around the roll bar tube with heavy-duty mounting straps that tighten with cam buckles. No drilling or permanent modification required. Installation takes 5-10 minutes. The extinguisher then secures into the holder body with the quick-release retention strap.</p>

<h3>Q: Can I mount this facing any direction on the roll bar?</h3>
<p>A: Yes. The holder can be oriented horizontally, vertically, or at an angle on the roll bar. For most Jeep interiors, horizontal or angled mounting on the front roll bar provides the best accessibility from the driver or passenger seat.</p>

<h2>Related Safety and Gear Products</h2>
<ul>
  <li><a href="/collections/fire-extinguisher-holders">All Fire Extinguisher Holders</a> — Full range of mount styles and configurations</li>
  <li><a href="/collections/jeep-accessories">Jeep Accessories</a> — Complete trail safety and interior accessory lineup</li>
  <li><a href="/collections/molle-accessories">MOLLE Accessories</a> — Modular gear organization for trail essentials</li>
  <li><a href="/collections/jeep-grab-handles">Jeep Grab Handles</a> — Keep passengers secure on the trail</li>
</ul>
`,

'jeep-wrangler-storage-bags-organizers': `
<h2>Jeep Storage Bags and Organizers Built for Off-Road Life</h2>
<p>Keeping your Jeep organized on the trail starts with the right <strong>jeep storage bags</strong> and organizers. Bartact designs and manufactures a comprehensive lineup of Jeep interior storage solutions — from seat-back organizers with MOLLE webbing to overhead storage bags and modular pouches — all made in the USA from military-grade materials that hold up to the demands of real off-road use.</p>

<h2>The Problem with Jeep Storage</h2>
<p>Jeep Wranglers are iconic for what they don't have: trunk space. The open-air design that makes them so capable off-road also means you're constantly battling gear organization. Trail essentials — first aid kits, recovery straps, tools, snacks, maps, fire extinguishers — end up loose in the cargo area, bouncing under seats, or crammed into a single bag in the back. Bartact's storage system changes that by turning your Jeep's existing mounting points and MOLLE panels into an organized, accessible gear library.</p>

<h2>MOLLE-Compatible Storage System</h2>
<p>The foundation of Bartact's Jeep storage system is MOLLE (Modular Lightweight Load-carrying Equipment) compatibility. Originally designed for military load-bearing equipment, MOLLE webbing allows modular attachment and reconfiguration of pouches and accessories without permanent modification to your vehicle. Bartact's seat covers, roll bar bags, and cargo organizers all feature MOLLE webbing that accepts standard MOLLE pouches, creating a customizable storage system you can adapt as your trail kit evolves.</p>
<p>Start with a roll bar bag for recovery gear. Add a seat-back organizer for snacks and maps. Attach a first aid pouch to the driver seat. The system grows with your needs and rearranges in minutes.</p>

<h2>Cordura Construction — Durability Above All</h2>
<p>Every Bartact storage bag and organizer is built from <strong>1000-denier Cordura nylon</strong>. This is the same material used in military rucksacks, law enforcement gear, and expedition luggage — chosen specifically because it outlasts every other fabric in abrasive, wet, and UV-intensive environments.</p>
<ul>
  <li><strong>Abrasion resistance:</strong> Rocky trails, metal edges, and rough cargo areas don't eat through Cordura.</li>
  <li><strong>Water resistance:</strong> DWR-treated Cordura sheds light rain and water splashes without soaking through.</li>
  <li><strong>UV stability:</strong> Years of open-top Jeep use won't fade or degrade the material the way cheaper fabrics deteriorate.</li>
  <li><strong>Load capacity:</strong> Reinforced seams and bartack stitching at stress points handle heavy loads without tearing.</li>
</ul>

<h2>Made in the USA</h2>
<p>Bartact manufactures every storage bag, organizer, and pouch at our US facility. American materials, American labor, and rigorous quality inspection. When your first aid kit, tools, or recovery gear depends on the bag holding together in the middle of nowhere, you want it made right. We guarantee our workmanship for life.</p>

<h2>Available Storage Solutions</h2>
<ul>
  <li><strong>Roll Bar Storage Bags:</strong> Mount directly to the Wrangler's roll bar for accessible above-floor storage. Available in multiple sizes.</li>
  <li><strong>Seat-Back Organizers:</strong> MOLLE-equipped panels that attach to the back of front seats, providing organized storage for rear passengers.</li>
  <li><strong>Cargo Area Organizers:</strong> Keep the rear cargo area tidy with compartmentalized bags that secure to the cargo floor or rear seat backs.</li>
  <li><strong>MOLLE Pouches:</strong> Individual pouches for first aid, tools, maps, and trail essentials. Attach to any MOLLE panel.</li>
  <li><strong>Overhead Bags:</strong> Utilize otherwise wasted overhead space for lightweight, frequently accessed items.</li>
</ul>

<h2>Frequently Asked Questions</h2>

<h3>Q: What is MOLLE and why does it matter?</h3>
<p>A: MOLLE (Modular Lightweight Load-carrying Equipment) is a webbing attachment system developed for military load-bearing equipment. It uses rows of nylon webbing loops sewn onto the bag or panel, allowing compatible pouches to weave through the loops for a secure, tool-free attachment. The key benefit is modularity — you can rearrange, add, and remove pouches in minutes to adapt your storage to different missions or trips.</p>

<h3>Q: Are Bartact storage bags waterproof?</h3>
<p>A: Bartact bags use DWR (Durable Water Repellent) treated Cordura that resists light rain and water splashes. They are water-resistant, not fully waterproof. For items that must stay completely dry (electronics, medications), use a waterproof inner liner or dry bag inside the Bartact organizer.</p>

<h3>Q: What sizes are available?</h3>
<p>A: Bartact offers storage bags in multiple sizes, from small MOLLE pouches (roughly 6"x4"x2") to large roll bar bags (up to 18"x8"x6"). Check individual product listings for exact dimensions. We offer size bundles for complete Jeep interior organization setups.</p>

<h3>Q: Do these fit JK and JL models?</h3>
<p>A: Yes. Most Bartact storage products are designed for universal fit or with JK/JL-specific mounting options. Roll bar bags have adjustable mounting straps for different roll bar diameters. Seat-back organizers use universal seat attachment systems.</p>

<h3>Q: Can I attach a Bartact bag to aftermarket seats?</h3>
<p>A: Seat-back organizers use a combination of MOLLE attachment and headrest mounting, which works with most aftermarket Jeep seats that retain the factory headrest post positions.</p>

<h2>Build Your Jeep Storage System</h2>
<ul>
  <li><a href="/collections/molle-accessories">MOLLE Accessories</a> — Complete MOLLE pouch and panel lineup for modular storage</li>
  <li><a href="/collections/jeep-accessories">Jeep Accessories</a> — Full range of Jeep trail accessories</li>
  <li><a href="/collections/fire-extinguisher-holders">Fire Extinguisher Holders</a> — Keep trail safety gear organized and accessible</li>
  <li><a href="/collections/jeep-wrangler-seat-covers">Jeep Wrangler Seat Covers</a> — MOLLE-equipped seat covers that integrate with your storage system</li>
</ul>
`,

'ford-bronco-storage-bags': `
<h2>Ford Bronco Storage Bags for the Ultimate Adventure Rig</h2>
<p>Maximize your <strong>ford bronco storage</strong> with purpose-built Bartact bags and organizers designed to work with the Bronco's unique interior layout. Whether you're in a 2-door or 4-door Bronco, the challenge is the same: making the most of your interior space while keeping gear accessible on the trail. Bartact's Bronco storage bags are manufactured in the USA from 1000-denier Cordura nylon and designed for MOLLE integration with the Bronco's factory and aftermarket interior panels.</p>

<h2>Bronco-Specific Interior Storage Challenges</h2>
<p>The Ford Bronco (2021-present) was designed with adventure in mind, but like all purpose-built off-road vehicles, its interior storage is limited when you start packing for serious expeditions. The 2-door Bronco has particularly constrained rear cargo space, while the 4-door provides more volume but still benefits from organizational systems that prevent gear from shifting during technical trail driving.</p>
<p>Bartact's Bronco storage lineup addresses these challenges with bags sized and positioned for the Bronco's specific interior geometry — including roll bar mounting, seat-back attachment, and cargo area organizers that work with the Bronco's factory MOLLE-compatible panels.</p>

<h2>MOLLE Integration with Bronco Panels</h2>
<p>Ford equipped the 2021+ Bronco with factory MOLLE-compatible panels in the cargo area and on certain interior surfaces. Bartact storage bags and pouches use standard MOLLE attachment to interface directly with these factory panels — no modification or additional hardware required. You can build out a complete organized storage system using Bartact products on the Bronco's factory mounting points.</p>
<p>For Bronco owners who have upgraded to aftermarket MOLLE seat covers or cargo panels, Bartact products integrate equally well with aftermarket systems.</p>

<h2>Cordura vs. Generic Bronco Cargo Bags</h2>
<p>Big-box outdoor retailers sell generic cargo bags that look similar on the shelf but fail quickly in real off-road use. Here's how Bartact's Cordura construction compares:</p>
<ul>
  <li><strong>Seam strength:</strong> Bartact uses bartack stitching at all stress points — corners, attachment loops, strap anchors. Generic bags split at seams under heavy loads.</li>
  <li><strong>Hardware quality:</strong> Bartact uses YKK zippers and heavy-duty mil-spec buckles. Cheap zippers jam and break with mud and debris.</li>
  <li><strong>Fabric weight:</strong> 1000-denier Cordura is significantly heavier and more abrasion resistant than the 420D or 600D polyester used in generic bags.</li>
  <li><strong>Attachment systems:</strong> Generic bags often use simple velcro or bungee attachment. Bartact MOLLE attachment keeps bags secured even during rollovers or extreme articulation.</li>
</ul>

<h2>Made in the USA</h2>
<p>Every Bartact Bronco storage bag is manufactured at our US facility. American craftsmanship means tighter tolerances, better quality control, and products built by people who understand off-road demands. Our workmanship warranty covers every seam and zipper.</p>

<h2>2-Door vs. 4-Door Bronco Compatibility</h2>
<p>Our Bronco storage bags are compatible with both 2-door and 4-door configurations. The primary differences:</p>
<ul>
  <li><strong>2-door Bronco:</strong> Prioritize roll bar and rear cargo area storage. Overhead bags make excellent use of available height.</li>
  <li><strong>4-door Bronco:</strong> Second and third row seat-back organizers add significant organized storage volume. Rear cargo area organizers benefit from the larger footprint.</li>
</ul>
<p>Select the appropriate product for your cab configuration when ordering, or contact our team for recommendations based on your specific storage needs.</p>

<h2>Frequently Asked Questions</h2>

<h3>Q: Do Bartact storage bags fit both 2-door and 4-door Broncos?</h3>
<p>A: Most Bartact storage bags use adjustable attachment systems that work with both configurations. Some products have 2-door and 4-door specific sizing — check individual product listings or contact us to confirm compatibility for your specific Bronco.</p>

<h3>Q: Will these attach to the factory Bronco MOLLE panels?</h3>
<p>A: Yes. Bartact storage bags use standard MOLLE attachment that is fully compatible with the factory Ford Bronco MOLLE-compatible cargo panels. No modification required.</p>

<h3>Q: Are these weather-resistant for open-top driving?</h3>
<p>A: Bartact bags use DWR-treated Cordura that resists light rain and water spray. For fully open-top trail driving in rain, we recommend treating your bags with additional DWR spray or using waterproof liner bags for electronics and sensitive items.</p>

<h3>Q: Can I use these with aftermarket Bronco seats?</h3>
<p>A: In most cases, yes. Seat-back organizers use headrest-post mounting and seat-back loops that work with most aftermarket Bronco seats. Contact us with your specific seat model if you have concerns.</p>

<h3>Q: How do I keep bags from shifting during off-road driving?</h3>
<p>A: MOLLE attachment keeps bags positively secured to panels. For standalone cargo bags, use the tie-down loops and cargo anchor points present in the Bronco cargo area. Bartact bags include D-rings and loops for multi-point securing.</p>

<h2>Explore Bartact Storage and Gear</h2>
<ul>
  <li><a href="/collections/jeep-wrangler-storage-bags-organizers">Jeep Wrangler Storage Bags</a> — Same quality storage solutions for Jeep Wrangler owners</li>
  <li><a href="/collections/molle-accessories">MOLLE Accessories</a> — Full lineup of modular pouches and accessories</li>
  <li><a href="/collections/jeep-accessories">Off-Road Accessories</a> — Grab handles, fire extinguisher mounts, and more</li>
  <li><a href="/collections/winch-covers">Winch Covers</a> — Protect your recovery gear investment on every adventure</li>
</ul>
`,

'winch-covers': `
<h2>Winch Covers That Protect Your Recovery Investment</h2>
<p>A quality <strong>winch cover</strong> is the smartest, cheapest insurance you can buy for your recovery gear. Winches are expensive, mechanically complex, and constantly exposed to UV radiation, trail mud, road grime, water immersion, and temperature extremes. An unprotected winch degrades faster, requires more maintenance, and fails when you need it most. Bartact winch covers are built from military-grade Cordura nylon — manufactured in the USA — to keep your winch clean, dry, and protected between recoveries.</p>

<h2>Why Winch Protection Matters</h2>
<p>Your winch spends the vast majority of its life sitting on the front bumper, exposed to everything the road and trail throw at it. Even a single off-road season without protection can result in:</p>
<ul>
  <li><strong>UV degradation:</strong> Plastic housings and synthetic winch line both degrade under sustained UV exposure, becoming brittle and failing prematurely.</li>
  <li><strong>Mud and debris accumulation:</strong> Trail mud packs into motor cooling vents, control boxes, and drum mechanisms, trapping moisture and causing corrosion.</li>
  <li><strong>Road salt corrosion:</strong> Winter driving exposes winch components to salt spray, which accelerates corrosion on drum, fairlead, and solenoid hardware.</li>
  <li><strong>Water intrusion:</strong> River crossings and heavy rain can overwhelm basic weather seals, allowing water into the motor and control solenoids.</li>
</ul>
<p>A Bartact winch cover costs a fraction of a winch service call — and protects an investment that can run $500-$2,000+.</p>

<h2>Cordura Construction</h2>
<p>Bartact winch covers are built from <strong>1000-denier Cordura nylon</strong> — the most abrasion-resistant fabric available for outdoor gear applications. Cordura outperforms the cheap polyester taffeta used in generic winch covers in every critical metric:</p>
<ul>
  <li><strong>Abrasion resistance:</strong> Trail brush, rocks, and mechanical contact won't eat through Cordura the way they chew through thin polyester.</li>
  <li><strong>UV stability:</strong> Cordura retains its strength and appearance through years of direct sun exposure without the fading and embrittlement seen in cheaper materials.</li>
  <li><strong>Water resistance:</strong> DWR-treated Cordura repels water effectively, and the cover's design channels water away from the winch housing.</li>
  <li><strong>Temperature range:</strong> Remains flexible in freezing temperatures — important when you need to quickly remove the cover before a recovery in winter conditions.</li>
</ul>

<h2>Made in the USA</h2>
<p>Every Bartact winch cover is cut, sewn, and finished at our US manufacturing facility. We use American labor and materials to produce a cover that reflects genuine quality standards. Our lifetime workmanship warranty covers every seam, zipper, and attachment point — if something fails under normal use, we fix it or replace it.</p>

<h2>Sizing for Popular Winch Brands</h2>
<p>Bartact offers winch covers sized to fit the most popular winch brands and models in the off-road community:</p>
<ul>
  <li><strong>Warn:</strong> VR EVO, ZEON, M8, M10, M12 — covers sized for Warn's 8,000-12,000 lb capacity range</li>
  <li><strong>Smittybilt:</strong> X2O, XRC Gen3, Comp series — fitted covers for Smittybilt's most popular models</li>
  <li><strong>Superwinch:</strong> Tiger Shark, S5500, EXP series — sized for Superwinch drum dimensions</li>
  <li><strong>Badland/Rough Country:</strong> Universal fit options for common budget winch dimensions</li>
  <li><strong>Universal:</strong> Adjustable covers that fit a range of winches from 8,000 to 12,000 lb capacity</li>
</ul>
<p>Measure your winch drum width and height before ordering if you're unsure which size to select. Our product pages include dimension guides for each cover size.</p>

<h2>Features</h2>
<ul>
  <li>1000-denier Cordura nylon construction</li>
  <li>DWR water-repellent treatment</li>
  <li>Elasticized base for secure fit over winch housing</li>
  <li>Buckle or zipper closure for tool-free removal</li>
  <li>Designed for quick removal before recovery operations</li>
  <li>Multiple sizes for 8,000-12,000 lb capacity winches</li>
  <li>Multiple color options</li>
  <li>Made in USA with lifetime workmanship warranty</li>
</ul>

<h2>Frequently Asked Questions</h2>

<h3>Q: What winch brands does this cover fit?</h3>
<p>A: Bartact covers are sized by drum dimensions, not brand-specific patterns. Our sizes cover the most common Warn, Smittybilt, Superwinch, Rough Country, and generic winches in the 8,000-12,000 lb capacity range. Check the dimension guide on each product page and compare to your winch's drum width and housing height.</p>

<h3>Q: How do I remove the cover quickly for a recovery?</h3>
<p>A: Our covers use a single-buckle or zipper closure at the base or front face for rapid removal. Most users can remove the cover in 10-15 seconds without tools. Store it in your storage bag or behind the seat during recovery operations.</p>

<h3>Q: Can I leave the cover on during light off-roading?</h3>
<p>A: We recommend removing the cover before any off-road driving where you might need the winch. The cover is not designed for contact with cables, straps, or tree savers under tension. For road driving and storage, leaving the cover on provides maximum protection.</p>

<h3>Q: Does it protect against water immersion during river crossings?</h3>
<p>A: The cover provides significant water resistance but is not rated for full immersion. For water crossings that fully submerge the winch, remove the cover beforehand — wet gear is easier to clean than water-damaged solenoids.</p>

<h3>Q: Do I need a different size for a 10,000 lb vs. 12,000 lb winch?</h3>
<p>A: Possibly. Higher-capacity winches often have larger drum widths. Check the exact drum dimensions of your specific winch model against our size chart. When in doubt, size up — a slightly loose cover is better than one that strains at the seams.</p>

<h2>Explore More Bartact Recovery and Protection Gear</h2>
<ul>
  <li><a href="/collections/jeep-accessories">Jeep Accessories</a> — Full lineup of off-road and trail accessories</li>
  <li><a href="/collections/molle-accessories">MOLLE Accessories</a> — Modular organization for your trail kit</li>
  <li><a href="/collections/ford-bronco-storage-bags">Ford Bronco Storage Bags</a> — Premium storage solutions for Bronco owners</li>
  <li><a href="/collections/jeep-wrangler-storage-bags-organizers">Jeep Wrangler Storage Bags</a> — Organize your Jeep's interior for any adventure</li>
</ul>
`,

};

// ─────────────────────────────────────────────────────────────────────────────
// Collections to update
// ─────────────────────────────────────────────────────────────────────────────
const collections = [
  { handle: 'jeep-wrangler-jl-seat-covers',           id: 688526164011,  type: 'smart'  },
  { handle: 'toyota-tacoma-seat-covers',               id: 275721355307,  type: 'custom' },
  { handle: 'jeep-wrangler-grab-handles',              id: 688348856363,  type: 'smart'  },
  { handle: 'fire-extinguisher-holders',               id: 688907485227,  type: 'custom' },
  { handle: 'roll-bar-fire-extinguisher-holder',       id: 688526360619,  type: 'smart'  },
  { handle: 'jeep-wrangler-storage-bags-organizers',   id: 684493013035,  type: 'smart'  },
  { handle: 'ford-bronco-storage-bags',                id: 688526786603,  type: 'smart'  },
  { handle: 'winch-covers',                            id: 137430564887,  type: 'smart'  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Update collection pages
// ─────────────────────────────────────────────────────────────────────────────
async function updateCollections() {
  console.log('\n=== STEP 1: Updating collection pages ===\n');

  for (const col of collections) {
    const html = collectionContent[col.handle];
    if (!html) {
      console.log(`[SKIP] No content defined for ${col.handle}`);
      continue;
    }

    const resourceKey = col.type === 'smart' ? 'smart_collection' : 'custom_collection';
    const endpoint = `${resourceKey === 'smart_collection' ? 'smart_collections' : 'custom_collections'}/${col.id}.json`;
    const payload = { [resourceKey]: { id: col.id, body_html: html.trim() } };

    console.log(`[PUT] ${col.handle} (${col.type}, id: ${col.id})...`);
    try {
      const res = await shopifyPut(endpoint, payload);
      if (res.status === 200) {
        console.log(`  ✅ Updated successfully`);
        results.collections_updated.push({ handle: col.handle, id: col.id, status: 200 });
      } else {
        console.log(`  ⚠️  Status ${res.status}: ${res.body.substring(0, 200)}`);
        results.collections_failed.push({ handle: col.handle, id: col.id, status: res.status, error: res.body.substring(0, 200) });
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
      results.collections_failed.push({ handle: col.handle, id: col.id, error: err.message });
    }

    // Respect Shopify rate limit: 2 req/sec bucket, stay safe
    await sleep(600);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Check for NEEDS_BLOG_ARTICLE items (none found, but handle gracefully)
// ─────────────────────────────────────────────────────────────────────────────
async function publishBlogArticles() {
  console.log('\n=== STEP 2: Checking for NEEDS_BLOG_ARTICLE items ===\n');

  const fs = require('fs');
  let report;
  try {
    report = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/memory/bartact-seo-action-report.json', 'utf8'));
  } catch (e) {
    console.log('  Could not read action report:', e.message);
    return;
  }

  const blogItems = (report.actions || []).filter(a => a.action === 'NEEDS_BLOG_ARTICLE');
  if (blogItems.length === 0) {
    console.log('  No NEEDS_BLOG_ARTICLE items found. Skipping blog publishing.');
    return;
  }

  for (const item of blogItems) {
    console.log(`[BLOG] Publishing article for keyword: ${item.kw}`);
    const articleHtml = generateBlogArticle(item.kw, item.handle);
    const payload = {
      article: {
        title: `${item.kw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} — Complete Guide`,
        author: 'Bartact',
        body_html: articleHtml,
        tags: item.kw,
        published: true,
      }
    };
    try {
      const res = await shopifyPost(`blogs/19510597/articles.json`, payload);
      if (res.status === 201) {
        const articleData = JSON.parse(res.body);
        console.log(`  ✅ Published article id: ${articleData.article?.id}`);
        results.blog_articles_published.push({ kw: item.kw, id: articleData.article?.id });
      } else {
        console.log(`  ⚠️  Status ${res.status}: ${res.body.substring(0, 200)}`);
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
    }
    await sleep(600);
  }
}

function generateBlogArticle(kw, handle) {
  const title = kw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return `
<h1>${title} — Complete Guide</h1>
<p>Whether you're new to off-roading or a seasoned trail veteran, understanding <strong>${kw}</strong> is essential for building a capable, safe, and organized rig. This guide covers everything you need to know — from materials and construction to installation and trail use — to help you make the best choice for your vehicle and adventure style.</p>

<h2>Why Quality Matters</h2>
<p>Off-road accessories take abuse that street-only gear never sees. UV exposure, mud, water immersion, vibration, and mechanical stress combine to destroy cheap products quickly. The best ${kw} options are built from materials tested in real-world conditions by manufacturers who actually wheel their products before selling them.</p>
<p>Bartact's entire lineup is built from 1000-denier Cordura nylon — military-spec fabric chosen for its unmatched combination of abrasion resistance, UV stability, and all-weather performance. Everything is manufactured in the USA, inspected before shipment, and backed by a lifetime workmanship warranty.</p>

<h2>What to Look For</h2>
<ul>
  <li><strong>Material quality:</strong> 1000-denier Cordura nylon outperforms polyester, neoprene foam, and faux leather in abrasion and UV resistance.</li>
  <li><strong>Hardware:</strong> YKK zippers, mil-spec buckles, and stainless or plated fasteners resist corrosion and mechanical failure.</li>
  <li><strong>Fit precision:</strong> Vehicle-specific patterns ensure proper fit without bunching, slippage, or interference with safety systems.</li>
  <li><strong>Manufacturer transparency:</strong> Know where your gear is made. US manufacturing means higher labor standards and easier warranty support.</li>
</ul>

<h2>Installation Tips</h2>
<p>Most Bartact products install without tools or vehicle modifications. Follow the included instructions carefully, route straps and anchors as directed, and test fitment before heading out on the trail. Check all hardware after the first off-road run to confirm everything has settled into place.</p>

<h2>Maintenance and Care</h2>
<p>Cordura products can be cleaned with a brush, mild soap, and water. Machine washing on cold/gentle is safe for most fabric accessories. Air dry or tumble dry low. Avoid bleach, harsh solvents, and high heat. Periodically inspect stress points, seams, and hardware for wear.</p>

<h2>Ready to Upgrade?</h2>
<p>Browse Bartact's full lineup of <a href="/collections/jeep-accessories">Jeep accessories</a>, <a href="/collections/molle-accessories">MOLLE accessories</a>, <a href="/collections/jeep-seat-covers">seat covers</a>, and <a href="/collections/winch-covers">winch covers</a> — all made in the USA and built to last.</p>
  `.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: IndexNow submission
// ─────────────────────────────────────────────────────────────────────────────
async function submitIndexNow() {
  console.log('\n=== STEP 3: IndexNow submission ===\n');

  const updatedHandles = results.collections_updated.map(c => c.handle);
  if (updatedHandles.length === 0) {
    console.log('  No successfully updated collections to submit.');
    return;
  }

  const urlList = updatedHandles.map(h => `https://bartact.com/collections/${h}`);
  console.log(`  Submitting ${urlList.length} URLs to IndexNow...`);

  const payload = {
    host: 'bartact.com',
    key: INDEXNOW_KEY,
    keyLocation: `https://bartact.com/${INDEXNOW_KEY}.txt`,
    urlList,
  };

  try {
    const res = await postJson('api.indexnow.org', '/indexnow', payload);
    console.log(`  IndexNow response: HTTP ${res.status}`);
    if (res.status === 200 || res.status === 202) {
      console.log('  ✅ IndexNow submission accepted');
      results.indexnow_submitted = urlList;
      results.indexnow_status = res.status;
    } else {
      console.log(`  ⚠️  IndexNow response body: ${res.body.substring(0, 300)}`);
      results.indexnow_status = res.status;
      results.indexnow_error = res.body.substring(0, 300);
    }
  } catch (err) {
    console.log(`  ❌ IndexNow error: ${err.message}`);
    results.indexnow_error = err.message;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4: Telegram summary
// ─────────────────────────────────────────────────────────────────────────────
async function sendTelegramSummary() {
  console.log('\n=== STEP 4: Sending Telegram summary ===\n');

  if (!TELEGRAM_TOKEN) {
    console.log('  ⚠️  TELEGRAM_TOKEN not found in .env — skipping Telegram notification');
    results.telegram_sent = false;
    results.telegram_error = 'TELEGRAM_TOKEN not found';
    return;
  }

  const updatedList = results.collections_updated.map(c => `• /collections/${c.handle}`).join('\n');
  const failedList = results.collections_failed.length > 0
    ? `\n⚠️ Failed (${results.collections_failed.length}): ${results.collections_failed.map(c => c.handle).join(', ')}`
    : '';
  const blogList = results.blog_articles_published.length > 0
    ? `\n📝 Blog articles published: ${results.blog_articles_published.length}`
    : '\n📝 Blog articles: none needed';

  const text = `✅ <b>Bartact SEO Auto-Fix Complete</b>

<b>Collections Updated (${results.collections_updated.length}):</b>
${updatedList || 'none'}${failedList}${blogList}

IndexNow: submitted ${results.indexnow_submitted.length} URLs

Next check: tomorrow 4:28 PM UTC`;

  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text,
    parse_mode: 'HTML',
  };

  try {
    const body = JSON.stringify(payload);
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${TELEGRAM_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const res = await httpRequest(options, body);
    if (res.status === 200) {
      console.log('  ✅ Telegram message sent successfully');
      results.telegram_sent = true;
    } else {
      console.log(`  ⚠️  Telegram response ${res.status}: ${res.body.substring(0, 200)}`);
      results.telegram_sent = false;
      results.telegram_error = res.body.substring(0, 200);
    }
  } catch (err) {
    console.log(`  ❌ Telegram error: ${err.message}`);
    results.telegram_sent = false;
    results.telegram_error = err.message;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Save results
// ─────────────────────────────────────────────────────────────────────────────
async function saveResults() {
  const fs = require('fs');
  const path = '/home/ubuntu/.openclaw/workspace/memory/bartact-seo-push-results.json';
  fs.writeFileSync(path, JSON.stringify(results, null, 2));
  console.log(`\n📁 Results saved to ${path}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  console.log('🚀 Starting Bartact SEO Content Push');
  console.log(`   Date: ${results.date}`);

  await updateCollections();
  await publishBlogArticles();
  await submitIndexNow();
  await sendTelegramSummary();
  await saveResults();

  console.log('\n=== SUMMARY ===');
  console.log(`Collections updated: ${results.collections_updated.length}`);
  console.log(`Collections failed:  ${results.collections_failed.length}`);
  console.log(`Blog articles:       ${results.blog_articles_published.length}`);
  console.log(`IndexNow URLs:       ${results.indexnow_submitted.length}`);
  console.log(`Telegram sent:       ${results.telegram_sent}`);
  console.log('\n✅ Done.');
})();
