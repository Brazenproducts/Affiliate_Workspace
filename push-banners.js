#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SITES_DIR = '/home/ubuntu/.openclaw/workspace/sites';
const GH_TOKEN = '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';
const BATCH_SIZE = 20;

// Get all directories with .git
const allDirs = fs.readdirSync(SITES_DIR).filter(d => {
  const full = path.join(SITES_DIR, d);
  return fs.statSync(full).isDirectory() && fs.existsSync(path.join(full, '.git'));
});

console.log(`Found ${allDirs.length} git repos`);

// Filter to only those with uncommitted changes
const dirtyDirs = allDirs.filter(d => {
  try {
    const out = execSync(`git -C ${path.join(SITES_DIR, d)} status --porcelain`, { encoding: 'utf8', stdio: ['pipe','pipe','pipe'] });
    return out.trim().length > 0;
  } catch(e) {
    return false;
  }
});

console.log(`${dirtyDirs.length} repos have uncommitted changes`);

// Process one repo: configure, add, commit, push
function processRepo(domain) {
  return new Promise((resolve) => {
    const dir = path.join(SITES_DIR, domain);
    const pushUrl = `https://${GH_TOKEN}@github.com/Brazenproducts/${domain}.git`;
    
    try {
      execSync(`git -C "${dir}" config user.name "Axl"`, { stdio: 'pipe' });
      execSync(`git -C "${dir}" config user.email "info@brazenauto.com"`, { stdio: 'pipe' });
      execSync(`git -C "${dir}" add -A`, { stdio: 'pipe' });
      execSync(`git -C "${dir}" commit -m "Add cookie consent banner"`, { stdio: 'pipe' });
    } catch(e) {
      resolve({ domain, status: 'commit-failed', error: e.message.split('\n')[0] });
      return;
    }

    // Push
    const pushCmd = `git -C "${dir}" push "${pushUrl}" main 2>&1`;
    exec_with_output(pushCmd, domain, resolve);
  });
}

function exec_with_output(cmd, domain, resolve) {
  const child = spawn('bash', ['-c', cmd]);
  let output = '';
  child.stdout.on('data', d => output += d);
  child.stderr.on('data', d => output += d);
  child.on('close', code => {
    if (code === 0) {
      resolve({ domain, status: 'success' });
    } else if (output.includes('404') || output.includes('Repository not found') || output.includes('not found')) {
      resolve({ domain, status: 'skip-404', error: 'repo not found' });
    } else if (output.includes('403') || output.includes('Permission') || output.includes('forbidden')) {
      resolve({ domain, status: 'skip-403', error: 'forbidden' });
    } else {
      resolve({ domain, status: 'push-failed', error: output.trim().split('\n').slice(-3).join(' | ') });
    }
  });
}

async function runBatches() {
  let succeeded = 0, failed = 0, skipped = 0;
  const errors = [];
  
  for (let i = 0; i < dirtyDirs.length; i += BATCH_SIZE) {
    const batch = dirtyDirs.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(dirtyDirs.length / BATCH_SIZE);
    console.log(`\nBatch ${batchNum}/${totalBatches}: processing ${batch.join(', ')}`);
    
    const results = await Promise.all(batch.map(d => processRepo(d)));
    
    for (const r of results) {
      if (r.status === 'success') {
        succeeded++;
        console.log(`  ✓ ${r.domain}`);
      } else if (r.status.startsWith('skip')) {
        skipped++;
        console.log(`  ~ ${r.domain} (${r.status}: ${r.error})`);
      } else {
        failed++;
        errors.push(r);
        console.log(`  ✗ ${r.domain} (${r.status}: ${r.error})`);
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Pushed ${succeeded} of ${dirtyDirs.length} repos successfully.`);
  console.log(`Skipped (repo not found / 403): ${skipped}`);
  console.log(`Failed (other errors): ${failed}`);
  if (errors.length > 0) {
    console.log(`\nFailed repos:`);
    errors.forEach(e => console.log(`  - ${e.domain}: ${e.status} — ${e.error}`));
  }
}

runBatches().catch(console.error);
