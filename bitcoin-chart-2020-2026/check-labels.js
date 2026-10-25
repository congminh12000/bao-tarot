// Checks the event labels of the whole film, as drawn: no two labels may ever touch (box on box, or a box over
// another label's line). Run after changing data/events.csv, film.js or the tempo:   node check-labels.js
// It also lists the labels that only fit by making an earlier label leave early (the last resort in film.js).
// Needs playwright-core (`npm install` in this folder) and Chrome (found like engine/render.js, or CHROME_PATH).
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright-core')); } catch (e) {
  try { ({ chromium } = require('playwright')); } catch (e2) { console.error('playwright-core is missing: run `npm install` in this folder'); process.exit(2); }
}
const MAC = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'];
const chrome = process.env.CHROME_PATH || MAC.find((p) => fs.existsSync(p));
(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'], ...(chrome ? { executablePath: chrome } : {}) });
  const p = await b.newPage();
  p.on('pageerror', (e) => console.log('page error:', e.message));
  await p.goto('file://' + path.join(__dirname, 'index.html'));
  await p.waitForFunction(() => globalThis.SCORE_DEBUG, null, { timeout: 60000 });
  const cut = await p.evaluate(() => SCORE_DEBUG.crowded());
  const over = await p.evaluate(() => SCORE_DEBUG.overlaps(0.2));
  await b.close();
  console.log(`labels that pushed an earlier label out early: ${cut.length}${cut.length ? '\n  ' + cut.join('\n  ') : ''}`);
  console.log(over.length ? `✗ ${over.length} overlap(s):\n  ${over.slice(0, 40).join('\n  ')}` : '✓ no two labels ever overlap');
  process.exit(over.length ? 1 : 0);
})();
