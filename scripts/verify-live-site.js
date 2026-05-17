#!/usr/bin/env node
const { execSync } = require('child_process');

function getGithubToken() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  const remote = execSync("git -C /home/ubuntu/.openclaw/workspace/swalmy.com remote get-url origin", { encoding: 'utf8' }).trim();
  const match = remote.match(/https:\/\/(ghp_[^@]+)@github\.com\//);
  if (!match) throw new Error('GitHub token not found. Set GH_TOKEN or fix swalmy.com origin URL.');
  return match[1];
}

function curlCode(url) {
  try {
    return execSync(`curl -I -L --max-time 12 -s -o /dev/null -w "%{http_code}" ${JSON.stringify(url)}`, { encoding: 'utf8' }).trim();
  } catch {
    return '000';
  }
}

function githubPages(domain, token) {
  try {
    const out = execSync(
      `curl -s -H ${JSON.stringify(`Authorization: token ${token}`)} -H 'Accept: application/vnd.github+json' https://api.github.com/repos/Brazenproducts/${domain}/pages`,
      { encoding: 'utf8' }
    );
    return JSON.parse(out);
  } catch {
    return null;
  }
}

const domains = process.argv.slice(2);
if (!domains.length) {
  console.error('Usage: node scripts/verify-live-site.js <domain> [domain...]');
  process.exit(1);
}

const token = getGithubToken();
let failed = 0;
for (const domain of domains) {
  const pages = githubPages(domain, token);
  const https = curlCode(`https://${domain}`);
  const http = curlCode(`http://${domain}`);
  const sitemap = curlCode(`https://${domain}/sitemap.xml`);
  const pagesOk = !!pages && !pages.message && pages.cname === domain;
  const healthy = https === '200' && sitemap === '200' && pagesOk;
  const row = {
    domain,
    healthy,
    pages: pagesOk ? 'ok' : (pages && pages.message) || 'missing',
    http,
    https,
    sitemap,
    cert: pages && pages.https_certificate ? pages.https_certificate.state : null,
  };
  console.log(JSON.stringify(row));
  if (!healthy) failed++;
}
process.exit(failed ? 2 : 0);
