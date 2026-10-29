# Public-source discovery — 29 October 2026

Scope: worldwide individual-model quarterly deliveries, 2015Q1–2026Q3. This is a coverage investigation, not a claim that no suitable dataset exists. Public search snippets alone are not accepted observations. Direct issuer facts need literal report confirmation; independent estimates need documented methodology and a second checked source.

| Source | Finding | Decision |
|---|---|---|
| [Tesla IR](https://ir.tesla.com/#quarterly-disclosure) / [SEC](https://www.sec.gov/edgar/browse/?CIK=1318605) | 98 public quarter releases/letters retrieved or reused with original document hash. Individual S/X counts in early releases; later letters may revise only grouped totals. S/X grouped from 2019; 3/Y grouped from 2020; Other Models includes Cybertruck from 2023Q4. | Accept only explicit individual-model quarterly facts; save exact quote. A group cannot be split, even by subtracting another estimated model. Preliminary individual counts with unresolved group-only revisions remain unaccepted. |
| [MarkLines model-sales search](https://www.marklines.com/en/vehicle_sales/search) | Global model/month coverage advertised. Export request redirected to signup/login. No account created, no subscription obtained. | Access not established; no observations imported. Public subscription description is not dataset access. |
| [EV-Volumes](https://ev-volumes.com/) | Direct access attempt timed out; search did not provide complete quarterly series for all five models. | Unverified coverage, no values accepted. |
| [Cox / Kelley Blue Book](https://www.coxautoinc.com/wp-content/uploads/2026/10/Q3-2026-Kelley-Blue-Book-EV-Sales-Report-updated-as-of-10-13-26.pdf) | Per-model quarterly estimates cover the United States. | Do not label US sales as worldwide deliveries. |
| [GoodCarBadCar](https://www.goodcarbadcar.net/) / [CarFigures](https://carfigures.com/us-market-brand/tesla) | Regional US/Canada model series; estimates are not issuer global counts. | Regional data excluded from global observations. |
| [CleanTechnica](https://cleantechnica.com/) | Global top-model monthly rankings and annual estimates can help corroborate 3/Y; no complete five-model quarterly matrix verified. | No annual-to-quarter allocation; top-20 absence is not zero. Further source-level inspection needed. |
| [RoadGenius](https://roadgenius.com/statistics/sales/tesla/) | Public aggregate/global stats, some annual individual estimates and regional Cybertruck figures. | Insufficient to populate all worldwide quarters. |
| [Public GitHub dashboard](https://github.com/Fares-Mubarak/tesla-global-deliveries-dashboard) | README explicitly describes the dataset as simulated. | Rejected: simulated data, including a fictitious model name, cannot supply video facts. |

## Revision examples checked in the issuer reports

- 2015Q1 S: 10,030 initially announced; 10,045 in shareholder letter.
- 2015Q2 S: 11,507 initially announced; 11,532 in shareholder letter.
- 2015Q4 X: 208 initially; 206 in shareholder letter. Revised total 17,478 does not authorize creating an unreported S count by subtraction.
- 2017Q3 Model 3: 220 initially; 222 in shareholder letter. S/X later reported as a combined figure; no arbitrary redistribution of the revision.
- 2017Q4 Model 3: 1,550 initially; 1,542 in shareholder letter.
- 2018Q1 Model 3: 8,180 initially; 8,182 in shareholder letter.
- 2018Q2 Model 3: 18,440 initially; 18,449 in shareholder letter. The 28,386 figure is cumulative to date, not quarter deliveries.
- 2018Q3 Model 3: 55,840 initially; 56,065 in shareholder letter.
- 2019Q4 letter has a global operational table with five columns 2018Q4–2019Q4, supplying five Model 3 observations. S/X row stays grouped.

These are issuer revisions, not independent corroboration. `sources.json.checked` means readable document; only `observations.json.accepted=true` plus a matching literal quotation constitutes an accepted fact. Extraction candidates intentionally retain rejected/ambiguous material and are never promoted automatically. The initial accepted subset is conservative and is not a finished sales dataset.
