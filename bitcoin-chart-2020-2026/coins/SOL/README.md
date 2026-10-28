# Solana film — event list approved (2026-10-28), no preview yet

Prepared 2026-10-28 following PROJECT.md §11 and the palette in `coins/README.md`.

- Prices: TradingView `CRYPTO:SOLUSD`, 2,392 actual daily candles 2020-04-10 → 2026-10-27, no gaps (details: `data/SOURCES.md`).
- Events: 42 stored rows, all with sources; 35 shown (8 level 2 / 19 level 1 / 8 level 0), 7 `remove=true`.
- Phases: 9 (5 uptrends, 4 downtrends) from the unchanged detector; ATH $4.95 · $58.6 · $260 · $295,
  ATL $1.03 · $22.1 · $8.00 · $60.1. Music: 9 distinct approved cues, `--strict` passes; full timeline ≈ 4:43.
- Label check over the whole film: no overlaps, no early label exits. No video rendered: the event list waits for approval.

```bash
COIN=SOL node make-data.js --strict && COIN=SOL FPS=60 node song.js && COIN=SOL FPS=60 node check-labels.js
```
