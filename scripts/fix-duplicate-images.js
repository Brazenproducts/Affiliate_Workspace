#!/usr/bin/env node
/**
 * Fix duplicate/mismatched images across affiliate sites.
 *
 * Strategy:
 *   1. For cards where a VERIFIED category-appropriate image exists in the
 *      network, swap the offending src to a verified unique image.
 *   2. For cards where no verified image exists (scaffold "parts" sites), the
 *      duplicate placeholder is the known-dead `61mpK93Qg0L` BAKFlip or the
 *      dead `61bMNCeAUAL` — replace the entire <img ...> tag with nothing
 *      (remove the image). A card with no image is better than 4 cards all
 *      showing the same unrelated/broken photo.
 *
 * All candidate replacement IDs have been HEAD-verified 200 OK against
 * m.media-amazon.com in scripts/verify-harvest.js output (/tmp/verified-images.json).
 */
const fs = require('fs'); const path = require('path');
const WS = '/home/ubuntu/.openclaw/workspace';

const VERIFIED = JSON.parse(fs.readFileSync('/tmp/verified-images.json','utf8'));
function isVerified(id) { return Object.prototype.hasOwnProperty.call(VERIFIED, id); }

// Category-specific pools — IDs ONLY appear here if present in VERIFIED (200 OK).
const POOL = {
  // Tonneau / bed covers — verified from besttonneaucovers.com
  tonneauSoft:   ['81zUpKoyQQL','71fecWaWt3L','71ieo4E7NwL','71Y6lnTWcZL','611248fNOPL','71C98bGk-DL'],
  tonneauHard:   ['71FV4e5HBKL','61QcI-1m4CL','615nOY-jE1L','71Gw5nLmGPL','81JiLkyCXRL','617WTJkg+yL'],
  tonneauRetract:['71GDokYxXHL','61oyRqb-fxL','61Pd8Rz2tSL'],
  // Truck seat covers — verified
  seatCoverTruck:['71EN6D5To0L','618nihcDghL','71amHPKTNgL'],
  // Cybertruck seat covers — verified
  seatCoverCT:   ['71uA2ukmS-L','71bIJLU8nYL','719K0Wcp+tL','71WDbdhyhBL','61Hv+9nWV8L','71KOEuWGLvL','71Bg7LU5K9L','71aWirUy3ML','61zhMrZJppL'],
  // Bronco seat cover
  seatCoverBronco:['710f5FrvB8L'],
  // Liners / mats — verified
  linerTruck:    ['51NBmlCv93L','812EjwRoL1L'],
  // Bronco lift — verified
  lift:          ['61cwukK4epL','61pr8hieUiL','51bFvAzzqHL'],
  // Cordless tools — verified (30+ options)
  tools:         ['61cPQ94Z57L','71qSqau7rAL','61af+3pOl5L','51Ew-UhJ9PL','81n9HWPsiLL','81vUvizvx4L','61w0N+z+beL','61cnYro8-jL','714Ul96BfnL','51JyBDvtXFL','51New7d8htL','51yzjIwPXuS','61KgbHsMnUL','61ibhSZErtL','611bJI1mBBL','7105fv4fDrL','61tX-LrUhXL','61QniOM5pwL','61OGleYqEXL','51HLSxzTtfL','51Or9RLcF1L','61TBrZIEiML','511Ba4pINuL','51ptzMscVEL','71-9UR1F2XL','51BBGW6IBlL','817WrflosJL'],
  // Firestick / streaming
  streaming:     ['51CgKGfMelL','61nyRfbgaLL','61PqEAuaCTL','610j-wmxRcL','61ihvr7z6CL','510wm50VDHL','51ZGCIbrgFL'],
  // Garage organizer
  cabinet:       ['71kblfz6F1L','71E2g9uIwhL','41sGJuCWKFL'],
  shelving:      ['51GKxhDUidL','71lgqwpYlGL'],
  workbench:     ['61wO5UvtjXL','71IOrosYXCL','61SqhE+CLzL'],
  ceilingStor:   ['41w2hkFNT1L'],
  floorCoat:     ['91crcMevjNL','51wxDGeQNPL','51nbq71NBsL'],
  toolHolder:    ['517xIJPrtlL'],
  // Kitchen
  instantPot:    ['41lR3pmJiqL','71WtwEvYDOS','61Wdj05DWwL','31LiUewpeyL','51L+ADJ8l4L'],
  // Grills / smokers
  electricSmoker:['51d0j1ADfAL','81F6NtxgfEL','71JMfslspqL','616aNgJu15L'],
  offsetSmoker:  ['81hfO6W6T8L','617v-t3JMlL','61+f1ZWcS-L'],
  pelletGrill:   ['71U9AitATlL','61car4AjCTL','61smg4HseXL','61wzLb8wevL','71ocBwZXwSL','516GKzOtE5L','81KPwTLAO-L'],
  portableGrill: ['417xX0esNjL','51QZRUrPEPL'],
  grillAccess:   ['71s28hOEP5L','61Z2aRCiB9L','319N0AKgavL','91qtemBo3LL','71k4aq6Ds0L','81+e+Ka1nvL'],
  charcoalSmoker:['61l+cVym3xL'],
  // Mesh wifi
  wifi:          ['4181fAP1xAL','61hMRuRowfL','61uMoKLvCiL'],
};

