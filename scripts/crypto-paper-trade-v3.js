const https = require('https');
const fs = require('fs');

const PAPER_FILE = '/home/ubuntu/.openclaw/workspace/memory/paper-trading-v3.json';
const WATCHLIST_FILE = '/home/ubuntu/.openclaw/workspace/memory/momentum-watchlist.json';

// === v3 TUNING — lessons from v2 ===
// v2 problems: 38% win rate, overtrading (7/day), 15% stops on 30% swings, buying tops
// v3 fixes: max 2 entries/day, wider ATR-aware stops, pullback entries, BTC benchmark
const MAX_POSITIONS_PER_TIER = 3;        // Down from 5 — fewer, higher conviction
const MAX_ENTRIES_PER_DAY = 2;           // Hard cap — no overtrading
const REENTRY_COOLDOWN_MS = 12 * 3600000; // 12h cooldown (was 4h)
const MIN_SCORE_T1 = 25;                 // Meaningful score from new system
const MIN_SCORE_T2 = 25;
const MIN_LIQ_T2 = 100000;              // $100K min liquidity
const DEAD_POSITION_PCT = -40;           // Bail at -40% (was -85 — way too late)
const MAX_POSITION_SIZE_T1 = 200;        // Bigger bets, fewer trades
const MAX_POSITION_SIZE_T2 = 120;
const MIN_CASH_RESERVE_T1 = 200;         // Keep more dry powder
const MIN_CASH_RESERVE_T2 = 200;
const DEFAULT_STOP_PCT = 25;             // Wider stops for volatile alts (was 15)
const MAX_HOLD_HOURS = 120;              // 5 days (was 72h)
const FEE_PCT = 0.004;                   // 0.4% taker fee

function httpGet(url) {
  return new Promise((resolve) => {
    const u = new URL(url);
    https.get({ hostname: u.hostname, path: u.pathname + u.search, headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { resolve(null); } });
    }).on('error', () => resolve(null)).on('timeout', () => resolve(null));
  });
}
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function load() {
  try { return JSON.parse(fs.readFileSync(PAPER_FILE, 'utf8')); }
  catch(e) { return null; }
}
function save(p) { fs.writeFileSync(PAPER_FILE, JSON.stringify(p, null, 2)); }

function createPortfolio() {
  return {
    version: 3,
    created: new Date().toISOString(),
    portfolios: {
      T1: { name: 'Tier 1 — Pullback/Accumulation', startingCash: 1000, cash: 1000, holdings: {} },
      T2: { name: 'Tier 2 — DEX Breakouts', startingCash: 1000, cash: 1000, holdings: {} }
    },
    exitRules: {
      defaultStopPct: DEFAULT_STOP_PCT,
      takeProfitTiers: [
        { pct: 40, sellPct: 25 },   // Take 25% at +40%
        { pct: 80, sellPct: 25 },   // Take 25% at +80%
        { pct: 150, sellPct: 25 }   // Take 25% at +150%
      ],
      maxHoldHours: MAX_HOLD_HOURS
    },
    btcBenchmark: { startPrice: null, currentPrice: null },
    trades: [],
    dailyEntries: {},  // { "2026-04-26": 2 } — track entries per day
    snapshots: [],
    lastUpdated: new Date().toISOString()
  };
}

function todayKey() { return new Date().toISOString().slice(0, 10); }

function getEntriesToday(p) {
  return p.dailyEntries[todayKey()] || 0;
}

function logTrade(p, trade) {
  trade.time = new Date().toISOString();
  p.trades.push(trade);
  const dir = trade.pnl !== undefined ? (trade.pnl >= 0 ? ' ✅' : ' ❌') : '';
  console.log(`  [${trade.tier}] ${trade.type} ${trade.symbol}: $${trade.amountUSD.toFixed(2)} @ $${trade.price}${dir} — ${trade.reason}`);
}

