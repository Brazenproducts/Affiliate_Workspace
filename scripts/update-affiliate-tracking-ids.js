#!/usr/bin/env node
// Update all affiliate sites with site-specific Amazon tracking IDs

const fs = require('fs');
const path = require('path');

const SITES_DIR = '/home/ubuntu/.openclaw/workspace/sites';

// Map domains to their tracking IDs
const trackingMap = {
  'bestmagnesiumglycinate.com': 'brazenprodu01-20-magnesium',
  'bestnecklifttape.com': 'brazenprodu01-20-necklift',
  'bestportable-charger.com': 'brazenprodu01-20-charger',
  'bestheating-pad.com': 'brazenprodu01-20-heatingpad',
  'bestvibrationplate.com': 'brazenprodu01-20-vibration',
  'bestresistance-bands.com': 'brazenprodu01-20-resistance',
  'bestprotein-powder.com': 'brazenprodu01-20-protein',
  'bestmini-fridge.com': 'brazenprodu01-20-minifridge',
  'bestmassage-gun.com': 'brazenprodu01-20-massagegun',
  'bestgaming-chair.com': 'brazenprodu01-20-gamingchair',
  'bestice-maker.com': 'brazenprodu01-20-icemaker',
  'bestportable-ac.com': 'brazenprodu01-20-portableac',
  'bestpower-bank.com': 'brazenprodu01-20-powerbank',
  'bestlabel-maker.com': 'brazenprodu01-20-labelmaker',
  'bestshower-head.com': 'brazenprodu01-20-showerhead',
  // Phase 1 high-yield (5/5/2026)
  'besttowingstrap.com': 'brazenprodu01-20-towingstrap',
  'besttirepatch.com': 'brazenprodu01-20-tirepatch',
  'bestheadlightrestoration.com': 'brazenprodu01-20-headlight',
  'besttireinflator.com': 'brazenprodu01-20-tireinflator',
  'bestsousvide.com': 'brazenprodu01-20-sousvide',
  'bestdutchoven.com': 'brazenprodu01-20-dutchoven',
  'bestpastamaker.com': 'brazenprodu01-20-pastamaker',
  'bestreciprocatingsaw.com': 'brazenprodu01-20-recipsaw'
};

function updateTrackingId(sitePath, newTag) {
  const htmlFiles = [];
  
  function findHtmlFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        findHtmlFiles(fullPath);
      } else if (entry.name.endsWith('.html')) {
        htmlFiles.push(fullPath);
      }
    }
  }
  
  findHtmlFiles(sitePath);
  
  let totalReplacements = 0;
  
  for (const file of htmlFiles) {
    let content = fs.readFileSync(file, 'utf8');
    const before = content;
    
    // Replace all instances of brazenprodu01-20 (but not the site-specific ones)
    content = content.replace(/brazenprodu01-20(?!-)/g, newTag);
    
    if (content !== before) {
      fs.writeFileSync(file, content);
      const count = (before.match(/brazenprodu01-20(?!-)/g) || []).length;
      totalReplacements += count;
      console.log(`  ${path.basename(file)}: ${count} replacements`);
    }
  }
  
  return totalReplacements;
}

console.log('Updating Amazon tracking IDs for affiliate sites...\n');

let sitesUpdated = 0;
let totalReplacements = 0;

for (const [domain, trackingId] of Object.entries(trackingMap)) {
  const sitePath = path.join(SITES_DIR, domain);
  
  if (!fs.existsSync(sitePath)) {
    console.log(`⏭️  ${domain} - not built yet`);
    continue;
  }
  
  console.log(`🔄 ${domain} → ${trackingId}`);
  const count = updateTrackingId(sitePath, trackingId);
  
  if (count > 0) {
    sitesUpdated++;
    totalReplacements += count;
    console.log(`   ✅ ${count} links updated\n`);
  } else {
    console.log(`   ⚠️  No links found\n`);
  }
}

console.log(`\n✅ Done: ${sitesUpdated} sites updated, ${totalReplacements} total link replacements`);
