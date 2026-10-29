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
  function manifest(config, rows, sources, observations) {
    const report = audit(config, rows, sources, observations);
    if (!report.ready) throw new Error(`Data incomplete: ${report.missingCells} missing model-quarter cells; ${report.errors.length} errors. Never render partial/synthetic global data.`);
    const periods = quarters(config.from, config.to), orders = {}, leaderChanges = [];
    let previous = [];
    for (const q of periods) {
      const order = ranked(rows.filter(r => r.quarter === q), previous).map(r => r.model);
      if (previous.length && order[0] !== previous[0]) leaderChanges.push({ quarter: q, from: previous[0], to: order[0] });
      orders[q] = order; previous = order;
    }
    const segments = schedule(config);
    return { version: 1, config, rows, orders, leaderChanges, segments, duration: config.duration, fps: config.fps,
      axisMax: Math.max(50000, Math.ceil(Math.max(...rows.filter(active).map(r => r.units)) / 50000) * 50000),
      cues: config.cues, events: segments.filter(s => s.kind === 'panel' && s.panelKind === 'launch').map(s => ({ t: s.t0, kind: 'launch', model: s.models[0], quarter: s.quarter }))
        .concat(leaderChanges.map(e => ({ ...e, t: segments.find(s => s.kind === 'race' && s.quarter === e.quarter).t0 + config.transitionSeconds, kind: 'lead-change' }))).sort((a,b) => a.t-b.t) };
  }
  function stateAt(m, time) {
    const t = Math.max(0, Math.min(m.duration - 1e-9, time));
    const segment = m.segments.find(s => s.t0 <= t && t < s.t1);
    const q = segment.quarter || m.config.from, periods = quarters(m.config.from, m.config.to), ix = periods.indexOf(q);
    const previousQuarter = periods[Math.max(0, ix - 1)], moving = segment.kind === 'race' && ix > 0;
    const f = moving ? ease((t - segment.t0) / m.config.transitionSeconds) : 1;
    const order = m.orders[q], prevOrder = m.orders[previousQuarter];
    const rows = m.config.models.map(model => {
      const r = m.rows.find(r => r.model === model.id && r.quarter === q);
      if (!active(r)) return { model, status: 'not_launched', visible: false };
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
