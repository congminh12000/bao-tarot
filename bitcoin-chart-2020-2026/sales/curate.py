#!/usr/bin/env python3
"""Reproduce the explicitly reviewed initial facts. Never promotes regex candidates."""
import csv, hashlib, json, pathlib
ROOT=pathlib.Path(__file__).resolve().parent.parent; D=ROOT/'coins/TSLA/sales'
def save(name,value):(D/name).write_text(json.dumps(value,indent=2,ensure_ascii=False)+'\n')
config=json.load(open(D/'config.json'));sources=json.load(open(D/'sources.json'));candidates=json.load(open(D/'extraction-candidates.json'));observations={}
def accept(q,model,units,suffix,quote,note='Revised issuer individual-model quarterly delivery count.'):
 sid=next(k for k,v in sources.items() if v['url'].endswith(suffix));url=sources[sid]['url']
 f=ROOT/'out/sales-research'/(hashlib.sha256(url.encode()).hexdigest()[:20]+'.json')
 text=' '.join(json.load(open(f))['text'].split())
 assert quote in text,(q,model,'Literal quotation not present')
 oid=f'{q}-{model}-issuer-revised'
 observations[oid]={'accepted':True,'quarter':q,'model':model,'units':units,'geography':'global','metric':'deliveries','grouped':False,'status':'reported','sourceIds':[sid],'excerpt':quote,'reviewNote':note,'reviewedOn':'2026-10-29','independentCorroboration':False}
accept('2015Q1','s',10045,'Tesla_Motors_Q1_15_Shareholder_Letter','10,045 Model S vehicles were delivered in Q1')
accept('2015Q2','s',11532,'Tesla_Q2_2015_Shareholder_Letter','We delivered 11,532 Model S vehicles in Q2')
accept('2015Q4','x',206,'Q4_15_Tesla_Update_Letter','We delivered 17,478 vehicles in Q4, including 206 Model X vehicles.')
for q,model,n,suffix,quote in [
 ('2016Q2','s',9764,'Q2_16_Update_Letter_-_final','9,764 Model S'),('2016Q2','x',4638,'Q2_16_Update_Letter_-_final','4,638 Model X'),
 ('2016Q3','s',16047,'Q3_16_Update_Letter_-_final','16,047 Model S'),('2016Q3','x',8774,'Q3_16_Update_Letter_-_final','8,774 Model X'),
 ('2017Q3','3',222,'TSLA_Update_Letter_2017-3Q','222 Model 3 vehicles'),('2017Q4','3',1542,'TSLA_Update_Letter_2017-4Q','1,542 Model 3 vehicles'),
 ('2018Q1','3',8182,'TSLA_Update_Letter_2018-1Q','8,182 Model 3 vehicles'),('2018Q2','3',18449,'TSLA-Update-Letter-2018-2Q','18,449 Model 3 vehicles'),('2018Q3','3',56065,'TSLA_Update_Letter_2018-3Q','In Q3, we delivered 56,065 Model 3s to customers.')]:
 accept(q,model,n,suffix,quote)
for q,n in [('2018Q4',63359),('2019Q1',50928),('2019Q2',77634),('2019Q3',79703),('2019Q4',92620)]:
 accept(q,'3',n,'TSLA_Update_Letter_2019-4Q','Model 3 deliveries 63,359 50,928 77,634 79,703 92,620','Global operational table: columns Q4-2018, Q1-2019, Q2-2019, Q3-2019, Q4-2019. S/X row is grouped and is NOT split.')
if (D/'observations.json').exists() and (D/'deliveries.csv').exists():
 existing=json.load(open(D/'observations.json'))
 for key,value in observations.items():
  assert key in existing and all(existing[key].get(field)==value[field] for field in ['quarter','model','units','excerpt','sourceIds']),'Seed fact differs; manual revision review required: '+key
 print('Verified 17 seed quotations; existing observations and matrix preserved.');raise SystemExit(0)
save('observations.json',observations)
rows=[]
for year in range(2015,2027):
 for quarter in range(1,5):
  q=f'{year}Q{quarter}'
  if q>config['to']:continue
  for m in config['models']:
   obs=next(((k,v) for k,v in observations.items() if v['quarter']==q and v['model']==m['id']),None)
   before=q<m['firstQuarter'];reason='Not launched; see config launchSources.' if before else 'Individual-model global quarterly figure not verified; grouped, regional, annual and simulated figures excluded.'
   rows.append({'quarter':q,'model':m['id'],'geography':'global','metric':'deliveries','status':'reported' if obs else 'not_launched' if before else 'missing','units':obs[1]['units'] if obs else '', 'observation':obs[0] if obs else '', 'note':obs[1]['reviewNote'] if obs else reason})
with open(D/'deliveries.csv','w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
print('Accepted explicit facts:',len(observations),'matrix cells:',len(rows))
