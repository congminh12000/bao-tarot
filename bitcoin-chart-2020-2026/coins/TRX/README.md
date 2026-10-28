# TRON film — event list awaiting approval

Prepared 2026-10-28 following PROJECT.md §11.

- Prices: TradingView `CRYPTO:TRXUSD`, 3,332 actual daily candles 2017-09-13 → 2026-10-27, no gaps (details: `data/SOURCES.md`).
- Events: 67 stored rows, all with sources; 37 shown (6 level 2 / 14 level 1 / 17 level 0), 30 `remove=true`.
- Phases: 5 (3 uptrends, 2 downtrends); ATH $0.30 (2018-01-05) · $0.449 (2024-12-04), ATL $0.0079 (2020-03-13) ·
  $0.211 (2025-03-16). Music: 5 distinct approved cues, `--strict` passes; full timeline ≈ 5:44.
- Label check over the whole film: no overlaps, no early exits; the closing zoom-out still was checked by eye.
- Logo: official TRON Brand Kit icon. Colours proposed (not in the palette table yet): coral on dark red, awaiting approval.
- No video rendered: the event list waits for approval.

```bash
COIN=TRX node make-data.js --strict && COIN=TRX FPS=60 node song.js && COIN=TRX FPS=60 node check-labels.js
```
