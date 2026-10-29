# Tesla sources and verification limits

Research cutoff: **2026-10-29 morning UTC**; prices through completed US session **2026-10-28**. Every selected event has at least two checked supporting documents, with exact URLs and roles in [event-details.json](data/event-details.json); all retained AND removed rows have [CSV citations](data/event-sources.csv). A source being reachable does not by itself establish a claim.

## Original records

- [Tesla Investor Relations](https://ir.tesla.com/): quarterly results table, shareholder letters and [press archive](https://ir.tesla.com/press). The [source inventory](data/source-inventory.json) preserves all 591 discovered entries across pages 0–118, including duplicate archive entries and pre-IPO/SolarCity notices. Every entry maps to a retained event or explicit removed research row. 589 of 591 canonical archive URLs returned HTTP 200; failures are excluded or replaced, not treated as verified evidence.
- [SEC EDGAR Tesla filings](https://www.sec.gov/edgar/browse/?CIK=1318605&owner=exclude): actual filings/exhibits; annual 10-K provides Q4 context. The earnings date is the release date, not the filing date. SEC hosting of Tesla's disclosure is **not independent SEC confirmation** of the underlying business facts.
- NHTSA recall/investigation records, DOE documents, Delaware court decisions and counterparty/exchange disclosures where relevant. Investigation, recall, proposal, contract signing and completed acquisition are kept distinct.
- Reuters, AP, CBS and other named publications corroborate selected material milestones. Syndicated Reuters/AP copies count as the same newsroom, not multiple independent reports. Some quarter cross-checks have two issuer documents only; no claim that every quarter has independent news corroboration.

[source-access.json](data/source-access.json) records 917 retrieved public documents/pages, HTTP result and SHA-256 of fetched bytes. Hashes describe retrieval, not the correctness of a source. One first-profit news link is available only as indexed search context and is explicitly not counted among the two checked sources; issuer release/filing/letter support the event. Local raw document caches stay in ignored `out/`; metadata and citations are committed.

## Prices and exchange calendar

- TradingView `NASDAQ:TSLA` chart websocket, daily `adjustment: splits`, raw [source CSV](data/tradingview/NASDAQ_TSLA_1D_2010-06-29_2026-10-28.csv). No estimated open sessions. Do not replace source OHLC with news values or IPO offer prices.
- Independent [Yahoo chart API](https://query1.finance.yahoo.com/v8/finance/chart/TSLA), cached as [source-price-yahoo.csv](data/source-price-yahoo.csv). Compare OHLC, not Yahoo adjusted-close total-return series. [Audit](data/price-audit.json) binds source inputs with hashes. Five OHLC differences >0.5% remain unresolved; TradingView retained. Stooq returned a bot challenge and Nasdaq public historical API returned `data:null` for attempted old windows; neither resolved those differences.
- [Nasdaq trading calendar](https://nasdaqtrader.com/Trader.aspx?id=Calendar), [holiday reference](https://www.nasdaq.com/market-activity/stock-market-holiday-schedule). Pinned `exchange_calendars==4.11.2` metadata explicitly resolves XNAS through XNYS. [sessions.csv](data/sessions.csv) includes exchange UTC open/close, DST and early close times through 2027-12-31. [calendar-provenance.json](data/calendar-provenance.json) records this limitation.
- 5:1 effective 2020-08-31 and 3:1 effective 2022-08-25: official announcement sources are attached to the corresponding events and checked against Yahoo split records. No synthetic split-day crash.

## Selection and date review

[All concrete retained/removed decisions](event-review.md) precede rendering. Level 1 = required quarterly updates or material operating milestone. Level 2 = major market/business/legal turning point. Level 0 archive research is excluded when routine, very small, duplicate, pre-IPO or not materially Tesla-specific; reasons remain stored.

Quarterly results and delivery reports are the explicit exception to excluding repetitive news: keep every one. Coverage: 66 earnings quarters, 47 separate delivery releases, 11 embedded delivery discussions; eight early Roadster-era quarters lack a verified, comparable standalone quarterly global delivery release. Do not infer quarterly deliveries by subtracting cumulative Roadster totals. See [quarter coverage](quarter-coverage.md).

[Five corrected date conflicts](data/date-corrections.json): 2011 Q3 earnings Nov 2; 2012 Q1 earnings May 9; 2016 Q2 earnings Aug 3 despite archive/header Aug 2; 2017 Q2 original deliveries July 3, not July 7 follow-up; 2019 Q2 earnings July 24, not table June 24. Event date and reaction-session date are separate. Verified after-close disclosures map to the next actual session; unknown timing is exposed, not guessed. Closed-day announcements map forward while keeping the original date in the label.

All 66 SEC reporting periods were checked against DocumentPeriodEndDate or the report heading. [Filing corrections](data/filing-corrections.json) replace Q1/2013 and Q1/2017 IR links that pointed to previous-year annual reports with the actual corresponding 10-Q. [Period audit](data/quarter-filings-audit.json) preserves URLs and document hashes.

A superficially relevant court PDF (`Download.aspx?id=391030`) was rejected after reading its body: it concerns January 2026 director compensation, not the December 2025 restoration of Musk's 2018 CEO award. The latter uses independently read news sources instead. See [research-limits.json](data/research-limits.json).

This is a documented material-event selection from the full discovered IR archive plus outside sources, **not a guarantee that all news or every possible price driver has been discovered**. No causal link between an event and a price move is asserted merely because dates coincide. Changes after this cutoff require another source/date/coverage audit and event-selection approval.
