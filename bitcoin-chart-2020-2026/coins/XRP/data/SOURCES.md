# XRP film sources

Prepared 2026-10-27. Event labels describe historical happenings without assigning price causation.
XRP the asset is distinct from Ripple the company. The logo is XRP's X symbol, not Ripple's corporate mark.

## Prices

Compared TradingView `INDEX:XRPUSD` (invalid), `CRYPTO:XRPUSD` and `BITSTAMP:XRPUSD` (both 4,806 candles beginning
2013-08-04). Selected `CRYPTO:XRPUSD` for the full USD history. Excluded the unfinished 2026-10-27 UTC candle.
Saved 4,805 actual candles through 2026-10-26. The 4,832-day timeline has 27 missing days; the existing generator
fills these with flat interpolated candles and explicitly marks them `est` in `xrp-daily.csv`. No synthetic anchors
are supplied. All ATH/ATL labels and amounts come from this TradingView input and the unchanged phase detector.

## Events

Search did not locate a dedicated 99Bitcoins XRP event timeline; its XRP historical-price URL was inaccessible to
the web tool. Use these primary sources and the project's already verified shared-market timeline instead (§11).

| Date | Event | Source |
| --- | --- | --- |
| 2017-03-31 | Escrow and payment channels activation | https://xls.xrpl.org/xls/XLS-0011-retiring-amendments.html (actual activation; advance blog estimated March 30) |
| 2017-12-08 | Ripple locks 55B XRP in escrow | https://ripple.com/insights/ripple-escrows-55-billion-xrp-for-supply-predictability/ |
| 2018-10-01 | xRapid commercial launch | Ripple's court-filed answer, paragraph 363: https://docs.justia.com/cases/federal/district-courts/new-york/nysdce/1%3A2020cv10832/551082/51 |
| 2020-12-22 | SEC complaint against Ripple | https://www.sec.gov/newsroom/press-releases/2020-338 |
| 2022-10-31 | XLS-20 NFTs activated | https://xrpl.org/blog/2022/non-fungible-tokens-are-now-available (published Nov 1; actual activation Oct 31) |
| 2023-07-13 | Mixed summary judgment ruling | https://www.sec.gov/files/litigation/litreleases/2025/settlement-agreement-26306.pdf and https://law.justia.com/cases/federal/district-courts/new-york/nysdce/1%3A2020cv10832/551082/973/ |
| 2024-03-22 | AMM activation | https://xrpl.org/blog/2024/amm-status-update |
| 2024-08-07 | Final judgment and $125M civil penalty | https://law.justia.com/cases/federal/district-courts/new-york/nysdce/1%3A2020cv10832/551082/973/ |
| 2024-10-02 | SEC notice of appeal | https://www.reuters.com/technology/sec-appeals-decision-that-restricted-its-crypto-oversight-2024-10-02/ |
| 2024-12-17 | Ripple USD launch | https://ripple.com/ripple-press/raising-the-standard-for-stablecoins-ripple-usd-launches-globally/ (Dec 16 announcement says available Dec 17) |
| 2025-08-07 | Joint dismissal of appeals | https://www.sec.gov/enforcement-litigation/litigation-releases/lr-26369 |

The July ruling was mixed, not a blanket ruling on every XRP sale. The appeals dismissal left the final judgment
and penalty intact. The short labels preserve those distinctions and do not claim the penalty was cancelled.

Shared market events (China bank/ICO/exchange restrictions, Mt. Gox, COVID, China crypto restrictions, LUNA, FTX)
retain the dates from the project's verified `data/events.csv`, sourced from
https://99bitcoins.com/cryptocurrency/bitcoin/historical-price/. COVID label omits the Bitcoin-specific price change.

## Logo and proposed palette

- Official asset found on https://xrpl.org/about/xrp :
  https://xrpl.org/assets/xrp-symbol-black.8ecaf7670b5ebd82b8283c9eae4388cff60ec37c3a57351436b36eeeee131dd8.c92cfbea.svg
- Retained original SVG; rasterized without changing proportions onto transparent 1024×1024 PNG. Negative generated
  using the project's documented ffmpeg command.
- Steel-gray palette is the XRP row in `coins/README.md`; awaits user approval.

Missing input dates (filled and marked estimated):

2016-12-17, 2016-12-18, 2016-12-20, 2016-12-21, 2016-12-23, 2016-12-24, 2016-12-25, 2016-12-26, 2016-12-27, 2016-12-28, 2016-12-29, 2016-12-30, 2016-12-31, 2017-01-01, 2017-01-02, 2017-01-04, 2017-01-05, 2017-01-06, 2017-01-07, 2017-01-08, 2017-01-10, 2017-01-11, 2017-01-12, 2017-01-13, 2017-01-14, 2017-01-15, 2017-01-16.

## Supplemental level-0 collection (requested 2026-10-27)

56 new entries are saved in `events.csv`; each has a matching record in `level0-sources.json` with sources, scope,
notes, and (where applicable) underlying amendment names and mainnet activation transaction links.
46 entries group amendment activations on the same date, from the official XRPL documentation snapshot pinned at
commit `841327bca5e5cc20de9813541fcbbbcc6a2914ca`. Dates already covered by the existing Escrow, NFT and AMM labels
are excluded. Ten further entries cover official adoption/corporate announcements, FinCEN enforcement, and native USDC.

The pinned amendment source ends at 2025-05-15; this is not a claim of exhaustive minor-event coverage through 2026.
No missing dates are invented. Announcement dates are distinguished from incorporation or actual service rollout.
Ripple corporate partnerships do not automatically imply XRP use; records explicitly note that distinction.
Level-0 assignment is a provisional editorial research classification, not an externally verified impact measure.

Visible video input remains byte-for-byte identical after `COIN=XRP node make-data.js --strict`, because the existing
generator filters hit 0. The already kept XRP previews remain valid; no picture or audio rerender is required for this
research-only addition. Showing level 0 in the film requires a separate requested display change and preview.
