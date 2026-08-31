#!/usr/bin/env node
/**
 * Bartact Daily Sales + SEO Rankings Report
 * Pulls yesterday's Shopify orders + GSC keyword rankings,
 * sends combined Telegram summary to Slashdaddy AND Bartact.
 * PST = UTC-7 in summer: midnight PST = T07:00:00Z
 */
const https = require('https');
const fs = require('fs');

const env = {};
fs.readFileSync('/home/ubuntu/.openclaw/workspace/.env', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SHOPIFY_TOKEN = env.SHOPIFY_TOKEN_BARTACT;
if (!SHOPIFY_TOKEN) throw new Error('SHOPIFY_TOKEN_BARTACT not set in .env');

const openclaw = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/openclaw.json', 'utf8'));
const TG_TOKEN_SLASHDADDY = openclaw.channels?.telegram?.accounts?.slashdaddy?.botToken;
const TG_TOKEN_BARTACT = openclaw.channels?.telegram?.accounts?.bartact?.botToken;
const TG_CHAT = '7550065844'; // Mitch

// ─── HTTP helpers ───────────────────────────────────────────────────────────

function shopifyGet(path) {
  return new Promise((res, rej) => {
    const req = https.request({
      hostname: 'bartact.myshopify.com', path,
      headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN }
    }, r => {
      let b = ''; r.on('data', d => b += d);
      r.on('end', () => res({ status: r.statusCode, body: JSON.parse(b), link: r.headers['link'] || '' }));
    });
    req.on('error', rej); req.end();
  });
}

