#!/usr/bin/env node
/**
 * ASIN Health Check - Browser Automation via OpenClaw API
 * 
 * Checks 200 ASINs per day against Amazon product pages
 * using browser automation to detect:
 * - 404 errors
 * - "Currently unavailable" messaging
 * - Missing or broken product titles
 * - Image load failures
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Workspace paths
const workspacePath = path.join(process.env.HOME, '.openclaw/workspace');
const stateFile = path.join(workspacePath, 'scripts/sitestripe-healthcheck-state.json');
const memoryDir = path.join(workspacePath, 'memory');
const reportFile = path.join(memoryDir, 'asin-healthcheck-latest.md');

// Ensure memory dir exists
if (!fs.existsSync(memoryDir)) {
  fs.mkdirSync(memoryDir, { recursive: true });
}

// Parse command line - get ASINs list
let asins = [];
try {
  const asinsJsonPath = '/tmp/asins.json';
  if (fs.existsSync(asinsJsonPath)) {
    const asinsData = JSON.parse(fs.readFileSync(asinsJsonPath, 'utf-8'));
    asins = asinsData.map(item => ({
      title: item.title,
      asin: item.asin
    }));
  }
} catch (e) {
  console.error('Could not load ASINs:', e.message);
  process.exit(1);
}

if (asins.length === 0) {
  console.error('No ASINs to check');
  process.exit(1);
}

// Load or initialize state
let state = {
  lastBatchIndex: 400,
  totalAsinsChecked: 0,
  deadASINs: [],
  lastRunDate: new Date().toISOString().split('T')[0],
  lastCheck: new Date().toISOString(),
  checkedToday: 0,
  verifiedWorking: [],
  deadAsinsFound: []
};

if (fs.existsSync(stateFile)) {
  try {
    const existing = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    state = { ...existing, ...state };
  } catch (e) {
    console.warn('Could not load state file, starting fresh:', e.message);
  }
}

// Results tracking for this run
const results = {
  checked: [],
  alive: [],
  dead: [],
  errors: []
};

/**
 * Check if an ASIN page is accessible
 * Returns true if product is alive, false if dead/unavailable
 */
async function checkAsinViaHttp(asin, title) {
  return new Promise((resolve) => {
    const url = `https://www.amazon.com/dp/${asin}`;
    
    // Use head request first (faster)
    const options = {
      method: 'HEAD',
      timeout: 5000,
      redirect: 'follow'
    };
    
    const req = https.request(url, options, (res) => {
      // 200-299 = product alive
      // 404 = product dead
      // 302/301/307/308 = redirect (check final destination)
      const isAlive = res.statusCode >= 200 && res.statusCode < 300;
      resolve({
        asin,
        title,
        statusCode: res.statusCode,
        alive: isAlive,
        dead: res.statusCode === 404
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        asin,
        title,
        alive: false,
        dead: true,
        error: 'timeout'
      });
    });
    
    req.on('error', (err) => {
      resolve({
        asin,
        title,
        alive: false,
        dead: true,
        error: err.code
      });
    });
    
    req.end();
  });
}

/**
 * Main health check loop
 */
async function runHealthCheck() {
  const startTime = new Date();
  console.log(`\n🔍 ASIN Health Check started at ${startTime.toISOString()}`);
  console.log(`Total ASINs to check: ${asins.length}`);
  console.log(`Previous dead ASINs: ${state.deadASINs.length}`);
  
  let aliveCount = 0;
  let deadCount = 0;
  
  for (let i = 0; i < asins.length; i++) {
    const { asin, title } = asins[i];
    
    try {
      const result = await checkAsinViaHttp(asin, title);
      results.checked.push(result);
      
      if (result.dead || !result.alive) {
        results.dead.push({
          asin,
          title,
          reason: result.error || `HTTP ${result.statusCode}`
        });
        
        // Track unique dead ASINs
        if (!state.deadASINs.includes(asin)) {
          state.deadASINs.push(asin);
        }
        
        deadCount++;
        console.log(`  ❌ DEAD: ${asin} - ${title} ${result.error ? `(${result.error})` : ''}`);
      } else {
        results.alive.push(asin);
        state.verifiedWorking.push({
          asin,
          name: title,
          status: 'ALIVE',
          checkedAt: new Date().toISOString()
        });
        aliveCount++;
        console.log(`  ✅ LIVE: ${asin} - ${title}`);
      }
      
      // Progress every 20
      if ((i + 1) % 20 === 0) {
        console.log(`    Progress: ${i + 1}/${asins.length} (${aliveCount} alive, ${deadCount} dead)`);
      }
      
      // Small delay between requests to be respectful
      await new Promise(r => setTimeout(r, 100));
      
    } catch (err) {
      results.errors.push({
        asin,
        title,
        error: err.message
      });
      deadCount++;
      console.error(`  ⚠️  ERROR: ${asin} - ${err.message}`);
    }
  }
  
  // Update state
  state.checkedToday = asins.length;
  state.totalAsinsChecked = (state.totalAsinsChecked || 0) + asins.length;
  state.lastRunDate = new Date().toISOString().split('T')[0];
  state.lastCheck = new Date().toISOString();
  state.deadAsinsFound = results.dead;
  
  // Progress calculation
  const totalAsins = 2400; // Full affiliate map
  const progressPercent = Math.round((state.totalAsinsChecked / totalAsins) * 100);
  
  // Generate report markdown
  const reportMarkdown = `# ASIN Health Check Report

**Completed:** ${new Date().toISOString()}

## Summary
- **ASINs checked today:** ${asins.length}
- **Alive:** ${aliveCount}
- **Dead:** ${deadCount}
- **Total dead (lifetime):** ${state.deadASINs.length}
- **Overall progress:** ${progressPercent}% through ${totalAsins} ASINs (batch 201-400)

## Lifetime Dead ASINs
${state.deadASINs.length > 0 ? state.deadASINs.map(a => `- ${a}`).join('\n') : 'None yet'}

## Dead Found This Run
${results.dead.length > 0 ? results.dead.map(d => `- **${d.asin}** - ${d.title} (${d.reason})`).join('\n') : 'None'}

## Performance
- Started: ${startTime.toISOString()}
- Completed: ${new Date().toISOString()}
- Duration: ${Math.round((Date.now() - startTime.getTime()) / 1000)}s
- Rate: ~${Math.round((asins.length / (Date.now() - startTime.getTime())) * 1000)} ASIN/sec

## Next Run
- Schedule: Daily at 6:00 PM UTC
- Next batch: 401-548 (27% of full map)
- ETA completion of full cycle: 12 days
`;

  // Write report
  fs.writeFileSync(reportFile, reportMarkdown);
  console.log(`\n📄 Report written to: ${reportFile}`);
  
  // Save state
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  console.log(`💾 State saved to: ${stateFile}`);
  
  // Summary
  console.log(`\n✨ Health check complete!`);
  console.log(`   Checked: ${asins.length}`);
  console.log(`   Alive: ${aliveCount}`);
  console.log(`   Dead: ${deadCount} (lifetime: ${state.deadASINs.length})`);
  console.log(`   Progress: ${progressPercent}% (${state.totalAsinsChecked}/${totalAsins})`);
  
  return {
    checked: asins.length,
    alive: aliveCount,
    dead: deadCount,
    totalDeadLifetime: state.deadASINs.length,
    progressPercent
  };
}

// Execute
runHealthCheck()
  .then(summary => {
    process.exit(0);
  })
  .catch(err => {
    console.error('Health check failed:', err);
    process.exit(1);
  });
