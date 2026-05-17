#!/usr/bin/env node
const fs = require('fs'); const https = require('https');
const data = JSON.parse(fs.readFileSync('/tmp/harvested-images-all.json','utf8'));
const ids = Object.keys(data);
function check(id) {
  return new Promise((resolve) => {
    const url = `https://m.media-amazon.com/images/I/${encodeURIComponent(id)}._AC_SL1500_.jpg`;
    const req = https.request(url, { method: 'HEAD', timeout: 8000 }, res => { resolve({ id, status: res.statusCode }); res.resume(); });
    req.on('error', () => resolve({ id, status: 0 }));
    req.on('timeout', () => { req.destroy(); resolve({ id, status: 0 }); });
    req.end();
  });
}
(async () => {
  const verified = {}, dead = {};
  for (let i = 0; i < ids.length; i += 20) {
    const batch = ids.slice(i, i+20);
    const res = await Promise.all(batch.map(check));
    for (const r of res) {
      if (r.status === 200) verified[r.id] = data[r.id];
      else dead[r.id] = { status: r.status, usages: data[r.id] };
    }
  }
  fs.writeFileSync('/tmp/verified-images-all.json', JSON.stringify(verified, null, 2));
  fs.writeFileSync('/tmp/dead-images-all.json',    JSON.stringify(dead,     null, 2));
  console.log(`verified=${Object.keys(verified).length}  dead=${Object.keys(dead).length}`);
})();
