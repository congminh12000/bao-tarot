// Keeps rendered videos so a small change does not mean rendering every frame again.
//
//   FPS=60 node keep-render.js save <name> [--res 480]      after a render: keep out/video[-480p].mp4 (the silent frames)
//                                                           and the shareable mp4 next to it, with a fingerprint
//   FPS=60 node keep-render.js check <name> [--res 480]     are the kept frames still valid for the current code + data?
//   FPS=60 node keep-render.js restore <name> [--res 480]   put the kept frames back as out/video[-480p].mp4, then only
//                                                           `node song.js` + `render.js mux` + `render.js verify` are needed
//   node keep-render.js list                                what is kept
//
// The frames depend on the PICTURE fingerprint: the data (btc-data.js: days, events, phases and their cues), the timing
// (score.js, and each cue's tempo and TURN in data/music.js), the drawing (film.js, look.js, index.html, engine/video,
// assets) and the fps / resolution. A change to the music itself (melodies, instruments, mix: song.js, the cues' notes)
// leaves the frames valid: re-make the music and mux again. New data or a picture change = render again.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname, OUT = path.join(ROOT, 'out'), KEEP = path.join(OUT, 'renders');
const [cmd, name] = process.argv.slice(2);
const argVal = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const res = argVal('--res') ? parseInt(argVal('--res'), 10) : 0;
const SUFFIX = res ? `-${res}p` : ''; // the same naming as engine/render.js (no format / style override)
const FPS = process.env.FPS ? +process.env.FPS : 24;

const files = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)])).sort();
function fingerprint() {
  const h = crypto.createHash('sha256'), parts = {};
  const add = (label, buf) => { const d = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 12); parts[label] = d; h.update(label + d); };
  for (const f of ['btc-data.js', 'score.js', 'film.js', 'look.js', 'index.html']) add(f, fs.readFileSync(path.join(ROOT, f)));
  for (const f of [...files(path.join(ROOT, 'engine', 'video')), ...files(path.join(ROOT, 'assets'))]) add(path.relative(ROOT, f), fs.readFileSync(f));
  const LIB = require('./data/music');
  add('cue tempos + TURN', JSON.stringify({ cues: LIB.CUES.map((c) => [c.id, c.phase, c.bpm, c.rotation !== false]), turn: LIB.TURN }));
  add('fps + resolution', `${FPS}@${res || 1080}`);
  return { all: h.digest('hex').slice(0, 16), parts };
}
const BTC = () => { const b = require('./btc-data'); const d = new Date(Date.parse(b.start + 'T00:00:00Z') + (b.pre || 0) * 86400000); return { from: d.toISOString().slice(0, 10), days: b.days.length - (b.pre || 0) }; };

if (cmd === 'save') {
  if (!name) throw new Error('usage: keep-render.js save <name> [--res 480]');
  const video = path.join(OUT, `video${SUFFIX}.mp4`);
  if (!fs.existsSync(video)) throw new Error(`no ${path.relative(ROOT, video)} to keep (render it first)`);
  const dir = path.join(KEEP, name); fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(video, path.join(dir, 'video.mp4'));
  const shared = fs.readdirSync(OUT).filter((f) => f.endsWith(`${SUFFIX}.mp4`) && !f.startsWith('video') && !f.startsWith('clip_'))
    .map((f) => path.join(OUT, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0]; // the latest muxed film
  if (shared) fs.copyFileSync(shared, path.join(dir, path.basename(shared)));
  const fp = fingerprint();
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ name, saved: new Date().toISOString(), fps: FPS, res: res || 1080, ...BTC(), film: shared ? path.basename(shared) : null, fingerprint: fp }, null, 2));
  console.log(`kept ${path.relative(ROOT, dir)}/ (frames${shared ? ' + ' + path.basename(shared) : ''}), fingerprint ${fp.all}`);
} else if (cmd === 'check' || cmd === 'restore') {
  const dir = path.join(KEEP, name || '');
  if (!name || !fs.existsSync(path.join(dir, 'meta.json'))) throw new Error(`nothing kept as "${name}" (node keep-render.js list)`);
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')), fp = fingerprint();
  const changed = Object.keys({ ...meta.fingerprint.parts, ...fp.parts }).filter((k) => meta.fingerprint.parts[k] !== fp.parts[k]);
  if (changed.length) {
    console.log(`✗ "${name}" cannot be reused — the picture changed: ${changed.join(', ')}\n  (make the same FROM/TO data first; otherwise render again)`);
    process.exit(1);
  }
  if (cmd === 'check') { console.log(`✓ "${name}" is reusable: re-make the music, then restore + mux + verify`); process.exit(0); }
  fs.copyFileSync(path.join(dir, 'video.mp4'), path.join(OUT, `video${SUFFIX}.mp4`));
  console.log(`✓ restored out/video${SUFFIX}.mp4 from "${name}": now  node song.js  and  FPS=${meta.fps} node engine/render.js mux <name>${res ? ' --res ' + res : ''}  (+ verify)`);
} else if (cmd === 'list') {
  if (!fs.existsSync(KEEP)) { console.log('nothing kept yet'); process.exit(0); }
  for (const d of fs.readdirSync(KEEP).sort()) {
    const f = path.join(KEEP, d, 'meta.json');
    if (!fs.existsSync(f)) continue;
    const m = JSON.parse(fs.readFileSync(f, 'utf8'));
    console.log(`${d.padEnd(28)} ${m.from} +${m.days} days  ${m.res}p @${m.fps} fps  ${m.saved.slice(0, 16)}  ${m.film || ''}`);
  }
} else {
  console.log('usage: node keep-render.js save|check|restore <name> [--res 480]   |   node keep-render.js list');
}
