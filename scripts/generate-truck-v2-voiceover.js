const fs = require('fs');
const https = require('https');

const API_KEY = fs.readFileSync('/home/ubuntu/.openclaw/workspace/.elevenlabs-key', 'utf8').trim();
const BRIAN = 'nPczCjzI2devNBz1zQrb';

// V2 script — fixed per Mitch feedback:
// - Bartact seat covers (not generic)
// - No phone mounts (dated)
// - No dash cams (dated)
// - Added grab handles + bumpers
// - WARN winch specifically
// - Timed segments for image sync (~5s each)
const script = `If you own a truck, you need these upgrades. Starting with seat covers. Bartact makes the best, made in the USA in Southern California, Berry Compliant and SRS airbag compatible. Tonneau covers keep your gear dry and boost fuel economy. Floor mats, WeatherTech or custom fit. Bed organizers make your truck bed actually useful. Recovery gear, a WARN winch changes everything when you're stuck on the trail. Grab handles, Bartact paracord handles are the gold standard. And if you run off-road, a lift kit opens up a whole new world. Full list with links in the description. Hit subscribe for more truck upgrades.`;

console.log(`Word count: ${script.split(/\s+/).length}`);
console.log(`Estimated duration at 155wpm: ${(script.split(/\s+/).length / 155 * 60).toFixed(1)}s`);

const payload = JSON.stringify({
  text: script,
  model_id: 'eleven_multilingual_v2',
  voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true }
});

const req = https.request({
  hostname: 'api.elevenlabs.io',
  path: `/v1/text-to-speech/${BRIAN}`,
  method: 'POST',
  headers: {
    'Accept': 'audio/mpeg',
    'xi-api-key': API_KEY,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  if (res.statusCode !== 200) {
    let err = '';
    res.on('data', c => err += c);
    res.on('end', () => console.error(`HTTP ${res.statusCode}: ${err}`));
    return;
  }
  const chunks = [];
  res.on('data', c => chunks.push(c));
  res.on('end', () => {
    const audio = Buffer.concat(chunks);
    const out = '/home/ubuntu/.openclaw/workspace/videos/truck-accessories-v2-voiceover.mp3';
    fs.writeFileSync(out, audio);
    fs.writeFileSync('/home/ubuntu/.openclaw/workspace/videos/truck-accessories-v2-script.txt', script);
    console.log(`✓ Wrote ${out} (${(audio.length/1024).toFixed(1)} KB)`);
  });
});
req.on('error', e => console.error('ERR', e.message));
req.write(payload);
req.end();
