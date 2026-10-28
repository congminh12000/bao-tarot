# TRON film — full-history final

Prepared 2026-10-28 following PROJECT.md §11.

- Prices: TradingView `CRYPTO:TRXUSD`, 3,332 actual daily candles 2017-09-13 → 2026-10-27, no gaps (details: `data/SOURCES.md`).
- Events: 75 stored rows, all with sources; 45 shown (6 level 2 / 15 level 1 / 24 level 0), 30 `remove=true`.
- Phases: 5 (3 uptrends, 2 downtrends); ATH $0.30 (2018-01-05) · $0.449 (2024-12-04), ATL $0.0079 (2020-03-13) ·
  $0.211 (2025-03-16). Music: 5 distinct approved cues, `--strict` passes; full timeline ≈ 5:44.
- Label check over the whole film: no overlaps, no early exits; the closing zoom-out still was checked by eye.
- Logo: official TRON Brand Kit icon. Colours proposed (not in the palette table yet): coral on dark red, awaiting approval.
- The user explicitly requested a full-data preview of the current selection; no selection or grading changed.

## Full-history final — 2026-10-28

Requested TRX / 16:9 / Full HD / 60 fps. Full saved range 2017-09-13–2026-10-27:
3,332 real daily candles, 45 selected events + 4 generated turns, 5 unique approved cues.
75/75 research events have sources; 30 removed rows remain excluded. No selection or picture changes from preview.
Final: `out/trx-final-20261028-16x9-1080p.mp4`; kept: `out/renders/trx-final-20261028-1080p60/`.
1920×1080, 60 fps, 343.666667 s, 20,620 decoded frames, 261,763,331 bytes.
Fingerprint `d4db59f65fed0d5b`; render source commit `61530c18`; frame rendering 872.4 s.
All frame timestamps continuous, input hashes unchanged, native AV sync 11/11 markers pass.
No running-label overlaps or early exits; beginning, middle and closing zoom-out visually inspected.
Decoded AAC: −16.0 LUFS, true peak −1.4 dBTP, LRA 3.9 LU; measured, not heard.
Saved-snapshot audit passes; live 99Bitcoins returned HTTP 403, so live coverage is not certified.
10 chapter groups cover all 12 required moments, at least 3 seconds early and 10 seconds apart;
21 unique chapter-start/event+1-second images extracted from this final. See `youtube.md`.
Full TRX data/music remain loaded. Final delivered locally; no Drive upload requested for this final.

## Full-history preview — 2026-10-28

Full saved range 2017-09-13–2026-10-27, all 3,332 daily candles, 45 selected historical events + 4 generated turns,
5 unique approved cues. All 75 research rows and their sources remain stored; 30 removed rows stay excluded.
16:9, 854×480, 60 fps, 343.674625 s, 20,620 decoded video frames, 71,363,621 bytes.
File: `out/trx-preview-full-20261028-480p.mp4`; kept at `out/renders/trx-preview-full-20261028-480p60/`,
fingerprint `6d5f7515cde888be`. Rendered frames in 208.7 s; input hashes unchanged.
All 11 AV sync markers pass (sound rounded 0 ms, picture 0-frame deviation from the expected frame).
Running labels have no overlaps or forced early exits. Beginning, middle and closing zoom-out visually inspected.
Decoded AAC: −16.0 LUFS, true peak −1.4 dBTP, LRA 3.9 LU; measured, not heard.
`inputs.json`, `validation.json`, `verify.log`, `audio.log` and `contact.png` in the kept directory hold evidence.
Full TRX data and music remain loaded, with no FROM/TO cut. Historical preview record; superseded by final above.

```bash
COIN=TRX node make-data.js --strict && COIN=TRX FPS=60 node song.js && COIN=TRX FPS=60 node check-labels.js
```
