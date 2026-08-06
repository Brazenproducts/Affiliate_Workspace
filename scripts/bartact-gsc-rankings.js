const fs = require('fs');
const creds = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json','utf8'));

async function getToken() {
  const p = new URLSearchParams({client_id:creds.client_id,client_secret:creds.client_secret,refresh_token:creds.refresh_token,grant_type:'refresh_token'});
  return (await (await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:p})).json()).access_token;
}

async function gscQuery(token, body) {
  const r = await fetch('https://searchconsole.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fbartact.com%2F/searchAnalytics/query', {
    method:'POST',
    headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},
    body:JSON.stringify(body)
  });
  return r.json();
}

async function run() {
  const token = await getToken();

  // This week vs last week
  const thisWeekStart = '2026-07-18';
  const thisWeekEnd   = '2026-07-24';
  const lastWeekStart = '2026-07-11';
  const lastWeekEnd   = '2026-07-17';

  // Get this week top keywords by clicks
  const thisWeek = await gscQuery(token, {
    startDate: thisWeekStart, endDate: thisWeekEnd,
    dimensions: ['query'],
    rowLimit: 50,
    orderBy: [{fieldName:'clicks',sortOrder:'DESCENDING'}]
  });

  // Get last week same keywords
  const lastWeek = await gscQuery(token, {
    startDate: lastWeekStart, endDate: lastWeekEnd,
    dimensions: ['query'],
    rowLimit: 50,
    orderBy: [{fieldName:'clicks',sortOrder:'DESCENDING'}]
  });

  if (!thisWeek.rows) { process.stdout.write('GSC error: '+JSON.stringify(thisWeek)+'\n'); return; }

  // Build last week lookup
  const lastWeekMap = {};
  (lastWeek.rows||[]).forEach(r => lastWeekMap[r.keys[0]] = r);

  process.stdout.write('=== GSC KEYWORD RANKINGS — THIS WEEK vs LAST WEEK ===\n');
  process.stdout.write('This week: '+thisWeekStart+' to '+thisWeekEnd+'\n');
  process.stdout.write('Last week: '+lastWeekStart+' to '+lastWeekEnd+'\n\n');

  process.stdout.write('=== TOP 50 KEYWORDS THIS WEEK ===\n');
  process.stdout.write(('Keyword').padEnd(55)+('Pos').padStart(6)+('Pos LW').padStart(8)+('Δ Pos').padStart(7)+('Clicks').padStart(8)+('Impr').padStart(8)+'\n');
  process.stdout.write('-'.repeat(95)+'\n');

  thisWeek.rows.forEach(r => {
    const kw = r.keys[0];
    const pos = r.position.toFixed(1);
    const lw = lastWeekMap[kw];
    const lwPos = lw ? lw.position.toFixed(1) : 'NEW';
    const delta = lw ? (lw.position - r.position).toFixed(1) : 'NEW';
    const arrow = lw ? (parseFloat(delta) > 0.5 ? '▲' : parseFloat(delta) < -0.5 ? '▼' : '→') : '🆕';
    const kwTrunc = kw.length > 54 ? kw.slice(0,51)+'...' : kw;
    process.stdout.write((arrow+' '+kwTrunc).padEnd(57)+(pos+'').padStart(6)+(lwPos+'').padStart(8)+(delta+'').padStart(7)+(r.clicks+'').padStart(8)+(r.impressions+'').padStart(8)+'\n');
  });

  // Also show biggest movers from last week top keywords
  process.stdout.write('\n=== BIGGEST POSITION IMPROVEMENTS ===\n');
  const movers = thisWeek.rows
    .filter(r => lastWeekMap[r.keys[0]] && (lastWeekMap[r.keys[0]].position - r.position) > 1)
    .sort((a,b) => (lastWeekMap[b.keys[0]].position - b.position) - (lastWeekMap[a.keys[0]].position - a.position))
    .slice(0,15);
  movers.forEach(r => {
    const kw = r.keys[0];
    const lw = lastWeekMap[kw];
    const improvement = (lw.position - r.position).toFixed(1);
    process.stdout.write('▲ +'+improvement.padStart(5)+' | pos: '+lw.position.toFixed(1)+' → '+r.position.toFixed(1)+' | "'+kw+'"\n');
  });

  // Biggest drops
  process.stdout.write('\n=== BIGGEST POSITION DROPS ===\n');
  const drops = thisWeek.rows
    .filter(r => lastWeekMap[r.keys[0]] && (r.position - lastWeekMap[r.keys[0]].position) > 1)
    .sort((a,b) => (b.position - lastWeekMap[b.keys[0]].position) - (a.position - lastWeekMap[a.keys[0]].position))
    .slice(0,15);
  drops.forEach(r => {
    const kw = r.keys[0];
    const lw = lastWeekMap[kw];
    const drop = (r.position - lw.position).toFixed(1);
    process.stdout.write('▼ -'+drop.padStart(5)+' | pos: '+lw.position.toFixed(1)+' → '+r.position.toFixed(1)+' | "'+kw+'"\n');
  });

  // Overall stats
  process.stdout.write('\n=== OVERALL THIS WEEK ===\n');
  const totalClicks = thisWeek.rows.reduce((s,r)=>s+r.clicks,0);
  const totalImpr = thisWeek.rows.reduce((s,r)=>s+r.impressions,0);
  const avgPos = (thisWeek.rows.reduce((s,r)=>s+r.position,0)/thisWeek.rows.length).toFixed(1);
  process.stdout.write('Total clicks: '+totalClicks+'\n');
  process.stdout.write('Total impressions: '+totalImpr+'\n');
  process.stdout.write('Avg position (top 50): '+avgPos+'\n');
}

run().catch(e=>process.stdout.write('ERR:'+e.message+'\n'));
