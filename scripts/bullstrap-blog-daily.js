#!/usr/bin/env node

/**
 * Bull Strap Dedicated Blog Generator
 * Publishes ONE SEO blog post to bullstrap.com (Shopify blog id 96543015185)
 * - Picks from ~800 usable Turn14 collections (auto parts only, no apparel/gear)
 * - Generates content with 3 internal backlinks (1 primary + 2 secondary)
 * - Tracks used collections to avoid repeats until full catalog cycles
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const WORKSPACE = process.env.WORKSPACE || '/home/ubuntu/.openclaw/workspace';
const COLLECTIONS_FILE = path.join(WORKSPACE, 'memory', 'bullstrap-collections.json');
const STATE_FILE = path.join(WORKSPACE, 'memory', 'bullstrap-blog-state.json');
const ENV_FILE = path.join(WORKSPACE, '.env');

// Constants
const SHOPIFY_SHOP = 'bull-strap-78.myshopify.com';
const BLOG_ID = 96543015185;
const EXCLUDED_KEYWORDS = ['apparel', 'gear', 'clothing', 'fashion', 'hat', 'shirt', 'jacket'];

/**
 * Load environment variables from .env
 */
function loadEnv() {
  try {
    const envContent = fs.readFileSync(ENV_FILE, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        env[match[1].trim()] = match[2].trim();
      }
    });
    return env;
  } catch (err) {
    console.error(`Error reading .env: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Load collections from memory file
 */
function loadCollections() {
  try {
    const data = fs.readFileSync(COLLECTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error loading collections: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Load or initialize state tracking
 */
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn(`Could not load state, creating fresh: ${err.message}`);
  }
  return {
    usedCollections: [],
    lastPostTitle: null,
    lastPostUrl: null,
    lastPublished: null,
    cycleNumber: 1
  };
}

/**
 * Save state
 */
function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

/**
 * Filter collections: auto parts only, no apparel/gear
 */
function filterUsableCollections(allCollections) {
  if (!Array.isArray(allCollections)) {
    console.error('Collections data is not an array');
    process.exit(1);
  }

  return allCollections.filter(col => {
    if (!col || !col.title) return false;
    const title = col.title.toLowerCase();
    
    // Exclude apparel/gear/clothing categories
    if (EXCLUDED_KEYWORDS.some(kw => title.includes(kw))) {
      return false;
    }
    
    // Include if it looks like an auto part collection
    return col.id && col.title;
  });
}

// Brand-specific blog topics keyed to priority sweep phases
// Each entry: { brand, vehicles, keyword, angle }
const BRAND_BLOG_TOPICS = [
  // Suspension phase
  { brand: 'Carli', vehicles: ['Ram 2500', 'Ram 3500', 'Ford F-250', 'Ford F-350'], keyword: 'Carli Suspension lift kit Ram 2500', angle: 'Carli Suspension is the gold standard for serious HD truck builds. Coil springs, track bars, radius arms, bump stop drops, and steering stabilizers purpose-built for Ram 2500/3500 and Ford F-250/F-350 — with trim-level fitment for every configuration from Tradesman to Power Wagon.' },
  { brand: 'ICON', vehicles: ['Ford Bronco', 'Ford F-150', 'Toyota Tacoma', 'Jeep Wrangler'], keyword: 'ICON suspension coilovers', angle: 'ICON Vehicle Dynamics coilovers and suspension kits — the best 2-3 inch lift options for Bronco, F-150, Tacoma, and Wrangler.' },
  { brand: 'Fox', vehicles: ['Ford Raptor', 'Toyota Tundra', 'Jeep Wrangler JL', 'Ram 1500 TRX'], keyword: 'Fox shocks lift kit', angle: 'Fox Racing Shox performance shocks and coilovers — bolt-on upgrades for Raptor, TRX, Tundra, and Wrangler JL.' },
  { brand: 'Bilstein', vehicles: ['Ram 2500', 'Ford F-250', 'Chevrolet Silverado 2500', 'GMC Sierra 2500'], keyword: 'Bilstein shocks heavy duty truck', angle: 'Bilstein B8 and 5100 series shocks for heavy duty trucks — the best replacement and lift shocks for Ram 2500, F-250, and Silverado 2500.' },
  { brand: 'Rancho', vehicles: ['Jeep Wrangler', 'Ford F-150', 'Chevrolet Colorado', 'Toyota 4Runner'], keyword: 'Rancho suspension lift kit', angle: 'Rancho suspension lift kits — complete systems for Jeep Wrangler, F-150, Colorado, and 4Runner with RS9000XL adjustable shocks.' },
  { brand: 'Fabtech', vehicles: ['Ford F-150', 'Chevrolet Silverado 1500', 'Toyota Tacoma', 'Jeep Wrangler JK'], keyword: 'Fabtech lift kit', angle: 'Fabtech suspension lift kits — 4-6 inch lifts for F-150, Silverado 1500, Tacoma, and Wrangler JK with Dirt Logic shocks.' },
  { brand: 'ReadyLift', vehicles: ['Ram 1500', 'Ford F-150', 'Chevrolet Silverado 1500', 'Toyota Tundra'], keyword: 'ReadyLift leveling kit', angle: 'ReadyLift SST leveling kits and lift kits — the most popular bolt-on lift for Ram 1500, F-150, Silverado, and Tundra.' },
  { brand: 'Rough Country', vehicles: ['Jeep Wrangler JK', 'Jeep Wrangler JL', 'Ford F-150', 'Chevrolet Silverado'], keyword: 'Rough Country lift kit', angle: 'Rough Country lift kits — budget-friendly 2-6 inch lifts for Wrangler JK/JL, F-150, and Silverado with N3 shocks.' },
  { brand: 'Eibach', vehicles: ['Ford Mustang', 'Chevrolet Camaro', 'Subaru WRX', 'Volkswagen GTI'], keyword: 'Eibach springs lowering kit', angle: 'Eibach Pro-Kit and Sport-Line springs — precision lowering for Mustang, Camaro, WRX, and GTI with improved handling and stance.' },
  { brand: 'KW', vehicles: ['BMW 3 Series', 'Audi A4', 'Volkswagen Golf R', 'Porsche 911'], keyword: 'KW coilovers suspension', angle: 'KW Variant coilover kits — adjustable suspension for BMW, Audi, VW, and Porsche with German engineering and TÜV certification.' },
];

/**
 * Pick next collection to blog about — category-aware
 */
function pickNextCollection(usable, state) {
  // Try to pick based on current priority sweep phase
  try {
    const sweepState = JSON.parse(fs.readFileSync(
      path.join(WORKSPACE, 'memory', 'bullstrap-priority-sweep-state.json'), 'utf8'
    ));
    const phases = [
      ['Carli','ICON','Fox','Bilstein','Rancho','Fabtech','Skyjacker','SuperLift','Zone Offroad','Old Man Emu','ARB','Eibach','KW','Tein','Whiteline','Moog','ReadyLift','Rough Country','Dobinsons','King'],
      ['Method Race Wheels','Black Rhino','Fuel','KMC','Mickey Thompson','BFGoodrich','Nitto','Toyo'],
      ['ARB','Warn','Smittybilt','Rugged Ridge','Bushwacker','Lund','Westin','AMP Research'],
      ['Covercraft','WeatherTech','3D MAXpider','Husky Liners'],
      ['K&N','aFe','Banks Power','Borla','Magnaflow','Flowmaster','MBRP'],
    ];
    const currentBrands = phases[sweepState.phase] || phases[0];
    const currentBrand = currentBrands[sweepState.brandIndex] || currentBrands[0];
    // Find a collection matching current brand that hasn't been used
    const brandMatch = usable.find(col =>
      !state.usedCollections.includes(col.id) &&
      col.title.toLowerCase().includes(currentBrand.toLowerCase())
    );
    if (brandMatch) return brandMatch;
    // Fallback: any suspension/lift collection not yet used
    const suspMatch = usable.find(col =>
      !state.usedCollections.includes(col.id) &&
      currentBrands.some(b => col.title.toLowerCase().includes(b.toLowerCase()))
    );
    if (suspMatch) return suspMatch;
  } catch (e) { /* sweep state not available, fall through */ }

  // Final fallback: next unused collection
  for (const col of usable) {
    if (!state.usedCollections.includes(col.id)) return col;
  }
  console.log('Collection cycle completed, resetting for next cycle');
  state.usedCollections = [];
  state.cycleNumber++;
  return usable[0];
}

/**
 * Pick related secondary collections for backlinks
 */
function pickRelatedCollections(primary, usable, count = 2) {
  const related = [];
  const primaryTitle = primary.title.toLowerCase();
  
  // Try to find semantically related collections
  const candidates = usable.filter(col => 
    col.id !== primary.id &&
    !related.some(r => r.id === col.id)
  );
  
  // Sort by relevance (simple: shared keywords)
  candidates.sort((a, b) => {
    const aMatch = primaryTitle.split(/\s+/).filter(word => 
      a.title.toLowerCase().includes(word)
    ).length;
    const bMatch = primaryTitle.split(/\s+/).filter(word => 
      b.title.toLowerCase().includes(word)
    ).length;
    return bMatch - aMatch;
  });
  
  return candidates.slice(0, count);
}

/**
 * Generate SEO blog post content
 */
function generatePostContent(primaryCollection, relatedCollections) {
  // Find brand-specific topic if available
  const colTitle = primaryCollection.title;
  const brandTopic = BRAND_BLOG_TOPICS.find(t =>
    colTitle.toLowerCase().includes(t.brand.toLowerCase())
  );

  const relatedLinks = relatedCollections
    .map(col => `<a href="/collections/${col.handle}">${col.title}</a>`)
    .join(', ');

  let title, content, tags;

  if (brandTopic) {
    const isCarli = brandTopic.brand === 'Carli';
    const vehicleList = brandTopic.vehicles.map(v => `<li>${v}</li>`).join('');

    if (isCarli) {
      // Carli gets its own deep-dive template — our #1 priority brand
      title = `Carli Suspension ${colTitle} for ${brandTopic.vehicles[0]} — Complete Fitment Guide (${new Date().getFullYear()})`;
      content = `
<p>${brandTopic.angle}</p>

<h2>Carli Suspension for Ram 2500 and Ram 3500</h2>
<p>Carli builds their entire suspension lineup specifically for the Cummins and Hemi-powered Ram 2500 and 3500. Every component — coil springs, track bars, radius arms, bump stop drops, and steering stabilizers — is engineered to work together as a system. That means no mixing and matching from different brands hoping it all works out.</p>
<p>Compatible trim levels include Big Horn, Laramie, Laramie Longhorn, Limited, Lone Star, Power Wagon, Rebel, SLT, and Tradesman. Fitment details for your specific year and trim are listed on every product page.</p>

<h2>Carli Suspension for Ford F-250 and F-350 Super Duty</h2>
<p>The Super Duty lineup gets the same treatment. Carli's F-250 and F-350 components cover 2005 through current model years, with specific kits for XL, XLT, Lariat, King Ranch, Platinum, and Tremor trims. Radius arm drop brackets, coil springs, track bars, and steering stabilizers are all available as individual components or complete systems.</p>

<h2>How to Choose the Right Carli System</h2>
<ul>
<li><strong>Lift height</strong> — Carli offers 1”, 2”, 2.5”, and 3.5”+ lift options depending on the platform; choose based on tire size and intended use</li>
<li><strong>Trim level</strong> — Power Wagon owners have different needs than Tradesman owners; check the fitment table on each product page</li>
<li><strong>Build stage</strong> — Carli components are sold individually so you can build up a complete system over time or buy everything at once</li>
<li><strong>Driving use</strong> — towing and daily driving favor different spring rates than dedicated off-road builds</li>
</ul>

<h2>Why Buy Carli from Bull Strap?</h2>
<p>Bull Strap is an authorized Carli dealer carrying the full product lineup. Every Carli product listing includes a detailed compatibility table showing exactly which year, make, model, and trim level each component fits — so you know before you order.</p>

<h2>Browse Related Carli Categories</h2>
<p>See also: ${relatedLinks}.</p>
`;
      tags = ['Carli Suspension', 'Carli lift kit', 'Ram 2500 suspension', 'Ram 3500 suspension', 'Ford F-250 suspension', 'Ford F-350 suspension', colTitle, brandTopic.keyword];
    } else {
      // Standard brand-specific buyer-intent post
      title = `Best ${brandTopic.brand} ${colTitle} for ${brandTopic.vehicles[0]} (${new Date().getFullYear()} Guide)`;
      content = `
<p>${brandTopic.angle}</p>

<h2>Which Vehicles Does ${brandTopic.brand} ${colTitle} Fit?</h2>
<p>The ${brandTopic.brand} lineup in this category covers:</p>
<ul>${vehicleList}</ul>
<p>Fitment details for your specific year and trim level are listed on every product page at Bull Strap.</p>

<h2>Why Buy ${brandTopic.brand} from Bull Strap?</h2>
<p>Every ${brandTopic.brand} product at Bull Strap includes a full compatibility table — year, make, model, and trim level. No guessing whether it fits your specific vehicle.</p>

<h2>How to Choose the Right ${colTitle}</h2>
<ul>
<li><strong>Lift height</strong> — match to your tire size and clearance goals</li>
<li><strong>Vehicle trim</strong> — fitment can vary by trim level; check the table on each product page</li>
<li><strong>Driving use</strong> — daily driver, weekend trail, or competition build each need different setups</li>
</ul>

<h2>Browse Related Categories</h2>
<p>See also: ${relatedLinks}.</p>
`;
      tags = [brandTopic.brand, colTitle, brandTopic.keyword, brandTopic.vehicles[0], 'suspension', 'lift kit'];
    }
  } else {
    // Generic but still useful post
    title = `${colTitle} — Fitment Guide for Popular Trucks and SUVs (${new Date().getFullYear()})`;
    content = `
<p>Find the right ${colTitle.toLowerCase()} for your truck or SUV. Every product at Bull Strap includes a full fitment table showing compatible years, makes, models, and trim levels — so you know exactly what fits before you order.</p>

<h2>Why Fitment Matters for ${colTitle}</h2>
<p>Not all ${colTitle.toLowerCase()} fit every vehicle the same way. Differences in trim level, suspension configuration, and wheel offset mean what works on a base model may not work on a higher trim. That's why every product page at Bull Strap lists compatible trims — not just year and model.</p>

<h2>Popular Vehicle Fitments in This Category</h2>
<p>The ${colTitle} collection covers a wide range of trucks, SUVs, and off-road vehicles. Use the fitment filter on the collection page to narrow down products for your specific vehicle.</p>

<h2>Related Categories</h2>
<p>See also: ${relatedLinks}.</p>
`;
    tags = [colTitle, 'fitment guide', 'truck parts', 'SUV parts', 'suspension'];
  }

  return {
    title,
    body: content.trim(),
    tags,
    backlinks: [primaryCollection.handle, ...relatedCollections.map(c => c.handle)],
    backlinksCount: 1 + relatedCollections.length
  };
}

/**
 * Create blog article via Shopify API
 */
function createBlogArticle(shopToken, postData) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SHOPIFY_SHOP,
      path: `/admin/api/2024-01/blogs/${BLOG_ID}/articles.json`,
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': shopToken,
        'Content-Type': 'application/json'
      }
    };

    const payload = JSON.stringify({
      article: {
        title: postData.title,
        body_html: postData.body,
        tags: postData.tags.join(', '),
        published: true
      }
    });

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const response = JSON.parse(data);
            resolve(response.article);
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        } else {
          reject(new Error(`API error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Main execution
 */
async function main() {
  const env = loadEnv();
  const token = env.SHOPIFY_TOKEN_BULLSTRAP;

  if (!token) {
    console.error('SHOPIFY_TOKEN_BULLSTRAP not found in .env');
    process.exit(1);
  }

  // Load data
  const allCollections = loadCollections();
  const usable = filterUsableCollections(allCollections);
  const state = loadState();

  console.log(`✓ Loaded ${usable.length} usable collections (auto parts only)`);

  // Pick primary collection
  const primaryCollection = pickNextCollection(usable, state);
  if (!primaryCollection) {
    console.error('No collections available');
    process.exit(1);
  }

  // Pick related collections
  const relatedCollections = pickRelatedCollections(primaryCollection, usable, 2);

  // Generate content
  const postData = generatePostContent(primaryCollection, relatedCollections);

  console.log(`\n📝 Generating post for: ${primaryCollection.title}`);
  console.log(`🔗 Backlinks: ${postData.backlinksCount} (1 primary + 2 secondary)`);
  console.log(`   Primary: ${primaryCollection.handle}`);
  relatedCollections.forEach(col => {
    console.log(`   Related: ${col.handle}`);
  });

  try {
    // Publish to Shopify
    console.log('\n📤 Publishing to Shopify...');
    const article = await createBlogArticle(token, postData);

    // Update state
    state.usedCollections.push(primaryCollection.id);
    state.lastPostTitle = postData.title;
    state.lastPostUrl = `https://bullstrap.com/blogs/news/${article.handle}`;
    state.lastPublished = new Date().toISOString();
    saveState(state);

    console.log('\n✅ SUCCESS');
    console.log(`Title: ${postData.title}`);
    console.log(`URL: ${state.lastPostUrl}`);
    console.log(`Backlinks included: ${postData.backlinksCount}`);
    
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
