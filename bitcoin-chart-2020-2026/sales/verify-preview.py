#!/usr/bin/env python3
"""Verify a bounded sales preview, decoded frames, timestamp continuity and AAC/master sync.
Image arrays are read only for comparison; no generated picture or sales data is altered.
"""
import hashlib,json,pathlib,re,subprocess,sys
import numpy as np
from PIL import Image
W=pathlib.Path(sys.argv[1]).resolve();P=json.load(open(W/'manifest.json'));a,b=P['renderWindow'];fps=P['fps'];O=W/'out';Q=O/'qa';Q.mkdir(exist_ok=True)
F=O/f'clip_{a:.2f}-{b:.2f}-480p.mp4'
def run(args):return subprocess.run(args,check=True,capture_output=True)
def probe(args):return json.loads(run(['ffprobe','-v','error',*args,'-of','json',str(F)]).stdout)
info=probe(['-count_frames','-show_streams','-show_format']);(Q/'ffprobe.json').write_text(json.dumps(info,indent=2)+'\n')
v=next(s for s in info['streams'] if s['codec_type']=='video');au=next(s for s in info['streams'] if s['codec_type']=='audio')
expected=round((b-a)*fps);assert int(v['nb_read_frames'])==expected;assert (v['width'],v['height'])==(854,480);assert v['avg_frame_rate']=='60/1';assert v['codec_name']=='h264' and au['codec_name']=='aac';assert abs(float(info['format']['duration'])-(b-a))<2/fps
frames=probe(['-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp_time']);pts=np.array([float(r['best_effort_timestamp_time']) for r in frames['frames']]);err=float(np.max(np.abs(pts-np.arange(expected)/fps)));assert err<1e-5
run(['ffmpeg','-v','error','-i',str(F),'-f','null','-'])
loud=run(['ffmpeg','-hide_banner','-i',str(F),'-af','loudnorm=I=-16:TP=-1:LRA=11:print_format=json','-f','null','-']);(Q/'aac-loudness.log').write_bytes(loud.stderr)
measurement=json.loads(re.findall(r'\{[^{}]*"input_i"[^{}]*\}',loud.stderr.decode())[-1]);assert float(measurement['input_tp'])<=0
# Decode original master and delivered AAC through identical mono resampling.
def pcm(file,start,duration):
 return np.frombuffer(run(['ffmpeg','-v','error','-ss',str(start),'-i',str(file),'-t',str(duration),'-ac','1','-ar','8000','-f','f32le','-']).stdout,dtype='<f4').astype(np.float64)
reference=pcm(O/'music.wav',a,b-a);actual=pcm(F,0,b-a);n=min(len(actual),len(reference));actual,reference=actual[:n],reference[:n];sync=[]
for center in ([1.5,14.2,35,120,200,239.5,240.5,310.2,359.5,360.5,454,477] if P.get('fullResearchPreview') else [1.5,4,9,14.2,20.2,27,34]):
 start=int((center-.5)*8000);end=start+8000;margin=160;r=reference[start:end];sample=actual[start-margin:end+margin];cross=np.correlate(sample,r,'valid');offset=int(np.argmax(cross));lag=offset-margin;aa=sample[offset:offset+len(r)];corr=float(np.dot(aa,r)/np.sqrt(np.dot(aa,aa)*np.dot(r,r)));assert abs(lag)<=8,(center,lag);assert corr>.98,(center,corr);sync.append({'clipTime':center,'lagMs':lag/8,'correlation':corr})
# Keep decoded frames and compare to native PNG references (same timeline/canvas).
comparisons=[]
for t in ([0,15,45,100,200,317,325,330,340,370,400,445,460] if P.get('fullResearchPreview') else [306,310,310.4,317,325,330] if P['config'].get('motion')=='continuous' else [306,310.4,317]):
 ref=O/'stills'/f't_{t:06.2f}.png';dest=Q/f'decoded-{t:.2f}.png';run(['ffmpeg','-v','error','-ss',str(t-a),'-i',str(F),'-frames:v','1','-y',str(dest)]);x=np.array(Image.open(ref).convert('RGB'),dtype=float);y=np.array(Image.open(dest).convert('RGB'),dtype=float);mae=float(np.mean(np.abs(x-y)));assert mae<4,(t,mae);comparisons.append({'scoreTime':t,'mae255':mae})
