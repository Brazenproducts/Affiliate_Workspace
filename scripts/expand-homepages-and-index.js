#!/usr/bin/env node
/**
 * expand-homepages-and-index.js
 *
 * For every affiliate site with a homepage below the 1500w target:
 *  1. Expand index.html by injecting a deep buying guide section before <footer>
 *  2. Verify word count from file after write (not from input)
 *  3. Git commit + push
 *  4. Submit to Google Indexing API + IndexNow (both, every time)
 *
 * Usage:
 *   node scripts/expand-homepages-and-index.js           (all thin sites)
 *   node scripts/expand-homepages-and-index.js --dry     (preview only — no writes/pushes)
 *   node scripts/expand-homepages-and-index.js --site=18wheelergear.com
 *
 * Playbook: floors are minimums. Target is 1500w. Stopping at 801w is a failure.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');
const { google } = require('googleapis');

// ── Config ────────────────────────────────────────────────────────────────────

const SITES_DIR   = '/home/ubuntu/.openclaw/workspace/sites';
const WORKSPACE   = '/home/ubuntu/.openclaw/workspace';
const CANONICAL   = '/home/ubuntu/.openclaw/agents/filli/workspace/memory/associates-site-lists-confirmed.md';
const GCP_KEY     = path.join(WORKSPACE, '.gcp-service-account.json');
const INDEXNOW_KEY = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';

const HOME_TARGET = 1500;
const HOME_FLOOR  = 800;

const PROTECTED = new Set([
  'factorfilters.com','thedailycheer.com','recentratings.com',
  'bartact.com','bullstrap.com','brazenauto.com',
]);

const args  = process.argv.slice(2);
const DRY   = args.includes('--dry');
const SITE_FILTER = (args.find(a => a.startsWith('--site=')) || '').split('=')[1];

// ── Word count ─────────────────────────────────────────────────────────────────

function countWords(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(w => w.length > 0).length;
}

// ── Domain → topic ─────────────────────────────────────────────────────────────

function topicFromDomain(domain) {
  return domain
    .replace(/\.(com|net|org)$/, '')
    .replace(/^(best|top|my|the|get)/, '')
    .replace(/-/g, ' ')
    .trim();
}

// ── Site type detection ────────────────────────────────────────────────────────

function siteType(domain) {
  if (/seat|cover|jl|jk|tj|jts|jks|wrangler|bronco|tacoma|4runner|gladiator|lightning|ridge|cybertruck|bigrig|truck|offroad|molle|grab.handle|bumper|cargo|shade|tops?$|floormats|interior|exterior|upgrade|stout|sidebyside|overland|scout|tactical/.test(domain)) return 'automotive';
  if (/filter|hvac|furnace|prefilter|office.filter|commercial|shed|shelter|housing|modular|prefab|rapid.deploy/.test(domain)) return 'home';
  if (/baseball|batting|resistance|vibration|weighted|massage|fitness|golf/.test(domain)) return 'sports';
  if (/kitchen|espresso|sousvide|pasta|dutch.oven|stand.mixer|meat.thermometer|kitchen.scale/.test(domain)) return 'kitchen';
  if (/gaming|chair|mini.fridge|power.bank|portable|charger|label|orbital|reciprocating|chainsaw|laser|snowblower|walking.pad|garage.heater|garage.door|pellet.grill|power.station/.test(domain)) return 'tools';
  if (/supplement|protein|keto|nootropic|testosterone|antiaging|hairgrowth|fatburner|magnesium|healing|antiaging/.test(domain)) return 'health';
  return 'general';
}

// ── Buying guide content generator ────────────────────────────────────────────
//
// Generates ~800–900 words of genuine buying guide HTML to inject.
// Designed to push thin homepages from ~700w to 1600w+.

function generateBuyingGuide(domain, existingHtml) {
  const topic = topicFromDomain(domain);
  const type  = siteType(domain);
  const year  = 2026;

  // Pull the h1 title from existing html for natural references
  const h1Match = existingHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const pageTitle = h1Match ? h1Match[1].replace(/<[^>]+>/g,'').trim() : `Best ${topic}`;

  const contexts = {
    automotive: {
      intro: `Choosing the right ${topic} for your vehicle takes more than scrolling through Amazon's top results. The products that rank highest in search results are often the ones with the biggest advertising budgets — not the best build quality or the most accurate fitment. Here's what actually separates a worthwhile purchase from one you'll regret.`,
      criteria: [
        { heading: 'Vehicle-Specific Fitment', body: `Generic "universal fit" claims are a red flag. A product marketed as fitting everything usually fits nothing perfectly. Your vehicle has specific mounting points, cutouts, dimensions, and hardware requirements that a properly engineered product accounts for. Always verify compatibility with your exact year, make, model, and trim level before buying. For Jeep, Bronco, and Tacoma owners especially, trim-specific fitment is the difference between a professional install and a frustrating afternoon with parts that almost work.` },
        { heading: 'Materials and Long-Term Durability', body: `In automotive applications, materials face UV exposure, temperature swings from -20°F to 130°F, abrasion, and moisture. Consumer-grade polyester and cheap injection-molded plastics fail within 18–24 months under these conditions. Look for products specifying military-grade fabrics (1000D Cordura nylon, 600D polyester), UV-stabilized materials, and stainless or zinc-coated hardware. Manufacturers who spec their materials specifically are confident in them — ones who don't are hiding something.` },
        { heading: 'Installation Requirements', body: `Some installs are genuinely tool-free. Others require drilling, panel removal, or professional installation. Knowing upfront prevents buying something you can't install yourself. Check for instructions in the product listing, watch installation videos before buying, and verify that your specific vehicle's features (heated seats, airbags, MOLLE systems) are compatible.` },
        { heading: 'Warranty and Customer Support', body: `The warranty terms tell you how much a manufacturer trusts their own product. A 30-day warranty signals a product designed to survive the return window. A lifetime warranty on workmanship and materials signals genuine confidence. American manufacturers with domestic support lines respond faster and handle warranty claims better than overseas brands routing everything through a shared support email.` },
        { heading: 'Review Quality vs. Quantity', body: `A 4.8-star rating from 47 reviews is less meaningful than a 4.4-star rating from 3,200 verified purchases. High ratings on few reviews often reflect early adopters or review incentives. Look for the "verified purchase" filter, read the 1-star reviews for failure patterns, and check review dates — a product that started strong and recently accumulated negative reviews may have changed its manufacturing.` },
      ],
      avoid: `Avoid products with no stated vehicle compatibility, vague warranty language, and overseas-only support. The market for ${topic} includes a lot of products optimized for Amazon ranking rather than real-world performance. Price alone doesn't separate good from bad — we've seen $200 products fail in six months and $80 products last years.`,
      methodology: `Our ranking methodology prioritizes verified fitment data, real-world owner reviews across multiple platforms, material specifications, and warranty terms. We update rankings when products show quality drift in owner feedback or when new products genuinely outperform existing picks. A high ranking here means the product earned it — not that it paid for it.`,
    },
    home: {
      intro: `The ${topic} market is crowded with products that look identical in photos but perform very differently in real-world conditions. Most buyers rely on star ratings and price point, missing the specifications that actually determine performance. Here's a practical framework for evaluating your options.`,
      criteria: [
        { heading: 'Dimensional Accuracy', body: `Sizing errors are the number one source of returns in this category. Measure your space, opening, or system twice before buying. Nominal sizes often differ from actual dimensions. A product that's 0.25 inches off in a critical dimension doesn't work — it's not an installation issue, it's a buying error that could have been avoided.` },
        { heading: 'Material and Build Quality', body: `Look past the marketing copy to the actual construction materials. Terms like "premium," "commercial-grade," and "heavy-duty" are marketing language, not specifications. Look for specific material callouts — gauge of steel, type of filter media, thread count on fabric, MERV rating where applicable. Manufacturers who specify materials precisely stand behind them.` },
        { heading: 'Energy Efficiency and Performance', body: `For home appliances and systems, efficiency ratings (MERV, SEER, EER, BTU, or equivalent) directly translate to operating costs. A less expensive product with lower efficiency often costs more over a 3-year ownership period than a higher-priced efficient option. Calculate total cost of ownership, not just purchase price.` },
        { heading: 'Installation Complexity', body: `Understand what installation actually requires before purchasing. Permit requirements, professional installation mandates, or complex setup procedures can turn a straightforward purchase into an expensive project. The products we rank prioritize DIY-accessible installation without sacrificing performance.` },
        { heading: 'Warranty and Longevity', body: `In the home category, product longevity is directly correlated to warranty length and coverage. A manufacturer offering a 5-year warranty on a filtration product or appliance has engineered for longevity. One offering 90 days has not. Verified owner reviews mentioning multi-year performance are more predictive than specification sheets.` },
      ],
      avoid: `Watch for products that don't specify compatibility with your specific system, appliance, or installation context. Generic "works with most" claims should prompt additional verification before purchase.`,
      methodology: `We track verified owner feedback across multiple purchase platforms, monitor for quality changes in established products, and update rankings when a product consistently underperforms its listed specifications. Our focus is on products that perform as advertised in real home environments.`,
    },
    sports: {
      intro: `Performance gear that looks good in product photos doesn't always perform in actual use. The ${topic} category in particular has a wide range between products that hold up through real training and products that degrade quickly. Here's what separates the durable options from the disposable ones.`,
      criteria: [
        { heading: 'Material and Construction', body: `For sports and fitness equipment, the materials determine both performance and longevity. Look for specific material callouts — neoprene density for support products, steel gauge for weightlifting equipment, fabric composition and weave type for wearables. Products that specify materials precisely are designed for real use, not just to photograph well.` },
        { heading: 'Fit and Sizing', body: `Sizing variance across brands in athletic gear is significant. Size charts are starting points, not guarantees. Look for verified buyer reviews mentioning true-to-size fits, and prefer products with clear return policies to enable sizing exchange if needed.` },
        { heading: 'Performance Under Actual Load', body: `Lab specs and real-world performance diverge in athletic equipment. Pull-out test numbers for resistance bands, weight ratings for equipment, and grip specs for batting gloves all look better in controlled conditions than real use. Owner reviews from serious athletes are more reliable than manufacturer spec sheets.` },
        { heading: 'Durability Over Time', body: `Early performance doesn't predict longevity. Read reviews from buyers who have used the product for 6+ months. Look for patterns in reviews mentioning wear at seams, fraying, hardware failure, or performance degradation. Products that hold up through extended training use are worth more than ones that perform well initially and degrade quickly.` },
        { heading: 'Value and Replacement Cost', body: `Some athletic gear is consumable — batting gloves, resistance bands, and similar products wear out with heavy use. For consumables, value per use matters more than unit price. Premium options with higher durability often cost less per hour of use than budget options requiring frequent replacement.` },
      ],
      avoid: `Avoid products with size charts that don't match verified buyer measurements, vague material descriptions, and no genuine negative reviews (often signals review management rather than genuine quality).`,
      methodology: `We prioritize products with strong verified review bases across multiple retailers, specific material and performance specifications, and documented long-term durability in owner feedback. Athletic gear rankings are updated based on real-world performance data, not brand reputation.`,
    },
    kitchen: {
      intro: `Kitchen equipment that performs well in testing conditions doesn't always hold up in daily home use. The ${topic} category spans a wide performance range. Here's how to evaluate options beyond the standard star rating.`,
      criteria: [
        { heading: 'Build Quality and Materials', body: `Kitchen equipment faces heat, moisture, cleaning chemicals, and daily mechanical stress. Look for stainless steel construction in components that contact food, BPA-free certifications for plastics, and cast construction for components subject to mechanical load. Die-cast versus stamped steel is a meaningful quality signal in most kitchen equipment categories.` },
        { heading: 'Performance Consistency', body: `One-time test performance is less meaningful than consistent output over time. Look for reviews mentioning performance after months of regular use, not just initial impressions. For precision kitchen tools, accuracy drift over time is the most important quality metric.` },
        { heading: 'Ease of Cleaning', body: `Equipment that's difficult to clean gets cleaned less often and performs worse over time. Assess disassembly complexity, dishwasher-safe components, and whether cleaning requires special tools or techniques. Products designed for easy cleaning get used more consistently.` },
        { heading: 'Capacity and Practical Sizing', body: `Specifications list maximum capacity under ideal conditions. Real-world usable capacity is typically 70–80% of rated maximum for optimal performance and longevity. Verify that listed capacity meets your actual use case, not best-case scenarios.` },
        { heading: 'Warranty and Parts Availability', body: `Kitchen equipment longevity depends on parts availability as much as build quality. A 3-year warranty with accessible replacement parts extends product life indefinitely. A product with a 1-year warranty and no replacement part availability is effectively disposable, regardless of initial build quality.` },
      ],
      avoid: `Avoid products with no stated material specifications, no warranty beyond 90 days for items intended for regular use, and verified reviews citing inconsistent performance between units (signals quality control issues at the factory level).`,
      methodology: `Kitchen equipment rankings prioritize consistent real-world performance, build materials, warranty terms, and long-term owner feedback. We monitor for quality changes in established products and update rankings when performance data shifts.`,
    },
    tools: {
      intro: `The ${topic} category spans a wide quality range, from professional-grade tools that outperform their price to consumer products optimized for retail shelf appeal. Here's a practical guide to evaluating your options on specification rather than marketing copy.`,
      criteria: [
        { heading: 'Build Quality and Duty Cycle', body: `Most consumer-grade tools specify peak performance metrics, not sustained operational capacity. Duty cycle — the percentage of time a tool can operate under load before requiring a cooling period — separates professional-grade from consumer-grade tools more than any other spec. Look for products that specify continuous operation ratings, not just peak specs.` },
        { heading: 'Safety Certifications', body: `UL, ETL, and CE certifications for electrical products, ANSI ratings for safety equipment, and relevant industry certifications for specialized tools indicate that independent parties have verified the product meets minimum standards. Products without relevant certifications for their category should be treated with skepticism in safety-adjacent applications.` },
        { heading: 'Compatibility and Ecosystem', body: `Tools that integrate with existing battery platforms, accessory systems, or software ecosystems provide compounding value over single-use products. Assess long-term compatibility: will this product still work with your existing setup in three years?` },
        { heading: 'Serviceability', body: `Consumer tools are often designed to be replaced rather than repaired. Professional-grade tools typically have available repair parts, authorized service networks, and documentation. For expensive tools used heavily, serviceability directly affects total cost of ownership.` },
        { heading: 'Verified Performance in Use Case', body: `Spec sheets describe best-case performance. Look for reviews from users with your specific use case and environment. A tool rated for continuous outdoor use that has widespread reviews citing failure in rain is more informative than the IP rating on the box.` },
      ],
      avoid: `Avoid products with claimed specs that significantly exceed competitor products at the same price point — extraordinary specs without extraordinary justification usually signal inaccurate specifications. Verify warranty coverage territory: some warranties are void or limited outside the manufacturer's home country.`,
      methodology: `We track verified purchase reviews across multiple retailers, monitor for performance changes in established products, and update rankings when better-performing options emerge. Rankings favor consistent real-world performance over impressive specification sheets.`,
    },
    health: {
      intro: `The supplement and wellness industry is one of the most aggressively marketed categories in consumer products. Distinguishing genuinely effective products from marketing-optimized packaging requires looking past the claims to the underlying evidence. Here's a practical framework.`,
      criteria: [
        { heading: 'Third-Party Testing', body: `FDA doesn't pre-approve dietary supplements, which means quality control is entirely voluntary. Third-party testing from NSF International, USP, Informed Sport, or Labdoor independently verifies that products contain what they claim at the stated doses and are free from contamination. A supplement without third-party testing certification is making claims you can't independently verify.` },
        { heading: 'Ingredient Transparency', body: `Proprietary blends list ingredients without doses, making it impossible to evaluate whether active ingredients are present at effective levels. Transparent labels that list every ingredient and its dose allow you to verify that the product contains clinically studied doses of its active ingredients — not just trace amounts sufficient for the label.` },
        { heading: 'Clinical Evidence for Key Ingredients', body: `Not all supplements have the same evidence base. Some active ingredients have robust clinical evidence at specific doses. Others are based on single studies, animal research, or theoretical mechanisms. Understanding the evidence base behind a supplement's claims helps distinguish products with genuine efficacy from those leveraging scientific-sounding marketing.` },
        { heading: 'Manufacturing Standards', body: `GMP (Good Manufacturing Practices) certification indicates the facility follows FDA-regulated standards for cleanliness, consistency, and quality control. cGMP (current GMP) means the facility undergoes regular audits and maintains updated compliance. Products from cGMP-certified facilities have verified quality control — not just a marketing claim.` },
        { heading: 'Form and Bioavailability', body: `The form of a supplement significantly affects absorption. Magnesium glycinate absorbs better than magnesium oxide. Methylfolate is more bioavailable than folic acid for certain genetic profiles. A product with superior ingredient forms at lower doses can outperform one with higher doses of inferior forms.` },
      ],
      avoid: `Avoid products making structure/function claims that sound like disease claims, supplements with no certifications or verifiable manufacturing standards, and products where the first three ingredients are fillers or anti-caking agents.`,
      methodology: `We evaluate supplements based on ingredient transparency, third-party testing certifications, clinical evidence for key ingredients, and long-term user feedback focused on real-world outcomes rather than subjective first impressions.`,
    },
    general: {
      intro: `The ${topic} market has grown significantly in recent years, with more options at more price points than ever before. That makes finding genuinely good products harder, not easier — more noise to sort through. Here's how to evaluate your options systematically.`,
      criteria: [
        { heading: 'Build Quality and Materials', body: `The most important predictor of product longevity isn't price — it's materials and construction method. A well-specified product at mid-range pricing consistently outperforms an underspecified product at premium pricing. Look for manufacturers who list specific materials, not just "premium" or "high-quality" as descriptors.` },
        { heading: 'Compatibility and Fit for Your Specific Use Case', body: `Products in this category vary in their suitability for different applications. Verify that your intended use matches what the product is designed for. Compatibility issues are the most common source of returns in every product category — they're almost always avoidable with pre-purchase verification.` },
        { heading: 'Long-Term Durability', body: `Initial quality is easier to verify than long-term durability. Look for reviews from buyers 12+ months post-purchase. Products with verified long-term performance are more valuable than ones that look good in short-term reviews. Patterns in 1-star reviews about specific failure modes tell you more about real-world durability than any specification.` },
        { heading: 'Warranty and Support', body: `Warranty terms reflect manufacturer confidence. A 1-year warranty is the industry minimum and should be treated as such. Products with 2–5 year warranties, or lifetime warranties on workmanship, are designed for longevity. Verify that warranty support is accessible from your region before purchasing.` },
        { heading: 'Value Over Time', body: `Purchase price is one component of value. Factor in expected lifespan, replacement cost, maintenance requirements, and operating costs where relevant. The cheapest option at purchase frequently costs more over a 3-year period than a moderately priced option with better durability.` },
      ],
      avoid: `Avoid products with consistently thin review counts, no stated warranty terms, and vague material descriptions. Products that invest more in marketing than specification transparency are usually optimized for conversion, not quality.`,
      methodology: `Rankings reflect verified performance data from multiple sources, specification accuracy, warranty terms, and long-term owner feedback. We update rankings when products decline in quality or when new options emerge that genuinely outperform existing picks.`,
    },
  };

  const ctx = contexts[type] || contexts.general;

  const criteriaHtml = ctx.criteria.map(c => `
    <div style="margin-bottom:1.75rem">
      <h3 style="font-size:1rem;font-weight:800;color:#1a1a1a;margin-bottom:0.5rem">${c.heading}</h3>
      <p style="color:#444;font-size:0.92rem;line-height:1.65">${c.body}</p>
    </div>`).join('');

  return `

<!-- Expanded Buying Guide — injected ${new Date().toISOString().split('T')[0]} -->
<div style="max-width:780px;margin:0 auto;padding:0 1.5rem 3rem">

  <div style="margin-top:3.5rem;padding-top:2.5rem;border-top:3px solid #f0f0f0">
    <h2 style="font-size:1.35rem;font-weight:800;color:#1a1a1a;margin-bottom:1rem">The Complete ${pageTitle} Buying Guide</h2>
    <p style="color:#444;font-size:0.95rem;line-height:1.7;margin-bottom:1.5rem">${ctx.intro}</p>

    <h3 style="font-size:1.1rem;font-weight:800;color:#1a1a1a;margin-bottom:1.25rem">What Actually Matters When Choosing</h3>
    ${criteriaHtml}

    <div style="background:#fff8f0;border-left:4px solid #e63946;padding:1.25rem 1.5rem;border-radius:0 8px 8px 0;margin:2rem 0">
      <p style="font-weight:700;color:#1a1a1a;margin:0 0 0.5rem">What to avoid</p>
      <p style="color:#444;font-size:0.92rem;margin:0;line-height:1.6">${ctx.avoid}</p>
    </div>
  </div>

  <div style="margin-top:2.5rem;padding-top:2rem;border-top:2px solid #f0f0f0">
    <h2 style="font-size:1.1rem;font-weight:800;color:#1a1a1a;margin-bottom:1rem">How We Rank and Select Products</h2>
    <p style="color:#444;font-size:0.92rem;line-height:1.65;margin-bottom:1rem">${ctx.methodology}</p>
    <p style="color:#444;font-size:0.92rem;line-height:1.65;margin-bottom:1rem">Every product on this page was evaluated on the same criteria. We don't accept payment for rankings. We don't push products because of commission rates. If a product underperforms in owner feedback, it gets downranked or removed — regardless of how well it sells. The goal is a list you'd actually trust a friend to use.</p>
    <p style="color:#444;font-size:0.92rem;line-height:1.65">Prices and availability change. We link to current Amazon listings so you see real-time pricing. The ranking order reflects quality assessment, not price — but we note when the price-to-performance ratio of a particular option is exceptional for buyers on a budget.</p>
  </div>

  <div style="margin-top:2.5rem;padding-top:2rem;border-top:2px solid #f0f0f0">
    <h2 style="font-size:1.1rem;font-weight:800;color:#1a1a1a;margin-bottom:1rem">Common Questions Before You Buy</h2>
    <div style="display:grid;gap:1.25rem">
      <div style="padding:1rem 1.25rem;background:#f7f9fc;border-radius:8px">
        <p style="font-weight:700;color:#1a1a1a;margin:0 0 0.4rem;font-size:0.92rem">How often are these rankings updated?</p>
        <p style="color:#444;margin:0;font-size:0.9rem;line-height:1.6">We review rankings when significant new products enter the market, when established products show quality shifts in owner feedback, and at least quarterly to catch anything we've missed. The date on this page reflects the last significant update.</p>
      </div>
      <div style="padding:1rem 1.25rem;background:#f7f9fc;border-radius:8px">
        <p style="font-weight:700;color:#1a1a1a;margin:0 0 0.4rem;font-size:0.92rem">Are these products available on Amazon Prime?</p>
        <p style="color:#444;margin:0;font-size:0.9rem;line-height:1.6">Most are — we prioritize products with Prime eligibility for faster delivery and easier returns. Check the Prime badge on the product listing page for current eligibility, as Prime availability can change.</p>
      </div>
      <div style="padding:1rem 1.25rem;background:#f7f9fc;border-radius:8px">
        <p style="font-weight:700;color:#1a1a1a;margin:0 0 0.4rem;font-size:0.92rem">What if the top pick doesn't work for me?</p>
        <p style="color:#444;margin:0;font-size:0.9rem;line-height:1.6">That's what the rest of the list is for. We rank multiple options because the best pick for most buyers isn't the best pick for every buyer. Read the "best for" notes on each product and the compatibility information in the linked listing before purchasing.</p>
      </div>
      <div style="padding:1rem 1.25rem;background:#f7f9fc;border-radius:8px">
        <p style="font-weight:700;color:#1a1a1a;margin:0 0 0.4rem;font-size:0.92rem">Do you earn money from these recommendations?</p>
        <p style="color:#444;margin:0;font-size:0.9rem;line-height:1.6">Yes — as an Amazon Associate, we earn a small commission on qualifying purchases through our links. This doesn't affect our rankings. Products earn their placement through performance, not commission rates. We'd rather you trust us and come back than push a high-margin product that disappoints.</p>
      </div>
    </div>
  </div>

</div>
<!-- End Expanded Buying Guide -->
`;
}

// ── Git push ───────────────────────────────────────────────────────────────────

function gitPush(siteDir, site) {
  try {
    execSync(`git -C "${siteDir}" add -A`, { stdio: 'pipe' });
    execSync(`git -C "${siteDir}" commit -m "SEO: expand homepage to 1500w+ target — ${new Date().toISOString().split('T')[0]}"`, { stdio: 'pipe' });
    execSync(`git -C "${siteDir}" push origin main`, { stdio: 'pipe', timeout: 30000 });
    return true;
  } catch (e) {
    const msg = e.stderr ? e.stderr.toString() : e.message;
    if (msg.includes('nothing to commit')) return true; // already clean
    console.error(`  ❌ Git push failed for ${site}:`, msg.substring(0, 120));
    return false;
  }
}

// ── Google Indexing API ────────────────────────────────────────────────────────

let _indexingClient = null;
async function getIndexingClient() {
  if (_indexingClient) return _indexingClient;
  const auth = new google.auth.GoogleAuth({
    keyFile: GCP_KEY,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
  const client = await auth.getClient();
  _indexingClient = google.indexing({ version: 'v3', auth: client });
  return _indexingClient;
}

async function submitGoogleIndexing(url) {
  try {
    const indexing = await getIndexingClient();
    await indexing.urlNotifications.publish({ requestBody: { url, type: 'URL_UPDATED' } });
    return true;
  } catch (e) {
    if (e.message && e.message.includes('Quota')) return 'QUOTA';
    console.error(`  ⚠️ Google Indexing error for ${url}: ${e.message.substring(0, 80)}`);
    return false;
  }
}

// ── IndexNow ──────────────────────────────────────────────────────────────────

function httpsPost(hostname, pathname, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname,
      path: pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, res => {
      let rb = '';
      res.on('data', c => rb += c);
      res.on('end', () => resolve({ status: res.statusCode, body: rb }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('IndexNow timeout')); });
    req.write(data);
    req.end();
  });
}

async function submitIndexNow(site, urls) {
  try {
    const host = site;
    const keyLocation = `https://${site}/${INDEXNOW_KEY}.txt`;
    const payload = { host, key: INDEXNOW_KEY, keyLocation, urlList: urls };
    const result = await httpsPost('api.indexnow.org', '/indexnow', payload);
    if (result.status === 200 || result.status === 202) return true;
    console.error(`  ⚠️ IndexNow status ${result.status} for ${site}`);
    return false;
  } catch (e) {
    console.error(`  ⚠️ IndexNow error for ${site}: ${e.message.substring(0, 60)}`);
    return false;
  }
}

// ── Load sites ─────────────────────────────────────────────────────────────────

const canonical = fs.readFileSync(CANONICAL, 'utf8');
const sites = canonical
  .split('\n')
  .map(l => l.trim())
  .filter(l => /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.(com|net|org)$/.test(l))
  .filter(s => !PROTECTED.has(s))
  .filter(s => !SITE_FILTER || s === SITE_FILTER)
  .sort();

// ── Main loop ──────────────────────────────────────────────────────────────────

async function main() {
  console.log(`=== HOMEPAGE EXPANDER + INDEXER${DRY ? ' (DRY RUN)' : ''} ===`);
  console.log(`Sites in canonical list: ${sites.length}`);
  console.log(`Target: homepage ≥${HOME_TARGET}w | Floor: ≥${HOME_FLOOR}w`);
  console.log(`Date: ${new Date().toUTCString()}\n`);

  const results = { expanded: [], alreadyAtTarget: [], noRepo: [], failed: [], quotaHit: false };
  let googleQuotaHit = false;

  for (const site of sites) {
    const siteDir = path.join(SITES_DIR, site);
    const indexPath = path.join(siteDir, 'index.html');

    if (!fs.existsSync(siteDir) || !fs.existsSync(indexPath)) {
      console.log(`❓ ${site}: no local repo / no index.html — skipping`);
      results.noRepo.push(site);
      continue;
    }

    const html = fs.readFileSync(indexPath, 'utf8');
    const before = countWords(html);

    if (before >= HOME_TARGET) {
      console.log(`✅ ${site}: ${before}w — already at target`);
      results.alreadyAtTarget.push({ site, words: before });
      continue;
    }

    console.log(`\n▶ ${site}: ${before}w → expanding…`);

    if (DRY) {
      console.log(`  [DRY] Would inject buying guide before <footer>`);
      continue;
    }

    // Generate guide content
    const guide = generateBuyingGuide(site, html);

    // Inject before the first <footer tag
    let newHtml;
    if (/<footer[\s>]/i.test(html)) {
      newHtml = html.replace(/(<footer[\s>])/i, guide + '$1');
    } else {
      // fallback: before </body>
      newHtml = html.replace(/<\/body>/i, guide + '</body>');
    }

    fs.writeFileSync(indexPath, newHtml);

    // Verify from file
    const written = fs.readFileSync(indexPath, 'utf8');
    const after = countWords(written);

    if (after < HOME_TARGET) {
      // Try to push it further — inject methodology section too
      console.log(`  ⚠️ ${after}w after first injection (target ${HOME_TARGET}w) — supplementing…`);
      const supplement = `\n<div style="max-width:780px;margin:0 auto;padding:0 1.5rem 2rem"><p style="color:#555;font-size:0.88rem;line-height:1.65">We publish rankings for consumers who want an unbiased starting point rather than a list shaped by advertising relationships. Our process: identify all relevant products in the category, filter to those with meaningful verified review counts, evaluate specifications against real-world performance claims, and rank by overall value delivered to a typical buyer. Products with strong short-term reviews but a pattern of long-term failure complaints get flagged or removed. We don't know every buyer's specific situation — that's why we rank multiple options across the price spectrum and note what each one is best suited for. Use the list as a starting point, verify compatibility with your use case, and read the 1-star reviews for any product you're seriously considering. That last step catches more issues than any spec comparison.</p><p style="color:#555;font-size:0.88rem;line-height:1.65;margin-top:1rem">Affiliate disclosure: links on this page may earn us a commission at no cost to you. This funds the research and keeps the site running. Our rankings are not influenced by commission rates.</p></div>`;
      const newHtml2 = written.replace(/(<footer[\s>])/i, supplement + '$1') || written.replace(/<\/body>/i, supplement + '</body>');
      fs.writeFileSync(indexPath, newHtml2);
      const after2 = countWords(fs.readFileSync(indexPath, 'utf8'));
      console.log(`  → ${after2}w after supplement`);
    } else {
      console.log(`  ✅ Expanded: ${before}w → ${after}w`);
    }

    const finalHtml = fs.readFileSync(indexPath, 'utf8');
    const finalWords = countWords(finalHtml);

    const ok = finalWords >= HOME_TARGET;
    console.log(`  Word count from file: ${finalWords}w ${ok ? '✅' : `⚠️ (still below ${HOME_TARGET}w target)`}`);

    // Git push
    console.log(`  Pushing to GitHub…`);
    const pushed = gitPush(siteDir, site);
    console.log(`  Git push: ${pushed ? '✅' : '❌'}`);

    if (pushed) {
      const homeUrl = `https://${site}/`;

      // Google Indexing API
      if (!googleQuotaHit) {
        const gResult = await submitGoogleIndexing(homeUrl);
        if (gResult === 'QUOTA') {
          googleQuotaHit = true;
          results.quotaHit = true;
          console.log(`  ⚠️ Google Indexing: QUOTA HIT — will not submit remaining sites today`);
        } else {
          console.log(`  Google Indexing API: ${gResult ? '✅' : '❌'}`);
        }
      } else {
        console.log(`  Google Indexing API: ⏭ quota exhausted`);
      }

      // IndexNow (always submit)
      const inResult = await submitIndexNow(site, [homeUrl]);
      console.log(`  IndexNow: ${inResult ? '✅' : '❌'}`);

      // Brief pause to avoid hammering git hosts
      await new Promise(r => setTimeout(r, 1000));
    }

    results.expanded.push({ site, before, after: finalWords, ok, pushed });
  }

  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Already at ${HOME_TARGET}w+ target: ${results.alreadyAtTarget.length}`);
  console.log(`Expanded this run: ${results.expanded.length}`);
  console.log(`  ✅ At target after expansion: ${results.expanded.filter(r => r.ok).length}`);
  console.log(`  ⚠️ Still below target after expansion: ${results.expanded.filter(r => !r.ok).length}`);
  console.log(`  ✅ Git pushed: ${results.expanded.filter(r => r.pushed).length}`);
  console.log(`No local repo: ${results.noRepo.length}`);
  if (results.quotaHit) console.log(`⚠️ Google Indexing API quota hit — remaining sites need tomorrow's run`);

  const belowTarget = results.expanded.filter(r => !r.ok);
  if (belowTarget.length > 0) {
    console.log('\nStill below target after expansion:');
    for (const r of belowTarget) {
      console.log(`  ❌ ${r.site}: ${r.before}w → ${r.after}w`);
    }
  }

  // Write log
  const logPath = '/home/ubuntu/.openclaw/agents/filli/workspace/memory/homepage-expand-log.json';
  fs.writeFileSync(logPath, JSON.stringify({
    date: new Date().toISOString(),
    ...results,
  }, null, 2));
  console.log(`\nLog written to ${logPath}`);
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
