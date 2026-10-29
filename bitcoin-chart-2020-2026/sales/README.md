# Tesla — global model-delivery race

Independent long-film pipeline, **not yet render-ready**. No sales still/video has been rendered. The real 47-quarter / five-model matrix has **17 accepted, 151 missing active-model cells**, plus 67 correctly marked not-launched cells. Do not turn missing data into zero or render a polished but unsupported global comparison.

## What is implemented

- S, X, 3, Y and Cybertruck each have a separate model/bar/photo/color. Official Tesla T and five official product photographs are locally stored with source pages, original URLs, hashes and dimensions. Photos illustrate the model's current appearance, not each historical year's trim.
- Deterministic zero-baseline, fixed-scale quarterly chart; 0.8-second monotone transitions; stable ties; hiding text during rank crossing; exact source counts only. Every state comes from absolute time.
- Exactly 480s / 28,800 frames at 60fps: 12s intro, 47 × 6s quarters, ten narrative panels totaling 160s, 26s summary. Chapters and captions live in config/storyboard; comparative claims are computed, not assumed.
- Launch, head-to-head, YoY, annual and a separately labeled small-model detail scale; cumulative summary clearly says since 2015. Prelaunch/missing are null. Published estimates get ≈ and a persistent estimate legend, methodology and an independent checked source group.
- Four existing approved 100 BPM cues at 0/120/240/360s, preserving native long-film arrangement. Workspace-only song adapter adds restrained launch/leader chimes, removes whole-mix pre-hit gates and legacy ending hit. Shared song, root price data, renderer and music are untouched.
- Strict audit and hash-bound concrete review gate. Building refuses missing/invalid data before creating any render workspace. Render entrypoint requires explicit review evidence, preview approval and final request/resolution for final.
- Unique isolated `out/tesla-sales/<datahash>-<codehash>-<unique>/` workspaces, with full source/review inputs, engine, hashes, assets and generated manifest; retained WAV/stems/frames/outputs. Each engine invocation checks file fingerprints. No overwriting old renders; root full-data/music restoration is unnecessary because root generated files are never changed.

## Data, research and review

```sh
node sales/review.js --review # writes review.md and coverage.json, no rendering
node sales/review.js          # strict coverage audit; currently expected to fail
node sales/test.js           # mathematical/data/gate tests, no fixture rendering
python3 sales/research.py    # public reports; Python lxml + pdftotext + curl
python3 sales/curate.py      # verify the 17 literal seed facts; preserves later edits
```

`research.py` caches original public documents under ignored `out/sales-research`, reuses the existing Tesla document cache with original hashes, and exports **candidates only**. Regex candidates include financial/production false positives. Never promote them without literal quarter/model/metric/geography review. `sources.checked` means readable, not factual approval. The current accepted facts are issuer facts without claimed independent corroboration. Re-running research preserves additional manually added source records; seed verification does not overwrite subsequent decisions.

`coins/TSLA/sales/deliveries.csv` contains all 235 model-quarter cells. `observations.json` is the accepted literal-evidence ledger; `report-index.json` points to 98 releases/letters; `source-discovery.md` records source limitations and excluded sources. `review.md` shows every missing quarter and every accepted quotation/link, plus the full storyboard. The CSV `note` and observation `reviewNote` retain revision decisions. If a source later revises only a combined group, do not redistribute that revision into individual models. Keep earlier published evidence as unaccepted history rather than silently inventing corrected per-model values.

Asset refresh (only when deliberately updating the official photographs): fetch current official product pages into the research cache, inspect their image URLs and update `sales/acquire-assets.py` exact selections before running it. This is product-asset acquisition, not a sales render. Changes invalidate the review hash.

## After coverage is complete

1. Run strict audit and send the exact data/source/storyboard review for user approval. Plan approval does not approve the dataset. Record `approval.json` with `approved:true`, current contentHash and exact user approval evidence only when actually received.
2. `COIN=TSLA node sales/render.js layout 128` — layout at 480p, 16:9.
3. `COIN=TSLA node sales/render.js preview 128` — 36s, 480p60, retains full music/data in its unique workspace. Deliver directly if supported, otherwise the already-authorized Drive fallback.
4. Inspect layout/text collision/safe areas, source labels, photo identity, deterministic seek samples, decoded frame/PTS count and cue/SFX alignment; measure master and AAC loudness/true peak. Ask user to assess motion/music. Do not treat unit tests as visual/audio QA.
5. Only after preview approval, explicit full request and resolution confirmation, record their evidence/`previewApproved`/`finalRequested`/`finalResolution`, then `node sales/render.js final`. Design format stays 16:9/60fps. Validate and retain all outputs and Drive metadata before delivery.

`node sales/build.js` materializes an approved, complete workspace without rendering. Use `sales/render.js` for production operations, not ad-hoc direct engine full-film commands that bypass the operator review sequence. No approval utility self-approves data. Pending data/storyboard approval is stored as false.

## Verification status and remaining work

15 unit/data tests pass: coverage, missing/zero/prelaunch, grouped/regional/unread observations, estimates, full timeline, ranking/ties, YoY, interpolation, deterministic seeks, review hash, assets and song adapter. Shared long/Shorts generated inputs remain unchanged. **No sales browser frames, music or AAC have been generated or visually/audibly verified** because the data gate correctly blocks them. End-to-end renderer, layout, sound synchronization and final mastering still require the completed real dataset and subsequent approvals.

A full worldwide model-by-quarter public dataset has not been established. MarkLines export required signup/login; EV-Volumes access was not established; KBB/GCBC/CarFigures regional counts cannot fill the global series; an apparently suitable GitHub dashboard explicitly used simulated data and was rejected. See the concrete missing-cell matrix, not a claim of worldwide completeness. Do not quietly change geography, omit quarters, group cars or allocate annual totals to fill the gaps.
