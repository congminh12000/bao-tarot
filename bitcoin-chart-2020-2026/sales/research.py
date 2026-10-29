#!/usr/bin/env python3
"""Fetch cited official reports and extract individual-model observations conservatively.
No grouped split, country-as-global substitution or annual-to-quarter allocation.
Unaccepted/missing cells remain empty; render is a separate, gated operation.
"""
import csv, datetime, gzip, hashlib, json, pathlib, re, subprocess, concurrent.futures
from lxml import html
ROOT=pathlib.Path(__file__).resolve().parent.parent;D=ROOT/'coins/TSLA/sales';CACHE=ROOT/'out/sales-research';CACHE.mkdir(exist_ok=True,parents=True)
config=json.load(open(D/'config.json'));index=json.load(open(D/'report-index.json'));legacy=ROOT/'out/tsla-research/docs'
def save(name,x):(D/name).write_text(json.dumps(x,indent=2,ensure_ascii=False)+'\n')
def get(url):
 key=hashlib.sha256(url.encode()).hexdigest()[:20];file=CACHE/(key+'.json')
 if file.exists():return json.load(open(file))
 old=legacy/(key+'.json')
 if old.exists():d=json.load(open(old));d['retrieval']='Existing Tesla public-document cache; bytes/hash preserved'
 else:
  dest=CACHE/(key+'.bin');p=subprocess.run(['curl','-LsS','--max-time','40','--retry','1','-w','%{http_code}','-o',str(dest),url],capture_output=True,text=True);raw=dest.read_bytes() if dest.exists() else b'';kind='pdf' if raw.startswith(b'%PDF') else 'html';text=''
  if p.stdout[-3:]=='200':
   if kind=='pdf':text=subprocess.run(['pdftotext','-layout',str(dest),'-'],capture_output=True,text=True).stdout
   else:
    try:
     h=html.fromstring(raw)
     for node in h.xpath('//script|//style|//*[local-name()="hidden"]'):node.drop_tree()
     text=' '.join(h.itertext())
    except Exception:pass
  d={'url':url,'status':p.stdout[-3:],'kind':kind,'sha256':hashlib.sha256(raw).hexdigest(),'text':text,'retrieval':'Public URL fetched with inherited proxy and TLS trust'}
 file.write_text(json.dumps(d));return d
urls=sorted({u for q in index for u in q['urls']})
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:docs={d['url']:d for d in ex.map(get,urls)}
sources=json.load(open(D/'sources.json')) if (D/'sources.json').exists() else {};sourceID={}
for u,d in docs.items():
 sid='tesla-'+hashlib.sha256(u.encode()).hexdigest()[:12];sourceID[u]=sid;sources[sid]={'url':u,'publisherGroup':'Tesla','checked':d['status']=='200' and len(d['text'])>500,'sha256':d['sha256'],'httpStatus':d['status'],'retrieval':d.get('retrieval','public cache'),'role':'issuer report; SEC republication is not an independent newsroom'}
# Lifecycle proof comes from already reviewed primary citations; not from speculative sale dates.
existing=json.load(open(ROOT/'coins/TSLA/data/event-details.json'))
launchkeys={'s':'2012-06-22|First Model S deliveries','x':'2015-09-29|First Model X deliveries','3':'2017-07-28|First Model 3 deliveries','ct':'2023-11-30|First Cybertruck deliveries'}
for model in config['models']:
 us=([s['url'] for s in existing[launchkeys[model['id']]]['sources'] if s.get('checked')] if model['id'] in launchkeys else ['https://ir.tesla.com/press-release/tesla-q1-2020-vehicle-production-deliveries'])
 model['launchSources']=[]
 for u in us:
  sid=sourceID.get(u) or 'tesla-'+hashlib.sha256(u.encode()).hexdigest()[:12]
  if sid not in sources:
   d=get(u);sources[sid]={'url':u,'publisherGroup':'Tesla' if 'tesla.com' in u or 'sec.gov' in u else 'External corroboration','checked':d['status']=='200' and len(d['text'])>500,'sha256':d['sha256'],'role':'delivery-launch date proof'}
  model['launchSources'].append(sid)
# Preserve existing manually reviewed observations; candidates do not become facts by matching a regex.
observations=json.load(open(D/'observations.json')) if (D/'observations.json').exists() else {}
candidates=[];N=r'\d{1,3}(?:,\d{3})+|\d{3,}'
for q in index:
 for u in q['urls']:
  d=docs[u];text=' '.join(d['text'].split());sid=sourceID[u]
  # Exact as-published quarter release sentences only; no annual/forward-looking counts.
  for sentence in re.split(r'(?<=[.!?])\s+',text):
   if not re.search(r'\bdeliver(?:ed|ies)\b',sentence,re.I):continue
   if any(x in sentence.lower() for x in ['we expect','we plan','forecast','target','in transit','full year','full-year']):continue
   if len(sentence)>1800:continue
   if re.search(r'\b(?:US|U\.S\.|North America|Europe|China|United States)\b',sentence):continue
   # Number before one concrete model; reject S/X, S and X and production clauses.
   for m in re.finditer(r'(?P<n>'+N+r')\s+(?:were\s+)?Model\s+(?P<m>S|X|3|Y)\b(?!\s*(?:/|and)\s*(?:Model\s*)?[SXY3]\b)',sentence):
    excerpt=sentence[max(0,m.start()-140):m.end()+170]
    if re.search(r'\bproduc(?:ed|tion)\b',sentence[:m.start()],re.I):continue
    candidates.append({'quarter':q['quarter'],'model':m['m'].lower(),'units':int(m['n'].replace(',','')),'sourceId':sid,'url':u,'excerpt':excerpt,'review':'candidate; requires literal quarter/model/delivery/context verification'})
save('config.json',config);save('sources.json',sources);save('extraction-candidates.json',candidates)
print('Retrieved',len(docs),'reports; candidate observations',len(candidates),'sources',len(sources))
for c in candidates:
 if c['quarter']<='2019Q4':print(c['quarter'],c['model'],c['units'],c['excerpt'][:230])