events=[e for e in P['events'] if a<=e['t']<b];sfx=[]
for e in events:
 stem=pcm(O/'stem-hFx.wav',e['t'],.6);peak=float(np.max(np.abs(stem)));assert peak>1e-4;sfx.append({'scoreTime':e['t'],'kind':e['kind'],'peak':peak})
# Retain exact encoded picture for future audio-only changes.
run(['ffmpeg','-v','error','-i',str(F),'-map','0:v:0','-c','copy','-an','-y',str(O/'preview-silent-kept.mp4')])
report={'file':str(F),'sha256':hashlib.sha256(F.read_bytes()).hexdigest(),'bytes':F.stat().st_size,'duration':b-a,'frames':expected,'fps':fps,'resolution':[v['width'],v['height']],'maxPtsErrorSeconds':err,'aacLoudness':measurement,'sync':sync,'decodedFrameComparisons':comparisons,'sfxEvents':sfx,'contentHash':P['contentHash'],'codeHash':P['codeHash'],'fullDatasetReady':P['fullDataReady'],'scope':'Research preview only; published estimates marked; no claim of full historical data completeness.','listeningStatus':'Measured only; not listened to.'}
if P['config'].get('motion')=='continuous' and not P.get('fullResearchPreview'):
 js="""const w=process.argv[1],m=require(w+'/manifest.json'),C=require(w+'/core');const [a,b]=m.renderWindow;let old=C.stateAt(m,a),stopped=0;for(let n=1;n<Math.round((b-a)*m.fps);n++){const s=C.stateAt(m,a+n/m.fps);if(!s.rows.some(r=>r.visible&&old.rows.some(p=>p.visible&&p.model.id===r.model.id&&Math.abs(p.visualUnits-r.visualUnits)>1e-8)))stopped++;old=s;}console.log(JSON.stringify({framePairs:Math.round((b-a)*m.fps)-1,stationaryPairs:stopped,samples:[317,325,330].map(t=>({t,units:C.stateAt(m,t).rows.find(r=>r.model.id==='y').visualUnits}))}));"""
 motion=json.loads(run(['node','-e',js,str(W)]).stdout);assert motion['stationaryPairs']==0
 edges=[]
 for sample in motion['samples']:
  image=np.array(Image.open(Q/f"decoded-{sample['t']:.2f}.png").convert('RGB'))
  scan=image[146,191:685,:].astype(int);color=next(m['color'] for m in P['config']['models'] if m['id']=='y');rgb=np.array([int(color[i:i+2],16) for i in [1,3,5]]);mask=np.linalg.norm(scan-rgb,axis=1)<80;where=np.flatnonzero(mask);assert len(where)>200
  actualEdge=int(where[-1]+191);expectedEdge=(430+1110*sample['units']/P['axisMax'])*480/1080;assert abs(actualEdge-expectedEdge)<8
  edges.append({'scoreTime':sample['t'],'decodedEdgePx':actualEdge,'expectedEdgePx':expectedEdge})
 assert edges[0]['decodedEdgePx']<edges[1]['decodedEdgePx']<edges[2]['decodedEdgePx']
 motion['decodedBarEdges']=edges;report['continuousMotion']=motion
if P.get('fullResearchPreview'):
 report['missingCells']=P['coverage']['missingCells'];report['summaryMode']='coverage only; no partial sums/winner claims';report['fullResearchPreview']=True
 edges=[]
 for t in [317,325,330]:
  pixels=np.array(Image.open(Q/f'decoded-{t:.2f}.png').convert('RGB'))[146,191:685,:].astype(int)
  color=next(m['color'] for m in P['config']['models'] if m['id']=='y');rgb=np.array([int(color[i:i+2],16) for i in [1,3,5]])
  where=np.flatnonzero(np.linalg.norm(pixels-rgb,axis=1)<80);assert len(where)>200
  edges.append({'scoreTime':t,'decodedEdgePx':int(where[-1]+191)})
 assert edges[0]['decodedEdgePx']<edges[1]['decodedEdgePx']<edges[2]['decodedEdgePx'];report['decodedContinuousBarEdges']=edges
(Q/'verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
