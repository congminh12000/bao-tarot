# Ethereum film — final rendered

Prepared 2026-10-27 following PROJECT.md §11 and the palette in `coins/README.md`.

- Input: TradingView `INDEX:ETHUSD`, 2015-08-07 through 2026-10-26; 4,094 actual candles and five explicitly marked gap fills.
- Events: 79 entries (53 level 0, 12 level 1, 14 level 2), all visible under the altcoin rule; 14 additional generated ATH/ATL labels.
- Five missing official ETH milestones added; US crypto order and Silvergate liquidation dates corrected. Primary evidence
  is in `data/corrections-20261027.json`; original 99Bitcoins dates remain archived in `data/99bitcoins-coverage.json`.
- Phases: 15 (8 uptrends, 7 downtrends), generated with the existing detector and its unchanged thresholds.
- Music: 15 distinct approved cues, deterministically shuffled for ETH; strict no-repeat validation passes.
- Full film timeline: 439.706 seconds, approximately 7:20. Final rendered on 2026-10-27; details below.
- Latest full-history label check after corrections: no overlaps, no earlier labels forced out.
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

## Corrected-data preview — 2026-10-27

2022-02-01–2022-10-15, 38.92 seconds, 16:9, 480p, 60 fps. Shows the corrected US executive-order date,
Gray Glacier, Bellatrix, and The Merge. Picture/audio sync verified at every marker.
Video: `out/eth-preview-corrected-events-480p.mp4`; kept frames and metadata:
`out/renders/eth-preview-corrected-events-480p60/`. Full ETH data/music restored afterwards. Superseded by the authorized final below.

## Final — 2026-10-27

Authorized settings: full ETH dataset, 16:9, Full HD 1920×1080, 60 fps.

- File: `out/eth-final-20261027-16x9-1080p.mp4`, 439.700 seconds, 26,382 frames, 368,808,859 bytes.
- Kept render: `out/renders/eth-final-20261027-1080p60/`; fingerprint `7c2f68eedba542a1`.
- Includes all 79 historical entries (0/1/2) plus 14 generated ATH/ATL labels. All 15 approved cues are distinct.
- Strict music validation and full label check pass; no overlapping labels and no forced early label exits.
- Every sync marker passes picture/audio verification. Final AAC: −16.0 LUFS, peak −1.3 dBTP, LRA 4.5 LU.
- Full ETH data/music remain in place. Original BTC data and kept renders are preserved.
- Source audit: saved-snapshot reconciliation passes for all four configured coins, 234/234 source IDs each.
  Live audit was attempted twice; 99Bitcoins returned HTTP 403. This render does not certify current live source
  coverage or the completeness of all Ethereum/world history. Five early daily candles remain marked estimated.
- YouTube draft and chapter times: `youtube.md`; title options await the user's choice. Chapter frame pairs and
  verification metadata are retained in `out/eth-final-20261027/`.
