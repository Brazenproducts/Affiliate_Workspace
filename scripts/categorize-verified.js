#!/usr/bin/env node
const fs = require('fs');
const v = JSON.parse(fs.readFileSync('/tmp/verified-images.json','utf8'));
const buckets = {};
const keys = ['bumper','roll bar','roll cage','grab','handle','roof rack','rack','tent','awning','camp',
  'bed accessor','bed cover','tonneau','bed cap','bed stor','storage','cargo','frunk','organiz','interior','console',
  'floor mat','floor liner','cargo liner','mat','liner',
  'seat cushion','lumbar','seat cover','seat',
  'lift','leveling','suspension',
  'headliner','sound deaden','insulation','deaden',
  'light','led','lamp',
  'shell','camper','cap',
  'charger','ev',
  'molle','pals',
  'bumper','guide','protect',
  'cabinet','shelv','workbench','tool',
  'floor coat','epoxy',
  'wifi','mesh','router',
  'smoker','grill','pellet','electric smoker',
  'instant pot','pressure','air fry',
  'hvac','filter',
  'wheel','tire',
  'screen protect','cushion','pet'
];
for (const [id, usages] of Object.entries(v)) {
  for (const u of usages) {
    const h = (u.heading||'').toLowerCase();
    let bucket = null;
    for (const k of keys) {
      if (h.includes(k)) { bucket = k; break; }
    }
    if (!bucket) bucket = `(other) ${h.slice(0,50)}`;
    (buckets[bucket] = buckets[bucket] || new Map()).set(id, u);
  }
}
for (const [k, m] of Object.entries(buckets)) {
  if (k.startsWith('(other)')) continue;
  console.log(`\n=== ${k} (${m.size} IDs) ===`);
  let i=0;
  for (const [id,u] of m.entries()) {
    if (i++>=6) break;
    console.log(`  ${id}  -- ${u.heading}  [${u.site}]`);
  }
}
