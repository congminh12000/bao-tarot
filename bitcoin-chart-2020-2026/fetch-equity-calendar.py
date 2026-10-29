#!/usr/bin/env python3
"""Generate exchange-session metadata before fetching equity OHLC. Requires requirements-equity.txt."""
import argparse, csv, json, os
from pathlib import Path
import exchange_calendars as xc
ROOT = Path(__file__).resolve().parent
p = argparse.ArgumentParser(); p.add_argument('--from', dest='start', required=True); p.add_argument('--to', dest='end', required=True); a = p.parse_args()
coin = json.loads((ROOT/'coins'/os.environ.get('COIN', 'TSLA')/'coin.json').read_text())
if coin.get('assetClass') != 'equity': raise ValueError('Equity asset required')
cal = xc.get_calendar(coin['exchange'], start=a.start, end=a.end)
directory = ROOT / coin.get('dataDir', 'coins/'+coin['symbol']+'/data'); directory.mkdir(exist_ok=True, parents=True)
with (directory/'sessions.csv').open('w') as f:
 w=csv.writer(f, lineterminator='\n'); w.writerow(['date','openUTC','closeUTC'])
 for date, row in cal.schedule.loc[a.start:a.end].iterrows(): w.writerow([str(date.date()), row['open'].isoformat(), row['close'].isoformat()])
(directory/'calendar-provenance.json').write_text(json.dumps({'package': 'exchange_calendars', 'version': xc.__version__, 'requestedExchange': coin['exchange'], 'resolvedCalendar': cal.name, 'from': a.start, 'to': a.end, 'note': 'XNAS aliases XNYS US equity holiday/early-close schedule in this package. Validate every actual price date; unexpected closures require calendar refresh.', 'officialReferences': ['https://nasdaqtrader.com/Trader.aspx?id=Calendar','https://www.nasdaq.com/market-activity/stock-market-holiday-schedule']},indent=2)+'\n')
print(coin['symbol'],len(cal.sessions),'sessions',a.start,a.end,'calendar',cal.name)
