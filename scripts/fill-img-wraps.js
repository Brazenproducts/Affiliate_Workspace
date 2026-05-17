#!/usr/bin/env node
// Fill empty <div class="img-wrap"></div> slots with verified Amazon img tags from a pool.
// Each page gets unique IDs (round-robin with rotation start so pages don't share).
const fs = require('fs');
const path = require('path');

const POOL = process.argv[2] ? process.argv[2].split(',') : [];
const FILES = process.argv.slice(3);
if (!POOL.length || !FILES.length) {
  console.error('Usage: node fill-img-wraps.js id1,id2,id3,... file1.html file2.html ...');
  process.exit(1);
}

let cursor = 0;
for (const fp of FILES) {
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;
  let n = 0;
  html = html.replace(/<div class="img-wrap"><\/div>/g, () => {
    const id = POOL[cursor % POOL.length];
    cursor++;
    n++;
    return `<div class="img-wrap"><img src="https://m.media-amazon.com/images/I/${id}._AC_SL1500_.jpg" alt="" loading="lazy" style="width:100%;border-radius:8px"></div>`;
  });
  if (html !== before) {
    fs.writeFileSync(fp, html);
    console.log(`${fp}: filled ${n} slots`);
  }
}
console.log(`Total slots filled: ${cursor}`);
