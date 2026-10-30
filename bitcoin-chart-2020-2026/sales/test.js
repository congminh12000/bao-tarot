const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('fs'), path = require('path'), os = require('os');
const C = require('./core'), IO = require('./io'), { build, songAdapter } = require('./build');
const input = IO.load(), config = input.config;
// Synthetic quantities exist only in memory for mathematical tests; never build/render fixture data.
function fixture() {
  const sources = { unit: { checked:true, publisherGroup:'UNIT TEST ONLY' } }, observations = {};
  const cfg = structuredClone(config); cfg.models.forEach(m => m.launchSources=['unit']);
  const rows = C.quarters(cfg.from,cfg.to).flatMap((q,qi)=>cfg.models.map((m,mi)=>{
    const launch = q >= m.firstQuarter, units = launch ? 10000 + qi*1000 + mi*400 : null, id=`${q}-${m.id}`;
    if(launch)observations[id]={accepted:true,quarter:q,model:m.id,units,geography:'global',metric:'deliveries',grouped:false,status:'reported',sourceIds:['unit'],excerpt:'UNIT TEST ONLY — NOT SALES DATA'};
    return {quarter:q,model:m.id,units,geography:'global',metric:'deliveries',status:launch?'reported':'not_launched',observation:launch?id:''};
  }));return {config:cfg,rows,sources,observations};
}
const audit=f=>C.audit(f.config,f.rows,f.sources,f.observations);
test('real coverage: 47 quarters, 168 active, 67 pre-launch; incomplete data cannot build',()=>{
  const a=audit(input);assert.equal(a.expectedCells,235);assert.equal(a.activeCells,168);assert.equal(a.notLaunchedCells,67);
  assert.equal(a.verifiedCells,128);assert.equal(a.missingCells,40);assert.deepEqual(a.errors,[]);
  const dir=path.join(input.root,'out/tesla-sales'), before=fs.existsSync(dir)?fs.readdirSync(dir):[];
  assert.throws(()=>build(input),/Data incomplete/);assert.deepEqual(fs.existsSync(dir)?fs.readdirSync(dir):[],before);
});
test('missing differs from legitimate sourced zero and from pre-launch',()=>{
  const f=fixture(),r=f.rows.find(r=>r.status==='reported');r.units=0;f.observations[r.observation].units=0;assert.equal(audit(f).ready,true);
  r.status='missing';r.units=null;assert.equal(audit(f).missingCells,1);assert.equal(audit(f).ready,false);
  const n=f.rows.find(r=>r.status==='not_launched');n.units=0;assert.match(audit(f).errors.join(','),/Pre-launch/);
});
test('reject regional, grouped, unaccepted or unread observations and bad quantities',()=>{
  for(const mutate of [r=>r.geography='US',r=>r.grouped=true,r=>r.accepted=false,r=>r.sourceIds=['unread'],r=>r.excerpt='']) {
    const f=fixture(),r=f.rows.find(r=>r.status==='reported');mutate(f.observations[r.observation]);const a=audit(f);assert.equal(a.ready,false);assert.equal(a.verifiedCells,167);
  }
  const f=fixture();f.rows[0].units=12.5;assert.equal(audit(f).ready,false);
});
test('estimates require matching status, methodology and checked cross-check',()=>{
  const f=fixture(),r=f.rows[0],o=f.observations[r.observation];r.status=o.status='estimated';assert.equal(audit(f).ready,false);
  o.methodology='Explicit provider model-level global quarter methodology';o.crossChecks=['unit'];assert.equal(audit(f).ready,false);
  f.sources.second={checked:true,publisherGroup:'SECOND TEST PROVIDER'};o.crossChecks=['second'];assert.equal(audit(f).ready,true);
  o.crossChecks=['unread'];assert.equal(audit(f).ready,false);
});
test('duplicates, absent matrix cells and launch proof errors fail',()=>{
  const f=fixture();f.rows.push({...f.rows[0]});assert.match(audit(f).errors.join(','),/Duplicate/);
  f.rows.pop();f.rows.shift();assert.equal(audit(f).missingCells,1);
  f.config.models[0].launchSources=[];assert.match(audit(f).errors.join(','),/Launch lacks/);
});
test('approved eight-minute schedule is contiguous, 47 quarters and 10 narrative panels',()=>{
  const s=C.schedule(config);assert.equal(s.filter(s=>s.kind==='race').length,47);assert.equal(s.filter(s=>s.kind==='panel').length,10);
  assert.equal(s[0].t0,0);assert.equal(s.at(-1).t1,480);assert.equal(480*config.fps,28800);
  for(let i=1;i<s.length;i++)assert.equal(s[i].t0,s[i-1].t1);
  const bad=structuredClone(config);bad.summarySeconds++;assert.throws(()=>C.schedule(bad),/Schedule/);
});
test('stable ties do not manufacture leader changes; ranking follows actual values',()=>{
  const rows=[{model:'x',units:5,status:'reported'},{model:'s',units:5,status:'reported'}];assert.equal(C.ranked(rows,['s','x'])[0].model,'s');
  rows[0].units=6;assert.equal(C.ranked(rows,['s','x'])[0].model,'x');
});
test('YoY is null before launch, without a base, or with zero denominator',()=>{
  const f=fixture();assert.equal(C.yoy(f.rows,'2015Q1','s'),null);assert.equal(C.yoy(f.rows,'2017Q3','3'),null);
  assert.equal(C.yoy([{quarter:'2020Q1',model:'y',units:0,status:'reported'},{quarter:'2021Q1',model:'y',units:50,status:'reported'}],'2021Q1','y'),null);
  assert.ok(C.yoy(f.rows,'2016Q1','s')>0);
});
test('continuous bars stay bounded through entire quarter and narrative; source totals stay distinct from animated counters',()=>{
  const f=fixture(),m=C.manifest(f.config,f.rows,f.sources,f.observations);
  for(const block of m.blocks)for(const p of [0,.1,.5,.9,.999999]){
    const state=C.stateAt(m,block.t0+p*(block.t1-block.t0));
    for(const r of state.rows.filter(r=>r.visible)){
      const actor=block.actors.find(a=>a.model===r.model.id);
      assert.ok(r.visualUnits>=Math.min(actor.from,r.units)-1e-8&&r.visualUnits<=Math.max(actor.from,r.units)+1e-8);
      assert.equal(r.displayUnits,r.units);assert.equal(r.animatedUnits,Math.round(r.visualUnits));
      if(actor.from!==r.units&&state.f<1)assert.equal(r.isInterpolating,true);
    }
  }
});
test('absolute-time seeking is deterministic, including chapter/cue boundaries and final frame',()=>{
  const f=fixture(),m=C.manifest(f.config,f.rows,f.sources,f.observations),times=[0,12,35.5,120,128.4,240,360,454,479.983333,480];
  const snapshots=new Map(times.map(t=>[t,JSON.stringify(C.stateAt(m,t))]));
  for(const t of times.slice().reverse())assert.equal(JSON.stringify(C.stateAt(m,t)),snapshots.get(t));
  assert.equal(C.stateAt(m,480).segment.kind,'summary');assert.equal(m.axisMax%50000,0);
  for(const e of m.events)assert.ok(e.t>=0&&e.t<480);
});
test('review approval is concrete and hash-bound, photos are locally verified',()=>{
  assert.throws(()=>IO.approved(input,{approved:true,contentHash:'old',evidence:'plan approved'}),/approval required/);
  assert.throws(()=>IO.approved(input,{approved:true,contentHash:input.contentHash}),/approval required/);
  IO.approved(input,{approved:true,contentHash:input.contentHash,evidence:'unit test only; not persisted'});
  assert.equal(Object.keys(IO.assetPaths(input)).length,6);
});
test('CSV preserves quotations and null quantities; shared song adapter is narrowly opt-in',()=>{
  assert.deepEqual(IO.csv('a,b\n"one,two","a""b"\n'),[{a:'one,two',b:'a"b'}]);assert.throws(()=>IO.csv('a\n"open'),/Unclosed/);
  const source=fs.readFileSync(path.join(input.root,'song.js'),'utf8'),adapted=songAdapter(source);
  assert.ok(adapted.includes("require('./sales-sfx')"));assert.ok(adapted.includes('!LINE && !SALES && !sc.TRADING'));
  assert.ok(!adapted.includes('const b = SHORT || LINE || SALES')); // retain long cue arrangements
  assert.throws(()=>songAdapter(source.replace('const LINE = sc.LINE || null;','')),/contract changed/);
});
test('score adapter maps all four native cue boundaries and synchronized SFX without rendering',()=>{
  const vm=require('vm'), f=fixture(),m=C.manifest(f.config,f.rows,f.sources,f.observations);
  m.harmony=require('../score').CH;
  const sandbox={SALES:m,MUSIC:require('../engine/music'),MUSIC_LIBRARY:require('../data/music')};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'score.js'),'utf8'),sandbox);
  const s=sandbox.SCORE;assert.equal(s.FPS,60);assert.equal(s.DURATION,480);assert.equal(s.PHASES.length,4);
  for(let i=0;i<4;i++){assert.equal(s.PHASES[i].c.bpm,100);assert.equal(s.TB(s.PHASES[i].q0),120*i);}
  assert.equal(s.TB(s.END_BEAT),480);assert.deepEqual(s.hits,m.events);assert.equal(s.breaths.length,0);
});
test('complete in-memory fixture still cannot create a workspace without concrete approval',()=>{
  const f=fixture();assert.equal(audit(f).ready,true);
  assert.throws(()=>build({...input,...f}),/Concrete data\/storyboard approval required/);
});
test('direct engine full-film invocation cannot bypass preview/final approval',()=>{
  const vm=require('vm'),p={contentHash:'test-only'},approval={approved:true,contentHash:'test-only',evidence:'UNIT TEST ONLY'};
  const fakeRequire=name=>{
    if(name==='./manifest.json')return p;
    if(name==='fs')return {readFileSync:()=>JSON.stringify(approval)};
    return require(name);
  };
  const sandbox={module:{exports:{}},require:fakeRequire,__dirname,process:{argv:['node','/test/engine/render.js','video']}};
  assert.throws(()=>vm.runInNewContext(fs.readFileSync(path.join(__dirname,'score.js'),'utf8'),sandbox),/Approve the short preview/);
});

