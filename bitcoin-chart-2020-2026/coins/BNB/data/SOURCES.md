# BNB film sources

Prepared 2026-10-27. Event labels describe happenings, not claims of price causation.

## Prices

Compared TradingView symbols with the existing `fetch-tradingview.js --print`:
- `INDEX:BNBUSD`: invalid symbol.
- `CRYPTO:BNBUSD` and `BINANCE:BNBUSD`: 3,393 daily candles, 2017-07-14–2026-10-27.
- `BINANCE:BNBUSDT`: 3,278 candles, 2017-11-06–2026-10-27.

Selected `CRYPTO:BNBUSD` for the USD pair and longest available history. Removed the unfinished current UTC day's
candle. Saved 3,392 actual candles, 2017-07-14–2026-10-26, without gaps or synthetic anchors. Prices on labels and
ATH/ATL turns come solely from these candles. TradingView fetch uses the cloud's configured HTTP proxy.

## Events

The 99Bitcoins BNB historical-price URL could not be retrieved by the web tool; no BNB-specific 99Bitcoins timeline
was available in search. Use these official sources instead, as permitted by PROJECT.md §11:

- Binance Chain mainnet, 2019-04-18: https://www.binance.com/en/blog/all/327036304672833536
  (mainnet launch is distinct from the public token swap on April 23).
- Smart Chain launch, 2020-09-01: https://www.bnbchain.org/en/blog/binance-smart-chain-2020-recap-building-the-defi-infrastructure
- BNB Chain rebrand, 2022-02-15: https://www.bnbchain.org/en/blog/bsc-is-now-bnb-chain-the-infrastructure-for-the-metafi-universe
- Mainnet upgrade dates (Bruno/BEP-95; Euler; Moran; Gibbs; Planck; Luban; Plato; Hertz; Kepler; Feynman; Tycho/Haber;
  Bohr; Pascal; Lorentz; Maxwell; Fermi; Mendel; Pasteur): https://forum.bnbchain.org/t/bnb-chain-roadmap-mainnet/936
  Only completed mainnet activations are included, not testnets or proposed upgrades. Nano emergency suspension is
  dated October 6, 2022 in this roadmap; the Token Hub label uses that incident date rather than the next-day report.
- Token Hub incident context: https://www.bnbchain.org/en/blog/bnb-chain-ecosystem-update
- opBNB public mainnet, 2023-09-13: https://www.bnbchain.org/en/blog/opbnb-mainnet-is-live
- SEC complaint, 2023-06-05 (charges, not a judgment): https://www.sec.gov/newsroom/press-releases/2023-101-sec-files-13-charges-against-binance-entities-founder-changpeng-zhao
- Binance guilty plea and CZ resignation, 2023-11-21: https://www.justice.gov/criminal/case/united-states-v-binance-holdings-limited-dba-binancecom
  and https://www.justice.gov/archives/opa/pr/binance-and-ceo-plead-guilty-federal-charges-4b-resolution
- Shared market events: China ICO/exchange restrictions, Binance exchange hack, COVID crash, China crypto restrictions,
  LUNA collapse, FTX bankruptcy: dates from the existing verified Bitcoin `data/events.csv`, sourced from
  https://99bitcoins.com/cryptocurrency/bitcoin/historical-price/. COVID label omits the BTC-specific price change.

## Logo and proposed colors

- Official brand catalog: https://www.bnbchain.org/en/brand-guidelines (found via web search).
- Original yellow symbol: https://www.bnbchain.org/images/brand-guidelines/svg/BNB%20Chain_Symbol_Yellow.svg
- Catalog explicitly permits the logomark as an expression for the BNB token. Rasterized the original SVG to transparent
  1024×1024 PNG; negative produced with `ffmpeg -vf negate=negate_alpha=0` as required by the project.
- Amber glow palette uses the exact BNB row in `coins/README.md`; awaits user approval.

## 99Bitcoins completeness audit — 2026-10-27

