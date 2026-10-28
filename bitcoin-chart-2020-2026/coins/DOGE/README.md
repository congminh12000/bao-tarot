# Dogecoin film — full-history final

Prepared 2026-10-28 following PROJECT.md §11 and the palette in `coins/README.md`.

- Prices: TradingView `CRYPTO:DOGEUSD`, 4,700 actual daily candles 2013-12-15 → 2026-10-27, no gaps (details: `data/SOURCES.md`).
- Events: 92 stored rows, all with sources; 55 shown (6 level 2 / 14 level 1 / 35 level 0), 37 `remove=true`.
- Phases: 9 (5 uptrends, 4 downtrends); ATH $0.0023 · $0.0040 · $0.0188 · $0.739, ATL $0.000086 · $0.00065 · $0.0013 ·
  $0.049. Music: 9 distinct approved cues, `--strict` passes; full timeline ≈ 8:00.
- Label check over the whole film: no overlaps, no early exits; closing still checked by eye.
- Logo: the Doge illustration from dogecoin.com (changed on request 2026-10-28). Colours: DOGE row of the palette table, awaiting approval.
- Event list of 92 approved by the user on 2026-10-28. The preview below is ready; logo, palette and video await review.

```bash
COIN=DOGE node make-data.js --strict && COIN=DOGE FPS=60 node song.js && COIN=DOGE FPS=60 node check-labels.js
```

## Full-history final — 2026-10-28

Requested DOGE / 16:9 / Full HD / 60 fps, retaining the approved events, palette and yellow Doge illustration.
Full saved range 2013-12-15–2026-10-27: 4,700 real daily candles, no gaps, 55 selected events + 8 generated turns,
9 distinct approved cues. All 92 research events have sources; 37 removed rows remain excluded.
Final: `out/doge-final-20261028-16x9-1080p.mp4`; kept: `out/renders/doge-final-20261028-1080p60/`.
1920×1080, 60 fps, 479.466667 seconds, 28,768 decoded frames, 367,635,147 bytes.
Render source commit `a163e539`; fingerprint `0d92968b10c6de23`; frame rendering 1382.0 seconds.
All video PTS continuous and DTS increasing. No running-label overlap or early exits; beginning/middle/closing frames viewed.
Native AV 13/15 markers pass: adjacent COVID/ATL at 218.860/218.947 seconds report +85 ms audio and −5-frame picture.
These two measurements remain unresolved; do not describe native verification as a full pass.
Decoded AAC −15.9 LUFS, true peak −1.3 dBTP, LRA 3.6 LU; measured, not heard.
Snapshot audit 234/234 IDs per configured coin passes. Live 99Bitcoins returned 403, so live coverage is not certified.
11 chapter groups cover all 15 required moments; starts at least 3 seconds early and groups at least 10 seconds apart.
26 unique chapter/event+1-second images extracted from this final; timestamps in `chapter-check.json`.
Full DOGE data and music remain loaded. No Drive upload requested for this final. No YouTube publication.

## Preview — 2026-10-28

Requested after approval of the 92-event list; no event levels, remove flags, prices or phases changed.
2021-01-01–2021-06-30, 16:9 854×480, 60 fps, 29.00 seconds / 1,740 frames.
8 historical events plus the generated May 8 ATH; two phases with their full-film approved cues.
Sources 92/92; saved 99Bitcoins snapshot reconciles 234 IDs for each of all seven coins. This preview does not
claim a new live-source certification. No label overlap or early exits. Native AV 3/3 passed (picture 0 frames,
audio within 3 ms). AAC −16.0 LUFS, peak −1.3 dBFS, LRA 6.7 LU; measured, not listened to.
Contact sheet inspected, including closing zoom-out. Full DOGE data and music restored after the preview.

MP4: `out/doge-preview-2021-20261028-16x9-480p.mp4`.
Kept frames, shareable MP4, fingerprint and validation: `out/renders/doge-preview-2021-20261028-480p60/`.
Drive uploaded and metadata read back:
https://drive.google.com/file/d/11Mk7cu0Gbw9EeZXcFqesjXcc0tpyqFuM/view?usp=drivesdk
Historical preview record; superseded by the final requested above.
