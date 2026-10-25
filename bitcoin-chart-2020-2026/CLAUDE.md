# CLAUDE.md — instructions for Claude (same as AGENTS.md)

Read **PROJECT.md** first: it is the approved spec and the working rules for this video. In short:

- Reply to the user in **Vietnamese**; all text inside the video is **English**.
- After every change: render a **short, low-quality preview** (`--draft`, a short FROM/TO range), send it, and
  **wait for the user's OK** before doing anything else. Never render the full film unless asked.
- Never drop an event label, never let labels overlap each other or cover candles; up labels above, down below,
  right of the candle or centred first, left only when needed (details in PROJECT.md §3).
- Music runs at full tempo until a top/bottom label appears, then brakes to 60 BPM for 3 s and eases back over ~3 s.
  The candles follow the music tempo (PROJECT.md §4–5).
- Prices on labels come from the TradingView data in `data/tradingview/`, never from memory; do not invent event causes.
- After a FROM/TO preview always restore the full data: `node make-data.js && LUFS=-14 node song.js`.
- Commit and push to branch `claude/bitcoin-price-chart-animation-l7ta0e`; update PROJECT.md when an approved rule changes.
