#!/usr/bin/env node
// Bartact Daily Ranking Monitor
// Pulls GSC data, compares week-over-week, identifies winners/losers, reports to Telegram

const fs = require('fs');
const { createSign } = require('crypto');

const TELEGRAM_TOKEN = (() => {
  const env = {};
  fs.readFileSync('/home/ubuntu/.openclaw/workspace/.env','utf8').split('\n').forEach(l=>{const[k,...v]=l.split('=');if(k&&v.length)env[k.trim()]=v.join('=').trim();});
  return env.TELEGRAM_TOKEN;
})();
const CHAT_ID = '7550065844';

// Key money keywords to always track
const PRIORITY_KEYWORDS = [
  'jeep seat covers',
  'jeep wrangler seat covers',
  'jeep wrangler jl seat covers',
  'jeep wrangler jk seat covers',
  'jeep gladiator seat covers',
  'ford bronco seat covers',
  'toyota tacoma seat covers',
  'jeep grab handles',
  'paracord grab handles',
  'ford bronco grab handles',
  'bronco grab handles',
  'jeep wrangler grab handles',
  'molle seat covers',
  'jeep molle accessories',
  'jeep fire extinguisher mount',
  'roll bar fire extinguisher',
  'jeep storage bags',
  'ford bronco storage',
  'winch cover',
  'jeep limit straps',
  'best seat covers for jeep wrangler',
  'best jeep gladiator seat covers',
  'best ford bronco seat covers',
  'bronco seat covers',
  'jeep tj seat covers',
];

const BRAND_TERMS = ['bartact', 'bartac', 'bar tact'];
const isBrand = kw => BRAND_TERMS.some(b => kw.toLowerCase().includes(b));

async function getGSCToken() {
  const key = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.gcp-service-account.json', 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const hdr = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const pay = Buffer.from(JSON.stringify({
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600
  })).toString('base64url');
  const sign = createSign('RSA-SHA256');
  sign.update(hdr + '.' + pay);
  const jwt = hdr + '.' + pay + '.' + sign.sign(key.private_key, 'base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt
  });
  const d = await r.json();
  if (!d.access_token) throw new Error('GSC token failed: ' + JSON.stringify(d));
  return d.access_token;
}

async function queryGSC(token, startDate, endDate) {
  const r = await fetch('https://searchconsole.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fwww.bartact.com%2F/searchAnalytics/query', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      startDate, endDate,
      dimensions: ['query'],
      rowLimit: 200,
      dimensionFilterGroups: [{ filters: [{ dimension: 'country', operator: 'equals', expression: 'usa' }] }]
    })
  });
  return r.json();
}

async function sendTelegram(msg) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'HTML' })
  });
}

function getDateRange(daysAgo, windowDays = 7) {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - daysAgo);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - windowDays + 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  };
}

