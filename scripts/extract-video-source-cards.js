const fs = require('fs');
const html = fs.readFileSync('/home/ubuntu/.openclaw/workspace/besttruckaccessories.com/index.html', 'utf8');

// Find all cards: headline + image
const cardRegex = /<h3[^>]*>([^<]+)<\/h3>[\s\S]{0,3000}?<img[^>]+src="(https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9]{10,})\._[^"]+"/g;
const cards = [];
let m;
while ((m = cardRegex.exec(html)) !== null) {
  cards.push({ heading: m[1].trim(), imageId: m[2].split('/').pop() });
}
console.log(`Found ${cards.length} heading+image pairs:`);
for (const c of cards) console.log(`  ${c.imageId}  |  ${c.heading}`);

// Also try the reverse order: img before h3
const reverseRegex = /<img[^>]+src="(https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9]{10,})\._[^"]+"[\s\S]{0,500}?<h3[^>]*>([^<]+)<\/h3>/g;
const reverse = [];
while ((m = reverseRegex.exec(html)) !== null) {
  reverse.push({ imageId: m[1].split('/').pop(), heading: m[2].trim() });
}
console.log(`\nReverse order (img → h3): ${reverse.length} pairs:`);
for (const c of reverse) console.log(`  ${c.imageId}  |  ${c.heading}`);