function buy(p, tier, symbol, amountUSD, price, meta) {
  const port = p.portfolios[tier];
  if (!port || port.cash < amountUSD) return false;

  // Enforce daily entry limit
  const today = todayKey();
  if ((p.dailyEntries[today] || 0) >= MAX_ENTRIES_PER_DAY) {
    console.log(`  SKIP ${symbol}: daily entry limit (${MAX_ENTRIES_PER_DAY}) reached`);
    return false;
  }

  const fee = amountUSD * FEE_PCT;
  const net = amountUSD - fee;
  const qty = net / price;
  port.cash -= amountUSD;

  // Calculate stop based on token volatility
  // If 24h change is high, use wider stop
  const volatility = Math.abs(meta?.change24h || 0);
  let stopPct = DEFAULT_STOP_PCT;
  if (volatility > 30) stopPct = 30;       // Very volatile — wider stop
  else if (volatility < 10) stopPct = 18;  // Low vol — tighter stop

  port.holdings[symbol] = {
    qty, avgCost: price, totalInvested: amountUSD,
    peakPrice: price, enteredAt: new Date().toISOString(),
    entryVolume: meta?.volume || 0, source: meta?.source || 'unknown',
    cgId: meta?.id, address: meta?.address, chain: meta?.chain,
    dex: meta?.dex, pairAddress: meta?.pairAddress,
    stopPct,
    entryPattern: meta?.pattern || 'unknown',
    lastCheckPrice: price
  };

  p.dailyEntries[today] = (p.dailyEntries[today] || 0) + 1;

  logTrade(p, { tier, type: 'BUY', symbol, qty, price, amountUSD, fee,
    reason: meta?.reason || 'v3 entry', pattern: meta?.pattern });
  return true;
}

function sell(p, tier, symbol, pctToSell, price, reason) {
  const port = p.portfolios[tier];
  const h = port?.holdings?.[symbol];
  if (!h || h.qty <= 0) return false;
  const qtyToSell = h.qty * (pctToSell / 100);
  const gross = qtyToSell * price;
  const fee = gross * FEE_PCT;
  const net = gross - fee;
  const costBasis = qtyToSell * h.avgCost;
  const pnl = net - costBasis;
  port.cash += net;
  h.qty -= qtyToSell;
  if (h.qty < 0.000001) { delete port.holdings[symbol]; }
  logTrade(p, { tier, type: 'SELL', symbol, qty: qtyToSell, price, amountUSD: net, fee, pnl, reason });
  return true;
}

async function batchCGPrices(cgIds) {
  if (!cgIds.length) return {};
  const d = await httpGet('https://api.coingecko.com/api/v3/simple/price?ids=' + cgIds.join(',') + '&vs_currencies=usd');
  const out = {};
  if (d) { for (const [id, v] of Object.entries(d)) { if (v?.usd) out[id] = v.usd; } }
  return out;
}

async function getPrice(holding, cgCache) {
  if (holding.source === 'dexscreener' && holding.pairAddress) {
    const d = await httpGet('https://api.dexscreener.com/latest/dex/pairs/' + (holding.chain || 'solana') + '/' + holding.pairAddress);
    return d?.pair?.priceUsd ? parseFloat(d.pair.priceUsd) : null;
  }
  if (holding.cgId) {
    if (cgCache && cgCache[holding.cgId]) return cgCache[holding.cgId];
    const d = await httpGet('https://api.coingecko.com/api/v3/simple/price?ids=' + holding.cgId + '&vs_currencies=usd');
    const k = Object.keys(d || {})[0];
    return d?.[k]?.usd || null;
  }
  return null;
}

function getRecentSells(p, cooldownMs) {
  const cutoff = Date.now() - cooldownMs;
  const recent = new Set();
  for (let i = p.trades.length - 1; i >= 0; i--) {
    const t = p.trades[i];
    if (new Date(t.time).getTime() < cutoff) break;
    if (t.type === 'SELL') recent.add(t.symbol);
  }
  return recent;
}