Supersedes the earlier guessed-URL-only search: canonical historical paths redirect to Bitcoin. The actual coin page
contains price data but zero historical-event-table entries. Sitemap discovery and per-URL status evidence are saved
in `../../../data/source-audits/99bitcoins/discovery.json`. Every one of the 234 BTC source entries has an explicit
coin relevance decision in `99bitcoins-coverage.json`; applicable shared/coin-specific context is stored, missing
entries added as level 0. Excluded BTC-only items remain in the shared snapshot. No claim of an exhaustive dedicated
altcoin timeline or all news coverage. Source-date conflicts are explicitly flagged in the coverage file.

## Quy tắc hiển thị mới — 27/10/2026

PROJECT.md §14 thay thế ghi chú hiển thị cũ: thu thập đủ 0/1/2 cho mọi coin; BTC ẩn 0, mọi altcoin hiện đủ 0/1/2.
Mức 0 là nhãn nhỏ/xám không SFX, tham gia chống chồng lấn. Audit và các nguồn dữ liệu vẫn được giữ nguyên.

## Completeness review — 2026-10-27

Cross-checked the 74 stored entries against BNB/Binance history in official pages (SEC, CFTC, NYDFS, Paxos, FCA, US DOJ,
BNB Chain blog) and major press (The Block, TechCrunch, CNBC, Reuters, crypto.news, ForkLog). Added 18 entries; levels
approved by the user on 2026-10-27 (level 2: BNB > $1K; level 1: 12 entries, of which DEX swap and Greenfield are
tagged `mainnet` and Beacon Chain sunset `upgrade`; level 0: Launchpad BTT, UK FCA, FTX LOI, CZ released, VanEck ETF).
Per-event links in `event-sources.csv`:

- 2017-07-14 Binance opens; BNB trades (ForkLog; first TradingView CRYPTO:BNBUSD candle)
- 2019-01-28 Launchpad BTT sells out · 2019-04-23 Binance DEX + BNB swap (DEX launch and ERC-20→BEP2 swap reported that day)
- 2021-06-26 UK FCA restricts Binance (consumer warning; the supervisory notice is dated 2021-06-25)
- 2022-11-08 Binance LOI to buy FTX · 2022-11-09 Binance drops FTX deal
- 2023-02-13 BUSD minting halted (Paxos + NYDFS; minting stopped from Feb 21) · 2023-03-27 CFTC sues Binance
- 2023-10-17 Greenfield mainnet · 2024-11-19 Beacon Chain sunset (final halt at block 384,544,850, 06:00 UTC)
- 2024-04-30 CZ sentenced: 4 months · 2024-09-27 CZ released (from a halfway house, per the Bureau of Prisons)
- 2025-03-12 MGX invests $2B in Binance · 2025-05-02 VanEck files BNB ETF (S-1) · 2025-05-29 SEC drops Binance case
- 2025-09-18 BNB > $1K (first daily high ≥ $1,000 in the TradingView data; first close ≥ $1,000 on 2025-09-20)
- 2025-10-10 Record crypto liquidations · 2025-10-23 CZ pardon announced (DOJ pardon document dated 2025-10-21)

Not added: the first quarterly BNB burn (2017-10-18, 986,000 BNB) — only aggregator/forum sources found, no official
Binance page; later quarterly burns (routine); BNB Standard's Nasdaq bell (2026-10-26, last data day, single fresh
report); the planned new L1 (documentation of a plan, not an event). This review is not a claim that every event in
BNB's history is now covered.

## Level review — 2026-10-27 (approved by the user)

- Upgrades whose label is only a name drop to level 0 (tag and colour kept): Euler, Planck, Luban, Hertz, Kepler, Bohr,
  Pascal, Mendel, Pasteur. Upgrades whose label says what changed stay level 1.
- Block-time cuts are one kind of performance upgrade: Maxwell (0.75s) and Fermi (0.45s) 2 → 1, like Lorentz (1.5s).
- BNB Chain rebrand 1 → 0 (a name change).
- Totals: 92 entries — 12 level 2, 24 level 1, 56 level 0 (plus generated ATH/ATL labels).

