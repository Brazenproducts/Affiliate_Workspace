const https = require('https');
const fs = require('fs');

const WATCHLIST_FILE = '/home/ubuntu/.openclaw/workspace/memory/momentum-watchlist.json';

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    https.get({ hostname: u.hostname, path: u.pathname + u.search, headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { resolve(null); } });
    }).on('error', () => resolve(null)).on('timeout', () => resolve(null));
  });
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/*
 * v3 SCORING — inverted from v2
 * 
 * v2 mistake: rewarded tokens already up 20-100% in 24h → buying tops
 * v3 fix: reward tokens that are CONSOLIDATING or PULLING BACK after a run,
 *         with strong volume indicating accumulation, not distribution
 *
 * The idea: find tokens that ran, pulled back, and are showing signs of
 * a second leg. Or tokens with unusual volume accumulation before a move.
 */
function scoreToken(t) {
  let score = 0;
  const reasons = [];
  const c24 = t.change24h || 0;
  const c1 = t.change1h || 0;
  const c7d = t.change7d || 0;
  const vol = t.volume || 0;
  const mcap = t.mcap || 0;
  const vmr = mcap > 0 ? vol / mcap : 0;

  // === HARD REJECTS (instant disqualify) ===
  if (vol < 2000000) { return { score: -100, reasons: ['REJECT: <$2M volume'] }; }
  if (c24 > 150) { return { score: -100, reasons: ['REJECT: already up ' + c24.toFixed(0) + '% — chasing'] }; }
  if (c24 < -25) { return { score: -100, reasons: ['REJECT: down ' + c24.toFixed(0) + '% — falling knife'] }; }
  if (mcap > 0 && mcap < 5e6) { return { score: -100, reasons: ['REJECT: mcap <$5M — too risky'] }; }

  // === PATTERN 1: Pullback entry (best pattern) ===
  // Token up on 7d but pulling back on 24h — buying the dip in an uptrend
  if (c7d > 15 && c24 >= -10 && c24 <= 5) {
    score += 35;
    reasons.push('PULLBACK: 7d+' + c7d.toFixed(0) + '% but 24h ' + c24.toFixed(1) + '% (dip buy)');
  }

  // === PATTERN 2: Accumulation (volume without price move) ===
  // High volume relative to mcap but price hasn't moved much — someone's loading
  if (vmr > 1.5 && Math.abs(c24) < 10) {
    score += 30;
    reasons.push('ACCUMULATION: vol/mcap ' + vmr.toFixed(1) + 'x but price flat');
  }

  // === PATTERN 3: Early breakout (moderate, not parabolic) ===
  // Up 5-30% in 24h with accelerating 1h — catching early, not late
  if (c24 >= 5 && c24 <= 30 && c1 >= 3 && c1 <= 15) {
    score += 25;
    reasons.push('EARLY MOVE: 24h+' + c24.toFixed(0) + '%, 1h+' + c1.toFixed(0) + '%');
  }

  // === PATTERN 4: Reversal from oversold ===
  // Down on 7d but bouncing on 1h — potential reversal
  if (c7d < -15 && c7d > -40 && c1 > 5) {
    score += 20;
    reasons.push('REVERSAL: 7d' + c7d.toFixed(0) + '% but 1h+' + c1.toFixed(0) + '%');
  }

  // === VOLUME QUALITY ===
  if (vmr > 3) { score += 10; reasons.push('vol/mcap ' + vmr.toFixed(1) + 'x (unusual activity)'); }
  else if (vmr > 1) { score += 5; reasons.push('vol/mcap ' + vmr.toFixed(1) + 'x'); }

  // === PENALTIES ===
  // Already extended — reduce score
  if (c24 > 30 && c24 <= 60) { score -= 10; reasons.push('CAUTION: already +' + c24.toFixed(0) + '% today'); }
  if (c24 > 60) { score -= 25; reasons.push('EXTENDED: +' + c24.toFixed(0) + '% — late entry risk'); }

  // 1h fading while 24h up = distribution (smart money selling)
  if (c24 > 15 && c1 < -3) { score -= 15; reasons.push('DISTRIBUTION: 24h up but 1h fading'); }

  // Micro-cap bonus (more upside potential, but only if other signals present)
  if (mcap > 5e6 && mcap < 30e6 && score > 15) { score += 5; reasons.push('small-cap upside'); }

  return { score, reasons };
}