test('research preview verifies rendered quarters plus preceding transition, never full-data completeness',()=>{
  const m=C.manifest(input.config,input.rows,input.sources,input.observations,{previewWindow:[296,332]});
  assert.equal(m.fullDataReady,false);assert.deepEqual(m.renderWindow,[296,332]);assert.equal(m.coverage.missingCells,40);
  assert.throws(()=>C.manifest(input.config,input.rows,input.sources,input.observations),/Data incomplete/);
  assert.throws(()=>C.manifest(input.config,input.rows,input.sources,input.observations,{previewWindow:[332,368]}),/unavailable facts/);
});
test('preview cannot include missing context, an incomplete summary, or exceed 45 seconds',()=>{
  for(const range of [[290,336],[460,480],[-1,20],[500,510]]) assert.throws(()=>C.manifest(input.config,input.rows,input.sources,input.observations,{previewWindow:range}));
});
test('preserve issuer priorities and unresolved Other Models splits; no US-as-global substitution',()=>{
  assert.equal(Object.values(input.observations).filter(o=>o.accepted&&o.status==='reported').length,17);
  assert.equal(Object.values(input.observations).filter(o=>o.accepted&&o.status==='estimated').length,111);
  for(const r of input.rows.filter(r=>r.quarter>='2024Q1'&&['s','x','ct'].includes(r.model)))assert.equal(r.status,'missing');
  for(const r of input.rows)assert.equal(r.geography,'global');
});

