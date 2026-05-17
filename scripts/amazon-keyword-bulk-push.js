#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const CREDS = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.amazon-bartact-credentials.json', 'utf8'));

function req(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, resp => { let d=''; resp.on('data',c=>d+=c); resp.on('end',()=>{ try{res({status:resp.statusCode,body:JSON.parse(d)})}catch{res({status:resp.statusCode,body:d})} }); });
    r.on('error',rej); if(body)r.write(body); r.end();
  });
}

async function getToken() {
  const tb = new URLSearchParams({ grant_type:'refresh_token', refresh_token:CREDS.refresh_token, client_id:CREDS.client_id, client_secret:CREDS.client_secret }).toString();
  const tr = await req({ hostname:'api.amazon.com', path:'/auth/o2/token', method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(tb)} }, tb);
  return tr.body.access_token;
}

function generateKeywords(title) {
  const t = title.toLowerCase();
  let kw = [];

  // Base terms everyone gets
  kw.push('off road accessories tactical MOLLE');

  // Vehicle detection
  if (t.includes('bronco')) kw.push('ford bronco 2021 2022 2023 2024 2025 full size');
  if (t.includes('jl') || t.includes('jlu')) kw.push('jeep wrangler JL JLU 2018 2019 2020 2021 2022 2023 2024 rubicon sahara sport');
  if (t.includes('jk') || t.includes('jku')) kw.push('jeep wrangler JK JKU unlimited rubicon sahara sport');
  if (t.includes('tj')) kw.push('jeep wrangler TJ rubicon sahara sport');
  if (t.includes('gladiator') || t.includes('jt')) kw.push('jeep gladiator JT 2019 2020 2021 2022 2023 2024 rubicon mojave sport');
  if (t.includes('tacoma')) kw.push('toyota tacoma TRD off road sport pro');

  // Product type detection
  if (t.includes('seat cover')) kw.push('custom fit waterproof neoprene overlanding');
  if (t.includes('front')) kw.push('front pair');
  if (t.includes('rear') || t.includes('bench')) kw.push('rear bench');
  if (t.includes('grab handle')) kw.push('grab handles paracord made in USA');
  if (t.includes('door bag')) kw.push('door bag storage pouch interior');
  if (t.includes('door') && t.includes('panel')) kw.push('door panel storage organizer interior');
  if (t.includes('visor')) kw.push('sun visor cover PALS webbing');
  if (t.includes('console')) kw.push('console organizer storage pouch interior');
  if (t.includes('pouch') || t.includes('molle pouch')) kw.push('storage pouch organizer PALS 1000d cordura');
  if (t.includes('ifak')) kw.push('first aid kit medical EMT emergency');
  if (t.includes('barrel bag') || t.includes('roll bar bag')) kw.push('roll bar storage bag organizer');
  if (t.includes('limit') && t.includes('strap')) kw.push('suspension limiting strap 4130 chromoly racing UTV SXS');
  if (t.includes('door') && t.includes('strap')) kw.push('door limiting strap check strap replacement heavy duty');
  if (t.includes('headrest')) kw.push('headrest cover');
  if (t.includes('buckle') || t.includes('repair')) kw.push('field repair buckle PALS');
  if (t.includes('flag') || t.includes('patch')) kw.push('morale patch hook backing military');
  if (t.includes('winch')) kw.push('winch cover waterproof dust protection');
  if (t.includes('light bar')) kw.push('LED light bar cover dust protection');
  if (t.includes('fire ext')) kw.push('fire extinguisher mount roll bar');
  if (t.includes('ratchet') || t.includes('tie down')) kw.push('cargo strap truck trailer motorcycle ATV UTV');

  // Join and trim to 250 bytes
  let result = kw.join(' ');
  // Deduplicate words
  const words = result.split(/\s+/);
  const seen = new Set();
  const unique = words.filter(w => { const l = w.toLowerCase(); if (seen.has(l)) return false; seen.add(l); return true; });
  result = unique.join(' ');

  // Trim to 250 bytes
  while (Buffer.byteLength(result) > 250) {
    const parts = result.split(' ');
    parts.pop();
    result = parts.join(' ');
  }
  return result;
}

async function main() {
  const items = JSON.parse(fs.readFileSync('/tmp/bartact-all-listings.json', 'utf8'));

  // Already-done SKUs (parents + bronco children done earlier)
  const doneFile = '/tmp/keywords-done-skus.json';
  let done = new Set();
  if (fs.existsSync(doneFile)) done = new Set(JSON.parse(fs.readFileSync(doneFile)));

  // Get all non-parent SKUs not yet done
  const todo = items.filter(i => {
    const sku = i.sku || '';
    return !sku.includes('PARENT') && !sku.includes('Parent') && !done.has(sku);
  });

  console.log('Total child SKUs to process:', todo.length);
  if (todo.length === 0) { console.log('All done!'); return; }

  const token = await getToken();
  let ok = 0, fail = 0, skip = 0;

  for (let i = 0; i < todo.length; i++) {
    const item = todo[i];
    const sku = item.sku;
    const title = item.summaries?.[0]?.itemName || '';

    if (!title) { skip++; continue; }

    const keywords = generateKeywords(title);
    if (Buffer.byteLength(keywords) < 20) { skip++; continue; } // Too short, skip

    const body = JSON.stringify({ productType:'PRODUCT', patches:[{ op:'replace', path:'/attributes/generic_keyword', value:[{value:keywords, marketplace_id:CREDS.marketplace_id}] }] });
    const r = await req({ hostname:'sellingpartnerapi-na.amazon.com', path:'/listings/2021-08-01/items/'+CREDS.seller_id+'/'+encodeURIComponent(sku)+'?marketplaceIds='+CREDS.marketplace_id, method:'PATCH', headers:{'x-amz-access-token':token,'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)} }, body);

    if (r.status === 200) {
      ok++;
      done.add(sku);
      if (ok % 50 === 0) process.stdout.write(ok + '...');
    } else {
      fail++;
      if (fail <= 5) console.log('\nFAIL ' + sku + ' ' + r.status);
    }

    // Rate limit: 400ms between calls
    await new Promise(r => setTimeout(r, 400));

    // Save progress every 100
    if ((ok + fail) % 100 === 0) {
      fs.writeFileSync(doneFile, JSON.stringify([...done]));
    }
  }

  // Final save
  fs.writeFileSync(doneFile, JSON.stringify([...done]));
  console.log('\nDone: ' + ok + ' OK, ' + fail + ' failed, ' + skip + ' skipped');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
