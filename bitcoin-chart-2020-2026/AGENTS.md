# Instructions for any AI assistant working on this project

Read **PROJECT.md** first: it is the approved spec and the working rules for this video. In short:

- Reply to the user in **Vietnamese**; all text inside the video is **English**.
- After every change: render a **short, low-quality preview** (`--draft`, a short FROM/TO range), send it, and
  **wait for the user's OK** before doing anything else. Never render the full film unless asked.
- Never drop an event label, never let labels overlap each other or cover candles; up labels above, down below,
  right of the candle or centred first, left only when needed (details in PROJECT.md §3).
- Music runs at full tempo until a top/bottom label appears, then brakes to 60 BPM for 3 s and eases back over ~3 s.
  The candles follow the music tempo (PROJECT.md §4–5).
- Events: only hit 1 and hit 2 (never hit 0); text as short as possible; money as $1.2K / $19.8K / $41M / $1.5B.
  hit 1 = small grey label, no SFX, no effect; hit 2 = big label + SFX + strong visual effect. Check `node check-labels.js`.
- One cue per phase of data/phases.csv, never a change inside a phase. Music mastered to -16 LUFS (no voice-over).
- Prices on labels come from the TradingView data in `data/tradingview/`, never from memory; do not invent event causes.
- After a FROM/TO preview always restore the full data: `node make-data.js && node song.js`.
- Commit and push to branch `claude/bitcoin-price-chart-animation-l7ta0e`; update PROJECT.md when an approved rule changes.
