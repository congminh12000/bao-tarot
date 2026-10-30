#!/usr/bin/env python3
"""Acquire original transparent Tesla website navigation icons, not product photography.
No AI artwork, recoloring, background removal or local pixel editing. PNG delivery is
served by Tesla's own CDN. Keep legacy PNG menu variants for S/X and transparent
variants for 3/Y; the current US menu uses opaque JPEGs for 3/Y and omits S/X.
"""
import concurrent.futures,datetime,hashlib,json,pathlib,shutil,subprocess
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parent.parent;D=ROOT/'coins/TSLA/sales';CACHE=ROOT/'out/tesla-nav-research';dest=D/'assets';dest.mkdir(exist_ok=True)
files={'s':'Mega-Menu-Vehicles-Model-S.png','x':'Mega-Menu-Vehicles-Model-X.png','3':'Mega-Menu-Vehicles-Model-3-Performance-LHD.png','y':'Mega-Menu-Vehicles-Model-Y-2-v2.png','ct':'Mega-Menu-Vehicles-Cybertruck-1x.png'}
assets=json.load(open(D/'assets.json'));endpoint='https://www.tesla.com/api/tesla/header/megamenu/v1_2'
def get(item):
 model,name=item;source='https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/'+name
 download='https://digitalassets.tesla.com/tesla-contents/image/upload/f_png,w_880/'+name
 file=dest/('menu-'+model+'.png');cached=CACHE/('icon-'+model+'.png')
 if cached.exists():shutil.copyfile(cached,file)
 else:
  p=subprocess.run(['curl','-LsS','--max-time','40','-w','%{http_code}','-o',str(file),download],capture_output=True,text=True)
  if p.returncode or p.stdout[-3:]!='200':raise RuntimeError('Official Tesla icon unavailable: '+download)
 with Image.open(file) as im:im.verify()
 with Image.open(file) as im:
  size=list(im.size);alpha=im.convert('RGBA').getchannel('A');alphaRange=list(alpha.getextrema())
 if alphaRange != [0,255]:raise RuntimeError('Expected original transparent menu PNG: '+name)
 return model,{'file':str(file.relative_to(ROOT)),'sourceUrl':source,'downloadUrl':download,'sourcePage':'https://www.tesla.com/','menuEndpoint':endpoint,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'pixels':size,'alphaRange':alphaRange,'checkedOn':str(datetime.date.today()),'role':'Official Tesla website vehicle navigation icon; original transparent menu PNG variant','variant':name,'currentUSMenuExactAsset':model=='ct','variantNote':'Current menu icon' if model=='ct' else 'Legacy official menu icon; S/X absent from current US menu' if model in ['s','x'] else 'Official transparent PNG menu variant; current US menu delivers an opaque JPEG variant','legacyDiscovery':'https://rotationyou.tistory.com/43' if model in ['s','x'] else 'https://freelancehunt.com/en/project/svg-images/1513155.html' if model in ['3','y'] else None}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
 for model,a in ex.map(get,files.items()):assets[model]=a;print(model,a['pixels'],a['alphaRange'])
(D/'assets.json').write_text(json.dumps(assets,indent=2)+'\n')
