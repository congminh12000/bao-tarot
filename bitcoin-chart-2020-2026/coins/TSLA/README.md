# Tesla — long candlestick price history

**Current event selection approved for the requested full-data preview. Preview rendered/uploaded; awaiting visual feedback. No final requested.**

- [Review all 176 retained / 455 removed events](event-review.md), including dates, levels, selection reasons and citations.
- [Quarter-by-quarter coverage](quarter-coverage.md): every earnings report from 2010 Q2 through 2026 Q3; 47 separate delivery releases; 11 delivery discussions embedded in earnings. Eight early Roadster quarters have financial context, without a verified comparable standalone delivery series.
- [Sources and known limits](SOURCES.md). 631 research rows, 1,280 citation rows, all 591 currently discovered IR archive entries accounted for. This is a curated history, not a claim that all potentially relevant news has been discovered.

## Price and timeline

TradingView `NASDAQ:TSLA`, daily regular-session OHLC, split-adjusted, **2010-06-29 → 2026-10-28**. This is the latest completed session at research time, 2026-10-29 morning UTC. 4,109 source candles match 4,109 scheduled sessions, with no missing or extra dates. An additional 1,857 closed calendar dates hold the previous close for HUD/camera timing only; they do not draw candles and are not estimates.

Prices retain six decimals internally; labels/HUD show dollars and cents. The $17 IPO offer is an unadjusted offering price, not the first candle's open. The 5:1 and 3:1 splits apply to the entire history; their effective dates never create artificial price crashes.

Independent Yahoo comparison covers 16,436 OHLC fields. Five fields on 2014-08-14, 2018-03-13 and 2018-03-16 differ by >0.5%; the largest relative difference is 4.73%. **Those discrepancies remain unresolved.** Raw TradingView prices are preserved, not silently replaced. See [price-audit.json](data/price-audit.json).

The exchange calendar records timezone/DST and early closes. The pinned package aliases XNAS to the XNYS US-equity schedule; this is explicitly documented and checked against every actual candle, not presented as a separately implemented Nasdaq calendar. Extend the calendar before future fetches.

## Phases and proposed look

Same 45% reversal / minimum 45 calendar days / ±7-day wick seating as the long film; only real sessions may supply pivots. Nine phases (five up / four down), nine distinct approved-library cues. Eight generated turn labels are additional to the 176 research events:

| Date | Type | Split-adjusted USD |
|---|---|---:|
| 2014-09-04 | ATH | 19.427981 |
| 2016-02-09 | CYCLE LOW | 9.403324 |
| 2017-09-18 | ATH | 25.973974 |
| 2019-06-03 | CYCLE LOW | 11.799448 |
| 2021-11-04 | ATH | 414.496252 |
| 2023-01-06 | CYCLE LOW | 101.81 |
| 2024-12-18 | ATH | 488.5399 |
| 2025-04-07 | CYCLE LOW | 214.25 |

A cycle low is not an all-time low. Initial price history stays available when determining labels in a later preview cut. Calendar-closed dates display `MARKET CLOSED · LAST CLOSE`; all prices disclose `SPLIT-ADJUSTED · USD`.

Proposed palette: Tesla red, near-black background, soft red/white glow; official Tesla **wordmark** extracted from Tesla IR, [provenance](logo-provenance.json). Visual approval is still required. This v1 supports long candlestick mode only; equity Shorts are deliberately blocked until separately designed/reviewed.

## Generate and validate without rendering

```sh
python3 -m pip install -r requirements-equity.txt
COIN=TSLA python3 fetch-equity-calendar.py --from 2010-06-29 --to 2027-12-31
COIN=TSLA node fetch-tradingview.js
COIN=TSLA python3 audit-equity-prices.py   # fetch Yahoo, refresh comparison + audit hashes
COIN=TSLA node make-data.js --strict
COIN=TSLA node check-equity.js
COIN=TSLA node --test test-equity.js
COIN=TSLA node review-equity.js
node check-event-sources.js --all
```

Run from the project root. A cloud proxy may require an environment-specific WebSocket dispatcher; do not store proxy credentials in this repo. `check-equity.js` without `--strict` audits research while approval is pending. `--strict` / `audit-asset.js` / `npm run build` block pending or stale approval. Source dates and unknown publication times remain visible; no fabricated intraday timestamps.

After the user approves this exact event list, record `status: approved`, `eventHash` from `equity.reviewState(dataDir)`, and the user's approval evidence in `data/review-state.json`, regenerate the full dataset and re-run strict audit. An event/source/detail change invalidates approval. Rendering checks both generated and live hashes. Then generate music, run label checks, produce a short 480p 16:9 60 fps preview, get preview approval, and only render a final if requested. No Tesla visual, label-layout, encoded-audio or full-render QA is claimed yet.

Research does not replace the existing generated long-film dataset/music as a deliverable. Regenerate with `COIN=TSLA` after approval, or use isolated working files; never leave a FROM/TO cut active. Retain every preview/final and use the already authorized Drive fallback if video attachment is unavailable.

## User selection update

Five previously removed level-0 items were explicitly restored by the user: website launch (2010-07-13), Supercharger launch (2012-09-24), Motor Trend award (2012-11-12), US/Canada Supercharger expansion (2013-05-30), and Cybertruck delivery-event details (2023-11-28). Their original levels/dates/text remain unchanged. `minVisibleHit: 0` allows these explicitly kept level-0 items to display quietly; all other remove flags remain unchanged. Current selection: **176 kept (5 / 135 / 36 at levels 0 / 1 / 2), 455 removed**, plus 8 generated turn labels. Full-data preview rendered after the subsequent explicit user request.

## Full-data preview delivered

[Watch on Drive](https://drive.google.com/file/d/1IvkPyd_mt-nsredJg1yUHktrc6WZOboR/view?usp=drivesdk): 854×480, 16:9, 60 fps, 542.466667 s, 32,548 frames, 101,680,467 bytes. All 176 selected events + 8 turns are present; 184/184 labels verified visible, no overlaps. Five long labels use [separate display captions](label-captions.json), preserving original events and citations. Mastered AAC measures −16.0 LUFS / −1.1 dBTP. Full-frame PTS/decode, 51 deterministic reference images and 45 master/AAC windows pass. The legacy strongest-onset/flash heuristic flags 11 measurements in layered/neighboring effects; its raw failures are retained, not suppressed, and investigated with direct references. Details: [preview-render.json](data/preview-render.json). Full frames/music/code/QA archived in ignored out/renders/tesla-preview-full-drive-20261029-480p60; source workspace remains isolated, previous root data/music preserved. Await user visual approval before further rendering.
