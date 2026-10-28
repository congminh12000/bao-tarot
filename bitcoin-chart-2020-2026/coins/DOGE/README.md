# Dogecoin film — event list of 92 approved (2026-10-28), no preview yet

Prepared 2026-10-28 following PROJECT.md §11 and the palette in `coins/README.md`.

- Prices: TradingView `CRYPTO:DOGEUSD`, 4,700 actual daily candles 2013-12-15 → 2026-10-27, no gaps (details: `data/SOURCES.md`).
- Events: 92 stored rows, all with sources; 55 shown (6 level 2 / 14 level 1 / 35 level 0), 37 `remove=true`.
- Phases: 9 (5 uptrends, 4 downtrends); ATH $0.0023 · $0.0040 · $0.0188 · $0.739, ATL $0.000086 · $0.00065 · $0.0013 ·
  $0.049. Music: 9 distinct approved cues, `--strict` passes; full timeline ≈ 8:00.
- Label check over the whole film: no overlaps, no early exits; closing still checked by eye.
- Logo: official Dogecoin Core coin mark. Colours: DOGE row of the palette table, awaiting approval.
- No video rendered: the event list waits for approval.

```bash
COIN=DOGE node make-data.js --strict && COIN=DOGE FPS=60 node song.js && COIN=DOGE FPS=60 node check-labels.js
```
