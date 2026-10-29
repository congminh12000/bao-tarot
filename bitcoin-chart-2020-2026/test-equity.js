const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), os = require('os'), path = require('path'), vm = require('vm');
const E = require('./equity');
const S = require('./score'), BTC = require('./btc-data');
const sessions = new Map([
 ['2026-07-02', {openUTC:'2026-07-02T13:30:00Z',closeUTC:'2026-07-02T20:00:00Z'}],
 ['2026-07-06', {openUTC:'2026-07-06T13:30:00Z',closeUTC:'2026-07-06T20:00:00Z'}],
 ['2026-11-27', {openUTC:'2026-11-27T14:30:00Z',closeUTC:'2026-11-27T18:00:00Z'}],
 ['2026-11-30', {openUTC:'2026-11-30T14:30:00Z',closeUTC:'2026-11-30T21:00:00Z'}]
]);
test('Exchange holidays carry last close without creating candles; missing open sessions fail',()=>{
 const real=new Map([['2026-07-02',[100,105,99,103]]]);
 assert.deepEqual(E.slot(real,sessions,'2026-07-03'),{value:[103,103,103,103],source:0,trading:0});
 assert.equal(E.slot(real,sessions,'2026-07-04').trading,0);
 assert.throws(()=>E.slot(real,sessions,'2026-07-06'),/Missing equity trading session/);
 assert.throws(()=>E.slot(new Map([['2026-07-03',[1,1,1,1]]]),sessions,'2026-07-03'),/closed exchange/);
});
test('Malformed equity OHLC cannot enter the film',()=>{
 assert.throws(()=>E.slot(new Map([['2026-07-02',[100,99,101,103]]]),sessions,'2026-07-02'),/Invalid equity OHLC/);
});
test('Announcement date survives before-open, after-close, holidays and early closes',()=>{
 const e={date:'2026-07-02',text:'example'};
 assert.equal(E.anchorEvent(e,{publishedAt:'2026-07-02T09:00:00-04:00'},sessions).anchorDate,'2026-07-02');
 assert.equal(E.anchorEvent(e,{publishedAt:'2026-07-02T16:01:00-04:00'},sessions).anchorDate,'2026-07-06');
 assert.equal(E.anchorEvent({...e,date:'2026-07-04'},null,sessions).anchorDate,'2026-07-06');
 const early=E.anchorEvent({...e,date:'2026-11-27'},{publishedAt:'2026-11-27T13:00:00-05:00'},sessions);
 assert.equal(early.anchorDate,'2026-11-30');assert.equal(early.date,'2026-11-27');
 assert.equal(E.anchorEvent(e,null,sessions).marketTiming,'unknown');
});
test('Cycle lows are not mislabelled as historical lows',()=>{
 const d=[[10,12,9,11],[20,22,19,21],[15,16,14,15]];
 assert.equal(E.lowName(d,0),'ALL-TIME LOW');assert.equal(E.lowName(d,2),'CYCLE LOW');
});
test('Concrete review approval is invalidated by data changes',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'equity-review-'));
 try{for(const f of ['events.csv','event-sources.csv','event-details.json'])fs.writeFileSync(path.join(dir,f),'x');
  const pending=E.reviewState(dir);assert.equal(pending.status,'pending');
  fs.writeFileSync(path.join(dir,'review-state.json'),JSON.stringify({status:'approved',eventHash:pending.eventHash}));assert.equal(E.reviewState(dir).status,'approved');
  fs.appendFileSync(path.join(dir,'events.csv'),'changed');assert.equal(E.reviewState(dir).status,'pending');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('TSLA full calendar preserves exactly 4109 source sessions and hides 1857 closed slots',()=>{
 assert.equal(BTC.coin.assetClass,'equity');assert.equal(BTC.days.length,5966);
 assert.equal([...BTC.sessions].filter(v=>v==='1').length,4109);
 assert.equal([...BTC.sessions].filter(v=>v==='0').length,1857);
 for(let i=0;i<BTC.days.length;i++){
  const c=S.candleAt(i,S.DURATION);
  if(BTC.sessions[i]==='0')assert.equal(c,null);else assert.ok(c);
 }
 const selected = require('./event-csv').readEvents(path.join(__dirname,'coins/TSLA/data/events.csv')).filter(e=>!e.remove && e.hit>=1);
 assert.equal(S.EVENTS.filter(e=>e.turn===undefined).length,selected.length);
 for(const e of S.EVENTS){assert.equal(BTC.sessions[e.day],'1');if(e.anchorDate)assert.equal(S.dateOf(e.day).toISOString().slice(0,10),e.anchorDate);}
 for(const e of S.EVENTS.filter(e=>e.turn!==undefined&&e.kind==='down'))assert.ok(e.text.startsWith('CYCLE LOW:'));
 for(const e of S.EVENTS.filter(e=>e.turn!==undefined&&e.kind==='up'))assert.ok(e.price>=Math.max(...BTC.days.slice(0,e.day+1).map((r,i)=>BTC.sessions[i]==='1'?r[1]:0))-1e-6);
 assert.equal(BTC.eventReview.status,'pending');
 assert.throws(()=>vm.runInNewContext(fs.readFileSync(path.join(__dirname,'score.js'),'utf8'),{require:(id)=>require(id),module:{exports:{}},process:{env:{},argv:['node','/project/engine/render.js']}}),/review pending/);
});
test('Crypto long and legacy Shorts score remain identical to pre-equity code',()=>{
 const previous=require('child_process').execFileSync('git',['show','8bdf03e8:bitcoin-chart-2020-2026/score.js'],{cwd:__dirname,encoding:'utf8'}),current=fs.readFileSync(path.join(__dirname,'score.js'),'utf8');
 for(const short of [null,{n:1,type:'uptrend',cue:'up-vanguard',endTurn:true}]){
  const data={coin:{symbol:'BTC'},start:'2021-01-01',pre:0,days:Array.from({length:60},(_,i)=>[100+i,104+i,97+i,102+i]),real:'1'.repeat(60),short,
   phases:[{start:'2021-01-01',end:'2021-01-20',type:'uptrend',cue:'up-vanguard'},{start:'2021-01-21',end:'2021-03-01',type:'downtrend',cue:'down-tremor'}],events:[{date:'2021-01-10',kind:'up',hit:2,text:'Test'},{date:'2021-01-12',kind:'info',hit:1,text:'Quiet'}]};
  const run=code=>{const context={require:id=>id==='./btc-data'?structuredClone(data):require(id),module:{exports:{}},process:{env:{FPS:'60'},argv:[]}};vm.runInNewContext(code,context);return context.module.exports;};
  const a=run(previous),b=run(current),clean=v=>JSON.parse(JSON.stringify(v));
  assert.equal(b.DURATION,a.DURATION);assert.deepEqual(clean(b.EVENTS),clean(a.EVENTS));assert.deepEqual(clean(b.markers),clean(a.markers));
  for(const t of [0,1,5,a.DURATION/2,a.DURATION-1]){assert.equal(b.dayAt(t),a.dayAt(t));assert.equal(b.priceAt(t),a.priceAt(t));for(const i of [0,5,20,59])assert.deepEqual(clean(b.candleAt(i,t)),clean(a.candleAt(i,t)));}
 }
});
