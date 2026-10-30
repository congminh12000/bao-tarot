// Isolated, immutable sales workspaces. Data review never builds renderable partial data.
const fs = require('fs'), path = require('path');
const C = require('./core'), IO = require('./io');
function songAdapter(source) {
  const replacements = [
    ["const LINE = sc.LINE || null;", "const LINE = sc.LINE || null;\nconst SALES = sc.SALES || null;"],
    ["for (const h of hits) {\n  if (LINE)", "for (const h of hits) {\n  if (SALES) { require('./sales-sfx').add({ h, fx: hFx, drums: hDrums, instruments: I }); continue; }\n  if (LINE)"],
    ["if (!SHORT && !LINE) {", "if (!SHORT && !LINE && !SALES) {"],
    ["if (!LINE && !sc.TRADING) for", "if (!LINE && !SALES && !sc.TRADING) for"]
  ];
  for (const [from, to] of replacements) {
    if (source.split(from).length !== 2) throw new Error('Shared song contract changed: review sales adapter before building');
    source = source.replace(from, to);
  }
  return source;
}
function build(input = IO.load(), options = {}) {
  const manifest = C.manifest(input.config, input.rows, input.sources, input.observations, options);
  let approval;
  if (options.previewWindow) {
    const auth = JSON.parse(fs.readFileSync(path.join(input.dir, 'preview-authorization.json')));
    if (auth.authorized !== true || auth.contentHash !== input.contentHash || !auth.evidence) throw new Error('Explicit current-hash preview authorization missing');
    if (!Array.isArray(auth.window) || auth.window.length !== 2 || auth.window.some((t,i) => t !== options.previewWindow[i])) throw new Error('Preview range differs from the recorded authorization');
    approval = { approved:true, contentHash:input.contentHash, evidence:auth.evidence,
      previewOnly:true, renderWindow:options.previewWindow, authority:'User delegated verification and explicitly requested preview; NOT full-dataset approval' };
  } else {
    approval = JSON.parse(fs.readFileSync(path.join(input.dir, 'approval.json'), 'utf8'));
    IO.approved(input, approval);
  }
  const assets = IO.assetPaths(input);
  const codeFiles = ['core.js', 'film.js', 'score.js', 'sfx.js', 'index.html', 'io.js', 'build.js'];
  const codeHash = IO.digest(JSON.stringify(codeFiles.map(f => [f, fs.readFileSync(path.join(__dirname, f), 'utf8')])) +
    fs.readFileSync(path.join(input.root, 'song.js'), 'utf8') + fs.readFileSync(path.join(input.root, 'data/music.js'), 'utf8'));
  const base = path.join(input.root, 'out', 'tesla-sales'); fs.mkdirSync(base, { recursive: true });
  const dir = fs.mkdtempSync(path.join(base, input.contentHash.slice(0, 12) + '-' + codeHash.slice(0, 8) + '-'));
  fs.mkdirSync(path.join(dir, 'assets')); fs.mkdirSync(path.join(dir, 'data')); fs.mkdirSync(path.join(dir, 'out'));
  fs.cpSync(path.join(input.root, 'engine'), path.join(dir, 'engine'), { recursive: true });
  fs.copyFileSync(path.join(input.root, 'data/music.js'), path.join(dir, 'data/music.js'));
  // Preserve the shared song's native cue arrangements and tempo. Only opt-in sales SFX/gates differ.
  fs.writeFileSync(path.join(dir, 'song.js'), songAdapter(fs.readFileSync(path.join(input.root, 'song.js'), 'utf8')));
  for (const file of ['core.js', 'film.js', 'score.js', 'index.html']) fs.copyFileSync(path.join(__dirname, file), path.join(dir, file));
  fs.copyFileSync(path.join(__dirname, 'sfx.js'), path.join(dir, 'sales-sfx.js'));
  fs.cpSync(input.dir, path.join(dir, 'review-input'), { recursive: true });
  const assetMap = {};
  for (const [id, src] of Object.entries(assets)) {
    assetMap[id] = 'assets/' + id + path.extname(src); fs.copyFileSync(src, path.join(dir, assetMap[id]));
  }
  Object.assign(manifest, { style: 'sales', contentHash: input.contentHash, codeHash,
    storyboard: input.storyboard, assets: assetMap, harmony: require('../score').CH });
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'manifest.js'), 'globalThis.SALES = ' + JSON.stringify(manifest) + ';\n');
  fs.writeFileSync(path.join(dir, 'render-approval.json'), JSON.stringify(approval, null, 2) + '\n');
  // Preserve a fingerprint for all code, reports, photos and review inputs. Engine reads this on every invocation.
  const files = [];
  function walk(folder) { for (const name of fs.readdirSync(folder)) { const f = path.join(folder, name); if (fs.statSync(f).isDirectory()) walk(f); else files.push(path.relative(dir, f)); } }
  for (const f of ['engine', 'data', 'assets', 'review-input']) walk(path.join(dir, f));
  files.push('manifest.json', 'manifest.js', 'render-approval.json', 'core.js', 'film.js', 'score.js', 'song.js', 'sales-sfx.js', 'index.html');
  fs.writeFileSync(path.join(dir, 'fingerprint.json'), JSON.stringify(Object.fromEntries(files.map(f => [f, IO.digest(fs.readFileSync(path.join(dir, f)))])), null, 2));
  return { dir, manifest };
}
if (require.main === module) {
  try { console.log(build().dir); }
  catch (e) { console.error(e.message); process.exitCode = 1; }
}
module.exports = { build, songAdapter };
