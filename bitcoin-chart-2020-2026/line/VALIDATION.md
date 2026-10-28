# Coin Trail implementation checks — 28 October 2026

Initial implementation/data checks were completed before rendering. The user approved the
DOGE event/caption manifest on 29 October 2026; the motion preview below awaits visual approval.
This is not final-film certification.

- `npm run test:line`: 18 pilot bubbles (16 stored + 2 turns), three native-tempo cues,
  45 seconds; source identity/visibility/remove, authored-turn dedup, high/low anchors,
  analytic derivative bounds and sampled no-overshoot, exact logo/bubble tangency,
  fully visible reading approaches, same-day separation, frozen HUD, deterministic
  reversed seek order, dense 100-event split with every ID retained, ending hold,
  Node/browser score parity, SFX dispatch/onsets and caption wrapping logic pass.
- `npm run test:line:regression`: legacy long and candle-Short fixture WAVs are bit-identical
  to revision `907574fa`. SHA256 respectively:
  `617bf4ee627afa40591dc6980db073a4c30e84d3bb6a234d0928e8b3c2df8692` and
  `921a3fe943de21de3d7e4a5ed4a5c7b8f05bfb47a7e595ab17989076f1b32d79`.
- Full-range manifest builds pass for BTC 123 bubbles/5 parts, ETH 93/4, BNB 100/4,
  XRP 134/5, SOL 64/3, TRX 49/2, DOGE 63/3. No frames generated.
- `node check-event-sources.js --all`: all seven coins have a source for every stored event.
  This checks citation linkage, not new live verification of external websites.
- `npm run test:events`: all five existing parser/removal tests pass.
- Root picture/data files unchanged (Git blob IDs): btc-data.js
  `bcc144befbabd406c0a83d0529cf476ef137ca0b`, score.js
  `83b3facfbe33e9abdab2f23fe957265e225e5839`, film.js
  `8be206951589508eb8c1c68632fed09f55727502`, index.html
  `f0c6853ec11dbd0893e163ac14932d8bbf6ef10e`.
- Root full music.wav unchanged SHA256:
  `56ec551d7030e79ae406de9ab12d4a37888e3cc6c4bc5a28fe6c9972f8fe7e16`.

After manifest approval: inspect layout with real Inter font metrics and logo, short motion
and collision frames, verify all SFX stems and encoded AAC, then wait for preview approval.
Decoded-frame regression and actual line-film audio/visual acceptance are still pending.
`line/verify.js` provides container/timestamp/stem/AAC-correlation/loudness QA after rendering;
it explicitly leaves picture inspection separate and has not yet been exercised on a line MP4.


## Motion preview, 29 October 2026

User approved all 18 events/captions. Rendered two cuts (10–19.8 s and 35.5–43.5 s),
not the complete 45-second Short. Delivered 17.8 s, 480×854, CFR 60 fps, 1,068 frames,
1,227,673 bytes. Initial concat timebase issue was corrected before delivery, original retained.

- 8/8 included collisions: real SFX stems nonzero; encoded AAC correlation >=0.9962 and
  lag <= one 8 kHz sample against original WAV after accounting for each cut offset.
- 24 decoded frames (before/contact/after): deterministic rendered reference MAE <=1.31/255.
  Inspected ATH, SNL, ATL layouts and decoded ATL frame; native source high/low/HUD/phase agree.
- Actual-font caption wrapping sampled for all 18 captions: long words use the approved
  ellipsis policy, e.g. COINB… / PRO. No canonical event text changed.
- AAC measured -16.1 LUFS, true peak -2.0 dBTP; not listened to by the assistant.
- All 1,068 video PTS continuous at 1/60 s. Original full data/music hashes unchanged.
- Assets, manifests/approval, source cut offsets, encoded files and measurement scripts/results
  retained under the part workspace's out/renders/doge-coin-trail-motion-preview-cfr-20261029/.
- Preview uploaded and Drive metadata verified (id 1Lwn4rUkOLTPopOZWRaEjQUHXFhdFWZ-a).

Pending: user visual/motion/SFX approval, full 45-second Short render/QA, full-timeline line
verifier and decoded-frame regression for long/legacy. The old pre-approval checklist above
is historical; source-code and legacy WAV identity already passed in implementation checks.