async function main() {
  console.log('Starting ranking monitor...');

  const token = await getGSCToken();

  // This week: 3-9 days ago (GSC has 2-3 day lag)
  const thisWeek = getDateRange(3, 7);
  const lastWeek = getDateRange(10, 7);

  console.log('This week: ' + thisWeek.start + ' to ' + thisWeek.end);
  console.log('Last week: ' + lastWeek.start + ' to ' + lastWeek.end);

  const [tw, lw] = await Promise.all([
    queryGSC(token, thisWeek.start, thisWeek.end),
    queryGSC(token, lastWeek.start, lastWeek.end)
  ]);

  if (tw.error) throw new Error('GSC error: ' + JSON.stringify(tw.error));

  const lwMap = {};
  (lw.rows || []).forEach(r => { lwMap[r.keys[0]] = r; });

  const allRows = (tw.rows || []).filter(r => !isBrand(r.keys[0])).map(r => {
    const kw = r.keys[0];
    const lwRow = lwMap[kw];
    return {
      kw,
      pos: r.position,
      clicks: r.clicks,
      impr: r.impressions,
      lwPos: lwRow ? lwRow.position : null,
      lwClicks: lwRow ? lwRow.clicks : 0,
      isNew: !lwRow
    };
  });

  // Separate priority keywords from all others
  const priorityRows = allRows.filter(r => PRIORITY_KEYWORDS.includes(r.kw));
  const allNonBrand = allRows.sort((a, b) => b.impr - a.impr);

  // Winners: improved 2+ positions
  const winners = allNonBrand.filter(r => r.lwPos && r.lwPos - r.pos >= 2).sort((a, b) => (b.lwPos - b.pos) - (a.lwPos - a.pos)).slice(0, 5);

  // Losers: dropped 2+ positions with meaningful impressions
  const losers = allNonBrand.filter(r => r.lwPos && r.pos - r.lwPos >= 2 && r.impr >= 20).sort((a, b) => (b.pos - b.lwPos) - (a.pos - a.lwPos)).slice(0, 5);

  // New keywords appearing
  const newKws = allNonBrand.filter(r => r.isNew && r.impr >= 10).slice(0, 5);

  // Page 1 count (positions 1-10)
  const page1 = allNonBrand.filter(r => r.pos <= 10).length;
  const top3 = allNonBrand.filter(r => r.pos <= 3).length;

  // Total clicks/impressions
  const totalClicks = (tw.rows || []).reduce((s, r) => s + r.clicks, 0);
  const totalImpr = (tw.rows || []).reduce((s, r) => s + r.impressions, 0);
  const lwClicks = (lw.rows || []).reduce((s, r) => s + r.clicks, 0);
  const clickDiff = totalClicks - lwClicks;
  const clickPct = lwClicks > 0 ? ((clickDiff / lwClicks) * 100).toFixed(0) : '?';

  // Build report
  let msg = `📊 <b>Bartact SEO Rankings — ${thisWeek.start} to ${thisWeek.end}</b>\n\n`;

  msg += `<b>Overall</b>\n`;
  msg += `Clicks: ${totalClicks} (${clickDiff >= 0 ? '+' : ''}${clickDiff}, ${clickDiff >= 0 ? '▲' : '▼'}${Math.abs(clickPct)}% WoW)\n`;
  msg += `Impressions: ${totalImpr}\n`;
  msg += `Page 1 keywords: ${page1} | Top 3: ${top3}\n\n`;

  msg += `<b>Priority Keywords</b>\n`;
  for (const r of PRIORITY_KEYWORDS) {
    const row = allRows.find(x => x.kw === r);
    if (row) {
      const pos = row.pos.toFixed(1);
      const vs = row.lwPos ? (row.pos < row.lwPos ? `▲${(row.lwPos - row.pos).toFixed(1)}` : row.pos > row.lwPos ? `▼${(row.pos - row.lwPos).toFixed(1)}` : '→') : 'new';
      const flag = row.pos <= 3 ? '🟢' : row.pos <= 10 ? '🟡' : '🔴';
      msg += `${flag} #${pos} ${vs} — ${r}\n`;
    } else {
      msg += `⚫ not ranking — ${r}\n`;
    }
  }

  if (winners.length > 0) {
    msg += `\n<b>📈 Biggest Movers Up</b>\n`;
    winners.forEach(r => {
      msg += `▲${(r.lwPos - r.pos).toFixed(1)} — ${r.kw} (#${r.lwPos.toFixed(1)} → #${r.pos.toFixed(1)})\n`;
    });
  }

  if (losers.length > 0) {
    msg += `\n<b>📉 Biggest Drops (need fixing)</b>\n`;
    losers.forEach(r => {
      msg += `▼${(r.pos - r.lwPos).toFixed(1)} — ${r.kw} (#${r.lwPos.toFixed(1)} → #${r.pos.toFixed(1)}) ${r.impr} impr\n`;
    });
  }

  if (newKws.length > 0) {
    msg += `\n<b>✨ New Keywords Appearing</b>\n`;
    newKws.forEach(r => { msg += `#${r.pos.toFixed(1)} — ${r.kw} (${r.impr} impr)\n`; });
  }

  // Save state for trend tracking
  const stateFile = '/home/ubuntu/.openclaw/workspace/memory/bartact-ranking-state.json';
  const state = { lastRun: new Date().toISOString(), thisWeek, lastWeek, page1Count: page1, top3Count: top3, totalClicks, totalImpr };
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

  console.log(msg.replace(/<[^>]+>/g, ''));
  await sendTelegram(msg);
  console.log('Report sent to Telegram ✅');

  // Auto-identify failing priority keywords and log them
  const failing = PRIORITY_KEYWORDS.filter(kw => {
    const row = allRows.find(x => x.kw === kw);
    return !row || row.pos > 10;
  });

  if (failing.length > 0) {
    console.log('\nFAILING PRIORITY KEYWORDS (not on page 1):');
    failing.forEach(kw => console.log('  - ' + kw));

    // Save to a fix queue file for the agent to act on
    fs.writeFileSync('/home/ubuntu/.openclaw/workspace/memory/bartact-seo-fix-queue.json',
      JSON.stringify({ date: new Date().toISOString(), failingKeywords: failing }, null, 2));
    console.log('Fix queue saved to memory/bartact-seo-fix-queue.json');
  }
}

main().catch(e => {
  console.error('ERR:', e.message);
  process.exit(1);
});