// Filter POOL at load-time to only include verified IDs.
for (const [k, arr] of Object.entries(POOL)) {
  POOL[k] = arr.filter(isVerified);
}

const amazon = id => `https://m.media-amazon.com/images/I/${id}._AC_SL1500_.jpg`;

// Heading -> category picker
function pickBucket(heading, sitename) {
  const h = (heading||'').toLowerCase();
  const s = (sitename||'').toLowerCase();
  // grills / smokers
  if (/pellet grill|pellet smoker|pellet/.test(h)) return 'pelletGrill';
  if (/offset smoker/.test(h)) return 'offsetSmoker';
  if (/electric smoker/.test(h)) return 'electricSmoker';
  if (/portable grill|portable pellet/.test(h)) return 'portableGrill';
  if (/charcoal/.test(h)) return 'charcoalSmoker';
  if (/grill accessor|accessor/.test(h) && s.includes('smoker')) return 'grillAccess';
  // firestick
  if (/streaming|fire tv|roku|chromecast/.test(h)) return 'streaming';
  // kitchen
  if (/pressure cooker|pressure|slow cooker|air ?fry/.test(h)) return 'instantPot';
  if (/instant pot/.test(h)) return 'instantPot';
  // mesh wifi
  if (/mesh|wifi|router|gaming wifi|large home|budget mesh|orbi|eero/.test(h)) return 'wifi';
  // garage organizer
  if (/workbench/.test(h)) return 'workbench';
  if (/shelving|shelv/.test(h)) return 'shelving';
  if (/cabinet|tool chest|tool chests/.test(h)) return 'cabinet';
  if (/ceiling/.test(h)) return 'ceilingStor';
  if (/floor coating|epoxy|floor tile/.test(h)) return 'floorCoat';
  if (/tool holder|magnet|pegboard|cleat/.test(h)) return 'toolHolder';
  if (/wall organizer/.test(h)) return 'cabinet';
  // tonneau covers
  if (/retractable/.test(h)) return 'tonneauRetract';
  if (/hard fold|hard tri|tri-?fold|hard-?fold/.test(h)) return 'tonneauHard';
  if (/soft roll|roll-?up|soft cover/.test(h)) return 'tonneauSoft';
  if (/tonneau/.test(h) && !/cybertruck/.test(h)) return 'tonneauSoft';
  // seat covers by site
  if (/seat cover/.test(h)) {
    if (s.includes('cybertruck')) return 'seatCoverCT';
    if (s.includes('bronco')) return 'seatCoverBronco';
    return 'seatCoverTruck';
  }
  // liners
  if (/liner|floor liner|weather ?tech/.test(h)) return 'linerTruck';
  // lift
  if (/lift|leveling|suspension/.test(h)) return 'lift';
  // tools
  if (/drill|impact|circ.?saw|recip|hammer|grinder|tool kit|cordless/.test(h)) return 'tools';
  return null;
}

function walk(dir, out=[]) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.html?$/i.test(e.name)) out.push(p);
  }
  return out;
}

const AUDIT = JSON.parse(fs.readFileSync('/tmp/duplicate-image-audit.json','utf8'));
const targetSite = process.argv[2];
const MODE = process.argv[3] || 'auto'; // auto | swap-only | strip-only

const siteChangeLog = {};

