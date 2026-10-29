// Keep crypto source policy intact; equities use exchange/quarter/source checks instead.
const { spawnSync } = require('child_process');
const coin = require('./coin');
const args = coin.assetClass === 'equity' ? ['node', ['check-equity.js', '--strict']] : ['python3', ['audit-99bitcoins.py', '--live']];
const r = spawnSync(args[0], args[1], { cwd: __dirname, env: process.env, stdio: 'inherit' });
if (r.error) throw r.error;
process.exit(r.status ?? 1);
