#!/usr/bin/env node
/**
 * Bartact Product Description Upgrade — Dark Theme Style
 * 
 * Generates and pushes new dark-theme styled body_html for seat cover products.
 * Preserves tier-nav links and cross-links from existing descriptions.
 * 
 * Style: black bg, red #b8001f headings, white text, bullet cards with red left border,
 * closing line "You can find cheaper. You won't find better."
 */

const https = require('https');
const fs = require('fs');
const STORE = 'bartact.myshopify.com';
const TOKEN = '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';
const STATE_FILE = '/tmp/bartact-desc-upgrade-state.json';

function req(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, resp => { let d=''; resp.on('data',c=>d+=c); resp.on('end',()=>{ try{res({status:resp.statusCode,body:JSON.parse(d)})}catch{res({status:resp.statusCode,body:d})} }); });
    r.on('error',rej); if(body)r.write(body); r.end();
  });
}

function parseTitle(title) {
  const t = title.toLowerCase();
  const info = {};
  
  // Vehicle
  if (t.includes('bronco')) info.vehicle = 'Ford Bronco';
  else if (t.includes('gladiator') || t.includes(' jt ')) info.vehicle = 'Jeep® Gladiator';
  else if (t.includes('jl') || t.includes('jlu')) info.vehicle = 'Jeep® Wrangler JL/JLU';
  else if (t.includes('jk') || t.includes('jku')) info.vehicle = 'Jeep® Wrangler JK/JKU';
  else if (t.includes('tj') && t.includes('lj')) info.vehicle = 'Jeep® Wrangler TJ/LJ';
  else if (t.includes('tj')) info.vehicle = 'Jeep® Wrangler TJ';
  else if (t.includes('yj')) info.vehicle = 'Jeep® Wrangler YJ';
  else if (t.includes('tacoma')) info.vehicle = 'Toyota Tacoma';
  else if (t.includes('4runner')) info.vehicle = 'Toyota 4Runner';
  else info.vehicle = '';
  
  // Position
  if (t.includes('front')) info.position = 'Front';
  else if (t.includes('rear') || t.includes('bench')) info.position = 'Rear Bench';
  else info.position = '';
  
  // Type
  if (t.includes('tactical')) info.type = 'Tactical';
  else if (t.includes('base') || t.includes('baseline')) info.type = 'Base Line';
  else if (t.includes('mil-spec')) info.type = 'Mil-Spec';
  else info.type = 'Tactical';
  
  // Years
  const yearMatch = title.match(/(\d{4})[+-]?\s*(?:-\s*)?(\d{2,4})?/);
  if (yearMatch) {
    info.yearStart = yearMatch[1];
    info.yearEnd = yearMatch[2] || '';
  }
  
  // Features
  info.hasMOLLE = t.includes('molle') || t.includes('tactical');
  info.hasSRS = t.includes('srs') || t.includes('air bag') || t.includes('airbag');
  info.isCustom = t.includes('custom') || t.includes('fully custom');
  info.hasArmrest = t.includes('armrest');
  info.is2Door = t.includes('2 door') || t.includes('2-door');
  info.is4Door = t.includes('4 door') || t.includes('4-door');
  info.isTRD = t.includes('trd');
  info.isPair = t.includes('pair');
  
  return info;
}

