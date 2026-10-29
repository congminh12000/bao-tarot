#!/usr/bin/env python3
"""Compare raw split-adjusted TradingView OHLC to Yahoo, without changing candles/calendar.
COIN=TSLA python3 audit-equity-prices.py [--yahoo-json saved-chart.json] [--check-only]
Refresh sessions.csv before fetching. Differences are reported, never auto-corrected.
"""
import argparse, csv, datetime as dt, hashlib, json, os, pathlib, statistics, subprocess, urllib.parse
p = argparse.ArgumentParser(); p.add_argument('--yahoo-json', type=pathlib.Path); p.add_argument('--check-only', action='store_true'); args = p.parse_args()
root = pathlib.Path(__file__).resolve().parent
coin = json.loads((root/'coins'/os.environ.get('COIN','TSLA').upper()/'coin.json').read_text())
if coin.get('assetClass') != 'equity': raise ValueError('Select an equity')
directory = root/coin.get('dataDir', f"coins/{coin['symbol']}/data")
files = sorted((directory/'tradingview').glob('*.csv')); real = {}
for file in files:
 for r in csv.DictReader(file.open()): real[r['time']] = {k:float(r[k]) for k in ['open','high','low','close']}
if not real: raise ValueError('No TradingView candles')
start, end = min(real), max(real)
calendar = list(csv.DictReader((directory/'sessions.csv').open())); sessions = {r['date'] for r in calendar if start <= r['date'] <= end}
missing, extra = sorted(sessions-real.keys()), sorted(real.keys()-sessions)
if missing or extra: raise ValueError(f'Missing sessions: {missing}; unexpected: {extra}')
for date, r in real.items():
 if min(r.values()) <= 0 or r['high'] < max(r['open'],r['close']) or r['low'] > min(r['open'],r['close']): raise ValueError('Invalid OHLC '+date)
url = 'https://query1.finance.yahoo.com/v8/finance/chart/'+urllib.parse.quote(coin['symbol'])
if args.yahoo_json: payload=json.loads(args.yahoo_json.read_text())
else:
 epoch=lambda d:int(dt.datetime.fromisoformat(d).replace(tzinfo=dt.timezone.utc).timestamp())
 params=urllib.parse.urlencode({'period1':epoch(start),'period2':epoch(end)+86400,'interval':'1d','events':'splits'})
 raw=subprocess.run(['curl','--fail','--silent','--show-error','--location','--max-time','90',url+'?'+params],check=True,capture_output=True,text=True).stdout
 payload=json.loads(raw)
y=payload['chart']['result'][0]; q=y['indicators']['quote'][0]; fields=['open','high','low','close']
independent={dt.datetime.fromtimestamp(t,dt.timezone.utc).strftime('%Y-%m-%d'):{k:q[k][i] for k in fields} for i,t in enumerate(y['timestamp'])}
errors=[]; differences=[]
for date,r in sorted(real.items()):
 if date not in independent or any(independent[date][k] is None for k in fields): raise ValueError('Independent OHLC missing '+date)
 for k in fields:
  value=independent[date][k]; error=abs(r[k]-value)/r[k]; errors.append(error)
  if error>.005: differences.append({'date':date,'field':k,'tv':r[k],'yahoo':value,'relative':error})
report={'symbol':coin['tradingview'],'adjustment':'splits','range':[start,end],'candles':len(real),'sessions':len(sessions),'missingSessions':missing,'unexpectedSessions':extra,
 'calendarPackage':json.loads((directory/'calendar-provenance.json').read_text()),
 'comparison':{'source':'Yahoo Finance chart API','url':url,'matchedFields':len(errors),'medianRelativeError':statistics.median(errors),'maximumRelativeError':max(errors),'differencesOver0.5Percent':differences},
 'splits':list(y.get('events',{}).get('splits',{}).values()),
 'decision':{'policy':'Preserve raw TradingView values. Cross-provider discrepancies are reported, not silently corrected.'}}
if not args.check_only:
 comparison=directory/'source-price-yahoo.csv'
 with comparison.open('w') as f:
  w=csv.writer(f,lineterminator='\n'); w.writerow(['date',*fields]); w.writerows([date,*[independent[date][k] for k in fields]] for date in sorted(real))
 report['inputHashes']={str(f.relative_to(directory)):hashlib.sha256(f.read_bytes()).hexdigest() for f in [*files,comparison]}
 (directory/'price-audit.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'range':[start,end],'candles':len(real),'matchedFields':len(errors),'differencesOver0.5Percent':len(differences),'maximumRelativeError':max(errors),'checkOnly':args.check_only},indent=2))
