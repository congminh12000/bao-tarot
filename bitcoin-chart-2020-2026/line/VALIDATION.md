# Coin Trail implementation checks — 28 October 2026

No image or video rendered: DOGE event/caption manifest awaits the user's approval.
This is implementation/data QA, not visual acceptance or final-film certification.

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
