# Solana film sources

Prepared 2026-10-28. Prices and price milestones come only from the saved TradingView daily candles.

## Prices

Compared TradingView symbols with `fetch-tradingview.js --print`: `INDEX:SOLUSD` invalid; `CRYPTO:SOLUSD` and
`BINANCE:SOLUSD` 2,393 candles from 2020-04-10; `BINANCE:SOLUSDT` 2,270 from 2020-08-11; `COINBASE:SOLUSD` 1,960 and
`KRAKEN:SOLUSD` 1,958 from June 2021; `BITSTAMP:SOLUSD` 1,527 from 2022-08-24. Selected `CRYPTO:SOLUSD` (USD pair,
longest history, same choice as BNB/XRP). Removed the unfinished 2026-10-28 UTC candle: **2,392 actual candles,
2020-04-10 → 2026-10-27, no missing day, no estimated fill, every candle passes low ≤ open/close ≤ high.**
Cross-check of daily closes: vs `COINBASE:SOLUSD` 1,959 common days, median difference 0.023 %, max 1.2 %;
vs `BINANCE:SOLUSDT` 2,269 days, median 0.046 %, max 1.2 % (June 2023). Highest high $295.11 on 2025-01-19.

## Events

99Bitcoins has no SOL timeline (its altcoin history paths redirect to Bitcoin; see the shared discovery file), so the
234 Bitcoin source IDs were dispositioned in `99bitcoins-coverage.json` (156 before SOL history, 63 not applicable,
15 shared market events stored). SOL-specific events come from official and major sources, each linked per row in
`event-sources.csv` and opened/read on 2026-10-28:

- Solana Foundation outage reports and postmortems (solana.com/news) for the 2020, 2021, 2022, 2023 and 2024 outages;
  solana.com/upgrades/alpenglow for the Alpenglow mainnet activation (epoch 1064, 2026-10-21).
- SEC: Binance complaint (Case 1:23-cv-01599, filed 2023-06-05; ¶364 names SOL); Silvergate 8-K (2023-03-08);
  Federal Register for the US executive order (signed 2022-03-09).
- Issuers/exchanges: Binance (SOL pairs opened 2020-04-10), REX Shares (SSK, 2025-07-02), Bitwise (BSOL, trading 2025-10-28).
- Press, cross-checked: The Block, Cointelegraph, Decrypt, The Defiant, Merkle Science.

Date notes: Slope wallet draining began late on 2022-08-02 UTC and was reported on 2022-08-03 (label 08-03).
TRUMP launched 2025-01-18 (not 01-17). The SEC/Binance status report setting aside SOL is dated 29 or 30 July 2024
across outlets (label 07-29; the court deadline was 07-29). CME futures were announced 2025-02-28, launched 2025-03-17.
The Alpenglow vote results were published 2025-09-02. Mainnet Beta (March 2020) is not stored: the official page only
says "March", and it is before the price data.

Levels assigned on the user's request (2026-10-28). First list (42 rows) approved; the user then asked for more events,
so 21 more were added and cross-checked the same day (see below). Now 63 rows: 8 level 2, 25 level 1, 23 level 0 visible. Seven general-market or
follow-up rows are kept with `remove=true` (`removals-20261028.json`), the same policy the user approved for XRP group A.
Not a claim that every event in Solana's history is covered.

## Logo and colours

Official logomark from https://solana.com/branding (`solanaLogoMark.svg`), kept as `logo.svg`, rasterised unchanged
onto a transparent 1024×1024 `logo.png`; `logo-negative.png` by the documented ffmpeg command. Colours: the SOL row of
`coins/README.md` (purple #B57BFF / teal #7EE8FF, glow #9945FF); awaits the user's approval.

## Expansion — 2026-10-28 (21 more events, approved by the user)

Each link opened/read on 2026-10-28: The Block (Serum announced 2020-07-27; Tether USDT on Solana 2020-09-09 — the Solana
Foundation post is dated 09-08; DeGods/y00ts bridge plan published 2022-12-26 for the 12-25 announcement; Robinhood
delisting 2023-06-09; PUMP sale 2025-07-12; SEC generic listing standards 2025-09-17), Visa press release (USDC settlement
on Solana, 2023-09-05), TechCrunch (Shopify + Solana Pay, 2023-08-23), CryptoSlate (Saga unveiled 2022-06-23), Yahoo
Finance/CoinDesk (BONK debuted 2022-12-25), Decrypt (Jito airdrop 2023-12-07; LIBRA promoted late Friday 2025-02-14),
CoinDesk (Jupiter airdrop 2024-01-31; v1.17.31 congestion fix 2024-04-15; Brazil CVM ETF approval disclosed 2024-08-07),
Blockhead (Canadian spot SOL ETFs trading 2025-04-16), Grayscale release (GSOL on NYSE Arca 2025-10-29), solana.com Agave 4.2
page (200 ms slot time at epoch 1053, 2026-10-09). SOL > $10 (2021-02-19) and SOL > $200 (2021-09-09) are first daily highs in the TradingView data. Coinbase Pro
listing: Forkast and Cryptonews Australia (deposits 2021-05-20, trading 2021-05-24). Raydium launch (Feb 2021) not added:
its sources could not be opened.
Not added: USDC on Solana (only an announcement date), Fidelity FSOL (18 vs 19 Nov conflict), the 2022 January
congestion (durations conflict), the Mainnet Beta date (no official day), the FTX estate SOL unlock (no reliable date).

