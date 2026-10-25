// Checks the event labels of the whole film, as drawn: no two labels may ever touch (box on box, or a box over
// another label's line). Run after changing data/events.csv, film.js or the tempo:   node check-labels.js
// It also lists the labels that only fit by making an earlier label leave early (the last resort in film.js).
const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'], ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
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
