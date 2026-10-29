# Hyperliquid (HYPE) — data audit, second pass 2026-10-29

- Prices: TradingView **CRYPTO:HYPEHUSD**, the USD Hyperliquid aggregate. 698 closed daily candles,
  2024-11-30–2026-10-28, no internal gaps/estimates. Two independent raw fetches match exactly.
  The corrected ticker recovers four days missing in the first pass; **genesis day 2024-11-29 still unavailable**.
- Original PYTH oracle and USDT/USDC spot feeds preserved for comparison, outside active tradingview/.
  No quote-currency mixing, no open UTC candle in production. Raw/daily CSV preserve full precision.
- Events: 225 research rows, 465 citations; levels 0/1/2 = 94/116/15. 63 remove=true retained in research;
  162 retained events, of which 152 fall within saved prices. Existing 181 rows/flags preserved.
- All 49 formerly unresolved notices now have individual decisions. Recovered product/tech details from recaps;
  every ecosystem integration/rolling metric and the separate API channel are not certified exhaustive.
- Current status page recovered: October 25 was scheduled maintenance. Full historical API still unavailable.
- Review: data/events-review-20261029.md; detailed evidence/limits: data/SOURCES.md and second-pass-20261029.json.
- Parser/source links, snapshot reconciliation and isolated strict ingestion pass. Root film data/music unchanged.

Event list/levels/remove flags await approval before any render. This data-only task does not prepare logo,
palette, phases/music or a preview. No video rendered. Not a claim of exhaustive world history.
