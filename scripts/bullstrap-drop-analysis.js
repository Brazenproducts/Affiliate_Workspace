const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: '/home/ubuntu/.openclaw/workspace/.gcp-service-account.json',
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
});
(async () => {
  const webmasters = google.webmasters({ version: 'v3', auth: await auth.getClient() });
  const SITE = 'https://bullstrap.com/';
  const today = new Date();
  const daysAgo = n => { const d = new Date(today); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); };
  const recent = { start: daysAgo(14), end: daysAgo(0) };
  const prior  = { start: daysAgo(28), end: daysAgo(15) };
  async function q(dim, startDate, endDate, rowLimit=30) {
    const { data } = await webmasters.searchanalytics.query({
      siteUrl: SITE,
      requestBody: { startDate, endDate, dimensions: [dim], rowLimit, dataState: 'all' }
    });
    return data.rows || [];
  }
  const rp = await q('page', recent.start, recent.end, 300);
  const pp = await q('page', prior.start, prior.end, 300);
  const map = {};
  for (const r of pp) map[r.keys[0]] = { prior: r, recent: null };
  for (const r of rp) {
    map[r.keys[0]] = map[r.keys[0]] || { prior: null, recent: null };
    map[r.keys[0]].recent = r;
  }
  const losers = [];
  for (const [url, v] of Object.entries(map)) {
    const pc = v.prior?.clicks || 0;
    const rc = v.recent?.clicks || 0;
    const pp_ = v.prior?.position || 999;
    const rp_ = v.recent?.position || 999;
    const delta = rc - pc;
    if (pc >= 1 && delta <= -1) {
      losers.push({ url, pc, rc, delta, pp_, rp_, posDelta: rp_ - pp_ });
    }
  }
  losers.sort((a,b) => a.delta - b.delta);
  console.log('\n=== BIGGEST PAGE CLICK LOSERS (prior 14d vs last 14d) ===');
  console.log('Page path | Prior->Recent clicks | Prior->Recent pos');
  for (const l of losers.slice(0, 20)) {
    const short = l.url.replace('https://bullstrap.com','').slice(0, 70);
    console.log(`${short}  |  ${l.pc} -> ${l.rc}  |  ${l.pp_.toFixed(1)} -> ${l.rp_.toFixed(1)} (${l.posDelta >= 0 ? '+' : ''}${l.posDelta.toFixed(1)})`);
  }
  const rq = await q('query', recent.start, recent.end, 300);
  const pq = await q('query', prior.start, prior.end, 300);
  const qmap = {};
  for (const r of pq) qmap[r.keys[0]] = { prior: r, recent: null };
  for (const r of rq) {
    qmap[r.keys[0]] = qmap[r.keys[0]] || { prior: null, recent: null };
    qmap[r.keys[0]].recent = r;
  }
  const qlosers = [];
  for (const [q_, v] of Object.entries(qmap)) {
    const pc = v.prior?.clicks || 0;
    const rc = v.recent?.clicks || 0;
    if (pc >= 1 && (rc - pc) <= -1) {
      qlosers.push({ q: q_, pc, rc, pp: (v.prior?.position||999), rp: (v.recent?.position||999) });
    }
  }
  qlosers.sort((a,b) => (a.rc - a.pc) - (b.rc - b.pc));
  console.log('\n=== BIGGEST QUERY CLICK LOSERS ===');
  for (const l of qlosers.slice(0, 15)) {
    console.log(`"${l.q.slice(0,60)}"  |  ${l.pc} -> ${l.rc}  |  ${l.pp.toFixed(1)} -> ${l.rp.toFixed(1)}`);
  }
})().catch(e => { console.error('ERR', e.message); });
