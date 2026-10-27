# BNB film — Full HD final

Prepared 2026-10-27 following PROJECT.md §11 and `coins/README.md`.

- TradingView `CRYPTO:BNBUSD`: 3,392 actual daily candles, 2017-07-14–2026-10-26; no gaps or synthetic anchors.
- 92 events after the 2026-10-27 completeness review (12 level 2 / 24 level 1 / 56 level 0), with provenance in
  `data/SOURCES.md` and per-event links in `data/event-sources.csv`; labels describe events without asserting price causation.
- 9 phases (5 uptrend, 4 downtrend); unchanged phase detector and thresholds.
- 9 distinct approved cues, deterministically shuffled for BNB; strict no-repeat validation passes.
- Full timeline: 364.714 seconds, approximately 6:05. Final rendered at 1920×1080, 16:9, 60 fps.
- Full-history label validation passes: no overlaps; one older label (Binance acquires CoinMarketCap) leaves early using the approved fallback.
- Official yellow BNB Chain symbol from the brand kit, which identifies it as suitable for the BNB token;
  original SVG retained, transparent 1024×1024 PNG and negative generated for the existing renderer.
- Proposed amber palette: #F3BA2F / #FFE08A, dark amber background, green/red candles, cyan protocol-event labels.

## Preview for review

2022-09-01–2022-11-30: Token Hub exploit and suspension, Moran security fix, FTX bankruptcy.
16:9, 480p, 60 fps, 17.38 seconds. Picture/audio sync verified at all markers.
Decoded AAC: −15.91 LUFS integrated, true peak −1.48 dBTP. Audio assessed by measurements, not listening.

Shareable video: `out/bnb-preview-tokenhub-2022-480p.mp4`.
Kept frames, shareable MP4 and fingerprint: `out/renders/bnb-preview-tokenhub-2022-480p60/`.
Still: `out/stills/t_007.00.png`. These local outputs are ignored by git; they must be shared separately.

The user requested the final with the existing approved dataset and layout. Titles remain draft choices; chapters were reviewed against the final render;
`chapter-names.json` supplies names for the existing chapter generator. Full BNB data and music are restored after preview.

## Reproduce

```bash
COIN=BNB node make-data.js --strict
COIN=BNB node song.js
COIN=BNB node check-labels.js
```

On this cloud host, use `CHROME_PATH` pointing to a Chromium wrapper with `--no-sandbox`.
Cloud policy blocks `file://` navigation, so the full label checker was run unchanged over a temporary localhost HTTP
server (only replacing its navigation URL); no renderer or validation logic was modified. No runtime helper is committed.

## Source audit update — 2026-10-27

Latest totals and source scope supersede earlier preparation counts above: see `../../data/source-audits/99bitcoins/README.md`.
All 234 source IDs reviewed for this coin in `data/99bitcoins-coverage.json`, with stored targets or exclusion reasons.
All previous official-source and level-1/2 events are preserved; supplementary level-0 entries are now rendered for this altcoin under PROJECT.md §14.

## Quy tắc hiển thị mới — 27/10/2026

PROJECT.md §14 thay thế ghi chú hiển thị cũ: thu thập đủ 0/1/2 cho mọi coin; BTC ẩn 0, mọi altcoin hiện đủ 0/1/2.
Mức 0 là nhãn nhỏ/xám không SFX, tham gia chống chồng lấn. Audit và các nguồn dữ liệu vẫn được giữ nguyên.

## Final — 2026-10-27

Rendered from `36cba8b0` with the full BNB-generated `btc-data.js`; no picture, event or music changes during rendering.
User selected BNB, 16:9 and Full HD; the required frame rate is 60 fps.

- Final: `out/bnb-final-20261027-16x9-1080p.mp4`, 364.716667 s, 21,883 frames, 577,417,026 bytes.
- H.264 high profile, original CRF-14 medium picture retained without another video encode; AAC stereo 256 kb/s, faststart.
  Audio is 364.714 s; the 0.003 s difference is below one frame. No `-shortest` truncation of the final video frame.
- All 92 source events (56 / 24 / 12) displayed, plus 8 generated ATH/ATL labels: 100 labels. Nine phases and nine distinct approved cues.
- Full decode confirms 21,883/21,883 frames. Packet timestamps cover every frame exactly once, with increasing DTS.
- After a cloud-session interruption, 12,987 existing encoded frames were recovered without re-encoding; 8,896 missing frames
  rendered with the original engine settings. Six distributed samples and both sides of all three joins match the original
  renderer at exactly the expected frame (PSNR >36 dB). Recovery helpers and evidence are in ignored `out/bnb-recovery/`.
- YouTube: `youtube.md`; 21 chapter groups cover all 40 ATH/ATL, hit-2 and protocol markers. Reviewed 61 frames extracted
  from the encoded timeline (each chapter start and each event +1 s); evidence: `out/bnb-chapter-check/manifest.json`.
- Decoded AAC: −16.0 LUFS integrated, 4.5 LU LRA, true peak −1.3 dBTP. Measured, not assessed by listening.
- Final `verify`: all 21 audio/picture markers pass (sound rounds to 0 ms error, picture 0 frames); no unclear markers.
- Kept render: `out/renders/bnb-final-20261027-1080p60/` (fingerprint `ecab9dc51721f82c`). All local media are ignored by git and must be shared separately.

The source audit covers the 234-entry 99Bitcoins Bitcoin timeline and the recorded BNB-specific citations;
it does not certify that every historical BNB event exists in the dataset. Existing source-date review flags remain documented.
