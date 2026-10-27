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
