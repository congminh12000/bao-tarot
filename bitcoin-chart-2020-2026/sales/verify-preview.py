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
for center in [1.5,4,9,14.8,20.2,27,34]:
 start=int((center-.5)*8000);end=start+8000;margin=160;r=reference[start:end];sample=actual[start-margin:end+margin];cross=np.correlate(sample,r,'valid');offset=int(np.argmax(cross));lag=offset-margin;aa=sample[offset:offset+len(r)];corr=float(np.dot(aa,r)/np.sqrt(np.dot(aa,aa)*np.dot(r,r)));assert abs(lag)<=8,(center,lag);assert corr>.98,(center,corr);sync.append({'clipTime':center,'lagMs':lag/8,'correlation':corr})
# Keep decoded frames and compare to native PNG references (same timeline/canvas).
comparisons=[]
for t in [306,310.4,317]:
 ref=O/'stills'/f't_{t:.2f}.png';dest=Q/f'decoded-{t:.2f}.png';run(['ffmpeg','-v','error','-ss',str(t-a),'-i',str(F),'-frames:v','1','-y',str(dest)]);x=np.array(Image.open(ref).convert('RGB'),dtype=float);y=np.array(Image.open(dest).convert('RGB'),dtype=float);mae=float(np.mean(np.abs(x-y)));assert mae<4,(t,mae);comparisons.append({'scoreTime':t,'mae255':mae})
events=[e for e in P['events'] if a<=e['t']<b];sfx=[]
for e in events:
 stem=pcm(O/'stem-hFx.wav',e['t'],.6);peak=float(np.max(np.abs(stem)));assert peak>1e-4;sfx.append({'scoreTime':e['t'],'kind':e['kind'],'peak':peak})
# Retain exact encoded picture for future audio-only changes.
run(['ffmpeg','-v','error','-i',str(F),'-map','0:v:0','-c','copy','-an','-y',str(O/'preview-silent-kept.mp4')])
report={'file':str(F),'sha256':hashlib.sha256(F.read_bytes()).hexdigest(),'bytes':F.stat().st_size,'duration':b-a,'frames':expected,'fps':fps,'resolution':[v['width'],v['height']],'maxPtsErrorSeconds':err,'aacLoudness':measurement,'sync':sync,'decodedFrameComparisons':comparisons,'sfxEvents':sfx,'contentHash':P['contentHash'],'codeHash':P['codeHash'],'fullDatasetReady':P['fullDataReady'],'scope':'Research preview only; published estimates marked; no claim of full historical data completeness.','listeningStatus':'Measured only; not listened to.'}
(Q/'verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
