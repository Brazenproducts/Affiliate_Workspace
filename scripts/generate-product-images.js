const fs = require('fs');
const https = require('https');

const XAIKEY = 'xai-S5hLItB2sSmg3xR10q6UPzUvlTjDKA1riY44VljVHiZP7jQrTBVhI8QkZvo7OuuLd1VPctYX560cHhhr';
const IMGDIR = '/home/ubuntu/.openclaw/workspace/videos/images';

function generateImage(prompt, filename) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'grok-imagine-image',
      prompt,
      n: 1
    });
    const req = https.request({
      hostname: 'api.x.ai',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAIKEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const data = JSON.parse(d);
          if (data.data && data.data[0]) {
            const url = data.data[0].url;
            const b64 = data.data[0].b64_json;
            if (b64) {
              fs.writeFileSync(`${IMGDIR}/${filename}`, Buffer.from(b64, 'base64'));
              console.log(`✓ ${filename} saved (b64)`);
              resolve(true);
            } else if (url) {
              console.log(`URL for ${filename}: ${url}`);
              // Download URL
              https.get(url, resp => {
                const chunks = [];
                resp.on('data', c => chunks.push(c));
                resp.on('end', () => {
                  fs.writeFileSync(`${IMGDIR}/${filename}`, Buffer.concat(chunks));
                  console.log(`✓ ${filename} saved (url)`);
                  resolve(true);
                });
              });
            } else {
              console.log(`No image data for ${filename}:`, JSON.stringify(data.data[0]).slice(0, 200));
              resolve(false);
            }
          } else {
            console.log(`Error for ${filename}:`, d.slice(0, 300));
            resolve(false);
          }
        } catch(e) {
          console.log(`Parse error for ${filename}:`, e.message, d.slice(0, 200));
          resolve(false);
        }
      });
    });
    req.on('error', e => { console.log(`Net error: ${e.message}`); reject(e); });
    req.write(payload);
    req.end();
  });
}

(async () => {
  // Carli Suspension style image
  await generateImage(
    'Professional product photo of premium off-road truck suspension coilover shocks and control arms, anodized aluminum and steel, laid out on clean white background, studio lighting, no text, no logos, no brand names',
    'carli-suspension.jpg'
  );

  // WARN winch style image
  await generateImage(
    'Professional product photo of a heavy duty black steel truck winch with synthetic rope, mounted on a steel fairlead, clean white background, studio lighting, no text, no logos, no brand names',
    'warn-winch.jpg'
  );
})();
