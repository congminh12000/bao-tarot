# 99Bitcoins source coverage audit — 2026-10-27

Scope: all four configured coins (BTC, ETH, BNB, XRP), and every entry in the live **Bitcoin Historical Events** table.
This is a coverage audit of a named source, not certification of every event in a coin's history or every news article.

- Source table: https://99bitcoins.com/cryptocurrency/bitcoin/historical-price/
- 234 entries, source IDs 1–234, source dates 2009-01-03–2025-07-15. Retrieval on 2026-10-27 does not imply events through that date.
- `snapshot.json`: each source ID, source date, factual title and fragment URL, plus retrieval metadata and document hash.
- `discovery.json`: 13 successful article/page/coin sitemap checks, actual URL probes and redirects. ETH/BNB/XRP historical
  paths redirect to Bitcoin. Actual altcoin price pages have zero event-table entries. No separate curated altcoin timeline
  was discovered; do not describe this as "a complete 99Bitcoins ETH/BNB/XRP timeline".
- Each coin's data directory contains `99bitcoins-coverage.json` with exactly one disposition per source ID:
  stored with target CSV row; outside the saved coin history; or not applicable with a recorded reason.
- No source ID is silently omitted. Excluded items remain in the common snapshot; BTC-only protocol/price/adoption events
  are not asserted to be ETH/BNB/XRP events. Shared context does not prove price causation.
- `summary.json`: research dataset totals and disposition counts.

| Coin | Additions after initial preparation | Total historical rows | Level 0 / 1 / 2 | Reviewed source IDs |
| --- | ---: | ---: | --- | --- |
| BTC | 119 | 238 | 119 / 102 / 17 | 234/234 |
| ETH | 48 + 5 official milestones | 79 | 53 / 12 / 14 | 234/234 |
| BNB | 41 + 18 sourced milestones; levels reviewed | 92 | 56 / 24 / 12 | 234/234 |
| XRP | 55 + 353 multi-source additions; levels reviewed | 484 | 354 / 114 / 16 | 234/234 |

BTC's original 238-row import is in git commit `c3d3e43b`: 234 source events plus four additional authored ATH rows.
Restore all 119 filtered level-0 entries without replacing approved level-1/2 labels or price-derived ATHs.
Source #77 is dated 2017-12-18; the authored ATH target uses TradingView 2017-12-17. Both dates remain explicitly recorded.
Coin-specific official-source additions remain in place. XRP's earlier 56 level-0 entries are preserved.

## Known limits and source-date conflicts

Sitemap discovery cannot prove that no unindexed, removed, future or differently titled page exists. Do not equate a
search failure, 404, redirect or plain price chart with an empty historical event list. Refresh and investigate as needed.
Source titles/dates are source claims, not independent fact checks. In particular source #44 (sentencing), #207 (US order)
and #220 (Silvergate) need primary-source date review; the coverage files flag these rather than silently rewriting source dates.
New imports retain level 0 and their factual-review notes; under PROJECT.md §14 they are visible on altcoins, hidden on BTC.

## Verify / refresh workflow

```bash
python3 audit-99bitcoins.py          # all configured coins against saved snapshot and actual CSV targets
python3 audit-99bitcoins.py --live   # additionally fail if live source IDs, dates, titles or anchors changed
```

On source changes, update the snapshot and reconcile **every** new/changed ID for **every** configured coin; retain
excluded/out-of-range items with reasons. Record retrieval and actual latest source-event dates. Never overwrite an
approved correction or TradingView price with an unchecked article claim. Keep all research levels 0/1/2; the visible
film displays levels 1/2 for BTC and levels 0/1/2 for every altcoin (PROJECT.md §14).

## Quy tắc hiển thị mới — 27/10/2026

PROJECT.md §14 thay thế ghi chú hiển thị cũ: thu thập đủ 0/1/2 cho mọi coin; BTC ẩn 0, mọi altcoin hiện đủ 0/1/2.
Mức 0 là nhãn nhỏ/xám không SFX, tham gia chống chồng lấn. Audit và các nguồn dữ liệu vẫn được giữ nguyên.

ETH follow-up: five official milestones added, source #207 and #220 dates corrected with primary sources. Original
source dates remain in the snapshot and correction records. Other coins retain their existing review flags.

BNB follow-up: 18 sourced milestones and the approved level review bring the dataset to 92 rows (56 / 24 / 12).
The archived 234-entry source snapshot and its coverage dispositions are unchanged.

XRP follow-up (2026-10-28): 484 sourced events; fourteen prior labels/dates clarified against primary sources.
Automatic editorial grading was explicitly requested. Original source dates remain in the snapshot; corrected
targets and explanations are retained in XRP coverage and `review-20261028.json`. All 97 dated mainnet amendment
activations are reconciled, including one explorer majority/activation conflict resolved by validated transactions.
See the XRP source inventory for archive gaps and issuer-only claims; this is not exhaustive world-news coverage.
