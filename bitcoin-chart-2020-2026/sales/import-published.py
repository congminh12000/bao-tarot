#!/usr/bin/env python3
"""Import only source-published model estimates; never allocate a Tesla group ourselves.
Independent issuer checks establish group scale, NOT exact individual-model truth.
Conflicting 2024+ Other Model estimates remain unaccepted pending reconciliation.
"""
import csv,hashlib,io,json,pathlib,subprocess,datetime
R=pathlib.Path(__file__).resolve().parent.parent;D=R/'coins/TSLA/sales';CACHE=R/'out/sales-research'
def doc(url):
 file=CACHE/(hashlib.sha256(url.encode()).hexdigest()[:20]+'.json')
 if file.exists():return json.load(open(file))
 CACHE.mkdir(parents=True,exist_ok=True);rawfile=file.with_suffix('.bin')
 p=subprocess.run(['curl','-LsS','--max-time','40','-w','%{http_code}','-o',str(rawfile),url],capture_output=True,text=True)
 if p.returncode or p.stdout[-3:]!='200':raise RuntimeError('Public source unavailable; preserve dataset: '+url)
 raw=rawfile.read_bytes();d={'url':url,'status':'200','sha256':hashlib.sha256(raw).hexdigest(),'text':raw.decode(),'retrieval':'Public provider downloadable table/page','fetchedOn':str(datetime.date.today())};file.write_text(json.dumps(d));return d
def save(name,value):(D/name).write_text(json.dumps(value,indent=2,ensure_ascii=False)+'\n')
sources=json.load(open(D/'sources.json'));obs=json.load(open(D/'observations.json'));idx={r['quarter']:r for r in json.load(open(D/'report-index.json'))}
url='https://datawrapper.dwcdn.net/3hcKb/9/dataset.csv';article='https://cleantechnica.com/2026/07/02/tesla-has-its-4th-best-quarter-ever/';meta='https://datawrapper.dwcdn.net/3hcKb/9/'
for u,group in [(url,'CleanTechnica'),(article,'CleanTechnica'),(meta,'CleanTechnica')]:
 d=doc(u);assert d['status']=='200';sid='public-'+hashlib.sha256(u.encode()).hexdigest()[:12];sources[sid]={'url':u,'publisherGroup':group,'checked':True,'sha256':d['sha256'],'checkedOn':d.get('fetchedOn','2026-10-29'),'role':'Published worldwide model estimates; source notes acknowledge assumptions/Troy Teslike; exact model accuracy not independently confirmed.'}
sid='public-'+hashlib.sha256(url.encode()).hexdigest()[:12];data=doc(url)['text'];(D/'published-model-estimates.tsv').write_text(data)
table=list(csv.reader(io.StringIO(data),delimiter='\t'));models={'Tesla Model 3':'3','Tesla Model Y':'y','Tesla Model S':'s','Tesla Model X':'x','Tesla Cybertruck':'ct'};cfg=json.load(open(D/'config.json'));launch={m['id']:m['firstQuarter'] for m in cfg['models']};candidates=[]
for r in table[1:]:
 model=models[r[0]]
 for i,label in enumerate(table[0][1:],1):
  quarter=label[3:]+'Q'+label[1];value=r[i]
  if quarter<launch[model] or not value:continue
  units=int(value);existing=next((o for o in obs.values() if o['accepted'] and o['quarter']==quarter and o['model']==model),None)
  blocked=model in ['s','x','ct'] and quarter>='2024Q1'
  decision='retained-preferred-issuer' if existing else 'unresolved-other-model-estimates' if blocked else 'accepted-published-estimate'
  candidates.append({'quarter':quarter,'model':model,'units':units,'sourceId':sid,'decision':decision,'reason':'2024+ Other Models split requires reconciliation: Cybertruck global estimates can fall below independently published US estimates. No arbitrary repair.' if blocked else 'Source-published estimate; check with issuer group context, not independent confirmation of exact individual value.'})
  if (existing and existing.get('sourceIds') != [sid]) or blocked:continue
  refs=[k for k,v in sources.items() if v['url'] in idx[quarter]['urls'] and v.get('checked') and v['publisherGroup']=='Tesla'];assert refs
  oid=f'{quarter}-{model}-published-estimate'
  obs[oid]={'accepted':True,'quarter':quarter,'model':model,'units':units,'geography':'global','metric':'deliveries','grouped':False,'status':'estimated','sourceIds':[sid],'excerpt':'\t'.join(r),'tableCell':{'column':label,'row':r[0],'units':units},'methodology':'CleanTechnica author-published informed estimates drawing on Troy Teslike, EV-Volumes and issuer disclosures. Imported unchanged; no model allocation computed here. Provider assumptions are not fully reproducible; uncertainty is not quantified.','crossChecks':refs,'crossCheckScope':'Independent Tesla issuer quarter/group context ONLY; not independent verification of the exact model split.','reviewNote':'Published estimate, shown with ≈. Independent issuer reports check quarter and group context, not each estimated model. Later group revisions are not redistributed.','independentCorroboration':False,'reviewedOn':'2026-10-29'}
save('sources.json',sources);save('observations.json',obs);save('published-candidates.json',candidates)
with open(D/'deliveries.csv',newline='') as f:reader=csv.DictReader(f);fields=reader.fieldnames;rows=list(reader)
for r in rows:
 chosen=next(((k,o) for k,o in obs.items() if o.get('accepted') and o['quarter']==r['quarter'] and o['model']==r['model']),None)
 if chosen:
  k,o=chosen;r.update(status=o['status'],units=o['units'],observation=k,note=o['reviewNote'])
with open(D/'deliveries.csv','w',newline='') as f:w=csv.DictWriter(f,fieldnames=fields,lineterminator='\n');w.writeheader();w.writerows(rows)
print('Accepted observations:',sum(o.get('accepted',False) for o in obs.values()),'published candidates:',len(candidates),'unresolved:',sum(c['decision'].startswith('unresolved') for c in candidates))
