const fs = require('fs');
const https = require('https');

const API_KEY = fs.readFileSync('/home/ubuntu/.openclaw/workspace/.elevenlabs-key', 'utf8').trim();
const BRIAN = 'nPczCjzI2devNBz1zQrb';

// V3 script — per Mitch:
// - Bartact only ONCE (seat covers)
// - Carli Suspension (we make their limit straps)
// - WARN winch (we make their winch covers)
// - Method Race Wheels
// - No phone mounts, no dash cams
// - Tonneau covers + floor mats stay
const script = `If you own a truck, you need these upgrades. Starting with seat covers. Bartact makes the best, made in the USA in Southern California. Tonneau covers keep your gear dry and boost fuel economy. For suspension, Carli is the gold standard, race proven coilovers and control arms built to last. A WARN winch is a must if you hit the trails, don't get stuck without one. Method Race Wheels, because your truck deserves better than stock. Floor mats, WeatherTech or custom fit, protect your interior. Full list with links in the description. Hit subscribe for more truck upgrades.`;

console.log(`Word count: ${script.split(/\s+/).length}`);

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
    const out = '/home/ubuntu/.openclaw/workspace/videos/truck-accessories-v3-voiceover.mp3';
    fs.writeFileSync(out, audio);
    fs.writeFileSync('/home/ubuntu/.openclaw/workspace/videos/truck-accessories-v3-script.txt', script);
    console.log(`✓ Wrote ${out} (${(audio.length/1024).toFixed(1)} KB)`);
    const dur = require('child_process').execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${out}"`).toString().trim();
    console.log(`Duration: ${dur}s`);
  });
});
req.on('error', e => console.error('ERR', e.message));
req.write(payload);
req.end();
