# YouTube — full film (16:9)

Approved by the user on 2026-10-27 — the template for every YouTube text of this project (PROJECT.md §1.9). Rules:
- The **title** starts with the coin's name ("Bitcoin", "Ethereum", …), has no years, and shows both the price chart and
  the history. Other coins: chapter names in `coins/<SYMBOL>/chapter-names.json`, `COIN=<SYMBOL> node youtube-chapters.js`.
- This film's **title** is fixed (chosen by the user).
- The **description** has no years, no Bitcoin prices and nothing that changes over time (no "today", no current price,
  no "X years", no gain since the start).
- **Chapters**: every ALL-TIME HIGH, every ALL-TIME LOW, every hit-2 event and every halving — no "today" — each
  starting **3 s before** its moment in the video. All-time high / low are written **ATH / ATL**, followed by what
  sets that one apart from the others (no prices, no years), e.g. "ATH: the ICO boom", "ATL: after FTX". Moments closer than 10 s share one chapter (YouTube needs ≥ 10 s per
  chapter and a first chapter at 0:00). Generate them with `node youtube-chapters.js` on the FULL data, from the same
  code + data as the uploaded render (the times move whenever the film's timing changes); names are in that script.

## Title

Bitcoin Price History: Every All-Time High & Crash, Animated in 9 Minutes

## Description

```
Every all-time high. Every crash. The whole story of Bitcoin, told by its price chart.

This animated chart replays Bitcoin's history one daily candle at a time, from its very first trades to the latest close: the bubbles, the brutal bear markets, the exchange collapses, the halvings, the ETFs and the road to six figures.

The market moves in two kinds of phases: a bull run, from an all-time low to the next all-time high, and a bear market, from an all-time high to the next all-time low. Each phase has its own original score: heroic in the climbs, tense in the falls.

⏱ CHAPTERS
<paste the output of: node youtube-chapters.js>

📊 DATA
Daily candles: TradingView, INDEX:BTCUSD.
Events: 99Bitcoins "Bitcoin Historical Events", edited; all-time highs and lows from the TradingView data.

🎵 Music and sound design: original, made for this video.

⚠️ For education and entertainment only. Not financial advice.

#Bitcoin #BTC #Crypto #BitcoinPrice #BitcoinHistory #Cryptocurrency
```

## Chapters (current timeline, film of 9:18)

Checked 2026-10-27 against the kept full render (`out/renders/full/`, same timeline): at each chapter time the label is
not on screen yet, and it is on screen within 1 s after its moment (3 s later).

```
0:00 The first trades
0:14 ATH: the first bubble
0:26 ATL: the first bubble bursts
0:47 First halving · ATH: the Cyprus crisis rally
1:07 ATH: the first great mania
1:17 Mt. Gox collapses
1:49 ATL: after Mt. Gox
2:35 Second halving
3:18 ATH: the ICO boom
3:56 ATL: the crypto winter
4:42 COVID crash · Third halving
5:09 Bitcoin breaks its previous peak
5:21 ATH: Coinbase goes public · China crypto ban
5:34 ATL: after the China ban
5:47 ATH: the second peak of the cycle
6:10 LUNA collapse
6:33 FTX bankruptcy · ATL: after FTX
7:17 Spot ETFs approved · ATH: the ETF rally · Fourth halving
7:49 Bitcoin crosses six figures · ATH: inauguration day
8:19 ATH: the cycle top
8:53 ATL: the cycle bottom
```

## Equity exception — PROJECT.md §18

For equity films use the company name (Tesla), its real business history and original corporate/regulatory sources.
Do not copy Bitcoin title/description, crypto tags, halvings, or 99Bitcoins attribution. Include generated CYCLE LOW
turns in chapters without renaming them ATL; ATL is allowed only for an actual all-time minimum. Chapter timestamps
remain provisional until checked against the kept render of the same full timeline.