function scoreTokenT2(t) {
  let score = 0;
  const reasons = [];
  const c24 = t.change24h || 0;
  const c1 = t.change1h || 0;
  const c5m = t.change5m || 0;
  const vol = t.volume || 0;
  const liq = t.liquidity || 0;

  // === HARD REJECTS ===
  if (liq < 100000) { return { score: -100, reasons: ['REJECT: liq <$100K'] }; }
  if (vol < 200000) { return { score: -100, reasons: ['REJECT: vol <$200K'] }; }
  if (c24 > 200) { return { score: -100, reasons: ['REJECT: +' + c24.toFixed(0) + '% — guaranteed dump'] }; }
  if (c24 < -30) { return { score: -100, reasons: ['REJECT: -' + c24.toFixed(0) + '% — falling knife'] }; }

  // === PATTERN 1: Fresh breakout with liquidity ===
  if (c24 >= 10 && c24 <= 60 && c1 >= 3 && c1 <= 20 && liq > 200000) {
    score += 35;
    reasons.push('BREAKOUT: 24h+' + c24.toFixed(0) + '%, 1h+' + c1.toFixed(0) + '%, liq $' + (liq/1000).toFixed(0) + 'K');
  }

  // === PATTERN 2: Volume spike on consolidation ===
  if (Math.abs(c24) < 15 && vol > liq * 3) {
    score += 25;
    reasons.push('VOL SPIKE: vol/liq ' + (vol/liq).toFixed(1) + 'x on flat price');
  }

  // === PATTERN 3: 5-min acceleration (very early signal) ===
  if (c5m > 3 && c5m < 15 && c1 > 0 && c24 < 40) {
    score += 15;
    reasons.push('5min+' + c5m.toFixed(1) + '% (early acceleration)');
  }

  // Penalties
  if (c24 > 60) { score -= 15; reasons.push('EXTENDED: +' + c24.toFixed(0) + '%'); }
  if (c1 < -5 && c24 > 20) { score -= 20; reasons.push('DUMPING: 1h' + c1.toFixed(0) + '%'); }

  // Liquidity bonus
  if (liq > 500000) { score += 5; reasons.push('strong liq $' + (liq/1000).toFixed(0) + 'K'); }

  return { score, reasons };
}

async function getMarketTrend() {
  const data = await httpGet('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true');
  if (!data) return { trend: 'neutral', reason: 'API unavailable', btcPrice: 0, ethPrice: 0 };

  const btcPrice = data?.bitcoin?.usd || 0;
  const ethPrice = data?.ethereum?.usd || 0;
  const btc24h = data?.bitcoin?.usd_24h_change || 0;
  const eth24h = data?.ethereum?.usd_24h_change || 0;
  const avg24h = (btc24h + eth24h) / 2;

  let trend, reason;
  if (avg24h <= -5) {
    trend = 'bear';
    reason = `BTC ${btc24h.toFixed(1)}% / ETH ${eth24h.toFixed(1)}% — RISK OFF`;
  } else if (avg24h >= 3) {
    trend = 'bull';
    reason = `BTC ${btc24h.toFixed(1)}% / ETH ${eth24h.toFixed(1)}% — risk on`;
  } else {
    trend = 'neutral';
    reason = `BTC ${btc24h.toFixed(1)}% / ETH ${eth24h.toFixed(1)}% — selective`;
  }
  return { trend, reason, btcPrice, ethPrice, btc24h, eth24h };
}

async function scanCoinGecko() {
  console.log('Scanning CoinGecko top 250 by volume...');
  const [markets, trending] = await Promise.all([
    httpGet('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=250&page=1&sparkline=false&price_change_percentage=1h,24h,7d'),
    httpGet('https://api.coingecko.com/api/v3/search/trending')
  ]);

  const trendingIds = new Set((trending?.coins || []).map(c => c.item?.id).filter(Boolean));
  const results = [];

  if (Array.isArray(markets)) {
    for (const m of markets) {
      // Skip stablecoins, wrapped tokens, and pegged assets
      const sym = m.symbol.toLowerCase();
      if (['usdt', 'usdc', 'dai', 'busd', 'tusd', 'wbtc', 'weth', 'steth', 'usdd', 'frax', 'lusd', 'gusd', 'usdp', 'pyusd', 'fdusd', 'usde', 'eurc', 'eurs', 'reur', 'rusd', 'usdq', 'usdr', 'susd', 'cusd', 'ceur', 'ust', 'mim', 'dola'].includes(sym)) continue;
      // Also skip anything with "usd" in the name that's pegged near $1
      if (m.name.toLowerCase().includes('dollar') && m.current_price > 0.95 && m.current_price < 1.05) continue;
      if (m.name.toLowerCase().includes('stablr') || m.name.toLowerCase().includes('quantoz')) continue;

      const t = {
        symbol: m.symbol.toUpperCase(), name: m.name, id: m.id,
        price: m.current_price, change24h: m.price_change_percentage_24h || 0,
        change1h: m.price_change_percentage_1h_in_currency || 0,
        change7d: m.price_change_percentage_7d_in_currency || 0,
        volume: m.total_volume || 0, mcap: m.market_cap || 0,
        source: 'coingecko', tier: 1
      };
      const s = scoreToken(t);
      if (trendingIds.has(m.id)) { s.score += 5; s.reasons.push('trending'); }
      results.push({ ...t, ...s });
    }
  }
  return results;
}

