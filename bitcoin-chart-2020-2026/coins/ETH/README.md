# Ethereum film — preview awaiting approval

Prepared 2026-10-27 following PROJECT.md §11 and the palette in `coins/README.md`.

- Input: TradingView `INDEX:ETHUSD`, 2015-08-07 through 2026-10-26; 4,094 actual candles and five explicitly marked gap fills.
- Events: 26 curated entries; primary-source provenance and the unavailable 99Bitcoins ETH timeline are documented in `data/SOURCES.md`.
- Phases: 15 (8 uptrends, 7 downtrends), generated with the existing detector and its unchanged thresholds.
- Music: 15 distinct approved cues, deterministically shuffled for ETH; strict no-repeat validation passes.
- Full film timeline: 439.706 seconds, approximately 7:20. No full film has been rendered.
- Full-history label check: no overlaps, no earlier labels forced out.
- Official transparent logo: `logo.svg` from ethereum.org, rasterized to `logo.png` (1024×1024); negative generated with ffmpeg.
- Proposed colors: indigo #8A92FF / pale violet #C3C8FF, dark violet background, green/red candles, gold upgrade labels.

## Preview delivered for review

2016-05-01 through 2016-08-15, 16:9, 480p, 60 fps, 19.18 seconds: the DAO hack, cycle high and DAO fork.
Saved locally as `out/renders/eth-preview-dao-2016-480p60/`; shareable file `out/eth-preview-dao-480p.mp4`.
Picture/audio sync verified; integrated loudness −16.0 LUFS; decoded AAC true peak −1.4 dBTP.
Awaiting user approval of the logo, palette and layout. Final YouTube title and chapters will be reviewed against the final timeline.

## Commands

```bash
COIN=ETH node make-data.js --strict
COIN=ETH FPS=60 node song.js
COIN=ETH FPS=60 node check-labels.js
```

Full ETH data and music are restored after the preview. Preserve the BTC exports and kept renders.

## Source audit update — 2026-10-27

Latest totals and source scope supersede earlier preparation counts above: see `../../data/source-audits/99bitcoins/README.md`.
All 234 source IDs reviewed for this coin in `data/99bitcoins-coverage.json`, with stored targets or exclusion reasons.
All previous official-source and level-1/2 events are preserved; supplementary level-0 entries are now rendered for this altcoin under PROJECT.md §14.

## Quy tắc hiển thị mới — 27/10/2026

PROJECT.md §14 thay thế ghi chú hiển thị cũ: thu thập đủ 0/1/2 cho mọi coin; BTC ẩn 0, mọi altcoin hiện đủ 0/1/2.
Mức 0 là nhãn nhỏ/xám không SFX, tham gia chống chồng lấn. Audit và các nguồn dữ liệu vẫn được giữ nguyên.