test('preview build cannot expand the recorded authorized range even within sourced quarters',()=>{
  assert.throws(()=>build(input,{previewWindow:[298,330]}),/range differs from the recorded authorization/);
});

test('real preview has no stopped frame pairs, including all 16 seconds of the former hold',()=>{
  const m=C.manifest(input.config,input.rows,input.sources,input.observations,{previewWindow:[296,332]});let before=C.stateAt(m,296);
  for(let frame=1;frame<2160;frame++){
    const state=C.stateAt(m,296+frame/60);
    assert.ok(state.rows.some(r=>r.visible&&before.rows.some(a=>a.visible&&a.model.id===r.model.id&&Math.abs(a.visualUnits-r.visualUnits)>1e-8)),`stopped at frame ${frame}`);
    assert.equal(state.rows.find(r=>r.model.id==='y').labelAlpha,1);before=state;
  }
  const a=C.stateAt(m,316-1e-5),b=C.stateAt(m,316+1e-5);assert.equal(a.block.t0,b.block.t0);assert.ok(Math.abs(a.rows[0].visualUnits-b.rows[0].visualUnits)<.1);
  assert.equal(C.stateAt(m,325).panel.title,'Cybertruck enters');assert.equal(m.events.find(e=>e.kind==='launch'&&e.model==='ct').t,310);
});
test('rank crossings and leader SFX follow value equality; labels fade only during the actual crossing',()=>{
  const f=fixture(),cfg={...f.config,from:'2020Q1',to:'2020Q2',introSeconds:0,quarterSeconds:10,summarySeconds:1,duration:21,chapters:[],panels:[],models:f.config.models.filter(m=>['s','x'].includes(m.id))};
  const rows=[['2020Q1','s',100],['2020Q1','x',60],['2020Q2','s',90],['2020Q2','x',160]].map(([quarter,model,units])=>({quarter,model,units,status:'reported',geography:'global',metric:'deliveries',observation:quarter+'-'+model}));
  const observations=Object.fromEntries(rows.map(r=>[r.observation,{...r,accepted:true,grouped:false,sourceIds:['unit'],excerpt:'UNIT TEST ONLY'}]));
  const m=C.manifest(cfg,rows,f.sources,observations),cross=m.blocks[1].crossings[0],same=C.stateAt(m,cross.t),old=C.stateAt(m,cross.start-.01),next=C.stateAt(m,cross.end+.01);
  assert.ok(Math.abs(same.rows[0].visualUnits-same.rows[1].visualUnits)<1e-8);assert.equal(old.rows[0].rank,0);assert.equal(next.rows[0].rank,1);assert.equal(same.rows[0].labelAlpha,0);
  const hit=m.events.find(e=>e.kind==='lead-change');assert.equal(hit.t,cross.t);assert.equal(hit.from,'s');assert.equal(hit.to,'x');
});

