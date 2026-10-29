> Selection update 2026-10-29: the counts/flags below describe the pre-trim audit snapshot. Current selection: 44 in-range events + 4 automatic turns, 108 newly hidden, 171 removed overall. See [current item-by-item review](events-important-review-20261029.md). Pending approval before any new render.

# HYPE source audit — second pass, 2026-10-29

## Result and limits

There was no HYPE directory at source commit `80d4f545`. This is a new researched data set, not a certification
that all events in Hyperliquid or world history have been captured.

- 225 dated research events, 465 citation rows, all events linked to sources; 44 new verified rows in the second pass.
- Levels 0 / 1 / 2: 94 / 116 / 15. 63 routine refinements or duplicate explanatory updates retained with remove=true.
- 162 retained events, including 10 before the saved price range; 152 retained events within saved prices.
- All 586 readable official announcement posts in the fetched pages have an inventory disposition, spanning
  2023-08-04 through 2026-10-28. This is not a complete archive of deleted/private/media-only posts or the separate
  API announcements channel. All 49 formerly unresolved notices received individual decisions: 4 promoted/linked
  with corroboration and 45 classified as other-asset notices, metrics or community/recap context. Thirty multi-topic
  recaps still have no dedicated event row after product/tech review; every third-party integration and 23 rolling
  venue metrics are not certified exhaustive. Two new draft features with inadequate specific corroboration are
  retained in second-pass deferredDrafts, not promoted to events.csv. See source-inventory and second-pass JSON.
- No render requested or performed. Event selection/levels/remove flags await user review before any render.

## Price data — TradingView only

Primary: `CRYPTO:HYPEHUSD`, TradingView's **USD aggregate for Hyperliquid**. The asset ticker `HYPEH` is
TradingView's namespace: the source page names Hyperliquid and links its official site and native-token explorer.
The first pass missed this aggregate ticker and selected the shorter `PYTH:HYPEUSD` oracle. That original oracle
file is preserved under source-audits/tradingview; it no longer overrides the active aggregate.
All available daily bars from the tested oldest feed were fetched through the existing TradingView chart websocket.
The 2026-10-29 UTC candle is still open; it is archived separately and excluded from production prices.

Saved closed range: **2024-11-30 through 2026-10-28**, **698** unique consecutive daily OHLC rows, **0** gaps inside
this range and **0** estimated rows. Positive finite OHLC values and low <= open/close <= high validated.
Full precision is preserved. `price-audit-20261029.json` lists the symbol trials and comparison statistics. A second independent fetch matched all 698 closed OHLC rows exactly.

**Not complete from genesis:** HYPE launched 2024-11-29, but the correct TradingView aggregate begins
2024-11-30. The second pass recovered 2024-11-30, 2024-12-01, 2024-12-02 and 2024-12-03. Only
**2024-11-29** remains absent on the tested feeds. It is not fabricated, interpolated, zero-filled, or
substituted with perpetual prices. Events before saved prices remain as context without synthetic candles.

Cross-checks (all from TradingView; stored under source-audits/tradingview, never merged into active prices):

| Feed | Closed overlapping days | Median absolute close difference | Maximum |
|---|---:|---:|---:|
| KUCOIN:HYPEUSDT spot | 691 | 0.04825% | 0.36297% |
| HYPERLIQUID:HYPEUSDC spot | 586 | 0.03214% | 0.31633% |
| PYTH:HYPEUSD oracle | 694 | 0.02167% | 0.41811% |

Different venues, sampling, aggregation/oracle methodology and quote currencies can produce different prices. The comparison against the aggregate
checks plausibility; it does not prove a universal correct price or identical OHLC. USD, USDT and USDC are not
silently treated as the same unit. Zero/absent oracle volume is not invented trading volume.

The existing project ingestion was run with --strict in an isolated temporary copy. It reads 698 TradingView rows,
zero estimates and 152 retained in-range events. Its normal chart-price rounding was measured (see validation JSON). The saved hype-daily.csv is a full-precision
copy of the retained raw TradingView OHLC, rather than the rounded chart export. A later make-data invocation
will regenerate that derived file using existing chart rounding; the raw TradingView file always retains full precision. Root btc-data.js and
music remain untouched. No phases, logo or visual configuration is prepared by this data-only task.

## Events and verification

Sources: original Hyper Foundation genesis article, official Hyperliquid dated announcements and protocol docs;
Circle, Ripple, Phantom, MetaMask, USDT0, VALR, Payward, Kraken, Binance; Nasdaq and issuer SEC disclosures;
Bitwise, 21Shares, CoinShares and Grayscale product documents; MAS; Hyperliquid Policy Center's full published
index; onchain analysis by Arkham and corroborating established reporting.

Each event has a concise English label, kind, editorial hit level and remove flag. `review-20261029.json` records
its exact citation set, date basis, caveats and removal reason. `events-review-20261029.md` is the reviewable list.
`kind=up/down` expresses editorial event direction, not proven causation of a price movement. Hit is importance,
not confidence: 2 = major genesis/chain/access/systemic event; 1 = substantive utility/governance/institutional
milestone; 0 = smaller detail. Removal is independent of importance and preserves the research and citations.

