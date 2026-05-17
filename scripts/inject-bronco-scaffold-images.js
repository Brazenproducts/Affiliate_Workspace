#!/usr/bin/env node
// Inject unique verified Amazon images into each card on bronco scaffold site indices.
const fs = require('fs');

// site → ordered list of verified IDs (one per <div class="card">), category-appropriate
const PLAN = {
  'broncorollbar.com/index.html': ['81su2gN84NL','81rl99VseiL','81gGdKFPGML'],          // Roll bar accessories, Interior handles, Buyers guide
  'broncotent.com/index.html':    ['71Vg4KeFk0L','81OK+eSquvL','81-kcXHvnWL','71xgcA-TARL'], // Ground / Rooftop / Awning / Buyer
  'broncotents.com/index.html':   ['71uI5J70wzL','817tT-Fs+DL','71pI5PjdGEL','712YdLKKp5L'], // Ground / Rooftop / Tailgate awning / Buyers (re-use subset, different from broncotent)
  'broncomolle.com/index.html':   ['41JpmKZ4SnL','71PQxCJeQML','81GinHNeLLL'],          // Seatback / Cargo / Buyer
  'broncoheadliner.com/index.html': ['813P0inNjtL','719UO2dKhCL'],                       // Roof insulation / Buyers
  'broncointerior.com/index.html':  ['710zdzSWIbL','81Eo23t5gvL'],                       // Console organizer / Buyers
  'broncoupgrade.com/index.html':   ['71QIcGChPOL','71B-VoUGGtL','81LEqdT5U6L'],         // Storage / Protection / Buyers
  'broncolift.com/index.html':      ['81sntx2DaUL','610-hInWUTL','71XkW9F2lQL','61cwukK4epL'], // Lift / Leveling / Shocks / Buyer (4 cards if exist)
  'broncorollcage.com/index.html':  ['81jErvGlPnL','71ZSRdYc7PL','81Qv7r3-f8L','71SmP38FuWL'], // Cage padding / Grab / Reinforcement / Buyer
};

const altByCat = {
  'broncorollbar': 'Ford Bronco roll bar',
  'broncotent': 'Ford Bronco tent',
  'broncotents': 'Ford Bronco tent',
  'broncomolle': 'Ford Bronco MOLLE panel',
  'broncoheadliner': 'Ford Bronco headliner',
  'broncointerior': 'Ford Bronco interior',
  'broncoupgrade': 'Ford Bronco upgrade',
  'broncolift': 'Ford Bronco lift kit',
  'broncorollcage': 'Ford Bronco roll cage',
};

let totalInjected = 0;
for (const rel of Object.keys(PLAN)) {
  const fp = '/home/ubuntu/.openclaw/workspace/' + rel;
  if (!fs.existsSync(fp)) { console.error('missing', rel); continue; }
  const site = rel.split('.')[0];
  const alt = altByCat[site] || 'Ford Bronco';
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;
  const ids = PLAN[rel].slice();
  let i = 0;
  // Replace each <div class="card"><h3> in order with an inline img injected
  html = html.replace(/<div class="card"><h3>/g, (m) => {
    if (i >= ids.length) return m;
    const id = ids[i++];
    return `<div class="card"><img src="https://m.media-amazon.com/images/I/${id}._AC_SL1500_.jpg" alt="${alt}" style="width:100%;border-radius:8px;margin-bottom:12px" loading="lazy"><h3>`;
  });
  if (html !== before) {
    fs.writeFileSync(fp, html);
    console.log(`${rel}: injected ${i} images`);
    totalInjected += i;
  } else {
    console.log(`${rel}: no change`);
  }
}
console.log(`Total: ${totalInjected}`);
