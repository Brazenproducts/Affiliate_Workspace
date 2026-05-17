const fs = require('fs');
const path = '/home/ubuntu/.openclaw/workspace/besttruckaccessories.com/index.html';
let html = fs.readFileSync(path, 'utf8');

// Fixes for first two cards (already partially handled — check current state first)
const before = html;

// 1. Best Truck Seat Covers card — was missing img before <h3>
html = html.replace(
  /<div class="cat-card">\n\n<h3>Best Truck Seat Covers<\/h3>/,
  '<div class="cat-card">\n<img alt="Truck seat covers" loading="lazy" src="https://m.media-amazon.com/images/I/71hEo+V7VXL._AC_SL1500_.jpg"/>\n<h3>Best Truck Seat Covers</h3>'
);

// 2. Best Tonneau Covers — swap wrong seat-cover ID for a real hard-fold tonneau
html = html.replace(
  /<img alt="Hard folding tonneau cover" loading="lazy" src="https:\/\/m\.media-amazon\.com\/images\/I\/71EN6D5To0L\._AC_SL1500_\.jpg"\/>/,
  '<img alt="BAKFlip-style hard folding tonneau cover" loading="lazy" src="https://m.media-amazon.com/images/I/71AJxAFaZqL._AC_SL1500_.jpg"/>'
);

// 3. Best Floor Mats — swap tonneau image for real WeatherTech FloorLiner
html = html.replace(
  /<img alt="All-weather truck floor mats" loading="lazy" src="https:\/\/m\.media-amazon\.com\/images\/I\/81zUpKoyQQL\._AC_SL1500_\.jpg"\/>/,
  '<img alt="WeatherTech FloorLiner all-weather truck floor mats" loading="lazy" src="https://m.media-amazon.com/images/I/71fUeKtSoiL._AC_SL1500_.jpg"/>'
);

// 4. Replace icon-only cards with real category images
const iconSwaps = [
  { emojiPattern: /<div class="icon">🗄️<\/div>\n<h3>Best Bed Organizers<\/h3>/, img: '<img alt="DECKED truck bed drawer organizer" loading="lazy" src="https://m.media-amazon.com/images/I/61qHT5VB3NL._AC_SL1500_.jpg"/>\n<h3>Best Bed Organizers</h3>' },
  { emojiPattern: /<div class="icon">🪢<\/div>\n<h3>Best Recovery Gear<\/h3>/, img: '<img alt="Smittybilt winch for truck recovery" loading="lazy" src="https://m.media-amazon.com/images/I/71LDXvYBaLL._AC_SL1500_.jpg"/>\n<h3>Best Recovery Gear</h3>' },
  { emojiPattern: /<div class="icon">📹<\/div>\n<h3>Best Dash Cams<\/h3>/, img: '<img alt="Viofo dual-channel truck dash cam" loading="lazy" src="https://m.media-amazon.com/images/I/716yL7ENIjL._AC_SL1500_.jpg"/>\n<h3>Best Dash Cams</h3>' },
  { emojiPattern: /<div class="icon">📱<\/div>\n<h3>Best Phone Mounts<\/h3>/, img: '<img alt="Magnetic vent-mount phone holder for trucks" loading="lazy" src="https://m.media-amazon.com/images/I/71qcGEEwGSL._AC_SL1500_.jpg"/>\n<h3>Best Phone Mounts</h3>' },
  { emojiPattern: /<div class="icon">⬆️<\/div>\n<h3>Best Lift Kits<\/h3>/, img: '<img alt="Rough Country truck leveling and lift kit" loading="lazy" src="https://m.media-amazon.com/images/I/61ICksnFZRL._AC_SL1500_.jpg"/>\n<h3>Best Lift Kits</h3>' },
];
for (const { emojiPattern, img } of iconSwaps) {
  const before2 = html;
  html = html.replace(emojiPattern, img);
  if (html === before2) console.log('MISS:', emojiPattern);
}

// 5. Tacoma card — add missing image
html = html.replace(
  /<div class="cat-card">\n\n<h3>Toyota Tacoma<\/h3>/,
  '<div class="cat-card">\n<img alt="Toyota Tacoma accessories" loading="lazy" src="https://m.media-amazon.com/images/I/71bRvuUJJhL._AC_SL1500_.jpg"/>\n<h3>Toyota Tacoma</h3>'
);

// 6. RAM 1500 card — add missing image
html = html.replace(
  /<div class="cat-card">\n\n<h3>RAM 1500<\/h3>/,
  '<div class="cat-card">\n<img alt="RAM 1500 tonneau cover" loading="lazy" src="https://m.media-amazon.com/images/I/71AOxJT3GRL._AC_SL1500_.jpg"/>\n<h3>RAM 1500</h3>'
);

if (html !== before) {
  fs.writeFileSync(path, html);
  console.log('index.html updated');
} else {
  console.log('NO CHANGES — pattern mismatch');
}