async function scanDexScreener() {
  console.log('Scanning DexScreener Solana...');
  const results = [];
  const seen = new Set();

  const boosts = await httpGet('https://api.dexscreener.com/token-boosts/latest/v1');
  const solTrending = await httpGet('https://api.dexscreener.com/latest/dex/search?q=solana');

  const pairs = [];
  if (Array.isArray(boosts)) {
    const solBoosts = boosts.filter(b => b.chainId === 'solana').slice(0, 10);
    for (const b of solBoosts) {
      if (b.tokenAddress && !seen.has(b.tokenAddress)) {
        seen.add(b.tokenAddress);
        const detail = await httpGet('https://api.dexscreener.com/latest/dex/tokens/' + b.tokenAddress);
        if (detail?.pairs?.length > 0) pairs.push(...detail.pairs.slice(0, 1));
        await delay(250);
      }
    }
  }
  if (solTrending?.pairs) {
    for (const p of solTrending.pairs.slice(0, 20)) {
      if (p.chainId === 'solana' && p.baseToken && !seen.has(p.baseToken.address)) {
        seen.add(p.baseToken.address);
        pairs.push(p);
      }
    }
  }

  for (const p of pairs) {
    if (!p.baseToken || !p.priceUsd) continue;
    const t = {
      symbol: p.baseToken.symbol, name: p.baseToken.name,
      address: p.baseToken.address, pairAddress: p.pairAddress,
      price: parseFloat(p.priceUsd),
      change24h: p.priceChange?.h24 || 0,
      change1h: p.priceChange?.h1 || 0,
      change5m: p.priceChange?.m5 || 0,
      volume: p.volume?.h24 || 0,
      mcap: p.fdv || 0,
      liquidity: p.liquidity?.usd || 0,
      dex: p.dexId, chain: p.chainId,
      source: 'dexscreener', tier: 2
    };
    const s = scoreTokenT2(t);
    results.push({ ...t, ...s });
  }
  return results;
}

async function fullScan() {
  const now = new Date().toISOString();
  console.log('=== SCANNER v3 — PULLBACK + ACCUMULATION ===');
  console.log('Time: ' + now + '\n');

  const marketTrend = await getMarketTrend();
  console.log('Market: ' + marketTrend.trend.toUpperCase() + ' — ' + marketTrend.reason);
  console.log('BTC: $' + marketTrend.btcPrice.toLocaleString() + ' | ETH: $' + marketTrend.ethPrice.toLocaleString() + '\n');

  const [cg, dex] = await Promise.all([scanCoinGecko(), scanDexScreener()]);

  // In bear market, only show very high conviction
  const t1Min = marketTrend.trend === 'bear' ? 40 : 20;
  const t2Min = marketTrend.trend === 'bear' ? 40 : 20;

  const tier1 = cg.filter(t => t.score >= t1Min).sort((a, b) => b.score - a.score).slice(0, 10);
  const tier2 = dex.filter(t => t.score >= t2Min).sort((a, b) => b.score - a.score).slice(0, 10);

  console.log('\n=== TIER 1 — CoinGecko (pullback/accumulation plays) ===');
  if (tier1.length === 0) console.log('  No qualifying setups right now. Patience.');
  tier1.forEach((t, i) => {
    console.log(`${i + 1}. ${t.symbol} (${t.name}) — Score: ${t.score}`);
    console.log(`   $${t.price} | 1h: ${t.change1h?.toFixed(1)}% | 24h: ${t.change24h?.toFixed(1)}% | 7d: ${(t.change7d||0).toFixed(1)}% | Vol: $${(t.volume / 1e6).toFixed(1)}M`);
    console.log(`   ${t.reasons.join(', ')}`);
  });

  console.log('\n=== TIER 2 — DEX (breakout + liquidity plays) ===');
  if (tier2.length === 0) console.log('  No qualifying setups right now. Patience.');
  tier2.forEach((t, i) => {
    console.log(`${i + 1}. ${t.symbol} (${t.name}) — Score: ${t.score}`);
    console.log(`   $${t.price} | 1h: ${t.change1h?.toFixed(1)}% | 24h: ${t.change24h?.toFixed(1)}% | 5m: ${(t.change5m || 0).toFixed(1)}% | Liq: $${((t.liquidity || 0) / 1000).toFixed(0)}K`);
    console.log(`   ${t.reasons.join(', ')}`);
  });

  const watchlist = { lastScan: now, marketTrend, tier1, tier2 };
  fs.writeFileSync(WATCHLIST_FILE, JSON.stringify(watchlist, null, 2));
  console.log('\nWatchlist saved.');
  return watchlist;
}

if (require.main === module) {
  fullScan().catch(e => console.error('FATAL:', e.message));
}

module.exports = { fullScan, httpGet, scoreToken, scoreTokenT2, getMarketTrend };
