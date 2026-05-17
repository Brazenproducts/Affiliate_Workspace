#!/usr/bin/env node
// Batch deploy all affiliate sites to GitHub Pages + DNS + Search Console
// Reads /home/ubuntu/.openclaw/workspace/sites/<domain>/ for each domain in DOMAINS
// Creates repo under Brazenproducts org, pushes, enables Pages, sets CNAME
// Then triggers DNS via godaddy-github-dns.sh

const { execSync } = require('child_process');
const fs = require('fs');

function getGithubToken() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  const remote = execSync("git -C /home/ubuntu/.openclaw/workspace/swalmy.com remote get-url origin", { encoding: 'utf8' }).trim();
  const match = remote.match(/https:\/\/(ghp_[^@]+)@github\.com\//);
  if (!match) {
    throw new Error('GitHub token not found. Set GH_TOKEN or fix swalmy.com origin URL.');
  }
  return match[1];
}

const GH_TOKEN = getGithubToken();
const GH_ORG = 'Brazenproducts';
const SITES_DIR = '/home/ubuntu/.openclaw/workspace/sites';

// All affiliate sites — only deploy the ones whose directories exist
const ALL_DOMAINS = [
  // Original 15 (5/5)
  'bestmagnesiumglycinate.com',
  'bestnecklifttape.com',
  'bestportable-charger.com',
  'bestheating-pad.com',
  'bestvibrationplate.com',
  'bestresistance-bands.com',
  'bestprotein-powder.com',
  'bestmini-fridge.com',
  'bestmassage-gun.com',
  'bestgaming-chair.com',
  'bestice-maker.com',
  'bestportable-ac.com',
  'bestpower-bank.com',
  'bestlabel-maker.com',
  'bestshower-head.com',
  // Phase 1 high-yield (5/5)
  'besttowingstrap.com',
  'besttirepatch.com',
  'bestheadlightrestoration.com',
  'besttireinflator.com',
  'bestsousvide.com',
  'bestdutchoven.com',
  'bestpastamaker.com',
  'bestreciprocatingsaw.com'
];

async function ghApi(method, path, body) {
  const url = `https://api.github.com${path}`;
  const headers = {
    'Authorization': `token ${GH_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  if (body) headers['Content-Type'] = 'application/json';
  
  const r = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  return { status: r.status, body: await r.text() };
}

function verifyLive(domain) {
  try {
    const out = execSync(`node /home/ubuntu/.openclaw/workspace/scripts/verify-live-site.js ${domain}`, { encoding: 'utf8', stdio: 'pipe' }).trim();
    return JSON.parse(out.split('\n').pop());
  } catch (e) {
    const raw = (e.stdout || e.stderr || e.message || '').toString().trim().split('\n').pop();
    try { return JSON.parse(raw); } catch { return { domain, healthy: false, error: raw || 'verify failed' }; }
  }
}

async function deploySite(domain) {
  const siteDir = `${SITES_DIR}/${domain}`;
  
  if (!fs.existsSync(siteDir)) {
    return { domain, skipped: true, reason: 'directory not found' };
  }
  
  // Verify CNAME file exists
  if (!fs.existsSync(`${siteDir}/CNAME`)) {
    fs.writeFileSync(`${siteDir}/CNAME`, domain);
  }
  
  const repo = domain.replace(/\./g, '-');
  const result = { domain, repo };
  
  // 1. Create repo
  const createRes = await ghApi('POST', `/orgs/${GH_ORG}/repos`, {
    name: repo, public: true, auto_init: false, has_issues: false, has_wiki: false
  });
  result.create = createRes.status;
  
  // 2. Git push
  try {
    execSync(`cd ${siteDir} && \
      git init -b main 2>/dev/null; \
      git config user.email 'deploy@${domain}'; \
      git config user.name Deploy; \
      git add -A; \
      git commit -m 'Initial deploy' 2>&1 || true; \
      git remote remove origin 2>/dev/null; \
      git remote add origin https://x-access-token:${GH_TOKEN}@github.com/${GH_ORG}/${repo}.git; \
      git push -u origin main --force 2>&1`, { encoding: 'utf8', stdio: 'pipe' });
    result.push = 'OK';
  } catch (e) {
    result.push = 'FAIL: ' + (e.stderr || e.message).slice(-200);
  }
  
  // 3. Enable Pages
  const pagesRes = await ghApi('POST', `/repos/${GH_ORG}/${repo}/pages`, {
    source: { branch: 'main', path: '/' }
  });
  result.pages = pagesRes.status;
  
  // 4. Set CNAME on Pages
  await new Promise(r => setTimeout(r, 1500));
  const cnameRes = await ghApi('PUT', `/repos/${GH_ORG}/${repo}/pages`, {
    cname: domain, source: { branch: 'main', path: '/' }
  });
  result.cname = cnameRes.status;
  
  // 5. Point DNS via GoDaddy script
  try {
    execSync(`bash /home/ubuntu/.openclaw/workspace/scripts/godaddy-github-dns.sh ${domain}`, { encoding: 'utf8', stdio: 'pipe' });
    result.dns = 'OK';
  } catch (e) {
    result.dns = 'FAIL: ' + (e.stderr || e.message).slice(-200);
  }

  // 6. Live verification gate: repo/push is not success unless the site actually resolves.
  const live = verifyLive(domain);
  result.live = live;
  result.healthy = !!live.healthy;
  
  return result;
}

async function main() {
  console.log(`Deploying ${ALL_DOMAINS.length} affiliate sites...\n`);
  const results = [];
  
  for (const domain of ALL_DOMAINS) {
    process.stdout.write(`📦 ${domain.padEnd(35)} `);
    const r = await deploySite(domain);
    
    if (r.skipped) {
      console.log(`⏭️  skipped (${r.reason})`);
    } else {
      const ok = r.push === 'OK' && r.dns === 'OK' && r.healthy;
      const liveBits = r.live ? ` live:https=${r.live.https} sitemap=${r.live.sitemap} pages=${r.live.pages}` : '';
      console.log(`${ok ? '✅' : '⚠️'} repo:${r.create} push:${r.push.slice(0,3)} pages:${r.pages} cname:${r.cname} dns:${r.dns.slice(0,3)}${liveBits}`);
    }
    results.push(r);
  }
  
  fs.writeFileSync('/home/ubuntu/.openclaw/workspace/memory/affiliate-deploy-results.json', JSON.stringify(results, null, 2));
  
  const deployed = results.filter(r => !r.skipped && r.healthy).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => !r.skipped && !r.healthy).length;
  
  console.log(`\n✅ Live healthy: ${deployed}  ⏭️  Skipped: ${skipped}  ❌ Not yet healthy: ${failed}`);
  console.log(`\nNext: wait 5-20 min for HTTPS cert, then run scripts/verify-affiliate-sc.js for Search Console`);
}

main().catch(e => console.error(e));
