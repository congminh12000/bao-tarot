const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..');
const digest = data => crypto.createHash('sha256').update(data).digest('hex');
function csv(text) {
  const records = []; let row = [], value = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') { if (quoted && text[i+1] === '"') { value += '"'; i++; } else quoted = !quoted; }
    else if (ch === ',' && !quoted) { row.push(value); value = ''; }
    else if (ch === '\n' && !quoted) { row.push(value.replace(/\r$/, '')); if (row.some(Boolean)) records.push(row); row = []; value = ''; }
    else value += ch;
  }
  if (quoted) throw new Error('Unclosed CSV quote');
  if (value || row.length) { row.push(value); records.push(row); }
  const header = records.shift();
  return records.map((values, i) => { if (values.length !== header.length) throw new Error('CSV column count at row ' + (i + 2)); return Object.fromEntries(header.map((k, j) => [k, values[j]])); });
}
const INPUTS = ['config.json', 'deliveries.csv', 'sources.json', 'observations.json', 'assets.json', 'storyboard.json', 'source-discovery.md'];
function load(root = ROOT, coin = process.env.COIN || 'TSLA') {
  if (coin !== 'TSLA') throw new Error('Sales pilot currently supports COIN=TSLA only');
  const dir = path.join(root, 'coins', coin, 'sales'), bytes = {};
  for (const name of INPUTS) bytes[name] = fs.readFileSync(path.join(dir, name), 'utf8');
  const data = Object.fromEntries(INPUTS.filter(n => n.endsWith('.json')).map(n => [n.replace('.json', ''), JSON.parse(bytes[n])]));
  const rows = csv(bytes['deliveries.csv']).map(r => ({ ...r, units: r.units === '' ? null : Number(r.units) }));
  return { root, dir, ...data, rows, contentHash: digest(JSON.stringify(bytes)) };
}
function approved(input, approval) {
  if (!approval || approval.approved !== true || approval.contentHash !== input.contentHash || !approval.evidence?.trim())
    throw new Error('Concrete data/storyboard approval required before any sales still/video render; plan approval is not data approval (PROJECT.md §19).');
}
function assetPaths(input) {
  const paths = {};
  for (const id of ['logo', ...input.config.models.map(m => m.id)]) {
    const a = input.assets[id];
    if (!a?.file || !a.sha256 || !a.sourceUrl?.startsWith('https://')) throw new Error('Missing verified official asset: ' + id);
    const abs = path.resolve(input.root, a.file);
    if (!abs.startsWith(input.root + path.sep)) throw new Error('Asset outside project');
    if (!fs.existsSync(abs) || digest(fs.readFileSync(abs)) !== a.sha256) throw new Error('Asset missing/changed: ' + id);
    paths[id] = abs;
  }
  return paths;
}
module.exports = { ROOT, digest, csv, load, approved, assetPaths };
