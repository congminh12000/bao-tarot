// Fetches every daily candle of a TradingView symbol (its chart websocket, as the TradingView chart loads them) and
// saves them where make-data.js reads them:
//
//   COIN=ETH node fetch-tradingview.js                        the symbol in coins/ETH/coin.json ("tradingview")
//   COIN=ETH node fetch-tradingview.js CRYPTO:ETHUSD          another symbol (to compare which has the longest history)
//   node fetch-tradingview.js INDEX:BTCUSD --print            only print the range, save nothing
//
// → <the coin's data>/tradingview/<SYMBOL>_1D_<first>_<last>.csv  (time,open,high,low,close,Volume; ISO dates)
// Older files of the same symbol are replaced (a later file name wins in make-data.js anyway).
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const COIN = require('./coin');
const sym = args[0] || COIN.tradingview;
if (!sym) throw new Error('no TradingView symbol (give one, or set "tradingview" in coin.json)');
const PRINT = process.argv.includes('--print');

const ws = new WebSocket('wss://data.tradingview.com/socket.io/websocket?type=chart', {
  headers: { Origin: 'https://www.tradingview.com', 'User-Agent': 'Mozilla/5.0' },
});
const id = (p) => p + Math.random().toString(36).slice(2, 14);
const cs = id('cs_'), qs = id('qs_');
const frame = (s) => `~m~${s.length}~m~${s}`;
const send = (m, p) => ws.send(frame(JSON.stringify({ m, p })));
const bars = new Map();
let last = -1;
const day = (sec) => new Date(sec * 1000).toISOString().slice(0, 10);
function finish() {
  const rows = [...bars.values()].sort((a, b) => a[0] - b[0]);
  if (!rows.length) { console.error(`${sym}: no data`); process.exit(1); }
  const first = day(rows[0][0]), end = day(rows[rows.length - 1][0]);
  console.log(`${sym}: ${rows.length} daily candles ${first} → ${end}`);
  if (!PRINT) {
    const dir = path.join(COIN.dataDir, 'tradingview'), base = sym.replace(':', '_');
    fs.mkdirSync(dir, { recursive: true });
    for (const f of fs.readdirSync(dir)) if (f.startsWith(base + '_1D_')) fs.unlinkSync(path.join(dir, f));
    const file = path.join(dir, `${base}_1D_${first}_${end}.csv`);
    fs.writeFileSync(file, 'time,open,high,low,close,Volume\n' + rows.map((r) => `${day(r[0])},${r.slice(1, 5).join(',')},${r[5] ?? ''}`).join('\n') + '\n');
    console.log(`saved ${path.relative(__dirname, file)}`);
  }
  ws.close(); process.exit(0);
}
ws.onopen = () => {
  send('set_auth_token', ['unauthorized_user_token']);
  send('chart_create_session', [cs, '']);
  send('quote_create_session', [qs]);
  send('resolve_symbol', [cs, 'sds_sym_1', '=' + JSON.stringify({ symbol: sym, adjustment: 'splits' })]);
  send('create_series', [cs, 'sds_1', 's1', 'sds_sym_1', '1D', 5000, '']);
};
ws.onmessage = (ev) => {
  for (const p of String(ev.data).split(/~m~\d+~m~/).filter(Boolean)) {
    if (p.startsWith('~h~')) { ws.send(frame(p)); continue; } // heartbeat
    let msg; try { msg = JSON.parse(p); } catch { continue; }
    if (msg.m === 'timescale_update' || msg.m === 'du') for (const b of msg.p?.[1]?.sds_1?.s || []) bars.set(b.v[0], b.v);
    else if (msg.m === 'series_completed') { if (bars.size === last) return finish(); last = bars.size; send('request_more_data', [cs, 'sds_1', 5000]); }
    else if (['symbol_error', 'critical_error', 'protocol_error'].includes(msg.m)) { console.error(`${sym}: ${JSON.stringify(msg.p)}`); process.exit(1); }
  }
};
ws.onerror = (e) => { console.error('websocket error', e.message || e); process.exit(1); };
setTimeout(() => { console.error('timeout'); bars.size ? finish() : process.exit(1); }, 90000);
