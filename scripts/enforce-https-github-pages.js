const https = require('https');
const { execSync } = require('child_process');

function getGithubToken() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  const remote = execSync("git -C /home/ubuntu/.openclaw/workspace/swalmy.com remote get-url origin", { encoding: 'utf8' }).trim();
  const match = remote.match(/https:\/\/(ghp_[^@]+)@github\.com\//);
  if (!match) {
    throw new Error('GitHub token not found. Set GH_TOKEN or fix swalmy.com origin URL.');
  }
  return match[1];
}

const GITHUB_TOKEN = getGithubToken();
const GITHUB_USER = 'Brazenproducts';

const NEW_SITES = [
  'bestmagnesiumglycinate.com','bestnecklifttape.com','bestportable-charger.com',
  'bestheating-pad.com','bestvibrationplate.com','bestresistance-bands.com',
  'bestprotein-powder.com','bestmini-fridge.com','bestmassage-gun.com',
  'bestgaming-chair.com','bestice-maker.com','bestportable-ac.com',
  'bestpower-bank.com','bestlabel-maker.com','bestshower-head.com',
];

function githubRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'Axl-Affiliate-Manager',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(d ? JSON.parse(d) : {});
        } else {
          reject(new Error(`${res.statusCode}: ${d.substring(0,200)}`));
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  for (const domain of NEW_SITES) {
    const repo = domain; // repos use actual domain names with dots
    process.stdout.write(`${domain}: `);
    
    try {
      // Get current Pages config
      const pages = await githubRequest('GET', `/repos/${GITHUB_USER}/${repo}/pages`);
      
      if (pages.https_enforced) {
        console.log('✅ HTTPS already enforced');
      } else {
        // Enable HTTPS enforcement
        await githubRequest('PUT', `/repos/${GITHUB_USER}/${repo}/pages`, {
          https_enforced: true
        });
        console.log('✅ HTTPS enforcement enabled');
      }
    } catch(e) {
      console.log(`❌ ${e.message.substring(0,80)}`);
    }
    
    await new Promise(r => setTimeout(r, 1500));
  }
  
  console.log('\n=== DONE ===');
}

run().catch(e => console.error('Fatal:', e.message));
