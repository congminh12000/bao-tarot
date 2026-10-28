# SOL final — rendered 2026-10-28; Drive upload pending

User selected SOL / full saved history / 16:9 / Full HD, always 60 fps, after viewing the full preview.
Final: `out/sol-final-20261028-16x9-1080p.mp4`; kept at `out/renders/sol-final-20261028-1080p60/`.
1920×1080, 282.666667 s, 16,960 decoded frames, 234,036,189 bytes. Fingerprint `7b51e0b4dbdef005`.
56 historical events + 8 generated turns, 9 unique cues; all prices, events, flags and picture/audio code unchanged.
All input hashes stayed unchanged and all video PTS are continuous. AAC −16.0 LUFS / −1.2 dBTP / LRA 4.5 LU.
Source mappings 63/63 and saved audit pass; 99Bitcoins live 403 is not certified. Native AV 13/17 passes.
Four adjacent-event measurements at ~45.6/~195.1 s and the closing China-label/ATL overlap remain as in preview.
Render took 833.6 seconds. 15 chapter groups cover 21 required moments; 36 frame checks stored with the final.
`youtube.md` contains title options and regenerated chapters; nothing published. Audio measured, not heard.
Drive connector upload failed before invocation: 234,036,189 bytes exceeds its 100 MiB limit. Chrome fallback
requires enabling Allow access to file URLs for the ChatGPT extension; native access also reports the Mac locked.
No permission was changed. Resume upload of the existing final after the user enables that setting; no re-render.
The verified Drive preview remains at https://drive.google.com/file/d/1-8YFC5hCYQ6cbCBAv8vPxvVdqcSmjveX/view.

Historical preview notes below are superseded by this final status.

# Solana film — full-history preview ready for review (2026-10-28)

Prepared 2026-10-28 following PROJECT.md §11 and the palette in `coins/README.md`.

- Prices: TradingView `CRYPTO:SOLUSD`, 2,392 actual daily candles 2020-04-10 → 2026-10-27, no gaps (details: `data/SOURCES.md`).
- Events: 63 stored rows, all with sources; 56 shown (8 level 2 / 25 level 1 / 23 level 0), 7 `remove=true`.
- Phases: 9 (5 uptrends, 4 downtrends) from the unchanged detector; ATH $4.95 · $58.6 · $260 · $295,
  ATL $1.03 · $22.1 · $8.00 · $60.1. Music: 9 distinct approved cues, `--strict` passes; full timeline ≈ 4:43.
- Running-film label check: no overlaps, no early label exits. Closing zoom-out has the known overlap below.

## Full-history preview — 2026-10-28

Explicitly requested after the 63-row event list was approved. Full saved range: 2020-04-10–2026-10-27,
56 historical events + 8 generated ATH/ATL turns, 9 unique cues. Event flags, grades, phases and prices unchanged.
16:9, 854×480, 60 fps, 282.666667 s, 16,960 decoded frames, 64,050,945 bytes. All input hashes unchanged.
File: `out/sol-preview-full-20261028-480p.mp4`; kept at `out/renders/sol-preview-full-20261028-480p60/`,
fingerprint `0bdb18e1db652aa2`. Full SOL data and music remain loaded; no FROM/TO cut.
Decoded AAC: −16.0 LUFS, true peak −1.2 dBTP, LRA 4.5 LU; measured, not heard.
Native AV verification: 13/17 markers pass. At ~45.6 s (ATH / China restriction) and ~195.1 s (TRUMP launch / ATH),
two event pairs are only 82 ms and 76 ms apart: four measurements fail (adjacent onset / earlier flash selected).
No score, picture or mix changes were made to hide these failures. Review these regions before a final export.
Beginning, middle and closing frames inspected. The closing China-label/ATL overlap remains, not fixed.
Evidence: `inputs.json`, `validation.json`, `verify.log`, `audio.log` and `contact.png` in the kept render directory.
Awaiting preview review; no SOL final rendered.

```bash
COIN=SOL node make-data.js --strict && COIN=SOL FPS=60 node song.js && COIN=SOL FPS=60 node check-labels.js
```

## Stills checked — 2026-10-28

Full HD stills of the full film at 2 s, 141.3 s and 281.5 s (kept locally in `out/stills/sol/`, not committed).
Known issue, not fixed yet: on the closing zoom-out, the level-2 label "China crypto ban" (2021-05-19) is covered by
"ALL-TIME LOW: $22" (2021-07-20). `check-labels.js` checks the running film, not the closing zoom-out, so it passes.
