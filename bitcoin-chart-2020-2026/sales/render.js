// Operator entrypoint; never overwrites an earlier workspace/render.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const IO = require('./io'), { build } = require('./build');
const mode = process.argv[2], input = IO.load();
if (!['layout', 'preview', 'preview-full', 'final'].includes(mode)) throw new Error('Usage: node sales/render.js layout|preview|preview-full|final [start seconds]');
const approval = JSON.parse(fs.readFileSync(path.join(input.dir, 'approval.json')));
if (mode === 'final') IO.approved(input, approval);
if (mode === 'final' && (!approval.previewApproved || !approval.finalRequested)) throw new Error('Full film requires preview approval and an explicit final request; record evidence first.');
if (mode === 'final' && ![1080, 1440, 2160].includes(approval.finalResolution)) throw new Error('Confirm final resolution first (PROJECT.md §1.6).');
const start = Number(process.argv[3] || 128);
if (!Number.isFinite(start) || start < 0 || start + 36 > input.config.duration) throw new Error('Preview range must be within the film');
const { dir } = build(input, mode === 'final' ? {} : mode === 'preview-full' ? {previewWindow:[0,input.config.duration],fullPreview:true} : {previewWindow:[start,start+36]});
console.log('Preserved workspace:', dir);
function run(args) { cp.execFileSync(process.execPath, args, { cwd: dir, stdio: 'inherit', env: { ...process.env, FPS:'60', LUFS:'-16', STEMS:'1' } }); }
if (mode === 'layout') run(['engine/render.js', 'stills', String(start), '--res', '480']);
else {
  run(['song.js']);
  if (mode === 'preview-full') run(['engine/render.js','clip','0',String(input.config.duration),'2','--res','480']);
  else if (mode === 'preview') run(['engine/render.js', 'clip', String(start), String(start+36), '--res', '480']);
  else {
    const flags = ['--res', String(approval.finalResolution)];
    run(['engine/render.js','video',...flags]); run(['engine/render.js','mux',...flags]); run(['engine/render.js','check',...flags]);
  }
}
// Keep full input snapshots, manifests, WAV/stems, frames and reports in this unique workspace.
