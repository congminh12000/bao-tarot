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
test('monotone interpolation stays bounded and hides moving counters; no fictitious reported numbers',()=>{
  const f=fixture(),m=C.manifest(f.config,f.rows,f.sources,f.observations);
  for(const s of m.segments.filter(s=>s.kind==='race')) for(let frame=0;frame<=48;frame++) {
    const state=C.stateAt(m,s.t0+frame/60);
    for(const r of state.rows.filter(r=>r.visible)) {
      const qi=C.quarters(config.from,config.to).indexOf(s.quarter),prev=C.quarters(config.from,config.to)[Math.max(0,qi-1)];
      const old=f.rows.find(a=>a.model===r.model.id&&a.quarter===prev),base=old.units??0;
      assert.ok(r.visualUnits>=Math.min(base,r.units)-1e-8&&r.visualUnits<=Math.max(base,r.units)+1e-8);
      assert.ok([old.units,r.units,null].includes(r.displayUnits));
      if(state.f>0&&state.f<1)assert.equal(r.labelAlpha,0);
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
