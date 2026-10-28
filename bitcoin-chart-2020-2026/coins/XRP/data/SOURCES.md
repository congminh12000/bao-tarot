# XRP film sources

Prepared 2026-10-27. Event labels describe historical happenings without assigning price causation.
XRP the asset is distinct from Ripple the company. The logo is XRP's X symbol, not Ripple's corporate mark.

## Current audit — 2026-10-28 (supersedes preparation counts below)

- 484 historical events: 354 level 0 / 114 level 1 / 16 level 2; 1,013 exact source rows, no event missing a citation.
  Automatic editorial grading was requested by the user; levels measure relevance, not proven price impact or certainty.
- `review-20261028.json`: additions, 14 old label/date corrections, 23 old grade changes, qualifications and grading policy.
- `source-inventory-20261028.json`: 232 discovered Ripple archive titles (187 selected full articles), 272 official blog
  documents, selection/duplicate decisions and limits. Archive page 26 remains inaccessible; no claim of exhaustive news.
- `amendment-activations-20261028.json`: 97 dated mainnet activations through 2026-10-09; 96 independently agree with
  XRPSCAN. CryptoConditions is resolved by actual validated majority vs activation transactions: activation 2017-01-03.
- `software-releases-20261028.json`: 133 reviewed stable-version records, including research-only legacy imports.
  Release notices, GitHub publication, voting majority and mainnet activation are distinct dates.
- TradingView `CRYPTO:XRPUSD`: 4,806 actual daily OHLC candles, 2013-08-04–2026-10-27. All prior 4,805 candles unchanged.
  Unfinished October 28 candle excluded. BITSTAMP has the same 27 historical gaps; KRAKEN begins too late to fill them.
  `price-audit-20261028.json` preserves checks, missing dates and raw-file digest. Generated timeline has 4,833 days,
  of which **27 are estimates**, explicitly marked `est`; these are not verified historical prices. No venue mixing.
- One 2013-04-11 funding event precedes the price series and remains research-only for this film; no invented 2012 price.
- Corporate/private-ledger/RLUSD announcements do not necessarily use XRP. Planned deals and cancelled deals are
  distinguished (including cancelled Fortress acquisition). Pre-activation security fixes are not mainnet attacks.
- October 26 2026 final OCC claim is labeled **Ripple reports final OCC approval**, level 0: issuer announcement and
  reporting corroborate the announcement, but direct OCC evidence obtained only establishes the earlier conditional decision.
- Court/ETF/security milestones have primary/counterpart/reporting checks where available. Not every minor issuer
  announcement has two independent publishers; source-count coverage is not a guarantee of independent confirmation.

## Original preparation — prices (2026-10-27)

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

Shared market events initially came from the 99Bitcoins timeline. The 2026-10-28 XRP review independently
corrects fourteen date/wording claims; see `review-20261028.json`. Source-table dates are preserved in the coverage
record and are not automatically treated as occurrence dates. COVID retains no Bitcoin-specific price claim.

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

At the original collection step, video input was byte-for-byte identical because the old generator filtered hit 0.
The user subsequently requested the display change in PROJECT.md §14: XRP now shows level 0 as well, and needs a new
preview. Older previews show only their original selected events and do not validate the new complete label layout.

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
