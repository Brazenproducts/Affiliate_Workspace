const https = require('https');

// Scrape FilterBuy prices for multiple sizes via browser-like fetch
const sizes = [
  // 4" filters
  { size: '16x25x4', merv: '8' },
  { size: '16x25x4', merv: '13' },
  { size: '16x20x4', merv: '8' },
  { size: '16x20x4', merv: '13' },
  { size: '20x20x4', merv: '8' },
  { size: '20x20x4', merv: '13' },
  { size: '20x24x4', merv: '8' },
  { size: '20x24x4', merv: '13' },
  { size: '20x25x4', merv: '8' },
  { size: '20x25x4', merv: '13' },
  { size: '18x24x4', merv: '8' },
  { size: '18x24x4', merv: '13' },
  { size: '12x24x4', merv: '8' },
  { size: '12x24x4', merv: '13' },
  // 5" filters
  { size: '16x25x5', merv: '8' },
  { size: '16x25x5', merv: '13' },
  { size: '20x20x5', merv: '8' },
  { size: '20x20x5', merv: '13' },
  { size: '20x25x5', merv: '8' },
  { size: '20x25x5', merv: '13' },
  // 1" common
  { size: '16x25x1', merv: '8' },
  { size: '16x25x1', merv: '13' },
  { size: '20x25x1', merv: '8' },
  { size: '20x25x1', merv: '13' },
  // 2" common
  { size: '16x25x2', merv: '8' },
  { size: '16x25x2', merv: '13' },
  { size: '20x25x2', merv: '8' },
  { size: '20x25x2', merv: '13' },
];

// We already have some from browser. Output what we know:
console.log('FilterBuy Pricing (from browser scrape):');
console.log('');
console.log('20x25x4 MERV 8:  1=$33.99  6=$16.66/ea ($99.96)  12=$14.83/ea ($177.96)');
console.log('20x25x4 MERV 13: 1=$46.99  6=$23.33/ea ($139.98) 12=$22.49/ea ($269.88)');
console.log('');
console.log('Remaining sizes need browser scraping...');
