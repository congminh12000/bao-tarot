# Tesla — global model-delivery race

Independent long-film pipeline. Full-history delivery data is **not complete**: 47 quarters / 235 cells, with **128 accepted active-model cells (17 issuer facts + 111 published estimates), 40 missing and 67 pre-launch**. Published model estimates come from the provider's downloadable table, imported unchanged. No local allocation of combined Tesla totals, regional-as-global substitution or simulated quantities.

## Film and isolation

- Separate bar, official photograph and color for Model S, X, 3, Y and Cybertruck. Official Tesla T; source URLs and image hashes in `assets.json`. Current product photos illustrate the model, not historical trims.
- Fixed linear zero-baseline main scale; stable rank ties; continuous bounded smoothstep transitions through each quarter's race + narrative duration. A full-size chart keeps moving behind bottom narrative cards. ~ counters are explicitly labeled animation values; separate Qn END values are the published source totals. Labels only fade briefly at actual rank crossings (0.8s rank transitions). Small-model spotlight has an explicit separate DETAIL SCALE.
- 480s / 28,800 frames at 60fps: 12s intro, 47 × 6s quarters, ten panels totaling 160s, 26s summary. Launch, head-to-head, annual, YoY and cumulative panels derive claims from data. Cumulative means selected period since 2015, not lifetime or all Tesla vehicles.
- Prelaunch/missing stay null; neither is zero. Estimates always get ≈ and an estimate legend. A sourced estimate is not an independently verified precise count.
- Four approved 100 BPM cues at 0/120/240/360s, native long arrangements. Workspace-only song adapter adds quiet launch/leader chimes; no whole-mix pre-event gates or legacy end impact. Target −16 LUFS.
- Unique `out/tesla-sales/<datahash>-<codehash>-<unique>/` workspaces retain engine/source/review snapshots, manifest, photos, WAV/stems, encoded pictures and QA. Every engine invocation checks fingerprints. Root crypto/equity/Shorts data, score, film, song and full WAV remain untouched.

## Data and research

```sh
npm run review:sales          # writes concrete review/coverage; no rendering
npm run audit:sales           # full-history gate; fails while 40 cells are missing
npm run test:sales            # 21 logic/data/authorization tests; no synthetic fixture pictures
python3 sales/research.py     # public issuer reports; curl/lxml/pdftotext
python3 sales/curate.py       # rechecks 17 literal seed facts, preserves later edits
python3 sales/import-published.py # imports unchanged provider table; uses cache or public fetch
```

Research/QA Python dependencies are in `sales/requirements.txt`; `curl` and `pdftotext` (Poppler) are needed for report research.

The public model table is [CleanTechnica/Datawrapper](https://datawrapper.dwcdn.net/3hcKb/9/dataset.csv), linked from [the July 2026 article](https://cleantechnica.com/2026/07/02/tesla-has-its-4th-best-quarter-ever/). Exact downloaded data is retained as `published-model-estimates.tsv`; original source hashes and explicit source notes are saved. It covers 2016Q2–2026Q2. The provider acknowledges informed assumptions based on Troy Teslike/EV-Volumes/other sources; its full estimating method and uncertainty intervals are not reproducible from the public notes.

Independent Tesla quarter reports check the quarter and combined-group context **only**, not the exact individual-model estimate. `independentCorroboration:false` is retained for those estimates. Repeated charts from the same publisher are not independent sources. Direct issuer model counts take priority; grouped revisions are not redistributed.

All 30 S/X/Cybertruck cells from 2024Q1 onward remain unaccepted pending reconciliation. For example, the chart's global Cybertruck 2024Q3 estimate (11,885) conflicts with KBB's US estimate (16,692). Neither is silently overwritten and US counts are never called worldwide. Five early individual cells and five 2026Q3 cells also remain missing. See `source-discovery.md`, `published-candidates.json`, `coverage.json` and `review.md` for every decision and source.

`research.py` retains readable document hashes in ignored `out/sales-research`, reusing the older Tesla research cache where available. Regex extraction candidates include financial/production false positives; they are never facts automatically. A readable/HTTP200 source is not factual approval. Asset acquisition uses exact official product-page image URLs; changes invalidate data-review hashes.

## Preview authorization and full-film gate

The user subsequently instructed: “Hoàn thiện tất cả, tự kiểm tra và làm cho xong. Sau đó render preview up lên drive.” This explicitly delegates verification and requests preview; it does **not** approve a fabricated or complete dataset. `preview-authorization.json` records that instruction and the current input hash, separately from pending full-data `approval.json`.

A research preview may render a **source-covered window of at most 45 seconds**. Audit every touched quarter, the preceding quarter used for transitions, and annual-panel dependencies. Any missing rendered/context fact or data error fails. Disallow incomplete cumulative summaries. Preserve all 47 quarters and missing cells in the research files; do not silently narrow the full film. Preview carries `RESEARCH PREVIEW` and the estimate legend. Browser frame and direct engine guards reject rendering outside the exact window or running full-film commands with a preview-only permit.

```sh
node sales/render.js layout 296  # still, 480p; same bounded permit
node sales/render.js preview 296 # 296–332s, 36s, 16:9/480p/60fps
python3 sales/verify-preview.py /absolute/path/to/retained/workspace
```

The current preview shows 2023Q1–Q4 and Cybertruck entering, using five separate model bars once launched. At first the unreleased truck is labeled NOT LAUNCHED. The former 16-second launch hold is now part of the ongoing quarter transition with a bottom overlay. Its published launch count remains explicitly approximate. Launch SFX starts when the new bar enters, not after six seconds of movement. The 36-second continuous-motion check covers all 2,159 adjacent frame pairs and decoded bar-edge growth during that former hold.

Full-history builds remain blocked until every active-model cell has acceptable source evidence and exact full-data/storyboard approval. Then layout/short preview, user preview approval, explicit final request and confirmed final resolution precede `node sales/render.js final`. Never self-approve final or reuse a preview permit for full film.

## Verification and delivery

21 data/logic tests and the existing event tests cover coverage, zero/null/prelaunch, grouped/regional/unread observations, estimates, timeline, stable ranks, YoY, bounded interpolation, deterministic seeking, review hashes, official assets, native cue times, preview context and direct-render guards. Actual preview checks inspect decoded frame count/PTS, native PNG versus encoded frames, AAC/master correlation and lag, isolated SFX signal, loudness/true peak and the file's input hashes. These measurements do not imply listening or user aesthetic acceptance.

Keep every workspace/output. Deliver through the already-authorized Google Drive fallback and read back Drive metadata before sending its returned URL. Current measured/render/upload results are recorded separately in `coins/TSLA/sales/verification.json`; do not claim the full dataset or full film is done.