A dated official announcement plus a current documentation page corroborates the feature, but **does not independently
prove its historical activation day**. These rows explicitly state that verification limit. Other rows use original
counterparty/issuer records or corroborated reporting; not every row has two independent dated primary records.
News snippets, a URL's successful response, or an unsourced price page are not proof that an event happened.
Some source sites block direct curl (403/429/timeouts); web-retrieved content was used where available and access
limits are recorded in source-access-20261029.json. No claim that every URL is currently directly accessible.

## Date and interpretation decisions

- Genesis announced November 28; actual token event November 29. No HYPE price before token launch.
- Staking launched December 30, not the January 10 recap date.
- Multisig confirmed live by February 10; February 12 is explanatory. Do not invent an exact activation block.
- Permissionless validator updates on March 4/7 announce an upcoming upgrade, not immediate activation.
- Staking fee tiers March 19 proposal, May 5 scheduled implementation are separate events.
- CoreWriter was confirmed live by July 9; later approximate recap is not used to invent a precise earlier date.
- Phantom July 8 original launch is preferred over Hyperliquid's July 9 recap.
- API incident occurred July 29; July 30 report says 14:10–14:47 UTC. API delays are not L1 downtime or a hack.
- October 10 market liquidation shock is distinct from chain downtime; no asserted blockchain failure.
- Hyperdrive September 27 was a third-party application exploit, not an L1 compromise.
- POPCAT: first report November 12, other accounts November 13. Exact UTC onset remains unresolved; no invented
  causal link to the independently described bridge safety lock.
- FARTCOIN ADL: April 9 report, some analyst posts April 8 and weak reposts April 23; no exact onset/loss attribution
  or smart-contract exploit claimed.
- Assistance Fund burn proposal December 17 versus recognition vote December 24; not a new token transfer.
- THYP website/anticipated circular May 11 versus issuer's later SEC financial statements explicitly confirming
  operations and exchange listing May 12. Actual commencement uses May 12, with both evidence types recorded.
- European BHYP ETP April 1 and US BHYP ETF May 15 are different products despite their shared ticker.
- VALR July 2 is an announcement scheduling web access July 6, not an actual July 2 launch claim.
- Manual borrowing confirmed live by September 8; September 18 is a dedicated guide, not assumed activation.
- Payward's original September 16 proposal is preferred over the October 26 protocol recap; subject to regulatory
  approval. A proposal is never labelled a completed US market launch.
- Future scheduled upgrades, payments, unlock totals and new airdrops are not recorded as completed facts without
  evidence. No amount inferred from an asset's price movement; ATH/ATL are not manually fabricated in events.csv.

## 99Bitcoins and status history

All 234 IDs in the shared stored Bitcoin snapshot have explicit HYPE dispositions (before genesis or not established
as HYPE-specific). This does not substitute Bitcoin history for HYPE history. Search did not locate a dedicated
HYPE timeline. Live Bitcoin historical table returned HTTP 403 on this run; live coverage is **not certified**.
The second pass recovered the current official status page. Its October 25 entry records scheduled maintenance:
09:30 UTC in progress, 09:50 completed; expected downtime was around 10 minutes. This is not evidence of a
20-minute unplanned outage. The exact incident URL is saved in event-sources.csv. Historical APIs/full incident
history remain unavailable, so **complete** incident coverage is still unverified. The official API channel has no
readable public preview in the attempted access; a third-party mirror was not treated as authoritative complete history.

## Checks

- CSV parser: npm run test:events.
- Sources: COIN=HYPE node check-event-sources.js (225/225), and all-coin source checks.
- Saved-source reconciliation: python3 audit-99bitcoins.py, all eight configured coins.
- Daily CSV: exact OHLC/date comparison with the retained TradingView input, uniqueness, positive/consistent OHLC,
  consecutive dates, UTC cutoff and no generated estimates.
- Ingestion: make-data.js --strict in an isolated directory, preserving active root data/music.
- No npm run build: that command renders a full film and requires a reviewed event list/visual setup.

## Second-pass corrections and additions

- Correct TradingView aggregate ticker recovered four missing daily candles; first-pass source is preserved.
- Added verified details missing from multi-topic recaps: permissionless spot quote assets, aligned quote assets
  on testnet/mainnet, HIP-3 growth-mode activation confirmation, validator count 24, read precompiles, lending,
  margin/account changes and API refinements. Dates labelled “by update” are as-of confirmations, not invented
  exact activation dates. Routine follow-ups remain remove=true.
- Added the ANIME eligibility announcement with a tokenomics cross-check, Rabby/DeBank support confirmation,
  and Labs' CFTC comment filing/announcement with regulator-hosted records. CFTC letter dated May 21, submission
  list May 22, public recap May 23: these dates are explicitly distinguished. No regulatory approval asserted.
- Official protocol January 4 recap now corroborates burn recognition. Existing 181 event rows/flags are preserved.
- Deferred new draft MFA/redesign entries because generic current documentation does not specifically corroborate
  those historical changes. Evidence remains in second-pass JSON rather than being silently discarded.
- Source-link success and matching CSV counts are structural checks, not factual or exhaustive-history certificates.