function generateDescription(title, info, existingHtml) {
  const vehicle = info.vehicle || 'your vehicle';
  const position = info.position || '';
  const type = info.type || 'Tactical';
  
  // Extract any existing cross-links from old description
  const crossLinks = [];
  const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi;
  let match;
  while ((match = linkRegex.exec(existingHtml || '')) !== null) {
    if (match[1].includes('/products/') && !match[1].includes('javascript')) {
      crossLinks.push({ url: match[1], text: match[2] });
    }
  }
  
  // Build year string
  let yearStr = '';
  if (info.yearStart) {
    yearStr = info.yearStart + (info.yearEnd ? '-' + info.yearEnd : '+');
  }
  
  // Build the description
  let html = `<div style="background:#000;padding:24px;border-radius:8px;font-family:Arial,sans-serif;color:#fff;">

<h2 style="font-size:1.3em;font-weight:700;color:#b8001f;margin:0 0 12px 0;">${position} ${type} Seat Covers for ${vehicle}${yearStr ? ' ' + yearStr : ''}</h2>

<p style="font-size:1em;color:#ffffff;line-height:1.6;margin-bottom:16px;">`;

  // Opening paragraph - varies by vehicle
  if (info.vehicle.includes('Bronco')) {
    html += `Purpose-built for the ${yearStr || '2021+'} Ford Bronco. These ${type.toLowerCase()} seat covers deliver exact fitment, premium protection, and the rugged look your Bronco deserves — whether you're hitting trails or daily driving.`;
  } else if (info.vehicle.includes('Gladiator')) {
    html += `Engineered specifically for the ${yearStr || '2019+'} Jeep® Gladiator. ${type} seat covers that match the truck's capability — built tough, fitted precisely, and ready for whatever you throw at them.`;
  } else if (info.vehicle.includes('JL')) {
    html += `Designed for the ${yearStr || '2018+'} Jeep® Wrangler JL and JLU. ${type} seat covers that protect your investment while adding functional storage and a clean, aggressive look.`;
  } else if (info.vehicle.includes('JK')) {
    html += `Built for the ${yearStr || '2007-2018'} Jeep® Wrangler JK and JKU. ${type} seat covers that have been trail-tested by thousands of Jeep owners — proven protection with zero compromise on fit.`;
  } else if (info.vehicle.includes('TJ/LJ')) {
    html += `Made for the ${yearStr || '2003-2006'} Jeep® Wrangler TJ and LJ. ${type} seat covers that bring modern protection and MOLLE functionality to your classic Wrangler.`;
  } else if (info.vehicle.includes('TJ')) {
    html += `Made for the ${yearStr || '1997-2002'} Jeep® Wrangler TJ. ${type} seat covers that bring modern protection and MOLLE functionality to your classic Wrangler.`;
  } else if (info.vehicle.includes('YJ')) {
    html += `Made for the 1987-95 Jeep® Wrangler YJ. Mil-Spec seat covers that bring modern protection to your classic Wrangler — precision fit, premium materials, built to last.`;
  } else if (info.vehicle.includes('Tacoma')) {
    html += `Engineered for the Toyota Tacoma${info.isTRD ? ' TRD' : ''}. ${type} seat covers that match the truck's off-road capability — precise fitment, premium protection, and functional MOLLE storage.`;
  } else {
    html += `${type} seat covers built with precision fitment and premium materials. Designed to protect your seats while adding functional storage and a clean, tactical look.`;
  }

  html += `</p>

<ul style="list-style:none;padding:0;margin:0 0 16px 0;">
  <li style="padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;">🇺🇸 <strong>Fully fabricated in the USA</strong> — cut, stitched, and embroidered right here at home</li>
  <li style="padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;">🔒 <strong>Exact-fit design</strong> for the ${vehicle}${yearStr ? ' ' + yearStr : ''}</li>`;

  if (info.hasMOLLE) {
    html += `
  <li style="padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;">🧵 <strong>MOLLE/PALS webbing</strong> — add pouches, storage, and gear without drilling a thing</li>`;
  }

  html += `
  <li style="padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;">🛡️ <strong>Top-grade materials</strong> — UV resistant, weatherproof, and trail-tested</li>`;

  if (info.hasSRS) {
    html += `
  <li style="padding:8px 12px;margin-bottom:6px;background:#1a1a1a;border-left:4px solid #b8001f;font-size:0.95em;color:#ffffff;">💺 <strong>SRS airbag compliant</strong> — designed to work with your vehicle's safety systems</li>`;
  }

  html += `
</ul>

<p style="font-size:0.95em;color:#ffffff;line-height:1.6;margin-bottom:12px;">Every Bartact seat cover is designed, cut, and sewn in our facility — no overseas outsourcing, no shortcuts. We use mil-spec Bar Tack stitching on all stress points and UV-resistant thread throughout.</p>`;

  // Add cross-links if we found any relevant ones
  if (crossLinks.length > 0 && crossLinks.length <= 3) {
    html += `\n<div style="margin:16px 0;padding:12px;background:#1a1a1a;border-radius:6px;">
  <p style="color:#fff;font-weight:bold;margin:0 0 8px;">Complete your interior:</p>`;
    for (const link of crossLinks.slice(0, 3)) {
      html += `\n  <a href="${link.url}" style="display:inline-block;background:#e0a800;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;margin:0 8px 8px 0;">${link.text.substring(0, 40)} →</a>`;
    }
    html += `\n</div>`;
  }

  html += `

<p style="font-size:1.1em;font-weight:bold;text-align:center;margin-top:24px;color:#fff;">You can find cheaper. You won't find better.</p>

</div>`;

  return html;
}

