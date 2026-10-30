// Pure data/timeline/state functions shared by Node and the isolated browser film.
(function () {
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const ease = (v) => { const x = clamp(v); return x * x * (3 - 2 * x); };
  function quarterIndex(q) {
    if (!/^\d{4}Q[1-4]$/.test(q)) throw new Error('Invalid quarter: ' + q);
    return +q.slice(0, 4) * 4 + +q.at(-1) - 1;
  }
  function quarters(from, to) {
    const a = quarterIndex(from), b = quarterIndex(to);
    if (b < a) throw new Error('Reversed quarter range');
    return Array.from({ length: b - a + 1 }, (_, i) => `${Math.floor((a + i) / 4)}Q${(a + i) % 4 + 1}`);
  }
  const key = (r) => `${r.quarter}|${r.model}`;
  const active = (r) => ['reported', 'estimated'].includes(r.status);
  function audit(config, rows, sources, observations) {
    const errors = [], missing = [], periods = quarters(config.from, config.to);
    const wanted = new Set(periods.flatMap(q => config.models.map(m => `${q}|${m.id}`)));
    const index = new Map(), coverage = {}, checked = (id) => sources[id]?.checked === true;
    for (const r of rows) {
      if (!wanted.has(key(r))) errors.push('Out-of-scope cell: ' + key(r));
      if (index.has(key(r))) errors.push('Duplicate cell: ' + key(r));
      index.set(key(r), r);
    }
    let launched = 0, known = 0, notLaunched = 0;
    for (const q of periods) for (const model of config.models) {
      const k = `${q}|${model.id}`, r = index.get(k), errorsBefore = errors.length;
      if (!model.launchSources?.length || !model.launchSources.some(checked)) errors.push('Launch lacks checked source: ' + model.id);
      const c = coverage[model.id] ||= { name: model.name, active: 0, verified: 0, missing: [] };
      const beforeLaunch = quarterIndex(q) < quarterIndex(model.firstQuarter);
      if (!r) { missing.push(k); c.missing.push(q); if (!beforeLaunch) { launched++; c.active++; } continue; }
      if (r.geography !== 'global' || r.metric !== 'deliveries') errors.push('Wrong geography/metric: ' + k);
      if (beforeLaunch) {
        notLaunched++;
        if (r.status !== 'not_launched' || r.units !== null) errors.push('Pre-launch is not reported zero: ' + k);
        continue;
      }
      launched++; c.active++;
      if (r.status === 'missing') { missing.push(k); c.missing.push(q); if (r.units !== null) errors.push('Missing cell has a number: ' + k); continue; }
      if (!active(r) || !Number.isInteger(r.units) || r.units < 0) { errors.push('Invalid reported quantity: ' + k); continue; }
      const o = observations[r.observation];
      if (!o || o.model !== r.model || o.quarter !== q || o.units !== r.units || o.geography !== 'global' || o.metric !== 'deliveries' || o.grouped || o.accepted !== true)
        errors.push('Cell has no matching accepted individual-model global observation: ' + k);
      else {
        if (o.status !== r.status) errors.push('Observation status mismatch: ' + k);
        if (!o.excerpt?.trim()) errors.push('Observation lacks literal evidence: ' + k);
        if (!o.sourceIds?.length || !o.sourceIds.every(checked)) errors.push('Unread/uncited source: ' + k);
        if (r.status === 'estimated') {
          const primaryGroups = new Set((o.sourceIds || []).map(id => sources[id]?.publisherGroup));
          if (!o.methodology || !o.crossChecks?.length || !o.crossChecks.every(checked) ||
              !o.crossChecks.some(id => !o.sourceIds.includes(id) && sources[id]?.publisherGroup && !primaryGroups.has(sources[id].publisherGroup)))
            errors.push('Estimate lacks methodology/independent cross-check: ' + k);
        }
      }
      if (errors.length === errorsBefore) { known++; c.verified++; }
    }
    return { quarters: periods.length, expectedCells: wanted.size, rows: rows.length, activeCells: launched,
      verifiedCells: known, notLaunchedCells: notLaunched, missingCells: missing.length, missing, errors, coverage,
      ready: missing.length === 0 && errors.length === 0 };
  }
  function schedule(config) {
    let t = config.introSeconds;
    const segments = [{ kind: 'intro', t0: 0, t1: t }];
    for (const quarter of quarters(config.from, config.to)) {
      segments.push({ kind: 'race', quarter, t0: t, t1: t + config.quarterSeconds }); t += config.quarterSeconds;
      for (const panel of config.panels.filter(p => p.after === quarter)) {
        segments.push({ ...panel, kind: 'panel', panelKind: panel.kind, quarter, t0: t, t1: t + panel.duration }); t += panel.duration;
      }
    }
    segments.push({ kind: 'summary', quarter: config.to, t0: t, t1: t + config.summarySeconds });
    if (Math.abs(t + config.summarySeconds - config.duration) > 1e-9) throw new Error('Schedule must equal configured duration');
    for (const c of config.chapters.filter(c => c.from)) {
      const parts = segments.filter(s => s.quarter >= c.from && s.quarter <= c.to && s.kind !== 'summary');
      if (parts[0]?.t0 !== c.t0 || parts.at(-1)?.t1 !== c.t1) throw new Error('Chapter timing mismatch: ' + c.id);
    }
    return segments;
  }
  function ranked(rows, previous = []) {
    return rows.filter(active).slice().sort((a, b) => b.units - a.units ||
      ((previous.includes(a.model) ? previous.indexOf(a.model) : 999) - (previous.includes(b.model) ? previous.indexOf(b.model) : 999)) || a.model.localeCompare(b.model));
  }
  function yoy(rows, quarter, model) {
    const ix = quarterIndex(quarter), prev = `${Math.floor((ix - 4) / 4)}Q${(ix - 4) % 4 + 1}`;
    const a = rows.find(r => r.quarter === quarter && r.model === model), b = rows.find(r => r.quarter === prev && r.model === model);
    return a && b && active(a) && active(b) && b.units > 0 ? (a.units / b.units - 1) * 100 : null;
  }
  // Each quarter owns its race + narrative time. There is no completed transition followed by a hold.
  function inverseEase(value) {
    let a=0,b=1;
    for(let i=0;i<50;i++){const x=(a+b)/2;if(ease(x)<value)a=x;else b=x;}
    return (a+b)/2;
  }
  function motionBlocks(config, rows, segments, orders) {
    const periods=quarters(config.from,config.to);
    return periods.map((quarter,i)=>{
      const parts=segments.filter(s=>s.quarter===quarter&&s.kind!=='summary');
      const previousQuarter=i?periods[i-1]:null, t0=parts[0].t0,t1=parts.at(-1).t1;
      const actors=rows.filter(r=>r.quarter===quarter&&active(r)).map(r=>{
        const old=rows.find(a=>a.quarter===previousQuarter&&a.model===r.model);
        return {...r,from:old&&active(old)?old.units:0};
      });
      const before=ranked(actors.map(r=>({...r,units:r.from})),orders[previousQuarter]||orders[quarter]).map(r=>r.model);
      const after=orders[quarter],crossings=[];
      for(let a=0;a<actors.length;a++)for(let b=a+1;b<actors.length;b++){
        const x=actors[a],y=actors[b],oldAhead=before.indexOf(x.model)<before.indexOf(y.model),newAhead=after.indexOf(x.model)<after.indexOf(y.model);
        const d0=x.from-y.from,d1=x.units-y.units;
        if(oldAhead===newAhead||d0===d1)continue;
        const fraction=clamp(-d0/(d1-d0)),time=t0+inverseEase(fraction)*(t1-t0);
        const half=(config.rankTransitionSeconds||.8)/2;
        crossings.push({a:x.model,b:y.model,fraction,t:time,start:Math.max(t0,time-half),end:Math.min(t1,time+half),aDelta:oldAhead?1:-1});
      }
      return {quarter,previousQuarter,t0,t1,actors,before,crossings,panels:parts.filter(s=>s.kind==='panel')};
    });
  }
  function continuousEvents(m) {
    const events=[];
    for(const block of m.blocks){
      for(const p of block.panels.filter(p=>p.panelKind==='launch'))events.push({t:block.t0,kind:'launch',model:p.models[0],quarter:block.quarter});
      if(!block.previousQuarter||m.rows.some(r=>[block.quarter,block.previousQuarter].includes(r.quarter)&&r.status==='missing'))continue;
      const leader=f=>ranked(block.actors.map(r=>({...r,units:r.from+(r.units-r.from)*f})),block.before)[0]?.model;
      for(const crossing of block.crossings){
        const from=leader(Math.max(0,crossing.fraction-1e-7)),to=leader(Math.min(1,crossing.fraction+1e-7));
        if(from&&to&&from!==to&&!events.some(e=>e.kind==='lead-change'&&Math.abs(e.t-crossing.t)<1e-7))events.push({t:crossing.t,kind:'lead-change',from,to,quarter:block.quarter});
      }
    }
    return events.sort((a,b)=>a.t-b.t);
  }
  function continuousState(m,t,segment){
    const q=segment.quarter||m.config.from,block=m.blocks.find(b=>b.quarter===q);
    const u=segment.kind==='intro'||segment.kind==='summary'?1:clamp((t-block.t0)/(block.t1-block.t0)),f=ease(u);
    const result=m.config.models.map(model=>{
      const r=block.actors.find(r=>r.model===model.id);
      if(!r)return {model,visible:false,status:m.rows.find(r=>r.quarter===q&&r.model===model.id)?.status||'missing'};
      let rank=block.before.indexOf(model.id);
      for(const c of block.crossings){const sign=c.a===model.id?c.aDelta:c.b===model.id?-c.aDelta:0;if(sign)rank+=sign*ease((t-c.start)/Math.max(1e-9,c.end-c.start));}
      const visualUnits=r.from+(r.units-r.from)*f;
      return {model,visible:true,status:r.status,units:r.units,displayUnits:r.units,visualUnits,animatedUnits:Math.round(visualUnits),isInterpolating:f<1&&r.from!==r.units,rank,yoy:yoy(m.rows,q,model.id)};
    });
    for(const r of result.filter(r=>r.visible)){
      const separation=Math.min(1,...result.filter(a=>a.visible&&a.model.id!==r.model.id).map(a=>Math.abs(a.rank-r.rank)));
      r.labelAlpha=clamp((separation-.55)/.30);
    }
    return {t,segment,quarter:q,fromQuarter:block.previousQuarter,progress:u,f,rows:result,block,
      panel:segment.kind==='panel'?segment:block.panels[0]||null,
      chapter:m.config.chapters.find(c=>c.t0<=t&&t<c.t1)};
  }
  function manifest(config, rows, sources, observations, options = {}) {
    const report = audit(config, rows, sources, observations);
    let renderWindow = null;
    if (!report.ready && options.previewWindow) {
      const [a,b] = options.previewWindow;
      if (!Number.isFinite(a) || !Number.isFinite(b) || a < 0 || b > config.duration || b <= a || b-a > 45) throw new Error('Invalid research preview window');
      if (report.errors.length) throw new Error('Invalid source/data errors cannot be bypassed for preview');
      const segments = schedule(config).filter(s => s.t0 < b && s.t1 > a);
      if (segments.some(s => s.kind === 'summary')) throw new Error('Incomplete data cannot support cumulative summary');
      const qs = segments.map(s => s.quarter || config.from).sort();
      let first = qs[0], last = qs.at(-1);
      const periods = quarters(config.from,config.to), i = periods.indexOf(first);
      if (i > 0) first = periods[i-1]; // transitions also require the real preceding quarter
      for (const s of segments.filter(s => s.panelKind === 'annual')) first = [first,s.quarter.slice(0,4)+'Q1'].sort()[0];
      const selected = rows.filter(r => r.quarter >= first && r.quarter <= last);
      const check = audit({...config,from:first,to:last},selected,sources,observations);
      if (!check.ready) throw new Error(`Preview window has unavailable facts: ${check.missing.join(', ')}`);
      renderWindow = [a,b];
    }
    if (!report.ready && !renderWindow) throw new Error(`Data incomplete: ${report.missingCells} missing model-quarter cells; ${report.errors.length} errors. Never render partial/synthetic global data.`);
    const periods = quarters(config.from, config.to), orders = {}, leaderChanges = [];
    let previous = [];
    for (const q of periods) {
      const order = ranked(rows.filter(r => r.quarter === q), previous).map(r => r.model);
      if (previous.length && !rows.some(r => [q,periods[periods.indexOf(q)-1]].includes(r.quarter) && r.status === 'missing') && order[0] !== previous[0]) leaderChanges.push({ quarter: q, from: previous[0], to: order[0] });
      orders[q] = order; previous = order;
    }
    const segments = schedule(config);
    const m = { version: 1, fullDataReady:report.ready, coverage:report, renderWindow, config, rows, orders, leaderChanges, segments, duration: config.duration, fps: config.fps,
      axisMax: Math.max(50000, Math.ceil(Math.max(...rows.filter(active).map(r => r.units)) / 50000) * 50000),
      cues: config.cues, events: segments.filter(s => s.kind === 'panel' && s.panelKind === 'launch').map(s => ({ t: s.t0, kind: 'launch', model: s.models[0], quarter: s.quarter }))
        .concat(leaderChanges.map(e => ({ ...e, t: segments.find(s => s.kind === 'race' && s.quarter === e.quarter).t0 + config.transitionSeconds, kind: 'lead-change' }))).sort((a,b) => a.t-b.t) };
    if(config.motion==='continuous'){m.blocks=motionBlocks(config,rows,segments,orders);m.events=continuousEvents(m);m.leaderChanges=m.events.filter(e=>e.kind==='lead-change');}
    return m;
  }
  function stateAt(m, time) {
    const t = Math.max(0, Math.min(m.duration - 1e-9, time));
    const segment = m.segments.find(s => s.t0 <= t && t < s.t1);
    if(m.config.motion==='continuous')return continuousState(m,t,segment);
    const q = segment.quarter || m.config.from, periods = quarters(m.config.from, m.config.to), ix = periods.indexOf(q);
    const previousQuarter = periods[Math.max(0, ix - 1)], moving = segment.kind === 'race' && ix > 0;
    const f = moving ? ease((t - segment.t0) / m.config.transitionSeconds) : 1;
    const order = m.orders[q], prevOrder = m.orders[previousQuarter];
    const rows = m.config.models.map(model => {
      const r = m.rows.find(r => r.model === model.id && r.quarter === q);
      if (!active(r)) return { model, status: r.status, visible: false };
      const old = m.rows.find(r => r.model === model.id && r.quarter === previousQuarter);
      const from = moving && active(old) ? old.units : moving ? 0 : r.units;
      const newRank = order.indexOf(model.id), oldRank = prevOrder.includes(model.id) ? prevOrder.indexOf(model.id) : newRank;
      return { model, visible: true, status: r.status, units: r.units, visualUnits: from + (r.units - from) * f,
        displayUnits: f < 1 ? (active(old) ? old.units : null) : r.units, rank: moving ? oldRank + (newRank - oldRank) * f : newRank,
        labelAlpha: f > 0 && f < 1 ? 0 : 1, yoy: yoy(m.rows, q, model.id) };
    });
    return { t, segment, quarter: f < 1 ? previousQuarter : q, targetQuarter: q, f, rows,
      chapter: m.config.chapters.find(c => c.t0 <= t && t < c.t1) };
  }
  const api = { quarterIndex, quarters, key, active, audit, schedule, ranked, yoy, manifest, stateAt };
  if (typeof module !== 'undefined') module.exports = api; else globalThis.TeslaSales = api;
})();