test('explicit full research preview keeps all gaps null, blocks source errors and never bridges unknown quarters from zero',()=>{
  const m=C.manifest(input.config,input.rows,input.sources,input.observations,{fullPreview:true,previewWindow:[0,480]});
  assert.equal(m.fullResearchPreview,true);assert.equal(m.fullDataReady,false);assert.equal(m.coverage.missingCells,40);
  assert.deepEqual(m.renderWindow,[0,480]);
  for(const block of m.blocks){
    for(const t of [block.t0,(block.t0+block.t1)/2,block.t1-1/60]){
      const state=C.stateAt(m,t);
      for(const r of state.rows){
        const source=input.rows.find(a=>a.model===r.model.id&&a.quarter===block.quarter);
        if(source.status==='missing'){assert.equal(r.visible,false);assert.equal(r.status,'missing');assert.equal(source.units,null);}
        const prior=input.rows.find(a=>a.model===r.model.id&&a.quarter===block.previousQuarter);
        if(r.visible&&prior?.status==='missing'){assert.equal(r.visualUnits,source.units);assert.equal(r.isInterpolating,false);}
      }
    }
  }
  assert.throws(()=>C.manifest(input.config,input.rows,input.sources,input.observations,{fullPreview:true,previewWindow:[0,479]}),/exact full timeline/);
  const bad=structuredClone(input.rows);bad.find(r=>r.status==='reported').geography='US';
  assert.throws(()=>C.manifest(input.config,bad,input.sources,input.observations,{fullPreview:true,previewWindow:[0,480]}),/source\/data errors/);
  assert.throws(()=>C.manifest(input.config,input.rows,input.sources,input.observations),/Data incomplete/);
});

