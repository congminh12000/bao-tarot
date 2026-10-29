// Checks the event labels of the whole film, as drawn: no two labels may ever touch (box on box, or a box over
// another label's line). Run after changing data/events.csv, film.js or the tempo:   node check-labels.js
// It also lists the labels that only fit by making an earlier label leave early (the last resort in film.js).
// Needs playwright-core (`npm install` in this folder) and Chrome (found like engine/render.js, or CHROME_PATH).
const fs = require('fs');
const path = require('path');
const http = require('http');
let chromium;
try { ({ chromium } = require('playwright-core')); } catch (e) {
  try { ({ chromium } = require('playwright')); } catch (e2) { console.error('playwright-core is missing: run `npm install` in this folder'); process.exit(2); }
}
const MAC = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'];
const chrome = process.env.CHROME_PATH || MAC.find((p) => fs.existsSync(p));
(async () => {
  // Match the renderer's local HTTP loading: managed Chrome may disallow file://,
  // and web fonts must finish loading before measuring the labels.
  const root = fs.realpathSync(__dirname);
  const server = http.createServer((req, res) => {
    let file;
    try { file = fs.realpathSync(path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname)); }
    catch { res.writeHead(404); return res.end(); }
    if (!file.startsWith(root + path.sep) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end(); }
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.ttf': 'font/ttf', '.png': 'image/png', '.json': 'application/json' };
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  let b;
  try {
  b = await chromium.launch({ args: [], ...(chrome ? { executablePath: chrome } : {}) });
  const p = await b.newPage();
  p.on('pageerror', (e) => console.log('page error:', e.message));
  await p.goto(`http://127.0.0.1:${server.address().port}/index.html`);
  await p.waitForFunction(() => globalThis.SCORE_DEBUG && globalThis.READY === true, null, { timeout: 60000 });
  await p.evaluate(() => document.fonts.ready);
  const cut = await p.evaluate(() => SCORE_DEBUG.crowded());
  const over = await p.evaluate(() => SCORE_DEBUG.overlaps(0.2));
  console.log(`labels that pushed an earlier label out early: ${cut.length}${cut.length ? '\n  ' + cut.join('\n  ') : ''}`);
  console.log(over.length ? `✗ ${over.length} overlap(s):\n  ${over.slice(0, 40).join('\n  ')}` : '✓ no two labels ever overlap');
  process.exitCode = over.length ? 1 : 0;
  } finally { if (b) await b.close(); await new Promise((resolve) => server.close(resolve)); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
