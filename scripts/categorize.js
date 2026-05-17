#!/usr/bin/env node
// Group harvested images by category-like heading keywords
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/tmp/harvested-images.json', 'utf8'));
const buckets = {
  tent:[], awning:[], rack:[], roofrack:[], wheel:[], tire:[],
  bumper:[], roll:[], lift:[], winch:[], mat:[], liner:[], cargo:[],
  tonneau:[], bed:[], storage:[], organizer:[], cooler:[], frunk:[],
  seat:[], cushion:[], lumbar:[], molle:[], grabhandle:[], handle:[],
  headliner:[], lighting:[], light:[], camping:[], cabinet:[], shelving:[],
  workbench:[], toolchest:[], charger:[], ev:[], wifi:[], mesh:[],
  smoker:[], grill:[], instantpot:[], pressure:[], hvac:[], filter:[],
  floor:[], console:[], insulation:[], shell:[], camper:[], bedcover:[],
  shade:[], bimini:[], top:[], door:[],
};
for (const [id, arr] of Object.entries(data)) {
  if (id === '61mpK93Qg0L') continue; // explicit bad placeholder
  if (id === '61bMNCeAUAL') continue; // generic placeholder
  for (const entry of arr) {
    const h = (entry.heading||'').toLowerCase();
    for (const key of Object.keys(buckets)) {
      if (h.includes(key)) { buckets[key].push({ id, ...entry }); break; }
    }
  }
}
for (const [k, arr] of Object.entries(buckets)) {
  const ids = [...new Set(arr.map(x=>x.id))];
  if (ids.length === 0) continue;
  console.log(`\n=== ${k} (${ids.length} unique) ===`);
  for (const id of ids.slice(0, 6)) {
    const sample = arr.find(x=>x.id===id);
    console.log(`  ${id}  -- ${sample.heading}  [${sample.site}]`);
  }
}
