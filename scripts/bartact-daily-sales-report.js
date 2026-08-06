#!/usr/bin/env node
/**
 * Bartact Daily Sales Report
 * Pulls yesterday's Shopify orders, breaks down by channel,
 * computes revenue/AOV/top products, sends Telegram summary.
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
const TG_TOKEN = openclaw.channels?.telegram?.accounts?.bartact?.botToken;
const TG_CHAT = '7550065844';

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

function sendTelegram(msg) {
  const body = JSON.stringify({ chat_id: TG_CHAT, text: msg, parse_mode: 'HTML' });
  const buf = Buffer.from(body);
  return new Promise((res, rej) => {
    const req = https.request({
      hostname: 'api.telegram.org',
      path: '/bot' + TG_TOKEN + '/sendMessage',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': buf.length }
    }, r => { let b = ''; r.on('data', d => b += d); r.on('end', () => res(r.statusCode)); });
    req.on('error', rej); req.write(buf); req.end();
  });
}

function getChannel(order) {
  const src = (order.source_name || '').toLowerCase();
  const ref = (order.referring_site || '').toLowerCase();
  const land = (order.landing_site || '').toLowerCase();
  const utm = order.utm_parameters || {};
  const utmSrc = (utm.utm_source || '').toLowerCase();
  const utmMed = (utm.utm_medium || '').toLowerCase();
  // Check note_attributes for gclid (most reliable Google Ads signal)
  const notes = order.note_attributes || [];
  const hasGclid = notes.some(n => n.name === 'gclid' && n.value) || land.includes('gclid=');

  if (hasGclid) return 'Google Ads';
  if (utmSrc === 'google' && utmMed === 'cpc') return 'Google Ads';
  if (utmSrc === 'bing' || utmSrc === 'microsoft') return 'Microsoft Ads';
  if (utmMed === 'cpc' || utmMed === 'ppc') return 'Paid Search (other)';
  if (ref.includes('google.') || utmSrc === 'google') return 'Google Organic';
  if (ref.includes('bing.com') || ref.includes('duckduckgo.com')) return 'Bing/DDG Organic';
  if (ref.includes('bartact.com')) return 'Internal Referral';
  if (ref.includes('facebook.com') || ref.includes('l.facebook.com') || ref.includes('lm.facebook.com') || land.includes('fbclid=') || utmSrc === 'facebook' || utmSrc === 'fb') return 'Meta (Facebook/Instagram)';
  if (ref.includes('instagram.com') || utmSrc === 'instagram') return 'Instagram';
  if (ref.includes('tiktok.com') || utmSrc === 'tiktok') return 'TikTok';
  if (ref.includes('pinterest.com') || utmSrc === 'pinterest') return 'Pinterest';
  if (ref.includes('twitter.com') || ref.includes('//t.co/') || utmSrc === 'twitter' || utmSrc === 'x') return 'X (Twitter)';
  if (ref.includes('youtube.com') || utmSrc === 'youtube') return 'YouTube';
  if (ref.includes('reddit.com') || utmSrc === 'reddit') return 'Reddit';
  if (ref.includes('snapchat.com') || utmSrc === 'snapchat') return 'Snapchat';
  if (ref.includes('simplycodes') || ref.includes('coupon') || ref.includes('honey') || ref.includes('dealnews')) return 'Coupon/Affiliate';
  if (/^\d+$/.test(src)) return 'Shopify Internal / Manual';
  if (src === 'pos') return 'POS';
  if (src === 'shopify_draft_order') return 'Draft Order';
  if (ref && !ref.includes('bartact')) return 'Referral (' + (ref.replace(/https?:\/\//,'').split('/')[0]).slice(0, 25) + ')';
  return 'Direct / Unknown';
}

async function main() {
  const now = new Date();
  const ystDay = new Date(now);
  ystDay.setUTCDate(ystDay.getUTCDate() - 1);
  const ystStr = ystDay.toISOString().slice(0, 10);
  const todayStr = now.toISOString().slice(0, 10);

  const minDate = ystStr + 'T07:00:00Z';
  const maxDate = todayStr + 'T07:00:00Z';

  console.log(`Pulling orders ${minDate} → ${maxDate}`);
  const orders = await getAllOrders(minDate, maxDate);
  const paid = orders.filter(o => !['voided', 'refunded'].includes(o.financial_status));
  console.log(`Orders: ${orders.length} total, ${paid.length} paid`);

  const dateLabel = new Date(ystStr + 'T12:00:00Z').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles'
  });

  if (paid.length === 0) {
    await sendTelegram(`📊 <b>Bartact Sales — ${dateLabel}</b>\n\nNo paid orders found.`);
    return;
  }

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

  let msg = `📊 <b>Bartact Sales — ${dateLabel}</b>\n`;
  msg += `<b>$${totalRevenue.toFixed(0)} | ${paid.length} orders | $${aov.toFixed(0)} AOV</b>\n\n`;

  msg += `<b>By Channel:</b>\n`;
  for (const [ch, data] of sortedChannels) {
    const pct = Math.round((data.revenue / totalRevenue) * 100);
    msg += `  ${ch}: $${data.revenue.toFixed(0)} (${pct}%) — ${data.count} orders\n`;
  }

  msg += `\n<b>Top Products:</b>\n`;
  for (const [name, data] of topProducts) {
    const n = name.length > 38 ? name.slice(0, 36) + '…' : name;
    msg += `  ${n}: $${data.revenue.toFixed(0)} (${data.qty} units)\n`;
  }

  const flags = [];
  if (aov < 100) flags.push('⚠️ AOV below $100');
  if (paid.length < 5) flags.push('⚠️ Very low order count');
  if (!byChannel['Google Ads']) flags.push('⚠️ No Google Ads orders (gclid not capturing yet)');
  if (flags.length) msg += '\n' + flags.join('\n');

  console.log(msg);
  await sendTelegram(msg);
  console.log('Done.');
}

main().catch(async e => {
  console.error('FATAL:', e.message);
  try { await sendTelegram('❌ <b>Bartact Daily Sales failed</b>\n' + e.message.slice(0, 200)); } catch (_) {}
  process.exit(1);
});
