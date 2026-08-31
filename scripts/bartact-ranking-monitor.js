#!/usr/bin/env node
// Bartact Daily Ranking Monitor
// Pulls GSC data, compares week-over-week, identifies winners/losers, reports to Telegram

const fs = require('fs');
const https = require('https');
const { createSign } = require('crypto');

function getEnv() {
  const env = {};
  fs.readFileSync('/home/ubuntu/.openclaw/workspace/.env','utf8').split('\n').forEach(l=>{const[k,...v]=l.split('=');if(k&&v.length)env[k.trim()]=v.join('=').trim();});
  return env;
}
const ENV = getEnv();
const SHOPIFY_TOKEN = ENV.SHOPIFY_TOKEN_BARTACT;
const SHOPIFY_SHOP = 'bartact.myshopify.com';

function shopifyGet(path) {
  return new Promise((res, rej) => {
    const req = https.request({
      hostname: SHOPIFY_SHOP, path, method: 'GET',
      headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN, 'Content-Type': 'application/json' },
      timeout: 15000
    }, r => { let b = ''; r.on('data', d => b += d); r.on('end', () => { try { res({ s: r.statusCode, b: JSON.parse(b) }); } catch(e) { res({ s: r.statusCode, b }); } }); });
    req.on('error', rej); req.end();
  });
}

// Known Shopify source_name codes
const SOURCE_LABELS = {
  'web': 'Organic/Direct',
  'online_store': 'Organic/Direct',
  'google': 'Google Shopping',
  'facebook': 'Facebook/Meta',
  'instagram': 'Instagram',
  'shopify_draft_order': 'Draft Order',
  'pos': 'Point of Sale',
  'iphone': 'Shopify Mobile',
  'android': 'Shopify Mobile',
  '3890849': 'Shop Pay / Shop App',
  '2329312': 'Facebook/Instagram Channel',
  '580111': 'Google Shopping Channel',
};

function classifyOrders(orders) {
  const channels = {};
  let totalRevenue = 0;
  orders.forEach(order => {
    const src = order.source_name || 'unknown';
    let channel = SOURCE_LABELS[src] || ('Channel: ' + src);
    // Google Ads overrides everything — gclid = paid click
    const noteAttrs = order.note_attributes || [];
    const hasGclid = noteAttrs.some(a => a.name === 'gclid' && a.value);
    if (hasGclid || (order.landing_site || '').includes('gclid=')) channel = 'Google Ads';
    const total = parseFloat(order.total_price || 0);
    if (!channels[channel]) channels[channel] = { orders: 0, revenue: 0 };
    channels[channel].orders++;
    channels[channel].revenue += total;
    totalRevenue += total;
  });
  return { orders: orders.length, revenue: totalRevenue, channels };
}

function getPSTDateString(date) {
  // Always use America/Los_Angeles — handles PST/PDT automatically
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' }); // en-CA = YYYY-MM-DD
}

function getPSTMidnightUTC(dateStr) {
  // Given a PST date string like '2026-08-18', return the UTC ISO string of midnight PST/PDT
  // America/Los_Angeles midnight = find offset dynamically
  const testDate = new Date(dateStr + 'T12:00:00Z'); // noon UTC as proxy
  const pstOffset = -new Date(testDate.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })).getTimezoneOffset?.() || 0;
  // Simpler: just use the known offsets — PDT = UTC-7 (Mar-Nov), PST = UTC-8 (Nov-Mar)
  const month = parseInt(dateStr.split('-')[1]);
  const offsetHours = (month >= 3 && month <= 11) ? 7 : 8;
  return dateStr + `T0${offsetHours}:00:00Z`;
}

async function getSalesData() {
  try {
    const now = new Date();
    const todayPST = getPSTDateString(now);

    // Yesterday PST
    const ystDate = new Date(now);
    ystDate.setDate(ystDate.getDate() - 1);
    const ystPST = getPSTDateString(ystDate);

    const todayStartUTC = getPSTMidnightUTC(todayPST);
    const ystStartUTC   = getPSTMidnightUTC(ystPST);
    // Yesterday end = 1 second before today midnight PST
    const ystEndDate = new Date(todayStartUTC);
    ystEndDate.setSeconds(ystEndDate.getSeconds() - 1);
    const ystEndUTC = ystEndDate.toISOString();

    const [todayR, ystR] = await Promise.all([
      shopifyGet(`/admin/api/2024-01/orders.json?status=any&limit=250&created_at_min=${todayStartUTC}&financial_status=paid`),
      shopifyGet(`/admin/api/2024-01/orders.json?status=any&limit=250&created_at_min=${ystStartUTC}&created_at_max=${ystEndUTC}&financial_status=paid`)
    ]);

    if (todayR.s !== 200 || ystR.s !== 200) return null;

    return {
      today: { date: todayPST, ...classifyOrders(todayR.b.orders || []) },
      yesterday: { date: ystPST, ...classifyOrders(ystR.b.orders || []) }
    };
  } catch(e) {
    console.error('Sales fetch error:', e.message);
    return null;
  }
}

const TELEGRAM_TOKEN = ENV.TELEGRAM_TOKEN;
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

  // Sales by channel — yesterday full day + today so far
  const sales = await getSalesData();
  if (sales) {
    const { today, yesterday } = sales;

    msg += `\n<b>💰 Yesterday — ${yesterday.date} (full day)</b>\n`;
    Object.entries(yesterday.channels).sort((a,b) => b[1].revenue - a[1].revenue).forEach(([ch, data]) => {
      const pct = yesterday.revenue > 0 ? ((data.revenue / yesterday.revenue)*100).toFixed(0) : 0;
      msg += `  ${ch}: ${data.orders} orders / $${data.revenue.toFixed(2)} (${pct}%)\n`;
    });
    msg += `  <b>Total: ${yesterday.orders} orders / $${yesterday.revenue.toFixed(2)}</b>\n`;

    msg += `\n<b>💰 Today — ${today.date} (so far)</b>\n`;
    Object.entries(today.channels).sort((a,b) => b[1].revenue - a[1].revenue).forEach(([ch, data]) => {
      const pct = today.revenue > 0 ? ((data.revenue / today.revenue)*100).toFixed(0) : 0;
      msg += `  ${ch}: ${data.orders} orders / $${data.revenue.toFixed(2)} (${pct}%)\n`;
    });
    msg += `  <b>Total: ${today.orders} orders / $${today.revenue.toFixed(2)}</b>\n`;
  } else {
    msg += `\n<b>💰 Sales</b>: unavailable (Shopify error)\n`;
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