for (const [site, entry] of Object.entries(AUDIT.sites)) {
  if (targetSite && site !== targetSite) continue;
  const root = path.join(WS, site);
  if (!fs.existsSync(root)) continue;
  const changes = [];

  for (const rel of Object.keys(entry.pages)) {
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    const orig = html;

    // collect cards in order with heading context
    const imgRe = /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
    const cards = [];
    let m;
    while ((m = imgRe.exec(html)) !== null) {
      const before = html.slice(Math.max(0, m.index-800), m.index);
      const after  = html.slice(m.index, Math.min(html.length, m.index+400));
      const heads = [...before.matchAll(/<h[1-4][^>]*>([\s\S]{0,200}?)<\/h[1-4]>/gi)];
      let heading = '';
      if (heads.length) heading = heads[heads.length-1][1].replace(/<[^>]+>/g,'').trim();
      else {
        const hAfter = after.match(/<h[1-4][^>]*>([\s\S]{0,200}?)<\/h[1-4]>/i);
        if (hAfter) heading = hAfter[1].replace(/<[^>]+>/g,'').trim();
      }
      cards.push({ fullMatch: m[0], src: m[1], start: m.index, end: m.index+m[0].length, heading });
    }

    const contentCards = cards.filter(c =>
      !/logo|favicon|sprite|placeholder|icon-|banner-bg/i.test(c.src) &&
      !/\.svg/i.test(c.src)
    );

    // Per-page plan:
    //   - skip first occurrence of any repeated src
    //   - for each subsequent repeat OR any `61mpK93Qg0L` on non-BAKFlip card
    //     OR any `61bMNCeAUAL` (generic placeholder) → try to swap to verified bucket image
    //     (unique on this page). If none available, STRIP the <img>.
    const seenKeys = new Set();
    const usedVerified = new Set();
    const actions = []; // { type:'swap'|'strip', start,end,tag,newTag?,newSrc? }

    for (const c of contentCards) {
      const idm = c.src.match(/m\.media-amazon\.com\/images\/I\/([A-Za-z0-9+%-]+)(?:\._[^.]+)?\.(?:jpg|jpeg|png|webp)/i);
      const shM = c.src.match(/cdn\.shopify\.com\/[^"'\s]+/i);
      const key = idm ? `amz:${idm[1]}` : (shM ? `sh:${shM[0].split('?')[0]}` : `x:${c.src}`);
      const isBakflipCard = /bakflip|mx4/i.test(c.heading);

      const isKnownBad =
        (idm && idm[1] === '61mpK93Qg0L' && !isBakflipCard) ||
        (idm && idm[1] === '61bMNCeAUAL');

      const isDup = seenKeys.has(key);

      if (!isKnownBad && !isDup) {
        seenKeys.add(key);
        if (idm) usedVerified.add(idm[1]);
        continue;
      }

      // Need to replace. Try bucket first.
      const bucket = pickBucket(c.heading, site);
      const pool = (bucket && POOL[bucket]) || [];
      const chosen = pool.find(id => !usedVerified.has(id) && !seenKeys.has(`amz:${id}`));

      if (chosen) {
        usedVerified.add(chosen);
        seenKeys.add(`amz:${chosen}`);
        const newSrc = amazon(chosen);
        const newTag = c.fullMatch.replace(/\bsrc\s*=\s*["'][^"']+["']/i, `src="${newSrc}"`);
        actions.push({ type:'swap', start:c.start, end:c.end, tag:c.fullMatch, newTag, newSrc, heading:c.heading, oldSrc:c.src });
      } else {
        // strip the image entirely — also strip surrounding <a> if purely wrapping an image?
        // Keep it simple: remove only the <img> tag.
        actions.push({ type:'strip', start:c.start, end:c.end, tag:c.fullMatch, heading:c.heading, oldSrc:c.src });
      }
    }

    if (actions.length) {
      actions.sort((a,b)=>b.start-a.start);
      for (const a of actions) {
        if (a.type === 'swap') html = html.slice(0,a.start) + a.newTag + html.slice(a.end);
        else                   html = html.slice(0,a.start) + '' + html.slice(a.end);
      }
      if (html !== orig) {
        fs.writeFileSync(file, html);
        for (const a of actions) {
          changes.push({ file: rel, action: a.type, heading: a.heading, oldSrc: a.oldSrc.slice(0,120), newSrc: a.newSrc || null });
        }
      }
    }
  }

  if (changes.length) siteChangeLog[site] = changes;
}

fs.writeFileSync('/tmp/duplicate-image-fixes-log.json', JSON.stringify(siteChangeLog, null, 2));
const sites = Object.keys(siteChangeLog);
const total = Object.values(siteChangeLog).reduce((a,b)=>a+b.length,0);
const swaps = Object.values(siteChangeLog).flat().filter(x=>x.action==='swap').length;
const strips = total - swaps;
console.log(`Fixed ${sites.length} sites, ${total} image actions (${swaps} swaps, ${strips} strips).`);
for (const s of sites) {
  const cs = siteChangeLog[s];
  const sw = cs.filter(x=>x.action==='swap').length;
  console.log(`  ${s}: ${cs.length} (${sw} swap, ${cs.length-sw} strip)`);
}