test('full research preview engine permit rejects final commands, higher resolution and out-of-range clips',()=>{
  const vm=require('vm'),p={contentHash:'test-only'},approval={approved:true,contentHash:'test-only',evidence:'UNIT TEST ONLY',previewOnly:true,fullResearchPreview:true,renderWindow:[0,480]};
  const fakeRequire=name=>name==='./manifest.json'?p:name==='fs'?{readFileSync:()=>JSON.stringify(approval)}:require(name);
  for(const [args,error] of [[['video'],/cannot run a full film/],[['clip','0','480','--res','1080'],/limited to 480p/],[['clip','0','480'],/limited to 480p/],[['clip','-1','480','--res','480'],/outside/],[['clip','0','481','--res','480'],/outside/]]){
    const sandbox={module:{exports:{}},require:fakeRequire,__dirname,process:{argv:['node','/test/engine/render.js',...args]}};
    assert.throws(()=>vm.runInNewContext(fs.readFileSync(path.join(__dirname,'score.js'),'utf8'),sandbox),error);
  }
});
test('full research preview actually draws every missing model as N/A and closes with coverage instead of incomplete sums',async()=>{
  const vm=require('vm'),m=C.manifest(input.config,input.rows,input.sources,input.observations,{fullPreview:true,previewWindow:[0,480]});
  m.contentHash=input.contentHash;m.storyboard=input.storyboard;m.assets=Object.fromEntries(['logo',...config.models.map(m=>m.id)].map(id=>[id,id]));
  let film;const sandbox={G:{scale:1},SALES:m,TeslaSales:C,Studio:{film:f=>film=f,loadJSON:async()=>({approved:true,contentHash:m.contentHash,evidence:'UNIT TEST ONLY'}),loadImage:async()=>({width:880,height:495})}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'film.js'),'utf8'),sandbox);await film.init();
  let words=[];const ctx=new Proxy({fillText:value=>words.push(value),measureText:value=>({width:String(value).length*12}),createRadialGradient:()=>({addColorStop:()=>{}})},{get:(o,k)=>k in o?o[k]:()=>{}});
  for(const block of m.blocks){words=[];sandbox.SalesScene.draw(ctx,(block.t0+block.t1)/2);const missing=input.rows.filter(r=>r.quarter===block.quarter&&r.status==='missing').length;
    assert.equal(words.filter(w=>w==='DATA UNAVAILABLE').length,missing);assert.equal(words.filter(w=>w==='N/A').length,missing);
    assert.ok(words.every(w=>typeof w==='string'&&!w.includes('NaN')&&!w.includes('undefined')));
  }
  words=[];sandbox.SalesScene.draw(ctx,460);assert.ok(words.includes('DATA COVERAGE'));assert.ok(words.includes('128 / 168 ACTIVE MODEL-QUARTERS SOURCED'));assert.ok(words.includes('TOTALS AND WINNERS WITHHELD UNTIL COVERAGE IS COMPLETE'));
});
