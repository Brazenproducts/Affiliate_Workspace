const fs = require('fs');
const lib = require('./bullstrap-seo-lib.js');

const LOG_FILE = lib.LOG_FILE;
let changeLog = lib.changeLog;
let processed = 0;
let updated = 0;
let skipped = 0;
let errors = 0;

async function upsertMetafield(productId, existingMetafield, key, value) {
  const body = existingMetafield
    ? {
        metafield: {
          id: existingMetafield.id,
          value,
          type: existingMetafield.type || 'single_line_text_field'
        }
      }
    : {
        metafield: {
          namespace: 'global',
          key,
          value,
          type: 'single_line_text_field'
        }
      };

  const path = existingMetafield
    ? `/metafields/${existingMetafield.id}.json`
    : `/products/${productId}/metafields.json`;
  const method = existingMetafield ? 'PUT' : 'POST';
  const result = await lib.shopifyRequest(method, path, body);
  if (result.rateLimited) {
    const wait = (parseInt(result.retryAfter) || 2) * 1000;
    console.log(`  Rate limited, waiting ${wait}ms...`);
    await lib.sleep(wait);
    return upsertMetafield(productId, existingMetafield, key, value);
  }
  if (result.errors) {
    throw new Error(JSON.stringify(result.errors));
  }
  return result;
}

async function processProduct(product) {
  const fitment = lib.extractFitment(product.tags);
  const newTitle = lib.generateSeoTitle(product, fitment);
  const newDesc = lib.generateSeoDescription(product, fitment);
  
  // Check existing metafields
  const existingMeta = await lib.shopifyRequest('GET', `/products/${product.id}/metafields.json?namespace=global`);
  await lib.sleep(lib.DELAY_MS);
  
  if (existingMeta.rateLimited) {
    const wait = (parseInt(existingMeta.retryAfter) || 2) * 1000;
    await lib.sleep(wait);
    return processProduct(product);
  }
  
  const metafields = existingMeta.metafields || [];
  const existingTitle = metafields.find(m => m.key === 'title_tag');
  const existingDesc = metafields.find(m => m.key === 'description_tag');
  
  const oldTitle = existingTitle ? existingTitle.value : '';
  const oldDesc = existingDesc ? existingDesc.value : '';
  
  // Skip if already well-optimized and description is present
  if (
    oldTitle && oldTitle.includes('| Bull Strap') && oldTitle.length >= 45 && oldTitle.length <= 70 &&
    oldDesc && oldDesc.length >= 110
  ) {
    skipped++;
    return;
  }

  if (oldTitle === newTitle && oldDesc === newDesc) {
    skipped++;
    return;
  }
  
  // Set title_tag
  try {
    await upsertMetafield(product.id, existingTitle, 'title_tag', newTitle);
    await lib.sleep(lib.DELAY_MS);
  } catch(e) {
    console.log(`  Error setting title for ${product.id}: ${e.message}`);
    errors++;
    return;
  }
  
  // Set description_tag
  try {
    await upsertMetafield(product.id, existingDesc, 'description_tag', newDesc);
    await lib.sleep(lib.DELAY_MS);
  } catch(e) {
    console.log(`  Error setting desc for ${product.id}: ${e.message}`);
    errors++;
  }
  
  updated++;
  
  changeLog.push({
    timestamp: new Date().toISOString(),
    productId: product.id,
    handle: product.handle,
    oldTitle,
    newTitle,
    oldDesc: oldDesc.substring(0, 100),
    newDesc: newDesc.substring(0, 100)
  });
  
  // Save log every 10 updates
  if (changeLog.length % 10 === 0) {
    lib.saveLog.call(null);
    fs.writeFileSync(LOG_FILE, JSON.stringify(changeLog, null, 2));
  }
}

async function main() {
  const TARGET = 500;
  console.log(`Starting Bull Strap SEO optimization - targeting ${TARGET} products`);
  console.log(`Log file: ${LOG_FILE}\n`);
  
  const processedIds = new Set(changeLog.map(c => c.productId));
  updated = processedIds.size;
  console.log(`Already processed: ${processedIds.size} products\n`);
  
  let sinceId = 0;
  let batchNum = 0;
  
  while (changeLog.length < TARGET) {
    batchNum++;
    const path = sinceId === 0
      ? `/products.json?limit=${lib.BATCH_SIZE}&fields=id,title,product_type,vendor,tags,handle`
      : `/products.json?limit=${lib.BATCH_SIZE}&since_id=${sinceId}&fields=id,title,product_type,vendor,tags,handle`;
    
    console.log(`Fetching batch ${batchNum} (since_id=${sinceId})...`);
    const data = await lib.shopifyRequest('GET', path);
    await lib.sleep(lib.DELAY_MS);
    
    if (data.rateLimited) {
      const wait = (parseInt(data.retryAfter) || 2) * 1000;
      console.log(`Rate limited on fetch, waiting ${wait}ms...`);
      await lib.sleep(wait);
      continue;
    }
    
    if (!data.products || data.products.length === 0) {
      console.log('No more products to process.');
      break;
    }
    
    console.log(`  Got ${data.products.length} products`);
    
    for (const product of data.products) {
      if (changeLog.length >= TARGET) break;
      if (processedIds.has(product.id)) {
        processed++;
        continue;
      }
      
      processed++;
      await processProduct(product);
      
      if (processed % 25 === 0) {
        console.log(`  Progress: processed=${processed}, updated=${updated}, skipped=${skipped}, errors=${errors}`);
      }
    }
    
    sinceId = data.products[data.products.length - 1].id;
  }
  
  // Final save
  fs.writeFileSync(LOG_FILE, JSON.stringify(changeLog, null, 2));
  
  console.log(`\n=== COMPLETE ===`);
  console.log(`Total processed: ${processed}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (already optimized): ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Log saved to: ${LOG_FILE}`);
}

main().catch(e => {
  console.error('Fatal error:', e);
  fs.writeFileSync(LOG_FILE, JSON.stringify(changeLog, null, 2));
});
