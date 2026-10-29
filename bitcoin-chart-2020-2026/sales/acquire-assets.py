#!/usr/bin/env python3
"""Download official product photography; no sales frames or synthetic vehicle art."""
import concurrent.futures,hashlib,json,pathlib,re,subprocess
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parent.parent;D=ROOT/'coins/TSLA/sales';CACHE=ROOT/'out/sales-research';dest=D/'assets';dest.mkdir(exist_ok=True)
files={'s':('models','Model-S-New-Exterior-Carousel-Slide-1-Desktop-NA.png'),'x':('modelx','Model-X-New-Exterior-Carousel-Slide-1-Entry-Desktop.jpg'),'3':('model3','Model-3-Social.jpg'),'y':('modely','Model-Y-Exterior-Carousel-Slide-1-Desktop.png'),'ct':('cybertruck','Cybertruck-Main-Hero-Desktop-v3.jpg')}
assets=json.load(open(D/'assets.json'))
def get(item):
 model,(page,name)=item;text=(CACHE/(page+'-page.html')).read_text()
 urls=re.findall(r'https://digitalassets.tesla.com/tesla-contents/image/upload/[^\s\"\'<>\\]+',text)
 url=next(u for u in urls if u.endswith('/'+name))
 # Explicit JPEG + width cap, derived only from exact official page URL, not guessed artwork.
 imageUrl=url.replace('/f_auto,q_auto/','/f_jpg,q_85,w_1000/')
 file=dest/(model+'.jpg');p=subprocess.run(['curl','-LsS','--max-time','40','-w','%{http_code}','-o',str(file),imageUrl],capture_output=True,text=True)
 assert p.stdout[-3:]=='200',(model,p.stdout,p.stderr)
 with Image.open(file) as im: im.verify()
 with Image.open(file) as im: size=list(im.size)
 return model,{'file':str(file.relative_to(ROOT)),'sourceUrl':url,'downloadUrl':imageUrl,'sourcePage':'https://www.tesla.com/'+page,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'pixels':size,'checkedOn':'2026-10-29','role':'Official product photograph; current appearance, not a historical quarter-specific trim'}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
 for model,a in ex.map(get,files.items()):assets[model]=a;print(model,a['pixels'])
(D/'assets.json').write_text(json.dumps(assets,indent=2)+'\n')
