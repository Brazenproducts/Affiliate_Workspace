#!/usr/bin/env node
// Amazon Associates Performance Dashboard
// Parses exported CSV reports from Amazon Associates and generates performance table

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = '/home/ubuntu/.openclaw/workspace/memory/amazon-associates-reports';
const OUTPUT_FILE = '/home/ubuntu/.openclaw/workspace/memory/amazon-associates-performance.json';

// Site tracking ID mapping
const siteMap = {
  'brazenprodu01-20-magnesium': 'bestmagnesiumglycinate.com',
  'brazenprodu01-20-necklift': 'bestnecklifttape.com',
  'brazenprodu01-20-charger': 'bestportable-charger.com',
  'brazenprodu01-20-heatingpad': 'bestheating-pad.com',
  'brazenprodu01-20-vibration': 'bestvibrationplate.com',
  'brazenprodu01-20-resistance': 'bestresistance-bands.com',
  'brazenprodu01-20-protein': 'bestprotein-powder.com',
  'brazenprodu01-20-minifridge': 'bestmini-fridge.com',
  'brazenprodu01-20-massagegun': 'bestmassage-gun.com',
  'brazenprodu01-20-gamingchair': 'bestgaming-chair.com',
  'brazenprodu01-20-icemaker': 'bestice-maker.com',
  'brazenprodu01-20-portableac': 'bestportable-ac.com',
  'brazenprodu01-20-powerbank': 'bestpower-bank.com',
  'brazenprodu01-20-labelmaker': 'bestlabel-maker.com',
  'brazenprodu01-20-showerhead': 'bestshower-head.com',
  // Phase 1 high-yield
  'brazenprodu01-20-towingstrap': 'besttowingstrap.com',
  'brazenprodu01-20-tirepatch': 'besttirepatch.com',
  'brazenprodu01-20-headlight': 'bestheadlightrestoration.com',
  'brazenprodu01-20-tireinflator': 'besttireinflator.com',
  'brazenprodu01-20-sousvide': 'bestsousvide.com',
  'brazenprodu01-20-dutchoven': 'bestdutchoven.com',
  'brazenprodu01-20-pastamaker': 'bestpastamaker.com',
  'brazenprodu01-20-recipsaw': 'bestreciprocatingsaw.com',
  'brazenprodu01-20': 'All Sites (default tag)'
};

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    data.push(row);
  }
  
  return data;
}

function aggregateByTrackingId(data) {
  const stats = {};
  
  for (const row of data) {
    const trackingId = row['Tracking ID'] || row['Tag'] || 'brazenprodu01-20';
    
    if (!stats[trackingId]) {
      stats[trackingId] = {
        clicks: 0,
        orders: 0,
        itemsShipped: 0,
        revenue: 0,
        earnings: 0
      };
    }
    
    stats[trackingId].clicks += parseInt(row['Clicks'] || row['Link Clicks'] || 0);
    stats[trackingId].orders += parseInt(row['Orders'] || row['Ordered Items'] || 0);
    stats[trackingId].itemsShipped += parseInt(row['Items Shipped'] || row['Shipped Items'] || 0);
    stats[trackingId].revenue += parseFloat(row['Revenue'] || row['Ordered Product Sales'] || 0);
    stats[trackingId].earnings += parseFloat(row['Earnings'] || row['Advertising Fees'] || 0);
  }
  
  return stats;
}

function generateDashboard() {
  if (!fs.existsSync(REPORTS_DIR)) {
    console.log('❌ Reports directory not found. Create it and add exported CSV files:');
    console.log(`   mkdir -p ${REPORTS_DIR}`);
    console.log('   Then export reports from Amazon Associates and save as:');
    console.log('   - all-time.csv');
    console.log('   - last-30-days.csv');
    console.log('   - last-7-days.csv');
    return;
  }
  
  const reports = {
    'All Time': path.join(REPORTS_DIR, 'all-time.csv'),
    'Last 30 Days': path.join(REPORTS_DIR, 'last-30-days.csv'),
    'Last 7 Days': path.join(REPORTS_DIR, 'last-7-days.csv')
  };
  
  const dashboard = {};
  
  for (const [period, filePath] of Object.entries(reports)) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${period} report not found: ${filePath}`);
      continue;
    }
    
    const data = parseCSV(filePath);
    const stats = aggregateByTrackingId(data);
    dashboard[period] = stats;
  }
  
  // Save to JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dashboard, null, 2));
  
  // Print table
  console.log('\n📊 Amazon Associates Performance Dashboard\n');
  console.log('═'.repeat(120));
  
  for (const [period, stats] of Object.entries(dashboard)) {
    console.log(`\n${period}:`);
    console.log('─'.repeat(120));
    console.log(
      'Site'.padEnd(35) +
      'Clicks'.padStart(10) +
      'Orders'.padStart(10) +
      'Shipped'.padStart(10) +
      'Revenue'.padStart(12) +
      'Earnings'.padStart(12) +
      'Conv %'.padStart(10)
    );
    console.log('─'.repeat(120));
    
    for (const [trackingId, data] of Object.entries(stats)) {
      const siteName = siteMap[trackingId] || trackingId;
      const convRate = data.clicks > 0 ? ((data.orders / data.clicks) * 100).toFixed(2) : '0.00';
      
      console.log(
        siteName.padEnd(35) +
        data.clicks.toString().padStart(10) +
        data.orders.toString().padStart(10) +
        data.itemsShipped.toString().padStart(10) +
        `$${data.revenue.toFixed(2)}`.padStart(12) +
        `$${data.earnings.toFixed(2)}`.padStart(12) +
        `${convRate}%`.padStart(10)
      );
    }
  }
  
  console.log('\n═'.repeat(120));
  console.log(`\n✅ Dashboard saved to: ${OUTPUT_FILE}\n`);
}

// Create reports directory if it doesn't exist
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

generateDashboard();
