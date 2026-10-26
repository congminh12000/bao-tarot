// The coin the film is about: COIN=ETH node make-data.js … (default BTC). Each coin lives in coins/<SYMBOL>/:
//   coin.json            name, pair ("ETH / USD"), TradingView symbol, data folder, logos, colours, music shuffle
//   data/                tradingview/*.csv, events.csv, phases.csv (anchors.csv optional) — Bitcoin keeps its in ./data
//   chapter-names.json   the YouTube chapter names (youtube-chapters.js)
// make-data.js copies coin.json into btc-data.js (BTC.coin), so the film in the browser knows the coin too.
const fs = require('fs');
const path = require('path');

const SYMBOL = (process.env.COIN || 'BTC').toUpperCase();
const DIR = path.join(__dirname, 'coins', SYMBOL);
if (!fs.existsSync(path.join(DIR, 'coin.json'))) throw new Error(`no coins/${SYMBOL}/coin.json — set up the coin first (PROJECT.md §11)`);
const coin = JSON.parse(fs.readFileSync(path.join(DIR, 'coin.json'), 'utf8'));
coin.dir = path.relative(__dirname, DIR);
coin.dataDir = path.join(__dirname, coin.dataDir || path.join(coin.dir, 'data'));
module.exports = coin;