async function getBtcPrice() {
  const d = await httpGet('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
  return d?.bitcoin?.usd || null;
}

async function checkExits(p) {
  console.log('\n=== EXIT CHECK ===');
  let exitCount = 0;

  const allCgIds = [];
  for (const tier of ['T1', 'T2']) {
    for (const h of Object.values(p.portfolios[tier].holdings)) {
      if (h.source === 'coingecko' && h.cgId) allCgIds.push(h.cgId);
    }
  }
  const cgCache = await batchCGPrices(allCgIds);

  for (const tier of ['T1', 'T2']) {
    const port = p.portfolios[tier];
    for (const [sym, h] of Object.entries(port.holdings)) {
      const price = await getPrice(h, cgCache);
      if (!price) { console.log(`  ${sym}: price unavailable`); continue; }
      await delay(300);

      if (price > (h.peakPrice || 0)) h.peakPrice = price;

      const pnlPct = ((price / h.avgCost) - 1) * 100;
      const dropFromPeak = h.peakPrice > 0 ? ((h.peakPrice - price) / h.peakPrice) * 100 : 0;
      const holdHours = (Date.now() - new Date(h.enteredAt).getTime()) / 3600000;
      const stopPct = h.stopPct || DEFAULT_STOP_PCT;

      // Tighten stop once we're up significantly (lock in gains)
      let effectiveStop = stopPct;
      if (pnlPct > 30) effectiveStop = Math.min(stopPct, 15);  // Up 30%+ → tighten to 15%
      if (pnlPct > 60) effectiveStop = Math.min(stopPct, 12);  // Up 60%+ → tighten to 12%

      h.lastCheckPrice = price;

      // Dead position — bail
      if (pnlPct <= DEAD_POSITION_PCT) {
        sell(p, tier, sym, 100, price, `DEAD: ${pnlPct.toFixed(1)}% — force exit`);
        exitCount++; continue;
      }

      // Trailing stop from peak
      if (dropFromPeak >= effectiveStop) {
        sell(p, tier, sym, 100, price, `STOP: -${dropFromPeak.toFixed(1)}% from peak $${h.peakPrice.toFixed(6)} (stop: ${effectiveStop.toFixed(0)}%)`);
        exitCount++; continue;
      }

      // Take profit tiers
      for (const tp of p.exitRules.takeProfitTiers) {
        const key = 'tp_' + tp.pct;
        if (pnlPct >= tp.pct && !h[key]) {
          h[key] = true;
          sell(p, tier, sym, tp.sellPct, price, `PROFIT: +${pnlPct.toFixed(1)}% (tier ${tp.pct}%)`);
          exitCount++;
        }
      }

      // Max hold — but only exit if not significantly profitable
      if (holdHours > p.exitRules.maxHoldHours && pnlPct < 15) {
        sell(p, tier, sym, 100, price, `MAX HOLD: ${holdHours.toFixed(0)}h, P&L ${pnlPct.toFixed(1)}%`);
        exitCount++; continue;
      }

      console.log(`  ${tier} ${sym}: $${price.toFixed(6)} | P&L: ${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(1)}% | Peak drop: -${dropFromPeak.toFixed(1)}% | Stop: ${effectiveStop}% | Hold: ${holdHours.toFixed(1)}h`);
    }
  }
  if (exitCount === 0) console.log('  No exits triggered.');
  return exitCount;
}

async function scanAndTrade(p) {
  let wl;
  try { wl = JSON.parse(fs.readFileSync(WATCHLIST_FILE, 'utf8')); }
  catch(e) { console.log('No watchlist. Run scanner first.'); return; }

  console.log('\n=== AUTO-TRADE v3 ===');
  const trend = wl.marketTrend?.trend || 'neutral';
  console.log('Market: ' + trend + ' — ' + (wl.marketTrend?.reason || ''));
  console.log('Entries today: ' + getEntriesToday(p) + '/' + MAX_ENTRIES_PER_DAY);

  // Bear market — sell everything
  if (trend === 'bear') {
    console.log('\n🟥 BEAR — liquidating all positions');
    const allCgIds = [];
    for (const tier of ['T1', 'T2']) {
      for (const h of Object.values(p.portfolios[tier].holdings)) {
        if (h.source === 'coingecko' && h.cgId) allCgIds.push(h.cgId);
      }
    }
    const cgCache = await batchCGPrices(allCgIds);
    for (const tier of ['T1', 'T2']) {
      for (const [sym, h] of Object.entries(p.portfolios[tier].holdings)) {
        const price = await getPrice(h, cgCache);
        if (price) sell(p, tier, sym, 100, price, 'BEAR EXIT');
        await delay(300);
      }
    }
    return;
  }

  // Check daily limit
  if (getEntriesToday(p) >= MAX_ENTRIES_PER_DAY) {
    console.log('Daily entry limit reached. No new trades.');
    return;
  }

  const recentSells = getRecentSells(p, REENTRY_COOLDOWN_MS);

  // T1 entries — only highest conviction
  const t1Held = new Set(Object.keys(p.portfolios.T1.holdings));
  const t1Slots = Math.max(0, MAX_POSITIONS_PER_TIER - t1Held.size);
  const t1Candidates = (wl.tier1 || [])
    .filter(t => t.score >= MIN_SCORE_T1 && !t1Held.has(t.symbol) && !recentSells.has(t.symbol))
    .slice(0, t1Slots);

  for (const t of t1Candidates) {
    if (getEntriesToday(p) >= MAX_ENTRIES_PER_DAY) break;
    if (p.portfolios.T1.cash < MIN_CASH_RESERVE_T1 + 80) break;
    const amt = Math.min(MAX_POSITION_SIZE_T1, p.portfolios.T1.cash - MIN_CASH_RESERVE_T1);
    if (amt < 80) break;
    buy(p, 'T1', t.symbol, amt, t.price, {
      source: 'coingecko', id: t.id, volume: t.volume,
      change24h: t.change24h || 0,
      pattern: t.reasons.find(r => r.startsWith('PULLBACK') || r.startsWith('ACCUMULATION') || r.startsWith('EARLY') || r.startsWith('REVERSAL')) || 'mixed',
      reason: `Score ${t.score}: ${t.reasons.join(', ')}`
    });
  }

  // T2 entries
  const t2Held = new Set(Object.keys(p.portfolios.T2.holdings));
  const t2Slots = Math.max(0, MAX_POSITIONS_PER_TIER - t2Held.size);
  const t2Candidates = (wl.tier2 || [])
    .filter(t => t.score >= MIN_SCORE_T2 && !t2Held.has(t.symbol) && !recentSells.has(t.symbol))
    .filter(t => (t.liquidity || 0) >= MIN_LIQ_T2)
    .slice(0, t2Slots);

  for (const t of t2Candidates) {
    if (getEntriesToday(p) >= MAX_ENTRIES_PER_DAY) break;
    if (p.portfolios.T2.cash < MIN_CASH_RESERVE_T2 + 80) break;
    const amt = Math.min(MAX_POSITION_SIZE_T2, p.portfolios.T2.cash - MIN_CASH_RESERVE_T2);
    if (amt < 80) break;
    buy(p, 'T2', t.symbol, amt, t.price, {
      source: 'dexscreener', address: t.address, chain: t.chain,
      dex: t.dex, pairAddress: t.pairAddress, volume: t.volume,
      change24h: t.change24h || 0,
      pattern: t.reasons.find(r => r.startsWith('BREAKOUT') || r.startsWith('VOL SPIKE')) || 'mixed',
      reason: `Score ${t.score}: ${t.reasons.join(', ')}`
    });
  }
}

async function snapshot(p) {
  const allCgIds = [];
  for (const tier of ['T1', 'T2']) {
    for (const h of Object.values(p.portfolios[tier].holdings)) {
      if (h.source === 'coingecko' && h.cgId) allCgIds.push(h.cgId);
    }
  }
  const cgCache = await batchCGPrices(allCgIds);

  let t1Val = p.portfolios.T1.cash, t2Val = p.portfolios.T2.cash;
  for (const [, h] of Object.entries(p.portfolios.T1.holdings)) {
    const pr = await getPrice(h, cgCache); t1Val += pr ? h.qty * pr : h.qty * h.avgCost;
  }
  for (const [, h] of Object.entries(p.portfolios.T2.holdings)) {
    const pr = await getPrice(h, cgCache); t2Val += pr ? h.qty * pr : h.qty * h.avgCost;
    await delay(300);
  }

  // BTC benchmark
  const btcNow = await getBtcPrice();
  if (!p.btcBenchmark.startPrice && btcNow) p.btcBenchmark.startPrice = btcNow;
  if (btcNow) p.btcBenchmark.currentPrice = btcNow;
  const btcReturn = p.btcBenchmark.startPrice ? ((btcNow - p.btcBenchmark.startPrice) / p.btcBenchmark.startPrice * 100) : 0;

  const total = t1Val + t2Val;
  const pnl = total - 2000;
  const pnlPct = pnl / 2000 * 100;

  const snap = { time: new Date().toISOString(), T1: { total: t1Val, cash: p.portfolios.T1.cash }, T2: { total: t2Val, cash: p.portfolios.T2.cash }, grand: total, btcPrice: btcNow };
  p.snapshots.push(snap);
  if (p.snapshots.length > 300) p.snapshots = p.snapshots.slice(-300);

  console.log('\n=== PORTFOLIO v3 ===');
  console.log(`T1: $${t1Val.toFixed(2)} (cash: $${p.portfolios.T1.cash.toFixed(2)})`);
  console.log(`T2: $${t2Val.toFixed(2)} (cash: $${p.portfolios.T2.cash.toFixed(2)})`);
  console.log(`TOTAL: $${total.toFixed(2)} | P&L: $${pnl.toFixed(2)} (${pnlPct.toFixed(2)}%)`);
  console.log(`BTC benchmark: ${btcReturn >= 0 ? '+' : ''}${btcReturn.toFixed(2)}% (buy & hold $2K in BTC)`);
  console.log(`vs BTC: ${(pnlPct - btcReturn).toFixed(2)}%`);
}

async function status(p) {
  const allCgIds = [];
  for (const tier of ['T1', 'T2']) {
    for (const h of Object.values(p.portfolios[tier].holdings)) {
      if (h.source === 'coingecko' && h.cgId) allCgIds.push(h.cgId);
    }
  }
  const cgCache = await batchCGPrices(allCgIds);

  console.log('=== PAPER TRADING v3 — STATUS ===');
  console.log('Created: ' + p.created);
  console.log('Trades: ' + p.trades.length);
  console.log('Max positions/tier: ' + MAX_POSITIONS_PER_TIER);
  console.log('Max entries/day: ' + MAX_ENTRIES_PER_DAY);
  console.log('Entries today: ' + getEntriesToday(p));

  for (const tier of ['T1', 'T2']) {
    const port = p.portfolios[tier];
    const held = Object.entries(port.holdings);
    console.log(`\n--- ${port.name} (${held.length}/${MAX_POSITIONS_PER_TIER} slots) ---`);
    console.log(`Cash: $${port.cash.toFixed(2)}`);
    if (held.length === 0) { console.log('No holdings.'); continue; }
    for (const [sym, h] of held) {
      const pr = await getPrice(h, cgCache);
      const pnl = pr ? ((pr / h.avgCost - 1) * 100).toFixed(1) : '?';
      const holdH = ((Date.now() - new Date(h.enteredAt).getTime()) / 3600000).toFixed(1);
      console.log(`  ${sym}: $${(h.totalInvested||0).toFixed(0)} in | Now: $${pr || '?'} | P&L: ${pnl}% | Stop: ${h.stopPct}% | Pattern: ${h.entryPattern} | Held: ${holdH}h`);
      await delay(200);
    }
  }

  // Trade stats
  const sells = p.trades.filter(t => t.type === 'SELL' && t.pnl !== undefined);
  if (sells.length > 0) {
    const wins = sells.filter(t => t.pnl > 0);
    const totalPnl = sells.reduce((s, t) => s + t.pnl, 0);
    console.log(`\n--- Stats: ${sells.length} closed | Win rate: ${(wins.length/sells.length*100).toFixed(0)}% | Closed P&L: $${totalPnl.toFixed(2)} ---`);
  }

  await snapshot(p);
}

// === MAIN ===
(async () => {
  const cmd = process.argv[2] || 'cycle';
  let p = load() || createPortfolio();

  switch (cmd) {
    case 'init':
      p = createPortfolio();
      // Set BTC benchmark immediately
      const btc = await getBtcPrice();
      if (btc) p.btcBenchmark.startPrice = btc;
      console.log('Fresh v3 portfolio created. $2,000 starting capital.');
      console.log('BTC benchmark start: $' + (btc || 'unknown'));
      break;
    case 'status':
      await status(p);
      break;
    case 'cycle':
      await checkExits(p);
      await scanAndTrade(p);
      await snapshot(p);
      break;
    case 'exits':
      await checkExits(p);
      break;
    default:
      console.log('Usage: node crypto-paper-trade-v3.js [init|status|cycle|exits]');
  }

  p.lastUpdated = new Date().toISOString();
  save(p);
  console.log('\nState saved.');
})().catch(e => console.error('FATAL:', e.message));