async function fetchJson(url, opts = {}) {
  return new Promise((res, rej) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: opts.method || 'GET',
      headers: opts.headers || {}
    };
    const req = https.request(options, r => {
      let b = ''; r.on('data', d => b += d);
      r.on('end', () => { try { res(JSON.parse(b)); } catch(e) { res({ _raw: b }); } });
    });
    req.on('error', rej);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

function sendTelegramVia(botToken, msg) {
  const body = JSON.stringify({ chat_id: TG_CHAT, text: msg, parse_mode: 'HTML' });
  const buf = Buffer.from(body);
  return new Promise((res, rej) => {
    const req = https.request({
      hostname: 'api.telegram.org',
      path: '/bot' + botToken + '/sendMessage',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': buf.length }
    }, r => { let b = ''; r.on('data', d => b += d); r.on('end', () => res(r.statusCode)); });
    req.on('error', rej); req.write(buf); req.end();
  });
}

async function sendTelegram(msg) {
  // Send via both bots — Slashdaddy receives for analysis, Bartact delivers to Mitch
  await Promise.allSettled([
    sendTelegramVia(TG_TOKEN_SLASHDADDY, msg),
    sendTelegramVia(TG_TOKEN_BARTACT, msg)
  ]);
}

// ─── Shopify channel detection ───────────────────────────────────────────────

function getChannel(order) {
  const src = (order.source_name || '').toLowerCase();
  const ref = (order.referring_site || '').toLowerCase();
  const land = (order.landing_site || '').toLowerCase();
  const utm = order.utm_parameters || {};
  const utmSrc = (utm.utm_source || '').toLowerCase();
  const utmMed = (utm.utm_medium || '').toLowerCase();
  const notes = order.note_attributes || [];
  const hasGclid = notes.some(n => n.name === 'gclid' && n.value) || land.includes('gclid=');

  if (hasGclid) return 'Google Ads';
  if (utmSrc === 'google' && utmMed === 'cpc') return 'Google Ads';
  if (utmSrc === 'bing' || utmSrc === 'microsoft') return 'Microsoft Ads';
  if (utmMed === 'cpc' || utmMed === 'ppc') return 'Paid Search (other)';
  if (ref.includes('google.') || utmSrc === 'google') return 'Google Organic';
  if (ref.includes('bing.com') || ref.includes('duckduckgo.com')) return 'Bing/DDG Organic';
  if (ref.includes('bartact.com')) return 'Internal Referral';
  if (ref.includes('facebook.com') || ref.includes('l.facebook.com') || land.includes('fbclid=') || utmSrc === 'facebook') return 'Meta (Facebook/Instagram)';
  if (ref.includes('instagram.com') || utmSrc === 'instagram') return 'Instagram';
  if (ref.includes('tiktok.com') || utmSrc === 'tiktok') return 'TikTok';
  if (ref.includes('pinterest.com') || utmSrc === 'pinterest') return 'Pinterest';
  if (ref.includes('twitter.com') || ref.includes('//t.co/') || utmSrc === 'twitter' || utmSrc === 'x') return 'X (Twitter)';
  if (ref.includes('youtube.com') || utmSrc === 'youtube') return 'YouTube';
  if (ref.includes('reddit.com') || utmSrc === 'reddit') return 'Reddit';
  if (ref.includes('simplycodes') || ref.includes('coupon') || ref.includes('honey')) return 'Coupon/Affiliate';
  if (/^\d+$/.test(src)) return 'Shopify Internal / Manual';
  if (src === 'pos') return 'POS';
  if (ref && !ref.includes('bartact')) return 'Referral (' + (ref.replace(/https?:\/\//,'').split('/')[0]).slice(0, 25) + ')';
  return 'Direct / Unknown';
}

async function getAllOrders(minDate, maxDate) {
  const orders = [];
  let path = `/admin/api/2024-01/orders.json?status=any&created_at_min=${minDate}&created_at_max=${maxDate}&limit=250&fields=id,created_at,total_price,financial_status,referring_site,source_name,utm_parameters,line_items,landing_site,note_attributes`;
  while (path) {
    const r = await shopifyGet(path);
    orders.push(...(r.body.orders || []));
    const next = r.link.match(/<([^>]+)>; rel="next"/);
    path = next ? next[1].replace('https://bartact.myshopify.com', '') : null;
  }
  return orders;
}

// ─── Google Ads ROAS ─────────────────────────────────────────────────────────

async function getGoogleAdsRoas(oauthToken, dateStr) {
  const creds = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json','utf8'));
  // Refresh token fresh — don't reuse GSC token
  const refreshed = await fetchJson('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      refresh_token: creds.refresh_token,
      grant_type: 'refresh_token'
    }).toString()
  });
  const adsToken = refreshed.access_token;
  if (!adsToken) throw new Error('Google Ads token refresh failed: ' + JSON.stringify(refreshed));

  const CID = '1770651698'; // Confirmed correct customer ID
  const body = JSON.stringify({ query: `
    SELECT
      campaign.name,
      campaign.status,
      metrics.cost_micros,
      metrics.conversions_value,
      metrics.conversions
    FROM campaign
    WHERE segments.date = '${dateStr}'
      AND metrics.cost_micros > 0
    ORDER BY metrics.cost_micros DESC
  `});
  const data = await fetchJson(`https://googleads.googleapis.com/v25/customers/${CID}/googleAds:search`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + adsToken,
      'developer-token': creds.developer_token || creds.dev_token,
      'Content-Type': 'application/json'
      // NO login-customer-id header — causes CUSTOMER_NOT_FOUND for this account
    },
    body
  });
  return data.results || [];
}

// ─── GSC Rankings ────────────────────────────────────────────────────────────

async function getGscToken() {
  const { createSign } = require('crypto');
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
  const data = await fetchJson('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt
  });
  if (!data.access_token) throw new Error('GSC SA token failed: ' + JSON.stringify(data));
  return data.access_token;
}

async function gscQuery(token, startDate, endDate) {
  return fetchJson(
    'https://searchconsole.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fwww.bartact.com%2F/searchAnalytics/query',
    {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate, dimensions: ['query'], rowLimit: 5000, orderBy: [{ fieldName: 'impressions', sortOrder: 'DESCENDING' }] })
    }
  );
}

