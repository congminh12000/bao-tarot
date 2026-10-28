# TRON (TRX) film sources

Prepared 2026-10-28. Prices and price milestones come only from the saved TradingView daily candles.

## Prices

Compared TradingView symbols with `fetch-tradingview.js --print`: `INDEX:TRXUSD` invalid; `CRYPTO:TRXUSD` 3,333 candles
from 2017-09-13; `BINANCE:TRXUSD` 3,285 from 2017-10-31; `HUOBI:TRXUSDT` 3,156 from 2018-03-08; `BINANCE:TRXUSDT` 3,062
from 2018-06-11; `POLONIEX:TRXUSDT` 2,542 from 2019-11-12. Selected `CRYPTO:TRXUSD` (USD pair, longest history, same
choice as BNB/XRP/SOL). Removed the unfinished 2026-10-28 UTC candle: **3,332 actual candles, 2017-09-13 → 2026-10-27,
no missing day, no estimated fill, every candle passes low ≤ open/close ≤ high.** Cross-check of daily closes vs
`BINANCE:TRXUSDT`: 3,061 common days, median difference 0.11 %, p99 3.2 %, max 7.7 % (2018–2019, index vs one
exchange). `HUOBI:TRXUSDT` differs more (median 1.3 %), so it was not used. Highest high $0.44948 on 2024-12-04.

## Events

99Bitcoins has no TRX timeline (altcoin history paths redirect to Bitcoin; see the shared discovery file), so the 234
Bitcoin source IDs were dispositioned in `99bitcoins-coverage.json` (69 before TRX history, 117 not applicable, 48 shared
market events stored). TRX-specific events, each link opened/read on 2026-10-28 (per-row links in `event-sources.csv`):

- Mainnet: Yahoo Finance/CoinDesk (Odyssey 2.0 launched 2018-05-31 00:00 UTC); CoinGape (mainnet initiated 2018-06-25,
  "Independence Day"; the TRON Foundation Medium post could not be fetched).
- TechCrunch (BitTorrent officially part of TRON, 2018-07-24); The Block (BTT Launchpad sale 2019-01-28; Tether to issue
  USDT on TRON, announced 2019-03-04; Sun wins the Buffett lunch, 2019-06-03; USDT supply on TRON passes Ethereum,
  2021-04-26; SEC and Sun ask to pause the case, 2025-02-26; record liquidations, 2025-10-10).
- CoinDesk (USDD loses its peg, 2022-06-13; SEC and Sun settlement filed, 2026-03-05 — still needed the judge's
  approval at publication); Kitco (Dominica selects TRON, 2022-10-12); Cointelegraph (HTX/Heco bridge hack 2023-11-22;
  60 % fee cut live on 2025-08-29) with Unchained; PYMNTS (Sun invests $30M in WLFI, 2024-11-25); Decrypt (Tron goes
  public via SRM, 2025-06-16); Crypto Briefing (Canary TRXS starts trading on Cboe BZX, 2026-09-09).
- SEC: press release 2023-59 (charges against Justin Sun, 2023-03-22); EDGAR S-1 of the Canary Staked TRX ETF (2025-04-18).

Not added (no reliable date or source could not be opened): whitepaper plagiarism claims (Jan 5/7/9 2018 disagree),
USDD launch (only sponsored or aggregator pages), JustSwap launch (July vs 18 Aug 2020), Steemit sale (source 404),
Poloniex hack (no editorial source opened), Binance.US listing and other 2026 items without a second source.

Levels assigned on the user's request: 6 level 2, 14 level 1, 17 level 0 visible. 30 shared general-market or follow-up
rows are kept with `remove=true` (`removals-20261028.json`), the policy the user approved for XRP group A.
Not a claim that every event in TRON's history is covered.

## Logo and colours

Official icon from the TRON Brand Kit linked by trondao.org (https://tronbrandkit.figma.site/, red #EA0029 mark),
saved unchanged as `logo.svg`, rasterised onto a transparent 1024×1024 `logo.png`; `logo-negative.png` by the documented
ffmpeg command. TRX is not in the palette table: proposed coral #FF7A59 / #FFD1C2 on dark red #1E0A0A → #080303
(kept off the red candle colour), glow #EA0029, special cyan #00E5FF; awaits the user's approval.