async function main() {
  // Load state
  let state = { done: [], failed: [] };
  if (fs.existsSync(STATE_FILE)) state = JSON.parse(fs.readFileSync(STATE_FILE));
  const doneSet = new Set(state.done);
  
  // Get all products
  let all = [];
  let url = '/admin/api/2024-10/products.json?limit=250&fields=id,title,body_html,handle,product_type';
  while (url) {
    const r = await req({ hostname:STORE, path:url, method:'GET', headers:{'X-Shopify-Access-Token':TOKEN,'Content-Type':'application/json'} });
    if (r.status !== 200) { console.log('Error fetching:', r.status); break; }
    all = all.concat(r.body.products);
    if (r.body.products.length === 250) {
      const lastId = r.body.products[r.body.products.length-1].id;
      url = '/admin/api/2024-10/products.json?limit=250&fields=id,title,body_html,handle,product_type&since_id=' + lastId;
    } else {
      url = null;
    }
    await new Promise(r=>setTimeout(r,300));
  }
  
  console.log('Total products:', all.length);
  
  // Filter to seat covers that need upgrade
  const needsUpgrade = all.filter(p => {
    const t = p.title.toLowerCase();
    const isSeatCover = t.includes('seat cover');
    const alreadyDone = (p.body_html||'').includes('You can find cheaper') || (p.body_html||'').includes('data-tier-nav');
    return isSeatCover && !alreadyDone && !doneSet.has(p.id);
  });
  
  console.log('Seat covers needing upgrade:', needsUpgrade.length);
  
  // Process in batches of 20 (Shopify rate limit: 2 calls/sec, 40/bucket)
  const BATCH = 50;
  let ok = 0, fail = 0;
  
  for (let i = 0; i < Math.min(needsUpgrade.length, BATCH); i++) {
    const p = needsUpgrade[i];
    const info = parseTitle(p.title);
    const newHtml = generateDescription(p.title, info, p.body_html);
    
    const body = JSON.stringify({ product: { id: p.id, body_html: newHtml } });
    const r = await req({ hostname:STORE, path:'/admin/api/2024-10/products/' + p.id + '.json', method:'PUT', headers:{'X-Shopify-Access-Token':TOKEN,'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)} }, body);
    
    if (r.status === 200) {
      ok++;
      state.done.push(p.id);
      console.log('✅ ' + p.id + ' | ' + p.title.substring(0, 50));
    } else {
      fail++;
      state.failed.push({ id: p.id, status: r.status, error: JSON.stringify(r.body).substring(0, 100) });
      console.log('❌ ' + p.id + ' | ' + r.status + ' | ' + p.title.substring(0, 40));
    }
    
    // Rate limit: 500ms between calls
    await new Promise(r=>setTimeout(r, 500));
  }
  
  // Save state
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log('\nBatch done: ' + ok + ' OK, ' + fail + ' failed');
  console.log('Total done so far: ' + state.done.length);
  console.log('Remaining: ' + (needsUpgrade.length - ok));
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
