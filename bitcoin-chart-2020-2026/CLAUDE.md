# CLAUDE.md — instructions for Claude (same rules as AGENTS.md, which ChatGPT / Codex reads; keep both in step)

**PROJECT.md** is the approved spec and the working rules for this video; it is imported below, so it is always loaded.
In short:

- Reply to the user in **Vietnamese**; all text inside the video is **English**.
- After every change: render a **short, low-quality preview** (30 fps, 16:9, 480p: `FPS=30 … --res 480`, a short
  FROM/TO range), send it, and
  **wait for the user's OK** before doing anything else. Never render the full film unless asked.
- Never drop an event label, never let labels overlap each other or cover candles; up labels above, down below,
  right of the candle or centred first, left only when needed (details in PROJECT.md §3).
- Phases change ONLY at an ALL-TIME HIGH or ALL-TIME LOW (no minor tops/bottoms, no TOP/BOTTOM labels). Music runs at
  full tempo until that label appears, then brakes to 60 BPM for 3 s and eases back over ~3 s; a hit 2 inside a phase
  keeps the cue and only ducks the music under its SFX. The candles follow the music tempo (PROJECT.md §4–5).
- Events: only hit 1 and hit 2 (never hit 0); text as short as possible; money as $1.2K / $19.8K / $41M / $1.5B.
  hit 1 = small grey label, no SFX, no effect; hit 2 = big label + SFX + strong visual effect. Check `node check-labels.js`.
- One cue per phase of data/phases.csv, never a change inside a phase. Music mastered to -16 LUFS (no voice-over).
- Prices on labels come from the TradingView data in `data/tradingview/`, never from memory; do not invent event causes.
- After a FROM/TO preview always restore the full data: `node make-data.js && node song.js`.
- Status and what is waiting for approval: PROJECT.md §10. Commands (incl. first-time setup on a Mac): PROJECT.md §8.
- When the user says "render video final": ask 3 steps, one at a time — FPS (24 / 30 / 60), aspect ratio
  (16:9 / 1:1 / 9:16), resolution (Full HD / 2K / 4K); defaults 30 fps, 16:9, Full HD (PROJECT.md §1.6).
- Commit and push to branch `claude/bitcoin-price-chart-animation-l7ta0e`; update PROJECT.md when an approved rule changes.

## Running here

- A full render takes ~16 min at 1080p 30 fps (a 480p preview of 1–2 years ~1–2 min): run long commands in the
  background; never leave a FROM/TO cut in place (restore with `node make-data.js && node song.js`).
- `git pull` before starting, so work done meanwhile by another assistant (ChatGPT / Codex) is not overwritten.
- `out/` is not committed (.gitignore): send the rendered files to the user directly.
- When a rule changes, update PROJECT.md and keep CLAUDE.md and AGENTS.md saying the same thing.

@PROJECT.md
