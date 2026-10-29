const fs = require('fs'), path = require('path');
const C = require('./core'), IO = require('./io');
function review(input) {
  const { config, rows, sources, observations, contentHash } = input;
  const report = C.audit(config, rows, sources, observations), segments = C.schedule(config);
  let md = '# Tesla model deliveries — data and storyboard review\n\n';
  md += `Status: **${report.ready ? 'DATA COMPLETE; awaiting concrete review' : 'BLOCKED — incomplete data'}**. No sales frames/video rendered.\n\n`;
  md += `Global deliveries, ${config.from}–${config.to}; ${report.quarters} quarters, ${report.activeCells} active-model cells, ${report.verifiedCells} accepted, **${report.missingCells} missing**, ${report.notLaunchedCells} pre-launch cells.\n\n`;
  md += `Content hash: \`${contentHash}\`. Approval must cover this exact data, sources, assets and storyboard. Plan approval does not approve facts.\n\n`;
  md += 'A readable source is not automatically an accepted observation. Initial delivery releases can differ from later letters. Only literal, revised individual-model observations are accepted here; unresolved grouped revisions remain missing. Tesla/SEC republication is one issuer source group, not independent corroboration. Missing is not zero.\n\n';
  md += '| Model | Accepted / active | Missing quarters |\n|---|---:|---|\n';
  for (const v of Object.values(report.coverage)) md += `| ${v.name} | ${v.verified} / ${v.active} | ${v.missing.join(', ')} |\n`;
  md += '\n## Complete quarter matrix\n\n— = not launched; **MISSING** = active but no accepted global individual-model quarter. Counts link to literal observations below.\n\n| Quarter | ' + config.models.map(m => m.name).join(' | ') + ' |\n|---|' + config.models.map(() => '---:|').join('') + '\n';
  for (const q of C.quarters(config.from, config.to)) md += `| ${q} | ` + config.models.map(m => { const r = rows.find(r => r.quarter === q && r.model === m.id); return r?.status === 'not_launched' ? '—' : C.active(r || {}) ? `[${r.status === 'estimated' ? '≈' : ''}${r.units.toLocaleString('en-US')}](#${r.observation})` : '**MISSING**'; }).join(' | ') + ' |\n';
  md += '\n## Storyboard — 480 seconds / 28,800 frames at 60 fps\n\nNo prewritten winner/leadership claims. Winners, head-to-head gaps, annual totals, YoY and cumulative totals are computed only after coverage passes. Cumulative means selected period since 2015, not lifetime.\n\n| Start–end (s) | Segment | Quarter | Caption |\n|---|---|---|---|\n';
  for (const s of segments) md += `| ${s.t0}–${s.t1} | ${s.panelKind || s.kind} | ${s.quarter || ''} | ${s.title || (s.kind === 'intro' ? 'FIVE MODELS. ONE RACE.' : s.kind === 'summary' ? 'THE RESULTS · SINCE 2015' : 'GLOBAL QUARTERLY DELIVERIES')} |\n`;
  md += '\nMusic: ' + config.cues.map(c => `${c.cue} @ ${c.t}s`).join(' → ') + '. Native 100 BPM, no whole-mix pre-event gates; −16 LUFS target, decoded AAC verification required.\n\n## Accepted observations\n\n';
  for (const [id, o] of Object.entries(observations).filter(([, o]) => o.accepted)) md += `<a id="${id}"></a>\n\n**${o.quarter} / ${o.model} — ${o.units.toLocaleString('en-US')}**. ${o.reviewNote}\n\n> ${o.excerpt}\n\n${o.sourceIds.map(id => `[${sources[id].publisherGroup}](${sources[id].url})`).join(' · ')}. Independent corroboration: ${o.independentCorroboration ? 'yes' : 'not established; issuer fact only'}.\n\n`;
  md += '## Research limitations and next gate\n\nSee [source discovery](source-discovery.md) and [all extraction candidates](extraction-candidates.json). Candidates include financial/production false positives and are deliberately not facts. Obtain verified per-model global quarterly data for every missing cell before requesting final data/storyboard approval, then layout, 30–45s motion preview and user preview approval. No change of geography, grouped bars or invented allocation is authorized.\n';
  if (report.errors.length) md += '\nValidation errors:\n\n' + report.errors.map(e => '- ' + e).join('\n') + '\n';
  return { report, md };
}
if (require.main === module) {
  const input = IO.load(), { report, md } = review(input);
  fs.writeFileSync(path.join(input.dir, 'review.md'), md);
  fs.writeFileSync(path.join(input.dir, 'coverage.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ...report, missing: undefined, coverage: undefined, contentHash: input.contentHash }, null, 2));
  if (!report.ready && !process.argv.includes('--review')) process.exitCode = 1;
}
module.exports = { review };
