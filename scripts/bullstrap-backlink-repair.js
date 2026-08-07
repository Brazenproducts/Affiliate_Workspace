#!/usr/bin/env node

/**
 * Bull Strap Backlink Health & Repair
 * - Checks every collection link used in blog posts (from memory/bullstrap-blog-state.json)
 * - Verifies against live Shopify data
 * - Auto-repairs dead/empty collections by swapping in live alternatives
 * - Reports health status and repairs made
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const WORKSPACE = process.env.WORKSPACE || '/home/ubuntu/.openclaw/workspace';
const STATE_FILE = path.join(WORKSPACE, 'memory', 'bullstrap-blog-state.json');
const COLLECTIONS_FILE = path.join(WORKSPACE, 'memory', 'bullstrap-collections.json');
const ENV_FILE = path.join(WORKSPACE, '.env');
const REPAIR_LOG = path.join(WORKSPACE, 'memory', 'bullstrap-backlink-repair.log');

const SHOPIFY_SHOP = 'bullstrap.myshopify.com';
const BLOG_ID = 96543015185;

/**
 * Load environment variables
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
 * Load collections master list
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
 * Load blog state file
 */
function loadState() {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      console.warn(`Blog state file not found: ${STATE_FILE}`);
      return { articles: [] };
    }
    const data = fs.readFileSync(STATE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error loading state: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Make HTTPS request to Shopify API
 */
function shopifyRequest(method, path, body = null, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SHOPIFY_SHOP,
      path: path,
      method: method,
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Check if a collection exists and has products
 */
async function checkCollectionHealth(collectionId, token) {
  try {
    const res = await shopifyRequest(
      'GET',
      `/admin/api/2024-01/collections/${collectionId}.json`,
      null,
      token
    );

    if (res.status === 404) {
      return { exists: false, healthy: false, productCount: 0 };
    }

    if (res.status === 200 && res.body.collection) {
      const col = res.body.collection;
      // Try to get product count
      const productsRes = await shopifyRequest(
        'GET',
        `/admin/api/2024-01/collections/${collectionId}/products.json?limit=1`,
        null,
        token
      );

      const productCount = productsRes.body.products ? productsRes.body.products.length : 0;
      return {
        exists: true,
        healthy: productCount > 0,
        productCount: productCount,
        title: col.title
      };
    }

    return { exists: false, healthy: false, productCount: 0 };
  } catch (err) {
    console.error(`Error checking collection ${collectionId}: ${err.message}`);
    return { exists: false, healthy: false, productCount: 0, error: err.message };
  }
}

/**
 * Find best topically-similar replacement collection
 */
function findReplacementCollection(deadCollection, allCollections, masterList, usedCollectionIds) {
  const deadTitle = deadCollection.title ? deadCollection.title.toLowerCase() : '';
  
  // Get list of available collections (not already used elsewhere)
  const available = allCollections.filter(col => !usedCollectionIds.includes(col.id));

  if (available.length === 0) {
    return null; // No replacements available
  }

  // Score collections by keyword similarity
  const scored = available.map(col => {
    const colTitle = col.title.toLowerCase();
    let score = 0;

    // Exact phrase match
    if (colTitle.includes(deadTitle)) score += 100;
    
    // Keyword overlap (split by common words)
    const deadWords = deadTitle.split(/[\s\-,]+/).filter(w => w.length > 2);
    const colWords = colTitle.split(/[\s\-,]+/).map(w => w.toLowerCase());
    deadWords.forEach(word => {
      if (colWords.some(cw => cw.includes(word) || word.includes(cw))) {
        score += 20;
      }
    });

    // Prefer collections with similar category type
    if ((deadTitle.includes('suspension') && colTitle.includes('suspension')) ||
        (deadTitle.includes('brake') && colTitle.includes('brake')) ||
        (deadTitle.includes('light') && colTitle.includes('light')) ||
        (deadTitle.includes('wheel') && colTitle.includes('wheel'))) {
      score += 50;
    }

    return { col, score };
  });

  // Sort by score descending and return top match
  scored.sort((a, b) => b.score - a.score);
  return scored[0] ? scored[0].col : available[0];
}

/**
 * Update blog article with repaired backlinks
 */
async function repairArticleBacklinks(articleId, newBacklinks, token) {
  try {
    // Fetch current article to get its content
    const getRes = await shopifyRequest(
      'GET',
      `/admin/api/2024-01/blogs/${BLOG_ID}/articles/${articleId}.json`,
      null,
      token
    );

    if (getRes.status !== 200) {
      return { success: false, error: 'Could not fetch article' };
    }

    const article = getRes.body.article;
    let bodyHtml = article.body_html || '';

    // Replace collection links in body
    newBacklinks.forEach(({ old, new: newLink }) => {
      const oldPattern = new RegExp(`/collections/${old}`, 'gi');
      bodyHtml = bodyHtml.replace(oldPattern, `/collections/${newLink}`);
    });

    // Update the article
    const updateRes = await shopifyRequest(
      'PUT',
      `/admin/api/2024-01/blogs/${BLOG_ID}/articles/${articleId}.json`,
      {
        article: {
          id: articleId,
          body_html: bodyHtml
        }
      },
      token
    );

    return { success: updateRes.status === 200 };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Main repair function
 */
async function runRepair() {
  const env = loadEnv();
  const shopToken = env.SHOPIFY_TOKEN_BULLSTRAP;

  if (!shopToken) {
    console.error('Error: SHOPIFY_TOKEN_BULLSTRAP not found in .env');
    process.exit(1);
  }

  const state = loadState();
  const masterCollections = loadCollections();

  if (!state.articles || state.articles.length === 0) {
    console.log('No blog articles tracked in state file yet.');
    process.exit(0);
  }

  const logLines = [];
  let totalChecked = 0;
  let totalHealthy = 0;
  let totalRepaired = 0;
  const repairDetails = [];

  console.log(`\n=== Bull Strap Backlink Health Check ===`);
  console.log(`Checking ${state.articles.length} articles with backlinks...\n`);

  // Get all used collection IDs
  const usedCollectionIds = state.articles
    .flatMap(article => article.backlinks || [])
    .map(handle => {
      const col = masterCollections.find(c => c.handle === handle);
      return col ? col.id : null;
    })
    .filter(id => id !== null);

  // Check each article's backlinks
  for (const article of state.articles) {
    if (!article.backlinks || article.backlinks.length === 0) {
      continue;
    }

    console.log(`\nArticle: "${article.title}"`);
    console.log(`  Backlinks to check: ${article.backlinks.length}`);

    const repairsForArticle = [];

    for (const collectionHandle of article.backlinks) {
      // Find collection ID from handle
      const collection = masterCollections.find(c => c.handle === collectionHandle);
      if (!collection) {
        console.log(`  ⚠️  Collection not found in master list: ${collectionHandle}`);
        totalChecked++;
        continue;
      }

      totalChecked++;

      // Check health
      const health = await checkCollectionHealth(collection.id, shopToken);

      if (health.healthy) {
        console.log(`  ✅ Healthy: ${collectionHandle} (${health.productCount} products)`);
        totalHealthy++;
      } else if (health.exists) {
        console.log(`  ⚠️  Empty: ${collectionHandle} (${health.productCount} products)`);
        
        // Find replacement
        const replacement = findReplacementCollection(collection, masterCollections, masterCollections, usedCollectionIds);
        
        if (replacement) {
          console.log(`     → Repair: Replace with "${replacement.title}" (${replacement.handle})`);
          repairsForArticle.push({
            old: collectionHandle,
            new: replacement.handle,
            oldId: collection.id,
            newId: replacement.id,
            oldTitle: collection.title,
            newTitle: replacement.title
          });
          totalRepaired++;
          repairDetails.push({
            article: article.title,
            oldCollection: `${collection.title} (${collectionHandle})`,
            newCollection: `${replacement.title} (${replacement.handle})`
          });
        } else {
          console.log(`     → No suitable replacement found`);
        }
      } else {
        console.log(`  ❌ Dead: ${collectionHandle} (not found)`);
        
        const replacement = findReplacementCollection(collection, masterCollections, masterCollections, usedCollectionIds);
        
        if (replacement) {
          console.log(`     → Repair: Replace with "${replacement.title}" (${replacement.handle})`);
          repairsForArticle.push({
            old: collectionHandle,
            new: replacement.handle,
            oldId: collection.id,
            newId: replacement.id,
            oldTitle: collection.title,
            newTitle: replacement.title
          });
          totalRepaired++;
          repairDetails.push({
            article: article.title,
            oldCollection: `${collection.title} (${collectionHandle})`,
            newCollection: `${replacement.title} (${replacement.handle})`
          });
        } else {
          console.log(`     → No suitable replacement found`);
        }
      }
    }

    // Apply repairs to article
    if (repairsForArticle.length > 0) {
      console.log(`  📝 Updating article with ${repairsForArticle.length} repair(s)...`);
      if (article.shopify_id) {
        const updateResult = await repairArticleBacklinks(article.shopify_id, repairsForArticle, shopToken);
        if (updateResult.success) {
          console.log(`  ✅ Article updated`);
        } else {
          console.log(`  ❌ Failed to update article: ${updateResult.error}`);
        }
      }
    }
  }

  // Summary
  console.log(`\n=== Summary ===`);
  console.log(`Total links checked: ${totalChecked}`);
  console.log(`Healthy links: ${totalHealthy}`);
  console.log(`Links repaired: ${totalRepaired}`);

  if (repairDetails.length > 0) {
    console.log(`\n=== Repair Details ===`);
    repairDetails.forEach(repair => {
      console.log(`Article: "${repair.article}"`);
      console.log(`  ${repair.oldCollection} → ${repair.newCollection}`);
    });
  }

  // Save log
  logLines.push(`Ran at: ${new Date().toISOString()}`);
  logLines.push(`Total links checked: ${totalChecked}`);
  logLines.push(`Healthy links: ${totalHealthy}`);
  logLines.push(`Links repaired: ${totalRepaired}`);
  if (repairDetails.length > 0) {
    logLines.push(`\nRepairs:`);
    repairDetails.forEach(repair => {
      logLines.push(`  "${repair.article}": ${repair.oldCollection} → ${repair.newCollection}`);
    });
  }
  logLines.push('');

  const existingLog = fs.existsSync(REPAIR_LOG) ? fs.readFileSync(REPAIR_LOG, 'utf8') : '';
  fs.writeFileSync(REPAIR_LOG, logLines.join('\n') + existingLog, 'utf8');

  console.log(`\nLog saved to: ${REPAIR_LOG}`);
}

// Run
runRepair().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
