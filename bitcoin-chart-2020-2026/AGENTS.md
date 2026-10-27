# AGENTS.md — instructions for ChatGPT / Codex and any other AI assistant (same rules as CLAUDE.md)

**Before doing anything in a session, open `PROJECT.md` and read it in full** (it is not loaded automatically): it is
the approved spec and the working rules for this video — §1 how to work with the user, §2–§6 what the video must look
and sound like, §8 the commands, §10 the current status and what is waiting for approval. In short:

- Reply to the user in **Vietnamese**; all text inside the video is **English**.
- After every change: render a **short, low-quality preview** (always 60 fps, 16:9, 480p: `FPS=60 … --res 480`, a short
  FROM/TO range), send it, and
  **wait for the user's OK** before doing anything else. Never render the full film unless asked.
- Never drop an event label, never let labels overlap each other or cover candles; up labels above, down below,
  right of the candle or centred first, left only when needed (details in PROJECT.md §3).
- Phases change ONLY at an ALL-TIME HIGH or ALL-TIME LOW (no minor tops/bottoms, no TOP/BOTTOM labels). At a turn the
  MUSIC never slows down: each phase plays its cue at the cue's own tempo and the next cue starts at once with its ~1 s
  pickup; the CHART keeps its pace (it still brakes and eases back at the turn). A hit 2 never changes or ducks the
  music: its SFX play on top. Uptrend cues 100 BPM heroic; downtrend cues 80 BPM suspense, not dramatic (PROJECT.md §4–5).
- ALL coins: collect and retain research levels 0/1/2; never discard a source event just because it is level 0.
  Follow PROJECT.md §13: reconcile every 99Bitcoins source ID for every configured coin, with a stored target or
  explicit exclusion reason; record source discovery/redirects and snapshot coverage. Never substitute BTC events
  for an altcoin-specific history or claim complete altcoin coverage from a price page/search failure.
  Run `python3 audit-99bitcoins.py --live` before declaring source coverage complete and before a final render.
  Report source limits and unresolved date conflicts. Collection does not enable level 0 in the visible video.
- Events shown in the video: only hit 1 and hit 2 (never hit 0); text as short as possible; money as $1.2K / $19.8K / $41M / $1.5B.
  hit 1 = small grey label, no SFX, no effect; hit 2 = big label + SFX + strong visual effect. Check `node check-labels.js`.
- One cue per phase of data/phases.csv, never a change inside a phase. Music mastered to -16 LUFS (no voice-over).
- Keep the phase badge beside the live price (`PHASE_BADGE = 'price'` in `look.js`), independent of the disabled chart overlay (`PHASE_OVERLAY = 'none'`).
- Prices on labels come from the TradingView data in `data/tradingview/`, never from memory; do not invent event causes.
- After a FROM/TO preview always restore the full data: `node make-data.js && node song.js`.
- Status and what is waiting for approval: PROJECT.md §10. Commands (incl. first-time setup on a Mac): PROJECT.md §8.
- Previews and finals are ALWAYS 60 fps. When the user says "render video final": ask one step at a time — 1. coin (those in
  `coins/`, default the current one / BTC, or another coin via §11), 2. aspect ratio (16:9 / 1:1 / 9:16; 9:16 = Shorts),
  3. ONLY for 9:16: all shorts in one go, or pick single ones (list the phases: number, up/down, dates), 4. resolution
  (Full HD / 2K / 4K); defaults current coin / BTC, 16:9, all shorts, Full HD (PROJECT.md §1.6).
- ALWAYS keep every render (preview and final): `FPS=60 node keep-render.js save <name> [--res 480]`. For a small change
  that does not touch the picture (music, mix…), reuse the kept frames (`keep-render.js check` → `restore` → `song.js` →
  `mux` + `verify`) instead of rendering again; render again only for new data or a change that alters the picture.
- NO cue may repeat in the film: approved cues of each type ≥ phases of that type (`make-data.js` warns "NOT ENOUGH
  MUSIC"; `--strict` before a final). If short: make new cues in the approved style, send the user an audition, and
  render only once enough are approved (PROJECT.md §1.7–1.8).
- YouTube title / description / chapters: follow `youtube.md` and PROJECT.md §1.9 exactly — title starts with "Bitcoin",
  no years; description with no years, prices or anything that changes; chapters = every ATH, ATL, hit-2 event and
  halving (no "today"), 3 s early, "ATH: <what sets it apart>", merged when < 10 s apart (`node youtube-chapters.js`);
  check the times against a kept render of the same timeline (no re-render), and redo them after the final render.
- A video about another coin (ETH, DOGE, BNB, SOL, … not in `coins/` yet): do it without asking, exactly like the Bitcoin
  film (PROJECT.md §1.10, §11, `coins/README.md`): TradingView prices (`fetch-tradingview.js`) + 99Bitcoins events, saved
  like Bitcoin's; its own glow-tech colours (palette in `coins/README.md`, user approves); its exact official logo found
  on Google; the approved music in a shuffled order (automatic per coin; still no repeats). Run everything with
  `COIN=<SYMBOL>`. Before a preview render, ask which coin unless already working on one (§1.11); a final always asks (step 1).
- Shorts 9:16 (PROJECT.md §12, `shorts.md`): `SHORT=<phase> node make-data.js`, one phase per short, 20–45 s in 4-bar
  blocks, no axes, 2-row header, all event levels but NOT the opening turn label (downtrend: no ATH, uptrend: no ATL), loops by
  running on into the first candle (no zoom-out). Preview 480p 60 fps with at least one loop seam inside (play it twice,
  `-loop2`); final = one cycle, end joins start. Always restore the long film's data after.
- Commit and push to branch `claude/bitcoin-price-chart-animation-l7ta0e`; update PROJECT.md when an approved rule changes.

## Running here (Codex / ChatGPT)

- Rendering is plain local tooling: Node 22+, ffmpeg and Google Chrome (headless, found in /Applications). The
  assistant only runs the commands of PROJECT.md §8 in this folder. `npm install` once for `check-labels.js`.
- Codex's sandbox must allow launching Chrome and writing `out/`, and needs network for `git pull` / `git push`
  (run Codex with a mode that permits these, or approve them when asked).
- A full render takes ~35 min at 1080p 60 fps (a 480p preview of 1–2 years ~2–4 min): run long commands in the
  background and report when they finish; never leave a FROM/TO cut in place (restore with `node make-data.js && node song.js`).
- Before EVERY request and each new work phase (inspection, docs/code edits, data generation, render, commit/push):
  check `git status --short --branch`, run `git fetch origin`, inspect the latest local/upstream commits and
  ahead/behind counts, then `git pull --ff-only` before proceeding. Re-read changed instructions and relevant files.
  Preserve uncommitted work; if changes or diverged history prevent a safe pull, report the condition before dependent work.
- `out/` is not committed (.gitignore): send the rendered files to the user directly.
- You cannot hear the music: report the measured numbers (LUFS, levels) and ask the user to listen.
- When a rule changes, update PROJECT.md and keep AGENTS.md and CLAUDE.md saying the same thing.
