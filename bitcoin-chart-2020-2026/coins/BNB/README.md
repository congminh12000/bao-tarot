# BNB film — preview awaiting approval

Prepared 2026-10-27 following PROJECT.md §11 and `coins/README.md`.

- TradingView `CRYPTO:BNBUSD`: 3,392 actual daily candles, 2017-07-14–2026-10-26; no gaps or synthetic anchors.
- 33 curated events, with provenance in `data/SOURCES.md`; labels describe events without asserting price causation.
- 9 phases (5 uptrend, 4 downtrend); unchanged phase detector and thresholds.
- 9 distinct approved cues, deterministically shuffled for BNB; strict no-repeat validation passes.
- Full timeline: 364.714 seconds, approximately 6:05. No full video has been rendered.
- Full-history label validation passes: no overlaps and no labels forced out early.
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

Awaiting approval of the logo, palette and layout. Final titles and chapters will be reviewed against the final render;
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
All previous official-source and level-1/2 events are preserved; new supplementary entries are level 0 and not rendered.