async function buildRankingsMessage(token) {
  // Current period: last 28 days (GSC has 3-day lag)
  const now = new Date();
  const lagDate = new Date(now); lagDate.setUTCDate(lagDate.getUTCDate() - 3);
  const startCurr = new Date(lagDate); startCurr.setUTCDate(startCurr.getUTCDate() - 28);
  const endCurr = lagDate.toISOString().slice(0,10);
  const startCurrStr = startCurr.toISOString().slice(0,10);

  // Prior period: 28 days before that
  const startPrev = new Date(startCurr); startPrev.setUTCDate(startPrev.getUTCDate() - 28);
  const endPrev = new Date(startCurr); endPrev.setUTCDate(endPrev.getUTCDate() - 1);

  const [curr, prev] = await Promise.all([
    gscQuery(token, startCurrStr, endCurr),
    gscQuery(token, startPrev.toISOString().slice(0,10), endPrev.toISOString().slice(0,10))
  ]);

  if (curr.error) return `⚠️ GSC error: ${curr.error.message}`;

  const currMap = {};
  for (const r of (curr.rows || [])) currMap[r.keys[0].replace(/^"|"$/g, '')] = r;
  const prevMap = {};
  for (const r of (prev.rows || [])) prevMap[r.keys[0].replace(/^"|"$/g, '')] = r;

  // All priority keywords by category
  const targets = [
    // 🪑 SEAT COVERS — highest volume
    { kw: 'jeep seat covers', label: '🪑 jeep seat covers' },
    { kw: 'jeep wrangler seat covers', label: '🪑 jeep wrangler seat covers' },
    { kw: 'bronco seat covers', label: '🪑 bronco seat covers' },
    { kw: 'jeep gladiator seat covers', label: '🪑 jeep gladiator seat covers' },
    { kw: 'jeep tj seat covers', label: '🪑 jeep tj seat covers' },
    { kw: 'jeep wrangler jl seat covers', label: '🪑 jeep wrangler jl seat covers' },
    { kw: 'jeep wrangler jk seat covers', label: '🪑 jeep wrangler jk seat covers' },
    { kw: 'best seat covers for jeep gladiator', label: '🪑 best seat covers gladiator' },
    { kw: 'best seat covers for jeep wrangler jl', label: '🪑 best seat covers JL' },
    { kw: '5th gen 4runner seat covers', label: '🪑 5th gen 4runner seat covers' },
    // 🤜 GRAB HANDLES
    { kw: 'jeep grab handles', label: '🤜 jeep grab handles' },
    { kw: 'jeep wrangler grab handles', label: '🤜 jeep wrangler grab handles' },
    { kw: 'paracord grab handles', label: '🤜 paracord grab handles' },
    { kw: 'jeep paracord grab handles', label: '🤜 jeep paracord grab handles' },
    { kw: 'bronco grab handles', label: '🤜 bronco grab handles' },
    { kw: 'jeep gladiator grab handles', label: '🤜 gladiator grab handles' },
    { kw: 'jeep tj grab handles', label: '🤜 jeep tj grab handles' },
    { kw: 'jeep jl grab handles', label: '🤜 jeep jl grab handles' },
    { kw: 'jeep jk grab handles', label: '🤜 jeep jk grab handles' },
    // 🪢 MOLLE
    { kw: 'molle attachments', label: '🪢 molle attachments' },
    { kw: 'molle panel accessories', label: '🪢 molle panel accessories' },
    { kw: 'molle accessories', label: '🪢 molle accessories' },
    { kw: 'molle clips', label: '🪢 molle clips' },
    { kw: 'molle bags', label: '🪢 molle bags' },
    // 🚗 BRONCO
    { kw: 'bronco accessories', label: '🚗 bronco accessories' },
    { kw: 'ford bronco accessories', label: '🚗 ford bronco accessories' },
    { kw: 'bronco door storage', label: '🚗 bronco door storage' },
    { kw: 'bronco door bags', label: '🚗 bronco door bags' },
    // 🧯 FIRE EXT
    { kw: 'jeep fire extinguisher', label: '🧯 jeep fire extinguisher' },
    { kw: 'fire extinguisher mount car', label: '🧯 fire ext mount car' },
    // 🌂 WINCH / MISC
    { kw: 'winch cover', label: '🌂 winch cover' },
    { kw: 'winch covers', label: '🌂 winch covers' },
    { kw: 'paracord keychain', label: '🔑 paracord keychain' },
  ];

  let msg = `\n📈 <b>GSC Rankings (${startCurrStr} → ${endCurr})</b>\n`;
  msg += `<i>vs prior 14-day period — GSC has ~3-day lag</i>\n\n`;

  for (const { kw, label } of targets) {
    const c = currMap[kw.toLowerCase()];
    const p = prevMap[kw.toLowerCase()];
    if (!c) { msg += `  ⚪ ${label} — no data yet\n`; continue; }
    const pos = c.position.toFixed(1);
    let dot, arrow;
    if (p) {
      const delta = p.position - c.position;
      if (delta > 0.5) { dot = '🟢'; arrow = `↑${delta.toFixed(1)}`; }
      else if (delta < -0.5) { dot = '🔴'; arrow = `↓${Math.abs(delta).toFixed(1)}`; }
      else { dot = '🟡'; arrow = '~'; }
    } else {
      dot = '🔵'; arrow = 'baseline';
    }
    msg += `  ${dot} ${label} — #${pos} ${arrow} | ${c.impressions}impr ${c.clicks}clk\n`;
  }

  // Top 10 by impressions outside the target list
  const targetKws = new Set(targets.map(t => t.kw));
  const top10 = (curr.rows || [])
    .filter(r => !targetKws.has(r.keys[0]))
    .sort((a,b) => b.impressions - a.impressions)
    .slice(0, 10);

  if (top10.length) {
    msg += `\n<b>Top other keywords (by impressions):</b>\n`;
    for (const r of top10) {
      const p = prevMap[r.keys[0]];
      const delta = p ? (p.position - r.position) : null;
      let dot2, arrow2;
      if (delta === null) { dot2 = '🆕'; arrow2 = 'new'; }
      else if (delta > 0.5) { dot2 = '🟢'; arrow2 = `↑${delta.toFixed(1)}`; }
      else if (delta < -0.5) { dot2 = '🔴'; arrow2 = `↓${Math.abs(delta).toFixed(1)}`; }
      else { dot2 = '🟡'; arrow2 = '~'; }
      msg += `  ${dot2} ${r.keys[0]} — #${r.position.toFixed(1)} ${arrow2} | ${r.impressions}impr\n`;
    }
  }

  return msg;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const now = new Date();
  // Always use America/Los_Angeles — handles PST/PDT automatically
  const todayPST = now.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' }); // YYYY-MM-DD
  const ystDate = new Date(now); ystDate.setDate(ystDate.getDate() - 1);
  const ystStr  = ystDate.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });

  // PST/PDT midnight in UTC: use Intl to find offset dynamically
  function pstMidnightUTC(dateStr) {
    // Find what UTC time = midnight in LA on that date
    const probe = new Date(dateStr + 'T12:00:00Z');
    const laString = probe.toLocaleString('en-US', { timeZone: 'America/Los_Angeles', hour12: false });
    const laDate = new Date(laString + ' UTC');
    const offsetMs = probe.getTime() - laDate.getTime();
    return new Date(new Date(dateStr + 'T00:00:00Z').getTime() + offsetMs).toISOString();
  }

  const minDate = pstMidnightUTC(ystStr);
  const maxDate = pstMidnightUTC(todayPST);

  const dateLabel = new Date(ystStr + 'T12:00:00Z').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles'
  });

  console.log(`Pulling orders ${minDate} → ${maxDate}`);
  const [orders, gscToken] = await Promise.all([
    getAllOrders(minDate, maxDate),
    getGscToken()
  ]);
  const adsRows = await getGoogleAdsRoas(gscToken, ystStr).catch(() => []);

  // Shopify-verified Google Ads revenue (gclid-attributed orders only)
  const shopifyGoogleRev = orders
    .filter(o => !['voided','refunded'].includes(o.financial_status))
    .reduce((s, o) => getChannel(o) === 'Google Ads' ? s + parseFloat(o.total_price || 0) : s, 0);

  const paid = orders.filter(o => !['voided', 'refunded'].includes(o.financial_status));
  console.log(`Orders: ${orders.length} total, ${paid.length} paid`);

  // ── Sales message ──
  let salesMsg = `📊 <b>Bartact Daily — ${dateLabel}</b>\n`;

  if (paid.length === 0) {
    salesMsg += `\n<b>No paid orders found.</b>\n`;
  } else {
    const byChannel = {};
    for (const o of paid) {
      const ch = getChannel(o);
      if (!byChannel[ch]) byChannel[ch] = { count: 0, revenue: 0 };
      byChannel[ch].count++;
      byChannel[ch].revenue += parseFloat(o.total_price || 0);
    }

    const byProduct = {};
    for (const o of paid) {
      for (const item of (o.line_items || [])) {
        const name = item.title || 'Unknown';
        if (!byProduct[name]) byProduct[name] = { qty: 0, revenue: 0 };
        byProduct[name].qty += item.quantity || 0;
        byProduct[name].revenue += parseFloat(item.price || 0) * (item.quantity || 0);
      }
    }

    const totalRevenue = paid.reduce((s, o) => s + parseFloat(o.total_price || 0), 0);
    const aov = totalRevenue / paid.length;
    const sortedChannels = Object.entries(byChannel).sort((a, b) => b[1].revenue - a[1].revenue);
    const topProducts = Object.entries(byProduct).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);

    salesMsg += `<b>$${totalRevenue.toFixed(0)} | ${paid.length} orders | $${aov.toFixed(0)} AOV</b>\n\n`;
    salesMsg += `<b>By Channel:</b>\n`;
    for (const [ch, data] of sortedChannels) {
      const pct = Math.round((data.revenue / totalRevenue) * 100);
      salesMsg += `  ${ch}: $${data.revenue.toFixed(0)} (${pct}%) — ${data.count} orders\n`;
    }
    salesMsg += `\n<b>Top Products:</b>\n`;
    for (const [name, data] of topProducts) {
      const n = name.length > 38 ? name.slice(0, 36) + '…' : name;
      salesMsg += `  ${n}: $${data.revenue.toFixed(0)} (${data.qty} units)\n`;
    }

    const flags = [];
    if (aov < 100) flags.push('⚠️ AOV below $100');
    if (paid.length < 5) flags.push('⚠️ Very low order count');
    if (!byChannel['Google Ads']) flags.push('⚠️ No Google Ads orders');
    if (flags.length) salesMsg += '\n' + flags.join('\n');
  }

  // ── Google Ads ROAS section ──
  if (adsRows.length > 0) {
    const totalSpend = adsRows.reduce((s,r) => s + (r.metrics.costMicros||0)/1e6, 0);
    const googleTrackedRev = adsRows.reduce((s,r) => s + (r.metrics.conversionsValue||0), 0);
    const trueRoas = totalSpend > 0 ? shopifyGoogleRev/totalSpend : 0;
    const roasIcon = trueRoas >= 4 ? '🟢' : trueRoas >= 2 ? '🟡' : '🔴';
    salesMsg += `\n📢 <b>Google Ads (${dateLabel})</b>\n`;
    salesMsg += `${roasIcon} <b>$${totalSpend.toFixed(0)} spend → $${shopifyGoogleRev.toFixed(0)} Shopify rev = ${trueRoas.toFixed(2)}x TRUE ROAS</b>\n`;
    // Pixel health check
    if (totalSpend > 10 && googleTrackedRev < shopifyGoogleRev * 0.7) {
      const capturePct = shopifyGoogleRev > 0 ? Math.round((googleTrackedRev/shopifyGoogleRev)*100) : 0;
      salesMsg += `  ⚠️ Pixel gap: Google tracking $${googleTrackedRev.toFixed(0)} vs Shopify $${shopifyGoogleRev.toFixed(0)} (${capturePct}% capture) — conversion pixel may be broken\n`;
    }
    salesMsg += `<i>Spend by campaign (Google-tracked rev in parens):</i>\n`;
    for (const r of adsRows) {
      const spend = (r.metrics.costMicros||0)/1e6;
      if (spend < 1) continue;
      const gRev = r.metrics.conversionsValue||0;
      const name = r.campaign.name.length > 32 ? r.campaign.name.slice(0,30)+'…' : r.campaign.name;
      salesMsg += `  • ${name}: $${spend.toFixed(0)} spend ($${gRev.toFixed(0)} G-tracked)\n`;
    }
  }

  // ── Rankings message (appended) ──
  let rankingsMsg = '';
  try {
    rankingsMsg = await buildRankingsMessage(gscToken);
  } catch(e) {
    rankingsMsg = `\n⚠️ Rankings fetch failed: ${e.message}`;
  }

  // Send sales + rankings as one combined message
  const fullMsg = salesMsg + rankingsMsg;
  console.log(fullMsg);
  await sendTelegram(fullMsg);
  console.log('Done.');
}

main().catch(async e => {
  console.error('FATAL:', e.message);
  try { await sendTelegram('❌ <b>Bartact Daily Report failed</b>\n' + e.message.slice(0, 200)); } catch (_) {}
  process.exit(1);
});
