# Dogecoin (DOGE) film sources

Prepared 2026-10-28. Prices and price milestones come only from the saved TradingView daily candles.

## Prices

Compared TradingView symbols with `fetch-tradingview.js --print`: `INDEX:DOGEUSD` invalid; `CRYPTO:DOGEUSD` 4,701 candles
from 2013-12-15; `POLONIEX:DOGEBTC` 4,659 from 2014-01-21 (BTC pair); `BINANCE:DOGEUSD` 4,645 from 2014-01-01;
`BITTREX:DOGEUSD` 3,642 (2013-12-15 → 2023-12-04, delisted); `BINANCE:DOGEUSDT` 2,673 from 2019-07-05; `KRAKEN:DOGEUSD`
2,506; `COINBASE:DOGEUSD` 1,974 from 2021-06-03; `BITSTAMP:DOGEUSD` 1,408. Selected `CRYPTO:DOGEUSD` (USD pair, longest
history, same choice as BNB/XRP/SOL/TRX). Removed the unfinished 2026-10-28 UTC candle: **4,700 actual candles,
2013-12-15 → 2026-10-27, no missing day, no estimated fill, every candle passes low ≤ open/close ≤ high.**
Cross-check of daily closes: vs `COINBASE:DOGEUSD` 1,973 days, median 0.032 %, p99 0.83 %, max 3.7 %; vs `BINANCE:DOGEUSDT`
2,672 days, median 0.073 %, p99 3.9 %; vs `BITTREX:DOGEUSD` 3,642 days, median 0.000 %. Highest high $0.73905 on 2021-05-08.

## Events

99Bitcoins has no DOGE timeline (altcoin history paths redirect to Bitcoin), so the 234 Bitcoin source IDs were
dispositioned in `99bitcoins-coverage.json` (28 before DOGE history, 145 not applicable, 61 shared market events stored,
reusing the fact-checked XRP targets and date notes). DOGE-specific events, each link opened/read on 2026-10-28:

- TechCrunch (Dogewallet hacked, 2013-12-25); PBS NewsHour (Dogesled for the Jamaican bobsled team, Jan 2014); CoinDesk
  (merge mining with Litecoin from block 371337, 2014-09-11; Reddit/WSB rally 2021-01-28; Trump picks Musk for D.O.G.E.,
  announced Tuesday 2024-11-12); Cryptoast quoting Binance (DOGE pairs open 2019-07-05 12:00 UTC).
- NBC News (DOGE fell up to 29.5 % during Musk's SNL appearance, 2021-05-08 US time); Phys.org/AFP (DOGE-1 announced
  2021-05-09); The Block (Coinbase Pro trading from 2021-06-03; Grayscale GDOG debut 2025-11-24; record liquidations
  2025-10-10); Investing.com/Reuters (Tesla merch in DOGE, 2022-01-14); The Star/Reuters + Decrypt (DOGE doubled after
  Musk completed the Twitter deal, late Oct 2022 — label on 2022-10-28); Fortune (Twitter logo swapped to Doge, Monday
  2023-04-03); Semafor (Kabosu died 2024-05-24); Cointelegraph + Decrypt ($258B lawsuit dismissed 2024-08-29);
  CF Benchmarks (DOJE listed 2025-09-18); Yahoo Finance (21Shares TDOG on Nasdaq 2026-01-22); SEC EDGAR 8-K of House of Doge
  (Dogecoin Foundation licence terminated effective 2026-10-19). DOGE > $0.10 / $0.50 are first daily highs in the data.

Not added: SEC/CFTC "digital commodity" interpretation of 2026-03-17 (the Federal Register text does not name Dogecoin;
only company filings say so), the NASCAR Talladega car (sources could not be opened), Grayscale/Bitwise dates other than
GDOG, House of Doge listing, and other items without a dated, opened source. Levels assigned on the user's request:
6 level 2, 14 level 1, 35 level 0 visible (after the expansion below); 37 general-market or follow-up rows kept with `remove=true`
(`removals-20261028.json`), the policy the user approved for XRP group A. Not a claim of complete coverage.

## Logo and colours

Official Dogecoin coin logo from the Dogecoin Core repository (`share/pixmaps/dogecoin256.svg`, the same mark as the
dogecoin.com app icon), saved unchanged as `logo.svg`, rasterised onto a transparent 1024×1024 `logo.png`;
`logo-negative.png` by the documented ffmpeg command. Colours: the DOGE row of `coins/README.md` (bronze gold); awaits approval.

## Expansion — 2026-10-28 (10 more events, requested by the user, awaiting approval)

Each link opened/read: CoinDesk (Doge4Water drive announced 2014-03-11; Dogecoin Foundation revived 2021-08-17), TechCrunch
(Moolah announces shutdown 2014-10-14), Investing.com/Benzinga (Musk's first DOGE tweet, 2019-04-02), Fortune (TikTok
challenge, DOGE up ~95 % from 2020-07-06; label 2020-07-07), Entrepreneur (Musk's "people's crypto" tweet, 2021-02-04),
Cointelegraph (Bitwise S-1 for a spot DOGE ETF 2025-01-28; CleanCore $175M DOGE treasury 2025-09-02). DOGE > $0.001
(2017-05-06) and > $0.01 (2017-12-25) are first daily highs in the TradingView data. Not added: fixed 10,000 DOGE block
reward and Digishield fork (no dated source), Jackson Palmer's 2015 exit (no source found).

